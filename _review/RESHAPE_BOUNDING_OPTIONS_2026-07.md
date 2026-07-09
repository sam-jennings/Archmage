---
title: Bounding the End-Game Reshape — Options for Decision
type: options
created: 2026-07-08
status: open — for Sam to evaluate and decide
thread: capacity-economy
relates_to:
  - "simulation/SCORING_EV.md"
  - "playtests/2026-07-06-session-04.md"
  - "rulebook/Archmage Ascension - Complete Rulebook.md (Learning Phase → RESHAPE)"
decision_target: "meta/decisions/ (create on adoption)"
---

# Bounding the End-Game Reshape — options

## The problem, precisely

Canon RESHAPE (Learning action, 1 counter):

> Break down any/all spells and rebuild them using the same components... Counts as
> one learning action **regardless of how many spells affected.**

So for **one** learning action, a player can dismantle their entire Spellbook and rebuild
it into the single highest-scoring arrangement. Because a Transfiguration (any-energy run)
is the easiest big spell to assemble from a mixed pile, and the table pays a 15-card
Transfiguration 95 points, one Reshape on the final Drought turn turns a scattered book into
a 95-point monster. This is what won Session 4.

The scoring-EV rig (`simulation/SCORING_EV.md`, seed 42, 10k/50k trials) confirms it:

| Player count | Unbounded Reshape marginal | Lands on a Transfiguration |
|---|---:|---:|
| 2p | **+40.1 pts** over the as-played book | 85% of games |
| 3p | +20.9 | 68% |
| 4p | +9.1 | 57% |

We want to **bound the Reshape** so the payoff of a spell tracks the work put into it — without
touching the score table (a separate, optional lever), and without breaking legitimate mid-game
tidy-up Reshaping.

## Two things that decide between the options

**Gotcha 1 — counter-cost bounds are bypassed by Unlimited Capacity.** Any option that makes
Reshape "cost more counters" does nothing for a player under Unlimited Capacity (5-card
Enchantment), who has unlimited free learning actions — i.e. the strongest players pay nothing.
The rig already shows cost-scaling is weak even for normal players (see Option E). Prefer bounds
that constrain the *result*, not the *cost*.

**Gotcha 2 — Reshape isn't the only way to grow a spell.** EMPOWER adds a hand card to an
existing spell (1 action per card) and can convert spell types. So any bound on Reshape leaves a
slow, card-by-card Empower path to big spells. **This is a feature, not a leak:** growing a
15-spell via Empower costs ~12 actions/counters spread over turns — real work — which is exactly
the "earn your big spell" outcome we want. It only becomes free under Unlimited Capacity, which
exists **only at 5-6 players**; at 2-4p (where the exploit is worst) every player is
counter-limited, so a Reshape bound is fully effective there.

## Options at a glance

| # | Option | Kills exploit? | UC-proof? | Teachability | Touches |
|---|---|---|---|---|---|
| **A** | **Result-size cap on Reshape** | **Yes (measured)** | Yes at 2-4p | One number | RESHAPE only |
| B | No Reshape during the Drought | Yes | Yes | Very simple | Drought rules |
| C | Scope cap (cards moved) + 1 Reshape/turn | Yes | Yes | Medium | RESHAPE only |
| D | Reshape can't change a spell's type | Mostly | Yes | Medium/subtle | RESHAPE only |
| E | Counter-cost scaling | Weakly | **No** | Medium | RESHAPE only |

---

## Option A — Result-size cap on Reshape (recommended)

**Rule:** A single Reshape may not *produce* a spell larger than **N** components (candidate
N = 6). Spells already larger than N are untouched; to build a spell beyond N you must grow it
one card at a time with Empower.

**Effect (measured, `SCORING_EV.md`):** collapses the exploit.

| Cap N | 2p marginal | 3p | 4p |
|---|---:|---:|---:|
| unbounded | +40.1 | +20.9 | +9.1 |
| **6** | **+0.1** | +0.8 | +2.1 |
| 8 | +0.8 | +4.3 | +5.4 |
| 10 | +5.7 | +10.6 | +7.7 |

