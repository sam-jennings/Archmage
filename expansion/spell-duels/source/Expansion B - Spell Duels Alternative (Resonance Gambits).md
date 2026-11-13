---
title: Expansion B - Spell Duels Alternative - Resonance Gambits
type: design-exploration
status: draft-for-review
created: 2026-06-04
updated: 2026-06-08
relates_to:
  - "[[Expansion B - Spell Duels (Deep Dive)]]"
  - "[[Expansion Concepts - Player Interaction]]"
  - "[[Archmage Ascension - Complete Rulebook]]"
---

# Expansion B - Spell Duels Alternative: Resonance Gambits

This document reviews the current frequency-driven Spell Duels deep dive, asks whether its exact strike effects are the best baseline, and develops a complete alternative expansion.

Short answer: **the current duel chassis is strong, but the specific effects are not the safest baseline.** Destabilise, Suppress, and Siphon all create drama, but they also press on the most fragile parts of the current game: capacity, spell activation, and hidden hand contents. A better first implementation is to keep the obvious **higher frequency wins** duel logic, then make duels into **staked magical gambits**: players still clash directly, but most outcomes are prizes, echoes, or voluntary concessions rather than hard action denial.

The proposed replacement is **Resonance Gambits**.

---

# Reviewer pass — 2026-06-08

This section was added on review of the Resonance Gambits draft. It records what the redesign improved, the issues that remained, and the fixes applied to the ruleset below. The original design intent is preserved throughout; inline rule changes are marked in the changelog.

## What this redesign got right

- **Decoupling from the capacity economy is the standout call.** Removing capacity attacks (Destabilise) *and* the cast-action cost means duels no longer lean on the one system the base game is still trying to fix. This is exactly the right discipline for a Stage-3 project — don't pile new mechanics on an unstable foundation.
- **Energy-as-form identity is better than frequency-banded effects.** Letting energy decide *what kind* of magic and frequency decide *who wins* solves the arbitrariness of the old "high band unlocks the mean effect" gate, and gives every energy a second meaning to match the second meaning frequency already gained.
- **Voluntary spoils removes the worst feel-bad.** You can still win an opponent's card, but only one they chose to commit. That keeps the thrill and deletes the resentment of hidden-hand theft.
- **Soft Echo over hard Suppress** preserves the target's engine and agency — a real improvement on binary spell-denial.
- **Yield** gives the defender a dignified, non-failure off-ramp while the attacker still pays.
- The good bones are kept: neighbour-only, Warded, Drought shut-off, frequency = power, defender wins ties. And the iteration log is honest (the rejected stance wheel is the right call).

## Issues found, and how they're fixed below

