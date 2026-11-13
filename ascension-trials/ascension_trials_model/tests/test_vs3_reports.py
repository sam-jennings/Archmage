"""VS3 Task 10 — reports and CLI for best-response + asymmetric analysis (REQ-13, REQ-14).

Covers the two new surfaces this task adds on top of the frozen VS1/VS2 reports:

  1. BEST-RESPONSE REPORT (design §9; REQ-13). ``reports.build_best_response_report``
     carries the VS2-style metadata block, the resolver-recomputed ``value_row_payoff``,
     the returned allocation, the opponent spec and the full certificate; the extended
     evidence-class table lists the three VS3 best-response classes (REQ-13.2) and marks
     exactly the oracle's class; the double-oracle-ready hard-gate table carries reserved
     ``not_evaluated`` rows for VS4 (REQ-13.4). JSON + Markdown are byte-stable (NFR-1).

  2. ASYMMETRIC SMALL-STATE REPORT + CLI. The asymmetric metrics (``counter_R`` /
     ``counter_E`` = ``None``) produce a coherent VS2 small-state report whose hard-gate
     table marks the equal-state counterability gates ``not_evaluated`` instead of
     crashing (REQ-3.3, REQ-13.4). The ``analyse-asymmetric`` and ``best-response`` CLI
     commands run end-to-end, are byte-stable, and refuse to emit an unproven result
     (REQ-6, NFR-4).

  3. VS1/VS2 REPORTS UNCHANGED. Extending the evidence-class vocabulary must not touch
     the VS1 resolution / VS2 small-state evidence-class tables (REQ-14.7).
"""

from __future__ import annotations

import json
from fractions import Fraction
from pathlib import Path

import pytest

from ascension_trials import cli, reports
from ascension_trials.best_response import (
    EXACT_DP,
    NUMERICAL_MILP,
    OpponentSpec,
    best_response,
)
from ascension_trials.config_loader import load_configuration
from ascension_trials.enumerate import enumerate_allocations, find_allocation_by_normal_totals
from ascension_trials.matrix import COL_PLAYER, ROW_PLAYER
from ascension_trials.metrics import compute_small_state_metrics
from ascension_trials.reports import (
    EVIDENCE_CLASSES,
    VS3_EVIDENCE_CLASSES,
    ReportContext,
)
from ascension_trials.schema import Allocation, PlayerState

from vs2_support import PACKAGE_ROOT, load_referenced_config, load_vs2_fixture

CONFIGS = PACKAGE_ROOT / "configs"
ASYM_CONFIG = CONFIGS / "toy" / "asym_two_trial.json"
ASYM_FIXTURE = PACKAGE_ROOT / "fixtures" / "adversarial" / "asym1_unequal_budget.json"


# --------------------------------------------------------------------------- #
# Helpers                                                                      #
# --------------------------------------------------------------------------- #


def _asym_states():
    """The committed ASYM-1 unequal-state setup: A power 2 (row) vs B power 1 (column)."""
    state_a = PlayerState(player_id="A", normal_power={"fungible": 2})
    state_b = PlayerState(player_id="B", normal_power={"fungible": 1})
    return load_configuration(ASYM_CONFIG), state_a, state_b


def _margin_best_response():
    """Row margin BR vs an empty opponent — the hand oracle value +4 (EXACT_DP)."""
    cfg, state_a, state_b = _asym_states()
    states = {ROW_PLAYER: state_a, COL_PLAYER: state_b}
    opponent = OpponentSpec.pure(Allocation(player_id=COL_PLAYER))
    return cfg, best_response(cfg, states, "row", "margin", opponent, method="auto")


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


# --------------------------------------------------------------------------- #
# 1. Best-response report structure, certificate, evidence class (REQ-13)      #
# --------------------------------------------------------------------------- #


def test_best_response_report_carries_certificate_and_evidence_class():
    cfg, br = _margin_best_response()
    report = reports.build_best_response_report(
        br, ReportContext(code_revision="rev1"),
        config_id=cfg.id, config_version=cfg.version,
        player_count=2, state_ids=["A", "B"],
    )
    assert report["report_type"] == "best-response"
    assert report["evidence_class"] == EXACT_DP
    body = report["best_response"]
    assert body["side"] == "row" and body["utility"] == "margin"
    assert body["value_row_payoff"] == 4.0
    assert body["value_side_payoff"] == 4.0
    # The full certificate is carried (REQ-6.3).
    cert = body["certificate"]
    assert cert["method"] == "exact_dp"
    assert cert["optimal"] is True
    assert cert["resolver_incumbent_value"] == 4.0
    assert cert["solver_objective_bound"] == 4.0
    assert cert["absolute_optimality_gap"] == 0.0
    # The returned allocation and opponent are serialized.
    assert body["allocation"]["normal"] == {"trial_a": {"fungible": 1}, "trial_b": {"fungible": 1}}
    assert body["opponent"]["is_pure"] is True


