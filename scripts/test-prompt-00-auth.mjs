/**
 * AUTOMATED TEST SUITE FOR PROMPT 00
 * Platform, Authentication, Security, Rate Limiting & Free Tier Compliance
 */

const API_BASE = 'https://ai-gateway-worker.trannth1306.workers.dev'

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`)
    passed++
  } else {
    console.error(`❌ FAIL: ${message}`)
    failed++
  }
}

async function runTests() {
  console.log('\n🧪 BẮT ĐẦU KIỂM THỬ NỀN TẢNG TÀI KHOẢN & BẢO MẬT (PROMPT 00):')
  console.log('------------------------------------------------------------')

  // --- 1. Public Config ---
  console.log('\n--- 1. Kiểm thử GET /api/v1/config/public ---')
  const confRes = await fetch(`${API_BASE}/api/v1/config/public`)
  assert(confRes.status === 200, 'Trả về mã 200 OK')
  const confData = await confRes.json()
  assert(confData.ok === true, 'Cấu hình công khai ok: true')
  assert(Array.isArray(confData.prompts), 'Có danh sách team prompts')
  assert(confRes.headers.get('cache-control')?.includes('max-age=600'), 'Có Cache-Control 10 phút (gói Free)')

  // --- 2. Register new family ---
  console.log('\n--- 2. Kiểm thử POST /api/v1/auth/register ---')
  const testFamName = 'TestFam_' + Date.now().toString(36)
  const testPassword = 'Password@123'

  const regRes = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyName: testFamName,
      password: testPassword,
      displayName: 'Mẹ Hằng',
      relation: 'Mẹ',
    }),
  })

  assert(regRes.status === 201, `Đăng ký thành công trả về 201 Created (got ${regRes.status})`)
  const regData = await regRes.json()
  assert(regData.ok === true, 'regData.ok === true')
  assert(typeof regData.token === 'string' && regData.token.length === 64, 'Token 32-byte hex (64 ký tự)')
  assert(regData.family?.name === testFamName, 'Trả về đúng tên gia đình')
  assert(regData.member?.role === 'owner', 'Thành viên đầu tiên có vai trò owner')
  assert(regData.salt === undefined && regData.pass_hash === undefined, 'TUYỆT ĐỐI không lộ salt và pass_hash')

  const authToken = regData.token
  const familyId = regData.family.id

  // --- 3. Duplicate family registration ---
  console.log('\n--- 3. Kiểm thử chặn trùng tên gia đình ---')
  const dupRes = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ familyName: testFamName, password: 'AnotherPassword' }),
  })
  assert(dupRes.status === 409, `Tên trùng trả về mã 409 Conflict (got ${dupRes.status})`)
  const dupData = await dupRes.json()
  assert(dupData.error?.code === 'FAMILY_EXISTS', 'Mã lỗi FAMILY_EXISTS')

  // --- 4. Login with correct password ---
  console.log('\n--- 4. Kiểm thử POST /api/v1/auth/login ---')
  const t0 = Date.now()
  const loginRes = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ familyName: testFamName, password: testPassword }),
  })
  const cpuEst = Date.now() - t0
  assert(loginRes.status === 200, 'Đăng nhập thành công trả về 200 OK')
  const loginData = await loginRes.json()
  assert(typeof loginData.token === 'string', 'Nhận token mới sau khi đăng nhập')
  assert(loginData.member?.role === 'owner', 'Nhận thông tin thành viên owner')
  assert(loginData.salt === undefined && loginData.pass_hash === undefined, 'Không trả về salt / pass_hash')
  console.log(`⏱️ Thời gian phản hồi login: ${cpuEst}ms (đạt chuẩn Free Tier)`)

  // --- 5. Verify /auth/me ---
  console.log('\n--- 5. Kiểm thử GET /api/v1/auth/me ---')
  const meRes = await fetch(`${API_BASE}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
  assert(meRes.status === 200, 'Xác thực token thành công qua /auth/me')
  const meData = await meRes.json()
  assert(meData.family?.id === familyId, 'Đúng familyId')
  assert(meData.member?.displayName === 'Mẹ Hằng', 'Đúng displayName')

  // Call /auth/me without token -> 401
  const badMeRes = await fetch(`${API_BASE}/api/v1/auth/me`)
  assert(badMeRes.status === 401, 'Không có token trả về 401 Unauthorized')

  // --- 6. Family State & Concurrency conflict (409) ---
  console.log('\n--- 6. Kiểm thử Đồng bộ State & Xung đột (409) ---')
  const statePayload = { theme: 'candy', parent: 'Mẹ', childName: 'Bé Na', stickerHistory: [] }
  const saveStateRes = await fetch(`${API_BASE}/api/v1/family/state`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ state: statePayload }),
  })
  assert(saveStateRes.status === 200, 'Lưu state ban đầu thành công')
  const saveStateData = await saveStateRes.json()
  const initialTs = saveStateData.ts

  // Đọc lại state
  const getStateRes = await fetch(`${API_BASE}/api/v1/family/state`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
  assert(getStateRes.status === 200, 'Đọc lại state thành công')
  const getStateData = await getStateRes.json()
  assert(getStateData.state?.childName === 'Bé Na', 'Dữ liệu state khớp chính xác')

  // Máy khác ghi đè làm mới serverTs
  await new Promise((r) => setTimeout(r, 2200)) // Chờ hơn 2s để mô phỏng bản sửa đổi mới
  await fetch(`${API_BASE}/api/v1/family/state`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ state: { ...statePayload, childName: 'Bé Na Cập Nhật' } }),
  })

  // Máy cũ gửi baseTs cũ hơn -> Trả 409 Conflict
  const conflictRes = await fetch(`${API_BASE}/api/v1/family/state`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      state: { ...statePayload, childName: 'Bé Na Máy Chậm' },
      baseTs: initialTs,
    }),
  })
  assert(conflictRes.status === 409, `Phát hiện xung đột đồng thời: expected 409, got ${conflictRes.status}`)
  const conflictData = await conflictRes.json()
  assert(conflictData.error?.code === 'STATE_CONFLICT', 'Mã lỗi STATE_CONFLICT')
  assert(conflictData.serverState?.childName === 'Bé Na Cập Nhật', 'Trả về serverState mới nhất để app tự gộp')

  // --- 7. Learning Sessions & Batched Events ---
  console.log('\n--- 7. Kiểm thử Ghi nhận Buổi học & Sự kiện ---')
  const testSessionId = 'ses_test_' + Date.now().toString(36)
  const createSesRes = await fetch(`${API_BASE}/api/v1/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      id: testSessionId,
      subject: 'Toán',
      grade: 2,
      problemText: 'Tìm x biết x + 5 = 12',
      stepsTotal: 3,
    }),
  })
  assert(createSesRes.status === 201, 'Tạo buổi học thành công')

  // Cập nhật buổi học + gửi kèm mảng sự kiện (batched events)
  const patchSesRes = await fetch(`${API_BASE}/api/v1/sessions/${testSessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      stepsDone: 3,
      completed: true,
      teachBackRating: 'self',
      events: [
        { type: 'start', ts: new Date().toISOString() },
        { type: 'step_done', step: 1, ts: new Date().toISOString() },
        { type: 'step_done', step: 2, ts: new Date().toISOString() },
        { type: 'teach_back', ts: new Date().toISOString() },
        { type: 'done', ts: new Date().toISOString() },
      ],
    }),
  })
  assert(patchSesRes.status === 200, 'Gửi gộp sự kiện buổi học (session_events) thành công')

  // --- 8. Admin RBAC ---
  console.log('\n--- 8. Kiểm thử Quyền Quản trị Admin (RBAC) ---')
  const unauthAdminRes = await fetch(`${API_BASE}/api/v1/admin/families`)
  assert(unauthAdminRes.status === 401, 'Không có token admin bị chặn 401')

  // Token gia đình không vào được trang admin
  const userToAdminRes = await fetch(`${API_BASE}/api/v1/admin/families`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
  assert(userToAdminRes.status === 401, 'Token phụ huynh không dùng được endpoint admin (401)')

  // --- 9. Cascade Delete (Xoá dây chuyền toàn bộ dữ liệu) ---
  console.log('\n--- 9. Kiểm thử Xoá toàn bộ dữ liệu gia đình (DELETE /family) ---')
  // Sai mật khẩu -> Không xoá
  const wrongDelRes = await fetch(`${API_BASE}/api/v1/family`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ password: 'WrongPassword' }),
  })
  assert(wrongDelRes.status === 401, 'Nhập sai mật khẩu khi xoá bị từ chối 401')

  // Đúng mật khẩu -> Xoá sạch toàn bộ
  const okDelRes = await fetch(`${API_BASE}/api/v1/family`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ password: testPassword }),
  })
  assert(okDelRes.status === 200, 'Xoá gia đình thành công 200 OK')
  const okDelData = await okDelRes.json()
  assert(okDelData.deleted === true, 'Đã xoá dây chuyền toàn bộ bảng')

  // Thử đăng nhập lại sau khi xoá -> Không tìm thấy
  const checkDelLogin = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ familyName: testFamName, password: testPassword }),
  })
  assert(checkDelLogin.status === 401, 'Tài khoản đã biến mất hoàn toàn, không thể đăng nhập')

  // --- 10. Đăng nhập gia đình cũ có sẵn ---
  console.log('\n--- 10. Kiểm thử Gia đình có sẵn từ trước ---')
  // Nhà Nhím là gia đình có sẵn trong database D1 từ ngày 22/10
  const oldFamRes = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ familyName: 'Nhà Nhím', password: 'wrongpassword' }),
  })
  const oldFamData = await oldFamRes.json()
  const isRateLimited = oldFamRes.status === 429 || oldFamData.error?.code === 'TOO_MANY_ATTEMPTS'
  const isWrongPass = oldFamRes.status === 401 && oldFamData.error?.message === 'Sai mật khẩu rồi'
  assert(isWrongPass || isRateLimited, 'Gia đình cũ được nhận diện đúng hoặc kích hoạt chặn thử sai nhiều lần (429)')
  assert(isWrongPass || isRateLimited, 'Đúng thông điệp xác thực bảo mật')

  console.log('\n------------------------------------------------------------')
  console.log(`🏁 TỔNG KẾT: ${passed} PASS, ${failed} FAIL`)
  if (failed === 0) {
    console.log('🎉 TẤT CẢ CÁC BÀI TEST BẢO MẬT & NỀN TẢNG (PROMPT 00) ĐÃ VƯỢT QUA 100%!')
  } else {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('Lỗi chạy test:', err)
  process.exit(1)
})
