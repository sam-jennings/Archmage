"""Gather data for the score-table methodology write-up:
1. ReadMe sheet text (+ Inputs model notes)  -> accurate model descriptions
2. Raw / Marginal / Fixed-opportunity / Combined difficulty for Conjuration, both decks
3. Baseline difficulty per deck at common alpha (which deck is harder, per spell/size)
4. Per-deck generosity of the shared table (shared score - each deck's fair score)
"""
import json, math
from math import comb, log, exp
import openpyxl

WB = "archmage_scoring_m15_utility_model_v4_formula_corrected.xlsx"
R, M = 15, 15

# ---------- 1. ReadMe + Inputs notes ----------
wb = openpyxl.load_workbook(WB, data_only=True)
print("===== ReadMe sheet =====")
for row in wb["ReadMe"].iter_rows():
    for c in row:
        if c.value not in (None, ""):
            print(f"  {c.value}")

# ---------- difficulty models (Conjuration) ----------
def raw_conj(E, n):
    p = E * comb(R, n) / comb(E * R, n)
    return -log(p)

def marg_conj(E, n):
    N = E * R
    bp = E * comb(R, 3) / comb(N, 3)
    for k in range(4, n + 1):
        bp *= (R - (k - 1)) / (N - (k - 1))
    return -log(bp)

def fixed_conj(E, n, m=M):
    N = E * R
    valid = E * comb(R, n)
    expv = valid * comb(N - n, m - n) / comb(N, m) if m >= n else 0
    p = expv if expv < 1e-8 else 1 - exp(-expv)
    return -log(p)

def combined_conj(E, n, alpha):
    return alpha * fixed_conj(E, n) + (1 - alpha) * marg_conj(E, n)

print("\n===== Conjuration difficulty by model (alpha=0.8 for combined) =====")
for E, name in ((4, "Deck A 4E"), (5, "Deck B 5E")):
    print(f"\n {name}")
    print("  n |   raw   marginal  fixed-opp  combined(0.8)")
    for n in range(3, 16):
        print(f"  {n:2d} | {raw_conj(E,n):7.3f} {marg_conj(E,n):8.3f} {fixed_conj(E,n):9.3f}  {combined_conj(E,n,0.8):9.3f}")

# ---------- 4. per-deck generosity of shared table ----------
data = json.load(open("recorded_target_tables.json", encoding="utf-8"))
COLS = ("Conjuration", "Transfiguration", "PerfectTransmutation", "Enchantment")
A = data["decks"]["deck1"]["scores_rounded"]
B = data["decks"]["deck2"]["scores_rounded"]
S = data["shared_table"]["scores_rounded"]

print("\n===== Shared vs each deck's FAIR (standalone) score; generosity = shared - fair =====")
for ci, col in enumerate(COLS):
    print(f"\n {col}")
    print("  n | shared  A_fair  B_fair | genA  genB")
    for n in range(3, 16):
        s = S[str(n)][col]; a = A[str(n)][col]; b = B[str(n)][col]
        def g(x, y):
            return "  -" if (x is None or y is None) else f"{x-y:+d}"
        ss = "  -" if s is None else f"{s:3d}"
        aa = "  -" if a is None else f"{a:3d}"
        bb = "  -" if b is None else f"{b:3d}"
        print(f"  {n:2d} |  {ss}    {aa}    {bb}  | {g(s,a):>4} {g(s,b):>4}")
