#!/usr/bin/env node
/**
 * Working-system drift checker + session brief.
 * Zero dependencies. Run from anywhere: node meta/checks/check.mjs
 * Exit code 0 = clean, 1 = flags found.
 *
 * Every capture rule in meta/process.md has a detection rule here:
 *   §1 threads   -> stale/missing-next checks
 *   §2 queue     -> unqueued ACTION: markers, _review linkage
 *   §3 decisions -> open propagation checkboxes, retired-term grep
 *   §3a versioning -> versioned_files vs rulebook_version mismatch
 *   §5 structure -> tree vs manifest.yml, filename patterns
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const flags = [];
const flag = (area, msg) => flags.push(`[${area}] ${msg}`);
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const STALE_DAYS = 21;
const TEXT_EXT = new Set([".md", ".html", ".js", ".jsx", ".mjs", ".css", ".txt", ".json", ".svg", ".yml", ".yaml"]);

// ---------- constrained YAML (top-level keys, "  - item" lists, "  k: v" maps) ----------
function parseYaml(text) {
  const out = {};
  let key = null;
  for (const raw of text.split(/\r?\n/)) {
    if (/^\s*#/.test(raw) || !raw.trim()) continue;
    const nested = raw.match(/^\s+- (.+)$/);
    if (nested && key) {
      if (!Array.isArray(out[key])) out[key] = [];
      out[key].push(nested[1].trim());
      continue;
    }
    const kv = raw.match(/^\s+([^\s].*?):\s+(.+)$/);
    if (kv && key) {
      if (out[key] === null || typeof out[key] !== "object" || Array.isArray(out[key])) out[key] = {};
      out[key][kv[1].trim()] = kv[2].trim();
      continue;
    }
    const top = raw.match(/^([^\s:][^:]*):\s*(.*)$/);
    if (top) {
      key = top[1].trim();
      out[key] = top[2].trim() || null;
    }
  }
  return out;
}
const frontMatter = (text) => {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? parseYaml(m[1]) : null;
};
const csv = (s) => (s || "").split(",").map((x) => x.trim()).filter(Boolean);

// ---------- load config ----------
let manifest, canon;
try { manifest = parseYaml(read("meta/manifest.yml")); } catch { flag("structure", "meta/manifest.yml missing or unreadable"); }
try { canon = parseYaml(read("meta/canon.yml")); } catch { flag("canon", "meta/canon.yml missing or unreadable"); }

// ---------- 1. structure: tree vs manifest ----------
if (manifest) {
  const declaredFiles = new Set(manifest.root_files || []);
  const declaredDirs = new Set((manifest.folders || []).map((d) => d.replace(/\/$/, "")));
  for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    if (entry.isDirectory()) {
      if (!declaredDirs.has(entry.name)) flag("structure", `undeclared folder at root: ${entry.name}/ — add to manifest or move`);
    } else if (!declaredFiles.has(entry.name)) {
      flag("structure", `undeclared file at root: ${entry.name} — add to manifest or move`);
    }
  }
  for (const d of declaredDirs) if (!exists(d)) flag("structure", `manifest declares ${d}/ but it does not exist`);
  for (const [dir, pattern] of Object.entries(manifest.patterns || {})) {
    if (!exists(dir)) continue;
    const re = new RegExp(pattern);
    for (const f of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      if (f.isFile() && !re.test(f.name)) flag("structure", `${dir}${f.name} violates pattern ${pattern}`);
    }
  }
  for (const [name, p] of Object.entries(manifest.sources_of_truth || {})) {
    if (!exists(p)) flag("structure", `source of truth '${name}' missing: ${p}`);
  }
}

// ---------- 2. vocabulary: retired terms in content ----------
function* walk(dir, excludes) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, e.name);
    if (excludes.some((x) => rel.includes(x))) continue;
    if (e.isDirectory()) yield* walk(rel, excludes);
    else if (TEXT_EXT.has(path.extname(e.name))) yield rel;
  }
}
const vocabHits = [];
if (canon && canon.retired_terms) {
  const terms = csv(canon.retired_terms);
  const excludes = csv(canon.vocab_exclude);
  const scan = csv(canon.vocab_scan_dirs).filter(exists);
  const files = [];
  for (const d of scan) files.push(...walk(d, excludes));
  files.push(...csv(canon.vocab_scan_files).filter(exists));
  for (const f of files) {
    const text = read(f);
    for (const t of terms) {
      const n = text.split(t).length - 1;
      if (n > 0) vocabHits.push(`${f} — "${t}" x${n}`);
    }
  }
  for (const h of vocabHits) flag("vocab", `retired term in content: ${h}`);
}

// ---------- 3. decisions: open propagation, status ----------
const openDecisions = [];
if (exists("meta/decisions")) {
  for (const f of fs.readdirSync(path.join(ROOT, "meta/decisions")).filter((f) => f.endsWith(".md"))) {
    const text = read(`meta/decisions/${f}`);
    const fm = frontMatter(text) || {};
    if (!fm.status) flag("decisions", `${f}: missing status in front-matter`);
    const open = (text.match(/^\s*- \[ \]/gm) || []).length;
    if (open > 0) {
      openDecisions.push({ file: f, status: fm.status || "?", open });
      // Open propagation boxes = unmade edits. Flag them for any decision that is
      // settled (canon) or being applied (experiment) — a decided change with
      // incomplete propagation is drift, whether or not it involves retired terms.
      // Exempt only not-yet-decided or backed-out decisions.
      const exempt = ["proposed", "reverted", "superseded"];
      if (!exempt.includes(fm.status)) flag("decisions", `${f}: ${open} open propagation item(s) on a ${fm.status || "status-less"} decision — make the edits (or revert), then tick the boxes`);
    }
  }
} else flag("decisions", "meta/decisions/ missing");

// ---------- 3a. versioning: versioned_files vs rulebook_version ----------
if (canon && canon.versioned_files) {
  const wantRaw = (canon.rulebook_version || "").replace(/^v/i, "").trim();
  for (const f of csv(canon.versioned_files)) {
    if (!exists(f)) { flag("versioning", `versioned_files entry missing: ${f}`); continue; }
    const fm = frontMatter(read(f)) || {};
    const got = (fm.version || "").toString().replace(/^v/i, "").trim();
    if (!got) flag("versioning", `${f}: no 'version' in front-matter (canon.yml expects ${wantRaw || "?"})`);
    else if (wantRaw && got !== wantRaw) flag("versioning", `${f}: version ${got} does not match canon.yml rulebook_version ${wantRaw} — bump + archive per process.md §3a, or update canon.yml`);
  }
}

// ---------- 4. threads: front-matter, staleness ----------
const threads = [];
if (exists("meta/threads")) {
  const now = Date.now();
  for (const f of fs.readdirSync(path.join(ROOT, "meta/threads")).filter((f) => f.endsWith(".md"))) {
    const fm = frontMatter(read(`meta/threads/${f}`)) || {};
    for (const req of ["thread", "status", "updated", "goal", "next"]) {
      if (!fm[req]) flag("threads", `${f}: missing '${req}' in front-matter`);
    }
    threads.push(fm);
    if (fm.status === "active" && fm.updated) {
      const age = Math.floor((now - Date.parse(fm.updated)) / 86400000);
      if (age > STALE_DAYS) flag("threads", `${f}: active but untouched ${age} days — confirm, park, or close`);
    }
  }
} else flag("threads", "meta/threads/ missing");

// ---------- 5. queue: unqueued ACTION markers, _review linkage ----------
const queue = exists("meta/QUEUE.md") ? read("meta/QUEUE.md") : (flag("queue", "meta/QUEUE.md missing"), "");
const decisionTexts = exists("meta/decisions")
  ? fs.readdirSync(path.join(ROOT, "meta/decisions")).filter((f) => f.endsWith(".md")).map((f) => read(`meta/decisions/${f}`)).join("\n")
  : "";
for (const dir of ["playtests", "_review", "meta/threads"].filter(exists)) {
  for (const f of walk(dir, ["node_modules"])) {
    for (const line of read(f).split(/\r?\n/)) {
      if (/(^|\s)ACTION:/.test(line) && !/ACTION\(queued\)/.test(line)) {
        flag("queue", `unqueued ACTION in ${f}: "${line.trim().slice(0, 90)}" — mirror to QUEUE, then mark ACTION(queued):`);
      }
    }
  }
}
if (exists("_review")) {
  for (const f of fs.readdirSync(path.join(ROOT, "_review")).filter((f) => f.endsWith(".md") && f !== "README.md")) {
    if (!queue.includes(f) && !decisionTexts.includes(f)) {
      flag("queue", `_review/${f} is not referenced by QUEUE or any decision — link it or archive it`);
    }
  }
}

// ---------- 6. playtests front-matter ----------
if (exists("playtests")) {
  for (const f of fs.readdirSync(path.join(ROOT, "playtests")).filter((f) => f.endsWith(".md"))) {
    const fm = frontMatter(read(`playtests/${f}`)) || {};
    if (!fm.goal) flag("playtests", `${f}: missing 'goal' in front-matter`);
    if (!fm.verdict && fm.status !== "planned") flag("playtests", `${f}: missing 'verdict' (or 'status: planned')`);
  }
}

// ---------- session brief ----------
const pad = (s, n) => String(s ?? "").padEnd(n).slice(0, n);
console.log("=== SESSION BRIEF — Archmage Ascension ===\n");
console.log("THREADS");
for (const t of threads.sort((a, b) => (a.status === "active" ? -1 : 1))) {
  console.log(`  ${pad(t.thread, 22)} ${pad(t.status, 8)} upd ${pad(t.updated, 11)} next: ${t.next}`);
}
console.log("\nQUEUE — P1");
const activeQueue = queue.split(/^## Deferred/m)[0];
for (const line of activeQueue.split(/\r?\n/)) if (line.includes("[P1]")) console.log(`  ${line.replace(/^- /, "").slice(0, 160)}`);
if (openDecisions.length) {
  console.log("\nDECISIONS with open propagation");
  for (const d of openDecisions) console.log(`  ${d.file} (${d.status}) — ${d.open} open item(s)`);
}
console.log(`\nFLAGS: ${flags.length ? "" : "none — clean"}`);
for (const f of flags) console.log(`  ! ${f}`);
process.exitCode = flags.length ? 1 : 0;
