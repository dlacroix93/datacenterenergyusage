/* ===================================================================
   Data Center Energy Usage — main.js
   =================================================================== */

/* ---------- DOM helper ---------- */
function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) for (const k in props) {
    const v = props[k];
    if (v == null) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(kid));
  }
  return el;
}

/* ---------- formatting ---------- */
const fmtUSD = n => '$' + Math.round(n).toLocaleString('en-US');
function fmtVal(unit, n) {
  if (unit === 'usd') return fmtUSD(n);
  if (unit === 'gal') return n.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' gal';
  return String(n);
}
function fmtBalance(unit, n) {
  const s = fmtVal(unit, Math.abs(n));
  return n < 0 ? '−' + s + ' over' : s;
}

/* ---------- data model ---------- */
const SHARE_URL = 'https://www.datacenterenergyusage.com';

const TABS = {
  energy: {
    label: 'Energy',
    unit: 'usd',
    budget: 61837500000,
    goal: "this year's bill",
    spentWord: 'SPENT',
    remainWord: 'REMAINING',
    buyLabel: 'BUY',
    sellLabel: 'SELL',
    sub: "This year's total data-center electricity bill is $61,837,500,000. Go spend it. Every last dollar.",
    receiptTitle: '🧾 RECEIPT',
    rsub: 'what you bought with the power bill',
    items: [
      { id: 'bottle',       name: 'Bottle of water',              val: 1 },
      { id: 'bigmac',       name: 'Big Mac',                      val: 5 },
      { id: 'latte',        name: 'Starbucks latte',              val: 7 },
      { id: 'netflix',      name: 'Netflix (1 month)',            val: 17 },
      { id: 'videogame',    name: 'Video game',                   val: 60 },
      { id: 'airpods',      name: 'AirPods Pro 3',               val: 250 },
      { id: 'jordans',      name: 'Air Jordans',                  val: 350 },
      { id: 'tv4k',         name: '4K smart TV',                  val: 500 },
      { id: 'tswift',       name: 'Taylor Swift ticket',          val: 750 },
      { id: 'ps5pro',       name: 'PlayStation 5 Pro',            val: 899 },
      { id: 'iphone',       name: 'iPhone 17 Pro Max',            val: 1199 },
      { id: 'kitten',       name: 'Kitten',                       val: 1500 },
      { id: 'puppy',        name: 'Puppy',                        val: 1500 },
      { id: 'golfcart',     name: 'Golf cart',                    val: 4000 },
      { id: 'horse',        name: 'Horse',                        val: 5000 },
      { id: 'hottub',       name: 'Hot tub',                      val: 6000 },
      { id: 'jetski',       name: 'Jet ski',                      val: 8000 },
      { id: 'well',         name: 'Village water well (Africa)',   val: 10000 },
      { id: 'rolex',        name: 'Rolex',                        val: 15000 },
      { id: 'diamondring',  name: 'Diamond ring',                 val: 20000 },
      { id: 'toyota',       name: 'Toyota Corolla',               val: 30000 },
      { id: 'teacher',      name: 'Teacher annual salary',        val: 65000 },
      { id: 'tesla',        name: 'Tesla',                        val: 75000 },
      { id: 'monstertruck', name: 'Monster truck',                val: 150000 },
      { id: 'house',        name: 'Single family house',          val: 400000 },
      { id: 'rollsroyce',   name: 'Rolls-Royce Phantom',          val: 500000 },
      { id: 'lamborghini',  name: 'Lamborghini Revuelto',         val: 700000 },
      { id: 'mcdonalds',    name: "McDonald's franchise",         val: 2000000 },
      { id: 'superbowl',    name: 'Super Bowl ad',                val: 8000000 },
      { id: 'yacht',        name: 'Yacht',                        val: 10000000 },
      { id: 'helicopter',   name: 'Luxury helicopter',            val: 15000000 },
      { id: 'privatejet',   name: 'Private jet',                  val: 50000000 },
      { id: 'f16',          name: 'F-16 jet',                     val: 70000000 },
      { id: 'bezosyacht',   name: "Bezos' superyacht",            val: 500000000 },
      { id: 'skyscraper',   name: 'Skyscraper',                   val: 800000000 },
      { id: 'cruiseship',   name: 'Cruise ship',                  val: 1500000000 },
    ],
  },
  water: {
    label: 'Water',
    unit: 'gal',
    budget: 163885000000,
    goal: "a year's water use",
    spentWord: 'USED',
    remainWord: 'LEFT',
    buyLabel: 'FILL',
    sellLabel: 'DRAIN',
    sub: "Data centers drink about 163.9 billion gallons a year to stay cool. Roughly 449 million every day. Start filling things up.",
    receiptTitle: '🧾 RECEIPT',
    rsub: 'what you filled with the water',
    items: [
      { id: 'balloon',       name: 'Water balloon',                      val: 0.25 },
      { id: 'coffeepot',     name: 'Coffee pot (12-cup)',                val: 0.75 },
      { id: 'drink',         name: "Person's daily drinking water",       val: 1 },
      { id: 'toilet',        name: 'Toilet flush',                       val: 1.6 },
      { id: 'watercooler',   name: 'Water cooler bottle',                val: 5 },
      { id: 'dishwasher',    name: 'Dishwasher cycle',                   val: 5 },
      { id: 'sink',          name: 'Kitchen sink filled',                val: 15 },
      { id: 'washer',        name: 'Washing machine load',               val: 20 },
      { id: 'shower',        name: 'Standard shower (10 min)',           val: 25 },
      { id: 'rainbarrel',    name: 'Rain barrel',                        val: 50 },
      { id: 'waterheater',   name: 'Residential water heater',           val: 50 },
      { id: 'drum55',        name: '55-gallon drum',                     val: 55 },
      { id: 'aquarium',      name: 'Large aquarium',                     val: 75 },
      { id: 'household',     name: 'US household daily water use',       val: 80 },
      { id: 'bathtub',       name: 'Bathtub',                            val: 90 },
      { id: 'fishpond',      name: 'Small fish pond',                    val: 100 },
      { id: 'kiddiepool',    name: 'Kiddie pool',                        val: 200 },
      { id: 'hottub',        name: 'Hot tub',                            val: 400 },
      { id: 'trough',        name: 'Livestock water trough',             val: 500 },
      { id: 'firetruck',     name: 'Fire truck water tank',              val: 1000 },
      { id: 'inflatablepool',name: 'Large inflatable family pool',       val: 1000 },
      { id: 'septictank',    name: 'Septic tank',                        val: 1250 },
      { id: 'pool18ft',      name: 'Above-ground pool (18 ft)',          val: 7000 },
      { id: 'tankertruck',   name: 'Water tanker truck',                 val: 8000 },
      { id: 'container',     name: 'Shipping container of water',        val: 8700 },
      { id: 'avgpool',       name: 'Average residential pool',           val: 20000 },
      { id: 'farmpond',      name: 'Small farm pond',                    val: 50000 },
      { id: 'municipaltank', name: 'Small municipal water tank',         val: 100000 },
      { id: 'tower',         name: 'Water tower',                        val: 300000 },
      { id: 'pool',          name: 'Olympic swimming pool',              val: 660000 },
      { id: 'smalllake',     name: 'Small lake (1 acre, 6 ft deep)',      val: 1950000 },
      { id: 'epcottank',     name: 'Fish tank at EPCOT',                  val: 5700000 },
      { id: 'lincolnpool',   name: 'Lincoln Memorial Reflecting Pool',    val: 6500000 },
      { id: 'georgiaaq',     name: 'Georgia Aquarium tank',               val: 11000000 },
      { id: 'largelake',     name: 'Large lake (10 acres, 10 ft deep)',   val: 32600000 },
      { id: 'niagarafalls',  name: 'Niagara Falls (per minute)',          val: 42000000 },
    ],
  },
};

