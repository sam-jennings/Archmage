---
title: Stranger Recruitment & Logistics — Archmage Ascension
type: playtest-plan
date: 2026-07-06
status: draft-for-Sam
purpose: The operational half of stranger testing — where testers come from, how the game reaches them, how sessions run, and how data is captured. Companion to STRANGER_EVIDENCE_PLAN (which defines WHAT to measure). Track B of the two-track model (2026-07-06 decision).
sources: STRANGER_EVIDENCE_PLAN_2026-07 (test design), PRODUCT_VIABILITY_AUDIT (evidence principles), 2026-07-06-two-track-development-model decision
evidence_tags: "[FILE] · [INFER] · [GAP]"
---

# Stranger Recruitment & Logistics (July 2026)

`STRANGER_EVIDENCE_PLAN_2026-07.md` says **what to measure** (TS1–TS6, the
hook-visibility ledger, the replay metric). This doc is the missing **how**: how to
find strangers, get the game in front of them, run the session, and capture data you can
act on.

**Standing frame (from the 2026-07-06 two-track decision).** This is the *slow loop*. It
is opportunity-driven and it **never gate-keeps Track A** (solo design, sim, digital
build, provisional rulebook changes). Because sessions are rare, each one tests the
current best *coherent* version from Track A — not a parameter tweak. Treat this as a
standing pipeline you keep warm, not a one-off scramble each time.

---

## 1. Who counts as a "stranger" (and why it matters)

The entire live evidence base to date is Sam's circle on a pre-v2.8 ruleset [FILE:
product viability §1]. A stranger is someone **not invested in Sam's feelings** and
**not already taught the game**. Ranked by signal quality:

1. **Cold stranger, designer absent** — a friend hosts, or a café group plays from the
   packet alone. The cleanest replay signal (no politeness bias). Highest value, hardest
   to arrange.
2. **Cold stranger, designer present but silent** — Sam facilitates but only points at
   written text. Good for observation; replay/"I'd buy it" signals are discounted.
3. **Hobby designer/tester** — gives sharp mechanical feedback but is *out of audience*
   (they tolerate rough teach); weight their comprehension data, discount their
   enjoyment data.

Target audience to recruit *toward* (from the product-viability open question W1
[FILE]): rummy-literate players who like a 30–60 min tactical card game — not social-
deduction fans, not heavy-euro hobbyists. At least one rummy-literate player per table.

---

## 2. Where testers come from

