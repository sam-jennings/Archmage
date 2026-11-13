// Equivalence test for the shared hand checker (web-apps/v2/assets/js/hand-checker.js)
// against the existing golden master (web-apps/tests/hand-checker/golden-master.snapshot.json,
// READ-ONLY here — this test never writes it).
//
// Run from the repo root:   node --test web-apps/v2/tests/
// No dependencies. The snapshot's 150-hand corpus is used as-is.
//
// The golden master locked the OLD widget: a 1–20 value keypad, unlimited wilds, duplicate
// cards allowed, four energies, Enchantments capped at 4, no size cap. Canon has moved
// (meta/canon.yml: ranks 1–15, 2 or 4 wilds, max spell size 15, Echo at 5–6 players, wild
// declarations). So equivalence is proved in two layers, and every intended difference is
// listed in INTENDED_DIFFERENCES below rather than silently diverging.
//
//   Layer A  Same engine, OLD parameters  → all 150 hands must match the snapshot exactly.
//            This shows the new module's detection logic is the old logic.
//   Layer B  Same engine, CANON 2–4p deck → every corpus hand that can exist in the real
//            deck must still match exactly; every other hand must be rejected by
//            validateHand() with a named reason.
//   Layer C  Canon-only behaviour the old widget could not express (Echo, size cap, wild
//            declarations).

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { findSpells, validateHand, wholeHandSpell, canAdd } from '../assets/js/hand-checker.js';
import { BASE_RULES, deckProfile, points, castTier } from '../data/current.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT = path.resolve(here, '../../tests/hand-checker/golden-master.snapshot.json');
const snapshot = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));

export const INTENDED_DIFFERENCES = [
  'Values are 1–15 (deck ranks). The old keypad accepted 1–20; such cards are now rejected as value-out-of-range.',
  'A hand may hold at most the deck\'s wilds (2 at 2–4 players, 4 at 5–6). The old widget accepted any number.',
  'A deck holds one of each energy/value. The old widget accepted duplicate cards; they are now rejected as duplicate-card.',
  'No spell may exceed 15 components (canon max_spell_size). The old widget only clamped the points lookup.',
  'Echo is a legal energy in the 5–6 player deck only, and Enchantments may reach 5 components there. The old widget knew four energies and capped Enchantments at 4.',
  'Each wild in a result now carries a declaration (`as`: energy + value) limited to energies in the deck. The old widget returned bare wilds; the snapshot comparison ignores `as`.',
  'The module returns structured effects (kind/size → data/current.js castTier) instead of English sentences; this test rebuilds the old sentences from that structure to compare.',
  'The module returns `kind` only; display names come from the rules data. This test maps kind → the old names to compare.',
];

// ── Old-widget parameters (Layer A) ─────────────────────────────────────────────────
const LEGACY_DECK = {
  energies: ['radiance', 'void', 'flux', 'aether'],
  minValue: 1,
  maxValue: 20,
  wilds: Infinity,
  minSpellSize: 3,
  maxSpellSize: Infinity,
  enchantmentMax: 4,
  unique: false,
};
// Old rpFor(): table lookup clamped at 15, 0 when absent.
const legacyPoints = (kind, size) => points(kind, Math.min(size, 15), BASE_RULES) ?? 0;

const LEGACY_NAMES = {
  conjuration: 'Conjuration',
  transfiguration: 'Transfiguration',
  enchantment: 'Enchantment',
  perfect: 'Perfect Transmutation',
};

// Rebuild the old effect sentence from the structured tier in the rules data.
function legacyEffect(kind, size) {
  if (kind === 'perfect') return 'Cast: both Conjuration and Transfiguration effects, in order.';
  const tier = castTier(kind, Math.min(size, 15), BASE_RULES);
  if (kind === 'conjuration') {
    return `Cast: draw ${tier.draw} additional component${tier.draw === 1 ? '' : 's'} from the Source.`;
  }
  if (kind === 'transfiguration') return `Cast: discard ${tier.discard} from hand, take ${tier.take} from the Array.`;
  return `Always active: +${tier.counters} counter${tier.counters === 1 ? '' : 's'}.`;
}

