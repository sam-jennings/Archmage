---
title: Ascension Trials companion v2 — design brief (Prompt 3)
type: design-brief
created: 2026-11-12
rules: undecided (F8) — the companion is built so the package can be switched
---

# Trials companion — brief

Written before building. One page.

## The rules are a setting, not code

No Trials candidate has been chosen (`meta/threads/ascension-trials.md`), so no rule
number lives in the engine or the screens. A **rules package** is one file in
`trials/rulesets/` holding a configuration in the *same schema the Python analysis model
reads* (`ascension-trials/ascension_trials_model/configs/*.json`), plus the few rules that
schema cannot express (`extras`) and display names. The engine is a JavaScript port of the
model's power, legality and resolver code. A test fails if a package drifts from the
model's JSON, so the screening evidence and the table tool describe the same game.

Switching is one of three things, none of which touches code elsewhere:
`DEFAULT_RULESET_ID` in `rulesets/index.js` · the host's dropdown · `?ruleset=<id>`.
Until a default is set the host is asked once and the choice is remembered. The package,
its version and its options are printed on the results.

Where a package is silent (the v2.8 draft has no Echo power and no 6-player rewards) the
companion does not fill the gap: it says so, offers a labelled option where a proposal
exists, and refuses the player count otherwise.

## State model

One **session** object (`state.js`), changed only through a pure reducer:
`setup → books → allocate → results`. Players, Spellbooks and who has locked are public.
**Hidden information is exactly one field, `allocations`**; `publicView()` strips it until
the reveal. Power, legality, the "what this wins or risks" line and the result are never
stored: they are computed from the session and the package each time, so switching the
package re-derives everything.

Spellbooks are entered as cards through the site's shared hand checker (a set of cards is
accepted only if it is exactly one spell), with a faster type-and-size entry beside it.
One deck holds one of each card, so a card used twice anywhere at the table is flagged.

## Two modes, one engine, one set of screens

- **Pass-and-play (default, offline).** The session lives on one phone. Each wizard gets
  a gate ("Ana only") → private allocation screen → deliberate lock-in → hide. Reopening
  goes back through the gate. Reveal needs everyone locked.
- **A phone each (optional).** The room holds only public data. Locking in publishes a
  **seal** (SHA-256 of the allocation and a random salt); the allocation stays on its
  phone until the host reveals, then every phone checks every seal. So the database never
  sees an allocation early and nobody can change theirs late. Each phone rebuilds the same
  session shape from the room, so it draws the same screens and resolves the same result.
  Transport is the existing Firebase database over plain REST (no SDK), imported only when
  this mode is chosen; its address is read at run time from the old companion page. A QR
  encoder is included, so joining needs no outside service.

## Making an allocation mean something

Spellbooks are public, so each rival's *ceiling* on each trial is public arithmetic. Every
trial card shows, live: what the trial needs (generated from the package data), whether
the entry is legal and why not, and one of: certain win (and how much is spare) · can only
be matched · at risk and from whom · nobody else can enter. It is labelled as a ceiling,
not a forecast. Undo is free until lock-in (per trial, or everything); lock-in asks once
and lists entries that would count for nothing.

## Not in this pass

Choosing the rules. Any change outside `web-apps/v2/`. Translating strings.
