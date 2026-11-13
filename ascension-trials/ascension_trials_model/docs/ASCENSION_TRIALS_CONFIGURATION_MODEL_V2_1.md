---
title: Ascension Trials Configuration Model v2.1
type: modelling-specification
date: 2026-07-10
status: approved-for-VS1-VS2
purpose: Corrected mathematical and evaluative specification for comparing Ascension Trials configurations across player counts.
supersedes:
  - "ASCENSION_TRIALS_CONFIGURATION_MODEL.md"
  - "ASCENSION_TRIALS_CONFIGURATION_MODEL_V2.md"
reviewed_by:
  - "ascension-trials/design-history/ASCENSION_TRIALS_04_CONFIG_MODEL_ADVERSARIAL_REVIEW_2026-07-10.md"
  - "_review/ASCENSION_TRIALS_MODEL_READINESS_REVIEW_2026-07-10.md"
related:
  - "rulebook/Ascension Trials.md"
  - "rulebook/Archmage Ascension - Complete Rulebook.md"
---

# Ascension Trials Configuration Model v2.1

## 1. Purpose

The model compares alternative Ascension Trials configurations separately at 2, 3, 4, 5 and 6 players.

A good configuration must balance:

1. **Spellbook strength:** a stronger final Spellbook provides a clear advantage.
2. **Allocation skill:** superior hidden allocation can overcome a moderate Spellbook disadvantage.
3. **Dominance:** a sufficiently dominant Spellbook eventually becomes unbeatable under reasonable play.
4. **Counterplay:** at equal resources, every fixed reasonable pure allocation exposes a strict counter.
5. **Strategic uncertainty:** the winner is not obvious before allocations are revealed.
6. **Determinism:** uncertainty comes from concealed choices, not random resolution.
7. **Human tractability:** the endgame remains calculable and playable at the table.
8. **Player-count fitness:** a configuration is not accepted merely because it works at another player count.

The current Trials rules, the hybrid rebuild and any later proposals are candidate configurations. None is assumed correct.

---

## 2. Model Boundary

### 2.1 Included

- Final Spellbooks and imported terminal states.
- Spell-to-power conversion.
- Power domains and Wild Magic.
- Trial availability and eligibility.
- Power-allocation rules.
- Entry floors or Minimum Claim rules.
- Trial rewards, lower-place rewards and tie awards.
- Trial and final-result tiebreaks.
- Simultaneous hidden allocation.
- Exact two-player strategic analysis.
- Bounded-rational multiplayer simulation.
- Recognition Points, winners and final placement.
- Structural and human-complexity proxies.

### 2.2 Initially excluded

- Full base-game turn simulation.
- Trials-aware Spellbook construction.
- Table talk, collusion and signalling.
- Subjective excitement and thematic payoff.
- Human timing and error data beyond explicitly imported observations.
- Random Trials resolution.

A later base-game simulator must be able to supply reachable, Trials-aware terminal states without changing the core resolver or analysis interfaces.

---

## 3. Adopted Modelling Decisions

These are provisional modelling defaults selected from the adversarial review. They are configuration parameters, not irreversible rules decisions.

| ID | Decision | Adopted default |
|---|---|---|
| MD-1 | Trial tiebreak family | Allocation-local tiebreaks; no ratios using unallocated or total Spellbook power |
| MD-2 | Allocation completion | **Maximal allocation** with an explicit residue bucket; literal full allocation is optional by configuration |
| MD-3 | Minimum Claim | No-floor baseline first; floors remain configurable and must be re-tested for turtle strategies |
| MD-4 | Counter requirement | Every reasonable equal-state allocation must have an outright winning counter not dependent solely on final tiebreaks |
| MD-5 | Counter margin | Hard minimum of +1 RP; target of at least the smallest active Trial reward for at least 90% of equilibrium-relevant allocations |
| MD-6 | Tie budget | Final shared-winner probability ≤5%; overall result requiring final Spellbook tiebreaks ≤5%; per-Trial shared-award rate target ≤10% |
| MD-7 | Dominance target | Robust dominance should begin near the 95th percentile of realistically reachable same-shape advantage; provisional acceptable band 90th–99th percentile |
| MD-8 | RPS-in-disguise | A counter-cycle is necessary but insufficient; support, entropy, counter distance and margin texture are all required |
| MD-9 | Player-count variation | Rewards and active Trials may vary by count; core power and allocation semantics vary only if no common candidate survives |
| MD-10 | Multiplayer dominance | Dominance means guaranteed **sole first place**; shared first is reported separately and does not satisfy dominance |
| MD-11 | Archetype structure | Matchup cycles are allowed; no equal-\(q\) archetype may be broadly dominant across the matrix |
| MD-12 | Model selection | Hard filters, then Pareto comparison, then a lexicographic recommendation; no weighted global score |

