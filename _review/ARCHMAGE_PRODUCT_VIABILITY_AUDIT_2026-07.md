---
title: Product Viability Audit — can this work beyond friends and family?
type: review
date: 2026-07-04
status: review-only
purpose: Assess whether Archmage Ascension can become a game strangers want to play and replay. Not an implementation audit; not a balance audit. Makes no decisions.
sources: full repo inspection 2026-07-04 — rulebook v2.8 (line-level), 3 playtest logs, pitch sheet, simulation RESULTS/threads/QUEUE/canon/decisions, the three prior review docs (verified, not trusted)
---

# Archmage Ascension — Product Viability Audit (July 2026)

Evidence tags: **[FILE]** directly inspected · **[INFER]** reasoned from multiple files · **[GAP]** missing/unresolved/contradictory.

A note on the evidence base before anything else: this project has had **two completed live playtests, ever** (2026-05-01 at 2p, 2026-05-03 at 5p), both with friends/family, both on a ruleset that predates every v2.8-defining rule [FILE: playtests/ vs decision dates]. The single external quality datum is one 6.5/10 from a player whose favourite genre is social deduction [FILE: session 1]. Everything else in the repo — roughly 20:1 by page count [FILE: DESIGN_REVIEW §8, verified plausible by file sizes] — is analysis of those two evenings. Every confident-sounding claim below inherits that thinness, including mine.

---

## 1. Executive verdict

**Strongest reason this might become something bigger.** The game contains one authentically novel idea: a rummy-family pattern builder where your melds stay alive as engine pieces, played against a shared doomsday clock that the players themselves burn down — every Conjuration you cast to feed yourself hastens the end for everyone [FILE: rulebook turn structure; INFER: the acceleration tension, which no player-facing file states]. "Spend the world's last magic to build proof of mastery before the lights go out" is a real, pitchable, emotionally coherent fantasy that no mainstream rummy-family game owns. The size-15 Perfect Transmutation in Session 1 — the one moment a playtest log records as genuinely great [FILE] — is exactly this fantasy landing.

**Strongest reason it stays a respectable personal project.** That idea is currently invisible at its own table. The clock is a face-down deck nobody can read [FILE: rulebook setup]; no session log records any player noticing, discussing, or playing the depletion [FILE: all three logs — zero mentions]; the theme registered as absent to the only fresh player asked ("no narrative or story experienced") [FILE: session 1]; and the system players actually spend their attention on — the dual-use counter pool with a mid-turn Recall — is the confirmed #1 source of confusion and the source of zero recorded fun [FILE: sessions 1 & 3, both OPUS analyses]. Strangers will meet the admin before they ever meet the idea, and strangers don't wait.

