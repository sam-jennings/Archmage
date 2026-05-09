/* global React */
// ════════════════════════════════════════════════════════════════
// Cauldron — drag/click target for assembling spells.
// User drags cards from hand here. Live validation shows the spell type/score.
// During CASTING phase, this is replaced by status; during LEARNING, it's active.
// ════════════════════════════════════════════════════════════════

function Cauldron({
  cards,            // [card] currently in cauldron
  onAddCardId,      // (cardId) => void
  onRemoveCardId,   // (cardId) => void
  onLearn,          // ({type}) => void
  onClear,
  onEmpowerStart,   // open empower flow
  empowering,       // {spell} | null  -- if true, cauldron means "cards to add to this spell"
  onEmpowerCommit,
  canLearn,
  capacityRemaining
}){
  const [over, setOver] = React.useState(false);
  const E = window.AAEngine;
  const spec = React.useMemo(() => {
    if (cards.length < 3 && !empowering) return null;
    if (empowering){
      // try classify the merged set
      const merged = empowering.spell.cards.concat(cards);
      return E.classify(merged);
    }
    return E.classify(cards);
  }, [cards, empowering]);

  const handleDragOver = (e) => {
    if (e.dataTransfer.types.includes('text/card-id')){
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setOver(true);
    }
  };
  const handleDragLeave = () => setOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setOver(false);
    const id = e.dataTransfer.getData('text/card-id');
    if (id) onAddCardId(id);
  };

  return (
    <div
      className={`cauldron ${over ? 'over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {empowering && (
        <div style={{ fontFamily:'var(--display)', letterSpacing:'0.28em', fontSize:11, color:'var(--violet)', textTransform:'uppercase' }}>
          Empowering &mdash; {window.AATypeLabelUI[empowering.spell.spec.type]} ({empowering.spell.cards.length})
        </div>
      )}
      {cards.length === 0 ? (
        <div className="cauldron-empty">
          <span className="glyph">{empowering ? 'Add to the spell' : 'The Casting Circle'}</span>
          {empowering
            ? <span>Drag cards here to fold them into the existing weave.</span>
            : <span>Drag three or more components here to assemble<br/>a spell. Patterns reveal themselves.</span>}
        </div>
      ) : (
        <div className="cauldron-cards">
          {cards.map(c => (
            <window.AACard
              key={c.id}
              card={c}
              scale={0.46}
              onClick={() => onRemoveCardId(c.id)}
              title="Click to return to hand"
            />
          ))}
        </div>
      )}
      {(cards.length >= 3 || empowering) && (
        <div className={`cauldron-readout ${spec ? 'valid' : 'invalid'}`}>
          <div className="cauldron-readout-type">
            {spec ? `${window.AATypeLabelUI[spec.type]} · ${spec.length}` : 'Pattern unrecognized'}
          </div>
          {spec && <div className="cauldron-readout-score">{E.spellScore(spec)} RP</div>}
          <div className="cauldron-actions">
            <button className="tiny-btn" onClick={onClear}>Return all</button>
            {!empowering && spec && canLearn && (
              <button className="btn-primary" style={{padding:'8px 18px', fontSize:11}}
                onClick={() => onLearn({type: spec.type})}>
                Learn ({capacityRemaining} left)
              </button>
            )}
            {empowering && spec && canLearn && (
              <button className="btn-primary" style={{padding:'8px 18px', fontSize:11}}
                onClick={onEmpowerCommit}>
                Empower
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

window.AACauldron = Cauldron;