const normalise = (card) => ({ e: card.e, v: card.v === undefined ? null : card.v });
const serialise = (result) => ({
  kind: result.kind,
  name: LEGACY_NAMES[result.kind],
  size: result.size,
  uses: result.uses.map(normalise),
  effect: legacyEffect(result.kind, result.size),
  rp: result.rp,
});

test('snapshot is the corpus this test was written against', () => {
  assert.equal(snapshot.corpusSize, 150);
  assert.equal(snapshot.entries.length, 150);
});

test('rules data still produces the cast effects and names the snapshot recorded', () => {
  // If this fails, the rules changed since the snapshot; the layers below would then be
  // comparing against stale text, so fail here with a clearer message.
  assert.equal(legacyEffect('conjuration', 3), 'Cast: draw 1 additional component from the Source.');
  assert.equal(legacyEffect('conjuration', 6), 'Cast: draw 2 additional components from the Source.');
  assert.equal(legacyEffect('transfiguration', 3), 'Cast: discard 2 from hand, take 1 from the Array.');
  assert.equal(legacyEffect('transfiguration', 4), 'Cast: discard 1 from hand, take 1 from the Array.');
  assert.equal(legacyEffect('enchantment', 3), 'Always active: +1 counter.');
  assert.equal(legacyEffect('enchantment', 4), 'Always active: +3 counters.');
  for (const [kind, name] of Object.entries(LEGACY_NAMES)) assert.equal(BASE_RULES.spells[kind].name, name);
});

test('Layer A — old parameters: all 150 corpus hands match the golden master exactly', () => {
  for (const [i, entry] of snapshot.entries.entries()) {
    const hand = entry.hand.map((c) => ({ ...c }));
    const actual = findSpells(hand, LEGACY_DECK, legacyPoints).map(serialise);
    assert.deepEqual(actual, entry.results, `corpus hand #${i} diverged under old parameters`);
  }
});

test('Layer B — canon 2–4p deck: legal hands match exactly; the rest are rejected with a reason', () => {
  const deck = deckProfile('2-4', BASE_RULES);
  const canonPoints = (kind, size) => points(kind, size, BASE_RULES);
  let legal = 0;
  const rejected = {};
  for (const [i, entry] of snapshot.entries.entries()) {
    const hand = entry.hand.map((c) => ({ ...c }));
    const issues = validateHand(hand, deck);
    if (issues.length) {
      for (const code of new Set(issues.map((x) => x.code))) rejected[code] = (rejected[code] || 0) + 1;
      continue;
    }
    legal += 1;
    const actual = findSpells(hand, deck, canonPoints).map(serialise);
    assert.deepEqual(actual, entry.results, `legal corpus hand #${i} diverged under the canon 2–4p deck`);
  }
  assert.ok(legal >= 30, `expected a meaningful number of deck-legal corpus hands, got ${legal}`);
  const known = ['value-out-of-range', 'too-many-wilds', 'duplicate-card'];
  for (const code of Object.keys(rejected)) assert.ok(known.includes(code), `unexpected rejection reason: ${code}`);
  console.log(`[equivalence] canon 2–4p: ${legal} of ${snapshot.entries.length} corpus hands are deck-legal and match exactly; ` +
    `rejected hands by reason (a hand can have several): ${JSON.stringify(rejected)}`);
});

