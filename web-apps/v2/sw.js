// Service worker — scope: web-apps/v2/. Makes the player pages work with no signal.
//
// Strategy: precache the list below on install; serve from cache first and refresh the
// cached copy in the background (stale-while-revalidate), so an update published today is
// what players see on their NEXT visit without anyone bumping a version. Bump VERSION
// only to force-drop old caches (e.g. after renaming files).
//
// tools/check-rules-data.mjs verifies that every file here exists and that every page,
// script, style and the ACTIVE rules file is listed.

const VERSION = '2026-11-12.2';
const CACHE = 'arcane-drought-v2-' + VERSION;

const PRECACHE = [
  'index.html',
  'play/index.html',
  'rules/index.html',
  'learn/index.html',
  'studio/index.html',
  'manifest.webmanifest',
  'assets/tokens.css',
  'assets/site.css',
  'assets/js/app.js',
  'assets/js/ui.js',
  'assets/js/hand-checker.js',
  'assets/js/play.js',
  'assets/js/rules-page.js',
  'assets/js/pages.js',
  'learn/explainers/engine.js',
  'learn/explainers/kit.js',
  'learn/explainers/strings.en.js',
  'learn/explainers/explainers.css',
  'learn/explainers/turn-counters.js',
  'learn/explainers/capacity-timing.js',
  'learn/explainers/unlearn.js',
  'learn/explainers/reshape.js',
  'learn/explainers/wild-declaration.js',
  'learn/explainers/drought.js',
  'trials/index.html',
  'trials/trials.css',
  'trials/app.js',
  'trials/views.js',
  'trials/state.js',
  'trials/book.js',
  'trials/describe.js',
  'trials/strings.en.js',
  'trials/engine/power.js',
  'trials/engine/legality.js',
  'trials/engine/resolve.js',
  'trials/engine/advise.js',
  'trials/rulesets/index.js',
  'trials/rulesets/hybrid-family.js',
  'trials/rulesets/current-draft.js',
  'trials/rulesets/hybrid-rebuild.js',
  'trials/rulesets/c1-coherent-claim.js',
  'trials/rulesets/c2-guarded-table.js',
  'trials/rulesets/c3-open-skies.js',
  'trials/rulesets/c4-archspell-bold.js',
  'trials/net/room.js',
  'trials/net/qr.js',
  'trials/net/transport-firebase.js',
  'trials/net/transport-memory.js',
  'data/current.js',
  'data/rules.v3.1.js',
  'data/site.js',
  'data/strings.en.js',
  'assets/fonts/cinzel-var.woff2',
  'assets/fonts/cormorant-garamond-var.woff2',
  'assets/fonts/cormorant-garamond-italic-var.woff2',
  '../../art/energy-symbols-export/symbol_radiance_icon.svg',
  '../../art/energy-symbols-export/symbol_void_icon.svg',
  '../../art/energy-symbols-export/symbol_flux_icon.svg',
  '../../art/energy-symbols-export/symbol_aether_icon.svg',
  '../../art/energy-symbols-export/symbol_echo_icon.svg',
  '../../art/energy-symbols-export/symbol_wild_icon.svg',
];

const absolute = (path) => new URL(path, self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // One missing file must not stop the rest from being cached.
      .then((cache) => Promise.allSettled(PRECACHE.map((path) => cache.add(new Request(absolute(path), { cache: 'reload' })))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('arcane-drought-v2-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const here = new URL(request.url);
  if (here.origin !== self.location.origin) return;

  // A folder address (…/play/) is the same page as …/play/index.html.
  const key = here.pathname.endsWith('/') ? here.origin + here.pathname + 'index.html' : here.origin + here.pathname;
  const known = PRECACHE.some((path) => absolute(path) === key);
  if (!known) return; // everything else (old pages, Trials companion, PDFs) goes to the network untouched

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(key);
      const refresh = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(key, response.clone());
          return response;
        })
        .catch(() => cached);
      if (cached) {
        event.waitUntil(refresh);
        return cached;
      }
      return refresh;
    }),
  );
});
