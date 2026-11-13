// Networked play: the seal-and-reveal protocol, run with several "phones" on an
// in-memory room. No network is touched.
import test from 'node:test';
import assert from 'node:assert/strict';
import { connectRoom, roomToSession, sealOf, canonicalAllocation, verifyRoom, roomCode, cleanCode, seating } from '../net/room.js';
import { memoryHub, setAt } from '../net/transport-memory.js';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { applyEvent, databaseUrlIn } from '../net/transport-firebase.js';
import { HERE } from './helpers.mjs';
import { resolveSession } from '../state.js';
import { loadRuleset, RULESETS } from '../rulesets/index.js';

const settle = () => new Promise((r) => setTimeout(r, 5));
function phone(hub, code, id) {
  const kept = new Map();
  const seen = { session: null };
  const api = connectRoom({ transport: hub.room(code), meId: id, store: { get: (k, f) => (kept.has(k) ? kept.get(k) : f), set: (k, v) => kept.set(k, v) }, onChange: (s) => { seen.session = s; }, onError: (e) => { throw e; } }).start();
  return { api, seen, kept };
}
const RS = RULESETS[0].id;
const spells = (e) => [{ id: 's1', type: 'conjuration', size: 6, energy_domain: e, cards: null }];

async function seated() {
  const hub = memoryHub();
  const ana = phone(hub, 'ABCD', 'ana'); const ben = phone(hub, 'ABCD', 'ben');
  await ana.api.create({ name: 'Ana', rulesetId: RS, options: {} });
  await ben.api.join({ name: 'Ben' });
  await ana.api.setBook(spells('void')); await ben.api.setBook(spells('flux'));
  await ana.api.setDone(true); await ben.api.setDone(true);
  await settle();
  return { hub, ana, ben };
}

test('a seal is stable for equal allocations and different for different ones', async () => {
  const a = { normal: { t1: { void: 3, flux: 0 }, t2: {} }, wild: { t1: 1, t2: 0 }, mark: null };
  const b = { wild: { t1: 1 }, normal: { t1: { void: 3 } } };
  assert.equal(canonicalAllocation(a), canonicalAllocation(b));
  assert.equal(await sealOf(a, 'salt'), await sealOf(b, 'salt'));
  assert.notEqual(await sealOf(a, 'salt'), await sealOf(a, 'pepper'));
  assert.notEqual(await sealOf(a, 'salt'), await sealOf({ ...b, mark: 't1' }, 'salt'));
  assert.match(await sealOf(a, 'salt'), /^[0-9a-f]{64}$/);
});

test('joining: one room, unique names, no late arrivals', async () => {
  const { hub, ana, ben } = await seated();
  assert.deepEqual(ana.seen.session.players.map((p) => p.name), ['Ana', 'Ben']);
  assert.deepEqual(ben.seen.session.books.ana.map((s) => s.energy_domain), ['void'], 'Spellbooks are public');
  await assert.rejects(phone(hub, 'ABCD', 'x').api.join({ name: 'ana' }), (e) => e.code === 'name-taken');
  await assert.rejects(phone(hub, 'ZZZZ', 'x').api.join({ name: 'Cy' }), (e) => e.code === 'no-such-room');
  await assert.rejects(phone(hub, 'ABCD', 'x').api.create({ name: 'Cy', rulesetId: RS }), (e) => e.code === 'room-exists');
  await ana.api.startAllocation(); await settle();
  await assert.rejects(phone(hub, 'ABCD', 'x').api.join({ name: 'Cy' }), (e) => e.code === 'room-started');
  await ben.api.join({ name: 'Ben' }); // a rejoin is fine
});

test('an allocation never reaches the room, or another phone, before the reveal', async () => {
  const { hub, ana, ben } = await seated();
  await ana.api.startAllocation(); await settle();
  ana.api.setAllocation({ normal: { energy_purity: { void: 9 } }, wild: {}, mark: null });
  ben.api.setAllocation({ normal: { energy_purity: { flux: 7 } }, wild: { energy_purity: 1 }, mark: null });
  await ana.api.seal(); await settle();
  const text = JSON.stringify(hub.peek('ABCD'));
  assert.ok(!text.includes('energy_purity'), 'the room holds no allocation');
  assert.match(hub.peek('ABCD').players.ana.seal, /^[0-9a-f]{64}$/);
  assert.deepEqual(Object.keys(ben.seen.session.allocations), ['ben'], "Ben's phone holds only Ben's allocation");
  assert.deepEqual(ben.seen.session.locked, { ana: true }, 'that Ana has locked is public');
  assert.equal(ben.seen.session.phase, 'allocate');
  // Ana reopens, changes her mind, locks again.
  await ana.api.unseal(); await settle();
  assert.deepEqual(ben.seen.session.locked, {});
  ana.api.setAllocation({ normal: { energy_purity: { void: 8 } }, wild: { energy_purity: 1 }, mark: null });
  await ana.api.seal(); await ben.api.seal(); await settle();
  assert.equal(ana.seen.session.phase, 'allocate', 'nothing is revealed until the host says so');
  await ana.api.reveal(); await settle(); await settle();
  assert.equal(ana.seen.session.phase, 'results');
  assert.deepEqual(ben.seen.session.allocations.ana, { normal: { energy_purity: { void: 8 } }, wild: { energy_purity: 1 }, mark: null });
  assert.deepEqual(await ana.api.verify(), { ana: true, ben: true });
  await assert.rejects(ana.api.unseal(), (e) => e.code === 'wrong-phase');
  // Both phones resolve the same result from the same public data.
  const rs = loadRuleset(RS);
  assert.deepEqual(resolveSession(ana.seen.session, rs), resolveSession(ben.seen.session, rs));
});

