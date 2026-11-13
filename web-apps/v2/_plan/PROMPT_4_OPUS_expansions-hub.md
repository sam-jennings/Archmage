# Prompt 4 (Opus or Sonnet) — Expansions hub (designer area)

> Run after Prompt 1. A cheaper model is fine here. Paste everything below the line.

---

Build a designer-only **expansions hub** for Archmage Ascension inside the v2 site, so Sam
can read his expansion designs on phone or laptop instead of opening markdown files.

## Constraints

- New files only, under `web-apps/v2/studio/` (plus a "Studio" nav link in files the previous
  v2 session created). Nothing outside `web-apps/v2/`. No commit/push.
- Use the v2 tokens and components (read `web-apps/v2/REPORT_1.md` and `DESIGN_BRIEF.md`).
- **Privacy:** GitHub Pages deploys the whole repo. Every studio page gets
  `<meta name="robots" content="noindex,nofollow">`, isn't linked from the player landing
  except through the quiet Studio entry, and carries a visible "Designer notes · draft ·
  not rules" banner. In the report, tell Sam plainly what is publicly reachable if the repo
  is public, and the option of keeping studio output local-only.

## Build

1. `web-apps/v2/tools/build-studio.mjs`: a node script (no network; vendor a small
   markdown parser into `web-apps/v2/tools/vendor/` or write a minimal one) that reads
   `expansion/**/*.md` **read-only** and generates one page per module plus an index into
   `web-apps/v2/studio/expansions/`. Re-runnable: Sam runs it after editing a markdown file.
   Ignore `old-expansion-thread.md` (historical) and anything in `source/` subfolders except
   as linked "source material".
2. Index page: one card per module with status (from front-matter / `EXPANSION_INDEX.md`:
   locked-in, v0.1 ruleset, concept, parked), player counts, one-line pitch, last-updated,
   and which base-rules version it was written against. Highlight the **combination
   governance rules** from `EXPANSION_INDEX.md` at the top: they apply to every module.
3. Module pages: readable long-form layout, sticky table of contents, collapsible
   iteration logs, tables that scroll on phone, energy names rendered with the real
   symbols, and a "rules this module touches" strip linking into the v2 full rules ids.
4. Flag (don't fix) stale vocabulary found in expansion docs against `meta/canon.yml`
   retired terms, in a generated `studio/expansions/LINT.md`.

Also produce `web-apps/v2/REPORT_4.md`: how to regenerate, what's public, lint findings.
