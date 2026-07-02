// Shared fast-check generators for Hand Checker property tests.
// Mirrors design.md's "Generators" section: a base genCard/genHand plus
// biased generators that stress each spell type (same-energy sets, same-value
// sets, and consecutive-value runs with and without wilds).
import fc from 'fast-check';

export const REAL_ENERGIES = ['radiance', 'void', 'flux', 'aether'];
export const VALUE_MIN = 1;
export const VALUE_MAX = 20;

const genValue = fc.integer({ min: VALUE_MIN, max: VALUE_MAX });
const genRealEnergy = fc.constantFrom(...REAL_ENERGIES);

/** A wild component: { e: 'wild', v: null }. */
export const genWild = fc.constant({ e: 'wild', v: null });

/** A real component: an energy in 1..20. */
export const genRealCard = fc.record({ e: genRealEnergy, v: genValue });

/** genCard: energy in {real..., wild}; value 1..20 for real, null for wild. */
export const genCard = fc.oneof(
  { weight: 4, arbitrary: genRealCard },
  { weight: 1, arbitrary: genWild },
);

/** genHand: 0..12 arbitrary cards. */
export const genHand = fc.array(genCard, { minLength: 0, maxLength: 12 });

/** Same-energy set: several cards of one energy, plus a few wilds. Biases
 *  toward Conjuration (>= 3 same-energy incl. wilds with >= 1 real). */
export const genSameEnergyHand = fc.record({
  energy: genRealEnergy,
  reals: fc.array(genValue, { minLength: 1, maxLength: 6 }),
  wilds: fc.integer({ min: 0, max: 3 }),
}).map(({ energy, reals, wilds }) => {
  const hand = reals.map((v) => ({ e: energy, v }));
  for (let i = 0; i < wilds; i++) hand.push({ e: 'wild', v: null });
  return hand;
});

/** Same-value set: several cards sharing one value across energies, plus a few
 *  wilds. Biases toward Enchantment (3..4 same-value incl. wilds). */
export const genSameValueHand = fc.record({
  value: genValue,
  reals: fc.array(genRealEnergy, { minLength: 1, maxLength: 5 }),
  wilds: fc.integer({ min: 0, max: 3 }),
}).map(({ value, reals, wilds }) => {
  const hand = reals.map((e) => ({ e, v: value }));
  for (let i = 0; i < wilds; i++) hand.push({ e: 'wild', v: null });
  return hand;
});

/** Consecutive run (with/without wilds), possibly with interior gaps that
 *  wilds can fill. Biases toward Transfiguration / Perfect Transmutation. */
export const genRunHand = fc.record({
  start: fc.integer({ min: VALUE_MIN, max: VALUE_MAX - 2 }),
  length: fc.integer({ min: 3, max: 8 }),
  energy: genRealEnergy,
  singleEnergy: fc.boolean(),
  dropMask: fc.array(fc.boolean(), { minLength: 8, maxLength: 8 }),
  wilds: fc.integer({ min: 0, max: 3 }),
}).map(({ start, length, energy, singleEnergy, dropMask, wilds }) => {
  const hand = [];
  for (let i = 0; i < length; i++) {
    const v = start + i;
    if (v > VALUE_MAX) break;
    if (dropMask[i]) continue; // leave a gap for a wild to fill
    const e = singleEnergy ? energy : REAL_ENERGIES[i % REAL_ENERGIES.length];
    hand.push({ e, v });
  }
  for (let i = 0; i < wilds; i++) hand.push({ e: 'wild', v: null });
  return hand;
});

/** The biased union used by the detection property: heavy on structured hands
 *  that actually form spells, with some fully-random hands mixed in. */
export const genBiasedHand = fc.oneof(
  { weight: 3, arbitrary: genSameEnergyHand },
  { weight: 3, arbitrary: genSameValueHand },
  { weight: 3, arbitrary: genRunHand },
  { weight: 1, arbitrary: genHand },
);
