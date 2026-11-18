---
thread: capacity-economy
status: active
updated: 2026-11-18
goal: Make enchantment pursuit viable without collapsing Drought tension
next: **Run the first v3.2 playtest — check how the approved rules feel (VENUE OPEN).** Sam approved the v3.1 bundle by designer decision on 2026-11-13; canon is rulebook **v3.2** (now **v3.3**, clarifications only, 2026-11-16) (`meta/decisions/2026-11-13-v3-2-designer-approval.md`; A4 amended so returned cards can be learned the same turn, A6 dropped, flexible wilds + 2–4p Enchantment cap and Source-emptying timing written in). No confirm/kill or rollback any more. Venue options unchanged: the live Screentop table `@samjennings/Arcane-Drought` (still shows the v3.1 board panel — a v3.3-correct board image `card-design/export-screentop/board/board-a3-150dpi-v33.png` exists locally since 2026-11-18; Sam re-uploads it before the session), in person, or resume Tabletopia (ON HOLD, scene assembly in QUEUE Deferred). Kit: `meta/experiments/vnext-scoring-economy/dry-run-and-session-template.md` (drills D4/D6/D8 updated, D9–D10 added). Play the baseline CLEAN; Array Attunement (`meta/decisions/2026-07-17-array-attunement-tf-gate.md`, proposed) stays a variant for a second half or follow-on session. Still open: Echo tunables (5–6p wild count 4 vs 6; Conjuration under suit dilution), and the four test questions in the kit.
hypothesis: If the round-trip counter redesign (placing a counter casts a spell; picking one up pays for a learning action — Recall becomes the payment, not a step) is pre-validated in the solo rig alongside partial unlearn, then a single combined fix can be chosen on paper and the next live session spent confirming experience rather than exploring options.
---

# Capacity economy

## v3.3 clarifications - 2026-11-16

Rules-gaps rulings 1A–4A (`meta/decisions/2026-11-16-rules-gaps-rulings-1-8.md`) made the
rulebook **v3.3** without touching scores, ladder, costs or decks. The one that matters here
is **2A**: after any learning action, compare Enchantment capacity before and after; more
arrives next turn, less is lost now behind the gate, and capacity not yet arrived is never
charged (Empower 3→4 then Unlearn back to 3 in one turn costs only the two actions). The
digital build now does this for Empower, Unlearn and Reshape with one shared helper. The first
v3.2 playtest keeps its name and plays v3.3; nothing it measures changed.

## v3.2 canon by designer approval — 2026-11-13

Sam answered `meta/experiments/vnext-scoring-economy/RULE_CHANGES_OLD_VS_NEW.md`: approved A1, A2,
A3, A5, A7, A8, B7, B8 and the Echo deck; **A4 amended** (returned components may be learned again
the same turn); **A6 dropped** (EMPOWER may convert one spell type to another). Written into canon as
rulebook **v3.2** (decision `meta/decisions/2026-11-13-v3-2-designer-approval.md`, status canon);
`2026-07-09-v3-1-scoring-economy-bump.md`, the flexible-wilds, Source-emptying and Echo decisions
are now canon; the vnext experiment is concluded (folder kept for the kit and summary). v3.1 copies
are in `_archive/*-v3.1-2026-11-13/`. Not decided: B9 Array Attunement, the four test questions,
Echo tunables, Ascension Trials, counter redesign, and any explicit size-15 rule. Digital build
brought to v3.2 on 2026-11-13 (`npm test` in `web-apps/archmage-ascension/`).

## Playtest prep kit — 2026-11-12

Solo dry-run script (8 drills, one per v3.1 rule change, plus a full 2-seat game) and the
session-log template with the confirm/kill criteria copied from RECORD:
`meta/experiments/vnext-scoring-economy/dry-run-and-session-template.md`. Steps still to do:
Tabletopia scene assembly + save (whether it was done is unknown), solo dry-run, recruit. Four
open questions for Sam are listed at the end of that file (no measurable thresholds; 5p vs the
2–4p Tabletopia table; F3 gate cost for a multi-spell RESHAPE; one session enough?).
No rules or experiment status changed.

## Board image brought to v3.3 — 2026-11-18

