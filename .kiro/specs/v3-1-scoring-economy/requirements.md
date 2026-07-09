---
title: Rulebook v3.1 — Scoring & Economy Bump — Requirements
type: spec-requirements
spec: v3-1-scoring-economy
experiment: vnext-scoring-economy
updated: 2026-07-09
status: proposed
---

# Requirements — Rulebook v3.1 (Scoring & Economy)

## Introduction

This spec formalises applying the `vnext-scoring-economy` experiment bundle to canon as
**rulebook v3.1**, replacing v3.0. The bundle is a single, atomic change set — a rebalanced
Recognition Points table, a redefined RESHAPE, a partial UNLEARN, removal of Unlimited Capacity
with a +1/+3/+5 enchantment ladder, an enchantment effect-timing rule (F3), and an EMPOWER
conversion restriction. It ships all-at-once or not at all.

v3.1 is applied as a **playtest candidate**: it becomes the labelled rulebook version but is held
`under-test` until a live session confirms or kills it. A guaranteed, byte-exact rollback to v3.0
is a hard requirement (rules §3a; git is not relied on in this OneDrive workspace).

Source of the numbers: `meta/experiments/vnext-scoring-economy/proposed/` (machine form:
`proposed/score-table.json`). Supporting analysis: `simulation/SCORING_EV_vnext.md`.

**Locked decisions (Sam, 2026-07-09):** Enchantment scores **4 / 10 / 16** and counter grants
**+1 / +3 / +5**; F3 uses the **"cannot afford action + loss → blocked"** gate; UNLEARN may be
**partial**; EMPOWER **may not** convert a spell into or out of an Enchantment; propagation order
**md → html → code/apps**; close/update all coupled decisions; archive so v3.0 is fully restorable.

---

## Requirement 1 — Recognition Points table

**User Story:** As the designer, I want the v3.1 Recognition Points table to replace v3.0, so that
scoring tracks build-difficulty and the end-game concentration exploit is defused.

#### Acceptance Criteria
1. THE scoring reference SHALL define, for sizes 3–15, the columns: Conjuration
   `0,1,2,3,7,13,20,29,38,50,63,79,100`; Transfiguration `3,4,5,7,8,10,13,16,20,25,31,38,48`;
   Perfect Transmutation `5,11,18,24,31,39,47,56,65,74,85,97,100`.
2. THE table SHALL set Enchantment (sizes 3/4/5) to `4 / 10 / 16`.
3. THE table SHALL satisfy the identity Conjuration-15 = Perfect-Transmutation-15 = 100.
4. Every column SHALL be strictly increasing in size, and every spell except Conjuration-3 SHALL
   score ≥ 1 (Conjuration-3 = 0).
5. WHEN a configuration exceeds size 15, THE rules SHALL NOT award points beyond the size-15 value
   (max spell size 15, per F6 — unchanged).
6. THE embedded score table and anchors in `simulation/scoring_ev.py` (the checked canon mirror)
   SHALL be updated to these values so `python scoring_ev.py selfcheck` passes.

## Requirement 2 — Enchantment ladder & Unlimited Capacity removal

**User Story:** As the designer, I want Unlimited Capacity gone and the ladder finite, so that the
capacity economy stays bounded and the RESHAPE cost and score table can bite as intended.

#### Acceptance Criteria
1. THE rules SHALL remove Unlimited Capacity entirely: no UC state, no UC marker component, no
   "UC players skip Recall", no "unlimited learning actions".
2. THE enchantment ladder SHALL grant counters **+1 (3-card) / +3 (4-card) / +5 (5-card)** as
   cumulative totals, and SHALL score **4 / 10 / 16**.
3. THE 5-card Enchantment SHALL remain reachable only in 5–6 player (Echo) decks (F6 — unchanged).
4. WHEN Unlimited Capacity is removed, THE Casting rules SHALL read "cast up to [capacity] spells"
   for all players (no "cast all") and THE Recall step SHALL apply to all players.
5. THE term "Unlimited Capacity" SHALL be added to `meta/canon.yml` `retired_terms` and SHALL NOT
   appear in any vocab-scanned content (rulebook, card-design, web-apps, board, pitch).

## Requirement 3 — RESHAPE (per-spell counter cost)

**User Story:** As the designer, I want RESHAPE priced per spell broken, so that end-game
consolidation costs counters in proportion to how much is torn down.

#### Acceptance Criteria
1. THE RESHAPE action SHALL cost **one counter per spell broken down** (breaking N spells costs N
   counters), replacing v3.0's "any/all spells for one action".
2. Freed components SHALL redistribute into valid spell arrangements; all components SHALL remain in
   valid spells.
3. WHEN a RESHAPE reduces an Enchantment's size, THE capacity loss SHALL be proportional to the tier
   reduction (consistent with Requirement 4), not a flat full loss.

## Requirement 4 — UNLEARN (partial, proportional capacity loss)

**User Story:** As a player, I want to reclaim a single component and step a spell down one size, so
that adjusting a spell does not force me to dissolve it and lose all its capacity.

#### Acceptance Criteria
1. THE UNLEARN action SHALL allow returning **one or more** components from a single spell to hand,
   provided the remainder is a valid spell OR the spell fully dissolves.
2. THE UNLEARN action SHALL cost 1 counter (one learning action) regardless of how many components
   are returned from that one spell.
3. WHEN an Enchantment is reduced or dissolved, THE capacity lost SHALL equal the difference between
   its old and new ladder totals (5→4 = −2, 4→3 = −2, 3→dissolved = −1; full dissolves lose the whole
   grant).
