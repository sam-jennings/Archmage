// art/sigil.js
// Sigil
// Concentric rings, starfield, waves, lattice — the original LIVE art.
(function(){
  const AA = window.AA_ART = window.AA_ART || {};
  AA['sigil'] = {
    name: 'Sigil',
    notes: 'Concentric rings, starfield, waves, lattice — the original LIVE art.',
    render: function(elem, cx, cy, artR, e){
      const s = artR / 82;
      const tx = cx - 100*s, ty = cy - 160*s;
      let art = `<g transform="translate(${tx},${ty}) scale(${s})">`;
      if (elem==='radiance'){
        art += `<circle cx="100" cy="160" r="82" fill="none" stroke="#2a1c00" stroke-width="16"/>`
          + `<circle cx="100" cy="160" r="82" fill="none" stroke="#5a3c04" stroke-width="6"/>`
          + `<circle cx="100" cy="160" r="82" fill="none" stroke="#8a6010" stroke-width="1.5"/>`
          + `<circle cx="100" cy="160" r="64" fill="none" stroke="#1e1400" stroke-width="8"/>`
          + `<circle cx="100" cy="160" r="64" fill="none" stroke="#3c2802" stroke-width="2"/>`
          + `<circle cx="100" cy="160" r="50" fill="none" stroke="#6a4808" stroke-width="1"/>`;
        // rays
        const rays = [[100,70,100,57,2.2],[100,250,100,263,2.2],[10,160,-3,160,2.2],[190,160,203,160,2.2],
          [36,96,27,87,1.8],[164,224,173,233,1.8],[164,96,173,87,1.8],[36,224,27,233,1.8]];
        rays.forEach(r=>{ art += `<line x1="${r[0]}" y1="${r[1]}" x2="${r[2]}" y2="${r[3]}" stroke="#c8961a" stroke-width="${r[4]}" stroke-linecap="round"/>`; });
        art += `<circle cx="100" cy="160" r="44" fill="${e.bg2}"/>`
          + `<circle cx="100" cy="160" r="44" fill="none" stroke="#8a6010" stroke-width="1.2"/>`;
      } else if (elem==='void'){
        const stars = [[18,18,.9,.45],[58,12,.7,.35],[108,25,1.1,.45],[148,15,.8,.35],[188,30,.9,.45],
          [6,90,.7,.40],[192,95,1.0,.45],[12,250,.9,.45],[80,272,.7,.40],[138,268,1.1,.45],
          [190,252,.8,.40],[196,160,.9,.45],[4,190,.7,.40],[52,45,1.0,.45],[166,52,.8,.40]];
        stars.forEach(st=>{ art += `<circle cx="${st[0]}" cy="${st[1]}" r="${st[2]}" fill="#c060f0" opacity="${st[3]}"/>`; });
        art += `<circle cx="100" cy="160" r="84" fill="none" stroke="#180840" stroke-width="14"/>`
          + `<circle cx="100" cy="160" r="84" fill="none" stroke="#2e1065" stroke-width="5"/>`
          + `<circle cx="100" cy="160" r="84" fill="none" stroke="#5a1a9a" stroke-width="1.5"/>`
          + `<circle cx="100" cy="160" r="65" fill="none" stroke="#120630" stroke-width="7"/>`
          + `<circle cx="100" cy="160" r="65" fill="none" stroke="#3a1078" stroke-width="1.5"/>`
          + `<circle cx="100" cy="160" r="50" fill="none" stroke="#5020a0" stroke-width="1"/>`
          + `<path d="M100,160 Q138,110 162,100 Q190,90 194,118 Q198,146 172,160 Q146,174 130,202 Q114,228 122,250" fill="none" stroke="#6a0dad" stroke-width="1.5" opacity="0.75"/>`
          + `<path d="M100,160 Q62,210 38,220 Q10,230 6,202 Q2,174 28,160 Q54,146 68,116 Q82,88 72,64" fill="none" stroke="#6a0dad" stroke-width="1.5" opacity="0.75"/>`
          + `<circle cx="100" cy="160" r="44" fill="${e.bg2}"/>`
          + `<circle cx="100" cy="160" r="44" fill="none" stroke="#5a1a9a" stroke-width="1.2"/>`;
      } else if (elem==='flux'){
        const waves = [80,105,130,190,215,240];
        waves.forEach(yy=>{ art += `<path d="M5,${yy} Q30,${yy-22} 55,${yy} Q80,${yy+22} 105,${yy} Q130,${yy-22} 155,${yy} Q180,${yy+22} 195,${yy}" fill="none" stroke="#003828" stroke-width="1.2"/>`; });
        art += `<path d="M5,55 Q30,33 55,55 Q80,77 105,55 Q130,33 155,55 Q180,77 195,55" fill="none" stroke="#002820" stroke-width="1"/>`
          + `<path d="M5,265 Q30,243 55,265 Q80,287 105,265 Q130,243 155,265 Q180,287 195,265" fill="none" stroke="#002820" stroke-width="1"/>`
          + `<path d="M5,160 Q30,125 55,160 Q80,195 105,160 Q130,125 155,160 Q180,195 195,160" fill="none" stroke="#00c8b4" stroke-width="2.2"/>`
          + `<path d="M5,160 Q30,138 55,160 Q80,182 105,160 Q130,138 155,160 Q180,182 195,160" fill="none" stroke="#008878" stroke-width="1.4" opacity="0.8"/>`
          + `<circle cx="100" cy="160" r="44" fill="${e.bg2}"/>`
          + `<circle cx="100" cy="160" r="44" fill="none" stroke="#009080" stroke-width="1.2"/>`;
      } else if (elem==='aether'){
        const lines = [[100,70,100,250,0.9,'#400010'],[10,160,190,160,0.9,'#400010'],[37,97,163,223,0.9,'#400010'],[163,97,37,223,0.9,'#400010']];
        lines.forEach(l=>{ art += `<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" stroke="${l[5]}" stroke-width="${l[4]}"/>`; });
        const xlines = [[100,70,37,97],[100,70,163,97],[10,160,37,97],[10,160,37,223],[190,160,163,97],[190,160,163,223],[100,250,37,223],[100,250,163,223]];
        xlines.forEach(l=>{ art += `<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" stroke="#300010" stroke-width="0.8"/>`; });
        const accents = [[100,70,100,10,1.4,.6],[100,250,100,310,1.4,.6],[10,160,37,97,1.2,.5],[190,160,163,223,1.2,.5]];
        accents.forEach(a=>{ art += `<line x1="${a[0]}" y1="${a[1]}" x2="${a[2]}" y2="${a[3]}" stroke="#c8203a" stroke-width="${a[4]}" opacity="${a[5]}"/>`; });
        const nodes = [[100,70,3.5],[37,97,3],[163,97,3],[10,160,3],[190,160,3],[37,223,3],[163,223,3],[100,250,3.5]];
        nodes.forEach(n=>{ art += `<circle cx="${n[0]}" cy="${n[1]}" r="${n[2]}" fill="#500018" stroke="#c82030" stroke-width="0.9"/>`; });
        art += `<circle cx="100" cy="160" r="44" fill="${e.bg2}"/>`
          + `<circle cx="100" cy="160" r="44" fill="none" stroke="#a81828" stroke-width="1.2"/>`;
      }
      art += `</g>`;
      return art;
    }
  };
})();
