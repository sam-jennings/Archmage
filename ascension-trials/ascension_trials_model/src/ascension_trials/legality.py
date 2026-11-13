"""Allocation legality: ledger reconciliation, entry legality and completion.

Implements the allocation-validation and completion semantics of REQ-4 and the
resolver's ledger/completion steps (design 7.3, 7.6; impl spec 7, 8):

  * ledger reconciliation for every normal domain and Wild, with the invariant
    ``allocated + residue = available`` and non-negative integers (REQ-4.2/4.3),
    recording exact discrepancies and NEVER clipping over-allocation (REQ-4.7);
  * the three completion policies OPTIONAL / MAXIMAL / FULL (REQ-4.4);
  * maximality as "no residual unit can be legally added to an active Trial"
    (REQ-4.5), proved by exhibiting a legal destination Trial when a claimed
    maximal allocation is in fact non-maximal (design 7.6);
  * the explicit infeasible-FULL fallback ``reject`` / ``residue`` (REQ-4.6).

Pure and deterministic: it reads only the configuration, the player state and
the allocation. Over-allocation *policy* (which entries to invalidate) and the
Wild-over-allocation response belong to the resolver's invalidation step and are
out of scope here; this module only records the discrepancies exactly.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from .eligibility import evaluate_entry
from .schema import Allocation, Configuration, PlayerState, Trial

WILD = "wild"


# --------------------------------------------------------------------------- #
# Ledger reconciliation (REQ-4.2, 4.3, 4.7; design 7.3)                        #
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class LedgerLine:
    """One source's ledger: ``allocated + residue == available`` by construction.

    ``residue`` is ``available - allocated`` and may be negative; a negative
    residue is an *over-allocation* and is recorded, never clipped (REQ-4.7).
    """

    source: str  # domain id, or ``"wild"``
    available: int
    allocated: int
    declared_residue: Optional[int] = None  # residue stated on the allocation, if any

    @property
    def residue(self) -> int:
        return self.available - self.allocated

    @property
    def overallocation(self) -> int:
        """Units allocated beyond what is available (0 when within budget)."""
        return max(0, self.allocated - self.available)

    @property
    def identity_holds(self) -> bool:
        """The conservation identity ``allocated + residue == available`` (REQ-4.3)."""
        return self.allocated + self.residue == self.available

    @property
    def nonnegative(self) -> bool:
        """All three quantities are non-negative integers (REQ-4.2)."""
        return self.available >= 0 and self.allocated >= 0 and self.residue >= 0

    @property
    def balanced(self) -> bool:
        """A legal ledger line: identity holds, everything non-negative, and any
        explicitly declared residue matches the computed residue."""
        if not (self.identity_holds and self.nonnegative):
            return False
        return self.declared_residue is None or self.declared_residue == self.residue


@dataclass(frozen=True)
class LedgerDiscrepancy:
    """An exact, recorded reconciliation problem (never silently repaired)."""

    source: str
    kind: str  # "over_allocation" | "declared_residue_mismatch" | "negative_value"
    available: int
    allocated: int
    computed_residue: int
    declared_residue: Optional[int]
    detail: str


@dataclass
class LedgerReconciliation:
    player_id: str
    normal: dict[str, LedgerLine] = field(default_factory=dict)
    wild: Optional[LedgerLine] = None
    discrepancies: list[LedgerDiscrepancy] = field(default_factory=list)

    @property
    def balanced(self) -> bool:
        lines = list(self.normal.values()) + ([self.wild] if self.wild else [])
        return not self.discrepancies and all(line.balanced for line in lines)

    def overallocated_domains(self) -> dict[str, int]:
        return {d: line.overallocation for d, line in self.normal.items() if line.overallocation}

    @property
    def overallocated_wild(self) -> int:
        return self.wild.overallocation if self.wild else 0

    def positive_normal_residue(self) -> dict[str, int]:
        """Domains that still have unallocated (addable) units."""
        return {d: line.residue for d, line in self.normal.items() if line.residue > 0}

    def normal_residue_total(self) -> int:
        return sum(r for r in self.positive_normal_residue().values())

    @property
    def wild_residue(self) -> int:
        return max(self.wild.residue, 0) if self.wild else 0


def _allocated_by_domain(allocation: Allocation) -> dict[str, int]:
    totals: dict[str, int] = {}
    for entry in allocation.normal.values():
        for dom, power in entry.items():
            totals[dom] = totals.get(dom, 0) + power
    return totals


def reconcile_ledgers(
    state: PlayerState, allocation: Allocation, config: Configuration
) -> LedgerReconciliation:
    """Reconcile every normal-domain and Wild ledger exactly (REQ-4.2, 4.3, 4.7).

    Residue is computed as ``available - allocated`` so the conservation identity
    always holds; over-allocation surfaces as a negative residue recorded in
    ``discrepancies`` (never clipped). Any residue explicitly declared on the
    allocation is cross-checked against the computed residue.
    """
    recon = LedgerReconciliation(player_id=allocation.player_id)
    allocated = _allocated_by_domain(allocation)
    domain_ids = {d.id for d in config.domains}
    all_domains = sorted(domain_ids | set(state.normal_power) | set(allocated))

    for dom in all_domains:
        available = state.normal_power.get(dom, 0)
        used = allocated.get(dom, 0)
        declared = allocation.residue_normal.get(dom) if allocation.residue_normal else None
        line = LedgerLine(source=dom, available=available, allocated=used, declared_residue=declared)
        recon.normal[dom] = line
        _record_line_discrepancies(recon, line)

    wild_available = state.wild_power
    wild_used = sum(allocation.wild.values())
    wild_line = LedgerLine(
        source=WILD,
        available=wild_available,
        allocated=wild_used,
        declared_residue=allocation.residue_wild if allocation.residue_wild else None,
    )
    recon.wild = wild_line
    _record_line_discrepancies(recon, wild_line)
    return recon


def _record_line_discrepancies(recon: LedgerReconciliation, line: LedgerLine) -> None:
    if line.available < 0 or line.allocated < 0:
        recon.discrepancies.append(
            LedgerDiscrepancy(
                source=line.source,
                kind="negative_value",
                available=line.available,
                allocated=line.allocated,
                computed_residue=line.residue,
                declared_residue=line.declared_residue,
                detail=(
                    f"{line.source}: negative ledger value "
                    f"(available={line.available}, allocated={line.allocated})"
                ),
            )
        )
    if line.overallocation:
        recon.discrepancies.append(
            LedgerDiscrepancy(
                source=line.source,
                kind="over_allocation",
                available=line.available,
                allocated=line.allocated,
                computed_residue=line.residue,
                declared_residue=line.declared_residue,
                detail=(
                    f"{line.source}: over-allocated by {line.overallocation} "
                    f"(allocated {line.allocated} > available {line.available}); not clipped"
                ),
            )
        )
    if line.declared_residue is not None and line.declared_residue != line.residue:
        recon.discrepancies.append(
            LedgerDiscrepancy(
                source=line.source,
                kind="declared_residue_mismatch",
                available=line.available,
                allocated=line.allocated,
                computed_residue=line.residue,
                declared_residue=line.declared_residue,
                detail=(
                    f"{line.source}: declared residue {line.declared_residue} "
                    f"!= computed residue {line.residue}"
                ),
            )
        )


# --------------------------------------------------------------------------- #
# Entry legality (design 7.5; impl spec 7.3) — shared with the resolver        #
# --------------------------------------------------------------------------- #


def entry_is_legal(
    config: Configuration,
    trial: Trial,
    normal_entry: dict[str, int],
    player_count: Optional[int] = None,
    wild: int = 0,
) -> tuple[bool, Optional[str]]:
    """Is ``normal_entry`` (with attached ``wild``) a legal entry on ``trial``?

    Combines the active-Trial check, the declarative source predicate
    (:func:`eligibility.evaluate_entry`), the entry floor, and the Wild rule that
    Wild may not enter without a legal normal source. Returns ``(True, None)``
    when legal, else ``(False, reason)``. ``player_count is None`` skips the
    active-Trial check (treat the Trial as a candidate destination regardless).
    """
    if player_count is not None and not trial.is_active(player_count):
        return (False, "inactive_trial")

    legal, reasons = evaluate_entry(config, trial, normal_entry)
    if not legal:
        return (False, "illegal_entry:" + "; ".join(reasons))

    normal_total = sum(power for power in normal_entry.values() if power > 0)
    floor = trial.entry_floor
    if floor.value > 0 and normal_total > 0:
        measure = normal_total + (wild if floor.scope == "total" else 0)
        if measure < floor.value:
            return (False, f"below_entry_floor:{measure}<{floor.value}")

    if wild > 0 and config.wild.requires_legal_normal_entry and normal_total == 0:
        return (False, "wild_without_normal")

    return (True, None)


# --------------------------------------------------------------------------- #
# Maximality proof (REQ-4.5; design 7.6)                                       #
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class MaximalityWitness:
    """A legal destination proving an allocation is NOT maximal (design 7.6).

    ``kind`` is ``"normal"`` (a residual unit of ``domain`` can be legally added
    to ``trial_id``) or ``"wild"`` (a residual Wild unit can be legally added to
    ``trial_id``, which already carries a legal normal entry).
    """

    trial_id: str
    kind: str
    domain: Optional[str] = None

    def describe(self) -> str:
        if self.kind == "wild":
            return (
                f"a residual Wild unit can be legally added to active Trial "
                f"{self.trial_id!r} (which already has a legal normal entry)"
            )
        return (
            f"a residual normal unit of domain {self.domain!r} can be legally "
            f"added to active Trial {self.trial_id!r}"
        )


def _candidate_trials(config: Configuration, player_count: Optional[int]) -> list[Trial]:
    trials = config.active_trials(player_count) if player_count is not None else list(config.trials)
    return sorted(trials, key=lambda t: t.id)


def find_maximality_witness(
    config: Configuration,
    state: PlayerState,
    allocation: Allocation,
    player_count: Optional[int] = None,
) -> Optional[MaximalityWitness]:
    """Return a legal destination for some residual unit, or ``None`` if maximal.

    Tests each residual unit against every candidate Trial destination (impl
    spec 8): a normal residue unit of domain ``d`` is addable to Trial ``t`` when
    the entry formed by adding one ``d`` to ``t`` is legal; a Wild residue unit
    is addable to ``t`` when ``t`` already carries a legal normal entry (Wild may
    not enter alone). The first legal destination found (domains then Trials, in
    id order) is returned as the witness — determinism per NFR-1.
    """
    recon = reconcile_ledgers(state, allocation, config)
    trials = _candidate_trials(config, player_count)

    for dom in sorted(recon.positive_normal_residue()):
        for trial in trials:
            candidate = dict(allocation.normal_on(trial.id))
            candidate[dom] = candidate.get(dom, 0) + 1
            legal, _reason = entry_is_legal(
                config, trial, candidate, player_count, wild=allocation.wild_on(trial.id)
            )
            if legal:
                return MaximalityWitness(trial_id=trial.id, kind="normal", domain=dom)

    if recon.wild_residue > 0 and config.wild.enabled:
        for trial in trials:
            current = allocation.normal_on(trial.id)
            has_normal = sum(current.values()) > 0
            if not has_normal and not config.wild.can_enter_alone:
                continue
            legal, _reason = entry_is_legal(
                config, trial, current, player_count, wild=allocation.wild_on(trial.id)
            )
            if legal:
                return MaximalityWitness(trial_id=trial.id, kind="wild")

    return None


def is_maximal_allocation(
    state: PlayerState,
    allocation: Allocation,
    config: Configuration,
    player_count: Optional[int] = None,
) -> bool:
    """True when no residual unit can be legally added to any active Trial (REQ-4.5)."""
    return find_maximality_witness(config, state, allocation, player_count) is None


# --------------------------------------------------------------------------- #
# Completion policy (REQ-4.4, 4.5, 4.6; design 7.6; impl spec 8)               #
# --------------------------------------------------------------------------- #


@dataclass
class CompletionResult:
    policy: str
    satisfied: bool
    normal_residue: int
    wild_residue: int
    is_maximal: bool
    maximality_witness: Optional[MaximalityWitness] = None
    fallback_applied: Optional[str] = None  # "reject" | "residue" | None
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def enforce_completion(
    config: Configuration,
    state: PlayerState,
    allocation: Allocation,
    player_count: Optional[int] = None,
) -> CompletionResult:
    """Apply the configured completion policy (design 7.6).

    - OPTIONAL: any legal residue is accepted.
    - MAXIMAL: valid only when maximal; a failure names a legal destination Trial.
    - FULL: residue must be zero, else the explicit ``infeasible_full_fallback``
      applies — ``reject`` (infeasible/error) or ``residue`` (treat as maximal,
      warn). Over-allocation is never clipped to fake completion (REQ-4.7).
    """
    recon = reconcile_ledgers(state, allocation, config)
    normal_residue = recon.normal_residue_total()
    wild_residue = recon.wild_residue
    witness = find_maximality_witness(config, state, allocation, player_count)
    result = CompletionResult(
        policy=config.allocation.completion,
        satisfied=True,
        normal_residue=normal_residue,
        wild_residue=wild_residue,
        is_maximal=witness is None,
        maximality_witness=witness,
    )
    pid = state.player_id

    if result.policy == "optional":
        return result

    if result.policy == "maximal":
        if witness is not None:
            result.satisfied = False
            result.errors.append(
                f"maximal completion violated for {pid}: {witness.describe()}"
            )
        return result

    if result.policy == "full":
        leftover = normal_residue + wild_residue
        if leftover == 0:
            return result
        fallback = config.allocation.infeasible_full_fallback
        result.fallback_applied = fallback
        summary = (
            f"full completion infeasible for {pid}: residue {leftover} "
            f"(normal {normal_residue}, wild {wild_residue}) cannot be fully allocated"
        )
        if fallback == "residue":
            result.satisfied = True
            result.warnings.append(f"{summary}; fallback=residue -> treated as maximal")
        else:  # "reject" (default) — the state/config pair is infeasible
            result.satisfied = False
            result.fallback_applied = "reject"
            result.errors.append(f"{summary}; fallback=reject")
        return result

    result.satisfied = False
    result.errors.append(f"unknown completion policy {result.policy!r} for {pid}")
    return result


# --------------------------------------------------------------------------- #
# Bundled allocation validation (impl spec 6: validate_allocation)             #
# --------------------------------------------------------------------------- #


@dataclass
class AllocationValidation:
    player_id: str
    valid: bool
    reconciliation: LedgerReconciliation
    completion: CompletionResult
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def validate_allocation(
    state: PlayerState,
    allocation: Allocation,
    config: Configuration,
    player_count: Optional[int] = None,
) -> AllocationValidation:
    """Full allocation legality: exact ledger reconciliation then completion.

    Surfaces every recorded ledger discrepancy as an error (over-allocation is
    reported, never clipped — REQ-4.7) and appends the completion outcome. The
    over-allocation *invalidation policy* (which entries to drop) is applied by
    the resolver, not here.
    """
    recon = reconcile_ledgers(state, allocation, config)
    errors: list[str] = [d.detail for d in recon.discrepancies]
    completion = enforce_completion(config, state, allocation, player_count)
    errors.extend(completion.errors)
    warnings = list(completion.warnings)
    return AllocationValidation(
        player_id=allocation.player_id,
        valid=not errors,
        reconciliation=recon,
        completion=completion,
        errors=errors,
        warnings=warnings,
    )
