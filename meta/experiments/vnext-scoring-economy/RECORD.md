---
title: Experiment — vnext scoring & economy rebalance (bundle)
type: experiment
decision: meta/decisions/2026-07-08-vnext-scoring-economy-experiment.md
started: 2026-07-08
status: applied-under-test
---

# Experiment: vnext-scoring-economy

**STATUS: APPLIED — UNDER-TEST.** This bundle has been **applied to canon as rulebook v3.1**
and is held **under-test** pending a live playtest. It was executed end-to-end via the Kiro spec
`.kiro/specs/v3-1-scoring-economy/`; governing decision
`meta/decisions/2026-07-09-v3-1-scoring-economy-bump.md` (status `experiment`). Canon
(`meta/canon.yml`, `rulebook/Scoring System Reference.md`, the Complete Rulebook) **is now
rulebook v3.1 (under-test)** — it is no longer v3.0. A byte-exact v3.0 rollback is preserved in
`_archive/*-v3.0-2026-07-09/` (authoritative file list in `_archive/README.md`; procedure in the
governing decision §7). On playtest CONFIRM, Task 19 flips the decision to `canon` and retires
this folder; on KILL, restore that archive, reset `canon.yml`, and set the decision `reverted`.

## What's in the bundle (candidates, held in `proposed/`)

1. **Score table** (`proposed/score-table.md`) — one shared table for **both decks (4E & 5E)**,
   derived from the utility model (`utility-model-input-sets.md`): ceiling Conj15 = PT15 = 100
   (identity), **C3 = 0 floor with strictly-increasing columns**, PT steep, Conjuration convex,
   Transfiguration ~½ of PT at the top (**TF15 = 48**), Enchantment **4/10/16** (provisional),
   integers.
2. **RESHAPE redefinition** (`proposed/reshape-rule.md`) — **one counter per spell broken down**
   (break one or more spells, redistribute into valid spells; N spells → N counters), replacing
   canon's "break down any/all spells for one action". Rig-tested 2026-07-09: a weak bound under
   the +1/+3/+5 ladder (see Log).
3. **Enchantment / Unlimited Capacity change** (`proposed/enchantment-capacity.md`) —
   decision (1): Sam leaning REMOVE Unlimited Capacity; ladder → +1/+3/+5 counters; reprice
   the Enchantment score column (6/12/18 looks high vs the rebalanced C/T/PT). Least settled.

They interact — promoting TF re-opens the end-game concentration exploit the RESHAPE rule is
meant to close (rig-tested 2026-07-09: it only weakly does — see Log); removing UC changes the
action economy both assume — which is why they're one version.

## Analysis backing it (kept in place, not moved)

- `simulation/PER_DECK_ANALYSIS_2026-07.md` — per-deck over/under-power (priced WITH wilds)
- `simulation/SCORING_EV.md`, `simulation/SCORING_EV_candidate.md` — Part A pricing + Part B exploit
- `simulation/results/combined_candidate_tf_half.json` — earlier candidate table (superseded)
- `tools/scoring models/recorded_target_tables.json` + `utility-model-input-sets.md` — current
  shared table (machine form), derived from the utility scoring model
- `_review/RESHAPE_BOUNDING_OPTIONS_2026-07.md` — why the fix moved to the score table

## Confirm criteria (live playtest — v3.1 is applied under-test)

v3.1 is CONFIRMED when a live session shows: **Transfiguration is still worth playing** live,
**the end-game concentration ("T15") play is controlled** (no new dominant exploit replaces it),
**the low end reads sensibly as integers** (C3 = 0, every other spell ≥ 1), and **enchantment
pursuit / UC-removal feels good** (uptake rises under the finite +1/+3/+5 ladder and the Drought
stays tense). On CONFIRM, Task 19 sets the governing decision `canon`, removes the `under-test`
markers, and retires this folder.

## Kill criteria

