// Shared builder for the "hybrid rebuild" family of Trials rule packages
// (ascension-trials/design-history/ASCENSION_TRIALS_02, _03 and _07).
//
// It produces a configuration in the SAME schema the Python analysis model reads
// (ascension-trials/ascension_trials_model/configs/*.json), so the screening evidence and
// this companion talk about the same rules. trials/tests/rulesets.test.mjs fails if a
// package built here drifts from the model's committed JSON.
//
// A candidate differs from its siblings only in the knobs below. Nothing here is canon.

const ALL = [2, 3, 4, 5, 6];

const TIEBREAKS = {
  // Local: only what is on the contested trial counts (shortlist file 07, section 2).
  local: { mono: ['total_power', 'normal_power', 'shared'], broad: ['total_power', 'normal_power', 'breadth', 'shared'] },
  // The ratio chain the hybrid proposal was written with (historical; fails monotonicity).
  hybrid_ratios: {
    mono: ['total_power', 'hybrid_efficiency', 'hybrid_commitment', 'shared'],
    broad: ['total_power', 'hybrid_efficiency', 'hybrid_commitment', 'breadth', 'shared'],
  },
};

const FINAL_TIEBREAKS = ['first_place_trial_count', 'total_normal_power', 'spell_count', 'largest_spell', 'shared'];

/**
 * @param o.id              model configuration id
 * @param o.floor           Minimum Claim: normal power an entry needs (0 = none)
 * @param o.masteryReward   Recognition Points for Transformation / Enchantment Mastery
 * @param o.focusedAtTwo    is the single-source trial active at 2 players?
 * @param o.tiebreaks       'local' | 'hybrid_ratios'
 * @param o.singleSource    'focused_power' | 'archspell' (which trial fills that slot)
 */
export function hybridConfig(o) {
  const chain = TIEBREAKS[o.tiebreaks];
  const trial = (id, counts, eligibility, kind, first, secondAtSix) => ({
    id,
    active_player_counts: counts,
    eligibility,
    entry_floor: { value: o.floor, scope: 'normal' },
    tie_award: { type: 'shared_full' },
    trial_tiebreaks: chain[kind],
    rewards: {
      by_player_count: Object.fromEntries(counts.map((n) => [String(n), { first, second: n === 6 ? secondAtSix : 0 }])),
    },
    suppress_lower_on_shared_first: true,
  });
  const singleCounts = o.focusedAtTwo ? ALL : [3, 4, 5, 6];
  const single = o.singleSource === 'archspell'
    ? trial('archspell', singleCounts, { single_spell: true }, 'mono', 7, 3)
    : trial('focused_power', singleCounts, { source_count: { universe: 'all_normal', minimum: 1, maximum: 1 } }, 'mono', 7, 3);

  return {
    id: o.id,
    version: '0.1',
    historical_candidate: false,
    stale_by_design: false,
    supported_player_counts: ALL,
    rounding: { mode: 'half_up' },
    power_formula: {
      profile: 'hybrid_2n_minus_3',
      version: '0.1-experimental',
      experimental: true,
      standard_spell_power: { type: 'linear', expression: '2*n-3' },
      enchantment_power: { type: 'table', table: { 3: 4, 4: 8, 5: 12 } },
      contributions: {
        conjuration: { energy: 'standard_spell_power' },
        transfiguration: { transformation: 'standard_spell_power' },
        perfect_transmutation: { energy: 'standard_spell_power', transformation: 'standard_spell_power', wild: 1 },
        enchantment: { enchantment: 'enchantment_power' },
      },
      enchantment_wild_sizes: [4, 5],
    },
    domains: [
      { id: 'radiance', class: 'energy' },
      { id: 'void', class: 'energy' },
      { id: 'flux', class: 'energy' },
      { id: 'aether', class: 'energy' },
      { id: 'echo', class: 'energy' },
      { id: 'transformation', class: 'transformation' },
      { id: 'enchantment', class: 'enchantment' },
    ],
    wild: {
      enabled: true,
      can_enter_alone: false,
      requires_legal_normal_entry: true,
      counts_as_source: false,
      can_satisfy_source_minimum: false,
      can_break_source_maximum: false,
      included_in_primary_total: true,
      included_in_tiebreaks: false,
    },
    trials: [
      trial('energy_purity', ALL, { allowed_domain_classes: ['energy'], source_count: { universe: 'class:energy', minimum: 1, maximum: 1 } }, 'mono', 8, 3),
      trial('energy_harmony', [4, 5, 6], { allowed_domain_classes: ['energy'], source_count: { universe: 'class:energy', minimum: 2 } }, 'broad', 6, 2),
      trial('transformation_mastery', ALL, { allowed_domain_ids: ['transformation'], required_domain_counts: { transformation: { minimum: 1 } } }, 'mono', o.masteryReward, 3),
      trial('enchantment_mastery', ALL, { allowed_domain_ids: ['enchantment'], required_domain_counts: { enchantment: { minimum: 1 } } }, 'mono', o.masteryReward, 3),
      single,
      trial('universal_power', ALL, { source_count: { universe: 'all_normal', minimum: 2 } }, 'broad', 6, 2),
      trial('complete_mastery', [5, 6], {
        source_count: { universe: 'all_normal', minimum: 3 },
        required_class_counts: { energy: { minimum: 1 }, transformation: { minimum: 1 }, enchantment: { minimum: 1 } },
      }, 'broad', 9, 4),
    ],
    allocation: {
      completion: 'maximal',
      residue_allowed: true,
      infeasible_full_fallback: 'reject',
      invalidation: {
        illegal_trial_entry: 'ignore_entry',
        overallocated_domain: 'invalidate_entries_using_domain',
        overallocated_wild: 'invalidate_entries_using_wild',
        malformed_allocation: 'reject_profile',
      },
    },
    declared_tiebreak_stats: ['spell_count', 'largest_spell'],
    final_tiebreaks: FINAL_TIEBREAKS,
  };
}

// Display names. A package may override any of them in its own `ui.trials`.
export const HYBRID_TRIAL_NAMES = {
  energy_purity: { name: 'Energy Purity', proves: 'Mastery of a single energy' },
  energy_harmony: { name: 'Energy Harmony', proves: 'Balance across energies' },
  transformation_mastery: { name: 'Transformation Mastery', proves: 'Mastery of transmutation' },
  enchantment_mastery: { name: 'Enchantment Mastery', proves: 'Mastery of enchantment' },
  focused_power: { name: 'Focused Power', proves: 'True specialisation' },
  archspell: { name: 'Trial of the Archspell', proves: 'One great spell' },
  universal_power: { name: 'Universal Power', proves: 'Versatility' },
  complete_mastery: { name: 'Complete Mastery', proves: 'Command of every kind of power' },
};

const SHORTLIST = 'ascension-trials/design-history/ASCENSION_TRIALS_07_CANDIDATE_SHORTLIST_2026-07-11.md';
export const HYBRID_SOURCES = {
  proposal: 'ascension-trials/design-history/ASCENSION_TRIALS_02_HYBRID_REBUILD_PROPOSAL_2026-07-06.md',
  critique: 'ascension-trials/design-history/ASCENSION_TRIALS_03_HYBRID_REBUILD_CRITIQUE_2026-07-06.md',
  shortlist: SHORTLIST,
};
