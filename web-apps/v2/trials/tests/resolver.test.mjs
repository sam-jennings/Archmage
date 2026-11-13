// The resolver, against the analysis model's acceptance fixtures (copied byte-for-byte
// into tests/fixtures/) and the rules outside its schema.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { resolveProfile } from '../engine/resolve.js';
import { deriveState } from '../engine/power.js';
import { entryIsLegal, qualifyingSourceCount, findUnspentUse } from '../engine/legality.js';
import { loadRuleset } from '../rulesets/index.js';
import { maxEntry } from '../engine/advise.js';
import { HERE, fixture, modelText, states, st, recognition, trialOf } from './helpers.mjs';

test('the copied fixtures are still what the model has', (t) => {
  let compared = 0;
  for (const f of readdirSync(path.join(HERE, 'fixtures'))) {
    const theirs = modelText('fixtures/adversarial/' + f) ?? modelText('fixtures/worked_examples/' + f);
    if (theirs == null) continue;
    assert.equal(readFileSync(path.join(HERE, 'fixtures', f), 'utf8'), theirs, f + ' has changed in the model: copy it again and re-run');
    compared += 1;
  }
  if (!compared) t.skip('analysis model not present next to the site');
});

test('A1 mirror tie: equal entries share the full award', () => {
  const f = fixture('a1_mirror_tie.json');
  const r = resolveProfile(f.config, states(f.states), f.allocations, f.player_count);
  const tr = trialOf(r, 'purity');
  assert.equal(tr.shared_first, f.expected.shared_first);
  assert.deepEqual(tr.placements, f.expected.placements);
  assert.deepEqual(recognition(r), f.expected.recognition);
  assert.deepEqual(r.win_utility, f.expected.win_utility);
  assert.deepEqual(r.margin_utility, f.expected.margin_utility);
});

test('A7 monotonicity trap: the ratio tiebreak punishes extra power, the local chain does not', () => {
  const f = fixture('a7_monotonicity_trap.json');
  for (const c of f.resolutions) {
    const r = resolveProfile(f.configs[c.config], states(f.states[c.state]), f.allocations[c.state], f.player_count);
    const tr = trialOf(r, 'purity');
    assert.equal(tr.shared_first, c.expected.shared_first, c.name);
    assert.equal(tr.shared_first ? null : tr.placements[0][0], c.expected.sole_first, c.name);
    assert.deepEqual(recognition(r), c.expected.recognition, c.name);
    assert.deepEqual(r.win_utility, c.expected.win_utility, c.name);
  }
});

test('A9 penny squat: one power claims an uncontested trial when there is no Minimum Claim', () => {
  const f = fixture('a9_penny_squat.json');
  const r = resolveProfile(f.config, states(f.states), f.allocations, f.player_count);
  assert.equal(r.valid, f.expected.resolves);
  assert.equal(r.warnings.some((w) => w.code === 'non-maximal'), f.expected.non_maximal_warning);
  const tr = trialOf(r, 'purity');
  assert.equal(tr.uncontested, true);
  assert.deepEqual(tr.legal_entries, f.expected.purity.legal_entries);
  assert.equal(tr.rewards_awarded[f.expected.purity.winner], f.expected.purity.reward);
  assert.deepEqual(recognition(r), f.expected.recognition);
  assert.deepEqual(r.margin_utility, f.expected.margin_utility);
});

test('A10 Wild power: cannot enter alone, cannot count as a source, is safe on a one-source trial', () => {
  const f = fixture('a10_wild_legality.json');
  for (const [name, c] of Object.entries(f.cases)) {
    const other = { player_id: 'other', normal_power: {}, wild_power: 0 };
    const r = resolveProfile(f.config, states({ p: c.state, other }), { p: c.allocation }, f.player_count);
    const entry = trialOf(r, c.trial).entries.p;
    assert.equal(entry.legal, c.expected.legal, name);
    assert.equal(entry.total_power, c.expected.total_power, name);
    assert.equal(((r.dropped_wild.p || {})[c.trial]) || 0, c.expected.dropped_wild, name);
    if (c.expected.reason_contains) assert.ok(entry.reason.includes(c.expected.reason_contains), name + ': ' + entry.reason);
    if (c.expected.legal) {
      assert.equal(entry.normal_total, c.expected.normal_total);
      assert.equal(entry.legal_wild, c.expected.wild_added);
      assert.equal(qualifyingSourceCount(f.config, f.config.trials.find((x) => x.id === c.trial), entry.normal_on), c.expected.qualifying_source_count);
    }
  }
});

test('A11 over-allocation: every entry drawing the overspent domain is void; nothing is clipped', () => {
  const f = fixture('a11_overallocation.json');
  const other = { player_id: 'zz', normal_power: {}, wild_power: 0 };
  const r = resolveProfile(f.config, states({ over: f.state, zz: other }), { over: f.allocation }, f.player_count);
  const ev = r.invalidation_events.find((e) => e.scope === 'overallocated_domain');
  const want = f.expected.invalidation_event;
  assert.deepEqual({ scope: ev.scope, domain: ev.domain, excess: ev.excess, action: ev.action, affected_entries: ev.affected_entries }, want);
  for (const tid of f.expected.invalidated_entries) assert.equal(trialOf(r, tid).entries.over.legal, false);
  for (const tid of f.expected.eligible_entries) assert.equal(trialOf(r, tid).entries.over.legal, true);
  assert.equal(r.conservation.over.void.residue, -1);
});

