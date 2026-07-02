/* @ds-bundle: {"format":3,"namespace":"ArchmageAscensionDesignSystem_a4cf91","components":[{"name":"Card","sourcePath":"ui_kits/card-game/Card.jsx"},{"name":"Controls","sourcePath":"ui_kits/card-game/Controls.jsx"},{"name":"Hand","sourcePath":"ui_kits/card-game/Hand.jsx"},{"name":"PlayTable","sourcePath":"ui_kits/card-game/PlayTable.jsx"},{"name":"SpellStage","sourcePath":"ui_kits/card-game/SpellStage.jsx"}],"sourceHashes":{"art/emblem.js":"7953a2115f01","art/mystic.js":"0c595f4ce8fe","art/relic.js":"dbd61ea9bf42","art/ritual.js":"387370054c3c","art/runic.js":"71d4459674b9","art/sigil.js":"b79e075164b2","connectors/beacon.js":"b84e35f91aff","connectors/bloom-soft.js":"bcc07c66c6cb","connectors/celestial.js":"a6656ccec60d","connectors/notch.js":"408626878865","connectors/parallelogram.js":"e2a71cf7d35d","connectors/serpent.js":"c1473b0d8c8f","connectors/triangle.js":"9b675a0c3dcb","lib/cards.js":"9531f9c8ae64","ui_kits/card-game/Card.jsx":"59c5f3bc9b72","ui_kits/card-game/Controls.jsx":"217e63ece629","ui_kits/card-game/Hand.jsx":"e39aade29e1b","ui_kits/card-game/PlayTable.jsx":"cddf84559f85","ui_kits/card-game/SpellStage.jsx":"1fc1167073cd"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ArchmageAscensionDesignSystem_a4cf91 = window.ArchmageAscensionDesignSystem_a4cf91 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// art/emblem.js
try { (() => {
// art/emblem.js
// Emblem
// Vector reproduction of the relic art. Scales cleanly unlike the JPEG version.
(function () {
  const AA = window.AA_ART = window.AA_ART || {};
  AA['emblem'] = {
    name: 'Emblem',
    notes: 'Vector reproduction of the relic art. Scales cleanly unlike the JPEG version.',
    render: function (elem, cx, cy, artR, e, meta) {
      meta = meta || {};
      const sc = meta.sc || 1;
      const medR = artR * 0.285;
      const r = artR;
      let art = '';
      if (elem === 'radiance') {
        // Concentric halo rings — gives the gold "frame of light" feeling
        art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 1.14).toFixed(1) + '" fill="none" stroke="' + e.dim + '" stroke-width="' + 1.0 * sc + '" opacity=".68"/>';
        art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.98).toFixed(1) + '" fill="none" stroke="' + e.m + '" stroke-width="' + 1.3 * sc + '" opacity=".85"/>';
        art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.82).toFixed(1) + '" fill="none" stroke="' + e.m + '" stroke-width="' + 0.7 * sc + '" opacity=".42"/>';
        art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.58).toFixed(1) + '" fill="none" stroke="' + e.b + '" stroke-width="' + 0.9 * sc + '" opacity=".50"/>';
        art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.44).toFixed(1) + '" fill="none" stroke="' + e.m + '" stroke-width="' + 0.6 * sc + '" opacity=".32"/>';

        // 32 rays, layered by cardinal/diagonal/tertiary
        for (let i = 0; i < 32; i++) {
          const a = i * Math.PI * 2 / 32;
          const cardinal = i % 8 === 0;
          const diag = i % 4 === 0 && !cardinal;
          const rb = r * 0.46;
          const rt = cardinal ? r * 1.26 : diag ? r * 1.04 : r * 0.90;
          const sw = cardinal ? 1.55 : diag ? 0.95 : 0.55;
          const op = cardinal ? 0.90 : diag ? 0.58 : 0.30;
          const x1 = cx + Math.cos(a) * rb,
            y1 = cy + Math.sin(a) * rb;
          const x2 = cx + Math.cos(a) * rt,
            y2 = cy + Math.sin(a) * rt;
          art += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + e.b + '" stroke-width="' + sw * sc + '" stroke-linecap="round" opacity="' + op + '"/>';
        }

        // 4 elongated diamond-point stars at cardinals (N, E, S, W)
        const cardFourR = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        cardFourR.forEach(([dx, dy]) => {
          const tipX = cx + dx * r * 1.22,
            tipY = cy + dy * r * 1.22;
          const basX = cx + dx * r * 0.82,
            basY = cy + dy * r * 0.82;
          const mx = (tipX + basX) / 2,
            my = (tipY + basY) / 2;
          const px = -dy,
            py = dx;
          const w = r * 0.10;
          const pts = tipX.toFixed(1) + ',' + tipY.toFixed(1) + ' ' + (mx + px * w).toFixed(1) + ',' + (my + py * w).toFixed(1) + ' ' + basX.toFixed(1) + ',' + basY.toFixed(1) + ' ' + (mx - px * w).toFixed(1) + ',' + (my - py * w).toFixed(1);
          art += '<polygon points="' + pts + '" fill="' + e.b + '" fill-opacity=".86" stroke="' + e.b + '" stroke-width="' + 0.6 * sc + '"/>';
          // little central highlight on each tip
          art += '<circle cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="' + 1.4 * sc + '" fill="' + e.b + '" opacity=".85"/>';
        });

        // Diagonal ornamental lozenges (little bright gems between cardinals)
        for (let i = 0; i < 4; i++) {
          const a = Math.PI / 4 + i * Math.PI / 2;
          const ux = Math.cos(a),
            uy = Math.sin(a);
          const px = -uy,
            py = ux;
          // small diamond-lozenge between the cardinals at mid-radius
          const dcx = cx + ux * r * 0.82,
            dcy = cy + uy * r * 0.82;
          const len = r * 0.11,
            wid = r * 0.045;
          const tipA = [dcx + ux * len, dcy + uy * len];
          const tipB = [dcx - ux * len, dcy - uy * len];
          const sidL = [dcx + px * wid, dcy + py * wid];
          const sidR = [dcx - px * wid, dcy - py * wid];
          const pts = tipA[0].toFixed(1) + ',' + tipA[1].toFixed(1) + ' ' + sidL[0].toFixed(1) + ',' + sidL[1].toFixed(1) + ' ' + tipB[0].toFixed(1) + ',' + tipB[1].toFixed(1) + ' ' + sidR[0].toFixed(1) + ',' + sidR[1].toFixed(1);
          art += '<polygon points="' + pts + '" fill="' + e.m + '" fill-opacity=".55" stroke="' + e.b + '" stroke-width="' + 0.7 * sc + '" opacity=".85"/>';
          // terminal bright dot at the outer end of the diagonal
          art += '<circle cx="' + (cx + ux * r * 0.99).toFixed(1) + '" cy="' + (cy + uy * r * 0.99).toFixed(1) + '" r="' + 1.3 * sc + '" fill="' + e.b + '" opacity=".65"/>';
        }

        // Sparkle motes
        const sparks = [[0.30, -0.28], [0.28, 0.32], [-0.35, 0.22], [-0.28, -0.32], [0.95, 0.42], [-0.95, 0.40], [0.42, 0.92], [-0.45, -0.92], [0.62, -0.10], [-0.62, 0.12], [0.10, -0.64], [-0.12, 0.66], [0.78, -0.50], [-0.78, 0.52], [0.50, 0.78], [-0.50, -0.78]];
        sparks.forEach(([dx, dy]) => {
          art += '<circle cx="' + (cx + dx * r).toFixed(1) + '" cy="' + (cy + dy * r).toFixed(1) + '" r="' + 0.9 * sc + '" fill="' + e.b + '" opacity=".62"/>';
        });
      } else if (elem === 'void') {
        // Faint outer rings
        art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 1.14).toFixed(1) + '" fill="none" stroke="' + e.dim + '" stroke-width="' + 1.0 * sc + '" opacity=".70"/>';
        art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.96).toFixed(1) + '" fill="none" stroke="' + e.m + '" stroke-width="' + 0.55 * sc + '" opacity=".38"/>';

        // Galaxy spiral arms — 5 arms, each rendered as 3 nested polylines
        // (thick inner highlight + medium body + faint outer trail) sweeping
        // from near the central medallion out to the rim. Each arm does more
        // than one full revolution so plenty of lines emanate from the centre.
        const ARMS = 5;
        for (let arm = 0; arm < ARMS; arm++) {
          const base = arm * (Math.PI * 2 / ARMS);
          // Inner bright curve (primary)
          const ptsI = [];
          for (let i = 0; i <= 48; i++) {
            const t = i / 48;
            const ang = base + t * Math.PI * 2.15;
            const rad = r * (0.18 + t * 0.80);
            ptsI.push((cx + Math.cos(ang) * rad).toFixed(1) + ',' + (cy + Math.sin(ang) * rad).toFixed(1));
          }
          art += '<polyline points="' + ptsI.join(' ') + '" fill="none" stroke="' + e.b + '" stroke-width="' + 2.1 * sc + '" stroke-linecap="round" opacity=".92"/>';

          // Body curve (offset, medium weight)
          const ptsB = [];
          for (let i = 0; i <= 48; i++) {
            const t = i / 48;
            const ang = base - 0.18 + t * Math.PI * 2.05;
            const rad = r * (0.20 + t * 0.74);
            ptsB.push((cx + Math.cos(ang) * rad).toFixed(1) + ',' + (cy + Math.sin(ang) * rad).toFixed(1));
          }
          art += '<polyline points="' + ptsB.join(' ') + '" fill="none" stroke="' + e.m + '" stroke-width="' + 1.25 * sc + '" stroke-linecap="round" opacity=".70"/>';

          // Outer ghost trail (dim, wider sweep)
          const ptsT = [];
          for (let i = 0; i <= 48; i++) {
            const t = i / 48;
            const ang = base + 0.34 + t * Math.PI * 1.95;
            const rad = r * (0.24 + t * 0.70);
            ptsT.push((cx + Math.cos(ang) * rad).toFixed(1) + ',' + (cy + Math.sin(ang) * rad).toFixed(1));
          }
          art += '<polyline points="' + ptsT.join(' ') + '" fill="none" stroke="' + e.m + '" stroke-width="' + 0.75 * sc + '" stroke-linecap="round" opacity=".42"/>';
        }

        // Tight inner spiral wisps — short lines emanating from the centre
        // to reinforce the "spiralling out of the core" read.
        for (let arm = 0; arm < ARMS; arm++) {
          const base = arm * (Math.PI * 2 / ARMS) + Math.PI / ARMS;
          const ptsW = [];
          for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const ang = base + t * Math.PI * 1.1;
            const rad = r * (0.16 + t * 0.24);
            ptsW.push((cx + Math.cos(ang) * rad).toFixed(1) + ',' + (cy + Math.sin(ang) * rad).toFixed(1));
          }
          art += '<polyline points="' + ptsW.join(' ') + '" fill="none" stroke="' + e.b + '" stroke-width="' + 0.95 * sc + '" stroke-linecap="round" opacity=".58"/>';
        }

        // Cardinal diamond-tip star-points
        const cardFourV = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        cardFourV.forEach(([dx, dy]) => {
          const tipX = cx + dx * r * 1.16,
            tipY = cy + dy * r * 1.16;
          const basX = cx + dx * r * 0.82,
            basY = cy + dy * r * 0.82;
          const mx = (tipX + basX) / 2,
            my = (tipY + basY) / 2;
          const px = -dy,
            py = dx;
          const w = r * 0.07;
          const pts = tipX.toFixed(1) + ',' + tipY.toFixed(1) + ' ' + (mx + px * w).toFixed(1) + ',' + (my + py * w).toFixed(1) + ' ' + basX.toFixed(1) + ',' + basY.toFixed(1) + ' ' + (mx - px * w).toFixed(1) + ',' + (my - py * w).toFixed(1);
          art += '<polygon points="' + pts + '" fill="' + e.b + '" fill-opacity=".82" stroke="' + e.b + '" stroke-width="' + 0.55 * sc + '"/>';
        });

        // Scattered stars
        const stars = [[0.22, -0.82, 1.1], [0.72, -0.52, 0.9], [0.92, 0.08, 1.0], [0.80, 0.54, 0.9], [0.34, 0.88, 1.0], [-0.38, 0.86, 0.9], [-0.88, 0.38, 0.9], [-0.96, -0.18, 1.0], [-0.72, -0.58, 0.9], [-0.22, -0.92, 1.0], [0.56, -0.28, 0.7], [-0.32, 0.46, 0.7], [0.28, 0.22, 0.6], [-0.48, -0.24, 0.7]];
        stars.forEach(([dx, dy, rs]) => {
          art += '<circle cx="' + (cx + dx * r).toFixed(1) + '" cy="' + (cy + dy * r).toFixed(1) + '" r="' + rs * sc + '" fill="' + e.b + '" opacity=".58"/>';
        });
      } else if (elem === 'flux') {
        // Flux: broad top/bottom oscillation bands plus two near-circle
        // streamlines, closer to the fluid-flow reference and less like
        // decorative side curls.
        const ringR = r * 0.56;
        const bandHalfW = r * 1.58;
        const leftX = cx - bandHalfW;
        const rightX = cx + bandHalfW;
        const topBaseY = cy - r * 0.34;
        const botBaseY = cy + r * 0.34;
        const waveOuter = x => (1 - x * x) * (1 + Math.cos(7 * x));
        const waveInner = x => (1 - x * x) * (0.5 + Math.cos(7 * x));
        const waveScale = r * 0.255;
        const toPts = pts => pts.map(([px, py]) => px.toFixed(1) + ',' + py.toFixed(1)).join(' ');
        const closedBandPath = (outerPts, innerPts) => {
          let d = 'M ' + outerPts[0][0].toFixed(1) + ',' + outerPts[0][1].toFixed(1);
          for (let i = 1; i < outerPts.length; i++) d += ' L ' + outerPts[i][0].toFixed(1) + ',' + outerPts[i][1].toFixed(1);
          for (let i = innerPts.length - 1; i >= 0; i--) d += ' L ' + innerPts[i][0].toFixed(1) + ',' + innerPts[i][1].toFixed(1);
          d += ' Z';
          return d;
        };
        const buildWaveBand = sign => {
          const outerPts = [],
            innerPts = [];
          const N = 104;
          for (let i = 0; i <= N; i++) {
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
          for (let i = 0; i <= N; i++) {
            const xn = -1.22 + 2.44 * i / N;
            const px = cx + xn * bandHalfW;
            const env = Math.max(0, 1 - Math.min(1.18, Math.abs(xn)) ** 2 / 1.35);
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
          art += '<polyline points="' + contourPath(py, amp, phase) + '" fill="none" stroke="' + e.m + '" stroke-width="' + (Math.abs(i) < 4 ? 0.65 : 0.5) * sc + '" stroke-linecap="round" opacity="' + (Math.abs(i) < 4 ? '.16' : '.11') + '"/>';
        }
        for (let i = -7; i <= 7; i += 2) {
          const py = cy + i * r * 0.13;
          const amp = r * (0.016 + 0.003 * (7 - Math.abs(i)));
          const phase = i * -0.34;
          art += '<polyline points="' + contourPath(py, amp, phase) + '" fill="none" stroke="' + e.b + '" stroke-width="' + 0.34 * sc + '" stroke-linecap="round" opacity=".08"/>';
        }

        // Main top and bottom bands from the user-suggested boundary functions.
        // Wider horizontal span keeps them clear of the central aperture.
        const topBand = buildWaveBand(-1);
        const botBand = buildWaveBand(+1);
        const renderBand = band => {
          art += '<path d="' + band.fillD + '" fill="' + e.b + '" fill-opacity=".20"/>';
          art += '<polyline points="' + band.outerPoly + '" fill="none" stroke="' + e.b + '" stroke-width="' + 2.65 * sc + '" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>';
          art += '<polyline points="' + band.innerPoly + '" fill="none" stroke="' + e.b + '" stroke-width="' + 2.05 * sc + '" stroke-linecap="round" stroke-linejoin="round" opacity=".78"/>';
          art += '<polyline points="' + band.outerPoly + '" fill="none" stroke="' + e.m + '" stroke-width="' + 0.82 * sc + '" stroke-linecap="round" stroke-linejoin="round" opacity=".34"/>';
        };
        renderBand(topBand);
        renderBand(botBand);

        // Replace the old side curls with just the two streamlines nearest the
        // circle, inspired by flow around a cylinder.
        const nearCircleLine = sign => {
          const yEdge = cy + sign * r * 0.12;
          const yLift = cy + sign * (ringR + r * 0.11);
          let d = 'M ' + leftX.toFixed(1) + ',' + yEdge.toFixed(1);
          d += ' C ' + (cx - r * 1.22).toFixed(1) + ',' + yEdge.toFixed(1) + ' ' + (cx - r * 0.96).toFixed(1) + ',' + (cy + sign * r * 0.52).toFixed(1) + ' ' + cx.toFixed(1) + ',' + yLift.toFixed(1);
          d += ' C ' + (cx + r * 0.96).toFixed(1) + ',' + (cy + sign * r * 0.52).toFixed(1) + ' ' + (cx + r * 1.22).toFixed(1) + ',' + yEdge.toFixed(1) + ' ' + rightX.toFixed(1) + ',' + yEdge.toFixed(1);
          return d;
        };
        const addNearLine = d => {
          art += '<path d="' + d + '" fill="none" stroke="' + e.b + '" stroke-width="' + 2.05 * sc + '" stroke-linecap="round" opacity=".82"/>';
          art += '<path d="' + d + '" fill="none" stroke="' + e.m + '" stroke-width="' + 0.72 * sc + '" stroke-linecap="round" opacity=".28"/>';
        };
        addNearLine(nearCircleLine(-1));
        addNearLine(nearCircleLine(+1));

        // Dominant aperture ring.
        art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + ringR.toFixed(1) + '" fill="none" stroke="' + e.b + '" stroke-width="' + 3.0 * sc + '" opacity=".96"/>';
        art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (ringR * 0.985).toFixed(1) + '" fill="none" stroke="' + e.b + '" stroke-width="' + 1.2 * sc + '" opacity=".40"/>';
        art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (ringR * 1.02).toFixed(1) + '" fill="none" stroke="' + e.m + '" stroke-width="' + 0.9 * sc + '" opacity=".38"/>';

        // Sparse symmetric motes.
        [-1, +1].forEach(sx => {
          [-1, +1].forEach(sy => {
            [[0.88, 0.86, 0.55], [0.62, 0.56, 0.65], [0.28, 0.92, 0.45], [0.12, 0.70, 0.42], [1.04, 0.52, 0.45]].forEach(([dx, dy, rs]) => {
              art += '<circle cx="' + (cx + sx * dx * r).toFixed(1) + '" cy="' + (cy + sy * dy * r).toFixed(1) + '" r="' + rs * sc + '" fill="' + e.b + '" opacity=".34"/>';
            });
          });
        });
      } else if (elem === 'aether') {
        // Hexagon (pointy-top) vertices
        const hexR = r * 0.90;
        const innerR = hexR * 0.56;
        const verts = [];
        for (let i = 0; i < 6; i++) {
          const a = -Math.PI / 2 + i * Math.PI / 3;
          verts.push([cx + Math.cos(a) * hexR, cy + Math.sin(a) * hexR]);
        }
        // Faint background ring
        art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 1.06).toFixed(1) + '" fill="none" stroke="' + e.dim + '" stroke-width="' + 0.7 * sc + '" opacity=".36"/>';
        art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.92).toFixed(1) + '" fill="none" stroke="' + e.m + '" stroke-width="' + 0.5 * sc + '" opacity=".25"/>';

        // Outer hexagon
        art += '<polygon points="' + verts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + '" fill="none" stroke="' + e.b + '" stroke-width="' + 1.5 * sc + '" opacity=".88"/>';

        // All 9 non-adjacent diagonals (hexagram pattern + 3 diameters)
        for (let i = 0; i < 6; i++) {
          for (let j = i + 2; j < 6 && j - i < 5; j++) {
            const p1 = verts[i],
              p2 = verts[j];
            const isDiam = j - i === 3;
            const sw = isDiam ? 1.15 * sc : 0.85 * sc;
            const op = isDiam ? 0.78 : 0.52;
            art += '<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) + '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) + '" stroke="' + e.m + '" stroke-width="' + sw + '" opacity="' + op + '"/>';
          }
        }

        // Inner nested hexagon (same orientation, scaled)
        const inV = verts.map(([x, y]) => [cx + (x - cx) * 0.58, cy + (y - cy) * 0.58]);
        art += '<polygon points="' + inV.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + '" fill="none" stroke="' + e.b + '" stroke-width="' + 1.0 * sc + '" opacity=".55"/>';

        // Diamond-arrow spike tips protruding from each vertex outward
        verts.forEach(([x, y], i) => {
          const a = -Math.PI / 2 + i * Math.PI / 3;
          const ux = Math.cos(a),
            uy = Math.sin(a);
          const px = -uy,
            py = ux;
          const tipLen = r * 0.22;
          const tipWid = r * 0.065;
          const tipX = cx + ux * (hexR + tipLen);
          const tipY = cy + uy * (hexR + tipLen);
          const basX = cx + ux * (hexR - tipLen * 0.18);
          const basY = cy + uy * (hexR - tipLen * 0.18);
          const mx = cx + ux * (hexR + tipLen * 0.38);
          const my = cy + uy * (hexR + tipLen * 0.38);
          const pts = basX.toFixed(1) + ',' + basY.toFixed(1) + ' ' + (mx + px * tipWid).toFixed(1) + ',' + (my + py * tipWid).toFixed(1) + ' ' + tipX.toFixed(1) + ',' + tipY.toFixed(1) + ' ' + (mx - px * tipWid).toFixed(1) + ',' + (my - py * tipWid).toFixed(1);
          art += '<polygon points="' + pts + '" fill="' + e.b + '" fill-opacity=".62" stroke="' + e.b + '" stroke-width="' + 0.7 * sc + '"/>';
        });

        // Vertex orbs (ruby cabochons)
        verts.forEach(([x, y]) => {
          art += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + 4.0 * sc + '" fill="' + e.bg2 + '" stroke="' + e.b + '" stroke-width="' + 1.2 * sc + '"/>';
          art += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + 2.3 * sc + '" fill="' + e.b + '" opacity=".78"/>';
          art += '<circle cx="' + (x - 1.0 * sc).toFixed(1) + '" cy="' + (y - 1.0 * sc).toFixed(1) + '" r="' + 0.8 * sc + '" fill="#ffffff" opacity=".35"/>';
        });

        // Intermediate nodes at midpoints of inner hexagon edges (small orbs)
        for (let i = 0; i < 6; i++) {
          const x = (inV[i][0] + inV[(i + 1) % 6][0]) / 2;
          const y = (inV[i][1] + inV[(i + 1) % 6][1]) / 2;
          art += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + 1.8 * sc + '" fill="' + e.b + '" opacity=".72"/>';
        }

        // A few stipple sparkles in the corners
        const aetherSparks = [[0.95, -0.92, 0.7], [-0.95, -0.92, 0.7], [0.95, 0.92, 0.7], [-0.95, 0.92, 0.7], [0.45, -1.08, 0.6], [-0.45, -1.08, 0.6], [0.45, 1.08, 0.6], [-0.45, 1.08, 0.6]];
        aetherSparks.forEach(([dx, dy, rs]) => {
          art += '<circle cx="' + (cx + dx * r).toFixed(1) + '" cy="' + (cy + dy * r).toFixed(1) + '" r="' + rs * sc + '" fill="' + e.b + '" opacity=".55"/>';
        });
      }

      // Clear numeral medallion (matches relic/glyph treatment)
      art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (medR * 1.22).toFixed(1) + '" fill="' + e.bg2 + '" fill-opacity=".985"/>';
      art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (medR * 1.22).toFixed(1) + '" fill="none" stroke="' + e.b + '" stroke-width="' + 1.15 * sc + '" opacity=".75"/>';
      art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (medR * 1.38).toFixed(1) + '" fill="none" stroke="' + e.m + '" stroke-width="' + 0.7 * sc + '" opacity=".42"/>';
      return art;
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "art/emblem.js", error: String((e && e.message) || e) }); }

// art/mystic.js
try { (() => {
// art/mystic.js
// Mystic
// Atmospheric, painterly art per suit. More glow, less sharp vector.
// Inspired by the tarot-style illustrated card aesthetic: radiance as a
// golden starburst corona, void as a swirling galaxy, flux as a flowing
// luminous serpent, aether as sacred geometry with glowing nodes.
// No central medallion — designed to pair with the tarot layout (value
// circle at top). Works with other layouts too; the numeral floats on top.
(function () {
  const AA = window.AA_ART = window.AA_ART || {};
  AA['mystic'] = {
    name: 'Mystic',
    notes: 'Atmospheric illustrated art — glow-heavy, painterly. Pairs well with tarot layout.',
    render: function (elem, cx, cy, artR, e, meta) {
      meta = meta || {};
      const sc = meta.sc || 1;
      const r = artR;
      let art = '';
      if (elem === 'radiance') {
        // ── Atmospheric halo ──
        // Wide soft background glow, built from many concentric circles
        // with low opacity to simulate a photographic bloom effect.
        const halos = [1.55, 1.28, 1.06, 0.86, 0.68];
        halos.forEach((hr, i) => {
          const op = ['.06', '.09', '.13', '.19', '.26'][i];
          art += `<circle cx="${cx}" cy="${cy}" r="${(r * hr).toFixed(1)}" fill="${e.b}" opacity="${op}"/>`;
        });

        // ── Ray system: 32 rays in 4 tiers (cardinal / diagonal / half / quarter) ──
        for (let i = 0; i < 32; i++) {
          const angle = i * Math.PI * 2 / 32;
          const isCard = i % 8 === 0;
          const isDiag = i % 4 === 0 && !isCard;
          const isHalf = i % 2 === 0 && !isDiag && !isCard;
          const tipR = isCard ? r * 1.48 : isDiag ? r * 1.18 : isHalf ? r * 0.94 : r * 0.74;
          const baseR = r * 0.24;
          const sw = isCard ? 2.1 : isDiag ? 1.3 : isHalf ? 0.85 : 0.52;
          const op = isCard ? '.82' : isDiag ? '.58' : isHalf ? '.36' : '.20';
          const gid = 'mys-rad-ray-' + i + '-' + (meta.id || Math.random().toString(36).slice(2, 6));
          const x1 = cx + Math.cos(angle) * baseR;
          const y1 = cy + Math.sin(angle) * baseR;
          const x2 = cx + Math.cos(angle) * tipR;
          const y2 = cy + Math.sin(angle) * tipR;
          // Use a gradient so rays fade at the tip for a painterly feel
          art += `<defs><linearGradient id="${gid}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="${e.b}" stop-opacity="${op}"/>
            <stop offset="100%" stop-color="${e.b}" stop-opacity="0"/>
          </linearGradient></defs>`;
          art += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="url(#${gid})" stroke-width="${(sw * sc).toFixed(1)}" stroke-linecap="round"/>`;
        }

        // ── Diamond star-points at cardinals ──
        [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy]) => {
          const tipX = cx + dx * r * 1.44,
            tipY = cy + dy * r * 1.44;
          const basX = cx + dx * r * 0.80,
            basY = cy + dy * r * 0.80;
          const mx = (tipX + basX) / 2,
            my = (tipY + basY) / 2;
          const px = -dy * r * 0.072,
            py = dx * r * 0.072;
          art += `<polygon points="${tipX.toFixed(1)},${tipY.toFixed(1)} ${(mx + px).toFixed(1)},${(my + py).toFixed(1)} ${basX.toFixed(1)},${basY.toFixed(1)} ${(mx - px).toFixed(1)},${(my - py).toFixed(1)}" fill="${e.b}" opacity=".88"/>`;
        });

        // ── Concentric bright rings ──
        [1.02, 0.82, 0.60, 0.40].forEach((hr, i) => {
          const sw = [1.4, 0.9, 0.7, 0.55][i] * sc;
          const op = ['.52', '.36', '.28', '.22'][i];
          art += `<circle cx="${cx}" cy="${cy}" r="${(r * hr).toFixed(1)}" fill="none" stroke="${e.b}" stroke-width="${sw.toFixed(1)}" opacity="${op}"/>`;
        });

        // ── Glowing core ──
        art += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.22).toFixed(1)}" fill="${e.b}" opacity=".72"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.12).toFixed(1)}" fill="#fff8e0" opacity=".90"/>`;

        // ── Sparkle motes around core ──
        [[0.38, -0.22], [0.22, 0.40], [-0.42, 0.18], [-0.18, -0.38], [0.66, -0.52], [0.52, 0.64], [-0.68, 0.44], [-0.44, -0.66]].forEach(([dx, dy]) => {
          const rs = (Math.abs(dx) > 0.5 ? 1.1 : 1.6) * sc;
          art += `<circle cx="${(cx + dx * r).toFixed(1)}" cy="${(cy + dy * r).toFixed(1)}" r="${rs.toFixed(1)}" fill="${e.b}" opacity="${Math.abs(dx) > 0.5 ? '.48' : '.62'}"/>`;
        });
      } else if (elem === 'void') {
        // ── Star field ──
        const stars = [[0.22, -0.82, 1.1, '.52'], [0.72, -0.50, 0.9, '.44'], [0.94, 0.08, 1.0, '.48'], [0.80, 0.56, 0.9, '.44'], [0.34, 0.90, 1.0, '.50'], [-0.38, 0.88, 0.9, '.44'], [-0.88, 0.40, 0.9, '.48'], [-0.98, -0.16, 1.0, '.52'], [-0.72, -0.58, 0.9, '.44'], [-0.22, -0.94, 1.0, '.50'], [0.56, -0.30, 0.7, '.36'], [-0.32, 0.48, 0.7, '.36'], [0.28, 0.22, 0.6, '.30'], [-0.48, -0.24, 0.7, '.36'], [0.10, -0.60, 0.8, '.40'], [-0.10, 0.64, 0.8, '.40'], [0.60, 0.40, 0.6, '.30'], [-0.64, -0.40, 0.6, '.30'], [1.10, -0.18, 0.7, '.28'], [1.08, 0.30, 0.6, '.24'], [-1.12, 0.16, 0.7, '.28'], [0.38, -1.10, 0.6, '.24'], [-0.42, 1.08, 0.6, '.24']];
        stars.forEach(([dx, dy, rs, op]) => {
          art += `<circle cx="${(cx + dx * r).toFixed(1)}" cy="${(cy + dy * r).toFixed(1)}" r="${(rs * sc).toFixed(1)}" fill="${e.b}" opacity="${op}"/>`;
        });

        // ── Wide atmospheric purple glow ──
        [1.40, 1.08, 0.78].forEach((hr, i) => {
          const op = ['.05', '.10', '.18'][i];
          art += `<circle cx="${cx}" cy="${cy}" r="${(r * hr).toFixed(1)}" fill="${e.b}" opacity="${op}"/>`;
        });

        // ── Galaxy spiral — 4 arms, each a wide luminous sweep ──
        const ARMS = 4;
        for (let arm = 0; arm < ARMS; arm++) {
          const base = arm * (Math.PI * 2 / ARMS) + Math.PI / 8;

          // Outer bright arm
          const ptsO = [];
          for (let i = 0; i <= 56; i++) {
            const t = i / 56;
            const ang = base + t * Math.PI * 2.4;
            const rad = r * (0.12 + t * 0.88);
            ptsO.push(`${(cx + Math.cos(ang) * rad).toFixed(1)},${(cy + Math.sin(ang) * rad).toFixed(1)}`);
          }
          art += `<polyline points="${ptsO.join(' ')}" fill="none" stroke="${e.b}" stroke-width="${(2.4 * sc).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity=".88"/>`;

          // Mid body
          const ptsM = [];
          for (let i = 0; i <= 48; i++) {
            const t = i / 48;
            const ang = base - 0.22 + t * Math.PI * 2.2;
            const rad = r * (0.16 + t * 0.76);
            ptsM.push(`${(cx + Math.cos(ang) * rad).toFixed(1)},${(cy + Math.sin(ang) * rad).toFixed(1)}`);
          }
          art += `<polyline points="${ptsM.join(' ')}" fill="none" stroke="${e.m}" stroke-width="${(1.3 * sc).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity=".62"/>`;

          // Faint trailing ghost
          const ptsT = [];
          for (let i = 0; i <= 40; i++) {
            const t = i / 40;
            const ang = base + 0.36 + t * Math.PI * 2.0;
            const rad = r * (0.20 + t * 0.68);
            ptsT.push(`${(cx + Math.cos(ang) * rad).toFixed(1)},${(cy + Math.sin(ang) * rad).toFixed(1)}`);
          }
          art += `<polyline points="${ptsT.join(' ')}" fill="none" stroke="${e.dim}" stroke-width="${(0.8 * sc).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity=".40"/>`;
        }

        // ── Outer containment ring ──
        art += `<circle cx="${cx}" cy="${cy}" r="${(r * 1.02).toFixed(1)}" fill="none" stroke="${e.m}" stroke-width="${(0.9 * sc).toFixed(1)}" opacity=".32"/>`;

        // ── Inner void aperture — the empty pull at the center ──
        art += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.14).toFixed(1)}" fill="${e.bg1}" opacity=".95"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.10).toFixed(1)}" fill="${e.bg2}" opacity=".99"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.14).toFixed(1)}" fill="none" stroke="${e.b}" stroke-width="${(1.0 * sc).toFixed(1)}" opacity=".55"/>`;
      } else if (elem === 'flux') {
        // ── Wide atmospheric green glow ──
        [1.30, 0.96, 0.64].forEach((hr, i) => {
          const op = ['.06', '.12', '.22'][i];
          art += `<circle cx="${cx}" cy="${cy}" r="${(r * hr).toFixed(1)}" fill="${e.b}" opacity="${op}"/>`;
        });

        // ── Flowing serpent streams ──
        // Primary bright serpent: an S-curve sweeping from top-left to bottom-right
        const buildSerpent = (xOff, yOff, sw, op) => {
          const x0 = cx - r * 1.00 + xOff;
          const y0 = cy - r * 0.92 + yOff;
          const x3 = cx + r * 1.00 + xOff;
          const y3 = cy + r * 0.92 + yOff;
          const cp1x = cx + r * 0.62 + xOff;
          const cp1y = cy - r * 0.92 + yOff;
          const cp2x = cx - r * 0.62 + xOff;
          const cp2y = cy + r * 0.92 + yOff;
          return `<path d="M${x0.toFixed(1)},${y0.toFixed(1)} C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${x3.toFixed(1)},${y3.toFixed(1)}" fill="none" stroke="${e.b}" stroke-width="${(sw * sc).toFixed(1)}" stroke-linecap="round" opacity="${op}"/>`;
        };
        art += buildSerpent(0, 0, 3.2, '.92');
        art += buildSerpent(-r * 0.18, r * 0.06, 1.8, '.60');
        art += buildSerpent(r * 0.18, -r * 0.06, 1.8, '.60');
        art += buildSerpent(-r * 0.34, r * 0.14, 1.0, '.36');
        art += buildSerpent(r * 0.34, -r * 0.14, 1.0, '.36');
        art += buildSerpent(-r * 0.52, r * 0.24, 0.6, '.22');
        art += buildSerpent(r * 0.52, -r * 0.24, 0.6, '.22');

        // ── Particle scatter along the stream ──
        const particleData = [[-0.68, -0.72, 1.4, '.68'], [-0.32, -0.54, 1.0, '.52'], [0.06, -0.28, 1.2, '.58'], [0.40, 0.08, 1.1, '.54'], [0.70, 0.46, 1.3, '.62'], [0.86, 0.76, 1.0, '.50'], [-0.82, -0.20, 0.8, '.38'], [-0.18, 0.22, 0.9, '.44'], [0.52, 0.60, 0.7, '.38'], [-0.50, -0.84, 0.7, '.34'], [0.22, -0.70, 0.6, '.30'], [0.72, -0.22, 0.6, '.30'], [-0.24, 0.64, 0.6, '.30'], [0.90, 0.20, 0.7, '.34']];
        particleData.forEach(([dx, dy, rs, op]) => {
          art += `<circle cx="${(cx + dx * r).toFixed(1)}" cy="${(cy + dy * r).toFixed(1)}" r="${(rs * sc).toFixed(1)}" fill="${e.b}" opacity="${op}"/>`;
        });

        // ── Glowing orb at the inflection centre ──
        art += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.20).toFixed(1)}" fill="${e.b}" opacity=".28"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.10).toFixed(1)}" fill="${e.b}" opacity=".72"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.05).toFixed(1)}" fill="#e0fff8" opacity=".90"/>`;
      } else if (elem === 'aether') {
        // ── Wide atmospheric crimson glow ──
        [1.32, 0.98, 0.66].forEach((hr, i) => {
          const op = ['.05', '.11', '.20'][i];
          art += `<circle cx="${cx}" cy="${cy}" r="${(r * hr).toFixed(1)}" fill="${e.b}" opacity="${op}"/>`;
        });

        // ── Outer diamond ──
        const outerD = r * 0.98;
        art += `<polygon points="${cx},${(cy - outerD).toFixed(1)} ${(cx + outerD).toFixed(1)},${cy} ${cx},${(cy + outerD).toFixed(1)} ${(cx - outerD).toFixed(1)},${cy}" fill="none" stroke="${e.b}" stroke-width="${(2.0 * sc).toFixed(1)}" opacity=".88"/>`;

        // ── Inner diamond (rotated 45°) ──
        const innerD = r * 0.60;
        art += `<polygon points="${cx},${(cy - innerD).toFixed(1)} ${(cx + innerD).toFixed(1)},${cy} ${cx},${(cy + innerD).toFixed(1)} ${(cx - innerD).toFixed(1)},${cy}" fill="none" stroke="${e.m}" stroke-width="${(1.4 * sc).toFixed(1)}" opacity=".70"/>`;

        // ── Binding circle ──
        art += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.62).toFixed(1)}" fill="none" stroke="${e.b}" stroke-width="${(1.1 * sc).toFixed(1)}" opacity=".55"/>`;

        // ── Lattice lines: outer diamond vertices → inner diamond vertices ──
        const ov = [[cx, cy - outerD], [cx + outerD, cy], [cx, cy + outerD], [cx - outerD, cy]];
        const iv = [[cx, cy - innerD], [cx + innerD, cy], [cx, cy + innerD], [cx - innerD, cy]];
        // Cross-connect every outer to every inner vertex
        ov.forEach(o => {
          iv.forEach(inn => {
            art += `<line x1="${o[0].toFixed(1)}" y1="${o[1].toFixed(1)}" x2="${inn[0].toFixed(1)}" y2="${inn[1].toFixed(1)}" stroke="${e.m}" stroke-width="${(0.6 * sc).toFixed(1)}" opacity=".30"/>`;
          });
        });

        // ── Diagonal scaffold lines ──
        art += `<line x1="${(cx - outerD).toFixed(1)}" y1="${cy}" x2="${(cx + outerD).toFixed(1)}" y2="${cy}" stroke="${e.dim}" stroke-width="${(0.7 * sc).toFixed(1)}" opacity=".55"/>`;
        art += `<line x1="${cx}" y1="${(cy - outerD).toFixed(1)}" x2="${cx}" y2="${(cy + outerD).toFixed(1)}" stroke="${e.dim}" stroke-width="${(0.7 * sc).toFixed(1)}" opacity=".55"/>`;
        art += `<line x1="${(cx - outerD * 0.72).toFixed(1)}" y1="${(cy - outerD * 0.72).toFixed(1)}" x2="${(cx + outerD * 0.72).toFixed(1)}" y2="${(cy + outerD * 0.72).toFixed(1)}" stroke="${e.dim}" stroke-width="${(0.6 * sc).toFixed(1)}" opacity=".40"/>`;
        art += `<line x1="${(cx + outerD * 0.72).toFixed(1)}" y1="${(cy - outerD * 0.72).toFixed(1)}" x2="${(cx - outerD * 0.72).toFixed(1)}" y2="${(cy + outerD * 0.72).toFixed(1)}" stroke="${e.dim}" stroke-width="${(0.6 * sc).toFixed(1)}" opacity=".40"/>`;

        // ── Glowing nodes at outer vertices ──
        ov.forEach(([nx, ny]) => {
          art += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${(5.5 * sc).toFixed(1)}" fill="${e.b}" opacity=".28"/>`;
          art += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${(3.5 * sc).toFixed(1)}" fill="${e.bg2}" stroke="${e.b}" stroke-width="${(1.1 * sc).toFixed(1)}" opacity=".92"/>`;
          art += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${(1.8 * sc).toFixed(1)}" fill="${e.b}" opacity=".88"/>`;
        });

        // ── Nodes at inner vertices ──
        iv.forEach(([nx, ny]) => {
          art += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${(3.2 * sc).toFixed(1)}" fill="${e.bg2}" stroke="${e.b}" stroke-width="${(0.9 * sc).toFixed(1)}" opacity=".80"/>`;
          art += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${(1.4 * sc).toFixed(1)}" fill="${e.b}" opacity=".75"/>`;
        });

        // ── Mid-edge nodes on outer diamond ──
        const mids = [[cx + outerD * 0.50, cy - outerD * 0.50], [cx + outerD * 0.50, cy + outerD * 0.50], [cx - outerD * 0.50, cy + outerD * 0.50], [cx - outerD * 0.50, cy - outerD * 0.50]];
        mids.forEach(([mx, my]) => {
          art += `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${(2.0 * sc).toFixed(1)}" fill="${e.m}" opacity=".65"/>`;
        });

        // ── Central glowing core ──
        art += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.16).toFixed(1)}" fill="${e.b}" opacity=".25"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.08).toFixed(1)}" fill="${e.b}" opacity=".75"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.04).toFixed(1)}" fill="#ffd0d8" opacity=".90"/>`;
      }
      return art;
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "art/mystic.js", error: String((e && e.message) || e) }); }

// art/relic.js
try { (() => {
// art/relic.js
// Relic
// Hand-painted illustrated art per suit — uses the JPEG assets in art/assets/.
(function () {
  const AA = window.AA_ART = window.AA_ART || {};

  // Path to each suit's hand-painted icon. These URLs are resolved relative to
  // playtable.html (or whatever page loads this module).
  const RELIC_ICONS = {
    radiance: 'art/assets/radiance.jpg',
    void: 'art/assets/void.jpg',
    flux: 'art/assets/flux.jpg',
    aether: 'art/assets/aether.jpg'
  };
  AA['relic'] = {
    name: 'Relic',
    notes: 'Hand-painted illustrated art per suit — uses the JPEG assets in art/assets/.',
    render: function (elem, cx, cy, artR, e, meta) {
      meta = meta || {};
      const W = meta.W || 252;
      const H = meta.H || 352;
      const sc = meta.sc || 1;
      const medR = artR * 0.285;
      const imgHref = RELIC_ICONS[elem];
      const imgS = Math.min(W, H * 0.78) * 0.96;
      const ix = cx - imgS / 2;
      const iy = cy - imgS / 2;
      const uid = window.ArchmageCards && window.ArchmageCards.uid || (p => (p || 'c') + Math.random().toString(36).slice(2, 8));
      const rid = 'rel-' + elem + '-' + uid('r');
      let art = '';

      // Fade-to-card radial mask so the square image melts into the dark
      art += '<defs>' + '<radialGradient id="' + rid + '-g" cx="0.5" cy="0.5" r="0.5">' + '<stop offset="0%"  stop-color="#fff" stop-opacity="1"/>' + '<stop offset="62%" stop-color="#fff" stop-opacity="1"/>' + '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>' + '</radialGradient>' + '<mask id="' + rid + '-m" maskContentUnits="objectBoundingBox">' + '<rect x="0" y="0" width="1" height="1" fill="url(#' + rid + '-g)"/>' + '</mask>' + '</defs>';

      // The painted icon itself — screen-blended so dark background drops out
      art += '<image href="' + imgHref + '"' + ' x="' + ix.toFixed(1) + '" y="' + iy.toFixed(1) + '"' + ' width="' + imgS.toFixed(1) + '" height="' + imgS.toFixed(1) + '"' + ' preserveAspectRatio="xMidYMid slice"' + ' mask="url(#' + rid + '-m)"' + ' style="mix-blend-mode:screen"' + ' opacity="0.96"/>';

      // Subtle suit-tinted atmospheric halo to seat the icon into the frame
      art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (imgS * 0.50).toFixed(1) + '" fill="none" stroke="' + e.m + '" stroke-width="' + 0.8 * sc + '" opacity=".28"/>';
      art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (imgS * 0.46).toFixed(1) + '" fill="none" stroke="' + e.dim + '" stroke-width="' + 1.2 * sc + '" opacity=".40"/>';

      // Clear numeral medallion (matches the glyph-variant treatment)
      art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (medR * 1.22).toFixed(1) + '" fill="' + e.bg2 + '" fill-opacity=".985"/>';
      art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (medR * 1.22).toFixed(1) + '" fill="none" stroke="' + e.b + '" stroke-width="' + 1.15 * sc + '" opacity=".75"/>';
      art += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (medR * 1.38).toFixed(1) + '" fill="none" stroke="' + e.m + '" stroke-width="' + 0.7 * sc + '" opacity=".42"/>';
      return art;
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "art/relic.js", error: String((e && e.message) || e) }); }

// art/ritual.js
try { (() => {
// art/ritual.js
// Ritual
// Ceremonial sigils with layered glows and containment rings.
(function () {
  const AA = window.AA_ART = window.AA_ART || {};
  AA['ritual'] = {
    name: 'Ritual',
    notes: 'Ceremonial sigils with layered glows and containment rings.',
    render: function (elem, cx, cy, artR, e) {
      const r = artR;
      let art = '';

      // ── Shared containment ring (outer frame) ──
      art += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${e.dim}" stroke-width="${r * 0.16}" opacity="0.95"/>`;
      art += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${e.m}" stroke-width="0.9" opacity="0.55"/>`;
      if (elem === 'radiance') {
        // RADIANCE — emissive / outward projection
        // 16 rays alternating primary (long, bright) and secondary (shorter, dim)
        for (let a = 0; a < 16; a++) {
          const angle = a * Math.PI / 8;
          const isPrimary = a % 2 === 0;
          const r1 = isPrimary ? r * 0.44 : r * 0.50;
          const r2 = isPrimary ? r * 1.12 : r * 0.88;
          const sw = isPrimary ? 1.3 : 0.65;
          const op = isPrimary ? 0.80 : 0.38;
          art += `<line x1="${cx + Math.cos(angle) * r1}" y1="${cy + Math.sin(angle) * r1}" x2="${cx + Math.cos(angle) * r2}" y2="${cy + Math.sin(angle) * r2}" stroke="${e.b}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>`;
        }
        // Concentric corona rings — progressively tighter and brighter toward centre
        art += `<circle cx="${cx}" cy="${cy}" r="${r * 0.78}" fill="none" stroke="${e.m}" stroke-width="0.7" opacity="0.28"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r * 0.58}" fill="none" stroke="${e.m}" stroke-width="0.85" opacity="0.40"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r * 0.40}" fill="none" stroke="${e.b}" stroke-width="0.9" opacity="0.48"/>`;
        // Inner medallion
        art += `<circle cx="${cx}" cy="${cy}" r="${r * 0.26}" fill="${e.bg2}"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r * 0.26}" fill="none" stroke="${e.b}" stroke-width="1.2" opacity="0.72"/>`;
      } else if (elem === 'void') {
        // VOID — absorptive / inward convergence
        // Star scatter background
        const starData = [[0.76, 0.62, 0.9], [0.42, 0.82, 0.7], [0.88, 0.28, 1.0], [0.52, 0.18, 0.8], [0.28, 0.54, 0.7], [0.84, 0.74, 0.9], [0.60, 0.36, 0.8], [0.18, 0.80, 0.7], [0.70, 0.18, 0.9], [0.12, 0.42, 0.8], [0.92, 0.50, 0.7], [0.34, 0.14, 0.9], [0.64, 0.88, 0.8], [0.08, 0.64, 0.7], [0.48, 0.92, 0.9]];
        starData.forEach(([ax, ay, rr]) => {
          const sx = cx - r * 1.05 + ax * r * 2.1;
          const sy = cy - r * 1.05 + ay * r * 2.1;
          art += `<circle cx="${sx}" cy="${sy}" r="${rr}" fill="${e.b}" opacity="0.42"/>`;
        });
        // Inward spiral — four half-arc segments, radius shrinking toward centre
        const spiral = [[0, r * 0.88, r * 0.68, 0, 1], [Math.PI * 0.5, r * 0.70, r * 0.52, 0, 1], [Math.PI, r * 0.54, r * 0.38, 0, 1], [Math.PI * 1.5, r * 0.40, r * 0.26, 0, 1]];
        spiral.forEach(([startA, ra, rb]) => {
          const x1 = cx + Math.cos(startA) * ra;
          const y1 = cy + Math.sin(startA) * ra;
          const x2 = cx + Math.cos(startA + Math.PI) * rb;
          const y2 = cy + Math.sin(startA + Math.PI) * rb;
          const rAvg = (ra + rb) / 2;
          art += `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} A${rAvg.toFixed(1)},${rAvg.toFixed(1)} 0 0,1 ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${e.b}" stroke-width="1.4" opacity="0.60"/>`;
        });
        // Depth rings — dim as they approach the hollow centre
        art += `<circle cx="${cx}" cy="${cy}" r="${r * 0.56}" fill="none" stroke="${e.m}" stroke-width="0.8" opacity="0.32"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r * 0.36}" fill="none" stroke="${e.m}" stroke-width="0.7" opacity="0.22"/>`;
        // Hollow centre — void aperture
        art += `<circle cx="${cx}" cy="${cy}" r="${r * 0.20}" fill="${e.bg1}"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r * 0.20}" fill="none" stroke="${e.b}" stroke-width="1.1" opacity="0.65"/>`;
      } else if (elem === 'flux') {
        // FLUX — transitional / oscillating movement
        // 9 horizontal sine waves stacked, amplitude tapers to edges
        for (let i = -4; i <= 4; i++) {
          const baseY = cy + i * r * 0.185;
          const amp = r * 0.088;
          const isCentre = i === 0;
          const sw = isCentre ? 1.9 : Math.abs(i) < 2 ? 1.0 : 0.65;
          const col = isCentre ? e.b : e.m;
          const op = isCentre ? 0.92 : Math.max(0.12, 0.55 - Math.abs(i) * 0.10);
          art += `<path d="M${(cx - r).toFixed(1)},${baseY.toFixed(1)} Q${(cx - r * 0.5).toFixed(1)},${(baseY - amp).toFixed(1)} ${cx.toFixed(1)},${baseY.toFixed(1)} Q${(cx + r * 0.5).toFixed(1)},${(baseY + amp).toFixed(1)} ${(cx + r).toFixed(1)},${baseY.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>`;
        }
        // Flow-direction calibration marks — three small horizontal chevrons
        for (let i = 0; i < 3; i++) {
          const mx = cx - r * 0.52 + i * r * 0.52;
          art += `<line x1="${mx}" y1="${cy}" x2="${mx + r * 0.16}" y2="${cy}" stroke="${e.b}" stroke-width="1.3" stroke-linecap="round" opacity="0.44"/>`;
        }
        // Inner medallion
        art += `<circle cx="${cx}" cy="${cy}" r="${r * 0.26}" fill="${e.bg2}"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r * 0.26}" fill="none" stroke="${e.b}" stroke-width="1.1" opacity="0.68"/>`;
      } else if (elem === 'aether') {
        // AETHER — binding / geometric stabilization
        // Octagram (8-pointed star) — alternating outer/inner radius vertices
        const pts8 = [];
        for (let a = 0; a < 8; a++) {
          const angle = a * Math.PI / 4 - Math.PI / 8;
          const ri = a % 2 === 0 ? r * 0.80 : r * 0.46;
          pts8.push(`${(cx + Math.cos(angle) * ri).toFixed(1)},${(cy + Math.sin(angle) * ri).toFixed(1)}`);
        }
        art += `<polygon points="${pts8.join(' ')}" fill="none" stroke="${e.b}" stroke-width="1.3" opacity="0.72"/>`;
        // Binding ring
        art += `<circle cx="${cx}" cy="${cy}" r="${r * 0.58}" fill="none" stroke="${e.m}" stroke-width="0.8" opacity="0.38"/>`;
        // Scaffold lines from centre to the four primary outer nodes
        for (let a = 0; a < 8; a += 2) {
          const angle = a * Math.PI / 4 - Math.PI / 8;
          const nx = cx + Math.cos(angle) * r * 0.80;
          const ny = cy + Math.sin(angle) * r * 0.80;
          art += `<line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="${e.dim}" stroke-width="0.7" opacity="0.9"/>`;
          // Node at outer vertex
          art += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="2.8" fill="${e.bg2}" stroke="${e.b}" stroke-width="0.9" opacity="0.85"/>`;
        }
        // Inner medallion
        art += `<circle cx="${cx}" cy="${cy}" r="${r * 0.26}" fill="${e.bg2}"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r * 0.26}" fill="none" stroke="${e.b}" stroke-width="1.2" opacity="0.72"/>`;
        // Central node
        art += `<circle cx="${cx}" cy="${cy}" r="3.2" fill="${e.b}" opacity="0.88"/>`;
      }
      return art;
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "art/ritual.js", error: String((e && e.message) || e) }); }

// art/runic.js
try { (() => {
// art/runic.js
// Runic
// Rune-ring emblems per suit — stripped-down version of ritual.
(function () {
  const AA = window.AA_ART = window.AA_ART || {};
  AA['runic'] = {
    name: 'Runic',
    notes: 'Rune-ring emblems per suit — stripped-down version of ritual.',
    render: function (elem, cx, cy, artR, e) {
      const s = artR / 82;
      const tx = cx - 100 * s,
        ty = cy - 100 * s;
      let art = `<g transform="translate(${tx},${ty}) scale(${s})">`;
      // shared frame
      art += `<circle cx="100" cy="100" r="88" fill="none" stroke="${e.dim}" stroke-width="8"/>` + `<circle cx="100" cy="100" r="88" fill="none" stroke="${e.m}" stroke-width="1.2" opacity=".55"/>`;
      if (elem === 'radiance') {
        // sunburst glyph
        for (let a = 0; a < 12; a++) {
          const r = a * 30 * Math.PI / 180;
          art += `<line x1="${100 + Math.cos(r) * 42}" y1="${100 + Math.sin(r) * 42}" x2="${100 + Math.cos(r) * 72}" y2="${100 + Math.sin(r) * 72}" stroke="${e.b}" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>`;
        }
        art += `<circle cx="100" cy="100" r="28" fill="${e.bg2}" stroke="${e.b}" stroke-width="2"/>`;
      } else if (elem === 'void') {
        // inverted crescent with star
        art += `<path d="M100,40 A60,60 0 1,0 100,160 A44,44 0 1,1 100,40 Z" fill="${e.dim}" stroke="${e.b}" stroke-width="1.8"/>` + `<polygon points="140,80 146,96 162,96 150,106 154,122 140,114 126,122 130,106 118,96 134,96" fill="${e.b}" opacity=".85"/>`;
      } else if (elem === 'flux') {
        // double-wave chevron
        for (let i = 0; i < 3; i++) {
          const yy = 68 + i * 22;
          art += `<path d="M30,${yy} Q60,${yy - 14} 100,${yy} Q140,${yy + 14} 170,${yy}" fill="none" stroke="${i === 1 ? e.b : e.m}" stroke-width="${i === 1 ? 2.6 : 1.4}" opacity="${i === 1 ? .95 : .6}"/>`;
        }
      } else if (elem === 'aether') {
        // sharp lattice diamond
        art += `<polygon points="100,28 172,100 100,172 28,100" fill="none" stroke="${e.b}" stroke-width="2.2"/>` + `<polygon points="100,56 144,100 100,144 56,100" fill="none" stroke="${e.m}" stroke-width="1.4"/>` + `<circle cx="100" cy="100" r="6" fill="${e.b}"/>` + `<line x1="100" y1="28" x2="100" y2="172" stroke="${e.dim}" stroke-width="0.8"/>` + `<line x1="28" y1="100" x2="172" y2="100" stroke="${e.dim}" stroke-width="0.8"/>`;
      }
      art += `</g>`;
      return art;
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "art/runic.js", error: String((e && e.message) || e) }); }

// art/sigil.js
try { (() => {
// art/sigil.js
// Sigil
// Concentric rings, starfield, waves, lattice — the original LIVE art.
(function () {
  const AA = window.AA_ART = window.AA_ART || {};
  AA['sigil'] = {
    name: 'Sigil',
    notes: 'Concentric rings, starfield, waves, lattice — the original LIVE art.',
    render: function (elem, cx, cy, artR, e) {
      const s = artR / 82;
      const tx = cx - 100 * s,
        ty = cy - 160 * s;
      let art = `<g transform="translate(${tx},${ty}) scale(${s})">`;
      if (elem === 'radiance') {
        art += `<circle cx="100" cy="160" r="82" fill="none" stroke="#2a1c00" stroke-width="16"/>` + `<circle cx="100" cy="160" r="82" fill="none" stroke="#5a3c04" stroke-width="6"/>` + `<circle cx="100" cy="160" r="82" fill="none" stroke="#8a6010" stroke-width="1.5"/>` + `<circle cx="100" cy="160" r="64" fill="none" stroke="#1e1400" stroke-width="8"/>` + `<circle cx="100" cy="160" r="64" fill="none" stroke="#3c2802" stroke-width="2"/>` + `<circle cx="100" cy="160" r="50" fill="none" stroke="#6a4808" stroke-width="1"/>`;
        // rays
        const rays = [[100, 70, 100, 57, 2.2], [100, 250, 100, 263, 2.2], [10, 160, -3, 160, 2.2], [190, 160, 203, 160, 2.2], [36, 96, 27, 87, 1.8], [164, 224, 173, 233, 1.8], [164, 96, 173, 87, 1.8], [36, 224, 27, 233, 1.8]];
        rays.forEach(r => {
          art += `<line x1="${r[0]}" y1="${r[1]}" x2="${r[2]}" y2="${r[3]}" stroke="#c8961a" stroke-width="${r[4]}" stroke-linecap="round"/>`;
        });
        art += `<circle cx="100" cy="160" r="44" fill="${e.bg2}"/>` + `<circle cx="100" cy="160" r="44" fill="none" stroke="#8a6010" stroke-width="1.2"/>`;
      } else if (elem === 'void') {
        const stars = [[18, 18, .9, .45], [58, 12, .7, .35], [108, 25, 1.1, .45], [148, 15, .8, .35], [188, 30, .9, .45], [6, 90, .7, .40], [192, 95, 1.0, .45], [12, 250, .9, .45], [80, 272, .7, .40], [138, 268, 1.1, .45], [190, 252, .8, .40], [196, 160, .9, .45], [4, 190, .7, .40], [52, 45, 1.0, .45], [166, 52, .8, .40]];
        stars.forEach(st => {
          art += `<circle cx="${st[0]}" cy="${st[1]}" r="${st[2]}" fill="#c060f0" opacity="${st[3]}"/>`;
        });
        art += `<circle cx="100" cy="160" r="84" fill="none" stroke="#180840" stroke-width="14"/>` + `<circle cx="100" cy="160" r="84" fill="none" stroke="#2e1065" stroke-width="5"/>` + `<circle cx="100" cy="160" r="84" fill="none" stroke="#5a1a9a" stroke-width="1.5"/>` + `<circle cx="100" cy="160" r="65" fill="none" stroke="#120630" stroke-width="7"/>` + `<circle cx="100" cy="160" r="65" fill="none" stroke="#3a1078" stroke-width="1.5"/>` + `<circle cx="100" cy="160" r="50" fill="none" stroke="#5020a0" stroke-width="1"/>` + `<path d="M100,160 Q138,110 162,100 Q190,90 194,118 Q198,146 172,160 Q146,174 130,202 Q114,228 122,250" fill="none" stroke="#6a0dad" stroke-width="1.5" opacity="0.75"/>` + `<path d="M100,160 Q62,210 38,220 Q10,230 6,202 Q2,174 28,160 Q54,146 68,116 Q82,88 72,64" fill="none" stroke="#6a0dad" stroke-width="1.5" opacity="0.75"/>` + `<circle cx="100" cy="160" r="44" fill="${e.bg2}"/>` + `<circle cx="100" cy="160" r="44" fill="none" stroke="#5a1a9a" stroke-width="1.2"/>`;
      } else if (elem === 'flux') {
        const waves = [80, 105, 130, 190, 215, 240];
        waves.forEach(yy => {
          art += `<path d="M5,${yy} Q30,${yy - 22} 55,${yy} Q80,${yy + 22} 105,${yy} Q130,${yy - 22} 155,${yy} Q180,${yy + 22} 195,${yy}" fill="none" stroke="#003828" stroke-width="1.2"/>`;
        });
        art += `<path d="M5,55 Q30,33 55,55 Q80,77 105,55 Q130,33 155,55 Q180,77 195,55" fill="none" stroke="#002820" stroke-width="1"/>` + `<path d="M5,265 Q30,243 55,265 Q80,287 105,265 Q130,243 155,265 Q180,287 195,265" fill="none" stroke="#002820" stroke-width="1"/>` + `<path d="M5,160 Q30,125 55,160 Q80,195 105,160 Q130,125 155,160 Q180,195 195,160" fill="none" stroke="#00c8b4" stroke-width="2.2"/>` + `<path d="M5,160 Q30,138 55,160 Q80,182 105,160 Q130,138 155,160 Q180,182 195,160" fill="none" stroke="#008878" stroke-width="1.4" opacity="0.8"/>` + `<circle cx="100" cy="160" r="44" fill="${e.bg2}"/>` + `<circle cx="100" cy="160" r="44" fill="none" stroke="#009080" stroke-width="1.2"/>`;
      } else if (elem === 'aether') {
        const lines = [[100, 70, 100, 250, 0.9, '#400010'], [10, 160, 190, 160, 0.9, '#400010'], [37, 97, 163, 223, 0.9, '#400010'], [163, 97, 37, 223, 0.9, '#400010']];
        lines.forEach(l => {
          art += `<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" stroke="${l[5]}" stroke-width="${l[4]}"/>`;
        });
        const xlines = [[100, 70, 37, 97], [100, 70, 163, 97], [10, 160, 37, 97], [10, 160, 37, 223], [190, 160, 163, 97], [190, 160, 163, 223], [100, 250, 37, 223], [100, 250, 163, 223]];
        xlines.forEach(l => {
          art += `<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" stroke="#300010" stroke-width="0.8"/>`;
        });
        const accents = [[100, 70, 100, 10, 1.4, .6], [100, 250, 100, 310, 1.4, .6], [10, 160, 37, 97, 1.2, .5], [190, 160, 163, 223, 1.2, .5]];
        accents.forEach(a => {
          art += `<line x1="${a[0]}" y1="${a[1]}" x2="${a[2]}" y2="${a[3]}" stroke="#c8203a" stroke-width="${a[4]}" opacity="${a[5]}"/>`;
        });
        const nodes = [[100, 70, 3.5], [37, 97, 3], [163, 97, 3], [10, 160, 3], [190, 160, 3], [37, 223, 3], [163, 223, 3], [100, 250, 3.5]];
        nodes.forEach(n => {
          art += `<circle cx="${n[0]}" cy="${n[1]}" r="${n[2]}" fill="#500018" stroke="#c82030" stroke-width="0.9"/>`;
        });
        art += `<circle cx="100" cy="160" r="44" fill="${e.bg2}"/>` + `<circle cx="100" cy="160" r="44" fill="none" stroke="#a81828" stroke-width="1.2"/>`;
      }
      art += `</g>`;
      return art;
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "art/sigil.js", error: String((e && e.message) || e) }); }

// connectors/beacon.js
try { (() => {
// connectors/beacon.js
// Beacon
// Round glowing orb at value Y, rings around it.
(function () {
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['beacon'] = {
    name: 'Beacon',
    notes: 'Round glowing orb at value Y, rings around it.',
    render: function (val, p, o) {
      const {
        OL,
        TM,
        ST,
        W,
        sc,
        id,
        side
      } = o;
      const cx = side === 'left' ? OL * 0.5 : W - OL * 0.5;
      const cy = TM + val * ST;
      const gid = id + '-bcn-' + side;
      const grad = `<radialGradient id="${gid}">
        <stop offset="0%" stop-color="${p.b}" stop-opacity=".95"/>
        <stop offset="45%" stop-color="${p.m}" stop-opacity=".55"/>
        <stop offset="100%" stop-color="${p.dim}" stop-opacity="0"/>
      </radialGradient>`;
      const orb = `<circle cx="${cx}" cy="${cy}" r="${ST * 3}" fill="url(#${gid})"/>` + `<circle cx="${cx}" cy="${cy}" r="${ST * 0.5}" fill="${p.b}"/>`;
      return {
        defs: grad,
        gfx: orb
      };
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "connectors/beacon.js", error: String((e && e.message) || e) }); }

// connectors/bloom-soft.js
try { (() => {
// connectors/bloom-soft.js
// Bloom Soft
// Soft radial bloom. Torchlight through a crack — current LIVE default.
(function () {
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['bloom-soft'] = {
    name: 'Bloom Soft',
    notes: 'Soft radial bloom. Torchlight through a crack — current LIVE default.',
    render: function (val, p, o) {
      const {
        OL,
        TM,
        ST,
        W,
        sc,
        id,
        side
      } = o;
      const rx = side === 'right' ? W - OL : 0;
      const bloomCY = TM + val * ST;
      const bloomH = ST * 5.5;
      const y1 = TM + (val - 1) * ST,
        y2 = TM + val * ST,
        y3 = TM + (val + 1) * ST;
      const whisker = side === 'left' ? `<polygon points="0,${y1} ${OL},${y2} ${OL},${y3} 0,${y2}" fill="${p.m}" fill-opacity=".18"/>` : `<polygon points="${rx},${y1} ${W},${y2} ${W},${y3} ${rx},${y2}" fill="${p.m}" fill-opacity=".18"/>`;
      const bx = rx,
        by = bloomCY - bloomH,
        bw = OL,
        bh = bloomH * 2;
      const gid = id + '-bloom-' + side;
      const grad = `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${bx}" y1="${by}" x2="${bx}" y2="${by + bh}">
        <stop offset="0%"   stop-color="${p.dim}"  stop-opacity="0"/>
        <stop offset="12%"  stop-color="${p.dim}"  stop-opacity=".35"/>
        <stop offset="32%"  stop-color="${p.m}"    stop-opacity=".65"/>
        <stop offset="50%"  stop-color="${p.b}"    stop-opacity=".88"/>
        <stop offset="68%"  stop-color="${p.m}"    stop-opacity=".65"/>
        <stop offset="88%"  stop-color="${p.dim}"  stop-opacity=".35"/>
        <stop offset="100%" stop-color="${p.dim}"  stop-opacity="0"/>
      </linearGradient>`;
      const bloom = `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#${gid})"/>`;
      // spill into card body
      const sgid = id + '-spill-' + side;
      const spillW = W * 0.42;
      const sfx = side === 'left' ? OL : W - OL - spillW;
      const sg1X = side === 'left' ? OL : W - OL;
      const sg2X = side === 'left' ? OL + spillW : W - OL - spillW;
      const spillG = `<linearGradient id="${sgid}" gradientUnits="userSpaceOnUse" x1="${sg1X}" y1="0" x2="${sg2X}" y2="0">
        <stop offset="0%"   stop-color="${p.m}" stop-opacity=".18"/>
        <stop offset="55%"  stop-color="${p.m}" stop-opacity=".06"/>
        <stop offset="100%" stop-color="${p.m}" stop-opacity="0"/>
      </linearGradient>`;
      const spill = `<rect x="${sfx}" y="${by}" width="${spillW}" height="${bh}" fill="url(#${sgid})"/>`;
      return {
        defs: grad + spillG,
        gfx: whisker + bloom + spill
      };
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "connectors/bloom-soft.js", error: String((e && e.message) || e) }); }

// connectors/celestial.js
try { (() => {
// connectors/celestial.js
// Celestial Bar
// Luminous metallic strip — full-height gradient column with an intense corona
// at the value line and a diamond glyph set into the edge. Inspired by the
// glowing chromatic side-bars in the codex-celestial card art.
(function () {
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['celestial'] = {
    name: 'Celestial Bar',
    notes: 'Full-height metallic strip; intense corona + diamond at value Y.',
    render: function (val, p, o) {
      const {
        OL,
        TM,
        ST,
        W,
        sc,
        id,
        side
      } = o;
      const cardH = TM * 2 + ST * 21; // approximate full card height
      const rx = side === 'right' ? W - OL : 0;
      const cy = TM + val * ST;

      // ── Column gradient (metallic sheen, dim → bright → dim top-to-bottom) ──
      const colGid = id + '-cel-col-' + side;
      const colGrad = `<linearGradient id="${colGid}" gradientUnits="userSpaceOnUse"
        x1="${rx}" y1="0" x2="${rx + OL}" y2="0">
        <stop offset="0%"   stop-color="${p.dim}"  stop-opacity="0"/>
        <stop offset="28%"  stop-color="${p.m}"    stop-opacity=".28"/>
        <stop offset="55%"  stop-color="${p.b}"    stop-opacity=".55"/>
        <stop offset="100%" stop-color="${p.m}"    stop-opacity=".10"/>
      </linearGradient>`;
      const col = `<rect x="${rx}" y="0" width="${OL}" height="${cardH}"
        fill="url(#${colGid})"/>`;

      // ── Corona — radial burst centred on (edge, cy) ──
      const coroGid = id + '-cel-cor-' + side;
      const coroX = side === 'left' ? 0 : W;
      const coroR = ST * 4.8;
      const coroGrad = `<radialGradient id="${coroGid}" gradientUnits="userSpaceOnUse"
        cx="${coroX}" cy="${cy}" r="${coroR}">
        <stop offset="0%"   stop-color="${p.b}"   stop-opacity=".92"/>
        <stop offset="22%"  stop-color="${p.m}"   stop-opacity=".62"/>
        <stop offset="55%"  stop-color="${p.dim}" stop-opacity=".22"/>
        <stop offset="100%" stop-color="${p.dim}" stop-opacity="0"/>
      </radialGradient>`;
      const corona = `<ellipse cx="${coroX}" cy="${cy}"
        rx="${OL * 2.2}" ry="${coroR}"
        fill="url(#${coroGid})"/>`;

      // ── Spill into card body ──
      const spillGid = id + '-cel-sp-' + side;
      const spillW = W * 0.36;
      const spillX = side === 'left' ? OL : W - OL - spillW;
      const sg1X = side === 'left' ? OL : W - OL;
      const sg2X = side === 'left' ? OL + spillW : W - OL - spillW;
      const spillGrad = `<linearGradient id="${spillGid}" gradientUnits="userSpaceOnUse"
        x1="${sg1X}" y1="0" x2="${sg2X}" y2="0">
        <stop offset="0%"   stop-color="${p.m}" stop-opacity=".22"/>
        <stop offset="100%" stop-color="${p.m}" stop-opacity="0"/>
      </linearGradient>`;
      const spill = `<rect x="${spillX}" y="${cy - ST * 3.5}"
        width="${spillW}" height="${ST * 7}"
        fill="url(#${spillGid})"/>`;

      // ── Thin bright accent line at the very card edge ──
      const lineX = side === 'left' ? 1.2 * sc : W - 1.2 * sc;
      const accent = `<line x1="${lineX}" y1="${cy - ST * 6}" x2="${lineX}" y2="${cy + ST * 6}"
        stroke="${p.b}" stroke-width="${1.4 * sc}" stroke-linecap="round" opacity=".72"/>`;

      // ── Diamond glyph at value Y ──
      const dW = OL * 0.46;
      const dH = ST * 0.88;
      const dcx = side === 'left' ? OL * 0.50 : W - OL * 0.50;
      const diamond = `<polygon points="
          ${dcx},${cy - dH}
          ${dcx + dW},${cy}
          ${dcx},${cy + dH}
          ${dcx - dW},${cy}"
        fill="${p.bg2}" stroke="${p.b}" stroke-width="${1.1 * sc}" opacity=".95"/>
        <polygon points="
          ${dcx},${cy - dH * 0.44}
          ${dcx + dW * 0.44},${cy}
          ${dcx},${cy + dH * 0.44}
          ${dcx - dW * 0.44},${cy}"
        fill="${p.b}" opacity=".82"/>`;

      // ── Tick marks above and below ──
      const tickX1 = side === 'left' ? OL * 0.18 : W - OL * 0.18;
      const tickX2 = side === 'left' ? OL * 0.82 : W - OL * 0.82;
      const ticks = [-2.2, -1.4, 1.4, 2.2].map(dt => {
        const ty = cy + dt * ST;
        const op = Math.abs(dt) < 2 ? '.52' : '.28';
        return `<line x1="${tickX1}" y1="${ty}" x2="${tickX2}" y2="${ty}"
          stroke="${p.m}" stroke-width="${0.7 * sc}" opacity="${op}"/>`;
      }).join('');
      return {
        defs: colGrad + coroGrad + spillGrad,
        gfx: col + spill + corona + accent + diamond + ticks
      };
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "connectors/celestial.js", error: String((e && e.message) || e) }); }

// connectors/notch.js
try { (() => {
// connectors/notch.js
// Notch
// Hard rectangular notch at value Y, like a lock tab.
(function () {
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['notch'] = {
    name: 'Notch',
    notes: 'Hard rectangular notch at value Y, like a lock tab.',
    render: function (val, p, o) {
      const {
        OL,
        TM,
        ST,
        W,
        sc,
        id,
        side
      } = o;
      const rx = side === 'right' ? W - OL : 0;
      const cy = TM + val * ST;
      const h = ST * 0.9;
      const poly = side === 'left' ? `<rect x="0" y="${cy - h}" width="${OL}" height="${h * 2}" fill="${p.m}" fill-opacity=".25"/>` + `<rect x="${OL - 3 * sc}" y="${cy - h}" width="${3 * sc}" height="${h * 2}" fill="${p.b}" fill-opacity=".85"/>` : `<rect x="${rx}" y="${cy - h}" width="${OL}" height="${h * 2}" fill="${p.m}" fill-opacity=".25"/>` + `<rect x="${rx}" y="${cy - h}" width="${3 * sc}" height="${h * 2}" fill="${p.b}" fill-opacity=".85"/>`;
      return {
        defs: '',
        gfx: poly
      };
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "connectors/notch.js", error: String((e && e.message) || e) }); }

// connectors/parallelogram.js
try { (() => {
// connectors/parallelogram.js
// Parallelogram Bands
// Sharp bands with vertical gradient peaking at the value line.
(function () {
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['parallelogram'] = {
    name: 'Parallelogram Bands',
    notes: 'Sharp bands with vertical gradient peaking at the value line.',
    render: function (val, p, o) {
      const {
        OL,
        TM,
        ST,
        W,
        sc,
        id,
        side
      } = o;
      const rx = side === 'right' ? W - OL : 0;
      const y1 = TM + (val - 1) * ST,
        y2 = TM + val * ST,
        y3 = TM + (val + 1) * ST;
      const gid = id + '-pg-' + side;
      const gx = side === 'left' ? OL / 2 : rx + OL / 2;
      const grad = `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${gx}" y1="${y1}" x2="${gx}" y2="${y3}">
        <stop offset="0%"   stop-color="${p.dim}"/>
        <stop offset="25%"  stop-color="${p.m}"/>
        <stop offset="50%"  stop-color="${p.b}"/>
        <stop offset="75%"  stop-color="${p.m}"/>
        <stop offset="100%" stop-color="${p.dim}"/>
      </linearGradient>`;
      const poly = side === 'left' ? `<polygon points="0,${y1} ${OL},${y2} ${OL},${y3} 0,${y2}" fill="url(#${gid})"/>` : `<polygon points="${rx},${y1} ${W},${y2} ${W},${y3} ${rx},${y2}" fill="url(#${gid})"/>`;
      return {
        defs: grad,
        gfx: poly
      };
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "connectors/parallelogram.js", error: String((e && e.message) || e) }); }

// connectors/serpent.js
try { (() => {
// connectors/serpent.js
// Serpent Wave
// A sinusoidal spine runs the full height of the connector strip, flexing
// toward the card interior at the value line — like a current winding through
// the edge. The peak brightness and maximum amplitude both land at value Y.
(function () {
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['serpent'] = {
    name: 'Serpent Wave',
    notes: 'Sinusoidal spine along the edge; amplitude and glow peak at value Y.',
    render: function (val, p, o) {
      const {
        OL,
        TM,
        ST,
        W,
        sc,
        id,
        side
      } = o;
      const cardH = TM * 2 + ST * 22;
      const cy = TM + val * ST;

      // Build a sine-like wave path that runs top → bottom along the strip.
      // The wave oscillates inward/outward. Amplitude is modulated by a
      // Gaussian bell centred at cy so the peak inflection lands at value Y.
      const N = 64;
      const edgeX = side === 'left' ? 0 : W;
      const inward = side === 'left' ? 1 : -1;
      const maxAmp = OL * 0.82;
      const period = ST * 4.4; // one full oscillation per ~4 value steps
      const sigma = ST * 4.8; // bell half-width

      function waveX(y) {
        const sigma2 = sigma * sigma;
        const env = Math.exp(-0.5 * (y - cy) * (y - cy) / sigma2);
        const phase = (y - cy) / period * Math.PI * 2;
        return edgeX + inward * maxAmp * env * Math.sin(phase);
      }

      // Primary bright spine
      const pts1 = [];
      for (let i = 0; i <= N; i++) {
        const y = i * cardH / N;
        pts1.push(`${waveX(y).toFixed(2)},${y.toFixed(2)}`);
      }
      // Offset ghost (phase-shifted by half a period)
      const pts2 = [];
      for (let i = 0; i <= N; i++) {
        const y = i * cardH / N;
        const sigma2 = sigma * sigma;
        const env = Math.exp(-0.5 * (y - cy) * (y - cy) / sigma2) * 0.55;
        const phase = (y - cy) / period * Math.PI * 2 + Math.PI * 0.5;
        const x = edgeX + inward * maxAmp * env * Math.sin(phase);
        pts2.push(`${x.toFixed(2)},${y.toFixed(2)}`);
      }
      const spine = `<polyline points="${pts1.join(' ')}"
        fill="none" stroke="${p.b}" stroke-width="${2.2 * sc}"
        stroke-linecap="round" stroke-linejoin="round" opacity=".92"/>`;
      const ghost = `<polyline points="${pts2.join(' ')}"
        fill="none" stroke="${p.m}" stroke-width="${1.1 * sc}"
        stroke-linecap="round" stroke-linejoin="round" opacity=".48"/>`;

      // ── Radial glow at peak inflection (cy) ──
      const glowGid = id + '-srp-glow-' + side;
      const apexX = waveX(cy);
      const glowR = ST * 3.6;
      const glowGrad = `<radialGradient id="${glowGid}" gradientUnits="userSpaceOnUse"
        cx="${apexX}" cy="${cy}" r="${glowR}">
        <stop offset="0%"   stop-color="${p.b}"   stop-opacity=".88"/>
        <stop offset="40%"  stop-color="${p.m}"   stop-opacity=".40"/>
        <stop offset="100%" stop-color="${p.dim}" stop-opacity="0"/>
      </radialGradient>`;
      const glow = `<circle cx="${apexX}" cy="${cy}" r="${glowR}"
        fill="url(#${glowGid})"/>`;

      // ── Small orb at the apex ──
      const orb = `<circle cx="${apexX}" cy="${cy}" r="${2.4 * sc}"
        fill="${p.b}" opacity=".90"/>
        <circle cx="${apexX}" cy="${cy}" r="${4.8 * sc}"
        fill="none" stroke="${p.b}" stroke-width="${0.9 * sc}" opacity=".45"/>`;

      // ── Trailing dot constellation along the spine ──
      const dots = [-2, -1, 1, 2].map(d => {
        const dy = cy + d * ST * 1.6;
        const dx = waveX(dy);
        const r = (1.3 - Math.abs(d) * 0.2) * sc;
        return `<circle cx="${dx.toFixed(2)}" cy="${dy.toFixed(2)}"
          r="${r}" fill="${p.m}" opacity="${0.55 - Math.abs(d) * 0.1}"/>`;
      }).join('');

      // ── Spill gradient into card body ──
      const spillGid = id + '-srp-sp-' + side;
      const spillW = W * 0.30;
      const sgX1 = side === 'left' ? OL : W - OL;
      const sgX2 = side === 'left' ? OL + spillW : W - OL - spillW;
      const spillGrad = `<linearGradient id="${spillGid}" gradientUnits="userSpaceOnUse"
        x1="${sgX1}" y1="0" x2="${sgX2}" y2="0">
        <stop offset="0%"   stop-color="${p.m}" stop-opacity=".16"/>
        <stop offset="100%" stop-color="${p.m}" stop-opacity="0"/>
      </linearGradient>`;
      const spill = `<rect x="${Math.min(sgX1, sgX2)}" y="${cy - ST * 4}"
        width="${spillW}" height="${ST * 8}"
        fill="url(#${spillGid})"/>`;
      return {
        defs: glowGrad + spillGrad,
        gfx: spill + ghost + spine + glow + orb + dots
      };
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "connectors/serpent.js", error: String((e && e.message) || e) }); }

// connectors/triangle.js
try { (() => {
// connectors/triangle.js
// Triangle
// Inward-pointing triangular wedge at value Y.
(function () {
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['triangle'] = {
    name: 'Triangle',
    notes: 'Inward-pointing triangular wedge at value Y.',
    render: function (val, p, o) {
      const {
        OL,
        TM,
        ST,
        W,
        sc,
        id,
        side
      } = o;
      const rx = side === 'right' ? W - OL : 0;
      const cy = TM + val * ST;
      const tri = side === 'left' ? `<polygon points="0,${cy - ST * 1.6} ${OL * 0.92},${cy} 0,${cy + ST * 1.6}" fill="${p.b}" fill-opacity=".75"/>` + `<polygon points="0,${cy - ST * 2.4} ${OL},${cy} 0,${cy + ST * 2.4}" fill="${p.m}" fill-opacity=".22"/>` : `<polygon points="${W},${cy - ST * 1.6} ${W - OL * 0.92},${cy} ${W},${cy + ST * 1.6}" fill="${p.b}" fill-opacity=".75"/>` + `<polygon points="${W},${cy - ST * 2.4} ${rx},${cy} ${W},${cy + ST * 2.4}" fill="${p.m}" fill-opacity=".22"/>`;
      return {
        defs: '',
        gfx: tri
      };
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "connectors/triangle.js", error: String((e && e.message) || e) }); }

// lib/cards.js
try { (() => {
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

(function () {
  // ── Palette ─────────────────────────────────────────────────────────
  const EL = {
    radiance: {
      b: '#f5c518',
      m: '#c8961a',
      dim: '#3a2800',
      bg1: '#100e04',
      bg2: '#0c0900',
      border: '#9a7010',
      name: 'RADIANCE'
    },
    void: {
      b: '#c060f0',
      m: '#6a0dad',
      dim: '#200840',
      bg1: '#09060f',
      bg2: '#06040e',
      border: '#5a10a0',
      name: 'VOID'
    },
    flux: {
      b: '#00c8b4',
      m: '#008878',
      dim: '#002820',
      bg1: '#04100d',
      bg2: '#02100d',
      border: '#009080',
      name: 'FLUX'
    },
    aether: {
      b: '#e8304a',
      m: '#c8203a',
      dim: '#400010',
      bg1: '#0d0205',
      bg2: '#0a0102',
      border: '#a81828',
      name: 'AETHER'
    }
  };
  const EORD = ['radiance', 'void', 'flux', 'aether'];
  const WILD = {
    b: '#c8d8f8',
    m: '#7080b8',
    dim: '#101828'
  };

  // ── Registries populated by connectors/*.js and art/*.js ──────────
  window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  window.AA_ART = window.AA_ART || {};

  // ── Unique-id helper (shared with variant modules via ArchmageCards.uid) ──
  let _id = 0;
  const uid = p => (p || 'c') + (++_id).toString(36);
  function polar(cx, cy, r, a) {
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  }

  // ── Shared helpers ──────────────────────────────────────────────────

  function makeTicks(p, OL, TM, ST, W, sc) {
    let t = '';
    for (let i = 0; i <= 20; i++) {
      const ty = TM + i * ST;
      const tw = i % 5 === 0 ? 7 * sc : 3.5 * sc;
      const op = i % 5 === 0 ? .22 : .1;
      t += `<line x1="0" y1="${ty}" x2="${tw}" y2="${ty}" stroke="${p.m}" stroke-opacity="${op}" stroke-width="${0.75 * sc}"/>`;
      t += `<line x1="${W}" y1="${ty}" x2="${W - tw}" y2="${ty}" stroke="${p.m}" stroke-opacity="${op}" stroke-width="${0.75 * sc}"/>`;
    }
    return t;
  }
  function makeResonanceMarks(cx, cy, r, val, e, sc) {
    let out = `<g opacity=".95">`;
    for (let i = 1; i <= 20; i++) {
      const a = -Math.PI / 2 + (i - 1) * (Math.PI * 2 / 20);
      const isActive = i === val;
      const opposite = (val + 9) % 20 + 1;
      const isOpposite = i === opposite;
      const inner = r * (isActive ? 0.99 : 1.015);
      const outer = r * (isActive ? 1.16 : isOpposite ? 1.11 : 1.07);
      const p1 = polar(cx, cy, inner, a);
      const p2 = polar(cx, cy, outer, a);
      const sw = isActive ? 1.6 * sc : isOpposite ? 1.05 * sc : 0.7 * sc;
      const op = isActive ? 0.82 : isOpposite ? 0.40 : 0.16;
      const col = isActive ? e.b : e.m;
      out += `<line x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>`;
      if (isActive || isOpposite) {
        const dot = polar(cx, cy, r * (isActive ? 1.21 : 1.14), a);
        out += `<circle cx="${dot[0].toFixed(1)}" cy="${dot[1].toFixed(1)}" r="${(isActive ? 1.9 : 1.3) * sc}" fill="${col}" opacity="${isActive ? 0.85 : 0.32}"/>`;
      }
    }
    out += `</g>`;
    return out;
  }
  function makeSharedArchitectureGlyph(cx, cy, W, H, e, val, sc) {
    let out = '';
    const inset = 18 * sc;
    const sideX = 46 * sc;
    const y = 16 * sc + val * 16 * sc;

    // quiet vertical pillars instead of concentric circles
    out += `<line x1="${cx}" y1="${inset}" x2="${cx}" y2="${(H - inset).toFixed(1)}" stroke="${e.m}" stroke-opacity=".08" stroke-width="${0.75 * sc}"/>`;
    out += `<line x1="${sideX}" y1="${(28 * sc).toFixed(1)}" x2="${sideX}" y2="${(H - 28 * sc).toFixed(1)}" stroke="${e.dim}" stroke-opacity=".11" stroke-width="${0.65 * sc}"/>`;
    out += `<line x1="${(W - sideX).toFixed(1)}" y1="${(28 * sc).toFixed(1)}" x2="${(W - sideX).toFixed(1)}" y2="${(H - 28 * sc).toFixed(1)}" stroke="${e.dim}" stroke-opacity=".11" stroke-width="${0.65 * sc}"/>`;

    // faint value emphasis near the connector strip
    out += `<line x1="${10 * sc}" y1="${y.toFixed(1)}" x2="${22 * sc}" y2="${y.toFixed(1)}" stroke="${e.m}" stroke-opacity=".18" stroke-width="${0.9 * sc}" stroke-linecap="round"/>`;
    out += `<line x1="${(W - 22 * sc).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(W - 10 * sc).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${e.m}" stroke-opacity=".18" stroke-width="${0.9 * sc}" stroke-linecap="round"/>`;

    // corner seal-work in diamond language, less HUD-like
    const corners = [[18 * sc, 18 * sc, 1, 1], [W - 18 * sc, 18 * sc, -1, 1], [18 * sc, H - 18 * sc, 1, -1], [W - 18 * sc, H - 18 * sc, -1, -1]];
    corners.forEach(([x, y, sx, sy]) => {
      const d = 4.6 * sc;
      const pts = `${x},${(y - d).toFixed(1)} ${(x + d).toFixed(1)},${y} ${x},${(y + d).toFixed(1)} ${(x - d).toFixed(1)},${y}`;
      out += `<polygon points="${pts}" fill="none" stroke="${e.m}" stroke-opacity=".16" stroke-width="${0.7 * sc}"/>`;
      out += `<line x1="${(x + sx * 7 * sc).toFixed(1)}" y1="${y}" x2="${(x + sx * 17 * sc).toFixed(1)}" y2="${(y + sy * 10 * sc).toFixed(1)}" stroke="${e.m}" stroke-opacity=".11" stroke-width="${0.7 * sc}"/>`;
      out += `<line x1="${x}" y1="${(y + sy * 7 * sc).toFixed(1)}" x2="${(x + sx * 10 * sc).toFixed(1)}" y2="${(y + sy * 17 * sc).toFixed(1)}" stroke="${e.m}" stroke-opacity=".11" stroke-width="${0.7 * sc}"/>`;
    });
    return out;
  }
  function makeSharedArchitecture(cx, cy, W, H, e, val, sc) {
    const outerR = W * 0.40;
    const midR = W * 0.315;
    const innerR = W * 0.215;
    let out = '';

    // ghost circles / engraved calibration
    out += `<circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="${e.m}" stroke-opacity=".045" stroke-width="${sc}"/>`;
    out += `<circle cx="${cx}" cy="${cy}" r="${midR}" fill="none" stroke="${e.m}" stroke-opacity=".060" stroke-width="${sc}"/>`;
    out += `<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="${e.m}" stroke-opacity=".070" stroke-width="${sc}"/>`;

    // ritual sight-lines linking the medallion to the card body
    const gap = innerR * 0.82;
    const inset = 20 * sc;
    out += `<line x1="${cx}" y1="${inset}" x2="${cx}" y2="${(cy - gap).toFixed(1)}" stroke="${e.m}" stroke-opacity=".10" stroke-width="${0.75 * sc}"/>`;
    out += `<line x1="${cx}" y1="${(cy + gap).toFixed(1)}" x2="${cx}" y2="${(H - inset).toFixed(1)}" stroke="${e.m}" stroke-opacity=".10" stroke-width="${0.75 * sc}"/>`;
    out += `<line x1="${inset}" y1="${cy}" x2="${(cx - gap).toFixed(1)}" y2="${cy}" stroke="${e.m}" stroke-opacity=".08" stroke-width="${0.7 * sc}"/>`;
    out += `<line x1="${(cx + gap).toFixed(1)}" y1="${cy}" x2="${(W - inset).toFixed(1)}" y2="${cy}" stroke="${e.m}" stroke-opacity=".08" stroke-width="${0.7 * sc}"/>`;

    // restrained corner seal-work: circles + diagonal braces so it feels engraved, not techy
    const corners = [[18 * sc, 18 * sc, 1, 1], [W - 18 * sc, 18 * sc, -1, 1], [18 * sc, H - 18 * sc, 1, -1], [W - 18 * sc, H - 18 * sc, -1, -1]];
    corners.forEach(([x, y, sx, sy]) => {
      out += `<circle cx="${x}" cy="${y}" r="${4.5 * sc}" fill="none" stroke="${e.m}" stroke-opacity=".18" stroke-width="${0.7 * sc}"/>`;
      out += `<line x1="${x}" y1="${(y + sy * 7 * sc).toFixed(1)}" x2="${(x + sx * 11 * sc).toFixed(1)}" y2="${(y + sy * 18 * sc).toFixed(1)}" stroke="${e.m}" stroke-opacity=".12" stroke-width="${0.7 * sc}"/>`;
      out += `<line x1="${(x + sx * 7 * sc).toFixed(1)}" y1="${y}" x2="${(x + sx * 18 * sc).toFixed(1)}" y2="${(y + sy * 11 * sc).toFixed(1)}" stroke="${e.m}" stroke-opacity=".12" stroke-width="${0.7 * sc}"/>`;
    });

    // resonance ring makes each value feel like a frequency, not a personality
    out += makeResonanceMarks(cx, cy, outerR * 0.92, val, e, sc);
    return out;
  }
  function makeWildConvergenceArt(cx, cy, artR, sc) {
    const silver = {
      b: '#d8e2f6',
      m: '#8a96b8',
      dim: '#141b28'
    };
    let art = '';
    art += `<circle cx="${cx}" cy="${cy}" r="${artR * 1.02}" fill="none" stroke="${silver.dim}" stroke-width="${artR * 0.16}" opacity=".96"/>`;
    art += `<circle cx="${cx}" cy="${cy}" r="${artR * 1.02}" fill="none" stroke="${silver.m}" stroke-width="${0.9 * sc}" opacity=".55"/>`;
    art += `<circle cx="${cx}" cy="${cy}" r="${artR * 0.76}" fill="none" stroke="${silver.m}" stroke-width="${0.8 * sc}" opacity=".24"/>`;
    art += `<circle cx="${cx}" cy="${cy}" r="${artR * 0.41}" fill="none" stroke="${silver.m}" stroke-width="${0.8 * sc}" opacity=".30"/>`;

    // four current arcs — disciplined convergence, not a rainbow blast
    art += `<path d="M ${cx} ${cy - artR * 0.78} A ${artR * 0.78} ${artR * 0.78} 0 0 1 ${cx + artR * 0.78} ${cy}" fill="none" stroke="${EL.radiance.b}" stroke-width="${1.9 * sc}" opacity=".72"/>`;
    art += `<path d="M ${cx + artR * 0.78} ${cy} A ${artR * 0.78} ${artR * 0.78} 0 0 1 ${cx} ${cy + artR * 0.78}" fill="none" stroke="${EL.aether.b}" stroke-width="${1.9 * sc}" opacity=".72"/>`;
    art += `<path d="M ${cx} ${cy + artR * 0.78} A ${artR * 0.78} ${artR * 0.78} 0 0 1 ${cx - artR * 0.78} ${cy}" fill="none" stroke="${EL.flux.b}" stroke-width="${1.9 * sc}" opacity=".72"/>`;
    art += `<path d="M ${cx - artR * 0.78} ${cy} A ${artR * 0.78} ${artR * 0.78} 0 0 1 ${cx} ${cy - artR * 0.78}" fill="none" stroke="${EL.void.b}" stroke-width="${1.9 * sc}" opacity=".72"/>`;

    // radiance: restrained cardinal rays
    for (let a = 0; a < 8; a++) {
      const ang = a * Math.PI / 4;
      const p1 = polar(cx, cy, artR * 0.42, ang);
      const p2 = polar(cx, cy, artR * (a % 2 === 0 ? 0.95 : 0.78), ang);
      art += `<line x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}" stroke="${EL.radiance.b}" stroke-width="${(a % 2 === 0 ? 1.25 : 0.7) * sc}" stroke-linecap="round" opacity="${a % 2 === 0 ? 0.34 : 0.18}"/>`;
    }

    // flux: layered wave paths through the center
    for (let i = -1; i <= 1; i++) {
      const yy = cy + i * artR * 0.17;
      const sw = i === 0 ? 1.7 * sc : 0.9 * sc;
      const op = i === 0 ? 0.52 : 0.24;
      art += `<path d="M ${(cx - artR * 0.80).toFixed(1)},${yy.toFixed(1)} Q ${(cx - artR * 0.38).toFixed(1)},${(yy - artR * 0.12).toFixed(1)} ${cx.toFixed(1)},${yy.toFixed(1)} Q ${(cx + artR * 0.38).toFixed(1)},${(yy + artR * 0.12).toFixed(1)} ${(cx + artR * 0.80).toFixed(1)},${yy.toFixed(1)}" fill="none" stroke="${EL.flux.b}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>`;
    }

    // aether: an octagram lattice with nodes
    const pts = [];
    for (let a = 0; a < 8; a++) {
      const ang = a * Math.PI / 4 - Math.PI / 8;
      const rr = a % 2 === 0 ? artR * 0.60 : artR * 0.34;
      pts.push(`${(cx + Math.cos(ang) * rr).toFixed(1)},${(cy + Math.sin(ang) * rr).toFixed(1)}`);
    }
    art += `<polygon points="${pts.join(' ')}" fill="none" stroke="${EL.aether.b}" stroke-width="${1.15 * sc}" opacity=".58"/>`;
    for (let a = 0; a < 8; a += 2) {
      const ang = a * Math.PI / 4 - Math.PI / 8;
      const nx = cx + Math.cos(ang) * artR * 0.60;
      const ny = cy + Math.sin(ang) * artR * 0.60;
      art += `<line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="${EL.aether.b}" stroke-width="${0.7 * sc}" opacity=".24"/>`;
      art += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${2.2 * sc}" fill="${silver.b}" stroke="${EL.aether.b}" stroke-width="${0.7 * sc}" opacity=".78"/>`;
    }

    // void: spiral + sparse stars
    const stars = [[-0.62, -0.28], [0.58, -0.35], [-0.52, 0.49], [0.61, 0.41], [-0.08, -0.66], [0.11, 0.67]];
    stars.forEach(([dx, dy], idx) => {
      art += `<circle cx="${(cx + dx * artR).toFixed(1)}" cy="${(cy + dy * artR).toFixed(1)}" r="${(idx % 2 === 0 ? 1.6 : 1.1) * sc}" fill="${EL.void.b}" opacity="${idx % 2 === 0 ? 0.40 : 0.24}"/>`;
    });
    const spiral = [[0, artR * 0.66, artR * 0.50], [Math.PI * 0.5, artR * 0.52, artR * 0.38], [Math.PI, artR * 0.40, artR * 0.28], [Math.PI * 1.5, artR * 0.30, artR * 0.18]];
    spiral.forEach(([startA, ra, rb]) => {
      const x1 = cx + Math.cos(startA) * ra;
      const y1 = cy + Math.sin(startA) * ra;
      const x2 = cx + Math.cos(startA + Math.PI) * rb;
      const y2 = cy + Math.sin(startA + Math.PI) * rb;
      const rAvg = (ra + rb) / 2;
      art += `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} A${rAvg.toFixed(1)},${rAvg.toFixed(1)} 0 0,1 ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${EL.void.b}" stroke-width="${1.0 * sc}" opacity=".44"/>`;
    });

    // central convergence kite
    const sz = artR * 0.24;
    const inn = sz * 0.34;
    const cols = [EL.radiance.b, EL.aether.b, EL.flux.b, EL.void.b];
    const kitePts = [`${cx},${cy - sz} ${cx + inn},${cy - inn} ${cx},${cy} ${cx - inn},${cy - inn}`, `${cx + sz},${cy} ${cx + inn},${cy + inn} ${cx},${cy} ${cx + inn},${cy - inn}`, `${cx},${cy + sz} ${cx - inn},${cy + inn} ${cx},${cy} ${cx + inn},${cy + inn}`, `${cx - sz},${cy} ${cx - inn},${cy - inn} ${cx},${cy} ${cx - inn},${cy + inn}`];
    kitePts.forEach((pts, i) => {
      art += `<polygon points="${pts}" fill="${cols[i]}" opacity=".88"/>`;
    });
    art += `<circle cx="${cx}" cy="${cy}" r="${artR * 0.09}" fill="${silver.b}" opacity=".95"/>`;
    return art;
  }

  // ── Layout variants ────────────────────────────────────────────────
  const LayoutVariants = {
    classic: {
      pipTop: 28,
      pipSize: 20,
      labelBelow: true,
      numSize: 28,
      numPos: 'medallion'
    },
    compact: {
      pipTop: 22,
      pipSize: 16,
      labelBelow: false,
      numSize: 22,
      numPos: 'medallion'
    },
    regal: {
      pipTop: 34,
      pipSize: 24,
      labelBelow: true,
      numSize: 32,
      numPos: 'medallion'
    },
    flag: {
      pipTop: 28,
      pipSize: 20,
      labelBelow: true,
      numSize: 34,
      numPos: 'top'
    },
    // big numeral up top
    tarot: {
      pipTop: 26,
      pipSize: 16,
      labelBelow: true,
      numSize: 32,
      numPos: 'top-circle',
      artScale: 1.28
    } // circle medallion at top, large name at bottom
  };

  // ── Dispatchers that read from the registries ─────────────────────
  function getConnector(name) {
    const reg = window.AA_CONNECTORS || {};
    return reg[name] || reg['bloom-soft'] || Object.values(reg)[0];
  }
  function getArt(name) {
    const reg = window.AA_ART || {};
    return reg[name] || reg['sigil'] || Object.values(reg)[0];
  }
  function normalizeLayoutFx(fx) {
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
  function renderTinyCurrentGlyph(elem, x, y, size, sc) {
    const p = elem === 'wild' ? WILD : EL[elem];
    const s = size;
    if (elem === 'wild') {
      const inn = s * 0.32;
      const cols = [EL.radiance.b, EL.aether.b, EL.flux.b, EL.void.b];
      const polys = [`${x},${y - s} ${x + inn},${y - inn} ${x},${y} ${x - inn},${y - inn}`, `${x + s},${y} ${x + inn},${y + inn} ${x},${y} ${x + inn},${y - inn}`, `${x},${y + s} ${x - inn},${y + inn} ${x},${y} ${x + inn},${y + inn}`, `${x - s},${y} ${x - inn},${y - inn} ${x},${y} ${x - inn},${y + inn}`];
      let out = '';
      polys.forEach((pts, i) => {
        out += `<polygon points="${pts}" fill="${cols[i]}" opacity=".86"/>`;
      });
      out += `<circle cx="${x}" cy="${y}" r="${s * 0.18}" fill="#edf2ff" opacity=".92"/>`;
      return out;
    }
    if (elem === 'radiance') {
      return `<circle cx="${x}" cy="${y}" r="${s * 0.20}" fill="${p.b}" opacity=".94"/>` + `<line x1="${x}" y1="${(y - s).toFixed(1)}" x2="${x}" y2="${(y - s * 0.42).toFixed(1)}" stroke="${p.b}" stroke-width="${0.95 * sc}" stroke-linecap="round" opacity=".92"/>` + `<line x1="${x}" y1="${(y + s).toFixed(1)}" x2="${x}" y2="${(y + s * 0.42).toFixed(1)}" stroke="${p.b}" stroke-width="${0.95 * sc}" stroke-linecap="round" opacity=".92"/>` + `<line x1="${(x - s).toFixed(1)}" y1="${y}" x2="${(x - s * 0.42).toFixed(1)}" y2="${y}" stroke="${p.b}" stroke-width="${0.95 * sc}" stroke-linecap="round" opacity=".92"/>` + `<line x1="${(x + s).toFixed(1)}" y1="${y}" x2="${(x + s * 0.42).toFixed(1)}" y2="${y}" stroke="${p.b}" stroke-width="${0.95 * sc}" stroke-linecap="round" opacity=".92"/>`;
    }
    if (elem === 'void') {
      const r1 = s * 0.76,
        r2 = s * 0.54;
      return `<path d="M ${(x - r1).toFixed(1)} ${y.toFixed(1)} A ${r1.toFixed(1)} ${r1.toFixed(1)} 0 1 1 ${(x + r1).toFixed(1)} ${y.toFixed(1)} A ${r2.toFixed(1)} ${r2.toFixed(1)} 0 1 0 ${(x - r1).toFixed(1)} ${y.toFixed(1)} Z" fill="${p.b}" opacity=".84"/>` + `<circle cx="${(x + s * 0.52).toFixed(1)}" cy="${(y - s * 0.30).toFixed(1)}" r="${0.16 * s}" fill="${p.b}" opacity=".72"/>`;
    }
    if (elem === 'flux') {
      const sw = 0.9 * sc;
      return `<path d="M ${(x - s).toFixed(1)},${(y - s * 0.22).toFixed(1)} Q ${x.toFixed(1)},${(y - s * 0.72).toFixed(1)} ${(x + s).toFixed(1)},${(y - s * 0.22).toFixed(1)}" fill="none" stroke="${p.b}" stroke-width="${sw}" stroke-linecap="round" opacity=".90"/>` + `<path d="M ${(x - s).toFixed(1)},${(y + s * 0.24).toFixed(1)} Q ${x.toFixed(1)},${(y + s * 0.74).toFixed(1)} ${(x + s).toFixed(1)},${(y + s * 0.24).toFixed(1)}" fill="none" stroke="${p.b}" stroke-width="${sw}" stroke-linecap="round" opacity=".76"/>`;
    }
    const diamond = `${x},${(y - s).toFixed(1)} ${(x + s).toFixed(1)},${y} ${x},${(y + s).toFixed(1)} ${(x - s).toFixed(1)},${y}`;
    return `<polygon points="${diamond}" fill="none" stroke="${p.b}" stroke-width="${0.95 * sc}" opacity=".88"/>` + `<line x1="${x}" y1="${(y - s * 0.66).toFixed(1)}" x2="${x}" y2="${(y + s * 0.66).toFixed(1)}" stroke="${p.b}" stroke-width="${0.72 * sc}" opacity=".56"/>` + `<line x1="${(x - s * 0.66).toFixed(1)}" y1="${y}" x2="${(x + s * 0.66).toFixed(1)}" y2="${y}" stroke="${p.b}" stroke-width="${0.72 * sc}" opacity=".56"/>`;
  }
  function makeConnectorSeparator(fx, W, H, OL, sc, p) {
    if (!fx.separator || fx.separator === 'none') return '';
    const leftX = OL;
    const rightX = W - OL;
    const y = 12 * sc;
    const h = H - 24 * sc;
    const wantRight = fx.connectorPlacement !== 'left-only';
    let out = '';
    if (fx.separator === 'line') {
      out += `<line x1="${leftX.toFixed(1)}" y1="${y.toFixed(1)}" x2="${leftX.toFixed(1)}" y2="${(y + h).toFixed(1)}" stroke="${p.m}" stroke-opacity=".24" stroke-width="${0.9 * sc}"/>`;
      if (wantRight) out += `<line x1="${rightX.toFixed(1)}" y1="${y.toFixed(1)}" x2="${rightX.toFixed(1)}" y2="${(y + h).toFixed(1)}" stroke="${p.m}" stroke-opacity=".24" stroke-width="${0.9 * sc}"/>`;
      return out;
    }
    const bw = 7 * sc;
    out += `<rect x="${(leftX - bw).toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${p.dim}" fill-opacity=".14"/>`;
    out += `<line x1="${leftX.toFixed(1)}" y1="${y.toFixed(1)}" x2="${leftX.toFixed(1)}" y2="${(y + h).toFixed(1)}" stroke="${p.m}" stroke-opacity=".30" stroke-width="${0.95 * sc}"/>`;
    if (wantRight) {
      out += `<rect x="${rightX.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${p.dim}" fill-opacity=".14"/>`;
      out += `<line x1="${rightX.toFixed(1)}" y1="${y.toFixed(1)}" x2="${rightX.toFixed(1)}" y2="${(y + h).toFixed(1)}" stroke="${p.m}" stroke-opacity=".30" stroke-width="${0.95 * sc}"/>`;
    }
    return out;
  }

  // ── Tarot ornate corner brackets ────────────────────────────────────
  function renderTarotCorners(W, H, e, sc) {
    const inset = 10 * sc;
    const L = 20 * sc;
    const dm = 4.8 * sc;
    let out = '';
    [[inset, inset, 1, 1], [W - inset, inset, -1, 1], [inset, H - inset, 1, -1], [W - inset, H - inset, -1, -1]].forEach(([x, y, sx, sy]) => {
      // Bracket arms
      out += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + sx * L).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${e.b}" stroke-width="${(1.15 * sc).toFixed(1)}" opacity=".54" stroke-linecap="round"/>`;
      out += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y + sy * L).toFixed(1)}" stroke="${e.b}" stroke-width="${(1.15 * sc).toFixed(1)}" opacity=".54" stroke-linecap="round"/>`;
      // Diamond at corner joint
      out += `<polygon points="${x},${(y - dm).toFixed(1)} ${(x + dm).toFixed(1)},${y} ${x},${(y + dm).toFixed(1)} ${(x - dm).toFixed(1)},${y}" fill="${e.bg2}" stroke="${e.b}" stroke-width="${(0.9 * sc).toFixed(1)}" opacity=".78"/>`;
      // Tiny bright tip-dots at arm ends
      out += `<circle cx="${(x + sx * L).toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.7 * sc).toFixed(1)}" fill="${e.m}" opacity=".55"/>`;
      out += `<circle cx="${x.toFixed(1)}" cy="${(y + sy * L).toFixed(1)}" r="${(1.7 * sc).toFixed(1)}" fill="${e.m}" opacity=".55"/>`;
      // Inner secondary bracket (shorter, dimmer)
      const L2 = L * 0.50,
        off = 5 * sc;
      out += `<line x1="${(x + sx * off).toFixed(1)}" y1="${(y + sy * off).toFixed(1)}" x2="${(x + sx * (off + L2)).toFixed(1)}" y2="${(y + sy * off).toFixed(1)}" stroke="${e.m}" stroke-width="${(0.6 * sc).toFixed(1)}" opacity=".30" stroke-linecap="round"/>`;
      out += `<line x1="${(x + sx * off).toFixed(1)}" y1="${(y + sy * off).toFixed(1)}" x2="${(x + sx * off).toFixed(1)}" y2="${(y + sy * (off + L2)).toFixed(1)}" stroke="${e.m}" stroke-width="${(0.6 * sc).toFixed(1)}" opacity=".30" stroke-linecap="round"/>`;
    });
    return out;
  }

  // ── makeCard ────────────────────────────────────────────────────────
  function makeCard(val, elem, opts) {
    opts = opts || {};
    const connectorName = opts.connector || 'bloom-soft';
    const artKind = opts.art || 'sigil';
    const layout = LayoutVariants[opts.layout || 'classic'];
    const fx = normalizeLayoutFx(opts.layoutFx);
    const sc = opts.scale || 1;
    const W = 252 * sc,
      H = 352 * sc,
      R = 12 * sc,
      OL = 36 * sc,
      TM = 16 * sc,
      ST = 16 * sc;
    const e = EL[elem];
    const id = uid('c' + elem[0] + val);
    const isTarot = layout.numPos === 'top-circle';
    const cx = W / 2,
      cy = H * 0.48,
      artR = W * 0.29 * (layout.artScale || 1);
    const conn = getConnector(connectorName);
    const L = conn.render(val, e, {
      OL,
      TM,
      ST,
      W,
      sc,
      id,
      side: 'left'
    });
    const rightVal = fx.connectorPlacement === 'mirrored' ? 21 - val : val;
    const Ri = fx.connectorPlacement === 'left-only' ? {
      defs: '',
      gfx: ''
    } : conn.render(rightVal, e, {
      OL,
      TM,
      ST,
      W,
      sc,
      id,
      side: 'right'
    });
    const artFn = getArt(artKind);
    const art = artFn.render(elem, cx, cy, artR, e, {
      W,
      H,
      sc,
      OL,
      TM,
      ST,
      val
    });
    const ticks = makeTicks(e, OL, TM, ST, W, sc);
    const architecture = artKind === 'glyph' ? makeSharedArchitectureGlyph(cx, cy, W, H, e, val, sc) : makeSharedArchitecture(cx, cy, W, H, e, val, sc);
    const separator = makeConnectorSeparator(fx, W, H, OL, sc, e);
    const innerFrame = fx.innerFrame ? `<rect x="${(OL + 12 * sc).toFixed(1)}" y="${(18 * sc).toFixed(1)}" width="${(W - 2 * (OL + 12 * sc)).toFixed(1)}" height="${(H - 36 * sc).toFixed(1)}" rx="${(10 * sc).toFixed(1)}" ry="${(10 * sc).toFixed(1)}" fill="none" stroke="${e.m}" stroke-opacity=".20" stroke-width="${0.9 * sc}"/>` : '';
    const pipSz = Math.round(layout.pipSize * fx.cornerScale * sc),
      pipX = OL / 2,
      pipY = layout.pipTop * sc;
    const flt = 'url(#' + id + '-s)';
    const invCX = W - OL / 2,
      invCY = H - 28 * sc;
    const numSz = Math.round(layout.numSize * fx.centreScale * sc);
    const numX = cx,
      numY = cy + numSz * 0.34;
    const cornerStroke = fx.cornerLift ? ` stroke="${e.bg1}" stroke-width="${0.75 * sc}" paint-order="stroke fill" ` : '';
    const cornerFillOpacity = fx.cornerLift ? '.99' : '.92';
    const cornerGlyphY = pipY + Math.max(9 * sc, pipSz * 0.52);
    const cornerGlyphSize = Math.max(3.8 * sc, pipSz * 0.23);
    const topCircleY = TM + ST * 3.0;
    const topCircleR = numSz * 0.76;
    const topNumeral = layout.numPos === 'top' ? `<text x="${cx}" y="${TM + ST * 4.05}" font-family="Cinzel,serif" font-weight="900" font-size="${numSz * 1.32}" fill="${e.b}" fill-opacity=".90" filter="${flt}" text-anchor="middle">${val}</text>` : isTarot ? `<circle cx="${cx}" cy="${topCircleY.toFixed(1)}" r="${(topCircleR * 1.30).toFixed(1)}" fill="${e.bg2}" fill-opacity=".96"/>
<circle cx="${cx}" cy="${topCircleY.toFixed(1)}" r="${(topCircleR * 1.30).toFixed(1)}" fill="none" stroke="${e.b}" stroke-width="${(1.5 * sc).toFixed(1)}" opacity=".90"/>
<circle cx="${cx}" cy="${topCircleY.toFixed(1)}" r="${(topCircleR * 1.54).toFixed(1)}" fill="none" stroke="${e.m}" stroke-width="${(0.65 * sc).toFixed(1)}" opacity=".38"/>
<text x="${cx}" y="${(topCircleY + numSz * 0.36).toFixed(1)}" font-family="Cinzel,serif" font-weight="700" font-size="${numSz}" fill="${e.b}" fill-opacity=".92" filter="${flt}" text-anchor="middle">${val}</text>` : '';
    const medNum = layout.numPos === 'medallion' ? `<text x="${numX}" y="${numY}" font-family="Cinzel,serif" font-weight="700" font-size="${numSz}" fill="${e.b}" fill-opacity=".88" filter="${flt}" text-anchor="middle">${val}</text>` : '';
    const label = isTarot && layout.labelBelow ? `<line x1="${(cx - 30 * sc).toFixed(1)}" y1="${(H - 40 * sc).toFixed(1)}" x2="${(cx + 30 * sc).toFixed(1)}" y2="${(H - 40 * sc).toFixed(1)}" stroke="${e.m}" stroke-opacity=".36" stroke-width="${(0.8 * sc).toFixed(1)}"/>
<text x="${cx}" y="${(H - 26 * sc).toFixed(1)}" font-family="Cinzel,serif" font-weight="600" font-size="${(10 * sc).toFixed(1)}" fill="${e.b}" fill-opacity=".84" text-anchor="middle" letter-spacing="${(2.6 * sc).toFixed(1)}">${e.name}</text>
<line x1="${(cx - 22 * sc).toFixed(1)}" y1="${(H - 16 * sc).toFixed(1)}" x2="${(cx + 22 * sc).toFixed(1)}" y2="${(H - 16 * sc).toFixed(1)}" stroke="${e.m}" stroke-opacity=".22" stroke-width="${(0.55 * sc).toFixed(1)}"/>` : layout.labelBelow ? `<text x="${cx}" y="${cy + artR * 0.88}" font-family="Cinzel,serif" font-weight="600" font-size="${7 * sc}" fill="${e.m}" fill-opacity=".72" text-anchor="middle" letter-spacing="${1.7 * sc}">${e.name}</text>` : '';
    const topLabel = layout.labelBelow && fx.mirroredLabel ? `<text x="${cx}" y="${cy - artR * 0.80}" transform="rotate(180 ${cx} ${cy - artR * 0.80})" font-family="Cinzel,serif" font-weight="600" font-size="${7 * sc}" fill="${e.m}" fill-opacity=".62" text-anchor="middle" letter-spacing="${1.7 * sc}">${e.name}</text>` : '';
    const suitGlyphTR = isTarot ? renderTinyCurrentGlyph(elem, W - pipX, pipY - pipSz * 0.5, Math.max(5 * sc, pipSz * 0.62), sc) : '';
    const topLeftCorner = `<text x="${pipX}" y="${pipY}" font-family="Cinzel,serif" font-weight="700" font-size="${pipSz}" fill="${e.b}" fill-opacity="${cornerFillOpacity}" filter="${flt}" text-anchor="middle"${cornerStroke}>${val}</text>` + (fx.cornerGlyph || isTarot ? renderTinyCurrentGlyph(elem, pipX, cornerGlyphY, cornerGlyphSize, sc) : '');
    const bottomRightCorner = `<g transform="translate(${invCX},${invCY}) rotate(180)" opacity=".66">` + `<text x="0" y="${-12 * sc}" font-family="Cinzel,serif" font-weight="700" font-size="${pipSz}" fill="${e.b}" fill-opacity="${fx.cornerLift ? '.96' : '.86'}" filter="${flt}" text-anchor="middle"${cornerStroke}>${val}</text>` + (fx.cornerGlyph ? renderTinyCurrentGlyph(elem, 0, -12 * sc + Math.max(9 * sc, pipSz * 0.52), cornerGlyphSize, sc) : '') + `</g>`;
    const extraCorners = fx.allCorners ? `<g opacity=".86"><text x="${(W - OL / 2).toFixed(1)}" y="${pipY}" font-family="Cinzel,serif" font-weight="700" font-size="${pipSz}" fill="${e.b}" fill-opacity="${cornerFillOpacity}" filter="${flt}" text-anchor="middle"${cornerStroke}>${val}</text>${fx.cornerGlyph ? renderTinyCurrentGlyph(elem, W - OL / 2, cornerGlyphY, cornerGlyphSize, sc) : ''}</g>` + `<g transform="translate(${(OL / 2).toFixed(1)},${(H - 28 * sc).toFixed(1)}) rotate(180)" opacity=".56"><text x="0" y="${-12 * sc}" font-family="Cinzel,serif" font-weight="700" font-size="${pipSz}" fill="${e.b}" fill-opacity="${fx.cornerLift ? '.95' : '.84'}" filter="${flt}" text-anchor="middle"${cornerStroke}>${val}</text>${fx.cornerGlyph ? renderTinyCurrentGlyph(elem, 0, -12 * sc + Math.max(9 * sc, pipSz * 0.52), cornerGlyphSize, sc) : ''}</g>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="card-face">
    <defs>
      <clipPath id="${id}-c"><rect width="${W}" height="${H}" rx="${R}" ry="${R}"/></clipPath>
      <filter id="${id}-s"><feDropShadow dx="0" dy="${sc}" stdDeviation="${2.4 * sc}" flood-color="#000" flood-opacity=".84"/></filter>
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
    </defs>
    <g clip-path="url(#${id}-c)">
      <rect width="${W}" height="${H}" fill="url(#${id}-bg)"/>
      <rect width="${W}" height="${H}" fill="url(#${id}-g)"/>
      <rect width="${W}" height="${H}" fill="url(#${id}-v)"/>
      ${architecture}
      ${ticks}
      ${L.gfx}${Ri.gfx}
      ${separator}
      ${innerFrame}
      ${art}
      ${topNumeral}
      ${medNum}
      ${label}
      ${topLabel}
      ${topLeftCorner}
      ${suitGlyphTR}
      ${bottomRightCorner}
      ${extraCorners}
      <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${R - 0.5}" ry="${R - 0.5}" fill="none" stroke="${e.m}" stroke-opacity=".34" stroke-width="${sc}"/>
      <rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="${R - 2}" ry="${R - 2}" fill="none" stroke="${e.m}" stroke-opacity=".14" stroke-width="${0.6 * sc}"/>
      <rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="${R - 4.5}" ry="${R - 4.5}" fill="none" stroke="${e.dim}" stroke-opacity=".18" stroke-width="${0.8 * sc}"/>
      ${isTarot ? renderTarotCorners(W, H, e, sc) : ''}
    </g>
  </svg>`;
  }

  // ── makeWildCard ────────────────────────────────────────────────────
  function makeWildCard(opts) {
    opts = opts || {};
    const connectorName = opts.connector || 'bloom-soft';
    const conn = getConnector(connectorName);
    const fx = normalizeLayoutFx(opts.layoutFx);
    const sc = opts.scale || 1;
    const W = 252 * sc,
      H = 352 * sc,
      R = 12 * sc,
      OL = 36 * sc,
      TM = 16 * sc,
      ST = 16 * sc;
    const id = uid('w');
    const p = {
      b: '#cdd8f0',
      m: '#7c88aa',
      dim: '#121826'
    };
    let defs = '',
      gfx = '';
    for (let v = 1; v <= 20; v++) {
      const L = conn.render(v, p, {
        OL,
        TM,
        ST,
        W,
        sc,
        id: id + 'v' + v,
        side: 'left'
      });
      defs += L.defs;
      gfx += L.gfx;
      if (fx.connectorPlacement !== 'left-only') {
        const Ri = conn.render(v, p, {
          OL,
          TM,
          ST,
          W,
          sc,
          id: id + 'v' + v,
          side: 'right'
        });
        defs += Ri.defs;
        gfx += Ri.gfx;
      }
    }
    const wildOpacity = {
      bloom: 0.26,
      parallelogram: 0.16,
      triangle: 0.18,
      notch: 0.20,
      beacon: 0.30
    }[connectorName === 'bloom-soft' ? 'bloom' : connectorName] || 0.24;
    const cx = W / 2,
      cy = H * 0.48,
      artR = W * 0.29;
    const ticks = makeTicks({
      m: p.m
    }, OL, TM, ST, W, sc);
    const pipSz = Math.round(22 * fx.cornerScale * sc),
      pipX = OL / 2,
      pipY = 28 * sc;
    const invCX = W - OL / 2,
      invCY = H - 28 * sc;
    const rulesY = H - 8 * sc,
      rulesSz = Math.round(7 * sc);
    const cornerGlyphSize = Math.max(3.8 * sc, pipSz * 0.23);
    const separator = makeConnectorSeparator(fx, W, H, OL, sc, p);
    const innerFrame = fx.innerFrame ? `<rect x="${(OL + 12 * sc).toFixed(1)}" y="${(18 * sc).toFixed(1)}" width="${(W - 2 * (OL + 12 * sc)).toFixed(1)}" height="${(H - 36 * sc).toFixed(1)}" rx="${(10 * sc).toFixed(1)}" ry="${(10 * sc).toFixed(1)}" fill="none" stroke="${p.m}" stroke-opacity=".18" stroke-width="${0.9 * sc}"/>` : '';
    const architecture = (() => {
      let out = '';
      out += `<circle cx="${cx}" cy="${cy}" r="${W * 0.40}" fill="none" stroke="${p.m}" stroke-opacity=".06" stroke-width="${sc}"/>`;
      out += `<circle cx="${cx}" cy="${cy}" r="${W * 0.315}" fill="none" stroke="${p.m}" stroke-opacity=".08" stroke-width="${sc}"/>`;
      out += `<circle cx="${cx}" cy="${cy}" r="${W * 0.215}" fill="none" stroke="${p.m}" stroke-opacity=".09" stroke-width="${sc}"/>`;
      const corners = [[18 * sc, 18 * sc, 1, 1], [W - 18 * sc, 18 * sc, -1, 1], [18 * sc, H - 18 * sc, 1, -1], [W - 18 * sc, H - 18 * sc, -1, -1]];
      corners.forEach(([x, y, sx, sy]) => {
        out += `<circle cx="${x}" cy="${y}" r="${4.5 * sc}" fill="none" stroke="${p.m}" stroke-opacity=".18" stroke-width="${0.7 * sc}"/>`;
        out += `<line x1="${x}" y1="${(y + sy * 7 * sc).toFixed(1)}" x2="${(x + sx * 11 * sc).toFixed(1)}" y2="${(y + sy * 18 * sc).toFixed(1)}" stroke="${p.m}" stroke-opacity=".12" stroke-width="${0.7 * sc}"/>`;
        out += `<line x1="${(x + sx * 7 * sc).toFixed(1)}" y1="${y}" x2="${(x + sx * 18 * sc).toFixed(1)}" y2="${(y + sy * 11 * sc).toFixed(1)}" stroke="${p.m}" stroke-opacity=".12" stroke-width="${0.7 * sc}"/>`;
      });
      return out;
    })();
    const art = makeWildConvergenceArt(cx, cy, artR, sc);
    const topLeftCorner = renderTinyCurrentGlyph('wild', pipX, pipY - pipSz * 0.5, pipSz * 0.46, sc);
    const bottomRightCorner = `<g transform="translate(${invCX},${invCY}) rotate(180)" opacity=".62">${renderTinyCurrentGlyph('wild', 0, -pipSz * 0.5, pipSz * 0.46, sc)}</g>`;
    const extraCorners = fx.allCorners ? `<g opacity=".80">${renderTinyCurrentGlyph('wild', W - OL / 2, pipY - pipSz * 0.5, pipSz * 0.46, sc)}</g>` + `<g transform="translate(${(OL / 2).toFixed(1)},${(H - 28 * sc).toFixed(1)}) rotate(180)" opacity=".56">${renderTinyCurrentGlyph('wild', 0, -pipSz * 0.5, pipSz * 0.46, sc)}</g>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="card-face">
    <defs>
      <clipPath id="${id}-c"><rect width="${W}" height="${H}" rx="${R}" ry="${R}"/></clipPath>
      <filter id="${id}-s"><feDropShadow dx="0" dy="${sc}" stdDeviation="${2.4 * sc}" flood-color="#000" flood-opacity=".84"/></filter>
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
        <rect x="0" y="0" width="${OL}" height="${H}" fill="url(#${id}-fade)"/>
        ${fx.connectorPlacement !== 'left-only' ? `<rect x="${W - OL}" y="0" width="${OL}" height="${H}" fill="url(#${id}-fade)"/>` : ''}
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
      <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${R - 0.5}" ry="${R - 0.5}" fill="none" stroke="${p.m}" stroke-opacity=".34" stroke-width="${sc}"/>
      <rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="${R - 2}" ry="${R - 2}" fill="none" stroke="${p.m}" stroke-opacity=".12" stroke-width="${0.6 * sc}"/>
      <rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="${R - 4.5}" ry="${R - 4.5}" fill="none" stroke="${p.dim}" stroke-opacity=".22" stroke-width="${0.8 * sc}"/>
      ${topLeftCorner}
      ${bottomRightCorner}
      ${extraCorners}
      <text x="${W / 2}" y="${rulesY}" font-family="Cormorant Garamond,serif" font-style="italic" font-size="${rulesSz}" fill="${p.b}" fill-opacity=".36" text-anchor="middle">Convergence of the four currents</text>
    </g>
  </svg>`;
  }

  // ── Fan / deck builders ────────────────────────────────────────────
  function buildFan(el, cards, opts) {
    opts = opts || {};
    const sc = opts.scale || 1;
    const OL = 36 * sc;
    cards.forEach((c, i) => {
      const last = i === cards.length - 1;
      const slot = document.createElement('div');
      slot.style.cssText = `position:relative;height:${352 * sc}px;flex-shrink:0;${last ? `width:${252 * sc}px` : `width:${OL}px;overflow:visible`};`;
      const face = document.createElement('div');
      face.style.cssText = `position:absolute;left:0;top:0;width:${252 * sc}px;height:${352 * sc}px;`;
      face.innerHTML = c.e === 'wild' ? makeWildCard({
        ...opts
      }) : makeCard(c.v, c.e, opts);
      slot.appendChild(face);
      el.appendChild(slot);
    });
  }
  function buildCards(el, cards, opts) {
    opts = opts || {};
    const sc = opts.scale || 1;
    cards.forEach(c => {
      const wrap = document.createElement('div');
      wrap.style.cssText = `display:inline-block;margin:0 10px 10px 0;`;
      wrap.innerHTML = c.e === 'wild' ? makeWildCard(opts) : makeCard(c.v, c.e, opts);
      el.appendChild(wrap);
    });
  }

  // ── Public API ──────────────────────────────────────────────────────
  window.ArchmageCards = {
    EL,
    EORD,
    WILD,
    uid,
    polar,
    makeTicks,
    makeResonanceMarks,
    makeSharedArchitectureGlyph,
    makeSharedArchitecture,
    makeWildConvergenceArt,
    LayoutVariants,
    getConnector,
    getArt,
    makeCard,
    makeWildCard,
    buildFan,
    buildCards,
    // Legacy shims — ConnectorVariants[name] works like before
    get ConnectorVariants() {
      const out = {};
      for (const k in window.AA_CONNECTORS || {}) out[k] = window.AA_CONNECTORS[k].render;
      return out;
    },
    get EnergyArtVariants() {
      const out = {};
      for (const k in window.AA_ART || {}) out[k] = window.AA_ART[k].render;
      return out;
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "lib/cards.js", error: String((e && e.message) || e) }); }

// ui_kits/card-game/Card.jsx
try { (() => {
// Card.jsx — React wrapper that drives a DOM re-render when variant changes
const {
  useRef,
  useEffect
} = React;
function Card({
  value,
  element,
  variant = {},
  scale = 1,
  style = {},
  onClick
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (value === 0 || element === 'wild') {
      ref.current.innerHTML = ArchmageCards.makeWildCard({
        scale
      });
    } else {
      ref.current.innerHTML = ArchmageCards.makeCard(value, element, {
        ...variant,
        scale
      });
    }
  }, [value, element, variant.connector, variant.art, variant.back, scale]);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    onClick: onClick,
    style: {
      width: 252 * scale,
      height: 352 * scale,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform .25s cubic-bezier(.2,.8,.2,1), filter .25s',
      ...style
    }
  });
}
// window.ACard is the legacy global name — Hand.jsx (and the raw-script dev preview)
// reference it as a bare identifier, so it is kept alongside the `Card` export above.
window.ACard = Card;
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/card-game/Card.jsx", error: String((e && e.message) || e) }); }

// ui_kits/card-game/Controls.jsx
try { (() => {
// Controls.jsx — right-side rail to cycle variants
const {
  useState
} = React;
function Controls({
  variant,
  setVariant,
  onCast,
  onReset,
  canCast
}) {
  // Derive available options from the renderer — auto-updates when lib/cards.js grows
  const connectors = Object.keys(ArchmageCards.ConnectorVariants);
  const artKinds = Object.keys(ArchmageCards.EnergyArtVariants);
  const seg = (label, val, options, key) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: segLbl
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      flexWrap: 'wrap'
    }
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o,
    onClick: () => setVariant({
      ...variant,
      [key]: o
    }),
    style: {
      ...segBtn,
      ...(val === o ? segActive : {})
    }
  }, o))));
  return /*#__PURE__*/React.createElement("aside", {
    style: rail
  }, /*#__PURE__*/React.createElement("div", {
    style: railTitle
  }, "Crucible"), seg('Connector', variant.connector, connectors, 'connector'), seg('Energy art', variant.art, artKinds, 'art'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onCast,
    disabled: !canCast,
    style: {
      ...castBtn,
      opacity: canCast ? 1 : .35
    }
  }, "Cast Spell"), /*#__PURE__*/React.createElement("button", {
    onClick: onReset,
    style: resetBtn
  }, "Return to hand")));
}
window.Controls = Controls;
const rail = {
  width: 220,
  flexShrink: 0,
  background: 'linear-gradient(180deg,#120a1c 0%,#0a0810 100%)',
  borderLeft: '1px solid #2a1e48',
  padding: '28px 20px',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100%'
};
const railTitle = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 14,
  letterSpacing: '.3em',
  textTransform: 'uppercase',
  color: 'var(--gold)',
  marginBottom: 28,
  borderBottom: '1px solid #2a1e48',
  paddingBottom: 12
};
const segLbl = {
  fontFamily: 'var(--font-display)',
  fontSize: 9,
  letterSpacing: '.3em',
  textTransform: 'uppercase',
  color: 'var(--page-dim-deeper)'
};
const segBtn = {
  fontFamily: 'var(--font-display)',
  fontSize: 9,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  padding: '5px 8px',
  borderRadius: 3,
  background: 'transparent',
  border: '1px solid #2a1e48',
  color: 'var(--page-soft)',
  cursor: 'pointer'
};
const segActive = {
  background: 'rgba(200,168,74,.12)',
  borderColor: 'var(--gold)',
  color: 'var(--gold)'
};
const castBtn = {
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: 11,
  letterSpacing: '.2em',
  textTransform: 'uppercase',
  background: 'linear-gradient(180deg,#b89028,#8a6810)',
  color: '#0a0810',
  border: '1px solid #e0b848',
  padding: '11px 16px',
  borderRadius: 4,
  cursor: 'pointer'
};
const resetBtn = {
  fontFamily: 'var(--font-display)',
  fontSize: 10,
  letterSpacing: '.22em',
  textTransform: 'uppercase',
  background: 'transparent',
  border: '1px solid #4a3868',
  color: 'var(--page-soft)',
  padding: '9px 16px',
  borderRadius: 4,
  cursor: 'pointer'
};
Object.assign(__ds_scope, { Controls });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/card-game/Controls.jsx", error: String((e && e.message) || e) }); }

