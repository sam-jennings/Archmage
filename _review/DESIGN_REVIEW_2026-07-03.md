---
title: Structural Design Review — full diagnosis
type: review
date: 2026-07-03
status: awaiting-decision
sources: rulebook v2.8, canon.yml, 3 playtest logs, 2 Opus analyses, FIFTH_SUIT_ANALYSIS, simulation RESULTS/SCORING_REBALANCE, threads, decisions
---

# Structural Design Review — Archmage Ascension

Role taken: senior developer / skeptical publisher / systems designer. Everything below is grounded in the current project files. Throughout: **[FILE]** = the files say it, **[INFER]** = my inference, **[GAP]** = missing or contradictory.

---

## 1. Current design reconstruction

**Premise [FILE].** The Archmage is gone; ambient magic is depleting. Wizards prove mastery by arranging card components into spell patterns in a personal Spellbook. When the shared Source deck empties (the Drought), casting dies; when the Released Reserve empties, the biggest Spellbook ascends.

**Components [FILE].** 2–4p: 4 energies × ranks 1–15 + 2 wilds = 62 cards. 5–6p: + Echo suit + 4 wilds = 79 cards (under live validation). Counters (capacity), Unlimited Capacity marker, A3 board, 5-card face-up Array, printed reference cards.

**Objective [FILE].** Most Recognition Points from Spellbook spells at final tally. Tiebreak: most spells, then largest spell.

**Turn loop [FILE].** Collection (draw 1 from Source or Array) → Casting (place a counter per cast spell; Conjuration draws, Transfiguration exchanges via Array, Perfect Transmutation both; Enchantments passive) → Recall (pick counters back up) → Learning (counters again: Learn / Empower / Reshape / Unlearn, 1 each). Drought: draw 1 from Released Reserve + Learning only.

