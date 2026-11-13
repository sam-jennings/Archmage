// Site-level facts that do not depend on the rules version.
// THE GAME TITLE LIVES HERE AND ONLY HERE. Pages read it at runtime.
// Two static mirrors cannot import a module (the <title> fallback in each HTML file and
// manifest.webmanifest); tools/check-rules-data.mjs fails if either drifts from this value.

export const SITE = {
  title: 'Arcane Drought',

  // All hrefs are relative to the v2 root (web-apps/v2/). Pages declare their own depth
  // with <html data-root="../"> and app.js resolves from there.
  nav: [
    { key: 'play', href: 'play/index.html' },
    { key: 'learn', href: 'learn/index.html' },
    { key: 'rules', href: 'rules/index.html' },
  ],
  home: 'index.html',
  studio: 'studio/index.html',

  // Canonical energy art. Never copied, never redrawn: referenced where it lives.
  symbolDir: '../../art/energy-symbols-export/',
  symbolFile: (key) => `symbol_${key}_icon.svg`,

  // Existing surfaces outside v2 that are linked for now.
  links: {
    trialsCompanion: 'trials/index.html',
    trialsCompanionOld: '../trials-multiplayer.html',
    trialsOldRules: '../archmage-reference.html#ascension-trials',
    optimizer: '../spellbook-optimizer.html',
    pitchSheet: '../../pitch/archmage_pitch_sheet.html',
    digitalGame: '../archmage-ascension/Archmage%20Ascension.html',
    boardPdf: '../../board/archmage_a3_landscape_board.pdf',
    repo: 'https://github.com/sam-jennings/Archmage',
  },

  // Mount points for later sessions. Explainer entry: { id, title, blurb, href, slots }.
  // A slot is a section id where a "Show me" disclosure appears; prefix it with 'play:' or
  // 'rules:' to show it on that page only. Other entries: { id, title, blurb, href, status }.
  // Prompt 2 fills `explainers`; Prompt 3 sets `trials`; Prompt 4 fills `expansions`.
  mounts: {
    explainers: [
      { id: 'turn-counters', title: 'Counters through a turn', blurb: 'Cast, Recall, Learn: where your counters go and why they all come back.', href: 'learn/index.html#explainer-turn-counters', slots: ['play:normal-turn', 'rules:recall'] },
      { id: 'capacity-timing', title: 'When capacity changes', blurb: 'Gains arrive next turn. Losses apply now, and you need room for them.', href: 'learn/index.html#explainer-capacity-timing', slots: ['play:counters', 'rules:enchantment-timing'] },
      { id: 'unlearn', title: 'Taking components back', blurb: 'Unlearn: one counter, one spell, any number of components.', href: 'learn/index.html#explainer-unlearn', slots: ['unlearn'] },
      { id: 'reshape', title: 'Reshape, a worked example', blurb: 'One counter per spell broken down; every component must land in a valid spell.', href: 'learn/index.html#explainer-reshape', slots: ['reshape'] },
      { id: 'wild-declaration', title: 'Declaring a wild', blurb: 'A wild is what you say it is, until the spell is rebuilt.', href: 'learn/index.html#explainer-wild-declaration', slots: ['play:spells', 'rules:wilds'] },
      { id: 'drought', title: 'The Drought', blurb: 'What happens when the Source runs dry, step by step.', href: 'learn/index.html#explainer-drought', slots: ['drought-turn'] },
    ],
    // Sections where an explainer link may appear once it exists (rules/play section ids).
    explainerSlots: ['counters', 'recall', 'enchantment-timing', 'wilds', 'reshape', 'unlearn', 'drought-turn'],
    trials: { title: 'Ascension Trials companion', href: 'trials/index.html' },
    expansions: [],
  },

  storagePrefix: 'ad2:',
};
