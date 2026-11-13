// EXPLAINER 5 — The Drought, as a timeline you can step or scrub through.
// Aha: the discard pile you fed all game becomes the last deck. Spells stop; Enchantments do not.
// Pile sizes are derived from the rules data for the smallest table of the chosen player group.
import { RULES, plain, tx, groupById, step } from './kit.js';
import { deckSize } from '../../data/current.js';

export const id = 'drought';
const T = (key, vars) => tx(id + '.' + key, vars);

/** The frames of the timeline. Pure: the test checks the arithmetic against the rules data. */
export function frames(group) {
  const g = groupById(group);
  const S = RULES.setup;
  const players = g.min;
  const source0 = deckSize(RULES.decks[g.deck]) - players * S.handSize - S.arraySize;
  const reserve0 = players * S.openingDiscard;
  const late = reserve0 + S.arraySize * 2; // an example: any number of discards could be here
  const released = S.arraySize + late;
  const D = RULES.drought;
  const f = (key, piles, extra = {}) => ({ key, ...piles, ...extra });
  return [
    f('setup', { source: source0, array: S.arraySize, reserve: reserve0, released: null }, { say: T('setup', { players, source: source0, reserve: reserve0, opening: S.openingDiscard }) }),
    f('late', { source: 2, array: S.arraySize, reserve: late, released: null }, { say: T('late'), example: true }),
    f('last', { source: 1, array: S.arraySize, reserve: late, released: null }, { say: T('last', { n: 1 }), example: true }),
    f('dry', { source: 0, array: S.arraySize, reserve: late, released: null }, { say: T('dry', { trigger: D.trigger }), note: T('dryNote'), example: true }),
    f('release', { source: null, array: null, reserve: null, released }, { say: T('release', { array: S.arraySize, reserve: late, released }) + ' ' + plain(D.steps[3]), example: true }),
    f('turn', { source: null, array: null, reserve: null, released: released - 1 }, { say: RULES.turn.drought.map((p) => p.name + ': ' + plain(p.short)).join(' '), turn: true, example: true }),
    f('works', { source: null, array: null, reserve: null, released: released - 1 }, { say: T('works'), works: true, example: true }),
    f('low', { source: null, array: null, reserve: null, released: 1 }, { say: T('low', { n: 1 }), example: true }),
    f('end', { source: null, array: null, reserve: null, released: 0 }, { say: T('end', { end: plain(D.end) }), note: T('endNote'), example: true }),
  ];
}

const at = (s, i) => {
  const list = frames(s.group);
  const index = Math.max(0, Math.min(i, list.length - 1));
  const frame = list[index];
  return step(s, { i: index, total: list.length, say: frame.say, notes: frame.note ? [{ kind: 'unclear', text: frame.note }] : [] });
};

export const init = (group) => at({ group }, 0);
export const frame = (s) => frames(s.group)[s.i];

export function actions(s) {
  return s.i < s.total - 1 ? [{ id: 'next', label: T('next'), primary: true }] : [];
}

export function apply(s, actionId) {
  const [verb, arg] = actionId.split(':');
  if (verb === 'next') return at(s, s.i + 1);
  if (verb === 'goto') return at(s, Number(arg));
  return s;
}

export const scrub = (s) => ({ value: s.i, max: s.total - 1, label: T('step', { n: s.i + 1, total: s.total }) });

// The piles on the stage are already text (name + count), so no separate facts row.
export const facts = () => [];

export function stage(s, kit) {
  const fr = frame(s);
  const piles = fr.released == null
    ? [{ name: T('source'), count: fr.source, tone: 'source' }, { name: T('array'), count: fr.array, tone: 'array' }, { name: T('reserve'), count: fr.reserve, tone: 'reserve' }]
    : [{ name: T('source'), count: null }, { name: T('array'), count: null }, { name: T('released'), count: fr.released, tone: 'released' }];
  return [
    kit.piles(piles, T('gone')),
    fr.example ? kit.label(tx('frame.example')) : null,
    fr.turn ? kit.steps(RULES.turn.drought) : null,
    fr.works ? kit.works(RULES.drought.whyNoCasting) : null,
  ];
}
