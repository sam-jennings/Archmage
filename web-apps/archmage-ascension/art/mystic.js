// art/mystic.js
// Mystic
// Atmospheric, painterly art per suit. More glow, less sharp vector.
// Inspired by the tarot-style illustrated card aesthetic: radiance as a
// golden starburst corona, void as a swirling galaxy, flux as a flowing
// luminous serpent, aether as sacred geometry with glowing nodes.
// No central medallion — designed to pair with the tarot layout (value
// circle at top). Works with other layouts too; the numeral floats on top.
(function(){
  const AA = window.AA_ART = window.AA_ART || {};

  AA['mystic'] = {
    name: 'Mystic',
    notes: 'Atmospheric illustrated art — glow-heavy, painterly. Pairs well with tarot layout.',
    render: function(elem, cx, cy, artR, e, meta){
      meta = meta || {};
      const sc = meta.sc || 1;
      const r = artR;
      let art = '';

      if (elem === 'radiance'){
        // ── Atmospheric halo ──
        // Wide soft background glow, built from many concentric circles
        // with low opacity to simulate a photographic bloom effect.
        const halos = [1.55, 1.28, 1.06, 0.86, 0.68];
        halos.forEach((hr, i)=>{
          const op = ['.06','.09','.13','.19','.26'][i];
          art += `<circle cx="${cx}" cy="${cy}" r="${(r*hr).toFixed(1)}" fill="${e.b}" opacity="${op}"/>`;
        });

        // ── Ray system: 32 rays in 4 tiers (cardinal / diagonal / half / quarter) ──
        for (let i = 0; i < 32; i++){
          const angle    = i * Math.PI * 2 / 32;
          const isCard   = i % 8 === 0;
          const isDiag   = i % 4 === 0 && !isCard;
          const isHalf   = i % 2 === 0 && !isDiag && !isCard;
          const tipR     = isCard ? r*1.48 : isDiag ? r*1.18 : isHalf ? r*0.94 : r*0.74;
          const baseR    = r * 0.24;
          const sw       = isCard ? 2.1 : isDiag ? 1.3 : isHalf ? 0.85 : 0.52;
          const op       = isCard ? '.82' : isDiag ? '.58' : isHalf ? '.36' : '.20';
          const gid      = 'mys-rad-ray-'+i+'-'+(meta.id||Math.random().toString(36).slice(2,6));
          const x1 = cx + Math.cos(angle)*baseR;
          const y1 = cy + Math.sin(angle)*baseR;
          const x2 = cx + Math.cos(angle)*tipR;
          const y2 = cy + Math.sin(angle)*tipR;
          // Use a gradient so rays fade at the tip for a painterly feel
          art += `<defs><linearGradient id="${gid}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="${e.b}" stop-opacity="${op}"/>
            <stop offset="100%" stop-color="${e.b}" stop-opacity="0"/>
          </linearGradient></defs>`;
          art += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="url(#${gid})" stroke-width="${(sw*sc).toFixed(1)}" stroke-linecap="round"/>`;
        }

        // ── Diamond star-points at cardinals ──
        [[0,-1],[1,0],[0,1],[-1,0]].forEach(([dx,dy])=>{
          const tipX = cx+dx*r*1.44, tipY = cy+dy*r*1.44;
          const basX = cx+dx*r*0.80, basY = cy+dy*r*0.80;
          const mx = (tipX+basX)/2, my = (tipY+basY)/2;
          const px = -dy*r*0.072, py = dx*r*0.072;
          art += `<polygon points="${tipX.toFixed(1)},${tipY.toFixed(1)} ${(mx+px).toFixed(1)},${(my+py).toFixed(1)} ${basX.toFixed(1)},${basY.toFixed(1)} ${(mx-px).toFixed(1)},${(my-py).toFixed(1)}" fill="${e.b}" opacity=".88"/>`;
        });

        // ── Concentric bright rings ──
        [1.02, 0.82, 0.60, 0.40].forEach((hr, i)=>{
          const sw = [1.4,0.9,0.7,0.55][i]*sc;
          const op = ['.52','.36','.28','.22'][i];
          art += `<circle cx="${cx}" cy="${cy}" r="${(r*hr).toFixed(1)}" fill="none" stroke="${e.b}" stroke-width="${sw.toFixed(1)}" opacity="${op}"/>`;
        });

        // ── Glowing core ──
        art += `<circle cx="${cx}" cy="${cy}" r="${(r*0.22).toFixed(1)}" fill="${e.b}" opacity=".72"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${(r*0.12).toFixed(1)}" fill="#fff8e0" opacity=".90"/>`;

        // ── Sparkle motes around core ──
        [[0.38,-0.22],[0.22,0.40],[-0.42,0.18],[-0.18,-0.38],[0.66,-0.52],[0.52,0.64],[-0.68,0.44],[-0.44,-0.66]].forEach(([dx,dy])=>{
          const rs = (Math.abs(dx) > 0.5 ? 1.1 : 1.6)*sc;
          art += `<circle cx="${(cx+dx*r).toFixed(1)}" cy="${(cy+dy*r).toFixed(1)}" r="${rs.toFixed(1)}" fill="${e.b}" opacity="${Math.abs(dx) > 0.5 ? '.48' : '.62'}"/>`;
        });

      } else if (elem === 'void'){
        // ── Star field ──
        const stars = [
          [0.22,-0.82,1.1,'.52'],[0.72,-0.50,0.9,'.44'],[0.94,0.08,1.0,'.48'],
          [0.80,0.56,0.9,'.44'],[0.34,0.90,1.0,'.50'],[-0.38,0.88,0.9,'.44'],
          [-0.88,0.40,0.9,'.48'],[-0.98,-0.16,1.0,'.52'],[-0.72,-0.58,0.9,'.44'],
          [-0.22,-0.94,1.0,'.50'],[0.56,-0.30,0.7,'.36'],[-0.32,0.48,0.7,'.36'],
          [0.28,0.22,0.6,'.30'],[-0.48,-0.24,0.7,'.36'],[0.10,-0.60,0.8,'.40'],
          [-0.10,0.64,0.8,'.40'],[0.60,0.40,0.6,'.30'],[-0.64,-0.40,0.6,'.30'],
          [1.10,-0.18,0.7,'.28'],[1.08,0.30,0.6,'.24'],[-1.12,0.16,0.7,'.28'],
          [0.38,-1.10,0.6,'.24'],[-0.42,1.08,0.6,'.24']
        ];
        stars.forEach(([dx,dy,rs,op])=>{
          art += `<circle cx="${(cx+dx*r).toFixed(1)}" cy="${(cy+dy*r).toFixed(1)}" r="${(rs*sc).toFixed(1)}" fill="${e.b}" opacity="${op}"/>`;
        });

        // ── Wide atmospheric purple glow ──
        [1.40,1.08,0.78].forEach((hr,i)=>{
          const op = ['.05','.10','.18'][i];
          art += `<circle cx="${cx}" cy="${cy}" r="${(r*hr).toFixed(1)}" fill="${e.b}" opacity="${op}"/>`;
        });

        // ── Galaxy spiral — 4 arms, each a wide luminous sweep ──
        const ARMS = 4;
        for (let arm = 0; arm < ARMS; arm++){
          const base = arm * (Math.PI*2/ARMS) + Math.PI/8;

          // Outer bright arm
          const ptsO = [];
          for (let i = 0; i <= 56; i++){
            const t = i/56;
            const ang = base + t * Math.PI * 2.4;
            const rad = r * (0.12 + t * 0.88);
            ptsO.push(`${(cx+Math.cos(ang)*rad).toFixed(1)},${(cy+Math.sin(ang)*rad).toFixed(1)}`);
          }
          art += `<polyline points="${ptsO.join(' ')}" fill="none" stroke="${e.b}" stroke-width="${(2.4*sc).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity=".88"/>`;

          // Mid body
          const ptsM = [];
          for (let i = 0; i <= 48; i++){
            const t = i/48;
            const ang = base - 0.22 + t * Math.PI * 2.2;
            const rad = r * (0.16 + t * 0.76);
            ptsM.push(`${(cx+Math.cos(ang)*rad).toFixed(1)},${(cy+Math.sin(ang)*rad).toFixed(1)}`);
          }
          art += `<polyline points="${ptsM.join(' ')}" fill="none" stroke="${e.m}" stroke-width="${(1.3*sc).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity=".62"/>`;

          // Faint trailing ghost
          const ptsT = [];
          for (let i = 0; i <= 40; i++){
            const t = i/40;
            const ang = base + 0.36 + t * Math.PI * 2.0;
            const rad = r * (0.20 + t * 0.68);
            ptsT.push(`${(cx+Math.cos(ang)*rad).toFixed(1)},${(cy+Math.sin(ang)*rad).toFixed(1)}`);
          }
          art += `<polyline points="${ptsT.join(' ')}" fill="none" stroke="${e.dim}" stroke-width="${(0.8*sc).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity=".40"/>`;
        }

        // ── Outer containment ring ──
        art += `<circle cx="${cx}" cy="${cy}" r="${(r*1.02).toFixed(1)}" fill="none" stroke="${e.m}" stroke-width="${(0.9*sc).toFixed(1)}" opacity=".32"/>`;

        // ── Inner void aperture — the empty pull at the center ──
        art += `<circle cx="${cx}" cy="${cy}" r="${(r*0.14).toFixed(1)}" fill="${e.bg1}" opacity=".95"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${(r*0.10).toFixed(1)}" fill="${e.bg2}" opacity=".99"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${(r*0.14).toFixed(1)}" fill="none" stroke="${e.b}" stroke-width="${(1.0*sc).toFixed(1)}" opacity=".55"/>`;

      } else if (elem === 'flux'){
        // ── Wide atmospheric green glow ──
        [1.30,0.96,0.64].forEach((hr,i)=>{
          const op = ['.06','.12','.22'][i];
          art += `<circle cx="${cx}" cy="${cy}" r="${(r*hr).toFixed(1)}" fill="${e.b}" opacity="${op}"/>`;
        });

        // ── Flowing serpent streams ──
        // Primary bright serpent: an S-curve sweeping from top-left to bottom-right
        const buildSerpent = (xOff, yOff, sw, op) => {
          const x0 = cx - r*1.00 + xOff;
          const y0 = cy - r*0.92 + yOff;
          const x3 = cx + r*1.00 + xOff;
          const y3 = cy + r*0.92 + yOff;
          const cp1x = cx + r*0.62 + xOff;
          const cp1y = cy - r*0.92 + yOff;
          const cp2x = cx - r*0.62 + xOff;
          const cp2y = cy + r*0.92 + yOff;
          return `<path d="M${x0.toFixed(1)},${y0.toFixed(1)} C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${x3.toFixed(1)},${y3.toFixed(1)}" fill="none" stroke="${e.b}" stroke-width="${(sw*sc).toFixed(1)}" stroke-linecap="round" opacity="${op}"/>`;
        };
        art += buildSerpent(0, 0, 3.2, '.92');
        art += buildSerpent(-r*0.18, r*0.06, 1.8, '.60');
        art += buildSerpent( r*0.18,-r*0.06, 1.8, '.60');
        art += buildSerpent(-r*0.34, r*0.14, 1.0, '.36');
        art += buildSerpent( r*0.34,-r*0.14, 1.0, '.36');
        art += buildSerpent(-r*0.52, r*0.24, 0.6, '.22');
        art += buildSerpent( r*0.52,-r*0.24, 0.6, '.22');

        // ── Particle scatter along the stream ──
        const particleData = [
          [-0.68,-0.72,1.4,'.68'],[-0.32,-0.54,1.0,'.52'],[0.06,-0.28,1.2,'.58'],
          [0.40, 0.08,1.1,'.54'],[0.70, 0.46,1.3,'.62'],[0.86, 0.76,1.0,'.50'],
          [-0.82,-0.20,0.8,'.38'],[-0.18, 0.22,0.9,'.44'],[0.52, 0.60,0.7,'.38'],
          [-0.50,-0.84,0.7,'.34'],[0.22,-0.70,0.6,'.30'],[0.72,-0.22,0.6,'.30'],
          [-0.24, 0.64,0.6,'.30'],[0.90, 0.20,0.7,'.34']
        ];
        particleData.forEach(([dx,dy,rs,op])=>{
          art += `<circle cx="${(cx+dx*r).toFixed(1)}" cy="${(cy+dy*r).toFixed(1)}" r="${(rs*sc).toFixed(1)}" fill="${e.b}" opacity="${op}"/>`;
        });

        // ── Glowing orb at the inflection centre ──
        art += `<circle cx="${cx}" cy="${cy}" r="${(r*0.20).toFixed(1)}" fill="${e.b}" opacity=".28"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${(r*0.10).toFixed(1)}" fill="${e.b}" opacity=".72"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${(r*0.05).toFixed(1)}" fill="#e0fff8" opacity=".90"/>`;

      } else if (elem === 'aether'){
        // ── Wide atmospheric crimson glow ──
        [1.32,0.98,0.66].forEach((hr,i)=>{
          const op = ['.05','.11','.20'][i];
          art += `<circle cx="${cx}" cy="${cy}" r="${(r*hr).toFixed(1)}" fill="${e.b}" opacity="${op}"/>`;
        });

        // ── Outer diamond ──
        const outerD = r * 0.98;
        art += `<polygon points="${cx},${(cy-outerD).toFixed(1)} ${(cx+outerD).toFixed(1)},${cy} ${cx},${(cy+outerD).toFixed(1)} ${(cx-outerD).toFixed(1)},${cy}" fill="none" stroke="${e.b}" stroke-width="${(2.0*sc).toFixed(1)}" opacity=".88"/>`;

        // ── Inner diamond (rotated 45°) ──
        const innerD = r * 0.60;
        art += `<polygon points="${cx},${(cy-innerD).toFixed(1)} ${(cx+innerD).toFixed(1)},${cy} ${cx},${(cy+innerD).toFixed(1)} ${(cx-innerD).toFixed(1)},${cy}" fill="none" stroke="${e.m}" stroke-width="${(1.4*sc).toFixed(1)}" opacity=".70"/>`;

        // ── Binding circle ──
        art += `<circle cx="${cx}" cy="${cy}" r="${(r*0.62).toFixed(1)}" fill="none" stroke="${e.b}" stroke-width="${(1.1*sc).toFixed(1)}" opacity=".55"/>`;

        // ── Lattice lines: outer diamond vertices → inner diamond vertices ──
        const ov = [[cx,cy-outerD],[cx+outerD,cy],[cx,cy+outerD],[cx-outerD,cy]];
        const iv = [[cx,cy-innerD],[cx+innerD,cy],[cx,cy+innerD],[cx-innerD,cy]];
        // Cross-connect every outer to every inner vertex
        ov.forEach((o)=>{
          iv.forEach((inn)=>{
            art += `<line x1="${o[0].toFixed(1)}" y1="${o[1].toFixed(1)}" x2="${inn[0].toFixed(1)}" y2="${inn[1].toFixed(1)}" stroke="${e.m}" stroke-width="${(0.6*sc).toFixed(1)}" opacity=".30"/>`;
          });
        });

        // ── Diagonal scaffold lines ──
        art += `<line x1="${(cx-outerD).toFixed(1)}" y1="${cy}" x2="${(cx+outerD).toFixed(1)}" y2="${cy}" stroke="${e.dim}" stroke-width="${(0.7*sc).toFixed(1)}" opacity=".55"/>`;
        art += `<line x1="${cx}" y1="${(cy-outerD).toFixed(1)}" x2="${cx}" y2="${(cy+outerD).toFixed(1)}" stroke="${e.dim}" stroke-width="${(0.7*sc).toFixed(1)}" opacity=".55"/>`;
        art += `<line x1="${(cx-outerD*0.72).toFixed(1)}" y1="${(cy-outerD*0.72).toFixed(1)}" x2="${(cx+outerD*0.72).toFixed(1)}" y2="${(cy+outerD*0.72).toFixed(1)}" stroke="${e.dim}" stroke-width="${(0.6*sc).toFixed(1)}" opacity=".40"/>`;
        art += `<line x1="${(cx+outerD*0.72).toFixed(1)}" y1="${(cy-outerD*0.72).toFixed(1)}" x2="${(cx-outerD*0.72).toFixed(1)}" y2="${(cy+outerD*0.72).toFixed(1)}" stroke="${e.dim}" stroke-width="${(0.6*sc).toFixed(1)}" opacity=".40"/>`;

        // ── Glowing nodes at outer vertices ──
        ov.forEach(([nx,ny])=>{
          art += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${(5.5*sc).toFixed(1)}" fill="${e.b}" opacity=".28"/>`;
          art += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${(3.5*sc).toFixed(1)}" fill="${e.bg2}" stroke="${e.b}" stroke-width="${(1.1*sc).toFixed(1)}" opacity=".92"/>`;
          art += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${(1.8*sc).toFixed(1)}" fill="${e.b}" opacity=".88"/>`;
        });

        // ── Nodes at inner vertices ──
        iv.forEach(([nx,ny])=>{
          art += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${(3.2*sc).toFixed(1)}" fill="${e.bg2}" stroke="${e.b}" stroke-width="${(0.9*sc).toFixed(1)}" opacity=".80"/>`;
          art += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${(1.4*sc).toFixed(1)}" fill="${e.b}" opacity=".75"/>`;
        });

        // ── Mid-edge nodes on outer diamond ──
        const mids = [
          [cx+outerD*0.50, cy-outerD*0.50], [cx+outerD*0.50, cy+outerD*0.50],
          [cx-outerD*0.50, cy+outerD*0.50], [cx-outerD*0.50, cy-outerD*0.50]
        ];
        mids.forEach(([mx,my])=>{
          art += `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${(2.0*sc).toFixed(1)}" fill="${e.m}" opacity=".65"/>`;
        });

        // ── Central glowing core ──
        art += `<circle cx="${cx}" cy="${cy}" r="${(r*0.16).toFixed(1)}" fill="${e.b}" opacity=".25"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${(r*0.08).toFixed(1)}" fill="${e.b}" opacity=".75"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${(r*0.04).toFixed(1)}" fill="#ffd0d8" opacity=".90"/>`;
      }

      return art;
    }
  };
})();
