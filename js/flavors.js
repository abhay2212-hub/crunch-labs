/* Flavor data + procedural pack art (original brand: "Crunch Lab"). Everything is vector, no external assets. */
window.CL = window.CL || {};
(function (CL) {
  // color = main page color, deep = darker backdrop, glow = highlight, ink = text on color
  CL.FLAVORS = [
    { id: 'classic', name: ['CLASSIC'], short: 'Classic', color: '#F2B705', deep: '#B97F00', glow: '#FFE27A', ink: '#2A1B00', bagA: '#FFD84A', bagB: '#F0A500', label: '#FFF6D6', labelInk: '#3B2600', ing: 'potato', chip: ['#FFE58A', '#F2B705'], tag: 'Just potatoes, oil and salt.' },
    { id: 'sour', name: ['SOUR CREAM', '& ONION'], short: 'Sour Cream & Onion', color: '#1E9A4B', deep: '#0C5A2A', glow: '#74E39B', ink: '#FFFFFF', bagA: '#2FBF63', bagB: '#127A38', label: '#F3FFF3', labelInk: '#0C4A22', ing: 'onion', chip: ['#E8F5A8', '#B8D861'], tag: 'Cool, creamy, a little chive-y.' },
    { id: 'bbq', name: ['BARBECUE'], short: 'Barbecue', color: '#D2491B', deep: '#7A2208', glow: '#FF9A62', ink: '#FFFFFF', bagA: '#4A2A1C', bagB: '#2A140C', label: '#FFE9D6', labelInk: '#5A2410', ing: 'bbq', chip: ['#FFB067', '#E2661F'], tag: 'Smoky, tangy, slow-cooked vibes.' },
    { id: 'vinegar', name: ['SALT &', 'VINEGAR'], short: 'Salt & Vinegar', color: '#2E8BDB', deep: '#0F4C8A', glow: '#8FD0FF', ink: '#FFFFFF', bagA: '#4BB0FF', bagB: '#1D6FC4', label: '#EAF6FF', labelInk: '#0B3A70', ing: 'vinegar', chip: ['#FFF0A0', '#F2C93A'], tag: 'Sharp enough to make you blink.' },
    { id: 'fire', name: ['FIRE', 'CHILI'], short: 'Fire Chili', color: '#C8102E', deep: '#7A0A1C', glow: '#FF6B7F', ink: '#FFFFFF', bagA: '#E8352B', bagB: '#A60E1E', label: '#1A1111', labelInk: '#FFD9A8', ing: 'chili', chip: ['#FF8A4A', '#D8261C'], tag: 'Dangerously dusted. Worth it.' },
    { id: 'cheddar', name: ['CHEDDAR &', 'SOUR CREAM'], short: 'Cheddar & Sour Cream', color: '#F2772A', deep: '#9A3F08', glow: '#FFC27A', ink: '#FFFFFF', bagA: '#FF9440', bagB: '#E0560F', label: '#FFF3E2', labelInk: '#6A2A06', ing: 'cheddar', chip: ['#FFC06A', '#F08A24'], tag: 'Sharp cheddar meets cool cream.' },
    { id: 'dressed', name: ['ALL', 'DRESSED'], short: 'All Dressed', color: '#8B3FA8', deep: '#4B1A63', glow: '#D79BF0', ink: '#FFFFFF', bagA: '#A257C2', bagB: '#5E2380', label: '#F8ECFF', labelInk: '#44165E', ing: 'tomato', chip: ['#FFC08A', '#E06A3A'], tag: 'Ketchup, vinegar, onion, BBQ. All of it.' },
    { id: 'honey', name: ['SMOKY HONEY', 'BBQ'], short: 'Smoky Honey BBQ', color: '#A11D2E', deep: '#590C17', glow: '#F07A6A', ink: '#FFFFFF', bagA: '#C0283A', bagB: '#7A1020', label: '#FFEBD0', labelInk: '#5A1018', ing: 'honey', chip: ['#FFB05A', '#D0501C'], tag: 'Sweet first, smoky after.' },
    { id: 'bacon', name: ['BACON &', 'CHEDDAR'], short: 'Bacon & Cheddar', color: '#E6A23C', deep: '#8F5A10', glow: '#FFE1A0', ink: '#2E1A00', bagA: '#F5BE5A', bagB: '#D58A1C', label: '#FFF6E4', labelInk: '#5A3200', ing: 'bacon', chip: ['#FFE0A0', '#E9A83A'], tag: 'Crispy, salty, melty. Breakfast energy.' }
  ];
  CL.N = CL.FLAVORS.length;

  /* ---------- tiny vector ingredients, drawn in a 100x100 box ---------- */
  var ING = {
    potato: '<ellipse cx="50" cy="54" rx="34" ry="26" fill="#C9955A"/><ellipse cx="44" cy="48" rx="26" ry="16" fill="#DDAF72" opacity=".7"/><circle cx="36" cy="58" r="2.4" fill="#8A5F30"/><circle cx="62" cy="50" r="2.4" fill="#8A5F30"/><circle cx="52" cy="66" r="2" fill="#8A5F30"/>',
    onion: '<ellipse cx="50" cy="58" rx="32" ry="28" fill="#C75A8A"/><ellipse cx="50" cy="58" rx="22" ry="20" fill="#F3C9DD"/><ellipse cx="50" cy="58" rx="12" ry="11" fill="#E39BBD"/><path d="M50 30 C46 18 52 10 58 6" stroke="#4DAE50" stroke-width="5" fill="none" stroke-linecap="round"/>',
    bbq: '<ellipse cx="50" cy="66" rx="34" ry="14" fill="#5A2A18"/><path d="M16 64 Q50 30 84 64 Q50 84 16 64Z" fill="#8A3A1E"/><ellipse cx="50" cy="60" rx="26" ry="8" fill="#B5502A"/><path d="M62 12 Q70 28 58 40" stroke="#E8D8C0" stroke-width="3" fill="none"/><path d="M40 14 Q48 26 38 38" stroke="#E8D8C0" stroke-width="3" fill="none" opacity=".7"/>',
    vinegar: '<rect x="34" y="34" width="32" height="54" rx="8" fill="#B8261E"/><rect x="40" y="18" width="20" height="20" rx="4" fill="#E8EEF5"/><rect x="38" y="52" width="24" height="18" rx="3" fill="#FFF5E0"/><path d="M76 78 l8 -6 l6 8 l-10 6z" fill="#fff" opacity=".9"/><path d="M14 70 l8 -4 l4 8 l-9 4z" fill="#fff" opacity=".8"/>',
    chili: '<path d="M30 24 C70 20 92 50 80 86 C68 70 44 52 30 24Z" fill="#E2231A"/><path d="M34 26 C60 28 78 44 82 70" stroke="#FF7A6A" stroke-width="3" fill="none" opacity=".7"/><path d="M30 24 C22 18 24 10 32 6 C34 14 38 18 44 20Z" fill="#3E9B3E"/>',
    cheddar: '<path d="M12 62 L58 22 L90 52 L90 78 L12 78Z" fill="#F7B92A"/><path d="M58 22 L90 52 L90 62 L58 32Z" fill="#FFD866"/><circle cx="34" cy="68" r="5" fill="#D78F10"/><circle cx="62" cy="64" r="6" fill="#D78F10"/><circle cx="78" cy="72" r="3.5" fill="#D78F10"/>',
    tomato: '<circle cx="50" cy="56" r="32" fill="#E0301E"/><ellipse cx="40" cy="44" rx="10" ry="6" fill="#FF8A78" opacity=".6"/><path d="M50 26 l-8 -8 l8 4 l8 -4z M50 26 l-14 2 l12 6 M50 26 l14 2 l-12 6" fill="#3E9B3E" stroke="#3E9B3E" stroke-width="2" stroke-linejoin="round"/>',
    honey: '<path d="M50 10 C50 10 20 46 20 64 C20 82 34 92 50 92 C66 92 80 82 80 64 C80 46 50 10 50 10Z" fill="#F4A81D"/><path d="M36 62 C36 70 40 76 46 78" stroke="#FFE08A" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M62 40 l6 -3 l6 3 l0 7 l-6 3 l-6 -3z" fill="#FFD25A" opacity=".8"/>',
    bacon: '<path d="M10 40 Q28 20 46 40 T82 40 L82 58 Q64 78 46 58 T10 58Z" fill="#C93A2A"/><path d="M10 49 Q28 29 46 49 T82 49" stroke="#F5B8A8" stroke-width="6" fill="none"/><path d="M14 72 Q32 54 50 72 T90 72" stroke="#B02A1C" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M14 72 Q32 54 50 72 T90 72" stroke="#F0A898" stroke-width="3" fill="none" stroke-linecap="round"/>'
  };
  CL.ingSVG = function (key, cls) {
    return '<svg class="' + (cls || 'ing') + '" viewBox="0 0 100 100" aria-hidden="true">' + (ING[key] || ING.potato) + '</svg>';
  };

  /* ---------- a single crispy chip, 100x72 ---------- */
  CL.chipSVG = function (c1, c2, cls, uid) {
    uid = uid || ('c' + Math.random().toString(36).slice(2, 7));
    return '<svg class="' + (cls || 'chip') + '" viewBox="0 0 100 72" aria-hidden="true"><defs><radialGradient id="' + uid + '" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></radialGradient></defs>' +
      '<path d="M8 38 C4 14 38 2 62 6 C90 10 98 30 92 50 C84 70 40 74 20 64 C10 58 8 48 8 38Z" fill="url(#' + uid + ')"/>' +
      '<path d="M22 24 Q44 10 70 18 M18 42 Q44 28 82 38 M26 56 Q50 46 78 54" stroke="rgba(120,60,0,.25)" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M16 30 Q30 14 54 12" stroke="rgba(255,255,255,.55)" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
  };

  /* ---------- the pack. 300x450 art, crimped seals top + bottom ---------- */
  var uidN = 0;
  CL.bagSVG = function (f) {
    var u = 'b' + (uidN++);
    var chips = '';
    var cs = [[34, 292, 96, -14], [118, 318, 104, 8], [168, 280, 90, 22]];
    cs.forEach(function (p, i) {
      chips += '<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + p[3] + ' 50 36) scale(' + (p[2] / 100) + ')">' + CL.chipSVG(f.chip[0], f.chip[1], 'x', u + 'c' + i).replace(/<svg[^>]*>|<\/svg>/g, '') + '</g>';
    });
    var l1 = f.name[0], l2 = f.name[1] || '';
    var fs = Math.min(36, 230 / Math.max(l1.length, l2.length) * 1.6);
    return '<svg viewBox="0 0 300 450" class="bag-art" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="' + u + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + f.bagA + '"/><stop offset="1" stop-color="' + f.bagB + '"/></linearGradient>' +
      '<pattern id="' + u + 'p" width="7" height="10" patternUnits="userSpaceOnUse"><rect width="3.5" height="10" fill="rgba(255,255,255,.28)"/><rect x="3.5" width="3.5" height="10" fill="rgba(0,0,0,.18)"/></pattern>' +
      '<radialGradient id="' + u + 'r" cx="50%" cy="38%" r="60%"><stop offset="0" stop-color="rgba(255,255,255,.32)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient>' +
      '</defs>' +
      '<rect width="300" height="450" fill="url(#' + u + 'g)"/>' +
      '<circle cx="150" cy="150" r="190" fill="url(#' + u + 'r)"/>' +
      // burst rays
      '<g opacity=".12" fill="#fff">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (i) { return '<path d="M150 150 L' + (150 + Math.cos(i * Math.PI / 6) * 260).toFixed(1) + ' ' + (150 + Math.sin(i * Math.PI / 6) * 260).toFixed(1) + ' L' + (150 + Math.cos((i + .5) * Math.PI / 6) * 260).toFixed(1) + ' ' + (150 + Math.sin((i + .5) * Math.PI / 6) * 260).toFixed(1) + 'Z"/>'; }).join('') + '</g>' +
      // seals
      '<rect width="300" height="34" fill="url(#' + u + 'p)"/><rect y="416" width="300" height="34" fill="url(#' + u + 'p)"/>' +
      '<rect y="30" width="300" height="5" fill="rgba(0,0,0,.2)"/><rect y="415" width="300" height="5" fill="rgba(0,0,0,.2)"/>' +
      // tiny print
      '<text x="150" y="58" text-anchor="middle" font-family="Onest,sans-serif" font-weight="700" font-size="7.5" letter-spacing="1.6" fill="#fff" opacity=".85">REAL POTATOES · NO ARTIFICIAL COLORS</text>' +
      // brand badge
      '<g transform="translate(150 128)"><circle r="56" fill="#FFF7E6"/><circle r="56" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2"/><circle r="49" fill="none" stroke="' + f.bagB + '" stroke-width="2" stroke-dasharray="3 5"/>' +
      '<path d="M30 -34 a10 10 0 0 1 8 14 a10 10 0 0 1 -14 -6z" fill="' + f.bagA + '" opacity=".9"/>' +
      '<text y="6" text-anchor="middle" font-family="Onest,sans-serif" font-weight="900" font-style="italic" font-size="31" letter-spacing="-1.5" fill="' + f.deep + '">crunch</text>' +
      '<text y="26" text-anchor="middle" font-family="Onest,sans-serif" font-weight="800" font-size="10.5" letter-spacing="5" fill="' + f.bagB + '">LAB</text></g>' +
      // label
      '<g transform="translate(150 236)"><rect x="-96" y="-30" width="192" height="' + (l2 ? 64 : 48) + '" rx="12" fill="' + f.label + '"/>' +
      '<text y="' + (l2 ? 0 : 8) + '" text-anchor="middle" font-family="Onest,sans-serif" font-weight="900" font-size="' + fs.toFixed(1) + '" letter-spacing="-.5" fill="' + f.labelInk + '">' + l1.replace('&', '&amp;') + '</text>' +
      (l2 ? '<text y="' + (fs * .95).toFixed(1) + '" text-anchor="middle" font-family="Onest,sans-serif" font-weight="900" font-size="' + fs.toFixed(1) + '" letter-spacing="-.5" fill="' + f.labelInk + '">' + l2.replace('&', '&amp;') + '</text>' : '') +
      '</g>' +
      chips +
      '<g transform="translate(12 300) rotate(-8 40 40) scale(1)" >' + '<svg width="104" height="104" viewBox="0 0 100 100">' + (ING[f.ing] || '') + '</svg></g>' +
      '<text x="150" y="408" text-anchor="middle" font-family="Onest,sans-serif" font-weight="700" font-size="7" letter-spacing="2" fill="#fff" opacity=".8">POTATO CHIPS · NET WT 6.5 OZ · CONCEPT PACK</text>' +
      '</svg>';
  };

  CL.bagEl = function (f) {
    var el = document.createElement('div');
    el.className = 'bag';
    el.innerHTML = '<div class="bag-body">' + CL.bagSVG(f) + '<i class="bag-pillow"></i><i class="bag-shine"></i></div>';
    return el;
  };

  CL.price = { each: 2.49, bundle: 5.98 };
  CL.wrap = function (v, n) { return ((v % n) + n) % n; };
  CL.lerp = function (a, b, t) { return a + (b - a) * t; };
  CL.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- tiny synth crunch, opt-in ---------- */
  CL.sound = { on: false, ctx: null };
  CL.crunch = function (power) {
    if (!CL.sound.on) return;
    try {
      var ctx = CL.sound.ctx || (CL.sound.ctx = new (window.AudioContext || window.webkitAudioContext)());
      var len = ctx.sampleRate * 0.18, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) { var env = Math.pow(1 - i / len, 3); d[i] = (Math.random() * 2 - 1) * env * (Math.random() > .985 ? 1 : .35); }
      var src = ctx.createBufferSource(); src.buffer = buf;
      var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
      var g = ctx.createGain(); g.gain.value = 0.35 * (power || 1);
      src.connect(hp); hp.connect(g); g.connect(ctx.destination); src.start();
    } catch (e) {}
  };
})(window.CL);
