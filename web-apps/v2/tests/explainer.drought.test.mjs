// Walks the Drought timeline and checks the pile arithmetic and turn shape against the data.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as X from '../learn/explainers/drought.js';
import { BASE_RULES as R, deckSize } from '../data/current.js';

for (const group of R.players.groups) {
  test(`drought · ${group.id} players`, async (t) => {
    const frames = X.frames(group.id);
    const by = Object.fromEntries(frames.map((f) => [f.key, f]));
    const S = R.setup;

    await t.test('set-up piles follow the deck, the deal, the Array and the Opening', () => {
      assert.equal(by.setup.source, deckSize(R.decks[group.deck]) - group.min * S.handSize - S.arraySize);
      assert.equal(by.setup.array, S.arraySize);
      assert.equal(by.setup.reserve, group.min * S.openingDiscard);
    });

    await t.test('the Drought starts when the Source reaches zero', () => {
      assert.equal(by.last.source, 1);
      assert.equal(by.dry.source, 0);
      assert.ok(by.dry.say.includes(R.drought.trigger));
    });

    await t.test('Released Reserve = the Array + the Arcane Reserve; the Array is gone', () => {
      assert.equal(by.release.released, by.dry.array + by.dry.reserve);
      assert.equal(by.release.array, null);
      assert.equal(by.release.source, null);
    });

    await t.test('a Drought turn draws one and has no Casting, Learning intact', () => {
      assert.equal(by.turn.released, by.release.released - 1);
      const phases = R.turn.drought;
      assert.ok(phases.find((p) => p.key === 'casting').absent);
      assert.ok(phases.some((p) => p.key === 'learning' && !p.absent));
      assert.equal(R.drought.whyNoCasting.filter((w) => w.works).map((w) => w.kind).join(), 'enchantment');
    });

    await t.test('the contest ends when the Released Reserve is empty', () => {
      assert.equal(by.low.released, 1);
      assert.equal(by.end.released, 0);
      assert.equal(frames.at(-1).key, 'end');
    });

    await t.test('the two unwritten timings are flagged, not decided', () => {
      assert.ok(by.dry.note && by.end.note);
      const s = X.apply(X.init(group.id), 'goto:' + frames.indexOf(by.dry));
      assert.equal(s.notes[0].kind, 'unclear');
    });

    await t.test('stepping and scrubbing reach every frame with text', () => {
      let s = X.init(group.id);
      for (let i = 0; i < frames.length; i++) {
        assert.equal(s.i, i);
        assert.ok(s.say && !/\{\w+\}/.test(s.say), s.say);
        assert.equal(X.scrub(s).max, frames.length - 1);
        s = X.apply(s, 'next');
      }
      assert.equal(s.i, frames.length - 1);
      assert.deepEqual(X.actions(s), []);
      assert.equal(X.apply(s, 'goto:0').i, 0);
    });
  });
}
