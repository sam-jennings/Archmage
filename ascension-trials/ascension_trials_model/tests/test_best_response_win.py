"""VS3 Task 7 — exact win best-response oracle (REQ-5, REQ-6, REQ-13, NFR-3/4/5).

The win oracle finds an optimal deviation for one side against a fixed opponent
(pure or a mixture) that maximises the acting side's expected *win sign*, over that
side's **entire** legal allocation space. Its primary oracle is an expected-sign
``scipy.optimize.milp`` — binary win/tie/loss indicators linked to the sign of the
Recognition-Point difference and, on an RP tie, the final Spellbook tiebreak — never
a per-domain dynamic program (REQ-5.1), and never ``scipy.optimize.linprog``
(REQ-5.4). Every result is re-validated by the resolver before it counts (design §6).

These tests prove:

* the MILP's resolver-recomputed value equals an independent brute-force win
  optimum for **every** opponent pure strategy and for mixtures, on **both** sides
  (REQ-5, REQ-6.2, REQ-7.1);
* MILP and exhaustive agree on tractable states (REQ-7.1);
* a planted fixture where the **win optimum differs from the margin optimum**
  (REQ-5, REQ-7.3);
* the certificate carries the backend, solver status, absolute/relative MIP gap and
  the row-payoff objective bound, with evidence class
  ``numerical_milp_best_response_certified`` — never exact (REQ-5.4, REQ-6.3, NFR-5);
* an unequal-state hand oracle (REQ-7.2);
* the uncertified-optimality behaviour: non-modelable states fall back to exhaustive,
  and an over-limit non-modelable state raises rather than emitting an unproven
  "best" (REQ-5.6, NFR-4);
* resolver re-validation catches a corrupted MILP model (REQ-6.4);
* determinism (NFR-1).

Hand oracles are derived from the rules, not from oracle output (REQ-9.4).
"""

from __future__ import annotations

from fractions import Fraction

import pytest

from ascension_trials import best_response as br
from ascension_trials.best_response import (
    EXACT_EXHAUSTIVE,
    NUMERICAL_MILP,
    BestResponseValidationError,
    NonOptimalBestResponseError,
    OpponentSpec,
    best_response,
)
from ascension_trials.enumerate import (
    enumerate_allocations,
    find_allocation_by_normal_totals,
    normal_totals_by_trial,
)
from ascension_trials.matrix import COL_PLAYER, ROW_PLAYER
from ascension_trials.resolver import resolve_profile
from ascension_trials.schema import Allocation, PlayerState

from vs2_support import load_referenced_config, load_vs2_fixture


# --------------------------------------------------------------------------- #
# Fixtures / helpers                                                           #
# --------------------------------------------------------------------------- #


def _cfg_state(fixture_id, key="config_ref", state_key="state"):
    fx = load_vs2_fixture(fixture_id)
    cfg = load_referenced_config(fx, key)
    st = fx[state_key]
    state = PlayerState(
        player_id=st["player_id"],
        normal_power=dict(st["normal_power"]),
        wild_power=st.get("wild_power", 0),
    )
    return cfg, state


def _divergence_cfg():
    """WIN-MARGIN-1: t1 first=2, t2 first=3, optional, local tiebreak, no final."""
    return load_referenced_config({"config_ref": "configs/toy/win_margin_divergence.json"})


def _empty_alloc(pid):
    return Allocation(player_id=pid)


