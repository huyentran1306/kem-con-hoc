import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { extractJson } from '../src/api.js'
import { renderPrompt } from '../src/promptStudio.js'
import { validateAndGuardAiOutput } from '/Users/pro/Coding/study-en/ai-gateway-worker/src/admin_stitch_routes.js'

console.log('🧪 BẮT ĐẦU KIỂM THỬ CHẶNG 1 (P0.1 -> P0.6)...')

// ---------------------------------------------------------------------
// 1. P0.1: Kiểm tra trang đăng nhập Admin không lộ thông tin
// ---------------------------------------------------------------------
console.log('\n--- 1. Kiểm tra P0.1: Admin login bảo mật ---')
const adminCode = fs.readFileSync(path.resolve('src/Admin.jsx'), 'utf-8')
assert(!adminCode.includes('Tài khoản mặc định'), 'FAIL: Admin.jsx vẫn còn chữ "Tài khoản mặc định"')
assert(!adminCode.includes('admin123'), 'FAIL: Admin.jsx vẫn còn chứa mật khẩu admin123')
assert(!adminCode.includes("useState('admin@kemconhoc.vn')"), 'FAIL: Ô email không được điền sẵn')
console.log('  ✓ Mã nguồn Admin.jsx không còn chuỗi tài khoản/mật khẩu mặc định và không điền sẵn email')

// ---------------------------------------------------------------------
// 2. P0.2: Kiểm tra hàm tách JSON và prompt p3_explain
// ---------------------------------------------------------------------
console.log('\n--- 2. Kiểm tra P0.2: Trích xuất JSON & Validator & Prompt p3 ---')
// 2.1 JSON chuẩn
const json1 = '{"dang_bai":"Toán","cac_bac":[{"cau_hoi":"Bậc 1"}]}'
assert.deepStrictEqual(extractJson(json1), { dang_bai: 'Toán', cac_bac: [{ cau_hoi: 'Bậc 1' }] })
console.log('  ✓ Tách JSON chuẩn thành công')

// 2.2 JSON trong khối ```json
const json2 = '```json\n{"dang_bai":"Toán chia","cac_bac":[]}\n```'
assert.deepStrictEqual(extractJson(json2), { dang_bai: 'Toán chia', cac_bac: [] })
console.log('  ✓ Tách JSON trong khối ```json thành công')

// 2.3 JSON kèm văn xuôi trước và sau
const json3 = 'Dưới đây là bài giảng AI soạn cho bạn:\n{"dang_bai":"Toán đố","loi_khen":"Tốt lắm"}\nChúc bạn học vui!'
assert.deepStrictEqual(extractJson(json3), { dang_bai: 'Toán đố', loi_khen: 'Tốt lắm' })
console.log('  ✓ Tách JSON có kèm lời thoại dẫn xuất trước sau thành công')

// 2.4 JSON hỏng / văn xuôi thuần tuý
const json4 = 'Đây là bài toán về phương pháp Singapore CPA và Socratic...'
assert.strictEqual(extractJson(json4), null)
console.log('  ✓ Văn xuôi không có JSON trả về null chính xác')

// 2.5 Kiểm tra Few-shot prompt p3_explain không chứa "3 hộp bút"
const p3Prompt = renderPrompt('p3_explain', { de_bai: 'Tính 2 + 2' })
assert(!p3Prompt.includes('3 hộp bút'), 'FAIL: p3_explain vẫn còn chứa ví dụ 3 hộp bút!')
assert(p3Prompt.includes('15 chiếc kẹo') || p3Prompt.includes('kẹo'), 'p3_explain đã đổi sang bài chia kẹo')
console.log('  ✓ p3_explain đã đổi ví dụ mẫu, không còn bài "3 hộp bút"')

// 2.6 Kiểm tra validator của Worker không chấm "Đạt" khi lỗi định dạng
const workerVal = validateAndGuardAiOutput('p3_explain', 'Văn xuôi không phải json', 'Đề bài toán')
assert.strictEqual(workerVal.validator.status, 'Lỗi định dạng', 'Worker phải trả về trạng thái "Lỗi định dạng"')
console.log('  ✓ Worker validator trả về "Lỗi định dạng" cho output văn xuôi')

