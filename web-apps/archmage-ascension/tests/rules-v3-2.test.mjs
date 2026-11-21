// Rules v3.2 checks for the digital build's engine + state machine (node --test).
// The game modules are browser IIFEs that register on `window`, so alias it first.
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis;
await import('../game/engine.js');
await import('../game/state.js');
const E = window.AAEngine;
const S = window.AAState;

const card = (suit, value, id) => ({ id: id || `${suit}${value}`, suit, value });
const wild = (id) => ({ id, suit: 'wild', value: 0 });

// Minimal in-progress state for the active player ('you').
function makeState({ phase = 'learning', hand = [], spellbook = [], counters = 1, source, array, reserve = [] } = {}) {
  const filler = (n, p) => Array.from({ length: n }, (_, i) => card('flux', (i % 15) + 1, `${p}${i}`));
  return {
    phase, drought: false, currentPlayer: 0, starter: 0, turnCount: 3,
    source: source || filler(20, 'src'),
    array: array || filler(5, 'arr'),
    reserve,
    players: [
      { id: 'you', name: 'Adept', isAI: false, hand, spellbook, counters, pendingCapacity: 0 },
      { id: 'archon', name: 'The Archon', isAI: true, hand: [], spellbook: [], counters: 1, pendingCapacity: 0 },
    ],
    collectionDone: true, castSpellsThisTurn: [], learningCountersUsed: 0,
    cauldron: [], pendingOpening: null, log: [], flash: null, lastAcquired: [],
  };
}
const spellOf = (id, cards, type) => ({ id, cards, spec: E.classifyAs(cards, type) });

test('A6 dropped: EMPOWER may convert a spell into an Enchantment (gain deferred)', () => {
  // Conjuration [Void 7, wild, wild] + Radiance 7 → Enchantment of four 7s.
  const sp = spellOf('sp1', [card('void', 7), wild('w1'), wild('w2')], 'conj');
  const s0 = makeState({ hand: [card('radiance', 7)], spellbook: [sp] });
  const s1 = S.reduce(s0, { type: 'EMPOWER', spellId: 'sp1', cards: ['radiance7'], spellType: 'ench' });
  const p = s1.players[0];
  assert.equal(p.spellbook[0].spec.type, 'ench');
  assert.equal(p.spellbook[0].cards.length, 4);
  assert.equal(p.pendingCapacity, 3, '4-card Enchantment grants +3 from next turn');
  assert.equal(p.counters, 1, 'not usable this turn');
});

test('A6 dropped: EMPOWER may convert an Enchantment into another type (loss immediate, gated)', () => {
  // Enchantment [Aether 8, wild, wild] (+1) + Aether 9 → Perfect Transmutation of 4.
  const sp = spellOf('sp1', [card('aether', 8), wild('w1'), wild('w2')], 'ench');
  const s0 = makeState({ hand: [card('aether', 9)], spellbook: [sp], counters: 2 });
  const s1 = S.reduce(s0, { type: 'EMPOWER', spellId: 'sp1', cards: ['aether9'], spellType: 'perf' });
  assert.equal(s1.players[0].spellbook[0].spec.type, 'perf');
  assert.equal(s1.players[0].counters, 1, 'Enchantment capacity (+1) lost immediately');

  // Same move with capacity 1 cannot pay action (1) + loss (1): blocked, nothing changes.
  const blocked = S.reduce(makeState({ hand: [card('aether', 9)], spellbook: [sp], counters: 1 }),
    { type: 'EMPOWER', spellId: 'sp1', cards: ['aether9'], spellType: 'perf' });
  assert.equal(blocked.players[0].spellbook[0].spec.type, 'ench');
  assert.equal(blocked.players[0].hand.length, 1);
});

test('A4 amended: components returned by UNLEARN can be learned the same turn', () => {
  const run = [card('void', 4), card('flux', 5), card('aether', 6)];
  const sp = spellOf('sp1', run, 'trans');
  const s0 = makeState({ hand: [], spellbook: [sp], counters: 2 });
  const s1 = S.reduce(s0, { type: 'UNLEARN', spellId: 'sp1' });
  assert.equal(s1.players[0].hand.length, 3);
  const s2 = S.reduce(s1, { type: 'LEARN', cards: run.map(c => c.id) });
  assert.equal(s2.players[0].spellbook.length, 1);
  assert.equal(s2.players[0].hand.length, 0);
  assert.equal(s2.learningCountersUsed, 2);
});

