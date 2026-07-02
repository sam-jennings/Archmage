// Headless harness for the Full Rules Hand Checker widget.
//
// The widget logic lives inline inside `web-apps/archmage-reference.html`. Per
// the design ("ART/DOM concerns are stubbed so the logic runs headlessly"), we
// extract the exact production source slice from the HTML and evaluate it in an
// isolated function scope with a minimal `document` stub. This tests the REAL
// shipped code without modifying the production HTML.
//
// Because the widget declares its state with `const hc` (block-scoped, so it is
// not attached to any global object), we append an epilogue inside the same
// function scope that returns the internal symbols we need for testing.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = resolve(__dirname, '..', 'archmage-reference.html');

// Markers bounding the self-contained Hand Checker JS inside the <script>.
const START_MARKER = "const ART = '../art/energy-symbols-export/';";
const END_MARKER = 'hcRenderHand();';

function extractWidgetSource() {
  const html = readFileSync(HTML_PATH, 'utf8');
  const start = html.indexOf(START_MARKER);
  if (start === -1) {
    throw new Error(`Could not locate Hand Checker start marker in ${HTML_PATH}`);
  }
  // The final init sequence ends with the last `hcRenderHand();` call.
  const lastEnd = html.lastIndexOf(END_MARKER);
  if (lastEnd === -1 || lastEnd < start) {
    throw new Error(`Could not locate Hand Checker end marker in ${HTML_PATH}`);
  }
  return html.slice(start, lastEnd + END_MARKER.length);
}

// A minimal DOM node stub. Records nothing meaningful; it just needs to absorb
// every property/method the render functions touch without throwing.
function makeNode() {
  const node = {
    className: '',
    innerHTML: '',
    textContent: '',
    hidden: false,
    type: '',
    src: '',
    alt: '',
    children: [],
    style: { setProperty() {} },
    setAttribute() {},
    getAttribute() { return null; },
    addEventListener() {},
    appendChild(child) { this.children.push(child); return child; },
  };
  return node;
}

// A minimal `document` stub. getElementById returns a persistent stub node per
// id so repeated lookups behave consistently within one widget instance.
function makeDocumentStub() {
  const byId = new Map();
  return {
    createElement() { return makeNode(); },
    getElementById(id) {
      if (!byId.has(id)) byId.set(id, makeNode());
      return byId.get(id);
    },
    addEventListener() {},
  };
}

const widgetSource = extractWidgetSource();

// Build a factory once; invoking it yields a fresh, isolated widget instance
// (its own `hc` state) each time, so tests never leak state into one another.
const factoryBody = `${widgetSource}\n;return { hc, hcAdd, hcRemove, hcFindSpells, hcRenderResults, hcRenderHand, hcRenderEnergies, hcRenderEntry, ENERGIES, WILD, RP, rpFor };`;
// eslint-disable-next-line no-new-func
const factory = new Function('document', factoryBody);

export function loadHandChecker() {
  const doc = makeDocumentStub();
  return factory(doc);
}

export { widgetSource };
