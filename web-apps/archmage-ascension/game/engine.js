// ════════════════════════════════════════════════════════════════
// Archmage Ascension — Game Engine (pure logic, no DOM)
// Build a deck, deal, validate spells, score, run AI heuristics.
// ════════════════════════════════════════════════════════════════
(function(){
  'use strict';

  const SUITS = ['radiance','void','flux','aether'];
  const MAX_VALUE = 15; // 2-player ruleset

  let _id = 0;
  const uid = (p) => (p||'x') + (++_id).toString(36);

  // ── Deck ──────────────────────────────────────────────────
  function makeDeck(){
    const cards = [];
    for (const suit of SUITS){
      for (let v=1; v<=MAX_VALUE; v++) cards.push({ id:uid('c'), suit, value:v });
    }
    cards.push({ id:uid('w'), suit:'wild', value:0 });
    cards.push({ id:uid('w'), suit:'wild', value:0 });
    return cards;
  }
  function shuffle(arr){
    const a = arr.slice();
    for (let i=a.length-1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  // ── Spell validation ──────────────────────────────────────
  // Returns { type, length, declarations } or null. declarations is { wildId: {value} }.
  // Flexible wilds (rulebook v3.2): a wild never declares an energy. In a sequence
  // (Transfiguration / Perfect Transmutation) it declares only a number, fixed while the
  // spell exists; in a Conjuration or Enchantment it declares nothing (it takes the
  // spell's energy or value), so those specs carry empty declarations.
  // classify() prefers the highest-scoring valid type.

  // Enchantment size cap: max 4 components at 2-4 players (5 at 5-6, not in this 2p build).
  const ENCH_MAX = 4;

  function isWild(c){ return c.suit === 'wild'; }
  function realCards(cards){ return cards.filter(c => !isWild(c)); }
  function wildCards(cards){ return cards.filter(c => isWild(c)); }

  function validateConjuration(cards){
    if (cards.length < 3) return null;
    const real = realCards(cards);
    if (real.length === 0) return null; // can't be all wilds (no suit reference)
    const suit = real[0].suit;
    if (real.some(c => c.suit !== suit)) return null;
    return { type:'conj', length:cards.length, declarations:{}, suit };
  }

  function validateEnchantment(cards){
    if (cards.length < 3 || cards.length > ENCH_MAX) return null;
    const real = realCards(cards);
    if (real.length === 0) return null;
    const value = real[0].value;
    if (real.some(c => c.value !== value)) return null;
    // each real card must have a unique suit; wilds take the value and need no energy
    const usedSuits = new Set(real.map(c=>c.suit));
    if (usedSuits.size !== real.length) return null;
    return { type:'ench', length:cards.length, declarations:{}, value };
  }

  // For sequential spells: determine if assigning values to wilds yields consecutive run.
  // Real cards have fixed values and must be unique. `fixed` ({wildId: value}, optional)
  // holds numbers wilds already declared (EMPOWER / partial UNLEARN keep them); those
  // wilds count as fixed values, and only the remaining wilds declare a number now.
  function validateSequence(cards, sameSuit, fixed){
    if (cards.length < 3) return null;
    const real = realCards(cards);
    const isFixed = (w) => !!fixed && fixed[w.id] != null;
    const fixedWilds = wildCards(cards).filter(isFixed);
    const wilds = wildCards(cards).filter(w => !isFixed(w));
    if (sameSuit){
      if (real.length === 0) return null;
      const suit = real[0].suit;
      if (real.some(c => c.suit !== suit)) return null;
    }
    // real (and already-declared wild) values must be unique
    const realVals = real.map(c=>c.value).concat(fixedWilds.map(w => fixed[w.id])).sort((a,b)=>a-b);
    if (new Set(realVals).size !== realVals.length) return null;
    // we need a consecutive run of length cards.length covering all realVals
    // Find a starting value V such that [V, V+1, ..., V+L-1] contains all realVals.
    const L = cards.length;
    const minR = realVals.length ? realVals[0] : 1;
    const maxR = realVals.length ? realVals[realVals.length-1] : MAX_VALUE;
    // V can range from max(1, maxR-L+1) to min(MAX_VALUE-L+1, minR)
    const lo = Math.max(1, maxR - L + 1);
    const hi = realVals.length ? Math.min(MAX_VALUE - L + 1, minR) : MAX_VALUE - L + 1;
    if (lo > hi) return null;
    // any V in [lo,hi] works. Pick lo.
    const V = lo;
    const realSet = new Set(realVals);
    const fill = [];
    for (let v=V; v<V+L; v++) if (!realSet.has(v)) fill.push(v);
    if (fill.length !== wilds.length) return null;
    const decls = {};
    fixedWilds.forEach(w => { decls[w.id] = { value: fixed[w.id] }; });
    wilds.forEach((w,i)=>{ decls[w.id] = { value: fill[i] }; });
    return {
      type: sameSuit ? 'perf' : 'trans',
      length: L,
      declarations: decls,
      suit: sameSuit ? real[0].suit : null,
      runStart: V,
      runEnd: V + L - 1
    };
  }

  // Best spell type for a set of cards. Prefers higher-scoring type.
  // `fixed` = wild numbers already declared by the spell these cards came from.
  function classify(cards, fixed){
    const candidates = [
      validateSequence(cards, true, fixed),  // perf
      validateSequence(cards, false, fixed), // trans
      validateConjuration(cards),
      validateEnchantment(cards)
    ].filter(Boolean);
    if (!candidates.length) return null;
    // pick highest score
    candidates.sort((a,b) => spellScore(b) - spellScore(a));
    return candidates[0];
  }

  function classifyAs(cards, type, fixed){
    if (type === 'perf')  return validateSequence(cards, true, fixed);
    if (type === 'trans') return validateSequence(cards, false, fixed);
    if (type === 'conj')  return validateConjuration(cards);
    if (type === 'ench')  return validateEnchantment(cards);
    return null;
  }

  // Wild numbers a spell has declared ({wildId: value}); only sequences declare any.
  function wildNumbers(spec){
    const out = {};
    if (!spec || (spec.type !== 'trans' && spec.type !== 'perf')) return out;
    for (const [id, d] of Object.entries(spec.declarations || {})) out[id] = d.value;
    return out;
  }

  // ── Scoring ──────────────────────────────────────────────
  // Recognition Points table (size 3..15)
  const SCORE = {
    conj:  [0,0,0, 0, 1, 2, 3, 7,13,20,29,38,50,63,79,100],
    trans: [0,0,0, 3, 4, 5, 7, 8,10,13,16,20,25,31,38,48],
    perf:  [0,0,0, 5,11,18,24,31,39,47,56,65,74,85,97,100],
    ench:  [0,0,0, 4,10,16] // sizes 3/4/5 (5 unreachable in the 4-suit 2p deck)
  };
  function spellScore(spec){
    if (!spec) return 0;
    const t = spec.type, n = spec.length;
    return (SCORE[t] && SCORE[t][n]) || 0;
  }

  // ── Greedy AI ────────────────────────────────────────────
  // Given a hand, find the best learnable spell (highest score). Returns {cards, spec} or null.
  function findBestLearnable(hand){
    let best = null, bestScore = 0;
    // Try all combinations of size 3..min(7,hand.length). For 7-card hand this is manageable.
    const idxs = hand.map((_,i)=>i);
    for (let size = Math.min(7, hand.length); size >= 3; size--){
      const combos = kCombos(idxs, size);
      for (const combo of combos){
        const cards = combo.map(i => hand[i]);
        const spec = classify(cards);
        if (!spec) continue;
        const s = spellScore(spec);
        if (s > bestScore){ bestScore = s; best = { cards, spec, indices: combo }; }
      }
      if (best && bestScore > 0 && size <= 4) break; // prefer largest first; bail once found small ones
    }
    return best;
  }
  function kCombos(arr, k){
    const out = [];
    function rec(start, picked){
      if (picked.length === k){ out.push(picked.slice()); return; }
      for (let i=start; i<arr.length; i++){
        picked.push(arr[i]);
        rec(i+1, picked);
        picked.pop();
      }
    }
    rec(0, []);
    return out;
  }

  // ── Public ───────────────────────────────────────────────
  window.AAEngine = {
    SUITS, MAX_VALUE, ENCH_MAX,
    uid,
    makeDeck, shuffle,
    classify, classifyAs, wildNumbers,
    validateConjuration, validateEnchantment, validateSequence,
    spellScore, SCORE,
    findBestLearnable, kCombos,
    isWild, realCards, wildCards,
  };
})();
