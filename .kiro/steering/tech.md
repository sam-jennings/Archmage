# Tech Stack

Most of this repository is **Markdown and static HTML/CSS/JS** — there is no monolithic build. Software components are small, self-contained, and each has its own tooling. Prefer plain, dependency-light solutions; this is a design repo, not an app.

## Content & docs
- **Markdown** for all rulebook, design, state, and playtest files. Many files use YAML front-matter (`title`, `type`, `updated`, `updated_by`).
- Authored/read in **Obsidian** (`.obsidian/` is personal and gitignored). Wiki-style `[[links]]` may appear.

## Web tooling
- **Static HTML/CSS/JS** for card renderers (`card-design/playtable.html`), player-facing reference tools (`web-apps/`), and the pitch sheet. These open directly in a browser — no build step.
- **Procedural SVG** for card art (`card-design/art/arcana.js`) and connectors (`card-design/connectors/beacon.js`). No bitmap assets in the live renderer.
- **React 18 + Vite 5** only for the 2-player digital build in `web-apps/archmage-ascension/` (ES modules, `type: module`).

## Simulation
- **Python** simulation rig in `simulation/` (`archmage_deck_sim.py`, `scoring_rebalance_stats.py`). Used for modelling deck/economy questions on paper before live playtests. Assumptions and results are documented alongside in Markdown.

## Tests
- **Node built-in test runner** (`node --test`) with **fast-check** for property-based tests (`tests/hand-checker/`, `web-apps/tests/`). Test files use the `.test.mjs` / `.property.test.mjs` convention.

## Deployment
- **GitHub Pages** via `.github/workflows/deploy-pages.yml`, deploying the repo root on push to `main`. `index.html` is the site hub linking the web-apps.

## Common commands

Run from the relevant subfolder (there is no root package.json).

```bash
# Digital build (web-apps/archmage-ascension/)
npm install
npm run dev        # local dev server (run manually in your terminal)
npm run build      # production build
npm run preview    # preview built output

# Property-based tests (tests/hand-checker/ or web-apps/tests/)
npm install
npm test           # node --test

# Simulation rig (simulation/)
python archmage_deck_sim.py
python scoring_rebalance_stats.py
```

Note: dev servers and watchers are long-running — start them manually rather than expecting them to return.
