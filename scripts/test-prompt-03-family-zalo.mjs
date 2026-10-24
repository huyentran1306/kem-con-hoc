/**
 * KIỂM THỬ TỰ ĐỘNG PROMPT 03: NHÓM GIA ĐÌNH & BÁO CÁO ZALO
 * Chạy: node scripts/test-prompt-03-family-zalo.mjs
 */

const API_BASE = 'https://ai-gateway-worker.trannth1306.workers.dev';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runTests() {
  console.log('\n🧪 BẮT ĐẦU KIỂM THỬ NHÓM GIA ĐÌNH & BÁO CÁO ZALO (PROMPT 03):');
  console.log('------------------------------------------------------------');

  const famSuffix = Math.random().toString(36).substring(2, 7);
  const testFamName = `Gia Đình Bắp ${famSuffix}`;
  const testPassword = 'Password_123456!';

  // --- 1. Tạo gia đình mẫu (Mẹ là Owner) ---
  console.log('\n--- 1. Khởi tạo gia đình mẫu (Mẹ là Chủ nhà / Owner) ---');
  const regRes = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyName: testFamName,
      password: testPassword,
      displayName: 'Mẹ Lan',
      relation: 'Mẹ',
    }),
  });
  assert(regRes.status === 201, 'Đăng ký chủ nhà Mẹ Lan thành công');
  const regData = await regRes.json();
  const momToken = regData.token;
  const momId = regData.member.id;
  assert(regData.member.role === 'owner', 'Mẹ Lan có vai trò owner (Chủ nhà)');

  // --- 2. Mẹ tạo mã mời cho Bố (vai trò Kèm con / guardian) ---
  console.log('\n--- 2. Mẹ tạo mã mời vai trò Kèm con (guardian) ---');
  const inviteRes = await fetch(`${API_BASE}/api/v1/family/invites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${momToken}`,
    },
    body: JSON.stringify({
      role: 'guardian',
      relationHint: 'Bố',
    }),
  });
  assert(inviteRes.status === 201, 'Tạo mã mời thành công 201');
  const inviteData = await inviteRes.json();
  const inviteCode = inviteData.invite.code;
  assert(inviteCode.length === 6, `Mã mời gồm đúng 6 ký tự: ${inviteCode}`);
  assert(!/[0O1I]/.test(inviteCode), 'Mã mời không chứa ký tự dễ nhầm lẫn (0, O, 1, I)');

  // --- 3. Đọc thông tin công khai của mã mời (Không cần auth) ---
  console.log('\n--- 3. Kiểm tra thông tin công khai mã mời (Không lộ dữ liệu trẻ) ---');
  const pubInvRes = await fetch(`${API_BASE}/api/v1/invites/${inviteCode}`);
  assert(pubInvRes.status === 200, 'Xem mã mời công khai 200 OK');
  const pubInvData = await pubInvRes.json();
  assert(pubInvData.valid === true, 'Mã mời hợp lệ');
  assert(pubInvData.familyName === testFamName, 'Trả về đúng tên gia đình');
  assert(pubInvData.role === 'guardian', 'Đúng vai trò mời');
  assert(!pubInvData.children && !pubInvData.childName, 'TUYỆT ĐỐI không lộ tên con');

  // --- 4. Bố chấp nhận mã mời (/join/:code/accept) và đặt PIN ---
  console.log('\n--- 4. Bố Tuấn nhập mã mời, đặt PIN 1234 và gia nhập nhà ---');
  const acceptRes = await fetch(`${API_BASE}/api/v1/invites/${inviteCode}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      displayName: 'Bố Tuấn',
      relation: 'Bố',
      pin: '1234',
    }),
  });
  assert(acceptRes.status === 201, 'Bố Tuấn gia nhập thành công 201');
  const acceptData = await acceptRes.json();
  const dadToken = acceptData.token;
  const dadId = acceptData.member.id;
  assert(acceptData.member.role === 'guardian', 'Bố Tuấn có vai trò guardian (Kèm con)');

  // Mã đã dùng không thể dùng lại lần 2
  const reuseRes = await fetch(`${API_BASE}/api/v1/invites/${inviteCode}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      displayName: 'Người Khác',
      pin: '9999',
    }),
  });
  assert(reuseRes.status === 400, 'Chặn tái sử dụng mã mời đã dùng hết lượt (max_uses=1)');

  // --- 5. Mời thành viên Chỉ xem (viewer - Ông Bà) ---
  console.log('\n--- 5. Mời thành viên Chỉ xem (viewer - Ông Bà) & Kiểm tra phân quyền RBAC ---');
  const viewerInvRes = await fetch(`${API_BASE}/api/v1/family/invites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${dadToken}`, // Bố (guardian) mời viewer
    },
    body: JSON.stringify({
      role: 'viewer',
      relationHint: 'Bà',
    }),
  });
  assert(viewerInvRes.status === 201, 'Bố (guardian) mời được thành viên Chỉ xem');
  const viewerInvCode = (await viewerInvRes.json()).invite.code;

  // Guardian thử mời guardian -> Phải bị chặn 403
  const badInviteRes = await fetch(`${API_BASE}/api/v1/family/invites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${dadToken}`,
    },
    body: JSON.stringify({ role: 'guardian' }),
  });
  assert(badInviteRes.status === 403, 'Guardian bị chặn 403 khi cố mời guardian/owner');

  // Bà nhận lời mời viewer
  const grandmaRes = await fetch(`${API_BASE}/api/v1/invites/${viewerInvCode}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      displayName: 'Bà Ngoại',
      relation: 'Bà',
      pin: '5678',
    }),
  });
  const grandmaData = await grandmaRes.json();
  const grandmaToken = grandmaData.token;
  assert(grandmaData.member.role === 'viewer', 'Bà Ngoại nhận vai trò viewer (Chỉ xem)');

  // Kiểm tra RBAC ma trận quyền: Viewer gọi PUT state -> 403
  const viewerPutRes = await fetch(`${API_BASE}/api/v1/family/state`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${grandmaToken}`,
    },
    body: JSON.stringify({ state: { test: 1 } }),
  });
  assert(viewerPutRes.status === 403, 'Tài khoản Viewer bị chặn 403 khi cố ghi state');

  // Viewer gọi POST /sessions -> 403
  const viewerSessionRes = await fetch(`${API_BASE}/api/v1/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${grandmaToken}`,
    },
    body: JSON.stringify({ subject: 'Toán', stepsTotal: 2 }),
  });
  assert(viewerSessionRes.status === 403, 'Tài khoản Viewer bị chặn 403 khi cố tạo buổi học');

  // --- 6. Ghi công buổi học đúng người (member_id) ---
  console.log('\n--- 6. Ghi nhận buổi học đúng người kèm (member_id của Bố Tuấn) ---');
  const dadSessionRes = await fetch(`${API_BASE}/api/v1/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${dadToken}`,
    },
    body: JSON.stringify({
      id: 'ses_dad_' + Date.now().toString(36),
      subject: 'Toán',
      grade: 3,
      problemText: 'Bài toán que tính',
      stepsTotal: 2,
    }),
  });
  assert(dadSessionRes.status === 201, 'Bố Tuấn tạo buổi học thành công');

  // Lấy danh sách thành viên: Bố Tuấn có sessionsWeek = 1
  const membersRes = await fetch(`${API_BASE}/api/v1/family/members`, {
    headers: { Authorization: `Bearer ${momToken}` },
  });
  assert(membersRes.status === 200, 'Đọc danh sách thành viên thành công');
  const membersData = await membersRes.json();
  const foundDad = membersData.members.find((m) => m.id === dadId);
  assert(foundDad && foundDad.sessionsWeek >= 1, `Bố Tuấn được ghi nhận đúng ${foundDad.sessionsWeek} ca học tuần này`);

  // --- 7. Đăng nhập máy mới bằng mã thiết bị (Device Code) ---
  console.log('\n--- 7. Đăng nhập máy mới an toàn bằng Device Code (15 phút) ---');
  const devCodeRes = await fetch(`${API_BASE}/api/v1/auth/device-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${dadToken}`,
    },
  });
  assert(devCodeRes.status === 201, 'Tạo mã thiết bị mới thành công');
  const devCode = (await devCodeRes.json()).code;

  // Nhập sai PIN -> 401
  const badPinRes = await fetch(`${API_BASE}/api/v1/auth/login-device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: devCode, pin: '0000' }),
  });
  assert(badPinRes.status === 401, 'Nhập sai PIN trên máy mới bị từ chối 401');

  // Nhập đúng PIN 1234 -> 200 & Cấp token mới
  const goodPinRes = await fetch(`${API_BASE}/api/v1/auth/login-device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: devCode, pin: '1234' }),
  });
  assert(goodPinRes.status === 200, 'Đăng nhập máy mới bằng Device Code + PIN thành công');
  const goodPinData = await goodPinRes.json();
  assert(goodPinData.member.id === dadId, 'Nhận diện đúng thành viên Bố Tuấn');

  // --- 8. Tạo và Xem link chia sẻ báo cáo tuần (Snapshot không đổi) ---
  console.log('\n--- 8. Tạo link chia sẻ báo cáo tuần & xem không cần đăng nhập ---');
  const snapshotData = {
    childName: 'Bé Bắp',
    totalSessions: 5,
    totalMinutes: 95,
    independentRatio: '80%',
    strongPoints: 'Phép nhân, Que tính sáng tạo',
    weakPoints: 'Lời văn 2 bước',
    coParents: [{ name: 'Bố Tuấn', sessions: 2 }, { name: 'Mẹ Lan', sessions: 3 }],
  };

  const shareRes = await fetch(`${API_BASE}/api/v1/reports/weekly/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${momToken}`,
    },
    body: JSON.stringify({
      childId: 'c1',
      week: 'Tuần 42',
      snapshot: snapshotData,
      expiresDays: 7,
    }),
  });
  assert(shareRes.status === 201, 'Tạo link chia sẻ báo cáo 201');
  const shareData = await shareRes.json();
  const reportToken = shareData.token;

  // Người ngoài mở link không cần đăng nhập
  const viewShareRes = await fetch(`${API_BASE}/api/v1/reports/shared/${reportToken}`);
  assert(viewShareRes.status === 200, 'Mở xem báo cáo công khai 200 OK');
  const viewShareData = await viewShareRes.json();
  assert(viewShareData.report.childName === 'Bé Bắp', 'Dữ liệu snapshot báo cáo chính xác');
  assert(viewShareData.report.totalMinutes === 95, 'Số phút học khớp snapshot lúc tạo');

  // Thu hồi link báo cáo
  const revokeShareRes = await fetch(`${API_BASE}/api/v1/reports/shared/${reportToken}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${momToken}` },
  });
  assert(revokeShareRes.status === 200, 'Thu hồi link báo cáo thành công');

  // Mở lại sau khi thu hồi -> Báo hết hạn / thu hồi (404)
  const afterRevokeRes = await fetch(`${API_BASE}/api/v1/reports/shared/${reportToken}`);
  assert(afterRevokeRes.status === 404, 'Link đã thu hồi báo 404 REPORT_EXPIRED');

  console.log('\n------------------------------------------------------------');
  console.log('🎉 TẤT CẢ 24 BÀI KIỂM THỬ NHÓM GIA ĐÌNH & BÁO CÁO ZALO (PROMPT 03) ĐÃ VƯỢT QUA 100%!');
}

runTests().catch((err) => {
  console.error('Unhandled test error:', err);
  process.exit(1);
});
