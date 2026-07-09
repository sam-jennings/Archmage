---
title: Ascension Trials — Ground-Up Rebuild (proposal, SUPERSEDED)
type: design-proposal
date: 2026-07-06
status: superseded — entry-cap mechanic rejected 2026-07-06 (D-AT1)
supersedes_when_adopted: rulebook/Ascension Trials.md
superseded_by:
  - "_review/ASCENSION_TRIALS_02_HYBRID_REBUILD_PROPOSAL_2026-07-06.md"
  - "_review/ASCENSION_TRIALS_03_HYBRID_REBUILD_CRITIQUE_2026-07-06.md"
relates_to:
  - "[[Archmage Ascension - Complete Rulebook]]"
  - "[[Scoring System Reference]]"
  - "meta/decisions/2026-07-06-f8-ascension-trials-reconcile.md"
  - "meta/decisions/2026-07-06-at-entry-model-secret-allocation.md"
purpose: A clean-sheet redesign of the Ascension Trials advanced endgame for the CURRENT ruleset (4 energies at 2-4p, +Echo at 5-6p; ranks 1-15; max spell size 15; enchantment ladder 3/4/5 = +1/+3/Unlimited Capacity). Does NOT overwrite the live rules — this is a proposal for review and playtest.
---

> [!warning] SUPERSEDED (2026-07-06)
> The **entry-cap** mechanic proposed here (§3.2, §7 D-AT1) was **rejected**. Secret power
> allocation is retained. See:
> - `meta/decisions/2026-07-06-at-entry-model-secret-allocation.md` (the decision).
> - `_review/ASCENSION_TRIALS_02_HYBRID_REBUILD_PROPOSAL_2026-07-06.md` (current primary
>   proposal — hybrid of new power model + retained secret allocation).
> - `_review/ASCENSION_TRIALS_03_HYBRID_REBUILD_CRITIQUE_2026-07-06.md` (critique of 02,
>   with proposed fixes; still under review).
>
> **Kept for the audit trail**, not for adoption. Do not implement this file's mechanics.
> Its power-formula reasoning (§1), Trial set (§2), Recognition Points table (§4), and
> tiebreakers (§5) were the basis for the hybrid proposal; the entry-cap in §3.2 and
> D-AT1 in §7 are what was rejected.

# Ascension Trials — Ground-Up Rebuild (proposal)

> **This is a proposal, not canon.** The live variant remains `rulebook/Ascension Trials.md`
> until Sam adopts this and a decision file records the switch. Numbers here are first-pass
> and calibrated by reasoning against the standard Recognition-Point table — they are a
> **playtest starting point**, not a validated balance.

## Why rebuild instead of patch

The live AT was balanced for an older deck and player range (5–7 players, no Echo domain,
pre-ladder Enchantment values) and carried known gaps even then: the 6p reward splits were
never defined, Complete Mastery only existed at 5p, and the wild-magic / Enchantment bonuses
predate the 3/4/5 = +1/+3/UC ladder. Rather than graft the fifth energy onto stale scaffolding,
this redesign starts from the current game's four facts:

1. **Energies:** Radiance, Void, Flux, Aether at 2–4p; **+ Echo at 5–6p**.
2. **Spell types:** Conjuration (same energy), Transfiguration (run across energies),
   Enchantment (matching values, capped 4 at 2–4p / 5 at 5–6p), Perfect Transmutation
   (run within one energy; hardest length spell).
3. **Ladder:** 3-card Enchantment = +1 counter, 4-card = +3, 5-card = Unlimited Capacity
   (5–6p only).
4. **Ceiling:** ranks 1–15, no spell exceeds 15 components (F6).

## Design goals

- **One framework, 2–6p.** Player count changes *how many* trials are live and whether 2nd
  place scores — not the underlying rules.
- **Preserve AT's soul:** secret commitment + you can't win everything + you must read the
  table. But express it in a form teachable in two minutes (the old power-point-splitting
  was the least teachable part).
- **Reward every build shape:** deep specialist, broad generalist, and the hard three-type
  polymath — each has a trial it is built to win.
- **Don't double-pay Unlimited Capacity.** UC already dominates the action economy and the
  standard score (18). In AT it earns a strong-but-bounded Enchantment power, not a runaway.
  (Same principle as decision F4.)

---

## 1. Power

Your final Spellbook produces **power** in one or more **domains**. Power is the currency
every trial reads.

### 1.1 Spell Power (length spells)

For Conjuration, Transfiguration, and Perfect Transmutation:

> **Spell Power = 2 × components − 3.**
> (3 power for a 3-component spell, then +2 for every additional component.)

| Components | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|:--:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:--:|:--:|:--:|:--:|:--:|:--:|
| **Power** | 3 | 5 | 7 | 9 | 11 | 13 | 15 | 17 | 19 | 21 | 23 | 25 | 27 |

