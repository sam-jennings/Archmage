---
title: Sam Decisions — F3/F4/F5/F6/F8/F10/F14
project: Archmage Ascension
date: 2026-07-06
status: draft-for-decision-file-propagation
type: decision-addendum
purpose: Consolidates Sam's amended decisions from the July decision-register review. Intended to update DECISION_REGISTER_2026-07.md, meta/QUEUE.md, and future meta/decisions files.
---

# Sam Decisions — F3/F4/F5/F6/F8/F10/F14

This file records the amended direction for the current SAM-NOW decisions:

- F3 — Enchantment timing
- F4 — Enchantment scoring override rationale
- F5 — game-end procedure / seat-order fairness
- F6 — wild scope and maximum spell size
- F8 — Ascension Trials status
- F10 — 2–4p core vs 5–6p Echo sequencing/scope
- F14 — card export / print regeneration timing

It also adds rulings for Source-emptying timing and the current Unlimited Capacity question.

This is not yet canonical rules text until each item is propagated into the relevant `meta/decisions/` file and implementation checklist.

---

## Executive decision summary

| ID | Updated decision | Status |
|---|---|---|
| F3 | Enchantment gains apply next turn. Losses should apply immediately if this can be expressed cleanly without retroactive bookkeeping. | Principle decided; wording pending F1. |
| F4 | Keep 12/18 Enchantment scoring for now. Record rationale, but confirm during playtests. | Decided-in-effect; add playtest watch. |
| F5 | Keep immediate end for now. Seat-order unfairness is not automatically a problem; test the worst-case player/card configuration before changing the rule. | Not fully closed; playtest watch. |
| F6 | Maximum spell/configuration size is 15. Do not extend Conjuration scoring to 16–17. Wild rules still need clean scope/permanence wording. | Principle decided. |
| F8 | Do not park Ascension Trials. Reconcile it enough to support 5–6p Echo testing because some playtesters specifically value this endgame. | Active workstream, but test-functional not polished. |
| F10 | 5–6p Echo is an extension of the base system, not an expansion module. 2–4p and 5–6p Echo should have equal design priority for now. Product packaging remains undecided. | Amended; register framing must change. |
| F14 | No new export/print regeneration. Continue using the existing 5×20 + 4 Print & Bind deck as a flexible prototype. Do not treat that physical deck as current canon. | Decided hold. |

---

# F3 — Enchantment timing

## Decision

Enchantment capacity gains apply from the start of the owner's next turn.

Losses should apply immediately if the wording stays clean:

- If the player has unused learning capacity remaining this turn, reduce that remaining capacity immediately.
- If the player has already used all available learning actions, do not undo any past action.
- The reduced capacity applies normally from the next turn onward.

## Rationale

The design goal is to prevent the known exploit where a player learns an Enchantment and immediately uses the newly gained capacity in the same Learning Phase.

Immediate losses are preferred because they prevent a player from breaking an Enchantment and still benefiting from its capacity for the rest of that turn. However, the rule must not require retroactive action-count auditing.

## Can you break an Enchantment on your last action?

Yes.

If breaking an Enchantment is your final learning action, the capacity loss applies immediately but has no remaining action to reduce this turn. It affects future turns normally. No action already taken is undone.

This is clean and should be allowed.

## Suggested rule wording

Use this as principle text; final wording depends on the F1 counter/gauge decision.

> Capacity gained from an Enchantment becomes available at the start of your next turn. Capacity lost from breaking, reshaping, or unlearning an Enchantment applies immediately. If this reduces your capacity during your Learning Phase, reduce only your remaining learning actions this turn; never undo actions already taken.

## If F1 keeps counters

> When you learn or empower an Enchantment, do not add its counters to your pool immediately. Add them at the start of your next turn. If an Enchantment is broken or unlearned, remove its counters immediately. If you have already spent those counters this Learning Phase, do not undo spent actions; the loss applies to your remaining actions and future turns.

## If F1 moves to Capacity Gauge

> When you learn or empower an Enchantment, update your Capacity Gauge at the start of your next turn. When you break or unlearn an Enchantment, update your Capacity Gauge immediately. If the Gauge drops during Learning, only your remaining actions this turn are reduced.

## Propagation targets

