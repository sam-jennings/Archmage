# Player Interaction and Scale

## TL;DR
- Two-player games offer intense focus and skill-proof victory but risk snowball effects and personal defeat discouragement
- Downtime is the #1 factor in multiplayer enjoyment; solve with interlaced turns and active engagement during others' turns
- Direct interaction (attack each other) creates drama and agency but enables ganging up and kingmaking; indirect interaction (control your destiny) enables multiplayer solitaire
- Five keys to cooperative games: Spinning Plates (more to do than time), Thematic Help, Individual Importance, Team Strategy + Individual Agency, Difficulty Scaling (target 40% win rate)
- Quarterbacking (one player solves for everyone) solved by hidden information, randomness, or limited communication rules
- Solo gaming is growing segment; co-op games work solo with minimal changes; competitive games need scoring targets or automated opponents
- Start playtesting at 2 players, expand to target count only after validation

## Core Concepts

- **Downtime** — The gap between a player's turns, especially in multiplayer. It's the #1 factor in multiplayer enjoyment. Solved by interlacing turn steps across all players or creating active engagement during others' turns.

- **Game State Volatility** — How much can change while you wait. High volatility (everything shifts) means players abandon planning. Low volatility (your strategy still matters) keeps engagement high.

- **Direct vs. Indirect Interaction** — Direct: attack/sabotage each other (drama, agency, personal targeting, ganging up). Indirect: affect each other through shared resources (control your fate, multiplayer solitaire risk).

- **Quarterbacking** — One dominant player solves optimal strategy and commands others, destroying agency. Hidden information, randomness, or communication rules prevent it.

- **Spinning Plates** — Cooperative gameplay tension where there's always more to do than time/resources to do it. Creates engagement without competitive pressure.

- **Difficulty Scaling** — Cooperative game challenge adjusted for player skill. Target win rate: 40% (less than half chance to win keeps tension).

## Design Principles

- If multiplayer downtime feels excessive → use interlaced turns or add active engagement opportunities, not additional mechanics
- If one player dominates cooperative decision-making → add hidden information, randomness, or communication restrictions
- If two-player game feels broken → fix at 2 players before scaling to 4+
- If you can't fit the experience at target player count → push back on publisher pressure, don't sacrifice experience
- Avoid game state volatility between turns — players need confidence their planning matters
- Prioritise consistency feedback over contradictory feedback — one group loves direct conflict, another hates it is less actionable
- For cooperative games, design solo first, then expand multiplayer

## Heuristics (Fast Decision Rules)

- Start playtesting at 2 players, validate core experience, then scale to target
- Interlaced turns (all do step 1, all do step 2) reduce downtime better than sequential turns
- Phone-checking during others' turns = engagement problem, not fun problem
- If one player is solving for the group → hidden information or randomness needed
- Cooperative win ratio target: 40% (45-50% feels too easy; 30% feels too hard)
- Solo gaming: co-op games work solo with minimal changes; competitive games need scoring targets or automated opponents
- Communication restrictions: ask "If I was trying to break this, what would I say?" to identify what to forbid

## Design Frameworks

**Player Count Testing Framework**:
1. Validate core experience at 2 players
2. Identify what needs scaling (resource counts, enemy activation, round triggers)
3. Test at target player count
4. Address downtime/engagement through turn structure or active opportunities
5. Iterate on scaling adjustments

**Two-Player vs. Multiplayer Trade-off**:
- Two-player: Intense, skill-proof, personal victory vs. snowball effect, skill-based outcomes, personal defeat
- Multiplayer scaling: Track enemy/resource scaling needs; fix downtime with interlaced turns or active engagement

**Direct vs. Indirect Interaction Decision**:
- Direct interaction: Theme suggests conflict (grimdark war) → test politics, targeting, drama
- Indirect interaction: Theme suggests competition without direct sabotage → test multiplayer solitaire risk
- Optional variants (if needed): limit to 2-3 maximum; test thoroughly; make preferred version the core game

**Five Keys to Cooperative Games**:
1. Spinning Plates: More to do than time/resources (create juggling tension)
2. Thematic Help Between Players: Special abilities complement each other; limited card sharing ("once per turn")
3. Individual Importance: Each player gets spotlight moments; contributions recognized at end
4. Team Strategy + Individual Agency: Discuss strategy together; individuals make own decisions
5. Difficulty Scaling: Offer novice/standard/expert modes; target 40% win rate; adjust for audience

