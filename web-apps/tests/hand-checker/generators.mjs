// Shared fast-check generators for Hand Checker property tests.
//
// A Card is { e: EnergyKey | 'wild', v: number | null } where v is null for
// wilds and an integer 1..20 for real energies (matching the widget's value
// keypad range). genHand yields 0..12 cards, and includes targeted biases
// toward same-energy sets, same-value sets, and consecutive value runs (with
// and without wilds) to stress each spell type and the run/gap logic, per the
// design's Testing Strategy.

import fc from 'fast-check';

export const ENERGY_KEYS = ['radiance', 'void', 'flux', 'aether'];

// A single real card (never wild): energy in the four currents, value 1..20.
export const genRealCard = fc.record({
  e: fc.constantFrom(...ENERGY_KEYS),
  v: fc.integer({ min: 1, max: 20 }),
});

// A wild card.
export const genWildCard = fc.constant({ e: 'wild', v: null });

// Any card: mostly real, occasionally wild.
export const genCard = fc.oneof(
  { weight: 4, arbitrary: genRealCard },
  { weight: 1, arbitrary: genWildCard },
);

// A plain hand of 0..12 arbitrary cards.
const genPlainHand = fc.array(genCard, { minLength: 0, maxLength: 12 });

// Bias: several cards sharing one energy (stresses Conjuration / Perfect).
const genSameEnergyHand = fc
  .tuple(
    fc.constantFrom(...ENERGY_KEYS),
    fc.array(fc.integer({ min: 1, max: 20 }), { minLength: 0, maxLength: 8 }),
    fc.nat({ max: 4 }),
  )
  .map(([e, values, wilds]) => [
    ...values.map((v) => ({ e, v })),
    ...Array.from({ length: wilds }, () => ({ e: 'wild', v: null })),
  ]);

// Bias: several cards sharing one value (stresses Enchantment).
const genSameValueHand = fc
  .tuple(
    fc.integer({ min: 1, max: 20 }),
    fc.array(fc.constantFrom(...ENERGY_KEYS), { minLength: 0, maxLength: 6 }),
    fc.nat({ max: 4 }),
  )
  .map(([v, energies, wilds]) => [
    ...energies.map((e) => ({ e, v })),
    ...Array.from({ length: wilds }, () => ({ e: 'wild', v: null })),
  ]);

// Bias: a consecutive value run, optionally punctured (gaps filled by wilds).
const genRunHand = fc
  .tuple(
    fc.integer({ min: 1, max: 16 }),
    fc.integer({ min: 3, max: 6 }),
    fc.constantFrom(...ENERGY_KEYS),
    fc.nat({ max: 3 }),
  )
  .map(([lo, len, e, wilds]) => {
    const cards = [];
    for (let i = 0; i < len && lo + i <= 20; i++) cards.push({ e, v: lo + i });
    for (let i = 0; i < wilds; i++) cards.push({ e: 'wild', v: null });
    return cards;
  });

// The union used by property tests: broad coverage plus targeted structure.
export const genHand = fc.oneof(
  { weight: 3, arbitrary: genPlainHand },
  { weight: 2, arbitrary: genSameEnergyHand },
  { weight: 2, arbitrary: genSameValueHand },
  { weight: 2, arbitrary: genRunHand },
);