v3.1 is KILLED if play is **worse than v3.0** — a new dominant exploit appears, Transfiguration
is dead, or enchantments are still non-viable — or Sam prefers a different shape. **Canon HAS
changed** (it is now v3.1), so a kill requires the **§7 rollback**: copy the byte-exact v3.0
files from `_archive/*-v3.0-2026-07-09/` back over the live files (authoritative list in
`_archive/README.md`), reset `meta/canon.yml` (`rulebook_version: v3.0`, restore the
`enchantment_ladder` fact, drop `Unlimited Capacity` from `retired_terms`), remove the
`status: under-test` markers, and set the governing decision
`2026-07-09-v3-1-scoring-economy-bump.md` `reverted`. (Git is not relied on — OneDrive workspace.)

## On adoption (single version bump)

> **Carried out 2026-07-09 (under-test):** this plan has now been executed — the bundle was
> applied as rulebook v3.1 via `.kiro/specs/v3-1-scoring-economy/` and is held under-test (see
> the banner and Log). Setting this experiment's decision to `canon` and deleting this folder is
> **Task 19**, done on playtest PASS. The original plan is kept below for reference.

When Sam says "ready to playtest", apply the whole bundle at once:
- Bump `rulebook_version` v3.0 → next in `meta/canon.yml`, and the `version:` front-matter of
  every file in `canon.yml → versioned_files` (currently the Complete Rulebook + Scoring System
  Reference) — the checker enforces lockstep (process §3a).
- `rulebook/Scoring System Reference.md` — swap in the table from `proposed/score-table.md`.
- `rulebook/Archmage Ascension - Complete Rulebook.md` — RESHAPE from `proposed/reshape-rule.md`;
  enchantment/UC rules from `proposed/enchantment-capacity.md` if UC is removed.
- `meta/canon.yml` — update `enchantment_ladder` (if UC removed); record scoring facts.
- `web-apps/archmage-reference.html` + digital build — score values, RESHAPE, ladder.
- Write the adoption decision(s) under `meta/decisions/`, set this experiment's decision to
  `canon`, delete this folder.

## Log

- 2026-07-08 — Experiment opened. Candidate score table + RESHAPE redefinition built and
  rig-checked; enchantment/UC still open. An earlier attempt this session wrongly wrote parts of
  the bundle to canon (v3.0 scoring table, `canon.yml`, rulebook RESHAPE, two `status: canon`
  decision files) — all reverted; canon restored to v3.0; work relocated here.
- 2026-07-08 — Recorded utility-model input sets that make the *utility-adjusted
  unrounded score* tables round to the target shape (C3 = 0, every other spell ≥ 1,
  each column strictly increasing, PT15 = 100, PT ≥ TF at every size) — one set per
  deck, since the utility inputs are global. See `utility-model-input-sets.md`. The
  workbook (`tools/scoring models/…v4_formula_corrected.xlsx`) is loaded with the
  Deck 1 set. NOTE: this shape (C3 = 0, strictly-increasing low end) differs from the
  current `proposed/score-table.md` candidate (Conj 1,1,2,2 at the low end) — the
  candidate table is unchanged, pending Sam's call on which low-end shape to keep.
- 2026-07-08 — Added a **shared table for both decks** (A = 4E, B = 5E) to
  `utility-model-input-sets.md`. A single shared input set can't hit both decks'
  targets (Deck A's targets pin the inputs; Deck B then fails C3 = 0), so the shared
  table blends each deck's own optimal table: midpoint for sizes 3–9 (decks agree
  closely there — PT identical), ramping to Deck A for sizes 10–15 (PT15 = 100 from A;
  Deck B PT15 relaxed as unreachable). Machine form: `shared_table` in
  `recorded_target_tables.json`; blend logic in `record_target_tables.py`.
- 2026-07-08 — Improved the shared table: instead of a midpoint of the two standalone
  optimal tables, hold Deck A fixed and **re-tune Deck B with its PT15 ceiling relaxed**
  (alpha 0.79, lambda 0.55, scale 3.0, TF-role 0.15; free scale) so B hugs A across sizes
  3–9, then A-favoured blend (wA=0.65 at ≤9 → 1.0 at 15). Cuts the common-size (7–8)
  per-deck error from ±2 to ≤±1. Updated `utility-model-input-sets.md` and the
  `shared_table` block in `recorded_target_tables.json`; re-tune logic in `_matchB.py`.
