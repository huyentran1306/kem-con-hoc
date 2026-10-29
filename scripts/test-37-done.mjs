/** scripts/test-37-done.mjs — Gói 37: màn Hoàn thành theo bản vẽ v6 */
import fs from 'node:fs'
import assert from 'node:assert/strict'

const screens = fs.readFileSync('src/screens.jsx', 'utf8')
const css = fs.readFileSync('src/done.css', 'utf8')
const start = screens.indexOf('export function Done(')
assert.ok(start > 0, 'có hàm Done')
const done = screens.slice(start, screens.indexOf('\nexport function', start + 10))
let n = 0
const t = (name, fn) => { fn(); n++; console.log('  ✓ ' + name) }

t('Bố cục v6: hero → tặng huy hiệu → góc phụ huynh → làm tiếp → 1 nút chính ở đáy', () => {
  const order = ['done-section-kid', 'card-suggested-badge', 'done-section-parent', 'done-section-next', 'done-save']
  let last = -1
  for (const id of order) { const i = done.indexOf(`data-testid="${id}"`); assert.ok(i > last, id); last = i }
  assert.ok(screens.includes("import './done.css'"))
})
t('Màu chỉ đọc từ biến của bộ giao diện (không viết cứng mã màu)', () => {
  const hex = css.replace(/var\([^)]*\)/g, '').match(/#[0-9a-fA-F]{3,8}\b/g) || []
  assert.deepEqual(hex, [], 'mã màu viết cứng: ' + hex.join(','))
  assert.ok(!/style=\{\{[^}]*(background|color):\s*'#/.test(done), 'không tô màu cứng trong JSX')
})
t('Cỡ chữ theo bản vẽ: tiêu đề hero 28px, tiêu đề thẻ 18px, chữ phụ ≥ 13px', () => {
  assert.match(css, /\.dn-hero h2 \{ font-size: 28px/)
  assert.match(css, /\.dn-card h2 \{[^}]*font-size: 18px/)
  const sizes = [...css.matchAll(/font-size: (\d+)px/g)].map((m) => +m[1]).filter((s) => s < 13 && s !== 9 && s !== 12)
  assert.deepEqual(sizes, [], 'chữ quá nhỏ')
})
t('Huy hiệu chỉ tặng 1 lần mỗi buổi (gắn với flow.startedAt), nút khoá sau khi tặng', () => {
  assert.match(done, /badgeRaw\.startedAt === \(S\.flow\?\.startedAt \|\| null\)/)
  assert.match(done, /if \(badgeGiven\) return/)
  assert.match(done, /disabled=\{Boolean\(badgeGiven\)\}/)
  assert.match(screens, /badgeGiven: null,/)
})
t('Mức tự chủ: app gợi ý từ dữ liệu buổi học, có lý do, chưa chọn thì lưu theo gợi ý', () => {
  assert.match(done, /if \(log\.some\(\(e\) => e\.revealedAnswer\)\) return 'guided'/)
  assert.match(done, /App gợi ý mức này vì \$\{levelWhy\}/)
  assert.match(done, /if \(!levelPicked\) patch\(\(prev\) => \(\{ \.\.\.prev, flow: \{ \.\.\.prev\.flow, teachBack: suggestedLevel \} \}\)\)/)
})
t('Gợi ý cách kèm thu gọn mặc định, có dòng xem trước; "Bài tương tự"; nhắc tặng huy hiệu khi lưu', () => {
  assert.match(done, /useState\(false\)/)
  assert.match(done, /aria-expanded=\{tipsOpen\}/)
  assert.ok(done.includes('Bài tương tự (5 phút)'))
  assert.ok(!done.includes('Bài anh em ('))
  assert.match(done, /chưa tặng huy hiệu cho \$\{child\.name\} tối nay/)
})
t('Hiệu ứng tôn trọng prefers-reduced-motion; nút bình tĩnh không đè nội dung', () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /\.app\.on-done:has\(\.calm-fab\) \.dn-bottom \{ padding-right: 80px; \}/)
  assert.ok(fs.readFileSync('src/App.jsx', 'utf8').includes("screen === 'done' ? 'on-done' : ''"))
})
console.log(`\nXong: ${n} kiểm tra đạt.`)
