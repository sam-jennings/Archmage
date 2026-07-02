// connectors/triangle.js
// Triangle
// Inward-pointing triangular wedge at value Y.
(function(){
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['triangle'] = {
    name: 'Triangle',
    notes: 'Inward-pointing triangular wedge at value Y.',
    render: function(val, p, o){
      const {OL,TM,ST,W,sc,id,side} = o;
      const rx = side==='right' ? W-OL : 0;
      const cy = TM + val*ST;
      const tri = side==='left'
        ? `<polygon points="0,${cy-ST*1.6} ${OL*0.92},${cy} 0,${cy+ST*1.6}" fill="${p.b}" fill-opacity=".75"/>`
          + `<polygon points="0,${cy-ST*2.4} ${OL},${cy} 0,${cy+ST*2.4}" fill="${p.m}" fill-opacity=".22"/>`
        : `<polygon points="${W},${cy-ST*1.6} ${W-OL*0.92},${cy} ${W},${cy+ST*1.6}" fill="${p.b}" fill-opacity=".75"/>`
          + `<polygon points="${W},${cy-ST*2.4} ${rx},${cy} ${W},${cy+ST*2.4}" fill="${p.m}" fill-opacity=".22"/>`;
      return { defs:'', gfx: tri };
    }
  };
})();
