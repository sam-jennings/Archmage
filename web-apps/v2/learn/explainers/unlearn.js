// EXPLAINER 3 — Taking components back (Unlearn).
// Aha: one counter, one spell, any number of components — as long as what is left is
// still a spell. The remainder is judged live by the shared hand checker.
import { RULES, plain, tx, n, classify, grant, actionCost, spellName, step } from './kit.js';

export const id = 'unlearn';
const T = (key, vars) => tx(id + '.' + key, vars);

// Three spells to try. Cards are listed in run order where order matters.
export const PRESETS = [
  { kind: 'perfect', cards: [4, 5, 6, 7, 8].map((v) => ({ e: 'flux', v })) },
  { kind: 'transfiguration', cards: [{ e: 'void', v: 5 }, { e: 'flux', v: 6 }, { e: 'radiance', v: 7 }, { e: 'aether', v: 8 }, { e: 'void', v: 9 }] },
  { kind: 'conjuration', cards: [2, 5, 9, 13].map((v) => ({ e: 'void', v })) },
  { kind: 'enchantment', cards: ['radiance', 'void', 'flux', 'aether'].map((e) => ({ e, v: 7 })) },
];

/**
 * What taking these components back does. Pure: used by the explainer and by its test.
 * status: none | ok | retype | all | collapse
 *   retype   — what is left is a valid spell of a DIFFERENT type (a same-energy run with a
 *              hole is still a Conjuration). Allowed (ruling 1A, rulebook v3.3).
 *   collapse — what is left is not a valid spell, so the whole spell returns to hand. This
 *              includes one component pulled from inside a mixed-energy run.
 */
export function evaluate(preset, picked, group) {
  const cost = actionCost('unlearn');
  const cards = PRESETS[preset].cards;
  const kind = PRESETS[preset].kind;
  const taken = cards.filter((_, i) => picked.includes(i));
  const rest = cards.filter((_, i) => !picked.includes(i));
  const base = { cost, taken, rest, kind, from: kind === 'enchantment' ? grant(cards.length) : 0 };
  if (!picked.length) return { ...base, status: 'none' };
  if (!rest.length) return { ...base, status: 'all', to: 0, loss: base.from };
  const left = classify(rest, group, kind);
  if (left) {
    const to = left.kind === 'enchantment' ? grant(left.size) : 0;
    return { ...base, status: left.kind === kind ? 'ok' : 'retype', left, to, loss: base.from - to };
  }
  return { ...base, status: 'collapse', rest: [], taken: cards, to: 0, loss: base.from };
}

function describe(result) {
  const cost = n.counters(result.cost);
  const later = plain(RULES.learning.find((a) => a.key === 'unlearn').details[2]);
  if (result.status === 'none') return { say: T('pick'), notes: [] };
  if (result.status === 'all') return { say: T('all', { cost }) + (result.from ? ' ' + T('collapseEnch', { from: result.from }) : '') + ' ' + later, notes: [] };
  if (result.status === 'ok') {
    const ench = result.loss > 0 ? ' ' + T('okEnch', { from: result.from, to: result.to, loss: result.loss }) : '';
    return { say: T('ok', { spell: spellName(result.left.kind), size: n.components(result.left.size), pts: n.pts(result.left.pts), cost }) + ench + ' ' + later, notes: [] };
  }
  if (result.status === 'retype') {
    const vars = { was: spellName(result.kind), spell: spellName(result.left.kind), size: n.components(result.left.size), pts: n.pts(result.left.pts), cost };
    return { say: T('retype', vars) + ' ' + later, notes: [] };
  }
  return { say: T('collapse', { cost }) + (result.from ? ' ' + T('collapseEnch', { from: result.from }) : '') + ' ' + later, notes: [] };
}

export function init(group, preset = 0) {
  return { group, preset, picked: [], notes: [], say: T('pick') };
}

export function actions(s) {
  return PRESETS.map((p, i) => ({ id: 'spell:' + i, label: spellName(p.kind), pressed: i === s.preset, group: 'mode' }));
}

export function apply(s, actionId) {
  const [verb, arg] = actionId.split(':');
  if (verb === 'spell') return init(s.group, Number(arg));
  if (verb === 'toggle') {
    const index = Number(arg);
    const picked = s.picked.includes(index) ? s.picked.filter((i) => i !== index) : s.picked.concat([index]);
    return step(s, { picked, ...describe(evaluate(s.preset, picked, s.group)) });
  }
  return s;
}

export const result = (s) => evaluate(s.preset, s.picked, s.group);

export const facts = (s) => {
  const r = result(s);
  return [
    { label: T('cost'), value: r.status === 'none' ? '—' : n.counters(r.cost) },
    { label: T('back'), value: r.status === 'none' ? 0 : r.taken.length },
    { label: T('stays'), value: r.status === 'none' ? PRESETS[s.preset].cards.length : r.rest.length },
  ];
};

export function stage(s, kit, act) {
  const preset = PRESETS[s.preset];
  return [
    kit.spell({
      title: spellName(preset.kind), cards: preset.cards, picked: s.picked,
      onChip: (i) => act('toggle:' + i), badge: preset.kind === 'enchantment' ? '+' + grant(preset.cards.length) : null,
    }),
  ];
}
