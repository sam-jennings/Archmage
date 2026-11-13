// Walks "Taking components back" through one case of each outcome and checks cost,
// remainder and capacity against the rules data and the shared hand checker.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as X from '../learn/explainers/unlearn.js';
import { BASE_RULES as R, points } from '../data/current.js';

const G = '2-4';
const cost = R.learning.find((a) => a.key === 'unlearn').cost.counters;
const grant = (size) => R.enchantmentLadder.find((r) => r.size === size).counters;
const [PERFECT, TRANSFIG, CONJ, ENCH] = [0, 1, 2, 3];

test('presets are the spells they claim to be', () => {
  assert.deepEqual(X.PRESETS.map((p) => p.kind), ['perfect', 'transfiguration', 'conjuration', 'enchantment']);
});

test('one counter however many components come back', () => {
  for (const picked of [[0], [0, 1], [0, 4]]) assert.equal(X.evaluate(PERFECT, picked, G).cost, cost);
});

test('an end comes off a run and what is left still scores by the table', () => {
  const r = X.evaluate(PERFECT, [0], G);
  assert.equal(r.status, 'ok');
  assert.deepEqual(r.left, { kind: 'perfect', size: 4, pts: points('perfect', 4, R) });
  const both = X.evaluate(PERFECT, [0, 4], G);
  assert.equal(both.status, 'ok');
  assert.equal(both.left.size, 3);
});

test('too few left: the whole spell comes apart and every component returns', () => {
  const r = X.evaluate(PERFECT, [0, 1, 2], G);
  assert.equal(r.status, 'collapse');
  assert.equal(r.taken.length, X.PRESETS[PERFECT].cards.length);
  assert.equal(r.rest.length, 0);
});

test('FINDING: one from the middle of a mixed run — the rulebook gives two answers', () => {
  const r = X.evaluate(TRANSFIG, [2], G);
  assert.equal(r.status, 'conflict');
  const s = X.apply(X.init(G, TRANSFIG), 'toggle:2');
  assert.equal(s.notes[0].kind, 'unclear');
});

test('FINDING: one from the middle of a same-energy run leaves a valid spell of another type', () => {
  const r = X.evaluate(PERFECT, [2], G);
  assert.equal(r.status, 'retype');
  assert.equal(r.left.kind, 'conjuration');
  assert.equal(r.left.pts, points('conjuration', 4, R));
  assert.equal(X.apply(X.init(G, PERFECT), 'toggle:2').notes[0].kind, 'unclear');
});

test('a Conjuration gives up any component', () => {
  assert.equal(X.evaluate(CONJ, [1], G).status, 'ok');
});

test('an Enchantment stepped down loses the ladder difference at once', () => {
  const r = X.evaluate(ENCH, [3], G);
  assert.equal(r.status, 'ok');
  assert.equal(r.left.kind, 'enchantment');
  assert.equal(r.from, grant(4));
  assert.equal(r.to, grant(3));
  assert.equal(r.loss, grant(4) - grant(3));
  assert.equal(X.evaluate(ENCH, [0, 1], G).loss, grant(4));
});

test('tapping toggles, and every state has a text equivalent', () => {
  let s = X.init(G);
  s = X.apply(s, 'toggle:0');
  assert.deepEqual(s.picked, [0]);
  s = X.apply(s, 'toggle:0');
  assert.deepEqual(s.picked, []);
  for (let preset = 0; preset < X.PRESETS.length; preset++) {
    for (let i = 0; i < X.PRESETS[preset].cards.length; i++) {
      const t = X.apply(X.init(G, preset), 'toggle:' + i);
      assert.ok(t.say && !/\{\w+\}/.test(t.say + (t.notes[0]?.text || '')), `${preset}/${i}: ${t.say}`);
    }
  }
});
