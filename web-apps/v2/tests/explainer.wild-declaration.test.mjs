// Walks "Declaring a wild" (rules v3.2, flexible wilds): declare a number, Empower (fits /
// needs the wild to move), rebuild and redeclare; then the Enchantment question at both
// player counts, where only the size cap decides.
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

    await t.test('only numbers are offered — a wild never declares an energy', () => {
      const ids = X.actions(start).map((a) => a.id);
      assert.ok(!ids.some((id) => id.startsWith('e:')));
      assert.deepEqual(ids.filter((id) => id.startsWith('v:')), [below, above, gap].map((v) => 'v:' + v));
    });

    await t.test('a number that completes the run is valid; one that leaves a gap is not', () => {
      assert.equal(X.judge(start, { v: above }).kind, 'transfiguration');
      assert.equal(X.judge(start, { v: below }).kind, 'transfiguration');
      assert.equal(X.judge(start, { v: gap }), null);
      const s = play(start, 'v:' + gap, 'learn');
      assert.equal(s.phase, 'declare', 'cannot learn an invalid declaration');
    });

    const fixed = play(start, 'v:' + above, 'learn');

    await t.test('once learned the wild is that number, and only a number', () => {
      assert.equal(fixed.phase, 'fixed');
      assert.deepEqual(declared(fixed), { v: above });
    });

    await t.test('Empower that fits is allowed and does not redeclare', () => {
      const s = X.apply(fixed, 'add:fits');
      assert.equal(s.cards.length, fixed.cards.length + 1);
      assert.deepEqual(declared(s), { v: above });
    });

    await t.test('the wild number is fixed: an Empower that needs it to move is refused', () => {
      const offer = X.empowerOffers(fixed).clash;
      assert.equal(offer.v, above);
      const s = X.apply(fixed, 'add:clash');
      assert.equal(s.cards.length, fixed.cards.length);
      assert.deepEqual(declared(s), { v: above });
      // It WOULD be a spell if the wild could move to the other end — that is the point.
      const moved = { ...fixed, cards: fixed.cards.filter((c) => c.e !== 'wild').concat([offer, { e: 'wild', v: null }]) };
      assert.ok(X.judge(moved, { v: below }));
    });

    await t.test('rebuild clears the declaration; a different number may be chosen', () => {
      const s = X.apply(fixed, 'rebuild');
      assert.equal(s.phase, 'declare');
      assert.equal(declared(s), null);
      const again = play(s, 'v:' + below, 'learn');
      assert.equal(again.phase, 'done');
      assert.deepEqual(declared(again), { v: below });
    });

    await t.test('every state has a text equivalent', () => {
      let s = start;
      for (const id of ['v:' + gap, 'v:' + above, 'learn', 'add:clash', 'add:fits', 'rebuild', 'v:' + below, 'learn']) {
        s = X.apply(s, id);
        assert.ok(s.say && !/\{\w+\}/.test(s.say), id + ': ' + s.say);
      }
    });
  });

  test(`wild-declaration · Enchantment · ${group.id} players`, () => {
    const s = X.apply(X.init(group.id), 'scene:ench');
    const max = enchantmentMax(group.deck, R);
    assert.equal(s.cards.length, R.decks.base.energies.length);
    assert.ok(!/\{\w+\}/.test(s.say), s.say);
    if (max === s.cards.length) {
      // 2–4 players: the size cap is 4 and the Enchantment already has 4.
      assert.equal(max, 4);
      assert.equal(s.phase, 'no');
      assert.equal(X.enchantmentCanGrow(s.cards, group.id), false);
      assert.ok(!X.actions(s).some((a) => a.id.startsWith('ench:')));
      assert.equal(X.apply(s, 'ench:add'), s, 'adding is refused');
    } else {
      // 5–6 players: the wild joins with no energy declared at all.
      assert.equal(max, 5);
      const done = X.apply(s, 'ench:add');
      assert.equal(done.cards.length, max);
      assert.equal(done.cards.at(-1).as, null, 'a wild in an Enchantment declares nothing');
      assert.ok(done.say.includes('+' + grant(max)));
      assert.ok(done.say.includes(String(points('enchantment', max, R))));
    }
  });
}
