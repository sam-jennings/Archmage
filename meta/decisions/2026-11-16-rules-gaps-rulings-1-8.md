---
title: Rules-gaps rulings 1A–8A — rulebook v3.3 (Unlearn scope, capacity timing, spell type, last Reserve card) + four Ascension Trials rulings
type: decision
date: 2026-11-16
status: canon
thread: rules-and-teaching
source: _review/RULES_GAPS_BRIEF_2026-11.md
---

# 2026-11-16 — Rules-gaps rulings 1A–8A (rulebook v3.2 → v3.3)

Source: Sam (designer), 2026-11-16, answering `_review/RULES_GAPS_BRIEF_2026-11.md`:
**items 1–8, all option A.** Items **9–17 (Group 3) are NOT decided** and stay open in the
brief; nothing from them was applied.

## Change

Base game (Groups 1–2, written into the rulebook as **v3.3**, using the brief's wording):

| # | Ruling | Rulebook v3.3 |
|---|---|---|
| 1A | **Unlearn: one rule.** What stays must be a valid spell, of any type; if it would not be, the whole spell returns to hand. The "ends only" sentence for runs is deleted (it becomes a consequence). Wilds that stay in a run keep their number. | UNLEARN paragraph replaced; old line 345 removed |
| 2A | **Capacity timing: compare before and after** any learning action (Learn, Empower, Reshape, Unlearn). More arrives next turn (keep what you had until then); less is lost now; capacity that has not arrived yet is never a loss. Affordability gate = full counter cost + loss. | Enchantment Effect Timing replaced; lines 202, 337, 348 point to it |
| 3A | **The cards decide a spell's type**; most specific wins (a same-energy sequence is always a Perfect Transmutation). Only a spell with two or more wilds can be read two ways: its owner names it when learning it, and it stays that until rebuilt. | New paragraph at the top of Spell Types; glossary Conjuration "need not be sequential", Transfiguration "any energies" |
| 4A | **Last Released Reserve card:** the drawer finishes that turn, including Learning; then the contest ends. | End of The Drought line replaced; glossary Drought entry |

Ascension Trials (Group 2; variant rules, **thread stays PARKED** — rulings made while
parked, no Trials playtests scheduled):

| # | Ruling |
|---|---|
| 5A | Any **5–6 player** Trials game uses candidate package **C1 "Coherent Claim"**. `rulebook/Ascension Trials.md` stays a 2–5 player historical text until a package replaces it. |
| 6A | **Echo** is a fifth Trials power domain, same formula as the other energies. |
| 7A | **Complete Mastery** is in play at **5–6 players**, with the Echo deck. |
| 8A | **Each Enchantment of 4 or more components** grants +1 wild power. |

**Version:** minor bump v3.2 → v3.3 (clarifications only: no score, ladder, deck or cost
changes; the brief marks 1A–4A "clarifies only"). The first-v3.2-playtest P1 keeps its name and
now plays v3.3; nothing it measures changed. `rulebook/Ascension Trials.md` 2.8 → 2.9 (own
draft numbering, not lockstep with the rulebook).

## How it was applied where the brief left a choice

- **2A across Enchantments.** The build compares the player's whole Enchantment capacity
  before and after (the rulebook says "your Enchantments"); a loss first cancels any
  capacity still waiting to arrive, and only the rest is charged now. Single-Enchantment
  cases match the v2 explainer exactly.
- **3A after a partial Unlearn.** In the digital build a remainder holding two or more wilds
  keeps the spell's named type if it is still valid (it has not been rebuilt); anything else
  is re-read from its cards (e.g. Void 2-5-6-7-9 minus 2 and 9 becomes a Perfect
  Transmutation). The rulebook text is the brief's, unchanged.
- **8A term.** The brief's wording says "Wild power"; the Trials text still says "wild magic
  power" because renaming the term is item 13 (Group 3, open). The sentence uses the
  existing term: "Each Enchantment of 4 or more components grants +1 wild magic power."
- **6A / 8A in the companion.** `current-draft.js` stays pinned to the analysis model's
  `baseline_v28_stale.json`; both rulings are host options **on by default**, so the loaded
  package plays the v2.9 text and the model is untouched.
- **5A in the companion.** `rulesets/index.js` exports `RULESET_FOR_5_6` (C1) and
  `rulingRulesetFor(count)`; `DEFAULT_RULESET_ID` stays `null` (the thread is parked, so no
  package becomes the default at 2–4). The draft's caveats name C1 for 5–6.
- **4A in the French pack.** Group 2 but the pack is a six-player session, so the end-of-game
  line was updated with the Group 1 changes.

## Why

Sam's call, following the brief's recommendations: one sentence per rule instead of verb
lists and special cases; the v2 explainers and the digital build had drifted apart on 1 and
2 and now give the same answer; 4A is what the build and the simulation already played.

## Canon delta (applied to `meta/canon.yml` this turn)

- `rulebook_version: v3.2 → v3.3`; both `versioned_files` carry `version: v3.3`.
- Header comment: v3.3 line + v3.2 archive pointer.
- New facts: `unlearn_scope` (1A), `capacity_timing` (2A), `spell_type` (3A), `game_end`
  (4A), `trials_rulings` (5A–8A, thread parked, 9–17 open).
- `retired_terms` unchanged.

## Propagation

- [x] Archive v3.2 byte-exact before editing: `_archive/*-v3.2-2026-11-16/` (rulebook, scoring
  reference, glossary, rules.v3.2.js, current.js, sw.js, six v2 index pages, explainer
  strings / unlearn / capacity-timing / drought / engine, Trials rulesets current-draft +
  index, digital build state.js + RULES_SUMMARY.md, both classic references, hub
  `index.html`) and `Ascension Trials.md-v2.8-2026-11-16/`; index block in
  `_archive/README.md` (2026-11-16)
- [x] `meta/canon.yml` — canon delta above (2026-11-16)
- [x] `rulebook/Archmage Ascension - Complete Rulebook.md` — v3.3; 3A Spell Types paragraph;
  2A Enchantment Effect Timing + lines 202 / 337 / 348; 1A UNLEARN (341 replaced, 345 deleted);
  4A End of The Drought; glossary Drought / Conjuration / Transfiguration (2026-11-16)
- [x] `rulebook/Scoring System Reference.md` — version label v3.3 only (no content change) (2026-11-16)
- [x] `rulebook/GLOSSARY.md` — Capacity, Enchantment (2A), Perfect Transmutation (3A),
  Released Reserve (4A), Unlearn (1A) (2026-11-16)
- [x] `web-apps/v2/data/rules.v3.2.js` → `rules.v3.3.js` (git mv): id/version/status note;
  Unlearn details (1A; "ends only" line removed); Reshape capacity line + `capacity.timing`
  (2A); Spells type paragraph + Conjuration / Perfect notes (3A); `drought.end` and Released
  Reserve glossary (4A). `current.js` import, `sw.js` list + VERSION, six page preloads
  (2026-11-16)
- [x] `web-apps/v2/learn/explainers/` — `unlearn.js` (no `conflict` status; `retype` allowed,
  unflagged; `later` index), `capacity-timing.js` + `drought.js` notes now kind `ruled`,
  `engine.js` renders `ruled` as a clarification, `strings.en.js` (`retype` rewritten;
  `retypeNote`, `retypeMiddleNote`, `middle`, `middleNote` removed; `pendingNote`,
  `endNote` restated as rulings; `frame.ruled`) (2026-11-16)
- [x] v2 tests — `explainer.unlearn`, `explainer.capacity-timing`, `explainer.drought`;
  `tools/check-rules-data.mjs` loss regex follows the new wording (2026-11-16)
- [x] Digital build — `game/state.js`: Unlearn scope (1A, collapse instead of refuse, no
  end-only check), shared before/after capacity helper on Empower / Unlearn / Reshape (2A),
  optional `type` / `spellType` honoured only for two-wild spells (3A);
  `tests/rules-v3-3.test.mjs`; `RULES_SUMMARY.md` (v3.3, 1A–4A, "ambiguous" aside dropped)
  (2026-11-16)
- [x] Classic references `web-apps/archmage-reference.html`, `web-apps/player-reference/player-reference.html`
  — Unlearn (1A), capacity line (2A, archmage-reference), end of contest (4A); hub
  `index.html` "Current · v3.3" labels (2026-11-16; beyond the brief's list, to keep player
  pages consistent with canon)
- [x] `rulebook/Ascension Trials.md` — 2.9; rulings banner; Echo Power row (6A); 7th Trial
  heading (7A); 7-player reward column dropped, 6p note points at C1 (5A/7A); Enchantment
  bonus 4+ (8A) (2026-11-16)
- [x] `web-apps/v2/trials/rulesets/current-draft.js` (Echo + 4+ Enchantment options on by
  default; caveats), `rulesets/index.js` (5–6p ruling), `trials/tests/rulesets.test.mjs`,
  `trials/tests/power.test.mjs` (2026-11-16)
- [x] F8 checklist boxes 1, 2, 3, 5, 6 in `2026-07-06-f8-ascension-trials-reconcile.md`;
  note on `2026-07-06-f5-game-end-procedure.md` (2026-11-16)
- [x] French six-player pack `_review/FR_6P_SESSION_2026-08/` — reference sheet, observation
  grid, host script, session plan (1A–3A, plus 4A); both PDFs regenerated with headless
  Chrome, page counts unchanged (reference 4, grid 2) (2026-11-16)
- [x] `meta/QUEUE.md`, `meta/threads/rules-and-teaching.md`, `meta/threads/capacity-economy.md`,
  `meta/threads/ascension-trials.md` (note: rulings made while parked), brief status line,
  `.kiro/steering/active-experiments.md` + `product.md` → v3.3 (2026-11-16)
- **(held — F14, unchanged)** Board / printed reference-card / Screentop board-patch text — next
  regeneration.
