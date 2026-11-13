---
title: Web rebuild v2 - report 4 (expansions hub)
type: report
created: 2026-11-13
rules: v3.1 (under test)
---

# Report 4 - expansions hub

Built a static designer reading area using the existing Arcane Drought v2 tokens,
fonts, components and canonical energy-symbol SVGs. No dependencies or network are
needed to regenerate. Expansion Markdown and canon are read-only inputs.

## Deliverables

- `tools/build-studio.mjs`: generates `studio/expansions/` from `expansion/**/*.md`.
- `tools/studio-markdown.mjs`: small Markdown renderer; escapes raw HTML and rejects
  unsafe link schemes. Supports nested lists, tables, quotes, fenced code,
  emphasis, ordinary links, Obsidian links and stable heading IDs.
- `studio/studio.css` and `studio/studio.js`: responsive reading layout, sticky
  collapsible contents, collapsible iteration logs, table scroll regions,
  daylight/dark preference, deep links into closed iteration logs and print support.
- Thirteen module cards and thirteen individual module pages, four supporting
  document pages, the hub index, browser-readable lint, `LINT.md` and `catalog.json`.
- `studio/build-studio.test.mjs`: focused renderer, source-integrity, repeatability,
  privacy, metadata and generated-link checks.
- Two small changes to the existing `assets/js/pages.js`: the Studio draft banner
  and a quiet expansions-hub link in its existing expansion slot. Player navigation
  and the player landing are unchanged.

Ascension Trials has its own Studio overview linking the existing versioned
companion; the generator does not select a Trials rules candidate. The Living
Array, The Conclave, The Overtones and The Convergence get individual pages
extracted from their overview sections. Full overview documents remain available
as supporting context. Eight other designs render their full source documents.

`old-expansion-thread.md` is excluded from rendering, the catalog and lint, and
links to that historical brainstorm are suppressed. Three files under `source/`
are linked as source material on the reconciled Duels page, and linted for context;
they do not become module pages or cards. The separate old-thread *review* is
included as supporting context.

The five combination-governance rules are rendered directly from
`EXPANSION_INDEX.md` above the cards. The compatibility rule and its count-gated
exceptions are explained beside them. The heading and all five rules must exist
for a useful index; a missing governance block makes regeneration fail.

## Regenerate and preview

From the repository root, using the installed Node.js:

```powershell
node web-apps/v2/tools/build-studio.mjs
node --test web-apps/v2/studio/build-studio.test.mjs
node web-apps/v2/tools/serve.mjs
```

Open `http://localhost:8080/web-apps/v2/studio/expansions/`. Regenerate after editing
an expansion document. There is no package installation, bundler or hosted parser.
New Markdown documents outside `source/` are discovered automatically. A new
document containing several separate module concepts needs another entry in the
small `bundled` list so it can have separate cards and pages.

All design text and links are built into HTML. JavaScript only improves theme,
contents and disclosure behavior. The generated pages themselves can also be
read from local HTML files; the existing player pages still need the preview
server for their ES modules. The existing service worker is untouched and does
not precache the new Studio pages: offline access on a phone is not guaranteed.

The builder writes only under `studio/expansions/`. `.generated.json` records its
own outputs; reruns remove obsolete outputs from that list without clearing
handwritten files. Regenerating does not change the hand-authored report or nav.

## Status, dates and base versions

Only Ascension Trials is labelled locked-in, per the index. Seven designs with
v0.1 in their front matter, title or index section are labelled v0.1 ruleset.
Spell Duels is a concept with a detailed, tiered rules draft, rather than a
fabricated v0.1 release. Parked status is supported where the source declares it.
The index's own parked status does not park every module. Original status remains
visible on each document page.

None of the twelve full design documents declares a base-rules version. They
therefore say **Not declared**, alongside the current canon version **v3.1**.
A tuning gate mentioning v3.1 does not certify that a document was written against
v3.1. The four extracted concept pages inherit that same uncertainty; the Trials
overview says the index does not declare a version. No expansion compatibility
claim has been invented.

“Last updated” uses the latest recorded ISO date in front matter, the document or
its corresponding index section, and is labelled accordingly. It does not use
OneDrive modification time. Metadata cannot detect an undated edit. Player counts
use explicit count gates where present; defaults are visibly attributed to the
index's 2-4 / 5-6 compatibility rule. The legacy interaction sketches retain their
2-7 counts with a warning to check the current deck.

The “rules this module touches” strip links to existing v2 full-rule IDs, selected
by vocabulary in each design. Its label explicitly says these are suggested
touchpoints, not a verified list of amendments.

## Vocabulary lint

`studio/expansions/LINT.md` scans sixteen Markdown inputs, including the index and
three linked source-material files. It flags **40 occurrences on 34 source lines**
of `Convergence` and `Unlimited Capacity`, read from `meta/canon.yml`. It includes
the exact original filename, original line number, term, count and context.

Most matches concern the co-op concept named The Convergence, its cross-module
references, or historical comparisons. These are review flags, not automatic
replacement instructions. Source text is preserved, including retired vocabulary.
The full lint report has a browser-readable companion, `lint.html`.

Because rendered designs intentionally retain these terms, the project's broad
vocabulary checker may report additional generated Studio matches. This task
does not change canon, checker exclusions or expansion rules to suppress them.

## Public reachability

**This is publicly reachable if deployed to a public GitHub Pages site. There is
no authentication or access control.** Anyone with the URL can read the generated
pages, catalog, lint, original expansion Markdown, and linked source material.
The whole-repository deployment also exposes reports and build tools. The
existing source Markdown is already exposed by that deployment.

Every generated HTML page has `noindex,nofollow` and a visible **Designer notes ·
draft · not rules** banner. The existing Studio entry retains its robots directive
and gets the same visible banner. The player landing only exposes the existing
quiet Studio footer entry. These measures separate audiences and request search
exclusion; they do not make the designs private.

**Local-only option:** keep the generated Studio files and Studio link out of
commits/pushes and use the local preview server. That avoids publishing the new
reading area, but does not remove expansion source already in the public repo.
Keeping the designs themselves private requires excluding their source and
generated output from deployment or using private, authenticated hosting. No
deployment configuration has been changed by this task.

## Verification and limits

Seven focused Node tests pass. They exercise hostile markup/URLs, nested markup,
table accessibility, stable unique heading IDs, iteration-log boundaries,
version uncertainty and exact vocabulary-match semantics. Real-source integration
checks hash expansion files before/after generation, compare two builds byte for
byte, and verify every generated HTML page's banner, robots directive, single h1,
unique IDs, local file links and generated fragment targets. No expansion sources
are changed and source-only/historical pages are absent.

Browser verification was attempted but this session denies local browser socket
connections; a headless local-file render also produced no screenshot. Therefore
mobile appearance, live theme/disclosure interactions, runtime-rendered full-rule
anchors and screen-reader behavior are not claimed as visually verified here.
The existing full-rules IDs were checked against the foundation's documented IDs.

No commit or push was made. The OneDrive project directory is outside this
session's write permissions, and the write was automatically rejected. This work
was built and tested in a separate writable copy. The accompanying installer
preflights the original input hashes and changed-file hashes, refuses conflicting
edits, and applies only files under `web-apps/v2/`. The original project is
unchanged until that installer is run by the user or the changes are copied in.
