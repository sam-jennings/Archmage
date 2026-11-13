---
title: Expansion B - Spell Duels (Deep Dive)
type: design-exploration
status: draft-for-review
created: 2026-06-04
relates_to:
  - "[[Expansion Concepts - Player Interaction]]"
  - "[[Archmage Ascension - Complete Rulebook]]"
---

# Expansion B — Spell Duels (Deep Dive)

A focused iteration on the direct-conflict module, rebuilt around **resonance frequency** (the 1–20 value on every component) as the source of duel power. This supersedes the Spell Duels sketch in [[Expansion Concepts - Player Interaction]].

---

## Why frequency is the right lever

In the base game the frequency number does a lot of work for *forming* spells — sequences for Transfiguration and Perfect Transmutation, matches for Enchantment — but it contributes **nothing to power**. A Void 1-2-3 Transfiguration scores exactly the same as a Void 13-14-15. Half the information on every card is, mechanically, inert as a measure of strength.

A duel system is the perfect place to give those numbers meaning. If **higher frequency = stronger magic in a clash**, three good things happen at once:

1. **Every card gains a second identity.** A high card is no longer just "a building block" — it's also a weapon and a shield. That forces a genuine, turn-by-turn decision: *build it or bank it?*
2. **Duels become a contest of numbers, not a menu of fixed buttons.** Two wizards push competing resonances against each other; the louder one wins. That's more thematic and more replayable than "spend 3 cards, apply effect X."
3. **It threads conflict through the resource you already fight over.** No new currency — the ammunition *is* the energy economy, so every shot has a real opportunity cost against your own Spellbook.

The whole module below is built on that thesis, then stress-tested for the new problems it creates.

---

## The core: the Resonance Clash

**When you may duel.** During your **Casting phase**, you may spend **one cast action** (one counter — the same resource you'd use to cast a spell) to **Channel** a clash at an **adjacent** player instead of casting a spell. By default, **once per turn**.

**The strike.** Play one component from your hand face-up as your **strike**. Its frequency value is your **strike power**. Its frequency *band* (below) sets the strongest effect you may attempt; you may always choose a weaker effect.

| Strike band (2–4p deck, 1–15) | Strike band (5–7p deck, 1–20) | Effect you may attempt (this band or lower) |
|---|---|---|
| **Low** 1–5 | **Low** 1–7 | **Destabilise** — target has −1 capacity next turn; if already at minimum capacity, they skip their next Collection draw instead (so a Low strike always bites) |
| **Mid** 6–10 | **Mid** 8–14 | **Suppress** — choose one of the target's spells; it can't be *cast* next turn (it still scores) |
| **High** 11–15 | **High** 15–20 | **Siphon** — take one component of frequency ≤ your strike from the target's hand (their choice among eligible cards) |

A **wild** may be played as a strike (or guard) of any value you choose, up to the deck maximum.

**The guard.** The target may respond with **one** of:

- **Accept** — play nothing, keep all cards, suffer the effect. (Always available. This is the agency that stops duels from feeling helpless, and stops defenders from bleeding their hand on small stuff.)
- **Guard** — play one component face-up. If its frequency is **≥ your strike power**, the strike is **repelled** (no effect). If it's lower, the strike still lands (the partial resonance wasn't enough) and the card is still spent.

**Resolve & pay.** The attacker's strike card always goes to the **Arcane Reserve**. A guard card (if played) goes there too. Apply the effect if it landed. Then the target gains a **Warded** token.

**Warded.** A player holding a Warded token can't be targeted again until the start of their next turn, when they discard it. This caps focus-fire — critical at 2p and at full tables.

**Drought.** The Casting phase doesn't exist in the Drought, so duels switch off entirely once the Source runs dry. The endgame stays a calm, solitaire optimisation — no last-second griefing of someone's final score.

---

## The decision this creates (the depth)

Because the strike card is spent and is the same resource you build with, every clash is a three-way tension:

