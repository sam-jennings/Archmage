// ASCENSION TRIALS COMPANION — screens. Each function takes the controller's context and
// returns DOM. Nothing here knows a rule: legality, power and outcomes come from the
// engine, wording from describe.js + strings, numbers from the chosen package.
import { h, chips, callout, segmented, symbolUrl, energy, cardName, points, RULES } from '../assets/js/ui.js';
import { RULESETS, findRuleset, optionValues, rulesetStamp } from './rulesets/index.js';
import { requirementText, reasonText, tiebreakText, entryParts } from './describe.js';
import { standardSpellPower, enchantmentPower } from './engine/power.js';
import { isActive, rewardFor, domainAllowed, findUnspentUse, entryIsLegal } from './engine/legality.js';
import { trialOutlook } from './engine/advise.js';
import { allocationOf, remaining, resolveSession, allLocked, waitingFor, MAX_PLAYERS } from './state.js';
import { readCards, makeSpell, checkTable, checkQuickSpell, usedCards, KIND_OF_TYPE } from './book.js';

const WILD = 'wild';
const list = (items) => (items.length > 1 ? items.slice(0, -1).join(', ') + ' and ' + items.at(-1) : items[0] || '');
const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);
const activeTrials = (c) => c.config.trials.filter((tr) => isActive(tr, c.n));
const errorNote = (c, group) => (c.ui.error ? h('p', { class: 'tr-error', role: 'alert' }, (() => { const k = group + '.' + c.ui.error; const text = c.T(k, { n: c.n, counts: countsText(c) }); return text === k ? c.T('net.errors.network') : text; })()) : null);
const countsText = (c) => (c.counts.length ? c.counts[0] + '–' + c.counts.at(-1) : '');
const statusBadge = (c, rs) => h('span', { class: 'ax-badge', dataset: { status: rs.status } }, c.T('status.' + rs.status));
const ptsText = (c, n) => c.T('pts', { n });

function stepper(c, { value, max, label, fk, onChange }) {
  const clamp = (v) => Math.max(0, Math.min(max, Number.isFinite(v) ? Math.round(v) : 0));
  return h('div', { class: 'ax-stepper tr-stepper', role: 'group', 'aria-label': label },
    h('button', { type: 'button', 'aria-label': c.T('alloc.less', { what: label }), disabled: value <= 0, dataset: { fk: fk + '-' }, onclick: () => onChange(value - 1) }, '−'),
    h('input', { type: 'number', inputmode: 'numeric', min: 0, max, value, 'aria-label': label, dataset: { fk: fk + '=' }, onchange: (e) => onChange(clamp(Number(e.target.value))) }),
    h('button', { type: 'button', 'aria-label': c.T('alloc.more', { what: label }), disabled: value >= max, dataset: { fk: fk + '+' }, onclick: () => onChange(value + 1) }, '+'),
  );
}

// ── Rules package: the host's setting, and what the package says ────────────────────
function packPanel(c, opts = {}) {
  if (!opts.compact || !c.ruleset) return packBody(c, opts);
  return h('details', { class: 'ax-disc tr-packline' },
    h('summary', null, h('span', { class: 'ax-disc-head' }, h('span', { class: 'ax-disc-sub' }, c.T('pack.heading')), h('span', { class: 'ax-disc-title' }, rulesetStamp(c.ruleset)))),
    h('div', { class: 'ax-disc-body' }, packBody(c, opts)));
}
function packBody(c, { open = false, warn = false } = {}) {
  const { T, ruleset } = c;
  const canEdit = c.isHost;
  const select = h('select', { class: 'tr-select', 'aria-label': T('pack.heading'), disabled: !canEdit, dataset: { fk: 'pack' }, onchange: (e) => c.choosePack(e.target.value, {}) },
    ruleset ? null : h('option', { value: '', selected: true, disabled: true }, T('pack.choose')),
    RULESETS.map((rs) => h('option', { value: rs.id, selected: ruleset && rs.id === ruleset.id ? true : null }, rs.label)),
  );
  const body = [
    h('div', { class: 'ax-row ax-row-between' }, h('span', { class: 'ax-label' }, T('pack.heading') + ' · ' + T('pack.host')), ruleset && statusBadge(c, ruleset)),
    select,
    !canEdit && h('p', { class: 'ax-note' }, T('net.hostOnly')),
    warn && canEdit && h('p', { class: 'ax-note' }, T('pack.switchWarn')),
  ];
  if (!ruleset) body.push(h('p', { class: 'ax-note' }, T('pack.undecided')));
  else {
    const values = optionValues(findRuleset(ruleset.id), c.session.options);
    body.push(
      h('p', null, ruleset.summary),
      h('p', { class: 'ax-note' }, T('pack.players', { counts: countsText(c) })),
      (ruleset.options || []).length ? h('div', { class: 'ax-stack-sm' }, ruleset.options.map((o) => h('label', { class: 'tr-check' },
        h('input', { type: 'checkbox', checked: values[o.id] ? true : null, disabled: !canEdit, dataset: { fk: 'opt-' + o.id }, onchange: (e) => c.choosePack(ruleset.id, { ...values, [o.id]: e.target.checked }) }),
        h('span', null, h('b', null, o.label), h('span', { class: 'ax-note' }, ' ' + o.note))))) : null,
      (ruleset.caveats || []).length ? h('ul', { class: 'ax-note tr-caveats' }, ruleset.caveats.map((x) => h('li', null, x))) : null,
      h('details', { class: 'ax-disc', open: open ? true : null }, h('summary', null, h('span', { class: 'ax-disc-head' }, h('span', { class: 'ax-disc-title' }, T('pack.rules')))), h('div', { class: 'ax-disc-body' }, packRules(c))),
      h('p', { class: 'ax-note tr-source' }, T('pack.source', { path: ruleset.source })),
    );
  }
  return h('section', { class: 'ax-panel ax-stack-sm tr-pack' }, body);
}