def test_best_response_evidence_class_table_extends_prior_set():
    """REQ-13.2: the table lists the three VS3 classes alongside the prior set, and
    marks exactly the oracle's class."""
    cfg, br = _margin_best_response()
    report = reports.build_best_response_report(
        br, config_id=cfg.id, config_version=cfg.version, player_count=2, state_ids=["A", "B"],
    )
    table = report["evidence_class_table"]
    assert [row["evidence_class"] for row in table] == list(VS3_EVIDENCE_CLASSES)
    applied = [row["evidence_class"] for row in table if row["applies"]]
    assert applied == [EXACT_DP]
    # The three VS3 best-response classes are present.
    listed = {row["evidence_class"] for row in table}
    assert {
        "exact_exhaustive_best_response",
        "exact_dp_best_response",
        "numerical_milp_best_response_certified",
    } <= listed


def test_best_response_hard_gate_table_is_double_oracle_ready():
    """REQ-13.4: the hard-gate table carries pass/fail rows for the best response and
    reserved not_evaluated rows for the VS4 double oracle."""
    cfg, br = _margin_best_response()
    report = reports.build_best_response_report(
        br, config_id=cfg.id, config_version=cfg.version, player_count=2, state_ids=["A", "B"],
    )
    gates = {g["gate"]: g["status"] for g in report["hard_gate_table"]}
    assert gates["best_response_resolver_validated"] == "pass"
    assert gates["best_response_optimality_certified"] == "pass"
    assert gates["double_oracle_converged"] == "not_evaluated"
    assert gates["certified_exploitability_bracket"] == "not_evaluated"
    assert set(gates.values()) <= {"pass", "fail", "not_evaluated"}


def test_best_response_report_metadata_block_preserved():
    """REQ-13.1: the VS2-style metadata block (config id/version, player count, state
    ids, solver + tolerances, code revision) is present and time-free."""
    cfg, br = _margin_best_response()
    report = reports.build_best_response_report(
        br, ReportContext(code_revision="rev-md"),
        config_id=cfg.id, config_version=cfg.version, player_count=2, state_ids=["B", "A"],
    )
    md = report["metadata"]
    assert md["configuration"] == {"id": "asym_two_trial", "version": "1.0"}
    assert md["player_count"] == 2
    assert md["state_ids"] == ["A", "B"]  # sorted
    assert md["solver"]["name"] == "exact_dp"
    assert md["solver"]["tolerances"]["absolute"] == pytest.approx(1e-9)
    assert md["code_revision"] == "rev-md"
    assert "generated_at" not in md  # no wall-clock field (NFR-1)


def test_best_response_report_is_byte_stable():
    cfg, br = _margin_best_response()
    ctx = ReportContext(code_revision="rev1")
    r1 = reports.build_best_response_report(
        br, ctx, config_id=cfg.id, config_version=cfg.version, player_count=2, state_ids=["A", "B"],
    )
    r2 = reports.build_best_response_report(
        br, ctx, config_id=cfg.id, config_version=cfg.version, player_count=2, state_ids=["A", "B"],
    )
    assert reports.render_json(r1) == reports.render_json(r2)
    assert reports.render_markdown(r1) == reports.render_markdown(r2)
    md = reports.render_markdown(r1)
    assert "# Ascension Trials — VS3 Best-Response Report" in md
    assert "## 3. Certificate" in md


def test_no_numerical_result_labelled_exact():
    """REQ-13.3: a MILP-found win best response is labelled numerical, never exact."""
    cfg, state_a, state_b = _asym_states()
    states = {ROW_PLAYER: state_a, COL_PLAYER: state_b}
    opponent = OpponentSpec.pure(Allocation(player_id=COL_PLAYER))
    br = best_response(cfg, states, "row", "win", opponent, method="auto")
    assert br.evidence_class == NUMERICAL_MILP
    report = reports.build_best_response_report(
        br, config_id=cfg.id, config_version=cfg.version, player_count=2, state_ids=["A", "B"],
    )
    assert report["evidence_class"] == NUMERICAL_MILP
    assert "exact" not in report["best_response"]["evidence_class"]


