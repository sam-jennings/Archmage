// Property 2: Detected spells are valid and correctly scored.
// Validates: Requirements 1.4
//
// Runs hcFindSpells over generated hands (biased toward same-energy sets,
// same-value sets, and consecutive runs with/without wilds). For every spell
// returned, asserts that (a) the result satisfies its spell-type rule given
// the hand's components with wilds substituting for any energy/value, and
// (b) its `rp` equals the Recognition-Points-table value for its kind/size.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';

import { loadHandChecker } from './extract.mjs';
import { genBiasedHand } from './generators.mjs';

const widget = loadHandChecker();
const { hc, hcFindSpells, RP } = widget;

const KNOWN_KINDS = new Set(['conjuration', 'transfiguration', 'enchantment', 'perfect']);

/** Independent RP-table lookup (the property's source of truth). */
function expectedRp(kind, size) {
  const table = RP[kind];
  return table[Math.min(size, 15)] || 0;
}

/** Multiset key for a component. */
function keyOf(card) {
  return card.e === 'wild' ? 'wild' : card.e + '|' + card.v;
}

/** Count of wilds in a hand. */
function wildCount(hand) {
  return hand.filter((c) => c.e === 'wild').length;
}

/** Assert `uses` is a sub-multiset of `hand` (results never invent cards). */
function assertUsesSubsetOfHand(uses, hand) {
  const counts = new Map();
  for (const c of hand) {
    const k = keyOf(c);
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  for (const u of uses) {
    const k = keyOf(u);
    const remaining = counts.get(k) || 0;
    assert.ok(remaining > 0, `use ${JSON.stringify(u)} is not available in the hand`);
    counts.set(k, remaining - 1);
  }
}

function realUsesOf(uses) {
  return uses.filter((c) => c.e !== 'wild');
}
function wildUsesOf(uses) {
  return uses.filter((c) => c.e === 'wild');
}

function assertConsecutiveRun(spell, hand, { singleEnergy }) {
  const { size, uses } = spell;
  const reals = realUsesOf(uses);
  const wilds = wildUsesOf(uses);
  assert.ok(reals.length >= 1, `${spell.kind} must use at least one real card`);
  if (singleEnergy) {
    const energy = reals[0].e;
    assert.ok(reals.every((c) => c.e === energy), 'perfect run must be one energy');
  }
  const values = reals.map((c) => c.v);
  const distinct = new Set(values);
  assert.equal(distinct.size, values.length, 'run real values must be distinct');
  const span = Math.max(...values) - Math.min(...values);
  assert.ok(span <= size - 1, `run values must fit within a window of ${size}`);
  assert.equal(wilds.length, size - reals.length, 'wilds must fill remaining run slots');
  assert.ok(wilds.length <= wildCount(hand), 'run cannot use more wilds than held');
}

/** Validate a single spell result against the hand. */
function assertValidSpell(spell, hand) {
  assert.ok(KNOWN_KINDS.has(spell.kind), `unknown spell kind: ${spell.kind}`);
  assert.equal(spell.uses.length, spell.size, 'size must equal number of components used');
  assert.ok(spell.size >= 3, 'every spell needs at least 3 components');
  assertUsesSubsetOfHand(spell.uses, hand);

  // RP correctness — must equal the RP-table value for kind/size.
  assert.equal(spell.rp, expectedRp(spell.kind, spell.size), `wrong RP for ${spell.kind} size ${spell.size}`);

  const wilds = wildUsesOf(spell.uses);

  switch (spell.kind) {
    case 'conjuration': {
      // >= 3 same-energy incl. wilds, with >= 1 real card of that energy.
      const reals = realUsesOf(spell.uses);
      assert.ok(reals.length >= 1, 'conjuration needs >= 1 real card');
      const energy = reals[0].e;
      assert.ok(reals.every((c) => c.e === energy), 'conjuration reals must share one energy');
      assert.ok(wilds.length <= wildCount(hand), 'conjuration cannot use more wilds than held');
      break;
    }
    case 'enchantment': {
      // 3..4 same-value incl. wilds.
      assert.ok(spell.size >= 3 && spell.size <= 4, 'enchantment size must be 3 or 4');
      const reals = realUsesOf(spell.uses);
      assert.ok(reals.length >= 1, 'enchantment needs >= 1 real card');
      const value = reals[0].v;
      assert.ok(reals.every((c) => c.v === value), 'enchantment reals must share one value');
      assert.ok(wilds.length <= wildCount(hand), 'enchantment cannot use more wilds than held');
      break;
    }
    case 'transfiguration':
      assertConsecutiveRun(spell, hand, { singleEnergy: false });
      break;
    case 'perfect':
      assertConsecutiveRun(spell, hand, { singleEnergy: true });
      break;
    default:
      assert.fail(`unhandled kind ${spell.kind}`);
  }
}

test('Property 2: detected spells are valid and correctly scored', () => {
  fc.assert(
    fc.property(genBiasedHand, (hand) => {
      // Drive the widget through its real state object, then detect.
      hc.hand = hand.map((c) => ({ ...c }));
      const spells = hcFindSpells();
      for (const spell of spells) {
        assertValidSpell(spell, hc.hand);
      }
    }),
    { numRuns: 300 },
  );
});
