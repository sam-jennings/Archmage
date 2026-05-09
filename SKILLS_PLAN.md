---
title: Skills Implementation Plan
type: build-plan
created: 2026-05-02
status: ready-to-build
---

# Skills Implementation Plan

> Build plan for the six project-state skills that operate the Archmage Ascension workflow. Hand this file to a build session and execute one skill at a time, in order.
>
> Prerequisite: the project structure cleanup completed 2026-05-02 (5 working files at root: PROJECT, STATE, BACKLOG, DECISIONS, PLAYTESTS, plus playtests/).

---

## Build order and rationale

| # | Skill | Build first because... |
|---|-------|------------------------|
| 1 | `aa-state-keeper` | Every other skill reads/writes STATE.md. Get its file contract right first. |
| 2 | `aa-decision-recorder` | Mechanically simple (append to log); validates the side-effect pattern other skills will follow. |
| 3 | `aa-backlog-curator` | Owns BACKLOG.md, which `aa-next-action` reads. Build before `aa-next-action`. |
| 4 | `aa-next-action` | Read-only across all four files; needs the other three to exist for handoffs to work. |
| 5 | `aa-playtest-runner` | Replaces existing `playtest-organiser`. Builds on the side-effect pattern from skill 2. |
| 6 | `aa-playtest-planner` | Builds on `aa-playtest-runner`'s session file format. Last because it's the only purely forward-looking skill. |

Each skill takes ~30–60 minutes to build and test. Build sequentially, testing each before starting the next.

---

## Conventions all six skills share

These conventions go into every SKILL.md. Defining them once here.

### File contracts

| File | Read by | Written by | Format |
|------|---------|-----------|--------|
| `PROJECT.md` | All skills (orientation) | Sam (rare) | Free-form markdown with frontmatter |
| `STATE.md` | All skills | `aa-state-keeper` only | Strict structure (see Skill 1) |
| `BACKLOG.md` | `aa-next-action`, `aa-playtest-planner` | `aa-backlog-curator` only | Strict structure (see Skill 3) |
| `DECISIONS.md` | `aa-state-keeper`, `aa-next-action` | `aa-decision-recorder` only | Append-only (see Skill 2) |
| `PLAYTESTS.md` | All skills | `aa-playtest-runner` only | Append-only index table (see Skill 5) |
| `playtests/YYYY-MM-DD-session-N.md` | `aa-playtest-planner`, `aa-playtest-runner` | `aa-playtest-planner` (creates), `aa-playtest-runner` (completes) | Course §13 template |

**One-writer rule:** if a skill needs to update a file it doesn't own, it hands off to the owner skill. This is the pattern that lets the system stay coherent without locking.

### Frontmatter on every working file

Every write to STATE/BACKLOG/DECISIONS/PLAYTESTS updates the frontmatter:

```yaml
---
title: <unchanged>
type: <unchanged>
updated: 2026-05-02     # actual date of write
updated_by: aa-state-keeper   # skill name doing the write
---
```

This makes drift visible: if STATE.md says `updated: 2026-04-15` and you're in May, the state is stale.

### Handoff pattern

When a skill needs to invoke another, it doesn't call the second skill directly — it returns a recommendation to the user. The user accepts (or doesn't), and the second skill triggers naturally on the user's next message.

Example — `aa-playtest-runner` finishes processing a session:

```
✅ Session logged. Updated PLAYTESTS.md and playtests/2026-05-09-session-01.md.

Recommended next steps:
1. Update STATE.md — your hypothesis was confirmed; ready to set the next current problem.
   → Say "update state" to run aa-state-keeper.
2. Add follow-up tasks to BACKLOG.md (3 items found in the session notes).
   → Say "update backlog" to run aa-backlog-curator.
```

This keeps the human in the loop on every state change while still being one-prompt-per-step.

### Course-knowledge references

Every skill cross-references specific sections of `course-knowledge/Game Design Execution System.md`. Skills must read the relevant section *before* acting, not just cite it. The Read calls go in each skill's "Process" block.

### Reading order for every skill at startup

1. `PROJECT.md` (orientation)
2. `STATE.md` (current stage and problem)
3. The skill's own owned file
4. Other working files only as needed

Don't preemptively load all of course-knowledge — load specific sections when the process step calls for them.

---

