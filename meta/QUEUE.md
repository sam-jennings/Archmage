---
title: Queue
type: queue
updated: 2026-07-03
---

# Queue

The only to-do list. Tasks and open decisions together. `[decide]` marks decisions.
Migrated from BACKLOG.md (archived 2026-07-03).

## Now (P1)

- [P1] [design] [thread:capacity-economy] [decide] Adopt the round-trip counter redesign (placing a counter casts a spell; picking one up pays for a learning action) plus the partial-unlearn lever? Requires solo-rig pre-validation first. Note: the 2026-07-02 Echo/Option-2 decision absorbed start-2 and superseded the Drought-cap and first-ench-free levers.
- [P1] [design] [thread:capacity-economy] Validate the Option 2 deck decision live at 5 players — enchantment uptake above 2 of 5, no counter-mechanic confusion from written rules alone, conjuration/transfiguration stability intact — and resolve the three open tunables (4-card +2 vs +3 counters; 5–6p wild count 4 vs 6; conjuration viability under suit dilution). See `meta/decisions/2026-07-02-echo-option-2-deck.md`.
- [P1] [content] [thread:capacity-economy] Echo/Option-2 propagation — nearly complete. Done 2026-07-03: full "Convergence" purge (17 files) AND the enchantment-ladder rewrite (3=+1, 4=+3, 5=Unlimited; scores 6/12/18) + 5–6p Echo deck (79 cards) + 2-counter start for 5–6p + wild-declaration rule, written through the rulebook, Scoring System Reference, GLOSSARY, and web reference (`archmage-reference.html`). Only OPEN item: regenerate card exports (`export-cs3/`, `export-printenbind/`) with Echo vocabulary + new tier text — this is the now-unblocked card-visuals thread's job (ladder text has stabilised). Checklist: `meta/decisions/2026-07-02-echo-option-2-deck.md`.
- [P2] [software] [thread:capacity-economy] Digital build (`web-apps/archmage-ascension/game/state.js`) still implements the OLD enchantment ladder (3-card = +1, 4-card = Unlimited) and 1 starting counter. Update its learn/empower/unlearn logic to the new ladder (3=+1, 4=+3, 5=Unlimited) once Option-2 is live-validated. Was intentionally out of the decision's propagation scope (2-player prototype); tracked here so rulebook↔build drift isn't lost.
- [P3] [rules] [thread:capacity-economy] `rulebook/Ascension Trials.md` still references "7th Trial (5-7 Players Only)" — but Echo/Option-2 caps the game at 6 players (2-4p and 5-6p decks). Reconcile the advanced variant with the new player-count ceiling (fold the 7-player trial into 5-6p, or drop it). Surfaced 2026-07-03 during the Echo ladder propagation.
- [P1] [rules] [thread:rules-and-teaching] Rewrite the counter refresh rule — player couldn't understand it from card or board even after verbal explanation; test whether a concrete turn-step example or full restructure fixes comprehension.
- [P1] [rules] [thread:rules-and-teaching] Clarify that enchantment effects (play/unlearn) begin on the player's NEXT turn — current ambiguity allows counter-system abuse.
- [P1] [bug] [thread:rules-and-teaching] Extend the score table on the web reference to cover Perfect Transmutation size 15+ — a player reached size 15 in Session 1 and the table didn't cover it. (Overlaps the Echo-decision score-table propagation — do together.)
- [P1] [card] [thread:rules-and-teaching] Redesign the printed reference cards for legibility — current layout too hard to read during play; blocks every session.

## Next (P2)

