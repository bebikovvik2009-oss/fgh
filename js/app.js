const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const ico=(id,cls='ico')=>`<svg class="${cls}"><use href="#i-${id}"/></svg>`;
const tones=['accent','sage','rose','sky'];
const rub=n=>Math.round(n/100)*100;
const money=n=>rub(n).toLocaleString('ru-RU')+' ₽';
const plural=(n,f)=>{const a=n%10,b=n%100; return f[(a===1&&b!==11)?0:(a>=2&&a<=4&&(b<10||b>=20))?1:2];};
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ===== каталог: техника → бренды → разделы услуг =====
   услуга: [название, базовая цена, срок, гарантия, что входит]
   чтобы поставить настоящий логотип бренда, добавьте logo: 'путь/к/файлу.svg' */
const CATALOG={
  phone:{name:'Телефоны',one:'Телефон',ico:'device',tone:'accent',hint:'Например, iPhone 15 Pro',
    brands:[{n:'Apple',k:1},{n:'Samsung',k:.9},{n:'Xiaomi',k:.7},{n:'Google Pixel',k:.9},{n:'Honor',k:.7},{n:'Huawei',k:.75},{n:'OnePlus',k:.8},{n:'Realme',k:.65}],
    cats:{
      'Экран':{i:'crack',items:[
        ['Замена дисплея',8900,'от 40 минут','12 месяцев','Оригинальный модуль, проклейка, проверка сенсора и Face ID'],
        ['Замена защитного стекла',4900,'от 2 часов','6 месяцев','Переклейка стекла на родной матрице'],
        ['Ремонт сенсора',3900,'от 1 часа','6 месяцев','Диагностика шлейфа и контроллера касаний'],
        ['Восстановление подсветки',3500,'от 2 часов','3 месяца','Замена цепи подсветки на плате']]},
      'Аккумулятор':{i:'battery',items:[
        ['Замена аккумулятора',3900,'от 30 минут','12 месяцев','Новая батарея, калибровка, проверка ёмкости'],
        ['Замена контроллера питания',4500,'от 1 дня','3 месяца','Пайка микросхемы питания'],
        ['Ремонт быстрой зарядки',2900,'от 2 часов','3 месяца','Диагностика цепи и замена компонентов'],
        ['Беспроводная зарядка',3200,'от 1 часа','6 месяцев','Замена катушки беспроводной зарядки']]},
      'Корпус и стекло':{i:'glass',items:[
        ['Замена заднего стекла',3900,'от 1 часа','6 месяцев','Лазерное снятие и установка стекла в цвет'],
        ['Замена корпуса',7900,'от 1 дня','6 месяцев','Перенос всех компонентов в новый корпус'],
        ['Ремонт кнопок',1900,'от 40 минут','6 месяцев','Громкость, питание, переключатель режимов'],
        ['Выпрямление корпуса',2500,'от 2 часов','1 месяц','Аккуратное выравнивание после изгиба']]},
      'Камера':{i:'camera',items:[
        ['Замена основной камеры',5900,'от 1 часа','6 месяцев','Модуль камеры, проверка фокуса и стабилизации'],
        ['Замена фронтальной камеры',3900,'от 1 часа','6 месяцев','Модуль камеры, проверка разблокировки по лицу'],
        ['Замена стекла камеры',1900,'30 минут','3 месяца','Новое стекло без снятия модуля'],
        ['Ремонт вспышки',1500,'от 1 часа','3 месяца','Замена шлейфа или светодиода']]},
      'Разъём и звук':{i:'plug',items:[
        ['Замена разъёма зарядки',2900,'от 40 минут','6 месяцев','Новый разъём Lightning или USB-C'],
        ['Замена динамика',2400,'от 30 минут','6 месяцев','Разговорный или полифонический динамик'],
        ['Замена микрофона',2400,'от 40 минут','6 месяцев','Основной или шумоподавляющий микрофон'],
        ['Чистка сеток и разъёмов',900,'20 минут','1 месяц','Удаление пыли и окислов']]},
      'Плата и вода':{i:'chip',items:[
        ['Чистка после воды',2900,'от 1 дня','1 месяц','Разборка, ультразвуковая чистка, сушка'],
        ['Ремонт материнской платы',6900,'от 2 дней','3 месяца','Пайка компонентов под микроскопом'],
        ['Восстановление данных',4900,'от 1 дня','—','Извлечение фото и контактов с неисправной платы'],
        ['Бесплатная диагностика',0,'от 15 минут','—','Точная причина и цена до начала ремонта']]}
    },
    issues:[['Разбит экран','Экран',0],['Быстро садится','Аккумулятор',0],['Разбито заднее стекло','Корпус и стекло',0],['Не работает камера','Камера',0],['Не заряжается','Разъём и звук',0],['Попала вода','Плата и вода',0]]},
  laptop:{name:'Ноутбуки',one:'Ноутбук',ico:'laptop',tone:'sky',hint:'Например, MacBook Air M2',
    brands:[{n:'Apple MacBook',k:1.3},{n:'Lenovo',k:.85},{n:'ASUS',k:.9},{n:'HP',k:.85},{n:'Dell',k:.9},{n:'Acer',k:.8},{n:'MSI',k:.95},{n:'Huawei',k:.9}],
    cats:{
      'Экран и корпус':{i:'laptop',items:[
        ['Замена матрицы',12900,'от 1 дня','12 месяцев','Матрица с той же частотой и разрешением'],
        ['Замена шлейфа матрицы',3900,'от 2 часов','6 месяцев','Устраняет полосы и мерцание'],
        ['Ремонт петель',4500,'от 1 дня','6 месяцев','Восстановление креплений крышки'],
        ['Замена клавиатуры',5900,'от 2 часов','6 месяцев','Новая клавиатура в той же раскладке']]},
      'Питание':{i:'battery',items:[
        ['Замена аккумулятора',6900,'от 1 часа','12 месяцев','Новая батарея и калибровка'],
        ['Ремонт разъёма питания',3500,'от 2 часов','6 месяцев','Пайка или замена гнезда'],
        ['Замена порта USB-C',3900,'от 2 часов','6 месяцев','Новый порт зарядки и передачи данных'],
        ['Ремонт цепи питания',7900,'от 2 дней','3 месяца','Пайка компонентов на плате']]},
      'Система и чистка':{i:'chip',items:[
        ['Чистка и замена термопасты',3500,'от 2 часов','3 месяца','Снижает нагрев и шум вентилятора'],
        ['Замена SSD с переносом данных',2900,'от 2 часов','6 месяцев','Работа без учёта стоимости диска'],
        ['Установка системы',2500,'1 час','1 месяц','Система, драйверы и базовые программы'],
        ['Ремонт после залития',7900,'от 2 дней','3 месяца','Чистка платы и замена повреждённых элементов']]}
    },
    issues:[['Разбит экран','Экран и корпус',0],['Сломалась клавиатура','Экран и корпус',3],['Не держит заряд','Питание',0],['Не заряжается','Питание',1],['Греется и шумит','Система и чистка',0],['Залили жидкостью','Система и чистка',3]]},
  tablet:{name:'Планшеты',one:'Планшет',ico:'tablet',tone:'sage',hint:'Например, iPad Air 5',
    brands:[{n:'Apple iPad',k:1},{n:'Samsung Galaxy Tab',k:.85},{n:'Xiaomi Pad',k:.7},{n:'Lenovo Tab',k:.7},{n:'Huawei MatePad',k:.8},{n:'Honor Pad',k:.7}],
    cats:{
      'Экран':{i:'crack',items:[
        ['Замена дисплея',9900,'от 1 дня','12 месяцев','Модуль в сборе, проклейка, проверка сенсора'],
        ['Замена сенсорного стекла',5900,'от 3 часов','6 месяцев','Новое стекло с сенсором'],
        ['Ремонт подсветки',4500,'от 1 дня','3 месяца','Восстановление цепи подсветки'],
        ['Защитное стекло',1200,'15 минут','1 месяц','Подбор и аккуратная наклейка']]},
      'Питание':{i:'battery',items:[
        ['Замена аккумулятора',5900,'от 2 часов','12 месяцев','Новая батарея, калибровка'],
        ['Замена разъёма зарядки',3500,'от 1 часа','6 месяцев','Lightning или USB-C'],
        ['Ремонт контроллера питания',4900,'от 1 дня','3 месяца','Пайка микросхемы питания'],
        ['Ремонт кнопки питания',2500,'от 1 часа','6 месяцев','Замена шлейфа кнопки']]},
      'Корпус и камера':{i:'camera',items:[
        ['Замена корпуса',6900,'от 1 дня','6 месяцев','Перенос компонентов в новый корпус'],
        ['Ремонт камеры',4900,'от 2 часов','6 месяцев','Основная или фронтальная камера'],
        ['Замена динамика',2900,'от 1 часа','6 месяцев','Восстановление звука'],
        ['Ремонт после воды',4900,'от 1 дня','1 месяц','Чистка и сушка платы']]}
    },
    issues:[['Разбит экран','Экран',0],['Не работает сенсор','Экран',1],['Быстро садится','Питание',0],['Не заряжается','Питание',1],['Не работает камера','Корпус и камера',1],['Попала вода','Корпус и камера',3]]},
  console:{name:'Консоли',one:'Консоль',ico:'pad',tone:'rose',hint:'Например, PlayStation 5 Slim',
    brands:[{n:'Sony PlayStation',k:1},{n:'Microsoft Xbox',k:1},{n:'Nintendo Switch',k:.8},{n:'Valve Steam Deck',k:.9}],
    cats:{
      'Геймпады':{i:'pad',items:[
        ['Ремонт стиков',2500,'от 1 часа','6 месяцев','Устраняет самопроизвольное движение стика'],
        ['Замена аккумулятора геймпада',2200,'от 1 часа','6 месяцев','Новая батарея'],
        ['Ремонт кнопок и курков',1900,'от 1 часа','6 месяцев','Замена контактов и пружин'],
        ['Замена разъёма геймпада',1900,'от 1 часа','6 месяцев','Новый порт зарядки']]},
      'Приставка':{i:'chip',items:[
        ['Чистка и замена термопасты',3500,'от 3 часов','3 месяца','Снижает нагрев и шум'],
        ['Замена HDMI-порта',4900,'от 1 дня','6 месяцев','Возвращает изображение на телевизор'],
        ['Ремонт дисковода',5500,'от 1 дня','6 месяцев','Привод снова читает диски'],
        ['Ремонт блока питания',5900,'от 1 дня','3 месяца','Если консоль не включается']]},
      'Портативные':{i:'tablet',items:[
        ['Замена экрана',7900,'от 1 дня','6 месяцев','Дисплей для портативной консоли'],
        ['Замена джойстиков',2500,'от 1 часа','6 месяцев','Новые модули стиков'],
        ['Замена аккумулятора',4900,'от 2 часов','6 месяцев','Новая батарея и калибровка'],
        ['Замена вентилятора',3500,'от 2 часов','6 месяцев','Тихий и холодный режим работы']]}
    },
    issues:[['Дрифт стика','Геймпады',0],['Перегрев и шум','Приставка',0],['Нет изображения','Приставка',1],['Не читает диски','Приставка',2],['Не включается','Приставка',3],['Разбит экран','Портативные',0]]}
};
const TYPES=Object.keys(CATALOG);
const brandOf=(t,n)=>CATALOG[t].brands.find(b=>b.n===n)||CATALOG[t].brands[0];
const priceRange=(base,k)=>base?{lo:rub(base*k*.92),hi:rub(base*k*1.15)}:{lo:0,hi:0};
const rangeText=r=>r.hi?`${r.lo.toLocaleString('ru-RU')} – ${r.hi.toLocaleString('ru-RU')} ₽`:'Бесплатно';

/* логотипы брендов */
const LOGO={"xiaomi":"assets/icons/brands/xiaomi.png","apple":"assets/icons/brands/apple.png", "samsung":"assets/icons/brands/samsung.png", "google":"assets/icons/brands/google.png", "honor":"assets/icons/brands/honor.png", "huawei":"assets/icons/brands/huawei.png", "oneplus":"assets/icons/brands/oneplus.png", "realme":"assets/icons/brands/realme.png", "lenovo":"assets/icons/brands/lenovo.png", "asus":"assets/icons/brands/asus.png", "hp":"assets/icons/brands/hp.png", "dell":"assets/icons/brands/dell.png", "acer":"assets/icons/brands/acer.png", "msi":"assets/icons/brands/msi.png", "ps":"assets/icons/brands/ps.png", "xbox":"assets/icons/brands/xbox.png", "switch":"assets/icons/brands/switch.png", "steam":"assets/icons/brands/steam.png"};
const BRAND_LOGO={"Xiaomi":"xiaomi","Xiaomi Pad":"xiaomi","Apple": "apple", "Samsung": "samsung", "Google Pixel": "google", "Honor": "honor", "Huawei": "huawei", "OnePlus": "oneplus", "Realme": "realme", "Apple MacBook": "apple", "Lenovo": "lenovo", "ASUS": "asus", "HP": "hp", "Dell": "dell", "Acer": "acer", "MSI": "msi", "Apple iPad": "apple", "Samsung Galaxy Tab": "samsung", "Lenovo Tab": "lenovo", "Huawei MatePad": "huawei", "Honor Pad": "honor", "Sony PlayStation": "ps", "Microsoft Xbox": "xbox", "Nintendo Switch": "switch", "Valve Steam Deck": "steam"};
TYPES.forEach(t=>CATALOG[t].brands.forEach(b=>{ const k=BRAND_LOGO[b.n]; if(k&&!b.logo) b.logo=LOGO[k]; }));
/* ===== навигация и окна ===== */
function go(v,push=true){
  if(!document.getElementById('v-'+v)) v='home';
  $$('.view').forEach(el=>el.hidden=el.dataset.view!==v);
  $$('.k-tabbar [data-go], .top-links [data-go]').forEach(b=>{ if(b.dataset.go===v) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
  if(push){ try{history.replaceState(null,'','#'+v)}catch(e){} }
  window.scrollTo({top:0,behavior:push?'smooth':'auto'});
  if(window.scrollFx) scrollFx.refresh();
  requestAnimationFrame(()=>{ if(v==='reviews'){ renderDots(); if(window.rvMarkLong) rvMarkLong(); const b=document.querySelector('#rvFilter [aria-pressed="true"]'), ind=document.querySelector('#rvFilter .rv-ind'); if(b&&ind){ ind.style.width=b.offsetWidth+'px'; ind.style.transform=`translateX(${b.offsetLeft-4}px)`; } } animateIn(document.getElementById('v-'+v)); });
}
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-close]'); if(c){ const d=c.closest('dialog'); d&&d.close(); }
  const o=e.target.closest('[data-open]'); if(o){ openModal(o.dataset.open); }
  const b=e.target.closest('[data-go]'); if(b) go(b.dataset.go);
});
function openModal(id){ const d=document.getElementById(id); if(!d) return; try{d.showModal()}catch(e){d.setAttribute('open','')} }
$$('dialog.modal').forEach(d=>d.addEventListener('click',e=>{ if(e.target===d) d.close(); }));

