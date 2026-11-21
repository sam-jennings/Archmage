// Shared, DOM-free helpers for the explainer state machines. Node-safe: the tests import
// the explainers and these with no browser. Every rule fact is read from data/current.js;
// every legality question is answered by the shared hand checker.

import { RULES, deckProfile, points, castTier, groupById, fill, enchantmentMax } from '../../data/current.js';
import { findSpells, wholeHandSpell, validateHand, WILD } from '../../assets/js/hand-checker.js';
import { tx } from './strings.en.js';

export { RULES, WILD, points, tx, groupById };

/** Rule text from the data with its light markup removed (for captions). */
export const plain = (text) => fill(text).replace(/\*\*(.+?)\*\*|\*(.+?)\*/g, '$1$2').replace(/\[(.+?)\]\(.+?\)/g, '$1');

export const energyName = (key) => (key === WILD ? RULES.wild.name : RULES.energies.find((e) => e.key === key).name);
// A wild in a run carries only its declared number (`as: { v }`); elsewhere it carries nothing.
export const cardText = (card) => (card.e === WILD ? RULES.wild.name + (card.as && card.as.v != null ? ' (' + card.as.v + ')' : '') : energyName(card.e) + ' ' + card.v);
export const spellName = (kind) => RULES.spells[kind].name;

export const n = {
  counters: (count) => tx('counters', { n: count }),
  components: (count) => tx('components', { n: count }),
  pts: (count) => tx('pts', { n: count }),
};

export const deckOf = (group) => deckProfile(group);
export const startCounters = (group) => groupById(group).startingCounters;
export const maxEnchantment = (group) => enchantmentMax(groupById(group).deck);
export const minEnchantment = () => RULES.spells.enchantment.minSize;
/** Counters an Enchantment of this size grants (0 below the smallest rung). */
export const grant = (size) => (RULES.enchantmentLadder.find((rung) => rung.size === size) || { counters: 0 }).counters;
/** Counter cost of a learning action. */
export const actionCost = (key) => RULES.learning.find((a) => a.key === key).cost.counters;
export const action = (key) => RULES.learning.find((a) => a.key === key);

/**
 * Do exactly these cards form one valid spell in this deck? Asked of the shared hand
 * checker. A wild with a declared number (`as.v`, a run) is judged as a card of that
 * number: in the run's own energy when all its real cards share one, else any energy free
 * at that number. A wild with no declaration stays a wild (it is whatever the spell needs).
 * Returns { kind, size, pts } or null. `prefer` picks that type when the cards fit several.
 */
export function classify(cards, group, prefer) {
  const deck = deckProfile(group);
  const reals = cards.filter((c) => c.e !== WILD);
  const one = reals.length && reals.every((c) => c.e === reals[0].e) ? reals[0].e : null;
  const held = new Set(reals.map((c) => c.e + ':' + c.v));
  const asCard = (v) => {
    const e = one && !held.has(one + ':' + v) ? one : deck.energies.find((x) => !held.has(x + ':' + v));
    held.add(e + ':' + v);
    return { e, v };
  };
  const judged = cards.map((c) => (c.e === WILD && c.as && c.as.v != null ? asCard(c.as.v) : { e: c.e, v: c.v }));
  if (judged.length < deck.minSpellSize) return null;
  if (validateHand(judged, deck).length) return null;
  const found = findSpells(judged, deck, points).filter((r) => r.size === judged.length);
  const hit = found.find((r) => r.kind === prefer) || wholeHandSpell(judged, found);
  return hit ? { kind: hit.kind, size: hit.size, pts: hit.rp } : null;
}

/** The cast effect of a spell of this type and size, as a clause ("draw 1 extra…"). */
export function effectClause(kind, size) {
  const tier = castTier(kind, size);
  if (tier.kind === 'draw') return tx('effect.draw', { n: tier.draw });
  if (tier.kind === 'trade') return tx('effect.trade', tier);
  if (tier.kind === 'both') return tx('effect.both', { draw: tier.parts[0].draw, discard: tier.parts[1].discard, take: tier.parts[1].take });
  return '';
}

/** Small immutable-update helper: next state = old state + changes, notes cleared unless given. */
export const step = (state, changes) => ({ ...state, notes: [], ...changes });
