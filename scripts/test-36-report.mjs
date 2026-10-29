/** scripts/test-36-report.mjs — Gói 36: màn Báo cáo theo bản vẽ v5 */
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { checkLinkDays, LINK_DAYS_MAX } from '../src/reportLinkDays.js'

const screens = fs.readFileSync('src/screens.jsx', 'utf8')
const rc = fs.readFileSync('src/ReportComponents.jsx', 'utf8')
const zalo = fs.readFileSync('src/ZaloReportModal.jsx', 'utf8')
let n = 0
const t = (name, fn) => { fn(); n++; console.log('  ✓ ' + name) }

t('Bỏ khối An toàn AI 7 ngày khỏi Báo cáo', () => {
  assert.ok(!/<WeeklyAiCards/.test(screens))
  assert.ok(!screens.includes('Phép tính sai đã bắt'))
})
t('Tiêu đề "Con hay kẹt ở bước nào?", chọn môn bằng danh sách thả xuống có Tiếng Anh', () => {
  assert.ok(screens.includes('Con hay kẹt ở bước nào?'))
  assert.ok(!rc.includes('Kỹ năng hay kẹt ·'))
  assert.match(rc, /<select[\s\S]*?data-testid="skill-subject-select"/)
  for (const sub of ['"Toán"', '"Tiếng Việt"', '"Tiếng Anh"']) assert.ok(rc.includes(`value: ${sub}`), sub)
})
t('Tăng/giảm ghi bằng mũi tên + số, không còn chữ "điểm"', () => {
  assert.ok(!/▲ \{delta\} điểm|▼ \{-delta\} điểm/.test(rc))
  assert.match(rc, /export function TrendDelta/)
  assert.match(rc, /M6 2l4\.5 6h-9z/)
})
t('Thời hạn link: người dùng tự nhập, 1–30 ngày', () => {
  assert.equal(LINK_DAYS_MAX, 30)
  assert.equal(checkLinkDays('21').ok, true)
  assert.equal(checkLinkDays('30').ok, true)
  assert.equal(checkLinkDays('31').msg, 'Tối đa 30 ngày')
  assert.equal(checkLinkDays('0').msg, 'Tối thiểu 1 ngày')
  assert.equal(checkLinkDays('').msg, 'Vui lòng nhập số ngày')
  assert.ok(!/\[7, 14\]\.map/.test(zalo))
  assert.match(zalo, /disabled=\{sharing \|\| !shareResult \|\| !daysCheck\.ok\}/)
})
t('Lịch học tô đậm nhạt theo số phút (4 mức) bằng màu của bộ giao diện', () => {
  assert.match(screens, /const heatLevel = \(m\) => \(!m \? 0 : m <= 10 \? 1 : m <= 20 \? 2 : m <= 30 \? 3 : 4\)/)
  const css = fs.readFileSync('src/report.css', 'utf8')
  for (const l of ['l1', 'l2', 'l3', 'l4']) assert.ok(css.includes(`.rp-d.${l}`), l)
  assert.match(fs.readFileSync('src/useStudyTracker.js', 'utf8'), /minutes: isStudied \? Math\.round\(minutesByDate/)
})
console.log(`\nXong: ${n} kiểm tra đạt.`)
