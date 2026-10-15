/**
 * GEZA SERVICE — сервер сайта и Telegram-бот управления (Cloudflare Worker)
 *
 * Что делает:
 *  • хранит занятое время, чтобы двое клиентов не записались на одно время;
 *  • принимает записи с сайта и присылает их в Telegram;
 *  • через бота можно: закрыть/открыть запись, поменять цены, убрать время, смотреть и отменять записи.
 *
 * Настройки (Settings → Variables and Secrets):
 *   BOT_TOKEN — токен бота от @BotFather (Secret)
 *   PASSWORD  — слово для подключения владельца, латиница/цифры/_ (Secret)
 *   OWNER_ID  — (необязательно) Telegram ID, который сразу получает доступ
 * Привязка KV (Settings → Bindings → KV namespace): имя переменной DB
 */

const SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
const DAYS_AHEAD = 30;
const DEFAULT_CLOSED = 'Запись временно закрыта. Позвоните нам — подскажем, когда сможем принять технику.';
const CATALOG = {"phone": {"name": "Телефоны", "cats": ["Экран", "Аккумулятор", "Корпус и стекло", "Камера", "Разъём и звук", "Плата и вода"], "items": [["Замена дисплея", 8900, "Экран"], ["Замена защитного стекла", 4900, "Экран"], ["Ремонт сенсора", 3900, "Экран"], ["Восстановление подсветки", 3500, "Экран"], ["Замена аккумулятора", 3900, "Аккумулятор"], ["Замена контроллера питания", 4500, "Аккумулятор"], ["Ремонт быстрой зарядки", 2900, "Аккумулятор"], ["Беспроводная зарядка", 3200, "Аккумулятор"], ["Замена заднего стекла", 3900, "Корпус и стекло"], ["Замена корпуса", 7900, "Корпус и стекло"], ["Ремонт кнопок", 1900, "Корпус и стекло"], ["Выпрямление корпуса", 2500, "Корпус и стекло"], ["Замена основной камеры", 5900, "Камера"], ["Замена фронтальной камеры", 3900, "Камера"], ["Замена стекла камеры", 1900, "Камера"], ["Ремонт вспышки", 1500, "Камера"], ["Замена разъёма зарядки", 2900, "Разъём и звук"], ["Замена динамика", 2400, "Разъём и звук"], ["Замена микрофона", 2400, "Разъём и звук"], ["Чистка сеток и разъёмов", 900, "Разъём и звук"], ["Чистка после воды", 2900, "Плата и вода"], ["Ремонт материнской платы", 6900, "Плата и вода"], ["Восстановление данных", 4900, "Плата и вода"], ["Бесплатная диагностика", 0, "Плата и вода"]]}, "laptop": {"name": "Ноутбуки", "cats": ["Экран и корпус", "Питание", "Система и чистка"], "items": [["Замена матрицы", 12900, "Экран и корпус"], ["Замена шлейфа матрицы", 3900, "Экран и корпус"], ["Ремонт петель", 4500, "Экран и корпус"], ["Замена клавиатуры", 5900, "Экран и корпус"], ["Замена аккумулятора", 6900, "Питание"], ["Ремонт разъёма питания", 3500, "Питание"], ["Замена порта USB-C", 3900, "Питание"], ["Ремонт цепи питания", 7900, "Питание"], ["Чистка и замена термопасты", 3500, "Система и чистка"], ["Замена SSD с переносом данных", 2900, "Система и чистка"], ["Установка системы", 2500, "Система и чистка"], ["Ремонт после залития", 7900, "Система и чистка"]]}, "tablet": {"name": "Планшеты", "cats": ["Экран", "Питание", "Корпус и камера"], "items": [["Замена дисплея", 9900, "Экран"], ["Замена сенсорного стекла", 5900, "Экран"], ["Ремонт подсветки", 4500, "Экран"], ["Защитное стекло", 1200, "Экран"], ["Замена аккумулятора", 5900, "Питание"], ["Замена разъёма зарядки", 3500, "Питание"], ["Ремонт контроллера питания", 4900, "Питание"], ["Ремонт кнопки питания", 2500, "Питание"], ["Замена корпуса", 6900, "Корпус и камера"], ["Ремонт камеры", 4900, "Корпус и камера"], ["Замена динамика", 2900, "Корпус и камера"], ["Ремонт после воды", 4900, "Корпус и камера"]]}, "console": {"name": "Консоли", "cats": ["Геймпады", "Приставка", "Портативные"], "items": [["Ремонт стиков", 2500, "Геймпады"], ["Замена аккумулятора геймпада", 2200, "Геймпады"], ["Ремонт кнопок и курков", 1900, "Геймпады"], ["Замена разъёма геймпада", 1900, "Геймпады"], ["Чистка и замена термопасты", 3500, "Приставка"], ["Замена HDMI-порта", 4900, "Приставка"], ["Ремонт дисковода", 5500, "Приставка"], ["Ремонт блока питания", 5900, "Приставка"], ["Замена экрана", 7900, "Портативные"], ["Замена джойстиков", 2500, "Портативные"], ["Замена аккумулятора", 4900, "Портативные"], ["Замена вентилятора", 3500, "Портативные"]]}};

