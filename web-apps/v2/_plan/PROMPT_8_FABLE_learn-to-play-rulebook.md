# Prompt 8 (Fable 5.2) — A learn-to-play rulebook for a blind teach

> Paste everything below the line into a Fable 5.2 session with the Archmage Ascension
> folder connected. Best run after Prompt 7, so the rulebook can point at the new card and board.

---

You are writing the **learn-to-play rulebook** for the tabletop card game **Arcane Drought**
(working title Archmage Ascension), rules **v3.3**. The existing
`rulebook/Archmage Ascension - Complete Rulebook.md` (~4,000 words) is a complete reference:
correct, but it's ordered by component and concept, so strangers can't learn the game
from it. The first stranger playtest will be a **blind teach**: Sam stays silent and only
points at written text. Whether strangers can learn the game from the written text alone
is now the main thing that blocks real evidence.

This is a limited, expensive session. Spend it on teaching sequence, worked examples and
exactness. Every sentence must be true under v3.3, and nothing a first game needs may be missing.

## Hard constraints

- **New files only**, in a new folder `rulebook/learn-to-play/`. The Complete Rulebook stays the
  source of truth and is not edited. No commit/push; nothing in `meta/`.
- No rule changes. Where you find a gap, write around it neutrally and list it in the report.
  Don't invent a ruling. (Many gaps were just settled: see `meta/decisions/2026-11-16-rules-gaps-rulings-1-8.md`.)
- Vocabulary per `meta/canon.yml`; title **Arcane Drought**, the winner is the **Renewer**
  (tone from `rulebook/Story.md`). Advanced material (Ascension Trials, variants,
  expansions) stays out except one pointer.
- Numbers come from `web-apps/v2/data/rules.v3.3.js`. Write a short node check that
  cross-references every number in your text against it, and run it.

## Reading list

- `meta/canon.yml`, the Complete Rulebook, `rulebook/Scoring System Reference.md`, `rulebook/Story.md`
- `meta/decisions/2026-11-13-*.md`, `meta/decisions/2026-11-16-rules-gaps-rulings-1-8.md`
- `playtests/*.md`: every point where a player got stuck
- `web-apps/v2/learn/` (the five-minute first-game path and the explainers' captions:
  wording already shown to work) and `_review/FR_6P_SESSION_2026-08/` (a reference written for
  non-native players)
- `board/v3.3-table-kit/` if Prompt 7 has run
- `playtests/plans/stranger-playtest-plan-2026-11.md`

## What to write

1. **Learn to Play** (target ≤ 8 printed A5 pages, or say why it needs more): setup with a
   diagram description, the goal in two sentences, then **one guided first round** narrated
   turn by turn for a 3-player table with real cards, then the rules in the order a player
   meets them in that round. One worked example per spell type and per learning action. The
   counter loop is shown, not described. Drought and scoring come at the point the game reaches them.
2. **Margin "If you're wondering…" notes**: the questions real players asked (from the
   playtest logs), answered in one line each where they arise.
3. **A one-page "first game" setup + turn summary** to sit next to the board.
4. Layout source (HTML/CSS, print to A5 PDF via headless Chrome, using the v2 tokens adapted
   for print) plus a Markdown version. Rasterise and look at every page before finishing.
5. `rulebook/learn-to-play/REPORT.md`: the teaching sequence and why; a table mapping every
   rule in the Complete Rulebook to where it is taught (or deliberately left out, and why);
   gaps found; and a **blind-teach test script**: what Sam records, the tier scale from
   `_review/FR_6P_SESSION_2026-08/` and what counts as a failure of the text.
