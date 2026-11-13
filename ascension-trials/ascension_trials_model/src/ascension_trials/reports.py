"""Deterministic VS1 report formatting (design §13.1 JSON, §13.2 Markdown; REQ-14).

This module is the report *formatting* layer only: it turns an already-computed
:class:`~ascension_trials.resolver.ResolutionResult` (or a validation / fixture
summary) into a machine-readable JSON document and a human-readable Markdown
document. It never resolves games or derives power — that is the resolver's job
(design §2 layering rule: "reports.py formats results; it does not calculate them").

Determinism / byte-stability (NFR-1, REQ-14).
    * No wall-clock time is ever read here. A ``generated_at`` timestamp is written
      only when one is explicitly injected through :class:`ReportContext`, so two
      runs over the same inputs with the same context produce byte-identical output.
    * ``code_revision`` and ``seed`` are likewise injectable, never auto-filled with
      environment-dependent values inside this module.
    * JSON is emitted with ``sort_keys=True`` and a fixed indent, and every Markdown
      section iterates its data in sorted order, so output never depends on Python
      dict / hash iteration order.

Every report's ``metadata`` block records the REQ-14.2 fields: configuration id +
version, player count, state ids, the scoring-reference version + content hash
(provenance of q(S)), the Trials-power-profile version (provenance of F_C(S)),
per-state provenance, method, solver + tolerances (VS1: n/a), seed and code
revision. Reports also carry the resolver audit hash, an evidence-class table
(REQ-14.3) and a hard-gate table with pass / fail / not-evaluated (REQ-14.4).
VS2-only sections (equilibrium, dominance, counterability) are present but marked
"not evaluated" for VS1.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any, Optional

from . import __version__

# Report schema version. Bump when the JSON report structure changes (design §13.1).
SCHEMA_VERSION = "1.0"

# REQ-14.3 evidence-class vocabulary (order fixed for deterministic tables).
EVIDENCE_CLASSES: tuple[str, ...] = (
    "theorem",
    "exact exhaustive",
    "exact-given-profile",
    "numerical LP",
    "numerical convex",
    "sampled",
    "design judgement",
)

# VS3 best-response evidence classes (REQ-13.2). Kept in a SEPARATE, extended
# vocabulary rather than appended to :data:`EVIDENCE_CLASSES` so the VS1 resolution
# and VS2 small-state evidence-class tables stay byte-identical (REQ-14.7); only the
# VS3 best-response report uses the extended table.
BEST_RESPONSE_EVIDENCE_CLASSES: tuple[str, ...] = (
    "exact_exhaustive_best_response",
    "exact_dp_best_response",
    "numerical_milp_best_response_certified",
)
VS3_EVIDENCE_CLASSES: tuple[str, ...] = EVIDENCE_CLASSES + BEST_RESPONSE_EVIDENCE_CLASSES

# Hard-gate statuses (REQ-14.4).
GATE_PASS = "pass"
GATE_FAIL = "fail"
GATE_NOT_EVALUATED = "not_evaluated"

_VS2_NOT_AVAILABLE = "VS2 not yet available (out of scope for this VS1 report)"


@dataclass(frozen=True)
class ReportContext:
    """Injectable, fully deterministic report context (NFR-1).

    Nothing here is read from the environment automatically. Callers that want a
    ``generated_at`` timestamp or a ``code_revision`` in the output must pass them
    in explicitly, which is what keeps repeated runs byte-identical: with the
    default context no time-varying field is emitted at all.
    """

    code_revision: Optional[str] = None
    generated_at: Optional[str] = None  # injected only; never auto-filled from the clock
    seed: Optional[int] = None
    evidence_class: str = "exact-given-profile"
    tool_version: str = __version__
    method: str = "deterministic-resolver"


# --------------------------------------------------------------------------- #
# Small deterministic helpers                                                  #
# --------------------------------------------------------------------------- #


def _one_or_list(values: set[str] | list[str]) -> Optional[str] | list[str]:
    """Collapse a set of provenance values to a single scalar, a sorted list, or None.

    Most reports carry a single scoring version / profile version across all
    states, so the common case returns a bare string; heterogeneous inputs return
    a sorted list so the field is still deterministic.
    """
    ordered = sorted(v for v in values if v is not None)
    if not ordered:
        return None
    if len(ordered) == 1:
        return ordered[0]
    return ordered


def _fmt(value: Any) -> str:
    """Render a scalar/list metadata value for Markdown, deterministically."""
    if value is None:
        return "n/a"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (list, tuple)):
        return ", ".join(str(v) for v in value) if value else "none"
    return str(value)


# --------------------------------------------------------------------------- #
# Metadata (REQ-14.2)                                                          #
# --------------------------------------------------------------------------- #


def _states_provenance(normalized_states: dict[str, dict]) -> dict[str, Any]:
    """Pull the REQ-14.2 provenance fields out of the resolver's normalized states.

    ``normalized_states`` (design §7.1) already carries, per player, the q(S)
    provenance (``independent_score.scoring_version`` + ``content_hash``), the
    F_C(S) provenance (``power_profile_version``) and the state provenance block —
    so metadata can be assembled from the ResolutionResult alone.
    """
    state_ids = sorted(normalized_states)
    scoring_versions: set[str] = set()
    content_hashes: set[str] = set()
    profile_versions: set[str] = set()
    provenance: dict[str, dict] = {}
    for pid in state_ids:
        s = normalized_states[pid]
        score = s.get("independent_score") or {}
        if score.get("scoring_version"):
            scoring_versions.add(score["scoring_version"])
        if score.get("content_hash"):
            content_hashes.add(score["content_hash"])
        if s.get("power_profile_version"):
            profile_versions.add(s["power_profile_version"])
        provenance[pid] = dict(s.get("provenance") or {})
    return {
        "state_ids": state_ids,
        "scoring_reference": {
            "version": _one_or_list(scoring_versions),
            "content_hash": _one_or_list(content_hashes),
        },
        "trials_power_profile": {"version": _one_or_list(profile_versions)},
        "provenance": provenance,
    }


def _base_metadata(context: ReportContext) -> dict[str, Any]:
    md: dict[str, Any] = {
        "schema_version": SCHEMA_VERSION,
        "tool_version": context.tool_version,
        "method": context.method,
        # VS1 uses no numerical solver; recorded explicitly rather than omitted
        # so the field is present for auditing (REQ-14.2).
        "solver": {"name": None, "tolerances": None},
        "seed": context.seed,
        "code_revision": context.code_revision,
    }
    if context.generated_at is not None:
        # Included only when explicitly injected, so the default report carries no
        # time-varying field and stays byte-stable across runs (NFR-1).
        md["generated_at"] = context.generated_at
    return md


def _resolution_metadata(result: Any, context: ReportContext) -> dict[str, Any]:
    md = _base_metadata(context)
    md.update(
        {
            "configuration": {
                "id": result.configuration_id,
                "version": result.configuration_version,
            },
            "player_count": result.player_count,
        }
    )
    md.update(_states_provenance(result.normalized_states))
    return md


# --------------------------------------------------------------------------- #
# Evidence-class table (REQ-14.3) and hard-gate table (REQ-14.4)               #
# --------------------------------------------------------------------------- #


def evidence_class_table(active_class: str) -> list[dict[str, Any]]:
    """The REQ-14.3 evidence-class table, flagging which class this report claims.

    Every class in the fixed vocabulary is listed so a reviewer can see, at a
    glance, that numerical / exhaustive / sampled claims are *not* being made in a
    VS1 report; exactly the ``active_class`` is marked as applying.
    """
    notes = {
        "theorem": "no formal-proof claim in a VS1 resolution report",
        "exact exhaustive": "exhaustive enumeration is VS2 (not evaluated here)",
        "exact-given-profile": (
            "deterministic exact resolution under the given configuration and "
            "Trials power profile"
        ),
        "numerical LP": "zero-sum LP is VS2 (not evaluated here)",
        "numerical convex": "canonical maximum-entropy equilibrium is VS2 (not evaluated here)",
        "sampled": "no Monte Carlo / sampled estimate in VS1",
        "design judgement": (
            "normative thresholds without approved oracles are reported under "
            "assumptions, never as a test failure (REQ-14.5)"
        ),
    }
    return [
        {"evidence_class": ec, "applies": ec == active_class, "note": notes[ec]}
        for ec in EVIDENCE_CLASSES
    ]


def _ledger_conserved(result: Any) -> bool:
    for pid in result.conservation:
        for line in result.conservation[pid].values():
            if line["allocated"] + line["residue"] != line["available"]:
                return False
    return True


def default_hard_gates(result: Any) -> list[dict[str, Any]]:
    """A default hard-gate table (REQ-14.4) derived from a resolution.

    VS1 can evaluate two structural gates exactly — configuration validity and
    power-ledger conservation — and marks the VS2 game-theoretic gates
    ``not_evaluated`` rather than absent, so the table is complete and no gate is
    silently treated as passed.
    """
    errors = "; ".join(result.validation.errors) if result.validation.errors else "no errors"
    return [
        {
            "gate": "configuration_valid",
            "status": GATE_PASS if result.validation.valid else GATE_FAIL,
            "detail": errors,
        },
        {
            "gate": "power_ledger_conserved",
            "status": GATE_PASS if _ledger_conserved(result) else GATE_FAIL,
            "detail": "allocated + residue == available for every source (REQ-4.3)",
        },
        {
            "gate": "reasonable_set_R",
            "status": GATE_NOT_EVALUATED,
            "detail": _VS2_NOT_AVAILABLE,
        },
        {
            "gate": "equilibrium_relevant_set_E_0_01",
            "status": GATE_NOT_EVALUATED,
            "detail": _VS2_NOT_AVAILABLE,
        },
    ]


def default_assumptions() -> list[dict[str, Any]]:
    """Normative thresholds reported but not treated as failures (REQ-14.5)."""
    return [
        {
            "item": "VS2 equilibrium, dominance and counterability metrics",
            "status": "not evaluated",
            "evidence_class": "design judgement",
            "note": (
                "Reported for completeness, not a mathematical test failure "
                "(REQ-14.5); awaiting the VS2 exact laboratory."
            ),
        }
    ]


# --------------------------------------------------------------------------- #
# Section builders for a resolution report                                     #
# --------------------------------------------------------------------------- #


def _exact_counts(result: Any) -> dict[str, Any]:
    trials = [
        {
            "trial_id": tr.trial_id,
            "active": tr.active,
            "legal_entries": len(tr.legal_entries),
            "illegal_entries": len(tr.illegal_entries),
            "shared_first": tr.shared_first,
            "uncontested": tr.uncontested,
        }
        for tr in sorted(result.trial_results, key=lambda t: t.trial_id)
    ]
    return {
        "evidence_class": "exact-given-profile",
        "player_count": result.player_count,
        "trials_total": len(result.trial_results),
        "trials_active": sum(1 for tr in result.trial_results if tr.active),
        "recognition_points": {
            pid: pr.recognition_points for pid, pr in sorted(result.player_results.items())
        },
        "trials": trials,
    }


def _not_evaluated_section() -> dict[str, Any]:
    return {"evaluated": False, "reason": _VS2_NOT_AVAILABLE}


def _ties_section(result: Any) -> dict[str, Any]:
    shared_first_trials = sorted(tr.trial_id for tr in result.trial_results if tr.shared_first)
    final_shared = sorted(
        pid for pid, pr in result.player_results.items() if pr.shared_first
    )
    return {
        "shared_first_trials": shared_first_trials,
        "final_shared_first_players": final_shared,
        "any_ties": bool(shared_first_trials or final_shared),
    }


def _diagnostics_section(result: Any) -> dict[str, Any]:
    return {
        "invalidation_events": [e.to_dict() for e in result.invalidation_events],
        "overallocated_domains": result.overallocated_domains,
        "invalidated_trial_entries": result.invalidated_trial_entries,
        "dropped_wild_entries": result.dropped_wild_entries,
        "residue": result.residue,
        "award_trace": [a.to_dict() for a in result.award_trace],
    }


# --------------------------------------------------------------------------- #
# Report builders                                                              #
# --------------------------------------------------------------------------- #


def build_resolution_report(
    result: Any,
    context: ReportContext = ReportContext(),
    *,
    fixture_id: Optional[str] = None,
    hard_gates: Optional[list[dict[str, Any]]] = None,
    assumptions: Optional[list[dict[str, Any]]] = None,
) -> dict[str, Any]:
    """Build the deterministic JSON-able report dict for one resolved profile."""
    report: dict[str, Any] = {
        "schema_version": SCHEMA_VERSION,
        "report_type": "resolution",
        "metadata": _resolution_metadata(result, context),
        "validation": {
            "valid": result.validation.valid,
            "errors": list(result.validation.errors),
            "warnings": list(result.validation.warnings),
        },
        "exact_counts": _exact_counts(result),
        "equilibrium": _not_evaluated_section(),
        "dominance": _not_evaluated_section(),
        "counterability": _not_evaluated_section(),
        "ties": _ties_section(result),
        "diagnostics": _diagnostics_section(result),
        "evidence_class": context.evidence_class,
        "evidence_class_table": evidence_class_table(context.evidence_class),
        "hard_gate_table": hard_gates if hard_gates is not None else default_hard_gates(result),
        "assumptions_and_unresolved_gates": (
            assumptions if assumptions is not None else default_assumptions()
        ),
        "audit_hash": result.deterministic_hash,
    }
    if fixture_id is not None:
        report["fixture_id"] = fixture_id
    return report


def build_validation_report(
    config_id: Optional[str],
    validation: Any,
    context: ReportContext = ReportContext(),
    *,
    source: Optional[str] = None,
) -> dict[str, Any]:
    """Build a configuration-validation report (for the ``validate-config`` command)."""
    md = _base_metadata(context)
    md["configuration"] = {"id": config_id, "version": None}
    if source is not None:
        md["source"] = source
    return {
        "schema_version": SCHEMA_VERSION,
        "report_type": "validation",
        "metadata": md,
        "validation": {
            "valid": validation.valid,
            "errors": list(validation.errors),
            "warnings": list(validation.warnings),
        },
        "evidence_class": "exact-given-profile",
        "evidence_class_table": evidence_class_table("exact-given-profile"),
    }


def build_fixture_index_report(
    entries: list[dict[str, Any]],
    context: ReportContext = ReportContext(),
) -> dict[str, Any]:
    """Build the VS1 fixture-library index report (all committed fixtures + oracle labels).

    ``entries`` is a list of per-fixture summaries; they are sorted by id so the
    report is order-independent (NFR-1).
    """
    ordered = sorted(entries, key=lambda e: e.get("id", ""))
    md = _base_metadata(context)
    md["fixture_count"] = len(ordered)
    return {
        "schema_version": SCHEMA_VERSION,
        "report_type": "fixture-index",
        "metadata": md,
        "fixtures": ordered,
        "evidence_class_table": evidence_class_table(context.evidence_class),
    }


# --------------------------------------------------------------------------- #
# Rendering — JSON                                                             #
# --------------------------------------------------------------------------- #


def render_json(report: dict[str, Any]) -> str:
    """Deterministic pretty JSON: sorted keys, fixed indent, trailing newline.

    ``sort_keys=True`` makes the byte output independent of dict insertion order;
    ``json.dumps`` always uses ``\\n`` (never ``\\r\\n``) for indentation, so the
    output is byte-identical across platforms and repeated runs (NFR-1).
    """
    return json.dumps(report, sort_keys=True, indent=2, ensure_ascii=True) + "\n"


# --------------------------------------------------------------------------- #
# Rendering — Markdown (design §13.2)                                          #
# --------------------------------------------------------------------------- #


def _md_metadata(md: dict[str, Any]) -> list[str]:
    cfg = md.get("configuration") or {}
    scoring = md.get("scoring_reference") or {}
    profile = md.get("trials_power_profile") or {}
    solver = md.get("solver") or {}
    lines = [
        "## 1. Metadata",
        "",
        f"- Schema version: {_fmt(md.get('schema_version'))}",
        f"- Tool version: {_fmt(md.get('tool_version'))}",
        f"- Configuration: {_fmt(cfg.get('id'))} (version {_fmt(cfg.get('version'))})",
        f"- Player count: {_fmt(md.get('player_count'))}",
        f"- State IDs: {_fmt(md.get('state_ids'))}",
        f"- Scoring reference q(S) version: {_fmt(scoring.get('version'))}",
        f"- Scoring reference q(S) content hash: {_fmt(scoring.get('content_hash'))}",
        f"- Trials power profile F_C(S) version: {_fmt(profile.get('version'))}",
        f"- Method: {_fmt(md.get('method'))}",
        f"- Solver: {_fmt(solver.get('name'))}",
        f"- Solver tolerances: {_fmt(solver.get('tolerances'))}",
        f"- Seed: {_fmt(md.get('seed'))}",
        f"- Code revision: {_fmt(md.get('code_revision'))}",
    ]
    if "generated_at" in md:
        lines.append(f"- Generated at: {_fmt(md.get('generated_at'))}")
    provenance = md.get("provenance") or {}
    if provenance:
        lines.append("- Provenance:")
        for pid in sorted(provenance):
            p = provenance[pid] or {}
            lines.append(
                f"  - {pid}: type={_fmt(p.get('type'))}, source_id={_fmt(p.get('source_id'))}"
            )
    return lines


def _md_validation(validation: dict[str, Any]) -> list[str]:
    lines = [
        "## 2. Validation",
        "",
        f"- Valid: {_fmt(validation.get('valid'))}",
    ]
    errors = validation.get("errors") or []
    warnings = validation.get("warnings") or []
    lines.append(f"- Errors ({len(errors)}):")
    if errors:
        lines.extend(f"  - {e}" for e in errors)
    else:
        lines.append("  - none")
    lines.append(f"- Warnings ({len(warnings)}):")
    if warnings:
        lines.extend(f"  - {w}" for w in warnings)
    else:
        lines.append("  - none")
    return lines


def _md_exact_counts(counts: dict[str, Any]) -> list[str]:
    lines = [
        "## 3. Exact counts",
        "",
        f"- Evidence class: {_fmt(counts.get('evidence_class'))}",
        f"- Player count: {_fmt(counts.get('player_count'))}",
        f"- Trials total: {_fmt(counts.get('trials_total'))}",
        f"- Trials active: {_fmt(counts.get('trials_active'))}",
        "- Recognition points:",
    ]
    rp = counts.get("recognition_points") or {}
    if rp:
        lines.extend(f"  - {pid}: {rp[pid]}" for pid in sorted(rp))
    else:
        lines.append("  - none")
    lines.append("- Per-trial:")
    trials = counts.get("trials") or []
    if trials:
        for tr in sorted(trials, key=lambda t: t.get("trial_id", "")):
            lines.append(
                f"  - {tr.get('trial_id')}: active={_fmt(tr.get('active'))}, "
                f"legal_entries={tr.get('legal_entries')}, "
                f"illegal_entries={tr.get('illegal_entries')}, "
                f"shared_first={_fmt(tr.get('shared_first'))}, "
                f"uncontested={_fmt(tr.get('uncontested'))}"
            )
    else:
        lines.append("  - none")
    return lines


def _md_not_evaluated(number: int, title: str, section: dict[str, Any]) -> list[str]:
    return [
        f"## {number}. {title}",
        "",
        f"- Evaluated: {_fmt(section.get('evaluated'))}",
        f"- Reason: {_fmt(section.get('reason'))}",
    ]


def _md_ties(ties: dict[str, Any]) -> list[str]:
    return [
        "## 7. Ties",
        "",
        f"- Any ties: {_fmt(ties.get('any_ties'))}",
        f"- Shared-first trials: {_fmt(ties.get('shared_first_trials'))}",
        f"- Final shared-first players: {_fmt(ties.get('final_shared_first_players'))}",
    ]


def _md_diagnostics(diag: dict[str, Any]) -> list[str]:
    lines = ["## 8. Diagnostics", ""]
    events = diag.get("invalidation_events") or []
    lines.append(f"- Invalidation events ({len(events)}):")
    if events:
        for ev in events:
            lines.append(
                f"  - player={ev.get('player_id')}, scope={ev.get('scope')}, "
                f"reason={ev.get('reason')}, action={ev.get('action')}"
            )
    else:
        lines.append("  - none")
    over = diag.get("overallocated_domains") or {}
    lines.append(f"- Overallocated domains: {_fmt(sorted(over)) if over else 'none'}")
    dropped = diag.get("dropped_wild_entries") or {}
    lines.append(f"- Dropped Wild entries: {_fmt(sorted(dropped)) if dropped else 'none'}")
    residue = diag.get("residue") or {}
    lines.append("- Residue:")
    if residue:
        for pid in sorted(residue):
            r = residue[pid] or {}
            lines.append(f"  - {pid}: normal={r.get('normal')}, wild={r.get('wild')}")
    else:
        lines.append("  - none")
    return lines


def _md_evidence_class(report: dict[str, Any]) -> list[str]:
    lines = [
        "## 9. Evidence class",
        "",
        f"- Report evidence class: {_fmt(report.get('evidence_class'))}",
        "- Evidence-class table:",
    ]
    for row in report.get("evidence_class_table") or []:
        marker = "APPLIES" if row.get("applies") else "not applied"
        lines.append(f"  - {row.get('evidence_class')}: {marker} — {row.get('note')}")
    return lines


def _md_assumptions(report: dict[str, Any]) -> list[str]:
    lines = ["## 10. Assumptions and unresolved gates", "", "- Hard-gate table:"]
    for gate in report.get("hard_gate_table") or []:
        lines.append(
            f"  - {gate.get('gate')}: {gate.get('status')} — {gate.get('detail')}"
        )
    lines.append("- Assumptions / unresolved gates:")
    assumptions = report.get("assumptions_and_unresolved_gates") or []
    if assumptions:
        for a in assumptions:
            lines.append(
                f"  - {a.get('item')}: {a.get('status')} "
                f"(evidence class: {a.get('evidence_class')}) — {a.get('note')}"
            )
    else:
        lines.append("  - none")
    return lines


def _join_sections(parts: list[list[str]]) -> str:
    """Join section blocks with a blank line between them, deterministically."""
    return "\n\n".join("\n".join(block).rstrip("\n") for block in parts) + "\n"


def _render_resolution_markdown(report: dict[str, Any]) -> str:
    title = "# Ascension Trials — Resolution Report"
    fixture_id = report.get("fixture_id")
    header = [title, ""]
    if fixture_id:
        header.append(f"Fixture: **{fixture_id}**")
        header.append("")
    parts: list[list[str]] = [
        header,
        _md_metadata(report.get("metadata") or {}),
        _md_validation(report.get("validation") or {}),
        _md_exact_counts(report.get("exact_counts") or {}),
        _md_not_evaluated(4, "Equilibrium", report.get("equilibrium") or {}),
        _md_not_evaluated(5, "Dominance", report.get("dominance") or {}),
        _md_not_evaluated(6, "Counterability", report.get("counterability") or {}),
        _md_ties(report.get("ties") or {}),
        _md_diagnostics(report.get("diagnostics") or {}),
        _md_evidence_class(report),
        _md_assumptions(report),
        ["## Audit", "", f"- Audit hash: {_fmt(report.get('audit_hash'))}"],
    ]
    return _join_sections(parts)


def _render_validation_markdown(report: dict[str, Any]) -> str:
    md = report.get("metadata") or {}
    cfg = md.get("configuration") or {}
    parts: list[list[str]] = [
        ["# Ascension Trials — Configuration Validation Report", ""],
        [
            "## 1. Metadata",
            "",
            f"- Schema version: {_fmt(md.get('schema_version'))}",
            f"- Tool version: {_fmt(md.get('tool_version'))}",
            f"- Configuration id: {_fmt(cfg.get('id'))}",
            f"- Source: {_fmt(md.get('source'))}",
            f"- Code revision: {_fmt(md.get('code_revision'))}",
        ],
        _md_validation(report.get("validation") or {}),
        _md_evidence_class(report),
    ]
    return _join_sections(parts)


def _render_fixture_index_markdown(report: dict[str, Any]) -> str:
    md = report.get("metadata") or {}
    parts: list[list[str]] = [
        ["# Ascension Trials — VS1 Fixture Library Report", ""],
        [
            "## 1. Metadata",
            "",
            f"- Schema version: {_fmt(md.get('schema_version'))}",
            f"- Tool version: {_fmt(md.get('tool_version'))}",
            f"- Fixture count: {_fmt(md.get('fixture_count'))}",
            f"- Code revision: {_fmt(md.get('code_revision'))}",
        ],
    ]
    fixtures = report.get("fixtures") or []
    body = ["## 2. Fixtures", ""]
    for fx in fixtures:
        body.append(f"- {fx.get('id')} ({fx.get('name')})")
        body.append(f"  - Evidence class: {_fmt(fx.get('evidence_class'))}")
        body.append(f"  - Source: {_fmt(fx.get('source'))}")
        body.append(
            f"  - Independent of implementation: {_fmt(fx.get('independent_of_implementation'))}"
        )
        if "resolved" in fx:
            body.append(f"  - Resolved: {_fmt(fx.get('resolved'))}")
        if fx.get("audit_hash"):
            body.append(f"  - Audit hash: {_fmt(fx.get('audit_hash'))}")
        if "note" in fx:
            body.append(f"  - Note: {_fmt(fx.get('note'))}")
    parts.append(body)
    parts.append(_md_evidence_class(report))
    return _join_sections(parts)


def render_markdown(report: dict[str, Any]) -> str:
    """Render a report dict to deterministic Markdown, dispatching on report type."""
    report_type = report.get("report_type")
    if report_type == "resolution":
        return _render_resolution_markdown(report)
    if report_type == "validation":
        return _render_validation_markdown(report)
    if report_type == "fixture-index":
        return _render_fixture_index_markdown(report)
    if report_type == "small-state":
        return _md_small_state(report)
    if report_type == "best-response":
        return _md_best_response(report)
    raise ValueError(f"unknown report_type: {report_type!r}")


# --------------------------------------------------------------------------- #
# VS2 small-state report (design §13; impl spec §16, §17)                      #
# --------------------------------------------------------------------------- #


def vs2_evidence_class_table() -> list[dict[str, Any]]:
    """Evidence-class table for a VS2 report: multiple classes genuinely apply.

    Unlike a VS1 resolution (a single ``exact-given-profile`` claim), a VS2
    small-state report mixes exact-exhaustive structural results, ``numerical LP``
    game values and a ``numerical convex`` canonical equilibrium — so more than one
    class is flagged as applying, each with the section it governs (REQ-14.3).
    """
    applies = {
        "exact exhaustive": "enumeration counts, dominance / reasonable set, tie accounting",
        "numerical LP": "zero-sum win and margin game values and equilibrium-relevant mass",
        "numerical convex": "canonical maximum-entropy equilibrium (entropy, supports)",
    }
    notes = {
        "theorem": "no formal-proof claim in this report",
        "exact-given-profile": "single-profile resolution is the VS1 layer, used per matrix cell",
        "sampled": "no Monte Carlo / sampled estimate — enumeration is exhaustive (NFR-4)",
        "design judgement": (
            "dead power and reward concentration are reported diagnostics; the "
            "counterability (G4/G5) and tie-discipline (G7) hard gates and margin-VOI "
            "are computed metrics, not test failures asserted by this module (REQ-14.5)"
        ),
    }
    return [
        {
            "evidence_class": ec,
            "applies": ec in applies,
            "note": applies.get(ec, notes.get(ec, "")),
        }
        for ec in EVIDENCE_CLASSES
    ]


def _vs2_hard_gates_asymmetric(
    metrics: Any,
    tie_w: float,
    chain_w: float,
    trial_shared: float,
    *,
    final_shared_max: float,
    final_chain_max: float,
    trial_shared_max: float,
) -> list[dict[str, Any]]:
    """Hard-gate table for an asymmetric (unequal-state) small-state analysis.

    The rectangular counterpart of the parity branch in :func:`vs2_hard_gates`.
    The zero-sum LP convergence, canonical-equilibrium validity and the three
    tie-discipline (G7) gates are all defined for ``m×n`` games and evaluated
    exactly as at parity. The equal-state counterability gates (G4/G5) are only
    meaningful at parity, so they are marked ``not_evaluated`` here rather than
    crashing on the ``not_applicable`` metrics (REQ-3.3, REQ-13.4). Row order is
    identical to the parity table so a reviewer sees the same gate sequence.
    """
    na_detail = (
        "equal-state counterability (G4/G5) is defined only at parity; on a "
        "genuinely asymmetric state it is not_applicable and this gate is not "
        "evaluated (REQ-3.3)"
    )
    return [
        {
            "gate": "zero_sum_lp_converged",
            "status": GATE_PASS if (metrics.win_lp.success and metrics.margin_lp.success) else GATE_FAIL,
            "detail": (
                f"win status: {metrics.win_lp.status}; margin status: {metrics.margin_lp.status}"
            ),
        },
        {
            "gate": "canonical_equilibrium_valid",
            "status": GATE_PASS if metrics.canonical_equilibrium.valid else GATE_FAIL,
            "detail": metrics.canonical_equilibrium.status,
        },
        {
            "gate": "equal_state_counterability_R",
            "status": GATE_NOT_EVALUATED,
            "detail": na_detail,
        },
        {
            "gate": "equal_state_counterability_E_0_01",
            "status": GATE_NOT_EVALUATED,
            "detail": na_detail,
        },
        {
            "gate": "counter_quality_G5_over_E_0_01",
            "status": GATE_NOT_EVALUATED,
            "detail": na_detail,
        },
        {
            "gate": "tie_discipline_final_shared_G7",
            "status": GATE_PASS if tie_w <= final_shared_max else GATE_FAIL,
            "detail": (
                f"equilibrium-weighted final shared-winner probability {tie_w:.6f} "
                f"(threshold <= {final_shared_max})"
            ),
        },
        {
            "gate": "tie_discipline_final_chain_decided_G7",
            "status": GATE_PASS if chain_w <= final_chain_max else GATE_FAIL,
            "detail": (
                f"equilibrium-weighted final-Spellbook-tiebreak rate {chain_w:.6f} "
                f"(threshold <= {final_chain_max})"
            ),
        },
        {
            "gate": "tie_discipline_per_trial_shared_G7",
            "status": GATE_PASS if trial_shared <= trial_shared_max else GATE_FAIL,
            "detail": (
                f"per-Trial shared-award rate {trial_shared:.6f} "
                f"(target <= {trial_shared_max}; from resolver shared_first traces)"
            ),
        },
    ]


def vs2_hard_gates(metrics: Any) -> list[dict[str, Any]]:
    """Hard-gate table for a VS2 small-state analysis (REQ-14.4; model §11 G4/G5/G7).

    Every row is a real pass/fail condition (audit D3). The zero-sum LPs must
    converge and the canonical equilibrium must validate; equal-state
    counterability (G4) is the ∀b∃a head-to-head-counter boolean over both ``R``
    and ``E^{0.01}``; counter quality (G5) is the per-opponent RP-margin floor over
    ``E^{0.01}``; and the tie-discipline gates (G7) bound the equilibrium-weighted
    final shared-winner probability, the equilibrium-weighted final-chain-decided
    rate, and the per-Trial shared-award rate. The reasonable-set / equilibrium-
    relevant *sizes* are NOT gates — they are diagnostic counts (report §2), never a
    row that cannot fail.
    """
    from .metrics import (
        G5_MARGIN_FLOOR,
        G7_FINAL_CHAIN_MAX,
        G7_FINAL_SHARED_MAX,
        G7_TRIAL_SHARED_MAX,
    )

    cr = metrics.counter_R
    ce = metrics.counter_E
    tie_w = metrics.final_tie_rate_eq_weighted
    chain_w = metrics.chain_decided_rate_eq_weighted
    trial_shared = float(metrics.trial_shared_award_rate)

    # Asymmetric (unequal-state) games: the equal-state counterability gates
    # (G4/G5) and the mirror counter-distance diagnostic are meaningful only at
    # parity, so :func:`metrics.compute_small_state_metrics` emits them as
    # ``not_applicable`` (``counter_R``/``counter_E`` are ``None``, REQ-3.3). Read
    # in this state, the parity branch below would crash on ``cr.c1_holds``; instead
    # we build a coherent gate table that marks those three gates ``not_evaluated``
    # while still evaluating the LP-convergence, equilibrium-validity and
    # tie-discipline gates that ARE defined for rectangular games (REQ-3.1, REQ-13.4).
    if cr is None or ce is None:
        return _vs2_hard_gates_asymmetric(
            metrics, tie_w, chain_w, trial_shared,
            final_shared_max=G7_FINAL_SHARED_MAX,
            final_chain_max=G7_FINAL_CHAIN_MAX,
            trial_shared_max=G7_TRIAL_SHARED_MAX,
        )

    def _unbeaten_detail(gate) -> str:
        if gate.c1_holds:
            return f"every strategy in {gate.set_name} has a Recognition-Point counter in the set"
        labels = [u.get("normal_totals") or u.get("strategy_id") for u in gate.unbeaten]
        return (
            f"C1 fails over {gate.set_name}: uncounterable strategy(ies) {labels} never lose "
            f"(an uncounterable pure strategy exists)"
        )

    return [
        {
            "gate": "zero_sum_lp_converged",
            "status": GATE_PASS if (metrics.win_lp.success and metrics.margin_lp.success) else GATE_FAIL,
            "detail": (
                f"win status: {metrics.win_lp.status}; margin status: {metrics.margin_lp.status}"
            ),
        },
        {
            "gate": "canonical_equilibrium_valid",
            "status": GATE_PASS if metrics.canonical_equilibrium.valid else GATE_FAIL,
            "detail": metrics.canonical_equilibrium.status,
        },
        {
            "gate": "equal_state_counterability_R",
            "status": GATE_PASS if cr.c1_holds else GATE_FAIL,
            "detail": _unbeaten_detail(cr),
        },
        {
            "gate": "equal_state_counterability_E_0_01",
            "status": GATE_PASS if ce.c1_holds else GATE_FAIL,
            "detail": _unbeaten_detail(ce),
        },
        {
            "gate": "counter_quality_G5_over_E_0_01",
            "status": GATE_PASS if ce.g5_floor_ok else GATE_FAIL,
            "detail": (
                f"max_a margin[a,b] >= {G5_MARGIN_FLOOR} for every b in E^0.01"
                if ce.g5_floor_ok
                else f"some b in E^0.01 has best counter margin < {G5_MARGIN_FLOOR}"
            ),
        },
        {
            "gate": "tie_discipline_final_shared_G7",
            "status": GATE_PASS if tie_w <= G7_FINAL_SHARED_MAX else GATE_FAIL,
            "detail": (
                f"equilibrium-weighted final shared-winner probability {tie_w:.6f} "
                f"(threshold <= {G7_FINAL_SHARED_MAX})"
            ),
        },
        {
            "gate": "tie_discipline_final_chain_decided_G7",
            "status": GATE_PASS if chain_w <= G7_FINAL_CHAIN_MAX else GATE_FAIL,
            "detail": (
                f"equilibrium-weighted final-Spellbook-tiebreak rate {chain_w:.6f} "
                f"(threshold <= {G7_FINAL_CHAIN_MAX})"
            ),
        },
        {
            "gate": "tie_discipline_per_trial_shared_G7",
            "status": GATE_PASS if trial_shared <= G7_TRIAL_SHARED_MAX else GATE_FAIL,
            "detail": (
                f"per-Trial shared-award rate {trial_shared:.6f} "
                f"(target <= {G7_TRIAL_SHARED_MAX}; from resolver shared_first traces)"
            ),
        },
    ]


def build_small_state_report(
    metrics: Any,
    context: ReportContext = ReportContext(),
    *,
    config_version: Optional[str] = None,
    state_ids: Optional[list[str]] = None,
    hard_gates: Optional[list[dict[str, Any]]] = None,
) -> dict[str, Any]:
    """Build the deterministic JSON-able VS2 small-state analysis report.

    Wraps :meth:`metrics.SmallStateMetrics.to_dict` with the REQ-14.2 metadata
    block (configuration id/version, player count, state ids, solver + tolerances)
    and the mixed evidence-class table — structural counts are exact, game values
    ``numerical_lp`` and equilibrium ``numerical_convex`` (labels preserved from the
    metrics payload).
    """
    body = metrics.to_dict()
    md = _base_metadata(context)
    md.update(
        {
            "configuration": {"id": metrics.config_id, "version": config_version},
            "player_count": metrics.player_count,
            "state_ids": sorted(state_ids) if state_ids else [],
            "solver": {
                "lp": metrics.win_lp.method,
                "lp_tolerance": metrics.win_lp.tolerance,
                "convex": metrics.canonical_equilibrium.method,
                "convex_tolerance": metrics.canonical_equilibrium.tolerance,
            },
        }
    )
    return {
        "schema_version": SCHEMA_VERSION,
        "report_type": "small-state",
        "metadata": md,
        "counts": body["counts"],
        "equilibrium": body["equilibrium"],
        "ties": body["ties"],
        "counterability": body["counterability"],
        "diagnostics": body["diagnostics"],
        "evidence_class": "exact exhaustive + numerical LP + numerical convex",
        "evidence_class_table": vs2_evidence_class_table(),
        "hard_gate_table": hard_gates if hard_gates is not None else vs2_hard_gates(metrics),
        "assumptions_and_unresolved_gates": [
            {
                "item": "design thresholds without approved oracles",
                "status": "reported, not gated",
                "evidence_class": "design judgement",
                "note": (
                    "Margin-VOI, dead power and reward concentration are reported "
                    "diagnostics; the G4/G5 counterability and G7 tie-discipline hard "
                    "gates are evaluated in the hard-gate table above (REQ-14.5)."
                ),
            }
        ],
    }


def _md_small_state(report: dict[str, Any]) -> str:
    md = report.get("metadata") or {}
    cfg = md.get("configuration") or {}
    solver = md.get("solver") or {}
    counts = report.get("counts") or {}
    equil = report.get("equilibrium") or {}
    win = equil.get("win") or {}
    margin = equil.get("margin") or {}
    conv = equil.get("canonical_maximum_entropy") or {}
    ers = equil.get("equilibrium_relevant_set") or {}
    ties = report.get("ties") or {}
    counter = report.get("counterability") or {}
    # At parity these are dicts; on an asymmetric state they are the string
    # "not_applicable" (REQ-3.3). Guard so the renderer stays robust either way.
    _counter_R = counter.get("c1_over_R")
    _counter_R = _counter_R if isinstance(_counter_R, dict) else {}
    _counter_E = counter.get("c1_over_E_0_01")
    _counter_E = _counter_E if isinstance(_counter_E, dict) else {}
    _voi = counter.get("margin_voi") or {}
    diag = report.get("diagnostics") or {}

    parts: list[list[str]] = [
        ["# Ascension Trials — VS2 Small-State Report", ""],
        [
            "## 1. Metadata and evidence class",
            "",
            f"- Configuration: {_fmt(cfg.get('id'))} (version {_fmt(cfg.get('version'))})",
            f"- Player count: {_fmt(md.get('player_count'))}",
            f"- State IDs: {_fmt(md.get('state_ids'))}",
            f"- LP solver: {_fmt(solver.get('lp'))} (tolerance {_fmt(solver.get('lp_tolerance'))})",
            f"- Convex solver: {_fmt(solver.get('convex'))} (tolerance {_fmt(solver.get('convex_tolerance'))})",
            f"- Code revision: {_fmt(md.get('code_revision'))}",
        ],
        [
            "## 2. Exact counts",
            "",
            f"- Evidence class: {_fmt(counts.get('evidence_class'))}",
            f"- Legal allocations: {_fmt(counts.get('legal_allocations'))}",
            f"- Maximal allocations: {_fmt(counts.get('maximal_allocations'))}",
            f"- Collapsed strategic classes: {_fmt(counts.get('collapsed_classes'))}",
            f"- Reasonable set |R|: {_fmt(counts.get('reasonable_set_R'))}",
            f"- Equilibrium-relevant |E^0.01|: {_fmt(counts.get('equilibrium_relevant_E_0_01'))}",
        ],
        [
            "## 3. Equilibrium",
            "",
            f"- Win game value ({_fmt(win.get('evidence_class'))}): {_fmt(win.get('value'))}",
            f"  - exploitability: {_fmt(win.get('exploitability'))}, primal residual: {_fmt(win.get('primal_residual'))}, dual residual: {_fmt(win.get('dual_residual'))}",
            f"- Margin game value ({_fmt(margin.get('evidence_class'))}): {_fmt(margin.get('value'))}",
            f"  - exploitability: {_fmt(margin.get('exploitability'))}",
            f"- Canonical max-entropy ({_fmt(conv.get('evidence_class'))}): valid={_fmt(conv.get('valid'))}, status={_fmt(conv.get('status'))}",
            f"  - entropy: {_fmt(conv.get('entropy'))}, normalized: {_fmt(conv.get('normalized_entropy'))}",
            f"  - support @1e-9/1e-3/1e-2: {_fmt(conv.get('support_1e_9'))}/{_fmt(conv.get('support_1e_3'))}/{_fmt(conv.get('support_1e_2'))}",
            f"- E^0.01 size: {_fmt(ers.get('size'))} (threshold {_fmt(ers.get('threshold'))}, tolerance {_fmt(ers.get('tolerance'))})",
        ],
        [
            "## 4. Ties and counterability",
            "",
            f"- Final tie rate (uniform): {_fmt(ties.get('final_tie_rate'))} ({_fmt(ties.get('final_tie_rate_float'))})",
            f"- Final tie rate (equilibrium-weighted, G7): {_fmt(ties.get('final_tie_rate_equilibrium_weighted'))}",
            f"- Final chain-decided rate (uniform): {_fmt(ties.get('final_chain_decided_rate_uniform'))} ({_fmt(ties.get('final_chain_decided_rate_uniform_float'))})",
            f"- Final chain-decided rate (equilibrium-weighted, G7): {_fmt(ties.get('final_chain_decided_rate_equilibrium_weighted'))}",
            f"- Trial shared-award rate: {_fmt(ties.get('trial_shared_award_rate'))} ({_fmt(ties.get('trial_shared_award_rate_float'))}) [{_fmt(ties.get('trial_shared_award_rate_source'))}]",
            f"- Final shared-winner pairs: {_fmt(ties.get('final_shared_pairs'))}",
            f"- G4 counterability over R holds: {_fmt(_counter_R.get('c1_holds'))}; unbeaten: {_fmt([u.get('normal_totals') or u.get('strategy_id') for u in (_counter_R.get('unbeaten_strategies') or [])])}",
            f"- G4 counterability over E^0.01 holds: {_fmt(_counter_E.get('c1_holds'))}; unbeaten: {_fmt([u.get('normal_totals') or u.get('strategy_id') for u in (_counter_E.get('unbeaten_strategies') or [])])}",
            f"- G5 counter-quality margin floor over E^0.01: {_fmt(_counter_E.get('g5_margin_floor_ok'))}",
            f"- Mean counter fraction over R (diagnostic): {_fmt(_counter_R.get('mean_counter_fraction'))}",
            f"- Mean counter distance (diagnostic): {_fmt(counter.get('mean_counter_distance'))}",
            f"- Margin VOI: {_fmt(_voi.get('value'))} ({_fmt(_voi.get('mixture'))}; mixture valid={_fmt(_voi.get('mixture_valid'))})",
        ],
        [
            "## 5. Diagnostics",
            "",
            f"- Dead power (A): {_fmt(diag.get('dead_power_A'))}",
            f"- Reward concentration (Herfindahl): {_fmt(diag.get('reward_concentration_herfindahl'))}",
            f"- Dominance rounds: {_fmt(diag.get('dominance_rounds'))}",
            f"- Strictly dominated removed: {_fmt(diag.get('strictly_dominated_removed'))}",
            f"- Weak-dominance relations: {_fmt(diag.get('weak_dominance_relations'))}",
        ],
        _md_evidence_class(report),
        _md_assumptions(report),
    ]
    return _join_sections(parts)


# --------------------------------------------------------------------------- #
# VS3 best-response report (design §9; REQ-13)                                 #
# --------------------------------------------------------------------------- #


def best_response_evidence_class_table(active_class: str) -> list[dict[str, Any]]:
    """Evidence-class table for a VS3 best-response report (REQ-13.2).

    Uses the extended :data:`VS3_EVIDENCE_CLASSES` vocabulary so the three
    best-response classes are listed alongside the prior VS1/VS2 classes; exactly
    the ``active_class`` (the oracle's evidence class) is flagged as applying. The
    VS1/VS2 tables are unaffected (they iterate the narrower
    :data:`EVIDENCE_CLASSES`), so their byte output is unchanged (REQ-14.7).
    """
    notes = {
        "theorem": "no formal-proof claim in a best-response report",
        "exact exhaustive": "VS2 full-matrix enumeration (a different oracle, not evaluated here)",
        "exact-given-profile": (
            "single-profile resolver recomputation used to re-validate the returned "
            "allocation (the payoff authority, REQ-6.2)"
        ),
        "numerical LP": "the zero-sum LP is the VS2 / VS4 restricted solve (not evaluated here)",
        "numerical convex": "canonical maximum-entropy equilibrium is VS2 (not evaluated here)",
        "sampled": "no Monte Carlo / sampled estimate — the oracle searches the full space",
        "design judgement": "no normative threshold is asserted as a test failure here (REQ-14.5)",
        "exact_exhaustive_best_response": (
            "best response proven optimal by full enumeration of the legal space (exact)"
        ),
        "exact_dp_best_response": (
            "best response proven optimal by an exact-arithmetic dynamic program (exact); "
            "valid only with integer/rational arithmetic (REQ-4.2)"
        ),
        "numerical_milp_best_response_certified": (
            "best response found by a floating-point MILP with its absolute/relative gap "
            "certified within tolerance (numerical, certified — not exact; NFR-5)"
        ),
    }
    return [
        {"evidence_class": ec, "applies": ec == active_class, "note": notes[ec]}
        for ec in VS3_EVIDENCE_CLASSES
    ]


def best_response_hard_gates(best_response: Any) -> list[dict[str, Any]]:
    """Double-oracle-ready hard-gate table for a best-response report (REQ-13.4).

    The two VS3 gates a best response can evaluate now — resolver re-validation of
    the reported value (always pass; the value IS the resolver-recomputed one,
    REQ-6.2) and certified optimality (from the certificate, REQ-6.3) — plus two
    rows reserved for the VS4 double oracle (``double_oracle_converged`` and the
    certified exploitability bracket), marked ``not_evaluated`` so the table already
    carries the structure a later double-oracle result will fill (REQ-13.4). No
    numerical result is ever labelled exact and no bound an equilibrium (REQ-13.3).
    """
    cert = best_response.certificate
    return [
        {
            "gate": "best_response_resolver_validated",
            "status": GATE_PASS,
            "detail": (
                "value_row_payoff is the resolver-recomputed value of the returned "
                "allocation, not the optimiser's internal objective (REQ-6.2)"
            ),
        },
        {
            "gate": "best_response_optimality_certified",
            "status": GATE_PASS if cert.optimal else GATE_FAIL,
            "detail": (
                f"method={cert.method}, absolute_optimality_gap={cert.absolute_optimality_gap}, "
                f"relative_mip_gap={cert.relative_mip_gap}, solver_status={cert.solver_status}"
            ),
        },
        {
            "gate": "double_oracle_converged",
            "status": GATE_NOT_EVALUATED,
            "detail": (
                "double-oracle equilibrium certification is VS4 (out of scope for this "
                "VS3 best-response report); reserved row (REQ-13.4)"
            ),
        },
        {
            "gate": "certified_exploitability_bracket",
            "status": GATE_NOT_EVALUATED,
            "detail": (
                "the full-space exploitability gap (upper - lower) is VS4; reserved row "
                "for a later double-oracle result (REQ-13.4)"
            ),
        },
    ]


def _allocation_payload(alloc: Any) -> dict[str, Any]:
    """Serialize an :class:`~ascension_trials.schema.Allocation` deterministically.

    Config-independent (no resolver call): the raw per-Trial normal map, Wild map
    and explicit residue. Keys are emitted as-is; JSON ``sort_keys`` and the
    Markdown renderer both sort, so the output is byte-stable (NFR-1).
    """
    return {
        "player_id": alloc.player_id,
        "normal": {t: dict(doms) for t, doms in alloc.normal.items()},
        "wild": dict(alloc.wild),
        "residue_normal": dict(alloc.residue_normal),
        "residue_wild": alloc.residue_wild,
    }


def _opponent_payload(opponent: Any) -> dict[str, Any]:
    """Serialize an :class:`~ascension_trials.best_response.OpponentSpec` (design §4).

    Each support entry records the opponent allocation and its exact mixture weight
    as a reduced ``numerator/denominator`` string (plus a float rendering), so a
    reviewer can reconstruct the exact rational mixture.
    """
    return {
        "is_pure": opponent.is_pure,
        "support": [
            {
                "allocation": _allocation_payload(alloc),
                "probability": f"{prob.numerator}/{prob.denominator}",
                "probability_float": float(prob),
            }
            for alloc, prob in opponent.support
        ],
    }


def build_best_response_report(
    best_response: Any,
    context: ReportContext = ReportContext(),
    *,
    config_id: str,
    config_version: Optional[str] = None,
    player_count: int,
    state_ids: Optional[list[str]] = None,
    hard_gates: Optional[list[dict[str, Any]]] = None,
) -> dict[str, Any]:
    """Build the deterministic JSON-able VS3 best-response report (design §9; REQ-13).

    Carries the VS2-style metadata block (configuration id/version, player count,
    state ids, solver + tolerances — the solver drawn from the certificate method /
    backend / status, REQ-13.1), the best-response section (side, utility, the
    resolver-recomputed ``value_row_payoff``, the returned allocation, the opponent
    spec, and the full certificate), the extended evidence-class table (REQ-13.2)
    and the double-oracle-ready hard-gate table (REQ-13.4). No numerical result is
    labelled exact (REQ-13.3). Determinism / byte-stability follow the module
    guarantees (NFR-1): the payload is assembled from the deterministic
    ``BestResponse`` alone with sorted serialization.
    """
    cert = best_response.certificate
    md = _base_metadata(context)
    md.update(
        {
            "configuration": {"id": config_id, "version": config_version},
            "player_count": player_count,
            "state_ids": sorted(state_ids) if state_ids else [],
            "solver": {
                "name": cert.method,
                "backend": cert.proof.get("backend"),
                "status": cert.solver_status,
                "tolerances": dict(cert.tolerances),
            },
        }
    )
    return {
        "schema_version": SCHEMA_VERSION,
        "report_type": "best-response",
        "metadata": md,
        "best_response": {
            "side": best_response.side,
            "utility": best_response.utility,
            "value_row_payoff": best_response.value_row_payoff,
            "value_side_payoff": best_response.value_side_payoff,
            "evidence_class": best_response.evidence_class,
            "allocation": _allocation_payload(best_response.allocation),
            "opponent": _opponent_payload(best_response.opponent),
            "certificate": cert.to_dict(),
        },
        "evidence_class": best_response.evidence_class,
        "evidence_class_table": best_response_evidence_class_table(best_response.evidence_class),
        "hard_gate_table": (
            hard_gates if hard_gates is not None else best_response_hard_gates(best_response)
        ),
        "assumptions_and_unresolved_gates": [
            {
                "item": "double-oracle equilibrium certification (VS4)",
                "status": "not evaluated",
                "evidence_class": "design judgement",
                "note": (
                    "VS4 (certified double oracle) is out of scope for this VS3 report; "
                    "the hard-gate table carries reserved rows for it (REQ-13.4)."
                ),
            }
        ],
    }


def _md_allocation_lines(alloc: dict[str, Any]) -> list[str]:
    """Deterministic Markdown lines for a serialized allocation (sorted by Trial)."""
    lines: list[str] = []
    normal = alloc.get("normal") or {}
    if normal:
        for t in sorted(normal):
            doms = normal[t] or {}
            dom_str = ", ".join(f"{d}={doms[d]}" for d in sorted(doms)) or "none"
            lines.append(f"    - {t}: {dom_str}")
    else:
        lines.append("    - (no normal entries)")
    wild = alloc.get("wild") or {}
    if wild:
        lines.append("    - Wild: " + ", ".join(f"{t}={wild[t]}" for t in sorted(wild)))
    else:
        lines.append("    - Wild: none")
    residue = alloc.get("residue_normal") or {}
    residue_str = ", ".join(f"{d}={residue[d]}" for d in sorted(residue)) if residue else "none"
    lines.append(f"    - Residue: normal=[{residue_str}], wild={_fmt(alloc.get('residue_wild'))}")
    return lines


def _md_opponent_lines(opp: dict[str, Any]) -> list[str]:
    """Deterministic Markdown lines for a serialized opponent spec."""
    lines = [f"    - Pure: {_fmt(opp.get('is_pure'))}"]
    for entry in opp.get("support") or []:
        alloc = entry.get("allocation") or {}
        normal = alloc.get("normal") or {}
        if normal:
            totals = "; ".join(
                f"{t}:" + ",".join(f"{d}={normal[t][d]}" for d in sorted(normal[t]))
                for t in sorted(normal)
            )
        else:
            totals = "empty"
        lines.append(f"      - p={_fmt(entry.get('probability'))}: {totals}")
    return lines


def _md_best_response(report: dict[str, Any]) -> str:
    md = report.get("metadata") or {}
    cfg = md.get("configuration") or {}
    solver = md.get("solver") or {}
    br = report.get("best_response") or {}
    cert = br.get("certificate") or {}
    alloc = br.get("allocation") or {}
    opp = br.get("opponent") or {}
    tol = cert.get("tolerances") or {}
    tol_str = ", ".join(f"{k}={tol[k]}" for k in sorted(tol)) if tol else "none"

    parts: list[list[str]] = [
        ["# Ascension Trials — VS3 Best-Response Report", ""],
        [
            "## 1. Metadata and evidence class",
            "",
            f"- Configuration: {_fmt(cfg.get('id'))} (version {_fmt(cfg.get('version'))})",
            f"- Player count: {_fmt(md.get('player_count'))}",
            f"- State IDs: {_fmt(md.get('state_ids'))}",
            f"- Side: {_fmt(br.get('side'))}",
            f"- Utility: {_fmt(br.get('utility'))}",
            f"- Evidence class: {_fmt(br.get('evidence_class'))}",
            f"- Solver: {_fmt(solver.get('name'))} (backend {_fmt(solver.get('backend'))}, "
            f"status {_fmt(solver.get('status'))})",
            f"- Code revision: {_fmt(md.get('code_revision'))}",
        ],
        [
            "## 2. Best response",
            "",
            f"- Value (row-payoff, authoritative): {_fmt(br.get('value_row_payoff'))}",
            f"- Value (acting side own perspective): {_fmt(br.get('value_side_payoff'))}",
            "- Allocation:",
            *_md_allocation_lines(alloc),
            "- Opponent:",
            *_md_opponent_lines(opp),
        ],
        [
            "## 3. Certificate",
            "",
            f"- Method: {_fmt(cert.get('method'))}",
            f"- Optimal: {_fmt(cert.get('optimal'))}",
            f"- Resolver incumbent value: {_fmt(cert.get('resolver_incumbent_value'))}",
            f"- Certified objective bound (row-payoff): {_fmt(cert.get('solver_objective_bound'))}",
            f"- Absolute optimality gap: {_fmt(cert.get('absolute_optimality_gap'))}",
            f"- Relative MIP gap: {_fmt(cert.get('relative_mip_gap'))}",
            f"- Solver status: {_fmt(cert.get('solver_status'))}",
            f"- Tolerances: {tol_str}",
        ],
        _md_evidence_class(report),
        _md_assumptions(report),
    ]
    return _join_sections(parts)
