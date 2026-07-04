---
title: Repo Truth Audit — source-of-truth reconstruction
type: review
date: 2026-07-04
status: review-only
purpose: Stage 1 of the Kiro implementation-plan review chain — establish current truth, contradictions, and blockers. Makes no decisions.
sources: full repo inspection 2026-07-04 (meta/, rulebook/, _review/, playtests/, simulation/, expansion/, web-apps/, card-design/, board/, pitch/)
---

# Archmage Ascension — Repo Truth Audit (July 2026)

Evidence tags: **[FILE]** directly inspected · **[INFER]** reasoned from multiple files · **[GAP]** missing/unresolved/contradictory.

> **Repo-integrity note found during this audit (read first):**
> 1. `rulebook/GLOSSARY.md` is **truncated on disk** — it ends mid-word at the entry "**Unlimited Capacity Ma**" (line 232). Everything after that entry (at minimum the marker definition; possibly Wild and later entries) is lost [FILE]. A pre-Echo copy exists at `meta/experiments/echo-option-2/baseline/rulebook/GLOSSARY.md` for recovery.
> 2. `meta/checks/check.mjs` **could not be executed** from the Linux sandbox — the OneDrive mount serves partially-hydrated (truncated) copies of cloud-only files, so the checker crashed with a syntax error at what the mount thinks is EOF [FILE: run attempt 2026-07-04]. This is almost certainly a mount artifact, not file corruption [INFER], but it means the session brief and drift detection did not run for this audit, and the checker likely cannot run from any sandboxed agent until files are locally hydrated. Verify by running it natively on Windows.

---

## 1. Executive verdict

**What the current game is [FILE]:** Archmage Ascension, rulebook v2.8, Stage 3 (Core Loop Testing). A 2–6 player, 30–60-minute-target tabletop card game: a rummy-family pattern builder where players arrange components (4 energies × ranks 1–15 + wilds) into four spell types in a personal Spellbook, powered by a dual-use counter/capacity system, against a shared depleting Source deck; when the Source empties (the Drought) casting dies and a final learning-only phase runs until the Released Reserve empties; highest Recognition Points wins.

**What is canon [FILE]:** `meta/canon.yml` + the three decision files define it: 2–4p deck = 62 cards (canon, unchanged); 5–6p deck = 79 cards with fifth energy **Echo** (status: **experiment**, rig-chosen 2026-07-02, not live-validated); enchantment ladder 3=+1/6pts, 4=+3/12pts, 5=Unlimited Capacity/18pts (counter values locked 2026-07-03); starting counters 1 (2–4p) / 2 (5–6p); wild-declaration rule; "Convergence" retired. The rulebook, Scoring System Reference, GLOSSARY (Echo entry), and web reference were propagated to this state on 2026-07-03 [FILE: decision propagation checklist].

**What is stale/contradicted/unsafe [FILE]:** `GLOSSARY.md` still teaches Fire/Water/Earth/Air elements (and is truncated); the rulebook's own in-file glossary says Enchantment = "3-4 matching components"; LEARN grants counters "now" against the intended next-turn ruling; `simulation/SCORING_REBALANCE.md` concludes Ench-4=15/Ench-5=26 against canon 12/18 with no recorded override rationale; `Ascension Trials.md` assumes 5–7 players and has no Echo domain; the digital build (`state.js`) implements the pre-2026-07-02 ladder; the pitch sheet describes an older component model. All three playtests predate every v2.8-defining rule — **zero live data exists on the current game** [FILE: session dates vs decision dates].

**Kiro-ready?** **No — decisions first.** Roughly a dozen open decisions (Section 5) touch the exact files Kiro would edit, and the single biggest one — the counter-system fork (round-trip redesign vs Capacity Gauge) — points two live P1 workstreams in opposite directions [FILE: QUEUE P1 vs DESIGN_REVIEW C1]. A small set of contradiction-fixes is safe now (Section 7); everything else risks canonizing a disputed branch.

---

## 2. Current design reconstruction

All items below are explicit **[FILE]** from `rulebook/Archmage Ascension - Complete Rulebook.md` (v2.8), `meta/canon.yml`, and `rulebook/Scoring System Reference.md` unless tagged otherwise.

