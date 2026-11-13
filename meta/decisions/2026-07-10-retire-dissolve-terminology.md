---
title: Retire "dissolve" jargon; capacity-follows-size framing
type: decision
date: 2026-07-10
status: canon
---

# Retire "dissolve" from rules/player-facing text; reframe capacity loss as "capacity follows size"

Prompted by Sam reviewing the online rules (`web-apps/archmage-reference.html`) and
flagging the v3.1 enchantment/capacity wording.

## Change

Two linked wording fixes. **No rule or number changes — clarity only.**

1. **"dissolve" retired from prose.** The v3.1 scoring-economy upgrade introduced
   "dissolve" heavily (barely present in v3.0). It reads as if components vanish.
   Replaced with the actual actions (**Unlearn / Reshape**) or plain language — e.g.
   "the whole spell comes apart and its components return to your hand", "take it
   apart". Applied to the rulebook, glossary, and both web reference tools.
2. **Capacity ladder dropped for one principle.** The `+1/+3/+5`, `-1/-3/-5`,
   `5→4 = -2` "ladder difference" presentation is replaced by: *an Enchantment's
   capacity always equals its current size* (3-card = 1, 4-card = 3, 5-card = 5).
   Make one smaller and its capacity drops to the smaller size's value; take it
   apart and it gives nothing. Same math, no table to memorise. A one-line
   `+1/+3/+5` pointer stays.

Timing unchanged and restated cleanly: **gains** (Learn or Empower an Enchantment)
apply from the start of your next turn; **losses** (Unlearn or Reshape an Enchantment
smaller, or take it apart) apply immediately and must be affordable from
currently-available capacity.

Also corrected in passing: EMPOWER was wrongly described (in a same-session draft) as
unable to touch Enchantments. Canon is that EMPOWER **can grow an Enchantment to the
next size**; it only cannot convert a spell *into or out of* an Enchantment. The
reference tools no longer imply otherwise.

## Why

"dissolve" is undefined (no Glossary entry), implies components disappear, and the
+/- ladder "is just confusing and doesn't make sense" (Sam). The size-based framing
carries identical mechanics with far less to read, and matches how the rest of the
capacity text already works.

## Canon delta (applied to canon.yml this turn)

- `wild_rule`: "dissolved and rebuilt" → "broken down and rebuilt".
- **Deliberately NOT adding "dissolve" to `retired_terms`.** It is a common verb, and
  the retired-terms grep runs over `web-apps`, where it would false-match engine
  identifiers (`fullDissolve`) and an unrelated flavor line ("the Array dissolves into
  the Released Reserve") in the digital build. "dissolve" is deprecated by this
  decision and enforced by review instead of the checker.

## Version

**No bump.** The edits change no rule; the rulebook stays **v3.1** (front-matter and
`canon.yml` remain in lockstep, so the §3a mismatch check passes). The rulebook and
glossary edits ride on the under-test v3.1 wording — if the v3.1 confirm/kill playtest
reverts to v3.0, they revert with it (v3.0 does not use this framing). Logged in the
vnext-scoring-economy experiment RECORD.

## Propagation (this turn)

- [x] `web-apps/archmage-reference.html` — Normal Turn tab rebuilt: stacked
      1 → 2 → Recall → 3, merged the two overview cards, folded Counter Management +
      Enchantments-Special-Rules into one "Counters & capacity" card (size-based, no
      ladder/dissolve), corrected EMPOWER, kept the `+1/+3/+5` pointer.
- [x] `web-apps/player-reference/player-reference.html` — Reshape/Unlearn tiles and
      "Counters & capacity" tile reworded; "1 counter each" header fixed for the
      Reshape exception.
- [x] `rulebook/Archmage Ascension - Complete Rulebook.md` — capacity-loss section,
      Enchantment Effect Timing bullets, worked example, RESHAPE and UNLEARN entries.
- [x] `rulebook/GLOSSARY.md` — Capacity, Reshape, Unlearn entries.
- [x] `meta/canon.yml` — wild_rule wording.

## Downstream (queued, not blocking — do not treat as open propagation)

- `board/spell_ref.png` + `board/turn_ref.png`: printable reference cards likely carry
  old counter/ladder/"dissolve" wording, but are PNGs (not text-editable) and export
  regeneration is on HOLD per `2026-07-06-f14-export-hold.md`. Routed to QUEUE.
- `web-apps/archmage-ascension/` digital build: review player-facing capacity /
  "dissolve" wording in the React UI (engine `fullDissolve` and the "Array dissolves"
  log line left as-is). Routed to QUEUE.
