---
title: Ascension Trials Configuration Model — Tasks
type: spec-tasks
spec: ascension-trials-configuration-model
scope: VS1 and VS2
updated: 2026-07-10
status: proposed
requirements_source: requirements.md
design_source: design.md
---

# Tasks — Ascension Trials Configuration Model

## Project

**Name:** Ascension Trials Configuration Model  
**Spec ID:** `ascension-trials-configuration-model`  
**Scope:** VS1 and VS2  
**Status rule:** A task is complete only when its tests and acceptance criteria pass.

## Execution rule

Kiro must pause feature coding until Requirements and Design are approved. Existing code is treated as an implementation candidate to reconcile, not as completed work.

---

- [x] 1. Reconcile existing implementation with the approved spec
  - Inventory every existing module, class and public function.
  - Map each item to requirements and design sections.
  - Identify missing behaviour, conflicting semantics and unused code.
  - Produce a short reconciliation note before modifying code.
  - Do not mark any prior module complete based on successful imports.
  - _Requirements: REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-6, REQ-7, REQ-8, REQ-15_

- [x] 2. Finalize package and repository integration
  - Ensure `ascension-trials/ascension_trials_model/` uses the approved package layout.
  - Add `requirements.md`, `design.md` and `tasks.md` under the Kiro spec location and mirror/reference them in project docs as appropriate.
  - Pin pytest, NumPy and SciPy dependencies.
  - Ignore generated outputs.
  - Update `meta/manifest.yml`.
  - Plan document relocation and cross-reference repairs, but do not let housekeeping block core tests.
  - _Requirements: REQ-15, NFR-1, NFR-2_

- [x] 3. Complete and test the configuration schema
  - Implement all enumerated domain, eligibility, allocation, invalidation, reward and tiebreak tokens.
  - Remove or reject undefined generic `custom` behaviour.
  - Validate contradictory eligibility predicates.
  - Validate state-closure requirements for final tiebreaks.
  - Add unit tests for valid and invalid schema examples.
  - _Requirements: REQ-1, REQ-2, REQ-5, REQ-8_

- [x] 4. Complete Spellbook input, standard scoring q(S) and Trials power derivation F_C(S)
  - Implement the Spellbook schema: typed spells with spell ID, type, size, and energy domain where applicable.
  - Compute standard Recognition Points q(S) by loading or adapting the current standard scoring reference `rulebook/Scoring System Reference.md` (v3.1); do NOT embed an obsolete standard score table.
  - Derive candidate-specific Trials domain power F_C(S) through configuration data, on a code path independent of q(S).
  - Implement Perfect Transmutation's configured energy-domain and Transformation contributions and its +1 Wild grant.
  - Implement candidate-specific Enchantment Trial power (domain power from Enchantment size) and Wild generation (each 4-component Enchantment grants +1 Wild).
  - Encode the current `rulebook/Ascension Trials.md` v2.8 formula (size multiplier 1.0 for 3–4, 1.5 half-up for 5–6, 2.0 for 7+) as the current-candidate Trials power profile `trials_power_v28`.
  - Encode the `2n−3` family and the Enchantment 4/8/12 scale ONLY as an explicitly experimental candidate (`experimental: true`); never label it current standard scoring or the current Trials candidate.
  - Record provenance on every derived state: scoring-reference version and content hash for q(S); Trials-power-profile version for F_C(S).
  - Add the Maya Spellbook fixture (7-card Void Conjuration, 5-card Transfiguration, 4-card Enchantment, 6-card Aether Perfect Transmutation) and verify each profile reproduces its own oracle: the current candidate (v2.8) derives F_C(S) = Void 14, Aether 9, Transformation 17, Enchantment 4, Wild 2; the experimental 2n−3 profile derives Void 11, Aether 9, Transformation 16, Enchantment 8, Wild 2, matching the source-backed A16 worked example.
  - Verify A16 and A17.
  - Add independence tests proving standard scoring and Trials power are decoupled:
    - changing the standard score table changes q(S) but does not change F_C(S);
    - changing the Trials power profile changes F_C(S) but does not change standard Recognition Points q(S);
    - each profile reproduces its own worked-example oracle (current candidate v2.8 = 14/9/17/4/2; experimental 2n−3 = 11/9/16/8/2), and the source-backed A16 example is confirmed to exercise the experimental profile;
    - experimental profiles are clearly labelled and cannot be mistaken for canon.
  - _Requirements: REQ-3, REQ-9, REQ-14_

