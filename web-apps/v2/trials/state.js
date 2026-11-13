// The session: one game of the Trials, from set-up to results. Pure — a reducer and a
// few selectors, no DOM, no storage, no network, and no rule numbers (the package is
// passed to the selectors that need it). Both modes use this same shape:
//   • pass-and-play keeps the whole session on one phone;
//   • networked play rebuilds it on every phone from the shared room (net/room.js),
//     with only that phone's own allocation filled in until the reveal.
//
// HIDDEN INFORMATION lives in exactly one field: session.allocations. Everything else is
// public at the table. `publicView()` is the only shape a shared screen may draw from
// before the reveal.

import { deriveState } from './engine/power.js';
import { resolveProfile } from './engine/resolve.js';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const PHASES = ['setup', 'books', 'allocate', 'results'];

const blankAllocation = () => ({ normal: {}, wild: {}, mark: null });

export function newSession({ mode = 'pass', rulesetId = null, options = {} } = {}) {
  return { v: 1, mode, rulesetId, options, phase: 'setup', players: [], books: {}, allocations: {}, locked: {}, nextId: 1 };
}

class ActionError extends Error {
  constructor(code) { super(code); this.code = code; }
}
const need = (ok, code) => { if (!ok) throw new ActionError(code); };
const int = (v) => (Number.isInteger(v) && v >= 0 ? v : 0);

function resetAllocations(s) {
  s.allocations = Object.fromEntries(s.players.map((p) => [p.id, blankAllocation()]));
  s.locked = {};
}

/** Apply one action and return a NEW session. Throws { code } when the action is not allowed now. */
export function reduce(session, action) {
  const s = JSON.parse(JSON.stringify(session));
  const player = (id) => { const p = s.players.find((x) => x.id === id); need(p, 'no-such-player'); return p; };
  const open = (id) => { need(s.phase === 'allocate', 'wrong-phase'); player(id); need(!s.locked[id], 'locked'); return (s.allocations[id] ||= blankAllocation()); };
  switch (action.type) {
    case 'set-ruleset':
      need(s.phase !== 'results', 'wrong-phase');
      s.rulesetId = action.rulesetId; s.options = action.options || {};
      if (s.phase === 'allocate') resetAllocations(s); // every wizard's power may have changed
      break;
    case 'add-player': {
      need(s.phase === 'setup' || s.phase === 'books', 'wrong-phase');
      need(s.players.length < MAX_PLAYERS, 'table-full');
      const name = String(action.name || '').trim().slice(0, 24);
      need(name, 'no-name');
      need(!s.players.some((p) => p.name.toLowerCase() === name.toLowerCase()), 'name-taken');
      const id = action.id || 'p' + s.nextId++;
      s.players.push({ id, name }); s.books[id] = [];
      break;
    }
    case 'remove-player':
      need(s.phase === 'setup' || s.phase === 'books', 'wrong-phase');
      player(action.playerId);
      s.players = s.players.filter((p) => p.id !== action.playerId);
      delete s.books[action.playerId];
      break;
    case 'start-books':
      need(s.phase === 'setup', 'wrong-phase'); need(s.rulesetId, 'no-ruleset'); need(s.players.length >= MIN_PLAYERS, 'too-few-players');
      s.phase = 'books';
      break;
    case 'add-spell':
      need(s.phase === 'books', 'wrong-phase'); player(action.playerId);
      s.books[action.playerId].push({ ...action.spell, id: action.spell.id || 's' + s.nextId++ });
      break;
    case 'remove-spell':
      need(s.phase === 'books', 'wrong-phase'); player(action.playerId);
      s.books[action.playerId] = s.books[action.playerId].filter((sp) => sp.id !== action.spellId);
      break;
    case 'start-allocation':
      need(s.phase === 'books', 'wrong-phase'); need(s.rulesetId, 'no-ruleset'); need(s.players.length >= MIN_PLAYERS, 'too-few-players');
      s.phase = 'allocate'; resetAllocations(s);
      break;
    case 'back-to-books':
      need(s.phase === 'allocate', 'wrong-phase');
      s.phase = 'books'; s.allocations = {}; s.locked = {};
      break;
    case 'set-normal': {
      const a = open(action.playerId); const v = int(action.value);
      const entry = (a.normal[action.trialId] ||= {});
      if (v) entry[action.domain] = v; else delete entry[action.domain];
      if (!Object.keys(entry).length) delete a.normal[action.trialId];
      break;
    }
    case 'set-wild': {
      const a = open(action.playerId); const v = int(action.value);
      if (v) a.wild[action.trialId] = v; else delete a.wild[action.trialId];
      break;
    }
    case 'set-mark': open(action.playerId).mark = action.trialId || null; break;
    case 'clear-trial': { const a = open(action.playerId); delete a.normal[action.trialId]; delete a.wild[action.trialId]; break; }
    case 'clear-allocation': { const a = open(action.playerId); a.normal = {}; a.wild = {}; a.mark = null; break; }
    case 'set-allocation': { open(action.playerId); s.allocations[action.playerId] = { ...blankAllocation(), ...action.allocation }; break; }
    case 'lock': need(s.phase === 'allocate', 'wrong-phase'); player(action.playerId); s.locked[action.playerId] = true; break;
    case 'unlock': need(s.phase === 'allocate', 'wrong-phase'); player(action.playerId); delete s.locked[action.playerId]; break;
    case 'reveal':
      need(s.phase === 'allocate', 'wrong-phase'); need(allLocked(s), 'not-all-locked');
      s.phase = 'results';
      break;
    case 'rematch': // same wizards, same package, new Spellbooks
      s.phase = 'books'; s.books = Object.fromEntries(s.players.map((p) => [p.id, []])); s.allocations = {}; s.locked = {};
      break;
    case 'new-game':
      s.phase = 'setup'; s.books = Object.fromEntries(s.players.map((p) => [p.id, []])); s.allocations = {}; s.locked = {};
      break;
    default: throw new ActionError('unknown-action');
  }
  return s;
}