/* ---------- state ---------- */
const state = { tab: 'energy', qty: { energy: {}, water: {} } };
try {
  const path = window.location.pathname.replace('/', '').split('/')[0];
  if (['energy', 'water', 'sources'].includes(path)) {
    state.tab = path;
  } else {
    const s = JSON.parse(localStorage.getItem('dceu') || '{}');
    if (['energy', 'water', 'sources'].includes(s.tab)) state.tab = s.tab;
  }
} catch (e) {}

window.addEventListener('popstate', e => {
  const path = window.location.pathname.replace('/', '').split('/')[0];
  const tab = ['energy', 'water', 'sources'].includes(path) ? path : 'energy';
  switchTab(tab, false);
});

function persist() { localStorage.setItem('dceu', JSON.stringify({ tab: state.tab })); }

/* ---------- per-tab refs & animation state ---------- */
const tabRefs = { energy: {}, water: {} };
const balAnim = {
  energy: { raf: 0, current: null, dur: 650 },
  water:  { raf: 0, current: null, dur: 650 },
};

/* ===================================================================
   INIT — builds all panels once; tab switching is CSS-only thereafter
   =================================================================== */
function init() {
  const site = document.getElementById('site');

  site.append(buildMasthead());

  const mainEl = h('main', { id: 'main-content' });

  ['energy', 'water'].forEach(tabKey => {
    const t = TABS[tabKey];
    const panel = h('section', {
      id: `panel-${tabKey}`,
      class: 'tab-panel',
      'aria-label': t.label + ' tab',
    });

    panel.append(h('h2', { class: 'tab-section-heading' },
      tabKey === 'energy'
        ? "Spend Today's Data Center Electricity Bill"
        : "What 163 Billion Gallons of Water Looks Like"
    ));

    panel.append(buildBalanceBar(tabKey));
    panel.append(buildGrid(tabKey));
    panel.append(h('p', { class: 'cards-disclaimer' },
      'Prices and quantities are approximate and for entertainment purposes only. ' +
      'Nothing on this site constitutes a real offer to buy, sell, or transact anything.'
    ));
    panel.append(buildModal(tabKey));
    mainEl.append(panel);
    updateTotals(tabKey);
  });

  const sourcesPanel = h('section', {
    id: 'panel-sources',
    class: 'tab-panel',
    'aria-label': 'Sources tab',
  });
  sourcesPanel.append(buildSources());
  mainEl.append(sourcesPanel);

  site.append(mainEl);
  site.append(buildFooter());

  switchTab(state.tab, false);
}