N = 6 removes essentially all of the 2p spike and most of it at 3-4p; N = 8 leaves a small
residual. N = 6 is the clean choice.

**Pros:** directly measured; UC-proof at 2-4p (Empower-up is counter-limited); one number to
teach; only touches the RESHAPE entry; legitimately-built big spells (grown via Empower over the
game) are untouched.

**Cons:** introduces a size limit on one action that differs from the general max spell size (15),
which needs careful wording so it doesn't read as "max spell is 6." Suggested phrasing:

> RESHAPE can rebuild spells up to 6 components. Growing a spell beyond 6 is done one component
> at a time with EMPOWER — true mastery is built up, not assembled in a single stroke.

**Open sub-choice:** N = 6 (kills it) vs N = 7/8 (gentler, leaves a small edge). Rig can pin the
exact residual at any N.

---

## Option B — No Reshape during the Drought

**Rule:** RESHAPE is unavailable during the Drought. LEARN, EMPOWER, and UNLEARN still work, so
you can still add drawn cards to spells and learn new ones — you just can't wholesale-restructure
on the final turns.

**Effect:** the exploit is specifically a last-turn move, so removing Reshape from the Drought
kills it directly. (Not separately rig-measured, but it removes the action entirely in the phase
where the +40 is realised, so the effect is at least as strong as a tight cap.)

**Pros:** the simplest rule to state and enforce ("no Reshape once the Source is dry"); no new
numbers; UC-proof (the action doesn't exist in the phase).

**Cons:** the Drought is framed in the rulebook as "your last chance to optimize your Spellbook,"
so removing Reshape there fights the current theme and feel; it also blocks harmless small
end-game tidy-ups, not just the abuse; and it's a slightly arbitrary phase-gated rule. Milder
hybrid: allow Reshape in the Drought but apply Option A's size cap (A already covers this, since
the exploit lives in the Drought anyway).

---

## Option C — Scope cap (cards moved) + one Reshape per turn

**Rule:** A single Reshape may move at most **K** components (candidate K = 4), and you may
perform **at most one Reshape per turn.** Restructuring more than K cards takes multiple turns.

**Effect:** ties the cost of a big restructure to its size in *turns*, not counters — so it holds
even under Unlimited Capacity (the per-turn limit, not the counter cost, is the brake). Building a
15-card spell from scratch would take several Drought turns, which the finite Released Reserve may
not allow.

**Pros:** most thematic ("major restructuring takes time"); UC-proof at all counts because the
brake is per-turn; keeps the max-spell-size rule intact.

**Cons:** two rules instead of one; requires counting "cards moved" at the table, which is fiddly
given the game's existing comprehension load; not yet rig-measured (I can add a per-turn-limited
variant to the rig if you want this quantified before deciding).

---

## Option D — Reshape can't change a spell's type

**Rule:** RESHAPE may only rearrange components *within existing spell types* (tidy/merge same-type
spells). Converting components between types (e.g. Conjuration cards → a Transfiguration) is done
by EMPOWER, one action at a time.

**Effect:** the exploit banks cards cheaply into Conjurations, then Reshapes them into a giant
Transfiguration. Forbidding the type change on Reshape blocks that specific move; the conversion
must go through Empower (costly, incremental).

**Pros:** targets the exact abusive move (cheap-bank → convert); UC-proof at 2-4p (Empower path is
counter-limited); leaves same-type Reshaping fully available.

**Cons:** subtler to teach ("Reshape can rearrange but not re-type"); a determined player can still
Reshape a single large same-type Conjuration into a large Conjuration for points (Conjuration is
lower-scoring, so weaker, but not zero); interacts with the pricing question, so best considered
alongside the optional Transfiguration re-price. Not separately rig-measured.

---

## Option E — Counter-cost scaling (documented, not recommended)

**Rule:** Reshape costs counters in proportion to its scope (e.g. 1 counter per K cards moved or
per spell broken).

