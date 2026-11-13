# Prompt 3 (Fable 5.2) — Ascension Trials companion rebuild

> Run after Prompt 1. Best run **after** Sam has picked a Trials candidate (C1 / C4 / other);
> if not, build candidate-agnostic as described. Paste everything below the line.

---

You are rebuilding the **Ascension Trials companion** for the tabletop card game Archmage
Ascension. Ascension Trials is the advanced end-of-game variant: players secretly allocate
the power of their final Spellbook across trials, reveal, and win Recognition Points per
trial. The companion does the arithmetic and keeps allocations secret until reveal.
This is a limited, expensive session: spend it on the state model, the rules-as-data design
and the table UX.

## Hard constraints

- **New files only**, under `web-apps/v2/trials/` (plus wiring into nav/precache in files the
  previous v2 session created). Do not touch `web-apps/trials-multiplayer.html`, `config.js`,
  or anything outside `web-apps/v2/`. No commit/push.
- No React, no Babel-in-browser, no unpkg. Plain ES modules on the v2 tokens/components.
  Firebase is allowed **only** for the networked mode, loaded lazily and only when that
  mode is chosen. Reuse the existing Firebase project config from `web-apps/trials-multiplayer.html`
  by reading it; do not commit new secrets.
- Do not choose the Trials rules. The rules are an open decision (F8).

## Reading list

- `web-apps/v2/REPORT_1.md`, `web-apps/v2/DESIGN_BRIEF.md`, `web-apps/v2/data/rules.v3.1.js`
- `rulebook/Ascension Trials.md` (status: working draft; note the 2026-07-06 warning)
- `meta/decisions/2026-07-06-f8-ascension-trials-reconcile.md`,
  `meta/decisions/2026-07-06-at-entry-model-secret-allocation.md`
- `ascension-trials/design-history/ASCENSION_TRIALS_07_CANDIDATE_SHORTLIST_2026-07-11.md`
  (and `_08_SHORTLIST_APPENDIX`), `ascension-trials/ascension_trials_model/README.md`
- `meta/threads/ascension-trials.md` (check whether a candidate has been chosen)
- The current app: `web-apps/trials-multiplayer.html` + `web-apps/config.js`. It works
  but has known problems: it compiles JSX in-browser, uses legacy earth/fire/water/air ids,
  has no Echo, and needs every player on their own networked phone.

## What to build

1. **Trials-as-data.** A ruleset module per candidate
   (`trials/rulesets/current-draft.js`, `c1-coherent-claim.js`, `c4-archspell-bold.js`, …)
   declaring trials, eligibility, power calculation, minimum claim, RP by player count,
   tiebreaks. The engine is generic; switching candidate is a dropdown in a host-only
   settings screen, and the chosen ruleset + version is shown on the results screen.
   If `ascension_trials_model` has a normative spec/fixtures, port its test cases into
   `web-apps/v2/trials/tests/` and make the JS engine pass them for each ruleset.
2. **Two modes, same engine:**
   - **Pass-and-play** (default, offline): one phone goes round the table. Each player
     enters their Spellbook (reuse the shared hand checker / spell entry patterns so a
     spell is entered as card chips and validated), then allocates on a privacy screen
     ("hand to Sam → tap to reveal → allocate → hide"). Simultaneous reveal at the end.
   - **Networked** (optional): each player on their own phone, QR join, as today.
3. **Intuitive flow.** The current app's weak point is that players don't know what an
   allocation choice *means*. At the allocation step, show live what each choice wins or
   risks given what's public, using plain language and the trial definitions from the
   ruleset. Make undo easy until lock-in; make lock-in deliberate.
4. **Player counts 2–6**, Echo as an energy domain at 5–6p, no legacy element names.
5. Mobile first, laptop-friendly host view (a "table display" mode for a shared screen is
   welcome if cheap).

## Process

Write `web-apps/v2/trials/BRIEF.md` (≤ 1 page: state model, mode design, open-rule
handling) → build → run the ported model tests → `web-apps/v2/REPORT_3.md` with: rulesets
implemented and any spec gaps or contradictions found between the rulebook and the
candidates, what the old app did that v2 deliberately doesn't, and how to add a new ruleset.