/* ---------- masthead ---------- */
function buildMasthead() {
  return h('header', { class: 'masthead' },
    h('img', { src: 'favicon.svg', class: 'masthead-logo', alt: 'Data Center Energy Usage logo', width: '56', height: '56' }),
    h('h1', { class: 'title' }, 'Data Center Energy Usage'),
    h('p', { class: 'subhead', id: 'subhead' }, getSubhead(state.tab)),
    buildTabRow()
  );
}

function getSubhead(tab) {
  if (tab === 'sources') return 'Where every number on this page comes from: global figures, back-of-envelope math.';
  return TABS[tab].sub;
}

function buildTabRow() {
  return h('nav', { class: 'cattabs', 'aria-label': 'Content categories' },
    [['energy', 'Energy'], ['water', 'Water'], ['sources', 'Sources']].map(([key, label]) =>
      h('button', {
        class: 'cattab',
        'data-tab': key,
        'aria-selected': state.tab === key,
        'aria-controls': `panel-${key}`,
        onclick: () => switchTab(key),
      }, label.toUpperCase())
    )
  );
}

/* ---------- tab switching ---------- */
function switchTab(key, save = true) {
  if (save) {
    if (state.tab === key) return;
    state.tab = key;
    persist();
    history.pushState({}, '', '/' + key);
  }

  const subhead = document.getElementById('subhead');
  if (subhead) subhead.textContent = getSubhead(key);

  document.querySelectorAll('.cattab').forEach(btn => {
    btn.setAttribute('aria-selected', btn.dataset.tab === key);
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('tab-panel--active', panel.id === `panel-${key}`);
  });
}

function resetTabDisplay(tabKey) {
  const refs = tabRefs[tabKey];
  if (!refs || !refs.cards) return;
  Object.keys(refs.cards).forEach(id => {
    refs.cards[id].input.value = 0;
    refs.cards[id].card.classList.remove('owned');
  });
  updateTotals(tabKey);
}

