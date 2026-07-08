---
thread: card-visuals
status: parked
updated: 2026-07-06
goal: Print-ready card set in the chosen visual system
next: HOLD on export/print regeneration (F14, decided 2026-07-06) — do NOT regenerate printenbind/cs3 or print; the existing 5×20 + 4 P&B deck stays a flexible prototype (pull cards per test). Export regen "go" needs F1 + F2 closed. See meta/decisions/2026-07-06-f14-export-hold.md
hypothesis: n/a — design direction is decided; remaining work is production (now gated by F14 hold)
---

# Card visuals

## Where this stands

Primary design decided 2026-07-02: **arcana** procedural art + **beacon** connector.
`card-design/art/` and `card-design/connectors/` were pruned to only those;
`card-design/VISUAL_SYSTEM.md` is the source of truth. Non-primary variants archived.

Parked because: final art polish is deferred (Anti-Drift Rule 2) and card text
depends on the unresolved enchantment ladder tunables.

## Context needed to resume

- Renderer: `card-design/playtable.html` (+ mobile variant); tokens in
  `card-design/lib/`.
- Print pipeline: `card-design/export-printenbind/` (final bundles),
  `card-design/printenbind/` (session working files). Specs: 62×88mm, 0.705 ratio,
  bleed/margin/resolution rules — see printenbind constraints.
- Resolved 2026-07-03: the "Convergence" purge is done in all live source
  (renderer, arcana.js, tokens.css, VISUAL_SYSTEM.md; stray `arcana - Copy.js`
  archived to `_archive/card-design-art/`). The enchantment ladder is now locked
  (3=+1, 4=+3, 5=UC). Only the generated exports still carry old vocabulary —
  regenerating them **is on hold (F14, 2026-07-06)**: no export/print regeneration
  until F1 + F2 close; the oversized P&B deck serves as the prototype meanwhile.
- Open P3 decision: promote `_review/VISUAL_SYSTEM_with_Echo.md` to canon or drop.
- Reference-card legibility redesign is NOT parked — it lives in the
  rules-and-teaching thread as a P1.
