---
title: Decision Register — Archmage Ascension
type: decision-register
date: 2026-07-04
status: living-document
purpose: Single tracked list of open/decided/parked design decisions and what closes each. Supersedes the scattered [decide] items across QUEUE + review docs. Not canon — a tracker; closure happens via meta/decisions/ files.
sources: forks audit F1–F14, truth audit D-1–D-12/CON-1–13, product viability, design review; verified against canon.yml, rulebook, echo decision — 2026-07-04
evidence_tags: "[FILE] · [INFER] · [GAP]"
---

# Decision Register (July 2026)

IDs reuse the forks-audit F-numbers where they map, so this register and the audit chain
stay cross-referable. Nothing here is closed unless a `meta/decisions/` file already
justifies closure — silent closure is forbidden [process.md §3].

**Three closure lanes:**
- **SAM-NOW** — Sam can answer in one sitting; needs no table. (DR-HOOK, F3, F4, F5, F6, F8, F10-as-sequencing, F14, DR-PITCH, DR-STATE, DR-NAME-narrative)
- **STRANGER** — closes only at a stranger table. (F1, F2, F12, DR-CLOCK, DR-DROUGHT)
- **KIRO-LATER** — implementation detail, do not start until its parent closes. (F7, F9, F13-cards, DR-STATE-impl)

---

**2026-07-06 amendments** to F3/F4/F5/F6/F8/F10/F14 (plus DR-SOURCE and the Unlimited
Capacity ruling) are sourced from `_review/ARCHMAGE_SAM_DECISIONS_F3_F14_2026-07.md` and
propagated to `meta/decisions/2026-07-06-f*.md`. Note two **reversals** of earlier
recommendations: **F6** caps size at 15 (no Conjuration 16–17), and **F8** keeps Ascension
Trials active (not parked).

---

## DR-HOOK — Protect the one-sentence hook
- **Status:** ✅ **closed 2026-07-06** — Option A adopted with amended wording; decision
  file `meta/decisions/2026-07-06-protect-the-hook.md`; recorded in PROJECT.md + MASTER_PLAN §2.
- **Accepted hook:** *It's rummy where your melds stay alive as spell engines — but every
  spell you cast burns down the shared Source, and when it runs dry your Spellbook becomes
  the proof that decides who can renew the world's magic.* (Sam amended the ending from the
  recommended "biggest Spellbook wins" to the thematic-stakes framing.)
- **Owner:** Sam
- **Options:** (A) adopt the "living melds + player-burned Source" one-sentence hook as the
  protected core with a standing "no change may reduce table-visibility of the hook" rule;
  (B) leave the product identity implicit as today.
- **Recommendation:** A. Write it into PROJECT.md and a decision file.
- **Evidence:** [FILE] product viability §2 (hook fully rulebook-supported), §6 judgment rule;
  design review §2.
- **Files affected:** PROJECT.md; new `meta/decisions/` file (canon delta: none — it's a lens).
- **Dependency:** none. It is the lens the other decisions are judged through.
- **Closure condition:** decision file written; PROJECT.md carries the sentence + standing rule. ✅ met.

## DR-NAME — Game title & end-narrative (retire "Archmage" / "Ascension")
- **Status:** open — **SAM-NOW** for the narrative (Track A, do when convenient);
  **finalize-late** for the title string (gated with DR-PITCH / F14).
- **Owner:** Sam (creative/branding call). Kiro can assist with name-collision research +
  a candidate shortlist; stranger sessions inform it (the logistics plan captures what
  players call the game, verbatim).
- **Problem:** "Archmage Ascension" collides with the board game *Archmage* and the card
  game *Ascension* — both words should be avoided in the title. Consequence: the
  end-narrative ("the Archmage ascends") must change too.
- **Two parts, different timing:**
  - **(A) End-narrative / premise.** Entangled with **DR-HOOK** and `rulebook/Story.md`.
    The accepted hook is already name-agnostic (no "Archmage"/"Ascension"; ending =
    "renew the world's magic"), so it survives — but the lore's ascension framing (incl.
    the "ascends" phrasing in the DR-HOOK amendment note) is what this revises. Pure
    Track A design work; no gate.
  - **(B) The title string.** Widest propagation blast radius in the repo. Keep "Archmage
    Ascension" as an explicit **working title** now; choose the final name once and
    propagate in a single pass, *before* any paid print, pitch, or external-facing surface.
- **Options (timing):** (i) rename everything now — rejected (churn; risks a second
  rename after scope/testing shifts the identity); (ii) working title now, finalize late —
  **recommended**, mirrors DR-PITCH exactly.
