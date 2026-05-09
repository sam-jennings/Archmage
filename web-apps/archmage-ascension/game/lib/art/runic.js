// art/runic.js
// Runic
// Rune-ring emblems per suit — stripped-down version of ritual.
(function(){
  const AA = window.AA_ART = window.AA_ART || {};
  AA['runic'] = {
    name: 'Runic',
    notes: 'Rune-ring emblems per suit — stripped-down version of ritual.',
    render: function(elem, cx, cy, artR, e){
      const s = artR / 82;
      const tx = cx - 100*s, ty = cy - 100*s;
      let art = `<g transform="translate(${tx},${ty}) scale(${s})">`;
      // shared frame
      art += `<circle cx="100" cy="100" r="88" fill="none" stroke="${e.dim}" stroke-width="8"/>`
        + `<circle cx="100" cy="100" r="88" fill="none" stroke="${e.m}" stroke-width="1.2" opacity=".55"/>`;
      if (elem==='radiance'){
        // sunburst glyph
        for (let a=0; a<12; a++){
          const r = a*30*Math.PI/180;
          art += `<line x1="${100+Math.cos(r)*42}" y1="${100+Math.sin(r)*42}" x2="${100+Math.cos(r)*72}" y2="${100+Math.sin(r)*72}" stroke="${e.b}" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>`;
        }
        art += `<circle cx="100" cy="100" r="28" fill="${e.bg2}" stroke="${e.b}" stroke-width="2"/>`;
      } else if (elem==='void'){
        // inverted crescent with star
        art += `<path d="M100,40 A60,60 0 1,0 100,160 A44,44 0 1,1 100,40 Z" fill="${e.dim}" stroke="${e.b}" stroke-width="1.8"/>`
          + `<polygon points="140,80 146,96 162,96 150,106 154,122 140,114 126,122 130,106 118,96 134,96" fill="${e.b}" opacity=".85"/>`;
      } else if (elem==='flux'){
        // double-wave chevron
        for (let i=0; i<3; i++){
          const yy = 68 + i*22;
          art += `<path d="M30,${yy} Q60,${yy-14} 100,${yy} Q140,${yy+14} 170,${yy}" fill="none" stroke="${i===1?e.b:e.m}" stroke-width="${i===1?2.6:1.4}" opacity="${i===1?.95:.6}"/>`;
        }
      } else if (elem==='aether'){
        // sharp lattice diamond
        art += `<polygon points="100,28 172,100 100,172 28,100" fill="none" stroke="${e.b}" stroke-width="2.2"/>`
          + `<polygon points="100,56 144,100 100,144 56,100" fill="none" stroke="${e.m}" stroke-width="1.4"/>`
          + `<circle cx="100" cy="100" r="6" fill="${e.b}"/>`
          + `<line x1="100" y1="28" x2="100" y2="172" stroke="${e.dim}" stroke-width="0.8"/>`
          + `<line x1="28" y1="100" x2="172" y2="100" stroke="${e.dim}" stroke-width="0.8"/>`;
      }
      art += `</g>`;
      return art;
    }
  };
})();