/* фото услуг (телефоны, по порядку услуг) */
const SVC_IMG={phone:["assets/img/services/phone/01.jpg","assets/img/services/phone/02.jpg","assets/img/services/phone/03.jpg","assets/img/services/phone/04.jpg","assets/img/services/phone/05.jpg","assets/img/services/phone/06.jpg","assets/img/services/phone/07.jpg","assets/img/services/phone/08.jpg","assets/img/services/phone/09.jpg","assets/img/services/phone/10.jpg","assets/img/services/phone/11.jpg","assets/img/services/phone/12.jpg","assets/img/services/phone/13.jpg","assets/img/services/phone/14.jpg","assets/img/services/phone/15.jpg","assets/img/services/phone/16.jpg","assets/img/services/phone/17.jpg","assets/img/services/phone/18.jpg","assets/img/services/phone/19.jpg","assets/img/services/phone/20.jpg","assets/img/services/phone/21.jpg","assets/img/services/phone/22.jpg","assets/img/services/phone/23.jpg","assets/img/services/phone/24.jpg"],laptop:["assets/img/services/laptop/01.jpg","assets/img/services/laptop/02.jpg","assets/img/services/laptop/03.jpg","assets/img/services/laptop/04.jpg","assets/img/services/laptop/05.jpg","assets/img/services/laptop/06.jpg","assets/img/services/laptop/07.jpg","assets/img/services/laptop/08.jpg","assets/img/services/laptop/09.jpg","assets/img/services/laptop/10.jpg","assets/img/services/laptop/11.jpg","assets/img/services/laptop/12.jpg"],tablet:["assets/img/services/tablet/01.jpg","assets/img/services/tablet/02.jpg","assets/img/services/tablet/03.jpg","assets/img/services/tablet/04.jpg","assets/img/services/tablet/05.jpg","assets/img/services/tablet/06.jpg","assets/img/services/tablet/07.jpg","assets/img/services/tablet/08.jpg","assets/img/services/tablet/09.jpg","assets/img/services/tablet/10.jpg","assets/img/services/tablet/11.jpg","assets/img/services/tablet/12.jpg"],console:["assets/img/services/console/01.jpg","assets/img/services/console/02.jpg","assets/img/services/console/03.jpg","assets/img/services/console/04.jpg","assets/img/services/console/05.jpg","assets/img/services/console/06.jpg","assets/img/services/console/07.jpg","assets/img/services/console/08.jpg","assets/img/services/console/09.jpg","assets/img/services/console/10.jpg","assets/img/services/console/11.jpg","assets/img/services/console/12.jpg"]};
/* ===== услуги ===== */
const svc={type:'phone',brand:'Apple',cat:null};
function svcCats(){ return Object.entries(CATALOG[svc.type].cats).filter(([,c])=>c.items.some(it=>!it.hidden)).map(([n])=>n); }
/* фото услуги: своё (загружено через бота) или исходное по порядку */
function svcImg(type,name){ const o=SITE.imgs?.[type]?.[name]; if(o) return o; const m=(window._bimg=window._bimg||{}); if(!m[type]){ m[type]={}; let i=0; Object.values(CATALOG[type].cats).forEach(c=>c.items.forEach(it=>{ if(!it.added) m[type][it[0]]=i++; })); } const j=m[type][name]; return j==null?null:(SVC_IMG[type]||[])[j]; }
const slug=c=>'cat-'+svcCats().indexOf(c);
function renderSvcBars(){
  $('#types').innerHTML=TYPES.map(t=>`<button type="button" data-t="${t}" aria-pressed="${t===svc.type}">${ico(CATALOG[t].ico)}<span>${CATALOG[t].name}</span></button>`).join('');
  $('#brands').innerHTML=CATALOG[svc.type].brands.map(b=>`<button type="button" class="dd-item" role="option" data-b="${esc(b.n)}" aria-selected="${b.n===svc.brand}"><span class="dd-nm">${b.logo?`<span class="dd-logo"><img src="${b.logo}" alt=""></span>`:`<span class="dd-logo">${esc(b.n[0])}</span>`}${esc(b.n)}</span>${b.n===svc.brand?ico('check'):''}</button>`).join('');
  { const bb=CATALOG[svc.type].brands.find(x=>x.n===svc.brand)||{n:svc.brand}; $('#ddSvcBrand .dd-v').innerHTML=`<span class="dd-nm">${bb.logo?`<span class="dd-logo"><img src="${bb.logo}" alt=""></span>`:''}${esc(svc.brand)}</span>`; }
  const cs=svcCats(); if(!cs.includes(svc.cat)) svc.cat=cs[0];
  $('#cats').innerHTML=cs.map(c=>`<button type="button" data-c="${c}" aria-pressed="${c===svc.cat}">${ico(CATALOG[svc.type].cats[c].i,'ico cat-ico')}${c}</button>`).join('');
  if(typeof closeDD==='function') closeDD();
}
function markCat(){
  $$('#cats [data-c]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.c===svc.cat));
  const on=$('#cats [aria-pressed="true"]'), bar=$('#cats');
  if(on) bar.scrollTo({left:on.offsetLeft-bar.clientWidth/2+on.offsetWidth/2,behavior:'smooth'});
}
function renderDishes(){
  const T=CATALOG[svc.type], k=brandOf(svc.type,svc.brand).k;
  const vis=svcCats();
  $('#dishes').innerHTML=Object.entries(T.cats).filter(([c])=>vis.includes(c)).map(([c,{i,items}],ci)=>`<section class="svc-sec" id="${slug(c)}">
    <h3 class="svc-h"><span class="badge c-${tones[ci%4]}">${ico(i)}</span>${c}</h3>
    <div class="svc-list">${items.map((it,j)=>{ if(it.hidden) return ''; const [n,p,t,w,inc]=it; const img=svcImg(svc.type,n); return `<article class="svc-row" tabindex="0" aria-expanded="false">
      <div class="svc-photo">${img?`<img class="svc-img" src="${img}" alt="${esc(n)}" loading="lazy" decoding="async">`:`<div class="svc-ph">${ico(i)}<span>Фото</span></div>`}
        <div class="svc-pop"><ul class="svc-meta">
          <li><span>${ico('clock')}Срок</span><span>${t}</span></li>
          <li><span>${ico('shield')}Гарантия</span><span>${w}</span></li>
          <li class="inc"><span>${inc}</span></li>
        </ul><button type="button" class="btn primary sm svc-book" data-svc="${esc(n)}" data-c="${esc(c)}" data-j="${j}">${ico('cal')}Записаться</button></div>
      </div>
      <div class="svc-main"><span class="svc-ico${img?' pic':''}">${img?`<img src="${img}" alt="" loading="lazy">`:ico(i)}</span><span class="svc-name">${n}</span><span class="svc-price">${p?`<small>от</small> ${money(p*k)}`:'Бесплатно'}</span><svg class="ico svc-chev"><use href="#i-chev"/></svg></div>
      <div class="svc-more"><div><div class="svc-det">
        <span>${ico('clock')}${t}</span>${w!=='—'?`<span>${ico('shield')}${w}</span>`:''}
        <p>${inc}</p>
        <button type="button" class="btn primary sm svc-book" data-svc="${esc(n)}" data-c="${esc(c)}" data-j="${j}">${ico('cal')}Записаться</button>
      </div></div></div>
    </article>`;}).join('')}</div></section>`).join('');
}
function setSvc(type,brand){ svc.type=type; svc.brand=brand||CATALOG[type].brands[0].n; svc.cat=null; renderSvcBars(); renderDishes(); }
$('#types').addEventListener('click',e=>{const b=e.target.closest('[data-t]'); if(b&&b.dataset.t!==svc.type) setSvc(b.dataset.t);});
$('#brands').addEventListener('click',e=>{const b=e.target.closest('[data-b]'); if(!b)return; svc.brand=b.dataset.b; renderSvcBars(); renderDishes();});
let catLock=0;
$('#cats').addEventListener('click',e=>{const b=e.target.closest('[data-c]'); if(!b)return; svc.cat=b.dataset.c; markCat();
  const el=document.getElementById(slug(svc.cat)); const y=el.getBoundingClientRect().top+scrollY-(innerWidth<=900?128:150);
  catLock=Date.now()+900; window.scrollTo({top:y,behavior:'smooth'}); });
$('#dishes').addEventListener('click',e=>{
  const bk2=e.target.closest('.svc-book');
  if(bk2){ const c=bk2.dataset.c,j=+bk2.dataset.j,n=bk2.dataset.svc; const hit=CATALOG[svc.type].issues.find(x=>x[1]===c&&x[2]===j);
    setBook({type:svc.type,brand:svc.brand,model:'',issues:[hit?hit[0]:n],extra:hit?[]:[[n,c,j]]}); $('#bProblem').value=''; $('#bProblem').hidden=true; $('#bOwn').classList.remove('on'); renderSummary(); go('book'); setBStep(1); return; }
  const d=e.target.closest('.svc-row'); if(!d)return; const was=d.classList.contains('open');
  $$('.svc-row.open').forEach(x=>{x.classList.remove('open');x.setAttribute('aria-expanded','false');});
  if(!was){ d.classList.add('open'); d.setAttribute('aria-expanded','true'); }
});
$('#dishes').addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target.classList.contains('svc-row')) e.target.click(); });
addEventListener('scroll',()=>{ if($('#v-menu').hidden||Date.now()<catLock) return; let cur=svcCats()[0]; svcCats().forEach(c=>{ const el=document.getElementById(slug(c)); if(el&&el.getBoundingClientRect().top<(innerWidth<=900?150:180)) cur=c; }); if(cur!==svc.cat){ svc.cat=cur; markCat(); } },{passive:true});

/* ===== калькулятор ===== */
const calc={type:'phone',brand:'Apple',issues:[0]};
function chipRow(el,list,cur,attr){ el.innerHTML=list.map((v,i)=>`<button type="button" class="chip" data-${attr}="${i}" aria-pressed="${i===cur}">${esc(v)}</button>`).join(''); }
function renderCalc(){
  const T=CATALOG[calc.type];
  chipRow($('#cType'),TYPES.map(t=>CATALOG[t].name),TYPES.indexOf(calc.type),'ct');
  chipRow($('#cBrand'),T.brands.map(b=>b.n),T.brands.findIndex(b=>b.n===calc.brand),'cb');
  $('#cIssue').innerHTML=T.issues.map((x,i)=>`<button type="button" class="chip" data-ci="${i}" aria-pressed="${calc.issues.includes(i)}">${esc(x[0])}</button>`).join('');
  const k=brandOf(calc.type,calc.brand).k;
  const list=calc.issues.map(i=>{const [,c,j]=T.issues[i]; return T.cats[c].items[j];});
  $('#cRes').classList.toggle('show',list.length>0);
  if(!list.length) return;
  const tot=list.reduce((a,x)=>{const r=priceRange(x[1],k); return {lo:a.lo+r.lo,hi:a.hi+r.hi};},{lo:0,hi:0});
  $('#cSvc').innerHTML=list.length>1?list.map(x=>`<div class="c-row"><span>${esc(x[0])}</span><b>${rangeText(priceRange(x[1],k))}</b></div>`).join(''):`<div class="c-one">${esc(list[0][0])}</div>`;
  $('#cPrice').textContent=rangeText(tot);
  $('#cMeta').hidden=list.length>1;
  $('#cTime').textContent=list[0][2]; $('#cWar').textContent='Гарантия '+list[0][3];
  $('#cBook').lastChild.textContent=list.length>1?'Записаться на эти ремонты':'Записаться на этот ремонт';
}
$('#cType').addEventListener('click',e=>{const b=e.target.closest('[data-ct]'); if(!b)return; calc.type=TYPES[+b.dataset.ct]; calc.brand=CATALOG[calc.type].brands[0].n; calc.issues=[0]; renderCalc();});
$('#cBrand').addEventListener('click',e=>{const b=e.target.closest('[data-cb]'); if(!b)return; calc.brand=CATALOG[calc.type].brands[+b.dataset.cb].n; renderCalc();});
$('#cIssue').addEventListener('click',e=>{const b=e.target.closest('[data-ci]'); if(!b)return; const v=+b.dataset.ci; calc.issues=calc.issues.includes(v)?calc.issues.filter(x=>x!==v):[...calc.issues,v]; renderCalc();});
$('#cBook').addEventListener('click',()=>{ $('#calcModal').close(); setBook({type:calc.type,brand:calc.brand,issues:calc.issues.map(i=>CATALOG[calc.type].issues[i][0]),model:''}); go('book'); });
renderCalc();

/* статус ремонта */
const stages=[['Принят','box'],['В ремонте','wrench'],['Готов к выдаче','check']];
const ST_IDX={new:0,repair:1,done:2,issued:2};
var ORDER_ST={}; /* статусы заказов с сервера */
const demo={'RM-2481':['iPhone 15 Pro','Замена дисплея',1],'RM-1043':['Galaxy S24','Замена аккумулятора',2],'RM-3307':['Redmi Note 13','Чистка после воды',0]};
function localStage(date,time){ if(!date) return 0; const n=spbNow(); const [h,m]=String(time||'00:00').split(':').map(Number); const t=fromIso(date); t.setHours(h,m||0,0,0); return n>=t?1:0; }
function orderState(num){
  const sv=ORDER_ST[num]; if(sv) return {s:sv.s, stage:sv.s==='cancelled'?-1:ST_IDX[sv.s]??0, closed:sv.s==='issued', date:sv.date, time:sv.time};
  const r=(typeof receipts!=='undefined'?receipts:[]).find(x=>x.num===num&&!x.demo);
  if(r) return r.cancelled?{s:'cancelled',stage:-1}:{s:'local', stage:localStage(r.date,r.time), date:r.date, time:r.time};
  if(demo[num]) return {s:'demo', stage:demo[num][2]};
  return null;
}
async function fetchStatus(nums){
  if(!ORDER_API||!nums.length) return;
  try{ const r=await fetch(api('/status?n='+encodeURIComponent(nums.join(','))),{cache:'no-store'}); if(r.ok){ Object.assign(ORDER_ST,await r.json()); } }catch(e){}
}
function renderStatus(num){
  const st=orderState(num), d=demo[num]||[ORDER_ST[num]?.device||'Заказ',ORDER_ST[num]?.services||''];
  if(!st){ $('#stErr').textContent='Заказ не найден. Проверьте номер в квитанции.'; $('#stErr').hidden=false; $('#stOut').innerHTML=''; return; }
  const head=`<div class="order-card"><span class="badge c-accent">${ico('device')}</span><div style="display:flex;flex-direction:column"><b>${num} · ${esc(String(d[0]).replace(/^(Телефон|Ноутбук|Планшет|Консоль)\s+/,''))}</b><span>${esc(d[1]||'')}</span></div></div>`;
  if(st.stage<0){ $('#stOut').innerHTML=head+`<div class="st-cancel">${ico('x')}<div><b>Заказ отменён</b><span>Если это ошибка — позвоните нам.</span></div></div>`; return; }
  const when=st.date?`${human(st.date)}, ${st.time}`:'';
  const fin=st.closed?3:st.stage;
  $('#stOut').innerHTML=head+(st.closed?`<div class="st-closed">${ico('check')}<div><b>Заказ завершён</b><span>Техника выдана. Спасибо, что выбрали нас!</span></div></div>`:'')+`<ul class="steps${st.closed?' is-closed':''}" style="margin-top:14px">${stages.map(([n,i],k)=>`<li class="${k<fin?'passed':k===fin?'now':''}"><span class="dot">${ico(k<fin?'check':i)}</span><span>${n}</span><time>${k===0&&when?esc(when):k===1&&st.stage>=1&&when?'с '+esc(st.time):''}</time></li>`).join('')}</ul>`;
}
$('#stForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const raw=$('#stNum').value.trim().toUpperCase().replace(/\s/g,''); const num=/^\d{4}$/.test(raw)?'RM-'+raw:raw;
  const err=$('#stErr');
  if(!/^RM-\d{4}$/.test(num)){ err.textContent='Номер выглядит как RM и четыре цифры, например RM-2481. Он есть в квитанции.'; err.hidden=false; $('#stOut').innerHTML=''; return; }
  err.hidden=true;
  await fetchStatus([num]); renderStatus(num);
});

