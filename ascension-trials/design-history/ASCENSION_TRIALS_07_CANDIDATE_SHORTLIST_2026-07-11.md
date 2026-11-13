---
title: Ascension Trials — Candidate Configurations (Stages 0–5 executed)
type: design-proposal
date: 2026-07-11
status: for-decision — pick candidates to playtest
relates_to:
  - "ascension-trials/design-history/ASCENSION_TRIALS_06_CONFIG_SELECTION_PLAN_2026-07-11.md (the plan this executes)"
  - "ascension-trials/design-history/ASCENSION_TRIALS_03_HYBRID_REBUILD_CRITIQUE_2026-07-06.md"
  - "ascension-trials/ascension_trials_model/ (VS1+VS2+VS2-C approved; VS3 oracles used read-only)"
purpose: Stages 0–5 of the selection plan, executed. Evidence-labelled findings, then four named candidate configurations with playtest kits. No canon changes; no model source touched (all screening ran in scratch harnesses on top of the committed package).
---

# Candidate Shortlist — with the screening evidence

## 0. What was run (all seeded, reproducible)

- **Stage 0–1:** V2_1 provisional targets adopted as yardsticks; skeleton frozen
  (2n−3, Enchantment 4/8/12, PT double-domain + held nerf trigger, gated Wild,
  local tiebreak family per review 04 R-7(a) + fixture A7, coherency rules below).
