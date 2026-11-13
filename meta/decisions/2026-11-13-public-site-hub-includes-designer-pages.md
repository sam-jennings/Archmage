---
title: Public site hub links everything, designer material in its own section
type: decision
date: 2026-11-13
status: canon
---

# 2026-11-13 - Site hub links everything; designer pages in a "Designer workshop" section

Source: session 2026-11-13. Sam approved making the GitHub Pages landing page
(`index.html`, repo root) link to everything browsable on the site, explicitly
including the classic rule pages, the v2 player site (`web-apps/v2/`) and the v2
Studio (`web-apps/v2/studio/`).

## Decision

- `index.html` is the full site map, in this order: Start here (v2 Learn / Play /
  Rules, v3.1), Rules & reference (classic pages + rulebook Markdown), Play
  (Screentop table, board PDF, digital preview), Variants & expansions (in
  development), Older rule versions (v2.8 archive, labelled not current), and
  **Designer workshop** (Studio, card renderers, `_review/` kit, `tools/` page,
  pitch sheet), introduced as "design in progress, not rules".
- Designer material is published **on purpose**. This amends the convention that
  designer-only tools never appear in player-facing material: they stay out of the
  player sections and out of printed material, and appear on the hub only in the
  Designer workshop section. The v2 footer link to Studio stays.
- Tabletopia is on hold and not linked; the Vite entry
  (`web-apps/archmage-ascension/index.html`) is not linked because the Pages workflow
  has no build step (the in-browser-Babel `Archmage Ascension.html` works as-is and is
  linked instead).

Why: Sam wants one place where a new player sees what to open first and where
collaborators can still reach the working files.

## Canon delta

None (no rules, terms or versions change).

## Propagation

- [x] `index.html` rewritten as the full site hub (sections above).
- [x] `.kiro/steering/structure.md`: designer-only line amended (player sections /
      printed material; hub lists them under Designer workshop).
- [x] `.kiro/steering/product.md`: same amendment.
- [x] `meta/QUEUE.md`: P2 "web-apps/v2 Studio + dev tools are public" moved to
      Archive with a pointer here; its `serve.mjs` loopback-bind sub-item split out
      as its own P2.
- [x] `meta/manifest.yml`: no change needed (only this decision file is new; the
      decisions folder is declared by pattern).
- [x] `meta/QUEUE.md`: P3 added - the co-op concept's name collides with a retired
      term, so the hub labels it by description instead.