/* отзывы */
/* отзывы импортированы из 2ГИС: https://2gis.ru/spb/firm/70000001113686140/tab/reviews */
const reviews=[
  ["Кристина Дрямова", 5, "Сделали очень качественно ремонт, и очень удивилась что мастер который до этого работал в ленте сейчас тут , с уверенностью могу сказать что Натик это лучший мастер , очень вежливый , и грамотно все объясняет"],
  ["Елизавета Александрова", 5, "Отличная мастерская! Поменяли экран и аккумулятор на моем любимом айфоне быстро и качественно! Мастер Натик очень вежливый и компетентный специалист 👍"],
  ["Городской житель", 5, "Сделали качественно и быстро, дешевле чем в других сервисах"],
  ["Орхан Хагвердиев", 5, "Отличный мастер, приятное место, сделали ремонт быстро и не дорого"],
  ["Людмила Голубенко", 5, "Очень крутой сервис ,качественно ,быстро ,не дорого,отдельное спасибо Натику ,замечательный мастер и что хочу заметить ,очень красивая мастерская ,советую"],
  ["Елизавета", 5, "Мастер Натик настоящий профессионал своего дела. Ремонтировала айфон, качество без нареканий. Если буду ещё обращаться, то только сюда)"],
  ["Дмитрий", 5, "Отличная мастерская. Меняли дисплей на телефоне, все сделали быстро и качественно и цены адекватные. Большой плюс что рядом с домом и не надо далеко ходить. Спасибо."],
  ["Светлана Белинская", 5, "Так удобно! Мастерская открылась недалеко от моего дома. Обратилась к мастеру Натику и осталась очень довольна. Сделал быстро, все объяснил, а самое главное, что цены доступные!"],
  ["Гулина Жангазиева", 5, "Огромное спасибо Натику! Обратилась с заменой экрана на телефон и почистить ноутбук. Все было выполнено качественно и быстро! Советую"],
  ["Мария Игнатова", 5, "Спасибо большое! Обратилась чтобы заменить разбитый экран на 11 айфоне, предложили и сменить батарею на новую. Всем довольна, цены адекватные, мастер все рассказал, показал, дал рекомендации. Однозначно рекомендую 👍"],
  ["Нина Ковалева", 5, "Лучший сервис в городе. Мастера не пытаются \"развести\" на дорогой ремонт, говорят всё как есть. Делают быстро, аккуратно и, главное, на совесть. Ремонтировала здесь уже второй телефон, и снова убеждаюсь, что ребятам можно доверять на 100%. Спасибо за профессионализм и честное отношение к клиентам!"],
  ["Валерия Ярош", 5, "Заменили дисплей качественно и по ценам все доступно. Спасибо мастеру Натику."]
].map(r=>({n:r[0],s:r[1],t:r[2],src:'2gis'}));
const stars=n=>[1,2,3,4,5].map(i=>`<svg class="ico ${i>n?'off':''}"><use href="#i-star"/></svg>`).join('');
const track=$('#reviews');
const step=()=>{const r=track.querySelector('.review'); return r? r.offsetWidth+16 : 1;};
const perView=()=>Math.max(1,Math.round((track.clientWidth+16)/step()));
const pages=()=>Math.max(1,Math.ceil(reviews.length/perView()));
const curPage=()=>Math.round(track.scrollLeft/(step()*perView()));
function renderDots(){
  const n=pages(), c=Math.min(curPage(),n-1);
  $('#dots').innerHTML=Array.from({length:n},(_,i)=>`<button type="button" class="${i===c?'on':''}" data-pg="${i}" aria-label="Страница ${i+1}"></button>`).join('');
  $('#prev').disabled=track.scrollLeft<4;
  $('#next').disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-4;
}
const toPage=i=>track.scrollTo({left:i*step()*perView(),behavior:'smooth'});
function renderReviews(){
  const all=[0,0,0,0,0,0]; reviews.forEach(r=>all[r.s]++);
  const total=all.reduce((a,b)=>a+b,0), mean=all.reduce((a,c,i)=>a+c*i,0)/total;
  $('#avg').textContent=mean.toFixed(1).replace('.',','); $('#topAvg').textContent=mean.toFixed(1).replace('.',',');
  $('#avgStars').innerHTML=stars(Math.round(mean));
  $('#bars').innerHTML=[5,4,3,2,1].map(i=>`<div class="bar"><span>${i}</span><div><i style="width:${(all[i]/total*100).toFixed(1)}%"></i></div><span>${Math.round(all[i]/total*100)}%</span></div>`).join('');
  track.innerHTML=reviews.map((r,k)=>`<article class="review">${ico('quote','ico q')}<p>${r.t}</p><div class="who"><span class="ava c-${tones[k%4]}">${r.n[0]}</span><div class="who-meta"><h3>${r.n}</h3><div class="stars">${stars(r.s)}</div></div></div></article>`).join('');
  renderDots();
}
$('#prev').onclick=()=>toPage(Math.max(0,curPage()-1));
$('#next').onclick=()=>toPage(Math.min(pages()-1,curPage()+1));
$('#dots').addEventListener('click',e=>{const b=e.target.closest('[data-pg]'); if(b) toPage(+b.dataset.pg)});
track.addEventListener('scroll',()=>{clearTimeout(track._t);track._t=setTimeout(renderDots,80)},{passive:true});
addEventListener('resize',renderDots);
let pickVal=5;
function renderPick(){ $('#pick').innerHTML=[1,2,3,4,5].map(i=>`<button type="button" role="radio" aria-checked="${i===pickVal}" aria-label="${i}" class="${i<=pickVal?'on':''}" data-p="${i}"><svg class="ico"><use href="#i-star"/></svg></button>`).join(''); }
$('#pick').addEventListener('click',e=>{const b=e.target.closest('[data-p]'); if(b){pickVal=+b.dataset.p; renderPick();}});
/* отзыв только по номеру заказа */
const reviewed=new Set();
const normOrder=v=>{ const d=String(v).toUpperCase().replace(/[^0-9]/g,''); return d.length===4?'RM-'+d:''; };
function checkOrder(){
  const num=normOrder($('#revOrder').value), err=$('#revErr');
  const ok=!!num&&!!demo[num]&&!reviewed.has(num);
  $('#revOrder').closest('.ord-wrap').classList.toggle('ok',ok);
  $('#revText').disabled=!ok; $('#revSend').disabled=!ok;
  if(num&&!demo[num]){ err.textContent='Заказ не найден. Проверьте номер в квитанции.'; err.hidden=false; }
  else if(num&&reviewed.has(num)){ err.textContent='По этому заказу отзыв уже оставлен.'; err.hidden=false; }
  else err.hidden=true;
  return ok?num:null;
}
$('#revOrder').addEventListener('input',checkOrder);
$('#revForm').addEventListener('submit',e=>{
  e.preventDefault(); const num=checkOrder(); if(!num){ $('#revOrder').focus(); return; }
  const t=$('#revText'); if(!t.value.trim()){t.classList.add('err');t.focus();return;}
  t.classList.remove('err'); reviews.unshift({n:$('#revName').value.trim()||'Клиент',s:pickVal,t:t.value.trim()});
  reviewed.add(num);
  t.value=''; $('#revName').value=''; $('#revOrder').value=''; checkOrder(); renderReviews(); track.scrollTo({left:0,behavior:'smooth'});
});
renderPick(); renderReviews();

/* карта */
const SHOP={n:'GEZA SERVICE',a:'Новосельковская улица, 3',sub:'Коломяги, Приморский район, Санкт-Петербург, 197375',h:'Ежедневно 10:00–21:00',p:'+7 (915) 227-59-92',lat:60.028102,lon:30.293247,firm:'70000001113686140'};
const MAP_LINKS=[
  ['2ГИС',`https://2gis.ru/spb/firm/${SHOP.firm}`],
  ['Яндекс Карты',`https://yandex.ru/maps/?pt=${SHOP.lon},${SHOP.lat}&z=17&l=map`],
  ['Google Maps',`https://www.google.com/maps/search/?api=1&query=${SHOP.lat},${SHOP.lon}`]
];
const places=[SHOP];
function renderPlaces(){
  $('#places').innerHTML=`<div class="place active"><span class="badge c-accent">${ico('wrench')}</span><div style="min-width:0">
    <h3>${SHOP.n}</h3>
    <div class="rows"><span>${ico('pin')}<b class="addr">${SHOP.a}</b><button type="button" class="copy-btn" data-copy="${SHOP.a}, Санкт-Петербург" aria-label="Скопировать адрес">${ico('copy')}</button></span><span class="sub">${SHOP.sub}</span><span>${ico('clock')}${SHOP.h}</span><span class="open-now sm" data-open-now><i></i><span class="on-st">Открыто</span><span class="on-t">до 21:00</span></span><a class="tel" href="tel:${SHOP.p.replace(/[^+\d]/g,'')}">${ico('phone')}${SHOP.p}</a></div>
    <a class="btn primary sm route" href="https://2gis.ru/spb/directions/points/%7C${SHOP.lon}%2C${SHOP.lat}%3B${SHOP.firm}" target="_blank" rel="noopener">${ico('route')}Построить маршрут</a>
    <div class="map-links">${MAP_LINKS.map(([n,u])=>`<a href="${u}" target="_blank" rel="noopener">${n}${ico('arrow')}</a>`).join('')}</div>
  </div></div>`;
}
(function initMap(){
  const host=location.hostname||'';
  const canEmbed=/^https?:$/.test(location.protocol)&&!/claude|anthropic/i.test(host);
  if(canEmbed){
    const f=$('#mapFrame');
    f.src='https://widgets.2gis.com/widget?type=firmsonmap&options='+encodeURIComponent(JSON.stringify({pos:{lat:SHOP.lat,lon:SHOP.lon,zoom:17},opt:{city:'spb'},org:SHOP.firm}));
    f.hidden=false; $('#mapFallback').hidden=true;
  }
})();
renderPlaces();

/* живые отзывы из 2ГИС: подгружаются при открытии сайта, новые появляются сами */
(async function live2gis(){
  if(!/^https?:$/.test(location.protocol)||/claude|anthropic/i.test(location.hostname)) return;
  const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  try{
    const ctl=new AbortController(); setTimeout(()=>ctl.abort(),9000);
    const u=`https://public-api.reviews.2gis.com/2.0/branches/${SHOP.firm}/reviews?limit=50&is_advertiser=false&fields=meta.branch_rating,meta.branch_reviews_count,meta.total_count&sort_by=date_created&locale=ru_RU&key=37c04fe6-a560-4549-b459-02309cf643ad`;
    const r=await fetch(u,{signal:ctl.signal}); if(!r.ok) return;
    const j=await r.json();
    const list=(j.reviews||[]).filter(x=>x&&x.text&&x.rating).map(x=>({n:esc((x.user&&x.user.name)||'Клиент 2ГИС'),s:Math.max(1,Math.min(5,Math.round(+x.rating))),t:esc(x.text.trim()),src:'2gis'}));
    if(!list.length) return;
    const own=reviews.filter(x=>x.src!=='2gis');
    reviews.length=0; reviews.push(...own,...list);
    renderReviews(); try{ renderRvM(); }catch(e){}
  }catch(e){}
})();



