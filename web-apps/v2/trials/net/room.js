// Networked play: each wizard on their own phone, one shared room.
//
// The room holds only what is PUBLIC at the table. An allocation never leaves its phone
// until the reveal; what the room gets when a wizard locks in is a SEAL — a SHA-256 of
// the allocation and a random salt. At the reveal each phone publishes its allocation and
// salt, and every phone checks every seal. So nobody (and nothing reading the database)
// can see an allocation early, and nobody can change theirs after seeing another's.
//
// Room shape (the transport stores it as one JSON tree; empty values vanish):
//   meta:    { app, round, phase: 'books' | 'allocate' | 'reveal', host, rulesetId, options, order: [playerId] }
//   players: { <id>: { name, joined, spells: [...], done, seal, open: { allocation, salt } } }
//
// This file is the protocol: pure functions plus one small controller that takes a
// transport ({ get, put, patch, listen }). It knows no rule numbers and no DOM.

export const APP = 'trials2';
const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I or O

export const roomCode = (random = Math.random) => Array.from({ length: 4 }, () => CODE_LETTERS[Math.floor(random() * CODE_LETTERS.length)]).join('');
export const cleanCode = (text) => String(text || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
export const newId = (random = Math.random) => 'w' + Math.floor(random() * 0xffffffff).toString(36).padStart(7, '0');

/** One canonical text for an allocation: sorted keys, zeros dropped. Equal allocations give equal text. */
export function canonicalAllocation(a = {}) {
  const sorted = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
  const normal = {};
  for (const tid of Object.keys(a.normal || {}).sort()) {
    const doms = Object.fromEntries(Object.entries(a.normal[tid] || {}).filter(([, p]) => p > 0));
    if (Object.keys(doms).length) normal[tid] = sorted(doms);
  }
  const wild = sorted(Object.fromEntries(Object.entries(a.wild || {}).filter(([, p]) => p > 0)));
  return JSON.stringify({ mark: a.mark || null, normal, wild });
}

/** The seal: SHA-256 hex of salt + canonical allocation. Needs Web Crypto (https, localhost, or node). */
export async function sealOf(allocation, salt) {
  const bytes = new TextEncoder().encode(salt + '|' + canonicalAllocation(allocation));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export const newSalt = () => [...globalThis.crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');

const players = (room) => (room && room.players) || {};
const meta = (room) => (room && room.meta) || {};

/** Wizards in table order: the order fixed when allocation began, else the order they joined. */
export function seating(room) {
  const all = players(room);
  const order = meta(room).order;
  const ids = order && order.length ? order.filter((id) => all[id]) : Object.keys(all).sort((a, b) => (all[a].joined || 0) - (all[b].joined || 0) || (a < b ? -1 : 1));
  return ids.map((id) => ({ id, ...all[id] }));
}

/** Check every published allocation against its seal: { playerId: true | false }. */
export async function verifyRoom(room) {
  const out = {};
  for (const p of seating(room)) out[p.id] = !!(p.open && p.seal && (await sealOf(p.open.allocation, p.open.salt)) === p.seal);
  return out;
}

/**
 * The room as a session (state.js shape) for one phone, so both modes draw the same screens.
 * Before the reveal, `allocations` holds this phone's own allocation and nobody else's.
 * @param mine  this phone's private state: { allocation } (never sent before the reveal)
 */
export function roomToSession(room, meId, mine = {}) {
  const m = meta(room);
  const seats = seating(room);
  const everyoneOpen = seats.length > 0 && seats.every((p) => p.open);
  const phase = m.phase === 'reveal' ? (everyoneOpen ? 'results' : 'allocate') : m.phase || 'books';
  const blank = () => ({ normal: {}, wild: {}, mark: null });
  const allocations = {};
  if (phase === 'results') for (const p of seats) allocations[p.id] = { ...blank(), ...(p.open.allocation || {}) };
  else if (phase === 'allocate' && seats.some((p) => p.id === meId)) allocations[meId] = { ...blank(), ...(mine.allocation || {}) };
  return {
    v: 1, mode: 'net', rulesetId: m.rulesetId || null, options: m.options || {}, phase,
    players: seats.map((p) => ({ id: p.id, name: p.name })),
    books: Object.fromEntries(seats.map((p) => [p.id, p.spells || []])),
    allocations,
    locked: Object.fromEntries(seats.filter((p) => p.seal).map((p) => [p.id, true])),
    net: { host: m.host, round: m.round || 1, revealing: m.phase === 'reveal' && !everyoneOpen, done: Object.fromEntries(seats.map((p) => [p.id, !!p.done])) },
  };
}

/**
 * One phone's connection to a room.
 * @param transport { get(path), put(path, value), patch(path, object), listen(onTree, onError) → stop }
 * @param store     { get(key, fallback), set(key, value) } — keeps this phone's allocation and salt
 *                  across a refresh. It stays on the phone.
 * @param onChange  called with (session, room) whenever anything changes
 */
export function connectRoom({ transport, store, meId, onChange, onError = () => {} }) {
  let room = null;
  let stop = null;
  const key = () => 'net:' + ((room && room.meta && room.meta.round) || 1);
  const mine = () => store.get(key(), { allocation: { normal: {}, wild: {}, mark: null }, salt: null });
  const saveMine = (value) => store.set(key(), value);
  const emit = () => onChange(roomToSession(room, meId, mine()), room);
  const me = () => players(room)[meId];

  async function react() {
    const m = meta(room);
    if (!me()) return;
    // The reveal: publish what was sealed. Only ever what matches this phone's own seal.
    if (m.phase === 'reveal' && me().seal && !me().open) {
      const local = mine();
      if (local.salt && (await sealOf(local.allocation, local.salt)) === me().seal) await transport.patch('players/' + meId, { open: { allocation: JSON.parse(canonicalAllocation(local.allocation)), salt: local.salt } });
    }
    // The host's phone opens the reveal once every seal is in. Nothing else is automatic.
    if (m.phase === 'allocate' && m.host === meId && api.autoReveal && seating(room).every((p) => p.seal)) await transport.patch('meta', { phase: 'reveal' });
  }

  const api = {
    autoReveal: false,
    get room() { return room; },
    session: () => roomToSession(room, meId, mine()),
    start() {
      stop = transport.listen((tree) => { room = tree || {}; emit(); react().catch(onError); }, onError);
      return api;
    },
    stop() { if (stop) stop(); stop = null; },

    /** Host: open a new room. Fails if the code is in use. */
    async create({ name, rulesetId, options }) {
      const existing = await transport.get('meta');
      if (existing) throw Object.assign(new Error('room-exists'), { code: 'room-exists' });
      await transport.put('', { meta: { app: APP, round: 1, phase: 'books', host: meId, rulesetId, options: options || {}, created: Date.now() }, players: { [meId]: { name, joined: Date.now() } } });
    },
    /** Join (or rejoin) a room that is still taking wizards. */
    async join({ name }) {
      const tree = await transport.get('');
      if (!tree || !tree.meta || tree.meta.app !== APP) throw Object.assign(new Error('no-such-room'), { code: 'no-such-room' });
      if (tree.players && tree.players[meId]) return;
      if (!name) throw Object.assign(new Error('not-seated'), { code: 'not-seated' });
      if (tree.meta.phase !== 'books') throw Object.assign(new Error('room-started'), { code: 'room-started' });
      const taken = Object.values(tree.players || {});
      if (taken.length >= 6) throw Object.assign(new Error('table-full'), { code: 'table-full' });
      if (taken.some((p) => (p.name || '').toLowerCase() === name.toLowerCase())) throw Object.assign(new Error('name-taken'), { code: 'name-taken' });
      await transport.patch('players/' + meId, { name, joined: Date.now() });
    },
    setBook: (spells) => transport.patch('players/' + meId, { spells, done: false }),
    setDone: (done) => transport.patch('players/' + meId, { done }),
    /** Host only. */
    setRuleset: (rulesetId, options) => transport.patch('meta', { rulesetId, options: options || {} }),
    remove: (playerId) => transport.put('players/' + playerId, null),
    startAllocation: () => transport.patch('meta', { phase: 'allocate', order: seating(room).map((p) => p.id) }),
    async backToBooks() {
      for (const p of seating(room)) await transport.patch('players/' + p.id, { seal: null, open: null, done: false });
      await transport.patch('meta', { phase: 'books', order: null, round: (meta(room).round || 1) + 1 });
    },
    reveal: () => transport.patch('meta', { phase: 'reveal' }),
    async rematch() {
      for (const p of seating(room)) await transport.patch('players/' + p.id, { seal: null, open: null, done: false, spells: null });
      await transport.patch('meta', { phase: 'books', order: null, round: (meta(room).round || 1) + 1 });
    },

    /** This phone's allocation. Stays here. */
    setAllocation(allocation) { saveMine({ ...mine(), allocation }); emit(); },
    /** Lock in: publish the seal, keep the allocation and salt here. */
    async seal() {
      const salt = newSalt();
      const allocation = mine().allocation;
      saveMine({ allocation, salt });
      await transport.patch('players/' + meId, { seal: await sealOf(allocation, salt) });
    },
    /** Reopen, while the reveal has not begun. */
    async unseal() {
      if (meta(room).phase !== 'allocate') throw Object.assign(new Error('wrong-phase'), { code: 'wrong-phase' });
      await transport.patch('players/' + meId, { seal: null });
    },
    verify: () => verifyRoom(room),
  };
  return api;
}
