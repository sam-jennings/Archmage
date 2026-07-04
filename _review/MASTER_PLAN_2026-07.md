---
title: Master Plan — Archmage Ascension
type: master-plan
date: 2026-07-04
status: draft-for-Sam-approval
purpose: Strategic spine for Opus/Kiro execution. Sequences product-validation work ahead of implementation. Not canon; a plan.
sources: _review/ audit chain (truth, forks, product-viability, design-review) verified against canon.yml, rulebook v2.8 (lines 156/303–304/386/426), echo decision + experiment RECORD, QUEUE, threads — 2026-07-04
evidence_tags: "[FILE] inspected · [INFER] reasoned from multiple files · [GAP] missing/unresolved/contradictory"
---

# Master Plan (July 2026)

This plan exists to stop the project optimizing locally. The four audits agree on one
thing the QUEUE does not yet reflect: the binding constraint is **product identity and
the total absence of stranger evidence**, not implementation cleanliness [FILE: product
viability §1, §9; design review §8]. The plan therefore separates *product-validation*
work (critical path) from *implementation* work (gated behind it), and marks what still
needs evidence rather than canonizing it.

---

## 1. Project verdict

**What Archmage Ascension is most likely trying to become.** A 2–4 player, ~45-minute,
teach-in-ten card game whose table identity is a **visible dying Source** and a **growing
Spellbook monument**, with rummy-literate pattern play as the moment-to-moment verb
[INFER from product viability §10; design review V2 — both converge independently]. Echo /
5–6p and Ascension Trials are expansion shelf *if the core earns it*, not part of the
core promise.

**Strongest product version currently implied by the evidence.** Design review's **V2**
("the 2–4 player monument race"): the four patterns + Spellbook + Source clock + Drought +
the ladder's spirit, with the counter choreography simplified, Reshape absorbed by partial
Unlearn, scoring stated as one incremental sentence, and the Source made visible [FILE:
design review §5 V2, §8]. Product viability reaches the same destination but reorders the
priorities: **hook visibility before mechanical streamlining** — a cleaner game strangers
still can't see the point of is just a cleaner unremarkable game [FILE: product viability §10].

**What is still unproven** [GAP, all]: (1) the game is teachable from the box in ~10 min
with no designer present — every session to date needed verbal patching [FILE: rules-and-
teaching thread]; (2) the doom clock is a felt experience, not a face-down deck — no session
log records any player engaging the depletion [FILE: all 3 logs]; (3) the Drought *pays off*
rather than deleting the game's main verb [FILE: session 1 Phase-2 stall]; (4) a first game
produces one retellable moment (1 of 2 sessions did — the size-15 PT) [FILE]; (5) that the
game's "soul" lives at 2–4p rather than 5–6p — asserted, never compared live [GAP]. **Every
v2.8-defining rule is rig-validated only; zero live data exists on the current game** [FILE:
session dates 2026-05 vs decision dates 2026-07].

**What should be protected.** The protected hook (§2), and the assets that are genuinely
good and cheap: the four patterns, the Array, the Drought transition, the ladder's *spirit*
(capacity as the price of ambition), the working-system/meta layer and its checker, and the
honest playtest logs [FILE: product viability §4 "not a trap"].

**What should be paused.** Everything that hardens an unresolved branch into canon or into
physical/print/code artifacts before one stranger has played: card exports, Echo tuning,
`state.js`, Ascension Trials, further broad reviews, simulation expansion, and any rulebook
polish that does not directly enable a test (full stop list §5).

---

## 2. Protected hook

> **It's rummy where your melds stay alive as spell engines — but every spell you cast
> burns down the shared Source, and when it runs dry the biggest Spellbook wins.**

Every word of that sentence is supported by the current rulebook [FILE: turn structure,
Drought, scoring]. Note what it does *not* contain: counters, Recall, capacity, scoring
tables, Trials, Echo. **Standing rule: no change may make this hook less visible at the
table.**