The model may recommend changing these defaults when comparative evidence demonstrates a superior branch. Any change must be explicit in the report.

---

## 4. Configuration Definition

For player count \(n\), a configuration is:

\[
C_n=(F,D,T,L,A,W,R_n,B,I,P)
\]

Where:

- \(F\): Spellbook-to-power conversion.
- \(D\): normal power domains and their classes.
- \(T\): active Trials.
- \(L\): declarative entry predicates for each Trial.
- \(A\): allocation, completion and invalidation rules.
- \(W\): Wild or flexible-power rules.
- \(R_n\): reward schedule at player count \(n\).
- \(B\): Trial and final-result tiebreak rules.
- \(I\): public and hidden information.
- \(P\): numerical and resolver policies, including rounding and tolerance metadata.

A configuration must be **state-closed**: every fact read by its power derivation, resolver or tiebreak chain must appear in the configuration, the Spellbook record or the derived player state.

### 4.1 Declarative Trial eligibility

Trial eligibility is represented as a conjunction of declared predicates. There is no ambiguous `mode` precedence.

A normal source is a domain with positive normal power allocated to that Trial. Wild Magic is never a source.

Each Trial may declare:

- `allowed_domain_ids`;
- `allowed_domain_classes`;
- `source_count_universe`;
- `minimum_sources`;
- `maximum_sources`;
- `required_class_counts`;
- `required_domain_counts`;
- `forbidden_domain_ids`;
- `forbidden_domain_classes`;
- `entry_floor`.

All populated predicates must hold. Empty fields impose no restriction.

`source_count_universe` determines which positive normal domains are counted:

- `allowed`: domains passing the Trial's allow-list;
- `all_normal`: every normal domain;
- `class:<id>`: only domains in the named class.

Examples:

- Energy Purity: allowed class `energy`; source count over `class:energy` exactly 1.
- Energy Harmony: allowed class `energy`; source count over `class:energy` at least 2.
- Transformation: required domain `transformation` at least 1; all other normal domains forbidden.
- Enchantment: required domain `enchantment` at least 1; all other normal domains forbidden.
- Focused Power: source count over `all_normal` exactly 1.
- Universal Power: source count over `all_normal` at least 2.
- Complete Mastery: `required_class_counts = {energy: min 1, transformation: min 1, enchantment: min 1}`.

A configuration-specific rule that cannot be expressed through these predicates is not accepted into VS1 merely as `custom`; the schema must be extended declaratively first.

### 4.2 Invalidation policy

Allocation illegality is separated by scope:

- **Illegal Trial entry:** invalidate or ignore that player's entire entry on that Trial.
- **Over-allocated domain:** invalidate every Trial entry drawing positive power from that domain.
- **Over-allocated Wild pool:** invalidate every Trial entry drawing Wild.
- **Completion-policy failure:** reject the whole allocation or apply the configured fallback.
- **Negative or malformed values:** reject the whole allocation.

The baseline implementation convention is:

- `illegal_trial_entry: ignore_entry`;
- `overallocated_domain: invalidate_entries_using_domain`;
- `overallocated_wild: invalidate_entries_using_wild`;
- `malformed_allocation: reject_profile`.

The resolver must never silently clip power.

### 4.3 Wild attached to an illegal entry

Wild may be added only after the normal entry is independently legal.

If the normal entry is illegal or is invalidated through over-allocation, all Wild attached to that Trial entry is also ignored. Wild cannot make an illegal normal source combination legal.

Wild does not count as a source. Therefore:

- a Wild-only entry is illegal;
- one normal source plus Wild does not satisfy a two-source requirement;
- Wild added to an otherwise legal mono-source entry does not break that mono-source requirement.

### 4.4 Historical candidate semantics

Historical candidate configurations must be deterministic even where their source wording was ambiguous. Their configuration files must be marked `historical_candidate: true` and record any interpretive convention used solely to make the candidate executable.

The stale live baseline must:

- support analysis only at 2–6 players;
- omit Echo as it historically did;
- retain its legacy power formula and ratio tiebreaks;
- be labelled stale-by-design rather than canon.

