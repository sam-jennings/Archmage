# Prompt 1 (Fable 5.2) — Foundation + player site

> Paste everything below the line into a Fable 5.2 session with the Archmage Ascension
> folder connected.

---

You are rebuilding the player-facing web surfaces of a tabletop card game, **Archmage
Ascension** (final title "Arcane Drought", rename deferred). You have read/write access to
the project folder. This is a limited, expensive session: use the reading list and facts
below instead of exploring the repo, and spend your effort on design judgment and
correctness.

## Hard constraints

- **Create new files only, under `web-apps/v2/`.** Do not modify, move or delete any
  existing file anywhere (including `index.html`, `web-apps/*`, `meta/*`, the rulebook, tests).
  If something existing needs to change, list it in your report.
- Do not `git commit` or push (pushing to main deploys the site).
- Do not change game rules or numbers. If the sources disagree, follow the precedence
  below and flag the conflict in your report.
- No frameworks, no build step, no CDNs. Plain HTML/CSS/ES modules that work opened from
  GitHub Pages and (as far as possible) from `file://`. Self-host fonts (Cinzel and
  Cormorant Garamond are OFL; subset them).
- Vocabulary: Source, Array, Arcane Reserve, Released Reserve, Drought, the Opening,
  Spellbook, Component, Counter/Capacity, Learn/Empower/Reshape/Unlearn, Recognition Points;
  energies **Radiance, Void, Flux, Aether** (+ **Echo** in 5–6p decks only) and **the wild**.
  Never: Vault, Exchange, Wild Magic Surge, Convergence, Unlimited Capacity, card-suit
  language (Spades/Hearts…), Fire/Water/Earth/Air.
- Energy symbols: use `art/energy-symbols-export/symbol_*.svg` as-is. Never redraw them.
- The folder is OneDrive-synced: new files are safe; keep the file count sensible.

## Source precedence (what's true)

1. `meta/canon.yml` — versions, deck sizes, enchantment ladder, wild rule, max size, starting counters.
2. `rulebook/Archmage Ascension - Complete Rulebook.md` (v3.1, **under test**) and
   `rulebook/Scoring System Reference.md`.
3. `board/archmage_a3_landscape_board.pdf` — section names/order players see on the table.
4. Existing pages are evidence of what already works, **not** sources of truth.

## Reading list (read these, little else)

- `PROJECT.md`, `meta/canon.yml`
- The rulebook and Scoring System Reference (above); `rulebook/Story.md` (tone only)
- `web-apps/REFERENCE_SITE_PLAN.md` (the original phone-first thinking — still largely right)
- `web-apps/FABLE_PROMPT_unified_system.md` and the project-root `COHERENCE_REPORT.md` if present
  (the July unification pass)
- `web-apps/player-reference/player-reference.html`, `web-apps/archmage-reference.html`,
  `index.html`, `web-apps/archmage-tokens.css`
- `web-apps/tests/hand-checker/` (golden master + loader)
- `playtests/*.md` — skim for where players got confused
- `web-apps/v2/_plan/PLAN.md` — the facts table and "what stands out" list

## What Sam wants

- Players never wonder where to look for what they need.
- Visually appealing and atmospheric but **calm**: nothing competes with a lookup mid-turn.
- Works well on **phones at the table** (one hand, dim room, many short visits) and on
  **laptops** (first-time learning, settling disputes, longer reading).
- A foundation that later sessions extend: interactive rule explainers (Prompt 2), the
  Ascension Trials companion (Prompt 3), a designer-only expansions hub (Prompt 4).

## What to build

### A. Information architecture (your call — justify it)
The current model is board (shared) → Quick Reference Card (phone, personal) → Online
Rules (deep). Decide whether that is still the right split, or whether one site with modes
or layers serves players better. Design around the questions players actually ask, in
order of frequency ("can I cast this?", "what does it do?", "what can I do in Learning?",
"what's the Drought?", "how is it scored?"), plus a first-game teach path that disappears
once learned. Mirror the board's section names so the eye moves from table to screen
without translating. Keep stable deep-link ids so the board QR / old links can map onto v2;
include a redirect map from the old ids in your report.

