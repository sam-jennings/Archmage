/* =========================================================================
 * Archmage Ascension — rules engine (rulebook v2.8)
 * Pure game logic: no DOM. Loads in the browser (window.Archmage) and in
 * Node (module.exports) so the same code drives the UI and the sim tests.
 * ========================================================================= */
(function (global) {
  'use strict';

  const SUITS = ['radiance', 'void', 'flux', 'aether'];
  const SUIT_LABEL = {
    radiance: 'Radiance', void: 'Void', flux: 'Flux', aether: 'Aether', wild: 'Wild'
  };
  const TYPE_LABEL = {
    conjuration: 'Conjuration',
    transfiguration: 'Transfiguration',
    enchantment: 'Enchantment',
    perfect: 'Perfect Transmutation'
  };
  const TYPES = Object.keys(TYPE_LABEL);

  /* ---------- seedable rng (state lives inside the game state so games
   * stay deterministic across save/load when a seed is used) ---------- */
  function nextRand(state) {
    if (state.rngState == null) return Math.random();
    let t = (state.rngState = (state.rngState + 0x6D2B79F5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function shuffleInPlace(arr, state) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(nextRand(state) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ---------- deck ---------- */
  function deckSpec(playerCount) {
    return playerCount <= 4
      ? { maxValue: 15, wilds: 2 }
      : { maxValue: 20, wilds: 4 };
  }
  function buildDeck(playerCount) {
    const { maxValue, wilds } = deckSpec(playerCount);
    const cards = [];
    for (const suit of SUITS) {
      for (let v = 1; v <= maxValue; v++) {
        cards.push({ id: suit[0] + v, suit, value: v });
      }
    }
    for (let i = 1; i <= wilds; i++) {
      cards.push({ id: 'w' + i, suit: 'wild', value: 0 });
    }
    return cards;
  }

  /* ---------- card helpers ---------- */
  function isWild(c) { return c.suit === 'wild'; }
  function cardLabel(c, decl) {
    if (!isWild(c)) return SUIT_LABEL[c.suit] + ' ' + c.value;
    const d = decl && decl[c.id];
    if (d) {
      return 'Wild (as ' + (d.suit && d.suit !== 'wild' ? SUIT_LABEL[d.suit] + ' ' : '') + d.value + ')';
    }
    return 'Wild';
  }

  /* =========================================================================
   * Spell validation.
   * validTypes(cards, maxValue) returns every spell type the card set can be
   * declared as, with a concrete suit/value declaration for each wild card.
   * A spell needs at least one non-wild card and at least 3 cards total.
   * ========================================================================= */
  function validTypes(cards, maxValue) {
    const out = [];
    if (!Array.isArray(cards) || cards.length < 3) return out;
    const real = cards.filter(c => !isWild(c));
    const wilds = cards.filter(isWild);
    if (real.length === 0) return out;
    // duplicate guard (shouldn't happen with one deck, but be safe)
    const ids = new Set(cards.map(c => c.id));
    if (ids.size !== cards.length) return out;

    const sameSuit = real.every(c => c.suit === real[0].suit);
    const realValues = real.map(c => c.value);
    const distinctValues = new Set(realValues).size === realValues.length;

    // --- Enchantment: 3-4 cards of the same value, all different energies ---
    if (cards.length <= 4) {
      const sameValue = real.every(c => c.value === real[0].value);
      const suitSet = new Set(real.map(c => c.suit));
      if (sameValue && suitSet.size === real.length) {
        const free = SUITS.filter(s => !suitSet.has(s));
        if (wilds.length <= free.length) {
          const decl = {};
          wilds.forEach((w, i) => { decl[w.id] = { suit: free[i], value: real[0].value }; });
          out.push({ type: 'enchantment', decl });
        }
      }
    }

    // --- Conjuration: 3+ cards of the same energy, any values ---
    if (sameSuit && distinctValues) {
      const suit = real[0].suit;
      const used = new Set(realValues);
      const freeVals = [];
      for (let v = 1; v <= maxValue && freeVals.length < wilds.length; v++) {
        if (!used.has(v)) freeVals.push(v);
      }
      if (wilds.length <= freeVals.length) {
        const decl = {};
        wilds.forEach((w, i) => { decl[w.id] = { suit, value: freeVals[i] }; });
        out.push({ type: 'conjuration', decl });
      }
    }

    // --- Sequential runs (Transfiguration / Perfect Transmutation) ---
    const seq = solveSequence(real, wilds, cards.length, maxValue);
    if (seq) {
      const declT = {};
      wilds.forEach(w => { declT[w.id] = { suit: 'wild', value: seq.wildValues[w.id] }; });
      out.push({ type: 'transfiguration', decl: declT });
      if (sameSuit) {
        const declP = {};
        wilds.forEach(w => { declP[w.id] = { suit: real[0].suit, value: seq.wildValues[w.id] }; });
        out.push({ type: 'perfect', decl: declP });
      }
    }

    for (const o of out) {
      o.size = cards.length;
      o.points = spellPoints(o.type, cards.length);
    }
    // highest-scoring interpretation first (UI preselects it)
    out.sort((a, b) => b.points - a.points);
    return out;
  }

  // Find a window of `n` consecutive values inside [1, maxValue] that contains
  // every real card's value, with wilds filling the remaining slots.
  function solveSequence(real, wilds, n, maxValue) {
    const vals = real.map(c => c.value);
    if (new Set(vals).size !== vals.length) return null;
    const lo0 = Math.min.apply(null, vals);
    const hi0 = Math.max.apply(null, vals);
    if (hi0 - lo0 > n - 1) return null;
    // prefer the window anchored at the lowest real value (wilds extend upward),
    // shifting down only when the window would overflow maxValue
    let start = Math.min(lo0, maxValue - n + 1);
    start = Math.max(start, Math.max(1, hi0 - n + 1));
    if (start < 1 || start + n - 1 > maxValue) return null;
    const used = new Set(vals);
    const gaps = [];
    for (let v = start; v < start + n; v++) if (!used.has(v)) gaps.push(v);
    if (gaps.length !== wilds.length) return null;
    const wildValues = {};
    wilds.forEach((w, i) => { wildValues[w.id] = gaps[i]; });
    return { start, wildValues };
  }

  /* ---------- scoring (Recognition Points, Scoring System Reference v2.8) ---------- */
  function tri(k) { return k > 0 ? (k * (k + 1)) / 2 : 0; }
  function spellPoints(type, n) {
    if (n < 3) return 0;
    switch (type) {
      case 'enchantment': return n >= 4 ? 15 : 6;
      case 'conjuration': return 3 + tri(n - 3);
      case 'transfiguration': return 5 + tri(n - 2) - 1;
      case 'perfect': return 5 + tri(n - 1) - 1;
      default: return 0;
    }
  }
  function playerScore(player) {
    let total = 0;
    const spells = player.spellbook.map(s => {
      const pts = spellPoints(s.type, s.cards.length);
      total += pts;
      return { id: s.id, type: s.type, size: s.cards.length, points: pts };
    });
    return { total, spells };
  }
  function scoreAll(state) {
    const rows = state.players.map((p, idx) => {
      const sc = playerScore(p);
      const largest = p.spellbook.reduce((m, s) => Math.max(m, s.cards.length), 0);
      return {
        idx, name: p.name, isAI: p.isAI,
        total: sc.total, spells: sc.spells,
        spellCount: p.spellbook.length, largest
      };
    });
    rows.sort((a, b) =>
      b.total - a.total || b.spellCount - a.spellCount || b.largest - a.largest);
    const top = rows[0];
    const winners = rows
      .filter(r => r.total === top.total && r.spellCount === top.spellCount && r.largest === top.largest)
      .map(r => r.idx);
    let tiebreak = null;
    const tied = rows.filter(r => r.total === top.total);
    if (tied.length > 1) {
      tiebreak = tied.some(r => r.spellCount !== top.spellCount)
        ? 'most spells'
        : (tied.some(r => r.largest !== top.largest) ? 'largest single spell' : 'shared victory');
    }
    return { ranking: rows, winners, tiebreak };
  }

  /* ---------- capacity (derived from enchantments in the spellbook) ---------- */
  function capacity(player) {
    let three = 0;
    for (const s of player.spellbook) {
      if (s.type !== 'enchantment') continue;
      if (s.cards.length >= 4) return Infinity;
      if (s.cards.length === 3) three++;
    }
    return 1 + three;
  }

  /* =========================================================================
   * Game state + actions
   * ========================================================================= */
  function newGame(opts) {
    const players = opts.players.map(p => ({
      name: String(p.name || 'Wizard').slice(0, 24),
      isAI: !!p.isAI,
      hand: [], spellbook: [], locked: []
    }));
    if (players.length < 2 || players.length > 7) {
      throw new Error('Archmage Ascension supports 2-7 players');
    }
    const spec = deckSpec(players.length);
    const state = {
      v: 1,
      rngState: opts.seed != null ? (opts.seed >>> 0) : null,
      maxValue: spec.maxValue,
      players,
      source: [], array: [], reserve: [],
      drought: false,
      phase: 'binding',
      bound: players.map(() => false),
      current: 0,
      startingPlayer: 0,
      turnNumber: 0,
      spellSeq: 0,
      turn: freshTurn(),
      pending: null,
      notice: null,
      result: null,
      log: []
    };
    const deck = buildDeck(players.length);
    shuffleInPlace(deck, state);
    for (const p of players) p.hand = deck.splice(0, 7);
    state.array = deck.splice(0, 5);
    state.source = deck;
    state.startingPlayer = Math.floor(nextRand(state) * players.length);
    state.current = state.startingPlayer;
    log(state, null, 'The contest begins — ' + players.length + ' wizards, components 1–' +
      spec.maxValue + ' with ' + spec.wilds + ' wilds (' + (deck.length + 5 + players.length * 7) + ' cards).');
    log(state, state.startingPlayer, players[state.startingPlayer].name + ' will take the first turn.');
    log(state, null, 'Binding: each wizard places 1 component into the Arcane Reserve.');
    return state;
  }

  function freshTurn() {
    return { castSpellIds: [], spellsCast: 0, learnUsed: 0 };
  }
  function log(state, p, msg) {
    state.log.push({ p: p == null ? null : p, msg });
    if (state.log.length > 400) state.log.splice(0, state.log.length - 400);
  }
  function cur(state) { return state.players[state.current]; }
  function findCard(zone, id) { return zone.find(c => c.id === id); }
  function removeCard(zone, id) {
    const i = zone.findIndex(c => c.id === id);
    return i >= 0 ? zone.splice(i, 1)[0] : null;
  }
  function err(msg) { return { ok: false, error: msg }; }
  const OK = { ok: true };

  /* The Drought: triggered the instant the Source runs dry. Array + Reserve
   * shuffle together into the Released Reserve (we reuse `source` as the
   * active draw pile). Returns true if the Drought just began. */
  function checkDrought(state) {
    if (state.drought || state.source.length > 0) return false;
    state.drought = true;
    state.source = state.array.concat(state.reserve);
    state.array = [];
    state.reserve = [];
    shuffleInPlace(state.source, state);
    log(state, null, 'THE DROUGHT — the Source is exhausted. The Array and Arcane Reserve merge into the Released Reserve (' + state.source.length + ' cards). No more casting; collect and learn until the Reserve is empty.');
    state.notice = {
      title: 'The Drought begins',
      body: 'The Source is exhausted. The Array and the Arcane Reserve have been shuffled into the Released Reserve (' +
        state.source.length + ' cards). Casting is no longer possible — each turn you draw 1 component and use your learning actions. When the Released Reserve is depleted, the contest ends and Spellbooks are evaluated.'
    };
    return true;
  }

  function endGame(state) {
    state.phase = 'over';
    state.pending = null;
    state.result = scoreAll(state);
    const names = state.result.winners.map(i => state.players[i].name).join(' & ');
    log(state, null, 'The Released Reserve is depleted. The contest ends.');
    log(state, null, names + ' ascend' + (state.result.winners.length > 1 ? '' : 's') + ' to Archmage with ' +
      state.result.ranking[0].total + ' Recognition Points.');
  }

  /* ---------- cast feasibility ---------- */
  function exchangeNeed(size) { return size === 3 ? 2 : 1; }
  function castInfo(state, spell) {
    const p = cur(state);
    const n = spell.cards.length;
    const info = { castable: false, reason: '', need: 0, drawCount: 0 };
    if (state.drought) { info.reason = 'No casting during the Drought'; return info; }
    if (spell.type === 'enchantment') { info.reason = 'Enchantments are always active — never cast'; return info; }
    if (state.turn.castSpellIds.indexOf(spell.id) >= 0) { info.reason = 'Already cast this turn'; return info; }
    if (state.turn.spellsCast >= capacity(p)) { info.reason = 'No counters left'; return info; }
    if (spell.type === 'conjuration' || spell.type === 'perfect') {
      info.drawCount = n >= 6 ? 2 : 1;
    }
    if (spell.type === 'transfiguration' || spell.type === 'perfect') {
      info.need = exchangeNeed(n);
      const handAfterDraw = p.hand.length + Math.min(info.drawCount, state.source.length);
      if (handAfterDraw < info.need) {
        info.reason = 'Not enough cards in hand to discard ' + info.need;
        return info;
      }
      if (state.array.length === 0) { info.reason = 'The Array is empty'; return info; }
    }
    info.castable = true;
    return info;
  }

  /* ---------- actions ---------- */
  const handlers = {

    bind(state, a) {
      if (state.phase !== 'binding') return err('Not in the binding step');
      const p = cur(state);
      const card = removeCard(p.hand, a.cardId);
      if (!card) return err('Card not in hand');
      state.reserve.push(card);
      state.bound[state.current] = true;
      log(state, state.current, p.name + ' binds ' + cardLabel(card) + ' to the Arcane Reserve.');
      // advance to the next unbound player (seat order from the starting player)
      for (let k = 1; k <= state.players.length; k++) {
        const idx = (state.current + k) % state.players.length;
        if (!state.bound[idx]) { state.current = idx; return OK; }
      }
      state.current = state.startingPlayer;
      state.phase = 'collection';
      state.turnNumber = 1;
      state.turn = freshTurn();
      log(state, null, 'All wizards are bound. ' + cur(state).name + ' begins.');
      return OK;
    },

    collectSource(state) {
      if (state.phase !== 'collection') return err('Not in the Collection phase');
      const p = cur(state);
      const card = state.source.pop();
      p.hand.push(card);
      log(state, state.current, p.name + ' draws 1 component from ' +
        (state.drought ? 'the Released Reserve (' + state.source.length + ' left).' : 'the Source.'));
      if (state.drought) {
        if (state.source.length === 0) { endGame(state); return OK; }
        state.phase = 'learning';
        return OK;
      }
      state.phase = checkDrought(state) ? 'learning' : 'casting';
      return OK;
    },

    collectArray(state, a) {
      if (state.phase !== 'collection') return err('Not in the Collection phase');
      if (state.drought) return err('The Array no longer exists');
      const p = cur(state);
      const card = removeCard(state.array, a.cardId);
      if (!card) return err('Card not in the Array');
      p.hand.push(card);
      log(state, state.current, p.name + ' takes ' + cardLabel(card) + ' from the Array.');
      if (state.source.length > 0) state.array.push(state.source.pop());
      state.phase = checkDrought(state) ? 'learning' : 'casting';
      return OK;
    },

    cast(state, a) {
      if (state.phase !== 'casting') return err('Not in the Casting phase');
      if (state.pending) return err('Finish the current exchange first');
      const p = cur(state);
      const spell = p.spellbook.find(s => s.id === a.spellId);
      if (!spell) return err('Spell not in your Spellbook');
      const info = castInfo(state, spell);
      if (!info.castable) return err(info.reason);

      state.turn.castSpellIds.push(spell.id);
      state.turn.spellsCast++;
      const n = spell.cards.length;

      if (spell.type === 'conjuration' || spell.type === 'perfect') {
        let drawn = 0;
        for (let i = 0; i < info.drawCount && state.source.length > 0; i++) {
          p.hand.push(state.source.pop());
          drawn++;
        }
        log(state, state.current, p.name + ' casts a ' + n + '-card ' + TYPE_LABEL[spell.type] +
          ' — draws ' + drawn + ' component' + (drawn === 1 ? '' : 's') + ' from the Source.');
        if (checkDrought(state)) {
          if (spell.type === 'perfect') {
            log(state, state.current, 'The Array dissolved before the exchange could complete.');
          }
          state.phase = 'learning';
          return OK;
        }
      } else {
        log(state, state.current, p.name + ' casts a ' + n + '-card Transfiguration.');
      }

      if (spell.type === 'transfiguration' || spell.type === 'perfect') {
        state.pending = {
          spellId: spell.id,
          need: info.need,
          canCancel: spell.type === 'transfiguration'
        };
      }
      return OK;
    },

    cancelExchange(state) {
      if (!state.pending || !state.pending.canCancel) return err('Cannot cancel this exchange');
      const i = state.turn.castSpellIds.indexOf(state.pending.spellId);
      if (i >= 0) state.turn.castSpellIds.splice(i, 1);
      state.turn.spellsCast--;
      log(state, state.current, cur(state).name + ' takes back the casting.');
      state.pending = null;
      return OK;
    },

    resolveExchange(state, a) {
      if (!state.pending) return err('No exchange in progress');
      const p = cur(state);
      const need = state.pending.need;
      const ids = a.discardIds || [];
      if (ids.length !== need) return err('Discard exactly ' + need + ' card' + (need === 1 ? '' : 's'));
      if (new Set(ids).size !== ids.length) return err('Duplicate discard');
      if (!ids.every(id => findCard(p.hand, id))) return err('Discards must come from your hand');
      const take = findCard(state.array, a.arrayCardId);
      if (!take) return err('Choose a card from the Array');

      const discarded = ids.map(id => removeCard(p.hand, id));
      state.reserve.push.apply(state.reserve, discarded);
      removeCard(state.array, take.id);
      p.hand.push(take);
      if (state.source.length > 0) state.array.push(state.source.pop());
      log(state, state.current, p.name + ' discards ' + discarded.map(c => cardLabel(c)).join(', ') +
        ' and takes ' + cardLabel(take) + ' from the Array.');
      state.pending = null;
      if (checkDrought(state)) state.phase = 'learning';
      return OK;
    },

    finishCasting(state) {
      if (state.phase !== 'casting') return err('Not in the Casting phase');
      if (state.pending) return err('Finish the current exchange first');
      if (state.turn.spellsCast > 0) {
        log(state, state.current, cur(state).name + ' recalls ' + state.turn.spellsCast +
          ' counter' + (state.turn.spellsCast === 1 ? '' : 's') + ' — capacity restored for learning.');
      }
      state.phase = 'learning';
      return OK;
    },

    learn(state, a) {
      const pre = learningPrecheck(state);
      if (pre) return pre;
      const p = cur(state);
      const ids = a.cardIds || [];
      if (ids.length < 3) return err('A spell needs at least 3 components');
      if (new Set(ids).size !== ids.length) return err('Duplicate card');
      const cards = [];
      for (const id of ids) {
        const c = findCard(p.hand, id);
        if (!c) return err('Cards must come from your hand');
        if (p.locked.indexOf(id) >= 0) return err('Unlearned components cannot be learned again until your next turn');
        cards.push(c);
      }
      const options = validTypes(cards, state.maxValue);
      const pick = options.find(o => o.type === a.type);
      if (!pick) return err('Those components do not form a valid ' + (TYPE_LABEL[a.type] || 'spell'));
      ids.forEach(id => removeCard(p.hand, id));
      const spell = { id: 's' + (++state.spellSeq), type: pick.type, cards, decl: pick.decl };
      p.spellbook.push(spell);
      state.turn.learnUsed++;
      log(state, state.current, p.name + ' learns a ' + cards.length + '-card ' + TYPE_LABEL[pick.type] +
        ' (' + spellPoints(pick.type, cards.length) + ' RP)' + enchantmentNote(state, p, spell, true));
      return OK;
    },

    empower(state, a) {
      const pre = learningPrecheck(state);
      if (pre) return pre;
      const p = cur(state);
      const spell = p.spellbook.find(s => s.id === a.spellId);
      if (!spell) return err('Spell not in your Spellbook');
      const ids = a.cardIds || [];
      if (ids.length < 1) return err('Add at least 1 component');
      if (new Set(ids).size !== ids.length) return err('Duplicate card');
      const adds = [];
      for (const id of ids) {
        const c = findCard(p.hand, id);
        if (!c) return err('Cards must come from your hand');
        if (p.locked.indexOf(id) >= 0) return err('Unlearned components cannot be reused until your next turn');
        adds.push(c);
      }
      const combined = spell.cards.concat(adds);
      const options = validTypes(combined, state.maxValue);
      const pick = options.find(o => o.type === a.type);
      if (!pick) return err('The empowered spell would not be a valid ' + (TYPE_LABEL[a.type] || 'spell'));
      ids.forEach(id => removeCard(p.hand, id));
      spell.cards = combined;
      spell.type = pick.type;
      spell.decl = pick.decl;
      state.turn.learnUsed++;
      log(state, state.current, p.name + ' empowers a spell to a ' + combined.length + '-card ' +
        TYPE_LABEL[pick.type] + ' (' + spellPoints(pick.type, combined.length) + ' RP)' +
        enchantmentNote(state, p, spell, true));
      return OK;
    },

    unlearn(state, a) {
      const pre = learningPrecheck(state);
      if (pre) return pre;
      const p = cur(state);
      const i = p.spellbook.findIndex(s => s.id === a.spellId);
      if (i < 0) return err('Spell not in your Spellbook');
      const spell = p.spellbook.splice(i, 1)[0];
      p.hand.push.apply(p.hand, spell.cards);
      p.locked.push.apply(p.locked, spell.cards.map(c => c.id));
      state.turn.learnUsed++;
      let note = '';
      if (spell.type === 'enchantment') {
        note = spell.cards.length >= 4
          ? ' Unlimited capacity is lost — counters return (' + fmtCap(capacity(p)) + ').'
          : ' A counter is lost (now ' + fmtCap(capacity(p)) + ').';
      }
      log(state, state.current, p.name + ' unlearns a ' + spell.cards.length + '-card ' +
        TYPE_LABEL[spell.type] + ' — its components return to hand (locked until next turn).' + note);
      return OK;
    },

    reshape(state, a) {
      const pre = learningPrecheck(state);
      if (pre) return pre;
      const p = cur(state);
      const dissolveIds = a.dissolveIds || [];
      if (dissolveIds.length < 1) return err('Choose at least one spell to reshape');
      const dissolved = [];
      for (const id of dissolveIds) {
        const s = p.spellbook.find(x => x.id === id);
        if (!s) return err('Spell not in your Spellbook');
        dissolved.push(s);
      }
      const poolIds = new Set();
      dissolved.forEach(s => s.cards.forEach(c => poolIds.add(c.id)));
      const groups = a.groups || [];
      const seen = new Set();
      let total = 0;
      for (const g of groups) {
        for (const id of g.cardIds || []) {
          if (!poolIds.has(id)) return err('Reshape may only use components from the dissolved spells');
          if (seen.has(id)) return err('A component was used twice');
          seen.add(id); total++;
        }
      }
      if (total !== poolIds.size) return err('Every component must end up in a valid spell');
      const poolCards = {};
      dissolved.forEach(s => s.cards.forEach(c => { poolCards[c.id] = c; }));
      const newSpells = [];
      for (const g of groups) {
        const cards = (g.cardIds || []).map(id => poolCards[id]);
        const pick = validTypes(cards, state.maxValue).find(o => o.type === g.type);
        if (!pick) return err('A reshaped group is not a valid ' + (TYPE_LABEL[g.type] || 'spell'));
        newSpells.push({ id: 's' + (++state.spellSeq), type: g.type, cards, decl: pick.decl });
      }
      const before = capacity(p);
      for (const id of dissolveIds) {
        const i = p.spellbook.findIndex(x => x.id === id);
        p.spellbook.splice(i, 1);
      }
      p.spellbook.push.apply(p.spellbook, newSpells);
      state.turn.learnUsed++;
      const after = capacity(p);
      let note = '';
      if (before !== after) {
        note = ' Capacity ' + (after > before || after === Infinity ? 'rises' : 'falls') +
          ' from ' + fmtCap(before) + ' to ' + fmtCap(after) + '.';
      }
      log(state, state.current, p.name + ' reshapes ' + dissolved.length + ' spell' +
        (dissolved.length === 1 ? '' : 's') + ' into ' + newSpells.length + ' (' +
        newSpells.map(s => s.cards.length + '-card ' + TYPE_LABEL[s.type]).join(', ') + ').' + note);
      return OK;
    },

    endTurn(state) {
      if (state.phase !== 'learning') return err('Finish the turn phases first');
      const p = cur(state);
      p.locked = [];
      log(state, state.current, p.name + ' ends their turn.');
      state.current = (state.current + 1) % state.players.length;
      state.turnNumber++;
      state.turn = freshTurn();
      state.pending = null;
      state.phase = 'collection';
      return OK;
    },

    ackNotice(state) {
      state.notice = null;
      return OK;
    }
  };

  function learningPrecheck(state) {
    if (state.phase !== 'learning') return err('Not in the Learning phase');
    const p = cur(state);
    if (state.turn.learnUsed >= capacity(p)) return err('No learning actions left');
    return null;
  }
  function fmtCap(c) { return c === Infinity ? 'Unlimited' : String(c); }
  function enchantmentNote(state, p, spell, announce) {
    if (spell.type !== 'enchantment' || !announce) return '.';
    return spell.cards.length >= 4
      ? ' — UNLIMITED CAPACITY! All spells castable, unlimited learning actions.'
      : ' — +1 counter (capacity now ' + fmtCap(capacity(p)) + ').';
  }

  function dispatch(state, action) {
    if (!action || !handlers[action.kind]) return err('Unknown action');
    if (state.phase === 'over' && action.kind !== 'ackNotice') return err('The contest is over');
    try {
      return handlers[action.kind](state, action);
    } catch (e) {
      return err('Engine error: ' + (e && e.message ? e.message : e));
    }
  }

  /* ---------- public api ---------- */
  const Archmage = {
    SUITS, SUIT_LABEL, TYPE_LABEL, TYPES,
    deckSpec, buildDeck,
    isWild, cardLabel,
    validTypes, spellPoints, playerScore, scoreAll,
    capacity, castInfo, exchangeNeed,
    newGame, dispatch,
    cur, fmtCap
  };

  global.Archmage = Archmage;
  if (typeof module !== 'undefined' && module.exports) module.exports = Archmage;
})(typeof window !== 'undefined' ? window : globalThis);
