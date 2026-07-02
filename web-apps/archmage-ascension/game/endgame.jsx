/* global React */
// ════════════════════════════════════════════════════════════════
// End screen — final scoring & winner
// ════════════════════════════════════════════════════════════════

function EndScreen({ state, onRestart, onTitle }){
  const ranked = window.AAState.finalScores(state);
  const winner = ranked[0];
  const tag = winner.total > ranked[1]?.total
    ? 'A clear ascension.'
    : (winner.total === ranked[1]?.total ? 'Decided by the spread of their work.' : '');
  const cardRef = React.useRef(null);
  window.useAAFocusTrap(cardRef);
  return (
    <div className="end-screen">
      <div className="end-screen-card" ref={cardRef}>
        <div className="end-eyebrow">Final Evaluation</div>
        <h2 className="end-title">{winner.name} ascends</h2>
        <p className="end-tag">{tag || 'The contest is concluded.'}</p>
        <div className="end-table">
          {ranked.map((r, idx) => (
            <div key={r.playerId} className={`end-row ${idx === 0 ? 'winner' : ''}`}>
              <div className="end-rank">{idx === 0 ? '★' : (idx+1)}</div>
              <div>
                <div className="end-name">{r.name}</div>
                <div className="end-spells">
                  {r.spellCount} spells · largest {r.largest} cards
                  {r.breakdown.length > 0 && ' · '}
                  {r.breakdown.map(b => `${labelType(b.type)} ${b.size}`).join(' · ')}
                </div>
              </div>
              <div className="end-score">{r.total}</div>
            </div>
          ))}
        </div>
        <div className="end-actions">
          <button className="btn-primary" onClick={onRestart}>Begin Another</button>
          <button className="btn-secondary" onClick={onTitle}>Return to Title</button>
        </div>
      </div>
    </div>
  );
}
function labelType(t){
  return { conj:'Conj', trans:'Trans', perf:'Perf', ench:'Ench' }[t] || t;
}

window.AAEndScreen = EndScreen;
