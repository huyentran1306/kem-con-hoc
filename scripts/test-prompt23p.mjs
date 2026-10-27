import { renderPrompt } from '../src/promptStudio.js'
import crypto from 'crypto'

console.log('========================================')
console.log('🧪 BẮT ĐẦU KIỂM THỬ PROMPT 23P')
console.log('========================================\n')

let passCount = 0
let failCount = 0

function assert(cond, msg) {
  if (cond) {
    console.log(`  ✓ ${msg}`)
    passCount++
  } else {
    console.error(`  ✗ FAIL: ${msg}`)
    failCount++
  }
}

function sha256Hex(str) {
  return crypto.createHash('sha256').update(String(str || ''), 'utf8').digest('hex')
}

// ----------------------------------------------------
// 1. UNIT TEST: render p3_explain_v2 với đề toán lời văn lớp 3
// ----------------------------------------------------
console.log('--- 1. Kiểm tra Lỗi 1: Router sư phạm áp vào p3_explain_v2 ---')
const problemLop3 = 'Có 3 hộp bút, mỗi hộp 8 cây. Mẹ cho bạn Na 5 cây. Hỏi mẹ còn lại bao nhiêu cây bút?'
const rendered = renderPrompt('p3_explain_v2', {
  mon: 'Toán',
  lop: 'Lớp 3',
  dang_bai: 'Toán có lời văn phép tính',
  de_bai: problemLop3,
})

assert(rendered.includes('Singapore CPA'), 'Kết quả render p3_explain_v2 có chứa "Singapore CPA"')
const phuongPhapLine = rendered.split('\n').find((l) => l.startsWith('PHƯƠNG PHÁP:'))
assert(
  phuongPhapLine && phuongPhapLine.includes('Singapore CPA + Scaffolding + Inquiry (Socratic)'),
  `Dòng PHƯƠNG PHÁP hiển thị chuẩn: "${phuongPhapLine?.trim()}"`
)

// ----------------------------------------------------
// 2. UNIT TEST: Kiểm tra logic Cache Key của Worker (Lỗi 3)
// ----------------------------------------------------
console.log('\n--- 2. Kiểm tra Lỗi 3: Sinh khoá lesson_cache phân biệt lớp, sách, hồ sơ ---')

function normalizeProblem(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[,\.\?!;:"'“”‘’\(\)\[\]\{\}]/g, ' ')
    .replace(/\s+/g, ' ')
}

function simBuildCacheKey({ problemText, grade, bookSeries, subject, promptVersion, systemContent }) {
  const norm = normalizeProblem(problemText)
  const probHash = sha256Hex(norm).slice(0, 16)
  const g = String(grade || 'all').toLowerCase().replace(/\s+/g, '')
  const b = String(bookSeries || 'all').toLowerCase().replace(/\s+/g, '')
  const s = String(subject || 'toan').toLowerCase().replace(/\s+/g, '')
  const v = String(promptVersion || 'v2').trim().toLowerCase()
  const sysHash = systemContent ? sha256Hex(systemContent) : 'none'
  return `lk_${probHash}_${g}_${b}_${s}_${v}_${sysHash}`
}

// 2.1 Cùng đề, đổi lớp -> khoá khác nhau
const kLop2 = simBuildCacheKey({
  problemText: problemLop3,
  grade: 'Lớp 2',
  bookSeries: 'Kết nối tri thức',
  subject: 'Toán',
  promptVersion: 'v2',
  systemContent: renderPrompt('p3_explain_v2', { mon: 'Toán', lop: 'Lớp 2', dang_bai: 'Toán có lời văn', de_bai: problemLop3 }),
})

const kLop4 = simBuildCacheKey({
  problemText: problemLop3,
  grade: 'Lớp 4',
  bookSeries: 'Kết nối tri thức',
  subject: 'Toán',
  promptVersion: 'v2',
  systemContent: renderPrompt('p3_explain_v2', { mon: 'Toán', lop: 'Lớp 4', dang_bai: 'Toán có lời văn', de_bai: problemLop3 }),
})

assert(kLop2 !== kLop4, 'Cùng đề, đổi lớp (Lớp 2 vs Lớp 4) -> Không trúng bộ nhớ (khoá khác nhau)')

// 2.2 Cùng đề, cùng lớp, bé chưa có hồ sơ -> khoá giống nhau
const sysFamA = renderPrompt('p3_explain_v2', {
  mon: 'Toán',
  lop: 'Lớp 3',
  dang_bai: 'Toán có lời văn',
  de_bai: problemLop3,
  ho_so_con: 'chưa có',
})
const sysFamB = renderPrompt('p3_explain_v2', {
  mon: 'Toán',
  lop: 'Lớp 3',
  dang_bai: 'Toán có lời văn',
  de_bai: problemLop3,
  ho_so_con: 'chưa có',
})

const kFamA = simBuildCacheKey({
  problemText: problemLop3,
  grade: 'Lớp 3',
  bookSeries: 'Kết nối tri thức',
  subject: 'Toán',
  promptVersion: 'v2',
  systemContent: sysFamA,
})
const kFamB = simBuildCacheKey({
  problemText: problemLop3,
  grade: 'Lớp 3',
  bookSeries: 'Kết nối tri thức',
  subject: 'Toán',
  promptVersion: 'v2',
  systemContent: sysFamB,
})

assert(kFamA === kFamB, 'Cùng đề, cùng lớp, bé không có hồ sơ ("chưa có") -> Dùng chung bộ nhớ bài giảng giữa các gia đình')

// 2.3 Bé có hồ sơ con khác nhau -> khoá khác nhau
const sysChildCustom = renderPrompt('p3_explain_v2', {
  mon: 'Toán',
  lop: 'Lớp 3',
  dang_bai: 'Toán có lời văn',
  de_bai: problemLop3,
  ho_so_con: 'Bé Thỏ thích vẽ hình, tính nhẩm phép cộng nhanh nhưng hay quên nhớ phép trừ',
})

const kChildCustom = simBuildCacheKey({
  problemText: problemLop3,
  grade: 'Lớp 3',
  bookSeries: 'Kết nối tri thức',
  subject: 'Toán',
  promptVersion: 'v2',
  systemContent: sysChildCustom,
})

assert(kFamA !== kChildCustom, 'Bé có hồ sơ cá nhân hoá ("Gấu nhớ con") -> Khoá tự đổi riêng biệt, không dùng chung')

// ----------------------------------------------------
// 3. KIỂM TRA WORKER PUBLIC CONFIG (Lỗi 2)
// ----------------------------------------------------
console.log('\n--- 3. Kiểm tra Lỗi 2: Worker trả cấu hình công khai ---')
try {
  const resp = await fetch('https://ai-gateway-worker.trannth1306.workers.dev/api/v1/config/public')
  const data = await resp.json()
  assert(data.ok === true, 'GET /api/v1/config/public trả về status ok: true')
  assert(data.aiConfig && typeof data.aiConfig === 'object', 'Public config chứa đối tượng aiConfig')
  assert(Array.isArray(data.aiConfig?.pedagogy_routing), 'aiConfig có chứa danh sách pedagogy_routing')
  assert(typeof data.configVersion === 'string', `configVersion trả về thời gian cập nhật: ${data.configVersion}`)
} catch (e) {
  console.error('Lỗi gọi public config:', e.message)
  failCount++
}

console.log('\n========================================')
console.log(`🏁 TỔNG KẾT: ${passCount} PASS, ${failCount} FAIL`)
console.log('========================================')

if (failCount > 0) process.exit(1)
