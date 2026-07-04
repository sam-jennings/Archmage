---
title: Decision Forks Audit — dependency map of unresolved decisions
type: review
date: 2026-07-04
status: review-only
purpose: Stage 2 of the Kiro implementation-plan review chain — maps the open decision forks, their dependencies, and what closes each. Makes no decisions; produces no master plan.
sources: full repo re-inspection 2026-07-04 (meta/ decisions+threads+experiments+QUEUE+canon, rulebook line-level spot checks, _review/, simulation/, playtests/); builds on _review/ARCHMAGE_REPO_TRUTH_AUDIT_2026-07.md with independent verification of key claims
---

# Archmage Ascension — Decision Forks Audit (July 2026)

Evidence tags: **[FILE]** directly inspected · **[INFER]** reasoned from multiple files · **[GAP]** missing/unresolved/contradictory.

> **Verification notes vs the Repo Truth Audit (Stage 1):**
> 1. Key claims re-verified at line level [FILE]: rulebook "3-4 matching components" glossary entry (line 426); LEARN "(add to your pool now)" (lines 303–304); "the contest immediately ends" (line 386); wild-declaration rule stated only inside the Enchantment section (line 156); `simulation/ASSUMPTIONS.md` "finishes their learning" (line 35); canon 6/12/18 vs SCORING_REBALANCE 15/26. All hold.
> 2. **Correction to Stage 1's recovery plan:** `rulebook/GLOSSARY.md` (9,642 bytes) and `meta/experiments/echo-option-2/baseline/rulebook/GLOSSARY.md` are byte-identical in size and the copy served to the sandbox ends mid-entry ("**Transfiguration** ... must exchange with") [FILE: wc + tail 2026-07-04]. The baseline may be truncated the same way, or the mount may be serving both partially hydrated. Stage 1's safe fix #1 ("recover from baseline") is **not verified safe** — recovery may need OneDrive version history checked natively on Windows [GAP].
> 3. `meta/checks/check.mjs` was truncated on disk and has been repaired this session; it now runs. Current flags: residual "Convergence" hits in excluded/edge locations only (svg-cards, incoming, printenbind outputs) [FILE: checker run 2026-07-04].

---

## 1. Executive verdict

**Highest-priority forks blocking Kiro:** F1 (counter/capacity system — four live branches touching every teaching, print, and code surface), F2 (Echo/Option-2 confirm-or-kill — gates all Echo-vocabulary regeneration), and F10 (product scope 2–4p core vs 5–6p Echo-first — silently reframes what F1 and F2 even mean). These three form a triangle: F10 decides which table F1/F2 evidence must come from [INFER].

**True blockers:** F1, F2, F3 (enchantment timing), F5 (game-end procedure), F10. Nothing that touches counters, capacity, Recall, endgame, Echo canonicity, or the primary player-count band can be implemented until these close, because every fork branch rewrites the same files (rulebook, GLOSSARY, reference surfaces, `state.js`) in mutually exclusive ways [FILE: §3 graph].

**Secondary but tracked:** F4 (scoring override rationale — one paragraph closes it), F6 (wild scope + Conjuration 16–17 values), F7 (capacity derived vs accumulated — collapses into F1 branch choice), F12 (partial Unlearn — playtest T5), F13 (visual terminology).

**Safe to defer:** F8 (Ascension Trials), F9 (Echo visual system promotion), F11 (DESIGN_REVIEW wholesale adoption — it decomposes into the other forks), F14 (card export regeneration — explicitly contested between QUEUE and DESIGN_REVIEW, so *deferring* is the only non-decision).

**Ready for implementation?** **No — still decision-gated.** After the safe-now hygiene set (§5), roughly 80% of the remaining P1 surface area sits behind F1/F2/F10, and those need either a Sam call (F10, F3, F5) or table evidence (F1, F2) [INFER]. The repo's *process* layer is Kiro-ready; the *design* layer is not.

---

## 2. Decision fork register

IDs continue Stage 1's D-numbers where they map, renamed F-numbers here for the fork framing. Mapping: F1=D-1, F2=D-2, F3=D-3, F4=D-4, F5=D-5, F6=D-6(+b), F7=D-7, F8=D-8, F9=D-9, F10=D-10, F11=D-11, F12=D-12; F13 and F14 are split out of Stage 1's CON-12 and Do-not-touch list because they gate distinct file sets [INFER].