test('A12 tiebreak cascade, and second place suppressed by a shared first', () => {
  const f = fixture('a12_tiebreak_cascade.json').cases;
  for (const key of ['a12a_source_count_tiebreak', 'a12b_source_count_skipped']) {
    const c = f[key]; const e = c.expected;
    const r = resolveProfile(c.config, states(c.states), c.allocations, c.player_count);
    const tr = trialOf(r, e.trial);
    assert.deepEqual(tr.total_power, e.total_power, key);
    assert.equal(tr.comparison.token, e.deciding_token, key);
    assert.equal(tr.shared_first, e.shared_first, key);
    assert.equal(tr.shared_first ? null : tr.placements[0][0], e.sole_first, key);
    assert.deepEqual(recognition(r), e.recognition, key);
    assert.deepEqual(r.win_utility, e.win_utility, key);
    assert.deepEqual(r.margin_utility, e.margin_utility, key);
  }
  const c = f.a12c_shared_first_suppression;
  for (const [cfg, exp] of [['config_suppress', 'expected_suppress'], ['config_no_suppress', 'expected_no_suppress']]) {
    const r = resolveProfile(c[cfg], states(c.states), c.allocations, c.player_count);
    const tr = trialOf(r, 'grand');
    assert.deepEqual(tr.placements[0], c[exp].shared_first_group);
    assert.deepEqual(tr.placements[1], c[exp].second_group);
    assert.deepEqual(tr.rewards_awarded, c[exp].rewards_awarded, cfg);
    assert.deepEqual(recognition(r), c[exp].recognition, cfg);
  }
});

test("A16 Maya's worked example resolves on the hybrid rebuild package", () => {
  const f = fixture('a16_maya_worked_example.json');
  const rs = loadRuleset('hybrid-rebuild');
  const book = fixture('maya_spellbook.json').spells.map((s) => ({ id: s.spell_id, type: s.type, size: s.size, energy_domain: s.energy_domain }));
  const maya = deriveState(rs.config, book, { playerId: 'maya' });
  const rivals = Object.fromEntries(['b', 'c', 'd', 'e'].map((id) => [id, deriveState(rs.config, [], { playerId: id })]));
  const alloc = { player_id: 'maya', normal: {}, wild: {} };
  for (const [tid, e] of Object.entries(f.expected.allocation)) { alloc.normal[tid] = e.normal; if (e.wild) alloc.wild[tid] = e.wild; }
  const r = resolveProfile(rs.config, { maya, ...rivals }, { maya: alloc }, f.player_count);
  assert.equal(r.valid, true);
  assert.deepEqual(r.invalidation_events, []);
  for (const [tid, total] of Object.entries(f.expected.trial_totals)) assert.equal(trialOf(r, tid).total_power.maya, total, tid);
  for (const tid of f.expected.not_entered) assert.equal(trialOf(r, tid).legal_entries.length, 0);
  for (const [dom, led] of Object.entries(f.expected.ledger)) {
    if (dom === 'wild') assert.equal(r.residue.maya.wild, led.available - led.used);
    else assert.deepEqual([r.conservation.maya[dom].allocated, r.conservation.maya[dom].available], [led.used, led.available]);
  }
  assert.equal(r.warnings.length, 0, 'the allocation is maximal');
  // Uncontested at 5 players: 8 + 9 + 6.
  assert.equal(r.player_results.maya.recognition_points, 23);
  assert.equal(r.player_results.maya.final_place, 1);
});

// ── Rules outside the model's schema ────────────────────────────────────────────────

const spell = (id, type, size, energy_domain) => ({ id, type, size, energy_domain });

test('Minimum Claim: normal power below the floor is no entry, and Wild power never counts toward it', () => {
  const c1 = loadRuleset('c1-coherent-claim'); const c3 = loadRuleset('c3-open-skies');
  const purity = (rs) => rs.config.trials.find((x) => x.id === 'energy_purity');
  const v = entryIsLegal(c1.config, purity(c1), { void: 2 }, 2, 1);
  assert.equal(v.legal, false);
  assert.deepEqual(v.reasons.map((r) => [r.code, r.have, r.need]), [['below-floor', 2, 3]]);
  assert.equal(entryIsLegal(c1.config, purity(c1), { void: 3 }, 2, 0).legal, true);
  assert.equal(entryIsLegal(c3.config, purity(c3), { void: 1 }, 2, 0).legal, true);
  assert.equal(entryIsLegal(loadRuleset('c2-guarded-table').config, purity(loadRuleset('c2-guarded-table')), { void: 4 }, 2, 0).legal, false);
});

