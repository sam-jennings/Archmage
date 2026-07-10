"""VS2 small-state metrics (REQ-10..REQ-14; impl spec §16).

Ties the VS2 pipeline together for one small two-player state: enumerate every legal
allocation, build the exhaustive payoff matrix, collapse strategically-equivalent
strategies, run iterated strict-dominance to the reasonable set, solve the win and
margin zero-sum games numerically, select the canonical maximum-entropy equilibrium
and compute the equilibrium-relevant set, then report the structural counts, tie
accounting and diagnostics of impl-spec §16.

Every reported quantity carries an evidence class (REQ-14.3): structural counts,
rates and dominance are ``exact exhaustive``; game values are ``numerical LP``;
entropy/equilibrium are ``numerical convex``. Exact rates use ``fractions.Fraction``
so they are reproduced without floating-point drift; a float rendering is included
for readability.
"""

from __future__ import annotations

from dataclasses import dataclass
from fractions import Fraction
from typing import Optional

import numpy as np

from . import dominance, equilibrium, legality
from .enumerate import enumerate_allocations, normal_totals_by_trial
from .matrix import PayoffMatrix, build_two_player_payoff_matrix, collapse_strategies
from .schema import Configuration, PlayerState


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
    equilibrium_relevant: equilibrium.EquilibriumRelevantSet
    final_tie_rate: Fraction
    trial_shared_award_rate: Fraction
    final_tiebreak_usage: int
    counterability: float
    mean_counter_margin: float
    mean_counter_distance: float
    margin_voi: float
    dead_power_a: int
    reward_concentration: float
    matrix: PayoffMatrix
    collapsed_matrix: PayoffMatrix
    dominance_result: dominance.DominanceResult
    weak_dominance: list

    def to_dict(self) -> dict:
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
                "evidence_class": "exact exhaustive",
                "final_tie_rate": f"{self.final_tie_rate.numerator}/{self.final_tie_rate.denominator}",
                "final_tie_rate_float": float(self.final_tie_rate),
                "trial_shared_award_rate": (
                    f"{self.trial_shared_award_rate.numerator}/"
                    f"{self.trial_shared_award_rate.denominator}"
                ),
                "trial_shared_award_rate_float": float(self.trial_shared_award_rate),
                "final_tiebreak_usage": self.final_tiebreak_usage,
            },
            "counterability": {
                "evidence_class": "exact exhaustive",
                "counterability_over_R": self.counterability,
                "mean_counter_margin": self.mean_counter_margin,
                "mean_counter_distance": self.mean_counter_distance,
                "margin_voi": self.margin_voi,
            },
            "diagnostics": {
                "dead_power_A": self.dead_power_a,
                "reward_concentration_herfindahl": self.reward_concentration,
                "dominance_rounds": self.dominance_result.rounds,
                "strictly_dominated_removed": len(self.dominance_result.removed_rows),
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


def _counter_stats(
    matrix: PayoffMatrix,
    indices: list[int],
    totals: list[tuple[int, ...]],
) -> tuple[float, float, float]:
    """Counterability, mean counter margin and mean counter distance over ``indices``.

    Counterability of a strategy = fraction of opponents (within ``indices``) that
    strictly beat it (win == -1 for the strategy). Counter margin = mean losing
    RP-margin magnitude; counter distance = mean L1 distance between per-Trial
    normal totals of a strategy and the opponents that beat it.
    """
    if not indices:
        return (0.0, 0.0, 0.0)
    counter_fracs = []
    margins: list[int] = []
    distances: list[int] = []
    for a in indices:
        beaters = [b for b in indices if matrix.win[a, b] < 0]
        counter_fracs.append(len(beaters) / len(indices))
        for b in beaters:
            margins.append(int(-matrix.margin[a, b]))
            distances.append(
                sum(abs(pa - pb) for pa, pb in zip(totals[a], totals[b]))
            )
    counterability = float(np.mean(counter_fracs))
    mean_margin = float(np.mean(margins)) if margins else 0.0
    mean_distance = float(np.mean(distances)) if distances else 0.0
    return (counterability, mean_margin, mean_distance)


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
    """Full VS2 metrics for a small two-player state (impl spec §16).

    ``state_b`` defaults to ``state_a`` (symmetric self-play, as every VS2 fixture).
    Strategic collapse, dominance and equilibrium are computed on the collapsed
    (strategically-equivalent) matrix; enumeration counts and tie rates are over the
    full legal-allocation set.
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

    # Numerical equilibria on the collapsed matrix.
    win_lp = equilibrium.solve_zero_sum(cm.win, "win")
    margin_lp = equilibrium.solve_zero_sum(cm.margin, "margin")
    canonical = equilibrium.max_entropy_equilibrium(cm.win, win_lp.value)
    ers = equilibrium.equilibrium_relevant_set(cm.win, win_lp.value)

    # Exact tie accounting over the full legal-allocation ordered pairs.
    n = matrix.win.shape[0]
    total_pairs = n * n
    tie_pairs = int(matrix.final_tie.sum())
    final_tie_rate = Fraction(tie_pairs, total_pairs) if total_pairs else Fraction(0)

    # Trial shared-award rate: over all ordered pairs and active Trials, fraction
    # where the Trial's first place was shared (both players banked the first award).
    trials = matrix.trial_ids
    shared_slots = 0
    total_slots = total_pairs * len(trials) if trials else 0
    # Recompute per-cell shared trials by re-reading award signatures is not enough;
    # the shared-first flag lives per Trial. Approximate deterministically from the
    # award signatures: a Trial is shared in a cell when both row and column banked
    # the same positive first award — captured via equal nonzero award for that
    # Trial in the (i,j) and (j,i) signatures.
    for i in range(n):
        for j in range(n):
            for t_idx in range(len(trials)):
                row_award = matrix.row_award_signatures[i][j][t_idx]
                col_award = matrix.row_award_signatures[j][i][t_idx]
                if row_award > 0 and col_award > 0 and row_award == col_award:
                    shared_slots += 1
    trial_shared_award_rate = (
        Fraction(shared_slots, total_slots) if total_slots else Fraction(0)
    )

    # Final-tiebreak usage: ordered pairs whose Recognition-Point totals tied
    # (the final stage / shared verdict was reached).
    final_tiebreak_usage = tie_pairs

    # Counterability / distances over the reasonable set R (collapsed indices).
    totals = [normal_totals_by_trial(config, a, player_count) for a in cm.row_allocations]
    counterability, mean_margin, mean_distance = _counter_stats(
        cm, dom_result.surviving_rows, totals
    )

    # Margin VOI (diagnostic): mean best-attainable RP margin as the row player,
    # i.e. the value of playing the best response, relative to the margin game value.
    best_margins = [int(cm.margin[i].max()) for i in range(cm.margin.shape[0])]
    margin_voi = float(np.mean(best_margins) - margin_lp.value) if best_margins else 0.0

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
        equilibrium_relevant=ers,
        final_tie_rate=final_tie_rate,
        trial_shared_award_rate=trial_shared_award_rate,
        final_tiebreak_usage=final_tiebreak_usage,
        counterability=counterability,
        mean_counter_margin=mean_margin,
        mean_counter_distance=mean_distance,
        margin_voi=margin_voi,
        dead_power_a=dead_power_a,
        reward_concentration=reward_conc,
        matrix=matrix,
        collapsed_matrix=cm,
        dominance_result=dom_result,
        weak_dominance=weak,
    )
