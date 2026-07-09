import math, json
from math import comb, log, exp
from _m2 import DEFAULT

R = 15; m = 15


def baselines(E, alpha):
    """Return dict n -> (baseC, baseT, basePT, baseEnch) for a deck of E energies."""
    N = E * R
    fixed = {}
    for n in range(3, R + 1):
        vC = E * comb(R, n); vT = (R - n + 1) * (E ** n); vPT = E * (R - n + 1)
        vE = R * comb(E, n) if n <= E else None

        def d(valid, ench=False):
            if valid is None:
                return None
            ev = 0 if m < n else valid * comb(N - n, m - n) / comb(N, m)
            p = ev if ev < 1e-8 else 1 - exp(-ev)
            return -log(p)
        fixed[n] = (d(vC), d(vT), d(vPT), (d(vE) if n <= E else None))
    marg = {}
    bpC = bpT = bpPT = bpE = None
    for n in range(3, R + 1):
        if n == 3:
            bpC = E * comb(R, 3) / comb(N, 3)
            bpT = (R - 2) * (E ** 3) / comb(N, 3)
            bpPT = E * (R - 2) / comb(N, 3)
            bpE = (R * comb(E, 3) / comb(N, 3)) if 3 <= E else None
        else:
            k = n - 1
            bpC *= (R - k) / (N - k)
            bpT *= ((max(R - k - 1, 0) * 2 * E) + (2 * E)) / ((R - k + 1) * (N - k))
            bpPT *= ((max(R - k - 1, 0) * 2) + 2) / ((R - k + 1) * (N - k))
            extE = ((E - k) / (N - k)) if k < E else None
            bpE = None if (extE is None or bpE is None) else bpE * extE
        marg[n] = (-log(bpC), -log(bpT), -log(bpPT), (-log(bpE) if bpE else None))
    base = {}
    for n in range(3, R + 1):
        out = []
        for j in range(4):
            fd, md = fixed[n][j], marg[n][j]
            out.append(None if (fd is None or md is None) else alpha * fd + (1 - alpha) * md)
        base[n] = tuple(out)
    return base


def rnd(x):
    return None if x is None else math.floor(x + 0.5)


def bm(v):
    return 1.0 if v is None else abs((v - math.floor(v)) - 0.5)


def scores(base, lam, scale, trole, ptm=0.65, horizon=2, draw=1, clock=0.25,
           arr=0.6, fric=0.8, cap=0.75, g=(1, 3, 5)):
    out = {}
    for n in range(3, 16):
        eC, eT, ePT, eEn = base[n]
        I = horizon * max(0, draw - clock) * (1 if n < 6 else 2)
        J = horizon * max(0, arr - fric)
        K = ptm * (I + J)
        Q = max(0, eC - lam * I)
        Radj = max(0, eT - lam * J + trole)
        if n == 15:
            S = Q
        else:
            S = max(0, ePT - lam * K)
        if eEn is not None:
            gain = g[0] if n == 3 else (g[1] if n == 4 else (g[2] if n == 5 else None))
            L = horizon * cap * gain if gain is not None else None
            T = max(0, eEn - lam * L) if L is not None else None
        else:
            T = None
        out[n] = (Q * scale, Radj * scale, S * scale, (T * scale if T is not None else None))
    return out


def check(sc):
    conj = [rnd(sc[n][0]) for n in range(3, 16)]
    tf = [rnd(sc[n][1]) for n in range(3, 16)]
    pt = [rnd(sc[n][2]) for n in range(3, 16)]
    ench = [rnd(sc[n][3]) for n in range(3, 16)]
    ok = True
    if conj[0] != 0:
        ok = False
    for label, arr in (("C", conj), ("T", tf), ("P", pt), ("E", ench)):
        for i, v in enumerate(arr):
            if v is None:
                continue
            if label == "C" and i == 0:
                continue
            if v <= 0:
                ok = False

    def strict(a):
        s = [v for v in a if v is not None]
        return all(y > x for x, y in zip(s, s[1:]))
    if not (strict(conj) and strict(tf) and strict(pt) and strict(ench)):
        ok = False
    if pt[-1] != 100:
        ok = False
    for i in range(13):
        if pt[i] is not None and tf[i] is not None and pt[i] < tf[i]:
            ok = False
    return ok, (conj, tf, pt, ench)


def search(E):
    best = None
    ai = 0.70
    while ai <= 0.90:
        base = baselines(E, round(ai, 4))
        q15base = base[15][0]  # baseC at 15
        li = 0.10
        while li <= 0.80:
            lam = round(li, 4)
            # conj feasibility with scale = 100/Q15
            Q15 = max(0, q15base - lam * (2 * 2 * (1 - 0.25)))  # I(15)=horizon*(draw-clock)*2=2*0.75*2=3
            if Q15 <= 0:
                li += 0.0025; continue
            scale0 = 100.0 / Q15
            sc = scores(base, lam, scale0, 0.0)
            rc = [rnd(sc[n][0]) for n in range(3, 16)]
            if rc[0] == 0 and all(rc[i] > 0 for i in range(1, 13)) and all(y > x for x, y in zip(rc, rc[1:])):
                tri = 0.0
                while tri <= 2.0:
                    tr = round(tri, 3)
                    q2 = max(0, base[15][0] - lam * 3)
                    for sm in range(-45, 46, 5):
                        scale = (100 + sm / 1000) / q2
                        sc2 = scores(base, lam, scale, tr)
                        ok, tabs = check(sc2)
                        if ok:
                            mm = min(bm(v) for n in range(3, 16) for v in sc2[n] if v is not None)
                            if best is None or mm > best[0]:
                                best = (mm, round(ai, 4), lam, scale, tr, tabs)
                    tri += 0.05
            li += 0.0025
        ai += 0.0025
    return best


if __name__ == '__main__':
    b = search(5)
    if b:
        mm, alpha, lam, scale, tr, (conj, tf, pt, ench) = b
        print(f"Deck 2 best: min-margin={mm:.4f}")
        print(f"  alpha={alpha}  lambda={lam}  scale={round(scale,5)}  trole={tr}  (ptm=0.65 default)")
        print("  Conj", conj)
        print("  TF  ", tf)
        print("  PT  ", pt)
        print("  Ench", [e for e in ench if e is not None])
        json.dump({'B7': alpha, 'B23': lam, 'B25': scale, 'B36': tr}, open("_deck2.json", "w"))
        print("saved _deck2.json")
    else:
        print("no solution")
