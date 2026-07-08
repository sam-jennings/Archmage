---
title: Ascension Trials Hybrid Rebuild — Design Critique & Improvement Proposal
type: design-review
date: 2026-07-06
status: for-decision — proposes fixes against file 02
reviews:
  - "_review/ASCENSION_TRIALS_02_HYBRID_REBUILD_PROPOSAL_2026-07-06.md (the ruleset under review)"
relates_to:
  - "_review/ASCENSION_TRIALS_01_ENTRY_CAP_REBUILD_SUPERSEDED_2026-07-06.md (earlier entry-cap proposal, superseded)"
  - "meta/decisions/2026-07-06-f8-ascension-trials-reconcile.md"
  - "meta/decisions/2026-07-06-at-entry-model-secret-allocation.md"
  - "[[Ascension Trials]] (live rules, old formula)"
purpose: Rigorous critique of the hybrid rebuild, answering Sam's 7 questions, with concrete replacement rules. Secret allocation is preserved throughout; anything that touches it is labelled MAJOR REDESIGN.
---

# Ascension Trials Hybrid Rebuild — Critique & Proposal

**Frame used throughout:** with open Spellbooks, every player's domain powers are public.
The Trials are therefore a Colonel-Blotto-style game — asymmetric public budgets, secret
deployment, winner-take-all battlefields. That structure is genuinely good (Blotto games
have real mixed-strategy bluffing even under full information about budgets). Every
weakness below is a place where the current rules *reduce* the number of meaningful
deployment choices, and every fix is aimed at increasing them without new bookkeeping.

---

## 1. Power formula

### The three candidates, computed

| Size | Old multiplier | **2n−3 (current)** | Convex alt (cards 8+ = +3) |
|---:|---:|---:|---:|
| 3 | 3 | 3 | 3 |
| 4 | 4 | 5 | 5 |
| 5 | 8 | 7 | 7 |
| 6 | 9 | 9 | 9 |
| 7 | 14 | 11 | 11 |
| 8 | 16 | 13 | 14 |
| 10 | 20 | 17 | 20 |
| 12 | 24 | 21 | 26 |
| 15 | 30 | 27 | 35 |

**Marginal value of one extra card:** old = 1, 4, 1, 5, 2, 2… (erratic); current = always 2;
convex = 2 until size 7, then 3.

**Consolidation bonus** (one merged spell vs. the same cards as two spells):

| Merge | Old | 2n−3 | Convex |
|---|---:|---:|---:|
| 3+3 → 6 | +3 | +3 | +3 |
| 4+4 → 8 | +8 | +3 | +4 |
| 5+7 → 12 | +2 | +3 | +8 |
| 7+8 → 15 | **+0** | +3 | +10 |

### Verdict on each

**Old multiplier — genuinely buggy, not just clunky.** Three defects the table exposes:
the marginal card is worth +1, +4, +1, +5 depending on where you are (stall at 4, sprint
to 5; a 6th card is nearly worthless, a 7th is gold) — that's threshold-gaming, not
strategy; it needs a rounding rule for exactly one case (5 cards); and at the top end it
*stops rewarding consolidation entirely* — two spells of 7+8 equal one 15-spell (+0).
The formula is superlinear in the middle and linear at both ends. Retiring it was right.

**Current 2n−3 — correct choice, with two real consequences to own.**

*Bug 1 — total power is structure-blind.* Under a linear formula, total power =
2 × (cards in Spellbook) − 3 × (number of spells), regardless of how the cards are
arranged. Eighteen cards in three spells is 27 power *whatever the split*. So every
Trial that reads a **sum across domains** (Universal, Complete, Harmony-as-total) is
decided by card count and spell count alone — build shape is irrelevant to them. That's
not fatal (those Trials carry the lowest RP, and *distribution* across domains still
gates eligibility), but know that "breadth" Trials under this formula measure hoarding
efficiency, not architecture.

*Bug 2 — no reach incentive.* Card 13 is worth exactly what card 4 is worth. The base
game's scoring table and the old AT both made giant spells an event; the hybrid makes
them a straight line. Nothing in the current Trial set gives a player a reason to gasp
at a 12-card spell. This is the one thing the old formula did *emotionally* better.

