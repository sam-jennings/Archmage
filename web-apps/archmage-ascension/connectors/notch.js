// connectors/notch.js
// Notch
// Hard rectangular notch at value Y, like a lock tab.
(function(){
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['notch'] = {
    name: 'Notch',
    notes: 'Hard rectangular notch at value Y, like a lock tab.',
    render: function(val, p, o){
      const {OL,TM,ST,W,sc,id,side} = o;
      const rx = side==='right' ? W-OL : 0;
      const cy = TM + val*ST;
      const h = ST*0.9;
      const poly = side==='left'
        ? `<rect x="0" y="${cy-h}" width="${OL}" height="${h*2}" fill="${p.m}" fill-opacity=".25"/>`
          + `<rect x="${OL-3*sc}" y="${cy-h}" width="${3*sc}" height="${h*2}" fill="${p.b}" fill-opacity=".85"/>`
        : `<rect x="${rx}" y="${cy-h}" width="${OL}" height="${h*2}" fill="${p.m}" fill-opacity=".25"/>`
          + `<rect x="${rx}" y="${cy-h}" width="${3*sc}" height="${h*2}" fill="${p.b}" fill-opacity=".85"/>`;
      return { defs:'', gfx: poly };
    }
  };
})();
