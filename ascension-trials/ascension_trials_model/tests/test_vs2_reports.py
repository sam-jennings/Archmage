"""Task 23 - VS2 metrics and reports (REQ-11..REQ-14; impl spec §16, §17).

Verifies the small-state metrics payload and the deterministic JSON / Markdown
report: the REQ-14.2 metadata block, preserved evidence-class labels
(numerical_lp / numerical_convex), the VS2 hard-gate table, and byte stability.
"""

from __future__ import annotations

import pytest

from ascension_trials import reports
from ascension_trials.metrics import compute_small_state_metrics
from ascension_trials.reports import ReportContext
from ascension_trials.schema import PlayerState

from vs2_support import load_referenced_config, load_vs2_fixture


def _metrics(fixture_id="A4"):
    fx = load_vs2_fixture(fixture_id)
    cfg = load_referenced_config(fx)
    st = fx["state"]
    state = PlayerState(
        player_id=st["player_id"],
        normal_power=dict(st["normal_power"]),
        wild_power=st.get("wild_power", 0),
    )
    metrics = compute_small_state_metrics(cfg, state, player_count=2)
    return fx, cfg, state, metrics


# --------------------------------------------------------------------------- #
# Metrics payload (impl spec §16)                                              #
# --------------------------------------------------------------------------- #


def test_metrics_payload_reports_all_required_sections():
    fx, cfg, state, metrics = _metrics("A4")
    payload = metrics.to_dict()
    for section in ("counts", "equilibrium", "ties", "counterability", "diagnostics"):
        assert section in payload
    counts = payload["counts"]
    assert counts["legal_allocations"] == {"A": 84, "B": 84}
    assert counts["collapsed_classes"] == 84
    assert counts["reasonable_set_R"] == 84
    assert counts["equilibrium_relevant_E_0_01"] == 15
    # Exact tie rate is reported as a reduced fraction string.
    assert payload["ties"]["final_tie_rate"] == "1/84"


def test_metrics_preserve_evidence_labels():
    fx, cfg, state, metrics = _metrics("A4")
    payload = metrics.to_dict()
    assert payload["equilibrium"]["win"]["evidence_class"] == "numerical LP"
    assert payload["equilibrium"]["margin"]["evidence_class"] == "numerical LP"
    assert payload["equilibrium"]["canonical_maximum_entropy"]["evidence_class"] == "numerical convex"
    assert payload["counts"]["evidence_class"] == "exact exhaustive"


# --------------------------------------------------------------------------- #
# Report structure and byte-stability (REQ-14, NFR-1)                          #
# --------------------------------------------------------------------------- #


def test_small_state_report_has_metadata_and_evidence_labels():
    fx, cfg, state, metrics = _metrics("A4")
    report = reports.build_small_state_report(
        metrics, ReportContext(code_revision="deadbeef"),
        config_version=cfg.version, state_ids=[state.player_id],
    )
    assert report["report_type"] == "small-state"
    md = report["metadata"]
    assert md["configuration"] == {"id": "cycle_5_4_3", "version": "1.0"}
    assert md["player_count"] == 2
    assert md["state_ids"] == ["A"]
    assert "highs" in md["solver"]["lp"].lower()
    assert md["solver"]["lp_tolerance"] == 1e-9
    assert md["code_revision"] == "deadbeef"

    # The three genuinely-applicable VS2 evidence classes are flagged.
    applies = {row["evidence_class"] for row in report["evidence_class_table"] if row["applies"]}
    assert applies == {"exact exhaustive", "numerical LP", "numerical convex"}

    # Hard-gate table: real pass/fail gates only (audit D3). The set-SIZE rows that
    # could never fail are gone; A4 passes the counterability (G4) and counter-
    # quality (G5) gates over R and E^0.01.
    gates = {g["gate"]: g["status"] for g in report["hard_gate_table"]}
    assert gates["zero_sum_lp_converged"] == "pass"
    assert gates["canonical_equilibrium_valid"] == "pass"
    assert gates["equal_state_counterability_R"] == "pass"
    assert gates["equal_state_counterability_E_0_01"] == "pass"
    assert gates["counter_quality_G5_over_E_0_01"] == "pass"
    # The unconditional set-size PASS rows have been removed (audit B3/D3); the
    # sizes remain as diagnostic counts in the report body, not as gates.
    assert "reasonable_set_R" not in gates
    assert "equilibrium_relevant_set_E_0_01" not in gates
    # The equilibrium-weighted tie gates (G7) are present and evaluated.
    assert "tie_discipline_final_shared_G7" in gates
    assert "tie_discipline_final_chain_decided_G7" in gates
    assert "tie_discipline_per_trial_shared_G7" in gates


def test_small_state_report_is_byte_stable():
    fx, cfg, state, metrics = _metrics("A4")
    ctx = ReportContext(code_revision="rev1")
    r1 = reports.build_small_state_report(
        metrics, ctx, config_version=cfg.version, state_ids=[state.player_id]
    )
    r2 = reports.build_small_state_report(
        metrics, ctx, config_version=cfg.version, state_ids=[state.player_id]
    )
    assert reports.render_json(r1) == reports.render_json(r2)
    assert reports.render_markdown(r1) == reports.render_markdown(r2)
    # JSON is valid and Markdown carries the standard sections.
    md = reports.render_markdown(r1)
    assert "# Ascension Trials — VS2 Small-State Report" in md
    assert "## 2. Exact counts" in md
    assert "## 3. Equilibrium" in md


def test_report_renders_default_context_without_timestamp():
    fx, cfg, state, metrics = _metrics("A4")
    report = reports.build_small_state_report(
        metrics, config_version=cfg.version, state_ids=[state.player_id]
    )
    # No wall-clock field is emitted with the default context (NFR-1 determinism).
    assert "generated_at" not in report["metadata"]


# --------------------------------------------------------------------------- #
# VS2-C D3 - real hard gates can fail (A3 counterability; A5 tie discipline)    #
# --------------------------------------------------------------------------- #


def test_a3_report_fails_counterability_gate():
    """Audit D3: A3's report shows a FAILED equal-state counterability gate, with
    the turtle (4,0) named unbeaten in the gate detail."""
    fx, cfg, state, metrics = _metrics("A3")
    report = reports.build_small_state_report(
        metrics, config_version=cfg.version, state_ids=[state.player_id]
    )
    gates = {g["gate"]: g for g in report["hard_gate_table"]}
    assert gates["equal_state_counterability_R"]["status"] == "fail"
    assert gates["equal_state_counterability_E_0_01"]["status"] == "fail"
    assert "[4, 0]" in gates["equal_state_counterability_R"]["detail"]
    # The Markdown renders the failed gate and the unbeaten strategy.
    md = reports.render_markdown(report)
    assert "equal_state_counterability_R: fail" in md


def test_a5_report_fails_tie_gate():
    """Audit D3: A5's report fails a tie-discipline gate (every pair is a final
    tie, so the equilibrium-weighted shared-winner probability is 1)."""
    fx, cfg, state, metrics = _metrics("A5")
    report = reports.build_small_state_report(
        metrics, config_version=cfg.version, state_ids=[state.player_id]
    )
    gates = {g["gate"]: g for g in report["hard_gate_table"]}
    assert gates["tie_discipline_final_shared_G7"]["status"] == "fail"
    assert metrics.final_tie_rate_eq_weighted == pytest.approx(1.0, abs=1e-6)
