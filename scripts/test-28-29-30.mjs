/**
 * scripts/test-28-29-30.mjs — Kiểm tra prompt 28, 29, 30 (không gọi AI, không cần mạng).
 * Chạy: node scripts/test-28-29-30.mjs            (kiểm logic)
 *       node scripts/test-28-29-30.mjs --bundle   (kiểm thêm chuỗi trong dist/assets/index-*.js)
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { computeCoachAdvice, extractWhyExample } from '../src/coachRules.js'
import { computeSuggestedBadge } from '../src/badgeRules.js'
import { auditSteps } from '../src/stepQuality.js'
import { buildLocalMicroStep, isServerMicroStepGeneric } from '../src/microStepLocal.js'
import { announcementStatus, expiryFromPreset, hasDateWords } from '../src/teacher/announcementStatus.js'
import { swapMe, xungHo, haiNguoi } from '../src/xungHo.js'
import { validateAndGuard } from '../src/guard.js'

let n = 0
const t = (name, fn) => { fn(); n++; console.log('  ✓', name) }

console.log('Prompt 28 · Phần A')
const cam = {
  ocr: 'Lan có 18 quả cam chia đều vào 3 rổ. Hỏi mỗi rổ có mấy quả cam?',
  steps: [
    { question: 'Lan có mấy quả cam, chia vào mấy rổ?', ky_nang: 'doc_hieu_de', answerForParent: '18 quả, 3 rổ' },
    { question: 'Chia đều vào 3 rổ thì con làm phép tính gì?', ky_nang: 'chon_phep_tinh', answerForParent: 'Phép chia 18 : 3' },
    { question: '18 chia 3 bằng mấy?', ky_nang: 'tinh_toan', answerForParent: '6 quả cam' },
  ],
  brotherProblem: { de: 'Có 12 quả táo chia đều 4 đĩa...' },
}
const cleanSteps = [1, 2, 3].map((k) => ({ stepNo: k, skill: null, stuckCount: 0, usedMicroStep: false, selfSolved: true, revealedAnswer: false }))

t('A1: không có lượt giảng lại → không có góp ý về giảng lại, không có "15 trừ đi 6"', () => {
  const adv = computeCoachAdvice({ sessionData: { steps: cleanSteps }, child: { name: 'Na', grade: 'Lớp 3' }, extra: { ho: 'mẹ', problem: cam } })
  assert.ok(adv.every((a) => a.type !== 'teach_back'), JSON.stringify(adv))
  assert.ok(adv.every((a) => !/15 trừ đi 6/.test(a.message)))
  assert.ok(adv.every((a) => a.id !== 'calc_stuck' && a.id !== 'streak_praise'), 'không đoán kẹt tính toán / chuỗi ngày khi không có dữ liệu')
})
t('A1: có lượt giảng lại cần gợi ý → câu ví dụ lấy đúng phép tính của bài (18 chia 3)', () => {
  const adv = computeCoachAdvice({ sessionData: { steps: cleanSteps }, child: { name: 'Na' }, extra: { ho: 'bố', problem: cam, hasTeachBack: true, teachBackLevel: 'hint' } })
  const g = adv.find((a) => a.id === 'guided_teach_back')
  assert.ok(g, 'phải có góp ý giảng lại')
  assert.match(g.message, /lấy 18 chia 3/)
  assert.match(g.message, /Bố chỉ cần hỏi nhẹ/)
})
t('A1: bài không có phép tính → câu chung, không chứa số', () => {
  assert.equal(extractWhyExample({ steps: [{ answerForParent: 'Từ "lung linh"' }] }), '')
  const adv = computeCoachAdvice({ sessionData: { steps: cleanSteps }, child: { name: 'Na' }, extra: { ho: 'mẹ', problem: { steps: [] }, hasTeachBack: true, teachBackLevel: 'guided' } })
  const g = adv.find((a) => a.id === 'guided_teach_back')
  assert.ok(g && !/\d/.test(g.message), g?.message)
})
t('A2: bài có bài anh em nhưng con chưa làm → không khen bài anh em', () => {
  const b = computeSuggestedBadge({ childName: 'Na', sessionData: { steps: cleanSteps, didBrotherProblem: false, playedMiniGame: false, durationMinutes: null } })
  assert.ok(!/bài anh em/.test(b.reason), b.reason)
  assert.notEqual(b.trait, 'Tập trung', 'không có thời lượng đo thật thì không khen Tập trung')
})
t('A2: con đã làm xong bài anh em → được khen', () => {
  const b = computeSuggestedBadge({ childName: 'Na', sessionData: { steps: cleanSteps, didBrotherProblem: true }, ho: 'bố' })
  assert.match(b.reason, /bài anh em/)
})
const trung = 'Bà có 5 rổ trứng, mỗi rổ 6 quả. Bà làm bánh hết 8 quả. Hỏi bà còn lại bao nhiêu quả trứng?'
t('A3: máy kiểm bắt bậc chung chung, bậc lặp câu hỏi của đề, bài 2 bước thiếu bậc', () => {
  const a = auditSteps([
    { cau_hoi: 'Bà có bao nhiêu quả trứng ban đầu?' },
    { cau_hoi: 'Con đọc lại đề xem bài toán cho biết gì và hỏi gì nào?' },
    { cau_hoi: 'Bà còn lại bao nhiêu quả trứng?' },
  ], trung, 'Toán')
  const kinds = a.issues.map((i) => i.kind).sort()
  assert.deepEqual(kinds, ['generic', 'missing_steps', 'repeat_question'])
})
t('A3: bộ 4 bậc tốt thì không báo lỗi', () => {
  const a = auditSteps([
    { cau_hoi: 'Có mấy rổ trứng, mỗi rổ mấy quả?' },
    { cau_hoi: '5 rổ, mỗi rổ 6 quả, con làm phép gì để biết tất cả?' },
    { cau_hoi: '6 nhân 5 bằng mấy quả trứng?' },
    { cau_hoi: 'Có 30 quả, làm bánh hết 8 quả thì con lấy số nào trừ số nào?' },
  ], trung, 'Toán')
  assert.ok(a.ok, JSON.stringify(a.issues))
})
t('A4: câu nhỏ hơn bám đúng bậc và số trong đề', () => {
  const m = buildLocalMicroStep({ problemText: trung, stepQuestion: 'Bà có bao nhiêu quả trứng ban đầu?', skill: 'doc_hieu_de', microIndex: 1 })
  assert.equal(m.cau_hoi_nho, 'Mỗi rổ có mấy quả?')
  const m2 = buildLocalMicroStep({ problemText: trung, stepAnswer: '6 × 5 = 30', skill: 'tinh_toan', microIndex: 1 })
  assert.match(m2.cau_hoi_nho, /6/)
  assert.ok(isServerMicroStepGeneric({ cau_hoi_nho: 'Na đọc lại số đứng ngay trước câu hỏi nhé?' }, trung))
  assert.ok(!isServerMicroStepGeneric({ cau_hoi_nho: 'Mỗi rổ có mấy quả trứng?' }, trung))
})

t('A3 (gốc, sửa ở 31): bộ chặn lộ đáp án không thay câu nhắc kết quả của bậc trước bằng câu chung', () => {
  const data = { dap_an_cuoi_cho_me: '22 quả trứng', cac_bac: [
    { cau_hoi: 'Có mấy rổ trứng, mỗi rổ mấy quả?', ky_nang: 'doc_hieu_de', dap_an_cho_me: '5 rổ, mỗi rổ 6 quả' },
    { cau_hoi: '5 rổ, mỗi rổ 6 quả, muốn biết tất cả con làm phép gì?', ky_nang: 'chon_phep_tinh', dap_an_cho_me: 'Phép nhân 6 × 5 = 30' },
    { cau_hoi: '6 nhân 5 bằng mấy quả trứng?', ky_nang: 'tinh_toan', dap_an_cho_me: '30 quả' },
    { cau_hoi: 'Có 30 quả, làm bánh hết 8 quả thì con lấy số nào trừ số nào?', ky_nang: 'chon_phep_tinh', dap_an_cho_me: '30 − 8 = 22 quả' },
  ] }
  const r = validateAndGuard('p3_explain_v3', JSON.stringify(data), { problem_text: trung })
  assert.equal(r.data.cac_bac[3].cau_hoi, data.cac_bac[3].cau_hoi, r.validator.detail)
  const leak = JSON.parse(JSON.stringify(data)); leak.cac_bac[3].cau_hoi = '30 trừ 8 bằng 22 phải không con?'
  assert.ok(validateAndGuard('p3_explain_v3', JSON.stringify(leak), { problem_text: trung }).guarded, 'vẫn phải chặn đáp số cuối')
})

console.log('Prompt 29 · Phần A (thông báo của cô)')
const now = new Date('2026-10-28T20:00:00+07:00')
t('Thông báo cũ chưa có hạn: ghim thì vẫn hiện, không ghim thì hết hạn sau 7 ngày', () => {
  assert.equal(announcementStatus({ pinned: 1, created_at: '2026-10-25 01:00:00' }, now), 'active')
  assert.equal(announcementStatus({ pinned: 0, created_at: '2026-10-20 01:00:00' }, now), 'expired')
})
t('Hạn "Hết hôm nay" → hôm sau không còn hiện', () => {
  const exp = expiryFromPreset('today', { now: new Date('2026-10-27T09:00:00+07:00') })
  assert.equal(announcementStatus({ expires_at: exp }, now), 'expired')
})
t('Ẩn / xoá mềm', () => {
  assert.equal(announcementStatus({ hidden_at: '2026-10-28 10:00:00' }, now), 'hidden')
  assert.equal(announcementStatus({ deleted_at: '2026-10-28 10:00:00' }, now), 'deleted')
})
t('Gợi ý chuyển sang Nhắc việc khi có chữ chỉ ngày', () => {
  assert.ok(hasDateWords('Mai con mặc đồng phục'))
  assert.ok(!hasDateWords('Lịch kiểm tra Toán giữa kỳ'))
})

console.log('Prompt 29 · Phần B (người dùng là bố)')
t('xungHo theo người cầm máy', () => {
  assert.equal(xungHo({ parent: 'Bố' }), 'bố')
  assert.equal(xungHo({ parent: 'Ông/Bà' }, null, { cap: true }), 'Ông bà')
  assert.equal(xungHo({ parent: 'Mẹ' }, { member: { role: 'guardian', relation: 'Bố' } }), 'bố')
  assert.equal(haiNguoi('bố'), 'Hai bố con')
})
t('swapMe giữ "bố mẹ" và "mẹo"', () => {
  assert.equal(swapMe('Mẹo nhỏ: bố mẹ khen cụ thể. Mẹ con mình là một đội!', 'bố'), 'Mẹo nhỏ: bố mẹ khen cụ thể. Bố con mình là một đội!')
})
t('Góp ý Gấu khi người dùng là bố không còn chữ "Mẹ" chỉ người kèm', () => {
  const adv = computeCoachAdvice({ sessionData: { steps: cleanSteps }, child: { name: 'Bin', grade: 'Lớp 2' }, extra: { ho: 'bố', problem: cam } })
  assert.ok(adv.every((a) => !/(^|[^\p{L}])[Mm]ẹ(?![\p{L}])/u.test(a.message)), JSON.stringify(adv.map((a) => a.message)))
})

if (process.argv.includes('--bundle')) {
  console.log('Chuỗi trong bundle')
  const dir = path.resolve('dist/assets')
  const files = fs.readdirSync(dir).filter((f) => /^index-.*\.js$/.test(f))
  const html = fs.readFileSync(path.resolve('dist/index.html'), 'utf8')
  const used = files.find((f) => html.includes(f))
  assert.ok(used, 'không tìm thấy index-*.js trong dist/index.html')
  const js = fs.readFileSync(path.join(dir, used), 'utf8')
  for (const s of ['kiểu Apple', 'Feynmann', '15 trừ đi 6', 'Chơi với đồ chơi', 'Không có việc tồn', 'Bước 1/3', 'Tham Gia Gia Đình', 'Đăng ký Tài khoản Cô Giáo']) {
    t(`bundle ${used} không còn "${s}"`, () => assert.ok(!js.includes(s)))
  }
}

console.log(`\nXong: ${n} kiểm tra đạt.`)
