// art/emblem.js
// Emblem
// Vector reproduction of the relic art. Scales cleanly unlike the JPEG version.
(function(){
  const AA = window.AA_ART = window.AA_ART || {};
  AA['emblem'] = {
    name: 'Emblem',
    notes: 'Vector reproduction of the relic art. Scales cleanly unlike the JPEG version.',
    render: function(elem, cx, cy, artR, e, meta){
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
        // Flux: broad top/bottom oscillation bands plus two near-circle
        // streamlines, closer to the fluid-flow reference and less like
        // decorative side curls.
        const ringR = r * 0.56;
        const bandHalfW = r * 1.58;
        const leftX = cx - bandHalfW;
        const rightX = cx + bandHalfW;
        const topBaseY = cy - r * 0.34;
        const botBaseY = cy + r * 0.34;

        const waveOuter = x => (1 - x*x) * (1 + Math.cos(7*x));
        const waveInner = x => (1 - x*x) * (0.5 + Math.cos(7*x));
        const waveScale = r * 0.255;

        const toPts = pts => pts.map(([px,py]) => px.toFixed(1)+','+py.toFixed(1)).join(' ');
        const closedBandPath = (outerPts, innerPts) => {
          let d = 'M '+outerPts[0][0].toFixed(1)+','+outerPts[0][1].toFixed(1);
          for (let i = 1; i < outerPts.length; i++) d += ' L '+outerPts[i][0].toFixed(1)+','+outerPts[i][1].toFixed(1);
          for (let i = innerPts.length - 1; i >= 0; i--) d += ' L '+innerPts[i][0].toFixed(1)+','+innerPts[i][1].toFixed(1);
          d += ' Z';
          return d;
        };
        const buildWaveBand = (sign) => {
          const outerPts = [], innerPts = [];
          const N = 104;
          for (let i = 0; i <= N; i++){
            const xn = -1 + 2 * i / N;
            const px = cx + xn * bandHalfW;
            const yo = waveOuter(xn);
            const yi = waveInner(xn);
            const outerY = sign < 0 ? topBaseY - yo * waveScale : botBaseY + yo * waveScale;
            const innerY = sign < 0 ? topBaseY - yi * waveScale : botBaseY + yi * waveScale;
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

        // Atmospheric contour field behind the main bands.
        const contourPath = (baseY, amp, phase) => {
          const pts = [];
          const N = 84;
          for (let i = 0; i <= N; i++){
            const xn = -1.22 + 2.44 * i / N;
            const px = cx + xn * bandHalfW;
            const env = Math.max(0, 1 - Math.min(1.18, Math.abs(xn))**2 / 1.35);
            const py = baseY + Math.sin(3.0*xn + phase) * amp * env;
            pts.push([px, py]);
          }
          return toPts(pts);
        };
        for (let i = -8; i <= 8; i++){
          if (Math.abs(i) <= 1) continue;
          const py = cy + i * r * 0.15;
          const amp = r * (0.025 + 0.004 * Math.max(0, 5 - Math.abs(i)));
          const phase = i * 0.41;
          art += '<polyline points="'+contourPath(py, amp, phase)+'" fill="none" stroke="'+e.m+'" stroke-width="'+((Math.abs(i) < 4 ? 0.65 : 0.5)*sc)+'" stroke-linecap="round" opacity="'+(Math.abs(i) < 4 ? '.16' : '.11')+'"/>';
        }
        for (let i = -7; i <= 7; i += 2){
          const py = cy + i * r * 0.13;
          const amp = r * (0.016 + 0.003 * (7 - Math.abs(i)));
          const phase = i * -0.34;
          art += '<polyline points="'+contourPath(py, amp, phase)+'" fill="none" stroke="'+e.b+'" stroke-width="'+(0.34*sc)+'" stroke-linecap="round" opacity=".08"/>';
        }

        // Main top and bottom bands from the user-suggested boundary functions.
        // Wider horizontal span keeps them clear of the central aperture.
        const topBand = buildWaveBand(-1);
        const botBand = buildWaveBand(+1);
        const renderBand = (band) => {
          art += '<path d="'+band.fillD+'" fill="'+e.b+'" fill-opacity=".20"/>';
          art += '<polyline points="'+band.outerPoly+'" fill="none" stroke="'+e.b+'" stroke-width="'+(2.65*sc)+'" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>';
          art += '<polyline points="'+band.innerPoly+'" fill="none" stroke="'+e.b+'" stroke-width="'+(2.05*sc)+'" stroke-linecap="round" stroke-linejoin="round" opacity=".78"/>';
          art += '<polyline points="'+band.outerPoly+'" fill="none" stroke="'+e.m+'" stroke-width="'+(0.82*sc)+'" stroke-linecap="round" stroke-linejoin="round" opacity=".34"/>';
        };
        renderBand(topBand);
        renderBand(botBand);

        // Replace the old side curls with just the two streamlines nearest the
        // circle, inspired by flow around a cylinder.
        const nearCircleLine = (sign) => {
          const yEdge = cy + sign * r * 0.12;
          const yLift = cy + sign * (ringR + r * 0.11);
          let d = 'M '+leftX.toFixed(1)+','+yEdge.toFixed(1);
          d += ' C '+(cx-r*1.22).toFixed(1)+','+yEdge.toFixed(1)+
               ' '  +(cx-r*0.96).toFixed(1)+','+(cy+sign*r*0.52).toFixed(1)+
               ' '  +cx.toFixed(1)+','+yLift.toFixed(1);
          d += ' C '+(cx+r*0.96).toFixed(1)+','+(cy+sign*r*0.52).toFixed(1)+
               ' '  +(cx+r*1.22).toFixed(1)+','+yEdge.toFixed(1)+
               ' '  +rightX.toFixed(1)+','+yEdge.toFixed(1);
          return d;
        };
        const addNearLine = d => {
          art += '<path d="'+d+'" fill="none" stroke="'+e.b+'" stroke-width="'+(2.05*sc)+'" stroke-linecap="round" opacity=".82"/>';
          art += '<path d="'+d+'" fill="none" stroke="'+e.m+'" stroke-width="'+(0.72*sc)+'" stroke-linecap="round" opacity=".28"/>';
        };
        addNearLine(nearCircleLine(-1));
        addNearLine(nearCircleLine(+1));

        // Dominant aperture ring.
        art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+ringR.toFixed(1)+'" fill="none" stroke="'+e.b+'" stroke-width="'+(3.0*sc)+'" opacity=".96"/>';
        art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(ringR*0.985).toFixed(1)+'" fill="none" stroke="'+e.b+'" stroke-width="'+(1.2*sc)+'" opacity=".40"/>';
        art += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(ringR*1.02).toFixed(1)+'" fill="none" stroke="'+e.m+'" stroke-width="'+(0.9*sc)+'" opacity=".38"/>';

        // Sparse symmetric motes.
        [-1, +1].forEach(sx=>{
          [-1, +1].forEach(sy=>{
            [[0.88,0.86,0.55],[0.62,0.56,0.65],[0.28,0.92,0.45],[0.12,0.70,0.42],[1.04,0.52,0.45]].forEach(([dx,dy,rs])=>{
              art += '<circle cx="'+(cx+sx*dx*r).toFixed(1)+'" cy="'+(cy+sy*dy*r).toFixed(1)+'" r="'+(rs*sc)+'" fill="'+e.b+'" opacity=".34"/>';
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
    }
  };
})();
