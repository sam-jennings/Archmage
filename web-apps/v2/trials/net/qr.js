// A small QR code encoder: byte mode, error correction level M, versions 1–10 (up to 213
// bytes — plenty for a join link). Pure; returns a square matrix of booleans (true = dark).
// Written here so joining a room needs no third-party service and no library.

// Per version (level M): [error-correction codewords per block, [blocks, data codewords]…]
const BLOCKS = [null,
  [10, [1, 16]], [16, [1, 28]], [26, [1, 44]], [18, [2, 32]], [24, [2, 43]],
  [16, [4, 27]], [18, [4, 31]], [22, [2, 38], [2, 39]], [22, [3, 36], [2, 37]], [26, [4, 43], [1, 44]],
];
const ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];

// GF(256) with the QR polynomial x^8 + x^4 + x^3 + x^2 + 1.
const EXP = new Uint8Array(512); const LOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
const mul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

function errorCorrection(data, count) {
  let gen = [1];
  for (let i = 0; i < count; i++) {
    const next = new Array(gen.length + 1).fill(0);
    gen.forEach((g, j) => { next[j] ^= g; next[j + 1] ^= mul(g, EXP[i]); });
    gen = next;
  }
  const rem = new Array(count).fill(0);
  for (const byte of data) {
    const factor = byte ^ rem.shift();
    rem.push(0);
    for (let j = 0; j < count; j++) rem[j] ^= mul(gen[j + 1], factor);
  }
  return rem;
}

const dataCapacity = (version) => BLOCKS[version].slice(1).reduce((sum, [n, size]) => sum + n * size, 0);

/** Smallest version that holds this many bytes, or null. */
export function versionFor(byteCount) {
  for (let v = 1; v <= 10; v++) if (byteCount <= dataCapacity(v) - (v < 10 ? 2 : 3)) return v;
  return null;
}

