# Archmage Ascension — running the web app

There are two ways to run this app, depending on what you need:

## 1. Standalone HTML prototype (no build)

`Archmage Ascension.html` is the original design-tool export, plus
locally vendored React 18, ReactDOM 18, and Babel standalone in `vendor/`.
Open it directly via any static file server — no install step, no internet
required (Google Fonts is loaded if available, otherwise system fonts).

```sh
python3 -m http.server 8765
# then open http://localhost:8765/Archmage%20Ascension.html
```

JSX is transpiled in the browser by Babel — fine for design parity, but
slow on first paint and not appropriate for production.

## 2. Vite build (production)

The same source files (`game/*.jsx`, `game/*.js`, `game/lib/*`) are bundled
by Vite via `src/main.jsx`. JSX is precompiled at build time; no
runtime Babel; React is bundled into the output.

```sh
npm install
npm run build      # → dist/
npm run preview    # serve dist/ for verification
npm run dev        # hot-reload dev server
```

The Vite entry exposes React/ReactDOM on `globalThis` (via
`src/install-globals.js`) because the prototype's modules were authored
for `<script>`-tag loading and read those names off the global object.
This is a deliberate compatibility shim — converting every IIFE to ESM
exports would be a larger refactor and is not required for the bundle
to work.
