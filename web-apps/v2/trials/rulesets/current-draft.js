// "Current draft" — rulebook/Ascension Trials.md v2.8 exactly as written, gaps included.
// Mirrors ascension-trials/ascension_trials_model/configs/baseline_v28_stale.json.
//
// What the draft does not define is NOT invented here:
//   • no Echo power (the draft predates the fifth energy) — offered as a labelled option;
//   • no Recognition Points at 6 players (the draft gives pool totals only), so 6 is not
//     offered with this package;
//   • no rule for a tie on the final total.

const ALL = [2, 3, 4, 5, 6];
const MONO = ['total_power', 'legacy_utilization', 'legacy_focus', 'shared'];
const BROAD = ['total_power', 'legacy_utilization', 'legacy_focus', 'breadth', 'shared'];

const trial = (id, counts, eligibility, chain, first) => ({
  id,
  active_player_counts: counts,
  eligibility,
  entry_floor: { value: 0, scope: 'normal' },
  tie_award: { type: 'shared_full' },
  trial_tiebreaks: chain,
  rewards: { by_player_count: Object.fromEntries(Object.entries(first).map(([n, rp]) => [n, { first: rp, second: 0 }])) },
});

const config = {
  id: 'baseline_v28_stale',
  version: '2.8',
  historical_candidate: true,
  stale_by_design: true,
  supported_player_counts: ALL,
  rounding: { mode: 'half_up' },
  power_formula: {
    profile: 'trials_power_v28',
    version: '2.8',
    experimental: false,
    standard_spell_power: {
      type: 'piecewise',
      piecewise: [
        { expression: 'n', max_size: 4 },
        { expression: '1.5*n', min_size: 5, max_size: 6, rounding: 'half_up' },
        { expression: '2*n', min_size: 7 },
      ],
    },
    enchantment_power: { type: 'spell_size' },
    contributions: {
      conjuration: { energy: 'standard_spell_power' },
      transfiguration: { transformation: 'standard_spell_power' },
      perfect_transmutation: { energy: 'standard_spell_power', transformation: 'standard_spell_power', wild: 1 },
      enchantment: { enchantment: 'enchantment_power' },
    },
    enchantment_wild_sizes: [4],
  },
  domains: [
    { id: 'void', class: 'energy' },
    { id: 'flux', class: 'energy' },
    { id: 'radiance', class: 'energy' },
    { id: 'aether', class: 'energy' },
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
    trial('energy_purity', ALL, { allowed_domain_classes: ['energy'], source_count: { universe: 'class:energy', minimum: 1, maximum: 1 } }, MONO, { 2: 6, 3: 8, 4: 8, 5: 8 }),
    trial('energy_harmony', ALL, { allowed_domain_classes: ['energy'], source_count: { universe: 'class:energy', minimum: 2 } }, BROAD, { 2: 4, 3: 5, 4: 6, 5: 6 }),
    trial('transformation', ALL, { allowed_domain_ids: ['transformation'], required_domain_counts: { transformation: { minimum: 1 } } }, MONO, { 2: 7, 3: 9, 4: 9, 5: 9 }),
    trial('enchantment', ALL, { allowed_domain_ids: ['enchantment'], required_domain_counts: { enchantment: { minimum: 1 } } }, MONO, { 2: 4, 3: 5, 4: 6, 5: 6 }),
    trial('focused_power', ALL, { source_count: { universe: 'all_normal', minimum: 1, maximum: 1 } }, MONO, { 2: 6, 3: 7, 4: 7, 5: 7 }),
    trial('universal_power', ALL, { source_count: { universe: 'all_normal', minimum: 2 } }, BROAD, { 2: 3, 3: 4, 4: 5, 5: 5 }),
    trial('complete_mastery', [5, 6], {
      source_count: { universe: 'all_normal', minimum: 3 },
      required_class_counts: { energy: { minimum: 1 }, transformation: { minimum: 1 }, enchantment: { minimum: 1 } },
    }, MONO, { 5: 6 }),
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
};

export default {
  id: 'current-draft',
  label: 'Current draft (rulebook v2.8)',
  status: 'draft',
  summary: 'The rulebook text as written: power ×1 / ×1.5 / ×2 by spell size, six trials plus Complete Mastery at 5 players.',
  source: 'rulebook/Ascension Trials.md',
  modelConfig: 'baseline_v28_stale.json',
  config,
  extras: {},
  // Host-selectable patches for things the draft leaves open. Off = the text as written.
  options: [
    {
      id: 'echo_domain',
      label: 'Count Echo as a fifth energy',
      note: 'The draft has no Echo power. This adds it with the same formula as the other energies (first item on the F8 reconciliation checklist; not yet in the rulebook).',
      default: false,
      apply(cfg) {
        const at = cfg.domains.findIndex((d) => d.class !== 'energy');
        cfg.domains.splice(at < 0 ? cfg.domains.length : at, 0, { id: 'echo', class: 'energy' });
      },
    },
  ],
  ui: {
    trials: {
      energy_purity: { name: 'Energy Purity', proves: 'Single-energy mastery' },
      energy_harmony: { name: 'Energy Harmony', proves: 'Multi-energy balance' },
      transformation: { name: 'Transformation', proves: 'Transmutation mastery' },
      enchantment: { name: 'Enchantment', proves: 'Internal enhancement mastery' },
      focused_power: { name: 'Focused Power', proves: 'True specialisation' },
      universal_power: { name: 'Universal Power', proves: 'Versatility' },
      complete_mastery: { name: 'Complete Mastery', proves: 'Comprehensive mastery' },
    },
  },
  caveats: [
    'The rulebook marks this text as stale for the current 2–6 player game.',
    'No Recognition Points are defined at 6 players, so this package runs 2–5 only.',
    'A 5-component Enchantment earns no Wild power here: the draft names the 4-component one only.',
    'The draft has no rule for a tied final total; tied players share the place.',
  ],
};
