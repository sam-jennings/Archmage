/* global React */
// ════════════════════════════════════════════════════════════════
// Archmage Ascension — Card components
// Wraps lib/cards.js SVG renderer. Provides faces, backs, drag handles.
// ════════════════════════════════════════════════════════════════

const SUIT_NAMES = {
  radiance: 'Radiance',
  void: 'Void',
  flux: 'Flux',
  aether: 'Aether',
  wild: 'Convergence'
};

const SUIT_COLORS = {
  radiance: { b:'#f5c518', m:'#c8961a', dim:'#3a2800' },
  void:     { b:'#c060f0', m:'#6a0dad', dim:'#200840' },
  flux:     { b:'#00c8b4', m:'#008878', dim:'#002820' },
  aether:   { b:'#e8304a', m:'#c8203a', dim:'#400010' },
  wild:     { b:'#c8d8f8', m:'#7080b8', dim:'#101828' }
};

function cardLabel(card){
  if (!card) return '';
  if (card.suit === 'wild') return 'Convergence';
  return SUIT_NAMES[card.suit] + ' ' + card.value;
}

// Render a single card face as an inline SVG string.
function CardFace({ card, scale = 0.46, connector, art, layout = 'tarot' }){
  const conn = connector || window.AA_DEFAULT_CONNECTOR || 'bloom-soft';
  const artUse = art || window.AA_DEFAULT_ART || 'mystic';
  const html = React.useMemo(() => {
    if (!window.ArchmageCards) return '';
    if (!card) return '';
    if (card.suit === 'wild' || card.value === 0){
      return window.ArchmageCards.makeWildCard({ scale, connector: conn, art: artUse, layout });
    }
    return window.ArchmageCards.makeCard(card.value, card.suit, { scale, connector: conn, art: artUse, layout });
  }, [card?.id, scale, conn, artUse, layout]);
  return React.createElement('div', {
    className: 'card-face-host',
    dangerouslySetInnerHTML: { __html: html }
  });
}

// Card back — minimalist arcane sigil
function CardBack({ scale = 0.46 }){
  const W = 252 * scale, H = 352 * scale;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="card-back-svg">
      <defs>
        <radialGradient id="cb-g" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#1a1228" stopOpacity="1"/>
          <stop offset="100%" stopColor="#06040c" stopOpacity="1"/>
        </radialGradient>
      </defs>
      <rect width={W} height={H} rx={12*scale} fill="url(#cb-g)"/>
      <rect x="2" y="2" width={W-4} height={H-4} rx={11*scale} fill="none" stroke="#7a60a8" strokeOpacity="0.32" strokeWidth={scale}/>
      <rect x="6" y="6" width={W-12} height={H-12} rx={9*scale} fill="none" stroke="#7a60a8" strokeOpacity="0.14" strokeWidth={0.6*scale}/>
      <g transform={`translate(${W/2},${H/2})`} opacity="0.62">
        {/* 4-current kite at center */}
        <polygon points={`0,${-22*scale} ${7*scale},${-7*scale} 0,0 ${-7*scale},${-7*scale}`} fill="#f5c518" opacity="0.78"/>
        <polygon points={`${22*scale},0 ${7*scale},${7*scale} 0,0 ${7*scale},${-7*scale}`} fill="#e8304a" opacity="0.78"/>
        <polygon points={`0,${22*scale} ${-7*scale},${7*scale} 0,0 ${7*scale},${7*scale}`} fill="#00c8b4" opacity="0.78"/>
        <polygon points={`${-22*scale},0 ${-7*scale},${-7*scale} 0,0 ${-7*scale},${7*scale}`} fill="#c060f0" opacity="0.78"/>
        <circle r={3*scale} fill="#edf2ff" opacity="0.92"/>
        {/* outer rings */}
        <circle r={42*scale} fill="none" stroke="#c8b8e8" strokeOpacity="0.18" strokeWidth={0.7*scale}/>
        <circle r={64*scale} fill="none" stroke="#c8b8e8" strokeOpacity="0.10" strokeWidth={0.6*scale}/>
        <circle r={86*scale} fill="none" stroke="#c8b8e8" strokeOpacity="0.06" strokeWidth={0.5*scale}/>
        {/* tick crowns */}
        {Array.from({length:24}).map((_,i)=>{
          const a = (i/24)*Math.PI*2;
          const r1 = 100*scale, r2 = 108*scale;
          return (
            <line key={i}
              x1={Math.cos(a)*r1} y1={Math.sin(a)*r1}
              x2={Math.cos(a)*r2} y2={Math.sin(a)*r2}
              stroke="#c8b8e8" strokeOpacity={i%6===0?0.34:0.14} strokeWidth={i%6===0?1*scale:0.6*scale}
            />
          );
        })}
      </g>
      <text x={W/2} y={H-14*scale}
        fontFamily="Cinzel, serif" fontSize={8*scale} fill="#a894c2"
        textAnchor="middle" letterSpacing={2.4*scale}>ARCHMAGE ASCENSION</text>
    </svg>
  );
}

// Wrapper card — handles selection, hover, click, and drag (via the Pointer
// Events controller in game/drag-controller.js).
//
// Drag is opt-in via the `draggable` prop, which sets data-draggable="true"
// for the controller to find. The controller never starts a drag below the
// move threshold, so onClick remains the tap-to-toggle path on touch devices.
function Card({
  card, scale = 0.46, connector, art, layout = 'tarot',
  selected, dimmed, glowing, draggable, faceDown,
  onClick,
  className = '', style = {},
  title
}){
  return (
    <div
      className={`card-wrap ${selected ? 'sel' : ''} ${dimmed ? 'dim' : ''} ${glowing ? 'glow' : ''} ${className}`}
      style={style}
      onClick={onClick}
      title={title || cardLabel(card)}
      data-card-id={card?.id}
      data-draggable={draggable ? 'true' : 'false'}
    >
      {faceDown
        ? <CardBack scale={scale}/>
        : <CardFace card={card} scale={scale} connector={connector} art={art} layout={layout}/>}
    </div>
  );
}

// A small "deck" stack visual — N cards face down with offset to imply pile depth
function DeckStack({ count, label, scale = 0.34, faceDown = true, topCard = null, connector, art }){
  const W = 252*scale, H = 352*scale;
  const visible = Math.min(count, 5);
  return (
    <div className="deck-stack" style={{ width: W + visible*2, height: H + visible*2 }}>
      <div className="deck-pile" style={{ width: W, height: H }}>
        {Array.from({length: visible}).map((_,i)=>(
          <div key={i} className="deck-pile-layer" style={{
            transform: `translate(${i*1.2}px, ${i*1.2}px)`,
            zIndex: i
          }}>
            {faceDown
              ? <CardBack scale={scale}/>
              : (topCard && i === visible-1
                  ? <CardFace card={topCard} scale={scale} connector={connector} art={art}/>
                  : <CardBack scale={scale}/>)}
          </div>
        ))}
        {count === 0 && (
          <div className="deck-empty" style={{ width: W, height: H }}>
            <div className="deck-empty-inner">empty</div>
          </div>
        )}
      </div>
      {label && <div className="deck-label">
        <div className="deck-label-name">{label}</div>
        <div className="deck-label-count">{count}</div>
      </div>}
    </div>
  );
}

window.AACard = Card;
window.AACardFace = CardFace;
window.AACardBack = CardBack;
window.AADeckStack = DeckStack;
window.AACardLabel = cardLabel;
window.AASUIT_NAMES = SUIT_NAMES;
window.AASUIT_COLORS = SUIT_COLORS;
