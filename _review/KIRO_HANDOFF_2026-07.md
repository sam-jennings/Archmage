---
title: Kiro Handoff — Archmage Ascension
type: handoff
date: 2026-07-04
status: active
purpose: Direct instructions to Kiro for the implementation phase. Kiro protects canon and prepares tests; it does not redesign the game or canonize unresolved branches.
sources: MASTER_PLAN / DECISION_REGISTER / STRANGER_EVIDENCE_PLAN / IMPLEMENTATION_QUEUE 2026-07; forks audit §8; truth audit §8. Load-bearing facts re-verified natively against canon.yml, the rulebook, GLOSSARY, QUEUE, and the Echo decision — 2026-07-04.
evidence_tags: "[FILE] inspected · [INFER] reasoned · [GAP] unresolved/contradictory"
---

# Kiro Handoff (July 2026)

## Mission

Kiro's job is **not** to redesign Archmage Ascension. Kiro's job is to:
1. **Protect canon** — keep `meta/canon.yml` and the rulebook the single source of truth; never let
   review-doc analysis leak into content as if decided.
2. **Implement safe hygiene** — the Category A tasks in `IMPLEMENTATION_QUEUE_2026-07.md`, nothing more.
3. **Prepare stranger-test materials** — the Category B kit, clearly labelled non-canon.
4. **Maintain the decision register** — when Sam makes a call or a session returns a result, record it
   as a `meta/decisions/` file with a propagation checklist and update `DECISION_REGISTER_2026-07.md`.
5. **Avoid canonizing unresolved branches** — F1, F2, F10 and their dependents stay open until their
   gate is recorded.

The project's binding constraint is stranger evidence, not implementation polish [FILE: product
viability §9]. Clean implementation of an unvalidated design is the failure mode to avoid.

## Source of truth

**Canon (edit only via a decision file + propagation checklist):**
- `meta/canon.yml` — machine-checkable canon. Verified 2026-07-04: v2.8; energies Radiance/Void/Flux/Aether
  (+Echo 5–6p only, under test); decks 62 (2–4p) / 79 (5–6p); ladder 6/12/18; `wild_rule` stated generally.
- `rulebook/Archmage Ascension - Complete Rulebook.md` — rules. **Two confirmed stale spots** [FILE
  2026-07-04]: the in-file Glossary entry reads "Enchantment: Spell using **3-4** matching components"
  (body text correctly says 3–5); LEARN says gains apply "**add to your pool now**" (F3 wants next-turn).
  Also note: the wild-declaration rule is written **only inside the Enchantment definition**, whereas
  `canon.yml` states it generally — that scope gap is F6, not a typo. Do not "reconcile" it silently.
- `rulebook/Scoring System Reference.md` — scoring (6/12/18).
- `rulebook/GLOSSARY.md` — glossary. **Confirmed truncated on the served copy** — it ends mid-entry at
  "Unlimited Capacity Ma" [FILE 2026-07-04] — **and** still half-migrated to old energy names
  ("Fire, Water, Earth, Air" / "element" in the Component, Element, and Conjuration entries).
  **Verify natively on Windows before any repair** (presume mount/hydration artifact, not corruption).
- `meta/decisions/*`, `meta/QUEUE.md`, `meta/threads/*` — decisions + process state.
- `meta/experiments/echo-option-2/` — Echo experiment + **frozen** revert baseline (baseline GLOSSARY
  may itself be truncated — byte-verify before trusting it as a recovery source).

**Process:** `meta/process.md` is the single source of process truth; run `node meta/checks/check.mjs`
at session start (a non-zero exit from the open Echo-propagation flag is expected, not an error to fix).

**Review docs are EVIDENCE, not canon.** `_review/ARCHMAGE_*`, `DESIGN_REVIEW_2026-07-03.md`,
`OPUS_TASK_*`, `FIFTH_SUIT_ANALYSIS.md`, `VISUAL_SYSTEM_with_Echo.md`, and the five master-plan docs
(this one included) are analysis and planning. Each states it makes no decisions. Text moves from
`_review/` into content **only** through a `meta/decisions/` file. The master-plan docs guide
sequencing; they do not change canon.

