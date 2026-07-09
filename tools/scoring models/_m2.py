"""Model + Deck 2 search. Temp file; deleted after recording."""
import math
from math import comb, log, exp


def build_model(inp):
    R = inp['B4']; E1 = inp['B5']; E2 = inp['B6']
    alpha = inp['B7']; marg_w = 1 - alpha; m = inp['B9']
    lam = inp['B23']; mu = inp['B24']; scale = inp['B25']
    horizon = inp['B26']; draw = inp['B27']; clock = inp['B28']
    arr = inp['B29']; fric = inp['B30']; ptm = inp['B31']; cap = inp['B32']
    g3 = inp['B33']; g4 = inp['B34']; g5 = inp['B35']; trole = inp['B36']

    results = {}
    for deck, E in ((1, E1), (2, E2)):
        N = E * R
        fixed = {}
        for n in range(3, R + 1):
            validC = E * comb(R, n)
            validT = (R - n + 1) * (E ** n)
            validPT = E * (R - n + 1)
            validEnch = R * comb(E, n) if n <= E else None

            def expected(valid):
                if valid is None:
                    return None
                if m < n:
                    return 0
                return valid * comb(N - n, m - n) / comb(N, m)

            def pge1(ev):
                if ev is None:
                    return None
                return ev if ev < 1e-8 else 1 - exp(-ev)

            def diff(pv):
                return None if pv is None else -log(pv)
            fixed[n] = {
                'C': diff(pge1(expected(validC))) if n <= m else None,
                'T': diff(pge1(expected(validT))) if n <= m else None,
                'PT': diff(pge1(expected(validPT))) if n <= m else None,
                'Ench': (diff(pge1(expected(validEnch))) if (n <= m and n <= E) else None),
            }
        marg = {}
        bpC = bpT = bpPT = bpE = None
        for n in range(3, R + 1):
            if n == 3:
                bpC = E * comb(R, 3) / comb(N, 3)
                bpT = (R - 3 + 1) * (E ** 3) / comb(N, 3)
                bpPT = E * (R - 3 + 1) / comb(N, 3)
                bpE = (R * comb(E, 3) / comb(N, 3)) if 3 <= E else None
            else:
                k = n - 1
                extC = (R - k) / (N - k)
                extT = ((max(R - k - 1, 0) * 2 * E) + (2 * E)) / ((R - k + 1) * (N - k))
                extPT = ((max(R - k - 1, 0) * 2) + 2) / ((R - k + 1) * (N - k))
                extE = ((E - k) / (N - k)) if k < E else None
                bpC *= extC; bpT *= extT; bpPT *= extPT
                bpE = None if (extE is None or bpE is None) else bpE * extE
            marg[n] = {'C': -log(bpC), 'T': -log(bpT), 'PT': -log(bpPT),
                       'Ench': (-log(bpE) if bpE is not None else None)}
        for n in range(3, R + 1):
            row = {'deck': deck, 'E': E, 'n': n}
            for key in ('C', 'T', 'PT', 'Ench'):
                fd = fixed[n][key]; md = marg[n][key]
                if n > m or (key == 'Ench' and (fd is None or md is None)):
                    row['base' + key] = None
                else:
                    row['base' + key] = alpha * fd + marg_w * md
            results[(deck, n)] = row
        for n in range(3, R + 1):
            row = results[(deck, n)]
            eC = row['baseC']; eT = row['baseT']; ePT = row['basePT']; eEn = row['baseEnch']
            I = horizon * max(0, draw - clock) * (1 if n < 6 else 2)
            J = horizon * max(0, arr - fric)
            K = ptm * (I + J)
            if eEn is not None:
                gain = g3 if n == 3 else (g4 if n == 4 else (g5 if n == 5 else None))
                L = horizon * cap * gain if gain is not None else None
            else:
                L = None
            Q = max(0, eC - lam * I) if eC is not None else None
            Radj = max(0, eT - lam * J + mu * trole) if eT is not None else None
            if ePT is None:
                S = None
            elif n == 15:
                S = Q
            else:
                S = max(0, ePT - lam * K)
            T = max(0, eEn - lam * L) if (eEn is not None and L is not None) else None
            row['scoreC'] = Q * scale if Q is not None else None
            row['scoreT'] = Radj * scale if Radj is not None else None
            row['scorePT'] = S * scale if S is not None else None
            row['scoreEnch'] = T * scale if T is not None else None
    return results


DEFAULT = {'B4': 15, 'B5': 4, 'B6': 5, 'B7': 0.8, 'B9': 15, 'B23': 0.5, 'B24': 1,
           'B25': 2, 'B26': 2, 'B27': 1, 'B28': 0.25, 'B29': 0.6, 'B30': 0.8,
           'B31': 0.65, 'B32': 0.75, 'B33': 1, 'B34': 3, 'B35': 5, 'B36': 1.5}

