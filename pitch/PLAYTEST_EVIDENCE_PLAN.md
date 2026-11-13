---
title: Playtest Evidence Plan — Arcane Drought
type: plan
updated: 2026-07-19
purpose: Maximise credible playtest volume across three evidence tiers (friends/family, strangers, blind) and track it so the totals are quotable to publishers.
companions: pitch/PUBLISHING_PLAN.md (Step 0.5 needs these numbers) · _review/STRANGER_EVIDENCE_PLAN_2026-07.md (HOW to read signal in a session — this plan is about VOLUME, venues, and tracking)
---

# Playtest Evidence Plan

Publishers ask two questions: **"how many times has this been played?"** and **"by people who aren't your friends?"** (999 Games makes 20+ tests incl. outsiders an explicit submission condition). The three tiers are worth different amounts: friends prove endurance, strangers prove teachability and appeal, blind sessions prove the rulebook stands alone — which is exactly how an editor will first experience the game. One blind session is worth roughly five friend sessions as evidence.

**Counting rules (be strict so the numbers survive scrutiny):**

- A "session" = one full game to completion on the **current ruleset**. Aborted games count separately as teach-failure data, not sessions.
- The four logged sessions to date (May–July, v≤3.0) are development history — quotable as "in development since early 2026, 4 logged iterations sessions," not as current-ruleset evidence. The tally starts fresh at v3.1-confirmed.
- Every session gets a file in `playtests/` same-week (process §7). No file, didn't happen.

## Targets — the evidence bar to hit before the mid-2027 events

| Tier | Target by Essen (Oct 2026) | Target by UKGE/Göttingen (Jun 2027) | What it proves |
|---|---|---|---|
| Friends/family | 10 | 20+ | Replayability, no degenerate strategies, all counts work |
| Strangers | 5 | 15+ | 15-min teach, hook lands, replay requests |
| Blind | 2 | 8+ | Rulebook stands alone — the publisher simulation |
| **Coverage** | every count 2–4 ≥2× | every count 2–6 ≥3×, incl. 5–6p Echo | The box promise ("2–6 players") is tested, not hoped |

That is ~4 sessions/month sustained — one friends evening, one meetup, and ongoing remote blind tests. Demanding but doable; if it slips, protect the stranger and blind numbers first.

---

## Tier 1 — Friends & family (volume + endurance)

**Role:** cheap reps, player-count coverage, catching degenerate lines over repeated plays. Weakest as evidence, still needed — "friends who keep choosing to play it" is a real signal, and it's where 5–6p Echo games are practical.

1. **Standing game night, weekly or fortnightly.** Same core group (Denise etc.); rotate player counts deliberately — the coverage row above is the checklist. Track *unprompted* requests to play again; log them in the verdict line.
2. **Second-circle recruits** (colleagues, partners of friends) count as Tier 1 the first time but bring fresh-teach data — log `new_players:` every time.
3. **Discipline even here:** no explaining design intent mid-game; rules questions answered by pointing at the text (standing rule from the stranger plan). Otherwise these sessions stop producing teach data at all.
4. **5–6p Echo sessions live here** until the deck is validated — don't burn stranger goodwill on the least-tested configuration.

## Tier 2 — Strangers (teachability + market signal)

**Role:** the TS1–TS6 protocols from `_review/STRANGER_EVIDENCE_PLAN_2026-07.md` run here — blind teach, replay-choice, comparison vs a familiar rummy game. That file defines what to observe and what feedback to distrust; this plan only says where and how often.

**Venues, in order of value:**

