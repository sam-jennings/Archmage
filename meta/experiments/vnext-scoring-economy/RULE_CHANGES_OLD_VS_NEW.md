---
title: Rule changes still to be decided — old vs new
type: reference
updated: 2026-11-13
status: decided-2026-11-13
---

# Rule changes still to be decided — old vs new

A table-side summary. **Decided 2026-11-13** (Sam): each item now carries a status line — approved / amended / dropped / still open. Governing decision: `meta/decisions/2026-11-13-v3-2-designer-approval.md` (rulebook **v3.2**). OLD/NEW below are as written before that decision.

- **OLD** = rulebook v3.0, read from the byte-exact backup in `_archive/*-v3.0-2026-07-09/`.
- **NEW** = rulebook v3.1 (under test): `rulebook/Archmage Ascension - Complete Rulebook.md`,
  `rulebook/Scoring System Reference.md`, `meta/canon.yml`.
- "Rulebook §X" means a section of the Complete Rulebook; "Scoring" means the Scoring System Reference.

Lives in this experiment folder, so it retires with it (on CONFIRM or KILL).

---

## A. In the rulebook as v3.1, under test (one keep / roll-back verdict)

All six (plus the two extras at A7–A8) are kept or rolled back **together**. Status for all:
**under test**. What decides all of them: **the v3.1 confirm/kill playtest** (decision
`meta/decisions/2026-07-09-v3-1-scoring-economy-bump.md`, status `experiment`). CONFIRM → decision
becomes `canon`. KILL → restore the v3.0 archive, decision becomes `reverted`.

### A1. Score table

**2026-11-13: APPROVED** (as is) — canon in v3.2.


Old: `_archive/Scoring System Reference.md-v3.0-2026-07-09`, "Recognition Points Table".
New: `rulebook/Scoring System Reference.md`, same section. Shown as **old → new**.

| Size | Conjuration | Transfiguration | Perfect Transmutation | Enchantment |
|--:|--:|--:|--:|--:|
| 3 | 3 → **0** | 5 → 3 | 7 → 5 | 6 → 4 |
| 4 | 4 → 1 | 7 → 4 | 10 → 11 | 12 → 10 |
| 5 | 6 → 2 | 10 → 5 | 14 → 18 | 18 → 16 |
| 6 | 9 → 3 | 14 → 7 | 19 → 24 | — |
| 7 | 13 → 7 | 19 → 8 | 25 → 31 | — |
| 8 | 18 → 13 | 25 → 10 | 32 → 39 | — |
| 9 | 24 → 20 | 32 → 13 | 40 → 47 | — |
| 10 | 31 → 29 | 40 → 16 | 49 → 56 | — |
| 11 | 39 → 38 | 49 → 20 | 59 → 65 | — |
| 12 | 48 → 50 | 59 → 25 | 70 → 74 | — |
| 13 | 58 → 63 | 70 → 31 | 82 → 85 | — |
| 14 | 69 → 79 | 82 → 38 | 95 → 97 | — |
| 15 | 81 → **100** | 95 → **48** | 109 → **100** | — |

In plain words:
- **Conjuration** is cheaper when small, richer when big. A 3-card Conjuration now scores **0**
  (the "C3 = 0 floor"); every other spell scores at least 1.
- **Transfiguration** is roughly halved across the board (TF-15: 95 → 48). In v3.0 it out-scored
  Conjuration at every size; in v3.1 it scores less than Conjuration from size 8 up.
- **Perfect Transmutation** goes up at sizes 4–14 but its top drops (PT-15: 109 → 100).
- Top of the table: Conjuration-15 = Perfect Transmutation-15 = **100**.
- **Enchantment** 6 / 12 / 18 → **4 / 10 / 16**.

Why: v3.0 over-paid big Transfigurations, so the best end-game move was to RESHAPE everything into
one huge run ("T15"). Status: under test. Decides: the v3.1 playtest.

### A2. RESHAPE cost

**2026-11-13: APPROVED** (as is) — canon in v3.2.


- **Old** (v3.0 rulebook §Learning Phase › RESHAPE): "Break down any/all spells and rebuild them
  using the same components … Counts as one learning action regardless of how many spells affected."
  Breaking an Enchantment lost its whole grant (−1 / −3 / give back the Unlimited Capacity marker).
- **New** (v3.1 §RESHAPE): "Costs one counter per spell broken down — breaking N spells costs N
  counters." Every component must end in a valid spell. Making an Enchantment smaller drops its
  capacity to the smaller size (see A4), immediately.