# Deck 2 cached unrounded scores (default inputs) for verification
EXP_DECK2 = {
    3: (0, 4.490824136512667, 3.461876295804968, 1.6678139663174134),
    4: (0.5736616182460632, 5.3127972408197905, 7.638167367930889, 3.40292763497217),
    5: (1.4407141582519505, 6.135335251072043, 12.177704841698471, 7.60193354418184),
    6: (1.8287421973469762, 6.981036920463116, 15.922265249181883, None),
    7: (5.111222671778611, 7.935245433691246, 20.807503669180516, None),
    8: (9.318436704438085, 9.155409806053266, 25.877615303563548, None),
    9: (14.22909468799514, 10.778449758005248, 31.163337127142487, None),
    10: (19.841452014741535, 12.853803469239706, 36.706872919090074, None),
    11: (26.232840511696526, 15.383292281871324, 42.56793095335582, None),
    12: (33.53579612789147, 18.39260805034443, 48.83665437268779, None),
    13: (41.97098028198427, 21.989168751030014, 55.66324943628146, None),
    14: (51.95241092944306, 26.447029602917368, 63.34215406146808, None),
    15: (64.50703897955323, 32.55868643840971, 64.50703897955323, None),
}


def rnd(x):
    return None if x is None else math.floor(x + 0.5)


def bmargin(v):
    return 1.0 if v is None else abs((v - math.floor(v)) - 0.5)


def deck_scores(inp, deck):
    r = build_model(inp)
    return {n: (r[(deck, n)]['scoreC'], r[(deck, n)]['scoreT'],
                r[(deck, n)]['scorePT'], r[(deck, n)]['scoreEnch']) for n in range(3, 16)}


def check(inp, deck):
    tbl = deck_scores(inp, deck)
    conj = [rnd(tbl[n][0]) for n in range(3, 16)]
    tf = [rnd(tbl[n][1]) for n in range(3, 16)]
    pt = [rnd(tbl[n][2]) for n in range(3, 16)]
    ench = [rnd(tbl[n][3]) for n in range(3, 16)]
    ok = True; msgs = []
    if conj[0] != 0:
        ok = False; msgs.append(f"C3={conj[0]}")
    for label, arr in (("Conj", conj), ("TF", tf), ("PT", pt), ("Ench", ench)):
        for i, v in enumerate(arr):
            n = i + 3
            if v is None:
                continue
            if label == "Conj" and n == 3:
                continue
            if v <= 0:
                ok = False; msgs.append(f"{label}{n}={v}<=0")

    def strict(a):
        s = [v for v in a if v is not None]
        return all(y > x for x, y in zip(s, s[1:]))
    if not (strict(conj) and strict(tf) and strict(pt) and strict(ench)):
        ok = False; msgs.append("not strictly increasing")
    if pt[-1] != 100:
        ok = False; msgs.append(f"PT15={pt[-1]}")
    for i in range(13):
        if pt[i] is not None and tf[i] is not None and pt[i] < tf[i]:
            ok = False; msgs.append(f"PT{i+3}<TF")
    return ok, (conj, tf, pt, ench), msgs


def min_margin(inp, deck):
    tbl = deck_scores(inp, deck)
    return min(bmargin(v) for n in range(3, 16) for v in tbl[n] if v is not None)


def q15_unit(inp, deck):
    return deck_scores({**inp, 'B25': 1.0}, deck)[15][0]


if __name__ == '__main__':
    # verify deck2 default reproduction
    print("VERIFY Deck 2 (default inputs) vs cached:")
    tbl = deck_scores(DEFAULT, 2)
    ok = True
    for n in range(3, 16):
        for g, e in zip(tbl[n], EXP_DECK2[n]):
            if e is None:
                if g is not None:
                    ok = False
            elif g is None or abs(g - e) > 1e-9:
                ok = False; print("  mismatch n", n, g, e)
    print("  ALL MATCH" if ok else "  MISMATCH")

    # search deck2: clean knobs alpha,lambda,scale,trole ; ptm & rest default
    best = None
    for ai in range(700, 900):
        alpha = ai / 1000
        for li in range(10, 80):
            lam = li / 100
            base = dict(DEFAULT); base['B7'] = alpha; base['B23'] = lam
            q = q15_unit(base, 2)
            if q <= 0:
                continue
            base['B25'] = 100.0 / q
            sc = deck_scores(base, 2)
            rc = [rnd(sc[n][0]) for n in range(3, 16)]
            if rc[0] != 0 or any(rc[i] <= 0 for i in range(1, 13)):
                continue
            if any(not (y > x) for x, y in zip(rc, rc[1:])):
                continue
            for tri in range(0, 41):
                tr = tri / 20
                cand = dict(base); cand['B36'] = tr
                q2 = q15_unit(cand, 2)
                for sm in range(-45, 46, 5):
                    cand['B25'] = (100 + sm / 1000) / q2
                    ok2, tabs, _ = check(cand, 2)
                    if ok2:
                        mm = min_margin(cand, 2)
                        if best is None or mm > best[0]:
                            best = (mm, dict(cand))
    if best:
        mm, b = best
        print(f"\nDeck 2 best clean solution, min-margin={mm:.4f}")
        for k, name in (('B7', 'alpha'), ('B23', 'lambda'), ('B25', 'scale'), ('B31', 'ptm'), ('B36', 'trole')):
            print(f"  {k} {name}: {DEFAULT[k]} -> {round(b[k], 5)}")
        ok2, (conj, tf, pt, ench), _ = check(b, 2)
        print("  rounded: Conj", conj)
        print("           TF  ", tf)
        print("           PT  ", pt)
        print("           Ench", [e for e in ench if e is not None])
        import json
        json.dump(b, open("_deck2.json", "w"))
    else:
        print("\nNo clean-set Deck 2 solution found.")
