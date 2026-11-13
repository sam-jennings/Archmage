---
title: Old Expansion Thread — Review & Salvage
type: design-review
status: complete
created: 2026-07-16
reviews: "old-expansion-thread.md"
relates_to:
  - "[[EXPANSION_INDEX]]"
  - "[[Expansion Directions - Post-Echo Exploration]]"
  - "[[Expansion B - Spell Duels (Reconciled & Tiered)]]"
  - "[[Expansion Concepts - Player Interaction]]"
---

# Old Expansion Thread — Review & Salvage

Review of `old-expansion-thread.md` (ChatGPT session, Dec 2025, against rulebook **v2.7**). Verdict up front: **most of its concepts have since been built better elsewhere in this folder, but it contains one whole axis the current line is missing (social deduction), a handful of governance rules better than anything currently written down, and a base-game tweak list that directly serves Convergence.** Everything numeric or terminological in it is void.

---

## 1. Stale — read nothing in it literally

The thread predates almost every structural decision now in canon:

- **Pre-Echo.** It proposes "Aether" as a *new mini-suit* — Aether is now one of the four base energies, and the fifth-suit idea became the **Echo extension** (spent design space). Concept C is fully realized and closed.
- **Dual-deck values (1–15 / 1–20).** All its band maths ("Low 1–7, Mid 8–14, High 15–20") assume the retired 1–20 deck. Values are 1–15 at every count now; 16+ is the reserved **Overtones** space.
- **2–7 players.** The product model is now 2–4 base / 5–6 with Echo. Every "at 7p" scaling note is void, and its 7-role traitor components don't match the line.
- **Rules v2.7.** Transfiguration exchange costs, Drought handling, capacity wording — all moved (v3.1 under test). No rule text in the thread can be lifted verbatim.
- **Treats Ascension Trials as a sketch.** Trials is now its own developed thread (candidate shortlist stage); the thread's "Trial categories" are superseded.
- **Standing compatibility rule didn't exist yet.** Nothing in it was checked against "plays identically at 2–4p (no Echo) and 5–6p (Echo in)."

---

## 2. What's genuinely good

### 2a. The social-deduction axis — the only unowned concept
**Cabal of the Null** (hidden traitor) has **no equivalent anywhere in the current line.** The Catan-test register — Trials owns scoring, Duels owns collision, Schools owns identity, Last Rites owns the ending, Overtones owns prestige, Convergence owns co-op/solo — has no owner for *trust and interpretation*. The thread's specific design work is unusually solid:

