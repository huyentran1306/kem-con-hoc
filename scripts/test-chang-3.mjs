/**
 * KIỂM THỬ TỰ ĐỘNG CHẶNG 3: CỔNG GIÁO VIÊN BẢN GẤU (PROMPT 11)
 * Kiểm tra đầy đủ: StaffShell, SideNav 196px, ClassSwitcher, 4 KPIs, Khối "Việc cần cô xem",
 * Card tạo lớp nét đứt, Tab "Kết quả", AssignmentResultsView (4 KPIs, biểu đồ bậc, AssistantCard p8_class_insight),
 * EmptyState thay thế emoji 📝, BearMascot.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

console.log('🧪 BẮT ĐẦU KIỂM THỬ CHẶNG 3 (PROMPT 11 · CỔNG GIÁO VIÊN BẢN GẤU)...');

// Đợt 15: một phần cổng giáo viên tách sang src/teacher/*.jsx
const teacherPortalContent = ['src/TeacherPortal.jsx', 'src/teacher/parts.jsx'].map((f) => { try { return readFileSync(resolve(root, f), 'utf8') } catch (e) { return '' } }).join('\n');
const staffIndexContent = readFileSync(resolve(root, 'src/ui/staff/index.jsx'), 'utf8');

// --- 1. Kiểm tra Bộ linh kiện dùng chung Staff Bản Gấu (src/ui/staff/) ---
console.log('\n--- 1. Bộ linh kiện dùng chung Staff Bản Gấu ---');
assert(staffIndexContent.includes('export function StaffShell'), 'StaffShell được định nghĩa trong src/ui/staff');
assert(staffIndexContent.includes('export function SideNav'), 'SideNav được định nghĩa trong src/ui/staff');
assert(staffIndexContent.includes('export function ClassSwitcher'), 'ClassSwitcher được định nghĩa trong src/ui/staff');
assert(staffIndexContent.includes('export function Card'), 'Card được định nghĩa trong src/ui/staff');
assert(staffIndexContent.includes('export function Kpi'), 'Kpi được định nghĩa trong src/ui/staff');
assert(/export (function|const) Button/.test(staffIndexContent), 'Button được định nghĩa trong src/ui/staff');
assert(staffIndexContent.includes('export function StatusPill'), 'StatusPill được định nghĩa trong src/ui/staff');
assert(staffIndexContent.includes('export function EmptyState'), 'EmptyState được định nghĩa trong src/ui/staff');
assert(staffIndexContent.includes('export function AssistantCard'), 'AssistantCard được định nghĩa trong src/ui/staff');
assert(staffIndexContent.includes('export function BearMascot'), 'BearMascot được định nghĩa trong src/ui/staff');

// --- 2. Khung trang StaffShell & SideNav 196px trên desktop / 5 tab trên mobile ---
console.log('\n--- 2. Khung trang StaffShell & Thanh điều hướng ---');
assert(teacherPortalContent.includes('<StaffShell'), 'TeacherPortal sử dụng StaffShell làm layout chuẩn');
assert(staffIndexContent.includes('<SideNav'), 'StaffShell nhúng SideNav cho giao diện desktop >= 1024px');
assert(staffIndexContent.includes('ClassSwitcher') && staffIndexContent.includes('<ClassSwitcher'), 'SideNav nhúng ClassSwitcher chọn lớp đang xem');
assert(staffIndexContent.includes('220') || staffIndexContent.includes('196px'), 'SideNav có độ rộng chuẩn (đợt 15: 220px)');
assert(staffIndexContent.includes('Lớp của cô') || teacherPortalContent.includes('Lớp của cô'), 'Có mục "Lớp của cô" trong điều hướng');
assert(teacherPortalContent.includes("label: 'Bài tập'"), 'Có mục "Bài tập" (đợt 15 rút gọn nhãn)');
assert(teacherPortalContent.includes('Học sinh'), 'Có mục "Học sinh"');
assert(teacherPortalContent.includes("label: 'Thông báo'"), 'Có mục "Thông báo" (đợt 15 rút gọn nhãn)');
assert(teacherPortalContent.includes('Kết quả'), 'Có mục "Kết quả"');
assert(teacherPortalContent.includes('Cài đặt của cô'), 'Có mục "Cài đặt của cô"');

// --- 3. Màn hình Lớp của cô: 4 KPIs, Việc cần cô xem, Thẻ nét đứt ---
console.log('\n--- 3. Màn hình Lớp của cô (/teacher) ---');
assert(teacherPortalContent.includes('Việc cần cô xem'), 'Có khối "Việc cần cô xem" cảnh báo học sinh chờ duyệt & bài nháp');
assert(teacherPortalContent.includes('classes.length') || teacherPortalContent.includes('Tổng số lớp'), 'Có số liệu tổng số lớp');
assert(teacherPortalContent.includes('totalStudents') || teacherPortalContent.includes('Tổng số học sinh'), 'Có số liệu tổng số học sinh');
assert(teacherPortalContent.includes('totalActiveAssignments') || teacherPortalContent.includes('Bài tập đang mở'), 'Có số liệu bài tập đang mở');
assert(teacherPortalContent.includes('totalPendingStudents') || teacherPortalContent.includes('Học sinh chờ duyệt'), 'Có số liệu học sinh chờ duyệt');
assert(teacherPortalContent.includes('borderStyle: \'dashed\'') || teacherPortalContent.includes('border: \'2px dashed'), 'Có ô tạo lớp nét đứt chuẩn bản vẽ');

// --- 4. Chi tiết lớp: 5 Tab & Tab "Kết quả" ---
console.log('\n--- 4. Màn chi tiết lớp: 5 Tabs & Tab Kết quả ---');
assert(teacherPortalContent.includes('function TeacherResultsTab'), 'Component TeacherResultsTab đã được định nghĩa');
assert(teacherPortalContent.includes('tab === \'results\' &&'), 'TeacherClassDetail render tab results');
assert(teacherPortalContent.includes('TeacherResultsTab'), 'TeacherClassDetail kết nối component TeacherResultsTab');

// --- 5. Màn Xem kết quả làm bài: 4 KPIs, Biểu đồ bậc, Thẻ trợ lý Gấu ---
console.log('\n--- 5. Màn Xem kết quả làm bài & Phân tích sư phạm AI ---');
// Đợt 15: KPI kết quả theo dữ liệu thật, trợ lý gấu tính từ số liệu lớp (không gọi AI viết cứng)
assert(teacherPortalContent.includes('label="Hoàn thành"'), 'Có KPI Hoàn thành');
assert(teacherPortalContent.includes('label="Tự làm được"'), 'Có KPI Tự làm được');
assert(teacherPortalContent.includes('label="Cần gợi ý"'), 'Có KPI Cần gợi ý');
assert(teacherPortalContent.includes('Bậc hay vướng'), 'Có biểu đồ Bậc hay vướng');
assert(teacherPortalContent.includes('BearAssistant'), 'Có thẻ trợ lý gấu');
assert(teacherPortalContent.includes('buildAssistantTips'), 'Gợi ý trợ lý tính từ số liệu thật');
assert(teacherPortalContent.includes('StepChart'), 'Có StepChart');
assert(teacherPortalContent.includes('KpiCard'), 'Dùng KpiCard chuẩn bộ quy chuẩn');
assert(teacherPortalContent.includes('<StatusPill'), 'Sử dụng StatusPill chuẩn Staff Bản Gấu');

// --- 6. Màn trống, Đang tải, và BearMascot ---
console.log('\n--- 6. Chuẩn hoá EmptyState và Mascot ---');
assert(!teacherPortalContent.includes('styles.emptyCard'), 'Không còn sử dụng styles.emptyCard cũ');
assert(teacherPortalContent.includes('<EmptyState'), 'Sử dụng EmptyState chuẩn bản Gấu');
assert(teacherPortalContent.includes('<BearMascot mood="welcome"'), 'Sử dụng BearMascot chào mừng tại màn đăng nhập/đăng ký');
assert(teacherPortalContent.includes('<BearMascot mood="remind"'), 'Sử dụng BearMascot tại trạng thái chờ duyệt/bị từ chối');

console.log('\n============================================================');
console.log('🏁 TỔNG KẾT CHẶNG 3: TẤT CẢ KIỂM THỬ ĐÃ VƯỢT QUA 100%!');
console.log('============================================================');