**Quarterbacking Prevention Framework**:
- Option A: Hidden Information (players can't see each other's hands; dominant player can't command)
- Option B: Randomness (dice/card draws make optimal play uncertain)
- Option C: Limited Communication (restrict what players can reveal about hands/strategy)

**Automated Opponent Deck Framework** (for solo competitive modes):
- Create 5-10 cards per enemy type
- Cards specify enemy actions this turn
- Use theme to guide behavior (sniper moves away then shoots)
- Provides variety + thematic consistency

## Common Pitfalls

- **Scaling without testing**: Designing 5-player experience without validating at 2 or 3 → downtime/engagement issues appear in external testing
- **Publisher pressure overrides experience**: Publishers want higher player counts (more buyers) → compromising experience tanks reputation worse than lower player count
- **High game state volatility**: Too much changes between turns → players abandon planning and check phones
- **Quarterbacking in cooperative games**: One player solves puzzle, commands everyone else → destroys agency for 3 other players; needs hidden information or randomness
- **Kingmaking in direct conflict**: Players who can't win make decisions affecting who does → creates negative emotions and feels unfair
- **Multiplayer solitaire**: Everyone focuses on own tableau without interacting → less engagement despite being "safe" from direct attack
- **Contradictory feedback on interaction style**: One group loves direct conflict, another hates personal targeting → less actionable than consistent feedback; test your preferred version thoroughly

## Connections

- Connects to **Playtesting for Perfection** (Lesson 05): Downtime and engagement issues surface during local playtesting observation; scaling problems emerge when expanding from 2 to target count
- Connects to **Visual Design & Ergonomics** (Lesson 07): Token sizing and readability affect multiplayer experience; visual hierarchy helps quick decision-making in high-interaction games
- Connects to **Art Direction & Illustration** (Lesson 08): Character/faction distinction (visual style) supports direct interaction games; mood boards establish cooperative vs. competitive tone

## Application

**When designing two-player games**: Embrace skill-based outcomes if theme supports it (chess, dueling games). Be aware snowball effects can discourage casual players. Test with both competitive and casual players.

**When scaling to multiplayer**: Start at 2 players. Validate core experience. Identify what scales (resources, enemies, triggers). Test interlaced turn structure. Track player engagement through phone-checking and conversation levels.

**When managing downtime**: Use interlaced turns (all players do phase 1 together, all do phase 2 together) rather than sequential turns. Add engagement opportunities (discussion, decisions to make). Avoid game state volatility that makes planning irrelevant.

**When choosing direct vs. indirect interaction**: Theme guides choice. Grimdark war game = test direct interaction (attack, sabotage, politics). Deep strategy game = test indirect interaction (control fate, avoid multiplayer solitaire). Optional variants possible but limit to 2-3.

**When designing cooperative games**: Build five keys into design: ensure more to do than time (Spinning Plates), create interdependence through special abilities (Thematic Help), give each player spotlight moments (Individual Importance), allow strategy discussion but individual decisions (Team Strategy + Agency), scale difficulty for audience (target 40% win rate).

**When quarterbacking emerges**: Add hidden information (don't show hands), add randomness (dice/draws), or restrict communication ("you can request help but can't command"). Example: Mandalorian Adventures uses hidden hands + limited communication (request help without revealing specifics).

**When designing solo mode for competitive game**: Add scoring target or difficulty milestone (reach 100 points to win). Create automated opponent deck (5-10 cards per enemy type, thematic behavior). Test difficulty by playing multiple times.

**Tradeoff**: Direct interaction creates drama and memorable moments but enables personal conflict and ganging up. Indirect interaction keeps players in control but risks multiplayer solitaire feel. Your theme and player group should guide choice. Both are valid; test your preference.

## Source Notes (Condensed)

- Two-player benefits: intense focus, skill-proof, personal victory. Challenges: snowball effect, skill-based outcomes, personal defeat
- Downtime #1 factor in multiplayer enjoyment; solved by interlaced turns (all do step 1, all do step 2) or active engagement
- Cooperative game win ratio target: 40% (less than half); adjust for audience
- Quarterbacking examples of solutions: The Mind (no talking), Mysterium (ghost can't talk), Space Hulk: Death Angel (Instinct Cards — decide before revealing)
- Mandalorian Adventures: hidden hands + limited communication + individual decisions
- Solo gaming: co-op works solo with minimal changes; competitive needs scoring target or automated opponents
- Automated opponent decks: 5-10 cards per type; thematic behavior (sniper moves away then shoots)
- Design co-op solo first, then expand multiplayer; co-op players come to expect solo mode as selling point
