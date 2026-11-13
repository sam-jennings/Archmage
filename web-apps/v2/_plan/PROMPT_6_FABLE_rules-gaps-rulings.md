# Prompt 6 (Fable 5.2) — Rulings brief for the rule gaps the v2 build exposed

> Paste everything below the line into a Fable 5.2 session with the Archmage Ascension
> folder connected.

---

You are working on the tabletop card game **Arcane Drought** (working title Archmage
Ascension). Three earlier sessions rebuilt its web surfaces under `web-apps/v2/`. To do
that they had to model every rule exactly, and the modelling exposed about 25 places where
the rulebook is silent, ambiguous or contradicts canon. The site currently shows
"Rulebook unclear" notes at those points. Your job is to turn each gap into a decision
Sam can make in seconds, with a recommended ruling and the exact wording to adopt.

This is a limited, expensive session. Spend it on rules judgment: what each candidate ruling does to
play, whether it stays consistent with the rest of the game, and whether it is teachable.

## Hard constraints

- **Write one new file only:** `_review/RULES_GAPS_BRIEF_2026-11.md`. Do not edit the
  rulebook, `meta/`, `web-apps/v2/` or anything else. No commit/push.
- You recommend; Sam decides. Never present a ruling as settled.
- **v3.1 is under a confirm/kill test.** Prefer rulings that clarify without changing
  balance. If a ruling would change balance (e.g. how Reshape is costed), say so plainly
  and recommend deferring it until after the confirm/kill.
- Respect the standing rules in `PROJECT.md` (the protected hook), `meta/canon.yml`, and
  the decided principles in `meta/decisions/` (e.g. F3: capacity gains next turn, losses
  immediately; F6: wild declarations).

## Reading list

- The three gap tables: `web-apps/v2/REPORT_1.md` §6 (conflicts 2–5, 12–13),
  `web-apps/v2/REPORT_2.md` §4 (A–I plus the three smaller items),
  `web-apps/v2/REPORT_3.md` §3 (items 1, 3, 5, 6, 7, 10, 11, 13, 14).
- `rulebook/Archmage Ascension - Complete Rulebook.md` (v3.1), `rulebook/Ascension Trials.md`,
  `rulebook/Scoring System Reference.md`, `meta/canon.yml`
- `meta/decisions/2026-07-06-*.md`, `2026-07-09-v3-1-scoring-economy-bump.md`,
  `2026-07-17-array-attunement-tf-gate.md`
- `playtests/*.md` (what actually came up at the table)
- `meta/review-briefs-2026-11.md`. Match its format: Sam answers with "1A, 3B".
- Executable models you can use to test a ruling: `web-apps/v2/assets/js/hand-checker.js`,
  `web-apps/v2/learn/explainers/*.js` (pure state machines), `web-apps/v2/trials/engine/`.
  Run `node --test` in `web-apps/v2/` to confirm the current behaviour before reasoning about changes.

## What to produce

For each gap (merge duplicates; A and B are one question, for example):

- **What's unclear**: one or two sentences, with rulebook line refs.
- **Options**: usually 2–3, each with its effect on play in a sentence, including any
  degenerate line it opens or closes.
- **Recommendation and why.**
- **Proposed wording**: the exact sentence(s) for the rulebook, written in the rulebook's
  own voice, plus the short form for the phone (≤ 20 words).
- **Balance impact**: none / clarifies only / changes balance (defer?).
- **What changes when decided**: which rulebook lines, which `web-apps/v2` file (rules
  data, explainer note, Trials ruleset) and which test.

Group the items:
1. **Decide before the French six-player session** (things new players will hit:
   Unlearn scope, wild-in-Enchantment, capacity timing edge cases).
2. **Decide before any Drought-heavy or 5–6p session** (Source emptying mid-turn, the last
   Released Reserve card, Trials Echo/Complete Mastery).
3. **Can wait for the post-confirm/kill rulebook pass.**

Where an executable model can show the consequence of a ruling (e.g. how many hands an
Unlearn ruling makes legal or illegal, or which Trials outcomes change), run it in a scratch
location outside the project folder and quote the numbers.

End with:
- A one-line answer template ("1A 2B …") Sam can paste back.
- The single `meta/QUEUE.md` line that should mirror this `_review/` file (per
  `_review/README.md`). List it; don't add it.
- Any gap you think is actually a symptom of a deeper rule problem, flagged separately and
  briefly.
