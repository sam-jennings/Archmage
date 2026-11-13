---
title: Ascension Trials Configuration Model — Adversarial Mathematical Review
type: design-review
date: 2026-07-10
status: for-decision — review of the modelling specification (not of any Trials ruleset)
reviews:
  - "expansion/Ascension Trials Configuration Model.docx (the specification under review)"
relates_to:
  - "rulebook/Ascension Trials.md (live baseline, v2.8, partially stale per F8)"
  - "ascension-trials/design-history/ASCENSION_TRIALS_02_HYBRID_REBUILD_PROPOSAL_2026-07-06.md"
  - "ascension-trials/design-history/ASCENSION_TRIALS_03_HYBRID_REBUILD_CRITIQUE_2026-07-06.md"
  - "meta/decisions/2026-07-06-f8-ascension-trials-reconcile.md"
  - "meta/decisions/2026-07-09-2p-trials-not-default.md"
purpose: Determine whether the modelling spec is coherent, implementable, tractable, and able to distinguish strategic configurations from complicated ones. All toy-game numbers below were verified by exhaustive enumeration; each is labelled theorem, exact computation, or design judgement.
---

# Ascension Trials Configuration Model — Adversarial Review

Source-state caveat (noted once, then ignored): the live `Ascension Trials.md` (v2.8) still
carries a 7-player table and omits Echo as a domain; the base game is 2–6p with Echo at
5–6p. The spec correctly treats the live rules as *baseline candidate only*, so this is a
data-entry concern for the model's baseline config file, not a modelling flaw. The hybrid
rebuild (file 02) already includes Echo and drops 7p; the model must be able to represent
**both** as configurations. Note also decision 2026-07-09: Trials are opt-in at 2p, which
lowers the stakes of 2p pathologies but does not remove any requirement below.

---

## 1. Executive verdict

**Implementable?** Yes, after the revisions in §3. The two-player core is on unusually firm
ground: both proposed utilities (win and margin) are antisymmetric, so the 2p game is
genuinely zero-sum under either — minimax values exist, LP solving is legitimate, and
"equilibrium" is a defensible word (Theorem T1, §6). The spec's instinct to refuse zero-sum
language at multiplayer is correct. The largest implementability gaps are: the outcome
function is defined on Spellbooks while the whole model works on power vectors, and the
baseline final tiebreakers ("most spells", "largest single spell") are not measurable from
the power vector (§3, R-3); dominance is defined without saying which utility it uses
(§3, R-1); and the universal legal threshold Δ_L is trivially infinite whenever leaving
power unallocated is legal (§3, R-4).

**Jointly satisfiable?** Yes — the seven requirements of Question 1 can coexist, because
they bind at different Spellbook gaps and the 2p game is zero-sum (full argument §6.1).
But satisfiability is conditional on three structural facts, each proven by counterexample:

1. **R5 (counterability) is a constraint on the reward vector, not just a metric.**
   With a fungible budget, winner-take-all trials, and shared-full-RP ties, full
   concentration on trial t* is *strictly unbeatable at equality* whenever
   RP(t*) ≥ Σ RP(others contestable by the opponent) (Theorem T3, "turtle theorem", §6.3;
   verified exactly: trials worth (5,3), budget 4 → allocation (4,0) is never strictly
   beaten). R5 therefore fails for any configuration with a majority-value trial reachable
   by concentration — including configurations the Minimum Claim floor could accidentally
   create by shrinking the contestable set.
2. **R4 (optimal monotonicity) is false for the baseline tiebreakers.** The Commitment
   tiebreaker's denominator (total power across all domains) means a componentwise-better
   Spellbook can strictly lose a tie it previously shared, with no allocation recovering it
   when the added power has no legal or useful sink (exact counterexample §6.5). The spec
   must either change the tiebreak family or formally weaken R4; it cannot keep both.
3. **Several requirements are satisfiable "via ties" in letter only.** A two-trial
   equal-reward config with mandatory full allocation produces 100% pre-tiebreak ties
   (exact computation §5, toy D) — maximally "unpredictable" and perfectly "fair" while
   containing zero strategy. Every uncertainty and fairness metric must be computed on
   outright results with tie-derived outcomes reported separately, or the hard gates leak.

**Three largest conceptual risks** (beyond the fixable defects above):

- **Risk 1 — everything quantifies over R, and R is a weak foundation.** Counterability,
  both dominance thresholds, equilibrium support, and the complexity proxy all quantify
  over the iterated-strict-dominance set. Strict dominance eliminates very little in
  Blotto-like games (in the verified toy, 84 legal allocations, 0 strictly dominated), so R
  ≈ everything, quantifiers over R become quantifiers over L, and Δ_R in particular may be
  infinite for uninteresting reasons. R is also discontinuous in configuration parameters:
  a 1-RP reward change can delete or create large chunks of R, making config comparisons
  jumpy. Mitigation: §3 R-2 and the equilibrium-support-based secondary set in §3 R-10.
- **Risk 2 — tie handling contaminates every metric.** Shared-full-RP inflates the pool
  (the game is *not* constant-sum in RP across ties, only in win utility), makes spreading
  artificially attractive at equality, and lets configurations pass fairness/uncertainty
  gates while being tie-resolution lotteries. The tiebreak cascade ends in S-level facts
  the model cannot see. Tie rate under equilibrium play must be a hard gate, not a
  footnote (§5).
