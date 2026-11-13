// Is an entry on a trial legal? Pure. A port of the model's eligibility.py and the
// entry rules of legality.py, plus one extension the model cannot express:
// `eligibility.single_spell` (the Trial of the Archspell).
//
// An entry's normal power is { domain: power }. A SOURCE is a domain with positive power
// on the trial. Wild power is never a source.

const domainMap = (config) => Object.fromEntries(config.domains.map((d) => [d.id, d]));
export const sourcesOf = (entry) => Object.keys(entry).filter((d) => entry[d] > 0);
export const isActive = (trial, playerCount) => trial.active_player_counts.includes(playerCount);
export const rewardFor = (trial, playerCount) => trial.rewards.by_player_count[String(playerCount)] || null;

const passesAllow = (elig, dom, cls) =>
  !(elig.allowed_domain_ids && elig.allowed_domain_ids.length && !elig.allowed_domain_ids.includes(dom)) &&
  !(elig.allowed_domain_classes && elig.allowed_domain_classes.length && !elig.allowed_domain_classes.includes(cls));

const qualifies = (elig, dom, cls) =>
  passesAllow(elig, dom, cls) && !(elig.forbidden_domain_ids || []).includes(dom) && !(elig.forbidden_domain_classes || []).includes(cls);

/** May this domain ever stand on this trial (counts and floors aside)? */
export function domainAllowed(config, trial, dom) {
  const d = domainMap(config)[dom];
  return !!d && qualifies(trial.eligibility, dom, d.class);
}

function countInUniverse(config, elig, universe, sources) {
  const map = domainMap(config);
  if (universe === 'all_normal') return sources.length;
  if (universe === 'allowed') return sources.filter((d) => passesAllow(elig, d, map[d] && map[d].class)).length;
  if (universe.startsWith('class:')) return sources.filter((d) => map[d] && map[d].class === universe.slice(6)).length;
  throw new Error(`invalid source_count universe "${universe}"`);
}

/** Sources counted by the trial's own counting universe (the qualifying_source_count tiebreak). */
export function qualifyingSourceCount(config, trial, entry) {
  const sc = trial.eligibility.source_count;
  return countInUniverse(config, trial.eligibility, sc ? sc.universe : 'all_normal', sourcesOf(entry));
}

/** Distinct domains on the trial that pass its allow/forbid filters (the breadth tiebreak). */
export function qualifyingSourceDomains(config, trial, entry) {
  const map = domainMap(config);
  return sourcesOf(entry).filter((d) => qualifies(trial.eligibility, d, map[d] && map[d].class)).sort();
}

/**
 * Spells that could, alone, supply this whole entry (single-spell trials).
 * A spell may fight from any power it feeds, but its own Spell Power is the cap on the
 * entry: a Perfect Transmutation feeds two powers and still counts once.
 */
export function coveringSpells(state, entry) {
  const used = sourcesOf(entry);
  const total = used.reduce((sum, d) => sum + entry[d], 0);
  return (state && state.spells ? state.spells : []).filter((s) => used.every((d) => (s.normal[d] || 0) >= entry[d]) && total <= Math.max(0, ...Object.values(s.normal)));
}

/**
 * The declared source predicates only. Returns { legal, reasons } where each reason is
 * { code, text, ... }: `code` drives the plain-language interface, `text` is the audit line.
 */
