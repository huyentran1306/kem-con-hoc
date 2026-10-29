/** scripts/test-40.mjs — Gói 40: bỏ thẻ "Đã kiểm lại N phép tính", Đồng hồ: phụ huynh và con, font ảnh báo cáo Zalo */
import fs from 'node:fs'
import assert from 'node:assert/strict'

const scr = fs.readFileSync('src/screens.jsx', 'utf8')
const zalo = fs.readFileSync('src/ZaloReportModal.jsx', 'utf8')
const clock = scr.slice(scr.indexOf('function ClockGame()'), scr.indexOf('\n}\n', scr.indexOf('function ClockGame()')))
let n = 0
const t = (name, fn) => { fn(); n++; console.log('  ✓ ' + name) }

t('Màn soạn bài không còn thẻ "Đã kiểm lại N phép tính" và danh sách "✓ Đúng"', () => {
  assert.ok(!scr.includes('Đã kiểm lại {mathInfo.verifiedCount} phép tính'))
  assert.ok(!scr.includes('showMathList'))
})
t('Trò "Bấm đúng thời gian": phụ huynh đang cầm máy và con chơi luân phiên (không ghi cứng Mẹ rồi Bố)', () => {
  assert.ok(!/'Mẹ' : 'Bố'/.test(clock))
  assert.match(clock, /const player = round % 2 === 1 \? P1 : P2/)
  assert.match(clock, /const P1 = Ho/)
  assert.match(clock, /\{P1\} và \{P2\} luân phiên/)
})
t('Ảnh báo cáo Zalo vẽ bằng font có dấu tiếng Việt (Nunito), chờ tải font trước khi vẽ', () => {
  assert.ok(!/px sans-serif'/.test(zalo))
  assert.match(zalo, /const CANVAS_FONT = '"Nunito"/)
  assert.match(zalo, /await loadCanvasFonts\(\)/)
})
console.log(`\nXong: ${n} kiểm tra đạt.`)
