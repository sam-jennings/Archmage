// Hand.jsx — bottom fan of 5 cards, click to stage
const { useState } = React;

export function Hand({ cards, onPick, variant }) {
  const [hover, setHover] = useState(-1);
  const N = cards.length;
  const spread = 14; // deg per card from center
  return (
    <div style={{
      position:'relative', width:560, height:160,
      display:'flex', justifyContent:'center', alignItems:'flex-end',
      perspective:'1200px'
    }}>
      {cards.map((c, i) => {
        const mid = (N-1)/2;
        const rot = (i - mid) * spread;
        const lift = hover === i ? -80 : 0;
        const tz   = hover === i ? 40 : 0;
        return (
          <div
            key={c.key}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(-1)}
            onClick={() => onPick(c)}
            style={{
              position:'absolute',
              bottom:0,
              left:`calc(50% + ${(i - mid) * 52}px - 65px)`,
              transform:`rotate(${rot}deg) translateY(${lift}px) translateZ(${tz}px)`,
              transformOrigin:'50% 140%',
              transition:'transform .25s cubic-bezier(.2,.8,.2,1)',
              zIndex: hover === i ? 10 : i,
              filter: hover === i ? 'drop-shadow(0 12px 24px rgba(0,0,0,.6))' : 'drop-shadow(0 4px 8px rgba(0,0,0,.5))',
              cursor:'pointer'
            }}
          >
            <ACard value={c.v} element={c.e} variant={variant} scale={0.5}/>
          </div>
        );
      })}
    </div>
  );
}
window.Hand = Hand;