**Rough implementation, or unresolved product identity?** Both exist, but the binding constraint is **identity**. Evidence: the pitch sheet promises 2–7 players, 30–60 minutes, "elegant counter system", elements Fire/Water/Earth/Air, and a dual endgame [FILE: pitch/archmage_pitch_sheet.html] — every one of those claims is contradicted by the current repo (canon caps at 6 [FILE: canon.yml]; the only timed session ran 1.5h at 2p [FILE: session 1]; the counter system is "structurally broken" in the project's own words [FILE: capacity-economy thread]; energies are Radiance/Void/Flux/Aether [FILE: canon.yml]; Trials is stale/parked [FILE: truth audit CON-6]). The pitch isn't merely outdated — it reveals that the project has never decided what the product is: what count band, what session length, what weight class, what the box promises. Meanwhile the sim says the game plays completely differently across counts (10.7 pre-Drought turns/player at 2p vs 4.0 at 6p [FILE: RESULTS.md]) — those are two different games wearing one name, and the repo treats supporting all of them as an obligation rather than a choice [INFER].

**What would need to be true for strangers to replay it?** Four things, none currently evidenced: (1) the game is teachable from the box in ~10 minutes without the designer present [GAP: every session needed verbal patching [FILE: rules-and-teaching thread]]; (2) the doom clock is visible and playable, so the signature tension exists in players' heads and not just in the design docs [GAP]; (3) the ending pays off — currently the Drought removes the game's main verb and Session 1 records the endgame stalling into card-by-card admin [FILE]; (4) a first game produces at least one moment a player retells afterward. One of the two sessions produced such a moment (the size-15 PT); the other produced a story about how hard it was to learn an enchantment [FILE: session 3 "worst moment"]. That ratio has to invert.

---

## 2. The real hook

**The hook Sam may think the game has** [FILE: PROJECT.md, pitch]: "wizard spell-building — constructing something rather than optimising numbers," familiar rummy mechanics with fresh depth, rich narrative. The pitch sheet leads with theme and even sells the counter system as a feature ("Elegant counter system tracks both casting and learning capacity") [FILE] — the project's own thread calls that same system structurally broken [FILE]. That inversion is the clearest sign the internal story about the game and the table reality have diverged.

**The hook the files actually support** [FILE+INFER]: melds that stay alive as engines (genuinely differentiating vs rummy/canasta, where melds are dead points), plus the shared player-accelerated clock. Session 1's strategic player engaged with optimisation and blocking, and phases "flowed naturally" unprompted [FILE] — the skeleton works. What no file supports: that theme, monument-feeling, or the Drought-as-climax have ever been experienced by anyone [FILE: session 1 explicitly negative on theme; session 3 silent; no other live data exists].

**Hooks that sound good in pitch text but may not appear at the table:**
- "Rich narrative: the missing Archmage, fading magic" [FILE: pitch] — Session 1's player felt none of it [FILE]. The lore lives in Story.md and rulebook flavour paragraphs strangers won't read.
- "Dual end-game: quick scoring OR the Ascension Trial" [FILE: pitch] — Trials is a stale, unreconciled second game the base game can't yet carry [FILE: truth audit CON-6; DESIGN_REVIEW].
- "Dynamic phase system — magic works differently as resources deplete" [FILE: pitch] — at the table this is currently "the fun verb gets deleted and you draw one card a turn" [FILE: session 1 Phase 2 stall].
- "Engine building" [FILE: pitch tags] — at 4–6p the sim gives players 4–5.5 pre-Drought turns [FILE: RESULTS.md]; nobody builds an engine in four turns [INFER].

**Is "wizard pattern-building" enough?** No. Pattern-building with a wizard skin describes dozens of games; it is a genre, not a hook [INFER]. **Is the shared dying Source / Drought clock the true hook?** Yes — it is the only element in the repo that is simultaneously novel, thematic, and mechanically load-bearing [INFER from §1]. But it is currently a hidden variable, not an experience. **Is the Spellbook-as-monument fantasy visible during play?** Partially at 2p (a 15-card transmutation is visible and impressive); structurally impossible at 5–6p under current pacing [FILE: RESULTS turns/player; INFER]. **Does the game create a table story?** Session 1: one, yes. Session 3: the memorable event was friction [FILE]. **Could it be honestly pitched in one sentence to a stranger?** Yes, and here is the test the current pitch sheet fails: *"It's rummy where your melds stay alive as spell engines — but every spell you cast burns down the shared deck, and when it runs out, the biggest spellbook wins."* Every word of that is supported by the rulebook [FILE]. Note what's absent from it: counters, Recall, capacity, scoring tables, Trials, Echo. **The one hook most worth protecting is the player-burned clock plus the living spellbook — everything else in the box should be judged by whether it serves those two.**

---

## 3. Stranger-table failure modes

Assume five strangers at a convention table or a game café. No goodwill, no tolerance for verbal patching, a shelf of alternatives behind them.

**F-A. First-turn engagement.** Why it matters: strangers decide in ~2 turns whether to invest. Evidence: turn 1 under current rules is draw 1 card, cast nothing (nothing learned yet), recall nothing, learn maybe one 3-card spell if the deal cooperated — with a 1-counter budget [FILE: rulebook setup/turn structure]. Blind-table symptom: "so… I just draw and pass?" from at least one player in round 1. Classification: **rules structure** (the ramp is real but the first turns are empty; contrast with rummy, where the first meld chase starts immediately). [INFER — never observed, because no session log records turn-1 behaviour [GAP]].

**F-B. Teach burden.** Why: the teach is the product's front door. Evidence: 1.5h total for a 2p session including teach [FILE: session 1]; counter rule failed across verbal + card + board [FILE]; both sessions needed live patching [FILE: thread]; four phases, four learning actions, a dual-use token pool, and a 13×4 scoring lookup [FILE: rulebook, Scoring Reference]. Blind symptom: the teach exceeds 15 minutes, someone picks up their phone, the counter rule gets asked twice by turn 3. Classification: **core design** for the counter system (three analyses agree no text fixes it [FILE: OPUS response, DESIGN_REVIEW C1/T1 prediction]); **polish** for reference cards.

**F-C. Emotional payoff.** Why: it's what gets retold and drives "again?". Evidence: Drought-as-anticlimax — casting dies, "take cards one at a time" [FILE: session 1]; scoring resolves as an end-of-game accounting session with a lookup table [FILE: Scoring Reference; DESIGN_REVIEW M2]; no player has ever seen who's winning mid-game [INFER]. Blind symptom: the winner is announced and someone says "oh, okay" — surprise without tension. Classification: **rules structure** (climax-by-subtraction; opaque scoring), fixable inside the current design [INFER: Drought draft / legible scoring proposals exist [FILE: DESIGN_REVIEW M1/M2] — unproven].

**F-D. Interaction.** Why: 5 strangers who never touch each other's game will not choose this over a party-weight alternative. Evidence: the only interactions are Array denial and (invisible) clock racing [FILE: DESIGN_REVIEW M3, verified against rulebook — no mechanic reads or touches another Spellbook]; Session 1's player asked for a steal mechanic (i.e., asked for interaction) [FILE]. Interaction is lowest exactly where player count — and the current QUEUE focus — is highest [INFER]. Blind symptom: multiplayer solitaire; players plan their turn during others' turns and never look up. Classification: **core design** at 5–6p; tolerable at 2–3p where blocking is real [FILE: session 1 blocking noted].

**F-E. Downtime.** Why: deliberate-player turns already caused place-losing with friends [FILE: session 1]. Reshape is an unbounded full-tableau rebuild in a single action [FILE: rulebook] — one AP-prone stranger makes everyone else wait. Blind symptom: 3+ minute turns mid-game; phones. Classification: **rules structure** (Reshape, 4-phase turn), plus polish (turn tracker).

**F-F. Perceived originality.** Why: "why this and not…" is asked in the first 10 minutes. Evidence: the pitch's own comparison set ("sets & runs… familiar mechanics") anchors to rummy [FILE]; nothing player-visible signals the twist because the clock is hidden and melds-as-engines is only discovered in play [INFER]. Blind symptom: "so it's fancy rummy?" said aloud, and no one at the table can articulate the difference. Classification: **presentation of the core design** — the originality exists; it isn't surfaced.

**F-G. Replay motivation.** Why: a stranger's second play is the real conversion metric. Evidence: nothing in the repo addresses variability between plays — same deck, same patterns, same scoring, no variable setup, no asymmetry [FILE: rulebook; GAP — no file even discusses replay variance]. The strategy space (which patterns, when to pivot to enchantments) may carry a few plays, but the discovered-in-play arc is identical each game [INFER]. Blind symptom: "good game" with no one proposing a rematch. Classification: **product-level gap** — not a bug in any system, an absence.

**F-H. "Why this instead of another card game?"** Evidence: the honest current answer is the one-sentence pitch in §2 — but the table experience must deliver it, and today the clock is invisible (F-F), the monument is only spectacular at 2p, and the middle of the game is capacity admin [INFER from sessions + rulebook]. Classification: **identity** — answered on paper, unanswered at the table.

**F-I. Does the ending feel earned?** Evidence: game end depends on Released Reserve depletion with three contradictory procedures across rulebook/sim/review [FILE: CON-5] and possible seat-order unfairness [FILE: rulebook "immediately ends"]; the last phase is the game's flattest [FILE: session 1]. Blind symptom: players not realising the game is ending until it ends ("wait, that's it?") — the sim says 4p players get ~4.8 turns of warning at most [FILE: RESULTS]. Classification: **rules structure**.

**F-J. Clever or compliant?** Why: engine games live on "look what I did"; admin games die on "did I do that right?". Evidence: Session 3's defining player experience was a 2-turn bureaucratic workaround to do the thing the game supposedly rewards [FILE]; the counter rule makes players doubt legality rather than plan lines [FILE: sessions 1 & 3]. Blind symptom: players asking permission ("can I…?") more often than announcing plays ("I'm going to…"). Classification: **core design** (capacity system).

**F-K. Can players tell what to care about?** Evidence: scoring is invisible until the end [FILE]; the clock is invisible throughout [FILE: face-down Source]; capacity, the most-taught system, is worth caring about least [INFER]. Session 2's planned mid-game probe — "what are you trying to do right now?" — was never asked (session cut short / not recorded) [FILE/GAP]. Blind symptom: mid-game, half the table cannot name what would make them win. Classification: **rules structure** (legibility), and the single most fixable of the serious problems [INFER].

---

## 4. The local-optimization trap

Named loops where the project improves details without improving the product:

**L1 — The counter-prose loop.** Rewrite counter text → test → still confusing → rewrite again. The rules-and-teaching thread's `next` is another prose pass [FILE], while Sessions 1 and 3 plus two analyses already showed comprehension failure surviving *three* written surfaces and verbal teaching [FILE]. The DESIGN_REVIEW correctly demoted this to a control arm [FILE]; the QUEUE still carries it as a P1 in its own right [FILE]. Polishing the description of a system three documents call structurally hostile is the definitional local optimum.

**L2 — The simulation loop.** 10,000-game rig runs decided the deck structure, the ladder values, the wild counts [FILE: RESULTS, echo decision] — and the rig's agent never plays Transfiguration or Perfect Transmutation [FILE: SCORING_REBALANCE method note], i.e., it cannot see two of the four spell types, including the one that produced the game's only recorded great moment. Meanwhile the capacity-economy thread's next step is *more rig work* (round-trip pre-validation) [FILE]. The rig answers balance questions about a game whose product questions no rig can see: fun, theme, teach, retelling. Sim-vs-table evidence ratio is currently absurd and growing [INFER].

**L3 — The review-chain loop.** Three substantial review documents in two days (2026-07-03/04), explicitly staged as a "Kiro implementation-plan review chain" with a fourth recommended [FILE: _review/ front-matters, §9 of each]. Each is good. Collectively they are analysis compounding on two playtests from May — the DESIGN_REVIEW itself flags "analysis-to-playtest ratio ~20:1" and the chain has since made it worse [FILE/INFER]. This document is aware it is the fourth link.

**L4 — The Echo loop.** Enchantment uptake was low (a capacity-economy symptom) → a fifth suit was added at 5–6p to make room (a deck-structure fix), then tuned (+2 vs +3 counters, 4 vs 6 wilds, ladder scores 6/12/18) [FILE: session 3 → FIFTH_SUIT_ANALYSIS → echo decision]. Note the origin: **the fifth suit was a single player's mid-game suggestion in Session 3, initially and correctly triaged as "Ignore for now — solution proposal, not problem report"** [FILE: session 3 triage] — and two months later it is the project's largest structural change, adopted rig-only, expanding the product promise to a second SKU config, while the counter mechanic that caused the symptom remains undecided [FILE: QUEUE]. This is the clearest case of optimising around the problem instead of through it.

**L5 — The print-pipeline loop.** Card exports, printenbind specs, CS3 pipelines, visual-system variants [FILE: card-design/, card-visuals thread] — the thread's `next` says "ready to run" while the DESIGN_REVIEW says stop, and the forks audit flags the contradiction [FILE: F14]. Regenerating print files for rules text that the next two playtests may rewrite is polish masking unresolved design. Related assumption to distrust: Session 1's "themed cards would improve the game a lot" [FILE] feeds a quiet "proper components will fix it" narrative — but the theme gap is mechanical-arc-shaped, not art-shaped [FILE: session 1 diagnosis itself says so].

**L6 — Reference-materials-as-compensation.** Reference cards, web reference, score tables, turn trackers, player mats [FILE: QUEUE, threads] — each exists to prop up rules that don't fit in players' heads. Some are legitimately needed; but note the pattern: every teaching aid added since May supports the *capacity* system [INFER from QUEUE items]. When a game needs this much scaffolding for its least-fun system, the scaffolding is evidence, not solution.

**L7 — Friends/family weighting.** The entire live evidence base is Sam's circle [FILE: playtest logs]. Session 1's 6.5/10 came with "would only rate social deduction 10/10" — an out-of-audience score treated appropriately in the log, but it remains the *only* external number, and repo language has drifted toward treating Sessions 1/3 as validating the core loop's promise rather than merely diagnosing its failures [INFER: e.g., PROJECT.md's confident "core experience" description has no observational support]. What friends tolerate (1.5h, verbal patching, illegible cards, opaque scoring) is precisely what strangers won't.