Three tiers, roughly by effort. Sam fills in which are actually reachable locally
[GAP — needs Sam's local knowledge].

**Tier 1 — local, in-person (highest-signal, best for blind teach)**
- Board-game cafés / bar-café game nights (ask the venue about a designer/playtest night).
- Friendly local game stores (FLGS) with a weekly open-play or game-night.
- University / college tabletop clubs and society game nights.
- Public library game days and community-centre game groups.
- meetup.com board-game groups in the area.

**Tier 2 — hobby & designer community (good for structured, repeatable testing)**
- **Protospiel** — in-person and **Protospiel Online**: events built specifically for
  playtesting unpublished games. The single best structured pipeline.
- **BoardGameGeek** — the "Board Game Design" and "Looking for playtesters" forums;
  a game entry with a print-and-play file.
- Reddit — r/tabletopgamedesign, r/BoardGameDesign (playtest threads).
- Designer communities — Board Game Designers Guild, Break My Game, Playtest UK, and
  local designer meetups / Discord servers.

**Tier 3 — digital / remote (breaks the scarcity constraint — see §3)**
- **Tabletopia** or **Tabletop Simulator** build + a Discord/Zoom group for remote
  blind tests (live or recorded).
- The existing **digital build** (`web-apps/archmage-ascension/`) as a self-serve or
  guided remote test once it tracks the current rules.
- Async print-and-play: send the kit, collect the observation form + a short video.

**Recruitment ask (keep it honest):** "Unpublished card game, ~45 min, looking for
people who like rummy-style games to try it cold and tell us where it confuses them."
Recruit for *comprehension and replay*, not compliments.

---

## 3. How the game reaches them (delivery)

The blind-teach packet (Category B1 in the implementation queue) is the core
deliverable — the rules a stranger reads with zero verbal help. Three delivery formats,
in rising build cost:

| Format | Build cost | Best for | Notes |
|---|---|---|---|
| **Print-and-play kit** | low | Tier 1 & 2, async | Cards + board + player mats + rules packet as printable PDFs. The default. |
| **Tabletopia / TTS mod** | medium | Tier 3 remote | Reusable; enables recorded remote blind tests; no per-session printing. |
| **Digital build** | medium (already exists) | Tier 3, self-playtest | Fastest iteration loop; a path to remote testing at scale once it tracks current rules. |

**Why remote matters here:** in-person tables are rare, but a Tabletopia mod or the
digital build turns "one evening every few weeks" into "several sessions a week,"
directly attacking the constraint that makes each test precious. Building one reusable
digital surface is itself high-value Track-A work.

**Do not** trigger paid print runs (`export-printenbind/`) for any of this — PnP proofs
and screen builds only, per the two-track gate and F14.

---

## 4. Session formats

- **In-person facilitated (default first session):** Sam present, silent except
  pointing at text. Runs the combined first session (evidence plan §3): TS1 blind teach
  + TS2 replay choice, at 2–4p.
- **Designer-absent (the gold standard for replay data):** a friend hosts strangers, or
  a Tier-1 group plays from the packet; Sam gets the observation form + a debrief.
- **Remote live:** Tabletopia/TTS over video, screen recorded; Sam observes muted.
- **Async:** send kit + forms; collect a filled observation sheet and, ideally, a play
  video.

---

## 5. Cadence & pipeline

- Keep **two or three channels always warm** (e.g. one café/FLGS contact, one
  Protospiel Online slot, one remote group) so a session can happen whenever Track A has
  something worth testing — not only when Sam scrambles to arrange one.
- **Trigger a session when** Track A has a coherent, sim-screened, provisional version
  that meaningfully differs from what was last tested. Don't spend a rare slot on a
  small delta.
- Rough target: **one stranger session per Track-A iteration cycle**, whatever that
  cadence turns out to be. Log the gap between sessions so scarcity is visible.

---

## 6. Data capture (structured, so it's actionable)

Every session produces **one record**, filed as `playtests/YYYY-MM-DD-session-NN.md`
with `goal:` / `verdict:` front-matter (the front-matter *is* the index — no separate
list). Two instruments feed it:

**A. Observation sheet (facilitator fills during play)** — the TS1–TS5 metrics as
countable fields [FILE: evidence plan §5]:
- Time-to-first-turn; teach time (minutes).
- Counter-questions per player in the first 3 turns; time-to-first-correct-Recall.
- Silent misplays (what rule, self-corrected y/n).
- Hook-visibility ledger — did any player, unprompted, register: dying Source / living
  Spellbook / clock race / Drought-as-climax? And the negative marker: "rummy with
  counters"?
- Replay choice (§4 of the evidence plan) + verbatim advocacy.
- The **one-sentence description** each player gives ("what game did you just play?") —
  captured verbatim; this *is* the perceived hook.

**B. Post-game survey (players fill, 2 min)** — a few quantified items so results
aggregate across sessions:
- 1–5: how clear were the rules / how much did you want to play again / how much
  "wizard" did you feel.
- One free-text: "describe the game to a friend in one sentence."
- Would you choose to play it again if it were on the shelf? (yes/no/what-instead).

**Reading rule (from the evidence principles [FILE]):** trust behaviour (replay choice,
requests, unprompted hook mentions) over compliments; never ask "did you like it?";
weight comprehension by narration ("walk me through your last turn"), not by "does that
make sense?".

Over time, tag every design claim in the repo `friends-validated /
stranger-validated / untested` and update it per session — most are currently `untested`
wearing confident language [FILE: product viability §9].

---

## 7. Consent & recording

- Ask permission before recording video/audio; anonymise names in the session record
  (use "P1/P2…").
- Keep raw recordings out of git (they're large and may contain faces/voices); store the
  *transcribed metrics* in the `playtests/` record only.

---

## 8. Open items needing Sam's local knowledge [GAP]

- Which Tier-1 venues are actually within reach (café / FLGS / club)?
- Is a Tabletopia/TTS build worth the Track-A time now, or is PnP + local tables enough
  to start?
- Who could host a **designer-absent** session (the highest-value format)?
- Preferred cadence target to hold the pipeline to.

---

*This is Track B's operational plan. It is a living doc — promote it out of `_review/`
into a permanent home once the pipeline is actually running. It makes no design
decisions and gate-keeps no Track-A work (2026-07-06 two-track decision).*
