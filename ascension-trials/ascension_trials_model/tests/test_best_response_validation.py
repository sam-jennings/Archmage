"""VS3 Task 9 - best-response validation suite (REQ-7; REQ-4, REQ-5, REQ-6).

This is the consolidated proof that the win and margin best-response oracles are
*correct*, not merely plausible (design 11.2-11.3). It has four parts:

1. **VS2 fixture sweep (REQ-7.1).** For every tractable VS2 fixture, both oracles
   (win and margin) are compared against an independent brute-force exhaustive
   search, for **every** opponent pure strategy and for tested opponent mixtures,
   on **both** sides. The oracle's resolver-recomputed ``value_row_payoff`` must
   equal the exhaustive optimum in every case.

2. **Planted best-response fixtures (REQ-7.3).** Five committed fixtures, each with
   a hand-verified oracle and provenance, exercising a specific hard condition the
   oracle must get right:
     * ``BR-TRAP-1``    - an illegal-entry trap (a tempting high-reward Trial the
       acting side cannot enter legally, which the oracle must avoid);
     * ``BR-WILD-1``    - Wild legality (a Wild unit that DOES legally raise a Trial
       total on one Trial and does NOT on another);
     * ``BR-SHARED-1``  - a shared (divided) Trial award coupling the two sides'
       payoffs;
     * ``BR-FINALTIE-1``- a game decided only at the final Spellbook tiebreak;
     * ``BR-WINMARGIN-1`` - a state+opponent where the win optimum differs from the
       margin optimum (the two objectives are not interchangeable).

3. **Unequal-state oracle (REQ-7.2).** The committed rectangular fixture ASYM-1
   (``asym1_unequal_budget.json``) receives explicit best-response-oracle checks
   whose expected values are read from its hand-derived matrix.

4. **Provenance audit (REQ-7.4).** Every planted fixture carries source/oracle
   metadata and a hand-verified expected block; none is reverse-engineered from
   oracle output (REQ-9.4).

The brute-force benchmark enumerates the acting side's legal allocations and
resolves each against the opponent support with the **direct** resolver
(:func:`resolve_profile`), sharing no code with the oracle's own search or
re-validation path, so equality is genuine corroboration rather than a tautology.
Every planted-fixture oracle is transcribed from the rules, not reverse-engineered
from engine output (REQ-9.4).
"""

from __future__ import annotations

import json
from fractions import Fraction

import pytest

from ascension_trials import legality
from ascension_trials.best_response import (
    EXACT_EXHAUSTIVE,
    NUMERICAL_MILP,
    OpponentSpec,
    best_response,
)
from ascension_trials.config_loader import load_configuration, state_from_dict
from ascension_trials.enumerate import (
    enumerate_allocations,
    find_allocation_by_normal_totals,
    normal_totals_by_trial,
)
from ascension_trials.matrix import COL_PLAYER, ROW_PLAYER
from ascension_trials.memo import ResolutionMemo
from ascension_trials.resolver import resolve_profile
from ascension_trials.schema import Allocation, PlayerState

from vs2_support import ADVERSARIAL, PACKAGE_ROOT, load_referenced_config, load_vs2_fixture

ABS_TOL = 1e-9

# REQ-14.3 / REQ-9.4 evidence-class vocabulary (shared with the VS1/VS2 fixture audits).
EVIDENCE_CLASSES = frozenset(
    {
        "theorem",
        "exact exhaustive",
        "exact-given-profile",
        "numerical LP",
        "numerical convex",
        "sampled",
        "design judgement",
    }
)


# --------------------------------------------------------------------------- #
# Shared helpers                                                              #
# --------------------------------------------------------------------------- #


def _state(raw: dict) -> PlayerState:
    """Build a PlayerState from a fixture state block (normal power + tiebreak stats)."""
    return PlayerState(
        player_id=raw["player_id"],
        normal_power=dict(raw.get("normal_power", {})),
        wild_power=raw.get("wild_power", 0),
        tiebreak_stats=dict(raw.get("tiebreak_stats", {})),
    )


def _empty(pid: str) -> Allocation:
    return Allocation(player_id=pid)


def _opponent_seat(side: str) -> str:
    return COL_PLAYER if side == "row" else ROW_PLAYER


