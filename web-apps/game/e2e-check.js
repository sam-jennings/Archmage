#!/usr/bin/env node
/* Browser smoke test (dev tool, not shipped to players).
 * Serves this folder, drives the game in headless Chromium, and saves
 * screenshots to /tmp/archmage-shots.
 *   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node e2e-check.js
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROOT = __dirname;
const SHOTS = '/tmp/archmage-shots';
fs.mkdirSync(SHOTS, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); res.end('nope'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'text/plain' });
    res.end(data);
  });
});

const errors = [];
function watch(page, tag) {
  page.on('pageerror', e => errors.push(tag + ' pageerror: ' + e.message));
  page.on('console', m => {
    if (m.type() === 'error' && !/net::|Failed to load resource/.test(m.text())) {
      errors.push(tag + ' console: ' + m.text());
    }
  });
}
async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: false });
  console.log('  shot: ' + name);
}
const sel = a => `[data-action="${a}"]`;

(async () => {
  await new Promise(r => server.listen(0, r));
  const url = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch();

  /* ---------- A: desktop, 2 humans hot-seat ---------- */
  {
    console.log('A: desktop hot-seat (2 humans)');
    const page = await browser.newPage({ viewport: { width: 1366, height: 860 } });
    watch(page, 'A');
    await page.goto(url);
    await page.waitForSelector(sel('start'));
    await shot(page, 'a1-title-desktop');
    // make seat 2 human
    await page.click(`${sel('seat-type')}[data-i="1"][data-ai="0"]`);
    await page.click(sel('start'));
    // binding with pass screens, both players
    for (let i = 0; i < 2; i++) {
      await page.waitForSelector(sel('pass-begin'));
      if (i === 0) await shot(page, 'a2-pass-screen');
      await page.click(sel('pass-begin'));
      await page.waitForSelector(sel('sel-hand'));
      if (i === 0) await shot(page, 'a3-binding');
      await page.click(sel('sel-hand'));
      await page.click(sel('bind-confirm'));
    }
    // first player's turn: pass, collect from array, casting, learning
    await page.waitForSelector(sel('pass-begin'));
    await page.click(sel('pass-begin'));
    await page.waitForSelector(sel('collect-source'));
    await page.click(sel('sel-array'));        // pick first array card
    await shot(page, 'a4-collection-array');
    await page.click(sel('collect-array-confirm'));
    await page.waitForSelector(sel('end-casting'));
    await shot(page, 'a5-casting');
    await page.click(sel('end-casting'));      // no spells cast -> straight to learning
    await page.waitForSelector(sel('end-turn'));
    // try selecting 3 cards; learn if the engine offers a valid type
    // (re-query each time: every click re-renders the DOM)
    for (let i = 0; i < 3; i++) {
      await page.click(`.handbar ${sel('sel-hand')} >> nth=${i}`);
    }
    await shot(page, 'a6-learning');
    const learnBtn = await page.$(sel('learn'));
    if (learnBtn) {
      await learnBtn.click();
      console.log('  learned a spell');
      await shot(page, 'a6b-after-learn');
    }
    await page.click(sel('end-turn'));
    await page.waitForSelector(sel('pass-begin'));  // P2's pass screen
    await page.close();
  }

  /* ---------- B: mobile, 1 human + 2 AI ---------- */
  {
    console.log('B: mobile (1 human + 2 AI)');
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    watch(page, 'B');
    await page.goto(url);
    await page.waitForSelector(sel('start'));
    await page.click(`${sel('count')}[data-n="3"]`);
    await shot(page, 'b1-title-mobile');
    await page.click(sel('start'));
    // solo human: no pass screens. Either it's our binding, or AI binds first.
    await page.waitForSelector(`.handbar ${sel('sel-hand')}`, { timeout: 20000 });
    await shot(page, 'b2-binding-mobile');
    await page.click(`.handbar ${sel('sel-hand')}`);
    await page.click(sel('bind-confirm'));
    // wait for our collection phase (AI plays through)
    await page.waitForSelector(sel('collect-source'), { timeout: 30000 });
    await shot(page, 'b3-collection-mobile');
    await page.click(sel('collect-source'));
    await page.waitForSelector(sel('end-casting'), { timeout: 10000 });
    await page.click(sel('end-casting'));
    await page.waitForSelector(sel('end-turn'));
    await shot(page, 'b4-learning-mobile');
    // open help overlay on mobile
    await page.click(sel('menu'));
    await page.click(sel('help'));
    await shot(page, 'b5-help-mobile');
    await page.click(sel('help-close'));
    await page.click(sel('end-turn'));
    await page.close();
  }

  /* ---------- C: all-AI game to the scoring screen ---------- */
  {
    console.log('C: full all-AI playthrough (4 players)');
    const page = await browser.newPage({ viewport: { width: 820, height: 1180 } });
    watch(page, 'C');
    await page.goto(url);
    await page.waitForSelector(sel('start'));
    await page.click(`${sel('count')}[data-n="4"]`);
    await page.click(`${sel('seat-type')}[data-i="0"][data-ai="1"]`); // all seats AI
    await page.click(sel('start'));
    await page.waitForSelector(sel('fastai'), { timeout: 15000 });
    await page.click(sel('fastai'));
    // play until the Drought notice appears, acknowledge it
    await page.waitForSelector(sel('notice-ok'), { timeout: 120000 });
    await shot(page, 'c1-drought-notice');
    await page.click(sel('notice-ok'));
    // then through to the final evaluation
    await page.waitForSelector(sel('score-new'), { timeout: 120000 });
    await shot(page, 'c2-score-screen');
    const headline = await page.textContent('.score-screen h1');
    console.log('  result: ' + headline.trim());
    await page.close();
  }

  /* ---------- D: continue from save ---------- */
  {
    console.log('D: save / continue');
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    watch(page, 'D');
    await page.goto(url);
    await page.click(`${sel('count')}[data-n="2"]`);
    await page.click(sel('start'));
    await page.waitForSelector(`.handbar ${sel('sel-hand')}`, { timeout: 20000 });
    await page.click(`.handbar ${sel('sel-hand')}`);
    await page.click(sel('bind-confirm'));
    await page.reload();
    await page.waitForSelector(sel('continue'));
    await page.click(sel('continue'));
    await page.waitForSelector('.game', { timeout: 20000 });
    console.log('  resumed saved game OK');
    await page.close();
  }

  await browser.close();
  server.close();
  if (errors.length) {
    console.error('\nBROWSER ERRORS:');
    errors.forEach(e => console.error('  ' + e));
    process.exit(1);
  }
  console.log('\nE2E checks passed. Screenshots in ' + SHOTS);
})().catch(e => { console.error(e); process.exit(1); });
