---
title: Web rebuild v2 — report 1 (foundation + player site)
type: report
created: 2026-11-11
rules: v3.1 (under test)
game_title: Arcane Drought
---

# Report 1 — foundation and player site

Everything is new and lives under `web-apps/v2/`. Nothing outside it was modified, moved or
deleted, nothing was committed or pushed, and no rule or number was changed.

**Title.** Sam's instruction for this run was to use the new game name, so every v2 surface
says **Arcane Drought** and the winner is the **Renewer**. That overrides the prompt's
"rename deferred" for v2 only. The old pages still say the working title until the
one-pass rename (see "Outside v2", item 6).

## 1. What was built

| Area | Result |
|---|---|
| IA | One site, three doors: **Play** (phone, mid-turn), **Learn** (first game), **Rules** (full reference). **Studio** is a quiet footer link, `noindex`. Reasoning in `DESIGN_BRIEF.md`. |
| Design system | `assets/tokens.css` (roles, dark + daylight themes, type, space, motion, focus, touch) and `assets/site.css` (components: top bar, version badge, tabs, segmented control, disclosure, spell tile, card chip, energy legend, turn steps, entry pad, table, callout ×3, calculator, contents/search, doors, print). |
| Rules data | `data/rules.v3.1.js` holds every number, table and rule string. `data/current.js` is the single import that picks the version and applies variants. `data/site.js` holds the title, links and mount points. `data/strings.en.js` holds interface copy. |
| Check tool | `tools/check-rules-data.mjs` — 415 checks against `meta/canon.yml`, the rulebook and the Scoring System Reference, plus static title mirrors, the offline list and vocabulary. Exits 1 on any mismatch. |
| Hand checker | `assets/js/hand-checker.js` — one pure module: wild-aware, deck-aware, max size 15, wild declarations. |
| Tests | `tests/hand-checker.equivalence.test.mjs` — 14 tests against the existing golden master (read-only). |
| Pages | `index.html`, `play/`, `rules/`, `learn/`, `studio/`. |
| Offline | `sw.js` precaches 27 files (pages, data, scripts, fonts, the six symbol icons). `manifest.webmanifest` makes Play installable. |
| Fonts | Cinzel and Cormorant Garamond, self-hosted, variable, subset to Latin + Latin-1 (French-ready). 79 KB for three files. Licence in `assets/fonts/OFL.txt`. |

### Verification done

- `node --test web-apps/v2/tests/hand-checker.equivalence.test.mjs` → 14 pass, 0 fail.
- `node web-apps/v2/tools/check-rules-data.mjs` → 415 passed, 0 failed. A deliberate wrong
  value (Conjuration 15 = 99) made it fail with the source and site values side by side.
- Rendered in headless Chrome at 375 × 667 and 1280 × 800: landing, all five Play views,
  Rules, Learn, Studio; dark and daylight; print layout (11 A4 pages). No console errors.
- Offline: after one visit, all five pages load with the network off, fonts and symbols included.
- Every internal link and hash target resolves, including the six old Online Rules ids.
- No horizontal overflow at 375 px. One `h1` per page. Every control has a name.
- Contrast computed for every text/background pair in both themes: all ≥ 4.5:1; control borders ≥ 3:1.
- Not done: testing on a real phone, a screen-reader pass, and a throttled-3G timing run.
  Transfer size is the evidence for the budget (next section).

### Performance against the budget

| | Raw | Gzipped (what GitHub Pages sends) |
|---|---|---|
| Play, everything needed to be interactive, fonts excluded | 138 KB | **44 KB** (budget 150 KB) |
| Whole site precache, fonts excluded | — | 54 KB |
| Fonts | 79 KB | 79 KB (already compressed) |

Modules are `modulepreload`ed so they download in parallel. Fonts use `font-display: optional`
with preload: no layout shift when they arrive. The cost is that a first visit on a very
slow connection may show the fallback serif once; the service worker makes them instant after.

## 2. File map

```
web-apps/v2/
  DESIGN_BRIEF.md            IA and interaction decisions (written first)
  REPORT_1.md                this file
  index.html                 landing: three doors
  play/index.html            table companion (Check · Spells · Turn · Score · Set-up)
  rules/index.html           full rules, search, print
  learn/index.html           first-game path + explainer mount
  studio/index.html          designer links + expansions mount (noindex)
  sw.js                      offline cache (scope: web-apps/v2/)
  manifest.webmanifest       install metadata (static mirror of the title)
  package.json               only "type": "module" + three script aliases; no dependencies
  assets/
    tokens.css               design tokens, both themes, @font-face
    site.css                 base + components + print
    fonts/                   3 × woff2 + OFL.txt
    js/app.js                shell: top bar, footer, title, theme, service worker
    js/ui.js                 helpers + every shared component
    js/hand-checker.js       the one hand checker (pure logic)
    js/play.js               Play views and router
    js/rules-page.js         Rules renderer, contents, search
    js/pages.js              landing, Learn, Studio
  data/
    site.js                  TITLE, nav, external links, mount points
    current.js               picks the rules version; variants; shared helpers
    rules.v3.1.js            the rules
    strings.en.js            interface copy
  tests/hand-checker.equivalence.test.mjs
  tools/check-rules-data.mjs
  tools/serve.mjs            local preview server (no dependencies)
```