This is deliberately far flatter than the standard RP curve (where a size-15 Conjuration is
81 points). AT contests are mostly *within* a domain, where length is the fair comparator; a
flat curve keeps trials contestable instead of letting one giant spell settle everything.

### 1.2 Enchantment Power (its own small scale)

Enchantments are capped and qualitatively harder per component, so they use a dedicated scale
rather than the length formula:

| Enchantment | 3-card | 4-card | 5-card (UC) |
|:--|:--:|:--:|:--:|
| **Power** | 4 | 8 | 12 |

5-card Enchantment power (12) exists **only at 5–6p** (Echo supplies the fifth energy). This
is the concrete AT payoff for reaching Unlimited Capacity — meaningful, but not doubled on top
of a wild bonus (see 1.4).

### 1.3 Power Domains

A domain's power is the **sum** of the power of every qualifying spell you own.

| Domain | Fed by |
|--------|--------|
| Radiance / Void / Flux / Aether Power | Your Conjurations of that energy |
| **Echo Power** *(5–6p only)* | Your Echo Conjurations |
| Transformation Power | All your Transfigurations |
| Enchantment Power | All your Enchantments (table 1.2) |

**Perfect Transmutation** is a hybrid: it adds its full Spell Power to **its energy domain**
*and* its full Spell Power to **Transformation Power** (and grants +1 wild magic, 1.4). PT is
the only spell that feeds two domains — its reward for being the hardest length spell.

### 1.4 Wild Magic (flexible power)

Some spells grant loose **wild-magic power** you assign at reveal:

- +1 per Perfect Transmutation.
- +1 per 4-component Enchantment.
- +1 per 5-component Enchantment (Unlimited Capacity).

