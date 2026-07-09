"""Generate recorded_target_tables.json — the stored input sets + full score
tables (unrounded and rounded) for the target-shaped Deck 1 & Deck 2 tables.

Regenerate after any rebalance:  python record_target_tables.py

Depends on build_model / DEFAULT in _m2.py (the verified formula reimplementation,
confirmed to reproduce the workbook's own values to <1e-9 for both decks).
"""
import json, math
from _m2 import build_model, DEFAULT

WORKBOOK = "archmage_scoring_m15_utility_model_v4_formula_corrected.xlsx"

# The four utility params that change from workbook defaults; everything else default.
CHANGES = {
    "deck1": {"B7": 0.816, "B23": 0.27, "B25": 3.4,  "B36": 0.15},
    "deck2": {"B7": 0.84,  "B23": 0.28, "B25": 3.04, "B36": 0.0},
}
# Deck B re-tuned to HUG Deck A over sizes 3-9 (PT15=100 ceiling relaxed -> free scale).
# Used only to build the shared table; Deck B's own standalone table is CHANGES["deck2"].
RETUNED_B = {"B7": 0.79, "B23": 0.55, "B25": 3.0, "B36": 0.15}
PARAM_LABELS = {
    "B7": "Raw weight alpha", "B23": "Lambda utility weight",
    "B25": "Score scale", "B36": "Transfiguration role incentive",
}
COLS = ("Conjuration", "Transfiguration", "PerfectTransmutation", "Enchantment")


def rnd(x):
    return None if x is None else int(math.floor(x + 0.5))


def deck_raw(deck_idx, changes):
    """Return {n: (Conj, TF, PT, Ench)} unrounded floats for a deck under its inputs."""
    inp = dict(DEFAULT)
    inp.update(changes)
    res = build_model(inp)
    return {n: (res[(deck_idx, n)]["scoreC"], res[(deck_idx, n)]["scoreT"],
                res[(deck_idx, n)]["scorePT"], res[(deck_idx, n)]["scoreEnch"])
            for n in range(3, 16)}


def deck_block(deck_idx, changes):
    inp = dict(DEFAULT)
    inp.update(changes)
    raw = deck_raw(deck_idx, changes)
    unrounded, rounded = {}, {}
    for n in range(3, 16):
        vals = raw[n]
        unrounded[str(n)] = {c: (None if v is None else round(v, 6)) for c, v in zip(COLS, vals)}
        rounded[str(n)] = {c: rnd(v) for c, v in zip(COLS, vals)}
    return {
        "energies": inp["B5"] if deck_idx == 1 else inp["B6"],
        "inputs_full": inp,
        "changed_from_default": {
            cell: {"label": PARAM_LABELS[cell], "default": DEFAULT[cell], "value": val}
            for cell, val in changes.items()
        },
        "scores_unrounded": unrounded,
        "scores_rounded": rounded,
    }


def blend_weight(n, low=0.65):
    """Weight on Deck A. A-favoured: 'low' (>0.5) for sizes <=9, ramping linearly to
    1.0 at size 15. Deck A is the more common deck (4E = 2-4 players), so the shared
    value leans to A even in the matched low-mid range."""
    return low if n <= 9 else low + (1.0 - low) * (n - 9) / 6.0


