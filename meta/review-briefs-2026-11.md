---
title: One-minute briefs for Sam's open P1 decisions (Nov 2026)
type: review-briefs
updated: 2026-11-12
---

# One-minute briefs — open P1 decisions and review docs

Each item: what it is · options · recommendation · what changes when you answer. Reply with
the item number and a letter (e.g. "1A, 3B"). The agent then updates QUEUE, decisions and
threads. Nothing here has been applied.

## 1. F1 counter fork — two P1s: "round-trip counter redesign" `[decide]` + "rewrite the counter refresh rule"
- **What:** two mutually exclusive arms of F1 (change the counter mechanic vs. rewrite its text). You fixed F1 as *current counters* for v3.1 (2026-07-09), and Session 4's new player learned counters from the online reference with no misplay — the failures were with the printed card/board.
- **Options:** (A) park both arms in Deferred ("reopen only if the printed-card redesign still fails"); (B) keep the text-rewrite arm as a test control, park the redesign; (C) keep both open.
- **Recommend A** — the evidence points at legibility, and that is already its own P1 (reference-card redesign).
- **Then:** −2 P1s; the reference-card redesign P1 takes on the counter-comprehension retest.

## 2. F6 wild-scope wording — "Close the score table at size 15" P1 `[decide]`
- **What:** the size-15 cap is done. The rulebook still gives the wild-declaration rule only for Enchantments; F6 says it applies to all spell types (fixed while the spell exists, redeclared on rebuild, deck-present energies only).
- **Options:** (A) patch now as v3.1.1 (archive + version bump, one example per spell type); (B) batch it into the rulebook pass after the v3.1 confirm/kill; demote to P2.
- **Recommend B** — it's a clarification nobody has asked about at the table, and editing an under-test file mid-experiment makes the rollback harder.
- **Then:** A = one rulebook patch and F6 boxes ticked; B = −1 P1 now.

## 3. `_review/MASTER_PLAN_2026-07.md` `[decide]`
- **What:** July strategy doc: the project is short on evidence from strangers; protect the hook; stop list (exports, Echo tuning, broad reviews…). Already amended by the two-track decision; the hook is accepted (DR-HOOK).
- **Options:** (A) accept as background reference (move to P2 reference, no further action); (B) re-adopt its stop list as current policy; (C) archive as superseded.
- **Recommend A** — the live parts are already captured (two-track, DR-HOOK, F14 hold); its stop list is partly out of date (state.js and AT work went ahead under Track A).
- **Then:** −1 P1; nothing else changes.

## 4. `_review/DECISION_REGISTER_2026-07.md`
- **What:** a living tracker of F1–F14 / DR-* decisions. Its sections were last updated in July; a status-refresh banner was added today (F1/F3/F4/F6/F12/DR-STATE were overtaken by v3.1).
- **Options:** (A) retire it as a tracker: QUEUE + `meta/decisions/` are the source of truth, register stays as a historical reference (P2); (B) keep it live and have the agent refresh every entry.
- **Recommend A** — it duplicates QUEUE, which process.md says is the only to-do list, so keeping both means they drift apart.
- **Then:** −1 P1; B = one agent pass to rewrite ~15 entries.

## 5. `_review/STRANGER_EVIDENCE_PLAN_2026-07.md`
- **What:** a stranger playtest plan, TS1–TS6 (blind teach, replay choice, visible Source A/B, silent observer, rummy comparison). Written for v2.8; since then `pitch/PLAYTEST_EVIDENCE_PLAN.md` (venues/volume, P2) appeared.
- **Options:** (A) adopt TS1 (blind teach) + TS2 (replay choice) as standing observation sheets for the Tabletopia confirm/kill and FR sessions, rest as reference (P2); (B) run it as a separate session series; (C) archive.
- **Recommend A** — no extra sessions needed, and the FR test already does a graded blind teach.
- **Then:** −1 P1; the confirm/kill P1 gains "use TS1/TS2 record fields".

## 6. Ascension Trials shortlist — `ASCENSION_TRIALS_07` (+ 08 appendix) `[decide]`
- **What:** four candidate Trials configurations, screened by sim. C1 "Coherent Claim" is recommended (flat Minimum Claim 3, +1 baseline Wild, TM/EM 7, Focused at 2p, local tiebreaks); C4 "Archspell Bold" is the follow-up that changes one variable. Caveat: C1's worst-case tie rate is 10.3% against a ≤5% target.
- **Options:** (A) pick C1 for the first Trials playtest, scheduled *after* the v3.1 confirm/kill; (B) C1 + C4 back-to-back; (C) hold all Trials playtests until v3.1 is settled (park the thread).
- **Recommend A** — one variable at a time; v3.1 changes the scores Trials reads from, so test v3.1 first.
- **Then:** −1 P1 (it becomes a scheduled playtest item); the `ascension-trials` thread's `next` gets updated.

## 7. `_review/EXPANSION_AUDIT_2026-07.md` `[decide]`
- **What:** an audit of all 11 expansion concepts with scores (Schools 9, Last Rites 8.5, Trials 8, Foci 8…). Two open calls: which module gets the first expansion playtest slot, and whether Living Array is reclassified as a free variant/test instrument.
- **Options:** slot = (A) Schools (cheapest signal), (B) Last Rites (most independent), (C) Foci (fastest answer on strategic depth); Living Array = reclassify yes/no.
- **Recommend A + reclassify yes** — Schools is the cheapest test, and Living Array is already in use as a 2p tool, not as a product. Either way the slot comes after the v3.1 confirm/kill.
- **Then:** −1 P1; the `expansions` thread gets a concrete `next` (this also clears its staleness flag); EXPANSION_INDEX marks Living Array as a variant.
