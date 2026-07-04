---
title: Implementation Queue — Archmage Ascension
type: implementation-queue
date: 2026-07-04
status: draft-for-Kiro
purpose: Kiro-ready task queue, split so safe work is separated from decision-gated and playtest-gated work. Category A is the only work Kiro may start unprompted.
sources: truth audit §7 (safe fixes), forks audit §5 (matrix) + §8 (anti-drift), design review §8, product viability §9; verified 2026-07-04
evidence_tags: "[FILE] · [INFER] · [GAP]"
---

# Implementation Queue (July 2026)

Categories: **A safe now** · **B playtest-kit (non-canon)** · **C decision-gated** ·
**D playtest-gated** · **E parked**. Kiro executes **A** and **B** only; **C/D/E** are
listed so Kiro *recognises and refuses* them until their gate opens. Every task cites its
gate. See `DECISION_REGISTER_2026-07.md` for decision IDs and `KIRO_HANDOFF_2026-07.md`
for anti-drift rules.

---

## A. Safe now (no unresolved decision)

**A1 — Verify/repair GLOSSARY.md truncation.**
- Files: `rulebook/GLOSSARY.md` (recovery source: `meta/experiments/echo-option-2/baseline/rulebook/GLOSSARY.md`, itself possibly truncated).
- Change: **verify natively on Windows first** — the mount serves a copy ending mid-"Transfiguration" [FILE 2026-07-04]; this is likely a hydration artifact, not corruption. Only if genuinely truncated on disk, recover the lost tail (baseline or OneDrive version history), re-apply the 2026-07-03 Echo/ladder edits.
- Why safe: pure data recovery, no design content.
- Acceptance: file ends with complete entries; baseline verified or refreshed; diff reviewed.
- Rollback: keep the pre-edit copy; recovery is additive.

**A2 — Fix in-file glossary "3-4" → "3-5" (CON-1).**
- Files: `rulebook/Archmage Ascension - Complete Rulebook.md` line 426.
- Change: "Enchantment: Spell using 3-4 matching components" → "3-5".
- Why safe: canon.yml settles 3–5; propagation checklist already claims this.
- Acceptance: no "3-4" enchantment text anywhere in rulebook/.

**A3 — Energy-name pass on GLOSSARY.md (CON-3, names only).**
- Files: `rulebook/GLOSSARY.md` (Element, Component, Conjuration, Perfect Transmutation entries).
- Change: Fire/Water/Earth/Air → Radiance/Void/Flux/Aether; "element" → "energy". **Exclude** the
  "the aether"/Source-synonym entry — that is a wording decision (F13-adjacent).
- Why safe: canon settled pre-v2.8; zero design content.
- Acceptance: no Fire/Water/Earth/Air in rulebook/; "aether" flavor entry untouched.

**A4 — Record scoring-override rationale (F4).**
- Files: append to `meta/decisions/2026-07-02-echo-option-2-deck.md` or a header note in
  `simulation/SCORING_REBALANCE.md`.
- Change: one paragraph — canon chose 12/18 over 15/26 because UC's real payment is capacity; 26
  double-pays it. Cite design review §4 as *analysis*, not adoption.
- Why safe: documents an already-made choice; changes no values.
- Acceptance: a reader of SCORING_REBALANCE alone is warned off "fixing" the table to 26.

**A5 — Cross-reference the two counter P1s as mutually exclusive (F1 guard).**
- Files: `meta/QUEUE.md` (round-trip P1 line + gauge-bearing review P2 line).
- Change: mark each as an "alternative-to" the other, resolved by F1 (T1/T4).
- Why safe: changes no design; prevents the worst drift (implementing both).
- Acceptance: neither item is readable without seeing the other.

**A6 — Fix QUEUE archive "+2 counters" line; reframe score-table P1 (CON-4b / CON-10 framing).**
- Files: `meta/QUEUE.md`.
- Change: correct the stale "+2 counters" to the decided +3; reframe the score-table P1 from
  "Perfect Transmutation size 15+" to "Conjuration 16–17" and mark the two values as open under F6.
- Why safe: process-state accuracy; preserves the residual design question rather than resolving it.
- Acceptance: QUEUE matches decided facts; residual value question preserved as F6.

**A7 — Repair `_review/` and sim process pointers.**
- Files: `_review/README.md` (BACKLOG.md→`meta/QUEUE.md`, STATE.md→threads); `simulation/ASSUMPTIONS.md`
  front-matter `[[STATE]]`.
- Why safe: process plumbing decided 2026-07-03.
- Acceptance: no references to retired files outside `_archive/`.

**A8 — Link the five master-plan docs from QUEUE + verify experiment-baseline integrity.**
- Files: `meta/QUEUE.md` (add `_review/` linkage lines for the five new docs so the checker's
  unreferenced-`_review` flag clears); `meta/experiments/echo-option-2/baseline/`.
- Change: add QUEUE pointer lines; byte-verify each baseline file is complete (protects the F2 revert path).
- Why safe: process plumbing + read-only verification.
- Acceptance: checker shows no unreferenced-`_review` flags for the new docs; every baseline file verified complete.

---

## B. Playtest-kit work (non-canon test materials)

Every B artifact carries a visible header: **"NON-CANON TEST ARTIFACT — not a rulebook edit
(see IMPLEMENTATION_QUEUE §B)."** Rulebook and canon files stay untouched.

**B1 — Blind-teach packet.** Files: new under `playtests/kit/` or `meta/experiments/`. The rules a
stranger reads cold for TS1 — trimmed to the 2–4p game. Acceptance: a rummy-literate stranger can
attempt turn one from it with no verbal help; labelled non-canon.