- **Risk 3 — z-space results may not transfer to reachable games.** Thresholds and
  matchup matrices computed on synthetic power vectors include shapes no legal base game
  can produce, and exclude the correlations real play induces (e.g., big Transformation
  power co-occurring with PT wild magic). Terminal-state analysis is valid for structural
  properties (§6) but every *frequency* claim ("archetype X usually wins", "Δ_R is
  reachable") is conditional on an assumed Spellbook distribution the first model does not
  have. The interface in §9.4 is therefore load-bearing, not optional.

**Verdict on the spec's ability to distinguish strategic from complicated:** as drafted,
partial. The hard filters (determinism, symmetry, counterability, contestable range) do
real work, but bare rock-paper-scissors passes *every* hard gate (each pure strategy has
exactly one counter, mixed value 0, no ties, trivially tractable) while containing no
resource texture at all. The gates test for *non-degeneracy*, not depth. Depth lives in
the §5 primary metrics — margin-VOI, equilibrium mix entropy, counter distance — and those
need the revisions below before they measure what they claim to.

---

## 2. Accepted definitions

The following can pass into implementation as written (with section references to the spec):

- **Configuration tuple** C_n = (F, D, T, L, A, W, R_n, B, I) (§3). Complete as a
  parameter space; I (information structure) correctly included — open Spellbooks are an
  information rule, not an assumption.
- **Three-level strength description** — q(S), m_C(S), z_C(S) kept separate; refusal to
  assume a total order on Spellbooks; the five comparison classes (identical resources,
  equal-q, proportional paths, componentwise dominance, realistic unmatched) (§5). This is
  the right decomposition; revisions in §3 sharpen, not replace it.
- **Strategic equivalence** (same result against every opponent allocation) and the rule
  that all diversity/support counts happen after collapse (§6). Correct and essential.
- **Strict dominance as the primary elimination concept**, with weak dominance reported
  separately because its iterated elimination is order-dependent (§6.2). The
  order-independence of iterated *strict* dominance in finite games is a standard theorem;
  the spec relies on it correctly (subject to R-2 below fixing the quantifier).
- **Dual utilities at 2p** — win utility for hard claims, margin utility for counter
  quality (§7.1). Both antisymmetric, hence zero-sum: this choice quietly makes the whole
  2p program rigorous.
- **Multiplayer utility pluralism** — report several outcome measures, never one arbitrary
  scalar; no equilibrium claim without naming the utility (§7.2, §9-S4, §13). Correct and,
  in my experience of such specs, rare.
- **Strategy ladder S0–S4** with S0 explicitly a technical baseline, not a human model (§9).
- **The three-threshold concept** (guarantee / robust / universal) as *distinct* questions
  (§8-R9) — definitions need repair (§3 R-4, R-6) but the triage is right, and the
  observation that the designer-facing requirement is Δ_R is right.
- **Test-state taxonomy** — controlled mirrors, archetypes, adversarial, realistic, with
  "synthetic establishes structure, realistic establishes frequency" (§15). Exactly the
  right epistemics.
- **Staged selection** — hard filters → Pareto → per-player-count decision; no composite
  weighted score; simplicity bonus that cannot override a strategic failure (§17).
- **Deterministic resolution** and the Monte-Carlo-samples-states-not-resolution rule (§4).

---

## 3. Required revisions

Each item gives replacement wording or mathematics. Numbered for reference from Kiro specs.

**R-1. Dominance must name its utility.** Strict dominance under u^W and under u^M differ
(an allocation can be win-equivalent but margin-worse everywhere). Replace spec §6.1
preamble with: *"Dominance, and therefore the reasonable set R_i, is defined with respect
to win utility u^W. Margin-utility dominance is computed as a diagnostic overlay and never
defines R_i."* Rationale: R5 and the hard gates are stated in u^W; mixing utilities makes
R5's quantifier ill-typed.

**R-2. Define iterated elimination precisely.** Spec §6.1 tests dominance against "every
opponent allocation profile" — if that means every *legal* profile at every round, the
elimination never iterates. Replace with: *"Round 0: R⁰_i = strategically distinct classes
of L_i. Round k+1: remove from R^k_i every allocation strictly dominated (u^W) by some
member of R^k_i against all profiles drawn from ∏_{j≠i} R^k_j. R_i = fixed point. All
strictly dominated strategies are removed simultaneously each round; for strict dominance
the fixed point is order-invariant (standard theorem, finite games)."*

**R-3. Close the state/outcome gap.** G_C is defined on Spellbooks; the model computes on
z. The baseline final tiebreakers ("most spells in Spellbook", "largest single spell") and
any future tiebreak touching S are invisible to z. Replace spec §4 state with: *"The model
state for player i is z⁺_i = (p_i, w_i, τ_i) where τ_i is the vector of tiebreak-relevant
Spellbook statistics required by configuration B (for the baseline: spell count, largest
spell size). A configuration is z-closed if B reads only (allocations, z⁺). Only z-closed
configurations are evaluable; a configuration whose tiebreaks read unlisted S-features must
extend τ or be rejected as unspecified."* Synthetic test states must then declare τ
explicitly (and the mirror tests set τ_A = τ_B).

**R-4. Repair the universal legal threshold.** If the configuration permits leaving power
unallocated, L contains near-null allocations, the stronger player "using" the null
allocation loses, and Δ_L = ∞ always — the diagnostic is dead on arrival. Replace with:
*"Δ_L is computed over the set L* of maximal legal allocations: allocations to which no
further unit of remaining power can be legally added to any active Trial. Under
mandatory-full-allocation configurations L* = L."* (Maximality, not fullness, because
fullness can be illegal — see R-5.)

**R-5. Feasibility clause.** Mandatory-full-allocation configurations can make L empty
(e.g., all power in one domain, every active Trial requiring 2+ domains; or Minimum-Claim
floors exceeding every domain pool). Add to spec §16 step 1: *"For every generated state,
verify L_i ≠ ∅. A configuration for which any reachable state has L_i = ∅ fails
validation unless it defines an explicit fallback (unallocated power is always legal
residue)."* Recommendation (design judgement): make "unallocated" always legal in the
model even when evaluating mandatory-full variants, and implement "mandatory" as
maximality (R-4), which cannot be infeasible.

**R-6. Path-parameterized, upper-defined thresholds.** "Advantage Δ" is undefined off a
path, R varies with Δ (the sets in the inf are Δ-dependent), integer power makes win
regions non-nested, and inf of an empty set needs a value. Replace R9's three definitions
with: *"Fix a strength path π: [0, Δ_max] → reachable z⁺ pairs with π(0) an identical
pair, and a scalar advantage parameter Δ along it (declared per path: % scale, added
cards, or added power units). For property Φ ∈ {∃a∀b A wins, ∀a∀b over R, ∀a∀b over L*}:
Δ_Φ(π) = min{Δ : Φ holds at π(Δ′) for all Δ′ ≥ Δ}, and Δ_Φ(π) = ∞ if no such Δ.
Report per path; also report the lowest Δ where Φ first holds and whether the region is
contiguous (a non-contiguous region is itself a finding — threshold effects)."*
Always report Δ_G ≤ Δ_R (which holds by definition when both are finite over the same
sets) and flag any path where Δ_R = ∞.

**R-7. Decide the tiebreak family before testing R4.** First, the live Utilization
definition is ambiguous — "power allocated from domains used ÷ total capacity of those
domains" does not say whether the numerator is per-trial or per-domain-aggregate. Second,
Commitment's denominator (total power across all domains) provably violates R4 (§6.5).
Options, pick one and record it as a decision:
  (a) *Replace* trial tiebreaks with allocation-local statistics, e.g. 1. higher normal
  power on this Trial is already the primary comparison; on a tie → more distinct normal
  domains used on this Trial (all trials, not just breadth trials) → shared. Allocation-
  local statistics cannot violate R4 because they do not read unallocated capacity.
  (b) *Keep* ratio tiebreaks for their table drama and formally weaken R4 to: *"componentwise
  improvement must not reduce best achievable result except through tiebreak stages 1–2,
  and the measured frequency of such inversions under equilibrium play must be below a
  declared bound."* The model then measures the inversion rate instead of asserting zero.
Recommendation (design judgement): (a). Ratio tiebreaks also add the largest single chunk
of at-table arithmetic in the whole endgame (§5 complexity), for a stage that should be
rare.

**R-8. State R6 as a theorem, and measure only what remains.** With identical z⁺ and any
antisymmetric utility, the 2p game is symmetric zero-sum: value 0, and under equilibrium
(or any symmetric strategy pair) P(A wins) = P(B wins) exactly. No simulation should
"test" this — it should be a property test of the resolver (mirror fixtures). The
*measurable* quantity at equality is tie probability under equilibrium play, which becomes
a hard gate (§5).

