# Lesson 03: Mechanics Deep Dive

## TL;DR
- Mechanics are tools in service of your vision, not design goals; they emerge naturally from desired gameplay
- Both top-down (theme-first) and bottom-up (mechanics-first) design work; choose based on your creative process
- Complexity comes from three sources: number of subsystems, weight of each mechanic, and fiddliness (component tracking)
- Even complex games should be as intuitive as possible; design strategy, not complexity for its own sake
- Price point and complexity align: simple games don't command high prices; complex games must justify cost
- Components directly influence mechanics: dice vs. cards have different properties; sometimes a component inspires entire game
- Player elimination works IF it happens late and game ends soon after (10-minute finale acceptable; 1-hour wait not)
- Pitch mechanics: Roll-to-Move, Lost Progress, Take-That, Player Elimination, Unnatural Game Flow, Duration mismatch

## Core Concepts

- **Top-Down Design (Theme-First)** — Start with theme/emotional experience, mechanics emerge. Example: Battlestar Galactica brainstormed traitor concept, then asked "how do we hide actions?" → face-down card pile mechanic. Preferred by emotion-driven designers; requires confidence in vision before knowing mechanics.

- **Bottom-Up Design (Mechanics-First)** — Start with mechanic/core systems, apply theme later. Example: 3000 Scoundrels began with "split card information across clear + opaque card" mechanic, theme invented afterward (medieval → pirates → western future-tech). Both approaches equally valid; choose what fits your creativity.

- **Traitor Games** — Require BOTH hidden information AND deduction mechanics. Hidden info alone = players just argue. Deduction (seer roles, special abilities) gives players information to reason about. Example: Werewolf hidden roles (hidden info) + seer ability (deduction tool).

- **Component-Mechanic Relationship** — Components don't just express mechanics; they enable/constrain them:
  - **Dice**: Tactile fun, swingy results, limited info (numbers/symbols), expensive custom versions
  - **Cards**: Flexible (write anything), predictable over time (every card used eventually), info-rich, cheap
  - **Tokens in bags**, modular boards, special tools—each enables different mechanics
  - Sometimes component inspires game (Return to Dark Tower obelisk → entire game built around it)

- **Complexity Sources** (three independent axes):
  1. **Subsystem Count** — How many different mechanical systems? (StarCraft: area control, combat, tech trees, diplomacy = 4+ major systems)
  2. **Individual Mechanic Weight** — How heavy is each system? (Trick-taking seems simple but is surprisingly complex to teach)
  3. **Fiddliness** — How many separate piles, tokens, tracking? (Lots of component types = high fiddliness)

- **Complexity-Clarity Tradeoff** — Some mechanics seem simple (trick-taking) but are hard to teach. Some games are intentionally complex (Twilight Imperium 6-8 hour, everyone engaged). The question isn't "is complexity bad?" but "does my complexity match my audience AND clarity?"

- **Novelty Assessment** — Novelty matters but isn't essential. Blizzard doesn't have novel mechanics but dominates video games through execution. Novelty can be the draw, but solid execution of known mechanics succeeds too.

## Design Principles

- If starting with theme → mechanics emerge naturally; trust the vision
- If starting with mechanic → accept that ideal component might not exist; innovate or theme around what you build
- If mechanic doesn't work after many iterations → shelf it; someone else solved it differently or it's genuinely hard
- Avoid complexity for its own sake → design for strategy depth, not mechanical difficulty
- If component doesn't exist → prototype with approximation; solve exact component later if game succeeds
- If mechanics clash with theme → be flexible with mechanics first (many exist); don't force theme to fit mechanics
- If testing mechanics in isolation → recognize they may break when combined; full integration test required
- If rule count climbs → periodically ask "do we need all these?" and remove what doesn't serve core vision
- If game is too long/too short → check whether game reaches its climactic moment; not about absolute duration

## Heuristics (Fast Decision Rules)

- **Rulebook surprise**: If rulebook grew beyond expectations, ask "are all rules necessary?" Bloat usually means unclear core
- **Playtest observation**: If players constantly forget a step or get confused about sequence, turn flow isn't intuitive
- **Component innovation**: If you're inventing a custom component, cost will be high; make sure mechanic absolutely needs it
- **Novelty gauge**: Can you describe your mechanic in one sentence? If it's complex to explain, consider whether novelty or clarity is your goal
- **Variable rule pitfall**: If offering basic + advanced rules, label clearly (e.g., "Game 1 teaches basic rules; advanced players skip here") or expect reviews based on basic-only play
- **Complexity-price alignment**: Does game price match complexity? $30 game shouldn't be as complex as $100 game
- **Player elimination check**: Will players wait < 10 minutes for game to end after elimination? If not, reconsider mechanic

