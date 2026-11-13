"""Task 13 - deterministic CLI and VS1 reports (REQ-14, REQ-15, NFR-1).

Covers three things:

  1. CLI COMMANDS. ``validate-config`` on a committed config, ``run-fixture A16``,
     and ``report-fixtures --format json,md`` all run to a clean exit and write the
     expected JSON + Markdown artifacts; the VS2 ``analyse-small`` stub errors
     explicitly rather than pretending to work.
  2. DETERMINISM / BYTE-STABILITY. The report builders are pure and time-free, so
     repeated runs over the same input produce byte-identical JSON and Markdown;
     the ``report-fixtures`` command is byte-stable across two independent runs
     with a pinned code revision (NFR-1). No wall-clock timestamp is baked in.
  3. METADATA + EVIDENCE LABELLING (REQ-14.2/14.3/14.4). Every report's metadata
     records the REQ-14.2 fields including the scoring-reference version + content
     hash (q(S) provenance) and the Trials-power-profile version (F_C(S)
     provenance); the evidence-class table marks exactly the one class the report
     claims; the hard-gate table uses pass / fail / not_evaluated; the resolver
     audit hash is carried through.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from ascension_trials import cli, reports
from ascension_trials.reports import EVIDENCE_CLASSES, ReportContext

PKG = Path(__file__).resolve().parent.parent
CONFIGS = PKG / "configs"


# --------------------------------------------------------------------------- #
# Helpers                                                                      #
# --------------------------------------------------------------------------- #


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _a16_report(code_revision: str | None = None) -> dict:
    result = cli.run_fixture_result("A16")
    ctx = ReportContext(code_revision=code_revision)
    return reports.build_resolution_report(result, ctx, fixture_id="A16")


# --------------------------------------------------------------------------- #
# 1. CLI commands                                                              #
# --------------------------------------------------------------------------- #


def test_validate_config_command_on_committed_config(capsys):
    """validate-config on a committed config exits 0 and reports VALID."""
    exit_code = cli.main(["validate-config", str(CONFIGS / "hybrid_rebuild.json")])
    assert exit_code == 0
    out = capsys.readouterr().out
    assert "VALID" in out
    assert "INVALID" not in out


def test_validate_config_command_writes_report_when_out_given(tmp_path, capsys):
    exit_code = cli.main(
        [
            "validate-config",
            str(CONFIGS / "hybrid_rebuild.json"),
            "--format",
            "json,md",
            "--out",
            str(tmp_path),
        ]
    )
    assert exit_code == 0
    json_report = tmp_path / "validate_hybrid_rebuild.json"
    md_report = tmp_path / "validate_hybrid_rebuild.md"
    assert json_report.is_file() and md_report.is_file()
    data = json.loads(_read(json_report))
    assert data["report_type"] == "validation"
    assert data["validation"]["valid"] is True


def test_validate_config_command_rejects_invalid_config(tmp_path, capsys):
    """An invalid configuration exits 1 (REQ-1.4, NFR-4)."""
    bad = {"id": "bad", "version": "1.0", "power_formula": {"profile": "declarative"}}
    bad_path = tmp_path / "bad_config.json"
    bad_path.write_text(json.dumps(bad), encoding="utf-8")
    exit_code = cli.main(["validate-config", str(bad_path)])
    assert exit_code == 1
    assert "INVALID" in capsys.readouterr().out


def test_run_fixture_a16_command(tmp_path, capsys):
    """run-fixture A16 resolves the Maya worked example and writes JSON + Markdown."""
    exit_code = cli.main(["run-fixture", "A16", "--format", "json,md", "--out", str(tmp_path)])
    assert exit_code == 0

    json_report = tmp_path / "run_fixture_A16.json"
    md_report = tmp_path / "run_fixture_A16.md"
    assert json_report.is_file() and md_report.is_file()

    data = json.loads(_read(json_report))
    assert data["report_type"] == "resolution"
    assert data["fixture_id"] == "A16"
    assert data["validation"]["valid"] is True
    # A16 oracle: Maya banks 8 + 9 + 6 = 23 Recognition Points across her three Trials.
    assert data["exact_counts"]["recognition_points"]["maya"] == 23
    assert data["audit_hash"]

    md = _read(md_report)
    assert "# Ascension Trials — Resolution Report" in md
    assert "Fixture: **A16**" in md


def test_run_fixture_self_contained_a1(tmp_path):
    """run-fixture A1 resolves the self-contained mirror-tie fixture."""
    exit_code = cli.main(["run-fixture", "A1", "--format", "json", "--out", str(tmp_path)])
    assert exit_code == 0
    data = json.loads(_read(tmp_path / "run_fixture_A1.json"))
    # A1: two identical players share the Purity Trial (6 each), a final shared first.
    assert data["exact_counts"]["recognition_points"] == {"A": 6, "B": 6}
    assert data["ties"]["any_ties"] is True


def test_resolve_command_with_inline_config_fixture(tmp_path):
    """resolve --fixture on a fixture that embeds its own config emits a report."""
    fixture = PKG / "fixtures" / "adversarial" / "a1_mirror_tie.json"
    exit_code = cli.main(
        ["resolve", "--fixture", str(fixture), "--format", "json,md", "--out", str(tmp_path)]
    )
    assert exit_code == 0
    json_report = tmp_path / "resolve_A1.json"
    md_report = tmp_path / "resolve_A1.md"
    assert json_report.is_file() and md_report.is_file()
    data = json.loads(_read(json_report))
    assert data["report_type"] == "resolution"
    assert data["validation"]["valid"] is True
    assert data["exact_counts"]["recognition_points"] == {"A": 6, "B": 6}


def test_resolve_command_with_separate_config(tmp_path):
    """resolve --config <cfg> --fixture <profile> uses the external configuration."""
    # A profile carrying only states + allocations; the config is supplied separately.
    profile = {
        "id": "maya_profile",
        "player_count": 2,
        "states": {
            "A": {"player_id": "A", "normal_power": {"void": 6}, "wild_power": 0},
            "B": {"player_id": "B", "normal_power": {"void": 4}, "wild_power": 0},
        },
        "allocations": {
            "A": {"player_id": "A", "normal": {"energy_purity": {"void": 6}}, "wild": {}},
            "B": {"player_id": "B", "normal": {"energy_purity": {"void": 4}}, "wild": {}},
        },
    }
    profile_path = tmp_path / "profile.json"
    profile_path.write_text(json.dumps(profile), encoding="utf-8")
    exit_code = cli.main(
        [
            "resolve",
            "--config",
            str(CONFIGS / "hybrid_rebuild.json"),
            "--fixture",
            str(profile_path),
            "--format",
            "json",
            "--out",
            str(tmp_path),
        ]
    )
    assert exit_code == 0
    data = json.loads(_read(tmp_path / "resolve_maya_profile.json"))
    assert data["metadata"]["configuration"]["id"] == "hybrid_rebuild"
    assert data["validation"]["valid"] is True


def test_run_fixture_unknown_id_errors(capsys):
    exit_code = cli.main(["run-fixture", "A99"])
    assert exit_code == 2
    assert "unknown fixture id" in capsys.readouterr().err


def test_run_fixture_non_resolvable_errors(capsys):
    """A multi-case fixture (A10) is not resolvable as a single profile -> explicit error."""
    exit_code = cli.main(["run-fixture", "A10"])
    assert exit_code == 2
    assert "multi-case" in capsys.readouterr().err


def test_report_fixtures_command_json_and_md(tmp_path, capsys):
    """report-fixtures runs the VS1 fixtures and emits per-fixture + index reports."""
    exit_code = cli.main(["report-fixtures", "--format", "json,md", "--out", str(tmp_path)])
    assert exit_code == 0

    # An index (json + md) plus one report per resolvable fixture.
    assert (tmp_path / "report_fixtures_index.json").is_file()
    assert (tmp_path / "report_fixtures_index.md").is_file()
    for fixture_id in cli.RESOLVABLE_FIXTURES:
        assert (tmp_path / f"report_fixture_{fixture_id}.json").is_file()
        assert (tmp_path / f"report_fixture_{fixture_id}.md").is_file()

    index = json.loads(_read(tmp_path / "report_fixtures_index.json"))
    assert index["report_type"] == "fixture-index"
    # The index lists every committed VS1 fixture (all 10) with an evidence class.
    listed = {fx["id"] for fx in index["fixtures"]}
    assert listed == set(cli.FIXTURE_FILES)
    for fx in index["fixtures"]:
        assert fx["evidence_class"] in EVIDENCE_CLASSES


def test_analyse_small_requires_config_and_state(capsys):
    # analyse-small is the VS2 small-state exact-laboratory command (Task 23). With
    # no configuration/state it errors explicitly (exit 2) rather than doing nothing
    # silently (NFR-4). The command itself is exercised end-to-end by the VS2 suite
    # (test_vs2_reports / test_vs2_acceptance).
    exit_code = cli.main(["analyse-small"])
    assert exit_code == 2
    assert "--config and --state-a are required" in capsys.readouterr().err


# --------------------------------------------------------------------------- #
# 2. Determinism / byte-stability (NFR-1)                                      #
# --------------------------------------------------------------------------- #


def test_resolution_report_builder_is_byte_identical_across_runs():
    """Two independent resolutions + builds of the same fixture produce byte-identical
    JSON and Markdown (no wall-clock field is baked in)."""
    ctx = ReportContext(code_revision="rev-abc")
    r1 = cli.run_fixture_result("A16")
    r2 = cli.run_fixture_result("A16")
    rep1 = reports.build_resolution_report(r1, ctx, fixture_id="A16")
    rep2 = reports.build_resolution_report(r2, ctx, fixture_id="A16")
    assert reports.render_json(rep1) == reports.render_json(rep2)
    assert reports.render_markdown(rep1) == reports.render_markdown(rep2)


def test_default_report_has_no_wall_clock_field():
    """The default context bakes in no timestamp and a null code revision, which is
    what makes repeated runs byte-stable (NFR-1)."""
    report = _a16_report()
    md = report["metadata"]
    assert "generated_at" not in md
    assert md["code_revision"] is None


def test_injected_timestamp_appears_only_when_provided():
    ctx = ReportContext(generated_at="2026-07-10T00:00:00Z", code_revision="rev-1")
    report = reports.build_resolution_report(cli.run_fixture_result("A16"), ctx, fixture_id="A16")
    assert report["metadata"]["generated_at"] == "2026-07-10T00:00:00Z"
    assert report["metadata"]["code_revision"] == "rev-1"


def test_report_fixtures_cli_is_byte_stable_across_runs(tmp_path):
    """Running report-fixtures twice with a pinned revision yields byte-identical files."""
    out1 = tmp_path / "run1"
    out2 = tmp_path / "run2"
    args = ["report-fixtures", "--code-revision", "pinned-rev", "--format", "json,md"]
    assert cli.main(args + ["--out", str(out1)]) == 0
    assert cli.main(args + ["--out", str(out2)]) == 0

    files1 = sorted(p.name for p in out1.iterdir())
    files2 = sorted(p.name for p in out2.iterdir())
    assert files1 == files2 and files1, "both runs must emit the same non-empty file set"
    for name in files1:
        assert (out1 / name).read_bytes() == (out2 / name).read_bytes(), f"byte drift in {name}"


def test_json_uses_unix_newlines_and_sorted_keys():
    """Byte-stability relies on '\\n' newlines and sorted keys regardless of platform."""
    text = reports.render_json(_a16_report(code_revision="rev"))
    assert "\r\n" not in text
    # Top-level keys are emitted in sorted order.
    data = json.loads(text)
    assert list(data.keys()) == sorted(data.keys())


# --------------------------------------------------------------------------- #
# 3. Metadata + evidence labelling (REQ-14.2/14.3/14.4)                        #
# --------------------------------------------------------------------------- #


def test_metadata_records_all_req_14_2_fields():
    """Every REQ-14.2 metadata field is present, including q(S) and F_C(S) provenance."""
    md = _a16_report(code_revision="rev-xyz")["metadata"]

    assert md["configuration"] == {"id": "hybrid_rebuild", "version": "0.1"}
    assert md["player_count"] == 5
    assert md["state_ids"] == ["maya"]

    # q(S) provenance: scoring-reference version + content hash.
    assert md["scoring_reference"]["version"] == "v3.1"
    assert md["scoring_reference"]["content_hash"].startswith("sha256:")

    # F_C(S) provenance: the Trials-power-profile version (separately auditable).
    assert md["trials_power_profile"]["version"] == "hybrid_2n_minus_3@0.1-experimental"

    # provenance, method, solver (+ tolerances, n/a in VS1), seed, code revision.
    assert md["provenance"]["maya"]["type"]
    assert md["method"] == "deterministic-resolver"
    assert md["solver"] == {"name": None, "tolerances": None}
    assert md["seed"] is None
    assert md["code_revision"] == "rev-xyz"


def test_scoring_reference_and_profile_versions_are_distinct():
    """q(S) and F_C(S) provenance are recorded in separate fields (design §13.1)."""
    md = _a16_report()["metadata"]
    assert md["scoring_reference"]["version"] != md["trials_power_profile"]["version"]


def test_evidence_class_table_marks_exactly_one_applicable_class():
    report = _a16_report()
    table = report["evidence_class_table"]
    assert {row["evidence_class"] for row in table} == set(EVIDENCE_CLASSES)
    applied = [row["evidence_class"] for row in table if row["applies"]]
    assert applied == ["exact-given-profile"]
    assert report["evidence_class"] == "exact-given-profile"


def test_hard_gate_table_uses_pass_fail_not_evaluated(): 
    """REQ-14.4: the hard-gate table carries pass / fail / not_evaluated statuses."""
    report = _a16_report()
    gates = {g["gate"]: g["status"] for g in report["hard_gate_table"]}
    assert gates["configuration_valid"] == "pass"
    assert gates["power_ledger_conserved"] == "pass"
    # VS2 game-theoretic gates are explicitly not evaluated, never silently passed.
    assert gates["reasonable_set_R"] == "not_evaluated"
    assert gates["equilibrium_relevant_set_E_0_01"] == "not_evaluated"
    valid_statuses = {"pass", "fail", "not_evaluated"}
    assert all(status in valid_statuses for status in gates.values())


def test_report_carries_resolver_audit_hash():
    result = cli.run_fixture_result("A16")
    report = reports.build_resolution_report(result, ReportContext(), fixture_id="A16")
    assert report["audit_hash"] == result.deterministic_hash
    assert len(result.deterministic_hash) == 64  # SHA-256 hex


def test_vs2_sections_present_but_marked_not_evaluated():
    """Design §13.2 VS2-only sections are present but marked not evaluated for VS1."""
    report = _a16_report()
    for section in ("equilibrium", "dominance", "counterability"):
        assert report[section]["evaluated"] is False


def test_markdown_has_all_section_headers():
    """The Markdown report carries the design §13.2 sections in order."""
    md = reports.render_markdown(_a16_report(code_revision="rev"))
    for header in (
        "## 1. Metadata",
        "## 2. Validation",
        "## 3. Exact counts",
        "## 4. Equilibrium",
        "## 5. Dominance",
        "## 6. Counterability",
        "## 7. Ties",
        "## 8. Diagnostics",
        "## 9. Evidence class",
        "## 10. Assumptions and unresolved gates",
    ):
        assert header in md, f"missing section: {header}"