**Tension sources [FILE + INFER].** (a) The shared depleting clock — and note the files never state this outright: every Conjuration cast burns the shared Source faster, so the engine that feeds you also hastens the end for everyone [INFER — this is the game's most interesting tension and it is undocumented]. (b) Pattern overlap: the same card is simultaneously a set piece, a run piece, and an enchantment piece. (c) Capacity scarcity: one pool gates both casting and learning.

**Scoring/endgame [FILE].** Superlinear per-type table (Scoring System Reference); Enchantment doubles as the capacity ladder (6/12/18 ↔ +1/+3/UC).

**Intended experience [FILE].** 30–60 min tactical card game; constructive wizard fantasy; "building something, not optimising numbers"; climactic Drought.

### Flags — unclear, contradictory, outdated, missing

1. **[GAP] The rulebook contradicts its own ladder.** The in-file Glossary (Complete Rulebook, "Enchantment" entry) still says "3-4 matching components" — the body says 3–5. The propagation checkbox claims ladder consistency across the file; this entry was missed.
2. **[GAP] LEARN contradicts the intended timing ruling.** Rulebook LEARN: "Immediately gain +1 counter (add to your pool now)." QUEUE P1 says enchantment effects must start NEXT turn to stop counter abuse. The current text codifies the abuse.
3. **[GAP] GLOSSARY.md still teaches the retired elemental model.** "Element: Fire, Water, Earth, Air" and the "aether"/Aether collision — identified in the thematic-coherence brief on 2026-05-07, never fixed, no response ever drafted.
4. **[GAP] The size-15+ score-table bug is stale as framed.** It came from the old 4×20 five-player deck. Under v2.8 (ranks 1–15 everywhere) a Perfect Transmutation cannot exceed 15. Only Conjuration can (15 + wilds = 17 max). The QUEUE item ("formula for sizes 16+") should be reframed: extend Conjuration to 17, close the table, done.
5. **[GAP] Two scoring truths coexist.** SCORING_REBALANCE.md (2026-07-02) concludes "keep 4-card Enchantment = 15, add 5-card = 26 (rarity-priced)". Canon (2026-07-03) is 12/18. No file records why the analysis was overridden.
6. **[GAP] Zero live data on the current game.** All three playtests (May 1–3) predate the ladder, Echo, the 2-counter start, the wild-declaration rule, and the score changes. Every v2.8-defining rule is rig-validated only.
7. **[GAP] Player counts 3, 4, and 6 have never been played.** The sim says 4p is the *thinnest* configuration in the game (4.8 pre-Drought turns/player) — worse than 5p — and it is untested.
8. **[GAP] Ascension Trials still says "5-7 players"** (queued, known).
9. **[GAP] Game-end procedure conflict.** Rulebook: "the contest immediately ends" when the Released Reserve empties — that gives unequal turn counts (seating advantage). The sim models "that player finishes learning, then ends" (ASSUMPTIONS.md). Neither addresses turn parity.

---

## 2. Core identity diagnosis

**What this game really is, mechanically [INFER]:** a rummy-family pattern builder (sets / runs / same-value / suited runs) whose twist is that melds stay live as engine pieces, played against a *shared, player-accelerated* doomsday clock. The real currency is not cards or counters — it is **turns remaining**, and players collectively spend them every time a Conjuration fires.

**True core tension:** commit-vs-flexibility on each card (which pattern does this 7 join?) under a clock the players themselves are burning. The Drought is the payoff of that tension: your engine dies and only the monument remains.

**Strongest player fantasy:** "spending the world's last magic to build proof of mastery before the lights go out." Session 1's best moment — the size-15 Perfect Transmutation — is exactly this fantasy landing [FILE].

**Primary decision loop:** draw → slot the card into one of 3–4 competing patterns → decide whether casting (accelerating the end) or learning (building the monument) matters more this turn.

**Who it serves best [FILE + INFER]:** deliberate efficiency-puzzle players at 2–3p. The files' own target ("strategy gamers, 30–60 min, constructing something") matches this. It does *not* currently serve the 5-player social table it keeps being tested on: at 5–6p each player gets ~4–5.5 pre-Drought turns [FILE: RESULTS.md] — nobody constructs anything in four turns.

**What reinforces the identity:** the Spellbook tableau as visible monument; the pattern-overlap card decisions; the Drought phase change; Enchantment as the against-the-grain internal path; conjuration's clock-burning [INFER, undocumented].

**What dilutes it:**

- The **counter choreography** (dual-use pool + mid-turn Recall). Three analyses and two sessions agree it fights every mental model players import [FILE: OPUS counter response]. It is the single largest source of confusion and it is not the source of any fun.
- **Reshape** — unbounded full-tableau rebuild as one action. AP bomb, unenforceable, and it cheapens commitment, which is the core tension [INFER].
- **Ascension Trials** — a second game (power formulas, domains, secret allocation) bolted onto a base game that can't yet teach its own counter rule.
- **Scoring opacity** — a 13×4 lookup table means players optimise numbers they can't see, which is precisely the "optimising numbers" feeling the project brief rejects [FILE: PROJECT.md].
- **The two-deck structure** [INFER, publisher hat]: a 79-card second SKU config whose sole structural job is making one achievement (UC) reachable at two player counts.

---

## 3. System red-team

### CRITICAL

**C1. The capacity system is structurally broken and the two live fixes point in opposite directions.**
Why it matters: capacity gates the only capacity-growth path (bootstrap loop) and is the #1 comprehension failure — this is both the economy problem and the teaching problem [FILE: Sessions 1 & 3, both Opus analyses]. Symptom: 2/5 enchantment uptake; Sam himself needing a 2-turn workaround; confusion surviving three written surfaces. Root cause: one token pool doing two jobs with a mid-turn retrieval, and the reward for growing it priced against an unbounded payoff. The cleanest fix: **decouple the physical tokens from the concept** — Capacity Gauge, 3-phase turn, Recall deleted (OPUS counter response, Option A). The queued round-trip redesign goes the *other* way: it deepens token choreography (placement = cast, pickup = learning payment) and adds a new coupling (cast fewer spells → fewer learning actions?) that the files never specify [GAP]. You cannot adopt both. This fork is the most important open decision in the project and it is currently split across two P1 QUEUE items that don't reference each other as alternatives.

**C2. Pacing does not deliver the fantasy at most player counts.**
Why: an engine/monument game needs enough turns for an arc. Files: 2p = 10.7 turns but 1.5h real time (target 30–60 min); 4p = 4.8 turns; 6p = 4.0 turns [FILE: RESULTS.md, Session 1]. Symptom you'd see: at 4–6p, players who discover the Drought is coming on their fourth turn feel the game ended before it started; at 2p, it overstays. Root cause: one Source clock serving all counts, and per-turn card flow (~1 + conjuration bursts) tuned for low counts. Cleanest fix: declare a primary count band (2–4) and tune the Source per count (e.g., short-deck at 2p to cut length; accept 4p thinness only if a live test contradicts the sim). Do not ship a count you haven't playtested.

**C3. The game cannot yet be taught from its written materials.**
Every session needed verbal patching; the reference cards are illegible; the counter rule failed on three surfaces [FILE: rules-and-teaching thread]. For a publisher this is disqualifying — blind-testability is the Stage-4 gate. Root cause: partly C1 (unintuitive rule), partly production (reference card layout). Fix: the OPUS player-mat (gauge + 3-phase tracker on one card) resolves C1's teaching surface and the tracker problem in one component.

### MAJOR

**M1. The Drought is an anticlimax for everyone who isn't winning it.**
The rulebook sells the Drought as the climax; mechanically it *removes* the game's main verb (casting) and leaves draw-1-learn-N solitaire [FILE: rulebook; Session 1 "Phase 2 stalled"]. Symptom: players checking out in the final phase; "take cards one at a time." Root cause: climax-by-subtraction. UC used to trivialise it; the ladder fixed the UC half, not the flatness half. Cleanest fix: give the Drought a decision engine of its own — e.g., Released Reserve drawn as a face-up draft (pick 1 of 3, opponents see what you leave), which adds agency and interaction at zero rules cost [INFER — not in files].

**M2. Scoring is opaque during play and settles nothing until a math session at the end.**
Symptom: nobody knows who's winning; end-of-game accounting; the "optimising numbers" feel. Root cause: 13-row lookup with no in-play feedback. Fix: the table is secretly three arithmetic progressions (each added card is worth one more point than the last; types differ only in starting increment) [INFER from the table]. State it as that rule, print starting values on the player mat, and mid-game estimation becomes possible.

**M3. Player interaction is nearly zero, and lowest exactly where player count is highest.**
Files: Session 1 player wanted more conflict; the only interactions are Array denial and clock racing [FILE + INFER]. Symptom at 5–6p: multiplayer solitaire with 4 turns each. Root cause: no mechanic reads or touches another Spellbook. Fix inside current identity: make the shared clock *visible and manipulable* (players can see and count down the Source; drafting from the Released Reserve; possibly "the Array refreshes only on casts", making others' casts matter). Resist steal mechanics — the files are right to defer them.

**M4. Runaway leader via conjuration compounding.**
Draws → cards → bigger spells → more draws. Partially self-limiting because the leader burns the shared clock and ends the game sooner — elegant, but only if trailing players can *react* to the clock, which today they can't see incentive-wise (M2). Symptom: first player to a 6-card conjuration wins going away at 2p. Untested at v2.8. Watch metric: winner's conjuration-cast count vs. table average.

**M5. Reshape is an analysis-paralysis and enforcement liability.**
Full tableau rebuild, one action, with counter-loss warnings attached. Symptom: 5-minute turns, irreversible-state arguments ("what did your book look like before?"). Fix: cut Reshape; partial Unlearn + Empower covers 90% of its legitimate use [INFER; consistent with OPUS enchantment response].

### MINOR

**m1. Terminology** — Transfiguration / Perfect Transmutation confirmed hard to say [FILE]; thematic-coherence task exists, unanswered. **m2. Theme not felt** [FILE: Session 1] — naming/arc work queued at P3; correct priority. **m3. Wild edge cases** — see §6. **m4. Two-SKU deck** — publisher cost/complexity of a 5–6p-only suit; also the sim agent never pursues Transfiguration/PT [FILE: SCORING_REBALANCE method note], so rig confidence is weakest exactly where Echo's suit dilution bites. **m5. Market positioning [INFER]:** the honest pitch is "rummy engine with a doomsday clock you burn yourselves." That is a real hook, but the current 4-phase turn, lookup scoring, and 90-min reality put it in a heavier weight class than its 62-card body. The only external quality datum on record is one 6.5/10 from an out-of-audience player [FILE].

---

## 4. Scoring and endgame critique

**What the design should reward [INFER from identity]:** early commitment to hard patterns, monument size, and clock timing — and it should *let players see the race* while it happens.

**What it does today [FILE]:** rewards size superlinearly (good — matches the monument fantasy); prices engine spells (Conjuration) below monument spells because their payoff was the utility (good, and underappreciated in the files); double-pays Enchantment in points *and* capacity (known issue, softened by the ladder); reveals nothing until the end (bad); and carries an unresolved contradiction — the rebalance analysis priced UC at 26 by rarity, canon shipped 18, no recorded rationale [GAP].

**One clear direction — adopt this:**

Keep the current value structure, including 6/12/18, and **reject the 26-point UC**. Enchantment's real payment is capacity; pricing UC at rarity-value pays the game's most dominant mechanical advantage twice and re-creates the rich-get-richer Drought that the ladder just fixed. Then make scoring *legible*: restate the table as its underlying rule — "a spell's next card is always worth one more point than the last; Conjuration starts at 3, Transfiguration at 5, Perfect Transmutation at 7" — print that sentence plus the size-3 anchors on the player mat, and extend Conjuration to size 17 (wilds) to close the table permanently. Optionally add a public running-score marker at game end of each turn once per-spell scores are estimable.

Effects: **incentives** — unchanged in structure, but visible standings let trailing players use the one lever they have (the clock: race it or starve it). **Endgame tension** — the Drought becomes a visible photo-finish instead of an accounting reveal. **Teaching load** — one sentence replaces a 13×4 lookup. **Balance risk** — near zero; the numbers don't move except Conjuration 16–17, which only wild-heavy edge cases reach. **Thematic payoff** — "each component resonates more strongly than the last" is a cleaner fiction than a table.

This is decisive because the fork the files leave open (18 vs 26) isn't a real fork: 26 is only correct if UC's capacity value were negligible, and the entire capacity-economy thread exists because it isn't.

---

## 5. Three sharper versions

### V1 — Conservative: "v2.8, taught properly"
**Protected:** everything mechanical — 4 spell types, counter pool, Recall, Echo, ladder, current scoring. **Cut:** nothing. **Redesigned:** text only — counter worked example (OPUS Option C), enchantment next-turn timing, unlearn scope ruling, legible reference cards, player mat with 4-phase tracker (dashed Recall box), formula-stated scoring. **Experience:** the same game, finally teachable. **Risks:** spends your rare live sessions (2–3 weeks apart [FILE]) testing prose against a mechanic three analyses already call structurally hostile; if the OPUS diagnosis is right, you burn a session to learn what you already know. **Verdict: run only as the control arm of the next session, not as a direction.**

### V2 — Focused: "the 2–4 player monument race" — RECOMMENDED
**Protected:** the four patterns, the Spellbook, the Source clock, the Drought, the ladder's spirit, the 62-card deck. **Cut:** the Recall step and counters-on-spells (→ Capacity Gauge, 3-phase turn); Reshape (partial Unlearn + Empower absorb it); Ascension Trials from the core box (expansion shelf); the 5–6p SKU *for now* — Echo stays a designed, rig-validated expansion that ships when the core is proven. **Redesigned:** partial Unlearn as the pivot tool; Drought collection becomes a face-up pick-1-of-3 draft; scoring restated as the incremental rule; Source sized per count (trim at 2p to hit 45 min). UC simply doesn't exist at 2–4p (already true under the wild-declaration rule [FILE]) — the 4-card +3 is the summit, which the ladder already made respectable. **Experience:** a 40–50 minute, three-phase, teach-in-five-minutes pattern race with a visible doom clock and a drafty, tense endgame. **Risks:** walks back this week's Echo momentum; loses "more fun with more players" demand; the Drought draft is new and untested. **Verdict: pursue. It is the version a publisher can evaluate.**

### V3 — Radical: "burn the world"
Rebuilt around the strongest undocumented idea: players *spend the shared world* to act. Casting costs cards off the Source directly; the Source is a visible track with public thresholds (wards failing = rules changing as it drops); the Drought is not a phase but a finale each player *chooses* to trigger when they think their monument leads; final Released-Reserve round is an open draft-and-build sprint. Enchantments become the only spells that survive thresholds, making the internal path a hedge against the end rather than a point pile. **Protected:** patterns, Spellbook, wizard fantasy. **Cut:** counters entirely, the Array as currently formed, fixed phase structure. **Experience:** a tense race-control game — chicken with the apocalypse. **Risks:** it's a new game; invalidates all data, sim, and print work; 6–12 months of iteration. **Verdict: don't pursue now. Steal two pieces — the visible/manipulable clock and the player-triggered end — as V2 experiments if the Drought draft underperforms.**

---

## 6. Rulebook and ambiguity audit

Ambiguities (rule → readings → recommended ruling → fix):

1. **Enchantment counter timing.** LEARN says "add to your pool now" [FILE]; QUEUE says next-turn. Ruling: gains take effect at the start of your next turn; losses (unlearn/break) immediate — asymmetry prevents both abuse directions. Fix: change LEARN/EMPOWER text; add one worked example; delete "now".
2. **Empowering an Enchantment 3→4.** Nothing states you gain the ladder difference (+2? +3-then-remove-1?). Ruling: your capacity always equals the ladder value of your current enchantments plus your base — state capacity as *derived*, not accumulated, and every timing/stacking question disappears. Fix: replace all "+N counter" event text with "your capacity = base + sum of enchantment tiers" (this also makes the Capacity Gauge trivial).
3. **Unlearn scope.** "Dissolve one spell completely" is technically clear, but Session 3 shows players want partial [FILE]. Ruling: adopt partial Unlearn with the three OPUS constraints (1 counter; remnant must stay valid; returned cards frozen until next turn). Fix: replace the action text with the OPUS wording verbatim.
4. **Wild declaration scope.** Canon states the rule generally; the rulebook states it only inside Enchantment [FILE]. Open questions: is a wild's declaration permanent? Re-declarable on Reshape/Empower? Does a wild in a Conjuration count toward "same energy"? Ruling: declare on learn, fixed until that spell dissolves; applies to all spell types. Fix: move the rule to the Components section, one line, plus one example per spell type.
5. **Game end procedure.** "Immediately ends" [FILE: rulebook] vs sim's finish-your-learning [FILE: ASSUMPTIONS]. Ruling: finish the round so all players have equal turns, *then* evaluate — seat-order-fair and it matches the rig. Fix: one sentence in End of the Drought.
6. **Hand cards at evaluation.** Never stated that hand cards score zero. Ruling: they score zero (preserves the learn-it-or-lose-it Drought tension). Fix: one line in Winning.
7. **Transfiguration exchange source.** Discards come from *hand*, spell stays intact — every rummy-primed player will assume the run is consumed [INFER]. Not ambiguous, but the #1 predictable misread. Fix: call it out in a "Common mistake" box.
8. **In-file glossary "3-4 components"** — stale, see §1. Fix and re-tick the propagation box honestly.
9. **GLOSSARY.md Element/aether entries** — stale elemental model [FILE]. Fix per the thematic brief's spec (Radiance/Void/Flux/Aether; pick "the arcane field").

Hard to teach even when unambiguous: the counter dual-use (until redesigned); spells-as-persistent-engines vs melds; Array replacement timing during multi-exchange turns; the Recall step's existence; why casting Conjurations shortens the game (worth teaching *explicitly* — it's the good kind of hard).

---

## 7. Playtest decision plan

Sessions are 2–3 weeks apart [FILE], so each one must kill a question. Run T1–T3 in the next session (they share a table), T4–T6 the session after.

**T1 — Is the counter failure text or structure?**
Hypothesis: no text fixes it. Setup: teach from written materials only, current rules + rewritten counter text and worked example; no verbal patching allowed. Observe: questions asked in first 3 turns; anyone treating counters as savable. Record: count of counter questions per player; time-to-first-correct-Recall. Validates current design: zero questions after reading. Forces redesign: ≥2 players confused → adopt the Capacity Gauge and stop iterating prose.

**T2 — Does Option 2 fix enchantment uptake live? [FILE: existing confirm/kill criteria]**
Hypothesis: uptake >2/5 at 5p on the Echo deck. Setup: 5p, 79-card deck, ladder, 2-counter start. Observe: enchantments learned per player, turn learned, overhead turns spent pivoting. Record: uptake count; per-player pre-Drought turns; conjurations learned (dilution watch, kill-criterion). Validate: ≥3/5 uptake, conjuration still majority path. Redesign trigger: uptake ≤2/5 → the deck wasn't the bottleneck; the capacity mechanic is; escalate C1.

**T3 — Is the Drought a climax or a coda?**
Hypothesis: non-UC players make ≤1 real decision per Drought turn (it's a coda). Setup: same session, no changes; observe the Drought only. Observe: per Drought turn, does the player weigh alternatives or auto-place? Do they look at others' books? Record: decisions/turn; time/turn; engagement notes. Validates design: ≥2 genuine choices per turn and table attention. Forces redesign: auto-placement → prototype the pick-1-of-3 Released-Reserve draft next session.

**T4 — Capacity Gauge vs current counters (the C1 fork).**
Hypothesis: gauge + 3-phase mat removes confusion without breaking the economy. Setup: A/B — same group two short games, or two tables; player mat with gauge and tracker, Recall deleted. Observe: counter questions; lost-place incidents; uptake. Record: OPUS Step-6 metrics (≥4/5 grasp with no verbal teach; zero lost-place; ≥3/5 uptake). Validate: gauge arm dominates → kill the round-trip redesign. Redesign: if the gauge arm *reduces* strategic texture (players report casting/learning feel samey), test round-trip once before deciding.

**T5 — Partial Unlearn: pivot tool or exploit?**
Hypothesis: it cuts pivot overhead to ≤1 turn without becoming a default tactic. Setup: T4's variant plus partial Unlearn (OPUS wording). Observe: pivots to enchantments; any point-farming peels. Record: overhead turns per first enchantment; partial-unlearns per player per game. Validate: overhead ≤1 turn, ≤1 opportunistic use/player/game. Redesign: if it's spammed, add "remnant must not change spell type" and retest.

**T6 — 4-player pacing reality check.**
Hypothesis (from sim): 4p is too thin — <5 turns/player pre-Drought kills the arc. Setup: one plain 4p game, current rules. Observe: does anyone complete an intended build? When do players realise the end is near? Record: turns/player; % of players who say the game ended too soon. Validate (sim wrong): ≥6 turns/player or players report a full arc. Redesign: sim right → per-count Source sizing, or market as 2–3p + 5–6p and say so.

**T7 — Scoring legibility.**
Hypothesis: with the incremental rule printed, players can estimate standings. Setup: mat carries the one-sentence rule + size-3 anchors; mid-game, ask each player to name the leader. Record: correct-leader guesses; final tally time. Validate: majority correct, tally <5 min. Redesign: still opaque → running score markers become mandatory, not optional.

**T8 — Session length at target counts.**
Hypothesis: 2p exceeds 60 min under current Source size. Setup: any 2p session, timed by phase. Record: total time; time in Drought; longest single turn (Reshape watch). Validate: ≤60 min. Redesign: over → short-deck variant at 2p (remove rank 1s or one full rank band) next session.

**T9 — Does anyone play the clock?**
Hypothesis: no player currently modulates casting to control Drought timing (the core tension is invisible). Setup: no change; listen. Record: any table-talk about Source depletion; any deliberate cast-throttling. Validate (tension is live): ≥1 player visibly races/stalls the clock. Redesign: if invisible, make the Source count public on the board (a track) before concluding the tension doesn't work.

---

## 8. Final recommendation

**The strongest version of Archmage Ascension** is V2: a 2–4 player, three-phase, 45-minute monument race — Capacity Gauge instead of counter choreography, partial Unlearn instead of Reshape, a drafted Drought instead of a solitaire coda, scoring stated as one sentence, with Echo held as the proven-on-paper 5–6p expansion it already effectively is. Nothing in the game's evidence base supports the 4-phase counter ballet; everything distinctive about the game — patterns, monument, burning clock — survives without it.

**Stop working on:** the round-trip counter redesign (it re-litigates the exact failure OPUS diagnosed — mid-turn token dual-use — kill the QUEUE item after T4); Ascension Trials reconciliation (park the file wholesale, it's Stage 5+); card export regeneration and any print-pipeline work beyond the one legible reference mat (Anti-Drift Rule 2 — you're regenerating art for rules text that T1–T5 may change); further simulation elaboration (the rig has answered its questions; its agent doesn't even play Transfiguration, so its marginal accuracy is spent).

**Prototype next:** one printed player mat per player — Capacity Gauge, 3-phase tracker, the scoring sentence, the four learning actions — plus the partial-Unlearn rule card. An afternoon of work, and it carries T1, T4, T5, and T7 in a single session.

**Single biggest unresolved design risk:** the capacity-economy thread names it itself [FILE]: the capacity constraint may be load-bearing. If casting and learning stop competing for one budget, conjuration spam may accelerate the Source so hard that games collapse to 3-turn sprints and the enchantment path becomes irrelevant rather than inaccessible. That is exactly what T4 must watch: not "is it clearer" (it will be) but "did the tension move somewhere worse."

**What would prove me wrong:** T1 passing clean — a written-rules-only session with zero counter confusion and ≥3/5 uptake means the mechanic was teachable all along and V1 suffices. Or a 5–6p Echo session (T2) producing markedly higher table energy and interaction than any 2–4p session — that would mean the game's soul lives at high counts and the V2 focus band is backwards. Either result is cheap to obtain. Get the sessions played; the analysis-to-playtest ratio in this project is roughly 20:1 by page count, and every remaining open question is now one that only a table can answer.

---

*Process note: this file is referenced from QUEUE (§2 routing). Decisions in here are proposals only — nothing above changes canon until decided.*