**Why it is stronger than "wizard pattern-building."** Pattern-building with a wizard skin
describes dozens of games; it is a genre, not a hook [INFER: product viability §2]. The
protected hook names the one idea in the repo that is simultaneously novel, thematic, and
mechanically load-bearing: melds-as-live-engines (vs rummy/canasta, where melds are dead
points) **plus** a shared doomsday clock the players themselves accelerate. No mainstream
rummy-family game owns "spend the world's last magic to build proof of mastery before the
lights go out" [INFER: product viability §1].

**Systems that currently support it** [FILE]: the four patterns (the verb); the Spellbook
tableau (the monument); the Drought transition (the clock resolving); Conjuration's hidden
clock-burn (the acceleration tension — undocumented but real [INFER]); the ladder's spirit
(ambition has a price).

**Systems that currently hide it** [FILE]: the Source is a face-down deck nobody can read
(the hook is invisible — product viability F-F/W7); the dual-use counter pool + mid-turn
Recall is the #1 confusion and the first thing players meet (admin before idea — §F-B/F-J);
scoring is a 13×4 lookup revealed only at the end (the race is unwatchable — M2); the Drought
currently subtracts the verb instead of climaxing (F-C/F-I).

**What future changes must not damage.** The one-sentence hook's four visible objects —
**the dying Source, the living Spellbook, the clock race, the earned ending.** Any redesign
of counters, scoring, Drought, or player count is judged first by whether these four become
*more* visible at the table, not by whether the numbers balance [INFER: product viability §6
judgment rule].

---

## 3. Current project phase

**Classification: product-validation-gated.** (Not implementation-ready, not merely
decision-gated, not merely playtest-gated for balance.)

**Why.** The repo's *process/canon* layer is Kiro-ready — one machine-checkable canon file,
decision records with propagation checklists, an experiment with a revert kit [FILE: truth
audit §1, §9]. But ~80% of the remaining P1 surface sits behind three interlocking forks
(F1 counter system, F2 Echo, F10 product scope) that cannot close on current evidence [FILE:
forks audit §1]. Crucially, the two forks that gate the most work (F1, F2) close **only at a
table**, and the one that reframes both (F10) is a product-shape call — and *no unbiased
human has ever played the current game* [FILE: product viability §10]. Balance is being
solved with Stage-6 rigour while Stage-3 evidence (does the teach land, does the ending pay
off, does anyone replay) has a sample size of zero [INFER: product viability §10]. That is
the definition of product-validation-gated: the next real information does not come from
deciding or from balancing — it comes from putting the game in front of strangers.

---

## 4. Critical path — the next three phases

### Phase 1 — Safe hygiene (days, not weeks)
- **Goal:** make the repo trustworthy and the decision graph explicit, without touching any
  design branch. Keep effort capped — this is maintenance, not progress.
- **Allowed:** the safe-fix set (GLOSSARY truncation *verified natively first*; CON-1 "3-4"→
  "3-5"; energy-name pass; scoring-override rationale note; QUEUE cross-refs between the two
  counter forks; `_review` pointer repairs; experiment-baseline verification) [FILE: truth
  audit §7]; setting up the decision register (file 2); building the stranger-test kit as
  clearly-labelled **non-canon** artifacts (file 4B).
- **Forbidden:** any edit to counter/capacity/Recall text, Echo canonicity, scoring *values*,
  card exports, `state.js`, Trials, pitch, or visual-system promotion.
- **Exit criteria:** checker runs clean of trivial flags; the two counter P1s cross-reference
  each other; decision register live; GLOSSARY integrity resolved (recovered or confirmed a
  mount artifact); E1/E2 test kit printed.

### Phase 2 — Stranger / product validation (the critical path)
- **Goal:** obtain the project's first stranger evidence — specifically whether the hook is
  perceivable and whether anyone replays — while simultaneously resolving F1's text-vs-
  structure question. One evening does both [FILE: product viability §8 E1; design review T1/T4].
