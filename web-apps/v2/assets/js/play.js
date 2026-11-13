// PLAY — the table companion. Phone-first, five views behind a tab bar, in the order
// players ask: Check · Spells · Turn · Score · Set-up. Deep links: #check #spells #turn
// #drought #score #set-up.
import './app.js';
import {
  h, t, clear, rich, store, url, rulesUrl, symbolUrl, chips, callout, getGroup, onGroup, setGroup, segmented,
  spellTile, turnSteps, scoreTable, ladderTable, setupSteps, reminders, learningActions, whyNoCasting, variantNotes,
  scoreCalculator, energyLegend, explainerMount, effectLine, energy, cardName, RULES, groupById, points,
} from './ui.js';
import { deckProfile } from '../../data/current.js';
import { findSpells, wholeHandSpell, groupByKind, validateHand, canAdd, WILD } from './hand-checker.js';

const main = document.getElementById('main');
const tabsNav = document.getElementById('tabs');
const TABS = ['check', 'spells', 'turn', 'score', 'set-up'];
const ALIAS = { drought: 'turn', start: 'set-up', setup: 'set-up', scoring: 'score', '': 'check' };

const players = () => h('div', { class: 'ax-row ax-players' },
  h('span', { class: 'ax-label', 'aria-hidden': 'true' }, t('players.label')),
  segmented({ label: t('players.label'), options: RULES.players.groups.map((g) => ({ value: g.id, label: t('players.' + g.id) })), value: getGroup(), onChange: setGroup }),
);
const head = (title, extra) => h('div', { class: 'ax-view-head' }, h('h1', null, title), extra);
const more = (id) => h('a', { class: 'ax-more', href: rulesUrl(id) }, t('fullRule') + ' →');