- 2026-07-08 — **Promoted the shared table to be the current `proposed/score-table.md`**
  (supersedes the earlier candidate: flat low-end Conj 1,1,2,2, TF15=55, Enchantment at
  canon values). Also **decoupled Enchantment** from the Conj/TF/PT re-tune — the re-tune's
  high lambda over-discounted capacity and flattened the top (was 4,9,11); Enchantment now
  blends Deck A with Deck B *standalone* → **4 / 10 / 16** (jumps +6/+6). Enchantment
  magnitude still provisional (open UC/capacity reprice). Proposal table: Conj 0,1,2,3,7,13,
  20,29,38,50,63,79,100 / TF 3,4,5,7,8,10,13,16,20,25,31,38,48 / PT 5,11,18,24,31,39,47,56,
  65,74,85,97,100 / Ench(3–5) 4,10,16.
- 2026-07-08 — Wrote `score-table-derivation.md`: full methodology for the theoretical table
  (pre-sim/playtest) — the three difficulty models (raw / marginal / fixed-opportunity, and the
  "variable opportunity" clarification), how they blend (Combined_Fixed, alpha 0.8), the utility
  layer + parameters, the five per-deck targets and why, parameter balancing (thin ridge for A,
  roomy for B), the two-deck → shared blend (A anchored, B re-tuned with relaxed ceiling,
  Enchantment decoupled), per-deck generosity (Conjuration under-paid in B / TF over-paid in B /
  PT ≈ fair), and an explicit assumptions list mapped to the knob that controls each.
- 2026-07-08 — Folded the initial ChatGPT exploration into `score-table-derivation.md`: added a
  "How the model evolved (the forks, and the dead-ends)" section (marginal-outs → open/closed
  runs → −ln(p) → raw-vs-marginal split → fixed-opportunity → variable-m rejected → utility layer
  → UC drop + TF role → repo tuning/blend + workbook fixes), and enriched the model sections with
  the open/closed-run refinement, the "same denominator ≠ same probability" 4E-vs-5PT embedding
  insight, and the player-count variable-window finding.
- 2026-07-09 — **Rig-tested the current bundle** (candidate score table + enchantment
  ladder +1/+3/+5 with UC removed + a **reshape-cost rule "one counter per spell broken"**).
  This is the actual proposed rule (Sam confirmed 2026-07-09 — one counter per spell broken);
  `proposed/reshape-rule.md` has been corrected to match (an earlier uncommitted draft had tacked
  on a stray EMPOWER-throttle clause). Rig changes (backward-compatible, defaults unchanged): `archmage_deck_sim.py` `Rules`
  gained `tier5_counters` + `uc_enabled` (tier-5 grants counters instead of UC when UC off);
  `scoring_ev.py` gained `--score-table` machine table `proposed/score-table.json`, a
  `--tier3/4/5-counters` + `--no-uc` ladder, `--configs all` (adds Deck B 5/6p), and two Part-B
  variants — `reshape_free` (unlimited breaks = free-reshape ceiling) and `reshape_cost` (break
  ≤ `counters` spells = the rule under test), both keep-some/forge-one. Self-checks pass
  (added a reshape-cost monotonicity property). Artifacts: `simulation/SCORING_EV_vnext.md`
  + `simulation/results/scoring_ev_vnext.json` (seed 42, 10k/50k trials, all 5 player counts).

  **Findings (2p headline; pattern holds 2–6p):**
  1. **The TF over-pricing (the "T15" problem) is fixed by the table.** Part A shows no
     TF-vs-PT inversion under the candidate table (TF7=8 < PT5=18; TF is now correctly the
     cheapest big spell). Holding economy/agent/seed fixed and changing **only the table**
     (canon TF15=95 → candidate TF15=48), the end-game reshape at 2p drops from **+47.4 → +26.7**
     points and the reshaped spell lands on a Transfiguration **89% → 44%** of the time. Across
     3–6p the reshape's TF-share falls from ~60–78% (canon) to ~38–45% (candidate). So nothing
     replaces Transfiguration as a single over-rewarded target — the residual reshape gain is
     spread across families (PT/Conj/TF/Ench) and reflects "consolidate the pool into its best
     single spell," not a mispricing.
  2. **The reshape-cost rule barely bites, because the +1/+3/+5 ladder makes counters ≳ spells.**
     reshape_cost ≈ reshape_free everywhere (2p +26.7 vs +27.7; 6p +4.2 vs +4.5) because players
     end with more counters than committed spells (2p: 7.0 vs 6.0; afford-to-break-whole-book in
     63–81% of games across configs). Structural: a tier-4 enchantment is 1 spell to break but
     grants +3 counters, so enchantment-bearing books always have counter ≳ spell headroom.
     Note: the "~+5" figure in earlier notes/QUEUE was a size-8 **absolute** result-cap PROXY,
     NOT this rule — an absolute cap is a different, much stronger constraint. **Takeaway for the
     bundle's open reshape question: the proposed "one counter per spell broken" is a weak bound
     under this ladder; a firmer bound needs a leaner counter economy or an actual size cap.**
  3. **Caveat — absolute marginals are inflated ceilings.** Under the candidate table small
     conjurations score ~0 (Conj3–6 = 0/1/2/3), so the greedy agent (which doesn't chase big
     spells) banks a near-worthless book that reshape then consolidates; a skilled player building
     bigger spells directly would see a smaller reshape delta. The robust, agent-independent
     signals are the Part-A pricing fix and the reshape TF-share collapse, not the absolute +pts.
  4. **Enchantment at 5–6p prices slightly over** (E4/E5 ratio ~1.3–1.6) — consistent with the
     RECORD's note that Enchantment magnitude (4/10/16) is provisional and tied to the open
     UC/capacity reprice.

  Reproduce (from `simulation/`):
  `python scoring_ev.py analyze --trials 10000 --hand-trials 50000 --seed 42 --score-table ../meta/experiments/vnext-scoring-economy/proposed/score-table.json --tier3-counters 1 --tier4-counters 3 --tier5-counters 5 --no-uc --configs all --json results/scoring_ev_vnext.json --md SCORING_EV_vnext.md`
  Table-effect control (canon table, same ladder): drop `--score-table`.
