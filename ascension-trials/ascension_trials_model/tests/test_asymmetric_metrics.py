"""VS3 Task 4 - metrics extended to unequal states, parity preserved (REQ-1/2/3/7).

Extends the VS2 metrics suite (``test_vs2_acceptance.py``, ``test_equilibrium.py``)
to the asymmetric case this spec adds. Two things are proven:

1. **Parity regression (REQ-1.5, REQ-3.4).** On every committed VS2 parity fixture the
   extended :func:`compute_small_state_metrics` still takes the frozen VS2 code path
   (``parity is True``), reproduces the committed VS2 oracle values (exact fields
   identical, numerical fields within the recorded tolerance), keeps the equal-state
   counterability gates as real gates (not ``not_applicable``), and keeps the VS2
   ``to_dict`` payload shape (scalar collapsed count). Passing an explicit *equal*
   state (a deep copy) routes to the same parity path and is **byte-identical** to the
   implicit self-play path, and repeated runs are byte-stable (NFR-1).

2. **Unequal-state fixture (REQ-1 acceptance, REQ-7.2).** The committed fixture
   ``fixtures/adversarial/asym1_unequal_budget.json`` (config
   ``configs/toy/asym_two_trial.json``, A power 2 vs B power 1) is a genuinely
   rectangular 6x3 game whose every cell, per-side collapse and per-side canonical
   mixtures are **hand-derived from the rules** (REQ-9.4 provenance discipline - the
   expected values are transcribed from the fixture, not reverse-engineered from engine
   output). The asymmetric metrics path reproduces them: per-side counts, per-side
   canonical row/column mixtures for the win and margin games, per-side ``E^{0.01}``,
   the m*n tie / chain / trial-shared rates, margin-VOI, dead power and reward
   concentration, and the equal-state counterability gates emitted as ``not_applicable``
   (REQ-3.3).
"""

from __future__ import annotations

import copy
import json
from fractions import Fraction
from pathlib import Path

import pytest

from ascension_trials import equilibrium as eq
from ascension_trials.canonical import canonical_json
from ascension_trials.config_loader import load_configuration
from ascension_trials.enumerate import enumerate_allocations, normal_totals_by_trial
from ascension_trials.matrix import build_two_player_payoff_matrix, collapse_strategies_per_side
from ascension_trials.metrics import compute_small_state_metrics
from ascension_trials.schema import PlayerState

from vs2_support import PACKAGE_ROOT, load_referenced_config, load_vs2_fixture

ASYM_FIXTURE = PACKAGE_ROOT / "fixtures" / "adversarial" / "asym1_unequal_budget.json"

# Committed VS2 parity fixtures that carry a config_ref + a single self-play state.
PARITY_FIXTURES = ["A3", "A4", "A5", "A6", "A19", "A20"]
# The small parity fixtures used for the (double-computed) byte-stability proof.
SMALL_PARITY_FIXTURES = ["A3", "A5", "A19", "A20"]

_MIX_TOL = 1e-3


# --------------------------------------------------------------------------- #
# Helpers                                                                      #
# --------------------------------------------------------------------------- #


def _state_from(block: dict) -> PlayerState:
    return PlayerState(
        player_id=block["player_id"],
        normal_power=dict(block["normal_power"]),
        wild_power=block.get("wild_power", 0),
    )


def _cfg_state(fixture_id: str):
    fx = load_vs2_fixture(fixture_id)
    cfg = load_referenced_config(fx)
    return fx, cfg, _state_from(fx["state"])


_PARITY_METRICS_CACHE: dict = {}


def _parity_metrics(fixture_id: str):
    """Compute (and cache) the parity metrics for a committed VS2 fixture."""
    if fixture_id not in _PARITY_METRICS_CACHE:
        fx, cfg, state = _cfg_state(fixture_id)
        metrics = compute_small_state_metrics(cfg, state, player_count=fx["player_count"])
        _PARITY_METRICS_CACHE[fixture_id] = (fx, metrics)
    return _PARITY_METRICS_CACHE[fixture_id]


def _load_asym():
    fx = json.loads(ASYM_FIXTURE.read_text(encoding="utf-8"))
    cfg = load_configuration(PACKAGE_ROOT / fx["config_ref"])
    return fx, cfg, _state_from(fx["state_a"]), _state_from(fx["state_b"])


def _totals_key(key: str) -> tuple[int, ...]:
    """Parse a "(a,b)" totals string key into a tuple of ints."""
    return tuple(int(part) for part in key.strip("()").split(","))


