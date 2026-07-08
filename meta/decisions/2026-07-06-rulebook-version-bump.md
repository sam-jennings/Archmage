---
title: Bump rulebook to v3.0 and archive the v2.8 baseline
type: decision
date: 2026-07-06
status: canon
thread: capacity-economy
---

# 2026-07-06 — Bump rulebook to v3.0 and archive the v2.8 baseline

**Change:** The Echo/Option-2 enchantment-ladder edits (decisions
`2026-07-02-echo-option-2-deck.md` + its 2026-07-03 update) were written into the
rulebook files in-place while the `version: 2.8` label was left untouched, and no
pre-change copy was archived. This closes that housekeeping gap:

- Archived byte-exact v2.8 copies (recovered from git commit `abe6aed`) of the three
  changed files to `_archive/rulebook-v2.8-2026-07-06/`
  (`Archmage Ascension - Complete Rulebook.md`, `GLOSSARY.md`,
  `Scoring System Reference.md`), indexed in `_archive/README.md`.
- Bumped the version label **v2.8 → v3.0** in `rulebook/Archmage Ascension -
  Complete Rulebook.md` (front-matter `version` + `Complete Rulebook v3.0` alias) and
  `rulebook/Scoring System Reference.md` (front-matter `version`). `GLOSSARY.md` and
  `Story.md` carry no version front-matter; `Ascension Trials.md` and `Story.md` were
  unchanged by the ladder work.

**Why:** The rulebook content had moved past v2.8 (enchantment ladder 3=+1 / 4=+3 /
5=Unlimited Capacity, 6/12/18 scores, starting-counter rule, wild-declaration rule,
5–6p Echo deck) but still claimed to be v2.8, and the true v2.8 text existed only in
git history — fragile in this OneDrive folder where git ops are unreliable (process.md
§4). A **major** bump (v3.0, not v2.9) reflects the scale of the change: it introduces
the **Echo** fifth energy and reframes **5–6 players as an extension** (79-card deck)
rather than part of the base game, on top of a reworked capacity ladder. Archiving +
a real version number makes the v2.8 → v3.0 delta explicit and recoverable without git.

**Scope note:** The v3.0 rulebook is `status: working-draft`. The locked rules
(counter values, starting counters, wild rule, ladder scores) are canon; the **5–6p
Echo deck structure (79 cards) remains under live validation** per
`2026-07-02-echo-option-2-deck.md` and `meta/experiments/echo-option-2/`. v3.0 is the
label for the current working draft, not a claim that the Echo deck is settled.

**Canon delta (applied to canon.yml):** `rulebook_version: v2.8` → `v3.0`.

**Status: canon** — the archive and version bump are done, not provisional.

## Propagation

- [x] `_archive/rulebook-v2.8-2026-07-06/` — three v2.8 files recovered from git `abe6aed` — done 2026-07-06
- [x] `_archive/README.md` — index entry for the v2.8 archive — done 2026-07-06
- [x] `rulebook/Archmage Ascension - Complete Rulebook.md` — `version: 3.0` + `Complete Rulebook v3.0` alias — done 2026-07-06
- [x] `rulebook/Scoring System Reference.md` — `version: 3.0` — done 2026-07-06
- [x] `meta/canon.yml` — `rulebook_version: v3.0` — done 2026-07-06
