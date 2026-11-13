"""VS3 Task 6 — exact margin best-response oracle (REQ-4, REQ-6, REQ-13, NFR-5).

The margin oracle finds an optimal deviation for one side against a fixed opponent
(pure or a mixture) over that side's **entire** legal allocation space, and every
result is re-validated by the resolver before it counts (design §6). These tests
prove:

* the oracle's resolver-recomputed value equals an independent brute-force optimum
  on tractable fixtures, for pure opponents and mixtures, on both sides (REQ-4.1);
* the exact-arithmetic DP, the ``scipy.optimize.milp`` knapsack IP and exhaustive
  search agree on the value (REQ-4.2/4.4);
* the separability check is conservative — it declares *coupled* on any coupling
  feature (Authority §4), and ``method='auto'`` routes coupled states to the exact
  exhaustive fallback (REQ-4.3);
* the returned allocation is legal with explicit residue (REQ-4.5), the reported
  value is the resolver value not the optimiser's (REQ-4.6, REQ-6.2), a
  decomposition error is caught by resolver re-validation (REQ-6.4), and the
  certificate carries the required fields and evidence class (REQ-6.3, REQ-13);
* the win utility is a clean not-implemented seam left for Task 7.

Hand oracles are derived from the rules, not from oracle output (REQ-9.4).
"""

from __future__ import annotations

from fractions import Fraction

import pytest

from ascension_trials import best_response as br
from ascension_trials.best_response import (
    EXACT_DP,
    EXACT_EXHAUSTIVE,
    NUMERICAL_MILP,
    BestResponseValidationError,
    NonOptimalBestResponseError,
    OpponentSpec,
    best_response,
    is_separable_margin,
)
from ascension_trials.config_loader import config_from_dict
from ascension_trials.enumerate import find_allocation_by_normal_totals, normal_totals_by_trial
from ascension_trials.enumerate import enumerate_allocations
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