Every line `card-design/export-screentop/pipeline/patch-board.mjs` draws was checked
against rulebook v3.3 + Scoring System Reference. Score table, Enchantment capacity/cap
notes, deck/deal/counter set-up lines and tiebreaker were already correct. Fixed: the wild
reminder ("declare energy + value" → wilds never declare an energy; in a sequence a wild
declares only its number, fixed until broken down), the panel tag ("v3.1 — under test" →
"rulebook v3.3"), the missing binding step (1 card from hand to the Arcane Reserve before
the first turn), and the PDF's "The Contest Ends" box ("contest ends immediately" → the
player who draws the last Released Reserve card finishes that turn, ruling 4A). New image:
`card-design/export-screentop/board/board-a3-150dpi-v33.png` (local only — that folder is
gitignored); the v31 file is kept. **The live Screentop table still shows the v3.1 board
until Sam re-uploads the v33 image**; nothing was uploaded. The board's Normal/Drought turn
panels come from the PDF and were not part of this pass (board PDF regeneration stays P2).

## Online playtest route ready — 2026-07-19

The v3.1 confirm/kill no longer depends on getting people around a physical table.
`card-design/export-screentop/` holds a complete Screentop.gg pack: 62 card faces
rendered fresh from the canonical arcana+beacon renderer (2–4p deck per canon),
card back, counter token, spritesheets, and the A3 board raster with its stale
Recognition Points / Set-up panels replaced by v3.1-correct ones (the board PDF
itself is still pre-v3.1 — queued P2). `SCREENTOP_BUILD_GUIDE.md` covers table
assembly, v3.1 setup, the confirm/kill criteria, and stranger-recruitment venues.
Decision: `meta/decisions/2026-07-19-screentop-online-playtest.md` (F14 print hold
untouched — this is a screen-only export target).

## v3.1 applied (under-test) — 2026-07-09

The vnext-scoring-economy bundle **shipped as rulebook v3.1** and is held **under-test**.
It was executed end-to-end via the Kiro spec `.kiro/specs/v3-1-scoring-economy/`; governing
decision `meta/decisions/2026-07-09-v3-1-scoring-economy-bump.md` (status `experiment`).
**Canon is now v3.1 (under-test), no longer v3.0.** What landed: the rebalanced score table
(Conj15 = PT15 = 100, TF15 = 48, C3 = 0 floor, Enchantment 4/10/16), Unlimited Capacity
removed with a finite +1/+3/+5 ladder, RESHAPE = one counter per spell broken, partial
UNLEARN with proportional capacity loss, the F3 "cannot afford action + loss → blocked" gate,
and the EMPOWER conversion restriction.

The next step is the **live confirm/kill playtest** (criteria in "## Next playtest goal

**First v3.2 playtest — check how the approved rules feel.** No verdict flips canon; findings feed
normal rule changes (decision + version bump). Watch points, kept from the old confirm criteria:
- **Transfiguration is still worth playing** live (not merely an end-game Reshape target).
- **The end-game concentration ("T15") play is controlled** — no new dominant exploit replaces it.
  The rig says RESHAPE-per-spell is a weak bound at 2p (≈+27, `simulation/SCORING_EV_vnext.md`).
- **Low-end scores read sensibly as integers** (C3 = 0 floor, every other spell ≥ 1).
- **Enchantment pursuit feels good without Unlimited Capacity** — uptake above 2 of 5 (the
  Session 3 low-water mark) and the Drought stays tense.
- New in v3.2: does anyone trip over **wild numbers in runs**, **same-turn re-learning after
  UNLEARN**, **EMPOWER conversions**, or the **Source running dry mid-turn**?

Run at **5 players** where possible for the Echo tunables (wild count 4 vs 6; Conjuration under
suit dilution), contention/blocking at higher counts, and counter comprehension from written rules.

## Biggest risk

The capacity constraint may be load-bearing for the rest of the loop — fixing it could
destabilise conjurations/transfigurations or over-loosen the Drought. A deeper
structural rethink than the tested levers may be needed.

## Context needed to resume

- Rig: `simulation/` (assumptions + results documented alongside); the 2-player
  digital build's code is reusable for self-play.
- Analysis history: `_review/FIFTH_SUIT_ANALYSIS.md`, archived
  `_archive/TWO_VERSION_PROPOSAL.md`, `_review/OPUS_TASK_enchantment_system.md`.
- Sessions are ~2–3 weeks apart: model first, spend live sessions on experience only.