## Skill 1 — `aa-state-keeper`

**Owns:** `STATE.md`

**Purpose:** Keep STATE.md as a *consequence* of decisions and tests, not a separately-maintained dashboard.

### Triggers

Strong (always trigger):
- "what's my current state?"
- "update state"
- "I'm now in stage X"
- "we just decided…"
- "the playtest is done, update state"

Soft (suggest in handoff):
- After any `aa-decision-recorder` run that resolves the current problem
- After any `aa-playtest-runner` run that confirms or refutes a hypothesis
- At the start of any Cowork session that hasn't read STATE.md in the last 7 days

### STATE.md structure (strict — every section header is mandatory)

```markdown
---
title: Current State
type: state
updated: YYYY-MM-DD
updated_by: aa-state-keeper
---

# Current State

## Stage
<one of: Stage 0 Orientation / Stage 1 Core Concept / Stage 2 Fast Prototype / Stage 3 Core Loop Testing / Stage 4 Structural Iteration / Stage 5 Content Expansion / Stage 6 Usability and Rules / Stage 7 Validation / Stage 8 Pitch Prep>
<followed by 1-2 sentences explaining what that means for this game right now>

## Target player
<one paragraph, specific — never "everyone" or "strategy gamers" alone>

## Core experience
<one paragraph — the feeling the game is trying to produce>

## Current problem
<one sentence — the single thing currently stopping the game from being good>

## Current hypothesis
<one sentence in the form: "If I [X], then [Y]." OR "_None set._">

## Next playtest goal
<one sentence — the question the next session must answer>

## Biggest current risk
<one sentence — the thing most likely to kill the design>

## Not doing yet
<bulleted list — work that's deliberately postponed, with the reason in parens>
```

### Process

1. Read PROJECT.md, current STATE.md, last 3 entries from DECISIONS.md, last 2 entries from PLAYTESTS.md
2. Read course `Game Design Execution System.md` §5 (Current State Tracker) and §6 (Stage Gates) for the current stage
3. Identify which sections of STATE.md are out of date by comparing them to the recent decisions/playtests
4. Ask Sam ONE focused question per stale section (use AskUserQuestion). Never more than 3 questions per run.
5. Rewrite STATE.md atomically — never partial updates
6. End with a handoff suggestion if the new state surfaces obvious follow-ups (usually `aa-backlog-curator` or `aa-playtest-planner`)

### Anti-drift checks

When updating Stage:
- If moving forward a stage, read course §6 (Stage Gates) and check the gate criteria for the previous stage. If the gate isn't passed, push back: "You're saying you're at Stage 4 but Gate C requires X — do you want to update anyway, or stay at Stage 3?"
- If moving backward a stage, just confirm — backward moves are healthy

When updating "Not doing yet":
- If Sam removes something from this list (i.e. starting work on it), check whether it's stage-appropriate. E.g. "Final card art" being removed in Stage 3 should trigger Anti-Drift Rule 2.

### Success criteria

- STATE.md is always one of: empty template, partially filled with `_to confirm_` placeholders, or fully filled with current values.
- The `updated` frontmatter field is always today's date when the skill finishes.
- No section ever contains contradictory info between fields (e.g. Stage 3 + "ready to pitch" in another field).

### What it does NOT do

- Doesn't write to BACKLOG, DECISIONS, or PLAYTESTS — only suggests handoffs
- Doesn't make design recommendations — only records what Sam tells it
- Doesn't ask more than 3 questions in one run

---

## Skill 2 — `aa-decision-recorder`

**Owns:** `DECISIONS.md`

**Purpose:** Run every design decision through the course's Decision Engine before logging, so decisions are evidence-based rather than impulse-based.

### Triggers

Strong:
- "log this decision"
- "we decided to…"
- "I've decided to…"
- "record that I'm going to…"

Soft:
- When `aa-next-action` user accepts a recommendation
- When `aa-playtest-runner` identifies a clear "Decision: …" outcome from a session
- When Sam describes a design change in conversation without explicitly asking to log it (offer: "Want me to log this in DECISIONS.md?")

### DECISIONS.md structure

Append-only. Newest entry at the top, immediately under the `# Decision Log` heading:

