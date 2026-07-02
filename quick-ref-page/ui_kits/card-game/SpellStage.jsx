// SpellStage.jsx — center play zone; consecutive-bloom fan
const { useRef, useEffect } = React;

export function SpellStage({ cards, variant, onRemove, pulse }) {
  const hostRef = useRef(null);
  useEffect(() => {
    if (!hostRef.current) return;
    hostRef.current.innerHTML = '';
    if (!cards.length) return;
    ArchmageCards.buildFan(
      hostRef.current,
      cards.map(c => c.e === 'wild' ? { v:0, e:'wild' } : { v:c.v, e:c.e }),
      { scale: 0.56, ...variant }
    );
    // overlay click-to-remove on each card slot
    const slots = hostRef.current.children;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      slot.style.cursor = 'pointer';
      slot.onclick = () => onRemove(cards[i]);
    }
  }, [cards, variant.connector, variant.art]);

  const meta = readSpell(cards);

  return (
    <div style={{
      position:'relative', padding:'8px 20px',
      display:'flex', flexDirection:'column', alignItems:'center', gap:6
    }}>
      <div style={{
        position:'relative',
        display:'flex', justifyContent:'center', alignItems:'flex-start',
        minHeight: 180,
        filter: pulse ? 'drop-shadow(0 0 40px rgba(245,197,24,.6))' : 'none',
        transition:'filter .4s'
      }}>
        <div ref={hostRef} style={{display:'inline-flex', position:'relative'}}/>
      </div>
      <div style={{
        fontFamily:'var(--font-display)',
        fontSize:10, letterSpacing:'.3em', textTransform:'uppercase',
        color: meta.valid ? 'var(--gold)' : 'var(--page-dim-deeper)',
        textAlign:'center', minHeight:12
      }}>{meta.label}</div>
      {meta.flavor && cards.length > 0 && (
        <div style={{
          fontFamily:'var(--font-body)', fontStyle:'italic', fontSize:13,
          color:'var(--page-soft)', textAlign:'center', maxWidth:420, lineHeight:1.5
        }}>{meta.flavor}</div>
      )}
    </div>
  );
}
window.SpellStage = SpellStage;

function readSpell(cards) {
  if (!cards.length) return { label:'— empty crucible —', valid:false, flavor:'' };
  if (cards.length === 1) {
    return { label:`${cards[0].e} · value ${cards[0].v}`, valid:false, flavor:'Awaiting resonance.' };
  }
  const vals = cards.map(c => c.v).sort((a,b)=>a-b);
  const sameSuit = cards.every(c => c.e === cards[0].e);
  const consecutive = vals.every((v,i) => i===0 || v === vals[i-1]+1);
  const sameVal = vals.every(v => v === vals[0]);
  if (sameSuit && consecutive) return {
    label:`${cards[0].e} bloom · ${vals.length} bound`, valid:true,
    flavor:'Consecutive values in one element — blooms overlap at the join, resonant and clean.'
  };
  if (sameVal) return {
    label:`chromatic ${vals[0]}s · ${cards.length} elements`, valid:true,
    flavor:'Same value across elements — the chromatic strip shifts hue across the join.'
  };
  return {
    label:'discordant — no binding',
    valid:false,
    flavor:'Cold dark strips at the visible edges. No warmth crosses between unrelated cards.'
  };
}
