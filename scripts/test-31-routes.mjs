/**
 * scripts/test-31-routes.mjs — Prompt 31A.5: bắt lỗi nút gọi openSheet('x') hoặc go('x') tới tên KHÔNG có bảng/màn.
 * (Lỗi từng gặp: 'teachBack' ở 23W, 'prep' ở 23B.) Chạy trong `npm test`.
 */
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'

const SRC = path.resolve('src')
const files = []
const walk = (d) => {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f)
    if (fs.statSync(p).isDirectory()) { if (f !== 'vendor') walk(p) }
    else if (/\.(jsx?|mjs)$/.test(f)) files.push(p)
  }
}
walk(SRC)

const app = fs.readFileSync(path.join(SRC, 'App.jsx'), 'utf8')
const sheetStart = app.indexOf('function SheetView(')
assert.ok(sheetStart > 0, 'không tìm thấy SheetView trong App.jsx')
const sheetBody = app.slice(sheetStart)
const handledSheets = new Set([...sheetBody.matchAll(/type === '([A-Za-z_]+)'/g)].map((m) => m[1]))

const tabCap = app.match(/const TAB_CAP = \{([\s\S]*?)\n\}/)
assert.ok(tabCap, 'không tìm thấy TAB_CAP')
const screenMap = Object.fromEntries([...tabCap[1].matchAll(/([A-Za-z_]+):\s*'([A-Za-z]+)'/g)].map((m) => [m[1], m[2]]))
const screens = new Set(['onb', ...Object.keys(screenMap)])

const screensSrc = fs.readFileSync(path.join(SRC, 'screens.jsx'), 'utf8')
for (const [name, comp] of Object.entries(screenMap)) {
  // Gói 38: chấp nhận cả export lại từ file khác (vd. export { Profile } from './ProfileScreen')
  const exported = new RegExp(`export function ${comp}\\b`).test(screensSrc) || new RegExp(`export \\{[^}]*\\b${comp}\\b[^}]*\\} from`).test(screensSrc)
  assert.ok(exported, `TAB_CAP.${name} trỏ tới ${comp} nhưng screens.jsx không export`)
}

const missing = []
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8')
  for (const m of s.matchAll(/openSheet\(\s*['"]([A-Za-z_]+)['"]/g)) {
    if (!handledSheets.has(m[1])) missing.push(`${path.relative(SRC, f)}: openSheet('${m[1]}') không có bảng trượt tương ứng trong SheetView`)
  }
  for (const m of s.matchAll(/\bgo\(\s*['"]([A-Za-z_]+)['"]/g)) {
    if (!screens.has(m[1])) missing.push(`${path.relative(SRC, f)}: go('${m[1]}') không có màn tương ứng trong TAB_CAP`)
  }
}
if (missing.length) {
  console.error(missing.join('\n'))
  process.exit(1)
}
console.log(`✓ ${handledSheets.size} bảng trượt, ${screens.size} màn: mọi openSheet/go đều có đích (${files.length} file).`)
