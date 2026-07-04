# Working system (pointer — no rules live here)

All process rules for this project live in **`meta/process.md`**. Read it and follow
it; this file intentionally contains no logic, so there is never a second copy to
drift (process.md §8).

At session start, run:

```
node meta/checks/check.mjs
```

Its output is the session brief (threads, P1s, open decision propagation, drift
flags). Orientation is computed, never stored — there is no dashboard file.

Quick pointers: threads `meta/threads/`, to-do `meta/QUEUE.md`, decisions
`meta/decisions/`, canon `meta/canon.yml`, layout `meta/manifest.yml`.

If you find yourself wanting to add a rule to this file, move it to
`meta/process.md` instead.
