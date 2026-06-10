# Archmage Ascension — Interactive Game

A complete, dependency-free implementation of Archmage Ascension
(rulebook v2.8) playable in any modern browser on desktop or mobile.

## Features

- **2–7 players** — deck adapts per the rulebook (values 1–15 + 2 wilds
  for 2–4 players; values 1–20 + 4 wilds for 5–7 players)
- **Hot-seat multiplayer** with pass-the-device privacy screens, and/or
  **AI opponents** in any seat (all-AI spectator mode works too)
- Full rules: Binding, Collection, Casting (with immediate effects and
  Array exchanges), the explicit **Recall** step, Learning
  (Learn / Empower / Reshape / Unlearn), wild cards with automatic
  declaration solving, the Drought, and final Recognition Points scoring
  with rulebook tiebreakers
- Capacity is derived live from Enchantments in the Spellbook
  (3-card = +1 counter, 4-card = Unlimited)
- Autosaves to `localStorage` after every action — resume from the
  title screen
- In-game rules reference and a public contest log

## Running

No build step. Serve the folder statically (or open `index.html`
directly):

```sh
python3 -m http.server 8000
# open http://localhost:8000/web-apps/game/
```

## Files

| File | Purpose |
|---|---|
| `index.html` | Page shell, loads the three scripts |
| `styles.css` | Mobile-first responsive styling |
| `engine.js` | Pure rules engine (no DOM; also loads in Node) |
| `ai.js` | Heuristic AI for computer-controlled seats |
| `ui.js` | Rendering + interaction (vanilla JS, full re-render per action) |
| `sim-test.js` | Dev tool: unit tests + full AI-vs-AI games at every player count |
| `e2e-check.js` | Dev tool: Playwright browser smoke test with screenshots |

## Tests

```sh
node sim-test.js     # rules unit tests + 24 simulated full games (2-7 players)
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node e2e-check.js   # browser smoke test
```

`sim-test.js` asserts card conservation, spell validity, capacity
invariants, that every game reaches the final evaluation, and that the
scoring table matches the Scoring System Reference.

## Rule interpretations

Where the rulebook is open to reading, this implementation chooses:

- **Overlapping patterns**: a card set that fits several spell types
  (e.g. a same-energy run) is learned as the type the player declares;
  the highest-scoring option is preselected.
- **Drought end**: the contest ends the instant the last Released
  Reserve card is drawn ("immediately ends") — the drawing player does
  not get a final Learning phase.
- **Unlearn lock**: components returned by Unlearn can be neither
  Learned nor Empowered until the player's next turn.
- **Capacity** is derived from the current Spellbook (1 + one per
  3-card Enchantment; Unlimited while any 4-card Enchantment exists),
  which matches the rulebook's worked example, including breaking
  enchantments via Reshape.
- **Mid-cast Drought**: if a Conjuration/Perfect Transmutation draw
  empties the Source, the Drought triggers instantly; a Perfect
  Transmutation's exchange is skipped (the Array no longer exists) and
  the casting phase ends.
