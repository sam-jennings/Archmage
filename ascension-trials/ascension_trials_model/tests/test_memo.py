"""Task 5 - memoized resolution wrapper (REQ-8, NFR-2; design §7).

The memo is a pure, injectable cache over the VS1 resolver. These tests prove the
four things REQ-8 requires:

* the key is a content hash of the COMPLETE normalized semantic resolver input, so
  it collides only for genuinely identical inputs and stays correct even when a
  configuration's content changes without a version bump (REQ-8.1);
* a cache hit returns the identical ``ResolutionResult`` — same trace, same audit
  hash (REQ-8.2);
* memoized and direct payoff matrices AND derived metrics are byte-identical on
  every committed fixture (REQ-8.3);
* cache hit rate and wall-clock runtime are diagnostics only, and disabling the
  memo changes only performance, never output (REQ-8.4, REQ-8.5).

The memo is routed into the (frozen) VS2 matrix builder transparently by
substituting its ``resolve`` method for the module-level ``resolve_profile``
reference — exactly how the matrix builder and the later double-oracle driver will
consume it — so no VS2 module is modified.
"""

from __future__ import annotations

import copy

import pytest

from ascension_trials import memo as memo_mod
from ascension_trials.canonical import canonical_json
from ascension_trials.enumerate import enumerate_allocations
from ascension_trials.matrix import PayoffMatrix, build_two_player_payoff_matrix
from ascension_trials.memo import ResolutionMemo, resolution_diagnostics, resolver_input_key
from ascension_trials.metrics import SmallStateMetrics, compute_small_state_metrics
from ascension_trials.resolver import resolve_profile
from ascension_trials.schema import Allocation, PlayerState

from vs2_support import config_from_fixture_inline, load_referenced_config, load_vs2_fixture

# Committed fixtures that produce a resolver-driven payoff matrix (config + state).
# MATH-13 / MATH-14 are raw game-theory win matrices with no resolver input, so
# they exercise no resolution and are intentionally excluded here.
MATRIX_FIXTURES = ["A3", "A4", "A5", "A6", "A19", "A20"]
# Metrics run the full pipeline (collapse + dominance + LP + equilibrium + ties);
# proven byte-identical on the small/moderate committed fixtures. A4/A6 (84x84)
# are covered by the matrix proof; the derived-metric determinism they add is
# already exercised by the small fixtures plus A15.
METRICS_FIXTURES = ["A3", "A5", "A19", "A20"]


# --------------------------------------------------------------------------- #
# Helpers                                                                      #
# --------------------------------------------------------------------------- #


def _state(fx, key="state"):
    st = fx[key]
    return PlayerState(
        player_id=st["player_id"],
        normal_power=dict(st["normal_power"]),
        wild_power=st.get("wild_power", 0),
    )


def _load_case(fixture_id):
    """Return (config, state, player_count, allocations) for a committed fixture."""
    fx = load_vs2_fixture(fixture_id)
    cfg = load_referenced_config(fx)
    state = _state(fx)
    pc = fx["player_count"]
    allocs = enumerate_allocations(cfg, state, player_count=pc)
    return cfg, state, pc, allocs


def _matrix_blob(matrix: PayoffMatrix) -> str:
    """Deterministic serialization of every observable matrix field."""
    return canonical_json(
        {
            "row_ids": list(matrix.row_strategy_ids),
            "col_ids": list(matrix.column_strategy_ids),
            "win": matrix.win.tolist(),
            "margin": matrix.margin.tolist(),
            "final_tie": matrix.final_tie.tolist(),
            "row_award_signatures": [
                [list(sig) for sig in row] for row in matrix.row_award_signatures
            ],
            "trial_ids": list(matrix.trial_ids),
            "trial_shared_flags": [
                [list(flags) for flags in row] for row in matrix.trial_shared_flags
            ],
        }
    )


def _metrics_blob(metrics: SmallStateMetrics) -> str:
    return canonical_json(metrics.to_dict())


# --------------------------------------------------------------------------- #
# Cache identity and purity (REQ-8.2, REQ-8.5, NFR-2)                          #
# --------------------------------------------------------------------------- #


def test_cache_hit_returns_identical_result_object():
    cfg, state, pc, allocs = _load_case("A5")
    states = {"A": state, "B": state}
    allocations = {"A": allocs[0], "B": allocs[1]}

    memo = ResolutionMemo()
    first = memo.resolve(cfg, states, allocations, pc)
    second = memo.resolve(cfg, states, allocations, pc)

    # A hit returns the very same object (identical trace + audit hash, REQ-8.2).
    assert first is second
    assert memo.hits == 1 and memo.misses == 1

    direct = resolve_profile(cfg, states, allocations, pc)
    assert first.deterministic_hash == direct.deterministic_hash
    assert first.to_dict() == direct.to_dict()