def shared_block():
    """One shared table for both decks. Deck A = its optimal table (PT15=100). Deck B =
    RE-TUNED with a relaxed ceiling so it hugs A across sizes 3-9, then A-favoured blend
    (weight ramps to Deck A above size 9)."""
    A = deck_raw(1, CHANGES["deck1"])
    B = deck_raw(2, RETUNED_B)             # re-tuned B (relaxed ceiling) -> Conj/TF/PT
    Bench = deck_raw(2, CHANGES["deck2"])  # standalone B -> Enchantment (decoupled: the
    #     C/TF/PT re-tune's high lambda over-discounts Enchantment, flattening its top)
    unrounded, rounded, weights = {}, {}, {}
    for n in range(3, 16):
        w = blend_weight(n)
        weights[str(n)] = round(w, 4)
        row = []
        for c in range(4):
            a, b = A[n][c], (Bench[n][c] if c == 3 else B[n][c])
            if a is None and b is None:
                row.append(None)
            elif a is None:
                row.append(b)
            elif b is None:
                row.append(a)
            else:
                row.append(w * a + (1 - w) * b)
        unrounded[str(n)] = {c: (None if v is None else round(v, 6)) for c, v in zip(COLS, row)}
        rounded[str(n)] = {c: rnd(v) for c, v in zip(COLS, row)}
    # A-vs-(re-tuned B) rounded gap at sizes 3-9 (Conj/TF/PT)
    gap = {}
    for n in range(3, 10):
        ar = tuple(rnd(A[n][c]) for c in range(3))
        br = tuple(rnd(B[n][c]) for c in range(3))
        gap[str(n)] = {COLS[c]: abs(ar[c] - br[c]) for c in range(3)}
    return {
        "method": ("Deck A = its optimal table (PT15=100). Deck B RE-TUNED (alpha 0.79, "
                   "lambda 0.55, scale 3.0, TF-role 0.15; PT15 ceiling relaxed -> free "
                   "scale) to hug Deck A over sizes 3-9. Shared Conj/TF/PT = A-favoured "
                   "blend: weight on A = 0.65 for sizes 3-9, ramping to 1.0 at size 15. "
                   "PT15=100 from A; re-tuned Deck B PT15 lands ~96 (relaxed). ENCHANTMENT "
                   "is decoupled: it uses Deck B STANDALONE (lambda 0.28), not the re-tune, "
                   "because the re-tune's high lambda over-discounts capacity and flattens "
                   "the Enchantment top. Enchantment magnitude remains open (UC/capacity)."),
        "deck_A_inputs": {**DEFAULT, **CHANGES["deck1"]},
        "deck_B_retuned_inputs": {**DEFAULT, **RETUNED_B},
        "deck_B_retuned_PT15": rnd(B[15][2]),
        "enchantment_source": "Deck B standalone (CHANGES.deck2) blended with Deck A; decoupled from the C/TF/PT re-tune",
        "weight_on_A": weights,
        "scores_unrounded": unrounded,
        "scores_rounded": rounded,
        "A_vs_retunedB_rounded_gap_3to9": gap,
    }


store = {
    "title": "Target-shaped utility-model score tables — recorded input sets + scores",
    "not_canon": True,
    "experiment": "vnext-scoring-economy",
    "workbook": "tools/scoring models/" + WORKBOOK,
    "sheet": "Utility_Final_Tables (Deck 1 rows 41-53, Deck 2 rows 95-107)",
    "generated_by": "tools/scoring models/record_target_tables.py",
    "targets": [
        "C3 (Conjuration size 3) rounds to 0",
        "every other score rounds to > 0",
        "each spell column strictly increasing with size",
        "PT15 rounds to 100 (model forces PT15 = Conj15 identity)",
        "PT >= Transfiguration at every size",
    ],
    "notes": [
        "Utility inputs (alpha B7, lambda B23, scale B25, TF-role B36) are GLOBAL; only "
        "deck energies differ (B5=4, B6=5). The workbook holds one deck's config at a time.",
        "Workbook is currently loaded with the deck1 set; fullCalcOnLoad is set so Excel "
        "recalculates on open.",
        "Verified via _m2.build_model (reproduces workbook values <1e-9 both decks). No live "
        "Excel/LibreOffice recalc available in-session.",
        "Revert to stock model: B7=0.8, B23=0.5, B25=2, B36=1.5.",
    ],
    "decks": {
        "deck1": deck_block(1, CHANGES["deck1"]),
        "deck2": deck_block(2, CHANGES["deck2"]),
    },
    "shared_table": shared_block(),
}

with open("recorded_target_tables.json", "w", encoding="utf-8") as f:
    json.dump(store, f, indent=2)

print("wrote recorded_target_tables.json")
for dk in ("deck1", "deck2"):
    d = store["decks"][dk]
    print(f"\n{dk} (energies={d['energies']})  changed:",
          {k: v["value"] for k, v in d["changed_from_default"].items()})
    print("  size  Conj  TF   PT   Ench")
    for n in range(3, 16):
        r = d["scores_rounded"][str(n)]
        e = "" if r["Enchantment"] is None else r["Enchantment"]
        print(f"  {n:>4}  {r['Conjuration']:>4} {r['Transfiguration']:>3} {r['PerfectTransmutation']:>4}  {str(e):>3}")

st = store["shared_table"]
print("\nSHARED table (A-favoured blend: wA=0.65 at n<=9, ramp to 1.0=A at 15)")
print("  size  Conj  TF   PT   Ench   wA")
for n in range(3, 16):
    r = st["scores_rounded"][str(n)]
    e = "" if r["Enchantment"] is None else r["Enchantment"]
    print(f"  {n:>4}  {r['Conjuration']:>4} {r['Transfiguration']:>3} {r['PerfectTransmutation']:>4}  {str(e):>3}"
          f"   {st['weight_on_A'][str(n)]}")
