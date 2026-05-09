// art/echo.js
// Echo — the fifth current (5+ player expansion)
//
// Visual concept: resonant return. A signal emitted from a centre that has
// already spent itself — the bright energy has travelled outward and is now
// ringing in the flanks, while the origin fades to a ghost.
//
// Core motif: three clusters of concentric rings arranged horizontally.
// LEFT and RIGHT flank clusters are bright — the echo still resonating.
// CENTRE cluster is dim/ghost — the spent origin point.
// Where the flank outer rings cross the centre mid ring, natural intersection
// nodes appear above and below the axis — the phase-crossing points.
//
// The centre of the medallion (r < artR*0.22) is kept clear for the value
// numeral, which the card engine renders on top of this art layer.
//
// Echo palette: silver-grey / pale moonstone
//   b:'#c8d4e8'  m:'#7a8aaa'  dim:'#181e2c'
//   bg1:'#070810'  bg2:'#080910'  border:'#3a4460'

(function(){
  const AA = window.AA_ART = window.AA_ART || {};

  // Echo suit palette
  const ECHO = {
    b:      '#c8d4e8',
    m:      '#7a8aaa',
    dim:    '#181e2c',
    bg1:    '#070810',
    bg2:    '#080910',
    border: '#3a4460',
    name:   'ECHO'
  };

  // Intersection nodes between two circles:
  //   circle A: centre (ax, ay), radius ra
  //   circle B: centre (bx, by), radius rb
  // Returns array of up to 2 [x, y] points, or [] if no intersection.
  function circleIntersect(ax, ay, ra, bx, by, rb){
    const dx = bx - ax, dy = by - ay;
    const d  = Math.sqrt(dx*dx + dy*dy);
    if (d > ra + rb || d < Math.abs(ra - rb) || d === 0) return [];
    const a  = (ra*ra - rb*rb + d*d) / (2*d);
    const h  = Math.sqrt(Math.max(0, ra*ra - a*a));
    const mx = ax + a*dx/d, my = ay + a*dy/d;
    const px =  h*dy/d,     py = -h*dx/d;
    return [
      [mx + px, my + py],
      [mx - px, my - py]
    ];
  }

  AA['echo'] = {
    name: 'Echo',
    notes: 'Fifth current for 5+ player mode. Three ring clusters: bright flanks, ghost centre. Centre kept clear for value numeral.',

    render: function(elem, cx, cy, artR, e, meta){
      meta = meta || {};
      const sc = meta.sc || 1;
      const r  = artR;

      // Use Echo's own palette for the Echo suit; fall back to e for wild/others
      const p = (elem === 'echo') ? ECHO : e;

      let art = '';

      // ── Containment ring ──────────────────────────────────────────────
      art += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.dim}" stroke-width="${r*0.16}" opacity="0.93"/>`;
      art += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.m}" stroke-width="${0.9*sc}" opacity="0.50"/>`;

      // ── Geometry ──────────────────────────────────────────────────────
      // Flank clusters sit at ±flankOffset from centre.
      // Their outer ring radius is chosen so they comfortably cross the
      // centre's mid ring, generating 4 natural intersection nodes.
      // Centre rings are kept small enough that nothing enters the
      // numeral zone (clear radius = r*0.22).

      const flankOffset = r * 0.38;  // distance left/right of centre
      const lx = cx - flankOffset;   // left flank centre x
      const rx = cx + flankOffset;   // right flank centre x

      // Flank ring radii (three concentric rings per flank)
      const fR1 = r * 0.50;  // outer
      const fR2 = r * 0.32;  // mid
      const fR3 = r * 0.16;  // inner

      // Centre ring radii (ghost; inner must clear numeral zone r*0.22)
      const cR1 = r * 0.58;  // outer ghost
      const cR2 = r * 0.40;  // mid ghost
      const cR3 = r * 0.24;  // inner ghost — just outside numeral clear zone

      // ── CENTRE cluster — ghost / spent origin ────────────────────────
      // cR3 is inside the medallion fill so only cR1 and cR2 are drawn.
      art += `<circle cx="${cx}" cy="${cy}" r="${cR1}" fill="none" stroke="${p.b}" stroke-width="${1.0*sc}" opacity="0.20"/>`;
      art += `<circle cx="${cx}" cy="${cy}" r="${cR2}" fill="none" stroke="${p.b}" stroke-width="${0.75*sc}" opacity="0.15"/>`;

      // ── LEFT flank cluster — bright ──────────────────────────────────
      art += `<circle cx="${lx}" cy="${cy}" r="${fR1}" fill="none" stroke="${p.b}" stroke-width="${1.6*sc}" opacity="0.68"/>`;
      art += `<circle cx="${lx}" cy="${cy}" r="${fR2}" fill="none" stroke="${p.b}" stroke-width="${1.2*sc}" opacity="0.50"/>`;
      art += `<circle cx="${lx}" cy="${cy}" r="${fR3}" fill="none" stroke="${p.b}" stroke-width="${0.85*sc}" opacity="0.34"/>`;

      // ── RIGHT flank cluster — bright ─────────────────────────────────
      art += `<circle cx="${rx}" cy="${cy}" r="${fR1}" fill="none" stroke="${p.b}" stroke-width="${1.6*sc}" opacity="0.68"/>`;
      art += `<circle cx="${rx}" cy="${cy}" r="${fR2}" fill="none" stroke="${p.b}" stroke-width="${1.2*sc}" opacity="0.50"/>`;
      art += `<circle cx="${rx}" cy="${cy}" r="${fR3}" fill="none" stroke="${p.b}" stroke-width="${0.85*sc}" opacity="0.34"/>`;

      // ── Intersection nodes ────────────────────────────────────────────
      // Left flank outer × centre mid ring
      const nodesL = circleIntersect(lx, cy, fR1, cx, cy, cR2);
      // Right flank outer × centre mid ring
      const nodesR = circleIntersect(rx, cy, fR1, cx, cy, cR2);
      [...nodesL, ...nodesR].forEach(([nx, ny]) => {
        art += `<circle cx="${nx.toFixed(2)}" cy="${ny.toFixed(2)}" r="${2.1*sc}" fill="${p.b}" opacity="0.65"/>`;
      });

      // ── Flank origin marks ────────────────────────────────────────────
      art += `<circle cx="${lx}" cy="${cy}" r="${2.8*sc}" fill="${p.b}" opacity="0.72"/>`;
      art += `<circle cx="${rx}" cy="${cy}" r="${2.8*sc}" fill="${p.b}" opacity="0.72"/>`;

      // ── Centre medallion — black fill for numeral ────────────────────
      // Matches the pattern used by other art variants: a solid dark fill
      // punches out a clean circle for the value numeral to sit on.
      // Outer ghost ring suggests the spent source; inner fill is pure dark.
      art += `<circle cx="${cx}" cy="${cy}" r="${r*0.26}" fill="${p.bg1 || p.dim}"/>`;
      art += `<circle cx="${cx}" cy="${cy}" r="${r*0.26}" fill="none" stroke="${p.m}" stroke-width="${0.7*sc}" opacity="0.30"/>`;

      return art;
    }
  };

})();
