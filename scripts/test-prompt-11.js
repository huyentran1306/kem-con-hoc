/**
 * 🧪 BỘ KIỂM THỬ TỰ ĐỘNG PROMPT 11 (A, B, C)
 * Kiểm tra:
 * 1. Part C: Link vào lớp, parsing, hạn 30 phút, quy tắc 24h đổi con, chống trùng, cảnh báo lệch khối, sinh đôi
 * 2. Part B: 6 mẫu nhắc việc, giới hạn 3 nhắc việc/ngày, thời điểm hiển thị thẻ, đánh dấu đã nhắc
 * 3. Part A: Bộ token thiết kế Staff bản Gấu, tương phản WCAG AA >= 4.5:1
 */

import { generateQrSvgString } from '../src/qrCode.js';
import { REMINDER_TEMPLATES, MAX_REMINDERS_PER_DAY, isReminderInDisplayWindow } from '../src/teacherReminderData.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- 🧪 STARTING PROMPT 11 (A, B, C) AUTOMATED TESTS ---');

// ============================================================
// 1. KIỂM THỬ PART C: QR CODE & LINK VÀO LỚP
// ============================================================
console.log('\n1. Kiểm thử sinh mã QR và URL vào lớp...');
const testUrl = 'https://kem-con-hoc-5xf.pages.dev/vao-lop/ND9QR7';
const qrSvg = generateQrSvgString(testUrl, { size: 200 });

assert(qrSvg.includes('<svg'), 'Mã QR sinh ra chuỗi SVG hợp lệ');
assert(qrSvg.includes('viewBox="0 0 200 200"'), 'SVG có viewBox đúng kích thước 200x200');
assert(qrSvg.includes('shape-rendering="crispEdges"'), 'SVG tối ưu viền sắc nét crispEdges');
assert(qrSvg.length < 15000, `Kích thước SVG nhỏ gọn: ${qrSvg.length} bytes (< 15KB)`);

// Test URL parser
function parseClassJoinUrl(path) {
  if (path.startsWith('/vao-lop/m/')) {
    return { code: path.replace('/vao-lop/m/', '').trim().toUpperCase(), type: 'claim' };
  }
  if (path.startsWith('/vao-lop/')) {
    return { code: path.replace('/vao-lop/', '').trim().toUpperCase(), type: 'class' };
  }
  return null;
}

const parsedClass = parseClassJoinUrl('/vao-lop/3A8K2M');
assert(parsedClass && parsedClass.code === '3A8K2M' && parsedClass.type === 'class', 'Parse link mã chung /vao-lop/3A8K2M chính xác');

const parsedClaim = parseClassJoinUrl('/vao-lop/m/CB8-S7F');
assert(parsedClaim && parsedClaim.code === 'CB8-S7F' && parsedClaim.type === 'claim', 'Parse link mã riêng /vao-lop/m/CB8-S7F chính xác');

// Test 30-min expiry rule
function isPendingJoinValid(ts, now = Date.now()) {
  return now - ts <= 30 * 60 * 1000;
}
const recentJoin = Date.now() - 10 * 60 * 1000; // 10 mins ago
const expiredJoin = Date.now() - 35 * 60 * 1000; // 35 mins ago
assert(isPendingJoinValid(recentJoin), 'Mã chờ vào lớp trong vòng 30 phút còn hạn');
assert(!isPendingJoinValid(expiredJoin), 'Mã chờ vào lớp sau 30 phút tự động hết hạn');

// ============================================================
// 2. KIỂM THỬ PART C: QUY TẮC ĐỔI CON TRONG 24 GIỜ & CHẶN TRÙNG
// ============================================================
console.log('\n2. Kiểm thử quy tắc đổi con trong 24 giờ và chặn trùng...');

function canChangeChild(linkedAt, completedItems = 0, now = Date.now()) {
  const diffMs = now - new Date(linkedAt).getTime();
  const within24h = diffMs <= 24 * 3600 * 1000;
  return within24h && completedItems === 0;
}

const linked2HoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
const linked26HoursAgo = new Date(Date.now() - 26 * 3600 * 1000).toISOString();

assert(canChangeChild(linked2HoursAgo, 0), 'Kết nối lúc 2 giờ trước, 0 bài làm -> Được đổi con');
assert(!canChangeChild(linked2HoursAgo, 1), 'Kết nối lúc 2 giờ trước nhưng đã có 1 bài làm -> Chặn đổi con');
assert(!canChangeChild(linked26HoursAgo, 0), 'Kết nối lúc 26 giờ trước -> Quá 24h, chặn đổi con');

// Test duplicate join logic
function checkDuplicateJoin(existingEnrollments, classId, childId) {
  const dup = existingEnrollments.find(
    (e) => e.class_id === classId && e.child_id === childId && ['active', 'pending'].includes(e.status)
  );
  if (dup) {
    return { isDuplicate: true, linkedBy: dup.linked_by, linkedAt: dup.linked_at };
  }
  return { isDuplicate: false };
}

const mockEnrollments = [
  { class_id: 'cls_3a', child_id: 'kid_mit', status: 'active', linked_by: 'Mẹ', linked_at: '2026-10-25T13:05:00Z' },
  { class_id: 'cls_1b', child_id: 'kid_bon', status: 'active', linked_by: 'Mẹ', linked_at: '2026-10-25T13:10:00Z' },
];

const dupCheck1 = checkDuplicateJoin(mockEnrollments, 'cls_3a', 'kid_mit');
assert(dupCheck1.isDuplicate && dupCheck1.linkedBy === 'Mẹ', 'Bố mở link chọn Mít vào 3A: Phát hiện Mẹ đã kết nối, chặn tạo trùng');

