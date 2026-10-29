/**
 * scripts/test-34.mjs — Gói 34: trang chủ, đề mẫu, ẩn chấm vở, nút bình tĩnh, màn Hỏi con từng bước v2.
 */
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { PRELOADED_TRIAL_LESSONS, matchTrialLesson } from '../src/trialData.js'
import { FEATURES } from '../src/features.js'

let n = 0
const t = (name, fn) => { fn(); n++; console.log('  ✓ ' + name) }
const read = (p) => fs.readFileSync(p, 'utf8')
const BUT = 'Mẹ mua 2 hộp bút, mỗi hộp có 10 cây. Mẹ cho Lan 4 cây. Hỏi mẹ còn bao nhiêu cây bút?'

t('Trang chủ: nút chính "Phụ huynh nhập đề", không còn Gõ đề bài / Đọc đề', () => {
  for (const f of ['src/themes/slots/themedSlots.jsx', 'src/themes/slots/seasonSlots.jsx', 'src/themes/slots/defaultSlots.jsx']) {
    const s = read(f)
    assert.ok(!s.includes('data-testid="start-type"') && !s.includes('data-testid="start-voice"'), f)
    assert.ok(!s.includes('Bắt đầu bài tối nay'), f)
    assert.ok(s.includes('Phụ huynh nhập đề'), f)
  }
})
t('Đề mẫu Toán là đề hộp bút, khớp đúng bài mẫu, đề hộp bút số khác thì không khớp', () => {
  assert.equal(PRELOADED_TRIAL_LESSONS[0].de_bai, BUT)
  assert.equal(PRELOADED_TRIAL_LESSONS[0].cac_bac.length, 4)
  assert.equal(matchTrialLesson(BUT).id, 'lesson_math_but')
  assert.equal(matchTrialLesson('Mẹ mua 3 hộp bút, mỗi hộp 8 cây. Mẹ cho Lan 5 cây. Hỏi mẹ còn bao nhiêu cây bút?'), null)
  assert.equal(matchTrialLesson('Một đàn vịt có 15 con, bác Ba bán bớt đi 6 con. Hỏi bác Ba còn lại bao nhiêu con vịt?').id, 'lesson_math_3')
})
t('AI chấm vở tắt: không còn lối vào ở trang chủ và Xong bài', () => {
  assert.equal(FEATURES.CHECK_WORK, false)
  const s = read('src/screens.jsx')
  assert.match(s, /FEATURES\.CHECK_WORK && CheckWorkEntrySlot/)
  assert.match(s, /FEATURES\.CHECK_WORK && (<div|\(\s*<div className="dn-next-row")/) // gói 37: dòng Chấm vở trong thẻ Làm tiếp vẫn sau cờ
})
t('Nút nổi {Mẹ/Bố} bình tĩnh trở lại, không còn nút 😮‍💨 trên thanh trên', () => {
  const app = read('src/App.jsx')
  assert.match(app, /className=\{`calm-fab /)
  assert.match(app, /calm-fab-label">\{calmLabel\}/)
  assert.ok(!/onOpenCalm=/.test(read('src/screens.jsx')))
  assert.ok(!read('src/games/GocChoiChung.jsx').includes('😮‍💨'))
})
t('Hỏi con từng bước v2: 4 vùng, nút ghi rõ hành động, bỏ Vì sao hỏi / Dành cho mẹ / mic', () => {
  const s = read('src/HoiConTungBuoc.jsx')
  for (const must of ['Con còn bí', '→ Mở gợi ý', 'Con làm được', '→ Tiếp tục', 'Đáp án tham khảo', 'giữ 1,5 giây để xem', 'Gợi ý 1', 'Gợi ý 2', 'Xem đề', 'Hỏi Gấu', 'đọc to câu này cho con nghe']) assert.ok(s.includes(must), must)
  const code = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  for (const gone of ['Vì sao hỏi', 'Mục tiêu sư phạm', 'Dành cho', 'Chạm để con trả lời', 'BẬC {step']) assert.ok(!code.includes(gone), gone)
  assert.ok(!/#[0-9A-Fa-f]{6}/.test(read('src/hoiCon.css')), 'hoiCon.css không viết cứng mã màu')
  assert.match(read('src/screens.jsx'), /function ScaffoldView\(\) \{\n  return <HoiConTungBuoc \/>/)
})
console.log(`\nXong: ${n} kiểm tra đạt.`)
