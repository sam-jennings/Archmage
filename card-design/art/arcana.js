// art/arcana.js
// Arcana — equation-driven port of the hand-painted relic style.
//
// Procedural SVG only (no bitmaps). The painted feel of art/assets/*.jpg is
// reproduced with four techniques:
//   1. Multi-pass bloom   — the luminous structure is drawn once into a <g>,
//                           then re-used twice underneath through Gaussian
//                           blur filters (wide halo + tight glow).
//   2. Particle dust      — seeded-RNG motes scattered along every major
//                           curve and across the background, like pigment.
//   3. Tapered ribbons    — filled paths whose width varies along their
//                           length; no uniform-width strokes on key shapes.
//   4. Organic wobble     — rings and lines carry low-amplitude sine
//                           harmonics so nothing reads as CAD-perfect.
//
// Each suit uses a FIXED seed, so every card of a suit renders identical
// grain (consistent print sheets). Tune global density with DUST below.
(function(){
  const AA = window.AA_ART = window.AA_ART || {};
  const uid = (window.ArchmageCards && window.ArchmageCards.uid) || (p => (p||'c')+Math.random().toString(36).slice(2,8));

  // Global particle-density multiplier (0.5 = sparser, 2 = denser).
  const DUST = 1;

  // ── Deterministic RNG (mulberry32) ──
  function rng(seed){
    let s = seed >>> 0;
    return function(){
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Rough gaussian in [-1,1]
  function gauss(rand){ return (rand() + rand() + rand()) / 1.5 - 1; }

  const N  = x => x.toFixed(1);
  const N2 = x => x.toFixed(2);

  // Weighted colour pick: list = [[colour, weight], ...]
  function pick(rand, list){
    let tot = 0; for (const it of list) tot += it[1];
    let v = rand() * tot;
    for (const it of list){ if ((v -= it[1]) <= 0) return it[0]; }
    return list[0][0];
  }

  // Tapered ribbon: filled path through pts, width w0 (start) -> w1 (end).
  function ribbon(pts, w0, w1){
    const n = pts.length; if (n < 2) return '';
    const L = [], R = [];
    for (let i = 0; i < n; i++){
      const t = i / (n - 1);
      const hw = (w0 + (w1 - w0) * t) / 2;
      const a = pts[Math.max(0, i-1)], b = pts[Math.min(n-1, i+1)];
      let dx = b[0]-a[0], dy = b[1]-a[1]; const m = Math.hypot(dx,dy) || 1; dx/=m; dy/=m;
      L.push([pts[i][0] - dy*hw, pts[i][1] + dx*hw]);
      R.push([pts[i][0] + dy*hw, pts[i][1] - dx*hw]);
    }
    let d = 'M' + N(L[0][0]) + ',' + N(L[0][1]);
    for (let i = 1; i < n; i++) d += 'L' + N(L[i][0]) + ',' + N(L[i][1]);
    for (let i = n-1; i >= 0; i--) d += 'L' + N(R[i][0]) + ',' + N(R[i][1]);
    return d + 'Z';
  }

  // Sample a parametric function f(t) -> [x,y] into n+1 points.
  function sample(f, n){
    const pts = []; for (let i = 0; i <= n; i++) pts.push(f(i/n)); return pts;
  }
  function polyPts(pts){ return pts.map(p => N(p[0]) + ',' + N(p[1])).join(' '); }

  // Spiral arc points around (ox,oy): radius rad0 -> rad1, angle a0 -> a0+sweep.
  function spiralPts(ox, oy, rad0, rad1, a0, sweep, n){
    const pts = [];
    for (let k = 0; k <= n; k++){
      const t = k/n, rad = rad0 + (rad1-rad0)*t, ang = a0 + sweep*t;
      pts.push([ox + Math.cos(ang)*rad, oy + Math.sin(ang)*rad]);
    }
    return pts;
  }

  // Hand-wobbled ring: r(th) = r0*(1 + a*sin(2th+p1) + a*0.6*sin(5th+p2))
  function wobbleRing(cx, cy, r0, amp, p1, p2, col, sw, op){
    let d = '';
    const n = 64;
    for (let i = 0; i <= n; i++){
      const th = i/n * Math.PI*2;
      const rr = r0 * (1 + amp*Math.sin(2*th + p1) + amp*0.6*Math.sin(5*th + p2));
      const x = cx + Math.cos(th)*rr, y = cy + Math.sin(th)*rr;
      d += (i ? 'L' : 'M') + N(x) + ',' + N(y);
    }
    return '<path d="' + d + 'Z" fill="none" stroke="' + col + '" stroke-width="' + N2(sw) + '" opacity="' + op + '"/>';
  }

  // Dotted ring via the dash trick: dot size = stroke width, spacing = gap.
  function dottedRing(cx, cy, rad, col, sw, gap, op, off){
    return '<circle cx="' + N(cx) + '" cy="' + N(cy) + '" r="' + N(rad) + '" fill="none"'
      + ' stroke="' + col + '" stroke-width="' + N2(sw) + '"'
      + ' stroke-dasharray="0.01 ' + N2(gap) + '" stroke-dashoffset="' + N2(off||0) + '"'
      + ' stroke-linecap="round" opacity="' + op + '"/>';
  }

  // Dotted open path (same trick on a polyline path).
  function dottedPath(pts, col, sw, gap, op){
    let d = '';
    for (let i = 0; i < pts.length; i++) d += (i ? 'L' : 'M') + N(pts[i][0]) + ',' + N(pts[i][1]);
    return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + N2(sw) + '"'
      + ' stroke-dasharray="0.01 ' + N2(gap) + '" stroke-linecap="round" opacity="' + op + '"/>';
  }

  // Four-point star sparkle (two crossed tapered diamonds).
  function sparkle(x, y, len, w, col, op, rot){
    const g1 = N(x) + ',' + N(y-len) + ' ' + N(x+w) + ',' + N(y) + ' ' + N(x) + ',' + N(y+len) + ' ' + N(x-w) + ',' + N(y);
    const l2 = len * 0.62;
    const g2 = N(x-l2) + ',' + N(y) + ' ' + N(x) + ',' + N(y+w) + ' ' + N(x+l2) + ',' + N(y) + ' ' + N(x) + ',' + N(y-w);
    return '<g transform="rotate(' + (rot||0) + ' ' + N(x) + ' ' + N(y) + ')">'
      + '<polygon points="' + g1 + '" fill="' + col + '" opacity="' + op + '"/>'
      + '<polygon points="' + g2 + '" fill="' + col + '" opacity="' + (op*0.85).toFixed(2) + '"/>'
      + '</g>';
  }

  // Glowing orb: stacked circles fake a radial gradient.
  function orb(x, y, R, e, hot){
    let s = '';
    s += '<circle cx="' + N(x) + '" cy="' + N(y) + '" r="' + N2(R*1.55) + '" fill="' + e.m + '" opacity=".20"/>';
    s += '<circle cx="' + N(x) + '" cy="' + N(y) + '" r="' + N2(R) + '" fill="' + e.dim + '" stroke="' + e.b + '" stroke-width="' + N2(R*0.22) + '" opacity=".95"/>';
    s += '<circle cx="' + N(x) + '" cy="' + N(y) + '" r="' + N2(R*0.58) + '" fill="' + e.b + '" opacity=".92"/>';
    if (hot) s += '<circle cx="' + N(x - R*0.25) + '" cy="' + N(y - R*0.25) + '" r="' + N2(R*0.26) + '" fill="' + hot + '" opacity=".75"/>';
    return s;
  }

  function mote(x, y, s, col, op){
    return '<circle cx="' + N(x) + '" cy="' + N(y) + '" r="' + N2(s) + '" fill="' + col + '" opacity="' + op.toFixed(2) + '"/>';
  }

  // Two-pass bloom: wide halo + tight glow under the crisp art.
  function bloom(gid, content, r, oWide, oTight){
    return '<defs>'
      + '<filter id="' + gid + '-b1" x="-90%" y="-90%" width="280%" height="280%"><feGaussianBlur stdDeviation="' + N2(r*0.085) + '"/></filter>'
      + '<filter id="' + gid + '-b2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="' + N2(r*0.022) + '"/></filter>'
      + '</defs>'
      + '<use href="#' + gid + '" filter="url(#' + gid + '-b1)" opacity="' + oWide + '"/>'
      + '<use href="#' + gid + '" filter="url(#' + gid + '-b2)" opacity="' + oTight + '"/>'
      + '<g id="' + gid + '">' + content + '</g>';
  }

  // Standard numeral medallion (matches the relic/emblem treatment).
  function medallion(cx, cy, artR, e, sc, hollow){
    const medR = artR * 0.285;
    let s = '';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + N(medR*1.22) + '" fill="' + (hollow ? e.bg1 : e.bg2) + '" fill-opacity=".985"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + N(medR*1.22) + '" fill="none" stroke="' + e.b + '" stroke-width="' + N2(1.15*sc) + '" opacity="' + (hollow ? '.58' : '.75') + '"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + N(medR*1.38) + '" fill="none" stroke="' + e.m + '" stroke-width="' + N2(0.7*sc) + '" opacity=".42"/>';
    return s;
  }

  // ════════════════════════════════════════════════════════════════════
  // RADIANCE — gilded cross-flare: engraved ray field, dotted filigree
  // rings, four grand cardinal rays with sparkle finials, vine curls.
  // ════════════════════════════════════════════════════════════════════
  function renderRadiance(elem, cx, cy, r, e, meta){
    const sc = (meta && meta.sc) || 1;
    const rand = rng(0xA11CE);
    const HOT = '#fff3c8';
    let bg = '', glow = '';

    // — background: engraved radial streak field —
    const streaks = Math.round(150 * DUST);
    for (let i = 0; i < streaks; i++){
      const a = rand() * Math.PI * 2;
      const r0 = r * (0.40 + rand() * 0.55);
      const r1 = Math.min(r * 1.52, r0 + r * (0.10 + rand() * 0.50));
      const col = rand() < 0.30 ? e.b : e.m;
      bg += '<line x1="' + N(cx + Math.cos(a)*r0) + '" y1="' + N(cy + Math.sin(a)*r0)
        + '" x2="' + N(cx + Math.cos(a)*r1) + '" y2="' + N(cy + Math.sin(a)*r1)
        + '" stroke="' + col + '" stroke-width="' + N2((0.28 + rand()*0.26)*sc) + '" opacity="' + (0.12 + rand()*0.28).toFixed(2) + '"/>';
    }
    // — gold dust —
    const motes = Math.round(95 * DUST);
    for (let i = 0; i < motes; i++){
      const a = rand() * Math.PI * 2;
      const rad = r * (0.25 + Math.pow(rand(), 0.7) * 1.28);
      const col = pick(rand, [[e.b, 6], [HOT, 1.5], [e.m, 2.5]]);
      bg += mote(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (0.28 + rand()*rand()*1.05)*sc, col, 0.18 + rand()*0.52);
    }
    // — dotted + wobbled filigree rings —
    bg += dottedRing(cx, cy, r*0.60, e.b, 1.1*sc, 5.0*sc, 0.55, 1.7);
    bg += dottedRing(cx, cy, r*0.78, e.b, 1.0*sc, 4.4*sc, 0.42, 0.6);
    bg += dottedRing(cx, cy, r*1.00, e.m, 0.95*sc, 4.8*sc, 0.38, 2.9);
    bg += dottedRing(cx, cy, r*1.22, e.m, 0.85*sc, 5.4*sc, 0.26, 1.2);
    bg += wobbleRing(cx, cy, r*0.52, 0.006, 0.7, 2.1, e.b, 0.5*sc, 0.34);
    bg += wobbleRing(cx, cy, r*0.70, 0.007, 1.9, 0.4, e.m, 0.55*sc, 0.40);
    bg += wobbleRing(cx, cy, r*0.92, 0.006, 4.0, 1.1, e.b, 0.55*sc, 0.34);
    bg += wobbleRing(cx, cy, r*1.10, 0.005, 2.6, 3.3, e.m, 0.55*sc, 0.28);
    bg += wobbleRing(cx, cy, r*1.135, 0.005, 0.2, 1.8, e.m, 0.45*sc, 0.20);

    // — gilded centre ring (the bright collar round the dark medallion) —
    glow += '<circle cx="' + cx + '" cy="' + cy + '" r="' + N(r*0.365) + '" fill="none" stroke="' + e.b + '" stroke-width="' + N2(1.7*sc) + '" opacity=".92"/>';
    glow += '<circle cx="' + cx + '" cy="' + cy + '" r="' + N(r*0.335) + '" fill="none" stroke="' + HOT + '" stroke-width="' + N2(0.6*sc) + '" opacity=".50"/>';
    glow += '<circle cx="' + cx + '" cy="' + cy + '" r="' + N(r*0.41) + '" fill="none" stroke="' + e.b + '" stroke-width="' + N2(0.5*sc) + '" opacity=".45"/>';

    // — vine filigree curls between the collar and first ring —
    for (let k = 0; k < 10; k++){
      const a0 = k * Math.PI*2/10 + 0.31;
      const dir = (k % 2 === 0) ? 1 : -1;
      const S = [cx + Math.cos(a0)*r*0.43, cy + Math.sin(a0)*r*0.43];
      const aC = a0 + dir*0.20, aE = a0 + dir*0.36;
      const C = [cx + Math.cos(aC)*r*0.52, cy + Math.sin(aC)*r*0.52];
      const E = [cx + Math.cos(aE)*r*0.555, cy + Math.sin(aE)*r*0.555];
      glow += '<path d="M' + N(S[0]) + ',' + N(S[1]) + ' Q' + N(C[0]) + ',' + N(C[1]) + ' ' + N(E[0]) + ',' + N(E[1])
        + '" fill="none" stroke="' + e.m + '" stroke-width="' + N2(0.65*sc) + '" opacity=".62"/>';
      // leaf finial
      const la = aE + dir*0.55;
      const tip = [E[0] + Math.cos(la)*r*0.052, E[1] + Math.sin(la)*r*0.052];
      glow += '<path d="' + ribbon([E, tip], r*0.026, 0.2) + '" fill="' + e.b + '" opacity=".55"/>';
      glow += mote(S[0], S[1], 0.8*sc, e.b, 0.6);
    }

    // — grand cardinal rays —
    const cards = [[0,-1],[1,0],[0,1],[-1,0]];
    cards.forEach(([ux, uy]) => {
      const px = -uy, py = ux;
      const P = t => [cx + ux*r*t, cy + uy*r*t];
      // tapered spine
      glow += '<path d="' + ribbon([P(0.40), P(0.85), P(1.42)], r*0.075, 0.25) + '" fill="' + e.b + '" opacity=".95"/>';
      // hot core line
      glow += '<line x1="' + N(P(0.42)[0]) + '" y1="' + N(P(0.42)[1]) + '" x2="' + N(P(1.30)[0]) + '" y2="' + N(P(1.30)[1])
        + '" stroke="' + HOT + '" stroke-width="' + N2(0.9*sc) + '" stroke-linecap="round" opacity=".85"/>';
      // converging flank strands
      [r*0.024, r*0.042].forEach((off, oi) => {
        [1, -1].forEach(s => {
          const A = [cx + ux*r*0.46 + px*off*s, cy + uy*r*0.46 + py*off*s];
          const B = [cx + ux*r*(1.04 - oi*0.10) + px*off*0.35*s, cy + uy*r*(1.04 - oi*0.10) + py*off*0.35*s];
          glow += '<line x1="' + N(A[0]) + '" y1="' + N(A[1]) + '" x2="' + N(B[0]) + '" y2="' + N(B[1])
            + '" stroke="' + e.b + '" stroke-width="' + N2(0.45*sc) + '" opacity=".40"/>';
        });
      });
      // finial sparkle at the tip
      const T = P(1.30);
      glow += sparkle(T[0], T[1], r*0.145, r*0.030, e.b, 0.95, ux === 0 ? 0 : 90);
      glow += mote(T[0], T[1], 1.3*sc, HOT, 0.9);
    });

    // — diagonal rays —
    for (let k = 0; k < 4; k++){
      const a = Math.PI/4 + k*Math.PI/2;
      const ux = Math.cos(a), uy = Math.sin(a);
      const P = t => [cx + ux*r*t, cy + uy*r*t];
      glow += '<path d="' + ribbon([P(0.40), P(0.75), P(1.08)], r*0.045, 0.2) + '" fill="' + e.b + '" opacity=".80"/>';
      glow += '<line x1="' + N(P(0.42)[0]) + '" y1="' + N(P(0.42)[1]) + '" x2="' + N(P(1.00)[0]) + '" y2="' + N(P(1.00)[1])
        + '" stroke="' + HOT + '" stroke-width="' + N2(0.55*sc) + '" stroke-linecap="round" opacity=".55"/>';
      const T = P(1.02);
      glow += sparkle(T[0], T[1], r*0.085, r*0.020, e.b, 0.72, 45);
    }

    // — minor rays (skip cardinal/diagonal slots) —
    for (let i = 0; i < 24; i++){
      if (i % 6 === 0 || i % 6 === 3) continue;
      const a = i * Math.PI*2/24;
      const ux = Math.cos(a), uy = Math.sin(a);
      const rOut = r * (0.78 + rand()*0.18);
      glow += '<path d="' + ribbon([[cx+ux*r*0.42, cy+uy*r*0.42], [cx+ux*rOut, cy+uy*rOut]], r*0.016, 0.15)
        + '" fill="' + e.b + '" opacity="' + (0.34 + rand()*0.22).toFixed(2) + '"/>';
    }
    // — hair rays between the minors —
    for (let i = 0; i < 48; i++){
      const a = i * Math.PI*2/48 + Math.PI/48;
      const ux = Math.cos(a), uy = Math.sin(a);
      const rOut = r * (0.62 + rand()*0.42);
      glow += '<line x1="' + N(cx+ux*r*0.42) + '" y1="' + N(cy+uy*r*0.42)
        + '" x2="' + N(cx+ux*rOut) + '" y2="' + N(cy+uy*rOut)
        + '" stroke="' + e.b + '" stroke-width="' + N2(0.32*sc) + '" opacity="' + (0.14 + rand()*0.18).toFixed(2) + '"/>';
    }

    // — orbit gems + stray sparkles —
    for (let k = 0; k < 8; k++){
      const a = Math.PI/8 + k*Math.PI/4;
      glow += mote(cx + Math.cos(a)*r*0.70, cy + Math.sin(a)*r*0.70, 1.1*sc, e.b, 0.72);
    }
    for (let k = 0; k < 6; k++){
      const a = rand()*Math.PI*2, rad = r*(0.55 + rand()*0.6);
      glow += sparkle(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (2.2 + rand()*2.6)*sc, (0.7 + rand()*0.5)*sc, HOT, 0.30 + rand()*0.30, rand()*90);
    }

    const gid = 'arc-rd-' + uid('g');
    return bg + bloom(gid, glow, r, 0.55, 0.75) + medallion(cx, cy, r, e, sc, false);
  }

  // ════════════════════════════════════════════════════════════════════
  // VOID — galaxy vortex: three dust-laden spiral arms winding 1¼ turns
  // into a dark hollow, over a star field and faint orbit rings.
  // ════════════════════════════════════════════════════════════════════
  function renderVoid(elem, cx, cy, r, e, meta){
    const sc = (meta && meta.sc) || 1;
    const rand = rng(0x501D);
    const HOT = '#e6d6ff';
    let bg = '', glow = '';

    // — faint orbit rings out to the card edge —
    bg += wobbleRing(cx, cy, r*0.72, 0.007, 0.8, 2.6, e.m, 0.55*sc, 0.22);
    bg += wobbleRing(cx, cy, r*0.95, 0.006, 2.2, 0.9, e.m, 0.55*sc, 0.18);
    bg += wobbleRing(cx, cy, r*1.20, 0.006, 4.1, 1.7, e.m, 0.55*sc, 0.14);
    bg += wobbleRing(cx, cy, r*1.48, 0.005, 1.3, 3.0, e.m, 0.5*sc, 0.10);
    bg += dottedRing(cx, cy, r*1.07, e.m, 0.85*sc, 4.6*sc, 0.20, 0.8);
    bg += dottedRing(cx, cy, r*1.34, e.m, 0.8*sc, 5.2*sc, 0.15, 2.2);

    // — star field —
    const stars = Math.round(95 * DUST);
    for (let i = 0; i < stars; i++){
      const a = rand() * Math.PI*2;
      const rad = r * (0.42 + Math.pow(rand(), 0.8) * 1.18);
      const col = pick(rand, [[e.b, 6], [HOT, 2.5], [e.m, 1.5]]);
      bg += mote(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (0.25 + rand()*rand()*1.15)*sc, col, 0.22 + rand()*0.55);
    }
    for (let i = 0; i < 7; i++){
      const a = rand()*Math.PI*2, rad = r*(0.6 + rand()*0.85);
      bg += sparkle(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (1.6 + rand()*1.8)*sc, (0.5 + rand()*0.4)*sc, HOT, 0.35 + rand()*0.30, rand()*90);
    }
    // — little moons riding the orbit rings —
    [[0.95, 0.6], [1.20, 2.5], [1.20, 4.4], [1.48, 1.4], [0.95, 3.6]].forEach(([rr, a]) => {
      const mx = cx + Math.cos(a)*r*rr, my = cy + Math.sin(a)*r*rr;
      const R = (1.5 + rand()*1.5)*sc;
      bg += '<circle cx="' + N(mx) + '" cy="' + N(my) + '" r="' + N2(R) + '" fill="' + e.m + '" opacity=".55"/>';
      bg += '<circle cx="' + N(mx + R*0.40) + '" cy="' + N(my - R*0.32) + '" r="' + N2(R*0.95) + '" fill="' + e.bg1 + '" opacity=".92"/>';
    });

    // — the vortex: three spiral arms, each winding 1¼ turns —
    const ARMS = 3, SW = Math.PI * 2.50;
    for (let arm = 0; arm < ARMS; arm++){
      const a0 = arm * Math.PI*2/ARMS + 0.45;
      const spine = t => {
        const ang = a0 + SW*t, rad = r * (1.06 - 0.695*t);
        return [cx + Math.cos(ang)*rad, cy + Math.sin(ang)*rad];
      };
      // soft body (kept slim so the windings stay readable)
      glow += '<path d="' + ribbon(sample(spine, 46), r*0.105, r*0.030) + '" fill="' + e.m + '" opacity=".26"/>';
      // dark core inside the arm (gives the painted depth)
      const dark = t => {
        const ang = a0 + SW*t - 0.04, rad = r * (1.05 - 0.695*t) - r*0.030*(1-t);
        return [cx + Math.cos(ang)*rad, cy + Math.sin(ang)*rad];
      };
      glow += '<path d="' + ribbon(sample(dark, 42), r*0.055, r*0.015) + '" fill="' + e.dim + '" opacity=".60"/>';
      // bright leading edge
      const edge = t => {
        const ang = a0 + SW*t + 0.04, rad = r * (1.06 - 0.695*t) + r*0.045*(1-t);
        return [cx + Math.cos(ang)*rad, cy + Math.sin(ang)*rad];
      };
      glow += '<path d="' + ribbon(sample(edge, 46), 2.3*sc, 0.5*sc) + '" fill="' + e.b + '" opacity=".88"/>';
      // fine filament riding just inside the bright edge
      const fil = t => {
        const ang = a0 + SW*t + 0.10, rad = r * (1.025 - 0.672*t) + r*0.022*(1-t);
        return [cx + Math.cos(ang)*rad, cy + Math.sin(ang)*rad];
      };
      glow += '<polyline points="' + polyPts(sample(fil, 42)) + '" fill="none" stroke="' + e.b + '" stroke-width="' + N2(0.7*sc) + '" opacity=".45"/>';
      // second filament drifting off the arm's outer flank
      const fil2 = t => {
        const ang = a0 + SW*t + 0.18, rad = r * (1.09 - 0.70*t);
        return [cx + Math.cos(ang)*rad, cy + Math.sin(ang)*rad];
      };
      glow += '<polyline points="' + polyPts(sample(fil2, 42)) + '" fill="none" stroke="' + e.m + '" stroke-width="' + N2(0.55*sc) + '" opacity=".38"/>';
      // ghost trail
      const trail = t => {
        const ang = a0 + SW*t - 0.13, rad = r * (1.02 - 0.66*t);
        return [cx + Math.cos(ang)*rad, cy + Math.sin(ang)*rad];
      };
      glow += '<polyline points="' + polyPts(sample(trail, 42)) + '" fill="none" stroke="' + e.m + '" stroke-width="' + N2(0.6*sc) + '" opacity=".35"/>';
      // star dust inside the arm
      const armDust = Math.round(56 * DUST);
      for (let i = 0; i < armDust; i++){
        const t = Math.pow(rand(), 0.85);
        const ang = a0 + SW*t + gauss(rand)*0.04;
        const rad = r * (1.06 - 0.695*t) + gauss(rand)*r*0.048*(1 - 0.4*t);
        const col = pick(rand, [[e.b, 5.5], [HOT, 2], [e.m, 2.5]]);
        glow += mote(cx + Math.cos(ang)*rad, cy + Math.sin(ang)*rad, (0.25 + rand()*1.0)*sc, col, 0.22 + rand()*0.55);
      }
    }

    // — convergence rim round the hollow —
    glow += '<circle cx="' + cx + '" cy="' + cy + '" r="' + N(r*0.375) + '" fill="none" stroke="' + e.b + '" stroke-width="' + N2(1.3*sc) + '" opacity=".75"/>';
    glow += '<circle cx="' + cx + '" cy="' + cy + '" r="' + N(r*0.42) + '" fill="none" stroke="' + e.m + '" stroke-width="' + N2(0.5*sc) + '" opacity=".40"/>';

    const gid = 'arc-vd-' + uid('g');
    return bg + bloom(gid, glow, r, 0.55, 0.75) + medallion(cx, cy, r, e, sc, true);
  }

  // ════════════════════════════════════════════════════════════════════
  // FLUX — living current: nested wave-wings sweep out from the centre in
  // four mirrored tiers (after the painterly flux symbol) while sine
  // wave-rings lap the numeral. Every mark is a wave, ring or mote.
  // ════════════════════════════════════════════════════════════════════
  function renderFlux(elem, cx, cy, r, e, meta){
    const sc = (meta && meta.sc) || 1;
    const rand = rng(0xF1AB);
    const HOT = '#d6fff6';
    let bg = '', glow = '';

    // — background: engraved dotted orbit rings + star glints, with two slow
    // dotted swells top and bottom (kept clear of the beacon strips) —
    bg += dottedRing(cx, cy, r*0.80, e.m, 0.85*sc, 4.2*sc, 0.20, 0.9);
    bg += dottedRing(cx, cy, r*1.02, e.m, 0.85*sc, 4.6*sc, 0.17, 2.1);
    bg += dottedRing(cx, cy, r*1.26, e.m, 0.8*sc, 5.0*sc, 0.13, 0.4);
    bg += wobbleRing(cx, cy, r*0.92, 0.006, 1.2, 2.9, e.m, 0.5*sc, 0.14);
    bg += wobbleRing(cx, cy, r*1.14, 0.005, 3.4, 0.8, e.m, 0.5*sc, 0.11);
    [-1, 1].forEach(sgn => {
      const row = t => {
        const x = (t*2 - 1) * r * 1.18;
        return [cx + x, cy + sgn*r*(1.20 + 0.06*Math.sin(2.2*x/r + sgn*0.8))];
      };
      bg += dottedPath(sample(row, 30), e.m, 0.85*sc, 3.4*sc, 0.18);
    });
    for (let i = 0; i < 10; i++){
      const a = rand()*Math.PI*2, rad = r*(0.55 + rand()*0.85);
      bg += sparkle(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (1.3 + rand()*1.7)*sc, (0.4 + rand()*0.35)*sc, rand() < 0.5 ? HOT : e.b, 0.22 + rand()*0.25, rand()*90);
    }
    const fieldDust = Math.round(70 * DUST);
    for (let i = 0; i < fieldDust; i++){
      const a = rand()*Math.PI*2;
      const rad = r * (0.45 + Math.pow(rand(), 0.8)*1.0);
      bg += mote(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (0.25 + rand()*0.8)*sc, rand() < 0.6 ? e.b : e.m, 0.12 + rand()*0.32);
    }

    // — wave spans: three nested waves above and three below, each ONE
    // continuous current from left tip to right tip. A gaussian centre
    // lift carries the wave smoothly over/under the numeral circle:
    //   y(u) = yb + 0.05|u| + A·sin(2πf|u| + π/2) + lift·e^-(u/0.30)²
    const tiers = [
      // [x1,  yBase, A,     f,    lift, bodyW, edgeOp]
      [1.30, 0.15, 0.070, 0.85, 0.25, 0.050, 0.82],
      [1.24, 0.34, 0.090, 0.90, 0.19, 0.062, 0.90],
      [1.10, 0.54, 0.110, 0.80, 0.16, 0.072, 0.95]
    ];
    [-1, 1].forEach(sy => {
      tiers.forEach(([x1, yb, A, f, lift, bw, eop]) => {
        const span = u => [
          cx + u*r*x1,
          cy + sy*r*(yb + 0.05*Math.abs(u) + A*Math.sin(Math.PI*2*f*Math.abs(u) + Math.PI/2) + lift*Math.exp(-Math.pow(u/0.30, 2)))
        ];
        // two half-ribbons sharing the centre, so both tips taper to points
        [-1, 1].forEach(dir => {
          const pts = sample(t => span(dir*t), 30);
          glow += '<path d="' + ribbon(pts, r*bw, 0) + '" fill="' + e.m + '" opacity=".30"/>';
          glow += '<path d="' + ribbon(pts, 2.0*sc, 0) + '" fill="' + e.b + '" opacity="' + eop + '"/>';
        });
        // inner echo line following the whole span
        const echoW = u => { const p = span(u); return [p[0], p[1] + sy*r*0.030]; };
        glow += '<polyline points="' + polyPts(sample(t => echoW(t*2 - 1), 48)) + '" fill="none" stroke="' + e.m + '" stroke-width="' + N2(0.6*sc) + '" stroke-linecap="round" opacity=".38"/>';
        // spray along the span
        const wingDust = Math.round(20 * DUST);
        for (let i = 0; i < wingDust; i++){
          const p = span(rand()*2 - 1);
          const col = pick(rand, [[e.b, 6], [HOT, 2], [e.m, 2]]);
          glow += mote(p[0] + gauss(rand)*r*0.022, p[1] + gauss(rand)*r*0.028, (0.25 + rand()*0.8)*sc, col, 0.22 + rand()*0.5);
        }
      });
    });

    // — slim layered leaf at each side's midline, pointed both ends —
    [1, -1].forEach(sx => {
      [[0.92, 1.34, 0.040, 1.4, '.72'], [0.98, 1.28, 0.022, 0.8, '.50']].forEach(([xa, xb, hh, swp, op], li) => {
        [-1, 1].forEach(vy => {
          const pts = sample(t => [cx + sx*r*(xa + (xb - xa)*t), cy + vy*r*hh*Math.sin(Math.PI*t)], 18);
          glow += '<path d="' + ribbon(pts, swp*sc, 0) + '" fill="' + (li ? e.m : e.b) + '" opacity="' + op + '"/>';
        });
      });
      // midrib instead of a pupil-like mote
      const rib = sample(t => [cx + sx*r*(0.96 + 0.34*t), cy], 8);
      glow += '<path d="' + ribbon(rib, 0.9*sc, 0) + '" fill="' + e.m + '" opacity=".45"/>';
    });

    // — faint wave-halo and dust round the numeral (kept light so the left
    // and right wings read as one connected current) —
    const wavyRing = (R0, A, m, ph, col, sw, op) => {
      let d = '';
      const n = 96;
      for (let i = 0; i <= n; i++){
        const th = i/n * Math.PI*2;
        const rr = R0 + A * Math.sin(m*th + ph);
        d += (i ? 'L' : 'M') + N(cx + Math.cos(th)*rr) + ',' + N(cy + Math.sin(th)*rr);
      }
      return '<path d="' + d + 'Z" fill="none" stroke="' + col + '" stroke-width="' + N2(sw) + '" stroke-linejoin="round" opacity="' + op + '"/>';
    };
    glow += wavyRing(r*0.66,  r*0.020, 5,  2.6, e.m, 0.6*sc, 0.34);
    const ringDust = Math.round(70 * DUST);
    for (let i = 0; i < ringDust; i++){
      const a = rand() * Math.PI*2;
      const rad = r*0.55 + gauss(rand) * r * 0.035;
      const col = pick(rand, [[e.b, 6], [HOT, 2], [e.m, 2]]);
      glow += mote(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (0.25 + rand()*0.95)*sc, col, 0.25 + rand()*0.55);
    }

    const gid = 'arc-fx-' + uid('g');
    return bg + bloom(gid, glow, r, 0.55, 0.75) + medallion(cx, cy, r, e, sc, false);
  }

  // ════════════════════════════════════════════════════════════════════
  // AETHER — bound geometry: engraved dotted orbit field, double hexagon
  // lattice with hexagram diagonals, blade finials, glowing node orbs.
  // ════════════════════════════════════════════════════════════════════
  function renderAether(elem, cx, cy, r, e, meta){
    const sc = (meta && meta.sc) || 1;
    const rand = rng(0xAE7E);
    const HOT = '#ffd8c8';
    let bg = '', glow = '';

    // — engraved dotted orbit field —
    for (let i = 0; i < 9; i++){
      const rad = r * (0.48 + i * 0.135);
      bg += dottedRing(cx, cy, rad, e.m, 1.0*sc, (3.0 + (i%3)*0.7)*sc, 0.20 + 0.10*((i+1)%3)/2, i*1.3);
    }
    bg += wobbleRing(cx, cy, r*0.70, 0.006, 1.1, 2.8, e.m, 0.5*sc, 0.20);
    bg += wobbleRing(cx, cy, r*1.05, 0.005, 3.2, 0.5, e.m, 0.5*sc, 0.20);
    bg += wobbleRing(cx, cy, r*1.38, 0.005, 0.9, 4.1, e.m, 0.5*sc, 0.16);
    const grains = Math.round(85 * DUST);
    for (let i = 0; i < grains; i++){
      const a = rand() * Math.PI*2;
      const rad = r * (0.30 + Math.pow(rand(), 0.75) * 1.25);
      bg += mote(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (0.25 + rand()*0.65)*sc, rand() < 0.35 ? e.b : e.m, 0.10 + rand()*0.22);
    }
    for (let i = 0; i < 6; i++){
      const a = rand()*Math.PI*2, rad = r*(0.65 + rand()*0.8);
      bg += sparkle(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (1.4 + rand()*1.6)*sc, (0.45 + rand()*0.35)*sc, HOT, 0.30 + rand()*0.25, rand()*90);
    }

    // — outer hexagon (pointy-top) with engraved under-stroke —
    const hexR = r * 0.92;
    const verts = [];
    for (let i = 0; i < 6; i++){
      const a = -Math.PI/2 + i*Math.PI/3;
      // tiny per-vertex wobble so the frame feels drawn
      const wob = 1 + (rand() - 0.5) * 0.012;
      verts.push([cx + Math.cos(a)*hexR*wob, cy + Math.sin(a)*hexR*wob]);
    }
    const hexPts = polyPts(verts);
    glow += '<polygon points="' + hexPts + '" fill="none" stroke="' + e.dim + '" stroke-width="' + N2(3.2*sc) + '" opacity=".80"/>';
    glow += '<polygon points="' + hexPts + '" fill="none" stroke="' + e.b + '" stroke-width="' + N2(1.5*sc) + '" opacity=".92"/>';
    const inset = verts.map(p => [cx + (p[0]-cx)*0.955, cy + (p[1]-cy)*0.955]);
    glow += '<polygon points="' + polyPts(inset) + '" fill="none" stroke="' + e.b + '" stroke-width="' + N2(0.5*sc) + '" opacity=".45"/>';

    // — hexagram diagonals —
    for (let i = 0; i < 6; i++){
      for (let j = i+2; j < 6 && (j-i) < 5; j++){
        const isDiam = (j - i) === 3;
        glow += '<line x1="' + N(verts[i][0]) + '" y1="' + N(verts[i][1]) + '" x2="' + N(verts[j][0]) + '" y2="' + N(verts[j][1])
          + '" stroke="' + e.m + '" stroke-width="' + N2((isDiam ? 1.1 : 0.8)*sc) + '" opacity="' + (isDiam ? '.68' : '.48') + '"/>';
      }
    }

    // — inner hexagon, rotated 30° (flat-top), with its own hexagram —
    const inR = r * 0.55;
    const inV = [];
    for (let i = 0; i < 6; i++){
      const a = -Math.PI/2 + Math.PI/6 + i*Math.PI/3;
      inV.push([cx + Math.cos(a)*inR, cy + Math.sin(a)*inR]);
    }
    glow += '<polygon points="' + polyPts(inV) + '" fill="none" stroke="' + e.dim + '" stroke-width="' + N2(2.2*sc) + '" opacity=".70"/>';
    glow += '<polygon points="' + polyPts(inV) + '" fill="none" stroke="' + e.b + '" stroke-width="' + N2(1.05*sc) + '" opacity=".80"/>';
    [[0,2,4],[1,3,5]].forEach(tri => {
      glow += '<polygon points="' + polyPts(tri.map(i => inV[i])) + '" fill="none" stroke="' + e.m + '" stroke-width="' + N2(0.6*sc) + '" opacity=".42"/>';
    });
    // struts inner -> outer
    for (let i = 0; i < 6; i++){
      let best = 0, bd = 1e9;
      verts.forEach((v, vi) => {
        const d = Math.hypot(v[0]-inV[i][0], v[1]-inV[i][1]);
        if (d < bd){ bd = d; best = vi; }
      });
      glow += '<line x1="' + N(inV[i][0]) + '" y1="' + N(inV[i][1]) + '" x2="' + N(verts[best][0]) + '" y2="' + N(verts[best][1])
        + '" stroke="' + e.m + '" stroke-width="' + N2(0.55*sc) + '" opacity=".38"/>';
    }

    // — blade finials at each outer vertex —
    verts.forEach((V, i) => {
      const a = -Math.PI/2 + i*Math.PI/3;
      const ux = Math.cos(a), uy = Math.sin(a);
      const px = -uy, py = ux;
      const at = t => [V[0] + ux*r*t, V[1] + uy*r*t];
      glow += '<path d="' + ribbon([at(-0.02), at(0.20)], r*0.048, 0.2) + '" fill="' + e.b + '" opacity=".85"/>';
      [1, -1].forEach(s => {
        const barb = [
          [V[0] + ux*r*0.030 + px*r*0.024*s, V[1] + uy*r*0.030 + py*r*0.024*s],
          [V[0] + ux*r*0.100 + px*r*0.085*s, V[1] + uy*r*0.100 + py*r*0.085*s],
          [V[0] + ux*r*0.170 + px*r*0.052*s, V[1] + uy*r*0.170 + py*r*0.052*s]
        ];
        glow += '<path d="' + ribbon(barb, r*0.022, 0.2) + '" fill="' + e.b + '" opacity=".70"/>';
      });
    });

    // — node orbs —
    verts.forEach(V => { glow += orb(V[0], V[1], 4.0*sc, e, HOT); });
    for (let i = 0; i < 6; i++){
      const mx = (verts[i][0] + verts[(i+1)%6][0]) / 2;
      const my = (verts[i][1] + verts[(i+1)%6][1]) / 2;
      glow += orb(mx, my, 2.0*sc, e, null);
    }
    inV.forEach(V => { glow += orb(V[0], V[1], 2.6*sc, e, HOT); });
    for (let i = 0; i < 6; i++){
      const a = -Math.PI/2 + i*Math.PI/3;
      glow += orb(cx + Math.cos(a)*r*0.43, cy + Math.sin(a)*r*0.43, 1.5*sc, e, null);
    }
    // intersection sparks
    for (let i = 0; i < 6; i++){
      const a = -Math.PI/2 + Math.PI/6 + i*Math.PI/3;
      glow += mote(cx + Math.cos(a)*r*0.76, cy + Math.sin(a)*r*0.76, 0.9*sc, e.b, 0.70);
    }

    const gid = 'arc-ae-' + uid('g');
    return bg + bloom(gid, glow, r, 0.50, 0.72) + medallion(cx, cy, r, e, sc, false);
  }

  // ════════════════════════════════════════════════════════════════════
  // ECHO — the reverberant current: one strike at the centre (a star
  // flare behind the numeral) whose ring repeats up and down a beaded
  // vertical axis, each copy smaller, fainter and trailed by its own
  // ghost duplicate. The only vertical-stack composition in the deck —
  // bone-grey and deliberately quiet against the four saturated currents.
  // ════════════════════════════════════════════════════════════════════
  const ECHO = {
    b: '#d7d4c8', m: '#888a84', dim: '#242724',
    bg1: '#050605', bg2: '#090a09', border: '#686b65', name: 'ECHO'
  };

  // Open arc sampled as a path (so it can wobble-free curve any span).
  function arcPath(ox, oy, rad, a0, a1, n){
    let d = '';
    for (let i = 0; i <= n; i++){
      const a = a0 + (a1 - a0) * i/n;
      d += (i ? 'L' : 'M') + N(ox + Math.cos(a)*rad) + ',' + N(oy + Math.sin(a)*rad);
    }
    return d;
  }

  function renderEcho(elem, cx, cy, r, eIgnored, meta){
    const sc = (meta && meta.sc) || 1;
    const rand = rng(0xEC40);
    const p = ECHO;
    const HOT = '#f2efe2';
    let bg = '', glow = '';

    // — background: quiet engraved field —
    bg += wobbleRing(cx, cy, r*0.95, 0.005, 0.8, 2.2, p.m, 0.5*sc, 0.10);
    bg += wobbleRing(cx, cy, r*1.25, 0.004, 2.6, 1.0, p.m, 0.45*sc, 0.08);
    bg += dottedRing(cx, cy, r*1.05, p.m, 0.8*sc, 4.6*sc, 0.14, 1.1);
    const dustN = Math.round(45 * DUST);
    for (let i = 0; i < dustN; i++){
      const a = rand()*Math.PI*2;
      const rad = r * (0.35 + Math.pow(rand(), 0.8)*1.12);
      bg += mote(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (0.25 + rand()*0.8)*sc, rand() < 0.65 ? p.b : p.m, 0.10 + rand()*0.30);
    }
    for (let i = 0; i < 4; i++){
      const a = rand()*Math.PI*2, rad = r*(0.7 + rand()*0.7);
      bg += sparkle(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (1.4 + rand()*1.4)*sc, (0.4 + rand()*0.3)*sc, HOT, 0.22 + rand()*0.20, rand()*90);
    }

    // — vertical axis: the line the reverberation travels, with its ghost —
    glow += '<line x1="' + cx + '" y1="' + N(cy - r*1.26) + '" x2="' + cx + '" y2="' + N(cy + r*1.26) + '" stroke="' + p.m + '" stroke-width="' + N2(0.55*sc) + '" opacity=".30"/>';
    glow += '<line x1="' + N(cx + r*0.015) + '" y1="' + N(cy - r*1.22) + '" x2="' + N(cx + r*0.015) + '" y2="' + N(cy + r*1.22) + '" stroke="' + p.m + '" stroke-width="' + N2(0.4*sc) + '" opacity=".14"/>';
    [-1, 1].forEach(sgn => { glow += sparkle(cx, cy + sgn*r*1.26, 3.2*sc, 0.9*sc, p.b, 0.55, 0); });

    // — the source ring (around the numeral) —
    glow += wobbleRing(cx, cy, r*0.52, 0.004, 0.3, 1.7, p.b, 1.5*sc, 0.85);
    glow += wobbleRing(cx, cy, r*0.58, 0.004, 1.4, 0.6, p.m, 0.8*sc, 0.50);
    glow += wobbleRing(cx, cy, r*0.46, 0.005, 2.2, 1.1, p.m, 0.6*sc, 0.35);

    // — echo copies stacked up and down the axis, decaying as they travel —
    const stack = [
      // [offset, radius, opacity]
      [0.46, 0.48, 0.60],
      [0.82, 0.40, 0.38],
      [1.08, 0.30, 0.20]
    ];
    [-1, 1].forEach(sgn => {
      stack.forEach(([off, rr, op], k) => {
        const oy = cy + sgn*r*off;
        // the repeated ring
        glow += wobbleRing(cx, oy, r*rr, 0.005, k*1.2 + sgn, k*0.8, p.b, (1.2 - k*0.25)*sc, op);
        // its ghost duplicate, trailing further along the travel direction
        glow += wobbleRing(cx, oy + sgn*r*0.045, r*rr*1.02, 0.005, k*0.9, k*1.5 + sgn, p.m, 0.6*sc, (op*0.45).toFixed(2));
        // bright emphasis arc on the leading edge, with terminal beads
        const aMid = sgn < 0 ? -Math.PI/2 : Math.PI/2;
        const span = 1.0 - k*0.18;
        const a0 = aMid - span, a1 = aMid + span;
        glow += '<path d="' + arcPath(cx, oy, r*rr, a0, a1, 26) + '" fill="none" stroke="' + p.b + '" stroke-width="' + N2((1.6 - k*0.3)*sc) + '" stroke-linecap="round" opacity="' + Math.min(0.9, op + 0.22).toFixed(2) + '"/>';
        [a0, a1].forEach(a => { glow += mote(cx + Math.cos(a)*r*rr, oy + Math.sin(a)*r*rr, (1.4 - k*0.25)*sc, p.b, op + 0.15); });
        // strike-point bead at the copy's centre, threaded on the axis
        glow += orb(cx, oy, (2.4 - k*0.5)*sc, p, k === 0 ? HOT : null);
      });
    });

    // — the original strike: star flare peeking from behind the numeral —
    glow += sparkle(cx, cy, r*0.62, r*0.045, p.b, 0.85, 0);
    glow += sparkle(cx, cy, r*0.40, r*0.030, HOT, 0.55, 45);

    // — short horizontal counter-axis with orbs (the answering direction) —
    [-1, 1].forEach(sgn => {
      glow += '<line x1="' + N(cx + sgn*r*0.45) + '" y1="' + cy + '" x2="' + N(cx + sgn*r*0.95) + '" y2="' + cy + '" stroke="' + p.m + '" stroke-width="' + N2(0.5*sc) + '" opacity=".25"/>';
      glow += orb(cx + sgn*r*0.72, cy, 2.2*sc, p, null);
      glow += sparkle(cx + sgn*r*0.97, cy, 2.6*sc, 0.8*sc, p.b, 0.45, 0);
    });

    const gid = 'arc-ec-' + uid('g');
    return bg + bloom(gid, glow, r, 0.45, 0.65) + medallion(cx, cy, r, p, sc, true);
  }

  // ════════════════════════════════════════════════════════════════════
  // WILD — magic itself, above the currents: a prismatic corona. One
  // motif, not a collage — harmonic energy strands haloing the numeral
  // while their colour cycles continuously through every current's hue,
  // an all-round shimmer of fine rays, and prismatic dust. The spectrum
  // says "stands in for any current"; the bloom/wobble/dust grammar
  // keeps it inside the Arcana family.
  // ════════════════════════════════════════════════════════════════════
  const WILD = {
    b: '#dde6f5', m: '#8b9ab8', dim: '#161e2e',
    bg1: '#070a12', bg2: '#0a0e16', border: '#5a6880', name: 'CONVERGENCE'
  };
  // Continuous colour wheel through the four current hues, bridged by silver.
  const WHEEL = ['#f5c518', '#e8304a', '#c060f0', '#00c8b4', '#dde6f5'];
  function hexRgb(h){ return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]; }
  function lerpHex(h1, h2, t){
    const a = hexRgb(h1), b = hexRgb(h2);
    return 'rgb(' + a.map((v, i) => Math.round(v + (b[i]-v)*t)).join(',') + ')';
  }
  function hueAt(a){
    let t = ((a + Math.PI/2) / (Math.PI*2)) % 1; if (t < 0) t += 1;
    const seg = t*5, i = Math.floor(seg) % 5;
    return lerpHex(WHEEL[i], WHEEL[(i+1)%5], seg - i);
  }

  function renderWild(cx, cy, r, sc){
    sc = sc || 1;
    const rand = rng(0x117D);
    const p = WILD;
    const HOT = '#f4f7ff';
    let bg = '', glow = '';

    // — background: silver field seeded with prismatic dust —
    bg += wobbleRing(cx, cy, r*0.98, 0.005, 0.6, 2.4, p.m, 0.5*sc, 0.12);
    bg += wobbleRing(cx, cy, r*1.24, 0.004, 2.9, 1.2, p.m, 0.45*sc, 0.09);
    bg += dottedRing(cx, cy, r*1.10, p.m, 0.8*sc, 4.6*sc, 0.13, 0.7);
    const dustN = Math.round(65 * DUST);
    for (let i = 0; i < dustN; i++){
      const a = rand()*Math.PI*2;
      const rad = r * (0.35 + Math.pow(rand(), 0.8)*1.12);
      const col = rand() < 0.55 ? hueAt(a) : (rand() < 0.5 ? p.b : p.m);
      bg += mote(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (0.25 + rand()*0.85)*sc, col, 0.10 + rand()*0.32);
    }
    for (let i = 0; i < 5; i++){
      const a = rand()*Math.PI*2, rad = r*(0.65 + rand()*0.75);
      bg += sparkle(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (1.4 + rand()*1.5)*sc, (0.4 + rand()*0.3)*sc, HOT, 0.22 + rand()*0.22, rand()*90);
    }

    // — the corona: harmonic strands whose colour cycles round the wheel —
    const strands = [
      // [R0,   A,     k, phase, sw,  op]
      [0.56, 0.045, 5, 0.0, 1.9, 0.90],
      [0.61, 0.030, 7, 1.2, 1.1, 0.62],
      [0.51, 0.022, 3, 2.5, 0.8, 0.45]
    ];
    strands.forEach(([R0, A, k2, ph, sw, op]) => {
      const n = 72;
      let prev = null, thPrev = 0;
      for (let i = 0; i <= n; i++){
        const th = i/n * Math.PI*2;
        const rr = r * (R0 + A * Math.sin(k2*th + ph));
        const pt = [cx + Math.cos(th)*rr, cy + Math.sin(th)*rr];
        if (prev){
          glow += '<line x1="' + N(prev[0]) + '" y1="' + N(prev[1]) + '" x2="' + N(pt[0]) + '" y2="' + N(pt[1])
            + '" stroke="' + hueAt((thPrev + th)/2) + '" stroke-width="' + N2(sw*sc) + '" stroke-linecap="round" opacity="' + op + '"/>';
        }
        prev = pt; thPrev = th;
      }
    });
    // grain riding the corona band
    const bandDust = Math.round(85 * DUST);
    for (let i = 0; i < bandDust; i++){
      const a = rand() * Math.PI*2;
      const rad = r*0.565 + gauss(rand) * r * 0.045;
      const col = rand() < 0.6 ? hueAt(a) : (rand() < 0.55 ? HOT : p.b);
      glow += mote(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (0.25 + rand()*0.9)*sc, col, 0.25 + rand()*0.5);
    }

    // — all-round shimmer: fine prismatic rays breathing off the corona —
    for (let i = 0; i < 36; i++){
      const a = i/36 * Math.PI*2 + 0.05*Math.sin(i*2.3);
      const ux = Math.cos(a), uy = Math.sin(a);
      const long = i % 9 === 0;
      const r1 = 0.84 + rand()*0.26 + (long ? 0.14 : 0);
      glow += '<path d="' + ribbon([[cx+ux*r*0.70, cy+uy*r*0.70], [cx+ux*r*r1, cy+uy*r*r1]], r*0.014, 0.2)
        + '" fill="' + hueAt(a) + '" opacity="' + (0.30 + rand()*0.30).toFixed(2) + '"/>';
      if (long) glow += mote(cx+ux*r*(r1+0.03), cy+uy*r*(r1+0.03), 1.0*sc, HOT, 0.65);
    }

    // — quiet silver seat: ghosted orbit + measured beads (family grammar) —
    glow += wobbleRing(cx, cy, r*1.04, 0.004, 1.0, 2.0, p.m, 0.6*sc, 0.22);
    glow += wobbleRing(cx + r*0.014, cy + r*0.014, r*1.052, 0.004, 2.1, 0.8, p.m, 0.45*sc, 0.10);
    for (let i = 0; i < 8; i++){
      const a = Math.PI/8 + i*Math.PI/4;
      glow += mote(cx + Math.cos(a)*r*1.04, cy + Math.sin(a)*r*1.04, 0.85*sc, p.b, 0.38);
    }

    // — iridescent fine ring hugging the medallion —
    {
      const n = 48, rr = r*0.445;
      let prev = null, thPrev = 0;
      for (let i = 0; i <= n; i++){
        const th = i/n * Math.PI*2;
        const pt = [cx + Math.cos(th)*rr, cy + Math.sin(th)*rr];
        if (prev){
          glow += '<line x1="' + N(prev[0]) + '" y1="' + N(prev[1]) + '" x2="' + N(pt[0]) + '" y2="' + N(pt[1])
            + '" stroke="' + hueAt((thPrev + th)/2) + '" stroke-width="' + N2(0.9*sc) + '" stroke-linecap="round" opacity=".55"/>';
        }
        prev = pt; thPrev = th;
      }
    }

    // — centre: dark medallion, the source star in pure white-silver —
    const medR = r * 0.285;
    let centre = '';
    centre += '<circle cx="' + cx + '" cy="' + cy + '" r="' + N(medR*1.22) + '" fill="' + p.bg2 + '" fill-opacity=".985"/>';
    centre += '<circle cx="' + cx + '" cy="' + cy + '" r="' + N(medR*1.22) + '" fill="none" stroke="' + p.b + '" stroke-width="' + N2(1.15*sc) + '" opacity=".75"/>';
    centre += '<circle cx="' + cx + '" cy="' + cy + '" r="' + N(medR*1.38) + '" fill="none" stroke="' + p.m + '" stroke-width="' + N2(0.7*sc) + '" opacity=".42"/>';
    centre += sparkle(cx, cy, r*0.30, r*0.045, p.b, 0.95, 0);
    centre += sparkle(cx, cy, r*0.17, r*0.030, HOT, 0.70, 45);
    centre += mote(cx, cy, 1.5*sc, HOT, 0.95);

    const gid = 'arc-wd-' + uid('g');
    return bg + bloom(gid, glow, r, 0.50, 0.70) + centre;
  }

  // ── Registration ──
  AA['arcana'] = {
    name: 'Arcana',
    notes: 'Equation-driven relic style: seeded grain, bloom, dust, wobble. Procedural port of the relic JPEG compositions.',
    render: function(elem, cx, cy, artR, e, meta){
      if (elem === 'radiance') return renderRadiance(elem, cx, cy, artR, e, meta);
      if (elem === 'void')     return renderVoid(elem, cx, cy, artR, e, meta);
      if (elem === 'flux')     return renderFlux(elem, cx, cy, artR, e, meta);
      if (elem === 'aether')   return renderAether(elem, cx, cy, artR, e, meta);
      if (elem === 'echo')     return renderEcho(elem, cx, cy, artR, e, meta);
      return renderVoid(elem, cx, cy, artR, e, meta);
    },
    // Convergence art for the wild card (picked up by makeWildCard).
    renderWild: renderWild
  };
})();
