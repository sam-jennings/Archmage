// Candidate C1 "Coherent Claim" — the shortlist's recommended first playtest.
import { hybridConfig, HYBRID_TRIAL_NAMES, HYBRID_SOURCES } from './hybrid-family.js';

export default {
  id: 'c1-coherent-claim',
  label: 'C1 · Coherent Claim',
  status: 'candidate',
  summary: 'Minimum Claim 3 at every player count, +1 Wild power for everyone, Mastery trials worth 7.',
  source: HYBRID_SOURCES.shortlist,
  modelConfig: 'candidates/candidate_c1_coherent_claim.json',
  config: hybridConfig({ id: 'candidate_c1_coherent_claim', floor: 3, masteryReward: 7, focusedAtTwo: true, tiebreaks: 'local', singleSource: 'focused_power' }),
  // Rules the model schema cannot express (the model's own notes say so).
  extras: { baseline_wild: 1 },
  ui: { trials: HYBRID_TRIAL_NAMES },
  caveats: [],
};