- [x] 5. Complete declarative eligibility
  - Implement allowed IDs and classes.
  - Implement source-count universes.
  - Implement min/max source counts.
  - Implement required per-class/domain ranges.
  - Encode Complete Mastery declaratively.
  - Add tests for Purity, Harmony, Transformation, Enchantment, Focused, Universal and Complete Mastery.
  - Verify Wild never counts as a source.
  - _Requirements: REQ-2, REQ-6_

- [x] 6. Complete allocation validation and completion semantics
  - Reconcile every source ledger exactly.
  - Implement optional, maximal and full completion.
  - Implement explicit full-allocation fallback.
  - Implement maximality proof by finding a legal destination for any addable residue unit.
  - Add infeasible-fullness fixture A8.
  - _Requirements: REQ-4_

- [x] 7. Complete invalidation and Wild behaviour
  - Implement per-entry illegality.
  - Implement whole-domain invalidation for normal over-allocation.
  - Implement Wild over-allocation policy.
  - Drop attached Wild when the normal entry is illegal.
  - Emit complete invalidation trace.
  - Verify A9, A10 and A11.
  - _Requirements: REQ-5, REQ-6, REQ-7_

- [x] 8. Complete Trial and final tiebreak comparators
  - Implement preferred local comparators.
  - Implement historical Utilization, Focus, Efficiency, Commitment and Breadth using `Fraction`.
  - Implement all final-result tiebreak tokens.
  - Add focused unit tests for numerator/denominator semantics.
  - Verify the A7 monotonicity fixture's specific resolutions.
  - Verify A12 tie-cascade ordering and reward suppression.
  - _Requirements: REQ-8, REQ-7_

- [x] 9. Finalize deterministic resolver
  - Enforce the approved 13-step pipeline.
  - Normalize all input ordering.
  - Generate deterministic audit hashes.
  - Ensure every RP award is traceable.
  - Add swap and domain-relabel tests A1 and A2.
  - Run MATH-1, MATH-2, MATH-3, MATH-4 and VS1 part of MATH-8.
  - _Requirements: REQ-7, NFR-1, NFR-2, NFR-4_

- [x] 10. Author committed configurations
  - Author `baseline_v28_stale.json`.
  - Author `hybrid_rebuild.json`.
  - Author four toy configurations.
  - Mark historical baseline metadata correctly.
  - Validate all six configurations via CLI and tests.
  - Do not clean up historical semantics inside the historical candidate.
  - _Requirements: REQ-1, REQ-9_

- [x] 11. Author the complete VS1 fixture library
  - Store A1, A2, A7, A8, A9, A10, A11, A12, A16 and A17 as data.
  - Record source/oracle provenance in each fixture.
  - Ensure expected values are independent from generated implementation output.
  - _Requirements: REQ-9, REQ-14_

- [x] 12. Build and run the VS1 acceptance suite
  - Add pytest coverage for every VS1 requirement.
  - Run all tests.
  - Fix implementation defects rather than weakening oracles.
  - Record exact command and result.
  - Do not begin VS2 until the suite is green and reviewed.
  - _Requirements: REQ-1 through REQ-9, REQ-14, REQ-15_

- [x] 13. Implement deterministic CLI and VS1 reports
  - Add configuration validation command.
  - Add fixed-profile resolver command.
  - Add fixture runner.
  - Generate deterministic JSON and Markdown.
  - Include evidence metadata, audit hash and source provenance.
  - Verify repeated runs are byte-stable where timestamps are excluded or normalized.
  - _Requirements: REQ-14, REQ-15, NFR-1_

