// EXPLAINER ENGINE — draws any explainer state machine. Browser-only.
//
// An explainer module (see turn-counters.js) is pure: init(group) → state,
// actions(state) → choices, apply(state, id) → next state, facts(state) → label/value
// pairs, stage(state, kit, act) → what to draw, optional scrub(state). This file owns the
// DOM: the stage, one caption per step (the text equivalent, announced politely), honest
// "rulebook unclear" notes, the choices, Back and Start again.
//
//   import('…/learn/explainers/engine.js').then((m) => m.mountExplainer(element, 'unlearn'))
//
// To add an explainer: write the module, add it to LOADERS, register it in
// data/site.js → mounts.explainers, add both files to sw.js, write its test.

import { h, put, clear, chip, callout, turnSteps, whyNoCasting, getGroup, onGroup, t } from '../../assets/js/ui.js';
import { tx } from './strings.en.js';

const LOADERS = {
  'turn-counters': () => import('./turn-counters.js'),
  'capacity-timing': () => import('./capacity-timing.js'),
  unlearn: () => import('./unlearn.js'),
  reshape: () => import('./reshape.js'),
  'wild-declaration': () => import('./wild-declaration.js'),
  drought: () => import('./drought.js'),
};
export const explainerIds = Object.keys(LOADERS);

// The stylesheet is normally linked by ui.js as soon as a page has an explainer to offer.
let css;
function ensureCss() {
  if (!css) {
    css = new Promise((resolve) => {
      const existing = document.querySelector('link[data-explainers]');
      if (existing) return existing.sheet ? resolve() : existing.addEventListener('load', resolve);
      const link = h('link', { rel: 'stylesheet', href: new URL('./explainers.css', import.meta.url).href, dataset: { explainers: '' } });
      link.onload = link.onerror = resolve;
      document.head.append(link);
    });
  }
  return css;
}

// ── Drawing kit handed to each explainer's stage() ──────────────────────────────────
const token = (kind) => h('span', { class: 'xp-token', dataset: { kind } });
const kit = {
  label: (text) => h('p', { class: 'ax-label' }, text),
  /** Counters: `filled` in hand, the rest of `total` in use, `ghost` arriving later. */
  pool(label, filled, total, ghost = 0, ghostLabel = '') {
    const text = label + ': ' + filled + ' / ' + total + (ghost ? ' · ' + ghostLabel + ': +' + ghost : '');
    return h('div', { class: 'xp-pool', role: 'img', 'aria-label': text },
      h('span', { class: 'ax-label', 'aria-hidden': 'true' }, label),
      h('span', { class: 'xp-tokens', 'aria-hidden': 'true' },
        Array.from({ length: filled }, () => token('full')),
        Array.from({ length: Math.max(0, total - filled) }, () => token('used')),
        Array.from({ length: ghost }, () => token('ghost'))),
      ghost ? h('span', { class: 'ax-note', 'aria-hidden': 'true' }, ghostLabel + ' +' + ghost) : null);
  },
  /** A spell in the Spellbook. Tappable as a whole (onTap) or chip by chip (onChip). */
  spell({ title, cards, counter, onTap, tapLabel, picked, onChip, badge }) {
    const row = h('span', { class: 'xp-chips' }, cards.map((card, i) => {
      if (!onChip) return chip(card);
      const node = chip(card, { onclick: () => onChip(i) });
      node.setAttribute('aria-pressed', String(picked.includes(i)));
      node.dataset.key = 'chip:' + i;
      return node;
    }));
    const head = h('span', { class: 'xp-spell-head' },
      h('span', { class: 'xp-spell-name' }, title),
      badge ? h('span', { class: 'xp-badge' }, badge) : null,
      counter ? h('span', { class: 'xp-on' }, token('full')) : null);
    return onTap
      ? h('button', { type: 'button', class: 'xp-spell', dataset: { key: 'spell:' + title, cast: counter ? '' : null }, 'aria-label': tapLabel + (counter ? ' ✓' : ''), onclick: onTap }, head, row)
      : h('div', { class: 'xp-spell' }, head, row);
  },
  /** Components that are not (or not yet) a spell. */
  loose: (cards, badLabel) => h('div', { class: 'xp-spell xp-loose', dataset: { bad: badLabel ? '' : null } },
    badLabel ? h('span', { class: 'xp-spell-head' }, h('span', { class: 'xp-bad' }, '✕ ' + badLabel)) : null,
    h('span', { class: 'xp-chips' }, cards.map((c) => chip(c)))),
  /** Where you are in the turn. */
  track: (names, current) => h('ol', { class: 'xp-track' }, names.map((name, i) => h('li', { 'aria-current': i === current ? 'step' : null }, name))),
  /** Draw piles with their sizes. count === null means the pile no longer exists. */
  piles: (list, goneLabel) => h('div', { class: 'xp-piles' }, list.map((p) => h('div', { class: 'xp-pile', dataset: { tone: p.tone || null, gone: p.count == null ? '' : null } },
    h('span', { class: 'xp-pile-n' }, p.count == null ? '—' : p.count),
    h('span', { class: 'xp-pile-name' }, p.name),
    p.count == null ? h('span', { class: 'ax-label' }, goneLabel) : null))),
  steps: () => turnSteps('drought', false),
  works: () => whyNoCasting(),
};