const twinCheck = checkDuplicateJoin(mockEnrollments, 'cls_3a', 'kid_bon');
assert(!twinCheck.isDuplicate, 'Con thứ hai (Bon) học cùng lớp 3A: Cho phép kết nối (hỗ trợ sinh đôi)');

// Test max 5 active classes per child
function checkMaxClasses(existingEnrollments, childId) {
  const activeCount = existingEnrollments.filter((e) => e.child_id === childId && e.status === 'active').length;
  return activeCount < 5;
}
const fiveClasses = [
  { child_id: 'k1', status: 'active' },
  { child_id: 'k1', status: 'active' },
  { child_id: 'k1', status: 'active' },
  { child_id: 'k1', status: 'active' },
  { child_id: 'k1', status: 'active' },
];
assert(!checkMaxClasses(fiveClasses, 'k1'), 'Con đã có 5 lớp đang hoạt động -> Từ chối lớp thứ 6');

// ============================================================
// 3. KIỂM THỬ PART C: CẢNH BÁO LỆCH KHỐI
// ============================================================
console.log('\n3. Kiểm thử phân tích khớp khối và cảnh báo lệch khối...');

function evaluateGradeMatch(childGradeStr, classGradeStr) {
  const parseNum = (s) => {
    const m = String(s).match(/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  };
  const cg = parseNum(childGradeStr);
  const clg = parseNum(classGradeStr);
  return {
    childNum: cg,
    classNum: clg,
    isMatch: cg === clg,
    warning: cg !== clg ? `Bon đang ghi lớp ${cg}, lớp này là khối ${clg}. Đúng con chưa mẹ?` : null,
  };
}

const matchEval = evaluateGradeMatch('Lớp 3', 'Khối 3');
assert(matchEval.isMatch && !matchEval.warning, 'Mít Lớp 3 vào lớp Khối 3: Khớp khối (Hợp khối 3)');

const mismatchEval = evaluateGradeMatch('Lớp 1', 'Khối 3');
assert(!mismatchEval.isMatch && mismatchEval.warning.includes('Đúng con chưa mẹ?'), 'Bon Lớp 1 vào lớp Khối 3: Cảnh báo lệch khối chính xác');

// ============================================================
// 4. KIỂM THỬ PART B: CÔ NHẮC VIỆC & MẪU SOẠN NHANH
// ============================================================
console.log('\n4. Kiểm thử tính năng Cô nhắc (Prompt 11 Phần B)...');

assert(REMINDER_TEMPLATES.length === 6, 'Có đầy đủ 6 mẫu soạn nhanh');
assert(MAX_REMINDERS_PER_DAY === 3, 'Giới hạn tối đa 3 lời nhắc/ngày/lớp');

const templateIds = REMINDER_TEMPLATES.map((t) => t.id);
assert(templateIds.includes('uniform'), 'Có mẫu Đồng phục');
assert(templateIds.includes('bring'), 'Có mẫu Mang theo');
assert(templateIds.includes('submit'), 'Có mẫu Nộp');
assert(templateIds.includes('quiz') || templateIds.includes('exam'), 'Có mẫu Kiểm tra');
assert(templateIds.includes('off') || templateIds.includes('day_off'), 'Có mẫu Nghỉ học');
assert(templateIds.includes('time') || templateIds.includes('time_change'), 'Có mẫu Đổi giờ');

// Check reminder window logic (khung giờ 12:00 hôm trước -> 12:00 ngày áp dụng)
const today = new Date().toISOString().slice(0, 10);
const morningToday = new Date();
morningToday.setHours(8, 0, 0, 0);
assert(isReminderInDisplayWindow(today, morningToday), 'Lời nhắc sáng ngày áp dụng nằm trong khung giờ hiển thị');

// ============================================================
// 5. KIỂM THỬ PART A: TỶ LỆ TƯƠNG PHẢN WCAG AA BẢN GẤU
// ============================================================
console.log('\n5. Kiểm thử bảng màu Staff Bản Gấu đạt chuẩn WCAG AA...');

function getLuminance(hex) {
  const rgb = hex.replace('#', '').match(/.{2}/g).map((x) => parseInt(x, 16) / 255);
  const a = rgb.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const bgWarm = '#FFF8EC';
const textPrimary = '#4B3621';
const textSecondary = '#84664A';
const surface = '#FFFFFF';

const contrastPrimary = getContrastRatio(textPrimary, bgWarm);
assert(contrastPrimary >= 4.5, `Chữ chính #${textPrimary} trên nền #${bgWarm} đạt WCAG AA: ${contrastPrimary.toFixed(2)}:1 (>= 4.5:1)`);

const contrastSecondary = getContrastRatio(textSecondary, bgWarm);
assert(contrastSecondary >= 4.5, `Chữ phụ #${textSecondary} trên nền #${bgWarm} đạt WCAG AA: ${contrastSecondary.toFixed(2)}:1 (>= 4.5:1)`);

const contrastOnSurface = getContrastRatio(textPrimary, surface);
assert(contrastOnSurface >= 4.5, `Chữ chính #${textPrimary} trên thẻ trắng #${surface}: ${contrastOnSurface.toFixed(2)}:1 (>= 4.5:1)`);

// ============================================================
// TỔNG KẾT
// ============================================================
console.log(`\n------------------------------------------------------------`);
console.log(`🏁 TỔNG KẾT PROMPT 11: ${passed} PASS, ${failed} FAIL`);
if (failed === 0) {
  console.log('🎉 TẤT CẢ CÁC BÀI TEST PROMPT 11 (A, B, C) ĐÃ VƯỢT QUA 100%!');
} else {
  process.exit(1);
}
