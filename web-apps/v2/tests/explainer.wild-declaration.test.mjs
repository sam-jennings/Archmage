// Walks "Declaring a wild": declare, Empower (fits / needs the wild to move), rebuild and
// redeclare; then the Enchantment question at both player counts.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as X from '../learn/explainers/wild-declaration.js';
import { BASE_RULES as R, points, enchantmentMax } from '../data/current.js';

const play = (s, ...ids) => ids.reduce((state, id) => X.apply(state, id), s);
const grant = (size) => R.enchantmentLadder.find((r) => r.size === size).counters;
const declared = (s) => s.cards.find((c) => c.e === 'wild').as;

for (const group of R.players.groups) {
  test(`wild-declaration · run · ${group.id} players`, async (t) => {
    const start = X.init(group.id);
    const [below, above, gap] = X.valueOptions(start.cards);

    await t.test('only energies in the deck are offered', () => {
      assert.deepEqual(X.energyOptions(group.id), R.decks[group.deck].energies);
    });

    await t.test('a declaration that completes the run is valid; one that leaves a gap is not', () => {
      assert.equal(X.judge(start, { e: 'flux', v: above }).kind, 'transfiguration');
      assert.equal(X.judge(start, { e: 'flux', v: below }).kind, 'transfiguration');
      assert.equal(X.judge(start, { e: 'flux', v: gap }), null);
      const s = play(start, 'e:flux', 'v:' + gap, 'learn');
      assert.equal(s.phase, 'declare', 'cannot learn an invalid declaration');
    });

    const fixed = play(start, 'e:flux', 'v:' + above, 'learn');

    await t.test('once learned the wild is that card', () => {
      assert.equal(fixed.phase, 'fixed');
      assert.deepEqual(declared(fixed), { e: 'flux', v: above });
    });

    await t.test('Empower that fits is allowed and does not redeclare', () => {
      const s = X.apply(fixed, 'add:fits');
      assert.equal(s.cards.length, fixed.cards.length + 1);
      assert.deepEqual(declared(s), { e: 'flux', v: above });
    });

    await t.test('Empower that needs the wild to move is refused, spell unchanged', () => {
      const offer = X.empowerOffers(fixed).clash;
      assert.equal(offer.v, above);
      const s = X.apply(fixed, 'add:clash');
      assert.equal(s.cards.length, fixed.cards.length);
      assert.deepEqual(declared(s), { e: 'flux', v: above });
      // It WOULD be a spell if the wild could move to the other end — that is the point.
      const moved = { ...fixed, cards: fixed.cards.filter((c) => c.e !== 'wild').concat([offer, { e: 'wild', v: null }]) };
      assert.ok(X.judge(moved, { e: 'flux', v: below }));
    });

    await t.test('rebuild clears the declaration; a different one may be chosen', () => {
      const s = X.apply(fixed, 'rebuild');
      assert.equal(s.phase, 'declare');
      assert.equal(declared(s), null);
      const again = play(s, 'v:' + below, 'learn');
      assert.equal(again.phase, 'done');
      assert.deepEqual(declared(again), { e: 'flux', v: below });
    });

    await t.test('every state has a text equivalent', () => {
      let s = start;
      for (const id of ['v:' + gap, 'v:' + above, 'e:void', 'learn', 'add:clash', 'add:fits', 'rebuild', 'v:' + below, 'learn']) {
        s = X.apply(s, id);
        assert.ok(s.say && !/\{\w+\}/.test(s.say), id + ': ' + s.say);
      }
    });
  });

  test(`wild-declaration · Enchantment · ${group.id} players`, () => {
    const s = X.apply(X.init(group.id), 'scene:ench');
    const max = enchantmentMax(group.deck, R);
    const options = X.enchantmentOptions(s.cards, group.id);
    assert.equal(s.cards.length, R.decks.base.energies.length);
    assert.equal(s.notes[0].kind, 'implied');
    if (max === s.cards.length) {
      // 2–4 players: every energy in the deck is already there. The wild has nothing to be.
      assert.deepEqual(options, []);
      assert.equal(s.phase, 'no');
      assert.ok(!X.actions(s).some((a) => a.id.startsWith('ench:')));
    } else {
      assert.deepEqual(options, ['echo']);
      const done = X.apply(s, 'ench:echo');
      assert.equal(done.cards.length, max);
      assert.ok(done.say.includes('+' + grant(max)));
      assert.ok(done.say.includes(String(points('enchantment', max, R))));
    }
  });
}
