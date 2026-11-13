// EXPLAINER 4 — Declaring a wild.
// Aha (rules v3.2, flexible wilds): a wild never declares an energy. In a run it declares a
// number, and that number holds until the spell is rebuilt. In an Enchantment it declares
// nothing; only the player-count size cap limits it. Two scenes: a run, and an Enchantment.
// Every "does this make a spell?" is asked of the shared hand checker (kit.classify).
import { RULES, WILD, plain, tx, n, classify, deckOf, grant, actionCost, maxEnchantment, spellName, cardText, groupById, step } from './kit.js';

export const id = 'wild-declaration';
const T = (key, vars) => tx(id + '.' + key, vars);

export const RUN = [{ e: 'void', v: 5 }, { e: 'radiance', v: 6 }];
export const ENCH_VALUE = 7;
const wild = (as) => ({ e: WILD, v: null, as: as || null });
const reals = (cards) => cards.filter((c) => c.e !== WILD);
const span = (cards) => { const vs = reals(cards).map((c) => c.v); return { lo: Math.min(...vs), hi: Math.max(...vs) }; };
const groupText = (group) => groupById(group).id.replace('-', '–');

/** Numbers offered for the wild in the run scene: one below, one above, and one that leaves a gap. */
export function valueOptions(cards) {
  const { lo, hi } = span(cards);
  return [lo - 1, hi + 1, hi + 2];
}
/** Can a wild join this Enchantment? Only the size cap decides: a wild needs no energy. */
export const enchantmentCanGrow = (cards, group) => cards.length < maxEnchantment(group);

const withWild = (cards, as) => cards.map((c) => (c.e === WILD ? wild(as) : c));
const valuesText = (cards, as) => reals(cards).map((c) => c.v).concat([as.v]).sort((a, b) => a - b).join(', ');

function runScene(group) {
  return { group, scene: 'run', phase: 'declare', cards: RUN.concat([wild()]), pick: { v: null }, rebuilt: false, notes: [], say: T('runStart') };
}
function enchScene(group) {
  // The Enchantment holds one card of value 7 from each of the four base energies. Whether a
  // wild can join depends only on the size cap for this player count.
  const cards = RULES.decks.base.energies.map((e) => ({ e, v: ENCH_VALUE }));
  const max = maxEnchantment(group);
  const base = { group, scene: 'ench', phase: 'ask', cards, notes: [] };
  const start = T('enchStart', { count: cards.length, v: ENCH_VALUE });
  return enchantmentCanGrow(cards, group)
    ? { ...base, say: start + ' ' + T('enchPick', { group: groupText(group), max, v: ENCH_VALUE }) }
    : { ...base, phase: 'no', say: start + ' ' + T('enchNone', { group: groupText(group), max }) };
}

export const init = (group) => runScene(group);

/** The spell the cards make with the wild declared as number `as.v`, or null. */
export const judge = (s, as) => classify(withWild(s.cards, as), s.group);
const declared = (s) => s.cards.find((c) => c.e === WILD && c.as)?.as || null;

/** The two Empower attempts offered once the wild is fixed: one that fits, one that needs the wild to move. */
export function empowerOffers(s) {
  const as = declared(s);
  const { lo, hi } = span(s.cards);
  const fitsValue = as.v > hi ? as.v + 1 : as.v - 1;
  const energies = deckOf(s.group).energies;
  const energyFor = (v) => energies.find((e) => !reals(s.cards).some((c) => c.e === e && c.v === v)) || energies[0];
  return { fits: { e: energyFor(fitsValue), v: fitsValue }, clash: { e: energyFor(as.v), v: as.v }, lo, hi };
}