- **Files affected:** repo/folder names, `PROJECT.md`, `meta/canon.yml`, rulebook title,
  `GLOSSARY.md`, `Story.md`, `pitch/`, `web-apps/` titles/headers, `board/`, exports,
  `index.html` — essentially every surface (hence: do it once).
- **Dependency:** title finalization gated with DR-PITCH / F14 (finalize before external
  commitment). Narrative (A) has no gate. DR-HOOK is unaffected by the rename.
- **Closure condition:** (A) revised end-narrative recorded (decision + `Story.md`);
  (B) final name chosen + one-pass propagation recorded as its own decision file, done
  before any paid/external surface.

## F10 — Product scope: 2–4p core vs 5–6p Echo-first
- **Status:** **AMENDED 2026-07-06 — Echo is an *extension* of the base system, not an
  expansion; equal design priority with 2–4p for now.** Packaging remains undecided
  (product/manufacturing call, not design-priority). Sequencing intent unchanged (run F1
  cleanly, then 5–6p Echo + AT). Decision file
  `meta/decisions/2026-07-06-f10-echo-extension-not-expansion.md`. Was: open, working
  hypothesis A (2–4p primary).
- **Owner:** Sam (product-shape); stranger playtest informs
- **Options:** (A) 2–4p primary band, Echo held as proven-on-paper expansion; (B) 5–6p Echo-first
  (current QUEUE momentum); (C) decide after one comparison session that carries both.
- **Recommendation:** commit **now** to running the F1/2–4p session first (test-sequencing);
  hold the A/B product decision until the comparison datum (E4/T6) exists. Working hypothesis: A.
- **Evidence:** [FILE] EXPANSION_INDEX working direction + design review V2 (→A) vs capacity-economy
  thread + QUEUE P1s (→B); product viability §M-G, W8 argues A as a *product-shape*, not test-
  sequencing, call. [GAP] no live comparison of table energy across bands.
- **Files affected:** nearly everything downstream (pitch, exports, per-count tuning, `state.js`).
- **Dependency:** reframes what F2 success even means; gates correct prioritization of all print/pitch.
- **Closure condition:** Sam picks A/B/C as sequencing now (cheap); product band confirmed after the
  comparison session. **Do not aim any print/pitch/export at a band before this closes.**

## F1 — Counter / capacity system (the master fork)
- **Status:** open — **STRANGER** (the single highest-leverage open decision)
- **Owner:** stranger playtest (T1 text-vs-structure + T4 gauge A/B); Sam picks the test plan
- **Options:** (A) round-trip token redesign (place=cast, pickup=payment; keeps + deepens tokens,
  adds an unspecified cast↔learn coupling [GAP]); (B) Capacity Gauge + delete Recall, 3-phase turn
  (simplest teach; risk: removing the shared budget unleashes conjuration spam); (C) text-only rewrite
  (control; three analyses predict it fails).
- **Recommendation:** run **C as control arm + B as variant** in one session; hold A unless B degrades
  strategic texture. This is the only sequencing both source docs tolerate.
- **Evidence:** [FILE] Sessions 1&3 + both OPUS analyses + design review C1 (structural, not textual);
  rulebook lines 303–304 codify the abuse; capacity-economy thread calls it "structurally broken."
- **Files affected:** rulebook (turn structure, Recall, LEARN/EMPOWER/RESHAPE/UNLEARN), GLOSSARY,
  reference cards, player mat, `state.js`, both web references.
- **Dependency:** gates F3 wording, F7, F12 evaluation context, CON-11, every teaching surface, and
  (via entanglement) F2's confirm criteria. Highest-degree node in the graph.
- **Closure condition:** T1/T4 metrics recorded (counter-Qs per player, time-to-first-correct-Recall,
  ≥4/5 unaided grasp, ≥3/5 uptake, tension-watch) → `meta/decisions/` file naming the chosen branch.

## F2 — Echo / Option-2 deck: confirm or kill
- **Status:** open, experiment running — **STRANGER**
- **Owner:** stranger/live 5p playtest
- **Options:** (A) confirm (uptake >2/5, no counter confusion from written rules, conjuration/PT
  stable) → decision `canon`, delete experiment folder; (B) kill/revert → copy baseline back, decision
  `reverted`.
- **Recommendation:** none yet. **Do not** confirm-by-cleanup. Note entanglement: a session run under
  an F1-modified counter system cannot cleanly clear F2's "no counter confusion" criterion.
- **Evidence:** [FILE] echo decision (status: experiment); experiment RECORD confirm/kill criteria;
  zero live data. [GAP] baseline GLOSSARY may itself be truncated on the mount — verify before relying
  on the revert kit.