- Rulebook: LEARN / EMPOWER / RESHAPE / UNLEARN sections.
- Rulebook: capacity explanation.
- GLOSSARY: Learn, Enchantment, Capacity.
- Any reference card or player mat.
- `state.js`, after F1 and implementation gate.

---

# F4 — Scoring 12/18 override rationale

## Decision

Keep Enchantment scoring at 6/12/18 for now.

Do not reopen the 15/26 recommendation immediately. Instead, record the rationale for the override and test whether 12/18 feels right in live play.

## Rationale

The previous 26-point recommendation prices 5-card Enchantment mainly by rarity. That risks double-paying Unlimited Capacity, because the player already receives the strongest capacity reward in the game.

Current rationale:

> Enchantment's primary reward is capacity. The 5-component Enchantment already grants Unlimited Capacity, so its Recognition Point value should not also price the full rarity and power of that capacity advantage. The 6/12/18 ladder keeps Enchantments rewarding without making Unlimited Capacity dominate both action economy and final scoring.

## Playtest watch

Track these during 5–6p Echo and AT tests:

- Does a 5-card Enchantment feel under-rewarded at 18?
- Does Unlimited Capacity already feel like enough reward without a higher score?
- Does the player with Unlimited Capacity become the Drought favourite too reliably?
- Do players pursue 5-card Enchantment because it is strategically meaningful, or ignore it because 18 points is too low?

## Suggested annotation for SCORING_REBALANCE.md

> Later canon retained 6/12/18 rather than this file's 15/26 recommendation. The override is intentional: Unlimited Capacity is already the main reward for a 5-component Enchantment, and a 26-point value risks double-paying the same advantage. This remains a live-play watch item rather than a settled balance proof.

## Propagation targets

- `simulation/SCORING_REBALANCE.md` header note.
- Echo decision file or new scoring decision file.
- Decision Register F4 entry.
- Playtest observation sheet.

---

# F5 — Game-end procedure and seat-order fairness

## Decision

Keep the current immediate-end procedure for now.

Do not change to finish-the-round solely because of theoretical seat-order unfairness. Seat-order unfairness can generally be ignored unless a specific player count or deck configuration creates a low average number of turns and players experience the ending as unfair.

## Current working rule

> When the Released Reserve is depleted, the contest immediately ends. Proceed to final evaluation.

## Rationale

Finish-the-round is cleaner from a fairness perspective, but it may be unnecessary overhead. If the number of pre-Drought and post-Drought turns is high enough, the seat-order edge may be negligible or unfelt.

The real issue is not abstract fairness. The issue is whether the lowest-turn configurations produce an ending that feels arbitrary or seat-order-biased.

## Playtest requirement

Test the worst-case player/card configuration before changing this rule.

Likely worst case:

- 6 players.
- Echo deck.
- Ascension Trials active or available.
- Current Source / Released Reserve structure.
- Track pre-Drought turns and Drought turns per player.

## Playtest watch

Record:

- Number of turns each player receives before the Drought.
- Number of Drought turns each player receives.
- Which player triggers the end.
- Whether players notice or complain about seat-order advantage.
- Whether any player says they were denied a meaningful final turn.
- Whether the final result plausibly changes if the round were finished.

## Decision threshold

Keep immediate end if:

- Players do not notice seat-order unfairness.
- The final turn difference does not feel decisive.
- Immediate end improves tension and simplicity.

Reopen finish-the-round if:

- Multiple players identify the end as unfair.
- A player loses because they were denied an obvious final learning turn.
- 5–6p produces very low average total turns.
- Ascension Trials makes the final missing turn feel too consequential.

## Alternative wording if changed later

> When the Released Reserve is depleted, finish the current round so each player has had the same number of turns. Then proceed to final evaluation.

Do not adopt this yet.

## Propagation targets

- Rulebook: End of the Drought.
- `simulation/ASSUMPTIONS.md` note.
- `state.js`, later.
- Playtest observation sheet.

---

# F6 — Wild scope and maximum spell size

## Decision

Maximum spell/configuration size is 15.

Do not extend Conjuration scoring to 16 or 17. Wilds may substitute inside valid configurations, but they do not allow a spell to exceed the maximum rank span of 1–15.

The score table remains capped at 15.

## Rationale

The earlier suggestion to extend Conjuration to 17 solves an edge case, but it creates unnecessary table expansion and contradicts the cleaner design principle that configuration size is capped by the rank structure.