def _acting_seat(side: str) -> str:
    return ROW_PLAYER if side == "row" else COL_PLAYER


def _brute_force_best_row(cfg, states, side, utility, opponent, player_count=2) -> Fraction:
    """Independent brute-force best-response value in the row-payoff convention.

    Enumerates the acting side's legal allocations, resolves each against the
    opponent support with the **direct** resolver, and returns the row-payoff value
    of the acting side's best own objective (row: max row-payoff; column: max
    -row-payoff). Shares no code with the oracle's search.
    """
    acting_state = states[_acting_seat(side)]
    allocs = enumerate_allocations(cfg, acting_state, player_count=player_count)
    best_own = None
    best_row = None
    for cand in allocs:
        row_val = Fraction(0)
        for opp_alloc, prob in opponent.support:
            if side == "row":
                allocs_map = {ROW_PLAYER: cand, COL_PLAYER: opp_alloc}
            else:
                allocs_map = {ROW_PLAYER: opp_alloc, COL_PLAYER: cand}
            res = resolve_profile(
                cfg, {ROW_PLAYER: states[ROW_PLAYER], COL_PLAYER: states[COL_PLAYER]},
                allocs_map, player_count,
            )
            u = res.win_utility if utility == "win" else res.margin_utility
            row_val += prob * int(u.get(ROW_PLAYER, 0))
        own = row_val if side == "row" else -row_val
        if best_own is None or own > best_own:
            best_own = own
            best_row = row_val
    assert best_row is not None
    return best_row


def _brute_force_both(cfg, states, side, opponent, player_count=2) -> dict[str, Fraction]:
    """Best-response row-payoff for BOTH utilities in one enumeration pass.

    One resolve per (candidate, opponent) pair feeds both the win and the margin
    argmax, halving the resolves versus scoring each utility separately. Returns
    ``{"win": best_row_win, "margin": best_row_margin}`` in the row-payoff convention.
    """
    acting_state = states[_acting_seat(side)]
    allocs = enumerate_allocations(cfg, acting_state, player_count=player_count)
    best: dict[str, tuple] = {"win": (None, None), "margin": (None, None)}
    for cand in allocs:
        win_row = Fraction(0)
        margin_row = Fraction(0)
        for opp_alloc, prob in opponent.support:
            if side == "row":
                allocs_map = {ROW_PLAYER: cand, COL_PLAYER: opp_alloc}
            else:
                allocs_map = {ROW_PLAYER: opp_alloc, COL_PLAYER: cand}
            res = resolve_profile(
                cfg, {ROW_PLAYER: states[ROW_PLAYER], COL_PLAYER: states[COL_PLAYER]},
                allocs_map, player_count,
            )
            win_row += prob * int(res.win_utility.get(ROW_PLAYER, 0))
            margin_row += prob * int(res.margin_utility.get(ROW_PLAYER, 0))
        for utility, row_val in (("win", win_row), ("margin", margin_row)):
            own = row_val if side == "row" else -row_val
            best_own, _best_row = best[utility]
            if best_own is None or own > best_own:
                best[utility] = (own, row_val)
    return {utility: row for utility, (_own, row) in best.items()}