## Anti-drift rules

1. **Do not modify counter/capacity/Recall canon** (rulebook text beyond timing wording, reference
   cards, mats, `state.js` capacity logic) without a **closed F1 decision file**. Do not delete or
   "clean up" either counter-fork QUEUE item.
2. **Do not regenerate card exports** (`export-cs3/`, `export-printenbind/`) until **F14** is recorded
   "go" — and "go" additionally requires F1+F2 closed. Printenbind costs real money.
3. **Do not treat Echo as fully canon** while `meta/experiments/echo-option-2/` exists. The strings
   "under test"/"experiment" on Echo/79-card content are load-bearing; no cleanup pass may remove them.
4. **Do not reconcile Ascension Trials** unless an **F8** decision file says "reconcile". Default is park
   + annotate.
5. **Do not move text from `_review/` into the rulebook** without a `meta/decisions/` record (process.md §3).
6. **Do not overwrite historical analysis** — playtest logs, `simulation/RESULTS.md`, `SCORING_REBALANCE.md`
   are append/annotate-only records of what was believed when. Never edit conclusions to match later canon.
7. **Do not touch experiment baselines** (`meta/experiments/*/baseline/`) or `_archive/` except for
   verified recovery/re-baselining. Read-only.
8. **Any file that appears truncated must be verified natively before repair** — the OneDrive mount serves
   partially-hydrated copies (confirmed this session for GLOSSARY.md, and previously for check.mjs).
   Presume mount artifact, not corruption; verify on Windows before editing [FILE 2026-07-04].
9. **No repo-wide find-replace on vocabulary** — `canon.yml` `retired_terms` is the sole enforcement list
   (currently just "Convergence"); extend it rather than freelancing (F13/K8).
10. **Do not aim any print, pitch, or per-count tuning at a player-count band** until **F10** closes.

## Execution order

1. **Safe hygiene** — `IMPLEMENTATION_QUEUE` Category A (A1–A8). Start with A1 (GLOSSARY verify) and A8
   (baseline integrity) since they de-risk everything else.
2. **Decision-register setup** — confirm `DECISION_REGISTER_2026-07.md` reflects reality; open a
   `meta/decisions/` stub for each SAM-NOW item awaiting Sam's answer.
3. **Stranger-test kit** — Category B (B1–B6), all labelled non-canon, once Sam greenlights the first session.
4. **QUEUE updates** — mirror register state into `meta/QUEUE.md` (cross-refs, reframes, `_review` links)
   so the checker stays clean.
5. **Stop and wait** — for Sam's SAM-NOW answers and the first session's results. Do not begin any
   Category C/D/E work.

## Stop conditions — Kiro must stop and ask Sam if a task:
- touches unresolved counter/capacity rules (F1);
- touches Echo canonicity (F2);
- touches card exports (F14);
- touches `state.js` (DR-STATE);
- touches Ascension Trials (F8);
- requires choosing between product-scope branches (F10);
- or where **source files disagree** (e.g. card-visuals thread "unblocked" vs design review "stop";
  `canon.yml` general wild_rule vs the rulebook's Enchantment-only wild wording) — surface the conflict,
  do not pick a side.

When stopping, name the specific decision ID and the conflicting files; do not guess.

## Final output requirement — after this handoff, the summary Sam needs

1. **New critical path:** hygiene (Cat A) → Sam's cheap decisions + first stranger session (F1 + hook +
   replay) → implement only the validated direction.
2. **First Kiro task:** A1 — verify GLOSSARY.md natively (confirmed truncated + stale energy names on the
   served copy), then the rest of Category A.
3. **First Opus task:** the counter/capacity deep-dive that writes the F1 session kit (control-arm text,
   Capacity Gauge mat, the missing round-trip ruleset) to testable precision — *not* a canon rewrite.
4. **First playtest task:** the combined first session — TS1 blind teach (F1 control arm) + TS2 replay
   choice, at 2–4p, current rules + rewritten counter text.
5. **The one thing Sam should not do next:** regenerate card exports / start any print run (or tune Echo,
   or touch `state.js`) — hold all print-shaped and Echo work until the first stranger session and F1/F2/F14.