/* ---------- sticky green status bar ---------- */
function buildBalanceBar(tabKey) {
  const refs = tabRefs[tabKey];
  const t = TABS[tabKey];
  const num   = h('div', { class: 'bb-num', id: `hbal-${tabKey}` }, fmtVal(t.unit, Math.round(t.budget)));
  const spent = h('b', { id: `spentpct-${tabKey}` }, '0.0000%');
  const rem   = h('b', { id: `rempct-${tabKey}` }, '100.0000%');
  refs.hbal     = num;
  refs.spentPct = spent;
  refs.remPct   = rem;

  return h('div', { class: 'balancebar' },
    h('div', { class: 'bb-left' },
      h('span', { class: 'bb-label' }, 'CURRENT BALANCE'),
      num
    ),
    h('div', { class: 'bb-mid' },
      h('div', { class: 'stat-pill' }, h('span', null, t.spentWord), spent),
      h('div', { class: 'stat-pill' }, h('span', null, t.remainWord), rem)
    ),
    h('div', { class: 'bb-right' },
      h('button', { class: 'btn-reset',    onclick: () => resetTab(tabKey) }, '↺ Reset'),
      h('button', { class: 'btn-receipt',  onclick: () => openModal(tabKey) }, '🧾 Receipt')
    )
  );
}

/* ---------- cards ---------- */
function buildGrid(tabKey) {
  const refs = tabRefs[tabKey];
  const t = TABS[tabKey];
  refs.cards = {};
  const grid = h('div', { class: 'grid' });

  t.items.forEach(it => {
    const qty = (state.qty[tabKey] || {})[it.id] || 0;
    const input = h('input', {
      class: 'qty',
      type: 'number',
      min: '0',
      value: qty,
      oninput: e => setQty(tabKey, it.id, e.target.value),
    });

    const img = h('img', {
      src: `images/${it.id}.jpg`,
      alt: it.name,
      loading: 'lazy',
      width: '300',
      height: '300',
      onerror: function () { this.remove(); },
    });

    const card = h('div', { class: 'card unit-' + t.unit },
      h('div', { class: 'ph' },
        img,
        h('span', null, it.name)
      ),
      h('div', { class: 'card-name' }, it.name),
      h('div', { class: 'card-price' }, fmtVal(t.unit, it.val)),
      it.desc ? h('p', { class: 'card-desc' }, it.desc) : null,
      h('div', { class: 'buysell' },
        h('button', { class: 'sell', onclick: () => bump(tabKey, it.id, -1) }, t.sellLabel),
        input,
        h('button', { class: 'buy',  onclick: () => bump(tabKey, it.id,  1) }, t.buyLabel)
      )
    );
    refs.cards[it.id] = { card, input };
    grid.append(card);
  });

  return grid;
}

/* ---------- receipt (lives inside modal) ---------- */
function buildReceipt(tabKey) {
  const refs = tabRefs[tabKey];
  const t = TABS[tabKey];
  const body = h('div', { class: 'rrows', id: `rbody-${tabKey}` });
  const fill = h('div', { class: 'progfill', id: `rfill-${tabKey}` });
  const lab  = h('div', { class: 'proglabel', id: `rlabel-${tabKey}` });
  const amt  = h('span', { class: 'ramt', id: `rtotal-${tabKey}` }, fmtVal(t.unit, 0));
  refs.rbody  = body;
  refs.rfill  = fill;
  refs.rlabel = lab;
  refs.rtotal = amt;

  return h('div', { class: 'receipt unit-' + t.unit },
    h('h3', null, t.receiptTitle),
    h('p', { class: 'rsub' }, t.rsub),
    body,
    h('div', { class: 'rtotal' }, h('span', null, 'TOTAL'), amt),
    h('div', { class: 'prog' }, h('div', { class: 'progbar' }, fill), lab)
  );
}

/* ---------- modal ---------- */
function buildModal(tabKey) {
  const refs = tabRefs[tabKey];
  const overlay = h('div', {
    class: 'modal-overlay',
    id: `rmodal-${tabKey}`,
    onclick: e => { if (e.target === overlay) closeModal(tabKey); },
  });
  const card = h('div', { class: 'modal' },
    h('button', { class: 'modal-close', 'aria-label': 'Close', onclick: () => closeModal(tabKey) }, '×'),
    buildReceipt(tabKey),
    h('div', { class: 'share' },
      h('span', { class: 'share-label' }, 'Share your receipt'),
      h('div', { class: 'share-btns' },
        h('button', { class: 'share-btn dl', onclick: () => shareOrDownloadImage(tabKey) }, '📥 Save Image'),
        h('button', { class: 'share-btn x',  onclick: () => shareTo(tabKey, 'x') },        '𝕏  Post on X'),
        h('button', { class: 'share-btn fb', onclick: () => shareTo(tabKey, 'fb') },        'f  Facebook')
      )
    )
  );
  overlay.append(card);
  refs.modal = overlay;
  return overlay;
}