**R-9. Uncertainty metrics must name their strategy model.** Winner entropy, flip rate,
and Spellbook-only prediction accuracy are undefined for a deterministic game until a
distribution over allocations is specified. Replace spec §10.9–10.11 preamble with:
*"All uncertainty metrics are computed under a declared generator: (i) equilibrium mixtures
(2p exact), and (ii) an S2 population with declared parameters. S0 (uniform legal) is
never a valid generator for uncertainty claims — uniform noise over a large action space
manufactures entropy."* Spellbook-only prediction should use the exact game value v(z⁺_A,
z⁺_B) as the predictor (predict the sign of v; |v| is the confidence), not a fitted model
— the fitted model can be added later for realism but the value is canonical.

**R-10. Counterability needs a margin clause and a distance diagnostic, and VOI must move
to margin units.** Under u^W, if R5 holds then for every b some a wins, so
VOI^W = 1 − 0 = 1 identically: the win-utility VOI is implied by R5 and measures nothing.
Replace 10.5/10.7/10.8 with the C1–C4 battery in §6.4 below, with VOI in margin units.
Add the counter-distance diagnostic (§6.4 C5): if the best counter to b is always a
1-unit edit of b, the game is "copy-and-shave" — counterable in letter, guessing in spirit.

**R-11. Version-stamp q.** The independent strength measure is the standard scoring
system, which is *itself under experiment* (v3.1, decision 2026-07-09, under-test). Every
equal-q comparison and every strength-outcome curve must record the scoring version used
(q_{v3.0} vs q_{v3.1}); an AT configuration tuned against one may mis-rank under the
other. If v3.1 is killed, all equal-q analyses must be re-run, not patched.

**R-12. Reasonable-set fallback for hard gates.** Because strict dominance may eliminate
nothing (Risk 1), add: *"If |R_i| / |distinct L_i| > 0.9 at a tested state, the model must
additionally compute the equilibrium-relevant set E_i = union of supports of the computed
2p equilibrium (mass ≥ 0.01 after collapse) and report R5/Δ_G/Δ_R both over R and over E.
Divergence between the two reports is itself a diagnostic (the game's rationality
structure is not capturable by dominance)."* E is not a replacement for R in hard gates
(it is equilibrium-dependent), but reporting both prevents Δ_R = ∞ artifacts caused by
undominated junk.

---

## 4. Normative decisions still owned by the designer

The model can compute trade-offs; it cannot choose these. Spec §19's list is endorsed;
the review adds the starred items:

