---
title: Proposed RESHAPE rule (vnext) — CANDIDATE, not canon
type: proposal
experiment: vnext-scoring-economy
updated: 2026-07-09
---

# Proposed RESHAPE redefinition (candidate)

**Not canon.** Canon RESHAPE (v3.0) is unchanged in the rulebook.

## Current canon (v3.0)
> Reorganize components across multiple spells in your Spellbook.
> - Break down any/all spells and rebuild them using the same components.
> - All components must remain in valid spell arrangements.
> - Counts as one learning action regardless of how many spells affected.

## Proposed (Sam — confirmed 2026-07-09)
> A Reshape costs **one counter per spell broken down**.
> - Break down one or more spells and redistribute their components into valid spells (existing or new).
> - Each spell broken costs one counter — so a 3-spell reshuffle costs 3 counters.
> - All components must remain in valid spell arrangements.
>
> That's the whole rule: canon's "any/all spells for one action" becomes "pay one counter per
> spell you break." (Enchantment break-apart counter-loss warnings unchanged.)

## Why
Canon's "break any/all for a single action" is the vehicle for the end-game concentration
exploit: one 1-counter action reassembles the whole Spellbook into a single big spell on the
final Drought turn. Charging per broken spell makes a full-book consolidation cost as many
counters as you have spells.

## Rig finding (2026-07-09) — this bound is WEAK under the +1/+3/+5 ladder
Tested faithfully as `reshape_cost` in `scoring_ev.py` (break ≤ `counters` spells; artifacts
`simulation/SCORING_EV_vnext.md`, seed 42). Under the vnext enchantment ladder, counters accrue
faster than spells (2p ≈ 7 counters vs ≈ 6 spells; a whole-book break is affordable in 63–81% of
games), so the per-spell cost barely undercuts a *free* Reshape (2p +26.7 vs +27.7 over the
as-played book). If the end-game consolidation needs a firmer bound, the lever is a leaner counter
economy or an actual cap — the per-spell price alone does little here.

> Do not confuse this with the "~+5" figure elsewhere in the notes/QUEUE: that came from a size-8
> absolute result-cap PROXY (`_review/RESHAPE_BOUNDING_OPTIONS`), a different and much stronger
> constraint than this rule.

## History
An uncommitted earlier draft of this file framed the rule as "break apart ONE spell per action"
and added a clause that a single Reshape "cannot assemble a spell bigger than its source" (grow
via EMPOWER one card at a time). That EMPOWER throttle was an over-specification not in Sam's
intent and has been removed — the rule is simply the per-spell counter cost above.
