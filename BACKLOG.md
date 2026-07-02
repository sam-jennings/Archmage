---
title: Backlog
type: backlog
updated: 2026-07-02
updated_by: aa-backlog-curator
---

# Backlog

## Tasks

- [P1] [design] Rig-test BOTH deck options from the two-version proposal (`_review/TWO_VERSION_PROPOSAL.md`) before deciding: Option 1 = 5 energies at all counts, vary max value (5×12+2w / 5×16+4w); Option 2 = 4 energies at 2–4p, 5 energies at 5–6p, max value 15 everywhere (4×15+2w / 5×15+4w). Fixed enchantment ladder in both (3=+1, 4=+2, 5=UC; wild must be declared as an energy in play). Key metrics: UC frequency at 2p, enchantment uptake at 5p, conjuration viability under suit dilution, 3–4p regression vs current balance
- [P1] [rules] Rewrite counter refresh rule — player couldn't understand it from card or board even after verbal explanation; test whether a concrete turn-step example or full restructure fixes comprehension
- [P1] [rules] Clarify that enchantment effects (play/unlearn) begin on the player's NEXT turn — current ambiguity allows counter system abuse
- [P1] [bug] Extend score table on webpage to cover Perfect Transmutation size 15 and above — player achieved size 15 in Session 1 and table didn't cover it
- [P1] [card] Redesign reference cards for legibility — current layout too hard to read during play (blocks every session)
- [P2] [design] Add turn-stage tracker or clearer stage summary to help players track where they are mid-turn — deliberate players lose their place
- [P2] [design] Investigate 4-card enchantment cap at Drought — current cap may collapse Phase 2 dynamics in 2-player games; now addressed by the two-version proposal (`_review/TWO_VERSION_PROPOSAL.md`: 4-card becomes +2, UC moves to the 5-card tier) — resolves with the deck-option decision
- [P3] [design] Investigate whether thematic narrative arc can be signalled through card names or phase structure rather than art (polish deferred per Anti-Drift Rule 2 — but naming/structure is in scope)
- [P3] [rules] Evaluate whether "Transfiguration" and "Perfect Transmutation" can be simplified or given memorable short-hands
- [P2] [review] Decide: integrate the counter/tracker proposal (`_review/OPUS_TASK_counter_and_tracker.md` + `_RESPONSE.md`) or drop it — relates to the counter-refresh rewrite and turn-stage tracker items above
- [P3] [review] Decide: integrate the enchantment-system proposal (`_review/OPUS_TASK_enchantment_system.md` + `_RESPONSE.md`) or drop it — largely superseded by `_review/TWO_VERSION_PROPOSAL.md` (Drought cap unnecessary under the ladder; partial unlearn still independently valuable)
- [P3] [review] Resolve the thematic-coherence task (`_review/OPUS_TASK_thematic_coherence.md`) — no response drafted yet; relates to the thematic-narrative item above
- [P3] [review] Decide whether Echo is the canonical visual system (`_review/VISUAL_SYSTEM_with_Echo.md`) — promote to `card-design/VISUAL_SYSTEM.md` or drop; note `_review/TWO_VERSION_PROPOSAL.md` assumes Echo as the fifth energy
- [P3] [review] Act on or park the fifth-suit analysis (`_review/FIFTH_SUIT_ANALYSIS.md`) — analytical support for the fifth-suit decision, now feeding `_review/TWO_VERSION_PROPOSAL.md`; note the cheaper near-term experiment it surfaces (rank-compressed 4×15/4×16 deck to test acquisition alone)

## Decisions to make

- [P1] Which deck structure: Option 1 (5 energies everywhere, vary max value) or Option 2 (4/5 energies, fixed max value 15)? — blocked by the rig test of both options above; analysis and provisional recommendation (Option 2) in `_review/TWO_VERSION_PROPOSAL.md`
- [P1] Decide whether to adopt the round-trip counter redesign (placing a counter casts a spell; picking one up pays for a learning action) plus the four capacity-economy levers (partial unlearn; start with 2 counters; first enchantment costs 0; Drought cap 3 + 4-card score 12) as the combined capacity/enchantment fix — proposed but not yet analysed, tested, or chosen; requires solo-rig pre-validation first (see STATE.md hypothesis); note the two-version proposal would absorb start-2 (Version B setup) and supersede the Drought cap and first-ench-free levers if adopted
- [P2] Should the counter refresh rule be rewritten (clarity fix) or redesigned (mechanic change)? — depends on whether next session confirms comprehension improves with better text alone; see the round-trip redesign decision above for the leading redesign candidate

---

## Archive

- 2026-05-02 — [P1] [admin] Confirm target player and core experience in STATE.md (resolved: STATE.md populated 2026-05-02)
- 2026-05-02 — [P1] [test] Define the current problem and hypothesis for the next playtest session (resolved: hypothesis set from Session 1 findings 2026-05-02)
- 2026-06-17 — [P2] [admin] Build the six project-state skills (resolved: all six aa-* skills built and present in skills/)
