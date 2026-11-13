---
title: Rulebook v3.2 — v3.1 bundle approved by designer decision (A4 amended, A6 dropped) + flexible wilds + Source-emptying timing
type: decision
date: 2026-11-13
status: canon
thread: capacity-economy
supersedes-status-of: 2026-07-09-v3-1-scoring-economy-bump.md (experiment → canon)
---

# 2026-11-13 — Rulebook v3.2: designer approval of the v3.1 bundle

Source: Sam, 2026-11-13, answering `meta/experiments/vnext-scoring-economy/RULE_CHANGES_OLD_VS_NEW.md`
(labels A1–A8, B7–B9, Echo). His words: "Approve A1, A2, A3, A5, A7, A8, B7, B8. Update A4 so
returned cards can be learned on the same turn. A6 is unnecessary, there is no way to convert an
enchantment to or from anything else. Approve of echo addition."

## Change

**The v3.1 scoring/economy bundle is approved by designer decision, not by a playtest.** The live
confirm/kill that `2026-07-09-v3-1-scoring-economy-bump.md` waited for is no longer required. The
rulebook becomes **v3.2** (minor bump: v3.1 content made canon plus three rule edits).

| Item | Outcome |
|---|---|
| A1 score table (C3 = 0, Conj15 = PT15 = 100, TF15 = 48, Ench 4/10/16) | approved as is |
| A2 RESHAPE = one counter per spell broken down | approved as is |
| A3 ladder +1/+3/+5, Unlimited Capacity removed | approved as is |
| A4 partial UNLEARN | approved **amended**: returned components may be learned again **the same turn** (the "not until your next turn" clause is removed) |
| A5 F3 timing + "cannot afford → blocked" gate | approved as is |
| A6 EMPOWER may not convert into/out of an Enchantment | **dropped**: EMPOWER may extend a spell, grow an Enchantment to the next size, or convert one spell type to another |
| A7 "cast up to N", Recall for all | approved as is |
| A8 "an Enchantment's capacity equals its current size" wording | approved as is |
| B7 flexible wilds + Enchantment size cap (`2026-11-13-flexible-wilds-enchantment-size-cap.md`) | approved, written into the rulebook |
| B8 Source-emptying timing (`2026-07-06-source-emptying-timing.md`) | approved, written into the rulebook (master rule + per-effect rulings) |
| Echo 5–6p deck (`2026-07-02-echo-option-2-deck.md`) | approved as canon; tunables stay open |

**Not decided (unchanged):** B9 Array Attunement (still a variant to test); the four v3.1 test
questions in the playtest kit; Echo tunables (5–6p wild count 4 vs 6; Conjuration viability under
suit dilution); Ascension Trials (F8); counter redesign (F1). **No explicit size-15 rule** was
added (not approved; the score table still stops at 15).

## Why

Sam judged the bundle ready without waiting for a live session; the confirm/kill had been stalled
on venue logistics since July. The first v3.2 playtest now checks how the approved rules feel
instead of deciding a rollback.

## Canon delta (applied to `meta/canon.yml` this turn)

- `rulebook_version: v3.1 → v3.2`; both `versioned_files` carry `version: v3.2`, `status: canon`.
- Header comment rewritten: no experiment under test; v3.1 archive pointer added.
- `energy_fifth`, `deck_5_6p`: Echo deck canon (wild count 4 vs 6 still a tunable).
- `enchantment_ladder` annotation: size cap stated in the rulebook from v3.2 ("5-6p/Echo only").
- `wild_rule`: "rulebook text pending" → "in the rulebook from v3.2".
- New facts: `source_emptying`, `returned_components` (A4 amended), `empower_scope` (A6 dropped).
- `solo_direction`: tuning now waits for the first v3.2 playtest.
- `retired_terms` unchanged.

## Propagation

- [x] Archive v3.1 byte-exact before editing: `_archive/*-v3.1-2026-11-13/` (rulebook, scoring
  reference, glossary, both classic html references, v2 rules data / current.js / strings /
  hand checker / ui.js / sw.js / explainer kit, wild-declaration, drought + strings, six v2
  index pages, hub `index.html`, playtest kit) + index block in `_archive/README.md` (2026-11-13)
