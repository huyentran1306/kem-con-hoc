// Gói 33 · A1: mọi header X- mà frontend gửi tới Worker phải có trong src/workerHeaders.js,
// vì Worker chỉ cho phép đúng danh sách đó (Access-Control-Allow-Headers). Thiếu một header là
// trình duyệt chặn cả request ở preflight (màn soạn bài trắng ngày 29/10).
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { WORKER_ALLOWED_HEADERS, WORKER_ALLOW_HEADERS_VALUE, isAllowedWorkerHeader } from '../src/workerHeaders.js'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'src')
const files = []
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== 'vendor') walk(p) } else if (/\.(js|jsx|ts|tsx)$/.test(e.name)) files.push(p) } }
walk(root)

const used = new Map()
for (const f of files) {
  if (f.endsWith('workerHeaders.js')) continue
  const src = fs.readFileSync(f, 'utf8')
  for (const m of src.matchAll(/['"`](X-[A-Za-z0-9-]+)['"`]\s*[:\]]/g)) {
    if (!used.has(m[1])) used.set(m[1], path.relative(root, f))
  }
}
let fail = 0
for (const [h, f] of used) {
  if (!isAllowedWorkerHeader(h)) { console.error(`✗ ${h} (${f}) chưa có trong src/workerHeaders.js`); fail++ }
}
assert.ok(used.size >= 13, `chỉ tìm thấy ${used.size} header, script quét sai?`)
for (const h of ['X-Grade', 'X-Book-Series', 'X-Subject', 'X-Child-Id', 'X-Bypass-Cache', 'X-Prefetch']) assert.ok(isAllowedWorkerHeader(h), h)
assert.ok(!WORKER_ALLOW_HEADERS_VALUE.includes('*'), 'không dùng * khi có Authorization')
assert.equal(new Set(WORKER_ALLOWED_HEADERS.map((h) => h.toLowerCase())).size, WORKER_ALLOWED_HEADERS.length, 'không trùng')
if (fail) process.exit(1)
console.log(`✓ test-33-worker-headers: ${used.size} header X- frontend gửi đều có trong danh sách dùng chung (${WORKER_ALLOWED_HEADERS.length} header)`)
console.log(`  Access-Control-Allow-Headers: ${WORKER_ALLOW_HEADERS_VALUE}`)
