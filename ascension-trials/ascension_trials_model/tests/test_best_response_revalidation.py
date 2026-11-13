"""VS3 Task 8 — mandatory resolver re-validation + row-payoff convention (REQ-6).

Tasks 6 and 7 built the margin and win oracles; this module hardens and *verifies*
the cross-cutting invariant they both rely on (design §3, §6.1, Authority §1/§8):

* **Every** returned best response reports the **resolver-recomputed**
  ``value_row_payoff`` as authoritative (REQ-6.2) — proven here against an
  *independent* resolver recomputation that shares no code with the oracle's own
  search or re-validation path.
* **Every** value is in the **row-payoff convention** (REQ-6.1): ``value_side_payoff``
  equals ``value_row_payoff`` for a row BR and ``-value_row_payoff`` for a column BR,
  and the certificate's ``solver_objective_bound`` is expressed in row-payoff terms —
  an **upper** bound for a row BR, a **lower** bound for a column BR — so a column
  player's own-utility optimum can **never** leak into a row-payoff bound un-negated.
* The optimiser-vs-resolver disagreement check raises
  :class:`BestResponseValidationError` and emits **no** result (REQ-6.4), for both
  oracles; for an exact-arithmetic method (exact DP, exhaustive) the check is exact
  even over a mixture, so a *sub-tolerance* decomposition error is still caught and
  can never be emitted under an "exact" evidence class (REQ-6.4, NFR-5).

The invariant is exercised across the full matrix
``{win, margin} × {row, column} × {pure, mixture}`` plus an unequal-state
(rectangular) provenance case. Hand oracles are transcribed from the rules, not
reverse-engineered from oracle output (REQ-9.4).
"""

from __future__ import annotations

from fractions import Fraction

import pytest

from ascension_trials import best_response as br
from ascension_trials.best_response import (
    EXACT_DP,
    NUMERICAL_MILP,
    BestResponseValidationError,
    OpponentSpec,
    best_response,
)
from ascension_trials.enumerate import enumerate_allocations
from ascension_trials.matrix import COL_PLAYER, ROW_PLAYER
from ascension_trials.resolver import resolve_profile
from ascension_trials.schema import Allocation, PlayerState

from vs2_support import load_referenced_config

ABS_TOL = 1e-9


# --------------------------------------------------------------------------- #
# Fixtures / helpers                                                           #
# --------------------------------------------------------------------------- #


def _empty_alloc(pid: str) -> Allocation:
    return Allocation(player_id=pid)


def _divergence_states():
    """WIN-MARGIN-1 config with equal budgets (A=2, B=2).

    Optional completion, one fungible domain, local ``total_power`` tiebreak and no
    final tiebreak, so margin is separable (exact DP) and win is MILP-modelable — the
    two evidence classes this module needs to exercise together.
    """
    cfg = load_referenced_config({"config_ref": "configs/toy/win_margin_divergence.json"})
    sa = PlayerState(player_id="A", normal_power={"fungible": 2})
    sb = PlayerState(player_id="B", normal_power={"fungible": 2})
    return cfg, {ROW_PLAYER: sa, COL_PLAYER: sb}


def _opponent_seat(side: str) -> str:
    return COL_PLAYER if side == "row" else ROW_PLAYER


def _independent_row_value(cfg, states, side, utility, allocation, opponent, player_count=2):
    """Independent resolver recomputation of ``value_row_payoff`` (REQ-6.2 witness).

    Resolves the *returned* allocation against the opponent support with the direct
    :func:`resolve_profile` and reads player A's utility (the row payoff). Shares no
    code with the oracle's internal ``_expected_row_value``/re-validation, so equality
    is genuine corroboration, not a tautology.
    """
    total = Fraction(0)
    for opp_alloc, prob in opponent.support:
        if side == "row":
            allocs = {ROW_PLAYER: allocation, COL_PLAYER: opp_alloc}
        else:
            allocs = {ROW_PLAYER: opp_alloc, COL_PLAYER: allocation}
        res = resolve_profile(
            cfg,
            {ROW_PLAYER: states[ROW_PLAYER], COL_PLAYER: states[COL_PLAYER]},
            allocs,
            player_count,
        )
        u = res.win_utility if utility == "win" else res.margin_utility
        total += prob * int(u.get(ROW_PLAYER, 0))
    return total