/** Mount explainer `id` into `container`. Returns once it is drawn. */
export async function mountExplainer(container, id) {
  if (!LOADERS[id]) throw new Error('unknown explainer: ' + id);
  const [model] = await Promise.all([LOADERS[id](), ensureCss()]);
  let history = [model.init(getGroup())];

  const stage = h('div', { class: 'xp-stage' });
  const say = h('p', { class: 'xp-say', 'aria-live': 'polite' });
  const notes = h('div', { class: 'ax-stack-sm' });
  const facts = h('dl', { class: 'xp-facts' });
  const modes = h('div', { class: 'xp-actions xp-modes' });
  const choices = h('div', { class: 'xp-actions' });
  const range = h('input', { type: 'range', class: 'xp-scrub', min: 0, step: 1, 'aria-label': tx('frame.scrub') });
  const scrubLabel = h('span', { class: 'ax-label' });
  const scrubRow = h('div', { class: 'xp-scrubrow', hidden: true }, scrubLabel, range);
  const back = h('button', { type: 'button', class: 'ax-btn ax-btn-quiet' }, '← ' + tx('frame.back'));
  const reset = h('button', { type: 'button', class: 'ax-btn ax-btn-quiet' }, '↺ ' + tx('frame.reset'));
  const who = h('p', { class: 'ax-note' });
  const root = h('div', { class: 'xp', role: 'group', 'aria-label': tx(id + '.title') },
    modes, stage, say, notes, facts, scrubRow, choices, h('div', { class: 'xp-nav' }, back, reset), who);

  const act = (actionId, focusKey) => {
    const current = history.at(-1);
    const next = model.apply(current, actionId);
    if (next !== current) history.push(next);
    paint(focusKey === false ? null : focusKey || 'act:' + actionId); // false: the stage handler below restores focus
  };

  function paint(focusKey) {
    const s = history.at(-1);
    put(clear(stage), model.stage(s, kit, (actionId) => act(actionId, false)));
    say.textContent = s.say;
    put(clear(notes), (s.notes || []).map((note) => callout(note.kind === 'implied' ? 'clarification' : 'variant', note.text, tx('frame.' + note.kind))));
    put(clear(facts), model.facts(s).filter(Boolean).map((f) => h('div', null, h('dt', null, f.label), h('dd', null, f.value))));

    // Choices. `stage: true` actions are tapped on the stage itself, so they get no button.
    // `group` gathers pressed-state pickers; the 'mode' group (scene / example) sits on top.
    const groups = new Map();
    for (const a of model.actions(s)) {
      if (a.stage) continue;
      const key = a.group || 'main';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(a);
    }
    const row = ([key, list]) => h('div', { class: 'xp-row', dataset: { group: key } }, list.map((a) => h('button', {
      type: 'button',
      class: 'ax-btn' + (a.primary ? ' ax-btn-primary' : ''),
      dataset: { key: 'act:' + a.id, blocked: a.blocked ? '' : null },
      'aria-pressed': a.pressed == null ? null : String(a.pressed),
      disabled: a.disabled,
      onclick: () => act(a.id),
    }, a.label)));
    put(clear(modes), [...groups].filter(([key]) => key === 'mode').map(row));
    put(clear(choices), [...groups].filter(([key]) => key !== 'mode').map(row));

    const scrub = model.scrub ? model.scrub(s) : null;
    scrubRow.hidden = !scrub;
    if (scrub) {
      range.max = scrub.max;
      if (Number(range.value) !== scrub.value) range.value = scrub.value;
      range.setAttribute('aria-valuetext', scrub.label);
      scrubLabel.textContent = scrub.label;
    }
    back.disabled = history.length < 2;
    who.textContent = tx('frame.players', { group: t('players.' + s.group) });

    if (focusKey) {
      const target = root.querySelector('[data-key="' + focusKey + '"]:not([disabled])') || root.querySelector('.xp-actions:not(.xp-modes) button:not([disabled])') || reset;
      target.focus({ preventScroll: true });
    }
  }

  range.addEventListener('input', () => {
    const current = history.at(-1);
    const next = model.apply(current, 'goto:' + range.value);
    if (next !== current) history.push(next);
    paint(null);
  });
  back.addEventListener('click', () => { if (history.length > 1) history.pop(); paint(null); (back.disabled ? reset : back).focus({ preventScroll: true }); });
  reset.addEventListener('click', () => { history = [model.init(getGroup())]; paint(null); });
  // Tapping a chip or a spell on the stage keeps focus on that thing after the redraw.
  stage.addEventListener('click', (event) => {
    const key = event.target.closest('[data-key]')?.dataset.key;
    if (key) queueMicrotask(() => root.querySelector('[data-key="' + CSS.escape(key) + '"]')?.focus({ preventScroll: true }));
  });
  const off = onGroup(() => {
    if (!root.isConnected) return off();
    history = [model.init(getGroup())];
    paint(null);
  });

  paint(null);
  put(clear(container), root);
  return root;
}