29 files plus `_plan/`. Energy symbols are referenced where they live
(`art/energy-symbols-export/symbol_*_icon.svg`), not copied.

**Local preview.** ES modules do not load from `file://` in any current browser, so opening
the HTML files directly shows a short note explaining this. Run
`node web-apps/v2/tools/serve.mjs` and open the address it prints. On GitHub Pages it works as is.

## 3. How to extend

**Add a page.** Copy `learn/index.html`, change `data-page`, `<title>` and the script. Import
`./app.js` first (shell) and build from `ui.js`. Add the page, and its script, to `PRECACHE`
in `sw.js`; the check tool fails if you forget. Add a nav entry in `data/site.js` only if
players need it.

**Add an explainer (Prompt 2).** Build it under `learn/<name>/`. Register it in
`data/site.js → mounts.explainers`:
`{ id, title, blurb, href: 'learn/<name>/index.html', slots: ['counters', 'recall'] }`.
It then appears in Learn › Explainers and as a link under every Rules heading and Play panel
whose id is in `slots`. Slot ids are the section ids (`counters`, `recall`,
`enchantment-timing`, `wilds`, `reshape`, `unlearn`, `drought-turn`, `normal-turn`, `spells`).
Explainers must read numbers from `data/current.js`, never restate them.

**Trials (Prompt 3).** Build under `trials/`. `RULES.trials` is the data slot (currently a
summary and a status, deliberately no numbers). The Rules section `#ascension-trials` has a
`data-mount="trials"` list item, and `SITE.links.trialsCompanion` is the one link to repoint.

**Expansions (Prompt 4).** Build under `studio/expansions/`. Register entries in
`data/site.js → mounts.expansions` (`{ title, blurb, href, status }`); Studio lists them.

**Add a rules version (v3.2, or a v3.0 rollback).** Copy `data/rules.v3.1.js` to
`data/rules.v3.2.js`, edit it, change the one import in `data/current.js`, update the file
name in `sw.js` and in the `modulepreload` line of the five HTML files, then run the check
tool and the test. If the kill criteria fire and v3.0 comes back, the same steps with
`rules.v3.0.js` filled from the archived rulebook; the hand checker and pages need no edits.

**Add or switch on a variant.** Add an entry to `variants` in the rules file with `patches`:
`{ op: 'set', path, value }` replaces a value in a copy of the rules; `{ op: 'note', section,
text }` shows a Variant callout in that section. Base values are never edited. A variant is on
when `default: true`, when a visitor switches it on in Rules › Variants under test (saved on
that device), or with `?variant=array-attunement` in the address (useful for a playtest
link). Array Attunement is in as `status: 'proposed', default: false`.

**Rename the game.** Change `SITE.title` in `data/site.js`. Run the check tool: it lists the
static mirrors that cannot import a module (the five `<title>` tags and the manifest name).

**French later.** Copy `strings.en.js` to `strings.fr.js` and replace the one static import
in `ui.js` with a small loader that picks the strings module from `?lang=`. Rule text is in the rules file, so a full French site also needs a
`rules.v3.1.fr.js` overlay of the string fields. Nothing is translated now.

**Service worker updates.** Cached files refresh in the background, so a push reaches
players on their next visit. Bump `VERSION` in `sw.js` only after renaming or deleting files.

## 4. Old → new link map

| Old address | New address |
|---|---|
| `index.html` | `web-apps/v2/index.html` |
| `web-apps/player-reference/player-reference.html` | `web-apps/v2/play/index.html` |
| …QRC tab Start | `play/index.html#set-up` (`#start` also accepted) |
| …QRC tab Spells | `play/index.html#spells` |
| …QRC tab Your Turn | `play/index.html#turn` (Drought: `#drought`) |
| …QRC tab Scoring | `play/index.html#score` (`#scoring` also accepted) |
| `web-apps/archmage-reference.html#set-up` | `rules/index.html#set-up` |
| `…#spells` | `rules/index.html#spells` |
| `…#normal-turn` | `rules/index.html#normal-turn` |
| `…#drought-turn` | `rules/index.html#drought-turn` |
| `…#recognition-points` | `rules/index.html#recognition-points` |
| `…#ascension-trials` | `rules/index.html#ascension-trials` |
| Hand checker (inside old `#spells`) | `play/index.html#check` |
| Score calculator (inside old `#recognition-points`) | `play/index.html#score-calculator`, also `rules/index.html#score-calculator` |
| `web-apps/trials-multiplayer.html` | unchanged, linked from the landing and Rules |
| `web-apps/spellbook-optimizer.html`, pitch sheet, digital game | unchanged, linked from Studio only |

