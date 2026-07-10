"""Numerical zero-sum equilibrium for two-player Trials games (VS2).

Covers REQ-12 (zero-sum LP), REQ-13 (canonical maximum-entropy equilibrium and the
equilibrium-relevant set) and impl spec §11.2–11.4. Every floating-point result is
labelled by evidence class and carries its method, tolerances and residuals
(NFR-3); nothing here is ever called "exact".

Zero-sum LP (impl spec §11.2, label ``numerical_lp``)
    :func:`solve_zero_sum` solves the row player's maximin LP and the column
    player's minimax dual with SciPy HiGHS on the integer-exact payoff matrix, and
    records the game value, both optimal mixed strategies, primal/dual feasibility
    residuals, the exploitability gap and convergence status. A theoretical value
    of zero (fixture A4) is verified by ``abs(value) <= 1e-9``.

Canonical maximum-entropy equilibrium (impl spec §11.3, label ``numerical_convex``)
    :func:`max_entropy_equilibrium` maximizes Shannon entropy over the optimal-
    strategy polytope ``{x >= 0, sum x = 1, xᵀM >= value}`` with deterministic
    initialization and fixed solver options, then re-validates the returned point
    against the optimality constraints. If validation fails it does NOT silently
    substitute an arbitrary LP vertex — it reports ``canonical_equilibrium_failed``
    and returns the non-canonical LP strategy separately (impl spec §11.3).

Equilibrium-relevant set (impl spec §11.4)
    :func:`equilibrium_relevant_set` maximizes each strategy's probability over the
    optimal polytope with one LP per strategy, and includes a strategy in
    ``E^{0.01}`` when its maximum mass is at least ``0.01 - 1e-9``.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

import numpy as np
from scipy.optimize import Bounds, LinearConstraint, linprog, minimize

# Fixed tolerances (impl spec §3.4). Printed in every result for auditability.
LP_TOLERANCE = 1e-9
ENTROPY_FEASIBILITY_TOLERANCE = 1e-8
# Optimality slack: how far below the game value the entropy maximizer may sit and
# still be accepted as a numerical optimum.
ENTROPY_OPTIMALITY_TOLERANCE = 1e-6
# Slack used to describe the optimal polytope numerically for the entropy /
# equilibrium-mass programs, so LP round-off does not exclude true optima.
POLYTOPE_SLACK = 1e-7
E_MASS_THRESHOLD = 0.01
E_MASS_TOLERANCE = 1e-9

LP_METHOD = "scipy.optimize.linprog(method='highs')"
ENTROPY_METHOD = "scipy.optimize.minimize(method='trust-constr')"
_HIGHS = "highs"

NUMERICAL_LP = "numerical_lp"
NUMERICAL_CONVEX = "numerical_convex"


# --------------------------------------------------------------------------- #
# Zero-sum LP (REQ-12; impl spec §11.2)                                        #
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class ZeroSumSolution:
    """A numerically-solved two-player zero-sum game (label ``numerical_lp``).

    ``value`` is the row player's game value; ``row_strategy`` / ``col_strategy``
    are optimal mixed strategies. Residuals expose the numerical quality (NFR-3):
    ``primal_residual`` is the worst maximin-constraint violation, ``value_gap`` is
    ``|value_row - value_col|`` between the primal and dual objectives, and
    ``exploitability`` is the column ceiling minus the row guarantee.
    """

    utility: str  # "win" | "margin"
    value: float
    row_strategy: np.ndarray
    col_strategy: np.ndarray
    primal_residual: float
    dual_residual: float
    value_gap: float
    exploitability: float
    status: str
    success: bool
    method: str = LP_METHOD
    tolerance: float = LP_TOLERANCE
    evidence_class: str = NUMERICAL_LP


def _solve_row_maximin(M: np.ndarray) -> tuple[float, np.ndarray, object]:
    """Solve max_x min_j (xᵀM)_j with x a distribution (row player)."""
    n, m = M.shape
    # z = [x_0..x_{n-1}, v]; maximize v -> minimize -v.
    c = np.zeros(n + 1)
    c[-1] = -1.0
    # For each column j: v - sum_i x_i M[i,j] <= 0.
    A_ub = np.zeros((m, n + 1))
    for j in range(m):
        A_ub[j, :n] = -M[:, j]
        A_ub[j, n] = 1.0
    b_ub = np.zeros(m)
    A_eq = np.zeros((1, n + 1))
    A_eq[0, :n] = 1.0
    b_eq = np.array([1.0])
    bounds = [(0.0, None)] * n + [(None, None)]
    res = linprog(c, A_ub=A_ub, b_ub=b_ub, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method=_HIGHS)
    if not res.success:
        return (float("nan"), np.full(n, np.nan), res)
    x = np.asarray(res.x[:n], dtype=float)
    x = np.clip(x, 0.0, None)
    if x.sum() > 0:
        x = x / x.sum()
    return (float(res.x[n]), x, res)


def _solve_col_minimax(M: np.ndarray) -> tuple[float, np.ndarray, object]:
    """Solve min_y max_i (My)_i with y a distribution (column player)."""
    n, m = M.shape
    # z = [y_0..y_{m-1}, w]; minimize w.
    c = np.zeros(m + 1)
    c[-1] = 1.0
    # For each row i: sum_j M[i,j] y_j - w <= 0.
    A_ub = np.zeros((n, m + 1))
    for i in range(n):
        A_ub[i, :m] = M[i, :]
        A_ub[i, m] = -1.0
    b_ub = np.zeros(n)
    A_eq = np.zeros((1, m + 1))
    A_eq[0, :m] = 1.0
    b_eq = np.array([1.0])
    bounds = [(0.0, None)] * m + [(None, None)]
    res = linprog(c, A_ub=A_ub, b_ub=b_ub, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method=_HIGHS)
    if not res.success:
        return (float("nan"), np.full(m, np.nan), res)
    y = np.asarray(res.x[:m], dtype=float)
    y = np.clip(y, 0.0, None)
    if y.sum() > 0:
        y = y / y.sum()
    return (float(res.x[m]), y, res)


def solve_zero_sum(matrix: np.ndarray, utility: str = "win") -> ZeroSumSolution:
    """Solve the finite two-player zero-sum game with payoff ``matrix`` (REQ-12.3/12.5).

    ``matrix`` is the ROW player's integer payoff; the column player minimizes it.
    Returns the value, both optimal mixed strategies and full numerical diagnostics
    labelled ``numerical_lp`` (never "exact", impl spec §3.4).
    """
    M = np.asarray(matrix, dtype=float)
    value_row, x, res_row = _solve_row_maximin(M)
    value_col, y, res_col = _solve_col_minimax(M)

    success = bool(res_row.success and res_col.success)
    status = f"row:{res_row.message} | col:{res_col.message}"

    if success:
        # Row guarantee: worst column response to x. Column ceiling: best row
        # response to y. At equilibrium they coincide (exploitability ~ 0).
        col_values = M.T @ x  # (xᵀM)_j
        row_guarantee = float(col_values.min())
        row_values = M @ y  # (My)_i
        col_ceiling = float(row_values.max())
        primal_residual = float(max(0.0, value_row - row_guarantee))
        dual_residual = float(max(0.0, col_ceiling - value_col))
        value_gap = float(abs(value_row - value_col))
        exploitability = float(col_ceiling - row_guarantee)
        value = 0.5 * (value_row + value_col)
    else:
        primal_residual = dual_residual = value_gap = exploitability = float("nan")
        value = value_row

    return ZeroSumSolution(
        utility=utility,
        value=value,
        row_strategy=x,
        col_strategy=y,
        primal_residual=primal_residual,
        dual_residual=dual_residual,
        value_gap=value_gap,
        exploitability=exploitability,
        status=status,
        success=success,
    )


# --------------------------------------------------------------------------- #
# Canonical maximum-entropy equilibrium (REQ-13; impl spec §11.3)              #
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class MaxEntropyEquilibrium:
    """Maximum-Shannon-entropy point of the optimal-strategy polytope (label
    ``numerical_convex``).

    ``valid`` is False and ``status`` is ``canonical_equilibrium_failed`` when the
    entropy solve does not validate against the optimality constraints; in that case
    ``probabilities`` holds the non-canonical LP strategy and callers must treat the
    canonical equilibrium as unavailable rather than trusting an arbitrary vertex
    (impl spec §11.3).
    """

    value: float
    probabilities: np.ndarray
    entropy: float
    normalized_entropy: float
    support_1e_9: int
    support_1e_3: int
    support_1e_2: int
    feasibility_residual: float
    optimality_residual: float
    status: str
    valid: bool
    method: str = ENTROPY_METHOD
    tolerance: float = ENTROPY_FEASIBILITY_TOLERANCE
    evidence_class: str = NUMERICAL_CONVEX


def _shannon_entropy(x: np.ndarray) -> float:
    x = np.asarray(x, dtype=float)
    nz = x[x > 0]
    return float(-np.sum(nz * np.log(nz)))


def max_entropy_equilibrium(
    matrix: np.ndarray, value: Optional[float] = None
) -> MaxEntropyEquilibrium:
    """Canonical maximum-entropy equilibrium for the ROW player (REQ-13.1/13.2/13.3).

    Maximizes Shannon entropy over the optimal-strategy polytope
    ``{x >= 0, sum x = 1, xᵀM >= value}`` with SciPy ``trust-constr`` on linear
    constraints (deterministic uniform initialization, fixed options, analytic
    gradient and Hessian), then re-validates the returned point against the
    optimality constraints *independently of the solver's own success flag*
    (Task 21). On validation failure it does NOT substitute an arbitrary LP vertex
    silently — it reports ``canonical_equilibrium_failed`` and returns the
    non-canonical LP strategy separately (impl spec §11.3).
    """
    M = np.asarray(matrix, dtype=float)
    n, m = M.shape

    if value is None:
        value, _x, _res = _solve_row_maximin(M)

    # Objective: minimize sum x_i log x_i (= -entropy). Safe at x_i = 0.
    def neg_entropy(x: np.ndarray) -> float:
        nz = x[x > 1e-300]
        return float(np.sum(nz * np.log(nz)))

    def neg_entropy_grad(x: np.ndarray) -> np.ndarray:
        return np.log(np.clip(x, 1e-15, None)) + 1.0

    def neg_entropy_hess(x: np.ndarray) -> np.ndarray:
        return np.diag(1.0 / np.clip(x, 1e-12, None))

    # Optimal polytope as linear constraints (trust-constr handles them natively,
    # so no quasi-Newton constraint-linearity warning is emitted):
    #   equality   sum x = 1
    #   inequality (xᵀM)_j >= value - slack   for every column j
    # A small slack keeps LP round-off from excluding the true optimal face.
    constraints = [
        LinearConstraint(np.ones((1, n)), 1.0, 1.0),
        LinearConstraint(M.T, value - POLYTOPE_SLACK, np.inf),
    ]
    bounds = Bounds(np.zeros(n), np.ones(n))
    x0 = np.full(n, 1.0 / n)
    res = minimize(
        neg_entropy,
        x0,
        jac=neg_entropy_grad,
        hess=neg_entropy_hess,
        bounds=bounds,
        constraints=constraints,
        method="trust-constr",
        options={"maxiter": 3000, "gtol": 1e-10, "xtol": 1e-12, "verbose": 0},
    )

    x = np.asarray(res.x, dtype=float)
    x = np.clip(x, 0.0, None)
    if x.sum() > 0:
        x = x / x.sum()

    # Validate: simplex feasibility and optimality (guarantees at least the value).
    # Validation is independent of res.success so a conservative solver flag does
    # not reject a numerically-optimal point (Task 21).
    col_values = M.T @ x
    feasibility_residual = float(abs(x.sum() - 1.0) + max(0.0, -x.min()))
    optimality_residual = float(max(0.0, value - float(col_values.min())))
    valid = bool(
        feasibility_residual <= ENTROPY_FEASIBILITY_TOLERANCE
        and optimality_residual <= ENTROPY_OPTIMALITY_TOLERANCE
    )

    entropy = _shannon_entropy(x)
    normalized = float(entropy / np.log(n)) if n > 1 else 0.0
    status = f"ok (solver_status={res.status})" if valid else "canonical_equilibrium_failed"

    if not valid:
        # Do not substitute silently: return the LP vertex as the (non-canonical)
        # strategy so the caller can see the fallback explicitly (impl spec §11.3).
        _v, lp_x, _res = _solve_row_maximin(M)
        x = lp_x
        entropy = _shannon_entropy(x)
        normalized = float(entropy / np.log(n)) if n > 1 else 0.0

    return MaxEntropyEquilibrium(
        value=float(value),
        probabilities=x,
        entropy=entropy,
        normalized_entropy=normalized,
        support_1e_9=int(np.sum(x > 1e-9)),
        support_1e_3=int(np.sum(x > 1e-3)),
        support_1e_2=int(np.sum(x > 1e-2)),
        feasibility_residual=feasibility_residual,
        optimality_residual=optimality_residual,
        status=status,
        valid=valid,
    )


def max_entropy_equilibrium_column(
    matrix: np.ndarray, value: Optional[float] = None
) -> MaxEntropyEquilibrium:
    """Canonical maximum-entropy equilibrium for the COLUMN player of ``matrix``.

    The column player of the row-payoff game ``M`` minimizes the row's payoff; that
    is exactly the row player of the transformed game ``N = -Mᵀ`` (maximizing
    ``-Mᵀ`` over the columns of ``M`` minimizes ``max_i (My)_i``). This returns the
    canonical max-entropy point of the column player's optimal-strategy polytope by
    solving :func:`max_entropy_equilibrium` on ``N`` at value ``-value``.

    ``probabilities`` is the column mixture ``y`` (a distribution over the columns
    of ``M``). At an identical-state (parity) game the payoff matrix is
    antisymmetric, so ``y`` equals the row mixture from
    :func:`max_entropy_equilibrium`; the two are computed separately so the metric
    layer already has the per-side mixture it will need for asymmetric states
    (design §10.1; audit D1/D4). ``value`` is the ROW game value; the transformed
    game's value is ``-value``.
    """
    M = np.asarray(matrix, dtype=float)
    if value is None:
        value, _x, _res = _solve_row_maximin(M)
    col_eq = max_entropy_equilibrium(-M.T, -float(value))
    # Report the column equilibrium against the ORIGINAL row game value, so callers
    # read a consistent ``value`` regardless of which side's mixture they asked for.
    return MaxEntropyEquilibrium(
        value=float(value),
        probabilities=col_eq.probabilities,
        entropy=col_eq.entropy,
        normalized_entropy=col_eq.normalized_entropy,
        support_1e_9=col_eq.support_1e_9,
        support_1e_3=col_eq.support_1e_3,
        support_1e_2=col_eq.support_1e_2,
        feasibility_residual=col_eq.feasibility_residual,
        optimality_residual=col_eq.optimality_residual,
        status=col_eq.status,
        valid=col_eq.valid,
    )


# --------------------------------------------------------------------------- #
# Equilibrium-relevant set E^{0.01} (REQ-13.4/13.5; impl spec §11.4)           #
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class EquilibriumRelevantSet:
    """Per-strategy maximum equilibrium mass and the ``E^{0.01}`` membership.

    ``max_mass[i]`` is the largest probability strategy ``i`` can carry in any
    optimal equilibrium; ``included`` lists the strategy indices with
    ``max_mass >= 0.01 - 1e-9`` (REQ-13.5).
    """

    value: float
    max_mass: np.ndarray
    included: list[int]
    threshold: float = E_MASS_THRESHOLD
    tolerance: float = E_MASS_TOLERANCE
    method: str = LP_METHOD

    @property
    def size(self) -> int:
        return len(self.included)


def maximize_equilibrium_mass(matrix: np.ndarray, strategy_index: int, value: Optional[float] = None) -> float:
    """Maximum probability strategy ``strategy_index`` can carry in any optimum (REQ-13.4)."""
    M = np.asarray(matrix, dtype=float)
    n, m = M.shape
    if value is None:
        value, _x, _res = _solve_row_maximin(M)
    # maximize x_k -> minimize -x_k over the optimal polytope.
    c = np.zeros(n)
    c[strategy_index] = -1.0
    # for each column j: (xᵀM)_j >= value - slack  <=>  -(Mᵀ x)_j <= -(value - slack)
    A_ub = -M.T
    b_ub = -np.full(m, value - POLYTOPE_SLACK)
    A_eq = np.ones((1, n))
    b_eq = np.array([1.0])
    bounds = [(0.0, 1.0)] * n
    res = linprog(c, A_ub=A_ub, b_ub=b_ub, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method=_HIGHS)
    if not res.success:
        return float("nan")
    return float(res.x[strategy_index])


def equilibrium_relevant_set(matrix: np.ndarray, value: Optional[float] = None) -> EquilibriumRelevantSet:
    """Compute ``E^{0.01}``: strategies with max equilibrium mass >= 0.01 - 1e-9 (REQ-13.5)."""
    M = np.asarray(matrix, dtype=float)
    n, _m = M.shape
    if value is None:
        value, _x, _res = _solve_row_maximin(M)
    masses = np.array([maximize_equilibrium_mass(M, i, value) for i in range(n)], dtype=float)
    included = [i for i in range(n) if masses[i] >= E_MASS_THRESHOLD - E_MASS_TOLERANCE]
    return EquilibriumRelevantSet(value=float(value), max_mass=masses, included=included)
