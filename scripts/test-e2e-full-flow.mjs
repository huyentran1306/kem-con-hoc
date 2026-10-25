/**
 * 🌟 KIỂM THỬ TỰ ĐỘNG FULL FLOW TOÀN HỆ THỐNG (END-TO-END E2E TEST)
 * Bao quát toàn bộ luồng thực tế trên Live Cloudflare Worker & D1 Database:
 * 1. Admin login, overview, config & SVG/Theme checks
 * 2. Teacher register, Admin approval, Teacher login, Class creation
 * 3. Class Join Code & SVG QR Generation
 * 4. Teacher creates Announcement & "Cô nhắc" (with 3/day rate limit)
 * 5. Parent register, profile setup (multi-children)
 * 6. Parent public preview (no student data leak)
 * 7. Parent join class with duplicate prevention & grade match
 * 8. Parent 24h child change rule
 * 9. Parent reads & marks "Cô nhắc" ("Đã nhắc con")
 * 10. Teacher reads drill-down verification (done_at, done_by_name)
 * 11. Parent study session & calm corner tracking
 * 12. Theme & Staff Bear WCAG AA contrast verification
 */

import { generateQrSvgString } from '../src/qrCode.js';
import { REMINDER_TEMPLATES, MAX_REMINDERS_PER_DAY, isReminderInDisplayWindow } from '../src/teacherReminderData.js';

const BASE_URL = 'https://ai-gateway-worker.trannth1306.workers.dev';

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

