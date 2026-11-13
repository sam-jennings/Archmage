// Plain language from rules data. Pure: given a package's configuration and the strings
// table, say what a trial requires, why an entry is not legal, and how ties break. A new
// package gets all of this without writing a sentence.

export function makeT(strings) {
  const lookup = (key) => key.split('.').reduce((node, part) => (node == null ? node : node[part]), strings);
  return function t(key, vars = {}) {
    let value = lookup(key);
    if (value == null) return key;
    if (Array.isArray(value)) value = vars.n === 1 ? value[0] : value[1];
    return String(value).replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
  };
}

const word = (t, n) => { const w = t('req.words.' + n); return w.startsWith('req.') ? String(n) : w; };
const classWord = (t, cls, n) => { const pair = t('classes.' + cls, { n }); return pair.startsWith('classes.') ? cls : pair; };

/** What counts as a source on this trial: "energy/energies", a named power, or "source(s)". */
function universeWord(t, config, trial, n, domainName) {
  const elig = trial.eligibility;
  const u = elig.source_count ? elig.source_count.universe : 'all_normal';
  if (u.startsWith('class:')) return classWord(t, u.slice(6), n);
  if (elig.allowed_domain_classes && elig.allowed_domain_classes.length === 1) return classWord(t, elig.allowed_domain_classes[0], n);
  return t('req.source', { n });
}

/** One or two sentences: what power may stand on this trial. */
export function requirementText(t, config, trial, domainName) {
  const elig = trial.eligibility;
  if (elig.single_spell) return t('req.single_spell');
  const ids = elig.allowed_domain_ids || [];
  if (ids.length === 1) return t('req.onlyDomain', { domain: domainName(ids[0]) });
  let text;
  const sc = elig.source_count;
  const generic = !(sc && sc.universe.startsWith('class:')) && !(elig.allowed_domain_classes && elig.allowed_domain_classes.length === 1);
  if (!sc) text = t('req.any');
  else if (sc.maximum != null && sc.maximum === (sc.minimum || 0)) text = t('req.exactly', { n: word(t, sc.maximum), what: universeWord(t, config, trial, sc.maximum) });
  else if (sc.maximum != null) text = t('req.between', { min: word(t, sc.minimum || 0), max: word(t, sc.maximum), what: universeWord(t, config, trial, 2) });
  else text = t('req.atLeast', { n: word(t, sc.minimum || 1), what: universeWord(t, config, trial, 2) });
  if (sc && generic) text += t('req.sourceGloss');
  const needs = Object.keys(elig.required_class_counts || {}).map((cls) => classWord(t, cls, 1)).concat(Object.keys(elig.required_domain_counts || {}).map(domainName));
  if (needs.length) text += t('req.needs', { list: needs.length > 1 ? needs.slice(0, -1).join(', ') + t('req.and') + needs.at(-1) : needs[0] });
  return text;
}

/** Why an entry is not legal, in the player's words. */
export function reasonText(t, config, trial, reason, domainName) {
  const vars = { ...reason };
  if (reason.domain) vars.domain = domainName(reason.domain);
  if (reason.code === 'too-few-sources' || reason.code === 'too-many-sources') {
    const n = reason.need ?? reason.allow;
    vars.what = universeWord(t, config, trial, n);
    vars.need = word(t, reason.need ?? 0); vars.allow = word(t, reason.allow ?? 0); vars.found = word(t, reason.found);
  }
  if (reason.code === 'class-required') vars.what = classWord(t, reason.class, 1);
  if (reason.code === 'overspent') vars.domain = domainName(String(reason.text).split(':')[1] || '');
  const text = t('reason.' + reason.code, vars);
  return text.startsWith('reason.') ? reason.text : text;
}

/** "higher normal power, then more different sources, then the win is shared in full" */
export function tiebreakText(t, chain, final = false) {
  const steps = chain.filter((token) => token !== 'total_power').map((token) => (token === 'shared' ? t(final ? 'tiebreak.sharedFinal' : 'tiebreak.shared') : t('tiebreak.' + token)));
  if (!steps.length) return t(final ? 'tiebreak.sharedFinal' : 'tiebreak.shared');
  let out = steps[0];
  for (const step of steps.slice(1)) out += step.startsWith('then') ? ', ' + step : t('tiebreak.then') + step;
  return out.replace(/^then /, '');
}

/** "9 = Void 8 + Wild power 1" parts for an entry. */
export function entryParts(t, config, entry, domainName) {
  const parts = config.domains.map((d) => d.id).filter((d) => entry.normal_on[d] > 0).map((d) => domainName(d) + ' ' + entry.normal_on[d]);
  if (entry.wild_alloc > 0) parts.push(t('wild') + ' ' + entry.wild_alloc);
  return parts.join(' + ');
}