New stable ids in Rules: `#components #deck #the-opening #wilds #conjuration #transfiguration
#enchantment #perfect #collection #casting #recall #learning #learn #empower #reshape
#unlearn #counters #enchantment-timing #the-drought-has-begun #why-casting-stops
#the-contest-ends #scoring-example #score-calculator #variants #array-attunement #glossary`.
Play also accepts `#counters`, `#wilds`, `#learn` … `#unlearn` and opens the right panel.

The old "Export to Trials" button on the score calculator was not carried over: it writes
into the old companion's storage format. Prompt 3 should decide its replacement.

## 5. Hand checker: what is equivalent and what differs on purpose

The golden master locked the old widget's behaviour: values 1–20, any number of wilds,
duplicate cards, four energies, Enchantments capped at 4. Canon has moved, so the test
proves equivalence in layers instead of pretending nothing changed.

- **Layer A.** New module, old parameters: all 150 corpus hands match the snapshot exactly
  (type, size, cards, order, effect, points). The detection logic is the old logic.
- **Layer B.** New module, canon 2–4 player deck: 65 corpus hands can exist in the real
  deck and all 65 match exactly. The other 85 are rejected with a named reason
  (value above 15: 49; more wilds than the deck holds: 30; duplicate card: 29; a hand can
  have several).
- **Layer C.** Canon-only behaviour: Echo rejected at 2–4 and accepted at 5–6; Enchantment
  stops at 4 at 2–4 even with spare wilds; 5-component Enchantment at 5–6 (with Echo or a
  wild declared as Echo); nothing above 15 components; wild declarations legal; runs do not wrap.

Intended differences, all listed in the test file: ranks 1–15; wild supply 2 or 4; one of
each card; hard size cap 15; Echo and the 5-rung at 5–6 only; each wild carries a
declaration; effects and names come from the rules data, not from sentences inside the module.

One thing kept from the old widget that you may want to change: it reports the largest
spell of each shape, and a same-energy run is listed as both a Perfect Transmutation and a
Transfiguration. That matches the rulebook's spell section ("any energies"); see conflict 2.

## 6. Rule conflicts and stale facts found

Precedence used: canon.yml, then rulebook and Scoring System Reference, then the board for
section names only. Nothing below was edited.

| # | Where | What | What v2 does |
|---|---|---|---|
| 1 | `board/archmage_a3_landscape_board.pdf` | Recognition Points table is pre-v3.1 (e.g. size 3: 3 / 5 / 7 / 6; size 15: 81 / 95 / 109). Set-up says "5-7 players: values 1-20 (80 cards + 4 wilds = 84 cards)" and "Each player takes 1 counter". Key reminder says "any current and value". | Uses the board for section names and order only. Numbers come from canon and the Scoring System Reference. The board on the table will disagree with the phone until it is reprinted. |
| 2 | Rulebook line 429 vs line 137 | Glossary says a Transfiguration is "sequential components of **different** energies". The spell section says "(any energies)". | Follows the spell section: any energies. |
| 3 | Rulebook line 157 | The wild-declaration rule sits under Enchantment only. Canon `wild_rule` says all spell types, fixed while the spell exists (F6, propagation still open). | States the rule once, under Spells › Wilds, for all types, per canon. |
| 4 | Rulebook lines 152–157, Scoring System Reference line 45 | Nothing says outright that a wild in an Enchantment must be a *different* energy from the other components. It is implied by "keeps 5-component Enchantments out of reach at 2-4 players" and by F6's "five distinct legal energies". | Treats it as the rule: Enchantment size ≤ number of energies in the deck. **Please confirm.** If wrong, it is one line in the rules file (`castNotes`) and `enchantmentMax()` in `current.js`. |
| 5 | Rulebook lines 2, 18, 28–40, 397, 478; `rulebook/Story.md` already updated | Title and end-narrative still use the working title and an ascending Archmage. Canon `end_narrative` says the winner is the Renewer. | Uses Arcane Drought and the Renewer. Flavour lines are new, short, and in the tone of `Story.md`. |
| 6 | Scoring System Reference line 45; `web-apps/archmage-reference.html` line 428 | "Echo suit" (card-suit language). | Says "Echo" / "the 5–6 player deck". |
| 7 | `index.html` line 132 | "2–7 Players". Canon is 2–4 base, 5–6 with Echo. | Landing says 2–6, from the data. |
| 8 | `web-apps/archmage-reference.html` lines 841, 929, 1025; `rulebook/Ascension Trials.md` lines 75, 79, 102, 126 | "THE Archmage", "Wild Magic Power", 6–7 player scoring. F8 reconciliation is open. | Rules › Ascension Trials gives a two-sentence summary, an "In revision" callout and links to the existing companion. No Trials numbers are restated, so nothing stale is taught. The name "Ascension Trials" is kept; it will need a decision in the rename pass. |
| 9 | `web-apps/player-reference/player-reference.html` line 598 | "Worth 4 (3 cards) or 10 (4 cards)" omits the 5-component 16. | Shows all three rungs; the 5-rung is marked 5–6 players only. |
| 10 | `web-apps/archmage-reference.html` line 1643 and the QRC copy | Value keypad runs 1–20. | 1–15 from the deck data. |
| 11 | `art/energy-symbols-export/` | No full-art `symbol_echo.svg`; Echo has only `_icon` and `_simple`. | Uses the `_icon` set everywhere (also the lightest: 14 KB for six). |
| 12 | Rulebook line 474 | "Stepped down a size: … -1 (3→dissolved)" restates the ladder as differences. Correct, but a second place to keep in step. | Derives everything from the ladder; states no differences. |
| 13 | Rulebook lines 236–241 and 296–301 | "1 counter = up to 1 spell, 2 counters = …" lists. | Said once: one spell and one learning action per counter. |