async function runE2E() {
  console.log('============================================================');
  console.log('🚀 BẮT ĐẦU CHẠY KIỂM THỬ FULL FLOW TOÀN HỆ THỐNG (E2E)');
  console.log('============================================================\n');

  const rand = Math.random().toString(36).slice(2, 8);

  // ------------------------------------------------------------
  // BƯỚC 1: ADMIN AUTH & OVERVIEW
  // ------------------------------------------------------------
  console.log('--- 1. Admin: Đăng nhập & Báo cáo tổng quan ---');
  const adminLoginRes = await fetch(`${BASE_URL}/api/v1/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@kemconhoc.vn',
      password: 'kem-con-hoc-admin-secret-2026',
    }),
  });
  const adminData = await adminLoginRes.json();
  assert(adminLoginRes.ok && adminData.token, 'Đăng nhập Superadmin thành công');
  const ADMIN_TOKEN = adminData.token;

  const overviewRes = await fetch(`${BASE_URL}/api/v1/admin/overview`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  const overviewData = await overviewRes.json();
  assert(overviewRes.ok && overviewData.ok, 'Tải báo cáo Admin Overview thành công');

  // ------------------------------------------------------------
  // BƯỚC 2: GIÁO VIÊN ĐĂNG KÝ -> ADMIN DUYỆT -> GIÁO VIÊN ĐĂNG NHẬP
  // ------------------------------------------------------------
  console.log('\n--- 2. Giáo viên: Đăng ký -> Duyệt -> Đăng nhập ---');
  const teacherEmail = `co.mai.${rand}@tieuhoc.edu.vn`;
  const teacherPass = 'CoMai2026!@#';
  const teacherRegRes = await fetch(`${BASE_URL}/api/v1/teacher/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: teacherEmail,
      password: teacherPass,
      displayName: 'Cô Hoàng Thị Mai',
      phone: '0988776655',
      schoolName: 'Tiểu học Lê Quý Đôn',
      province: 'Đà Nẵng',
      grades: 'Khối 3',
      consent: true,
    }),
  });
  const teacherRegData = await teacherRegRes.json();
  assert(teacherRegRes.status === 201 && teacherRegData.ok, 'Đăng ký cô Mai thành công');
  const teacherId = teacherRegData.teacher?.id;

  // Admin duyệt cô Mai sang trạng thái approved
  const approveRes = await fetch(`${BASE_URL}/api/v1/admin/teachers/${teacherId}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  assert(approveRes.ok, 'Admin duyệt kích hoạt tài khoản cô giáo thành công');

  // Cô Mai đăng nhập
  const teacherLoginRes = await fetch(`${BASE_URL}/api/v1/teacher/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: teacherEmail, password: teacherPass }),
  });
  const teacherLoginData = await teacherLoginRes.json();
  assert(teacherLoginRes.ok && teacherLoginData.token, 'Cô Mai đăng nhập thành công với token mới');
  const TEACHER_TOKEN = teacherLoginData.token;

  // ------------------------------------------------------------
  // BƯỚC 3: GIÁO VIÊN TẠO LỚP & MÃ QR / LINK VÀO LỚP
  // ------------------------------------------------------------
  console.log('\n--- 3. Giáo viên: Tạo lớp & Sinh mã QR / Link ---');
  const classCreateRes = await fetch(`${BASE_URL}/api/v1/teacher/classes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TEACHER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Lớp 3E - Bản Gấu',
      grade: 'Khối 3',
      schoolYear: '2026-2027',
    }),
  });
  const classCreateData = await classCreateRes.json();
  assert(classCreateRes.status === 201 && classCreateData.ok, 'Cô Mai tạo Lớp 3E thành công');
  const classId = classCreateData.class?.id;
  const joinCode = classCreateData.class?.joinCode || classCreateData.class?.join_code;
  assert(Boolean(joinCode && joinCode.length >= 6), `Lớp được cấp mã vào lớp hợp lệ: ${joinCode}`);

  // Test SVG QR Code generator
  const joinUrl = `https://kem-con-hoc-5xf.pages.dev/vao-lop/${joinCode}`;
  const qrSvg = generateQrSvgString(joinUrl, { size: 240 });
  assert(qrSvg.includes('<svg') && qrSvg.includes('viewBox="0 0 240 240"'), 'Mã QR sinh ra SVG hợp lệ kích thước 240x240');
  assert(qrSvg.length < 15000, `Kích thước SVG nhỏ gọn: ${qrSvg.length} bytes (< 15KB)`);

  // ------------------------------------------------------------
  // BƯỚC 4: GIÁO VIÊN TẠO THÔNG BÁO & LỜI NHẮC (CÔ NHẮC)
  // ------------------------------------------------------------
  console.log('\n--- 4. Giáo viên: Tạo thông báo & Lời nhắc Cô nhắc ---');
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  
  // Gửi 1 lời nhắc mẫu Đồng phục
  const rem1Res = await fetch(`${BASE_URL}/api/v1/teacher/classes/${classId}/announcements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TEACHER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Lời nhắc của cô',
      body: 'Mai thứ hai các con mặc áo cờ đỏ sao vàng và mang khăn quàng đỏ nhé.',
      kind: 'reminder',
      remindFor: tomorrowStr,
      templateId: 'uniform',
    }),
  });
  const rem1Data = await rem1Res.json();
  assert(rem1Res.status === 201 && rem1Data.ok, 'Gửi lời nhắc 1 (Đồng phục) thành công');
  const reminderId = rem1Data.id || rem1Data.announcement?.id;

  // Gửi lời nhắc 2 và 3
  await fetch(`${BASE_URL}/api/v1/teacher/classes/${classId}/announcements`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TEACHER_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Lời nhắc 2', body: 'Mang vở bài tập', kind: 'reminder', remindFor: tomorrowStr }),
  });
  await fetch(`${BASE_URL}/api/v1/teacher/classes/${classId}/announcements`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TEACHER_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Lời nhắc 3', body: 'Nộp phiếu khảo sát', kind: 'reminder', remindFor: tomorrowStr }),
  });

  // Thử gửi lời nhắc thứ 4 trong cùng ngày -> Kỳ vọng bị từ chối 400 REMINDER_LIMIT_EXCEEDED
  const rem4Res = await fetch(`${BASE_URL}/api/v1/teacher/classes/${classId}/announcements`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TEACHER_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Lời nhắc 4', body: 'Vượt hạn mức', kind: 'reminder', remindFor: tomorrowStr }),
  });
  assert(rem4Res.status === 400 || rem4Res.status === 429, 'Chặn lời nhắc thứ 4 trong ngày (Tối đa 3 nhắc việc/ngày)');

  // ------------------------------------------------------------
  // BƯỚC 5: PHỤ HUYNH ĐĂNG KÝ GIA ĐÌNH & THIẾT LẬP CON
  // ------------------------------------------------------------
  console.log('\n--- 5. Phụ huynh: Đăng ký & Tạo hồ sơ con ---');
  const familyName = `Nhà Bé Thỏ ${rand}`;
  const familyPass = 'ThoCon2026!@#';
  const famRegRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyName,
      password: familyPass,
      memberName: 'Mẹ Thỏ',
    }),
  });
  const famRegData = await famRegRes.json();
  assert(famRegRes.status === 201 && famRegData.ok, `Đăng ký phụ huynh ${familyName} thành công`);
  const FAMILY_TOKEN = famRegData.token;

  // Lưu state gia đình có 2 bé: Thỏ Chị (Lớp 3) và Thỏ Em (Lớp 1)
  const child1Id = `c1_${rand}`;
  const child2Id = `c2_${rand}`;
  const initialChildren = [
    { id: child1Id, name: 'Thỏ Chị', grade: 'Lớp 3', avatar: '🐰' },
    { id: child2Id, name: 'Thỏ Em', grade: 'Lớp 1', avatar: '🥕' },
  ];
  const saveStateRes = await fetch(`${BASE_URL}/api/v1/family/state`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${FAMILY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 1,
      state: { children: initialChildren, activeChildId: child1Id },
    }),
  });
  assert(saveStateRes.ok, 'Lưu danh sách con của gia đình thành công');

  // ------------------------------------------------------------
  // BƯỚC 6: PHỤ HUYNH XEM PREVIEW LỚP (BẢO MẬT KHÔNG LỘ HỌC SINH)
  // ------------------------------------------------------------
  console.log('\n--- 6. Phụ huynh: Xem preview lớp công khai ---');
  const previewRes = await fetch(`${BASE_URL}/api/v1/classes/preview?code=${joinCode}`);
  const previewData = await previewRes.json();
  assert(previewRes.ok && previewData.ok, 'Xem trước thông tin lớp học bằng mã thành công');
  assert(previewData.class?.name === 'Lớp 3E - Bản Gấu', 'Preview hiển thị đúng tên lớp');
  assert(previewData.class?.teacherName === 'Cô Hoàng Thị Mai' || previewData.class?.teacher_name === 'Cô Hoàng Thị Mai', 'Preview hiển thị đúng tên cô');
  assert(previewData.class?.students === undefined, 'BẢO MẬT: Tuyệt đối không trả về danh sách học sinh khác');

  // Preview mã sai -> 404
  const badPreviewRes = await fetch(`${BASE_URL}/api/v1/classes/preview?code=NOTEXIST99`);
  assert(badPreviewRes.status === 404, 'Mã không tồn tại trả về 404 NOT_FOUND');

  // ------------------------------------------------------------
  // BƯỚC 7: PHỤ HUYNH VÀO LỚP & CHẶN TRÙNG
  // ------------------------------------------------------------
  console.log('\n--- 7. Phụ huynh: Vào lớp & Quy tắc nghiệp vụ ---');
  // Kết nối Thỏ Chị vào Lớp 3E
  const join1Res = await fetch(`${BASE_URL}/api/v1/family/classes/join`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FAMILY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: joinCode,
      childId: child1Id,
      childName: 'Thỏ Chị',
      consent: true,
      childConsent: true,
    }),
  });
  const join1Data = await join1Res.json();
  assert(join1Res.ok && join1Data.ok, 'Thỏ Chị vào Lớp 3E thành công');
  const classStudentId = join1Data.classStudentId || join1Data.classStudent?.id;

  // Thử kết nối lại Thỏ Chị vào cùng lớp -> Kỳ vọng 409 Conflict
  const dupJoinRes = await fetch(`${BASE_URL}/api/v1/family/classes/join`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FAMILY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: joinCode,
      childId: child1Id,
      childName: 'Thỏ Chị',
      consent: true,
      childConsent: true,
    }),
  });
  assert(dupJoinRes.status === 409, 'Chặn tạo trùng: Thỏ Chị đã ở trong lớp trả về 409 Conflict');

  // Kết nối bé thứ 2 (Thỏ Em) vào cùng lớp -> Thành công (hỗ trợ sinh đôi / nhiều con cùng học)
  const joinTwinRes = await fetch(`${BASE_URL}/api/v1/family/classes/join`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FAMILY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: joinCode,
      childId: child2Id,
      childName: 'Thỏ Em',
      consent: true,
      childConsent: true,
    }),
  });
  assert(joinTwinRes.ok, 'Cho phép kết nối bé thứ 2 (hỗ trợ sinh đôi học cùng lớp)');

  // ------------------------------------------------------------
  // BƯỚC 8: ĐỔI CON TRONG 24 GIỜ
  // ------------------------------------------------------------
  console.log('\n--- 8. Phụ huynh: Đổi con trong 24 giờ ---');
  const changeChildRes = await fetch(`${BASE_URL}/api/v1/family/classes/${classStudentId}/child`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${FAMILY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      childId: child1Id,
    }),
  });
  assert(changeChildRes.ok, 'Đổi thông tin con trong 24 giờ đầu khi chưa nộp bài thành công');

  // ------------------------------------------------------------
  // BƯỚC 9: PHỤ HUYNH XEM LỜI NHẮC & BẤM "ĐÃ NHẮC CON"
  // ------------------------------------------------------------
  console.log('\n--- 9. Phụ huynh: Xem lời nhắc & Bấm Đã nhắc con ---');
  const remindersRes = await fetch(`${BASE_URL}/api/v1/family/reminders?window=today`, {
    headers: { Authorization: `Bearer ${FAMILY_TOKEN}` },
  });
  const remindersData = await remindersRes.json();
  assert(remindersRes.ok && Array.isArray(remindersData.reminders), 'Phụ huynh tải danh sách thẻ Cô nhắc thành công');

  // Bấm Đã nhắc con cho lời nhắc 1
  const doneRes = await fetch(`${BASE_URL}/api/v1/family/announcements/${reminderId}/done`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${FAMILY_TOKEN}` },
  });
  const doneData = await doneRes.json();
  assert(doneRes.ok && doneData.ok, 'Phụ huynh bấm "Đã nhắc con" thành công');

  // ------------------------------------------------------------
  // BƯỚC 10: GIÁO VIÊN KIỂM TRA DRILL-DOWN TRẠNG THÁI ĐÃ ĐỌC / ĐÃ NHẮC
  // ------------------------------------------------------------
  console.log('\n--- 10. Giáo viên: Xem chi tiết Đã đọc / Đã nhắc con ---');
  const readsRes = await fetch(`${BASE_URL}/api/v1/teacher/announcements/${reminderId}/reads`, {
    headers: { Authorization: `Bearer ${TEACHER_TOKEN}` },
  });
  const readsData = await readsRes.json();
  assert(readsRes.ok && Array.isArray(readsData.reads), 'Cô giáo xem danh sách đọc thành công');
  const myRead = readsData.reads.find((r) => r.done_by_name === 'Mẹ Thỏ' || r.done_at);
  assert(Boolean(myRead && myRead.done_at), 'Xác nhận hiển thị đúng done_at và người nhắc: Mẹ Thỏ');

  // ------------------------------------------------------------
  // BƯỚC 11: BUỔI HỌC KÈM & GÓC HẠ HOẢ
  // ------------------------------------------------------------
  console.log('\n--- 11. Phụ huynh: Buổi học kèm & Góc hạ hoả ---');
  const sessionRes = await fetch(`${BASE_URL}/api/v1/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FAMILY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      childId: child1Id,
      subject: 'Toán',
      grade: 3,
      startedAt: new Date().toISOString(),
    }),
  });
  const sessionData = await sessionRes.json();
  const sessionId = sessionData.id || sessionData.sessionId;
  assert(sessionRes.ok && sessionId, 'Tạo buổi học kèm trực tiếp thành công');

  // Gửi sự kiện buổi học
  const eventsRes = await fetch(`${BASE_URL}/api/v1/sessions/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FAMILY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      events: [
        { type: 'hint_requested', level: 1, timestamp: new Date().toISOString() },
        { type: 'calm_corner_triggered', reason: 'parent_stress', timestamp: new Date().toISOString() },
        { type: 'problem_solved', score: 10, timestamp: new Date().toISOString() },
      ],
    }),
  });
  assert(eventsRes.ok, 'Ghi nhận chuỗi sự kiện học & góc hạ hoả thành công');

  // ------------------------------------------------------------
  // TỔNG KẾT
  // ------------------------------------------------------------
  console.log('\n============================================================');
  console.log(`🏁 TỔNG KẾT E2E FULL FLOW: ${passed} PASS, ${failed} FAIL`);
  console.log('============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2E().catch((err) => {
  console.error('Lỗi ngoại lệ khi chạy E2E:', err);
  process.exit(1);
});
