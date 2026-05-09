// connectors/serpent.js
// Serpent Wave
// A sinusoidal spine runs the full height of the connector strip, flexing
// toward the card interior at the value line — like a current winding through
// the edge. The peak brightness and maximum amplitude both land at value Y.
(function(){
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['serpent'] = {
    name: 'Serpent Wave',
    notes: 'Sinusoidal spine along the edge; amplitude and glow peak at value Y.',
    render: function(val, p, o){
      const {OL, TM, ST, W, sc, id, side} = o;
      const cardH = TM * 2 + ST * 22;
      const cy    = TM + val * ST;

      // Build a sine-like wave path that runs top → bottom along the strip.
      // The wave oscillates inward/outward. Amplitude is modulated by a
      // Gaussian bell centred at cy so the peak inflection lands at value Y.
      const N      = 64;
      const edgeX  = side === 'left' ? 0 : W;
      const inward = side === 'left' ? 1 : -1;
      const maxAmp = OL * 0.82;
      const period = ST * 4.4;        // one full oscillation per ~4 value steps
      const sigma  = ST * 4.8;        // bell half-width

      function waveX(y){
        const sigma2 = sigma * sigma;
        const env    = Math.exp(-0.5 * (y - cy) * (y - cy) / sigma2);
        const phase  = ((y - cy) / period) * Math.PI * 2;
        return edgeX + inward * maxAmp * env * Math.sin(phase);
      }

      // Primary bright spine
      const pts1 = [];
      for (let i = 0; i <= N; i++){
        const y = i * cardH / N;
        pts1.push(`${waveX(y).toFixed(2)},${y.toFixed(2)}`);
      }
      // Offset ghost (phase-shifted by half a period)
      const pts2 = [];
      for (let i = 0; i <= N; i++){
        const y = i * cardH / N;
        const sigma2 = sigma * sigma;
        const env  = Math.exp(-0.5 * (y - cy) * (y - cy) / sigma2) * 0.55;
        const phase = ((y - cy) / period) * Math.PI * 2 + Math.PI * 0.5;
        const x     = edgeX + inward * maxAmp * env * Math.sin(phase);
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
      const apexX   = waveX(cy);
      const glowR   = ST * 3.6;
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
        const r  = (1.3 - Math.abs(d) * 0.2) * sc;
        return `<circle cx="${dx.toFixed(2)}" cy="${dy.toFixed(2)}"
          r="${r}" fill="${p.m}" opacity="${0.55 - Math.abs(d)*0.1}"/>`;
      }).join('');

      // ── Spill gradient into card body ──
      const spillGid = id + '-srp-sp-' + side;
      const spillW   = W * 0.30;
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
        gfx:  spill + ghost + spine + glow + orb + dots
      };
    }
  };
})();
