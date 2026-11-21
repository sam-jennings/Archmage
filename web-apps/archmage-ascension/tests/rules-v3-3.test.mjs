// Rules v3.3 checks (rules-gaps rulings 1A, 2A, 3A) for the digital build (node --test).
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis;
await import('../game/engine.js');
await import('../game/state.js');
const E = window.AAEngine;
const S = window.AAState;

const card = (suit, value, id) => ({ id: id || `${suit}${value}`, suit, value });
const wild = (id) => ({ id, suit: 'wild', value: 0 });

function makeState({ hand = [], spellbook = [], counters = 1, pendingCapacity = 0, used = 0 } = {}) {
  return {
    phase: 'learning', drought: false, currentPlayer: 0, starter: 0, turnCount: 3,
    source: [], array: [], reserve: [],
    players: [
      { id: 'you', name: 'Adept', isAI: false, hand, spellbook, counters, pendingCapacity },
      { id: 'archon', name: 'The Archon', isAI: true, hand: [], spellbook: [], counters: 1, pendingCapacity: 0 },
    ],
    collectionDone: true, castSpellsThisTurn: [], learningCountersUsed: used,
    cauldron: [], pendingOpening: null, log: [], flash: null, lastAcquired: [],
  };
}
const spellOf = (id, cards, type) => ({ id, cards, spec: E.classifyAs(cards, type) });

test('1A: the middle of a Perfect Transmutation comes out and a Conjuration stays (1 counter)', () => {
  const run = [4, 5, 6, 7, 8].map((v) => card('flux', v));
  const s1 = S.reduce(makeState({ spellbook: [spellOf('pt', run, 'perf')] }), { type: 'UNLEARN', spellId: 'pt', cards: ['flux6'] });
  const p = s1.players[0];
  assert.equal(p.spellbook.length, 1);
  assert.equal(p.spellbook[0].spec.type, 'conj');
  assert.equal(p.spellbook[0].cards.length, 4);
  assert.deepEqual(p.hand.map((c) => c.id), ['flux6']);
  assert.equal(s1.learningCountersUsed, 1);
});

test('1A: the middle of a mixed run leaves no spell, so the whole spell returns to hand', () => {
  const run = [card('void', 5), card('flux', 6), card('radiance', 7), card('aether', 8), card('void', 9)];
  const s1 = S.reduce(makeState({ spellbook: [spellOf('tr', run, 'trans')] }), { type: 'UNLEARN', spellId: 'tr', cards: ['radiance7'] });
  assert.equal(s1.players[0].spellbook.length, 0);
  assert.equal(s1.players[0].hand.length, 5);
  assert.equal(s1.learningCountersUsed, 1);
});

test('1A: an end still comes off a run, and the type is re-read from what stays', () => {
  // Void 2,5,6,7,9 is a Conjuration; take the 2 and the 9 and Void 5-6-7 stays: a Perfect Transmutation.
  const conj = [2, 5, 6, 7, 9].map((v) => card('void', v));
  const s1 = S.reduce(makeState({ spellbook: [spellOf('c', conj, 'conj')] }), { type: 'UNLEARN', spellId: 'c', cards: ['void2', 'void9'] });
  assert.equal(s1.players[0].spellbook[0].spec.type, 'perf');
});

test('2A: Empower 3→4 then Unlearn back to 3 the same turn costs nothing but the two actions', () => {
  const sevens = [card('void', 7), card('flux', 7), card('aether', 7)];
  // Capacity 2 = 1 base + 1 from the 3-card Enchantment.
  let s = makeState({ hand: [card('radiance', 7)], spellbook: [spellOf('e', sevens, 'ench')], counters: 2 });
  s = S.reduce(s, { type: 'EMPOWER', spellId: 'e', cards: ['radiance7'] });
  assert.equal(s.players[0].pendingCapacity, 2, '+2 waits for next turn');
  s = S.reduce(s, { type: 'UNLEARN', spellId: 'e', cards: ['radiance7'] });
  const p = s.players[0];
  assert.equal(p.spellbook[0].cards.length, 3);
  assert.equal(p.counters, 2, 'capacity that had not arrived is not charged');
  assert.equal(p.pendingCapacity, 0, 'and it never arrives');
  assert.equal(s.learningCountersUsed, 2);
});

test('2A: an Unlearn that shrinks an Enchantment whose capacity has arrived still loses it now (gated)', () => {
  const sevens = [card('void', 7), card('flux', 7), card('aether', 7), card('radiance', 7)];
  const ench = spellOf('e', sevens, 'ench');
  const s1 = S.reduce(makeState({ spellbook: [ench], counters: 4 }), { type: 'UNLEARN', spellId: 'e', cards: ['radiance7'] });
  assert.equal(s1.players[0].counters, 2, '4-card (+3) to 3-card (+1): lose 2 now');
  const blocked = S.reduce(makeState({ spellbook: [ench], counters: 4, used: 2 }), { type: 'UNLEARN', spellId: 'e', cards: ['radiance7'] });
  assert.equal(blocked.players[0].spellbook[0].cards.length, 4, 'needs 1 + 2 free; only 2 free: blocked');
});

test('3A: an explicit type is ignored unless the spell holds two or more wilds', () => {
  // Void 5-6-7 is always a Perfect Transmutation, whatever the player asks for.
  const run = [5, 6, 7].map((v) => card('void', v));
  const s1 = S.reduce(makeState({ hand: run }), { type: 'LEARN', cards: run.map((c) => c.id), spellType: 'conj' });
  assert.equal(s1.players[0].spellbook[0].spec.type, 'perf');
  // Void 7 + two wilds can be read several ways: the owner names it.
  const two = [card('void', 7), wild('w1'), wild('w2')];
  const s2 = S.reduce(makeState({ hand: two }), { type: 'LEARN', cards: two.map((c) => c.id), spellType: 'ench' });
  assert.equal(s2.players[0].spellbook[0].spec.type, 'ench');
});

test('3A: Reshape honours a named type only for two-wild spells', () => {
  const a = spellOf('a', [5, 6, 7].map((v) => card('void', v)), 'perf');
  const s1 = S.reduce(makeState({ spellbook: [a] }), { type: 'RESHAPE', brokenSpellIds: ['a'], newSpells: [{ cards: ['void5', 'void6', 'void7'], type: 'conj' }] });
  assert.equal(s1.players[0].spellbook[0].spec.type, 'perf');
});
