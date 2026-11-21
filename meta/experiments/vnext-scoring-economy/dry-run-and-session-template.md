---
title: First v3.2 playtest — solo dry-run script + session-log template
type: playtest-plan
updated: 2026-11-13
experiment: meta/experiments/vnext-scoring-economy/RECORD.md
decision: meta/decisions/2026-11-13-v3-2-designer-approval.md
---

# First v3.2 playtest — solo dry-run + session template

> **2026-11-13:** v3.1 was approved by Sam as designer (no live confirm/kill) and the rules are now
> **v3.2, canon** (decision `meta/decisions/2026-11-13-v3-2-designer-approval.md`). This kit is now
> for the **first v3.2 playtest: check how the approved rules feel**. There is no CONFIRM/KILL
> verdict and no rollback; findings feed normal rule changes. Drills D4, D6, D8 were updated for
> v3.2 and D9–D10 added (flexible wilds, Source emptying).

Prep for the first live v3.2 session. **Changes no rules.** Rules
quoted are from `rulebook/Archmage Ascension - Complete Rulebook.md` and
`rulebook/Scoring System Reference.md` (v3.2).

## Order of work

1. **Scene assembly + save** (Tabletopia, ~10 min, manual) — follow Step 4 + Verification in
   `card-design/export-tabletopia/TABLETOPIA_BUILD_GUIDE.md`. That is already the checklist; tick
   the open box in `meta/decisions/2026-07-20-tabletopia-switch.md` once saved and verified.
2. **Solo dry-run** (this file, Part A, ~60–90 min) — two seats, hot-seat, 2–4p deck.
3. **Recruit** 1–3 others — `_review/STRANGER_RECRUITMENT_AND_LOGISTICS_2026-07.md` (channels, ask
   wording); measures in `_review/STRANGER_EVIDENCE_PLAN_2026-07.md`. Testers need a free
   Tabletopia account. Fallback table: Screentop `@samjennings/Arcane-Drought`.
4. **Live session** — play v3.2 **clean** (no Array Attunement, no Trials). Log with Part B.

---

## Part A — solo dry-run script

Goal: prove the table works and that each changed rule can be executed and *seen* on Tabletopia,
before strangers are watching. Use the Tabletopia table (not the digital build) so table friction
shows up too. Setup per rulebook: 7 cards each, bind 1 to Reserve, Array 5, **1 counter each**.

### A1 — Table mechanics (one normal round)
Shuffle, deal, bind, draw from Source, take from Array + refill, place/recall counters, move a
card to the Reserve. **Record:** anything awkward (stacking, hidden hands, counter supply).

### A2 — Drills (arrange cards by hand from the deck; each is a single situation)

| # | Rule (changed in v3.1 or v3.2) | Set up | Do | Expected (v3.2) |
|---|---|---|---|---|
| D1 | Score table | Book: Conj R2-R5-R9 (3), TF 5-6-7 (3), PT V4-V5-V6-V7 (4), Ench 8×3 | Score it | 0 + 3 + 11 + 4 = **18**. Note how C3 = 0 reads. |
| D2 | Enchantment ladder, gains next turn | 1 counter; learn Ench 7×3 | Count counters this turn and next | This turn: still 1. Next turn: 2. |
| D3 | Ladder +3 at 4-card | Ench 7×3 in book, a 4th 7 in hand | EMPOWER it to 7×4 | Next turn capacity 1 + 3 = **4** (not 5). |
| D4 | No 5-card Ench at 2–4p | Ench 7×4 + a wild | Try to EMPOWER with the wild | Refused — Enchantments are max 4 components at 2–4 players (size cap, v3.2). The wild itself would need no energy. |
| D5 | RESHAPE = 1 counter per spell broken | 2 counters; two spells to merge | RESHAPE breaking both | Costs **2**. With only 1 counter: refused. |
| D6 | Partial UNLEARN | TF 5-6-7-8 | UNLEARN the 8; then try the 6 | End card: legal, 1 counter, spell stays TF 5-6-7. Middle card: refused. The returned 8 **can** be learned again this same turn (v3.2). |
| D7 | Proportional loss + F3 gate | Only Ench 8×4, capacity 4, nothing spent | (a) UNLEARN one 8; (b) reset, spend 1 action, then try taking 8×4 apart | (a) 1 action + 2 loss = 3 → legal; Ench 8×3 remains, capacity now 2, 1 counter still usable this turn. (b) needs 1 + 3 = 4, only 3 left → **blocked**. |
| D8 | EMPOWER may convert one spell type to another | Conj R5-R6-R8 in book; R7 in hand | EMPOWER with the R7 | Legal, 1 counter: the spell is now a Perfect Transmutation R5–R8 (scores 11, was Conj-4 = 1). |
| D9 | Wild number fixed in a run | TF V5-R6 + wild declared as 7 | EMPOWER with a real 7 | Refused — the wild is the 7 and can't move to 4 or 8 (it changes only on a rebuild). EMPOWER with an 8 instead: legal. |
| D10 | Source runs dry mid-turn | Source at 1 card; Conj R2-R5-R9 and a TF in book, 2 counters | Draw the last card in Collection | Drought begins at once: no casting this turn, go to Learning. Reset with the Source at 2: draw 1, cast the Conj — its draw takes the last card, so the Drought begins and the TF can't be cast. |

