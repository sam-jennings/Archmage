"""Build ONE shared table for Deck A (4E) and Deck B (5E) by blending each deck's
own optimal table: midpoint for sizes 3-9 (as close as possible to both), ramping
to pure-A for sizes 10-15. Also shows why a single shared input set can't work.
"""
import math
from _m2 import build_model, DEFAULT

A_INPUTS = {**DEFAULT, 'B7': 0.816, 'B23': 0.27, 'B25': 3.4,  'B36': 0.15}
B_INPUTS = {**DEFAULT, 'B7': 0.84,  'B23': 0.28, 'B25': 3.04, 'B36': 0.0}
COLS = ('Conj', 'TF', 'PT', 'Ench')


def rnd(x):
    return None if x is None else int(math.floor(x + 0.5))


def deck_unrounded(inputs, deck):
    r = build_model(inputs)
    return {n: (r[(deck, n)]['scoreC'], r[(deck, n)]['scoreT'],
                r[(deck, n)]['scorePT'], r[(deck, n)]['scoreEnch']) for n in range(3, 16)}


def weight(n):
    if n <= 9:
        return 0.5
    return 0.5 + 0.5 * (n - 9) / 6.0   # 0.583,0.667,0.75,0.833,0.917,1.0


A = deck_unrounded(A_INPUTS, 1)   # deck A = deck1 (4E), its own optimal inputs
B = deck_unrounded(B_INPUTS, 2)   # deck B = deck2 (5E), its own optimal inputs

# ---- shared blended table ----
shared_un = {}
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
    shared_un[n] = tuple(row)

sh = {n: tuple(rnd(v) for v in shared_un[n]) for n in range(3, 16)}
Ar = {n: tuple(rnd(v) for v in A[n]) for n in range(3, 16)}
Br = {n: tuple(rnd(v) for v in B[n]) for n in range(3, 16)}

print("=== Deck A optimal vs Deck B optimal (rounded points) and A-B gap at 3-9 ===")
print("size |  A:C TF PT E  |  B:C TF PT E  | gap C/TF/PT")
tot = 0
for n in range(3, 16):
    a, b = Ar[n], Br[n]
    def s(v): return " -" if v is None else f"{v:3d}"
    if n <= 9:
        g = tuple(abs(a[i]-b[i]) for i in range(3))
        tot += sum(g)
        gs = f"{g[0]} {g[1]} {g[2]}  <=9"
    else:
        gs = ""
    print(f" {n:2d}  | {s(a[0])}{s(a[1])}{s(a[2])}{s(a[3])} | {s(b[0])}{s(b[1])}{s(b[2])}{s(b[3])} | {gs}")
print(f"total rounded gap over sizes 3-9 (C+TF+PT) = {tot}")

print("\n=== SHARED blended table (w=0.5 at n<=9, ramp to 1.0=A at n=15) ===")
print("size | Conj  TF  PT  Ench |  w")
for n in range(3, 16):
    r = sh[n]
    def s(v): return "  -" if v is None else f"{v:3d}"
    print(f" {n:2d}  | {s(r[0])} {s(r[1])} {s(r[2])} {s(r[3])}  | {weight(n):.2f}")

# ---- verify shared table properties ----
conj=[sh[n][0] for n in range(3,16)]; tf=[sh[n][1] for n in range(3,16)]
pt=[sh[n][2] for n in range(3,16)]; ench=[sh[n][3] for n in range(3,16)]
def strict(a):
    ss=[v for v in a if v is not None]; return all(y>x for x,y in zip(ss,ss[1:]))
print("\nSHARED checks:",
      "C3==0" if conj[0]==0 else f"C3={conj[0]}!!",
      "| all>0" if all(v>0 for lbl,arr in (('c',conj),('t',tf),('p',pt),('e',ench)) for i,v in enumerate(arr) if v is not None and not(lbl=='c' and i==0)) else "| ZERO!!",
      "| incr" if strict(conj) and strict(tf) and strict(pt) and strict(ench) else "| NOT-INCR!!",
      "| PT15=%d"%pt[-1],
      "| PT>=TF" if all(pt[i]>=tf[i] for i in range(13) if pt[i] is not None and tf[i] is not None) else "| PT<TF!!")

# ---- show why a single shared input set fails: B under A's inputs ----
print("\n=== Deck B UNDER DECK A's inputs (why one shared input set breaks B) ===")
Bshared = deck_unrounded(A_INPUTS, 2)
bs=[rnd(Bshared[n][0]) for n in range(3,16)]
print("B Conj under A inputs:", bs, "-> strictly increasing?", strict(bs))
print("B PT15 under A inputs:", rnd(Bshared[15][2]))