function codewords(bytes, version) {
  const capacity = dataCapacity(version);
  const bits = [];
  const push = (value, length) => { for (let i = length - 1; i >= 0; i--) bits.push((value >> i) & 1); };
  push(0b0100, 4);
  push(bytes.length, version < 10 ? 8 : 16);
  for (const b of bytes) push(b, 8);
  push(0, Math.min(4, capacity * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((acc, bit) => (acc << 1) | bit, 0));
  for (let pad = 0xec; data.length < capacity; pad ^= 0xec ^ 0x11) data.push(pad);

  const [ecCount, ...groups] = BLOCKS[version];
  const blocks = [];
  let at = 0;
  for (const [n, size] of groups) for (let i = 0; i < n; i++) { const d = data.slice(at, at + size); at += size; blocks.push({ d, e: errorCorrection(d, ecCount) }); }
  const out = [];
  const longest = Math.max(...blocks.map((b) => b.d.length));
  for (let i = 0; i < longest; i++) for (const b of blocks) if (i < b.d.length) out.push(b.d[i]);
  for (let i = 0; i < ecCount; i++) for (const b of blocks) out.push(b.e[i]);
  return out;
}

const MASKS = [
  (r, c) => (r + c) % 2 === 0, (r) => r % 2 === 0, (r, c) => c % 3 === 0, (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0, (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0, (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function bch(value, poly, polyBits, totalBits) {
  let rem = value << (polyBits - 1);
  for (let i = totalBits - 1; i >= polyBits - 1; i--) if (rem & (1 << i)) rem ^= poly << (i - polyBits + 1);
  return (value << (polyBits - 1)) | rem;
}

function penalty(m) {
  const n = m.length;
  let score = 0;
  const line = (get) => {
    for (let i = 0; i < n; i++) {
      let run = 1;
      for (let j = 1; j <= n; j++) {
        if (j < n && get(i, j) === get(i, j - 1)) run++;
        else { if (run >= 5) score += run - 2; run = 1; }
      }
      for (let j = 0; j + 10 < n; j++) {
        const s = Array.from({ length: 11 }, (_, k) => (get(i, j + k) ? 1 : 0)).join('');
        if (s === '10111010000' || s === '00001011101') score += 40;
      }
    }
  };
  line((i, j) => m[i][j]); line((i, j) => m[j][i]);
  let dark = 0;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (m[r][c]) dark++;
    if (r + 1 < n && c + 1 < n && m[r][c] === m[r + 1][c] && m[r][c] === m[r][c + 1] && m[r][c] === m[r + 1][c + 1]) score += 3;
  }
  return score + Math.floor(Math.abs((dark * 100) / (n * n) - 50) / 5) * 10;
}

/** Encode text. Returns { version, size, modules } or null if the text is too long. */
export function qrMatrix(text) {
  const bytes = [...new TextEncoder().encode(text)];
  const version = versionFor(bytes.length);
  if (!version) return null;
  const n = 17 + 4 * version;
  const base = Array.from({ length: n }, () => new Array(n).fill(false));
  const fixed = Array.from({ length: n }, () => new Array(n).fill(false));
  const set = (r, c, dark) => { if (r >= 0 && r < n && c >= 0 && c < n) { base[r][c] = dark; fixed[r][c] = true; } };

  for (const [r0, c0] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
      const ring = Math.max(Math.abs(r - 3), Math.abs(c - 3));
      set(r0 + r, c0 + c, ring <= 1 || ring === 3);
    }
  }
  for (const r of ALIGN[version]) for (const c of ALIGN[version]) {
    if (fixed[r][c]) continue;
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
  }
  for (let i = 8; i < n - 8; i++) { if (!fixed[6][i]) set(6, i, i % 2 === 0); if (!fixed[i][6]) set(i, 6, i % 2 === 0); }
  set(n - 8, 8, true);
  // Reserve format (and version) areas so data flows around them.
  for (let i = 0; i < 9; i++) { if (!fixed[8][i]) set(8, i, false); if (!fixed[i][8]) set(i, 8, false); }
  for (let i = 0; i < 8; i++) { set(8, n - 1 - i, false); if (!fixed[n - 1 - i][8]) set(n - 1 - i, 8, false); }
  if (version >= 7) {
    const info = bch(version, 0x1f25, 13, 18);
    for (let i = 0; i < 18; i++) { const bit = !!((info >> i) & 1); set(Math.floor(i / 3), n - 11 + (i % 3), bit); set(n - 11 + (i % 3), Math.floor(i / 3), bit); }
  }

  const stream = codewords(bytes, version).flatMap((byte) => Array.from({ length: 8 }, (_, i) => (byte >> (7 - i)) & 1));
  const cells = [];
  for (let right = n - 1, up = true; right > 0; right -= 2, up = !up) {
    if (right === 6) right--;
    for (let i = 0; i < n; i++) { const r = up ? n - 1 - i : i; for (const c of [right, right - 1]) if (!fixed[r][c]) cells.push([r, c]); }
  }

  let best = null;
  for (let mask = 0; mask < 8; mask++) {
    const m = base.map((row) => row.slice());
    cells.forEach(([r, c], i) => { m[r][c] = !!(stream[i] || 0) !== MASKS[mask](r, c); });
    const format = bch((0b00 << 3) | mask, 0x537, 11, 15) ^ 0x5412; // 00 = level M
    for (let i = 0; i < 15; i++) {
      const bit = !!((format >> i) & 1);
      // Copy one: around the top-left finder. Copy two: split between the other two.
      if (i < 6) m[i][8] = bit; else if (i < 8) m[i + 1][8] = bit; else if (i === 8) m[8][7] = bit; else m[8][14 - i] = bit;
      if (i < 8) m[8][n - 1 - i] = bit; else m[n - 15 + i][8] = bit;
    }
    const score = penalty(m);
    if (!best || score < best.score) best = { score, m };
  }
  return { version, size: n, modules: best.m };
}

/** The matrix as an SVG path (one unit per module, 4-module quiet zone). */
export function qrSvgPath(matrix) {
  let d = '';
  matrix.modules.forEach((row, r) => row.forEach((dark, c) => { if (dark) d += `M${c + 4} ${r + 4}h1v1h-1z`; }));
  return { d, viewBox: `0 0 ${matrix.size + 8} ${matrix.size + 8}` };
}