### F1 — Counter/capacity system (the master fork)
- **Files involved:** `rulebook/Archmage Ascension - Complete Rulebook.md` (turn structure, Building Your Capacity, Recall, LEARN/EMPOWER/RESHAPE/UNLEARN), `rulebook/GLOSSARY.md`, reference cards, player mat (unbuilt), `web-apps/archmage-ascension/game/state.js`, `web-apps/archmage-reference.html`, `web-apps/player-reference/player-reference.html`
- **Status:** open; split across two P1 QUEUE items that do not cross-reference each other as alternatives [FILE: QUEUE lines 14 & 19 vs DESIGN_REVIEW C1]
- **Option A — Round-trip counter redesign:** placing a counter casts; picking it up pays for a learning action; Recall becomes the payment, not a step. Evidence: capacity-economy thread hypothesis + QUEUE P1 [decide]; requires solo-rig pre-validation per its own QUEUE text [FILE]. Consequence: keeps physical tokens, deepens choreography, adds an unspecified coupling (fewer casts → fewer learning actions?) [GAP: DESIGN_REVIEW C1]. Reversibility: **medium** (rules text + rig work; no print yet).
- **Option B — Capacity Gauge + delete Recall:** capacity becomes a printed dial/number; counters never sit on spells; 3-phase turn. Evidence: `_review/OPUS_TASK_counter_and_tracker_RESPONSE.md` Option A (recommended there, lines 44–51) + DESIGN_REVIEW C1/T4/V2 [FILE]. Consequence: kills the round-trip item; simplest teach; risk that removing the shared budget unleashes conjuration spam (DESIGN_REVIEW §8 names this as the single biggest risk) [FILE]. Reversibility: **medium** (new component, but paper prototype).
- **Option C — Text-only rewrite (control):** current mechanics, rewritten counter text + worked example. Evidence: rules-and-teaching thread `next` [FILE]; DESIGN_REVIEW V1 verdict: "run only as the control arm" [FILE]. Consequence: cheapest; three analyses predict it fails [FILE: OPUS response, DESIGN_REVIEW, Sessions 1&3]. Reversibility: **easy**.
- **Implementation risk if unresolved:** highest in repo — any counter UI, reference card, mat, or code work bakes in a branch.
- **Owner:** playtest (T1/T4 A-B); Sam picks the test plan. The two QUEUE items also disagree on *sequencing* — round-trip says "rig first", DESIGN_REVIEW says the rig has answered its questions [GAP].
- **Closure method:** playtest. Recommended test branch (recommendation, not canon): run Option C as control arm + Option B as variant in one session per DESIGN_REVIEW T1/T4; Option A only if B reduces strategic texture [INFER: this is the only sequencing both source documents can live with].

### F2 — Echo / Option-2 deck: confirm or kill
- **Files:** `meta/canon.yml` (deck_5_6p, energy_fifth), rulebook, GLOSSARY, both web references, all card exports, `meta/experiments/echo-option-2/`
- **Status:** experiment, running; rig-chosen 2026-07-02, zero live data [FILE: decision file + RECORD.md]
- **Option A — Confirm:** live 5p session meets criteria (uptake >2/5; no counter confusion from written rules; conjuration/transfiguration stable) → decision to `canon`, experiment folder deleted [FILE: RECORD.md]. Consequence: unlocks F9, F14, `state.js` update.
- **Option B — Kill/revert:** kill criteria hit (conjuration non-viable under dilution; uptake flat; 2–4p regression) → copy baseline back, decision `reverted` [FILE: RECORD.md]. Consequence: 79-card deck and Echo-vocabulary propagation partially unwound; **note the baseline-integrity problem above — the GLOSSARY baseline may itself be truncated** [GAP].
- **Note:** the confirm criterion "no counter confusion" is entangled with F1 — a session run under a redesigned counter system cannot cleanly confirm criteria written against the current one [INFER]. Reversibility: **medium** (revert kit exists but integrity unverified).
- **Risk if unresolved:** exports/visuals regenerated for a rule that may revert; Echo silently canonized by cleanup.
- **Owner:** playtest (live 5p). **Closure:** playtest.

### F3 — Enchantment effect timing (gains next-turn?)
- **Files:** rulebook LEARN/EMPOWER (lines 303–304 "add to your pool now" [FILE]), GLOSSARY Learn entry, `state.js`
- **Status:** open; printed rule codifies the abuse the QUEUE P1 ruling intends to ban [FILE: QUEUE line 20]
- **Option A — Next-turn gains, immediate losses** (DESIGN_REVIEW §6.1 asymmetric ruling — proposal). **Option B — Next-turn both** (plain reading of the QUEUE item). **Option C — Keep "now"** (current text; no file argues for it) [FILE].
- **Consequences:** A prevents both abuse directions but adds an asymmetry to teach; B is simpler but lets unlearn-timing games persist [INFER]; C ships the exploit. Reversibility: **easy** (text). Risk: any surface built from current text ships the exploit.
- **Owner:** Sam (small); playtest confirms. **Closure:** decide now — but note the wording depends on F1's branch (a Capacity-Gauge world states this as "gauge updates at start of your next turn", a token world as counter grants) [INFER]. Decide the *principle* now; write the *text* after F1.

### F4 — Scoring override rationale (12/18 vs 15/26)
- **Files:** `simulation/SCORING_REBALANCE.md` (verdict 15/26), `meta/canon.yml` + `Scoring System Reference.md` (12/18), decision file (silent on why) [FILE]
- **Status:** decided in effect (canon says 12/18), rationale unrecorded [GAP]
- **Option A — Record rationale, keep 12/18** (DESIGN_REVIEW §4 argues it decisively: 26 pays UC twice). **Option B — Reopen 18-vs-26** (no current file advocates this). Reversibility: **easy**. Risk: a later agent "corrects" the table to 26.
- **Owner:** analysis writes the paragraph; Sam signs off. **Closure:** document only — safe now.