```markdown
## YYYY-MM-DD — <one-line summary of the change>
**Change:** <what specifically changed — be concrete>
**Why:** <the evidence or reasoning — name playtests, prior decisions, or constraints>
**Stage:** <current stage from STATE.md, plus what category of work this is>
**Affected:** <files, components, rules — be specific so future-Claude can find what changed>
**Status:** <one of: Done / Testing / Reverted / Superseded>
```

### Process

1. Read STATE.md (for current stage), recent DECISIONS entries (to check for supersession)
2. Read course `Game Design Execution System.md` §8 (Decision Engine)
3. Apply the Decision Engine filter:
   - **Step 1 — Name the problem.** Is the problem this decision solves stated clearly? If not, ask.
   - **Step 2 — Name the desired player behaviour.** What should players do differently? If not stated, ask.
   - **Step 3 — Name the desired emotional effect.** What should it feel like? If not stated, ask.
   - **Step 4 — Predict the consequence.** What else does this likely affect? If not stated, ask.
4. Read course §9 (Anti-Drift Rules). Check if the decision violates one. If so, surface it: "This decision adds content but you're at Stage 3, where Rule 1 says don't add content to fix boredom. Log anyway?"
5. Write the entry. Update frontmatter.
6. Suggest handoffs:
   - If the decision changes the current state (e.g. resolves the current problem) → suggest `aa-state-keeper`
   - If the decision generates new tasks (rulebook update, card iteration) → suggest `aa-backlog-curator`
   - If the decision affects the rulebook → suggest `archmage-rulebook-manager`
   - If the decision affects card design → suggest `archmage-card-designer`

### Anti-drift checks

- **Don't log non-decisions.** "Sam is thinking about X" is not a decision. Push back: "Sounds like you're still deciding — want to add this to BACKLOG.md as a decision-to-make instead?"
- **Don't log without evidence in playtest-driven stages (3, 4, 7).** If Stage is one of these and the decision isn't backed by a playtest or observation, ask: "Is this based on a playtest or a hunch? Hunches are fine but should be tagged as such."

### Success criteria

- Every entry has all five fields filled in.
- Decisions that fail the Decision Engine filter never get logged unfiltered — Sam either fills in the missing pieces or chooses not to log.
- Decisions affecting other files always trigger appropriate handoff suggestions.

### What it does NOT do

- Doesn't apply decisions to other files (rulebook, cards) — only logs and hands off
- Doesn't make recommendations about whether the decision is *right* — only checks the Decision Engine criteria

---

## Skill 3 — `aa-backlog-curator`

**Owns:** `BACKLOG.md`

**Purpose:** Maintain a stage-aware, prioritised list of tasks and pending decisions so `aa-next-action` always has a clean input.

### Triggers

Strong:
- "add to the backlog"
- "I just thought of…"
- "I need to decide whether to…"
- "re-prioritise the backlog"
- "what's on my list?"
- "remove X from the backlog"

Soft:
- After `aa-playtest-runner` identifies follow-up work
- After `aa-state-keeper` updates the stage
- After `aa-decision-recorder` logs a decision that closes a backlog item

### BACKLOG.md structure (strict)

```markdown
---
title: Backlog
type: backlog
updated: YYYY-MM-DD
updated_by: aa-backlog-curator
---

# Backlog

## Tasks
- [P1] [tag] <description> (optional: blocks/blocked-by note)
- [P2] [tag] <description>
...

## Decisions to make
- [P1] <decision question> (optional: blocked by a playtest or other decision)
...

---

## Archive
- 2026-05-09 — [P2] [test] Run hidden-Aether playtest (resolved by session-01 — see DECISIONS.md)
```

**Tags (mandatory):** `[test]` `[design]` `[rules]` `[card]` `[pitch]` `[art]` `[business]` `[admin]`

**Priorities:** `P1` (do next) → `P2` (do soon) → `P3` (do later) → `P4` (eventually). No P0 — if it's truly urgent it's P1.

### Stage-aware priority rules

When adding or re-prioritising, apply these rules from the current stage in STATE.md:

