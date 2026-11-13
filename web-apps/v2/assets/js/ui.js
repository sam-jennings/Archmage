// Shared UI: DOM helper, strings, formatting, storage, and the small component set
// (chip, legend, spell tile, steps, score table, ladder, callout, calculator…).
// Every number shown comes from data/current.js; every interface word from strings.

import { RULES, SITE, fill, points, castTier, groupById, deckSize, enchantmentMax } from '../../data/current.js';
import { STRINGS } from '../../data/strings.en.js';

// ── Paths ───────────────────────────────────────────────────────────────────────────
export const ROOT = document.documentElement.dataset.root || '';
export const url = (fromRoot) => ROOT + fromRoot;
export const symbolUrl = (key) => url(SITE.symbolDir + SITE.symbolFile(key));
export const playUrl = (tab) => url('play/index.html') + (tab ? '#' + tab : '');
export const rulesUrl = (id) => url('rules/index.html') + (id ? '#' + id : '');

// ── DOM ─────────────────────────────────────────────────────────────────────────────
export function h(tag, attrs, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'dataset') { for (const [k, v] of Object.entries(value)) if (v != null && v !== false) node.dataset[k] = v; }
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else if (key === 'hidden' || key === 'open' || key === 'disabled') node[key] = !!value;
    else node.setAttribute(key, value === true ? '' : String(value));
  }
  return put(node, children);
}
/** Append children, flattening arrays and skipping null/false (native append() does neither). */
export function put(node, ...children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}
export const clear = (node) => { node.replaceChildren(); return node; };

// ── Strings ─────────────────────────────────────────────────────────────────────────
const lookup = (key) => key.split('.').reduce((node, part) => (node == null ? node : node[part]), STRINGS);
/** t('play.check.title'), t('pts', { n: 3 }) — arrays are [one, other] chosen by vars.n. */
export function t(key, vars = {}) {
  let value = lookup(key);
  if (value == null) return key;
  if (Array.isArray(value)) value = vars.n === 1 ? value[0] : value[1];
  return String(value).replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}

/** Inline rule text → nodes. Supports **bold**, *italic*, [label](#id | play:tab | rules:id). */
export function rich(text) {
  const out = document.createDocumentFragment();
  const source = fill(text);
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  for (const m of source.matchAll(pattern)) {
    if (m.index > last) out.append(source.slice(last, m.index));
    if (m[1] != null) out.append(h('strong', null, m[1]));
    else if (m[2] != null) out.append(h('em', null, m[2]));
    else {
      const target = m[4];
      const href = target.startsWith('play:') ? playUrl(target.slice(5)) : target.startsWith('rules:') ? rulesUrl(target.slice(6)) : target;
      out.append(h('a', { href }, m[3]));
    }
    last = m.index + m[0].length;
  }
  if (last < source.length) out.append(source.slice(last));
  return out;
}
export const plain = (text) => fill(text).replace(/\*\*(.+?)\*\*|\*(.+?)\*/g, '$1$2').replace(/\[(.+?)\]\(.+?\)/g, '$1');

// ── Storage (never throws; private mode and file:// just forget) ────────────────────
export const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(SITE.storagePrefix + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(SITE.storagePrefix + key, JSON.stringify(value)); } catch { /* ignore */ }
  },
};

// ── Player count: one site-wide switch ──────────────────────────────────────────────
const groupListeners = new Set();
let currentGroup = groupById(store.get('players', RULES.players.groups[0].id)).id;
export const getGroup = () => currentGroup;
export function setGroup(id) {
  currentGroup = groupById(id).id;
  store.set('players', currentGroup);
  [...groupListeners].forEach((fn) => fn(currentGroup));
}
export const onGroup = (fn) => { groupListeners.add(fn); return () => groupListeners.delete(fn); };

