// Controls.jsx — right-side rail to cycle variants
const { useState } = React;

export function Controls({ variant, setVariant, onCast, onReset, canCast }) {
  // Derive available options from the renderer — auto-updates when lib/cards.js grows
  const connectors = Object.keys(ArchmageCards.ConnectorVariants);
  const artKinds   = Object.keys(ArchmageCards.EnergyArtVariants);

  const seg = (label, val, options, key) => (
    <div style={{display:'flex', flexDirection:'column', gap:6, marginBottom:18}}>
      <span style={segLbl}>{label}</span>
      <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
        {options.map(o => (
          <button key={o} onClick={() => setVariant({...variant, [key]: o})}
            style={{
              ...segBtn,
              ...(val === o ? segActive : {})
            }}>{o}</button>
        ))}
      </div>
    </div>
  );
  return (
    <aside style={rail}>
      <div style={railTitle}>Crucible</div>
      {seg('Connector', variant.connector, connectors, 'connector')}
      {seg('Energy art', variant.art, artKinds, 'art')}
      <div style={{marginTop:'auto', display:'flex', flexDirection:'column', gap:8}}>
        <button onClick={onCast} disabled={!canCast} style={{...castBtn, opacity: canCast ? 1 : .35}}>Cast Spell</button>
        <button onClick={onReset} style={resetBtn}>Return to hand</button>
      </div>
    </aside>
  );
}
window.Controls = Controls;

const rail = {
  width:220, flexShrink:0,
  background:'linear-gradient(180deg,#120a1c 0%,#0a0810 100%)',
  borderLeft:'1px solid #2a1e48',
  padding:'28px 20px', display:'flex', flexDirection:'column',
  minHeight:'100%'
};
const railTitle = {
  fontFamily:'var(--font-display)', fontWeight:700, fontSize:14,
  letterSpacing:'.3em', textTransform:'uppercase', color:'var(--gold)',
  marginBottom:28, borderBottom:'1px solid #2a1e48', paddingBottom:12
};
const segLbl = {
  fontFamily:'var(--font-display)', fontSize:9, letterSpacing:'.3em',
  textTransform:'uppercase', color:'var(--page-dim-deeper)'
};
const segBtn = {
  fontFamily:'var(--font-display)', fontSize:9, letterSpacing:'.14em',
  textTransform:'uppercase', padding:'5px 8px', borderRadius:3,
  background:'transparent', border:'1px solid #2a1e48', color:'var(--page-soft)',
  cursor:'pointer'
};
const segActive = {
  background:'rgba(200,168,74,.12)', borderColor:'var(--gold)',
  color:'var(--gold)'
};
const castBtn = {
  fontFamily:'var(--font-display)', fontWeight:600, fontSize:11,
  letterSpacing:'.2em', textTransform:'uppercase',
  background:'linear-gradient(180deg,#b89028,#8a6810)', color:'#0a0810',
  border:'1px solid #e0b848', padding:'11px 16px', borderRadius:4, cursor:'pointer'
};
const resetBtn = {
  fontFamily:'var(--font-display)', fontSize:10, letterSpacing:'.22em',
  textTransform:'uppercase', background:'transparent',
  border:'1px solid #4a3868', color:'var(--page-soft)',
  padding:'9px 16px', borderRadius:4, cursor:'pointer'
};
