# _review — index & map

Unresolved work that needs a decision, plus the planning/evidence chain that frames
it. **Not** archive, **not** junk. Everything here is mirrored by an entry in
`meta/QUEUE.md`, so it flows through the normal workflow. Tracked in git (active work).

Two kinds of thing live here:

1. **The July 2026 review chain** — 9 linked planning/evidence docs that diagnose the
   project and lay out what to do next. Read this index instead of all 9 files.
2. **Older loose items** awaiting a decision (OPUS proposals, visual-system variant,
   fifth-suit analysis). These should trend toward empty as each is integrated or dropped.

When an item is resolved: integrate it into its canonical location (via a
`meta/decisions/` file + propagation checklist — never move text into canon silently),
close its `meta/QUEUE.md` entry, and delete it from here. The review-chain docs are
planning artifacts; they leave `_review/` when the plan they describe is executed or
superseded, not when a single decision closes.

---

## The July 2026 review chain (9 docs)

**One thesis across all nine:** the binding constraint is *product identity + the total
absence of stranger evidence*, not implementation cleanliness. The next real information
comes from putting the game in front of strangers — not from more deciding, balancing, or
reviewing. Everything else (exports, `state.js`, Echo tuning, Trials, pitch) is gated
behind that.

> **Amendment 2026-07-06 — how that thesis is acted on changed.** The chain's *diagnosis*
> stands (the project is starved of stranger data), but its *response* — a linear
> "hold all implementation until strangers play" — was replaced by a **two-track model**
> (`meta/decisions/2026-07-06-two-track-development-model.md`): a fast solo loop (design,
> sim, digital build, *provisional* rulebook changes) that runs continuously, and a slow
> opportunity-driven loop (stranger validation). The gate now blocks only irreversible/
> paid commitments and "validated" claims — not the act of changing reversible things.
> Read the plan docs below through that lens; the banners at the top of MASTER_PLAN,
> IMPLEMENTATION_QUEUE, and KIRO_HANDOFF carry the details.

### How they fit together

```
        EVIDENCE (four audits — each makes NO decisions)
        ────────────────────────────────────────────────
        DESIGN_REVIEW (07-03) ── structural diagnosis; recommends V2, Capacity Gauge,
              │                    9 rulebook rulings, playtest plan T1–T9
              ▼
        REPO_TRUTH_AUDIT ──── stage 1: current truth, 13 contradictions (CON-1..13),
              │                12 decisions (D-1..12), 8 safe fixes, do-not-touch list
              ▼
        DECISION_FORKS_AUDIT ─ stage 2: reframes into 14 forks (F1–F14) + dependency
              │                graph; F1/F2/F10 are the triangle blocking ~80% of work
              ▼
        PRODUCT_VIABILITY_AUDIT ─ stage 3: "can strangers replay it?"; hook is invisible
              │                    at the table; 7 optimization loops (L1–L7); tests E1–E6
              ▼
        ┌───────────────────────────────────────────────────────────┐
        │  MASTER_PLAN ── the spine. Synthesises the four audits.     │
        │  product-validation-gated · protected hook · 3-phase path  │
        └───────────────────────────────────────────────────────────┘
              │
              ├──► DECISION_REGISTER ──── every open decision + who closes it
              │                           (lanes: SAM-NOW / STRANGER / KIRO-LATER)
              ├──► STRANGER_EVIDENCE_PLAN ─ the playtest plan (TS1–TS6) that closes them
              ├──► IMPLEMENTATION_QUEUE ── Kiro tasks split A/B/C/D/E by gate
              └──► KIRO_HANDOFF ────────── mission, sources of truth, anti-drift rules
```

The F-numbers (F1–F14), test IDs (T/TS/E), and CON-numbers are shared vocabulary across
the docs — the register and the audits stay cross-referable by design.

### Reading order

- **Just want the plan?** Read `MASTER_PLAN_2026-07.md`, then skim
  `DECISION_REGISTER_2026-07.md` for what's open.
- **About to run a playtest?** `STRANGER_EVIDENCE_PLAN_2026-07.md` (what to measure) +
  `STRANGER_RECRUITMENT_AND_LOGISTICS_2026-07.md` (how to find testers and run it).
- **About to implement / are Kiro?** `KIRO_HANDOFF_2026-07.md` + `IMPLEMENTATION_QUEUE_2026-07.md`.
- **Want the "why" behind a claim?** The four audits, in the order above.

### The documents