- **Core premise:** the Archmage is gone; ambient magic depletes; wizards build Spellbooks as proof of mastery; when magic runs out, the strongest Spellbook's owner ascends. [INFER, echoing `_review/DESIGN_REVIEW_2026-07-03.md`: the strongest undocumented tension is that casting Conjurations burns the shared clock — stated nowhere in player-facing text.]
- **Components:** cards (energy × rank 1–15), wilds, counters, Unlimited Capacity marker, A3 board (`board/`), 5-card face-up Array, printed reference cards (confirmed illegible in play [FILE: rules-and-teaching thread]).
- **Player counts:** 2–6. 2–4p: 62 cards (4 energies + 2 wilds, canon). 5–6p: 79 cards (adds Echo + 4 wilds, **experiment**). 7-player support exists only as a stale reference in Ascension Trials [GAP].
- **Setup:** 7-card hands; 5-card Array; binding discard of 1 card each to the Arcane Reserve before turn 1; starting counters 1 (2–4p) / 2 (5–6p).
- **Turn structure:** Collection (draw 1 from Source OR take 1 from Array) → Casting (place 1 counter per cast spell; effects immediate) → **Recall** (retrieve all counters; transition step) → Learning (counters again fund LEARN / EMPOWER / RESHAPE / UNLEARN at 1 each).
- **Spell types:** Conjuration (3+ same energy → bonus draws +1/+2), Transfiguration (3+ sequential any energy → mandatory Array exchange), Enchantment (3–5 matching values, passive, capacity ladder), Perfect Transmutation (3+ sequential same energy → both effects, mandatory).
- **Capacity/counter system:** one counter pool used twice per turn (casts, then learning actions), refreshed via Recall. Ladder: 3-card = +1, 4-card = +3, 5-card = Unlimited Capacity (marker; counters set aside). Unlearn/Reshape losses mirror the gains. This system is the confirmed #1 comprehension and economy failure [FILE: Sessions 1 & 3; capacity-economy thread: "structurally broken"].
- **Learning actions:** LEARN (new spell; enchantment counters granted "now" — disputed, see CON-2), EMPOWER (add cards to existing spell), RESHAPE (full rebuild, one action), UNLEARN (dissolve one whole spell; components frozen until next turn).
- **Drought/endgame:** Source empties → Array + Arcane Reserve shuffle into Released Reserve; no casting; draw-1 + learning only; when Released Reserve empties, "the contest immediately ends" (disputed vs sim, see CON-5).
- **Scoring:** Recognition Points table in `Scoring System Reference.md`, sizes 3–15, four columns; Enchantment column 6/12/18 doubles as the capacity ladder; tiebreak most spells → largest spell. [INFER, from DESIGN_REVIEW: the table is three arithmetic progressions and could be stated as one sentence — proposal only.]
- **Variants/modules:** Ascension Trials (advanced endgame; stale, see CON-6). `expansion/` holds parked Stage-4+ concepts (Schools, Last Rites, Spell Duels tiers, post-Echo directions) with a standing rule: no expansion may require Echo [FILE: EXPANSION_INDEX.md].
- **Visual/thematic terminology:** energies Radiance/Void/Flux/Aether (+Echo); suits ♠♥♦♣; primary card design = arcana art + beacon connector [FILE: canon.yml, card-visuals thread]. Terminology is NOT uniform across files — "energies" (rulebook/canon) vs "currents" (`card-design/VISUAL_SYSTEM.md`) vs "elements" (GLOSSARY.md, pitch, Ascension Trials strategy text) [FILE; see CON-3/CON-12].
- **Playtest/simulation evidence:** 3 live sessions (2026-05-01 2p; 05-02 planned 5p; 05-03 5p) — all pre-date v2.8's defining rules [FILE]. Simulation rig (`simulation/`): 10k-game deck comparison (RESULTS.md) drove the Option-2 decision; SCORING_REBALANCE.md is its scoring companion (partially overridden, CON-4). Sim agent never plays Transfiguration/PT [FILE: SCORING_REBALANCE method note] — rig confidence weakest where Echo's suit dilution bites [INFER].

---

## 3. Canon map