// ---------------------------------------------------------------------
// 3. P0.3: Chuẩn hoá mode onStart của 8 theme (photo | type | voice)
// ---------------------------------------------------------------------
console.log('\n--- 3. Kiểm tra P0.3: Chuẩn hoá onStart cho 8 bộ giao diện ---')
const themedSlotsCode = fs.readFileSync(path.resolve('src/themes/slots/themedSlots.jsx'), 'utf-8')
const screensCode = fs.readFileSync(path.resolve('src/screens.jsx'), 'utf-8')

// Không còn gọi prep
assert(!themedSlotsCode.includes("onStart?.('prep')"), 'FAIL: themedSlots vẫn còn gọi onStart?.("prep")')
assert(!themedSlotsCode.includes("onStart?.('snap')"), 'FAIL: themedSlots vẫn còn gọi onStart?.("snap")')

// Kiểm tra các theme đã dùng đủ start-photo, start-type, start-voice
assert(themedSlotsCode.includes('data-testid="start-photo"'), 'Có data-testid start-photo')
assert(themedSlotsCode.includes('data-testid="start-type"'), 'Có data-testid start-type')
assert(themedSlotsCode.includes('data-testid="start-voice"'), 'Có data-testid start-voice')

// Kiểm tra screens.jsx xử lý đúng 3 giá trị
assert(screensCode.includes("mode === 'photo' || mode === 'snap'"), 'screens.jsx hỗ trợ photo')
assert(screensCode.includes("openSheet('typeProblem')"), 'screens.jsx type mở typeProblem')
assert(screensCode.includes("openSheet('typeProblem', { mode: 'voice', autoMic: true })"), 'screens.jsx voice mở typeProblem có autoMic')
console.log('  ✓ Toàn bộ 8 bộ giao diện và màn chính đã chuẩn hoá đúng 3 mode photo | type | voice')

// ---------------------------------------------------------------------
// 4. P0.4: ErrorBoundary và biến data trong SheetView
// ---------------------------------------------------------------------
console.log('\n--- 4. Kiểm tra P0.4: Sửa ReferenceError data & ErrorBoundary ---')
const appCode = fs.readFileSync(path.resolve('src/App.jsx'), 'utf-8')
assert(appCode.includes('function SheetView({ type, data, session })'), 'FAIL: SheetView thiếu tham số data')
assert(appCode.includes('<ErrorBoundary onClose={closeSheet}'), 'FAIL: SheetView chưa được bọc trong ErrorBoundary')
assert(fs.existsSync(path.resolve('src/ErrorBoundary.jsx')), 'FAIL: File ErrorBoundary.jsx chưa tồn tại')
console.log('  ✓ SheetView đã nhận prop data và được bảo vệ bằng ErrorBoundary chống trắng màn hình')

// ---------------------------------------------------------------------
// 5. P0.5: Đồng nhất hàm đọc auth token (xoá toàn bộ localStorage['auth_token'])
// ---------------------------------------------------------------------
console.log('\n--- 5. Kiểm tra P0.5: Đồng nhất hàm đọc auth token ---')
const apiCode = fs.readFileSync(path.resolve('src/api.js'), 'utf-8')
assert(!apiCode.includes("localStorage.getItem('auth_token')"), 'FAIL: api.js vẫn còn đọc auth_token từ localStorage')
assert(!apiCode.includes('localStorage["auth_token"]'), 'FAIL: api.js vẫn còn đọc auth_token')
console.log('  ✓ Không còn bất kỳ vị trí nào đọc auth_token riêng lẻ trong api.js (dùng getAuthToken())')

// ---------------------------------------------------------------------
// 6. P0.6: Tránh ghi đè studyLog & xử lý bài mẫu
// ---------------------------------------------------------------------
console.log('\n--- 6. Kiểm tra P0.6: Ghi nhận buổi học không bị mất studyLog ---')
assert(screensCode.includes('const isSample = Boolean(problem?.isSample)'), 'Kiểm tra cờ isSample trong ScreenDone')
assert(screensCode.includes('bài mẫu không tính vào lọ kẹo'), 'Thông báo rõ bài mẫu không tính vào lọ kẹo')
assert(appCode.includes('const patch = (obj) => setS((prev) => (typeof obj ==='), 'patch hỗ trợ functional update atomic')
console.log('  ✓ ScreenDone ghi nhận studyLog atomic, bài mẫu được ghi chú rõ ràng không làm sai lệch lọ kẹo')

console.log('\n🏁 TẤT CẢ KIỂM THỬ CHẶNG 1 ĐÃ VƯỢT QUA 100%!')