/* ---------- утилиты ---------- */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const esc = t => String(t ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const rub = n => Number(n || 0).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';
const num = n => Number(n || 0).toLocaleString('ru-RU').replace(/ /g, ' ');

function msk(d = new Date()) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d);
  const g = t => f.find(x => x.type === t).value;
  return { date: `${g('year')}-${g('month')}-${g('day')}`, h: +g('hour'), m: +g('minute') };
}
function addDays(iso, n) { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function ruDay(iso, long = false) {
  const d = new Date(iso + 'T12:00:00Z');
  const s = d.toLocaleDateString('ru-RU', { weekday: long ? 'long' : 'short', day: 'numeric', month: 'long', timeZone: 'UTC' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function dayName(iso) {
  const t = msk().date;
  if (iso === t) return 'Сегодня, ' + ruDay(iso).split(', ')[1];
  if (iso === addDays(t, 1)) return 'Завтра, ' + ruDay(iso).split(', ')[1];
  return ruDay(iso);
}
function inRange(iso) { const t = msk().date; return /^\d{4}-\d{2}-\d{2}$/.test(iso) && iso >= t && iso <= addDays(t, DAYS_AHEAD); }
function isPast(iso, time) { const n = msk(); return iso < n.date || (iso === n.date && parseInt(time) <= n.h); }

/* ---------- хранилище ---------- */
/* Хранилище: база D1 (привязка SQL) — изменения видны сразу везде.
   Если D1 не подключена — используется KV (привязка DB), но там изменения расходятся до минуты. */
let sqlReady = false;
async function sqlInit(env) {
  if (sqlReady) return;
  await env.SQL.prepare('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT, exp INTEGER)').run();
  sqlReady = true;
}
const store = env => env.SQL ? {
  async get(k) {
    await sqlInit(env);
    const r = await env.SQL.prepare('SELECT v, exp FROM kv WHERE k = ?').bind(k).first();
    if (r) return r.exp && r.exp < Date.now() ? null : r.v;
    if (env.DB && !k.startsWith('pend:') && !k.startsWith('seen:')) { // перенос старых данных из KV
      const old = await env.DB.get(k).catch(() => null);
      if (old != null) { await this.put(k, old); return old; }
    }
    return null;
  },
  async put(k, v, opt) {
    await sqlInit(env);
    const exp = opt && opt.expirationTtl ? Date.now() + opt.expirationTtl * 1000 : null;
    await env.SQL.prepare('INSERT INTO kv (k, v, exp) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v, exp = excluded.exp').bind(k, v, exp).run();
  },
  async delete(k) { await sqlInit(env); await env.SQL.prepare('DELETE FROM kv WHERE k = ?').bind(k).run(); },
} : env.DB;
async function getJ(env, k, def) { try { const v = await store(env).get(k); return v ? JSON.parse(v) : def; } catch { return def; } }
const putJ = (env, k, v, opt) => store(env).put(k, JSON.stringify(v), opt);
async function getCfg(env) { const c = await getJ(env, 'cfg', {}); return { closed: !!c.closed, closedMsg: c.closedMsg || '', prices: c.prices || {}, blocked: c.blocked || {}, removed: c.removed || {}, added: c.added || {}, imgs: c.imgs || {} }; }
/* все услуги раздела: исходные + добавленные через бота */
function allItems(cfg, type) {
  const T = CATALOG[type]; const ov = cfg.prices[type] || {}; const rm = cfg.removed[type] || []; const ad = cfg.added[type] || [];
  return [
    ...T.items.map(([n, p, c]) => ({ n, base: p, p: ov[n] ?? p, c, added: false, hidden: rm.includes(n), changed: ov[n] != null })),
    ...ad.map(a => ({ n: a.n, base: a.p, p: a.p, c: a.c, added: true, hidden: false, changed: false })),
  ];
}
function imgKey(type, name) { let h = 2166136261; for (const ch of type + '|' + name) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return type + '-' + h.toString(16); }
async function getBookings(env) {
  const b = await getJ(env, 'bookings', {}); const t = msk().date; let pruned = false;
  for (const d of Object.keys(b)) if (d < addDays(t, -2)) { delete b[d]; pruned = true; }
  return { b, pruned };
}
async function getOrders(env) {
  const o = await getJ(env, 'orders', {}); const lim = addDays(msk().date, -90);
  for (const k of Object.keys(o)) if ((o[k].date || '') < lim) delete o[k];
  return o;
}
function started(date, time) { const n = msk(); const [h, m] = String(time).split(':').map(Number); return date < n.date || (date === n.date && n.h * 60 + n.m >= h * 60 + (m || 0)); }
const FINAL = ['cancelled', 'done', 'issued'];
function statusOf(o) { if (!o) return null; if (FINAL.includes(o.status)) return o.status; return started(o.date, o.time) ? 'repair' : 'new'; }
const ST_LABEL = { new: '🕓 Принят', repair: '🔧 В ремонте', done: '✅ Готов к выдаче', issued: '📦 Выдан', cancelled: '❌ Отменён' };
const ST_LINE = { done: '✅ <b>Готов к выдаче</b>', issued: '📦 <b>Выдан</b> — заказ закрыт', cancelled: '❌ <b>Отменена</b> — время снова свободно' };
function stLine(o, st) { return st === 'cancelled' && o && o.byClient ? '❌ <b>Клиент сам отменил запись</b> — время снова свободно' : (ST_LINE[st] || ''); }
function orderKb(num, st) {
  if (st === 'done') return [[{ text: '📦 Выдан', callback_data: 'g:' + num }], [{ text: '↩️ Отменить действие', callback_data: 'u:' + num }]];
  if (st === 'issued' || st === 'cancelled') return [[{ text: '↩️ Отменить действие', callback_data: 'u:' + num }]];
  return [[{ text: '✅ Готов к выдаче', callback_data: 'd:' + num }], [{ text: '❌ Отменить запись', callback_data: 'x:' + num }]];
}

async function admins(env) {
  const a = await getJ(env, 'admins', []);
  if (env.OWNER_ID) String(env.OWNER_ID).split(',').map(x => x.trim()).filter(Boolean).forEach(x => { if (!a.includes(x)) a.push(x); });
  return a;
}

/* ---------- Telegram ---------- */
function tg(env, method, body) {
  return fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }).then(r => r.json()).catch(e => ({ ok: false, description: String(e) }));
}
const MENU_BTN = '📋 Меню';
const replyKb = { keyboard: [[{ text: MENU_BTN }]], resize_keyboard: true, is_persistent: true };
const sendKb = (env, chat, text) => tg(env, 'sendMessage', { chat_id: chat, text, parse_mode: 'HTML', reply_markup: replyKb });
const send = (env, chat, text, kb) => tg(env, 'sendMessage', { chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true, ...(kb ? { reply_markup: { inline_keyboard: kb } } : {}) });
const edit = (env, chat, mid, text, kb) => tg(env, 'editMessageText', { chat_id: chat, message_id: mid, text, parse_mode: 'HTML', disable_web_page_preview: true, ...(kb ? { reply_markup: { inline_keyboard: kb } } : {}) });
async function secret(env) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('geza:' + env.BOT_TOKEN));
  return [...new Uint8Array(b)].slice(0, 16).map(x => x.toString(16).padStart(2, '0')).join('');
}

function fmtPhone(p) {
  const d = String(p || '').replace(/\D/g, ''); const t = d.length === 10 ? '7' + d : d.replace(/^8/, '7');
  return t.length === 11 ? `+${t[0]} ${t.slice(1, 4)} ${t.slice(4, 7)}-${t.slice(7, 9)}-${t.slice(9)}` : esc(p);
}
/* ---------- текст записи ---------- */
function orderText(o, status) {
  const svc = Array.isArray(o.services) ? o.services.slice(0, 30) : [];
  const tot = svc.reduce((a, x) => ({ lo: a.lo + (+x.lo || 0), hi: a.hi + (+x.hi || 0) }), { lo: 0, hi: 0 });
  const rr = (lo, hi) => lo === hi ? rub(lo) : `${num(lo)}–${rub(hi)}`;
  const block = (title, rows) => `<blockquote><b>${title}</b>\n${rows.filter(Boolean).join('\n')}</blockquote>`;
  const parts = [
    `🧾 <b>Новая запись ${esc(o.num)}</b>`,
    block('📅 Когда', [`${esc(ruDay(o.date))} · <b>${esc(o.time)}</b>`]),
    block('👤 Клиент', [
      esc(o.name),
      `📞 ${fmtPhone(o.phone)}`,
      o.contact === 'tg' ? `✈️ Написать в Telegram: ${esc(o.tg || '—')}` : '☎️ Перезвонить по телефону',
    ]),
    ...(Array.isArray(o.devices) && o.devices.length > 1 ? [
      block(`📱 Устройства · ${o.devices.length}`, o.devices.map((d, i) => `<b>${i + 1}. ${esc(d.device)}</b>${d.problem ? `\nПроблема: ${esc(d.problem)}` : ''}`)),
      block('🔧 Работы', [
        ...o.devices.map((d, i) => `<b>${i + 1}.</b> ` + (d.services && d.services.length ? d.services.map(x => `${esc(x.name)} — ${rr(+x.lo || 0, +x.hi || 0)}`).join('\n     ') : 'Бесплатная диагностика')),
        svc.length ? `\n💰 <b>Итого: ${rr(tot.lo, tot.hi)}</b>` : '',
      ]),
    ] : [
      block('📱 Устройство', [
        esc(o.device),
        o.problem ? `Проблема: ${esc(o.problem)}` : '',
      ]),
      block('🔧 Работы', [
        ...(svc.length ? svc.map(x => `• ${esc(x.name)} — ${rr(+x.lo || 0, +x.hi || 0)}`) : ['• Бесплатная диагностика']),
        svc.length ? `\n💰 <b>Итого: ${rr(tot.lo, tot.hi)}</b>` : '',
      ]),
    ]),
  ];
  if (status) parts.push(status);
  return parts.join('\n');
}

