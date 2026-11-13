// Candidate C3 "Open Skies" — no Minimum Claim at all.
import { hybridConfig, HYBRID_TRIAL_NAMES, HYBRID_SOURCES } from './hybrid-family.js';

export default {
  id: 'c3-open-skies',
  label: 'C3 · Open Skies',
  status: 'candidate',
  summary: "No Minimum Claim, +1 Wild power for everyone, Champion's Mark (+4) at 2 players, Mastery trials worth 7.",
  source: HYBRID_SOURCES.shortlist,
  modelConfig: 'candidates/candidate_c3_open_skies.json',
  config: hybridConfig({ id: 'candidate_c3_open_skies', floor: 0, masteryReward: 7, focusedAtTwo: true, tiebreaks: 'local', singleSource: 'focused_power' }),
  extras: { baseline_wild: 1, champions_mark: { player_counts: [2], bonus: 4 } },
  ui: { trials: HYBRID_TRIAL_NAMES },
  caveats: [],
};