### F5 — Game-end procedure (three candidates)
- **Files:** rulebook line 386 ("immediately ends"), `simulation/ASSUMPTIONS.md` line 35 ("finishes their learning"), DESIGN_REVIEW §6.5 ("finish the round") [FILE]
- **Status:** open three-way; the sim validated Option-2 under a rule the rulebook doesn't contain [FILE]
- **Options:** A immediate (current text; seat-order unfair); B finish-learning (matches the rig data); C finish-round (turn parity; DESIGN_REVIEW proposal, matches nothing yet).
- **Consequences:** A is what any implementation from text ships; B preserves the rig's evidential value; C is fairest but makes the rig evidence subtly off [INFER]. Reversibility: **easy** (one sentence). Risk: endgame logic mismatch across every surface.
- **Owner:** Sam; analysis supports C. **Closure:** decide now (small), verify feel at next session.

### F6 — Wild rules scope + Conjuration 16–17 scores
- **Files:** canon.yml wild_rule (general phrasing) vs rulebook line 156 (Enchantment-only) [FILE]; both score tables stop at 15 [FILE]
- **Status:** open. Sub-questions: declaration permanence; re-declaration on Reshape/Empower; wilds counting toward "same energy" in Conjurations; the two new table values.
- **Options:** A adopt DESIGN_REVIEW §6.4 ruling (declare on learn, fixed until dissolved, all spell types) + extend Conjuration column to 17; B restrict the rule to Enchantments only (rulebook as written) and cap the table at 15 by ruling wilds can't extend past 15. Evidence: canon's general phrasing suggests A was the intent [INFER]; the 2–4p UC-lockout depends on the rule working exactly as intended either way [FILE: rulebook line 156 rationale].
- **Reversibility:** easy. Risk: rules-engine work guesses; QUEUE P1 score-table item stays mis-framed as "PT size 15+" (stale — only Conjuration can exceed 15 under ranks 1–15 [FILE: DESIGN_REVIEW §1.4]).
- **Owner:** Sam (small, analysis-supported). **Closure:** decide now.