export function segmented({ label, options, value, onChange }) {
  const group = h('div', { class: 'ax-seg', role: 'group', 'aria-label': label });
  const paint = (current) => {
    clear(group).append(...options.map((o) => h('button', { type: 'button', 'aria-pressed': String(o.value === current), onclick: () => { paint(o.value); onChange(o.value); } }, o.label)));
  };
  paint(value);
  return group;
}
export function playerSwitch() {
  return segmented({
    label: t('players.label'),
    options: RULES.players.groups.map((g) => ({ value: g.id, label: t('players.' + g.id) + ' ' + t('players.suffix') })),
    value: getGroup(),
    onChange: setGroup,
  });
}

// ── Energies, chips ─────────────────────────────────────────────────────────────────
export const energy = (key) => (key === 'wild' ? RULES.wild : RULES.energies.find((e) => e.key === key));
export const cardName = (card) => (card.e === 'wild' ? RULES.wild.name : energy(card.e).name + ' ' + card.v);

/** A component chip: symbol + value, coloured border, spoken name. `as` shows a wild's declaration. */
export function chip(card, opts = {}) {
  const name = cardName(card);
  const declaredAs = card.as && card.as.e ? cardName(card.as) : null;
  const label = opts.label || (declaredAs ? name + ' ' + t('play.check.wildAs', { card: declaredAs }) : name);
  const node = h(opts.onclick ? 'button' : 'span', {
    class: 'ax-chip', dataset: { e: card.e }, type: opts.onclick ? 'button' : null, onclick: opts.onclick,
    'aria-label': label, role: opts.onclick ? null : 'img',
  },
    h('img', { src: symbolUrl(card.e), alt: '', width: 22, height: 22 }),
    h('span', { class: 'ax-chip-name', 'aria-hidden': 'true' }, energy(card.e).name + ' '),
    h('span', { class: 'ax-chip-v', 'aria-hidden': 'true' }, card.e === 'wild' ? RULES.wild.glyph : String(card.v)),
    declaredAs && h('span', { class: 'ax-chip-as', 'aria-hidden': 'true' }, t('play.check.wildAs', { card: declaredAs })),
  );
  return node;
}
export const chips = (cards, opts) => h('ul', { class: 'ax-chips' }, cards.map((c) => h('li', null, chip(c, typeof opts === 'function' ? opts(c) : opts))));

export function energyLegend(groupId) {
  const deck = RULES.decks[groupById(groupId || RULES.players.groups.at(-1).id).deck];
  const all = !groupId;
  const list = RULES.energies.filter((e) => all || deck.energies.includes(e.key)).concat([RULES.wild]);
  return h('ul', { class: 'ax-legend' }, list.map((e) => h('li', null,
    h('img', { src: symbolUrl(e.key), alt: '', width: 34, height: 34 }),
    h('div', null, h('b', null, e.name), h('span', null, e.blurb), e.decks && h('em', null, t('energyOnly'))),
  )));
}

// ── Callout, badge ──────────────────────────────────────────────────────────────────
export const callout = (kind, text, label) => h('p', { class: 'ax-callout', dataset: { kind } }, h('b', null, label || t('status.' + kind)), h('span', null, rich(text)));
export function versionBadge(asLink = true) {
  const text = t('badge.' + RULES.status, { version: RULES.version });
  return h(asLink ? 'a' : 'span', { class: 'ax-badge', dataset: { status: RULES.status }, href: asLink ? rulesUrl('variants') : null, title: asLink ? t('badgeTitle') : null }, text);
}

// ── Effects ─────────────────────────────────────────────────────────────────────────
/** One-line effect for a spell of this type and size, e.g. for hand-checker results. */
export function effectLine(kind, size) {
  const tier = castTier(kind, size);
  if (tier.kind === 'always-active') return t('effect.active', { n: tier.counters });
  const cast = (text) => t('effect.castPrefix') + ' ' + text.charAt(0).toLowerCase() + text.slice(1);
  if (tier.kind === 'draw') return cast(t('effect.draw', { n: tier.draw }));
  if (tier.kind === 'trade') return cast(t('effect.trade', tier));
  const [draw, trade] = tier.parts;
  return cast(t('effect.both', { draw: draw.draw, discard: trade.discard, take: trade.take }));
}
const sizeLabel = (tier, maxSize) => (tier.min === tier.max ? t('effect.sizes.exact', tier) : tier.max >= maxSize ? t('effect.sizes.open', tier) : t('effect.sizes.range', tier)) + ' ' + t('effect.sizeUnit');

