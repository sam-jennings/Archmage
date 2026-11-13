---
thread: rules-and-teaching
status: active
updated: 2026-08-16
goal: Players can learn, play, and track the game from written materials alone — no verbal patching
next: **Run the six-player French-language teaching test** — prep pack complete in `_review/FR_6P_SESSION_2026-08/` (plan + FR reference + host script/glossary + FR feedback sheet + tier-tally grid). Four new non-English-speaking players learn from materials alone; the bilingual host answers only at graded tiers and every intervention is tallied. This tests the thread goal directly rather than by proxy. The printed-reference-card redesign stays the standing P1 and should be informed by the tier-1/tier-2 tallies this session produces — do the redesign after, with located evidence.
hypothesis: Counter confusion is a printed-card/board legibility problem, not a mechanic or rule-text problem — a new player (Denise, Session 4) understood the dual-purpose counters from the ONLINE reference with zero explanation and no misplay, whereas Sessions 1 & 3 failed "from card or board." If the redesigned physical card also teaches the loop cleanly, F1 leans text/presentation (Option C) rather than a mechanic redesign.
---

# Rules and teaching

## Where this stands

Every session so far needed verbal patching. Confirmed comprehension failures:

- Counter refresh rule — not understandable from card or board even after verbal
  explanation (Sessions 1 and 3). **Reframed by Session 4 (2026-07-06):** new player
  Denise read the dual-purpose counter loop from the **online reference** with zero
  explanation and no misplay, and even questioned whether physical counters are needed.
  The prior failures were "from card or board" — so the likely culprit is **printed
  reference-card / board legibility**, not the rule text or the mechanic. Redesign the
  physical card first, then retest counters from it. (Single data point — don't
  over-generalise, but it's a strong reframe and shifts F1 toward presentation/Option C.)
- **5-card Enchantment scope (Session 4):** the reference/rulebook implies a 5-card
  Enchantment exists at all player counts; Denise asked how to complete one with a wild
  in a 2–4p game. Make the 5-card / Unlimited Capacity tier explicitly 5–6p (Echo) only
  and remove stale 2–4p 5-card examples (F6).
- Enchantment timing ambiguity — effects must be clarified to begin on the player's
  NEXT turn; current text allows counter-system abuse.
- Printed reference cards — too hard to read during play; blocks every session.
  Redesign for legibility (print specs: 62×88mm, see printenbind constraints in
  card-visuals thread).
- Web score table doesn't cover Perfect Transmutation size 15+ (hit in Session 1).
- Deliberate players lose their place mid-turn — turn-stage tracker or stage summary
  under consideration (P2; relates to `_review/OPUS_TASK_counter_and_tracker.md`).

**2026-07-10 — online-reference clarity pass (done).** Reviewing
`archmage-reference.html`, Sam caught a batch of issues; all fixed across both web
references plus the rulebook/glossary. Set-up starting counters now show 1 (2–4p) /
2 (5–6p); **Echo added** to the energies legend (marked 5–6p only), so the 5-card
Enchantment scope now reads correctly (closes the Session-4 / F6 reference gap). The
Normal Turn page was **restructured** — phases stacked 1 → 2 → Recall → 3 with no
unnumbered cards wedged between them. The "Break" / "F3" jargon and the confusing
capacity **ladder** (+1/+3/+5, −1/−3/−5, 5→4=−2) were removed in favour of one
principle: *an Enchantment's capacity equals its current size*. **"dissolve" retired**
from prose repo-wide (decision `2026-07-10-retire-dissolve-terminology.md`), and a
wrong "Enchantments can't be Empowered" line was corrected (Empower **can** grow one).
The **printed cards** (`board/*.png`) still need the same treatment — the remaining P1.

## 2026-08-16 — six-player French session prepped (not yet played)

Sam has a board-game afternoon with six people, four of whom speak French only and none of
whom have played. Rather than treat the language gap as an obstacle, the session is set up
as the strictest available test of this thread's goal: **with no shared language, Sam
cannot verbally patch**, so "learn from written materials alone" becomes a hard constraint
instead of a discipline. Session 4's Denise datum (online reference taught the counter loop
with zero explanation) gets an n=4 replication under harder conditions.

Measurement instrument: the bilingual host answers questions only at a graded tier —
1 = point at the line (findability defect), 2 = read the line aloud (wording defect),
3 = explain in own words (**materials failed**). Sam tallies topic × tier while playing.
Three scripted probes: turn shape; **2 counters / cast 2 spells → how many learning
actions** (F1, answer 2); and enchantment-timing (F3).

Config is 6p Echo deck, v3.1 baseline — explicitly *not* the v3.1 confirm/kill, which
stays clean on Tabletopia at 2–4p. Side benefits: first live 5-card Enchantment, first
6-player downtime observation, first new-player observation of the Drought transition.

Materials in `_review/FR_6P_SESSION_2026-08/`. Translation convention worth keeping: every
word **printed on a component** stays English (The Source, The Array, Arcane Reserve,
energy names) with a French gloss on first use — otherwise players hunt the table for a
French word that isn't there.

## Context needed to resume

- Rules source of truth: `rulebook/Archmage Ascension - Complete Rulebook.md` (v3.1, under-test).
- Web reference: `web-apps/archmage-reference.html`; printable refs: `board/`.
- When the enchantment rules are next touched, also clean the "3-card enchantment
  grants +1 counter AND +1 action AND +1 slot" double-description (noted in QUEUE
  Deferred).
- Ladder/score-table edits overlap the Echo decision's propagation checklist — do
  them together, not twice.
