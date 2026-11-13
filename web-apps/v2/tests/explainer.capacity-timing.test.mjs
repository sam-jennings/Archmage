// Walks "When capacity changes" through the rulebook's worked example (a 4-component
// Enchantment of 8s) and checks gains, losses and the affordability gate against the data.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as X from '../learn/explainers/capacity-timing.js';
import { BASE_RULES as R, enchantmentMax } from '../data/current.js';

const play = (s, ...ids) => ids.reduce((state, id) => X.apply(state, id), s);
const grant = (size) => R.enchantmentLadder.find((r) => r.size === size).counters;
const cost = (key) => R.learning.find((a) => a.key === key).cost.counters;

test('the data says: gains next turn, losses immediately', () => {
  assert.equal(R.capacity.gain, 'next-turn');
  assert.equal(R.capacity.loss, 'immediate');
});

for (const group of R.players.groups) {
  test(`capacity-timing · ${group.id} players`, async (t) => {
    const S = group.startingCounters;
    const start = X.init(group.id);
    // Reach a 4-component Enchantment whose capacity has arrived.
    const four = play(start, 'learn', 'next', 'grow', 'next');

    await t.test('a gain does not arrive the turn it is learned', () => {
      const s = X.apply(start, 'learn');
      assert.equal(X.capacity(s), S);
      assert.equal(X.free(s), S - cost('learn'));
      assert.equal(X.capacity(X.apply(s, 'next')), S + grant(3));
    });

    await t.test('grants are totals for the size, not increments', () => {
      assert.equal(four.size, 4);
      assert.equal(X.capacity(four), S + grant(4));
    });

    await t.test('rulebook example: taking the 4 apart needs the action plus the whole loss', () => {
      const check = X.lossCheck(four, 0, 'unlearn');
      assert.equal(check.need, cost('unlearn') + grant(4));
      assert.equal(check.allowed, X.free(four) >= check.need);
      const done = X.apply(four, 'apart');
      if (check.allowed) {
        assert.equal(done.size, 0);
        assert.equal(X.capacity(done), S);
        assert.equal(X.free(done), S + grant(4) - check.need);
      }
    });

    await t.test('the gate: spend actions first and the same move is blocked, state unchanged', () => {
      let s = four;
      while (X.free(s) >= cost('unlearn') + grant(4)) s = X.apply(s, 'other');
      const blocked = X.apply(s, 'apart');
      assert.equal(blocked.size, 4);
      assert.equal(X.capacity(blocked), X.capacity(s));
      assert.equal(blocked.used, s.used);
      assert.ok(blocked.say.includes(String(cost('unlearn') + grant(4))));
      assert.ok(X.actions(s).find((a) => a.id === 'apart').blocked);
    });

    await t.test('stepping down a size costs the action plus the ladder difference, at once', () => {
      const check = X.lossCheck(four, 3, 'unlearn');
      assert.equal(check.loss, grant(4) - grant(3));
      const s = X.apply(four, 'shrink');
      assert.equal(s.size, 3);
      assert.equal(X.capacity(s), S + grant(3));
      assert.equal(X.free(s), S + grant(4) - check.need);
    });

    await t.test('the largest Enchantment follows the deck', () => {
      const max = enchantmentMax(group.deck, R);
      const grow = X.actions(four).find((a) => a.id === 'grow');
      assert.equal(!!grow, max > 4);
      if (max > 4) assert.equal(X.capacity(play(four, 'grow', 'next')), S + grant(5));
    });

    await t.test('shrinking before the gain arrives is flagged as unclear, not decided silently', () => {
      const s = play(start, 'learn', 'next', 'grow', 'shrink');
      assert.equal(s.size, 3);
      assert.equal(X.capacity(s), S + grant(3));
      assert.equal(s.notes[0].kind, 'unclear');
    });

    await t.test('every state has a text equivalent', () => {
      let s = start;
      for (const id of ['learn', 'next', 'grow', 'other', 'next', 'shrink', 'apart', 'next']) {
        s = X.apply(s, id);
        assert.ok(s.say && !/\{\w+\}/.test(s.say), id + ': ' + s.say);
      }
    });
  });
}
