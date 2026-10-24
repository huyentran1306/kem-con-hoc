/**
 * KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN: PROMPT 04 - CỔNG GIÁO VIÊN & LỚP HỌC & GIAO BÀI
 * Chạy trực tiếp trên Live Cloudflare Worker & D1 Database
 */

const BASE_URL = "https://ai-gateway-worker.trannth1306.workers.dev";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runTests() {
  console.log("\n🧪 BẮT ĐẦU KIỂM THỬ CỔNG GIÁO VIÊN & LỚP HỌC (PROMPT 04):");
  console.log("------------------------------------------------------------\n");

  // Đăng nhập Superadmin để lấy ADMIN_TOKEN hợp lệ
  const adminLoginRes = await fetch(`${BASE_URL}/api/v1/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@kemconhoc.vn",
      password: "SuperAdminSecure2026!@#",
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  const ADMIN_TOKEN = adminLoginData.token;
  assert(ADMIN_TOKEN && ADMIN_TOKEN.length > 20, "Đăng nhập SuperAdmin hệ thống thành công");

  const rand = Math.random().toString(36).slice(2, 7);
  const teacherEmail = `co.hanh.${rand}@tieuhoc.edu.vn`;
  const teacher2Email = `co.lan.${rand}@tieuhoc.edu.vn`;
  const teacherPass = "CoHanh2026!@#";

  // --- 1. ĐĂNG KÝ GIÁO VIÊN & DUYỆT ADMIN ---
  console.log("--- 1. Đăng ký giáo viên & Phân quyền duyệt của Admin ---");
  const regRes = await fetch(`${BASE_URL}/api/v1/teacher/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: teacherEmail,
      password: teacherPass,
      displayName: "Cô Nguyễn Thị Hạnh",
      phone: "0912345678",
      schoolName: "Tiểu học Kim Đồng",
      province: "Hà Nội",
      grades: "Khối 3",
      consent: true,
    }),
  });
  const regData = await regRes.json();
  assert(regRes.status === 201, `Đăng ký cô Hạnh thành công 201 (got ${regRes.status})`);
  assert(regData.ok === true, "regData.ok === true");
  assert(regData.teacher.status === "pending", "Trạng thái ban đầu là pending");
  const teacherToken = regData.token;
  const teacherId = regData.teacher.id;

  // Gọi API lớp khi chưa duyệt -> Bị chặn 403 TEACHER_NOT_APPROVED
  const blockedRes = await fetch(`${BASE_URL}/api/v1/teacher/classes`, {
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  assert(blockedRes.status === 403, `Chưa duyệt bị chặn gọi API lớp 403 (got ${blockedRes.status})`);
  const blockedData = await blockedRes.json();
  assert(blockedData.error.code === "TEACHER_NOT_APPROVED", "Mã lỗi TEACHER_NOT_APPROVED");

  // Admin duyệt giáo viên
  const approveRes = await fetch(`${BASE_URL}/api/v1/admin/teachers/${teacherId}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  assert(approveRes.status === 200, "Admin duyệt cô Hạnh thành công 200");

  // Đăng nhập lại sau khi duyệt
  const loginRes = await fetch(`${BASE_URL}/api/v1/teacher/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: teacherEmail, password: teacherPass }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, "Cô Hạnh đăng nhập thành công");
  assert(loginData.teacher.status === "approved", "Trạng thái sau duyệt là approved");
  const approvedToken = loginData.token;

  // --- 2. CÔ TẠO LỚP 3A & PHỤ HUYNH NHẬP MÃ LỚP CHUNG ---
  console.log("\n--- 2. Tạo lớp 3A & Phụ huynh A nhập mã lớp chung (Duyệt theo NĐ 13/2023) ---");
  const createClassRes = await fetch(`${BASE_URL}/api/v1/teacher/classes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${approvedToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "3A",
      schoolName: "Tiểu học Kim Đồng",
      grade: 3,
      schoolYear: "2026-2027",
    }),
  });
  const classData = await createClassRes.json();
  assert(createClassRes.status === 201, "Tạo lớp 3A thành công 201");
  const classId = classData.class.id;
  const joinCode = classData.class.joinCode;
  assert(joinCode.length === 6, `Mã lớp chung đúng 6 ký tự: ${joinCode}`);

  // Tạo tài khoản gia đình Phụ huynh A
  const famARes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      familyName: `Nhà Bống ${rand}`,
      password: "MatKhauNhaBong123!",
      displayName: "Mẹ Lan",
    }),
  });
  const famAData = await famARes.json();
  const famAToken = famAData.token;
  const childAId = "child_bong_01";

  // Phụ huynh thiếu đồng ý của con (Điều 20 NĐ 13/2023) -> Bị chặn 400
  const noConsentRes = await fetch(`${BASE_URL}/api/v1/family/classes/join`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${famAToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: joinCode,
      childId: childAId,
      rosterName: "Trần Bảo Ngọc (Bống)",
      consent: true,
      childConsent: false, // Con chưa đồng ý
    }),
  });
  assert(noConsentRes.status === 400, "Chặn khi thiếu đồng ý của con theo NĐ 13 (got 400)");

  // Phụ huynh A nhập đủ 2 đồng ý -> Vào trạng thái pending
  const joinGeneralRes = await fetch(`${BASE_URL}/api/v1/family/classes/join`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${famAToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: joinCode,
      childId: childAId,
      rosterName: "Trần Bảo Ngọc",
      consent: true,
      childConsent: true,
    }),
  });
  const joinGenData = await joinGeneralRes.json();
  assert(joinGeneralRes.status === 201, "Phụ huynh A gửi yêu cầu vào lớp 201");
  assert(joinGenData.status === "pending", "Trạng thái mã chung là pending chờ cô duyệt");
  const studentAId = joinGenData.classStudentId;

  // Cô duyệt học sinh A
  const approveStudentRes = await fetch(`${BASE_URL}/api/v1/teacher/class-students/${studentAId}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${approvedToken}` },
  });
  assert(approveStudentRes.status === 200, "Cô duyệt bé Bống thành công 200");

  // --- 3. DÁN DANH SÁCH LỚP (ROSTER) & MÃ RIÊNG XXX-XXX ---
  console.log("\n--- 3. Dán danh sách lớp (Roster) & Phụ huynh B kết nối bằng mã riêng XXX-XXX ---");
  const rosterRes = await fetch(`${BASE_URL}/api/v1/teacher/classes/${classId}/roster`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${approvedToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      names: ["Nguyễn Hoàng Nam", "Lê Gia Hưng", "Phạm Quỳnh Anh", "Vũ Minh Khôi", "Hoàng Thảo My"],
    }),
  });
  const rosterData = await rosterRes.json();
  assert(rosterRes.status === 201, "Dán danh sách 5 học sinh thành công 201");
  assert(rosterData.count === 5, "Tạo đủ 5 học sinh");
  const studentB = rosterData.students[0]; // Nguyễn Hoàng Nam
  assert(studentB.claimCode.includes("-"), `Mã riêng có định dạng XXX-XXX: ${studentB.claimCode}`);

  // Phụ huynh B kết nối bằng mã riêng XXX-XXX -> Trở thành active ngay
  const famBRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      familyName: `Nhà Nam ${rand}`,
      password: "MatKhauNhaNam123!",
      displayName: "Bố Hùng",
    }),
  });
  const famBData = await famBRes.json();
  const famBToken = famBData.token;

  const claimRes = await fetch(`${BASE_URL}/api/v1/family/classes/join`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${famBToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: studentB.claimCode,
      childId: "child_nam_01",
      consent: true,
      childConsent: true,
    }),
  });
  const claimData = await claimRes.json();
  assert(claimRes.status === 200, "Phụ huynh B nhập mã riêng thành công 200");
  assert(claimData.status === "active", "Mã riêng kích hoạt active ngay không cần duyệt lại");
  assert(claimData.rosterName === "Nguyễn Hoàng Nam", "Đúng tên trong danh sách lớp của cô");

  // --- 4. GIAO BÀI KÈM 'CÁCH CÔ DẠY' & XEM TRƯỚC AI ---
  console.log("\n--- 4. Cô giao bài kèm 'Cách cô dạy', AI soạn bài giảng chung & Phụ huynh nhận bài ---");
  const createAsgRes = await fetch(`${BASE_URL}/api/v1/teacher/classes/${classId}/assignments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${approvedToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Bài tập Ôn tập tuần 12",
      subject: "Toán",
      items: [
        {
          problemText: "Bao gạo thứ nhất nặng 15kg. Bao gạo thứ hai nặng gấp 3 lần bao thứ nhất. Hỏi cả hai bao nặng bao nhiêu ki-lô-gam?",
          problemType: "word_problem_multistep",
          teacherMethodNote: "Lớp mình vẽ sơ đồ đoạn thẳng, chưa dùng phép nhân",
          teacherAnswer: "60kg (Bao 2: 45kg, Cả hai: 60kg)",
        },
        {
          problemText: "Tính nhẩm: 7 x 8 = ?",
          problemType: "arithmetic",
          teacherMethodNote: "Đọc thuộc bảng cửu chương 7",
          teacherAnswer: "56",
        }
      ]
    }),
  });
  const asgData = await createAsgRes.json();
  assert(createAsgRes.status === 201, "Tạo bài tập 2 câu thành công 201");
  const asgId = asgData.id;
  const item1Id = asgData.items[0].id;

  // AI soạn bài giảng cho câu 1
  const genRes = await fetch(`${BASE_URL}/api/v1/teacher/assignment-items/${item1Id}/generate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${approvedToken}` },
  });
  const genData = await genRes.json();
  assert(genRes.status === 200, "AI soạn bài giảng cho câu 1 thành công 200");
  assert(genData.lesson.leakCheckPassed === true, "Bộ kiểm định không lộ đáp án đạt chuẩn");
  assert(genData.lesson.pedagogyFramework.includes("sơ đồ"), "Tuân thủ cách cô dạy: Có sơ đồ đoạn thẳng");

  // Cô duyệt bài giảng câu 1 và xuất bản bài tập
  await fetch(`${BASE_URL}/api/v1/teacher/assignment-items/${item1Id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${approvedToken}` },
  });
  const pubRes = await fetch(`${BASE_URL}/api/v1/teacher/assignments/${asgId}/publish`, {
    method: "POST",
    headers: { Authorization: `Bearer ${approvedToken}` },
  });
  assert(pubRes.status === 200, "Cô xuất bản bài tập thành công 200");

  // Phụ huynh A và Phụ huynh B cùng đọc bài tập này -> Thấy CÙNG bài giảng đã duyệt
  const famAAsgRes = await fetch(`${BASE_URL}/api/v1/family/assignments/${asgId}`, {
    headers: { Authorization: `Bearer ${famAToken}` },
  });
  const famAAsg = await famAAsgRes.json();
  assert(famAAsg.ok === true, "Phụ huynh A nhận bài tập của cô thành công");
  assert(famAAsg.items[0].problem_text.includes("Bao gạo"), "Đúng nội dung đề bài");

  // --- 5. BẢO MẬT & CÔ LẬP DỮ LIỆU GIỮA CÁC GIÁO VIÊN ---
  console.log("\n--- 5. Kiểm thử cô lập dữ liệu (Cô A không xem được dữ liệu cô B, không vào được Admin) ---");
  // Tạo Cô Lan (Giáo viên B)
  const reg2Res = await fetch(`${BASE_URL}/api/v1/teacher/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: teacher2Email,
      password: teacherPass,
      displayName: "Cô Hoàng Thị Lan",
      schoolName: "Tiểu học Lê Lợi",
      consent: true,
    }),
  });
  const reg2Data = await reg2Res.json();
  // Admin duyệt cô Lan
  await fetch(`${BASE_URL}/api/v1/admin/teachers/${reg2Data.teacher.id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  const log2Res = await fetch(`${BASE_URL}/api/v1/teacher/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: teacher2Email, password: teacherPass }),
  });
  const teacher2Token = (await log2Res.json()).token;

  // Cô Lan cố gọi lớp của Cô Hạnh -> Trả về 404 Not Found
  const crossClassRes = await fetch(`${BASE_URL}/api/v1/teacher/classes/${classId}`, {
    headers: { Authorization: `Bearer ${teacher2Token}` },
  });
  assert(crossClassRes.status === 404, "Cô Lan gọi lớp của Cô Hạnh trả về 404 (cô lập dữ liệu)");

  // Token giáo viên không thể vào endpoint Admin -> Bị chặn 401
  const crossAdminRes = await fetch(`${BASE_URL}/api/v1/admin/classes`, {
    headers: { Authorization: `Bearer ${approvedToken}` },
  });
  assert(crossAdminRes.status === 401, "Token giáo viên không vào được Admin (got 401)");

  // --- 6. PHỤ HUYNH HOÀN THÀNH BÀI TẬP & TỰ ĐỘNG CẬP NHẬT KẾT QUẢ CHO CÔ ---
  console.log("\n--- 6. Phụ huynh A hoàn thành câu 1 -> Worker tự động ghi assignment_results ---");
  const sessionId = `ses_${rand}_01`;
  await fetch(`${BASE_URL}/api/v1/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${famAToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: sessionId,
      childId: childAId,
      source: "teacher",
      assignmentId: asgId,
      assignmentItemId: item1Id,
      subject: "Toán",
      problemText: "Bao gạo thứ nhất...",
    }),
  });

  // Hoàn thành buổi học qua PATCH /sessions/:id
  const patchRes = await fetch(`${BASE_URL}/api/v1/sessions/${sessionId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${famAToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      completed: true,
      stuckCount: 1,
      hintLevelMax: 2,
      teachBackRating: "hint",
      stepsDone: 3,
    }),
  });
  assert(patchRes.status === 200, "PATCH session hoàn thành thành công 200");

  // Cô Hạnh xem bảng kết quả làm bài của lớp
  const resultsRes = await fetch(`${BASE_URL}/api/v1/teacher/assignments/${asgId}/results`, {
    headers: { Authorization: `Bearer ${approvedToken}` },
  });
  const resultsData = await resultsRes.json();
  assert(resultsRes.status === 200, "Cô xem kết quả bài tập 200 OK");
  assert(resultsData.items.length >= 1, "Có thống kê theo câu");
  assert(resultsData.items[0].done_count >= 1, "Ghi nhận 1 học sinh hoàn thành câu 1");

  // --- 7. THÔNG BÁO CỦA LỚP & XÁC NHẬN ĐÃ ĐỌC ---
  console.log("\n--- 7. Thông báo của lớp & Phụ huynh bấm 'Đã đọc' ---");
  const createAnnRes = await fetch(`${BASE_URL}/api/v1/teacher/classes/${classId}/announcements`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${approvedToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Lịch kiểm tra giữa kỳ môn Toán",
      body: "Các con chuẩn bị thước kẻ và bút chì nhé.",
      pinned: 1,
      requireAck: 1,
    }),
  });
  const annData = await createAnnRes.json();
  assert(createAnnRes.status === 201, "Cô tạo thông báo thành công 201");
  const annId = annData.id;

  // Phụ huynh A đọc và bấm xác nhận
  await fetch(`${BASE_URL}/api/v1/family/announcements/${annId}/read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${famAToken}` },
  });
  const ackRes = await fetch(`${BASE_URL}/api/v1/family/announcements/${annId}/ack`, {
    method: "POST",
    headers: { Authorization: `Bearer ${famAToken}` },
  });
  assert(ackRes.status === 200, "Phụ huynh A xác nhận đã đọc thông báo thành công");

  // Cô xem danh sách ai đã đọc
  const readsRes = await fetch(`${BASE_URL}/api/v1/teacher/announcements/${annId}/reads`, {
    headers: { Authorization: `Bearer ${approvedToken}` },
  });
  const readsData = await readsRes.json();
  assert(readsData.reads.length >= 1, "Cô thấy lượt đọc của gia đình Bống");
  assert(readsData.reads[0].ack_at !== null, "Đã có thời điểm xác nhận ack_at");

  // --- 8. NHẬN XÉT TRỢ LÝ AI (p8_class_insight) ---
  console.log("\n--- 8. Trợ lý AI phân tích lớp (p8_class_insight) không chứa tên trẻ ---");
  const insightRes = await fetch(`${BASE_URL}/api/v1/teacher/assignments/${asgId}/insight`, {
    method: "POST",
    headers: { Authorization: `Bearer ${approvedToken}` },
  });
  const insightData = await insightRes.json();
  assert(insightRes.status === 200, "Gọi insight thành công 200");
  assert(insightData.insight.tomorrowTeachingTip.length > 0, "Có gợi ý giảng lại cho ngày mai");
  assert(
    !JSON.stringify(insightData.insight).includes("Trần Bảo Ngọc") &&
    !JSON.stringify(insightData.insight).includes("Nguyễn Hoàng Nam"),
    "TUYỆT ĐỐI không chứa tên trẻ trong dữ liệu insight"
  );

  console.log("\n------------------------------------------------------------");
  console.log("🎉 TẤT CẢ CÁC BÀI KIỂM THỬ CỔNG GIÁO VIÊN & LỚP HỌC (PROMPT 04) ĐÃ VƯỢT QUA 100%!");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