**Why it's weak:** the rig tested cost-scaling at 4 cards/counter and it barely dented the spike
(2p marginal +35.3 vs +40.1 unbounded) because players hold ~5.5 counters at game end — enough to
pay anyway. Worse, **Unlimited Capacity players pay nothing** (Gotcha 1), so the strongest players
keep the full exploit. A rate tight enough to bite normal players would still miss UC players.
Listed for completeness; not recommended as the primary lever.

---

## Recommendation

**Adopt Option A (result-size cap on Reshape, N = 6)** as the primary fix: it's the one option the
rig has directly measured to kill the exploit (+40 → +0.1 at 2p), it's UC-proof where it matters
(2-4p), and it's a single number that only touches the RESHAPE rule. Pair it with careful wording
so it reads as "big spells are grown via Empower," not "max spell is 6."

If you prefer maximum simplicity over surgical precision, **Option B** (no Drought Reshape) is the
blunt version — fewer words, but it dents the "optimize at the end" feel.

The standalone Transfiguration-vs-PT pricing inversion is **separate** from all of these and a
bounded Reshape doesn't fix it; treat a small Transfiguration re-price as an optional companion
change (its own decision), not part of the Reshape bound.

## What's measured vs what needs a rig run

- **Measured now:** Option A at caps 6/8/10, and Option E at 4 cards/counter (all in `SCORING_EV.md`).
- **Would need a short rig run to quantify (say the word):** Option C (per-turn-limited scope cap),
  Option D (no-type-change Reshape), and Option A at other N (e.g. 7). Each is a small variant on
  the existing `scoring_ev.py`.

## Decision for Sam

1. Which option (A / B / C / D), or a combination?
2. If A: what N (6 recommended)?
3. Also adopt the optional Transfiguration re-price, or handle that separately later?

On your pick I'll: log the decision under `meta/decisions/` with a propagation checklist, write
the rulebook wording (Learning Phase → RESHAPE, plus the Drought section if B), update the
Scoring System Reference if re-pricing, and — if you want it confirmed first — run the rig variant.

---

## Sam's evaluation (2026-07-08) — direction changed to a scoring-table fix

**All Reshape-bounding options (A–E) rejected.** Sam's reasoning, recorded:

- **Reshape is an action discount, not a unique capability.** The same concentrated
  end-state (all cards fused into one big spell) is reachable by unlearn-then-relearn for
  ~6 actions instead of Reshape's 1 (and Reshape also dodges the "unlearned cards can't be
  relearned until next turn" rule). So any player with enough counters reaches the same
  place regardless of a Reshape bound — bounding the *path* doesn't fix the *value*. The
  counter economy is what makes the alternative path affordable.
- **A** — rejected: a result-size cap forbids legitimate merges (e.g. two 4-card Void
  Conjurations → one 8-card Conjuration).
- **B** — rejected: the Drought's primary purpose is Spellbook optimisation (no casting),
  so removing Reshape there guts the phase.
- **C** — dropped: unclear / too fiddly.
- **D** — rejected: Reshape was *designed* to free components trapped in the wrong spell
  type; forbidding type-change removes its reason to exist.
- **E** — already rejected (bypassed by Unlimited Capacity; measured weak).

**Root cause (agreed): convex scoring rewards concentration.** Each extra card is worth
more than the last (Conjuration per-card marginals 1,2,3,…,12), so the same 15 cards score
30 as three 5-card spells but 95 as one 15-card spell. Every end-game player chases that
+65, via Reshape or unlearn/relearn. The convexity is also the intended "big-spell payoff,"
so the fix must keep the aspiration while removing the free end-game concentration.

**Direction: modify the scoring table.** Leading principle — **reserve the steep high-end
for Perfect Transmutation** (a long same-energy run is genuinely hard and cannot be faked
from a mixed end-game pile), and **flatten Transfiguration (and likely Conjuration) at the
top** so the easy-to-inflate families' scores track their difficulty. This fixes both the
TF-vs-PT pricing inversion (Part A) and the concentration exploit (Part B) with no mechanic
change. Two number-picking routes: (1) rarity-priced from the rig; (2) hand-shaped (3–6
unchanged; 7+ flat/shrinking marginals for TF/Conjuration, PT keeps climbing).