The game uses ranks 1–15. A spell should not become size 16–17 by appending wilds beyond the natural maximum configuration.

## Required ruling: wild declaration scope

The remaining F6 issue is not score extension. It is wild declaration scope and permanence.

Current intended direction:

- Wild declaration applies to all spell types, not only Enchantments.
- A wild is declared when it becomes part of a learned spell.
- The declaration is fixed while that spell exists.
- Empowering a spell does not let you redeclare existing wilds.
- If the spell is dissolved and later rebuilt, wilds are declared again as part of the new spell.
- A wild may only be declared as an energy present in the current deck.
- A wild cannot represent an extra unavailable energy to create a 5-component Enchantment in a 2–4p game.

## Suggested rule wording

Move this rule to the Components or Wild Cards section, not inside Enchantment only.

> When a wild becomes part of a learned spell, declare which energy and value it represents for that spell. That declaration remains fixed while the spell exists. Existing wilds are not redeclared when the spell is empowered. If the spell is dissolved and rebuilt later, declare its wilds again as part of the new spell. A wild may only be declared as an energy present in the current deck, and no spell may exceed 15 components.

## Spell-type examples

### Conjuration example

> A wild in a Conjuration may be declared as Radiance 11 to count as one Radiance component. It helps satisfy the same-energy requirement, but the Conjuration still cannot exceed 15 components.

### Transfiguration example

> A wild in a Transfiguration may be declared as any missing value and energy needed to complete the sequence, such as Flux 8 in a 6–7–9 run. Once declared, it remains that component while the spell exists.

### Enchantment example

> A wild in an Enchantment may be declared as one energy present in the current deck. In a 2–4p game, it cannot become a fifth energy, so a 5-component Enchantment is impossible.

### Perfect Transmutation example

> A wild in a Perfect Transmutation may be declared as the missing value of the same energy, such as Aether 10 in an Aether 8–9–11 sequence. Once declared, it remains fixed while the spell exists.

## Propagation targets

- Rulebook: Components / Wild Cards section.
- Rulebook: remove or replace Enchantment-only wild rule.
- Rulebook: add one example per spell type.
- Scoring System Reference: confirm max size 15.
- Web reference / player reference.

---

# Unlimited Capacity availability

## Current answer

Unlimited Capacity is only available in 5–6p games under the current intended wild-declaration rule.

## Why

A 5-component Enchantment requires five matching values across five distinct legal energies.

- In 2–4p, the deck has four energies: Radiance, Void, Flux, Aether.
- A wild may only be declared as an energy present in the deck.
- Therefore a wild cannot pretend to be a fifth unavailable energy.
- A 2–4p game can reach 4-component Enchantments, but not 5-component Enchantments.
- Echo supplies the fifth energy in 5–6p games, making 5-component Enchantments and Unlimited Capacity possible.

## Open design question

This should be questioned during playtests, not assumed permanently correct.

The current structure means Unlimited Capacity is not a universal summit of the base game. It is a 5–6p/Echo-only achievement. That may be correct if Echo is an extension that deliberately unlocks higher-capacity play. But it should be watched because:

- 2–4p players may expect the ladder's top tier to be reachable.
- The 2–4p game may feel capped at 4-card Enchantment.
- The 5–6p Echo game may feel like it contains a qualitatively different capacity endpoint.
- AT may interact strongly with whether Unlimited Capacity exists.

## Current ruling

Keep Unlimited Capacity as 5–6p-only for now.

## Required rulebook cleanup

Any rulebook example that shows a 2–4p player progressing to a 5-card Enchantment or Unlimited Capacity is stale and should be deleted or clearly marked as 5–6p only.

## Suggested wording

> In 2–4p games, only four energies exist, so Enchantments can contain at most four matching-value components. In 5–6p games, Echo adds a fifth energy, making 5-component Enchantments and Unlimited Capacity possible.

Alternative if you want this to feel intentional rather than technical:

> Unlimited Capacity is an Echo-extension achievement. It exists only in 5–6p games, where the fifth energy makes complete fivefold internalisation possible.

## Playtest watch

Record:

- Do 2–4p players notice that Unlimited Capacity is unreachable?
- Do they feel denied a promised top tier?
- Do 5–6p players understand that Echo enables the fifth Enchantment component?
- Does AT over-reward or under-reward 5–6p players with access to Unlimited Capacity?