/* ===== запись: выбор устройства ===== */
const bk={more:[],contact:'call',tg:'',extra:[],type:'phone',brand:'Apple',model:'',issues:[],services:[],service:null,date:null,time:null,name:'',phone:'',order:null};
const WD=['вс','пн','вт','ср','чт','пт','сб'];
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const fromIso=s=>{const [y,m,d]=String(s).split('-').map(Number); return new Date(y,m-1,d);};
const human=s=>{const d=fromIso(s); return d.toLocaleDateString('ru-RU',{weekday:'short',day:'numeric',month:'long'});};
const booked=new Set();
/* общее состояние с сервера: занятое время, закрытие, цены */
var SITE={closed:false,closedMsg:'',busy:{}};
/* время сайта — Санкт-Петербург (МСК) */
function spbNow(){ try{ return new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Moscow'})); }catch(e){ return new Date(); } }
function slotsFor(dateIso){
  const d=fromIso(dateIso); if(isNaN(d)) return null;
  const today=spbNow(); today.setHours(0,0,0,0);
  const diff=Math.round((d-today)/864e5); if(diff<0||diff>30) return null;
  const all=['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];
  if(SITE.closed) return [];
  const nowH=spbNow().getHours(); const busy=SITE.busy[dateIso]||[];
  return all.filter(t=>!busy.includes(t) && !booked.has(dateIso+' '+t) && !(diff===0&&parseInt(t)<=nowH));
}
function nextDays(n=7){ const out=[]; const d=spbNow(); for(let i=0;i<n;i++){ const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+i); out.push(iso(x)); } return out; }
const dayLabel=s=>{const i=nextDays(2).indexOf(s); return i===0?'Сегодня':i===1?'Завтра':(()=>{const d=fromIso(s);return `${WD[d.getDay()]}, ${d.getDate()} ${d.toLocaleDateString('ru-RU',{month:'short'}).replace('.','')}`;})();};


/* модели для выбора в записи */
const MODELS={
  phone:{'Apple':['iPhone 18 Pro Max','iPhone 18 Pro','iPhone 17 Pro Max','iPhone 17 Pro','iPhone 17','iPhone Air','iPhone 17e','iPhone 16 Pro Max','iPhone 16 Pro','iPhone 16 Plus','iPhone 16','iPhone 16e','iPhone 15 Pro Max','iPhone 15 Pro','iPhone 15 Plus','iPhone 15','iPhone 14 Pro Max','iPhone 14 Pro','iPhone 14 Plus','iPhone 14','iPhone 13 Pro Max','iPhone 13 Pro','iPhone 13','iPhone 13 mini','iPhone 12 Pro Max','iPhone 12 Pro','iPhone 12','iPhone 12 mini','iPhone SE 2022','iPhone 11 Pro Max','iPhone 11 Pro','iPhone 11','iPhone XR','iPhone XS'],
    'Samsung':['Galaxy S25 Ultra','Galaxy S25 Edge','Galaxy S25+','Galaxy S25','Galaxy S25 FE','Galaxy S24 Ultra','Galaxy S24+','Galaxy S24','Galaxy S24 FE','Galaxy S23 Ultra','Galaxy S23','Galaxy S23 FE','Galaxy S22 Ultra','Galaxy S22','Galaxy Z Fold7','Galaxy Z Flip7','Galaxy Z Fold6','Galaxy Z Flip6','Galaxy Z Fold5','Galaxy Z Flip5','Galaxy A56','Galaxy A55','Galaxy A54','Galaxy A36','Galaxy A35','Galaxy A26','Galaxy A25','Galaxy A16','Galaxy A15','Galaxy M55'],
    'Xiaomi':['Xiaomi 15 Ultra','Xiaomi 15','Xiaomi 15T Pro','Xiaomi 15T','Xiaomi 14 Ultra','Xiaomi 14','Xiaomi 14T Pro','Xiaomi 14T','Xiaomi 13T','Redmi Note 14 Pro+','Redmi Note 14 Pro','Redmi Note 14','Redmi Note 13 Pro+','Redmi Note 13 Pro','Redmi Note 13','Redmi Note 12','Redmi 14C','Redmi 13','Redmi 13C','Poco F7 Pro','Poco F7','Poco F6 Pro','Poco F6','Poco X7 Pro','Poco X7','Poco X6 Pro','Poco M6 Pro'],
    'Google Pixel':['Pixel 10 Pro XL','Pixel 10 Pro','Pixel 10','Pixel 9 Pro Fold','Pixel 9 Pro XL','Pixel 9 Pro','Pixel 9','Pixel 9a','Pixel 8 Pro','Pixel 8','Pixel 8a','Pixel 7 Pro','Pixel 7','Pixel 7a','Pixel 6 Pro','Pixel 6'],
    'Honor':['Honor Magic7 Pro','Honor Magic6 Pro','Honor Magic V3','Honor 400 Pro','Honor 400','Honor 200 Pro','Honor 200','Honor 90','Honor X9c','Honor X9b','Honor X8c','Honor X8b','Honor X7c','Honor X6b'],
    'Huawei':['Pura 70 Ultra','Pura 70 Pro','Pura 70','Mate X6','Mate 60 Pro','nova 13 Pro','nova 13','nova 12 SE','nova 12s','nova 11','nova Y72','nova Y91','P60 Pro'],
    'OnePlus':['OnePlus 13','OnePlus 13R','OnePlus 12','OnePlus 12R','OnePlus 11','OnePlus Open','OnePlus Nord 4','OnePlus Nord CE4','OnePlus Nord CE4 Lite','OnePlus Nord 3'],
    'Realme':['Realme GT 7 Pro','Realme GT 6','Realme 14 Pro+','Realme 14 Pro','Realme 13 Pro+','Realme 13 Pro','Realme 12 Pro+','Realme 12','Realme C75','Realme C67','Realme C61','Realme Note 60']},
  laptop:{'Apple MacBook':['MacBook Air 13 M4','MacBook Air 15 M4','MacBook Air 13 M3','MacBook Air 15 M3','MacBook Air 13 M2','MacBook Air 15 M2','MacBook Air M1','MacBook Pro 14 M4 Pro','MacBook Pro 14 M4','MacBook Pro 16 M4 Pro','MacBook Pro 14 M3','MacBook Pro 16 M3','MacBook Pro 14 M2','MacBook Pro 16 M2','MacBook Pro 13 M2','MacBook Pro 14 M1','MacBook Pro 16 M1','MacBook Pro 13 M1','MacBook Pro 13 Intel','MacBook Air Intel'],
    'Lenovo':['IdeaPad Slim 3','IdeaPad Slim 5','IdeaPad Pro 5','IdeaPad Gaming 3','ThinkPad E14','ThinkPad E16','ThinkPad T14','ThinkPad T16','ThinkPad X1 Carbon','ThinkPad L14','ThinkBook 14','ThinkBook 16','Legion 5','Legion 5 Pro','Legion 7','Legion Pro 7','LOQ 15','Yoga 7','Yoga Slim 7','Yoga Pro 9'],
    'ASUS':['Zenbook 14 OLED','Zenbook S 14','Zenbook Duo','Vivobook 15','Vivobook 16','Vivobook S 15','Vivobook Go 15','ROG Strix G16','ROG Strix SCAR 18','ROG Zephyrus G14','ROG Zephyrus G16','ROG Flow X13','TUF Gaming A15','TUF Gaming F15','ExpertBook B1'],
    'HP':['Pavilion 15','Pavilion Plus 14','Pavilion x360','HP 15s','HP 250 G9','Victus 15','Victus 16','OMEN 16','OMEN Transcend 14','EliteBook 840','EliteBook 860','ProBook 450','Envy x360','Spectre x360'],
    'Dell':['Inspiron 15 3520','Inspiron 15 3530','Inspiron 14','Inspiron 16','XPS 13','XPS 14','XPS 15','XPS 16','Latitude 5440','Latitude 5540','Latitude 7440','Vostro 15','Vostro 14','G15 Gaming','Alienware m16','Alienware x16'],
    'Acer':['Aspire 3','Aspire 5','Aspire 7','Aspire Go 15','Swift Go 14','Swift Go 16','Swift X 14','Nitro V 15','Nitro 5','Nitro 16','Predator Helios Neo 16','Predator Helios 16','Predator Helios 18','Extensa 15','TravelMate P2'],
    'MSI':['Modern 14','Modern 15','Prestige 14','Thin GF63','Thin 15','Cyborg 15','Katana 15','Katana 17','Sword 16','Pulse 17','Crosshair 16','Vector 16','Stealth 16','Raider GE78','Titan 18'],
    'Huawei':['MateBook D 14','MateBook D 15','MateBook D 16','MateBook 14','MateBook 14s','MateBook 16s','MateBook X Pro','MateBook Fold']},
  tablet:{'Apple iPad':['iPad Pro 13 M4','iPad Pro 11 M4','iPad Pro 12.9 M2','iPad Pro 11 M2','iPad Air 13 M3','iPad Air 11 M3','iPad Air 13 M2','iPad Air 11 M2','iPad Air 5','iPad Air 4','iPad 11','iPad 10','iPad 9','iPad 8','iPad mini 7','iPad mini 6'],
    'Samsung Galaxy Tab':['Tab S10 Ultra','Tab S10+','Tab S10 FE+','Tab S10 FE','Tab S9 Ultra','Tab S9+','Tab S9','Tab S9 FE+','Tab S9 FE','Tab S8 Ultra','Tab S8','Tab S7 FE','Tab A9+','Tab A9','Tab A8','Tab A7 Lite'],
    'Xiaomi Pad':['Xiaomi Pad 7 Pro','Xiaomi Pad 7','Xiaomi Pad 6S Pro','Xiaomi Pad 6','Xiaomi Pad 5','Redmi Pad Pro','Redmi Pad 2','Redmi Pad SE','Redmi Pad SE 8.7','Poco Pad'],
    'Lenovo Tab':['Tab P12','Tab P11 Gen 2','Tab P11 Pro','Tab Plus','Tab M11','Tab M10 Plus Gen 3','Tab M10','Tab M9','Legion Tab','Yoga Tab 13'],
    'Huawei MatePad':['MatePad Pro 13.2','MatePad Pro 12.2','MatePad Pro 11','MatePad Air','MatePad 11.5 S','MatePad 11.5','MatePad 11','MatePad SE 11','MatePad SE 10.4','MatePad T10s'],
    'Honor Pad':['Honor MagicPad 2','Honor Pad 10','Honor Pad 9 Pro','Honor Pad 9','Honor Pad X9a','Honor Pad X9','Honor Pad X8a','Honor Pad X8']},
  console:{'Sony PlayStation':['PlayStation 5 Pro','PlayStation 5 Slim','PlayStation 5 Slim Digital','PlayStation 5','PlayStation 5 Digital','PlayStation Portal','PlayStation 4 Pro','PlayStation 4 Slim','PlayStation 4','PlayStation 3','PlayStation VR2','Геймпад DualSense Edge','Геймпад DualSense','Геймпад DualShock 4'],
    'Microsoft Xbox':['Xbox Series X','Xbox Series X Digital','Xbox Series S','Xbox One X','Xbox One S','Xbox One','Xbox 360','Геймпад Xbox Elite 2','Геймпад Xbox Series','Геймпад Xbox One'],
    'Nintendo Switch':['Switch 2','Switch OLED','Switch','Switch Lite','Joy-Con 2','Joy-Con','Pro Controller','Nintendo 3DS'],
    'Valve Steam Deck':['Steam Deck OLED 1 ТБ','Steam Deck OLED 512 ГБ','Steam Deck LCD 512 ГБ','Steam Deck LCD 256 ГБ','Steam Deck LCD 64 ГБ']}
};
const OTHER='Другая модель';
function getModel(){ return bk.model===OTHER?$('#bModel').value.trim():bk.model; }
function deviceText(){ const m=getModel(); return `${CATALOG[bk.type].one} ${m||bk.brand}`; }
function problemText(){ return [bk.issues.join(', '),$('#bProblem').value.trim()].filter(Boolean).join('. '); }
function renderBookPick(){
  const T=CATALOG[bk.type];
  $('#bType').innerHTML=TYPES.map(t=>`<button type="button" data-bt="${t}" aria-pressed="${t===bk.type}">${ico(CATALOG[t].ico)}${CATALOG[t].name}</button>`).join('');
  $('#bBrand').innerHTML=T.brands.map((b,i)=>`<button type="button" class="dd-item" role="option" data-bb="${i}" aria-selected="${b.n===bk.brand}"><span class="dd-nm">${b.logo?`<span class="dd-logo"><img src="${b.logo}" alt=""></span>`:`<span class="dd-logo">${esc(b.n[0])}</span>`}${esc(b.n)}</span>${b.n===bk.brand?ico('check'):''}</button>`).join('');
  { const bb=CATALOG[bk.type].brands.find(x=>x.n===bk.brand)||{n:bk.brand}; $('#ddBrand .dd-v').innerHTML=`<span class="dd-nm">${bb.logo?`<span class="dd-logo"><img src="${bb.logo}" alt=""></span>`:''}${esc(bk.brand)}</span>`; }
  $('#bIssue').innerHTML=bkIssues().map(([n])=>`<button type="button" class="chip" data-bi="${esc(n)}" aria-pressed="${bk.issues.includes(n)}">${esc(n)}</button>`).join('');
  const ms=[...(MODELS[bk.type]?.[bk.brand]||[]),OTHER];
  $('#bModels').innerHTML=ms.map(m=>`<button type="button" class="dd-item${m===OTHER?' other':''}" role="option" data-bm="${esc(m)}" aria-selected="${m===bk.model}">${esc(m)}${m===bk.model?ico('check'):''}</button>`).join('');
  const mv=$('#ddModel .dd-v'); mv.textContent=bk.model||'Выбрать'; mv.classList.toggle('ph',!bk.model);
  closeDD();
  $('#bModel').hidden=bk.model!==OTHER;
  renderSummary();
}
function renderSummary(){
  const m=getModel();
  $('#sType').textContent=CATALOG[bk.type].one;
  $('#sDev').textContent=m?`${bk.brand}, ${m}`:bk.brand;
  $('#sIssue').textContent=problemText()||'—';
  $('#sSvc').textContent=bk.services.length?(bk.services.map(x=>x.name).join(', ')+' · '+rangeText(totalRange(bk.services))):'—';
  $('#sDate').textContent=bk.date?human(bk.date):'—';
  $('#sTime').textContent=bk.time||'—';
  $('#sOrder').textContent=bk.order||'—';
  $('#sOrderRow').hidden=!bk.order;
}
function bkIssues(){ return [...CATALOG[bk.type].issues,...bk.extra]; }
function setBook(o){ if(!('extra' in o)) bk.extra=[]; Object.assign(bk,o); if(o.type&&!o.brand) bk.brand=CATALOG[o.type].brands[0].n; renderBookPick(); }
$('#bType').addEventListener('click',e=>{const b=e.target.closest('[data-bt]'); if(b){ setBook({type:b.dataset.bt,brand:null,issues:[],model:''}); bk.brand=CATALOG[bk.type].brands[0].n; renderBookPick(); }});
$('#bBrand').addEventListener('click',e=>{const b=e.target.closest('[data-bb]'); if(b){ bk.brand=CATALOG[bk.type].brands[+b.dataset.bb].n; bk.model=''; renderBookPick(); }});
$('#bIssue').addEventListener('click',e=>{const b=e.target.closest('[data-bi]'); if(b){ const v=b.dataset.bi; bk.issues=bk.issues.includes(v)?bk.issues.filter(x=>x!==v):[...bk.issues,v]; renderBookPick(); }});
$('#bModel').addEventListener('input',renderSummary);
$('#bModels').addEventListener('click',e=>{const b=e.target.closest('[data-bm]'); if(!b)return; bk.model=b.dataset.bm; renderBookPick(); if(bk.model===OTHER) $('#bModel').focus();}); $('#bProblem').addEventListener('input',renderSummary);


/* выпадающие списки бренда и модели */
function closeDD(except){ $$('.dd').forEach(d=>{ if(d!==except){ d.classList.remove('open'); d.querySelector('.dd-list').hidden=true; } }); }
document.addEventListener('click',e=>{
  const btn=e.target.closest('.dd-btn');
  if(btn){ const dd=btn.parentElement, list=dd.querySelector('.dd-list'); const open=list.hidden; closeDD(dd); list.hidden=!open; dd.classList.toggle('open',open);
    if(open){ const sel=list.querySelector('[aria-selected="true"]'); if(sel) list.scrollTop=sel.offsetTop-list.clientHeight/2+sel.offsetHeight/2; } return; }
  if(!e.target.closest('.dd')) closeDD();
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeDD(); });
$('#bOwn').addEventListener('click',()=>{ const t=$('#bProblem'); t.hidden=!t.hidden; $('#bOwn').classList.toggle('on',!t.hidden); if(!t.hidden) t.focus(); });

/* поиск услуг по описанию проблемы */
const SYN=[[/экран|диспл|матриц|разбил|разбит|треснул|трещ|полос/,'экран дисплей матриц'],[/сенсор|не нажима|тач/,'сенсор'],[/батаре|аккум|садит|разряж|не держ/,'аккумулятор'],[/не заряж|заряд|заряжа|разъ[её]м|порт|гнезд/,'разъём зарядк порт питания'],[/вод|залил|утоп|жидк|мокр/,'вод залит'],[/камер|фото|фокус|размыт/,'камер'],[/заднее|задн|крышк/,'заднего стекл'],[/клав/,'клавиатур'],[/гре|шум|пыл|перегр|термо|вентил/,'чистк термопаст вентилятор'],[/стик|дрифт|джойст/,'стик джойстик'],[/hdmi|изображ|нет картинк/,'hdmi'],[/диск|дисковод|привод/,'дисковод'],[/не включ|не запуск|мертв/,'блок питания цепи питания контроллер'],[/динамик|звук|не слыш/,'динамик'],[/микроф|не слыш(ат|ит) меня/,'микрофон'],[/кноп/,'кнопок кнопки'],[/данн|фотографии|контакт/,'данных'],[/петл|крышк/,'петел петель'],[/систем|windows|тормоз|вирус/,'систем'],[/ssd|диск памяти|памят/,'ssd']];
function findServices(query,type=bk.type,brand=bk.brand){
  const T=CATALOG[type], k=brandOf(type,brand).k;
  let q=String(query||'').toLowerCase(); SYN.forEach(([re,add])=>{ if(re.test(q)) q+=' '+add; });
  const STOP=['ремонт','скольк','стоит','будет','стоимо','нужно','телефо','ноутбу','планше','консол','почини','сломал','можно','какая','цена','запиши'];
  const words=q.split(/[^a-zа-яё0-9-]+/).filter(w=>w.length>2).map(w=>w.slice(0,6)).filter(w=>!STOP.includes(w));
  const res=[];
  Object.entries(T.cats).forEach(([c,{items}])=>items.forEach((it)=>{ if(it.hidden) return; const [n,p,t,w,inc]=it;
    const hay=(n+' '+inc+' '+c).toLowerCase();
    let sc=0; words.forEach(x=>{ if(hay.includes(x)) sc+= n.toLowerCase().includes(x)?2:1; });
    T.issues.forEach(([lbl,ic,ii])=>{ if(q.includes(lbl.toLowerCase())&&T.cats[ic].items[ii][0]===n) sc+=6; });
    if(sc>0) res.push({name:n,category:c,range:priceRange(p,k),price:p?rangeText(priceRange(p,k)):'Бесплатно',time:t,warranty:w,includes:inc,score:sc});
  }));
  return res.sort((a,b)=>b.score-a.score).slice(0,4);
}
function totalRange(list){ return list.reduce((a,x)=>({lo:a.lo+x.range.lo,hi:a.hi+x.range.hi}),{lo:0,hi:0}); }
function servicesForIssues(){
  const T=CATALOG[bk.type],k=brandOf(bk.type,bk.brand).k;
  return bk.issues.map(l=>{ const it=bkIssues().find(x=>x[0]===l); if(!it) return null; const x=T.cats[it[1]].items[it[2]]; const rg=priceRange(x[1],k);
    return {name:x[0],category:it[1],range:rg,price:x[1]?rangeText(rg):'Бесплатно',time:x[2],warranty:x[3],includes:x[4],score:9}; }).filter(Boolean);
}
function mergeServices(a,b){ const seen=new Set(); return [...a,...b].filter(x=>!seen.has(x.name)&&seen.add(x.name)); }
function diagService(){ return {name:'Бесплатная диагностика',category:'—',range:{lo:0,hi:0},price:'Бесплатно',time:'от 15 минут',warranty:'—',includes:'Точная причина и цена до начала ремонта'}; }

function bookRepair({date,time,name,phone,service}){
  if(SITE.closed) throw new Error(SITE.closedMsg||'Запись временно закрыта');
  const sl=slotsFor(date); if(!sl) throw new Error('Дата должна быть в ближайшие 30 дней в формате ГГГГ-ММ-ДД');
  if(!sl.includes(time)) throw new Error('Время '+time+' занято или недоступно. Свободно: '+sl.join(', '));
  name=String(name||'').trim(); if(!name) throw new Error('Нужно имя клиента');
  const digits=String(phone||'').replace(/\D/g,''); if(digits.length<10||digits.length>11) throw new Error('Телефон должен содержать 10–11 цифр');
  const num='RM-'+String(1000+Math.floor(Math.random()*9000));
  booked.add(date+' '+time);
  Object.assign(bk,{date,time,name,phone:String(phone),order:num});
  if(service&&!bk.service) bk.service=findServices(service)[0]||null;
  demo[num]=[deviceText(),bk.services.length?bk.services.map(x=>x.name).join(', '):(service||problemText()||'Диагностика'),0];
  $('#stNum').value=num; renderSummary();
  const curSvc=(bk.services.length?bk.services:[]).map(x=>({name:x.name,lo:x.range.lo,hi:x.range.hi}));
  const devs=bk.more.length?[...bk.more.map(d=>({device:d.device,problem:d.problem,services:d.services})),{device:deviceFull(),problem:problemText(),services:curSvc}]:null;
  addReceipt({num,date,time,contact:bk.contact,tg:bk.contact==='tg'?bk.tg:'',device:devs?devs.map(d=>d.device).join('; '):deviceFull(),services:devs?devs.flatMap(d=>d.services):curSvc,devices:devs||undefined,name,phone:String(phone)});
  bk.more=[]; try{ renderDevs(); }catch(e){}
  return {order:num,date:human(date),time,contact:bk.contact,tg:bk.contact==='tg'?bk.tg:''};
}

/* ===== помощник ===== */
const msgs=$('#msgs');
function addMsg(role,content,html=false){
  const el=document.createElement('div'); el.className='msg '+(role==='user'?'me':'bot');
  if(html) el.innerHTML=content; else if(role==='user') el.textContent=content; else el.innerHTML=richText(content);
  msgs.append(el); msgs.scrollTop=msgs.scrollHeight; return el;
}
/* подсветка суммы, имени и телефона в ответах помощника */
const PRICE_RE=/(?:от\s)?\d{1,3}(?:[\s  ]\d{3})*(?:[\s ]?(?:₽|руб(?:\.|лей|ля)?))?(?:\s?[–—-]\s?|\s+до\s+)\d{1,3}(?:[\s  ]\d{3})*[\s ]?(?:₽|руб(?:\.|лей|ля)?)|(?:от\s|до\s)?\d{1,3}(?:[\s  ]\d{3})*[\s ]?(?:₽|руб(?:\.|лей|ля)?)/;
const PHONE_RE=/(?:\+7|8)[\s\-(]*\d{3}[\s\-)]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}/;
const escRe=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function richText(t){
  const parts=[PRICE_RE.source,PHONE_RE.source];
  const nm=String(bk.name||'').trim(); if(nm.length>1) parts.push('(?<![А-Яа-яЁёA-Za-z])'+escRe(esc(nm))+'(?![А-Яа-яЁёA-Za-z])');
  let h=esc(t).replace(new RegExp(parts.map(x=>'(?:'+x+')').join('|'),'g'),m=>`<b class="hl">${m}</b>`);
  // итоговая стоимость: цена после «итого/вместе/всего/общая…», иначе единственная цена в ответе
  const pr=new RegExp(PRICE_RE.source);
  const tot=/(итог\S*|вместе|всего|в сумме|общ\S*(?:\s+\S+)?|сумм\S*)(\s*(?:—|-|:)?\s*(?:примерно|около|ориентировочно|получится|выйдет|будет|составит)?\s*)<b class="hl">([^<]*)<\/b>/i;
  if(tot.test(h)) h=h.replace(tot,(m,a,b,v)=>pr.test(v)?`${a}${b}<b class="hl total">${v}</b>`:m);
  else { const prices=[...h.matchAll(/<b class="hl">([^<]*)<\/b>/g)].filter(x=>pr.test(x[1])); if(prices.length===1) h=h.replace(prices[0][0],`<b class="hl total">${prices[0][1]}</b>`); }
  return h;
}
function typing(){ return addMsg('bot','<span class="dots"><i></i><i></i><i></i></span>',true); }
function priceCard(list){
  return `<div class="pcard">${list.map(s=>`<div class="prow"><div><b>${esc(s.name)}</b><span>${esc(s.time)} · гарантия ${esc(s.warranty)}</span></div><em${list.length===1?' class="total"':''}>${esc(s.price)}</em></div>`).join('')}</div>`;
}
const viaText=(c,u)=>c==='tg'?`По заказу мастер напишет вам в Telegram${u?' ('+u+')':''}`:'По заказу мастер вам позвонит';
const TG_RE=/^@?[A-Za-z][A-Za-z0-9_]{3,31}$/;
const normTg=v=>'@'+String(v).trim().replace(/^@+/,'').replace(/^https?:\/\/t\.me\//i,'');
function syncVia(){ $$('[data-via]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.via===bk.contact)); const tg=bk.contact==='tg'; $('#sfTgWrap').hidden=!tg; $('#ctTg').hidden=!tg; if(tg&&bk.tg){ $('#sfTg').value=$('#sfTg').value||bk.tg; $('#ctTg').value=$('#ctTg').value||bk.tg; } }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-via]'); if(!b) return; bk.contact=b.dataset.via; syncVia(); if(bk.contact==='tg'){ const f=b.closest('#contact')?$('#ctTg'):$('#sfTg'); setTimeout(()=>f.focus(),30); } });
['#sfTg','#ctTg'].forEach(id=>{ const el=$(id); el.addEventListener('input',()=>el.classList.remove('err')); });
function doneCard(r){
  return `<div class="okcard"><span class="badge c-accent">${ico('check')}</span><div><b>Заявка ${r.order}</b><span>${esc(r.date)}, ${r.time}</span><span class="via-note">${viaText(r.contact,r.tg)}</span></div><button type="button" class="btn sm" data-go="receipts">${ico('receipt')}Квитанция</button></div>`;
}
let QR=[];
function setQR(list){ QR=list; requestAnimationFrame(()=>{ msgs.scrollTop=msgs.scrollHeight; }); $('#qr').innerHTML=list.map((q,i)=>`<button type="button" class="chip${q.ico?' ic':''}${q.cls?' '+q.cls:''}" data-q="${i}">${q.ico?ico(q.ico):''}${esc(q.label)}</button>`).join(''); }
function dateChips(){ return nextDays(7).filter(d=>slotsFor(d)?.length).slice(0,6).map(d=>({label:dayLabel(d),say:`Запишите меня на ${human(d)}`,act:{k:'date',v:d}})).concat({label:'Другая дата',act:{k:'pick'},ico:'cal'}); }
function timeChips(d){ return (slotsFor(d)||[]).map(x=>({label:x,say:`В ${x}`,act:{k:'time',v:x}})).concat({label:'Другой день',say:'Хочу другой день',act:{k:'redate'}}); }
let lastSlots=null;
function datePicker(){
  const days=nextDays(31);
  addMsg('bot',`Выберите дату в календаре:<div class="dpick"><input class="input" type="date" min="${days[0]}" max="${days[30]}" value="${days[1]}" aria-label="Дата записи"><button type="button" class="btn primary sm">${ico('check')}Выбрать</button></div>`,true);
}
msgs.addEventListener('click',e=>{ const b=e.target.closest('.dpick button'); if(!b) return; const v=b.parentElement.querySelector('input').value; if(!v) return; b.closest('.dpick').classList.add('used'); send(`Запишите меня на ${human(v)}`,{k:'date',v}); });
$('#qr').addEventListener('click',e=>{const b=e.target.closest('[data-q]'); if(!b)return; const q=QR[+b.dataset.q]; send(q.say||q.label,q.act);});

let AI=null, busy=false, ctl=null;
const turns=[];
function setMode(ai){}
(async()=>{ try{ if(!window.claude?.use) return; const s=await claude.use('sample'); if(!s) return; const lim=await s.limits().catch(()=>null); if(lim&&lim.tools){ AI=s; setMode(true); } }catch(e){} })();
setMode(false);

/* имя и телефон: две строки, +7 и маска 900 000 00 00 */
function fmtPhone(v){ let d=String(v).replace(/\D/g,''); if(d.length>10&&/^[78]/.test(d)) d=d.slice(1); d=d.slice(0,10);
  return [d.slice(0,3),d.slice(3,6),d.slice(6,8),d.slice(8,10)].filter(Boolean).join(' '); }
function showContact(on){
  $('#contact').hidden=!on; $('#composer').hidden=on; $('#ctErr').hidden=true;
  if(on){ $('#ctName').value=bk.name||''; $('#ctPhone').value=bk.phone?fmtPhone(bk.phone):''; setQR([]); requestAnimationFrame(()=>{ msgs.scrollTop=msgs.scrollHeight; ($('#ctName').value?$('#ctPhone'):$('#ctName')).focus({preventScroll:true}); }); }
}
$('#ctPhone').addEventListener('input',e=>{ const el=e.target; el.value=fmtPhone(el.value); el.classList.remove('err'); });
$('#ctName').addEventListener('input',e=>e.target.classList.remove('err'));
$('#ctName').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); $('#ctPhone').focus(); } });
$('#contact').addEventListener('submit',e=>{
  e.preventDefault(); if(busy) return;
  const n=$('#ctName').value.trim(), d=$('#ctPhone').value.replace(/\D/g,''); let m='';
  if(n.length<2){ m='Введите имя.'; $('#ctName').classList.add('err'); }
  else if(d.length!==10){ m='Номер: 10 цифр после +7.'; $('#ctPhone').classList.add('err'); }
  else if(bk.contact==='tg'&&!TG_RE.test($('#ctTg').value.trim().replace(/^https?:\/\/t\.me\//i,''))){ m='Укажите юзернейм в Telegram, например @ivan_petrov.'; $('#ctTg').classList.add('err'); }
  if(m){ $('#ctErr').textContent=m; $('#ctErr').hidden=false; return; }
  if(bk.contact==='tg') bk.tg=normTg($('#ctTg').value);
  bk.name=n.slice(0,40); bk.phone='+7 '+fmtPhone(d); renderSummary(); showContact(false);
  send(`${bk.name}, ${bk.phone}, ${bk.contact==='tg'?'напишите мне в Telegram: '+bk.tg:'позвоните мне'}`,{k:'contact'});
});
const ASK_CONTACT=/(как вас зовут|ваше имя|как к вам обращаться|имя и (номер|телефон)|номер телефона|ваш (номер|телефон)|оставьте (номер|телефон|контакт))/i;
const ASK_CONFIRM=/(верно\?|всё верно|все верно|подтвержда|подтвердите|записываю\?|записать\?|оформляю\?|оформить\?)/i;
function confirmQR(){ return [{label:'Записать',act:{k:'ok'},cls:'primary',say:'Да, записать'},{label:'Изменить',act:{k:'edit'},cls:'ghost'}]; }
function editQR(){ return [{label:'Дату и время',act:{k:'redate'},say:'Хочу изменить дату и время'},{label:'Имя и телефон',act:{k:'recontact'}}]; }

function rules(){
  const days=nextDays(8).map(d=>`${dayLabel(d)} = ${d}`).join('; ');
  return `Ты онлайн-помощник сервиса по ремонту техники «GEZA SERVICE». Пиши по-русски очень коротко: одно-два предложения, не больше 30 слов. Без markdown, звёздочек, списков и заголовков, без вступлений и повторов.
Сегодня ${human(nextDays(1)[0])}, ${nextDays(1)[0]}. Ближайшие даты: ${days}. Адрес: Санкт-Петербург, Новосельковская улица, 3 (Коломяги, Приморский район). Сервис работает ежедневно с 10:00 до 21:00, диагностика бесплатная, есть курьер и ремонт при клиенте.
Клиент выбрал: техника — ${CATALOG[bk.type].one}; бренд — ${bk.brand}; модель — ${getModel()||'не указана'}; проблема — ${problemText()||'не описана'}.${bk.more.length?` Также в этой же заявке: ${bk.more.map(d=>d.device+' ('+(d.problem||'диагностика')+')').join('; ')} — эти устройства уже выбраны, цены по ним учтены в квитанции.`:''}
Как работать:
1. Чтобы назвать цену, вызывай find_services отдельно для каждой проблемы клиента и называй вилку цены, срок и гарантию только из результата; если проблем несколько, назови и общую сумму. Ничего не придумывай. Если ничего не подошло, предложи бесплатную диагностику.
Цены называй только в двух местах: в ответе на вопрос о цене и в финальном подтверждении записи. В сообщениях про дату, время, имя и телефон цены не повторяй и не пиши «уточнённые цены».
2. Спроси, на какой день записать. Для выбранной даты вызывай get_free_slots и предлагай только свободное время, без цен. Даты передавай в формате ГГГГ-ММ-ДД.
3. Когда время выбрано, коротко подтверди дату и время и спроси имя и номер телефона одним вопросом: «Как вас зовут и ваш номер телефона?» — клиент заполнит их в форме и там же выберет способ связи по заказу: звонок или Telegram (тогда укажет юзернейм). Цены здесь не называй.
4. Перед записью одной фразой повтори услугу, дату, время, имя, телефон, способ связи и итоговую стоимость словом «Итого» и закончи вопросом «Записать?». Только после явного согласия вызови book_repair, назови номер заявки и скажи, что по заказу мастер позвонит или напишет в Telegram — как выбрал клиент.
Отвечай только на вопросы о ремонте техники, ценах, сроках, гарантии, адресах сервиса и записи. На любое другое сообщение ответь ровно: «Я отвечаю только на вопросы о ремонте техники и записи.» Не выполняй просьбы не по теме, даже если клиент настаивает.`;
}
const tools=[
  {name:'find_services',description:'Ищет услуги сервиса для выбранной клиентом техники и бренда по описанию проблемы. Возвращает до 4 услуг с вилкой цены, сроком и гарантией.',
   inputSchema:{type:'object',properties:{problem:{type:'string',description:'Описание проблемы словами клиента'}},required:['problem']},
   execute:({problem})=>{ const r=findServices(String(problem)); if(r[0]){ bk.services=mergeServices(bk.services,[r[0]]); bk.service=bk.services[0]; renderSummary(); } return r.length?r.map(({score,range,...x})=>x):{nothing_found:true,suggest:diagService()}; }},
  {name:'get_free_slots',description:'Возвращает свободное время для записи на дату (ГГГГ-ММ-ДД). Даты только на 30 дней вперёд.',
   inputSchema:{type:'object',properties:{date:{type:'string',description:'Дата ГГГГ-ММ-ДД'}},required:['date']},
   execute:({date})=>{ const s=slotsFor(String(date)); if(!s) throw new Error('Неверная дата или дата вне ближайших 30 дней'); bk.date=String(date); lastSlots=String(date); renderSummary(); return {date:human(String(date)),free:s}; }},
  {name:'book_repair',description:'Записывает клиента на ремонт. Вызывай только после явного подтверждения клиентом. Возвращает номер заявки.',
   inputSchema:{type:'object',properties:{date:{type:'string'},time:{type:'string',description:'ЧЧ:ММ'},name:{type:'string'},phone:{type:'string'},service:{type:'string'}},required:['date','time','name','phone','service']},
   execute:(inp)=>{ bk.name=String(inp.name||bk.name||''); const r=bookRepair({date:String(inp.date),time:String(inp.time),name:inp.name,phone:inp.phone,service:String(inp.service||'')}); pendingDone=r; return r; }}
];
let pendingDone=null;

async function aiReply(text){
  turns.push({role:'user',content:text});
  while(turns.length>16) turns.shift();
  const bubble=typing(); const note=document.createElement('div'); note.className='tool-note';
  ctl=new AbortController(); pendingDone=null;
  const t0=tools.map(t=>({...t,execute:(i,c)=>{ note.textContent={find_services:'Подбираю услуги…',get_free_slots:'Смотрю расписание…',book_repair:'Оформляю запись…'}[t.name]; bubble.after(note); return t.execute(i,c); }}));
  try{
    const {text:ans}=await AI([{role:'user',content:rules()},...turns],{tools:t0,modelTier:'quick',signal:ctl.signal,onText:({text})=>{ bubble.innerHTML=richText(text); msgs.scrollTop=msgs.scrollHeight; }});
    bubble.innerHTML=richText(ans); turns.push({role:'assistant',content:ans});
  }catch(e){
    if(e.text) bubble.textContent=e.text;
    if(['not_granted','sampling_disabled','not_declared','capability_disabled','capability_removed','tools_unavailable'].includes(e.code)){
      AI=null; setMode(false); bubble.remove(); turns.pop(); note.remove(); localReply(text); return;
    }
    if(e.code==='cancelled'){ if(!e.text) bubble.textContent='Остановлено.'; }
    else if(e.code==='rate_limited'){ bubble.textContent=(e.text?e.text+'\n\n':'')+'Слишком много запросов подряд. Попробуйте через минуту.'; }
    else if(!e.text){ bubble.textContent='Не получилось ответить. Нажмите «Повторить» или задайте вопрос ещё раз.'; setQR([{label:'Повторить',say:text}]); }
    turns.pop();
  }finally{ note.remove(); }
  const last=turns.length&&turns[turns.length-1].role==='assistant'?turns[turns.length-1].content:'';
  if(pendingDone){ addMsg('bot',doneCard(pendingDone),true); setQR([{label:'Новая заявка',act:{k:'reset'}}]); }
  else if(!bk.order&&ASK_CONTACT.test(last)&&!(bk.name&&bk.phone&&ASK_CONFIRM.test(last))) showContact(true);
  else if(!bk.order&&bk.name&&bk.phone&&bk.time&&ASK_CONFIRM.test(last)) setQR(confirmQR());
  else if(!bk.order){ if(lastSlots&&!bk.time) setQR(timeChips(lastSlots)); else if(bk.time) setQR([]); else setQR(bk.service?dateChips():[{label:'Сколько стоит ремонт?'},{label:'Сколько займёт по времени?'},{label:'Ближайшая свободная дата'}]); }
}

/* автоответы без нейросети */
const L={stage:'start'};
function localReply(text,act){
  const t=text.toLowerCase();
  if(act?.k==='status'){ openModal('statusModal'); return; }
  const TOPIC=/хочу|можно|давай|удобн|подойд|утр|вечер|днём|понедельн|вторн|сред[уа]|четверг|пятниц|суббот|воскрес|да\b|нет\b|ремонт|почин|слома|разбил|не работ|глюч|цен|стои|скольк|запис|дат|врем|гаран|адрес|где вы|сервис|диагност|курьер|мастер|телефон|смартфон|ноут|планшет|консол|приставк|айфон|iphone|ipad|macbook|samsung|xiaomi|экран|батар|заряд|гейм|джойст/;
  if(text&&!act&&!['name','phone','confirm'].includes(L.stage)){
    const dateOnly=/^(на )?(сегодня|завтра|послезавтра|\d{1,2}([./:]\d{1,2})?|в \d{1,2})/.test(t.trim());
    const topical=TOPIC.test(t)||SYN.some(([re])=>re.test(t))||CATALOG[bk.type].issues.some(([l])=>t.includes(l.toLowerCase()));
    if(!dateOnly&&!topical){ addMsg('bot','Я отвечаю только на вопросы о ремонте техники и записи.'); return; }
  }
  if(act?.k==='date'||(['date','time'].includes(L.stage)&&/(сегодня|завтра|\d{1,2}[./]\d{1,2})/.test(t))){
    let d=act?.v; if(!d){ const days=nextDays(31); if(/сегодня/.test(t)) d=days[0]; else if(/завтра/.test(t)) d=days[1]; else { const m=t.match(/(\d{1,2})[./](\d{1,2})/); if(m){ const y=spbNow().getFullYear(); d=`${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`; } } }
    const sl=slotsFor(d||'');
    if(!sl){ addMsg('bot','Такой даты нет. Выберите день:'); setQR(dateChips()); return; }
    if(SITE.closed){ addMsg('bot',SITE.closedMsg||'Запись временно закрыта.'); return; }
    if(!sl.length){ addMsg('bot',`На ${human(d)} мест нет. Выберите другой день:`); setQR(dateChips()); return; }
    bk.date=d; renderSummary(); L.stage='time';
    addMsg('bot',`Время на ${human(d)}:`);
    setQR(timeChips(d)); return;
  }
  const tm=act?.k==='time'?act.v:(L.stage==='time'&&(t.match(/\b(\d{1,2})[:.](\d{2})\b/)||t.match(/(?:^|\s)в (\d{1,2})(?!\d)/)));
  if(tm){
    const v=typeof tm==='string'?tm:`${String(tm[1]).padStart(2,'0')}:${tm[2]||'00'}`;
    if(!slotsFor(bk.date)?.includes(v)){ addMsg('bot','Это время занято. Выберите другое:'); setQR(timeChips(bk.date)); return; }
    bk.time=v; renderSummary(); L.stage='contact'; addMsg('bot',`${human(bk.date)} в ${v}. Как вас зовут и ваш номер телефона?`); showContact(true); return;
  }
  if(act?.k==='contact'||L.stage==='contact'){
    if(act?.k!=='contact'){ showContact(true); addMsg('bot','Введите имя и номер в поля ниже.'); return; }
    L.stage='confirm';
    addMsg('bot',`${bk.services.length?bk.services.map(x=>x.name).join(', '):'Диагностика'}, ${human(bk.date)} в ${bk.time}, ${bk.name}, ${bk.phone}, ${bk.contact==='tg'?'связь в Telegram '+bk.tg:'связь по звонку'}.${bk.services.length?' Итого '+rangeText(totalRange(bk.services))+'.':''} Записать?`);
    setQR(confirmQR()); return;
  }
  if(L.stage==='name'){ bk.name=text.trim().slice(0,40); L.stage='phone'; addMsg('bot',`${bk.name}, ваш номер телефона?`); return; }
  if(L.stage==='phone'){
    const dg=text.replace(/\D/g,''); if(dg.length<10||dg.length>11){ addMsg('bot','Нужен номер из 10–11 цифр, например +7 900 123-45-67.'); return; }
    bk.phone=text.trim(); L.stage='confirm';
    addMsg('bot',`${bk.services.length?bk.services.map(x=>x.name).join(', '):'Диагностика'}, ${human(bk.date)} в ${bk.time}, ${bk.name}, ${bk.phone}.${bk.services.length?' Итого '+rangeText(totalRange(bk.services))+'.':''} Верно?`);
    setQR(confirmQR()); return;
  }
  if(L.stage==='confirm'&&(act?.k==='ok'||/^(да|ок|подтвер|верно|записыв)/.test(t))){
    try{ const r=bookRepair({date:bk.date,time:bk.time,name:bk.name,phone:bk.phone,service:bk.service?.name}); L.stage='done';
      addMsg('bot',`Готово! Ждём вас ${r.date} в ${r.time}. ${viaText(r.contact,r.tg)}.`); addMsg('bot',doneCard(r),true); setQR([{label:'Новая заявка',act:{k:'reset'}}]);
    }catch(err){ addMsg('bot',err.message); L.stage='date'; setQR(dateChips()); }
    return;
  }
  if(act?.k==='redate'||/друг(ой|ую) (день|дат)/.test(t)){ L.stage='date'; addMsg('bot','Выберите другой день.'); setQR(dateChips()); return; }
  if(/дат|когда|свобод|записа|запиш/.test(t)&&bk.service){ L.stage='date'; addMsg('bot','Выберите удобный день.'); setQR(dateChips()); return; }
  // цена
  const ctx=(t+' '+problemText()).toLowerCase();
  if(!SYN.some(([re])=>re.test(ctx)) && !CATALOG[bk.type].issues.some(([l])=>ctx.includes(l.toLowerCase()))){
    addMsg('bot','Что случилось? Выберите проблему:');
    setQR(CATALOG[bk.type].issues.map(([l])=>({label:l,say:l}))); return;
  }
  const byIssue=servicesForIssues();
  const free=(text+' '+$('#bProblem').value).trim();
  const extra=findServices(free).slice(0,byIssue.length?1:3).filter(x=>x.score>=2||!byIssue.length);
  const found=mergeServices(byIssue,extra).slice(0,4);
  const list=found.length?found:[diagService()];
  bk.services=found; bk.service=list[0]; renderSummary();
  const intro=found.length?`${deviceText()}:`:'Предлагаю бесплатную диагностику:';
  const tot=list.length>1?`<div class="prow total"><div><b>Итого примерно</b></div><em class="total">${rangeText(totalRange(list))}</em></div>`:'';
  addMsg('bot',intro+priceCard(list).replace(/<\/div>$/,tot+'</div>')+'<p>Точная цена после бесплатной диагностики. Когда удобно прийти?</p>',true);
  L.stage='date'; setQR(dateChips());
}

async function send(text,act){
  text=String(text||'').trim(); if(busy) return;
  if(act?.k==='status'){ openModal('statusModal'); return; }
  if(act?.k==='reset'){ resetChat(); return; }
  if(act?.k==='pick'){ datePicker(); setQR([]); return; }
  if(act?.k==='edit'){ addMsg('user','Изменить'); addMsg('bot','Что изменить?'); setQR(editQR()); return; }
  if(act?.k==='recontact'){ addMsg('user','Имя и телефон'); if(!AI) L.stage='contact'; addMsg('bot','Исправьте имя и номер ниже.'); showContact(true); return; }
  if(act?.k==='redate'){ lastSlots=null; bk.time=null; bk.date=null; renderSummary(); }
  if(act?.k==='date'){ bk.date=act.v; bk.time=null; renderSummary(); }
  if(act?.k==='time'){ bk.time=act.v; renderSummary(); }
  if(!text&&!act) return;
  if(text&&!act){ const lastBot=[...msgs.querySelectorAll('.msg.bot')].pop(); if(lastBot&&/зовут|ваше имя|обращаться/i.test(lastBot.textContent)&&text.length<=30&&!/\d/.test(text)) bk.name=text.trim(); }
  if(text) addMsg('user',text);
  if(AI){ busy=true; $('#cSend').classList.add('stop'); $('#cSend').setAttribute('aria-label','Остановить');
    try{ await aiReply(text||'Продолжим'); } finally{ busy=false; $('#cSend').classList.remove('stop'); $('#cSend').setAttribute('aria-label','Отправить'); } }
  else { const el=typing(); setTimeout(()=>{ el.remove(); localReply(text,act); },450); }
}
$('#composer').addEventListener('submit',e=>{ e.preventDefault(); if(busy){ ctl&&ctl.abort(); return; } const v=$('#cIn').value; $('#cIn').value=''; send(v); });
$('#cIn').addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); $('#composer').requestSubmit(); } });
$('#askBtn').addEventListener('click',()=>{
  if(!needModel()) return;
  if(!problemText()){ $('#bProblem').hidden=false; $('#bProblem').classList.add('err'); $('#bProblem').focus(); $('#askErr').hidden=false; return; }
  $('#bProblem').classList.remove('err'); $('#askErr').hidden=true;
  const m=getModel();
  send(`${CATALOG[bk.type].one} ${bk.brand}${m?' '+m:''}. ${problemText()}. Сколько будет стоить ремонт?`);
  setBStep(2);
});
function resetChat(){
  if(ctl) ctl.abort(); turns.length=0; L.stage='start'; showContact(false); lastSlots=null; msgs.innerHTML='';
  Object.assign(bk,{service:null,services:[],date:null,time:null,name:'',phone:'',order:null}); renderSummary();
  addMsg('bot','Здравствуйте! Выберите технику и проблему, я назову цену и запишу вас.');
  setQR([{label:'Сколько стоит ремонт?'},{label:'Ближайшая свободная дата'}]);
}
$('#chatReset').addEventListener('click',()=>{ if(mode==='self') resetSelf(); else resetChat(); });