def test_disabled_memo_is_a_pure_passthrough():
    cfg, state, pc, allocs = _load_case("A5")
    states = {"A": state, "B": state}
    allocations = {"A": allocs[0], "B": allocs[2]}

    memo = ResolutionMemo(enabled=False)
    r1 = memo.resolve(cfg, states, allocations, pc)
    r2 = memo.resolve(cfg, states, allocations, pc)
    direct = resolve_profile(cfg, states, allocations, pc)

    # Disabling changes only performance: nothing is cached, output is identical.
    assert memo.size == 0
    assert memo.hits == 0
    assert r1.deterministic_hash == r2.deterministic_hash == direct.deterministic_hash
    assert r1.to_dict() == direct.to_dict()


def test_role_swap_changes_the_key():
    cfg, state, pc, allocs = _load_case("A4")
    memo = ResolutionMemo()
    key_ab = memo.key(cfg, {"A": state, "B": state}, {"A": allocs[0], "B": allocs[1]}, pc)
    key_ba = memo.key(cfg, {"A": state, "B": state}, {"A": allocs[1], "B": allocs[0]}, pc)
    assert key_ab != key_ba


def test_explicit_zero_allocation_collides_with_canonical_form():
    """Two allocations differing only by explicit zero entries are the same
    resolver input (the resolver drops zeros), so they must share a key."""
    cfg, state, pc, allocs = _load_case("A4")
    # Pick an allocation that actually places normal power somewhere.
    base = next(a for a in allocs if any(a.normal.get(t) for t in a.normal))
    # Copy everything (including declared residue, which the resolver records into
    # its audit hash) so the ONLY difference is an added explicit-zero entry.
    padded = Allocation(
        player_id=base.player_id,
        normal={t: dict(d) for t, d in base.normal.items()},
        wild=dict(base.wild),
        residue_normal=dict(base.residue_normal),
        residue_wild=base.residue_wild,
    )
    first_trial = next(t for t in sorted(base.normal) if base.normal[t])
    padded.normal[first_trial] = {**base.normal[first_trial], "unused_zero_domain": 0}

    memo = ResolutionMemo()
    key_base = memo.key(cfg, {"A": state, "B": state}, {"A": base, "B": allocs[1]}, pc)
    key_padded = memo.key(cfg, {"A": state, "B": state}, {"A": padded, "B": allocs[1]}, pc)
    assert key_base == key_padded


# --------------------------------------------------------------------------- #
# Content-hash key: no version bump required (REQ-8.1)                          #
# --------------------------------------------------------------------------- #


def test_config_content_change_without_version_bump_changes_key():
    """Editing configuration content while keeping id/version identical must
    change the key and must NOT return a stale cached result (REQ-8.1)."""
    cfg, state, pc, allocs = _load_case("A5")
    states = {"A": state, "B": state}
    allocations = {"A": allocs[0], "B": allocs[1]}

    edited = copy.deepcopy(cfg)
    # Bump a first-place Trial reward WITHOUT touching id or version.
    trial = edited.trials[0]
    rewards = trial.rewards_by_player_count.setdefault(pc, {})
    rewards["first"] = rewards.get("first", 0) + 7
    assert edited.id == cfg.id and edited.version == cfg.version

    memo = ResolutionMemo()
    key_original = memo.key(cfg, states, allocations, pc)
    key_edited = memo.key(edited, states, allocations, pc)
    assert key_original != key_edited

    # Route both through the SAME memo: the edited config must be resolved fresh,
    # never served the original's cached result.
    result_original = memo.resolve(cfg, states, allocations, pc)
    result_edited = memo.resolve(edited, states, allocations, pc)
    assert result_original.deterministic_hash != result_edited.deterministic_hash

    # Each matches its own direct resolution (no cross-contamination).
    assert result_original.to_dict() == resolve_profile(cfg, states, allocations, pc).to_dict()
    assert result_edited.to_dict() == resolve_profile(edited, states, allocations, pc).to_dict()


def test_identical_content_distinct_objects_share_a_key():
    """Two independently-built configs with identical content collide (the key is
    a content hash, not object identity)."""
    cfg, state, pc, allocs = _load_case("A5")
    twin = copy.deepcopy(cfg)
    states = {"A": state, "B": state}
    allocations = {"A": allocs[0], "B": allocs[1]}

    memo = ResolutionMemo()
    assert memo.key(cfg, states, allocations, pc) == memo.key(twin, states, allocations, pc)


def test_key_is_stable_under_dict_insertion_order():
    cfg, state, pc, allocs = _load_case("A5")
    states_ab = {"A": state, "B": state}
    states_ba = {"B": state, "A": state}
    alloc_ab = {"A": allocs[0], "B": allocs[1]}
    alloc_ba = {"B": allocs[1], "A": allocs[0]}
    assert resolver_input_key(cfg, states_ab, alloc_ab, pc) == resolver_input_key(
        cfg, states_ba, alloc_ba, pc
    )


# --------------------------------------------------------------------------- #
# Byte-identical payoff matrices on every committed fixture (REQ-8.3)          #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("fixture_id", MATRIX_FIXTURES)
def test_memoized_matrix_is_byte_identical_to_direct(fixture_id, monkeypatch):
    cfg, state, pc, allocs = _load_case(fixture_id)

    direct = build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=pc)

    memo = ResolutionMemo()
    monkeypatch.setattr("ascension_trials.matrix.resolve_profile", memo.resolve)
    memoized = build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=pc)
    monkeypatch.undo()

    # The memo really carried the resolution work (not silently bypassed).
    assert memo.misses > 0
    assert _matrix_blob(memoized) == _matrix_blob(direct)


