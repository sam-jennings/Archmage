// The real room: the project's existing Firebase Realtime Database, reached over its
// plain REST interface (fetch + EventSource). No SDK is loaded — this file is the whole
// network layer — and it is only imported when a wizard chooses networked play.
//
// The database address is NOT written here. It is read at run time from the page that
// already carries the project's configuration (web-apps/trials-multiplayer.html), so v2
// commits no configuration of its own.

import { setAt } from './transport-memory.js';

const CONFIG_PAGE = '../../trials-multiplayer.html'; // relative to this module's folder's parent (trials/)
let databaseUrl = null;

/** Find the databaseURL in the existing companion page. */
export async function findDatabaseUrl(base = new URL('..', import.meta.url)) {
  if (databaseUrl) return databaseUrl;
  const response = await fetch(new URL(CONFIG_PAGE, base));
  if (!response.ok) throw Object.assign(new Error('config-page-missing'), { code: 'config-page-missing' });
  databaseUrl = databaseUrlIn(await response.text());
  if (!databaseUrl) throw Object.assign(new Error('config-not-found'), { code: 'config-not-found' });
  return databaseUrl;
}

/** The databaseURL written in a page's Firebase configuration, or null. */
export function databaseUrlIn(text) {
  const match = /databaseURL\s*:\s*["'](https:\/\/[^"']+)["']/.exec(text);
  return match ? match[1].replace(/\/+$/, '') : null;
}

/** Apply one server-sent event ({ path, data }) to the local copy of the tree. */
export function applyEvent(tree, kind, { path, data }) {
  if (kind === 'put') return setAt(tree, path, data);
  if (kind === 'patch') { let next = tree; for (const [k, v] of Object.entries(data || {})) next = setAt(next, path.replace(/\/$/, '') + '/' + k, v); return next; }
  return tree;
}

/** A transport for one room. `rooms/t2-<code>` sits beside the old companion's rooms. */
export function firebaseRoom(dbUrl, code) {
  const at = (path) => `${dbUrl}/rooms/t2-${code}${path ? '/' + path : ''}.json`;
  const send = async (method, path, body) => {
    const response = await fetch(at(path), { method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) throw Object.assign(new Error('network'), { code: 'network', status: response.status });
  };
  return {
    async get(path) {
      const response = await fetch(at(path));
      if (!response.ok) throw Object.assign(new Error('network'), { code: 'network', status: response.status });
      return response.json();
    },
    put: (path, value) => (value === null ? send('DELETE', path) : send('PUT', path, value)),
    patch: (path, object) => send('PATCH', path, object),
    listen(onTree, onError = () => {}) {
      let tree = {};
      const source = new EventSource(at(''));
      const on = (kind) => (event) => { tree = applyEvent(tree, kind, JSON.parse(event.data)); onTree(JSON.parse(JSON.stringify(tree))); };
      source.addEventListener('put', on('put'));
      source.addEventListener('patch', on('patch'));
      source.addEventListener('cancel', () => onError(Object.assign(new Error('denied'), { code: 'denied' })));
      source.onerror = () => onError(Object.assign(new Error('offline'), { code: 'offline' })); // EventSource reconnects by itself
      return () => source.close();
    },
  };
}