- **Files affected:** canon.yml (deck/energy lines), rulebook 5–6p text, exports, VISUAL_SYSTEM merge,
  `state.js` ladder.
- **Dependency:** gated by F10 (which table?); entangled with F1; gates F9, F14, `state.js`.
- **Closure condition:** RECORD criteria met at a live 5p table (under a recorded counter-system caveat)
  → status flipped in the decision file.

## F3 — Enchantment effect timing
- **Status:** **principle DECIDED 2026-07-06** (gains next turn; losses immediate, reducing
  only remaining learning actions — no retroactive undo); text gated by F1. Decision file
  `meta/decisions/2026-07-06-f3-enchantment-timing.md`. Was: open — SAM-NOW.
- **Owner:** Sam (small); playtest confirms feel
- **Options:** (A) gains next turn / losses immediate (asymmetry blocks both abuse directions);
  (B) both next turn; (C) keep "now" (ships the exploit).
- **Recommendation:** A — decide the *principle* now, write the *text* after F1's branch is known.
- **Evidence:** [FILE] rulebook lines 303–304 "add to your pool now" vs QUEUE P1 next-turn intent;
  design review §6.1.
- **Files affected:** rulebook LEARN/EMPOWER, GLOSSARY Learn entry, `state.js`.
- **Dependency:** wording depends on F1 (gauge world vs token world states it differently).
- **Closure condition:** decision file records the principle now; propagation checklist ticked when F1
  closes.

## F5 — Game-end procedure
- **Status:** **REFRAMED 2026-07-06 — keep immediate end for now; open PLAYTEST WATCH**
  (not SAM-NOW closed). Seat-order unfairness is not automatically a problem; test the
  worst-case config (6p Echo + AT, low turn counts) before changing. Decision file
  `meta/decisions/2026-07-06-f5-game-end-procedure.md`. Was: open three-way, recommend C.
- **Owner:** Sam; analysis supports (C)
- **Options:** (A) immediate on Released-Reserve depletion (current text; seat-order unfair);
  (B) that player finishes learning (matches the rig); (C) finish the round (turn parity).
- **Recommendation:** C for fairness; if preserving the rig's evidential value matters more, B. Decide now.
- **Evidence:** [FILE] rulebook line 386 "immediately ends" vs ASSUMPTIONS line 35 vs design review §6.5.
- **Files affected:** rulebook End-of-Drought, `state.js`, sim ASSUMPTIONS alignment.
- **Dependency:** independent, small; three surfaces must end up agreeing.
- **Closure condition:** one procedure written; three surfaces reconciled; feel verified next session.

## F6 — Wild declaration scope + Conjuration 16–17 scores
- **Status:** **DECIDED 2026-07-06 (hybrid).** Wild declaration required in **all** spell
  types, fixed while the spell exists (from option A); but **max size 15 — do NOT extend
  Conjuration scoring to 16–17** (from option B). This **reverses the prior Recommendation
  A** below. Coupled ruling: a 5-component Enchantment (hence Unlimited Capacity) is
  **5–6p/Echo only**, since a wild can only be a deck-present energy. Decision file
  `meta/decisions/2026-07-06-f6-wild-scope-and-max-size.md`. Was: open — SAM-NOW.
- **Owner:** Sam (analysis-supported)
- **Options:** (A) declaration required in all spell types, fixed until the spell dissolves, extend
  Conjuration table to 17; (B) Enchantment-only declaration (rulebook as written), cap table at 15.
- **Recommendation:** A — matches canon.yml's general phrasing; also unblocks the (reframed) score-table P1.
- **Evidence:** [FILE] canon.yml general wild_rule vs rulebook line 156 (Enchantment-only); both score
  tables stop at 15; design review §1.4/§6.4 (only Conjuration can exceed 15 under ranks 1–15).
- **Files affected:** rulebook Components + both score tables.
- **Dependency:** independent; unblocks the score-table P1 (which is mis-framed as "PT size 15+").
- **Closure condition:** table closed at 17; one wild example per spell type in the rulebook.

## F4 — Scoring 12/18 override rationale (vs 15/26)
- **Status:** **DECIDED 2026-07-06 — keep 6/12/18**; rationale recorded; live-play **watch**
  item (not a settled balance proof). Decision file
  `meta/decisions/2026-07-06-f4-enchantment-scoring-rationale.md`. Was: decided-in-effect,
  rationale unrecorded — SAM-NOW.
