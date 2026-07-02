// Property test for the Hand Checker "add (component selection)" behavior.
//
// Design property (design.md → Correctness Properties):
//   Property 1: Selecting a component appends it to the hand
//   For any prior hand state and any component {e, v} produced by choosing an
//   energy (including wild) and a value, invoking the add operation results in
//   a hand whose length increased by exactly one and whose final element equals
//   that component, leaving all prior components unchanged.
//
// **Validates: Requirements 1.3**

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';

import { loadHandChecker } from './handCheckerHarness.js';

const ENERGY_KEYS = ['radiance', 'void', 'flux', 'aether'];

// A generated component mirrors what the widget's entry keypad can produce:
// a real energy with a value in 1..20, or a wild with a null value.
const genComponent = fc.oneof(
  fc.record({
    e: fc.constantFrom(...ENERGY_KEYS),
    v: fc.integer({ min: 1, max: 20 }),
  }),
  fc.constant({ e: 'wild', v: null }),
);

// A prior hand is any sequence of 0..12 components.
const genHand = fc.array(genComponent, { minLength: 0, maxLength: 12 });

test('Property 1: selecting a component appends it to the hand', () => {
  fc.assert(
    fc.property(genHand, genComponent, (priorHand, component) => {
      const hcw = loadHandChecker();

      // Seed the widget with the generated prior hand (deep copies so we retain
      // an independent snapshot to compare against afterwards).
      hcw.hc.hand = priorHand.map((c) => ({ ...c }));
      const priorSnapshot = priorHand.map((c) => ({ ...c }));
      const priorLength = priorSnapshot.length;

      // Invoke the real add operation with the chosen component.
      hcw.hcAdd(component);

      const hand = hcw.hc.hand;

      // Length increased by exactly one.
      assert.equal(hand.length, priorLength + 1, 'hand length should grow by exactly one');

      // Final element equals the added component.
      assert.deepEqual(hand[hand.length - 1], component, 'final element should equal the added component');

      // All prior components are unchanged (same values, same order).
      for (let i = 0; i < priorLength; i++) {
        assert.deepEqual(hand[i], priorSnapshot[i], `prior component at index ${i} should be unchanged`);
      }
    }),
    { numRuns: 200 },
  );
});
