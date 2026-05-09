# snapshots/

Frozen, **self-contained** single-file HTMLs of specific connector+art
combos you want to preserve regardless of what happens to the live system.

## When to take a snapshot

- Before a risky refactor of `lib/cards.js`.
- When you send a version to print / to a playtester.
- When a combo "feels right" and you want to be able to diff later
  versions against it.

## File naming

    YYYY-MM-DD-<connector>-<art>.html

e.g. `2026-04-23-bloom-sigil.html`.

## Making one

Open `playtable.html?connector=X&art=Y` in a browser, then in DevTools
Console run a save-as script, or manually build a single-file HTML by
inlining `lib/cards.js`, the two variant modules, and `tokens.css` into a
single file. (A helper script for this can be added later — for now the
manual approach is fine and matches how the live file started.)

Snapshots are **not** wired into `playtable.html` — they're standalone
viewers. Double-click to open.