/** The package, read back in plain words and numbers — straight from its data. */
function packRules(c) {
  const { T, config, ruleset } = c;
  const n = c.counts.includes(c.n) ? c.n : c.counts[0];
  const sizes = [3, 4, 5, 6, 7, 8, 9, 10];
  const enchSizes = RULES.enchantmentLadder.map((r) => r.size).filter((s) => enchantmentPower(config, s) != null);
  const pf = config.power_formula;
  const wildFrom = [];
  if (ruleset.extras.baseline_wild) wildFrom.push(T('pack.wildBaseline', { n: ruleset.extras.baseline_wild }));
  if ((pf.contributions.perfect_transmutation || {}).wild) wildFrom.push(T('pack.wildPt', { n: pf.contributions.perfect_transmutation.wild }));
  if ((pf.enchantment_wild_sizes || []).length) wildFrom.push(T('pack.wildEnch', { sizes: pf.enchantment_wild_sizes.join(' or ') }));
  const trials = config.trials.filter((tr) => isActive(tr, n));
  const floors = [...new Set(trials.map((tr) => (tr.entry_floor || {}).value || 0))];
  const mark = ruleset.extras.champions_mark;
  const chains = [...new Set(trials.map((tr) => tiebreakText(T, tr.trial_tiebreaks)))];
  const finalChain = config.final_tiebreaks || ['shared'];
  return [
    h('span', { class: 'ax-label' }, T('pack.powerHead')),
    h('div', { class: 'ax-table-wrap' }, h('table', { class: 'ax-table tr-powertable' },
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, T('book.size')), h('th', { scope: 'col' }, T('pack.standard')), h('th', { scope: 'col' }, T('spellTypes.enchantment')))),
      h('tbody', null, sizes.map((s) => h('tr', null,
        h('th', { scope: 'row' }, s === sizes.at(-1) ? s + ' …' : s),
        h('td', null, standardSpellPower(config, s)),
        h('td', { class: enchSizes.includes(s) ? null : 'ax-na' }, enchSizes.includes(s) ? enchantmentPower(config, s) : '—')))),
    )),
    h('p', { class: 'ax-note' }, T('pack.wildFrom', { list: wildFrom.length ? wildFrom.join('; ') : T('pack.wildNone') })),
    h('span', { class: 'ax-label' }, T('pack.trialsHead', { n })),
    h('ul', { class: 'tr-rules' }, trials.map((tr) => { const rw = rewardFor(tr, n) || {}; return h('li', null, h('b', null, c.trialName(tr.id) + ' · ' + ptsText(c, rw.first || 0) + (rw.second ? ' · ' + T('pack.second', { n: rw.second }) : '')), h('span', null, requirementText(T, config, tr, c.domainName))); })),
    h('p', { class: 'ax-note' }, floors.length === 1 ? (floors[0] ? T('pack.floor', { n: floors[0] }) : T('pack.noFloor')) : floors.map((f) => T('pack.floor', { n: f })).join(' ')),
    mark && mark.player_counts.includes(n) ? h('p', { class: 'ax-note' }, T('pack.mark', { n: mark.bonus })) : null,
    chains.map((text) => h('p', { class: 'ax-note' }, T('pack.ties', { chain: text }))),
    h('p', { class: 'ax-note' }, T('pack.finalTies', { chain: tiebreakText(T, finalChain, true) })),
  ];
}

