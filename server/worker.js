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
const CATALOG = {"phone": {"name": "Телефоны", "items": [["Замена дисплея", 8900], ["Замена защитного стекла", 4900], ["Ремонт сенсора", 3900], ["Восстановление подсветки", 3500], ["Замена аккумулятора", 3900], ["Замена контроллера питания", 4500], ["Ремонт быстрой зарядки", 2900], ["Беспроводная зарядка", 3200], ["Замена заднего стекла", 3900], ["Замена корпуса", 7900], ["Ремонт кнопок", 1900], ["Выпрямление корпуса", 2500], ["Замена основной камеры", 5900], ["Замена фронтальной камеры", 3900], ["Замена стекла камеры", 1900], ["Ремонт вспышки", 1500], ["Замена разъёма зарядки", 2900], ["Замена динамика", 2400], ["Замена микрофона", 2400], ["Чистка сеток и разъёмов", 900], ["Чистка после воды", 2900], ["Ремонт материнской платы", 6900], ["Восстановление данных", 4900], ["Бесплатная диагностика", 0]]}, "laptop": {"name": "Ноутбуки", "items": [["Замена матрицы", 12900], ["Замена шлейфа матрицы", 3900], ["Ремонт петель", 4500], ["Замена клавиатуры", 5900], ["Замена аккумулятора", 6900], ["Ремонт разъёма питания", 3500], ["Замена порта USB-C", 3900], ["Ремонт цепи питания", 7900], ["Чистка и замена термопасты", 3500], ["Замена SSD с переносом данных", 2900], ["Установка системы", 2500], ["Ремонт после залития", 7900]]}, "tablet": {"name": "Планшеты", "items": [["Замена дисплея", 9900], ["Замена сенсорного стекла", 5900], ["Ремонт подсветки", 4500], ["Защитное стекло", 1200], ["Замена аккумулятора", 5900], ["Замена разъёма зарядки", 3500], ["Ремонт контроллера питания", 4900], ["Ремонт кнопки питания", 2500], ["Замена корпуса", 6900], ["Ремонт камеры", 4900], ["Замена динамика", 2900], ["Ремонт после воды", 4900]]}, "console": {"name": "Консоли", "items": [["Ремонт стиков", 2500], ["Замена аккумулятора геймпада", 2200], ["Ремонт кнопок и курков", 1900], ["Замена разъёма геймпада", 1900], ["Чистка и замена термопасты", 3500], ["Замена HDMI-порта", 4900], ["Ремонт дисковода", 5500], ["Ремонт блока питания", 5900], ["Замена экрана", 7900], ["Замена джойстиков", 2500], ["Замена аккумулятора", 4900], ["Замена вентилятора", 3500]]}};

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
async function getJ(env, k, def) { try { const v = await env.DB.get(k); return v ? JSON.parse(v) : def; } catch { return def; } }
const putJ = (env, k, v, opt) => env.DB.put(k, JSON.stringify(v), opt);
async function getCfg(env) { const c = await getJ(env, 'cfg', {}); return { closed: !!c.closed, closedMsg: c.closedMsg || '', prices: c.prices || {}, blocked: c.blocked || {} }; }
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
  const svc = Array.isArray(o.services) ? o.services.slice(0, 10) : [];
  const tot = svc.reduce((a, x) => ({ lo: a.lo + (+x.lo || 0), hi: a.hi + (+x.hi || 0) }), { lo: 0, hi: 0 });
  const rr = (lo, hi) => lo === hi ? rub(lo) : `${num(lo)}–${rub(hi)}`;
  const phone = fmtPhone(o.phone);
  const lines = [
    `🧾 <b>Новая запись · ${esc(o.num)}</b>`,
    `📅 <b>${esc(ruDay(o.date))} · ${esc(o.time)}</b>`,
    '',
    `👤 ${esc(o.name)}`,
    `📞 ${phone}`,
    o.contact === 'tg' ? `✈️ Связь: <b>Telegram ${esc(o.tg || '')}</b>` : '☎️ Связь: <b>позвонить</b>',
    '',
    `📱 ${esc(o.device)}`,
    ...(svc.length ? svc.map(x => `🔧 ${esc(x.name)} · ${rr(+x.lo || 0, +x.hi || 0)}`) : ['🔧 Бесплатная диагностика']),
    o.problem ? `💬 ${esc(o.problem)}` : null,
    svc.length > 1 || (svc.length && o.problem) ? `💰 <b>Итого: ${rr(tot.lo, tot.hi)}</b>` : null,
  ].filter(l => l !== null);
  if (status) lines.push('', status);
  return lines.join('\n');
}