# --------------------------------------------------------------------------- #
# Parity regression: VS3 == VS2 exactly on every committed parity fixture       #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("fixture_id", PARITY_FIXTURES)
def test_parity_takes_vs2_path_with_equal_state_gates(fixture_id):
    """At parity the extended metrics take the frozen VS2 path: the equal-state
    counterability gates are real (not not_applicable) and the counts payload keeps its
    VS2 scalar shape (REQ-1.5, REQ-3.3, REQ-3.4)."""
    _fx, metrics = _parity_metrics(fixture_id)
    assert metrics.parity is True
    # Equal-state counterability gates (G4/G5) and the mirror counter-distance are
    # real metrics at parity, never not_applicable.
    assert metrics.counter_R is not None and metrics.counter_E is not None
    assert metrics.mean_counter_distance is not None
    # Per-side (B) fields stay at their parity defaults (the VS2 payload never reads them).
    assert metrics.collapsed_class_count_b is None
    assert metrics.equilibrium_relevant_column is None

    d = metrics.to_dict()
    assert d["counterability"]["c1_over_R"] != "not_applicable"
    assert d["counterability"]["c1_over_E_0_01"] != "not_applicable"
    # VS2 payload shape: collapsed count is a scalar (asymmetric would be {"A":..,"B":..}).
    assert isinstance(d["counts"]["collapsed_classes"], int)
    # |R| / |E^0.01| are scalars at parity too (asymmetric reports them per side).
    assert isinstance(d["counts"]["reasonable_set_R"], int)
    assert isinstance(d["counts"]["equilibrium_relevant_E_0_01"], int)


@pytest.mark.parametrize("fixture_id", PARITY_FIXTURES)
def test_parity_reproduces_committed_vs2_oracles(fixture_id):
    """The extended metrics reproduce each committed VS2 oracle on its parity fixture -
    exact fields identical, numerical fields within the recorded tolerance (REQ-1.5,
    REQ-3.4). Oracles are the fixture's hand-derived expected block (REQ-9.4)."""
    fx, metrics = _parity_metrics(fixture_id)
    exp = fx["expected"]

    # Every parity fixture agrees on legal-allocation count; both sides are equal.
    assert metrics.legal_count_a == exp["legal_allocations"]
    assert metrics.legal_count_b == metrics.legal_count_a

    if fixture_id == "A4":
        assert abs(metrics.win_value - exp["win_lp_value"]) <= exp["lp_value_tolerance"]
        assert metrics.equilibrium_relevant_size >= 1
    elif fixture_id == "A5":
        assert metrics.final_tie_rate == Fraction(str(exp["final_tie_rate"]))
    elif fixture_id == "A6":
        assert metrics.final_tie_rate == Fraction(exp["ordered_pair_tie_rate"])
    elif fixture_id == "A19":
        assert metrics.collapsed_class_count == exp["collapsed_classes"]
    elif fixture_id == "A20":
        assert metrics.trial_shared_award_rate == Fraction(exp["trial_shared_award_rate"])
    elif fixture_id == "A3":
        assert metrics.counter_R.c1_holds is False


@pytest.mark.parametrize("fixture_id", SMALL_PARITY_FIXTURES)
def test_parity_is_byte_stable_and_explicit_equal_state_is_identical(fixture_id):
    """Repeated runs are byte-stable, and passing an explicit equal state (a deep copy)
    routes to the same parity path with a byte-identical payload as the implicit
    self-play path (NFR-1; REQ-1.5)."""
    fx, cfg, state = _cfg_state(fixture_id)
    pc = fx["player_count"]

    implicit = compute_small_state_metrics(cfg, state, player_count=pc)
    explicit_equal = compute_small_state_metrics(cfg, state, copy.deepcopy(state), player_count=pc)
    repeat = compute_small_state_metrics(cfg, state, player_count=pc)

    baseline = canonical_json(implicit.to_dict())
    assert canonical_json(repeat.to_dict()) == baseline  # deterministic / byte-stable
    assert canonical_json(explicit_equal.to_dict()) == baseline  # equal-state == self-play
    assert explicit_equal.parity is True


# --------------------------------------------------------------------------- #
# Unequal-state fixture: rectangular matrix (REQ-1.3, REQ-7.2)                  #
# --------------------------------------------------------------------------- #


def _asym_matrix():
    fx, cfg, sa, sb = _load_asym()
    allocs_a = enumerate_allocations(cfg, sa, 2)
    allocs_b = enumerate_allocations(cfg, sb, 2)
    M = build_two_player_payoff_matrix(cfg, sa, sb, allocs_a, allocs_b, player_count=2)
    return fx, cfg, sa, sb, allocs_a, allocs_b, M