- **Stage 3 (2p exact, VS2/VS2-C machinery):** parity screening on two state
  families — Z1: one fungible domain, budget 10–12, trials worth 8/7/6 (realistic
  scale, tests floors); Z2: domain-locked energy+transformation states with
  Purity/Mastery/Focused/Universal semantics, small budgets (tests structure,
  Wild, Champion's Mark). Mark screened as an exact extended-matrix overlay
  (allocation × marked trial), built from the committed matrix module's award
  signatures — no source modified.
- **Stage 4 (realistic sampler):** 4,000 books per count from declared assumptions
  (spell counts 3–6, type mix 45/25/20/10 conj/transf/ench/PT, sizes 3–8; **assumptions
  are provisional until checked against session-log books**).
- **Stage 5 (multiplayer, S1 populations):** 150–250 seeded tables per (count,
  floor) on the committed `hybrid_rebuild.json` with floors patched in-memory;
  4–5 heuristic agent kinds; exact-given-profile resolver throughout.

Evidence classes: Stage 3 = exact exhaustive + numerical LP; Stage 4/5 = sampled,
agent- and assumption-conditional. Nothing below mixes them silently.

## 1. Findings that drove the shortlist

**F1 — Printed-RP Minimum Claim is a 2p catastrophe (exact).** At realistic
per-domain budgets (10–12), floors of 7–8 make multi-entry impossible; the game
collapses to R = 1 with full concentration unbeatable (the T3 turtle, reproduced:
budget 12 → unbeaten (12,0,0), equilibrium tie rate ≈ 100%). The file-03 "floor =
printed RP" idea **fails counterability outright at 2p** and (sampled) locks ~62%
of books out of Enchantment Mastery entirely. Rejected at all counts.

**F2 — Floor gradient at 2p parity (exact, fungible budget 10):**

| floor | c1 | eq-tie rate | support | norm. entropy | margin-VOI |
|---|---|---|---|---|---|
| none | ✓ | 3.2% | 34 | ~0.62 | 8.4 |
| 3 | ✓ | 10.3% | 11 | 0.54 | 8.0 |
| 5 | ✓ | 33% | 3 | 0.36 | 2.7 |
| printed RP | ✗ turtle | ~100% | 1 | 0.0 | 0 |

Higher floors quantize entries → more collisions → more ties, less depth. Only
the ≤5% tie yardstick is met by floor-none.

**F3 — Squatting is real at 3p+ (sampled).** With no floor, 8–10% of all trial
awards across 3–6p are uncontested claims of ≤2 power. A flat floor of 3 blocks
every one of those by construction; floor 5 also blocks them but pays F2's price
at 2p and raises Enchantment-Mastery dead rates (6%→16% at 5p).

**F4 — Wild Magic is the 2p counterability mechanism, not a garnish (exact).**
At domain-locked mirrors (energy+transformation, disjoint home trials), the
"dump each domain into its home" allocation is **strictly unbeatable** with zero
Wild — c1 fails structurally, because shared-full mirrors tie and any diversion
loses more than it gains. Adding a single Wild point restores c1 (R jumps 96 →
196, no unbeaten strategies). Sampled: **42% of realistic books have zero Wild.**
This motivates a new one-line rule worth testing: *every player receives +1
baseline Wild Magic at the Trials* (existing Wild stacks on top).

**F5 — Champion's Mark deepens but does not repair (exact overlay).** On the
fungible state: margin-VOI 8.4 → 12.3, ties and support unchanged. On the locked
mirror without Wild: the home-dump remains unbeatable (marking your own home
trial keeps the +4). So the Mark is a genuine hidden-value spice at 2p, but Wild
(F4) is the structural fix; they are complements, not substitutes.

**F6 — TM/EM repricing (8→7) is gate-neutral at screening scale (exact, small).**
No structural change; it is a cross-trial pricing judgement — file-03's arguments
stand, playtests decide. Adopted in the recommended candidate, kept at 8 in the
conservative one.

**F7 — 6p second place is borderline, as suspected (sampled).** 41–52% of
second-place awards land on players who also hold a first somewhere — right at
the file-03 failure condition. Keep experimental; measure at the table.

**F8 — Known artifacts (honesty):** Focused Power's 100% dead rate at floor-5 is
an agent artifact (no heuristic enters it there); Complete Mastery / Harmony dead
rates (50–80%) are partly agent-driven but the sampler's 46% CM-eligibility says
lockout risk is real; contender-coverage came out ≈1.0 but only as a weak lower
bound (small candidate set) — treat as unmeasured, not as bad.

**Coherency resolution:** floor-none-at-2p + floor-5-at-3p+ would violate the
"no count-varying semantics" rule. **Flat floor 3 at every count** is the coherent
compromise: kills all measured squats (≤2 power), keeps 2p c1 with 10% ties and
solid depth, one teachable sentence.

## 2. The candidates

All share the frozen skeleton: 2n−3; Enchantment 4/8/12; PT = energy + transformation
+1 Wild (nerf held behind file-03's trigger); Wild gated as in the hybrid; **local
tiebreaks** (higher normal power → more distinct domains → shared full); trial lists
by count as in the hybrid rebuild §6 **plus Focused Power at 2p** (file-03's 2p bump —
every domain gets a third sink); shared-full ties; 6p second place per hybrid §9.

### C1 — "Coherent Claim" (recommended first playtest)

- **Minimum Claim 3** at every count (one rule, all counts).
- **+1 baseline Wild Magic for every player** at the Trials (F4).
- Rewards repriced: TM 7, EM 7 (file-03); rest as hybrid.
- No Champion's Mark.
- Why: passes every hard gate somewhere between the floor-0 and floor-5 rows of F2,
  blocks all measured squatting, guarantees the Wild counterability mechanism for
  every book, fully count-coherent.
- Watch at the table: 2p tie feel (screen says ~10% at parity mirrors — real shaped
  books should be lower); whether floor-3 ever blocks an entry a player wanted;
  whether baseline Wild feels like free noise or real bluff fuel.

### C2 — "Guarded Table" (conservative)

- Hybrid rebuild + file-03 smallest-fix, minus the RP floor: **Minimum Claim 5**
  at every count, **Champion's Mark +4 at 2p**, rewards as hybrid (TM/EM stay 8).
- No baseline Wild.
- Why: closest to the already-written proposals; maximum squat protection.
- Known costs (measured): 2p parity ties ~33% and shallow support (F2) — the Mark
  is carrying the 2p game; EM dead rate rises at 5–6p (F3); books without Wild
  (42%) risk locked-mirror flatness (F4).
- Pick this only if playtests of C1 show floor-3 failing to stop squat-feel.

### C3 — "Open Skies" (maximum freedom)

- **No floors.** +1 baseline Wild, Champion's Mark +4 at 2p, repriced TM/EM 7.
- Why: the best pure-2p numbers on every axis (F2 row 1: ties 3.2%, support 34,
  VOI 8.4); treats 3p+ penny-steals (~9% of awards) as legitimate cheeky play
  rather than a bug.
- This is a taste call the model cannot make: if watching someone win 8 RP with
  1 power feels delightful at your table, C3 is the deepest configuration here;
  if it feels broken, C1.

### C4 — "Archspell Bold" (unscreened, playtest-only)

- C1, with **Focused Power → Trial of the Archspell** at every count where it
  appears (all power on the trial must come from one single spell).
- The model cannot express per-spell constraints (allocations are domain-level),
  so this carries file-03's design argument only — no screening evidence either way.
- Test after C1: it's C1 with one trial swapped, so a single session isolates the
  variable.

**Not carried forward:** printed-RP floors (F1, fails hard gates); ratio tiebreaks
(monotonicity violation, review 04 §6.5 / fixture A7); count-varying floor schemes
(coherency rule).

## 3. Suggested playtest order and kit

1. **C1 at 2p** (Trials opt-in per 2026-07-09 decision): watch tie frequency,
   floor-3 friction, baseline-Wild feel, and the repeat-game predictability probe
   (file-03: do round-2 allocations repeat round-1?).
2. **C1 at 5p (Echo)**: file-03's five watch items (PT sweep, TM-vs-Purity gap,
   ≥2 Complete Mastery entrants, UC share) plus: count real Wild totals (does
   baseline +1 make Wild feel abundant?), and log every squat attempt blocked or
   missed by floor 3.
3. **C3 at 3–4p** if C1's floor ever felt bad, or **C2 at 2p** if squatting
   still stings; then **C4** as the one-variable swap on whichever won.
4. At any 6p session: tally second-place RP by recipient — the F7 borderline
   (41–52% to leaders) decides whether 2nd place survives.

Log each session per §7 of the working system; D-AT2 (PT double-count) and D-AT3
(RP tuning) close on these sessions.

## 4. Reproducibility & limits

Screening harnesses ran in scratch (`/tmp/at_screen`) on top of the committed
package (read-only); seeds fixed (20260711 family); all Stage-3 numbers are exact
or numerical-LP on enumerable states (≤ ~500 collapsed strategies — scale
limitation declared); Stage-4/5 numbers are conditional on declared sampler
assumptions and S1 agents. Before trusting Stage-4/5 *frequencies* (not
structures), spot-check the sampler against 3–5 real final books from the session
logs — if median total power or Wild-zero rate is off by more than ~25%, rerun
Stages 4–5 with corrected assumptions (one evening).
