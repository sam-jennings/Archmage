"""Deterministic command-line interface (design §13.3; REQ-14, REQ-15, NFR-1).

``python -m ascension_trials <command>`` drives the VS1 kernel and emits the
deterministic JSON / Markdown reports formatted by :mod:`ascension_trials.reports`.

Commands (design §13.3):

  * ``validate-config <path>`` — validate a configuration document via
    :func:`config_loader.validate_config_document` and report errors / warnings.
  * ``resolve --config <path> --fixture <path>`` — resolve a fixed profile
    (states + allocations) and emit its report.
  * ``run-fixture <A-id>`` — load a committed VS1 fixture and resolve / verify it.
  * ``report-fixtures --format json,md`` — run the resolvable VS1 fixtures, emit a
    report for each, and emit the VS1 fixture-library index (all committed fixtures
    with their oracle / evidence-class labels).
  * ``analyse-small`` — VS2 small-state exact laboratory: enumerate every legal
    allocation, collapse strategically-equivalent strategies, build the payoff
    matrix, solve the zero-sum LP and canonical maximum-entropy equilibrium, and
    emit the deterministic small-state report.

This module orchestrates (loads data, drives derivation / resolution) and delegates
all formatting to :mod:`reports`; it holds no game-theoretic logic itself. Generated
files are written under the git-ignored ``outputs/`` directory by default (REQ-15.4).
Determinism (NFR-1): nothing here reads the wall clock; a timestamp or code revision
appears in a report only when passed via ``--code-revision`` / an injected context.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Optional

from . import reports
from .config_loader import (
    allocation_from_dict,
    config_from_dict,
    load_configuration,
    spellbook_from_dict,
    state_from_dict,
    validate_config_document,
)
from .power import derive_player_state
from .reports import ReportContext
from .resolver import ResolutionResult, resolve_profile
from .schema import Allocation
from .scoring import independent_score, load_scoring_reference

# Committed VS1 fixture library (REQ-9.2): A-id -> path relative to the package root.
FIXTURE_FILES: dict[str, str] = {
    "A1": "fixtures/adversarial/a1_mirror_tie.json",
    "A2": "fixtures/adversarial/a2_domain_relabel.json",
    "A7": "fixtures/adversarial/a7_monotonicity_trap.json",
    "A8": "fixtures/adversarial/a8_infeasible_fullness.json",
    "A9": "fixtures/adversarial/a9_penny_squat.json",
    "A10": "fixtures/adversarial/a10_wild_legality.json",
    "A11": "fixtures/adversarial/a11_overallocation.json",
    "A12": "fixtures/adversarial/a12_tiebreak_cascade.json",
    "A16": "fixtures/worked_examples/a16_maya_worked_example.json",
    "A17": "fixtures/worked_examples/a17_formula_comparison.json",
}

# Fixtures this CLI can drive to a single ResolutionResult (self-contained profiles
# plus the A16 Maya derivation). The remaining fixtures are multi-case / derivation
# scenarios verified via the pytest acceptance suite, not resolvable as one profile.
RESOLVABLE_FIXTURES: tuple[str, ...] = ("A1", "A2", "A9", "A16")


# --------------------------------------------------------------------------- #
# Paths                                                                        #
# --------------------------------------------------------------------------- #


def package_root() -> Path:
    """The ``ascension-trials/ascension_trials_model`` package root (holds fixtures/configs/outputs)."""
    return Path(__file__).resolve().parents[2]


def default_output_dir() -> Path:
    """The git-ignored ``outputs/`` directory generated reports go to (REQ-15.4)."""
    return package_root() / "outputs"


def _load_json(path: str | Path) -> dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


# --------------------------------------------------------------------------- #
# Fixture running (orchestration only; formatting lives in reports.py)         #
# --------------------------------------------------------------------------- #


def _resolve_self_contained(fx: dict) -> ResolutionResult:
    """Resolve a fixture that bundles its own config, states and allocations."""
    config = config_from_dict(fx["config"])
    states = {pid: state_from_dict(raw) for pid, raw in fx["states"].items()}
    allocations = {pid: allocation_from_dict(raw) for pid, raw in fx["allocations"].items()}
    return resolve_profile(config, states, allocations, player_count=fx.get("player_count"))


def _resolve_a16_maya(root: Path) -> ResolutionResult:
    """Drive the A16 Maya worked example end-to-end from its data files.

    Derives F_C(S) from the Maya Spellbook against the committed
    ``configs/hybrid_rebuild.json`` (attaching q(S) from the current scoring
    reference so the report carries full provenance), builds her source-backed
    three-Trial allocation from the fixture's ``expected`` block, and resolves it
    at 5 players — mirroring the A16 acceptance test.
    """
    worked = root / "fixtures" / "worked_examples"
    fx = _load_json(worked / "a16_maya_worked_example.json")
    spellbook = spellbook_from_dict(_load_json(worked / fx["spellbook_ref"]))
    config = load_configuration(root / "configs" / "hybrid_rebuild.json")
    reference = load_scoring_reference()
    q = independent_score(spellbook, reference)
    maya = derive_player_state(spellbook, config, independent_score=q, player_id="maya")
    exp = fx["expected"]
    allocation = Allocation(
        player_id="maya",
        normal={trial: dict(entry["normal"]) for trial, entry in exp["allocation"].items()},
        wild={trial: entry["wild"] for trial, entry in exp["allocation"].items() if entry.get("wild")},
    )
    return resolve_profile(config, {"maya": maya}, {"maya": allocation}, player_count=fx["player_count"])


def run_fixture_result(fixture_id: str, root: Optional[Path] = None) -> ResolutionResult:
    """Resolve one committed fixture to a ResolutionResult.

    Raises ``KeyError`` for an unknown id and ``ValueError`` for a committed
    fixture that is not resolvable as a single profile (multi-case / derivation).
    """
    root = root or package_root()
    if fixture_id == "A16":
        return _resolve_a16_maya(root)
    rel = FIXTURE_FILES.get(fixture_id)
    if rel is None:
        raise KeyError(fixture_id)
    fx = _load_json(root / rel)
    if all(key in fx for key in ("config", "states", "allocations")):
        return _resolve_self_contained(fx)
    raise ValueError(
        f"{fixture_id} is a multi-case / derivation fixture; it is verified by the "
        "pytest acceptance suite, not resolvable as a single profile here"
    )


def _fixture_index_entries(root: Path, resolved: dict[str, str]) -> list[dict]:
    """Summaries of every committed fixture, labelling each with its oracle metadata.

    ``resolved`` maps the ids the CLI resolved to their audit hash; the rest are
    labelled as pytest-verified multi-case / derivation fixtures.
    """
    entries = []
    for fixture_id, rel in FIXTURE_FILES.items():
        fx = _load_json(root / rel)
        oracle = fx.get("oracle") or {}
        entry = {
            "id": fixture_id,
            "name": fx.get("name"),
            "source": oracle.get("source"),
            "evidence_class": oracle.get("evidence_class"),
            "independent_of_implementation": oracle.get("independent_of_implementation"),
            "resolved": fixture_id in resolved,
        }
        if fixture_id in resolved:
            entry["audit_hash"] = resolved[fixture_id]
        else:
            entry["note"] = (
                "multi-case / derivation fixture; verified via the pytest acceptance "
                "suite, not resolved as a single profile by this command"
            )
        entries.append(entry)
    return entries


# --------------------------------------------------------------------------- #
# Output helpers                                                               #
# --------------------------------------------------------------------------- #


def parse_formats(raw: str) -> list[str]:
    """Parse a ``--format`` value like ``"json,md"`` into a validated, ordered list."""
    formats = [f.strip().lower() for f in raw.split(",") if f.strip()]
    unknown = [f for f in formats if f not in ("json", "md")]
    if unknown:
        raise ValueError(f"unknown report format(s): {unknown} (allowed: json, md)")
    # De-duplicate while keeping json before md for stable output.
    ordered = [f for f in ("json", "md") if f in formats]
    return ordered or ["json", "md"]


def write_report(report: dict, out_dir: Path, basename: str, formats: list[str]) -> list[Path]:
    """Write ``report`` to ``out_dir/basename.{json,md}`` for each requested format."""
    out_dir.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []
    for fmt in formats:
        if fmt == "json":
            text = reports.render_json(report)
            path = out_dir / f"{basename}.json"
        else:
            text = reports.render_markdown(report)
            path = out_dir / f"{basename}.md"
        # newline="" keeps the '\n' the renderers emit; no platform CRLF rewrite (NFR-1).
        path.write_text(text, encoding="utf-8", newline="")
        written.append(path)
    return written


# --------------------------------------------------------------------------- #
# Commands                                                                     #
# --------------------------------------------------------------------------- #


def _cmd_validate_config(args: argparse.Namespace, context: ReportContext) -> int:
    raw = _load_json(args.path)
    result = validate_config_document(raw)
    config_id = raw.get("id") if isinstance(raw, dict) else None

    print(f"validate-config: {args.path}")
    print(f"  result: {'VALID' if result.valid else 'INVALID'}")
    print(f"  errors ({len(result.errors)}):")
    for err in result.errors:
        print(f"    - {err}")
    print(f"  warnings ({len(result.warnings)}):")
    for warn in result.warnings:
        print(f"    - {warn}")

    if args.out is not None:
        formats = parse_formats(args.format)
        report = reports.build_validation_report(
            config_id, result, context, source=str(args.path)
        )
        written = write_report(report, Path(args.out), f"validate_{config_id or 'config'}", formats)
        for path in written:
            print(f"  wrote {path}")

    return 0 if result.valid else 1


def _emit_resolution(
    result: ResolutionResult,
    context: ReportContext,
    out_dir: Path,
    basename: str,
    formats: list[str],
    *,
    fixture_id: Optional[str] = None,
) -> None:
    report = reports.build_resolution_report(result, context, fixture_id=fixture_id)
    written = write_report(report, out_dir, basename, formats)
    print(f"  valid: {result.validation.valid}")
    print(f"  audit hash: {result.deterministic_hash}")
    for path in written:
        print(f"  wrote {path}")


def _cmd_resolve(args: argparse.Namespace, context: ReportContext) -> int:
    fx = _load_json(args.fixture)
    if args.config:
        config = load_configuration(args.config)
    elif isinstance(fx.get("config"), dict):
        config = config_from_dict(fx["config"])
    else:
        print(
            "resolve: no configuration found — pass --config or embed a 'config' "
            "block in the fixture",
            file=sys.stderr,
        )
        return 2

    states = {pid: state_from_dict(raw) for pid, raw in (fx.get("states") or {}).items()}
    allocations = {
        pid: allocation_from_dict(raw) for pid, raw in (fx.get("allocations") or {}).items()
    }
    result = resolve_profile(config, states, allocations, player_count=fx.get("player_count"))

    formats = parse_formats(args.format)
    out_dir = Path(args.out) if args.out else default_output_dir()
    fixture_id = fx.get("id")
    basename = f"resolve_{fixture_id or config.id}"
    print(f"resolve: config={config.id}, fixture={args.fixture}")
    _emit_resolution(result, context, out_dir, basename, formats, fixture_id=fixture_id)
    return 0


def _cmd_run_fixture(args: argparse.Namespace, context: ReportContext) -> int:
    fixture_id = args.fixture_id
    root = package_root()
    if fixture_id not in FIXTURE_FILES:
        print(
            f"run-fixture: unknown fixture id {fixture_id!r} "
            f"(known: {', '.join(sorted(FIXTURE_FILES))})",
            file=sys.stderr,
        )
        return 2
    try:
        result = run_fixture_result(fixture_id, root)
    except ValueError as exc:
        print(f"run-fixture: {exc}", file=sys.stderr)
        return 2

    formats = parse_formats(args.format)
    out_dir = Path(args.out) if args.out else default_output_dir()
    print(f"run-fixture: {fixture_id}")
    _emit_resolution(
        result, context, out_dir, f"run_fixture_{fixture_id}", formats, fixture_id=fixture_id
    )
    return 0


def _cmd_report_fixtures(args: argparse.Namespace, context: ReportContext) -> int:
    root = package_root()
    formats = parse_formats(args.format)
    out_dir = Path(args.out) if args.out else default_output_dir()

    resolved: dict[str, str] = {}
    print("report-fixtures: resolving VS1 fixtures")
    for fixture_id in RESOLVABLE_FIXTURES:
        result = run_fixture_result(fixture_id, root)
        report = reports.build_resolution_report(result, context, fixture_id=fixture_id)
        write_report(report, out_dir, f"report_fixture_{fixture_id}", formats)
        resolved[fixture_id] = result.deterministic_hash
        print(f"  {fixture_id}: valid={result.validation.valid} hash={result.deterministic_hash}")

    entries = _fixture_index_entries(root, resolved)
    index = reports.build_fixture_index_report(entries, context)
    written = write_report(index, out_dir, "report_fixtures_index", formats)
    for path in written:
        print(f"  wrote index {path}")
    print(f"  resolved {len(resolved)}/{len(FIXTURE_FILES)} fixtures; indexed all {len(entries)}")
    return 0


def _cmd_analyse_small(args: argparse.Namespace, context: ReportContext) -> int:
    """VS2 small-state analysis: enumerate, collapse, solve and report (design §13.3).

    Loads a configuration and one or two player-state JSON files, runs the exact
    laboratory (:func:`metrics.compute_small_state_metrics`) and writes the
    deterministic small-state report. Refuses over-ceiling states explicitly rather
    than sampling (NFR-4).
    """
    from .enumerate import EnumerationLimitError
    from .matrix import MatrixLimitError
    from .metrics import compute_small_state_metrics

    if not args.config or not args.state_a:
        print(
            "analyse-small: --config and --state-a are required",
            file=sys.stderr,
        )
        return 2
    config = load_configuration(args.config)
    state_a = state_from_dict(_load_json(args.state_a))
    state_b = state_from_dict(_load_json(args.state_b)) if args.state_b else None
    player_count = args.player_count

    try:
        metrics = compute_small_state_metrics(
            config, state_a, state_b, player_count=player_count
        )
    except (EnumerationLimitError, MatrixLimitError) as exc:
        print(f"analyse-small: refused (exact ceiling exceeded) — {exc}", file=sys.stderr)
        return 2

    state_ids = [state_a.player_id] + ([state_b.player_id] if state_b else [])
    report = reports.build_small_state_report(
        metrics, context, config_version=config.version, state_ids=state_ids
    )
    formats = parse_formats(args.format)
    out_dir = Path(args.out) if args.out else default_output_dir()
    written = write_report(report, out_dir, f"analyse_small_{config.id}", formats)
    print(f"analyse-small: config={config.id}, player_count={player_count}")
    print(f"  legal={metrics.legal_count_a} collapsed={metrics.collapsed_class_count} "
          f"|R|={metrics.reasonable_set_size} |E^0.01|={metrics.equilibrium_relevant_size}")
    print(f"  win value={metrics.win_value} margin value={metrics.margin_value}")
    for path in written:
        print(f"  wrote {path}")
    return 0


# --------------------------------------------------------------------------- #
# VS3 commands: best-response and analyse-asymmetric (design §9; REQ-13, REQ-14) #
# --------------------------------------------------------------------------- #

# Opponent-spec input format for ``best-response --opponent <path>``.
#
# The opponent is the *opposing* side's fixed strategy (a pure allocation or a
# mixture). It is supplied as a small JSON document; two equivalent ways to name an
# allocation are accepted, so toy single-domain configs stay terse while arbitrary
# configs remain expressible:
#
#   * ``"allocation"`` — a full allocation object (the same schema the ``resolve``
#     command accepts: ``{"normal": {trial: {domain: n}}, "wild": {trial: n}}``;
#     ``player_id`` optional — the oracle re-seats it onto the opposing seat).
#   * ``"normal_totals"`` — a compact per-active-Trial total list (e.g. ``[1, 0]``)
#     resolved against the opponent's enumerated legal allocations (single-domain
#     convenience; matches :func:`enumerate.find_allocation_by_normal_totals`).
#
# Pure:     {"type": "pure", "normal_totals": [1, 0]}
# Mixture:  {"type": "mixture", "support": [
#              {"normal_totals": [1, 0], "probability": "1/2"},
#              {"allocation": {"normal": {"trial_b": {"fungible": 1}}}, "probability": 0.5}
#           ]}
# Probabilities may be integers, floats or "num/den" strings; they are normalised
# to sum to one (exact rational arithmetic downstream).


def _coerce_probability(value):
    """Coerce a spec probability to a value :class:`OpponentSpec` accepts.

    JSON has no rational type, so a ``"num/den"`` (or decimal) *string* is parsed
    to an exact :class:`fractions.Fraction`; ints / floats pass through unchanged
    (``OpponentSpec.mixture`` coerces those itself, normalising the mixture to sum
    to one).
    """
    from fractions import Fraction

    if isinstance(value, str):
        return Fraction(value)
    return value


def _opponent_alloc_from_entry(
    entry: dict,
    config,
    opp_seat: str,
    player_count: int,
    opp_allocs: list,
):
    """Build one opponent allocation from a spec entry, seated on ``opp_seat``."""
    import dataclasses

    from .enumerate import find_allocation_by_normal_totals

    if "allocation" in entry:
        raw = dict(entry["allocation"])
        raw.setdefault("player_id", opp_seat)
        alloc = allocation_from_dict(raw)
        return dataclasses.replace(alloc, player_id=opp_seat)
    if "normal_totals" in entry:
        totals = tuple(int(x) for x in entry["normal_totals"])
        found = find_allocation_by_normal_totals(config, opp_allocs, totals, player_count)
        if found is None:
            raise ValueError(
                f"no legal opponent allocation with per-Trial normal totals {list(totals)}"
            )
        return found
    raise ValueError("each opponent entry must have an 'allocation' or 'normal_totals' field")


def _load_opponent_spec(raw: dict, config, opp_state, opp_seat: str, player_count: int):
    """Parse the ``--opponent`` JSON into an :class:`OpponentSpec` (design §4)."""
    from .best_response import OpponentSpec
    from .enumerate import enumerate_allocations

    if not isinstance(raw, dict):
        raise ValueError("opponent spec must be a JSON object")
    opp_allocs = enumerate_allocations(config, opp_state, player_count)
    kind = raw.get("type", "pure")
    if kind == "pure":
        alloc = _opponent_alloc_from_entry(raw, config, opp_seat, player_count, opp_allocs)
        return OpponentSpec.pure(alloc)
    if kind == "mixture":
        entries = raw.get("support") or []
        if not entries:
            raise ValueError("opponent mixture needs a non-empty 'support' list")
        pairs = [
            (
                _opponent_alloc_from_entry(e, config, opp_seat, player_count, opp_allocs),
                _coerce_probability(e.get("probability", 1)),
            )
            for e in entries
        ]
        return OpponentSpec.mixture(pairs)
    raise ValueError(f"unknown opponent type {kind!r} (expected 'pure' or 'mixture')")


def _cmd_best_response(args: argparse.Namespace, context: ReportContext) -> int:
    """VS3 exact best-response oracle for one side and utility (design §9; REQ-13).

    Loads the configuration and both player states (seating A as the row player and
    B as the column player), loads the opponent spec, runs the resolver-validated
    best-response oracle and writes the deterministic best-response report. A result
    is emitted only when it is proven / certified: a
    :class:`~ascension_trials.best_response.NonOptimalBestResponseError` or
    :class:`~ascension_trials.best_response.BestResponseValidationError` exits
    non-zero with a message to stderr and writes no report (REQ-6, NFR-4).
    """
    import dataclasses

    from .best_response import (
        BestResponseValidationError,
        NonOptimalBestResponseError,
        best_response,
    )
    from .matrix import COL_PLAYER, ROW_PLAYER

    if not args.config or not args.state_a or not args.opponent:
        print(
            "best-response: --config, --state-a and --opponent are required",
            file=sys.stderr,
        )
        return 2

    config = load_configuration(args.config)
    raw_a = state_from_dict(_load_json(args.state_a))
    raw_b = state_from_dict(_load_json(args.state_b)) if args.state_b else raw_a
    # Seat A as the row player and B as the column player (best_response reads the
    # states keyed by seat "A"/"B"; the resolver seats them the same way).
    state_a = dataclasses.replace(raw_a, player_id=ROW_PLAYER)
    state_b = dataclasses.replace(raw_b, player_id=COL_PLAYER)
    states = {ROW_PLAYER: state_a, COL_PLAYER: state_b}
    player_count = args.player_count
    side = args.side
    utility = args.utility

    # The opponent is the opposing side's strategy: for a row BR it is the column
    # player (B); for a column BR it is the row player (A).
    if side == "row":
        opp_state, opp_seat = state_b, COL_PLAYER
    else:
        opp_state, opp_seat = state_a, ROW_PLAYER
    try:
        opponent = _load_opponent_spec(
            _load_json(args.opponent), config, opp_state, opp_seat, player_count
        )
    except (ValueError, KeyError, TypeError) as exc:
        print(f"best-response: invalid opponent spec — {exc}", file=sys.stderr)
        return 2

    kwargs = {"method": args.method, "player_count": player_count}
    if args.max_allocations is not None:
        kwargs["max_allocations"] = args.max_allocations
    try:
        result = best_response(config, states, side, utility, opponent, **kwargs)
    except (NonOptimalBestResponseError, BestResponseValidationError) as exc:
        # Never emit an unproven / unvalidated result (REQ-6, NFR-4).
        print(f"best-response: no proven result — {exc}", file=sys.stderr)
        return 1

    report = reports.build_best_response_report(
        result,
        context,
        config_id=config.id,
        config_version=config.version,
        player_count=player_count,
        state_ids=[state_a.player_id, state_b.player_id],
    )
    formats = parse_formats(args.format)
    out_dir = Path(args.out) if args.out else default_output_dir()
    basename = f"best_response_{config.id}_{side}_{utility}"
    written = write_report(report, out_dir, basename, formats)
    print(f"best-response: config={config.id}, side={side}, utility={utility}")
    print(
        f"  evidence_class={result.evidence_class} value_row_payoff={result.value_row_payoff} "
        f"optimal={result.certificate.optimal} method={result.certificate.method}"
    )
    for path in written:
        print(f"  wrote {path}")
    return 0


def _cmd_analyse_asymmetric(args: argparse.Namespace, context: ReportContext) -> int:
    """VS3 asymmetric (unequal-state) small-state analysis (design §9; REQ-13, REQ-14).

    Like ``analyse-small`` but requires two genuinely-unequal states A and B. Reuses
    :func:`metrics.compute_small_state_metrics` (which already routes unequal states
    through the rectangular path) and emits the asymmetric small-state report:
    per-side counts, per-side E^0.01, ``not_applicable`` counterability and a
    coherent hard-gate table (the equal-state counterability gates marked
    ``not_evaluated`` rather than crashing — REQ-3.3, REQ-13.4). Over-ceiling states
    are refused explicitly, never sampled (NFR-4).
    """
    from .enumerate import EnumerationLimitError
    from .matrix import MatrixLimitError
    from .metrics import compute_small_state_metrics

    if not args.config or not args.state_a or not args.state_b:
        print(
            "analyse-asymmetric: --config, --state-a and --state-b are required",
            file=sys.stderr,
        )
        return 2

    config = load_configuration(args.config)
    state_a = state_from_dict(_load_json(args.state_a))
    state_b = state_from_dict(_load_json(args.state_b))
    player_count = args.player_count

    try:
        metrics = compute_small_state_metrics(
            config, state_a, state_b, player_count=player_count
        )
    except (EnumerationLimitError, MatrixLimitError) as exc:
        print(f"analyse-asymmetric: refused (exact ceiling exceeded) — {exc}", file=sys.stderr)
        return 2

    state_ids = [state_a.player_id, state_b.player_id]
    report = reports.build_small_state_report(
        metrics, context, config_version=config.version, state_ids=state_ids
    )
    formats = parse_formats(args.format)
    out_dir = Path(args.out) if args.out else default_output_dir()
    written = write_report(report, out_dir, f"analyse_asymmetric_{config.id}", formats)
    print(
        f"analyse-asymmetric: config={config.id}, player_count={player_count}, "
        f"parity={metrics.parity}"
    )
    print(
        f"  legal A={metrics.legal_count_a} B={metrics.legal_count_b} "
        f"win value={metrics.win_value} margin value={metrics.margin_value}"
    )
    for path in written:
        print(f"  wrote {path}")
    return 0


# --------------------------------------------------------------------------- #
# Argument parsing / entry point                                              #
# --------------------------------------------------------------------------- #


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="ascension_trials",
        description="Deterministic Ascension Trials configuration analysis (VS1).",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # Options shared by every command (kept deterministic: nothing auto-filled).
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument(
        "--code-revision",
        default=None,
        help="Code revision to record in report metadata (REQ-14.2). Omitted => null.",
    )

    p_validate = sub.add_parser(
        "validate-config", parents=[common], help="Validate a configuration document."
    )
    p_validate.add_argument("path", help="Path to the configuration JSON file.")
    p_validate.add_argument("--format", default="json,md", help="Report format(s): json,md.")
    p_validate.add_argument(
        "--out", default=None, help="Output directory for the validation report (optional)."
    )
    p_validate.set_defaults(func=_cmd_validate_config)

    p_resolve = sub.add_parser(
        "resolve", parents=[common], help="Resolve a fixed profile and emit its report."
    )
    p_resolve.add_argument("--config", default=None, help="Configuration JSON path (optional if embedded).")
    p_resolve.add_argument("--fixture", required=True, help="Profile fixture JSON path.")
    p_resolve.add_argument("--format", default="json,md", help="Report format(s): json,md.")
    p_resolve.add_argument("--out", default=None, help="Output directory (default: outputs/).")
    p_resolve.set_defaults(func=_cmd_resolve)

    p_run = sub.add_parser(
        "run-fixture", parents=[common], help="Resolve/verify a committed VS1 fixture by id."
    )
    p_run.add_argument("fixture_id", help="Fixture id, e.g. A16.")
    p_run.add_argument("--format", default="json,md", help="Report format(s): json,md.")
    p_run.add_argument("--out", default=None, help="Output directory (default: outputs/).")
    p_run.set_defaults(func=_cmd_run_fixture)

    p_report = sub.add_parser(
        "report-fixtures",
        parents=[common],
        help="Run the VS1 fixtures and emit reports + a library index.",
    )
    p_report.add_argument("--format", default="json,md", help="Report format(s): json,md.")
    p_report.add_argument("--out", default=None, help="Output directory (default: outputs/).")
    p_report.set_defaults(func=_cmd_report_fixtures)

    p_analyse = sub.add_parser(
        "analyse-small", parents=[common], help="VS2 small-state exact-laboratory analysis."
    )
    p_analyse.add_argument("--config", default=None, help="Configuration JSON path.")
    p_analyse.add_argument("--state-a", default=None, help="Player A state JSON path.")
    p_analyse.add_argument(
        "--state-b", default=None, help="Player B state JSON path (default: same as A)."
    )
    p_analyse.add_argument("--player-count", type=int, default=2, help="Player count (default 2).")
    p_analyse.add_argument("--format", default="json,md", help="Report format(s): json,md.")
    p_analyse.add_argument("--out", default=None, help="Output directory (default: outputs/).")
    p_analyse.set_defaults(func=_cmd_analyse_small)

    p_br = sub.add_parser(
        "best-response",
        parents=[common],
        help="VS3 exact best-response oracle for one side/utility.",
    )
    p_br.add_argument("--config", default=None, help="Configuration JSON path.")
    p_br.add_argument("--state-a", default=None, help="Player A (row) state JSON path.")
    p_br.add_argument(
        "--state-b", default=None, help="Player B (column) state JSON path (default: same as A)."
    )
    p_br.add_argument(
        "--side", choices=["row", "column"], default="row", help="Acting side (default: row)."
    )
    p_br.add_argument(
        "--utility", choices=["win", "margin"], default="win", help="Utility (default: win)."
    )
    p_br.add_argument(
        "--opponent",
        default=None,
        help="Opponent spec JSON path (pure allocation or mixture; see cli.py docstring).",
    )
    p_br.add_argument(
        "--method",
        choices=["auto", "dp", "milp", "exhaustive"],
        default="auto",
        help="Oracle method (default: auto).",
    )
    p_br.add_argument("--player-count", type=int, default=2, help="Player count (default 2).")
    p_br.add_argument(
        "--max-allocations",
        type=int,
        default=None,
        help="Enumeration ceiling for the exhaustive path (default: module default).",
    )
    p_br.add_argument("--format", default="json,md", help="Report format(s): json,md.")
    p_br.add_argument("--out", default=None, help="Output directory (default: outputs/).")
    p_br.set_defaults(func=_cmd_best_response)

    p_asym = sub.add_parser(
        "analyse-asymmetric",
        parents=[common],
        help="VS3 asymmetric (unequal-state) small-state analysis.",
    )
    p_asym.add_argument("--config", default=None, help="Configuration JSON path.")
    p_asym.add_argument("--state-a", default=None, help="Player A state JSON path.")
    p_asym.add_argument("--state-b", default=None, help="Player B state JSON path (unequal to A).")
    p_asym.add_argument("--player-count", type=int, default=2, help="Player count (default 2).")
    p_asym.add_argument("--format", default="json,md", help="Report format(s): json,md.")
    p_asym.add_argument("--out", default=None, help="Output directory (default: outputs/).")
    p_asym.set_defaults(func=_cmd_analyse_asymmetric)

    return parser


def main(argv: Optional[list[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    context = ReportContext(code_revision=getattr(args, "code_revision", None))
    return args.func(args, context)


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