test('Flexible wilds: a sequence wild keeps its declared number when empowered', () => {
  // [wild, 5, 6]: the wild is declared 4 when learned.
  const sp = spellOf('sp1', [wild('w1'), card('void', 5), card('flux', 6)], 'trans');
  assert.deepEqual(sp.spec.declarations, { w1: { value: 4 } });
  // Adding a real 4 would need the wild to move to 7 — refused.
  const s1 = S.reduce(makeState({ hand: [card('aether', 4)], spellbook: [sp] }),
    { type: 'EMPOWER', spellId: 'sp1', cards: ['aether4'] });
  assert.equal(s1.players[0].spellbook[0].cards.length, 3);
  // Adding a 7 keeps the wild at 4.
  const s2 = S.reduce(makeState({ hand: [card('aether', 7)], spellbook: [sp] }),
    { type: 'EMPOWER', spellId: 'sp1', cards: ['aether7'] });
  assert.equal(s2.players[0].spellbook[0].cards.length, 4);
  assert.deepEqual(s2.players[0].spellbook[0].spec.declarations, { w1: { value: 4 } });
});

test('Flexible wilds: no energy declared; Conjuration/Enchantment wilds declare nothing; cap 4', () => {
  const tr = E.classifyAs([wild('w1'), card('void', 5), card('flux', 6)], 'trans');
  assert.equal(tr.declarations.w1.suit, undefined);
  assert.deepEqual(E.classifyAs([card('void', 2), card('void', 9), wild('w1')], 'conj').declarations, {});
  assert.deepEqual(E.classifyAs([card('void', 7), card('flux', 7), wild('w1')], 'ench').declarations, {});
  const five = [card('void', 7), card('flux', 7), card('aether', 7), card('radiance', 7), wild('w1')];
  assert.equal(E.classifyAs(five, 'ench'), null, 'Enchantment max 4 components at 2 players');
});

test('Source runs dry on a Conjuration draw: Drought begins, straight to Learning', () => {
  const sp = spellOf('sp1', [card('void', 2), card('void', 9), card('void', 13)], 'conj');
  const s0 = makeState({ phase: 'casting', spellbook: [sp], counters: 2, source: [card('flux', 1, 'last')] });
  const s1 = S.reduce(s0, { type: 'CAST_SPELL', spellId: 'sp1' });
  assert.equal(s1.drought, true);
  assert.equal(s1.phase, 'drought-learning');
  assert.equal(s1.array.length, 0);
  assert.equal(s1.reserve.length, 5, 'Array shuffled into the Released Reserve');
  assert.equal(s1.learningCountersUsed, 0, 'counters recalled');
});

test('Conjuration / Perfect Transmutation need the full draw (and refill) in the Source', () => {
  const big = spellOf('c6', [1, 2, 3, 4, 5, 6].map(v => card('void', v, `v${v}`)), 'conj');
  const s1 = S.reduce(makeState({ phase: 'casting', spellbook: [big], source: [card('flux', 1, 'x')] }),
    { type: 'CAST_SPELL', spellId: 'c6' });
  assert.equal(s1.players[0].hand.length, 0, 'no half draw');
  assert.equal(s1.castSpellsThisTurn.length, 0);

  const pt = spellOf('pt', [card('aether', 8), card('aether', 9), card('aether', 10)], 'perf');
  const hand = [card('flux', 1, 'h1'), card('flux', 2, 'h2')];
  const s2 = S.reduce(makeState({ phase: 'casting', hand, spellbook: [pt], source: [card('flux', 3, 'y')] }),
    { type: 'CAST_SPELL', spellId: 'pt' });
  assert.equal(s2.players[0].hand.length, 2, 'PT refused: Source holds draw but not the refill');
  assert.equal(s2.pendingTransfig, undefined);
});

test('Source runs dry on a Transfiguration Array refill: Drought begins', () => {
  const tr = spellOf('tr', [card('void', 4), card('flux', 5), card('aether', 6), card('radiance', 7)], 'trans');
  const s0 = makeState({ phase: 'casting', hand: [card('flux', 1, 'h1')], spellbook: [tr], counters: 2,
    source: [card('flux', 3, 'last')] });
  const s1 = S.reduce(s0, { type: 'CAST_SPELL', spellId: 'tr' });
  assert.ok(s1.pendingTransfig);
  const s2 = S.resolveTransfig(JSON.parse(JSON.stringify(s1)), ['h1'], 0);
  assert.equal(s2.drought, true);
  assert.equal(s2.phase, 'drought-learning');
});
