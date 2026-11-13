// EXPLAINER 1 — Counters through a turn.
// Aha: cast one spell or all of them — after the Recall you hold every counter again.
// Pure state machine: init → actions → apply. `stage` only arranges what the engine draws.
import { RULES, plain, tx, n, classify, effectClause, startCounters, grant, actionCost, spellName, step } from './kit.js';

export const id = 'turn-counters';
const T = (key, vars) => tx(id + '.' + key, vars);

// The example Spellbook: one Enchantment (always active) and two castable spells.
export const BOOK = [
  [{ e: 'radiance', v: 7 }, { e: 'void', v: 7 }, { e: 'flux', v: 7 }],
  [{ e: 'void', v: 2 }, { e: 'void', v: 5 }, { e: 'void', v: 9 }],
  [{ e: 'aether', v: 10 }, { e: 'flux', v: 11 }, { e: 'radiance', v: 12 }, { e: 'aether', v: 13 }],
];

export function init(group) {
  const spells = BOOK.map((cards) => ({ cards, ...classify(cards, group) }));
  const enchantment = spells.find((s) => s.kind === 'enchantment');
  const start = startCounters(group);
  const capacity = start + grant(enchantment.size);
  return {
    group, spells, capacity, start, phase: 'collection', pool: capacity, cast: [], spent: 0, notes: [],
    say: T('start', { capacity: n.counters(capacity), start, grant: grant(enchantment.size) }),
  };
}

export function actions(s) {
  if (s.phase === 'collection') return [{ id: 'collect', label: RULES.turn.normal[0].name, primary: true }];
  if (s.phase === 'casting') {
    return s.spells.map((spell, i) => ({ id: 'cast:' + i, label: T('cast', { spell: spellName(spell.kind) }), stage: true }))
      .concat([{ id: 'recall', label: T('recall'), primary: true }]);
  }
  if (s.phase === 'learning') {
    return RULES.learning.map((a) => ({ id: 'act:' + a.key, label: a.name, disabled: s.pool < a.cost.counters }))
      .concat([{ id: 'end', label: T('end'), primary: true }]);
  }
  return [{ id: 'again', label: T('again'), primary: true }];
}

export function apply(s, actionId) {
  const [verb, arg] = actionId.split(':');
  if (verb === 'collect') return step(s, { phase: 'casting', say: plain(RULES.turn.normal[0].short) + ' ' + T('collected') });
  if (verb === 'cast') {
    const index = Number(arg);
    const spell = s.spells[index];
    // Enchantments are never cast: answer with the rule itself and change nothing.
    if (RULES.spells[spell.kind].cast.kind === 'always-active') return step(s, { say: plain(RULES.spells.enchantment.note) });
    if (s.cast.includes(index)) return step(s, { say: T('castTwice') });
    if (s.pool < 1) return step(s, { say: T('castNone') });
    const pool = s.pool - 1;
    return step(s, { pool, cast: s.cast.concat([index]), say: T('castDone', { spell: spellName(spell.kind), effect: effectClause(spell.kind, spell.size), left: n.counters(pool) }) });
  }
  if (verb === 'recall') {
    return step(s, { phase: 'learning', pool: s.capacity, say: T('recalled', { cast: s.cast.length, capacity: s.capacity }), recalled: s.cast.length, cast: [] });
  }
  if (verb === 'act') {
    const a = RULES.learning.find((x) => x.key === arg);
    if (s.pool < a.cost.counters) return step(s, { say: T('castNone') });
    const pool = s.pool - a.cost.counters;
    return step(s, { pool, spent: s.spent + a.cost.counters, say: T('acted', { action: a.name, short: plain(a.short), cost: n.counters(a.cost.counters), left: n.counters(pool) }) });
  }
  if (verb === 'end') return step(s, { phase: 'end', say: T('ended', { capacity: s.capacity, reminder: plain(RULES.keyReminders[2]) }) });
  if (verb === 'again') return init(s.group);
  return s;
}

export const facts = (s) => [
  { label: T('capacity'), value: n.counters(s.capacity) },
  { label: T('pool'), value: s.pool },
  s.phase === 'learning' || s.phase === 'end' ? { label: T('spent'), value: s.spent } : { label: T('onSpells'), value: s.cast.length },
];

export function stage(s, kit, act) {
  const phases = RULES.turn.normal;
  const current = { collection: 0, casting: 1, learning: 3, end: 3 }[s.phase];
  return [
    kit.track(phases.map((p) => p.name), current),
    kit.pool(T('pool'), s.pool, s.capacity),
    s.spells.map((spell, i) => kit.spell({
      title: spellName(spell.kind), cards: spell.cards, counter: s.cast.includes(i),
      onTap: s.phase === 'casting' ? () => act('cast:' + i) : null, tapLabel: T('cast', { spell: spellName(spell.kind) }),
    })),
  ];
}
