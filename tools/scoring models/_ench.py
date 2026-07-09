"""Diagnose the Enchantment column: score = scale*max(0, baseEnch - lambda*L),
L = horizon*cap*gain, gain=1/3/5 for sizes 3/4/5. Bigger enchantment => bigger
capacity gain => bigger utility discount, which can flatten the top."""
import math
from _m2b import baselines, scores, rnd

CONFIGS = {
    "Deck A (lam0.27,sc3.4)":        (4, 0.816, 0.27, 3.4, 0.15),
    "Deck B standalone (lam0.28,sc3.04)": (5, 0.84, 0.28, 3.04, 0.0),
    "Deck B RE-TUNED (lam0.55,sc3.0)":    (5, 0.79, 0.55, 3.0, 0.15),
}
horizon, cap = 2, 0.75
gain = {3: 1, 4: 3, 5: 5}

for name, (E, alpha, lam, sc, tr) in CONFIGS.items():
    base = baselines(E, alpha)
    scd = scores(base, lam, sc, tr)
    print(f"\n{name}")
    print("  n | baseEnch  L=h*cap*g  discount=lam*L  adj   score  rounded")
    prev = None
    for n in (3, 4, 5):
        be = base[n][3]
        if be is None:
            print(f"  {n} |   (none - {E}E has no size-{n} enchantment)")
            continue
        L = horizon * cap * gain[n]
        disc = lam * L
        adj = max(0, be - disc)
        s = adj * sc
        jump = "" if prev is None else f"  (jump {rnd(s)-prev:+d})"
        print(f"  {n} |  {be:6.3f}   {L:6.2f}     {disc:6.3f}     {adj:5.3f} {s:6.3f}    {rnd(s)}{jump}")
        prev = rnd(s)
