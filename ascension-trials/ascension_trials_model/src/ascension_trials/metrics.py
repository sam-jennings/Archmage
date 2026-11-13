"""VS2 small-state metrics (REQ-10..REQ-14; impl spec §16).

Ties the VS2 pipeline together for one small two-player state: enumerate every legal
allocation, build the exhaustive payoff matrix, collapse strategically-equivalent
strategies, run iterated strict-dominance to the reasonable set, solve the win and
margin zero-sum games numerically, select the canonical maximum-entropy equilibrium
and compute the equilibrium-relevant set, then report the structural counts, tie
accounting and diagnostics of impl-spec §16.

Every reported quantity carries an evidence class (REQ-14.3): structural counts,
rates and dominance are ``exact exhaustive``; game values are ``numerical LP``;
entropy/equilibrium (and equilibrium-weighted rates / margin-VOI derived from them)
are ``numerical convex``. Exact rates use ``fractions.Fraction`` so they are
reproduced without floating-point drift; a float rendering is included for
readability.

Corrected in the VS2-C pass (audit ``ascension-trials/design-history/ASCENSION_TRIALS_05_VS2_LAB_AUDIT``):

* **D1 — margin VOI** is now ``VOI_M = Σ_b y_b · max_a margin[a,b] − v_M`` with ``y``
  the canonical maximum-entropy *column* mixture of the margin game (equal to the
  row mixture at parity), not the previous unweighted mean of per-row maxima.
* **D2 — counterability gates**: the ∀b∃a head-to-head-counter condition (G4) is
  computed over both ``R`` and ``E^{0.01}``, with unbeaten-strategy ids, per-opponent
  best counter margin, the G5 margin floor, and the "win through Recognition Points,
  not only the final Spellbook tiebreak" condition (``win = 1`` *and* ``margin > 0``).
* **D4 — equilibrium-weighted tie metrics**: final-tie probability and final-chain-
  decided rate under the canonical row/column mixtures (asymmetric-ready), alongside
  the uniform rates.
* **D7 — trial-shared rate** is derived from resolver ``shared_first`` traces
  (``PayoffMatrix.trial_shared_flags``), never reconstructed from award-value
  collisions.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from fractions import Fraction
from typing import Optional

import numpy as np

from . import dominance, equilibrium, legality
from .enumerate import enumerate_allocations, normal_totals_by_trial
from .matrix import (
    PayoffMatrix,
    _symmetric_inputs,
    build_two_player_payoff_matrix,
    collapse_strategies,
    collapse_strategies_per_side,
)
from .schema import Configuration, PlayerState

# G4/G5/G7 thresholds (model V2_1 §11 G5/G7; audit D2/D3/D4).
G5_MARGIN_FLOOR = 1  # max_a u^M(a,b) >= 1 for every b in E^0.01 (hard floor).
G7_FINAL_SHARED_MAX = 0.05  # equilibrium-weighted final shared-winner probability.
G7_FINAL_CHAIN_MAX = 0.05  # equilibrium-weighted final-Spellbook-tiebreak rate.
G7_TRIAL_SHARED_MAX = 0.10  # per-Trial shared-award rate (soft target).


# --------------------------------------------------------------------------- #
# Counterability gate over a strategy set (G4/G5; audit D2)                    #
# --------------------------------------------------------------------------- #


@dataclass
class CounterabilityGate:
    """G4/G5 counterability of a strategy set (``R`` or ``E^{0.01}``) at parity.

    A *head-to-head counter* of opponent ``b`` is a strategy ``a`` (in the set) that
    wins outright **through Recognition Points**: ``win[a,b] = 1`` *and*
    ``margin[a,b] > 0``. The ``margin > 0`` requirement enforces the model rule that
    the counter must win via Trial awards, not merely by the final Spellbook
    tiebreak (a ``win = 1`` with ``margin = 0`` is an RP tie broken by the final
    chain — audit D2, model G4).

    * ``c1_holds`` — G4: every opponent in the set has such a counter in the set.
    * ``unbeaten`` — opponents with no head-to-head counter (why C1/G4 fails).
    * ``per_opponent`` — for each opponent, its best attainable RP margin
      (``max_a margin[a,b]`` over the full strategy space, the G5 quantity) and
      whether it is countered.
    * ``g5_floor_ok`` — G5: ``max_a margin[a,b] >= 1`` for every opponent in the set.
    * ``mean_counter_fraction`` — diagnostic mean fraction of set members that
      counter each opponent (the quantity the pre-correction ``counterability``
      metric reported; retained as a diagnostic, not a gate).
    """

    set_name: str
    c1_holds: bool
    unbeaten: list[dict]
    per_opponent: list[dict]
    g5_floor_ok: bool
    mean_counter_fraction: float

    def to_dict(self) -> dict:
        return {
            "set": self.set_name,
            "c1_holds": self.c1_holds,
            "g5_margin_floor_ok": self.g5_floor_ok,
            "unbeaten_strategies": self.unbeaten,
            "mean_counter_fraction": self.mean_counter_fraction,
            "per_opponent_best_counter_margin": self.per_opponent,
        }


@dataclass
class SmallStateMetrics:
    """Structured VS2 metrics for one small two-player state (impl spec §16)."""

    config_id: str
    player_count: int
    legal_count_a: int
    legal_count_b: int
    maximal_count_a: int
    maximal_count_b: int
    collapsed_class_count: int
    reasonable_set_size: int
    equilibrium_relevant_size: int
    win_value: float
    margin_value: float
    win_lp: equilibrium.ZeroSumSolution
    margin_lp: equilibrium.ZeroSumSolution
    canonical_equilibrium: equilibrium.MaxEntropyEquilibrium
    canonical_equilibrium_column: equilibrium.MaxEntropyEquilibrium
    equilibrium_relevant: equilibrium.EquilibriumRelevantSet
    final_tie_rate: Fraction
    final_tie_rate_eq_weighted: float
    chain_decided_rate_uniform: Fraction
    chain_decided_rate_eq_weighted: float
    trial_shared_award_rate: Fraction
    final_shared_pairs: int
    counter_R: Optional[CounterabilityGate]
    counter_E: Optional[CounterabilityGate]
    mean_counter_distance: Optional[float]
    margin_voi: float
    margin_voi_mixture_valid: bool
    dead_power_a: int
    reward_concentration: float
    matrix: PayoffMatrix
    collapsed_matrix: PayoffMatrix
    dominance_result: dominance.DominanceResult
    weak_dominance: list
    # VS3 (REQ-1/2/3): parity flag + per-side (column / player B) structural counts.
    # These default to the VS2 parity values so the equal-state code path constructs
    # ``SmallStateMetrics`` exactly as before and its ``to_dict`` payload stays
    # byte-identical (design §5.4; REQ-1.5, REQ-3.4). For a genuinely asymmetric
    # state the asymmetric path sets ``parity=False`` and fills the per-side counts,
    # and the equal-state counterability gates above are emitted as ``not_applicable``
    # (REQ-3.3).
    parity: bool = True
    collapsed_class_count_b: Optional[int] = None
    reasonable_set_size_b: Optional[int] = None
    equilibrium_relevant_size_b: Optional[int] = None
    equilibrium_relevant_column: Optional[equilibrium.EquilibriumRelevantSet] = None

    def to_dict(self) -> dict:
        if not self.parity:
            return self._to_dict_asymmetric()
        return {
            "metadata": {
                "config_id": self.config_id,
                "player_count": self.player_count,
            },
            "counts": {
                "evidence_class": "exact exhaustive",
                "legal_allocations": {"A": self.legal_count_a, "B": self.legal_count_b},
                "maximal_allocations": {"A": self.maximal_count_a, "B": self.maximal_count_b},
                "collapsed_classes": self.collapsed_class_count,
                "reasonable_set_R": self.reasonable_set_size,
                "equilibrium_relevant_E_0_01": self.equilibrium_relevant_size,
            },
            "equilibrium": {
                "win": {
                    "evidence_class": "numerical LP",
                    "value": self.win_value,
                    "method": self.win_lp.method,
                    "tolerance": self.win_lp.tolerance,
                    "primal_residual": self.win_lp.primal_residual,
                    "dual_residual": self.win_lp.dual_residual,
                    "value_gap": self.win_lp.value_gap,
                    "exploitability": self.win_lp.exploitability,
                    "success": self.win_lp.success,
                    "status": self.win_lp.status,
                },
                "margin": {
                    "evidence_class": "numerical LP",
                    "value": self.margin_value,
                    "method": self.margin_lp.method,
                    "tolerance": self.margin_lp.tolerance,
                    "primal_residual": self.margin_lp.primal_residual,
                    "dual_residual": self.margin_lp.dual_residual,
                    "value_gap": self.margin_lp.value_gap,
                    "exploitability": self.margin_lp.exploitability,
                    "success": self.margin_lp.success,
                    "status": self.margin_lp.status,
                },
                "canonical_maximum_entropy": {
                    "evidence_class": "numerical convex",
                    "method": self.canonical_equilibrium.method,
                    "valid": self.canonical_equilibrium.valid,
                    "status": self.canonical_equilibrium.status,
                    "entropy": self.canonical_equilibrium.entropy,
                    "normalized_entropy": self.canonical_equilibrium.normalized_entropy,
                    "support_1e_9": self.canonical_equilibrium.support_1e_9,
                    "support_1e_3": self.canonical_equilibrium.support_1e_3,
                    "support_1e_2": self.canonical_equilibrium.support_1e_2,
                    "feasibility_residual": self.canonical_equilibrium.feasibility_residual,
                    "optimality_residual": self.canonical_equilibrium.optimality_residual,
                    "column_mixture_valid": self.canonical_equilibrium_column.valid,
                },
                "equilibrium_relevant_set": {
                    "evidence_class": "numerical LP",
                    "threshold": self.equilibrium_relevant.threshold,
                    "tolerance": self.equilibrium_relevant.tolerance,
                    "size": self.equilibrium_relevant.size,
                    "max_mass": [round(float(x), 12) for x in self.equilibrium_relevant.max_mass],
                },
            },
            "ties": {
                "evidence_class": "exact exhaustive + numerical convex",
                "final_tie_rate": f"{self.final_tie_rate.numerator}/{self.final_tie_rate.denominator}",
                "final_tie_rate_float": float(self.final_tie_rate),
                "final_tie_rate_equilibrium_weighted": self.final_tie_rate_eq_weighted,
                "final_chain_decided_rate_uniform": (
                    f"{self.chain_decided_rate_uniform.numerator}/"
                    f"{self.chain_decided_rate_uniform.denominator}"
                ),
                "final_chain_decided_rate_uniform_float": float(self.chain_decided_rate_uniform),
                "final_chain_decided_rate_equilibrium_weighted": self.chain_decided_rate_eq_weighted,
                "trial_shared_award_rate": (
                    f"{self.trial_shared_award_rate.numerator}/"
                    f"{self.trial_shared_award_rate.denominator}"
                ),
                "trial_shared_award_rate_float": float(self.trial_shared_award_rate),
                "trial_shared_award_rate_source": "resolver TrialResult.shared_first (audit D7)",
                "final_shared_pairs": self.final_shared_pairs,
            },
            "counterability": {
                "evidence_class": "exact exhaustive",
                "c1_over_R": self.counter_R.to_dict(),
                "c1_over_E_0_01": self.counter_E.to_dict(),
                "mean_counter_distance": self.mean_counter_distance,
                "margin_voi": {
                    "evidence_class": "numerical LP + numerical convex",
                    "value": self.margin_voi,
                    "definition": "VOI_M = sum_b y_b * max_a margin[a,b] - v_M",
                    "mixture": "canonical maximum-entropy column mixture of the margin game",
                    "mixture_valid": self.margin_voi_mixture_valid,
                    "note": "depends on equilibrium selection (max-entropy at parity)",
                },
            },
            "diagnostics": {
                "dead_power_A": self.dead_power_a,
                "reward_concentration_herfindahl": self.reward_concentration,
                "dominance_rounds": self.dominance_result.rounds,
                "strictly_dominated_removed": len(self.dominance_result.removed_rows),
                "weak_dominance_relations": len(self.weak_dominance),
            },
        }

    def _to_dict_asymmetric(self) -> dict:
        """Asymmetric (unequal-state) metrics payload (REQ-3.1/3.2/3.3/3.5).

        Every applicable VS2 metric is generalised to the rectangular game: counts
        are reported per side (A rows / B columns); bilinear / equilibrium-weighted
        rates use the row mixture ``x`` and column mixture ``y`` separately (already
        the case in :func:`_bilinear` / :func:`margin_value_of_information`); game
        values, canonical mixtures, entropy, per-side ``E^{0.01}``, tie/​chain rates,
        per-Trial shared-award rate, margin-VOI, dead power and reward concentration
        are all defined for ``m×n`` games. The equal-state counterability gates
        (G4/G5) and the mirror counter-distance diagnostic are meaningful only at
        parity, so they are emitted as ``not_applicable`` rather than a misleading
        number (REQ-3.3); every reported metric keeps its VS2 evidence label
        (REQ-3.5).
        """
        return {
            "metadata": {
                "config_id": self.config_id,
                "player_count": self.player_count,
                "parity": False,
            },
            "counts": {
                "evidence_class": "exact exhaustive",
                "legal_allocations": {"A": self.legal_count_a, "B": self.legal_count_b},
                "maximal_allocations": {"A": self.maximal_count_a, "B": self.maximal_count_b},
                "collapsed_classes": {
                    "A": self.collapsed_class_count,
                    "B": self.collapsed_class_count_b,
                },
                "reasonable_set_R": {
                    "A": self.reasonable_set_size,
                    "B": self.reasonable_set_size_b,
                },
                "equilibrium_relevant_E_0_01": {
                    "A": self.equilibrium_relevant_size,
                    "B": self.equilibrium_relevant_size_b,
                },
            },
            "equilibrium": {
                "win": {
                    "evidence_class": "numerical LP",
                    "value": self.win_value,
                    "method": self.win_lp.method,
                    "tolerance": self.win_lp.tolerance,
                    "primal_residual": self.win_lp.primal_residual,
                    "dual_residual": self.win_lp.dual_residual,
                    "value_gap": self.win_lp.value_gap,
                    "exploitability": self.win_lp.exploitability,
                    "success": self.win_lp.success,
                    "status": self.win_lp.status,
                },
                "margin": {
                    "evidence_class": "numerical LP",
                    "value": self.margin_value,
                    "method": self.margin_lp.method,
                    "tolerance": self.margin_lp.tolerance,
                    "primal_residual": self.margin_lp.primal_residual,
                    "dual_residual": self.margin_lp.dual_residual,
                    "value_gap": self.margin_lp.value_gap,
                    "exploitability": self.margin_lp.exploitability,
                    "success": self.margin_lp.success,
                    "status": self.margin_lp.status,
                },
                "canonical_maximum_entropy": {
                    "evidence_class": "numerical convex",
                    "method": self.canonical_equilibrium.method,
                    "row_valid": self.canonical_equilibrium.valid,
                    "column_valid": self.canonical_equilibrium_column.valid,
                    "status": self.canonical_equilibrium.status,
                    "row_entropy": self.canonical_equilibrium.entropy,
                    "row_normalized_entropy": self.canonical_equilibrium.normalized_entropy,
                    "column_entropy": self.canonical_equilibrium_column.entropy,
                    "column_normalized_entropy": self.canonical_equilibrium_column.normalized_entropy,
                    "row_support_1e_9": self.canonical_equilibrium.support_1e_9,
                    "column_support_1e_9": self.canonical_equilibrium_column.support_1e_9,
                    "feasibility_residual": self.canonical_equilibrium.feasibility_residual,
                    "optimality_residual": self.canonical_equilibrium.optimality_residual,
                },
                "equilibrium_relevant_set": {
                    "evidence_class": "numerical LP",
                    "threshold": self.equilibrium_relevant.threshold,
                    "tolerance": self.equilibrium_relevant.tolerance,
                    "size": {
                        "A": self.equilibrium_relevant.size,
                        "B": self.equilibrium_relevant_size_b,
                    },
                    "max_mass_A": [
                        round(float(x), 12) for x in self.equilibrium_relevant.max_mass
                    ],
                    "max_mass_B": (
                        [round(float(x), 12) for x in self.equilibrium_relevant_column.max_mass]
                        if self.equilibrium_relevant_column is not None
                        else []
                    ),
                },
            },
            "ties": {
                "evidence_class": "exact exhaustive + numerical convex",
                "final_tie_rate": f"{self.final_tie_rate.numerator}/{self.final_tie_rate.denominator}",
                "final_tie_rate_float": float(self.final_tie_rate),
                "final_tie_rate_equilibrium_weighted": self.final_tie_rate_eq_weighted,
                "final_chain_decided_rate_uniform": (
                    f"{self.chain_decided_rate_uniform.numerator}/"
                    f"{self.chain_decided_rate_uniform.denominator}"
                ),
                "final_chain_decided_rate_uniform_float": float(self.chain_decided_rate_uniform),
                "final_chain_decided_rate_equilibrium_weighted": self.chain_decided_rate_eq_weighted,
                "trial_shared_award_rate": (
                    f"{self.trial_shared_award_rate.numerator}/"
                    f"{self.trial_shared_award_rate.denominator}"
                ),
                "trial_shared_award_rate_float": float(self.trial_shared_award_rate),
                "trial_shared_award_rate_source": "resolver TrialResult.shared_first (audit D7)",
                "final_shared_pairs": self.final_shared_pairs,
            },
            "counterability": {
                "evidence_class": "exact exhaustive",
                "c1_over_R": "not_applicable",
                "c1_over_E_0_01": "not_applicable",
                "mean_counter_distance": "not_applicable",
                "not_applicable_reason": (
                    "equal-state counterability (G4/G5) and the mirror counter-distance "
                    "diagnostic are defined only at parity; on genuinely asymmetric states "
                    "they are reported as not_applicable rather than a misleading number "
                    "(REQ-3.3)"
                ),
                "margin_voi": {
                    "evidence_class": "numerical LP + numerical convex",
                    "value": self.margin_voi,
                    "definition": "VOI_M = sum_b y_b * max_a margin[a,b] - v_M",
                    "mixture": "canonical maximum-entropy column mixture of the margin game",
                    "mixture_valid": self.margin_voi_mixture_valid,
                    "note": "row/column mixtures are computed per side for the rectangular game",
                },
            },
            "diagnostics": {
                "dead_power_A": self.dead_power_a,
                "reward_concentration_herfindahl": self.reward_concentration,
                "dominance_rounds": self.dominance_result.rounds,
                "strictly_dominated_removed": len(self.dominance_result.removed_rows),
                "strictly_dominated_removed_columns": len(self.dominance_result.removed_cols),
                "weak_dominance_relations": len(self.weak_dominance),
            },
        }


# --------------------------------------------------------------------------- #
# Helpers                                                                      #
# --------------------------------------------------------------------------- #


def _reward_concentration(config: Configuration, player_count: int) -> float:
    """Herfindahl index of first-place rewards across active Trials (diagnostic)."""
    firsts = []
    for trial in config.active_trials(player_count):
        rewards = trial.rewards_by_player_count.get(player_count, {})
        firsts.append(rewards.get("first", 0))
    total = sum(firsts)
    if total == 0:
        return 0.0
    return float(sum((r / total) ** 2 for r in firsts))


def _dead_power(config: Configuration, state: PlayerState, player_count: int) -> int:
    """Units of the state's normal power with no legal single-unit Trial sink (A14).

    A domain's power is 'dead' when no active Trial would accept a lone positive
    unit of that domain as a legal entry. Reported as a diagnostic, not a gate.
    """
    trials = config.active_trials(player_count)
    dead = 0
    for dom, power in state.normal_power.items():
        if power <= 0:
            continue
        placeable = any(
            legality.entry_is_legal(config, t, {dom: 1}, player_count)[0] for t in trials
        )
        if not placeable:
            dead += power
    return dead


def margin_value_of_information(
    margin_matrix: np.ndarray,
    value: float,
    column_mixture: np.ndarray,
) -> float:
    """VOI_M = Σ_b y_b · max_a margin[a,b] − v_M (audit D1; model V2_1 §14.2).

    For each opponent (column) ``b``, take the best-response RP margin down the
    column (``max_a margin[a,b]``), weight it by the opponent's canonical mixture
    ``y_b``, and subtract the margin-game value ``v_M``. This measures the expected
    value of playing a best response against the equilibrium opponent, relative to
    just guaranteeing the game value — never the unweighted mean of per-row maxima
    (the pre-correction bug returned that instead, ~1.8× too large on A4).
    """
    M = np.asarray(margin_matrix, dtype=float)
    if M.size == 0:
        return 0.0
    best_response = M.max(axis=0)  # max_a margin[a,b] for each column b
    y = np.asarray(column_mixture, dtype=float)
    return float(y @ best_response - value)


def _bilinear(indicator: np.ndarray, row_mixture: np.ndarray, col_mixture: np.ndarray) -> float:
    """Equilibrium-weighted rate ``xᵀ A y`` for a 0/1 indicator matrix ``A`` (audit D4).

    Uses the canonical row and column mixtures separately rather than assuming a
    single mixture, so the interface already generalizes to asymmetric states
    (where ``x != y``). At parity the two mixtures coincide by symmetry.
    """
    A = np.asarray(indicator, dtype=float)
    x = np.asarray(row_mixture, dtype=float)
    y = np.asarray(col_mixture, dtype=float)
    return float(x @ A @ y)


def counterability_gate(
    matrix: PayoffMatrix,
    indices: list[int],
    config: Configuration,
    player_count: int,
    set_name: str,
) -> CounterabilityGate:
    """Compute the G4/G5 counterability gate for a set of collapsed strategies (D2).

    ``indices`` index the (collapsed) ``matrix`` and name the reasonable set ``R``
    or equilibrium-relevant set ``E^{0.01}``. G4 (``c1_holds``) and the unbeaten
    list use head-to-head counters *within the set*; the G5 best-counter margin is
    the best response over the whole strategy space (``max_a`` unrestricted, model
    G5).
    """
    win = matrix.win
    margin = matrix.margin
    n_all = win.shape[0]
    idset = list(indices)

    def _totals(i: int) -> list[int]:
        if matrix.row_allocations:
            return list(normal_totals_by_trial(config, matrix.row_allocations[i], player_count))
        return []

    per_opponent: list[dict] = []
    unbeaten: list[dict] = []
    fractions: list[float] = []
    for b in idset:
        # Head-to-head counters within the set that win through Recognition Points.
        counters = [a for a in idset if win[a, b] == 1 and margin[a, b] > 0]
        countered = len(counters) > 0
        fractions.append(len(counters) / len(idset) if idset else 0.0)
        best_margin = int(max((int(margin[a, b]) for a in range(n_all)), default=0))
        entry = {
            "strategy_id": matrix.row_strategy_ids[b],
            "normal_totals": _totals(b),
            "best_counter_margin": best_margin,
            "countered": countered,
        }
        per_opponent.append(entry)
        if not countered:
            unbeaten.append(
                {"strategy_id": matrix.row_strategy_ids[b], "normal_totals": _totals(b)}
            )

    c1_holds = len(unbeaten) == 0 and bool(idset)
    g5_floor_ok = bool(per_opponent) and all(
        e["best_counter_margin"] >= G5_MARGIN_FLOOR for e in per_opponent
    )
    mean_counter_fraction = float(np.mean(fractions)) if fractions else 0.0
    return CounterabilityGate(
        set_name=set_name,
        c1_holds=c1_holds,
        unbeaten=unbeaten,
        per_opponent=per_opponent,
        g5_floor_ok=g5_floor_ok,
        mean_counter_fraction=mean_counter_fraction,
    )


def _mean_counter_distance(
    matrix: PayoffMatrix,
    indices: list[int],
    totals: list[tuple[int, ...]],
) -> float:
    """Mean L1 distance between a strategy's per-Trial totals and the strategies
    that beat it head-to-head (``win = -1``) within ``indices`` (diagnostic)."""
    distances: list[int] = []
    for a in indices:
        for b in indices:
            if matrix.win[a, b] < 0:
                distances.append(sum(abs(pa - pb) for pa, pb in zip(totals[a], totals[b])))
    return float(np.mean(distances)) if distances else 0.0


# --------------------------------------------------------------------------- #
# Main entry point                                                             #
# --------------------------------------------------------------------------- #


def compute_small_state_metrics(
    config: Configuration,
    state_a: PlayerState,
    state_b: Optional[PlayerState] = None,
    player_count: int = 2,
    *,
    max_allocations: int = 200_000,
) -> SmallStateMetrics:
    """Full VS2/VS3 metrics for a small two-player state (impl spec §16; VS3 REQ-3).

    ``state_b`` defaults to ``state_a`` (symmetric self-play, as every VS2 fixture).
    When A and B hold states that resolve identically over the same strategy list
    (genuine parity), the frozen VS2 path runs unchanged and reproduces the VS2
    values byte-for-byte (REQ-1.5, REQ-3.4). When the states are genuinely
    asymmetric (different power, or equal power but a different final-tiebreak
    statistic), the rectangular generalisation runs: counts are reported per side,
    strategic collapse is per side, equilibrium mixtures / ``E^{0.01}`` are computed
    for the row and column separately, bilinear metrics use the row mixture ``x`` and
    column mixture ``y`` separately, and the equal-state counterability gates are
    emitted as ``not_applicable`` (REQ-3.1/3.2/3.3). Strategic collapse, dominance and
    equilibrium are computed on the collapsed (strategically-equivalent) matrix;
    enumeration counts and tie rates are over the full legal-allocation set.
    """
    if state_b is None:
        state_b = state_a

    allocs_a = enumerate_allocations(config, state_a, player_count, max_allocations=max_allocations)
    allocs_b = (
        allocs_a
        if state_b is state_a
        else enumerate_allocations(config, state_b, player_count, max_allocations=max_allocations)
    )

    matrix = build_two_player_payoff_matrix(
        config, state_a, state_b, allocs_a, allocs_b, player_count=player_count
    )

    # Route to the frozen VS2 parity path only at genuine parity (the matrix builder's
    # own symmetry test — identical strategy lists over states that resolve identically,
    # including tiebreak statistics), so every committed VS2 fixture reproduces its VS2
    # values byte-for-byte (REQ-1.5, REQ-3.4). Any genuinely asymmetric state (including
    # equal power but a different final-tiebreak statistic) takes the rectangular path.
    if _symmetric_inputs(
        config, state_a, state_b, matrix.row_strategy_ids, matrix.column_strategy_ids
    ):
        return _compute_parity_metrics(
            config, state_a, state_b, player_count, allocs_a, allocs_b, matrix
        )
    return _compute_asymmetric_metrics(
        config, state_a, state_b, player_count, allocs_a, allocs_b, matrix
    )


def _compute_parity_metrics(
    config: Configuration,
    state_a: PlayerState,
    state_b: PlayerState,
    player_count: int,
    allocs_a: list,
    allocs_b: list,
    matrix: PayoffMatrix,
) -> SmallStateMetrics:
    """VS2 parity (equal-state self-play) metrics — the frozen VS2 code path.

    Runs unchanged for genuine parity (design §5.4). Strategic collapse, dominance and
    equilibrium are computed on the square collapsed matrix; enumeration counts and tie
    rates are over the full legal-allocation set. The rectangular generalisation lives
    in :func:`_compute_asymmetric_metrics`.
    """
    maximal_a = sum(
        1 for a in allocs_a if legality.is_maximal_allocation(state_a, a, config, player_count)
    )
    maximal_b = sum(
        1 for b in allocs_b if legality.is_maximal_allocation(state_b, b, config, player_count)
    )

    # Strategic-equivalence collapse (symmetric self-play).
    collapse = collapse_strategies(matrix)
    cm = collapse.matrix

    # Reasonable set R via iterated true strict dominance on the collapsed win game.
    dom_result = dominance.eliminate_strictly_dominated(
        cm.win, row_ids=cm.row_strategy_ids, col_ids=cm.column_strategy_ids
    )
    weak = dominance.diagnose_weak_dominance(
        cm.win, row_ids=cm.row_strategy_ids, col_ids=cm.column_strategy_ids
    )

    # Numerical equilibria on the collapsed matrix. Both the row and column
    # canonical maximum-entropy mixtures are computed (asymmetric-ready; equal at
    # parity by symmetry) so the VOI and equilibrium-weighted rates use the correct
    # per-side mixture (audit D1/D4).
    win_lp = equilibrium.solve_zero_sum(cm.win, "win")
    margin_lp = equilibrium.solve_zero_sum(cm.margin, "margin")
    canonical = equilibrium.max_entropy_equilibrium(cm.win, win_lp.value)
    canonical_col = equilibrium.max_entropy_equilibrium_column(cm.win, win_lp.value)
    ers = equilibrium.equilibrium_relevant_set(cm.win, win_lp.value)

    # Exact tie accounting over the full legal-allocation ordered pairs.
    n = matrix.win.shape[0]
    total_pairs = n * n
    tie_pairs = int(matrix.final_tie.sum())
    final_tie_rate = Fraction(tie_pairs, total_pairs) if total_pairs else Fraction(0)

    # Trial shared-award rate: over all ordered pairs and active Trials, fraction
    # where the Trial's first place was shared — read directly from the resolver's
    # per-Trial ``shared_first`` traces (audit D7), never inferred from award-value
    # collisions (which give false positives when first == second reward value).
    trials = matrix.trial_ids
    total_slots = total_pairs * len(trials) if trials else 0
    shared_slots = 0
    if matrix.trial_shared_flags:
        for i in range(n):
            for j in range(n):
                shared_slots += sum(1 for flag in matrix.trial_shared_flags[i][j] if flag)
    trial_shared_award_rate = (
        Fraction(shared_slots, total_slots) if total_slots else Fraction(0)
    )

    # Final chain-decided rate (uniform): ordered pairs decided by the final
    # Spellbook tiebreak — a sole winner (win != 0) on tied Recognition Points
    # (margin == 0). Distinct from the final shared-winner (tie) count (audit C2/D4).
    chain_decided_mask = (matrix.win != 0) & (matrix.margin == 0)
    chain_decided_pairs = int(chain_decided_mask.sum())
    chain_decided_rate_uniform = (
        Fraction(chain_decided_pairs, total_pairs) if total_pairs else Fraction(0)
    )

    # Equilibrium-weighted tie metrics under the canonical win-game mixtures (G7).
    x = canonical.probabilities
    y = canonical_col.probabilities
    final_tie_rate_eq_weighted = _bilinear(cm.final_tie, x, y)
    cm_chain_decided = (cm.win != 0) & (cm.margin == 0)
    chain_decided_rate_eq_weighted = _bilinear(cm_chain_decided, x, y)

    # Final shared-winner pairs (terminal shares). Kept as a raw count diagnostic.
    final_shared_pairs = tie_pairs

    # Counterability / distance over the reasonable set R and E^0.01 (collapsed).
    totals = [normal_totals_by_trial(config, a, player_count) for a in cm.row_allocations]
    counter_R = counterability_gate(cm, dom_result.surviving_rows, config, player_count, "R")
    counter_E = counterability_gate(cm, ers.included, config, player_count, "E^0.01")
    mean_distance = _mean_counter_distance(cm, dom_result.surviving_rows, totals)

    # Margin VOI (audit D1): best-response margin against the canonical column
    # mixture of the *margin* game, relative to the margin-game value.
    margin_col = equilibrium.max_entropy_equilibrium_column(cm.margin, margin_lp.value)
    margin_voi = margin_value_of_information(cm.margin, margin_lp.value, margin_col.probabilities)

    dead_power_a = _dead_power(config, state_a, player_count)
    reward_conc = _reward_concentration(config, player_count)

    return SmallStateMetrics(
        config_id=config.id,
        player_count=player_count,
        legal_count_a=len(allocs_a),
        legal_count_b=len(allocs_b),
        maximal_count_a=maximal_a,
        maximal_count_b=maximal_b,
        collapsed_class_count=collapse.class_count,
        reasonable_set_size=len(dom_result.surviving_rows),
        equilibrium_relevant_size=ers.size,
        win_value=win_lp.value,
        margin_value=margin_lp.value,
        win_lp=win_lp,
        margin_lp=margin_lp,
        canonical_equilibrium=canonical,
        canonical_equilibrium_column=canonical_col,
        equilibrium_relevant=ers,
        final_tie_rate=final_tie_rate,
        final_tie_rate_eq_weighted=final_tie_rate_eq_weighted,
        chain_decided_rate_uniform=chain_decided_rate_uniform,
        chain_decided_rate_eq_weighted=chain_decided_rate_eq_weighted,
        trial_shared_award_rate=trial_shared_award_rate,
        final_shared_pairs=final_shared_pairs,
        counter_R=counter_R,
        counter_E=counter_E,
        mean_counter_distance=mean_distance,
        margin_voi=margin_voi,
        margin_voi_mixture_valid=bool(margin_col.valid),
        dead_power_a=dead_power_a,
        reward_concentration=reward_conc,
        matrix=matrix,
        collapsed_matrix=cm,
        dominance_result=dom_result,
        weak_dominance=weak,
    )


def _compute_asymmetric_metrics(
    config: Configuration,
    state_a: PlayerState,
    state_b: PlayerState,
    player_count: int,
    allocs_a: list,
    allocs_b: list,
    matrix: PayoffMatrix,
) -> SmallStateMetrics:
    """Full VS3 metrics for a genuinely asymmetric (unequal-state) game (REQ-3).

    The rectangular generalisation of :func:`_compute_parity_metrics`. Every
    applicable VS2 metric is computed for the ``m×n`` game:

    * counts (legal / maximal / collapsed / ``|R|`` / ``|E^{0.01}|``) are reported per
      side, using the **per-side** strategic collapse (:func:`collapse_strategies_per_side`)
      and iterated strict dominance's separate row / column survivor sets (REQ-3.1);
    * the zero-sum win/margin games are solved on the rectangular collapsed matrix and
      the canonical maximum-entropy mixtures are selected **independently** for the row
      and column, with ``E^{0.01}`` computed per side (REQ-2.2/2.3, REQ-3.1);
    * bilinear / equilibrium-weighted rates use the row mixture ``x`` and the column
      mixture ``y`` separately (:func:`_bilinear`); the final-tie / chain-decided /
      per-Trial shared-award rates are over the full ``m×n`` ordered pairs (REQ-3.2);
    * margin-VOI uses the canonical column mixture of the margin game (REQ-3.1);
    * the equal-state counterability gates (G4/G5) and the mirror counter-distance
      diagnostic are meaningful only at parity, so they are returned as ``None`` and
      surface as ``not_applicable`` in :meth:`SmallStateMetrics.to_dict` (REQ-3.3).

    Every reported metric keeps its VS2 evidence label (REQ-3.5).
    """
    maximal_a = sum(
        1 for a in allocs_a if legality.is_maximal_allocation(state_a, a, config, player_count)
    )
    maximal_b = sum(
        1 for b in allocs_b if legality.is_maximal_allocation(state_b, b, config, player_count)
    )

    # Per-side strategic-equivalence collapse: rows (A) and columns (B) collapse
    # independently over their own behaviour vectors (REQ-2.1; design §5.2).
    per_side = collapse_strategies_per_side(matrix)
    cm = per_side.matrix

    # Reasonable sets via iterated true strict dominance on the collapsed rectangular
    # win game: the surviving rows are A's reasonable set, the surviving columns B's.
    dom_result = dominance.eliminate_strictly_dominated(
        cm.win, row_ids=cm.row_strategy_ids, col_ids=cm.column_strategy_ids
    )
    weak = dominance.diagnose_weak_dominance(
        cm.win, row_ids=cm.row_strategy_ids, col_ids=cm.column_strategy_ids
    )

    # Numerical equilibria on the rectangular collapsed matrix. The row and column
    # canonical maximum-entropy mixtures are selected independently, and E^0.01 is
    # computed per side (REQ-2.2/2.3, REQ-3.1).
    win_lp = equilibrium.solve_zero_sum(cm.win, "win")
    margin_lp = equilibrium.solve_zero_sum(cm.margin, "margin")
    canonical = equilibrium.max_entropy_equilibrium(cm.win, win_lp.value)
    canonical_col = equilibrium.max_entropy_equilibrium_column(cm.win, win_lp.value)
    ers = equilibrium.equilibrium_relevant_set(cm.win, win_lp.value)
    ers_col = equilibrium.equilibrium_relevant_set_column(cm.win, win_lp.value)

    # Exact tie accounting over the full m×n legal-allocation ordered pairs.
    m, n = matrix.win.shape
    total_pairs = m * n
    tie_pairs = int(matrix.final_tie.sum())
    final_tie_rate = Fraction(tie_pairs, total_pairs) if total_pairs else Fraction(0)

    # Trial shared-award rate over all m×n ordered pairs and active Trials, from the
    # resolver's per-Trial ``shared_first`` traces (audit D7), never award-value
    # collisions.
    trials = matrix.trial_ids
    total_slots = total_pairs * len(trials) if trials else 0
    shared_slots = 0
    if matrix.trial_shared_flags:
        for i in range(m):
            for j in range(n):
                shared_slots += sum(1 for flag in matrix.trial_shared_flags[i][j] if flag)
    trial_shared_award_rate = (
        Fraction(shared_slots, total_slots) if total_slots else Fraction(0)
    )

    # Final chain-decided rate (uniform): sole winner (win != 0) on tied Recognition
    # Points (margin == 0), over the full ordered pairs.
    chain_decided_mask = (matrix.win != 0) & (matrix.margin == 0)
    chain_decided_pairs = int(chain_decided_mask.sum())
    chain_decided_rate_uniform = (
        Fraction(chain_decided_pairs, total_pairs) if total_pairs else Fraction(0)
    )

    # Equilibrium-weighted tie metrics under the per-side canonical win-game mixtures:
    # x is the row mixture, y the column mixture (REQ-3.2).
    x = canonical.probabilities
    y = canonical_col.probabilities
    final_tie_rate_eq_weighted = _bilinear(cm.final_tie, x, y)
    cm_chain_decided = (cm.win != 0) & (cm.margin == 0)
    chain_decided_rate_eq_weighted = _bilinear(cm_chain_decided, x, y)

    final_shared_pairs = tie_pairs

    # Margin VOI (audit D1): best-response margin against the canonical column mixture
    # of the *margin* game, relative to the margin-game value (REQ-3.1).
    margin_col = equilibrium.max_entropy_equilibrium_column(cm.margin, margin_lp.value)
    margin_voi = margin_value_of_information(cm.margin, margin_lp.value, margin_col.probabilities)

    dead_power_a = _dead_power(config, state_a, player_count)
    reward_conc = _reward_concentration(config, player_count)

    return SmallStateMetrics(
        config_id=config.id,
        player_count=player_count,
        legal_count_a=len(allocs_a),
        legal_count_b=len(allocs_b),
        maximal_count_a=maximal_a,
        maximal_count_b=maximal_b,
        collapsed_class_count=per_side.row_class_count,
        reasonable_set_size=len(dom_result.surviving_rows),
        equilibrium_relevant_size=ers.size,
        win_value=win_lp.value,
        margin_value=margin_lp.value,
        win_lp=win_lp,
        margin_lp=margin_lp,
        canonical_equilibrium=canonical,
        canonical_equilibrium_column=canonical_col,
        equilibrium_relevant=ers,
        final_tie_rate=final_tie_rate,
        final_tie_rate_eq_weighted=final_tie_rate_eq_weighted,
        chain_decided_rate_uniform=chain_decided_rate_uniform,
        chain_decided_rate_eq_weighted=chain_decided_rate_eq_weighted,
        trial_shared_award_rate=trial_shared_award_rate,
        final_shared_pairs=final_shared_pairs,
        # Equal-state counterability gates (G4/G5) and the mirror counter-distance
        # diagnostic are meaningful only at parity -> not_applicable (REQ-3.3).
        counter_R=None,
        counter_E=None,
        mean_counter_distance=None,
        margin_voi=margin_voi,
        margin_voi_mixture_valid=bool(margin_col.valid),
        dead_power_a=dead_power_a,
        reward_concentration=reward_conc,
        matrix=matrix,
        collapsed_matrix=cm,
        dominance_result=dom_result,
        weak_dominance=weak,
        parity=False,
        collapsed_class_count_b=per_side.column_class_count,
        reasonable_set_size_b=len(dom_result.surviving_cols),
        equilibrium_relevant_size_b=ers_col.size,
        equilibrium_relevant_column=ers_col,
    )
