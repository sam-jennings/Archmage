#!/usr/bin/env node
// export-cs3/svg-to-pdf.js
// Converts SVG cards to PDF using Puppeteer (headless Chrome).
// No native Cairo dependency required.
//
// Usage:
//   node export-cs3/svg-to-pdf.js [--width-mm 62] [--height-mm 88] [--bleed-mm 3]
//
// Reads all .svg files from export-cs3/svg-cards/ and writes PDFs to export-cs3/pdf-cards/.

'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function flag(name, def) {
  const i = args.indexOf('--' + name);
  return i !== -1 ? args[i + 1] : def;
}

const TRIM_W_MM = parseFloat(flag('width-mm', '62'));
const TRIM_H_MM = parseFloat(flag('height-mm', '88'));
// PDF page is always the trim size — the printer expects 62×88mm.
const PAGE_W_MM = TRIM_W_MM;
const PAGE_H_MM = TRIM_H_MM;

// Parallelism: how many browser pages to use concurrently
const CONCURRENCY = parseInt(flag('concurrency', '4'), 10);

const SVG_DIR = path.join(__dirname, 'svg-cards');
const PDF_DIR = path.join(__dirname, 'pdf-cards');

async function convertOne(page, svgFile) {
  const svgPath = path.join(SVG_DIR, svgFile);
  const pdfPath = path.join(PDF_DIR, svgFile.replace('.svg', '.pdf'));
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  // Extract the embedded @font-face style from inside the SVG so it's also
  // available at the HTML document level. Puppeteer's PDF renderer sometimes
  // doesn't pick up fonts declared only inside an inline SVG.
  let fontStyle = '';
  const styleMatch = svgContent.match(/<style>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    fontStyle = `<style>${styleMatch[1]}</style>`;
  }

  // Convert mm to inches for Puppeteer (it uses inches internally).
  // We set the viewport to match the exact pixel dimensions at 96dpi so
  // the content fills the page with zero gaps.
  const pageWIn = PAGE_W_MM / 25.4;
  const pageHIn = PAGE_H_MM / 25.4;
  const vpW = Math.ceil(pageWIn * 96);
  const vpH = Math.ceil(pageHIn * 96);

  await page.setViewport({ width: vpW, height: vpH });

  // The HTML uses viewport units (vw/vh) to guarantee the SVG fills the
  // entire page regardless of any browser default margins.
  const html = `<!DOCTYPE html><html><head>${fontStyle}<style>
@page{size:${PAGE_W_MM}mm ${PAGE_H_MM}mm;margin:0}
*{margin:0;padding:0}
html,body{width:100vw;height:100vh;overflow:hidden}
svg{display:block;width:100vw;height:100vh}
</style></head><body>${svgContent}</body></html>`;

  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 50));
  await page.pdf({
    path: pdfPath,
    width: `${pageWIn}in`,
    height: `${pageHIn}in`,
    printBackground: true,
    margin: { top: '0in', right: '0in', bottom: '0in', left: '0in' },
    preferCSSPageSize: false,
    displayHeaderFooter: false,
  });
}

async function main() {
  if (!fs.existsSync(SVG_DIR)) {
    console.error('No svg-cards/ directory found. Run export.js first.');
    process.exit(1);
  }

  const svgFiles = fs.readdirSync(SVG_DIR)
    .filter(f => f.endsWith('.svg'))
    .sort();

  if (svgFiles.length === 0) {
    console.error('No SVG files found in svg-cards/.');
    process.exit(1);
  }

  fs.mkdirSync(PDF_DIR, { recursive: true });

  console.log(`Converting ${svgFiles.length} SVGs to PDF (concurrency: ${CONCURRENCY})...`);
  console.log(`  Page size: ${PAGE_W_MM} x ${PAGE_H_MM} mm (ratio: ${(PAGE_W_MM/PAGE_H_MM).toFixed(4)})`);

  const startTime = Date.now();
  const browser = await puppeteer.launch({ headless: true });

  // Create multiple pages for parallel processing
  const pages = await Promise.all(
    Array.from({ length: CONCURRENCY }, () => browser.newPage())
  );

  let count = 0;
  let errors = [];

  // Process in batches of CONCURRENCY
  for (let i = 0; i < svgFiles.length; i += CONCURRENCY) {
    const batch = svgFiles.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map((file, idx) => convertOne(pages[idx], file))
    );

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        count++;
      } else {
        errors.push(`${batch[idx]}: ${result.reason.message}`);
      }
    });

    if (count % 20 < CONCURRENCY && count >= 20) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`  ${count}/${svgFiles.length} done (${elapsed}s)...`);
    }
  }

  await browser.close();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone. ${count} PDFs written to export-cs3/pdf-cards/ in ${totalTime}s`);
  console.log(`  Page size: ${PAGE_W_MM} x ${PAGE_H_MM} mm (ratio: ${(PAGE_W_MM / PAGE_H_MM).toFixed(6)})`);

  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s):`);
    errors.forEach(e => console.error('  ' + e));
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
