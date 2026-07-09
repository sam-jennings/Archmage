---
title: 2p Strategic Depth — Deep Dive (full-scope)
type: review-exploration
status: exploration — no decision, nothing to canon
created: 2026-07-09
thread: capacity-economy
extends: _review/2P_STRATEGIC_DEPTH_ARRAY_CONTENTION_2026-07.md
scope_note: >
  Sam widened the scope on 2026-07-09 (same day the original brief was written):
  this exploration is NOT limited to Array contention, and Ascension Trials and
  expansions are explicitly IN scope. The original brief's "Do NOT touch Trials"
  restriction is lifted for this line of work.
---

# 2p Strategic Depth — Deep Dive

The original brief (`2P_STRATEGIC_DEPTH_ARRAY_CONTENTION_2026-07.md`) diagnosed the
Array half of the problem and proposed scaling levers. This document goes underneath
that: why 2p specifically underdelivers, what "exciting and strategic" decomposes
into, and a coherent 2p package that touches the main loop, the endgame, and the
expansion line. Everything here is exploration; the recommendation at the end is a
proposal to model and playtest, not a decision.

---

## 1. First principles: what makes a 2p game exciting and strategic

"Exciting" and "strategic" are doing different work, and the 2p game currently
fails both for different reasons.

**Strategic depth** requires decisions whose value depends on what the opponent
does — otherwise it's parallel optimisation (two people doing puzzles side by side,
comparing scores at the end). Interaction can come from two sources:

- **Contested resources** — my take changes your options (the Array, in theory).
- **Actionable information asymmetry** — I know something you don't, or I can read
  you and *do something with the read* (bluffing, denial, tempo plays).

**Excitement** requires outcome uncertainty that persists late, plus moments of
tension release (reveals, races, near-misses). A game can be deeply strategic and
still flat if the winner is knowable by mid-game.

Great dedicated 2p games (7 Wonders Duel, Targi, Jaipur, Air/Land/Sea) share a
pattern worth naming: **they don't scale a multiplayer market down — they design
the head-to-head market as its own object** (draft structures, I-cut-you-choose,
shared tracks, simultaneous commitment). The base game's interaction is all
*emergent from crowding*, so when crowding disappears at 2p, interaction disappears
with it. That's the structural root, and it's why a pure parameter tweak may not be
enough on its own.

## 2. The four channels, audited at 2p

The base game has exactly four channels through which players touch each other.
Auditing each at 2p:

### 2.1 Array contention — DEAD (diagnosed in the brief)

Worth quantifying, because the collapse is worse than linear. The threat that a
specific coveted Array card disappears before your next turn is roughly
(opponent-actions between your turns) × (chance each action takes *that* card).
Going 4p→2p, opponent-actions drop 3→1 AND the per-action chance drops (one
readable opponent whose Spellbook tells you they *don't* want your card). Call it
a ~5–6× collapse in snipe pressure over a 5-card Array. Base-collection becomes
free and safe; the Transfiguration fast-lane goes dormant (Session 4: zero TFs
built in play at 2p). The brief's levers (Array=3, Living-Array no-refill, neutral
drafter, denial) all attack this channel — still correct.

### 2.2 Information — PERFECT, AND WASTED (the subtle one)

Perfect information is not itself the problem — chess is perfect-information. The
problem is perfect information **with no interaction to spend it on**: you can read
your opponent's whole plan and there is nothing to do about it. Two escapes, and
they're complementary:

1. **Make the read actionable** (denial action, Living Array's first-come denial,
   Spell Duels). This turns 2p's "all focus on the opponent" into a strength.
2. **Re-introduce hidden information** — and here the game holds an unused asset:
   **the hand is already hidden all game and currently worth nothing at scoring.**
   Every other channel is public. Any mechanism that makes hand contents matter at
   the end converts the existing hidden zone into strategic fuel at zero component
   cost. (Developed in §3 — this is the key to the Trials fix.)

