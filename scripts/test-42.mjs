/** scripts/test-42.mjs — Gói 42: số "Học sinh" ở Tổng quan admin, nhật ký bộ chặn dễ hiểu cho tester */
import fs from 'node:fs'
import assert from 'node:assert/strict'

const safety = fs.readFileSync('src/AdminSafetyTab.jsx', 'utf8')
const overview = fs.readFileSync('src/AdminOverviewTab.jsx', 'utf8')
let n = 0
const t = (name, fn) => { fn(); n++; console.log('  ✓ ' + name) }

t('Tổng quan: ô Học sinh không còn trống khi máy chủ trả totalStudents null', () => {
  assert.match(overview, /fmtNum\(m\.totalStudents \?\? m\.activeStudents\)/)
})
t('Nhật ký bộ chặn: có giải thích "dữ liệu thật", tên chức năng và chỗ bị sửa dễ hiểu', () => {
  assert.ok(safety.includes('Đây là <b>dữ liệu thật</b>'))
  assert.match(safety, /p3_explain_v3: 'Soạn bài'/)
  assert.match(safety, /title: 'Chức năng'/)
  assert.match(safety, /title: 'Chỗ bị sửa'/)
  assert.ok(!/title: 'Prompt', render/.test(safety))
})
t('Hàm đổi mã chỗ bị sửa sang tiếng Việt', () => {
  const src = safety.slice(safety.indexOf('function fieldName'), safety.indexOf('const PROMPT_OPTIONS'))
  const fieldName = new Function(src + '; return fieldName')()
  assert.equal(fieldName('cac_bac[].cau_hoi'), 'Một bậc · câu hỏi')
  assert.equal(fieldName('cac_bac[2].dap_an_cho_me'), 'Bậc 3 · đáp án cho phụ huynh')
  assert.equal(fieldName('cac_bac[].goi_y.muc_2_hinh_ve'), 'Một bậc · gợi ý 2 (hình vẽ)')
  assert.equal(fieldName('bai_anh_em.de'), 'Bài tương tự · đề')
})
console.log(`\nXong: ${n} kiểm tra đạt.`)
