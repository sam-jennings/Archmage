# Two-Version Proposal — One Rule Set, Setup-Only Differences (v2)
*Written 2026-07-02, revised same day after Sam's review. Companion to FIFTH_SUIT_ANALYSIS.md. Resolves: 2p UC-too-easy, 5p enchantments-too-hard, with fixed enchantment effects and spell scores across versions. The fifth energy is **Echo** (see `VISUAL_SYSTEM_with_Echo.md`).*

## The core insight

Unlimited Capacity becomes the **5-card enchantment tier**, and the deck decides whether that tier exists. A 4-energy deck cannot produce a 5-card enchantment, so UC is unreachable at low counts without any conditional rules text. The deck config is the balance knob; the rules never change.

## Fixed rules (identical in both versions)

| Enchantment | Effect | Score |
|---|---|---|
| 3 cards | +1 counter | 6 |
| 4 cards | **+2 counters** (was: Unlimited) | **12** (was 15) |
| 5 cards | **Unlimited Capacity** | **18** |

**Wild rule (closes the v1 loophole — Sam's key concern):** the enchantment definition itself carries the ceiling:

> **An enchantment is 3 or more cards of the same value — at most one per energy in play.** A wild must be declared as one of the energies in play.

In Version A a wild must be Radiance, Void, Flux, or Aether; a 5th card has no energy left to be, so 5-card enchantments are illegal with or without wilds. This kills both halves of the problem: the *legality* (no phantom fifth energy), and the *knowledge asymmetry* (a B-experienced player who instinctively tries wild-as-Echo at an A table finds the printed rule exactly where they'll look — the enchantment definition — while an A-only player loses nothing by never conceiving of it). One fixed sentence produces max 4 in A and max 5 in B with zero version-specific text. **Placement matters: this must sit in the enchantment definition, not a wilds appendix.**

## Deck structure decision: which axis varies?

Sam rejected v1's B-deck (5×1–16) because switching removed an energy AND a value band. Two clean alternatives were analysed:

### Option 1 — 5 energies at all counts, vary max value (A: 5×1–12+2w = 62, B: 5×1–16+4w = 84)

*Pros:* one energy roster everywhere; Echo art always in play; switching is values-only; both deck sizes match today's exactly (pacing untouched).

*Cons — two are disqualifying:*
- **Reintroduces the 2p problem it was meant to fix.** UC (5-card) exists at all counts. At 2p (~20 personal draws), final-card completion holding four energies = **75%** — and the 12-rank deck makes matching-value pairs routine (opening pair 0.84 vs 0.73 today). 2p games would again nearly always end with UC in the Drought.
- **Perturbs the counts that currently feel balanced.** Suit dilution hits 2–4p: P(3+ of one energy in opening 7) drops 0.82 → 0.63, making conjurations/PT noticeably harder in the game Sam reports as working. Rank compression (12 values) also shifts transfiguration/enchantment density. Every number at 2–4p moves.

### Option 2 — 4 energies at 2–4p, 5 energies at 5–6p, same max value 1–15 (A: 4×1–15+2w = 62 unchanged, B: 5×1–15+4w = 79) ✅ RECOMMENDED

*Pros:*
- **The 2–4p deck is literally today's deck.** Zero regression risk at the counts that feel balanced — only the 4-card effect changes (UC → +2), which is exactly Sam's 2p instinct.
- **Clean switch:** version B = version A + the Echo suit (1–15) + 2 wilds. One modular add — cleaner than today's B (which adds a value band), and a natural product story (Echo pack for big tables).
- **UC exists only where it's earned.** The 5-card (all five energies incl. Echo) final-card completion runs ~0.46 @8 draws — essentially identical to today's 4-card at 5p, the difficulty Session 3 showed to be rare (2/5 players managed *any* enchantment). Plus the 3-/4-card tiers get easier at 5–6p (opening pair 0.60 → 0.75), fixing uptake.
- **Same max value everywhere:** scoring table, sequence lengths, PT sizes all identical across versions.
- **Wild loophole self-resolves thematically:** Echo isn't in the small game, so nothing can echo it.

*Cons (accepted):*
- Suit dilution at 5–6p only: P(3+ one energy) 0.83 → 0.64 — conjurations/PT harder in B. Watch conjuration viability in the rig; any score buff must be global and re-checked at 2–4p.
- Pacing dips slightly in B: 6.8 turns/player @5p (vs 7.8 today), 4.3 @6p. Given the 5p complaint was downtime frustration, slightly shorter is arguably a feature. If the rig says it's too tight, **5×15+6 wilds = 81** restores 7.2 @5p (more wilds also help enchantment chase).
- Two suit rosters in the box — but the box already ships two deck configs today.

### Recommendation (provisional — Sam has decided to rig-test BOTH options before choosing; see BACKLOG.md P1)

**Option 2 on the analysis.** Option 1's analytical weaknesses: it re-arms UC at 2p (75% completion odds) and destabilises the 2–4p balance Sam wants preserved. Option 2 changes nothing at 2–4p except the intended fix, and makes Echo itself the high-player-count lever — which is also exactly what the Session 3 player proposed.

## The two versions

**Version A — 2–4 players:** 4 energies × 1–15 + 2 wilds = 62 (unchanged). Start 1 counter. Max enchantment 4 cards (+2); no UC.

**Version B — 5–6 players:** 5 energies (adds **Echo**) × 1–15 + 4 wilds = 79. Start **2 counters**. 5-card enchantment (all five energies) grants UC — rare and earned. 7p dropped (needs 94+ cards, which inflates 5p pacing 26%+; per Sam, 7p goes if it costs lower counts).

## Thematic note

The fifth energy is **Echo**. Unlimited Capacity is achieved by uniting all five energies of one frequency — the value resonating across every energy including its Echo fits the resonance lore, and the mechanic's climax lands only in the version where Echo exists.

## Open tunables (rig questions)

1. **4-card: +2 or +3?** Sam's instinct +3; Opus's Drought-tension analysis favours totals of 3 actions (start 1 + +2 at 2–4p). Default +2, rig-test +3.
2. **5-card score:** 18 default (6/12/18 line; must beat PT-5's 14). Tunable.
3. **B wild count:** 4 vs 6 (pacing/chase lever).
4. **Conjuration viability in B** (suit dilution) — the main watch item.
5. **3–4p regression check:** 4-card UC → +2 touches 3–4p too; evidence only implicates 2p. Track 4-card frequency at 3–4p in the rig.

## Relationship to the current test cycle

Start-2 becomes Version B setup. The Drought cap becomes unnecessary (no UC in A; rare, earned UC in B). Partial unlearn remains independently valuable — test it. "First enchantment costs 0" is superseded. Round-trip counters are orthogonal and unaffected.
