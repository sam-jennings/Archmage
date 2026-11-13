# Prompt 2 (Fable 5.2) — Interactive rule explainers

> Run after Prompt 1 has finished. Paste everything below the line into a Fable 5.2 session
> with the Archmage Ascension folder connected.

---

You are adding interactive rule explainers to the v2 player site of the tabletop card game
**Archmage Ascension**, built in a previous session under `web-apps/v2/`. This is a
limited, expensive session: spend it on choosing the right rules, modelling them exactly
and designing interactions that actually teach.

## Hard constraints

- Same constraints as the previous session (read `web-apps/v2/REPORT_1.md` and
  `web-apps/v2/DESIGN_BRIEF.md` first): **new files only**. You may create files under
  `web-apps/v2/` and edit **only files that the previous session created inside
  `web-apps/v2/`**, and only to wire in mount points/nav. Nothing outside `web-apps/v2/`.
  No commit/push. No frameworks or CDNs. Use the existing tokens, components, and
  `data/rules.*.js`. Every number comes from the rules-data module, not from your code.
- Never change rules. If modelling a rule shows it is ambiguous or contradictory, that is a
  **finding**: report it and show the ambiguity honestly in the explainer rather than
  picking an interpretation silently.

## Reading list

- `web-apps/v2/REPORT_1.md`, `web-apps/v2/DESIGN_BRIEF.md`, `web-apps/v2/data/rules.v3.1.js`
- `meta/canon.yml`, `rulebook/Archmage Ascension - Complete Rulebook.md`
- `playtests/*.md`: the evidence of what confuses people
- `meta/QUEUE.md`: P1 items tagged `[rules]` / `thread:rules-and-teaching`
- `_review/FR_6P_SESSION_2026-08/` (the teaching-test materials, plus results if a session file
  for it exists in `playtests/`)
- `meta/decisions/2026-07-06-*` (F3 enchantment timing, F5 game end, F6 wilds/max size,
  source-emptying timing) and `2026-07-17-array-attunement-tf-gate.md`

## Step 1 — choose (don't just take this list)

Rank candidate rules by (how often players get it wrong, per the evidence) × (how much
a visual/interactive model beats prose). Known candidates:

- **Counters & capacity across a turn**: the counter refresh / recall rule. A P1 says a
  player couldn't understand it from card or board even after verbal explanation.
- **Enchantment capacity timing**: gains apply next turn, losses apply immediately (and
  must be absorbable now).
- **Reshape** under v3.1 (and what "every component must end up in a valid spell" means).
- **Wild declaration**: declared energy + value, fixed while the spell exists, redeclared only
  on rebuild; Empower does not redeclare.
- **The Drought**: the Source emptying, the Released Reserve, Drought turns, why casting stops, how the game ends.
- **The Array / the Opening / Collection choices.**
- **Spell types at a glance**: Conjuration vs Transfiguration vs Enchantment vs Perfect
  Transmutation, incl. max size 15 and the 5-card Enchantment being 5–6p only.

Pick the **4–6** that earn it and say why in `web-apps/v2/learn/EXPLAINERS_BRIEF.md`.
If a candidate is better served by a static diagram or a worked example, use that and
skip the interaction.

## Step 2 — build

For each explainer:
- A small, self-contained module under `web-apps/v2/learn/` that renders into a mount
  point and can be embedded both in the full rules (next to the rule it explains) and in
  the quick reference (behind a "show me" disclosure).
- Interactions players can do with a thumb: step through a turn, drag/tap components,
  scrub a timeline. Each one should have one clear "aha" and a reset. Use a short
  caption in plain words at every step, taken from the rulebook wording.
- Real card chips with the real energy symbols. State lives in plain JS; the logic that
  decides legality comes from the shared hand checker / rules data, never re-implemented.
- Works without animation (`prefers-reduced-motion`) and with a screen reader (text
  equivalent of each state). Offline via the existing service worker (add to its precache).
- Respects player count where rules differ (2–4p vs 5–6p).

Write a node test per explainer that walks its state machine through the canonical
example and asserts the rule outcomes match the rules-data module.

## Step 3 — report

`web-apps/v2/REPORT_2.md`: which explainers and why, what you rejected, any rule
ambiguities the modelling exposed (with rulebook line references and the playtest
evidence), and a 3-question check Sam can use at the next playtest to see if each explainer
worked (e.g. "after viewing, can a new player predict their capacity next turn?").