| File / section | Status | Why |
|---|---|---|
| `meta/canon.yml` | **Canonical** (with internal experiment markers) | Declared machine-checkable canon; explicitly distinguishes canon (2–4p deck) from under-test (5–6p deck). |
| `rulebook/Archmage Ascension - Complete Rulebook.md` | **Canonical, with 2 known stale spots** | Manifest `sources_of_truth: rules`; propagated 2026-07-03. In-file glossary "3-4" entry (CON-1) and LEARN "now" timing (CON-2) contradict intent. |
| `rulebook/Scoring System Reference.md` | **Canonical** | Manifest source of truth for scoring; matches canon 6/12/18. |
| `rulebook/GLOSSARY.md` | **Contradictory + damaged** | Source of truth per manifest, but teaches Fire/Water/Earth/Air (CON-3) and is truncated on disk. |
| `rulebook/Ascension Trials.md` | **Stale / parked** | 5–7p model, no Echo domain, own warning box about 6–7p pools; queued P3 for reconciliation; DESIGN_REVIEW recommends parking wholesale. |
| `rulebook/Story.md` | Current but provisional | Lore; not checked in depth here; thematic-coherence task open against the lore vocabulary. |
| `meta/decisions/2026-07-02-echo-option-2-deck.md` | **Canonical record of an EXPERIMENT** | status: experiment; confirm/kill criteria in `meta/experiments/echo-option-2/RECORD.md`. Kiro must not treat Echo/79 as settled. |
| `meta/decisions/2026-07-03-working-system-v2.md` | Canonical (process) | status: canon. |
| `meta/QUEUE.md`, `meta/threads/*` | Canonical process state | The to-do truth; one internal inconsistency (archive line says 4-card "+2 counters", CON-4b). |
| `meta/experiments/echo-option-2/baseline/*` | **Frozen snapshots — never edit** | Revert kit; also the recovery source for the truncated GLOSSARY. |
| `_review/DESIGN_REVIEW_2026-07-03.md` | **Review/analysis only** | Says so itself: "proposals only — nothing above changes canon until decided." The best single analysis in the repo, but adopting any of it is decision D-11. |
| `_review/OPUS_TASK_*`, `FIFTH_SUIT_ANALYSIS.md`, `VISUAL_SYSTEM_with_Echo.md` | Review/analysis only | Each mirrored by a QUEUE [decide] item. |
| `_review/README.md` | **Stale** | Still points at BACKLOG.md and STATE.md, both retired 2026-07-03. |
| `simulation/RESULTS.md` | Analysis, current | Basis of the Option-2 decision; ladder modelled "as proposed" with 4-card=+2 (canon later chose +3) — read with that caveat. |
| `simulation/ASSUMPTIONS.md` | Analysis, current but stale-referencing | References `[[STATE]]` (retired); encodes a game-end rule the rulebook contradicts (CON-5). |
| `simulation/SCORING_REBALANCE.md` | **Contradicted analysis** | Verdict (Ench-4=15, Ench-5=26) conflicts with canon 12/18; no override rationale recorded anywhere (CON-4). |
| `web-apps/archmage-reference.html` | Current (propagated) | Echo/79/ladder/2-counter start present; score table covers sizes 3–15 [FILE: line 269–272, 815]. |
| `web-apps/archmage-ascension/game/state.js` (digital build) | **Deprecated vs canon, knowingly** | Old ladder (3=+1, 4=UC), 1-counter start, no 5-tier; explicitly out of the Echo decision's propagation scope, queued P2 for after live validation. Kiro must not "fix" it early or treat it as rules evidence. |
| `card-design/VISUAL_SYSTEM.md` | Canonical (visuals) but pre-Echo | Manifest source of truth; explicitly has no fifth energy ("wild is not a fifth current"); the Echo variant sits unpromoted in `_review/VISUAL_SYSTEM_with_Echo.md` (QUEUE P3 decide). |
| `card-design/export-cs3/`, `export-printenbind/` | **Deprecated outputs** | Generated before the Echo vocabulary/ladder; regeneration queued — but DESIGN_REVIEW recommends stopping print work (see Do-not-touch). `export-cs3/svg-cards/wild-00.svg` still contains "Convergence" [FILE: grep]. |
| `pitch/archmage_pitch_sheet.html` | Stale, knowingly deferred | "elemental components", "60-84 Custom Cards", "4 Wild Cards" — pre-Echo, pre-62/79 model [FILE: grep]. QUEUE Deferred: pitch revisions wait for stability. |
| `expansion/*` | Parked (Stage 4+) | Explicit stage gate in EXPANSION_INDEX.md. Note: contains a direction named "The Convergence" — outside the vocab scan scope, ambiguous vs the retired term (CON-13). |
| `playtests/*` | Historical evidence | Accurate records of a *previous* ruleset. |
| `Playtest Guide - New Player Session.md`, `USING_THE_SYSTEM.md`, `index.html` | Unclear status | Not inspected in depth this pass; the Playtest Guide predates v2.8 changes by filename position [GAP — verify before next session]. |