**Next step:** extend `scoring_ev.py` with a `--score-table` option to measure candidate
tables (concentration marginal, winning-family mix, TF/PT inversion) so the choice is made
on measured tables. Open feel question for Sam: keep PT steep and flatten only the easy
families, or flatten the whole curve more evenly.

**Related but separate:** Sam's idea to change the Enchantment ladder to +1/+3/+5 counters
and remove Unlimited Capacity is a capacity-economy (F1) lever, not part of this fix; kept
as its own decision. It interacts (a stingier counter economy also slows the unlearn/relearn
concentration path) but the scoring change is the cleaner primary lever here.


# Sam's raw notes
I see three decisions which might affect each other:
1. UC or not
2. controlling reshape power
3. balancing score table

I'm leaning towards removing UC. It makes the game cleaner and makes it slighly harder for mass spell optimisation sessions.
Reshape needs limiting IFF it can be done with a clean rule. For my U/V/W → X/Y/Z example, 6 seems too expensive but 1 too cheap. 3 feels like the right amount as you are going from 3 to 3 spells but what clear rule can define that?
Regarding the score table, obviously bigger spells should be rewarded. 
But maybe more analysis needs to be done into how hard each incremental increase is per spell type. 
To go from a 3-card conj to a 4-card conj, you need one of 12 cards (ignoring wilds).
To go from a 3-card trans to a 4-card trans, you need one of 8 cards (ignoring wilds and assuming open ended).
Yet
To go from a 13-card conj to a 14-card conj, you need one of 2 cards (ignoring wilds).
To go from a 13-card trans to a 14-card trans, you need one of 8 cards (ignoring wilds and assuming open ended).
Also, a 15-card conj is by definition a 15-card PT so should theoretically have the same score.
So the difficulty of increasing spell size is not linear and varies significantly based on the type of spell
I'm not saying the score table should model this perfectly, especially as adding an extra energy will change all of the probabilities, but it might be insightful as to why transfiguration is currently overpowered

---

## Marginal-difficulty analysis + three-decision framing (2026-07-08)

Reproducible: `python simulation/scoring_ev.py difficulty --energies 4` (and `--energies 5`).
Metric = number of distinct deck cards (ignoring wilds) that grow a size-n spell to n+1.

**Findings (4 energies):**
- **Conjuration is priced correctly.** Candidates fall 12→1 as size grows (you deplete the
  one energy's 15 cards); the current score jump rises 1→12 in lock-step (Δscore = 13 −
  candidates). Reward tracks difficulty. Its convexity is *earned*.
- **Transfiguration is the bug.** Candidates are ~flat at 2×energies = 8 for every step, but
  the current score jump rises 2→13. A Transfiguration is equally easy to extend at every
  size, yet each added card pays more and more — the overpricing, and why it wins end-game.
- **Perfect Transmutation** has ~flat, low candidates (2) — genuinely hard — so its high level
  is warranted, but its rising (convex) jump isn't; it should be steadier.
- **Identity violated: a 15-card Conjuration IS a 15-card PT** (all 15 of one energy =
  consecutive), so they must score equally. Current: Conj 15 = 81, PT 15 = 109. And since PT
  is a constrained Conjuration, PT ≥ Conj at every size *converging* at 15 — but the current
  gap *diverges* (4 at size 3 → 28 at size 15).
- **Echo makes it worse:** at 5 energies, Transfiguration candidates rise 8→10 (even easier)
  while PT stays 2 and Conjuration is unchanged — so Transfiguration gets *more* overpowered
  at 5-6p.