// ui_kits/card-game/Hand.jsx
try { (() => {
// Hand.jsx — bottom fan of 5 cards, click to stage
const {
  useState
} = React;
function Hand({
  cards,
  onPick,
  variant
}) {
  const [hover, setHover] = useState(-1);
  const N = cards.length;
  const spread = 14; // deg per card from center
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 560,
      height: 160,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      perspective: '1200px'
    }
  }, cards.map((c, i) => {
    const mid = (N - 1) / 2;
    const rot = (i - mid) * spread;
    const lift = hover === i ? -80 : 0;
    const tz = hover === i ? 40 : 0;
    return /*#__PURE__*/React.createElement("div", {
      key: c.key,
      onMouseEnter: () => setHover(i),
      onMouseLeave: () => setHover(-1),
      onClick: () => onPick(c),
      style: {
        position: 'absolute',
        bottom: 0,
        left: `calc(50% + ${(i - mid) * 52}px - 65px)`,
        transform: `rotate(${rot}deg) translateY(${lift}px) translateZ(${tz}px)`,
        transformOrigin: '50% 140%',
        transition: 'transform .25s cubic-bezier(.2,.8,.2,1)',
        zIndex: hover === i ? 10 : i,
        filter: hover === i ? 'drop-shadow(0 12px 24px rgba(0,0,0,.6))' : 'drop-shadow(0 4px 8px rgba(0,0,0,.5))',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(ACard, {
      value: c.v,
      element: c.e,
      variant: variant,
      scale: 0.5
    }));
  }));
}
window.Hand = Hand;
Object.assign(__ds_scope, { Hand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/card-game/Hand.jsx", error: String((e && e.message) || e) }); }

// ui_kits/card-game/PlayTable.jsx
try { (() => {
// PlayTable.jsx — scene assembly
const {
  useState,
  useMemo
} = React;
const STARTER_HAND = [{
  key: 'h1',
  v: 7,
  e: 'radiance'
}, {
  key: 'h2',
  v: 8,
  e: 'radiance'
}, {
  key: 'h3',
  v: 9,
  e: 'radiance'
}, {
  key: 'h4',
  v: 12,
  e: 'void'
}, {
  key: 'h5',
  v: 4,
  e: 'flux'
}, {
  key: 'h6',
  v: 15,
  e: 'aether'
}, {
  key: 'h7',
  v: 0,
  e: 'wild'
}];
function PlayTable() {
  const [hand, setHand] = useState(STARTER_HAND);
  const [stage, setStage] = useState([]);
  const [variant, setVariant] = useState({
    connector: 'bloom',
    art: 'sigil'
  });
  const [pulse, setPulse] = useState(false);
  const pick = c => {
    // order bound cards: same-suit → by value ascending; else append
    setHand(h => h.filter(x => x.key !== c.key));
    setStage(s => {
      const next = [...s, c];
      const allSame = next.every(x => x.e === next[0].e && x.e !== 'wild');
      if (allSame) next.sort((a, b) => a.v - b.v);
      return next;
    });
  };
  const remove = c => {
    setStage(s => s.filter(x => x.key !== c.key));
    setHand(h => [...h, c]);
  };
  const cast = () => {
    setPulse(true);
    setTimeout(() => {
      setPulse(false);
      setStage([]);
    }, 900);
  };
  const reset = () => {
    setHand(h => [...h, ...stage]);
    setStage([]);
  };
  const canCast = stage.length >= 2;
  return /*#__PURE__*/React.createElement("div", {
    style: tableShell
  }, /*#__PURE__*/React.createElement("main", {
    style: mainCol
  }, /*#__PURE__*/React.createElement("header", {
    style: headerBar
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: brandGlyph
  }, "\u2726"), /*#__PURE__*/React.createElement("span", {
    style: brandName
  }, "Archmage Ascension"), /*#__PURE__*/React.createElement("span", {
    style: divider
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    style: subtitle
  }, "Turn III \u2014 The Convergence")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Meter, {
    label: "Mana",
    value: 7,
    max: 10
  }), /*#__PURE__*/React.createElement(Meter, {
    label: "Sway",
    value: 4,
    max: 10,
    tone: "purple"
  }))), /*#__PURE__*/React.createElement("section", {
    style: opponent
  }, /*#__PURE__*/React.createElement("div", {
    style: opponentLabel
  }, "Opponent \xB7 Arkady of the Sundered Glass"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      justifyContent: 'center'
    }
  }, [0, 1, 2, 3, 4, 5].map(i => /*#__PURE__*/React.createElement(CardBack, {
    key: i
  })))), /*#__PURE__*/React.createElement("section", {
    style: stageWrap
  }, /*#__PURE__*/React.createElement(SpellStage, {
    cards: stage,
    variant: variant,
    onRemove: remove,
    pulse: pulse
  })), /*#__PURE__*/React.createElement("section", {
    style: handWrap
  }, /*#__PURE__*/React.createElement(Hand, {
    cards: hand,
    onPick: pick,
    variant: variant
  }))), /*#__PURE__*/React.createElement(Controls, {
    variant: variant,
    setVariant: setVariant,
    onCast: cast,
    onReset: reset,
    canCast: canCast
  }));
}
window.PlayTable = PlayTable;
function Meter({
  label,
  value,
  max,
  tone
}) {
  const color = tone === 'purple' ? '#c060f0' : '#f5c518';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 9,
      letterSpacing: '.28em',
      textTransform: 'uppercase',
      color: 'var(--page-dim-deeper)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 3
    }
  }, Array.from({
    length: max
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: 10,
      height: 10,
      borderRadius: 2,
      background: i < value ? color : '#1a1128',
      boxShadow: i < value ? `0 0 6px ${color}99` : 'none'
    }
  }))));
}
function CardBack() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 64,
      borderRadius: 5,
      background: 'radial-gradient(circle at 50% 50%, #1a1028 0%, #06040c 70%)',
      border: '1px solid #3a2858',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 10px rgba(0,0,0,.5), inset 0 0 0 1px rgba(200,168,74,.08)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#c8a84a',
      fontSize: 14,
      opacity: .7
    }
  }, "\u2726"));
}
const tableShell = {
  display: 'flex',
  height: '100vh',
  overflow: 'hidden',
  background: 'radial-gradient(ellipse at 50% 40%, #1a1028 0%, #0a0810 60%, #04030a 100%)',
  color: 'var(--page-text)'
};
const mainCol = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '0 0 12px 0'
};
const headerBar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 28px',
  borderBottom: '1px solid #2a1e48',
  flexShrink: 0
};
const brandGlyph = {
  color: 'var(--gold)',
  fontSize: 18
};
const brandName = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 16,
  letterSpacing: '.22em',
  textTransform: 'uppercase',
  color: '#c8b8e8'
};
const divider = {
  color: 'var(--page-dim-deeper)'
};
const subtitle = {
  fontFamily: 'var(--font-body)',
  fontStyle: 'italic',
  fontSize: 14,
  color: 'var(--page-soft)'
};
const opponent = {
  padding: '12px 28px 6px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  flexShrink: 0
};
const opponentLabel = {
  fontFamily: 'var(--font-display)',
  fontSize: 10,
  letterSpacing: '.3em',
  textTransform: 'uppercase',
  color: 'var(--page-dim)'
};
const stageWrap = {
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '4px 28px',
  minHeight: 0,
  borderTop: '1px solid #1a1028',
  borderBottom: '1px solid #1a1028',
  background: 'radial-gradient(ellipse at 50% 50%, rgba(200,168,74,.04) 0%, transparent 70%)'
};
const handWrap = {
  padding: '6px 28px 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 6,
  flexShrink: 0
};
const handLabel = {
  fontFamily: 'var(--font-display)',
  fontSize: 10,
  letterSpacing: '.3em',
  textTransform: 'uppercase',
  color: 'var(--page-dim)'
};
Object.assign(__ds_scope, { PlayTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/card-game/PlayTable.jsx", error: String((e && e.message) || e) }); }

// ui_kits/card-game/SpellStage.jsx
try { (() => {
// SpellStage.jsx — center play zone; consecutive-bloom fan
const {
  useRef,
  useEffect
} = React;
function SpellStage({
  cards,
  variant,
  onRemove,
  pulse
}) {
  const hostRef = useRef(null);
  useEffect(() => {
    if (!hostRef.current) return;
    hostRef.current.innerHTML = '';
    if (!cards.length) return;
    ArchmageCards.buildFan(hostRef.current, cards.map(c => c.e === 'wild' ? {
      v: 0,
      e: 'wild'
    } : {
      v: c.v,
      e: c.e
    }), {
      scale: 0.56,
      ...variant
    });
    // overlay click-to-remove on each card slot
    const slots = hostRef.current.children;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      slot.style.cursor = 'pointer';
      slot.onclick = () => onRemove(cards[i]);
    }
  }, [cards, variant.connector, variant.art]);
  const meta = readSpell(cards);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      padding: '8px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: 180,
      filter: pulse ? 'drop-shadow(0 0 40px rgba(245,197,24,.6))' : 'none',
      transition: 'filter .4s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: hostRef,
    style: {
      display: 'inline-flex',
      position: 'relative'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 10,
      letterSpacing: '.3em',
      textTransform: 'uppercase',
      color: meta.valid ? 'var(--gold)' : 'var(--page-dim-deeper)',
      textAlign: 'center',
      minHeight: 12
    }
  }, meta.label), meta.flavor && cards.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontStyle: 'italic',
      fontSize: 13,
      color: 'var(--page-soft)',
      textAlign: 'center',
      maxWidth: 420,
      lineHeight: 1.5
    }
  }, meta.flavor));
}
window.SpellStage = SpellStage;
function readSpell(cards) {
  if (!cards.length) return {
    label: '— empty crucible —',
    valid: false,
    flavor: ''
  };
  if (cards.length === 1) {
    return {
      label: `${cards[0].e} · value ${cards[0].v}`,
      valid: false,
      flavor: 'Awaiting resonance.'
    };
  }
  const vals = cards.map(c => c.v).sort((a, b) => a - b);
  const sameSuit = cards.every(c => c.e === cards[0].e);
  const consecutive = vals.every((v, i) => i === 0 || v === vals[i - 1] + 1);
  const sameVal = vals.every(v => v === vals[0]);
  if (sameSuit && consecutive) return {
    label: `${cards[0].e} bloom · ${vals.length} bound`,
    valid: true,
    flavor: 'Consecutive values in one element — blooms overlap at the join, resonant and clean.'
  };
  if (sameVal) return {
    label: `chromatic ${vals[0]}s · ${cards.length} elements`,
    valid: true,
    flavor: 'Same value across elements — the chromatic strip shifts hue across the join.'
  };
  return {
    label: 'discordant — no binding',
    valid: false,
    flavor: 'Cold dark strips at the visible edges. No warmth crosses between unrelated cards.'
  };
}
Object.assign(__ds_scope, { SpellStage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/card-game/SpellStage.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Controls = __ds_scope.Controls;

__ds_ns.Hand = __ds_scope.Hand;

__ds_ns.PlayTable = __ds_scope.PlayTable;

__ds_ns.SpellStage = __ds_scope.SpellStage;

})();