def test_asym_fixture_matrix_matches_hand_derivation():
    """Every one of the 6x3 cells matches the hand-derived win/margin/final-tie oracle
    (REQ-1.3, REQ-9.4)."""
    fx, cfg, _sa, _sb, allocs_a, allocs_b, M = _asym_matrix()
    exp = fx["expected"]
    assert list(M.shape) == exp["matrix_shape"] == [6, 3]
    assert len(allocs_a) == exp["legal_allocations"]["A"] == 6
    assert len(allocs_b) == exp["legal_allocations"]["B"] == 3

    ia = {normal_totals_by_trial(cfg, a, 2): i for i, a in enumerate(allocs_a)}
    ib = {normal_totals_by_trial(cfg, b, 2): j for j, b in enumerate(allocs_b)}
    seen = 0
    for cell in exp["matrix"]:
        i = ia[tuple(cell["a"])]
        j = ib[tuple(cell["b"])]
        assert int(M.win[i, j]) == cell["win"], (cell["a"], cell["b"])
        assert int(M.margin[i, j]) == cell["margin"], (cell["a"], cell["b"])
        assert bool(M.final_tie[i, j]) == cell["final_tie"], (cell["a"], cell["b"])
        seen += 1
    assert seen == 6 * 3 == 18


def test_asym_fixture_per_side_collapse_matches_oracle():
    """Per-side collapse: 6 row classes (A) and 3 column classes (B); no behavioural
    merge on either side (hand-derived, REQ-2.1, REQ-9.4)."""
    fx, _cfg, _sa, _sb, _aa, _ab, M = _asym_matrix()
    exp = fx["expected"]
    ps = collapse_strategies_per_side(M)
    assert ps.row_class_count == exp["collapsed_classes"]["A"] == 6
    assert ps.column_class_count == exp["collapsed_classes"]["B"] == 3
    # No merge on either side: every strategy is its own class.
    assert sorted(len(v) for v in ps.row_classes.values()) == [1, 1, 1, 1, 1, 1]
    assert sorted(len(v) for v in ps.column_classes.values()) == [1, 1, 1]


def test_asym_fixture_per_side_canonical_mixtures_match_oracle():
    """Per-side canonical row/column mixtures and per-side E^0.01 for the win and margin
    games match the hand-derived oracle (REQ-2.2, REQ-2.3, REQ-9.4)."""
    fx, cfg, _sa, _sb, _aa, _ab, M = _asym_matrix()
    exp = fx["expected"]
    cm = collapse_strategies_per_side(M).matrix
    rmap = {normal_totals_by_trial(cfg, a, 2): k for k, a in enumerate(cm.row_allocations)}
    cmap = {normal_totals_by_trial(cfg, b, 2): k for k, b in enumerate(cm.column_allocations)}

    # --- Win game ---
    win = eq.solve_two_sided_equilibrium(cm.win, "win")
    wexp = exp["win_game"]
    assert abs(win.value - wexp["value"]) <= wexp["value_tolerance"]
    # Row maximin is pure on (1,1).
    r_idx = rmap[tuple(wexp["row_maximin_pure"])]
    assert win.row_equilibrium.probabilities[r_idx] == pytest.approx(1.0, abs=_MIX_TOL)
    # Column mixture (indifferent -> uniform).
    for key, prob in wexp["column_mixture"]["probabilities_by_b_totals"].items():
        c_idx = cmap[_totals_key(key)]
        assert win.column_equilibrium.probabilities[c_idx] == pytest.approx(prob, abs=_MIX_TOL)
    # Per-side E^0.01.
    got_row_E = {normal_totals_by_trial(cfg, cm.row_allocations[i], 2) for i in win.row_relevant_set.included}
    assert got_row_E == {tuple(t) for t in wexp["row_E_0_01_totals"]}
    got_col_E = {normal_totals_by_trial(cfg, cm.column_allocations[j], 2) for j in win.column_relevant_set.included}
    assert got_col_E == {tuple(t) for t in wexp["column_E_0_01_totals"]}

    # --- Margin game ---
    margin = eq.solve_two_sided_equilibrium(cm.margin, "margin")
    mexp = exp["margin_game"]
    assert abs(margin.value - mexp["value"]) <= mexp["value_tolerance"]
    mr_idx = rmap[tuple(mexp["row_maximin_pure"])]
    assert margin.row_equilibrium.probabilities[mr_idx] == pytest.approx(1.0, abs=_MIX_TOL)
    for key, prob in mexp["column_mixture"]["probabilities_by_b_totals"].items():
        c_idx = cmap[_totals_key(key)]
        assert margin.column_equilibrium.probabilities[c_idx] == pytest.approx(prob, abs=_MIX_TOL)


