import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const MODEL = path.resolve(HERE, '../../../../ascension-trials/ascension_trials_model');
export const fixture = (name) => JSON.parse(readFileSync(path.join(HERE, 'fixtures', name), 'utf8'));
export const modelFile = (rel) => (existsSync(path.join(MODEL, rel)) ? JSON.parse(readFileSync(path.join(MODEL, rel), 'utf8')) : null);
export const modelText = (rel) => (existsSync(path.join(MODEL, rel)) ? readFileSync(path.join(MODEL, rel), 'utf8') : null);

/** A model-fixture state (no spells) in the shape the engine wants. */
export const st = (s) => ({ player_id: s.player_id, normal_power: { ...s.normal_power }, wild_power: s.wild_power || 0, tiebreak_stats: s.tiebreak_stats || {}, spells: [] });
export const states = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, st(v)]));
export const recognition = (r) => Object.fromEntries(Object.entries(r.player_results).map(([k, v]) => [k, v.recognition_points]));
export const trialOf = (r, id) => r.trial_results.find((t) => t.trial_id === id);