def _brute_force_win(config, states, side, opponent, player_count=2):
    """Independent brute-force win best-response value in the row-payoff convention.

    Enumerates the acting side's legal allocations, resolves each against the
    opponent support with the *direct* resolver, reads the resolver's win utility
    for row player A, and returns the best own objective (row: max row-payoff;
    column: max -row-payoff) with the row-payoff value of the argmax. Shares no code
    with the MILP.
    """
    acting_seat = ROW_PLAYER if side == "row" else COL_PLAYER
    acting_state = states[acting_seat]
    allocs = enumerate_allocations(config, acting_state, player_count=player_count)
    best_own = None
    best_row = None
    for cand in allocs:
        row_val = Fraction(0)
        for opp_alloc, prob in opponent.support:
            if side == "row":
                res = resolve_profile(
                    config, {ROW_PLAYER: states[ROW_PLAYER], COL_PLAYER: states[COL_PLAYER]},
                    {ROW_PLAYER: cand, COL_PLAYER: opp_alloc}, player_count,
                )
            else:
                res = resolve_profile(
                    config, {ROW_PLAYER: states[ROW_PLAYER], COL_PLAYER: states[COL_PLAYER]},
                    {ROW_PLAYER: opp_alloc, COL_PLAYER: cand}, player_count,
                )
            row_val += prob * int(res.win_utility.get(ROW_PLAYER, 0))
        own = row_val if side == "row" else -row_val
        if best_own is None or own > best_own:
            best_own = own
            best_row = row_val
    return best_own, best_row


# --------------------------------------------------------------------------- #
# Modelability gate (design §6.3)                                              #
# --------------------------------------------------------------------------- #


def test_win_milp_modelable_on_optional_local_configs():
    """A4 (optional, local total_power tiebreak, no final tiebreak) and the
    divergence fixture are MILP-modelable."""
    cfg_a4, _ = _cfg_state("A4")
    modelable, reasons = br._win_milp_modelable(cfg_a4, player_count=2)
    assert modelable is True and reasons == ()
    modelable_d, reasons_d = br._win_milp_modelable(_divergence_cfg(), player_count=2)
    assert modelable_d is True and reasons_d == ()


def test_win_milp_not_modelable_on_full_completion():
    """A5 tie_fest uses FULL completion, which couples legality across Trials, so the
    per-Trial-selection MILP feasible region would not match the legal space."""
    cfg_a5, _ = _cfg_state("A5")
    modelable, reasons = br._win_milp_modelable(cfg_a5, player_count=2)
    assert modelable is False
    assert any("completion" in r for r in reasons)


# --------------------------------------------------------------------------- #
# MILP vs brute force — every pure opponent, both sides (REQ-5, REQ-6.2, 7.1)   #
# --------------------------------------------------------------------------- #


def test_win_milp_matches_bruteforce_all_pure_opponents_row():
    cfg = _divergence_cfg()
    sa = PlayerState(player_id="A", normal_power={"fungible": 2})
    sb = PlayerState(player_id="B", normal_power={"fungible": 2})
    states = {ROW_PLAYER: sa, COL_PLAYER: sb}
    for b in enumerate_allocations(cfg, sb, player_count=2):
        opponent = OpponentSpec.pure(b)
        bench_own, bench_row = _brute_force_win(cfg, states, "row", opponent)
        result = best_response(cfg, states, "row", "win", opponent, method="auto")
        assert result.evidence_class == NUMERICAL_MILP
        assert Fraction(result.value_row_payoff) == bench_row


def test_win_milp_matches_bruteforce_all_pure_opponents_column():
    cfg = _divergence_cfg()
    sa = PlayerState(player_id="A", normal_power={"fungible": 2})
    sb = PlayerState(player_id="B", normal_power={"fungible": 2})
    states = {ROW_PLAYER: sa, COL_PLAYER: sb}
    for a in enumerate_allocations(cfg, sa, player_count=2):
        opponent = OpponentSpec.pure(a)
        bench_own, bench_row = _brute_force_win(cfg, states, "column", opponent)
        result = best_response(cfg, states, "column", "win", opponent, method="auto")
        assert result.evidence_class == NUMERICAL_MILP
        assert Fraction(result.value_row_payoff) == bench_row
        assert result.value_side_payoff == pytest.approx(-result.value_row_payoff)


# --------------------------------------------------------------------------- #
# MILP vs brute force — mixtures, both sides (REQ-5, REQ-7.1)                    #
# --------------------------------------------------------------------------- #


