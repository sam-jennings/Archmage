// The QR encoder. The fingerprints below were taken from matrices that an independent
// decoder (OpenCV's QRCodeDetector) read back correctly at every version 1–10, so a
// change that alters them needs decoding again before it is trusted.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { qrMatrix, qrSvgPath, versionFor } from '../net/qr.js';

const print = (q) => createHash('sha256').update(q.modules.map((r) => r.map((x) => (x ? 1 : 0)).join('')).join('\n')).digest('hex').slice(0, 16);

test('known-good matrices are unchanged', () => {
  assert.deepEqual([qrMatrix('HELLO').version, print(qrMatrix('HELLO'))], [1, 'c346c75add569873']);
  assert.deepEqual([qrMatrix('https://example.org/trials/?room=ABCD').version, print(qrMatrix('https://example.org/trials/?room=ABCD'))], [3, '25b2233424e0e74d']);
  assert.deepEqual([qrMatrix('h'.repeat(213)).version, print(qrMatrix('h'.repeat(213)))], [10, '448366baf5eeb295']);
});

test('capacity: byte mode, level M, versions 1–10', () => {
  assert.deepEqual([14, 15, 26, 42, 62, 84, 106, 122, 152, 180, 213].map(versionFor), [1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(versionFor(214), null);
  assert.equal(qrMatrix('x'.repeat(214)), null);
});

test('structure: size, finder patterns, timing, the dark module', () => {
  for (const text of ['a', 'b'.repeat(60), 'c'.repeat(150)]) {
    const q = qrMatrix(text); const m = q.modules; const n = q.size;
    assert.equal(n, 17 + 4 * q.version);
    assert.ok(m.length === n && m.every((row) => row.length === n));
    for (const [r, c] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
      assert.ok(m[r][c] && m[r + 6][c + 6] && m[r + 3][c + 3] && !m[r + 1][c + 1] && m[r + 2][c + 2]);
    }
    for (let i = 8; i < n - 8; i++) { assert.equal(m[6][i], i % 2 === 0); assert.equal(m[i][6], i % 2 === 0); }
    assert.equal(m[n - 8][8], true);
    const svg = qrSvgPath(q);
    assert.equal(svg.viewBox, `0 0 ${n + 8} ${n + 8}`);
    assert.equal(svg.d.split('M').length - 1, m.flat().filter(Boolean).length);
  }
});