| Current stage | Auto-deprioritise these tags | Reason |
|---------------|-----------------------------|--------|
| Stage 0–2 | `[card]` `[art]` `[pitch]` `[business]` to P3+ | Don't polish what doesn't exist yet |
| Stage 3 (current) | `[card]` `[art]` `[pitch]` to P3+ | Anti-Drift Rules 1 & 2 |
| Stage 4 | `[art]` `[pitch]` to P3+ | Structure first |
| Stage 5 | `[pitch]` to P3+ | Content first |
| Stage 6 | `[business]` to P3+ | Ship first |
| Stage 7–8 | (no auto-deprioritisation) | All work is now relevant |

If Sam tries to add an item that auto-deprioritises, surface the rule: "I'm adding this as P3 because you're at Stage 3 and `[art]` work is deferred. Want it at a higher priority anyway? (e.g. if it's blocking a playtest)"

### Process

1. Read STATE.md (for current stage), current BACKLOG.md
2. Read course `Game Design Execution System.md` §9 (Anti-Drift Rules) once per session, cache for the rest of the run
3. For each new item:
   - Determine the appropriate tag (ask if ambiguous)
   - Apply stage-aware priority
   - Check anti-drift rules — surface any violations before adding
   - Insert into the appropriate section
4. For re-prioritisation:
   - Re-evaluate every item against the current stage's rules
   - Move items that have shifted priority
   - Move completed items to Archive with date and resolution
5. Rewrite BACKLOG.md atomically. Update frontmatter.
6. Show Sam a diff summary at the end: "Added 2, re-prioritised 3, archived 1."

### Special operations

**"Show me the next 3 P1s"** — print without modifying the file.

**"What's blocked?"** — list items with `(blocked by ...)` notes and what they're blocked by.

**"Archive completed"** — scan for items the user has marked done in conversation; move them to Archive with date.

### Success criteria

- Every item has both a priority and a tag.
- The Archive at the bottom never gets re-promoted to active without user confirmation.
- Stage-aware rules are applied consistently — same input on different days produces the same priority.
- The file is sorted: P1s before P2s, etc., within each section.

### What it does NOT do

- Doesn't decide what Sam should *do* — that's `aa-next-action`'s job
- Doesn't add items proactively without Sam mentioning them — only when called
- Doesn't delete items — always archives

---

## Skill 4 — `aa-next-action`

**Owns:** nothing — read-only across all project files; recommends, doesn't write.

**Purpose:** Answer "what should I do next?" with one specific recommendation, applying the course's resolver to the current state.

### Triggers

Strong:
- "what should I work on next?"
- "I'm stuck"
- "I have an hour, what's most valuable?"
- "what's blocking me?"
- "what's the next move?"
- "I don't know what to do"

Soft:
- At the start of any Cowork session if STATE.md or BACKLOG.md was updated since the last session
- When Sam expresses uncertainty in conversation ("I'm not sure where to focus", "I've been going in circles")

### Output format (strict — one recommendation, never a list)

```
**Recommended next action:** <one specific task, in imperative form>

**Why:** <2-3 sentences — connect this to STATE.md's current problem and to the course's resolver>

**This will tell you:** <what Sam will learn from doing this — the diagnostic value>

**Time estimate:** <rough — minutes / hours / a session>

**Hand off to:** <which skill picks up after this, if any — e.g. `aa-playtest-planner`>
```

If Sam pushes back or says "give me options", THEN list 2-3 alternatives — but always lead with one recommendation.

### Process

1. Read PROJECT.md, STATE.md, BACKLOG.md (P1s only first; expand if needed), last 2 PLAYTESTS entries, last 3 DECISIONS entries
2. Read course `Game Design Execution System.md` §24 (The "What Should I Do Next?" Resolver) and §10 (Core Questions)
3. Match STATE.md's current problem to the resolver's branches:
   - "Don't know what the game is" → return to target player / core experience
   - "Game exists but is boring" → return to core loop / meaningful choices
   - "Game is interesting but messy" → subsystem audit / turn-flow simplification
   - "Game works but feels flat" → emotional design / memorable moments
   - "Game is fun but confusing" → rulebook / card layout / icons
   - "Game seems ready but uncertain" → blind testing / market comparables
4. Cross-check against BACKLOG P1s — is the highest-priority backlog item aligned with the resolver's recommendation?
5. Pick ONE recommendation. Write the output in the strict format above.
6. Suggest the appropriate handoff at the end.

### Anti-drift checks

