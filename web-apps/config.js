/**
 * Trials Multiplayer — game configuration (GameConfig)
 *
 * Sourced from `rulebook/Ascension Trials.md` (v2.8, live rules). Defines the six
 * standard trials + Complete Mastery (5+ players) plus the Recognition Points
 * table so `trials-multiplayer.html` can render the voting/results phases.
 *
 * Terminology: this file uses the current energy names (Radiance / Void / Flux /
 * Aether). The internal domain ids `earth / fire / water / air` are legacy names
 * kept in the app code and mapped to the current energies inside the HTML —
 * changing those ids is out of scope for this crash fix.
 *
 * Deliberately NOT included yet — all gated on F8 Ascension Trials reconciliation
 * (`meta/decisions/2026-07-06-f8-ascension-trials-reconcile.md`):
 *   - Echo as a fifth energy domain (5–6p).
 *   - Per-trial 1st/2nd Recognition Point splits for 6p / 7p (the rulebook
 *     explicitly flags these as unresolved).
 *   - Anything from the hybrid rebuild proposal set:
 *       `_review/ASCENSION_TRIALS_02_HYBRID_REBUILD_PROPOSAL_2026-07-06.md` (the ruleset)
 *       `_review/ASCENSION_TRIALS_03_HYBRID_REBUILD_CRITIQUE_2026-07-06.md` (proposed fixes)
 *     — new power curve (2n−3), 4/8/12 Enchantment scale, RP table, Trial set.
 *
 * Purpose here is narrow: restore the app to functional so it stops throwing
 * "Cannot read properties of undefined (reading 'filter')" when players finish
 * spell entry and enter the voting phase.
 */
(function (global) {
  var ELEMENTAL_IDS = ['earth', 'fire', 'water', 'air'];
  var ALL_NON_WILD  = ELEMENTAL_IDS.concat(['transformation', 'enchantment']);

  function includes(arr, id) { return arr.indexOf(id) >= 0; }

  var trials = [
    {
      id: 'energy-purity',
      name: 'Energy Purity',
      description: 'Power from exactly one energy domain. Proves single-energy mastery.',
      isValidAllocation: function (domainsUsed, elementalDomainsUsed) {
        return elementalDomainsUsed.length === 1 && domainsUsed.length === 1;
      },
      getAvailableDomains: function (currentSources) {
        if (currentSources.length === 0) return ELEMENTAL_IDS.slice();
        var first = currentSources[0];
        return includes(ELEMENTAL_IDS, first) ? [first] : [];
      }
    },
    {
      id: 'energy-harmony',
      name: 'Energy Harmony',
      description: 'Power from two or more different energy domains. Proves multi-energy balance.',
      usesBreadthTiebreaker: true,
      isValidAllocation: function (domainsUsed, elementalDomainsUsed) {
        if (elementalDomainsUsed.length < 2) return false;
        // No non-elemental domains permitted.
        for (var i = 0; i < domainsUsed.length; i++) {
          if (!includes(ELEMENTAL_IDS, domainsUsed[i])) return false;
        }
        return true;
      },
      getAvailableDomains: function () { return ELEMENTAL_IDS.slice(); }
    },
    {
      id: 'transformation',
      name: 'Transformation',
      description: 'Transformation domain only. Proves transmutation mastery.',
      isValidAllocation: function (domainsUsed) {
        return domainsUsed.length === 1 && domainsUsed[0] === 'transformation';
      },
      getAvailableDomains: function () { return ['transformation']; }
    },
    {
      id: 'enchantment',
      name: 'Enchantment',
      description: 'Enchantment domain only. Proves internal enhancement mastery.',
      isValidAllocation: function (domainsUsed) {
        return domainsUsed.length === 1 && domainsUsed[0] === 'enchantment';
      },
      getAvailableDomains: function () { return ['enchantment']; }
    },
    {
      id: 'focused-power',
      name: 'Focused Power',
      description: 'Exactly one domain (any type). Proves true specialization.',
      isValidAllocation: function (domainsUsed) {
        return domainsUsed.length === 1;
      },
      getAvailableDomains: function (currentSources) {
        if (currentSources.length === 0) return ALL_NON_WILD.slice();
        return [currentSources[0]];
      }
    },
    {
      id: 'universal-power',
      name: 'Universal Power',
      description: 'Two or more different domains (any mix). Proves versatility.',
      usesBreadthTiebreaker: true,
      isValidAllocation: function (domainsUsed) {
        return domainsUsed.length >= 2;
      },
      getAvailableDomains: function () { return ALL_NON_WILD.slice(); }
    },
    {
      id: 'complete-mastery',
      name: 'Complete Mastery',
      description: 'All three domain types (1+ energy + Transformation + Enchantment). Proves comprehensive mastery. 5+ players only.',
      minPlayers: 5,
      isValidAllocation: function (domainsUsed, elementalDomainsUsed) {
        return elementalDomainsUsed.length >= 1
          && includes(domainsUsed, 'transformation')
          && includes(domainsUsed, 'enchantment');
      },
      getAvailableDomains: function () { return ALL_NON_WILD.slice(); }
    }
  ];

  // Recognition Points by player count.
  // Shape: { <playerCount>: { <trialId>: { <place>: <points> } } }
  // Only 1st place is scored at 2–5p. 6p/7p splits are intentionally omitted
  // (rulebook §"Recognition Points by Player Count" flags them as unresolved).
  var recognitionPoints = {
    2: {
      'energy-purity':   { 1: 6 },
      'energy-harmony':  { 1: 4 },
      'transformation':  { 1: 7 },
      'enchantment':     { 1: 4 },
      'focused-power':   { 1: 6 },
      'universal-power': { 1: 3 }
    },
    3: {
      'energy-purity':   { 1: 8 },
      'energy-harmony':  { 1: 5 },
      'transformation':  { 1: 9 },
      'enchantment':     { 1: 5 },
      'focused-power':   { 1: 7 },
      'universal-power': { 1: 4 }
    },
    4: {
      'energy-purity':   { 1: 8 },
      'energy-harmony':  { 1: 6 },
      'transformation':  { 1: 9 },
      'enchantment':     { 1: 6 },
      'focused-power':   { 1: 7 },
      'universal-power': { 1: 5 }
    },
    5: {
      'energy-purity':    { 1: 8 },
      'energy-harmony':   { 1: 6 },
      'transformation':   { 1: 9 },
      'enchantment':      { 1: 6 },
      'focused-power':    { 1: 7 },
      'universal-power':  { 1: 5 },
      'complete-mastery': { 1: 6 }
    }
    // 6p and 7p intentionally omitted — see header note.
  };

  global.GameConfig = {
    trials: trials,
    recognitionPoints: recognitionPoints,
    powerFormulaDescription: '3-4 ×1, 5-6 ×1.5, 7+ ×2'
  };
})(typeof window !== 'undefined' ? window : globalThis);
