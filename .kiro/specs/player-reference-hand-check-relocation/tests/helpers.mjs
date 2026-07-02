// Shared helpers for the Hand Checker relocation smoke checks.
//
// These tests are intentionally read-only with respect to the production
// HTML: they parse the documents and (for load-time checks) instantiate them
// in a headless DOM. Nothing here mutates the source files.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// tests -> spec -> specs -> .kiro -> <workspace root>
const REPO_ROOT = path.resolve(HERE, '../../../../');

export const FULL_RULES_PATH = path.join(REPO_ROOT, 'web-apps', 'archmage-reference.html');
export const QUICK_REF_PATH = path.join(
  REPO_ROOT,
  'web-apps',
  'player-reference',
  'player-reference.html'
);

// The five element IDs that define the Hand Checker markup.
export const HC_IDS = ['hcEnergies', 'hcEntry', 'hcHand', 'hcClear', 'hcResults'];

// JavaScript symbols that are specific to the Hand Checker widget.
export const HC_JS_SYMBOLS = [
  'hcFindSpells',
  'hcRenderResults',
  'hcRenderEnergies',
  'hcRenderEntry',
  'hcRenderHand',
  'hcAdd',
];

export function readFull() {
  return readFileSync(FULL_RULES_PATH, 'utf8');
}

export function readQuick() {
  return readFileSync(QUICK_REF_PATH, 'utf8');
}

// Instantiate an HTML document in a headless DOM and run its inline scripts.
// Resolves with { dom, window, document, errors } once the document has
// finished loading. `errors` collects any uncaught script errors and
// console.error output produced during load.
export function loadDocument(filePath, url) {
  const html = readFileSync(filePath, 'utf8');
  const errors = [];

  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (err) => {
    // jsdom surfaces genuinely-unsupported browser APIs (e.g. layout/paint)
    // as "Not implemented" notices. Those are environment limitations, not
    // page script errors, so they are not treated as failures here.
    const msg = String(err && err.message ? err.message : err);
    if (/^Not implemented:/.test(msg)) return;
    errors.push(msg);
  });
  virtualConsole.on('error', (msg) => errors.push(`console.error: ${msg}`));

  const dom = new JSDOM(html, {
    url,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      // Stub browser APIs jsdom does not implement so that page scripts run
      // without throwing. These are no-ops purely for the headless run.
      window.scrollTo = () => {};
      window.scroll = () => {};
      if (!window.matchMedia) {
        window.matchMedia = () => ({
          matches: false,
          media: '',
          addListener() {},
          removeListener() {},
          addEventListener() {},
          removeEventListener() {},
          dispatchEvent() { return false; },
        });
      }
    },
  });

  return new Promise((resolve) => {
    const finish = () =>
      resolve({ dom, window: dom.window, document: dom.window.document, errors });
    if (dom.window.document.readyState === 'complete') {
      // Inline scripts have already executed; give any load handlers a tick.
      setTimeout(finish, 0);
    } else {
      dom.window.addEventListener('load', () => setTimeout(finish, 0));
      // Fallback in case the load event does not fire in the headless env.
      setTimeout(finish, 500);
    }
  });
}
