# Project Structure

**The layout is declared in `meta/manifest.yml` — verify against it, don't trust
prose.** Run `node meta/checks/check.mjs` to diff the actual tree against the
declaration (it also checks vocabulary, decisions, threads, and queue hygiene).
When you create, move, or delete files, update `meta/manifest.yml` in the same
action (meta/process.md §5).

Process state lives in `meta/` (threads, queue, decisions, canon, experiments) —
agent-written, script-checked, never hand-edited by the user. All rules:
`meta/process.md`.

## Conventions (stable)

- **Kebab-case** for spec/feature directory names (e.g. `player-reference-hand-check-relocation`).
- Markdown files carry YAML front-matter (`title`, `type`, `updated`).
- Playtest sessions: `playtests/YYYY-MM-DD-session-NN.md` with `goal:`/`verdict:` front-matter (front-matter is the index — there is no index file).
- Single sources of truth are listed in `meta/manifest.yml` under `sources_of_truth` — edit those files, never create parallel copies.
- Generated artifacts (`outputs/`, `_archive/`, per-card PDFs, `node_modules/`) are gitignored.
- Designer-only tools (`tools/`) never appear in player-facing material.
