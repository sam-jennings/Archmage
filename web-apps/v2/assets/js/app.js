// Site shell: top bar, footer, document title, theme, offline. Every page loads this.
import { h, t, url, versionBadge, store, clear, RULES, SITE } from './ui.js';

const page = document.documentElement.dataset.page || 'home';

// Title: the one runtime source is data/site.js.
document.title = t('pageTitle.' + page, { title: SITE.title });
for (const node of document.querySelectorAll('[data-title]')) node.textContent = SITE.title;

// Theme: dark by default; daylight is a deliberate, remembered choice.
function applyTheme(theme) {
  if (theme === 'day') document.documentElement.dataset.theme = 'day';
  else delete document.documentElement.dataset.theme;
}
let theme = store.get('theme', 'dark');
applyTheme(theme);

function themeButton() {
  const button = h('button', { type: 'button', class: 'ax-theme' });
  const paint = () => {
    button.textContent = theme === 'day' ? '☾' : '☀';
    button.setAttribute('aria-label', theme === 'day' ? t('theme.toDark') : t('theme.toDay'));
    button.title = button.getAttribute('aria-label');
  };
  button.addEventListener('click', () => { theme = theme === 'day' ? 'dark' : 'day'; store.set('theme', theme); applyTheme(theme); paint(); });
  paint();
  return button;
}

const top = document.getElementById('top');
if (top) {
  clear(top).append(
    h('a', { class: 'ax-skip', href: '#main' }, t('skip')),
    h('a', { class: 'ax-brand', href: url(SITE.home) }, SITE.title),
    versionBadge(),
    h('nav', { class: 'ax-nav', 'aria-label': t('navLabel') }, SITE.nav.map((item) => h('a', { href: url(item.href), 'aria-current': item.key === page ? 'page' : null }, t('nav.' + item.key)))),
    themeButton(),
  );
}

const foot = document.getElementById('foot');
if (foot) {
  clear(foot).append(
    versionBadge(),
    h('span', null, t('foot.offline')),
    h('a', { href: url(SITE.studio) }, t('foot.studio')),
  );
}

// Offline: a service worker scoped to web-apps/v2/. Not available on file://.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => { navigator.serviceWorker.register(url('sw.js')).catch(() => {}); });
}

document.documentElement.dataset.ready = RULES.id;
