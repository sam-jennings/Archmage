// The hybrid rebuild as first proposed (design-history file 02), before the shortlist's
// fixes. Kept so a table can compare a candidate against the proposal it came from.
import { hybridConfig, HYBRID_TRIAL_NAMES, HYBRID_SOURCES } from './hybrid-family.js';

export default {
  id: 'hybrid-rebuild',
  label: 'Hybrid rebuild (as proposed)',
  status: 'proposal',
  summary: 'The first rebuild: 2n − 3 power, Enchantments worth 4 / 8 / 12, no Minimum Claim, ratio tiebreaks.',
  source: HYBRID_SOURCES.proposal,
  modelConfig: 'hybrid_rebuild.json',
  config: hybridConfig({ id: 'hybrid_rebuild', floor: 0, masteryReward: 8, focusedAtTwo: false, tiebreaks: 'hybrid_ratios', singleSource: 'focused_power' }),
  extras: {},
  ui: { trials: HYBRID_TRIAL_NAMES },
  caveats: ['Its tiebreaks compare how much of your whole Spellbook you committed. The shortlist replaced them because adding power elsewhere could cost you a tie.'],
};
