// Property 3: Clearing empties the hand
//
// For any hand state, invoking the clear operation results in an empty hand
// and a results view containing no spell results.
//
// Validates: Requirements 1.5
//
// The clear operation under test is the production one: the wired-up
// "Clear all" (#hcClear) click listener, which sets hc.hand = [] and
// re-renders. We build an arbitrary hand via the widget's own hcAdd (exactly
// what the value keypad / wild button do), click Clear, then assert the hand
// is empty and the results view (#hcResults) holds no spell-result rows.

import test from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';

import { loadWidget } from './load-widget.mjs';
import { genHand } from './generators.mjs';

test('Property 3: clearing empties the hand and the results view', () => {
  fc.assert(
    fc.property(genHand, (hand) => {
      const w = loadWidget();

      // Build the generated hand through the real add path.
      hand.forEach((card) => w.hcAdd(card));

      // Sanity: the hand actually holds the generated components before clear.
      assert.equal(
        w.hc.hand.length,
        hand.length,
        'precondition: hand should contain the generated components',
      );

      // Invoke the production clear operation.
      w.clickClear();

      // The hand is empty.
      assert.equal(w.hc.hand.length, 0, 'hand should be empty after clear');

      // The results view contains no spell results.
      const results = w.resultsEl();
      const resultRows = results.querySelectorAll('.hc-result');
      assert.equal(
        resultRows.length,
        0,
        'results view should contain no spell-result rows after clear',
      );
      // With an empty hand (< 3 components) the results view is also hidden.
      assert.equal(results.hidden, true, 'results view should be hidden after clear');
    }),
    { numRuns: 200 },
  );
});