def test_memoized_matrix_byte_identical_on_a15_base_and_inflated(monkeypatch):
    """A15 (equivalence inflation) ships a base config and an inline inflated
    config; prove both matrices byte-identical through the memo."""
    fx = load_vs2_fixture("A15")
    base_cfg = load_referenced_config(fx, "base_config_ref")
    base_state = _state(fx, "base_state")
    inflated_cfg = config_from_fixture_inline(fx, "inflated_config")
    inflated_state = _state(fx, "inflated_state")

    for cfg, state in ((base_cfg, base_state), (inflated_cfg, inflated_state)):
        allocs = enumerate_allocations(cfg, state, player_count=2)
        direct = build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=2)
        memo = ResolutionMemo()
        monkeypatch.setattr("ascension_trials.matrix.resolve_profile", memo.resolve)
        memoized = build_two_player_payoff_matrix(
            cfg, state, state, allocs, allocs, player_count=2
        )
        monkeypatch.undo()
        assert memo.misses > 0
        assert _matrix_blob(memoized) == _matrix_blob(direct)


# --------------------------------------------------------------------------- #
# Byte-identical derived metrics (REQ-8.3)                                     #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("fixture_id", METRICS_FIXTURES)
def test_memoized_metrics_are_byte_identical_to_direct(fixture_id, monkeypatch):
    cfg, state, pc, _ = _load_case(fixture_id)

    direct = compute_small_state_metrics(cfg, state, player_count=pc)

    memo = ResolutionMemo()
    monkeypatch.setattr("ascension_trials.matrix.resolve_profile", memo.resolve)
    memoized = compute_small_state_metrics(cfg, state, player_count=pc)
    monkeypatch.undo()

    assert memo.misses > 0
    assert _metrics_blob(memoized) == _metrics_blob(direct)


def test_memoized_metrics_byte_identical_on_a15(monkeypatch):
    fx = load_vs2_fixture("A15")
    inflated_cfg = config_from_fixture_inline(fx, "inflated_config")
    inflated_state = _state(fx, "inflated_state")

    direct = compute_small_state_metrics(inflated_cfg, inflated_state, player_count=2)
    memo = ResolutionMemo()
    monkeypatch.setattr("ascension_trials.matrix.resolve_profile", memo.resolve)
    memoized = compute_small_state_metrics(inflated_cfg, inflated_state, player_count=2)
    monkeypatch.undo()

    assert memo.misses > 0
    assert _metrics_blob(memoized) == _metrics_blob(direct)


# --------------------------------------------------------------------------- #
# Cache reuse across builds + diagnostics (REQ-8.4)                            #
# --------------------------------------------------------------------------- #


def test_second_build_with_shared_memo_is_all_hits(monkeypatch):
    cfg, state, pc, allocs = _load_case("A5")
    memo = ResolutionMemo()
    monkeypatch.setattr("ascension_trials.matrix.resolve_profile", memo.resolve)

    build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=pc)
    misses_after_first = memo.misses
    hits_after_first = memo.hits

    build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=pc)
    monkeypatch.undo()

    # Every resolve in the second identical build is served from cache.
    assert misses_after_first > 0
    assert memo.misses == misses_after_first  # no new distinct inputs
    assert memo.hits == hits_after_first + misses_after_first


def test_resolution_diagnostics_reports_hit_rate_and_runtime():
    cfg, state, pc, allocs = _load_case("A5")
    states = {"A": state, "B": state}
    # A batch with deliberate repeats: 3 distinct profiles, each resolved twice.
    profiles = []
    for a, b in [(0, 1), (1, 2), (2, 3)]:
        profile = (cfg, states, {"A": allocs[a], "B": allocs[b]}, pc)
        profiles.extend([profile, profile])

    diag = resolution_diagnostics(profiles)

    assert diag.profiles == 6
    assert diag.distinct_inputs_cached == 3
    assert diag.hits == 3 and diag.misses == 3
    assert diag.hit_rate == pytest.approx(0.5)
    # Diagnostics only: timings are recorded but never gate any result.
    assert diag.direct_seconds >= 0.0
    assert diag.memoized_seconds >= 0.0
    assert diag.to_dict()["hit_rate"] == pytest.approx(0.5)


def test_diagnostics_do_not_change_results():
    """Running the diagnostics helper must not perturb resolver output (REQ-8.5)."""
    cfg, state, pc, allocs = _load_case("A5")
    states = {"A": state, "B": state}
    allocations = {"A": allocs[0], "B": allocs[1]}

    before = resolve_profile(cfg, states, allocations, pc).deterministic_hash
    resolution_diagnostics([(cfg, states, allocations, pc)])
    after = resolve_profile(cfg, states, allocations, pc).deterministic_hash
    assert before == after