The hybrid rebuild is a separate candidate and must not inherit baseline fields implicitly.

## 5. Spellbook and Player State

### 5.1 Spellbook input

A Spellbook is a list of spells. Each spell record contains:

- stable spell ID;
- spell type: `conjuration`, `transfiguration`, `perfect_transmutation` or `enchantment`;
- integer size;
- energy domain for Conjuration and Perfect Transmutation;
- optional source-card metadata not required by the first model.

The configuration declares valid size ranges and required fields by spell type.

### 5.2 Derived player state

For player \(i\), the model state is:

\[
z_i^+=(p_i,w_i,\tau_i,q_i,v_i,\rho_i)
\]

Where:

- \(p_i\in\mathbb Z_{\ge0}^{|D|}\): normal domain-power vector.
- \(w_i\in\mathbb Z_{\ge0}\): Wild or flexible power.
- \(\tau_i\): tiebreak-relevant Spellbook statistics required by \(B\).
- \(q_i=q_v(S_i)\): independent standard Spellbook score.
- \(v_i\): version identifier for the independent scoring system.
- \(\rho_i\): provenance metadata.

Typical \(\tau_i\) fields include:

- spell count;
- largest spell size;
- counts by spell type;
- any other declared final-tiebreak statistic.

Permitted provenance values:

- `synthetic-controlled`;
- `synthetic-adversarial`;
- `playtest-import`;
- `simulator-import`.

A configuration that references an undeclared Spellbook property is invalid until \(\tau\) is extended.

### 5.3 Required power-formula profiles

The schema must represent at least these candidates.

#### Legacy v2.8 profile

For Conjuration, Transfiguration and Perfect Transmutation:

\[
f_{\text{legacy}}(n)=
\begin{cases}
n & n\le4\\
\operatorname{round\_half\_up}(1.5n) & 5\le n\le6\\
2n & n\ge7
\end{cases}
\]

- Conjuration contributes \(f_{\text{legacy}}(n)\) to its energy domain.
- Transfiguration contributes \(f_{\text{legacy}}(n)\) to Transformation.
- Perfect Transmutation contributes that amount to both its energy domain and Transformation, and grants +1 Wild.
- Legacy Enchantment contributes its configured value, historically spell size.
- Legacy Wild generation from Enchantment is configuration data, historically +1 at size 4.

#### Hybrid \(2n-3\) profile

For Conjuration, Transfiguration and Perfect Transmutation:

\[
f_{\text{hybrid}}(n)=2n-3
\]

- Perfect Transmutation contributes to both its energy and Transformation and grants +1 Wild.
- Hybrid Enchantment uses an independent table: size 3 → 4, size 4 → 8, size 5 → 12.
- Hybrid Enchantments of size 4 or 5 each grant +1 Wild.

Rounding policy is explicit configuration data. The default legacy interpretation is round-half-up; language-runtime banker rounding must not be used accidentally.

## 6. Spellbook Strength

No single scalar represents every Spellbook.

### 6.1 Independent score

\[
q_v(S)=\text{standard non-Trials score under scoring version }v
\]

Every result using \(q\) must state the scoring version. Comparisons must be rerun if that version changes.

### 6.2 Total Trial resources

\[
m_C(S)=\sum_{d\in D}p_d+w
\]

This is descriptive, not a universal strength ordering.

### 6.3 Shape

\[
z_C(S)=(p_1,\ldots,p_{|D|},w)
\]

Shape captures concentration, breadth and legal access.

### 6.4 Permitted comparison classes

1. **Identical resources:** \(z_A^+=z_B^+\).
2. **Equal independent score:** \(q_v(S_A)=q_v(S_B)\), shapes may differ.
3. **Same-shape card-space paths:** add legal cards to the same spell structure and recompute power through \(F\).
4. **Single-domain componentwise paths:** add power to one domain.
5. **Realistic unmatched states:** imported independently from play or simulation.

Direct percentage scaling of a power vector is not a primary path because it can generate unreachable rounding artifacts.

No metric may use a candidate configuration's own outcome value as an allegedly independent strength score.

---

## 7. Allocations

### 7.1 Legal allocation

A legal allocation assigns integer normal and Wild power to active Trials while satisfying:

- source conservation;
- Trial source requirements;
- Wild restrictions;
- entry floors;
- allocation-completion policy.

Each allocation explicitly records residue.

