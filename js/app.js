/* Crunch Lab — app logic. Plain JS, CSS 3D, Lenis. No build step. */
(function () {
  'use strict';
  var CL = window.CL, F = CL.FLAVORS, N = CL.N, wrap = CL.wrap, lerp = CL.lerp, clamp = CL.clamp;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var root = document.documentElement;

  /* ---------- crimped silhouette for every bag ---------- */
  (function () {
    var n = 26, pts = [], i;
    for (i = 0; i <= n; i++) pts.push((i / n * 100).toFixed(2) + '% ' + (i % 2 ? '0%' : '1.5%'));
    for (i = n; i >= 0; i--) pts.push((i / n * 100).toFixed(2) + '% ' + (i % 2 ? '100%' : '98.5%'));
    root.style.setProperty('--clip', 'polygon(' + pts.join(',') + ')');
  })();

  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ============================================================
     SMOOTH SCROLL
  ============================================================ */
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.stop();
    (function loop(t) { lenis.raf(t); requestAnimationFrame(loop); })(performance.now());
  }
  function goTo(id) {
    var el = document.getElementById(id); if (!el) return;
    var y = el.getBoundingClientRect().top + window.scrollY;
    if (lenis) lenis.scrollTo(y, { duration: 1.6, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }
  $$('[data-go]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); goTo(a.dataset.go); }); });
  $$('.nav a').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); goTo(a.dataset.sec); }); });

  /* ============================================================
     THEME (hero flavor drives the page color)
  ============================================================ */
  var ringsPrev = $('#ringsPrev'), ringsNext = $('#ringsNext');
  function ringColors(f) {
    return { r1: f.color, r2: 'color-mix(in srgb,' + f.deep + ' 62%,' + f.color + ')' };
  }
  function paintRings(el, f) { var c = ringColors(f); el.style.setProperty('--r1', c.r1); el.style.setProperty('--r2', c.r2); }
  function applyTheme(f, instant) {
    root.style.setProperty('--c', f.color); root.style.setProperty('--deep', f.deep);
    root.style.setProperty('--glow', f.glow); root.style.setProperty('--ink', f.ink);
    $('#themed').style.color = f.ink;
    if (instant) { paintRings(ringsPrev, f); return; }
    paintRings(ringsNext, f);
    if (ringsNext._a) ringsNext._a.cancel();
    ringsNext._a = ringsNext.animate([{ clipPath: 'circle(0% at 50% 56%)' }, { clipPath: 'circle(150% at 50% 56%)' }], { duration: reduce ? 1 : 1100, easing: 'cubic-bezier(.22,1,.36,1)' });
    ringsNext._a.onfinish = function () { paintRings(ringsPrev, f); ringsNext.style.clipPath = 'circle(0% at 50% 56%)'; };
    ringsNext.style.clipPath = '';
  }

  /* ============================================================
     HERO CAROUSEL
  ============================================================ */
  var stage = $('#stage'), hero = $('#flavors');
  var heroBags = F.map(function (f, i) { var b = CL.bagEl(f); b.dataset.i = i; stage.appendChild(b); return b; });
  var H = { pos: 0, target: 0, spinT: 0, spin: 0, intro: 0, introOn: false, active: -1, dragging: false, auto: true, visible: true };
  var DEFAULT = 4; // Fire Chili — the same "hot red" hero moment as the reference
  H.pos = H.target = DEFAULT;

  var floatSpots = [[12, 22], [86, 14], [8, 72], [90, 66], [26, 12], [72, 80]];
  function buildFloaters(f) {
    var box = $('#floaters');
    box.innerHTML = floatSpots.map(function (p, i) {
      var inner = i % 2 ? CL.chipSVG(f.chip[0], f.chip[1], 'fl', 'fh' + i) : CL.ingSVG(f.ing, 'fl');
      return '<div class="floater" style="left:' + p[0] + '%;top:' + p[1] + '%;animation-delay:' + (-i * 0.9) + 's;transform:rotate(' + (i * 37 % 60 - 30) + 'deg)">' + inner + '</div>';
    }).join('');
  }
  function setHeroText(f, i) {
    var t = $('#heroTitle');
    t.innerHTML = f.name.map(function (l, k) { return '<span><i style="animation-delay:' + (k * 0.09) + 's">' + l + '</i></span>'; }).join('');
    $('#heroNum').textContent = String(i + 1).padStart(2, '0');
    $('#heroTag').textContent = f.tag;
  }
  function setActive(i, instant) {
    if (i === H.active) return;
    H.active = i;
    var f = F[i];
    applyTheme(f, instant);
    setHeroText(f, i);
    buildFloaters(f);
    buildStoryBag();
  }
  function go(dir) { H.target = Math.round(H.target) + dir; CL.crunch(.6); }
  $('#prev').addEventListener('click', function () { go(-1); resetAuto(); });
  $('#next').addEventListener('click', function () { go(1); resetAuto(); });
  document.addEventListener('keydown', function (e) {
    if (!H.visible) return;
    if (e.key === 'ArrowLeft') { go(-1); resetAuto(); } else if (e.key === 'ArrowRight') { go(1); resetAuto(); }
  });

  var autoTimer = null;
  function resetAuto() { clearInterval(autoTimer); if (H.auto && !reduce) autoTimer = setInterval(function () { if (H.visible && !H.dragging && document.visibilityState === 'visible') H.target = Math.round(H.target) + 1; }, 4200); }
  $('#auto').addEventListener('click', function () {
    H.auto = !H.auto; this.setAttribute('aria-pressed', H.auto); resetAuto();
  });

  // drag / swipe / click
  (function () {
    var sx = 0, spos = 0, moved = 0, lastX = 0, lastT = 0, vel = 0, down = false;
    function step() { return stage.clientWidth * 0.145; }
    stage.addEventListener('pointerdown', function (e) {
      down = true; H.dragging = true; sx = lastX = e.clientX; spos = H.pos; moved = 0; vel = 0; lastT = performance.now();
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
      var now = performance.now(); vel = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
      H.pos = spos - dx / step(); H.target = H.pos;
    });
    function up(e) {
      if (!down) return; down = false; H.dragging = false;
      if (moved > 8) { H.target = Math.round(H.pos - vel * 2.4); CL.crunch(.5); resetAuto(); return; }
      // click
      var el = document.elementFromPoint(e.clientX, e.clientY), bag = el && el.closest && el.closest('.bag');
      if (bag && bag.dataset.i !== undefined) {
        var i = +bag.dataset.i, o = wrap(i - H.target + N / 2, N) - N / 2;
        if (Math.abs(o) < .5) { H.spinT += 360; CL.crunch(1); } else { H.target = Math.round(H.target) + Math.round(o); CL.crunch(.6); }
        resetAuto();
      } else H.target = Math.round(H.pos);
    }
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5;
      heroBags.forEach(function (b) { b.querySelector('.bag-shine').style.setProperty('--sx', (-60 + x * 120) + '%'); });
    });
  })();

  var heroPar = { x: 0, y: 0, tx: 0, ty: 0 };
  hero.addEventListener('mousemove', function (e) {
    var r = hero.getBoundingClientRect(); heroPar.tx = (e.clientX - r.left) / r.width - .5; heroPar.ty = (e.clientY - r.top) / r.height - .5;
  });

  function renderHero() {
    H.pos += (H.target - H.pos) * (H.dragging ? 1 : 0.085);
    H.spin += (H.spinT - H.spin) * 0.07;
    heroPar.x += (heroPar.tx - heroPar.x) * .06; heroPar.y += (heroPar.ty - heroPar.y) * .06;
    var act = wrap(Math.round(H.pos), N); if (act !== H.active) setActive(act);
    var W = stage.clientWidth, Hh = stage.clientHeight, intro = H.intro;
    for (var i = 0; i < N; i++) {
      var o = wrap(i - H.pos + N / 2, N) - N / 2, ax = Math.abs(o), b = heroBags[i];
      var x = o * W * 0.145 * (0.4 + 0.6 * intro);
      var y = ax * ax * Hh * 0.012 + (1 - intro) * 220 + heroPar.y * -10 * (1 - ax * .1);
      var rz = o * 8 + (1 - intro) * o * 20;
      var ry = -o * 15 + heroPar.x * 14;
      var s = clamp(1.28 - ax * 0.2, .5, 1.28) * (0.6 + 0.4 * intro);
      var z = -ax * 140;
      var sp = ax < .5 ? H.spin : 0;
      b.style.transform = 'translate3d(' + (x + heroPar.x * -16).toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateZ(' + rz.toFixed(2) + 'deg) rotateY(' + (ry + sp).toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
      b.style.opacity = clamp(1 - (ax - 3.1) * 1.4, 0, 1) * clamp(intro * 1.6, 0, 1);
      b.style.zIndex = 100 - Math.round(ax * 10);
      b.style.pointerEvents = ax > 3.6 ? 'none' : 'auto';
    }
  }

  /* ============================================================
     STORY (pinned, scroll-scrubbed)
  ============================================================ */
  var story = $('#inside');
  var CH = [
    { k: 'CHAPTER 01 — THE BAG', t: 'BUILT TO<br>PROTECT', w: 'BAG', x: 'A pillow of air cushions every chip, while a foil-lined film keeps out light and moisture until the moment you tear it open.', h: [['HEAT-SEALED CRIMP', 'Locks the freshness in'], ['FOIL-LINED FILM', 'Blocks light & moisture'], ['AIR CUSHION', 'Keeps every chip whole']], rot: [-16, 6, 12, 1] },
    { k: 'CHAPTER 02 — THE POTATO', t: 'SLICED<br>PAPER-THIN', w: 'CHIP', x: 'Whole potatoes get washed, sliced thin, and rinsed so every chip fries up clean, golden and glass-crisp.', h: [['THIN-SLICED', 'Cut to snap, not chew'], ['COLD RINSE', 'Washes off extra starch'], ['SMALL BATCH', 'Fried in sunflower oil']], rot: [168, -8, -8, 1.06] },
    { k: 'CHAPTER 03 — THE SEASONING', t: 'DUSTED,<br>NOT DROWNED', w: 'FLAVOR', x: 'Seasoning lands the second the chips leave the fryer, while they’re still warm, so each slice wears an even, bold coat.', h: [['TUMBLE DRUM', 'Even coat, every chip'], ['REAL SPICES', 'Ground in the lab'], ['FLAVOR DUST', 'Clings while warm']], rot: [330, 16, 8, 1.12] },
    { k: 'CHAPTER 04 — THE CRUNCH', t: 'LISTEN<br>CLOSELY', w: 'CRUNCH', x: 'That snap is the whole point: a thin, glassy chip made to break clean. Fresh in the bag, loud in your head.', h: [['LOUD ON PURPOSE', 'Built to be heard'], ['SNAP TEST', 'Breaks, never bends'], ['FRESH DATE', 'Stamped on every pack']], rot: [546, -10, 14, 1.22] }
  ];
  var ICONS = ['<path d="M7 4h10l-1 16H8z"/><path d="M7 8h10"/>', '<ellipse cx="12" cy="12" rx="8" ry="6"/><path d="M7 11c3-3 7-3 10 0"/>', '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>', '<path d="M3 12h2l2-6 3 12 3-9 2 5 2-2h4"/>'];
  $('#chIcons').innerHTML = CH.map(function (c, i) { return '<div class="chicon" data-i="' + i + '"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[i] + '</svg></div>'; }).join('');

  var storyBagEl = $('#storyBag'), S = { p: 0, ch: -1, rot: [-16, 6, 12, 1], cur: [-16, 6, 12, 1], visible: false };
  function buildStoryBag() {
    var f = F[H.active < 0 ? DEFAULT : H.active];
    storyBagEl.innerHTML = '';
    var b = CL.bagEl(f); storyBagEl.appendChild(b);
    var back = document.createElement('div');
    back.className = 'bag-back';
    back.style.cssText = 'position:absolute;inset:0;transform:rotateY(180deg);backface-visibility:hidden;-webkit-backface-visibility:hidden;clip-path:var(--clip);background:linear-gradient(180deg,' + f.bagA + ',' + f.bagB + ');display:grid;place-items:center;overflow:hidden';
    back.innerHTML = '<svg viewBox="0 0 300 450" style="width:100%;height:100%"><rect width="300" height="34" fill="rgba(255,255,255,.2)"/><rect y="416" width="300" height="34" fill="rgba(255,255,255,.2)"/>' +
      '<g fill="#fff" font-family="Onest,sans-serif"><text x="150" y="86" text-anchor="middle" font-weight="900" font-size="24" letter-spacing="-.5">THE FINE PRINT</text>' +
      '<rect x="40" y="110" width="220" height="190" rx="10" fill="rgba(255,255,255,.92)"/>' +
      '<g fill="#222" font-size="11" font-weight="700"><text x="54" y="136">INGREDIENTS</text><text x="54" y="156" font-weight="500">Potatoes, sunflower oil,</text><text x="54" y="171" font-weight="500">seasoning (' + f.short.toLowerCase() + '),</text><text x="54" y="186" font-weight="500">sea salt.</text>' +
      '<rect x="54" y="204" width="192" height="1.5"/><text x="54" y="226">FRESH-SEALED</text><text x="54" y="244" font-weight="500">Open at the crimp. Enjoy soon.</text><text x="54" y="268" font-weight="500" opacity=".6">Concept pack — not for sale.</text></g></g>' +
      '<g transform="translate(150 350)" fill="#fff"><circle r="30" fill="#FFF7E6"/><text y="6" text-anchor="middle" font-family="Onest,sans-serif" font-weight="900" font-style="italic" font-size="20" fill="' + f.deep + '">crunch</text></g></svg>';
    storyBagEl.appendChild(back);
    $('.bag-body', storyBagEl).style.backfaceVisibility = 'hidden';
    $('.bag-body', storyBagEl).style.webkitBackfaceVisibility = 'hidden';
  }
  // story chips (float in the pinned scene)
  var storyChips = [];
  (function () {
    var box = $('#storyChips');
    for (var i = 0; i < 12; i++) {
      var d = document.createElement('div'); d.className = 'chip';
      var f = F[i % N];
      d.innerHTML = CL.chipSVG('#FFE58A', '#F2B705', 'x', 'sc' + i);
      d.firstChild.style.cssText = 'width:100%;display:block';
      d.style.width = (36 + (i * 17 % 50)) + 'px';
      box.appendChild(d);
      storyChips.push({ el: d, x: (i * 83 % 100), y: (i * 47 % 100), s: .5 + (i % 5) * .35, r: i * 40 });
    }
  })();
  function setChapter(c) {
    if (c === S.ch) return; S.ch = c;
    var d = CH[c];
    $('#chKick').textContent = d.k; $('#chNow').textContent = '0' + (c + 1);
    var t = $('#chTitle'); t.innerHTML = d.t; $('#chText').textContent = d.x;
    [t, $('#chText'), $('#chKick')].forEach(function (e) { e.classList.remove('ch-anim'); void e.offsetWidth; e.classList.add('ch-anim'); });
    $('#backword').textContent = d.w;
    $$('.hot').forEach(function (h, k) { h.classList.remove('on'); $('span', h).textContent = d.h[k][0]; $('em', h).textContent = d.h[k][1]; });
    $$('.chicon').forEach(function (e, k) { e.classList.toggle('on', k === c); });
    S.rot = d.rot; S.hotAt = performance.now() + 450; S.hotOn = false;
    CL.crunch(.5);
  }
  function renderStory() {
    var r = story.getBoundingClientRect(), vh = window.innerHeight, total = r.height - vh;
    var p = clamp(-r.top / total, 0, 1); S.p = p;
    var c = Math.min(3, Math.floor(p * 4 + 0.0001)), lp = p * 4 - c;
    setChapter(c);
    $('#chFill').style.transform = 'scaleX(' + (0.08 + p * .92).toFixed(3) + ')';
    // blend rotation toward next chapter slightly for continuous motion
    var nx = CH[Math.min(3, c + 1)].rot, cu = CH[c].rot, k = lp * lp * (3 - 2 * lp), out = [];
    for (var i = 0; i < 4; i++) out[i] = lerp(cu[i], nx[i], c === 3 ? 0 : k * .75);
    for (i = 0; i < 4; i++) S.cur[i] += (out[i] - S.cur[i]) * .09;
    var tt = performance.now() / 1000, bob = Math.sin(tt * 1.4) * 8;
    storyBagEl.style.transform = 'translateY(' + bob.toFixed(1) + 'px) rotateZ(' + S.cur[2].toFixed(1) + 'deg) rotateY(' + S.cur[0].toFixed(1) + 'deg) rotateX(' + S.cur[1].toFixed(1) + 'deg) scale(' + S.cur[3].toFixed(3) + ')';
    if (!S.hotOn && performance.now() > S.hotAt) { S.hotOn = true; $$('.hot').forEach(function (h, k) { setTimeout(function () { h.classList.add('on'); }, k * 140); }); }
    storyChips.forEach(function (c2, j) {
      var drift = (p * 140 * c2.s) % 160, y = ((c2.y + 100 - drift * .55) % 120) - 10;
      var x = c2.x + Math.sin(tt * .6 + j) * 2.5;
      c2.el.style.transform = 'translate(' + (x * (innerWidth / 100)).toFixed(0) + 'px,' + (y * (innerHeight / 100)).toFixed(0) + 'px) rotate(' + (c2.r + p * 420 * c2.s).toFixed(0) + 'deg) scale(' + c2.s.toFixed(2) + ')';
    });
  }

  /* ============================================================
     STORM
  ============================================================ */
  var stormSec = $('#storm-sec'), stormChips = [];
  (function () {
    var box = $('#stormChips');
    for (var i = 0; i < 34; i++) {
      var d = document.createElement('div'); d.className = 'chip';
      var w = 50 + (i * 29 % 110), pair = F[(i * 3) % N].chip;
      d.innerHTML = CL.chipSVG(pair[0], pair[1], 'x', 'st' + i); d.firstChild.style.cssText = 'width:100%;display:block';
      d.style.width = w + 'px'; box.appendChild(d);
      stormChips.push({ el: d, y: (i * 61 % 100), sp: .5 + (i % 7) * .22, r: i * 31, off: (i * 37 % 100) });
    }
  })();
  function renderStorm() {
    var r = stormSec.getBoundingClientRect(), vh = innerHeight;
    var p = clamp((vh - r.top) / (vh + r.height), 0, 1);
    stormChips.forEach(function (c, i) {
      var x = ((c.off / 100) * 0.4 - 0.2 + p * 1.5 * c.sp) * innerWidth - 100, y = c.y / 100 * r.height + Math.sin(p * 8 + i) * 40;
      c.el.style.transform = 'translate(' + x.toFixed(0) + 'px,' + y.toFixed(0) + 'px) rotate(' + (c.r + p * 720 * c.sp).toFixed(0) + 'deg)';
    });
    $('.storm-title', stormSec).style.transform = 'scale(' + (0.85 + Math.sin(p * Math.PI) * 0.22).toFixed(3) + ')';
  }

  /* ============================================================
     SHOP: WALL + BUILD-A-BOX
  ============================================================ */
  var box = [];       // flavor indices, max 3
  var basketBoxes = 0;
  var wallGrid = $('#wallGrid'), cards = [];
  F.forEach(function (f, i) {
    var c = document.createElement('article');
    c.className = 'card'; c.style.cssText = '--c1:' + f.color + ';--c2:' + f.deep + ';--ink:' + f.ink + ';--rot:' + ((i % 3 - 1) * 4) + 'deg';
    c.innerHTML = '<h3>' + f.name.join('<br>') + '</h3><div class="cshadow"></div>' + CL.ingSVG(f.ing, 'cing') + '<div class="cbag"></div><span class="inbox mono">×0</span><button class="add" aria-label="Add ' + f.short + ' to your box">+</button>';
    $('.cbag', c).appendChild(CL.bagEl(f));
    wallGrid.appendChild(c); cards.push(c);
    // tilt
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = 'perspective(900px) rotateY(' + (x * 12).toFixed(1) + 'deg) rotateX(' + (-y * 10).toFixed(1) + 'deg) translateY(-6px)';
      $('.bag-shine', c).style.setProperty('--sx', (-60 + x * 140) + '%');
    });
    c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    c.addEventListener('click', function (e) {
      if (e.target.closest('.add')) { addToBox(i); return; }
      c.classList.remove('flip'); void c.offsetWidth; c.classList.add('flip'); CL.crunch(1);
    });
  });

  // picker tiles
  var picker = $('#picker'), tiles = [];
  F.forEach(function (f, i) {
    var t = document.createElement('div'); t.className = 'tile';
    t.innerHTML = '<h4>' + f.name.join('<br>') + '</h4><button class="tbtn" style="--tint:color-mix(in srgb,' + f.deep + ' 80%,#1B130F)" aria-label="Add ' + f.short + '"><span class="tb"></span><b class="cnt zero">+</b></button>';
    $('.tb', t).appendChild(CL.bagEl(f)); picker.appendChild(t); tiles.push(t);
  });
  // custom order so row 1 = first five, row 2 = remaining four (matches the grid)
  var slotsEl = $('#traySlots');
  for (var s = 0; s < 3; s++) { var sl = document.createElement('div'); sl.className = 'slot'; sl.textContent = '0' + (s + 1); slotsEl.appendChild(sl); }

  function addToBox(i) {
    if (box.length >= 3) { toast('Tray’s full — remove a bag to swap flavors.'); return; }
    box.push(i); CL.crunch(1); renderBox();
    if (box.length === 3) toast('3-pack complete — you save $1.49.');
  }
  function removeFromBox(slot) { box.splice(slot, 1); CL.crunch(.5); renderBox(); }
  function renderBox() {
    var counts = {}; box.forEach(function (i) { counts[i] = (counts[i] || 0) + 1; });
    tiles.forEach(function (t, i) {
      var n = counts[i] || 0, b = $('.cnt', t);
      b.textContent = n || '+'; b.classList.toggle('zero', !n); $('.tbtn', t).classList.toggle('sel', !!n);
    });
    cards.forEach(function (c, i) { var n = counts[i] || 0, b = $('.inbox', c); b.textContent = '×' + n + ' in box'; b.classList.toggle('on', !!n); });
    $$('.slot', slotsEl).forEach(function (sl, k) {
      var cur = sl.dataset.f;
      if (box[k] === undefined) { if (cur !== undefined) { sl.innerHTML = ''; sl.textContent = '0' + (k + 1); delete sl.dataset.f; sl.classList.remove('filled'); } return; }
      if (cur === String(box[k])) return;
      sl.dataset.f = box[k]; sl.classList.add('filled'); sl.textContent = '';
      sl.appendChild(CL.bagEl(F[box[k]]));
      var x = document.createElement('button'); x.className = 'x'; x.textContent = '×'; x.setAttribute('aria-label', 'Remove bag'); x.addEventListener('click', function () { removeFromBox(k); });
      sl.appendChild(x);
    });
    var last = box.length ? F[box[box.length - 1]] : null;
    $('.tray-disc').style.background = last ? 'repeating-radial-gradient(circle,color-mix(in srgb,' + last.deep + ' 80%,#14100c) 0 8%,color-mix(in srgb,' + last.deep + ' 62%,#14100c) 8% 16%)' : '';
    var full = box.length === 3, ab = $('#addBasket');
    ab.disabled = !full; $('#abT').textContent = full ? 'ADD TO BASKET' : 'PICK ' + (3 - box.length) + ' TO SAVE';
    updateDots();
  }
  function updateDots() {
    var d = $$('#dots i'), n = basketBoxes ? 3 : box.length;
    d.forEach(function (e, k) { e.classList.toggle('f', k < n); });
  }
  tiles.forEach(function (t, i) {
    var btn = $('.tbtn', t), sx, sy, ghost = null, down = false, dragged = false;
    btn.addEventListener('pointerdown', function (e) { down = true; dragged = false; sx = e.clientX; sy = e.clientY; });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      if (!ghost && Math.hypot(e.clientX - sx, e.clientY - sy) > 12) {
        dragged = true; ghost = CL.bagEl(F[i]); ghost.style.cssText = 'position:fixed;left:0;top:0;margin:0;width:90px;z-index:120;pointer-events:none;transform:translate(-50%,-50%) rotate(-8deg)';
        document.body.appendChild(ghost);
      }
      if (ghost) ghost.style.left = e.clientX + 'px', ghost.style.top = e.clientY + 'px';
    });
    window.addEventListener('pointerup', function (e) {
      if (!down) return; down = false;
      if (ghost) {
        var r = $('#tray').getBoundingClientRect();
        if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) addToBox(i);
        ghost.remove(); ghost = null;
      }
    });
    btn.addEventListener('click', function () { if (!dragged) addToBox(i); });
  });
  $('#addBasket').addEventListener('click', function () {
    if (box.length < 3) return;
    basketBoxes++; var names = box.map(function (i) { return F[i].short; }).join(', ');
    box = []; renderBox(); updateDots();
    var bk = $('#basketBtn'); bk.classList.remove('bump'); void bk.offsetWidth; bk.classList.add('bump');
    toast('Added: ' + names + '. Concept only — nothing is charged.'); CL.crunch(1.2);
  });
  $('#basketBtn').addEventListener('click', function () { toast(basketBoxes ? basketBoxes + ' box' + (basketBoxes > 1 ? 'es' : '') + ' in basket — concept only, nothing is charged.' : 'Your basket is empty. Build a 3-pack!'); });
  renderBox();

  /* ============================================================
     THE RACK
  ============================================================ */
  var rackView = $('#rackView'), rackTrack = $('#rackTrack'), hangs = [], R = { pos: 0, target: 0, vel: 0, visible: false, dragging: false, hw: 300 };
  F.forEach(function (f, i) {
    var h = document.createElement('div'); h.className = 'hang';
    h.innerHTML = '<i class="string"></i><i class="clip"></i><div class="hb"></div><span class="tag" style="--tc:' + f.color + '">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<div class="info"><small>' + String(i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0') + '</small><b>' + f.name.join(' ') + '</b><button class="taste" data-i="' + i + '">TASTE IT →</button></div>';
    $('.hb', h).appendChild(CL.bagEl(f)); rackTrack.appendChild(h); hangs.push(h);
    $('.taste', h).addEventListener('click', function (e) { e.stopPropagation(); H.target = i + Math.round((H.target - i) / N) * N; resetAuto(); goTo('flavors'); });
  });
  var STEP = 86, rulerTrack = $('#rulerTrack');
  (function () {
    var html = '';
    for (var i = 0; i < N; i++) {
      html += '<i style="left:' + (i * STEP) + 'px"></i><b style="left:' + (i * STEP) + 'px">' + String(i + 1).padStart(2, '0') + '</b>';
      if (i < N - 1) for (var m = 1; m < 5; m++) html += '<i class="mn" style="left:' + (i * STEP + m * STEP / 5) + 'px"></i>';
    }
    rulerTrack.innerHTML = html;
  })();
  function sizeRack() { R.hw = clamp(rackView.clientWidth * 0.24, 190, 380); rackView.style.setProperty('--hw', R.hw + 'px'); rackTrack.style.width = (N * R.hw) + 'px'; }
  sizeRack(); addEventListener('resize', sizeRack);
  R.pos = R.target = 2;
  (function () {
    var down = false, sx, spos, moved, lastX, lastT, vel = 0;
    rackView.addEventListener('pointerdown', function (e) { down = true; R.dragging = true; sx = lastX = e.clientX; spos = R.pos; moved = 0; vel = 0; lastT = performance.now(); rackView.setPointerCapture(e.pointerId); });
    rackView.addEventListener('pointermove', function (e) {
      if (!down) return; var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
      var now = performance.now(); vel = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
      R.pos = clamp(spos - dx / R.hw, -.4, N - .6); R.target = R.pos;
    });
    function up(e) {
      if (!down) return; down = false; R.dragging = false;
      if (moved > 8) { R.target = clamp(Math.round(R.pos - vel * 1.8), 0, N - 1); CL.crunch(.4); return; }
      var el = document.elementFromPoint(e.clientX, e.clientY), h = el && el.closest && el.closest('.hang');
      if (h && !el.closest('.taste')) {
        var i = hangs.indexOf(h);
        if (Math.abs(i - R.pos) < .5) { h.classList.remove('spin'); void h.offsetWidth; h.classList.add('spin'); CL.crunch(1); }
        else R.target = i;
      } else R.target = clamp(Math.round(R.pos), 0, N - 1);
    }
    rackView.addEventListener('pointerup', up); rackView.addEventListener('pointercancel', up);
    rackView.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2) { e.preventDefault(); R.target = clamp(R.target + e.deltaX / R.hw * .6, 0, N - 1); }
    }, { passive: false });
    rackView.addEventListener('mousemove', function (e) { var r = rackView.getBoundingClientRect(); R.mx = e.clientX - r.left; });
    rackView.addEventListener('mouseleave', function () { R.mx = null; });
  })();
  var lastRackPos = R.pos;
  function renderRack() {
    R.pos += (R.target - R.pos) * (R.dragging ? 1 : .1);
    var v = R.pos - lastRackPos; lastRackPos = R.pos; R.vel += (v - R.vel) * .2;
    var vw = rackView.clientWidth;
    rackTrack.style.transform = 'translate3d(' + (vw / 2 - (R.pos * R.hw + R.hw / 2)).toFixed(1) + 'px,0,0)';
    var sway = clamp(-R.vel * 140, -14, 14), tt = performance.now() / 1000;
    hangs.forEach(function (h, i) {
      var d = i - R.pos, ad = Math.abs(d);
      var near = 0;
      if (R.mx != null) { var cx = vw / 2 + d * R.hw; near = clamp(1 - Math.abs(R.mx - cx) / R.hw, 0, 1); }
      var idle = Math.sin(tt * 1.3 + i) * 1.4;
      h.style.transform = 'rotate(' + (sway * (1 + near * .5) + idle + near * (R.mx > vw / 2 + d * R.hw ? -4 : 4)).toFixed(2) + 'deg)';
      $('.info', h).style.opacity = (0.22 + 0.78 * (1 - clamp(ad, 0, 1))).toFixed(2);
      $('.info', h).style.pointerEvents = ad < .6 ? 'auto' : 'none';
    });
    var near = clamp(Math.round(R.pos), 0, N - 1);
    $('#rackCount').textContent = String(near + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
    rulerTrack.style.transform = 'translateX(' + (-R.pos * STEP).toFixed(1) + 'px)';
  }

  /* ============================================================
     Q&A, JOIN, SOUND
  ============================================================ */
  var QA = [
    ['Is this a real product?', 'No. Crunch Lab is a concept and portfolio project. The flavors, packs, prices and the store are all invented, and nothing here can be bought.'],
    ['How is the 3D done?', 'Every bag is vector artwork drawn in code, lifted into CSS 3D with a custom scroll scrubber and Lenis for smooth scrolling. No image files and no WebGL, so it loads fast and runs almost anywhere.'],
    ['Can I really build a 3-pack?', 'In the demo, yes. Tap or drag any three bags into the tray (repeats are fine). With three in, the price drops from $7.47 to $5.98. The basket is pretend.'],
    ['What does the sound button do?', 'Turn it on and your taps, spins and chapter changes make a tiny synthesized crunch using the Web Audio API. It is off by default, so nothing makes noise until you ask.'],
    ['Does it work on phones?', 'Yes. The layout keeps the same composition as on a laptop and scales down. Swipe the hero carousel, drag the rack, and tap bags to spin them.'],
    ['Is it accessible?', 'Controls are real buttons you can reach with the keyboard, and the left and right arrow keys flip flavors. If your system asks for reduced motion, animations are cut back and smooth scrolling is turned off.']
  ];
  $('#qaList').innerHTML = QA.map(function (q, i) { return '<div class="qi' + (i === 0 ? ' open' : '') + '"><button class="qq" aria-expanded="' + (i === 0) + '"><span>' + q[0] + '</span><i>+</i></button><div class="qa-a"><p>' + q[1] + '</p></div></div>'; }).join('');
  $$('.qq').forEach(function (b) { b.addEventListener('click', function () { var it = b.parentNode, open = !it.classList.contains('open'); $$('.qi').forEach(function (x) { x.classList.remove('open'); $('.qq', x).setAttribute('aria-expanded', false); }); if (open) { it.classList.add('open'); b.setAttribute('aria-expanded', true); } CL.crunch(.4); }); });

  $('#joinForm').addEventListener('submit', function (e) {
    e.preventDefault(); var v = $('#joinEmail').value.trim(), m = $('#joinMsg');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { m.textContent = 'That email looks off — try again.'; return; }
    m.textContent = 'You’re on the list (concept only — nothing was saved). Crunch on.'; $('#joinEmail').value = ''; CL.crunch(1.2);
  });
  $('#snd').addEventListener('click', function () {
    CL.sound.on = !CL.sound.on; this.setAttribute('aria-pressed', CL.sound.on); $('#sndTxt').textContent = CL.sound.on ? 'ON' : 'OFF'; CL.crunch(1);
  });
  $('#yr').textContent = new Date().getFullYear();

  /* ============================================================
     SECTION TONE + ACTIVE NAV
  ============================================================ */
  var SECS = [['flavors', 'flavors'], ['inside', 'inside'], ['storm-sec', 'inside'], ['shop', 'shop'], ['box', 'shop'], ['range', 'range'], ['qa', 'qa'], ['join', 'join']].map(function (a) { return { el: document.getElementById(a[0]), nav: a[1] }; });
  var navLinks = $$('.nav a'), curNav = '';
  function updateTone() {
    var y = innerHeight * .12, hit = SECS[0];
    for (var i = 0; i < SECS.length; i++) { var r = SECS[i].el.getBoundingClientRect(); if (r.top <= y && r.bottom > y) { hit = SECS[i]; break; } }
    var tone = hit.el.dataset.tone || 'dark';
    if (document.body.dataset.tone !== tone) document.body.dataset.tone = tone;
    if (hit.nav !== curNav) { curNav = hit.nav; navLinks.forEach(function (a) { a.classList.toggle('on', a.dataset.sec === curNav); }); }
  }

  // visibility flags so we only animate what's on screen
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.target === hero) H.visible = e.isIntersecting;
      else if (e.target === story) S.visible = e.isIntersecting;
      else if (e.target === stormSec) S.stormVisible = e.isIntersecting;
      else if (e.target === rackView) R.visible = e.isIntersecting;
    });
  }, { rootMargin: '10% 0px' });
  [hero, story, stormSec, rackView].forEach(function (e) { io.observe(e); });

  /* ============================================================
     MAIN LOOP
  ============================================================ */
  function frame() {
    if (H.visible) renderHero();
    if (S.visible) renderStory();
    if (S.stormVisible) renderStorm();
    if (R.visible) renderRack();
    updateTone();
    requestAnimationFrame(frame);
  }

  /* ============================================================
     PRELOADER — chip storm, season, burst
  ============================================================ */
  var pre = $('#pre'), cv = $('#storm'), ctx = cv.getContext('2d'), preDone = false;
  var preChips = [], PW, PH, dpr = Math.min(2, devicePixelRatio || 1);
  function sizePre() { PW = cv.width = innerWidth * dpr; PH = cv.height = innerHeight * dpr; }
  sizePre(); addEventListener('resize', sizePre);
  for (var pi = 0; pi < 46; pi++) preChips.push({ x: Math.random(), y: Math.random(), s: .4 + Math.random() * 1.1, v: .05 + Math.random() * .22, r: Math.random() * 6.28, rv: (Math.random() - .5) * .04 });
  var chipPath = new Path2D('M8 38 C4 14 38 2 62 6 C90 10 98 30 92 50 C84 70 40 74 20 64 C10 58 8 48 8 38Z');
  function drawPre() {
    if (preDone) return;
    ctx.clearRect(0, 0, PW, PH);
    preChips.forEach(function (c) {
      c.y += c.v * .01; c.x += c.v * .004; c.r += c.rv; if (c.y > 1.1) { c.y = -.1; c.x = Math.random(); } if (c.x > 1.1) c.x = -.1;
      ctx.save(); ctx.translate(c.x * PW, c.y * PH); ctx.rotate(c.r); var sc = c.s * dpr * 0.9; ctx.scale(sc, sc); ctx.translate(-50, -36);
      ctx.globalAlpha = .55 + c.s * .3; ctx.fillStyle = c.s > 1 ? '#FFD84A' : '#F6B91E'; ctx.fill(chipPath);
      ctx.strokeStyle = 'rgba(120,60,0,.28)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(22, 24); ctx.quadraticCurveTo(44, 10, 70, 18); ctx.moveTo(18, 42); ctx.quadraticCurveTo(44, 28, 82, 38); ctx.stroke();
      ctx.restore();
    });
    requestAnimationFrame(drawPre);
  }
  $('#preChip').innerHTML = CL.chipSVG('#FFE58A', '#F2B705', 'pc', 'pchip');

  function initExperience() {
    document.body.classList.remove('loading');
    H.introOn = true;
    var t0 = performance.now();
    (function intro(t) { var k = clamp((t - t0) / 1500, 0, 1); H.intro = 1 - Math.pow(1 - k, 4); if (k < 1) requestAnimationFrame(intro); })(t0);
    if (lenis) lenis.start();
    resetAuto();
  }
  function finishPre() {
    var ch = $('#preChip'); ch.classList.add('season'); $('#preLabel').textContent = 'SEASONED. SEALED. READY.';
    setTimeout(function () {
      var a = pre.animate([{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], { duration: reduce ? 1 : 1000, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
      initExperience();
      a.onfinish = function () { pre.remove(); preDone = true; };
    }, reduce ? 0 : 650);
  }

  // build everything first, then run the loader
  document.body.classList.add('loading');
  setActive(DEFAULT, true);
  buildStoryBag();
  frame();
  drawPre();
  var steps = [[0, 'SLICING POTATOES'], [28, 'HEATING THE OIL'], [58, 'DUSTING THE FLAVOR'], [88, 'SEALING THE BAG']];
  var pctEl = $('#prePct'), lab = $('#preLabel'), start = performance.now(), dur = reduce ? 200 : 2600, fontsReady = false;
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { fontsReady = true; });
  (function tickPre(t) {
    var k = clamp((t - start) / dur, 0, 1), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    var pct = Math.round(e * 100); if (!fontsReady) pct = Math.min(pct, 92);
    pctEl.textContent = pct;
    for (var i = steps.length - 1; i >= 0; i--) if (pct >= steps[i][0]) { if (lab.textContent !== steps[i][1] && pct < 100) lab.textContent = steps[i][1]; break; }
    if (pct >= 100) return finishPre();
    requestAnimationFrame(tickPre);
  })(performance.now());
})();