/* ---------- меню бота ---------- */
async function menu(env) {
  const cfg = await getCfg(env); const t = msk().date;
  const act = await activeOrders(env);
  const cnt = d => act.filter(o => o.date === d).length;
  const text = [
    '<b>GEZA SERVICE · управление сайтом</b>', '',
    cfg.closed ? `🔴 Запись <b>закрыта</b>${cfg.closedMsg ? `\n<i>${esc(cfg.closedMsg)}</i>` : ''}` : '🟢 Запись <b>открыта</b>',
    `📋 Активных записей: сегодня <b>${cnt(t)}</b>, завтра <b>${cnt(addDays(t, 1))}</b>, всего <b>${act.length}</b>`,
  ].join('\n');
  const kb = [
    [cfg.closed ? { text: '🟢 Открыть запись', callback_data: 'open' } : { text: '🔴 Закрыть запись', callback_data: 'close' }],
    [{ text: '📋 Записи сегодня', callback_data: 'ls:' + t }, { text: '📋 Завтра', callback_data: 'ls:' + addDays(t, 1) }],
    [{ text: `📦 Все заказы (${act.length})`, callback_data: 'la' }],
    [{ text: '⛔ Убрать / вернуть время', callback_data: 'bd' }],
    [{ text: '🛠 Услуги, цены и фото', callback_data: 'pt' }],
  ];
  return { text, kb };
}

function daysKb(prefix, n = 8) {
  const t = msk().date; const rows = []; let row = [];
  for (let i = 0; i < n; i++) {
    const d = addDays(t, i);
    row.push({ text: i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : ruDay(d).replace(/ [а-я]+$/, m => m.slice(0, 4)), callback_data: prefix + d });
    if (row.length === 2) { rows.push(row); row = []; }
  }
  if (row.length) rows.push(row);
  rows.push([{ text: '‹ Меню', callback_data: 'menu' }]);
  return rows;
}

async function slotsView(env, date) {
  const cfg = await getCfg(env); const { b } = await getBookings(env);
  const bl = cfg.blocked[date]; const day = b[date] || {};
  const rows = []; let row = [];
  for (const s of SLOTS) {
    const past = isPast(date, s);
    const mark = day[s] ? '👤' : past ? '·' : (bl === 'all' || (Array.isArray(bl) && bl.includes(s))) ? '⛔' : '✅';
    row.push({ text: `${s} ${mark}`, callback_data: day[s] ? `bk:${date}:${s}` : past ? 'noop' : `bt:${date}:${s}` });
    if (row.length === 3) { rows.push(row); row = []; }
  }
  if (row.length) rows.push(row);
  rows.push([{ text: '⛔ Закрыть весь день', callback_data: 'ba:' + date }, { text: '✅ Открыть весь день', callback_data: 'bo:' + date }]);
  rows.push([{ text: '‹ Дни', callback_data: 'bd' }, { text: '‹ Меню', callback_data: 'menu' }]);
  const text = `<b>${esc(dayName(date))}</b>\n\nНажмите на время, чтобы убрать или вернуть его.\n✅ свободно · ⛔ убрано · 👤 есть запись`;
  return { text, kb: rows };
}

/* активные заказы (не отменённые, не выданные, не скрытые) */
async function activeOrders(env) {
  const { b } = await getBookings(env); const ords = await getOrders(env); const out = {}; const lim = addDays(msk().date, -60);
  for (const [n, o] of Object.entries(ords)) if (o.full && !o.hidden && o.date >= lim) out[n] = { ...o.full, st: statusOf(o) };
  for (const [d, day] of Object.entries(b)) for (const [t, o] of Object.entries(day)) if (!out[o.num] && !ords[o.num]?.hidden) out[o.num] = { ...o, st: statusOf(ords[o.num] || { date: d, time: t }) };
  return Object.values(out).filter(o => !['cancelled', 'issued'].includes(o.st)).sort((a, b2) => (a.date + a.time).localeCompare(b2.date + b2.time));
}
const ordLine = o => `<b>${o.time}</b> · ${ST_LABEL[o.st]} · ${esc(o.num)}\n${esc(o.name)} · ${fmtPhone(o.phone)}\n${esc(o.device)}${o.services?.length ? ' — ' + esc(o.services.map(x => x.name).join(', ')) : ''}${o.contact === 'tg' ? `\n✈️ ${esc(o.tg || '')}` : ''}`;
function ordButtons(o, sfx) {
  const n = o.num, t = o.time;
  if (o.st === 'done') return [{ text: `📦 Выдан ${t}`, callback_data: `g:${n}:${sfx}` }, { text: `↩️ ${t}`, callback_data: `u:${n}:${sfx}` }];
  if (o.st === 'issued' || o.st === 'cancelled') return [{ text: `↩️ Отменить действие ${t}`, callback_data: `u:${n}:${sfx}` }];
  return [{ text: `✅ Готов ${t}`, callback_data: `d:${n}:${sfx}` }, { text: `❌ Отменить ${t}`, callback_data: `x:${n}:${sfx}` }];
}
async function allView(env, extra = []) {
  const act = await activeOrders(env); const ords = await getOrders(env);
  const keep = extra.filter(n => ords[n] && !act.some(o => o.num === n)).map(n => ({ ...ords[n].full, st: statusOf(ords[n]) }));
  const list = [...act, ...keep].sort((a, b2) => (a.date + a.time).localeCompare(b2.date + b2.time)).slice(0, 25);
  let text = `<b>📦 Все активные заказы · ${act.length}</b>`; let day = '';
  if (!list.length) text += '\n\nАктивных заказов нет.';
  for (const o of list) { if (o.date !== day) { day = o.date; text += `\n\n<b>— ${esc(dayName(o.date))} —</b>`; } text += '\n' + ordLine(o) + '\n'; }
  if (act.length > 25) text += `\n…и ещё ${act.length - 25}. Смотрите по дням.`;
  const kb = list.map(o => ordButtons(o, 'a'));
  kb.push([{ text: '‹ Меню', callback_data: 'menu' }]);
  return { text: text.slice(0, 4000), kb, finished: keep.map(o => o.num) };
}

