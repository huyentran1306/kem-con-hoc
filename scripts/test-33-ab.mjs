// Gói 33 A+B: kiểm thử các module mới (không cần mạng)
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { skillLabel, lessonIssue, GENERIC_STEP_LABEL } from '../src/lessonGuard.js'
import { resolveSubject, typeLabelForSubject, guessSubject, normalizeSubject } from '../src/subjectChip.js'
import { sanitizeSession, sanitizeAppState } from '../src/stateShape.js'

let pass = 0, fail = 0
const t = (name, fn) => { try { fn(); pass++; console.log('✅', name) } catch (e) { fail++; console.log('❌', name, '-', e.message) } }

// B5 — nhãn bậc
t('B5: ket_luan ra tiếng Việt', () => assert.equal(skillLabel('ket_luan'), 'Kết luận'))
t('B5: mã lạ ra "Bậc gợi mở"', () => assert.equal(skillLabel('xyz_abc_moi'), GENERIC_STEP_LABEL))
t('B5: rỗng không hiện chip', () => assert.equal(skillLabel(''), ''))
t('B5: nhãn đã là chữ người đọc được giữ nguyên', () => assert.equal(skillLabel('Đọc kỹ đề'), 'Đọc kỹ đề'))
t('B5: không bao giờ trả mã có "_"', () => {
  for (const c of ['tim_y', 'a_b', 'ket_luan', 'phan_tich_de', 'zz_top']) assert.ok(!skillLabel(c).includes('_'), c)
})

// B3 — chặn dữ liệu bài học hỏng
t('B3: problem null → missing', () => assert.equal(lessonIssue(null), 'missing'))
t('B3: không có steps → no_steps', () => assert.equal(lessonIssue({ text: 'abc', steps: [] }), 'no_steps'))
t('B3: bước thiếu câu hỏi → step_no_question', () => assert.equal(lessonIssue({ text: 'abc', steps: [{}] }), 'step_no_question'))

// B4 — chip môn
t('B4: phụ huynh chọn Tiếng Việt thắng đoán chữ', () => assert.equal(resolveSubject({ chosen: 'tieng_viet', text: 'Có 5 quả cam' }), 'tieng_viet'))
t('B4: mon_doan từ OCR được dùng', () => assert.equal(resolveSubject({ ocrMon: 'Tiếng Anh', text: '' }), 'tieng_anh'))
t('B4: mã vie/eng chuẩn hoá', () => { assert.equal(normalizeSubject('vie'), 'tieng_viet'); assert.equal(normalizeSubject('eng'), 'tieng_anh') })
t('B4: bài Tiếng Việt không mang chip "Toán có lời văn"', () => {
  const out = typeLabelForSubject('Toán có lời văn', 'tieng_viet', 'Tìm từ chỉ sự vật trong câu')
  assert.ok(!/toán/i.test(out), out)
})
t('B4: bài Toán giữ nhãn dạng bài', () => assert.equal(typeLabelForSubject('Toán có lời văn', 'toan', 'x'), 'Toán có lời văn'))
t('B4: đoán Tiếng Việt từ chữ', () => assert.equal(guessSubject('Tìm từ chỉ sự vật trong câu: Mẹ đi chợ.'), 'tieng_viet'))
t('B4: đề Toán vẫn là Toán', () => assert.equal(guessSubject('Lan có 12 quả cam, cho bạn 5 quả. Hỏi Lan còn mấy quả?'), 'toan'))
t('B4: đoán Tiếng Anh từ chữ', () => assert.equal(guessSubject('Fill in the blank: I ___ a student'), 'tieng_anh'))

// B3 — dữ liệu localStorage
t('B3: session hỏng → null', () => { assert.equal(sanitizeSession('rác'), null); assert.equal(sanitizeSession({ id: 5 }), null) })
t('B3: session đúng giữ nguyên', () => assert.equal(sanitizeSession({ id: 'fam1' }).id, 'fam1'))
t('B3: state không phải object → về mặc định', () => assert.deepEqual(sanitizeAppState('x', { a: 1 }, () => ({})).fixes, ['root']))
t('B3: state có stats sai kiểu được sửa', () => {
  const init = { children: [{ id: 'c1', name: 'Bé' }], activeId: 'c1', stats: {}, flow: {}, problem: { steps: [] }, schedule: [], theme: 'pastel' }
  const r = sanitizeAppState({ children: 'x', theme: 5, stats: { a: { history: 'oops' } } }, init, () => ({ history: [] }))
  assert.equal(r.state.children[0].id, 'c1'); assert.equal(r.state.activeId, 'c1')
  assert.ok(r.fixes.length > 0)
})

// B3 — chặn Google Dịch
t('B3: index.html có translate="no" và meta notranslate', () => {
  const h = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  assert.match(h, /translate="no"/); assert.match(h, /name="google" content="notranslate"/)
})

// B2 — câu sai mật khẩu, không link
t('B2: Login có câu lỗi đúng chữ, role=alert, không "Quên mật khẩu"', () => {
  const s = readFileSync(new URL('../src/Login.jsx', import.meta.url), 'utf8')
  assert.ok(s.includes('Sai mật khẩu rồi, thử lại hoặc liên hệ admin nhé.'))
  assert.ok(s.includes('role="alert"'))
  const code = s.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n')
  assert.ok(!/Quên mật khẩu/.test(code), 'không có nút/link Quên mật khẩu ngoài chú thích')
})

console.log(`🏁 TỔNG KẾT: ${pass} PASS, ${fail} FAIL`)
if (fail) process.exit(1)
