// ════════════════════════════════════════════════════════════════
// Archmage Ascension — Greedy AI
// Heuristic decision-maker for the Archon. Plays each phase greedily.
// Returns a list of action objects to dispatch in sequence.
// ════════════════════════════════════════════════════════════════
(function(){
  'use strict';
  const E = window.AAEngine;
  const S = window.AAState;

  // Greedy: at each phase, pick the action with highest immediate value.

  // Score what an Array card would add to our hand for finding spells.
  function arrayPickValue(state, player, card){
    const hypoHand = player.hand.concat([card]);
    const best = E.findBestLearnable(hypoHand);
    return best ? E.spellScore(best.spec) : 0;
  }

  function chooseCollection(state){
    const player = state.players[state.currentPlayer];
    if (state.drought) return null; // auto
    // Compare best of: (a) draw from source (estimated 0 — unknown card), or (b) take best array card
    let bestIdx = -1, bestVal = 0;
    state.array.forEach((c, i) => {
      if (!c) return;
      const v = arrayPickValue(state, player, c);
      if (v > bestVal){ bestVal = v; bestIdx = i; }
    });
    // Heuristic: also compare against current best (without picking)
    const currentBest = E.findBestLearnable(player.hand);
    const currentScore = currentBest ? E.spellScore(currentBest.spec) : 0;
    if (bestVal > currentScore + 1 /*minor threshold*/ && bestIdx >= 0){
      return { type:'COLLECT_ARRAY', index: bestIdx };
    }
    return { type:'COLLECT_SOURCE' };
  }

  // Plan casting: cast every uncast spell up to capacity. Skip enchantments.
  function planCasting(state){
    const player = state.players[state.currentPlayer];
    const cap = player.unlimited ? Infinity : player.counters;
    const available = player.spellbook.filter(sp =>
      sp.spec.type !== 'ench' && !state.castSpellsThisTurn.includes(sp.id)
    );
    // Order: perf > conj (more cards = more draw) > trans (last because it discards)
    available.sort((a,b)=>{
      const order = { perf:0, conj:1, trans:2 };
      if (order[a.spec.type] !== order[b.spec.type]) return order[a.spec.type] - order[b.spec.type];
      return b.cards.length - a.cards.length;
    });
    const remaining = cap - state.castSpellsThisTurn.length;
    return available.slice(0, remaining).map(sp => ({ type:'CAST_SPELL', spellId: sp.id }));
  }

  // For a transfig exchange: pick lowest-value cards to discard, pick highest-value array card.
  function planTransfigExchange(state){
    const t = state.pendingTransfig;
    if (!t) return null;
    const player = state.players.find(p=>p.id===t.playerId);
    const sortedHand = player.hand.slice().sort((a,b)=>{
      if (a.suit === 'wild') return 1; // never discard wild
      if (b.suit === 'wild') return -1;
      return a.value - b.value;
    });
    const discards = sortedHand.slice(0, t.discardCount).map(c=>c.id);
    // Pick array card that maximizes spellbook potential
    let bestIdx = -1, bestVal = -1;
    state.array.forEach((c,i)=>{
      if (!c) return;
      // simulate: hypo hand = player.hand minus discards plus c
      const remaining = player.hand.filter(cc => !discards.includes(cc.id));
      const hypo = remaining.concat([c]);
      const best = E.findBestLearnable(hypo);
      const v = best ? E.spellScore(best.spec) : 0;
      if (v > bestVal){ bestVal = v; bestIdx = i; }
    });
    return { discards, arrayIdx: bestIdx >= 0 ? bestIdx : state.array.findIndex(Boolean) };
  }

  // Plan learning: greedy — repeatedly try to LEARN the best new spell, EMPOWER existing
  // spells if it improves their score, or UNLEARN broken spells. Subject to capacity.
  function planLearning(state){
    const actions = [];
    let working = JSON.parse(JSON.stringify(state));
    let safety = 12;
    while (safety-- > 0){
      const player = working.players[working.currentPlayer];
      const used = working.learningCountersUsed;
      const cap = player.unlimited ? Infinity : player.counters;
      if (used >= cap) break;

      // Option 1: best learnable from hand
      const best = E.findBestLearnable(player.hand);
      const learnGain = best ? E.spellScore(best.spec) : 0;

      // Option 2: best empower of an existing spell
      let bestEmpower = null, bestEmpowerGain = 0;
      for (const sp of player.spellbook){
        // try adding 1-3 cards from hand
        const handIdxs = player.hand.map((_,i)=>i);
        for (let k=1; k<=Math.min(3, player.hand.length); k++){
          const combos = E.kCombos(handIdxs, k);
          for (const combo of combos){
            const adds = combo.map(i => player.hand[i]);
            const newCards = sp.cards.concat(adds);
            const spec = E.classify(newCards);
            if (!spec) continue;
            const oldScore = E.spellScore(sp.spec);
            const newScore = E.spellScore(spec);
            const gain = newScore - oldScore;
            if (gain > bestEmpowerGain){
              bestEmpowerGain = gain;
              bestEmpower = { spellId: sp.id, cards: adds.map(c=>c.id), gain };
            }
          }
        }
      }

      // Pick the best option
      if (best && learnGain >= bestEmpowerGain && learnGain > 0){
        const action = {
          type:'LEARN',
          cards: best.cards.map(c=>c.id)
        };
        actions.push(action);
        // simulate
        const ids = new Set(action.cards);
        const cards = player.hand.filter(c=>ids.has(c.id));
        player.hand = player.hand.filter(c=>!ids.has(c.id));
        const spec = E.classify(cards);
        player.spellbook.push({ id: 'sp'+Math.random(), cards, spec });
        if (spec.type === 'ench' && spec.length === 3) player.counters += 1;
        if (spec.type === 'ench' && spec.length === 4) player.unlimited = true;
        if (!player.unlimited) working.learningCountersUsed += 1;
      } else if (bestEmpower && bestEmpowerGain > 0){
        actions.push({ type:'EMPOWER', spellId: bestEmpower.spellId, cards: bestEmpower.cards });
        const sp = player.spellbook.find(x=>x.id===bestEmpower.spellId);
        const ids = new Set(bestEmpower.cards);
        const adds = player.hand.filter(c=>ids.has(c.id));
        player.hand = player.hand.filter(c=>!ids.has(c.id));
        sp.cards = sp.cards.concat(adds);
        sp.spec = E.classify(sp.cards);
        if (!player.unlimited) working.learningCountersUsed += 1;
      } else {
        break;
      }
    }
    actions.push({ type:'END_LEARNING' });
    return actions;
  }

  window.AAAi = { chooseCollection, planCasting, planTransfigExchange, planLearning };
})();
