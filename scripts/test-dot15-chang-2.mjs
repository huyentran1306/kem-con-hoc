// Đợt 15 · Chặng 2 · Khung admin: kiểm tra tĩnh
// Chạy: node scripts/test-dot15-chang-2.mjs   (STRICT=1 để coi cảnh báo ở file của người khác là lỗi)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(root, p), 'utf-8')
let failed = 0
let warned = 0
const ok = (cond, msg) => {
  if (cond) console.log('  ✓ ' + msg)
  else {
    failed++
    console.log('  ✗ ' + msg)
  }
}
const warn = (msg) => {
  warned++
  console.log('  ⚠ ' + msg)
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === 'vendor' || e.name === 'node_modules') continue
      walk(p, out)
    } else if (/\.(jsx?|mjs)$/.test(e.name)) out.push(p)
  }
  return out
}
const srcFiles = walk(path.join(root, 'src')).map((p) => ({ rel: path.relative(root, p), code: fs.readFileSync(p, 'utf-8') }))
const SHELL_FILES = ['src/Admin.jsx', 'src/adminApi.js', 'src/AdminLockScreen.jsx', 'src/admin/ShellRoutes.jsx', 'src/admin/ShellSidebar.jsx', 'src/admin/ShellHeader.jsx', 'src/admin/ShellLogin.jsx']