# --------------------------------------------------------------------------- #
# 2. Asymmetric small-state report + hard gates (REQ-3.3, REQ-13.4)            #
# --------------------------------------------------------------------------- #


def _asym_metrics():
    cfg, state_a, state_b = _asym_states()
    return cfg, compute_small_state_metrics(cfg, state_a, state_b, player_count=2)


def test_asymmetric_report_renders_with_not_applicable_counterability():
    cfg, metrics = _asym_metrics()
    assert metrics.parity is False
    report = reports.build_small_state_report(
        metrics, ReportContext(code_revision="rev"),
        config_version=cfg.version, state_ids=["A", "B"],
    )
    # The asymmetric counterability payload is not_applicable (REQ-3.3).
    assert report["counterability"]["c1_over_R"] == "not_applicable"
    # Both JSON and Markdown render without crashing and are byte-stable.
    assert reports.render_json(report) == reports.render_json(report)
    md = reports.render_markdown(report)
    assert reports.render_markdown(report) == md
    assert "# Ascension Trials — VS2 Small-State Report" in md


def test_asymmetric_hard_gate_table_marks_counterability_not_evaluated():
    """The counterability gates are not_evaluated (not a crash), while the LP /
    equilibrium / tie-discipline gates stay evaluated (REQ-3.3, REQ-13.4)."""
    cfg, metrics = _asym_metrics()
    gates = {g["gate"]: g["status"] for g in reports.vs2_hard_gates(metrics)}
    assert gates["equal_state_counterability_R"] == "not_evaluated"
    assert gates["equal_state_counterability_E_0_01"] == "not_evaluated"
    assert gates["counter_quality_G5_over_E_0_01"] == "not_evaluated"
    # LP convergence and equilibrium validity remain real pass/fail gates.
    assert gates["zero_sum_lp_converged"] == "pass"
    assert gates["canonical_equilibrium_valid"] == "pass"
    assert "tie_discipline_final_shared_G7" in gates


def test_asymmetric_gate_table_row_order_matches_parity():
    """The asymmetric gate table keeps the same gate sequence as the parity table."""
    cfg, metrics = _asym_metrics()
    asym_gates = [g["gate"] for g in reports.vs2_hard_gates(metrics)]

    fx = load_vs2_fixture("A4")
    pcfg = load_referenced_config(fx)
    st = fx["state"]
    pstate = PlayerState(player_id=st["player_id"], normal_power=dict(st["normal_power"]))
    parity_metrics = compute_small_state_metrics(pcfg, pstate, player_count=2)
    parity_gates = [g["gate"] for g in reports.vs2_hard_gates(parity_metrics)]

    assert asym_gates == parity_gates


# --------------------------------------------------------------------------- #
# 3. VS1 / VS2 evidence-class tables unchanged (REQ-14.7)                       #
# --------------------------------------------------------------------------- #


def test_vs1_evidence_table_vocabulary_unchanged():
    table = reports.evidence_class_table("exact-given-profile")
    assert [row["evidence_class"] for row in table] == list(EVIDENCE_CLASSES)
    # None of the VS3 best-response classes leak into the VS1 table.
    assert not any("best_response" in row["evidence_class"] for row in table)


def test_vs2_evidence_table_vocabulary_unchanged():
    table = reports.vs2_evidence_class_table()
    assert [row["evidence_class"] for row in table] == list(EVIDENCE_CLASSES)


# --------------------------------------------------------------------------- #
# 4. CLI: best-response command (design §9)                                    #
# --------------------------------------------------------------------------- #


def _write_states(tmp_path: Path):
    (tmp_path / "state_a.json").write_text(
        json.dumps({"player_id": "A", "normal_power": {"fungible": 2}}), encoding="utf-8"
    )
    (tmp_path / "state_b.json").write_text(
        json.dumps({"player_id": "B", "normal_power": {"fungible": 1}}), encoding="utf-8"
    )
    return tmp_path / "state_a.json", tmp_path / "state_b.json"


def _write_opponent(tmp_path: Path, spec: dict, name="opp.json") -> Path:
    path = tmp_path / name
    path.write_text(json.dumps(spec), encoding="utf-8")
    return path


