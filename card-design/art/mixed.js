// art/mixed.js
// Mixed — independent per-suit art selection:
//   Radiance → ritual renderer
//   Void     → sigil renderer
//   Flux     → emblem renderer
//   Aether   → emblem renderer
//
// This file is intentionally standalone. It does not require ritual.js,
// sigil.js, or emblem.js to be loaded first. The selected renderers are
// embedded as private local functions and only AA['mixed'] is registered.
(function(){
  const AA = window.AA_ART = window.AA_ART || {};

  const renderRitual = function(elem, cx, cy, artR, e){
      const r = artR;
      let art = '';

      // ── Shared containment ring (outer frame) ──
      art += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${e.dim}" stroke-width="${r*0.16}" opacity="0.95"/>`;
      art += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${e.m}" stroke-width="0.9" opacity="0.55"/>`;

      if (elem === 'radiance'){
        // RADIANCE — emissive / outward projection
        // 16 rays alternating primary (long, bright) and secondary (shorter, dim)
        for (let a = 0; a < 16; a++){
          const angle = a * Math.PI / 8;
          const isPrimary = a % 2 === 0;
          const r1 = isPrimary ? r*0.44 : r*0.50;
          const r2 = isPrimary ? r*1.12 : r*0.88;
          const sw = isPrimary ? 1.3 : 0.65;
          const op = isPrimary ? 0.80 : 0.38;
          art += `<line x1="${cx+Math.cos(angle)*r1}" y1="${cy+Math.sin(angle)*r1}" x2="${cx+Math.cos(angle)*r2}" y2="${cy+Math.sin(angle)*r2}" stroke="${e.b}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>`;
        }
        // Concentric corona rings — progressively tighter and brighter toward centre
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.78}" fill="none" stroke="${e.m}" stroke-width="0.7" opacity="0.28"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.58}" fill="none" stroke="${e.m}" stroke-width="0.85" opacity="0.40"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.40}" fill="none" stroke="${e.b}" stroke-width="0.9" opacity="0.48"/>`;
        // Inner medallion
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.26}" fill="${e.bg2}"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.26}" fill="none" stroke="${e.b}" stroke-width="1.2" opacity="0.72"/>`;

      } else if (elem === 'void'){
        // VOID — absorptive / inward convergence
        // Star scatter background
        const starData = [
          [0.76,0.62,0.9],[0.42,0.82,0.7],[0.88,0.28,1.0],[0.52,0.18,0.8],[0.28,0.54,0.7],
          [0.84,0.74,0.9],[0.60,0.36,0.8],[0.18,0.80,0.7],[0.70,0.18,0.9],[0.12,0.42,0.8],
          [0.92,0.50,0.7],[0.34,0.14,0.9],[0.64,0.88,0.8],[0.08,0.64,0.7],[0.48,0.92,0.9]
        ];
        starData.forEach(([ax,ay,rr])=>{
          const sx = cx - r*1.05 + ax*r*2.1;
          const sy = cy - r*1.05 + ay*r*2.1;
          art += `<circle cx="${sx}" cy="${sy}" r="${rr}" fill="${e.b}" opacity="0.42"/>`;
        });
        // Inward spiral — four half-arc segments, radius shrinking toward centre
        const spiral = [
          [0,   r*0.88, r*0.68, 0, 1],
          [Math.PI*0.5,  r*0.70, r*0.52, 0, 1],
          [Math.PI,      r*0.54, r*0.38, 0, 1],
          [Math.PI*1.5,  r*0.40, r*0.26, 0, 1]
        ];
        spiral.forEach(([startA, ra, rb])=>{
          const x1 = cx + Math.cos(startA)*ra;
          const y1 = cy + Math.sin(startA)*ra;
          const x2 = cx + Math.cos(startA + Math.PI)*rb;
          const y2 = cy + Math.sin(startA + Math.PI)*rb;
          const rAvg = (ra+rb)/2;
          art += `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} A${rAvg.toFixed(1)},${rAvg.toFixed(1)} 0 0,1 ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${e.b}" stroke-width="1.4" opacity="0.60"/>`;
        });
        // Depth rings — dim as they approach the hollow centre
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.56}" fill="none" stroke="${e.m}" stroke-width="0.8" opacity="0.32"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.36}" fill="none" stroke="${e.m}" stroke-width="0.7" opacity="0.22"/>`;
        // Hollow centre — void aperture
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.20}" fill="${e.bg1}"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.20}" fill="none" stroke="${e.b}" stroke-width="1.1" opacity="0.65"/>`;

      } else if (elem === 'flux'){
        // FLUX — transitional / oscillating movement
        // 9 horizontal sine waves stacked, amplitude tapers to edges
        for (let i = -4; i <= 4; i++){
          const baseY  = cy + i * r * 0.185;
          const amp    = r * 0.088;
          const isCentre = i === 0;
          const sw = isCentre ? 1.9 : (Math.abs(i) < 2 ? 1.0 : 0.65);
          const col = isCentre ? e.b : e.m;
          const op = isCentre ? 0.92 : Math.max(0.12, 0.55 - Math.abs(i)*0.10);
          art += `<path d="M${(cx-r).toFixed(1)},${baseY.toFixed(1)} Q${(cx-r*0.5).toFixed(1)},${(baseY-amp).toFixed(1)} ${cx.toFixed(1)},${baseY.toFixed(1)} Q${(cx+r*0.5).toFixed(1)},${(baseY+amp).toFixed(1)} ${(cx+r).toFixed(1)},${baseY.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>`;
        }
        // Flow-direction calibration marks — three small horizontal chevrons
        for (let i = 0; i < 3; i++){
          const mx = cx - r*0.52 + i*r*0.52;
          art += `<line x1="${mx}" y1="${cy}" x2="${mx+r*0.16}" y2="${cy}" stroke="${e.b}" stroke-width="1.3" stroke-linecap="round" opacity="0.44"/>`;
        }
        // Inner medallion
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.26}" fill="${e.bg2}"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.26}" fill="none" stroke="${e.b}" stroke-width="1.1" opacity="0.68"/>`;

      } else if (elem === 'aether'){
        // AETHER — binding / geometric stabilization
        // Octagram (8-pointed star) — alternating outer/inner radius vertices
        const pts8 = [];
        for (let a = 0; a < 8; a++){
          const angle = a * Math.PI / 4 - Math.PI/8;
          const ri = a % 2 === 0 ? r*0.80 : r*0.46;
          pts8.push(`${(cx+Math.cos(angle)*ri).toFixed(1)},${(cy+Math.sin(angle)*ri).toFixed(1)}`);
        }
        art += `<polygon points="${pts8.join(' ')}" fill="none" stroke="${e.b}" stroke-width="1.3" opacity="0.72"/>`;
        // Binding ring
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.58}" fill="none" stroke="${e.m}" stroke-width="0.8" opacity="0.38"/>`;
        // Scaffold lines from centre to the four primary outer nodes
        for (let a = 0; a < 8; a += 2){
          const angle = a * Math.PI / 4 - Math.PI/8;
          const nx = cx + Math.cos(angle)*r*0.80;
          const ny = cy + Math.sin(angle)*r*0.80;
          art += `<line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="${e.dim}" stroke-width="0.7" opacity="0.9"/>`;
          // Node at outer vertex
          art += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="2.8" fill="${e.bg2}" stroke="${e.b}" stroke-width="0.9" opacity="0.85"/>`;
        }
        // Inner medallion
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.26}" fill="${e.bg2}"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.26}" fill="none" stroke="${e.b}" stroke-width="1.2" opacity="0.72"/>`;
        // Central node
        art += `<circle cx="${cx}" cy="${cy}" r="3.2" fill="${e.b}" opacity="0.88"/>`;
      }

      return art;
    };

  const renderSigil = function(elem, cx, cy, artR, e){
      const s = artR / 82;
      const tx = cx - 100*s, ty = cy - 160*s;
      let art = `<g transform="translate(${tx},${ty}) scale(${s})">`;
      if (elem==='radiance'){
        art += `<circle cx="100" cy="160" r="82" fill="none" stroke="#2a1c00" stroke-width="16"/>`
          + `<circle cx="100" cy="160" r="82" fill="none" stroke="#5a3c04" stroke-width="6"/>`
          + `<circle cx="100" cy="160" r="82" fill="none" stroke="#8a6010" stroke-width="1.5"/>`
          + `<circle cx="100" cy="160" r="64" fill="none" stroke="#1e1400" stroke-width="8"/>`
          + `<circle cx="100" cy="160" r="64" fill="none" stroke="#3c2802" stroke-width="2"/>`
          + `<circle cx="100" cy="160" r="50" fill="none" stroke="#6a4808" stroke-width="1"/>`;
        // rays
        const rays = [[100,70,100,57,2.2],[100,250,100,263,2.2],[10,160,-3,160,2.2],[190,160,203,160,2.2],
          [36,96,27,87,1.8],[164,224,173,233,1.8],[164,96,173,87,1.8],[36,224,27,233,1.8]];
        rays.forEach(r=>{ art += `<line x1="${r[0]}" y1="${r[1]}" x2="${r[2]}" y2="${r[3]}" stroke="#c8961a" stroke-width="${r[4]}" stroke-linecap="round"/>`; });
        art += `<circle cx="100" cy="160" r="44" fill="${e.bg2}"/>`
          + `<circle cx="100" cy="160" r="44" fill="none" stroke="#8a6010" stroke-width="1.2"/>`;
      } else if (elem==='void'){
        const stars = [[18,18,.9,.45],[58,12,.7,.35],[108,25,1.1,.45],[148,15,.8,.35],[188,30,.9,.45],
          [6,90,.7,.40],[192,95,1.0,.45],[12,250,.9,.45],[80,272,.7,.40],[138,268,1.1,.45],
          [190,252,.8,.40],[196,160,.9,.45],[4,190,.7,.40],[52,45,1.0,.45],[166,52,.8,.40]];
        stars.forEach(st=>{ art += `<circle cx="${st[0]}" cy="${st[1]}" r="${st[2]}" fill="#c060f0" opacity="${st[3]}"/>`; });
        art += `<circle cx="100" cy="160" r="84" fill="none" stroke="#180840" stroke-width="14"/>`
          + `<circle cx="100" cy="160" r="84" fill="none" stroke="#2e1065" stroke-width="5"/>`
          + `<circle cx="100" cy="160" r="84" fill="none" stroke="#5a1a9a" stroke-width="1.5"/>`
          + `<circle cx="100" cy="160" r="65" fill="none" stroke="#120630" stroke-width="7"/>`
          + `<circle cx="100" cy="160" r="65" fill="none" stroke="#3a1078" stroke-width="1.5"/>`
          + `<circle cx="100" cy="160" r="50" fill="none" stroke="#5020a0" stroke-width="1"/>`
          + `<path d="M100,160 Q138,110 162,100 Q190,90 194,118 Q198,146 172,160 Q146,174 130,202 Q114,228 122,250" fill="none" stroke="#6a0dad" stroke-width="1.5" opacity="0.75"/>`
          + `<path d="M100,160 Q62,210 38,220 Q10,230 6,202 Q2,174 28,160 Q54,146 68,116 Q82,88 72,64" fill="none" stroke="#6a0dad" stroke-width="1.5" opacity="0.75"/>`
          + `<circle cx="100" cy="160" r="44" fill="${e.bg2}"/>`
          + `<circle cx="100" cy="160" r="44" fill="none" stroke="#5a1a9a" stroke-width="1.2"/>`;
      } else if (elem==='flux'){
        const waves = [80,105,130,190,215,240];
        waves.forEach(yy=>{ art += `<path d="M5,${yy} Q30,${yy-22} 55,${yy} Q80,${yy+22} 105,${yy} Q130,${yy-22} 155,${yy} Q180,${yy+22} 195,${yy}" fill="none" stroke="#003828" stroke-width="1.2"/>`; });
        art += `<path d="M5,55 Q30,33 55,55 Q80,77 105,55 Q130,33 155,55 Q180,77 195,55" fill="none" stroke="#002820" stroke-width="1"/>`
          + `<path d="M5,265 Q30,243 55,265 Q80,287 105,265 Q130,243 155,265 Q180,287 195,265" fill="none" stroke="#002820" stroke-width="1"/>`
          + `<path d="M5,160 Q30,125 55,160 Q80,195 105,160 Q130,125 155,160 Q180,195 195,160" fill="none" stroke="#00c8b4" stroke-width="2.2"/>`
          + `<path d="M5,160 Q30,138 55,160 Q80,182 105,160 Q130,138 155,160 Q180,182 195,160" fill="none" stroke="#008878" stroke-width="1.4" opacity="0.8"/>`
          + `<circle cx="100" cy="160" r="44" fill="${e.bg2}"/>`
          + `<circle cx="100" cy="160" r="44" fill="none" stroke="#009080" stroke-width="1.2"/>`;
      } else if (elem==='aether'){
        const lines = [[100,70,100,250,0.9,'#400010'],[10,160,190,160,0.9,'#400010'],[37,97,163,223,0.9,'#400010'],[163,97,37,223,0.9,'#400010']];
        lines.forEach(l=>{ art += `<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" stroke="${l[5]}" stroke-width="${l[4]}"/>`; });
        const xlines = [[100,70,37,97],[100,70,163,97],[10,160,37,97],[10,160,37,223],[190,160,163,97],[190,160,163,223],[100,250,37,223],[100,250,163,223]];
        xlines.forEach(l=>{ art += `<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" stroke="#300010" stroke-width="0.8"/>`; });
        const accents = [[100,70,100,10,1.4,.6],[100,250,100,310,1.4,.6],[10,160,37,97,1.2,.5],[190,160,163,223,1.2,.5]];
        accents.forEach(a=>{ art += `<line x1="${a[0]}" y1="${a[1]}" x2="${a[2]}" y2="${a[3]}" stroke="#c8203a" stroke-width="${a[4]}" opacity="${a[5]}"/>`; });
        const nodes = [[100,70,3.5],[37,97,3],[163,97,3],[10,160,3],[190,160,3],[37,223,3],[163,223,3],[100,250,3.5]];
        nodes.forEach(n=>{ art += `<circle cx="${n[0]}" cy="${n[1]}" r="${n[2]}" fill="#500018" stroke="#c82030" stroke-width="0.9"/>`; });
        art += `<circle cx="100" cy="160" r="44" fill="${e.bg2}"/>`
          + `<circle cx="100" cy="160" r="44" fill="none" stroke="#a81828" stroke-width="1.2"/>`;
      }
      art += `</g>`;
      return art;
    };

  const renderEmblem = function(elem, cx, cy, artR, e, meta){
      meta = meta || {};
      const sc = meta.sc || 1;
      const medR = artR * 0.285;
      const r = artR;
      let art = '';

      if (elem === 'radiance'){
        // Concentric halo rings — gives the gold "frame of light" feeling
        art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*1.14).toFixed(1)+'" fill="none" stroke="'+e.dim+'" stroke-width="'+(1.0*sc)+'" opacity=".68"/>';
        art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.98).toFixed(1)+'" fill="none" stroke="'+e.m+'" stroke-width="'+(1.3*sc)+'" opacity=".85"/>';
        art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.82).toFixed(1)+'" fill="none" stroke="'+e.m+'" stroke-width="'+(0.7*sc)+'" opacity=".42"/>';
        art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.58).toFixed(1)+'" fill="none" stroke="'+e.b+'" stroke-width="'+(0.9*sc)+'" opacity=".50"/>';
        art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.44).toFixed(1)+'" fill="none" stroke="'+e.m+'" stroke-width="'+(0.6*sc)+'" opacity=".32"/>';

        // 32 rays, layered by cardinal/diagonal/tertiary
        for (let i = 0; i < 32; i++){
          const a = i * Math.PI * 2 / 32;
          const cardinal = (i % 8) === 0;
          const diag     = (i % 4) === 0 && !cardinal;
          const rb = r * 0.46;
          const rt = cardinal ? r*1.26 : (diag ? r*1.04 : r*0.90);
          const sw = cardinal ? 1.55 : (diag ? 0.95 : 0.55);
          const op = cardinal ? 0.90 : (diag ? 0.58 : 0.30);
          const x1 = cx + Math.cos(a)*rb, y1 = cy + Math.sin(a)*rb;
          const x2 = cx + Math.cos(a)*rt, y2 = cy + Math.sin(a)*rt;
          art += '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+e.b+'" stroke-width="'+(sw*sc)+'" stroke-linecap="round" opacity="'+op+'"/>';
        }

        // 4 elongated diamond-point stars at cardinals (N, E, S, W)
        const cardFourR = [
          [0, -1], [1, 0], [0, 1], [-1, 0]
        ];
        cardFourR.forEach(([dx,dy])=>{
          const tipX = cx + dx*r*1.22, tipY = cy + dy*r*1.22;
          const basX = cx + dx*r*0.82, basY = cy + dy*r*0.82;
          const mx = (tipX+basX)/2, my = (tipY+basY)/2;
          const px = -dy, py = dx;
          const w = r*0.10;
          const pts =
            tipX.toFixed(1)+','+tipY.toFixed(1)+' '+
            (mx+px*w).toFixed(1)+','+(my+py*w).toFixed(1)+' '+
            basX.toFixed(1)+','+basY.toFixed(1)+' '+
            (mx-px*w).toFixed(1)+','+(my-py*w).toFixed(1);
          art += '<polygon points="'+pts+'" fill="'+e.b+'" fill-opacity=".86" stroke="'+e.b+'" stroke-width="'+(0.6*sc)+'"/>';
          // little central highlight on each tip
          art += '<circle cx="'+mx.toFixed(1)+'" cy="'+my.toFixed(1)+'" r="'+(1.4*sc)+'" fill="'+e.b+'" opacity=".85"/>';
        });

        // Diagonal ornamental lozenges (little bright gems between cardinals)
        for (let i = 0; i < 4; i++){
          const a = Math.PI/4 + i*Math.PI/2;
          const ux = Math.cos(a), uy = Math.sin(a);
          const px = -uy, py = ux;
          // small diamond-lozenge between the cardinals at mid-radius
          const dcx = cx + ux*r*0.82, dcy = cy + uy*r*0.82;
          const len = r*0.11, wid = r*0.045;
          const tipA = [dcx + ux*len, dcy + uy*len];
          const tipB = [dcx - ux*len, dcy - uy*len];
          const sidL = [dcx + px*wid, dcy + py*wid];
          const sidR = [dcx - px*wid, dcy - py*wid];
          const pts = tipA[0].toFixed(1)+','+tipA[1].toFixed(1)+' '+sidL[0].toFixed(1)+','+sidL[1].toFixed(1)+' '+tipB[0].toFixed(1)+','+tipB[1].toFixed(1)+' '+sidR[0].toFixed(1)+','+sidR[1].toFixed(1);
          art += '<polygon points="'+pts+'" fill="'+e.m+'" fill-opacity=".55" stroke="'+e.b+'" stroke-width="'+(0.7*sc)+'" opacity=".85"/>';
          // terminal bright dot at the outer end of the diagonal
          art += '<circle cx="'+(cx+ux*r*0.99).toFixed(1)+'" cy="'+(cy+uy*r*0.99).toFixed(1)+'" r="'+(1.3*sc)+'" fill="'+e.b+'" opacity=".65"/>';
        }

        // Sparkle motes
        const sparks = [
          [0.30,-0.28],[0.28,0.32],[-0.35,0.22],[-0.28,-0.32],
          [0.95,0.42],[-0.95,0.40],[0.42,0.92],[-0.45,-0.92],
          [0.62,-0.10],[-0.62,0.12],[0.10,-0.64],[-0.12,0.66],
          [0.78,-0.50],[-0.78,0.52],[0.50,0.78],[-0.50,-0.78]
        ];
        sparks.forEach(([dx,dy])=>{
          art += '<circle cx="'+(cx+dx*r).toFixed(1)+'" cy="'+(cy+dy*r).toFixed(1)+'" r="'+(0.9*sc)+'" fill="'+e.b+'" opacity=".62"/>';
        });
      }
            else if (elem === 'void'){
        // Faint outer rings
        art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*1.14).toFixed(1)+'" fill="none" stroke="'+e.dim+'" stroke-width="'+(1.0*sc)+'" opacity=".70"/>';
        art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.96).toFixed(1)+'" fill="none" stroke="'+e.m+'" stroke-width="'+(0.55*sc)+'" opacity=".38"/>';

        // Galaxy spiral arms — 5 arms, each rendered as 3 nested polylines
        // (thick inner highlight + medium body + faint outer trail) sweeping
        // from near the central medallion out to the rim. Each arm does more
        // than one full revolution so plenty of lines emanate from the centre.
        const ARMS = 5;
        for (let arm = 0; arm < ARMS; arm++){
          const base = arm * (Math.PI*2/ARMS);
          // Inner bright curve (primary)
          const ptsI = [];
          for (let i = 0; i <= 48; i++){
            const t = i/48;
            const ang = base + t * Math.PI * 2.15;
            const rad = r * (0.18 + t * 0.80);
            ptsI.push((cx+Math.cos(ang)*rad).toFixed(1)+','+(cy+Math.sin(ang)*rad).toFixed(1));
          }
          art += '<polyline points="'+ptsI.join(' ')+'" fill="none" stroke="'+e.b+'" stroke-width="'+(2.1*sc)+'" stroke-linecap="round" opacity=".92"/>';

          // Body curve (offset, medium weight)
          const ptsB = [];
          for (let i = 0; i <= 48; i++){
            const t = i/48;
            const ang = base - 0.18 + t * Math.PI * 2.05;
            const rad = r * (0.20 + t * 0.74);
            ptsB.push((cx+Math.cos(ang)*rad).toFixed(1)+','+(cy+Math.sin(ang)*rad).toFixed(1));
          }
          art += '<polyline points="'+ptsB.join(' ')+'" fill="none" stroke="'+e.m+'" stroke-width="'+(1.25*sc)+'" stroke-linecap="round" opacity=".70"/>';

          // Outer ghost trail (dim, wider sweep)
          const ptsT = [];
          for (let i = 0; i <= 48; i++){
            const t = i/48;
            const ang = base + 0.34 + t * Math.PI * 1.95;
            const rad = r * (0.24 + t * 0.70);
            ptsT.push((cx+Math.cos(ang)*rad).toFixed(1)+','+(cy+Math.sin(ang)*rad).toFixed(1));
          }
          art += '<polyline points="'+ptsT.join(' ')+'" fill="none" stroke="'+e.m+'" stroke-width="'+(0.75*sc)+'" stroke-linecap="round" opacity=".42"/>';
        }

        // Tight inner spiral wisps — short lines emanating from the centre
        // to reinforce the "spiralling out of the core" read.
        for (let arm = 0; arm < ARMS; arm++){
          const base = arm * (Math.PI*2/ARMS) + Math.PI/ARMS;
          const ptsW = [];
          for (let i = 0; i <= 20; i++){
            const t = i/20;
            const ang = base + t * Math.PI * 1.1;
            const rad = r * (0.16 + t * 0.24);
            ptsW.push((cx+Math.cos(ang)*rad).toFixed(1)+','+(cy+Math.sin(ang)*rad).toFixed(1));
          }
          art += '<polyline points="'+ptsW.join(' ')+'" fill="none" stroke="'+e.b+'" stroke-width="'+(0.95*sc)+'" stroke-linecap="round" opacity=".58"/>';
        }

        // Cardinal diamond-tip star-points
        const cardFourV = [[0,-1],[1,0],[0,1],[-1,0]];
        cardFourV.forEach(([dx,dy])=>{
          const tipX = cx + dx*r*1.16, tipY = cy + dy*r*1.16;
          const basX = cx + dx*r*0.82, basY = cy + dy*r*0.82;
          const mx = (tipX+basX)/2, my = (tipY+basY)/2;
          const px = -dy, py = dx;
          const w = r*0.07;
          const pts =
            tipX.toFixed(1)+','+tipY.toFixed(1)+' '+
            (mx+px*w).toFixed(1)+','+(my+py*w).toFixed(1)+' '+
            basX.toFixed(1)+','+basY.toFixed(1)+' '+
            (mx-px*w).toFixed(1)+','+(my-py*w).toFixed(1);
          art += '<polygon points="'+pts+'" fill="'+e.b+'" fill-opacity=".82" stroke="'+e.b+'" stroke-width="'+(0.55*sc)+'"/>';
        });

        // Scattered stars
        const stars = [
          [0.22,-0.82,1.1],[0.72,-0.52,0.9],[0.92,0.08,1.0],[0.80,0.54,0.9],
          [0.34,0.88,1.0],[-0.38,0.86,0.9],[-0.88,0.38,0.9],[-0.96,-0.18,1.0],
          [-0.72,-0.58,0.9],[-0.22,-0.92,1.0],
          [0.56,-0.28,0.7],[-0.32,0.46,0.7],[0.28,0.22,0.6],[-0.48,-0.24,0.7]
        ];
        stars.forEach(([dx,dy,rs])=>{
          art += '<circle cx="'+(cx+dx*r).toFixed(1)+'" cy="'+(cy+dy*r).toFixed(1)+'" r="'+(rs*sc)+'" fill="'+e.b+'" opacity=".58"/>';
        });
      }
      else if (elem === 'flux'){
        // Flux: contained wave emblem.
        // Top/bottom bands use two boundary functions with shared endpoints:
        // y=(1-x^2)*(1+cos(7x)) and y=(1-x^2)*(0.5+cos(7x)).
        // The span is deliberately contained so it does not interact with the beacon.

        const ringR = r * 0.56;
        const bandHalfW = r * 1.04;
        const leftX = cx - bandHalfW;
        const rightX = cx + bandHalfW;
        const topBaseY = cy - r * 0.34;
        const botBaseY = cy + r * 0.34;

        const waveOuter = x => (1 - x*x) * (1 + Math.cos(7*x));
        const waveInner = x => (1 - x*x) * (0.5 + Math.cos(7*x));
        const waveScale = r * 0.255;

        const toPts = pts => pts
          .map(([px, py]) => px.toFixed(1) + ',' + py.toFixed(1))
          .join(' ');

        const closedBandPath = (outerPts, innerPts) => {
          let d = 'M ' + outerPts[0][0].toFixed(1) + ',' + outerPts[0][1].toFixed(1);

          for (let i = 1; i < outerPts.length; i++) {
            d += ' L ' + outerPts[i][0].toFixed(1) + ',' + outerPts[i][1].toFixed(1);
          }

          for (let i = innerPts.length - 1; i >= 0; i--) {
            d += ' L ' + innerPts[i][0].toFixed(1) + ',' + innerPts[i][1].toFixed(1);
          }

          d += ' Z';
          return d;
        };

        const buildWaveBand = (sign) => {
          const outerPts = [];
          const innerPts = [];
          const N = 104;

          for (let i = 0; i <= N; i++) {
            const xn = -1 + 2 * i / N;
            const px = cx + xn * bandHalfW;

            const yo = waveOuter(xn);
            const yi = waveInner(xn);

            const outerY = sign < 0
              ? topBaseY - yo * waveScale
              : botBaseY + yo * waveScale;

            const innerY = sign < 0
              ? topBaseY - yi * waveScale
              : botBaseY + yi * waveScale;

            outerPts.push([px, outerY]);
            innerPts.push([px, innerY]);
          }

          return {
            outerPts,
            innerPts,
            outerPoly: toPts(outerPts),
            innerPoly: toPts(innerPts),
            fillD: closedBandPath(outerPts, innerPts)
          };
        };

        // Subtle background contour waves, contained within the emblem span.
        const contourPath = (baseY, amp, phase) => {
          const pts = [];
          const N = 84;

          for (let i = 0; i <= N; i++) {
            const xn = -1.00 + 2.00 * i / N;
            const px = cx + xn * bandHalfW;

            const env = Math.max(
              0,
              1 - Math.min(1.18, Math.abs(xn)) ** 2 / 1.35
            );

            const py = baseY + Math.sin(3.0 * xn + phase) * amp * env;
            pts.push([px, py]);
          }

          return toPts(pts);
        };

        for (let i = -8; i <= 8; i++) {
          if (Math.abs(i) <= 1) continue;

          const py = cy + i * r * 0.15;
          const amp = r * (0.025 + 0.004 * Math.max(0, 5 - Math.abs(i)));
          const phase = i * 0.41;

          art += '<polyline points="' + contourPath(py, amp, phase) + '" ' +
            'fill="none" stroke="' + e.m + '" ' +
            'stroke-width="' + ((Math.abs(i) < 4 ? 0.65 : 0.5) * sc) + '" ' +
            'stroke-linecap="round" ' +
            'opacity="' + (Math.abs(i) < 4 ? '.16' : '.11') + '"/>';
        }

        for (let i = -7; i <= 7; i += 2) {
          const py = cy + i * r * 0.13;
          const amp = r * (0.016 + 0.003 * (7 - Math.abs(i)));
          const phase = i * -0.34;

          art += '<polyline points="' + contourPath(py, amp, phase) + '" ' +
            'fill="none" stroke="' + e.b + '" ' +
            'stroke-width="' + (0.34 * sc) + '" ' +
            'stroke-linecap="round" opacity=".08"/>';
        }

        const topBand = buildWaveBand(-1);
        const botBand = buildWaveBand(+1);

        const renderBand = (band) => {
          art += '<path d="' + band.fillD + '" fill="' + e.b + '" fill-opacity=".20"/>';

          art += '<polyline points="' + band.outerPoly + '" ' +
            'fill="none" stroke="' + e.b + '" ' +
            'stroke-width="' + (2.65 * sc) + '" ' +
            'stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>';

          art += '<polyline points="' + band.innerPoly + '" ' +
            'fill="none" stroke="' + e.b + '" ' +
            'stroke-width="' + (2.05 * sc) + '" ' +
            'stroke-linecap="round" stroke-linejoin="round" opacity=".78"/>';

          art += '<polyline points="' + band.outerPoly + '" ' +
            'fill="none" stroke="' + e.m + '" ' +
            'stroke-width="' + (0.82 * sc) + '" ' +
            'stroke-linecap="round" stroke-linejoin="round" opacity=".34"/>';
        };

        renderBand(topBand);
        renderBand(botBand);

        // Two near-circle streamlines, replacing the previous side curls.
        const nearCircleLine = (sign) => {
          const yEdge = cy + sign * r * 0.12;
          const yLift = cy + sign * (ringR + r * 0.11);

          let d = 'M ' + leftX.toFixed(1) + ',' + yEdge.toFixed(1);

          d += ' C ' + (cx - r * 0.92).toFixed(1) + ',' + yEdge.toFixed(1) +
            ' ' + (cx - r * 0.78).toFixed(1) + ',' + (cy + sign * r * 0.52).toFixed(1) +
            ' ' + cx.toFixed(1) + ',' + yLift.toFixed(1);

          d += ' C ' + (cx + r * 0.78).toFixed(1) + ',' + (cy + sign * r * 0.52).toFixed(1) +
            ' ' + (cx + r * 0.92).toFixed(1) + ',' + yEdge.toFixed(1) +
            ' ' + rightX.toFixed(1) + ',' + yEdge.toFixed(1);

          return d;
        };

        const addNearLine = d => {
          art += '<path d="' + d + '" fill="none" stroke="' + e.b + '" ' +
            'stroke-width="' + (2.05 * sc) + '" stroke-linecap="round" opacity=".82"/>';

          art += '<path d="' + d + '" fill="none" stroke="' + e.m + '" ' +
            'stroke-width="' + (0.72 * sc) + '" stroke-linecap="round" opacity=".28"/>';
        };

        addNearLine(nearCircleLine(-1));
        addNearLine(nearCircleLine(+1));

        // Dominant aperture ring.
        art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + ringR.toFixed(1) + '" ' +
          'fill="none" stroke="' + e.b + '" stroke-width="' + (3.0 * sc) + '" opacity=".96"/>';

        art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (ringR * 0.985).toFixed(1) + '" ' +
          'fill="none" stroke="' + e.b + '" stroke-width="' + (1.2 * sc) + '" opacity=".40"/>';

        art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (ringR * 1.02).toFixed(1) + '" ' +
          'fill="none" stroke="' + e.m + '" stroke-width="' + (0.9 * sc) + '" opacity=".38"/>';

        // Sparse symmetric motes.
        [-1, +1].forEach(sx => {
          [-1, +1].forEach(sy => {
            [
              [0.88, 0.86, 0.55],
              [0.62, 0.56, 0.65],
              [0.28, 0.92, 0.45],
              [0.12, 0.70, 0.42],
              [1.04, 0.52, 0.45]
            ].forEach(([dx, dy, rs]) => {
              art += '<circle cx="' + (cx + sx * dx * r).toFixed(1) +
                '" cy="' + (cy + sy * dy * r).toFixed(1) +
                '" r="' + (rs * sc) +
                '" fill="' + e.b + '" opacity=".34"/>';
            });
          });
        });
      }
      else if (elem === 'aether'){
        // Hexagon (pointy-top) vertices
        const hexR = r * 0.90;
        const innerR = hexR * 0.56;
        const verts = [];
        for (let i = 0; i < 6; i++){
          const a = -Math.PI/2 + i*Math.PI/3;
          verts.push([cx + Math.cos(a)*hexR, cy + Math.sin(a)*hexR]);
        }
        // Faint background ring
        art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*1.06).toFixed(1)+'" fill="none" stroke="'+e.dim+'" stroke-width="'+(0.7*sc)+'" opacity=".36"/>';
        art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.92).toFixed(1)+'" fill="none" stroke="'+e.m+'" stroke-width="'+(0.5*sc)+'" opacity=".25"/>';

        // Outer hexagon
        art += '<polygon points="'+verts.map(p => p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')+'" fill="none" stroke="'+e.b+'" stroke-width="'+(1.5*sc)+'" opacity=".88"/>';

        // All 9 non-adjacent diagonals (hexagram pattern + 3 diameters)
        for (let i = 0; i < 6; i++){
          for (let j = i+2; j < 6 && (j-i) < 5; j++){
            const p1 = verts[i], p2 = verts[j];
            const isDiam = (j-i) === 3;
            const sw = isDiam ? 1.15*sc : 0.85*sc;
            const op = isDiam ? 0.78   : 0.52;
            art += '<line x1="'+p1[0].toFixed(1)+'" y1="'+p1[1].toFixed(1)+'" x2="'+p2[0].toFixed(1)+'" y2="'+p2[1].toFixed(1)+'" stroke="'+e.m+'" stroke-width="'+sw+'" opacity="'+op+'"/>';
          }
        }

        // Inner nested hexagon (same orientation, scaled)
        const inV = verts.map(([x,y])=>[cx + (x-cx)*0.58, cy + (y-cy)*0.58]);
        art += '<polygon points="'+inV.map(p => p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')+'" fill="none" stroke="'+e.b+'" stroke-width="'+(1.0*sc)+'" opacity=".55"/>';

        // Diamond-arrow spike tips protruding from each vertex outward
        verts.forEach(([x,y], i)=>{
          const a = -Math.PI/2 + i*Math.PI/3;
          const ux = Math.cos(a), uy = Math.sin(a);
          const px = -uy, py = ux;
          const tipLen = r * 0.22;
          const tipWid = r * 0.065;
          const tipX = cx + ux*(hexR + tipLen);
          const tipY = cy + uy*(hexR + tipLen);
          const basX = cx + ux*(hexR - tipLen*0.18);
          const basY = cy + uy*(hexR - tipLen*0.18);
          const mx = cx + ux*(hexR + tipLen*0.38);
          const my = cy + uy*(hexR + tipLen*0.38);
          const pts =
            basX.toFixed(1)+','+basY.toFixed(1)+' '+
            (mx+px*tipWid).toFixed(1)+','+(my+py*tipWid).toFixed(1)+' '+
            tipX.toFixed(1)+','+tipY.toFixed(1)+' '+
            (mx-px*tipWid).toFixed(1)+','+(my-py*tipWid).toFixed(1);
          art += '<polygon points="'+pts+'" fill="'+e.b+'" fill-opacity=".62" stroke="'+e.b+'" stroke-width="'+(0.7*sc)+'"/>';
        });

        // Vertex orbs (ruby cabochons)
        verts.forEach(([x,y])=>{
          art += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(4.0*sc)+'" fill="'+e.bg2+'" stroke="'+e.b+'" stroke-width="'+(1.2*sc)+'"/>';
          art += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(2.3*sc)+'" fill="'+e.b+'" opacity=".78"/>';
          art += '<circle cx="'+(x-1.0*sc).toFixed(1)+'" cy="'+(y-1.0*sc).toFixed(1)+'" r="'+(0.8*sc)+'" fill="#ffffff" opacity=".35"/>';
        });

        // Intermediate nodes at midpoints of inner hexagon edges (small orbs)
        for (let i = 0; i < 6; i++){
          const x = (inV[i][0] + inV[(i+1)%6][0]) / 2;
          const y = (inV[i][1] + inV[(i+1)%6][1]) / 2;
          art += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(1.8*sc)+'" fill="'+e.b+'" opacity=".72"/>';
        }

        // A few stipple sparkles in the corners
        const aetherSparks = [
          [0.95,-0.92,0.7],[-0.95,-0.92,0.7],[0.95,0.92,0.7],[-0.95,0.92,0.7],
          [0.45,-1.08,0.6],[-0.45,-1.08,0.6],[0.45,1.08,0.6],[-0.45,1.08,0.6]
        ];
        aetherSparks.forEach(([dx,dy,rs])=>{
          art += '<circle cx="'+(cx+dx*r).toFixed(1)+'" cy="'+(cy+dy*r).toFixed(1)+'" r="'+(rs*sc)+'" fill="'+e.b+'" opacity=".55"/>';
        });
      }

      // Clear numeral medallion (matches relic/glyph treatment)
      art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(medR*1.22).toFixed(1)+'" fill="'+e.bg2+'" fill-opacity=".985"/>';
      art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(medR*1.22).toFixed(1)+'" fill="none" stroke="'+e.b+'" stroke-width="'+(1.15*sc)+'" opacity=".75"/>';
      art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(medR*1.38).toFixed(1)+'" fill="none" stroke="'+e.m+'" stroke-width="'+(0.7*sc)+'" opacity=".42"/>';

      return art;
    };

  // Echo palette (fifth current - not in EL)
  const ECHO = {
    b: '#c8d4e8', m: '#7a8aaa', dim: '#181e2c',
    bg1: '#070810', bg2: '#080910', border: '#3a4460', name: 'ECHO'
  };

  function circleIntersect(ax, ay, ra, bx, by, rb){
    var dx = bx-ax, dy = by-ay, d = Math.sqrt(dx*dx+dy*dy);
    if (d > ra+rb || d < Math.abs(ra-rb) || d === 0) return [];
    var a = (ra*ra - rb*rb + d*d)/(2*d);
    var h = Math.sqrt(Math.max(0, ra*ra - a*a));
    var mx = ax+a*dx/d, my = ay+a*dy/d;
    var px = h*dy/d, py = -h*dx/d;
    return [[mx+px, my+py],[mx-px, my-py]];
  }

  var renderEcho = function(elem, cx, cy, artR, e, meta){
    meta = meta || {};
    var sc = (meta && meta.sc) ? meta.sc : 1;
    var r  = artR;
    var p  = ECHO;
    var art = '';

    // Containment ring
    art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+p.dim+'" stroke-width="'+(r*0.16)+'" opacity="0.93"/>';
    art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+p.m+'" stroke-width="'+(0.9*sc)+'" opacity="0.50"/>';

    var flankOffset = r * 0.38;
    var lx = cx - flankOffset, rx2 = cx + flankOffset;
    var fR1 = r*0.50, fR2 = r*0.32, fR3 = r*0.16;
    var cR1 = r*0.58, cR2 = r*0.40;

    // Ghost centre
    art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+cR1+'" fill="none" stroke="'+p.b+'" stroke-width="'+(1.0*sc)+'" opacity="0.20"/>';
    art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+cR2+'" fill="none" stroke="'+p.b+'" stroke-width="'+(0.75*sc)+'" opacity="0.15"/>';

    // Left flank (bright)
    art += '<circle cx="'+lx+'" cy="'+cy+'" r="'+fR1+'" fill="none" stroke="'+p.b+'" stroke-width="'+(1.6*sc)+'" opacity="0.68"/>';
    art += '<circle cx="'+lx+'" cy="'+cy+'" r="'+fR2+'" fill="none" stroke="'+p.b+'" stroke-width="'+(1.2*sc)+'" opacity="0.50"/>';
    art += '<circle cx="'+lx+'" cy="'+cy+'" r="'+fR3+'" fill="none" stroke="'+p.b+'" stroke-width="'+(0.85*sc)+'" opacity="0.34"/>';

    // Right flank (bright)
    art += '<circle cx="'+rx2+'" cy="'+cy+'" r="'+fR1+'" fill="none" stroke="'+p.b+'" stroke-width="'+(1.6*sc)+'" opacity="0.68"/>';
    art += '<circle cx="'+rx2+'" cy="'+cy+'" r="'+fR2+'" fill="none" stroke="'+p.b+'" stroke-width="'+(1.2*sc)+'" opacity="0.50"/>';
    art += '<circle cx="'+rx2+'" cy="'+cy+'" r="'+fR3+'" fill="none" stroke="'+p.b+'" stroke-width="'+(0.85*sc)+'" opacity="0.34"/>';

    // Phase-crossing nodes (flank outer intersect centre mid)
    var nodes = circleIntersect(lx, cy, fR1, cx, cy, cR2).concat(
                circleIntersect(rx2, cy, fR1, cx, cy, cR2));
    nodes.forEach(function(n){
      art += '<circle cx="'+n[0].toFixed(2)+'" cy="'+n[1].toFixed(2)+'" r="'+(2.1*sc)+'" fill="'+p.b+'" opacity="0.65"/>';
    });

    // Flank origin marks
    art += '<circle cx="'+lx+'" cy="'+cy+'" r="'+(2.8*sc)+'" fill="'+p.b+'" opacity="0.72"/>';
    art += '<circle cx="'+rx2+'" cy="'+cy+'" r="'+(2.8*sc)+'" fill="'+p.b+'" opacity="0.72"/>';

    // Centre medallion for numeral
    art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.26)+'" fill="'+p.bg1+'"/>';
    art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.26)+'" fill="none" stroke="'+p.m+'" stroke-width="'+(0.7*sc)+'" opacity="0.30"/>';

    return art;
  };

  AA['mixed'] = {
    name: 'Mixed',
    notes: 'Radiance: ritual - Void: sigil - Flux: emblem - Aether: emblem - Echo: ring clusters',
    render: function(elem, cx, cy, artR, e, meta){
      if (elem === 'radiance') return renderRitual(elem, cx, cy, artR, e, meta);
      if (elem === 'void')     return renderSigil(elem, cx, cy, artR, e, meta);
      if (elem === 'flux')     return renderEmblem(elem, cx, cy, artR, e, meta);
      if (elem === 'aether')   return renderEmblem(elem, cx, cy, artR, e, meta);
      if (elem === 'echo')     return renderEcho(elem, cx, cy, artR, e, meta);

      // Keep the previous default behaviour: unknown elements fall back to sigil.
      return renderSigil(elem, cx, cy, artR, e, meta);
    }
  };
})();