def test_win_milp_matches_bruteforce_on_mixture_row():
    cfg = _divergence_cfg()
    sa = PlayerState(player_id="A", normal_power={"fungible": 2})
    sb = PlayerState(player_id="B", normal_power={"fungible": 2})
    states = {ROW_PLAYER: sa, COL_PLAYER: sb}
    b_allocs = enumerate_allocations(cfg, sb, player_count=2)
    opponent = OpponentSpec.mixture(
        [(b_allocs[0], Fraction(1, 2)), (b_allocs[2], Fraction(1, 3)), (b_allocs[4], Fraction(1, 6))]
    )
    bench_own, bench_row = _brute_force_win(cfg, states, "row", opponent)
    result = best_response(cfg, states, "row", "win", opponent, method="auto")
    assert result.evidence_class == NUMERICAL_MILP
    assert Fraction(result.value_row_payoff) == bench_row


def test_win_milp_matches_bruteforce_on_mixture_column():
    cfg = _divergence_cfg()
    sa = PlayerState(player_id="A", normal_power={"fungible": 2})
    sb = PlayerState(player_id="B", normal_power={"fungible": 2})
    states = {ROW_PLAYER: sa, COL_PLAYER: sb}
    a_allocs = enumerate_allocations(cfg, sa, player_count=2)
    opponent = OpponentSpec.mixture(
        [(a_allocs[1], Fraction(2, 3)), (a_allocs[3], Fraction(1, 3))]
    )
    bench_own, bench_row = _brute_force_win(cfg, states, "column", opponent)
    result = best_response(cfg, states, "column", "win", opponent, method="auto")
    assert result.evidence_class == NUMERICAL_MILP
    assert Fraction(result.value_row_payoff) == bench_row


# --------------------------------------------------------------------------- #
# MILP == exhaustive on a larger tractable fixture (A4) (REQ-7.1)               #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("side", ["row", "column"])
def test_win_milp_equals_exhaustive_on_a4_sampled(side):
    """A4 (budget 6, 3 Trials, 84 legal allocations): the MILP and the exact
    exhaustive oracle agree for a sample of pure opponents and a mixture."""
    cfg, state = _cfg_state("A4")
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    opp_allocs = enumerate_allocations(cfg, state, player_count=2)
    for idx in (0, 7, 20, 41, 83):
        opponent = OpponentSpec.pure(opp_allocs[idx])
        milp = best_response(cfg, states, side, "win", opponent, method="milp")
        exhaustive = best_response(cfg, states, side, "win", opponent, method="exhaustive")
        assert milp.evidence_class == NUMERICAL_MILP
        assert exhaustive.evidence_class == EXACT_EXHAUSTIVE
        assert Fraction(milp.value_row_payoff) == Fraction(exhaustive.value_row_payoff)
    mixture = OpponentSpec.mixture(
        [(opp_allocs[0], Fraction(1, 2)), (opp_allocs[7], Fraction(1, 2))]
    )
    milp = best_response(cfg, states, side, "win", mixture, method="milp")
    exhaustive = best_response(cfg, states, side, "win", mixture, method="exhaustive")
    assert Fraction(milp.value_row_payoff) == Fraction(exhaustive.value_row_payoff)


# --------------------------------------------------------------------------- #
# Win optimum differs from margin optimum (REQ-5, REQ-7.3)                       #
# --------------------------------------------------------------------------- #