*(Trivia, not a bug: 2n−3 is always odd, Enchantment power always even. No action needed;
tiebreakers cover ties.)*

**Convex alternative — computed and rejected.** "Cards beyond the 7th are worth +3" is
one teachable sentence and restores reach. But look at the consolidation column: the
bonus grows to +10 at the top, and it flows disproportionately to whichever spell type
is *easiest to extend* — which per the open P1 (QUEUE: Transfiguration vs PT balance) is
the Transfiguration. Convexity would pour fuel on the Transformation-domain inflation
problem (§3). Any superlinear formula has this property; it's structural, not tunable.

### Recommendation

**Keep 2n−3 exactly as written.** It is the best of the three for an allocation endgame:
flat curves keep Trials contestable, constant marginals kill threshold-gaming, and it's
teachable in one sentence. Do **not** fix the missing big-spell drama in the formula —
fix it in the Trial list, where it belongs (§3, Trial of the Archspell). The formula's
job is comparability; the Trials' job is drama.

---

## 2. Two-player predictability

### Diagnosis — you found a real structural problem, and it isn't the Trial count per se

At 2p the four active Trials read almost **disjoint** power sources: Purity reads one
energy, Transformation Mastery reads Transformation, Enchantment Mastery reads
Enchantment. Only Universal overlaps them. So each player faces essentially *one*
decision — "how much do I divert from my mastery Trials into Universal?" — and with
public Spellbooks, both players can often compute the answer. The game is thin because
each domain has only **one and a half places to go**, not because four is too few Trials.

Some 2p predictability is inevitable (two-player Blotto with public budgets is the
thinnest case of the genre), but the current setup is thinner than it has to be.

### Would all six non-Complete Trials fix it? No — it creates a worse bug

With 6 Trials and 2 players, there are more battlefields than either player can seriously
contest. Since there is **no allocation minimum**, the degenerate line is to squat 1
power on every Trial the opponent might skip — a 1-power allocation to an uncontested
Trial wins full RP. Both players spread pennies everywhere and the reveal is a wet
firework: half the Trials won with 1–2 power. More Trials without an entry floor makes
2p *less* dramatic, not more.

### Recommended 2p package (three small rules, no new components)

1. **Five Trials at 2p, not four:** add **Focused Power** (i.e., 2p uses the current 3p
   list). Now every domain has at least two competing sinks — Void power can fight in
   Purity, Focused, *and* Universal — which is what makes allocation splits non-obvious.
2. **Minimum Claim (all player counts, see §4):** a Trial entry is legal only if its
   normal power ≥ that Trial's printed 1st-place RP. Kills penny-squatting everywhere;
   at 2p it means an uncontested win still costs real power that can't fight elsewhere.
3. **Champion's Mark (2p only, the hidden-pressure lever):** during allocation, each
   player also secretly marks **one** active Trial as their Champion Trial. If you win
   your marked Trial, **+4 RP**. Reveal with allocations.