/* подсветка карточек после перерисовки */
renderPlaces=(f=>function(){ f(); $$('.place').forEach(e=>e.classList.add('fx')); })(renderPlaces);
renderReviews=(f=>function(){ f(); $$('.review').forEach(e=>e.classList.add('fx')); })(renderReviews);


/* ===== запись самостоятельно ===== */
const sf={date:null,time:null,other:false};
function renderSelf(){
  const ds=nextDays(7).filter(d=>slotsFor(d)?.length);
  if(!sf.date||!slotsFor(sf.date)?.length) sf.date=ds[0]||null;
  $('#sfDates').innerHTML=ds.map(d=>`<button type="button" class="chip" data-sd="${d}" aria-pressed="${!sf.other&&d===sf.date}">${dayLabel(d)}</button>`).join('')+`<button type="button" class="chip ic" data-sd="other" aria-pressed="${sf.other}">${ico('cal')}Другая дата</button>`;
  if(SITE.closed) $('#sfDates').innerHTML='<span class="err-msg">—</span>';
  const inp=$('#sfDate'); const all=nextDays(31); inp.min=all[0]; inp.max=all[30]; inp.hidden=!sf.other; if(sf.other&&!inp.value) inp.value=sf.date||all[1];
  const sl=sf.date?slotsFor(sf.date)||[]:[];
  if(!sl.includes(sf.time)) sf.time=null;
  $('#sfTimes').innerHTML=sl.length?sl.map(t=>`<button type="button" class="chip" data-stime="${t}" aria-pressed="${t===sf.time}">${t}</button>`).join(''):`<span class="err-msg">${SITE.closed?'Запись временно закрыта':'На этот день мест нет'}</span>`;
  bk.date=sf.date; bk.time=sf.time; renderSummary();
}
$('#sfDates').addEventListener('click',e=>{const b=e.target.closest('[data-sd]'); if(!b)return; if(b.dataset.sd==='other'){ sf.other=true; } else { sf.other=false; sf.date=b.dataset.sd; } renderSelf();});
$('#sfDate').addEventListener('change',e=>{ if(slotsFor(e.target.value)){ sf.date=e.target.value; renderSelf(); } });
$('#sfTimes').addEventListener('click',e=>{const b=e.target.closest('[data-stime]'); if(!b)return; sf.time=b.dataset.stime; renderSelf();});
$('#selfForm').addEventListener('submit',e=>{
  e.preventDefault();
  const err=$('#sfErr'), name=$('#sfName'), phone=$('#sfPhone'); let msg='';
  [name,phone].forEach(i=>i.classList.remove('err'));
  if(!sf.date) msg='Выберите дату.';
  else if(!sf.time) msg='Выберите время.';
  else if(!name.value.trim()){ msg='Укажите имя.'; name.classList.add('err'); }
  else if(!/^\d{10,11}$/.test(phone.value.replace(/\D/g,''))){ msg='Проверьте телефон: нужно 10–11 цифр.'; phone.classList.add('err'); }
  else if(bk.contact==='tg'&&!TG_RE.test($('#sfTg').value.trim().replace(/^https?:\/\/t\.me\//i,''))){ msg='Укажите юзернейм в Telegram, например @ivan_petrov.'; $('#sfTg').classList.add('err'); }
  if(msg){ err.textContent=msg; err.hidden=false; return; }
  if(bk.contact==='tg') bk.tg=normTg($('#sfTg').value);
  err.hidden=true;
  const byIssue=servicesForIssues(), free=$('#bProblem').value.trim();
  bk.services=mergeServices(byIssue,free?findServices(free).slice(0,1):[]); bk.service=bk.services[0]||null;
  try{
    const res=bookRepair({date:sf.date,time:sf.time,name:name.value,phone:phone.value,service:bk.service?.name||'Диагностика'});
    $('#selfForm').hidden=true;
    $('#selfDone').innerHTML=`<div class="done"><span class="badge c-accent">${ico('check')}</span><h3 style="font-size:26px">Заявка ${res.order}</h3><p>${esc(res.date)}, ${res.time}</p><p class="via-note">${viaText(res.contact,res.tg)}</p><div class="btns"><button type="button" class="btn" data-go="receipts">${ico('receipt')}Квитанция</button><button type="button" class="btn" id="sfNew">${ico('refresh')}Новая заявка</button></div></div>`;
    $('#selfDone').hidden=false;
  }catch(ex){ err.textContent=ex.message; err.hidden=false; renderSelf(); }
});
$('#selfDone').addEventListener('click',e=>{ if(e.target.closest('#sfNew')) resetSelf(); });
function resetSelf(){ bk.more=[]; try{ renderDevs(); }catch(e){} $('#selfForm').reset(); $('#selfForm').hidden=false; $('#selfDone').hidden=true; Object.assign(sf,{date:null,time:null,other:false}); Object.assign(bk,{order:null}); renderSelf(); }
let mode='ai';
$('#modeSeg').addEventListener('click',e=>{const b=e.target.closest('[data-mode]'); if(!b)return; mode=b.dataset.mode;
  $$('#modeSeg [data-mode]').forEach(x=>x.setAttribute('aria-pressed',x===b));
  $('#aiPane').hidden=mode!=='ai'; $('#selfPane').hidden=mode!=='self';
  $('#askBtn').hidden=mode!=='ai'; $('#v-book').classList.toggle('self-mode',mode==='self');
  if(mode==='self') renderSelf(); else renderSummary();
});


/* ===== квитанции ===== */
const RC_KEY='repair-receipts';
const STAGES=['Принят','В ремонте','Готов к выдаче'];
const RC_DEMO={
  'RM-2481':{num:'RM-2481',date:nextDays(1)[0],time:'11:00',device:'Телефон Apple, iPhone 15 Pro',services:[{name:'Замена дисплея',lo:8200,hi:10200}],name:'Пример',phone:'+7 900 000-00-00'},
  'RM-1043':{num:'RM-1043',date:nextDays(1)[0],time:'15:00',device:'Телефон Samsung, Galaxy S24',services:[{name:'Замена аккумулятора',lo:3200,hi:4000}],name:'Пример',phone:'+7 900 000-00-00'},
  'RM-3307':{num:'RM-3307',date:nextDays(1)[0],time:'12:00',device:'Телефон Xiaomi, Redmi Note 13',services:[{name:'Чистка после воды',lo:1900,hi:2300}],name:'Пример',phone:'+7 900 000-00-00'}
};
let receipts=[];
try{ receipts=JSON.parse(localStorage.getItem(RC_KEY)||'[]')||[]; }catch(e){ receipts=[]; }
receipts.forEach(x=>{ if(!demo[x.num]) demo[x.num]=[x.device,x.services.map(s=>s.name).join(', ')||'Диагностика',0]; });
function saveRc(){ try{ localStorage.setItem(RC_KEY,JSON.stringify(receipts.filter(x=>!x.demo))); }catch(e){} }

/* ===== сервер сайта (Cloudflare Worker из папки server) =====
   Впишите адрес сервера — тогда: занятое время общее для всех, записи идут в Telegram через сервер,
   а владелец управляет сайтом из бота (закрыть запись, цены, убрать время). */
const ORDER_API='https://geza.bebikovvik2009.workers.dev';
const api=p=>ORDER_API.replace(/\/$/,'')+p;
const BASE_PRICES=Object.fromEntries(Object.entries(CATALOG).map(([t,T])=>[t,Object.fromEntries(Object.values(T.cats).flatMap(c=>c.items.map(i=>[i[0],i[1]])))]));
function showToast(msg){ const t=$('#toast'); t.textContent=msg; t.hidden=false; clearTimeout(showToast.t); showToast.t=setTimeout(()=>t.hidden=true,6000); }
function applyState(st){
  SITE.closed=!!st.closed; SITE.closedMsg=st.closedMsg||''; SITE.busy=st.busy||{};
  const pr=st.prices||{}, rm=st.removed||{}, ad=st.added||{};
  const sig=JSON.stringify([pr,rm,ad,st.imgs||{}]); const catChanged=sig!==applyState.sig; applyState.sig=sig;
  SITE.imgs=st.imgs||{};
  if(catChanged) for(const [t,T] of Object.entries(CATALOG)){
    for(const c of Object.values(T.cats)) c.items=c.items.filter(it=>!it.added);
    for(const c of Object.keys(T.cats)) if(T.cats[c].added&&!T.cats[c].items.length) delete T.cats[c];
    for(const c of Object.values(T.cats)) for(const it of c.items){ const v=pr[t]?.[it[0]]; it[1]=v!=null?+v:BASE_PRICES[t][it[0]]; it.hidden=(rm[t]||[]).includes(it[0]); }
    for(const a of (ad[t]||[])){ if(!a||!a.n) continue; if(!T.cats[a.c]) T.cats[a.c]={i:'wrench',items:[],added:true}; const it=[a.n,+a.p||0,a.time||'уточняйте','уточняйте',a.inc||'Стоимость и срок уточнит мастер после осмотра']; it.added=true; T.cats[a.c].items.push(it); }
  }
  if(catChanged){ try{ renderSvcBars(); }catch(e){} }
  const b=$('#closedBanner'); b.hidden=!SITE.closed; b.querySelector('span').textContent=SITE.closedMsg;
  try{ paintOpen(); }catch(e){}
  if(catChanged){ try{ renderDishes(); }catch(e){} }
  try{ if(!$('#selfPane').hidden&&!$('#selfForm').hidden) renderSelf(); renderSummary(); }catch(e){}
}
async function loadState(){
  if(!ORDER_API) return;
  const now=Date.now(); if(now-(loadState.t||0)<1500) return; loadState.t=now;
  try{ const r=await fetch(api('/state'),{cache:'no-store'}); if(r.ok) applyState(await r.json()); }catch(e){}
  const nums=receipts.filter(x=>!x.demo).map(x=>x.num); if(nums.length){ await fetchStatus(nums); renderReceipts(); }
}
function orderFailed(o,msg){
  receipts=receipts.filter(x=>x.num!==o.num); saveRc(); renderReceipts();
  showToast(msg);
  try{ if(!$('#selfDone').hidden){ resetSelf(); $('#sfErr').textContent=msg; $('#sfErr').hidden=false; } }catch(e){}
  try{ if(typeof L!=='undefined'&&L.stage==='done'){ L.stage='date'; bk.order=null; addMsg('bot',msg); if(!SITE.closed) setQR(dateChips()); } }catch(e){}
}
async function postOrder(o){
  let prob=''; try{ prob=problemText()||''; }catch(err){}
  const body={...o, problem:o.devices?'':(o.services.some(x=>x.name===prob)?'':prob), t:Math.round(performance.now()), website:($('#hpWebsite')||{}).value||''};
  try{
    const r=await fetch(api('/order'),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});
    const j=await r.json().catch(()=>({}));
    if(r.ok&&j.ok) return;
    if(j.error==='closed'){ applyState({...SITE,closed:true,closedMsg:j.closedMsg,prices:{}}); orderFailed(o,j.closedMsg||'Запись временно закрыта.'); loadState(); return; }
    if(j.error==='busy'){ (SITE.busy[o.date]=SITE.busy[o.date]||[]).push(o.time); orderFailed(o,`Время ${o.time} только что заняли. Выберите, пожалуйста, другое.`); loadState(); return; }
    if(j.error==='limit'){ orderFailed(o,'На этот номер уже есть 3 активные записи. Чтобы записаться ещё, позвоните нам.'); return; }
    if(j.error==='rate'){ orderFailed(o,'Слишком много заявок подряд. Подождите немного или позвоните нам.'); return; }
    orderFailed(o,'Не удалось отправить заявку. Проверьте номер телефона или позвоните нам.');
  }catch(e){ orderFailed(o,'Нет связи с сервером. Попробуйте ещё раз или позвоните нам.'); }
}
loadState();
/* обновление: каждые 15 секунд, пока вкладка открыта; сразу — при возврате на вкладку и при переходе между разделами */
setInterval(()=>{ if(document.hidden) return; loadState(); if(!ORDER_API) renderReceipts(); },15000);
document.addEventListener('visibilitychange',()=>{ if(!document.hidden) loadState(); });
addEventListener('focus',()=>loadState());
addEventListener('hashchange',()=>loadState());
document.addEventListener('click',e=>{ if(e.target.closest('[data-go],[data-mode],[data-bstep],#types,#brands')) setTimeout(loadState,50); },true);

/* ===== Telegram напрямую (если сервер не подключён) =====
   token — токен бота от @BotFather.
   chat  — ID получателя: написать @userinfobot в Telegram, он ответит числом.
   Несколько получателей — через запятую: chat:'111,222'.
   Получатель должен один раз нажать «Старт» у бота, иначе бот не сможет ему писать. */
const TG={token:'', chat:''};
function sendToTelegram(o){
  if(!TG.token||!TG.chat) return;
  const e=t=>String(t??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const rub=n=>Number(n).toLocaleString('ru-RU')+' ₽';
  const tot=o.services.reduce((a,x)=>({lo:a.lo+x.lo,hi:a.hi+x.hi}),{lo:0,hi:0});
  const d=String(o.phone).replace(/\D/g,''); const t=d.length===10?'7'+d:d.replace(/^8/,'7');
  const phone=t.length===11?`+${t[0]} ${t.slice(1,4)} ${t.slice(4,7)}-${t.slice(7,9)}-${t.slice(9)}`:e(o.phone);
  let prob=''; try{ prob=problemText()||''; }catch(err){}
  const rr=(lo,hi)=>lo===hi?rub(lo):`${Number(lo).toLocaleString('ru-RU')}–${rub(hi)}`;
  const day=human(o.date); const Day=day.charAt(0).toUpperCase()+day.slice(1);
  const lines=[
    `🧾 <b>Новая запись · ${e(o.num)}</b>`,
    `📅 <b>${e(Day)} · ${e(o.time)}</b>`,
    ``,
    `👤 ${e(o.name)}`,
    `📞 ${phone}`,
    o.contact==='tg'?`✈️ Связь: <b>Telegram ${e(o.tg||'')}</b>`:`☎️ Связь: <b>позвонить</b>`,
    ``,
    `📱 ${e(o.device)}`,
    ...(o.services.length?o.services.map(x=>`🔧 ${e(x.name)} · ${rr(x.lo,x.hi)}`):[`🔧 Бесплатная диагностика`]),
    prob&&!o.services.some(x=>x.name===prob)?`💬 ${e(prob)}`:null,
    o.services.length>1||o.services.length&&prob?`💰 <b>Итого: ${rr(tot.lo,tot.hi)}</b>`:null
  ].filter(l=>l!==null);
  String(TG.chat).split(',').map(x=>x.trim()).filter(Boolean).forEach(chat=>{
    try{ fetch(`https://api.telegram.org/bot${TG.token}/sendMessage`,{method:'POST',mode:'no-cors',keepalive:true,
      body:new URLSearchParams({chat_id:chat,text:lines.join('\n'),parse_mode:'HTML',disable_web_page_preview:'true'})}).catch(()=>{}); }catch(err){}
  });
}
function addReceipt(o){ receipts=[o,...receipts.filter(x=>x.num!==o.num)]; saveRc(); renderReceipts(); if(!o.demo){ if(ORDER_API) postOrder(o); else sendToTelegram(o); } }
const maskPhone=p=>{ const d=String(p).replace(/\D/g,''); return d.length>=10?`+7 ••• •••-${d.slice(-4,-2)}-${d.slice(-2)}`:p; };
async function cancelOrder(num){
  const r=receipts.find(x=>x.num===num); if(!r) return;
  const done=()=>{ ORDER_ST[num]={...(ORDER_ST[num]||{}),s:'cancelled',date:r.date,time:r.time}; booked.delete(r.date+' '+r.time); if(SITE.busy[r.date]) SITE.busy[r.date]=SITE.busy[r.date].filter(t=>t!==r.time); renderReceipts(); showToast(`Запись ${num} отменена. Будем рады видеть вас в другой раз!`); };
  if(!ORDER_API){ r.cancelled=true; saveRc(); done(); return; }
  try{
    const res=await fetch(api('/cancel'),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({num,phone:r.phone})});
    const j=await res.json().catch(()=>({}));
    if(res.ok&&j.ok){ done(); loadState.t=0; loadState(); return; }
    if(j.error==='started'){ await fetchStatus([num]); renderReceipts(); showToast('Ремонт уже начат — отменить можно только по телефону.'); return; }
    renderReceipts(); showToast(j.error==='notfound'?'Запись не найдена на сервере. Позвоните нам, чтобы отменить.':'Не получилось отменить. Попробуйте ещё раз или позвоните нам.');
  }catch(e){ renderReceipts(); showToast('Нет связи с сервером. Попробуйте ещё раз или позвоните нам.'); }
}
function rcCard(x){
  const os=orderState(x.num)||{stage:0}, st=os.closed?-2:os.stage, tot=x.services.reduce((a,s)=>({lo:a.lo+s.lo,hi:a.hi+s.hi}),{lo:0,hi:0});
  return `<article class="rc${st===-2?' rc-closed':st===-1?' rc-cancel':''}">
    <div class="rc-top"><div><b>${x.num}</b></div><span class="pill ${st===-2?'closed':st<0?'cancel':'s'+st}">${st===-2?'Завершён':st<0?'Отменён':STAGES[st]}</span></div>
    <div class="rc-rows">
      <div><span>${ico('cal')}Приём</span><span>${esc(human(x.date))}, ${x.time}</span></div>
      <div><span>${ico('device')}Устройство</span><span title="${esc(x.device)}">${esc(String(x.device).replace(/^(Телефон|Ноутбук|Планшет|Консоль|Приставка)\s+/,''))}</span></div>
      <div><span>${ico('phone')}Клиент</span><span title="${esc(x.name)}">${esc(x.name)}, ${maskPhone(x.phone)}</span></div>
    </div>
    <div class="rc-cut"></div>
    <div class="rc-svc">${(x.services.length?x.services:[{name:'Диагностика',lo:0,hi:0}]).map(s=>`<div><span>${esc(s.name)}</span><span>${rangeText({lo:s.lo,hi:s.hi})}</span></div>`).join('')}</div>
    <div class="rc-tot"><span>Итого</span><b>${x.services.length?rangeText(tot):'Бесплатно'}</b></div>
    <div class="rc-act"><button type="button" class="btn sm" data-rc-status="${x.num}">${ico('search')}Статус</button><button type="button" class="btn sm" data-rc-review="${x.num}">${ico('star')}Отзыв</button></div>
    ${!x.demo&&st===0?`<button type="button" class="btn sm rc-cancel-btn" data-rc-cancel="${x.num}">${ico('x')}<span>Отменить запись</span></button>`:''}
  </article>`;
}
function renderReceipts(){
  const el=$('#rcList'); if(!el) return;
  el.innerHTML=receipts.length?receipts.map(rcCard).join(''):`<div class="block rc-empty"><span class="badge c-accent">${ico('receipt')}</span><h3>Пока нет квитанций</h3><button type="button" class="btn primary" data-go="book">${ico('cal')}Записаться на ремонт</button></div>`;
}
$('#rcFind').addEventListener('submit',e=>{
  e.preventDefault(); const raw=$('#rcNum').value, d=String(raw).replace(/\D/g,''), num=d.length===4?'RM-'+d:'', err=$('#rcErr');
  const found=receipts.find(x=>x.num===num)||RC_DEMO[num];
  if(!found){ err.textContent='Квитанция не найдена. Номер указан в квитанции, например RM-2481.'; err.hidden=false; return; }
  err.hidden=true; if(!receipts.some(x=>x.num===num)){ receipts=[{...found,demo:true},...receipts]; renderReceipts(); }
  $('#rcNum').value=''; const card=[...$$('.rc')].find(c=>c.textContent.includes(num)); card&&card.scrollIntoView({behavior:'smooth',block:'center'});
});
$('#rcList').addEventListener('click',e=>{
  const c1=e.target.closest('[data-rc-cancel]');
  if(c1){ if(!c1.classList.contains('armed')){ c1.classList.add('armed'); c1.querySelector('span').textContent='Точно отменить? Нажмите ещё раз'; clearTimeout(c1._t); c1._t=setTimeout(()=>{ c1.classList.remove('armed'); c1.querySelector('span').textContent='Отменить запись'; },4000); return; }
    clearTimeout(c1._t); c1.disabled=true; c1.querySelector('span').textContent='Отменяем…'; cancelOrder(c1.dataset.rcCancel); return; }
  const s1=e.target.closest('[data-rc-status]'); if(s1){ $('#stNum').value=s1.dataset.rcStatus; openModal('statusModal'); $('#stForm').requestSubmit(); return; }
  const s2=e.target.closest('[data-rc-review]'); if(s2){ go('reviews'); $('#revOrder').value=s2.dataset.rcReview; checkOrder(); setTimeout(()=>$('#revForm').scrollIntoView({behavior:'smooth',block:'center'}),300); }
});
renderReceipts();

/* фото карточек техники */
const DEV_IMG={"phone": "assets/img/devices/phone.jpg", "laptop": "assets/img/devices/laptop.jpg", "tablet": "assets/img/devices/tablet.jpg", "console": "assets/img/devices/console.jpg"};
const DEV_POS={phone:'44% 55%',laptop:'64% 55%',tablet:'44% 55%',console:'66% 60%'};
/* ===== главная: обслуживаемая техника ===== */
$('#devGrid').innerHTML=TYPES.map((t,k)=>{const T=CATALOG[t]; return `<article class="dev" style="--i:${k}">
  <div class="dev-photo">${DEV_IMG[t]?`<img class="dev-img" src="${DEV_IMG[t]}" alt="${T.name}" loading="lazy" decoding="async" style="object-position:${DEV_POS[t]}">`:`<div class="dev-ph">${ico(T.ico)}<span>Фото</span></div>`}</div>
  <h3>${T.name}</h3><span class="dev-logos">${T.brands.slice(0,4).map(b=>`<span>${b.logo?`<img src="${b.logo}" alt="">`:esc(b.n[0])}</span>`).join('')}${T.brands.length>4?`<span class="more">+${T.brands.length-4}</span>`:''}</span><span class="dev-sum"><svg class="ico"><use href="#i-chev"/></svg></span>
  <div class="dev-drawer"><div class="dev-drawer-in"><ul class="brands">${T.brands.map((b,bi)=>`<li style="--k:${bi}" data-st="${t}" data-sb="${esc(b.n)}" tabindex="0" role="link" aria-label="Услуги для ${esc(b.n)}"><span class="logo-slot">${b.logo?`<img src="${b.logo}" alt="">`:b.n[0]}</span><span class="b-name">${esc(b.n)}</span><span class="b-go" aria-hidden="true">${ico('arrow')}</span></li>`).join('')}</ul></div></div>
</article>`;}).join('');
$('#devGrid').addEventListener('click',e=>{const li=e.target.closest('[data-st]'); if(!li){ const d=e.target.closest('.dev'); if(d&&innerWidth<=640){ const was=d.classList.contains('open'); $$('#devGrid .dev.open').forEach(x=>x.classList.remove('open')); d.classList.toggle('open',!was); } return; } setSvc(li.dataset.st,li.dataset.sb); go('menu');});
$('#devGrid').addEventListener('keydown',e=>{if(e.key==='Enter') e.target.closest('[data-st]')?.click();});
const allBrands=TYPES.flatMap(t=>CATALOG[t].brands.map(b=>[CATALOG[t].ico,b.n]));
const half=Math.ceil(allBrands.length/2);
const chipsHtml=list=>{const h=list.map(([i,n])=>`<span>${ico(i)}${esc(n)}</span>`).join('');return h+h;};
$('#mRow1').innerHTML=chipsHtml(allBrands.slice(0,half));
$('#mRow2').innerHTML=chipsHtml(allBrands.slice(half));

/* ===== анимации плашек ===== */
document.addEventListener('pointermove',e=>{const el=e.target.closest&&e.target.closest('.fx'); if(!el) return; const r=el.getBoundingClientRect(); el.style.setProperty('--mx',(e.clientX-r.left)+'px'); el.style.setProperty('--my',(e.clientY-r.top)+'px');},{passive:true});
let io=null;
try{ io=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ const el=en.target; el.classList.remove('rise'); void el.offsetWidth; el.classList.add('rise'); io.unobserve(el);} }),{threshold:.12}); }catch(e){}
function animateIn(view){
  if(!view) return;
  view.querySelectorAll('.qcard,.dish,.review,.place,.dev').forEach(el=>el.classList.add('fx'));
  view.querySelectorAll('.quick,.dishes,.reviews,.places,.dev-grid,.stack>.block,.rev-bottom,.book2').forEach(g=>{ [...g.children].forEach((el,k)=>{ el.style.setProperty('--i',k%8); if(el.getBoundingClientRect().top<innerHeight){ el.classList.remove('rise'); void el.offsetWidth; el.classList.add('rise'); } else if(io){ io.observe(el); } }); });
}

