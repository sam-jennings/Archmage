// EXPLAINER 6 — Reshape, as a worked example (not a free-form interaction).
// Shows the two things players need: the cost counts spells broken down, and a rebuild
// that strands components is not allowed. Validity is asked of the shared hand checker.
import { RULES, plain, tx, n, classify, actionCost, spellName, step } from './kit.js';

export const id = 'reshape';
const T = (key, vars) => tx(id + '.' + key, vars);

export const BEFORE = [
  [{ e: 'void', v: 3 }, { e: 'flux', v: 4 }, { e: 'radiance', v: 5 }],
  [{ e: 'aether', v: 6 }, { e: 'void', v: 7 }, { e: 'flux', v: 8 }],
];
const ALL = BEFORE.flat();
// Two ways to rebuild: X strands the last two components; Y uses every one.
export const REBUILDS = { x: [ALL.slice(0, 4), ALL.slice(4)], y: [ALL] };

export const cost = () => BEFORE.length * actionCost('reshape'); // one counter per spell broken down

export function verdict(choice, group) {
  const groups = REBUILDS[choice].map((cards) => ({ cards, spell: classify(cards, group) }));
  return { groups, legal: groups.every((g) => g.spell), stranded: groups.filter((g) => !g.spell).flatMap((g) => g.cards) };
}

export function init(group) {
  const pts = BEFORE.reduce((sum, cards) => sum + classify(cards, group).pts, 0);
  return { group, phase: 'before', choice: null, before: pts, notes: [], say: T('before', { pts: n.pts(pts) }) };
}

export function actions(s) {
  if (s.phase === 'before') return [{ id: 'break', label: T('breakBoth'), primary: true }];
  const x = { id: 'x', label: T('optX', { a: REBUILDS.x[0].length, b: REBUILDS.x[1].length }), pressed: s.choice === 'x' };
  const y = { id: 'y', label: T('optY', { n: ALL.length }), pressed: s.choice === 'y' };
  return [x, y];
}

export function apply(s, actionId) {
  if (actionId === 'break') {
    return step(s, { phase: 'broken', say: T('broken', { cost: n.counters(cost()), n: ALL.length }) + ' ' + plain(RULES.learning.find((a) => a.key === 'reshape').details[1]), notes: [{ kind: 'unclear', text: T('moveNote') }] });
  }
  if (actionId === 'x' || actionId === 'y') {
    const v = verdict(actionId, s.group);
    if (!v.legal) return step(s, { phase: 'result', choice: actionId, say: T('illegal', { n: v.stranded.length }) });
    const spell = v.groups[0].spell;
    return step(s, { phase: 'result', choice: actionId, say: T('legal', { spell: spellName(spell.kind), size: n.components(spell.size), pts: n.pts(spell.pts), cost: n.counters(cost()) }) + ' ' + T('wilds') });
  }
  return s;
}

export const facts = (s) => [
  { label: RULES.learning.find((a) => a.key === 'reshape').name, value: s.phase === 'before' ? '—' : n.counters(cost()) },
];

export function stage(s, kit) {
  if (s.phase === 'before') return BEFORE.map((cards) => kit.spell({ title: spellName(classify(cards, s.group).kind), cards }));
  if (s.phase === 'broken') return [kit.loose(ALL)];
  return verdict(s.choice, s.group).groups.map((g) => (g.spell ? kit.spell({ title: spellName(g.spell.kind), cards: g.cards, badge: n.pts(g.spell.pts) }) : kit.loose(g.cards, T('notSpell'))));
}