## Design Frameworks

### Mechanic Source Decision Framework
| Starting Point | Process | When to Use | Strengths | Challenges |
|---|---|---|---|---|
| Theme-First (Top-Down) | Vision → Ask "how mechanically achieve this?" → Mechanics emerge | Have strong emotional vision | Natural coherence, thematic alignment | Requires confidence before knowing mechanics |
| Mechanics-First (Bottom-Up) | Core mechanic idea → Theme applied later | Have mechanic you love but no theme | Proven mechanic, creative theming | Theme can feel tacked-on if not careful |
| Component Inspiration | Physical object → Game emerges around it | Component sparks imagination | Novel physical experience | Might be expensive to produce |

### Component Property Comparison
| Property | Dice | Cards | Tokens | Specialty Tools |
|----------|------|-------|--------|-----------------|
| Tactile Fun | High | Medium | Low | Varies |
| Swinginess | High | Moderate | Low | Varies |
| Info Capacity | Low (symbols/numbers only) | High (text, symbols) | Low | High |
| Cost | Moderate (expensive custom) | Low (cheap) | Low | High (custom) |
| Flexibility | Low (fixed range) | Very High | Moderate | High (but expensive) |
| Predictability | Low (each roll independent) | High (every card used eventually) | High | Moderate |

### Complexity Assessment Matrix
| Complexity Source | Low | Medium | High |
|---|---|---|---|
| Subsystems | 1-2 (e.g., bag + card play) | 3-4 (control + combat + economy) | 5+ (StarCraft style) |
| Per-Mechanic Weight | Simple rules, quick resolution | Moderate rules, few exceptions | Heavy rules, many edge cases |
| Fiddliness | 2-3 component types | 5-7 types, some tracking | 10+ types, heavy tracking |
| **Rulebook Pages** | 1-4 | 10-20 | 20-40+ |
| **Play Time vs. Engagement** | All engaged throughout | Downtime acceptable if engaging | Players expect long, stay engaged (Twilight Imperium) |

### Pitfall Mechanics & Mitigation Strategies

| Pitfall | Definition | Problem | Mitigation |
|---------|-----------|---------|-----------|
| **Roll-to-Move** | Move by dice roll (Monopoly) | Players hate randomness controlling positioning | Add control: choose which die, +/- tokens, secondary action |
| **Lost Progress** | Destroy/reset built things (Chutes & Ladders) | Feels terrible; demotivates | Avoid entirely OR make destruction thematic/fun (Cthulhu elder god action) |
| **Take-That** | Single player targeted for damage (full hand discard) | Feels mean; singles out victim; damages experience | Redesign as AoE or player choice about using effect |
| **Player Elimination** | "You're out" during long game | Sitting out for 1+ hour is miserable | Works IF: elimination late, game ends soon after (Cthulhu: last 10 mins), or expected/thematic |
| **Unnatural Game Flow** | Players intuitively want different sequence | Feels clunky; requires reminding | Redesign turn structure; use reference cards; playtest with new players |
| **Duration Mismatch** | Game ends before climax OR drags past it | Unsatisfying arc; players feel cheated | Test whether game reaches peak tension; adjust round count or victory pool size |

### Variable Rule Set Pitfall
**Problem:** Games with "basic" and "advanced" rules often get reviewed based on basic-only play (especially if reviewer stops after Mission 1).

**Mitigation:**
- Label explicitly: "Game 1 teaches basic rules. Advanced players: skip to Advanced Rules section."
- Don't hide advanced rules in appendix; make pathway obvious
- Consider splitting into separate products if variance is large

### Testing Mechanics in Isolation
**Why:** Combat system that plays great alone might drag when in full game with 8 players + other systems.

**How:** Test individual systems separately (e.g., just combat), then full integration.

**Risk:** An elegant isolated system might be too heavy in context.

**Application:** Isolate for initial validation; full-game test required before shipping.

## Common Pitfalls

- **Complexity bloat through playtesting** — Each playtest generates feedback → new mechanic added → game grows. Eventually ask "do we need all these?" Many can be removed. Fix: Regular audits; don't add every suggestion.