test("Champion's Mark: +4 for winning your marked trial at 2 players, a shared win counts, and never at 3+", () => {
  const rs = loadRuleset('c2-guarded-table');
  const mk = (id, book) => deriveState(rs.config, book, { playerId: id, extras: rs.extras });
  const S = { a: mk('a', [spell('1', 'conjuration', 6, 'void')]), b: mk('b', [spell('1', 'conjuration', 6, 'flux'), spell('2', 'transfiguration', 5)]) };
  const A = {
    a: { player_id: 'a', normal: { energy_purity: { void: 9 } }, wild: {}, mark: 'energy_purity' },
    b: { player_id: 'b', normal: { energy_purity: { flux: 9 }, transformation_mastery: { transformation: 7 } }, wild: {}, mark: 'universal_power' },
  };
  const r = resolveProfile(rs.config, S, A, 2, rs.extras);
  assert.deepEqual(r.mark_awards, [{ player_id: 'a', trial_id: 'energy_purity', won: true, awarded: 4 }, { player_id: 'b', trial_id: 'universal_power', won: false, awarded: 0 }]);
  assert.deepEqual(recognition(r), { a: 8 + 4, b: 8 + 8 });
  const three = resolveProfile(rs.config, { ...S, c: mk('c', []) }, A, 3, rs.extras);
  assert.deepEqual(three.mark_awards, []);
  assert.equal(resolveProfile(loadRuleset('c1-coherent-claim').config, S, A, 2, loadRuleset('c1-coherent-claim').extras).mark_awards.length, 0);
});

test('Trial of the Archspell: all power on it must come from one single spell', () => {
  const rs = loadRuleset('c4-archspell-bold');
  const arch = rs.config.trials.find((x) => x.id === 'archspell');
  const me = deriveState(rs.config, [spell('big', 'conjuration', 7, 'void'), spell('small', 'conjuration', 3, 'void'), spell('pt', 'perfect_transmutation', 5, 'flux'), spell('tf', 'transfiguration', 4)], { playerId: 'me', extras: rs.extras });
  assert.deepEqual([me.normal_power.void, me.normal_power.flux, me.normal_power.transformation], [14, 7, 12]);
  const ok = (entry) => entryIsLegal(rs.config, arch, entry, 3, 0, me);
  assert.equal(ok({ void: 11 }).legal, true, 'the 7-component Conjuration alone');
  assert.equal(ok({ void: 12 }).legal, false, 'two Void spells together');
  assert.equal(ok({ void: 12 }).reasons[0].code, 'not-one-spell');
  assert.equal(ok({ flux: 7 }).legal, true, 'a Perfect Transmutation may fight from its energy');
  assert.equal(ok({ transformation: 7 }).legal, true, 'or from Transformation');
  assert.equal(ok({ flux: 4, transformation: 3 }).legal, true, 'or a mix');
  assert.equal(ok({ flux: 7, transformation: 7 }).legal, false, 'but its Spell Power is the cap: it counts once');
  assert.equal(maxEntry(rs.config, arch, me, 3).total, 11 + me.wild_power);
  assert.equal(ok({ void: 5, transformation: 5 }).legal, false, 'two different spells');
  assert.equal(ok({ void: 2 }).reasons[0].code, 'below-floor');
});

test('final places: Recognition Points, then the package\'s chain; the draft just shares', () => {
  const rs = loadRuleset('c1-coherent-claim');
  const mk = (id, book) => deriveState(rs.config, book, { playerId: id, extras: rs.extras });
  const S = { a: mk('a', [spell('1', 'conjuration', 5, 'void')]), b: mk('b', [spell('1', 'conjuration', 5, 'flux'), spell('2', 'enchantment', 3)]) };
  const A = { a: { player_id: 'a', normal: { energy_purity: { void: 7 } }, wild: {} }, b: { player_id: 'b', normal: { energy_purity: { flux: 7 } }, wild: {} } };
  const r = resolveProfile(rs.config, S, A, 2, rs.extras);
  assert.deepEqual(recognition(r), { a: 8, b: 8 });
  assert.deepEqual([r.player_results.a.final_place, r.player_results.b.final_place], [2, 1]);
  assert.equal(r.final_decided_by, 'total_normal_power');
  const draft = loadRuleset('current-draft');
  const S2 = { a: deriveState(draft.config, [spell('1', 'conjuration', 5, 'void')], { playerId: 'a' }), b: deriveState(draft.config, [spell('1', 'conjuration', 5, 'flux'), spell('2', 'enchantment', 3)], { playerId: 'b' }) };
  const A2 = { a: { player_id: 'a', normal: { energy_purity: { void: 8 } }, wild: {} }, b: { player_id: 'b', normal: { energy_purity: { flux: 8 } }, wild: {} } };
  const r2 = resolveProfile(draft.config, S2, A2, 2);
  assert.deepEqual(recognition(r2), { a: 6, b: 6 });
  assert.deepEqual([r2.player_results.a.final_place, r2.player_results.b.final_place, r2.player_results.a.shared], [1, 1, true]);
  assert.equal(r2.final_decided_by, 'shared');
});
