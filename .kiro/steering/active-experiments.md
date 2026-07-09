# Active experiments (pointer)

Informational only — no rules live here (rules are in `meta/process.md`). This file exists so
Kiro and other sessions see, at a glance, what is under experiment or applied-but-under-test.

## vnext-scoring-economy — status: APPLIED as rulebook v3.1 (UNDER-TEST)

The bundle has been **applied to canon as rulebook v3.1** and is held **under-test** pending a
live confirm/kill playtest. Governing decision:
`meta/decisions/2026-07-09-v3-1-scoring-economy-bump.md` (status `experiment`), executed via the
Kiro spec `.kiro/specs/v3-1-scoring-economy/`. What landed:

1. Rebalanced score table (ceiling Conj15 = PT15 = 100, Transfiguration ~½ of PT / TF15 = 48, C3 = 0 floor, every other spell ≥ 1).
2. RESHAPE redefined to cost **one counter per spell broken down** (N spells → N counters).
3. Unlimited Capacity **removed**; finite enchantment ladder +1/+3/+5 scoring 4/10/16; plus partial UNLEARN (proportional capacity loss), the F3 "cannot afford → blocked" gate, and the EMPOWER conversion restriction.

Details in `meta/experiments/vnext-scoring-economy/RECORD.md`. **Canon (`meta/canon.yml`,
`rulebook/Scoring System Reference.md`, the Complete Rulebook) is now v3.1 (under-test), not
v3.0.** A byte-exact v3.0 rollback is in `_archive/*-v3.0-2026-07-09/` (authoritative list in
`_archive/README.md`). On playtest PASS, Task 19 flips the decision to `canon` and retires the
experiment folder; on FAIL, run the rollback and set the decision `reverted`.