def _make_opponent(cfg, states, side, kind):
    """A deterministic pure strategy or a rational mixture over the opponent's space."""
    opp_allocs = enumerate_allocations(cfg, states[_opponent_seat(side)], player_count=2)
    if kind == "pure":
        return OpponentSpec.pure(opp_allocs[len(opp_allocs) // 2])
    picks = [opp_allocs[0], opp_allocs[min(2, len(opp_allocs) - 1)], opp_allocs[-1]]
    return OpponentSpec.mixture(
        [(picks[0], Fraction(1, 2)), (picks[1], Fraction(1, 3)), (picks[2], Fraction(1, 6))]
    )


def _assert_row_payoff_invariant(cfg, states, side, utility, opponent, result):
    """The full REQ-6 invariant for one returned best response."""
    # (a) value_row_payoff is the INDEPENDENT resolver recomputation (REQ-6.2). The
    #     public field is a float, so compare it to the exact rational within tolerance
    #     (the resolver's exact value is float-converted on the boundary).
    independent = _independent_row_value(cfg, states, side, utility, result.allocation, opponent)
    assert result.value_row_payoff == pytest.approx(float(independent), abs=ABS_TOL)

    # (b) row-payoff convention for the side value (REQ-6.1).
    if side == "row":
        assert result.value_side_payoff == pytest.approx(result.value_row_payoff)
    else:
        assert result.value_side_payoff == pytest.approx(-result.value_row_payoff)

    # (c) the certificate incumbent is the row-payoff value, and the objective bound is
    #     on the correct side of it in the row-payoff convention (REQ-6.1, REQ-6.3).
    cert = result.certificate
    assert cert.resolver_incumbent_value == pytest.approx(result.value_row_payoff)
    if side == "row":
        assert cert.solver_objective_bound >= result.value_row_payoff - ABS_TOL  # UPPER bound
    else:
        assert cert.solver_objective_bound <= result.value_row_payoff + ABS_TOL  # LOWER bound
    # These small instances solve to optimality, so the certified bound coincides with
    # the resolver incumbent within tolerance (REQ-6.5) — and is negated correctly: it
    # equals value_row_payoff, never the un-negated own value value_side_payoff.
    assert cert.solver_objective_bound == pytest.approx(result.value_row_payoff, abs=ABS_TOL)


# --------------------------------------------------------------------------- #
# The invariant across {win, margin} × {row, column} × {pure, mixture}          #
# --------------------------------------------------------------------------- #

_SCENARIOS = [
    (utility, side, kind)
    for utility in ("win", "margin")
    for side in ("row", "column")
    for kind in ("pure", "mixture")
]


@pytest.mark.parametrize("utility,side,kind", _SCENARIOS)
def test_revalidation_invariant_full_matrix(utility, side, kind):
    cfg, states = _divergence_states()
    opponent = _make_opponent(cfg, states, side, kind)
    result = best_response(cfg, states, side, utility, opponent, method="auto")

    _assert_row_payoff_invariant(cfg, states, side, utility, opponent, result)

    # Evidence class is method-typed: separable margin -> exact DP; win -> numerical MILP.
    if utility == "margin":
        assert result.evidence_class == EXACT_DP
        assert result.certificate.absolute_optimality_gap == 0.0
        assert result.certificate.solver_objective_bound == result.certificate.resolver_incumbent_value
    else:
        assert result.evidence_class == NUMERICAL_MILP


# --------------------------------------------------------------------------- #
# Column own-utility optimum is negated, never leaked un-negated (REQ-6.1)      #
# --------------------------------------------------------------------------- #


def test_column_win_bound_is_negated_not_leaked():
    """Column BR vs an empty A: the column forces A to lose, so u_row = -1 (own +1).
    The certificate's bound must be the row-payoff LOWER bound (-1), not the column's
    own optimum (+1) — proving the negation happened (REQ-6.1)."""
    cfg, states = _divergence_states()
    opponent = OpponentSpec.pure(_empty_alloc("A"))
    result = best_response(cfg, states, "column", "win", opponent, method="auto")

    assert result.value_row_payoff == -1.0     # A loses (resolver-recomputed, authoritative)
    assert result.value_side_payoff == 1.0      # column's own perspective
    cert = result.certificate
    assert cert.solver_objective_bound == pytest.approx(-1.0)                  # negated -> row-payoff
    assert cert.solver_objective_bound != pytest.approx(result.value_side_payoff)  # NOT the own optimum
    _assert_row_payoff_invariant(cfg, states, "column", "win", opponent, result)


def test_column_margin_bound_is_negated_not_leaked():
    """Column BR vs an empty A (hand oracle): B sweeps both Trials with budget 2,
    banking 2+3 = 5 uncontested, so the column's own margin is +5 and u_row = -5. The
    certified bound is the row-payoff LOWER bound (-5), not the own optimum (+5)."""
    cfg, states = _divergence_states()
    opponent = OpponentSpec.pure(_empty_alloc("A"))
    result = best_response(cfg, states, "column", "margin", opponent, method="auto")

    assert result.value_row_payoff == -5.0
    assert result.value_side_payoff == 5.0
    cert = result.certificate
    assert result.evidence_class == EXACT_DP
    assert cert.absolute_optimality_gap == 0.0
    assert cert.solver_objective_bound == pytest.approx(-5.0)                  # negated -> row-payoff
    assert cert.solver_objective_bound != pytest.approx(result.value_side_payoff)
    _assert_row_payoff_invariant(cfg, states, "column", "margin", opponent, result)


# --------------------------------------------------------------------------- #
# Unequal-state (rectangular) provenance case (REQ-9.4)                        #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("utility", ["win", "margin"])
@pytest.mark.parametrize("side", ["row", "column"])
def test_revalidation_invariant_unequal_states(utility, side):
    """asym_two_trial with A budget 2 vs B budget 1 — a genuinely rectangular game."""
    cfg = load_referenced_config({"config_ref": "configs/toy/asym_two_trial.json"})
    states = {
        ROW_PLAYER: PlayerState(player_id="A", normal_power={"fungible": 2}),
        COL_PLAYER: PlayerState(player_id="B", normal_power={"fungible": 1}),
    }
    opp_allocs = enumerate_allocations(cfg, states[_opponent_seat(side)], player_count=2)
    opponent = OpponentSpec.pure(opp_allocs[0])
    result = best_response(cfg, states, side, utility, opponent, method="auto")
    _assert_row_payoff_invariant(cfg, states, side, utility, opponent, result)


# --------------------------------------------------------------------------- #
# Optimiser-vs-resolver disagreement raises for BOTH oracles (REQ-6.4)          #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("side", ["row", "column"])
def test_corrupted_margin_objective_raises(monkeypatch, side):
    """A corrupted per-Trial margin decomposition makes the DP optimum disagree with
    the resolver; the result is refused, never emitted (REQ-6.4), on both sides."""
    cfg, states = _divergence_states()
    opp_allocs = enumerate_allocations(cfg, states[_opponent_seat(side)], player_count=2)
    opponent = OpponentSpec.pure(opp_allocs[1])

    real = br._trial_contribution
    monkeypatch.setattr(br, "_trial_contribution", lambda *a, **k: real(*a, **k) + Fraction(100))
    with pytest.raises(BestResponseValidationError):
        best_response(cfg, states, side, "margin", opponent, method="dp")


@pytest.mark.parametrize("side", ["row", "column"])
def test_corrupted_win_objective_raises(monkeypatch, side):
    """A corrupted per-Trial award pair makes the win MILP claim phantom Recognition
    Points; resolver re-validation refuses the result (REQ-6.4), on both sides.

    The corruption inflates the *empty* opponent's award, so the model believes the
    opponent (which truly scores 0) is winning every Trial — a verdict the resolver
    contradicts for **any** selected allocation, making the mismatch guaranteed rather
    than dependent on the MILP's (indifferent) tie-break."""
    cfg, states = _divergence_states()
    opp_pid = "B" if side == "row" else "A"
    opponent = OpponentSpec.pure(_empty_alloc(opp_pid))

    real = br._trial_award_pair

    def corrupt(*args, **kwargs):
        aw_a, aw_b = real(*args, **kwargs)
        # Inflate the fixed (empty) opponent's award: B for a row BR, A for a column BR.
        return (aw_a, aw_b + 100) if side == "row" else (aw_a + 100, aw_b)

    monkeypatch.setattr(br, "_trial_award_pair", corrupt)
    with pytest.raises(BestResponseValidationError):
        best_response(cfg, states, side, "win", opponent, method="milp")


def test_exact_method_catches_subtolerance_decomposition_error(monkeypatch):
    """Hardening (Task 8): an exact-arithmetic method is validated by an EXACT
    comparison even over a mixture, so a sub-tolerance (1e-15) decomposition error is
    still caught — it can never be emitted under the ``exact_dp`` evidence class
    (REQ-6.4, NFR-5). A uniform shift leaves the DP argmax unchanged, so the assembled
    allocation is still optimal; only the *claimed* objective is corrupted, which is
    exactly what re-validation must reject."""
    cfg, states = _divergence_states()
    opp_allocs = enumerate_allocations(cfg, states[COL_PLAYER], player_count=2)
    opponent = OpponentSpec.mixture([(opp_allocs[0], Fraction(1, 2)), (opp_allocs[1], Fraction(1, 2))])

    real = br._trial_contribution
    tiny = Fraction(1, 10**15)  # far below the 1e-9 numerical tolerance
    monkeypatch.setattr(br, "_trial_contribution", lambda *a, **k: real(*a, **k) + tiny)
    with pytest.raises(BestResponseValidationError):
        best_response(cfg, states, "row", "margin", opponent, method="dp")


# --------------------------------------------------------------------------- #
# The reported value is the resolver's, not the method's search heuristic       #
# (REQ-6.2, REQ-6.5): DP, MILP and exhaustive agree on the row-payoff value.    #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("side", ["row", "column"])
def test_all_methods_report_identical_resolver_value_margin(side):
    cfg, states = _divergence_states()
    opp = OpponentSpec.pure(enumerate_allocations(cfg, states[_opponent_seat(side)], player_count=2)[2])
    dp = best_response(cfg, states, side, "margin", opp, method="dp")
    milp = best_response(cfg, states, side, "margin", opp, method="milp")
    exhaustive = best_response(cfg, states, side, "margin", opp, method="exhaustive")
    assert Fraction(dp.value_row_payoff) == Fraction(exhaustive.value_row_payoff)
    assert Fraction(milp.value_row_payoff) == Fraction(exhaustive.value_row_payoff)


@pytest.mark.parametrize("side", ["row", "column"])
def test_milp_and_exhaustive_report_identical_resolver_value_win(side):
    cfg, states = _divergence_states()
    opp = OpponentSpec.pure(enumerate_allocations(cfg, states[_opponent_seat(side)], player_count=2)[2])
    milp = best_response(cfg, states, side, "win", opp, method="milp")
    exhaustive = best_response(cfg, states, side, "win", opp, method="exhaustive")
    assert Fraction(milp.value_row_payoff) == Fraction(exhaustive.value_row_payoff)