- 2026-07-09 (follow-up, prompted by Sam) — **The ~7-counter figure is a sim artifact, and the
  reshape rule's bite is counter-sensitive — so the "weak bound" claim above is conditional, not
  settled.** Diagnostic (2p, vnext ladder): players end with **~3.1 enchantments each** (1.7 tier-3
  + 1.4 tier-4 → 1 + 1.7 + 4.3 ≈ 7 counters; the grant arithmetic checks out, no bug — and note +5
  tier-5 is unreachable in the 4E 2–4p deck, so the 7 is all tier-3/4). But ~3 enchantments/player
  contradicts observed play (Session 3: only 2 of 5 players learned even one; enchantment pursuit is
  documented "non-viable"). The greedy agent over-farms enchantments (90-pt slot heuristic + a
  counter→action→enchantment snowball once UC is gone), so it overstates counters and thus
  *understates* how much "one counter per spell broken" actually bites. Sensitivity (2p, end-game
  pool held fixed, break budget varied): reshape marginal +10 (break ≤1 spell) / +16.6 (≤2) / +21.4
  (≤3) / +26.8 (≤7 = the ~7-counter actual). So at realistic scarce counters (~2–3) the rule removes
  roughly half the swing. **Upshot:** the reshape rule and the enchantment ladder are coupled through
  the counter economy — the rule works *iff* counters stay scarce, which is the very enchantment-uptake
  question the bundle exists to solve. The counter/reshape numbers need a realistic-uptake agent (de-tune
  the enchantment heuristic to match observed play) or live data before they're trustworthy.