export function actions(s) {
  const scenes = [
    { id: 'scene:run', label: T('sceneRun'), pressed: s.scene === 'run', group: 'mode' },
    { id: 'scene:ench', label: T('sceneEnch'), pressed: s.scene === 'ench', group: 'mode' },
  ];
  const out = scenes.slice();
  if (s.scene === 'ench') {
    if (s.phase === 'ask') out.push({ id: 'ench:add', label: T('enchAdd'), primary: true });
    return out;
  }
  if (s.phase === 'declare') {
    valueOptions(s.cards).forEach((v) => out.push({ id: 'v:' + v, label: T('value', { v }), pressed: s.pick.v === v, group: 'value' }));
    out.push({ id: 'learn', label: T('learn'), primary: true, disabled: !(s.pick.v != null && judge(s, s.pick)) });
  } else if (s.phase === 'fixed') {
    const offers = empowerOffers(s);
    out.push({ id: 'add:fits', label: T('add', { card: cardText(offers.fits) }) });
    out.push({ id: 'add:clash', label: T('add', { card: cardText(offers.clash) }) });
    out.push({ id: 'rebuild', label: T('rebuild'), primary: true });
  } else {
    out.push({ id: 'again', label: T('again'), primary: true });
  }
  return out;
}

export function apply(s, actionId) {
  const [verb, arg] = actionId.split(':');
  if (verb === 'scene') return arg === 'ench' ? enchScene(s.group) : runScene(s.group);
  if (verb === 'again') return runScene(s.group);
  if (s.scene === 'ench') {
    if (verb !== 'ench' || s.phase !== 'ask' || !enchantmentCanGrow(s.cards, s.group)) return s;
    const cards = s.cards.concat([wild()]); // no declaration: it takes the Enchantment's value
    const spell = classify(cards, s.group);
    return step(s, { phase: 'done', cards, say: T('enchDone', { size: spell.size, grant: grant(spell.size), pts: n.pts(spell.pts) }) + ' ' + plain(RULES.capacity.timing[0]), notes: s.notes });
  }
  if (verb === 'v') {
    if (s.phase !== 'declare') return s;
    const pick = { v: Number(arg) };
    const spell = judge(s, pick);
    return step(s, { pick, say: spell
      ? T('valid', { spell: spellName(spell.kind), size: n.components(spell.size), v: pick.v })
      : T('invalid', { values: valuesText(s.cards, pick) }) });
  }
  if (verb === 'learn') {
    if (s.phase !== 'declare' || s.pick.v == null || !judge(s, s.pick)) return s;
    const cards = withWild(s.cards, s.pick);
    return step(s, { phase: s.rebuilt ? 'done' : 'fixed', cards, say: s.rebuilt ? T('done', { v: s.pick.v }) : T('learned', { v: s.pick.v }) + ' ' + plain(RULES.wildRule.lines[2]) });
  }
  if (verb === 'add' && s.phase === 'fixed') {
    const as = declared(s);
    const card = empowerOffers(s)[arg];
    const cards = s.cards.concat([card]);
    const spell = classify(cards, s.group); // the wild keeps the number it was declared as
    if (!spell) return step(s, { say: T('blockedAdd', { v: as.v, card: cardText(card) }) + ' ' + plain(RULES.learning.find((a) => a.key === 'empower').details[2]) });
    return step(s, { cards, say: T('added', { spell: spellName(spell.kind), size: n.components(spell.size), v: as.v }) });
  }
  if (verb === 'rebuild' && s.phase === 'fixed') {
    const cards = RUN.concat([wild()]); // rebuilt from its original three: the declaration is gone
    return step(s, { phase: 'declare', rebuilt: true, cards, pick: { v: null }, say: T('rebuilt', { cost: n.counters(actionCost('reshape')) }) + ' ' + plain(RULES.wildRule.lines[3]) });
  }
  return s;
}

export const facts = (s) => {
  const as = declared(s) || (s.scene === 'run' && s.pick && s.pick.v != null ? s.pick : null);
  return [{ label: T('asLabel'), value: as ? String(as.v) + (declared(s) ? '' : ' ?') : '—' }];
};

export function stage(s, kit) {
  const shown = s.scene === 'run' && s.phase === 'declare' && s.pick.v != null ? withWild(s.cards, s.pick) : s.cards;
  const spell = classify(shown, s.group);
  return [
    kit.spell({ title: spell ? spellName(spell.kind) : '…', cards: shown, badge: spell && spell.kind === 'enchantment' ? '+' + grant(spell.size) : null }),
    s.scene === 'ench' && (s.phase === 'ask' || s.phase === 'no') ? kit.loose([wild()]) : null,
  ];
}