function openModal(tabKey)  { const m = tabRefs[tabKey].modal; if (m) m.classList.add('open'); }
function closeModal(tabKey) { const m = tabRefs[tabKey].modal; if (m) m.classList.remove('open'); }

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal(state.tab);
});

/* ===================================================================
   MECHANIC
   =================================================================== */
function bump(tabKey, id, d) {
  const qty = state.qty[tabKey] = state.qty[tabKey] || {};
  qty[id] = Math.max(0, (qty[id] || 0) + d);
  syncCard(tabKey, id);
  updateTotals(tabKey);
}

function setQty(tabKey, id, raw) {
  let n = parseInt(raw, 10);
  if (isNaN(n) || n < 0) n = 0;
  state.qty[tabKey] = state.qty[tabKey] || {};
  state.qty[tabKey][id] = n;
  const c = tabRefs[tabKey].cards && tabRefs[tabKey].cards[id];
  if (c) c.card.classList.toggle('owned', n > 0);
  updateTotals(tabKey);
}

function syncCard(tabKey, id) {
  const c = tabRefs[tabKey].cards && tabRefs[tabKey].cards[id];
  if (!c) return;
  const qty = (state.qty[tabKey] || {})[id] || 0;
  c.input.value = qty;
  c.card.classList.toggle('owned', qty > 0);
}

function resetTab(tabKey) {
  state.qty[tabKey] = {};
  resetTabDisplay(tabKey);
}

function tabTotal(tabKey) {
  const t = TABS[tabKey];
  const qty = state.qty[tabKey] || {};
  let total = 0;
  t.items.forEach(it => { total += (qty[it.id] || 0) * it.val; });
  return total;
}

function updateTotals(tabKey) {
  const refs = tabRefs[tabKey];
  const t = TABS[tabKey];
  const qty = state.qty[tabKey] || {};
  let total = 0;
  const rows = [];

  t.items.forEach(it => {
    const q = qty[it.id] || 0;
    if (q > 0) {
      total += q * it.val;
      rows.push(h('div', { class: 'rrow' },
        h('img', {
          class: 'rrow-img',
          src: `images/${it.id}.jpg`,
          alt: it.name,
          width: '36',
          height: '36',
          onerror: function() { this.style.display = 'none'; },
        }),
        h('span', { class: 'rname' }, it.name, ' ', h('small', null, '× ' + q.toLocaleString('en-US') + ' (' + fmtVal(t.unit, it.val) + ' each)')),
        h('span', { class: 'ramt' }, fmtVal(t.unit, q * it.val))
      ));
    }
  });

  if (refs.rbody) {
    refs.rbody.innerHTML = '';
    if (rows.length === 0) refs.rbody.append(h('div', { class: 'rempty' }, 'Nothing yet. Start buying!'));
    else rows.forEach(r => refs.rbody.append(r));
  }
  if (refs.rtotal) refs.rtotal.textContent = fmtVal(t.unit, total);

  if (refs.hbal) animateBalance(tabKey, t.budget - total, t.unit);

  const pct = total / t.budget * 100;
  if (refs.spentPct) refs.spentPct.textContent = pct.toFixed(4) + '%';
  if (refs.remPct)   refs.remPct.textContent   = (100 - pct).toFixed(4) + '%';

  if (refs.rfill)  refs.rfill.style.width = Math.min(100, pct) + '%';
  if (refs.rlabel) refs.rlabel.textContent = progLabel(pct, t.goal);

}

function progLabel(pct, goal) {
  if (pct <= 0)  return 'Nothing spent yet.';
  if (pct < 1)   return pct.toFixed(4) + '% of ' + goal + '.';
  if (pct < 100) return pct.toFixed(2) + '% of ' + goal + '.';
  return Math.round(pct).toLocaleString('en-US') + '% of ' + goal + '. That escalated quickly.';
}

