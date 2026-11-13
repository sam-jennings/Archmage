---
title: Online playtesting via Screentop.gg — new screen-only export target
type: decision
date: 2026-07-19
status: superseded
---

> **SUPERSEDED 2026-07-20** by `2026-07-20-tabletopia-switch.md`: the online
> playtest platform is now Tabletopia. The asset-pack decisions here (screen-only
> export target, F14 print hold untouched, 2–4p scope, board stopgap patch) carry
> forward — only the platform choice is superseded. The Screentop table stays
> live as fallback until Tabletopia runs one clean session.

# 2026-07-19 — Online playtesting via Screentop.gg

Source: session 2026-07-19. Sam asked to prepare the game for online playtesting;
options weighed: Tabletopia, Tabletop Playground, Screentop.gg, independent build.

## Decision

- **Platform: Screentop.gg.** Free, browser-based, no install/purchase for testers —
  lowest barrier for stranger sessions. Aligns with `pitch/PLAYTEST_EVIDENCE_PLAN.md`
  (which already names a "Screentop 2–4p build") and
  `_review/STRANGER_EVIDENCE_PLAN_2026-07.md` venues (Protospiel Online, Break My Game).
  Rejected: Tabletopia (free tier = 1 game / 200MB, slower iteration, moderation queue),
  Tabletop Playground (paid Steam install per tester), independent multiplayer build
  (weeks of dev; the existing React build is 2p-local anyway).
- **Scope: 2–4p deck only** (62 cards) — serves the standing v3.1 confirm/kill P1.
- **Card faces: full arcana+beacon renders at screen resolution**, generated fresh from
  the canonical renderer sources (`card-design/lib/cards.js`, `connectors/beacon.js`,
  `art/arcana.js`, 2026-07-03 state, md5-verified copies). This is a **new screen-only
  export target** — the F14 hold (`2026-07-06-f14-export-hold.md`) on printenbind/cs3
  **print** regeneration is explicitly NOT lifted or weakened.
- **Board: stopgap patch.** The A3 board PDF predates v3.1 (old enchantment scores 6/15,
  retired "Opening" discard step, 1–20 / 84-card 5–7p setup, old score table). For the
  online pack the 150dpi raster got v3.1-correct Recognition Points and Set-up panels
  composited over the stale ones. Regenerating the PDF itself is queued (P2).
- Stale printed refs (`board/spell_ref.png`, `turn_ref.png`) deliberately excluded from
  the pack; online sessions use the board panels + the overhauled online reference.

## Canon delta

None — no vocabulary, version, or structural rule changes. Rulebook untouched.

## Propagation

- [x] `card-design/export-screentop/` created: cards/ (62+back), sheets/ (6),
  board/board-a3-150dpi-v31.png, tokens/counter.png, pipeline/ scripts, README,
  SCREENTOP_BUILD_GUIDE.md
- [x] `meta/QUEUE.md`: P1 "assemble Screentop table + schedule online confirm/kill"
  added; P2 "regenerate board PDF to v3.1" added
- [x] `meta/threads/capacity-economy.md`: campsite note — online route ready