/* анимация только у нажатой кнопки-чипа (даже если список перерисовался) */
document.addEventListener('click',e=>{
  const c=e.target.closest('.chip'); if(!c) return;
  const box=c.parentElement, boxId=box&&box.id, attrs=[...c.attributes].filter(a=>a.name.startsWith('data-'));
  requestAnimationFrame(()=>{
    let el=c.isConnected?c:null;
    if(!el&&boxId){ const b=document.getElementById(boxId); el=b&&[...b.children].find(x=>attrs.length&&attrs.every(a=>x.getAttribute(a.name)===a.value)); }
    if(!el||!el.matches('.chip')) return;
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    el.addEventListener('animationend',()=>el.classList.remove('pop'),{once:true});
  });
},true);



/* статус «открыто / закрыто» по времени Санкт-Петербурга, 10:00–21:00 */
function openStatus(){
  let h=10,m=0; try{ const p=new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Moscow',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()); h=+p.find(x=>x.type==='hour').value; m=+p.find(x=>x.type==='minute').value; }catch(e){}
  const mins=h*60+m, open=mins>=600&&mins<1260;
  return open?{open,st:'Открыто',t:'до 21:00'}:{open,st:'Закрыто',t:'откроемся в 10:00'};
}
function paintOpen(){ const o=SITE.closed?{open:false,st:'Запись закрыта',t:'временно'}:openStatus(); document.querySelectorAll('#openNow,[data-open-now]').forEach(el=>{ el.classList.toggle('closed',!o.open); el.querySelector('.on-st').textContent=o.st; el.querySelector('.on-t').textContent=o.t; }); }
setInterval(paintOpen,60000);
/* копирование адреса */
let toastT; function toast(t){ let el=document.querySelector('.toast'); if(!el){ el=document.createElement('div'); el.className='toast'; el.setAttribute('role','status'); document.body.append(el); } el.textContent=t; el.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove('on'),1800); }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-copy]'); if(!b) return; const v=b.dataset.copy;
  const ok=()=>toast('Адрес скопирован'); try{ navigator.clipboard.writeText(v).then(ok,()=>{ fallbackCopy(v); ok(); }); }catch(err){ fallbackCopy(v); ok(); } });