4. FOR runs (Transfiguration, Perfect Transmutation), a single-component partial UNLEARN SHALL only
   remove an end component (removing a middle component is not a valid single-spell downgrade).
5. Returned components SHALL be unavailable for new spells until the player's next turn (unchanged
   UNLEARN clause).

## Requirement 5 — Enchantment effect timing (F3)

**User Story:** As the designer, I want enchantment capacity changes timed to prevent same-turn
bursts and free-lunch teardowns, so that capacity cannot be gamed.

#### Acceptance Criteria
1. WHEN a player learns or empowers an Enchantment, THE added capacity SHALL become available only
   from the start of their next turn.
2. WHEN a player reduces or dissolves an Enchantment, THE capacity loss SHALL apply immediately.
3. IF a player cannot pay the action's counter cost AND absorb the immediate capacity loss from their
   currently available counters, THEN THE action SHALL NOT be performed (the "cannot afford action +
   loss → blocked" gate).
4. THE rulebook SHALL include a worked example of the gate (e.g. a sole 4-card Enchantment).

## Requirement 6 — EMPOWER conversion restriction

**User Story:** As the designer, I want EMPOWER unable to cross the Enchantment boundary, so that
capacity can only be created/removed via LEARN/UNLEARN and F3 has no EMPOWER edge case.

#### Acceptance Criteria
1. THE EMPOWER action SHALL be able to extend a spell or convert among Conjuration / Transfiguration /
   Perfect Transmutation.
2. THE EMPOWER action SHALL NOT convert a spell into an Enchantment, nor an Enchantment into another
   type. Becoming or ceasing to be an Enchantment SHALL require LEARN or UNLEARN.

## Requirement 7 — Reversibility to v3.0 (mandatory)

**User Story:** As the designer, I want a guaranteed rollback to v3.0, so that if v3.1 fails
playtest I can restore the exact prior rules without relying on git.

#### Acceptance Criteria
1. BEFORE any canon-bearing file is edited, THE process SHALL copy it byte-exact into
   `_archive/<basename>-v3.0-2026-07-09/` and index it in `_archive/README.md` (rules §3a).
2. THE archived v3.0 set SHALL cover every file changed by this bump (rulebook, scoring reference,
   glossary, both web references, and the digital-build files), not only the two `versioned_files`.
3. WHEN v3.1 is reverted, THEN restoring the archived copies and resetting `canon.yml`
   `rulebook_version` to v3.0 SHALL return every canon file to its exact v3.0 content, and the
   governing decision SHALL be set to `reverted`.
4. WHILE v3.1 is unconfirmed, THE changed rule files SHALL carry `status: under-test` and the
   governing decision SHALL be `experiment`.

## Requirement 8 — Propagation & canon consistency

**User Story:** As the designer, I want every rules surface updated consistently and the checker
green, so that no stale v3.0 statement survives.

#### Acceptance Criteria
1. THE bump SHALL be propagated in priority order **markdown → html → code/apps**.
2. THE following SHALL reflect v3.1: `rulebook/Scoring System Reference.md`,
   `rulebook/Archmage Ascension - Complete Rulebook.md`, `rulebook/GLOSSARY.md`,
   `web-apps/archmage-reference.html`, `web-apps/player-reference/player-reference.html`, and the
   digital build (`web-apps/archmage-ascension/` — `RULES_SUMMARY.md`, `game/state.js`,
   `game/*.jsx` scoring/UC/reshape/unlearn/empower logic).
3. `meta/canon.yml` SHALL be updated: `rulebook_version: v3.1`, the `enchantment_ladder` fact, and
   `retired_terms` += `Unlimited Capacity`.
4. THE two `versioned_files` SHALL carry `version: v3.1` front-matter matching `rulebook_version`.
5. WHEN the bump is complete, `node meta/checks/check.mjs` SHALL report no new flags (versioned files
   match, retired term absent from scanned content, no open propagation boxes on the governing
   decision) and `python scoring_ev.py selfcheck` SHALL pass.
6. WHERE a source of truth exists, edits SHALL be made there — no parallel copies (the
   `web-apps/archmage-ascension/uploads/*` mirrors are excluded from the vocab scan and are not canon).

## Requirement 9 — Decision closure

**User Story:** As the designer, I want the coupled decisions closed or updated, so that the register
reflects v3.1.

#### Acceptance Criteria
1. THE bump SHALL be recorded as a decision (`2026-07-09-v3-1-scoring-economy-bump.md`) with a canon
   delta and a propagation checklist.
2. F3 (`2026-07-06-f3-enchantment-timing.md`) SHALL be updated to the "cannot afford → blocked" gate
   and folded into v3.1.
3. F4 (enchantment scoring rationale) SHALL be superseded — its "keep 6/12/18 because UC is the
   reward" basis is void once UC is removed; v3.1 sets 4/10/16.
4. F6's "Unlimited Capacity is 5–6p-only" clause SHALL be marked superseded (no UC at all); its
   max-size-15 and wild rulings stand.

---

## Out of scope (non-goals)

- Deck structure (Option 2 / Echo), starting counters, max size 15, wild rule — all v3.0, unchanged.
- F1 counter mechanic — **fixed as current counters** for this bump (Sam, 2026-07-09); no
  gauge/round-trip change; not a blocker.
- F5 game-end procedure / Source-emptying timing — adjacent; confirm no contradiction, do not bundle.
- Ascension Trials (F8) — excluded.
- Printed card / export regeneration — blocked by the F14 hold; physical components will lag v3.1
  (reference tools are source of truth during playtest).
- Calibrating the sim's enchantment uptake / the reshape-vs-counter balance — a playtest question,
  not part of this bump.
