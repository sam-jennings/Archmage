from _m2b import baselines, scores, check, bm

base = baselines(5, 0.84)

variants = {
    "a.84 l.28 s3.04 tr0":  (0.84, 0.28, 3.04, 0.0),
    "a.84 l.275 s3.04 tr0": (0.84, 0.275, 3.04, 0.0),
    "a.84 l.28 s3.05 tr0":  (0.84, 0.28, 3.05, 0.0),
    "a.84 l.28 s3.0 tr0":   (0.84, 0.28, 3.0, 0.0),
    "a.84 l.2775 s3.039 tr0": (0.84, 0.2775, 3.039, 0.0),
    "a.84 l.28 s3.04 tr0.5":(0.84, 0.28, 3.04, 0.5),
}
for name, (a, lam, sc, tr) in variants.items():
    b = baselines(5, a)
    s = scores(b, lam, sc, tr)
    ok, tabs = check(s)
    mm = min(bm(v) for n in range(3, 16) for v in s[n] if v is not None)
    print(f"{name}: {'OK ' if ok else 'FAIL'} margin={mm:.4f}")
    if ok:
        print("      Conj", tabs[0])
        print("      TF  ", tabs[1])
        print("      PT  ", tabs[2])
        print("      Ench", [e for e in tabs[3] if e is not None])