def _brute_force_margin(config, states, side, opponent, player_count=2):
    """Independent brute-force best response value in the row-payoff convention.

    Enumerates the acting side's legal allocations, resolves each against the
    opponent support with the *direct* resolver, and returns the best own objective
    (row: max row-payoff; column: max −row-payoff) together with the row-payoff
    value of the argmax. This shares no code with the oracle's search.
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
            row_val += prob * int(res.margin_utility.get(ROW_PLAYER, 0))
        own = row_val if side == "row" else -row_val
        if best_own is None or own > best_own:
            best_own = own
            best_row = row_val
    return best_own, best_row


def _empty_alloc(pid):
    return Allocation(player_id=pid)


# --------------------------------------------------------------------------- #
# Separability check is conservative (REQ-4.2/4.3, Authority §4)               #
# --------------------------------------------------------------------------- #


def test_a4_is_separable():
    """A4 (single fungible domain, local total_power tiebreak, optional completion,
    no final tiebreak) is the canonical separable margin case."""
    cfg, _ = _cfg_state("A4")
    sep = is_separable_margin(cfg, player_count=2)
    assert sep.separable is True
    assert sep.reasons == ()


def _base_separable_config():
    return {
        "id": "sep_demo",
        "version": "1.0",
        "supported_player_counts": [2],
        "power_formula": {
            "profile": "declarative",
            "standard_spell_power": {"type": "linear", "expression": "n"},
        },
        "domains": [{"id": "fungible", "class": "fungible"}],
        "trials": [
            {
                "id": "trial_a",
                "active_player_counts": [2],
                "eligibility": {
                    "allowed_domain_classes": ["fungible"],
                    "source_count": {"universe": "class:fungible", "minimum": 1},
                },
                "entry_floor": {"value": 0, "scope": "normal"},
                "tie_award": {"type": "shared_full"},
                "trial_tiebreaks": ["total_power", "shared"],
                "rewards": {"by_player_count": {"2": {"first": 3, "second": 0}}},
            }
        ],
        "allocation": {"completion": "optional", "residue_allowed": True, "infeasible_full_fallback": "reject"},
    }


def test_coupled_on_historical_ratio_tiebreak():
    cfg_dict = _base_separable_config()
    cfg_dict["trials"][0]["trial_tiebreaks"] = ["legacy_focus", "shared"]
    cfg = config_from_dict(cfg_dict)
    sep = is_separable_margin(cfg, player_count=2)
    assert sep.separable is False
    assert any("non-local" in r for r in sep.reasons)


def test_coupled_on_active_final_tiebreak():
    cfg_dict = _base_separable_config()
    cfg_dict["final_result"] = {"final_tiebreaks": ["spell_count", "shared"]}
    cfg = config_from_dict(cfg_dict)
    sep = is_separable_margin(cfg, player_count=2)
    assert sep.separable is False
    assert any("final Spellbook tiebreak" in r for r in sep.reasons)


def test_coupled_on_maximal_completion():
    cfg_dict = _base_separable_config()
    cfg_dict["allocation"]["completion"] = "maximal"
    cfg = config_from_dict(cfg_dict)
    sep = is_separable_margin(cfg, player_count=2)
    assert sep.separable is False
    assert any("completion" in r for r in sep.reasons)


# --------------------------------------------------------------------------- #
# Oracle vs brute force — pure opponents, both sides, DP path (REQ-4.1)         #
# --------------------------------------------------------------------------- #


def test_margin_oracle_matches_bruteforce_all_pure_opponents_row():
    """For A4 (separable), the row margin BR value equals brute force for EVERY
    opponent pure strategy (REQ-4.1, REQ-7.1)."""
    cfg, state = _cfg_state("A4")
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    opp_allocs = enumerate_allocations(cfg, state, player_count=2)
    for b in opp_allocs:
        opponent = OpponentSpec.pure(b)
        bench_own, bench_row = _brute_force_margin(cfg, states, "row", opponent)
        result = best_response(cfg, states, "row", "margin", opponent, method="auto")
        assert result.evidence_class == EXACT_DP
        assert Fraction(result.value_row_payoff) == bench_row
        assert result.value_row_payoff == pytest.approx(float(bench_row))


def test_margin_oracle_matches_bruteforce_all_pure_opponents_column():
    """Column BR minimises the row payoff; value equals brute force and
    value_side_payoff is the negated row payoff (REQ-6.1)."""
    cfg, state = _cfg_state("A4")
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    opp_allocs = enumerate_allocations(cfg, state, player_count=2)
    for a in opp_allocs:
        opponent = OpponentSpec.pure(a)
        bench_own, bench_row = _brute_force_margin(cfg, states, "column", opponent)
        result = best_response(cfg, states, "column", "margin", opponent, method="auto")
        assert Fraction(result.value_row_payoff) == bench_row
        assert result.value_side_payoff == pytest.approx(-result.value_row_payoff)


# --------------------------------------------------------------------------- #
# DP == MILP == exhaustive on the same instances (REQ-4.2/4.4)                 #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("side", ["row", "column"])
def test_dp_milp_exhaustive_agree_pure(side):
    cfg, state = _cfg_state("A4")
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    opp = OpponentSpec.pure(enumerate_allocations(cfg, state, player_count=2)[7])

    dp = best_response(cfg, states, side, "margin", opp, method="dp")
    milp = best_response(cfg, states, side, "margin", opp, method="milp")
    exhaustive = best_response(cfg, states, side, "margin", opp, method="exhaustive")

    assert dp.evidence_class == EXACT_DP
    assert milp.evidence_class == NUMERICAL_MILP
    assert exhaustive.evidence_class == EXACT_EXHAUSTIVE
    assert dp.value_row_payoff == exhaustive.value_row_payoff
    assert milp.value_row_payoff == pytest.approx(exhaustive.value_row_payoff)


def test_dp_matches_bruteforce_on_mixture():
    """Mixture opponent: DP value equals brute force (exact rational arithmetic)."""
    cfg, state = _cfg_state("A4")
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    opp_allocs = enumerate_allocations(cfg, state, player_count=2)
    opponent = OpponentSpec.mixture(
        [(opp_allocs[0], Fraction(1, 2)), (opp_allocs[5], Fraction(1, 3)), (opp_allocs[9], Fraction(1, 6))]
    )
    bench_own, bench_row = _brute_force_margin(cfg, states, "row", opponent)
    result = best_response(cfg, states, "row", "margin", opponent, method="auto")
    assert result.evidence_class == EXACT_DP
    assert Fraction(result.value_row_payoff) == bench_row


# --------------------------------------------------------------------------- #
# Hand-verified value (REQ-9.4 provenance)                                     #
# --------------------------------------------------------------------------- #


def test_hand_verified_row_margin_vs_empty_opponent():
    """asym_two_trial: A holds budget 2 over two Trials worth first=2 each. Against
    an opponent that enters nothing, A enters both Trials uncontested, banking 2+2
    for a row margin of +4 — the hand oracle."""
    cfg = load_referenced_config({"config_ref": "configs/toy/asym_two_trial.json"})
    state_a = PlayerState(player_id="A", normal_power={"fungible": 2})
    state_b = PlayerState(player_id="B", normal_power={"fungible": 1})
    states = {ROW_PLAYER: state_a, COL_PLAYER: state_b}
    opponent = OpponentSpec.pure(_empty_alloc("B"))

    result = best_response(cfg, states, "row", "margin", opponent, method="auto")
    assert result.evidence_class == EXACT_DP
    assert result.value_row_payoff == 4.0
    # The chosen allocation enters both Trials: normal totals (1, 1) in Trial-id order.
    assert normal_totals_by_trial(cfg, result.allocation, 2) == (1, 1)


def test_hand_verified_asymmetric_unequal_states():
    """Unequal-state hand oracle: A budget 2 vs B budget 1 fixed on trial_a with 1.
    A's best margin: play (1,1) — tie trial_a (shared_full 2 each) and win trial_b
    uncontested (2) -> r_A = 2+2 = 4, r_B = 2 -> margin +2."""
    cfg = load_referenced_config({"config_ref": "configs/toy/asym_two_trial.json"})
    state_a = PlayerState(player_id="A", normal_power={"fungible": 2})
    state_b = PlayerState(player_id="B", normal_power={"fungible": 1})
    states = {ROW_PLAYER: state_a, COL_PLAYER: state_b}
    b_allocs = enumerate_allocations(cfg, state_b, player_count=2)
    b_on_a = find_allocation_by_normal_totals(cfg, b_allocs, (1, 0), 2)
    assert b_on_a is not None
    opponent = OpponentSpec.pure(b_on_a)

    bench_own, bench_row = _brute_force_margin(cfg, states, "row", opponent)
    result = best_response(cfg, states, "row", "margin", opponent, method="auto")
    assert Fraction(result.value_row_payoff) == bench_row
    assert result.value_row_payoff == 2.0


# --------------------------------------------------------------------------- #
# auto routes coupled states to the exact exhaustive fallback (REQ-4.3)         #
# --------------------------------------------------------------------------- #


def _coupled_final_tiebreak_setup():
    cfg_dict = {
        "id": "coupled_final_tiebreak",
        "version": "1.0",
        "supported_player_counts": [2],
        "declared_tiebreak_stats": ["spell_count"],
        "power_formula": {
            "profile": "declarative",
            "standard_spell_power": {"type": "linear", "expression": "n"},
        },
        "domains": [{"id": "fungible", "class": "fungible"}],
        "trials": [
            {
                "id": "trial_1",
                "active_player_counts": [2],
                "eligibility": {
                    "allowed_domain_classes": ["fungible"],
                    "source_count": {"universe": "class:fungible", "minimum": 1},
                },
                "entry_floor": {"value": 0, "scope": "normal"},
                "tie_award": {"type": "shared_full"},
                "trial_tiebreaks": ["total_power", "shared"],
                "rewards": {"by_player_count": {"2": {"first": 2, "second": 0}}},
            },
            {
                "id": "trial_2",
                "active_player_counts": [2],
                "eligibility": {
                    "allowed_domain_classes": ["fungible"],
                    "source_count": {"universe": "class:fungible", "minimum": 1},
                },
                "entry_floor": {"value": 0, "scope": "normal"},
                "tie_award": {"type": "shared_full"},
                "trial_tiebreaks": ["total_power", "shared"],
                "rewards": {"by_player_count": {"2": {"first": 2, "second": 0}}},
            },
        ],
        "allocation": {"completion": "optional", "residue_allowed": True, "infeasible_full_fallback": "reject"},
        "final_result": {"final_tiebreaks": ["spell_count", "shared"]},
    }
    cfg = config_from_dict(cfg_dict)
    state_a = PlayerState(player_id="A", normal_power={"fungible": 2}, tiebreak_stats={"spell_count": 10})
    state_b = PlayerState(player_id="B", normal_power={"fungible": 1}, tiebreak_stats={"spell_count": 1})
    return cfg, {ROW_PLAYER: state_a, COL_PLAYER: state_b}


def test_auto_routes_coupled_to_exhaustive_and_matches_bruteforce():
    cfg, states = _coupled_final_tiebreak_setup()
    b_allocs = enumerate_allocations(cfg, states[COL_PLAYER], player_count=2)
    opponent = OpponentSpec.pure(b_allocs[0])

    result = best_response(cfg, states, "row", "margin", opponent, method="auto")
    assert result.evidence_class == EXACT_EXHAUSTIVE  # coupled -> exhaustive
    bench_own, bench_row = _brute_force_margin(cfg, states, "row", opponent)
    assert Fraction(result.value_row_payoff) == bench_row


def test_dp_refused_on_coupled_config():
    cfg, states = _coupled_final_tiebreak_setup()
    opponent = OpponentSpec.pure(_empty_alloc("B"))
    with pytest.raises(ValueError):
        best_response(cfg, states, "row", "margin", opponent, method="dp")


def test_coupled_over_limit_raises_nonoptimal():
    """A coupled state whose legal space exceeds the ceiling cannot be certified —
    the oracle raises NonOptimalBestResponseError rather than guessing (NFR-4)."""
    cfg, states = _coupled_final_tiebreak_setup()
    opponent = OpponentSpec.pure(_empty_alloc("B"))
    with pytest.raises(NonOptimalBestResponseError):
        best_response(cfg, states, "row", "margin", opponent, method="auto", max_allocations=2)


# --------------------------------------------------------------------------- #
# Legality of the returned allocation + explicit residue (REQ-4.5)             #
# --------------------------------------------------------------------------- #


def test_returned_allocation_is_legal_with_explicit_residue():
    cfg, state = _cfg_state("A4")  # budget 6
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    opponent = OpponentSpec.pure(_empty_alloc("B"))
    result = best_response(cfg, states, "row", "margin", opponent, method="auto")

    alloc = result.allocation
    # Ledger reconciles exactly: available == allocated + residue for the domain.
    recon = resolve_profile(
        cfg, {ROW_PLAYER: state, COL_PLAYER: state},
        {ROW_PLAYER: alloc, COL_PLAYER: _empty_alloc("B")}, 2,
    )
    assert recon.validation.valid
    used = sum(sum(d.values()) for d in alloc.normal.values())
    residue = sum(alloc.residue_normal.values())
    assert used + residue == state.normal_power["fungible"]


# --------------------------------------------------------------------------- #
# Certificate fields and resolver-authoritative value (REQ-6.2/6.3, REQ-13)    #
# --------------------------------------------------------------------------- #


def test_dp_certificate_fields():
    cfg, state = _cfg_state("A4")
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    opponent = OpponentSpec.pure(_empty_alloc("B"))
    result = best_response(cfg, states, "row", "margin", opponent, method="dp")
    cert = result.certificate
    assert cert.method == "exact_dp"
    assert cert.optimal is True
    assert cert.relative_mip_gap is None
    assert cert.absolute_optimality_gap == 0.0
    # Exact method: certified bound coincides with the resolver incumbent.
    assert cert.solver_objective_bound == cert.resolver_incumbent_value
    assert "per_trial_choice" in cert.proof
    assert cert.tolerances["absolute"] == br.DEFAULT_ABS_TOL


def test_milp_certificate_records_backend_and_gap():
    cfg, state = _cfg_state("A4")
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    opponent = OpponentSpec.pure(_empty_alloc("B"))
    result = best_response(cfg, states, "row", "margin", opponent, method="milp")
    cert = result.certificate
    assert result.evidence_class == NUMERICAL_MILP
    assert cert.method == "milp"
    assert cert.relative_mip_gap is not None
    assert cert.solver_status  # HiGHS message recorded
    assert cert.proof["backend"] == br.MILP_BACKEND
    assert cert.optimal is True


# --------------------------------------------------------------------------- #
# Resolver re-validation guards a mis-declared separability (REQ-6.4)          #
# --------------------------------------------------------------------------- #


def test_revalidation_catches_decomposition_error(monkeypatch):
    """If the per-Trial contribution is corrupted (simulating a broken separability
    assumption), the DP's assembled optimum disagrees with the resolver and the
    result is refused, never emitted (REQ-6.4)."""
    cfg, state = _cfg_state("A4")
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    opponent = OpponentSpec.pure(enumerate_allocations(cfg, state, player_count=2)[3])

    real = br._trial_contribution

    def corrupt(*args, **kwargs):
        return real(*args, **kwargs) + Fraction(100)  # inflate every per-Trial score

    monkeypatch.setattr(br, "_trial_contribution", corrupt)
    with pytest.raises(BestResponseValidationError):
        best_response(cfg, states, "row", "margin", opponent, method="dp")


# --------------------------------------------------------------------------- #
# Win oracle is now implemented (Task 7); this file still covers only margin    #
# --------------------------------------------------------------------------- #


def test_win_best_response_is_implemented_by_task7():
    """The Task 7 win seam is now filled: ``best_response(..., "win", ...)`` returns a
    resolver-validated result (full coverage lives in test_best_response_win.py)."""
    cfg, state = _cfg_state("A4")
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    opponent = OpponentSpec.pure(_empty_alloc("B"))
    result = best_response(cfg, states, "row", "win", opponent, method="auto")
    assert result.utility == "win"
    assert result.evidence_class in (NUMERICAL_MILP, EXACT_EXHAUSTIVE)


# --------------------------------------------------------------------------- #
# Determinism (NFR-1)                                                          #
# --------------------------------------------------------------------------- #


def test_oracle_is_deterministic():
    cfg, state = _cfg_state("A4")
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    opponent = OpponentSpec.pure(enumerate_allocations(cfg, state, player_count=2)[4])
    first = best_response(cfg, states, "row", "margin", opponent, method="auto")
    second = best_response(cfg, states, "row", "margin", opponent, method="auto")
    assert first.value_row_payoff == second.value_row_payoff
    assert first.allocation.normal == second.allocation.normal
    assert first.allocation.wild == second.allocation.wild
