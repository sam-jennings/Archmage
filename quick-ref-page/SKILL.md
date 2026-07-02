---
name: archmage-ascension-design
description: Use this skill to generate well-branded interfaces and assets for Archmage Ascension (a mystical card game — four elemental suits, value-strip connectors, spell-binding at the join), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files — especially `colors_and_type.css` (tokens), `lib/cards.js` (the card renderer), `preview/*.html` (ready-made Design System cards), and `ui_kits/card-game/` (interactive play table with variant controls).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. Use `lib/cards.js` directly to generate card faces — don't hand-roll SVG. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

**Key vocabulary to preserve**
- The four suits are **Radiance, Void, Flux, Aether** — never Fire/Water/Earth/Air.
- The wild is **Convergence**.
- Typeset headings/pips in **Cinzel**, body/flavor in **Cormorant Garamond italic**. No sans-serif.
- No emoji. No pill chips. No purple-to-blue SaaS gradients. Backgrounds are deep black tinted by the suit hue.
- Copy is hushed, ceremonious, italic marginalia — never exclamatory, never first-person.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts or production code, depending on the need.
