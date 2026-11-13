#!/usr/bin/env node
// Run from any working directory: node web-apps/v2/tools/build-studio.mjs
// No dependencies, network, source writes, shell calls, or git operations.
import {readFile,writeFile,readdir,mkdir,stat,unlink} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {escapeHtml as esc,plain,slug,frontMatter,renderMarkdown,safeHref} from './studio-markdown.mjs';
const V2=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ROOT=path.resolve(V2,'../..');
const OUTPUT=path.join(V2,'studio/expansions');
const posix=p=>p.split(path.sep).join('/');
const encodePath=p=>p.split('/').map(encodeURIComponent).join('/');
const urlFrom=(output,source)=>encodePath(posix(path.relative(OUTPUT,path.join(ROOT,source))));
const sourceUrl=source=>urlFrom(OUTPUT,source);
const normalize=s=>s.replace(/\.md$/i,'').toLowerCase();
async function walk(dir) {
  const found=[];
  for(const entry of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name,'en'))) {
    if(entry.isSymbolicLink()) continue;
    if(entry.isDirectory()) found.push(...await walk(path.join(dir,entry.name)));
    else if(entry.name.endsWith('.md')) found.push(path.join(dir,entry.name));
  }
  return found;
}
export function lintVocabulary(source,text,terms) {
  const rows=[];
  for(const [index,line] of text.replace(/\r\n?/g,'\n').split('\n').entries()) for(const term of terms) {
    const escaped=term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const matches=[...line.matchAll(new RegExp(`(?<![\\w])${escaped}(?![\\w])`,'g'))];
    if(matches.length)rows.push({source,line:index+1,term,count:matches.length,excerpt:line.trim()});
  }
  return rows;
}
function indexSection(index,relative) {
  const marker='`'+relative.replace(/^expansion\//,'')+'`';
  const at=index.indexOf(marker);
  if(at<0)return '';
  const start=index.lastIndexOf('\n### ',at),end=index.indexOf('\n### ',at);
  return index.slice(start<0?at:start,end<0?index.length:end);
}
export function documentMetadata(doc,index,current) {
  const section=indexSection(index,doc.source),all=doc.body+'\n'+section;
  const explicit=doc.meta.base_rules_version||doc.meta.base_version||doc.meta.rulebook_version||
    doc.body.match(/(?:written\s+(?:against|for)|base[- ]rules(?:\s+version)?\s*[:=]|rulebook\s+version\s*[:=])\s*\*{0,2}(v\d+\.\d+)/i)?.[1];
  const dates=[doc.meta.updated,doc.meta.created,...all.matchAll(/\b(20\d{2}-\d{2}-\d{2})\b/g)].map(value=>Array.isArray(value)?value[1]:value).filter(Boolean).sort();
  const version=doc.meta.version||doc.title.match(/\bv(0\.\d+)\b/)?.[1]||(/v0\.1 ruleset/i.test(section)?'0.1':null);
  let status=version?'v0.1 ruleset':'concept';
  if(/^(parked|shelved|template-gated)$/.test(doc.meta.status||''))status='parked';
  if(doc.meta.status==='locked-in')status='locked-in';
  return {status,originalStatus:doc.meta.status||'Not declared',version,updated:dates.at(-1)||'Not recorded',
    updatedBasis:doc.meta.updated?'front matter; later dated notes included':'latest date recorded in document/index (not filesystem time)',
    base:explicit||'Not declared',current};
}
const ruleTouches=[
  ['set-up','Set-up',/\bsetup\b|\bset-up\b|\bdeck\b|\bplayers\b/i],
  ['collection','Collection',/\bCollection\b|\bArray\b|\bRift\b/],
  ['casting','Casting',/\bCasting\b|\bcast(?:s|ing)?\b/i],
  ['wilds','Wilds',/\bwilds?\b/i],
  ['learning','Learning',/\bLearning\b|\bLearn\b|\bUnlearn\b|\bReshape\b/],
  ['counters','Counters & capacity',/\bcounters?\b|\bcapacity\b/i],
  ['drought-turn','Drought',/\bDrought\b/],
  ['recognition-points','Scoring',/\bscor(?:e|es|ing)\b|\bRP\b|\bRecognition Points\b/i],
  ['ascension-trials','Trials',/\bTrials\b/],
];
function metadataHtml(meta,players) {
  return `<dl class="studio-meta"><dt>Players</dt><dd>${esc(players)}</dd><dt>Last updated</dt><dd title="${esc(meta.updatedBasis||'Expansion index')}">${esc(meta.updated)}</dd><dt>Written against</dt><dd>${esc(meta.base)}</dd></dl>`;
}
function statusHtml(status) {return `<span class="studio-status" data-status="${esc(status)}">${esc(status)}</span>`;}
function pitchFrom(body,fallback) {
  const paragraphs=body.split(/\n\s*\n/).map(p=>p.trim());
  const para=paragraphs.find(p=>p && !/^(?:#|>|---|[-*] )/.test(p) && !/^\*[^*]+\*\s*$/.test(p))||fallback;
  return plain(para).replace(/\s+/g,' ').slice(0,210);
}
// Editorial one-line summaries of the source designs; never rule replacements.
const pitches={
  'foci-and-conduits':'Draft unique spell attachments, then chain smaller spells through Conduits.',
  'rituals-and-seals':'Earn Seals from public Rituals; keep their abilities while the qualifying structures stand.',
  'schools-and-last-rites/schools':'Draft a School for an always-on Talent and an endgame scoring Lean.',
  'schools-and-last-rites/rites':'Sacrifice components for once-only Rites during the Drought.',
  'null-cabal':'Use anonymous contributions to uncover a hidden Cabalist before the Drought vote.',
  'the-schism':'A two-player cut-and-choose market makes every Collection a contested decision.',
  'solo-attuned-rival':'Race a suit-based automa that competes for the Array and burns the Source.',
  'spell-duels':'Stake components in frequency clashes, developed across five complexity tiers.',
  'The Living Array':'Turn the shared Array into a source of indirect competition without new components.',
  'The Conclave':'Negotiate through Agendas, Influence, Pacts and Edicts.',
  'The Overtones':'Race to claim high-frequency components from a public prestige rack.',
  'The Convergence':'Meet shared demands before the Source collapses in a co-op or solo concept.',
};
async function build() {
  const canon=await readFile(path.join(ROOT,'meta/canon.yml'),'utf8');
  const current=canon.match(/^rulebook_version:\s*(.+)$/m)?.[1].trim()||'unknown';
  const terms=(canon.match(/^retired_terms:\s*(.*)$/m)?.[1]||'').split(',').map(s=>s.trim()).filter(Boolean);
  const {SITE}=await import(pathToFileURL(path.join(V2,'data/site.js')).href);
  const files=await walk(path.join(ROOT,'expansion'));
  const docs=[];
  for(const file of files) {
    const source=posix(path.relative(ROOT,file));
    if(path.basename(file)==='old-expansion-thread.md')continue;
    const text=await readFile(file,'utf8'),parsed=frontMatter(text);
    const title=parsed.body.match(/^#\s+(.+)$/m)?.[1]||parsed.meta.title||path.basename(file,'.md');
    docs.push({source,text,...parsed,title:plain(title),sourceOnly:source.includes('/source/'),href:slug(source.slice(10,-3))+'.html'});
  }
  const index=docs.find(d=>d.source==='expansion/EXPANSION_INDEX.md');
  if(!index)throw new Error('expansion/EXPANSION_INDEX.md is required');
  const pages=docs.filter(d=>!d.sourceOnly && d!==index);
  for(const doc of pages)doc.metadata=documentMetadata(doc,index.body,current);
  const names=new Map();
  for(const doc of docs)for(const name of new Set([doc.source,doc.source.slice(10),path.posix.basename(doc.source),doc.title,doc.meta.title].filter(Boolean).map(normalize))) {
    if(!names.has(name))names.set(name,[]);names.get(name).push(doc);
  }
  const unresolved=new Map();
  function resolveFor(owner) {
    return (target,wiki)=>{
      let decoded;try{decoded=decodeURIComponent(target);}catch{decoded=target;}
      if(!wiki && /^(?:https?:|mailto:)/i.test(decoded))return safeHref(target);
      if(!wiki && /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(decoded))return null;
      const [ref,fragment]=decoded.split('#'),hash=fragment?'#'+slug(fragment):'';
      if(!ref)return hash||'#';
      if(/Archmage Ascension - Complete Rulebook|Scoring System Reference/i.test(ref))return '../../rules/index.html'+(fragment?hash: /Scoring/i.test(ref)?'#recognition-points':'');
      if(normalize(path.posix.basename(ref))==='ascension trials')return '../../rules/index.html#ascension-trials';
      if(normalize(path.posix.basename(ref))==='expansion_index')return 'index.html'+hash;
      if(path.posix.basename(ref)==='old-expansion-thread.md' || normalize(ref)==='old-expansion-thread')return null;
      const relative=path.posix.normalize(path.posix.join(path.posix.dirname(owner.source),ref));
      const candidates=names.get(normalize(relative))||names.get(normalize(ref));
      if(candidates?.length===1) {
        const doc=candidates[0];
        return (doc===index?'index.html':doc.sourceOnly?sourceUrl(doc.source):doc.href)+hash;
      }
      if(!wiki) {
        const absolute=path.resolve(ROOT,relative),inside=path.relative(ROOT,absolute);
        if(inside.startsWith('..')||path.isAbsolute(inside))return null;
        return sourceUrl(relative)+(fragment?'#'+encodeURIComponent(fragment):'');
      }
      unresolved.set(owner.source+'|'+ref,{source:owner.source,target:ref});return null;
    };
  }
  const energy=name=>`<span class="studio-energy"><span class="studio-energy-icon"><img src="${esc(sourceUrl('art/energy-symbols-export/symbol_'+name.toLowerCase()+'_icon.svg'))}" alt="" width="22" height="22" loading="lazy"></span>${esc(name)}</span>`;
  const rendered=new Map(pages.map(doc=>[doc.source,renderMarkdown(doc.body,{resolveLink:resolveFor(doc),energy})]));
  const governanceLines=index.body.split('\n');
  const govStart=governanceLines.findIndex(line=>/^>.*Combination governance/.test(line));
  if(govStart<0)throw new Error('Combination governance block is missing from EXPANSION_INDEX.md');
  let govEnd=govStart;while(govEnd<governanceLines.length && /^>/.test(governanceLines[govEnd]))govEnd++;
  const governance=renderMarkdown(governanceLines.slice(govStart,govEnd).map(line=>line.replace(/^>\s?/,'' )).join('\n'),{resolveLink:resolveFor(index),energy}).html;
  function shell(title,body) {
    return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#110d22"><title>${esc(title)} · ${esc(SITE.title)} Studio</title><link rel="icon" href="${esc(sourceUrl('art/energy-symbols-export/symbol_wild_icon.svg'))}" type="image/svg+xml"><link rel="stylesheet" href="../../assets/tokens.css"><link rel="stylesheet" href="../../assets/site.css"><link rel="stylesheet" href="../studio.css"><script>try{if(JSON.parse(localStorage.getItem('ad2:theme'))==='day')document.documentElement.dataset.theme='day'}catch(e){}</script><script type="module" src="../studio.js"></script></head><body><header class="studio-head"><a class="ax-skip" href="#main">Skip to content</a><a class="ax-brand" href="../../index.html">${esc(SITE.title)}</a><nav aria-label="Designer navigation"><a href="../index.html">Studio</a><a href="index.html">Expansions</a><a href="../../rules/index.html">Base rules</a></nav><button type="button" class="ax-btn studio-theme">Daylight theme</button></header><main id="main" class="studio-shell"><aside class="studio-banner" aria-label="Draft status"><strong>Designer notes · draft · not rules</strong></aside>${body}</main><footer class="studio-foot">Current base: ${esc(current)} · Expansion text is preserved from the design documents. <a href="lint.html">Vocabulary & metadata notes</a> · <a href="#main">Back to top</a></footer></body></html>\n`;
  }
  const modules=[];
  const supporting=[];
  for(const doc of pages) {
    const filename=path.posix.basename(doc.source);
    if(/^(old-expansion-thread-review|Playtest Plans|Expansion Concepts|Expansion Directions)/i.test(filename))supporting.push(doc);
    else modules.push({title:doc.title.replace(/^(Expansion B|Expansion|Solo Mode)\s*[–—-]\s*/,'').replace(/\s*[–—-]\s*(?:v0\.1 Rules|Reconciled Ruleset & Complexity Tiers)$/,''),href:doc.href,
      pitch:doc.meta.pitch||pitches[doc.source.includes('The Schools')?'schools-and-last-rites/schools':doc.source.includes('The Last Rites')?'schools-and-last-rites/rites':doc.source.split('/')[1]]||pitchFrom(doc.body,doc.title),
      metadata:doc.metadata,players:/null-cabal\//.test(doc.source)?'3–6':/solo-attuned-rival\//.test(doc.source)?'1':/the-schism\//.test(doc.source)?'2':'2–4 / 5–6 with Echo (index compatibility rule)',source:doc.source});
  }
  // Concepts embedded in overview documents retain their own cards; no rules are invented.
  const bundled=[
    ['Expansion Concepts - Player Interaction.md',/^Expansion A\s+.*The Living Array$/,'The Living Array','2–7 in legacy draft; check current deck'],
    ['Expansion Concepts - Player Interaction.md',/^Expansion C\s+.*The Conclave$/,'The Conclave','2–7 in legacy draft; check current deck'],
    ['future-directions/Expansion Directions - Post-Echo Exploration.md',/^Direction 1\s+.*The Overtones$/,'The Overtones','2–4 / 5–6 with Echo'],
    ['future-directions/Expansion Directions - Post-Echo Exploration.md',/^Direction 4\s+.*The Convergence$/,'The Convergence','1–6 (co-op / solo concept)'],
  ];
  for(const [relative,pattern,title,players] of bundled) {
    const doc=docs.find(d=>d.source==='expansion/'+relative);if(!doc)continue;
    const headings=rendered.get(doc.source).headings,heading=headings.find(h=>pattern.test(h.title));if(!heading)throw new Error('Missing bundled concept: '+title);
    const lines=doc.body.split('\n'),start=lines.findIndex(line=>/^#{1,6}\s/.test(line) && plain(line.replace(/^#+\s+/,''))===heading.title);
    let end=start+1;while(end<lines.length && !new RegExp('^#{1,'+heading.level+'}\\s').test(lines[end]))end++;
    const body=lines.slice(start,end).join('\n');
    const concept={...doc,title,body,href:slug(title)+'.html',metadata:{...doc.metadata,status:'concept'},players};
    concept.rendered=renderMarkdown(body,{resolveLink:resolveFor(doc),energy});
    pages.push(concept);
    modules.push({title,players,pitch:pitches[title]||pitchFrom(body,title).replace(/^Hook\.\s*/,''),href:concept.href,metadata:concept.metadata,source:doc.source});
  }
  const locked=index.body.match(/\*\*([^*]+) is the only locked-in expansion\.\*\*/)?.[1];
  if(locked) {
    const metadata={status:'locked-in',originalStatus:'Locked in by expansion index',base:'Not declared in expansion index',updated:index.meta.updated};
    const body='# Ascension Trials\n\nThe expansion index identifies Ascension Trials as the only locked-in expansion. Its rules live outside the expansion folder, and scoring reconciliation is still open. This page does not select a rules candidate.\n\n[Open the versioned Trials companion](../../trials/index.html)\n\n[Read the base-rules Trials section](../../rules/index.html#ascension-trials)\n';
    const doc={source:index.source,title:locked,body,href:'ascension-trials.html',metadata,players:'2–4 / 5–6 with Echo; candidate-dependent'};
    // Links above are deliberately relative to the generated page, not the source index.
    doc.rendered=renderMarkdown(body);pages.push(doc);
    modules.unshift({title:locked,href:doc.href,pitch:'The only locked-in expansion. Its scoring reconciliation remains open; use the versioned Trials companion.',players:doc.players,metadata,source:index.source});
  }
  const order=['locked-in','v0.1 ruleset','concept','parked'];
  modules.sort((a,b)=>order.indexOf(a.metadata.status)-order.indexOf(b.metadata.status)||a.title.localeCompare(b.title,'en'));
  const card=m=>`<article class="studio-card">${statusHtml(m.metadata.status)}<h3><a href="${esc(m.href)}">${esc(m.title)}</a></h3><p>${esc(m.pitch)}${m.pitch.length>=210?'…':''}</p>${metadataHtml(m.metadata,m.players)}</article>`;
  const indexHtml=shell('Expansion designs',`<header class="studio-hero"><p class="ax-label">Designer studio</p><h1>Expansion designs</h1><p class="ax-lead">Optional modules, paper rulesets and directions for the game’s next chapters.</p><p>Only Ascension Trials is locked in. The rest are untested designs; no development sequence is settled.</p><p class="ax-note">Base-version labels describe the documents, not compatibility certification. “Not declared” means the source never states what it was written against.</p></header><section class="studio-governance" id="combination-governance"><h2>Rules for combining modules</h2>${governance}<p><strong>Deck compatibility:</strong> the index requires identical play at 2–4 players without Echo and 5–6 with Echo. Count-gated designs (The Schism at 2; The Attuned Rival at 1) record exceptions in that index.</p></section><section aria-labelledby="modules"><h2 id="modules">Modules <span class="ax-note">${modules.length} designs</span></h2><div class="studio-grid">${modules.map(card).join('\n')}</div></section><section class="studio-hero"><h2>Design context & supporting notes</h2><ul>${supporting.map(d=>`<li><a href="${esc(d.href)}">${esc(d.title)}</a></li>`).join('')}</ul><p><a href="lint.html">Read the vocabulary and metadata notes</a> · <a href="${esc(sourceUrl(index.source))}">Original expansion index</a></p></section>`);
  await mkdir(OUTPUT,{recursive:true});
  const outputs=new Map([['index.html',indexHtml]]);
  for(const doc of pages) {
    const {html,headings}=doc.rendered||rendered.get(doc.source);
    const sources=docs.filter(d=>d.sourceOnly && d.source.startsWith(path.posix.dirname(doc.source)+'/source/'));
    const toc=headings.map(h=>`<li data-depth="${Math.min(3,h.level)}"><a href="#${h.id}">${esc(h.title)}</a></li>`).join('');
    const touches=ruleTouches.filter(([, ,pattern])=>pattern.test(doc.body));
    const sourceList=sources.length?`<section id="source-material"><h2>Source material</h2><p>Historical inputs; linked read-only and excluded from generated module pages.</p><ul>${sources.map(d=>`<li><a href="${esc(sourceUrl(d.source))}">${esc(d.title)}</a></li>`).join('')}</ul></section>`:'';
    const players=doc.players||modules.find(m=>m.href===doc.href)?.players||'See document (supporting design notes)';
    outputs.set(doc.href,shell(doc.title,`<header class="studio-hero"><a href="index.html">All expansion designs</a><p>${statusHtml(doc.metadata.status)} <span class="ax-note">Source status: ${esc(doc.metadata.originalStatus)}</span></p><h1>${esc(doc.title)}</h1>${metadataHtml(doc.metadata,players)}<p class="ax-note">Current base rules: ${esc(current)}. This document has not been rewritten or certified against them. Dates are the latest recorded dates in the document/index.</p><p><a href="${esc(sourceUrl(doc.source))}">Open original Markdown</a></p></header><section class="studio-rule-strip" aria-label="Rules this module touches"><strong>Rules this module touches</strong><p class="ax-note">Suggested from vocabulary in this document; check the design for the exact change.</p><ul>${touches.map(([id,label])=>`<li><a href="../../rules/index.html#${id}">${esc(label)}</a></li>`).join('')}</ul></section><div class="studio-layout"><details class="studio-toc" open><summary>On this page</summary><nav aria-label="Table of contents"><ol>${toc}${sources.length?'<li><a href="#source-material">Source material</a></li>':''}</ol></nav></details><article class="studio-prose" aria-label="Expansion design document">${html}${sourceList}</article></div>`));
  }
  const lint=docs.flatMap(d=>lintVocabulary(d.source,d.text,terms));
  const mdSafe=s=>s.replace(/\|/g,'\\|').replace(/\n/g,' ');
  const lintMd=`# Expansion vocabulary lint\n\nDesigner notes · draft · not rules\n\nRetired terms are read from \`meta/canon.yml\`: ${terms.map(t=>'`'+t+'`').join(', ')}. Matches are case-sensitive whole terms, with original file line numbers. No source text is changed. A match is a review flag, including names of concepts and historical discussion; it is not an automatic correction.\n\nScanned ${docs.length} Markdown documents, including ${docs.filter(d=>d.sourceOnly).length} linked source-material files. Excluded \`old-expansion-thread.md\` entirely.\n\n${lint.length} matching source lines; ${lint.reduce((n,r)=>n+r.count,0)} occurrences.\n\n| File | Line | Term | Count | Context |\n|---|---:|---|---:|---|\n${lint.map(r=>`| ${mdSafe(r.source)} | ${r.line} | ${r.term} | ${r.count} | ${mdSafe(r.excerpt)} |`).join('\n')}\n\n## Base-rules version declarations\n\nCurrent canon is ${current}. ${pages.filter(d=>d.metadata.base==='Not declared').length} of ${pages.length} generated design documents do not declare a base-rules version. A mention of a version in a gate, rollback, or historical comparison is not treated as a declaration.\n\n## Link notes\n\nUnresolved or ambiguous wiki targets are displayed as dotted-underlined text instead of broken links. Historical brainstorm links are intentionally suppressed.\n\n${[...unresolved.values()].map(r=>'- '+r.source+': '+r.target).join('\n')||'None.'}\n\n## Metadata and governance\n\n- Player-count defaults use the expansion index’s compatibility rule and are labelled as such; source-specific count gates and legacy counts are retained.\n- Document dates use the latest recorded ISO date from front matter, document text, and the corresponding expansion-index section. They are not filesystem modification times.\n- The index’s parked front-matter status describes the index, not every module. Ascension Trials alone is locked in.\n- References to retired terms remain visible, especially the co-op concept name and historical comparisons. Review in context; do not blindly replace.\n`;
  outputs.set('LINT.md',lintMd);
  outputs.set('lint.html',shell('Vocabulary & metadata notes',`<header class="studio-hero"><a href="index.html">All expansion designs</a><h1>Vocabulary & metadata notes</h1><p>${lint.length} source lines flagged. The design documents have not been changed.</p><a href="LINT.md">Download the generated lint report</a></header><article class="studio-prose">${renderMarkdown(lintMd).html}</article>`));
  outputs.set('catalog.json',JSON.stringify({currentBase:current,modules,documents:pages.map(d=>({source:d.source,href:d.href,...d.metadata})),lint:{lines:lint.length,occurrences:lint.reduce((n,r)=>n+r.count,0)},unresolvedLinks:[...unresolved.values()]},null,2)+'\n');
  // Clean only files previously generated by this tool; preserve hand-written studio files.
  let previous=[];try{previous=JSON.parse(await readFile(path.join(OUTPUT,'.generated.json'),'utf8'));}catch{}
  for(const name of previous)if(typeof name==='string' && path.basename(name)===name && !outputs.has(name))await unlink(path.join(OUTPUT,name)).catch(e=>{if(e.code!=='ENOENT')throw e;});
  for(const [name,content] of outputs)await writeFile(path.join(OUTPUT,name),content,'utf8');
  await writeFile(path.join(OUTPUT,'.generated.json'),JSON.stringify([...outputs.keys()].sort(),null,2)+'\n');
  console.log(`Built ${pages.length} design pages, ${modules.length} module cards, index and lint in web-apps/v2/studio/expansions/.`);
  console.log(`Vocabulary: ${lint.length} source lines / ${lint.reduce((n,r)=>n+r.count,0)} occurrences. Base versions not declared: ${pages.filter(d=>d.metadata.base==='Not declared').length}.`);
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await build();
