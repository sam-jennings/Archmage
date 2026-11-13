---
title: Web rebuild v2 — report 3 (Ascension Trials companion)
type: report
created: 2026-11-12
rules: Trials package undecided (F8); site rules v3.1 (under test)
game_title: Arcane Drought
---

# Report 3 — Ascension Trials companion

The companion is rebuilt at `web-apps/v2/trials/`. It runs pass-and-play offline and
networked, at 2–6 players with Echo, on six switchable rules packages. No package is
chosen for you: with no default set, the host picks one on first use. Nothing outside
`web-apps/v2/` was touched, nothing was committed or pushed, and no rule was decided. The
one thing not exercised is networked play against the real database (section 6).

Section 3 lists the gaps and contradictions the build exposed between the rulebook and
the candidates. Two of them need a call from you before a 5–6 player Trials session.

## 1. Switching the rules package

| How | Where |
|---|---|
| Per table | "Rules package · Host setting" dropdown: on set-up, and one line above the Spellbooks and the hand-off screen |
| Per visit | `trials/index.html?ruleset=c1-coherent-claim` |
| Default for everyone | `DEFAULT_RULESET_ID` in `trials/rulesets/index.js` (currently `null`: the host is asked once, and the phone remembers) |

Switching keeps players and Spellbooks. During allocation it clears allocations, because
every wizard's power may change; the screen says so first. The package name, version and
any options are printed on the results. A test fails if any file outside the registry
names a package.

## 2. Packages implemented

| Package | Source | Checked against the analysis model |
|---|---|---|
| C1 · Coherent Claim | shortlist file 07 | identical to `candidate_c1_coherent_claim.json` |
| C2 · Guarded Table | shortlist file 07 | identical to `candidate_c2_guarded_table.json` |
| C3 · Open Skies | shortlist file 07 | identical to `candidate_c3_open_skies.json` |
| C4 · Archspell Bold | file 07 + critique file 03 §3 | no model configuration exists; equals C1 with one trial swapped |
| Hybrid rebuild (as proposed) | proposal file 02 | identical to `hybrid_rebuild.json` |
| Current draft (rulebook v2.8) | `rulebook/Ascension Trials.md` | identical to `baseline_v28_stale.json` |

"Identical" means a deep comparison of the configuration, ignoring prose notes. The
dropdown lists them in that order; the order is not a recommendation.

Three rules sit outside the model's schema and are implemented as package `extras`:
+1 baseline Wild power (C1, C3, C4), Champion's Mark +4 at 2 players (C2, C3), and the
single-spell rule of the Trial of the Archspell (C4).

### Tests

`npm test` in `web-apps/v2/` now runs `trials/tests/*.test.mjs` as well: 58 new tests,
57 pass, 1 skipped by design (C4 has nothing to compare against).

- **Ported from the model** (fixtures copied byte-for-byte into `trials/tests/fixtures/`,
  with a test that fails if the model's copy changes): A1 mirror tie, A7 monotonicity
  trap, A9 penny squat, A10 Wild legality, A11 over-allocation, A12 tiebreak cascade and
  second-place suppression, A16 Maya's worked example, A17 formula comparison.
- **Not ported**, because they test the model's analysis laboratory (enumeration,
  equilibria, best response, audit hashes) and the companion has none of that: A2–A6, A8,
  A15, A19, A20, ASYM, BR-*, MATH-*.
- **New**: every package plays a full game at every count it supports; Minimum Claim;
  Champion's Mark; Archspell; final places; the reducer and the hidden-information
  boundary; Spellbook entry through the shared hand checker; the seal-and-reveal protocol
  with several phones on an in-memory room, including a forged reveal; the QR encoder.

`node tools/check-rules-data.mjs` → 962 passed, 0 failed (it now covers the new files:
offline list, vocabulary, page title).

Headless Chrome, 375 px and 1280 px, dark and daylight: a 2-player C2 game, a 5-player
current-draft table, a 3-player C4 game by keyboard, and a 2-phone networked C1 game
(two tabs on the local transport). No console errors, no horizontal overflow, every
control named and at least 44 px. The QR code on screen was read back by an independent
decoder (OpenCV), as was every version the encoder supports.

**Not done:** a real phone; a real screen reader; the real database (section 6).

## 3. Gaps and contradictions found

Findings, not fixes. "Companion" says what the tool does today so nothing is silent.

