// Spellbook → Trials power. Pure: no DOM, no strings, no rule numbers. Every number
// comes from the package's `power_formula`. A port of the analysis model's power.py.
//
// A spell is { id, type, size, energy_domain? } with type one of
// conjuration | transfiguration | enchantment | perfect_transmutation.

export const SPELL_TYPES = ['conjuration', 'transfiguration', 'enchantment', 'perfect_transmutation'];
export const ENERGY_TYPES = ['conjuration', 'perfect_transmutation'];

// Arithmetic in the single variable n: numbers, n, + - * /, parentheses. Nothing else.
export function evalExpression(expression, n) {
  const src = String(expression).replace(/\s+/g, '');
  let i = 0;
  const fail = () => { throw new Error(`bad power expression "${expression}" at ${i}`); };
  const atom = () => {
    if (src[i] === '(') { i++; const v = sum(); if (src[i] !== ')') fail(); i++; return v; }
    if (src[i] === '-') { i++; return -atom(); }
    if (src[i] === '+') { i++; return atom(); }
    if (src[i] === 'n') { i++; return n; }
    const m = /^\d+(\.\d+)?/.exec(src.slice(i));
    if (!m) fail();
    i += m[0].length;
    return Number(m[0]);
  };
  const product = () => {
    let v = atom();
    while (src[i] === '*' || src[i] === '/') { const op = src[i++]; const r = atom(); v = op === '*' ? v * r : v / r; }
    return v;
  };
  function sum() {
    let v = product();
    while (src[i] === '+' || src[i] === '-') { const op = src[i++]; const r = product(); v = op === '+' ? v + r : v - r; }
    return v;
  }
  const value = sum();
  if (i !== src.length) fail();
  return value;
}

function toInt(value, rounding) {
  if (rounding === 'half_up') return Math.floor(value + 0.5 + 1e-9);
  const rounded = Math.round(value);
  if (Math.abs(value - rounded) > 1e-9) throw new Error(`non-integer power ${value} needs a rounding policy`);
  return rounded;
}

/** Power of a Conjuration / Transfiguration / Perfect Transmutation of this size. */
export function standardSpellPower(config, size) {
  const ssp = config.power_formula.standard_spell_power;
  if (ssp.type === 'linear') return toInt(evalExpression(ssp.expression, size), ssp.rounding);
  if (ssp.type === 'piecewise') {
    for (const seg of ssp.piecewise) {
      if ((seg.min_size == null || size >= seg.min_size) && (seg.max_size == null || size <= seg.max_size)) {
        return toInt(evalExpression(seg.expression, size), seg.rounding);
      }
    }
    throw new Error(`no power segment covers spell size ${size}`);
  }
  throw new Error(`unknown standard_spell_power type "${ssp.type}"`);
}

/** Power of an Enchantment of this size, or null if the package has no value for it. */
export function enchantmentPower(config, size) {
  const ep = config.power_formula.enchantment_power;
  if (ep.type === 'spell_size') return size;
  if (ep.type === 'table') return size in ep.table ? ep.table[size] : null;
  throw new Error(`unknown enchantment_power type "${ep.type}"`);
}

/**
 * What one spell feeds: { normal: { domain: power }, wild, unplaced: [{ code, ... }] }.
 * A spell the package cannot place (an energy it has no domain for, an Enchantment size
 * it has no value for) is reported in `unplaced`, never guessed at.
 */
export function spellContribution(config, spell) {
  const out = { normal: {}, wild: 0, unplaced: [] };
  const rule = config.power_formula.contributions[spell.type];
  if (!rule) throw new Error(`no contribution rule for spell type "${spell.type}"`);
  const domains = new Set(config.domains.map((d) => d.id));
  for (const [target, formula] of Object.entries(rule)) {
    if (target === 'wild') { out.wild += rule.wild; continue; }
    const power = formula === 'enchantment_power' ? enchantmentPower(config, spell.size) : standardSpellPower(config, spell.size);
    if (power == null) { out.unplaced.push({ code: 'size-not-valued', size: spell.size }); continue; }
    const domain = target === 'energy' ? spell.energy_domain : target;
    if (!domain) throw new Error(`spell ${spell.id}: ${spell.type} needs an energy_domain`);
    if (!domains.has(domain)) { out.unplaced.push({ code: 'no-such-domain', domain, power }); continue; }
    out.normal[domain] = (out.normal[domain] || 0) + power;
  }
  if (spell.type === 'enchantment' && (config.power_formula.enchantment_wild_sizes || []).includes(spell.size)) out.wild += 1;
  return out;
}

/**
 * A player's Trials state from their Spellbook.
 * @param extras  rules outside the model schema; `baseline_wild` adds Wild power for everyone.
 */
export function deriveState(config, spells, { playerId = 'player', extras = {} } = {}) {
  const normal = Object.fromEntries(config.domains.map((d) => [d.id, 0]));
  let wild = 0;
  const perSpell = [];
  const unplaced = [];
  for (const spell of spells) {
    const c = spellContribution(config, spell);
    for (const [d, p] of Object.entries(c.normal)) normal[d] += p;
    wild += c.wild;
    perSpell.push({ id: spell.id, type: spell.type, size: spell.size, energy_domain: spell.energy_domain || null, normal: c.normal, wild: c.wild });
    for (const u of c.unplaced) unplaced.push({ ...u, spell: spell.id });
  }
  const baseline = extras.baseline_wild || 0;
  const sizes = spells.map((s) => s.size);
  return {
    player_id: playerId,
    normal_power: normal,
    wild_power: wild + baseline,
    wild_from: { spells: wild, baseline },
    tiebreak_stats: { spell_count: spells.length, largest_spell: sizes.length ? Math.max(...sizes) : 0 },
    spells: perSpell,
    unplaced,
  };
}

export const totalNormal = (state) => Object.values(state.normal_power).reduce((a, b) => a + b, 0);
