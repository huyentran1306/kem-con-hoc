import {
  evaluateTextScope,
  parseOcrV2Result,
  DEFAULT_SCOPE_RULES,
  SAMPLE_SCOPE_CASES,
  formatScopeMessage,
} from '../src/scopeRules.js'

console.log('🧪 BẮT ĐẦU KIỂM THỬ LUẬT PHẠM VI ẢNH & ĐỀ (PROMPT 02):')
console.log('---------------------------------------------------------')

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

// 1. Kiểm thử 6 mẫu bàn thử
console.log('\n--- 1. Kiểm thử 6 mẫu chuẩn Test Bench ---')
for (const sample of SAMPLE_SCOPE_CASES) {
  if (sample.mockAiJson) {
    const res = parseOcrV2Result(sample.mockAiJson, { childGrade: 'Lớp 2', parentRole: 'Mẹ' })
    assert(
      res.category === sample.category,
      `[${sample.name}] Ra đúng loại: expected ${sample.category}, got ${res.category}`
    )
    assert(
      res.action === sample.expectedAction,
      `[${sample.name}] Ra đúng hành động: expected ${sample.expectedAction}, got ${res.action}`
    )
  }
}

// 2. Kiểm thử ảnh nhạy cảm
console.log('\n--- 2. Kiểm thử ảnh nhạy cảm (nhay_cam) ---')
const sensitiveRes = parseOcrV2Result({
  pham_vi: 'nhay_cam',
  do_tin_cay: 0.99,
  ly_do: 'Có mặt người rõ nét và thông tin riêng tư',
  de_bai: '',
})
assert(sensitiveRes.category === 'nhay_cam', 'Loại là nhay_cam')
assert(sensitiveRes.action === 'block', 'Hành động là block')
assert(sensitiveRes.isSensitive === true, 'Đánh dấu isSensitive = true')
assert(sensitiveRes.message.includes('App không lưu ảnh này'), 'Thông điệp chứa câu cam kết "App không lưu ảnh này"')

// 3. Kiểm thử lệch lớp (Con lớp 2, bài lớp 4)
console.log('\n--- 3. Kiểm thử lệch lớp (Lớp 2 vs Lớp 4) ---')
const lechLopRes = parseOcrV2Result(
  {
    pham_vi: 'bai_tap',
    lop_doan: 4,
    mon_doan: 'toan',
    de_bai: 'Bài toán nhân số có 3 chữ số với số có 2 chữ số (Toán 4)',
  },
  { childGrade: 'Lớp 2', childName: 'Kem', parentRole: 'Mẹ' }
)
assert(lechLopRes.category === 'lech_lop', 'Phát hiện lệch lớp (lop_doan 4 vs lop_con 2)')
assert(lechLopRes.action === 'warn', 'Hành động là warn')
assert(lechLopRes.message.includes('Lớp 4') || lechLopRes.message.includes('4'), 'Tin nhắn chứa lớp đoán 4')

// 4. Kiểm thử nhiều bài tập (nhieu_bai: tách 3 câu)
console.log('\n--- 4. Kiểm thử ảnh 3 bài tập ---')
const multiRes = parseOcrV2Result({
  pham_vi: 'nhieu_bai',
  so_bai: 3,
  cac_bai: ['Câu 1: Tính nhẩm', 'Câu 2: Đặt tính', 'Câu 3: Toán đố'],
  de_bai: 'Toàn bộ 3 câu',
})
assert(multiRes.action === 'pick_one', 'Hành động là pick_one')
assert(Array.isArray(multiRes.cac_bai) && multiRes.cac_bai.length === 3, 'Tách đúng 3 câu')

// Chọn câu 2 và kiểm tra lại luật văn bản
const chosenExercise = multiRes.cac_bai[1]
const chosenScope = evaluateTextScope(chosenExercise, { childGrade: 'Lớp 2' })
assert(chosenScope.passed === true, 'Câu 2 hợp lệ khi chọn riêng')

// 5. Kiểm thử làm hộ ("viết hộ bài văn tả mẹ")
console.log('\n--- 5. Kiểm thử làm hộ ---')
const lamHoText = 'Viết hộ con bài văn tả mẹ dài 200 chữ thật hay'
const lamHoScope = evaluateTextScope(lamHoText, { parentRole: 'Mẹ' })
assert(lamHoScope.category === 'lam_ho', 'Phát hiện làm hộ')
assert(lamHoScope.action === 'redirect', 'Hành động là redirect')
assert(
  lamHoScope.redirectNote && lamHoScope.redirectNote.includes('chỉ gợi ý dàn ý và câu hỏi'),
  'Có ghi chú chuyển hướng sư phạm không viết sẵn bài'
)

// 6. Kiểm thử từ khoá bị chặn ("làm hộ bài kiểm tra")
console.log('\n--- 6. Kiểm thử từ khoá bị chặn ---')
const blockedScope = evaluateTextScope('Giải giúp mình đáp án đề thi cuối kỳ', { parentRole: 'Bố' })
assert(blockedScope.action === 'block', 'Bị chặn ngay bởi từ khoá đáp án đề thi')

// 7. Fallback khi AI trả văn bản thuần (không phải JSON)
console.log('\n--- 7. Fallback khi AI trả văn bản thuần ---')
const plainFallback = parseOcrV2Result('Một người nuôi 45 con gà, đã bán đi 15 con gà. Hỏi còn lại mấy con gà?')
assert(plainFallback.passed === true, 'Văn bản thuần không vỡ, được chấp nhận')
assert(plainFallback.de_bai.includes('45 con gà'), 'Giữ nguyên văn bản đề bài')

console.log('---------------------------------------------------------')
console.log(`🏁 TỔNG KẾT: ${passed} PASS, ${failed} FAIL`)

if (failed > 0) {
  process.exit(1)
} else {
  console.log('🎉 TẤT CẢ CÁC BÀI TEST LUẬT PHẠM VI (PROMPT 02) ĐÃ VƯỢT QUA 100%!')
}
