// Deterministic resolution: package + player states + allocations → trial results,
// Recognition Points, final places and an audit trail. Pure; a port of the analysis
// model's resolver.py and comparators.py, plus the Champion's Mark (outside its schema).
//
// An allocation is { player_id, normal: { trial: { domain: power } }, wild: { trial: power }, mark? }.

import { entryIsLegal, isActive, rewardFor, qualifyingSourceCount, qualifyingSourceDomains, findUnspentUse } from './legality.js';
import { totalNormal } from './power.js';

// ── Tiebreak values ─────────────────────────────────────────────────────────────────
// Counts are integers; ratios are [numerator, denominator] compared exactly.
const cmpValue = (a, b) => {
  if (Array.isArray(a)) { const l = a[0] * b[1]; const r = b[0] * a[1]; return l > r ? 1 : l < r ? -1 : 0; }
  return a > b ? 1 : a < b ? -1 : 0;
};
const ratio = (n, d, token) => { if (d <= 0) throw new Error(`${token}: non-positive denominator`); return [n, d]; };

export const LOCAL_TOKENS = ['total_power', 'normal_power', 'qualifying_source_count', 'breadth'];
export const RATIO_TOKENS = ['legacy_utilization', 'legacy_focus', 'hybrid_efficiency', 'hybrid_commitment'];

function tokenValue(token, ctx) {
  const { config, trial, entry, state } = ctx;
  const on = entry.normal_on;
  switch (token) {
    case 'total_power': return entry.total_power;
    case 'normal_power': return entry.normal_total;
    case 'qualifying_source_count': return qualifyingSourceCount(config, trial, on);
    case 'breadth': return qualifyingSourceDomains(config, trial, on).length;
    case 'legacy_utilization': {
      const q = qualifyingSourceDomains(config, trial, on);
      return ratio(q.reduce((s, d) => s + on[d], 0), q.reduce((s, d) => s + (state.normal_power[d] || 0), 0), token);
    }
    case 'hybrid_efficiency': {
      const rep = Object.keys(on).filter((d) => on[d] > 0);
      return ratio(entry.normal_total, rep.reduce((s, d) => s + (state.normal_power[d] || 0), 0), token);
    }
    case 'legacy_focus': return ratio(entry.normal_total, ctx.allocatedNormalTotal, token);
    case 'hybrid_commitment': return ratio(entry.normal_total, totalNormal(state), token);
    default: throw new Error(`unknown trial tiebreak token "${token}"`);
  }
}

/** [sign, decidingToken]: sign 1 if a ranks above b, -1 below, 0 tied. */
function compareEntries(chain, contexts, a, b) {
  for (const token of chain) {
    if (token === 'shared') return [0, 'shared'];
    const sign = cmpValue(tokenValue(token, contexts[a]), tokenValue(token, contexts[b]));
    if (sign) return [sign, token];
  }
  return [0, null];
}

const FINAL = {
  first_place_trial_count: (c) => c.soleFirst,
  total_normal_power: (c) => totalNormal(c.state),
  spell_count: (c) => (c.state.tiebreak_stats || {}).spell_count || 0,
  largest_spell: (c) => (c.state.tiebreak_stats || {}).largest_spell || 0,
};

const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);
const touched = (alloc) => [...new Set([...Object.keys(alloc.normal || {}), ...Object.keys(alloc.wild || {})])].sort();
const blank = (pid) => ({ player_id: pid, normal: {}, wild: {} });

/**
 * @param states       { playerId: state }  (engine/power.js → deriveState)
 * @param allocations  { playerId: allocation }
 * @param extras       { champions_mark?: { player_counts, bonus } }
 */
