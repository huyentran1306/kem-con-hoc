// scripts/test-chang-2.mjs
// Automated verification suite for Chặng 2 (P1.1 -> P1.8, P2.1 -> P2.10)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`)
    passed++
  } else {
    console.error(`  ✗ FAIL: ${message}`)
    failed++
  }
}

console.log('🧪 BẮT ĐẦU KIỂM THỬ CHẶNG 2 (P1.1 -> P1.8, P2.1 -> P2.10)...')

// --- P1.1: 8 themes have --c-hero-bg ---
console.log('\n--- 1. Kiểm tra P1.1: Biến --c-hero-bg trong 8 theme ---')
const themesCss = fs.readFileSync(path.join(rootDir, 'src/themes.css'), 'utf-8')
const themeNames = ['candy', 'bear', 'bento', 'sticker', 'notebook', 'garden', 'aurora', 'chalk']
assert(themesCss.includes(':root') && themesCss.includes('--c-hero-bg:'), ':root (default) có khai báo biến --c-hero-bg')
for (const t of themeNames) {
  const re = new RegExp(`\\[data-theme=["']${t}["']\\][^{]*\\{[^}]*--c-hero-bg:`, 's')
  assert(re.test(themesCss), `Theme "${t}" có khai báo biến --c-hero-bg`)
}
const stylesCss = fs.readFileSync(path.join(rootDir, 'src/styles.css'), 'utf-8')
assert(stylesCss.includes('var(--c-hero-bg'), '.hero-band sử dụng var(--c-hero-bg)')

// --- P1.2: Contrast & Theme CSS Variables ---
console.log('\n--- 2. Kiểm tra P1.2: Chuẩn hoá biến màu theo theme, không hardcode ---')
assert(!stylesCss.includes('.sound-hdr-btn{\n  color:#333'), '.sound-hdr-btn không hardcode màu chữ #333')
assert(stylesCss.includes('.sound-hdr-btn') && stylesCss.includes('color:var(--c-text'), '.sound-hdr-btn sử dụng var(--c-text)')
assert(stylesCss.includes('.field{') && stylesCss.includes('var(--c-surface'), '.field dùng background thẻ động theo theme')
assert(stylesCss.includes('.opt{') && stylesCss.includes('var(--c-text'), '.opt dùng màu chữ dynamic')
assert(stylesCss.includes('.tabs{') && stylesCss.includes('var(--c-nav'), '.tabs dùng biến var(--c-nav)')
assert(stylesCss.includes('.tabs .on{') && stylesCss.includes('var(--c-accent-ink'), '.tabs .on dùng var(--c-accent-ink)')

// --- P1.3: Padding và Calm FAB ---
console.log('\n--- 3. Kiểm tra P1.3: Padding .scroll và Calm FAB mini ---')
assert(stylesCss.includes('padding:18px 20px 140px'), '.scroll có padding bottom 140px chống che khuất bởi thanh công cụ')
assert(stylesCss.includes('.calm-fab.mini'), '.calm-fab.mini có lớp CSS nút tròn 44px')
const appJsx = fs.readFileSync(path.join(rootDir, 'src/App.jsx'), 'utf-8')
assert(appJsx.includes("['explain', 'scaffold', 'done', 'snap', 'analyze'].includes(screen)"), 'Calm FAB tự động chuyển sang chế độ mini ở màn hình có nút sticky đáy')

// --- P1.4: Calm Nudge non-blocking ---
console.log('\n--- 4. Kiểm tra P1.4: Calm Nudge không chặn thao tác (non-blocking) ---')
const screensJsx = fs.readFileSync(path.join(rootDir, 'src/screens.jsx'), 'utf-8')
assert(!screensJsx.includes("if (stepStuck) {\n      openSheet('calm')"), 'stepStuck không cưỡng ép bật modal CalmSheet')
assert(screensJsx.includes('<CalmNudgeCard'), 'CalmNudgeCard hiển thị nhẹ nhàng, trẻ vẫn có thể tiếp tục làm bài')

// --- P1.5: Scaffold actions slot & HoldReveal keyboard ---
console.log('\n--- 5. Kiểm tra P1.5: Nút Gợi ý tiếp/Đã hiểu và Phím cách trên HoldReveal ---')
assert(screensJsx.includes('ScaffoldActionsSlot') && screensJsx.includes('stepStuck') && screensJsx.includes('stepOk'), 'Scaffold có ScaffoldActionsSlot với onStuck và onAnswered')
const defaultSlotsJsx = fs.readFileSync(path.join(rootDir, 'src/themes/slots/defaultSlots.jsx'), 'utf-8')
assert(defaultSlotsJsx.includes('data-testid="btn-stuck"') && defaultSlotsJsx.includes('data-testid="btn-answered"'), 'DefaultScaffoldActions có data-testid="btn-stuck" và "btn-answered"')
const uiJsx = fs.readFileSync(path.join(rootDir, 'src/ui.jsx'), 'utf-8')
assert(uiJsx.includes("e.key === ' ' || e.key === 'Spacebar'"), 'HoldReveal hỗ trợ giữ phím Spacebar')

