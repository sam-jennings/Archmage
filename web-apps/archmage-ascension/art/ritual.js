// art/ritual.js
// Ritual
// Ceremonial sigils with layered glows and containment rings.
(function(){
  const AA = window.AA_ART = window.AA_ART || {};
  AA['ritual'] = {
    name: 'Ritual',
    notes: 'Ceremonial sigils with layered glows and containment rings.',
    render: function(elem, cx, cy, artR, e){
      const r = artR;
      let art = '';

      // ── Shared containment ring (outer frame) ──
      art += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${e.dim}" stroke-width="${r*0.16}" opacity="0.95"/>`;
      art += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${e.m}" stroke-width="0.9" opacity="0.55"/>`;

      if (elem === 'radiance'){
        // RADIANCE — emissive / outward projection
        // 16 rays alternating primary (long, bright) and secondary (shorter, dim)
        for (let a = 0; a < 16; a++){
          const angle = a * Math.PI / 8;
          const isPrimary = a % 2 === 0;
          const r1 = isPrimary ? r*0.44 : r*0.50;
          const r2 = isPrimary ? r*1.12 : r*0.88;
          const sw = isPrimary ? 1.3 : 0.65;
          const op = isPrimary ? 0.80 : 0.38;
          art += `<line x1="${cx+Math.cos(angle)*r1}" y1="${cy+Math.sin(angle)*r1}" x2="${cx+Math.cos(angle)*r2}" y2="${cy+Math.sin(angle)*r2}" stroke="${e.b}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>`;
        }
        // Concentric corona rings — progressively tighter and brighter toward centre
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.78}" fill="none" stroke="${e.m}" stroke-width="0.7" opacity="0.28"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.58}" fill="none" stroke="${e.m}" stroke-width="0.85" opacity="0.40"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.40}" fill="none" stroke="${e.b}" stroke-width="0.9" opacity="0.48"/>`;
        // Inner medallion
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.26}" fill="${e.bg2}"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.26}" fill="none" stroke="${e.b}" stroke-width="1.2" opacity="0.72"/>`;

      } else if (elem === 'void'){
        // VOID — absorptive / inward convergence
        // Star scatter background
        const starData = [
          [0.76,0.62,0.9],[0.42,0.82,0.7],[0.88,0.28,1.0],[0.52,0.18,0.8],[0.28,0.54,0.7],
          [0.84,0.74,0.9],[0.60,0.36,0.8],[0.18,0.80,0.7],[0.70,0.18,0.9],[0.12,0.42,0.8],
          [0.92,0.50,0.7],[0.34,0.14,0.9],[0.64,0.88,0.8],[0.08,0.64,0.7],[0.48,0.92,0.9]
        ];
        starData.forEach(([ax,ay,rr])=>{
          const sx = cx - r*1.05 + ax*r*2.1;
          const sy = cy - r*1.05 + ay*r*2.1;
          art += `<circle cx="${sx}" cy="${sy}" r="${rr}" fill="${e.b}" opacity="0.42"/>`;
        });
        // Inward spiral — four half-arc segments, radius shrinking toward centre
        const spiral = [
          [0,   r*0.88, r*0.68, 0, 1],
          [Math.PI*0.5,  r*0.70, r*0.52, 0, 1],
          [Math.PI,      r*0.54, r*0.38, 0, 1],
          [Math.PI*1.5,  r*0.40, r*0.26, 0, 1]
        ];
        spiral.forEach(([startA, ra, rb])=>{
          const x1 = cx + Math.cos(startA)*ra;
          const y1 = cy + Math.sin(startA)*ra;
          const x2 = cx + Math.cos(startA + Math.PI)*rb;
          const y2 = cy + Math.sin(startA + Math.PI)*rb;
          const rAvg = (ra+rb)/2;
          art += `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} A${rAvg.toFixed(1)},${rAvg.toFixed(1)} 0 0,1 ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${e.b}" stroke-width="1.4" opacity="0.60"/>`;
        });
        // Depth rings — dim as they approach the hollow centre
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.56}" fill="none" stroke="${e.m}" stroke-width="0.8" opacity="0.32"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.36}" fill="none" stroke="${e.m}" stroke-width="0.7" opacity="0.22"/>`;
        // Hollow centre — void aperture
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.20}" fill="${e.bg1}"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.20}" fill="none" stroke="${e.b}" stroke-width="1.1" opacity="0.65"/>`;

      } else if (elem === 'flux'){
        // FLUX — transitional / oscillating movement
        // 9 horizontal sine waves stacked, amplitude tapers to edges
        for (let i = -4; i <= 4; i++){
          const baseY  = cy + i * r * 0.185;
          const amp    = r * 0.088;
          const isCentre = i === 0;
          const sw = isCentre ? 1.9 : (Math.abs(i) < 2 ? 1.0 : 0.65);
          const col = isCentre ? e.b : e.m;
          const op = isCentre ? 0.92 : Math.max(0.12, 0.55 - Math.abs(i)*0.10);
          art += `<path d="M${(cx-r).toFixed(1)},${baseY.toFixed(1)} Q${(cx-r*0.5).toFixed(1)},${(baseY-amp).toFixed(1)} ${cx.toFixed(1)},${baseY.toFixed(1)} Q${(cx+r*0.5).toFixed(1)},${(baseY+amp).toFixed(1)} ${(cx+r).toFixed(1)},${baseY.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>`;
        }
        // Flow-direction calibration marks — three small horizontal chevrons
        for (let i = 0; i < 3; i++){
          const mx = cx - r*0.52 + i*r*0.52;
          art += `<line x1="${mx}" y1="${cy}" x2="${mx+r*0.16}" y2="${cy}" stroke="${e.b}" stroke-width="1.3" stroke-linecap="round" opacity="0.44"/>`;
        }
        // Inner medallion
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.26}" fill="${e.bg2}"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.26}" fill="none" stroke="${e.b}" stroke-width="1.1" opacity="0.68"/>`;

      } else if (elem === 'aether'){
        // AETHER — binding / geometric stabilization
        // Octagram (8-pointed star) — alternating outer/inner radius vertices
        const pts8 = [];
        for (let a = 0; a < 8; a++){
          const angle = a * Math.PI / 4 - Math.PI/8;
          const ri = a % 2 === 0 ? r*0.80 : r*0.46;
          pts8.push(`${(cx+Math.cos(angle)*ri).toFixed(1)},${(cy+Math.sin(angle)*ri).toFixed(1)}`);
        }
        art += `<polygon points="${pts8.join(' ')}" fill="none" stroke="${e.b}" stroke-width="1.3" opacity="0.72"/>`;
        // Binding ring
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.58}" fill="none" stroke="${e.m}" stroke-width="0.8" opacity="0.38"/>`;
        // Scaffold lines from centre to the four primary outer nodes
        for (let a = 0; a < 8; a += 2){
          const angle = a * Math.PI / 4 - Math.PI/8;
          const nx = cx + Math.cos(angle)*r*0.80;
          const ny = cy + Math.sin(angle)*r*0.80;
          art += `<line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="${e.dim}" stroke-width="0.7" opacity="0.9"/>`;
          // Node at outer vertex
          art += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="2.8" fill="${e.bg2}" stroke="${e.b}" stroke-width="0.9" opacity="0.85"/>`;
        }
        // Inner medallion
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.26}" fill="${e.bg2}"/>`;
        art += `<circle cx="${cx}" cy="${cy}" r="${r*0.26}" fill="none" stroke="${e.b}" stroke-width="1.2" opacity="0.72"/>`;
        // Central node
        art += `<circle cx="${cx}" cy="${cy}" r="3.2" fill="${e.b}" opacity="0.88"/>`;
      }

      return art;
    }
  };
})();
