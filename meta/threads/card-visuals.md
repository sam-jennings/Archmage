---
thread: card-visuals
status: parked
updated: 2026-09-30
goal: Print-ready card set in the chosen visual system
next: Sam reads the card-face review (`card-design/incoming/2026-09-30-card-face-alternatives.html`) and decides whether to adopt the Arcana+ (A) reading-layer fixes in the renderer (queued P2; renderer only — F14 export hold on print/exports still stands). B vs D is a separate P3 table-read test.
hypothesis: n/a — design direction is decided; remaining work is production (now gated by F14 hold)
---

# Card visuals

## Where this stands

Primary design decided 2026-07-02: **arcana** procedural art + **beacon** connector.
`card-design/art/` and `card-design/connectors/` were pruned to only those;
`card-design/VISUAL_SYSTEM.md` is the source of truth. Non-primary variants archived.

Parked because: final art polish is deferred (Anti-Drift Rule 2) and card text
depends on the unresolved enchantment ladder tunables.

## 2026-09-30 — card-face review (reading layer)

Reviewed the live arcana + beacon faces and built four alternatives, all keeping the arcana
art and the value-as-height beacon idea: **A Arcana+** (fixes only), **B Instrument Rail**
(engraved rails + edge pointer + cartouche), **C Vellum Plate** (ink on light stock — breaks
the dark-base rule), **D Spine** (solid energy-coloured spine — breaks "colour lives in the
motif"). Comparison page with Spellbook/hand/Array scenes, across-the-table and upside-down
toggles, and colour-vision simulation: `card-design/incoming/2026-09-30-card-face-alternatives.html`
(also published as a private claude.ai artifact, "Card Face Alternatives").

Findings R1–R8: upside-down card shows wrong orb height (index is rotation-safe, beacon isn't);
second index hidden under the next card, so opponents can't read an overlapped Spellbook;
energy is colour-only once overlapped; Echo drawn in two greys, one ΔE00 4 from the wild;
Void `#c060f0` outside FOGRA39 (prints ΔE00 13 duller); 6/9 unmarked; wild value column on a
different pitch from normal cards; orb crowds the index at values 1–2.

Recommendation: adopt A now (renderer only), let players pick B vs D, park C.
- ACTION(queued): adopt Arcana+ fixes in the renderer — QUEUE P2.
- ACTION(queued): B vs D table-read test — QUEUE P3.

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
