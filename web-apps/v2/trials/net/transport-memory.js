// An in-memory room with the same behaviour the real database has where it matters:
// one JSON tree, null and empty values vanish, every listener gets the whole tree after
// every write. `memoryHub` serves the tests; `localRoom` serves ?net=local — the same
// protocol between tabs of one browser, through localStorage, with no network at all.

const prune = (v) => {
  if (v == null) return undefined;
  if (typeof v !== 'object') return v;
  const out = Array.isArray(v) ? [] : {};
  for (const [k, x] of Object.entries(v)) { const p = prune(x); if (p !== undefined) out[k] = p; }
  return Object.keys(out).length ? out : undefined;
};
const copy = (v) => (v === undefined ? null : JSON.parse(JSON.stringify(v)));
const parts = (path) => String(path || '').split('/').filter(Boolean);

export function setAt(tree, path, value) {
  const keys = parts(path);
  if (!keys.length) return prune(value) || {};
  const root = tree && typeof tree === 'object' ? tree : {};
  let node = root;
  for (const k of keys.slice(0, -1)) { if (node[k] == null || typeof node[k] !== 'object') node[k] = {}; node = node[k]; }
  node[keys.at(-1)] = value;
  return prune(root) || {};
}
export const getAt = (tree, path) => parts(path).reduce((node, k) => (node == null ? node : node[k]), tree);

/** A hub is one "database"; hub.room(code) is a transport for one room. */
export function memoryHub() {
  const rooms = new Map();
  const listeners = new Map();
  const tell = (code) => { for (const fn of listeners.get(code) || []) queueMicrotask(() => fn(copy(rooms.get(code)))); };
  return {
    peek: (code) => copy(rooms.get(code)),
    room(code) {
      const write = (path, value) => { rooms.set(code, setAt(copy(rooms.get(code)) || {}, path, value)); tell(code); };
      return {
        get: async (path) => copy(getAt(rooms.get(code), path)),
        put: async (path, value) => write(path, value),
        patch: async (path, object) => { for (const [k, v] of Object.entries(object)) write((path ? path + '/' : '') + k, v); },
        listen(onTree) {
          if (!listeners.has(code)) listeners.set(code, new Set());
          listeners.get(code).add(onTree);
          queueMicrotask(() => onTree(copy(rooms.get(code))));
          return () => listeners.get(code).delete(onTree);
        },
      };
    },
  };
}

/** A room shared by the tabs of one browser (for trying networked play on one machine). */
export function localRoom(code, storage = globalThis.localStorage, target = globalThis) {
  const key = 'ad2:trials-room:' + code;
  const read = () => { try { return JSON.parse(storage.getItem(key)) || {}; } catch { return {}; } };
  const mine = new Set();
  const write = (path, value) => { storage.setItem(key, JSON.stringify(setAt(read(), path, value))); for (const fn of mine) fn(read()); };
  return {
    get: async (path) => copy(getAt(read(), path)),
    put: async (path, value) => write(path, value),
    patch: async (path, object) => { for (const [k, v] of Object.entries(object)) write((path ? path + '/' : '') + k, v); },
    listen(onTree) {
      const other = (event) => { if (event.key === key) onTree(read()); };
      mine.add(onTree);
      target.addEventListener('storage', other);
      queueMicrotask(() => onTree(read()));
      return () => { mine.delete(onTree); target.removeEventListener('storage', other); };
    },
  };
}
