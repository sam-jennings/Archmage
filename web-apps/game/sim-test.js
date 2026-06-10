#!/usr/bin/env node
/* Headless regression test: unit-checks the rules engine, then plays full
 * AI-vs-AI games at every player count (2-7) and asserts the rules hold
 * all the way through to scoring.   Run:  node sim-test.js
 */
'use strict';
const E = require('./engine.js');
const AI = require('./ai.js');

let failures = 0;
function check(cond, msg) {
  if (!cond) { failures++; console.error('  FAIL: ' + msg); }
}
function card(suit, value) { return { id: suit[0] + value, suit, value }; }
function wild(n) { return { id: 'w' + n, suit: 'wild', value: 0 }; }
function types(cards, maxValue) {
  return E.validTypes(cards, maxValue || 15).map(o => o.type).sort();
}

/* ---------------- unit tests: validation ---------------- */
console.log('Unit tests: spell validation');
check(types([card('void', 2), card('void', 5), card('void', 9)]).join() === 'conjuration',
  'same suit, non-sequential -> conjuration only');
check(types([card('void', 5), card('flux', 6), card('radiance', 7)]).join() === 'transfiguration',
  'mixed-suit run -> transfiguration only');
check(types([card('aether', 8), card('aether', 9), card('aether', 10)]).join() === 'conjuration,perfect,transfiguration',
  'same-suit run -> all three castable types');
check(types([card('radiance', 7), card('void', 7), card('flux', 7)]).join() === 'enchantment',
  'three 7s -> enchantment only');
check(types([card('radiance', 7), card('void', 7), card('flux', 7), card('aether', 7)]).join() === 'enchantment',
  'four 7s -> enchantment');
check(types([card('void', 1), card('void', 2)]).length === 0, '2 cards -> nothing');
check(types([card('void', 14), card('void', 15), card('flux', 1)]).length === 0,
  'no wrap-around runs');
// wilds
check(types([card('void', 5), card('void', 7), wild(1)]).join() === 'conjuration,perfect,transfiguration',
  'wild fills the 6 in a void 5-7 run, or counts as any void for conjuration');
check(types([card('void', 7), card('flux', 7), wild(1)]).join() === 'enchantment',
  'wild as third suit of 7 -> enchantment only (duplicate values can never run)');
check(types([card('void', 14), card('flux', 15), wild(1)]).includes('transfiguration'),
  'wild extends 14-15 downward to 13 when 16 does not exist');
check(!types([card('void', 7), card('flux', 7), card('void', 8)]).length,
  'duplicate values cannot form a run or anything else');
check(types([wild(1), wild(2), card('void', 3)], 15).length > 0, 'two wilds + one card is learnable');
check(types([wild(1), wild(2), wild(3)], 20).length === 0, 'all-wild spells are not allowed');
const ench5 = [card('radiance', 7), card('void', 7), card('flux', 7), card('aether', 7), wild(1)];
check(!types(ench5).includes('enchantment'), 'enchantments cap at 4 cards');

/* ---------------- unit tests: scoring ---------------- */
console.log('Unit tests: scoring table');
const expect = {
  conjuration: { 3: 3, 4: 4, 5: 6, 6: 9, 7: 13, 8: 18, 9: 24, 10: 31, 11: 39, 12: 48, 13: 58, 14: 69, 15: 81 },
  transfiguration: { 3: 5, 4: 7, 5: 10, 6: 14, 7: 19, 8: 25, 9: 32, 10: 40, 11: 49, 12: 59, 13: 70, 14: 82, 15: 95 },
  perfect: { 3: 7, 4: 10, 5: 14, 6: 19, 7: 25, 8: 32, 9: 40, 10: 49, 11: 59, 12: 70, 13: 82, 14: 95, 15: 109 },
  enchantment: { 3: 6, 4: 15 }
};
for (const t of Object.keys(expect)) {
  for (const n of Object.keys(expect[t])) {
    check(E.spellPoints(t, +n) === expect[t][n],
      t + ' size ' + n + ': got ' + E.spellPoints(t, +n) + ' want ' + expect[t][n]);
  }
}

/* ---------------- invariant helpers ---------------- */
function allCards(state) {
  const zones = [state.source, state.array, state.reserve];
  const cards = [];
  zones.forEach(z => cards.push.apply(cards, z));
  state.players.forEach(p => {
    cards.push.apply(cards, p.hand);
    p.spellbook.forEach(s => cards.push.apply(cards, s.cards));
  });
  return cards;
}
function checkInvariants(state, deckSize, label) {
  const cards = allCards(state);
  check(cards.length === deckSize, label + ': card conservation (' + cards.length + '/' + deckSize + ')');
  check(new Set(cards.map(c => c.id)).size === cards.length, label + ': no duplicated cards');
  for (const p of state.players) {
    for (const s of p.spellbook) {
      const ok = E.validTypes(s.cards, state.maxValue).some(o => o.type === s.type);
      check(ok, label + ': ' + p.name + ' holds an invalid ' + s.type +
        ' [' + s.cards.map(c => c.id).join(',') + ']');
    }
    check(E.capacity(p) >= 1, label + ': capacity >= 1');
  }
}

/* ---------------- full-game simulations ---------------- */
console.log('Simulations: full AI games, player counts 2-7');
const NAMES = ['Archon', 'Lyra', 'Thessaly', 'Morvane', 'Quillon', 'Iskra', 'Vex'];
for (let count = 2; count <= 7; count++) {
  for (let seed = 1; seed <= 4; seed++) {
    const players = NAMES.slice(0, count).map(n => ({ name: n, isAI: true }));
    const state = E.newGame({ players, seed: seed * 7919 + count });
    const deckSize = count <= 4 ? 62 : 84;
    const label = count + 'p seed ' + seed;
    let steps = 0, stuck = 0;
    while (state.phase !== 'over' && steps < 60000) {
      const action = AI.nextAction(state);
      const r = E.dispatch(state, action);
      if (!r.ok) {
        stuck++;
        check(false, label + ': AI produced illegal action ' + JSON.stringify(action) + ' -> ' + r.error);
        if (stuck >= 3) break;
        // recovery: try to push the turn forward
        if (state.phase === 'casting') E.dispatch(state, { kind: 'finishCasting' });
        else if (state.phase === 'learning') E.dispatch(state, { kind: 'endTurn' });
        else break;
      } else stuck = 0;
      if (steps % 40 === 0) checkInvariants(state, deckSize, label);
      steps++;
    }
    check(state.phase === 'over', label + ': game reached the final evaluation (phase=' + state.phase + ')');
    checkInvariants(state, deckSize, label + ' (final)');
    if (state.phase === 'over') {
      const r = state.result;
      check(r && r.ranking.length === count, label + ': scoring covers all players');
      check(r.winners.length >= 1, label + ': at least one winner');
      const recount = r.ranking.map(row =>
        row.spells.reduce((t, s) => t + s.points, 0) === row.total).every(Boolean);
      check(recount, label + ': per-spell points sum to totals');
      const w = r.ranking[0];
      console.log('  ' + label + ': ' + steps + ' actions, ' + state.turnNumber +
        ' turns, winner ' + state.players[r.winners[0]].name + ' with ' + w.total + ' RP (' +
        r.ranking.map(x => x.total).join('/') + ')');
    }
  }
}

if (failures) {
  console.error('\n' + failures + ' check(s) FAILED');
  process.exit(1);
}
console.log('\nAll checks passed.');
