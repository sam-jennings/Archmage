// Spellbook entry: cards → a spell, checked by the SHARED hand checker
// (assets/js/hand-checker.js), and a table-wide check that no card is in two places.
// Pure: the deck profile and the points function are passed in.

import { findSpells, validateHand, WILD } from '../assets/js/hand-checker.js';

// Hand-checker spell kinds ↔ the Trials engine's spell types.
export const TYPE_OF_KIND = { conjuration: 'conjuration', transfiguration: 'transfiguration', enchantment: 'enchantment', perfect: 'perfect_transmutation' };
export const KIND_OF_TYPE = Object.fromEntries(Object.entries(TYPE_OF_KIND).map(([k, v]) => [v, k]));
const NEEDS_ENERGY = ['conjuration', 'perfect_transmutation'];

/**
 * What these cards are, if together they are exactly one spell.
 * @returns { issues, options } — `options` lists every spell type that uses ALL the cards,
 *          best Recognition Points first: [{ type, kind, size, energy_domain, rp, uses }].
 */
export function readCards(cards, deck, points) {
  const issues = validateHand(cards, deck);
  if (issues.length || cards.length < deck.minSpellSize) return { issues, options: [] };
  const options = findSpells(cards, deck, points)
    .filter((r) => r.size === cards.length)
    .map((r) => {
      const real = r.uses.find((c) => c.e !== WILD);
      const type = TYPE_OF_KIND[r.kind];
      return { type, kind: r.kind, size: r.size, energy_domain: NEEDS_ENERGY.includes(type) ? real.e : null, rp: r.rp, uses: r.uses };
    });
  return { issues, options };
}

/** A spell record for the engine. `cards` is null for a spell entered by type and size. */
export function makeSpell(id, option, cards = null) {
  return { id, type: option.type, size: option.size, energy_domain: option.energy_domain || null, cards: cards ? cards.map((c) => ({ e: c.e, v: c.v })) : null };
}

/** Problems with one spell entered by type and size. Empty = fine. */
export function checkQuickSpell(spell, deck) {
  const issues = [];
  const max = spell.type === 'enchantment' ? deck.enchantmentMax : deck.maxSpellSize;
  if (!Number.isInteger(spell.size) || spell.size < deck.minSpellSize || spell.size > max) issues.push({ code: 'size-out-of-range', min: deck.minSpellSize, max });
  if (NEEDS_ENERGY.includes(spell.type) && !deck.energies.includes(spell.energy_domain)) issues.push({ code: 'energy-not-in-deck', energy: spell.energy_domain });
  return issues;
}

/**
 * Table-wide check. One deck holds one of each card, so a card entered in two spells
 * (in one Spellbook or across two) is an entry mistake worth catching before allocation.
 * @param books [{ playerId, spells }]
 * @returns [{ code: 'duplicate-card', card, where: [{ playerId, spellId }] } |
 *           { code: 'too-many-wilds', count, max } |
 *           { code: 'spell', playerId, spellId, issue }]
 */
export function checkTable(books, deck) {
  const issues = [];
  const seen = new Map();
  let wilds = 0;
  for (const { playerId, spells } of books) {
    for (const spell of spells) {
      if (!spell.cards) {
        for (const issue of checkQuickSpell(spell, deck)) issues.push({ code: 'spell', playerId, spellId: spell.id, issue });
        continue;
      }
      for (const issue of validateHand(spell.cards, { ...deck, wilds: Infinity })) issues.push({ code: 'spell', playerId, spellId: spell.id, issue });
      for (const card of spell.cards) {
        if (card.e === WILD) { wilds += 1; continue; }
        const key = card.e + ':' + card.v;
        if (!seen.has(key)) seen.set(key, { card, where: [] });
        seen.get(key).where.push({ playerId, spellId: spell.id });
      }
    }
  }
  for (const { card, where } of seen.values()) if (where.length > 1) issues.push({ code: 'duplicate-card', card, where });
  if (wilds > deck.wilds) issues.push({ code: 'too-many-wilds', count: wilds, max: deck.wilds });
  return issues;
}

/** Cards already used anywhere at the table, as 'energy:value' keys, plus the wild count. */
export function usedCards(books) {
  const keys = new Set();
  let wilds = 0;
  for (const { spells } of books) for (const spell of spells) for (const card of spell.cards || []) { if (card.e === WILD) wilds += 1; else keys.add(card.e + ':' + card.v); }
  return { keys, wilds };
}
