// The session reducer, the hidden-information boundary, and Spellbook entry.
import test from 'node:test';
import assert from 'node:assert/strict';
import { newSession, reduce, allLocked, waitingFor, tableStates, remaining, resolveSession, publicView, allocationOf } from '../state.js';
import { readCards, makeSpell, checkTable, checkQuickSpell, usedCards } from '../book.js';
import { loadRuleset, RULESETS } from '../rulesets/index.js';
import { trialOutlook, maxEntry } from '../engine/advise.js';
import { deckProfile, points } from '../../data/current.js';

const run = (s, ...actions) => actions.reduce((acc, a) => reduce(acc, a), s);
const fails = (s, action, code) => assert.throws(() => reduce(s, action), (e) => e.code === code, `${action.type} should fail with ${code}`);
const sp = (type, size, energy_domain = null) => ({ type, size, energy_domain, cards: null });

function table(rulesetId = RULESETS[0].id, names = ['Ana', 'Ben']) {
  return run(newSession({ rulesetId }), ...names.map((name) => ({ type: 'add-player', name })), { type: 'start-books' });
}

test('set-up: 2–6 named wizards and a rules package before anything starts', () => {
  let s = newSession();
  fails(s, { type: 'start-books' }, 'no-ruleset');
  s = reduce(s, { type: 'set-ruleset', rulesetId: RULESETS[0].id });
  s = reduce(s, { type: 'add-player', name: ' Ana ' });
  fails(s, { type: 'start-books' }, 'too-few-players');
  fails(s, { type: 'add-player', name: 'ana' }, 'name-taken');
  fails(s, { type: 'add-player', name: '  ' }, 'no-name');
  for (const name of ['B', 'C', 'D', 'E', 'F']) s = reduce(s, { type: 'add-player', name });
  fails(s, { type: 'add-player', name: 'G' }, 'table-full');
  assert.deepEqual(s.players.map((p) => p.name), ['Ana', 'B', 'C', 'D', 'E', 'F']);
  assert.equal(reduce(s, { type: 'start-books' }).phase, 'books');
});

test('the reducer never mutates the session it was given', () => {
  const s = table(); const before = JSON.stringify(s);
  reduce(s, { type: 'add-spell', playerId: 'p1', spell: sp('conjuration', 5, 'void') });
  assert.equal(JSON.stringify(s), before);
});

test('allocation: free to change until locked, deliberate to reopen, reveal only when all have locked', () => {
  let s = run(table(), { type: 'add-spell', playerId: 'p1', spell: sp('conjuration', 6, 'void') }, { type: 'add-spell', playerId: 'p2', spell: sp('transfiguration', 5) });
  fails(s, { type: 'set-normal', playerId: 'p1', trialId: 'energy_purity', domain: 'void', value: 5 }, 'wrong-phase');
  s = reduce(s, { type: 'start-allocation' });
  fails(s, { type: 'add-spell', playerId: 'p1', spell: sp('enchantment', 3) }, 'wrong-phase');
  s = run(s, { type: 'set-normal', playerId: 'p1', trialId: 'energy_purity', domain: 'void', value: 5 }, { type: 'set-wild', playerId: 'p1', trialId: 'energy_purity', value: 1 });
  assert.deepEqual(allocationOf(s, 'p1'), { normal: { energy_purity: { void: 5 } }, wild: { energy_purity: 1 }, mark: null });
  s = reduce(s, { type: 'set-normal', playerId: 'p1', trialId: 'energy_purity', domain: 'void', value: 0 });
  assert.deepEqual(allocationOf(s, 'p1').normal, {}, 'zero leaves no trace');
  s = run(s, { type: 'set-normal', playerId: 'p1', trialId: 'energy_purity', domain: 'void', value: 9 }, { type: 'lock', playerId: 'p1' });
  fails(s, { type: 'set-normal', playerId: 'p1', trialId: 'energy_purity', domain: 'void', value: 1 }, 'locked');
  fails(s, { type: 'clear-allocation', playerId: 'p1' }, 'locked');
  fails(s, { type: 'reveal' }, 'not-all-locked');
  assert.deepEqual(waitingFor(s).map((p) => p.name), ['Ben']);
  s = run(s, { type: 'unlock', playerId: 'p1' }, { type: 'clear-trial', playerId: 'p1', trialId: 'energy_purity' });
  assert.deepEqual(allocationOf(s, 'p1').normal, {});
  s = run(s, { type: 'lock', playerId: 'p1' }, { type: 'lock', playerId: 'p2' });
  assert.equal(allLocked(s), true);
  s = reduce(s, { type: 'reveal' });
  assert.equal(s.phase, 'results');
  fails(s, { type: 'unlock', playerId: 'p1' }, 'wrong-phase');
  fails(s, { type: 'set-ruleset', rulesetId: RULESETS[1].id }, 'wrong-phase');
});