export function resolveProfile(config, states, allocations, playerCount = null, extras = {}) {
  const pids = Object.keys(states).sort();
  if (playerCount == null) playerCount = pids.length;
  const result = {
    configuration: { id: config.id, version: config.version },
    player_count: playerCount,
    valid: true, errors: [], warnings: [],
    invalidation_events: [], dropped_wild: {}, overallocated_domains: {}, conservation: {}, residue: {},
    trial_results: [], player_results: {}, award_trace: [], mark_awards: [],
  };
  const alloc = (pid) => allocations[pid] || blank(pid);

  // 1. Syntax: no negative numbers anywhere.
  for (const pid of pids) {
    const a = alloc(pid);
    for (const [tid, doms] of Object.entries(a.normal || {})) for (const [d, p] of Object.entries(doms)) if (!(p >= 0)) result.errors.push(`allocation ${pid}: negative normal on ${tid}/${d}`);
    for (const [tid, p] of Object.entries(a.wild || {})) if (!(p >= 0)) result.errors.push(`allocation ${pid}: negative wild on ${tid}`);
  }
  if (result.errors.length) { result.valid = false; return result; }

  // 2. Ledgers. Over-allocation is recorded exactly and never clipped.
  const invalidated = new Map(); // "pid|trial" → reason
  const wildDropOnly = new Set();
  const policy = (config.allocation || {}).invalidation || {};
  const domainAction = policy.overallocated_domain || 'invalidate_entries_using_domain';
  const wildAction = policy.overallocated_wild || 'invalidate_entries_using_wild';
  const entryAction = policy.illegal_trial_entry || 'ignore_entry';
  const domainIds = config.domains.map((d) => d.id);
  for (const pid of pids) {
    const a = alloc(pid);
    const st = states[pid];
    const used = new Set(domainIds);
    for (const doms of Object.values(a.normal || {})) for (const d of Object.keys(doms)) used.add(d);
    const cons = {};
    let normalResidue = 0;
    for (const dom of [...used].sort()) {
      const allocated = Object.values(a.normal || {}).reduce((s, doms) => s + (doms[dom] || 0), 0);
      const available = st.normal_power[dom] || 0;
      cons[dom] = { available, allocated, residue: available - allocated };
      normalResidue += Math.max(available - allocated, 0);
      if (allocated > available) {
        const affected = Object.keys(a.normal).filter((tid) => (a.normal[tid][dom] || 0) > 0).sort();
        const reason = `overallocated_domain:${dom}`;
        if (domainAction === 'invalidate_entries_using_domain') for (const tid of affected) invalidated.set(pid + '|' + tid, reason);
        (result.overallocated_domains[pid] ||= {})[dom] = allocated - available;
        result.invalidation_events.push({ player_id: pid, scope: 'overallocated_domain', reason, action: domainAction, domain: dom, affected_entries: affected, excess: allocated - available });
      }
    }
    result.conservation[pid] = cons;
    const wildAllocated = sum(a.wild);
    result.residue[pid] = { normal: normalResidue, wild: Math.max(st.wild_power - wildAllocated, 0) };
    if (wildAllocated > st.wild_power) {
      const affected = Object.keys(a.wild).filter((tid) => a.wild[tid] > 0).sort();
      for (const tid of affected) {
        if (wildAction === 'invalidate_entries_using_wild') { if (!invalidated.has(pid + '|' + tid)) invalidated.set(pid + '|' + tid, 'overallocated_wild'); }
        else if (wildAction === 'drop_wild') wildDropOnly.add(pid + '|' + tid);
      }
      result.invalidation_events.push({ player_id: pid, scope: 'overallocated_wild', reason: 'overallocated_wild', action: wildAction, affected_entries: affected, excess: wildAllocated - st.wild_power });
    }
  }

  // 3. Entries: legality, then Wild power on top of a legal normal entry only.
  const trialMap = Object.fromEntries(config.trials.map((tr) => [tr.id, tr]));
  const entries = {}; // trial → pid → entry
  for (const pid of pids) {
    const a = alloc(pid);
    for (const tid of touched(a)) {
      const normalOn = { ...((a.normal || {})[tid] || {}) };
      const wildAlloc = (a.wild || {})[tid] || 0;
      const entry = { player_id: pid, normal_on: normalOn, normal_total: sum(normalOn), wild_alloc: wildAlloc, legal_wild: 0, total_power: 0, legal: false, reason: null, reasons: [] };
      const key = pid + '|' + tid;
      const drop = () => { if (wildAlloc > 0) (result.dropped_wild[pid] ||= {})[tid] = wildAlloc; };
      if (invalidated.has(key)) {
        entry.reason = invalidated.get(key);
        entry.reasons = [{ code: entry.reason.startsWith('overallocated_domain') ? 'overspent' : 'overspent-wild', text: entry.reason }];
        drop();
      } else {
        const trial = trialMap[tid];
        const verdict = trial ? entryIsLegal(config, trial, normalOn, playerCount, wildAlloc, states[pid]) : { legal: false, reason: 'unknown_trial', reasons: [{ code: 'unknown-trial', text: 'unknown_trial' }] };
        if (verdict.legal) {
          entry.legal = true;
          const dropped = wildDropOnly.has(key);
          if ((config.wild || {}).included_in_primary_total !== false && !dropped) entry.legal_wild = wildAlloc;
          if (dropped) drop();
          entry.total_power = entry.normal_total + entry.legal_wild;
        } else {
          entry.reason = verdict.reason;
          entry.reasons = verdict.reasons;
          drop();
          result.invalidation_events.push({ player_id: pid, scope: 'illegal_entry', reason: verdict.reason, action: entryAction, trial_id: tid, affected_entries: [tid], dropped_wild: wildAlloc });
        }
      }
      (entries[tid] ||= {})[pid] = entry;
    }
  }

  // 4. Completion: unspent power that could still be placed is a warning, not an error.
  if (((config.allocation || {}).completion || 'maximal') === 'maximal') {
    for (const pid of pids) {
      const use = findUnspentUse(config, states[pid], alloc(pid), playerCount);
      if (use) result.warnings.push({ code: 'non-maximal', player_id: pid, ...use });
    }
  }

  // 5. Each trial: order the legal entries, group ties, award.
  const allocatedNormalTotal = Object.fromEntries(pids.map((pid) => [pid, Object.values(alloc(pid).normal || {}).reduce((s, doms) => s + Object.values(doms).filter((p) => p > 0).reduce((x, y) => x + y, 0), 0)]));
  const recognition = Object.fromEntries(pids.map((pid) => [pid, 0]));
  const soleFirst = Object.fromEntries(pids.map((pid) => [pid, 0]));
  for (const trial of [...config.trials].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    const byPid = entries[trial.id] || {};
    const tr = {
      trial_id: trial.id, active: isActive(trial, playerCount), entries: byPid,
      legal_entries: [], illegal_entries: {}, total_power: {}, placements: [], comparison: null,
      rewards_awarded: {}, shared_first: false, uncontested: false,
    };
    for (const pid of Object.keys(byPid).sort()) {
      if (byPid[pid].legal) { tr.legal_entries.push(pid); tr.total_power[pid] = byPid[pid].total_power; }
      else if (byPid[pid].reason) tr.illegal_entries[pid] = byPid[pid].reason;
    }
    result.trial_results.push(tr);
    if (!tr.active || !tr.legal_entries.length) continue;
    tr.uncontested = tr.legal_entries.length === 1;
    const chain = trial.trial_tiebreaks && trial.trial_tiebreaks.length ? trial.trial_tiebreaks : ['total_power', 'shared'];
    const contexts = Object.fromEntries(tr.legal_entries.map((pid) => [pid, { config, trial, entry: byPid[pid], state: states[pid], allocatedNormalTotal: allocatedNormalTotal[pid] }]));
    const ordered = [...tr.legal_entries].sort((a, b) => -compareEntries(chain, contexts, a, b)[0]);
    for (const pid of ordered) {
      const last = tr.placements[tr.placements.length - 1];
      if (last && compareEntries(chain, contexts, last[0], pid)[0] === 0) last.push(pid);
      else tr.placements.push([pid]);
    }
    tr.placements.forEach((g) => g.sort());
    const first = tr.placements[0];
    tr.shared_first = first.length > 1;
    if (tr.placements.length >= 2) tr.comparison = { kind: 'decided', token: compareEntries(chain, contexts, first[0], tr.placements[1][0])[1] };
    else if (first.length > 1) tr.comparison = { kind: 'shared', token: compareEntries(chain, contexts, first[0], first[1])[1] };
    else tr.comparison = { kind: 'single' };

    const rewards = rewardFor(trial, playerCount);
    if (rewards) {
      const award = (pid, place, configured, awarded, mode, size) => {
        tr.rewards_awarded[pid] = awarded;
        result.award_trace.push({ player_id: pid, trial_id: trial.id, player_count: playerCount, place, configured_award: configured, awarded, tie_resolution: mode, group_size: size });
      };
      const second = () => { const g = tr.placements[1]; if (rewards.second && g) for (const pid of g) award(pid, 'second', rewards.second, rewards.second, 'lower_place', g.length); };
      if (first.length === 1) { award(first[0], 'first', rewards.first || 0, rewards.first || 0, 'sole', 1); second(); }
      else {
        const type = (trial.tie_award || { type: 'shared_full' }).type;
        if (type === 'shared_full') for (const pid of first) award(pid, 'first', rewards.first || 0, rewards.first || 0, 'shared_full', first.length);
        else if (type === 'divided') for (const pid of first) award(pid, 'first', rewards.first || 0, Math.floor((rewards.first || 0) / first.length), 'divided', first.length);
        if (!trial.suppress_lower_on_shared_first) second();
      }
    }
    for (const [pid, rp] of Object.entries(tr.rewards_awarded)) recognition[pid] += rp;
    if (first.length === 1) soleFirst[first[0]] += 1;
  }

  // 6. Champion's Mark: a secret mark on one active trial; a bonus if you win it (a shared win counts).
  const mark = extras.champions_mark;
  if (mark && (mark.player_counts || []).includes(playerCount)) {
    for (const pid of pids) {
      const tid = alloc(pid).mark;
      const tr = tid && result.trial_results.find((x) => x.trial_id === tid);
      const won = !!(tr && tr.active && tr.placements[0] && tr.placements[0].includes(pid));
      result.mark_awards.push({ player_id: pid, trial_id: tid || null, won, awarded: won ? mark.bonus : 0 });
      if (won) recognition[pid] += mark.bonus;
    }
  }

  // 7. Final places.
  const chain = config.final_tiebreaks || (config.final_result || {}).final_tiebreaks || ['shared'];
  const ctx = (pid) => ({ state: states[pid], soleFirst: soleFirst[pid] });
  const finalCmp = (a, b) => {
    if (recognition[a] !== recognition[b]) return recognition[a] > recognition[b] ? [-1, 'recognition_points'] : [1, 'recognition_points'];
    for (const token of chain) {
      if (token === 'shared') return [0, 'shared'];
      if (!FINAL[token]) throw new Error(`unknown final tiebreak token "${token}"`);
      const va = FINAL[token](ctx(a)); const vb = FINAL[token](ctx(b));
      if (va !== vb) return [va > vb ? -1 : 1, token];
    }
    return [0, null];
  };
  const order = [...pids].sort((a, b) => finalCmp(a, b)[0]);
  const groups = [];
  for (const pid of order) {
    const last = groups[groups.length - 1];
    if (last && finalCmp(last[0], pid)[0] === 0) last.push(pid); else groups.push([pid]);
  }
  let place = 1;
  for (const group of groups) {
    for (const pid of group) result.player_results[pid] = { player_id: pid, recognition_points: recognition[pid], final_place: place, shared: group.length > 1, sole_first_count: soleFirst[pid] };
    place += group.length;
  }
  result.final_groups = groups.map((g) => [...g].sort());
  result.final_decided_by = groups.length >= 2 ? finalCmp(groups[0][0], groups[1][0])[1] : groups[0] && groups[0].length > 1 ? 'shared' : null;
  result.win_utility = Object.fromEntries(pids.map((pid) => { const r = result.player_results[pid]; return [pid, r.final_place === 1 ? (r.shared ? 0 : 1) : -1]; }));
  if (pids.length === 2) result.margin_utility = { [pids[0]]: recognition[pids[0]] - recognition[pids[1]], [pids[1]]: recognition[pids[1]] - recognition[pids[0]] };
  return result;
}
