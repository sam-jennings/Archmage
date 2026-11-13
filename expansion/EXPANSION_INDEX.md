---
title: Expansion Concepts — Index
type: expansion-index
status: parked
updated: 2026-07-19
---

# Expansion Concepts

> **Status (reset 2026-07-16, decision `2026-07-16-expansion-status-reset`):** The design gate is lifted — paper development may proceed at any time. **Ascension Trials is the only locked-in expansion.** Everything else here is ideas at different stages of development: nothing tested, nothing confirmed, **no settled sequencing** (the earlier "Schools + Last Rites first" choice is a recommendation, not a commitment). Playtest slots still compete with base-game P1s per session.

> **Product model (working direction, 2026-07-02):** base game = 2–4 players, 4 energies × 1–15 + 2 wilds. **Extension** (more players, same game) = Echo 1–15 + 2 wilds, enabling 5–6 players. **Standing rule for all expansions:** must play identically at 2–4p (no Echo) and 5–6p (Echo in) — no expansion may require or name Echo in a core rule.

> **Combination governance (standing rules, salvaged 2026-07-16 from the old expansion thread — see `old-expansion-thread-review.md`):**
> 1. On any rules contact between modules: **complexity modules define possibilities; player-dynamic modules define incentives** — never the reverse.
> 2. **Hard caps scale downward** when a social/dynamic module is active (fewer persistent per-player effects while suspicion or negotiation is live).
> 3. **Hidden information never modifies math** — hidden roles/agendas change timing and interpretation only, never costs or values.
> 4. **Effect-template discipline:** expansion effects vary numbers and trigger windows within a small shared set of templates, so stacked modules compose predictably.
> 5. **Max one modifier per effect instance across all modules** (promoted 2026-07-16 from Foci rule 6 / Rituals' Inner Flame ruling — see `_review/EXPANSION_AUDIT_2026-07.md`): if a School talent, Seal, Focus, or any future persistent effect could all modify the same draw/exchange, the owner picks one; the others do not apply to that instance.

This folder holds conceptual design work for optional expansion modules. Treat it like `rulebook/Ascension Trials.md` — designed, shelved, ready to pick up when the time is right.

---

## Files in this folder

Reorganized 2026-07-10 into subfolders (content unchanged, paths only):

### Overview (top level)
- **`Expansion Concepts - Player Interaction.md`** — Master overview of three expansion directions (A, B, C) with full ruleset drafts, stress-tests, and a recommendation. Read this first.
- **`old-expansion-thread.md`** — imported ChatGPT brainstorm (Dec 2025, against rulebook v2.7). **Historical source only — all numbers/terms stale.** Read via the review below, not directly.
- **`old-expansion-thread-review.md`** — review & salvage of the above (2026-07-16): what's superseded (offensive spells → Duels; fifth suit → Echo), what's salvaged (combination governance rules above; social-deduction as a candidate Direction 5; base-game micro-tweaks for Convergence), what's dropped (Arcane Weather). Contains the disposition table and gated salvage actions.

### `spell-duels/` — Expansion B — Spell Duels (detailed iteration)
- **`spell-duels/Expansion B - Spell Duels (Reconciled & Tiered).md`** — **Current canonical B document (2026-07-02).** Reconciles the three notes files in `spell-duels/source/` into one chassis, rules on all contradictions found between them (incl. renaming the Aether form "Echo" → **Imprint** to free the Echo name for the fifth energy), and lays the expansion out as five cumulative complexity tiers (Sparring → Resonance War) so the right stopping point is found by testing. Read this; the three in `source/` are its source material.
- **`spell-duels/source/Expansion B - Spell Duels (Deep Dive).md`** — Rebuilds Spell Duels around resonance frequency as the power source (higher card wins the clash). The foundational chassis.
- **`spell-duels/source/Expansion B - Spell Duels Alternative (Resonance Gambits).md`** — Reviewer pass on the Deep Dive. Proposes safer baseline effects (prizes and echoes rather than hard action denial). Now Tier 2 of the reconciled document.
- **`spell-duels/source/Expansion B - Spell Duels (Bold Effect Directions).md`** — Three bolder directions for what winning a clash *actually does* (Elemental Powers, Resonance Marks, Bend the Failing Magic). Now Tiers 3–5 of the reconciled document.

### `rituals-and-seals/` — v0.1 ruleset (new 2026-07-16)
- **`rituals-and-seals/Expansion - Rituals & Mastery Seals (v0.1).md`** — earned in-game identity: public Rituals (structural feats) grant persistent Seals (rules lenses, never RP) that live only while the qualifying structure stands. Internal Seals persist into the Drought; external ones sleep. Own module (fit analysis inside: sibling to Schools, not a fold-in). Salvaged and developed from the old thread.

### `foci-and-conduits/` — v0.1 ruleset (new 2026-07-16)
- **`foci-and-conduits/Expansion - Foci & Conduits (v0.1).md`** — the engine-builder module: an exclusive public row of unique **Foci** (spell attachments that upgrade what a host spell does when cast — piece differentiation + draft arc) and Tier-2 **Conduits** (cast A, a smaller linked spell B echoes a diminished effect — the line's first spell-to-spell chaining). Never scores; deepens the Casting phase (Rituals' bookend). Own module (fit analysis inside: closest sibling is Rituals — earned lenses vs contested parts). Written to the 2026-07-16 engine-builder brief.

### `the-schism/` — v0.1 ruleset (new 2026-07-17)
- **`the-schism/Expansion - The Schism (v0.1).md`** — the dedicated **2-player** box (the audit's one unowned axis, opened by decision `2026-07-17-2p-depth-box-the-schism`): the Collection phase becomes a cut-and-choose market — each round a **Rift** of 4 Source cards opens, 1 is **tithed** to the Arcane Reserve (feeds a ~40%-of-rounds Drought), one player **severs** the remaining 3 into two always-unequal shares and the other claims one; taking fewer carries the **Severance** (choice seat + initiative, one token, contested every round). Deliberately an **open-information duel** (Sam's identity call). Tier 2 adds a 16-card Rift deck (size/tithe/constraint/information twists, pre-turn and symmetric only — ruled distinct from the dropped Arcane Weather). Built ON the free base-side Rival's Gambit layer (2p health stays base territory; the box sells depth). **First count-gated module in the line** — the standing 2–4p/5–6p compatibility rule is satisfied vacuously (Echo never enters a 2p deck); revisit the rule's phrasing if a second count-gated box ever appears.

### `solo-attuned-rival/` — v0.1 ruleset (new 2026-07-19)
- **`solo-attuned-rival/Solo Mode - The Attuned Rival (v0.1).md`** — the **base-box solo mode** (direction decided 2026-07-19, `meta/decisions/2026-07-19-solo-attuned-rival-direction.md`): a rules-brain automa with zero new cards. The Rival owns one energy suit as its own face-down Stack (default Void); its turn is **Flip** (keep if adjacent-±1 to its sorted row or row <3, else reject into the Array), **Tithe** (bury one Array card to the Reserve by priority: wild → extends-your-largest-spell → highest rank; Tithe term deliberately shared with the Schism per governance rule 4), **Burn** (top of Source to Reserve). Its row is all one energy, so it scores on the real table — max(one Conjuration, maximal runs as PTs) — making game length the difficulty dial; the player's pace strands its Stack at the Drought (the central race). Ravening (Stack done → double burn) + Drought draws keep it present to the end. Second count-gated module (1p; Echo rule vacuous). **Not** the deep solo/co-op box — that stays wholly with the Convergence direction. Tuning gated on v3.1 confirm/kill; sim-first test plan in the doc. Production form: 12–15-card deck brain, Wingspan difficulty model. Parked alternative: Severance chassis (solo Rift) as a possible Schism 1–2p extension.

### `null-cabal/` — v0.1 ruleset (new 2026-07-16)
- **`null-cabal/Expansion - The Null Cabal (v0.1).md`** — hidden traitor, 3–6p. One secret Cabalist with a conditional agenda; deduction via the Veils (three anonymous simultaneous contributions, read arithmetically); one fixed vote at Drought start. Owns the trust/interpretation axis. Includes the fully specified 3-player model. Salvaged and developed from the old thread.

### `future-directions/`
- **`future-directions/Expansion Directions - Post-Echo Exploration.md`** — **Current.** Four candidate directions under the new product model, all passing the 2–4p-without-Echo / 5–6p-with-Echo compatibility test: The Overtones (16+ prestige rack), The Schools (asymmetric identities), The Last Rites (the Drought as a third act), The Convergence (co-op/solo). Parts 2–3 (2026-07-02): pairwise interoperability matrix and the development choice — **Schools + Last Rites first**.

### `schools-and-last-rites/` — v0.1 rulesets (most-developed pair; sequencing not settled)
- **`schools-and-last-rites/Expansion - The Schools (v0.1).md`** — full rules: 8 suit-agnostic Schools (talent + lean), market draft, iteration log of 9 bugs fixed on paper.
- **`schools-and-last-rites/Expansion - The Last Rites (v0.1).md`** — full rules: 8 once-each Drought Rites, banish costs, iteration log of 9 bugs fixed on paper.
- **`schools-and-last-rites/Playtest Plans - Schools & Last Rites (templates).md`** — two single-variable session plans in the standard format, gated as templates until the Stage-3 counter fix is validated; copy into `playtests/` via aa-playtest-planner when the gate lifts.
- *(Archived: `_archive/Expansion Directions - Echo and the High Frequencies (superseded 2026-07-02).md` — leaned on Echo as expansion design space, void now that Echo is the 5–6p extension suit.)*

---

## The three expansion concepts (summary)

| | **A — The Living Array** | **B — Spell Duels** | **C — The Conclave** |
|---|---|---|---|
| Flavour | Indirect / competitive | Direct / take-that | Political / negotiation |
| Complexity | Very low | Medium | High |
| New components | None | Ref cards + tokens | Agendas, Influence, Pacts, Edicts |
| Recommended order | Build first (cheapest test) | Build second | Long-term "big box" |

**Recommended sequence when ready:** test A first (one rule change, zero new components) to validate whether added interaction improves the game at all. Then B. C is a future destination, not a starting point.

---

## Reading order when you come back to this

1. `Expansion Concepts - Player Interaction.md` — full context and recommendations
2. `spell-duels/Expansion B - Spell Duels (Reconciled & Tiered).md` — the canonical B ruleset and test ladder (supersedes reading the three `source/` notes files individually)
3. `future-directions/Expansion Directions - Post-Echo Exploration.md` — where the line goes after Trials + Duels
