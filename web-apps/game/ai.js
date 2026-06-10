/* =========================================================================
 * Archmage Ascension — heuristic AI
 * AI.nextAction(state) returns the single next engine action for the
 * current (AI) player. The UI / sim harness dispatches it and asks again.
 * ========================================================================= */
(function (global) {
  'use strict';
  const E = global.Archmage || (typeof require === 'function' ? require('./engine.js') : null);
  if (!E) throw new Error('engine.js must load before ai.js');

  /* How much a card matters to the rest of the hand: shared suit, nearby
   * values (run potential) and matching values (enchantment potential). */
  function synergy(hand, card) {
    if (E.isWild(card)) return 10; // never throw wilds away
    let s = 0;
    for (const o of hand) {
      if (o.id === card.id || E.isWild(o)) continue;
      if (o.suit === card.suit) s += 1;
      if (o.value === card.value) s += 1.4;
      else {
        const d = Math.abs(o.value - card.value);
        if (d === 1) s += 0.9;
        else if (d === 2) s += 0.4;
      }
    }
    return s;
  }
  function sortedBySynergy(hand) {
    return hand.slice().sort((a, b) => synergy(hand, a) - synergy(hand, b));
  }
  function junkCards(hand, n, excludeIds) {
    const ex = excludeIds || new Set();
    return sortedBySynergy(hand).filter(c => !ex.has(c.id)).slice(0, n);
  }

  /* ---------- learning candidates ---------- */
  function wildsIn(cards) { return cards.filter(E.isWild); }
  function realIn(cards) { return cards.filter(c => !E.isWild(c)); }

  function enchCandidates(hand, maxValue) {
    const out = [];
    const wilds = wildsIn(hand);
    const byValue = {};
    for (const c of realIn(hand)) (byValue[c.value] = byValue[c.value] || []).push(c);
    for (const v of Object.keys(byValue)) {
      const grp = byValue[v];
      const suits = new Set(grp.map(c => c.suit));
      if (suits.size !== grp.length) continue;
      for (let w = 0; w <= wilds.length; w++) {
        const size = grp.length + w;
        if (size < 3 || size > 4) continue;
        out.push({ cards: grp.concat(wilds.slice(0, w)), type: 'enchantment', wildsUsed: w });
      }
    }
    return out;
  }

  function conjCandidates(hand) {
    const out = [];
    const bySuit = {};
    for (const c of realIn(hand)) (bySuit[c.suit] = bySuit[c.suit] || []).push(c);
    for (const s of Object.keys(bySuit)) {
      if (bySuit[s].length >= 3) out.push({ cards: bySuit[s].slice(), type: 'conjuration', wildsUsed: 0 });
    }
    return out;
  }

  // Best run of consecutive values from `cards` (one card per value),
  // letting up to `wilds.length` wilds plug gaps. Returns a card list or null.
  function bestRun(cards, wilds, maxValue) {
    const byValue = {};
    for (const c of cards) if (!byValue[c.value]) byValue[c.value] = c;
    let best = null;
    for (let lo = 1; lo <= maxValue; lo++) {
      const picked = [];
      let gaps = 0;
      for (let v = lo; v <= maxValue; v++) {
        if (byValue[v]) picked.push(byValue[v]);
        else if (gaps < wilds.length) { gaps++; picked.push(null); }
        else break;
        // trim trailing wild slots; runs should start/end on real cards
        const trimmed = picked.slice();
        while (trimmed.length && trimmed[0] === null) trimmed.shift();
        while (trimmed.length && trimmed[trimmed.length - 1] === null) trimmed.pop();
        const realCount = trimmed.filter(Boolean).length;
        const size = trimmed.length;
        if (realCount >= 2 && size >= 3) {
          if (!best || size > best.size) {
            const used = trimmed.length - realCount;
            best = { size, cards: trimmed.filter(Boolean).concat(wilds.slice(0, used)), wildsUsed: used };
          }
        }
      }
    }
    return best;
  }

  function runCandidates(hand, maxValue) {
    const out = [];
    const wilds = wildsIn(hand);
    const real = realIn(hand);
    // Perfect Transmutation: per-suit runs
    const bySuit = {};
    for (const c of real) (bySuit[c.suit] = bySuit[c.suit] || []).push(c);
    for (const s of Object.keys(bySuit)) {
      const r = bestRun(bySuit[s], wilds, maxValue);
      if (r) out.push({ cards: r.cards, type: 'perfect', wildsUsed: r.wildsUsed });
    }
    // Transfiguration: cross-suit run — prefer cards from suits we hold least of
    const suitCount = {};
    for (const c of real) suitCount[c.suit] = (suitCount[c.suit] || 0) + 1;
    const pool = real.slice().sort((a, b) => suitCount[a.suit] - suitCount[b.suit]);
    const r = bestRun(pool, wilds, maxValue);
    if (r) out.push({ cards: r.cards, type: 'transfiguration', wildsUsed: r.wildsUsed });
    return out;
  }

  function scoreCandidate(state, cand) {
    const opts = E.validTypes(cand.cards, state.maxValue);
    const pick = opts.find(o => o.type === cand.type);
    if (!pick) return -1;
    let score = pick.points + cand.cards.length * 0.1 - cand.wildsUsed * 2.5;
    if (cand.type === 'enchantment') {
      // capacity is an engine: worth more while the game is long
      const lateness = state.drought ? 1 : Math.max(0.3, state.source.length / 40);
      score += cand.cards.length >= 4 ? 18 : 7 * lateness;
    } else if (pick.points < 6 && !state.drought && state.source.length > 20) {
      score -= 2; // hold small patterns early; they may grow in hand
    }
    return score;
  }

  function learnAction(state, p) {
    const free = p.hand.filter(c => p.locked.indexOf(c.id) < 0);
    const cands = []
      .concat(enchCandidates(free, state.maxValue))
      .concat(conjCandidates(free))
      .concat(runCandidates(free, state.maxValue));
    let best = null, bestScore = 2.5; // demand a minimum payoff to act
    for (const c of cands) {
      const s = scoreCandidate(state, c);
      if (s > bestScore) { bestScore = s; best = c; }
    }
    if (!best) return null;
    return {
      score: bestScore,
      action: { kind: 'learn', cardIds: best.cards.map(c => c.id), type: best.type }
    };
  }

  function empowerAction(state, p) {
    const free = p.hand.filter(c => p.locked.indexOf(c.id) < 0);
    let best = null, bestScore = 0.5;
    for (const spell of p.spellbook) {
      const base = E.spellPoints(spell.type, spell.cards.length);
      // greedily accumulate compatible cards (cheap cards first, wilds last)
      const order = free.slice().sort((a, b) =>
        (E.isWild(a) ? 1 : 0) - (E.isWild(b) ? 1 : 0) || synergy(free, a) - synergy(free, b));
      let cur = spell.cards.slice();
      const adds = [];
      let wildsUsed = 0;
      for (const c of order) {
        const trial = cur.concat([c]);
        const opts = E.validTypes(trial, state.maxValue);
        if (opts.find(o => o.type === spell.type)) {
          cur = trial; adds.push(c);
          if (E.isWild(c)) wildsUsed++;
        }
      }
      if (!adds.length) continue;
      let gain = E.spellPoints(spell.type, cur.length) - base - wildsUsed * 2.5;
      if (spell.type === 'enchantment' && cur.length >= 4) gain += 18; // unlimited!
      if (gain > bestScore) {
        bestScore = gain;
        best = { kind: 'empower', spellId: spell.id, cardIds: adds.map(c => c.id), type: spell.type };
      }
    }
    return best ? { score: bestScore, action: best } : null;
  }

  /* ---------- phase decisions ---------- */
  function chooseBind(state, p) {
    const c = sortedBySynergy(p.hand)[0];
    return { kind: 'bind', cardId: c.id };
  }

  function chooseCollection(state, p) {
    if (state.drought) return { kind: 'collectSource' };
    let best = null, bestGain = 1.9;
    for (const c of state.array) {
      const g = synergy(p.hand.concat([c]), c);
      if (g > bestGain) { bestGain = g; best = c; }
    }
    return best ? { kind: 'collectArray', cardId: best.id } : { kind: 'collectSource' };
  }

  function bestArrayTake(state, p) {
    let best = state.array[0], bestGain = -1;
    for (const c of state.array) {
      const g = synergy(p.hand.concat([c]), c);
      if (g > bestGain) { bestGain = g; best = c; }
    }
    return best;
  }

  function chooseCast(state, p) {
    if (state.pending) {
      const discards = junkCards(p.hand, state.pending.need).map(c => c.id);
      const take = bestArrayTake(state, p);
      return { kind: 'resolveExchange', discardIds: discards, arrayCardId: take && take.id };
    }
    const order = { conjuration: 0, perfect: 1, transfiguration: 2 };
    const castable = p.spellbook
      .filter(s => E.castInfo(state, s).castable)
      .sort((a, b) => order[a.type] - order[b.type] || b.cards.length - a.cards.length);
    for (const s of castable) {
      if (s.type === 'conjuration') return { kind: 'cast', spellId: s.id };
      // exchanges burn hand cards — only worth it with genuine junk to shed
      const junk = sortedBySynergy(p.hand).filter(c => synergy(p.hand, c) < 1.5);
      const need = E.exchangeNeed(s.cards.length);
      if (s.type === 'perfect' && p.hand.length + 1 >= need && junk.length + 1 >= need) {
        return { kind: 'cast', spellId: s.id };
      }
      if (s.type === 'transfiguration' && junk.length >= need) {
        const take = bestArrayTake(state, p);
        const gain = take ? synergy(p.hand.concat([take]), take) : 0;
        if (gain >= 1.5 || need === 1) return { kind: 'cast', spellId: s.id };
      }
    }
    return { kind: 'finishCasting' };
  }

  function chooseLearning(state, p) {
    const cap = E.capacity(p);
    if (state.turn.learnUsed >= cap) return { kind: 'endTurn' };
    const a = learnAction(state, p);
    const b = empowerAction(state, p);
    let pick = null;
    if (a && (!b || a.score >= b.score)) pick = a; else if (b) pick = b;
    return pick ? pick.action : { kind: 'endTurn' };
  }

  const AI = {
    nextAction(state) {
      const p = state.players[state.current];
      switch (state.phase) {
        case 'binding': return chooseBind(state, p);
        case 'collection': return chooseCollection(state, p);
        case 'casting': return chooseCast(state, p);
        case 'learning': return chooseLearning(state, p);
        default: return null;
      }
    },
    _internals: { synergy, bestRun, learnAction, empowerAction } // for tests
  };

  global.ArchmageAI = AI;
  if (typeof module !== 'undefined' && module.exports) module.exports = AI;
})(typeof window !== 'undefined' ? window : globalThis);