| # | Doc | Role | Key output |
|---|-----|------|------------|
| 1 | [DESIGN_REVIEW_2026-07-03.md](DESIGN_REVIEW_2026-07-03.md) | Evidence — structural diagnosis (the earliest, 07-03) | Recommends **V2** ("2–4 player monument race"), Capacity Gauge over the round-trip counter redesign, 9 rulebook rulings, playtest plan T1–T9. Proposals only. |
| 2 | [ARCHMAGE_REPO_TRUTH_AUDIT_2026-07.md](ARCHMAGE_REPO_TRUTH_AUDIT_2026-07.md) | Evidence — stage 1 | Current truth vs canon; 13 contradictions (CON-1..13); 12 open decisions (D-1..12); 8 safe fixes; do-not-touch list. Flags GLOSSARY.md truncation + checker mount issue. |
| 3 | [ARCHMAGE_DECISION_FORKS_AUDIT_2026-07.md](ARCHMAGE_DECISION_FORKS_AUDIT_2026-07.md) | Evidence — stage 2 | Reframes decisions as 14 forks (F1–F14) with a dependency graph; safe-now/gated matrix; anti-drift rules. **F1** (counters), **F2** (Echo), **F10** (product scope) block most work. |
| 4 | [ARCHMAGE_PRODUCT_VIABILITY_AUDIT_2026-07.md](ARCHMAGE_PRODUCT_VIABILITY_AUDIT_2026-07.md) | Evidence — stage 3 | Stranger-replay lens; the hook (player-burned Source clock + living Spellbook) is invisible at the table; names 7 local-optimization loops (L1–L7); proposes stranger tests E1–E6. |
| 5 | [MASTER_PLAN_2026-07.md](MASTER_PLAN_2026-07.md) | **Plan — the spine** | Classifies the project **product-validation-gated**; defines the protected one-sentence hook; 3-phase critical path (safe hygiene → stranger validation → implementation-after-evidence) + stop list. `status: draft-for-Sam-approval`. |
| 6 | [DECISION_REGISTER_2026-07.md](DECISION_REGISTER_2026-07.md) | Plan — decision tracker | Living list of every open decision (DR-HOOK, F1–F14, DR-CLOCK/DROUGHT/PITCH/STATE) with status/owner/closure lane. Supersedes the scattered `[decide]` items **once populated** into `meta/decisions/`. |
| 7 | [STRANGER_EVIDENCE_PLAN_2026-07.md](STRANGER_EVIDENCE_PLAN_2026-07.md) | Plan — playtest plan | Decision-driven stranger tests (TS1–TS6), the combined first session, the replay-choice test, and the hook-visibility metric. Each test kills one register item. |
| 8 | [IMPLEMENTATION_QUEUE_2026-07.md](IMPLEMENTATION_QUEUE_2026-07.md) | Plan — Kiro task queue | Tasks split **A** safe-now · **B** playtest-kit (non-canon) · **C** decision-gated · **D** playtest-gated · **E** parked. Only A + B may start unprompted. |
| 9 | [KIRO_HANDOFF_2026-07.md](KIRO_HANDOFF_2026-07.md) | Plan — execution contract | Kiro's mission (protect canon, do safe hygiene, prepare tests — not redesign), sources of truth, 10 anti-drift rules, execution order, stop conditions. |

### Companion docs (added 2026-07-06)

The two-track reframe added two documents that sit alongside the chain:

| Doc | Role | Key output |
|-----|------|------------|
| [STRANGER_RECRUITMENT_AND_LOGISTICS_2026-07.md](STRANGER_RECRUITMENT_AND_LOGISTICS_2026-07.md) | Plan — the operational half of Track B | Where testers come from (local / hobby-designer / remote), how the game reaches them (PnP / Tabletopia-TTS / digital build), session formats, cadence, and structured data capture. Companion to the evidence plan. |
| `meta/decisions/2026-07-06-two-track-development-model.md` | **Decision (canon)** | Establishes the two tracks and redraws the gate around irreversibility + "validated" labelling, not the act of changing. Supersedes the linear phase model. |

### Status / what's actionable

- The chain is **not canon** — every doc says so. Text reaches canon only through a
  `meta/decisions/` file.
- **Operating model (2026-07-06): two tracks.** They run independently:
  - **Track A (fast, solo, continuous):** Category A safe hygiene; populate
    `meta/decisions/` stubs and close the cheap SAM-NOW calls; then bold, coherent,
    sim-screened *provisional* design changes (one subsystem at a time — the capacity
    system is the obvious first target), built into the rulebook and digital build with
    a revert kit. Does **not** wait for a playtest.
  - **Track B (slow, opportunity-driven):** keep the recruitment pipeline warm (see the
    logistics doc); run a stranger session whenever Track A has something meaningfully
    new to test. Each session tests one coherent hypothesis and returns confirm/kill/
    redirect.
- **Still gated (unchanged):** paid prints / mass export regeneration on unvalidated
  rules, and tagging anything `stranger-validated` without a logged session.
- Tracking lives in the QUEUE "Master-plan chain" section, the P2 review items, and the
  two-track decision file.

---

## Older loose items (pre-chain — trend toward empty)

- `OPUS_TASK_counter_and_tracker.md` (+ `_RESPONSE.md`) — counter/tracker proposal. Now
  folded into fork **F1** (its Option A gauge = the recommended F1 branch). Decide via F1.
- `OPUS_TASK_enchantment_system.md` (+ `_RESPONSE.md`) — largely superseded by the
  Echo/Option-2 decision; **partial Unlearn** survives as fork **F12** (verbatim wording here).
- `OPUS_TASK_thematic_coherence.md` — no response drafted yet; relates to terminology (F13)
  and the thematic-narrative QUEUE item. Needs resolving.
- `VISUAL_SYSTEM_with_Echo.md` — Echo variant of the visual system. Promote to
  `card-design/VISUAL_SYSTEM.md` or drop — gated on Echo confirmation (fork **F9**/**F2**).
- `FIFTH_SUIT_ANALYSIS.md` — analytical support that fed the Option-2 decision; still
  surfaces a cheap rank-compressed experiment. Act on or keep parked.

---

*Pointers: the only to-do list is `meta/QUEUE.md`; process rules live in `meta/process.md`;
canon is `meta/canon.yml`; decisions are recorded in `meta/decisions/`. (This folder
formerly pointed at `BACKLOG.md` and `STATE.md`, both retired 2026-07-03.)*