def test_win_optimum_differs_from_margin_optimum():
    """WIN-MARGIN-1 (hand oracle, see the config notes): against the mixture
    {B empty, B=(1,1)} each 1/2, the margin oracle uniquely picks (1,1)
    (E[margin]=5/2, E[win]=1/2) while the win oracle uniquely picks (0,2)
    (E[win]=1, E[margin]=2). The two objectives are not interchangeable."""
    cfg = _divergence_cfg()
    sa = PlayerState(player_id="A", normal_power={"fungible": 2})
    sb = PlayerState(player_id="B", normal_power={"fungible": 2})
    states = {ROW_PLAYER: sa, COL_PLAYER: sb}
    b_allocs = enumerate_allocations(cfg, sb, player_count=2)
    b11 = find_allocation_by_normal_totals(cfg, b_allocs, (1, 1), 2)
    assert b11 is not None
    opponent = OpponentSpec.mixture([(_empty_alloc("B"), Fraction(1, 2)), (b11, Fraction(1, 2))])

    win = best_response(cfg, states, "row", "win", opponent, method="auto")
    margin = best_response(cfg, states, "row", "margin", opponent, method="auto")

    # The two oracles return DIFFERENT allocations.
    win_totals = normal_totals_by_trial(cfg, win.allocation, 2)
    margin_totals = normal_totals_by_trial(cfg, margin.allocation, 2)
    assert win_totals == (0, 2)
    assert margin_totals == (1, 1)
    assert win_totals != margin_totals

    # Hand-derived expected values.
    assert win.value_row_payoff == 1.0        # E[win] of (0,2)
    assert margin.value_row_payoff == 2.5      # E[margin] of (1,1)

    # Each argmax is strictly worse on the OTHER objective (proves non-interchangeable):
    # (1,1) has E[win]=1/2 < 1, and (0,2) has E[margin]=2 < 5/2.
    def _expected_row(alloc, utility):
        total = Fraction(0)
        for opp_alloc, prob in opponent.support:
            res = resolve_profile(
                cfg, {ROW_PLAYER: sa, COL_PLAYER: sb},
                {ROW_PLAYER: alloc, COL_PLAYER: opp_alloc}, 2,
            )
            u = res.win_utility if utility == "win" else res.margin_utility
            total += prob * int(u.get(ROW_PLAYER, 0))
        return total

    assert _expected_row(margin.allocation, "win") == Fraction(1, 2)
    assert _expected_row(margin.allocation, "win") < Fraction(win.value_row_payoff)
    assert _expected_row(win.allocation, "margin") == Fraction(2)
    assert _expected_row(win.allocation, "margin") < Fraction(margin.value_row_payoff)


# --------------------------------------------------------------------------- #
# Unequal-state hand oracle (REQ-7.2)                                          #
# --------------------------------------------------------------------------- #


def test_win_unequal_states_hand_verified():
    """asym_two_trial, A budget 2 vs B budget 1 fixed on trial_a with 1. A's win-best:
    play (1,1) — tie trial_a (shared 2 each) and win trial_b uncontested (2) ->
    r_A=4 > r_B=2, A wins (win +1). Any allocation that wins at least the net game
    scores +1, so the win value is +1."""
    cfg = load_referenced_config({"config_ref": "configs/toy/asym_two_trial.json"})
    state_a = PlayerState(player_id="A", normal_power={"fungible": 2})
    state_b = PlayerState(player_id="B", normal_power={"fungible": 1})
    states = {ROW_PLAYER: state_a, COL_PLAYER: state_b}
    b_allocs = enumerate_allocations(cfg, state_b, player_count=2)
    b_on_a = find_allocation_by_normal_totals(cfg, b_allocs, (1, 0), 2)
    assert b_on_a is not None
    opponent = OpponentSpec.pure(b_on_a)

    bench_own, bench_row = _brute_force_win(cfg, states, "row", opponent)
    result = best_response(cfg, states, "row", "win", opponent, method="auto")
    assert result.evidence_class == NUMERICAL_MILP
    assert Fraction(result.value_row_payoff) == bench_row
    assert result.value_row_payoff == 1.0


# --------------------------------------------------------------------------- #
# Certificate: backend, status, MIP gap, evidence class (REQ-5.4, 6.3, NFR-3/5) #
# --------------------------------------------------------------------------- #


