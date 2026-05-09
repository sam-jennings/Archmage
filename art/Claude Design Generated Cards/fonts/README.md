# Fonts

No local TTF/WOFF files are bundled. Both faces load from Google Fonts via the `@import` at the top of `colors_and_type.css`:

- **Cinzel** — weights 400, 600, 700, 900 — display / headings / pips / values
- **Cormorant Garamond** — weights 300/400/600/700 + italic 400 — body / flavor / marginalia

### If offline use is required

Download from:
- https://fonts.google.com/specimen/Cinzel
- https://fonts.google.com/specimen/Cormorant+Garamond

Place `.woff2` files in this folder and replace the `@import` line in `colors_and_type.css` with local `@font-face` declarations.

### Substitutions

These are the authoritative typefaces from the source codebase (`card-design/`). No substitutions are in play.