def test_cli_best_response_margin_writes_report(tmp_path):
    sa, sb = _write_states(tmp_path)
    opp = _write_opponent(tmp_path, {"type": "pure", "normal_totals": [0, 0]})
    out = tmp_path / "out"
    exit_code = cli.main([
        "best-response", "--config", str(ASYM_CONFIG),
        "--state-a", str(sa), "--state-b", str(sb),
        "--side", "row", "--utility", "margin",
        "--opponent", str(opp), "--out", str(out),
    ])
    assert exit_code == 0
    json_report = out / "best_response_asym_two_trial_row_margin.json"
    md_report = out / "best_response_asym_two_trial_row_margin.md"
    assert json_report.is_file() and md_report.is_file()
    data = json.loads(_read(json_report))
    assert data["report_type"] == "best-response"
    assert data["evidence_class"] == EXACT_DP
    assert data["best_response"]["value_row_payoff"] == 4.0


def test_cli_best_response_mixture_opponent(tmp_path):
    """A mixture opponent spec is accepted and normalised (design §4)."""
    sa, sb = _write_states(tmp_path)
    opp = _write_opponent(tmp_path, {
        "type": "mixture",
        "support": [
            {"normal_totals": [1, 0], "probability": "1/2"},
            {"normal_totals": [0, 1], "probability": "1/2"},
        ],
    })
    out = tmp_path / "out"
    exit_code = cli.main([
        "best-response", "--config", str(ASYM_CONFIG),
        "--state-a", str(sa), "--state-b", str(sb),
        "--side", "row", "--utility", "margin",
        "--opponent", str(opp), "--out", str(out),
    ])
    assert exit_code == 0
    data = json.loads(_read(out / "best_response_asym_two_trial_row_margin.json"))
    support = data["best_response"]["opponent"]["support"]
    assert len(support) == 2
    assert data["best_response"]["opponent"]["is_pure"] is False


def test_cli_best_response_is_byte_stable_across_runs(tmp_path):
    sa, sb = _write_states(tmp_path)
    opp = _write_opponent(tmp_path, {"type": "pure", "normal_totals": [0, 0]})
    args = [
        "best-response", "--config", str(ASYM_CONFIG),
        "--state-a", str(sa), "--state-b", str(sb),
        "--side", "row", "--utility", "margin", "--opponent", str(opp),
        "--code-revision", "pinned",
    ]
    out1, out2 = tmp_path / "r1", tmp_path / "r2"
    assert cli.main(args + ["--out", str(out1)]) == 0
    assert cli.main(args + ["--out", str(out2)]) == 0
    names = sorted(p.name for p in out1.iterdir())
    assert names and names == sorted(p.name for p in out2.iterdir())
    for name in names:
        assert (out1 / name).read_bytes() == (out2 / name).read_bytes(), f"byte drift in {name}"


def test_cli_best_response_column_side(tmp_path):
    """A column best response minimises the row payoff; the report records side=column."""
    sa, sb = _write_states(tmp_path)
    # Column BR: opponent is the ROW player (A). Empty A allocation.
    opp = _write_opponent(tmp_path, {"type": "pure", "normal_totals": [0, 0]})
    out = tmp_path / "out"
    exit_code = cli.main([
        "best-response", "--config", str(ASYM_CONFIG),
        "--state-a", str(sa), "--state-b", str(sb),
        "--side", "column", "--utility", "margin",
        "--opponent", str(opp), "--out", str(out),
    ])
    assert exit_code == 0
    data = json.loads(_read(out / "best_response_asym_two_trial_column_margin.json"))
    assert data["best_response"]["side"] == "column"


def test_cli_best_response_invalid_opponent_errors(tmp_path, capsys):
    sa, sb = _write_states(tmp_path)
    opp = _write_opponent(tmp_path, {"type": "pure", "normal_totals": [9, 9]})
    out = tmp_path / "out"
    exit_code = cli.main([
        "best-response", "--config", str(ASYM_CONFIG),
        "--state-a", str(sa), "--state-b", str(sb),
        "--side", "row", "--utility", "margin",
        "--opponent", str(opp), "--out", str(out),
    ])
    assert exit_code == 2
    assert "invalid opponent spec" in capsys.readouterr().err
    assert not out.exists() or not any(out.iterdir())