- **Never recommend `[art]`/`[card]`/`[pitch]` work in stages 0–4** unless STATE.md has explicit justification (e.g. "Card legibility is the current problem")
- **Never recommend "add a new mechanic"** if the current problem is "boring" (Anti-Drift Rule 1)
- **Never recommend a content addition** if there are unresolved playtest issues from the last 2 sessions
- If Sam is in Stage 3 and asks "what should I do next?" three times in a week without running a playtest, the answer is **always**: "Run a playtest." Don't be tempted into design conversations that defer the test.

### Special triggers

**"I have N hours/minutes"** — match the recommendation to the time available. Quick: backlog grooming, a single decision, a card iteration. Medium: planning a session, drafting rulebook section. Long: running a playtest, processing previous session notes.

**"What's blocking me?"** — read BACKLOG for `(blocked by ...)` notes, then check if the blockers themselves are P1. Surface the blockers, recommend unblocking the highest-leverage one.

### Success criteria

- One recommendation per response, not a list (unless Sam explicitly asks).
- The recommendation is connected to STATE.md's current problem in the "Why".
- The handoff is correct — it points to the skill that will actually pick up the next step.

### What it does NOT do

- Doesn't write to any file — purely advisory
- Doesn't make design decisions — recommends what to *learn* next, not what to decide
- Doesn't list 5 options when 1 will do

---

## Skill 5 — `aa-playtest-runner`

**Owns:** `PLAYTESTS.md` and the session detail file in `playtests/`. Replaces the existing `playtest-organiser` skill.

**Purpose:** Convert raw session notes into a structured log entry, triaged feedback, and concrete backlog updates.

### Triggers

Strong:
- "here's my notes from last night"
- "ran a session, here's what happened"
- "process this feedback"
- "log the playtest"
- Any message that pastes raw playtest observations

Soft:
- When Sam mentions running a session ("just played with X tonight") even if no notes are attached — offer: "Want to log it now while it's fresh?"

### Session file structure (`playtests/YYYY-MM-DD-session-N.md`)

```markdown
---
title: Session N — YYYY-MM-DD
type: playtest-session
date: YYYY-MM-DD
players: N
version: vX.Y
goal: <one sentence — what the session was meant to answer>
verdict: <one sentence — the most important finding>
---

# Session N — YYYY-MM-DD

## Goal
<from the planner if a plan exists, otherwise inferred from notes>

## Hypothesis being tested
<from STATE.md at time of session>

## What happened
- <chronological highlights>

## What worked
- <evidence-backed positives>

## What failed
- <evidence-backed negatives>

## What confused players
- <specific moments of confusion>

## Best moment
<one moment, with what triggered it>

## Worst moment
<one moment, with what triggered it>

## Player quotes
> "exact words" — moment in the session

## Triaged feedback
### Keep (act on)
- <issue> — <why: matched multiple players / matched observed behaviour / points to core problem>

### Clarify (probably communication, not design)
- <issue> — <why: only one player struggled / wording issue / hierarchy issue>

### Ignore for now
- <issue> — <why: contradictory / outside target audience / scope shift / unfinished polish>

## Diagnosis
**Observed:** <what actually happened>
**Expected:** <what was hoped for>
**Mismatch:** <the gap>
**Likely cause:** <best guess>
**Decision:** <Keep / Remove / Simplify / Clarify / Expand / Test again>

## Next hypothesis
<one sentence in form: "If I [X], then [Y].">

## Generated backlog items
- [tag] <follow-up>
- [tag] <follow-up>
```

### PLAYTESTS.md row format

```
| YYYY-MM-DD | N | vX.Y | <goal> | <verdict> | [link](playtests/YYYY-MM-DD-session-N.md) |
```

### Process

1. Read STATE.md (current hypothesis), the session plan if it exists in `playtests/` for today, last 2 PLAYTESTS entries
2. Read course `Game Design Execution System.md` §13 (Playtest Note Template), §14 (Reading Feedback Correctly), §15 (Clarity vs Design Test)
3. Parse Sam's raw notes:
   - Extract chronology, quotes, confusion points, engagement signals
   - If notes are very sparse, ask 3 quick questions to fill the highest-leverage gaps (best moment / worst moment / what confused them most)
