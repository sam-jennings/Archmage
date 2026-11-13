---
title: Expansion B - Spell Duels (Bold Effect Directions)
type: design-exploration
status: ideas-stage
created: 2026-06-08
relates_to:
  - "[[Expansion B - Spell Duels Alternative (Resonance Gambits)]]"
  - "[[Expansion B - Spell Duels (Deep Dive)]]"
  - "[[Archmage Ascension - Complete Rulebook]]"
---

# Spell Duels — Bold Effect Directions

The chassis for duels is settled and good: a **frequency clash** (higher wins, defender wins ties), **neighbour-only** targeting, **Yield / Answer** with committed-card spoils, **Warded** to stop focus-fire, and **off in the Drought**. What's still wide open — and worth being bold about at this stage — is the question underneath all of it:

> **When you win a resonance clash, what actually happens?**

The Resonance Gambits effects (draw, discard, swap the Array, echo) are safe and clean, but they're mild resource-churn — the kind of thing you'd find in any card game. This document throws out three *genuinely different* answers, each with its own personality, then compares them. They all keep the chassis above and the hard-won guardrails below; only the effects change.

### Guardrails every direction respects

- **Never attack capacity** (the counter economy is still being repaired — don't lean on it).
- **Never destroy a built spell** (planning must stay safe from turn-to-turn volatility).
- **No hidden-hand theft** (any card that changes hands was committed to the duel).
- **Frequency stays the power signal** (higher cards win, and the win's *size* scales with frequency).
- **Watch the Source clock** (most effects shouldn't quietly speed the Drought).

For frequency scaling throughout, "band" means the lower / middle / upper third of the deck's value range (1–5 / 6–10 / 11–15 in the 2–4p deck; 1–7 / 8–14 / 15–20 in the 5–7p deck).

---

# Direction 1 — Elemental Powers
### Keep the four energy forms, but make each a dramatic signature spell

This is the boldest *evolution* of what you have: the four energies stay as duel "forms," but their effects stop being chip damage and become memorable wizard powers — scrying, annihilation, transmutation, mimicry. Each is mechanically distinct, deeply on-theme, and scales with the frequency of your winning card.

| Form (energy) | Win effect (scales Low / Mid / High) | Yield (attacker, no clash) | Parry win (defender) |
|---|---|---|---|
| **Illuminate** (Radiance) | Scry the top **2 / 3 / 4** of the Source; take 1 into hand; return the rest **in any order**. | Scry 2, take 1. | Defender scries 2, takes 1. |
| **Devour** (Void) | The loser **banishes 1 component of their choice from hand — removed from the game** (not to the Reserve). High band: also banish the top card of the Source. | Loser banishes 1 of their choice. | Attacker banishes 1 of their own choice. |
| **Transmute** (Flux) | Immediately take a free **Learn or Empower**, and you may treat up to **1 / 2 / 3** of the components involved as **±1 value** for that action. | Free Empower; one component ±1. | Defender takes a free Empower; one component ±1. |
| **Resonate** (Aether) | **Copy the cast-effect of one of the loser's spells**, once, as if you cast it (you supply any costs). High band: copy any size; Low: a 3-card spell. | Copy a 3-card spell's effect. | Defender copies one of their own spells' effects. |

**Why each is bold and good:**

- **Illuminate** turns "draw 1" into a true seer's power: you see the future, take the best card, *and reorder what your neighbour draws next*. That last part is real interaction with no feel-bad — you can bury a card you know they need.
- **Devour** is the take-that teeth of the set. "Removed from the game" hits very differently from "discard to the Reserve": it's permanent, it's thematic (Void = oblivion), and it has a subtle long-game dimension — banished cards never join the Released Reserve, so a Void duellist quietly shapes the endgame. The loser always picks *which* card, which keeps the sting fair.
- **Transmute** is the most on-theme power in the game: you literally retune frequencies to complete a sequence or a match. Winning a clash converts straight into building progress, with a ±1 nudge that turns near-misses into finished spells. It's a builder's haymaker.
- **Resonate** lets you channel a rival's own mastery — copy their big Conjuration's draw, or their Transfiguration's exchange — without taking or harming anything. It rewards sitting next to a strong wizard and is a natural catch-up valve (the trailing player can leech the leader's engine).

**Conflict balance:** the clash itself is the conflict (you commit cards, risk spoils, out-resonate a neighbour). Beyond that, the forms range from pure self-buff (Transmute, Resonate) through interaction (Illuminate) to genuine take-that (Devour) — so the *flavour* of aggression is a choice the attacker makes each time, which is more interesting than every duel feeling the same.

**Risks → fixes:**

- *Transmute/Resonate help the winner build → snowball.* Bounded (one action, ±1, one copy), they cost a high card to win, and Resonate specifically aids whoever sits by the leader (catch-up). Watch in 2p; the Gambit-token throttle caps frequency.
- *Devour double-taxes the loser* (banished card **plus** committed-card spoils). That's intentional — it's the aggressive form — but the *gentle-Devour* dial is "the committed card is banished instead of going to the Reserve; no extra hand card lost."
- *Illuminate / Resonate / Devour-High touch the Source → clock.* Each is bounded to ~1 card; only use Devour-High deliberately to hasten the Drought.
- *Transmute needs a value-nudge mechanism.* Resolve it immediately into a build action (no lingering "altered value" tokens to track).

---

# Direction 2 — Resonance Marks
### Duels are an investment that pays off at the Ascension

The boldest *strategic* reframe: winning a clash doesn't do something now — it plants a **Mark** that resolves at scoring. Every duel becomes a season-long bet, and the endgame becomes a reveal of who invested where. This is the highest-ceiling, most distinctive direction, and the heaviest.

| Mark (place on a win) | Where it goes | At the Ascension |
|---|---|---|
| **Tithe** | a rival's spell (band caps the spell size you may mark) | You skim Recognition Points from it — e.g. you gain RP equal to the marked spell's component count; the owner keeps the spell but loses that many RP. |
| **Aegis** | one of your own spells | +RP bonus, and it can't be Tithed. |
| **Beacon** | an energy type or the Source | Small ongoing benefit during play (e.g. +1 when you Collect that energy). |

Defender agency: **Yield** → the attacker places a *lighter* Mark (e.g. Tithe capped one band lower). **Answer-and-win** → the defender places a Mark instead (Aegis on themselves, or a Tithe back on the attacker). Marks are **visible all game**, so nothing is a surprise — and a marked player can fight back by **Reshaping or Unlearning** the spell to shed a Tithe (at the usual cost), which is lovely counterplay.

**Why it's bold:** conflict gains a memory and an arc. Mid-game duels are bets; the final scoring is a payoff with real swings ("the Tithes come due"). It creates reading, bluffing about what you'll target, and defensive play (rushing an Aegis onto your masterwork). Nothing like it exists in the base game.

**Risks → fixes:**

- *Scoring complexity.* Keep Mark math flat (RP = component count), never percentages.
- *Delayed gratification.* Some players want immediate feedback; marks feel abstract mid-game. Mitigate with the Beacon's small ongoing trickle, and accept this is the cerebral, strategist's flavour.
- *Kingmaking / snowball.* Marks are placed by clash *winners* (usually stronger hands), capped per player (e.g. max 3 Tithes out), and a high card spent to win is a card not built — all natural brakes. Cap and test.
- *Bookkeeping.* Tokens sit on spells all game; track ownership with player-coloured marks.

---

# Direction 3 — Bend the Failing Magic
### The duel is a fight over the shared board, not the person

The lowest-feel-bad and cleanest-scaling direction, and it contains the single best new idea in this document: **a tug-of-war over the Drought itself.** Here the clash is direct, but the *spoils* are control of the shared systems — the Source, the Array, the clock, the seat. You're not hurting a rival; you're wrestling the collapsing magic to your advantage, which happens to be at their expense.

**Win a clash → seize one lever (band scales the amount):**

- **Hasten / Stall the Drought:** banish 1–3 cards from the Source to bring the ending closer, **or** bury committed/Reserve cards back into the Source to push it further away. *This is the headline:* the player in the lead wants to hasten, the trailing players want to stall — so game length itself becomes the contested prize.
- **Command the Array:** sweep and replace the whole Array, **or** reserve one Array card for your next turn (no one else may take it), **or** dump the Array to the Reserve to deny everyone.
- **Seed the Source:** look at the top 2–4 and reorder them (shaping what the table draws).
- **Seize the Seat:** take the start-player marker / shift turn order by one.

Committed-card spoils resolve as normal.

**Why it's bold:** it reframes "conflict" as a struggle over tempo and shared state — the most thematic possible fit for a game about wizards fighting as the world's magic runs dry. The Drought tug-of-war alone adds a strategic dimension the game has never had: the clock stops being a neutral timer and becomes something you and your neighbour actively fight to control.

**Risks → fixes:**

- *"Not personal enough."* It's the most indirect of the three — but the clash is still a direct, neighbour-to-neighbour contest, and the outcomes hit everyone, so the table stays tense. If you want more bite, pair it with Direction 1's **Devour** as a fifth option.
- *Clock manipulation could end games too fast/slow.* Bound the move to 1–3 cards and cap how many "hasten/stall" plays happen; measure game length carefully.
- *Seat-seizing can feel bad for the displaced player.* Keep it to a one-step shift, and consider dropping it if it grates.

---

# The cross-cutting gem: the Drought tug-of-war

Independent of which direction you pick, **making the Drought timing contestable** is worth stealing into the baseline. Right now the Source is a neutral countdown; letting players spend duel wins to hasten or stall it turns the whole game's pacing into a live negotiation between the leader (who wants to lock in their lead) and the pack (who wants more time to catch up). It's a natural rubber-band, it's intensely thematic, and it costs almost nothing to bolt on. Strong recommendation regardless.

---

# Comparison

| | **1 — Elemental Powers** | **2 — Resonance Marks** | **3 — Bend the Failing Magic** |
|---|---|---|---|
| Core idea | Four signature wizard powers | Win → plant marks that score at the end | Win → seize the shared board/clock |
| Feel | Dramatic, varied, thematic | Cerebral, long-arc, swingy finish | Tense but impersonal, strategic |
| Feel-bad | Low–medium (Devour bites) | Medium (endgame skim) | Lowest |
| Conflict flavour | Self-buff → take-that range | Investment warfare | Control of pace & resources |
| Complexity added | Medium | High (endgame scoring layer) | Low–medium |
| Bookkeeping | Light | Heaviest (marks all game) | Light |
| Frequency use | Band scales each power | Band = mark weight | Band = amount moved |
| Snowball risk | Medium (build-buffs) | Medium (mark stacking) | Low (rubber-bands via Drought) |
| Teaches in | ~5 min | ~12 min | ~5 min |
| Keeps energy identity? | Yes (the four forms) | Optional | Optional |
| Best for | Groups who liked the forms but want drama | Strategists who want a deep meta | Groups who want conflict without resentment |

---

# Recommendation

**Prototype Direction 1 (Elemental Powers), and steal the Drought tug-of-war from Direction 3 as a fifth toggle.**

Reasoning: Direction 1 keeps the energy-as-identity structure you already liked, but it replaces forgettable chip effects with four powers a player will actually *talk about after the game* — annihilating a card into the Void, transmuting a 7 into the 8 you needed, copying a rival's masterwork. It spans the whole range from clean self-buff to real take-that, so it answers "more conflict" without making every duel feel hostile, and it leans hard on frequency exactly the way you wanted. The Drought tug-of-war then adds the one structural idea here that the base game has never had — a contestable clock — for almost no added rules.

Hold the others as live alternatives, not dead ends:

- **Direction 2 (Marks)** is where to go if you want maximum strategic depth and a memorable endgame, and you're willing to pay for it in teaching time and bookkeeping. It's a "deluxe edition" of conflict.
- **Direction 3 (Bend the Magic)** is the pick if early testers recoil from any feel-bad — it's the gentlest and scales the most smoothly, and its Drought lever is excellent.

A clean test path: build Direction 1's four powers, run the 2-player duel lab from the Gambits playtest plan, and specifically watch **Devour** (is permanent removal too harsh?) and **Transmute** (does win-then-build snowball?). If the powers sing, fold them into the Resonance Gambits ruleset in place of Flare/Dampen/Displace/Echo; the rest of that document — clash, Yield/Answer, spoils, Warded, throttle, Drought shut-off — carries over unchanged.

> Want me to write Direction 1 up as a drop-in replacement for the Gambits effects (full rules, worked examples, the Drought toggle), or develop a different one of the three?
