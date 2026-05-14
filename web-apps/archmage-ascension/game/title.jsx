/* global React */
// ════════════════════════════════════════════════════════════════
// Title Screen — opening menu
// ════════════════════════════════════════════════════════════════

function TitleScreen({ onStart, onResume, hasSavedGame }){
  const [panel, setPanel] = React.useState(null);
  const [showInstallHint, setShowInstallHint] = React.useState(false);

  React.useEffect(() => {
    const ua = navigator.userAgent || '';
    const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = navigator.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches;
    let dismissed = false;
    try { dismissed = localStorage.getItem('aa:ios-install-hint-dismissed') === '1'; } catch (_) {}
    setShowInstallHint(iOS && !standalone && !dismissed);
  }, []);

  const dismissInstallHint = () => {
    try { localStorage.setItem('aa:ios-install-hint-dismissed', '1'); } catch (_) {}
    setShowInstallHint(false);
  };

  return (
    <div className="title-screen">
      <div className="title-content">
        <div className="title-glyph">
          <TitleSigil/>
        </div>
        <div className="title-eyebrow">A Wizards' Contest</div>
        <h1 className="title-name">Archmage<br/><span className="ampersign">·</span> Ascension <span className="ampersign">·</span></h1>
        <p className="title-tag">Two practitioners gather components from the Source.<br/>The wizard whose grimoire holds the most refined patterns ascends.</p>
        <div className="title-actions">
          <button className="btn-primary" onClick={onStart}>Begin the Contest</button>
          {hasSavedGame && <button className="btn-secondary" onClick={onResume}>Resume Saved Duel</button>}
          <div style={{display:'flex', gap:8, marginTop:6}}>
            <button className="btn-secondary" onClick={() => setPanel('tutorial')}>Tutorial</button>
            <button className="btn-secondary" onClick={() => setPanel('rules')}>Rulebook</button>
          </div>
        </div>
      </div>
      {panel && <TitleInfoPanel mode={panel} onClose={() => setPanel(null)}/>}
      {showInstallHint && (
        <div className="ios-install-toast" role="status">
          <b>Fullscreen play</b>
          <span>Add to Home Screen in Safari's Share menu for fullscreen play.</span>
          <button type="button" onClick={dismissInstallHint}>Got it</button>
        </div>
      )}
    </div>
  );
}

function TitleInfoPanel({ mode, onClose }){
  const isTutorial = mode === 'tutorial';
  const rows = isTutorial ? [
    ['1 · Collect', 'Tap a face-up Array card when it completes a pattern, or tap the Source for a blind draw.'],
    ['2 · Cast', 'Tap learned Conjurations, Transfigurations, or Perfect Transmutations to gain tempo before learning.'],
    ['3 · Learn', 'Tap or drag 3+ components into the Casting Circle, then press Learn. Tap selected cards again to return them.'],
    ['4 · Ascend', 'When the Source is exhausted, the Reserve releases. The highest final RP grimoire wins.']
  ] : [
    ['Conjuration', 'Three or more matching suits. Scores steadily and draws extra components when cast.'],
    ['Transfiguration', 'Three or more sequential values. Cast it to exchange weak hand cards for Array cards.'],
    ['Perfect Transmutation', 'Same suit and sequential values. The rarest, highest-scoring spell pattern.'],
    ['Enchantment', 'Three or four matching values. Learning one expands your action capacity; four unlocks unlimited capacity.']
  ];
  return (
    <div className="modal-overlay">
      <div className="modal-card title-info-card">
        <div className="modal-eyebrow">{isTutorial ? 'Quick Tutorial' : 'Pocket Rulebook'}</div>
        <h3 className="modal-title">{isTutorial ? 'How to play on Android' : 'Spell patterns at a glance'}</h3>
        <div className="title-info-list">
          {rows.map(([head, body]) => (
            <div className="title-info-row" key={head}>
              <b>{head}</b>
              <span>{body}</span>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn-primary" onClick={onClose}>Return</button>
        </div>
      </div>
    </div>
  );
}

function TitleSigil(){
  return (
    <svg viewBox="0 0 240 240" width="240" height="240">
      <defs>
        <radialGradient id="ts-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5d588" stopOpacity="0.4"/>
          <stop offset="60%" stopColor="#f5d588" stopOpacity="0.05"/>
          <stop offset="100%" stopColor="#f5d588" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="120" cy="120" r="118" fill="url(#ts-glow)"/>
      {/* Outer ring with ticks */}
      <circle cx="120" cy="120" r="92" fill="none" stroke="#c8a458" strokeOpacity="0.5" strokeWidth="0.6"/>
      <circle cx="120" cy="120" r="84" fill="none" stroke="#c8a458" strokeOpacity="0.3" strokeWidth="0.4"/>
      {Array.from({length:36}).map((_,i)=>{
        const a = (i/36)*Math.PI*2 - Math.PI/2;
        const r1 = 84, r2 = i%9===0 ? 100 : (i%3===0 ? 95 : 92);
        return <line key={i}
          x1={120 + Math.cos(a)*r1} y1={120 + Math.sin(a)*r1}
          x2={120 + Math.cos(a)*r2} y2={120 + Math.sin(a)*r2}
          stroke="#c8a458" strokeOpacity={i%9===0?0.9:0.4} strokeWidth={i%9===0?1.2:0.5}/>
      })}
      {/* 4-current kite */}
      <g transform="translate(120,120)">
        <polygon points="0,-44 14,-14 0,0 -14,-14" fill="#f5c518" opacity="0.85"/>
        <polygon points="44,0 14,14 0,0 14,-14" fill="#e8304a" opacity="0.85"/>
        <polygon points="0,44 -14,14 0,0 14,14" fill="#00c8b4" opacity="0.85"/>
        <polygon points="-44,0 -14,-14 0,0 -14,14" fill="#c060f0" opacity="0.85"/>
        <circle r="4" fill="#fff" opacity="0.95"/>
      </g>
      {/* Constellation pin marks */}
      {[0,1,2,3].map(i => {
        const a = (i/4)*Math.PI*2 + Math.PI/4;
        return <circle key={i} cx={120+Math.cos(a)*70} cy={120+Math.sin(a)*70} r="2" fill="#f5d588" opacity="0.7"/>
      })}
    </svg>
  );
}

window.AATitleScreen = TitleScreen;