Session 4's question ("do you need a wild to make a 5-card Enchantment?") is answered
structurally: with 2–4 selected the 5-rung shows as "5–6 players only" in the spell tile,
the capacity table, the score table and the calculator.

## 7. Things that need changing outside v2 (not done here)

1. **`meta/manifest.yml`** — declare `web-apps/v2/` (player site v2: pages, `assets/`,
   `data/`, `tests/`, `tools/`, `_plan/`). The session checker does not flag it today
   (`web-apps/` is declared as a whole), but the manifest's description of that folder is now out of date.
2. **`meta/canon.yml` → `vocab_exclude`** — add `_plan`, or reword
   `web-apps/v2/_plan/PROMPT_1_…md`: it quotes the two retired terms as a "never use" list
   and the session checker already flags it. No file I wrote contains either term (the check
   tool reads them from canon.yml rather than spelling them).
3. **`meta/checks/check.mjs`** — consider calling `web-apps/v2/tools/check-rules-data.mjs`
   so rules drift on the site shows up in the session brief.
4. **Board QR target** — point it at `web-apps/v2/play/index.html` when v2 goes live. The
   board itself needs the v3.1 table and the Echo set-up (conflict 1).
5. **`web-apps/tests/hand-checker/`** — the old tests extract the widget from
   `archmage-reference.html` by a string marker. When the old page is retired, retire them
   too; the v2 test keeps reading their snapshot, so keep `golden-master.snapshot.json`.
6. **Title pass** — v2 now shows the final title while `index.html`, the old pages, the
   board and the rulebook show the working title. Fine for a side-by-side preview; it becomes
   a real inconsistency the day v2 is linked from the old landing.
7. **Rulebook** — conflicts 2, 3, 4 and 5 are rulebook edits (each one needs the §3a
   archive-and-bump routine).
8. **Publishing** — the Pages workflow deploys the whole repo, so `web-apps/v2/` goes
   public on the next push to main, Studio included (unlinked from player pages, `noindex`,
   but reachable by address).
9. **Decision record** — this run made one decision worth logging in `meta/decisions/`:
   "v2 uses the final title ahead of the one-pass rename". I did not write to `meta/`.

## 8. What I would do next

1. **Put Play in front of the French six-player session** as the thing under test, with the
   tier tallies as the measure. It is the digital form of the reference card the standing
   P1 wants redesigned.
2. **Prompt 2, in this order:** counters and Recall (failed twice on paper), Enchantment
   capacity timing with the affordability gate, wild declaration, partial Unlearn on runs.
3. **A "what can I do with this spell?" mode in the checker**: enter a Spellbook spell plus
   hand cards and see legal Empower targets. It is the next most-asked question after "is
   this a spell?" and the engine is already most of the way there.
4. **Confirm conflict 4** and settle whether a same-energy run should still be offered as a
   Transfiguration.
5. **Real-device pass**: one iPhone, one Android, dim room; a screen-reader run through
   Check; a throttled first load.