- [x] 14. Complete VS1 repository housekeeping
  - Move specifications to their approved permanent location.
  - Move reviews to `_review/`.
  - Update all cross-references.
  - Update manifest.
  - Remove or declare the root `Ascension Trials/` folder.
  - Run repository checks and clear the existing checker warning.
  - _Requirements: REQ-15_

- [x] 15. VS1 approval gate
  - Produce a VS1 completion report containing:
    - requirements coverage;
    - test command and output;
    - fixture results;
    - unresolved warnings;
    - repository-check result;
    - exact file list.
  - Stop for review.
  - Do not begin VS2 without approval.
  - _Requirements: REQ-14, REQ-15_

- [x] 16. Implement small-state allocation enumeration
  - Generate deterministic weak compositions by source.
  - Combine normal and Wild allocations.
  - Validate every complete allocation.
  - Enforce optional/maximal/full completion.
  - Add size and memory estimates.
  - Refuse over-limit exact analysis.
  - Verify A3 has 15 and A4 has 84 legal allocations.
  - _Requirements: REQ-10, NFR-4_

- [x] 17. Implement strategic-equivalence collapse
  - Normalize structural duplicates.
  - Build behavioural signatures from full matrix behaviour.
  - Retain representative/member mappings.
  - Verify A15-style invariance once its fixture is available.
  - _Requirements: REQ-11_

- [x] 18. Implement two-player payoff matrices
  - Build exhaustive win and margin matrices.
  - Record tie and Trial-award signatures.
  - Use deterministic strategy ordering.
  - Add memory guards.
  - _Requirements: REQ-12, NFR-1_

- [x] 19. Implement strict-dominance analysis
  - Implement true all-columns strict comparison.
  - Remove all dominated strategies simultaneously per round.
  - Add weak-dominance diagnostics separately.
  - Add a dedicated weak-but-not-strict fixture.
  - Record elimination rounds and dominators.
  - _Requirements: REQ-11_

- [x] 20. Implement numerical zero-sum solver
  - Use SciPy HiGHS.
  - Solve win and margin games separately.
  - Record residuals and tolerances.
  - Label results `numerical_lp`.
  - Verify A4 value is 0 within tolerance.
  - _Requirements: REQ-12, NFR-3_

- [x] 21. Implement canonical maximum-entropy equilibrium
  - Define the optimal-strategy polytope.
  - Maximize Shannon entropy deterministically.
  - Validate optimality constraints after solving.
  - Report raw/normalized entropy and supports.
  - Label results `numerical_convex`.
  - _Requirements: REQ-13, NFR-3_

- [x] 22. Implement \(\mathcal E^{0.01}\)
  - Maximize each strategy's possible equilibrium mass.
  - Apply the \(0.01-10^{-9}\) threshold.
  - Add a multiple-equilibrium fixture with a known support-mass oracle.
  - _Requirements: REQ-13_

- [x] 23. Implement VS2 metrics and reports
  - Report legal/maximal/collapsed counts.
  - Report \(\mathcal R\) and \(\mathcal E^{0.01}\).
  - Report equilibrium values, probabilities and entropy.
  - Report tie rates, counterability, margins, distances and margin-VOI.
  - Preserve evidence labels.
  - _Requirements: REQ-11, REQ-12, REQ-13, REQ-14_

- [x] 24. Run the VS2 acceptance suite
  - Verify A3, A4, A5 and A6 exact counts and tie rates.
  - Verify strict-vs-weak dominance.
  - Verify A4 numerical equilibrium.
  - Verify equilibrium-relevant mass fixture.
  - Fix all failures without changing mathematical oracles.
  - _Requirements: REQ-10, REQ-11, REQ-12, REQ-13_

- [x] 25. VS2 approval gate
  - Generate a complete VS2 report.
  - State exact, numerical and deferred claims separately.
  - List matrix limits and numerical residuals.
  - Stop for review.
  - Do not begin VS3–VS6.
  - _Requirements: REQ-14, REQ-15_