export function evaluateEntry(config, trial, entry, state) {
  const elig = trial.eligibility;
  const map = domainMap(config);
  const sources = sourcesOf(entry);
  const reasons = [];
  for (const dom of sources) {
    const d = map[dom];
    if (!d) { reasons.push({ code: 'unknown-domain', domain: dom, text: `unknown domain '${dom}'` }); continue; }
    if (elig.allowed_domain_ids && elig.allowed_domain_ids.length && !elig.allowed_domain_ids.includes(dom)) reasons.push({ code: 'domain-not-allowed', domain: dom, text: `domain '${dom}' not in allowed_domain_ids` });
    if (elig.allowed_domain_classes && elig.allowed_domain_classes.length && !elig.allowed_domain_classes.includes(d.class)) reasons.push({ code: 'domain-not-allowed', domain: dom, text: `domain class '${d.class}' not in allowed_domain_classes` });
    if ((elig.forbidden_domain_ids || []).includes(dom)) reasons.push({ code: 'domain-not-allowed', domain: dom, text: `domain '${dom}' is forbidden` });
    if ((elig.forbidden_domain_classes || []).includes(d.class)) reasons.push({ code: 'domain-not-allowed', domain: dom, text: `domain class '${d.class}' is forbidden` });
  }
  if (elig.source_count) {
    const sc = elig.source_count;
    const count = countInUniverse(config, elig, sc.universe, sources);
    if (count < (sc.minimum || 0)) reasons.push({ code: 'too-few-sources', need: sc.minimum, found: count, universe: sc.universe, text: `needs >= ${sc.minimum} sources in ${sc.universe}, found ${count}` });
    if (sc.maximum != null && count > sc.maximum) reasons.push({ code: 'too-many-sources', allow: sc.maximum, found: count, universe: sc.universe, text: `allows <= ${sc.maximum} sources in ${sc.universe}, found ${count}` });
  }
  for (const [cls, bound] of Object.entries(elig.required_class_counts || {})) {
    const count = sources.filter((d) => map[d] && map[d].class === cls).length;
    if (count < (bound.minimum || 0) || (bound.maximum != null && count > bound.maximum)) reasons.push({ code: 'class-required', class: cls, need: bound.minimum || 0, found: count, text: `class '${cls}' source count ${count} outside [${bound.minimum || 0}, ${bound.maximum ?? 'None'}]` });
  }
  for (const [dom, bound] of Object.entries(elig.required_domain_counts || {})) {
    const present = entry[dom] > 0 ? 1 : 0;
    if (present < (bound.minimum || 0) || (bound.maximum != null && present > bound.maximum)) reasons.push({ code: 'domain-required', domain: dom, text: `domain '${dom}' presence ${present} outside [${bound.minimum || 0}, ${bound.maximum ?? 'None'}]` });
  }
  if (elig.single_spell) {
    if (!sources.length) reasons.push({ code: 'too-few-sources', need: 1, found: 0, universe: 'all_normal', text: 'needs >= 1 sources in all_normal, found 0' });
    else if (!coveringSpells(state, entry).length) reasons.push({ code: 'not-one-spell', text: 'no single spell supplies this entry' });
  }
  return { legal: reasons.length === 0, reasons };
}

/**
 * Full entry legality: active trial, source predicates, Minimum Claim, and the rule that
 * Wild power needs a legal normal entry under it. Returns { legal, reason, reasons }.
 * `playerCount == null` skips the active-trial check.
 */
export function entryIsLegal(config, trial, entry, playerCount = null, wild = 0, state = null) {
  if (playerCount != null && !isActive(trial, playerCount)) return { legal: false, reason: 'inactive_trial', reasons: [{ code: 'inactive', text: 'inactive_trial' }] };
  const verdict = evaluateEntry(config, trial, entry, state);
  if (!verdict.legal) return { legal: false, reason: 'illegal_entry:' + verdict.reasons.map((r) => r.text).join('; '), reasons: verdict.reasons };
  const normalTotal = sourcesOf(entry).reduce((sum, d) => sum + entry[d], 0);
  const floor = trial.entry_floor || { value: 0, scope: 'normal' };
  if (floor.value > 0 && normalTotal > 0) {
    const measure = normalTotal + (floor.scope === 'total' ? wild : 0);
    if (measure < floor.value) return { legal: false, reason: `below_entry_floor:${measure}<${floor.value}`, reasons: [{ code: 'below-floor', have: measure, need: floor.value, text: `below_entry_floor:${measure}<${floor.value}` }] };
  }
  const wildRule = config.wild || {};
  if (wild > 0 && wildRule.requires_legal_normal_entry !== false && normalTotal === 0) return { legal: false, reason: 'wild_without_normal', reasons: [{ code: 'wild-alone', text: 'wild_without_normal' }] };
  return { legal: true, reason: null, reasons: [] };
}

/**
 * Could one more unit of unspent power legally go somewhere? Returns the first such place
 * ({ trial_id, kind: 'normal' | 'wild', domain? }) or null. Used for the "you still have
 * power to place" nudge; a non-maximal allocation is still resolvable.
 */
export function findUnspentUse(config, state, allocation, playerCount) {
  const spent = {};
  for (const doms of Object.values(allocation.normal || {})) for (const [d, p] of Object.entries(doms)) spent[d] = (spent[d] || 0) + p;
  const wildSpent = Object.values(allocation.wild || {}).reduce((a, b) => a + b, 0);
  const trials = config.trials.filter((tr) => isActive(tr, playerCount)).sort((a, b) => (a.id < b.id ? -1 : 1));
  for (const tr of trials) {
    const entry = { ...((allocation.normal || {})[tr.id] || {}) };
    const wild = (allocation.wild || {})[tr.id] || 0;
    for (const d of config.domains.map((x) => x.id)) {
      if ((state.normal_power[d] || 0) - (spent[d] || 0) <= 0) continue;
      const bigger = { ...entry, [d]: (entry[d] || 0) + 1 };
      if (entryIsLegal(config, tr, bigger, playerCount, wild, state).legal) return { trial_id: tr.id, kind: 'normal', domain: d };
    }
    if (state.wild_power - wildSpent > 0 && (config.wild || {}).enabled !== false && entryIsLegal(config, tr, entry, playerCount, wild + 1, state).legal) return { trial_id: tr.id, kind: 'wild' };
  }
  return null;
}