/* ===================================================================
   BALANCE ANIMATION — number scrolls fast then decelerates (ease-out)
   =================================================================== */
function animateBalance(tabKey, target, unit) {
  const anim = balAnim[tabKey];
  cancelAnimationFrame(anim.raf);
  const from = (anim.current == null) ? target : anim.current;
  const start = performance.now();
  const refs = tabRefs[tabKey];

  const step = now => {
    const p = Math.min(1, (now - start) / anim.dur);
    const e = 1 - Math.pow(1 - p, 3);
    const v = from + (target - from) * e;
    anim.current = v;
    if (refs.hbal) {
      refs.hbal.textContent = fmtBalance(unit, Math.round(v));
      refs.hbal.classList.toggle('over', v < 0);
    }
    if (p < 1) anim.raf = requestAnimationFrame(step);
    else anim.current = target;
  };
  anim.raf = requestAnimationFrame(step);
}

/* ===================================================================
   RECEIPT IMAGE GENERATION
   =================================================================== */
function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r);
  ctx.arcTo(x,     y,     x + r, y,          r);
  ctx.closePath();
}

async function generateReceiptCanvas(tabKey) {
  await document.fonts.ready;

  const t       = TABS[tabKey];
  const qty     = state.qty[tabKey] || {};
  const items   = t.items.filter(it => (qty[it.id] || 0) > 0);
  const total   = tabTotal(tabKey);
  const pct     = total / t.budget * 100;

  const SCALE    = 2;
  const W        = 480;
  const PAD      = 28;
  const HDR_H    = 88;
  const ITEM_H   = 36;
  const itemsH   = items.length === 0 ? 50 : items.length * ITEM_H;
  const BODY_TOP = HDR_H + 28;
  const TOTAL_H  = 96;
  const FOOT_H   = 58;
  const H        = BODY_TOP + itemsH + TOTAL_H + FOOT_H + 16;

  const canvas  = document.createElement('canvas');
  canvas.width  = W * SCALE;
  canvas.height = H * SCALE;
  const ctx     = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);

  // Background
  ctx.fillStyle = '#fffdf6';
  drawRoundRect(ctx, 0, 0, W, H, 16);
  ctx.fill();

  // Green header (flat bottom)
  ctx.fillStyle = '#00b894';
  drawRoundRect(ctx, 0, 0, W, HDR_H, 16);
  ctx.fill();
  ctx.fillRect(0, HDR_H - 16, 16, 16);
  ctx.fillRect(W - 16, HDR_H - 16, 16, 16);

  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.font = 'bold 21px Bungee, cursive';
  ctx.fillText('🧾 RECEIPT', PAD, 46);

  ctx.font = '13px "Architects Daughter", cursive';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText(t.rsub, PAD, 70);

  // Items
  let y = BODY_TOP;

  if (items.length === 0) {
    ctx.font = '15px "Architects Daughter", cursive';
    ctx.fillStyle = 'rgba(28,27,25,0.42)';
    ctx.textAlign = 'center';
    ctx.fillText('Nothing yet. Start buying!', W / 2, y + 22);
    y += 50;
  } else {
    items.forEach(it => {
      const q   = qty[it.id];
      const val = q * it.val;

      ctx.textAlign  = 'left';
      ctx.font       = '600 13px Rubik, sans-serif';
      ctx.fillStyle  = '#1c1b19';
      ctx.fillText(it.name, PAD, y);
      const nameW = ctx.measureText(it.name).width; // measure BEFORE font switch

      ctx.font       = '400 12px Rubik, sans-serif';
      ctx.fillStyle  = 'rgba(28,27,25,0.45)';
      ctx.fillText(` × ${q.toLocaleString('en-US')} (${fmtVal(t.unit, it.val)} each)`, PAD + nameW + 3, y);

      ctx.textAlign  = 'right';
      ctx.font       = 'bold 13px Rubik, sans-serif';
      ctx.fillStyle  = '#04795f';
      ctx.fillText(fmtVal(t.unit, val), W - PAD, y);

      y += ITEM_H;
    });
  }

  // Divider
  y += 10;
  ctx.strokeStyle = '#1c1b19';
  ctx.lineWidth   = 2.5;
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke();
  y += 20;

  // Total row
  ctx.fillStyle  = '#1c1b19';
  ctx.font       = 'bold 17px Bungee, cursive';
  ctx.textAlign  = 'left';
  ctx.fillText('TOTAL', PAD, y);
  ctx.textAlign  = 'right';
  ctx.fillText(fmtVal(t.unit, total), W - PAD, y);
  y += 18;

  // Progress bar
  const barW = W - PAD * 2;
  const barH = 12;
  y += 10;
  ctx.fillStyle   = '#f6f4ec';
  ctx.strokeStyle = '#1c1b19';
  ctx.lineWidth   = 2;
  drawRoundRect(ctx, PAD, y, barW, barH, 6); ctx.fill(); ctx.stroke();
  if (pct > 0) {
    const fillW = Math.max(6, Math.min(barW - 4, (pct / 100) * (barW - 4)));
    ctx.fillStyle = '#00b894';
    drawRoundRect(ctx, PAD + 2, y + 2, fillW, barH - 4, 4); ctx.fill();
  }
  y += barH + 10;
  ctx.font      = '12px "Architects Daughter", cursive';
  ctx.fillStyle = 'rgba(28,27,25,0.58)';
  ctx.textAlign = 'left';
  ctx.fillText(progLabel(pct, t.goal), PAD, y);

  // Dashed footer divider
  const footY = H - FOOT_H;
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = 'rgba(28,27,25,0.18)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath(); ctx.moveTo(PAD, footY + 10); ctx.lineTo(W - PAD, footY + 10); ctx.stroke();
  ctx.setLineDash([]);

  // Footer branding
  ctx.textAlign = 'center';
  ctx.font      = 'bold 13px Bungee, cursive';
  ctx.fillStyle = '#00b894';
  ctx.fillText('datacenterenergyusage.com', W / 2, footY + 34);
  ctx.font      = '12px "Architects Daughter", cursive';
  ctx.fillStyle = 'rgba(28,27,25,0.38)';
  ctx.fillText('What does AI really cost?', W / 2, footY + 50);

  // Outer border
  ctx.strokeStyle = '#1c1b19';
  ctx.lineWidth   = 3;
  drawRoundRect(ctx, 1.5, 1.5, W - 3, H - 3, 16); ctx.stroke();

  return canvas;
}

