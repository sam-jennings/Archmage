/* =========================================================================
 * Archmage Ascension — interactive UI (vanilla JS, no build step)
 * Hot-seat play for 2-7 wizards; any seat can be handed to the AI.
 * ========================================================================= */
(function () {
  'use strict';
  const E = window.Archmage;
  const AI = window.ArchmageAI;
  const SAVE_KEY = 'archmage-game-v2';

  const GLYPH = { radiance: '✦', void: '●', flux: '◆', aether: '❖', wild: '★' };
  const SUIT_ORDER = { radiance: 0, void: 1, flux: 2, aether: 3, wild: 4 };
  const AI_NAMES = ['Archon', 'Lyra', 'Thessaly', 'Morvane', 'Quillon', 'Iskra', 'Vex'];
  const PHASE_LABEL = { binding: 'Binding', collection: 'Collection', casting: 'Casting', learning: 'Learning' };

  let G = null; // engine state
  const UI = {
    screen: 'title',
    setup: defaultSetup(),
    sel: new Set(), selArray: null, selSpell: null,
    error: null,
    showRecall: false,
    reshape: null,
    confirm: null,           // { text, warn, action }
    confirmedFor: null,      // seat that has passed the pass-screen
    menuOpen: false, helpOpen: false, logOpen: false,
    oppView: null,
    fastAI: false,
    aiTimer: null, aiSteps: 0, aiKey: ''
  };

  function defaultSetup() {
    const seats = [];
    for (let i = 0; i < 7; i++) {
      seats.push({ name: i === 0 ? 'Wizard 1' : AI_NAMES[i - 1], isAI: i !== 0 });
    }
    return { count: 2, seats };
  }

  /* ---------------- persistence ---------------- */
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ state: G })); } catch (e) { /* private mode */ }
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data && data.state && data.state.v === 1 ? data.state : null;
    } catch (e) { return null; }
  }
  function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
  }

  /* ---------------- helpers ---------------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function curP() { return G.players[G.current]; }
  function humans() { return G.players.filter(p => !p.isAI).length; }
  function needsPass() {
    return G && G.phase !== 'over' && !curP().isAI && humans() >= 2 && UI.confirmedFor !== G.current;
  }
  function actionsLeft() {
    const cap = E.capacity(curP());
    return cap === Infinity ? Infinity : Math.max(0, cap - G.turn.learnUsed);
  }
  function sortedHand(p) {
    return p.hand.slice().sort((a, b) =>
      SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit] || a.value - b.value);
  }
  function selectedCards() {
    return curP().hand.filter(c => UI.sel.has(c.id));
  }
  function clearSel() { UI.sel.clear(); UI.selArray = null; UI.selSpell = null; }

  function act(action) {
    UI.error = null;
    const r = E.dispatch(G, action);
    if (!r.ok) { UI.error = r.error; render(); return false; }
    clearSel();
    save();
    render();
    return true;
  }

  /* ---------------- card / spell rendering ---------------- */
  function cardHTML(c, o) {
    o = o || {};
    const cls = ['card', 'suit-' + c.suit];
    if (o.mini) cls.push('mini');
    if (o.sel) cls.push('sel');
    if (o.locked) cls.push('locked');
    if (o.disabled) cls.push('disabled');
    const clickable = o.action && !o.disabled && !o.locked;
    const tag = clickable ? 'button' : 'div';
    const data = clickable ? ' data-action="' + o.action + '" data-card="' + c.id + '"' : '';
    let asNote = '';
    if (c.suit === 'wild' && o.decl && o.decl[c.id]) {
      const d = o.decl[c.id];
      asNote = '<span class="as">as ' + (d.suit !== 'wild' ? GLYPH[d.suit] : '') + d.value + '</span>';
    }
    const v = c.suit === 'wild' ? '★' : c.value;
    return '<' + tag + ' class="' + cls.join(' ') + '"' + data +
      ' aria-label="' + esc(E.cardLabel(c, o.decl)) + '">' +
      '<span class="cv">' + v + '</span><span class="cs">' + GLYPH[c.suit] + '</span>' +
      asNote + '</' + tag + '>';
  }

  function spellHTML(spell, o) {
    o = o || {};
    const pts = E.spellPoints(spell.type, spell.cards.length);
    const castMark = !o.foreign && G.turn.castSpellIds.indexOf(spell.id) >= 0
      ? '<span class="counter-token">● cast</span>' : '';
    let castBtn = '';
    if (o.castButton) {
      const info = E.castInfo(G, spell);
      if (info.castable) {
        castBtn = '<button class="btn small primary" data-action="cast" data-spell="' + spell.id + '">Cast</button>';
      }
    }
    const selectable = o.selectable ? ' data-action="sel-spell" data-spell="' + spell.id + '"' : '';
    const cards = spell.cards.map(c => cardHTML(c, { mini: true, decl: spell.decl })).join('');
    return '<div class="spell' + (o.sel ? ' sel' : '') + '">' +
      '<div class="spell-head"' + selectable + '>' +
      '<span class="type-badge t-' + spell.type + '">' + E.TYPE_LABEL[spell.type] + '</span>' +
      '<span class="pts">' + spell.cards.length + ' cards · ' + pts + ' RP</span>' +
      castMark +
      (castBtn ? '<span style="margin-left:auto">' + castBtn + '</span>' : '') +
      '</div>' +
      '<div class="spell-cards"' + selectable + '>' + cards + '</div>' +
      '</div>';
  }

  /* ---------------- title screen ---------------- */
  function renderTitle() {
    const saved = loadSave();
    const s = UI.setup;
    const spec = E.deckSpec(s.count);
    const deckSize = s.count <= 4 ? 62 : 84;
    let seatRows = '';
    for (let i = 0; i < s.count; i++) {
      const seat = s.seats[i];
      seatRows +=
        '<div class="seat-row">' +
        '<span class="seat-no">' + (i + 1) + '</span>' +
        '<input data-field="seat-name" data-i="' + i + '" maxlength="16" value="' + esc(seat.name) + '" aria-label="Player ' + (i + 1) + ' name">' +
        '<span class="seg">' +
        '<button data-action="seat-type" data-i="' + i + '" data-ai="0" class="' + (!seat.isAI ? 'on' : '') + '">Human</button>' +
        '<button data-action="seat-type" data-i="' + i + '" data-ai="1" class="' + (seat.isAI ? 'on' : '') + '">AI</button>' +
        '</span></div>';
    }
    let counts = '';
    for (let n = 2; n <= 7; n++) {
      counts += '<button class="count-btn' + (s.count === n ? ' on' : '') + '" data-action="count" data-n="' + n + '">' + n + '</button>';
    }
    const continueBtn = saved
      ? '<button class="btn primary" data-action="continue">Continue contest · turn ' +
        saved.turnNumber + ' · ' + saved.players.length + ' wizards</button>'
      : '';
    return '<div class="screen title-screen">' +
      '<div class="eyebrow">A Wizards’ Contest</div>' +
      '<h1>Archmage Ascension</h1>' +
      '<p class="tagline">The Source is failing. Weave components into your Spellbook — when the last reserves run dry, the magic converges on the strongest wizard.</p>' +
      '<div class="start-row">' + continueBtn + '</div>' +
      '<div class="setup-panel">' +
      '<h2>New Contest</h2>' +
      '<div class="count-row"><span class="hint">Wizards:</span>' + counts + '</div>' +
      '<p class="deck-note">' + s.count + ' players · components 1–' + spec.maxValue +
      ' in four energies + ' + spec.wilds + ' wilds (' + deckSize + ' cards)</p>' +
      '<div>' + seatRows + '</div>' +
      '<div class="start-row">' +
      '<button class="btn primary" data-action="start">Begin the Contest</button>' +
      '<button class="btn" data-action="help">How to Play</button>' +
      '</div></div>' +
      '</div>' + (UI.helpOpen ? helpOverlay() : '');
  }

  /* ---------------- game screen ---------------- */
  function renderGame() {
    const p = curP();
    const phaseTxt = 'Turn ' + G.turnNumber + ' · ' + (PHASE_LABEL[G.phase] || G.phase);
    const piles = G.drought
      ? '<div class="pile">Released Reserve <b>' + G.source.length + '</b></div>'
      : '<div class="pile">Source <b>' + G.source.length + '</b></div>' +
        '<div class="pile">Reserve <b>' + G.reserve.length + '</b></div>';

    const topbar =
      '<header class="topbar">' +
      '<button class="iconbtn" data-action="menu" aria-label="Menu">☰</button>' +
      '<span class="phase-chip' + (G.drought ? ' drought' : '') + '">' +
      phaseTxt + (G.drought ? ' · Drought' : '') + '</span>' +
      '<span class="spacer"></span>' + piles +
      '</header>';

    let arrayRow;
    if (G.drought) {
      arrayRow = '<div class="array-row"><span class="drought-note">The Drought — the Array has dissolved. Draw from the Released Reserve and refine your Spellbook.</span></div>';
    } else {
      const canPick = isHumanTurn() &&
        ((G.phase === 'collection') || (G.phase === 'casting' && G.pending));
      const cards = G.array.map(c => cardHTML(c, {
        action: canPick ? 'sel-array' : null,
        sel: UI.selArray === c.id
      })).join('');
      arrayRow = '<div class="array-row"><span class="zone-label">The Array</span>' +
        '<div class="array-cards">' + cards + '</div></div>';
    }

    const chips = G.players.map((pl, i) => {
      const sc = E.playerScore(pl).total;
      const cap = E.capacity(pl);
      return '<button class="opp-chip' + (i === G.current ? ' active' : '') + '" data-action="opp-view" data-i="' + i + '">' +
        '<span class="o-name">' + esc(pl.name) + (pl.isAI ? ' <span class="ai-tag">AI</span>' : '') + '</span>' +
        '<span class="o-stats"><b>' + sc + '</b> RP · ' + pl.spellbook.length + ' spells</span>' +
        '<span class="o-stats">' + pl.hand.length + ' in hand · cap ' + E.fmtCap(cap) + '</span>' +
        '</button>';
    }).join('');

    const board =
      '<main class="board"><div class="board-inner">' +
      promptHTML() + spellbookHTML() +
      '</div></main>';

    return '<div class="game">' + topbar + arrayRow +
      '<div class="opponents">' + chips + '</div>' +
      board + handbarHTML() + overlaysHTML() + '</div>';
  }

  function isHumanTurn() {
    return !curP().isAI && !needsPass();
  }

  function promptHTML() {
    const p = curP();
    if (p.isAI) {
      return '<div class="prompt"><div class="p-title">' + esc(p.name) + ' is taking their turn…</div>' +
        '<div class="p-text ai-banner">' + (PHASE_LABEL[G.phase] || '') + '</div>' +
        '<div class="p-actions"><button class="btn small" data-action="fastai">' +
        (UI.fastAI ? '⏵ Normal speed' : '⏩ Fast-forward AI') + '</button></div></div>';
    }
    const err = UI.error ? '<div class="p-error">' + esc(UI.error) + '</div>' : '';
    let title = PHASE_LABEL[G.phase] || '';
    let text = '', actions = '', extra = '';

    if (G.phase === 'binding') {
      title = 'Binding to the Arcane Reserve';
      text = 'Choose 1 component from your hand to bind into the Arcane Reserve.';
      const c = selectedCards()[0];
      actions = '<button class="btn primary" data-action="bind-confirm"' + (UI.sel.size === 1 ? '' : ' disabled') + '>' +
        (c ? 'Bind ' + esc(E.cardLabel(c)) : 'Bind selected component') + '</button>';
    } else if (G.phase === 'collection') {
      if (G.drought) {
        text = 'Draw 1 component from the Released Reserve (' + G.source.length + ' left).';
        actions = '<button class="btn primary" data-action="collect-source">Draw from the Released Reserve</button>';
      } else {
        text = 'Draw 1 from the Source, or take a face-up component from the Array (it is replaced from the Source).';
        actions = '<button class="btn' + (UI.selArray ? '' : ' primary') + '" data-action="collect-source">Draw from the Source</button>';
        if (UI.selArray) {
          const c = G.array.find(x => x.id === UI.selArray);
          actions += '<button class="btn primary" data-action="collect-array-confirm">Take ' + esc(E.cardLabel(c)) + '</button>';
        } else {
          extra = '<div class="hint">Tap an Array card above to take it instead.</div>';
        }
      }
    } else if (G.phase === 'casting') {
      const cap = E.capacity(p);
      if (G.pending) {
        const need = G.pending.need;
        title = 'Exchange with the Array';
        text = 'Discard ' + need + ' card' + (need === 1 ? '' : 's') + ' from your hand (' +
          UI.sel.size + '/' + need + ' selected), then choose 1 Array card to take' +
          (UI.selArray ? ' ✓' : '') + '.';
        actions =
          '<button class="btn primary" data-action="exchange-confirm"' +
          (UI.sel.size === need && UI.selArray ? '' : ' disabled') + '>Complete exchange</button>' +
          (G.pending.canCancel ? '<button class="btn ghost" data-action="exchange-cancel">Take back the casting</button>' : '');
      } else {
        text = 'Place counters to cast spells — effects resolve immediately. ' +
          G.turn.spellsCast + ' of ' + E.fmtCap(cap) + ' counters placed.';
        const anyCastable = p.spellbook.some(s => E.castInfo(G, s).castable);
        if (!anyCastable) {
          extra = '<div class="hint">' + (p.spellbook.length
            ? 'No spells can be cast right now.'
            : 'Your Spellbook is empty — learn spells in the Learning phase.') + '</div>';
        }
        actions = '<button class="btn primary" data-action="end-casting">' +
          (G.turn.spellsCast > 0 ? 'End casting · Recall counters' : 'Continue to Learning') + '</button>';
      }
    } else if (G.phase === 'learning') {
      const left = actionsLeft();
      text = 'Learning actions: ' + (left === Infinity ? 'unlimited' : left + ' remaining') +
        '. Each Learn / Empower / Reshape / Unlearn costs 1 action.';
      const selCards = selectedCards();
      const spell = UI.selSpell ? p.spellbook.find(s => s.id === UI.selSpell) : null;
      const noActs = left !== Infinity && left <= 0;

      if (spell && selCards.length >= 1) {
        const opts = E.validTypes(spell.cards.concat(selCards), G.maxValue);
        if (opts.length) {
          actions = opts.map(o =>
            '<button class="btn primary" data-action="empower" data-type="' + o.type + '"' + (noActs ? ' disabled' : '') + '>Empower → ' +
            o.size + '-card ' + E.TYPE_LABEL[o.type] + ' · ' + o.points + ' RP</button>').join('');
        } else {
          extra = '<div class="hint">Those cards don’t extend this spell into any valid pattern.</div>';
        }
      } else if (spell) {
        extra = '<div class="hint">Select cards from your hand to Empower this spell, or unlearn it.</div>';
        const warn = spell.type === 'enchantment'
          ? (spell.cards.length >= 4 ? ' (loses Unlimited capacity)' : ' (loses 1 counter)') : '';
        actions = '<button class="btn danger" data-action="unlearn"' + (noActs ? ' disabled' : '') + '>Unlearn' + warn + '</button>';
      } else if (selCards.length >= 3) {
        const opts = E.validTypes(selCards, G.maxValue);
        if (opts.length) {
          actions = opts.map(o =>
            '<button class="btn primary" data-action="learn" data-type="' + o.type + '"' + (noActs ? ' disabled' : '') + '>Learn ' +
            o.size + '-card ' + E.TYPE_LABEL[o.type] + ' · ' + o.points + ' RP</button>').join('');
        } else {
          extra = '<div class="hint">Not a valid spell: needs 3+ of one energy, 3+ in sequence, or 3–4 of one value.</div>';
        }
      } else {
        extra = '<div class="hint">Select 3+ hand cards to Learn a spell, or tap a spell in your Spellbook to Empower / Unlearn it.</div>';
      }
      actions += '<button class="btn" data-action="reshape-open"' +
        (noActs || !p.spellbook.length ? ' disabled' : '') + '>Reshape…</button>' +
        '<button class="btn' + (actions.indexOf('primary') < 0 ? ' primary' : '') + '" data-action="end-turn">End turn</button>';
    }

    return '<div class="prompt"><div class="p-title">' + title + '</div>' +
      '<div class="p-text">' + text + '</div>' + extra + err +
      '<div class="p-actions">' + actions + '</div></div>';
  }

  function spellbookHTML() {
    const p = curP();
    const showCast = isHumanTurn() && G.phase === 'casting' && !G.pending;
    const selectable = isHumanTurn() && G.phase === 'learning' && !UI.reshape;
    const total = E.playerScore(p).total;
    const spells = p.spellbook.length
      ? p.spellbook.map(s => spellHTML(s, {
          castButton: showCast,
          selectable,
          sel: UI.selSpell === s.id
        })).join('')
      : '<div class="empty-book">No spells learned yet — your Spellbook awaits.</div>';
    return '<div class="spellbook">' +
      '<div class="sb-head"><span>' + esc(p.name) + '’s Spellbook</span>' +
      '<span class="sb-pts">' + total + ' RP</span></div>' + spells + '</div>';
  }

  function handbarHTML() {
    const p = curP();
    const cap = E.capacity(p);
    let capHTML;
    if (cap === Infinity) {
      capHTML = '<span class="cap-inf">∞ Unlimited capacity</span>';
    } else {
      const used = G.phase === 'casting' ? G.turn.spellsCast :
        G.phase === 'learning' ? G.turn.learnUsed : 0;
      let dots = '';
      for (let i = 0; i < Math.min(cap, 10); i++) {
        dots += '<span class="cap-dot' + (i < used ? ' used' : '') + '">●</span>';
      }
      capHTML = '<span class="caps">' + dots + (cap > 10 ? ' ×' + cap : '') + '</span> ' +
        '<span>capacity ' + cap + '</span>';
    }
    if (!isHumanTurn()) {
      const backs = p.hand.map(() => '<div class="card cardback"></div>').join('');
      return '<footer class="handbar">' +
        '<div class="hand-info"><span class="hi-name">' + esc(p.name) + '</span>' +
        '<span>' + p.hand.length + ' cards in hand</span>' + capHTML + '</div>' +
        '<div class="hand">' + backs + '</div></footer>';
    }
    const selectableHand =
      G.phase === 'binding' ||
      (G.phase === 'casting' && G.pending) ||
      G.phase === 'learning';
    const cards = sortedHand(p).map(c => cardHTML(c, {
      action: selectableHand ? 'sel-hand' : null,
      sel: UI.sel.has(c.id),
      locked: G.phase === 'learning' && p.locked.indexOf(c.id) >= 0
    })).join('');
    return '<footer class="handbar">' +
      '<div class="hand-info"><span class="hi-name">' + esc(p.name) + '</span>' +
      '<span>' + p.hand.length + ' in hand</span>' + capHTML + '</div>' +
      '<div class="hand">' + cards + '</div></footer>';
  }

  /* ---------------- overlays ---------------- */
  function overlaysHTML() {
    if (G.notice) {
      return '<div class="overlay"><div class="dialog recall-dialog">' +
        '<h2>' + esc(G.notice.title) + '</h2><p>' + esc(G.notice.body) + '</p>' +
        '<div class="d-actions"><button class="btn primary" data-action="notice-ok">Continue</button></div>' +
        '</div></div>';
    }
    if (needsPass()) {
      return '<div class="overlay opaque"><div class="dialog pass-dialog">' +
        '<p>Pass the device to</p><div class="pd-name">' + esc(curP().name) + '</div>' +
        '<p class="hint">Only ' + esc(curP().name) + ' should see the next screen.</p>' +
        '<div class="d-actions"><button class="btn primary" data-action="pass-begin">I am ' +
        esc(curP().name) + ' — begin</button></div></div></div>';
    }
    if (UI.showRecall) {
      const n = G.turn.spellsCast;
      let tokens = '';
      for (let i = 0; i < Math.min(n, 5); i++) tokens += '<span>●</span>';
      return '<div class="overlay"><div class="dialog recall-dialog">' +
        '<h2>Recall</h2>' +
        '<div class="recall-tokens">' + tokens + '</div>' +
        '<p>Pick up the ' + n + ' counter' + (n === 1 ? '' : 's') + ' from your cast spells. ' +
        'Counters are capacity, not fuel — the same counters now power your learning actions.</p>' +
        '<div class="d-actions"><button class="btn primary" data-action="recall-confirm">Recall counters</button></div>' +
        '</div></div>';
    }
    if (UI.confirm) {
      return '<div class="overlay"><div class="dialog">' +
        '<h2>Are you sure?</h2><p>' + esc(UI.confirm.text) + '</p>' +
        '<div class="d-actions">' +
        '<button class="btn" data-action="confirm-no">Cancel</button>' +
        '<button class="btn ' + (UI.confirm.warn ? 'danger' : 'primary') + '" data-action="confirm-yes">Confirm</button>' +
        '</div></div></div>';
    }
    if (UI.reshape) return reshapeOverlay();
    if (UI.oppView != null) return oppOverlay();
    if (UI.helpOpen) return helpOverlay();
    if (UI.logOpen) return logOverlay();
    if (UI.menuOpen) return menuOverlay();
    return '';
  }

  function menuOverlay() {
    return '<div class="overlay"><div class="dialog">' +
      '<h2>Archmage Ascension</h2>' +
      '<div class="d-actions" style="justify-content:flex-start;flex-direction:column;align-items:stretch">' +
      '<button class="btn" data-action="help">How to play</button>' +
      '<button class="btn" data-action="log">View log</button>' +
      '<button class="btn" data-action="fastai">' + (UI.fastAI ? 'AI speed: fast ⏩' : 'AI speed: normal ⏵') + '</button>' +
      '<button class="btn danger" data-action="abandon">Abandon contest</button>' +
      '<button class="btn primary" data-action="menu-close">Back to the game</button>' +
      '</div></div></div>';
  }

  function logOverlay() {
    const lines = G.log.slice(-120).reverse().map(l =>
      '<div class="log-line' + (l.p == null ? ' sys' : '') + '">' + esc(l.msg) + '</div>').join('');
    return '<div class="overlay"><div class="dialog wide">' +
      '<h2>Contest Log</h2><div class="log-list">' + lines + '</div>' +
      '<div class="d-actions"><button class="btn primary" data-action="log-close">Close</button></div>' +
      '</div></div>';
  }

  function oppOverlay() {
    const pl = G.players[UI.oppView];
    if (!pl) { UI.oppView = null; return ''; }
    const sc = E.playerScore(pl);
    const spells = pl.spellbook.length
      ? pl.spellbook.map(s => spellHTML(s, { foreign: true })).join('')
      : '<div class="empty-book">No spells learned yet.</div>';
    return '<div class="overlay"><div class="dialog wide">' +
      '<h2>' + esc(pl.name) + (pl.isAI ? ' (AI)' : '') + ' — Spellbook</h2>' +
      '<p>' + sc.total + ' RP · ' + pl.spellbook.length + ' spells · ' + pl.hand.length +
      ' cards in hand · capacity ' + E.fmtCap(E.capacity(pl)) + '</p>' +
      '<div class="spellbook">' + spells + '</div>' +
      '<div class="d-actions"><button class="btn primary" data-action="opp-close">Close</button></div>' +
      '</div></div>';
  }

  function helpOverlay() {
    const maxV = G ? G.maxValue : 15;
    let scoreRows = '';
    for (let n = 3; n <= 8; n++) {
      scoreRows += '<tr><td>' + n + '</td><td>' + E.spellPoints('conjuration', n) + '</td><td>' +
        E.spellPoints('transfiguration', n) + '</td><td>' + E.spellPoints('perfect', n) + '</td><td>' +
        (n <= 4 ? E.spellPoints('enchantment', n) : '—') + '</td></tr>';
    }
    return '<div class="overlay"><div class="dialog wide">' +
      '<h2>How to Play</h2>' +
      '<p>Build the most masterful Spellbook before the magic runs out. Components have an energy (' +
      '<span style="color:var(--radiance)">✦ Radiance</span>, <span style="color:var(--void)">● Void</span>, ' +
      '<span style="color:var(--flux)">◆ Flux</span>, <span style="color:var(--aether)">❖ Aether</span>) ' +
      'and a value (1–' + maxV + '). ★ Wilds stand in for any component.</p>' +
      '<h3>Your turn</h3>' +
      '<p><b>1 · Collection</b> — draw 1 from the Source, or take 1 face-up Array card (replaced from the Source).<br>' +
      '<b>2 · Casting</b> — place a counter on a spell to cast it; effects resolve immediately. You can cast as many spells as you have counters (each spell once per turn).<br>' +
      '<b>3 · Recall</b> — pick all counters back up. They are capacity, not fuel.<br>' +
      '<b>4 · Learning</b> — spend 1 counter per action: <b>Learn</b> a new spell from your hand, <b>Empower</b> (add cards to a spell), <b>Reshape</b> (rebuild spells from their own components), or <b>Unlearn</b> (return a spell to hand; its cards are locked until your next turn).</p>' +
      '<h3>Spell types</h3>' +
      '<p><b>Conjuration</b> — 3+ cards of one energy, any values. Cast: draw +1 from the Source (+2 if 6+ cards).<br>' +
      '<b>Transfiguration</b> — 3+ consecutive values, any energies. Cast: discard 2 → take 1 Array card (discard only 1 if 4+ cards).<br>' +
      '<b>Enchantment</b> — 3–4 cards of one value, different energies. Never cast; always active. 3 cards: +1 counter. 4 cards: unlimited capacity.<br>' +
      '<b>Perfect Transmutation</b> — 3+ consecutive values of one energy. Cast: both Conjuration and Transfiguration effects (both mandatory).</p>' +
      '<h3>The Drought & the end</h3>' +
      '<p>The instant the Source empties, the Array and the discard pile (Arcane Reserve) shuffle into the <b>Released Reserve</b>. No more casting: each turn you draw 1 from the Released Reserve and take your learning actions. When the Released Reserve is depleted the contest ends immediately and Spellbooks are scored.</p>' +
      '<h3>Recognition Points</h3>' +
      '<table class="rules"><tr><th>Size</th><th>Conjuration</th><th>Transfiguration</th><th>Perfect</th><th>Enchantment</th></tr>' +
      scoreRows + '</table>' +
      '<p class="hint">Larger spells keep scaling beyond 8 cards. Tiebreakers: most spells, then most cards in your largest spell.</p>' +
      '<p class="hint">Playing with a physical deck? ♠ Radiance · ♥ Void · ♦ Flux · ♣ Aether.</p>' +
      '<div class="d-actions"><button class="btn primary" data-action="help-close">Close</button></div>' +
      '</div></div>';
  }

  /* ---------------- reshape builder ---------------- */
  function reshapeOverlay() {
    const p = curP();
    const R = UI.reshape;
    if (R.stage === 'pick') {
      const rows = p.spellbook.map(s => {
        const on = R.dissolve.has(s.id);
        return '<div class="group-row' + (on ? '' : '') + '" style="' + (on ? 'border-color:var(--gold-bright)' : '') + '">' +
          '<button class="btn small' + (on ? ' primary' : '') + '" data-action="rs-toggle" data-spell="' + s.id + '">' +
          (on ? '✓ dissolving' : 'dissolve') + '</button>' +
          '<span class="pts">' + s.cards.length + '-card ' + E.TYPE_LABEL[s.type] + '</span>' +
          s.cards.map(c => cardHTML(c, { mini: true, decl: s.decl })).join('') +
          '</div>';
      }).join('');
      return '<div class="overlay"><div class="dialog wide">' +
        '<h2>Reshape — choose spells to break down</h2>' +
        '<p class="hint">All their components go into one pool; you must rebuild every component into valid spells. Costs 1 learning action.</p>' +
        rows +
        '<div class="d-actions">' +
        '<button class="btn" data-action="rs-cancel">Cancel</button>' +
        '<button class="btn primary" data-action="rs-dissolve"' + (R.dissolve.size ? '' : ' disabled') + '>Dissolve ' +
        R.dissolve.size + ' spell' + (R.dissolve.size === 1 ? '' : 's') + ' →</button>' +
        '</div></div></div>';
    }
    // build stage
    const dissolved = p.spellbook.filter(s => R.dissolve.has(s.id));
    const poolCards = [];
    dissolved.forEach(s => poolCards.push.apply(poolCards, s.cards));
    const grouped = new Set();
    R.groups.forEach(g => g.cardIds.forEach(id => grouped.add(id)));
    const pool = poolCards.filter(c => !grouped.has(c.id));
    const selCards = pool.filter(c => R.sel.has(c.id));
    const opts = selCards.length >= 3 ? E.validTypes(selCards, G.maxValue) : [];
    const groupRows = R.groups.map((g, gi) => {
      const cards = g.cardIds.map(id => poolCards.find(c => c.id === id));
      return '<div class="group-row">' +
        '<span class="type-badge t-' + g.type + '">' + E.TYPE_LABEL[g.type] + '</span>' +
        '<span class="pts">' + E.spellPoints(g.type, g.cardIds.length) + ' RP</span>' +
        cards.map(c => cardHTML(c, { mini: true })).join('') +
        '<button class="btn small ghost" data-action="rs-break" data-gi="' + gi + '">✕</button>' +
        '</div>';
    }).join('');
    // capacity preview
    const keep = p.spellbook.filter(s => !R.dissolve.has(s.id));
    const fake = {
      spellbook: keep.concat(R.groups.map(g => ({
        type: g.type, cards: g.cardIds.map(id => ({ id }))
      })))
    };
    const before = E.capacity(p), after = E.capacity(fake);
    const capCls = after === before ? '' : ((after === Infinity || after > before) ? ' up' : ' warn');
    const capNote = '<span class="cap-delta' + capCls + '">Capacity: ' + E.fmtCap(before) + ' → ' + E.fmtCap(after) + '</span>';
    const formBtns = opts.map(o =>
      '<button class="btn primary small" data-action="rs-form" data-type="' + o.type + '">Form ' +
      o.size + '-card ' + E.TYPE_LABEL[o.type] + ' · ' + o.points + ' RP</button>').join('');
    const errLine = R.error ? '<div class="p-error">' + esc(R.error) + '</div>' : '';
    return '<div class="overlay"><div class="dialog wide">' +
      '<h2>Reshape — rebuild the components</h2>' +
      '<p class="hint">Select pool cards and form spells. Every component must end up in a valid spell.</p>' +
      '<div class="pool-zone">' + (pool.length
        ? pool.map(c => cardHTML(c, { mini: true, action: 'rs-sel', sel: R.sel.has(c.id) })).join('')
        : '<span class="hint">Pool empty — ready to commit.</span>') + '</div>' +
      '<div class="p-actions">' + (formBtns || (selCards.length >= 3
        ? '<span class="hint">Selection is not a valid spell.</span>'
        : '<span class="hint">Select 3+ cards from the pool.</span>')) + '</div>' +
      (groupRows ? '<h3>New spells</h3>' + groupRows : '') +
      errLine +
      '<div class="d-actions">' + capNote +
      '<button class="btn" data-action="rs-back">← Back</button>' +
      '<button class="btn" data-action="rs-cancel">Cancel</button>' +
      '<button class="btn primary" data-action="rs-commit"' +
      (pool.length === 0 && R.groups.length ? '' : ' disabled') + '>Commit reshape · 1 action</button>' +
      '</div></div></div>';
  }

  /* ---------------- score screen ---------------- */
  function renderScore() {
    const r = G.result;
    const winners = r.winners.map(i => G.players[i].name).join(' & ');
    const rows = r.ranking.map((row, i) => {
      const isWin = r.winners.indexOf(row.idx) >= 0;
      const spells = row.spells.length
        ? row.spells
            .slice()
            .sort((a, b) => b.points - a.points)
            .map(s => s.size + '-card ' + E.TYPE_LABEL[s.type] + ' (' + s.points + ')')
            .join(' · ')
        : 'No spells learned';
      return '<div class="score-row' + (isWin ? ' winner' : '') + '">' +
        '<div class="sr-head"><span class="sr-rank">' + (i + 1) + '</span>' +
        '<span class="sr-name">' + esc(row.name) + (row.isAI ? ' <span class="ai-tag hint">AI</span>' : '') + '</span>' +
        '<span class="sr-total">' + row.total + ' RP</span></div>' +
        '<div class="sr-spells">' + spells + '</div></div>';
    }).join('');
    const tieNote = r.tiebreak
      ? '<p class="hint">Tie resolved by: ' + esc(r.tiebreak) + '.</p>' : '';
    return '<div class="screen score-screen">' +
      '<div class="eyebrow" style="font-family:Cinzel,serif;letter-spacing:.4em;color:var(--text-dim)">THE CONTEST ENDS</div>' +
      '<h1>' + esc(winners) + ' ascend' + (r.winners.length > 1 ? '' : 's') + ' to Archmage</h1>' +
      '<p class="winner-sub">The currents stabilise. Magic flows again.</p>' +
      tieNote +
      '<div class="score-table">' + rows + '</div>' +
      '<div class="start-row">' +
      '<button class="btn primary" data-action="score-new">New contest</button>' +
      '<button class="btn" data-action="log">View final log</button>' +
      '</div>' +
      (UI.logOpen ? logOverlay() : '') +
      '</div>';
  }

  /* ---------------- AI driver ---------------- */
  function maybeRunAI() {
    if (!G || G.phase === 'over' || UI.screen !== 'game') return;
    if (!curP().isAI || G.notice) return;
    if (UI.aiTimer) return;
    UI.aiTimer = setTimeout(() => {
      UI.aiTimer = null;
      if (!G || G.phase === 'over' || !curP().isAI || G.notice) { render(); return; }
      const key = G.current + ':' + G.turnNumber;
      if (key !== UI.aiKey) { UI.aiKey = key; UI.aiSteps = 0; }
      UI.aiSteps++;
      let action = UI.aiSteps > 300 ? null : AI.nextAction(G);
      let r = action ? E.dispatch(G, action) : { ok: false, error: 'stalled' };
      if (!r.ok) {
        // defensive recovery — push the turn forward
        if (G.phase === 'casting') E.dispatch(G, { kind: 'finishCasting' });
        else if (G.phase === 'learning') E.dispatch(G, { kind: 'endTurn' });
        else if (G.phase === 'collection') E.dispatch(G, { kind: 'collectSource' });
        else if (G.phase === 'binding') E.dispatch(G, { kind: 'bind', cardId: curP().hand[0].id });
      }
      save();
      render();
    }, UI.fastAI ? 45 : 420);
  }

  /* ---------------- actions ---------------- */
  const ACTIONS = {
    /* title */
    'count': d => { UI.setup.count = +d.n; render(); },
    'seat-type': d => {
      const i = +d.i;
      const seat = UI.setup.seats[i];
      const toAI = d.ai === '1';
      if (seat.isAI !== toAI) {
        // swap default names along with the seat type, but keep custom names
        const isPreset = AI_NAMES.indexOf(seat.name) >= 0 || /^Wizard \d+$/.test(seat.name);
        seat.isAI = toAI;
        if (isPreset) seat.name = toAI ? AI_NAMES[i % AI_NAMES.length] : 'Wizard ' + (i + 1);
      }
      render();
    },
    'start': () => {
      const players = UI.setup.seats.slice(0, UI.setup.count)
        .map((s, i) => ({ name: s.name.trim() || 'Wizard ' + (i + 1), isAI: s.isAI }));
      G = E.newGame({ players });
      UI.screen = 'game';
      UI.confirmedFor = null;
      clearSel();
      save();
      render();
    },
    'continue': () => {
      const s = loadSave();
      if (!s) { render(); return; }
      G = s;
      UI.screen = 'game';
      UI.confirmedFor = null;
      clearSel();
      render();
    },

    /* shared overlays */
    'help': () => { UI.helpOpen = true; UI.menuOpen = false; render(); },
    'help-close': () => { UI.helpOpen = false; render(); },
    'log': () => { UI.logOpen = true; UI.menuOpen = false; render(); },
    'log-close': () => { UI.logOpen = false; render(); },
    'menu': () => { UI.menuOpen = true; render(); },
    'menu-close': () => { UI.menuOpen = false; render(); },
    'fastai': () => { UI.fastAI = !UI.fastAI; UI.menuOpen = false; render(); },
    'abandon': () => {
      UI.confirm = {
        text: 'Abandon this contest? The saved game will be erased.',
        warn: true,
        action: () => { clearSave(); G = null; UI.screen = 'title'; UI.menuOpen = false; }
      };
      UI.menuOpen = false;
      render();
    },
    'confirm-yes': () => {
      const c = UI.confirm; UI.confirm = null;
      if (c && c.action) c.action();
      render();
    },
    'confirm-no': () => { UI.confirm = null; render(); },
    'notice-ok': () => { act({ kind: 'ackNotice' }); },
    'pass-begin': () => { UI.confirmedFor = G.current; clearSel(); UI.error = null; render(); },
    'opp-view': d => { UI.oppView = +d.i; render(); },
    'opp-close': () => { UI.oppView = null; render(); },

    /* selections */
    'sel-hand': d => {
      const id = d.card;
      if (G.phase === 'binding') {
        UI.sel.clear(); UI.sel.add(id);
      } else if (G.phase === 'casting' && G.pending) {
        if (UI.sel.has(id)) UI.sel.delete(id);
        else if (UI.sel.size < G.pending.need) UI.sel.add(id);
      } else if (G.phase === 'learning') {
        if (UI.sel.has(id)) UI.sel.delete(id); else UI.sel.add(id);
      }
      UI.error = null;
      render();
    },
    'sel-array': d => {
      UI.selArray = UI.selArray === d.card ? null : d.card;
      UI.error = null;
      render();
    },
    'sel-spell': d => {
      if (G.phase !== 'learning') return;
      UI.selSpell = UI.selSpell === d.spell ? null : d.spell;
      UI.error = null;
      render();
    },

    /* binding / collection */
    'bind-confirm': () => {
      const id = Array.from(UI.sel)[0];
      if (id) act({ kind: 'bind', cardId: id });
    },
    'collect-source': () => act({ kind: 'collectSource' }),
    'collect-array-confirm': () => act({ kind: 'collectArray', cardId: UI.selArray }),

    /* casting */
    'cast': d => act({ kind: 'cast', spellId: d.spell }),
    'exchange-confirm': () => act({
      kind: 'resolveExchange',
      discardIds: Array.from(UI.sel),
      arrayCardId: UI.selArray
    }),
    'exchange-cancel': () => act({ kind: 'cancelExchange' }),
    'end-casting': () => {
      if (G.turn.spellsCast > 0) { UI.showRecall = true; render(); }
      else act({ kind: 'finishCasting' });
    },
    'recall-confirm': () => { UI.showRecall = false; act({ kind: 'finishCasting' }); },

    /* learning */
    'learn': d => act({ kind: 'learn', cardIds: Array.from(UI.sel), type: d.type }),
    'empower': d => act({
      kind: 'empower', spellId: UI.selSpell,
      cardIds: Array.from(UI.sel), type: d.type
    }),
    'unlearn': () => {
      const p = curP();
      const spell = p.spellbook.find(s => s.id === UI.selSpell);
      if (!spell) return;
      let warn = '';
      if (spell.type === 'enchantment') {
        warn = spell.cards.length >= 4
          ? ' You will lose Unlimited capacity.'
          : ' You will lose 1 counter.';
      }
      UI.confirm = {
        text: 'Unlearn this ' + spell.cards.length + '-card ' + E.TYPE_LABEL[spell.type] +
          '? Its components return to your hand but are locked until your next turn.' + warn,
        warn: !!warn,
        action: () => act({ kind: 'unlearn', spellId: spell.id })
      };
      render();
    },
    'end-turn': () => act({ kind: 'endTurn' }),

    /* reshape */
    'reshape-open': () => {
      UI.reshape = { stage: 'pick', dissolve: new Set(), groups: [], sel: new Set(), error: null };
      render();
    },
    'rs-toggle': d => {
      const R = UI.reshape;
      if (R.dissolve.has(d.spell)) R.dissolve.delete(d.spell); else R.dissolve.add(d.spell);
      render();
    },
    'rs-dissolve': () => { UI.reshape.stage = 'build'; render(); },
    'rs-sel': d => {
      const R = UI.reshape;
      if (R.sel.has(d.card)) R.sel.delete(d.card); else R.sel.add(d.card);
      render();
    },
    'rs-form': d => {
      const R = UI.reshape;
      R.groups.push({ cardIds: Array.from(R.sel), type: d.type });
      R.sel.clear();
      R.error = null;
      render();
    },
    'rs-break': d => { UI.reshape.groups.splice(+d.gi, 1); render(); },
    'rs-back': () => {
      UI.reshape.stage = 'pick';
      UI.reshape.groups = [];
      UI.reshape.sel.clear();
      UI.reshape.error = null;
      render();
    },
    'rs-cancel': () => { UI.reshape = null; render(); },
    'rs-commit': () => {
      const R = UI.reshape;
      const r = E.dispatch(G, {
        kind: 'reshape',
        dissolveIds: Array.from(R.dissolve),
        groups: R.groups
      });
      if (r.ok) { UI.reshape = null; clearSel(); save(); }
      else R.error = r.error;
      render();
    },

    /* score */
    'score-new': () => {
      clearSave();
      G = null;
      UI.screen = 'title';
      UI.logOpen = false;
      render();
    }
  };

  /* ---------------- render root + events ---------------- */
  function render() {
    const root = document.getElementById('app');
    if (UI.screen === 'title' || !G) root.innerHTML = renderTitle();
    else if (G.phase === 'over') root.innerHTML = renderScore();
    else root.innerHTML = renderGame();
    maybeRunAI();
  }

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = ACTIONS[el.dataset.action];
    if (fn) fn(el.dataset, el);
  });
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset && el.dataset.field === 'seat-name') {
      UI.setup.seats[+el.dataset.i].name = el.value;
    }
  });

  render();
})();
