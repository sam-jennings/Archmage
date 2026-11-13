// ASCENSION TRIALS COMPANION — controller. Owns the session, storage and the two modes;
// views.js draws. Rules come only from the chosen package (rulesets/), never from here.
import '../assets/js/app.js';
import { h, clear, put, store, RULES } from '../assets/js/ui.js';
import { deckProfile } from '../data/current.js';
import { TRIALS_STRINGS } from './strings.en.js';
import { makeT } from './describe.js';
import { DEFAULT_RULESET_ID, loadRuleset, findRuleset, playableCounts, optionValues } from './rulesets/index.js';
import { newSession, reduce, tableStates } from './state.js';
import { render as renderViews } from './views.js';

const T = makeT(TRIALS_STRINGS);
const main = document.getElementById('main');
const query = new URLSearchParams(location.search);

// ── What this phone remembers ───────────────────────────────────────────────────────
const KEY = { session: 'trials:session', pack: 'trials:pack', me: 'trials:me', room: 'trials:room' };
// Who this phone is in a room, and its sealed allocation. With ?net=local (several tabs of
// one browser standing in for several phones) each TAB must be its own wizard, so that
// identity lives in the tab; otherwise it lives on the phone and survives a restart.
const LOCAL_NET = query.get('net') === 'local';
const seat = !LOCAL_NET ? store : {
  get(key, fallback) { try { const raw = sessionStorage.getItem('ad2:' + key); return raw == null ? fallback : JSON.parse(raw); } catch { return fallback; } },
  set(key, value) { try { sessionStorage.setItem('ad2:' + key, JSON.stringify(value)); } catch { /* ignore */ } },
};
const remembered = () => store.get(KEY.pack, null);

function startingPack() {
  const fromUrl = query.get('ruleset');
  if (fromUrl && findRuleset(fromUrl)) return { rulesetId: fromUrl, options: {} };
  const saved = remembered();
  if (saved && findRuleset(saved.rulesetId)) return saved;
  return { rulesetId: DEFAULT_RULESET_ID && findRuleset(DEFAULT_RULESET_ID) ? DEFAULT_RULESET_ID : null, options: {} };
}

let session = store.get(KEY.session, null);
if (query.get('room')) session = null; // a join link never disturbs a pass-and-play game stored here
if (!session || session.v !== 1 || session.mode !== 'pass' || (session.rulesetId && !findRuleset(session.rulesetId))) session = newSession(startingPack());
else if (query.get('ruleset') && findRuleset(query.get('ruleset')) && session.phase !== 'results' && session.rulesetId !== query.get('ruleset')) session = reduce(session, { type: 'set-ruleset', rulesetId: query.get('ruleset'), options: {} });

// Screen state that is never stored: who is holding the phone, open editors, messages.
const ui = {
  mode: query.get('room') ? 'net' : 'pass',
  holder: null, gate: null, confirmLock: false, confirmBack: false,
  bookFor: null, entry: 'cards', cards: [], energy: null, quick: { type: 'conjuration', size: 3, energy: null },
  revealed: 0, display: false, seals: null, error: null, nameDraft: '', codeDraft: (query.get('room') || '').toUpperCase(), busy: false, copied: false,
};
const net = { api: null, code: null, me: seat.get(KEY.me, null), room: null };

// ── Derived context for the views ───────────────────────────────────────────────────
function context() {
  const ruleset = session.rulesetId ? loadRuleset(session.rulesetId, session.options) : null;
  const n = session.players.length;
  const group = RULES.players.groups.find((g) => n >= g.min && n <= g.max) || RULES.players.groups[0];
  const energyName = (key) => (RULES.energies.find((e) => e.key === key) || {}).name;
  const domainName = (id) => energyName(id) || (T('domains.' + id).startsWith('domains.') ? id : T('domains.' + id));
  return {
    T, session, ui, net, ruleset, n,
    config: ruleset && ruleset.config,
    counts: ruleset ? playableCounts(ruleset) : [],
    states: ruleset ? tableStates(session, ruleset) : {},
    deck: deckProfile(group.id),
    me: session.mode === 'net' ? net.me : null,
    isHost: session.mode !== 'net' || (session.net && session.net.host === net.me),
    domainName,
    trialName: (id) => (ruleset && ruleset.ui.trials[id] ? ruleset.ui.trials[id].name : id),
    playerName: (id) => (session.players.find((p) => p.id === id) || { name: '?' }).name,
    act, set, choosePack, netCreate, netJoin, netLeave,
  };
}

function paint() {
  const active = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.fk : null;
  document.body.classList.toggle('tr-display', ui.display && session.phase === 'results');
  put(clear(main), renderViews(context()));
  if (active) {
    // Keep the keyboard where it was. A stepper button that has just reached its limit is
    // disabled, so fall back to the number beside it.
    const find = (fk) => main.querySelector(`[data-fk="${CSS.escape(fk)}"]`);
    let again = find(active);
    if (again && again.disabled) again = find(active.replace(/(all|[+-])$/, '='));
    if (again) again.focus({ preventScroll: true });
  }
}

