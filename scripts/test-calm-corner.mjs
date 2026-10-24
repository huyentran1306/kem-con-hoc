/* ============================================================
   KÈM CON HỌC — TEST SUITE CHO GÓC HẠ HOẢ MỚI (PROMPT 08)
   ============================================================ */

import {
  DEFAULT_CALM_RULES,
  CALM_REASONS,
  CALM_MOVEMENT_GAMES,
  FALLBACK_CALM_PHRASES,
  checkAnswerLeakage,
} from '../src/calmCornerData.js'

let passed = 0
let failed = 0

function assert(cond, msg) {
  if (cond) {
    console.log(`✅ PASS: ${msg}`)
    passed++
  } else {
    console.error(`❌ FAIL: ${msg}`)
    failed++
  }
}

console.log('🧪 BẮT ĐẦU KIỂM THỬ GÓC HẠ HOẢ MỚI (PROMPT 08):')
console.log('------------------------------------------------------------')

// --- 1. Kiểm thử cấu hình ngưỡng nhắc (Prompt 08 Mục 1) ---
console.log('\n--- 1. Kiểm thử cấu hình ngưỡng nhắc bình tĩnh ---')
assert(DEFAULT_CALM_RULES.stuck_repeat === 2, 'Ngưỡng bí lặp lại: 2 lần')
assert(DEFAULT_CALM_RULES.step_minutes === 4, 'Ngưỡng thời gian ở 1 bậc: 4 phút')
assert(DEFAULT_CALM_RULES.max_per_problem === 1, 'Tối đa 1 lần nhắc mỗi bài')
assert(DEFAULT_CALM_RULES.max_per_night === 2, 'Tối đa 2 lần nhắc mỗi tối')
assert(DEFAULT_CALM_RULES.snooze_minutes === 10, 'Để sau ẩn trong 10 phút')

// --- 2. Kiểm thử danh mục 4 lý do (Prompt 08 Mục 2) ---
console.log('\n--- 2. Kiểm thử 4 lý do 1 chạm ---')
assert(CALM_REASONS.length === 4, 'Đúng 4 lý do chính')
const reasonIds = CALM_REASONS.map((r) => r.id)
assert(reasonIds.includes('not_understood'), 'Có lý do: Con chưa hiểu')
assert(reasonIds.includes('distracted'), 'Có lý do: Con mất tập trung')
assert(reasonIds.includes('frustrated'), 'Có lý do: Mẹ đang mệt, bực')
assert(reasonIds.includes('late'), 'Có lý do: Muộn rồi')

// --- 3. Kiểm thử 12 trò vận động 2 phút (Prompt 08 Mục 2) ---
console.log('\n--- 3. Kiểm thử 12 trò vận động 2 phút ---')
assert(CALM_MOVEMENT_GAMES.length === 12, 'Có đủ 12 trò vận động không cần AI')
CALM_MOVEMENT_GAMES.forEach((g, idx) => {
  assert(Boolean(g.id && g.title && g.emoji && g.desc), `Trò ${idx + 1} (${g.title}) có đủ trường`)
})

// --- 4. Kiểm thử câu dự phòng tức thì cho 4 lý do (Prompt 08 Mục 4) ---
console.log('\n--- 4. Kiểm thử câu dự phòng tức thì ---')
for (const rid of reasonIds) {
  const phrases = FALLBACK_CALM_PHRASES[rid]
  assert(Array.isArray(phrases) && phrases.length >= 2, `Lý do ${rid} có ít nhất 2 câu dự phòng`)
  phrases.forEach((p, idx) => {
    assert(Boolean(p.thay_vi_noi && p.thu_noi && p.viec_lam_ngay), `Câu ${idx + 1} của ${rid} đủ 3 phần`)
    assert(!p.thu_noi.includes('sao không hiểu'), `Câu thử nói không mang tính trách móc`)
  })
}

// --- 5. Kiểm thử bộ lọc chống lộ đáp án (Prompt 08 Mục 4) ---
console.log('\n--- 5. Kiểm thử bộ lọc chống lộ đáp án ---')
const mockProblem = {
  ocr: 'Có 15 bông hoa, cắm vào 3 lọ. Hỏi mỗi lọ có mấy bông hoa?',
  steps: [{ q: 'Lọ thứ nhất có mấy bông?', a: '5 bông hoa' }],
  answer: '5 bông hoa',
}

const safeText = 'Mình lấy 15 chiếc kẹo ra chia đều thành 3 nhóm xem sao nha con!'
const leakText = 'Kết quả là 5 bông hoa đó con ơi!'

assert(!checkAnswerLeakage(safeText, mockProblem, 0), 'Câu an toàn không bị chặn')
assert(checkAnswerLeakage(leakText, mockProblem, 0), 'Câu chứa số đáp án 5 (không có trong đề) bị chặn chính xác')

// Thử trường hợp số có sẵn trong đề bài (ví dụ 15, 3)
const textWithQuestionNum = 'Đề bài cho 15 bông hoa và 3 cái lọ nè con!'
assert(!checkAnswerLeakage(textWithQuestionNum, mockProblem, 0), 'Số có sẵn trong đề bài (15, 3) được phép nhắc')

console.log('------------------------------------------------------------')
console.log(`🏁 TỔNG KẾT: ${passed} PASS, ${failed} FAIL`)
if (failed === 0) {
  console.log('🎉 TẤT CẢ CÁC BÀI TEST GÓC HẠ HOẢ MỚI (PROMPT 08) ĐÃ VƯỢT QUA 100%!')
  process.exit(0)
} else {
  console.error('💥 CÓ LỖI XẢY RA TRONG TEST SUITE!')
  process.exit(1)
}
