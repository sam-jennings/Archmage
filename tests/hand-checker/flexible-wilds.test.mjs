// Rules v3.2 flexible wilds + the 2–4 player Enchantment size cap, checked on the classic
// Full Rules Hand Checker (web-apps/archmage-reference.html), which models the 2–4p deck.
// The 5–6p side (5-card Enchantment allowed) and fixed wild numbers in runs are covered by
// the shared v2 checker tests in web-apps/v2/tests/.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { loadHandChecker } from './extract.mjs';

const { hc, hcFindSpells } = loadHandChecker();
const W = () => ({ e: 'wild', v: null });
const detect = (hand) => {
  hc.hand = hand.map((c) => ({ ...c }));
  return hcFindSpells();
};

test('a wild in an Enchantment needs no energy: one real 7 + two wilds is a 3-card Enchantment', () => {
  const ench = detect([{ e: 'radiance', v: 7 }, W(), W()]).find((s) => s.kind === 'enchantment');
  assert.ok(ench, 'an Enchantment is found');
  assert.equal(ench.size, 3);
  assert.equal(ench.rp, 4);
});

test('2–4 players: four 9s plus a wild is refused as a 5-card Enchantment (cap 4)', () => {
  const hand = ['radiance', 'void', 'flux', 'aether'].map((e) => ({ e, v: 9 })).concat([W()]);
  const enchs = detect(hand).filter((s) => s.kind === 'enchantment');
  assert.equal(enchs.length, 1);
  assert.equal(enchs[0].size, 4);
  assert.equal(enchs[0].rp, 10);
});