def test_win_milp_certificate_records_backend_status_and_gap():
    cfg = _divergence_cfg()
    sa = PlayerState(player_id="A", normal_power={"fungible": 2})
    sb = PlayerState(player_id="B", normal_power={"fungible": 2})
    states = {ROW_PLAYER: sa, COL_PLAYER: sb}
    opponent = OpponentSpec.pure(_empty_alloc("B"))
    result = best_response(cfg, states, "row", "win", opponent, method="milp")
    cert = result.certificate

    assert result.evidence_class == NUMERICAL_MILP  # never labelled exact (NFR-5)
    assert cert.method == "milp"
    assert cert.optimal is True
    assert cert.relative_mip_gap is not None       # absolute/relative gap recorded (REQ-5.4)
    assert cert.solver_status                       # HiGHS status message recorded
    assert cert.proof["backend"] == br.MILP_BACKEND  # scipy.optimize.milp, not linprog
    assert "final_tie_sign" in cert.proof
    assert "per_opponent_outcome" in cert.proof
    # Row BR: the certified objective bound is an UPPER bound == the incumbent here.
    assert cert.solver_objective_bound == pytest.approx(cert.resolver_incumbent_value)
    assert cert.tolerances["milp_relative_gap"] == br.DEFAULT_REL_TOL


def test_win_column_bound_is_lower_bound_convention():
    """A column BR minimises the row payoff; its certified objective bound is a LOWER
    bound in the row-payoff convention, and value_side_payoff == -value_row_payoff."""
    cfg = _divergence_cfg()
    sa = PlayerState(player_id="A", normal_power={"fungible": 2})
    sb = PlayerState(player_id="B", normal_power={"fungible": 2})
    states = {ROW_PLAYER: sa, COL_PLAYER: sb}
    a_allocs = enumerate_allocations(cfg, sa, player_count=2)
    result = best_response(cfg, states, "column", "win", OpponentSpec.pure(a_allocs[3]), method="milp")
    cert = result.certificate
    assert result.value_side_payoff == pytest.approx(-result.value_row_payoff)
    assert cert.solver_objective_bound == pytest.approx(cert.resolver_incumbent_value)


# --------------------------------------------------------------------------- #
# Uncertified optimality: fall back to exhaustive, else raise (REQ-5.6, NFR-4)  #
# --------------------------------------------------------------------------- #


def test_win_nonmodelable_falls_back_to_exhaustive():
    """A5 tie_fest is non-modelable (FULL completion); method='auto' uses the exact
    exhaustive fallback and matches brute force (REQ-5.6)."""
    cfg, state = _cfg_state("A5")
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    b_allocs = enumerate_allocations(cfg, state, player_count=2)
    opponent = OpponentSpec.pure(b_allocs[0])
    result = best_response(cfg, states, "row", "win", opponent, method="auto")
    assert result.evidence_class == EXACT_EXHAUSTIVE
    bench_own, bench_row = _brute_force_win(cfg, states, "row", opponent)
    assert Fraction(result.value_row_payoff) == bench_row


def test_win_milp_uncertified_falls_back_to_exhaustive(monkeypatch):
    """When the MILP cannot certify optimality (here forced), a modelable, tractable
    state falls back to the exact exhaustive oracle rather than emitting an unproven
    'best' (REQ-5.6)."""
    cfg = _divergence_cfg()
    sa = PlayerState(player_id="A", normal_power={"fungible": 2})
    sb = PlayerState(player_id="B", normal_power={"fungible": 2})
    states = {ROW_PLAYER: sa, COL_PLAYER: sb}
    opponent = OpponentSpec.pure(_empty_alloc("B"))

    def _uncertified(*args, **kwargs):
        raise br._WinMilpUncertified("forced non-optimal status for the test")

    monkeypatch.setattr(br, "_win_milp", _uncertified)
    result = best_response(cfg, states, "row", "win", opponent, method="auto")
    assert result.evidence_class == EXACT_EXHAUSTIVE
    assert result.certificate.proof.get("milp_fallback_reason")
    bench_own, bench_row = _brute_force_win(cfg, states, "row", opponent)
    assert Fraction(result.value_row_payoff) == bench_row


