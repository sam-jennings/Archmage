// connectors/beacon.js
// Beacon
// Round glowing orb at value Y, rings around it.
(function(){
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['beacon'] = {
    name: 'Beacon',
    notes: 'Round glowing orb at value Y, concentric halo rings. Orb clamped away from card corners.',
    render: function(val, p, o){
      const {OL, TM, ST, W, sc, id, side} = o;
      const H    = 358 * sc;
      const cx   = side === 'left' ? OL * 0.5 : W - OL * 0.5;
      const rawCy = TM + val * ST;
      const margin = 44 * sc;
      const cy   = Math.max(margin, Math.min(H - margin, rawCy));
      const gid  = id + '-bcn-' + side;

      const orbR  = 7.5 * sc;
      const halo1 = orbR * 2.2;
      const halo2 = orbR * 3.6;

      const grad = `<radialGradient id="${gid}" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="${p.b}"   stop-opacity=".98"/>
        <stop offset="40%"  stop-color="${p.m}"   stop-opacity=".60"/>
        <stop offset="100%" stop-color="${p.dim}"  stop-opacity="0"/>
      </radialGradient>`;

      let gfx = '';
      // Soft glow fill (large radial wash)
      gfx += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${halo2.toFixed(1)}" fill="url(#${gid})"/>`;
      // Halo rings
      gfx += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${halo2.toFixed(1)}" fill="none" stroke="${p.m}" stroke-width="${0.6*sc}" opacity=".30"/>`;
      gfx += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${halo1.toFixed(1)}" fill="none" stroke="${p.b}" stroke-width="${0.75*sc}" opacity=".45"/>`;
      // Solid orb core
      gfx += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${orbR.toFixed(1)}" fill="${p.b}" opacity=".92"/>`;

      return { defs: grad, gfx };
    }
  };
})();