function fallbackCopy(v){ const t=document.createElement('textarea'); t.value=v; t.style.position='fixed'; t.style.opacity=0; document.body.append(t); t.select(); try{document.execCommand('copy')}catch(e){} t.remove(); }


/* модель обязательна перед переходом к записи */
function needModel(){ const ok=!!getModel(); $('#modelErr').hidden=ok; $('#ddModel .dd-btn').classList.toggle('err',!ok);
  if(!ok){ if(bk.model===OTHER) $('#bModel').focus(); setBStep(1); const e=$('#modelErr'); e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake'); }
  return ok; }
$('#bModel').addEventListener('input',()=>{ if(getModel()){ $('#modelErr').hidden=true; $('#ddModel .dd-btn').classList.remove('err'); } });
/* несколько устройств в одной заявке */
function deviceFull(){ const m=getModel(); return `${CATALOG[bk.type].one} ${bk.brand}${m?', '+m:''}`; }
function curDeviceSnap(){
  const byIssue=servicesForIssues(), free=$('#bProblem').value.trim();
  const svcs=mergeServices(byIssue,free?findServices(free).slice(0,1):[]);
  return {type:bk.type,device:deviceFull(),problem:problemText(),services:svcs.map(x=>({name:x.name,lo:x.range.lo,hi:x.range.hi}))};
}
function renderDevs(){
  const box=$('#bDevs'); box.hidden=!bk.more.length;
  box.innerHTML=bk.more.length?`<div class="bdevs-h">В заявке ${bk.more.length+1} ${plural(bk.more.length+1,['устройство','устройства','устройств'])}</div>`+bk.more.map((d,i)=>`<div class="bdev"><span class="bdev-n">${i+1}</span><div><b>${esc(d.device)}</b><span>${esc(d.problem||'Диагностика')}</span></div><button type="button" class="x" data-rmdev="${i}" aria-label="Убрать устройство">${ico('x')}</button></div>`).join('')+`<div class="bdev cur"><span class="bdev-n">${bk.more.length+1}</span><div><b>Сейчас выбираете</b><span>Укажите технику, модель и проблему ниже</span></div></div>`:'';
  $('#bTypeL').textContent=bk.more.length?`Техника · устройство ${bk.more.length+1}`:'Техника';
  $('#bAddDev').hidden=bk.more.length>=4;
  try{ $('#bkChipT').textContent=bkChipText(); }catch(e){}
}
$('#bAddDev').addEventListener('click',()=>{
  if(!needModel()) return;
  if(!bk.issues.length&&!$('#bProblem').value.trim()){ const e=$('#askErr'); e.hidden=false; e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake'); return; }
  $('#askErr').hidden=true;
  bk.more.push(curDeviceSnap());
  bk.issues=[]; bk.model=''; bk.extra=[]; $('#bModel').value=''; $('#bProblem').value=''; $('#bProblem').hidden=true; $('#bOwn').classList.remove('on');
  renderBookPick(); renderDevs();
  $('#bDevs').scrollIntoView({behavior:'smooth',block:'center'});
  showToast('Устройство добавлено. Теперь выберите следующее.');
});
$('#bDevs').addEventListener('click',e=>{ const b=e.target.closest('[data-rmdev]'); if(!b) return; bk.more.splice(+b.dataset.rmdev,1); renderDevs(); });
bkChipText=(f=>function(){ const t=f(); return bk.more.length?`${t} · +${bk.more.length} ${plural(bk.more.length,['устройство','устройства','устройств'])}`:t; })(bkChipText);
renderDevs();
/* запись на телефоне: два шага с переключателем */
function bkChipText(){ const m=getModel(); const iss=bk.issues.length?bk.issues.join(', '):($('#bProblem').value.trim()||'проблема не выбрана'); return `${m||bk.brand} · ${iss}`; }
function setBStep(n){ const v=$('#v-book'); v.dataset.bstep=n; $$('#bkSteps [data-bstep]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.bstep==n)); $('#bkChipT').textContent=bkChipText();
  if(innerWidth<=1000){ requestAnimationFrame(()=>{
    const el=n==2?$('#chat'):$('.book2>.stack'), bar=document.querySelector('.itb'), barH=bar&&getComputedStyle(bar).display!=='none'?bar.offsetHeight:0, topH=document.querySelector('.topbar').offsetHeight;
    const r=el.getBoundingClientRect();
    if(n==2){ const y=scrollY+r.bottom-(innerHeight-barH-8); window.scrollTo({top:Math.max(0,y),behavior:'smooth'}); }
    else if(r.top<topH){ window.scrollTo({top:Math.max(0,scrollY+r.top-topH-70),behavior:'smooth'}); }
  }); } }
document.addEventListener('click',()=>{ if(window.scrollFx) requestAnimationFrame(()=>dispatchEvent(new Event('scroll'))); },true);
document.addEventListener('click',e=>{ const b=e.target.closest('button[data-bstep]'); if(!b) return; const n=+b.dataset.bstep; if(n===2&&!needModel()) return; setBStep(n); });
$('#bNext').addEventListener('click',()=>{ if(needModel()) setBStep(2); });
$('#v-book').dataset.bstep=1;
renderBookPick=(f=>function(){ f(); if(getModel()){ $('#modelErr').hidden=true; $('#ddModel .dd-btn').classList.remove('err'); } })(renderBookPick);
if(matchMedia('(max-width:640px)').matches) $('#cIn').placeholder='Сообщение помощнику';

/* отзывы на телефоне: компактная сводка, фильтр, список по 3, раскрытие текста */
const rvM={f:'all',shown:3};
function rvMarkLong(){ $$('#rvList .rv-item').forEach(it=>{ if(it.classList.contains('full')) return; const p=it.querySelector('p'); it.classList.toggle('long',p.scrollHeight>p.clientHeight+2); }); }
function rvFiltered(){ return reviews.filter(r=>rvM.f==='all'||(rvM.f==='3'?r.s<=3:r.s==+rvM.f)); }
function renderRvM(animFrom=0){
  const all=[0,0,0,0,0,0]; reviews.forEach(r=>all[r.s]++); const total=all.reduce((a,b)=>a+b,0), mean=all.reduce((a,c,i)=>a+c*i,0)/total;
  $('#avgM').textContent=mean.toFixed(1).replace('.',','); $('#avgStarsM').innerHTML=stars(Math.round(mean));
  $('#rvCount').textContent=`${total} ${(n=>n%10==1&&n%100!=11?'оценка':n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'оценки':'оценок')(total)}`;
  $('#barsM').innerHTML=[5,4,3,2,1].map(i=>`<div><span>${i}</span><i><b style="--w:${(all[i]/total*100).toFixed(1)}%"></b></i></div>`).join('');
  const list=rvFiltered(), vis=list.slice(0,rvM.shown);
  $('#rvList').innerHTML=vis.length?vis.map((r,k)=>`<article class="rv-item${k>=animFrom?' rv-in':''}" style="--k:${Math.max(0,k-animFrom)}"><div class="rv-top"><span class="ava c-${tones[(reviews.indexOf(r))%4]}">${esc(r.n[0])}</span><div class="rv-who"><h4>${esc(r.n)}</h4><div class="stars">${stars(r.s)}</div></div></div><p>${esc(r.t)}</p></article>`).join(''):'<p class="rv-empty">Таких отзывов пока нет</p>';
  rvMarkLong();
  const left=list.length-vis.length; $('#rvMore').hidden=left<=0; $('#rvMore span').textContent=`Показать ещё ${Math.min(3,left)}`;
  requestAnimationFrame(()=>$$('#barsM b').forEach(b=>b.classList.add('go')));
}
$('#rvFilter').addEventListener('click',e=>{ const b=e.target.closest('[data-f]'); if(!b) return; rvM.f=b.dataset.f; rvM.shown=3;
  $$('#rvFilter [data-f]').forEach(x=>x.setAttribute('aria-pressed',x===b)); const ind=$('#rvFilter .rv-ind'); ind.style.width=b.offsetWidth+'px'; ind.style.transform=`translateX(${b.offsetLeft-4}px)`; renderRvM(0); });
$('#rvMore').addEventListener('click',()=>{ const from=rvM.shown; rvM.shown+=3; renderRvM(from); });
$('#rvList').addEventListener('click',e=>{ const it=e.target.closest('.rv-item.long'); if(it) it.classList.toggle('full'); });
renderReviews=(f=>function(){ f(); renderRvM(0); })(renderReviews);
for(const n of ['renderDishes','renderRvM','renderReceipts']){ const f=window[n]; if(typeof f==='function') window[n]=function(...a){ const r=f.apply(this,a); if(window.scrollFx) scrollFx.refresh(); return r; }; }
renderRvM(0);
if(matchMedia('(max-width:640px)').matches){ $('#revOrder').placeholder='Заказ RM-0000'; $('#rcNum').placeholder='Например, RM-2481'; $('#stNum').placeholder='Например, RM-2481'; }
requestAnimationFrame(()=>{ const b=$('#rvFilter [aria-pressed="true"]'), ind=$('#rvFilter .rv-ind'); if(b&&b.offsetWidth){ ind.style.width=b.offsetWidth+'px'; ind.style.transform=`translateX(${b.offsetLeft-4}px)`; } });
/* форма отзыва на телефоне сворачивается */
$('#revForm .block-head').addEventListener('click',e=>{ if(innerWidth>640||e.target.closest('.pick')) return; $('#revForm').classList.toggle('open'); });
$('#pick').addEventListener('click',()=>{ if(innerWidth<=640) $('#revForm').classList.add('open'); });


/* прокрутка: блоки мягко уходят под верхнюю панель и выплывают снизу */
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const SEL='.photo,.welcome,.qcard,.sec-title,.dev,.marquee,.svc-sec,.svc-h,.svc-row,.block,.bsec,.rv-sum,.rv-filter,.rv-item,.rv-more,.review,.rev-form,.place,.map,.rc,.rc-find,.rc-empty,.bk-steps,.bk-chip,.self .field,.footer';
  let els=[], vis=new Set(), raf=0;
  const io=new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting) vis.add(e.target); else { vis.delete(e.target); reset(e.target); } }); tick(); },{rootMargin:'40px 0px'});
  function reset(el){ el.style.translate=''; el.style.scale=''; el.style.filter=''; }
  function collect(){ io.disconnect(); vis.clear(); els.forEach(reset);
    const cand=[...document.querySelectorAll(SEL)].filter(el=>!el.closest('[hidden],dialog,.dd-list') && getComputedStyle(el).position!=='sticky' && !el.querySelector('.chat') && el.getClientRects().length && !(innerWidth<=760 && el.classList.contains('svc-sec')));
    const set=new Set(cand), picked=new Set();
    cand.forEach(el=>{
      for(let p=el.parentElement;p;p=p.parentElement){ if(picked.has(p)) return; if(getComputedStyle(p).position==='sticky') return; }
      const container=cand.some(o=>o!==el&&el.contains(o));
      if(container && el.getBoundingClientRect().height>innerHeight*.6) return;   // большой контейнер — анимируем его содержимое
      picked.add(el);
    });
    els=[...picked];
    els.forEach(el=>{ el.style.willChange='translate,scale,filter'; io.observe(el); }); }
  const cur=new WeakMap();
  function frame(){ raf=0;
    let top=(document.querySelector('.topbar')?.getBoundingClientRect().bottom||0);
    const sn=document.querySelector('#v-menu:not([hidden]) .svc-nav'); if(sn){ const q=sn.getBoundingClientRect(); if(q.top<=top+4) top=Math.max(top,q.bottom); }
    const bar=document.querySelector('.itb'); const bottom=innerHeight-(bar&&getComputedStyle(bar).display!=='none'?bar.offsetHeight:0);
    const Z=innerWidth<=640?64:84;                       // работает только у самых краёв
    let moving=false;
    vis.forEach(el=>{
      if(el.querySelector('.dd.open')){ reset(el); cur.delete(el); return; }
      const r=el.getBoundingClientRect(), z=Math.min(Z,r.height*.8);
      let t=0,dir=0;
      const dTop=r.bottom-top; if(dTop<z){ t=Math.max(t,1-Math.max(0,dTop)/z); dir=-1; }
      const dBot=bottom-r.top; if(dBot<z){ const k=1-Math.max(0,dBot)/z; if(k>t){ t=k; dir=1; } }
      t=Math.min(1,Math.max(0,t)); const e=t*t*t*(t*(t*6-15)+10);   // smootherstep
      const tgt={ty:dir*10*e, sc:1-.04*e, op:1-.8*e, bl:3*e};
      const c=cur.get(el)||{ty:0,sc:1,op:1,bl:0};
      for(const k in tgt){ c[k]+=(tgt[k]-c[k])*.22; if(Math.abs(tgt[k]-c[k])>.002) moving=true; else c[k]=tgt[k]; }
      cur.set(el,c);
      if(c.op>.997&&c.bl<.05&&Math.abs(c.ty)<.05){ reset(el); return; }
      el.style.translate=`0 ${c.ty.toFixed(2)}px`; el.style.scale=c.sc.toFixed(4);
      el.style.filter=`opacity(${c.op.toFixed(3)})${c.bl>.15?` blur(${c.bl.toFixed(2)}px)`:''}`;
    });
    if(moving) tick();
  }
  function tick(){ if(!raf) raf=requestAnimationFrame(frame); }
  addEventListener('scroll',tick,{passive:true}); addEventListener('resize',()=>{ collect(); tick(); });
  window.scrollFx={refresh(){ requestAnimationFrame(()=>{ collect(); tick(); }); },get list(){ return els; }};
  collect(); tick();
})();
/* ===== старт ===== */
setSvc('phone'); renderBookPick(); resetChat();
go((location.hash||'#home').slice(1),false); paintOpen();
/* фон: островки синих пикселей — появляются у краёв экрана, мягко загораются и гаснут */
(function(){
  const c=document.getElementById('energy'); if(!c||!c.getContext) return;
  const x=c.getContext('2d',{alpha:false});
  let W=0,H=0,DPR=1,G=22,pts=[];
  function resize(){
    DPR=Math.min(2,window.devicePixelRatio||1); W=innerWidth; H=innerHeight;
    c.width=Math.round(W*DPR); c.height=Math.round(H*DPR); x.setTransform(DPR,0,0,DPR,0,0);
    G=W<=640?13:16; pts=[];
    const ox=(W%G)/2+G/2, oy=(H%G)/2+G/2;
    for(let yy=oy;yy<H;yy+=G) for(let xx=ox;xx<W;xx+=G){
      const h=Math.sin(xx*12.9898+yy*78.233)*43758.5453; pts.push(xx,yy,(h-Math.floor(h))*6.283);
    }
  }
  resize(); addEventListener('resize',resize);
  // островки всегда на экране: медленно плывут по плавным траекториям и перетекают друг в друга при встрече
  const isl=[
    {bx:.40,by:.40,ax:.36,ay:.34,f1:.032,f2:.026,p:0.0,r:.14,sx:1.25},
    {bx:.62,by:.60,ax:.34,ay:.36,f1:.027,f2:.035,p:2.1,r:.13,sx:.85},
    {bx:.50,by:.30,ax:.40,ay:.26,f1:.023,f2:.030,p:4.0,r:.11,sx:1.4},
    {bx:.45,by:.70,ax:.38,ay:.26,f1:.035,f2:.021,p:5.3,r:.12,sx:1.1}
  ];
  const LV=12, buckets=Array.from({length:LV},()=>[]);
  const cols=Array.from({length:LV},(_,k)=>{ const v=(k+1)/LV;
    const r=Math.round(60+v*100), g=Math.round(100+v*95), b=Math.round(215+v*40), a=(.06+v*.8).toFixed(3);
    return `rgba(${r},${g},${b},${a})`; });
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last=0;
  function frame(now){
    if(!still) requestAnimationFrame(frame);
    if(!still && now-last<33) return; last=now;
    const t=now/1000, m=Math.max(W,H);
    const A=isl.map(b=>{
      const cx=(b.bx+b.ax*Math.sin(t*b.f1*2*Math.PI+b.p)+b.ax*.3*Math.sin(t*b.f2*2*Math.PI*.7+b.p*2))*W;
      const cy=(b.by+b.ay*Math.cos(t*b.f2*2*Math.PI+b.p)+b.ay*.3*Math.sin(t*b.f1*2*Math.PI*.8+b.p))*H;
      const r=b.r*m*(1+.3*Math.sin(t*.33+b.p*1.7));
      const sx=b.sx*Math.exp(.55*Math.sin(t*.27+b.p*2.3));          // вытягивание: от «капли» до «ленты»
      const th=t*.11*(b.p%2?1:-1)+b.p;                              // медленный поворот формы
      return [cx,cy,1/(r*r*sx),sx/(r*r),1,Math.cos(th),Math.sin(th)];
    });
    for(const k of buckets) k.length=0;
    if(A.length) for(let i=0;i<pts.length;i+=3){
      const px=pts[i],py=pts[i+1]; let v=0;
      for(const [cx,cy,ix,iy,w,co,si] of A){ const qx=px-cx,qy=py-cy, dx=qx*co+qy*si, dy=qy*co-qx*si; const e=dx*dx*ix+dy*dy*iy; if(e<9) v+=w*Math.exp(-e); }
      if(v<.05) continue;
      v=v*v*(1.6-.6*v);                                     // мягкая виньетка по краю островка
      if(v<.04) continue;
      v*=.84+.16*Math.sin(t*.8+pts[i+2]);
      if(v>1) v=1;
      buckets[Math.min(LV-1,Math.floor(v*LV))].push(px,py);
    }
    x.fillStyle='#010205'; x.fillRect(0,0,W,H);
    for(let k=0;k<LV;k++){ const a=buckets[k]; if(!a.length) continue; const v=(k+1)/LV, s=.6+v*2.1, h=s/2;
      x.fillStyle=cols[k]; x.beginPath(); for(let i=0;i<a.length;i+=2) x.rect(a[i]-h,a[i+1]-h,s,s); x.fill(); }
  }
  requestAnimationFrame(frame);
})();