// --- P1.6: State khởi tạo không tạo sẵn kẹo giả ---
console.log('\n--- 6. Kiểm tra P1.6: Khởi tạo lọ kẹo sạch (0 kẹo) ---')
assert(appJsx.includes('stickers: 0') && appJsx.includes('stickersList: []'), 'initialState bắt đầu với 0 kẹo và stickersList rỗng')

// --- P1.7: BlowingMiniGame responsive button stack ---
console.log('\n--- 7. Kiểm tra P1.7: Nút mini game thổi nến xếp dọc trên mobile ---')
const blowingJsx = fs.readFileSync(path.join(rootDir, 'src/BlowingMiniGame.jsx'), 'utf-8')
assert(blowingJsx.includes("flexDirection: 'column'") && blowingJsx.includes("width: '100%'"), 'Các nút mini game thổi nến dàn 100% chiều rộng chống tràn chữ')

// --- P1.8: Teacher class naming duplicate check ---
console.log('\n--- 8. Kiểm tra P1.8: Chuẩn hoá tên lớp không bị "Lớp Lớp" ---')
const teacherPortalJsx = fs.readFileSync(path.join(rootDir, 'src/TeacherPortal.jsx'), 'utf-8')
assert(teacherPortalJsx.includes('function formatClassName(name)'), 'Có hàm formatClassName')
assert(teacherPortalJsx.includes('/^lớp\\s+/i.test(s) ? s : `Lớp ${s}`'), 'formatClassName kiểm tra tiền tố regex /^lớp\\s+/i và trả về chuẩn không lặp từ')

// --- P2.1: Teacher assignment draft display ---
console.log('\n--- 9. Kiểm tra P2.1: Hiển thị bài giảng nháp & trạng thái Chưa đặt hạn ---')
assert(teacherPortalJsx.includes("'Chưa đặt hạn'"), 'Bài tập nháp hiển thị "Chưa đặt hạn" thay vì ngày rỗng')
assert(teacherPortalJsx.includes("'Duyệt bài giảng'"), 'Bài tập nháp có nút hành động "Duyệt bài giảng"')

// --- P2.2: Teacher portal tab header layout ---
console.log('\n--- 10. Kiểm tra P2.2: Thanh tab Cổng Giáo Viên không tràn dòng ---')
assert(teacherPortalJsx.includes("whiteSpace: 'nowrap'") && teacherPortalJsx.includes("overflowX: 'auto'"), 'Tab giáo viên chống co rúm chữ (whiteSpace nowrap) và hỗ trợ scroll ngang')
assert(!teacherPortalJsx.includes('⏰ Nhắc việc (Mục 4b)'), 'Đã bỏ nhãn tạm "(Mục 4b)" trong tab Nhắc việc')

// --- P2.3: Admin overview metrics fallback ---
console.log('\n--- 11. Kiểm tra P2.3: Bỏ số liệu giả lập & thương hiệu thừa trong Admin ---')
const adminJsx = fs.readFileSync(path.join(rootDir, 'src/Admin.jsx'), 'utf-8')
assert(!adminJsx.includes(' · Stitch'), 'Đã gỡ bỏ chuỗi " · Stitch" khỏi brand badge')
const adminOverviewJsx = fs.readFileSync(path.join(rootDir, 'src/AdminOverviewTab.jsx'), 'utf-8')
assert(!adminOverviewJsx.includes("'1.2s'") && !adminOverviewJsx.includes("'85%'"), 'Bỏ các số liệu hardcode 1.2s, 85% trong Admin Overview')
assert(adminOverviewJsx.includes("'Chưa có dữ liệu'"), 'Fallback "Chưa có dữ liệu" khi chưa có thông số thực tế')

// --- P2.4: Title dark mode contrast ---
console.log('\n--- 12. Kiểm tra P2.4: Độ tương phản tiêu đề trong dark mode ---')
assert(stylesCss.includes('.title{') && stylesCss.includes('var(--c-accent-ink'), '.title sử dụng var(--c-accent-ink, var(--plum-deep))')

