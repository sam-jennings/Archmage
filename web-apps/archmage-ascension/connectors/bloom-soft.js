// connectors/bloom-soft.js
// Bloom Soft
// Soft radial bloom. Torchlight through a crack — current LIVE default.
(function(){
  const AA = window.AA_CONNECTORS = window.AA_CONNECTORS || {};
  AA['bloom-soft'] = {
    name: 'Bloom Soft',
    notes: 'Soft radial bloom. Torchlight through a crack — current LIVE default.',
    render: function(val, p, o){
      const {OL,TM,ST,W,sc,id,side} = o;
      const rx = side==='right' ? W-OL : 0;
      const bloomCY = TM + val*ST;
      const bloomH  = ST * 5.5;
      const y1 = TM+(val-1)*ST, y2 = TM+val*ST, y3 = TM+(val+1)*ST;
      const whisker = side==='left'
        ? `<polygon points="0,${y1} ${OL},${y2} ${OL},${y3} 0,${y2}" fill="${p.m}" fill-opacity=".18"/>`
        : `<polygon points="${rx},${y1} ${W},${y2} ${W},${y3} ${rx},${y2}" fill="${p.m}" fill-opacity=".18"/>`;
      const bx=rx, by=bloomCY-bloomH, bw=OL, bh=bloomH*2;
      const gid = id+'-bloom-'+side;
      const grad = `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${bx}" y1="${by}" x2="${bx}" y2="${by+bh}">
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
      const sgid = id+'-spill-'+side;
      const spillW = W*0.42;
      const sfx = side==='left' ? OL : W-OL-spillW;
      const sg1X = side==='left' ? OL : W-OL;
      const sg2X = side==='left' ? OL+spillW : W-OL-spillW;
      const spillG = `<linearGradient id="${sgid}" gradientUnits="userSpaceOnUse" x1="${sg1X}" y1="0" x2="${sg2X}" y2="0">
        <stop offset="0%"   stop-color="${p.m}" stop-opacity=".18"/>
        <stop offset="55%"  stop-color="${p.m}" stop-opacity=".06"/>
        <stop offset="100%" stop-color="${p.m}" stop-opacity="0"/>
      </linearGradient>`;
      const spill = `<rect x="${sfx}" y="${by}" width="${spillW}" height="${bh}" fill="url(#${sgid})"/>`;
      return { defs: grad+spillG, gfx: whisker+bloom+spill };
    }
  };
})();