async function listView(env, date) {
  const { b } = await getBookings(env); const day = b[date] || {}; const ords = await getOrders(env);
  const items = {};
  for (const [n, o] of Object.entries(ords)) if (o.date === date && o.full && !o.hidden) items[n] = { ...o.full, st: statusOf(o) };
  for (const [t, o] of Object.entries(day)) if (!items[o.num] && !ords[o.num]?.hidden) items[o.num] = { ...o, st: statusOf(ords[o.num] || { date, time: t }) };
  const list = Object.values(items).sort((a, b2) => a.time.localeCompare(b2.time));
  const finished = list.filter(o => o.st === 'issued' || o.st === 'cancelled').map(o => o.num);
  const text = list.length
    ? `<b>Записи · ${esc(dayName(date))}</b>\n\n` + list.map(o =>
        `<b>${o.time}</b> · ${ST_LABEL[o.st]} · ${esc(o.num)}\n${esc(o.name)} · ${fmtPhone(o.phone)}\n${esc(o.device)}${o.services?.length ? ' — ' + esc(o.services.map(x => x.name).join(', ')) : ''}${o.contact === 'tg' ? `\n✈️ ${esc(o.tg || '')}` : ''}`).join('\n\n')
    : `<b>${esc(dayName(date))}</b>\n\nЗаписей нет.`;
  const kb = list.map(o => {
    const n = o.num, t = o.time;
    if (o.st === 'done') return [{ text: `📦 Выдан ${t}`, callback_data: `g:${n}:l` }, { text: `↩️ ${t}`, callback_data: `u:${n}:l` }];
    if (o.st === 'issued' || o.st === 'cancelled') return [{ text: `↩️ Отменить действие ${t}`, callback_data: `u:${n}:l` }];
    return [{ text: `✅ Готов ${t}`, callback_data: `d:${n}:l` }, { text: `❌ Отменить ${t}`, callback_data: `x:${n}:l` }];
  });
  const t0 = msk().date;
  kb.push([...(date > t0 ? [{ text: '‹ Пред. день', callback_data: 'ls:' + addDays(date, -1) }] : []), { text: 'След. день ›', callback_data: 'ls:' + addDays(date, 1) }]);
  kb.push([{ text: '‹ Меню', callback_data: 'menu' }]);
  return { text, kb, finished };
}

/* закрытые (выданные/отменённые) заказы исчезают из списка, когда из него уходят */
async function hideFinished(env, chat) {
  const nums = await getJ(env, 'seen:' + chat, []); if (!nums.length) return;
  const ords = await getOrders(env); let ch = false;
  for (const n of nums) if (ords[n] && ['issued', 'cancelled'].includes(statusOf(ords[n]))) { ords[n].hidden = true; ch = true; }
  if (ch) await putJ(env, 'orders', ords);
  await store(env).delete('seen:' + chat);
}

/* действия с заказом: d — готов, g — выдан, x — отменить запись, u — отменить действие */
async function orderAction(env, act, ref) {
  const ords = await getOrders(env); let num = ref;
  if (/^\d{4}-\d{2}-\d{2}$/.test(ref.split(':')[0])) { const [d, h, m] = ref.split(':'); const { b } = await getBookings(env); num = b[d]?.[`${h}:${m}`]?.num || ''; }
  const o = ords[num]; if (!o) return { toast: 'Заказ не найден' };
  if (o.hidden) return { toast: 'Заказ закрыт окончательно', o, num, gone: true };
  const cur = statusOf(o); o.hist = o.hist || [];
  const { b } = await getBookings(env);
  const free = () => { if (b[o.date]?.[o.time]?.num === num) { delete b[o.date][o.time]; if (!Object.keys(b[o.date]).length) delete b[o.date]; } };
  let toast = '';
  if (act === 'd') { if (FINAL.includes(cur)) return { toast: 'Статус уже изменён', o, num }; o.hist.push(o.status); o.status = 'done'; toast = `${num}: готов к выдаче`; }
  else if (act === 'g') { if (cur !== 'done') return { toast: 'Сначала отметьте «Готов к выдаче»', o, num }; o.hist.push(o.status); o.status = 'issued'; toast = `${num}: выдан, заказ закрыт`; }
  else if (act === 'x') { if (cur === 'cancelled' || cur === 'issued') return { toast: 'Нельзя отменить', o, num }; o.hist.push(o.status); o.status = 'cancelled'; free(); toast = `${num} отменён, время ${o.time} снова свободно`; }
  else if (act === 'u') {
    if (!o.hist.length) return { toast: 'Нечего отменять', o, num };
    if (o.status === 'cancelled' && o.full) {
      const busy = b[o.date]?.[o.time]; const cfg = await getCfg(env); const bl = cfg.blocked[o.date];
      if ((busy && busy.num !== num) || bl === 'all' || (Array.isArray(bl) && bl.includes(o.time))) return { toast: `Время ${o.time} уже занято — восстановить запись нельзя`, o, num };
      b[o.date] = b[o.date] || {}; b[o.date][o.time] = o.full;
    }
    o.status = o.hist.pop(); o.byClient = false; toast = `${num}: действие отменено`;
  }
  ords[num] = o; await putJ(env, 'orders', ords); await putJ(env, 'bookings', b);
  return { toast, o, num, changed: true };
}

function typesView() {
  return {
    text: '<b>🛠 Услуги, цены и фото</b>\n\nВыберите раздел.',
    kb: [...Object.entries(CATALOG).map(([k, v]) => [{ text: v.name, callback_data: 'pt:' + k }]), [{ text: '‹ Меню', callback_data: 'menu' }]],
  };
}
async function servicesView(env, type) {
  const cfg = await getCfg(env); const T = CATALOG[type]; const items = allItems(cfg, type); const im = cfg.imgs[type] || {};
  const kb = items.map((x, i) => [{ text: `${x.hidden ? '🙈 ' : ''}${x.added ? '➕ ' : ''}${x.changed ? '✏️ ' : ''}${im[x.n] ? '🖼 ' : ''}${x.n} · ${x.p ? num(x.p) + ' ₽' : 'бесплатно'}`.slice(0, 60), callback_data: `sv:${type}:${i}` }]);
  kb.push([{ text: '➕ Добавить услугу', callback_data: 'ad:' + type }]);
  kb.push([{ text: '‹ Разделы', callback_data: 'pt' }, { text: '‹ Меню', callback_data: 'menu' }]);
  return { text: `<b>${esc(T.name)}</b>\n\nНажмите на услугу, чтобы изменить цену, фото или скрыть её.\n🙈 скрыта · ➕ добавлена · ✏️ цена изменена · 🖼 своё фото`, kb };
}
async function serviceCard(env, type, i) {
  const cfg = await getCfg(env); const x = allItems(cfg, type)[i]; if (!x) return servicesView(env, type);
  const hasImg = !!(cfg.imgs[type] || {})[x.n];
  const text = [`<b>${esc(x.n)}</b>`, `${esc(CATALOG[type].name)} · ${esc(x.c)}`, '',
    `💰 Цена: от <b>${x.p ? rub(x.p) : 'бесплатно'}</b>${x.changed ? ` (исходная ${rub(x.base)})` : ''}`,
    `🖼 Фото: ${hasImg ? 'своё' : x.added ? 'нет' : 'исходное'}`,
    `👁 На сайте: ${x.hidden ? '<b>скрыта</b>' : 'показывается'}`].join('\n');
  const kb = [[{ text: '💰 Изменить цену', callback_data: `ps:${type}:${i}` }, { text: '🖼 Загрузить фото', callback_data: `ph:${type}:${i}` }]];
  const row = [];
  if (x.changed) row.push({ text: '↩️ Исходная цена', callback_data: `pr:${type}:${i}` });
  if (hasImg) row.push({ text: '↩️ Убрать своё фото', callback_data: `pz:${type}:${i}` });
  if (row.length) kb.push(row);
  kb.push([x.added ? { text: '🗑 Удалить услугу', callback_data: `rm:${type}:${i}` } : { text: x.hidden ? '👁 Показать на сайте' : '🙈 Скрыть с сайта', callback_data: `hd:${type}:${i}` }]);
  kb.push([{ text: '‹ К списку', callback_data: 'pt:' + type }, { text: '‹ Меню', callback_data: 'menu' }]);
  return { text, kb };
}