1. **Source-clock acceleration (highest priority).** Three of the four forms drew from the Source, and because duels are now free and once-per-turn, that quietly speeds up the Drought for everyone — *shortening the game and squeezing the very Enchantment economy this design tries to protect* (less time to assemble 3–4 card Enchantments). **Fix applied:** Void is reworked to be **clock-free attrition** (no Source draw), so Flare (and a rarely-triggered Echo) become the *only* Source-draws. This both cuts the clock load and differentiates the forms.
2. **Void ≈ Flare.** As written, Void's "target chooses: discard 1 OR attacker draws 1" usually collapsed to "attacker draws 1" — nearly identical to Flare. **Fix applied:** Void now only ever costs the *opponent* a card (their choice), never draws — a distinct "attrition" identity.
3. **Duels are free and frequent.** With no counter cost and a once-per-turn slot at the end of Casting, Gambits can become an every-turn obligation (downtime, samey rhythm, and the clock effect in #1). **Fix applied:** a new **Gambit-token throttle** dial (a small per-game pool, decoupled from counters) lets you make duels a real "is now the moment?" decision. Kept optional so groups who want maximum interaction can run freeflowing.
4. **Echo is easy to dodge and fiddly.** A target can simply not cast the marked spell, and tracking many Echoes is a memory burden. **Fix applied:** clarified that the *value is a fork* (they cast → you filter, or they hold off → self-imposed soft-Suppress), and capped it to **one owned Echo in play per player** to limit bookkeeping.
5. **Wilds auto-win every clash.** A wild as "any frequency" is unbeatable. **Fix applied:** in a clash a wild counts as **one below the deck maximum**, so a natural top card still beats it — wilds stay strong, not invincible.
6. **2-player premium-card swing.** Answering and losing can hand your best card to your only rival — a snowball vector head-to-head. **Fix applied:** "gentle spoils" (no opponent-card theft) is now the **2-player default**.

Minor notes (not changed, worth watching): Flux's two-swap win is the strongest single form effect (watch for Flux dominance; the "One-swap Flux" dial is the lever); Echo requires the target to have a non-Enchantment spell; if combined with Expansion A (Living Array), Displace's swaps interact with that module's refill timing.

---

## Stage check

`STATE.md` currently puts Archmage Ascension in **Stage 3 - Core Loop Testing**, with the Enchantment/capacity economy still unresolved. That matters.

This expansion should be treated as **designed and parked**, not promoted into the next playtest. The base game still needs to prove that its core spell-building loop works before conflict mechanics are allowed to lean on it.

The document below is therefore a shelf-ready expansion design, not a recommendation to interrupt the current core-loop work.

---

## Review of the current Spell Duels deep dive

The current deep dive makes one excellent move: it gives every component's frequency value a second identity. A card is not only a building block for sequences and matches; it can also be a strike or guard. That is a strong thematic and mechanical instinct.

The current version also protects several things that absolutely need protecting:

- **No built spell is destroyed.** This preserves planning.
- **Targeting is neighbour-only.** This limits dogpiling and kingmaking.
- **Every attack spends real components.** Conflict competes with spell construction.
- **The target can Accept.** Defence is never mandatory hand bleed.
- **Warded prevents focus fire.** Especially important at 2 players.
- **Duels turn off in the Drought.** The endgame stays focused on final optimisation.

Those are all worth keeping.

The problem is not "duels are bad." The problem is that the current effects are probably too close to the load-bearing systems of the base game.

---

## Are the current effects the best choice?

My answer is **no, not as the default expansion baseline**.

They are good exploratory effects. They are not the safest first playable version.

### Destabilise

Current effect: target has -1 capacity next turn; if already at minimum capacity, they skip their next Collection draw instead.

Why it is risky:

- Capacity is already the unresolved core problem. A duel effect that reduces capacity is likely to amplify the exact system currently under repair.
- It hits low-capacity players hardest and high-capacity players least, which risks a win-more pattern.
- The "if already at minimum, skip Collection instead" clause is an exception that solves a balance problem but adds cognitive weight.
- Low strikes become reliable nuisance attacks because defenders will often Accept them.

Better direction:

- Do not attack capacity in the first duel implementation.
- If a "destabilise" fantasy is needed, express it as a choice tax: the target either gives the attacker a small boon or discards a card of their choice.

### Suppress

Current effect: choose one of the target's spells; it cannot be cast next turn, but still scores.

Why it is the best of the three, but still risky:

- It avoids destroying progress, which is good.
- But it is binary: the spell works or does not work.
- It disproportionately hurts players with one meaningful engine spell.
- It can make a player feel as though their clever build did not matter this round.

Better direction:

- Replace hard suppression with **Echo pressure**: the target may still cast the marked spell, but doing so gives the attacker a small benefit.
- This creates a real decision without turning off the target's engine.

### Siphon

Current effect: take one component of frequency <= your strike from the target's hand; the target chooses among eligible cards.

Why it is risky:

- It touches hidden hand contents, which is where direct-conflict feel-bad tends to concentrate.
- If the target chooses, it can feel toothless.
- If the attacker chooses, it can feel mean.
- The frequency cap makes high strikes more desirable, reinforcing high-card hoarding.

Better direction:

- Only allow "stealing" from cards that were voluntarily committed to the duel.
- If the defender Answers and loses, the winner may take one of the committed duel cards. This keeps the thrill of spoils, but the defender opted into that risk.

### Frequency as raw power

Current rule: higher frequency is always better in the strike/guard contest.

Revised judgement:

This is the right core signal. Higher frequency should win.

Why it should stay:

- It is instantly readable. A 14 is stronger than a 6.
- It gives every card a clear second value: build with it, or hold it as duel power.
- It creates the exact intended tension: high cards are useful in spells, but also valuable as strikes and guards.
- It avoids a separate combat logic that players must learn on top of the base game.

The risk:

High-card hoarding is possible. But that should be managed through cost, risk, and effect tuning, not by hiding the value hierarchy behind a stance wheel.

Better direction:

- Keep linear frequency comparison: higher frequency wins.
- Defender wins exact ties.
- Do not use frequency bands to unlock harsher effects.
- Let energy type determine the kind of Gambit, while frequency determines who wins the clash.

### Cast-action cost

Current rule: channelling spends one cast action/counter.

Why it is risky:

- Low-capacity players pay a huge cost: duelling may consume their entire Casting phase.
- High-capacity players pay a smaller relative cost.
- Since Enchantment/capacity is already unresolved, this may accidentally make duel access scale with the current leader.

Better direction:

- Make each player able to initiate one duel during normal Casting, but **do not spend a counter**.
- The cost is the committed component and the risk of losing the duel.
- This keeps conflict from coupling too tightly to the fragile capacity economy.

---

## Design goals for the alternative

The alternative should keep the good parts of the deep dive while changing the emotional shape of the effects.

1. **Preserve the duel fantasy.** Wizards still throw energy at each other and answer with guards.
2. **Avoid attacking capacity.** Do not add pressure to the unresolved Enchantment economy.
3. **Avoid hard spell denial as baseline.** Built spells should still feel reliable.
4. **Avoid involuntary hand theft.** If a card changes hands, it was committed to the duel.
5. **Make high frequency visibly valuable.** High cards should be stronger in duels, creating a real build-or-save decision.
6. **Use energy types for identity.** Radiance, Void, Flux, and Aether should feel different in a duel.
7. **Keep conflict local.** Neighbour-only targeting remains essential.
8. **Keep the Drought clean.** No duels after the Source empties.

---

## Iteration log

### Version 0 - Current frequency strike

The starting point is the current deep dive:

- Strike with one component.
- Higher frequency is stronger.
- Frequency band determines the strongest effect available.
- Defender Accepts or Guards with a card of equal or higher frequency.

This is clear and thematic, but it has three issues:

- High cards become the default best duel cards.
- Effects attack capacity, spell casting, or hand contents.
- The guard decision can become obvious once a high strike is revealed.

### Version 1 - Positive-only prize duels

First attempted alternative:

- Duel winner gains a boon.
- Loser suffers no direct penalty.
- Effects are draws, Array manipulation, and protection.

What improved:

- Much lower feel-bad.
- No damage to built progress.
- No capacity pressure.

What failed:

- It became too polite.
- If the defender did not care about the boon, the duel lacked teeth.
- The fantasy of magical interference became more like a side wager.

Conclusion: duels need some pressure, but it should be pressure with player choice.

### Version 2 - Spoils from committed cards

Second iteration:

- Attacker commits a strike card.
- Defender may Yield or Answer with a guard card.
- If the defender Answers, the winner takes one committed card as spoils; the other goes to the Arcane Reserve.

What improved:

- Siphon becomes fairer: you can win an opponent's card, but only if they chose to risk it.
- Yield becomes meaningful: the defender can avoid risking a card.
- Duels become tense without needing harsh penalties.

Open concern:

- Higher frequency still makes high cards dominant in duels.

Revised conclusion:

That dominance is acceptable, and probably desirable. It makes duel value legible and creates the intended dilemma: use the high card in your Spellbook, or keep it as strike/guard power.

### Version 3 - Rejected stance wheel

Third iteration tested a stance wheel:

- Low values beat high values.
- High values beat mid values.
- Mid values beat low values.

What it solved:

- High cards were no longer automatically best.
- Low cards could sometimes counter high cards.

Why it was rejected:

- It made duel value less intuitive.
- It contradicted the clean promise that frequency is power.
- It added a reference-table burden to a system that should resolve quickly.
- It weakened the build-or-save tension around high cards.

Conclusion: the stance wheel is clever, but unnecessary. Higher frequency wins is clearer and more aligned with the purpose of the module.

### Version 4 - Energy forms

Fourth iteration:

- The attacker declares a duel form: Radiance, Void, Flux, or Aether.
- The attacker's strike must match that energy.
- Each energy has a different effect profile:
  - Radiance draws out power.
  - Void dampens and pressures.
  - Flux shifts the Array.
  - Aether echoes spells.

What improved:

- Energy types gain duel personality.
- Effects are not locked behind frequency bands.
- A Radiance 14 is stronger than a Radiance 3, but both are still Flare strikes. Frequency decides power; energy decides effect.

What still needed work:

- The defender needed a safe off-ramp that did not always feel like losing.

Conclusion: keep Yield as a mild concession, not a punishment.

### Final version - Resonance Gambits

The final version combines:

- One optional challenge per turn.
- Neighbour-only targeting.
- Face-down strike and guard.
- Higher frequency wins.
- Energy-based forms.
- Yield as a safe concession.
- Spoils only from committed cards.
- Warded to stop focus fire.
- No duels in the Drought.

---

# Final ruleset: Resonance Gambits

## Expansion fantasy

The Academy's regulated spellcraft begins to fray. Wizards no longer merely race to shape the Source; they test each other's resonance directly. A duel is not always a wound. Sometimes it is a flare of insight, a stolen rhythm, a shifted Array, or an echo tied to a rival spell.

These are not battlefield attacks. They are magical gambits: risky, local, and costly enough that every challenge asks, "Is this worth a component I might need later?"

---

## Components

Add:

- 1 **Resonance Gambits reference card** per player.
- **Warded tokens**, about 1 per player plus a few extras.
- **Echo tokens**, about 6-10.

No new card deck is required. Duel strikes and guards use the existing component cards.

---

## Setup

Setup is unchanged.

Give each player a reference card. Place Warded and Echo tokens within reach.

---

## When you may Channel a Gambit

During your normal **Casting phase**, after you have finished casting spells and before Recall, you may **Channel one Gambit** at an adjacent player.

Rules:

- You may Channel at most once per turn.
- Channelling does **not** spend a counter.
- You must play one component from hand as your strike.
- You may target only an adjacent player.
- You may not target a player who has a Warded token.
- You may not Channel during the Drought.

Why it does not spend a counter:

The current base game is still testing capacity. Spending counters on duels would make low-capacity players pay the highest relative cost and high-capacity players pay the lowest. In this expansion, the cost is the component you risk and the chance of losing the duel.

---

## Step 1 - Declare the form

Choose one of the four duel forms:

| Form | Energy | What it does |
|---|---|---|
| **Flare** | Radiance | Draws out power from the Source |
| **Dampen** | Void | Pressures a rival's hand or gives you power |
| **Displace** | Flux | Shifts the Array |
| **Echo** | Aether | Ties your resonance to a rival spell |

Your strike card must match the declared energy. A wild may be used as any energy.

If you declare **Echo**, also choose one non-Enchantment spell in the target's Spellbook. Echo cannot target Enchantments because Enchantments are not cast.

---

## Step 2 - Commit the strike

Play one component from your hand face-down as your strike.

The strike must match the declared form's energy. If it does not, the defender automatically wins if they Answer. If the defender Yields, the illegal strike simply fizzles and goes to the Arcane Reserve with no effect.

---

## Step 3 - Defender chooses Yield or Answer

The target chooses one:

### Yield

The defender plays no card.

- Reveal the attacker's strike to confirm it matches the declared form.
- If the strike is legal, the attacker resolves the form's Yield effect.
- If the strike is illegal, the Gambit has no effect.
- The attacker's strike goes to the Arcane Reserve.
- The defender gains a Warded token.

Yield is the safety valve. The defender avoids risking a card, and the attacker still pays a component.

### Answer

The defender plays one component from hand face-down as a guard.

- The guard may be any energy.
- Reveal strike and guard together.
- Resolve the duel by comparing frequency.

---

## Step 4 - Compare frequency

Each committed card's frequency is its duel power.

- If the strike has a higher frequency than the guard, the attacker wins.
- If the guard has a frequency equal to or higher than the strike, the defender wins.

In short: the defender wins ties.

This keeps the duel value of a card visible at a glance. A 14 is stronger than a 6. A 20 is the strongest possible strike or guard in the 5-7 player deck.

### Wilds

When a wild is revealed, its owner chooses its **energy** (so it can match any form or guard). In a clash it counts as a frequency of **one below the deck maximum** (14 in the 1–15 deck, 19 in the 1–20 deck).

This keeps wilds powerful — they beat almost anything — without making them automatically unbeatable: a natural top-value component (15 or 20) still wins the clash. If both players reveal wilds, both count as one below maximum, so it's a tie and the **defender wins**.

---

## Step 5 - Spoils

If the defender Answered, the winner takes spoils:

- The winner chooses one of the two committed cards and adds it to their hand.
- The other committed card goes to the Arcane Reserve.

This means a player can win the opponent's committed card, but never a random or hidden card from the opponent's hand. The defender chose to risk that card by Answering.

Then resolve the form's Strike Win or Parry Win effect.

---

## Step 6 - Warded

After the Gambit resolves, the target gains a **Warded** token.

A player with a Warded token cannot be targeted by another Gambit.

At the start of your turn, discard your Warded token if you have one.

---

# The four forms

## Radiance Form: Flare

Radiance burns cleanly through the clash, revealing usable power.

| Result | Effect |
|---|---|
| **Yield** | Attacker draws 1 component from the Source, then discards 1 component from hand to the Arcane Reserve. |
| **Strike Win** | Attacker draws 1 component from the Source. |
| **Parry Win** | Defender draws 1 component from the Source. |

Design note:

Flare is the cleanest, least hostile Gambit. It is useful when you want card flow, but it also advances the Source clock. After the 2026-06-08 pass, Flare (and a *triggered* Echo) are the **only** forms that draw from the Source, so Flare is the deliberate clock-mover: lean on it when you want to hasten the Drought, avoid it when you want the game to run long.

---

## Void Form: Dampen

Void does not destroy. It hollows the channel until someone must give ground.

| Result | Effect |
|---|---|
| **Yield** | Target discards 1 component from hand (their choice) to the Arcane Reserve. No Source draw. |
| **Strike Win** | Target discards 1 component from hand (their choice) to the Arcane Reserve. (Attacker also takes spoils in Step 5.) |
| **Parry Win** | Attacker discards 1 component from hand (their choice) to the Arcane Reserve. (Defender also takes spoils in Step 5.) |

Design note:

Dampen is the replacement for Destabilise and Siphon. It has teeth, but the pressured player chooses the cost. It never reduces capacity, never disables a spell, and never steals an uncommitted card. **(Revised 2026-06-08:** Dampen no longer draws from the Source on any outcome — it only ever costs the *opponent* a card of their choice. This gives it a distinct "attrition" identity versus Flare's card-flow, and keeps duels from speeding the Drought. Was: a draw-or-discard choice that usually resolved to "attacker draws 1.")

---

## Flux Form: Displace

Flux twists the Academy's regulated field, making the Array momentarily negotiable.

| Result | Effect |
|---|---|
| **Yield** | Attacker may swap 1 component from hand with 1 component in the Array. Do not replace from the Source. |
| **Strike Win** | Attacker may swap up to 2 components from hand with up to 2 components in the Array. Resolve swaps one at a time. Do not replace from the Source. |
| **Parry Win** | Defender may swap up to 2 components from hand with up to 2 components in the Array. Resolve swaps one at a time. Do not replace from the Source. |

Design note:

Displace creates interaction through the visible market. It can deny, fix, or set up a spell without directly harming the target. It also avoids changing the Source clock.

---

## Aether Form: Echo

Aether binds patterns together. The strike does not stop a spell; it lets the duellist resonate with it.

When declaring Echo, the attacker chooses one non-Enchantment spell in the target's Spellbook.

| Result | Effect |
|---|---|
| **Yield** | Place an Echo token on the chosen spell. The attacker owns that Echo. |
| **Strike Win** | Place an Echo token on the chosen spell. The attacker owns that Echo. |
| **Parry Win** | Defender may place an Echo token on one of their own non-Enchantment spells. The defender owns that Echo. |

Echo token rule:

- A player may have at most **one Echo they own in play at a time** — place a new Echo only after your previous one resolves or expires. (Keeps tracking light.)
- The next time the marked spell is cast, after it resolves, the Echo's owner draws 1 component from the Source, then discards 1 component from hand to the Arcane Reserve.
- Then remove the Echo token.
- If the marked spell is not cast before the start of the Echo owner's next turn, remove the Echo token.
- If the marked spell is Unlearned or Reshaped into a different spell before the Echo triggers, remove the Echo token.

Design note:

Echo is the replacement for Suppress. The target can still cast the spell. The question becomes whether casting it is worth giving the attacker a filter. This creates soft pressure without turning off the engine.

Worth being explicit about Echo's real value, because it looks dodgeable: it's a **fork**, not a fizzle. Either the target casts the marked spell and the Echo owner gets a small filter, *or* the target holds the spell back for a turn to deny that filter — which is a **self-imposed, soft Suppress** they chose. Either branch bends the target's turn slightly, which is the whole point. It will feel strongest against an engine the target wants to fire every turn (a big Conjuration or Perfect Transmutation) and weakest against a flexible builder — that variance is acceptable for a deliberately gentle effect.

---

# Worked examples

## Example 1 - A high guard wins, but risks a valuable card

Bex channels **Flux Form: Displace** at Cole.

She commits **Flux 13** as her strike.

Cole Answers with **Radiance 14** as his guard.

Cole's 14 is higher than Bex's 13, so Cole wins the parry.

Cole takes one committed card as spoils. He can recover his Radiance 14, or he can take Bex's Flux 13 and let his Radiance 14 go to the Arcane Reserve. Then he resolves Displace's Parry Win effect, swapping up to 2 cards with the Array.

Why this matters:

The higher card wins cleanly, but committing a premium guard is still a real decision. Cole protected himself, but he had to put Radiance 14 at risk to do it.

## Example 2 - Echo as soft Suppress

Amira channels **Aether Form: Echo** at Jonah and names his 4-card Void Conjuration.

Jonah does not want to risk a guard, so he Yields.

Amira's strike goes to the Arcane Reserve. She places an Echo token on Jonah's Void Conjuration. Jonah gains Warded.

On Jonah's next turn, he may still cast the Conjuration normally. If he does, Amira draws 1 from the Source, then discards 1. If he does not cast it, the Echo expires at the start of Amira's next turn.

Why this matters:

The spell is not suppressed. Jonah decides whether the spell's benefit is worth giving Amira a small echo.

## Example 3 - Void pressure with defender agency

Cole channels **Void Form: Dampen** at Bex.

Bex Answers with a guard. Cole reveals **Void 11**. Bex reveals **Aether 4**.

Cole's 11 is higher than Bex's 4, so Cole wins the strike.

Cole takes one committed card as spoils. He chooses to recover his Void 11; Bex's Aether 4 goes to the Arcane Reserve.

Then Dampen's Strike Win effect resolves: Bex discards 1 component of her choice to the Arcane Reserve. She dumps a low card she did not need.

Why this matters:

Void has teeth — it costs the loser a card, and no Source draw speeds the clock — but the pressured player still chooses *which* card. Note that Bex paid twice here (her Aether 4 as spoils, and a discard), which is why losing a Void clash stings; it's also why a limited supply of Gambits, or the 2-player gentle-spoils default, keeps that swing in check.

---

# Why this is a better baseline

## It avoids the current capacity trap

No Resonance Gambit reduces capacity.

That is the single most important change. The base game is already investigating whether Enchantment and capacity are structurally viable. An expansion should not introduce a new way to lower capacity until that foundation is stable.

## It replaces hard Suppress with soft Echo

The current Suppress effect says, "you cannot cast that spell next turn."

Echo says, "you may cast it, but I get a small benefit if you do."

That is a better first version because it preserves the target's agency and keeps their engine functional.

## It replaces Siphon with voluntary spoils

Taking a random or semi-random hand card is a classic feel-bad zone.

Resonance Gambits still allow a player to win an opponent's card, but only a card the opponent voluntarily committed as a guard. This keeps the drama and removes most of the resentment.

## It keeps duel value obvious

The revised design accepts the core premise: high cards are better in duels.

That is not a flaw by itself. It is the useful pressure this module adds to the base game:

- A high card can strengthen a duel.
- The same high card may be needed for a spell.
- If you fire it as a strike and the target Yields, it burns into the Arcane Reserve.
- If you guard with it, you might win, but you had to expose a valuable card.

The design should make that decision painful and clear, not obscure it with a second combat table.

## It ties effects to energy instead of value

Frequency decides how the duel resolves.

Energy decides what kind of magic is being channelled.

That is cleaner thematically:

- Radiance reveals power.
- Void pressures.
- Flux rearranges.
- Aether echoes.

It also means strong effects are not locked behind high-frequency cards.

## It decouples duels from counters

The current design spends a cast action. That is elegant, but it risks making duels cheaper for capacity leaders and punishing for low-capacity players.

This alternative gives everyone one possible Gambit per normal Casting phase. The limiting cost is hand economy and duel risk, not the still-unresolved counter economy.

---

# Balance and feel

## Expected play pattern

Most players should not Channel every turn.

They will Channel when:

- they have a high-frequency card worth risking for a likely win;
- they have a low-frequency card they are happy to burn if the target Yields;
- they want to pressure a neighbour's engine without stopping it;
- they need Array access through Flux;
- they can afford to risk a component for a potential spoil;
- they want to force a defender to choose between Yielding or risking a key card.

They will skip a Gambit when:

- their hand is tight;
- every component is needed for a spell;
- the target is Warded;
- the target can profitably parry;
- the Drought is near and they need to preserve construction resources.

## Why Yield matters

Yield is not a failure state. It is the defender saying, "I will not put another card into this pot."

That keeps the defender in control of their hand risk. It also makes the attacker pay a real cost: the strike goes to the Arcane Reserve when the target Yields.

## Why spoils matter

Without spoils, duels risk feeling too soft.

With spoils, the duel has stakes:

- The attacker might win the guard.
- The defender might win the strike.
- Both players care about the reveal.

But because only committed cards can be won, the conflict remains bounded.

---

# Scaling 2-7 players

## 2 players

This becomes a true duel. Each player is the other's only legal target.

The key anti-snowball features are:

- Warded limits targeting to once per round.
- Defender wins exact ties.
- Yield lets a player refuse card risk.
- High cards are powerful but exposed when committed.
- No effect reduces capacity or disables a spell.

> **2-player spoils default (added 2026-06-08):** on a Parry Win, both committed cards go to the Arcane Reserve — the winner does **not** take the opponent's card. Head-to-head, losing a premium guard to your only rival is too swingy. Use full spoils only at 3+ players, or if 2-player testing shows duels are too soft.

2-player test priority:

Watch Void Form. If repeated Dampen still feels oppressive, add this 2-player dial:

> A player cannot choose Void Form against the same target on two consecutive turns.

## 3-5 players

This should be the sweet spot.

Neighbour-only targeting creates two local rivalries. Warded prevents a player from being hit by both neighbours before their next turn.

## 6-7 players

The table naturally breaks into overlapping local duels.

The 1-20 deck simply has a wider power range. A 20 is the strongest possible duel card, which is easy to read and easy to teach.

---

# Drought handling

No Resonance Gambits may be Channelled during the Drought.

If a Gambit effect draws the last card from the Source:

1. Finish resolving the Gambit.
2. Resolve the Drought trigger normally.
3. Remove all Echo tokens.
4. Continue with Drought rules.

Why Echo tokens are removed:

Echoes are tied to active Source resonance. Once the Source collapses, there is no normal Casting phase and no stable channel for Echo to trigger.

---

# Tuning dials

Use these only after testing the baseline.

## If duels are too mild

- **Sharper Echo:** Echo owner draws 1 from the Source without discarding.
- **Sharper Void:** Void Yield becomes "target chooses: attacker filters, or target discards 1."
- **Overpower:** If the winner's frequency beats the loser by 5 or more, the winner may take both committed cards. Do not use this at 2 players without testing.

## If duels are too mean

- **Gentle spoils:** Winner may only recover their own committed card, never take the opponent's.
- **No Void form:** Remove Dampen from the baseline and keep Radiance, Flux, and Aether only.
- **Short Echo:** Echo expires at the end of the target's next turn instead of the start of the Echo owner's next turn.

## If duels are too profitable

- **No card recovery:** Both committed cards always go to the Arcane Reserve; the winner only receives the form effect.
- **Flare filter only:** Flare's Strike Win and Parry Win become draw 1, then discard 1.
- **One-swap Flux:** Displace always swaps only 1 card, even on Strike Win or Parry Win.

## If duels take too long

- **Open guard:** Defender answers face-up after seeing the strike. This is less exciting but faster.
- **No parry effects:** Defender wins only spoils; form effects happen only on Strike Win or Yield.

## If high-card hoarding takes over

- **No opponent spoils:** Winner may recover their own committed card, but may not take the opponent's committed card.
- **High strike burns on Yield:** If the attacker strikes with a value in the top third of the deck and the defender Yields, the strike goes to the Arcane Reserve and the attacker resolves no Yield effect.
- **Return to cast-action cost:** Channelling spends one cast action. Use this only if duels are happening too often.

## If duels feel obligatory or too frequent (added 2026-06-08)

Because Channelling costs no counter and sits at the end of every Casting phase, players can Gambit every single turn. That can add up — more downtime at high counts, a samey rhythm, and (for Source-drawing forms) a faster Drought. To make each duel a deliberate choice without recoupling to the fragile counter economy:

- **Gambit tokens (recommended):** give each player a small pool of Gambit tokens at setup (default **4**; tune to game length). Spend 1 to Channel; no refresh. When they're gone, you can't Channel. This caps total duels, keeps each one special, and stays fully decoupled from capacity. *This is the cleanest throttle if duels feel constant.*
- **Cadence limit (lightest):** you cannot Channel on two consecutive turns.
- **Freeflowing (no throttle):** keep the once-per-turn, no-cost baseline if your group wants maximum interaction and the pacing holds.

---

# Compatibility with base spell types

## Conjuration

Conjuration remains valuable because card flow supports duelling and duelling can consume hand resources.

Possible issue:

Radiance (Flare) draws may make Conjuration less unique if too frequent — and after this pass Flare is the only regular Source-draw form, so it's the one to watch. Track whether players stop valuing Conjuration.

## Transfiguration

Flux Form adds more Array manipulation.

Possible issue:

This may help Transfiguration players too much, or make the Array more volatile for everyone. Because Flux swaps rather than takes/replaces, it should not heavily distort the Source clock.

## Enchantment

This design deliberately avoids capacity damage.

Possible issue:

If duel rewards improve hand smoothing, Enchantment may become easier to assemble. That might be good, but it must be measured after the core Enchantment fix is chosen.

## Perfect Transmutation

Perfect Transmutation remains a premium engine.

Possible issue:

Echo pressure may be most tempting against Perfect Transmutations. This is acceptable because Echo does not stop the spell; it only gives the Echo owner a filter if the spell is cast.

---

# Rules reference card draft

## Resonance Gambits

At the end of your Casting phase, before Recall, once per turn, Channel at an adjacent, un-Warded player. Not during the Drought.

1. Declare form: Radiance Flare, Void Dampen, Flux Displace, or Aether Echo.
2. Play 1 matching-energy strike face-down.
3. Target Yields or Answers with 1 guard face-down.
4. If Answer: reveal; higher frequency wins. Defender wins ties.
5. Winner takes 1 committed card; other goes to Arcane Reserve.
6. Resolve form effect. Target gains Warded.

## Duel comparison

- Higher frequency wins.
- Defender wins ties.
- Wilds choose energy and frequency when revealed.

## Forms

- **Radiance Flare:** winner draws 1. Yield: attacker filters.
- **Void Dampen:** loser discards 1 (their choice) to the Reserve; no Source draw. Yield: target discards 1.
- **Flux Displace:** winner swaps up to 2 with Array. Yield: attacker swaps 1.
- **Aether Echo:** mark a spell; when cast, Echo owner draws 1 then discards 1.

---

# Playtest plan

Do not test this before the core Enchantment/capacity problem is repaired.

When ready, test in this order.

## Test 1 - Two-player duel lab

Goal:

Confirm whether the higher-frequency comparison and Yield/Answer choice are readable.

Procedure:

- Play 10-15 isolated Gambits without the full game.
- Give each player a random 7-card hand.
- Refill hands to 7 after each Gambit.
- Rotate through all four forms.

Measure:

- How often players Yield vs Answer.
- Whether low cards feel meaningfully useful.
- Whether high cards are being hoarded instead of built.
- Whether spoils feel fair.
- Whether Void feels mean.

Pass condition:

Players can resolve a Gambit in under 30 seconds after learning, and both players feel they had meaningful agency.

## Test 2 - Two-player half game

Goal:

Check snowball and Source-clock impact.

Procedure:

- Play until the Source empties.
- Stop before full Drought scoring if time is tight.

Measure:

- Duel wins by player.
- Final hand sizes.
- Number of completed spells.
- Enchantment uptake.
- Turn when Source empties compared to a non-expansion baseline.
- Whether the duel winner also becomes the game winner too reliably.

Pass condition:

Duels create tension without making the loser feel locked out or causing spell construction to collapse.

## Test 3 - Four-player table

Goal:

Check neighbour-only targeting, Warded, and downtime.

Measure:

- Number of times a player is targeted twice before their next turn. This should be zero.
- Whether players watch neighbours' duels.
- Whether face-down reveals create excitement or slow the game.
- Whether players remember Echo tokens.

Pass condition:

The expansion increases table attention without pushing turn length beyond comfort.

## Test 4 - Compare against the current deep-dive version

Goal:

Decide whether Resonance Gambits should replace frequency-strike Spell Duels as the preferred Expansion B baseline.

Run one short game with:

- Current deep-dive version: Destabilise, Suppress, Siphon.
- Resonance Gambits version: Flare, Dampen, Displace, Echo.

Compare:

- Which version creates better stories?
- Which version creates more resentment?
- Which version keeps spell-building healthier?
- Which version is easier to teach?
- Which version makes frequency values feel more alive?

---

# Recommendation

Use **Resonance Gambits** as the preferred baseline for Expansion B when the project is ready to test direct conflict.

Keep the current deep-dive version as a more aggressive variant, but do not lead with it. Its best ideas are the unified component economy, neighbour targeting, Warded protection, and Drought shutoff. Its riskiest pieces are the exact effects.

The cleanest development path is:

1. Repair and validate the base Enchantment/capacity economy.
2. Test Resonance Gambits in isolation.
3. Test Resonance Gambits in a 2-player half game.
4. Test at 4 players.
5. Only then consider reintroducing harsher effects such as hard Suppress or stronger Siphon as optional "Duel Scars."

The core design judgement:

> Spell duels should create tension around what players are willing to risk, not around whether a rival gets to use the thing they built.

That is why this alternative uses higher-frequency wins, committed-card spoils, Echoes, and voluntary concessions instead of capacity loss, hard suppression, and hand theft.