### 2.3 The Source clock — ALIVE BUT INVISIBLE

This is the one channel that *doesn't* collapse at 2p, and it's underexploited.
Drought timing is player-controlled (Conjurations burn the Source faster; Array
refills burn it too). At 2p there is a real tempo race hiding here: the player
whose Spellbook is ahead wants the Drought sooner; the player behind wants to slow
it. But the base game gives no legibility (an undifferentiated face-down stack) and
few brakes/accelerators, so the race is imperceptible. Cheap surfacing lever: deal
the Source into 3–4 visible tranches at setup so "how much time is left" is
countable at a glance. This *reinforces* DR-HOOK (the player-burned clock becomes
more visible, not less) and benefits all counts. An accelerant note: the Living
Array's round-start refill and any staleness flush also speed the clock — at 2p
that's a feature (shorter, tenser games) but it must be modelled, not assumed.

### 2.4 Endgame evaluation — PREDICTABLE IN BOTH MODES

- **Standard evaluation** at 2p is a pure points race between two open tableaus —
  the winner is often visible turns before the end. Flat by construction.
- **Ascension Trials** at 2p: the trial contest is a Colonel-Blotto-style
  allocation game, and Blotto is only interesting when the opponent's budgets are
  uncertain or the fields are tight. At 2p, both players' domain totals are
  **public** (open Spellbooks) and only 4 trials are active — so per-trial winners
  are largely determined before allocation happens. Sam's observation ("the winner
  of each trial is quite predictable") is structural, not a tuning issue: secret
  allocation over public budgets with slack fields has near-dominant strategies.

The fix for 2.4 is not "tune the RP table". It's **inject uncertainty into the
budgets** and **tighten the fields**. Which is exactly what the hand asset (§2.2)
and the trial-list bump (03 critique) provide.

## 3. The endgame fix: Veiled Power (new proposal)

**Rule sketch (2p, Trials endgame):** when Spellbooks are finalised, before secret
allocation, each player may secretly set aside up to N cards from their hand
(candidate N=4) as **Veiled Power**. Each veiled card adds +1 power to its energy's
domain (a veiled wild adds +1 to any one domain; declare when revealed). Veiled
cards are revealed together with allocations.

Why this attacks the root causes:

- **Budgets stop being public.** Up to N points of domain power are now invisible,
  which is enough to flip any close trial — so "predictable winners" becomes
  "favourites with real upset risk", the exact texture Trials has at 3–4p where
  build ambiguity does this job naturally.
- **It creates new decisions during play, not just at the end.** Every Drought
  turn's "learn it or hold it" becomes a live tradeoff: cards in the Spellbook are
  public strength, cards in hand are hidden strength. That single tension
  retro-actively deepens the whole Drought at 2p.
- **It leans on the existing hidden zone.** Zero new components, ~30 seconds of
  teach, and it doesn't touch 3–4p unless testing shows they want it too (it's
  count-gated by default as a 2p-mode rule, but nothing about it breaks at higher
  counts — a rare lever that could safely graduate).
- **It softens the end-game consolidation meta.** The Session-4 exploit pattern
  (dump everything into the book, one giant Reshape) currently faces no
  opportunity cost; Veiled Power gives hand cards competing value. It does NOT
  replace the vnext scoring fix — but it pulls in the same direction rather than
  against it.

Tuning knobs: N (2 = subtle, 4 = swingy); whether veiled cards score anything under
standard evaluation (proposal: no — keep it a Trials mechanism); whether sets veil
better than singles (resist — keep it flat and teachable).

**Companion changes from the existing 03 critique, adopted into this package:**

- **2p trial list 4 → 5** (add Focused Power). More fields for the same power =
  thinner spreads = more genuine allocation tradeoffs. Already proposed in 03;
  this package endorses it for the 2p case specifically.
- **Minimum Claim** (allocation must be ≥ trial RP to win it) — prevents 1-power
  walkover wins on trials the opponent skipped, which is a 2p-specific degeneracy
  (with only two allocators, unopposed trials are common).