// ── Check ───────────────────────────────────────────────────────────────────────────
function viewCheck() {
  const C = 'play.check.';
  const deck = deckProfile(getGroup());
  // Keep only cards this deck can hold (the player count may have changed since last visit).
  let hand = [];
  for (const card of store.get('hand', [])) if (canAdd(hand, card, deck)) hand.push(card);
  let selected = store.get('energy', deck.energies[0]);
  if (!deck.energies.includes(selected)) selected = deck.energies[0];

  const tray = h('div', { class: 'ax-hand' });
  const clearBtn = h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', onclick: () => { hand = []; update(); } }, t(C + 'clear'));
  const energyRow = h('div', { class: 'ax-energies', role: 'group', 'aria-label': t(C + 'pickEnergy') });
  const pad = h('div', { class: 'ax-pad', role: 'group' });
  const verdict = h('p', { class: 'ax-verdict', 'aria-live': 'polite' });
  const results = h('div', { class: 'ax-stack-sm' });

  const has = (e, v) => hand.findIndex((c) => c.e === e && c.v === v);
  const wildCount = () => hand.filter((c) => c.e === WILD).length;

  const energyButtons = deck.energies.map((key) => h('button', {
    type: 'button', class: 'ax-energy', dataset: { e: key }, onclick: () => { selected = key; store.set('energy', key); update(); },
  }, h('img', { src: symbolUrl(key), alt: '', width: 26, height: 26 }), h('span', null, energy(key).name)));
  const wildLabel = h('span');
  const wildButton = h('button', {
    type: 'button', class: 'ax-energy', dataset: { e: WILD }, onclick: () => { if (wildCount() < deck.wilds) { hand.push({ e: WILD, v: null }); update(); } },
  }, h('img', { src: symbolUrl(WILD), alt: '', width: 26, height: 26 }), wildLabel);
  energyRow.append(...energyButtons, wildButton);

  const keys = [];
  for (let v = deck.minValue; v <= deck.maxValue; v++) {
    const key = h('button', { type: 'button', class: 'ax-key', onclick: () => {
      const at = has(selected, v);
      if (at >= 0) hand.splice(at, 1); else hand.push({ e: selected, v });
      update();
    } }, v);
    keys.push(key);
  }
  pad.append(...keys);

  function paintResults() {
    clear(results);
    verdict.hidden = hand.length === 0;
    verdict.dataset.tone = 'none';
    if (hand.length < deck.minSpellSize) {
      verdict.textContent = t(C + 'tooFew', { n: deck.minSpellSize });
      resultsPanel.hidden = true;
      return;
    }
    const found = findSpells(hand, deck, points);
    resultsPanel.hidden = !found.length;
    if (!found.length) {
      verdict.textContent = t(C + 'none');
      return;
    }
    const whole = wholeHandSpell(hand, found);
    const best = whole || found[0];
    const summary = { n: hand.length, spell: RULES.spells[best.kind].name, size: t('components', { n: best.size }), pts: t('pts', { n: best.rp }) };
    verdict.dataset.tone = whole ? 'whole' : 'none';
    verdict.textContent = whole ? t(C + 'whole', summary) : t(C + 'largest', summary);
    const order = [];
    for (const r of found) if (!order.includes(r.kind)) order.push(r.kind);
    let usesWild = false;
    for (const group of groupByKind(found, order)) {
      for (const r of group.spells) {
        if (r.uses.some((c) => c.e === WILD)) usesWild = true;
        results.append(h('div', { class: 'ax-result' },
          h('div', { class: 'ax-result-head' },
            h('span', { class: 'ax-result-name' }, RULES.spells[r.kind].name),
            h('span', { class: 'ax-result-size' }, t('components', { n: r.size })),
            h('span', { class: 'ax-result-pts' }, t('pts', { n: r.rp })),
          ),
          chips(r.uses),
          h('p', { class: 'ax-result-effect' }, effectLine(r.kind, r.size)),
        ));
      }
    }
    if (usesWild) results.append(h('p', { class: 'ax-note' }, t(C + 'wildNote')));
  }

  const resultsPanel = h('section', { class: 'ax-panel ax-results', 'aria-label': t(C + 'results') }, h('span', { class: 'ax-label' }, t(C + 'results')), results);

  function update() {
    store.set('hand', hand);
    clear(tray).append(hand.length
      ? chips(hand, (card) => ({ label: t(C + 'remove', { card: cardName(card) }), onclick: () => { hand.splice(hand.indexOf(card), 1); update(); } }))
      : h('p', { class: 'ax-note' }, t(C + 'empty')));
    clearBtn.hidden = !hand.length;
    energyButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.e === selected)));
    wildLabel.textContent = t(C + 'wildCount', { n: wildCount(), max: deck.wilds });
    wildButton.disabled = wildCount() >= deck.wilds;
    pad.setAttribute('aria-label', t(C + 'pickValue', { energy: energy(selected).name }));
    keys.forEach((key, i) => {
      const v = deck.minValue + i;
      const on = has(selected, v) >= 0;
      key.setAttribute('aria-pressed', String(on));
      key.setAttribute('aria-label', t(on ? C + 'remove' : C + 'add', { card: cardName({ e: selected, v }) }));
    });
    paintResults();
  }
  update();

  const strip = store.get('firstGameSeen', false) ? null : h('div', { class: 'ax-firstgame' },
    h('a', { href: url('learn/index.html') }, t('play.firstGame')),
    h('button', { type: 'button', class: 'ax-btn ax-btn-quiet', 'aria-label': t('play.firstGameDismiss'), onclick: (e) => { store.set('firstGameSeen', true); e.currentTarget.parentNode.remove(); } }, '✕'),
  );

  return [
    strip,
    head(t(C + 'title'), players()),
    h('div', { class: 'ax-stack' },
      h('div', { class: 'ax-panel ax-handpanel' }, h('div', { class: 'ax-row ax-row-between' }, h('span', { class: 'ax-label' }, t(C + 'hand')), clearBtn), tray, verdict),
      h('div', { class: 'ax-stack-sm' }, energyRow, pad),
      resultsPanel,
      more('spells'),
    ),
  ];
}