### 7.2 Completion policies

- **OPTIONAL:** any legal amount may remain as residue.
- **MAXIMAL:** residue is permitted only when no remaining unit can legally be added to any active Trial.
- **FULL:** all power must be assigned; if impossible, the state is infeasible unless a fallback is explicitly configured.

The adopted baseline is `MAXIMAL`.

Let \(\mathcal L_i^*\) denote the maximal legal allocations for player \(i\). Under a full-allocation configuration, \(\mathcal L_i^*=\mathcal L_i\).

Every generated reachable state must satisfy:

\[
\mathcal L_i^*\neq\varnothing
\]

Otherwise the configuration fails feasibility.

### 7.3 Strategic equivalence

Two allocations are strategically equivalent when, against every opponent allocation profile, they produce identical:

- win utility;
- RP-margin utility;
- final winner/placement;
- Trial-award vector.

Equivalent allocations are collapsed before diversity, dominance and support metrics are calculated.

### 7.4 Strict dominance

Dominance is defined using win utility.

Allocation \(a\) is **strictly dominated** by \(a'\) when:

\[
u_i^W(a',a_{-i})>u_i^W(a,a_{-i})
\]

for **every** surviving opponent profile \(a_{-i}\).

The weaker condition

\[
u_i^W(a',a_{-i})\ge u_i^W(a,a_{-i})
\]

for all profiles with strict improvement for at least one profile is weak dominance and is diagnostic only.

### 7.5 Iterated elimination of strictly dominated strategies

- Round 0: \(R_i^0\) is the set of strategically distinct maximal legal allocations.
- Round \(k+1\): simultaneously remove each allocation strictly dominated by another member of \(R_i^k\) against all profiles in \(\prod_{j\ne i}R_j^k\).
- Stop at the fixed point:

\[
\mathcal R_i=\lim_{k\to\infty}R_i^k
\]

True strict-dominance elimination is order-independent in finite games.

### 7.6 Equilibrium-relevant set

Strict dominance may remove almost nothing. The model therefore also reports:

\[
\mathcal E_i^{0.01}
\]

the strategies whose maximum achievable probability in any optimal two-player equilibrium is at least \(1\%\).

For small exact games, determine this by maximizing each strategy's probability subject to the player's equilibrium constraints.

If:

\[
\frac{|\mathcal R_i|}{|\mathcal L_i^*|}>0.9
\]

counterability and dominance results must be reported over both \(\mathcal R\) and \(\mathcal E^{0.01}\).

---

## 8. Resolution

For a fixed configuration and state profile, resolution is deterministic.

Required order:

1. Validate configuration and state closure.
2. Derive player states from Spellbooks where Spellbooks are supplied.
3. Validate non-negative allocations and reconcile source ledgers.
4. Apply over-allocation invalidation by domain and Wild pool.
5. Determine each remaining normal Trial entry's legality from declarative predicates.
6. Drop Wild attached to any illegal or invalidated normal entry.
7. Calculate normal and Wild totals by Trial.
8. Compare Trial totals.
9. Apply the configured Trial tiebreak chain.
10. Award winner, lower-place and tie Recognition Points.
11. Aggregate player Recognition Points.
12. Apply the configured final-result tiebreak chain.
13. Return results and a complete audit trace.

Monte Carlo may sample states or bounded-rational strategies. It must never replace deterministic resolution.

### 8.1 Trial tiebreak vocabulary

Supported Trial-tiebreak tokens are:

- `total_power`: normal plus legal Wild on this Trial.
- `normal_power`: legal normal power on this Trial.
- `qualifying_source_count`: number of positive normal sources counted by the Trial's declared counting universe.
- `legacy_utilization`: normal power on this Trial divided by the total capacity of normal domains used positively on this Trial.
- `legacy_focus`: normal power on this Trial divided by the player's total normal power across all domains.
- `hybrid_efficiency`: same mathematical convention as `legacy_utilization`, retained as a separate token for provenance.
- `hybrid_commitment`: same mathematical convention as `legacy_focus`, retained as a separate token for provenance.
- `shared`: terminal shared Trial award.

Wild is excluded from all ratio and source-count tiebreaks.

The ratio definitions above are executable historical conventions, not endorsements. They exist to test the legacy and hybrid candidates and are expected to expose monotonicity failures.

### 8.2 Final-result tiebreak vocabulary

Supported final-result tokens are:

- `first_place_trial_count`: number of outright first-place Trial awards.
- `total_normal_power`: sum of all normal domain power in the derived state.
- `spell_count`: \(\tau.\text{spell_count}\).
- `largest_spell`: \(\tau.\text{largest_spell}\).
- `shared`: terminal shared final result.

Recognition Points are always compared before these tokens.

Every token declares whether it reads Trial results, \(z^+\) or \(\tau\). Unrecognized tokens invalidate the configuration.

## 9. Adopted Tiebreak Default

The preferred Trial tiebreak chain is allocation-local:

1. Higher total legal power on the Trial.
2. If tied, higher **normal** power on the Trial, excluding Wild Magic.
3. If tied and the Trial permits multiple normal sources, more distinct qualifying normal sources on that Trial.
4. Shared Recognition.

Stages that do not apply are skipped.

No default tiebreak may divide by:

- total Spellbook power;
- total domain capacity;
- power outside the contested Trial.

Legacy Commitment and Utilization ratios remain representable as comparison branches. They are expected to fail monotonicity tests.

Final-result tiebreaks remain configuration-defined and must read only declared \(\tau\) fields.

---

## 10. Utility

### 10.1 Two players

#### Win utility

\[
u_i^W=
\begin{cases}
1 & \text{sole win}\\
0 & \text{shared final result}\\
-1 & \text{loss}
\end{cases}
\]

#### Margin utility

\[
u_i^M=r_i-r_j
\]

Both are antisymmetric, so every fixed two-player Trials game is finite and zero-sum under either utility.

Win utility is primary. Margin utility is diagnostic. Equilibria under the two utilities must not be averaged.

### 10.2 Multiplayer

Report separately:

- probability of sole first;
- probability of shared first;
- expected placement;
- expected Recognition Points;
- expected gap from first.

Any best-response or regret result must name its utility:

- `sole_first`;
- `placement`;
- `recognition_points`.

No general multiplayer Nash-equilibrium claim is permitted.

---

## 11. Core Requirements

### G1. Determinism, symmetry and conservation

- Identical inputs produce identical results.
- Player relabelling commutes with resolution.
- Equivalent normal-domain relabelling commutes with resolution.
- Every allocated unit is accounted for exactly once unless the configuration explicitly permits duplication.

### G2. Feasibility

Every reachable state has at least one maximal legal allocation.

### G3. Optimal monotonicity

For any componentwise improvement:

\[
z_i^{+\prime}\ge z_i^+
\]

the player's best achievable win utility may not decrease:

\[
V_C(z_i^{+\prime},z_{-i}^+)\ge V_C(z_i^+,z_{-i}^+)
\]

This is a hard requirement for the adopted local tiebreak family.

Because power is integer, value curves may contain flat steps. Local non-monotone pockets must be reported and fail G3 unless caused solely by a separately approved experimental rule.

### G4. Equal-state counterability

At each tested identical state \(z^+\):

\[
\forall b\in\mathcal R(z^+),\quad
\exists a\in\mathcal R(z^+):
u_A^W(a,b)=1
\]

The counter must win through Trial awards and must not rely solely on the final Spellbook tiebreak.

Report the same statement over \(\mathcal E^{0.01}\).

### G5. Counter quality

For every \(b\in\mathcal E^{0.01}\):

\[
\max_a u_A^M(a,b)\ge1
\]

Provisional quality target:

\[
\max_a u_A^M(a,b)\ge r_{\min}
\]

for at least 90% of \(b\in\mathcal E^{0.01}\), where \(r_{\min}\) is the smallest active Trial reward.

Report:

- counter count;
- counter mass;
- best and nearest counter margin;
- minimum units moved to a strict counter;
- minimum units moved to the best-margin counter.

### G6. Symmetric hidden-play fairness

At identical states, the two-player game value is exactly zero under both antisymmetric utilities.

This is a theorem and a resolver property test, not a simulation target.

### G7. Tie discipline

Under the canonical maximum-entropy win-utility equilibrium at parity:

- final shared-winner probability must be ≤5%;
- probability the final winner requires a final Spellbook tiebreak must be ≤5%;
- per-Trial shared-award rate should be ≤10%.

A configuration cannot pass by manufacturing uncertainty through ties.

### G8. Spellbook advantage

Along same-shape card-space paths, stronger Spellbooks must show an increasing trend in:

- equilibrium win value;
- sole-win probability;
- RP-margin value.

Discrete flat steps are acceptable; sustained inversion is not.

### G9. Contestable middle range

Before robust dominance, there must be a non-trivial interval in which:

- equal strategic skill favours the stronger Spellbook;
- the stronger Spellbook is not guaranteed victory;
- a weaker S2 allocator can beat a stronger S1 allocator with material frequency.

Initial 2p calibration targets:

- at approximately 10% independent-score disadvantage, S2 versus S1 weaker-player win rate ≥25%;
- at approximately 20% disadvantage, win rate ≥10%;
- the stronger player's equilibrium sole-win probability remains between 55% and 90% for at least two adjacent reachable path steps.

These are provisional targets to be reviewed after baseline curves exist.

### G10. Dominance

Dominance thresholds are path properties.

Fix a reachable strength path:

\[
\pi:[0,\Delta_{\max}]\rightarrow(z_A^+,z_B^+)
\]

with parity at \(\Delta=0\).

For a property \(\Phi\), define its **upper threshold**:

\[
\Delta_\Phi(\pi)
=
\min\{\Delta:
\Phi\text{ holds at every }\Delta'\ge\Delta\}
\]

and \(\infty\) if no such point exists.

Report:

- first point where \(\Phi\) holds;
- upper threshold;
- whether the winning region is contiguous.

#### Guarantee threshold

\[
\Phi_G:
\exists a_A\in\mathcal R_A\ 
\forall a_B\in\mathcal R_B,\ 
u_A^W(a_A,a_B)=1
\]

#### Robust threshold

\[
\Phi_R:
\forall a_A\in\mathcal R_A\
\forall a_B\in\mathcal R_B,\ 
u_A^W(a_A,a_B)=1
\]

#### Universal maximal threshold

\[
\Phi_L:
\forall a_A\in\mathcal L_A^*\
\forall a_B\in\mathcal L_B^*,\
u_A^W(a_A,a_B)=1
\]

Also report \(G\) and \(R\) over \(\mathcal E^{0.01}\).

Expected ordering:

\[
\Delta_G\le\Delta_R\le\Delta_L
\]

when finite and evaluated over nested sets.

The provisional design target is for robust dominance to begin around the 95th percentile of realistically reachable same-shape advantage, with 90th–99th percentile treated as the acceptable initial band.

### G11. Reward-spread constraint

For every tested equal-resource state, no Trial may become an unbeatable concentration target merely because its reward is at least the combined reward of all other Trials the opponent can legally contest.

This must be rechecked after applying:

- player-count Trial lists;
- source restrictions;
- Minimum Claim floors;
- Spellbook-shape restrictions.

### G12. No artificial randomness

No candidate requires random tie resolution or stochastic effects to produce uncertainty.

### G13. Human tractability

A configuration cannot qualify by creating a huge action space.

Until human calibration exists, report separately:

- allocation entries written;
- near-tie decisions;
- active legality checks;
- tiebreak comparisons executed.

Provisional structural ceilings:

| Player count | Allocation entries | Active legality rules | Expected final tiebreak depth |
|---|---:|---:|---:|
| 2 | 12 | 4 | ≤1.1 stages |
| 3–4 | 18 | 5 | ≤1.2 stages |
| 5–6 | 24 | 6 | ≤1.3 stages |

Human targets once measured:

- median allocation time ≤2 minutes at 2p;
- ≤3 minutes at 3–4p;
- ≤4 minutes at 5–6p;
- illegal or corrected allocations <5%.

---

## 12. Canonical Two-Player Equilibrium

For exact two-player analysis:

1. Build the strategically collapsed payoff matrix.
2. Solve the win-utility zero-sum game.
3. Among all optimal strategies for each player, select the maximum-Shannon-entropy optimal strategy.
4. Use this pair as the canonical equilibrium for:
   - tie rates;
   - equilibrium entropy;
   - margin value of information;
   - canonical support reports.

Also compute, where tractable, each strategy's maximum possible mass across the equilibrium polytope to construct \(\mathcal E^{0.01}\).

Failure to converge must be explicit. A sampled or approximate equilibrium must never be labelled exact.

---

## 13. Strategy Models

### S0 — Uniform technical baseline

Uniform over strategically distinct legal allocations.

S0 may test plumbing. It must not support uncertainty or design-quality claims.

### S1 — Named heuristic portfolio

A small fixed portfolio, initially:

- highest-reward concentration;
- comparative-strength concentration;
- broad contest;
- two-Trial majority plan;
- defensive denial;
- low-regret mixed plan.

Every S1 plan must be inspectable.

### S2 — Bounded-rational search

Parameters:

- candidate budget;
- local-search radius;
- opponent-belief noise;
- evaluation noise;
- suboptimal-choice probability.

S2 parameters must be stamped into every report.

### S3 — Exact best response

Exact against a fixed opponent profile.

### S4 — Exact two-player hidden-play equilibrium

Allowed only for two players.

For 3–6 players, use regret and exact-given-profile deviations rather than equilibrium claims.

---

## 14. Minimal Metric Set

### 14.1 Hard gates

- G1 determinism/symmetry/conservation.
- G2 feasibility.
- G3 optimal monotonicity.
- G4 equal-state counterability.
- G5 minimum direct counter quality.
- G7 tie discipline.
- G9 contestable middle range.
- G10 finite and plausibly reachable robust dominance.
- G13 complexity ceilings.

### 14.2 Primary Pareto axes

1. **Two-player game-value curve** under win and margin utility.
2. **Strategic-compensation curve** and recoverable-deficit frontier.
3. **Canonical equilibrium mix entropy** and support count.
4. **Margin value of information**:

\[
VOI_M=
\mathbb E_{b\sim\sigma_B}
\left[\max_a u_A^M(a,b)\right]
-v_M
\]

5. **Human-complexity panel**.

### 14.3 Diagnostics

- counter distance;
- local one-unit fragility;
- tie-stage distribution;
- Trial attempt, contest and uncontested rates;
- dead-power and dead-Trial rates;
- reward concentration;
- Trial redundancy;
- domain utilization;
- equal-\(q\) archetype matrix;
- \(\mathcal R\) versus \(\mathcal E^{0.01}\) divergence.

### 14.4 Removed or deferred

- Allocation flip rate as a headline metric.
- Winner entropy as a separate headline.
- \(\log_2|\mathcal R|\) as a depth measure.
- Strategy-equivalent power until configurations are shortlisted.
- Frequency claims from synthetic states as if they were real-play frequencies.

---

## 15. Strategic-Depth Targets

A configuration is not considered deep merely because it has a counter cycle.

At two-player parity, provisional targets are:

- at least 3 strategically distinct allocations with material equilibrium mass;
- normalized canonical equilibrium entropy ≥0.60;
- median minimum counter distance ≥2 power units;
- at least two distinct positive best-counter margins within equilibrium-relevant states;
- no single pure allocation has non-negative utility against every reasonable opponent allocation;
- margin-VOI is at least one smallest-Trial reward but below 40% of the total Trial reward pool.

These are comparison targets, not correctness theorems. Reports must show sensitivity to them.

---

## 16. Archetype Requirements

Classify Spellbooks as:

- specialist;
- generalist;
- energy-heavy;
- transformation-heavy;
- enchantment-heavy;
- Perfect-Transmutation-heavy;
- Wild-heavy;
- one-monument;
- many-small-spells.

At equal \(q_v\):

- no archetype may have a positive game value against every other archetype;
- no archetype should exceed a 60% sole-win rate across more than two-thirds of its matchups;
- deliberate cycles are acceptable;
- matchup findings must be conditional on the state supplier and scoring version.

---

## 17. Multiplayer Analysis

### 17.1 Exact-given-profile analyses

For a fixed opponent profile, calculate:

- unilateral best response;
- regret;
- maximum placement improvement;
- kingmaker deviations;
- spoiler leverage;
- pairwise coalition deviations where tractable;
- conflict between maximizing RP and maximizing sole-first probability.

### 17.2 Simulated analyses

Using declared S1/S2 populations:

- sole-first and shared-first rates;
- expected placement;
- contender coverage;
- Trial congestion;
- uncontested awards;
- lower-place reward destinations;
- kingmaker and spoiler frequency.

### 17.3 Provisional multiplayer health targets

| Metric | 3–4 players | 5–6 players |
|---|---:|---:|
| States with at least 2 plausible contenders | ≥80% | ≥90% |
| States with at least 3 plausible contenders | report | ≥70% |
| Non-contender kingmaker opportunity | ≤10% | ≤15% |
| 95th-percentile spoiler leverage | ≤largest active Trial reward | ≤largest active Trial reward |
| Better S2 allocation improves sole-first chance | ≥5 percentage points | ≥5 percentage points |

These targets are provisional until human and agent calibration exists.

### 17.4 Prohibited claims

Do not claim a meaningful general Nash equilibrium at 3–6 players.

Human playtesting remains necessary for:

- felt kingmaking;
- engagement from lower-place rewards;
- collusion and signalling;
- teach burden;
- timing and error rates.

---

## 18. Test-State Library

The model must support:

### Controlled

- identical states;
- equal-\(q\), different-shape states;
- same-shape card-space paths;
- single-domain componentwise additions.

### Archetypal

- specialist versus generalist;
- energy versus transformation/enchantment;
- monument versus many-small-spells;
- Wild-rich versus Wild-free.

### Adversarial

- reward turtles;
- tie-fests;
- infeasible fullness;
- penny-squat entries;
- Wild-only illegality;
- ratio-tiebreak monotonicity traps;
- over-allocation;
- dead power;
- equivalence inflation;
- floored turtles.

### Realistic

- playtest imports;
- base-simulator imports;
- matched equal-\(q\) tables;
- full multiplayer tables.

Structural failures found on synthetic states are real failures. Structural passes remain provisional until realistic states are available.

---

## 19. Configuration Selection

### 19.1 Hard filter

Reject any configuration that fails a hard gate.

### 19.2 Pareto frontier

Compare survivors across:

- strength fidelity;
- strategic compensation;
- strategic depth;
- dominance placement;
- archetype health;
- multiplayer pathologies;
- human complexity.

### 19.3 Lexicographic recommendation

The model recommends among Pareto survivors in this order:

1. Fewer hard-gate near-failures and less sensitivity.
2. Lower human complexity while meeting depth floors.
3. Wider healthy contestable middle range.
4. Lower tie, kingmaker and spoiler pathology.
5. Better archetype diversity.
6. Greater cross-player-count consistency.
7. Simpler reward and Trial tables.

A universal configuration is preferred when its metrics are within 10% of the best per-count candidate on every primary axis and it does not fail any per-count gate. Otherwise, player-count-specific configurations are allowed.

No weighted global score is permitted.

---

## 20. Numerical Evidence Policy

Resolver outputs, allocation enumeration and payoff-matrix entries are exact integers.

Linear-programming and maximum-entropy equilibrium solutions are numerical unless a later rational solver is explicitly introduced.

Required labels:

- `exhaustive_exact`: complete integer enumeration or direct resolver proof;
- `numerical_lp`: floating-point zero-sum LP with recorded tolerance and residual;
- `numerical_convex`: floating-point maximum-entropy optimization with recorded tolerance and residual;
- `exact_given_profile`: direct deterministic best response against a fixed finite profile;
- `sampled`: Monte Carlo or bounded-rational estimate.

A numerical value within tolerance of zero may satisfy a test asserting a zero theoretical value, but the report must still say `numerical_lp`, not “exact.”

Default initial tolerances:

- LP feasibility and optimality residual: \(10^{-9}\);
- entropy-solver feasibility residual: \(10^{-8}\);
- equilibrium-support reporting thresholds remain \(10^{-9}\), \(10^{-3}\) and \(10^{-2}\), with the solver tolerance printed beside them.

Canonical ordering of domains, Trials, allocations and support entries is mandatory.

## 21. Output Discipline

Every report must state:

- configuration ID and version;
- player count;
- state supplier and provenance;
- \(q\)-version;
- strategy generator;
- random seed where applicable;
- exact, bounded-exact or sampled status;
- confidence intervals for sampled results;
- solver convergence and residual gap;
- whether results use \(\mathcal R\), \(\mathcal E^{0.01}\) or both.

The model must distinguish:

- theorem;
- exact exhaustive computation;
- exact-given-profile computation;
- numerical equilibrium solution;
- empirical estimate;
- design judgement.

---

## 22. Summary Design Statement

Ascension Trials should be a deterministic simultaneous hidden-allocation game in which final Spellbook strength creates a clear but non-absolute advantage.

At equal resources, every fixed reasonable pure allocation must expose an outright winning counter. Across moderate differences, superior allocation must let a weaker Spellbook reverse the result often enough for voting skill to matter, while equal strategic ability still favours the stronger Spellbook.

Beyond a high but realistically reachable threshold, the stronger Spellbook must guarantee sole victory under every equilibrium-relevant reasonable allocation.

Uncertainty must come from concealed strategic commitments and counterplay—not random resolution, ratio-based tiebreak pathologies, excessive ties or an action space that is merely large.