/** The effect-by-size rows for one spell type, as a <dl>. */
export function effectRows(kind, groupId) {
  const spell = RULES.spells[kind];
  const dl = h('dl', { class: 'ax-effect' });
  const row = (label, text, off) => dl.append(h('dt', null, label), h('dd', { class: off ? 'ax-off' : null }, text));
  if (spell.cast.kind === 'always-active') {
    const max = groupId ? enchantmentMax(groupById(groupId).deck) : Infinity;
    for (const rung of RULES.enchantmentLadder) {
      const off = rung.size > max;
      row(t('effect.sizes.exact', { min: rung.size }) + ' ' + t('effect.sizeUnit'), off ? t('energyOnly') : '+' + t('counters', { n: rung.counters }), off);
    }
  } else if (spell.cast.kind === 'both') {
    row(t('effect.whenCast'), t('effect.bothLine'));
  } else {
    for (const tier of spell.cast.tiers) {
      row(sizeLabel(tier, spell.maxSize), spell.cast.kind === 'draw' ? t('effect.draw', { n: tier.draw }) : t('effect.trade', tier));
    }
  }
  return dl;
}

// Decorative pattern marks (aria-hidden): same energy · values in a row · same value · both.
const patternMark = { conjuration: '◆ ◆ ◆', transfiguration: '4·5·6', enchantment: '7·7·7', perfect: '◆4·5·6' };

/** Compact spell tile for Play (a disclosure). */
export function spellTile(kind, groupId) {
  const spell = RULES.spells[kind];
  const column = RULES.scoreTable[kind];
  const max = kind === 'enchantment' && groupId ? enchantmentMax(groupById(groupId).deck) : spell.maxSize;
  return h('details', { class: 'ax-disc', id: 'spell-' + kind },
    h('summary', null,
      h('span', { class: 'ax-spell-pattern', 'aria-hidden': 'true' }, patternMark[kind]),
      h('span', { class: 'ax-disc-head' }, h('span', { class: 'ax-disc-title' }, spell.name), h('span', { class: 'ax-disc-sub' }, plain(spell.requirement))),
    ),
    h('div', { class: 'ax-disc-body' },
      h('p', { class: 'ax-note' }, rich(spell.note)),
      h('div', null, h('span', { class: 'ax-label' }, t('play.spells.example')), chips(spell.example), h('p', { class: 'ax-note' }, rich(spell.exampleNote))),
      h('div', null, h('span', { class: 'ax-label' }, spell.cast.kind === 'always-active' ? t('effect.alwaysActive') : t('effect.whenCast')), effectRows(kind, groupId)),
      spell.castNotes.length ? h('ul', { class: 'ax-note' }, spell.castNotes.map((n) => h('li', null, rich(n)))) : null,
      h('p', { class: 'ax-note' }, t('play.spells.points', { min: column[0], minSize: spell.minSize, max: column[max - spell.minSize], maxSize: max })),
      h('a', { class: 'ax-more', href: rulesUrl('spells') }, t('fullRule') + ' →'),
    ),
  );
}

/** Full spell entry for the Rules page. */
export function spellFull(kind) {
  const spell = RULES.spells[kind];
  return h('div', { class: 'ax-spell-full ax-stack', id: kind },
    h('div', null, h('h3', null, spell.name), h('span', { class: 'ax-pattern-word' }, spell.pattern)),
    h('p', { class: 'ax-flavour' }, rich(spell.flavour)),
    h('p', null, h('strong', null, plain(spell.requirement)), ' ', rich(spell.note)),
    h('div', { class: 'ax-stack-sm' }, chips(spell.example), h('p', { class: 'ax-note' }, rich(spell.exampleNote))),
    h('div', null, h('span', { class: 'ax-label' }, spell.cast.kind === 'always-active' ? t('effect.alwaysActive') : t('effect.whenCast')), effectRows(kind)),
    spell.castNotes.length ? h('ul', null, spell.castNotes.map((n) => h('li', null, rich(n)))) : null,
  );
}

