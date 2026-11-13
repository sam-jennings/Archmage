// Spellbook → Trials power, against the model's worked examples (A16, A17).
import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveState, standardSpellPower, enchantmentPower, evalExpression, spellContribution } from '../engine/power.js';
import { loadRuleset } from '../rulesets/index.js';
import { fixture } from './helpers.mjs';

const maya = fixture('maya_spellbook.json').spells.map((s) => ({ id: s.spell_id, type: s.type, size: s.size, energy_domain: s.energy_domain }));
const flat = (state) => { const o = { wild: state.wild_power }; for (const [d, p] of Object.entries(state.normal_power)) if (p) o[d] = p; return o; };

test('A17: the two power profiles, on the same Spellbook', () => {
  const a17 = fixture('a17_formula_comparison.json');
  const v28 = fixture('trials_power_v28.json'); const hyb = fixture('hybrid_2n_minus_3_experimental.json');
  assert.deepEqual(flat(deriveState(v28, maya)), a17.expected.derived_state.v28);
  assert.deepEqual(flat(deriveState(hyb, maya)), a17.expected.derived_state.hybrid_2n_minus_3);
  assert.equal(standardSpellPower(v28, 5), a17.expected.five_card_standard_spell_power.v28);
  assert.equal(standardSpellPower(hyb, 5), a17.expected.five_card_standard_spell_power.hybrid_2n_minus_3);
  for (const [size, power] of Object.entries(a17.expected.hybrid_enchantment_table)) assert.equal(enchantmentPower(hyb, Number(size)), power);
});

test('the packages reproduce the same numbers as the model profiles', () => {
  const a17 = fixture('a17_formula_comparison.json');
  assert.deepEqual(flat(deriveState(loadRuleset('current-draft').config, maya)), a17.expected.derived_state.v28);
  assert.deepEqual(flat(deriveState(loadRuleset('hybrid-rebuild').config, maya)), a17.expected.derived_state.hybrid_2n_minus_3);
});

test('rulebook v2.8 power table: 3→3, 4→4, 5→8, 6→9, 7→14', () => {
  const cfg = loadRuleset('current-draft').config;
  assert.deepEqual([3, 4, 5, 6, 7, 15].map((n) => standardSpellPower(cfg, n)), [3, 4, 8, 9, 14, 30]);
});

test('baseline Wild power is added once per wizard, and says where it came from', () => {
  const c1 = loadRuleset('c1-coherent-claim');
  const state = deriveState(c1.config, maya, { extras: c1.extras });
  assert.equal(state.wild_power, 3);
  assert.deepEqual(state.wild_from, { spells: 2, baseline: 1 });
  assert.equal(deriveState(c1.config, [], { extras: c1.extras }).wild_power, 1);
  assert.deepEqual(state.tiebreak_stats, { spell_count: 4, largest_spell: 7 });
});

test('a spell the package cannot place is reported, never guessed', () => {
  const draft = loadRuleset('current-draft').config;
  const echoConj = { id: 'e', type: 'conjuration', size: 5, energy_domain: 'echo' };
  const state = deriveState(draft, [echoConj, { id: 'pt', type: 'perfect_transmutation', size: 4, energy_domain: 'echo' }]);
  assert.deepEqual(state.unplaced.map((u) => [u.spell, u.code, u.domain]), [['e', 'no-such-domain', 'echo'], ['pt', 'no-such-domain', 'echo']]);
  assert.equal(state.normal_power.transformation, 4, 'the Perfect Transmutation still feeds Transformation');
  const withEcho = deriveState(loadRuleset('current-draft', { echo_domain: true }).config, [echoConj]);
  assert.equal(withEcho.normal_power.echo, 8);
  assert.equal(withEcho.unplaced.length, 0);
  // The draft gives Wild power for a 4-component Enchantment only.
  assert.equal(spellContribution(draft, { id: 'x', type: 'enchantment', size: 5 }).wild, 0);
  assert.equal(spellContribution(loadRuleset('c1-coherent-claim').config, { id: 'x', type: 'enchantment', size: 5 }).wild, 1);
});

test('power expressions are arithmetic in n and nothing else', () => {
  assert.equal(evalExpression('2*n-3', 7), 11);
  assert.equal(evalExpression('1.5 * n', 5), 7.5);
  assert.equal(evalExpression('(n+1)/2', 5), 3);
  for (const bad of ['n;alert(1)', 'm', '2**n', 'n(', '']) assert.throws(() => evalExpression(bad, 3));
});
