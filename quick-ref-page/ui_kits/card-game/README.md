# Archmage Ascension — UI Kit

An interactive play-table showing the full card system — four elemental suits, five connector variants, three energy-art styles, and live spell-binding at the join.

## Files

- `index.html` — the interactive table. Deal hand → drag into play area → bind spells.
- `PlayTable.jsx` — top-level scene: opponent, stage, your hand.
- `Hand.jsx` — fan layout for your hand, with hover lift.
- `SpellStage.jsx` — center play zone where cards bind into a spell (consecutive bloom overlap).
- `Controls.jsx` — the Tweaks-panel-like dial: cycle connectors, energy art, back style.
- `Card.jsx` — thin React wrapper around `lib/cards.js` so variants drive re-render.

## Tweaks exposed

Inside the table, press the sigil (top-right) to open the control rail:

- **Connector** — bloom · parallelogram · triangle · notch · beacon  
- **Energy art** — sigil · runic · crystalline  
- **Back style** — sigil-circle · filigree-cross · sealed-star  

All bound cards in the stage re-render live so you can see how the join reads at play.

## Interactions

- Click a card in your hand → it lifts to the stage.
- Cards of **consecutive value, same suit** → bloom visibly overlaps the join.
- Cards of **same value, different suit** → chromatic strip (hues rotate across the overlap).
- Click the staged card's × → return to hand.
- "Cast spell" button → stage pulses gold (flavor only).