4. Apply §14 triage to every observation: Keep / Clarify / Ignore
5. Apply §15 Clarity vs Design test to each "Keep" item
6. Build the diagnosis using the Observed/Expected/Mismatch/Likely cause/Decision template
7. Generate concrete backlog items for each "Keep" issue
8. Write the session detail file
9. Append to PLAYTESTS.md (newest at top)
10. Suggest handoffs:
    - "Sam, the backlog has 3 new items — say 'update backlog' to add them via aa-backlog-curator."
    - "STATE.md's hypothesis was [confirmed/refuted/unclear] — say 'update state' to revise."
    - If the session resolved a decision-to-make: "Want to log a decision in DECISIONS.md?"

### Anti-drift checks

- **If multiple players reported the same issue, it goes in Keep, never Ignore.** No exceptions.
- **If Sam wants to act on a single-player complaint, push back.** "Only one player flagged this — the course (§14) says wait for multiple reports before treating it as Keep."
- **If the session goal in the plan doesn't match the analysis being done**, surface it. "The plan was to test counter-system clarity, but most of your notes are about scoring pace. Want to refocus, or update the goal?"

### Special handling

**Notes from a session that wasn't planned via `aa-playtest-planner`:** Still works — just infer the goal from the notes themselves and ask Sam to confirm.

**Sparse notes ("it went OK, players liked the array"):** Ask the four core debrief questions from the Playtest Guide (favourite part / least favourite / what confused / was it fun why).

**Multi-session notes in one prompt:** Process each separately, create one session file per session, append separate rows to PLAYTESTS.md.

### Success criteria

- Every session produces both a row in PLAYTESTS.md AND a detail file in `playtests/`.
- Every "Keep" issue translates to at least one concrete backlog item.
- The diagnosis fields are always filled — no blank Observed/Expected/Mismatch.
- Handoff suggestions are surfaced at the end of every run.

### What it does NOT do

- Doesn't update STATE.md or BACKLOG.md directly — only suggests handoffs
- Doesn't decide whether the game is good — only logs what was observed
- Doesn't process the same session twice — checks for an existing file with today's date first

---

## Skill 6 — `aa-playtest-planner`

**Owns:** writes a session-plan draft into `playtests/YYYY-MM-DD-session-N.md` (which `aa-playtest-runner` later completes).

**Purpose:** Turn the current hypothesis into a focused, single-variable session plan so Sam runs sessions that actually answer questions.

### Triggers

Strong:
- "plan a playtest"
- "I have a session on Friday"
- "what should I test next session?"
- "how do I structure this test?"
- "help me prep for tomorrow's session"

Soft:
- After `aa-state-keeper` updates the current hypothesis — offer: "New hypothesis. Want to plan the session that tests it?"
- When `aa-next-action` recommends running a playtest — offer to plan it

### Plan file structure (created by planner, completed by runner)

```markdown
---
title: Session N — YYYY-MM-DD (planned)
type: playtest-session
date: YYYY-MM-DD
players: <N>
version: <vX.Y>
goal: <one sentence — what this session must answer>
status: planned
---

# Session N — YYYY-MM-DD (planned)

## Goal
<the single question this session must answer>

## Hypothesis being tested
<from STATE.md — verbatim>

## Variable being tested
<the ONE thing changed since the last session>

## Test stage (course §12)
<one of: Solo Dry Run / First Real Test / Local Iteration / External-Blind>

## Pre-session checklist
- [ ] <component or rule changes ready>
- [ ] <prior version backed up if needed>
- [ ] <materials needed>

## What to watch for
### Confusion signals
- <specific things that would indicate the hypothesis is wrong>

### Engagement signals
- <specific things that would indicate the hypothesis is right>

### Pacing signals
- <duration / phase length expectations>

## What success looks like
<one paragraph — if this happens, the hypothesis is confirmed>

## What failure looks like
<one paragraph — if this happens, the hypothesis is refuted>

## What NOT to look at this session
<bulleted list — things deliberately deferred to keep the test focused>

## Mid-game check-in question
<one question to ask players around the midpoint — from Playtest Guide>

## Post-game debrief (course §13 + Playtest Guide)
1. What was your favourite part?
2. What was your least favourite part?
3. What confused you?
4. Was it fun? Why or why not?
5. <one custom question specific to the hypothesis>
```

### Process

