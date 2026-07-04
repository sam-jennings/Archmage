---
title: Using the Working System
type: guide
updated: 2026-07-03
---

# Using the working system

This is the one document written for *you*, not the agent. It explains how to work with
the `meta/` system day to day. The whole point of the design: **you don't maintain
anything.** You do the game-design work and talk to the agent normally; the agent keeps
`meta/` in sync as a side-effect, and a checker catches anything it missed at the start of
the next session. You never hand-edit files in `meta/`.

If you remember nothing else: **just work and talk naturally, and start each session by
asking for the brief.** Everything below is detail.

## The mental model

- `meta/` is the project's memory (threads, to-do queue, decisions, canon facts, layout).
- The **agent** writes to it while doing real work.
- `meta/checks/check.mjs` is a script that detects when the agent forgot something. Its
  output is your **session brief** — a computed snapshot, so it can never be stale.
- Flags in the brief are normal. A flag resurfacing every session isn't nagging — it's the
  system holding an unfinished job in view until it's actually done.

## Starting a session

**In Kiro:** trigger the *"Working-system check (session brief)"* hook, or just ask
"what's the state?" / "what should I work on?" The agent runs the checker and gives you the
brief.

**In Claude Cowork:** the `aa-system` skill does the same thing — start by asking for the
state and it runs the checker and reads `meta/process.md`.

Either way you get: the **threads** table (your active/parked lines of work), the **P1**
items, any decisions with **open propagation**, and **flags**. Skim it, pick what you want
to do. The agent will not force you to do things in any particular order.

## While you work — how to say things so they stick

You don't file anything yourself. You just phrase things clearly enough that the agent
knows what kind of thing it is. Useful cues:

- **Making a decision:** say it plainly — "we're going with X." If you're settling
  something, the agent writes a decision file, updates `canon.yml`, and lists the files
  that now need to change. If it's ambiguous, it will ask once: *"Decision, or still
  exploring?"* Answer honestly — that answer is what separates canon from experiment.
- **Trying something you might undo:** say "this is an experiment" or "I might revert
  this." The agent snapshots the affected files into a `baseline/` before touching them,
  so reverting later is just copying them back (git isn't used for reverts here). The
  change is marked *under-test* so it can't masquerade as settled.
- **Spotting a bug or idea mid-flow:** just mention it. It goes into `meta/QUEUE.md`
  immediately, tagged by priority and thread. It won't get lost in a side conversation.
- **After a playtest:** tell the agent you played, even without written notes — it will
  walk you through logging it. Findings and action items get captured and mirrored to the
  queue in the same pass, so a bug found at the table can't die in the session file.
- **Switching topics:** the agent updates the thread you're leaving with where it stands
  and the single next action ("campsite rule"), so you can resume it cold weeks later.

## Asking what to work on

Say "what's next?" and the agent reads the queue and threads and lays out options with
tradeoffs — including a heads-up if something cuts against the current stage or an
anti-drift rule. That's advice, not a gate: **you pick, it proceeds.** It won't refuse or
make you do a prerequisite first. At most you'll get one short reminder, once.

## Ending a session

Ask the agent to "wrap up," or just let the campsite updates happen as you switch threads.
The goal is that every thread you touched has a current `next` line before you leave. If
you forget, the checker flags stale threads next time — one session late, never never.

## What only *you* can do

The agent maintains everything inside the repo, but a few things are yours:

- **Cowork skill management.** Installing or removing skills happens in Cowork's
  Settings → Capabilities, which the agent can't touch. **Right now there's one pending
  action:** install `skills/aa-system.skill` and remove the six old `aa-*` skills
  (`aa-state-keeper`, `aa-next-action`, `aa-backlog-curator`, `aa-playtest-planner`,
  `aa-playtest-runner`, `aa-decision-recorder`). Until you do, they'll keep firing on old
  triggers and writing to files that no longer exist. The checker flags this until it's
  done (it's the open box on the `working-system-v2` decision).
- **The actual thinking and playtesting.** Design calls, what to test, whether an
  experiment passed or should be reverted — those are yours. The system records and
  enforces your decisions; it doesn't make them.
- **Deciding a revert.** Say the word and the agent restores the baseline.

## Reading the checker flags

The brief groups flags by area:

- `vocab` — a retired term (e.g. "Convergence") still appears in content. Won't clear
  until every occurrence is purged. This is your guarantee a dropped term can't linger.
- `decisions` — a decision has unmade edits (open propagation boxes). Clears when the
  listed files are actually changed and the boxes ticked.
- `structure` — a file is in the wrong place or not declared in `meta/manifest.yml`.
- `threads` — an active thread has gone stale or is missing its `next` action.
- `queue` — something was captured somewhere (a playtest note, a `_review/` doc) but never
  mirrored into the queue.

You don't fix these yourself — point the agent at them, or it handles the trivial ones on
its own during the session brief.

## Switching between Kiro and Cowork

Nothing special. Both tools read the same `meta/` files and run the same checker; the only
difference is how the checker gets triggered (Kiro hook vs Cowork skill). Whichever tool
you open, start with the brief and you're in sync — the previous tool's writes are already
on disk. The one thing that lives outside the repo, and so doesn't travel, is your set of
installed Cowork skills — hence the manual skill step above.

## If something feels off

Run `node meta/checks/check.mjs` (or ask the agent to). If the system has drifted, the
brief will say how. If the checker itself is clean but something still feels wrong, tell
the agent — a clean check plus a real problem usually means a capture rule is missing a
detection rule, which is a `meta/process.md` change, not a you problem.
