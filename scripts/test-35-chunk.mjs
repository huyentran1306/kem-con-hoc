/** scripts/test-35-chunk.mjs — Gói 35: mở cửa sổ tải muộn sau deploy không còn vỡ vì chunk của bản cũ */
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { isChunkLoadError } from '../src/lazyReload.js'

assert.ok(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://x/assets/FamilyMembersSheet-z9dHfD2C.js')))
assert.ok(isChunkLoadError(new TypeError('Importing a module script failed.')))
assert.ok(isChunkLoadError(new TypeError("'text/html' is not a valid JavaScript MIME type.")))
assert.ok(!isChunkLoadError(new ReferenceError('x is not defined')))
for (const f of ['src/App.jsx', 'src/AdminToolsTab.jsx']) {
  assert.ok(!/=\s*lazy\(\(\)\s*=>\s*import\(/.test(fs.readFileSync(f, 'utf8')), `${f}: mọi màn tải muộn phải dùng lazyWithReload`)
}
assert.match(fs.readFileSync('src/main.jsx', 'utf8'), /installPreloadErrorReload\(\)/)
assert.match(fs.readFileSync('public/_headers', 'utf8'), /\/index\.html\n\s+Cache-Control: no-cache/)
console.log('✓ test-35-chunk: lỗi chunk cũ được nhận ra, mọi lazy() đều tự tải lại bản mới')
