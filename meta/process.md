---
title: Working-System Process
type: process
updated: 2026-07-03
---

# How this project runs

This is the single source of process truth. The Cowork `aa-system` skill and the Kiro
steering/hooks point here and add nothing of their own. If a rule changes, it changes
here and nowhere else.

Contract: **every capture rule below has a matching detection rule in
`meta/checks/check.mjs`.** Sam never hand-edits anything in `meta/` — the agent
maintains it as a side-effect of doing the actual work. A missed side-effect write is
expected occasionally; the checker surfaces it at the start of the next session.

## 0 — Session start

1. Run `node meta/checks/check.mjs` from the project root. Its output IS the session
   brief: threads table, P1s, open decision propagation, drift flags. Orientation is
   computed, never stored — do not look for a dashboard file.
2. Read the thread file for whatever Sam wants to work on. Read `PROJECT.md` and
   `meta/canon.yml` if unfamiliar with the project.
3. Mention checker flags relevant to today's work in one or two lines. Fix trivial
   ones (< 2 min) immediately; add the rest to QUEUE. Never lecture about flags.

## 1 — Threads (`meta/threads/`)

One file per **multi-session line of work** (single tasks stay in QUEUE only). Each
carries its own goal, hypothesis, and `next` — there is no global "current focus".

- **Campsite rule:** before the session ends or the conversation switches thread,
  update the thread file: where this stands, the single `next` action, context needed
  to resume. Update `updated:` every time.
- Parking is explicit: set `status: parked` and fill "Context needed to resume".
- Statuses: `active | parked | done`. Detection: active threads untouched 21+ days,
  or missing `next`, get flagged.

## 2 — QUEUE (`meta/QUEUE.md`)

The only to-do list. Tasks and decisions-to-make live together, tagged
`[P1]`–`[P3]`, `[area]`, and `[decide]` for open decisions. A **Deferred** section
holds not-doing-yet items *with their reasons* (fuel for advisory reminders, §6).

**Routing rule: capture where it happened, mirror to where it's retrieved.** Any
actionable item discovered anywhere (playtest, conversation, code work) is written
where it surfaced as `ACTION: ...` and copied to QUEUE **in the same turn**, at which
point the source line becomes `ACTION(queued): ...`. Detection: the checker greps
`playtests/`, `_review/`, and `meta/threads/` for unqueued `ACTION:` markers.

"What should I work on?" = read QUEUE + threads table, present options with
tradeoffs. Sam picks.

## 3 — Decisions (`meta/decisions/`)

The moment a decision is made in conversation — including in passing — write
`meta/decisions/YYYY-MM-DD-<slug>.md` **in the same turn**, not at session end. If
Sam describes a change ambiguously, ask once: "Decision, or still exploring?"

Each file: change, why, `status: experiment | canon | superseded | reverted`, a
**canon delta** applied to `meta/canon.yml` in the same turn (terms
retired/introduced, versions, structural facts), and a **Propagation** section — the
concrete files that must change, as `- [ ]` checkboxes. Tick boxes only when the
edit is actually made. Detection: open checkboxes on any `canon` or `experiment`
decision are flagged every session until ticked (a settled or under-test change with
unmade edits is drift; `proposed`/`reverted`/`superseded` are exempt);
retired terms in `canon.yml` are grepped across content folders.

## 4 — Experiments (`meta/experiments/`)

Anything provisional with a real chance of reverting gets, **before** artifacts are
touched: `meta/experiments/<slug>/RECORD.md` (what's tested, confirm/kill criteria,
exact files to be touched) and `baseline/` — copies of each touched file as it was.
Content files changed under an experiment get `status: under-test` in front-matter.

**Revert = copy baseline back, set the decision to `reverted`, note why.** Do not
rely on git for reverts (git ops time out in this OneDrive folder). When an
experiment is confirmed, set the decision to `canon`, delete the experiment folder,
remove `under-test` markers.

## 5 — Structure (`meta/manifest.yml`)

The manifest declares the layout and placement rules; no prose file describes the
tree anymore. When creating, moving, or deleting files/folders, update the manifest
**in the same action**. Detection: the checker diffs the actual tree against it.
When a source-of-truth exists for something (rules, glossary, scoring, visual
system), edit that file — never create a parallel copy.

## 6 — Advisory posture, not gates

- **Never refuse or sequence-block work Sam wants to do.** If a request conflicts
  with stage, priorities, or anti-drift discipline, give a one- or two-sentence
  heads-up naming the tradeoff and the competing P1 — then proceed on his call.
- Maximum one reminder per issue per session. No re-litigating his choice.
- Course stage-gates and anti-drift rules (`course-knowledge/Game Design Execution
  System.md`) are reference material for *reminder text*, never gates.
- Use the Deferred section's recorded reasons to make reminders informative.

## 7 — Playtests (`playtests/`)

One file per session, named `YYYY-MM-DD-session-NN.md`, with `goal:` and `verdict:`
in front-matter (the front-matter IS the index; there is no separate index file).
When logging a session: findings go in the file, every actionable item follows the
§2 routing rule, clear decision outcomes follow §3, and the relevant thread file
gets a campsite update. Offer to log a session whenever Sam mentions having played,
even without notes.

## 8 — Tool adapters (change here, point there)

- **Cowork:** `skills/aa-system.skill` — trigger description plus "read this file,
  run the checker, follow the matching section". Domain skills (rulebook manager,
  card designer, board-game designer) stay, but their side-effect duties are §1–§5
  here.
- **Kiro:** `.kiro/steering/working-system.md` (same pointer),
  `.kiro/hooks/` (checker on demand and after rulebook edits).
- Neither adapter may restate rules. If an adapter grows logic, that is drift —
  move it here.