**Positioning — DECIDED (Sam, 2026-07-09,
`meta/decisions/2026-07-09-2p-trials-not-default.md`):** Trials will be developed
for 2p but is **NOT** the default endgame — some players don't enjoy it; standard
evaluation stays the default. **Veiled Power ships as an optional rule for Trials
tables**, not part of the base 2p mode. Consequence: the base 2p package stands on
the contention layer alone (§4), which therefore carries more weight in testing;
the predictability fix reaches only Trials tables.

## 4. The main-loop fix: contention package (refined from the brief)

The brief's direction stands; refinements from this pass:

1. **Array = 3 at 2p** stays the lead lever (zero teach, count-scaled by
   construction).
2. **Living Array take-rule** (Collection takes don't refill; casting claims still
   self-replace; refill to full at round start) — adopt module A's v2 ruleset as
   the prototype text, scaled to the 3-card 2p Array. At 2p this makes *every*
   Collection take a small denial and gives turn order inside the round real
   meaning. Note the interaction: Array=3 + no-refill can empty the market by
   mid-round; module A's safety valve (empty Array refills at your Collection)
   must come with it.
3. **Neutral drafter — demote to fallback.** With levers 1+2 combined, a phantom
   third collector is probably redundant pressure and pure teach cost (an automa
   rule). Hold it for the case where 1+2 test as insufficient.
4. **Denial action — reframe, don't drop.** Rather than a standing "burn a card"
   action (griefy, always-available), fold denial into the existing structure:
   at 2p, *taking* from the Array is already denial under lever 2. If testing
   shows the read still has nowhere to go, the bounded version is: **once per
   round, when you take from the Array you may take a second card and bury it in
   the Reserve** (cost: your Collection is done; feeds the clock). One decision,
   capped frequency, thematically clean.
5. **Source tranches (legibility lever, from §2.3)** — optional, cheap, hook-
   reinforcing. Worth prototyping in the same sessions since it costs nothing.

## 5. Expansions through the 2p lens (now in scope)

The original brief's ranking survives this pass; what changes is the *role* of two
modules:

- **Living Array**: no longer "expansion to raid for parts" — under this package
  its take-rule is *the* 2p base-mode mechanism (§4.2). Its expansion identity can
  remain for 3–5p as a separate question.
- **Ascension Trials**: promoted from "out of scope" to the centre of the endgame
  fix (§3). The 2p work should be built against the **Hybrid Rebuild** proposal
  (02) since that's the primary AT ruleset — Veiled Power slots into its §7
  procedure as a step 2.5, and the 03 critique's 2p items (trial-list bump,
  Champion's Mark) are the natural companions. If the Hybrid Rebuild changes,
  Veiled Power is insulated: it only touches "domain totals" as an interface.
- **Spell Duels**: the only module offering *bluffing during the main game*. Its
  own docs flag 2p spoils as deliberately muted and 2p snowball as the headline
  risk — so it stays out of the core 2p package, but it is the designated answer
  if post-package feedback says "we want teeth during the game, not just at the
  end". Sequence: package first, Duels-tuned-for-2p as a later experiment.
- **Schools** (asymmetric identities): unchanged verdict — matchup/variety depth,
  not interactive depth. Cheap to add later; not a fix for this problem.
- **Overtones / Conclave / Last Rites / Convergence**: unchanged — wrong tool or
  wrong count.

## 6. The package, named and sequenced

Working name: **Rival's Gambit** (2p mode). Contents:

| Layer | Change | Teach cost | Root cause hit |
|---|---|---|---|
| Collection | Array = 3 at 2p | none | decongestion |
| Collection | Living-Array take rule + safety valve | ~1 min | decongestion + read-actionability |
| Endgame (opt-in Trials) | 2p Trials: 5 trials, Minimum Claim | the AT teach | predictability |
| Endgame (opt-in Trials) | **Veiled Power** (N=4 hand cards, +1 power each) | ~30 sec | perfect information |
| Optional | Once-per-round take-and-bury denial | ~30 sec | read-actionability |
| Optional | Source tranches | none | clock legibility (hook+) |

