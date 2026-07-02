// Load-time (headless) smoke checks.
//
// Validates:
//   Full Rules -> 2.1, 2.2, 2.3  (no script errors, deps resolve, controls render)
//   Quick Ref  -> 3.5, 3.6       (no script errors, Spells tiles still render)

import test from 'node:test';
import assert from 'node:assert/strict';
import { loadDocument, FULL_RULES_PATH, QUICK_REF_PATH, HC_IDS } from './helpers.mjs';

test('Full Rules loads without script/console errors (2.3)', async () => {
  const { errors } = await loadDocument(
    FULL_RULES_PATH,
    'https://example.test/web-apps/archmage-reference.html'
  );
  assert.deepEqual(errors, [], `Full Rules raised errors on load:\n${errors.join('\n')}`);
});

test('Full Rules defines the ported Hand Checker dependencies (2.2)', async () => {
  const { window } = await loadDocument(
    FULL_RULES_PATH,
    'https://example.test/web-apps/archmage-reference.html'
  );

  // Function declarations become global (window) properties.
  for (const fn of ['el', 'miniCard', 'rpFor', 'hcFindSpells', 'hcRenderEnergies']) {
    assert.equal(typeof window[fn], 'function', `expected ${fn}() to be defined in Full Rules`);
  }

  // const-declared data lives in the global lexical scope; indirect eval can
  // observe it. This confirms the ported data dependencies resolved.
  const geval = window.eval;
  assert.equal(geval('typeof ENERGIES'), 'object', 'ENERGIES should be defined');
  assert.equal(geval('typeof WILD'), 'object', 'WILD should be defined');
  assert.equal(geval('typeof RP'), 'object', 'RP should be defined');
  assert.equal(geval('typeof SPELL_EFFECT_SHORT'), 'object', 'SPELL_EFFECT_SHORT should be defined');
  assert.equal(geval("ART"), '../art/energy-symbols-export/', 'ART path should be adapted one level up');
});

test('Full Rules renders the Hand Checker controls (2.1, 2.4)', async () => {
  const { document } = await loadDocument(
    FULL_RULES_PATH,
    'https://example.test/web-apps/archmage-reference.html'
  );

  // All five nodes exist in the initial (static) markup.
  for (const id of HC_IDS) {
    assert.ok(document.getElementById(id), `#${id} should exist in the Full Rules DOM`);
  }

  // Energy pickers and the value keypad were rendered by the init calls,
  // which requires ENERGIES/WILD/el() to have resolved.
  assert.ok(
    document.getElementById('hcEnergies').children.length > 0,
    'expected rendered energy buttons in #hcEnergies'
  );
  assert.ok(
    document.getElementById('hcEntry').children.length > 0,
    'expected the value keypad to render in #hcEntry'
  );
  assert.ok(
    document.getElementById('hcHand').children.length > 0,
    'expected the empty-hand placeholder to render in #hcHand'
  );

  // hcFindSpells over an empty hand yields no results (sanity of the ported logic).
  // (The array originates in the jsdom realm, so compare by length.)
  assert.equal(document.defaultView.hcFindSpells().length, 0);
});

test('Quick Reference loads without script/console errors (3.5)', async () => {
  const { errors } = await loadDocument(
    QUICK_REF_PATH,
    'https://example.test/web-apps/player-reference/player-reference.html'
  );
  assert.deepEqual(errors, [], `Quick Reference raised errors on load:\n${errors.join('\n')}`);
});

test('Quick Reference Spells screen still renders its tiles (3.6)', async () => {
  const { document } = await loadDocument(
    QUICK_REF_PATH,
    'https://example.test/web-apps/player-reference/player-reference.html'
  );

  const tiles = document.getElementById('spellTiles');
  assert.ok(tiles, '#spellTiles should exist in the Quick Reference');
  assert.ok(tiles.children.length > 0, 'expected rendered spell tiles in #spellTiles');

  // The Hand Checker must be gone from the live DOM as well.
  for (const id of HC_IDS) {
    assert.equal(document.getElementById(id), null, `#${id} should not exist in the Quick Reference`);
  }
});
