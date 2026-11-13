---
title: Online playtest platform switch — Screentop.gg → Tabletopia
type: decision
date: 2026-07-20
status: canon
---

# 2026-07-20 — Switch online playtest platform to Tabletopia

Source: session 2026-07-20. Sam asked to set the game up on Tabletopia and,
when reminded the Screentop table (`@samjennings/Arcane-Drought`, built
2026-07-20) was already fully assembled, confirmed **"Switch to Tabletopia"**
(replace Screentop as the online playtest platform). Rationale not stated in
session; recorded as Sam's call.

## Decision

- **Platform: Tabletopia** replaces Screentop.gg as the venue for the v3.1
  confirm/kill playtest and subsequent online sessions. This supersedes the
  *platform* choice in `2026-07-19-screentop-online-playtest.md`; that
  decision's other content (screen-only export target, F14 print hold NOT
  weakened, 2–4p / 62-card scope, board stopgap patch) carries forward
  unchanged.
- **Known tradeoffs, accepted** (the 2026-07-19 file rejected Tabletopia for
  these): free Basic plan = 1 game, 2 setups, 200 MB storage; publishing to
  the public catalog goes through a moderation queue (private room links do
  not); iteration is slower than Screentop's editor.
- **Assets: derived from the existing export pack**, not regenerated.
  Tabletopia needs individual card files (no spritesheets) — the pack's
  `cards/` PNGs (600×852 = 60×85 mm at Tabletopia's 10 px/mm) are used
  directly, converted to JPEG to stay under the ~20 MB recommended setup
  size. Board PNG (2481×1754, v3.1-patched) set to 420×297 mm via scaling.
  Same renderer provenance as the Screentop pack; F14 untouched.
- **The Screentop table is left in place** (not deleted) as a fallback until
  the Tabletopia table has run at least one clean session.

## Canon delta

None — no vocabulary, version, or structural rule changes.

## Propagation

- [x] `card-design/export-tabletopia/` created: cards-jpg/ (62+back, JPEG q88,
  3.5 MB total), board, token, README (+ build guide after the build)
- [x] `meta/manifest.yml`: no change needed — manifest enumerates top-level
  folders only and `card-design/` is already declared
- [x] `2026-07-19-screentop-online-playtest.md`: status → superseded, pointer
  added
- [x] `meta/QUEUE.md`: P1 confirm/kill item retargeted Screentop → Tabletopia
- [x] `meta/threads/capacity-economy.md`: campsite update (platform switch,
  table state)
- [ ] Tabletopia scene assembled and SAVED (board, 62-card deck on Source
  shuffled face-down, 20-counter supply; Array deal optional) — **manual step
  for Sam**, ~10 min per `card-design/export-tabletopia/TABLETOPIA_BUILD_GUIDE.md`.
  Game/objects/setup-shell already created in the workshop (2026-07-20).
  Then verify via the setup's Objects Usage tab (every card ×1, counter ×20).
