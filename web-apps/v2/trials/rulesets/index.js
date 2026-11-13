// THE ONE PLACE THAT LISTS AND PICKS THE TRIALS RULES PACKAGE.
//
// The Trials rules are an open decision (F8). Nothing in the companion names a package
// except this file, the host's settings screen and the results screen.
//
//   • To make a package the default once the decision is made: set DEFAULT_RULESET_ID.
//   • To try one for a single visit: add ?ruleset=<id> to the address.
//   • To add a package: write rulesets/<id>.js (see REPORT_3.md, "Adding a package"),
//     import it here and add it to the list. Add the file to sw.js for offline use.
//
// While DEFAULT_RULESET_ID is null the host is asked to choose once; the choice is
// remembered on that device.

import currentDraft from './current-draft.js';
import hybridRebuild from './hybrid-rebuild.js';
import c1 from './c1-coherent-claim.js';
import c2 from './c2-guarded-table.js';
import c3 from './c3-open-skies.js';
import c4 from './c4-archspell-bold.js';

export const DEFAULT_RULESET_ID = null;

export const RULESETS = [c1, c4, c2, c3, hybridRebuild, currentDraft];

const clone = (o) => JSON.parse(JSON.stringify(o));

export const rulesetIds = () => RULESETS.map((r) => r.id);
export const findRuleset = (id) => RULESETS.find((r) => r.id === id) || null;

/** Options a package offers, with the chosen (or default) value of each. */
export function optionValues(ruleset, chosen = {}) {
  return Object.fromEntries((ruleset.options || []).map((o) => [o.id, o.id in chosen ? !!chosen[o.id] : !!o.default]));
}

/**
 * The package ready to play: a private copy of its configuration with the chosen options
 * applied. The registry objects are never mutated.
 */
export function loadRuleset(id, chosen = {}) {
  const base = findRuleset(id);
  if (!base) return null;
  const config = clone(base.config);
  const values = optionValues(base, chosen);
  for (const option of base.options || []) if (values[option.id]) option.apply(config);
  return { ...base, config, extras: clone(base.extras || {}), optionValues: values };
}

/** Player counts at which a package can actually award points. */
export function playableCounts(ruleset) {
  const cfg = ruleset.config;
  return cfg.supported_player_counts.filter((n) => cfg.trials.some((tr) => tr.active_player_counts.includes(n) && tr.rewards.by_player_count[String(n)]));
}

/** "C1 · Coherent Claim · v0.1 (+ Count Echo as a fifth energy)" — shown on the results screen. */
export function rulesetStamp(ruleset) {
  const on = (ruleset.options || []).filter((o) => ruleset.optionValues && ruleset.optionValues[o.id]).map((o) => o.label);
  return ruleset.label + ' · v' + ruleset.config.version + (on.length ? ' · ' + on.join(' · ') : '');
}
