---
title: Rulebook v3.1 — Scoring & Economy Bump — Design
type: spec-design
spec: v3-1-scoring-economy
experiment: vnext-scoring-economy
updated: 2026-07-09
status: proposed
---

# Design — Rulebook v3.1 (Scoring & Economy)

## Approach

Apply the whole `vnext-scoring-economy` bundle as one version bump, v3.0 → v3.1, held
`under-test` pending a live playtest, with a byte-exact rollback to v3.0 guaranteed by the §3a
archive convention (not git). Propagate in the order **markdown → html → code/apps**. Close the
coupled decisions in the same pass.

The design below is the authoritative statement of the rules change; the numbers mirror
`meta/experiments/vnext-scoring-economy/proposed/score-table.json`.

## 1. Recognition Points table (v3.1)

| Size | Conjuration | Transfiguration | Perfect Transmutation |
|--:|--:|--:|--:|
| 3 | 0 | 3 | 5 |
| 4 | 1 | 4 | 11 |
| 5 | 2 | 5 | 18 |
| 6 | 3 | 7 | 24 |
| 7 | 7 | 8 | 31 |
| 8 | 13 | 10 | 39 |
| 9 | 20 | 13 | 47 |
| 10 | 29 | 16 | 56 |
| 11 | 38 | 20 | 65 |
| 12 | 50 | 25 | 74 |
| 13 | 63 | 31 | 85 |
| 14 | 79 | 38 | 97 |
| 15 | 100 | 48 | 100 |

Enchantment (sizes 3 / 4 / 5): **4 / 10 / 16**.

Invariants the table must keep: Conj-15 = PT-15 = 100 (identity); every column strictly increasing;
Conj-3 = 0 and every other spell ≥ 1. These are asserted by `assert_table_sane()` in `scoring_ev.py`.

## 2. Enchantment ladder & Unlimited Capacity removal

- Unlimited Capacity is **removed** from the game — no state, no marker, no "cast all", no "unlimited
  learning actions", no Recall skip.
- Ladder (cumulative counter totals) / score: **3-card +1 / 4; 4-card +3 / 10; 5-card +5 / 16.**
- 5-card remains 5–6p (Echo) only.
- Casting becomes "cast up to [capacity] spells" for everyone; the Recall step applies to all players.

## 3. RESHAPE

One learning action **per spell broken down** — breaking N spells costs N counters (was: any/all for
one action). Components redistribute into valid spells. Reducing an Enchantment via RESHAPE loses
capacity proportionally (see §4).

## 4. UNLEARN (partial + proportional capacity loss)

- UNLEARN returns **one or more** components from a **single** spell to hand; the remainder must stay
  a valid spell or the spell fully dissolves. Cost: 1 counter.
- Runs (TF/PT): a single-component step may only remove an **end** component.
- Enchantment capacity loss = difference of ladder totals: **5→4 = −2, 4→3 = −2, 3→dissolved = −1**;
  a full dissolve loses the whole grant.
- Returned components can't form new spells until next turn (unchanged).

## 5. Enchantment effect timing (F3)

- **Gains** (learn/empower an Enchantment): capacity available from the **start of your next turn**.
- **Losses** (reduce/dissolve an Enchantment): apply **immediately**.
- **Gate:** you may not perform the reduce/dissolve if you cannot pay the action cost (1) **and**
  absorb the immediate capacity loss from currently available counters.
- Worked example (for the rulebook): a player whose only Enchantment is a 4-card [8,8,8,8] has
  capacity 4 (1 start + 3). Fully dissolving it costs 1 action + 3 loss = 4 — possible only if no
  capacity has been spent this turn. Stepping it to a 3-card costs 1 action + 2 loss = 3, leaving a
  scoring 3-card Enchantment and +1 capacity.

## 6. EMPOWER conversion restriction

EMPOWER may extend a spell or convert among Conjuration / Transfiguration / Perfect Transmutation. It
**cannot** convert a spell into an Enchantment or an Enchantment into another type — those transitions
go through LEARN / UNLEARN. This removes the only EMPOWER path that would touch capacity, so F3 has no
EMPOWER interaction.

## 7. Reversibility (rules §3a) — the rollback design

Git is not relied on (ops time out in this OneDrive folder). Rollback is the §3a archive:

1. **Archive first, before any edit.** Copy each canon-bearing file byte-exact into
   `_archive/<basename>-v3.0-2026-07-09/` and add an index line to `_archive/README.md`. The archive
   set covers *every* changed file (rulebook, scoring reference, glossary, both html references, and
   the digital-build files), so the archive doubles as the experiment baseline (§4).