// ── Spells ──────────────────────────────────────────────────────────────────────────
function viewSpells() {
  const W = RULES.wildRule;
  return [
    head(t('play.spells.title'), players()),
    h('div', null, RULES.spellOrder.map((kind) => spellTile(kind, getGroup()))),
    h('details', { class: 'ax-disc', id: 'wilds', style: 'margin-top:8px' },
      h('summary', null,
        h('span', { class: 'ax-spell-pattern', 'aria-hidden': 'true' }, RULES.wild.glyph),
        h('span', { class: 'ax-disc-head' }, h('span', { class: 'ax-disc-title' }, t('play.spells.wilds')), h('span', { class: 'ax-disc-sub' }, t('play.spells.wildsSub')))),
      h('div', { class: 'ax-disc-body' },
        h('ul', null, W.lines.map((line) => h('li', null, rich(line)))),
        callout('clarification', W.enchantmentConsequence),
        more('wilds'),
      ),
    ),
    explainerMount('spells'),
  ];
}

// ── Turn (Normal / Drought) ─────────────────────────────────────────────────────────
function viewTurn(mode) {
  const T = 'play.turn.';
  const g = groupById(getGroup());
  const toggle = segmented({
    label: t(T + 'modeLabel'),
    options: [{ value: 'normal', label: t(T + 'normal') }, { value: 'drought', label: t(T + 'drought') }],
    value: mode,
    onChange: (value) => { location.hash = value === 'drought' ? 'drought' : 'turn'; },
  });
  const capacity = h('details', { class: 'ax-disc', id: 'counters' },
    h('summary', null, h('span', { class: 'ax-disc-head' }, h('span', { class: 'ax-disc-title' }, t(T + 'capacity')), h('span', { class: 'ax-disc-sub' }, t(T + 'capacitySub')))),
    h('div', { class: 'ax-disc-body' },
      h('ul', null, RULES.capacity.lines.map((line) => h('li', null, rich(line)))),
      h('p', null, t(T + 'start', { counters: t('counters', { n: g.startingCounters }) }) + ' (' + t('players.' + g.id) + ' ' + t('players.suffix') + ')'),
      ladderTable(getGroup()),
      h('ul', null, RULES.capacity.timing.map((line) => h('li', null, rich(line)))),
      more('counters'),
      explainerMount('counters'),
    ),
  );
  if (mode === 'drought') {
    const D = RULES.drought;
    return [
      head(t(T + 'title'), toggle),
      h('div', { class: 'ax-stack' },
        h('div', { class: 'ax-panel ax-stack-sm' },
          h('span', { class: 'ax-label' }, t(T + 'begun')),
          h('p', null, h('strong', null, D.trigger)),
          h('ol', null, D.steps.map((s) => h('li', null, rich(s)))),
        ),
        turnSteps('drought', true),
        h('p', { class: 'ax-note' }, t(T + 'mark')),
        h('div', null, h('h2', { class: 'ax-label' }, t(T + 'learning')), h('div', { style: 'margin-top:8px' }, learningActions(false))),
        capacity,
        h('div', { class: 'ax-panel ax-stack-sm' }, h('span', { class: 'ax-label' }, t(T + 'why')), whyNoCasting()),
        h('div', { class: 'ax-panel ax-stack-sm' }, h('span', { class: 'ax-label' }, t(T + 'ends')), h('p', null, rich(D.end)), h('a', { class: 'ax-more', href: '#score' }, t('play.score.title') + ' →')),
        more('drought-turn'),
        explainerMount('drought-turn'),
      ),
    ];
  }
  return [
    head(t(T + 'title'), toggle),
    h('div', { class: 'ax-stack' },
      turnSteps('normal', true),
      variantNotes('collection'),
      h('p', { class: 'ax-note' }, t(T + 'mark')),
      h('div', null, h('h2', { class: 'ax-label' }, t(T + 'learning')), h('div', { style: 'margin-top:8px' }, learningActions(false))),
      capacity,
      h('div', { class: 'ax-panel' }, h('span', { class: 'ax-label' }, t(T + 'reminders')), reminders()),
      more('normal-turn'),
      explainerMount('normal-turn'),
    ),
  ];
}

