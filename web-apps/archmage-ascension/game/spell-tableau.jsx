/* global React */
// ════════════════════════════════════════════════════════════════
// Spell tableau component — renders one learned spell.
// ════════════════════════════════════════════════════════════════

const TYPE_LABEL_UI = {
  conj:  'Conjuration',
  trans: 'Transfiguration',
  perf:  'Perfect Transmutation',
  ench:  'Enchantment'
};

function SpellTableau({
  spell, scale = 0.42,
  hasCounter, castable, cast, owner, dimmed,
  onCast, onUnlearn, onEmpower,
  showActions
}){
  const score = window.AAEngine.spellScore(spell.spec);
  const type = spell.spec.type;
  const cls = `spell-tab ${castable && !cast ? 'castable' : ''} ${cast ? 'cast' : ''} ${owner === 'opp' ? 'opp' : ''} ${dimmed ? 'disabled' : ''}`;
  return (
    <div className={cls} onClick={castable && !cast ? onCast : undefined} title={cast ? 'Already cast this turn' : (castable ? 'Click to cast' : '')}>
      {hasCounter && <div className="counter-mark"/>}
      <div className="spell-tab-cards">
        {spell.cards.map(c => (
          <window.AACard
            key={c.id}
            card={c}
            scale={scale}
            connector={owner === 'opp' ? 'bloom-soft' : 'bloom-soft'}
            art="mystic"
            layout="tarot"
          />
        ))}
      </div>
      <div className="spell-tab-meta">
        <div className={`spell-tab-type t-${type}`}>{TYPE_LABEL_UI[type]} · {spell.cards.length}</div>
        <div className="spell-tab-score">{score}</div>
      </div>
      {showActions && (
        <div className="spell-tab-actions">
          {onEmpower && <button className="tiny-btn" onClick={(e)=>{e.stopPropagation(); onEmpower();}}>Empower</button>}
          {onUnlearn && <button className="tiny-btn danger" onClick={(e)=>{e.stopPropagation(); onUnlearn();}}>Unlearn</button>}
        </div>
      )}
    </div>
  );
}

window.AASpellTableau = SpellTableau;
window.AATypeLabelUI = TYPE_LABEL_UI;