- **Why:** tearing down a whole Spellbook for one counter made the end-game rebuild free.
- **Status:** under test. **Decides:** the v3.1 playtest. Caveat from the sim (RECORD log
  2026-07-09): this rule only bites if counters stay scarce.

### A3. Enchantment ladder and Unlimited Capacity

**2026-11-13: APPROVED** (as is) — canon in v3.2.


- **Old** (v3.0 §Enchantment, §Building Your Capacity): 3-card = +1 counter, 4-card = +3 counters,
  5-card = **Unlimited Capacity** ("take the Unlimited Capacity marker; set all counters aside"):
  cast all your spells, unlimited learning actions, skip the Recall. Scores 6 / 12 / 18.
- **New** (v3.1 §Enchantment, §Building Your Capacity): 3-card = **+1**, 4-card = **+3**, 5-card =
  **+5** counters (totals, not added on top of each other); scores **4 / 10 / 16**. Unlimited
  Capacity no longer exists. 5-card still only at 5–6 players (Echo deck).
- Knock-on changes (v3.1 §Casting Phase, §Recall): casting is now "cast up to [capacity] spells
  (one spell per counter)" for everyone; "Every player performs Recall."
- **Why:** Unlimited Capacity was an unbounded state that broke the action economy.
- **Status:** under test. **Decides:** the v3.1 playtest.

### A4. Partial UNLEARN

**2026-11-13: AMENDED, then approved** — returned components can be learned again the same turn (the "until your next turn" clause is removed). Canon in v3.2.


- **Old** (v3.0 §UNLEARN): "Dissolve one spell completely, returning its components to your hand."
  1 counter per spell. An Enchantment lost its whole grant.
- **New** (v3.1 §UNLEARN): "Return one or more components from a single spell to your hand. The
  remainder must still form a valid spell, or the whole spell comes apart." Still 1 counter for that
  one spell. From a run (Transfiguration, Perfect Transmutation) you may only pull an **end** card.
  Returned cards still can't be learned until your next turn. An Enchantment's capacity drops to its
  new size: 5→4 loses 2, 4→3 loses 2, 3→gone loses 1 (rulebook §Building Your Capacity, §Counter
  Tracking).
- **Why:** lets you step a spell down a size without losing all of it.
- **Status:** under test. **Decides:** the v3.1 playtest.

### A5. F3 timing and the "cannot afford → blocked" gate

**2026-11-13: APPROVED** (as is) — canon in v3.2.