- **Traitor as system-nudger, not attacker** — sabotage menu of plausible-deniability frictions (Misbind, Obscure, Withhold), never destruction. This matches the base game's non-destructive spine.
- **The 3-player solution** — no accusations until a fixed trigger; conditional (non-collapse) agendas like "highest loyal score ≤ Y"; exactly one costly accusation. This is real design for the hardest count, and 3p matters more now that the base is 2–4.
- **"Was that sabotage or bad luck?"** needs ambient noise to hide in — the thread correctly identifies that a traitor module needs a *carrier* (its Stability/Turbulence overlay; in our line, Convergence's demands could serve).

### 2b. Cross-set governance rules — better than what we have
The current Post-Echo doc has a pairwise interoperability matrix; the old thread has **meta-rules** that generalize to any future combination:

1. **"Complexity modules define possibilities; player-dynamic modules define incentives"** — a one-line conflict-resolution order for any rules contact.
2. **Hard caps scale downward when a social module is active** (fewer identities/persistent effects per player while suspicion is live) — readability under social load.
3. **Hidden information never modifies math** — hidden roles change timing and interpretation only, never costs or values. Preserves post-game clarity.
4. **Effect-template discipline** — expansions vary numbers and trigger windows inside a small set of shared templates, so stacked modules compose predictably.

None of these exist as standing rules in EXPANSION_INDEX. They should.

### 2c. Base-game micro-tweaks — directly serve Convergence
- **Formal "Round" definition** — Convergence deadlines, any event cadence, and Duels Tier 4 all want a stable cadence unit.
- **Source depth/threshold markers** — Convergence deadlines are "expressed in Source depth"; a physical marker makes that legible for free.
- **An internal/external keyword** (persists into Drought vs. dies with the Source) — the base fiction already makes this split for Enchantments; naming it once would serve Last Rites, Schools talents, and any future persistent effect.

### 2d. Scattered mechanics worth keeping as parts inventory
- **Dissonance's coherence-defense**: spells spanning wide value ranges are *vulnerable*; tight-band spells are resilient. Duels Tier 3 already brings frequency bands back for scaling — this is a natural defensive counterpart.
- **Internal vs. external Seals** (persist into Drought vs. disabled by it) — a clean lever for Last Rites-adjacent or Schools-talent design.
- **Two-sided event cards** (constraint + compensating boon) — if any event-like deck is ever built, this is the right template for keeping randomness pivotable rather than punishing.
- **World Stability as a semi-co-op overlay** — a lighter sibling of full Convergence; could become a Convergence *mode* for competitive tables rather than its own box.

---

## 3. What's bad — drop deliberately

- **Arcane Weather / Turbulence as a standalone direction.** Round-by-round global rule mutation conflicts with the design spine the thread itself states: *skill expression lives in sequencing, not randomness*. As a module it's noise; as traitor-cover it's replaceable by Convergence demands. Don't build it.
- **The offensive-spell models (Disjunction / Dissonance / Unravelling) as written.** All three touch built Spellbooks — Disjunction splits a spell, Dissonance removes components. That violates the settled Duels spine (**never destroy built spells; attacks are tempo**), which was adopted precisely because stress-testing destruction found planning-death and disengagement. Duels *is* the surviving, correct version of this idea. Only the coherence-defense principle (2d) survives.
- **The two-box product structure (Codex / Conclave sets).** The current throughline-ownership model is finer-grained. *(Corrected 2026-07-16: no sequencing is settled — Trials is the only locked-in expansion; "Schools + Last Rites first" is a recommendation only.)* Keep the *axes* insight (complexity vs. dynamics) as governance (2b-1), not as boxes.
- **Punitive accusation costs.** "Wrong accusation → skip your Collection / traitor gets a free sabotage" is double feel-bad — it punishes engagement with the module's core verb. If Cabal is ever built, cost should be information or tempo elsewhere, not a lost turn.
- **Its confidence.** The thread repeatedly declares itself "structurally elegant" and "genuinely expandable" with zero table contact. Every claim in it has the same evidence weight as everything else in this folder: none. Treat it as brainstorm, not validation.

---

## 4. Concept-by-concept disposition

| Old thread concept | Current owner | Disposition |
|---|---|---|
| Extra suit "Aether" | **Echo extension** (spent) | Closed — realized |
| Offensive spells / Fracture | **Spell Duels** (reconciled, tiered) | Superseded; salvage coherence-defense into Duels T3 notes |
| Resonance Schools (value bands) | Partly **Duels T3** (bands), partly **Overtones** (value semantics) | Superseded as a module; bands live where they landed |
| Rituals & Mastery Seals | No direct owner | Parts inventory: internal/external persistence lever (2d) |
| Ascension Trials integration | **Trials thread** (shortlist stage) | Superseded |
| World Stability (semi-co-op) | **Convergence** (Direction 4) | Fold in as a possible competitive-table mode |
| Arcane Weather / Turbulence | — | Dropped (conflicts with design spine) |
| **Cabal of the Null (traitor)** | **None** | **Salvage: candidate Direction 5, park in future-directions** |
| Two-set box structure | Throughline model (Post-Echo doc) | Dropped as structure; keep as governance rule |
| Cross-set integration rules | EXPANSION_INDEX (partially) | **Salvage: add as standing rules** |
| Base-game micro-tweaks | — | **Salvage: note against Convergence + rulebook backlog** |

---

## 5. Salvage actions *(gating removed 2026-07-16 — decision `2026-07-16-expansion-status-reset`; items 2 and parts of the traitor salvage are executed in `rituals-and-seals/` and `null-cabal/`)*

1. **Add the four governance rules (2b) to EXPANSION_INDEX** as standing rules next to the Echo compatibility test. Paper-only, cheap, protects every future combination. *(Done in the index alongside this review.)*
2. **Park "Direction 5 — social deduction"** as a one-paragraph candidate in the Post-Echo doc when that doc is next touched: traitor-as-nudger, 3p delayed-accusation model, Convergence as noise-carrier, subject to the Echo compatibility test. Do not develop.
3. **When Duels Tier 3 is developed**, consider coherence-defense: tight-band spells resist strikes / wide-band spells are exposed.
4. **When Convergence is developed**, evaluate World Stability as a semi-co-op mode, and note that its deadline system wants Source-depth markers and a formal Round — check whether v3.1 rulebook already defines both; if not, they're cheap rulebook clarifications with expansion-proofing value.
5. `old-expansion-thread.md` itself → candidates for `_archive/` once salvage items 2–4 are captured in their target docs; until then it stays here as the source this review points into.