/** Change screen state only. */
function set(patch) { Object.assign(ui, patch); paint(); }

const fail = (error) => { ui.busy = false; ui.error = error && error.code ? error.code : 'network'; paint(); };

/** Change the game. Pass-and-play: reduce and save. Networked: send the public part to the room. */
function act(action, uiPatch = {}) {
  ui.error = null;
  let next;
  try { next = reduce(session, action); } catch (error) { Object.assign(ui, uiPatch); ui.error = error.code || 'unknown'; return paint(); }
  Object.assign(ui, uiPatch);
  if (session.mode !== 'net') {
    session = next;
    if (action.type === 'reveal') ui.revealed = 0;
    if (ui.mode !== 'net') store.set(KEY.session, session);
    return paint();
  }
  const api = net.api; const me = net.me;
  const sent = {
    'add-spell': () => api.setBook(next.books[me]), 'remove-spell': () => api.setBook(next.books[me]),
    'remove-player': () => api.remove(action.playerId),
    'set-ruleset': () => api.setRuleset(action.rulesetId, action.options),
    'start-allocation': () => api.startAllocation(), 'back-to-books': () => api.backToBooks(),
    lock: () => api.seal(), unlock: () => api.unseal(), reveal: () => { ui.revealed = 0; return api.reveal(); }, rematch: () => api.rematch(),
  }[action.type];
  if (sent) return Promise.resolve(sent()).catch(fail);
  // Everything else is this phone's own allocation, which stays on this phone.
  api.setAllocation(next.allocations[me]);
}

/** Host setting: pick the rules package and its options. Remembered on this phone. */
function choosePack(rulesetId, options = {}) {
  const base = findRuleset(rulesetId);
  if (!base) return;
  const chosen = optionValues(base, options);
  store.set(KEY.pack, { rulesetId, options: chosen });
  act({ type: 'set-ruleset', rulesetId, options: chosen });
}

// ── Networked play (loaded only when chosen) ────────────────────────────────────────
async function openRoom(code) {
  const { connectRoom } = await import('./net/room.js');
  let transport;
  if (LOCAL_NET) transport = (await import('./net/transport-memory.js')).localRoom(code);
  else { const fb = await import('./net/transport-firebase.js'); transport = fb.firebaseRoom(await fb.findDatabaseUrl(), code); }
  if (!net.me) { net.me = (await import('./net/room.js')).newId(); seat.set(KEY.me, net.me); }
  const kept = { get: (k, f) => seat.get('trials:' + code + ':' + k, f), set: (k, v) => seat.set('trials:' + code + ':' + k, v) };
  let last = null;
  net.code = code;
  net.api = connectRoom({ transport, store: kept, meId: net.me, onError: (e) => { if (e.code === 'offline') { ui.error = 'offline'; paint(); } else fail(e); },
    onChange: (s, room) => {
      net.room = room;
      if (!s.players.some((p) => p.id === net.me)) return; // not seated (yet)
      if (last !== 'results' && s.phase === 'results') ui.revealed = 0;
      last = s.phase;
      if (ui.error === 'offline') ui.error = null;
      session = s; ui.busy = false; paint();
      // Every phone checks every seal for itself.
      if (s.phase === 'results' && !ui.seals) net.api.verify().then((seals) => { ui.seals = seals; paint(); });
      if (s.phase !== 'results') ui.seals = null;
    } });
  return net.api;
}
async function netCreate(name) {
  if (!name.trim()) return set({ error: 'no-name' });
  if (!session.rulesetId) return set({ error: 'no-ruleset' });
  set({ busy: true, error: null });
  const { roomCode } = await import('./net/room.js');
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = roomCode();
    try {
      const api = await openRoom(code);
      await api.create({ name: name.trim().slice(0, 24), rulesetId: session.rulesetId, options: session.options });
      seat.set(KEY.room, code); api.start();
      return;
    } catch (error) { if (error.code !== 'room-exists') return fail(error); }
  }
  fail({ code: 'room-exists' });
}
async function netJoin(code, name, rejoin = false) {
  if (!rejoin && !name.trim()) return set({ error: 'no-name' });
  set({ busy: true, error: null });
  try {
    const api = await openRoom(code);
    await api.join({ name: name.trim().slice(0, 24) });
    seat.set(KEY.room, code); api.start();
  } catch (error) { if (rejoin) { seat.set(KEY.room, null); ui.busy = false; paint(); } else fail(error); }
}
function netLeave() {
  if (net.api) net.api.stop();
  net.api = null; net.code = null; net.room = null;
  seat.set(KEY.room, null);
  session = newSession({ ...startingPack(), mode: 'pass' });
  set({ mode: 'net', busy: false, error: null });
}

paint();
// A refresh in the middle of a networked game puts this phone back in its seat.
const lastRoom = seat.get(KEY.room, null);
if (lastRoom && net.me && (!query.get('room') || query.get('room').toUpperCase() === lastRoom)) { ui.mode = 'net'; netJoin(lastRoom, '', true); }