- **Owner:** analysis writes the paragraph; Sam signs off
- **Options:** (A) record rationale, keep 12/18; (B) reopen 18-vs-26.
- **Recommendation:** A. Enchantment's real payment is capacity; pricing UC at 26 double-pays the
  dominant mechanical advantage and re-creates the rich-get-richer Drought the ladder just fixed.
- **Evidence:** [FILE] SCORING_REBALANCE verdict 15/26 vs canon 12/18; design review §4 argues 18 decisively.
- **Files affected:** append to echo decision file or SCORING_REBALANCE header note.
- **Dependency:** none. Protects against a later agent "correcting" the table to 26.
- **Closure condition:** a reader of SCORING_REBALANCE alone is warned the verdict was overridden and why.

## DR-CLOCK — Source clock visibility
- **Status:** open — **STRANGER** (cheapest high-leverage experiment in the repo)
- **Owner:** stranger playtest (E6 / design review T9)
- **Options:** (A) keep Source face-down; (B) flip the Source count face-up on a track (visibility only);
  (C) full manipulable clock with public thresholds (bigger redesign — V3 fragment).
- **Recommendation:** test B first (costs nothing). If no behavioural change, the hook needs C-level
  manipulability, which is a larger call — do not jump to C without B's null result.
- **Evidence:** [FILE] rulebook face-down Source; product viability F-F/W7/M-A; design review M3/T9.
  [GAP] no player has ever engaged the depletion.
- **Files affected:** board, setup rule, reference materials (test artifact only for now).
- **Dependency:** directly serves hook visibility (DR-HOOK) and interaction (product viability F-D).
- **Closure condition:** E6 A/B shows whether a face-up track changes clock-talk / racing behaviour.

## DR-DROUGHT — Drought as climax vs coda
- **Status:** open — **STRANGER** (observe first; only prototype a fix if it fails)
- **Owner:** stranger playtest (T3), then design if needed
- **Options:** (A) keep current draw-1/learn-only Drought; (B) face-up pick-1-of-3 Released-Reserve
  draft (agency + interaction at ~zero rules cost); (C) player-triggered ending (V3 steal).
- **Recommendation:** observe T3 first. If non-UC players make ≤1 real decision/Drought turn, prototype
  B as a labelled test variant. Do not adopt B blind.