/* фото услуг храним в двоичном виде: в KV (до 25 МБ) или, если KV не подключено, в D1 частями */
async function imgPut(env, key, bytes, type) {
  if (env.DB) { await env.DB.put('img:' + key, bytes, { metadata: { t: type } }); return; }
  await sqlInit(env);
  await env.SQL.prepare('CREATE TABLE IF NOT EXISTS imgs (k TEXT, i INTEGER, t TEXT, v BLOB, PRIMARY KEY (k, i))').run();
  await env.SQL.prepare('DELETE FROM imgs WHERE k = ?').bind(key).run();
  const CH = 1800000;
  for (let i = 0, n = 0; i < bytes.length; i += CH, n++) await env.SQL.prepare('INSERT INTO imgs (k, i, t, v) VALUES (?, ?, ?, ?)').bind(key, n, type, bytes.slice(i, i + CH)).run();
}
async function imgGet(env, key) {
  if (env.DB) {
    const r = await env.DB.getWithMetadata('img:' + key, { type: 'arrayBuffer' }).catch(() => null);
    if (r && r.value && r.metadata && r.metadata.t) return { t: r.metadata.t, bytes: new Uint8Array(r.value) };
  }
  if (env.SQL) {
    try {
      await sqlInit(env);
      const rs = await env.SQL.prepare('SELECT t, v FROM imgs WHERE k = ? ORDER BY i').bind(key).all();
      if (rs.results && rs.results.length) {
        const parts = rs.results.map(x => x.v instanceof ArrayBuffer ? new Uint8Array(x.v) : x.v instanceof Uint8Array ? x.v : Uint8Array.from(x.v));
        const out = new Uint8Array(parts.reduce((a, p) => a + p.length, 0)); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; }
        return { t: rs.results[0].t, bytes: out };
      }
    } catch (e) {}
  }
  const raw = await store(env).get('img:' + key).catch(() => null); // старый формат (base64)
  if (raw) { try { const { t, d } = JSON.parse(raw); const bin = atob(d); const b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return { t, bytes: b }; } catch (e) {} }
  return null;
}
async function imgDel(env, key) {
  if (env.DB) await env.DB.delete('img:' + key).catch(() => {});
  if (env.SQL) { try { await sqlInit(env); await env.SQL.prepare('DELETE FROM imgs WHERE k = ?').bind(key).run(); } catch (e) {} }
  await store(env).delete('img:' + key).catch(() => {});
}

/* загрузка фото услуги из Telegram */
async function savePhoto(env, msg, pend) {
  let fileId = null;
  if (msg.photo && msg.photo.length) { const ps = [...msg.photo].sort((a, b) => a.width - b.width); fileId = ps[ps.length - 1].file_id; } // самое большое качество
  else if (msg.document && /^image\/(jpeg|png|webp)$/.test(msg.document.mime_type || '')) fileId = msg.document.file_id;
  if (!fileId) return 'Это не фото. Пришлите картинку (фото или файлом JPG/PNG/WEBP). /cancel — отмена.';
  const f = await tg(env, 'getFile', { file_id: fileId });
  if (!f.ok) return 'Telegram не отдаёт файлы больше 20 МБ. Пришлите фото поменьше.';
  if (f.result.file_size > 20000000) return 'Фото больше 20 МБ — Telegram не даёт ботам такие файлы. Пришлите поменьше.';
  const r = await fetch(`https://api.telegram.org/file/bot${env.BOT_TOKEN}/${f.result.file_path}`);
  if (!r.ok) return 'Не удалось скачать фото, попробуйте ещё раз.';
  const buf = new Uint8Array(await r.arrayBuffer());
  const type = /\.png$/i.test(f.result.file_path) ? 'image/png' : /\.webp$/i.test(f.result.file_path) ? 'image/webp' : 'image/jpeg';
  const cfg = await getCfg(env); const x = allItems(cfg, pend.type)[pend.i]; if (!x) return 'Услуга не найдена.';
  await imgPut(env, imgKey(pend.type, x.n), buf, type);
  cfg.imgs[pend.type] = cfg.imgs[pend.type] || {}; cfg.imgs[pend.type][x.n] = Date.now();
  await putJ(env, 'cfg', cfg);
  return null;
}

