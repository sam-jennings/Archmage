/* global React */
// ════════════════════════════════════════════════════════════════
// Play screen — the main game board.
// Rendered when phase is anything except 'title' or 'final'.
// ════════════════════════════════════════════════════════════════

const { useState, useEffect, useRef, useMemo } = React;

const PHASE_LABELS = {
  'opening':              'Opening · Bind a Component',
  'collection':           'Collection · Take a Component',
  'casting':              'Casting · Invoke Your Spells',
  'learning':             'Learning · Shape Your Grimoire',
  'drought-collection':   'Drought · Collection',
  'drought-learning':     'Drought · Learning'
};

function PlayScreen({ state, dispatch, animations, aiBusy, transfigPrompt, openingPrompt, fxQueue }){
  const you = state.players[0];
  const archon = state.players[1];
  const isYourTurn = state.currentPlayer === 0 && !aiBusy;
  const phaseLabel = PHASE_LABELS[state.phase] || state.phase;

  // Cauldron lives in UI state — it's a list of card ids in play
  const [cauldronIds, setCauldronIds] = useState([]);
  const [empoweringSpellId, setEmpoweringSpellId] = useState(null);
  // Sync cauldron to state.cauldron if reset
  useEffect(() => { setCauldronIds(state.cauldron || []); }, [state.cauldron]);
  // Reset cauldron on phase change
  useEffect(() => {
    setCauldronIds([]); setEmpoweringSpellId(null);
  }, [state.phase, state.currentPlayer]);

  const cauldronCards = useMemo(() => {
    const map = new Map(you.hand.map(c => [c.id, c]));
    return cauldronIds.map(id => map.get(id)).filter(Boolean);
  }, [cauldronIds, you.hand]);

  const handleAddToCauldron = (cid) => {
    if (state.phase !== 'learning' && state.phase !== 'drought-learning') return;
    if (cauldronIds.includes(cid)) return;
    setCauldronIds([...cauldronIds, cid]);
  };
  const handleRemoveFromCauldron = (cid) => setCauldronIds(cauldronIds.filter(x => x !== cid));
  const handleClearCauldron = () => { setCauldronIds([]); setEmpoweringSpellId(null); };

  const handleLearn = () => {
    // Engine auto-classifies cauldron contents — see learnSpell in state.js.
    dispatch({ type: 'LEARN', cards: cauldronIds });
    setCauldronIds([]); setEmpoweringSpellId(null);
  };
  const handleEmpowerCommit = () => {
    dispatch({ type:'EMPOWER', spellId: empoweringSpellId, cards: cauldronIds });
    setCauldronIds([]); setEmpoweringSpellId(null);
  };
  const handleEmpowerStart = (spellId) => {
    setEmpoweringSpellId(spellId);
    setCauldronIds([]);
  };
  const handleUnlearn = (spellId) => dispatch({ type:'UNLEARN', spellId });

  const empoweringSpell = empoweringSpellId
    ? you.spellbook.find(s => s.id === empoweringSpellId)
    : null;

  const counterCap = you.unlimited ? Infinity : you.counters;
  const counterUsed = state.learningCountersUsed;
  const capacityRemaining = you.unlimited ? '∞' : Math.max(0, counterCap - counterUsed);

  // ── Phase actions ────────────────────────────────────────
  const canCast = isYourTurn && state.phase === 'casting';
  const canCollect = isYourTurn && (state.phase === 'collection');
  const canLearn = isYourTurn && (state.phase === 'learning' || state.phase === 'drought-learning')
                    && (you.unlimited || counterUsed < counterCap);

  // ── Render ──────────────────────────────────────────────
  return (
    <div className={`play-root ${state.drought ? 'drought' : ''}`}>
      <TopBar state={state} aiBusy={aiBusy} phaseLabel={phaseLabel} dispatch={dispatch}/>

      <ActionCoach state={state} you={you} isYourTurn={isYourTurn} aiBusy={aiBusy}/>

      <div className="table">
        {/* Opponent zone (top) */}
        <OpponentArea archon={archon} state={state} aiBusy={aiBusy}/>

        {/* Center: Source | Array | Reserve, with Cauldron overlay during learning */}
        <div className="center-area">
          {/* LEFT: Source deck */}
          <div style={{display:'grid', placeItems:'center', gap:14}}>
            <DeckColumn
              count={state.source.length}
              label={state.drought ? 'Source · Empty' : 'The Source'}
              clickable={canCollect && !state.drought}
              onClick={() => dispatch({ type:'COLLECT_SOURCE' })}
              tip={canCollect && !state.drought ? 'Click to draw blind' : null}
            />
            {state.drought && (
              <DeckColumn
                count={state.reserve.length}
                label="Released Reserve"
                inverted
                clickable={canCollect && state.drought}
                onClick={() => dispatch({ type:'COLLECT_SOURCE' })}
              />
            )}
          </div>

          {/* CENTER: Array OR cauldron — depending on phase */}
          {(state.phase === 'learning' || state.phase === 'drought-learning') ? (
            <div className="cauldron-zone">
              <window.AACauldron
                cards={cauldronCards}
                onAddCardId={handleAddToCauldron}
                onRemoveCardId={handleRemoveFromCauldron}
                onLearn={handleLearn}
                onClear={handleClearCauldron}
                empowering={empoweringSpell ? { spell: empoweringSpell } : null}
                onEmpowerCommit={handleEmpowerCommit}
                canLearn={canLearn}
                capacityRemaining={capacityRemaining}
              />
            </div>
          ) : (
            <ArrayZone
              array={state.array}
              canTake={canCollect && !state.drought}
              onTake={(idx) => dispatch({ type:'COLLECT_ARRAY', index: idx })}
              transfigPrompt={transfigPrompt}
              onTransfigArrayPick={(idx) => transfigPrompt && transfigPrompt.onArrayPick(idx)}
            />
          )}

          {/* RIGHT: Reserve / Discard */}
          <div style={{display:'grid', placeItems:'center'}}>
            <DeckColumn
              count={state.reserve.length}
              label={state.drought ? 'Reserve' : 'Arcane Reserve'}
              inverted
            />
          </div>
        </div>

        {/* Hand zone */}
        <HandZone
          you={you}
          state={state}
          isYourTurn={isYourTurn}
          canCast={canCast}
          canLearn={canLearn}
          openingPrompt={openingPrompt}
          transfigPrompt={transfigPrompt}
          cauldronIds={cauldronIds}
          onAddToCauldron={handleAddToCauldron}
          onRemoveFromCauldron={handleRemoveFromCauldron}
          dispatch={dispatch}
          empoweringSpell={empoweringSpell}
          onEmpowerStart={handleEmpowerStart}
          onUnlearn={handleUnlearn}
          counterCap={counterCap}
          counterUsed={counterUsed}
          animations={animations}
        />
      </div>

      {/* Side panels are absolutely positioned for layout */}
      <SidePanels state={state} log={state.log}/>

      {/* AI overlay */}
      {aiBusy && <div className="ai-thinking-banner">The Archon Considers</div>}

      {/* Cast effects */}
      {fxQueue && fxQueue.map(fx => <CastEffect key={fx.id} fx={fx}/>)}

      {/* Modals */}
      {openingPrompt && <OpeningModal you={you} onPick={openingPrompt.onPick}/>}
      {transfigPrompt && transfigPrompt.phase === 'pickHand' &&
        <TransfigDiscardModal you={you} need={transfigPrompt.need} onPick={transfigPrompt.onHandPick}/>}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────
function ActionCoach({ state, you, isYourTurn, aiBusy }){
  const E = window.AAEngine;
  const handBest = E.findBestLearnable(you.hand);
  const spellHint = handBest
    ? `${window.AATypeLabelUI[handBest.spec.type]} (${handBest.spec.length}) for ${E.spellScore(handBest.spec)} RP is available from hand.`
    : 'No complete hand pattern yet — collect suits, runs, or matching values.';
  const castable = you.spellbook.filter(sp => sp.spec.type !== 'ench' && !state.castSpellsThisTurn.includes(sp.id));
  const phaseCopy = {
    opening: ['Bind one card', 'Tap a starting component to send it to the Reserve. Keep cards that help make triples, runs, or matching values.'],
    collection: ['Collect a component', 'Tap the Source for mystery, or tap a face-up Array card that improves your next spell.'],
    casting: ['Cast learned spells', castable.length ? `You can cast ${castable.length} spell${castable.length === 1 ? '' : 's'} before continuing.` : 'No useful casts remain — continue to Learning.'],
    learning: ['Shape your grimoire', spellHint],
    'drought-collection': ['Drought collection', 'The Source is empty. Draw from the released Reserve, then make final improvements.'],
    'drought-learning': ['Final shaping', spellHint]
  };
  const [title, body] = phaseCopy[state.phase] || ['Plan your turn', 'Follow the highlighted cards and controls.'];
  return (
    <div className="action-coach">
      <div>
        <span className="action-coach-kicker">{isYourTurn ? 'Your move' : aiBusy ? 'Archon thinking' : 'Contest'}</span>
        <strong>{title}</strong>
        <span>{body}</span>
      </div>
      <div className="action-coach-mini">
        Source {state.source.length} · Array {state.array.filter(Boolean).length} · Reserve {state.reserve.length}
      </div>
    </div>
  );
}

function TopBar({ state, aiBusy, phaseLabel, dispatch }){
  const turnText = state.phase === 'opening' ? 'Opening' : `Turn ${Math.max(1,state.turnCount+1)} · ${state.players[state.currentPlayer].name}`;
  return (
    <div className="top-bar">
      <div className="top-bar-left">Archmage · Ascension</div>
      <div className="top-bar-mid">{turnText} · {phaseLabel}</div>
      <div className="top-bar-right">
        <div className="phase-pill"><span className="pip"/> {state.drought ? 'Drought' : 'Active'}</div>
        <button className="btn-ghost" onClick={() => {
          const el = document.querySelector('.phase-glossary-panel');
          if (el) el.classList.toggle('emphasized');
        }}>Help</button>
        <button className="btn-ghost" onClick={() => {
          if (confirm('Abandon this contest?')) dispatch({ type:'TO_TITLE' });
        }}>Resign</button>
      </div>
    </div>
  );
}

function OpponentArea({ archon, state, aiBusy }){
  return (
    <div className="opponent-area">
      <div style={{minWidth:160}}>
        <div className="status-row">
          <div className="status-key">The Archon</div>
        </div>
        <div className="status-row">
          <div className="status-key">Hand</div>
          <div className="status-val">{archon.hand.length}</div>
        </div>
        <div className="status-row">
          <div className="status-key">Capacity</div>
          <div className="status-val">
            {archon.unlimited ? <span className="unlimited-mark">∞</span> :
              <div className="counter-row">
                {Array.from({length: archon.counters}).map((_,i)=> <div key={i} className="counter-pip"/>)}
              </div>
            }
          </div>
        </div>
      </div>
      <div className="opponent-spellbook">
        {archon.spellbook.length === 0 && (
          <div style={{color:'var(--ink-faint)', fontStyle:'italic', fontSize:13}}>No spells learned yet.</div>
        )}
        {archon.spellbook.map(sp => (
          <window.AASpellTableau
            key={sp.id} spell={sp} scale={0.32}
            owner="opp"
            cast={state.castSpellsThisTurn.includes(sp.id) && state.currentPlayer === 1}
            hasCounter={state.castSpellsThisTurn.includes(sp.id) && state.currentPlayer === 1}
          />
        ))}
      </div>
    </div>
  );
}

function ArrayZone({ array, canTake, onTake, transfigPrompt, onTransfigArrayPick }){
  const transfigActive = transfigPrompt && transfigPrompt.phase === 'pickArray';
  return (
    <div className="cauldron-zone">
      <div style={{display:'flex', flexDirection:'column', gap:10, alignItems:'center'}}>
        <div style={{
          fontFamily:'var(--display)', letterSpacing:'0.3em', fontSize:10,
          color: transfigActive ? 'var(--gold)' : 'var(--gold-dim)',
          textTransform:'uppercase'
        }}>
          {transfigActive ? 'Pick a card from the Array' : 'The Array'}
        </div>
        <div className="array-zone" onKeyDown={window.AACardArrowNav}>
          {array.length === 0 && Array.from({length:5}).map((_,i)=>(
            <div key={i} className="array-card-slot empty">drained</div>
          ))}
          {array.map((c, i) => (
            <div key={i} className="array-card-slot">
              {c ? (
                <window.AACard
                  card={c}
                  scale={0.46}
                  onClick={() => {
                    if (transfigActive) onTransfigArrayPick(i);
                    else if (canTake) onTake(i);
                  }}
                  glowing={transfigActive || canTake}
                />
              ) : (
                <div className="array-card-slot empty">empty</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeckColumn({ count, label, clickable, onClick, tip, inverted }){
  return (
    <div onClick={clickable ? onClick : undefined} title={tip||''}
      style={{
        cursor: clickable ? 'pointer' : 'default',
        filter: clickable ? 'drop-shadow(0 0 12px rgba(245,213,136,0.4))' : 'none',
        transition: 'filter 0.2s, transform 0.2s',
        transform: clickable ? 'scale(1)' : 'scale(1)'
      }}
    >
      <window.AADeckStack count={count} label={label} faceDown={!inverted} scale={0.36}/>
    </div>
  );
}

function HandZone({ you, state, isYourTurn, canCast, canLearn, openingPrompt, transfigPrompt,
                    cauldronIds, onAddToCauldron, onRemoveFromCauldron, dispatch,
                    empoweringSpell, onEmpowerStart, onUnlearn,
                    counterCap, counterUsed, animations }){
  const cauldronSet = new Set(cauldronIds);
  const lastAcq = new Set(state.lastAcquired || []);
  const canDrag = (state.phase === 'learning' || state.phase === 'drought-learning') && isYourTurn;
  const canSelectForOpening = openingPrompt != null;

  return (
    <div className="hand-zone">
      <div className="hand-label">
        <div style={{display:'flex', gap:18, alignItems:'baseline'}}>
          <div className="hand-label-name">{you.name}'s Hand</div>
          <div style={{fontFamily:'var(--display)', fontSize:10, letterSpacing:'0.2em', color:'var(--ink-faint)'}}>
            {you.hand.length} components · {you.unlimited ? '∞' : `${counterCap - counterUsed}/${counterCap}`} capacity
          </div>
        </div>
        <PhaseControls
          state={state} isYourTurn={isYourTurn}
          canCast={canCast} canLearn={canLearn}
          dispatch={dispatch}
          you={you}
        />
      </div>

      {/* Spellbook strip — your spells */}
      <YourSpellbook
        you={you}
        state={state}
        canCast={canCast}
        canLearn={canLearn}
        empoweringSpellId={empoweringSpell?.id}
        onCast={(spellId) => dispatch({ type:'CAST_SPELL', spellId })}
        onEmpower={onEmpowerStart}
        onUnlearn={onUnlearn}
      />

      {/* Hand row — fanned */}
      <FannedHand
        cards={you.hand}
        cauldronSet={cauldronSet}
        lastAcq={lastAcq}
        canDrag={canDrag}
        canSelectForOpening={canSelectForOpening}
        openingPrompt={openingPrompt}
        transfigPrompt={transfigPrompt}
        onAddToCauldron={onAddToCauldron}
        onRemoveFromCauldron={onRemoveFromCauldron}
      />
    </div>
  );
}

function FannedHand({ cards, cauldronSet, lastAcq, canDrag, canSelectForOpening, openingPrompt, transfigPrompt, onAddToCauldron, onRemoveFromCauldron }){
  if (cards.length === 0){
    return <div className="hand-fan"><div className="hand-empty-msg">Your hand is empty.</div></div>;
  }
  const n = cards.length;
  // Spread: gentler with more cards
  const totalSpread = Math.min(46, n * 5.4);
  const step = n > 1 ? totalSpread / (n - 1) : 0;
  const center = (n - 1) / 2;
  return (
    <div className="hand-fan" onKeyDown={window.AACardArrowNav}>
      {cards.map((c, i) => {
        const off = i - center;
        const angle = off * step;
        // arc lift: outer cards drop slightly so tops align on a curve
        const yLift = Math.abs(off) * Math.abs(off) * 1.6;
        const inCauldron = cauldronSet.has(c.id);
        const acquired = lastAcq.has(c.id);
        return (
          <div key={c.id} className="hand-fan-slot" style={{
            transform: `rotate(${angle}deg) translateY(${yLift}px)`,
            zIndex: i
          }}>
            <window.AACard
              card={c}
              scale={0.46}
              draggable={canDrag && !inCauldron}
              dimmed={inCauldron}
              glowing={acquired}
              className={acquired ? 'just-acquired' : ''}
              onClick={() => {
                if (canSelectForOpening) openingPrompt.onPick(c.id);
                else if (transfigPrompt && transfigPrompt.phase === 'pickHand') transfigPrompt.toggleHand(c.id);
                else if (canDrag){
                  if (inCauldron) onRemoveFromCauldron(c.id);
                  else onAddToCauldron(c.id);
                }
              }}
              selected={transfigPrompt && transfigPrompt.selectedHand?.includes(c.id)}
            />
          </div>
        );
      })}
    </div>
  );
}

function YourSpellbook({ you, state, canCast, canLearn, empoweringSpellId, onCast, onEmpower, onUnlearn }){
  if (you.spellbook.length === 0){
    return (
      <div style={{
        padding: '14px 0', borderBottom: '1px dashed rgba(180,140,224,0.12)',
        color:'var(--ink-faint)', fontStyle:'italic', fontSize:13
      }}>
        Your grimoire is empty. Assemble three or more components in the Casting Circle to learn your first spell.
      </div>
    );
  }
  const counterCap = you.unlimited ? Infinity : you.counters;
  const used = state.castSpellsThisTurn.length;
  return (
    <div style={{
      display:'flex', gap:12, padding:'10px 0',
      borderBottom: '1px dashed rgba(180,140,224,0.12)',
      overflowX:'auto'
    }}>
      {you.spellbook.map(sp => {
        const cast = state.castSpellsThisTurn.includes(sp.id);
        const castableNow = canCast && !cast && sp.spec.type !== 'ench' && (you.unlimited || used < counterCap);
        return (
          <window.AASpellTableau
            key={sp.id} spell={sp} scale={0.42}
            owner="you"
            castable={castableNow}
            cast={cast}
            hasCounter={cast}
            showActions={canLearn && !empoweringSpellId}
            dimmed={empoweringSpellId === sp.id}
            onCast={() => onCast(sp.id)}
            onEmpower={canLearn ? () => onEmpower(sp.id) : null}
            onUnlearn={canLearn ? () => onUnlearn(sp.id) : null}
          />
        );
      })}
    </div>
  );
}

function PhaseControls({ state, isYourTurn, canCast, canLearn, dispatch, you }){
  if (!isYourTurn) return <div style={{height:36}}/>;
  if (state.phase === 'casting'){
    const used = state.castSpellsThisTurn.length;
    const cap = you.unlimited ? '∞' : you.counters;
    return (
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <div style={{fontFamily:'var(--display)', fontSize:10, letterSpacing:'0.2em', color:'var(--ink-dim)'}}>
          Counters: {used}/{cap}
        </div>
        <button className="btn-secondary" onClick={() => dispatch({ type:'END_CASTING' })}>
          Recall &amp; Continue
        </button>
      </div>
    );
  }
  if (state.phase === 'learning' || state.phase === 'drought-learning'){
    return (
      <button className="btn-secondary" onClick={() => dispatch({ type:'END_LEARNING' })}>
        End Turn
      </button>
    );
  }
  return <div style={{height:36}}/>;
}

function SidePanels({ state, log }){
  // Mounted into right rail
  const logRef = useRef(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log.length]);

  const you = state.players[0];
  return (
    <>
      <div style={{
        position:'absolute', left:14, top:80, width:194, bottom:20,
        display:'flex', flexDirection:'column', gap:12, pointerEvents:'none', zIndex:3
      }}>
        <div className="side-panel" style={{pointerEvents:'auto'}}>
          <div className="side-panel-title">Your Status</div>
          <div className="side-panel-body">
            <div className="status-row">
              <div className="status-key">Components</div>
              <div className="status-val">{you.hand.length}</div>
            </div>
            <div className="status-row">
              <div className="status-key">Spells</div>
              <div className="status-val">{you.spellbook.length}</div>
            </div>
            <div className="status-row">
              <div className="status-key">Capacity</div>
              <div className="status-val">
                {you.unlimited ? <span className="unlimited-mark">∞</span> :
                  <div className="counter-row">
                    {Array.from({length: you.counters}).map((_,i)=> <div key={i} className="counter-pip"/>)}
                  </div>
                }
              </div>
            </div>
            <div className="status-row">
              <div className="status-key">Provisional RP</div>
              <div className="status-val">
                {you.spellbook.reduce((a,sp)=>a+window.AAEngine.spellScore(sp.spec),0)}
              </div>
            </div>
          </div>
        </div>
        <div className="side-panel phase-glossary-panel" style={{pointerEvents:'auto'}}>
          <div className="side-panel-title">Phase Glossary</div>
          <div className="side-panel-body" style={{fontSize:12, color:'var(--ink-dim)', lineHeight:1.5}}>
            <p style={{margin:'0 0 8px'}}><b style={{color:'var(--gold-2)', fontFamily:'var(--display)', letterSpacing:'0.2em', fontSize:10}}>COLLECT</b><br/>Click a card from the Array (face up) or the Source pile (blind).</p>
            <p style={{margin:'0 0 8px'}}><b style={{color:'var(--gold-2)', fontFamily:'var(--display)', letterSpacing:'0.2em', fontSize:10}}>CAST</b><br/>Click a spell in your grimoire to invoke it. One counter per cast.</p>
            <p style={{margin:'0 0 0'}}><b style={{color:'var(--gold-2)', fontFamily:'var(--display)', letterSpacing:'0.2em', fontSize:10}}>LEARN</b><br/>Drag components into the Casting Circle, then choose Learn or Empower.</p>
          </div>
        </div>
      </div>
      <div style={{
        position:'absolute', right:14, top:80, width:194, bottom:20,
        pointerEvents:'auto'
      }}>
        <div className="side-panel" style={{height:'100%'}}>
          <div className="side-panel-title">Chronicle</div>
          <div className="side-panel-body" ref={logRef}>
            <div className="log-list">
              {log.slice(-50).map(e => (
                <div key={e.id} className={`log-entry ${e.kind}`}>{e.message}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Modals ───────────────────────────────────────────────
function OpeningModal({ you, onPick }){
  const [picked, setPicked] = useState(null);
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-eyebrow">The Opening</div>
        <h3 className="modal-title">Bind one component to the Reserve</h3>
        <p className="modal-tag">Each wizard begins by sacrificing one piece of their starting components — held aside, for now. Choose what you can spare.</p>
        <div className="modal-cards">
          {you.hand.map(c => (
            <window.AACard
              key={c.id} card={c} scale={0.46}
              selected={picked === c.id}
              onClick={() => setPicked(c.id)}
            />
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn-primary" disabled={!picked} style={{opacity: picked?1:0.4}}
            onClick={() => onPick(picked)}>
            Bind this Component
          </button>
        </div>
      </div>
    </div>
  );
}

function TransfigDiscardModal({ you, need, onPick }){
  const [selected, setSelected] = useState([]);
  const toggle = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x=>x!==id);
      if (prev.length >= need) return prev;
      return [...prev, id];
    });
  };
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-eyebrow">Transfiguration Exchange</div>
        <h3 className="modal-title">Discard {need} component{need>1?'s':''} to the Reserve</h3>
        <p className="modal-tag">In return, you'll claim one component from the Array. Click components to select.</p>
        <div className="modal-cards">
          {you.hand.map(c => (
            <window.AACard
              key={c.id} card={c} scale={0.42}
              selected={selected.includes(c.id)}
              onClick={() => toggle(c.id)}
            />
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn-primary"
            disabled={selected.length !== need}
            style={{opacity: selected.length === need ? 1 : 0.4}}
            onClick={() => onPick(selected)}>
            Discard ({selected.length}/{need})
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cast effect ──────────────────────────────────────────
function CastEffect({ fx }){
  // fx: { id, intensity (1..6), label }
  const rings = Math.min(6, Math.max(1, fx.intensity));
  return (
    <div className="cast-fx">
      {Array.from({length: rings}).map((_,i) => (
        <div key={i} className="cast-fx-ring" style={{
          animationDelay: `${i*0.12}s`,
          borderColor: i % 2 === 0 ? 'var(--gold)' : 'var(--violet)',
        }}/>
      ))}
      <div className="cast-fx-glyph">{fx.label}</div>
    </div>
  );
}

window.AAPlayScreen = PlayScreen;