1. Read STATE.md (current hypothesis, current problem), BACKLOG.md (P1 [test] items), last PLAYTEST entry, the root-level `Playtest Guide - New Player Session.md`
2. Read course `Game Design Execution System.md` §11 (Mapping Mechanics to Experience), §12 (Playtesting Protocol), §13 (Playtest Note Template)
3. Confirm or extract:
   - The hypothesis (from STATE.md — if "_None set._", push back: "STATE.md has no current hypothesis. Run aa-state-keeper first to define one, or tell me what you want to test.")
   - The single variable being changed (if more than one, surface Anti-Drift Rule 6 and force a choice)
   - Player count and audience type
   - Test stage from §12
4. If the hypothesis involves a mechanic, apply §11 (Mapping Mechanics to Experience) and include the analysis in the plan
5. Generate the watch-for / success / failure criteria specific to the hypothesis
6. Write the file at `playtests/YYYY-MM-DD-session-N.md` with `status: planned`
7. Print a one-page summary for Sam to read before the session

### Anti-drift checks

- **One variable per session.** If Sam wants to change two things, surface Rule 6 and force a choice. "Pick one — counter system OR scoring pace. Test the other next session."
- **No content additions in test sessions during Stages 3–4.** "You're testing whether the existing system works. Adding new cards muddies the result."
- **Don't plan a session if the previous session's notes haven't been processed.** "Last session (2026-04-26) hasn't been logged yet. Process those notes first via aa-playtest-runner so this session has clean ground to build from."

### Special handling

**No hypothesis in STATE.md:** Refuse to plan. Suggest `aa-state-keeper` first.

**New-player session:** Reference the root-level `Playtest Guide - New Player Session.md` directly and tailor the plan to that guide's structure rather than reinventing it.

**Session with experienced playtesters who've seen the game before:** Skip the teaching block, use a more pointed mid-game check-in, debrief more aggressively for negative feedback.

### Success criteria

- Every plan has exactly one variable being tested.
- Success and failure criteria are concrete enough that anyone watching the session could call it.
- The plan file is created with `status: planned` and gets updated to a full session entry by `aa-playtest-runner` after the session.

### What it does NOT do

- Doesn't run the session
- Doesn't process notes — that's `aa-playtest-runner`
- Doesn't plan sessions for hypotheses that aren't in STATE.md

---

## Cross-skill integration test

After all 6 skills are built, run this end-to-end test to confirm the system works as a loop:

1. **Start:** STATE.md has a current problem and "_None set._" hypothesis.
2. Run `aa-state-keeper` — set a hypothesis.
3. Run `aa-playtest-planner` — generate a session plan.
4. (Manually simulate a session — paste fake notes.)
5. Run `aa-playtest-runner` — process the notes, generate backlog items.
6. Run `aa-backlog-curator` — apply the new items.
7. Run `aa-decision-recorder` — log the resulting decision.
8. Run `aa-state-keeper` — confirm STATE.md is updated to reflect the new state.
9. Run `aa-next-action` — confirm it recommends something coherent given the updated state.

If the loop closes cleanly with no manual file edits, the system works.

---

## Build template (use for each skill)

When building each skill, create:

```
<skill-name>/
├── SKILL.md              ← main skill file
└── references/           ← any cached snippets from course-knowledge (optional)
    └── <topic>.md
```

Each `SKILL.md` follows the structure used by `board-game-designer.skill`:

```markdown
---
name: <skill-name>
description: <triggering description — see Triggers section above>
---

# <skill-name>

<one-paragraph purpose statement>

## Triggers
<from this plan>

## Process
<from this plan, step by step>

## File contracts
<which files this skill reads and writes>

## Anti-drift checks
<from this plan>

## Output format
<example output and any strict formatting>

## Handoff suggestions
<which other skills this one suggests calling next>
```

Package as `.skill` (zip) and place in `skills/`.

---

## Notes for the build session

- Each skill should be tested with at least one realistic input before moving to the next.
- Don't build all six in one session — fatigue will degrade quality. Two skills per session, max.
- After Skill 1 (`aa-state-keeper`), populate STATE.md with real values for Sam's current state — that becomes the test fixture for every subsequent skill.
- Keep the existing `playtest-organiser.skill` until `aa-playtest-runner` is built and verified, then delete it.
- The `board-game-designer` skill stays as the meta/knowledge layer — none of the new skills replace it.