---

## 4. Evidence-backed contradictions

**CON-1 — Rulebook contradicts its own enchantment size.**
Files: `Complete Rulebook.md` — Spell Types §Enchantment ("3-5 components", line ~150) and Building Your Capacity vs in-file Glossary ("Enchantment: Spell using **3-4** matching components", line ~426). Nature: stale ladder text survived the 2026-07-03 propagation whose checklist claims "ladder consistent across the file" [FILE: decision checklist]. Likely ruling: 3–5 (canon.yml). Risk: a Kiro consistency pass could "correct" body text toward the glossary. **Blocks Kiro: no** — safe to fix now (Section 7).

**CON-2 — LEARN timing codifies the abuse the ruling bans.**
Files: Rulebook LEARN ("Immediately gain +1 counter (add to your pool now)") and GLOSSARY.md Learn entry, vs QUEUE P1 ("Clarify that enchantment effects begin on the player's NEXT turn — current ambiguity allows counter-system abuse") and rules-and-teaching thread. Nature: printed rule vs stated design intent. Likely ruling: next-turn for gains (DESIGN_REVIEW §6.1 proposes gains-next-turn / losses-immediate; that asymmetry is a proposal, not decided). Risk: any implementation (digital build, reference cards, mats) built from current text ships the exploit. **Blocks Kiro: yes** for anything touching capacity logic or rules text.

**CON-3 — GLOSSARY.md teaches a retired element model.**
Files: GLOSSARY.md "Element: Fire, Water, Earth, Air", "Component ... element (Fire, Water, Earth, Air)", Conjuration/Perfect Transmutation entries using "element"; vs canon.yml energies and the rulebook. Also "The aether ... poetic synonym for the Source" colliding with the energy **Aether** [FILE]. Identified 2026-05-07 in the thematic-coherence brief, never fixed [FILE: DESIGN_REVIEW §1.3]. Note the same file's Echo entry is fully current — the file is half-migrated. Likely ruling: Radiance/Void/Flux/Aether; retire "the aether" as Source synonym (thematic brief suggests an alternative; picking one is a small decision). Risk: GLOSSARY is a manifest source of truth; generators or Kiro consistency passes could propagate elements outward. **Blocks Kiro: yes** for glossary-derived work; the energy-name fix itself is safe now.

**CON-4 — Two scoring truths coexist.**
Files: `simulation/SCORING_REBALANCE.md` verdict ("keep 4-card = 15, add 5-card = **26**") vs canon.yml / Scoring System Reference (4=12, 5=18). Nature: the 2026-07-02 analysis was overridden by the 2026-07-03 decision, but no file records why [GAP]. DESIGN_REVIEW §4 argues 18-not-26 decisively — as a proposal. **CON-4b:** QUEUE Archive line ("resolved: 4-card becomes **+2 counters** / score 12") contradicts the decided +3 [FILE: QUEUE line 56] — a stale resolution note. Risk: an agent reading SCORING_REBALANCE as latest-analysis-wins would "fix" the table to 15/26. **Blocks Kiro: no**, if the override rationale is recorded (Section 7); the underlying 18-vs-26 argument closes with D-4.

**CON-5 — Two game-end procedures.**
Files: Rulebook ("the contest **immediately ends**" on Released Reserve depletion) vs `simulation/ASSUMPTIONS.md` ("that player **finishes their learning**, then the game ends"). Nature: the sim validated Option 2 under a rule the rulebook doesn't contain; neither gives turn parity [FILE; DESIGN_REVIEW §1.9]. Likely ruling: not inferable — DESIGN_REVIEW proposes finish-the-round (a third procedure). Risk: seat-order fairness; also means rig evidence subtly mismatches printed rules. **Blocks Kiro: yes** for endgame logic anywhere (digital build, reference materials).

