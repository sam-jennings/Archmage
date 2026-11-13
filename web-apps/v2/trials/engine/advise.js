// "What does this choice win or risk?" — worked out only from what is public at the
// table: every Spellbook, and therefore every wizard's power. Pure.
//
// The key public fact is the most a rival COULD put on a trial. They cannot do that
// everywhere at once, so it is a ceiling, never a prediction.

import { entryIsLegal, isActive, rewardFor, domainAllowed } from './legality.js';

/** The strongest legal entry this state could make on a trial: { normal, wild, total } or null. */
export function maxEntry(config, trial, state, playerCount) {
  if (!isActive(trial, playerCount)) return null;
  const candidates = [];
  if (trial.eligibility.single_spell) {
    for (const spell of state.spells || []) for (const [d, p] of Object.entries(spell.normal)) candidates.push({ [d]: p });
  } else {
    const doms = config.domains.map((d) => d.id).filter((d) => (state.normal_power[d] || 0) > 0 && domainAllowed(config, trial, d));
    for (let mask = 1; mask < 1 << doms.length; mask++) {
      const entry = {};
      doms.forEach((d, i) => { if (mask & (1 << i)) entry[d] = state.normal_power[d]; });
      candidates.push(entry);
    }
  }
  let best = null;
  for (const normal of candidates) {
    if (!entryIsLegal(config, trial, normal, playerCount, state.wild_power, state).legal) continue;
    const total = Object.values(normal).reduce((a, b) => a + b, 0) + state.wild_power;
    if (!best || total > best.total) best = { normal, wild: state.wild_power, total };
  }
  return best;
}

/**
 * The public picture of one trial for one wizard.
 * @param entry  the wizard's current entry on this trial: { normal: {domain: n}, wild: n }
 * @returns {
 *   reward: { first, second } | null,
 *   mine: { total, legal, reasons },         the entry as it stands
 *   myMax: number,                           the most this wizard could put here
 *   rivals: [{ id, max }],                   every rival who can legally enter, strongest first
 *   verdict: 'empty-open' | 'empty' | 'illegal' | 'certain' | 'certain-or-shared' | 'contested' | 'cannot-enter',
 *   beats: [id], threatenedBy: [id],         rivals whose ceiling is below / at-or-above this entry
 *   spare: number                            power above what a certain win needs (certain only)
 * }
 */
export function trialOutlook(config, trial, playerCount, meId, states, entry) {
  const me = states[meId];
  const rivals = Object.keys(states).filter((id) => id !== meId)
    .map((id) => ({ id, best: maxEntry(config, trial, states[id], playerCount) }))
    .filter((r) => r.best).map((r) => ({ id: r.id, max: r.best.total }))
    .sort((a, b) => b.max - a.max || (a.id < b.id ? -1 : 1));
  const mineBest = maxEntry(config, trial, me, playerCount);
  const normal = entry.normal || {};
  const normalTotal = Object.values(normal).reduce((a, b) => a + b, 0);
  const wild = entry.wild || 0;
  const out = { reward: rewardFor(trial, playerCount), rivals, myMax: mineBest ? mineBest.total : 0, mine: { total: 0, legal: false, reasons: [] }, beats: [], threatenedBy: [], spare: 0 };
  const top = rivals.length ? rivals[0].max : 0;
  if (normalTotal === 0 && wild === 0) {
    out.verdict = !mineBest ? 'cannot-enter' : rivals.length ? 'empty' : 'empty-open';
    return out;
  }
  const verdict = entryIsLegal(config, trial, normal, playerCount, wild, me);
  out.mine = { total: verdict.legal ? normalTotal + wild : 0, legal: verdict.legal, reasons: verdict.reasons };
  if (!verdict.legal) { out.verdict = 'illegal'; return out; }
  const total = normalTotal + wild;
  out.beats = rivals.filter((r) => r.max < total).map((r) => r.id);
  out.threatenedBy = rivals.filter((r) => r.max >= total).map((r) => r.id);
  if (total > top) {
    out.verdict = 'certain';
    // What a certain win needs: one more than the strongest rival's ceiling, and the Minimum Claim.
    const floor = (trial.entry_floor || {}).value || 0;
    out.spare = Math.max(0, Math.min(total - (top + 1), normalTotal - Math.max(floor, 1)));
  } else if (total === top) out.verdict = 'certain-or-shared';
  else out.verdict = 'contested';
  return out;
}
