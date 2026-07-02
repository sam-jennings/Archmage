// Extracts the self-contained Hand Checker widget logic from a rules HTML
// document and evaluates it headlessly with the DOM and ART stubbed, so the
// pure detection/state logic can be exercised by property tests without a
// browser. This keeps the HTML document as the single source of truth — the
// tests run the exact ported code, not a copy.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Repo-root-relative path to the Full Rules document that hosts the widget.
export const FULL_RULES_HTML = resolve(__dirname, '..', '..', 'web-apps', 'archmage-reference.html');

/**
 * A minimal DOM stub. The widget's render functions all early-return when
 * getElementById yields null, so no DOM tree is built — the detection logic
 * (hcFindSpells / hcBestRun) and the state transitions (hcAdd / hcRemove /
 * clear) run untouched.
 */
function makeDocumentStub() {
  const noopNode = () => ({
    className: '',
    style: { setProperty() {}, cursor: '' },
    innerHTML: '',
    hidden: false,
    appendChild() {},
    setAttribute() {},
    addEventListener() {},
  });
  return {
    getElementById() { return null; },
    createElement() { return noopNode(); },
    addEventListener() {},
  };
}

/**
 * Reads the given HTML file, slices out the Hand Checker JS section (from the
 * ported `const ART` declaration through the widget's init calls), and
 * evaluates it in a function scope, returning the widget's internal API.
 */
export function loadHandChecker(htmlPath = FULL_RULES_HTML) {
  const html = readFileSync(htmlPath, 'utf8');

  const startMarker = "const ART = '../art/energy-symbols-export/';";
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) {
    throw new Error(`Could not find Hand Checker start marker in ${htmlPath}`);
  }
  // The widget section is the last JS before this script's closing tag.
  const endIdx = html.indexOf('</script>', startIdx);
  if (endIdx === -1) {
    throw new Error(`Could not find closing </script> after Hand Checker in ${htmlPath}`);
  }

  const widgetSource = html.slice(startIdx, endIdx);

  // Expose the widget internals from the evaluated function scope. const/
  // function declarations remain in scope, so we can return references to them.
  const body =
    widgetSource +
    '\n;return { hc, hcAdd, hcRemove, hcFindSpells, hcBestRun, rpFor, RP,' +
    ' ENERGIES, WILD, SPELL_NAMES, SPELL_EFFECT_SHORT };';

  // eslint-disable-next-line no-new-func
  const factory = new Function('document', body);
  return factory(makeDocumentStub());
}
