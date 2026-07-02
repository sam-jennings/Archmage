// connectors/celestial.js
// Celestial Bar
// Luminous metallic strip — full-height gradient column with an intense corona
// at the value line and a diamond glyph set into the edge. Inspired by the
// glowing chromatic side-bars in the codex-celestial card art.
(function(){
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['celestial'] = {
    name: 'Celestial Bar',
    notes: 'Full-height metallic strip; intense corona + diamond at value Y.',
    render: function(val, p, o){
      const {OL, TM, ST, W, sc, id, side} = o;
      const cardH = TM * 2 + ST * 21; // approximate full card height
      const rx    = side === 'right' ? W - OL : 0;
      const cy    = TM + val * ST;

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
      const coroX   = side === 'left' ? 0 : W;
      const coroR   = ST * 4.8;
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
      const spillW   = W * 0.36;
      const spillX   = side === 'left' ? OL : W - OL - spillW;
      const sg1X     = side === 'left' ? OL        : W - OL;
      const sg2X     = side === 'left' ? OL + spillW : W - OL - spillW;
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
      const dW  = OL * 0.46;
      const dH  = ST * 0.88;
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
        gfx:  col + spill + corona + accent + diamond + ticks
      };
    }
  };
})();
