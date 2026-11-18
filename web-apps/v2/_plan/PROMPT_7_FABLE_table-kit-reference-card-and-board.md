# Prompt 7 (Fable 5.2) — Table kit: printed player reference card + board, rebuilt for v3.3

> Paste everything below the line into a Fable 5.2 session with the Archmage Ascension
> folder connected.

---

You are redesigning the **printed table materials** for the tabletop card game **Arcane
Drought** (working title Archmage Ascension): the player reference card and the A3 board.
The standing P1 says the current reference card is too hard to read during play and "blocks
every session". Separately, the board is pre-v3.1 and now wrong (old score table, 5–7p
setup, a retired "Opening" step). The rules are now **v3.3** (canon).

This is a limited, expensive session. Spend it on **information design**: what goes on
the card versus the board, at what size and in what order. The goal is that a new player,
with no one explaining, can run a turn and especially the **counter loop** from paper alone.

## Hard constraints

- **New files only**, under a new folder `board/v3.3-table-kit/`. Do not edit, move or
  delete anything else (not the old board PDF, not `card-design/`, not `meta/`). No commit/push.
- **F14 export hold** (`meta/decisions/2026-07-06-f14-export-hold.md`): no regenerated deck
  exports and no new print run. What you make is a **design plus home-printable test aids**
  (A4/A3 PDFs Sam prints himself). Make print-shop specs ready, but don't produce a print order.
- Do not change rules or numbers. Every number on the paper must come from
  `web-apps/v2/data/rules.v3.3.js` (via `web-apps/v2/data/current.js`), which is
  checked against the rulebook by `web-apps/v2/tools/check-rules-data.mjs`. Build the
  materials as **HTML/SVG sources that import that module** and render to PDF with headless
  Chrome. That way a v3.4 is a re-render, not a redesign.
- Energy art: `art/energy-symbols-export/` only. Vocabulary per `meta/canon.yml`.
  Same visual family as `web-apps/v2/assets/tokens.css`, adapted for print: CMYK-safe
  colours, no reliance on glow or dark fills that eat toner. Provide a toner-light variant.

## Reading list

- `PROJECT.md`, `meta/canon.yml` (v3.3), `rulebook/Archmage Ascension - Complete Rulebook.md`
- The P1 in `meta/QUEUE.md` for the reference-card redesign, and the counter-comprehension retest it now carries
- `playtests/*.md`: sessions 1 and 3 failed the counter loop on card/board. Session 4 passed it from a screen. Work out why.
- The current paper: `board/archmage_a3_landscape_board.pdf`, `board/spell_ref.png`,
  `board/turn_ref.png`, and the v3.1-patched `card-design/export-screentop/board/board-a3-150dpi-v31.png`
- What worked on screen: `web-apps/v2/DESIGN_BRIEF.md`, `web-apps/v2/play/` and the
  explainers' captions (`web-apps/v2/learn/explainers/strings.en.js`)
- `playtests/plans/stranger-playtest-plan-2026-11.md`: the first stranger session will use
  one printed set, with Sam silent and pointing only at written text
- Print specs: card 62 × 88 mm, 3 mm bleed, 5 mm safe area, 300 dpi (printenbind.nl)

## What to decide first (write `board/v3.3-table-kit/BRIEF.md`, ≤ 1 page, then build)

- **Division of labour.** The board is shared, at arm's length, read by everyone. The
  card is personal, in the hand, read mid-turn. Decide what lives where, and what lives on
  neither (it's in the rulebook or the phone). Don't duplicate anything that can drift.
- **Card format.** One double-sided card, two cards, a bi-fold, or a player mat that also
  holds counters and the Spellbook. Pick based on the counter-loop failure and the size of the
  table, and say what you traded off.
- **The counter loop.** Design it as a physical procedure the components act out (where
  counters sit, where they move during Casting → Recall → Learning), not as a paragraph.
- **2–4p vs 5–6p.** One board with the Echo set-up as a clear secondary path.

## Build

1. Board: A3 landscape source + PDF (and an A4 two-sheet tiling for home printing).
2. Player reference card(s) / mat: print-spec source + PDF at final size with crop marks,
   plus an A4 sheet with 4 (or however many fit) per page for home cutting.
3. A **10-minute legibility test protocol** Sam can run with one new player and the paper only:
   tasks, what to observe, pass/fail. Make it match the QUEUE's counter-comprehension retest,
   so the result closes that item.
4. `board/v3.3-table-kit/REPORT.md`: decisions and why, every rule statement on the paper
   with its source line, what you left off and where it lives instead, what needs changing
   elsewhere (e.g. `board/README.md`, QUEUE entry, the board QR target), and suggested edits
   to the v2 Play screen so screen and paper match.

Render every PDF and look at it (rasterise pages and inspect them) before you finish:
text at actual print size, nothing in the bleed or outside the safe area, contrast in the toner-light variant.