- **Mechanics don't cohere when combined** — Combat system works solo; tech tree works solo; together they create 3-hour downtime. Fix: Test in full integration before committing to all subsystems.

- **Novelty assumed to be necessary** — Some designers chase novel mechanics. Execution beats novelty; Blizzard succeeds without innovation. Fix: Focus on strategy depth and clarity over uniqueness.

- **Roll-to-Move in modern game** — If including it, understand why players hate it and provide mitigations (choose which die, action alternatives). Fix: Test with skeptical playtesters; don't assume iconic game = mechanic still works.

- **Player elimination in long game** — Someone dies in hour 3, game continues 1+ more hours. Brutal. Fix: Ensure elimination happens in final phase, or game ends within 10 minutes of elimination.

- **Too much written theme/rules** — Games requiring pages read aloud before each mission break immersion. Fix: Max 2-3 paragraphs per situation; rest should be brief flavor text.

- **Variable rules mislabeled** — "Optional advanced rules" buried in section 7 of rulebook; casual players miss them; reviews based on basic-only play. Fix: Clear pathway ("game 1 = basic, skip to section X for advanced").

## Connections

- **Lesson 01 (Development Pipeline)** — Mechanics emerge during iterative playtesting cycles; first prototype tests whether mechanics work
- **Lesson 02 (Player Experience)** — Complexity sources (subsystems, weight, fiddliness) relate directly to accessibility for different player types
- **Lesson 04 (Theme & Narrative)** — When mechanics clash with theme, be flexible with mechanics; mechanics should serve thematic experience

## Application

**When designing with theme-first approach:**
1. Define emotional vision (Battlestar Galactica: "traitors unknown, paranoia, trust breakdown")
2. Ask "how do we mechanically achieve this?" Not "what mechanic exists for this?"
3. Prototype first mechanic that emerges; test it
4. Iterate until vision + mechanics align
5. Theme should reinforce mechanics' emotional goal

**When designing with mechanics-first approach:**
1. Identify core mechanic you love (split-card information in 3000 Scoundrels)
2. Test it in isolation; does it create interesting decisions?
3. Apply theme that makes mechanic intuitive (western future-tech works because "overlaid information = hidden agendas")
4. Iterate until theme feels integrated, not pasted-on

**Managing complexity for your audience:**
- Family games: Minimize subsystems (1-2), keep mechanics light (simple resolution), low fiddliness (3 component types max)
- Strategic players: Allow multiple subsystems (3-4), heavier mechanics accepted, more fiddliness okay
- Check: Does price match complexity? Does rulebook length match audience expectation?

**Handling pitfall mechanics:**
- **Roll-to-Move**: If using, add control levers (choose die, alternative actions)
- **Lost Progress**: Avoid or make thematically resonant (enemy action, not random event)
- **Take-That**: Redesign as AoE or player-choice mechanic
- **Player Elimination**: Works in final phase (last 10 mins); retest if in mid-game
- **Unnatural Flow**: Playtest with fresh eyes; ask players what they expected to happen next

**Avoiding complexity bloat:**
- Document core mechanics before playtesting (what's essential?)
- After each playtest cycle, ask "did we need that rule/mechanic?"
- Regular pruning; not every feedback = addition

## Source Notes (Condensed)

- Novelty poll: 68% "somewhat important," 13% "very important," 19% "not at all." Conclusion: novelty matters but execution wins; Blizzard example shows non-novel mechanics can dominate
- Traitor game requirement: Battlestar Galactica's face-down card mechanic emerged from "how hide actions?" question; requires deduction tools (Werewolf seer) to function
- 3000 Scoundrels case study: Bottom-up design starting from "split card information" mechanic; clear card over opaque card = random combined effects; theme invented after
- Component prototyping: Lego prototype for hidden information inspired real plastic tool (Wheel of Fortune mechanic)
- Complexity sources clarified: number of subsystems (not same as individual weight), weight per mechanic (trick-taking complexity not obvious), fiddliness (component tracking burden)
- StarCraft design: Action stack system (orders placed in order, resolved backwards) later reused in Forbidden Stars; playtesting with complex games starts small, expands outward
- Player elimination: Cthulhu: Death May Die solved with "elimination only if before finale; finale is last 10 minutes" rule
- Rule bloat: Mandalorian Adventures case study where basic/advanced rules caused reviews based on basic-only play (mission 1)
- Variable rule guidance: Explicit "Game 1 teaches you" + clear pathway to advanced rules section prevents wrong-level play
