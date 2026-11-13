// Walks the Reshape worked example and checks the cost and both rebuild verdicts.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as X from '../learn/explainers/reshape.js';
import { BASE_RULES as R, points } from '../data/current.js';

const G = '2-4';
const reshape = R.learning.find((a) => a.key === 'reshape');

test('cost is one counter per spell broken down', () => {
  assert.equal(reshape.cost.per, 'spell broken down');
  assert.equal(X.cost(), X.BEFORE.length * reshape.cost.counters);
});

test('before: two 3-component Transfigurations, scored by the table', () => {
  assert.equal(X.init(G).before, 2 * points('transfiguration', 3, R));
});

test('a rebuild that strands components is not allowed', () => {
  const v = X.verdict('x', G);
  assert.equal(v.legal, false);
  assert.equal(v.groups[0].spell.kind, 'transfiguration');
  assert.equal(v.stranded.length, 2);
});

test('a rebuild that uses every component is allowed and scores by the table', () => {
  const v = X.verdict('y', G);
  assert.equal(v.legal, true);
  assert.deepEqual(v.groups[0].spell, { kind: 'transfiguration', size: 6, pts: points('transfiguration', 6, R) });
});

test('same components before and after', () => {
  const ids = (groups) => groups.flat().map((c) => c.e + c.v).sort().join();
  assert.equal(ids(X.REBUILDS.x), ids(X.BEFORE));
  assert.equal(ids(X.REBUILDS.y), ids(X.BEFORE));
});

test('walk: break, try both, with text at every step and the open question flagged', () => {
  let s = X.init(G);
  s = X.apply(s, 'break');
  assert.equal(s.phase, 'broken');
  assert.ok(s.say.includes(String(X.cost())));
  assert.equal(s.notes[0].kind, 'unclear');
  for (const choice of ['x', 'y']) {
    const t = X.apply(s, choice);
    assert.equal(t.phase, 'result');
    assert.ok(t.say && !/\{\w+\}/.test(t.say), t.say);
  }
});
