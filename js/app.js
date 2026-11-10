(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => new Intl.NumberFormat('ru-RU').format(Math.round(n)).replace(/ | /g, ' ') + ' ₸';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, [one, few, many]) => {
    const a = n % 10, b = n % 100;
    return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
  };
  const store = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* приватный режим — живём без сохранения */ } },
  };

  const D = CONFIG.delivery;

  /* ---------- контакты из конфига ---------- */
  const telHref = 'tel:+' + CONFIG.phone.replace(/\D/g, '');
  const waBase = 'https://wa.me/' + CONFIG.whatsapp;
  $$('[data-phone]').forEach(el => el.textContent = CONFIG.phone);
  $$('[data-phone-link]').forEach(el => el.href = telHref);
  $$('[data-city]').forEach(el => el.textContent = CONFIG.city);
  $$('[data-address]').forEach(el => el.textContent = CONFIG.address);
  $$('[data-landmark]').forEach(el => el.textContent = CONFIG.landmark || '');
  $$('[data-open]').forEach(el => el.textContent = CONFIG.hours.open);
  $$('[data-close]').forEach(el => el.textContent = CONFIG.hours.close);
  $$('[data-wa-link]').forEach(el => el.href = waBase + '?text=' + encodeURIComponent('Здравствуйте! Хочу сделать заказ.'));
  $$('[data-2gis-link]').forEach(el => el.href = CONFIG.twoGis);
  $$('[data-ig-link]').forEach(el => { if (CONFIG.instagram) { el.href = CONFIG.instagram; el.hidden = false; } });
  $$('[data-delivery-time]').forEach(el => el.textContent = D.time);
  $$('[data-pickup-time]').forEach(el => el.textContent = D.pickupTime);
  $$('[data-delivery-fee]').forEach(el => el.textContent = money(D.fee).replace(' ₸', ''));
  $$('[data-delivery-free]').forEach(el => el.textContent = money(D.freeFrom).replace(' ₸', ''));
  $$('[data-delivery-min]').forEach(el => el.textContent = money(D.minOrder).replace(' ₸', ''));
  $$('[data-pickup-discount]').forEach(el => el.textContent = D.pickupDiscount);
  $('#year').textContent = new Date().getFullYear();

  // карта
  {
    const { lat, lon, zoom, pin } = CONFIG.map;
    const span = 360 / Math.pow(2, zoom) * 1.6;
    const bbox = [lon - span, lat - span / 2.6, lon + span, lat + span / 2.6].map(n => n.toFixed(5)).join(',');
    $('#map').src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik` + (pin ? `&marker=${lat},${lon}` : '');
  }

  // разметка для поисковиков
  {
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FastFoodRestaurant', name: CONFIG.name,
      servesCuisine: 'Шаурма', priceRange: '₸', telephone: '+' + CONFIG.phone.replace(/\D/g, ''),
      address: { '@type': 'PostalAddress', addressLocality: CONFIG.city, streetAddress: CONFIG.address, addressCountry: 'KZ' },
      openingHours: `Mo-Su ${CONFIG.hours.open}-${CONFIG.hours.close}`,
    });
    document.head.append(ld);
  }

  /* ---------- часы работы ---------- */
  const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const fromMin = m => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  const OPEN = toMin(CONFIG.hours.open);
  const CLOSE = toMin(CONFIG.hours.close) <= OPEN ? toMin(CONFIG.hours.close) + 1440 : toMin(CONFIG.hours.close);

  function nowLocal() {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: CONFIG.timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const h = +parts.find(p => p.type === 'hour').value % 24, m = +parts.find(p => p.type === 'minute').value;
    return h * 60 + m;
  }
  // минуты «рабочего дня»: после полуночи продолжаем счёт вчерашней смены
  function shiftNow() { const n = nowLocal(); return n + 1440 < CLOSE ? n + 1440 : n; }
  function isOpen() { const n = shiftNow(); return n >= OPEN && n < CLOSE; }

  function paintStatus() {
    const open = isOpen();
    const left = CLOSE - shiftNow();
    const text = open
      ? (left <= 45 ? `Закрываемся через ${left} мин` : `Открыто до ${CONFIG.hours.close}`)
      : `Закрыто, откроемся в ${CONFIG.hours.open}`;
    $$('[data-status]').forEach(el => {
      el.classList.toggle('is-open', open);
      el.classList.toggle('is-closed', !open);
      $('[data-status-text]', el).textContent = text;
    });
  }
  paintStatus();
  setInterval(paintStatus, 30000);

  /* ---------- шапка ---------- */
  const header = $('#header'), nav = $('#nav'), burger = $('#burger');
  const onScroll = () => header.classList.toggle('is-solid', scrollY > innerHeight - 90);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setNav(open) {
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-menu', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть разделы' : 'Открыть разделы');
  }
  burger.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });

  /* ---------- шаурма следит за курсором ---------- */
  {
    const stage = $('#stage'), photo = $('#heroPhoto');
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!calm && matchMedia('(hover: hover)').matches) {
      let raf = 0;
      stage.addEventListener('pointermove', e => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = stage.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
          photo.style.setProperty('--px', (x * 26).toFixed(1) + 'px');
          photo.style.setProperty('--py', (y * 18).toFixed(1) + 'px');
          photo.style.setProperty('--rot', (-7 + x * 7).toFixed(2) + 'deg');
        });
      });
      stage.addEventListener('pointerleave', () => {
        photo.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)';
        photo.style.setProperty('--px', '0px'); photo.style.setProperty('--py', '0px'); photo.style.setProperty('--rot', '-7deg');
        setTimeout(() => photo.style.transition = '', 600);
      });
    }
  }

  /* ---------- корзина: данные ---------- */
  let cart = store.get('ashot-cart', []);       // [{key, name, meta, price, qty}]
  let mode = store.get('ashot-mode', 'delivery');
  const saveCart = () => store.set('ashot-cart', cart);

  function totals() {
    const count = cart.reduce((s, l) => s + l.qty, 0);
    const sub = cart.reduce((s, l) => s + l.qty * l.price, 0);
    const discount = mode === 'pickup' ? Math.round(sub * D.pickupDiscount / 100) : 0;
    const fee = mode === 'delivery' && sub > 0 && sub < D.freeFrom ? D.fee : 0;
    const belowMin = mode === 'delivery' && sub > 0 && sub < D.minOrder;
    return { count, sub, discount, fee, belowMin, total: sub - discount + fee };
  }

  function addLine(line, silent) {
    const found = cart.find(l => l.key === line.key);
    if (found) found.qty += line.qty || 1; else cart.push({ ...line, qty: line.qty || 1 });
    saveCart(); paintCart(true);
    if (!silent) toast(`В корзине: ${line.name}${line.meta ? ', ' + line.meta : ''}`);
  }
  function changeQty(key, delta) {
    const line = cart.find(l => l.key === key);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart = cart.filter(l => l.key !== key);
    saveCart(); paintCart();
  }

  /* ---------- меню ---------- */
  const TAGS = { hit: 'хит', hot: 'острое', veg: 'без мяса', new: 'новинка' };
  const menuList = $('#menuList'), chips = $('#chips');
  const filters = { q: '', noHot: false, veg: false };

  chips.innerHTML = CATEGORIES.map(c => `<a class="chip" href="#cat-${c.id}" data-chip="${c.id}">${esc(c.title)}</a>`).join('');

  function paintMenu() {
    const q = filters.q.trim().toLowerCase();
    const match = d => (!q || (d.name + ' ' + d.desc).toLowerCase().includes(q))
      && (!filters.noHot || !d.tags.includes('hot'))
      && (!filters.veg || d.tags.includes('veg') || d.cat === 'drinks');

    const html = CATEGORIES.map(c => {
      const dishes = MENU.filter(d => d.cat === c.id && match(d));
      if (!dishes.length) return '';
      return `<section class="cat" id="cat-${c.id}" data-cat="${c.id}">
        <h3 class="cat__title">${esc(c.title)}</h3>
        ${c.note ? `<p class="cat__note">${esc(c.note)}</p>` : ''}
        <ul class="cat__list">${dishes.map(dishHtml).join('')}</ul>
      </section>`;
    }).join('');

    menuList.innerHTML = html || `<p class="menu__empty">Ничего не нашли. <button type="button" id="resetFilters">Показать всё меню</button></p>`;
    $$('.chip').forEach(ch => ch.hidden = !$(`#cat-${ch.dataset.chip}`));
    markInCart();
    watchCats();
  }

  function dishHtml(d) {
    const tags = d.tags.map(t => `<span class="tag tag--${t}">${TAGS[t]}</span>`).join('');
    const buys = d.variants.map((v, i) =>
      `<button class="buy" type="button" data-add="${d.id}:${i}" aria-label="Добавить в корзину: ${esc(d.name)}, ${esc(v.label)}, ${money(v.price)}">
        <small>${esc(v.label)}</small><span>${money(v.price)}</span><i aria-hidden="true">+</i>
      </button>`).join('');
    return `<li class="dish">
      <div><p class="dish__name">${esc(d.name)} ${tags}</p>${d.desc ? `<p class="dish__desc">${esc(d.desc)}</p>` : ''}</div>
      <div class="dish__buy">${buys}</div>
    </li>`;
  }

  function markInCart() {
    $$('[data-add]').forEach(b => {
      const line = cart.find(l => l.key === b.dataset.add);
      b.classList.toggle('is-in', !!line);
      $('i', b).textContent = line ? line.qty : '+';
    });
  }

  menuList.addEventListener('click', e => {
    const b = e.target.closest('[data-add]');
    if (b) {
      const [id, i] = b.dataset.add.split(':');
      const d = MENU.find(x => x.id === id), v = d.variants[+i];
      const catTitle = d.cat === 'shawarma' ? 'Шаурма «' + d.name + '»' : d.cat === 'sauces' ? 'Соус ' + d.name.toLowerCase() : d.name;
      addLine({ key: b.dataset.add, name: catTitle, meta: v.label, price: v.price });
      return;
    }
    if (e.target.id === 'resetFilters') {
      filters.q = ''; filters.noHot = filters.veg = false;
      $('#search').value = ''; $('#noHot').checked = $('#vegOnly').checked = false;
      paintMenu();
    }
  });
  $('#search').addEventListener('input', e => { filters.q = e.target.value; paintMenu(); });
  $('#noHot').addEventListener('change', e => { filters.noHot = e.target.checked; paintMenu(); });
  $('#vegOnly').addEventListener('change', e => { filters.veg = e.target.checked; paintMenu(); });

  // подсветка текущей категории
  let catRaf = 0;
  function watchCats() {
    cancelAnimationFrame(catRaf);
    catRaf = requestAnimationFrame(() => {
      const line = innerHeight * .38;
      let current = null;
      $$('.cat').forEach(c => { if (c.getBoundingClientRect().top <= line) current = c.dataset.cat; });
      current = current || $('.cat')?.dataset.cat;
      const was = $('.chip.is-active');
      if (was?.dataset.chip === current) return;
      $$('.chip').forEach(ch => ch.classList.toggle('is-active', ch.dataset.chip === current));
      const active = $('.chip.is-active');
      if (active) chips.scrollTo({ left: active.offsetLeft - chips.offsetLeft - 16, behavior: 'smooth' });
    });
  }
  addEventListener('scroll', watchCats, { passive: true });

  /* ---------- корзина: отрисовка ---------- */
  const cartDialog = $('#cart'), orderForm = $('#order'), doneBox = $('#done');
  let lastWaUrl = '';

  function linesHtml() {
    return cart.map(l => `<div class="line">
      <p class="line__name">${esc(l.name)}</p>
      <p class="line__sum">${money(l.price * l.qty)}</p>
      <p class="line__meta">${esc(l.meta || '')}</p>
      <div class="line__qty">
        <button type="button" data-qty="-1" data-key="${esc(l.key)}" aria-label="Убрать одну: ${esc(l.name)}">−</button>
        <span aria-label="Количество">${l.qty}</span>
        <button type="button" data-qty="1" data-key="${esc(l.key)}" aria-label="Добавить ещё одну: ${esc(l.name)}">+</button>
      </div>
    </div>`).join('');
  }

  function sumHtml(t) {
    const rows = [`<div><span>${t.count} ${plural(t.count, ['позиция', 'позиции', 'позиций'])}</span><span>${money(t.sub)}</span></div>`];
    if (t.discount) rows.push(`<div><span>Скидка за самовывоз ${D.pickupDiscount}%</span><span>−${money(t.discount)}</span></div>`);
    if (mode === 'delivery') rows.push(`<div><span>Доставка</span><span>${t.fee ? money(t.fee) : 'бесплатно'}</span></div>`);
    rows.push(`<div class="sum__total"><span>Итого</span><span>${money(t.total)}</span></div>`);
    let note = '';
    if (t.belowMin) note = `До минимального заказа на доставку не хватает <b>${money(D.minOrder - t.sub)}</b>. Или заберите сами.`;
    else if (t.fee) note = `Ещё <b>${money(D.freeFrom - t.sub)}</b>, и доставка станет бесплатной.`;
    return `<div class="sum">${rows.join('')}</div>${note ? `<p class="sum__note">${note}</p>` : ''}`;
  }

  function paintCart(bump) {
    const t = totals();
    const last = store.get('ashot-last', null);

    // счётчики
    $$('[data-cart-count]').forEach(el => {
      el.textContent = t.count;
      if (el.classList.contains('top__count')) {
        el.hidden = !t.count;
        if (bump) { el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump'); }
      }
    });
    $$('[data-cart-sum]').forEach(el => el.textContent = money(t.total));
    const dock = $('.dock');
    dock.hidden = !t.count;
    document.body.classList.toggle('has-dock', !!t.count);

    const emptySide = `<div class="empty"><p>Пока пусто. Нажмите на цену в меню, и блюдо появится здесь.</p>
      ${last ? '<button class="btn btn--line" type="button" data-repeat>Повторить прошлый заказ</button>' : ''}</div>`;
    const emptyCart = `<div class="empty"><p>В корзине пока ничего нет.</p>
      <button class="btn btn--dark" type="button" data-go-menu>Перейти в меню</button>
      ${last ? '<button class="btn btn--line-dark" type="button" data-repeat>Повторить прошлый заказ</button>' : ''}</div>`;

    $('[data-cart-items="side"]').innerHTML = t.count ? linesHtml() : emptySide;
    $('[data-cart-foot="side"]').innerHTML = t.count
      ? sumHtml(t) + `<button class="btn btn--fire" type="button" data-open-cart>Оформить заказ</button>` : '';

    if (!doneBox.hidden && t.count) doneBox.hidden = true;
    if (doneBox.hidden) {
      $('[data-cart-items="cart"]').innerHTML = t.count ? linesHtml() : emptyCart;
      orderForm.hidden = !t.count;
      $('[data-cart-foot="cart"]').innerHTML = t.count
        ? sumHtml(t) + `<button class="btn btn--dark" type="submit" form="order" ${t.belowMin ? 'disabled' : ''}>Отправить заказ в WhatsApp</button>` : '';
    }
    paintMode();
    markInCart();
  }

  function paintMode() {
    $$('input[name="mode"]', orderForm).forEach(r => r.checked = r.value === mode);
    $$('[data-only="delivery"]', orderForm).forEach(el => el.hidden = mode !== 'delivery');
    $('#modeHint').textContent = mode === 'delivery'
      ? `Привезём за ${D.time}. Доставка ${money(D.fee)}, от ${money(D.freeFrom)} бесплатно.`
      : `Заберите сами: ${CONFIG.city}, ${CONFIG.address}. Будет готово через ${D.pickupTime}, скидка ${D.pickupDiscount}%.`;
  }

  function paintTimes() {
    const sel = $('#f-time'), open = isOpen();
    const start = open ? Math.ceil((shiftNow() + (mode === 'delivery' ? 50 : 20)) / 15) * 15 : OPEN + 30;
    const opts = [open ? '<option value="Как можно скорее">Как можно скорее</option>' : ''];
    for (let m = start; m <= CLOSE - 15; m += 15) opts.push(`<option value="К ${fromMin(m)}">К ${fromMin(m)}</option>`);
    sel.innerHTML = opts.join('');
  }

  function openCart() {
    setNav(false);
    doneBox.hidden = true;
    paintCart(); paintTimes();
    if (!cartDialog.open) cartDialog.showModal();
    $('#cartScroll').scrollTop = 0;
  }
  const closeCart = () => cartDialog.open && cartDialog.close();

  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-open-cart]')) return openCart();
    if (t.closest('[data-close-cart]')) return closeCart();
    if (t.closest('[data-go-menu]')) { closeCart(); return $('#menu').scrollIntoView(); }
    if (t.closest('[data-repeat]')) {
      const last = store.get('ashot-last', []);
      last.forEach(l => addLine(l, true));
      return toast('Добавили прошлый заказ в корзину');
    }
    const q = t.closest('[data-qty]');
    if (q) changeQty(q.dataset.key, +q.dataset.qty);
  });
  cartDialog.addEventListener('click', e => { if (e.target === cartDialog) closeCart(); });

  /* ---------- оформление ---------- */
  // сохранённые данные покупателя
  const saved = store.get('ashot-user', {});
  ['name', 'phone', 'street', 'flat', 'entrance', 'floor'].forEach(k => { if (saved[k]) orderForm.elements[k].value = saved[k]; });

  orderForm.addEventListener('change', e => {
    if (e.target.name === 'mode') { mode = e.target.value; store.set('ashot-mode', mode); paintCart(); paintTimes(); }
    if (e.target.name === 'pay') $('[data-only="cash"]', orderForm).hidden = e.target.value !== 'Наличные';
  });

  // маска телефона: +7 (7xx) xxx-xx-xx
  const phoneInput = $('#f-phone');
  const phoneDigits = v => {
    const raw = v.trim();
    let d;
    if (raw.startsWith('+7')) d = raw.slice(2).replace(/\D/g, '');
    else { d = raw.replace(/\D/g, ''); if (d[0] === '8') d = d.slice(1); }
    if (d.length > 10 && d[0] === '7') d = d.slice(1); // набрали 7 701… без плюса
    return d.slice(0, 10);
  };
  const phoneFormat = d => '+7 (' + d.slice(0, 3) + (d.length > 3 ? ') ' + d.slice(3, 6) : '') + (d.length > 6 ? '-' + d.slice(6, 8) : '') + (d.length > 8 ? '-' + d.slice(8, 10) : '');
  phoneInput.addEventListener('input', e => {
    const d = phoneDigits(phoneInput.value);
    const erasing = e.inputType && e.inputType.startsWith('delete');
    // пустое поле остаётся пустым, первая же цифра сразу даёт «+7 (»
    phoneInput.value = (!d && (erasing || !/\d/.test(phoneInput.value))) ? '' : phoneFormat(d);
  });
  if (phoneDigits(phoneInput.value)) phoneInput.value = phoneFormat(phoneDigits(phoneInput.value));

  function setErr(name, msg) {
    const el = $(`[data-err="${name}"]`, orderForm), input = orderForm.elements[name];
    el.textContent = msg || '';
    input.closest('.field').classList.toggle('is-bad', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  orderForm.addEventListener('input', e => { if (e.target.name && $(`[data-err="${e.target.name}"]`, orderForm)) setErr(e.target.name, ''); });

  orderForm.addEventListener('submit', e => {
    e.preventDefault();
    const f = orderForm.elements, t = totals();
    if (!t.count || t.belowMin) return;

    const okName = setErr('name', f.name.value.trim().length < 2 ? 'Напишите, как к вам обращаться.' : '');
    const okPhone = setErr('phone', phoneDigits(f.phone.value).length < 10 ? 'Введите номер полностью: 10 цифр после +7.' : '');
    const okStreet = mode !== 'delivery' || setErr('street', f.street.value.trim().length < 4 ? 'Укажите улицу и номер дома, чтобы курьер вас нашёл.' : '');
    if (!(okName && okPhone && okStreet)) {
      $('.is-bad input', orderForm)?.focus();
      return;
    }

    store.set('ashot-user', { name: f.name.value.trim(), phone: f.phone.value, street: f.street.value.trim(), flat: f.flat.value, entrance: f.entrance.value, floor: f.floor.value });

    const lines = cart.map((l, i) => `${i + 1}. ${l.name}${l.meta ? ', ' + l.meta : ''} × ${l.qty} — ${money(l.price * l.qty)}`);
    const addr = [f.street.value.trim(), f.flat.value && 'кв./офис ' + f.flat.value, f.entrance.value && 'подъезд ' + f.entrance.value, f.floor.value && 'этаж ' + f.floor.value].filter(Boolean).join(', ');
    const msg = [
      `Здравствуйте! Заказ с сайта «${CONFIG.name}»`, '',
      ...lines, '',
      `Сумма: ${money(t.sub)}`,
      t.discount ? `Скидка за самовывоз: −${money(t.discount)}` : null,
      mode === 'delivery' ? `Доставка: ${t.fee ? money(t.fee) : 'бесплатно'}` : null,
      `Итого: ${money(t.total)}`, '',
      `Имя: ${f.name.value.trim()}`,
      `Телефон: ${f.phone.value}`,
      mode === 'delivery' ? `Доставка: ${addr}` : 'Самовывоз',
      `Время: ${f.time.value}`,
      `Оплата: ${f.pay.value}${f.pay.value === 'Наличные' && f.change.value ? ', сдача с ' + f.change.value : ''}`,
      f.comment.value.trim() ? `Комментарий: ${f.comment.value.trim()}` : null,
    ].filter(l => l !== null).join('\n');

    lastWaUrl = waBase + '?text=' + encodeURIComponent(msg);
    window.open(lastWaUrl, '_blank', 'noopener');

    store.set('ashot-last', cart);
    cart = []; saveCart();
    $('#doneWa').href = lastWaUrl;
    paintCart();
    $('[data-cart-items="cart"]').innerHTML = '';
    orderForm.hidden = true;
    doneBox.hidden = false;
    f.comment.value = '';
    $('#cartScroll').scrollTop = 0;
  });

  /* ---------- конструктор ---------- */
  const builder = $('#builder');
  const group = (title, name, type, items, checkedId) => `<fieldset class="group">
    <legend>${title}</legend>
    <div class="group__opts">${items.map(o => `<label class="opt">
      <input type="${type}" name="${name}" value="${o.id}" ${o.id === checkedId ? 'checked' : ''}>
      <span>${esc(o.name)}${o.hint ? ` <small>${esc(o.hint)}</small>` : ''}${o.price && name !== 'filling' ? ` <small>+${money(o.price)}</small>` : ''}${name === 'filling' ? ` <small>${money(o.price)}</small>` : ''}</span>
    </label>`).join('')}</div>
  </fieldset>`;

  builder.innerHTML =
    group('Начинка', 'filling', 'radio', BUILDER.filling, 'chicken') +
    group('Размер', 'size', 'radio', BUILDER.size, 'm') +
    group('Лаваш', 'lavash', 'radio', BUILDER.lavash, 'plain') +
    group('Соус', 'sauce', 'radio', BUILDER.sauce, 'garlic') +
    group('Добавить', 'extras', 'checkbox', BUILDER.extras) +
    group('Убрать', 'without', 'checkbox', BUILDER.without);

  function readBuilder() {
    const fd = new FormData(builder);
    const pick = (k) => BUILDER[k].find(o => o.id === fd.get(k));
    const filling = pick('filling'), size = pick('size'), lavash = pick('lavash'), sauce = pick('sauce');
    const extras = BUILDER.extras.filter(o => fd.getAll('extras').includes(o.id));
    const without = BUILDER.without.filter(o => fd.getAll('without').includes(o.id));
    const price = filling.price + size.price + lavash.price + extras.reduce((s, o) => s + o.price, 0);
    const parts = [
      `${filling.name}, ${size.name.toLowerCase()} ${size.hint}`,
      `лаваш ${lavash.name.toLowerCase()}`,
      `соус ${sauce.name.toLowerCase()}`,
      ...extras.map(o => '+ ' + o.name.toLowerCase()),
      ...without.map(o => o.name.toLowerCase()),
    ];
    return { price, parts, key: 'b:' + [filling.id, size.id, lavash.id, sauce.id, extras.map(o => o.id).join('.'), without.map(o => o.id).join('.')].join('|') };
  }
  function paintBuilder() {
    const b = readBuilder();
    $('#buildDesc').textContent = b.parts.join(', ') + '.';
    $('#buildPrice').textContent = money(b.price);
  }
  builder.addEventListener('change', paintBuilder);
  $('#buildAdd').addEventListener('click', () => {
    const b = readBuilder();
    addLine({ key: b.key, name: 'Своя шаурма', meta: b.parts.join(', '), price: b.price }, true);
    toast('Ваша шаурма в корзине');
  });
  paintBuilder();

  /* ---------- вопросы ---------- */
  $('#faq').insertAdjacentHTML('beforeend', FAQ.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join(''));

  /* ---------- уведомление ---------- */
  let toastTimer;
  function toast(text) {
    const el = $('#toast');
    el.textContent = text.length > 70 ? text.slice(0, 68) + '…' : text;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2200);
  }

  /* ---------- старт ---------- */
  paintMenu();
  paintCart();
})();
