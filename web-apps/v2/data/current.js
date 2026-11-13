// THE ONE PLACE THAT PICKS THE RULES VERSION.
// Rolling back to v3.0, or moving to v3.2, is: add data/rules.vX.Y.js and change the
// import on the next line. Nothing else in the site names a version file (sw.js lists it
// for offline caching; the check tool tells you if that list is stale).
import { RULES as BASE } from './rules.v3.1.js';
import { SITE } from './site.js';

const clone = (o) => JSON.parse(JSON.stringify(o));

function setPath(obj, path, value) {
  const keys = path.split('.');
  let node = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    node = node[keys[i]];
    if (node == null) throw new Error(`variant patch: bad path "${path}"`);
  }
  node[keys[keys.length - 1]] = value;
}

/** Return a copy of the base rules with the named variants applied. Base data is never mutated. */
export function withVariants(base, keys = []) {
  const rules = clone(base);
  rules.activeVariants = [];
  rules.variantNotes = {};
  for (const key of keys) {
    const variant = base.variants.find((v) => v.key === key);
    if (!variant) continue;
    rules.activeVariants.push(key);
    for (const patch of variant.patches || []) {
      if (patch.op === 'set') setPath(rules, patch.path, patch.value);
      else if (patch.op === 'note') (rules.variantNotes[patch.section] ||= []).push({ variant: variant.name, text: patch.text });
    }
  }
  return rules;
}

/** Variants switched on for this visit: ?variant=a,b in the URL, else the saved choice, else each variant's default. */
export function requestedVariants(base = BASE) {
  const defaults = base.variants.filter((v) => v.default).map((v) => v.key);
  if (typeof window === 'undefined') return defaults;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('variant');
    if (fromUrl != null) return fromUrl.split(',').map((s) => s.trim()).filter(Boolean);
    const saved = window.localStorage.getItem(SITE.storagePrefix + 'variants');
    if (saved != null) return JSON.parse(saved);
  } catch { /* storage or URL unavailable: fall through to defaults */ }
  return defaults;
}

export const RULES = withVariants(BASE, requestedVariants());
export { BASE as BASE_RULES, SITE };

// ── Helpers every page and the hand checker share ──────────────────────────────────

export const groupById = (id, rules = RULES) => rules.players.groups.find((g) => g.id === id) || rules.players.groups[0];

export const deckSize = (deck) => deck.energies.length * (deck.maxValue - deck.minValue + 1) + deck.wilds;

/** The largest Enchantment a deck allows: the ladder's top rung that this deck may use. */
export function enchantmentMax(deckKey, rules = RULES) {
  const sizes = rules.enchantmentLadder.filter((r) => !r.decks || r.decks.includes(deckKey)).map((r) => r.size);
  return Math.min(Math.max(...sizes), rules.decks[deckKey].energies.length);
}

/** Everything the hand checker needs to know about one deck. */
export function deckProfile(groupId, rules = RULES) {
  const group = groupById(groupId, rules);
  const deck = rules.decks[group.deck];
  return {
    group: group.id,
    deckKey: group.deck,
    energies: deck.energies.slice(),
    minValue: deck.minValue,
    maxValue: deck.maxValue,
    wilds: deck.wilds,
    minSpellSize: rules.limits.minSpellSize,
    maxSpellSize: rules.limits.maxSpellSize,
    enchantmentMax: enchantmentMax(group.deck, rules),
    unique: true, // a deck holds exactly one of each energy/value
  };
}

/** Recognition Points for a spell, or null if that size does not exist for that type. */
export function points(kind, size, rules = RULES) {
  const column = rules.scoreTable[kind];
  const index = rules.scoreTable.sizes.indexOf(size);
  if (!column || index < 0 || index >= column.length) return null;
  return column[index];
}

/** The cast-effect tier that applies to a spell of this type and size. */
export function castTier(kind, size, rules = RULES) {
  const cast = rules.spells[kind].cast;
  if (cast.kind === 'always-active') {
    const rung = rules.enchantmentLadder.find((r) => r.size === size);
    return { kind: 'always-active', counters: rung ? rung.counters : 0 };
  }
  if (cast.kind === 'both') return { kind: 'both', parts: cast.order.map((k) => castTier(k, size, rules)) };
  const tier = cast.tiers.find((t) => size >= t.min && size <= t.max);
  return { kind: cast.kind, ...tier };
}

/** Fill {placeholders} in a rule string from the data. */
export function fill(text, rules = RULES) {
  const deck = rules.decks.base;
  const dict = {
    title: SITE.title,
    goal: rules.goal,
    version: rules.version,
    minSpellSize: rules.limits.minSpellSize,
    maxSpellSize: rules.limits.maxSpellSize,
    minValue: deck.minValue,
    maxValue: deck.maxValue,
    handSize: rules.setup.handSize,
    arraySize: rules.setup.arraySize,
    openingDiscard: rules.setup.openingDiscard,
    enchantmentMaxAny: Math.max(...rules.enchantmentLadder.map((r) => r.size)),
    wildSummary: rules.wildRule.summary,
    wildEnchantment: rules.wildRule.enchantmentConsequence,
    capacityExample: rules.capacity.workedExample,
    droughtTrigger: rules.drought.trigger,
    droughtEnd: rules.drought.end,
    trialsSummary: rules.trials.summary,
    trialsStatus: rules.trials.statusNote,
    echoStatus: rules.decks.echo ? rules.decks.echo.statusNote : '',
  };
  let out = String(text);
  for (let pass = 0; pass < 2; pass++) {
    out = out.replace(/\{(\w+)\}/g, (m, key) => (key in dict ? String(dict[key]) : m));
  }
  return out;
}