// ── Turn steps ──────────────────────────────────────────────────────────────────────
/** Turn steps. With `track`, steps are buttons and the tapped one stays marked. */
export function turnSteps(mode, track) {
  const steps = RULES.turn[mode];
  const list = h('ol', { class: 'ax-steps' });
  const key = 'step:' + mode;
  let here = track ? store.get(key, null) : null;
  const paint = () => {
    clear(list).append(...steps.map((step, i) => {
      const inner = [
        h('span', { class: 'ax-step-n', 'aria-hidden': 'true' }, step.absent ? '–' : step.n == null ? '↩' : String(step.n)),
        h('span', null,
          h('span', { class: 'ax-step-here' }, t('play.turn.here')),
          h('span', { class: 'ax-step-name' }, step.name),
          h('span', { class: 'ax-step-text' }, rich(step.short)),
        ),
      ];
      const attrs = { class: 'ax-step', dataset: { absent: step.absent ? '' : null, minor: step.n == null && !step.absent ? '' : null }, 'aria-current': here === i ? 'step' : null };
      const node = track && !step.absent
        ? h('button', { ...attrs, type: 'button', onclick: () => { here = here === i ? null : i; store.set(key, here); paint(); } }, inner)
        : h('div', attrs, inner);
      return h('li', null, node);
    }));
  };
  paint();
  return list;
}

// ── Tables ──────────────────────────────────────────────────────────────────────────
export function scoreTable(groupId, hit) {
  const T = RULES.scoreTable;
  const maxEnch = groupId ? enchantmentMax(groupById(groupId).deck) : Infinity;
  const head = h('tr', null, h('th', { scope: 'col' }, t('play.score.size')), T.columns.map((k) => h('th', { scope: 'col' }, h('abbr', { title: RULES.spells[k].name, style: 'text-decoration:none' }, RULES.spells[k].short))));
  const rows = T.sizes.map((size) => h('tr', null, h('th', { scope: 'row' }, size), T.columns.map((k) => {
    const value = points(k, size);
    if (value == null) return h('td', { class: 'ax-na' }, '—');
    if (k === 'enchantment' && size > maxEnch) return h('td', { class: 'ax-na', title: t('energyOnly') }, value + '*');
    return h('td', { dataset: { hit: hit && hit.kind === k && hit.size === size ? '' : null } }, value);
  })));
  const wrap = h('div', { class: 'ax-table-wrap' }, h('table', { class: 'ax-table' }, h('caption', { class: 'ax-vh' }, t('play.score.title')), h('thead', null, head), h('tbody', null, rows)));
  const top = RULES.enchantmentLadder.at(-1);
  const footnote = Number.isFinite(maxEnch) && top.size > maxEnch ? h('p', { class: 'ax-note' }, '* ' + t('play.spells.notAtThisCount', { size: top.size })) : null;
  return h('div', { class: 'ax-stack-sm' }, wrap, footnote);
}

export function ladderTable(groupId) {
  const max = groupId ? enchantmentMax(groupById(groupId).deck) : Infinity;
  const L = 'play.turn.ladderHead.';
  return h('div', { class: 'ax-table-wrap' }, h('table', { class: 'ax-table' },
    h('thead', null, h('tr', null, h('th', { scope: 'col' }, t(L + 'size')), h('th', { scope: 'col' }, t(L + 'counters')), h('th', { scope: 'col' }, t(L + 'pts')))),
    h('tbody', null, RULES.enchantmentLadder.map((rung) => {
      const off = rung.size > max;
      return h('tr', null,
        h('th', { scope: 'row' }, rung.size),
        off ? h('td', { class: 'ax-na', colspan: 2 }, t('energyOnly')) : [h('td', null, '+' + rung.counters), h('td', null, points('enchantment', rung.size))],
      );
    })),
  ));
}

