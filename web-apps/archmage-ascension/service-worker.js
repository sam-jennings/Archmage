const CACHE_NAME = 'archmage-ascension-v2';
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./Archmage%20Ascension.html",
  "./manifest.json",
  "./manifest.webmanifest",
  "./icon.svg",
  "./game/lib/tokens.css",
  "./game/styles.css",
  "./colors_and_type.css",
  "./vendor/react.min.js",
  "./vendor/react-dom.min.js",
  "./vendor/babel.min.js",
  "./game/lib/cards.js",
  "./game/lib/connectors/bloom-soft.js",
  "./game/lib/connectors/notch.js",
  "./game/lib/connectors/celestial.js",
  "./game/lib/connectors/triangle.js",
  "./game/lib/art/mystic.js",
  "./game/lib/art/ritual.js",
  "./game/lib/art/sigil.js",
  "./game/lib/art/runic.js",
  "./game/engine.js",
  "./game/state.js",
  "./game/ai.js",
  "./game/drag-controller.js",
  "./game/cards-ui.jsx",
  "./game/spell-tableau.jsx",
  "./game/cauldron.jsx",
  "./game/title.jsx",
  "./game/endgame.jsx",
  "./game/play.jsx",
  "./game/tweaks-panel.jsx",
  "./game/app.jsx",
  "./src/main.jsx",
  "./src/install-globals.js"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then((cached) => cached || fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }))
      .catch(() => caches.match('./Archmage%20Ascension.html', { ignoreSearch: true }))
  );
});
