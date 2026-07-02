// Headless loader for the Full Rules Hand Checker widget.
//
// This does NOT modify the production HTML. It reads
// web-apps/archmage-reference.html, mounts its real DOM via jsdom (page
// scripts are NOT auto-run), extracts the self-contained Hand Checker JS
// segment verbatim, and evaluates that segment against the mounted DOM in a
// vm context. The widget's own symbols (hc state + hc* functions) are then
// captured and returned so property tests can drive the real logic headlessly.
//
// The extracted segment begins at the ported `ART` constant (the first line
// of the Hand Checker dependency block) and runs to the closing </script>,
// which is exactly the block the design document specifies as ported.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_PATH = path.resolve(__dirname, '../../archmage-reference.html');

const START_MARKER = "const ART = '../art/energy-symbols-export/'";

function extractHandCheckerScript(html) {
  const start = html.indexOf(START_MARKER);
  if (start === -1) {
    throw new Error('Could not locate the Hand Checker JS segment (ART constant) in archmage-reference.html');
  }
  const end = html.indexOf('</script>', start);
  if (end === -1) {
    throw new Error('Could not locate the closing </script> after the Hand Checker JS segment');
  }
  return html.slice(start, end);
}

// Build a fresh, isolated widget instance bound to its own DOM. Each call
// returns an independent hand/state so property runs do not leak into
// each other.
export function loadWidget() {
  const html = readFileSync(HTML_PATH, 'utf8');

  // Mount the real page DOM without running its scripts.
  const dom = new JSDOM(html, { runScripts: 'outside-only' });
  const { window } = dom;
  const { document } = window;

  const segment = extractHandCheckerScript(html);

  // After the verbatim segment, capture the widget's lexical symbols so the
  // test can reach them. These identifiers are all declared within the
  // segment itself.
  const captureCode = `${segment}
    ;globalThis.__handChecker = {
      hc: hc,
      hcAdd: hcAdd,
      hcRemove: hcRemove,
      hcRenderHand: hcRenderHand,
      hcFindSpells: hcFindSpells,
      hcRenderResults: hcRenderResults,
    };`;

  const sandbox = {
    window,
    document,
    console,
    globalThis: undefined,
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(captureCode, sandbox, { filename: 'archmage-reference-handchecker.js' });

  const api = sandbox.__handChecker;
  return {
    ...api,
    document,
    window,
    // Faithfully invoke the production "clear" operation by clicking the
    // wired-up Clear-all control (the same listener bound in the segment).
    clickClear() {
      const btn = document.getElementById('hcClear');
      if (!btn) throw new Error('hcClear button not found in mounted DOM');
      btn.click();
    },
    resultsEl() {
      return document.getElementById('hcResults');
    },
  };
}