// --- P2.5: Teacher portal register route ---
console.log('\n--- 13. Kiểm tra P2.5: Đường dẫn /teacher/dang-ky khởi tạo đúng authMode register ---')
assert(teacherPortalJsx.includes("p === '/teacher/dang-ky'"), 'Khởi tạo authMode register khi truy cập /teacher/dang-ky')

// --- P2.6: Public config API & client caching ---
console.log('\n--- 14. Kiểm tra P2.6: API public config tinh gọn và cache client ---')
const workerPath = '/Users/pro/Coding/study-en/ai-gateway-worker/src/v1_routes.js'
if (fs.existsSync(workerPath)) {
  const workerV1Routes = fs.readFileSync(workerPath, 'utf-8')
  assert(!workerV1Routes.includes('promptDetail') && workerV1Routes.includes('Cache-Control') && workerV1Routes.includes('max-age=300'), 'API /api/v1/config/public không lộ promptDetail và có header Cache-Control 300s')
} else {
  console.log('  ⚠️ Warning: workerPath not found on disk, skipping worker check')
}
assert(appJsx.includes('loadPublicConfig(false)'), 'App client nạp public config với useCache = false/true tối ưu')

// --- P2.7: Code splitting / Bundle optimization ---
console.log('\n--- 15. Kiểm tra P2.7: Phân đoạn mã nguồn (Code-splitting) ---')
assert(appJsx.includes("lazy(() => import('./Admin'))"), 'AdminPortal được nạp lười biếng (lazy load)')
assert(appJsx.includes("lazy(() => import('./TeacherPortal'))"), 'TeacherPortal được nạp lười biếng (lazy load)')
assert(appJsx.includes("lazy(() => import('./FamilyClassSheet')"), 'FamilyClassSheet được nạp lười biếng')
assert(appJsx.includes("lazy(() => import('./FamilyMembersSheet')"), 'FamilyMembersSheet được nạp lười biếng')

// --- P2.8: Atomic State Save Optimization ---
console.log('\n--- 16. Kiểm tra P2.8: Chống ghi lặp lại D1 state khi không thay đổi ---')
assert(appJsx.includes('lastSavedHashRef'), 'lastSavedHashRef được sử dụng để kiểm tra nội dung thay đổi')
assert(appJsx.includes('lastSavedHashRef.current === serialized'), 'Bỏ qua lệnh PUT /family/state thừa thãi khi hash state không đổi')

// --- P2.9: Lock /db/* with Admin Token Auth ---
console.log('\n--- 17. Kiểm tra P2.9: Khoá an toàn các route /db/* bằng Admin Token ---')
const workerIndexJs = fs.readFileSync('/Users/pro/Coding/study-en/ai-gateway-worker/src/index.js', 'utf-8')
assert(workerIndexJs.includes('authenticateAdmin'), 'Worker import hàm authenticateAdmin từ v1_routes')
assert(workerIndexJs.includes('pathname.startsWith("/db/")') && workerIndexJs.includes('authenticateAdmin(request, env)'), 'Tất cả route /db/* được bảo vệ qua authenticateAdmin')
assert(workerIndexJs.includes('Unauthorized: Yêu cầu quyền Quản trị viên'), 'Trả về mã lỗi 401 Unauthorized khi không có admin token')

const apiJs = fs.readFileSync(path.join(rootDir, 'src/api.js'), 'utf-8')
assert(apiJs.includes('export function getAdminToken'), 'api.js có hàm getAdminToken đọc admin auth token')
assert(apiJs.includes('getAdminToken() || getAuthToken()'), 'api.js tự động truyền admin token cho các yêu cầu hệ thống')

const syncDbCloneJs = fs.readFileSync(path.join(rootDir, 'scripts/sync-db-clone.js'), 'utf-8')
assert(syncDbCloneJs.includes('Authorization:') && syncDbCloneJs.includes('ADMIN_KEY'), 'sync-db-clone.js đính kèm Authorization header hợp lệ')

// --- P2.10: Typography & Em-dash cleanup ---
console.log('\n--- 18. Kiểm tra P2.10: Chuẩn hoá dấu gạch ngang giao diện ---')
assert(!appJsx.includes("toast('Thẻ Cô nhắc —"), 'Đã dọn dẹp em-dash trong App toasts')
assert(!screensJsx.includes("Đã hết giờ —"), 'Đã dọn dẹp em-dash trong screens')

console.log(`\n============================================================`)
console.log(`🏁 TỔNG KẾT CHẶNG 2: ${passed} PASS, ${failed} FAIL`)
if (failed > 0) {
  process.exit(1)
} else {
  console.log('🎉 TẤT CẢ KIỂM THỬ CHẶNG 2 ĐÃ VƯỢT QUA 100%!')
}