// ── Selectors ───────────────────────────────────────────────────────────────────────

export const allLocked = (s) => s.players.length > 0 && s.players.every((p) => s.locked[p.id]);
export const waitingFor = (s) => s.players.filter((p) => !s.locked[p.id]);
export const allocationOf = (s, id) => s.allocations[id] || blankAllocation();

/** Every wizard's Trials power under this package. Public: Spellbooks are on the table. */
export function tableStates(session, ruleset) {
  return Object.fromEntries(session.players.map((p) => [p.id, deriveState(ruleset.config, session.books[p.id] || [], { playerId: p.id, extras: ruleset.extras })]));
}

/** Power a wizard has not yet placed: { normal: { domain: left }, wild: left }. May go negative only through a bad import. */
export function remaining(state, allocation) {
  const normal = { ...state.normal_power };
  for (const doms of Object.values(allocation.normal || {})) for (const [d, p] of Object.entries(doms)) normal[d] = (normal[d] || 0) - p;
  const wild = state.wild_power - Object.values(allocation.wild || {}).reduce((a, b) => a + b, 0);
  return { normal, wild };
}

/** The reveal. Only meaningful once every allocation is known. */
export function resolveSession(session, ruleset) {
  const allocations = Object.fromEntries(session.players.map((p) => [p.id, { player_id: p.id, ...allocationOf(session, p.id) }]));
  return resolveProfile(ruleset.config, tableStates(session, ruleset), allocations, session.players.length, ruleset.extras);
}

/** What a shared screen may show: everything except allocations, which appear only in the results phase. */
export function publicView(session) {
  const s = JSON.parse(JSON.stringify(session));
  if (s.phase !== 'results') s.allocations = {};
  return s;
}
