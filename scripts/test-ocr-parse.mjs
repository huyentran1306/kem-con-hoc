/* Kiểm thử parse output Vision OCR v3 (JSON lỗi, tách bài làm, chỗ [?]) */
import { parseLooseJson, parseOcrV2Result } from '../src/scopeRules.js'

let pass = 0
let fail = 0
const assert = (cond, msg) => {
  if (cond) { pass++; console.log('✅ PASS:', msg) } else { fail++; console.log('❌ FAIL:', msg) }
}
const ctx = { childGrade: 'Lớp 2', parentRole: 'Mẹ' }

// 1. JSON bọc ```json + xuống dòng thật trong chuỗi
const r1 = parseOcrV2Result('```json\n{"pham_vi": "bai_tap", "lop_doan": 2, "de_bai": "Mẹ mua 9 quả táo.\nHỏi còn mấy quả?", "bai_lam_cua_con": "9 - 3 = 6", "cho_khong_chac": ["9"]}\n```', ctx)
assert(r1.fromJson === true, 'JSON có xuống dòng thật vẫn parse được')
assert(r1.de_bai === 'Mẹ mua 9 quả táo.\nHỏi còn mấy quả?', 'Giữ nguyên đề nhiều dòng')
assert(r1.bai_lam_cua_con === '9 - 3 = 6', 'Tách được bài làm của con')
assert(r1.cho_khong_chac.length === 1 && r1.cho_khong_chac[0] === '9', 'Lấy được danh sách chỗ chưa chắc')

// 2. Dấu nháy kép chưa escape trong đề + dấu phẩy thừa
const r2 = parseLooseJson('{"pham_vi": "bai_tap", "de_bai": "Điền từ vào chỗ trống: "con ...èo" ", "lop_doan": 1,}')
assert(r2 && r2.de_bai === 'Điền từ vào chỗ trống: "con ...èo" ', 'Sửa được dấu " chưa escape và dấu phẩy thừa')

// 3. Lời dẫn trước JSON
const r3 = parseOcrV2Result('Đây là kết quả: {"pham_vi": "anh_mo", "ly_do": "ảnh rung"}', ctx)
assert(r3.category === 'anh_mo' && r3.action === 'retake', 'Có lời dẫn vẫn nhận anh_mo')

// 4. JSON bài tập nhưng de_bai rỗng → không trả "[object Object]"
const r4 = parseOcrV2Result({ pham_vi: 'bai_tap', de_bai: '' }, ctx)
assert(r4.de_bai === '', 'de_bai rỗng giữ rỗng (không ra [object Object])')

// 5. Văn bản thuần (OCR thô) → không phải JSON
const r5 = parseOcrV2Result('Lan co 5 qua cam', ctx)
assert(!r5.fromJson && r5.de_bai === 'Lan co 5 qua cam', 'Văn bản thuần đi nhánh fallback')

// 6. Nhạy cảm vẫn chặn, kèm trường v3 rỗng
const r6 = parseOcrV2Result('{"pham_vi":"nhay_cam","de_bai":""}', ctx)
assert(r6.action === 'block' && r6.bai_lam_cua_con === '', 'Nhạy cảm vẫn bị chặn')

console.log('---------------------------------------------------------')
console.log(`🏁 TỔNG KẾT: ${pass} PASS, ${fail} FAIL`)
if (fail) process.exit(1)