- **Old** (v3.0 §LEARN, §RESHAPE, §UNLEARN): gains were **immediate** ("Immediately gain +1 counter
  (add to your pool now)"); losses immediate ("immediately lose 1 counter"). No affordability rule.
- **New** (v3.1 §Enchantment Effect Timing): gains arrive **at the start of your next turn**; losses
  are immediate; and "you may not make an Enchantment smaller or take it apart unless you can both pay
  the action's counter cost (1) AND absorb the immediate capacity loss from the counters you currently
  have available. If you cannot afford the action plus the loss, the action is blocked." Worked
  example in the rulebook: sole 4-card [8,8,8,8], capacity 4 — taking it apart costs 1 + 3 = 4;
  stepping it to a 3-card costs 1 + 2 = 3.
- **Why:** stops same-turn capacity bursts and "free" teardowns. (It also replaces F3's earlier
  "reduce remaining actions / last action legal" idea, which never reached the rulebook.)
- **Status:** under test. **Decides:** the v3.1 playtest.

### A6. EMPOWER conversion restriction

**2026-11-13: DROPPED** — EMPOWER may extend a spell, grow an Enchantment to the next size, or convert one spell type to another. The ban sentence is removed in v3.2.


- **Old** (v3.0 §EMPOWER): "Can make a Conjuration longer, extend a Transfiguration, or convert one
  spell type to another." (Any type to any type, Enchantment included.)
- **New** (v3.1 §EMPOWER): extend a spell, grow an Enchantment to the next size, or convert among
  Conjuration / Transfiguration / Perfect Transmutation. It "may NOT convert a spell into an
  Enchantment, nor an Enchantment into another type"; that needs LEARN or UNLEARN.
- **Why:** keeps every capacity change on LEARN / UNLEARN / RESHAPE, so F3 has no EMPOWER edge case.
- **Status:** under test. **Decides:** the v3.1 playtest.

### A7. (extra) "Cast up to N" and Recall for all

**2026-11-13: APPROVED** — canon in v3.2.


Covered in A3: a direct result of removing Unlimited Capacity. Listed in the spec
(`.kiro/specs/v3-1-scoring-economy/requirements.md`, Requirement 2.4).

### A8. (extra, wording only) "An Enchantment's capacity equals its current size"

**2026-11-13: APPROVED** — canon in v3.2.


Decision `2026-07-10-retire-dissolve-terminology.md` (status `canon`) rewrote the capacity-loss
text as one principle instead of a ±ladder. Same maths, no rule change, no version bump. It rolls
back with v3.1 if v3.1 is killed.

---

## B. Agreed but not in the rulebook yet

These wait for **the rulebook pass after the v3.1 confirm/kill**, so the v3.0 rollback stays clean.

### B7. Flexible wilds + Enchantment size cap

**2026-11-13: APPROVED** — written into the rulebook as v3.2 (decision now canon).


- **Old** (v3.1 rulebook §Enchantment, unchanged from v3.0): "Wild-declaration rule: a wild used in
  an Enchantment must be declared as one of the energy types present in the current deck. A
  matching-value set can never represent a 'fifth energy' that isn't in play — this keeps
  5-component Enchantments out of reach at 2-4 players." Components section: "Wild cards can
  substitute for any energy type and value combination." No declaration rule for other spell types.
- **July version, never written in** (F6, `2026-07-06-f6-wild-scope-and-max-size.md`): every wild
  in every spell type declares energy **and** value, fixed while the spell exists, redeclared only on
  rebuild, deck-present energies only. Now superseded.
- **New** (`2026-11-13-flexible-wilds-enchantment-size-cap.md`): a wild is whatever the spell needs
  and never declares an energy. Only in sequences (Transfiguration, Perfect Transmutation) does it
  declare a **number**, fixed while that spell exists (redeclared only if broken down and rebuilt;
  empowering doesn't redeclare). Enchantments: **max 4 cards at 2–4 players, max 5 at 5–6**, stated
  plainly.
- **Why:** simpler to teach; the 2–4p limit becomes a visible size cap instead of an indirect
  energy rule. Play at 2–4p doesn't change.
- **Status:** agreed, text pending (decision `proposed`; already in `canon.yml` `wild_rule`).
- **Decides:** the rulebook pass after the v3.1 playtest.

### B8. Source emptying mid-turn

**2026-11-13: APPROVED** — master rule + per-effect rulings written into v3.2 (decision now canon).


- **Old** (v3.1 = v3.0 §The Drought): "Trigger: The instant The Source runs dry." Then the Array and
  Reserve are shuffled into the Released Reserve and "Turn order continues as normal." The only
  casting rule that touches it is generic: "If you can't legally resolve a spell's effects, you cannot
  cast it." The rulebook is **silent** on what the active player does for the rest of that turn
  (more casts? Learning?) and on a Perfect Transmutation that empties the Source halfway.
- **New** (`2026-07-06-source-emptying-timing.md`): "complete the current Collection choice or spell
  effect. Then immediately begin the Drought. The active player skips any remaining Casting and
  continues with Learning under Drought rules." Conjuration and Perfect Transmutation are only
  castable if the Source can complete them in full; a Transfiguration may be the action that empties
  the Source (via its Array refill).
- **Why:** closes a timing gap; no spell half-resolves.
- **Status:** agreed in principle, text pending (decision `proposed`; QUEUE P2 `[decide]` still asks
  Sam to approve the wording).
- **Decides:** Sam's approval, then the rulebook pass after the v3.1 playtest.

### B9. Array Attunement

**2026-11-13: STILL OPEN** — a variant to test; not in canon.


- **Old** (v3.1 §Collection Phase): "Draw 1 component from The Source, OR Take 1 component from The
  Array (immediately replace from The Source)." Anyone may take from the Array.
- **New** (`2026-07-17-array-attunement-tf-gate.md`): you may take from the Array in Collection
  **only if you have at least one Transfiguration or Perfect Transmutation in your Spellbook**;
  otherwise draw from the Source. Checked when you take; lose your last TF/PT and you lose it at once.
  Spell effects unchanged.
- **Why:** gives a reason to build a small Transfiguration early ("TF is never built during play").
- **Status:** **not agreed yet as a rule — a variant to test.** Sam is less sure of it than the rest
  of v3.1. Kept OUT of the confirm/kill baseline.
- **Decides:** its own test — second half of the v3.1 session or a follow-on session (confirm if TFs
  get built in play, early turns don't stall, enchantment uptake holds).

### Also listed

- **F5 — game end** (no change; unaffected by the approval) (`2026-07-06-f5-game-end-procedure.md`): **no change.** Rulebook §End of The
  Drought already says "When the Released Reserve is depleted (all cards drawn), the contest
  immediately ends." Kept; seat-order fairness is a playtest watch (worst case 6p + Echo + Trials).
  Finish-the-round wording is parked, not adopted.
- **Size-15 cap** (F6): **STILL OPEN as wording** — no explicit rule added (not approved). **Already in, but only by implication.** The score table stops at 15 and
  ranks run 1–15. There is **no sentence** in the rulebook saying "no spell may exceed 15 cards"
  (see "Gaps" below).

---

## C. Bigger changes on hold

- **Echo 5–6p deck** — **2026-11-13: APPROVED** (decision now `canon`); the open tunables below **STILL OPEN** (QUEUE). (`2026-07-02-echo-option-2-deck.md`, was status `experiment`). Old (v2.8,
  `_archive/rulebook-v2.8-2026-07-06`): 5–7 players used 4 energies × ranks 1–20 + 4 wilds = 84
  cards. New (in the rulebook now): 5–6 players use 5 energies (adds **Echo**) × ranks 1–15 + 4 wilds
  = 79 cards; 2–4p deck unchanged; 5–6p start with 2 counters. Open tunables: wild count 4 vs 6;
  whether Conjuration still works with suits diluted. Decides: a live 5-player session (enchantment
  uptake above 2 of 5, no counter confusion from written rules) — QUEUE P1.
- **Ascension Trials** — **STILL OPEN** (parked). (F8, `2026-07-06-f8-ascension-trials-reconcile.md`, thread `parked`). Old:
  `rulebook/Ascension Trials.md` (v2.8, power ×1 / ×1.5 / ×2 by size, secret allocation; some 5–7p
  text stale). New: a hybrid rebuild with a shortlist (C1 "Coherent Claim" recommended) in
  `ascension-trials/design-history/`. On hold until v3.1 is confirmed or rolled back.
- **Counter redesign** — **STILL OPEN** (QUEUE Deferred, F1). Old/current: counters placed to cast, all picked up at
  Recall, reused for learning. New candidate: round-trip counters (placing one casts a spell,
  picking one up pays for a learning action); alternatives are a Capacity Gauge or a text-only
  rewrite. Fixed as current counters for v3.1; reopens only if the reference-card redesign still
  fails.

---

## Gaps and contradictions found

1. **(Still open — no size-15 rule was approved.)** **Size-15 cap not written down.** F6 says "no spell may exceed 15 components"; the spec says
   only "SHALL NOT award points beyond the size-15 value" (a scoring cap, not a build ban). The
   rulebook says neither. With wilds a 16- or 17-card Conjuration is possible on paper (15 ranks of
   one energy + wilds). QUEUE marks the cap "DONE" because the table stops at 15.
2. **(Still open.)** **F3 gate vs multi-spell RESHAPE.** The gate names "the action's counter cost (1)", but RESHAPE now
   costs N. Not ruled (also open question 3 below).
3. **(Fixed 2026-11-13: D4 now cites the size cap.)** **Dry-run drill D4** (`dry-run-and-session-template.md`) gives the reason for "no 5-card
   Enchantment at 2–4p" as the F6 wild-energy rule; the 2026-11-13 decision replaces that with a size
   cap. Same outcome at the table, different reason.
4. **(Fixed 2026-11-13 in v3.2.)** **Scoring Reference** still explains the 2–4p Enchantment cap via deck energies — the explanation
   the 2026-11-13 decision drops. Expected until the rulebook pass.
5. **(Fixed 2026-11-13: now "taken apart".)** **"Dissolved" still in the rulebook Quick Reference** ("Fully dissolved …", "3→dissolved") although
   decision `2026-07-10-retire-dissolve-terminology.md` retired that wording. Cosmetic.
6. **(Echo note fixed 2026-11-13; the F8 "UC is 5–6p-only" item is still stale, F8 is parked.)** **Echo decision file** still quotes the ladder as 6 / 12 / 18 with Unlimited Capacity, with no note
   that v3.1 replaced it. **F8 checklist** still asks for an "Unlimited Capacity is 5–6p-only" note —
   stale now that UC is gone.
7. **Not found:** no other v3.1 rule change beyond A1–A8 in the decision, RECORD or spec.

---

## Open v3.1 test questions

**2026-11-13: STILL OPEN** — not answered by the approval; they now shape the first v3.2 playtest.

From `dry-run-and-session-template.md` (listed, not answered):

1. **No measurable thresholds** — what counts as a pass at 2–4p, and who decides "worse than v3.0"?
2. **Player count** — the thread says 5 players where possible; the table setup says 2–4p, where the
   5-card Enchantment (+5) can't come up.
3. **F3 gate vs multi-spell RESHAPE** — is the gate N + loss when a RESHAPE breaks N spells
   including an Enchantment?
4. **One session or more?** Is one session enough to CONFIRM, or only to KILL?