test('Layer C — canon behaviour the old widget could not express', async (t) => {
  const base = deckProfile('2-4', BASE_RULES);
  const echo = deckProfile('5-6', BASE_RULES);
  const pts = (kind, size) => points(kind, size, BASE_RULES);
  const W = () => ({ e: 'wild', v: null });

  await t.test('deck profiles come from the rules data', () => {
    assert.deepEqual(base.energies, ['radiance', 'void', 'flux', 'aether']);
    assert.equal(base.wilds, 2);
    assert.equal(base.enchantmentMax, 4);
    assert.deepEqual(echo.energies, ['radiance', 'void', 'flux', 'aether', 'echo']);
    assert.equal(echo.wilds, 4);
    assert.equal(echo.enchantmentMax, 5);
    assert.equal(base.maxSpellSize, 15);
  });

  await t.test('Echo is rejected at 2–4 players and accepted at 5–6', () => {
    const hand = [{ e: 'echo', v: 7 }];
    assert.equal(validateHand(hand, base)[0].code, 'energy-not-in-deck');
    assert.deepEqual(validateHand(hand, echo), []);
    assert.equal(canAdd([], { e: 'echo', v: 7 }, base), false);
  });

  await t.test('2–4p: four 7s plus a wild is still a 4-component Enchantment', () => {
    const hand = ['radiance', 'void', 'flux', 'aether'].map((e) => ({ e, v: 7 })).concat([W()]);
    const ench = findSpells(hand, base, pts).find((r) => r.kind === 'enchantment');
    assert.equal(ench.size, 4);
    assert.equal(ench.rp, 10);
  });

  await t.test('2–4p: three 7s plus two wilds stops at 4, the wild declared as the missing energy', () => {
    const hand = ['radiance', 'void', 'flux'].map((e) => ({ e, v: 7 })).concat([W(), W()]);
    const ench = findSpells(hand, base, pts).find((r) => r.kind === 'enchantment');
    assert.equal(ench.size, 4);
    assert.deepEqual(ench.uses[3].as, { e: 'aether', v: 7 });
  });

  await t.test('5–6p: a 5-component Enchantment exists, with Echo or a wild declared as Echo', () => {
    const five = ['radiance', 'void', 'flux', 'aether', 'echo'].map((e) => ({ e, v: 9 }));
    const a = findSpells(five, echo, pts).find((r) => r.kind === 'enchantment');
    assert.equal(a.size, 5);
    assert.equal(a.rp, 16);
    const withWild = five.slice(0, 4).concat([W()]);
    const b = findSpells(withWild, echo, pts).find((r) => r.kind === 'enchantment');
    assert.equal(b.size, 5);
    assert.deepEqual(b.uses[4].as, { e: 'echo', v: 9 });
  });

  await t.test('no spell exceeds 15 components', () => {
    const all = Array.from({ length: 15 }, (_, i) => ({ e: 'void', v: i + 1 })).concat([W(), W()]);
    const results = findSpells(all, base, pts);
    for (const r of results) assert.ok(r.size <= 15, `${r.kind} size ${r.size}`);
    assert.equal(results.find((r) => r.kind === 'conjuration').rp, 100);
    assert.equal(results.find((r) => r.kind === 'perfect').rp, 100);
  });

  await t.test('wild declarations are legal: deck energy, value in range, no clash inside the spell', () => {
    const hand = [{ e: 'flux', v: 3 }, { e: 'flux', v: 5 }, { e: 'aether', v: 6 }, W(), W()];
    for (const r of findSpells(hand, base, pts)) {
      const ids = new Set();
      for (const c of r.uses) {
        const e = c.e === 'wild' ? c.as.e : c.e;
        const v = c.e === 'wild' ? c.as.v : c.v;
        assert.ok(base.energies.includes(e), `${r.kind}: declared energy ${e}`);
        assert.ok(v >= base.minValue && v <= base.maxValue, `${r.kind}: declared value ${v}`);
        assert.ok(!ids.has(e + ':' + v), `${r.kind}: duplicate ${e} ${v}`);
        ids.add(e + ':' + v);
      }
    }
  });

  await t.test('whole-hand verdict', () => {
    const run = [{ e: 'void', v: 5 }, { e: 'flux', v: 6 }, { e: 'radiance', v: 7 }];
    assert.equal(wholeHandSpell(run, findSpells(run, base, pts)).kind, 'transfiguration');
    const loose = run.concat([{ e: 'aether', v: 12 }]);
    assert.equal(wholeHandSpell(loose, findSpells(loose, base, pts)), null);
  });

  await t.test('runs do not wrap around', () => {
    const hand = [{ e: 'void', v: 14 }, { e: 'void', v: 15 }, { e: 'void', v: 1 }];
    assert.equal(findSpells(hand, base, pts).some((r) => r.kind === 'perfect' || r.kind === 'transfiguration'), false);
  });
});