**CON-6 — Ascension Trials vs the player-count and energy canon.**
Files: `Ascension Trials.md` — "7th Trial (5-7 Players Only)", 7p Recognition pool column, power domains listing only 4 energies (no Echo domain), "elemental domains" wording; vs canon 2–6p / 5 energies. Also its own warning box: 6–7p per-trial splits never specified [FILE]. Nature: whole-file staleness; queued P3; DESIGN_REVIEW recommends parking the variant wholesale (Stage 5+). Risk: low if untouched; high if any tool (e.g. `trials-multiplayer.html`) is developed against it. **Blocks Kiro: no — if Trials is on the do-not-touch list.**

**CON-7 — Wild-declaration rule: scope mismatch.**
Files: canon.yml states it generally ("a wild must be declared as one of the energies currently in the deck"); the rulebook states it only inside the Enchantment definition [FILE: rulebook line ~156]. Unspecified: permanence of declaration, re-declaration on Reshape/Empower, wilds in Conjurations counting toward "same energy" [FILE: DESIGN_REVIEW §6.4]. Likely ruling: not inferable — canon's general phrasing suggests all-spell-types intent [INFER], but that is a rules decision. Risk: the 2–4p UC-lockout depends on this rule working exactly as intended; edge-case play or digital implementation will hit the gaps. **Blocks Kiro: yes** for any rules-engine work.

**CON-8 — Digital build implements the old game.**
Files: `web-apps/archmage-ascension/game/state.js` — 3-ench=+1, 4-ench=Unlimited (line ~302), start 1 counter, no 5-tier, counter floor `Math.max(1, ...)` (nowhere in the rules) [FILE]; vs canon ladder. Nature: known, deliberate, queued P2 pending live validation. Risk: only if someone treats the build as rules evidence or "fixes" it before the Option-2 experiment resolves. **Blocks Kiro: it IS a queued Kiro-shaped task, but explicitly gated on live validation — do not do it yet.**

**CON-9 — The counter-system fork: two P1 workstreams point opposite ways.**
Files: QUEUE P1 [decide] round-trip counter redesign (deepens token choreography) vs `_review/OPUS_TASK_counter_and_tracker_RESPONSE.md` Option A / DESIGN_REVIEW C1 & T4 (Capacity Gauge — deletes token choreography and Recall). The QUEUE items do not cross-reference each other as alternatives [FILE: DESIGN_REVIEW C1]. Additionally, DESIGN_REVIEW §6.2 notes capacity-as-derived vs capacity-as-accumulated is unspecified (Empower 3→4 ladder delta). Nature: unresolved design fork over the game's most broken system. Risk: highest in the repo — any implementation of counter UI, reference cards, mats, or digital logic bakes in one branch. **Blocks Kiro: yes, hard.**

**CON-10 — Score table ceiling vs achievable spell size.**
Files: both score tables (Scoring Reference md; archmage-reference.html line 815) stop at 15; a wild-extended Conjuration can reach 16–17 [INFER: 15 ranks + 2 wilds; DESIGN_REVIEW §1.4]. The QUEUE P1 frames this as "Perfect Transmutation size 15+", which is stale — under ranks 1–15 a PT cannot exceed 15; only Conjuration can [FILE/INFER: DESIGN_REVIEW]. Likely ruling: extend Conjuration column to 17 and close the table — but the two new values are a (small) design decision. **Blocks Kiro: no**, once D-6b decided.

**CON-11 — Recall/counter refresh text vs comprehension reality.**
Files: rulebook Recall text (three separate passes: Understanding Counters, Learning Phase, "The Recall Step") vs playtests 1 & 3 ("not understandable from card or board even after verbal explanation") and QUEUE Deferred's noted "3-card enchantment grants +1 counter AND +1 action AND +1 slot" double-description [FILE: QUEUE/thread; the double-description's exact location was not independently verified this pass — [GAP]]. Nature: not text-vs-text but text-vs-evidence; resolution depends on CON-9's fork (rewrite vs redesign, QUEUE P2 [decide]). **Blocks Kiro: yes** for rules text and teaching materials.

