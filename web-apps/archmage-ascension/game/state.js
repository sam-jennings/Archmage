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
    // counters        = current usable Magical Capacity (finite; base 1).
    // pendingCapacity = Enchantment capacity gained this turn that becomes usable
    //                   at the START of the player's next turn (F3 deferred gain, v3.1).
    return { id, name, isAI, hand:[], spellbook:[], counters:1, pendingCapacity:0 };
  }

  function logEntry(message, kind='info'){
    return { id: E.uid('log'), ts: Date.now(), message, kind };
  }

  function clone(s){ return JSON.parse(JSON.stringify(s)); } // simple deep clone

  // ── v3.1 Enchantment capacity ladder ─────────────────────
  // Cumulative counter total granted by an Enchantment of a given size:
  // 3-card = +1, 4-card = +3, 5-card = +5. (The 5-card Enchantment is only
  // reachable in the 5–6p Echo deck; this 2-player build caps Enchantments at 4.)
  function enchGrant(size){ return ({ 3:1, 4:3, 5:5 })[size] || 0; }

  // F3 affordability gate (Req 5.3): a capacity-REDUCING action may only be
  // performed if the player can pay the action's counter cost AND absorb the
  // immediate capacity loss out of *currently available* capacity. Pending gains
  // are not available yet, so they don't count. `learningCountersUsed` is the
  // capacity already spent this turn; actionCost defaults to 1 (LEARN/UNLEARN/
  // EMPOWER), RESHAPE passes the number of spells broken.
  function canAffordLoss(s, player, loss, actionCost){
    const cost = (actionCost == null) ? 1 : actionCost;
    return (player.counters - s.learningCountersUsed) >= (cost + loss);
  }

  // ── Action handlers ──────────────────────────────────────
  function reduce(state, action){
    if (action.type === 'NEW_GAME')   return startGame();
    if (action.type === 'LOAD_GAME')  return action.state || state;
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
    if (s.castSpellsThisTurn.length >= player.counters) return s; // cast up to capacity (all players)
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
    return s.learningCountersUsed < player.counters;
  }

  function learnSpell(s, action){
    if (![PHASE.LEARNING, PHASE.DROUGHT_LEARN].includes(s.phase)) return s;
    const player = s.players[s.currentPlayer];
    if (!learnCheck(s)) { s.log.push(logEntry('Out of learning capacity.','warn')); return s; }
    // action.cards = card ids in player's hand
    const cards = action.cards.map(id => player.hand.find(c=>c.id===id)).filter(Boolean);
    if (cards.length !== action.cards.length) return s;
    // Validate
    let spec = action.spellType ? E.classifyAs(cards, action.spellType) : E.classify(cards);
    if (!spec){ s.log.push(logEntry('Invalid spell pattern.','warn')); return s; }
    // Remove from hand
    const ids = new Set(cards.map(c=>c.id));
    player.hand = player.hand.filter(c=>!ids.has(c.id));
    // Place in spellbook
    const spell = { id: E.uid('sp'), cards, spec };
    player.spellbook.push(spell);
    s.learningCountersUsed += 1; // learning always costs one action
    // v3.1: Enchantment capacity is a DEFERRED F3 gain — it becomes usable at the
    // start of the player's next turn, not now. Ladder: +1 / +3 / +5 (sizes 3/4/5).
    if (spec.type === 'ench'){
      const grant = enchGrant(spec.length);
      player.pendingCapacity += grant;
      s.log.push(logEntry(`${player.name} learns a ${spec.length}-Enchantment; +${grant} capacity arrives next turn.`, 'learn'));
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
    // Use action.spellType (not action.type — that is the dispatch key 'EMPOWER') as
    // the optional explicit classification, matching learnSpell's convention.
    const spec = action.spellType ? E.classifyAs(newCards, action.spellType) : E.classify(newCards);
    if (!spec) { s.log.push(logEntry('Empower would invalidate spell.','warn')); return s; }
    const oldType = sp.spec.type;
    const oldLen  = sp.spec.length;
    // v3.1 (Req 6.2): EMPOWER may extend a spell or convert among conj/trans/perf,
    // but MUST NOT cross the Enchantment boundary in either direction. Becoming or
    // ceasing to be an Enchantment goes through LEARN / UNLEARN only.
    if (oldType === 'ench' && spec.type !== 'ench'){
      s.log.push(logEntry('Empower cannot turn an Enchantment into another type — use Unlearn.','warn'));
      return s;
    }
    if (oldType !== 'ench' && spec.type === 'ench'){
      s.log.push(logEntry('Empower cannot turn a spell into an Enchantment — use Learn.','warn'));
      return s;
    }
    // Commit the empower.
    sp.cards = newCards;
    sp.spec = spec;
    const ids = new Set(adds.map(c=>c.id));
    player.hand = player.hand.filter(c=>!ids.has(c.id));
    s.learningCountersUsed += 1;
    // Growing an Enchantment (ench → larger ench) adds ladder capacity — a DEFERRED
    // F3 gain (arrives next turn). Empower only adds cards, so an Enchantment can only
    // grow, never shrink; the grant is always ≥ 0 and never triggers the loss gate.
    if (spec.type === 'ench'){
      const grant = enchGrant(spec.length) - enchGrant(oldLen);
      if (grant > 0){
        player.pendingCapacity += grant;
        s.log.push(logEntry(`${player.name} empowers the Enchantment to ${spec.length}; +${grant} capacity arrives next turn.`, 'learn'));
      } else {
        s.log.push(logEntry(`${player.name} empowers the Enchantment — now ${spec.length}.`, 'learn'));
      }
    } else {
      s.log.push(logEntry(`${player.name} empowers — now ${TYPE_LABEL[spec.type]} (${spec.length}).`, 'learn'));
    }
    return s;
  }

  function unlearnSpell(s, action){
    if (![PHASE.LEARNING, PHASE.DROUGHT_LEARN].includes(s.phase)) return s;
    const player = s.players[s.currentPlayer];
    if (!learnCheck(s)) { s.log.push(logEntry('Out of capacity.','warn')); return s; }
    const sp = player.spellbook.find(x=>x.id===action.spellId);
    if (!sp) return s;

    // v3.1 (Reqs 4.1/4.3/4.5, 5.3): return one or more components from a SINGLE spell.
    //   action.cards  — ids to return; omitted/empty (or all of them) = full dissolve.
    const spellCardIds = sp.cards.map(c=>c.id);
    const returnIds = Array.isArray(action.cards) ? action.cards.slice() : [];
    if (returnIds.some(id => !spellCardIds.includes(id))){
      s.log.push(logEntry('Unlearn names a component that is not in that spell.','warn'));
      return s;
    }
    const returnSet = new Set(returnIds);
    const fullDissolve = returnIds.length === 0 || returnSet.size === spellCardIds.length;

    const oldType = sp.spec.type;
    const oldSize = sp.cards.length;

    // Validate the remainder for a partial unlearn.
    let newSpec = null, remainderCards = null;
    if (!fullDissolve){
      const returned = sp.cards.filter(c => returnSet.has(c.id));
      remainderCards = sp.cards.filter(c => !returnSet.has(c.id));
      // A run (trans/perf) may only shed an END component when exactly one card is
      // returned — removing a middle card is not a valid single-spell downgrade.
      if ((oldType === 'trans' || oldType === 'perf') && returned.length === 1){
        const rc = returned[0];
        const rv = rc.suit === 'wild'
          ? (sp.spec.declarations[rc.id] && sp.spec.declarations[rc.id].value)
          : rc.value;
        if (rv !== sp.spec.runStart && rv !== sp.spec.runEnd){
          s.log.push(logEntry('A run can only shed an end component (its lowest or highest).','warn'));
          return s;
        }
      }
      newSpec = E.classify(remainderCards);
      if (!newSpec){
        s.log.push(logEntry('The remaining components would not form a valid spell.','warn'));
        return s;
      }
    }

    // Enchantment capacity loss (immediate). newSize contributes 0 on full dissolve
    // or if the remainder is somehow no longer an Enchantment.
    let loss = 0;
    if (oldType === 'ench'){
      const newEnchSize = (!fullDissolve && newSpec.type === 'ench') ? remainderCards.length : 0;
      loss = Math.max(0, enchGrant(oldSize) - enchGrant(newEnchSize));
    }
    // F3 gate (Req 5.3): must afford the action AND the immediate loss right now.
    if (loss > 0 && !canAffordLoss(s, player, loss)){
      s.log.push(logEntry('Not enough available capacity to absorb the Enchantment loss — action blocked.','warn'));
      return s;
    }

    // ── Apply (no early return past this point) ──
    const returnedCards = fullDissolve ? sp.cards.slice() : sp.cards.filter(c => returnSet.has(c.id));
    if (fullDissolve){
      player.spellbook = player.spellbook.filter(x=>x.id!==sp.id);
    } else {
      sp.cards = remainderCards;
      sp.spec = newSpec;
    }
    player.hand = player.hand.concat(returnedCards);
    if (loss > 0) player.counters = Math.max(1, player.counters - loss);
    // Returned components can't seed new spells until the player's next turn (Req 4.5).
    returnedCards.forEach(c => s.unlearnedThisTurn.push(c.id));
    s.learningCountersUsed += 1; // one action regardless of how many components returned

    if (fullDissolve){
      s.log.push(logEntry(`${player.name} dissolves a ${TYPE_LABEL[oldType]}${loss>0?` (−${loss} capacity)`:''}.`, 'learn'));
    } else {
      s.log.push(logEntry(`${player.name} unlearns ${returnedCards.length} from a ${TYPE_LABEL[oldType]} — now ${TYPE_LABEL[newSpec.type]} (${remainderCards.length})${loss>0?`, −${loss} capacity`:''}.`, 'learn'));
    }
    return s;
  }

  function reshape(s, action){
    // ── RESHAPE (v3.1, Req 3.1) ──────────────────────────────
    // Break N spells and rebuild ALL their freed components into new valid spells.
    // Cost: one counter per spell broken. Every freed component must be reused and
    // every new spell must be valid, or the whole action is rejected (no mutation).
    //
    // Action shape (documented for the play UI / Task 10 to build against):
    //   { type: 'RESHAPE',
    //     brokenSpellIds: [ spellId, ... ],                 // spells to tear down
    //     newSpells: [ { cards: [ cardId, ... ], type? }, ...] }  // rebuilt spells
    //   - `cards` on each new spell are ids drawn only from the freed components;
    //     across newSpells they must use every freed component exactly once.
    //   - `type` is optional: 'conj' | 'trans' | 'perf' | 'ench' (omit to let the
    //     engine pick the highest-scoring valid classification).
    // Enchantment capacity: net = Σ enchGrant(new ench sizes) − Σ enchGrant(old ench
    //   sizes). A net LOSS applies immediately and is subject to the F3 affordability
    //   gate (action cost = number of spells broken); a net GAIN is deferred to next turn.
    if (![PHASE.LEARNING, PHASE.DROUGHT_LEARN].includes(s.phase)) return s;
    const player = s.players[s.currentPlayer];
    const brokenIds = Array.isArray(action.brokenSpellIds) ? action.brokenSpellIds : [];
    const newSpells = Array.isArray(action.newSpells) ? action.newSpells : [];
    if (!brokenIds.length){ s.log.push(logEntry('Reshape needs at least one spell to break.','warn')); return s; }

    // Cost = one counter per broken spell.
    if (s.learningCountersUsed + brokenIds.length > player.counters){
      s.log.push(logEntry('Not enough capacity to reshape that many spells.','warn'));
      return s;
    }

    // Resolve broken spells and the pool of freed components.
    const broken = brokenIds.map(id => player.spellbook.find(sp=>sp.id===id));
    if (broken.some(sp => !sp)){ s.log.push(logEntry('Reshape names a spell that is not in the spellbook.','warn')); return s; }
    const freed = [];
    broken.forEach(sp => sp.cards.forEach(c => freed.push(c)));
    const freedById = new Map(freed.map(c => [c.id, c]));

    // Build & validate the new spells; every freed component must be used exactly once.
    const usedIds = new Set();
    const built = [];
    for (const ns of newSpells){
      const ids = Array.isArray(ns.cards) ? ns.cards : [];
      const cards = [];
      for (const id of ids){
        if (!freedById.has(id)){ s.log.push(logEntry('Reshape uses a component that was not freed.','warn')); return s; }
        if (usedIds.has(id)){ s.log.push(logEntry('Reshape uses a component twice.','warn')); return s; }
        usedIds.add(id);
        cards.push(freedById.get(id));
      }
      const spec = ns.type ? E.classifyAs(cards, ns.type) : E.classify(cards);
      if (!spec){ s.log.push(logEntry('Reshape would create an invalid spell.','warn')); return s; }
      built.push({ id: E.uid('sp'), cards, spec });
    }
    if (usedIds.size !== freed.length){
      s.log.push(logEntry('Reshape must reuse every freed component.','warn'));
      return s;
    }

    // Enchantment capacity net change across broken (old) vs rebuilt (new) enchantments.
    const oldEnch = broken.reduce((a,sp)=> a + (sp.spec.type==='ench' ? enchGrant(sp.cards.length) : 0), 0);
    const newEnch = built.reduce((a,sp)=> a + (sp.spec.type==='ench' ? enchGrant(sp.cards.length) : 0), 0);
    const net  = newEnch - oldEnch;
    const loss = net < 0 ? -net : 0;
    // Immediate losses are gated (must afford per-spell action cost AND the loss).
    if (loss > 0 && !canAffordLoss(s, player, loss, brokenIds.length)){
      s.log.push(logEntry('Not enough available capacity to absorb the Enchantment loss — reshape blocked.','warn'));
      return s;
    }

    // ── Commit (no early return past this point) ──
    player.spellbook = player.spellbook.filter(sp => !brokenIds.includes(sp.id));
    built.forEach(sp => player.spellbook.push(sp));
    if (loss > 0) player.counters = Math.max(1, player.counters - loss);
    if (net  > 0) player.pendingCapacity += net; // gains deferred to next turn (F3)
    s.learningCountersUsed += brokenIds.length;
    const note = loss > 0 ? ` (−${loss} capacity)` : (net > 0 ? ` (+${net} capacity next turn)` : '');
    s.log.push(logEntry(`${player.name} reshapes ${brokenIds.length} spell${brokenIds.length>1?'s':''} into ${built.length}${note}.`, 'learn'));
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
    // F3 (v3.1): deferred Enchantment capacity gains become usable at the START of
    // the incoming player's turn. Applied before the drought/normal split so it
    // covers both branches; safe on the very first turns (pendingCapacity starts 0).
    const incoming = s.players[s.currentPlayer];
    if (incoming.pendingCapacity){
      incoming.counters += incoming.pendingCapacity;
      s.log.push(logEntry(`${incoming.name}'s new Enchantment capacity settles in — capacity is now ${incoming.counters}.`, 'learn'));
      incoming.pendingCapacity = 0;
    }
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
    if (c.suit === 'wild') return 'Wild';
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