---

# Source-emptying timing mid-turn

## Decision needed

The rulebook needs an explicit timing rule for what happens if the Source empties during Collection, Conjuration, Transfiguration replacement, or Perfect Transmutation.

## Recommended principle

Complete the current atomic action, then trigger the Drought immediately. Do not allow additional spell casts after the Source has emptied.

## Suggested master timing rule

> If a draw from the Source or a replacement from the Source empties it, complete the current Collection choice or spell effect. Then immediately begin the Drought. The active player skips any remaining Casting and continues with Learning under Drought rules.

## Why this works

This avoids interrupting a half-resolved spell while still making the Drought immediate and dramatic. It also prevents players from casting additional spells after the infrastructure has collapsed.

## Spell-specific rulings

### Collection from Source

If a player draws the final card from the Source during Collection:

1. They take that card into hand.
2. The Source is empty.
3. The Drought begins immediately.
4. The player skips Casting and proceeds to Learning under Drought rules.

Suggested wording:

> If your Collection draw empties the Source, take the card, then immediately begin the Drought. You do not take a Casting Phase this turn.

### Taking from the Array during Collection

If a player takes from the Array and the replacement card empties the Source:

1. They take the chosen Array card.
2. Replace the Array slot with the final Source card.
3. The Source is empty.
4. The Drought begins immediately.
5. The player skips Casting and proceeds to Learning under Drought rules.

Suggested wording:

> If replacing an Array card empties the Source, complete the replacement, then immediately begin the Drought. You do not take a Casting Phase this turn.

### Conjuration

Conjuration should only be cast if its full draw can be completed.

If the Source contains fewer cards than the Conjuration would draw, the Conjuration cannot be cast.

If the Conjuration draws the final card exactly:

1. Draw the full bonus.
2. The Source is empty.
3. The Drought begins immediately after the Conjuration resolves.
4. No further spells may be cast this turn.
5. Proceed to Learning under Drought rules.

Suggested wording:

> You may cast a Conjuration only if the Source contains enough cards for its full draw effect. If that draw empties the Source, finish drawing, then immediately begin the Drought. You may not cast further spells this turn.

### Transfiguration

Transfiguration uses the Array, not the Source directly, but replacement uses the Source.

If the Source is already empty, the Array has collapsed and Transfiguration cannot be cast.

If replacing the claimed Array card empties the Source:

1. Complete the discard/take exchange.
2. Replace the Array card from the Source.
3. The Source is empty.
4. The Drought begins immediately.
5. No further spells may be cast this turn.
6. Proceed to Learning under Drought rules.

Suggested wording:

> You may cast a Transfiguration while the Array exists. If its Array replacement empties the Source, complete the exchange and replacement, then immediately begin the Drought. You may not cast further spells this turn.

### Perfect Transmutation

Perfect Transmutation has both Conjuration and Transfiguration effects, and both are mandatory.

It can only be cast if both parts can fully resolve:

- The Source must contain enough cards for the full Conjuration draw.
- The player must be able to complete the Array exchange.
- The Source must contain a card if the Array will need replacement after the exchange, unless a later rule explicitly allows an unreplaced final Array slot. Current recommendation: require full replacement.

If Perfect Transmutation empties the Source during its Conjuration draw, the Array portion cannot cleanly resolve afterward. Therefore, under the cleanest rule, the PT is not legal unless the Source has enough cards to complete both the draw and any needed Array replacement.

Suggested wording:

> You may cast a Perfect Transmutation only if you can fully resolve both mandatory effects: the Conjuration draw and the Transfiguration exchange, including any required Array replacement. If resolving the Perfect Transmutation empties the Source, complete the full spell, then immediately begin the Drought. You may not cast further spells this turn.

## Direct answer to the rules question

Can you cast Transfiguration or Perfect Transmutation on the Array but not Conjuration once the Source is empty?

No.

Once the Source is empty, the Drought begins and the Array collapses into the Released Reserve. There is no separate window where the Source is empty but the Array still exists for new Transfiguration or Perfect Transmutation casts.

However, Transfiguration can be the action that empties the Source via Array replacement. In that case, complete the Transfiguration, then begin the Drought.

Perfect Transmutation should not be allowed to partially resolve. If it cannot complete both mandatory effects, including Source draws and Array replacement, it cannot be cast.