**Record per drill:** pass / fail / unclear, and the rulebook line you had to look up (if any).

### A3 — One full 2-seat game to final scoring
Play both seats honestly to the end of the Drought. **Record:**
- Final Spellbook per seat (each spell: type + size) and score; counters held at game end.
- Turn each seat first built a Transfiguration *during play* (not by end-game RESHAPE), or "never".
- Enchantments learned per seat (size, turn).
- Every end-game RESHAPE: spells broken, counters paid, points before → after.
- Any line of play that felt dominant or "free".
- Game length (minutes, rounds) and every rule lookup.

Dry-run is a **table check**, not evidence.

---

## Part B — session-log template

Copy to `playtests/YYYY-MM-DD-session-05.md` (next number after Session 4) **only when logging a
real session**. Criteria below are copied from RECORD.md and `meta/threads/capacity-economy.md`
("Next playtest goal") — not new.

```markdown
---
title: Session 05 — YYYY-MM-DD (first v3.2 playtest)
type: playtest-session
date: YYYY-MM-DD
players: N
version: rulebook v3.2, 2–4p deck, no Echo, no Array Attunement, no Trials; venue
goal: first v3.2 playtest — how do the approved rules feel? Is Transfiguration worth playing, is the end-game concentration play controlled, do low-end integer scores read sensibly, and does enchantment pursuit feel good without Unlimited Capacity?
verdict: one line — how the rules felt, and what (if anything) should change
---

# Session 05 — YYYY-MM-DD

## Goal
First v3.2 playtest (decision `meta/decisions/2026-11-13-v3-2-designer-approval.md`).

## Players
(name / new or returning / taught from written rules only? y/n)

## Criteria — mark each Met / Not met / Unclear, with the evidence

| Criterion (from RECORD) | Evidence to note | Result |
|---|---|---|
| Transfiguration still worth playing | TFs built *during play* (who, turn, size) vs only as end-game RESHAPE targets | |
| End-game concentration ("T15") play controlled; no new dominant exploit | Each end-game RESHAPE: spells broken, counters paid, points gained; any strategy that won "for free" | |
| Low end reads sensibly as integers (C3 = 0, every other spell ≥ 1) | Player reactions to 0/1/2-point spells | |
| Enchantment pursuit / UC-removal feels good; Drought stays tense | Enchantments learned per player (size, turn) — uptake vs the Session 3 low-water mark of 2 of 5; tension in the Drought | |

**Warning signs (any one → open a rule-change discussion):** a new dominant exploit ·
Transfiguration dead · enchantments still non-viable · Sam prefers a different shape.

## Per-player end state
| Player | Spellbook (type:size …) | Score | Counters at end | Enchantments |
|---|---|---|---|---|

## What worked
## What failed
## What confused players
(Rule lookups and questions, verbatim where possible. Note any trouble with the F3 gate, partial
UNLEARN, RESHAPE counter cost, wild numbers in runs, or the Source running dry mid-turn.)

## Table / Tabletopia friction

## Actions
ACTION: ... (copy each to meta/QUEUE.md same turn and mark ACTION(queued))

## Outcome
Rules felt right → note it; nothing to flip (v3.2 is already canon).
Something should change → record a decision (process.md §3) and bump the rulebook version.
```

## Open questions for Sam (still open after the 2026-11-13 approval)

Questions 1 and 4 were about the confirm/kill verdict, which the designer approval replaced; they
now only shape how much weight one session's feel carries. 2 and 3 still stand.

1. **No measurable thresholds.** The criteria are qualitative. The only number given is
   enchantment uptake "above 2 of 5", which comes from a 5-player session. What counts as a pass
   at 2–4p, and who decides "worse than v3.0"? (The only v3.0 baseline is Session 4, at 2p.)
2. **Player count.** The thread says "run at 5 players where possible". The Tabletopia table and
   QUEUE say 2–4p, no Echo. At 2–4p the 5-card Enchantment (+5) can't come up at all.
3. **F3 gate vs multi-spell RESHAPE.** The gate says "the action's counter cost (1)", but RESHAPE
   now costs N. When a RESHAPE breaks N spells including an Enchantment, is the gate N + loss?
   Watch for this live; don't rule on it at the table without noting it.
4. **One session or more?** RECORD says "a live session". Is one session enough to CONFIRM, or
   only to KILL?