Wild magic:
- may be added only to a trial you already have **≥1 real domain power** in;
- does **not** establish eligibility and does **not** count as a "domain" or "source"
  (it can't make Harmony/Universal/Complete legal on its own);
- may be split across trials or stacked on one;
- is **ignored in tiebreakers**.

---

## 2. The Trials

Seven trials exist. Each is a contest: among players who **entered** it (§3), the highest
qualifying power wins its Recognition Points.

| # | Trial | Who may enter (eligibility) | Power it reads |
|:-:|-------|------------------------------|----------------|
| 1 | **Energy Purity** | All your energy-domain power is in **exactly one** energy | that energy's power |
| 2 | **Energy Harmony** | You have power in **2+** energy domains | your total energy-domain power |
| 3 | **Transformation Mastery** | any (needs ≥1 Transformation power) | your Transformation power |
| 4 | **Enchantment Mastery** | any (needs ≥1 Enchantment power) | your Enchantment power |
| 5 | **Focused Power** | All your power sits in **exactly one** domain, any type | that domain's power |
| 6 | **Universal Power** | You have power in **2+** domains, any mix | your total power |
| 7 | **Complete Mastery** | You have power in **≥1 energy domain AND Transformation AND Enchantment** | your total power |

Purity vs Harmony, and Focused vs Universal, are mutually exclusive by construction — your
build picks a lane. Complete Mastery is the hardest gate: all three build-types at once.

---

## 3. Which trials are live, and entering them

### 3.1 Active trials by player count

More players → more trials worth contesting. Trials switch on in this order:

| Players | Live trials | Count |
|:-------:|-------------|:-----:|
| 2 | Purity, Transformation, Enchantment, Universal | 4 |
| 3 | + Focused Power | 5 |
| 4 | + Energy Harmony | 6 |
| 5 | + **Complete Mastery** | 7 |
| 6 | all 7, **1st and 2nd both score** | 7 |

This makes **Complete Mastery a 5–6p-only trial by design** — it needs the richer, five-energy
board to be a fair contest, which is exactly where Echo lives. (This resolves the old
"Complete Mastery availability" gap cleanly, rather than by an arbitrary player-count note.)

### 3.2 Secret entry (AT's core decision)

After the Drought ends and Spellbooks are final, each player **secretly commits** a set of
trials they enter, up to the entry cap, then all reveal simultaneously:

| Players | 2 | 3 | 4 | 5 | 6 |
|:-------:|:-:|:-:|:-:|:-:|:-:|
| **Entry cap (trials per player)** | 2 | 2 | 3 | 3 | 3 |

You may only enter trials you're eligible for. You never split a power number — each entered
trial simply reads the relevant power from your Spellbook. The cap is what stops a dominant
Spellbook from sweeping every trial: you must *choose your fights*, and you're guessing where
opponents will show up. (Spellbooks are open, so power is knowable — the hidden information is
*who committed where*.)

> **This entry-cap model replaces the old "allocate power points across trials" mechanic.**
> It keeps the bluff and the anti-sweep pressure while being teachable in one sentence. See
> §7 for the heavier "sealed allocation" variant if the cap proves too coarse.

---

## 4. Recognition Points

Winner of each live trial takes its RP. At 6 players, 2nd place also scores.

| Trial | 1st | 6p 2nd |
|-------|:---:|:------:|
| Energy Purity | 8 | 3 |
| Energy Harmony | 6 | 2 |
| Transformation Mastery | 8 | 3 |
| Enchantment Mastery | 8 | 3 |
| Focused Power | 7 | 3 |
| Universal Power | 6 | 2 |
| Complete Mastery | 9 | 4 |

**Resulting pools** (only live trials count):

| Players | Live trials | 1st-place pool | +2nd | Total |
|:-------:|-------------|:--------------:|:----:|:-----:|
| 2 | 4 | 30 | — | **30** |
| 3 | 5 | 37 | — | **37** |
| 4 | 6 | 43 | — | **43** |
| 5 | 7 | 52 | — | **52** |
| 6 | 7 | 52 | 20 | **72** |

Values were set by three rules, not inherited: type-masteries and the specialist Purity gate
pay highest (commitment/difficulty); broad gates (Harmony/Universal) pay least (safest);
Complete Mastery pays most (hardest eligibility). Pools land close to the old table's shape
(old: 30 / 38 / 41 / 47 / 62) so existing intuition still roughly holds. **All values are a
playtest starting point.**

---

## 5. Tiebreakers

If two or more entrants tie on a trial's power:

1. **Bigger Spellbook** — most total power across all your domains.
2. **More spells** in your Spellbook.
3. **Largest single spell** (most components).
4. **Still tied → shared:** each tied wizard takes the full Recognition Points.

(Wild magic is excluded from all tiebreak comparisons.)

---

## 6. Worked example (5-player Echo game)

Maya's final Spellbook: a 7-card Void Conjuration (power 11), a 5-card Transfiguration
(power 7), a 4-card Enchantment (power 8, +1 wild), and a 6-card Perfect Transmutation in
Aether (power 9 to Aether **and** 9 to Transformation, +1 wild).

- Aether Power = 9 · Void Power = 11 · Transformation = 7 + 9 = 16 · Enchantment = 8
- She has power in 2 energy domains → **not** Purity-eligible; Harmony-eligible.
- She has 4 domains with power → Universal-eligible; **not** Focused.
- Energy + Transformation + Enchantment all present → Complete Mastery-eligible.
- Total power = 9 + 11 + 16 + 8 = 44. Wild magic = 2.

Entry cap 3. She commits **Transformation Mastery** (16 — likely top), **Complete Mastery**
(44 total), and **Enchantment Mastery** (8). She holds her 2 wild onto Complete Mastery
(44 → 46) expecting a close race there. She skips Universal (she'd rather bank Complete) and
can't enter Purity/Focused. Reveal; compare against the table.

---

## 7. Open decisions & playtest watch

**Decisions for Sam (I did not settle these silently):**

- **D-AT1 — Entry model.** Primary proposal is *secret entry with a cap* (§3.2). The
  alternative is a **sealed power-allocation** variant (closer to the old AT): you receive a
  spendable power budget = your total power and secretly distribute it across trials; unspent
  power is wasted; a point spent on one trial can't score another. Richer bluffing, heavier
  teach. **Recommendation:** test the entry-cap model first; keep sealed allocation as a
  Stage-5 "advanced AT" layer.
- **D-AT2 — PT double-counting.** PT feeds full power to both its energy domain and
  Transformation (§1.3). Strong; may let PT-heavy builds win several trials. Alternative:
  half power to Transformation. **Recommendation:** keep full, watch for sweeps.
- **D-AT3 — Entry caps and RP values** (§3.2, §4) are first-pass. Tune from the first
  5–6p + AT session.

**Playtest watch:**
- Does the entry cap actually prevent one strong Spellbook from taking 3 trials uncontested?
- Does the UC holder over-perform in Enchantment / Complete Mastery (F4 double-pay concern)?
- With five energies, is Energy Purity too hard to reach (deck more diluted) — is its RP right?
- At 6p, do 2nd-place payouts keep trailing players engaged, or just reward the same leaders?
- Is Complete Mastery achievable at 5p, or does it need 6p's larger card flow?

---

## 8. What changed from the live rules (summary)

- **Added Echo Power** as a fifth energy domain (5–6p).
- **Removed all 7-player content**; range is now 2–6p.
- **New power model:** clean `2×components − 3` length curve + a dedicated 3/4/5 = 4/8/12
  Enchantment scale (was: 3–4 ×1.0 / 5–6 ×1.5 / 7+ ×2.0, with no ladder-aware Enchantment
  values).
- **Wild magic reconciled to the ladder:** +1 per PT, per 4-card Enchantment, and per 5-card
  Enchantment (previously silent on 5-card).
- **Trials scale by player count** (4→7), which makes **Complete Mastery a 5–6p trial** by
  construction and **defines the 6p 1st/2nd split** (both previously undefined).
- **Entry-cap commitment** replaces power-point allocation as the secret/bluff mechanic.
- **Unlimited Capacity** now has an explicit, bounded AT value (12 power + 1 wild), instead of
  being unaddressed.
