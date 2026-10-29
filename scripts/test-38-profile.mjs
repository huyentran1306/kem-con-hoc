/** scripts/test-38-profile.mjs — Gói 38: màn Con tôi theo bản vẽ v3 (UI/UX) */
import fs from 'node:fs'
import assert from 'node:assert/strict'

const pf = fs.readFileSync('src/ProfileScreen.jsx', 'utf8')
const cs = fs.readFileSync('src/ChildSheets.jsx', 'utf8')
const css = fs.readFileSync('src/profile.css', 'utf8')
const app = fs.readFileSync('src/App.jsx', 'utf8')
const dlg = fs.readFileSync('src/dialog.jsx', 'utf8')
let n = 0
const t = (name, fn) => { fn(); n++; console.log('  ✓ ' + name) }

// Hàm kiểm tên chạy thật (không cần trình duyệt)
const src = cs.slice(cs.indexOf('export function checkChildName'), cs.indexOf('function SheetFrame'))
const checkChildName = new Function('NAME_MAX', src.replace('export function checkChildName', 'return function checkChildName'))(20)

t('Nút "Thêm con" nổi bật, dính đáy (vùng ngón cái), có giới hạn 4 bé', () => {
  assert.match(pf, /className="pf-cta"[\s\S]*?data-testid="btn-add-child"/)
  assert.match(css, /\.pf-cta-bar \{ position: sticky;/)
  assert.match(css, /\.pf-cta \{[\s\S]*?min-height: 66px/)
  assert.match(pf, /export const MAX_CHILDREN = 4/)
})
t('Sửa hồ sơ bằng nút bút chì có nhãn cho trình đọc màn hình', () => {
  assert.match(pf, /<Pencil aria-hidden="true" \/>/)
  assert.match(pf, /aria-label=\{`Sửa hồ sơ của \$\{child\.name\}`\}/)
  assert.ok(!pf.includes('✏️ Sửa hồ sơ'))
})
t('Xoá "điều app nhớ" luôn hỏi lại (không khôi phục được), tiêu điểm đặt ở nút an toàn', () => {
  assert.match(pf, /title: 'Xoá ghi nhớ này\?', okText: 'Xoá ghi nhớ', cancelText: 'Giữ lại', danger: true/)
  assert.match(pf, /if \(!ok\) return\n\s*setChild\(\{ deletedMemoryIds/)
  assert.match(dlg, /safeFirst \? cancelRef\.current : okRef\.current/)
})
t('Thêm con chia 3 bước, báo lỗi ngay tại ô nhập', () => {
  assert.match(cs, /const STEP_TITLES = \['Thông tin của bé', 'Lớp học', 'Môn cần kèm'\]/)
  assert.equal(checkChildName('', []), 'Vui lòng nhập tên hoặc biệt danh của bé.')
  assert.equal(checkChildName('B', []), 'Tên cần ít nhất 2 ký tự.')
  assert.equal(checkChildName(' bé na ', [{ id: 'a', name: 'Bé Na' }]), 'Tên này đã có trong danh sách. Hãy thêm số hoặc chữ để phân biệt.')
  assert.equal(checkChildName('Bé Na', [{ id: 'a', name: 'Bé Na' }], 'a'), '')
  assert.equal(checkChildName('Bon', []), '')
  assert.match(cs, /role="alert"/)
})
t('Đóng khi đang nhập dở thì hỏi lại; thêm/sửa xong có Hoàn tác; nút bận chặn bấm lặp', () => {
  assert.match(cs, /title: 'Bỏ thông tin đang nhập\?'/)
  assert.match(cs, /toast\(`✓ Đã thêm bé \$\{kid\.name\}`, \{\n\s*undo:/)
  assert.match(cs, /if \(busyRef\.current\) return/)
  assert.match(cs, /aria-busy=\{busy\}/)
  assert.match(app, /className="toast-undo"/)
  assert.match(fs.readFileSync('src/utils.js', 'utf8'), /export function toast\(msg, opts\)/)
})
t('Vùng chạm ≥ 48px: công tắc, nút đóng, nút xoá ghi nhớ, lựa chọn', () => {
  assert.match(css, /\.pf \{ --pf-tap: 48px;/)
  assert.match(css, /\.pf-switch \{[^}]*height: var\(--pf-tap\)/)
  assert.match(css, /\.cf-x \{[^}]*width: 48px; height: 48px/)
  assert.match(css, /\.cf-opt \{ min-height: 48px/)
  assert.match(css, /\.pf-mem-item button \{[^}]*width: var\(--pf-tap\); height: var\(--pf-tap\)/)
})
t('Màu chỉ đọc từ biến của bộ giao diện, có biến tương phản cao cho chữ phụ', () => {
  const hex = css.replace(/var\([^)]*\)/g, '').match(/#[0-9a-fA-F]{3,8}\b/g) || []
  assert.deepEqual(hex, [], 'mã màu viết cứng: ' + hex.join(','))
  assert.match(css, /--pf-muted: color-mix\(in srgb, var\(--c-text-2\) 40%, var\(--c-text\)\)/)
  assert.ok(!/#[0-9a-fA-F]{6}/.test(pf), 'ProfileScreen không tô màu cứng')
})
t('Nhóm ít dùng thu gọn sẵn; điều hướng có aria-expanded; đăng xuất hỏi lại', () => {
  assert.match(pf, /const \[openApp, setOpenApp\] = useState\(false\)/)
  assert.match(pf, /const \[openPrivacy, setOpenPrivacy\] = useState\(false\)/)
  assert.match(pf, /aria-expanded=\{expanded\}/)
  assert.match(pf, /okText: 'Đăng xuất', cancelText: 'Ở lại'/)
})
console.log(`\nXong: ${n} kiểm tra đạt.`)
