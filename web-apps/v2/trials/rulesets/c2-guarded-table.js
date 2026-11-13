// Candidate C2 "Guarded Table" — the conservative option.
import { hybridConfig, HYBRID_TRIAL_NAMES, HYBRID_SOURCES } from './hybrid-family.js';

export default {
  id: 'c2-guarded-table',
  label: 'C2 · Guarded Table',
  status: 'candidate',
  summary: "Minimum Claim 5, Champion's Mark (+4) at 2 players, Mastery trials worth 8, no extra Wild power.",
  source: HYBRID_SOURCES.shortlist,
  modelConfig: 'candidates/candidate_c2_guarded_table.json',
  config: hybridConfig({ id: 'candidate_c2_guarded_table', floor: 5, masteryReward: 8, focusedAtTwo: true, tiebreaks: 'local', singleSource: 'focused_power' }),
  extras: { champions_mark: { player_counts: [2], bonus: 4 } },
  ui: { trials: HYBRID_TRIAL_NAMES },
  caveats: [],
};