test('hidden information: a shared screen gets no allocation before the reveal', () => {
  let s = run(table(), { type: 'add-spell', playerId: 'p1', spell: sp('conjuration', 6, 'void') }, { type: 'start-allocation' },
    { type: 'set-normal', playerId: 'p1', trialId: 'energy_purity', domain: 'void', value: 9 }, { type: 'set-mark', playerId: 'p1', trialId: 'energy_purity' }, { type: 'lock', playerId: 'p1' });
  const pub = publicView(s);
  assert.deepEqual(pub.allocations, {});
  assert.ok(!JSON.stringify(pub).includes('energy_purity'));
  assert.deepEqual(pub.locked, { p1: true }, 'who has locked is public');
  assert.deepEqual(pub.books, s.books, 'Spellbooks are public');
  s = run(s, { type: 'lock', playerId: 'p2' }, { type: 'reveal' });
  assert.deepEqual(publicView(s).allocations.p1.normal, { energy_purity: { void: 9 } });
});

test('switching the rules package mid-game is allowed and clears what it invalidates', () => {
  const [a, b] = RULESETS.map((r) => r.id);
  let s = run(table(a), { type: 'add-spell', playerId: 'p1', spell: sp('conjuration', 6, 'void') });
  s = reduce(s, { type: 'set-ruleset', rulesetId: b });
  assert.equal(s.books.p1.length, 1, 'Spellbooks survive a switch');
  s = run(s, { type: 'start-allocation' }, { type: 'set-normal', playerId: 'p1', trialId: 'energy_purity', domain: 'void', value: 9 }, { type: 'lock', playerId: 'p1' });
  s = reduce(s, { type: 'set-ruleset', rulesetId: a });
  assert.deepEqual([s.phase, allocationOf(s, 'p1').normal, s.locked], ['allocate', {}, {}]);
});

test('every package plays a full game at every player count it supports', () => {
  for (const base of RULESETS) {
    const rs = loadRuleset(base.id);
    const counts = rs.config.supported_player_counts.filter((n) => rs.config.trials.some((tr) => tr.rewards.by_player_count[n]));
    for (const n of counts) {
      let s = table(base.id, ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, n));
      for (const p of s.players) s = run(s, { type: 'add-spell', playerId: p.id, spell: sp('conjuration', 6, 'void') }, { type: 'add-spell', playerId: p.id, spell: sp('enchantment', 4) }, { type: 'add-spell', playerId: p.id, spell: sp('perfect_transmutation', 5, 'flux') });
      s = reduce(s, { type: 'start-allocation' });
      const states = tableStates(s, rs);
      for (const p of s.players) {
        // Each wizard throws everything legal at the first trial they can enter.
        const tr = rs.config.trials.find((x) => maxEntry(rs.config, x, states[p.id], n));
        const best = maxEntry(rs.config, tr, states[p.id], n);
        for (const [d, v] of Object.entries(best.normal)) s = reduce(s, { type: 'set-normal', playerId: p.id, trialId: tr.id, domain: d, value: v });
        s = run(s, { type: 'set-wild', playerId: p.id, trialId: tr.id, value: best.wild }, { type: 'lock', playerId: p.id });
      }
      s = reduce(s, { type: 'reveal' });
      const r = resolveSession(s, rs);
      assert.equal(r.valid, true, `${base.id} at ${n}`);
      assert.deepEqual(r.invalidation_events, [], `${base.id} at ${n}`);
      const total = Object.values(r.player_results).reduce((sum, x) => sum + x.recognition_points, 0);
      assert.ok(total > 0, `${base.id} at ${n} awards points`);
      assert.equal(Object.keys(r.player_results).length, n);
    }
  }
});

test('remaining power, and the public outlook on a trial', () => {
  const rs = loadRuleset('c1-coherent-claim');
  let s = run(table('c1-coherent-claim', ['Ana', 'Ben', 'Cy']),
    { type: 'add-spell', playerId: 'p1', spell: sp('conjuration', 7, 'void') },
    { type: 'add-spell', playerId: 'p2', spell: sp('conjuration', 5, 'flux') },
    { type: 'add-spell', playerId: 'p3', spell: sp('transfiguration', 6) },
    { type: 'start-allocation' });
  const states = tableStates(s, rs);
  assert.deepEqual([states.p1.normal_power.void, states.p1.wild_power, states.p2.normal_power.flux], [11, 1, 7]);
  const purity = rs.config.trials.find((x) => x.id === 'energy_purity');
  const look = (normal, wild = 0) => trialOutlook(rs.config, purity, 3, 'p1', states, { normal, wild });
  // Ben's ceiling on Energy Purity is 7 + 1 Wild = 8; Cy has no energy and cannot enter.
  assert.deepEqual(look({}).rivals, [{ id: 'p2', max: 8 }]);
  assert.equal(look({}).verdict, 'empty');
  assert.equal(look({ void: 2 }).verdict, 'illegal');
  assert.equal(look({ void: 2 }).mine.reasons[0].code, 'below-floor');
  assert.deepEqual([look({ void: 7 }).verdict, look({ void: 7 }).threatenedBy], ['contested', ['p2']]);
  assert.equal(look({ void: 8 }).verdict, 'certain-or-shared');
  assert.deepEqual([look({ void: 11 }).verdict, look({ void: 11 }).spare, look({ void: 11 }).beats], ['certain', 2, ['p2']]);
  assert.equal(look({ void: 8 }, 1).verdict, 'certain');
  const tm = rs.config.trials.find((x) => x.id === 'transformation_mastery');
  assert.equal(trialOutlook(rs.config, tm, 3, 'p1', states, { normal: {}, wild: 0 }).verdict, 'cannot-enter');
  assert.equal(trialOutlook(rs.config, tm, 3, 'p3', states, { normal: {}, wild: 0 }).verdict, 'empty-open', 'nobody else can enter');
  s = reduce(s, { type: 'set-normal', playerId: 'p1', trialId: 'energy_purity', domain: 'void', value: 9 });
  assert.deepEqual([remaining(states.p1, allocationOf(s, 'p1')).normal.void, remaining(states.p1, allocationOf(s, 'p1')).wild], [2, 1]);
});