/* ---------- меню бота ---------- */
async function menu(env) {
  const cfg = await getCfg(env); const { b } = await getBookings(env); const t = msk().date;
  const cnt = d => Object.keys(b[d] || {}).length;
  const text = [
    '<b>GEZA SERVICE · управление сайтом</b>', '',
    cfg.closed ? `🔴 Запись <b>закрыта</b>${cfg.closedMsg ? `\n<i>${esc(cfg.closedMsg)}</i>` : ''}` : '🟢 Запись <b>открыта</b>',
    `📋 Сегодня записей: <b>${cnt(t)}</b>, завтра: <b>${cnt(addDays(t, 1))}</b>`,
  ].join('\n');
  const kb = [
    [cfg.closed ? { text: '🟢 Открыть запись', callback_data: 'open' } : { text: '🔴 Закрыть запись', callback_data: 'close' }],
    [{ text: '📋 Записи сегодня', callback_data: 'ls:' + t }, { text: '📋 Завтра', callback_data: 'ls:' + addDays(t, 1) }],
    [{ text: '⛔ Убрать / вернуть время', callback_data: 'bd' }],
    [{ text: '💰 Изменить цены', callback_data: 'pt' }],
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

async function listView(env, date) {
  const { b } = await getBookings(env); const day = b[date] || {}; const ords = await getOrders(env);
  const items = {};
  for (const [n, o] of Object.entries(ords)) if (o.date === date && o.full) items[n] = { ...o.full, st: statusOf(o) };
  for (const [t, o] of Object.entries(day)) if (!items[o.num]) items[o.num] = { ...o, st: statusOf(ords[o.num] || { date, time: t }) };
  const list = Object.values(items).sort((a, b2) => a.time.localeCompare(b2.time));
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
  return { text, kb };
}

/* действия с заказом: d — готов, g — выдан, x — отменить запись, u — отменить действие */
async function orderAction(env, act, ref) {
  const ords = await getOrders(env); let num = ref;
  if (/^\d{4}-\d{2}-\d{2}$/.test(ref.split(':')[0])) { const [d, h, m] = ref.split(':'); const { b } = await getBookings(env); num = b[d]?.[`${h}:${m}`]?.num || ''; }
  const o = ords[num]; if (!o) return { toast: 'Заказ не найден' };
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
    o.status = o.hist.pop(); toast = `${num}: действие отменено`;
  }
  ords[num] = o; await putJ(env, 'orders', ords); await putJ(env, 'bookings', b);
  return { toast, o, num, changed: true };
}

function typesView() {
  return {
    text: '<b>Цены</b>\n\nВыберите раздел. Цены указаны «от» — для Apple; для других брендов сайт сам пересчитывает их, как раньше.',
    kb: [...Object.entries(CATALOG).map(([k, v]) => [{ text: v.name, callback_data: 'pt:' + k }]), [{ text: '‹ Меню', callback_data: 'menu' }]],
  };
}
async function servicesView(env, type) {
  const cfg = await getCfg(env); const T = CATALOG[type]; const ov = cfg.prices[type] || {};
  const kb = T.items.map(([n, p], i) => [{ text: `${ov[n] != null ? '✏️ ' : ''}${n} · ${num(ov[n] ?? p)} ₽`.slice(0, 60), callback_data: `ps:${type}:${i}` }]);
  kb.push([{ text: '‹ Разделы', callback_data: 'pt' }, { text: '‹ Меню', callback_data: 'menu' }]);
  return { text: `<b>${esc(T.name)} · цены</b>\n\nНажмите на услугу, чтобы изменить цену. ✏️ — цена изменена.`, kb };
}

/* ---------- обработка бота ---------- */
async function onUpdate(env, u) {
  const adm = await admins(env);
  if (u.message && u.message.text) {
    const m = u.message, chat = String(m.chat.id), text = m.text.trim();
    const isAdm = adm.includes(chat);
    if (text.startsWith('/start')) {
      const pass = text.split(/\s+/)[1] || '';
      if (!isAdm && env.PASSWORD && pass === env.PASSWORD) {
        const a = await getJ(env, 'admins', []); if (!a.includes(chat)) a.push(chat); await putJ(env, 'admins', a);
        await sendKb(env, chat, '✅ Готово! Сюда будут приходить новые записи с сайта. Кнопка «📋 Меню» внизу — управление сайтом.');
        const v = await menu(env); return send(env, chat, v.text, v.kb);
      }
      if (!isAdm) return send(env, chat, 'Это служебный бот сервиса GEZA SERVICE.');
      await sendKb(env, chat, 'Кнопка «📋 Меню» внизу — управление сайтом.');
      const v0 = await menu(env); return send(env, chat, v0.text, v0.kb);
    }
    if (!isAdm) return;
    const pend = await getJ(env, 'pend:' + chat, null);
    if (text === '/cancel') { await env.DB.delete('pend:' + chat); return send(env, chat, 'Отменено.'); }
    if (pend && !text.startsWith('/')) {
      if (pend.k === 'price') {
        const raw = parseInt(text.replace(/\D/g, ''), 10);
        if (!text.replace(/\D/g, '') || isNaN(raw) || raw > 1000000) return send(env, chat, 'Пришлите цену числом, например <b>4500</b>. /cancel — отмена.');
        const v = Math.round(raw / 100) * 100; // сайт показывает цены с точностью до сотен
        const cfg = await getCfg(env); const [n] = CATALOG[pend.type].items[pend.i];
        cfg.prices[pend.type] = cfg.prices[pend.type] || {}; cfg.prices[pend.type][n] = v;
        await putJ(env, 'cfg', cfg); await env.DB.delete('pend:' + chat);
        await send(env, chat, `✅ «${esc(n)}» — теперь от <b>${rub(v)}</b>. На сайте обновится в течение минуты.`);
        const s = await servicesView(env, pend.type); return send(env, chat, s.text, s.kb);
      }
      if (pend.k === 'closemsg') {
        const cfg = await getCfg(env); cfg.closed = true; cfg.closedMsg = text.slice(0, 200);
        await putJ(env, 'cfg', cfg); await env.DB.delete('pend:' + chat);
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
    const show = async v => edit(env, chat, mid, v.text, v.kb);
    const [cmd, a1, a2] = [d.split(':')[0], d.split(':')[1], d.split(':').slice(2).join(':')];

    if (cmd === 'menu') await show(await menu(env));
    else if (cmd === 'close') {
      await putJ(env, 'pend:' + chat, { k: 'closemsg' }, { expirationTtl: 900 });
      const cfg = await getCfg(env); cfg.closed = true; await putJ(env, 'cfg', cfg);
      await show(await menu(env));
      await send(env, chat, '🔴 Запись закрыта. Если хотите, пришлите текст для сайта (например «Отпуск до 20 октября»). Иначе будет стандартный текст.');
    } else if (cmd === 'open') {
      const cfg = await getCfg(env); cfg.closed = false; cfg.closedMsg = ''; await putJ(env, 'cfg', cfg);
      await env.DB.delete('pend:' + chat); toast = 'Запись открыта'; await show(await menu(env));
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
    else if (cmd === 'ps') {
      const T = CATALOG[a1]; const i = +a2; const [n, p] = T.items[i]; const cfg = await getCfg(env); const cur = cfg.prices[a1]?.[n];
      await putJ(env, 'pend:' + chat, { k: 'price', type: a1, i }, { expirationTtl: 900 });
      await send(env, chat, `<b>${esc(n)}</b> (${esc(T.name)})\nСейчас: от ${rub(cur ?? p)}${cur != null ? `, исходная ${rub(p)}` : ''}\n\nПришлите новую цену числом (округляется до сотен). /cancel — отмена.`,
        cur != null ? [[{ text: `↩️ Вернуть исходную (${num(p)} ₽)`, callback_data: `pr:${a1}:${i}` }]] : undefined);
    } else if (cmd === 'pr') {
      const T = CATALOG[a1]; const [n, p] = T.items[+a2]; const cfg = await getCfg(env);
      if (cfg.prices[a1]) { delete cfg.prices[a1][n]; if (!Object.keys(cfg.prices[a1]).length) delete cfg.prices[a1]; }
      await putJ(env, 'cfg', cfg); await env.DB.delete('pend:' + chat);
      await edit(env, chat, mid, `✅ «${esc(n)}» — снова от <b>${rub(p)}</b>.`);
    } else if (['d', 'g', 'x', 'u'].includes(cmd)) {
      const ref = d.slice(2).replace(/:l$/, ''); const fromList = d.endsWith(':l');
      const r = await orderAction(env, cmd, ref); toast = r.toast;
      if (r.o) {
        const st = statusOf(r.o);
        if (fromList) await show(await listView(env, r.o.date));
        else if (r.o.full) await edit(env, chat, mid, orderText(r.o.full, ST_LINE[st] || ''), orderKb(r.num, st));
      }
    }
    return tg(env, 'answerCallbackQuery', { callback_query_id: q.id, ...(toast ? { text: toast } : {}) });
  }
}

/* ---------- HTTP ---------- */
const hits = new Map();
function limited(ip) {
  const k = ip + ':' + Math.floor(Date.now() / 60000); const n = (hits.get(k) || 0) + 1; hits.set(k, n);
  if (hits.size > 5000) hits.clear();
  return n > 10;
}

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
      return json({ closed: cfg.closed, closedMsg: cfg.closed ? (cfg.closedMsg || DEFAULT_CLOSED) : '', prices: cfg.prices, busy, today: t });
    }

    if (url.pathname === '/status' && req.method === 'GET') {
      const nums = String(url.searchParams.get('n') || '').toUpperCase().split(',').map(x => x.trim()).filter(x => /^RM-\d{4}$/.test(x)).slice(0, 30);
      const ords = await getOrders(env); const out = {};
      for (const n of nums) if (ords[n]) out[n] = { s: statusOf(ords[n]), date: ords[n].date, time: ords[n].time, device: ords[n].device, services: ords[n].services };
      return json(out);
    }

    if (url.pathname === '/order' && req.method === 'POST') {
      if (limited(req.headers.get('CF-Connecting-IP') || 'x')) return json({ ok: false, error: 'rate' }, 429);
      const o = await req.json().catch(() => null);
      if (!o || typeof o !== 'object') return json({ ok: false, error: 'bad' }, 400);
      const clean = {
        num: String(o.num || '').slice(0, 20), date: String(o.date || ''), time: String(o.time || ''),
        name: String(o.name || '').trim().slice(0, 60), phone: String(o.phone || '').slice(0, 30),
        contact: o.contact === 'tg' ? 'tg' : 'call', tg: String(o.tg || '').slice(0, 40),
        device: String(o.device || '').slice(0, 120), problem: String(o.problem || '').slice(0, 300),
        services: (Array.isArray(o.services) ? o.services : []).slice(0, 10).map(x => ({ name: String(x.name || '').slice(0, 80), lo: +x.lo || 0, hi: +x.hi || 0 })),
        created: new Date().toISOString(),
      };
      if (!clean.num || !clean.name || clean.phone.replace(/\D/g, '').length < 10 || !SLOTS.includes(clean.time) || !inRange(clean.date)) return json({ ok: false, error: 'bad' }, 400);
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
      const notify = Promise.all(list.map(c => send(env, c, orderText(clean), orderKb(clean.num, 'new'))));
      if (ctx && ctx.waitUntil) ctx.waitUntil(notify); else await notify;
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
      const kv = env.DB ? 'KV подключено ✅' : 'KV не подключено ❌ (Settings → Bindings → KV, имя DB)';
      return new Response(`<meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font:16px/1.5 system-ui;padding:24px;max-width:640px">
        <h2>${r.ok ? '✅ Бот подключён' : '❌ Ошибка: ' + esc(r.description || '')}</h2><p>${kv}</p>
        ${link ? `<p><b>Ссылка для владельца</b> — открыть в Telegram и нажать «Старт»:<br><a href="${link}">${link}</a></p>` : ''}
        <p><b>Адрес для сайта</b> (вписать в js/app.js → ORDER_API):<br><code>${url.origin}</code></p></body>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return new Response('GEZA SERVICE · сервер работает', { headers: { ...CORS, 'Content-Type': 'text/plain; charset=utf-8' } });
  },
};
