---
title: 2-Player One-New-Player Playtest — Counter Comprehension (F1)
type: playtest-plan
date: 2026-07-06
status: draft-for-Sam
players: 2 (Sam + one first-time player)
version: current 2–4p ruleset (v3.0 per meta/canon.yml)
purpose: Run the F1 "text vs structure" counter-comprehension test in its cleanest environment — 2 players, one genuine first-timer, written rules only. One killable question; everything else is observation.
sources: rules-and-teaching thread `next`; QUEUE P1 (counter refresh rewrite); `_review/ARCHMAGE_SAM_DECISIONS_F3_F14_2026-07.md` (F1/F3/F10); `_review/STRANGER_EVIDENCE_PLAN_2026-07.md` (TS1 principles); operational how-to lives in `Playtest Guide - New Player Session.md` (do not duplicate it)
evidence_tags: "[FILE] · [INFER] · [GAP]"
---

# 2-Player One-New-Player Playtest (July 2026)

This is the concrete, runnable instance of the rules-and-teaching thread's `next`
("re-test counter comprehension from written rules only") at 2 players. Per the F10
decision, 2–4p is the **cleanest environment** to close F1 without Echo/capacity noise
contaminating the result. The generic run-of-show (framing script, teach steps, the
four debrief questions, the diagnosis format) is in
**`Playtest Guide - New Player Session.md`** — follow that for *how* to run the room.
This file adds the session-specific layer: the one decision to close, the exact data
to capture, and what NOT to touch.

---

## 0. Prerequisite (decide before the table is set)

**The counter refresh rule has one rewritten "control-arm" text drafted** (the top
QUEUE P1). This session tests *that* wording from paper, with zero verbal patching.

- If the rewrite **exists**: use it. This is a clean TS1 control arm for F1.
- If the rewrite **does not exist yet** [GAP]: you can still run — teach counters from
  the *current* text and record the result as the failing-baseline datum. Do not
  improvise a better explanation mid-teach; a verbal patch destroys the F1 signal.

Either way, **Sam does not explain design intent and answers rules questions only by
pointing at the written text** (standing rule, stranger-evidence plan §1).

---

## 1. The one killable question

> **F1 — Is the counter-refresh comprehension failure a *text* problem or a *structure*
> problem?** Can a first-time player learn the Cast → Recall → Learn counter loop from
> written rules alone and play three turns with ≤1 counter question after the read?

- **Pass** → the failure was text; the rewrite is viable (F1 leans Option C / text-only).
- **Fail** (≥2 counter questions after the read, or a silent misplay of Recall) → the
  failure is structural; F1 escalates to the redesign arms (Capacity Gauge or round-trip
  counter), see DECISION_REGISTER F1 and the two mutually-exclusive P1s in QUEUE.

Only **one** branch ever ships. This session produces the datum that chooses; it does
not itself adopt a redesign.

**Hypothesis (write it down, don't revise it after):**
> *If the counter refresh rule is taught from the rewritten text with a concrete
> turn-step example, the new player will complete three turns performing Cast → Recall →
> Learn in the correct order with ≤1 clarifying question and no silent Recall misplay.*

---

## 2. What to set up (2–4p configuration only)

Use the existing 5×20 + 4 Print & Bind prototype deck as a **component pool** (F14 —
it is not deck canon). Pull only the 2–4p cards:

- **4 energies** (Radiance, Void, Flux, Aether) × ranks 1–15 **+ 2 wilds = 62 cards** [FILE: canon.yml `deck_2_4p`].
- **1 starting counter** each [FILE: canon.yml `starting_counters` 2–4p].
- Enchantment ladder in reach at 2p: **3-card = +1 counter**, **4-card = +3 counters**.
  **5-card / Unlimited Capacity is NOT reachable in 2–4p** (needs Echo's fifth energy) —
  do not mention it or promise it [FILE: F6 / Unlimited-Capacity ruling].
- **Max spell size 15**; wilds substitute inside a valid spell but cannot push past the
  1–15 span [FILE: canon.yml `max_spell_size`].

Do NOT include: Echo / any fifth energy, Ascension Trials, 5-card Enchantment, freshly
exported or printed cards.

---

## 3. Data to capture (this is the session's product)

### Primary — closes F1 (fill in live, per the guide's confusion checklist)

- Time-to-first-turn (end of teach → new player's first legal action).
- **Counter questions asked in the first 3 turns** (the pass/fail metric). Tally per turn.
- Time-to-first-**correct** Recall (picking counters back up before the Learning Phase,
  unprompted).
- **Silent Recall misplays** — starting a Learning action without Recall, or treating
  counters as a spendable resource they try to "save." Note the exact moment.
- Whether the new player can, when asked once mid-game, state the loop in their own
  words: *"cast with counters, pick them up, spend them again to learn."*

### Secondary — observation only, must NOT change the F1 read (route as ACTIONs, §2)

- **Enchantment uptake / capacity feel** (capacity-economy thread): did enchantment
  pursuit feel viable at 2p, or did learning capacity feel like a wall? Count enchantments
  learned.
- **F3 enchantment timing**: if an enchantment is learned, did the new player expect its
  capacity *this* turn? (gains apply next turn — watch for the mismatch, don't correct the
  design, just log it.)
- **Unlearn scope (F12)**: if the "can I take back some but not all of a spell?" question
  surfaces, record verbatim — it recurred in Session 3 and is still unspecified.
- **Reference-card / scoring legibility** (P1 blocker every session): note any moment the
  printed reference card or score table was unreadable during play.

---

## 4. After the game

1. Run the debrief exactly as the generic guide's **Four Core Questions**, before
   explaining scoring. Capture the new player's own words for what the game *is*
   (the hook-visibility signal: did they say "wizard rummy with counters," or did the
   dying Source / building Spellbook register unprompted?).
2. **Log the session** as `playtests/2026-07-06-session-04.md` (or the actual play date),
   with `goal:` = the F1 question above and `verdict:` = the pass/fail call. Front-matter
   is the index (process §7).
3. **Route every actionable finding the same turn** (process §2): write it in the session
   file as `ACTION: …`, copy to `meta/QUEUE.md`, mark the source `ACTION(queued): …`.
4. **Campsite the thread**: update `meta/threads/rules-and-teaching.md` — the F1 result
   and the new `next` (adopt the rewrite, or escalate to a redesign arm).
5. If the result closes F1, record it in `meta/decisions/` the same turn with a canon
   delta and propagation checklist (process §3), and update DECISION_REGISTER F1.

---

## 5. Anti-drift guardrails for this session

- **One killable question** (F1). Do not also try to "settle" capacity, timing, or scoring
  — those are observation-only here (stranger-evidence plan §6).
- **No verbal patching.** A rules answer is a finger pointing at the text. If you explain
  the counters aloud, you have converted an F1 test into a demo and thrown away the datum.
- **Don't change three things at once** (guide §Diagnosis). If this session fails F1, the
  next move is the *structural* A/B (gauge vs round-trip), not a second text tweak — any
  system iterated twice without new evidence escalates to a redesign/cut call.
- **Weight behaviour over compliments.** "I liked it" to the designer is worthless; the
  real signal is whether they play the loop correctly and whether they'd choose it again.
