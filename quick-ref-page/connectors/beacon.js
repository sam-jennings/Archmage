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
      const cx = side==='left' ? OL*0.5 : W-OL*0.5;
      const cy = TM + val*ST;
      const gid = id+'-bcn-'+side;
      const grad = `<radialGradient id="${gid}">
        <stop offset="0%" stop-color="${p.b}" stop-opacity=".95"/>
        <stop offset="45%" stop-color="${p.m}" stop-opacity=".55"/>
        <stop offset="100%" stop-color="${p.dim}" stop-opacity="0"/>
      </radialGradient>`;
      const orb = `<circle cx="${cx}" cy="${cy}" r="${ST*3}" fill="url(#${gid})"/>`
        + `<circle cx="${cx}" cy="${cy}" r="${ST*0.5}" fill="${p.b}"/>`;
      return { defs: grad, gfx: orb };
    }
  };
})();
