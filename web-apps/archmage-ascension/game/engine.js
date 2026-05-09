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
  // Returns { type, length, declarations } or null. declarations is { wildId: {suit, value} }
  // Cards may include wilds (suit:'wild'). We try to assign suit/value to each wild
  // such that the set forms a valid spell. Prefers Perfect > Trans > Conj > Ench by score.

  function isWild(c){ return c.suit === 'wild'; }
  function realCards(cards){ return cards.filter(c => !isWild(c)); }
  function wildCards(cards){ return cards.filter(c => isWild(c)); }

  function validateConjuration(cards){
    if (cards.length < 3) return null;
    const real = realCards(cards);
    if (real.length === 0) return null; // can't be all wilds (no suit reference)
    const suit = real[0].suit;
    if (real.some(c => c.suit !== suit)) return null;
    const wilds = wildCards(cards);
    const decls = {};
    // assign each wild a unique value at this suit (use unused values 1..MAX)
    const usedV = new Set(real.map(c=>c.value));
    let v = 1;
    for (const w of wilds){
      while (usedV.has(v) && v<=MAX_VALUE) v++;
      if (v > MAX_VALUE) return null;
      decls[w.id] = { suit, value:v };
      usedV.add(v); v++;
    }
    return { type:'conj', length:cards.length, declarations:decls, suit };
  }

  function validateEnchantment(cards){
    if (cards.length < 3 || cards.length > 4) return null;
    const real = realCards(cards);
    if (real.length === 0) return null;
    const value = real[0].value;
    if (real.some(c => c.value !== value)) return null;
    // each real card must have a unique suit
    const usedSuits = new Set(real.map(c=>c.suit));
    if (usedSuits.size !== real.length) return null;
    const wilds = wildCards(cards);
    const decls = {};
    const remaining = SUITS.filter(s => !usedSuits.has(s));
    if (wilds.length > remaining.length) return null;
    wilds.forEach((w,i) => { decls[w.id] = { suit:remaining[i], value }; });
    return { type:'ench', length:cards.length, declarations:decls, value };
  }

  // For sequential spells: determine if assigning values to wilds yields consecutive run
  // real cards have fixed values, must have unique values. Wilds fill any missing.
  function validateSequence(cards, sameSuit){
    if (cards.length < 3) return null;
    const real = realCards(cards);
    const wilds = wildCards(cards);
    if (sameSuit){
      if (real.length === 0) return null;
      const suit = real[0].suit;
      if (real.some(c => c.suit !== suit)) return null;
    }
    // real values must be unique
    const realVals = real.map(c=>c.value).sort((a,b)=>a-b);
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
    const fillSuit = sameSuit ? real[0].suit : null;
    wilds.forEach((w,i)=>{
      decls[w.id] = {
        suit: fillSuit || real[0]?.suit || 'radiance', // for cross-suit, pick anything; engine doesn't care
        value: fill[i]
      };
    });
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
  function classify(cards){
    const candidates = [
      validateSequence(cards, true),  // perf
      validateSequence(cards, false), // trans
      validateConjuration(cards),
      validateEnchantment(cards)
    ].filter(Boolean);
    if (!candidates.length) return null;
    // pick highest score
    candidates.sort((a,b) => spellScore(b) - spellScore(a));
    return candidates[0];
  }

  function classifyAs(cards, type){
    if (type === 'perf')  return validateSequence(cards, true);
    if (type === 'trans') return validateSequence(cards, false);
    if (type === 'conj')  return validateConjuration(cards);
    if (type === 'ench')  return validateEnchantment(cards);
    return null;
  }

  // ── Scoring ──────────────────────────────────────────────
  // Recognition Points table (size 3..15)
  const SCORE = {
    conj:  [0,0,0, 3, 4, 6, 9,13,18,24,31,39,48,58,69,81],
    trans: [0,0,0, 5, 7,10,14,19,25,32,40,49,59,70,82,95],
    perf:  [0,0,0, 7,10,14,19,25,32,40,49,59,70,82,95,109],
    ench:  [0,0,0, 6,15] // only 3 or 4
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
    SUITS, MAX_VALUE,
    uid,
    makeDeck, shuffle,
    classify, classifyAs,
    validateConjuration, validateEnchantment, validateSequence,
    spellScore, SCORE,
    findBestLearnable, kCombos,
    isWild, realCards, wildCards,
  };
})();