/* ---------- обработка бота ---------- */
async function onUpdate(env, u) {
  const adm = await admins(env);
  if (u.message && (u.message.text || u.message.photo || u.message.document)) {
    const m = u.message, chat = String(m.chat.id), text = (m.text || m.caption || '').trim();
    const isAdm = adm.includes(chat);
    if (text.startsWith('/start')) {
      const pass = text.split(/\s+/)[1] || '';
      if (!isAdm && pass) { // не больше 5 попыток пароля в час
        if (await counter(env, 'pw:' + chat + ':' + Math.floor(Date.now() / 3600000), 3700) > 5) return;
      }
      if (!isAdm && env.PASSWORD && pass === env.PASSWORD) {
        const a = await getJ(env, 'admins', []); if (!a.includes(chat)) a.push(chat); await putJ(env, 'admins', a);
        await sendKb(env, chat, '✅ Готово! Сюда будут приходить новые записи с сайта. Кнопка «📋 Меню» внизу — управление сайтом.');
        const v = await menu(env); return send(env, chat, v.text, v.kb);
      }
      if (!isAdm) { if (await counter(env, 'st:' + chat, 86400) > 1) return; return send(env, chat, 'Это служебный бот сервиса GEZA SERVICE.'); }
      await sendKb(env, chat, 'Кнопка «📋 Меню» внизу — управление сайтом.');
      const v0 = await menu(env); return send(env, chat, v0.text, v0.kb);
    }
    if (!isAdm) return;
    const pend = await getJ(env, 'pend:' + chat, null);
    if (text === '/cancel') { await store(env).delete('pend:' + chat); return send(env, chat, 'Отменено.'); }
    if (m.photo || m.document) {
      if (!pend || pend.k !== 'photo') return send(env, chat, 'Чтобы поменять фото услуги: 📋 Меню → 🛠 Услуги → выберите услугу → «🖼 Загрузить фото».');
      const err = await savePhoto(env, m, pend); if (err) return send(env, chat, err);
      await store(env).delete('pend:' + chat);
      await send(env, chat, '✅ Фото сохранено. На сайте появится в течение минуты.');
      const c = await serviceCard(env, pend.type, pend.i); return send(env, chat, c.text, c.kb);
    }
    if (pend && !text.startsWith('/')) {
      if (pend.k === 'price') {
        const raw = parseInt(text.replace(/\D/g, ''), 10);
        if (!text.replace(/\D/g, '') || isNaN(raw) || raw > 1000000) return send(env, chat, 'Пришлите цену числом, например <b>4500</b>. /cancel — отмена.');
        const v = Math.round(raw / 100) * 100; // сайт показывает цены с точностью до сотен
        const cfg = await getCfg(env); const x = allItems(cfg, pend.type)[pend.i]; if (!x) return send(env, chat, 'Услуга не найдена.');
        if (x.added) { const a = cfg.added[pend.type].find(z => z.n === x.n); if (a) a.p = v; }
        else { cfg.prices[pend.type] = cfg.prices[pend.type] || {}; cfg.prices[pend.type][x.n] = v; }
        await putJ(env, 'cfg', cfg); await store(env).delete('pend:' + chat);
        await send(env, chat, `✅ «${esc(x.n)}» — теперь от <b>${rub(v)}</b>. На сайте обновится в течение минуты.`);
        const c = await serviceCard(env, pend.type, pend.i); return send(env, chat, c.text, c.kb);
      }
      if (pend.k === 'addname') {
        const name = text.replace(/\s+/g, ' ').slice(0, 60);
        if (name.length < 3) return send(env, chat, 'Название слишком короткое. Пришлите название услуги. /cancel — отмена.');
        const cfg = await getCfg(env); if (allItems(cfg, pend.type).some(x => x.n.toLowerCase() === name.toLowerCase())) return send(env, chat, 'Такая услуга уже есть. Пришлите другое название. /cancel — отмена.');
        await putJ(env, 'pend:' + chat, { ...pend, k: 'addprice', name }, { expirationTtl: 900 });
        return send(env, chat, `«${esc(name)}»\n\nТеперь пришлите цену «от» числом (например <b>2500</b>, 0 — бесплатно).`);
      }
      if (pend.k === 'addprice') {
        const raw = parseInt(text.replace(/\D/g, ''), 10);
        if (!text.replace(/\D/g, '') || isNaN(raw) || raw > 1000000) return send(env, chat, 'Пришлите цену числом, например <b>2500</b>. /cancel — отмена.');
        const v = Math.round(raw / 100) * 100;
        const cfg = await getCfg(env); cfg.added[pend.type] = cfg.added[pend.type] || []; cfg.added[pend.type].push({ n: pend.name, c: pend.cat, p: v });
        await putJ(env, 'cfg', cfg); await store(env).delete('pend:' + chat);
        const idx = allItems(cfg, pend.type).findIndex(x => x.n === pend.name);
        await send(env, chat, `✅ Услуга «${esc(pend.name)}» добавлена в «${esc(pend.cat)}» — от <b>${v ? rub(v) : 'бесплатно'}</b>. Можно сразу загрузить для неё фото.`);
        const c = await serviceCard(env, pend.type, idx); return send(env, chat, c.text, c.kb);
      }
      if (pend.k === 'closemsg') {
        const cfg = await getCfg(env); cfg.closed = true; cfg.closedMsg = text.slice(0, 200);
        await putJ(env, 'cfg', cfg); await store(env).delete('pend:' + chat);
        const v = await menu(env); return send(env, chat, '🔴 Запись закрыта.\n\n' + v.text, v.kb);
      }
    }
    if (text.startsWith('/close')) {
      const msg = text.replace(/^\/close(@\S+)?\s*/, '');
      const cfg = await getCfg(env); cfg.closed = true; cfg.closedMsg = msg.slice(0, 200); await putJ(env, 'cfg', cfg);
      const v = await menu(env); return send(env, chat, '🔴 Запись закрыта.\n\n' + v.text, v.kb);
    }
    if (text.startsWith('/open')) {
      const cfg = await getCfg(env); cfg.closed = false; await putJ(env, 'cfg', cfg);
      const v = await menu(env); return send(env, chat, '🟢 Запись открыта.\n\n' + v.text, v.kb);
    }
    if (text.startsWith('/today')) { const v = await listView(env, msk().date); return send(env, chat, v.text, v.kb); }
    if (text.startsWith('/tomorrow')) { const v = await listView(env, addDays(msk().date, 1)); return send(env, chat, v.text, v.kb); }
    if (text.startsWith('/price')) { const v = typesView(); return send(env, chat, v.text, v.kb); }
    if (text.startsWith('/block')) return send(env, chat, '<b>Убрать / вернуть время</b>\n\nВыберите день:', daysKb('bs:'));
    if (text.startsWith('/stop')) {
      const a = (await getJ(env, 'admins', [])).filter(x => x !== chat); await putJ(env, 'admins', a);
      return send(env, chat, 'Вы отключены от бота. Подключиться снова — по ссылке с паролем.');
    }
    const v = await menu(env); return send(env, chat, v.text, v.kb);
  }

  if (u.callback_query) {
    const q = u.callback_query, chat = String(q.message.chat.id), mid = q.message.message_id, d = q.data || '';
    if (!adm.includes(chat)) return tg(env, 'answerCallbackQuery', { callback_query_id: q.id, text: 'Нет доступа' });
    let toast = '';
    const show = async v => { if (v.finished) { if (v.finished.length) await putJ(env, 'seen:' + chat, v.finished, { expirationTtl: 86400 }); else await store(env).delete('seen:' + chat); } return edit(env, chat, mid, v.text, v.kb); };
    if (!/:[la]$/.test(d)) await hideFinished(env, chat);
    const [cmd, a1, a2] = [d.split(':')[0], d.split(':')[1], d.split(':').slice(2).join(':')];

    if (cmd === 'menu') await show(await menu(env));
    else if (cmd === 'close') {
      await putJ(env, 'pend:' + chat, { k: 'closemsg' }, { expirationTtl: 900 });
      const cfg = await getCfg(env); cfg.closed = true; await putJ(env, 'cfg', cfg);
      await show(await menu(env));
      await send(env, chat, '🔴 Запись закрыта. Если хотите, пришлите текст для сайта (например «Отпуск до 20 октября»). Иначе будет стандартный текст.');
    } else if (cmd === 'open') {
      const cfg = await getCfg(env); cfg.closed = false; cfg.closedMsg = ''; await putJ(env, 'cfg', cfg);
      await store(env).delete('pend:' + chat); toast = 'Запись открыта'; await show(await menu(env));
    } else if (cmd === 'ls') await show(await listView(env, a1));
    else if (cmd === 'bd') await show({ text: '<b>Убрать / вернуть время</b>\n\nВыберите день:', kb: daysKb('bs:') });
    else if (cmd === 'bs') await show(await slotsView(env, a1));
    else if (cmd === 'bt' || cmd === 'ba' || cmd === 'bo') {
      const cfg = await getCfg(env); const date = a1;
      let bl = cfg.blocked[date]; bl = bl === 'all' ? [...SLOTS] : (Array.isArray(bl) ? bl : []);
      if (cmd === 'bt') bl = bl.includes(a2) ? bl.filter(x => x !== a2) : [...bl, a2];
      if (cmd === 'ba') bl = [...SLOTS];
      if (cmd === 'bo') bl = [];
      if (bl.length) cfg.blocked[date] = bl.length === SLOTS.length ? 'all' : bl; else delete cfg.blocked[date];
      for (const k of Object.keys(cfg.blocked)) if (k < msk().date) delete cfg.blocked[k];
      await putJ(env, 'cfg', cfg); await show(await slotsView(env, date));
    } else if (cmd === 'bk') {
      const { b } = await getBookings(env); const o = b[a1]?.[a2];
      toast = o ? `${a2}: ${o.name}, ${fmtPhone(o.phone)}` : 'Записи нет';
    } else if (cmd === 'pt') await show(a1 ? await servicesView(env, a1) : typesView());
    else if (cmd === 'la') await show(await allView(env));
    else if (cmd === 'sv') await show(await serviceCard(env, a1, +a2));
    else if (cmd === 'ps') {
      const cfg = await getCfg(env); const x = allItems(cfg, a1)[+a2]; if (!x) { toast = 'Услуга не найдена'; }
      else {
        await putJ(env, 'pend:' + chat, { k: 'price', type: a1, i: +a2 }, { expirationTtl: 900 });
        await send(env, chat, `<b>${esc(x.n)}</b>\nСейчас: от ${x.p ? rub(x.p) : 'бесплатно'}\n\nПришлите новую цену числом (округляется до сотен). /cancel — отмена.`);
      }
    } else if (cmd === 'ph') {
      const cfg = await getCfg(env); const x = allItems(cfg, a1)[+a2];
      if (!x) toast = 'Услуга не найдена';
      else { await putJ(env, 'pend:' + chat, { k: 'photo', type: a1, i: +a2 }, { expirationTtl: 900 }); await send(env, chat, `🖼 Пришлите фото для «${esc(x.n)}» одной картинкой.\nЛучше квадратное или 4:3, предмет по центру, тёмный фон. /cancel — отмена.`); }
    } else if (cmd === 'pr' || cmd === 'pz' || cmd === 'hd' || cmd === 'rm') {
      const cfg = await getCfg(env); const x = allItems(cfg, a1)[+a2];
      if (!x) toast = 'Услуга не найдена';
      else {
        if (cmd === 'pr' && cfg.prices[a1]) { delete cfg.prices[a1][x.n]; if (!Object.keys(cfg.prices[a1]).length) delete cfg.prices[a1]; toast = 'Цена возвращена'; }
        if (cmd === 'pz' && cfg.imgs[a1]) { delete cfg.imgs[a1][x.n]; await imgDel(env, imgKey(a1, x.n)); toast = 'Своё фото убрано'; }
        if (cmd === 'hd') { const r = new Set(cfg.removed[a1] || []); r.has(x.n) ? r.delete(x.n) : r.add(x.n); cfg.removed[a1] = [...r]; toast = r.has(x.n) ? 'Скрыта с сайта' : 'Снова на сайте'; }
        if (cmd === 'rm') { cfg.added[a1] = (cfg.added[a1] || []).filter(z => z.n !== x.n); if (cfg.imgs[a1]) delete cfg.imgs[a1][x.n]; await imgDel(env, imgKey(a1, x.n)); toast = 'Услуга удалена'; }
        await putJ(env, 'cfg', cfg); await store(env).delete('pend:' + chat);
        await show(cmd === 'rm' ? await servicesView(env, a1) : await serviceCard(env, a1, +a2));
      }
    } else if (cmd === 'ad') {
      const T = CATALOG[a1];
      await show({ text: `<b>➕ Новая услуга · ${esc(T.name)}</b>\n\nВ какой раздел добавить?`, kb: [...T.cats.map((c, ci) => [{ text: c, callback_data: `ac:${a1}:${ci}` }]), [{ text: '‹ Назад', callback_data: 'pt:' + a1 }]] });
    } else if (cmd === 'ac') {
      const cat = CATALOG[a1].cats[+a2];
      await putJ(env, 'pend:' + chat, { k: 'addname', type: a1, cat }, { expirationTtl: 900 });
      await send(env, chat, `➕ Раздел «${esc(cat)}».\n\nПришлите название новой услуги. /cancel — отмена.`);
    } else if (['d', 'g', 'x', 'u'].includes(cmd)) {
      const ref = d.slice(2).replace(/:[la]$/, ''); const fromList = d.endsWith(':l'); const fromAll = d.endsWith(':a');
      const r = await orderAction(env, cmd, ref); toast = r.toast;
      if (r.o) {
        const st = statusOf(r.o);
        if (fromAll) { const prev = await getJ(env, 'seen:' + chat, []); await show(await allView(env, [...new Set([...prev, r.num])])); }
        else if (fromList) await show(await listView(env, r.o.date));
        else if (r.o.full) await edit(env, chat, mid, orderText(r.o.full, stLine(r.o, st)), r.gone ? undefined : orderKb(r.num, st));
      }
    }
    return tg(env, 'answerCallbackQuery', { callback_query_id: q.id, ...(toast ? { text: toast } : {}) });
  }
}

