// SHARED HAND CHECKER — the one implementation (replaces the two inline copies in
// web-apps/archmage-reference.html and web-apps/player-reference/player-reference.html).
//
// Pure logic: no DOM, no strings, no rule numbers. Everything rule-shaped arrives in the
// `deck` profile (data/current.js → deckProfile()) and the `points` function, so a rules
// change is a data change. Runs unchanged in the browser and in node (tests).
//
// A card is { e: <energy key> | 'wild', v: <integer> | null }.
// A deck profile is { energies[], minValue, maxValue, wilds, minSpellSize, maxSpellSize,
// enchantmentMax, unique }.
//
// Detection contract (kept from the tested original so the golden master still applies):
// for the cards given, report the LARGEST spell of each shape —
//   one Conjuration per energy held, one Enchantment per value held,
//   the single longest Transfiguration, the single longest Perfect Transmutation —
// sorted by Recognition Points, highest first (ties keep detection order).
//
// What canon changed since that original, all driven by the deck profile:
//   • values run 1–15 (the old keypad allowed 1–20);
//   • no spell may exceed maxSpellSize (15);
//   • Echo exists only in the 5–6 player deck, where Enchantments may reach 5;
//   • every wild in a result carries a legal declaration (`as`: energy + value) using
//     only energies present in the deck.

export const WILD = 'wild';
const isWild = (card) => card.e === WILD;

/** Problems that make a hand impossible with this deck. Empty array = the hand is legal. */
export function validateHand(hand, deck) {
  const issues = [];
  const seen = new Set();
  let wilds = 0;
  hand.forEach((card, index) => {
    if (isWild(card)) {
      wilds += 1;
      if (wilds > deck.wilds) issues.push({ code: 'too-many-wilds', index });
      return;
    }
    if (!deck.energies.includes(card.e)) {
      issues.push({ code: 'energy-not-in-deck', index, card });
      return;
    }
    if (!Number.isInteger(card.v) || card.v < deck.minValue || card.v > deck.maxValue) {
      issues.push({ code: 'value-out-of-range', index, card });
      return;
    }
    const id = card.e + ':' + card.v;
    if (deck.unique && seen.has(id)) issues.push({ code: 'duplicate-card', index, card });
    seen.add(id);
  });
  return issues;
}

/** Can this card be added to the hand without breaking the deck? Used by the entry pad. */
export function canAdd(hand, card, deck) {
  return validateHand(hand.concat([card]), deck).length === 0;
}

const declared = (wildCard, e, v) => ({ e: WILD, v: null, as: { e, v }, ref: wildCard });

// Longest consecutive-value run covered by `realCards`, with wilds filling gaps or
// extending the ends. Needs at least one real card. Lowest-starting longest run wins.
function bestRun(realCards, wilds, deck, energyForWild) {
  if (!realCards.length) return null;
  const byValue = new Map();
  for (const card of realCards) if (!byValue.has(card.v)) byValue.set(card.v, card);
  let best = null;
  for (let lo = deck.minValue; lo <= deck.maxValue; lo++) {
    for (let hi = lo; hi <= deck.maxValue; hi++) {
      const size = hi - lo + 1;
      if (size > deck.maxSpellSize) break;
      let gaps = 0;
      let real = 0;
      for (let v = lo; v <= hi; v++) byValue.has(v) ? real++ : gaps++;
      if (gaps > wilds.length || real < 1) continue;
      if (!best || size > best.size) best = { size, lo, hi };
    }
  }
  if (!best) return null;
  const uses = [];
  let w = 0;
  for (let v = best.lo; v <= best.hi; v++) {
    if (byValue.has(v)) uses.push(byValue.get(v));
    else uses.push(declared(wilds[w++], energyForWild(v), v));
  }
  return { size: best.size, uses };
}

/**
 * Every spell these cards can form (largest of each shape).
 * @param hand   cards
 * @param deck   deck profile
 * @param points (kind, size) => Recognition Points | null
 * @returns [{ kind, size, uses, rp }] — `uses` holds the hand's own card objects; wilds
 *          are { e:'wild', v:null, as:{ e, v } }.
 */
export function findSpells(hand, deck, points) {
  const wilds = hand.filter(isWild);
  const reals = hand.filter((c) => !isWild(c));
  const held = new Set(reals.map((c) => c.e + ':' + c.v));
  const rp = (kind, size) => {
    const value = points(kind, size);
    return value == null ? 0 : value;
  };
  const results = [];
  const push = (kind, size, uses) => results.push({ kind, size, uses, rp: rp(kind, size) });

  // Conjuration — one energy's cards plus wilds.
  for (const key of deck.energies) {
    const own = reals.filter((c) => c.e === key);
    if (!own.length) continue;
    const size = Math.min(own.length + wilds.length, deck.maxSpellSize);
    if (size < deck.minSpellSize) continue;
    const taken = new Set(own.map((c) => c.v));
    const uses = own.slice(0, size);
    for (let i = 0, v = deck.minValue; uses.length < size; i++) {
      while (taken.has(v) && v <= deck.maxValue) v++;
      uses.push(declared(wilds[i], key, v <= deck.maxValue ? v : null));
      taken.add(v);
    }
    push('conjuration', size, uses);
  }

  // Enchantment — one value across energies plus wilds; never larger than the deck allows.
  const values = [];
  for (const c of reals) if (!values.includes(c.v)) values.push(c.v);
  for (const v of values) {
    const own = reals.filter((c) => c.v === v);
    const size = Math.min(own.length + wilds.length, deck.enchantmentMax);
    if (size < deck.minSpellSize) continue;
    const uses = own.slice(0, size);
    const free = deck.energies.filter((e) => !own.some((c) => c.e === e));
    for (let i = 0; uses.length < size; i++) uses.push(declared(wilds[i], free[i] ?? null, v));
    push('enchantment', size, uses);
  }

  // Transfiguration — the longest value run across any energies.
  const anyEnergy = (v) => deck.energies.find((e) => !held.has(e + ':' + v)) ?? deck.energies[0];
  const run = bestRun(reals, wilds, deck, anyEnergy);
  if (run && run.size >= deck.minSpellSize) push('transfiguration', run.size, run.uses);

  // Perfect Transmutation — the longest value run within one energy.
  let perfect = null;
  for (const key of deck.energies) {
    const candidate = bestRun(reals.filter((c) => c.e === key), wilds, deck, () => key);
    if (candidate && candidate.size >= deck.minSpellSize && (!perfect || candidate.size > perfect.size)) perfect = candidate;
  }
  if (perfect) push('perfect', perfect.size, perfect.uses);

  // Stable sort: highest Recognition Points first, detection order on ties.
  return results
    .map((r, i) => ({ r, i }))
    .sort((a, b) => b.r.rp - a.r.rp || a.i - b.i)
    .map((x) => x.r);
}

/** The result that uses every card entered, if the whole hand is exactly one spell. */
export function wholeHandSpell(hand, results) {
  if (hand.length === 0) return null;
  return results.find((r) => r.size === hand.length) || null;
}

/** Group results by spell type, in the order given (for display). */
export function groupByKind(results, order) {
  return order.map((kind) => ({ kind, spells: results.filter((r) => r.kind === kind) })).filter((g) => g.spells.length);
}
