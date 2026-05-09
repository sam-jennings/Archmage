// ════════════════════════════════════════════════════════════════
// Archmage Ascension — Game state machine
// Central reducer. Pure-ish: returns new state for each action.
// ════════════════════════════════════════════════════════════════
(function(){
  'use strict';
  const E = window.AAEngine;

  const PHASE = {
    TITLE: 'title',
    OPENING: 'opening',           // both players bind 1 card
    COLLECTION: 'collection',     // active player picks a card
    CASTING: 'casting',           // active player casts spells
    LEARNING: 'learning',         // active player spends counters on learn/empower/etc
    DROUGHT_COLLECT: 'drought-collection',
    DROUGHT_LEARN: 'drought-learning',
    FINAL: 'final'
  };

  const TYPE_LABEL = {
    conj: 'Conjuration',
    trans: 'Transfiguration',
    perf: 'Perfect Transmutation',
    ench: 'Enchantment'
  };

  function initialState(){
    return { phase: PHASE.TITLE };
  }

  function startGame(){
    const deck = E.shuffle(E.makeDeck());
    const players = [
      makePlayer('you', 'Adept', false),
      makePlayer('archon', 'The Archon', true)
    ];
    // deal 7 each
    for (let i=0; i<7; i++){
      players[0].hand.push(deck.pop());
      players[1].hand.push(deck.pop());
    }
    // 5 array
    const array = [];
    for (let i=0; i<5; i++) array.push(deck.pop());
    return {
      phase: PHASE.OPENING,
      drought: false,
      currentPlayer: 0,
      starter: 0,
      turnCount: 0,
      source: deck,
      array,
      reserve: [],
      players,
      collectionDone: false,
      castSpellsThisTurn: [],
      unlearnedThisTurn: [],
      learningCountersUsed: 0,
      cauldron: [],
      pendingOpening: { discards: { you:null, archon:null } },
      log: [logEntry('The contest begins. Each wizard binds one component to the Reserve.', 'system')],
      flash: null,
      lastAcquired: [] // ids of cards just drawn — for animation flash
    };
  }

  function makePlayer(id, name, isAI){
    return { id, name, isAI, hand:[], spellbook:[], counters:1, unlimited:false };
  }

  function logEntry(message, kind='info'){
    return { id: E.uid('log'), ts: Date.now(), message, kind };
  }

  function clone(s){ return JSON.parse(JSON.stringify(s)); } // simple deep clone

  // ── Action handlers ──────────────────────────────────────
  function reduce(state, action){
    if (action.type === 'NEW_GAME')   return startGame();
    if (action.type === 'TO_TITLE')   return initialState();
    if (state.phase === PHASE.TITLE)  return state;
    const s = clone(state);
    s.flash = null;
    s.lastAcquired = [];

    switch (action.type){
      case 'OPENING_DISCARD': return openingDiscard(s, action);
      case 'COLLECT_SOURCE':  return collectSource(s);
      case 'COLLECT_ARRAY':   return collectArray(s, action);
      case 'CAST_SPELL':      return castSpell(s, action);
      case 'END_CASTING':     return endCasting(s);
      case 'CAULDRON_SET':    s.cauldron = action.ids; return s;
      case 'LEARN':           return learnSpell(s, action);
      case 'EMPOWER':         return empowerSpell(s, action);
      case 'UNLEARN':         return unlearnSpell(s, action);
      case 'RESHAPE':         return reshape(s, action);
      case 'END_LEARNING':    return endTurn(s);
      case 'LOG':             s.log.push(logEntry(action.message, action.kind||'info')); return s;
      case 'SET_STATE':       return action.state; // bulk replacement (used by AI)
      default: return s;
    }
  }

  // ── Opening ──────────────────────────────────────────────
  function openingDiscard(s, action){
    const pid = action.playerId;
    const card = s.players.find(p=>p.id===pid).hand.find(c=>c.id===action.cardId);
    if (!card) return s;
    const player = s.players.find(p=>p.id===pid);
    player.hand = player.hand.filter(c=>c.id!==action.cardId);
    s.reserve.unshift(card);
    s.pendingOpening.discards[pid] = action.cardId;
    s.log.push(logEntry(`${player.name} binds ${labelOf(card)} to the Reserve.`, 'opening'));
    // AI immediately discards if needed
    if (s.pendingOpening.discards.archon === null){
      const aiPlayer = s.players.find(p=>p.id==='archon');
      const aiPick = pickOpeningDiscard(aiPlayer.hand);
      aiPlayer.hand = aiPlayer.hand.filter(c=>c.id!==aiPick.id);
      s.reserve.unshift(aiPick);
      s.pendingOpening.discards.archon = aiPick.id;
      s.log.push(logEntry(`The Archon binds ${labelOf(aiPick)} to the Reserve.`, 'opening'));
    }
    if (s.pendingOpening.discards.you && s.pendingOpening.discards.archon){
      s.pendingOpening = null;
      s.phase = PHASE.COLLECTION;
      s.log.push(logEntry(`Turn 1. ${s.players[s.currentPlayer].name} begins.`, 'turn'));
    }
    return s;
  }

  // ── Collection ───────────────────────────────────────────
  function collectSource(s){
    if (s.collectionDone) return s;
    const player = s.players[s.currentPlayer];
    const drought = s.drought;
    const pile = drought ? s.reserve : s.source;
    if (!pile.length){
      // shouldn't happen — drought trigger handles it
      return s;
    }
    const card = pile.pop();
    player.hand.push(card);
    s.lastAcquired = [card.id];
    s.collectionDone = true;
    s.log.push(logEntry(`${player.name} draws from the ${drought ? 'Released Reserve' : 'Source'}.`, 'draw'));
    return advanceCollection(s);
  }
  function collectArray(s, action){
    if (s.drought) return s;
    if (s.collectionDone) return s;
    const idx = action.index;
    const card = s.array[idx];
    if (!card) return s;
    const player = s.players[s.currentPlayer];
    player.hand.push(card);
    s.array[idx] = s.source.pop() || null;
    s.lastAcquired = [card.id];
    s.collectionDone = true;
    s.log.push(logEntry(`${player.name} takes ${labelOf(card)} from the Array.`, 'draw'));
    return advanceCollection(s);
  }
  function advanceCollection(s){
    // If source just emptied, trigger Drought (after this collection)
    if (!s.drought && s.source.length === 0){
      // merge array into reserve, shuffle
      s.array.filter(Boolean).forEach(c => s.reserve.push(c));
      s.array = [];
      s.reserve = E.shuffle(s.reserve);
      s.drought = true;
      s.log.push(logEntry('The Source runs dry. The Drought begins. The Array dissolves into the Released Reserve.', 'drought'));
    }
    if (s.drought){
      // skip casting, go straight to learning
      s.phase = PHASE.DROUGHT_LEARN;
    } else {
      s.phase = PHASE.CASTING;
    }
    return s;
  }

  // ── Casting ──────────────────────────────────────────────
  function castSpell(s, action){
    if (s.phase !== PHASE.CASTING) return s;
    const player = s.players[s.currentPlayer];
    const spell = player.spellbook.find(sp=>sp.id===action.spellId);
    if (!spell) return s;
    if (s.castSpellsThisTurn.includes(spell.id)) return s;
    if (spell.spec.type === 'ench') return s; // enchantments don't cast
    if (!player.unlimited && s.castSpellsThisTurn.length >= player.counters) return s;
    // Resolve effect
    const log = [];
    if (spell.spec.type === 'conj' || spell.spec.type === 'perf'){
      const n = spell.cards.length >= 6 ? 2 : 1;
      for (let i=0; i<n; i++){
        if (s.source.length){
          const c = s.source.pop();
          player.hand.push(c);
          s.lastAcquired = (s.lastAcquired||[]).concat(c.id);
        }
      }
      log.push(`Conjures ${n} component${n>1?'s':''} from the Source.`);
    }
    if (spell.spec.type === 'trans' || spell.spec.type === 'perf'){
      // mark spell as needing transfiguration exchange — handled via UI prompt
      // For simplicity here: AI auto-resolves; for human, we mark a pending exchange
      const discardCount = spell.cards.length === 3 ? 2 : 1;
      // Check feasibility: hand needs that many cards AND array has at least 1
      if (player.hand.length < discardCount || s.array.filter(Boolean).length === 0){
        s.log.push(logEntry(`${player.name} cannot complete the exchange — casting aborted.`, 'warn'));
        return s;
      }
      s.pendingTransfig = {
        playerId: player.id,
        spellId: spell.id,
        discardCount,
      };
      s.castSpellsThisTurn.push(spell.id);
      s.log.push(logEntry(`${player.name} casts ${TYPE_LABEL[spell.spec.type]} (${spell.cards.length}) — must exchange ${discardCount} for 1 from the Array.`, 'cast'));
      return s;
    }
    s.castSpellsThisTurn.push(spell.id);
    s.log.push(logEntry(`${player.name} casts ${TYPE_LABEL[spell.spec.type]} (${spell.cards.length}). ${log.join(' ')}`.trim(), 'cast'));
    return s;
  }

  // ── Transfiguration exchange (resolves pendingTransfig) ──
  function resolveTransfig(s, discards, arrayIdx){
    if (!s.pendingTransfig) return s;
    const player = s.players.find(p=>p.id===s.pendingTransfig.playerId);
    const need = s.pendingTransfig.discardCount;
    if (discards.length !== need) return s;
    // discard cards
    for (const cid of discards){
      const c = player.hand.find(cc=>cc.id===cid);
      if (!c) return s;
      player.hand = player.hand.filter(cc=>cc.id!==cid);
      s.reserve.unshift(c);
    }
    const taken = s.array[arrayIdx];
    if (!taken) return s;
    player.hand.push(taken);
    s.lastAcquired = (s.lastAcquired||[]).concat(taken.id);
    s.array[arrayIdx] = s.source.pop() || null;
    const sp = player.spellbook.find(x=>x.id===s.pendingTransfig.spellId);
    s.log.push(logEntry(`Exchange complete. ${player.name} adds ${labelOf(taken)} from the Array.`, 'cast'));
    s.pendingTransfig = null;
    // If this was a perf, the conjuration draw also happened earlier? Actually we did it before this. OK.
    // Check drought trigger
    if (!s.drought && s.source.length === 0){
      s.array.filter(Boolean).forEach(c => s.reserve.push(c));
      s.array = [];
      s.reserve = E.shuffle(s.reserve);
      s.drought = true;
      s.log.push(logEntry('The Source runs dry. The Drought begins.', 'drought'));
    }
    return s;
  }

  function endCasting(s){
    if (s.phase !== PHASE.CASTING) return s;
    if (s.pendingTransfig) return s; // can't end while exchange pending
    s.phase = PHASE.LEARNING;
    s.castSpellsThisTurn = [];
    s.learningCountersUsed = 0;
    s.log.push(logEntry(`${s.players[s.currentPlayer].name} recalls counters. Learning begins.`, 'recall'));
    return s;
  }

  // ── Learning ─────────────────────────────────────────────
  function learnCheck(s){
    const player = s.players[s.currentPlayer];
    if (player.unlimited) return true;
    const cap = player.counters;
    return s.learningCountersUsed < cap;
  }

  function learnSpell(s, action){
    if (![PHASE.LEARNING, PHASE.DROUGHT_LEARN].includes(s.phase)) return s;
    const player = s.players[s.currentPlayer];
    if (!learnCheck(s)) { s.log.push(logEntry('Out of learning capacity.','warn')); return s; }
    // action.cards = card ids in player's hand
    const cards = action.cards.map(id => player.hand.find(c=>c.id===id)).filter(Boolean);
    if (cards.length !== action.cards.length) return s;
    // Validate
    let spec = action.type ? E.classifyAs(cards, action.type) : E.classify(cards);
    if (!spec){ s.log.push(logEntry('Invalid spell pattern.','warn')); return s; }
    // Remove from hand
    const ids = new Set(cards.map(c=>c.id));
    player.hand = player.hand.filter(c=>!ids.has(c.id));
    // Place in spellbook
    const spell = { id: E.uid('sp'), cards, spec };
    player.spellbook.push(spell);
    if (!player.unlimited) s.learningCountersUsed += 1;
    // Enchantment counter bonus
    if (spec.type === 'ench'){
      if (spec.length === 3){
        player.counters += 1;
        s.log.push(logEntry(`${player.name} learns a 3-Enchantment. Capacity grows to ${player.counters}.`, 'learn'));
      } else if (spec.length === 4){
        player.unlimited = true;
        s.log.push(logEntry(`${player.name} learns a 4-Enchantment. Unlimited Capacity attained.`, 'learn'));
      } else {
        s.log.push(logEntry(`${player.name} weaves an Enchantment of ${spec.length}.`, 'learn'));
      }
    } else {
      s.log.push(logEntry(`${player.name} learns ${TYPE_LABEL[spec.type]} (${spec.length}).`, 'learn'));
    }
    return s;
  }

  function empowerSpell(s, action){
    if (![PHASE.LEARNING, PHASE.DROUGHT_LEARN].includes(s.phase)) return s;
    const player = s.players[s.currentPlayer];
    if (!learnCheck(s)) { s.log.push(logEntry('Out of capacity.','warn')); return s; }
    const sp = player.spellbook.find(x=>x.id===action.spellId);
    if (!sp) return s;
    const adds = action.cards.map(id => player.hand.find(c=>c.id===id)).filter(Boolean);
    if (adds.length !== action.cards.length) return s;
    const newCards = sp.cards.concat(adds);
    const spec = action.type ? E.classifyAs(newCards, action.type) : E.classify(newCards);
    if (!spec) { s.log.push(logEntry('Empower would invalidate spell.','warn')); return s; }
    const oldType = sp.spec.type;
    const oldEnch3 = oldType === 'ench' && sp.spec.length === 3;
    const oldEnch4 = oldType === 'ench' && sp.spec.length === 4;
    sp.cards = newCards;
    sp.spec = spec;
    const ids = new Set(adds.map(c=>c.id));
    player.hand = player.hand.filter(c=>!ids.has(c.id));
    if (!player.unlimited) s.learningCountersUsed += 1;
    // Capacity adjustments if ench transitions
    const newEnch3 = spec.type === 'ench' && spec.length === 3;
    const newEnch4 = spec.type === 'ench' && spec.length === 4;
    if (oldEnch3 && !newEnch3){ player.counters = Math.max(1, player.counters - 1); }
    if (!oldEnch3 && newEnch3){ player.counters += 1; }
    if (oldEnch4 && !newEnch4){ player.unlimited = false; }
    if (!oldEnch4 && newEnch4){ player.unlimited = true; }
    s.log.push(logEntry(`${player.name} empowers — now ${TYPE_LABEL[spec.type]} (${spec.length}).`, 'learn'));
    return s;
  }

  function unlearnSpell(s, action){
    if (![PHASE.LEARNING, PHASE.DROUGHT_LEARN].includes(s.phase)) return s;
    const player = s.players[s.currentPlayer];
    if (!learnCheck(s)) { s.log.push(logEntry('Out of capacity.','warn')); return s; }
    const sp = player.spellbook.find(x=>x.id===action.spellId);
    if (!sp) return s;
    if (sp.spec.type === 'ench' && sp.spec.length === 3) player.counters = Math.max(1, player.counters - 1);
    if (sp.spec.type === 'ench' && sp.spec.length === 4) player.unlimited = false;
    player.hand = player.hand.concat(sp.cards);
    player.spellbook = player.spellbook.filter(x=>x.id!==sp.id);
    s.unlearnedThisTurn.push(sp.id);
    if (!player.unlimited) s.learningCountersUsed += 1;
    s.log.push(logEntry(`${player.name} dissolves a ${TYPE_LABEL[sp.spec.type]}.`, 'learn'));
    return s;
  }

  function reshape(s, action){
    // action.newSpells = [{cards: cardIds, type?}], all from spellbook+hand combined - we'd need to validate
    // For slice scope, we skip Reshape — Empower + Unlearn cover most use cases.
    return s;
  }

  // ── Turn end ─────────────────────────────────────────────
  function endTurn(s){
    if (![PHASE.LEARNING, PHASE.DROUGHT_LEARN].includes(s.phase)) return s;
    // check end-of-game during drought
    if (s.drought && s.reserve.length === 0){
      s.phase = PHASE.FINAL;
      s.log.push(logEntry('The Released Reserve is depleted. The Ascension begins.', 'final'));
      return s;
    }
    // advance current player
    s.currentPlayer = (s.currentPlayer + 1) % s.players.length;
    s.collectionDone = false;
    s.castSpellsThisTurn = [];
    s.learningCountersUsed = 0;
    s.unlearnedThisTurn = [];
    s.cauldron = [];
    s.turnCount += 1;
    s.phase = s.drought ? PHASE.DROUGHT_LEARN /* will get rerouted via collection */ : PHASE.COLLECTION;
    if (s.drought){
      s.phase = PHASE.DROUGHT_LEARN;
      // Auto-collect 1 from reserve at start of drought turn
      const c = s.reserve.pop();
      if (c){
        s.players[s.currentPlayer].hand.push(c);
        s.lastAcquired = [c.id];
        s.log.push(logEntry(`${s.players[s.currentPlayer].name} draws from the Released Reserve.`, 'draw'));
      }
      // After this last collection, check end
      if (s.reserve.length === 0){
        // Will end after this player's learning. continue.
      }
    } else {
      s.phase = PHASE.COLLECTION;
    }
    s.log.push(logEntry(`${s.players[s.currentPlayer].name}'s turn.`, 'turn'));
    return s;
  }

  // ── Helpers ──────────────────────────────────────────────
  function labelOf(c){
    if (c.suit === 'wild') return 'Convergence';
    return c.suit.charAt(0).toUpperCase()+c.suit.slice(1)+' '+c.value;
  }
  function pickOpeningDiscard(hand){
    // discard lowest-value, prefer to keep wilds
    const sorted = hand.slice().sort((a,b)=>{
      if (a.suit==='wild') return 1;
      if (b.suit==='wild') return -1;
      return a.value - b.value;
    });
    return sorted[0];
  }

  // ── Final scoring ────────────────────────────────────────
  function finalScores(state){
    return state.players.map(p => {
      const breakdown = p.spellbook.map(sp => ({
        id: sp.id,
        type: sp.spec.type,
        size: sp.cards.length,
        score: E.spellScore(sp.spec)
      }));
      const total = breakdown.reduce((a,b)=>a+b.score,0);
      return {
        playerId: p.id,
        name: p.name,
        breakdown,
        total,
        spellCount: p.spellbook.length,
        largest: p.spellbook.reduce((m, sp) => Math.max(m, sp.cards.length), 0)
      };
    }).sort((a,b)=>{
      if (b.total !== a.total) return b.total - a.total;
      if (b.spellCount !== a.spellCount) return b.spellCount - a.spellCount;
      return b.largest - a.largest;
    });
  }

  window.AAState = {
    PHASE, TYPE_LABEL,
    initialState, startGame, reduce,
    finalScores,
    resolveTransfig,
    labelOf
  };
})();
