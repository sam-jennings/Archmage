---
title: Expansion Readiness Review — which concept to develop next
type: review
updated: 2026-11-13
status: draft
relates_to:
  - "[[EXPANSION_AUDIT_2026-07]]"
  - "[[EXPANSION_INDEX]]"
---

# Expansion Readiness Review — 2026-11-13

**Purpose.** Sam will go through the expansion concepts one at a time with Arcane and pick one to
develop. This review asks one question of each: **how suitable is it to start further development
now** (November 2026: Stage 3, rulebook v3.1 under test, one printed set, F14 export hold)?
Analysis only. No rules, expansion docs or decisions were changed.

The July audit (`_review/EXPANSION_AUDIT_2026-07.md`) scored *long-term potential*. This review
scores *readiness now*, so the two sets of numbers are not comparable. Claims from the audit were
re-checked against the current files. Where they differ, this review says so.

**Heads-up (one line, per process §6):** expansion work is Stage 4+ in the QUEUE Deferred
section, and the v3.1 confirm/kill session is still the open P1. Paper and sim work on an
expansion can go ahead anyway. Live expansion tests should come after a clean confirm/kill.

---

## How everything is scored (same criteria for all)

Five criteria, each scored 0–2. Total out of 10.

| Criterion | 2 | 1 | 0 |
|---|---|---|---|
| **A. Independence** from unsettled base rules (v3.1 scores and counters, Echo / 5–6p, proposed timing or 2p decisions) | No real contact | Some contact that a small paper fix handles | Built on something unsettled |
| **B. Maturity** | Full ruleset, iterated, with a test plan or model | Full ruleset, untested or stale | Sketch only |
| **C. Cost to test** with what Sam has (one printed set, paper aids allowed under F14, the counts he actually plays) | Paper aids, any count he can gather | Extra sim, more sessions, or awkward counts | New deck, many sessions, or a different discipline |
| **D. Fit** with the core experience (building spells, the Spellbook growing, the Drought ending) | Deepens it | Sits next to it | Adds a separate game on top |
| **E. What it teaches** about the base game or the product now | Answers an open base-game question | Some spill-over | Little |

**Readiness ratings:**
- **Ready now:** the smallest next step stays valid whichever way v3.1 goes, and a live test could follow right after the confirm/kill.
- **Ready after v3.1:** the useful next work depends on how v3.1 ends (scores, Reshape cost, Enchantment ladder), so starting now risks rework.
- **Not yet:** it needs more than v3.1: other base decisions, a missing ruleset, a different audience, or a production pipeline.

**Applies to all concepts:**
- **Printing:** F14 forbids export regeneration and new print runs. It *allows* temporary paper inserts and clearly labelled test aids, so every concept here can be tested with home-printed paper cards. The one printed set (5×20 + 4 Print & Bind) is shared, so two expansion tests can never run at two tables at once.
- **Online:** the Screentop table (`@samjennings/Arcane-Drought`) is live for the base game. Any expansion would need its own assets added there. Tabletopia is on hold.
- **Live evidence:** no session log in `playtests/` (sessions 01–04) mentions any expansion, Ascension Trials included. Every rating below is a paper judgement.

---

## 1. Ascension Trials