// ── Score ───────────────────────────────────────────────────────────────────────────
function viewScore() {
  const S = 'play.score.';
  const tableSlot = h('div');
  const paintTable = (hit) => clear(tableSlot).append(scoreTable(getGroup(), hit));
  const calculator = scoreCalculator(paintTable);
  return [
    head(t(S + 'title'), players()),
    h('div', { class: 'ax-stack' },
      tableSlot,
      RULES.status === 'under-test' ? callout('under-test', t('badge.under-test', { version: RULES.version }) + '.') : null,
      h('p', { class: 'ax-note' }, h('strong', null, t(S + 'tiebreak') + ': '), RULES.tiebreakers.join(' → ')),
      h('section', { class: 'ax-panel', id: 'score-calculator' }, h('h2', { class: 'ax-label' }, t(S + 'calc')), calculator),
      more('recognition-points'),
    ),
  ];
}

// ── Set-up ──────────────────────────────────────────────────────────────────────────
function viewSetup() {
  const g = groupById(getGroup());
  const deck = RULES.decks[g.deck];
  return [
    head(t('play.setup.title'), players()),
    h('div', { class: 'ax-stack' },
      h('p', null, rich(RULES.goal)),
      h('div', { class: 'ax-panel' }, h('span', { class: 'ax-label' }, t('play.setup.deckFor', { group: t('players.' + g.id) })), setupSteps(g.id)),
      deck.status === 'under-test' ? callout('under-test', deck.statusNote) : null,
      h('div', null, h('h2', { class: 'ax-label' }, t('play.setup.energies')), h('div', { style: 'margin-top:8px' }, energyLegend(g.id))),
      h('div', { class: 'ax-panel' }, h('span', { class: 'ax-label' }, t('play.turn.reminders')), reminders()),
      h('a', { class: 'ax-more', href: url('learn/index.html') }, t('play.setup.firstGame') + ' →'),
      more('set-up'),
    ),
  ];
}

// ── Router ──────────────────────────────────────────────────────────────────────────
const VIEWS = { check: viewCheck, spells: viewSpells, turn: () => viewTurn('normal'), score: viewScore, 'set-up': viewSetup };

function tabFor(raw) {
  if (TABS.includes(raw)) return raw;
  if (raw === 'drought') return 'turn';
  if (raw === 'counters' || RULES.learning.some((a) => a.key === raw)) return 'turn';
  if (raw === 'wilds' || raw.startsWith('spell-')) return 'spells';
  if (raw === 'score-calculator') return 'score';
  return ALIAS[raw] || 'check';
}

function route(focus) {
  const raw = decodeURIComponent(location.hash.slice(1));
  const tab = tabFor(raw);
  const view = raw === 'drought' ? () => viewTurn('drought') : VIEWS[tab];
  clear(main).append(h('div', { class: 'ax-view', id: 'view-' + tab }, view()));
  clear(tabsNav).append(...TABS.map((key) => h('a', { href: '#' + key, 'aria-current': key === tab ? 'true' : null }, t('play.tabs.' + key))));
  // A deep link to something inside a view (#counters, #unlearn, #wilds…): open and show it.
  const inner = raw !== tab && raw !== 'drought' ? document.getElementById(raw) : null;
  if (inner) {
    if (inner.tagName === 'DETAILS') inner.open = true;
    inner.scrollIntoView({ block: 'start' });
  } else if (focus) {
    window.scrollTo(0, 0);
  }
  if (focus) { main.setAttribute('tabindex', '-1'); main.focus({ preventScroll: true }); }
}

window.addEventListener('hashchange', () => route(true));
onGroup(() => {
  route(false);
  const pressed = main.querySelector('.ax-view-head .ax-seg button[aria-pressed="true"]');
  if (pressed) pressed.focus({ preventScroll: true });
});
tabsNav.setAttribute('aria-label', t('play.tabsLabel'));
route(false);
