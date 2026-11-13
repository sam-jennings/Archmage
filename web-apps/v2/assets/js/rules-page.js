// RULES — every rule in the board's order, rendered from the rules data. Laptop-first
// (sticky contents + search), fully usable on a phone, printable.
import './app.js';
import {
  h, t, clear, rich, plain, store, url, playUrl, callout, versionBadge, energyLegend, spellFull, turnSteps, scoreTable, ladderTable,
  deckTable, reminders, learningActions, whyNoCasting, variantNotes, scoreCalculator, effectRows, explainerMount,
  RULES, SITE, points, fill,
} from './ui.js';

const R = 'rules.';
const ul = (items, ordered) => h(ordered ? 'ol' : 'ul', null, items.map((x) => h('li', null, rich(x))));

// Components rendered from structured data. Chapter blocks name them with { t:'ref', name }.
const REFS = {
  deckTable,
  setupSteps: () => {
    const S = RULES.setup;
    const list = RULES.players.groups.map((g) => t(R + 'setupCountersItem', { counters: g.startingCounters, group: t('players.' + g.id) })).join(', ');
    return h('ol', null, [t('setupSteps.deal', S), t('setupSteps.array', S), t(R + 'setupCounters', { list }), t('setupSteps.start')].map((x) => h('li', null, x)));
  },
  energyLegend: () => energyLegend(),
  spell: (kind) => spellFull(kind),
  wildLines: () => ul(RULES.wildRule.lines),
  turnSteps: (mode) => turnSteps(mode, false),
  variantNotes: (section) => h('div', { class: 'ax-stack-sm' }, variantNotes(section)),
  castingLines: () => ul(RULES.casting.lines),
  castEffects: () => h('div', { class: 'ax-panel ax-stack' }, h('span', { class: 'ax-label' }, t(R + 'castHead')),
    RULES.spellOrder.filter((k) => RULES.spells[k].cast.kind !== 'always-active').map((k) => h('div', null, h('strong', null, RULES.spells[k].name), effectRows(k)))),
  learningActions: () => learningActions(true),
  capacityLines: () => ul(RULES.capacity.lines),
  startingCounters: () => h('p', null, t(R + 'setupCounters', { list: RULES.players.groups.map((g) => t(R + 'setupCountersItem', { counters: g.startingCounters, group: t('players.' + g.id) })).join(', ') })),
  ladder: () => ladderTable(),
  capacityTiming: () => ul(RULES.capacity.timing),
  droughtSteps: () => ul(RULES.drought.steps, true),
  whyNoCasting,
  scoreTable: () => scoreTable(),
  tiebreakers: () => h('p', null, h('strong', null, t('play.score.tiebreak') + ': '), RULES.tiebreakers.join(' → ')),
  scoringExample: () => {
    const rows = RULES.scoringExample;
    const total = rows.reduce((sum, r) => sum + points(r.kind, r.size), 0);
    return h('div', { class: 'ax-example ax-stack-sm' },
      h('ul', null, rows.map((r) => h('li', null, t('play.score.row', { size: r.size, spell: RULES.spells[r.kind].name }) + ': ' + t('pts', { n: points(r.kind, r.size) })))),
      h('p', null, h('strong', null, t(R + 'exampleTotal', { total: t('pts', { n: total }) }))));
  },
  calculator: () => h('div', { class: 'ax-panel ax-noprint ax-stack' }, h('p', { class: 'ax-note' }, t(R + 'calcHere'), ' ', h('a', { href: playUrl('score') }, t('atTheTable') + ' →')), scoreCalculator()),
  trialsLinks: () => h('ul', { class: 'ax-noprint' },
    h('li', null, h('a', { href: url(SITE.links.trialsCompanion) }, t(R + 'trialsCompanion'))),
    h('li', null, h('a', { href: url(SITE.links.trialsOldRules) }, t(R + 'trialsOld'))),
    h('li', { hidden: true, dataset: { mount: 'trials' } })),
  variants: () => h('div', { class: 'ax-stack' }, RULES.variants.map((v) => {
    const on = RULES.activeVariants.includes(v.key);
    const flip = () => {
      const next = on ? RULES.activeVariants.filter((k) => k !== v.key) : RULES.activeVariants.concat([v.key]);
      store.set('variants', next);
      location.href = location.pathname + '#variants';
      location.reload();
    };
    return h('div', { class: 'ax-panel ax-stack-sm', id: v.key },
      h('div', { class: 'ax-row ax-row-between' }, h('h3', { style: 'margin:0' }, v.name), h('span', { class: 'ax-label' }, t('status.' + v.status) + ' · ' + (on ? t(R + 'variantOn') : t(R + 'variantOff')))),
      h('p', null, rich(v.rule)),
      ul(v.notes),
      h('p', { class: 'ax-note' }, t(R + 'variantDecided', { date: v.decided })),
      h('button', { type: 'button', class: 'ax-btn ax-noprint', onclick: flip }, on ? t(R + 'variantSwitchOff') : t(R + 'variantSwitchOn')),
    );
  })),
  glossary: () => h('dl', { class: 'ax-glossary' }, RULES.glossary.flatMap((g) => [h('dt', null, g.term), h('dd', null, rich(g.def))])),
};

