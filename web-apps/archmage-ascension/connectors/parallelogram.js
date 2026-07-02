// connectors/parallelogram.js
// Parallelogram Bands
// Sharp bands with vertical gradient peaking at the value line.
(function(){
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['parallelogram'] = {
    name: 'Parallelogram Bands',
    notes: 'Sharp bands with vertical gradient peaking at the value line.',
    render: function(val, p, o){
      const {OL,TM,ST,W,sc,id,side} = o;
      const rx = side==='right' ? W-OL : 0;
      const y1=TM+(val-1)*ST, y2=TM+val*ST, y3=TM+(val+1)*ST;
      const gid = id+'-pg-'+side;
      const gx = side==='left' ? OL/2 : rx+OL/2;
      const grad = `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${gx}" y1="${y1}" x2="${gx}" y2="${y3}">
        <stop offset="0%"   stop-color="${p.dim}"/>
        <stop offset="25%"  stop-color="${p.m}"/>
        <stop offset="50%"  stop-color="${p.b}"/>
        <stop offset="75%"  stop-color="${p.m}"/>
        <stop offset="100%" stop-color="${p.dim}"/>
      </linearGradient>`;
      const poly = side==='left'
        ? `<polygon points="0,${y1} ${OL},${y2} ${OL},${y3} 0,${y2}" fill="url(#${gid})"/>`
        : `<polygon points="${rx},${y1} ${W},${y2} ${W},${y3} ${rx},${y2}" fill="url(#${gid})"/>`;
      return { defs: grad, gfx: poly };
    }
  };
})();