## Edge case: Source has cards for draw but not replacement

Example: A Perfect Transmutation requires drawing 1 from Source and then replacing 1 Array card, but the Source has only 1 card left.

Recommended ruling: the PT cannot be cast, because both effects are mandatory and the spell cannot fully resolve.

Alternative ruling, not recommended unless you want more drama:

> A spell may empty the Source during resolution; if an Array replacement cannot be completed because the Source is empty, leave the Array incomplete, then immediately collapse it into the Released Reserve.

This creates more exceptions and should be avoided unless playtest drama outweighs rules cleanliness.

---

# F8 — Ascension Trials status

## Decision

Do not park Ascension Trials.

Ascension Trials should continue as an active workstream because some playtesters specifically like the game because of this mechanic, and 5–6p Echo testing is incomplete if the preferred/advanced endgame cannot run.

## Boundary

The goal is not polish. The goal is test-functional reconciliation.

AT should be updated enough to support current 5–6p Echo tests without turning into a full expansion-development branch.

## Required minimum fixes

Before 5–6p Echo + AT testing, AT needs:

1. Echo Power added as a fifth energy domain.
2. 7p support removed, hidden, or explicitly marked stale.
3. 6p reward splits defined if 6p AT is being tested.
4. Energy terminology aligned with the current game.
5. A clear ruling on whether Complete Mastery is 5p only, 5–6p, or all Echo games.
6. Confirmation that wild magic and 4-component Enchantment bonuses still behave correctly under the current ladder.
7. Compatibility note for Unlimited Capacity being 5–6p-only.

## Suggested file annotation

Add near the top of `Ascension Trials.md`:

> Status note: Ascension Trials is an active advanced endgame under reconciliation for the current 2–6p / Echo ruleset. Some older 5–7p language and reward tables may be stale until the reconciliation pass is complete. Use only the reconciled test notes for live Echo playtests.

## Suggested Echo domain addition

> Echo Power: Echo Conjuration spell lengths, using the standard power formula.

## Complete Mastery question

Current likely ruling:

> Complete Mastery is available in Echo games only. It requires at least one energy domain, Transformation Power, and Enchantment Power.

Open question:

Should Complete Mastery be:

- 5p only, as current table implies?
- 5–6p only, as the Echo extension implies?
- Any player count, if the trial is redesigned away from player count?

Do not silently decide this inside a cleanup pass. It is an AT-specific decision.

## Propagation targets

- `rulebook/Ascension Trials.md`.
- Any AT web app/tool.
- Playtest kit.
- Decision Register F8.

---

# F10 — Product scope and Echo framing

## Decision

5–6p Echo is an extension of the base system, not an expansion module.

2–4p and 5–6p Echo should have equal design priority for now.

Product packaging remains undecided:

- Echo may be included in the base game.
- Echo may be packaged separately later.
- That is a product/manufacturing decision, not a design-priority decision yet.

## Terminology

Use **extension**, not expansion, for Echo.

Meaning:

- Echo extends the base game's player-count and capacity structure.
- Echo is not a thematic optional module like a later expansion.
- Echo should be tested as part of the core system's viability.

## Amended register wording

Replace any framing that says or implies “2–4p core first, Echo expansion later” with:

> The 2–4p game and 5–6p Echo extension are both current-priority expressions of the base system. Echo remains experimentally unconfirmed, but it is not demoted to expansion status. The next tests should be sequenced to avoid contaminating Echo results with unresolved counter/capacity confusion, not because 5–6p is lower priority.

## Sequencing implication

F1 still contaminates F2 because Echo confirmation criteria include counter comprehension. Therefore:

- Do not claim Echo is confirmed while F1 is unresolved.
- Do not demote Echo while F1 is unresolved.
- Run the counter/capacity test in the cleanest useful environment.
- Then run 5–6p Echo + AT with the chosen or leading F1 model.

## Suggested next-session structure

Option 1 — if only one session is available:

1. Run F1 counter/capacity test at 3–4p.
2. Use the result to choose whether text-only is viable or a structural variant is needed.
3. Do not test Echo in the same sitting unless the group/time genuinely supports it.

Option 2 — if a 5–6p group is available and AT is a key draw:

