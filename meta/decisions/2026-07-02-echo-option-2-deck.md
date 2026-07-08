---
title: Adopt Option 2 deck structure (Echo suit at 5–6p only)
type: decision
date: 2026-07-02
status: experiment
thread: capacity-economy
experiment: meta/experiments/echo-option-2/
---

# 2026-07-02 — Adopt Option 2 deck structure (Echo suit at 5–6p only)

**Change:** Of the two deck-structure options in the two-version proposal (archived:
`_archive/TWO_VERSION_PROPOSAL.md`), the solo rig selected **Option 2**: the 2–4
player deck stays exactly as currently played (4 energies × ranks 1–15 + 2 wilds =
62 cards); the 5–6 player deck adds the fifth energy, **Echo** (5 energies × ranks
1–15 + 4 wilds = 79 cards). Enchantment ladder: 3-card = +1 counter (score 6),
4-card = +3 counters (score 12), 5-card = Unlimited Capacity (score 18). The
wild-declaration rule (a wild must be declared as one of the energies currently in
the deck) closes the phantom-fifth-energy loophole at 2–4p. Option 1 (5 energies at
every count, varying max value) was rejected by the rig.

**Why:** Addresses the confirmed structural problem (Sessions 1 & 3): UC too easy at
2p (~75% estimated), enchantment uptake critically low at 5p (2 of 5). Option 2
leaves the 2–4p deck untouched (zero regression risk at counts that already play
well) and makes UC rare and earned via the Echo suit at 5–6p.

**Canon delta (applied to canon.yml):** Echo is the fifth energy (5–6p only);
"Convergence" retired; ladder values as above; deck compositions as above.

**Status: experiment** — rig-chosen, not live-validated. Confirm/kill criteria and
revert kit: `meta/experiments/echo-option-2/RECORD.md`. Open tunables: 5–6p wild
count 4 vs 6; conjuration viability under suit dilution (watch).

## Update 2026-07-03 — tunables settled + starting counters

Sam settled the enchantment tunable and added a starting-counter rule (now
official, written into the rulebook this turn):

- **4-card Enchantment = +3 counters** (resolves the +2-vs-+3 tunable in favour of +3).
- **Starting counters: 5–6 players begin with 2 counters** (2–4 players unchanged at 1).

Scores unchanged (6/12/18). Deck structure (Echo, 79 cards) remains under live
validation — only the counter values and starting-counter rule are locked. Digital
build (`web-apps/archmage-ascension/game/state.js`) still encodes the old
3=+1/4=Unlimited ladder and is out of this decision's propagation scope; queued
separately.

## Propagation

- [x] `rulebook/Archmage Ascension - Complete Rulebook.md` — enchantment ladder (3=+1, 4=+3, 5=Unlimited Capacity); wild-declaration rule moved into the enchantment definition; 5–6p setup/deck composition (Echo, 79 cards) and starting counters (1 at 2–4p, 2 at 5–6p) — done 2026-07-03. Ladder consistent across the definition, "Building Your Capacity", LEARN, RESHAPE, and UNLEARN sections.
- [x] `rulebook/Scoring System Reference.md` — ladder scores 6/12/18 (Enchantment column: 3=6, 4=12 (was 15), 5=18; max-size note updated to 5 components / Echo at 5–6p) — done 2026-07-03
- [x] `rulebook/GLOSSARY.md` — Echo entry (wild-declaration rule bars a phantom fifth energy, so 2–4p caps at 4-component Enchantments; UC only at 5–6p); confirmed no Convergence entry — done 2026-07-03
- [x] `web-apps/archmage-reference.html` — enchantment ladder done 2026-07-03 (Enchantment column + RP data now 6/12/18 at sizes 3/4/5; counter-management, learning-actions, requirements, quick-tips, spell-effect text, and the score-calculator self-test all updated). Size-15+ Perfect Transmutation table extension is NOT part of this ladder work — it stays with its own QUEUE P1 bug (needs a scoring formula for sizes 16+).
- [x] Convergence→Echo purge, card-design core: `lib/cards.js`, `lib/tokens.css`, `art/arcana.js`, `playtable.html`, `playtable-mobile.html`, `VISUAL_SYSTEM.md`; archive stray `art/arcana - Copy.js` — done 2026-07-03. NB: "Convergence" was the wild card's retired flavor name, not the Echo suit; replaced with plain wild wording (label "Wild", flavor "Synthesis of the four currents"), NOT renamed to Echo. Stray Copy moved to `_archive/card-design-art/`.
- [x] Convergence→Echo purge, digital build: `web-apps/archmage-ascension/` (colors_and_type.css, game/cards-ui.jsx, game/state.js, game/lib/cards.js, game/lib/tokens.css, lib/cards.js, lib/tokens.css) and `web-apps/player-reference/colors_and_type.css` — done 2026-07-03. Wild label now "Wild".
- [x] Convergence→Echo purge, planning docs: `web-apps/FABLE_PROMPT_unified_system.md`, `web-apps/REFERENCE_SITE_PLAN.md` — done 2026-07-03. Reworded the "never use Convergence" guardrails to cite "the retired fifth-energy name" so the intent survives without tripping the vocab check.
- [x] `web-apps/player-reference/player-reference.html` (Quick Reference Card) — NOT in the original checklist but carried the full old ladder + old deck; updated to match 2026-07-03 (ladder 6/12/18, +3 counters, 5-6p Echo deck 79 cards, 2-counter start, 1-15 value range, RP data + spell-effect text). Baselined.
- [x] `web-apps/player-reference/player-reference.html` — Set-up section brought in line with Option 2: 2–4p framed as four energies × ranks 1–15 (62 cards), 5–6p as five energies incl. Echo × ranks 1–15 (79 cards), and starting counters (1 at 2–4p, 2 at 5–6p) — done 2026-07-03. (Previously untracked here; the archmage-reference.html item covered only the ladder.) Spell-effect short text (`SPELL_EFFECT_SHORT.enchantment`) corrected to the 3=+1 / 4=+3 counters / 5=Unlimited Capacity ladder — done 2026-07-03 (previously still read 4=Unlimited).
- **(held — F14)** Regenerate card exports after the purge (`card-design/export-cs3/`, `card-design/export-printenbind/`) so generated SVGs/bundles pick up Echo vocabulary — **on HOLD per `meta/decisions/2026-07-06-f14-export-hold.md`** (no export/print regeneration until F1 + F2 close; existing 5×20 + 4 P&B deck used as prototype). Not a pending propagation edit while F14 holds.