- [x] `meta/canon.yml` — canon delta above (2026-11-13)
- [x] `rulebook/Archmage Ascension - Complete Rulebook.md` — v3.2, status canon; Components wild
  rule; Transfiguration / PT wild-number lines; Enchantment "max 4 at 2-4 players, max 5 at 5-6
  players" + wild needs no energy; Enchantment-only wild-declaration rule removed; LEARN declares
  wild numbers; EMPOWER A6 sentence removed + "convert one spell type to another"; RESHAPE
  redeclares; UNLEARN same-turn re-learn; casting restriction + Conj / TF / PT Source rulings;
  Drought mid-turn master rule; glossary Enchantment cap + Wild entry; Quick Reference
  "dissolved" wording → "taken apart" (2026-11-13)
- [x] `rulebook/Scoring System Reference.md` — v3.2, status canon; Enchantment cap stated plainly
  (no deck-energy explanation); balance note (2026-11-13)
- [x] `rulebook/GLOSSARY.md` — status canon; Echo, Empower, Enchantment, Unlearn entries; new Wild
  entry (2026-11-13)
- [x] `web-apps/archmage-reference.html` — wild legend / reminders / spell concept, Enchantment
  cap, UNLEARN same turn, casting + Drought Source rulings, hand-checker comment (2026-11-13)
- [x] `web-apps/player-reference/player-reference.html` — wild reminder + blurb, Enchantment cap,
  TF/PT wild note, EMPOWER (A6 dropped), UNLEARN same turn, Drought mid-turn line (2026-11-13)
- [x] `web-apps/v2/` — `data/rules.v3.1.js` renamed `rules.v3.2.js` (status canon, flexible wild
  rule, size cap, Source rulings, A4/A6 text, Echo no longer under test, under-test callouts
  removed); `current.js` import + size-cap-only `enchantmentMax` + `droughtMidTurn`; `sw.js` list
  + VERSION; six page preloads; shared hand checker (wilds declare a number in runs only);
  chip display; wild-declaration and drought explainers + strings; unlearn/reshape strings;
  explainer brief (2026-11-13)
- [x] Tests — v2 equivalence Layer C (wild in an Enchantment needs no energy; 5-card Enchantment
  refused at 2–4p / allowed at 5–6p; run wilds carry a fixed number), wild-declaration and drought
  explainer tests; classic checker `tests/hand-checker/flexible-wilds.test.mjs` (2026-11-13)
- [x] `index.html` hub — "Under test · v3.1" / "Current · v3.1" tags → "Current · v3.2"; rulebook
  links; Screentop card notes the stale board reminder (2026-11-13)
- [x] Playtest kit `meta/experiments/vnext-scoring-economy/dry-run-and-session-template.md` —
  reframed as the first v3.2 playtest; D4 reason (size cap), D6 (same-turn re-learn), D8 (EMPOWER
  converts), new D9 (wild number fixed), D10 (Source runs dry) (2026-11-13)
- [x] Coupled decisions: `2026-07-09-v3-1-scoring-economy-bump.md` → canon + banner;
  `2026-11-13-flexible-wilds-enchantment-size-cap.md`, `2026-07-06-source-emptying-timing.md`,
  `2026-07-02-echo-option-2-deck.md` → canon; `2026-07-08-vnext-scoring-economy-experiment.md`
  concluded; experiment RECORD note (2026-11-13)
- [x] `.kiro/steering/active-experiments.md`, `.kiro/steering/product.md` → v3.2 (2026-11-13)
- [x] `meta/QUEUE.md`, `meta/threads/capacity-economy.md`, summary doc status lines (2026-11-13)
- **(not propagated — queued)** Digital build `web-apps/archmage-ascension/` (`game/state.js`
  still blocks Enchantment conversion on EMPOWER and locks returned cards until next turn;
  `RULES_SUMMARY.md` says v3.1 under test). It is a 2-player preview whose hub card already says
  its rules may lag; queued P2 rather than edited here, because removing the A6 guard there also
  needs capacity accounting for conversions.
- **(held — F14)** Board / reference-card / Screentop board-patch text (`card-design/export-screentop/
  pipeline/patch-board.mjs` still prints "Wilds: declare energy + value") — next regeneration.
