// Property 4 (REFRAMED): Golden-master regression guard for hand detection.
//
// Validates: Requirements 1.6 (reframed — approved by the user).
//
// ────────────────────────────────────────────────────────────────────────────
// WHY THIS IS A GOLDEN-MASTER TEST AND NOT A TRUE EQUIVALENCE TEST
// ────────────────────────────────────────────────────────────────────────────
// Task 4 was originally "Property 4: Ported detection is equivalent to the
// original" — it was meant to run BOTH the Full Rules `hcFindSpells` and the
// ORIGINAL Quick Reference `hcFindSpells` over the same hands and assert the
// two produce identical spell sets.
//
// That test is impossible to write faithfully. The original Quick Reference
// `hcFindSpells` implementation is UNRECOVERABLE: it was never committed to
// git and was deleted from `player-reference.html` before it could be copied
// verbatim. Task 1.3 RECONSTRUCTED the widget from design.md, and an
// exhaustive recovery attempt (git log / objects / dangling commits / stashes,
// plus local and OneDrive backups and OneDrive version history) turned up
// nothing. With no second, independent "original" to diff against, a genuine
// differential equivalence test cannot exist — and fabricating a second
// implementation to diff against would only test that fabrication, not the
// original behavior.
//
// The user therefore APPROVED reframing Requirement 1.6's check as a
// GOLDEN-MASTER (snapshot) regression guard. This test does not prove
// equivalence to the lost original. Instead it LOCKS the behavior of the
// reconstructed detection: it runs the REAL reconstructed `hcFindSpells`
// (loaded verbatim from `web-apps/archmage-reference.html`) over a FIXED,
// deterministic corpus of hands and compares the full serialized result set
// against a committed baseline snapshot. Any future change to the detection
// logic that alters its output will fail this test.
//
// ────────────────────────────────────────────────────────────────────────────
// HOW THE BASELINE WORKS
// ────────────────────────────────────────────────────────────────────────────
//   • Corpus:   a fixed set of hands produced by `fc.sample(genHand, ...)` with
//               a FIXED SEED, so the corpus is identical run-to-run.
//   • Baseline: `golden-master.snapshot.json` in this folder (committed).
//   • First run (no snapshot on disk): the baseline is CAPTURED and written,
//               and the test passes (logging that it captured the baseline).
//   • Later runs: the freshly computed results are asserted deeply equal to the
//               committed baseline.
//   • Regeneration: set the env var `UPDATE_SNAPSHOT=1` to intentionally
//               overwrite the baseline (e.g. after a reviewed behavior change).
//
// The corpus generator (`genHand`) and the widget loader (`loadWidget`, which
// evaluates the real reconstructed `hcFindSpells` against a jsdom-mounted DOM)
// are the SAME harness used by the sibling property tests in this folder. This
// test does NOT modify the production HTML widget logic.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';

import { loadWidget } from './load-widget.mjs';
import { genHand } from './generators.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The committed baseline snapshot lives alongside this test file.
const SNAPSHOT_PATH = path.resolve(__dirname, 'golden-master.snapshot.json');

// A FIXED seed + size make the corpus reproducible run-to-run. CORPUS_SIZE is
// well above the task's "≥100 iterations" floor.
const CORPUS_SEED = 0x5eed4242;
const CORPUS_SIZE = 150;

// Deterministically normalize a single component so serialization is stable
// regardless of extra properties or key order.
function normalizeCard(card) {
  return { e: card.e, v: card.v === undefined ? null : card.v };
}

// Deterministically serialize one hcFindSpells() result. We capture every
// observable field of a result — kind, size, the component composition (uses,
// in order), the short effect text, and the RP value — plus the result's
// position, so both content AND ordering are locked by the snapshot.
//
// NOTE: hcFindSpells() runs inside the jsdom sandbox realm, so its returned
// arrays/objects carry that realm's prototypes. We rebuild every array with the
// main realm's Array.from and every object as a fresh literal; the whole
// structure is additionally canonicalized via a JSON round-trip before
// comparison (see canonicalize) so cross-realm prototype differences, undefined
// values, and -0 can never cause a spurious mismatch against the JSON baseline.
function serializeResult(result) {
  return {
    kind: result.kind,
    name: result.name,
    size: result.size,
    uses: Array.from(result.uses, normalizeCard),
    effect: result.effect,
    rp: result.rp,
  };
}

// Reduce any value to plain, main-realm JSON data — exactly the form persisted
// to (and read back from) the baseline file.
function canonicalize(value) {
  return JSON.parse(JSON.stringify(value));
}

// Build the fixed corpus of hands. fast-check's sample with a fixed seed yields
// the identical set of hands on every run.
function buildCorpus() {
  return fc
    .sample(genHand, { numRuns: CORPUS_SIZE, seed: CORPUS_SEED })
    .map((hand) => hand.map(normalizeCard));
}

// Compute the full result set for the corpus using the REAL reconstructed
// detection logic. A single widget instance is reused; hc.hand is reset per
// hand exactly as the detection property test does.
function computeCorpusResults() {
  const widget = loadWidget();
  const corpus = buildCorpus();
  return corpus.map((hand) => {
    widget.hc.hand = hand.map((c) => ({ ...c }));
    const spells = widget.hcFindSpells();
    return {
      hand,
      results: spells.map(serializeResult),
    };
  });
}

test('Property 4 (golden-master): reconstructed detection matches the committed baseline snapshot', () => {
  const current = canonicalize({
    // Metadata makes the snapshot self-describing and pins the corpus.
    seed: CORPUS_SEED,
    corpusSize: CORPUS_SIZE,
    entries: computeCorpusResults(),
  });

  const wantUpdate = process.env.UPDATE_SNAPSHOT === '1';

  if (!existsSync(SNAPSHOT_PATH) || wantUpdate) {
    writeFileSync(SNAPSHOT_PATH, JSON.stringify(current, null, 2) + '\n', 'utf8');
    const reason = wantUpdate ? 'UPDATE_SNAPSHOT=1 set' : 'no baseline on disk';
    console.log(
      `[golden-master] Baseline captured (${reason}): wrote ${current.entries.length} ` +
        `hand results (seed=0x${CORPUS_SEED.toString(16)}) to ${SNAPSHOT_PATH}`,
    );
    // Sanity: the captured corpus meets the task's ≥100-iteration floor.
    assert.ok(
      current.entries.length >= 100,
      'golden-master corpus must contain at least 100 hands',
    );
    return;
  }

  const baseline = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));

  // The corpus itself must not have drifted (same seed/size => same hands).
  assert.equal(baseline.seed, current.seed, 'snapshot seed drifted from the test');
  assert.equal(baseline.corpusSize, current.corpusSize, 'snapshot corpus size drifted');
  assert.ok(current.entries.length >= 100, 'golden-master corpus must contain at least 100 hands');

  // The core guard: reconstructed detection output must equal the baseline,
  // component-for-component, effect text, RP, and ordering included.
  assert.deepEqual(
    current.entries,
    baseline.entries,
    'reconstructed hcFindSpells output diverged from the committed golden-master baseline',
  );
});
