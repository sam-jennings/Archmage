"""Search a SINGLE shared input set giving Deck A (4E) and Deck B (5E) tables
that are as close as possible for sizes 3-9. Shared scale set so A's PT15=100
(B's PT15 left free). Then blend into one shared table, A-weighted above size 9.
"""
import math
from _m2b import baselines, scores, check, bm, rnd

NEAR = range(3, 10)   # sizes 3..9 : minimise A-B divergence here
COLS = (0, 1, 2)      # Conj, TF, PT (Ench handled separately)


def a_scale(baseA, lam, trole):
    unit = scores(baseA, lam, 1.0, trole)[15][0]  # Conj15 unit (=PT15 identity)
    return None if unit <= 0 else 100.0 / unit


def divergence(scA, scB, weights=(1, 1, 1)):
    d = 0.0
    for n in NEAR:
        for c in COLS:
            a, b = scA[n][c], scB[n][c]
            if a is not None and b is not None:
                d += weights[c] * abs(a - b)
    return d


def a_ok(scA):
    ok, tabs = check(scA)   # enforces C3=0, all>0, strict inc, PT15=100, PT>=TF
    return ok


def b_sane(scB):
    # B: >0 (except C3=0 allowed), strictly increasing, PT>=TF ; PT15 free
    conj = [rnd(scB[n][0]) for n in range(3, 16)]
    tf = [rnd(scB[n][1]) for n in range(3, 16)]
    pt = [rnd(scB[n][2]) for n in range(3, 16)]
    ench = [rnd(scB[n][3]) for n in range(3, 16)]
    if conj[0] != 0:
        return False
    for arr in (conj, tf, pt, ench):
        for i, v in enumerate(arr):
            if v is None:
                continue
            if arr is conj and i == 0:
                continue
            if v <= 0:
                return False

    def strict(a):
        s = [v for v in a if v is not None]
        return all(y > x for x, y in zip(s, s[1:]))
    if not (strict(conj) and strict(tf) and strict(pt) and strict(ench)):
        return False
    for i in range(13):
        if pt[i] is not None and tf[i] is not None and pt[i] < tf[i]:
            return False
    return True


def search(weights=(1, 1, 1), require_b_sane=True):
    best = None
    ai = 0.70
    while ai <= 0.9001:
        alpha = round(ai, 4)
        bA = baselines(4, alpha); bB = baselines(5, alpha)
        li = 0.10
        while li <= 0.6001:
            lam = round(li, 4)
            tri = 0.0
            while tri <= 1.5001:
                tr = round(tri, 3)
                sc = a_scale(bA, lam, tr)
                if sc:
                    scA = scores(bA, lam, sc, tr)
                    if a_ok(scA):
                        scB = scores(bB, lam, sc, tr)
                        if (not require_b_sane) or b_sane(scB):
                            d = divergence(scA, scB, weights)
                            marginA = min(bm(v) for n in range(3, 16) for v in scA[n] if v is not None)
                            key = (round(d, 4), -marginA)
                            if best is None or key < best[0]:
                                best = (key, alpha, lam, sc, tr, scA, scB)
                tri += 0.05
            li += 0.01
        ai += 0.005
    return best


def show(scA, scB):
    print("size |  A: C  TF  PT  E  |  B: C  TF  PT  E  |  dC dTF dPT (rounded diff)")
    for n in range(3, 16):
        a = [rnd(x) for x in scA[n]]
        b = [rnd(x) for x in scB[n]]

        def s(v):
            return " -" if v is None else f"{v:2d}"
        dc = "" if (a[0] is None or b[0] is None) else abs(a[0] - b[0])
        dt = "" if (a[1] is None or b[1] is None) else abs(a[1] - b[1])
        dp = "" if (a[2] is None or b[2] is None) else abs(a[2] - b[2])
        mark = "  <=9" if n <= 9 else ""
        print(f" {n:2d}  | {s(a[0])} {s(a[1])} {s(a[2])} {s(a[3])} | {s(b[0])} {s(b[1])} {s(b[2])} {s(b[3])} |  {dc} {dt} {dp}{mark}")


if __name__ == '__main__':
    for w in [(1, 1, 1), (1, 1, 2), (2, 1, 2)]:
        best = search(weights=w, require_b_sane=True)
        if not best:
            print(f"weights={w}: no feasible (with B sane)")
            continue
        key, alpha, lam, sc, tr, scA, scB = best
        print(f"\n==== weights C/TF/PT={w}  divergence(3-9,unrounded)={key[0]}  Amargin={-key[1]:.3f} ====")
        print(f"shared inputs: alpha={alpha}  lambda={lam}  scale={round(sc,4)}  trole={tr}  (ptm=0.65)")
        print(f"B PT15 (unrounded) = {scB[15][2]:.2f}  -> rounds {rnd(scB[15][2])}")
        show(scA, scB)