# --------------------------------------------------------------------------- #
# Unequal-state fixture: full asymmetric metrics (REQ-3.1/3.2/3.3)             #
# --------------------------------------------------------------------------- #


def test_asym_metrics_per_side_counts_and_values():
    """The asymmetric metrics path reports per-side counts and the game values from the
    hand-derived oracle (REQ-3.1)."""
    fx, cfg, sa, sb = _load_asym()
    exp = fx["expected"]
    m = compute_small_state_metrics(cfg, sa, sb, player_count=2)

    assert m.parity is False
    assert (m.legal_count_a, m.legal_count_b) == (exp["legal_allocations"]["A"], exp["legal_allocations"]["B"])
    assert (m.collapsed_class_count, m.collapsed_class_count_b) == (
        exp["collapsed_classes"]["A"],
        exp["collapsed_classes"]["B"],
    )
    assert (m.reasonable_set_size, m.reasonable_set_size_b) == (
        exp["reasonable_set_R"]["A"],
        exp["reasonable_set_R"]["B"],
    )
    assert (m.equilibrium_relevant_size, m.equilibrium_relevant_size_b) == (
        exp["equilibrium_relevant_E_0_01"]["A"],
        exp["equilibrium_relevant_E_0_01"]["B"],
    )
    assert abs(m.win_value - exp["win_game"]["value"]) <= 1e-9
    assert abs(m.margin_value - exp["margin_game"]["value"]) <= 1e-9


def test_asym_metrics_rectangular_rates_and_diagnostics():
    """The m*n tie / chain / trial-shared rates, margin-VOI, dead power and reward
    concentration are computed for the rectangular game and match the oracle (REQ-3.1,
    REQ-3.2)."""
    fx, cfg, sa, sb = _load_asym()
    exp = fx["expected"]
    m = compute_small_state_metrics(cfg, sa, sb, player_count=2)

    assert m.final_tie_rate == Fraction(exp["final_tie_rate"])
    assert m.trial_shared_award_rate == Fraction(exp["trial_shared_award_rate"])
    assert m.chain_decided_rate_uniform == Fraction(exp["final_chain_decided_rate_uniform"])
    assert m.reward_concentration == pytest.approx(exp["reward_concentration_herfindahl"])
    assert m.dead_power_a == exp["dead_power_A"]
    # Margin-VOI uses the per-side margin column mixture; here the equilibrium best
    # response equals the game value, so VOI is ~0 (REQ-3.1, REQ-3.2).
    assert abs(m.margin_voi) <= exp["margin_voi_abs_max"]


def test_asym_metrics_counterability_is_not_applicable():
    """Equal-state counterability (G4/G5) and the mirror counter-distance diagnostic are
    emitted as not_applicable on the asymmetric state (REQ-3.3), while margin-VOI (an
    equilibrium-weighted metric) is still reported."""
    fx, cfg, sa, sb = _load_asym()
    m = compute_small_state_metrics(cfg, sa, sb, player_count=2)

    assert m.counter_R is None and m.counter_E is None
    assert m.mean_counter_distance is None

    d = m.to_dict()
    assert d["metadata"]["parity"] is False
    assert d["counterability"]["c1_over_R"] == "not_applicable"
    assert d["counterability"]["c1_over_E_0_01"] == "not_applicable"
    assert d["counterability"]["mean_counter_distance"] == "not_applicable"
    # Per-side counts render as {"A":.., "B":..}; margin-VOI is still a real value.
    assert d["counts"]["collapsed_classes"] == {"A": 6, "B": 3}
    assert d["counts"]["equilibrium_relevant_E_0_01"] == {"A": 1, "B": 3}
    assert "value" in d["counterability"]["margin_voi"]
    # Evidence labels are preserved (REQ-3.5).
    assert d["counts"]["evidence_class"] == "exact exhaustive"
    assert d["equilibrium"]["win"]["evidence_class"] == "numerical LP"
    # The whole payload is JSON-serializable and deterministic.
    assert canonical_json(d) == canonical_json(compute_small_state_metrics(cfg, sa, sb, player_count=2).to_dict())


def test_asym_fixture_carries_hand_derived_provenance():
    """The committed fixture carries source/oracle provenance and hand-verifiable
    expected values, never reverse-engineered from engine output (REQ-7.4, REQ-9.4)."""
    fx, _cfg, _sa, _sb = _load_asym()
    oracle = fx.get("oracle")
    assert isinstance(oracle, dict)
    assert oracle.get("independent_of_implementation") is True
    assert oracle.get("evidence_class") == "exact exhaustive"
    assert "REQ-9.4" in fx.get("provenance", "")
    assert fx["expected"]["counterability"] == "not_applicable"