- **Allowed:** run the stranger-evidence plan (file 3), starting with the combined first
  session (E1 blind teach + F1 control-vs-gauge + E2 replay choice); Sam's cheap sequencing
  decisions (F10-as-test-sequencing, F3/F5/F6 principles, F8, F4, F14-hold); observation and
  recording only.
- **Forbidden:** implementing any fork branch into canon; Echo tuning; export/print;
  `state.js`; Trials; pitch; a *third* prose pass on counters; another broad review document.
- **Exit criteria:** ≥1 stranger session logged; F1 resolved (text vs structure) with T-metrics;
  a recorded replay-choice datum; the words strangers used to describe the game captured
  verbatim; F10 answerable as a product-shape call rather than a guess.

### Phase 3 — Rules implementation after evidence
- **Goal:** implement the *validated* direction cleanly, one closed decision at a time.
- **Allowed:** whichever counter branch the table chose, written to canon via a decision file
  + propagation checklist; Echo confirm-or-revert per RECORD; `state.js` ladder update *after*
  F2; final reference cards/rulebook/pitch/exports **only** for the validated scope.
- **Forbidden:** starting any of the above before its gating test result exists; canonizing a
  branch the session did not actually clear; regenerating print files before F1+F2 close.
- **Exit criteria:** each implemented change traces to a closed decision file whose evidence is
  stranger-table, not rig or friends-and-family.

---

## 5. Stop list

Work to pause now because it risks local optimization. Each names the evidence that unpauses it.

- **Card export / print regeneration** (`export-cs3/`, `export-printenbind/`). Prints rules
  text that F1/F2/F3 may rewrite; printenbind costs real money [FILE: forks audit F14; memory
  reference specs]. **Unpause when:** F1 and F2 are both closed at a table *and* F14 is decided
  "go" in the decision register.
- **Echo tuning** (wild count 4-vs-6, per-count Source sizing, any 5–6p tunable) [FILE: L4].
  Optimizes a suit that exists to serve an experiment that may revert, and whose parent product
  scope (F10) is unsettled. **Unpause when:** F10 lands on a band that keeps Echo *and* F2 is
  confirmed live.
- **`state.js` implementation** (ladder/capacity logic). Would bake in a counter branch and a
  ladder that are both unresolved [FILE: CON-8; QUEUE P2 self-gates it]. **Unpause when:** F1
  branch chosen and F2 confirmed.
- **Ascension Trials** (reconcile-to-2–6p work). Spends effort on a Stage-5 module gated behind
  Stage-4 anyway; stale 5–7p/no-Echo content [FILE: CON-6]. **Unpause when:** F8 decision file
  says "reconcile" — parking it (annotate + close the P3) is the correct move now.
- **Additional broad reviews.** This is the fourth review-chain document's territory; a fifth
  compounds analysis on two May playtests [FILE: L3]. **Unpause when:** ≥1 stranger session
  exists to review.
- **Simulation expansion.** The rig can't perceive fun/teach/theme and its agent never plays
  Transfiguration or PT — two of four spell types, including the one that made the only great
  moment [FILE: L2; SCORING_REBALANCE method note]. **Unpause when:** a *confirmed table finding*
  raises a specific balance question only the rig can answer.
- **Rulebook polishing that does not support a test.** A third counter-prose pass is the
  definitional local optimum — comprehension failure already survived three written surfaces +
  verbal teaching [FILE: L1]. **Unpause when:** a stranger session shows a *specific* passage
  misread that new text could plausibly fix (control-arm text for E1 is the only sanctioned
  prose work now).

**Meta-rule (adopt):** any system iterated twice without new *table* evidence is escalated to a
redesign/cut decision, not a third iteration [FILE: product viability §9].

---

## 6. What this plan deliberately does *not* do

It does not canonize V2 or the 2–4p band — F10 stays open, marked as needing the comparison
datum [GAP]. It does not close F1/F2 on paper — they are table calls. It does not treat the
review docs as canon — they are evidence (file 5). It is not a Kiro queue (that is file 4) nor a
counter-system redesign (that is the recommended next *deep-dive*, and it is gated: it should
produce the E1 session kit, not a canon rewrite).