- **Build it, bank it, or burn it?** Your Radiance 14 could anchor a Conjuration, sit in hand as a *threat*, or be fired as a near-unstoppable strike. High cards are now genuinely agonising to spend.
- **Attack low or attack high?** A Low strike (cheap card) attempting Destabilise will usually be *accepted* — chip damage for a card you didn't want anyway. A High strike forces a real effect through a likely guard, but costs you a premium card and invites the target to overspend to repel. You're constantly pricing "what will they pay to stop this?"
- **Guard or eat it?** To repel you must play a card **≥** the strike, i.e. spend *at least as much* as the attacker did. So repelling is deliberately card-expensive: you swallow small effects and save your high cards to repel the strike that actually threatens your engine.

That last asymmetry is the quiet balancing wheel of the whole system: **attacking is cheap-ish and frequent for small effects, but forcing through a big effect — or repelling one — costs real building power.** Conflict stays affordable as texture and expensive as a haymaker.

---

## Iteration log — problems frequency introduced, and the fixes

Making frequency the power source created four new failure modes on top of the ones the v2 sketch already handled (no destruction, neighbour-only, wardable, small effects). Each is addressed in the rules above:

1. **High-card hoarding → stall and analysis-paralysis.** *Risk:* if high cards are premium ammo, players stop building them and sit on a fist of 11–15. *Fixes already baked in:* (a) channelling costs a **cast action**, so every duel is a turn you didn't advance your own Spellbook — hoarders fall behind on the actual win condition; (b) a hoarded high hand is the juiciest **Siphon** target, so hoarding paints a bullseye; (c) you draw only ~1 card per turn, so ammo is genuinely scarce and can't be stockpiled freely. Hoarding is self-punishing rather than rule-banned.

2. **Draw-luck snowball.** *Risk:* whoever draws high cards wins every clash → luck decides duels → snowball, which the course flags hardest at 2p. *Fixes:* effects are **small and tempo-only** (a lost clash costs one turn of tempo, never built progress), the target can always **Accept** to refuse a card-bleed, **Warded** caps repeated hits, and the optional **Summed Strike** dial (below) lets a player with many low cards assemble a big strike — so high singletons aren't the only path to power.

3. **Defender hand-bleed.** *Risk:* if guarding is mandatory or always costs a card, defence drains you dry. *Fix:* **Accept** is always free; you only spend to guard when the effect is worth overspending on. Equilibrium lands on "eat the chip, repel the haymaker."

4. **Base-economy distortion.** *Risk:* making high cards dual-use premium could warp base-game building (people avoid low sequences, fight over the 11–15 band). *Honest status:* this is a real, intended shift — it's the *point* of the lever — but it's the #1 thing to measure (see residual risks). It is contained by the cast-action cost (you can't both duel hard and build hard) and by the fact that low cards remain fully effective for *forming* spells and for cheap chip-strikes.

Carried over and still holding: **no built spell is ever destroyed** (planning is safe from turn-to-turn volatility), **neighbour-only** prevents ganging, and duels **switch off in the Drought**.

---

## Worked example (4 players, 1–15 deck; bands Low 1–5 / Mid 6–10 / High 11–15)

