"""Deterministic resolution pipeline (model v2.1 §8; spec v1.1 §7).

Given a configuration, a set of player states and a set of allocations, produce
the full Trial results, Recognition Points, final placement, utilities and an
audit trace. No randomness; identical inputs give identical outputs.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from functools import cmp_to_key
from typing import Optional

from . import comparators, legality
from .canonical import deterministic_hash, normalized_allocation, normalized_state
from .comparators import (
    FinalTiebreakContext,
    TrialLocalView,
    TrialTiebreakContext,
)
from .config_loader import validate_configuration
from .schema import (
    Allocation,
    Configuration,
    PlayerState,
    Trial,
    ValidationResult,
)

# --------------------------------------------------------------------------- #
# Result structures (spec v1.1 §5.8)                                           #
# --------------------------------------------------------------------------- #


@dataclass
class TrialEntry:
    player_id: str
    normal_on: dict[str, int]
    normal_total: int
    wild_alloc: int
    legal_wild: int
    total_power: int
    legal: bool
    reason: Optional[str] = None


@dataclass
class TrialResult:
    trial_id: str
    active: bool
    normal_totals: dict[str, int] = field(default_factory=dict)
    wild_totals: dict[str, int] = field(default_factory=dict)
    total_power: dict[str, int] = field(default_factory=dict)
    legal_entries: list[str] = field(default_factory=list)
    illegal_entries: dict[str, str] = field(default_factory=dict)
    placements: list[list[str]] = field(default_factory=list)
    comparison_trace: list[str] = field(default_factory=list)
    rewards_awarded: dict[str, int] = field(default_factory=dict)
    award_trace: list["AwardTrace"] = field(default_factory=list)
    shared_first: bool = False
    uncontested: bool = False


@dataclass
class AwardTrace:
    """One awarded Recognition Point block traced to exactly ONE configured award
    (REQ-7.5; design §7.8).

    Every Recognition Point a player receives is emitted through this trace, so the
    audit can prove each awarded point maps to a single configured reward entry —
    the slot ``place`` ("first"/"second") of
    ``config.trials[trial_id].rewards_by_player_count[player_count]``. ``awarded`` is
    what the player actually banked: the full ``configured_award`` for a sole or
    shared-full winner and each lower-place finisher, or ``configured_award //
    group_size`` for a divided first-place tie. ``tie_resolution`` records which of
    those cases applied.
    """

    player_id: str
    trial_id: str
    player_count: int
    place: str  # "first" | "second"
    configured_award: int
    awarded: int
    tie_resolution: str  # "sole" | "shared_full" | "divided" | "lower_place"
    group_size: int

    def to_dict(self) -> dict:
        return {
            "player_id": self.player_id,
            "trial_id": self.trial_id,
            "player_count": self.player_count,
            "place": self.place,
            "configured_award": self.configured_award,
            "awarded": self.awarded,
            "tie_resolution": self.tie_resolution,
            "group_size": self.group_size,
        }


@dataclass
class PlayerResult:
    player_id: str
    recognition_points: int = 0
    final_place: int = 0
    shared_first: bool = False
    final_tiebreak_trace: list[str] = field(default_factory=list)


@dataclass
class InvalidationEvent:
    """One entry in the complete invalidation trace (REQ-5.4; design §4.8).

    Every invalidation records the player, the Trial *or* domain at fault, a
    reason, and the Trial entries it affects. ``scope`` is one of:

      * ``illegal_entry``          — a single illegal Trial entry (REQ-5.1);
      * ``overallocated_domain``   — whole-domain normal over-allocation (REQ-5.2);
      * ``overallocated_wild``     — Wild over-allocation (REQ-5.2);
      * ``malformed_allocation``   — an invalid whole allocation (REQ-5.1).

    ``action`` is the configured policy that was applied (impl spec §5.2). For a
    domain event ``domain`` is set; for entry / Wild events ``trial_id`` and/or
    ``affected_entries`` name the Trials touched. ``excess`` is the exact
    over-allocation amount (never clipped, REQ-4.7); ``dropped_wild`` is the Wild
    power dropped with an illegal normal entry (REQ-5.3, REQ-6.1).
    """

    player_id: str
    scope: str
    reason: str
    action: str
    trial_id: Optional[str] = None
    domain: Optional[str] = None
    affected_entries: list[str] = field(default_factory=list)
    excess: Optional[int] = None
    dropped_wild: int = 0

    def to_dict(self) -> dict:
        return {
            "player_id": self.player_id,
            "scope": self.scope,
            "reason": self.reason,
            "action": self.action,
            "trial_id": self.trial_id,
            "domain": self.domain,
            "affected_entries": list(self.affected_entries),
            "excess": self.excess,
            "dropped_wild": self.dropped_wild,
        }


@dataclass
class ResolutionResult:
    configuration_id: str
    configuration_version: str
    player_count: int
    validation: ValidationResult
    trial_results: list[TrialResult] = field(default_factory=list)
    player_results: dict[str, PlayerResult] = field(default_factory=dict)
    win_utility: dict[str, int] = field(default_factory=dict)
    margin_utility: dict[str, int] = field(default_factory=dict)
    overallocated_domains: dict[str, dict[str, int]] = field(default_factory=dict)
    invalidated_trial_entries: dict[str, dict[str, str]] = field(default_factory=dict)
    dropped_wild_entries: dict[str, dict[str, int]] = field(default_factory=dict)
    invalidation_events: list[InvalidationEvent] = field(default_factory=list)
    conservation: dict[str, dict[str, dict[str, int]]] = field(default_factory=dict)
    residue: dict[str, dict[str, int]] = field(default_factory=dict)
    # Normalized inputs (design §7.1) retained as part of the audit trace so the
    # exact state/allocation that produced this result is reproducible and is
    # folded into the audit hash (design §7.11).
    normalized_states: dict[str, dict] = field(default_factory=dict)
    normalized_allocations: dict[str, dict] = field(default_factory=dict)
    # Flat Recognition-Point award trace: every awarded point maps to one
    # configured award entry (REQ-7.5).
    award_trace: list[AwardTrace] = field(default_factory=list)
    deterministic_hash: str = ""

    def to_dict(self) -> dict:
        return {
            "configuration": {"id": self.configuration_id, "version": self.configuration_version},
            "player_count": self.player_count,
            "normalized_inputs": {
                "states": self.normalized_states,
                "allocations": self.normalized_allocations,
            },
            "validation": {
                "valid": self.validation.valid,
                "errors": self.validation.errors,
                "warnings": self.validation.warnings,
            },
            "invalidation_trace": {
                "overallocated_domains": self.overallocated_domains,
                "invalidated_trial_entries": self.invalidated_trial_entries,
                "dropped_wild_entries": self.dropped_wild_entries,
                "events": [event.to_dict() for event in self.invalidation_events],
            },
            "trial_results": [
                {
                    "trial_id": tr.trial_id,
                    "active": tr.active,
                    "normal_totals": tr.normal_totals,
                    "wild_totals": tr.wild_totals,
                    "total_power": tr.total_power,
                    "legal_entries": tr.legal_entries,
                    "illegal_entries": tr.illegal_entries,
                    "placements": tr.placements,
                    "comparison_trace": tr.comparison_trace,
                    "rewards_awarded": tr.rewards_awarded,
                    "award_trace": [a.to_dict() for a in tr.award_trace],
                    "shared_first": tr.shared_first,
                    "uncontested": tr.uncontested,
                }
                for tr in self.trial_results
            ],
            "player_results": {
                pid: {
                    "recognition_points": pr.recognition_points,
                    "final_place": pr.final_place,
                    "shared_first": pr.shared_first,
                    "final_tiebreak_trace": pr.final_tiebreak_trace,
                }
                for pid, pr in sorted(self.player_results.items())
            },
            "utilities": {"win": self.win_utility, "margin": self.margin_utility},
            "audit": {
                "conservation": self.conservation,
                "residue": self.residue,
                "award_trace": [a.to_dict() for a in self.award_trace],
                "deterministic_hash": self.deterministic_hash,
            },
        }

    def finalize_hash(self) -> None:
        """Compute the deterministic SHA-256 audit hash (REQ-7.2; design §7.11).

        Hashes the canonical JSON of the full result — configuration version,
        normalized states, normalized allocations, validation and invalidation
        outcomes, Trial results (with the RP award trace) and final results — with
        the hash field itself blanked so it never hashes over its own value.
        ``canonical_json`` sorts every map key, and the resolver emits every list in
        sorted order, so the hash is independent of Python dict/hash order (NFR-1).
        """
        self.deterministic_hash = ""
        self.deterministic_hash = deterministic_hash(self.to_dict())


# --------------------------------------------------------------------------- #
# State / allocation validation                                                #
# --------------------------------------------------------------------------- #


def validate_state(state: PlayerState, config: Configuration) -> ValidationResult:
    result = ValidationResult()
    domain_ids = {d.id for d in config.domains}
    for dom, power in state.normal_power.items():
        if dom not in domain_ids and power != 0:
            result.error(f"state {state.player_id}: undeclared domain {dom!r} has power {power}")
        if power < 0:
            result.error(f"state {state.player_id}: negative power in {dom!r}")
    if state.wild_power < 0:
        result.error(f"state {state.player_id}: negative wild power")
    return result


def validate_allocation(
    state: PlayerState, allocation: Allocation, config: Configuration
) -> ValidationResult:
    result = ValidationResult()
    for trial_id, doms in allocation.normal.items():
        for dom, power in doms.items():
            if power < 0:
                result.error(f"allocation {allocation.player_id}: negative normal on {trial_id}/{dom}")
    for trial_id, power in allocation.wild.items():
        if power < 0:
            result.error(f"allocation {allocation.player_id}: negative wild on {trial_id}")
    return result


# --------------------------------------------------------------------------- #
# Tiebreak values                                                              #
# --------------------------------------------------------------------------- #


def _build_trial_context(
    config: Configuration,
    trial: Trial,
    entry: "TrialEntry",
    state: PlayerState,
    allocated_normal_total: int,
) -> TrialTiebreakContext:
    """Assemble the comparator context for one contender on one Trial.

    The local view carries only the contested Trial's own numbers (REQ-8.6); the
    surrounding context adds the player state and cross-Trial allocation total
    that the historical ratio branches divide by (design §6.1–§6.4).
    """
    view = TrialLocalView(
        config=config,
        trial=trial,
        normal_on={d: p for d, p in entry.normal_on.items() if p > 0},
        normal_total=entry.normal_total,
        total_power=entry.total_power,
    )
    return TrialTiebreakContext(
        local=view,
        state=state,
        allocated_normal_total=allocated_normal_total,
    )


def _compare_entries(chain, contexts, a: str, b: str) -> tuple[int, Optional[str]]:
    """Return (sign, deciding_token). sign = 1 if a ranks above b, -1 if below, 0 if tied.

    Walks the configured comparator chain, delegating each token to its single
    pure comparator (design §5.3). Ratio tokens compare as exact ``Fraction``s
    (REQ-8.3); ``shared`` terminates the chain in a tie.
    """
    for token in chain:
        if token == "shared":
            return (0, "shared")
        va = comparators.trial_token_value(token, contexts[a])
        vb = comparators.trial_token_value(token, contexts[b])
        if va > vb:
            return (1, token)
        if va < vb:
            return (-1, token)
    return (0, None)


# --------------------------------------------------------------------------- #
# Resolution                                                                   #
# --------------------------------------------------------------------------- #


def resolve_profile(
    config: Configuration,
    states: dict[str, PlayerState],
    allocations: dict[str, Allocation],
    player_count: Optional[int] = None,
) -> ResolutionResult:
    if player_count is None:
        player_count = len(states)

    result = ResolutionResult(
        configuration_id=config.id,
        configuration_version=config.version,
        player_count=player_count,
        validation=ValidationResult(),
    )

    # ------------------------------------------------------------------ #
    # Step 1 (part) — NORMALIZE all input ordering (design §7.1; NFR-1).  #
    # ------------------------------------------------------------------ #
    # Players, domains, Trials and every map key are ordered deterministically so
    # neither the result nor its audit hash can depend on Python dict/hash order.
    # The normalized states and allocations are retained on the result as part of
    # the audit trace (design §7.11) and are what the hash is computed over.
    player_ids = sorted(states)
    domain_ids = [d.id for d in config.domains]
    ordered_trials = sorted(config.trials, key=lambda t: t.id)
    result.normalized_states = {pid: normalized_state(states[pid]) for pid in player_ids}
    result.normalized_allocations = {
        pid: normalized_allocation(allocations.get(pid, Allocation(player_id=pid)))
        for pid in player_ids
    }

    # Step 1 — validate configuration + token vocabulary and state closure (§7.2).
    result.validation.merge(validate_configuration(config))

    # Step 2-3: state + allocation syntax. A syntactically invalid whole
    # allocation is a "malformed allocation": apply the configured policy
    # (default reject_profile) and record a complete invalidation event (REQ-5.1,
    # REQ-5.4). reject_profile means the profile is rejected below (NFR-4).
    for pid in player_ids:
        result.validation.merge(validate_state(states[pid], config))
        if pid in allocations:
            alloc_result = validate_allocation(states[pid], allocations[pid], config)
            result.validation.merge(alloc_result)
            if not alloc_result.valid:
                result.invalidation_events.append(
                    InvalidationEvent(
                        player_id=pid,
                        scope="malformed_allocation",
                        reason="; ".join(alloc_result.errors),
                        action=config.allocation.invalidation.malformed_allocation,
                        affected_entries=sorted(allocations[pid].trials_touched()),
                    )
                )

    if not result.validation.valid:
        result.finalize_hash()
        return result

    # Step 2 — reconcile power ledgers and detect over-allocation (design §7.3).
    over_domains: dict[str, dict[str, int]] = {}
    over_wild: dict[str, int] = {}
    for pid in player_ids:
        alloc = allocations.get(pid, Allocation(player_id=pid))
        state = states[pid]
        cons: dict[str, dict[str, int]] = {}
        for dom in sorted(set(domain_ids) | _domains_used(alloc)):
            allocated = sum(doms.get(dom, 0) for doms in alloc.normal.values())
            available = state.normal_power.get(dom, 0)
            residue = available - allocated
            cons[dom] = {"available": available, "allocated": allocated, "residue": residue}
            if allocated > available:
                over_domains.setdefault(pid, {})[dom] = allocated - available
        result.conservation[pid] = cons
        allocated_wild = sum(alloc.wild.values())
        wild_residue = state.wild_power - allocated_wild
        result.residue[pid] = {
            "normal": sum(max(v["residue"], 0) for v in cons.values()),
            "wild": max(wild_residue, 0),
        }
        if allocated_wild > state.wild_power:
            over_wild[pid] = allocated_wild - state.wild_power
    result.overallocated_domains = over_domains

    # Step 3 — apply the configured over-allocation invalidation policies (REQ-5.1,
    # REQ-5.2; design §7.4; impl spec §7.2). Over-allocation is a ledger violation
    # resolved BEFORE eligibility: a normal domain over-allocation invalidates every
    # entry drawing that domain (whole-domain scope); a Wild over-allocation either
    # invalidates every entry drawing Wild or merely drops their Wild, per config.
    # Each scope emits a complete event (player, domain/Trials, reason, affected
    # entries, exact excess — REQ-5.4). No over-allocation is ever clipped (REQ-4.7).
    invalidated: dict[tuple[str, str], str] = {}  # (pid, trial) -> reason; entry cannot contend
    wild_drop_only: set[tuple[str, str]] = set()  # (pid, trial) -> drop Wild, keep normal entry
    domain_action = config.allocation.invalidation.overallocated_domain
    wild_action = config.allocation.invalidation.overallocated_wild

    for pid in sorted(over_domains):
        alloc = allocations[pid]
        for dom in sorted(over_domains[pid]):
            excess = over_domains[pid][dom]
            affected = sorted(
                tid for tid, entry_doms in alloc.normal.items() if entry_doms.get(dom, 0) > 0
            )
            reason = f"overallocated_domain:{dom}"
            if domain_action == "invalidate_entries_using_domain":
                for tid in affected:
                    invalidated[(pid, tid)] = reason
            result.invalidation_events.append(
                InvalidationEvent(
                    player_id=pid,
                    scope="overallocated_domain",
                    reason=reason,
                    action=domain_action,
                    domain=dom,
                    affected_entries=affected,
                    excess=excess,
                )
            )

    for pid in sorted(over_wild):
        alloc = allocations[pid]
        excess = over_wild[pid]
        affected = sorted(tid for tid, w in alloc.wild.items() if w > 0)
        if wild_action == "invalidate_entries_using_wild":
            for tid in affected:
                invalidated.setdefault((pid, tid), "overallocated_wild")
        elif wild_action == "drop_wild":
            for tid in affected:
                wild_drop_only.add((pid, tid))
        result.invalidation_events.append(
            InvalidationEvent(
                player_id=pid,
                scope="overallocated_wild",
                reason="overallocated_wild",
                action=wild_action,
                affected_entries=affected,
                excess=excess,
            )
        )

    # Steps 4-5 — build entries, evaluate intrinsic eligibility + floors (§7.5), and
    # drop Wild attached to any illegal / invalidated normal entry (REQ-5.3, REQ-6.1).
    trial_map = config.trial_map()
    entry_action = config.allocation.invalidation.illegal_trial_entry
    entries: dict[str, dict[str, TrialEntry]] = {}  # trial_id -> pid -> entry
    for pid in player_ids:
        alloc = allocations.get(pid, Allocation(player_id=pid))
        for trial_id in sorted(alloc.trials_touched()):
            normal_on = alloc.normal_on(trial_id)
            normal_total = sum(normal_on.values())
            wild_alloc = alloc.wild_on(trial_id)
            entry = TrialEntry(
                player_id=pid,
                normal_on=normal_on,
                normal_total=normal_total,
                wild_alloc=wild_alloc,
                legal_wild=0,
                total_power=0,
                legal=False,
            )
            over_reason = invalidated.get((pid, trial_id))
            if over_reason is not None:
                # Already invalidated by an over-allocation policy (event recorded in
                # step 5). The entry contributes zero; its Wild is dropped (REQ-5.3).
                entry.reason = over_reason
                if wild_alloc > 0:
                    result.dropped_wild_entries.setdefault(pid, {})[trial_id] = wild_alloc
                result.invalidated_trial_entries.setdefault(pid, {})[trial_id] = over_reason
                entries.setdefault(trial_id, {})[pid] = entry
                continue

            legal, reason = _intrinsic_entry_legality(config, trial_map, trial_id, player_count, entry)
            if legal:
                entry.legal = True
                # Wild adds to the primary total only after normal-entry legality is
                # established (REQ-6.4), and only if not dropped by a Wild
                # over-allocation policy (drop_wild) or globally excluded from totals.
                dropped = (pid, trial_id) in wild_drop_only
                if config.wild.included_in_primary_total and not dropped:
                    entry.legal_wild = wild_alloc
                if dropped and wild_alloc > 0:
                    result.dropped_wild_entries.setdefault(pid, {})[trial_id] = wild_alloc
                entry.total_power = normal_total + entry.legal_wild
            else:
                # Intrinsically illegal entry -> apply the configured illegal_trial_entry
                # action (default ignore_entry). Either action makes the entry contribute
                # zero and not contend; its attached Wild is dropped (REQ-5.3, REQ-6.1).
                entry.reason = reason
                if wild_alloc > 0:
                    result.dropped_wild_entries.setdefault(pid, {})[trial_id] = wild_alloc
                if entry_action == "invalidate_entry":
                    result.invalidated_trial_entries.setdefault(pid, {})[trial_id] = reason
                result.invalidation_events.append(
                    InvalidationEvent(
                        player_id=pid,
                        scope="illegal_entry",
                        reason=reason,
                        action=entry_action,
                        trial_id=trial_id,
                        affected_entries=[trial_id],
                        dropped_wild=wild_alloc,
                    )
                )
            entries.setdefault(trial_id, {})[pid] = entry

    # Step 6 — enforce the completion policy (design §7.6).
    _apply_completion_policy(config, states, allocations, result)
    if not result.validation.valid:
        result.finalize_hash()
        return result

    # Steps 7-9 — per-Trial normal/Wild/total power (§7.7), the Trial tiebreak
    # chain (§7.7), and Trial Recognition-Point awards (§7.8).
    #
    # ``allocated_normal_total`` is each player's positive normal power placed
    # across ALL Trials — the denominator the historical Focus ratio (§6.2)
    # divides by. Computed once here (from the raw allocation) and threaded into
    # every Trial so the per-Trial comparator context is self-contained.
    allocated_normal_total: dict[str, int] = {}
    for pid in player_ids:
        alloc = allocations.get(pid)
        total = 0
        if alloc is not None:
            for doms in alloc.normal.values():
                total += sum(p for p in doms.values() if p > 0)
        allocated_normal_total[pid] = total

    recognition: dict[str, int] = {pid: 0 for pid in player_ids}
    sole_first_counts: dict[str, int] = {pid: 0 for pid in player_ids}
    for trial in ordered_trials:
        tr = _resolve_trial(
            config, trial, player_count, entries.get(trial.id, {}), states, allocated_normal_total
        )
        result.trial_results.append(tr)
        result.award_trace.extend(tr.award_trace)
        for pid, rp in tr.rewards_awarded.items():
            recognition[pid] += rp
        if tr.placements and len(tr.placements[0]) == 1:
            sole_first_counts[tr.placements[0][0]] += 1

    # Steps 10-11 — aggregate player RP totals and apply the final tiebreak chain (§7.9).
    _resolve_final(config, states, recognition, sole_first_counts, result)

    # Step 12 — win and margin utilities (§7.10).
    _compute_utilities(recognition, result)

    # Step 13 — emit the deterministic audit hash over the full trace (§7.11).
    result.finalize_hash()
    return result


def _domains_used(alloc: Allocation) -> set[str]:
    used: set[str] = set()
    for doms in alloc.normal.values():
        used.update(doms.keys())
    return used


def _intrinsic_entry_legality(
    config, trial_map, trial_id, player_count, entry: TrialEntry
) -> tuple[bool, Optional[str]]:
    """Intrinsic legality of an entry, ignoring over-allocation policy.

    Active-Trial check, the declarative source predicate, the entry floor, and
    the Wild-requires-a-legal-normal-entry rule are owned by
    ``legality.entry_is_legal`` so the resolver and the maximality checker share
    one definition (design 7.5). Returns ``(True, None)`` when legal, else
    ``(False, reason)``.
    """
    trial = trial_map.get(trial_id)
    if trial is None:
        return (False, "unknown_trial")
    return legality.entry_is_legal(
        config, trial, entry.normal_on, player_count, wild=entry.wild_alloc
    )


def _apply_completion_policy(config, states, allocations, result: ResolutionResult) -> None:
    """Enforce the configured completion policy per player (design 7.6).

    Delegates to legality.enforce_completion. Severity in the resolver:
      * FULL infeasible with fallback=reject, and OPTIONAL/unknown errors -> fatal
        validation errors (the profile is rejected / the state is infeasible, NFR-4);
      * MAXIMAL non-maximality -> a non-fatal warning that names a legal
        destination Trial (design 7.6). A non-maximal allocation is still fully
        resolvable, so the resolver diagnoses it rather than refusing; the strict
        boolean lives in legality.enforce_completion / is_maximal_allocation for
        enumeration's filter (Task 16);
      * FULL fallback=residue -> a warning (residue treated as maximal).
    """
    for pid in sorted(states):
        alloc = allocations.get(pid, Allocation(player_id=pid))
        completion = legality.enforce_completion(
            config, states[pid], alloc, result.player_count
        )
        # Non-maximality is diagnostic, not fatal; every other dissatisfaction
        # (infeasible FULL under reject, unknown policy) rejects the profile.
        errors_are_fatal = completion.policy != "maximal"
        for msg in completion.errors:
            if errors_are_fatal:
                result.validation.error(msg)
            else:
                result.validation.warn(msg)
        for msg in completion.warnings:
            result.validation.warn(msg)


def _resolve_trial(config, trial: Trial, player_count, entries_by_pid, states, allocated_normal_total) -> TrialResult:
    tr = TrialResult(trial_id=trial.id, active=trial.is_active(player_count))
    for pid in sorted(entries_by_pid):
        entry = entries_by_pid[pid]
        tr.normal_totals[pid] = entry.normal_total
        tr.wild_totals[pid] = entry.legal_wild if entry.legal else 0
        if entry.legal:
            tr.total_power[pid] = entry.total_power
            tr.legal_entries.append(pid)
        elif entry.reason:
            tr.illegal_entries[pid] = entry.reason

    if not tr.active:
        return tr

    contenders = sorted(pid for pid in tr.legal_entries)
    if not contenders:
        return tr
    tr.uncontested = len(contenders) == 1

    chain = trial.trial_tiebreaks or ["total_power", "shared"]

    # One comparator context per contender (built only for legal contenders, so
    # the historical ratio branches never divide by a zero denominator).
    contexts = {
        pid: _build_trial_context(
            config, trial, entries_by_pid[pid], states[pid], allocated_normal_total.get(pid, 0)
        )
        for pid in contenders
    }

    def cmp(a: str, b: str) -> int:
        sign, _tok = _compare_entries(chain, contexts, a, b)
        return -sign  # higher ranks first

    ordered = sorted(contenders, key=cmp_to_key(cmp))

    # Group consecutive ties into placement groups.
    placements: list[list[str]] = []
    for pid in ordered:
        if placements:
            sign, _tok = _compare_entries(chain, contexts, placements[-1][0], pid)
            if sign == 0:
                placements[-1].append(pid)
                continue
        placements.append([pid])
    for group in placements:
        group.sort()
    tr.placements = placements

    if len(placements) >= 2:
        _sign, deciding = _compare_entries(chain, contexts, placements[0][0], placements[1][0])
        tr.comparison_trace.append(f"first vs second decided by: {deciding}")
    elif len(placements[0]) > 1:
        # A single placement group with several members: the chain ran to its end
        # without separating them, so the first place is shared. Record the token
        # the tie resolved on (normally 'shared') so the cascade is auditable.
        _sign, deciding = _compare_entries(chain, contexts, placements[0][0], placements[0][1])
        tr.comparison_trace.append(f"first group shared; tie resolved at: {deciding}")
    else:
        tr.comparison_trace.append("single placement group")

    tr.shared_first = len(placements[0]) > 1
    _award_rewards(trial, player_count, placements, tr)
    return tr


def _award_rewards(trial: Trial, player_count, placements, tr: TrialResult) -> None:
    """Award Trial Recognition Points and trace every awarded point to one
    configured award (design §7.8; REQ-7.5).

    Each assignment to ``tr.rewards_awarded`` is mirrored by exactly one
    :class:`AwardTrace` naming the configured reward slot it came from, so the sum
    of a player's traced awards equals the Recognition Points they banked and no
    point is ever awarded without a configured source.
    """
    rewards = trial.rewards_by_player_count.get(player_count)
    if not rewards:
        return
    first_reward = rewards.get("first", 0)
    second_reward = rewards.get("second", 0)
    first_group = placements[0]

    def _award(pid: str, place: str, configured: int, awarded: int, mode: str, group_size: int) -> None:
        tr.rewards_awarded[pid] = awarded
        tr.award_trace.append(
            AwardTrace(
                player_id=pid,
                trial_id=trial.id,
                player_count=player_count,
                place=place,
                configured_award=configured,
                awarded=awarded,
                tie_resolution=mode,
                group_size=group_size,
            )
        )

    def _award_second(placements) -> None:
        if second_reward and not trial.suppress_lower_on_shared_first and len(placements) >= 2:
            second_group = placements[1]
            for pid in second_group:
                _award(pid, "second", second_reward, second_reward, "lower_place", len(second_group))

    if len(first_group) == 1:
        _award(first_group[0], "first", first_reward, first_reward, "sole", 1)
        # A sole first never suppresses the lower place; only a shared first can.
        if second_reward and len(placements) >= 2:
            second_group = placements[1]
            for pid in second_group:
                _award(pid, "second", second_reward, second_reward, "lower_place", len(second_group))
    else:
        # Shared first.
        n = len(first_group)
        if trial.tie_award.type == "shared_full":
            for pid in first_group:
                _award(pid, "first", first_reward, first_reward, "shared_full", n)
        elif trial.tie_award.type == "divided":
            share = first_reward // n
            for pid in first_group:
                _award(pid, "first", first_reward, share, "divided", n)
        # tie_award "none" -> no award, no trace.
        _award_second(placements)


def _resolve_final(config, states, recognition, sole_first_counts, result: ResolutionResult) -> None:
    player_ids = sorted(recognition)

    def final_value(token: str, pid: str):
        ctx = FinalTiebreakContext(
            state=states[pid], sole_first_count=sole_first_counts.get(pid, 0)
        )
        return comparators.final_token_value(token, ctx)

    chain = config.final_tiebreaks or ["shared"]

    def cmp(a: str, b: str) -> int:
        if recognition[a] != recognition[b]:
            return -1 if recognition[a] > recognition[b] else 1
        for token in chain:
            if token == "shared":
                return 0
            va, vb = final_value(token, a), final_value(token, b)
            if va != vb:
                return -1 if va > vb else 1
        return 0

    ordered = sorted(player_ids, key=cmp_to_key(cmp))
    groups: list[list[str]] = []
    for pid in ordered:
        if groups and cmp(groups[-1][0], pid) == 0:
            groups[-1].append(pid)
        else:
            groups.append([pid])

    place = 1
    for group in groups:
        shared = len(group) > 1
        for pid in sorted(group):
            pr = PlayerResult(
                player_id=pid,
                recognition_points=recognition[pid],
                final_place=place,
                shared_first=(place == 1 and shared),
            )
            if place == 1:
                pr.final_tiebreak_trace.append(
                    "shared first" if shared else "sole first by RP/tiebreak chain"
                )
            result.player_results[pid] = pr
        place += len(group)


def _compute_utilities(recognition, result: ResolutionResult) -> None:
    player_ids = sorted(recognition)
    for pid in player_ids:
        pr = result.player_results[pid]
        if pr.final_place == 1:
            result.win_utility[pid] = 0 if pr.shared_first else 1
        else:
            result.win_utility[pid] = -1
    if len(player_ids) == 2:
        a, b = player_ids
        result.margin_utility[a] = recognition[a] - recognition[b]
        result.margin_utility[b] = recognition[b] - recognition[a]