console.log('\n--- 1. Cờ cũ kem-con-hoc:admin-auth không còn được đọc ---')
const OLD_KEY = 'kem-con-hoc:admin-auth'
const readsOld = srcFiles.filter((f) => new RegExp(`getItem\\(\\s*['"\`]${OLD_KEY}`).test(f.code))
ok(readsOld.length === 0, `Không file nào getItem('${OLD_KEY}')` + (readsOld.length ? ': ' + readsOld.map((f) => f.rel).join(', ') : ''))
const mentionsOld = srcFiles.filter((f) => f.code.includes(OLD_KEY)).map((f) => f.rel)
ok(mentionsOld.every((r) => r === 'src/Admin.jsx'), `Chỉ Admin.jsx còn nhắc khoá cũ (để xoá đi): ${mentionsOld.join(', ') || 'không'}`)
const adminJsx = read('src/Admin.jsx')
ok(/LEGACY_ADMIN_KEYS[\s\S]{0,200}kem-con-hoc:admin-auth/.test(adminJsx) && /localStorage\.removeItem\(k\)/.test(adminJsx), 'Admin.jsx xoá hẳn khoá cũ khi nạp')
ok(!/ADMIN_STORAGE_KEY\s*=\s*['"]kem-con-hoc:admin-auth/.test(srcFiles.map((f) => f.code).join('\n')), 'Không còn hằng ADMIN_STORAGE_KEY trỏ tới khoá cũ')
const apiJs = read('src/api.js')
const adminApi = read('src/adminApi.js')
ok(/export function getAdminToken\(\)[\s\S]{0,200}kem-con-hoc:admin-token/.test(apiJs), 'getAdminToken đọc khoá mới kem-con-hoc:admin-token')
ok(adminApi.includes("ADMIN_TOKEN_KEY = 'kem-con-hoc:admin-token'"), 'adminApi.js dùng khoá mới kem-con-hoc:admin-token')

console.log('\n--- 2. Không còn khoá bí mật trong mã app ---')
const usesMaster = srcFiles.filter((f) => f.code.includes('ADMIN_MASTER_SECRET'))
ok(usesMaster.length === 0, 'Không file nào trong src dùng ADMIN_MASTER_SECRET' + (usesMaster.length ? ': ' + usesMaster.map((f) => f.rel).join(', ') : ''))
ok(!/retry|master/i.test(adminApi.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')), 'adminFetch không còn thử lại bằng khoá chủ')
ok(adminApi.includes("'kch-admin-unauthorized'") && /status === 401[\s\S]{0,120}dispatchEvent/.test(adminApi), 'adminFetch phát sự kiện kch-admin-unauthorized khi gặp 401')
const literal = srcFiles.filter((f) => f.code.includes('kem-con-hoc-admin-secret-2026'))
for (const f of literal) {
  if (SHELL_FILES.includes(f.rel)) ok(false, `File khung admin còn chuỗi khoá cũ: ${f.rel}`)
  else if (process.env.STRICT === '1') ok(false, `Còn chuỗi khoá cũ: ${f.rel}`)
  else warn(`Còn chuỗi khoá cũ ở file của người khác (cần chủ file gỡ): ${f.rel}`)
}

console.log('\n--- 3. Mỗi trang một đường dẫn ---')
const routes = read('src/admin/ShellRoutes.jsx')
const SLUGS = ['/admin', '/admin/gia-dinh', '/admin/buoi-hoc', '/admin/bao-cao', '/admin/giao-vien', '/admin/mo-hinh', '/admin/prompt-studio', '/admin/router', '/admin/pham-vi', '/admin/an-toan', '/admin/giao-dien', '/admin/quan-tri-vien', '/admin/nhat-ky', '/admin/ha-tang', '/admin/zalo', '/admin/sql', '/admin/team-prompts']
const tableSrc = routes.slice(routes.indexOf('ADMIN_ROUTE_TABLE'), routes.indexOf('}', routes.indexOf('ADMIN_ROUTE_TABLE')))
const missing = SLUGS.filter((s) => !tableSrc.includes(`'${s}':`))
ok(missing.length === 0, `Bảng đường dẫn có đủ ${SLUGS.length} trang` + (missing.length ? ' (thiếu ' + missing.join(', ') + ')' : ''))
ok(/ADMIN_ROUTE_TABLE\[path\] \|\| 'overview'/.test(routes), 'Slug lạ thì về Tổng quan')
ok(adminJsx.includes('history.pushState') && adminJsx.includes("addEventListener('popstate'"), 'Điều hướng bằng pushState và nghe popstate (nút quay lại hoạt động)')
ok(/team-prompts[^\n]*devOnly: true/.test(routes) && routes.includes("import.meta.env.VITE_DEV_TOOLS === '1'"), 'Team Prompts Sync chỉ hiện khi VITE_DEV_TOOLS=1')
ok(/id: 'sql'[^\n]*superadminOnly: true/.test(routes) && routes.includes("role !== 'superadmin'"), 'D1 SQL Studio chỉ hiện với superadmin')
for (const g of ['Theo dõi', 'AI & nội dung', 'Hệ thống']) ok(routes.includes(`label: '${g}'`), `Thanh bên có nhóm "${g}"`)

console.log('\n--- 4. Chặn truy cập ở máy chủ ---')
ok(adminJsx.includes('/api/v1/admin/me'), 'Admin.jsx gọi GET /api/v1/admin/me')
ok(/useState\('checking'\)/.test(adminJsx), 'Trạng thái ban đầu là "checking" (chưa hiện khung)')
const iChecking = adminJsx.indexOf("status === 'checking'")
const iShell = adminJsx.indexOf('<ShellSidebar')
ok(iChecking > 0 && iShell > iChecking && /if \(res\.ok && data\.ok && data\.admin\) return \{ status: 'ready'/.test(adminJsx), 'Khung admin chỉ dựng ở nhánh "ready" sau khi /me trả phiên hợp lệ')
ok(/res\.status === 423\) return \{ status: 'locked'/.test(adminJsx), '423 → màn khoá PIN')
ok(!/Boolean\(token\)/.test(adminJsx), 'Không còn suy ra đã đăng nhập chỉ từ việc có token trong máy')
ok(adminJsx.includes('ADMIN_UNAUTHORIZED_EVENT') && adminJsx.includes("setStatus('login')"), 'Khung admin nghe sự kiện hết phiên và quay về đăng nhập')

console.log('\n--- 5. Khung theo bộ quy chuẩn ---')
const shellCode = SHELL_FILES.map((f) => read(f)).join('\n')
ok(!/<select[\s>]/.test(shellCode), 'Không dùng <select> mặc định trong khung')
ok(!/Stitch|stitch-brand-badge|>Admin</.test(shellCode.replace(/className="[^"]*"/g, '').replace(/className=\{`[^`]*`\}/g, '')), 'Không còn nhãn "Admin"/"Stitch"')
ok(!/84 buổi|AI Gateway: Hoạt động/.test(shellCode), 'Không còn số viết cứng và chấm "AI Gateway" giả')
ok(adminJsx.includes('/api/v1/admin/health') && adminJsx.includes('/api/v1/admin/todo-counts') && adminJsx.includes('/api/v1/admin/overview?range=today'), 'Sức khoẻ, chuông, số buổi lấy từ API thật')
ok((adminJsx.match(/<ToastHost \/>/g) || []).length === 1 && (adminJsx.match(/<ConfirmHost \/>/g) || []).length === 1, 'ToastHost và ConfirmHost gắn đúng một lần')
ok(!/theme === 'blue'|Xanh dương/.test(adminJsx), 'Đã bỏ giao diện xanh dương')
ok(/hideSubNav/.test(adminJsx), 'Truyền hideSubNav cho AdminConfigTab và AdminToolsTab')

console.log(`\n${failed ? '✗' : '✓'} Chặng 2: ${failed} lỗi, ${warned} cảnh báo`)
process.exit(failed ? 1 : 0)