2. **Version stamp.** Bump `version:` front-matter to `v3.1` on the two `versioned_files`; set
   `canon.yml rulebook_version: v3.1`. Mark changed rule files `status: under-test`.
3. **Rollback procedure (documented in the decision file):** copy the `_archive` v3.0 copies back
   over the live files, reset `canon.yml rulebook_version: v3.0`, remove `under-test`, set the
   governing decision `reverted`. `check.mjs` then confirms versioned files == v3.0.

`_archive/` is gitignored by design — it is the local, byte-exact recovery store.

## 8. Propagation map (order: md → html → code/apps)

| Order | File | Change |
|--:|---|---|
| md 1 | `rulebook/Scoring System Reference.md` | full v3.1 table; enchantment 4/10/16; version → v3.1 |
| md 2 | `rulebook/Archmage Ascension - Complete Rulebook.md` | LEARN (enchant +1/+3/+5, scores), EMPOWER (conversion restriction), RESHAPE (per-spell), UNLEARN (partial + proportional), Casting ("cast up to N"), Recall (all players), Drought clause, capacity examples, F3 timing + example, remove UC; version → v3.1 |
| md 3 | `rulebook/GLOSSARY.md` | remove/replace "Unlimited Capacity"; update Magical Capacity, Enchantment, RESHAPE/UNLEARN entries |
| md 4 | `web-apps/archmage-ascension/RULES_SUMMARY.md` | mirror the rule changes |
| html 1 | `web-apps/archmage-reference.html` | score table, enchantment ladder, reshape/unlearn/empower, UC removal |
| html 2 | `web-apps/player-reference/player-reference.html` | same |
| code 1 | `web-apps/archmage-ascension/game/state.js` | score values; enchantment ladder; UC state removed; reshape/unlearn/empower logic |
| code 2 | `web-apps/archmage-ascension/game/*.jsx` (`app`, `play`, `spell-tableau`, `title`) | scoring/UC UI + logic |
| mirror | `simulation/scoring_ev.py` | `SCORE` dict + `assert_matches_canon()` anchors → v3.1 (checked canon mirror) |

Notes: `web-apps/archmage-ascension/uploads/*` are non-canon mirrors (excluded from vocab scan) — do
not treat as sources of truth. Printed cards / exports lag under the F14 hold.

## 9. Canon machinery deltas (`meta/canon.yml`)

- `rulebook_version: v3.0 → v3.1`.
- `enchantment_ladder:` rewrite to "3-card = +1 counter / score 4; 4-card = +3 counters / score 10;
  5-card = +5 counters / score 16 (Unlimited Capacity removed, v3.1); 5-card reachable 5–6p/Echo only".
- `retired_terms: Convergence` → `Convergence, Unlimited Capacity` (do this **last**, after every
  scanned occurrence is purged, so the checker verifies completeness).
- `versioned_files` unchanged in membership; both files bumped to v3.1.

## 10. Decision closures

- **New:** `meta/decisions/2026-07-09-v3-1-scoring-economy-bump.md` — status `experiment` (under-test)
  once execution begins (`proposed` while this spec is only planned), canon delta, propagation
  checklist, rollback procedure.
- **F3** `2026-07-06-f3-enchantment-timing.md`: record the "cannot afford → blocked" gate as chosen
  (supersedes the earlier "reduce remaining actions / last-action legal" principle); fold into v3.1.
- **F4:** superseded — 6/12/18 rationale void once UC is removed; v3.1 sets 4/10/16.
- **F6:** UC-5–6p-only clause superseded (no UC); max-size-15 and wild rulings stand.

## 11. Verification

- `node meta/checks/check.mjs` → no new flags: versioned files == v3.1, "Unlimited Capacity" absent
  from scanned content, no open propagation boxes on the governing decision.
- `python scoring_ev.py selfcheck` → passes with the v3.1 mirror (datum/anchor asserts updated).
- Manual: table identity (Conj-15 = PT-15 = 100), strictly-increasing columns, and a spot read of the
  rulebook UNLEARN/F3/EMPOWER sections against §4–§6 here.

## 12. Out of scope / non-goals

Deck structure, starting counters, max-size-15, wild rule (all v3.0). F1 (fixed as current counters).
F5 / Source-emptying (adjacent, confirm-only). Ascension Trials. Card/export regeneration (F14 hold).
Sim enchantment-uptake calibration and the reshape/counter balance (playtest questions).