**CON-12 — Three vocabularies for one concept.**
Files: "energies" (canon, rulebook, web reference) / "currents" (`card-design/VISUAL_SYSTEM.md`, `_review/VISUAL_SYSTEM_with_Echo.md`) / "elements"-"elemental" (GLOSSARY.md, pitch sheet, Ascension Trials strategy primer) [FILE: greps + reads]. canon.yml only polices "Convergence" — none of these are retired terms, so the checker cannot see this drift [FILE: canon retired_terms]. Likely ruling: "energies" is canon [INFER: it's what canon.yml and the propagated files use]; whether "currents" survives as visual-design jargon is a small decision. **Blocks Kiro: partially** — blocks any glossary/pitch regeneration.

**CON-13 — "Convergence" retired but present.**
Files: canon retired_terms: Convergence; live hits: `expansion/EXPANSION_INDEX.md` ("The Convergence" co-op direction name), `card-design/export-cs3/svg-cards/wild-00.svg`, `card-design/incoming/playtable_sandbox (layout).html` [FILE: greps]. All three locations are excluded from the vocab scan scope (expansion/ not listed in vocab_scan_dirs; svg-cards and incoming/ in vocab_exclude) — so this is deliberate-or-lucky blindness [INFER]. Nature: ambiguity about whether the retirement means "the term names nothing" or "the term must vanish". Risk: low; but the expansion direction name will confuse future agents. **Blocks Kiro: no.**

---

## 5. Unresolved decisions

| ID | Decision | Options in files | Files affected | Kiro failure mode if unresolved | Who decides |
|---|---|---|---|---|---|
| D-1 | **Counter system: round-trip redesign vs Capacity Gauge vs text-only rewrite** (CON-9/CON-11) | QUEUE P1 round-trip; OPUS Option A gauge; V1 text-only (DESIGN_REVIEW T1/T4 A/B) | rulebook, GLOSSARY, reference cards, player mat, state.js, web reference | Implements one branch of the fork as if decided; wasted print/code work | Playtest decides (T1/T4); Sam picks the test plan |
| D-2 | **Echo/Option-2: confirm or kill** | confirm/kill criteria in experiment RECORD | canon.yml, rulebook, exports, everything Echo | Treats 79-card deck/UC-at-5-6p as canon; regenerates exports for a rule that may revert | Playtest decides (live 5p) |
| D-3 | Enchantment gain timing (next-turn?) and loss timing (immediate?) (CON-2) | current "now"; QUEUE next-turn; DESIGN_REVIEW asymmetric ruling | rulebook LEARN/EMPOWER, GLOSSARY, state.js | Ships the counter-abuse exploit | Sam (small); playtest confirms |
| D-4 | Record why 12/18 overrode the 15/26 rebalance verdict — or revisit it (CON-4) | canon 12/18; SCORING_REBALANCE 15/26; DESIGN_REVIEW argues 18 decisively | Scoring Reference, decision file, SCORING_REBALANCE | Later agent "corrects" scoring back to 26 | Analysis can decide (write the rationale); Sam signs off |
| D-5 | Game-end procedure: immediate / finish-learning / finish-round (CON-5) | rulebook; ASSUMPTIONS; DESIGN_REVIEW §6.5 | rulebook, state.js, sim | Endgame logic mismatch between every surface | Sam; analysis supports finish-round |
| D-6 | Wild rules: declaration scope, permanence, re-declaration; (b) Conjuration 16–17 score values (CON-7/CON-10) | canon general vs rulebook-enchantment-only; DESIGN_REVIEW rulings proposed | rulebook Components, score tables | Rules engine guesses; table stays open-ended | Sam (small, analysis-supported) |
| D-7 | Capacity as derived (base + tier sum) vs accumulated events (Empower 3→4 delta) | DESIGN_REVIEW §6.2 proposal only | rulebook, state.js, mats | Digital build invents an answer | Sam; analysis supports derived |
| D-8 | Ascension Trials: reconcile to 2–6p or park wholesale (CON-6) | QUEUE P3 reconcile; DESIGN_REVIEW park | Ascension Trials.md, trials-multiplayer.html | Wasted reconciliation of a Stage-5 module | Sam |
| D-9 | Promote `VISUAL_SYSTEM_with_Echo.md` to canonical visual system? | QUEUE P3 [decide] | card-design/VISUAL_SYSTEM.md, exports | Exports regenerated from pre-Echo visual spec | Sam; gated on D-2 |
| D-10 | **Product scope: 2–4p core + Echo expansion (V2 / expansion-index product model) vs 5–6p Echo-first (current QUEUE P1 focus)** | EXPANSION_INDEX "working direction" and DESIGN_REVIEW V2 vs capacity-economy thread's 5p validation focus | nearly everything | Kiro optimizes surfaces for a count band that gets demoted | Sam; playtest informs (T2 vs T6) |
| D-11 | Adopt/reject the DESIGN_REVIEW's proposals wholesale or piecewise (QUEUE P2 [decide]) | the review's V1/V2/V3 + 9 rulings | — | Review silently treated as canon (it forbids this itself) | Sam |
| D-12 | Partial Unlearn: adopt (OPUS wording) or keep whole-spell only | rulebook current; OPUS/QUEUE P1 note; DESIGN_REVIEW T5 | rulebook UNLEARN, state.js | Rules text drifts mid-test | Playtest (T5) |

---

## 6. Stale or unsafe assumptions

- **Old player-count model (5–7p, 4×20, 84 cards):** survives in `Ascension Trials.md` (CON-6), `FIFTH_SUIT_ANALYSIS.md` baselines (correctly, as history), and Session 3's context [FILE]. Current ceiling is 6.
- **Old element model (Fire/Water/Earth/Air):** GLOSSARY.md core entries; "elemental" in pitch and Trials primer (CON-3/CON-12).
- **Old enchantment ladder (3=+1, 4=UC):** `state.js` (CON-8); also RESULTS.md ran 4-card=+2 (noted as tunable — fine as history, misleading if read as current).
- **Old scoring (Ench-4=15; Ench-5=26 proposal):** SCORING_REBALANCE verdict table (CON-4).
- **Old score-bug framing ("PT size 15+"):** QUEUE P1 item carries the old 4×20-deck framing; web table now covers 3–15, so the item is half-done and mis-framed (CON-10) [FILE].
- **Old process pointers:** `_review/README.md` → BACKLOG.md/STATE.md; `simulation/ASSUMPTIONS.md` front-matter → `[[STATE]]` [FILE]. Harmless to the game, corrosive to agent orientation.
- **Old expansion assumption:** any pre-2026-07-02 note treating Echo as expansion design space (archived, but "Echo" appears in Spell Duels lineage — the reconciled doc already renamed its "Echo" form to Imprint [FILE: EXPANSION_INDEX]).
- **Potentially dangerous old task:** "regenerate card exports — now unblocked" (QUEUE P1 tail / card-visuals thread `next`) assumes ladder text is stable; DESIGN_REVIEW explicitly recommends stopping print-pipeline work because T1–T5 may change the rules text [FILE both]. These two current files disagree about whether the task is ready [GAP]. Also: "playtest evidence supports v2.8" is an assumption nothing supports — all live data predates it [FILE].

---

## 7. Safe implementation candidates

Safe = depends on no open decision; canon already settles it; reversible.

1. **Repair GLOSSARY.md truncation.** Target: `rulebook/GLOSSARY.md`. Change: restore the lost tail (recover pre-Echo text from `meta/experiments/echo-option-2/baseline/rulebook/GLOSSARY.md` or git history, re-apply the 2026-07-03 Echo/ladder edits to the recovered entries). Why safe: pure data recovery. Acceptance: file ends with complete entries; "Unlimited Capacity Marker" (and any subsequent entries) fully present; Echo-era wording preserved; diff reviewed against baseline.
2. **Fix the in-file rulebook glossary "3-4" → "3-5" (CON-1).** Target: Complete Rulebook glossary Enchantment entry. Why safe: canon.yml settles 3–5; the propagation checklist already claims this. Acceptance: no "3-4" enchantment text anywhere in rulebook; propagation checkbox honest.
3. **Energy-name pass on GLOSSARY.md (CON-3, name substitution only).** Target: Element, Component, Conjuration, Perfect Transmutation entries. Change: Fire/Water/Earth/Air → Radiance/Void/Flux/Aether; align "element" → "energy". Why safe: canon settled since before v2.8; zero design content. **Exclude** the "the aether" flavor-synonym question — that's a wording decision (D-3-adjacent, thematic brief). Acceptance: no Fire/Water/Earth/Air in rulebook/; "aether" entry untouched pending decision.
4. **Record the scoring-override rationale (CON-4).** Target: `meta/decisions/2026-07-02-echo-option-2-deck.md` (append) or a one-paragraph note in SCORING_REBALANCE.md header. Change: one paragraph — canon chose 12/18 over 15/26 on [date]; rationale reference (DESIGN_REVIEW §4 argument may be cited as *analysis*, not adopted). Why safe: documents what already happened; changes no values. Acceptance: an agent reading SCORING_REBALANCE alone is warned off "fixing" the table.
5. **Fix QUEUE archive "+2 counters" line (CON-4b) and reframe the score-table P1 (CON-10 framing only).** Target: `meta/QUEUE.md`. Why safe: process-state accuracy; the reframe records that the web table now reaches 15 and the residual question is Conjuration 16–17 (which stays open as D-6b). Acceptance: QUEUE lines match decided facts.
6. **Update `_review/README.md` pointers** (BACKLOG.md→`meta/QUEUE.md`, STATE.md→threads) and `simulation/ASSUMPTIONS.md` `[[STATE]]` link. Why safe: process plumbing, decided 2026-07-03. Acceptance: no references to retired files outside `_archive/`.
7. **Verify/repair `meta/checks/check.mjs` execution path.** Target: run natively on Windows; if genuinely truncated, restore from git. Why safe: the checker is process infrastructure with a canon spec (process.md contract). Acceptance: `node meta/checks/check.mjs` runs clean and its flags are reviewed.
8. **Add cross-references between the two counter P1s (CON-9, reference only).** Target: QUEUE. Change: mark round-trip item and the gauge-bearing review item as mutually exclusive alternatives resolved by D-1/T4. Why safe: changes no design; prevents the worst failure mode. Acceptance: no reader can act on one without seeing the other.

---

## 8. Do-not-touch list (for Kiro, until explicit approval)

- **Anything implementing counter/capacity mechanics** — rules text beyond the timing wording, reference cards, player mats, digital logic. Awaiting D-1 (playtest T1/T4). Includes NOT deleting or "cleaning up" either fork's QUEUE item.
- **`web-apps/archmage-ascension/game/state.js` ladder/capacity code** — explicitly gated on Option-2 live validation (D-2) [FILE: QUEUE P2].
- **Card export regeneration (`export-cs3/`, `export-printenbind/`)** — QUEUE says unblocked, DESIGN_REVIEW says stop; that conflict is itself undecided (D-11). Regenerating now could print rules text T1–T5 may change.
- **`rulebook/Ascension Trials.md` and `web-apps/trials-multiplayer.html`** — awaiting D-8; reconciling it "helpfully" would canonize the reconcile-don't-park branch.
- **Scoring values anywhere** — 6/12/18 stands until D-4 formally closes 18-vs-26; do not add Conjuration 16–17 values until D-6b.
- **`simulation/SCORING_REBALANCE.md` and `RESULTS.md`** — do not edit conclusions; they are the record of overridden/ancestral analysis. Annotate (Section 7.4) only.
- **`meta/experiments/echo-option-2/baseline/`** — frozen revert kit. Read-only forever.
- **`expansion/`** — stage-gated by its own index; includes not renaming "The Convergence" direction without asking (CON-13).
- **`card-design/VISUAL_SYSTEM.md`** — do not merge the Echo variant until D-9.
- **`pitch/`** — explicitly deferred until stability [FILE: QUEUE Deferred].
- **Echo/deck composition text anywhere** — it is an experiment; "cleanup" that drops the under-test framing would silently canonize it.
- **`_archive/`** — grows only.

---

## 9. Recommended next review prompt

**Decision forks audit.**

Reasoning: this audit shows the repo's canon layer is in unusually good shape for a solo project — one machine-checkable canon file, decision records with propagation checklists, an experiment with a revert kit. The blockers are not missing information; they are ~12 interlocking open decisions (Section 5) whose dependency structure is nowhere written down: D-1 gates D-3/D-7/D-12 and all teaching surfaces; D-2 gates D-9 and the exports; D-10 reframes what D-2's success even means; D-11 overlaps nearly all of them. Two current files already disagree about whether one task is "unblocked" purely because that dependency graph is implicit. A focused decision-forks audit — enumerating each fork, its options, its evidence status, which playtest (T1–T9) or which Sam-call closes it, and which file edits unlock behind it — converts Section 5 of this document into the dependency spine the Kiro master plan needs. Capacity/counter and playtest-evidence audits are both real, but they are each *inside* one fork of that graph; mapping the graph first prevents auditing a branch that a pending decision may delete.

---

*Process note: this file is review-only (per its front-matter). Nothing in it changes canon, QUEUE priorities, or decision status. It should be referenced from `meta/QUEUE.md` per the `_review/` folder rule.*
