// ════════════════════════════════════════════════════════════════════
// Archmage Ascension — shared card renderer (lib/cards.js)
//
// Loads palette, helpers, makeCard dispatcher, and the public API. Does NOT
// contain the individual connector or art variants — those are separate
// modules in connectors/*.js and art/*.js that self-register into the
// global registries window.AA_CONNECTORS and window.AA_ART.
//
// Include order in playtable.html: this file first, then every variant.
// ════════════════════════════════════════════════════════════════════

(function(){

  // ── Palette ─────────────────────────────────────────────────────────
  const EL = {
  radiance:{ b:'#f5c518', m:'#c8961a', dim:'#3a2800', bg1:'#100e04', bg2:'#0c0900', border:'#9a7010', name:'RADIANCE' },
  void:    { b:'#c060f0', m:'#6a0dad', dim:'#200840', bg1:'#09060f', bg2:'#06040e', border:'#5a10a0', name:'VOID' },
  flux:    { b:'#00c8b4', m:'#008878', dim:'#002820', bg1:'#04100d', bg2:'#02100d', border:'#009080', name:'FLUX' },
  aether:  { b:'#e8304a', m:'#c8203a', dim:'#400010', bg1:'#0d0205', bg2:'#0a0102', border:'#a81828', name:'AETHER' },
  echo:    { b:'#c8d4e8', m:'#7a8aaa', dim:'#181e2c', bg1:'#070810', bg2:'#080910', border:'#3a4460', name:'ECHO' }
};
const EORD = ['radiance','void','flux','aether','echo'];
const WILD = { b:'#c8d8f8', m:'#7080b8', dim:'#101828' };

  // ── Registries populated by connectors/*.js and art/*.js ──────────
  window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  window.AA_ART        = window.AA_ART        || {};

  // ── Unique-id helper (shared with variant modules via ArchmageCards.uid) ──
  let _id = 0;
  const uid = (p) => (p||'c') + (++_id).toString(36);

  function polar(cx, cy, r, a){
    return [cx + Math.cos(a)*r, cy + Math.sin(a)*r];
  }

  // ── Shared helpers ──────────────────────────────────────────────────

  function makeTicks(p, OL, TM, ST, W, sc){
  let t = '';
  for (let i=0; i<=20; i++){
    const ty = TM + i*ST;
    const tw = i%5===0 ? 7*sc : 3.5*sc;
    const op = i%5===0 ? .22 : .1;
    t += `<line x1="0" y1="${ty}" x2="${tw}" y2="${ty}" stroke="${p.m}" stroke-opacity="${op}" stroke-width="${0.75*sc}"/>`;
    t += `<line x1="${W}" y1="${ty}" x2="${W-tw}" y2="${ty}" stroke="${p.m}" stroke-opacity="${op}" stroke-width="${0.75*sc}"/>`;
  }
  return t;
}

  function makeResonanceMarks(cx, cy, r, val, e, sc){
  let out = `<g opacity=".95">`;
  for (let i=1; i<=20; i++){
    const a = -Math.PI/2 + (i-1) * (Math.PI*2/20);
    const isActive = i === val;
    const opposite = (((val + 9) % 20) + 1);
    const isOpposite = i === opposite;
    const inner = r * (isActive ? 0.99 : 1.015);
    const outer = r * (isActive ? 1.16 : isOpposite ? 1.11 : 1.07);
    const p1 = polar(cx, cy, inner, a);
    const p2 = polar(cx, cy, outer, a);
    const sw = isActive ? 1.6*sc : isOpposite ? 1.05*sc : 0.7*sc;
    const op = isActive ? 0.82 : isOpposite ? 0.40 : 0.16;
    const col = isActive ? e.b : e.m;
    out += `<line x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>`;
    if (isActive || isOpposite){
      const dot = polar(cx, cy, r * (isActive ? 1.21 : 1.14), a);
      out += `<circle cx="${dot[0].toFixed(1)}" cy="${dot[1].toFixed(1)}" r="${(isActive ? 1.9 : 1.3)*sc}" fill="${col}" opacity="${isActive ? 0.85 : 0.32}"/>`;
    }
  }
  out += `</g>`;
  return out;
}


  function makeSharedArchitectureGlyph(cx, cy, W, H, e, val, sc){
  let out = '';
  const inset = 18 * sc;
  const sideX = 46 * sc;

  // quiet vertical pillars instead of concentric circles
  out += `<line x1="${cx}" y1="${inset}" x2="${cx}" y2="${(H-inset).toFixed(1)}" stroke="${e.m}" stroke-opacity=".08" stroke-width="${0.75*sc}"/>`;
  out += `<line x1="${sideX}" y1="${(28*sc).toFixed(1)}" x2="${sideX}" y2="${(H-28*sc).toFixed(1)}" stroke="${e.dim}" stroke-opacity=".11" stroke-width="${0.65*sc}"/>`;
  out += `<line x1="${(W-sideX).toFixed(1)}" y1="${(28*sc).toFixed(1)}" x2="${(W-sideX).toFixed(1)}" y2="${(H-28*sc).toFixed(1)}" stroke="${e.dim}" stroke-opacity=".11" stroke-width="${0.65*sc}"/>`;

  // corner seal-work in diamond language
  const corners = [
    [18*sc, 18*sc, 1, 1],
    [W-18*sc, 18*sc, -1, 1],
    [18*sc, H-18*sc, 1, -1],
    [W-18*sc, H-18*sc, -1, -1]
  ];
  corners.forEach(([x,y,sx,sy])=>{
    const d = 4.6*sc;
    const pts = `${x},${(y-d).toFixed(1)} ${(x+d).toFixed(1)},${y} ${x},${(y+d).toFixed(1)} ${(x-d).toFixed(1)},${y}`;
    out += `<polygon points="${pts}" fill="none" stroke="${e.m}" stroke-opacity=".16" stroke-width="${0.7*sc}"/>`;
    out += `<line x1="${(x + sx*7*sc).toFixed(1)}" y1="${y}" x2="${(x + sx*17*sc).toFixed(1)}" y2="${(y + sy*10*sc).toFixed(1)}" stroke="${e.m}" stroke-opacity=".11" stroke-width="${0.7*sc}"/>`;
    out += `<line x1="${x}" y1="${(y + sy*7*sc).toFixed(1)}" x2="${(x + sx*10*sc).toFixed(1)}" y2="${(y + sy*17*sc).toFixed(1)}" stroke="${e.m}" stroke-opacity=".11" stroke-width="${0.7*sc}"/>`;
  });
  return out;
}


function makeSharedArchitecture(cx, cy, W, H, e, val, sc){
  const outerR = W * 0.40;
  const midR   = W * 0.315;
  const innerR = W * 0.215;
  let out = '';

  // ghost circles / engraved calibration
  out += `<circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="${e.m}" stroke-opacity=".045" stroke-width="${sc}"/>`;
  out += `<circle cx="${cx}" cy="${cy}" r="${midR}" fill="none" stroke="${e.m}" stroke-opacity=".060" stroke-width="${sc}"/>`;
  out += `<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="${e.m}" stroke-opacity=".070" stroke-width="${sc}"/>`;

  // restrained corner seal-work: circles + diagonal braces
  const corners = [
    [18*sc, 18*sc,  1,  1],
    [W-18*sc, 18*sc, -1, 1],
    [18*sc, H-18*sc, 1, -1],
    [W-18*sc, H-18*sc, -1, -1]
  ];
  corners.forEach(([x,y,sx,sy])=>{
    out += `<circle cx="${x}" cy="${y}" r="${4.5*sc}" fill="none" stroke="${e.m}" stroke-opacity=".18" stroke-width="${0.7*sc}"/>`;
    out += `<line x1="${x}" y1="${(y + sy*7*sc).toFixed(1)}" x2="${(x + sx*11*sc).toFixed(1)}" y2="${(y + sy*18*sc).toFixed(1)}" stroke="${e.m}" stroke-opacity=".12" stroke-width="${0.7*sc}"/>`;
    out += `<line x1="${(x + sx*7*sc).toFixed(1)}" y1="${y}" x2="${(x + sx*18*sc).toFixed(1)}" y2="${(y + sy*11*sc).toFixed(1)}" stroke="${e.m}" stroke-opacity=".12" stroke-width="${0.7*sc}"/>`;
  });

  return out;
}

  function makeWildConvergenceArt(cx, cy, artR, sc){
  const silver = { b:'#d8e2f6', m:'#8a96b8', dim:'#141b28' };
  let art = '';

  art += `<circle cx="${cx}" cy="${cy}" r="${artR*1.02}" fill="none" stroke="${silver.dim}" stroke-width="${artR*0.16}" opacity=".96"/>`;
  art += `<circle cx="${cx}" cy="${cy}" r="${artR*1.02}" fill="none" stroke="${silver.m}" stroke-width="${0.9*sc}" opacity=".55"/>`;
  art += `<circle cx="${cx}" cy="${cy}" r="${artR*0.76}" fill="none" stroke="${silver.m}" stroke-width="${0.8*sc}" opacity=".24"/>`;
  art += `<circle cx="${cx}" cy="${cy}" r="${artR*0.41}" fill="none" stroke="${silver.m}" stroke-width="${0.8*sc}" opacity=".30"/>`;

  // four current arcs — disciplined convergence, not a rainbow blast
  art += `<path d="M ${cx} ${cy-artR*0.78} A ${artR*0.78} ${artR*0.78} 0 0 1 ${cx+artR*0.78} ${cy}" fill="none" stroke="${EL.radiance.b}" stroke-width="${1.9*sc}" opacity=".72"/>`;
  art += `<path d="M ${cx+artR*0.78} ${cy} A ${artR*0.78} ${artR*0.78} 0 0 1 ${cx} ${cy+artR*0.78}" fill="none" stroke="${EL.aether.b}" stroke-width="${1.9*sc}" opacity=".72"/>`;
  art += `<path d="M ${cx} ${cy+artR*0.78} A ${artR*0.78} ${artR*0.78} 0 0 1 ${cx-artR*0.78} ${cy}" fill="none" stroke="${EL.flux.b}" stroke-width="${1.9*sc}" opacity=".72"/>`;
  art += `<path d="M ${cx-artR*0.78} ${cy} A ${artR*0.78} ${artR*0.78} 0 0 1 ${cx} ${cy-artR*0.78}" fill="none" stroke="${EL.void.b}" stroke-width="${1.9*sc}" opacity=".72"/>`;

  // radiance: restrained cardinal rays
  for (let a=0; a<8; a++){
    const ang = a * Math.PI/4;
    const p1 = polar(cx, cy, artR*0.42, ang);
    const p2 = polar(cx, cy, artR*(a%2===0 ? 0.95 : 0.78), ang);
    art += `<line x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}" stroke="${EL.radiance.b}" stroke-width="${(a%2===0?1.25:0.7)*sc}" stroke-linecap="round" opacity="${a%2===0?0.34:0.18}"/>`;
  }

  // flux: layered wave paths through the center
  for (let i=-1; i<=1; i++){
    const yy = cy + i*artR*0.17;
    const sw = i===0 ? 1.7*sc : 0.9*sc;
    const op = i===0 ? 0.52 : 0.24;
    art += `<path d="M ${(cx-artR*0.80).toFixed(1)},${yy.toFixed(1)} Q ${(cx-artR*0.38).toFixed(1)},${(yy-artR*0.12).toFixed(1)} ${cx.toFixed(1)},${yy.toFixed(1)} Q ${(cx+artR*0.38).toFixed(1)},${(yy+artR*0.12).toFixed(1)} ${(cx+artR*0.80).toFixed(1)},${yy.toFixed(1)}" fill="none" stroke="${EL.flux.b}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>`;
  }

  // aether: an octagram lattice with nodes
  const pts = [];
  for (let a=0; a<8; a++){
    const ang = a * Math.PI/4 - Math.PI/8;
    const rr = a % 2 === 0 ? artR*0.60 : artR*0.34;
    pts.push(`${(cx + Math.cos(ang)*rr).toFixed(1)},${(cy + Math.sin(ang)*rr).toFixed(1)}`);
  }
  art += `<polygon points="${pts.join(' ')}" fill="none" stroke="${EL.aether.b}" stroke-width="${1.15*sc}" opacity=".58"/>`;
  for (let a=0; a<8; a+=2){
    const ang = a * Math.PI/4 - Math.PI/8;
    const nx = cx + Math.cos(ang)*artR*0.60;
    const ny = cy + Math.sin(ang)*artR*0.60;
    art += `<line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="${EL.aether.b}" stroke-width="${0.7*sc}" opacity=".24"/>`;
    art += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${2.2*sc}" fill="${silver.b}" stroke="${EL.aether.b}" stroke-width="${0.7*sc}" opacity=".78"/>`;
  }

  // void: spiral + sparse stars
  const stars = [[-0.62,-0.28],[0.58,-0.35],[-0.52,0.49],[0.61,0.41],[-0.08,-0.66],[0.11,0.67]];
  stars.forEach(([dx,dy], idx)=>{
    art += `<circle cx="${(cx + dx*artR).toFixed(1)}" cy="${(cy + dy*artR).toFixed(1)}" r="${(idx%2===0?1.6:1.1)*sc}" fill="${EL.void.b}" opacity="${idx%2===0?0.40:0.24}"/>`;
  });
  const spiral = [
    [0,   artR*0.66, artR*0.50],
    [Math.PI*0.5, artR*0.52, artR*0.38],
    [Math.PI, artR*0.40, artR*0.28],
    [Math.PI*1.5, artR*0.30, artR*0.18]
  ];
  spiral.forEach(([startA, ra, rb])=>{
    const x1 = cx + Math.cos(startA)*ra;
    const y1 = cy + Math.sin(startA)*ra;
    const x2 = cx + Math.cos(startA + Math.PI)*rb;
    const y2 = cy + Math.sin(startA + Math.PI)*rb;
    const rAvg = (ra+rb)/2;
    art += `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} A${rAvg.toFixed(1)},${rAvg.toFixed(1)} 0 0,1 ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${EL.void.b}" stroke-width="${1.0*sc}" opacity=".44"/>`;
  });

  // central convergence kite
  const sz = artR*0.24;
  const inn = sz*0.34;
  const cols=[EL.radiance.b,EL.aether.b,EL.flux.b,EL.void.b];
  const kitePts=[
    `${cx},${cy-sz} ${cx+inn},${cy-inn} ${cx},${cy} ${cx-inn},${cy-inn}`,
    `${cx+sz},${cy} ${cx+inn},${cy+inn} ${cx},${cy} ${cx+inn},${cy-inn}`,
    `${cx},${cy+sz} ${cx-inn},${cy+inn} ${cx},${cy} ${cx+inn},${cy+inn}`,
    `${cx-sz},${cy} ${cx-inn},${cy-inn} ${cx},${cy} ${cx-inn},${cy+inn}`
  ];
  kitePts.forEach((pts, i)=>{ art += `<polygon points="${pts}" fill="${cols[i]}" opacity=".88"/>`; });
  art += `<circle cx="${cx}" cy="${cy}" r="${artR*0.09}" fill="${silver.b}" opacity=".95"/>`;

  return art;
}


  // ── Layout variants ────────────────────────────────────────────────
  const LayoutVariants = {
  classic: { pipTop: 19, pipSize: 20, labelBelow: true,  numSize: 28, numPos: 'medallion' },
  compact: { pipTop: 22, pipSize: 16, labelBelow: false, numSize: 22, numPos: 'medallion' },
  regal:   { pipTop: 34, pipSize: 24, labelBelow: true,  numSize: 32, numPos: 'medallion' },
  flag:    { pipTop: 28, pipSize: 20, labelBelow: true,  numSize: 34, numPos: 'top' } // big numeral up top
};

  // ── Dispatchers that read from the registries ─────────────────────
  function getConnector(name){
    const reg = window.AA_CONNECTORS || {};
    return reg[name] || reg['beacon'] || Object.values(reg)[0];
  }
  function getArt(name){
    const reg = window.AA_ART || {};
    return reg[name] || reg['arcana'] || Object.values(reg)[0];
  }


  function normalizeLayoutFx(fx){
    fx = fx || {};
    return {
      cornerGlyph: !!fx.cornerGlyph,
      cornerLift: !!fx.cornerLift,
      connectorPlacement: fx.connectorPlacement || 'same',
      separator: fx.separator || 'none',
      mirroredLabel: !!fx.mirroredLabel,
      allCorners: !!fx.allCorners,
      innerFrame: !!fx.innerFrame,
      cornerScale: fx.cornerScale == null ? 1 : fx.cornerScale,
      centreScale: fx.centreScale == null ? 1 : fx.centreScale
    };
  }

  function renderTinyCurrentGlyph(elem, x, y, size, sc){
    const p = elem === 'wild' ? WILD : EL[elem];
    const s = size;
    if (elem === 'wild'){
      const inn = s * 0.32;
      const cols = [EL.radiance.b, EL.aether.b, EL.flux.b, EL.void.b];
      const polys = [
        `${x},${y-s} ${x+inn},${y-inn} ${x},${y} ${x-inn},${y-inn}`,
        `${x+s},${y} ${x+inn},${y+inn} ${x},${y} ${x+inn},${y-inn}`,
        `${x},${y+s} ${x-inn},${y+inn} ${x},${y} ${x+inn},${y+inn}`,
        `${x-s},${y} ${x-inn},${y-inn} ${x},${y} ${x-inn},${y+inn}`
      ];
      let out = '';
      polys.forEach((pts, i)=>{ out += `<polygon points="${pts}" fill="${cols[i]}" opacity=".86"/>`; });
      out += `<circle cx="${x}" cy="${y}" r="${s*0.18}" fill="#edf2ff" opacity=".92"/>`;
      return out;
    }
    if (elem === 'radiance'){
      return `<circle cx="${x}" cy="${y}" r="${s*0.20}" fill="${p.b}" opacity=".94"/>`
        + `<line x1="${x}" y1="${(y-s).toFixed(1)}" x2="${x}" y2="${(y-s*0.42).toFixed(1)}" stroke="${p.b}" stroke-width="${0.95*sc}" stroke-linecap="round" opacity=".92"/>`
        + `<line x1="${x}" y1="${(y+s).toFixed(1)}" x2="${x}" y2="${(y+s*0.42).toFixed(1)}" stroke="${p.b}" stroke-width="${0.95*sc}" stroke-linecap="round" opacity=".92"/>`
        + `<line x1="${(x-s).toFixed(1)}" y1="${y}" x2="${(x-s*0.42).toFixed(1)}" y2="${y}" stroke="${p.b}" stroke-width="${0.95*sc}" stroke-linecap="round" opacity=".92"/>`
        + `<line x1="${(x+s).toFixed(1)}" y1="${y}" x2="${(x+s*0.42).toFixed(1)}" y2="${y}" stroke="${p.b}" stroke-width="${0.95*sc}" stroke-linecap="round" opacity=".92"/>`;
    }
    if (elem === 'void'){
      const r1 = s*0.76, r2 = s*0.54;
      return `<path d="M ${(x-r1).toFixed(1)} ${(y).toFixed(1)} A ${r1.toFixed(1)} ${r1.toFixed(1)} 0 1 1 ${(x+r1).toFixed(1)} ${(y).toFixed(1)} A ${r2.toFixed(1)} ${r2.toFixed(1)} 0 1 0 ${(x-r1).toFixed(1)} ${(y).toFixed(1)} Z" fill="${p.b}" opacity=".84"/>`
        + `<circle cx="${(x+s*0.52).toFixed(1)}" cy="${(y-s*0.30).toFixed(1)}" r="${0.16*s}" fill="${p.b}" opacity=".72"/>`;
    }
    if (elem === 'flux'){
      const sw = 0.9*sc;
      return `<path d="M ${(x-s).toFixed(1)},${(y-s*0.22).toFixed(1)} Q ${x.toFixed(1)},${(y-s*0.72).toFixed(1)} ${(x+s).toFixed(1)},${(y-s*0.22).toFixed(1)}" fill="none" stroke="${p.b}" stroke-width="${sw}" stroke-linecap="round" opacity=".90"/>`
        + `<path d="M ${(x-s).toFixed(1)},${(y+s*0.24).toFixed(1)} Q ${x.toFixed(1)},${(y+s*0.74).toFixed(1)} ${(x+s).toFixed(1)},${(y+s*0.24).toFixed(1)}" fill="none" stroke="${p.b}" stroke-width="${sw}" stroke-linecap="round" opacity=".76"/>`;
    }
    const diamond = `${x},${(y-s).toFixed(1)} ${(x+s).toFixed(1)},${y} ${x},${(y+s).toFixed(1)} ${(x-s).toFixed(1)},${y}`;
    return `<polygon points="${diamond}" fill="none" stroke="${p.b}" stroke-width="${0.95*sc}" opacity=".88"/>`
      + `<line x1="${x}" y1="${(y-s*0.66).toFixed(1)}" x2="${x}" y2="${(y+s*0.66).toFixed(1)}" stroke="${p.b}" stroke-width="${0.72*sc}" opacity=".56"/>`
      + `<line x1="${(x-s*0.66).toFixed(1)}" y1="${y}" x2="${(x+s*0.66).toFixed(1)}" y2="${y}" stroke="${p.b}" stroke-width="${0.72*sc}" opacity=".56"/>`;
  }

  function makeConnectorSeparator(fx, W, H, OL, sc, p){
    if (!fx.separator || fx.separator === 'none') return '';
    const leftX = OL;
    const rightX = W - OL;
    const y = 12*sc;
    const h = H - 24*sc;
    const wantRight = fx.connectorPlacement !== 'left-only';
    let out = '';
    if (fx.separator === 'line'){
      out += `<line x1="${leftX.toFixed(1)}" y1="${y.toFixed(1)}" x2="${leftX.toFixed(1)}" y2="${(y+h).toFixed(1)}" stroke="${p.m}" stroke-opacity=".24" stroke-width="${0.9*sc}"/>`;
      if (wantRight) out += `<line x1="${rightX.toFixed(1)}" y1="${y.toFixed(1)}" x2="${rightX.toFixed(1)}" y2="${(y+h).toFixed(1)}" stroke="${p.m}" stroke-opacity=".24" stroke-width="${0.9*sc}"/>`;
      return out;
    }
    const bw = 7*sc;
    out += `<rect x="${(leftX-bw).toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${p.dim}" fill-opacity=".14"/>`;
    out += `<line x1="${leftX.toFixed(1)}" y1="${y.toFixed(1)}" x2="${leftX.toFixed(1)}" y2="${(y+h).toFixed(1)}" stroke="${p.m}" stroke-opacity=".30" stroke-width="${0.95*sc}"/>`;
    if (wantRight){
      out += `<rect x="${rightX.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${p.dim}" fill-opacity=".14"/>`;
      out += `<line x1="${rightX.toFixed(1)}" y1="${y.toFixed(1)}" x2="${rightX.toFixed(1)}" y2="${(y+h).toFixed(1)}" stroke="${p.m}" stroke-opacity=".30" stroke-width="${0.95*sc}"/>`;
    }
    return out;
  }

  // ── makeBeaconBorder ────────────────────────────────────────────────
  // Border frame removed entirely. printenbind advises against any frame
  // near the trim edge, so cards now have no edge ring at all — the value
  // orbs (drawn by the beacon connector) and corner pips read on their own.
  // Kept as a no-op so the makeCard call site stays unchanged.
  function makeBeaconBorder(W, H, R, OL, sc, e, id) {
    return { defs: '', gfx: '' };
  }

  // ── makeCard ────────────────────────────────────────────────────────
  function makeCard(val, elem, opts){
  opts = opts || {};
  const connectorName = opts.connector || 'beacon';
  const artKind = opts.art || 'arcana';
  const layout    = LayoutVariants[opts.layout || 'classic'];
  const fx = normalizeLayoutFx(opts.layoutFx);
  const sc = opts.scale || 1;
  const painterly = !!opts.painterly;
  const artBase   = opts.artBase || 'art/painterly/';
  // W:H = 252:358 matches physical 62:88 mm ratio
  const W=252*sc, H=358*sc, R=12*sc, OL=28*sc, TM=42*sc, ST=13*sc;
  // Push the strip column, beacons, and corner numerals inward so all
  // gameplay-critical elements sit inside the 5mm print safe zone
  // (printenbind: text/important graphics ≥5mm from trim edge).
  // 5mm ≈ 20.3 units at W=252/62mm; 17 units of inset keeps glyph and orb
  // EDGES (not just centres) past the safe line. Painterly's frame needs
  // at least 14, so 17 covers both.
  const edgeInset = 17*sc;
  const OL_strip = OL + 2*edgeInset;
  const e = EL[elem];
  const id = uid('c'+elem[0]+val);
  const cx=W/2, cy=H*0.45, artR=W*0.29;

  const conn = getConnector(connectorName);
  const L  = conn.render(val, e, {OL:OL_strip,TM,ST,W,sc,id,side:'left'});
  const rightVal = fx.connectorPlacement === 'mirrored' ? (21 - val) : val;
  const Ri = fx.connectorPlacement === 'left-only'
    ? { defs:'', gfx:'' }
    : conn.render(rightVal, e, {OL:OL_strip,TM,ST,W,sc,id,side:'right'});

  const art = painterly ? '' : getArt(artKind).render(elem, cx, cy, artR, e, {W,H,sc,OL,TM,ST,val});
  const ticks = painterly ? '' : makeTicks(e, OL, TM, ST, W, sc);
  const architecture = painterly ? ''
    : artKind === 'glyph'
    ? makeSharedArchitectureGlyph(cx, cy, W, H, e, val, sc)
    : makeSharedArchitecture(cx, cy, W, H, e, val, sc);
  const separator = makeConnectorSeparator(fx, W, H, OL, sc, e);
  const beaconBorder = connectorName === 'beacon'
    ? makeBeaconBorder(W, H, R, OL, sc, e, id)
    : null;
  const innerFrame = fx.innerFrame
    ? `<rect x="${(OL+12*sc).toFixed(1)}" y="${(18*sc).toFixed(1)}" width="${(W-2*(OL+12*sc)).toFixed(1)}" height="${(H-36*sc).toFixed(1)}" rx="${(10*sc).toFixed(1)}" ry="${(10*sc).toFixed(1)}" fill="none" stroke="${e.m}" stroke-opacity=".20" stroke-width="${0.9*sc}"/>`
    : '';

  const pipSz = Math.round(layout.pipSize * fx.cornerScale * sc), pipX=OL_strip/2, pipY=layout.pipTop*sc + edgeInset;
  const flt = 'url(#'+id+'-s)';
  const invCX=W-OL_strip/2, invCY=H-19*sc-edgeInset;
  const numSz = Math.round(layout.numSize * fx.centreScale * sc);
  const numX = cx, numY = cy + numSz*0.34;
  const cornerStroke = fx.cornerLift ? ` stroke="${e.bg1}" stroke-width="${0.75*sc}" paint-order="stroke fill" ` : '';
  const cornerFillOpacity = fx.cornerLift ? '.99' : '.92';
  const cornerGlyphY = pipY + Math.max(9*sc, pipSz*0.52);
  const cornerGlyphSize = Math.max(3.8*sc, pipSz*0.23);

  const topNumeral = layout.numPos==='top'
    ? `<text x="${cx}" y="${TM+ST*4.05}" font-family="Cinzel,serif" font-weight="900" font-size="${numSz*1.32}" fill="${e.b}" fill-opacity=".90" filter="${flt}" text-anchor="middle">${val}</text>`
    : '';
  const medNum = layout.numPos==='medallion'
    ? `<text x="${numX}" y="${numY}" font-family="Cinzel,serif" font-weight="700" font-size="${numSz}" fill="${e.b}" fill-opacity=".88" filter="${flt}" text-anchor="middle">${val}</text>`
    : '';
  // Painterly medallion: small dark disc backing + smaller numeral so it sits
  // snug inside the symbol art's central void.
  const medR = artR * 0.24;
  const medTextSz = Math.round(medR * 1.05);
  // Painterly medallion: clean dark fill disc + numeral, positioned to align
  // with the empty central circle of the symbol art (which sits higher than
  // the geometric centre cy). 0.37*H matches the symbol image's visual centre.
  const pCenterY = H * 0.37;
  const medFinal = (painterly && layout.numPos==='medallion')
    ? `<circle cx="${cx}" cy="${pCenterY.toFixed(1)}" r="${medR.toFixed(1)}" fill="#06050b" fill-opacity=".90"/>`
      + `<text x="${cx}" y="${(pCenterY + medTextSz*0.34).toFixed(1)}" font-family="Cinzel,serif" font-weight="700" font-size="${medTextSz}" fill="${e.b}" fill-opacity=".96" filter="${flt}" text-anchor="middle">${val}</text>`
    : medNum;
  const labelY = (cy + artR + H) / 2;
  const label = layout.labelBelow
    ? `<text x="${cx}" y="${labelY.toFixed(1)}" font-family="Cinzel,serif" font-weight="700" font-size="${13*sc}" fill="${e.b}" fill-opacity=".90" text-anchor="middle" letter-spacing="${2.8*sc}">${e.name}</text>`
    : '';
  const topLabel = layout.labelBelow && fx.mirroredLabel
    ? `<text x="${cx}" y="${(cy-artR-6*sc).toFixed(1)}" transform="rotate(180 ${cx} ${(cy-artR-6*sc).toFixed(1)})" font-family="Cinzel,serif" font-weight="700" font-size="${13*sc}" fill="${e.b}" fill-opacity=".62" text-anchor="middle" letter-spacing="${2.8*sc}">${e.name}</text>`
    : '';

  const topLeftCorner = `<text x="${pipX}" y="${pipY}" font-family="Cinzel,serif" font-weight="700" font-size="${pipSz}" fill="${e.b}" fill-opacity="${cornerFillOpacity}" filter="${flt}" text-anchor="middle"${cornerStroke}>${val}</text>`
    + (fx.cornerGlyph ? renderTinyCurrentGlyph(elem, pipX, cornerGlyphY, cornerGlyphSize, sc) : '');
  const bottomRightCorner = `<g transform="translate(${invCX},${invCY}) rotate(180)" opacity=".66">`
    + `<text x="0" y="${-12*sc}" font-family="Cinzel,serif" font-weight="700" font-size="${pipSz}" fill="${e.b}" fill-opacity="${fx.cornerLift ? '.96' : '.86'}" filter="${flt}" text-anchor="middle"${cornerStroke}>${val}</text>`
    + (fx.cornerGlyph ? renderTinyCurrentGlyph(elem, 0, -12*sc + Math.max(9*sc, pipSz*0.52), cornerGlyphSize, sc) : '')
    + `</g>`;
  const extraCorners = fx.allCorners
    ? `<g opacity=".86"><text x="${invCX.toFixed(1)}" y="${pipY}" font-family="Cinzel,serif" font-weight="700" font-size="${pipSz}" fill="${e.b}" fill-opacity="${cornerFillOpacity}" filter="${flt}" text-anchor="middle"${cornerStroke}>${val}</text>${fx.cornerGlyph ? renderTinyCurrentGlyph(elem, invCX, cornerGlyphY, cornerGlyphSize, sc) : ''}</g>`
      + `<g transform="translate(${pipX.toFixed(1)},${invCY.toFixed(1)}) rotate(180)" opacity=".56"><text x="0" y="${-12*sc}" font-family="Cinzel,serif" font-weight="700" font-size="${pipSz}" fill="${e.b}" fill-opacity="${fx.cornerLift ? '.95' : '.84'}" filter="${flt}" text-anchor="middle"${cornerStroke}>${val}</text>${fx.cornerGlyph ? renderTinyCurrentGlyph(elem, 0, -12*sc + Math.max(9*sc, pipSz*0.52), cornerGlyphSize, sc) : ''}</g>`
    : '';

  // ── Painterly raster layers (opt-in via opts.painterly) ──────────────
  // Composites the staged art (card-design/art/painterly/) as the visual bed
  // and replaces the vector "architecture", central art variant, and border.
  // Value-dependent vector elements (numerals, connection strips, suit label)
  // still render on top, so alignment stays automatic across every card.
  let pBg = '', pSym = '', pFrame = '';
  if (painterly) {
    const symBoxW = W * 0.84, symBoxH = H * 0.66;
    const symX = (W - symBoxW) / 2, symY = cy - symBoxH * 0.52;
    pBg = `<image href="${artBase}bg.png" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/>`;
    pSym = `<image href="${artBase}${elem}_symbol.png" x="${symX.toFixed(1)}" y="${symY.toFixed(1)}" width="${symBoxW.toFixed(1)}" height="${symBoxH.toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>`;
    // Frame removed by request — painterly background's natural edge is the
    // card edge. Kept the variable in case we want to bring an alternative
    // frame back later.
    pFrame = '';
  }

  // Border frame removed entirely (printenbind margin guidance).
  const vectorBorder = '';

  const numbersAndLabels = topNumeral + medFinal + label + topLabel + topLeftCorner + bottomRightCorner + extraCorners;
  const glowRect = `<rect width="${W}" height="${H}" fill="url(#${id}-g)"/>`;
  const vignetteRect = `<rect width="${W}" height="${H}" fill="url(#${id}-v)"/>`;

  let innerLayers;
  if (painterly) {
    innerLayers = pBg + glowRect + vignetteRect + pSym + separator
      + L.gfx + Ri.gfx + numbersAndLabels + pFrame;
  } else {
    innerLayers = `<rect width="${W}" height="${H}" fill="url(#${id}-bg)"/>` + glowRect + vignetteRect
      + architecture + ticks + L.gfx + Ri.gfx + separator + innerFrame + art
      + numbersAndLabels + vectorBorder;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="card-face">
    <defs>
      <clipPath id="${id}-c"><rect width="${W}" height="${H}" rx="${R}" ry="${R}"/></clipPath>
      <filter id="${id}-s"><feDropShadow dx="0" dy="${sc}" stdDeviation="${2.4*sc}" flood-color="#000" flood-opacity=".84"/></filter>
      <linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${e.bg2}"/><stop offset="100%" stop-color="${e.bg1}"/>
      </linearGradient>
      <radialGradient id="${id}-g" cx="50%" cy="48%" r="42%">
        <stop offset="0%" stop-color="${e.m}" stop-opacity=".085"/><stop offset="100%" stop-color="${e.m}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id}-v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity=".00"/>
        <stop offset="100%" stop-color="#000" stop-opacity=".14"/>
      </linearGradient>
      ${L.defs}${Ri.defs}
      ${beaconBorder ? beaconBorder.defs : ''}
    </defs>
    <g clip-path="url(#${id}-c)">${innerLayers}</g>
  </svg>`;
}

  // ── makeWildCard ────────────────────────────────────────────────────
  function makeWildCard(opts){
  opts = opts || {};
  const connectorName = opts.connector || 'beacon';
  const conn = getConnector(connectorName);
  const fx = normalizeLayoutFx(opts.layoutFx);
  const sc = opts.scale || 1;
  const W=252*sc, H=358*sc, R=12*sc, OL=28*sc, TM=16*sc, ST=16*sc;
  // Same 5mm print-safe inset as makeCard (see edgeInset comment there).
  const edgeInset = 17*sc;
  const OL_strip = OL + 2*edgeInset;
  const id = uid('w');
  const p = { b:'#cdd8f0', m:'#7c88aa', dim:'#121826' };

  let defs = '', gfx = '';
  for (let v=1; v<=20; v++){
    const L  = conn.render(v, p, {OL:OL_strip,TM,ST,W,sc,id:id+'v'+v,side:'left'});
    defs += L.defs;
    gfx  += L.gfx;
    if (fx.connectorPlacement !== 'left-only'){
      const Ri = conn.render(v, p, {OL:OL_strip,TM,ST,W,sc,id:id+'v'+v,side:'right'});
      defs += Ri.defs;
      gfx  += Ri.gfx;
    }
  }

  const wildOpacity = {
    parallelogram: 0.16,
    beacon: 0.30
  }[connectorName] || 0.24;

  const cx=W/2, cy=H*0.45, artR=W*0.29;
  const ticks = makeTicks({m:p.m}, OL, TM, ST, W, sc);
  const pipSz = Math.round(22 * fx.cornerScale * sc), pipX=OL_strip/2, pipY=28*sc+edgeInset;
  const invCX=W-OL_strip/2, invCY=H-28*sc-edgeInset;
  const cornerGlyphSize = Math.max(3.8*sc, pipSz*0.23);
  const separator = makeConnectorSeparator(fx, W, H, OL, sc, p);
  const innerFrame = fx.innerFrame
    ? `<rect x="${(OL+12*sc).toFixed(1)}" y="${(18*sc).toFixed(1)}" width="${(W-2*(OL+12*sc)).toFixed(1)}" height="${(H-36*sc).toFixed(1)}" rx="${(10*sc).toFixed(1)}" ry="${(10*sc).toFixed(1)}" fill="none" stroke="${p.m}" stroke-opacity=".18" stroke-width="${0.9*sc}"/>`
    : '';

  const architecture = (() => {
    let out = '';
    out += `<circle cx="${cx}" cy="${cy}" r="${W*0.40}" fill="none" stroke="${p.m}" stroke-opacity=".06" stroke-width="${sc}"/>`;
    out += `<circle cx="${cx}" cy="${cy}" r="${W*0.315}" fill="none" stroke="${p.m}" stroke-opacity=".08" stroke-width="${sc}"/>`;
    out += `<circle cx="${cx}" cy="${cy}" r="${W*0.215}" fill="none" stroke="${p.m}" stroke-opacity=".09" stroke-width="${sc}"/>`;
    const corners = [
      [18*sc, 18*sc,  1,  1],
      [W-18*sc, 18*sc, -1, 1],
      [18*sc, H-18*sc, 1, -1],
      [W-18*sc, H-18*sc, -1, -1]
    ];
    corners.forEach(([x,y,sx,sy])=>{
      out += `<circle cx="${x}" cy="${y}" r="${4.5*sc}" fill="none" stroke="${p.m}" stroke-opacity=".18" stroke-width="${0.7*sc}"/>`;
      out += `<line x1="${x}" y1="${(y + sy*7*sc).toFixed(1)}" x2="${(x + sx*11*sc).toFixed(1)}" y2="${(y + sy*18*sc).toFixed(1)}" stroke="${p.m}" stroke-opacity=".12" stroke-width="${0.7*sc}"/>`;
      out += `<line x1="${(x + sx*7*sc).toFixed(1)}" y1="${y}" x2="${(x + sx*18*sc).toFixed(1)}" y2="${(y + sy*11*sc).toFixed(1)}" stroke="${p.m}" stroke-opacity=".12" stroke-width="${0.7*sc}"/>`;
    });
    return out;
  })();

  // Art variants may supply their own wild/convergence art via a
  // renderWild(cx, cy, artR, sc) key; otherwise use the shared default.
  const wildVariant = (window.AA_ART || {})[opts.art || ''];
  const art = (wildVariant && wildVariant.renderWild)
    ? wildVariant.renderWild(cx, cy, artR, sc)
    : makeWildConvergenceArt(cx, cy, artR, sc);
  // Corner pips removed by request — the wild reads from its art alone.
  const topLeftCorner = '';
  const bottomRightCorner = '';
  const extraCorners = fx.allCorners
    ? `<g opacity=".80">${renderTinyCurrentGlyph('wild', invCX, pipY - pipSz*0.5, pipSz*0.46, sc)}</g>`
      + `<g transform="translate(${pipX.toFixed(1)},${invCY.toFixed(1)}) rotate(180)" opacity=".56">${renderTinyCurrentGlyph('wild', 0, -pipSz*0.5, pipSz*0.46, sc)}</g>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="card-face">
    <defs>
      <clipPath id="${id}-c"><rect width="${W}" height="${H}" rx="${R}" ry="${R}"/></clipPath>
      <filter id="${id}-s"><feDropShadow dx="0" dy="${sc}" stdDeviation="${2.4*sc}" flood-color="#000" flood-opacity=".84"/></filter>
      <linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#090b12"/><stop offset="100%" stop-color="#111521"/>
      </linearGradient>
      <radialGradient id="${id}-g" cx="50%" cy="48%" r="42%">
        <stop offset="0%" stop-color="${p.b}" stop-opacity=".07"/>
        <stop offset="100%" stop-color="#090b12" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id}-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0"/>
        <stop offset="12%" stop-color="#fff" stop-opacity="1"/>
        <stop offset="88%" stop-color="#fff" stop-opacity="1"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </linearGradient>
      <mask id="${id}-stripmask">
        <rect x="0" y="0" width="${OL_strip}" height="${H}" fill="url(#${id}-fade)"/>
        ${fx.connectorPlacement !== 'left-only' ? `<rect x="${W-OL_strip}" y="0" width="${OL_strip}" height="${H}" fill="url(#${id}-fade)"/>` : ''}
      </mask>
      ${defs}
    </defs>
    <g clip-path="url(#${id}-c)">
      <rect width="${W}" height="${H}" fill="url(#${id}-bg)"/>
      <rect width="${W}" height="${H}" fill="url(#${id}-g)"/>
      ${architecture}
      ${ticks}
      <g opacity="${wildOpacity}" mask="url(#${id}-stripmask)">${gfx}</g>
      ${separator}
      ${innerFrame}
      ${art}
      ${topLeftCorner}
      ${bottomRightCorner}
      ${extraCorners}
    </g>
  </svg>`;
}

  // ── Fan / deck builders ────────────────────────────────────────────
  function buildFan(el, cards, opts){
  opts = opts || {};
  const sc = opts.scale || 1;
  const OL = 28*sc;
  cards.forEach((c,i)=>{
    const last = i === cards.length-1;
    const slot = document.createElement('div');
    slot.style.cssText = `position:relative;height:${358*sc}px;flex-shrink:0;${last?`width:${252*sc}px`:`width:${OL}px;overflow:visible`};`;
    const face = document.createElement('div');
    face.style.cssText = `position:absolute;left:0;top:0;width:${252*sc}px;height:${358*sc}px;`;
    face.innerHTML = c.e==='wild' ? makeWildCard({...opts}) : makeCard(c.v, c.e, opts);
    slot.appendChild(face);
    el.appendChild(slot);
  });
}

  function buildCards(el, cards, opts){
  opts = opts || {};
  const sc = opts.scale || 1;
  cards.forEach(c=>{
    const wrap = document.createElement('div');
    wrap.style.cssText = `display:inline-block;margin:0 10px 10px 0;`;
    wrap.innerHTML = c.e==='wild' ? makeWildCard(opts) : makeCard(c.v, c.e, opts);
    el.appendChild(wrap);
  });
}

  // ── makeCardBack ────────────────────────────────────────────────────
  // Card back in the arcana grammar: seeded grain, wobble rings, dust,
  // bloom. Moonstone-silver field; the five currents appear only as ten
  // paired orbs (each hue twice, opposed) so the back is 180°-symmetric
  // and reveals nothing about the card. No wordmark (name may change).
  // opts.bleed (mm) extends the background past the 62×88 trim for print.
  function makeCardBack(opts){
    opts = opts || {};
    const sc = opts.scale || 1;
    const W = 252*sc, H = 358*sc;
    const UPM = 252/62;                      // svg units per mm
    const B = (opts.bleed || 0) * UPM * sc;  // bleed in svg units
    const TW = W + 2*B, TH = H + 2*B;        // total (bleed) size
    const cx = TW/2, cy = TH/2;
    const id = uid('bk');
    const p = { b:'#cdd8f0', m:'#7c88aa', dim:'#121826', bg1:'#070910', bg2:'#0b0e18' };
    const HUES = ['#f5c518', '#c060f0', '#00c8b4', '#e8304a', '#c8d4e8'];
    const HOT = '#f4f7ff';
    const R = W*0.30;                        // master mandala radius

    // seeded rng (mulberry32-style, same idea as arcana's)
    let s = 0xBACC;
    const rand = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const N = v => v.toFixed(1), N2 = v => v.toFixed(2);

    function wobbleRing(ox, oy, rad, amp, ph1, ph2, col, swd, op){
      let d = '';
      const n = 64;
      for (let i = 0; i <= n; i++){
        const a = i/n * Math.PI*2;
        const rr = rad * (1 + amp*Math.sin(3*a + ph1) + amp*0.7*Math.sin(5*a + ph2));
        d += (i ? 'L' : 'M') + N(ox + Math.cos(a)*rr) + ',' + N(oy + Math.sin(a)*rr);
      }
      return '<path d="' + d + 'Z" fill="none" stroke="' + col + '" stroke-width="' + N2(swd) + '" opacity="' + op + '"/>';
    }
    function mote(x, y, r2, col, op){
      return '<circle cx="' + N(x) + '" cy="' + N(y) + '" r="' + N2(r2) + '" fill="' + col + '" opacity="' + N2(op) + '"/>';
    }
    function sparkle(x, y, len, wd, col, op, rot){
      return '<g transform="translate(' + N(x) + ',' + N(y) + ') rotate(' + rot + ')" opacity="' + N2(op) + '">'
        + '<path d="M0,' + N(-len) + ' L' + N(wd) + ',0 L0,' + N(len) + ' L' + N(-wd) + ',0 Z" fill="' + col + '"/>'
        + '<path d="M' + N(-len) + ',0 L0,' + N(wd) + ' L' + N(len) + ',0 L0,' + N(-wd) + ' Z" fill="' + col + '"/></g>';
    }
    function orb(x, y, r2, col){
      return '<circle cx="' + N(x) + '" cy="' + N(y) + '" r="' + N(r2*2.4) + '" fill="url(#' + id + '-orb)"/>'
        + '<circle cx="' + N(x) + '" cy="' + N(y) + '" r="' + N(r2) + '" fill="' + col + '" opacity=".92"/>'
        + '<circle cx="' + N(x) + '" cy="' + N(y) + '" r="' + N2(r2*0.4) + '" fill="' + HOT + '" opacity=".85"/>';
    }

    let bg = '', glow = '';

    // — engraved field: quiet rings drifting out from the centre —
    bg += wobbleRing(cx, cy, R*1.55, 0.005, 0.8, 2.2, p.m, 0.5*sc, 0.10);
    bg += wobbleRing(cx, cy, R*1.95, 0.004, 2.6, 1.0, p.m, 0.45*sc, 0.08);
    bg += wobbleRing(cx, cy, R*2.45, 0.004, 1.4, 3.1, p.m, 0.45*sc, 0.06);
    // dust motes scattered over the whole face (incl. bleed — cheap insurance)
    for (let i = 0; i < 70; i++){
      const a = rand()*Math.PI*2;
      const rad = R * (0.3 + Math.pow(rand(), 0.7)*2.6);
      bg += mote(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (0.25 + rand()*0.85)*sc, rand() < 0.7 ? p.b : p.m, 0.08 + rand()*0.26);
    }
    for (let i = 0; i < 6; i++){
      const a = rand()*Math.PI*2, rad = R*(0.8 + rand()*1.5);
      bg += sparkle(cx + Math.cos(a)*rad, cy + Math.sin(a)*rad, (1.4 + rand()*1.5)*sc, (0.4 + rand()*0.3)*sc, HOT, 0.18 + rand()*0.18, rand()*90);
    }

    // — mandala: three breathing silver rings —
    glow += wobbleRing(cx, cy, R*1.00, 0.006, 0.4, 1.9, p.b, 1.4*sc, 0.55);
    glow += wobbleRing(cx, cy, R*0.78, 0.007, 2.1, 0.7, p.m, 0.8*sc, 0.40);
    glow += wobbleRing(cx, cy, R*1.12, 0.005, 1.3, 2.8, p.m, 0.6*sc, 0.28);

    // — ten radial spokes (180°-symmetric) —
    for (let i = 0; i < 10; i++){
      const a = -Math.PI/2 + i*Math.PI/5;
      glow += '<line x1="' + N(cx + Math.cos(a)*R*0.46) + '" y1="' + N(cy + Math.sin(a)*R*0.46)
        + '" x2="' + N(cx + Math.cos(a)*R*0.94) + '" y2="' + N(cy + Math.sin(a)*R*0.94)
        + '" stroke="' + p.m + '" stroke-width="' + N2(0.55*sc) + '" opacity=".30"/>';
    }

    // — the five currents, each twice and opposed, threaded on the ring —
    for (let i = 0; i < 10; i++){
      const a = -Math.PI/2 + i*Math.PI/5;
      const col = HUES[i % 5];
      const x = cx + Math.cos(a)*R, y = cy + Math.sin(a)*R;
      glow += orb(x, y, 3.4*sc, col);
      // faint hue wash trailing inward from each orb
      glow += '<line x1="' + N(x) + '" y1="' + N(y) + '" x2="' + N(cx + Math.cos(a)*R*0.72) + '" y2="' + N(cy + Math.sin(a)*R*0.72)
        + '" stroke="' + col + '" stroke-width="' + N2(1.1*sc) + '" stroke-linecap="round" opacity=".22"/>';
    }

    // — centre: dark medallion seat + silver source star (no glyph, no name) —
    glow += '<circle cx="' + N(cx) + '" cy="' + N(cy) + '" r="' + N(R*0.40) + '" fill="' + p.bg1 + '" fill-opacity=".94"/>';
    glow += wobbleRing(cx, cy, R*0.40, 0.008, 0.9, 2.3, p.b, 1.2*sc, 0.70);
    glow += wobbleRing(cx, cy, R*0.30, 0.010, 2.0, 0.5, p.m, 0.7*sc, 0.40);
    glow += sparkle(cx, cy, R*0.24, R*0.035, p.b, 0.90, 0);
    glow += sparkle(cx, cy, R*0.14, R*0.025, HOT, 0.65, 45);
    glow += mote(cx, cy, 1.6*sc, HOT, 0.95);

    // — corner filigree, 180°-symmetric pairs, kept inside the safe zone —
    const fIn = 26*sc + B;  // ≥5mm + bleed from total edge
    [[fIn, fIn, 1, 1], [TW-fIn, TH-fIn, -1, -1], [TW-fIn, fIn, -1, 1], [fIn, TH-fIn, 1, -1]].forEach(([x, y, sx, sy]) => {
      glow += '<circle cx="' + N(x) + '" cy="' + N(y) + '" r="' + N(4.5*sc) + '" fill="none" stroke="' + p.m + '" stroke-width="' + N2(0.7*sc) + '" opacity=".40"/>';
      glow += '<line x1="' + N(x) + '" y1="' + N(y + sy*7*sc) + '" x2="' + N(x + sx*11*sc) + '" y2="' + N(y + sy*18*sc) + '" stroke="' + p.m + '" stroke-width="' + N2(0.7*sc) + '" opacity=".26"/>';
      glow += '<line x1="' + N(x + sx*7*sc) + '" y1="' + N(y) + '" x2="' + N(x + sx*18*sc) + '" y2="' + N(y + sy*11*sc) + '" stroke="' + p.m + '" stroke-width="' + N2(0.7*sc) + '" opacity=".26"/>';
      glow += mote(x, y, 1.1*sc, p.b, 0.55);
    });

    // — border rings removed entirely (printenbind margin guidance) —
    const border = '';

    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + N(TW) + '" height="' + N(TH) + '" viewBox="0 0 ' + N(TW) + ' ' + N(TH) + '" class="card-face">'
      + '<defs>'
      + '<linearGradient id="' + id + '-bg" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0%" stop-color="' + p.bg2 + '"/><stop offset="100%" stop-color="' + p.bg1 + '"/></linearGradient>'
      + '<radialGradient id="' + id + '-g" cx="50%" cy="50%" r="48%">'
      + '<stop offset="0%" stop-color="' + p.b + '" stop-opacity=".08"/>'
      + '<stop offset="100%" stop-color="' + p.bg1 + '" stop-opacity="0"/></radialGradient>'
      + '<radialGradient id="' + id + '-orb" cx="50%" cy="50%" r="50%">'
      + '<stop offset="0%" stop-color="' + HOT + '" stop-opacity=".55"/>'
      + '<stop offset="100%" stop-color="' + HOT + '" stop-opacity="0"/></radialGradient>'
      + '<filter id="' + id + '-bloom" x="-30%" y="-30%" width="160%" height="160%">'
      + '<feGaussianBlur stdDeviation="' + N2(2.2*sc) + '" result="b"/>'
      + '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
      + '</defs>'
      + '<rect width="' + N(TW) + '" height="' + N(TH) + '" fill="url(#' + id + '-bg)"/>'
      + '<rect width="' + N(TW) + '" height="' + N(TH) + '" fill="url(#' + id + '-g)"/>'
      + bg
      + '<g filter="url(#' + id + '-bloom)">' + glow + '</g>'
      + border
      + '</svg>';
  }

  // ── Public API ──────────────────────────────────────────────────────
  window.ArchmageCards = {
    EL, EORD, WILD,
    makeCardBack,
    uid, polar,
    makeTicks, makeResonanceMarks,
    makeSharedArchitectureGlyph, makeSharedArchitecture, makeWildConvergenceArt,
    LayoutVariants,
    getConnector, getArt,
    makeCard, makeWildCard,
    buildFan, buildCards,
    // Legacy shims — ConnectorVariants[name] works like before
    get ConnectorVariants(){
      const out = {};
      for (const k in (window.AA_CONNECTORS||{})) out[k] = window.AA_CONNECTORS[k].render;
      return out;
    },
    get EnergyArtVariants(){
      const out = {};
      for (const k in (window.AA_ART||{})) out[k] = window.AA_ART[k].render;
      return out;
    }
  };
})();
// painterly mode added: opts.painterly + opts.artBase (art/painterly/)