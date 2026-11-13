// The three small pages: landing (home), Learn, Studio. One module, switched on data-page.
import './app.js';
import {
  h, t, clear, put, rich, url, playUrl, rulesUrl, symbolUrl, energyLegend, spellTile, turnSteps, scoreTable,
  callout, explainerDisclosure, RULES, SITE,
} from './ui.js';

const main = document.getElementById('main');
const page = document.documentElement.dataset.page;

// ── Landing: three doors ────────────────────────────────────────────────────────────
function home() {
  const H = 'home.';
  const door = (key, href, primary) => h('a', { class: 'ax-door' + (primary ? ' ax-door-primary' : ''), href },
    h('span', { class: 'ax-label' }, t(H + 'doors.' + key + '.when')),
    h('h2', null, t(H + 'doors.' + key + '.title')),
    h('p', null, t(H + 'doors.' + key + '.text')),
    h('span', { class: 'ax-go' }, t(H + 'doors.' + key + '.go') + ' →'),
  );
  const symbols = RULES.energies.concat([RULES.wild]);
  return [
    h('div', { class: 'ax-hero' },
      h('p', { class: 'ax-label' }, t(H + 'eyebrow', RULES.players)),
      h('h1', null, SITE.title),
      h('p', { class: 'ax-lead' }, t(H + 'lead')),
      h('ul', { class: 'ax-strip', 'aria-label': t(H + 'energies') }, symbols.map((e) => h('li', null, h('img', { src: symbolUrl(e.key), alt: e.name, title: e.name, width: 28, height: 28 })))),
    ),
    h('div', { class: 'ax-doors' }, door('play', playUrl(), true), door('learn', url('learn/index.html')), door('rules', rulesUrl())),
    h('div', { class: 'ax-aside' },
      h('a', { class: 'ax-btn ax-btn-quiet', href: url(SITE.links.trialsCompanion) }, t(H + 'trials')),
      h('a', { class: 'ax-btn ax-btn-quiet', href: url(SITE.links.boardPdf) }, t(H + 'board')),
    ),
    h('div', { dataset: { mount: 'home' } }),
  ];
}

// ── Learn: the first-game path, then the explainer mount ────────────────────────────
function learn() {
  const L = 'learn.';
  const D = RULES.drought;
  const min = RULES.limits.minSpellSize;
  const steps = [
    { key: 'goal', body: () => [h('p', { class: 'ax-lead' }, rich(RULES.goal))] },
    { key: 'cards', body: () => [energyLegend()] },
    { key: 'spells', body: () => [h('div', null, RULES.spellOrder.map((k) => spellTile(k)))] },
    { key: 'turn', body: () => [turnSteps('normal', false)] },
    { key: 'drought', body: () => [h('p', null, h('strong', null, D.trigger)), h('ol', null, D.steps.map((s) => h('li', null, rich(s)))), turnSteps('drought', false), h('p', null, rich(D.end))] },
    { key: 'score', body: () => [scoreTable()] },
  ];
  const slot = h('div', { class: 'ax-stack', id: 'first-game' });
  let at = 0;
  function paint(focus) {
    const step = steps[at];
    const S = L + 'steps.' + step.key + '.';
    const before = t(S + 'before', { min });
    const after = t(S + 'after');
    const heading = h('h2', { tabindex: '-1' }, t(S + 'title'));
    put(clear(slot),
      h('ol', { class: 'ax-progress', 'aria-hidden': 'true' }, steps.map((_, i) => h('li', { dataset: { done: i <= at ? '' : null } }))),
      h('p', { class: 'ax-label' }, t(L + 'step', { n: at + 1, total: steps.length })),
      heading,
      before !== S + 'before' ? h('p', null, before) : null,
      step.body(),
      after !== S + 'after' ? h('p', null, after) : null,
      h('div', { class: 'ax-pathnav' },
        at > 0 ? h('button', { type: 'button', class: 'ax-btn', onclick: () => { at -= 1; paint(true); } }, '← ' + t(L + 'back')) : h('span'),
        at < steps.length - 1
          ? h('button', { type: 'button', class: 'ax-btn ax-btn-primary', onclick: () => { at += 1; paint(true); } }, t(L + 'next') + ' →')
          : h('a', { class: 'ax-btn ax-btn-primary', href: playUrl() }, t(L + 'done') + ' →'),
      ),
    );
    if (focus) { window.scrollTo(0, 0); heading.focus({ preventScroll: true }); }
  }
  paint(false);
  const explainers = SITE.mounts.explainers;
  return h('div', { class: 'ax-path' },
    h('header', { class: 'ax-stack-sm' }, h('h1', null, t(L + 'title')), h('p', null, t(L + 'intro'))),
    slot,
    // Prompt 2 mounts here: add entries to data/site.js → mounts.explainers.
    h('section', { id: 'explainers', class: 'ax-stack-sm', dataset: { mountList: 'explainers' } },
      h('h2', null, t(L + 'explainers')),
      explainers.length
        ? [h('p', { class: 'ax-note' }, t(L + 'explainersIntro')), h('div', null, explainers.map((e) => explainerDisclosure(e, true)))]
        : h('p', { class: 'ax-note' }, t(L + 'explainersEmpty')),
    ),
  );
}

// ── Studio: designer links, kept off every player path ──────────────────────────────
function studio() {
  const S = 'studio.';
  const item = (key, href) => h('li', null, h('a', { href: url(href) }, h('b', null, t(S + 'items.' + key + '.title')), h('span', null, t(S + 'items.' + key + '.text'))));
  const expansions = SITE.mounts.expansions;
  return h('div', { class: 'ax-path' },
    h('header', { class: 'ax-stack-sm' }, h('h1', null, t(S + 'title')), h('p', { class: 'ax-callout ax-callout-clarification' }, 'Designer notes · draft · not rules'), h('p', null, t(S + 'intro')), callout('clarification', t(S + 'checksText'), t(S + 'checks'))),
    h('ul', { class: 'ax-links' },
      item('optimizer', SITE.links.optimizer), item('pitch', SITE.links.pitchSheet), item('game', SITE.links.digitalGame), item('old', '../../index.html'),
    ),
    // Prompt 4 mounts here: add entries to data/site.js → mounts.expansions.
    h('section', { id: 'expansions', class: 'ax-stack-sm', dataset: { mountList: 'expansions' } },
      h('h2', null, t(S + 'expansions')),
      expansions.length
        ? h('ul', { class: 'ax-links' }, expansions.map((e) => h('li', null, h('a', { href: url(e.href) }, h('b', null, e.title + (e.status ? ' · ' + e.status : '')), h('span', null, e.blurb)))))
        : h('a', { class: 'ax-btn ax-btn-quiet', href: url('studio/expansions/index.html') }, 'Browse expansion designs'),
    ),
  );
}

put(clear(main), ({ home, learn, studio })[page]());

// A deep link to one explainer (learn/index.html#explainer-unlearn) opens it.
function openLinked() {
  const target = location.hash.startsWith('#explainer-') ? document.getElementById(location.hash.slice(1)) : null;
  if (target) { target.open = true; target.scrollIntoView(); }
}
openLinked();
window.addEventListener('hashchange', openLinked);