1. **What it is:** an advanced way to end the game. Instead of simply adding up spell scores, players secretly split their Spellbook's "power" across a set of public Trials (contests such as most Transfiguration power), and the Trials award the points. Your build becomes a bluffing position.
2. **Where it stands:** the only expansion Sam has locked in. Rules in `rulebook/Ascension Trials.md` (v2.8, "working-draft, under reconciliation", last edited 2026-07-06). Deepest analysis in the line: Python model package plus Kiro specs (VS1–VS3 done, VS4 stop-for-review), 2p exact screening and seeded 3–6p simulation, candidate shortlist (C1 "Coherent Claim" recommended, C4 the follow-up) dated 2026-07-11. F8 has 9 open propagation items. D-AT2 (PT double-count) and D-AT3 (reward tuning) are still open. **PARKED by Sam on 2026-11-13** until v3.1 is confirmed or rolled back. No logged live session (the audit's "table contact" could not be found in `playtests/`).
3. **Fit:** sits next to the core loop. It keeps building spells and the Drought as they are and changes what the final count means. A heavy teach for a light base game.
4. **Dependencies and risks:** high. It reads the score table, the Enchantment powers and the spell-type mix, and v3.1 changes all three. A v3.1 rollback would change Trials inputs again. The candidate numbers would need re-screening either way. 2p is "developed but not the default" (decision 2026-07-09).
5. **Cost:** paper sheets only. Sims exist but need re-running on the final table. Live tests are needed at 2p and at 5–6p with Echo (the F5 worst case). The 5–6p group is the scarce one.
6. **What it would teach:** whether hidden-information scoring adds the depth the Session-4 player asked for, and whether 5–6p endings feel fair (F5 watch).
7. **Readiness: Ready after v3.1, 5/10** (A0 B2 C1 D1 E1). The most developed concept, but parked by Sam's explicit decision and fed by the scores under test.
8. **Smallest next step if picked:** after the v3.1 outcome, re-run the Stage-3/4 screening of C1 and C4 on the final score table, then pay down the F8 propagation list before any live session.

## 2. Spell Duels

1. **What it is:** optional head-to-head clashes. After casting, you may challenge a neighbour. Each of you plays a card face-down, the higher number wins, and the winner may take a committed card. Five cumulative tiers, from a bare card-poker clash (Tier 1) to a heavy "Resonance War" (Tier 5), so testing can find the right weight.
2. **Where it stands:** "shelf-ready-untested" (`expansion/spell-duels/`, reconciled 2026-07-02 from three source documents). 10 contradictions ruled, 7 open questions logged, every tier has a watch list. No sim, no session plan, no playtest.
3. **Fit:** sits next to the core loop. Tiers 1–2 never touch built spells or capacity, but they add a separate bluffing contest on top. The QUEUE Deferred list still holds "steal-cards or conflict mechanics: scope addition without evidence the core loop works", and Session 4 asked for strategy, not conflict.
4. **Dependencies and risks:** Tiers 1–2 are low (dueling costs no counter, and spoils go to the Arcane Reserve, which slightly lengthens the Drought). Tier 3's Transmute grants a free Learn/Empower and touches the counter economy (open question Q2). The design is neighbour-only and expected to be thin at 2p. A v3.1 rollback would not break Tiers 1–2.
5. **Cost:** Tier 1 needs only Warded tokens. Needs 3+ players to mean anything, ideally 3–4. One or two sessions per tier.
6. **What it would teach:** whether direct interaction improves this game. The Living Array (§10) asks the same question more cheaply.
7. **Readiness: Ready now (Tiers 1–2), 6/10** (A2 B2 C1 D0 E1). Well built and independent, but nobody has asked for it and it needs 3+ players.
8. **Smallest next step if picked:** write a Tier-1 session plan in the standard format (like the Schools/Last Rites templates) to sit ready for a 3–4p table that asks for more interaction.

## 3. The Schools

1. **What it is:** asymmetric wizard identities. At setup each player picks one School card from a public market. It gives one always-on Talent (for example "your 3-card Transfigurations exchange discard-1-take-1") and one small end-of-game Lean (for example "+1 point per Transfiguration"). One card per player, the lightest teach in the line.
2. **Where it stands:** v0.1 (`expansion/schools-and-last-rites/`, created 2026-07-02, status line 2026-07-16). 8 Schools, 9 bugs fixed on paper. A playtest-plan template exists (`Playtest Plans - Schools & Last Rites (templates).md`), gated on the counter fix. No sim, no playtest.
3. **Fit:** deepens the core. Talents change *how* you build and cast spells from turn one. No new subsystem.
4. **Dependencies and risks:** design rule 1 keeps talents away from counters. Three real contact points found in this review:
   - **The Lucent Order** (wilds may change value once on Reshape or Empower) clashes with the 2026-11-13 flexible-wilds decision. Wilds now declare only a number, only in sequences, are re-declared when a spell is rebuilt, and are not re-declared on Empower. The talent needs rewriting.
   - **The Ashbinders** (cheaper 3-card Transfiguration exchange, plus +1 per Transfiguration) pushes on Transfiguration viability, which is a v3.1 confirm criterion.
   - **The Leans** are flat points tuned before v3.1 (iteration-log B9: "don't balance finely until the table is frozen").

   A v3.1 rollback would not break the module. Only the Lean numbers would move.
5. **Cost:** 8 paper cards. Works at 2–6p. One session per count to start.
6. **What it would teach:** whether asymmetric starts stretch the four spell types evenly (a direct read on Transfiguration and Conjuration balance). It also gives returning testers a reason to replay the base game, which helps the "≥1 logged session per month" goal.
7. **Readiness: Ready now, 9/10** (A1 B2 C2 D2 E2). Cheapest live test in the line. Needs a short paper refresh before printing, and must not ride along on the confirm/kill session.
8. **Smallest next step if picked:** a paper refresh of the 8 cards against the current rulebook and canon (rewrite the Lucent Order for flexible wilds, re-check Ashbinders/Menders wording against v3.1 Transfiguration and Unlearn), then print paper cards for the first post-confirm/kill casual session.

## 4. The Last Rites

1. **What it is:** turns the Drought into a third act. Eight public Rite cards sit beside the Source all game but can only be performed once the Source is empty. Each costs components that are removed from the game, so the endgame becomes a choice between stripping your Spellbook for Rites and holding your patterns for the final count.
2. **Where it stands:** v0.1 (same folder as Schools, created 2026-07-02). 9 bugs fixed on paper and a playtest-plan template. No sim, no playtest.
3. **Fit:** deepens the core, in the exact place the logs show is weakest. Session 1: the Drought "stalled into take cards one at a time". Session 4: the Drought was mainly used for a last-turn giant Reshape.
4. **Dependencies and risks:** low to medium.
   - No counter contact (design rule 1). Costs are banished, so the Released Reserve clock is untouched.
   - It follows the current immediate game end (F5, proposed but keeping the current rule).
   - **Rite of the Final Pattern** (a spell scores as one size larger) is worth far more in v3.1 at the top of the table. Conjuration 14→15 is +21 points (v3.0: +12). That risks reopening the end-game concentration play v3.1 is trying to control.
   - Sundering's "+3" sits on a v3.1 table where a 3-card Conjuration scores 0.
   - Some of the observed "flat Drought" was caused by the old uncapped 4-card Enchantment and unbounded Reshape, both of which v3.1 changes. After v3.1, the demand signal may be smaller.
   - A rollback would not break the module, only the point values.
5. **Cost:** 8 paper cards plus about 18 markers (coins work). Works at 2–6p. The open question is whether 2p Droughts are long enough for 2 Rites each.
6. **What it would teach:** how long and how alive the Drought really is per player count. The base game needs that data anyway (F5 seat-order watch, Session 1 and 4 notes).
7. **Readiness: Ready now, 9/10** (A1 B2 C2 D2 E2). The most independent of the v3.1 systems and aimed at an observed weakness. Its live read is cleanest after v3.1 settles the Reshape exploit.
8. **Smallest next step if picked:** a desk check before any card is printed. Count Drought turns per player from the four session logs and the 2p clock model, check whether a 2-Rite cap is reachable, and re-price Final Pattern and Sundering against the v3.1 table.

## 5. Rituals & Mastery Seals

1. **What it is:** earned identity. Six public Rituals describe structures (for example "a spell of 7+ components"). Hold one in your Spellbook and you get a Seal: a small permanent rule bend that lasts only while that structure stands. Seals never score.
2. **Where it stands:** v0.1 (`expansion/rituals-and-seals/`, 2026-07-16). 8 bugs fixed on paper. 6 of 8 Rituals written, 2 parked "pending v3.1 wording". No test plan, sim or playtest.
3. **Fit:** deepens the core. It rewards holding a Spellbook shape and is the only module aimed at the Learning phase.
4. **Dependencies and risks:** high.
   - The **Seal of Magnitude** moves a component between two spells as a Reshape. In v3.1, Reshape breaks spells down at one counter per spell, so the wording no longer fits (the doc flags this).
   - The module's central bet is that holding structure is a real cost. That depends on how often players restructure, and v3.1's per-spell Reshape cost directly changes that.
   - The Inward Turn is keyed to Enchantments, whose ladder is under test.
   - Under a rollback, the Reshape wording would need re-checking again.
5. **Cost:** paper chits. Works at 2–6p. Needs enough sessions to see Seals going dormant.
6. **What it would teach:** how often real Spellbooks restructure, which is useful for judging v3.1's Reshape change.
7. **Readiness: Ready after v3.1, 6/10** (A0 B1 C2 D2 E1). Cheap, but its core tension is the behaviour v3.1 is changing.
8. **Smallest next step if picked:** after v3.1, re-word Magnitude and the two parked Rituals against the final Reshape and PT rules, then check from session logs how often spells actually get rebuilt.

## 6. Foci & Conduits

1. **What it is:** an engine-builder layer. Eight unique Focus cards sit in a public row. Big spells can turn their bonus draws into Essence tokens, and Essence buys a Focus that attaches to one of your spells and improves what it does when cast. Tier 2 adds Conduits, where casting spell A echoes a weaker effect from spell B.
2. **Where it stands:** v0.1 (`expansion/foci-and-conduits/`, 2026-07-16, revised the same day to add the Essence layer). 12 bugs fixed on paper. QUEUE has a P2 `[decide]` review item. No sim, no playtest.
3. **Fit:** deepens the core. It works on the Casting phase and the Spellbook as an engine, with no extra scoring.
4. **Dependencies and risks:** high.
   - It works through the economy: conversion of cast draws, forge costs of 2/3/4, the 5+ tap gate and the clock (turns to Drought) are all untested numbers.
   - The **Still Flame** lets an Enchantment be cast by placing a counter, which touches the counter loop.
   - The doc itself says to test it after v3.1.
   - Runaway engines are the genre risk.
5. **Cost:** 8 paper cards plus about 24 tokens. The heaviest teach of the new modules. A clock sim is needed first (turns to Drought with and without the module), then several sessions.
6. **What it would teach:** whether the hobby engine-builder appetite fits this game. That is product strategy more than base-loop learning.
7. **Readiness: Ready after v3.1, 5/10** (A0 B1 C1 D2 E1). Strongest commercial depth answer on paper, but most of its numbers sit on the economy under test.
8. **Smallest next step if picked:** a small clock and Essence spreadsheet (like the Schism workbook) on the v3.1 draw rates, to check turns-to-first-Focus and the Drought timing change before writing a session plan.

## 7. The Null Cabal

1. **What it is:** a hidden traitor for 3–6 players. One player is secretly the Cabalist with a hidden goal. Three times a game, everyone secretly gives up a card into a shared "Veil", and the table works out from the sums who is sabotaging. One vote at Drought start decides whether the Cabalist is caught.
2. **Where it stands:** v0.1 (`expansion/null-cabal/`, 2026-07-16). 9 bugs fixed, including a fully specified 3p model. No sim, no playtest.
3. **Fit:** adds a separate game. Building and the Drought are unchanged, but the evening becomes social deduction, which is a different mood from the chill, social game testers have described.
4. **Dependencies and risks:** low rules contact. Agendas 5–6 use point caps and gaps ("top two within 2 points") that depend on the score table, and Veil banishing slightly shortens the Drought pool. The main risk is the audience: no tester has asked for this. A rollback would only move thresholds.
5. **Cost:** cheap paper (roles, agendas, vote tokens). Needs 3–6 players and several sessions to judge the conviction rate (target about 50–60%).
6. **What it would teach:** little about the base loop.
7. **Readiness: Not yet, 3/10** (A1 B1 C1 D0 E0). Distinctive, but it serves an audience the game doesn't yet have and needs groups Sam can't easily gather.
8. **Smallest next step if picked:** a scratch simulation of Veil sums to check whether arithmetic deduction beats chance at 3p, before any table time.

## 8. The Overtones

1. **What it is:** a prestige race. A public rack of extra-high components (values 16–20) that can't be drawn, only claimed by meeting public conditions (for example "cast a 6+ Conjuration"). Spells holding two or more of them score on a new "Masterwork" tier.
2. **Where it stands:** sketch only (Direction 1 in `expansion/future-directions/Expansion Directions - Post-Echo Exploration.md`, 2026-07-02). No ruleset.
3. **Fit:** deepens the core. It is about spells, patterns and aspiration during play.
4. **Dependencies and risks:** blocking. It is built out of the score table (a new scoring tier and new pattern values) and can't be tuned until that table is frozen, which is more than v3.1 confirming. It must also respect F6's 15-component size cap. A rollback changes everything it would be priced against.
5. **Cost:** the printed Print & Bind deck already physically holds values 16–20 in five energies, so prototyping parts is unusually cheap. Design and score-rebalance work is heavy, and it is the heaviest teach in the line.
6. **What it would teach:** how the top of the score table holds up under pressure.
7. **Readiness: Not yet, 4/10** (A0 B0 C1 D2 E1). High ceiling, hard-blocked on a frozen score table.
8. **Smallest next step if picked:** nothing useful before the table freezes. After that, a one-page claim-condition and Masterwork-tier draft priced with the existing scoring sim.

## 9. Co-op & solo concept, "Direction 4" (naming issue)

**Naming:** the concept's working title is "The Convergence", which is a **retired term** in `meta/canon.yml` (the old fifth-energy name). The site hub already labels it "Co-op & solo concept (Direction 4)", and a P3 `[decide]` in QUEUE asks whether to rename it. This review uses the direction label.

1. **What it is:** a co-operative mode where the dying Source is the opponent. A deck of demand cards asks the table to build certain patterns (for example "any Perfect Transmutation") before deadlines measured in Source depth, or everyone loses. Planned for 1–6 players.
2. **Where it stands:** sketch only (Direction 4 in the Post-Echo doc). Salvage notes in `expansion/old-expansion-thread-review.md` list two base prerequisites: a formal Round definition and Source-depth markers. Solo has since been given to the base-box Attuned Rival (§13, decision 2026-07-19). This direction now owns co-op only.
3. **Fit:** sits next to the core loop. It keeps the pattern language and the dying Source, but co-op is a different mode of play.
4. **Dependencies and risks:** demands written in pattern language survive any score table. The co-op endgame (a pooled Trials variant) inherits Trials' open questions. It is also the planned second home for the Cabal.
5. **Cost:** a new deck plus difficulty curves for every count from 1 to 6. The audit estimates about 10× the tuning sessions, and it is a different discipline from fairness balancing.
6. **What it would teach:** little about the competitive base loop.
7. **Readiness: Not yet, 2/10** (A1 B0 C0 D1 E0). The right idea for audience reach, but no ruleset, high cost and a name that needs fixing.
8. **Smallest next step if picked:** decide the name (P3 item). Then write a one-page demand-card sketch with 10 sample demands to see whether the pattern language reads as "the world's demands".

## 10. The Living Array

1. **What it is:** a single rule change. When you take a card from the Array in Collection, the gap is not refilled until the start of the next round, so the shared market thins out and players compete for what they can see. Cards taken by casting a spell still refill at once.
2. **Where it stands:** a full v2 ruleset in `expansion/Expansion Concepts - Player Interaction.md` (2026-06-04, untouched since). It is stale: written for 2–7p with a 7-card Array at 5–7p, while the current game is 2–6p with Echo at 5–6p. Its take-rule has since been absorbed into the proposed base-side 2p package "Rival's Gambit" (Array of 3 at 2p plus this take-rule, in `_review/2P_STRATEGIC_DEPTH_DEEP_DIVE_2026-07.md`). That package is not in the rulebook.
3. **Fit:** deepens the core. It changes only how Collection feels and keeps spell building untouched.
4. **Dependencies and risks:** no score or counter contact, and the clock is preserved by design. It does overlap two unsettled base-side proposals that also change the Collection take: Array Attunement (proposed 2026-07-17, planned for the second half of, or right after, the confirm/kill) and Rival's Gambit at 2p. Testing all three together would confound them. Residual risk from the doc: pressure on Transfiguration players, who rely on specific values.
5. **Cost:** zero components. Works on the live Screentop table as-is. One session at 3–5p (the doc's sweet spot) gives a first read.
6. **What it would teach:** the cheapest possible answer to "does more interaction make this game better or just noisier?" It also bears on the open 2p contention problem and the "interaction scales with player count" observation from Session 4.
7. **Readiness: Ready now, 8/10** (A1 B1 C2 D2 E2). High as a test tool, thin as a product (no components to sell), which is why §12 recommends reclassifying it.
8. **Smallest next step if picked:** a half-page reconciliation to 2–6p (Array sizes per count, interaction with Attunement and Rival's Gambit spelled out), then run it as a one-variable variant after the confirm/kill and Attunement reads.

## 11. The Conclave

1. **What it is:** a political big-box. Players make binding Pacts to trade components and favours, earn Influence by keeping them, and secretly bid Influence at "Conclave" moments to enact temporary rule changes (Edicts). Hidden Agendas keep the leader hard to identify.
2. **Where it stands:** a full v1 ruleset in the Player Interaction doc (2026-06-04, untouched since). Stale on player counts (3–7p). A standing ruling says that if the Cabal exists, it replaces the Conclave's agenda deck.
3. **Fit:** adds a separate game. Negotiation becomes the centre of the evening.
4. **Dependencies and risks:** Edicts change draws, exchanges and Array refills, and Agendas award points, so it has contact with the economy and the score table. Kingmaking, collusion and table-talk downtime are acknowledged in the doc. It is the furthest concept from the game's current identity.
5. **Cost:** the most components in the line (Agendas, Influence, Pacts, Edicts, dividers). Needs 3+ players and negotiation-loving groups.
6. **What it would teach:** little about the base loop.
7. **Readiness: Not yet, 2/10** (A1 B1 C0 D0 E0). A destination, not a next step.
8. **Smallest next step if picked:** none recommended. If Sam wants it kept warm, a count reconciliation (3–6p) is the only cheap upkeep.

## 12. The Schism (2-player box)

1. **What it is:** a dedicated 2-player expansion that replaces Collection with cut-and-choose. Each round 4 Source cards are revealed. One goes to the Arcane Reserve (the Tithe), one player splits the other 3 into two unequal shares, and the other picks one. Whoever takes fewer cards gets the Severance token, which means choosing next round and going first.
2. **Where it stands:** v0.1 (`expansion/the-schism/`, 2026-07-17/18). 14 bugs fixed including four rounds of Sam's own review. A deterministic clock workbook (`Schism Clock Model.xlsx`) estimates a main game of ~6.5 rounds (base ~8.4) and a Drought share of ~41% (base ~29%). The workbook is arithmetic, not simulation, and its assumptions are not yet checked against real 2p logs. QUEUE has a P2 `[decide]` review item. No playtest.
3. **Fit:** sits next to the core loop. It keeps building and makes the Drought bigger and contested (good), but the model predicts ~23% fewer Casting phases, which could leave Spellbooks underdeveloped. That is the headline risk to "the Spellbook growing".
4. **Dependencies and risks:** it doesn't touch scores or counters, but it is built on three unsettled things:
   - the base-side Rival's Gambit layer (Array of 3 at 2p), which is not in the rulebook;
   - the proposed source-emptying timing rule;
   - Transfiguration health at 2p, which is a v3.1 confirm question.

   A rollback would not break the rules, but cast-burn rates (and so the clock numbers) shift with whatever economy lands.
5. **Cost:** 1 token plus an optional mat. 2p, the count Sam plays most. Needs the workbook's cast-burn assumptions spot-checked against real 2p logs first (Sessions 1 and 4).
6. **What it would teach:** a lot about 2p, including Array contention, Drought length and whether Transfiguration survives at 2p, all of which are open base-game questions.
7. **Readiness: Ready after v3.1, 7/10** (A0 B2 C2 D1 E2). Well modelled and cheap at Sam's most available count, but it sits on a 2p base layer that is not decided yet.
8. **Smallest next step if picked:** check the workbook's cast-burn and Transfiguration-discard assumptions against the Session 1 and 4 logs (pure desk work). That tells you whether the 6.5-round main game is real before anything else.

## 13. Solo mode: The Attuned Rival

1. **What it is:** a solo opponent run by fixed rules, with no new cards. The Rival takes one energy suit as its own deck. Each turn it flips a card (keeping it if it fits its row), buries one Array card you might want (wilds first), and burns a Source card. You race it to the Drought. Its row is scored with the normal table.
2. **Where it stands:** v0.1 draft (`expansion/solo-attuned-rival/`, 2026-07-19). The direction is decided (canon, 2026-07-19): this is a **base-box feature**, not an expansion. Numbers are provisional and tuning is gated on v3.1. A sim-first test plan with confirm/kill criteria is written. No sim run yet, no session.
3. **Fit:** deepens the core. It is the base game's race, Spellbook and Drought with one seat automated, and the pace of the Drought becomes the main decision.
4. **Dependencies and risks:** the doc states that a v3.0 rollback leaves the rules intact and only the example scores and difficulty multipliers need re-deriving. The §7 wild-declaration line should be re-read against the 2026-11-13 flexible-wilds rule (it is a sequence-number declaration, so it is probably compatible). The doc flags a "decoy largest spell" exploit as an open question.
5. **Cost:** one reference card on paper. Sam can test it alone, with no recruiting. Stage 1 is a scratch sim (about an afternoon per the doc).
6. **What it would teach:** it lets Sam play real base-game sessions on his own schedule. It also shows what final Spellbook scores look like under v3.1, which is useful data for the confirm/kill and for the "≥1 logged session per month" goal (if solo sessions count, which is Sam's call).
7. **Readiness: Ready now, 8/10** (A1 B1 C2 D2 E2). The only concept Sam can develop and test without other players. Strictly a base-box feature rather than an expansion pick.
8. **Smallest next step if picked:** the doc's Stage 1 sim, a scratch script in `simulation/` covering keep rate, rejects per game and Rival score by game length, with ±1 and ±2 adjacency.

---

## Not reviewed as expansions

- **Echo (5–6p):** an *extension* of the base game by decision F10, not an expansion. It has its own P1 (live 5p validation).
- **Array Attunement:** a proposed base-side variant on the v3.1 track (decision 2026-07-17), not an expansion.
- **Rival's Gambit:** a proposed base-side 2p package in `_review/`, not an expansion.

---

## Summary table

| # | Concept | Rating | Score | One-line reason |
|---|---|---|---|---|
| 4 | The Last Rites | Ready now | **9** | Targets the observed flat Drought, little v3.1 contact; re-price Final Pattern first |
| 3 | The Schools | Ready now | **9** | Cheapest live test at any count; Lucent Order needs a flexible-wilds rewrite |
| 13 | Solo: The Attuned Rival | Ready now | **8** | Testable alone, survives a rollback; a base-box feature, not an expansion |
| 10 | The Living Array | Ready now | **8** | Zero-component interaction test; product too thin (see below) |
| 12 | The Schism (2p) | Ready after v3.1 | **7** | Well modelled at Sam's main count; sits on an undecided 2p base layer |
| 2 | Spell Duels | Ready now (T1–2) | **6** | Independent and well built; no demand signal, needs 3+ players |
| 5 | Rituals & Mastery Seals | Ready after v3.1 | **6** | Cheap, but its core bet depends on v3.1's Reshape change |
| 1 | Ascension Trials | Ready after v3.1 | **5** | Most developed, but parked by Sam and fed by the scores under test |
| 6 | Foci & Conduits | Ready after v3.1 | **5** | Its economy numbers (Essence, forge costs, clock) need a stable economy |
| 8 | The Overtones | Not yet | **4** | Built out of the score table; blocked until the table freezes |
| 7 | The Null Cabal | Not yet | **3** | Different audience and mood, needs 3–6p groups |
| 9 | Co-op concept (Direction 4) | Not yet | **2** | Sketch only, costly difficulty tuning, retired-term name |
| 11 | The Conclave | Not yet | **2** | Furthest from the game's identity, heaviest component load |

## Recommended order (for Sam's one-at-a-time review)

1. **The Last Rites.** The best expansion pick if the aim is to improve the game Sam already has. Its first step (a Drought-length and re-pricing desk check) is useful even if he picks something else.
2. **The Schools.** Pick this instead if the aim is the cheapest live expansion session and more reasons for testers to replay. Do the paper refresh first.
3. **The Attuned Rival.** Not an expansion, but if Sam's real constraint is finding players, this is the most useful thing to develop now. Review it third so it isn't mistaken for an expansion choice.
4. **The Schism.** The best 2p option once the 2p base layer is decided. Its desk check against session logs can happen any time.
5. **Rituals & Seals, then Foci & Conduits.** The depth answers. Revisit when v3.1 has a verdict.
6. **Ascension Trials.** Resumes automatically under its own thread when v3.1 settles. No pick needed.
7. **Spell Duels.** Keep the Tier-1 plan on the shelf for a table that asks for teeth.
8. **Overtones, Null Cabal, co-op (Direction 4), Conclave.** Shelf. No development recommended now.

Rites and Schools are tied on score. Rites comes first because it attacks a weakness seen in two session logs and its next step needs no printing. Schools has two cards that must be rewritten before its first print.

## Living Array: variant or expansion? (recommendation, not a decision)

**Recommend treating the Living Array as a free base-game variant and test tool, not as an entry in the expansion line.** The reasons:
- It has no components to sell.
- Its take-rule already lives inside the proposed base-side 2p package (Rival's Gambit).
- The 2p decision (2026-07-17) already rules that 2p *health* fixes stay free and base-side.
- Its real value is as an instrument: one cheap session that answers whether more interaction helps. That answer would tell Sam whether Spell Duels, the Cabal or the Conclave are worth pursuing at all.

If Sam agrees, the follow-on work would be:
- move its home to the capacity-economy / 2p-contention work;
- reconcile it to 2–6p;
- schedule it as a one-variable variant after the confirm/kill and Array Attunement reads, never in the same session as Attunement;
- update the expansion count in `EXPANSION_INDEX.md`.

None of this has been done. It is Sam's call.

---

## What was checked, and what wasn't

**Checked (read in this session):**
- `meta/process.md`, `meta/canon.yml`, `meta/manifest.yml`, the QUEUE expansion and Deferred items, and the `expansions` and `ascension-trials` thread files.
- The July audit, `EXPANSION_INDEX.md`, and the full v0.1 docs for Schools, Last Rites, Rituals & Seals, Foci & Conduits, Null Cabal, Schism and Attuned Rival.
- Post-Echo directions 1–4, the Player Interaction doc (Living Array and Conclave in full), and Spell Duels Part 1 plus Tier 1.
- Decisions: F14, F5, F10, source-emptying timing, expansion status reset, Array Attunement, flexible wilds, solo direction and Schism 2p.
- From the rulebook: the Array, Transfiguration exchange, RESHAPE, UNLEARN and Drought sections.
- The v3.1 and archived v3.0 score tables.
- Front-matter goal/verdict of all four session logs, plus their Drought notes.
- Git last-touch for each folder. Every `expansion/` subfolder was last moved on 2026-11-13 by the "Reorganise expansions into per-expansion folders" commit. Content dates above come from file front-matter and modification times.

**Not verified:**
- Spell Duels Tiers 2–5 were skimmed through the tier table only.
- The 2p deep-dive and Array-contention reviews, the old expansion thread and the Trials design-history docs were not read in full. Their content is taken from thread and QUEUE summaries.
- The Schism workbook's formulas were not opened. Its numbers come from the module doc.
- No simulation was run for any concept.
- The audit's claim that Trials has "table contact" could not be matched to any logged session.
- The "flat ending is table-observed" claim is supported only by the Session 1 and Session 4 notes above, both played under pre-v3.1 rules.
- Whether solo sessions count toward the monthly playtest key result is Sam's call.
- The 0–2 criterion scores are judgement calls. Two people could reasonably differ by one point on any of them.
