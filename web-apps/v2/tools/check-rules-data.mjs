#!/usr/bin/env node
// check-rules-data — fails loudly when the site's rules data disagrees with the sources.
//
//   node web-apps/v2/tools/check-rules-data.mjs        (from the repo root, or anywhere)
//
// Reads (never writes): meta/canon.yml, the rulebook, the Scoring System Reference.
// Compares them with the ACTIVE rules module (whatever data/current.js imports), then
// checks the things that cannot import a module: static titles, the offline cache list,
// and vocabulary. Exit code 1 on any mismatch. No dependencies.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BASE_RULES as R, SITE, deckSize, withVariants } from '../data/current.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const V2 = path.resolve(here, '..');
const ROOT = path.resolve(V2, '../..');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');

const results = [];
const check = (source, what, expected, actual) => {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  results.push({ ok, source, what, expected, actual });
};
const must = (source, what, condition, detail = '') => results.push({ ok: !!condition, source, what, expected: true, actual: condition ? true : detail || false });
const grab = (text, regex, source, what) => {
  const m = text.match(regex);
  if (!m) results.push({ ok: false, source, what, expected: 'a line matching ' + regex, actual: 'not found' });
  return m;
};
const int = (s) => parseInt(s, 10);

// ── Sources ─────────────────────────────────────────────────────────────────────────
const canonText = read(R.sources.canon);
const canon = {};
for (const line of canonText.split(/\r?\n/)) {
  const m = line.match(/^([a-z0-9_]+):\s*(.*)$/);
  if (m) canon[m[1]] = m[2].trim();
}
const rulebook = read(R.sources.rulebook);
const scoring = read(R.sources.scoring);
const frontMatter = (text) => {
  const block = (text.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
  const out = {};
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^([a-z_]+):\s*(.+)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
};

// ── 1. Version and status ───────────────────────────────────────────────────────────
const C = 'meta/canon.yml';
const RB = 'rulebook';
const SR = 'Scoring System Reference';
check(C, 'rulebook_version', canon.rulebook_version, 'v' + R.version);
check(RB, 'front-matter version', frontMatter(rulebook).version, 'v' + R.version);
check(SR, 'front-matter version', frontMatter(scoring).version, 'v' + R.version);
check(RB, 'front-matter status ↔ data status', frontMatter(rulebook).status === 'under-test', R.status === 'under-test');
check(SR, 'front-matter status ↔ data status', frontMatter(scoring).status === 'under-test', R.status === 'under-test');

// ── 2. Recognition Points table ─────────────────────────────────────────────────────
{
  const header = grab(scoring, /^\|\s*Size[^\n]*\|\s*$/m, SR, 'score table header');
  const names = header ? header[0].split('|').map((s) => s.trim()).filter(Boolean).slice(1) : [];
  const byName = Object.fromEntries(Object.values(R.spells).map((s) => [s.name, s.key]));
  check(SR, 'score table column order', names.map((n) => byName[n]), R.scoreTable.columns);
  const parsed = { sizes: [] };
  for (const key of R.scoreTable.columns) parsed[key] = [];
  for (const row of scoring.matchAll(/^\|\s*(\d+)\s*\|([^\n]+)\|\s*$/gm)) {
    const cells = row[2].split('|').map((s) => s.trim());
    parsed.sizes.push(int(row[1]));
    names.forEach((name, i) => {
      if (/^\d+$/.test(cells[i])) parsed[byName[name]].push(int(cells[i]));
    });
  }
  check(SR, 'score table sizes', parsed.sizes, R.scoreTable.sizes);
  for (const key of R.scoreTable.columns) check(SR, `score column: ${key}`, parsed[key], R.scoreTable[key]);
  const tb = grab(scoring, /Tiebreaker:\s*(.+)/, SR, 'tiebreaker line');
  if (tb) check(SR, 'tiebreakers', tb[1].split('→').map((s) => s.trim().toLowerCase().replace(/[.\s]+$/, '')), R.tiebreakers.map((s) => s.toLowerCase().replace(' the ', ' ')));
}

// ── 3. canon.yml facts ──────────────────────────────────────────────────────────────
{
  const deckLine = (key, deck) => {
    const m = grab(canon[key] || '', /(\d+) energies x ranks (\d+)-(\d+) \+ (\d+) wilds = (\d+) cards/, C, key);
    if (!m) return;
    check(C, `${key}: energies`, int(m[1]), deck.energies.length);
    check(C, `${key}: ranks`, [int(m[2]), int(m[3])], [deck.minValue, deck.maxValue]);
    check(C, `${key}: wilds`, int(m[4]), deck.wilds);
    check(C, `${key}: total cards`, int(m[5]), deckSize(deck));
  };
  deckLine('deck_2_4p', R.decks.base);
  deckLine('deck_5_6p', R.decks.echo);

  const nameOf = (key) => R.energies.find((e) => e.key === key).name;
  check(C, 'energies_base', canon.energies_base.split(',').map((s) => s.trim()), R.decks.base.energies.map(nameOf));
  const fifth = R.decks.echo.energies.filter((e) => !R.decks.base.energies.includes(e)).map(nameOf);
  check(C, 'energy_fifth', [canon.energy_fifth.split(/\s/)[0]], fifth);
  check(C, 'spell_types', canon.spell_types.split(',').map((s) => s.trim()), R.spellOrder.map((k) => R.spells[k].name));

  const ladder = [...(canon.enchantment_ladder || '').matchAll(/(\d)-card = \+(\d+) counters? \/ score (\d+)/g)];
  check(C, 'enchantment_ladder: sizes and counters', ladder.map((m) => [int(m[1]), int(m[2])]), R.enchantmentLadder.map((r) => [r.size, r.counters]));
  check(C, 'enchantment_ladder: scores', ladder.map((m) => int(m[3])), R.scoreTable.enchantment);
  must(C, 'enchantment_ladder: top rung is Echo-deck only', /5-6p\/Echo only/.test(canon.enchantment_ladder) === !!(R.enchantmentLadder.at(-1).decks || []).includes('echo'));

  const sc = grab(canon.starting_counters || '', /2-4p = (\d+) counters?; 5-6p = (\d+) counters?/, C, 'starting_counters');
  if (sc) check(C, 'starting_counters', [int(sc[1]), int(sc[2])], R.players.groups.map((g) => g.startingCounters));
  check(C, 'max_spell_size', int(canon.max_spell_size), R.limits.maxSpellSize);
  check(C, 'max_spell_size ↔ score table', int(canon.max_spell_size), R.scoreTable.sizes.at(-1));
  must(C, 'game_title_final starts with the site title', (canon.game_title_final || '').startsWith(SITE.title), canon.game_title_final);
}

// ── 4. Rulebook facts ───────────────────────────────────────────────────────────────
{
  const m1 = grab(rulebook, /All players: (\d+) cards each/, RB, 'hand size');
  if (m1) check(RB, 'hand size', int(m1[1]), R.setup.handSize);
  const m2 = grab(rulebook, /Place (\d+) cards face-up to form The Array/, RB, 'Array size');
  if (m2) check(RB, 'Array size', int(m2[1]), R.setup.arraySize);
  const m3 = grab(rulebook, /chooses (\d+) component from their hand and places it in the Arcane Reserve/, RB, 'the Opening');
  if (m3) check(RB, 'Opening discard', int(m3[1]), R.setup.openingDiscard);

  const d24 = grab(rulebook, /2-4 players: Four energy types[^\n]*= (\d+) cards, plus (\d+) wilds = (\d+) cards/, RB, '2-4p deck line');
  if (d24) check(RB, '2-4p deck', [int(d24[2]), int(d24[3])], [R.decks.base.wilds, deckSize(R.decks.base)]);
  const d56 = grab(rulebook, /5-6 players: Five energy types[^\n]*= (\d+) cards, plus (\d+) wilds = (\d+) cards/, RB, '5-6p deck line');
  if (d56) check(RB, '5-6p deck', [int(d56[2]), int(d56[3])], [R.decks.echo.wilds, deckSize(R.decks.echo)]);
  const cs = grab(rulebook, /2-4 players: (\d+) counter each\.\s*\n\s*- 5-6 players: (\d+) counters each\./, RB, 'starting counters');
  if (cs) check(RB, 'starting counters', [int(cs[1]), int(cs[2])], R.players.groups.map((g) => g.startingCounters));

  const conj = R.spells.conjuration.cast.tiers;
  const c1 = grab(rulebook, /(\d+)-(\d+) components: \+(\d+) component\./, RB, 'Conjuration small tier');
  if (c1) check(RB, 'Conjuration small tier', [int(c1[1]), int(c1[2]), int(c1[3])], [conj[0].min, conj[0].max, conj[0].draw]);
  const c2 = grab(rulebook, /(\d+)\+ components: \+(\d+) components\./, RB, 'Conjuration large tier');
  if (c2) check(RB, 'Conjuration large tier', [int(c2[1]), int(c2[2])], [conj[1].min, conj[1].draw]);

  const tf = R.spells.transfiguration.cast.tiers;
  const t1 = grab(rulebook, /(\d+) components: Discard (\d+) from hand, take (\d+) from Array\./, RB, 'Transfiguration small tier');
  if (t1) check(RB, 'Transfiguration small tier', [int(t1[1]), int(t1[2]), int(t1[3])], [tf[0].min, tf[0].discard, tf[0].take]);
  const t2 = grab(rulebook, /(\d+)\+ components: Discard (\d+) from hand, take (\d+) from Array\./, RB, 'Transfiguration large tier');
  if (t2) check(RB, 'Transfiguration large tier', [int(t2[1]), int(t2[2]), int(t2[3])], [tf[1].min, tf[1].discard, tf[1].take]);

  const rungs = [...rulebook.matchAll(/^\s*- (\d) components: \+(\d+) counters? \(scores (\d+)\)\./gm)];
  check(RB, 'Enchantment ladder', rungs.map((m) => [int(m[1]), int(m[2]), int(m[3])]), R.enchantmentLadder.map((r, i) => [r.size, r.counters, R.scoreTable.enchantment[i]]));
  const er = grab(rulebook, /Requirements: (\d+)-(\d+) components of the same value\./, RB, 'Enchantment size range');
  if (er) check(RB, 'Enchantment size range', [int(er[1]), int(er[2])], [R.spells.enchantment.minSize, R.spells.enchantment.maxSize]);
  for (const [key, regex] of [
    ['conjuration', /Requirements: (\d+)\+ components of the same energy\./],
    ['transfiguration', /Requirements: (\d+)\+ components in consecutive sequence/],
    ['perfect', /Requirements: (\d+)\+ components in sequence, all from the same energy\./],
  ]) {
    const m = grab(rulebook, regex, RB, `${key} minimum size`);
    if (m) check(RB, `${key} minimum size`, int(m[1]), R.spells[key].minSize);
  }
  must(RB, 'Perfect Transmutation is both effects, mandatory', /Receives BOTH Conjuration and Transfiguration benefits \(both mandatory\)/.test(rulebook) && R.spells.perfect.cast.kind === 'both');
  must(RB, 'Reshape costs one counter per spell broken down', /Costs one counter per spell broken down/.test(rulebook) && R.learning.find((a) => a.key === 'reshape').cost.per === 'spell broken down');
  must(RB, 'capacity gains arrive next turn, losses apply immediately', /start of your next turn/.test(rulebook) && /capacity loss applies \*\*immediately\*\*/.test(rulebook) && R.capacity.gain === 'next-turn' && R.capacity.loss === 'immediate');
  const tb = grab(rulebook, /Tiebreakers: (.+)\./, RB, 'tiebreakers');
  if (tb) check(RB, 'tiebreakers', tb[1].split(/, then /).map((s) => s.trim().toLowerCase()), R.tiebreakers.map((s) => s.toLowerCase().replace(' the ', ' ')));
  check(RB, 'learning actions', ['LEARN', 'EMPOWER', 'RESHAPE', 'UNLEARN'].filter((a) => new RegExp('^#### ' + a + '$', 'm').test(rulebook)), R.learning.map((a) => a.name.toUpperCase()));
}

// ── 5. Internal consistency of the data module ──────────────────────────────────────
{
  const D = 'rules data';
  for (const key of R.scoreTable.columns) {
    const spell = R.spells[key];
    check(D, `${key}: score column covers sizes ${spell.minSize}–${spell.maxSize}`, R.scoreTable[key].length, spell.maxSize - spell.minSize + 1);
  }
  for (const key of ['conjuration', 'transfiguration']) {
    const tiers = R.spells[key].cast.tiers;
    must(D, `${key}: cast tiers cover every size without gaps`, tiers[0].min === R.spells[key].minSize && tiers.at(-1).max === R.spells[key].maxSize && tiers.every((t, i) => i === 0 || t.min === tiers[i - 1].max + 1));
  }
  for (const group of R.players.groups) must(D, `player group ${group.id} names a deck`, !!R.decks[group.deck]);
  for (const variant of R.variants) {
    try {
      withVariants(R, [variant.key]);
      must(D, `variant "${variant.key}" patches apply cleanly`, true);
    } catch (error) {
      must(D, `variant "${variant.key}" patches apply cleanly`, false, error.message);
    }
    must(D, `variant "${variant.key}" is off by default while ${variant.status}`, variant.status === 'canon' || variant.default === false);
  }
  const ids = R.chapters.flatMap((c) => [c.id, ...c.blocks.filter((b) => b.t === 'h').map((b) => b.id)]);
  must(D, 'section ids are unique', new Set(ids).size === ids.length, ids.filter((id, i) => ids.indexOf(id) !== i).join(', '));
  for (const id of ['set-up', 'spells', 'normal-turn', 'drought-turn', 'recognition-points', 'ascension-trials']) {
    must(D, `old Online Rules deep link #${id} still exists`, ids.includes(id));
  }
}

// ── 6. Static mirrors, offline list, vocabulary ─────────────────────────────────────
{
  const S = 'site files';
  const walk = (dir) => readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (name === '_plan' || name === 'fonts' || name === 'node_modules') return [];
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
  const files = walk(V2);
  const rel = (f) => path.relative(V2, f).split(path.sep).join('/');

  // Title: one source (data/site.js); these are the mirrors that cannot import it.
  for (const file of files.filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
    must(S, `${rel(file)}: <title> carries the site title`, title.includes(SITE.title), title);
    const visible = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/\s(?:href|src|content)="[^"]*"/g, '');
    must(S, `${rel(file)}: working title absent from page text`, !/Archmage/.test(visible));
    for (const m of html.matchAll(/<link rel="(?:modulepreload|preload|stylesheet)" href="([^"]+)"/g)) {
      must(S, `${rel(file)}: linked file exists — ${m[1]}`, existsSync(path.resolve(path.dirname(file), m[1])));
    }
  }
  const manifestPath = path.join(V2, 'manifest.webmanifest');
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    check(S, 'manifest.webmanifest: name', manifest.name, SITE.title);
  }

  // Offline list: every precached file exists, and the active rules file is in it.
  const swPath = path.join(V2, 'sw.js');
  if (existsSync(swPath)) {
    const sw = readFileSync(swPath, 'utf8');
    const listed = [...sw.matchAll(/^\s*'([^']+)',\s*$/gm)].map((m) => m[1]);
    for (const entry of listed) {
      const target = path.resolve(V2, entry.endsWith('/') ? entry + 'index.html' : entry);
      must(S, `sw.js: precached file exists — ${entry}`, existsSync(target));
    }
    const current = readFileSync(path.join(V2, 'data/current.js'), 'utf8');
    const active = (current.match(/from '\.\/(rules\.[^']+)'/) || [])[1];
    must(S, `sw.js precaches the active rules file (data/${active})`, listed.includes('data/' + active));
    for (const file of files.filter((f) => /\.(js|css|html)$/.test(f) && !/\/(tools|tests)\//.test(f.split(path.sep).join('/')) && !f.endsWith('sw.js'))) {
      const entry = rel(file);
      must(S, `sw.js precaches ${entry}`, listed.includes(entry));
    }
  }

  // Vocabulary. Retired terms come from canon.yml (so this file never spells them);
  // the rest are the old words the v2 brief bans from player-facing text.
  const retired = (canon.retired_terms || '').split(',').map((s) => s.trim()).filter(Boolean);
  const banned = ['Vault', 'Wild Magic', 'Spades', 'Hearts', 'Diamonds', 'Clubs', 'suit', 'Unlimited'].concat(retired);
  const elements = /\b(Fire|Water|Earth|Air)\b/;
  for (const file of files.filter((f) => /\.(html|js|css|webmanifest)$/.test(f) && !f.includes(path.sep + 'tools' + path.sep))) {
    const text = readFileSync(file, 'utf8');
    for (const term of banned) must(S, `${rel(file)}: no "${term}"`, !new RegExp('\\b' + term, 'i').test(text) || (term === 'suit' && !/\bsuits?\b/i.test(text)));
    must(S, `${rel(file)}: no classical-element energy names`, !elements.test(text));
    must(S, `${rel(file)}: no "exchange" (old Array term)`, !/exchang/i.test(text));
  }
  for (const file of files.filter((f) => /\.(md|mjs|json)$/.test(f))) {
    const text = readFileSync(file, 'utf8');
    for (const term of retired) must(S, `${rel(file)}: retired canon term absent`, !text.includes(term));
  }
}

// ── Report ──────────────────────────────────────────────────────────────────────────
const failed = results.filter((r) => !r.ok);
const show = (v) => (typeof v === 'string' ? v : JSON.stringify(v));
if (process.argv.includes('--verbose')) for (const r of results.filter((x) => x.ok)) console.log(`  ok    [${r.source}] ${r.what}`);
for (const r of failed) {
  console.error(`  FAIL  [${r.source}] ${r.what}\n          source says: ${show(r.expected)}\n          site data:   ${show(r.actual)}`);
}
console.log(`\ncheck-rules-data: rules ${R.id} (${R.status}) · title "${SITE.title}" · ${results.length - failed.length} passed, ${failed.length} failed`);
if (failed.length) {
  console.error(`\nMISMATCH — the site would show something the sources do not say. Fix data/rules.${R.id}.js (or the source), then re-run.`);
  process.exit(1);
}