def test_win_milp_uncertified_over_limit_raises(monkeypatch):
    """A forced-uncertified MILP on an over-limit (intractable) state raises rather
    than falling back to an unavailable exhaustive search (REQ-5.6, NFR-4)."""
    cfg = _divergence_cfg()
    sa = PlayerState(player_id="A", normal_power={"fungible": 2})
    sb = PlayerState(player_id="B", normal_power={"fungible": 2})
    states = {ROW_PLAYER: sa, COL_PLAYER: sb}
    opponent = OpponentSpec.pure(_empty_alloc("B"))

    def _uncertified(*args, **kwargs):
        raise br._WinMilpUncertified("forced non-optimal status for the test")

    monkeypatch.setattr(br, "_win_milp", _uncertified)
    with pytest.raises(NonOptimalBestResponseError):
        best_response(cfg, states, "row", "win", opponent, method="auto", max_allocations=2)


def test_win_milp_method_rejected_on_nonmodelable():
    cfg, state = _cfg_state("A5")
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    opponent = OpponentSpec.pure(_empty_alloc("B"))
    with pytest.raises(ValueError):
        best_response(cfg, states, "row", "win", opponent, method="milp")


def test_win_nonmodelable_over_limit_raises_nonoptimal():
    """A non-modelable state whose legal space exceeds the enumeration ceiling cannot
    be certified — the oracle raises rather than guessing (REQ-5.6, NFR-4)."""
    cfg, state = _cfg_state("A5")
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    opponent = OpponentSpec.pure(_empty_alloc("B"))
    with pytest.raises(NonOptimalBestResponseError):
        best_response(cfg, states, "row", "win", opponent, method="auto", max_allocations=2)


# --------------------------------------------------------------------------- #
# Resolver re-validation guards a corrupted MILP model (REQ-6.4)                #
# --------------------------------------------------------------------------- #


def test_win_revalidation_catches_modelling_error(monkeypatch):
    """If the per-Trial award pair is corrupted (simulating a broken model), the
    MILP's own objective disagrees with the resolver-recomputed value and the result
    is refused, never emitted (REQ-6.4)."""
    cfg = _divergence_cfg()
    sa = PlayerState(player_id="A", normal_power={"fungible": 2})
    sb = PlayerState(player_id="B", normal_power={"fungible": 2})
    states = {ROW_PLAYER: sa, COL_PLAYER: sb}
    b_allocs = enumerate_allocations(cfg, sb, player_count=2)
    opponent = OpponentSpec.pure(b_allocs[0])

    real = br._trial_award_pair

    def corrupt(*args, **kwargs):
        aw_a, aw_b = real(*args, **kwargs)
        return aw_a + 100, aw_b  # inflate A's award so the model claims phantom wins

    monkeypatch.setattr(br, "_trial_award_pair", corrupt)
    with pytest.raises(BestResponseValidationError):
        best_response(cfg, states, "row", "win", opponent, method="milp")


# --------------------------------------------------------------------------- #
# Determinism (NFR-1)                                                          #
# --------------------------------------------------------------------------- #


def test_win_oracle_is_deterministic():
    cfg = _divergence_cfg()
    sa = PlayerState(player_id="A", normal_power={"fungible": 2})
    sb = PlayerState(player_id="B", normal_power={"fungible": 2})
    states = {ROW_PLAYER: sa, COL_PLAYER: sb}
    b_allocs = enumerate_allocations(cfg, sb, player_count=2)
    opponent = OpponentSpec.mixture([(b_allocs[0], Fraction(1, 2)), (b_allocs[3], Fraction(1, 2))])
    first = best_response(cfg, states, "row", "win", opponent, method="auto")
    second = best_response(cfg, states, "row", "win", opponent, method="auto")
    assert first.value_row_payoff == second.value_row_payoff
    assert first.allocation.normal == second.allocation.normal
    assert first.allocation.wild == second.allocation.wild