### F7 — Capacity: derived vs accumulated
- **Files:** rulebook "+N counter" event text throughout; nothing states the Empower 3→4 delta [GAP: DESIGN_REVIEW §6.2]
- **Options:** A derived ("capacity = base + sum of enchantment tiers" — makes the Capacity Gauge trivial and kills every stacking question); B accumulated (event-based, current text's implicit model).
- **Dependency:** effectively a *sub-decision of F1* — Option B of F1 practically requires derived; Option A/C of F1 can go either way [INFER]. Reversibility: easy. Risk: digital build invents an answer.
- **Owner:** Sam. **Closure:** decide together with F1's branch choice; premature alone.

### F8 — Ascension Trials: reconcile or park
- **Files:** `rulebook/Ascension Trials.md` (5–7p, no Echo domain, own warning box), `web-apps/trials-multiplayer.html` [FILE]
- **Options:** A park wholesale as Stage-5 expansion (DESIGN_REVIEW); B reconcile to 2–6p/5-energy now (QUEUE P3).
- **Consequences:** A costs nothing now; B spends effort on a module gated behind Stage 4+ anyway [FILE: QUEUE Deferred]. Reversibility: easy. Risk if unresolved: low, if on the do-not-touch list.
- **Owner:** Sam. **Closure:** decide now (trivially) or defer — either is safe; *reconciling* now is the only wrong move [INFER].

### F9 — Echo visual system promotion
- **Files:** `card-design/VISUAL_SYSTEM.md` (canonical, pre-Echo, "wild is not a fifth current"), `_review/VISUAL_SYSTEM_with_Echo.md` [FILE]
- **Options:** A promote the Echo variant to canonical; B keep split until F2 resolves; C drop the variant.
- **Dependency:** hard-gated on F2 — promoting before live validation canonizes Echo visually [FILE: QUEUE P3 decide]. Reversibility: medium (downstream exports). **Owner:** Sam, after F2. **Closure:** defer.

### F10 — Product scope: 2–4p core vs 5–6p Echo-first
- **Files:** `expansion/EXPANSION_INDEX.md` working direction + DESIGN_REVIEW V2 (2–4p core, Echo as expansion) vs capacity-economy thread + QUEUE P1s (5p live validation as the next milestone) [FILE]
- **Options:** A 2–4p primary band, Echo held as proven-on-paper expansion (V2); B 5–6p Echo-first validation (current QUEUE momentum); C decide after one more session that carries both questions (T2 vs T6 comparison) [INFER from DESIGN_REVIEW §8 "what would prove me wrong"].
- **Consequences:** A reframes F2's live-5p validation from "next milestone" to "expansion QA later" and re-aims the next session at 2–4p; B keeps current plan; C costs one session but buys the comparison data. Reversibility: **hard once print/pitch/exports are aimed at a band** [INFER]. Risk: Kiro optimizes every surface for a count band that gets demoted.
- **Owner:** Sam; playtest informs. **Closure:** Sam should pick A/B/C *as a test-sequencing decision now* (cheap) rather than a product decision (premature).

### F11 — DESIGN_REVIEW adoption (wholesale vs piecewise)
- **Files:** `_review/DESIGN_REVIEW_2026-07-03.md`; QUEUE P2 [decide] [FILE]
- **Status:** open, but **decomposes entirely into F1–F10, F12–F14 plus a handful of unqueued proposals** (Reshape cut, Drought draft, scoring-as-sentence, player mat) [INFER]. The review itself forbids silent adoption [FILE: its process note].
- **Options:** A adopt piecewise via the individual forks (this document's structure); B reject and re-derive. Reversibility: n/a (meta-decision). **Closure:** document only — treat F11 as *dissolved into this register*; the residual un-forked proposals (Reshape, Drought draft, scoring sentence, mat) are listed under F1/F5-adjacent playtest questions (§7).

### F12 — Partial Unlearn
- **Files:** rulebook UNLEARN (whole-spell only), `_review/OPUS_TASK_enchantment_system_RESPONSE.md` (adopt with three constraints; verbatim wording offered, line 79) [FILE]
- **Options:** A adopt OPUS wording (1 counter; remnant stays valid; returned cards frozen); B keep whole-spell only; C adopt + "remnant must not change spell type" guard if spammed (DESIGN_REVIEW T5 fallback) [FILE].
- **Reversibility:** easy. Risk: rules text drifts mid-test; it is also a *lever inside F1 Option A's rig test* [FILE: capacity-economy `next`], so its evaluation is entangled with the F1 branch used at the table [INFER].
- **Owner:** playtest (T5). **Closure:** playtest.

### F13 — Visual/rules terminology unification
- **Files:** "energies" (canon, rulebook) / "currents" (`card-design/VISUAL_SYSTEM.md`, wild flavor "Synthesis of the four currents" [FILE: decision propagation note]) / "elements" (GLOSSARY.md, pitch, Trials) [FILE]
- **Options:** A "energies" everywhere, "currents" retired; B "energies" in rules, "currents" tolerated as visual-design jargon; C defer with the pitch/Trials surfaces. Sub-item: "the aether" as Source synonym vs energy **Aether** collision — thematic brief proposes an alternative [FILE].
- **Consequences:** A is cleanest but touches under-F2 files; B is free; C leaves the checker blind (none of these are retired_terms, so drift is invisible to check.mjs [FILE: canon.yml]). Reversibility: easy. **Owner:** Sam (small). **Closure:** decide now for the GLOSSARY element-name substitution (already safe per Stage 1); decide A-vs-B when F9 closes.

### F14 — Card export regeneration timing
- **Files:** `card-design/export-cs3/`, `export-printenbind/`; QUEUE P1 tail + card-visuals thread say "now unblocked"; DESIGN_REVIEW §8 says stop print-pipeline work until T1–T5 settle rules text [FILE — the two current files directly disagree]
- **Options:** A regenerate now (Echo vocabulary + tier text as currently written); B hold until F1+F2 close; C regenerate only surfaces that carry no ladder/counter text [INFER — probably an empty or tiny set, since tier text is on cards].
- **Consequences:** A risks printing text that F1/F2/F3 will change (printenbind costs real money [FILE: memory/reference specs]); B costs nothing but leaves the card-visuals thread's `next` stale. Reversibility of A: hard (physical prints) / easy (files only). **Owner:** Sam. **Closure:** decide now — this is the cheapest high-leverage "no" available [INFER].

---

## 3. Dependency graph

```
F10 (product scope) ──frames──► F2 (Echo confirm/kill) ──gates──► F9 (visual system)
      │                              │                                 │
      │                              └──gates──────────────┐          │
      ▼                                                     ▼          ▼
F1 (counter system) ──branch determines──► F7 (derived?)  F14 (card exports)
      │                    │
      ├──wording──► F3 (timing text)      F5 (game-end) ──independent, small
      ├──entangled──► F12 (partial unlearn)
      └──resolves──► CON-11 (Recall text rewrite-vs-redesign, QUEUE P2 [decide])
F4 (scoring rationale) ──independent, document-only
F6 (wild scope + 16–17) ──independent, small; unblocks score-table P1
F8 (Trials) ──independent, park-or-defer
F13 (terminology) ──partially gated on F9/F2 for card surfaces; GLOSSARY part free
F11 ──dissolves into all of the above
```

Named dependencies (decide-first → unlocks → stays blocked → early-Kiro hazard):

1. **F10 → F1/F2 test sequencing.** Decide the scope *question framing* first (even as "run the comparison session"). Unlocks: a coherent next-session design. Blocked until then: aiming pitch, exports, or `state.js` at either band. Hazard: Kiro reads the QUEUE's 5p-first momentum as settled product direction [FILE: QUEUE P1s all reference 5p validation].
2. **F1 → F3 text, F7, F12 evaluation, CON-11 rewrite, reference cards, player mat, `state.js` capacity logic, counter sections of both web references.** Blocked until then: every teaching surface's counter/Recall text. Hazard: Kiro implements the round-trip QUEUE item *and* the gauge-bearing review proposal — they are mutually exclusive and un-cross-referenced [FILE: DESIGN_REVIEW C1].
3. **F1 → Recall step existence.** Option B deletes Recall entirely; Options A/C keep it (A repurposes it as payment). Any edit that "clarifies the Recall step" presumes a branch [INFER]. Hazard: the rules-and-teaching thread's `next` (rewrite counter refresh text) is Option C work — fine as a *control-arm draft*, drift if merged into the rulebook as canon before T1/T4.
4. **F3 (+F1 wording) → LEARN/EMPOWER text, GLOSSARY Learn entry, any reference card regeneration.** Hazard: Kiro copies "add to your pool now" onto new surfaces.
5. **F7 → `state.js` capacity model, mat design.** Blocked until F1. Hazard: digital build invents accumulated-event semantics because that's what the current text implies.
6. **F12 → UNLEARN text.** Blocked until T5. Hazard: OPUS verbatim wording pasted in as canon because it's the best-written text in the repo [INFER].
7. **F5 → endgame text, `state.js` end handling, sim ASSUMPTIONS alignment.** Small and independent — closeable now. Hazard: three surfaces ship three different endings.
8. **F4 → SCORING_REBALANCE annotation.** Unlocks: safety against future "corrections". Nothing blocked. Hazard: an agent treats the sim verdict as latest-analysis-wins.
9. **F6 → score-table P1 (reframed), wild examples in rulebook.** Hazard: Kiro "fixes" the table per the stale PT-15+ framing.
10. **F2 → F9 → F14; also F2 → `state.js` ladder update (QUEUE P2 explicitly gates it [FILE]) and any Echo-vocabulary cleanup.** Hazard: cleanup passes that drop "under test" framing canonize Echo; export regeneration prints an experiment.
11. **F2 ↔ F1 entanglement:** F2's confirm criteria include "no counter-mechanic confusion" — running the validation session under an F1-modified system muddies both experiments. The test plan must pick which fork the session primarily serves [INFER]. This is itself a Sam call inside F10's sequencing decision.
12. **F8, F13(card surfaces), pitch → parked behind everything above.** Hazard: helpful reconciliation of Trials or pitch canonizes branches.

---

## 4. Critical blocker analysis

### F1 — counter/capacity fork (blocks the most work)
**Why it blocks:** capacity is the #1 comprehension and economy failure [FILE: Sessions 1&3, both OPUS analyses, DESIGN_REVIEW C1], and all four branches rewrite the same passages: turn structure (4-phase vs 3-phase), Recall (kept / repurposed / deleted), LEARN/EMPOWER/UNLEARN counter text, and the entire physical component story (tokens vs gauge).
**Files unsafe to edit until closed:** rulebook Turn Structure / Building Your Capacity / Recall / Learning Actions sections; GLOSSARY counter+Recall entries; reference cards and any player mat; `state.js` capacity logic; counter-management sections of `archmage-reference.html` and `player-reference.html`.
**Safe preparatory work:** draft Option C's rewritten counter text *as a labelled test artifact* (control arm), not a rulebook edit; build the OPUS player-mat prototype as a *test component* (it carries T1/T4/T5/T7 in one session [FILE: DESIGN_REVIEW §8]); add the missing cross-reference between the two QUEUE items (Stage 1 safe fix #8); rig-test the round-trip variant per the capacity-economy thread's own `next` [FILE] — rig work commits nothing.
**Closing evidence:** T1 (does any text fix comprehension?) + T4 (gauge A/B) metrics: counter questions per player, time-to-first-correct-Recall, ≥4/5 grasp with no verbal teach, uptake ≥3/5, plus the tension watch (did casting/learning stop competing?) [FILE: DESIGN_REVIEW T1/T4, OPUS Step-6].
**Sam-now or playtest:** playtest. Sam's immediate call is only the *test plan* (which branches go to the table, in what order) — recommended: C as control + B as variant, A held unless B degrades texture (recommendation, not canon).

### F2 — Echo/Option-2 (blocks all Echo-canonical work)
**Why it blocks:** it is the repo's only formal experiment; everything Echo-flavored is under-test by construction [FILE: decision status, RECORD.md].
**Unsafe files:** canon.yml deck/energy lines (beyond status annotation), card exports, VISUAL_SYSTEM merge, `state.js` ladder update, any "cleanup" of under-test framing.
**Safe prep:** fix the baseline-integrity question (verify GLOSSARY baseline natively; re-baseline if truncated) — *this protects the revert path and should happen before any live session* [INFER from RECORD.md revert procedure]; prepare the 5p session kit without printing new cards.
**Closing evidence:** the RECORD's own confirm/kill criteria at a live 5p table [FILE].
**Sam-now or playtest:** playtest — but Sam must first resolve the F2↔F1 session-design entanglement (§3.11) and F10's framing.

### F10 — product scope (blocks correct prioritization of everything)
**Why it blocks:** it determines whether F2's validation session is the critical path or a side quest, which count band the reference cards/mat/pitch optimize for, and whether the 79-card SKU shapes component design [FILE: EXPANSION_INDEX working direction vs QUEUE P1 focus; DESIGN_REVIEW V2].
**Unsafe files:** pitch, exports, any per-count tuning (Source sizing), marketing-facing text.
**Safe prep:** none needed — this is a pure Sam decision about test sequencing, closeable in one conversation.
**Closing evidence:** none required to choose C (comparison session); T2-vs-T6 table-energy comparison if Sam wants data first [FILE: DESIGN_REVIEW §8].
**Sam-now or playtest:** Sam now, at minimum as "which session runs first".

### F3 and F5 (small blockers with outsized reach)
Both are one-sentence rules with three-surface blast radius (rulebook, GLOSSARY/web refs, `state.js`). Both are closeable by Sam now at the principle level; F3's final wording waits on F1. Evidence to close: none beyond what's already in the files — these are judgment calls the analyses have already argued one way [FILE: DESIGN_REVIEW §6.1, §6.5].

---

## 5. Safe-now vs blocked-later matrix

### Safe now (no design branch chosen)
| Task | Target files | Reason safe | Acceptance condition |
|---|---|---|---|
| Repair GLOSSARY.md truncation — **amended**: verify on Windows natively; recover via OneDrive version history if baseline is also truncated | `rulebook/GLOSSARY.md` (+ possibly re-baseline) | Pure data recovery | File ends with complete entries; baseline verified or refreshed; diff reviewed |
| Fix in-file glossary "3-4" → "3-5" (CON-1) | Complete Rulebook line 426 | canon.yml settles 3–5 | No "3-4" enchantment text in rulebook |
| Energy-name substitution in GLOSSARY (CON-3, names only; exclude "the aether" entry) | GLOSSARY.md | Canon settled pre-v2.8 | No Fire/Water/Earth/Air in rulebook/ |
| Record scoring-override rationale (F4) | decision file append or SCORING_REBALANCE header note | Documents an already-made choice | Reader of SCORING_REBALANCE alone is warned |
| Fix QUEUE archive "+2 counters" line; reframe score-table P1 to Conjuration-16–17 framing | `meta/QUEUE.md` | Process-state accuracy | QUEUE matches decided facts; residual question preserved as F6 |
| Cross-reference the two counter P1s as mutually exclusive (F1 guard) | `meta/QUEUE.md` | Changes no design | Neither item readable without seeing the other |
| Update `_review/README.md` + ASSUMPTIONS `[[STATE]]` pointers | those two files | Process plumbing decided 2026-07-03 | No retired-file refs outside `_archive/` |
| check.mjs repair | `meta/checks/check.mjs` | **Done this session** [FILE] | Checker runs; flags triaged |
| Draft control-arm counter text + player-mat prototype as labelled test artifacts | new files under `meta/experiments/` or playtest kit | Test material, not canon | Clearly labelled non-canon; rulebook untouched |
| Verify/re-baseline the Echo experiment's revert kit | `meta/experiments/echo-option-2/baseline/` | Protects reversibility, changes nothing | Every baseline file complete and byte-verified |

### Decision-gated (Sam first)
| Task | Target files | Gating fork | Acceptance |
|---|---|---|---|
| Enchantment timing principle | rulebook LEARN/EMPOWER, GLOSSARY | F3 (principle now; wording after F1) | Decision file written; propagation checklist |
| Game-end procedure | rulebook line 386, ASSUMPTIONS, `state.js` | F5 | One procedure, three surfaces agree |
| Wild scope + Conjuration 16–17 values | rulebook Components, both score tables | F6 | Table closed at 17; wild examples per spell type |
| Score-table P1 execution | `archmage-reference.html` | F6 | Values decided before edit |
| Trials park-vs-reconcile | Ascension Trials.md | F8 | Decision recorded; file annotated or left alone |
| Export regeneration go/no-go | card-design exports | F14 (and F1/F2 if "go") | Explicit Sam call recorded as decision |
| Terminology rule (energies/currents) | VISUAL_SYSTEM, GLOSSARY, pitch | F13 | Canon.yml retired_terms updated if terms retired |
| Next-session design (which forks it serves) | playtest plan | F10 + F2↔F1 entanglement | Session has one primary question |

### Playtest-gated (table evidence first)
| Task | Target files | Gating fork | Acceptance |
|---|---|---|---|
| Counter system implementation (text, cards, mat, code) | rulebook, GLOSSARY, refs, `state.js` | F1 (T1/T4) | T-metrics recorded; decision file written |
| Echo canonization or revert | canon.yml, exports, VISUAL_SYSTEM | F2 (T2) | RECORD criteria met; status flipped |
| Partial Unlearn adoption | rulebook UNLEARN | F12 (T5) | Overhead ≤1 turn; ≤1 opportunistic use/player |
| Recall text rewrite-vs-redesign (QUEUE P2 [decide]) | rulebook | F1/T1 | Comprehension result from written-rules-only teach |
| Drought draft / Reshape cut / scoring-sentence proposals | rulebook | F11 residue; T3/T7 | Each gets its own decision file if adopted |
| `state.js` ladder update | `state.js` | F2 (explicit QUEUE gate [FILE]) | Option-2 live-validated |

### Parked / deferred (do not touch in current planning)
| Area | Target files | Reason | Acceptance to unpark |
|---|---|---|---|
| Pitch revisions | `pitch/` | QUEUE Deferred: stability first [FILE] | F1+F2+F10 closed |
| Expansion content incl. "The Convergence" naming | `expansion/` | Stage 4+ gate [FILE: EXPANSION_INDEX] | Stage gate passed |
| Trials reconciliation work (as opposed to the F8 park decision) | Trials.md, trials-multiplayer.html | F8 + Stage 5 | F8 says reconcile |
| Final card art / export regeneration | card-design | F14 + Anti-Drift Rule 2 [FILE] | F14 "go" recorded |
| Visual system merge | VISUAL_SYSTEM.md | F9 gated on F2 | Echo canon |
| `_archive/`, experiment baselines | — | Frozen | Never (baselines: read-only until experiment closes) |
| Sim elaboration | `simulation/` | DESIGN_REVIEW: rig has answered its questions [FILE]; contested only by F1-A's rig-first note — resolve inside F1 test plan | F1 plan requires it |

---

## 6. Human decision questions for Sam

**Q1 (F10/F2/F1 sequencing — answer now, safe):** Which single question does the next live session primarily answer? (a) Echo 5p validation under current rules (serves F2, control for F1-C); (b) counter A/B at 2–4p — control text vs Capacity Gauge (serves F1, defers F2); (c) both in one long session, F1 block first at 4p then F2 block at 5p (ambitious; risks muddying both). **Default: (b)** — F1 gates more files than F2, and F2's "no counter confusion" criterion is unreliable while F1 is open [INFER]. Consequence: (a) keeps Echo momentum but may validate a deck on top of a mechanic about to change; (b) walks back a week of 5p framing; (c) needs 6+ hours and a stable group.

**Q2 (F1 test plan — answer now, safe):** Approve the recommended test branches: text-rewrite control arm + Capacity Gauge variant, round-trip held back unless the gauge degrades strategic texture? Options: approve / swap round-trip in as the variant / test all three. **Default: approve.** Consequence: swapping in round-trip tests the branch with an unspecified coupling [GAP: DESIGN_REVIEW C1] and no written ruleset yet; all-three needs multiple sessions at 2–3-week spacing [FILE].

**Q3 (F3 — answer now, safe at principle level):** Enchantment effect timing: (a) gains next turn, losses immediate; (b) both next turn; (c) keep immediate. **Default: (a)** (blocks both abuse directions [FILE: DESIGN_REVIEW §6.1]). Consequence: (c) ships the known exploit; (b) simpler teach, leaves unlearn-timing games open. Final wording waits for F1.

**Q4 (F5 — answer now, safe):** Game end when Released Reserve empties: (a) immediately; (b) that player finishes learning; (c) finish the round so all players have equal turns. **Default: (c)** (seat-fair). Consequence: (a) keeps seating advantage; (b) matches the rig data exactly, so sim evidence stays clean; (c) is fairest but slightly diverges from what the rig modelled [FILE: ASSUMPTIONS line 35].

**Q5 (F6 — answer now, safe):** Wilds: (a) declaration required in all spell types, fixed until the spell dissolves, Conjuration table extended to 17; (b) Enchantment-only declaration (current rulebook text), table capped at 15 by ruling. **Default: (a)** (matches canon.yml's general phrasing [FILE]). Consequence: (b) leaves "same energy" wild questions open in Conjurations/PTs and keeps the table open-ended.

**Q6 (F14 — answer now, safe, high leverage):** Card export regeneration: (a) hold all export/print work until F1 and F2 close (except one legible reference-card/mat prototype for testing); (b) regenerate digital files now, no printing; (c) regenerate and print per the card-visuals thread. **Default: (a).** Consequence: (c) risks paid prints of text T1–T5 may change [FILE: DESIGN_REVIEW §8 vs QUEUE "now unblocked" — your two current files disagree; this question IS the tiebreak].

**Q7 (F8 — answer now, safe):** Ascension Trials: (a) park wholesale as Stage-5 expansion (annotate the file, close the P3); (b) keep the P3 reconciliation task alive. **Default: (a).** Consequence: (b) keeps a stale-file hazard on the board through the whole implementation phase.

**Q8 (F4 — answer now, safe):** Confirm 12/18 stands and the override rationale gets recorded (capacity value is the real payment; 26 double-pays UC)? (a) yes, record it; (b) reopen 18-vs-26. **Default: (a).** Consequence: (b) reopens a fork every current analysis argues is closed [FILE: DESIGN_REVIEW §4].

**Q9 (F13 — partially premature):** GLOSSARY element-name fix proceeds now (safe). Separately: retire "currents" in favor of "energies" everywhere, or tolerate it as card-design jargon? (a) retire (add to canon retired_terms — checker then enforces it); (b) tolerate. **Default: defer the a/b choice until F9**; only the GLOSSARY substitution is timely. Consequence of deciding now: touches under-F2 visual files.

**Q10 (F12 — premature to decide, timely to stage):** Include partial Unlearn (OPUS wording) in the next session's variant arm? (a) yes, ride along with T4/T5; (b) hold for a later session. **Default: (a)** (it shares the table with the F1 test at zero extra setup [FILE: DESIGN_REVIEW T5]). This stages the test; adoption still waits on the table result.

---

## 7. Playtest-required questions

**P1 — Is the counter failure text or structure? (F1, T1)** Hypotheses: (H-text) rewritten text + worked example yields zero counter questions; (H-structure) no prose fixes it. Minimum setup: teach from written materials only, current mechanics + control-arm text; no verbal patching. Closing data: counter questions per player in first 3 turns; time-to-first-correct-Recall. H-text supported: zero questions → V1/Option-C suffices. H-structure: ≥2 players confused → gauge (or round-trip) becomes necessary.

**P2 — Gauge vs tokens (F1, T4).** Hypotheses: (H-gauge) gauge+3-phase removes confusion without breaking the economy; (H-tension) removing the shared budget collapses the cast-vs-learn tension (conjuration spam, 3-turn sprints). Setup: A/B same group, two short games, player-mat prototype, Recall deleted in the B arm. Closing data: OPUS Step-6 metrics (≥4/5 unaided grasp; zero lost-place; ≥3/5 uptake) AND tension watch (casting/learning still compete?). H-gauge → kill round-trip QUEUE item; H-tension → test round-trip (A) before deciding.

**P3 — Echo confirm/kill (F2, T2).** Hypotheses per RECORD.md [FILE]: uptake >2/5 vs conjuration non-viability under dilution. Setup: 5p, 79 cards, current ladder, 2-counter start — *under whichever counter system Q1 selects, recorded as a validity caveat*. Closing data: uptake count; per-player pre-Drought turns; conjurations learned. Confirm → F9/F14/state.js unlock. Kill → revert via (verified) baseline.

**P4 — Partial Unlearn (F12, T5).** Hypotheses: costed pivot tool vs spammable optimizer. Setup: rides P2's variant arm. Closing data: overhead turns to first enchantment; partial-unlearns per player per game. ≤1 opportunistic use → adopt; spammed → add remnant-type guard, retest.

**P5 — Drought climax or coda (F11 residue, T3).** Hypotheses: ≥2 genuine choices per Drought turn vs auto-placement. Setup: observation only, no changes. Auto-placement → prototype pick-1-of-3 draft next session (proposal, not canon).

**P6 — Product band energy (F10, T2-vs-T6).** Hypotheses: the game's soul lives at 2–4p (V2) vs high counts. Setup: compare table energy/interaction across one 4p and one 5p session. Closing data: turns/player, completed builds, engagement notes, "ended too soon" reports. Only needed if Sam declines to answer Q1 decisively [INFER].

Not playtest-required (analysis/Sam suffice): F3, F4, F5, F6, F8, F13, F14 — do not spend table time on these.

---

## 8. Kiro risk notes

| # | Drift risk | Where it bites | Anti-drift rule |
|---|---|---|---|
| K1 | Implementing both counter branches (round-trip AND gauge) because both sit at P1 | QUEUE lines 14, 19, 27, 30, 31 | Rule: no edit may touch counter/Recall/capacity text without citing a closed F1 decision file. The two QUEUE items must carry mutual "alternative-to" cross-references (safe fix). |
| K2 | Updating stale files as canon (GLOSSARY elements, Trials 5–7p, pitch, `state.js`) | rulebook/, pitch/, web-apps/ | Rule: consult the Stage-1 canon map before editing any file; files marked stale get *annotated*, not silently corrected, unless a safe-fix item covers them. |
| K3 | Treating review proposals as decisions (DESIGN_REVIEW rulings, OPUS wordings) | _review/ → rulebook | Rule: text may move from `_review/` into content files only via a `meta/decisions/` file with propagation checklist (process.md §3 already mandates this [FILE]). |
| K4 | Canonizing Echo accidentally (dropping "under test" framing during cleanup) | canon.yml, rulebook 5–6p text, exports | Rule: the strings "under test"/"experiment" attached to Echo/79-card content are load-bearing; no cleanup pass may remove them while `meta/experiments/echo-option-2/` exists. |
| K5 | Regenerating card exports too soon | card-design/export-* | Rule: export regeneration requires an explicit Sam "go" recorded as a decision (Q6); until then the card-visuals thread's "now unblocked" `next` is contested and must not be executed [FILE: thread vs DESIGN_REVIEW §8]. |
| K6 | Reconciling Ascension Trials helpfully | Trials.md, trials-multiplayer.html | Rule: Trials is read-only until F8's decision file exists. |
| K7 | Overwriting historical analysis (SCORING_REBALANCE verdict, RESULTS ladder-as-run, playtest logs) | simulation/, playtests/ | Rule: analysis and log files are append/annotate-only; conclusions are records of what was believed when, never edited to match later canon. |
| K8 | Terminology "consistency" passes (elements→energies→currents) applied globally | GLOSSARY, VISUAL_SYSTEM, pitch | Rule: vocabulary edits only per F13's scoped decisions; never repo-wide find-replace — canon.yml's retired_terms is the sole enforcement list, extend it rather than freelancing. |
| K9 | Touching experiment baselines or `_archive/` | meta/experiments/*/baseline/, _archive/ | Rule: read-only, enforced socially since the checker doesn't guard them [GAP — worth a checker rule later]. |
| K10 | Trusting the OneDrive mount | any file | Rule: any file that ends mid-sentence or fails to parse is presumed partially hydrated, not corrupt — verify natively before "repairing" (this session's check.mjs and GLOSSARY are both instances [FILE]). |

---

## 9. Recommended next review prompt

**Counter/capacity system deep dive.**

Reasoning from the dependency graph: F1 is the graph's highest-degree node — it gates F3's wording, F7 entirely, F12's evaluation context, CON-11's rewrite-vs-redesign, every teaching surface, the reference cards blocking every session [FILE: QUEUE P1], and (via the §3.11 entanglement) even the validity of F2's confirm criteria. Every other blocker is either closeable by Sam in one sitting (F3, F5, F6, F8, F10-as-sequencing — §6 does that work) or waits on a table (F2). But F1 goes to the table *next session*, and the session designs in the files disagree about what to bring: the capacity-economy thread wants the round-trip variant rig-tested first [FILE: thread `next`], DESIGN_REVIEW wants the rig retired and a gauge A/B run [FILE: §8], and the round-trip branch has an unspecified core coupling nobody has written rules for [GAP: C1]. A deep dive that (a) writes the missing round-trip ruleset to testable precision, (b) specifies the gauge variant's mat and the control arm's text, (c) resolves the rig-first-vs-table-first sequencing with explicit criteria, and (d) emits the exact session kit, converts F1 from "the biggest open fork" into "a scheduled experiment" — which is the last thing standing between the safe-now hygiene set and a Kiro implementation queue. The playtest-plan audit would be premature by exactly one document: it needs the deep dive's outputs as its inputs [INFER].

---

*Process note: this file is review-only. Nothing in it changes canon, QUEUE, or decision status. It must be referenced from `meta/QUEUE.md` per the `_review/` linkage rule (checker-enforced).*