async function shareOrDownloadImage(tabKey) {
  const canvas = await generateReceiptCanvas(tabKey);
  canvas.toBlob(async blob => {
    const file = new File([blob], 'data-center-receipt.png', { type: 'image/png' });
    // Use native share sheet on mobile only (not Mac desktop — canShare is true there too)
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Data Center Energy Usage', text: shareText(tabKey) });
        return;
      } catch (e) { /* user cancelled or unsupported — fall through to download */ }
    }
    // Desktop fallback: download the PNG
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = 'data-center-receipt.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

function shareToReddit(tabKey) {
  const total = tabTotal(tabKey);
  const pct   = (total / TABS[tabKey].budget * 100).toFixed(2);
  let title;
  if (pct < 0.0001) {
    title = 'AI data centers burn $169 million in electricity every single day. This tool shows you what that money could buy instead.';
  } else if (tabKey === 'water') {
    title = `Data centers use 163.9 billion gallons of water per year. I just "filled" ${pct}% of it. See what it looks like.`;
  } else {
    title = `Data centers spend $61.8B on electricity per year. I just "spent" ${fmtUSD(total)} (${pct}%) of it. See what that buys.`;
  }
  const href = `https://reddit.com/submit?url=${encodeURIComponent(SHARE_URL)}&title=${encodeURIComponent(title)}`;
  window.open(href, '_blank', 'noopener,noreferrer,width=900,height=700');
}

/* ===================================================================
   SHARE
   =================================================================== */
function shareText(tabKey) {
  const t = TABS[tabKey];
  const total = tabTotal(tabKey);
  const pct = (total / t.budget * 100).toFixed(4);
  if (tabKey === 'water') {
    return `I just "used" ${fmtVal('gal', total)} of data centers' 163.9-billion-gallon-a-year water habit (${pct}% of it). See where the rest goes:`;
  }
  return `I just spent ${fmtUSD(total)} of data centers' $61.84B yearly electricity bill (${pct}% of it). See where the rest goes:`;
}

function shareTo(tabKey, network) {
  const text = shareText(tabKey);
  const u  = encodeURIComponent(SHARE_URL);
  const tx = encodeURIComponent(text);
  const href = network === 'fb'
    ? `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${tx}`
    : `https://twitter.com/intent/tweet?text=${tx}&url=${u}`;
  window.open(href, '_blank', 'noopener,noreferrer,width=600,height=520');
}

/* ===================================================================
   SOURCES
   =================================================================== */
function srcItem(stat, html, note) {
  return h('div', { class: 'srcitem' },
    h('p', { class: 'stat' }, stat),
    h('p', { html }),
    note ? h('p', { class: 'note' }, note) : null
  );
}

function buildSources() {
  const a = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
  return h('div', { class: 'sources' },
    h('h2', { class: 'src-head' }, 'How the numbers were made'),
    h('p', { class: 'src-lead' }, 'Every figure on this page is global and back-of-envelope. Here is exactly where each one comes from.'),

    srcItem('485 TWh',
      'Global data-center electricity consumption in 2025. Source: ' + a('https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary', 'IEA: Key Questions on Energy and AI, April 2026') + '.'),

    srcItem('$0.1275 / kWh',
      'US average commercial electricity rate, used as the cost basis for data-center power. Source: ' + a('https://www.eia.gov/electricity/sales_revenue_price/pdf/table_4.pdf', 'EIA: Electric Power Monthly, Table 4 (commercial rate)') + '.',
      'Industrial contracts often run lower and residential higher; actual data-center rates vary by region and negotiation.'),

    h('div', { class: 'calc' },
      h('h4', null, 'THE MATH'),
      h('div', { class: 'crow' }, h('span', null, 'Annual cost'), h('b', null, '485,000,000,000 kWh × $0.1275 = $61.84 billion / yr')),
      h('div', { class: 'crow' }, h('span', null, 'Daily cost'),  h('b', null, '$61,837,500,000 ÷ 365 = $169,417,808 / day')),
      h('div', { class: 'crow' }, h('span', null, 'Per second'),  h('b', null, '$169,417,808 ÷ 86,400 = $1,961 / sec'))
    ),

    srcItem('163.9B gallons / year',
      'Data-center water consumption: 449 million gallons per day (EESI) × 365 = 163,885,000,000 gallons / year. Source: ' + a('https://www.eesi.org/articles/view/data-centers-and-water-consumption', 'EESI: Data Centers and Water Consumption') + '.'),

    h('div', { class: 'bignote' },
      'All figures represent global data centers broadly, not AI specifically. AI-focused data centers are growing significantly faster than overall data center consumption (IEA, 2025).'),

    h('p', { class: 'footnote' }, 'numbers are illustrative')
  );
}

/* ===================================================================
   FOOTER
   =================================================================== */
function buildFooter() {
  // ConvertKit inline form — must use createElement so the script actually executes
  const ckWrap = h('div', { class: 'footer-ck-wrap' });
  const ckScript = document.createElement('script');
  ckScript.async = true;
  ckScript.setAttribute('data-uid', 'fb8f84f923');
  ckScript.src = 'https://oadeals.kit.com/fb8f84f923/index.js';
  ckWrap.appendChild(ckScript);

  return h('footer', { class: 'site-footer' },
    h('div', { class: 'footer-email-section' },
      ckWrap
    ),
    h('p', null,
      '© 2026 datacenterenergyusage.com · ',
      h('a', {
        href: '#sources',
        onclick: e => { e.preventDefault(); switchTab('sources'); window.scrollTo({ top: 0, behavior: 'smooth' }); },
      }, 'Sources & Methodology'),
      ' · ',
      h('a', { href: 'privacy.html' }, 'Privacy Policy')
    ),
    h('p', { class: 'footer-desc' },
      'Data Center Energy Usage is an interactive tool for visualizing global data center electricity and water consumption. ' +
      'Explore what the $61.8 billion annual electricity bill (or 163.9 billion gallons of water) could buy in real-world terms. ' +
      'All figures represent global data centers broadly, based on IEA and EESI data.'
    )
  );
}

/* ---------- go ---------- */
init();