It's **Bex's** Casting phase; she has capacity 2 (she's learned one 3-card Enchantment). She casts her Void Conjuration first (draws +1), then spends her **second** cast action to **Channel** at her left neighbour, **Cole**, whose Aether Conjuration engine is about to come online.

- Bex wants to **Suppress** that engine (a Mid effect), so she needs a strike of Mid band or higher. She strikes with **Flux 12** (High band — easily qualifies). Strike power = 12.
- Cole can **Accept** (and lose his engine's cast next turn) or **Guard**. He holds Aether 9 and Radiance 14. To repel he needs ≥ 12, so he plays **Radiance 14** → repelled. Both Flux 12 and Radiance 14 go to the Arcane Reserve. Cole protected his engine but burned his best card to do it — a fair trade he chose to make.
- Cole takes a **Warded** token: Bex's other neighbour can't be channelled into him either until his next turn. Bex is done (one channel this turn).

Contrast: had Cole held nothing ≥ 12, he'd likely **Accept** rather than waste his Aether 9 — the Suppress lands, his engine is locked for one turn (it still scores at the end), and he keeps his cards. Either way the clash cost Bex her Flux 12 *and* a cast she could have used on her own spells.

A cheap chip-strike looks different: striking **Radiance 3** (Low) attempting **Destabilise** will almost always be accepted — nobody spends a card to dodge −1 capacity — so it reliably lands for the price of a card you didn't need. Low cards still bite; they just can't force the big effects.

---

## Tuning dials (pick the temperature)

The core above is the recommended baseline. These are tested directions to make the system spicier or milder without rebuilding it:

- **Summed Strike (anti-luck, +depth).** Instead of one card, a strike may be **several components of the same energy**, summing their frequencies for total strike power (band determined by the sum). Lets a low-card hand mount a real attack, and makes energy concentration matter. Cost: more cards spent, more hand-planning. *Recommended as a standard inclusion if early tests show high cards dominating.*
- **Overload (spicier, swingier).** If a strike lands, its **margin** over the guard (strike − guard, or full strike if Accepted) adds intensity: e.g. every full 5 points of margin upgrades Destabilise to −2 capacity, or lets Suppress hit a second spell. Dramatic, but reintroduces swing — cap the bonus and playtest for kingmaking.
- **Backlash (anti-snowball).** A **High** strike that is repelled rebounds: the attacker loses 1 counter (capacity) until their next turn. Punishes flinging haymakers blindly; rewards the defender's read. Thematically, your over-projected resonance recoils.
- **Same-energy amplification (more theme, more rules).** If your strike's energy matches the energy of the spell you're targeting (Suppress) or the guard played, +2 strike power. Resonant energies overpower like-attuned defences. Adds a layer of energy-reading; only add once the base clash is solid.
- **Simultaneous reveal (more bluff, more downtime).** Attacker and defender commit their cards face-down and flip together. Adds genuine bluffing (the defender might over- or under-commit) at the cost of a slower beat per duel. Default stays **sequential** (strike, then respond) to keep turns fast.
- **No per-turn cap (more aggression).** Drop "once per turn"; each channel just costs a cast action, so high-capacity wizards can duel more. Ties aggression to the Enchantment economy, but watch capacity-leaders dominating; the Warded token still caps per-target.

Mild table? Run the core with **Destabilise and Suppress only** (cut Siphon — the one effect that touches a hand) and you have a pure tempo-fight with near-zero feel-bad.

---

## Scaling 2–7

- **2p — a true resonance duel.** Each is the other's only target. This is where draw-luck snowball is most dangerous, so keep effects small, keep **Warded** (one hit per round), and strongly consider **Backlash** to deter haymaker spam. Test this count first and hardest.
- **3–5p — the sweet spot.** Threats run both ways around the table; neighbour-only keeps it from collapsing into a pile-on.
- **6–7p — local skirmishes.** Reach stays local, so the table naturally fragments into overlapping duels rather than one global brawl. Bands use the 1–20 split, so high-tier effects are reachable but still premium.

Band tables scale with the deck you're already using (1–15 vs 1–20), so nothing extra to track per count.

---

## Components

No new card deck — strikes and guards are paid with the energy components already in the game. You need only:

- One **Disruption reference card** per player (the band/effect table above).
- A few **Suppress** markers (to show which spell is locked, and clear it next turn).
- A set of **Warded** tokens.

A genuinely small footprint for the amount of interaction it adds — which is what keeps this the "medium," not "heavy," option.

---

## Residual risks → playtest priorities (in order)

1. **Does the duel economy starve building?** The headline question. Measure whether players still complete big spells, or whether the table devolves into an ammo standoff. If building suffers, raise the cast-action cost's bite (e.g. duelling also skips one *learning* action) or narrow the High band.
2. **2p snowball.** Watch whether the first player to draw high cards runs away. If so, add **Backlash** and/or **Summed Strike** as standard at 2p.
3. **Turn length / downtime.** The guard decision must stay snappy. If it drags, drop **Simultaneous reveal** (keep sequential) and consider resolving with no reaction, counterplay living entirely in the Warded token.
4. **Is Siphon worth its feel-bad?** It's the only hand-touching effect. If the "their choice, freq-capped" version feels toothless, sharpen it slightly (*you* pick among eligible cards); if it feels mean, cut it for the mild build.
