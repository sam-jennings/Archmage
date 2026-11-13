---
title: Web rebuild v2 — plan and model allocation
type: plan
status: draft
created: 2026-11-11
output_folder: web-apps/v2/   (new files only — nothing in web-apps/ or index.html is edited)
---

# Web rebuild v2 — plan

Planning only. Nothing is built yet. The prompts in this folder do the building.

## 1. Where things stand (so no agent has to rediscover it)

| Surface | File | State |
|---|---|---|
| Landing | `index.html` | Clean dark/gold cards, "when to use which" lines. Says **2–7 players** (canon is 2–4 base, 5–6 with Echo). Links the parked interactive game and pitch sheet next to player tools. |
| Online Rules | `web-apps/archmage-reference.html` (96 KB, one file) | Board-order tabs (#set-up #spells #normal-turn #drought-turn #recognition-points #ascension-trials). Score table already v3.1 (Conj15 = PT15 = 100). Hand checker + score calculator inline. Only 4 media queries. Trials section mentions 6–7 players. |
| Quick Reference Card | `web-apps/player-reference/player-reference.html` (38 KB) | Phone-first, framework-free, Start · Spells · Your Turn · Scoring. Has its own copy of a hand checker. Deep-links into Online Rules ids. |
| Trials companion | `web-apps/trials-multiplayer.html` (73 KB) + `config.js` | React 18 + **Babel standalone from unpkg** (compiles JSX in the phone's browser, several MB) + Firebase realtime DB + QR join. Phases setup → spell entry → allocation → voting → results. Legacy `earth/fire/water/air` ids. No Echo. Rules it implements are **F8-pending** (candidates C1 "Coherent Claim" / C4 "Archspell Bold" in `ascension-trials/design-history/ASCENSION_TRIALS_07_…`). |
| Spellbook Optimizer | `web-apps/spellbook-optimizer.html` | Post-game analysis tool. Fine as is; just needs to sit in the new nav. |
| Tokens | `web-apps/archmage-tokens.css` (+ `archmage-theme.css` alias) | Single `--ax-*` layer. Google Fonts import (Cinzel + Cormorant Garamond) — needs network. |
| Tests | `web-apps/tests/hand-checker/` | Golden-master + property tests that **extract the hand checker from archmage-reference.html by a string marker**. |
| Deploy | `.github/workflows/deploy-pages.yml` | Publishes the **whole repo root** to GitHub Pages on push to main. |

Rules status that the site must survive changing:
- Rulebook **v3.1 is applied but under test** (confirm/kill playtest pending). A byte-exact v3.0 rollback exists.
- **Array Attunement** variant decided but not applied.
- **Ascension Trials** reconciliation (F8) open; candidate shortlist exists.
- Title rename to **Arcane Drought** decided, propagation deferred.
- 5–6p **Echo** deck under test.

## 2. Your list, plus what else stands out

Your goals: intuitive wayfinding · calm visuals · interactive explainers for hard rules · better Trials companion · expansion sections · laptop + mobile.

Things I'd add:

1. **Rules churn is the real risk.** v3.1 could be killed, Trials could change shape, the title will change. If rules text and numbers are hand-written into HTML (as now), every decision means re-editing several pages, and they drift. The rebuild should put every number, table and short rule string in **one rules-data file with a version stamp**. Pages render from it, and a check script compares it to the rulebook / Scoring System Reference. This is what makes the expensive rebuild last. It's the main thing Prompt 1 asks Fable for.
2. **There are two hand checkers.** One is in Online Rules (the tested one), the other is a copy in the QRC. v2 should have one shared module, verified against the existing golden-master snapshot.
3. **The Trials companion has the biggest mobile performance problem.** Babel standalone compiles JSX in the browser on every load. It also needs every player on their own phone with Firebase. A **pass-and-play mode** (one phone passed round, hidden allocation screens) would be more robust at a table with bad signal.
4. **Expansion pages would be public.** Pages deploys the whole repo. If the repo is public, anything under `web-apps/v2/` (and already `expansion/*.md`) can be reached by anyone with the URL. The expansions hub should be a designer area: unlinked from the player landing, `noindex`, clearly labelled draft. Or keep it local-only if you'd rather unpublished designs weren't one link away.
5. **Offline.** At a friend's table with no signal, the card and rules should still load: self-hosted fonts, a service worker, no CDNs.
6. **Stale player-facing facts.** "2–7 players", "6–7 player" Trials tables, no Echo/5–6p setup anywhere player-facing. Show the version on the page too ("Rules v3.1 · under test") so playtesters know what they're reading.
7. **Ready for French without translating now.** The FR teaching test produced a separate hand-made FR reference. Putting UI strings in a table now makes a later `?lang=fr` cheap. Fable shouldn't translate anything.
8. **Separate players from the designer.** The landing currently mixes player tools with the parked game, the pitch sheet and analysis. In v2, players see Play / Learn / Look up, and designer things go behind one quiet "Studio" link.

**Timing (one-time heads-up):** the standing P1 says the printed reference card redesign should follow the tier-1/tier-2 intervention tallies from the six-player French test. No playtest has been logged since 2026-07-06. The QRC is the digital version of that card. The two ways to handle it: (a) run Fable now and treat the result as a hypothesis the FR session tests, or (b) run the FR session first and hand its tallies to Prompt 1 as evidence. (b) gets more from one Fable run. (a) gets you a better tool for the session itself. Your call.

## 3. Spending Fable where it pays

Fable is worth it for **judgment-heavy, cross-cutting design work**: reading rules accurately, turning them into a coherent information architecture, and designing interactions for rules people misunderstand. The mechanical work below doesn't need it: rendering markdown, offline/perf plumbing, audits and verification.

| # | Prompt | Model | Why that model | Depends on |
|---|---|---|---|---|
| 1 | Foundation + player site (IA, design system, rules-data layer, shared hand checker, QRC + Online Rules + landing rebuilt) | **Fable 5.2** | Highest leverage: every later page inherits its structure, tokens and data model. Needs whole-game understanding. | — |
| 2 | Interactive rule explainers | **Fable 5.2** | Has to find what actually confuses players (playtest logs) and model rules exactly right in interactive form. Small errors here teach wrong rules. | 1 |
| 3 | Ascension Trials companion rebuild | **Fable 5.2** | Hidden-information multi-device state plus unsettled rules: it has to be built so the trial candidates are data. | 1 |
| 4 | Expansions hub | Opus / Sonnet | Mostly a markdown → page build script plus status badges using Prompt 1's tokens. | 1 |
| 5 | QA + verification (rules accuracy, mobile perf, a11y, tests) | Opus, fresh session | A separate agent that didn't build it checks it. | 1–4 |

**If you only get two Fable runs:** do 1 and 2. Do 3 after you pick a Trials candidate (C1/C4). Until then it's building against a moving target, and Opus can do the rebuild once the rules settle, following the patterns from 1.

**Keeping each Fable run efficient:** every prompt gives an exact reading list and the facts above, so Fable doesn't spend its budget exploring the repo. It writes a one-page design brief first and then builds without waiting for approval.

## 4. Output layout (all new)

```
web-apps/v2/
  _plan/            ← this plan + prompts
  index.html        ← new landing (Prompt 1)
  assets/           ← tokens.css, fonts/, icons, shared JS modules
  data/rules.v3.1.js (+ strings.en.js)  ← single rules-data source
  play/ | rules/ | …  ← Fable decides the IA
  learn/            ← explainers (Prompt 2)
  trials/           ← companion (Prompt 3)
  studio/expansions/ ← designer hub (Prompt 4)
  tests/            ← new tests, incl. golden-master equivalence for the shared hand checker
  tools/check-rules-data.mjs
  REPORT_*.md       ← one per prompt
```

Live preview after a push: `<pages-url>/web-apps/v2/`. The old pages stay exactly where they are, so you can compare them side by side. When you're happy, swapping v2 in is a separate decision.

Not in scope: the parked interactive game (`web-apps/archmage-ascension/`), the board PDF, the rulebook, and anything in `meta/`. Agents report needed `meta/` updates and don't make them.