def _tested_mixtures(opp_allocs) -> list[OpponentSpec]:
    """A small deterministic set of opponent mixtures over ``opp_allocs`` (REQ-7.1)."""
    if len(opp_allocs) < 3:
        return []
    picks = [opp_allocs[0], opp_allocs[len(opp_allocs) // 2], opp_allocs[-1]]
    return [
        OpponentSpec.uniform(picks),
        OpponentSpec.mixture(
            [(picks[0], Fraction(1, 2)), (picks[1], Fraction(1, 3)), (picks[2], Fraction(1, 6))]
        ),
    ]


# --------------------------------------------------------------------------- #
# Part 1 - VS2 fixture sweep: both oracles vs exhaustive, every opponent       #
# (REQ-7.1, REQ-4, REQ-5, REQ-6)                                               #
# --------------------------------------------------------------------------- #

# Every VS2 fixture that is a self-play config+state pair small enough to enumerate
# and resolve exhaustively (matching how VS2 decides tractability - MATH-13/MATH-14
# are pure payoff matrices with no config/state, so they carry no best response).
TRACTABLE_VS2_FIXTURES = ["A3", "A4", "A5", "A6", "A19", "A20"]


def _load_vs2_cfg_state(fixture_id):
    fx = load_vs2_fixture(fixture_id)
    cfg = load_referenced_config(fx)
    state = _state(fx["state"])
    return cfg, state, fx.get("player_count", 2)


@pytest.mark.parametrize("fixture_id", TRACTABLE_VS2_FIXTURES)
def test_oracles_match_exhaustive_on_every_vs2_opponent(fixture_id):
    """For a tractable VS2 fixture, both oracles equal exhaustive search for EVERY
    opponent pure strategy and for tested mixtures, on both sides (REQ-7.1)."""
    cfg, state, player_count = _load_vs2_cfg_state(fixture_id)
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    opp_allocs = enumerate_allocations(cfg, state, player_count=player_count)
    memo = ResolutionMemo()  # speeds the oracle's internal resolves; output-identical (REQ-8.5)

    pure_opponents = [OpponentSpec.pure(a) for a in opp_allocs]
    mixtures = _tested_mixtures(opp_allocs)

    for side in ("row", "column"):
        for opponent in pure_opponents + mixtures:
            bench = _brute_force_both(cfg, states, side, opponent, player_count)
            for utility in ("win", "margin"):
                result = best_response(
                    cfg, states, side, utility, opponent,
                    method="auto", player_count=player_count, memo=memo,
                )
                # Authoritative resolver-recomputed value equals the exhaustive optimum.
                assert result.value_row_payoff == pytest.approx(
                    float(bench[utility]), abs=ABS_TOL
                ), (
                    f"{fixture_id} {side} {utility}: oracle {result.value_row_payoff} "
                    f"!= exhaustive {float(bench[utility])}"
                )
                # For a pure opponent the utility is integer -> exact rational equality.
                if opponent.is_pure:
                    assert Fraction(result.value_row_payoff) == bench[utility]


@pytest.mark.parametrize("fixture_id", TRACTABLE_VS2_FIXTURES)
def test_oracle_allocations_are_legal_on_vs2_fixtures(fixture_id):
    """Every returned best-response allocation is a legal, resolver-valid allocation
    (REQ-4.5) - checked against a deterministic sample of opponents on both sides."""
    cfg, state, player_count = _load_vs2_cfg_state(fixture_id)
    states = {ROW_PLAYER: state, COL_PLAYER: state}
    opp_allocs = enumerate_allocations(cfg, state, player_count=player_count)
    sample = [opp_allocs[0], opp_allocs[len(opp_allocs) // 2], opp_allocs[-1]]
    for side in ("row", "column"):
        acting_seat = _acting_seat(side)
        for opp in sample:
            for utility in ("win", "margin"):
                result = best_response(
                    cfg, states, side, utility, OpponentSpec.pure(opp),
                    method="auto", player_count=player_count,
                )
                if side == "row":
                    allocs_map = {ROW_PLAYER: result.allocation, COL_PLAYER: opp}
                else:
                    allocs_map = {ROW_PLAYER: opp, COL_PLAYER: result.allocation}
                res = resolve_profile(cfg, states, allocs_map, player_count)
                assert res.validation.valid, (
                    f"{fixture_id} {side} {utility}: returned allocation invalid: "
                    f"{res.validation.errors}"
                )
                # Explicit residue reconciles the acting side's ledger exactly (REQ-4.5).
                recon = res.conservation[acting_seat]
                for dom, line in recon.items():
                    assert line["allocated"] + line["residue"] == line["available"]


# --------------------------------------------------------------------------- #
# Part 2 - planted best-response fixtures (REQ-7.3)                             #
# --------------------------------------------------------------------------- #

PLANTED_FIXTURES = {
    "BR-TRAP-1": ADVERSARIAL / "br_illegal_entry_trap.json",
    "BR-WILD-1": ADVERSARIAL / "br_wild_legality.json",
    "BR-SHARED-1": ADVERSARIAL / "br_shared_award_coupling.json",
    "BR-FINALTIE-1": ADVERSARIAL / "br_final_tiebreak_decision.json",
    "BR-WINMARGIN-1": ADVERSARIAL / "br_win_margin_divergence.json",
}


def _load_planted(fixture_id: str) -> dict:
    return json.loads(PLANTED_FIXTURES[fixture_id].read_text(encoding="utf-8"))


def _planted_cfg_states(fixture_id: str):
    fx = _load_planted(fixture_id)
    cfg = load_configuration(PACKAGE_ROOT / fx["config_ref"])
    sa = _state(fx["state_a"])
    sb = _state(fx["state_b"])
    return fx, cfg, {ROW_PLAYER: sa, COL_PLAYER: sb}


def test_planted_illegal_entry_trap():
    """BR-TRAP-1: the oracle avoids a tempting high-reward Trial it cannot enter
    legally, taking the legal (smaller) reward instead (REQ-7.3)."""
    fx, cfg, states = _planted_cfg_states("BR-TRAP-1")
    exp = fx["expected"]
    opponent = OpponentSpec.pure(_empty("B"))

    margin = best_response(cfg, states, "row", "margin", opponent, method="auto")
    win = best_response(cfg, states, "row", "win", opponent, method="auto")
    assert margin.value_row_payoff == exp["row_margin_best_value"]  # 4 (from 'minor')
    assert win.value_row_payoff == exp["row_win_best_value"]  # 1

    # The oracle enters 'minor' (index 1) and avoids the illegal 'grand' (index 0).
    for result in (margin, win):
        grand_total, minor_total = normal_totals_by_trial(cfg, result.allocation, 2)
        assert grand_total == 0, "oracle must avoid the illegal 'grand' Trial"
        assert minor_total >= 1, "oracle must enter the legal 'minor' Trial"

    # The tempting trap (both units on 'grand') is illegal and scores 0.
    trap = Allocation(player_id="A", normal={"grand": {"void": 2}})
    res = resolve_profile(cfg, states, {ROW_PLAYER: trap, COL_PLAYER: _empty("B")}, 2)
    tr_grand = next(t for t in res.trial_results if t.trial_id == "grand")
    assert "A" in tr_grand.illegal_entries
    assert exp["trap"]["grand_entry_reason_contains"] in tr_grand.illegal_entries["A"]
    assert res.win_utility["A"] == exp["trap"]["row_win_value"] == 0
    assert res.margin_utility["A"] == exp["trap"]["row_margin_value"] == 0
    legal, _reason = legality.entry_is_legal(cfg, cfg.trial_map()["grand"], {"void": 2}, 2)
    assert legal is False

    # The illegal 'grand' entries are absent from the enumerated legal space.
    allocs = enumerate_allocations(cfg, states[ROW_PLAYER], player_count=2)
    got = sorted(normal_totals_by_trial(cfg, a, 2) for a in allocs)
    assert got == sorted(tuple(t) for t in exp["legal_allocation_totals"])

    # Independent brute force corroborates the oracle values.
    assert _brute_force_best_row(cfg, states, "row", "margin", opponent) == 4
    assert _brute_force_best_row(cfg, states, "row", "win", opponent) == 1


def test_planted_wild_legality():
    """BR-WILD-1: a Wild unit legally raises a Trial total on one Trial (decisive)
    and cannot legally raise it on another (dropped) - the oracle uses it correctly
    (REQ-7.3)."""
    fx, cfg, states = _planted_cfg_states("BR-WILD-1")
    exp = fx["expected"]
    b_allocs = enumerate_allocations(cfg, states[COL_PLAYER], player_count=2)
    b_on_purity = find_allocation_by_normal_totals(cfg, b_allocs, tuple(exp["opponent_totals"]), 2)
    assert b_on_purity is not None
    opponent = OpponentSpec.pure(b_on_purity)

    margin = best_response(cfg, states, "row", "margin", opponent, method="auto")
    win = best_response(cfg, states, "row", "win", opponent, method="auto")
    assert margin.value_row_payoff == exp["row_margin_best_value"] == 6
    assert win.value_row_payoff == exp["row_win_best_value"] == 1
    # The best response spends the Wild on 'purity' (raising its total to 2).
    assert margin.allocation.wild.get("purity", 0) == 1
    assert normal_totals_by_trial(cfg, margin.allocation, 2) == tuple(exp["best_response"]["totals"])

    # Wild DOES legally raise the total: 1 normal + 1 Wild = 2, beating B's 1.
    res = resolve_profile(cfg, states, {ROW_PLAYER: margin.allocation, COL_PLAYER: b_on_purity}, 2)
    tr_p = next(t for t in res.trial_results if t.trial_id == "purity")
    assert tr_p.total_power["A"] == exp["wild_raises_total"]["total_with_wild"] == 2
    assert tr_p.total_power["B"] == exp["wild_raises_total"]["opponent_total"] == 1

    # Without the Wild the same normal entry only ties (margin 0) - Wild is decisive.
    a_no_wild = Allocation(player_id="A", normal={"purity": {"void": 1}}, residue_wild=1)
    res0 = resolve_profile(cfg, states, {ROW_PLAYER: a_no_wild, COL_PLAYER: b_on_purity}, 2)
    assert res0.margin_utility["A"] == exp["wild_raises_total"]["without_wild_margin"] == 0

    # Wild does NOT legally raise the total on 'harmony' (illegal entry -> Wild dropped).
    a_harmony = Allocation(player_id="A", normal={"harmony": {"void": 1}}, wild={"harmony": 1})
    res_h = resolve_profile(cfg, states, {ROW_PLAYER: a_harmony, COL_PLAYER: b_on_purity}, 2)
    tr_h = next(t for t in res_h.trial_results if t.trial_id == "harmony")
    assert "A" in tr_h.illegal_entries
    assert exp["wild_does_not_raise_total"]["reason_contains"] in tr_h.illegal_entries["A"]
    assert res_h.dropped_wild_entries.get("A", {}).get("harmony") == 1

    assert _brute_force_best_row(cfg, states, "row", "margin", opponent) == 6
    assert _brute_force_best_row(cfg, states, "row", "win", opponent) == 1


def test_planted_shared_award_coupling():
    """BR-SHARED-1: a divided shared award couples the two sides' payoffs (a tied
    Trial banks half); the oracle accounts for the coupling (REQ-7.3)."""
    fx, cfg, states = _planted_cfg_states("BR-SHARED-1")
    exp = fx["expected"]
    b_allocs = enumerate_allocations(cfg, states[COL_PLAYER], player_count=2)
    b11 = find_allocation_by_normal_totals(cfg, b_allocs, tuple(exp["opponent_totals"]), 2)
    assert b11 is not None
    opponent = OpponentSpec.pure(b11)

    margin = best_response(cfg, states, "row", "margin", opponent, method="auto")
    win = best_response(cfg, states, "row", "win", opponent, method="auto")
    assert margin.value_row_payoff == exp["row_margin_best_value"] == 4
    assert win.value_row_payoff == exp["row_win_best_value"] == 1

    # The margin optimum banks 6 vs 2; one Trial is a divided shared first (2 each).
    res = resolve_profile(cfg, states, {ROW_PLAYER: margin.allocation, COL_PLAYER: b11}, 2)
    rec = {pid: r.recognition_points for pid, r in res.player_results.items()}
    assert rec["A"] == exp["margin_best_recognition"]["A"] == 6
    assert rec["B"] == exp["margin_best_recognition"]["B"] == 2
    tied = [
        t for t in res.trial_results
        if t.shared_first and t.rewards_awarded.get("A") == 2 and t.rewards_awarded.get("B") == 2
    ]
    assert tied, "expected a divided shared-first Trial banking the half-award (2) to each side"

    assert _brute_force_best_row(cfg, states, "row", "margin", opponent) == 4
    assert _brute_force_best_row(cfg, states, "row", "win", opponent) == 1


def test_planted_final_tiebreak_decision():
    """BR-FINALTIE-1: the game is a Recognition-Point tie decided only at the final
    Spellbook tiebreak (spell_count); the win oracle reflects it (REQ-7.3)."""
    fx, cfg, states = _planted_cfg_states("BR-FINALTIE-1")
    exp = fx["expected"]
    b_allocs = enumerate_allocations(cfg, states[COL_PLAYER], player_count=2)
    b_t1 = find_allocation_by_normal_totals(cfg, b_allocs, tuple(exp["opponent_totals"]), 2)
    assert b_t1 is not None
    opponent = OpponentSpec.pure(b_t1)

    win = best_response(cfg, states, "row", "win", opponent, method="auto")
    margin = best_response(cfg, states, "row", "margin", opponent, method="auto")
    assert win.value_row_payoff == exp["row_win_best_value"] == 1
    assert margin.value_row_payoff == exp["row_margin_best_value"] == 0
    # A coupled config: win via the expected-sign MILP, margin via exact exhaustive.
    assert win.evidence_class == NUMERICAL_MILP
    assert margin.evidence_class == EXACT_EXHAUSTIVE

    # The win is produced only by the final tiebreak on a 2-2 Recognition-Point tie.
    res = resolve_profile(cfg, states, {ROW_PLAYER: win.allocation, COL_PLAYER: b_t1}, 2)
    rec = {pid: r.recognition_points for pid, r in res.player_results.items()}
    fp = {pid: r.final_place for pid, r in res.player_results.items()}
    assert rec["A"] == rec["B"] == 2, "the game must be a Recognition-Point tie"
    assert fp["A"] == 1 and fp["B"] == 2, "A takes sole first via the final tiebreak"
    assert res.win_utility["A"] == exp["decided_by_final_tiebreak"]["win_utility"]["A"] == 1

    assert _brute_force_best_row(cfg, states, "row", "win", opponent) == 1
    assert _brute_force_best_row(cfg, states, "row", "margin", opponent) == 0


def test_planted_win_optimum_differs_from_margin_optimum():
    """BR-WINMARGIN-1: against a mixture, the win best response and the margin best
    response are DIFFERENT allocations, and each is strictly worse on the other
    objective (REQ-7.3, REQ-5)."""
    fx, cfg, states = _planted_cfg_states("BR-WINMARGIN-1")
    exp = fx["expected"]
    b_allocs = enumerate_allocations(cfg, states[COL_PLAYER], player_count=2)
    b11 = find_allocation_by_normal_totals(cfg, b_allocs, (1, 1), 2)
    assert b11 is not None
    opponent = OpponentSpec.mixture([(_empty("B"), Fraction(1, 2)), (b11, Fraction(1, 2))])

    win = best_response(cfg, states, "row", "win", opponent, method="auto")
    margin = best_response(cfg, states, "row", "margin", opponent, method="auto")

    win_totals = normal_totals_by_trial(cfg, win.allocation, 2)
    margin_totals = normal_totals_by_trial(cfg, margin.allocation, 2)
    assert win_totals == tuple(exp["win_best_totals"]) == (0, 2)
    assert margin_totals == tuple(exp["margin_best_totals"]) == (1, 1)
    assert win_totals != margin_totals  # the optima differ (REQ-7.3)

    assert win.value_row_payoff == exp["win_best_value"] == 1.0
    assert margin.value_row_payoff == float(Fraction(exp["margin_best_value"])) == 2.5

    # Each argmax is strictly worse on the OTHER objective (not interchangeable).
    def _expected_row(alloc, utility):
        total = Fraction(0)
        for opp_alloc, prob in opponent.support:
            res = resolve_profile(cfg, states, {ROW_PLAYER: alloc, COL_PLAYER: opp_alloc}, 2)
            u = res.win_utility if utility == "win" else res.margin_utility
            total += prob * int(u.get(ROW_PLAYER, 0))
        return total

    assert _expected_row(margin.allocation, "win") == Fraction(exp["cross_objective"]["margin_alloc_win_value"])
    assert _expected_row(margin.allocation, "win") < Fraction(win.value_row_payoff)
    assert _expected_row(win.allocation, "margin") == Fraction(exp["cross_objective"]["win_alloc_margin_value"])
    assert _expected_row(win.allocation, "margin") < Fraction(margin.value_row_payoff)


# --------------------------------------------------------------------------- #
# Part 3 - unequal-state (rectangular) best-response oracle (REQ-7.2)          #
# --------------------------------------------------------------------------- #


def _load_asym1():
    fx = json.loads((ADVERSARIAL / "asym1_unequal_budget.json").read_text(encoding="utf-8"))
    cfg = load_configuration(PACKAGE_ROOT / fx["config_ref"])
    sa = state_from_dict(fx["state_a"])
    sb = state_from_dict(fx["state_b"])
    return fx, cfg, {ROW_PLAYER: sa, COL_PLAYER: sb}


def test_asym1_unequal_state_best_response_oracle():
    """REQ-7.2: the committed unequal-state fixture ASYM-1 (A budget 2 vs B budget 1)
    gets explicit best-response-oracle checks whose expected values come from its
    hand-derived matrix, not from oracle output (REQ-9.4)."""
    fx, cfg, states = _load_asym1()
    matrix = fx["expected"]["matrix"]

    # Hand oracle read straight from the committed matrix cells.
    col_empty = [c for c in matrix if c["b"] == [0, 0]]
    row_a11 = [c for c in matrix if c["a"] == [1, 1]]
    assert max(c["margin"] for c in col_empty) == 4  # row A best margin vs empty B
    assert max(c["win"] for c in col_empty) == 1  # row A best win vs empty B
    assert min(c["margin"] for c in row_a11) == 2  # column B best (min row) vs A=(1,1)
    assert min(c["win"] for c in row_a11) == 1  # A=(1,1) wins every column

    # Row A best response against the empty column.
    row_margin = best_response(cfg, states, "row", "margin", OpponentSpec.pure(_empty("B")), method="auto")
    row_win = best_response(cfg, states, "row", "win", OpponentSpec.pure(_empty("B")), method="auto")
    assert row_margin.value_row_payoff == 4
    assert row_win.value_row_payoff == 1
    assert normal_totals_by_trial(cfg, row_margin.allocation, 2) == (1, 1)  # A=(1,1) banks 4

    # Column B best response against A=(1,1): B minimises the row payoff.
    a_allocs = enumerate_allocations(cfg, states[ROW_PLAYER], player_count=2)
    a11 = find_allocation_by_normal_totals(cfg, a_allocs, (1, 1), 2)
    assert a11 is not None
    col_margin = best_response(cfg, states, "column", "margin", OpponentSpec.pure(a11), method="auto")
    col_win = best_response(cfg, states, "column", "win", OpponentSpec.pure(a11), method="auto")
    assert col_margin.value_row_payoff == 2  # margin game value (B avoids the empty column)
    assert col_margin.value_side_payoff == -2  # own perspective, negated (REQ-6.1)
    assert col_win.value_row_payoff == 1  # A=(1,1) wins regardless -> win game value +1
    assert col_win.value_side_payoff == -1

    # Independent brute force corroborates the oracle values on the rectangular game.
    assert _brute_force_best_row(cfg, states, "row", "margin", OpponentSpec.pure(_empty("B"))) == 4
    assert _brute_force_best_row(cfg, states, "column", "margin", OpponentSpec.pure(a11)) == 2
    assert _brute_force_best_row(cfg, states, "column", "win", OpponentSpec.pure(a11)) == 1


# --------------------------------------------------------------------------- #
# Part 4 - planted-fixture provenance / oracle audit (REQ-7.4, REQ-9.4)        #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("fixture_id", sorted(PLANTED_FIXTURES))
def test_planted_fixture_carries_provenance_and_oracle(fixture_id):
    """REQ-7.4 / REQ-9.4: every planted best-response fixture carries a source
    citation, an evidence class from the shared vocabulary, an explicit
    independent-of-implementation assertion, a hand-verified expected block, and a
    provenance narrative asserting the no-reverse-engineering rule."""
    data = _load_planted(fixture_id)
    assert data.get("id") == fixture_id
    assert isinstance(data.get("name"), str) and data["name"].strip()

    oracle = data.get("oracle")
    assert isinstance(oracle, dict), f"{fixture_id}: missing oracle block"
    assert isinstance(oracle.get("source"), str) and oracle["source"].strip()
    assert oracle.get("evidence_class") in EVIDENCE_CLASSES
    assert oracle.get("independent_of_implementation") is True

    assert isinstance(data.get("provenance"), str) and "REQ-9.4" in data["provenance"]
    assert isinstance(data.get("config_ref"), str) and data["config_ref"]
    assert isinstance(data.get("expected"), dict) and data["expected"]


def test_planted_fixture_configs_exist_and_load():
    """Every planted fixture's referenced config resolves and loads (REQ-14)."""
    for fixture_id in PLANTED_FIXTURES:
        data = _load_planted(fixture_id)
        cfg = load_configuration(PACKAGE_ROOT / data["config_ref"])
        assert cfg.id