// ── Spellbook entry through the shared hand checker ─────────────────────────────────

const base = deckProfile('2-4'); const echo = deckProfile('5-6');
const c = (e, v) => ({ e, v }); const W = { e: 'wild', v: null };

test('cards become a spell only when together they are exactly one spell', () => {
  const run3 = readCards([c('void', 4), c('void', 5), c('void', 6)], base, points);
  assert.deepEqual(run3.options.map((o) => o.type), ['perfect_transmutation', 'transfiguration', 'conjuration'], 'best Recognition Points first');
  assert.equal(run3.options[0].energy_domain, 'void');
  assert.deepEqual(readCards([c('void', 4), c('void', 5), c('flux', 9)], base, points).options, []);
  assert.deepEqual(readCards([c('void', 4), c('void', 5)], base, points).options, [], 'two cards are not a spell');
  const ench = readCards([c('void', 7), c('flux', 7), c('aether', 7), W], base, points).options;
  assert.deepEqual(ench.map((o) => [o.type, o.size, o.energy_domain]), [['enchantment', 4, null]]);
  const conj = readCards([c('flux', 2), c('flux', 9), c('flux', 13), W], base, points).options;
  assert.deepEqual(conj.map((o) => [o.type, o.size, o.energy_domain]), [['conjuration', 4, 'flux']]);
  assert.deepEqual(makeSpell('s1', conj[0], [c('flux', 2), W]), { id: 's1', type: 'conjuration', size: 4, energy_domain: 'flux', cards: [{ e: 'flux', v: 2 }, { e: 'wild', v: null }] });
});

test('the deck decides: Echo and the 5-component Enchantment exist only at 5–6 players', () => {
  const five = [c('void', 7), c('flux', 7), c('aether', 7), c('radiance', 7), c('echo', 7)];
  assert.equal(readCards(five, base, points).issues[0].code, 'energy-not-in-deck');
  assert.deepEqual(readCards(five, echo, points).options.map((o) => [o.type, o.size]), [['enchantment', 5]]);
  assert.deepEqual(checkQuickSpell(sp('enchantment', 5), base).map((i) => i.code), ['size-out-of-range']);
  assert.deepEqual(checkQuickSpell(sp('enchantment', 5), echo), []);
  assert.deepEqual(checkQuickSpell(sp('conjuration', 5, 'echo'), base).map((i) => i.code), ['energy-not-in-deck']);
  assert.deepEqual(checkQuickSpell(sp('conjuration', 16, 'void'), base).map((i) => i.code), ['size-out-of-range']);
});

test('one deck, one of each card: a card in two spells anywhere at the table is flagged', () => {
  const book = (playerId, ...spells) => ({ playerId, spells });
  const s1 = { id: 'a', type: 'conjuration', size: 3, energy_domain: 'void', cards: [c('void', 1), c('void', 5), c('void', 9)] };
  const s2 = { id: 'b', type: 'transfiguration', size: 3, energy_domain: null, cards: [c('void', 5), c('flux', 6), W] };
  const s3 = { id: 'c', type: 'enchantment', size: 3, energy_domain: null, cards: [c('aether', 2), W, W] };
  assert.deepEqual(checkTable([book('p1', s1)], base), []);
  const issues = checkTable([book('p1', s1), book('p2', s2, s3)], base);
  assert.deepEqual(issues.map((i) => i.code), ['duplicate-card', 'too-many-wilds']);
  assert.deepEqual(issues[0].where, [{ playerId: 'p1', spellId: 'a' }, { playerId: 'p2', spellId: 'b' }]);
  assert.deepEqual([issues[1].count, issues[1].max], [3, 2]);
  assert.equal(checkTable([book('p1', s1), book('p2', s2, s3)], echo).length, 1, 'the 5–6 player deck has four wilds');
  const used = usedCards([book('p1', s1), book('p2', s3)]);
  assert.deepEqual([used.keys.has('void:5'), used.keys.has('flux:6'), used.wilds], [true, false, 2]);
  assert.deepEqual(checkTable([book('p1', sp('enchantment', 5))], base).map((i) => [i.code, i.issue.code]), [['spell', 'size-out-of-range']]);
});