function block(b) {
  switch (b.t) {
    case 'p': return h('p', null, rich(b.x));
    case 'flavour': return h('p', { class: 'ax-flavour' }, rich(b.x));
    case 'ul': return ul(b.items);
    case 'ol': return ul(b.items, true);
    case 'callout': return callout(b.kind, b.x);
    case 'example': return h('p', { class: 'ax-example' }, rich(b.x));
    case 'h': return [h('h3', { id: b.id }, rich(b.x)), explainerMount(b.id)];
    case 'ref': {
      const [name, arg] = b.name.split(':');
      if (!REFS[name]) throw new Error('rules page: no renderer for ref "' + b.name + '"');
      return REFS[name](arg);
    }
    default: throw new Error('rules page: block type "' + b.t + '"');
  }
}

// ── Build ───────────────────────────────────────────────────────────────────────────
const main = document.getElementById('main');
const prose = h('article', { class: 'ax-prose' },
  h('header', null,
    h('h1', null, t(R + 'title')),
    h('p', null, t(R + 'intro')),
    h('div', { class: 'ax-row ax-noprint' }, versionBadge(false), h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', onclick: () => window.print() }, t(R + 'print'))),
    RULES.status === 'under-test' ? callout('under-test', RULES.statusNote) : null,
    RULES.activeVariants.length ? callout('variant', RULES.activeVariants.map((k) => RULES.variants.find((v) => v.key === k).name).join(', ') + ' — ' + t(R + 'variantOn').toLowerCase() + '.') : null,
    h('p', { class: 'ax-print-only ax-note' }, SITE.title + ' · ' + t(R + 'printed', { version: RULES.version })),
  ),
  RULES.chapters.map((c) => h('section', { id: c.id, 'aria-labelledby': 'h-' + c.id },
    h('h2', { id: 'h-' + c.id }, c.title, c.play ? h('a', { class: 'ax-noprint', href: playUrl(c.play) }, t('atTheTable') + ' →') : null),
    explainerMount(c.id),
    c.blocks.map(block),
  )),
);

// Contents + search
const search = h('input', { class: 'ax-search', type: 'search', placeholder: t(R + 'searchPlaceholder'), 'aria-label': t(R + 'search'), autocomplete: 'off' });
const contents = h('ol', null, RULES.chapters.map((c) => h('li', null, h('a', { href: '#' + c.id, dataset: { toc: c.id } }, c.title))));
const hits = h('ol', { class: 'ax-hits', hidden: true, 'aria-live': 'polite' });
const toc = h('nav', { class: 'ax-toc ax-noprint', 'aria-label': t(R + 'contents') });
const toggle = h('button', { type: 'button', class: 'ax-btn ax-toc-toggle', 'aria-expanded': 'false', onclick: () => setOpen(!toc.hasAttribute('data-open')) }, h('span', null, t(R + 'contents') + ' · ' + t(R + 'search')), h('span', { 'aria-hidden': 'true' }, '▾'));
function setOpen(open) {
  toc.toggleAttribute('data-open', open);
  toggle.setAttribute('aria-expanded', String(open));
}
toc.append(toggle, h('div', { class: 'ax-toc-inner' }, search, hits, contents));
contents.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });

clear(main).append(h('div', { class: 'ax-doc' }, toc, prose));

// Search index: every paragraph-sized piece of rule text, tagged with its nearest heading.
const index = [];
for (const section of prose.querySelectorAll('section')) {
  let heading = section.querySelector('h2');
  let label = section.querySelector('h2').firstChild.textContent;
  for (const node of section.querySelectorAll('h3, p, li, dd, .ax-step, tbody tr')) {
    if (node.tagName === 'H3') { heading = node; label = section.querySelector('h2').firstChild.textContent + ' · ' + node.textContent; }
    if (node.closest('.ax-noprint') && !node.closest('.ax-disc')) continue;
    if (node.tagName === 'LI' && node.querySelector('.ax-step')) continue;
    const text = (node.tagName === 'DD' ? node.previousElementSibling.textContent + ': ' : '') + node.textContent.replace(/\s+/g, ' ').trim();
    if (text.length > 2) index.push({ node, label, text, lower: text.toLowerCase(), anchor: heading.tagName === 'H2' ? section.id : heading.id });
  }
}
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function runSearch() {
  const q = search.value.trim().toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  contents.hidden = terms.length > 0;
  hits.hidden = terms.length === 0;
  clear(hits);
  if (!terms.length) return;
  const found = index.filter((entry) => terms.every((term) => entry.lower.includes(term)));
  if (!found.length) { hits.append(h('li', { class: 'ax-note' }, t(R + 'noHits', { q: search.value.trim() }))); return; }
  const mark = new RegExp('(' + terms.map(escapeRe).join('|') + ')', 'ig');
  hits.append(h('li', { class: 'ax-label' }, t(R + 'hits', { n: found.length })));
  for (const entry of found.slice(0, 14)) {
    const at = Math.max(0, entry.lower.indexOf(terms[0]) - 40);
    const snippet = (at > 0 ? '…' : '') + entry.text.slice(at, at + 130) + (entry.text.length > at + 130 ? '…' : '');
    const parts = snippet.split(mark).map((piece, i) => (i % 2 ? h('mark', null, piece) : piece));
    hits.append(h('li', null, h('a', { href: '#' + entry.anchor, onclick: (e) => {
      e.preventDefault();
      setOpen(false);
      history.replaceState(null, '', '#' + entry.anchor);
      const details = entry.node.closest('details');
      if (details) details.open = true;
      entry.node.scrollIntoView({ block: 'center' });
      entry.node.classList.remove('ax-flash');
      void entry.node.offsetWidth;
      entry.node.classList.add('ax-flash');
    } }, h('b', null, entry.label), h('span', null, parts))));
  }
}
search.addEventListener('input', runSearch);
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== search && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); setOpen(true); search.focus(); }
  if (e.key === 'Escape' && document.activeElement === search) { search.value = ''; runSearch(); }
});

// Contents: mark the section being read.
if ('IntersectionObserver' in window) {
  const links = new Map([...contents.querySelectorAll('a')].map((a) => [a.dataset.toc, a]));
  const seen = new Set();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.isIntersecting ? seen.add(entry.target.id) : seen.delete(entry.target.id);
    const current = RULES.chapters.map((c) => c.id).find((id) => seen.has(id));
    links.forEach((a, id) => (id === current ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  }, { rootMargin: '-64px 0px -55% 0px' });
  prose.querySelectorAll('section').forEach((s) => observer.observe(s));
}

// Content is rendered after load, so honour the deep link now.
if (location.hash) {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) { const d = target.closest('details') || (target.tagName === 'DETAILS' ? target : null); if (d) d.open = true; target.scrollIntoView(); }
}
window.addEventListener('beforeprint', () => prose.querySelectorAll('details').forEach((d) => { d.open = true; }));