**B2 — Control-arm counter text.** Files: kit. The best-effort rewritten counter/Recall text +
worked example (design review V1 / Option C) as F1's control arm. Acceptance: reads as a standalone
insert; clearly labelled non-canon; rulebook untouched.

**B3 — Capacity Gauge prototype (recommended).** Files: kit — one player mat per player: Capacity
Gauge, 3-phase tracker, the four learning actions, the one-sentence scoring rule + size-3 anchors.
Carries TS1/T4/T5/T7 in one session [FILE: design review §8]. Acceptance: printable on one card;
Recall absent in this arm; labelled non-canon.

**B4 — Visible Source clock prototype.** Files: kit — a face-up Source track for TS3/DR-CLOCK.
Acceptance: a simple count-down track usable alongside the current board; labelled non-canon.

**B5 — Observation sheet.** Files: kit — captures the exact TS1–TS5 metrics + the hook-visibility
ledger (STRANGER_EVIDENCE_PLAN §5). Acceptance: one page per session; fields match the plan's
"record" lines verbatim.

**B6 — Replay-choice script card.** Files: kit — the neutral ask + the acceptable-alternatives list +
the verbatim-words capture box (plan §4). Acceptance: single card the facilitator reads from.

---

## C. Decision-gated (do not start until Sam decides — SAM-NOW items)

| Task | Files | Required decision | Stop condition |
|---|---|---|---|
| Enchantment timing text | rulebook LEARN/EMPOWER (303–304), GLOSSARY | **F3** (principle) + F1 (wording) | No edit until F3 decision file exists; wording waits on F1 |
| Game-end procedure | rulebook line 386, ASSUMPTIONS, `state.js` | **F5** | No edit until one procedure chosen; all three surfaces then agree |
| Wild scope + Conjuration 16–17 values | rulebook line 156 + Components, both score tables | **F6** | No table edit until values decided |
| Score-table P1 execution | `web-apps/archmage-reference.html` | **F6** | Values decided before edit |
| Export regeneration go/no-go | `card-design/export-*` | **F14** (+ F1/F2 if "go") | No export work until an explicit Sam "go" is recorded |
| Trials park-vs-reconcile | `rulebook/Ascension Trials.md`, `trials-multiplayer.html` | **F8** | Read-only until F8 decision file exists (annotate, never silently edit) |
| Terminology rule (energies/currents) | VISUAL_SYSTEM, GLOSSARY, pitch | **F13** | Only the GLOSSARY name-fix (A3) now; a/b choice waits on F9 |
| Next-session design (which fork it serves) | playtest plan | **F10**-as-sequencing + F1↔F2 entanglement | Session must have one primary question before it runs |

---

## D. Playtest-gated (do not start until stranger evidence exists — STRANGER items)

| Task | Files | Required test result | Acceptance |
|---|---|---|---|
| Counter/capacity canon rewrite (text, cards, mat, code) | rulebook, GLOSSARY, refs, `state.js` | **F1** via TS1/T4 metrics | Chosen branch in a decision file; propagation checklist ticked |
| Echo canonization *or* revert | canon.yml, rulebook 5–6p, exports, VISUAL_SYSTEM | **F2** live 5p meets RECORD criteria | Status flipped in decision + experiment closed/reverted per RECORD |
| `state.js` ladder update | `web-apps/archmage-ascension/game/state.js` | **F2** confirmed (+ F1 branch) | Single pass with tests; matches validated ladder + capacity model |
| Partial Unlearn adoption | rulebook UNLEARN | **F12** via TS/T5 (≤1 turn overhead, ≤1 opportunistic use) | Decision file; text = OPUS wording (+ guard if spammed) |
| Drought draft / Source-visibility rules | rulebook End-of-Drought, board/setup | **DR-DROUGHT** (T3) / **DR-CLOCK** (TS3/T9) | Each adopted change gets its own decision file |
| Final reference cards / rulebook rewrite | rulebook, reference cards | **F1** (+ F3/F5/F6 closed) | Built only for the validated scope |
| Pitch rewrite | `pitch/` | **F1 + F2 + F10** closed | Rewritten to validated scope, hook-first |
| Card export regeneration | `card-design/export-*` | **F14 "go"** after F1 + F2 | Exports carry validated rules text only |

---

## E. Parked (remain parked; do not action in current planning)

| Area | Files | Why parked | Unpark when |
|---|---|---|---|
| Ascension Trials (unless F8 = reconcile) | Trials.md, trials-multiplayer.html | Stage-5 module; stale 5–7p/no-Echo | F8 decision says reconcile |
| Expansion content (incl. "The Convergence" naming) | `expansion/` | Stage-4+ gate in EXPANSION_INDEX | Core loop stranger-validated + stage gate passed |
| Pitch polish | `pitch/` | Contradicts canon; scope unstable | F1+F2+F10 closed (see D) |
| Final art / export / print work | `card-design/` | Anti-Drift Rule 2; F14 hold | F14 "go" recorded |
| Visual-system Echo merge | `card-design/VISUAL_SYSTEM.md` | Gated on F2 (F9) | Echo confirmed canon |
| Simulation expansion | `simulation/` | Rig has answered its questions; can't see fun/teach | A confirmed *table* finding raises a specific balance question |
| `_archive/`, experiment baselines | — | Frozen | Never (baselines read-only until experiment closes) |

---

## Execution note for Kiro
Do **A1–A8** and, when Sam greenlights the first session, **B1–B6**. Then stop. Do not touch any
C/D/E row until its gate is recorded in `DECISION_REGISTER_2026-07.md`. If any A/B task turns out to
touch a gated file (e.g. a "safe" GLOSSARY fix drifts into a counter definition), stop and treat it as
gated.
