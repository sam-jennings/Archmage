// Plain language is generated from the package data; a new package needs no sentences.
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeT, requirementText, reasonText, tiebreakText } from '../describe.js';
import { TRIALS_STRINGS } from '../strings.en.js';
import { RULESETS, loadRuleset } from '../rulesets/index.js';
import { entryIsLegal } from '../engine/legality.js';

const T = makeT(TRIALS_STRINGS);
const name = (id) => id[0].toUpperCase() + id.slice(1);
const req = (rs, id) => requirementText(T, rs.config, rs.config.trials.find((x) => x.id === id), name);

test('every trial of every package gets a requirement sentence with no gaps', () => {
  for (const base of RULESETS) {
    const rs = loadRuleset(base.id);
    for (const tr of rs.config.trials) {
      const text = requirementText(T, rs.config, tr, name);
      assert.ok(text.length > 8 && !/\{|\}|undefined|req\./.test(text), `${base.id}/${tr.id}: ${text}`);
      assert.ok(!/undefined|tiebreak\./.test(tiebreakText(T, tr.trial_tiebreaks)), `${base.id}/${tr.id} tiebreaks`);
    }
  }
});

test('the sentences say what the data says', () => {
  const c1 = loadRuleset('c1-coherent-claim');
  assert.equal(req(c1, 'energy_purity'), 'Power from exactly one energy.');
  assert.equal(req(c1, 'energy_harmony'), 'Power from two or more different energies.');
  assert.equal(req(c1, 'transformation_mastery'), 'Transformation power only.');
  assert.equal(req(c1, 'focused_power'), 'Power from exactly one source. A source is one energy, Transformation, or Enchantment.');
  assert.equal(req(c1, 'complete_mastery'), 'Power from three or more different sources. A source is one energy, Transformation, or Enchantment. It must include energy, Transformation and Enchantment.');
  assert.equal(req(loadRuleset('c4-archspell-bold'), 'archspell'), 'All power here must come from one single spell.');
  assert.equal(tiebreakText(T, ['total_power', 'normal_power', 'breadth', 'shared']), 'higher normal power, then more different sources, then the win is shared in full');
  assert.equal(tiebreakText(T, ['total_power', 'shared']), 'then the win is shared in full'.replace(/^then /, ''));
  assert.equal(tiebreakText(T, ['shared'], true), 'the place is shared');
});

test('every reason an entry can fail has words', () => {
  const c1 = loadRuleset('c1-coherent-claim');
  const tr = (id) => c1.config.trials.find((x) => x.id === id);
  const why = (id, entry, wild = 0) => entryIsLegal(c1.config, tr(id), entry, 5, wild, { spells: [] }).reasons.map((r) => reasonText(T, c1.config, tr(id), r, name)).join(' ');
  assert.equal(why('energy_harmony', { void: 5 }), 'Needs two different energies; this has one.');
  assert.equal(why('energy_purity', { void: 5, flux: 5 }), 'Allows only one energy; this has two.');
  assert.equal(why('energy_purity', { void: 2 }), 'Below the Minimum Claim: 2 of the 3 normal power needed.');
  assert.equal(why('energy_purity', {}, 1), 'Needs one different energy; this has zero.');
  assert.match(why('transformation_mastery', { void: 4 }), /Void power cannot be used here\. Needs Transformation power\./);
  assert.match(why('complete_mastery', { void: 3, flux: 3, echo: 3 }), /Needs Transformation power as well\. Needs Enchantment power as well\./);
});
