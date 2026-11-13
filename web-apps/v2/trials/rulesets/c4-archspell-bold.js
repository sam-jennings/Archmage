// Candidate C4 "Archspell Bold" — C1 with Focused Power replaced by the Trial of the
// Archspell (critique file 03, section 3). The analysis model cannot express a per-spell
// rule, so this package has NO model configuration and no screening evidence.
import { hybridConfig, HYBRID_TRIAL_NAMES, HYBRID_SOURCES } from './hybrid-family.js';

export default {
  id: 'c4-archspell-bold',
  label: 'C4 · Archspell Bold',
  status: 'candidate',
  summary: 'C1, with Focused Power replaced by the Trial of the Archspell: all power there must come from one single spell.',
  source: HYBRID_SOURCES.shortlist,
  modelConfig: null,
  config: hybridConfig({ id: 'candidate_c4_archspell_bold', floor: 3, masteryReward: 7, focusedAtTwo: true, tiebreaks: 'local', singleSource: 'archspell' }),
  extras: { baseline_wild: 1 },
  ui: { trials: HYBRID_TRIAL_NAMES },
  caveats: ['Unscreened: the analysis model has no evidence for or against this trial.'],
};
