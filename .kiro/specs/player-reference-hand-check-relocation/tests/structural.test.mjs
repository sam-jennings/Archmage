// Structural (presence / absence) checks over the raw HTML text.
//
// Validates:
//   Full Rules  -> 1.1, 1.2, 2.4   (Hand Checker markup, IDs, CSS, JS present)
//   Quick Ref   -> 3.1, 3.2, 3.3, 3.4 (Hand Checker fully removed)
//   Tip         -> 4.1, 4.2         (points to Full Rules, not the QR Spells screen)

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFull, readQuick, HC_IDS, HC_JS_SYMBOLS } from './helpers.mjs';

const full = readFull();
const quick = readQuick();

test('Full Rules contains the Hand Checker root markup (1.1, 1.2)', () => {
  assert.match(full, /class="hc"/, 'expected a div.hc root element in the Full Rules');
});

test('Full Rules contains all five Hand Checker element IDs (1.1, 1.2, 2.4)', () => {
  for (const id of HC_IDS) {
    assert.match(full, new RegExp(`id="${id}"`), `Full Rules missing id="${id}"`);
  }
});

test('Full Rules contains the Hand Checker CSS block (1.1)', () => {
  assert.match(full, /Hand checker/i, 'expected the "Hand checker" CSS comment block');
  assert.match(full, /\.hc-energies\s*\{/, 'expected the .hc-energies CSS rule');
  assert.match(full, /\.hc-results\s*\{/, 'expected the .hc-results CSS rule');
});

test('Full Rules contains the Hand Checker JavaScript symbols (1.1, 2.4)', () => {
  for (const sym of HC_JS_SYMBOLS) {
    assert.match(full, new RegExp(`\\b${sym}\\b`), `Full Rules missing JS symbol ${sym}`);
  }
});

test('Full Rules uses the correctly adapted ART path (one level up)', () => {
  assert.match(
    full,
    /const ART\s*=\s*'\.\.\/art\/energy-symbols-export\/'/,
    "Full Rules ART must be '../art/energy-symbols-export/'"
  );
  assert.doesNotMatch(
    full,
    /'\.\.\/\.\.\/art\/energy-symbols-export\/'/,
    "Full Rules must not use the Quick Reference's two-levels-up ART path"
  );
});

test('Quick Reference contains no Hand Checker root markup (3.1)', () => {
  assert.doesNotMatch(quick, /class="hc"/, 'Quick Reference still has a div.hc element');
});

test('Quick Reference references none of the five Hand Checker IDs (3.1, 3.4)', () => {
  for (const id of HC_IDS) {
    assert.doesNotMatch(
      quick,
      new RegExp(`\\b${id}\\b`),
      `Quick Reference still references ${id}`
    );
  }
});

test('Quick Reference contains no Hand Checker CSS block (3.2)', () => {
  assert.doesNotMatch(quick, /Hand checker/i, 'Quick Reference still has the Hand checker CSS comment');
  assert.doesNotMatch(quick, /\.hc-energies\s*\{/, 'Quick Reference still has .hc-energies CSS');
  assert.doesNotMatch(quick, /\.hc-results\s*\{/, 'Quick Reference still has .hc-results CSS');
});

test('Quick Reference contains no Hand Checker JavaScript (3.3)', () => {
  for (const sym of HC_JS_SYMBOLS) {
    assert.doesNotMatch(
      quick,
      new RegExp(`\\b${sym}\\b`),
      `Quick Reference still defines/calls ${sym}`
    );
  }
});

test('First-game tip points to the Full Rules Hand Checker (4.1)', () => {
  assert.match(
    quick,
    /Mid-game questions:.*Check your hand.*archmage-reference\.html#spells/s,
    'the mid-game tip should link to ../archmage-reference.html#spells'
  );
});

test('First-game tip no longer names the Quick Reference Spells screen (4.2)', () => {
  // Isolate the mid-game list item and assert it does not send readers to a
  // "Spells screen" within the Quick Reference.
  const m = quick.match(/<li>\s*Mid-game questions:[\s\S]*?<\/li>/);
  assert.ok(m, 'could not locate the mid-game tip list item');
  assert.doesNotMatch(
    m[0],
    /Spells screen/i,
    'the mid-game tip must not reference the Quick Reference Spells screen'
  );
});