**Caveat:** "candidates to extend" is a marginal proxy and is path-dependent (it can't by
itself satisfy the Conj15≡PT15 identity). Actual prices should be set from **configuration
rarity** (the rig's reach-probabilities), which is path-independent and respects the
identities; the marginal model is the intuition for *why* and the *shape*.

**Three interacting decisions (Sam, 2026-07-08):**
1. **Unlimited Capacity** — leaning REMOVE (cleaner; no infinite free actions; harder mass
   optimisation). Foundational: decide first, since it underpins every action-economy lever.
   5-card Enchantment would grant +5 counters instead (ladder +1/+3/+5). 5-6p-only change.
2. **Reshape cost** — limit *iff* a clean rule exists. Candidate that matches Sam's "≈3 for a
   3-spell reshuffle": **RESHAPE breaks apart ONE spell per action and redistributes its
   components into valid spells (existing or new), 1 counter.** Rearranging U/V/W → X/Y/Z costs
   3; merging two 4-card Conjurations costs 1 (fixes the Option-A objection); freeing trapped
   components still works (Option-D purpose preserved). Secondary to scoring; only bites once
   UC is gone.
3. **Score table** — primary lever. Shape implied by the analysis: flatten Transfiguration to
   ~linear (flat difficulty), keep PT steadier-but-high, let Conjuration stay convex and
   *converge to PT at 15*; a 15-card Transfiguration should be the *cheapest* 15-spell, well
   below Conj15 = PT15. Derive exact numbers from rarity, impose the identities, validate in
   Part B (needs a `--score-table` option in `scoring_ev.py`).

---

## Candidate table built + measured (2026-07-08)

Ceiling anchored at Conj15 = PT15 = 100 (Sam's round number). Generated by
`python simulation/scoring_ev.py propose-table --ceiling 100 --out results/candidate_table.json`
(rule: PT linear to 100; TF linear with slope = PT-slope / energies, so TF15 = 28 — the
cheapest big spell; Conjuration keeps canon's difficulty-correct convex shape rescaled to
converge up to 100 at size 15; Enchantment 6/12/18 unchanged). Validated with
`analyze --score-table results/candidate_table.json` → `simulation/SCORING_EV_candidate.md`.

| size | Conj | TF | PT | | size | Conj | TF | PT |
|---|---:|---:|---:|---|---|---:|---:|---:|
| 3 | 3 | 5 | 7 | | 10 | 38 | 19 | 61 |
| 4 | 4 | 7 | 15 | | 11 | 48 | 21 | 69 |
| 5 | 7 | 9 | 23 | | 12 | 59 | 22 | 77 |
| 6 | 10 | 11 | 30 | | 13 | 71 | 24 | 85 |
| 7 | 15 | 13 | 38 | | 14 | 85 | 26 | 92 |
| 8 | 22 | 15 | 46 | | 15 | 100 | 28 | 100 |
| 9 | 29 | 17 | 54 | | | | | |

**Result (Part B, end-game concentration marginal over the as-played book):**

| | canon | candidate | reshapes into TF |
|---|---:|---:|---|
| 2p | +40.1 | **+11.7** | 85% → **1%** |
| 3p | +20.9 | +6.5 | 68% → 13% |
| 4p | +9.1 | +4.8 | 57% → 22% |

The Transfiguration concentration exploit is essentially gone (TF-reshape share 85% → 1% at
2p), and Part A's TF-vs-PT inversion is fixed (TF7 = 13 now below PT5 = 23). The **residual
+11.7 at 2p is Conjuration concentration** — milder (needs one-energy dominance to set up) and
partly legitimate (a big Conjuration is genuinely hard). It's the same convexity effect, so it
can't be fully removed by scoring without flattening the aspirational big-spell payoff. The
`size_capped` rows under the candidate table show the **Reshape "break one spell per action"
rule (decision 2) trims the residual further** (cap-8 → +3.9), so the two decisions compose.

**Open for Sam:** sign off on the numbers (esp. TF15 = 28 — is that too punishing for a
legitimately-built 15-card Transfiguration?); decide whether the +11.7 Conj residual is
acceptable or whether to also adopt the Reshape rule to trim it. Ceiling 100 is set.