- [P2] [review] Repo truth audit (`_review/ARCHMAGE_REPO_TRUTH_AUDIT_2026-07.md`, 2026-07-04) — stage 1 of the Kiro plan review chain. Surfaces: GLOSSARY.md truncated on disk (recover from experiment baseline), 13 contradictions (CON-1..13), 12 open decisions (D-1..12), 8 safe fixes, a do-not-touch list, and recommends a decision-forks audit next. Review-only; makes no decisions.
- [P2] [review] Decision forks audit (`_review/ARCHMAGE_DECISION_FORKS_AUDIT_2026-07.md`, 2026-07-04) — stage 2 of the Kiro plan review chain. Maps 14 forks (F1–F14) with dependency graph, safe-now/gated matrix, 10 operational questions for Sam (§6), 6 playtest-required questions (§7), and 10 Kiro anti-drift rules (§8). Recommends counter/capacity deep dive as stage 3. Corrects stage 1: the GLOSSARY baseline may itself be truncated — verify natively before relying on it for recovery. Review-only; makes no decisions.
- [P2] [review] [decide] Act on the product viability audit (`_review/ARCHMAGE_PRODUCT_VIABILITY_AUDIT_2026-07.md`, 2026-07-04) — assesses stranger-table potential, not implementation. Key findings: zero stranger data underpins every decision to date; the hook (player-burned Source clock + living Spellbook) is invisible at the table; identity (count band / length / weight — F10 as a product-shape call) is the binding constraint, not implementation; names 7 local-optimization loops (L1–L7); proposes 6 stranger playtests (E1–E6, E1 doubles as F1's T1 control arm) and 4 anti-drift documents for the master plan. Recommends pausing exports, state.js, Echo tail, Trials, rig work, and further review docs until at least one stranger session exists. Review-only; makes no decisions.
- [P2] [review] [decide] Act on the structural design review (`_review/DESIGN_REVIEW_2026-07-03.md`) — key forks it surfaces: Capacity Gauge vs round-trip counter redesign (T4 A/B test), 2–4p focus vs 5–6p Echo-first, Drought draft variant, scoring stated as incremental rule (rejects the 26-pt UC from SCORING_REBALANCE). Also lists 9 rulebook contradictions/ambiguities incl. LEARN "add to pool now" vs next-turn ruling and the stale "3-4 components" in-file glossary entry.

- [P2] [design] [thread:rules-and-teaching] Add a turn-stage tracker or clearer stage summary — deliberate players lose their place mid-turn.
- [P2] [review] [decide] Integrate or drop the counter/tracker proposal (`_review/OPUS_TASK_counter_and_tracker.md` + `_review/OPUS_TASK_counter_and_tracker_RESPONSE.md`) — relates to the counter-refresh rewrite and the turn-stage tracker.
- [P2] [rules] [decide] Counter refresh: rewrite (clarity fix) or redesign (mechanic change)? Depends on whether better text alone fixes comprehension next session; the round-trip redesign is the leading redesign candidate.

## Later (P3)

- [P3] [design] Investigate whether the thematic narrative arc can be signalled through card names or phase structure rather than art (naming/structure in scope; art polish deferred).
- [P3] [rules] Evaluate whether "Transfiguration" and "Perfect Transmutation" can be simplified or given memorable shorthands.
- [P3] [review] [decide] Integrate or drop the enchantment-system proposal (`_review/OPUS_TASK_enchantment_system.md` + `_review/OPUS_TASK_enchantment_system_RESPONSE.md`) — largely superseded by the Echo/Option-2 decision; partial unlearn still independently valuable.
- [P3] [review] [decide] Resolve the thematic-coherence task (`_review/OPUS_TASK_thematic_coherence.md`) — no response drafted yet; relates to the thematic-narrative item above.
- [P3] [review] [decide] Is Echo the canonical visual system (`_review/VISUAL_SYSTEM_with_Echo.md`)? Promote to `card-design/VISUAL_SYSTEM.md` or drop. The adopted Option-2 decision assumes Echo as the fifth energy.
- [P3] [review] [decide] Act on or park the fifth-suit analysis (`_review/FIFTH_SUIT_ANALYSIS.md`) — fed the Option-2 decision; still surfaces a cheap rank-compressed 4×15/4×16 experiment for acquisition testing.
- [P3] [admin] Archive or delete `.codex-viewport-check/` (viewport-test scratch at root).

### Master-plan chain (stage 5 of the review chain, 2026-07-04 — planning docs, not canon)

- [P1] [review] [decide] `_review/MASTER_PLAN_2026-07.md` — classifies the project as product-validation-gated; protected hook; 3-phase critical path (safe hygiene → stranger validation → implementation-after-evidence); stop list. Synthesises the four prior audits.
- [P1] [review] `_review/DECISION_REGISTER_2026-07.md` — living tracker of every open decision (DR-HOOK, F1–F14, DR-CLOCK/DROUGHT/PITCH/STATE) with status/owner/closure lane (SAM-NOW / STRANGER / KIRO-LATER). Supersedes the scattered [decide] items above once populated.
- [P1] [review] `_review/STRANGER_EVIDENCE_PLAN_2026-07.md` — decision-driven stranger playtest plan (TS1–TS6), combined first session, operational replay-choice test, hook-visibility metric.
- [P2] [review] `_review/IMPLEMENTATION_QUEUE_2026-07.md` — Kiro queue split A safe / B playtest-kit / C decision-gated / D playtest-gated / E parked.
- [P2] [review] `_review/KIRO_HANDOFF_2026-07.md` — Kiro mission, source-of-truth, 10 anti-drift rules, execution order, stop conditions.

## Deferred (not doing yet — reasons recorded for advisory reminders)

- Final card art — Anti-Drift Rule 2: don't polish what's still being redesigned; the core loop is still being clarified.
- The 2-player digital build *as a shippable product* — deferred; the rough solo self-play rig built from its code IS in scope.
- Pitch sheet revisions — the game must be stable first.
- Expansion development (Ascension Trials, Schools, Last Rites, Spell Duels) — Stage 4+; concepts parked in `expansion/`.
- Sixth/seventh-player support beyond the Echo suit — parked; intended Stage 4+ shape recorded in the Echo decision.
- Rulebook full polish pass — Stage 6 work; but clean the "3-card enchantment grants +1 counter AND +1 action AND +1 slot" double-description when the enchantment rules are next touched.
- Steal-cards or conflict mechanics — scope addition without evidence the core loop works.

## Archive (resolved)

- 2026-07-03 — [P1] [design] Rig-test both deck options from the two-version proposal (resolved: rig selected Option 2, decision `meta/decisions/2026-07-02-echo-option-2-deck.md`; proposal archived to `_archive/TWO_VERSION_PROPOSAL.md`)
- 2026-07-03 — [P1] [decide] Which deck structure, Option 1 or Option 2? (resolved: Option 2, rig-decided 2026-07-02; live validation still open above)
- 2026-07-03 — [P2] [design] Investigate 4-card enchantment cap at Drought (resolved: 4-card becomes +2 counters / score 12 under the adopted ladder; UC moves to the 5-card tier)
- 2026-06-17 — [P2] [admin] Build the six project-state skills (superseded: replaced by the single `aa-system` adapter skill, working-system v2, 2026-07-03)
- 2026-05-02 — [P1] [admin] Confirm target player and core experience (resolved: recorded in PROJECT.md)
- 2026-05-02 — [P1] [test] Define current problem and hypothesis for the next playtest (resolved: lives per-thread in `meta/threads/` now)