export function deckTable() {
  const D = 'deckTable.';
  const names = (deck) => deck.energies.map((k) => energy(k).name).join(', ');
  return h('div', { class: 'ax-table-wrap' }, h('table', { class: 'ax-table ax-table-left' },
    h('thead', null, h('tr', null, ['players', 'energies', 'wilds', 'total', 'counters'].map((k) => h('th', { scope: 'col' }, t(D + k))))),
    h('tbody', null, RULES.players.groups.map((g) => {
      const deck = RULES.decks[g.deck];
      return h('tr', null,
        h('th', { scope: 'row' }, t('players.' + g.id)),
        h('td', null, names(deck) + ' · ' + t(D + 'values', { min: deck.minValue, max: deck.maxValue })),
        h('td', null, deck.wilds), h('td', null, t('cards', { n: deckSize(deck) })), h('td', null, g.startingCounters),
      );
    })),
  ));
}

export function setupSteps(groupId) {
  const g = groupById(groupId);
  const deck = RULES.decks[g.deck];
  const S = RULES.setup;
  const lines = [
    t('setupSteps.deck', { total: deckSize(deck), energies: deck.energies.map((k) => energy(k).name).join(', '), min: deck.minValue, max: deck.maxValue, wilds: deck.wilds }),
    t('setupSteps.deal', S), t('setupSteps.array', S), t('setupSteps.opening', S),
    t('setupSteps.counters', { n: g.startingCounters }), t('setupSteps.start'),
  ];
  return h('ol', null, lines.map((line) => h('li', null, line)));
}

export const reminders = () => h('ul', { class: 'ax-reminders' }, RULES.keyReminders.map((r) => h('li', null, rich(r))));

export function learningActions(open) {
  return h('div', null, RULES.learning.map((a) => h('details', { class: 'ax-disc', id: a.key, open },
    h('summary', null,
      h('span', { class: 'ax-disc-head' }, h('span', { class: 'ax-disc-title' }, a.name), h('span', { class: 'ax-disc-sub' }, plain(a.short))),
      h('span', { class: 'ax-disc-cost' }, a.cost.per ? t('play.turn.costPer', { n: a.cost.counters, per: a.cost.perShort || a.cost.per }) : t('play.turn.cost', { n: a.cost.counters })),
    ),
    h('div', { class: 'ax-disc-body' }, h('ul', null, a.details.map((d) => h('li', null, rich(d)))), explainerMount(a.key)),
  )));
}

export const whyNoCasting = () => h('ul', { class: 'ax-works' }, RULES.drought.whyNoCasting.map((w) => h('li', { dataset: { works: String(w.works) } }, h('b', null, w.works ? t('play.turn.works') : t('play.turn.stops')), h('span', null, rich(w.text)))));

export function variantNotes(section) {
  const notes = (RULES.variantNotes || {})[section] || [];
  return notes.map((n) => callout('variant', n.text, t('status.variant') + ' · ' + n.variant));
}

/** Explainers registered for a slot on this page. A slot is a section id, optionally
 *  scoped to one page: 'unlearn', 'play:normal-turn', 'rules:recall'. */
function explainersFor(slot) {
  const page = document.documentElement.dataset.page;
  return SITE.mounts.explainers.filter((e) => (e.slots || []).some((s) => s === slot || s === page + ':' + slot));
}

/** A "Show me" disclosure that loads and mounts one explainer the first time it is opened. */
export function explainerDisclosure(entry, anchor) {
  if (!document.querySelector('link[data-explainers]')) {
    document.head.append(h('link', { rel: 'stylesheet', href: url('learn/explainers/explainers.css'), dataset: { explainers: '' } }));
  }
  const body = h('div', { class: 'ax-disc-body' });
  let loaded = false;
  const details = h('details', { class: 'ax-disc ax-showme ax-noprint', id: anchor ? 'explainer-' + entry.id : null, dataset: { explainer: entry.id } },
    h('summary', null, h('span', { class: 'ax-disc-head' },
      h('span', { class: 'ax-disc-title' }, t('showMe') + ' · ' + entry.title),
      h('span', { class: 'ax-disc-sub' }, entry.blurb))),
    body);
  details.addEventListener('toggle', () => {
    if (!details.open || loaded) return;
    loaded = true;
    put(clear(body), h('p', { class: 'ax-note' }, t('showMeLoading')));
    import('../../learn/explainers/engine.js')
      .then((engine) => engine.mountExplainer(body, entry.id))
      .catch(() => { loaded = false; put(clear(body), h('p', { class: 'ax-note' }, t('showMeFailed'))); });
  });
  return details;
}