- 2026-07-09 (follow-up 2, prompted by Sam's [8,8,8,8] example) — **F3 break-cost now modelled; it
  trims the reshape, and my earlier "F3 barely matters" was wrong.** Under F3 breaking an Enchantment
  destroys the capacity it granted, so its reshape cost is 1 (action) + grant (tier-3 → 2, tier-4 → 4,
  tier-5 → 6), not a flat 1; Conjurations stay 1 (they grant nothing). `reshape_cost_best` now takes a
  per-spell `break_cost`; the `reshape_cost` variant uses the F3 cost. Re-run (`SCORING_EV_vnext.md`,
  10k): 2p reshape_cost **+26.7 → +21.0** (→TF share 0.44 → 0.32 — Enchantment cards, the scattered
  single values that pad TF runs, are now dear to free); 3p +12.1→+9.0; 4/5/6p +5.4/+4.5/+3.5.
  Isolation check (2p diagnostic): if Enchantments could *never* be broken the marginal is **+12.6** —
  so the irreducible core is conjunction+hand consolidation (~+12.6 at 2p), and the +21 over that is
  players spending **over-farmed** counters to also break Enchantments. With realistic scarce counters,
  those Enchantment breaks become unaffordable (F3) and the marginal falls toward the +12.6 floor — and
  below, as conjunction breaks also get capped. Net: two independent reasons the true end-game is milder
  than the original +27 (over-farmed counters AND the now-fixed flat break cost). **F1 scope:** Sam
  fixed F1 = current counters (no gauge/round-trip) for this version bump, so F3 is finalizable now and
  F1 is NOT a blocker.
- 2026-07-09 (formalised) — **Bundle locked and written up as a Kiro spec:
  `.kiro/specs/v3-1-scoring-economy/`** (requirements → design → tasks). Sam's final calls:
  Enchantment scores **4/10/16** and counters **+1/+3/+5** (was provisional; now fixed, +5 confirmed
  over +4); F3 uses the **"cannot afford action + loss → blocked"** gate; **UNLEARN may be partial**
  with proportional enchantment capacity loss (5→4 −2, 4→3 −2, 3→dissolve −1); **EMPOWER may not
  convert into/out of an Enchantment** (removes the F3 edge case); RESHAPE = one counter per spell
  broken; Unlimited Capacity removed; casting → "cast up to [capacity] spells". Propagation order
  **md → html → code/apps**. **F1 fixed as current counters** for this bump (not a blocker).
  Reversibility via §3a `_archive` byte-exact copies (git not relied on); v3.1 applied **under-test**
  with a documented rollback to v3.0. Governing decision: `meta/decisions/2026-07-09-v3-1-scoring-
  economy-bump.md` (status `proposed`). Coupled decisions to close on execution: F3 (gate chosen),
  F4 (superseded), F6 (UC clause superseded). This spec produces the PLAN; execution is task-by-task
  on Sam's go. Confirm/kill criterion is the live playtest; on kill, restore the v3.0 archive.
- 2026-07-09 (executed) — **Spec executed end-to-end; v3.1 is live under-test.** Ran
  `.kiro/specs/v3-1-scoring-economy/` task-by-task in propagation order **md → html → code/apps
  → sim mirror → canon.yml → decisions → verify**: the score table + rule edits landed in
  `rulebook/Scoring System Reference.md`, the Complete Rulebook, `GLOSSARY.md`, and
  `RULES_SUMMARY.md` (md); both html references (`archmage-reference.html`,
  `player-reference.html`); the digital build (`game/state.js`, `engine.js`, `ai.js`, the four
  `.jsx`); the `simulation/scoring_ev.py` canon mirror; then `meta/canon.yml`
  (`rulebook_version: v3.1`, rewritten `enchantment_ladder`, `Unlimited Capacity` added to
  `retired_terms` **last**, after all scanned occurrences were purged); coupled decisions closed
  (F3 "cannot afford → blocked" gate chosen, F4 superseded, F6 UC-clause superseded). Verify:
  `node meta/checks/check.mjs` clean — versioned files == v3.1, the retired term absent from
  scanned content, no open propagation boxes on the governing decision; `python scoring_ev.py
  selfcheck` passing; and the Hand Checker golden-master snapshot refreshed to v3.1. Reversibility:
  the pre-v3.1 `_archive/*-v3.0-2026-07-09/` set is the byte-exact rollback (authoritative list in
  `_archive/README.md`; procedure in the governing decision §7). Governing decision
  `2026-07-09-v3-1-scoring-economy-bump.md` stays `experiment` (under-test). **Awaits the live
  playtest to CONFIRM (→ `canon`, Task 19, retire this folder) or KILL (→ §7 rollback, decision
  `reverted`).**
