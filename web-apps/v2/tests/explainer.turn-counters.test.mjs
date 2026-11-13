// Walks "Counters through a turn" through its canonical example and checks every outcome
// against the rules data.   node --test web-apps/v2/tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import * as X from '../learn/explainers/turn-counters.js';
import { BASE_RULES as R, castTier } from '../data/current.js';

const play = (s, ...ids) => ids.reduce((state, id) => X.apply(state, id), s);
const grant = (size) => R.enchantmentLadder.find((r) => r.size === size).counters;

for (const group of R.players.groups) {
  test(`turn-counters · ${group.id} players`, async (t) => {
    const start = X.init(group.id);
    const capacity = group.startingCounters + grant(3);

    await t.test('capacity = starting counters + the Enchantment’s grant', () => {
      assert.equal(start.capacity, capacity);
      assert.equal(start.pool, capacity);
      assert.deepEqual(start.spells.map((s) => s.kind), ['enchantment', 'conjuration', 'transfiguration']);
    });

    await t.test('casting places one counter per spell and resolves the data’s effect', () => {
      const s = play(start, 'collect', 'cast:1');
      assert.equal(s.pool, capacity - 1);
      assert.deepEqual(s.cast, [1]);
      assert.ok(s.say.includes(String(castTier('conjuration', 3, R).draw)));
    });

    await t.test('an Enchantment is never cast and takes no counter', () => {
      const s = play(start, 'collect', 'cast:0');
      assert.equal(s.pool, capacity);
      assert.deepEqual(s.cast, []);
    });

    await t.test('a spell can be cast once a turn', () => {
      const s = play(start, 'collect', 'cast:1', 'cast:1');
      assert.equal(s.pool, capacity - 1);
    });

    await t.test('THE AHA: after the Recall you hold every counter, however many you cast', () => {
      const one = play(start, 'collect', 'cast:1', 'recall');
      const none = play(start, 'collect', 'recall');
      const all = play(start, 'collect', 'cast:1', 'cast:2', 'recall');
      for (const s of [one, none, all]) {
        assert.equal(s.phase, 'learning');
        assert.equal(s.pool, capacity);
      }
    });

    await t.test('Learning: one action per counter, each at the data’s cost, then none left', () => {
      let s = play(start, 'collect', 'cast:1', 'recall');
      const keys = R.learning.map((a) => a.key);
      for (let i = 0; i < capacity; i++) {
        const key = keys[i % keys.length];
        s = X.apply(s, 'act:' + key);
        assert.equal(s.pool, capacity - (i + 1) * R.learning.find((a) => a.key === key).cost.counters);
      }
      assert.equal(s.pool, 0);
      assert.ok(X.actions(s).filter((a) => a.id.startsWith('act:')).every((a) => a.disabled));
      assert.equal(X.apply(s, 'act:learn').pool, 0);
    });

    await t.test('every state has a text equivalent', () => {
      let s = start;
      for (const id of ['collect', 'cast:0', 'cast:1', 'recall', 'act:learn', 'end']) {
        s = X.apply(s, id);
        assert.ok(s.say && s.say.length > 10, id);
        assert.ok(!/\{\w+\}/.test(s.say), 'unfilled placeholder after ' + id + ': ' + s.say);
      }
      assert.equal(X.apply(s, 'again').phase, 'collection');
    });
  });
}
