/* ═══════════════════════════════════════════════════════════════
   BUNNY CLIENT — page interactions
   1. images (badges, capes)         5. leaderboard
   2. hero bunny (combo + CPS)       6. tag colors
   3. the interactive mod menu       7. Discord status + countdown
   4. nav helpers
   ✏️ EDIT the list of mods in section 3 (search for "const MODS").
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const A = window.BUNNY_ASSETS || { icons: {}, nav: {}, badges: {}, capes: {} };
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. images ─────────────────────────────────────────────── */
  $$('[data-badge]').forEach((img) => { img.src = A.badges[img.dataset.badge] || ''; });
  $$('[data-cape]').forEach((d) => { d.style.backgroundImage = `url(${A.capes[d.dataset.cape]})`; });

  /* ── 2. hero bunny: a tiny version of the Combo and CPS mods ── */
  (function heroBunny() {
    const mascot = $('#mascot');
    if (!mascot) return;
    const comboEl = $('#combo-count');
    const cpsEl = $('#cps-count');
    let combo = 0, clicks = [], timer;

    const refreshCps = () => {
      const now = performance.now();
      clicks = clicks.filter((t) => now - t < 1000);
      cpsEl.textContent = clicks.length;
    };

    mascot.addEventListener('click', () => {
      clicks.push(performance.now());
      combo += 1;
      comboEl.textContent = combo;
      clearTimeout(timer);
      timer = setTimeout(() => { combo = 0; comboEl.textContent = 0; }, 3000); // resets like the real Combo mod
      mascot.classList.remove('squish');
      void mascot.offsetWidth;            // restart the animation
      mascot.classList.add('squish');
      refreshCps();
    });
    setInterval(refreshCps, 250);
  })();

  /* ── 3. the interactive mod menu ───────────────────────────── */
  const CAT = { All: '#D6C8C3', HUD: '#7FB8E8', Gameplay: '#8FD6A0', Performance: '#E8C97F', Extras: '#E89FB8' };
  const PALETTE = ['#FFFFFF', '#D6C8C3', '#E89FB8', '#FF5555', '#FFAA33', '#FFFF55', '#7CFF6B', '#55FFFF', '#5599FF', '#B070FF'];

  // option builders: Toggle, Slider, Choice, Palette (colors), Info, Header
  const T = (label, value, desc = '', key) => ({ type: 'toggle', label, desc, value, key });
  const S = (label, min, max, step, unit, value, desc = '', key) => ({ type: 'slider', label, desc, min, max, step, unit, value, key });
  const C = (label, choices, value, desc = '', key) => ({ type: 'choice', label, desc, choices, value, key });
  const P = (label, value, desc = '', key) => ({ type: 'colors', label, desc, palette: PALETTE, value, key });
  const I = (text) => ({ type: 'info', label: text });
  const H = (text) => ({ type: 'header', label: text });

  // every HUD module shares these options
  const hud = (extra = []) => [
    I('Drag it into place with Edit HUD.'), ...extra,
    T('Background', true, 'Dark card behind the text'),
    T('Border', true, 'Outline around the card'),
    P('Text color', 1, 'Numbers and values'),
    P('Label color', 1, 'Units and labels'),
  ];

  // ✏️ EDIT: id must match an icon in assets.js. cat = HUD | Gameplay | Performance | Extras
  const MODS = [
    // HUD
    { id: 'fps', name: 'FPS Counter', desc: 'Frames per second on screen', cat: 'HUD', on: true, opts: hud() },
    { id: 'coords', name: 'Coordinates', desc: 'Position and facing direction', cat: 'HUD', on: true, opts: hud() },
    { id: 'armor', name: 'Armor Status', desc: 'Armor pieces and durability', cat: 'HUD', on: true, opts: hud() },
    { id: 'potions', name: 'Potion Status', desc: 'Active effects on screen', cat: 'HUD', on: false, opts: hud() },
    { id: 'keystrokes', name: 'Keystrokes', desc: 'Your movement and mouse keys', cat: 'HUD', on: true, opts: hud() },
    { id: 'cps', name: 'CPS Counter', desc: 'Clicks per second', cat: 'HUD', on: true, opts: hud() },
    { id: 'ping', name: 'Ping', desc: 'Latency to the server', cat: 'HUD', on: false, opts: hud() },
    { id: 'sprint_status', name: 'Toggle Sprint Status', desc: 'Shows sprint and sneak state', cat: 'HUD', on: false, opts: hud() },
    { id: 'combo', name: 'Combo Counter', desc: 'Hits in a row without being hit', cat: 'HUD', on: false,
      opts: hud([S('Reset after', 1, 5, 1, 's', 3, 'Seconds without a hit before the combo ends')]) },
    { id: 'reach', name: 'Reach Display', desc: 'Distance of your last attack', cat: 'HUD', on: false, opts: hud() },
    { id: 'speed', name: 'Speed', desc: 'Blocks per second', cat: 'HUD', on: false, opts: hud() },
    { id: 'items', name: 'Item Counter', desc: 'Gapples, pearls, arrows and more', cat: 'HUD', on: false,
      opts: hud([H('Count these items'), T('Golden apples', true, 'Normal and enchanted'), T('Ender pearls', true), T('Arrows', true), T('Totems of Undying', true), T('XP bottles', false)]) },
    { id: 'clock', name: 'Clock', desc: 'Your computer\'s time', cat: 'HUD', on: false,
      opts: hud([T('24-hour time', true, 'Off shows AM/PM'), T('Show seconds', false)]) },
    { id: 'memory', name: 'Memory Usage', desc: 'RAM used by the game', cat: 'HUD', on: false, opts: hud() },

    // Gameplay
    { id: 'zoom', name: 'Zoom', desc: 'Hold a key to zoom in smoothly', cat: 'Gameplay', on: true,
      opts: [I('Hold C to zoom. Change the key in Controls.'), S('Zoom FOV', 10, 60, 1, '\u00B0', 25, 'Field of view while zoomed (lower = closer)'), T('Smooth zoom', true, 'Ease in and out instead of snapping')] },
    { id: 'fullbright', name: 'Fullbright', desc: 'See clearly in dark caves', cat: 'Gameplay', on: false,
      opts: [I('Toggle quickly with G. Works without a night vision potion.')] },
    { id: 'togglesprint', name: 'Toggle Sprint', desc: 'Sprint without holding the key', cat: 'Gameplay', on: true,
      opts: [I('Press B to switch sprint on or off while playing.'), T('Start with sprint on', true, 'Sprint automatically when you launch the game')] },
    { id: 'togglesneak', name: 'Toggle Sneak', desc: 'Press once to keep sneaking', cat: 'Gameplay', on: false,
      opts: [I('Bind a key to Toggle Sneak in Controls (unbound by default).')] },
    { id: 'hitboxes', name: 'Entity Hitboxes', desc: 'Draw bounding boxes around entities', cat: 'Gameplay', on: true,
      opts: [I('Toggle quickly with H. Change the key in Controls.'), H('Show hitboxes for'),
        T('Players', true), T('Hostile mobs', true, 'Zombies, creepers, skeletons...'), T('Passive mobs', true, 'Animals, villagers, fish...'),
        T('Items and XP', true, 'Dropped items and experience orbs'), T('Projectiles', true, 'Arrows, snowballs, fireballs...'),
        T('Everything else', true, 'Armor stands, boats, minecarts...')] },
    { id: 'crosshair', name: 'Custom Crosshair', desc: 'Dot, cross or circle reticle', cat: 'Gameplay', on: false,
      opts: [C('Style', ['Dot', 'Cross', 'Circle'], 1, '', 'style'), S('Size', 1, 14, 1, 'px', 5, '', 'size'), S('Thickness', 1, 4, 1, 'px', 1, '', 'thickness'),
        S('Gap', 0, 8, 1, 'px', 2, 'Space in the middle (cross only)', 'gap'), P('Color', 0, '', 'color'), T('Outline', true, 'Dark edge so it stays visible', 'outline')] },
    { id: 'freelook', name: 'Freelook', desc: 'Hold a key to look around freely', cat: 'Gameplay', on: false,
      opts: [I('Hold Left Alt and move the mouse. Change the key in Controls.'), C('View while active', ['Keep current', 'Third person'], 1), I('Your aim and attacks stay where you were facing.')] },
    { id: 'weather', name: 'Clear Weather', desc: 'Hide rain and thunder', cat: 'Gameplay', on: false,
      opts: [I('Only changes what you see. The server\'s weather is not affected.')] },

    // Performance
    { id: 'culling', name: 'Entity Culling', desc: 'Skip far-away entities', cat: 'Performance', on: true,
      opts: [I('Players are never hidden.'), S('Max distance', 16, 128, 8, ' blocks', 64, 'Entities farther than this are not drawn')] },
    { id: 'particles', name: 'Particle Limiter', desc: 'Fewer particles in big fights', cat: 'Performance', on: false,
      opts: [S('Keep particles', 10, 100, 10, '%', 50, 'Percentage of particles that are spawned')] },

    // Extras
    { id: 'badge', name: 'Bunny Badge', desc: 'Bunny icon beside Bunny Client users', cat: 'Extras', on: true, opts: [] },
    { id: 'capes', name: 'Bunny Capes', desc: 'See capes worn by Bunny Client players', cat: 'Extras', on: true,
      opts: [I('Earn capes on the weekly leaderboard. Equip yours in Cosmetics.')] },
    { id: 'title', name: 'Bunny Title Screen', desc: 'Replace the vanilla main menu', cat: 'Extras', on: true, opts: [] },
    { id: 'rpc', name: 'Discord Rich Presence', desc: 'Show Bunny Client on your profile', cat: 'Extras', on: true,
      opts: [I('On multiplayer, your status alternates between FPS and your clan.'), T('Show server address', false, 'Include the server you are on'), T('Show clan info', true, 'Clan tag and total clan playtime')] },
  ];

  const hasOptions = (m) => m.opts.some((o) => o.type !== 'info' && o.type !== 'header');
  const getOpt = (m, key) => m.opts.find((o) => o.key === key);

  (function menu() {
    const app = $('#app');
    if (!app) return;

    const nav = (name, label) =>
      `<img src="${A.nav[name] || ''}" alt="" width="16" height="16"><span>${label}</span>`;

    app.innerHTML = `
      <aside class="app-side">
        <div class="app-brand">
          <svg aria-hidden="true"><use href="#bunny"/></svg>
          <div><b>BUNNY</b><span>CLIENT</span></div>
        </div>
        <nav class="app-nav" aria-label="Menu sections">
          <button class="app-nav-item is-active" type="button" aria-current="page">${nav('mods', 'Mods')}</button>
          <button class="app-nav-item" type="button" data-soon="Settings is in the real menu">${nav('gear', 'Settings')}</button>
          <hr>
          <a class="app-nav-item" href="#clans">${nav('clans', 'Clans')}</a>
          <a class="app-nav-item" href="#cosmetics">${nav('star', 'Cosmetics')}</a>
          <button class="app-nav-item" type="button" data-soon="Edit HUD lets you drag modules in game">${nav('pencil', 'Edit HUD')}</button>
        </nav>
        <div class="app-account">
          <span class="app-avatar" aria-hidden="true">B</span>
          <div><b>bunnyfan</b><span><i class="dot"></i>Connected</span></div>
        </div>
      </aside>

      <div class="app-main">
        <div class="app-search">
          <img src="${A.nav.search || ''}" alt="" width="12" height="12">
          <input id="app-q" type="search" placeholder="Search mods..." aria-label="Search mods" autocomplete="off">
          <span class="app-count" id="app-count"></span>
        </div>
        <div class="app-chips" role="group" aria-label="Categories" id="app-chips"></div>
        <div class="app-grid" id="app-grid"></div>
        <p class="app-hint" id="app-hint">Left-click to toggle &nbsp;|&nbsp; Right-click for options</p>
      </div>

      <section class="app-opts" id="app-opts" hidden aria-label="Mod options"></section>
      <div class="app-toast" id="app-toast" role="status" aria-live="polite"></div>
    `;

    const grid = $('#app-grid');
    const chips = $('#app-chips');
    const count = $('#app-count');
    const toastEl = $('#app-toast');
    const opts = $('#app-opts');
    let cat = 'All', query = '', toastTimer;

    function toast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.add('is-on');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2200);
    }

    // chips
    Object.keys(CAT).forEach((name) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'app-chip' + (name === cat ? ' is-on' : '');
      b.style.setProperty('--cat', CAT[name]);
      b.setAttribute('aria-pressed', name === cat ? 'true' : 'false');
      b.innerHTML = `<i></i>${name}`;
      b.addEventListener('click', () => {
        cat = name;
        $$('.app-chip', chips).forEach((c) => { c.classList.toggle('is-on', c === b); c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
        renderGrid();
      });
      chips.appendChild(b);
    });

    $('#app-q').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); renderGrid(); });
    $$('[data-soon]', app).forEach((b) => b.addEventListener('click', () => toast(b.dataset.soon)));

    // cards
    function setOn(card, m) {
      card.classList.toggle('is-on', m.on);
      $('.mod-main', card).setAttribute('aria-checked', String(m.on));
    }

    function renderGrid() {
      const list = MODS.filter((m) =>
        (cat === 'All' || m.cat === cat) &&
        (!query || m.name.toLowerCase().includes(query) || m.desc.toLowerCase().includes(query)));
      count.textContent = `${list.length} ${list.length === 1 ? 'mod' : 'mods'}`;
      grid.innerHTML = '';
      if (!list.length) {
        grid.innerHTML = '<p class="app-empty">No mods match your search. Try a different word.</p>';
        return;
      }
      list.forEach((m) => {
        const card = document.createElement('div');
        card.className = 'mod';
        card.style.setProperty('--cat', CAT[m.cat]);
        card.innerHTML = `
          <button class="mod-main" type="button" role="switch" aria-checked="${m.on}">
            <span class="mod-tile"><img src="${A.icons[m.id] || ''}" alt="" width="20" height="20"></span>
            <span class="mod-text"><span class="mod-name">${esc(m.name)}</span><span class="mod-desc">${esc(m.desc)}</span></span>
            <span class="sw" aria-hidden="true"><i></i></span>
          </button>
          ${hasOptions(m) ? `<button class="mod-opts" type="button" aria-label="Options for ${esc(m.name)}"><i></i><i></i><i></i></button>` : ''}
          <span class="mod-line" aria-hidden="true"></span>`;
        setOn(card, m);
        $('.mod-main', card).addEventListener('click', () => { m.on = !m.on; setOn(card, m); });
        const dots = $('.mod-opts', card);
        if (dots) dots.addEventListener('click', () => openOpts(m));
        card.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          if (hasOptions(m)) openOpts(m); else toast(`${m.name} has no options`);
        });
        grid.appendChild(card);
      });
    }

    // options screen
    function drawCrosshair(canvas, m) {
      const g = canvas.getContext('2d');
      const px = 4, W = canvas.width, H = canvas.height;
      const val = (k) => getOpt(m, k).value;
      g.clearRect(0, 0, W, H);
      g.fillStyle = '#1b1d24'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#23262f';
      for (let x = 0; x < W; x += 20) g.fillRect(x, 0, 1, H);
      for (let y = 0; y < H; y += 20) g.fillRect(0, y, W, 1);
      const cx = Math.floor(W / px / 2), cy = Math.floor(H / px / 2);
      const size = val('size'), t = val('thickness'), gap = val('gap'), off = Math.floor(t / 2);
      const rects = [];
      const style = val('style');
      if (style === 0) { const h = Math.floor(size / 2); rects.push([cx - h, cy - h, size, size]); }
      else if (style === 2) {
        const n = Math.max(16, Math.floor(Math.PI * 4 * size));
        for (let i = 0; i < n; i++) { const a = (Math.PI * 2 * i) / n; rects.push([cx + Math.round(Math.cos(a) * size) - off, cy + Math.round(Math.sin(a) * size) - off, t, t]); }
      } else {
        rects.push([cx - gap - size, cy - off, size, t], [cx + gap, cy - off, size, t], [cx - off, cy - gap - size, t, size], [cx - off, cy + gap, t, size]);
      }
      if (val('outline')) { g.fillStyle = 'rgba(0,0,0,.67)'; rects.forEach(([x, y, w, h]) => g.fillRect((x - 1) * px, (y - 1) * px, (w + 2) * px, (h + 2) * px)); }
      g.fillStyle = PALETTE[val('color')];
      rects.forEach(([x, y, w, h]) => g.fillRect(x * px, y * px, w * px, h * px));
    }

    function openOpts(m) {
      opts.hidden = false;
      opts.style.setProperty('--cat', CAT[m.cat]);
      opts.innerHTML = `
        <header class="opts-head">
          <button class="opts-back" type="button"><img src="${A.nav.back || ''}" alt="" width="12" height="12"><span>Back</span></button>
          <span class="mod-tile"><img src="${A.icons[m.id] || ''}" alt="" width="20" height="20"></span>
          <div class="opts-title"><b>${esc(m.name)}</b><span>${esc(m.desc)}</span></div>
          <label class="opts-master"><span>Enabled</span>
            <button class="sw ${m.on ? 'is-on' : ''}" type="button" role="switch" aria-checked="${m.on}" id="opts-master"><i></i></button>
          </label>
        </header>
        <div class="opts-body" id="opts-body"></div>`;

      const body = $('#opts-body', opts);
      if (m.id === 'crosshair') {
        const wrap = document.createElement('div');
        wrap.className = 'opt-preview';
        wrap.innerHTML = '<canvas width="144" height="96" aria-label="Crosshair preview"></canvas><span>Preview</span>';
        body.appendChild(wrap);
      }
      const redraw = () => { const cv = $('canvas', body); if (cv) drawCrosshair(cv, m); };

      m.opts.forEach((o) => {
        const row = document.createElement('div');
        row.className = 'opt opt-' + o.type;
        if (o.type === 'header') { row.textContent = o.label; body.appendChild(row); return; }
        if (o.type === 'info') { row.innerHTML = `<i class="info-i" aria-hidden="true">i</i><span>${esc(o.label)}</span>`; body.appendChild(row); return; }

        row.innerHTML = `<div class="opt-text"><b>${esc(o.label)}</b>${o.desc ? `<span>${esc(o.desc)}</span>` : ''}</div><div class="opt-ctl"></div>`;
        const ctl = $('.opt-ctl', row);

        if (o.type === 'toggle') {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'sw' + (o.value ? ' is-on' : ''); b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', String(o.value));
          b.setAttribute('aria-label', o.label); b.innerHTML = '<i></i>';
          b.addEventListener('click', () => { o.value = !o.value; b.classList.toggle('is-on', o.value); b.setAttribute('aria-checked', String(o.value)); redraw(); });
          ctl.appendChild(b);
        } else if (o.type === 'slider') {
          const fmt = (v) => `${v}${o.unit}`;
          ctl.innerHTML = `<input type="range" min="${o.min}" max="${o.max}" step="${o.step}" value="${o.value}" aria-label="${esc(o.label)}"><output>${fmt(o.value)}</output>`;
          const input = $('input', ctl), out = $('output', ctl);
          const paint = () => input.style.setProperty('--fill', `${((input.value - o.min) / (o.max - o.min)) * 100}%`);
          paint();
          input.addEventListener('input', () => { o.value = Number(input.value); out.textContent = fmt(o.value); paint(); redraw(); });
        } else if (o.type === 'choice') {
          ctl.classList.add('seg');
          o.choices.forEach((label, i) => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'seg-btn' + (i === o.value ? ' is-on' : ''); b.textContent = label; b.setAttribute('aria-pressed', String(i === o.value));
            b.addEventListener('click', () => { o.value = i; $$('.seg-btn', ctl).forEach((x, j) => { x.classList.toggle('is-on', j === i); x.setAttribute('aria-pressed', String(j === i)); }); redraw(); });
            ctl.appendChild(b);
          });
        } else if (o.type === 'colors') {
          ctl.classList.add('swatch-row');
          ctl.setAttribute('role', 'radiogroup');
          o.palette.forEach((hex, i) => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'swatch' + (i === o.value ? ' is-on' : ''); b.style.background = hex;
            b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(i === o.value)); b.setAttribute('aria-label', `${o.label} ${hex}`);
            b.addEventListener('click', () => { o.value = i; $$('.swatch', ctl).forEach((x, j) => { x.classList.toggle('is-on', j === i); x.setAttribute('aria-checked', String(j === i)); }); redraw(); });
            ctl.appendChild(b);
          });
        }
        body.appendChild(row);
      });

      const master = $('#opts-master', opts);
      master.addEventListener('click', () => { m.on = !m.on; master.classList.toggle('is-on', m.on); master.setAttribute('aria-checked', String(m.on)); });
      $('.opts-back', opts).addEventListener('click', closeOpts);
      $('.opts-back', opts).focus();
      redraw();
    }

    function closeOpts() {
      opts.hidden = true;
      opts.innerHTML = '';
      renderGrid(); // pick up any on/off change
    }
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !opts.hidden) closeOpts(); });

    renderGrid();
  })();

  /* ── 4. nav helpers ────────────────────────────────────────── */
  $$('.nav-more a').forEach((a) => a.addEventListener('click', () => a.closest('details').removeAttribute('open')));

  // highlight the nav link of the section you are in
  if ('IntersectionObserver' in window) {
    const links = new Map($$('.nav-links a').map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const link = links.get(e.target.id);
        if (link && e.isIntersecting) {
          links.forEach((l) => l.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ── 5. leaderboard ────────────────────────────────────────── */
  // sample clans for the demo (hours played)
  const YOUR_TAG = 'BNY';
  const COLORS = [
    ['cream', '#D6C8C3'], ['white', '#FFFFFF'], ['gray', '#9AA0AE'], ['red', '#FF5555'], ['orange', '#FFAA33'], ['yellow', '#FFFF55'],
    ['lime', '#7CFF6B'], ['green', '#3BAE5A'], ['aqua', '#55FFFF'], ['blue', '#5599FF'], ['purple', '#B070FF'], ['pink', '#FF77CC'],
  ];
  let yourColor = '#FF77CC';
  const BOARD = {
    all: [
      { tag: 'BNY', name: 'Bunny Squad', hours: 482, color: null },
      { tag: 'MOON', name: 'Moon Pie', hours: 431, color: '#B070FF' },
      { tag: 'CRT', name: 'Carrot Crew', hours: 377, color: '#FFAA33' },
      { tag: 'MOCHI', name: 'Mochi Club', hours: 340, color: '#7CFF6B' },
      { tag: 'OWL', name: 'Night Owls', hours: 296, color: '#5599FF' },
    ],
    week: [
      { tag: 'CRT', name: 'Carrot Crew', hours: 61, color: '#FFAA33' },
      { tag: 'BNY', name: 'Bunny Squad', hours: 54, color: null },
      { tag: 'MOCHI', name: 'Mochi Club', hours: 49, color: '#7CFF6B' },
      { tag: 'MOON', name: 'Moon Pie', hours: 33, color: '#B070FF' },
      { tag: 'OWL', name: 'Night Owls', hours: 27, color: '#5599FF' },
    ],
  };

  function nextMonday() { // next Monday 00:00 UTC, when the weekly board resets
    const n = new Date();
    const d = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
    const add = ((8 - new Date(d).getUTCDay()) % 7) || 7;
    return d + add * 864e5;
  }
  function untilReset() {
    const s = Math.max(0, Math.floor((nextMonday() - Date.now()) / 1000));
    return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60) };
  }

  let period = 'all';
  function renderBoard() {
    const ol = $('#board');
    if (!ol) return;
    const rows = BOARD[period];
    const max = rows[0].hours;
    ol.innerHTML = rows.map((r, i) => {
      const mine = r.tag === YOUR_TAG;
      const color = r.color || yourColor;
      return `<li class="board-row${mine ? ' is-mine' : ''}">
        <span class="board-rank rank-${i + 1}">${i + 1}</span>
        <span class="board-name"><b style="color:${color}">[${r.tag}]</b> ${esc(r.name)}${mine ? ' <em>you</em>' : ''}</span>
        <span class="board-hours">${r.hours}h</span>
        <span class="board-bar" aria-hidden="true"><i style="width:${Math.round((r.hours / max) * 100)}%;background:${color}"></i></span>
      </li>`;
    }).join('');

    const foot = $('#board-foot');
    if (period === 'week') {
      const u = untilReset();
      foot.innerHTML = `<span>Last champion: <b style="color:#FFAA33">[CRT]</b> Carrot Crew</span><span>Resets in ${u.d}d ${u.h}h</span>`;
    } else {
      foot.innerHTML = '<span>Sample clans, just for this demo.</span>';
    }
  }

  $$('[data-period]').forEach((b) => b.addEventListener('click', () => {
    period = b.dataset.period;
    $$('[data-period]').forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    renderBoard();
  }));

  /* ── 6. tag colors ─────────────────────────────────────────── */
  (function tagColors() {
    const wrap = $('#swatches');
    if (!wrap) return;
    const tag = $('#demo-tag');
    const paint = () => { tag.style.color = yourColor; };
    COLORS.forEach(([name, hex]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch' + (hex === yourColor ? ' is-on' : '');
      b.style.background = hex;
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(hex === yourColor));
      b.setAttribute('aria-label', name);
      b.title = name;
      b.addEventListener('click', () => {
        yourColor = hex;
        $$('.swatch', wrap).forEach((x) => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-checked', String(on)); });
        paint();
        renderBoard();
      });
      wrap.appendChild(b);
    });
    paint();
  })();
  renderBoard();

  /* ── 7. Discord status + countdown ─────────────────────────── */
  (function presence() {
    const line = $('#presence-line');
    if (!line) return;
    const states = ['FPS: 144', 'Clan [BNY] - 12h 34m played'];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % states.length;
      if (reduceMotion) { line.textContent = states[i]; return; }
      line.classList.add('is-out');
      setTimeout(() => { line.textContent = states[i]; line.classList.remove('is-out'); }, 220);
    }, 3200);
  })();

  (function countdown() {
    const el = $('#countdown');
    if (!el) return;
    const tick = () => { const u = untilReset(); el.textContent = `${u.d}d ${u.h}h ${u.m}m`; };
    tick();
    setInterval(tick, 15000);
  })();
})();