Why the Mark is the right lever: the only thing missing at 2p is *private information*.
Budgets are public, so pure allocation is near-computable. The Mark makes each player's
**valuation** of the Trials private — opponent's optimal counter now depends on a guess.
That is exactly the asymmetric-value Blotto structure that produces real bluffing, and it
costs one secret note, zero bookkeeping. (If +4 proves too swingy on a 30–37 pool, test
+3; don't go below or it stops moving decisions.)

Do **not** add Harmony at 2p: with four energies and a deck split four ways, 2+-energy
allocations are common enough that Harmony mostly duplicates Universal there.

---

## 3. Trial structure

### The quiet regression nobody named: gates moved from *build* to *allocation*

In the earlier rebuild, Purity required that **all your energy power** sit in one energy —
a build achievement. In the hybrid, Purity only requires that the *allocation* use one
energy — which every player with any Conjuration can satisfy. Same for Focused. This was
the right call for allocation flexibility (build-gates + secret allocation would be
brutal), but it has a cost: **Trials no longer certify builds, only allocations**, so
Trials that differ only in their source-mix rule now feel samey. That is the root of the
redundancy below.

### Trial-by-trial audit

- **Energy Purity — keep.** The anchor specialist Trial. With the deck split 4–5 ways,
  a big single-energy number is a real achievement even if the gate is allocation-level.
- **Energy Harmony — keep at 4p+.** Distinct enough from Universal (energy-only), and at
  4p+ the Purity/Harmony fork creates genuine build tension.
- **Transformation Mastery — keep, but it's structurally inflated.** Every
  Transfiguration and every PT in the game feeds **one shared domain**, while
  Conjurations split across 4–5 energies; and Transfigurations (cross-energy runs) are
  the easiest length spell to extend. TM will systematically post the biggest single-domain
  numbers at the table, and Transformation becomes the premium currency for Focused,
  Universal, and Complete too. Not a within-Trial fairness problem (everyone competes in
  the same inflated currency) but a cross-Trial one. Fixes: RP 8→7 (§6) now, and hold a
  **predefined nerf** — "Transfigurations generate power as if one component shorter"
  (2n−5) — to apply only if TM-centric builds win the most RP across 2–3 consecutive
  tests. Don't pre-nerf; the pooling advantage may be fair compensation for Conjurations
  getting Purity.
- **Enchantment Mastery — keep.** Narrow entry is fine; the Minimum Claim (§4) stops a
  lone 3-card Enchantment (4 power) from claiming 8 RP unopposed, which is currently the
  cheapest windfall in the ruleset.
- **Focused Power — the weakest Trial in the set.** It is Energy Purity with two extra
  legal sources. Same decision texture, same specialist identity, and the same big domain
  usually feeds both — the "tension" between them is just splitting one pile two ways.
  At minimum it's the first Trial to cut; better, replace it (below).
- **Universal Power — keep.** Under 2n−3 it reads card-count efficiency (§1 Bug 1), which
  is why its RP is rightly lowest. Fine as the safety-valve Trial.
- **Complete Mastery — 5–6p only is correct. Keep it there.** At 2–4p (four energies,
  Enchantments capped at 4 cards, thinner card flow) the three-type requirement would be
  decided at build time — whoever manages all three types at all wins — with allocation
  irrelevant. It becomes a real *contest* only when Echo widens the build space. This also
  gives the 5–6p game an exclusive marquee Trial, which is good product structure.
  (Resolves the open F8 sub-question: 5–6p, by design rationale, not by note.)

### Replacement proposal — Trial of the Archspell (bolder version)

Replace Focused Power, at all player counts where it appears:

> **Trial of the Archspell.** *Requirement:* all normal power allocated to this Trial
> must come from **one single spell** (drawn from one of the domains that spell feeds).
> *Reads:* that allocated power, plus Wild Magic assigned here.

Why this earns its slot: it restores the big-spell drama that the flat formula removed
(§1 Bug 2) — exactly where it belongs, as a Trial identity rather than a formula bend; it
has zero overlap with Purity (a spread of small same-energy Conjurations wins Purity but
is useless here); it creates a new allocation dilemma (your 11-power Conjuration is both
your Purity engine *and* your Archspell candidate — one pile, two exclusive fights); and
it's PT-relevant without buffing PT (a PT can fight here from either of its domains, but
its Spell Power is the cap). Bookkeeping: the allocation sheet gains one line ("which
spell"), nothing else.

Net structure: **seven Trial slots, same counts per player count as now** (with Focused →
Archspell), 2p bumped to five per §2.

---

## 4. Secret allocation

### Verdict: the core mechanic is sound — protect it, floor it, and stop there

The over/under-commitment decisions are real wherever a domain has 2+ legal sinks and 2+
plausible contestants. The mechanic does what you designed it to do. The problems are at
the edges:

**Degenerate line 1 — penny-squatting (the big one).** No allocation minimum means 1
power legally claims any uncontested Trial's full RP. At 3p+ this is occasionally smart;
at 2p with more Trials it becomes the *dominant* line (§2). Fix:

> **Minimum Claim:** an allocation to a Trial is legal only if its **normal power**
> (Wild Magic excluded) is **at least that Trial's printed 1st-place RP**.

One sentence, no new numbers to remember (it's printed on the Trial), thematically clean
("the Trial only recognises a worthy display"), and it makes *every* claim — including
bluffs — cost something that can't fight elsewhere. Check the arithmetic works: Purity
needs ≥8 (a 6-card Conjuration alone qualifies, 9; a 5-card alone doesn't, 7); EM needs
≥7–8 (one 4-card Enchantment qualifies; a lone 3-card doesn't). Those floors are
demanding but honest. If playtests show too many Trials going unclaimed, fall back to a
flat **minimum 5** on all Trials — strictly simpler, slightly weaker.

**Degenerate line 2 — the forced mastery dump.** For a player whose Enchantment or
Transformation power has no competitive second sink, "dump it all on the mastery Trial"
is automatic. Partially inherent (mastery Trials *should* attract their domain), fully
mitigated by giving every domain a second sink (Archspell, Universal, 2p Focused) — which
the §2/§3 changes do.

**Entry cap — no.** That's the rejected entry-cap model through the back door; the
Minimum Claim self-limits entries (you can only afford so many floors) while keeping the
*amount* decision, which is the part with the game theory in it.

**Hidden bid structures beyond this — no.** Sealed multi-round bidding etc. would be a
MAJOR REDESIGN and would mostly add procedure, not decisions. The one hidden-info
addition worth having is the 2p Champion's Mark (§2), which changes *values*, not the
allocation procedure.

**Procedure nit:** step 3 of §7 (allocate Wild Magic after normal power) implies a
sequence inside a simultaneous secret step; fold it into one step ("allocate normal power
and Wild Magic; Wild Magic only where you have ≥1 normal power") to avoid table-lawyering.

---

## 5. Wild Magic

**Sources are correct as written.** +1 per PT, +1 per 4-card Enchantment, +1 per 5-card
Enchantment. Specifically:

- **5-card / Unlimited Capacity should stay at +1, not +2.** UC already pays three times:
  game-warping capacity during play, 12 Enchantment power, and Complete-Mastery
  eligibility fuel. A second Wild point is double-pay (same principle as F4) on the spell
  least in need of help. The proposal's own watch-list note is right; make it firm.
- **Don't extend Wild Magic to big spells** ("+1 per spell of size 8+" was considered as
  a way to restore size drama — rejected; the Archspell Trial does that job without
  inflating the Wild economy).

**Does it blur Trial identities? No — the guardrails are exactly right.** It can't create
legality, can't satisfy source requirements, and is tiebreak-invisible, so identities
hold. Its real function is well-chosen: since Spellbooks are public, opponents can count
your Wild Magic but never know *where* it lands — it thickens allocation uncertainty by
±1–2 per Trial, i.e., it makes near-ties unreadable. That's on-theme and cheap.

**One necessary clarification with the Minimum Claim:** Wild Magic does **not** count
toward the minimum (consistent with "cannot make a Trial legal by itself"). Add that
sentence when adopting §4.

At typical volumes (0–3 per player) it's meaningful without being a currency. Correct as
designed; resist the urge to grow it.

---

## 6. Recognition Points

**The structure (fixed per-Trial values, pool scaling by active list) is right.** Two
values are mispriced against contest difficulty:

- **Transformation Mastery 8 → 7.** RP should price how hard the contest is to win, and
  TM is the easiest place at the table to post a huge number (§3: pooled domain, cheapest
  extensions). Paying it like Purity overpays it.
- **Enchantment Mastery 8 → 7.** Entry is build-gated and entrants are few; with the
  Minimum Claim in place the windfall risk drops, but 8 still overpays a Trial that often
  has one serious contestant.

### Proposed reward table (bolder version, with Archspell replacing Focused)

| Trial | 1st | 6p 2nd | Priced for |
|---|:---:|:---:|---|
| Energy Purity | 8 | 3 | hardest big single number (deck split 4–5 ways) |
| Energy Harmony | 6 | 2 | broad = safe = cheap |
| Transformation Mastery | 7 | 3 | pooled domain discount |
| Enchantment Mastery | 7 | 3 | narrow-entry discount |
| Trial of the Archspell | 7 | 3 | one-spell concentration |
| Universal Power | 6 | 2 | safest gate in the game |
| Complete Mastery | 9 | 4 | hardest eligibility, 5–6p marquee |

Pools: 2p/3p (5 Trials: Purity, TM, EM, Universal, Archspell) = **35**; 4p (+Harmony) =
**41**; 5p (+Complete) = **50**; 6p = **50 + 20 = 70**. Same shape as now, slightly
flatter at the top.

**Should 2p rewards differ more sharply? No — the opposite.** Sharper spreads at 2p make
the priority ordering *more* computable, worsening the exact problem you observed. The
Champion's Mark supplies 2p differentiation privately, which is where it belongs.

**6p second place: a patch, but the correct patch.** Seven winner-take-all Trials among
six players is a real lockout risk; paying 2nd is the lightest fix that keeps trailing
players allocating seriously. Keep it experimental with a named failure condition: if
across two 6p tests the 2nd-place RP mostly lands on the players already placing 1st
elsewhere, it's amplifying leaders and should be cut, not tuned.

---

## 7. Recommendation

### Diagnosis (blunt)

The hybrid rebuild is a good ruleset with a sound spine. The power model is right, the
Wild Magic guardrails are right, Complete Mastery placement is right, and secret
allocation over these Trials is a real game. Its weaknesses, in order: **(1)** no
allocation floor — penny-squatting is legal and, at 2p with more Trials, dominant;
**(2)** 2p is thin because domains have too few competing sinks and *all* information
except allocation is public; **(3)** Focused Power is a redundant near-copy of Purity
occupying a Trial slot that could restore the big-spell drama the flat formula removed;
**(4)** Transformation is structurally the inflated currency and TM overpays it. None of
these touch the core mechanic. The earlier instinct to replace allocation with an entry
cap was solving problem (1) with a sledgehammer; the floor solves it with one sentence.

### Smallest viable fix (three sentences of rules, test this first)

1. **Minimum Claim:** a Trial allocation is legal only if its normal power ≥ the Trial's
   1st-place RP (Wild Magic never counts toward this).
2. **2p plays five Trials** (add Focused Power — the current 3p list).
3. **Champion's Mark at 2p:** secretly mark one active Trial; +4 RP if you win it.

Everything else stays exactly as the hybrid document writes it.

### Bolder version (adopt after one confirming test of the above)

Smallest fix, plus: replace Focused Power with **Trial of the Archspell** at every count;
reprice TM and EM to 7 (table in §6); merge the allocation procedure steps (§4); hold the
Transfiguration nerf ("as if one component shorter") in reserve behind an explicit
trigger, not applied.

### Next 2p test (smallest viable fix)

Watch four things: **(a)** does any Trial get won with a floor-minimum allocation (floor
too low / Trial list too long)? **(b)** does either player misread the opponent's
Champion's Mark at least once per game (if never, the Mark isn't moving decisions —
try ×2-RP instead of +4)? **(c)** count each player's entered Trials — healthy range is
2–4 of 5; **(d)** play twice back-to-back with the same players: do round-2 allocations
repeat round-1 (the predictability proxy)?

### Next 5–6p Echo test (hybrid as written + Minimum Claim only)

Watch five things: **(a)** PT sweep check — does a 2-PT Spellbook place 1st in 3+ Trials
(trigger for the half-Transformation nerf in the proposal's own watch-list)? **(b)** the
TM-vs-Purity number gap — if the TM winner's total is routinely >1.5× the Purity winner's,
the pooling inflation is confirmed and TM goes to 7; **(c)** Complete Mastery entrants —
want ≥2 legal entries most games, else its 9 RP is a build lottery; **(d)** 6p 2nd-place
distribution per the failure condition in §6; **(e)** does the UC holder's total RP share
exceed ~1/n consistently (F4 double-pay check).

---

*Verification note: all tables above were computed programmatically (formula values,
marginals, consolidation deltas, reward pools) — worked example in the hybrid document
re-checked and confirmed correct (Maya's totals, domain limits, and Trial sums all
consistent).*
