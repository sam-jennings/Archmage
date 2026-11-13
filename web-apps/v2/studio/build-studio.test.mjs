import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {frontMatter,renderMarkdown,safeHref} from '../tools/studio-markdown.mjs';
import {lintVocabulary,documentMetadata} from '../tools/build-studio.mjs';
const V2=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ROOT=path.resolve(V2,'../..'),OUTPUT=path.join(V2,'studio/expansions');
const digest=s=>createHash('sha256').update(s).digest('hex');
async function snapshot(dir) {
  const result={};for(const entry of await readdir(dir,{withFileTypes:true})) {
    if(entry.isDirectory())Object.assign(result,await snapshot(path.join(dir,entry.name)));
    else result[path.join(dir,entry.name)]=digest(await readFile(path.join(dir,entry.name)));
  }return result;
}
test('escapes raw HTML, hostile links, code and placeholder characters',()=>{
  const {html}=renderMarkdown('<script>alert(1)</script>\n\n[bad](javascript:alert) [ok](https://example.com)\n\n`<img onerror=x>`\n\n\u00010\u0002');
  assert.ok(!html.includes('<script>'));assert.ok(!html.includes('href="javascript:'));
  assert.match(html,/&lt;script&gt;/);assert.match(html,/href="https:\/\/example.com"/);
  assert.ok(!html.includes('undefined'));assert.equal(safeHref('java\nscript:x'),null);assert.equal(safeHref('//example.com'),null);
});
test('headings are stable and unique; logs disclose only their own section',()=>{
  const {html,headings}=renderMarkdown('# Design\n\n## Iteration log\n\n### Bug A\n\nFixed.\n\n## Iteration log\n\nDone.\n\n## Rules\n\nCurrent.');
  assert.equal((html.match(/<h1/g)||[]).length,0);
  assert.deepEqual(headings.map(h=>h.id),['design','iteration-log','bug-a','iteration-log-2','rules']);
  assert.match(html,/<\/details>\n<h3 id="rules">/);
});
test('renders nested lists, quotes, fenced code, scrollable tables and wiki labels',()=>{
  const {html}=renderMarkdown('1. Parent\n   - Child\n2. Next\n\n> Quoted\n\n| Energy | Value |\n|---|---:|\n| Void | 3 |\n\n```js\n<a>\n```\n\n[[The Schools|Schools]]',{resolveLink:()=> 'schools.html',energy:name=>`<span>${name}</span>`});
  assert.match(html,/<ol>[\s\S]*<ul>/);assert.match(html,/<blockquote>/);assert.match(html,/role="region"/);assert.match(html,/<th scope="col">/);
  assert.match(html,/<pre><code>&lt;a&gt;/);assert.match(html,/<a href="schools.html">Schools<\/a>/);
});
test('source metadata never treats a tuning gate as base-version certification',()=>{
  const doc={meta:{created:'2026-07-02'},source:'expansion/example.md',body:'Tuning gated on v3.1 confirm/kill.',title:'Example v0.1'};
  assert.equal(documentMetadata(doc,'','v3.1').base,'Not declared');
  doc.meta.base_version='v3.0';assert.equal(documentMetadata(doc,'','v3.1').base,'v3.0');
  assert.equal(frontMatter('---\nstatus: parked\n---\nText').meta.status,'parked');
});
test('lint uses case-sensitive whole terms and original line numbers',()=>{
  assert.deepEqual(lintVocabulary('x.md','---\ntitle: X\n---\nConvergence, Convergences; convergence. Unlimited Capacity',['Convergence','Unlimited Capacity']).map(r=>[r.line,r.term,r.count]),[[4,'Convergence',1],[4,'Unlimited Capacity',1]]);
});
test('real build preserves sources and gives byte-identical output on regeneration',async()=>{
  const before=await snapshot(path.join(ROOT,'expansion'));
  execFileSync(process.execPath,[path.join(V2,'tools/build-studio.mjs')]);
  const first=await snapshot(OUTPUT);
  execFileSync(process.execPath,[path.join(V2,'tools/build-studio.mjs')]);
  assert.deepEqual(await snapshot(OUTPUT),first);assert.deepEqual(await snapshot(path.join(ROOT,'expansion')),before);
});
test('all generated HTML has privacy banner, one h1, unique ids and valid local targets',async()=>{
  const catalog=JSON.parse(await readFile(path.join(OUTPUT,'catalog.json'),'utf8'));
  assert.equal(catalog.modules.length,13);assert.equal(catalog.modules.filter(m=>m.metadata.status==='locked-in').length,1);
  const htmlFiles=(await readdir(OUTPUT)).filter(f=>f.endsWith('.html'));
  for(const filename of htmlFiles) {
    const html=await readFile(path.join(OUTPUT,filename),'utf8');
    assert.match(html,/<meta name="robots" content="noindex,nofollow">/,filename);assert.match(html,/Designer notes · draft · not rules/,filename);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,filename);
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,filename);
    for(const [,attribute,raw] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
      const href=raw.replace(/&amp;/g,'&');if(/^(?:https?:|mailto:)/.test(href))continue;
      const [pathname,hash]=href.split('#');
      const target=pathname?path.resolve(OUTPUT,decodeURIComponent(pathname)):path.join(OUTPUT,filename);
      assert.ok((await stat(target)).isFile(),`${filename}: missing ${attribute} ${href}`);
      if(hash && target.endsWith('.html') && target.includes(path.sep+'studio'+path.sep)) {
        const dest=target===path.join(OUTPUT,filename)?html:await readFile(target,'utf8');
        assert.ok(dest.includes(`id="${hash}"`),`${filename}: missing fragment ${href}`);
      }
    }
  }
  assert.ok(!htmlFiles.some(f=>f==='old-expansion-thread.html'||f.includes('source-expansion')));
  const duels=await readFile(path.join(OUTPUT,catalog.modules.find(m=>m.title.startsWith('Spell Duels')).href),'utf8');
  assert.match(duels,/id="source-material"/);assert.match(duels,/source\/Expansion/);
});
