// PlayTable.jsx — scene assembly
const { useState, useMemo } = React;

const STARTER_HAND = [
  { key:'h1', v:7,  e:'radiance' },
  { key:'h2', v:8,  e:'radiance' },
  { key:'h3', v:9,  e:'radiance' },
  { key:'h4', v:12, e:'void' },
  { key:'h5', v:4,  e:'flux' },
  { key:'h6', v:15, e:'aether' },
  { key:'h7', v:0,  e:'wild' }
];

export function PlayTable() {
  const [hand, setHand] = useState(STARTER_HAND);
  const [stage, setStage] = useState([]);
  const [variant, setVariant] = useState({ connector:'bloom', art:'sigil' });
  const [pulse, setPulse] = useState(false);

  const pick = (c) => {
    // order bound cards: same-suit → by value ascending; else append
    setHand(h => h.filter(x => x.key !== c.key));
    setStage(s => {
      const next = [...s, c];
      const allSame = next.every(x => x.e === next[0].e && x.e !== 'wild');
      if (allSame) next.sort((a,b)=> a.v - b.v);
      return next;
    });
  };
  const remove = (c) => {
    setStage(s => s.filter(x => x.key !== c.key));
    setHand(h => [...h, c]);
  };
  const cast = () => {
    setPulse(true);
    setTimeout(() => { setPulse(false); setStage([]); }, 900);
  };
  const reset = () => { setHand(h => [...h, ...stage]); setStage([]); };

  const canCast = stage.length >= 2;

  return (
    <div style={tableShell}>
      <main style={mainCol}>
        <header style={headerBar}>
          <div style={{display:'flex', gap:14, alignItems:'baseline'}}>
            <span style={brandGlyph}>✦</span>
            <span style={brandName}>Archmage Ascension</span>
            <span style={divider}>·</span>
            <span style={subtitle}>Turn III — The Convergence</span>
          </div>
          <div style={{display:'flex', gap:18, alignItems:'center'}}>
            <Meter label="Mana" value={7} max={10}/>
            <Meter label="Sway" value={4} max={10} tone="purple"/>
          </div>
        </header>

        <section style={opponent}>
          <div style={opponentLabel}>Opponent · Arkady of the Sundered Glass</div>
          <div style={{display:'flex', gap:6, justifyContent:'center'}}>
            {[0,1,2,3,4,5].map(i => <CardBack key={i}/>)}
          </div>
        </section>

        <section style={stageWrap}>
          <SpellStage cards={stage} variant={variant} onRemove={remove} pulse={pulse}/>
        </section>

        <section style={handWrap}>
          <Hand cards={hand} onPick={pick} variant={variant}/>
        </section>
      </main>

      <Controls variant={variant} setVariant={setVariant} onCast={cast} onReset={reset} canCast={canCast}/>
    </div>
  );
}
window.PlayTable = PlayTable;

function Meter({ label, value, max, tone }) {
  const color = tone === 'purple' ? '#c060f0' : '#f5c518';
  return (
    <div style={{display:'flex', flexDirection:'column', gap:4}}>
      <span style={{fontFamily:'var(--font-display)', fontSize:9, letterSpacing:'.28em', textTransform:'uppercase', color:'var(--page-dim-deeper)'}}>{label}</span>
      <div style={{display:'flex', gap:3}}>
        {Array.from({length:max}).map((_,i)=>(
          <div key={i} style={{width:10,height:10,borderRadius:2,
            background: i < value ? color : '#1a1128',
            boxShadow: i < value ? `0 0 6px ${color}99` : 'none'
          }}/>
        ))}
      </div>
    </div>
  );
}

function CardBack() {
  return (
    <div style={{
      width: 44, height: 64, borderRadius:5,
      background:'radial-gradient(circle at 50% 50%, #1a1028 0%, #06040c 70%)',
      border:'1px solid #3a2858',
      display:'flex', alignItems:'center', justifyContent:'center',
      boxShadow:'0 4px 10px rgba(0,0,0,.5), inset 0 0 0 1px rgba(200,168,74,.08)'
    }}>
      <span style={{color:'#c8a84a', fontSize:14, opacity:.7}}>✦</span>
    </div>
  );
}

const tableShell = {
  display:'flex', height:'100vh', overflow:'hidden',
  background:'radial-gradient(ellipse at 50% 40%, #1a1028 0%, #0a0810 60%, #04030a 100%)',
  color:'var(--page-text)'
};
const mainCol = { flex:1, display:'flex', flexDirection:'column', padding:'0 0 12px 0' };
const headerBar = {
  display:'flex', justifyContent:'space-between', alignItems:'center',
  padding:'12px 28px', borderBottom:'1px solid #2a1e48', flexShrink:0
};
const brandGlyph = { color:'var(--gold)', fontSize:18 };
const brandName = {
  fontFamily:'var(--font-display)', fontWeight:700, fontSize:16,
  letterSpacing:'.22em', textTransform:'uppercase', color:'#c8b8e8'
};
const divider = { color:'var(--page-dim-deeper)' };
const subtitle = {
  fontFamily:'var(--font-body)', fontStyle:'italic', fontSize:14,
  color:'var(--page-soft)'
};
const opponent = {
  padding:'12px 28px 6px', display:'flex', flexDirection:'column',
  alignItems:'center', gap:8, flexShrink:0
};
const opponentLabel = {
  fontFamily:'var(--font-display)', fontSize:10, letterSpacing:'.3em',
  textTransform:'uppercase', color:'var(--page-dim)'
};
const stageWrap = {
  flex:1, display:'flex', justifyContent:'center', alignItems:'center',
  padding:'4px 28px', minHeight:0,
  borderTop:'1px solid #1a1028', borderBottom:'1px solid #1a1028',
  background:'radial-gradient(ellipse at 50% 50%, rgba(200,168,74,.04) 0%, transparent 70%)'
};
const handWrap = { padding:'6px 28px 16px', display:'flex', flexDirection:'column', alignItems:'center', gap:6, flexShrink:0 };
const handLabel = {
  fontFamily:'var(--font-display)', fontSize:10, letterSpacing:'.3em',
  textTransform:'uppercase', color:'var(--page-dim)'
};