Players and the designer are separated: players see Play / Learn / Look up. The
Spellbook Optimizer, pitch sheet, parked digital game and the expansions hub sit behind
one quiet "Studio" entry.

### B. Design system (`web-apps/v2/assets/`)
Evolve `archmage-tokens.css`. Don't throw it away: the dark/gold arcane mood stays.
Define type scale, spacing, colour roles (including the five energies + wild, colour-blind
safe and never colour-only), elevation, motion (subtle; `prefers-reduced-motion`
respected), focus states, and a small component set: nav, tabs, disclosure, spell tile,
card chip (energy + value), table, callout ("under test", "variant", "rule clarification"),
version badge. Light/dim-room legibility matters more than drama. WCAG AA contrast;
44 px touch targets.

### C. Rules-data layer (most important for longevity)
`web-apps/v2/data/rules.v3.1.js`: a single ES module holding every number, table and
short rule string the pages show: version + status ("under test"), player counts, deck
compositions per count, starting counters per count, spell definitions, cast effects by
size, learning actions and costs, enchantment ladder, score table, Drought procedure,
key reminders, glossary. Pages render from it. No rule numbers hard-coded in HTML.
Also `data/strings.en.js` for UI copy (so a later `strings.fr.js` is cheap. Do not translate).
Also `tools/check-rules-data.mjs`: a node script that parses the score table and other
machine-checkable facts from the rulebook / Scoring System Reference / canon.yml and
fails loudly on any mismatch with the data module. Design it so v3.0 rollback or a v3.2
is a new data file + one import change, and variants (e.g. Array Attunement, decided but
not applied) can be represented as flagged variants without touching base rules.
Put the game title in one place.

### D. Shared hand checker
One ES module (`assets/js/hand-checker.js`) replacing the two inline copies: wild-aware,
deck-aware (Echo only at 5–6p), max size 15, wild declaration per canon. Write
`web-apps/v2/tests/hand-checker.equivalence.test.mjs` that runs the new module against
the existing `web-apps/tests/hand-checker/golden-master.snapshot.json` (read-only) and
passes. Where canon has changed since the snapshot, document each intended difference
rather than silently diverging.

Make the checker the best screen on the site: entering a hand on a phone must be fast
(think: tap energy, tap value, done — no keyboard), results grouped by spell with the
effect-when-cast and points beside each.

### E. Pages
Rebuild the landing, the quick reference (phone-first) and the full rules (laptop-first
but fully usable on phone) on the new foundation. Include: 2–4p vs 5–6p (Echo) setup
differences; the v3.1 "under test" status visible but quiet; score calculator; search or
an index for the full rules; print stylesheet for the full rules. Leave clearly marked
mount points / nav slots for: rule explainers (Prompt 2), Trials (Prompt 3), Studio
expansions (Prompt 4). Link the existing Trials companion and Spellbook Optimizer for now.

### F. Offline & performance
Service worker scoped to `web-apps/v2/` that precaches the player pages, data, fonts
and symbols. Budget: quick reference interactive in < 1.5 s on a mid-range phone on 3G,
< 150 KB transferred excluding fonts. No layout shift when fonts load.

## Process

1. Write `web-apps/v2/DESIGN_BRIEF.md` first (≤ 1 page): the IA you chose and why, page
   map, key interaction decisions. Then build. **Don't wait for approval.**
2. Build foundation (tokens, data, checker + test) → quick reference → full rules → landing.
3. Verify: run the equivalence test and `check-rules-data.mjs`; open each page at 375 px
   and 1280 px if you can render it, and check every deep link.
4. Write `web-apps/v2/REPORT_1.md`: what you built, file map, how to extend (adding a page,
   adding a rules version, adding a variant), the old→new link map, every rule conflict
   or stale fact you found (with file + line), things that need changing outside v2 (e.g.
   `meta/manifest.yml` note, board QR target), and what you'd do next.