/** Mount point for interactive explainers. Empty and invisible until data/site.js →
 *  mounts.explainers has an entry whose `slots` include this id. */
export function explainerMount(slot) {
  return h('div', { dataset: { mount: 'explainer:' + slot } }, explainersFor(slot).map((e) => explainerDisclosure(e)));
}

// ── Score calculator (shared by Play › Score and Rules › Recognition Points) ────────
export function scoreCalculator(onPick) {
  const S = 'play.score.';
  let rows = store.get('calc', []);
  let kind = RULES.spellOrder[0];
  let size = RULES.spells[kind].minSize;
  const root = h('div', { class: 'ax-stack' });
  const maxFor = (k) => (k === 'enchantment' ? enchantmentMax(groupById(getGroup()).deck) : RULES.spells[k].maxSize);
  const clamp = () => { size = Math.max(RULES.spells[kind].minSize, Math.min(size, maxFor(kind))); };
  const save = () => store.set('calc', rows);
  function paint() {
    clamp();
    if (onPick) onPick({ kind, size });
    const name = (r) => t(S + 'row', { size: r.size, spell: RULES.spells[r.kind].name });
    const total = rows.reduce((sum, r) => sum + (points(r.kind, r.size) || 0), 0);
    put(clear(root),
      h('p', { class: 'ax-note' }, t(S + 'calcHint')),
      h('div', { class: 'ax-calc-kinds', role: 'group', 'aria-label': t(S + 'kind') }, RULES.spellOrder.map((k) => h('button', { type: 'button', class: 'ax-btn', 'aria-pressed': String(k === kind), onclick: () => { kind = k; paint(); } }, RULES.spells[k].name))),
      h('div', { class: 'ax-row ax-row-between' },
        h('div', { class: 'ax-row' },
          h('span', { class: 'ax-label', id: 'calc-size' }, t(S + 'sizeLabel')),
          h('div', { class: 'ax-stepper', role: 'group', 'aria-labelledby': 'calc-size' },
            h('button', { type: 'button', 'aria-label': t(S + 'smaller'), disabled: size <= RULES.spells[kind].minSize, onclick: () => { size -= 1; paint(); } }, '−'),
            h('output', { 'aria-live': 'polite' }, size),
            h('button', { type: 'button', 'aria-label': t(S + 'larger'), disabled: size >= maxFor(kind), onclick: () => { size += 1; paint(); } }, '+'),
          ),
        ),
        h('button', { type: 'button', class: 'ax-btn ax-btn-primary', onclick: () => { rows.push({ kind, size }); save(); paint(); } }, t(S + 'add') + ' · ' + t('pts', { n: points(kind, size) })),
      ),
      rows.length
        ? h('ul', { class: 'ax-calc-list' }, rows.map((r, i) => h('li', null,
            h('span', null, name(r)), h('span', { class: 'ax-result-pts' }, t('pts', { n: points(r.kind, r.size) || 0 })),
            h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', 'aria-label': t(S + 'remove', { spell: name(r) }), onclick: () => { rows.splice(i, 1); save(); paint(); } }, '✕'),
          )))
        : h('p', { class: 'ax-note' }, t(S + 'empty')),
      h('div', { class: 'ax-total' },
        h('span', { class: 'ax-label' }, t(S + 'total')),
        h('output', { 'aria-live': 'polite' }, t('pts', { n: total })),
      ),
      rows.length ? h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', onclick: () => { rows = []; save(); paint(); } }, t(S + 'clear')) : null,
    );
  }
  paint();
  const off = onGroup(() => (root.isConnected ? paint() : off()));
  return root;
}

export { RULES, SITE, STRINGS, fill, points, castTier, groupById, deckSize, enchantmentMax };