Hard constraints carried over from the brief, all still satisfied: count-gated
(nothing touches 3–4p), DR-HOOK protected (clock gets *more* visible), teach-load
low for the main loop (the AT teach is the one real cost, hence the `[decide]` on
defaulting).

**Sequencing:** unchanged from the brief — after the vnext-scoring-economy bundle
lands, to avoid confounded playtests. Note one coupling to check when vnext lands:
the candidate score table changes end-game Reshape incentives, which changes how
many cards players *want* to hold in hand, which changes Veiled Power's bite.
Model them together in the rig before the live session.

## 7. Analysis plan (extends the brief's rig plan)

All in `simulation/`, seed 42, alongside the brief's Array-size sweep:

- **Snipe-pressure metric** (from brief) at Array 3/4/5 × {refill, no-refill}:
  probability a wanted card survives to your next turn. Target: drop from ~"very
  high" to the 3–4p band.
- **TF viability flip:** does engine-building (TF/PT fast lane) become EV-positive
  vs pure base collection under Array-3 + no-refill?
- **Clock effect:** Drought arrival time at 2p under the take-rule (round-start
  refills batch Source burn) — confirm the game shortens, quantify by how much.
- **Trials predictability metric (new):** simulate final books, compute per-trial
  win probability under (a) public budgets, (b) budgets ± Veiled Power N=2/4/6.
  Measure: fraction of trials whose winner is >90% determined pre-allocation.
  Baseline (a) is the "predictable" number; find the N that pulls it under ~50%
  without making outcomes feel random (>~25% pure-upset rate is probably too
  swingy).
- **Regression:** Array=5 at 4p unchanged; Veiled Power OFF outside 2p.

## 8. Playtest plan (extends the brief's)

Same two-track discipline (model first; live sessions for experience). Live 2p
watch list, in priority order:

1. Are TFs built and cast in the main phase? (core signal, unchanged)
2. Does Collection feel contested — visible reactions to takes?
3. Trials: did either player express surprise at a trial outcome? Did anyone hold
   cards back during the Drought *because of* Veiled Power? (the two signals that
   §3 worked)
4. Does the AT teach at 2p land inside the comprehension budget (rules-and-teaching
   thread constraint)?
5. Tempo: game still 30–60 min with the faster clock?
6. Feel check on take-and-bury denial if included: clever or spiteful?

## 9. Open questions

- ~~Is Trials-as-default at 2p right?~~ **Decided 2026-07-09: not default** —
  Trials + Veiled Power are the opt-in depth layer; the base 2p mode rests on the
  contention layer (`meta/decisions/2026-07-09-2p-trials-not-default.md`).
- Veiled Power N: 2 / 4 / 6, and flat +1 vs anything spicier.
- Does the take-rule's batched refill move the 2p Drought too early once combined
  with tranche visibility?
- Does Veiled Power belong at 3–4p too (it generalises cleanly) — or does build
  ambiguity already do that job there, making it redundant teach?
- Champion's Mark (03 critique): include in the 2p package or test separately?

## Related items

- `_review/2P_STRATEGIC_DEPTH_ARRAY_CONTENTION_2026-07.md` — the original brief
  (Array-contention half; scope note updated 2026-07-09).
- `_review/ASCENSION_TRIALS_02_HYBRID_REBUILD_PROPOSAL_2026-07-06.md` + 03 critique
  — the AT baseline this package builds on.
- `expansion/Expansion Concepts - Player Interaction.md` — module A (Living Array)
  ruleset text.
- capacity-economy thread; QUEUE P2 "2p strategic depth" (updated to point here).
- Constraint: DR-HOOK (`meta/decisions/2026-07-06-protect-the-hook.md`).