// ── Set-up ──────────────────────────────────────────────────────────────────────────
function viewSetup(c) {
  const { T, session, ui } = c;
  const head = h('header', { class: 'ax-stack-sm' }, h('h1', null, T('title')), h('p', { class: 'ax-lead' }, T('lead')));
  const mode = h('div', { class: 'ax-stack-sm' },
    segmented({ label: T('mode.label'), options: [{ value: 'pass', label: T('mode.pass') }, { value: 'net', label: T('mode.net') }], value: ui.mode, onChange: (v) => c.set({ mode: v, error: null }) }),
    h('p', { class: 'ax-note' }, T('mode.' + ui.mode + 'Note')));
  if (ui.mode === 'net') {
    const name = h('input', { type: 'text', class: 'tr-input', maxlength: 24, autocomplete: 'off', placeholder: T('net.yourName'), 'aria-label': T('net.yourName'), value: ui.nameDraft, dataset: { fk: 'name' }, oninput: (e) => { ui.nameDraft = e.target.value; } });
    const code = h('input', { type: 'text', class: 'tr-input tr-code', maxlength: 4, autocomplete: 'off', autocapitalize: 'characters', placeholder: 'ABCD', 'aria-label': T('net.code'), value: ui.codeDraft, dataset: { fk: 'code' }, oninput: (e) => { ui.codeDraft = e.target.value.toUpperCase().replace(/[^A-Z]/g, ''); } });
    return [head, mode,
      h('section', { class: 'ax-panel ax-stack' },
        name,
        ui.codeDraft ? null : [packPanel(c), h('button', { type: 'button', class: 'ax-btn ax-btn-primary tr-wide', disabled: ui.busy, onclick: () => c.netCreate(ui.nameDraft) }, ui.busy ? T('net.connecting') : T('net.create'))],
        h('div', { class: 'ax-stack-sm' }, h('span', { class: 'ax-label' }, ui.codeDraft ? T('net.code') : T('net.or')),
          h('div', { class: 'ax-row' }, code, h('button', { type: 'button', class: 'ax-btn' + (ui.codeDraft ? ' ax-btn-primary' : ''), disabled: ui.busy, onclick: () => (ui.codeDraft.length === 4 ? c.netJoin(ui.codeDraft, ui.nameDraft) : c.set({ error: 'no-such-room' })) }, ui.busy && ui.codeDraft ? T('net.connecting') : T('net.join')))),
        errorNote(c, 'net.errors'),
      )];
  }
  const problem = !session.rulesetId ? 'no-ruleset' : session.players.length < 2 ? 'too-few-players' : !c.counts.includes(c.n) ? 'count-not-supported' : null;
  const addPlayer = () => { if (ui.nameDraft.trim()) c.act({ type: 'add-player', name: ui.nameDraft }, { nameDraft: '' }); };
  return [head, mode, packPanel(c),
    h('section', { class: 'ax-panel ax-stack-sm' },
      h('span', { class: 'ax-label' }, T('setup.players')),
      session.players.length ? h('ol', { class: 'tr-players' }, session.players.map((p) => h('li', null, h('span', null, p.name), h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', 'aria-label': T('setup.remove', { name: p.name }), onclick: () => c.act({ type: 'remove-player', playerId: p.id }) }, '✕')))) : h('p', { class: 'ax-note' }, T('setup.none')),
      session.players.length < MAX_PLAYERS ? h('form', { class: 'ax-row', onsubmit: (e) => { e.preventDefault(); addPlayer(); } },
        h('input', { type: 'text', class: 'tr-input', maxlength: 24, autocomplete: 'off', placeholder: T('setup.name'), 'aria-label': T('setup.name'), value: ui.nameDraft, dataset: { fk: 'name' }, oninput: (e) => { ui.nameDraft = e.target.value; } }),
        h('button', { type: 'submit', class: 'ax-btn' }, T('setup.add'))) : null,
      errorNote(c, 'setup.errors'),
    ),
    h('div', { class: 'ax-stack-sm' },
      h('button', { type: 'button', class: 'ax-btn ax-btn-primary tr-wide', disabled: !!problem, onclick: () => c.act({ type: 'start-books' }) }, T('setup.start') + ' →'),
      problem && (session.players.length >= 2 || problem === 'no-ruleset') ? h('p', { class: 'ax-note' }, T('setup.need.' + problem, { n: c.n, counts: countsText(c) })) : null),
  ];
}

// ── Spellbooks ──────────────────────────────────────────────────────────────────────
const spellName = (c, sp) => (sp.energy_domain ? c.T('book.spellLineEnergy', { energy: c.domainName(sp.energy_domain), spell: c.T('spellTypes.' + sp.type), n: sp.size }) : c.T('book.spellLine', { spell: c.T('spellTypes.' + sp.type), n: sp.size }));

function powerLine(c, pid) {
  const state = c.states[pid];
  if (!state) return null;
  const parts = c.config.domains.filter((d) => state.normal_power[d.id] > 0).map((d) => h('li', { dataset: { d: d.id } }, h('b', null, state.normal_power[d.id]), ' ' + c.domainName(d.id)));
  if (state.wild_power > 0) parts.push(h('li', { dataset: { d: WILD } }, h('b', null, state.wild_power), ' ' + c.T('wild')));
  return parts.length ? h('ul', { class: 'tr-power' }, parts) : h('p', { class: 'ax-note' }, c.T('book.powerNone'));
}

function bookEditor(c, pid) {
  const { T, ui, deck, session } = c;
  const books = session.players.map((p) => ({ playerId: p.id, spells: session.books[p.id] || [] }));
  const used = usedCards(books);
  const addSpell = (option, cards) => c.act({ type: 'add-spell', playerId: pid, spell: makeSpell(null, option, cards) }, { cards: [] });
  const mode = segmented({ label: T('book.entry'), options: [{ value: 'cards', label: T('book.cards') }, { value: 'quick', label: T('book.quick') }], value: ui.entry, onChange: (v) => c.set({ entry: v }) });
  if (ui.entry === 'quick') {
    const q = ui.quick;
    const needsEnergy = q.type === 'conjuration' || q.type === 'perfect_transmutation';
    const max = q.type === 'enchantment' ? deck.enchantmentMax : deck.maxSpellSize;
    const size = Math.max(deck.minSpellSize, Math.min(q.size, max));
    const e = deck.energies.includes(q.energy) ? q.energy : deck.energies[0];
    const spell = { type: q.type, size, energy_domain: needsEnergy ? e : null };
    const setQ = (patch) => c.set({ quick: { ...q, size, energy: e, ...patch } });
    return h('div', { class: 'ax-stack-sm tr-editor' }, mode,
      h('div', { class: 'ax-calc-kinds', role: 'group', 'aria-label': T('book.entry') }, Object.keys(KIND_OF_TYPE).map((type) => h('button', { type: 'button', class: 'ax-btn', 'aria-pressed': String(type === q.type), dataset: { fk: 'qt-' + type }, onclick: () => setQ({ type }) }, T('spellTypes.' + type)))),
      needsEnergy ? energyRow(c, e, (key) => setQ({ energy: key }), false) : null,
      h('div', { class: 'ax-row ax-row-between' },
        h('div', { class: 'ax-row' }, h('span', { class: 'ax-label' }, T('book.size')), stepper(c, { value: size, max, label: T('book.size'), fk: 'qsize', onChange: (v) => setQ({ size: Math.max(deck.minSpellSize, v) }) })),
        h('button', { type: 'button', class: 'ax-btn ax-btn-primary', disabled: checkQuickSpell(spell, deck).length > 0, dataset: { fk: 'qadd' }, onclick: () => addSpell(spell, null) }, T('book.addQuick', { spell: T('spellTypes.' + q.type), n: size })),
      ));
  }
  const cards = ui.cards;
  const selected = deck.energies.includes(ui.energy) ? ui.energy : deck.energies[0];
  const wildsHere = cards.filter((x) => x.e === WILD).length;
  const wildLeft = deck.wilds - used.wilds - wildsHere;
  const at = (v) => cards.findIndex((x) => x.e === selected && x.v === v);
  const pad = h('div', { class: 'ax-pad', role: 'group', 'aria-label': energy(selected).name });
  for (let v = deck.minValue; v <= deck.maxValue; v++) {
    const on = at(v) >= 0; const taken = !on && used.keys.has(selected + ':' + v);
    const name = cardName({ e: selected, v });
    pad.append(h('button', { type: 'button', class: 'ax-key', 'aria-pressed': String(on), disabled: taken, title: taken ? T('book.usedElsewhere', { card: name }) : null, 'aria-label': taken ? T('book.usedElsewhere', { card: name }) : name, dataset: { fk: 'k' + v },
      onclick: () => c.set({ cards: on ? cards.filter((_, i) => i !== at(v)) : cards.concat([{ e: selected, v }]) }) }, v));
  }
  const read = readCards(cards, deck, points);
  let verdict;
  if (!cards.length) verdict = null;
  else if (cards.length < deck.minSpellSize) verdict = h('p', { class: 'ax-verdict', dataset: { tone: 'none' } }, T('book.tooFew', { n: deck.minSpellSize }));
  else if (!read.options.length) verdict = h('p', { class: 'ax-verdict', dataset: { tone: 'none' } }, T('book.notOne'));
  else verdict = h('div', { class: 'ax-row tr-options' }, read.options.map((o, i) => h('button', { type: 'button', class: 'ax-btn' + (i === 0 ? ' ax-btn-primary' : ''), dataset: { fk: 'as-' + o.type }, onclick: () => addSpell(o, cards) }, T('book.addAs', { spell: T('spellTypes.' + o.type), n: o.size }))));
  return h('div', { class: 'ax-stack-sm tr-editor' }, mode,
    h('div', { class: 'ax-row ax-row-between' }, h('span', { class: 'ax-label' }, T('book.tray')), cards.length ? h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', onclick: () => c.set({ cards: [] }) }, T('book.clearCards')) : null),
    h('div', { class: 'ax-hand' }, cards.length ? chips(cards, (card) => ({ label: cardName(card), onclick: () => c.set({ cards: cards.filter((x) => x !== card) }) })) : h('p', { class: 'ax-note' }, T('book.trayEmpty'))),
    verdict,
    energyRow(c, selected, (key) => c.set({ energy: key }), true, wildLeft, wildsHere + used.wilds, () => c.set({ cards: cards.concat([{ e: WILD, v: null }]) })),
    pad);
}

function energyRow(c, selected, onPick, withWild, wildLeft = 0, wildUsed = 0, onWild = null) {
  const row = h('div', { class: 'ax-energies', role: 'group', 'aria-label': c.T('book.pickEnergy') },
    c.deck.energies.map((key) => h('button', { type: 'button', class: 'ax-energy', dataset: { e: key, fk: 'e-' + key }, 'aria-pressed': String(key === selected), onclick: () => onPick(key) }, h('img', { src: symbolUrl(key), alt: '', width: 26, height: 26 }), h('span', null, energy(key).name))));
  if (withWild) row.append(h('button', { type: 'button', class: 'ax-energy', dataset: { e: WILD, fk: 'e-wild' }, disabled: wildLeft <= 0, onclick: onWild }, h('img', { src: symbolUrl(WILD), alt: '', width: 26, height: 26 }), h('span', null, c.T('book.wildCount', { n: wildUsed, max: c.deck.wilds }))));
  return row;
}

function viewBooks(c) {
  const { T, session, ui } = c;
  const netMode = session.mode === 'net';
  const books = session.players.map((p) => ({ playerId: p.id, spells: session.books[p.id] || [] }));
  const issues = checkTable(books, c.deck);
  const flagged = new Set(issues.filter((i) => i.code === 'duplicate-card').flatMap((i) => i.where.map((w) => w.spellId)));
  const who = (w) => c.playerName(w.playerId);
  const done = (pid) => !netMode || session.net.done[pid];
  const panels = session.players.map((p) => {
    const mine = !netMode || p.id === c.me;
    const editing = mine && (netMode ? !session.net.done[p.id] : ui.bookFor === p.id);
    const spells = session.books[p.id] || [];
    const state = c.states[p.id];
    return h('section', { class: 'ax-panel ax-stack-sm tr-book', dataset: { editing: editing ? '' : null } },
      h('div', { class: 'ax-row ax-row-between' },
        h('h2', null, p.name, netMode && p.id === c.me ? h('span', { class: 'tr-tag' }, T('net.you')) : null, netMode && p.id === session.net.host ? h('span', { class: 'tr-tag' }, T('net.host')) : null),
        netMode ? h('span', { class: 'ax-note' }, session.net.done[p.id] ? '✓ ' + T('net.isDone') : T('net.notDone'))
          : h('button', { type: 'button', class: 'ax-btn' + (editing ? ' ax-btn-primary' : ''), dataset: { fk: 'edit-' + p.id }, onclick: () => c.set({ bookFor: editing ? null : p.id, cards: [] }) }, editing ? T('book.done') : T('book.add')),
      ),
      spells.length ? h('ul', { class: 'tr-spells' }, spells.map((sp) => h('li', { dataset: { flag: flagged.has(sp.id) ? '' : null } },
        h('div', null, h('b', null, spellName(c, sp)), sp.cards ? chips(sp.cards) : null),
        editing ? h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', 'aria-label': T('book.removeSpell', { spell: spellName(c, sp) }), onclick: () => c.act({ type: 'remove-spell', playerId: p.id, spellId: sp.id }) }, '✕') : null))) : h('p', { class: 'ax-note' }, T('book.empty')),
      c.ruleset ? powerLine(c, p.id) : null,
      state ? [...new Map(state.unplaced.map((u) => [u.code + (u.domain || u.size), u])).values()].map((u) => callout('clarification', T('book.unplaced.' + u.code, { domain: u.domain ? c.domainName(u.domain) : '', size: u.size }), T('pack.heading'))) : null,
      editing ? bookEditor(c, p.id) : null,
      netMode && mine ? h('label', { class: 'tr-check' }, h('input', { type: 'checkbox', checked: session.net.done[p.id] ? true : null, dataset: { fk: 'done' }, onchange: (e) => c.net.api.setDone(e.target.checked) }), h('span', null, h('b', null, T('net.mineDone')))) : null,
    );
  });
  const empty = session.players.filter((p) => !(session.books[p.id] || []).length);
  const waiting = session.players.filter((p) => !done(p.id));
  const blocked = issues.length > 0 || !c.counts.includes(c.n) || waiting.length > 0 || session.players.length < 2;
  return [
    h('div', { class: 'ax-view-head' }, h('h1', null, T('book.heading')), netMode ? roomBadge(c) : null),
    h('p', { class: 'ax-note' }, T('book.intro')),
    netMode ? roomPanel(c) : null,
    packPanel(c, { compact: true }),
    panels,
    issues.map((i) => h('p', { class: 'tr-error', role: 'alert' }, i.code === 'duplicate-card' ? T('book.issue.duplicate-card', { card: cardName(i.card), who: list([...new Set(i.where.map(who))]) }) : i.code === 'too-many-wilds' ? T('book.issue.too-many-wilds', i) : T('book.issue.spell', { who: c.playerName(i.playerId) }))),
    !c.counts.includes(c.n) && c.ruleset ? h('p', { class: 'tr-error', role: 'alert' }, T('setup.need.count-not-supported', { n: c.n, counts: countsText(c) })) : null,
    empty.length && !waiting.length ? h('p', { class: 'ax-note' }, T('book.noSpells', { names: list(empty.map((p) => p.name)), verb: empty.length > 1 ? 'have' : 'has' })) : null,
    errorNote(c, 'net.errors'),
    c.isHost ? h('button', { type: 'button', class: 'ax-btn ax-btn-primary tr-wide', disabled: blocked, onclick: () => c.act({ type: 'start-allocation' }, { bookFor: null, cards: [], holder: null, gate: null }) }, T('book.start') + ' →') : h('p', { class: 'ax-note' }, T('net.waitHost')),
    issues.length ? h('p', { class: 'ax-note' }, T('book.startFix')) : netMode && waiting.length ? h('p', { class: 'ax-note' }, T('net.waitBooks', { names: list(waiting.map((p) => p.name)) })) : null,
    netMode ? h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', onclick: c.netLeave }, T('net.leave')) : null,
  ];
}

// ── Networked room header ───────────────────────────────────────────────────────────
const roomBadge = (c) => h('span', { class: 'ax-badge' }, c.T('net.room', { code: c.net.code }));
function roomPanel(c) {
  const { T, ui } = c;
  const link = location.origin + location.pathname + '?room=' + c.net.code + (new URLSearchParams(location.search).get('net') === 'local' ? '&net=local' : '');
  const qr = h('div', { class: 'tr-qr', role: 'img', 'aria-label': link });
  import('./net/qr.js').then(({ qrMatrix, qrSvgPath }) => {
    const m = qrMatrix(link); if (!m) return;
    const { d, viewBox } = qrSvgPath(m);
    qr.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
  });
  return h('details', { class: 'ax-disc', open: c.session.players.length < 2 ? true : null },
    h('summary', null, h('span', { class: 'ax-disc-head' }, h('span', { class: 'ax-disc-title' }, T('net.room', { code: c.net.code })), h('span', { class: 'ax-disc-sub' }, T('net.share')))),
    h('div', { class: 'ax-disc-body ax-stack-sm' }, h('p', { class: 'tr-bigcode' }, c.net.code), qr,
      h('button', { type: 'button', class: 'ax-btn', onclick: () => { (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(() => c.set({ copied: true }), () => window.prompt(T('net.link'), link)); } }, ui.copied ? '✓ ' + T('net.copied') : T('net.link'))));
}

// ── Allocation ──────────────────────────────────────────────────────────────────────
function statusList(c) {
  const { T, session } = c;
  return h('ul', { class: 'tr-status' }, session.players.map((p) => h('li', { dataset: { locked: session.locked[p.id] ? '' : null } },
    h('span', null, p.name, c.me === p.id ? h('span', { class: 'tr-tag' }, T('net.you')) : null),
    h('span', { class: 'ax-note' }, session.locked[p.id] ? '✓ ' + T('alloc.lockedIn') : T('alloc.todo')))));
}

function viewHandOff(c) {
  const { T, session, ui } = c;
  if (ui.gate) {
    const name = c.playerName(ui.gate);
    return h('section', { class: 'tr-gate ax-stack' },
      h('p', { class: 'ax-label' }, T('alloc.heading')),
      h('h1', null, T('alloc.gate', { name })),
      h('p', { class: 'ax-lead' }, T('alloc.gateText')),
      h('button', { type: 'button', class: 'ax-btn ax-btn-primary tr-wide', dataset: { fk: 'gate-go' }, onclick: () => { if (session.locked[ui.gate]) c.act({ type: 'unlock', playerId: ui.gate }, { holder: ui.gate, gate: null }); else c.set({ holder: ui.gate, gate: null }); } }, T('alloc.gateGo', { name })),
      h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', onclick: () => c.set({ gate: null }) }, T('alloc.gateBack')));
  }
  const everyone = allLocked(session);
  return [
    h('div', { class: 'ax-view-head' }, h('h1', null, T('alloc.heading'))),
    h('p', { class: 'ax-note' }, everyone ? T('alloc.allLocked') : T('alloc.passIntro')),
    h('ul', { class: 'tr-handoff' }, session.players.map((p) => h('li', null, session.locked[p.id]
      ? [h('span', { class: 'tr-done' }, '✓ ' + p.name, h('span', { class: 'ax-note' }, ' · ' + T('alloc.lockedIn'))), h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', onclick: () => c.set({ gate: p.id }) }, T('alloc.reopen'))]
      : h('button', { type: 'button', class: 'ax-btn tr-wide' + (waitingFor(session)[0].id === p.id ? ' ax-btn-primary' : ''), dataset: { fk: 'hand-' + p.id }, onclick: () => c.set({ gate: p.id }) }, T('alloc.handTo', { name: p.name }))))),
    everyone ? h('button', { type: 'button', class: 'ax-btn ax-btn-primary tr-wide tr-reveal', dataset: { fk: 'reveal' }, onclick: () => c.act({ type: 'reveal' }) }, T('alloc.reveal')) : null,
    backToBooks(c),
    packPanel(c, { warn: true, compact: true }),
  ];
}

function backToBooks(c) {
  const { T, ui } = c;
  if (!c.isHost) return null;
  return ui.confirmBack
    ? h('div', { class: 'ax-panel ax-stack-sm' }, h('p', null, T('alloc.backWarn')), h('div', { class: 'ax-row' },
        h('button', { type: 'button', class: 'ax-btn', onclick: () => c.act({ type: 'back-to-books' }, { confirmBack: false, holder: null, gate: null }) }, T('alloc.backGo')),
        h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', onclick: () => c.set({ confirmBack: false }) }, T('alloc.cancel'))))
    : h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', onclick: () => c.set({ confirmBack: true }) }, '← ' + T('alloc.back'));
}

function outlookLine(c, trial, look) {
  const { T } = c;
  const names = (ids) => list(ids.map(c.playerName));
  const ceilings = (ids) => list(ids.map((id) => T('outlook.rivalMax', { name: c.playerName(id), n: look.rivals.find((r) => r.id === id).max })));
  const floor = Math.max((trial.entry_floor || {}).value || 0, 1);
  let tone = 'none'; let text;
  switch (look.verdict) {
    case 'cannot-enter': text = T('outlook.cannot-enter'); break;
    case 'empty-open': text = T('outlook.empty-open', { need: floor }); tone = 'open'; break;
    case 'empty': text = T('outlook.empty', { rivals: T('outlook.rivals', { list: ceilings(look.rivals.map((r) => r.id)) }) }); break;
    case 'illegal': text = look.mine.reasons.map((r) => reasonText(T, c.config, trial, r, c.domainName)).join(' '); tone = 'no'; break;
    case 'certain': text = (look.rivals.length ? T('outlook.certain', { total: look.mine.total }) : T('outlook.certainAlone')) + (look.spare > 0 ? T('outlook.spare', { n: look.spare }) : ''); tone = 'ok'; break;
    case 'certain-or-shared': text = T('outlook.certain-or-shared', { names: names(look.threatenedBy), total: look.mine.total }); tone = 'ok'; break;
    default: text = T('outlook.contested', { names: list(look.threatenedBy.map((id) => T('outlook.rivalMaxParen', { name: c.playerName(id), n: look.rivals.find((r) => r.id === id).max }))) }) + (look.beats.length ? T('outlook.beats', { names: names(look.beats) }) : ''); tone = 'risk';
  }
  return h('p', { class: 'tr-outlook', dataset: { tone }, 'aria-live': 'polite' }, text);
}

function trialCard(c, trial, pid, a, rem) {
  const { T, config } = c;
  const state = c.states[pid];
  const entry = { normal: a.normal[trial.id] || {}, wild: a.wild[trial.id] || 0 };
  const look = trialOutlook(config, trial, c.n, pid, c.states, entry);
  const reward = look.reward || {};
  const total = sum(entry.normal) + entry.wild;
  const mark = c.ruleset.extras.champions_mark;
  const marking = mark && mark.player_counts.includes(c.n);
  const domains = config.domains.map((d) => d.id).filter((d) => state.normal_power[d] > 0 && domainAllowed(config, trial, d));
  const row = (key, label, value, max, onChange) => h('div', { class: 'tr-row', dataset: { d: key } },
    h('span', { class: 'tr-row-name' }, key === WILD || !energy(key) ? null : h('img', { src: symbolUrl(key), alt: '', width: 20, height: 20 }), label),
    stepper(c, { value, max, label: label + ', ' + c.trialName(trial.id), fk: trial.id + ':' + key, onChange }),
    h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', disabled: value >= max, dataset: { fk: trial.id + ':' + key + 'all' }, onclick: () => onChange(max) }, T('alloc.all')));
  return h('section', { class: 'ax-panel tr-trial', dataset: { entered: total > 0 ? '' : null, tone: look.verdict } },
    h('div', { class: 'tr-trial-head' },
      h('h2', null, c.trialName(trial.id)),
      h('span', { class: 'tr-rp' }, ptsText(c, reward.first || 0) + (reward.second ? ' · ' + T('pack.second', { n: reward.second }) : ''))),
    h('p', { class: 'ax-note' }, requirementText(T, config, trial, c.domainName)),
    domains.map((d) => row(d, c.domainName(d), entry.normal[d] || 0, (entry.normal[d] || 0) + Math.max(rem.normal[d], 0), (v) => c.act({ type: 'set-normal', playerId: pid, trialId: trial.id, domain: d, value: v }))),
    state.wild_power > 0 ? row(WILD, T('wild'), entry.wild, entry.wild + Math.max(rem.wild, 0), (v) => c.act({ type: 'set-wild', playerId: pid, trialId: trial.id, value: v })) : null,
    h('div', { class: 'tr-trial-foot' },
      h('span', null, h('span', { class: 'ax-label' }, T('alloc.entryTotal')), h('output', null, total)),
      marking ? h('button', { type: 'button', class: 'ax-btn', 'aria-pressed': String(a.mark === trial.id), dataset: { fk: 'mark-' + trial.id }, onclick: () => c.act({ type: 'set-mark', playerId: pid, trialId: a.mark === trial.id ? null : trial.id }) }, (a.mark === trial.id ? '★ ' + T('alloc.marked') : '☆ ' + T('alloc.markPick'))) : null,
      total > 0 ? h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', dataset: { fk: 'clear-' + trial.id }, onclick: () => c.act({ type: 'clear-trial', playerId: pid, trialId: trial.id }) }, T('alloc.clear')) : null),
    outlookLine(c, trial, look),
  );
}

function viewAllocate(c, pid) {
  const { T, session, ui, config } = c;
  const a = allocationOf(session, pid);
  const state = c.states[pid];
  const rem = remaining(state, a);
  const trials = activeTrials(c);
  const open = trials.filter((tr) => trialOutlook(config, tr, c.n, pid, c.states, { normal: {}, wild: 0 }).verdict !== 'cannot-enter');
  const shut = trials.filter((tr) => !open.includes(tr));
  const pools = config.domains.filter((d) => state.normal_power[d.id] > 0).map((d) => ({ key: d.id, name: c.domainName(d.id), total: state.normal_power[d.id], left: rem.normal[d.id] }));
  if (state.wild_power > 0) pools.push({ key: WILD, name: T('wild'), total: state.wild_power, left: rem.wild });
  const unspent = pools.filter((p) => p.left > 0).map((p) => p.left + ' ' + p.name);
  const use = findUnspentUse(config, state, { normal: a.normal, wild: a.wild }, c.n);
  const mark = c.ruleset.extras.champions_mark;
  const entered = trials.filter((tr) => sum(a.normal[tr.id]) + (a.wild[tr.id] || 0) > 0);
  const voids = entered.filter((tr) => !entryIsLegal(config, tr, a.normal[tr.id] || {}, c.n, a.wild[tr.id] || 0, state).legal);
  const netMode = session.mode === 'net';
  return [
    h('div', { class: 'tr-private' }, h('span', null, '🔒 ' + T('alloc.private', { name: c.playerName(pid) })), netMode ? roomBadge(c) : h('button', { type: 'button', class: 'ax-btn', dataset: { fk: 'hide' }, onclick: () => c.set({ holder: null, confirmLock: false }) }, T('alloc.hide'))),
    pools.length ? h('section', { class: 'tr-pools', 'aria-label': T('alloc.pools') }, pools.map((p) => h('div', { class: 'tr-pool', dataset: { d: p.key, spent: p.left === 0 ? '' : null } }, h('b', null, p.left), h('span', null, p.name), h('small', null, T('alloc.left', { left: p.left, total: p.total }))))) : h('p', { class: 'ax-note' }, T('alloc.noPower')),
    mark && mark.player_counts.includes(c.n) ? h('p', { class: 'ax-note' }, '☆ ' + T('alloc.markNote', { n: mark.bonus })) : null,
    open.map((tr) => trialCard(c, tr, pid, a, rem)),
    shut.length ? h('section', { class: 'ax-panel ax-stack-sm tr-shut' }, h('span', { class: 'ax-label' }, T('alloc.cannot')), h('ul', null, shut.map((tr) => h('li', null, h('b', null, c.trialName(tr.id)), ' ' + requirementText(T, config, tr, c.domainName))))) : null,
    h('p', { class: 'ax-note' }, T('outlook.ceiling')),
    h('section', { class: 'ax-panel ax-stack-sm tr-lock' },
      h('p', null, unspent.length ? T('alloc.unspent', { list: list(unspent) }) : T('alloc.unspentNone')),
      use ? h('p', { class: 'ax-note' }, T('alloc.couldPlace', { what: use.kind === 'wild' ? T('wild') : c.domainName(use.domain), trial: c.trialName(use.trial_id) })) : null,
      ui.confirmLock
        ? [h('h2', null, T('alloc.confirm')),
          entered.length ? h('ul', { class: 'tr-summary' }, entered.map((tr) => h('li', null, h('b', null, c.trialName(tr.id)), ' ' + (sum(a.normal[tr.id]) + (a.wild[tr.id] || 0)), a.mark === tr.id ? ' ★' : ''))) : h('p', null, T('alloc.confirmEmpty')),
          voids.map((tr) => h('p', { class: 'tr-error' }, T('alloc.confirmVoid', { trial: c.trialName(tr.id) }))),
          h('p', { class: 'ax-note' }, T('alloc.confirmNote')),
          h('div', { class: 'ax-row' },
            h('button', { type: 'button', class: 'ax-btn ax-btn-primary', dataset: { fk: 'lock-go' }, onclick: () => c.act({ type: 'lock', playerId: pid }, { holder: null, confirmLock: false }) }, T('alloc.confirmGo')),
            h('button', { type: 'button', class: 'ax-btn', dataset: { fk: 'lock-back' }, onclick: () => c.set({ confirmLock: false }) }, T('alloc.confirmBack')))]
        : h('div', { class: 'ax-row ax-row-between' },
          h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', disabled: !entered.length && !a.mark, onclick: () => c.act({ type: 'clear-allocation', playerId: pid }) }, T('alloc.reset')),
          h('button', { type: 'button', class: 'ax-btn ax-btn-primary', dataset: { fk: 'lock' }, onclick: () => c.set({ confirmLock: true }) }, T('alloc.lock') + ' →')),
      errorNote(c, 'net.errors')),
  ];
}

function viewNetWaiting(c) {
  const { T, session } = c;
  const everyone = allLocked(session);
  return [
    h('div', { class: 'ax-view-head' }, h('h1', null, T('alloc.heading')), roomBadge(c)),
    h('p', { class: 'ax-lead' }, session.net.revealing ? T('net.revealing') : everyone ? T('alloc.allLocked') : T('alloc.waiting', { names: list(waitingFor(session).map((p) => p.name)) })),
    statusList(c),
    session.locked[c.me] && !session.net.revealing ? h('button', { type: 'button', class: 'ax-btn', onclick: () => c.act({ type: 'unlock', playerId: c.me }) }, T('alloc.reopen')) : null,
    everyone && c.isHost && !session.net.revealing ? h('button', { type: 'button', class: 'ax-btn ax-btn-primary tr-wide tr-reveal', onclick: () => c.act({ type: 'reveal' }) }, T('alloc.reveal')) : null,
    everyone && !c.isHost && !session.net.revealing ? h('p', { class: 'ax-note' }, T('net.waitReveal')) : null,
    errorNote(c, 'net.errors'),
    session.net.revealing ? null : backToBooks(c),
  ];
}

// ── The reveal ──────────────────────────────────────────────────────────────────────
function resultTrial(c, trial, result) {
  const { T, config } = c;
  const tr = result.trial_results.find((x) => x.trial_id === trial.id);
  const reward = rewardFor(trial, c.n) || {};
  const order = tr.placements.flat().concat(Object.keys(tr.illegal_entries).sort());
  const awards = result.award_trace.filter((x) => x.trial_id === trial.id);
  const outcome = (pid) => {
    const aw = awards.find((x) => x.player_id === pid);
    if (!tr.entries[pid].legal) return h('span', { class: 'tr-out', dataset: { k: 'void' } }, T('results.void'));
    if (!aw) return h('span', { class: 'tr-out' }, T('results.noAward'));
    return h('span', { class: 'tr-out', dataset: { k: aw.place === 'first' ? 'win' : 'second' } }, (aw.place === 'second' ? T('results.second') : aw.tie_resolution === 'sole' ? T('results.wins') : T('results.shares')) + ' · ' + ptsText(c, aw.awarded));
  };
  const note = tr.comparison && tr.comparison.kind === 'decided' && tr.comparison.token !== 'total_power' ? T('results.decided', { what: T('tiebreak.' + tr.comparison.token) })
    : tr.comparison && tr.comparison.kind === 'shared' ? T('results.sharedOn') : null;
  return h('section', { class: 'ax-panel tr-result' },
    h('div', { class: 'tr-trial-head' }, h('h2', null, c.trialName(trial.id)), h('span', { class: 'tr-rp' }, ptsText(c, reward.first || 0) + (reward.second ? ' · ' + T('pack.second', { n: reward.second }) : ''))),
    order.length ? h('ol', { class: 'tr-entries' }, order.map((pid) => { const e = tr.entries[pid]; return h('li', { dataset: { legal: e.legal ? '' : null, first: tr.placements[0] && tr.placements[0].includes(pid) ? '' : null } },
      h('span', { class: 'tr-entry-power' }, e.legal ? e.total_power : '✕'),
      h('span', { class: 'tr-entry-who' }, h('b', null, c.playerName(pid)), h('span', { class: 'ax-note' }, entryParts(T, config, e, c.domainName) + (e.legal ? '' : ' · ' + e.reasons.map((r) => reasonText(T, config, trial, r, c.domainName)).join(' ')))),
      outcome(pid)); })) : h('p', { class: 'ax-note' }, T('results.nobody')),
    note ? h('p', { class: 'ax-note' }, note) : null);
}

function viewResults(c) {
  const { T, session, ui, ruleset } = c;
  const result = resolveSession(session, ruleset);
  const trials = activeTrials(c);
  const shown = Math.min(ui.revealed, trials.length);
  const all = shown >= trials.length;
  const isHost = c.isHost;
  const standing = Object.values(result.player_results).sort((a, b) => a.final_place - b.final_place || (c.playerName(a.player_id) < c.playerName(b.player_id) ? -1 : 1));
  const winners = result.final_groups[0].map(c.playerName);
  const bad = Object.entries(ui.seals || {}).filter(([, ok]) => !ok).map(([pid]) => pid);
  return [
    h('div', { class: 'ax-view-head' }, h('h1', null, T('results.heading')),
      h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', onclick: () => c.set({ display: !ui.display }) }, ui.display ? T('results.displayOff') : T('results.display'))),
    h('p', { class: 'tr-stamp' }, h('span', { class: 'ax-label' }, T('results.stamp')), ' ', h('b', null, rulesetStamp(ruleset)), ' ', statusBadge(c, ruleset)),
    bad.map((pid) => h('p', { class: 'tr-error', role: 'alert' }, T('results.sealBad', { name: c.playerName(pid) }))),
    h('div', { class: 'tr-grid' }, trials.slice(0, shown).map((tr) => resultTrial(c, tr, result))),
    all ? null : h('div', { class: 'ax-row tr-revealbar' },
      h('button', { type: 'button', class: 'ax-btn ax-btn-primary', dataset: { fk: 'next' }, onclick: () => c.set({ revealed: shown + 1 }) }, T('results.next') + ' · ' + c.trialName(trials[shown].id)),
      h('button', { type: 'button', class: 'ax-btn', dataset: { fk: 'all' }, onclick: () => c.set({ revealed: trials.length }) }, T('results.all')),
      h('span', { class: 'ax-note' }, T('results.hiddenLeft', { n: trials.length - shown }))),
    all && result.mark_awards.length ? h('section', { class: 'ax-panel ax-stack-sm' }, h('span', { class: 'ax-label' }, T('results.markHead')),
      h('ul', null, result.mark_awards.map((m) => h('li', null, m.trial_id ? T(m.won ? 'results.markWon' : 'results.markLost', { name: c.playerName(m.player_id), trial: c.trialName(m.trial_id) }) : T('results.markNone', { name: c.playerName(m.player_id) }), m.won ? h('b', null, ' +' + m.awarded) : null)))) : null,
    all ? h('section', { class: 'ax-panel ax-stack-sm tr-standing' },
      h('span', { class: 'ax-label' }, T('results.standings')),
      h('p', { class: 'tr-winner' }, winners.length > 1 ? T('results.winners', { names: list(winners) }) : T('results.winner', { name: winners[0] })),
      h('div', { class: 'ax-table-wrap' }, h('table', { class: 'ax-table ax-table-left' },
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, T('results.place')), h('th', { scope: 'col' }, T('results.wizard')), trials.map((tr) => h('th', { scope: 'col', class: 'tr-col' }, c.trialName(tr.id))), h('th', { scope: 'col' }, '')),
        ),
        h('tbody', null, standing.map((p) => h('tr', null, h('th', { scope: 'row' }, p.final_place + (p.shared ? '=' : '')), h('td', null, c.playerName(p.player_id)),
          trials.map((tr) => { const rp = result.trial_results.find((x) => x.trial_id === tr.id).rewards_awarded[p.player_id]; return h('td', { class: rp ? null : 'ax-na' }, rp || '·'); }),
          h('td', { class: 'tr-total' }, ptsText(c, p.recognition_points))))))),
      result.final_decided_by && result.final_decided_by !== 'recognition_points' && result.final_decided_by !== 'shared' ? h('p', { class: 'ax-note' }, T('results.finalDecided', { what: T('tiebreak.' + result.final_decided_by) })) : null,
    ) : null,
    all ? h('details', { class: 'ax-disc' }, h('summary', null, h('span', { class: 'ax-disc-head' }, h('span', { class: 'ax-disc-title' }, T('results.allocations')))),
      h('div', { class: 'ax-disc-body ax-stack-sm' }, session.players.map((p) => { const res = result.residue[p.id]; const left = []; for (const [d, v] of Object.entries(result.conservation[p.id])) if (v.residue > 0) left.push(v.residue + ' ' + c.domainName(d)); if (res.wild > 0) left.push(res.wild + ' ' + T('wild'));
        return h('div', null, h('b', null, p.name), powerLine(c, p.id), left.length ? h('p', { class: 'ax-note' }, T('results.unspent', { list: list(left) })) : null); }))) : null,
    all && isHost ? h('div', { class: 'ax-row' },
      h('button', { type: 'button', class: 'ax-btn ax-btn-primary', onclick: () => c.act({ type: 'rematch' }, { revealed: 0, display: false, bookFor: null }) }, T('results.rematch')),
      session.mode === 'net' ? null : h('button', { type: 'button', class: 'ax-btn', onclick: () => c.act({ type: 'new-game' }, { revealed: 0, display: false, bookFor: null }) }, T('results.newGame'))) : null,
    session.mode === 'net' ? h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', onclick: c.netLeave }, T('net.leave')) : null,
  ];
}

// ── Which screen ────────────────────────────────────────────────────────────────────
export function render(c) {
  const { session, ui } = c;
  let view;
  if (session.phase === 'setup') view = viewSetup(c);
  else if (session.phase === 'books') view = viewBooks(c);
  else if (session.phase === 'allocate') {
    if (session.mode === 'net') view = session.locked[c.me] || session.net.revealing ? viewNetWaiting(c) : viewAllocate(c, c.me);
    else view = ui.holder && !session.locked[ui.holder] ? viewAllocate(c, ui.holder) : viewHandOff(c);
  } else view = viewResults(c);
  return h('div', { class: 'tr-main ax-stack', dataset: { phase: session.phase } }, view);
}