1. **Spellenmaakgilde / ABGD designer playtest night** — monthly, OBA Oosterdok, Amsterdam ([guild](https://spellenmaakgilde.nl/), [Meetup](https://www.meetup.com/nl-nl/prototype-testing-meetup/)). Designers + testers who *expect* prototypes and give structured feedback. Attend **every month**; pitch the game in the opening round. Also: their annual UBDG designer day in Utrecht (Feb).
2. **General Amsterdam board game meetups** — better "real market" strangers than designer crowds: Tuesdays at Spelletjescafé 2 Klaveren, Wednesdays at Roode Remise ([Amsterdam Board Gaming Meetup](https://www.meetup.com/amsterdam-board-gaming-meetup-group/), [Amsterdice](https://www.meetup.com/amsterdam-board-games-meetup/)). Etiquette: play *their* games too; offer yours as "a published-soon prototype, 40 minutes"; never twice to the same table in a month.
3. **Ducosim game days, Amersfoort** (several per year) — the classic Dutch venue for showing prototypes; doubles as the 999 Games relationship builder.
4. **Spellenspektakel (7–8 Nov 2026)** — open-table stranger tests plus publisher visibility in one trip.
5. **Board game cafés** (2 Klaveren, Armoury Bar) with one friend as co-host — recruit adjacent tables for one game.

**Kit for every outing:** one prototype, printed reference cards, a one-page teach script you *don't* read from (it's the fallback), notebook with the session's single goal pre-written.

## Tier 3 — Blind (the publisher simulation)

**Definition:** the game reaches the table with **no teach from you** — players learn from the written rules alone. Grades: (a) Sam absent entirely (gold standard), (b) Sam present as silent observer (TS1/TS4 style — still blind for rulebook purposes).

**Channels:**

1. **Local handoff:** lend a prototype + rulebook to a friend who hosts their own game night *without you* (TS6's unprompted-return test is the passive version). Debrief with the written question set below, not conversation.
2. **Break My Game — weekly online playtesting** ([site](https://www.breakmygame.com/weekly-online-playtesting), [Discord](https://discord.com/invite/breakmygame)): free, designers post games a week ahead, sessions run on Screentop.gg / Tabletopia / Tabletop Playground. Build a Screentop version of the 2–4p deck (cards + counters port cleanly). This is the highest-volume blind channel available from a desk in Amsterdam.
   - *Note:* the project's own React 2p build still implements the old enchantment ladder (tracked in QUEUE) — fix before using it as a blind-test vehicle, or use Screentop only.
3. **BGG Works-in-Progress forum:** a WIP thread + print-and-play file recruits self-selecting blind testers and starts the game's public paper trail (publishers do look).
4. **UK Games Expo playtest zone** ([booking](https://www.ukgamesexpo.co.uk/whats-on/publisherdesigner/book-playtest/)) — bookable blind-ish sessions with volunteer strangers, same trip as speed dating.

**Blind feedback form** (send with every blind copy; a form, not a chat): How long from opening the rules to first turn? · Which rule did you have to re-read? · Narrate your last turn. · What was the score, who won, and did the scoring feel right? · Did anything feel like it must be an error? · Would this group play again unprompted — and did anyone ask to? Plus the TS-plan standing rule: distrust "we liked it," trust what they *did*.

---

## Tracking — one system, three outputs

Keep the existing machinery; extend it slightly. **No new tools, no spreadsheet as source of truth** — the `playtests/` folder already is the tracker (front-matter IS the index, process §7).

**1. Extend session front-matter** (new fields, from the next session onward):

```yaml
players: 3
new_players: 2
category: friends | strangers | blind    # blind = no verbal teach; note observer/absent in the body
location: ABGD Oosterdok                  # or "home", "Break My Game online", ...
version: v3.1
```

**2. Computed tally, never hand-maintained.** Once adopted, the checker (`meta/checks/check.mjs`) gains a detection rule — new session files missing `category:` get flagged — and the session brief can print the running totals per tier/per player count against the targets table above. (Agent-side change, logged as a decision when made; Sam never edits meta/.)

**3. The publisher-facing output** is one paragraph, regenerated from the tally whenever needed — e.g. *"41 logged sessions on the final ruleset: 19 friends/family, 14 with strangers at public events, 8 fully blind (rules-only). All player counts 2–6 covered; median teach-to-first-turn 12 min; 9 unprompted replay requests."* That paragraph slots into the sell sheet, submission emails, and the UKGE application. It is the entire point of the bookkeeping.

**Raw notes** (photos, scribbles, voice memos) go through the playtest-organiser flow into the session file same-week; actionable items follow the normal QUEUE routing rule.

## Cadence at a glance

| When | Rhythm | Running total (current ruleset) |
|---|---|---|
| Aug 2026 | v3.1 confirm/kill first, then: 1 friends night/wk, first ABGD night, Screentop build started | ~5 |
| Sep–Oct 2026 | + monthly ABGD, 2 meetup outings, first 2 blind (local handoff + Break My Game) | ~15–17 → Essen with quotable numbers |
| Nov–Dec 2026 | Spellenspektakel tests, Ducosim, BGG WIP thread live | ~24 |
| Jan–Mar 2027 | UBDG designer day, steady weekly rhythm, blind ramp to 6+ | ~35 |
| Apr–Jun 2027 | Coverage gaps (5–6p ≥3×), UKGE playtest zone | **45+ into UKGE/Göttingen** |

The stranger plan's warning applies to all of it: behaviour over compliments, and never ask "did you like it?"
