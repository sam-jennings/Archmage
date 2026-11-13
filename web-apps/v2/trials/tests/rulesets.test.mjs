// The rule packages are data. These tests pin them to the analysis model's committed
// configurations, so the companion and the screening evidence cannot drift apart.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { RULESETS, DEFAULT_RULESET_ID, loadRuleset, findRuleset, playableCounts, optionValues, rulesetStamp } from '../rulesets/index.js';
import { LOCAL_TOKENS, RATIO_TOKENS } from '../engine/resolve.js';
import { HERE, modelFile } from './helpers.mjs';

// Compare what the rules say, not how the file is laid out: notes are prose, and the
// model writes the final tiebreak chain in either of two places.
function normalise(cfg) {
  const c = JSON.parse(JSON.stringify(cfg));
  delete c.notes;
  c.final_tiebreaks = c.final_tiebreaks || (c.final_result || {}).final_tiebreaks || null;
  delete c.final_result;
  if (c.final_tiebreaks == null) delete c.final_tiebreaks;
  return c;
}

for (const rs of RULESETS) {
  test(`${rs.id}: matches the analysis model's configuration`, { skip: !rs.modelConfig && 'no model configuration exists for this package' }, (t) => {
    const model = modelFile('configs/' + rs.modelConfig);
    if (!model) return t.skip('analysis model not present next to the site');
    assert.deepEqual(normalise(rs.config), normalise(model));
  });

  test(`${rs.id}: is internally sound`, () => {
    const cfg = rs.config;
    assert.ok(rs.label && rs.summary && rs.source && rs.status);
    const domains = new Set(cfg.domains.map((d) => d.id));
    for (const tr of cfg.trials) {
      assert.ok(rs.ui.trials[tr.id] && rs.ui.trials[tr.id].name, `trial ${tr.id} has a display name`);
      for (const token of tr.trial_tiebreaks) assert.ok(token === 'shared' || LOCAL_TOKENS.includes(token) || RATIO_TOKENS.includes(token), `known tiebreak ${token}`);
      assert.equal(tr.trial_tiebreaks.at(-1), 'shared');
      for (const d of tr.eligibility.allowed_domain_ids || []) assert.ok(domains.has(d));
      for (const n of Object.keys(tr.rewards.by_player_count)) assert.ok(tr.active_player_counts.includes(Number(n)), `${tr.id}: reward at ${n} players but not active`);
    }
    assert.ok(playableCounts(rs).length >= 1);
    for (const o of rs.options || []) assert.ok(o.id && o.label && o.note && typeof o.apply === 'function');
  });
}

test('the candidates differ only where the shortlist says they do', () => {
  const pick = (id) => loadRuleset(id).config;
  const c1 = pick('c1-coherent-claim'); const c4 = pick('c4-archspell-bold');
  const swap = (cfg) => cfg.trials.map((tr) => tr.id);
  assert.deepEqual(swap(c4), swap(c1).map((id) => (id === 'focused_power' ? 'archspell' : id)));
  const a = c4.trials.find((tr) => tr.id === 'archspell'); const f = c1.trials.find((tr) => tr.id === 'focused_power');
  assert.deepEqual({ ...a, id: 0, eligibility: 0 }, { ...f, id: 0, eligibility: 0 });
  assert.deepEqual(a.eligibility, { single_spell: true });
  assert.equal(loadRuleset('c1-coherent-claim').extras.baseline_wild, 1);
  assert.deepEqual(loadRuleset('c2-guarded-table').extras, { champions_mark: { player_counts: [2], bonus: 4 } });
  assert.deepEqual(loadRuleset('c3-open-skies').extras, { baseline_wild: 1, champions_mark: { player_counts: [2], bonus: 4 } });
});

test('Recognition Point pools match the proposal (30 / 37 / 43 / 52, 6 players 52 + 20)', () => {
  const cfg = loadRuleset('hybrid-rebuild').config;
  const pool = (n, place) => cfg.trials.filter((tr) => tr.active_player_counts.includes(n)).reduce((s, tr) => s + tr.rewards.by_player_count[n][place], 0);
  assert.deepEqual([2, 3, 4, 5, 6].map((n) => pool(n, 'first')), [30, 37, 43, 52, 52]);
  assert.equal(pool(6, 'second'), 20);
});

test('the current draft runs 2–5 players, and Echo is an explicit option', () => {
  const plain = loadRuleset('current-draft');
  assert.deepEqual(playableCounts(plain), [2, 3, 4, 5]);
  assert.ok(!plain.config.domains.some((d) => d.id === 'echo'));
  const echo = loadRuleset('current-draft', { echo_domain: true });
  assert.deepEqual(echo.config.domains.map((d) => d.id), ['void', 'flux', 'radiance', 'aether', 'echo', 'transformation', 'enchantment']);
  assert.ok(!findRuleset('current-draft').config.domains.some((d) => d.id === 'echo'), 'the registry copy is never mutated');
  assert.deepEqual(optionValues(findRuleset('current-draft')), { echo_domain: false });
  assert.match(rulesetStamp(echo), /Current draft.*v2\.8.*Echo/);
  for (const id of ['c1-coherent-claim', 'c2-guarded-table', 'c3-open-skies', 'c4-archspell-bold', 'hybrid-rebuild']) assert.deepEqual(playableCounts(loadRuleset(id)), [2, 3, 4, 5, 6]);
});

test('switching the package is one line, and every package file is registered', () => {
  assert.ok(DEFAULT_RULESET_ID === null || findRuleset(DEFAULT_RULESET_ID), 'the default names a registered package');
  const files = readdirSync(path.join(HERE, '../rulesets')).filter((f) => f.endsWith('.js') && !['index.js', 'hybrid-family.js'].includes(f)).map((f) => f.replace(/\.js$/, '')).sort();
  assert.deepEqual(RULESETS.map((r) => r.id).sort(), files, 'file name = package id, and each file is in the registry');
  assert.equal(loadRuleset('no-such-package'), null);
});

test('no package is named outside the registry, the settings and the results', () => {
  const ids = RULESETS.map((r) => r.id);
  for (const dir of ['..', '../engine', '../net']) {
    for (const f of readdirSync(path.join(HERE, dir)).filter((x) => x.endsWith('.js'))) {
      const text = readFileSync(path.join(HERE, dir, f), 'utf8');
      for (const id of ids) assert.ok(!text.includes(`'${id}'`), `${dir}/${f} hard-codes the package ${id}`);
    }
  }
});