1. Target size of the recoverable deficit (R8 interval) — in % of q, per player count.
2. Percentile of *realistically reachable* advantage at which Δ_R should sit.
3. Acceptable tie rate under equilibrium play (suggested starting gate ≤ 5% of games
   decided beyond tiebreak stage 1, but the number is Sam's).
4. Required counter margin μ, in RP (see §6.4 C2; suggested μ = smallest active-Trial RP,
   i.e., a counter must win by at least one real trial, not by tiebreak decimals) — *the
   suggestion is design judgement, the choice is normative.*
5. ★ Whether "RPS-in-disguise" is acceptable: minimum equilibrium mix entropy / minimum
   number of strategically distinct equilibrium-support allocations (the depth-vs-purity
   dial the hard gates cannot see).
6. Kingmaking tolerance at 3–6p (spoiler-leverage bound).
7. Maximum table time and arithmetic budget for the endgame (feeds §5 complexity gates).
8. Approximate archetype balance vs deliberate matchup cycles at equal q (§12 of spec).
9. Degree of per-player-count rules variation tolerated.
10. ★ Whether unallocated power is a designer-visible choice ("you may hold back") or a
    modelling residue. This changes the psychology of bluffing more than the math.
11. ★ Whether dominance (Δ_R) should be defined on strict win only, or "strict win or
    shared first" at multiplayer — changes where thresholds land.
12. ★ Adoption or not of the Minimum Claim floor (file 03) — a *rules* decision, but the
    model must test both branches because the floor reshapes R discontinuously and can
    re-create turtle strategies at 2p (Theorem T3 applies to the floored game with fewer
    contestable trials).

---

## 5. Minimal metric set

Ordered by role. Everything here is per player count; 2p exact, 3–6p per §7.

### Hard gates (pass/fail; exact computation wherever the state is enumerable)

| Gate | Statement | Method |
|---|---|---|
| G1 Determinism / symmetry / conservation | Property tests on the resolver: same inputs → same outputs; player and energy-domain permutations commute with G; every allocated unit appears in exactly one Trial total | exact (property tests) |
| G2 Feasibility | L*_i ≠ ∅ for every generated state (R-5) | exact |
| G3 Monotonicity | R4 under the tiebreak family chosen in R-7, tested on componentwise +k paths including the §6.5 counterexample family | exact on fixtures + searched counterexamples |
| G4 Counterability C1+C2 | At every tested identical z⁺: every b ∈ R has a strict counter with margin ≥ μ (§6.4) | exact (best-response oracle) |
| G5 Tie rate | P(pre-tiebreak tie) and P(decided beyond tiebreak stage 1) under 2p equilibrium play ≤ designer bound | exact from equilibrium mix |
| G6 Contestable middle range | ∃ a Δ-interval on each same-shape path where 0.5 < P(stronger wins) < 1 under equilibrium AND S2-vs-S1 reversal rate is material | exact value curve + simulated compensation |
| G7 Finite, reachable robust dominance | Δ_R(π) < ∞ on same-shape paths and (once the base-game distribution exists) within the reachable advantage range | exact per R-6; reachability deferred |
| G8 Complexity ceiling | Allocation entries, active legality rules, and expected tiebreak comparisons under the declared budget (§5.4) | exact counting |

### Primary comparison metrics (Pareto axes)

1. **Game value curve v(Δ; π)** — the exact 2p equilibrium value along each strength path.
   One curve subsumes three spec metrics: fairness at Δ=0 (v=0 is a theorem, R-8),
   Spellbook advantage (monotone trend of v), and Spellbook-only predictability
   (|v| *is* the canonical pre-reveal confidence). Report win-utility value and
   margin-utility value separately.
2. **Strategic compensation** — P(weaker wins | Δ, S2 vs S1) and the recoverable-deficit
   frontier as a full curve (spec 10.2/10.4, kept as written).
3. **Equilibrium mix entropy** — Shannon entropy of the equilibrium mixture over
   strategically distinct allocations (mass ≥ 1%), plus the count of distinct support
   allocations. Replaces raw "equilibrium support" (support size is gameable by 10⁻⁹-mass
   entries and near-duplicate allocations).
4. **Margin-VOI** — E_b[max_a u^M(a,b)] − v^M under equilibrium b (§6.4 C4). Measures how
   *much* seeing the opponent is worth, in RP; the win-utility version is degenerate (R-10).

### Diagnostics (explain failures; never gates)

- **Local fragility** (spec 10.12) — kept; distinguishes commitment from knife-edge.
- **Counter distance** (§6.4 C5) — edit distance from b to its best counter; detects
  copy-and-shave games.
- **Trial-level panel** (spec §11) — attempt/contest/uncontested rates, dead-power rate,
  reward concentration, tiebreak stage reached, trial redundancy. Computed under the
  declared generator (R-9).
- **Archetype matchup matrix at equal q** (spec §12) — with q version-stamped (R-11).

### Remove or defer

- **Allocation flip rate (10.11): remove.** Redundant — its signal is split cleanly
  between fragility (local flips) and equilibrium mix entropy (global instability), and it
  is the most gameable metric in the spec (inflated by equivalent-allocation churn and
  1-point tiebreak crossings).
- **Winner entropy (10.10): remove as a headline; keep only tie rate.** Under R-9 it
  collapses into the value curve (entropy of a Bernoulli with p derived from v); reporting
  both invites double counting.
- **log₂|R| as depth (spec §14): demote to bookkeeping.** In Blotto-like games |R| ≈ |L|
  (verified: 84 legal, 0 dominated in the §8 cycle fixture), so it measures budget
  granularity, not strategy. Depth = equilibrium mix entropy, not action count.
- **Strategy-equivalent power (10.3): defer.** A derived narrative statistic of metric 2;
  compute it for write-ups after configurations are shortlisted, not during comparison.
- **Uncontested-rate style frequency claims on synthetic states: defer** until realistic
  Spellbook distributions exist (Risk 3) — on synthetic states report them as
  "conditional on generator" only.

### 5.4 Human-complexity model (Question 9)

Proxies that will correlate with real difficulty (design judgement, to be calibrated):
number of **allocation entries actually written** (not the size of the space), number of
**active legality rules a player must check per entry** (source-mix + floors + wild
constraints), number of **near-tie decisions** (allocations where ±1 unit plausibly flips
a Trial — this is what humans deliberate over), and **tiebreak stage depth actually
reached** at the table. Proxies likely to mislead: raw or reduced allocation counts and
log₂|R| (players never enumerate; they satisfice over 2–4 candidate plans), total
arithmetic operations for power derivation (done once, off the critical path, and the
2n−3 formula makes it trivial), and number of domains *per se* (unused domains cost
nothing).

Implementable model: predicted burden = α·(entries) + β·(near-tie decisions) +
γ·(active legality checks) + δ·(tiebreak comparisons executed), with (α…δ) fitted against
two observables the playtest log already supports: allocation wall-clock time per player
and illegal/corrected allocation rate (the over-allocation error mode is already named in
hybrid §8). Until fitted, report the four raw counts side by side; do not weight them.

---

## 6. Formal two-player model

### 6.0 Definitions

- **State.** (z⁺_A, z⁺_B) with z⁺ = (p ∈ ℤ^{|D|}_{≥0}, w ∈ ℤ_{≥0}, τ) per R-3, plus the
  configuration C. Information: both z⁺ public (open Spellbooks), allocations hidden until
  simultaneous reveal.
- **Actions.** a_i ∈ L*_i (maximal legal allocations, R-4): an assignment of integer
  normal power by (domain × active Trial) plus wild by Trial, satisfying domain
  conservation, per-Trial source-legality, and wild rules.
- **Resolution G_C** (order fixed): legality per Trial → per-Trial totals → per-Trial
  winner via comparison then tiebreak stages → RP award (shared-full on terminal tie) →
  final RP comparison → final tiebreak chain over z⁺ → (r, k).
- **Utilities.** u^W ∈ {1, 0, −1}, u^M = r_A − r_B. Both antisymmetric.
- **Reasonable set R_i** per R-1/R-2; equivalence collapse first.

### 6.1 Joint satisfiability (Question 1) — verdict with proofs

**Theorem T1 (zero-sum foundation).** u^W and u^M satisfy u_B = −u_A, so the 2p Trials
game is a finite zero-sum game under either utility. Hence: a minimax value v exists, it
is LP-computable on the collapsed matrix, all equilibria have the same value, and
equilibrium strategies are interchangeable. At z⁺_A = z⁺_B the game is symmetric, so
v = 0 and any symmetric equilibrium gives P(A wins) = P(B wins). *Consequence: R6 is a
theorem given a correct resolver — see R-8.*

**Theorem T2 (counterability forces cycles).** If R5 holds on finite R(z), the "beats"
digraph on R(z) has every vertex with in-degree ≥ 1; a finite digraph in which every
vertex has positive in-degree contains a directed cycle. So R5 ⟹ intransitive counter
cycles exist among reasonable allocations, no pure maximin strategy achieves the game
value, and every equilibrium at equality is strictly mixed. This is precisely the
rock-paper-scissors structure — desirable, and *incompatible with any transitive notion of
"the best allocation at equality"*. Anyone asking the model "what is the optimal
allocation for this Spellbook at parity?" must receive a distribution, not an allocation.

**Compatibility across requirements.** R5/R6 bind at Δ = 0; R7/R8 on the interior; R9 at
large Δ; they constrain disjoint regions of the same value curve and cannot contradict
each other directly. R6 is automatic (T1). R5 is satisfiable (exhibited: the §8 cycle
fixture satisfies C1 with zero unbeaten allocations, exact enumeration over 84 actions).
R7 (monotone advantage) cannot be a theorem under integer power — win regions are unions
of lattice conditions and the value curve will have flat steps and occasional 1-unit
wiggles; the spec already (correctly) allows "limited noise", so implement R7 as a
regression/trend test, not a pointwise inequality. R9's Δ_G is finite along same-shape
paths whenever scaling eventually lets one allocation out-bid the opponent's *total*
budget on a majority-RP set of trials (sufficient condition: for some trial subset
carrying > half the pool, A can allocate more to every trial in it than m(B), B's entire
budget — from that Δ on, that single A-allocation beats everything, so Δ_G ≤ that Δ).
Δ_R additionally requires *all* undominated A-allocations to win, which fails whenever an
undominated-but-losing allocation survives (Risk 1) — hence R-12's dual reporting; Δ_R
over E (equilibrium-relevant set) will generally be finite when Δ_R over R is an ∞
artifact. R10 is a resolver property. R11 is §5.4. **Conclusion: jointly satisfiable,
with the three structural conditions of §1 (reward spread per T3, tiebreak family per
R-7/§6.5, tie discipline per G5) as the price.**

**The one genuine tension worth naming:** R5 (every pure allocation counterable) pulls
toward fine-grained, overlapping trial contests (many ways to shave and redirect), while
R11/human tractability pulls toward few trials, coarse power, and floors — and floors +
few trials is exactly the regime where T3 turtles reappear. The 2p design (already the
thinnest case, per file 03's Blotto analysis) sits at this pinch point. The model will
quantify the trade; it cannot dissolve it.

### 6.2 Spellbook strength (Question 2) — critique and revised definitions

- **q(S) as configuration-independent strength: valid as an anchor, with two caveats.**
  It is exogenous to the Trials config (so it breaks the circularity — good), but
  q-equality is *not* Trials-equivalence: two equal-q books can differ enormously in m and
  shape. That is a feature (it is exactly what "shape matters at equal strength" means)
  provided results are always reported as "at equal q_{version}" and never as "at equal
  strength" simpliciter. Caveat 2: q is under experiment (R-11).
- **Partial order is unavoidable — accept it.** Any total order on z either ignores shape
  (m alone) or embeds a valuation of domains, and any valuation derived from Trials
  outcomes is the circularity the spec is trying to avoid. The five comparison classes
  are the correct resolution. Add one rule to prevent re-circularity: *"No metric may
  normalize by, or condition on, a strength score computed from the candidate
  configuration itself. Permitted conditioning variables: q_{version}, m_C, z⁺, and path
  parameters."* (m_C is C-dependent but only through F, the power formula, which is a
  component under test — when comparing configurations with different F, condition on q
  and on card-space descriptions, never on m.)
- **Meaningful controlled paths** (revised list): (π1) same-shape integer scaling in
  *card space* — add cards to the same spell structure and recompute z through F; this
  guarantees reachable shapes and well-defined rounding, unlike scaling z directly;
  (π2) componentwise +k in a single domain (tests R4 and domain-specific dominance);
  (π3) equal-q shape swaps (archetype matrix); (π4) realistic paths sampled from the
  future base-game generator. Scaling z directly by percentages (spec 5.3 path 3) should
  be replaced by π1 — fractional-power rounding on z-space paths creates artifacts F would
  never produce.
- **Dominance thresholds when shapes differ:** do not define them. Between unlike shapes
  report the exact equilibrium value v(z⁺_A, z⁺_B) instead — a threshold presumes a
  1-parameter family, and unlike shapes do not lie on one. Thresholds are path
  properties (R-6), full stop.

### 6.3 Counterability and the turtle theorem (Questions 1, 5)

**Theorem T3 (turtle).** Consider identical resources where a budget of B fungible units
is legal on every active Trial, winner-take-all rewards RP(t), and terminal ties sharing
full RP. If some trial t* satisfies RP(t*) ≥ Σ_{t≠t*} RP(t) (sum over trials the opponent
can legally contest), then the full concentration b* = "everything on t*" is never
strictly beaten: an opponent either contests t* (cannot exceed B, so at best ties t*,
sharing RP(t*), and their diverted remainder yields ≤ Σ_{t≠t*}RP(t) ≤ RP(t*) extra — net
no strict win) or abandons t* (collects ≤ Σ_{t≠t*}RP(t) ≤ RP(t*) = b*'s take). Hence R5
fails. *Exact verification:* trials (5,3), budget 4: allocation (4,0) has zero strict
beaters among all 15 legal allocations. **Design consequence: R5 imposes a reward-spread
condition — every trial's RP must be strictly less than the combined RP of the trials an
equal opponent can realistically contest against it.** Check this against every candidate
reward table *after* applying entry floors and shape-based legality, which shrink the
contestable set: the live 2p table (30 pool, max 7) passes comfortably in the unfloored
game; a floored, shape-constrained state can effectively reduce to 2–3 contestable trials
where the condition can fail.

### 6.4 Counterability battery (Question 5, formalized)

At each tested identical state z⁺, with R = R(z⁺) after collapse:

- **C1 (hard gate):** ∀b ∈ R ∃a ∈ R: u^W(a,b) = 1. (Spec R5, kept.)
- **C2 (hard gate, margin):** ∀b ∈ R: max_a u^M(a,b) ≥ μ, *achieved by outright trial
  results, not tiebreak stages* (μ normative, §4 item 4). Kills configurations that are
  counterable only through efficiency-decimal hair-splitting.
- **C3 (diagnostic):** counter mass — fraction of R strictly beating b; and the count of
  strategically distinct counters. Diagnostic only: any ρ-threshold here is gameable by
  action-space padding even after collapse.
- **C4 (diagnostic):** margin-VOI = E_{b~equilibrium}[max_a u^M(a,b)] − v^M. Must be > 0
  at equality (it is, whenever C1 holds and mixing is nontrivial); its *size* in RP is the
  designer-facing "how much is scouting worth" number. Do not compute VOI under u^W (R-10).
- **C5 (diagnostic):** counter distance — minimum edit distance (units moved) from b to a
  strict counter, and to the *best* counter. If best counters are systematically distance
  ≤ 2, the game is copy-and-shave: informed play is trivial and hidden play is a
  guessing game with no texture.

**Ways to pass literal R5 while being bad, and the detecting metric:** all-margins-zero
tiebreak counters (C2); unique-successor 2-cycles — equilibrium is matching pennies, a
coin flip with extra steps (equilibrium mix entropy ≈ 1 bit with support 2, §5 metric 3);
copy-and-shave (C5); bare-RPS equivalence — passes everything hard, caught only by the §5
primary metrics being all near their degenerate values simultaneously (mix entropy ≈
log 3, margin-VOI = full pool swing, zero fragility texture); tie-manufactured
unpredictability (G5).

### 6.5 Monotonicity counterexample (Question 1/6, exact)

Configuration: one active Trial, Purity-type (one energy domain legal), RP 6; trial tie →
Commitment (allocated to trial ÷ total normal power across all domains); then shared.
State: A = B = 5 Void. Both allocate 5: totals tie, Commitment 5/5 = 5/5, shared → draw
(u^W = 0). Now improve A componentwise: +3 Enchantment power (no legal sink on this
trial). A's only competitive allocation is still 5 Void; Commitment = 5/8 < 5/5 → B now
wins outright. A's *best achievable* utility drops from 0 to −1 under a strict
componentwise improvement: R4 violated, and no allocation choice by A repairs it. The same
mechanism fires in multi-trial states whenever added capacity in a domain cannot be
usefully deployed. Utilization fails similarly when one domain must feed two trials
(added capacity raises the denominator on both while the numerators cannot both absorb
it). This is a property of the *tiebreak family*, not of any particular reward table —
hence R-7 must be decided before G3 can even be phrased.

### 6.6 Dominance thresholds (Question 6) — assessment

With R-4/R-6 applied, all three thresholds are well-defined per path. Meaning: at 2p,
"dominance" should mean guaranteed strict win (u^W = 1), with the "win-or-share" variant
reported alongside (§4 item 11). Δ_G is the designer's "safety" number (a dominant book
*possesses* a clincher — the player must still find it); Δ_R is the experiential number
(a dominant book cannot lose even played complacently) and is the correct user-facing
target, as the spec says; Δ_L (over L*) is a stress bound only. Expect and report
Δ_G ≪ Δ_R; a large gap between them is not a failure — it measures how much skill the
stronger player still needs, which is arguably a feature within the contestable range.
Robust dominance can genuinely fail to exist (Δ_R = ∞) under trial structures where
shape-locked trials give the weaker player an uncontestable reward source (e.g., A has no
Enchantment power at any Δ along π2-in-Void: B always banks Enchantment Mastery's RP, and
if the remaining pool minus that is not majority-winnable by every reasonable A
allocation, no Δ suffices) — this is a *finding about the configuration*, not a model
bug; report it per path. Healthy vs impossible thresholds: a threshold is healthy iff the
Δ at which it fires is achievable by a legal Spellbook pair reachable in real play —
until the base-game generator exists, bound this by card-count arithmetic (max deck
shares, max spell sizes from the rulebook) and label it provisional (Risk 3).

### 6.7 Utility and equilibrium (Question 4) — what depends on what

Safe under either utility at 2p: existence of value, R6 symmetry, C1. Utility-dependent:
R (dominance set — R-1), C2/C4 (margin-native), Δ_G/Δ_R (win-utility native; margin
versions would be different numbers), equilibrium mixtures themselves (win-optimal and
margin-optimal mixes differ — a margin-maximizer takes risks a win-maximizer refuses).
Report equilibria under u^W as primary (matches the victory condition); u^M equilibria as
a diagnostic of "style". Never average the two. At multiplayer, "utility" is a modelling
choice with no canonical answer (win-share vs placement vs RP): every multiplayer claim
must carry its utility label (spec already requires this — enforce it in output schemas).

### 6.8 Reasonable allocations (Question 3) — final recommendation

**Primary objective definition (hard tests):** R_i per R-1/R-2 — strategically distinct
classes surviving iterated *strict* dominance under u^W, against opponents' surviving
sets, simultaneous elimination. Strict-vs-weak: strict is right for the primary set
(order-invariant; weak elimination can delete the last counter to something and silently
break C1's quantifier). Ties and shared rewards are handled inside u^W (tie = 0), so
dominance already accounts for them — no special casing.

**Known weaknesses, owned explicitly:** (i) strict dominance barely prunes (Risk 1) —
hence R-12's equilibrium-relevant set E as the mandatory companion report; (ii)
"undominated only via implausible edge cases" is real — an allocation kept alive solely
by its performance against opponent allocations that are themselves never played. The
clean fix is E; the human-model fix is below. Do **not** adopt ε-best-response or
regret-bounded sets for *hard gates* — both are equilibrium-relative and turn gates into
moving targets.

**Secondary human-behaviour sets (simulation only, never in hard gates):**
H1 = S1 heuristic portfolio (spec §9, keep small: 5–8 named plans); H2 = ε-rationalizable
set (survives iterated elimination of strategies that are never ε-best responses,
ε ≈ 1–2 RP) — this is the right formalization of "a human wouldn't play that", and it is
admissibility-flavoured without weak-dominance order problems.

**"All power allocated":** should *not* be mandatory in the model (R-4/R-5): maximality
is the robust notion, unallocated remainder must always be representable, and — exact
observation from the §8 cycle fixture — allocations holding power back can beat full
concentration, so forcing fullness changes the game, it does not merely tidy it. Whether
*players* may hold back is design (§4 item 10).

**Two-player vs multiplayer:** at 2p, IESDS under u^W on a zero-sum game is equivalent to
rationalizability — the definition is on solid ground. At 3–6p, IESDS is much weaker
(correlated conjectures, utility ambiguity), so R_i keeps the same *formal* definition
per utility but loses its "rational play lives here" interpretation: treat multiplayer R
as a pruning device for computation, never as a behavioural claim (§7).

---

## 7. Multiplayer model (Questions 4, 8)

**What can be exact (3–6p):** resolution G_C on any profile (trivially); unilateral
best-response and regret for one player against a *fixed* profile of others (same DP
oracle as 2p); therefore exact computation of — best-response improvement (spec §13),
kingmaker index (deviations by player i that cannot raise k_i but change argmax_j r_j),
spoiler leverage (same, with cost-to-self ≤ declared bound), coalition sensitivity for
pairs (joint 2-player deviations on fixed others — enumerable via the oracle product on
sampled profiles), and incentive-compatibility conflicts (argmax E[RP] vs argmax P(1st)
against fixed others). All of these are *profile-conditional*: exact given a profile,
empirical over a distribution of profiles.

**What must be simulated:** the profile distribution itself. Use S1/S2 agent populations
with declared parameters and seeds; report placement distributions, contender coverage,
trial congestion, uncontested-award rates, and the lower-placement-reward evaluation
(with/without comparison at 6p — the hybrid's experimental 2nd-place rewards have a named
failure condition in file 03 §6; the model should compute exactly that statistic: share of
2nd-place RP landing on players simultaneously placing 1st elsewhere).

**What should not be claimed:** Nash equilibria at 3–6p. The game is not constant-sum
(shared-full ties inflate the pool; placement utilities are not transferable), equilibria
are non-unique and non-interchangeable, computing them is intractable at realistic sizes
(payoff tensor |R|ⁿ; |R| ≈ 10³ at 5p is already 10¹⁵ entries), and equilibrium selection
would smuggle in exactly the arbitrary assumptions the spec forbids. Report regret
landscapes and deviation metrics instead — the spec's own §9-S4 caution, endorsed and
hardened into a prohibition.

**First-place vs RP utility:** compute both; the incentive-compatibility metric (how often
they conflict) is itself a design-relevant output — frequent conflict at 3–6p is what
creates kingmaking pressure, and the correlation between the two should be reported per
configuration.

**Reserved for human playtesting:** whether kingmaking is *felt* (the index measures
capability, not temptation); whether 2nd-place rewards keep trailing players engaged
(engagement is not a simulable quantity); teach cost and table time (calibrate §5.4);
collusion/signalling behaviour (agents don't table-talk).

---

## 8. Adversarial test library

Every case is small enough to hand-check or exhaustively enumerate. Cases marked ✓ were
verified by exhaustive enumeration during this review. "Config" abbreviations: WTA =
winner-take-all trials, SF = shared-full-RP terminal ties, budget = single fungible domain
legal everywhere unless stated.

| # | Case | Setup | Required result |
|---|---|---|---|
| A1 ✓ | Mirror tie | Identical z⁺, identical allocations | Exact draw; both players' r equal; symmetric under swap (R-8) |
| A2 | Domain relabel | Permute energy domains in state + allocations | Outcome permutes identically (G1) |
| A3 ✓ | Turtle | WTA+SF, budget 4, trials RP (5,3) | (4,0) has zero strict beaters (15 allocations); C1 gate must FAIL this config |
| A4 ✓ | Counter cycle | WTA+SF, budget 6, trials RP (5,4,3) | 84 legal allocations, 0 unbeaten; contains cycle (0,1,1)→(3,0,0)→(0,2,0)→(0,1,1); equilibrium value 0, strictly mixed |
| A5 ✓ | Tie-fest | WTA+SF, budget 4 mandatory-full, trials RP (5,5) | 100% of non-mirror pairs tie 5–5 pre-tiebreak; G5 must FAIL; uncertainty metrics must attribute all variance to ties |
| A6 ✓ | Counterable-but-poor | WTA+SF, budget 6, trials RP (4,4,4) | 0 unbeaten (C1 passes) but 33% of ordered pairs tie — passes letter, fails G5: the discriminating gate is tie rate, not counterability |
| A7 | Monotonicity trap | §6.5 fixture: 1 Purity trial RP 6, Commitment tiebreak; A gains +3 unusable Enchantment | Best achievable u^W drops 0 → −1; G3 must flag under tiebreak option (b), must pass under option (a) |
| A8 | Infeasible fullness | Mandatory-full config; all power in one domain; only 2+-domain trials active | L = ∅ detected; config rejected or residue rule engaged (G2), no crash |
| A9 | Penny squat | No floors; b enters 1 power on a trial A skipped | b wins full RP; resolver correct; diagnostic panel shows uncontested award (rules-level fix is file 03's Minimum Claim, not a resolver change) |
| A10 | Wild legality trio | (i) wild-only entry; (ii) wild satisfying a 2-source requirement; (iii) wild breaking a mono requirement | All three illegal/ignored per rules; wild counts in totals but never in tiebreaks |
| A11 | Over-allocation | Domain 11 used 12 across two trials | Both entries invalidated per hybrid §8; conservation check fires |
| A12 | Tie cascade | Engineered equal totals, equal stage-1, equal stage-2, breadth applicable only on listed trials | Correct stage sequencing; SF at the end; at 6p a shared 1st suppresses 2nd-place RP for that trial |
| A13 | Dominance staircase | Same-shape card-space path π1 from parity | Δ_G ≤ Δ_R; win region contiguity reported; non-monotone pocket (if planted) handled by upper-threshold definition (R-6) |
| A14 | Dead power | Shape with Enchantment power below any usable floor / no legal sink | Dead-power rate detects it; monotonicity comparison vs same state without the dead power consistent with chosen R-7 option |
| A15 | Equivalence inflation | Add a trial nobody can legally enter | Raw |L| grows, collapsed counts and all §5 metrics unchanged |
| A16 | Maya fixture | Hybrid §12 worked example (5p): Void 11, Aether 9, Transformation 16, Enchantment 8, Wild 2; her three-trial allocation | Power derivation, domain conservation (11/11, 9/9, 16/16, 8/8, 2/2), trial totals (10 / 21 / 15) reproduced exactly |
| A17 | Baseline-vs-hybrid formula | Same Spellbook under old multiplier F and 2n−3 F | Both configs representable; 5-card spell: 8 (old, rounded) vs 7 (2n−3); model attributes differences to F, not to resolver |
| A18 | Floored turtle | A4's config + entry floor of 4 on every trial | Contestable set shrinks; check whether an unbeatable concentration reappears (T3 applied to floored game) — regression test that floors are re-checked against C1 |

---

## 9. Computational architecture (Question 11)

### 9.1 Where the explosion is

Allocation spaces are products of per-domain compositions. Realistic single-domain pool
~11 into 7 trials + unallocated: C(18,7) ≈ 31.8k compositions; across 4–8 domains the raw
product is 10⁹–10¹⁵ before wild. **Raw enumeration of allocations is dead at realistic
sizes; enumeration of allocation *pairs* is doubly dead.** What saves the 2p program:
payoffs depend only on per-trial totals plus tiebreak keys, best responses decompose per
domain (allocating domain d across trials is independent of domain d′ given the opponent's
totals), and equilibria of Blotto-like games have small-support structure in practice.
Multiplayer joint profiles (|R|ⁿ) are beyond exact treatment at any realistic size — by
design, §7 never needs them.

### 9.2 Method per metric

| Task | Method | Notes |
|---|---|---|
| Resolver G_C | direct evaluation | pure function; property-tested (G1) |
| Legality / feasibility | constraint check per allocation; feasibility via greedy maximality | exact |
| Equivalence collapse | canonical key = (per-trial totals, tiebreak keys) | exact; do before everything |
| Strict dominance / R | pairwise on collapsed classes for small states; skip at scale (R ≈ L anyway, Risk 1) | exact where done |
| Best response to fixed profile | per-domain DP (knapsack-like over trials), wild placed greedily on near-ties, exactness restored by bounded local search over floor/legality couplings; fall back to IP if the config couples domains (e.g., Purity's exactly-one-source) beyond DP reach | exact; this oracle is the workhorse |
| 2p equilibrium | **double oracle**: start with small strategy sets, alternately add exact best responses, solve the growing LP (zero-sum), stop at oracle-verified value convergence | exact on convergence; validated against exhaustive LP on tiny fixtures (A4: value must be 0) |
| Counterability C1/C2 | best-response oracle per b | exact; enumerate b over R for small states, over E + samples at scale |
| Δ_G / Δ_R / Δ_L | path sweep + oracle; Δ_G = "does A's maximin over R_B reach 1"; Δ_R = "is A's *worst* reasonable allocation still winning" (min-max via oracle) | exact per state; sweep granularity = 1 card (π1) |
| Value curves v(Δ) | double-oracle per path point | exact |
| Compensation / S1-S2 matchups | agent simulation, seeded, CIs | empirical estimate, labelled |
| Multiplayer deviation metrics | oracle vs sampled profiles | exact-given-profile, empirical over profiles |
| Archetype matrix | equilibrium value per pair at equal q | exact per cell; cell count is the budget constraint |
| Monte Carlo anywhere else | only over Spellbook/state distributions, never over 2p allocation solving | spec constraint, kept |

Heuristic/evolutionary search: only for *configuration*-space exploration (searching
reward tables), never for solving a fixed game — and defer even that until the pipeline
below exists, per the "do not optimize the existing configuration" constraint.

### 9.3 Vertical slices for Kiro (in order)

1. **VS1 — Resolver + fixtures.** G_C as a pure function over (C, z⁺ profile,
   allocations). Ships with test library §8 (A1–A2, A5, A7–A12, A16–A17). No solving. This
   slice alone already answers "are the rules well-defined?" — R-3/R-7 gaps will surface
   here as unimplementable branches, which is the point.
2. **VS2 — Small-state exact lab.** Enumeration, collapse, dominance, exhaustive 2p payoff
   matrices, LP equilibrium — capped at collapsed-matrix sizes ~10⁴×10⁴. Reproduces every
   ✓ number in this review (A3, A4, A6). This is the ground-truth generator for VS3+.
3. **VS3 — Best-response oracle.** Per-domain DP/IP, validated cell-by-cell against VS2.
   Unlocks C1/C2 at scale and all multiplayer deviation metrics.
4. **VS4 — Double-oracle 2p equilibrium.** Validated on VS2 states (value agreement to
   exactness). Unlocks value curves, mix entropy, margin-VOI, Δ sweeps (with VS3).
5. **VS5 — Path sweeps + report schema.** π1/π2/π3 paths, thresholds per R-6, per-player-
   count reporting, exact-vs-sampled labelling baked into the output format.
6. **VS6 — Multiplayer simulation harness.** S1/S2 populations + VS3 deviation metrics.
   Explicitly last: everything in VS1–VS5 is decision-grade without it.

Tractability limits, stated honestly: VS2 dies beyond ~7 trials × ~40 total power ×
multi-domain coupling; VS4's convergence on floored/coupled configs is not guaranteed
fast (double oracle can add many strategies on knife-edge games — A5-like configs are the
adversarial case) — cap iterations, report gap on non-convergence, never silently
approximate; the archetype matrix budget is O(cells) equilibrium solves — keep archetypes
to the spec's 9 and q-bands coarse.

### 9.4 Terminal-state boundary (Question 10)

**Valid from terminal states alone:** everything structural — G1–G5 gates, T1–T3
consequences, counterability at declared states, value curves and thresholds along
synthetic paths, tiebreak pathology hunting, complexity counting, archetype matchups *as
conditionals* ("if these shapes meet at equal q, then…").

**Invalid without build modelling:** any frequency or "usually" claim (how often shapes
meet, whether Δ_R is reachable, uncontested-trial rates in real games); whether the
Trials *retroactively distort base-game strategy* (spec §12's own concern — a
Trials-aware builder changes the Spellbook distribution, which changes every empirical
metric); metagame convergence (do repeat players collapse to one build?); and the
realized value of q-vs-shape trade-offs during drafting. The separation risk is
one-directional and manageable: structural failures found now are real failures
(build adaptation cannot un-break a turtle); structural *passes* are provisional until
realistic distributions exist.

**Interface the first model must expose:** (i) a state supplier contract — iterate/sample
(z⁺, q_{version}, provenance-label, player-count) profiles, with "synthetic-controlled /
synthetic-adversarial / playtest-import / simulator-import" provenance enums, so the
later base-game simulator is a drop-in supplier; (ii) the resolver and best-response
oracle as pure, side-effect-free functions so a future build-phase agent can use
Trials-EV as a reward signal; (iii) all empirical metrics parameterized by supplier, so
every report is stamped with the distribution it is conditional on (Risk 3 discipline).

---

## 10. Kiro-ready acceptance tests

MATH-prefixed tests are correctness (must pass, no discretion); DESIGN-prefixed are
target thresholds (numbers owned by Sam, §4; the model reports, the designer judges).
Fixtures reference §8.

**MATH-1 (resolver determinism/symmetry).** A1, A2 pass byte-identically across runs.
**MATH-2 (conservation).** For every resolved state, Σ_trials allocated_d ≤ p_d per
domain, with equality iff the allocation is full; every awarded RP traces to exactly one
trial award (A11 negative case fires).
**MATH-3 (Maya).** A16 reproduces: powers (11, 9, 16, 8, wild 2); trial totals 10 / 21 /
15; all domain ledgers exactly exhausted.
**MATH-4 (formula).** 2n−3 table: sizes 3→3, 4→5, 5→7, 6→9, 7→11, 10→17; old-formula
5-card spell → 8 (7.5 rounded); enchantment scale 4/8/12. A17 passes under both F.
**MATH-5 (enumeration).** WTA+SF, budget 6, trials (5,4,3), partial allocation legal:
exactly 84 legal allocations; strictly-unbeaten count 0; the cycle
(0,1,1)→(3,0,0)→(0,2,0)→(0,1,1) verified. Same config, budget 4, trials (5,3): 15
allocations, exactly one never-strictly-beaten allocation, namely (4,0).
**MATH-6 (tie accounting).** Budget 4 mandatory-full, trials (5,5): every non-mirror pair
resolves 5–5 pre-tiebreak (A5); trials (4,4,4), budget 6: ordered-pair tie rate = 1/3
(A6).
**MATH-7 (equilibrium).** LP on the A4 collapsed matrix returns value exactly 0 and a
strictly mixed equilibrium; double oracle (VS4) reproduces the value on the same fixture.
**MATH-8 (monotonicity harness).** A7 under tiebreak option (b) reports the u^W drop
0 → −1; under option (a) reports no violation. (Which option is *correct* is R-7's
decision; the harness must detect both ways.)
**MATH-9 (threshold definitions).** On a planted non-monotone path (A13), the reported
Δ_Φ equals the upper threshold, and the first-hold Δ plus contiguity flag are also
emitted.
**MATH-10 (collapse invariance).** A15: all §5 metrics identical before/after adding the
unenterable trial.

**DESIGN-1 (counterability margin).** At every tested identical state of the candidate
config: C1 holds and C2 holds with μ = smallest active-trial RP. *Threshold normative.*
**DESIGN-2 (tie budget).** Under 2p equilibrium play at parity: pre-tiebreak tie rate and
beyond-stage-1 rate below Sam's bounds (§4 item 3).
**DESIGN-3 (contestable range).** On π1 paths: a Δ-interval of declared width where
0.55 ≤ P(stronger wins) ≤ 0.95 under equilibrium, and S2-vs-S1 reverses ≥ a declared
share of games at mid-interval.
**DESIGN-4 (dominance reachability).** Δ_R(π1) finite and ≤ the declared percentile of
realistic advantage (provisional card-space bound until the simulator exists).
**DESIGN-5 (depth floor).** At parity: equilibrium support ≥ 3 strategically distinct
allocations and mix entropy ≥ a declared floor; margin-VOI within a declared band (too
low = counters meaningless; equal to the full pool = copy-and-shave, C5 check).
**DESIGN-6 (complexity ceiling).** §5.4 counts under declared table budgets per player
count.
**DESIGN-7 (multiplayer health, per count 3–6).** Contender coverage ≥ 2 in a declared
share of simulated games; kingmaker index and spoiler leverage below declared bounds; at
6p, 2nd-place RP share landing on already-1st-placing players below the file-03 failure
condition.

---

## 11. Open assumptions register

Anything here changing invalidates marked downstream results.

1. **q version** — standard scoring is v3.1 *under experiment* (kill → re-run every
   equal-q and strength-curve analysis; R-11).
2. **Tie rule** — shared-full-RP assumed (both live and hybrid). Divided-reward or
   no-award ties change T3's boundary, tie-rate gates, and all equilibrium values.
3. **Information structure I** — Spellbooks fully public at allocation time. Any hidden
   build element (or file 03's Champion's Mark, which adds a hidden *valuation*) makes
   the 2p game imperfect-information beyond the allocation itself: the LP/double-oracle
   machinery still works only because allocation is one simultaneous move — a Mark is one
   more simultaneous hidden choice and *can* be folded into the action space, but the
   action space multiplies by |trials|.
4. **Integer, non-splittable power units** — all granularity arguments (T2 wiggles, C5
   distances, floor effects) assume this.
5. **Optional allocation is representable** (R-4/R-5) — if a config *forces* fullness
   with no residue, feasibility failures are possible and A8 governs.
6. **Trial lists per player count** — live file and hybrid disagree (6 trials always +CM
   vs 4→7 scaling). The model must take T per count as config input, not constant.
7. **Echo at 5–6p; no 7p** — baseline file's 7p table treated as stale (F8).
8. **Final tiebreak chain reaches S-level features** — τ extension (R-3) assumed
   sufficient; if future tiebreaks read un-encoded features, z-closure fails again.
9. **Wild magic granularity** (0–3 typical) — if wild inflates (rules change), the
   "wild as ±2 noise on near-ties" reading in file 03 breaks and wild needs its own
   strategic analysis.
10. **Minimum Claim not yet adopted** — both branches must be modelled (§4 item 12; A18).
11. **Reachable advantage distribution unknown** — every "realistic" claim is
    provisional until playtest import or the base-game simulator (Risk 3; DESIGN-4
    provisional bound).
12. **Human error is not in the model** — resolver assumes legal play; the observed
    over-allocation error mode is handled procedurally (allocation sheets), and §5.4
    calibration is the only place errors enter.
13. **2p Trials are opt-in** (decision 2026-07-09) — 2p pathologies gate the *variant's*
    quality, not the base 2p game; priority weighting across player counts is Sam's call.

---

*Method note: every "✓ / exact" claim in this review (84/0/cycle; 15/1 turtle; 100%
tie-fest; 1/3 tie rate) was verified by exhaustive enumeration of the stated toy game
during the review. Theorems T1–T3 are proofs, not simulations. Everything labelled
design judgement is exactly that.*


