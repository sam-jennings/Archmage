---
title: Web rebuild v2 — design brief (Prompt 1)
type: design-brief
created: 2026-11-11
rules: v3.1 (under test)
---

# Arcane Drought — player site v2: design brief

Written before building. One page. The title on every v2 surface is **Arcane Drought**
(set once in `data/site.js`); the winner is the **Renewer**.

## The IA I chose: one site, three doors, one source

The old split (board → Quick Reference Card → Online Rules) is right about *situations*
and wrong about *structure*. Three separate pages meant three copies of every number, two
hand checkers and three navigations. v2 keeps the three situations as three doors of one
site, all rendered from one rules-data module:

| Door | When | Device | What it answers |
|---|---|---|---|
| **Play** `play/` | mid-turn, many short visits | phone, one hand | can I cast this? · what does it do? · what can I do in Learning? · what's the Drought? · how is it scored? |
| **Learn** `learn/` | before the first game | either | a five-minute teach path; later the interactive explainers (Prompt 2) |
| **Rules** `rules/` | first read, disputes | laptop first | every rule, in the board's order, searchable, printable |

Designer things (Spellbook Optimizer, pitch sheet, parked digital game, expansions hub) sit
behind one quiet **Studio** link in the footer. `noindex`, never on a player path.

Why not one page with modes: the lookup (seconds, thumb, dim room) and the read (minutes,
keyboard, search) want opposite layouts. Why not three unrelated pages: the same section
names and ids run through all three, so a player who learned "Normal Turn" on the board
finds "Normal Turn" in Play and in Rules. Each Play panel links to its full rule; each
rule links back to the table view.

## Page map and stable ids

- `index.html` — three doors, version badge, Trials link, Studio in the footer.
- `play/` — bottom tab bar in question-frequency order: **Check · Spells · Turn · Score · Set-up**
  (`#check #spells #turn #drought #score #set-up`). Opens on Check.
- `rules/` — one document, board order. Old Online Rules ids are kept verbatim:
  `#set-up #spells #normal-turn #drought-turn #recognition-points #ascension-trials`,
  plus `#components #wilds #collection #casting #recall #learning #counters
  #enchantment-timing #score-calculator #variants #glossary`.
- `learn/` — `#first-game` (six short steps) and `#explainers` (mount point, Prompt 2).
- `studio/` — designer links; `#expansions` mount point (Prompt 4).
- Trials: linked to the existing companion; `trials/` is reserved for Prompt 3.

## Key interaction decisions

1. **The hand checker is the home screen of Play.** Tap an energy, tap a value, done. The
   value pad is a 5×3 grid that doubles as a toggle (a deck holds one of each card, so a
   lit value means "in hand"; tap again to remove). No keyboard, no dropdowns. Results are
   grouped by spell type with the cast effect and Recognition Points beside each, and a
   plain verdict first: "All 4 components form one spell" or "Largest spells in these cards".
2. **Player count is a site-wide switch (2–4 / 5–6), not prose.** It changes the deck the
   checker accepts (Echo, four wilds), the set-up steps, starting counters and whether the
   5-component Enchantment exists. This answers session 4's "how do I finish a 5-card
   Enchantment with a wild?" structurally: at 2–4 the tier is not shown as reachable.
3. **Turn has a "where am I" marker.** Session 1's player kept losing his place. The
   steps are tappable; the current one stays lit. Recall is a named step between Casting
   and Learning, as on the board, because the counter rule failed on paper and passed on
   screen (session 4).
4. **The teach path disappears.** A one-line "First game?" strip on Play, dismissed once,
   never shown again. Learn stays reachable from the top bar.
5. **Calm by rule.** One accent (engraved gold), energies carry colour *and* symbol *and*
   name, no animation longer than 140 ms, nothing moves unless tapped. A daylight theme
   exists for bright rooms; dark is the default.
6. **Rules status is visible and quiet.** One badge, "Rules v3.1 · under test", from the
   data module. Variants (Array Attunement) are data flags, off by default, shown under
   "Variants under test" only.
7. **Rules churn is absorbed by data.** `data/current.js` is the single import that picks
   the rules version. Rolling back to v3.0 or adding v3.2 is one new data file and one
   changed line. `tools/check-rules-data.mjs` fails loudly when the data and the rulebook,
   Scoring System Reference or `meta/canon.yml` disagree.

## Not in this pass

Interactive explainers (Prompt 2), Trials rebuild (Prompt 3), expansions hub (Prompt 4),
French strings (the table exists; nothing is translated), any change outside `web-apps/v2/`.