1. Run a 5–6p Echo + AT session.
2. Treat the result as mixed evidence because F1 is unresolved.
3. Record counter confusion separately from Echo/AT appeal.
4. Do not use this alone to canonize or kill Echo.

Best sequence:

1. F1 comprehension/structure test.
2. 5–6p Echo + AT test.
3. Compare whether both count bands deliver the same product promise.

## Propagation targets

- Decision Register F10.
- Master Plan product-scope language.
- Kiro handoff anti-drift wording.
- QUEUE sequencing notes.

---

# F14 — Card export and printed deck timing

## Decision

Do not regenerate exports or order new prints.

Continue using the existing 5×20 + 4 Print & Bind deck as a flexible prototype deck. There are no plans to change this physical deck in the near future.

## Important distinction

The printed deck is a practical prototype asset, not canon.

Current canon may be 4×15 + wilds for 2–4p and 5×15 + wilds for 5–6p, but the existing 5×20 + 4 deck can still support testing by excluding unused cards.

## Suggested register wording

> F14 is closed as HOLD for new export/print work. Existing physical prototype deck remains in use. No new export regeneration should occur until the relevant rules text, Echo status, AT needs, and visual requirements are stable. Existing oversized P&B deck may be used as a component pool and must not be interpreted as current deck canon.

## Allowed

- Use the existing P&B deck.
- Pull only the required cards for the current test.
- Create temporary paper inserts, player mats, reference cards, or AT sheets.
- Create clearly labelled non-canon test aids.

## Not allowed

- Regenerating `export-cs3/` as if current rules are final.
- Regenerating `export-printenbind/` for a new print run.
- Treating 5×20 + 4 as canon because it exists physically.
- Updating card text that depends on F1/F3/F6/F8/F10 without decision-file propagation.

## Propagation targets

- Decision Register F14.
- Kiro handoff anti-drift rules.
- QUEUE card export tasks.
- Card-design thread `next` status.

---

# Register update checklist

Update `DECISION_REGISTER_2026-07.md` as follows:

## F3

- Status: principle decided; implementation wording gated by F1.
- Decision: gains next turn; losses immediate where clean.
- Add last-action clarification.

## F4

- Status: decided-in-effect; playtest watch.
- Decision: keep 12/18.
- Add rationale annotation requirement.

## F5

- Status: open as playtest watch, not SAM-NOW closed.
- Current rule: immediate end.
- Add worst-case player-count test requirement.

## F6

- Status: principle decided.
- Decision: max size 15; no Conjuration 16–17 scores.
- Remaining issue: wild scope/permanence wording.

## F8

- Status: active, not parked.
- Decision: reconcile AT enough for Echo testing.
- Add test-functional boundary.

## F10

- Status: amended.
- Decision: Echo is extension, not expansion; equal priority with 2–4p.
- Packaging undecided.

## F14

- Status: closed as hold.
- Decision: no new exports/prints; existing 5×20 + 4 P&B deck remains prototype deck.

---

# Kiro-safe implementation note

Kiro may update process documents and prepare test artifacts, but should not silently convert this addendum into canon rules without decision files.

Safe Kiro tasks after Sam approval:

1. Add/update decision-file stubs for F3/F4/F5/F6/F8/F10/F14.
2. Annotate `SCORING_REBALANCE.md` for F4.
3. Update Decision Register statuses.
4. Create AT reconciliation checklist, not full rewrite, unless Sam explicitly asks.
5. Create Source-emptying rules note as a proposed rulebook patch.
6. Create non-canon test sheets for F1, Echo, and AT.

Blocked until explicit decision/proper gate:

- Rulebook counter/capacity rewrite beyond F3 principle.
- Export regeneration.
- New print files.
- `state.js` changes.
- Silent AT overhaul.
- Silent Echo canonization or demotion.

---

# Open questions remaining

These are not resolved by this addendum:

1. F1 — counter/capacity structure: text-only, Capacity Gauge, round-trip, or other.
2. F2 — Echo confirm/kill from live 5–6p evidence.
3. F12 — partial Unlearn.
4. AT reward table for 6p.
5. Complete Mastery availability.
6. Whether Unlimited Capacity being 5–6p-only feels correct after playtests.
7. Whether immediate end creates felt unfairness in low-turn configurations.
8. Whether Source-emptying timing should allow partial Array replacement drama or require full spell resolution only.