| # | Subject | What the sources say | Companion |
|---|---|---|---|
| 1 | **Echo in the current draft** | Rulebook v2.8 has four energy powers. Every candidate has five. F8's first checklist item (add Echo power) is unticked. | Current draft: an Echo spell's energy part counts for nothing, with a notice on that Spellbook. A labelled host option adds Echo with the standard formula. Off by default. |
| 2 | **6 players in the current draft** | Rulebook gives 6-player pool totals only (62 = 45 + 17), no per-trial values. The model refuses to invent them. | Current draft plays 2–5. At 6 it refuses and says why. |
| 3 | **Complete Mastery: who gets it** | Rulebook: "5–7 players". F8: open (5 only, 5–6, or all Echo games) and "do not settle silently". Candidates: 5–6. | Follows each package as written. In the draft it is active at 5 only in effect, since 6 has no rewards. |
| 4 | **7 players** | Rulebook still carries a 7-player column and "5–7". Canon is 2–6. | Not offered anywhere. |
| 5 | **Wild power from a 5-component Enchantment** | Rulebook names the 4-component Enchantment only; the 5-component one did not exist then. Candidates grant it for 4 and 5. | Draft: none for size 5, listed as a caveat. Candidates: as written. |
| 6 | **Trials replace or add to the standard score?** | Rulebook: "Instead of using *only* the standard final evaluation". The v2 rules data: "replaces the Standard Evaluation". | Shows Trials points only. Does not ask for or add standard scores. |
| 7 | **Final tie** | Rulebook: no rule. Candidates: most trials won outright → most normal power → most spells → largest spell → shared. | Draft: tied players share the place. Candidates: their chain, and the results name what decided it. |
| 8 | **Draft tiebreaks** | "Utilization" and "Focus" are each one line in the rulebook; the model had to choose denominators (its design §6) and notes its own normative text reads differently. | Uses the model's choice. The shortlist drops both ratios anyway. |
| 9 | **Rules the model cannot express** | The C1–C3 JSON files say "RULE NOT EXPRESSIBLE IN SCHEMA" for baseline Wild and Champion's Mark; they were screened by overlay. | Implemented as extras. The model and the companion agree on the configuration but only the companion plays these rules. |
| 10 | **Champion's Mark details** | Critique §2: "secretly mark one active Trial; +4 RP if you win it". Not stated: whether marking is compulsory, whether you may mark a trial you did not enter, whether a shared win counts (the C2 note says it does). | Optional; any active trial; a shared win counts. |
| 11 | **Archspell and Perfect Transmutation** | Critique §3: a Perfect Transmutation "can fight here from either of its domains, but its Spell Power is the cap". Not stated: whether it may split that cap across both. | Either power or a mix, total capped at the spell's power. A 5-component one brings at most 7, not 14. |
| 12 | **Where the final tiebreak chain is written** | `hybrid_rebuild.json` has it under `final_result` only; C1–C3 have it there and at top level. | Reads either. Worth making uniform in the model. |
| 13 | **Naming** | The rulebook and every design file call it by the two-word name that the v2 vocabulary check bans from player-facing files (it was the old name for the wild card's effect). | Says "Wild power". If the two-word name is the Trials term, the check needs an exception; otherwise the rulebook needs the rename. |
| 14 | **Energy Harmony at 2–3 players** | Rulebook: all counts. Candidates: 4+. | As each package says. Listed so the difference is not a surprise at the table. |

Items 1 and 3 are the two that block a clean 5–6 player session on the current draft.
They do not affect the candidates.

## 4. What the old app did that v2 deliberately does not

- **React, in-browser JSX compilation and the Firebase SDK from CDNs.** Gone. The whole
  companion is 40 KB gzipped of plain modules, precached for offline use. Networked play
  adds 8 KB, loaded only when chosen.
- **A third-party QR image service.** Replaced by a built-in encoder; a join link no
  longer leaves the device.
- **Allocations written to the database as they are edited.** The old room held every
  wizard's live allocation, readable by anyone with the room code. v2 publishes a seal
  and reveals afterwards.
- **Domain totals typed in by hand.** v2 takes the Spellbook and derives the power, so
  the package can change without anyone redoing arithmetic.
- **Legacy element ids** (`earth / fire / water / air`). Gone; energies come from the
  rules data, Echo included.
- **One hard-coded ruleset** (`config.js`). Replaced by packages.
- **Room clean-up of stale games.** The old app reset a room it found in a late phase.
  v2 rooms live under their own key (`rooms/t2-<code>`) and are simply left behind. They
  hold names, Spellbooks and seals. If that matters, a clean-up rule belongs in the
  database, not the page.

Also not built: a spectator screen for a networked game (the results screen has a "Table
display" layout, and any phone can put it on a shared screen); reconnect of a wizard whose
phone is lost after sealing (the host can go back to Spellbooks, which clears the round).

## 5. Adding a rules package

1. Copy `trials/rulesets/c1-coherent-claim.js` to `trials/rulesets/<id>.js`. The file
   name is the id.
2. If it belongs to the hybrid family, change the knobs passed to `hybridConfig()`
   (Minimum Claim, Mastery reward, single-source trial at 2 players, tiebreak family,
   which trial fills the single-source slot). Otherwise write the configuration out, as
   `current-draft.js` does. The schema is the analysis model's.
3. Put anything the schema cannot say in `extras` (`baseline_wild`, `champions_mark`).
   A new kind of extra needs engine support; say so before promising it.
4. Give every trial a display name in `ui.trials`. Requirement sentences, illegal-entry
   reasons and tiebreak wording are generated from the data.
5. Set `modelConfig` to the model's JSON path, or `null` if there is none.
6. Import it in `trials/rulesets/index.js`, add it to `RULESETS`, and add the file to
   `sw.js`.
7. Run `npm test` and `npm run check`. The tests will tell you if the package drifts
   from the model, has an unnamed trial, an unknown tiebreak, a reward at a count where
   the trial is inactive, or is not registered.

When a candidate is chosen: set `DEFAULT_RULESET_ID`. Removing the losing packages is
optional; they cost nothing while unselected.

## 6. Networked play: what is and is not verified

Verified: the protocol (tests), the screens and the full two-phone flow in a browser on
the local transport (`?net=local`, which makes each tab its own wizard), the QR code, and
that the old page's configuration is found by the reader. The database answers a
read-only REST request for an empty room.

Not verified: a write, or the live event stream, against the real database. I did not
write test data into your project. The transport is 60 lines of `fetch` and
`EventSource`; the first real room will show at once whether the database rules accept
writes under `rooms/t2-*`. If they do not, the error on screen is "The room could not be
reached", and pass-and-play is unaffected.

## 7. Files

```
web-apps/v2/
  REPORT_3.md
  trials/
    BRIEF.md  index.html  trials.css  strings.en.js
    app.js          controller: session, storage, the two modes
    views.js        every screen
    state.js        session reducer and the hidden-information boundary
    book.js         cards → spell through the shared hand checker; table-wide card check
    describe.js     plain language generated from package data
    engine/         power.js  legality.js  resolve.js  advise.js   (pure; ported from the model)
    rulesets/       index.js  hybrid-family.js  + one file per package
    net/            room.js  transport-firebase.js  transport-memory.js  qr.js
    tests/          7 test files, helpers, fixtures/ (11 files copied from the model)
```

**Files from earlier v2 sessions that I edited, for wiring only:**

| File | Change |
|---|---|
| `data/site.js` | `links.trialsCompanion` now points at `trials/index.html` (old page kept as `trialsCompanionOld`); `mounts.trials` set. |
| `data/strings.en.js` | `pageTitle.trials`; the Rules page's second Trials link reworded, since it points at the older v2.8 text. |
| `sw.js` | 24 files added to the offline list; cache version bumped. |
| `package.json` | `test` also runs `trials/tests/`. |

The landing page and the Rules page pick up the new companion through `site.js`; neither
file was edited.

## 8. Updates needed outside `web-apps/v2/` (not made)

- `meta/threads/ascension-trials.md`: campsite note that a package-switchable companion
  exists, and that C4 is now playable though unscreened.
- `meta/decisions/2026-07-06-f8-ascension-trials-reconcile.md`: the open propagation line
  for `web-apps/trials-multiplayer.html` is overtaken by v2; findings 1–5 above map onto
  its checklist.
- `meta/QUEUE.md`: findings 3, 6, 10, 11 and 13 are decisions to make.
- `index.html` (repo root) still links the old companion.

## 9. What I would do next

1. **Play C1 at 2 players on it**, as the shortlist proposes. The companion now records
   the three things that session is meant to watch: ties (the results say when a trial
   was shared), Minimum Claim friction (an entry under it is shown as not legal, with the
   reason), and whether baseline Wild power gets used.
2. **Decide findings 1 and 3** before any 5–6 player session on the draft, or skip the
   draft and test a candidate there.
3. **Open one real networked room** with two phones before relying on it at a table.
4. **Check the sampler** (shortlist §4) with real final Spellbooks: the companion's
   Spellbook entry is now the quickest way to get 3–5 of them typed in.