def test_cli_best_response_unproven_result_exits_nonzero(tmp_path, capsys):
    """A coupled state whose legal space exceeds a tiny ceiling cannot be certified;
    the CLI exits non-zero, prints to stderr and writes no report (REQ-6, NFR-4)."""
    coupled = tmp_path / "coupled.json"
    coupled.write_text(json.dumps({
        "id": "coupled_demo", "version": "1.0", "supported_player_counts": [2],
        "declared_tiebreak_stats": ["spell_count"],
        "power_formula": {"profile": "declarative",
                           "standard_spell_power": {"type": "linear", "expression": "n"}},
        "domains": [{"id": "fungible", "class": "fungible"}],
        "trials": [
            {"id": "trial_1", "active_player_counts": [2],
             "eligibility": {"allowed_domain_classes": ["fungible"],
                             "source_count": {"universe": "class:fungible", "minimum": 1}},
             "entry_floor": {"value": 0, "scope": "normal"},
             "tie_award": {"type": "shared_full"},
             "trial_tiebreaks": ["total_power", "shared"],
             "rewards": {"by_player_count": {"2": {"first": 2, "second": 0}}}},
            {"id": "trial_2", "active_player_counts": [2],
             "eligibility": {"allowed_domain_classes": ["fungible"],
                             "source_count": {"universe": "class:fungible", "minimum": 1}},
             "entry_floor": {"value": 0, "scope": "normal"},
             "tie_award": {"type": "shared_full"},
             "trial_tiebreaks": ["total_power", "shared"],
             "rewards": {"by_player_count": {"2": {"first": 2, "second": 0}}}},
        ],
        "allocation": {"completion": "optional", "residue_allowed": True,
                       "infeasible_full_fallback": "reject"},
        "final_result": {"final_tiebreaks": ["spell_count", "shared"]},
    }), encoding="utf-8")
    sa, sb = _write_states(tmp_path)
    opp = _write_opponent(tmp_path, {"type": "pure", "normal_totals": [0, 0]})
    out = tmp_path / "out"
    exit_code = cli.main([
        "best-response", "--config", str(coupled),
        "--state-a", str(sa), "--state-b", str(sb),
        "--side", "row", "--utility", "margin",
        "--opponent", str(opp), "--method", "exhaustive",
        "--max-allocations", "1", "--out", str(out),
    ])
    assert exit_code == 1
    assert "no proven result" in capsys.readouterr().err
    assert not out.exists() or not any(out.iterdir())


def test_cli_best_response_requires_config_state_opponent(capsys):
    exit_code = cli.main(["best-response"])
    assert exit_code == 2
    assert "required" in capsys.readouterr().err


# --------------------------------------------------------------------------- #
# 5. CLI: analyse-asymmetric command (design §9)                               #
# --------------------------------------------------------------------------- #


def test_cli_analyse_asymmetric_writes_report(tmp_path):
    sa, sb = _write_states(tmp_path)
    out = tmp_path / "out"
    exit_code = cli.main([
        "analyse-asymmetric", "--config", str(ASYM_CONFIG),
        "--state-a", str(sa), "--state-b", str(sb), "--out", str(out),
    ])
    assert exit_code == 0
    json_report = out / "analyse_asymmetric_asym_two_trial.json"
    md_report = out / "analyse_asymmetric_asym_two_trial.md"
    assert json_report.is_file() and md_report.is_file()
    data = json.loads(_read(json_report))
    assert data["report_type"] == "small-state"
    # Per-side counts and not_applicable counterability confirm the asymmetric path.
    assert data["counts"]["collapsed_classes"] == {"A": 6, "B": 3}
    assert data["counterability"]["c1_over_R"] == "not_applicable"
    gates = {g["gate"]: g["status"] for g in data["hard_gate_table"]}
    assert gates["equal_state_counterability_R"] == "not_evaluated"


def test_cli_analyse_asymmetric_is_byte_stable_across_runs(tmp_path):
    sa, sb = _write_states(tmp_path)
    args = [
        "analyse-asymmetric", "--config", str(ASYM_CONFIG),
        "--state-a", str(sa), "--state-b", str(sb), "--code-revision", "pinned",
    ]
    out1, out2 = tmp_path / "r1", tmp_path / "r2"
    assert cli.main(args + ["--out", str(out1)]) == 0
    assert cli.main(args + ["--out", str(out2)]) == 0
    names = sorted(p.name for p in out1.iterdir())
    assert names and names == sorted(p.name for p in out2.iterdir())
    for name in names:
        assert (out1 / name).read_bytes() == (out2 / name).read_bytes(), f"byte drift in {name}"


def test_cli_analyse_asymmetric_requires_both_states(tmp_path, capsys):
    sa, _sb = _write_states(tmp_path)
    exit_code = cli.main([
        "analyse-asymmetric", "--config", str(ASYM_CONFIG), "--state-a", str(sa),
    ])
    assert exit_code == 2
    assert "required" in capsys.readouterr().err