**What is *not* a trap, for fairness:** the working-system/meta layer is genuinely good and cheap to maintain [FILE: process.md, checker]; the ladder decision closed a real exploit; and the May playtest logs are honest about failure, which most personal projects aren't [FILE].

---

## 5. What may not be considered

**W1 — Target audience is defined by adjective, not by person.** "Strategy gamers who enjoy a 30–60 minute tactical card game" [FILE: PROJECT.md] describes nobody specific and conflicts with the 90-minute reality [FILE: session 1]. Missing: is this for rummy-literate families stepping up, or engine-builder hobbyists stepping down? Those want opposite things from the counter fork. Why it matters: every open decision (F1, F10, scoring legibility) resolves differently per audience. Test that exposes truth: pitch the one-sentence hook to both types of stranger; watch which one leans in.

**W2 — No comparable-games analysis exists anywhere in the repo** [GAP: grep for market/comparable/BGG-type analysis finds only the pitch's genre tags]. The game will be shelved next to Five Crowns, Mystic Vale, Lost Cities, Fantasy Realms, and gateway engine builders. Why it matters: "fancy rummy?" (F-F) is answered by knowing precisely what those games lack — a live tableau and a player-burned clock — and building the table experience to make that difference felt in game one. Test: the comparison playtest in §8 (E4).

**W3 — Replay loop is fully unaddressed** [GAP — see F-G]. Every game plays out over the same deck with the same patterns and the same scoring. Why it matters: publishers and strangers both ask "what's different game 3?" Decision that exposes truth: none needed yet — run the replay test (E2) first; if strategy-space depth carries three plays naturally, the gap is smaller than it looks.

**W4 — Table presence.** What does a stranger walking past the table see? A board of counters and grids of numbered suit cards [FILE: board/, card-design status]. The Spellbook — the supposed monument — has no defined table-visual identity distinct from "cards in rows" [GAP: VISUAL_SYSTEM covers card faces, not table state]. Why it matters: convention/café acquisition is visual. Test: photograph mid-game state; ask a non-player what's happening.

**W5 — Emotional arc is asserted, never designed.** "Climactic Drought" [FILE: PROJECT.md] vs observed anticlimax [FILE: session 1]. The arc a player should feel — abundance → tightening → panic → last stand → reveal — appears in no design file as a target with mechanics assigned to each beat [GAP]. Why it matters: this is the retellable-story machine. Decision: adopt an explicit arc spec before any further balance work; judge M1/M2-class proposals against it.

**W6 — Interaction budget.** The repo defers steal mechanics (correctly) but never states what interaction the game *does* promise at each count [GAP]. Why it matters: it sets honest player-count claims. Test: E1/E4 observation — count table-directed utterances per player per game.

**W7 — Accessibility of the hook.** The clock — the hook — is a face-down stack [FILE]. The cheapest possible experiment in the entire repo may be: flip the Source count face-up on a track and see if table talk changes [INFER; DESIGN_REVIEW T9 proposes exactly this and it costs nothing]. Not currently in QUEUE as a P1 [FILE — it's buried inside review proposals; GAP].

**W8 — Publisher/product shape.** Two deck configs (62/79), an A3 board, counters, a marker, reference cards, a second rules module [FILE] — that is a mid-weight box for what the pitch calls Gateway+ [FILE: pitch]. Why it matters: the 5–6p SKU exists to serve an experiment; component cost shapes viability. Decision: F10 (count band) is really a *product-shape* decision and should be argued in those terms, not as test sequencing only [INFER, extends the forks audit].

**W9 — Blind-playtest readiness is the actual stage gate, and it is far.** Stage 3 label notwithstanding [FILE: PROJECT.md], the game cannot currently be taught from written material [FILE: thread]. Why it matters: every week spent on Echo tuning is a week not spent closing the gap to the first blind test — the first moment real product evidence becomes possible. Test: E1.

**W10 — Session length vs weight is unmeasured at every count except 2p** [FILE: only session 1 timed]. 90 minutes at 2p for a rummy-family game is out of class [INFER]. Test: time every future session by phase (DESIGN_REVIEW T8 — adopt).

**W11 — The best idea may be hidden inside too much system.** Count the systems a new player must load before touching the hook: 4 phases, 4 spell types, 4 learning actions, dual-use counters, Recall, capacity ladder, Array replacement, Drought transition, Released Reserve, scoring table [FILE: rulebook]. The hook needs perhaps half of them [INFER]. Why it matters: this is the difference between "elegant with one twist" and "homebrew-feeling". The V2 proposal [FILE: DESIGN_REVIEW] is one answer; the product question is prior: *what is the maximum rules mass the hook can carry for the chosen audience?* [GAP — never posed].

---

## 6. Core experience audit

What players actually experience today, ranked most → least supported by evidence:

1. **Solving a rummy-style efficiency puzzle** — strongly supported: pattern-slotting decisions dominated observed play; the strategic player engaged exactly here [FILE: session 1].
2. **Managing a capacity economy / doing admin** — strongly supported, negatively: counters, Recall, capacity workarounds consumed the recorded attention and produced the recorded frustration [FILE: sessions 1 & 3]. (Two entries merged: at the table, the capacity economy *is experienced as* admin [INFER].)
3. **Optimising a scoring table** — supported: end-of-game accounting, invisible standings, the "optimising numbers" feel PROJECT.md explicitly rejects [FILE: Scoring Reference; session 1 scoring; PROJECT.md].
4. **Waiting for the end** — supported at the Drought: Phase 2 stall [FILE: session 1]; predicted to worsen at high counts [FILE: RESULTS pacing].
5. **Racing a shared doom clock** — weakly supported: the clock shapes the game invisibly; no recorded player behaviour engaged with it [FILE: logs; GAP].
6. **Building a magical monument** — weakest: one moment in one session [FILE: session 1 best moment]; theme otherwise reported absent [FILE].

**Which should be dominant:** #6 fused with #5 — building the monument *because* the world is ending — with #1 as the moment-to-moment verb that serves them. That's what PROJECT.md already claims [FILE]; the ranking above is the claim inverted.

**Accidental noise:** #2 entirely (capacity should be felt as a tension, not operated as a system), #3 (scoring should be a race you can see, not a table you consult), #4 (the end should be the loudest part).

**Judgment rule going forward:** every system earns its place by strengthening "monument under a burning clock". Counters, Recall, Reshape, the scoring table, Echo, and Trials all currently fail or defer that test; the Array, the four patterns, the ladder's *spirit* (capacity as the price of ambition), and the Drought transition pass it [INFER].

---

## 7. Bigger design moves (types of change, tied to stranger appeal)

Not proposals to adopt — categories to evaluate if, as §1 argues, the problem is product-level. Nothing here is canon; several overlap DESIGN_REVIEW proposals, cited as analysis.

**M-A. Make the Source clock visible and player-manipulable.** Solves: F-F/F-K/W7 — turns the hook from a designer's secret into the table's shared object; gives trailing players their only lever. Risks: kingmaking-by-clock at 3+; may expose that pacing is flat once seen. Cheapest test in the repo (a face-up track) [INFER; FILE: DESIGN_REVIEW T9/M3 concur].

**M-B. Make the Drought a climax, not a coda.** Solves: F-C/F-I — the ending currently subtracts the game's verb [FILE: session 1]. Options in files: drafted Released Reserve [FILE: DESIGN_REVIEW M1]; player-triggered ending [FILE: V3 fragment]. Risks: new untested subsystem at the most emotionally important moment; drafting adds time at exactly the point sessions already overrun.

**M-C. Increase interaction without theft.** Solves: F-D at the counts the pitch promises. In-identity options: visible clock (M-A), draft visibility ("what you leave, they see"), Array refresh tied to others' casts [FILE: DESIGN_REVIEW M3]. Risk: every added visibility rule is added teach; must be paid for by cuts elsewhere.

**M-D. Simplify scoring into an in-play race.** Solves: F-K/#3 noise; the table is secretly three arithmetic progressions [INFER: verified against Scoring System Reference — each added card is worth one more point than the last, types differ by starting increment]. Risk: near-zero mechanically [FILE: DESIGN_REVIEW §4]; the real risk is treating this as sufficient — legible scoring of an invisible race still isn't a race unless standings are also visible.

**M-E. Sharpen the Spellbook as the emotional centre.** Solves: #6's weakness; the monument needs to *look* like one (spell mats, growth that reads across the table, names players say aloud). Risk: component cost; art-before-mechanics drift (Anti-Drift Rule 2 [FILE: course]) — do the naming/structure half first (already queued P3 [FILE]).

**M-F. Reduce bookkeeping actions.** Solves: F-B/F-E/F-J. The candidates are known: Recall's existence, counter choreography, Reshape [FILE: DESIGN_REVIEW C1/M5]. Risk: the capacity constraint may be load-bearing [FILE: capacity-economy thread names this itself] — cast-vs-learn tension must survive whatever replaces the tokens. This is F1; it is already the repo's central fork. The product framing adds one criterion the forks audit lacks: choose the branch that best *disappears* at the table, not the one that best preserves current balance [INFER].

**M-G. Narrow the player-count/product promise.** Solves: W1/W8/F-D; two-games-in-one-box is the silent cause of half the open forks [INFER: F2, F10, F14, Echo, wild counts all exist because 5–6p must work]. Risk: walking back the Echo investment and the "more fun with more players" datum [FILE: session 1 quote] — but that quote was a 2p player imagining, not a 5p player confirming; Session 3 at 5p was the *worse* session [FILE].

**M-H. Cut systems that don't produce memorable moments.** Candidates by the §6 rule: Reshape, Trials-from-core-box, possibly the second deck config [INFER]. Risk: sunk-cost pain only. What should *not* be cut on current evidence: the ladder, the Array, the four patterns, the Drought itself.

---

## 8. Evidence gap: stranger tests that answer product questions

Standing rules for all: Sam does not explain design intent before or during; distrust all compliments delivered to the designer's face, all "I'd buy it" statements, and any feedback following the question "did you like it?"; trust behaviour, requests, and unprompted retellings.

**E1 — Blind teach.** Question: can strangers start playing from written materials in ≤15 min with zero counter questions after the read? Players: 3–4 strangers (café/BGG meetup), at least one rummy-literate. Setup: current rules + best-effort rewritten counter text (this doubles as F1's control arm — one table, two purposes). Sam observes silently; may answer only by pointing at text. Observe: time-to-first-turn; questions per system; which rule is misplayed silently. Distrust: politeness-driven pretend-understanding — probe with "walk me through your last turn". Encouraging: play starts inside 15 min, misplays self-correct. Alarming: teach stalls on counters again → F1 is settled (structure, not text) *and* the game has no stranger path until it's resolved.

**E2 — Replay test.** Question: does anyone choose game two? Players: the E1 group, same sitting, time available for two plays. Setup: after game one, Sam says only "we have time for another game — this or something else?" with 2–3 familiar alternatives genuinely on the table. Observe: the choice, who advocates, what they say they'd do differently (differently = strategy space exists; nothing = one-shot puzzle). Distrust: replay chosen out of politeness to the designer present — better if a friend hosts and Sam is absent. Encouraging: unprompted "I want to try an enchantment build". Alarming: unanimous switch to the familiar game — the exact outcome friends/family data can never show.

**E3 — The unprompted-return test.** Question: does anyone *ask* to play again on a later occasion? Players: any stranger group after E1/E2. Setup: none — this is a waiting test; leave the prototype visible/available at a recurring meetup. Observe: does anyone request it within 2–3 weeks, and what do they call it ("the wizard rummy one"? — whatever they call it IS the perceived hook; record it verbatim). Distrust: requests routed through Sam's friendship. Encouraging: one unprompted request. Alarming: silence — respectable-but-forgettable confirmed.

**E4 — Comparison test.** Question: what does this give that rummy-family games don't — in players' words? Players: 3–4 strangers who know rummy/Five Crowns-type games. Setup: one short familiar rummy-style game, then Archmage, same table, same night. Debrief asks only: "how were they different?" and "which would you bring to game night, and for whom?" Observe: does *anyone* mention the clock, the living melds, or the theme unprompted — those are the hook's visibility metrics. Distrust: novelty preference (new games win one-night comparisons by default); weight the *reasons*, not the vote. Encouraging: the differences named match §2's hook. Alarming: differences named are "longer", "more complicated", "more counters".

**E5 — No-intent silent-observer test.** Question: what game do strangers think they're playing? Players: any stranger table, taught by a *player from a previous test*, not by Sam (also tests rules transmission). Setup: Sam watches without speaking, or reviews via a friend's report. Mid-game, the teacher asks each player "what are you trying to do right now?" [FILE: session 2's designed-but-never-asked probe — reuse it]. Observe: answers naming a build/plan vs answers naming compliance ("waiting for counters"); any spontaneous clock talk; where laughter/groans happen (map them — that's the real emotional arc, W5). Encouraging: plans and clock talk. Alarming: compliance answers dominate — F-J confirmed with strangers.

**E6 — Visible-clock A/B (product version of T9).** Question: does making the Source count public change table talk and perceived tension? Players: strangers, two short games or two tables. Setup: identical rules; arm B has a face-up Source track. Observe: clock references per game; end-of-game "did the ending feel earned?" one-liner. Encouraging: arm B produces racing/stalling behaviour. Alarming: no behavioural difference — then the hook needs manipulability (M-A full version), not just visibility, and that's a bigger redesign than currently queued.

Sequencing note: E1+E2 are one evening; E4 is a second; E3 runs passively throughout; E5/E6 ride later sessions. None of these require Echo, new exports, or any print run [INFER].

---

## 9. Implications for the master plan

The Kiro plan chain (truth audit → forks audit → planned counter deep-dive [FILE: §9s]) is building toward implementing the current design cleanly. This audit's finding is that **cleanliness is not the binding constraint — stranger evidence is.** The master plan should be restructured around that.

**Implementation hygiene (proceed, low effort):** the truth audit's safe-fix set (glossary repair, CON-1, energy names, scoring rationale, pointers) [FILE: §7 there] — cheap, decision-free, keeps the repo trustworthy. Cap the effort: hygiene is maintenance, not progress.

**Design-validation work (the critical path):** F1 resolved *at a stranger table* (E1 doubles as T1); the visible-clock test (E6/T9); Drought observation (T3). Everything here needs a table, not a rig. The rig should be demoted to answering only questions a confirmed table finding raises [INFER; against the capacity-economy thread's rig-first `next` [FILE] — that's a disagreement to resolve consciously, not silently].

**Product-positioning work (start now, costs nothing):** write the one-sentence pitch into PROJECT.md as the protected hook; a one-page comparable-games note (W2); an emotional-arc spec (W5); an explicit product-shape memo arguing F10 as box/audience/length, not as test sequencing. These documents are cheap and they are the anti-local-optimization spine the plan currently lacks.

**Playtest-kit work (gated, minimal):** exactly one legible reference card/mat set sufficient to run E1 — nothing more [FILE: DESIGN_REVIEW §8 concurs]. No printenbind runs.

**Stop doing:** further counter-prose iterations beyond the E1 control text (L1); rig expansion (L2); additional review documents until at least one stranger session exists (L3 — including successors to this one); card-export regeneration (L5/F14: resolve as "hold"); Echo tuning and 5–6p tunables (L4) until F10 is argued as a product decision.

**Do not implement until stranger evidence exists:** anything touching F1's branch choice in canon files; Echo canonization (F2) — *note the entanglement: if F10 lands on 2–4p-first, the F2 validation session stops being the next milestone at all* [FILE: forks audit §3.11, extended]; state.js ladder work; pitch regeneration; Trials reconciliation; any visual-system promotion (F9).

**Counters vs product appeal — which first?** Neither in isolation: the correct move is the E1 session, which resolves F1's text-vs-structure question *and* produces the project's first stranger datum in a single evening. The counter system should then be resolved in whatever direction makes E2 (the replay choice) come out better — that is the product criterion the forks audit's balance-centric criteria lack [INFER].

**Implementation tasks at risk of waste if the product question is unresolved:** all card-visuals thread work (aimed at a possibly-demoted 5–6p config); state.js ladder update; Echo propagation tail; Trials reconciliation; scoring-table extension beyond the trivial fix; any per-count Source tuning done before F10.

**Documents the master plan should include to prevent local optimization:** (1) the protected-hook sentence with a standing rule — *no change may make the hook less visible at the table*; (2) a stranger-evidence ledger — every design claim tagged friends-validated / stranger-validated / untested, reviewed each session; (3) a stop-loss rule for loops — any system iterated twice without new table evidence gets escalated to a redesign/cut decision instead of a third iteration; (4) the emotional-arc spec as the acceptance test for M1/M2-class changes.

---

## 10. Final blunt recommendation

**The strongest version of Archmage Ascension as a product:** a 2–4 player, 45-minute, teach-in-ten-minutes card game whose table identity is a *visible dying world* and a *growing spellbook monument*, with rummy-literate pattern play as the verb — sold in one sentence, with Echo/5–6p and Trials as expansion shelf if the core earns it. This is close to the DESIGN_REVIEW's V2 [FILE], but the product framing changes the priority order: hook visibility (clock, legible race, monument presence) before mechanical streamlining, because streamlining a game strangers still can't *see* the point of just produces a cleaner unremarkable game [INFER].

**Biggest thing being underestimated:** the cost of having zero stranger data. Every decision in the repo — Echo, the ladder, +3 counters, 12/18 — has been made against friends/family reactions and a rig that can't perceive fun. The project is now three review documents deep into planning the implementation of a game no unbiased human has ever played [FILE: playtest logs; _review/ dates].

**Biggest thing being overvalued:** the simulation rig and the analytical apparatus around balance. Ten thousand games per configuration decided the deck structure [FILE: RESULTS] while the questions that decide whether this is a product — does the teach land, does the ending pay off, does anyone ask to play again — have a sample size of zero. Balance is a Stage-4 problem being solved with Stage-6 rigour while Stage-3 evidence doesn't exist [INFER].

**Next non-obvious test:** E2/E3 — the replay-choice and unprompted-return tests. Everyone plans blind teaches eventually; almost nobody tests *whether strangers choose the game again when a familiar alternative is on the table*. That is the single cheapest measurement of product-vs-project, and it can run this month with the current ugly prototype [INFER].

**Implementation work to pause:** card exports and everything print-shaped beyond one legible teach kit; state.js; Echo propagation tail; Trials; further review-chain documents; rig extensions. (All argued in §9.)

**The one question that decides whether this is bigger than a personal project:** *When five strangers finish a game and are offered something familiar next, does at least one of them argue for playing Archmage Ascension again — and when they describe it to the others, do they describe the dying world?* If yes, the hook is real and everything else is engineering. If they describe "a rummy where you manage counters", the current design is hiding its own best idea, and no amount of counter resolution, Echo tuning, or card art will change the answer.

---

*Process note: this file is review-only. Nothing in it changes canon, QUEUE priorities, or decision status. Referenced from `meta/QUEUE.md` per the `_review/` linkage rule.*
