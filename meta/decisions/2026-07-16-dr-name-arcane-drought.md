---
title: DR-NAME resolved — final title "Arcane Drought", end-narrative reworked
type: decision
date: 2026-07-16
status: canon
---

# 2026-07-16 — DR-NAME: final title "Arcane Drought" + Renewal end-narrative

**Change:** The game's final title is **Arcane Drought** (Sam, 2026-07-16, chosen from a
collision-checked shortlist). The end-narrative in `rulebook/Story.md` is reworked to
match: no Archmage, no ascension. The world's magic moves in ages; each age ends in the
**Arcane Drought**. The winner is **the Renewer** — the wizard whose Spellbook becomes
the template through which magic flows into a new age ("The Drought breaks. The currents
stabilize. Magic flows again."). Section renames in Story.md: THE PATH TO ASCENSION →
THE RACE AGAINST THE DROUGHT; THE ASCENSION → THE RENEWAL.

**Why:** "Archmage Ascension" collides with the board game *Archmage* and the card game
*Ascension* (register DR-NAME). Analysis: the mechanics fix depletion-and-renewal (the
dying Source, the Spellbook-as-proof, the protected hook's "renew the world's magic"
ending), while the Archmage/Academy/ascension framing was pure flexible lore. The name
therefore should name the *dying resource*, not a rank. "Arcane Drought" reuses the
game's own endgame term, resonates with the table-visible depleting deck even for
players who never read the lore, required the smallest Story.md rewrite, and is
collision-free as a hobby title (checked 2026-07-16: no BGG/tabletop title match; only
in-game cards named "Drought" in Seasons/Civ). Rejected: *The Last Spell* (roguelite +
official board game), bare *Wellspring* (Monte Cook TTRPG "The Wellspring"); shortlist
alternatives *The Last Wellspring* and *Rekindle* were clear but not chosen.

**DR-HOOK:** unaffected — the protected hook sentence is name-agnostic and already ends
on "renew the world's magic". The new narrative aligns Story.md with it.

**Scope note (part B propagation still deferred):** this decision finalizes the *name*
and the *narrative*. The one-pass title-string propagation across every surface (repo
name, rulebook title, GLOSSARY, pitch, web-apps, board, exports, index.html) remains
deferred per the register — do it once, before any paid/external surface, gated with
DR-PITCH / F14. Until then repo surfaces keep "Archmage Ascension" as the working
title. Do NOT add "Archmage"/"Ascension" to `canon.yml` retired_terms until that
propagation pass runs (it would flood the checker on gated surfaces). Stranger sessions
should still capture verbatim what players call the game, as a pre-propagation sanity
check on the title.

**Canon delta:** `meta/canon.yml` — added `game_title_final`, `game_title_working`,
`end_narrative` fields (applied same turn).

## Propagation

- [x] `rulebook/Story.md` — rewritten (Arcane Drought framing; pre-edit copy archived at `_archive/Story-pre-arcane-drought-2026-07-16/`) (2026-07-16)
- [x] `meta/canon.yml` — title + end-narrative fields added (2026-07-16)
- [x] `PROJECT.md` — working-title note updated to record the chosen final name (2026-07-16)
- [x] `meta/QUEUE.md` — DR-NAME P2 item resolved to Archive; Deferred item reworded to propagation-only (2026-07-16)
- [x] `_review/DECISION_REGISTER_2026-07.md` — DR-NAME part A closed, part B = name chosen / propagation pending (2026-07-16)
- [x] `_archive/README.md` — index line for the archived Story.md (2026-07-16)