/* ---------- HTTP ---------- */
/* ---------- защита от спама ---------- */
const hits = new Map();
function limited(ip, per = 10) { // быстрый фильтр в памяти: не больше N запросов в минуту с одного адреса
  const k = ip + ':' + Math.floor(Date.now() / 60000); const n = (hits.get(k) || 0) + 1; hits.set(k, n);
  if (hits.size > 5000) hits.clear();
  return n > per;
}
async function counter(env, key, ttl) { const n = (+(await store(env).get(key)) || 0) + 1; await store(env).put(key, String(n), { expirationTtl: ttl }); return n; }
const phoneOk = p => { const d = String(p || '').replace(/\D/g, ''); return /^9\d{9}$/.test(d) || /^[78]9\d{9}$/.test(d); };
const phoneKey = p => String(p || '').replace(/\D/g, '').slice(-10);

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

    if (url.pathname === '/state' && req.method === 'GET') {
      const [cfg, { b }] = await Promise.all([getCfg(env), getBookings(env)]);
      const t = msk().date; const busy = {};
      for (let i = 0; i <= DAYS_AHEAD; i++) {
        const d = addDays(t, i); const bl = cfg.blocked[d];
        const set = new Set([...(bl === 'all' ? SLOTS : Array.isArray(bl) ? bl : []), ...Object.keys(b[d] || {})]);
        if (set.size) busy[d] = [...set].sort();
      }
      const imgs = {}; for (const [ty, m] of Object.entries(cfg.imgs)) for (const [n, v] of Object.entries(m)) (imgs[ty] = imgs[ty] || {})[n] = `${url.origin}/img/${imgKey(ty, n)}?v=${v}`;
      return json({ closed: cfg.closed, closedMsg: cfg.closed ? (cfg.closedMsg || DEFAULT_CLOSED) : '', prices: cfg.prices, removed: cfg.removed, added: cfg.added, imgs, busy, today: t });
    }

    if (url.pathname.startsWith('/img/') && req.method === 'GET') {
      const im = await imgGet(env, url.pathname.slice(5).replace(/[^\w-]/g, ''));
      if (!im) return new Response('not found', { status: 404, headers: CORS });
      return new Response(im.bytes, { headers: { ...CORS, 'Content-Type': im.t, 'Cache-Control': 'public, max-age=31536000, immutable' } });
    }

    if (url.pathname === '/status' && req.method === 'GET') {
      const nums = String(url.searchParams.get('n') || '').toUpperCase().split(',').map(x => x.trim()).filter(x => /^RM-\d{4}$/.test(x)).slice(0, 30);
      const ords = await getOrders(env); const out = {};
      for (const n of nums) if (ords[n]) out[n] = { s: statusOf(ords[n]), date: ords[n].date, time: ords[n].time, device: ords[n].device, services: ords[n].services };
      return json(out);
    }

    if (url.pathname === '/order' && req.method === 'POST') {
      const ip = req.headers.get('CF-Connecting-IP') || 'x';
      if (limited(ip, 5)) return json({ ok: false, error: 'rate' }, 429);
      const o = await req.json().catch(() => null);
      if (!o || typeof o !== 'object') return json({ ok: false, error: 'bad' }, 400);
      // ловушки для ботов: скрытое поле заполнено или форму отправили быстрее чем за 4 секунды
      if (o.website || (o.t != null && +o.t < 4000)) return json({ ok: true });
      const clean = {
        num: String(o.num || '').slice(0, 20), date: String(o.date || ''), time: String(o.time || ''),
        name: String(o.name || '').trim().slice(0, 60), phone: String(o.phone || '').slice(0, 30),
        contact: o.contact === 'tg' ? 'tg' : 'call', tg: String(o.tg || '').slice(0, 40),
        device: String(o.device || '').slice(0, 120), problem: String(o.problem || '').slice(0, 300),
        services: (Array.isArray(o.services) ? o.services : []).slice(0, 30).map(x => ({ name: String(x.name || '').slice(0, 80), lo: +x.lo || 0, hi: +x.hi || 0 })),
        devices: (Array.isArray(o.devices) ? o.devices : []).slice(0, 5).map(d => ({ device: String(d.device || '').slice(0, 120), problem: String(d.problem || '').slice(0, 300),
          services: (Array.isArray(d.services) ? d.services : []).slice(0, 10).map(x => ({ name: String(x.name || '').slice(0, 80), lo: +x.lo || 0, hi: +x.hi || 0 })) })),
        created: new Date().toISOString(),
      };
      if (clean.devices.length < 2) delete clean.devices;
      if (!/^RM-\d{4}$/.test(clean.num) || clean.name.length < 2 || !phoneOk(clean.phone) || !SLOTS.includes(clean.time) || !inRange(clean.date)) return json({ ok: false, error: 'bad' }, 400);
      if (/https?:\/\/|www\.|<[a-z]/i.test(clean.name + ' ' + clean.problem)) return json({ ok: false, error: 'bad' }, 400);
      // не больше 6 записей в час с одного адреса и не больше 3 активных записей на один телефон
      if (await counter(env, 'rl:ip:' + ip + ':' + Math.floor(Date.now() / 3600000), 3700) > 6) return json({ ok: false, error: 'rate' }, 429);
      { const act = await activeOrders(env); if (act.filter(x => phoneKey(x.phone) === phoneKey(clean.phone)).length >= 3) return json({ ok: false, error: 'limit' }, 429); }
      const cfg = await getCfg(env);
      if (cfg.closed) return json({ ok: false, error: 'closed', closedMsg: cfg.closedMsg || DEFAULT_CLOSED }, 409);
      const bl = cfg.blocked[clean.date];
      const { b } = await getBookings(env);
      if (isPast(clean.date, clean.time) || bl === 'all' || (Array.isArray(bl) && bl.includes(clean.time)) || b[clean.date]?.[clean.time]) return json({ ok: false, error: 'busy' }, 409);
      b[clean.date] = b[clean.date] || {}; b[clean.date][clean.time] = clean;
      await putJ(env, 'bookings', b);
      const ords = await getOrders(env);
      ords[clean.num] = { status: 'new', hist: [], date: clean.date, time: clean.time, device: clean.device, services: clean.services.map(x => x.name).join(', '), full: clean };
      await putJ(env, 'orders', ords);
      const list = await admins(env);
      const notify = Promise.all(list.map(c => send(env, c, orderText(clean), orderKb(clean.num, 'new')).then(r => r && r.ok ? [c, r.result.message_id] : null)))
        .then(async ids => { const os = await getOrders(env); if (os[clean.num]) { os[clean.num].msgs = ids.filter(Boolean); await putJ(env, 'orders', os); } });
      if (ctx && ctx.waitUntil) ctx.waitUntil(notify); else await notify;
      return json({ ok: true });
    }

    if (url.pathname === '/cancel' && req.method === 'POST') {
      const ip = req.headers.get('CF-Connecting-IP') || 'x';
      if (limited(ip, 5)) return json({ ok: false, error: 'rate' }, 429);
      const q = await req.json().catch(() => null) || {};
      const numQ = String(q.num || '').toUpperCase(); const ords = await getOrders(env); const o = ords[numQ];
      if (!o || !o.full || phoneKey(o.full.phone) !== phoneKey(q.phone)) return json({ ok: false, error: 'notfound' }, 404);
      const st = statusOf(o);
      if (st === 'cancelled') return json({ ok: true });
      if (st !== 'new') return json({ ok: false, error: 'started', s: st }, 409);
      o.hist = o.hist || []; o.hist.push(o.status); o.status = 'cancelled'; o.byClient = true; ords[numQ] = o;
      const { b } = await getBookings(env);
      if (b[o.date]?.[o.time]?.num === numQ) { delete b[o.date][o.time]; if (!Object.keys(b[o.date]).length) delete b[o.date]; }
      await putJ(env, 'orders', ords); await putJ(env, 'bookings', b);
      const text = orderText(o.full, stLine(o, 'cancelled')); const kb = orderKb(numQ, 'cancelled');
      const jobs = (o.msgs && o.msgs.length) ? o.msgs.map(([c, m]) => edit(env, c, m, text, kb)) : [];
      jobs.push(...(await admins(env)).map(c => send(env, c, `❌ Клиент отменил запись <b>${esc(numQ)}</b> на ${esc(ruDay(o.date))}, ${esc(o.time)}. Время снова свободно.`)));
      const all = Promise.all(jobs); if (ctx && ctx.waitUntil) ctx.waitUntil(all); else await all;
      return json({ ok: true });
    }

    if (url.pathname === '/tg' && req.method === 'POST') {
      if (req.headers.get('X-Telegram-Bot-Api-Secret-Token') !== await secret(env)) return new Response('forbidden', { status: 403 });
      const u = await req.json().catch(() => null);
      if (u) { try { await onUpdate(env, u); } catch (e) { console.log('update error', e); } }
      return new Response('ok');
    }

    if (url.pathname === '/setup') {
      if (!env.PASSWORD || url.searchParams.get('key') !== env.PASSWORD) return new Response('Откройте /setup?key=ВАШ_ПАРОЛЬ', { status: 403, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      const r = await tg(env, 'setWebhook', { url: `${url.origin}/tg`, secret_token: await secret(env), allowed_updates: ['message', 'callback_query'], drop_pending_updates: true });
      await tg(env, 'deleteMyCommands', {});
      await tg(env, 'setChatMenuButton', { menu_button: { type: 'default' } });
      const me = await tg(env, 'getMe', {}); const name = me.result && me.result.username;
      const link = name ? `https://t.me/${name}?start=${encodeURIComponent(env.PASSWORD)}` : '';
      const kv = env.SQL ? 'База D1 подключена ✅ (изменения видны сразу)' : env.DB ? 'KV подключено ✅ — для мгновенного обновления подключите D1 (привязка SQL)' : 'Хранилище не подключено ❌';
      return new Response(`<meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font:16px/1.5 system-ui;padding:24px;max-width:640px">
        <h2>${r.ok ? '✅ Бот подключён' : '❌ Ошибка: ' + esc(r.description || '')}</h2><p>${kv}</p>
        ${link ? `<p><b>Ссылка для владельца</b> — открыть в Telegram и нажать «Старт»:<br><a href="${link}">${link}</a></p>` : ''}
        <p><b>Адрес для сайта</b> (вписать в js/app.js → ORDER_API):<br><code>${url.origin}</code></p></body>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return new Response('GEZA SERVICE · сервер работает', { headers: { ...CORS, 'Content-Type': 'text/plain; charset=utf-8' } });
  },
};