test('an allocation changed after sealing is caught', async () => {
  const { hub, ana, ben } = await seated();
  await ana.api.startAllocation(); await settle();
  ana.api.setAllocation({ normal: { energy_purity: { void: 5 } }, wild: {}, mark: null });
  ben.api.setAllocation({ normal: { energy_purity: { flux: 7 } }, wild: {}, mark: null });
  await ana.api.seal(); await ben.api.seal(); await settle();
  // Ben's phone will not publish anything that does not match his own seal…
  ben.kept.set('net:1', { ...ben.kept.get('net:1'), allocation: { normal: { energy_purity: { flux: 9 } }, wild: {}, mark: null } });
  await ana.api.reveal(); await settle(); await settle();
  assert.equal(hub.peek('ABCD').players.ben.open, undefined);
  assert.equal(ana.seen.session.phase, 'allocate');
  assert.equal(ana.seen.session.net.revealing, true);
  // …and a forged one written straight to the room fails the check on every phone.
  await hub.room('ABCD').patch('players/ben', { open: { allocation: { normal: { energy_purity: { flux: 9 } }, wild: {}, mark: null }, salt: ben.kept.get('net:1').salt } });
  await settle();
  assert.deepEqual(await verifyRoom(hub.peek('ABCD')), { ana: true, ben: false });
});

test('the host can let the reveal open by itself, and a rematch starts a clean round', async () => {
  const { hub, ana, ben } = await seated();
  ana.api.autoReveal = true;
  await ana.api.startAllocation(); await settle();
  await ana.api.seal(); await ben.api.seal(); await settle(); await settle(); await settle();
  assert.equal(ben.seen.session.phase, 'results');
  await ana.api.rematch(); await settle();
  assert.deepEqual([ben.seen.session.phase, ben.seen.session.net.round, ben.seen.session.books.ana, ben.seen.session.locked], ['books', 2, [], {}]);
  assert.deepEqual(seating(hub.peek('ABCD')).map((p) => p.name), ['Ana', 'Ben']);
});

test('room codes, and the tree helpers the database transport relies on', () => {
  assert.match(roomCode(), /^[A-HJ-NP-Z]{4}$/);
  assert.equal(cleanCode(' ab-cd9e '), 'ABCD');
  assert.deepEqual(setAt({ a: { b: 1, c: 2 } }, 'a/b', null), { a: { c: 2 } }, 'null deletes');
  assert.deepEqual(setAt({ a: { b: 1 } }, 'a/b', null), {}, 'empty parents vanish, as in the database');
  let tree = applyEvent({}, 'put', { path: '/', data: { meta: { phase: 'books' }, players: { a: { name: 'A' } } } });
  tree = applyEvent(tree, 'patch', { path: '/players/a', data: { seal: 'x', done: true } });
  tree = applyEvent(tree, 'put', { path: '/meta/phase', data: 'allocate' });
  tree = applyEvent(tree, 'put', { path: '/players/a/seal', data: null });
  assert.deepEqual(tree, { meta: { phase: 'allocate' }, players: { a: { name: 'A', done: true } } });
  assert.equal(roomToSession({}, 'x').phase, 'books');
  assert.equal(roomToSession(null, 'x').players.length, 0);
});

test('the database address is read from the existing companion page, not stored in v2', (t) => {
  assert.equal(databaseUrlIn('const firebaseConfig = { databaseURL: "https://example-rtdb.firebaseio.com/", x: 1 }'), 'https://example-rtdb.firebaseio.com');
  assert.equal(databaseUrlIn('nothing here'), null);
  const old = path.join(HERE, '../../../trials-multiplayer.html');
  if (!existsSync(old)) return t.skip('old companion page not present');
  const url = databaseUrlIn(readFileSync(old, 'utf8'));
  assert.match(url, /^https:\/\/[a-z0-9-]+\.firebase(io\.com|database\.app)$/);
  // …and v2 itself carries no copy of it.
  for (const f of ['../net/transport-firebase.js', '../net/room.js', '../app.js']) assert.ok(!readFileSync(path.join(HERE, f), 'utf8').includes(new URL(url).host), f);
});
