// connectors/beacon.js
// Beacon
// Round glowing orb at value Y, rings around it.
(function(){
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['beacon'] = {
    name: 'Beacon',
    notes: 'Round glowing orb at value Y, rings around it.',
    render: function(val, p, o){
      const {OL,TM,ST,W,sc,id,side} = o;
      const H = 358*sc;  // card height in px
      const cx = side==='left' ? OL*0.5 : W-OL*0.5;
      const rawCy = TM + val*ST;
      const margin = 44*sc;  // keeps orb clear of corner numbers (pip sits at ~28px)
      const cy = Math.max(margin, Math.min(H - margin, rawCy));
      const gid = id+'-bcn-'+side;
      const grad = `<radialGradient id="${gid}">
        <stop offset="0%" stop-color="${p.b}" stop-opacity=".95"/>
        <stop offset="45%" stop-color="${p.m}" stop-opacity=".55"/>
        <stop offset="100%" stop-color="${p.dim}" stop-opacity="0"/>
      </radialGradient>`;
      const glowR = OL * 1.1;   // glow fills the strip width — ~6 mm
      const dotR  = OL * 0.18;  // bright dot ~1 mm
      const orb = `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${glowR.toFixed(2)}" fill="url(#${gid})"/>`
        + `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${dotR.toFixed(2)}" fill="${p.b}"/>`;
      return { defs: grad, gfx: orb };
    }
  };
})();
