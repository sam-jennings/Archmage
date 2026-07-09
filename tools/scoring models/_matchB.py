"""Re-tune Deck B (5E) to hug Deck A (4E) over sizes 3-9, with FREE scale
(PT15=100 ceiling relaxed for B). Then A-favoured blend into the shared table.
Deck A stays fixed at its optimal set.
"""
import math
from _m2b import baselines, scores, bm, rnd

# Deck A fixed optimal
A_ALPHA, A_LAM, A_SCALE, A_TR = 0.816, 0.27, 3.4, 0.15
baseA = baselines(4, A_ALPHA)
A = scores(baseA, A_LAM, A_SCALE, A_TR)   # dict n -> (C,TF,PT,Ench) unrounded

NEAR = range(3, 10)          # match region 3..9
COLW = (1.0, 1.0, 1.0)       # weight Conj/TF/PT equally


def b_sane(sc):
    conj = [rnd(sc[n][0]) for n in range(3, 16)]
    tf = [rnd(sc[n][1]) for n in range(3, 16)]
    pt = [rnd(sc[n][2]) for n in range(3, 16)]
    ench = [rnd(sc[n][3]) for n in range(3, 16)]
    if conj[0] != 0:
        return False
    for arr, is_c in ((conj, True), (tf, False), (pt, False), (ench, False)):
        for i, v in enumerate(arr):
            if v is None:
                continue
            if is_c and i == 0:
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


def divergence(B):
    d = 0.0
    for n in NEAR:
        for c in range(3):
            if A[n][c] is not None and B[n][c] is not None:
                d += COLW[c] * abs(A[n][c] - B[n][c])
    return d


def search():
    best = None
    ai = 0.70
    while ai <= 0.9001:
        alpha = round(ai, 4)
        baseB = baselines(5, alpha)
        li = 0.10
        while li <= 0.6001:
            lam = round(li, 4)
            ti = 0.0
            while ti <= 1.0001:
                tr = round(ti, 3)
                unit = scores(baseB, lam, 1.0, tr)     # scale = 1
                s = 1.5
                while s <= 4.5001:
                    B = {n: tuple(None if unit[n][c] is None else s * unit[n][c] for c in range(4))
                         for n in range(3, 16)}
                    if b_sane(B):
                        d = divergence(B)
                        if best is None or d < best[0]:
                            best = (d, alpha, lam, round(s, 4), tr, B)
                    s += 0.02
                ti += 0.05
            li += 0.01
        ai += 0.005
    return best


best = search()
d, alpha, lam, s, tr, B = best
print(f"Re-tuned Deck B: alpha={alpha} lambda={lam} scale={round(s,4)} trole={tr}  (ptm=0.65)")
print(f"  divergence(3-9, unrounded, C+TF+PT) = {d:.3f}   B PT15 (relaxed) = {rnd(B[15][2])}")

print("\n A vs re-tuned B (rounded), gap at 3-9:")
print("size |  A:C TF PT |  B:C TF PT | gap C/TF/PT")
old_gap_c = {6: 1, 7: 3, 8: 3, 9: 3}
for n in range(3, 16):
    a = [rnd(A[n][c]) for c in range(3)]
    b = [rnd(B[n][c]) for c in range(3)]
    if n <= 9:
        g = [abs(a[c] - b[c]) for c in range(3)]
        gs = f"{g[0]} {g[1]} {g[2]}"
    else:
        gs = ""
    print(f" {n:2d}  | {a[0]:3d}{a[1]:3d}{a[2]:3d} | {b[0]:3d}{b[1]:3d}{b[2]:3d} | {gs}")


def weight(n, low=0.65):
    # A-favoured: 'low' weight on A for n<=9 (favours A since >0.5), ramp to 1.0 at 15
    if n <= 9:
        return low
    return low + (1.0 - low) * (n - 9) / 6.0


print("\nShared table = A-favoured blend of A and re-tuned B (wA=0.65 at n<=9 -> 1.0 at 15):")
print("size | Conj TF  PT  Ench |  A-err(C/TF/PT)  B-err(C/TF/PT)")
sh = {}
for n in range(3, 16):
    w = weight(n)
    row = []
    for c in range(4):
        a, b = A[n][c], B[n][c]
        if a is None and b is None:
            row.append(None)
        elif a is None:
            row.append(b)
        elif b is None:
            row.append(a)
        else:
            row.append(w * a + (1 - w) * b)
    sh[n] = tuple(rnd(v) if v is not None else None for v in row)
    ae = [sh[n][c] - rnd(A[n][c]) for c in range(3)]
    be = [sh[n][c] - rnd(B[n][c]) for c in range(3)]
    def s4(v): return "  -" if v is None else f"{v:3d}"
    print(f" {n:2d}  | {s4(sh[n][0])}{s4(sh[n][1])}{s4(sh[n][2])} {s4(sh[n][3])} | "
          f"{ae[0]:+d}/{ae[1]:+d}/{ae[2]:+d}   {be[0]:+d}/{be[1]:+d}/{be[2]:+d}")

# verify shared sane
conj=[sh[n][0] for n in range(3,16)]; tf=[sh[n][1] for n in range(3,16)]
pt=[sh[n][2] for n in range(3,16)]; ench=[sh[n][3] for n in range(3,16)]
def strict(a):
    ss=[v for v in a if v is not None]; return all(y>x for x,y in zip(ss,ss[1:]))
print("\nshared checks:", "C3=0" if conj[0]==0 else "C3!!",
      "| incr" if strict(conj) and strict(tf) and strict(pt) and strict(ench) else "| NOTINCR",
      "| PT15=%d"%pt[-1],
      "| PT>=TF" if all(pt[i]>=tf[i] for i in range(13) if pt[i] and tf[i]) else "| PT<TF")

import json
json.dump({'B7':alpha,'B23':lam,'B25':s,'B36':tr}, open("_matchB.json","w"))