- **Evidence:** [FILE] session 1 Phase-2 stall; design review M1/§5 V2; product viability F-C/F-I/M-B.
- **Files affected:** rulebook End-of-Drought (test artifact only for now).
- **Dependency:** judged against the emotional-arc target (DR-HOOK's "earned ending").
- **Closure condition:** T3 observation + (if B tested) decisions/turn and interaction data.

## F12 — Partial Unlearn
- **Status:** open — **STRANGER** (stage it now; adopt after the table)
- **Owner:** stranger playtest (T5)
- **Options:** (A) adopt OPUS wording (1 counter; remnant stays valid; returned cards frozen);
  (B) keep whole-spell only; (C) adopt + "remnant must not change spell type" guard if spammed.
- **Recommendation:** ride A along with the F1 variant arm at zero extra setup; adopt only if overhead
  ≤1 turn and ≤1 opportunistic use/player/game.
- **Evidence:** [FILE] rulebook UNLEARN (whole-spell); OPUS enchantment RESPONSE (verbatim wording);
  design review T5. Entangled with the F1 branch used at the table.
- **Files affected:** rulebook UNLEARN, `state.js`.
- **Dependency:** evaluation context depends on F1 branch.
- **Closure condition:** T5 metrics → decision file.

## F8 — Ascension Trials status
- **Status:** **DECIDED 2026-07-06 — do NOT park; ACTIVE reconciliation** (test-functional,
  not polish) so 5–6p Echo + AT can run; some playtesters value AT specifically. This
  **reverses the prior Recommendation A** (park wholesale) below. Decision file
  `meta/decisions/2026-07-06-f8-ascension-trials-reconcile.md`. Was: open — SAM-NOW.
- **Owner:** Sam
- **Options:** (A) park wholesale as Stage-5 expansion (annotate file, close the P3); (B) keep the
  reconciliation task alive now.
- **Recommendation:** A. Reconciling a Stage-5 module now is the only actively wrong move; parking costs
  nothing and removes a stale-file hazard from the whole implementation phase.
- **Evidence:** [FILE] Trials.md "5–7 players", no Echo domain (CON-6); QUEUE P3 vs design review "park".
- **Files affected:** `rulebook/Ascension Trials.md`, `web-apps/trials-multiplayer.html`.
- **Dependency:** independent.
- **Closure condition:** decision file records park; file annotated (not silently edited); P3 closed.

## F14 — Card export regeneration timing
- **Status:** ✅ **CLOSED 2026-07-06 as HOLD.** No export/print regeneration; existing
  5×20 + 4 P&B deck stays a flexible prototype (pull cards per test) and must not be read
  as deck canon. Decision file `meta/decisions/2026-07-06-f14-export-hold.md`. Matches the
  prior Recommendation A.
- **Owner:** Sam
- **Options:** (A) hold all export/print until F1+F2 close (except one legible test reference card/mat);
  (B) regenerate digital files now, no printing; (C) regenerate + print per the card-visuals thread.
- **Recommendation:** A. The card-visuals thread's "now unblocked" `next` and design review §8 directly
  disagree; this decision is the tiebreak. C risks paid prints of text T1–T5 may change.
- **Evidence:** [FILE] card-visuals thread vs design review §8/F14; memory reference specs (real cost).
- **Files affected:** `card-design/export-cs3/`, `export-printenbind/`.
- **Dependency:** "go" additionally requires F1+F2 closed.
- **Closure condition:** explicit Sam "go/hold" recorded as a decision file.

## DR-PITCH — Pitch rewrite timing
- **Status:** parked (correctly) — **SAM-NOW** to confirm it stays parked
- **Owner:** Sam
- **Options:** (A) keep parked until F1+F2+F10 close; (B) rewrite now.
- **Recommendation:** A. The current pitch contradicts canon on nearly every line (2–7p, 30–60min,
  Fire/Water/Earth/Air, "elegant counter system"); rewriting before scope stabilises just creates a
  second stale artifact.
- **Evidence:** [FILE] pitch sheet vs canon.yml (product viability §1); QUEUE Deferred "stability first".
- **Files affected:** `pitch/`.
- **Dependency:** F1, F2, F10.
- **Closure condition:** those three closed → pitch rewritten to the validated scope.

## DR-STATE — `state.js` ladder/capacity update timing
- **Status:** open, knowingly deprecated — **KIRO-LATER**
- **Owner:** Kiro, after F1 branch + F2 confirm
- **Options:** (A) hold until F1 branch chosen and F2 confirmed; (B) update to current ladder now.
- **Recommendation:** A. It is a 2-player prototype, out of the Echo decision's propagation scope by
  design; updating early bakes in an unresolved ladder and counter branch.
- **Evidence:** [FILE] CON-8; echo decision "out of propagation scope"; QUEUE P2 self-gates it on live
  validation.
- **Files affected:** `web-apps/archmage-ascension/game/state.js`.
- **Dependency:** F1 (capacity model incl. F7 derived-vs-accumulated) + F2 (ladder).
- **Closure condition:** both parents closed → single implementation pass with tests.

---

## DR-SOURCE — Source-emptying mid-turn timing (new, 2026-07-06)
- **Status:** **proposed rulebook patch** — principle decided, text pending Sam approval.
  Decision file `meta/decisions/2026-07-06-source-emptying-timing.md`.
- **Ruling:** complete the current atomic action (Collection choice or spell effect), then
  immediately begin the Drought; no further casts once the Source is empty. Conjuration/PT
  castable only if the Source can fully resolve them; a Transfiguration may be the action
  that empties the Source via Array replacement. PT must not partially resolve.
- **Files affected:** rulebook Casting Phase / End-of-the-Drought; `simulation/ASSUMPTIONS.md`.
- **Closure condition:** Sam approves the patch → written into the rulebook.

---

## Sub-decisions folded into parents (track, don't action alone)
- **F7 — capacity derived vs accumulated:** sub-decision of F1 (Option B practically requires derived).
  Decide *with* F1. **KIRO-LATER.**
- **F9 — Echo visual-system promotion:** hard-gated on F2. **KIRO-LATER.**
- **F13 — terminology (energies/currents/elements):** GLOSSARY element-name fix is safe now (Phase 1);
  the "retire currents?" a/b choice defers to F9. **Split.**
- **F11 — wholesale DESIGN_REVIEW adoption:** dissolved into the forks above; treat as closed-by-decomposition.

## Answerable-now summary
- **Sam can close this week (cheap):** DR-HOOK ✅, F3 (principle), F4, F5, F6, F8, F10-as-sequencing, F14,
  DR-PITCH-confirm.
- **Track A design work (no gate):** DR-NAME part A (end-narrative rethink, with DR-HOOK + Story.md).
- **Needs stranger evidence:** F1, F2, F12, DR-CLOCK, DR-DROUGHT.
- **Kiro-only after parents close:** F7, F9, F13-cards, DR-STATE.
- **Finalize late (with pitch/exports):** DR-PITCH, DR-NAME part B (the title string), F14.
