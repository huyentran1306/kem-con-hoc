const fs = require('fs');
const file = '/Users/pro/Coding/study-en/ai-gateway-worker/src/v1_routes.js';
let content = fs.readFileSync(file, 'utf8');

const prompt03Routes = `
  // ==========================================================
  // 8. PROMPT 03: NHÓM GIA ĐÌNH & MÃ MỜI (INVITES)
  // ==========================================================

  // Tạo mã mời (POST /api/v1/family/invites)
  if (pathname === "/api/v1/family/invites" && method === "POST") {
    const session = await authenticateSession(request, env);
    if (!session) {
      return jsonResponse({ error: { code: "UNAUTHORIZED", message: "Yêu cầu đăng nhập" } }, 401, corsHeaders);
    }
    if (session.role === "viewer") {
      return jsonResponse({ error: { code: "FORBIDDEN", message: "Tài khoản Chỉ xem không có quyền mời thành viên" } }, 403, corsHeaders);
    }

    const body = await request.json().catch(() => ({}));
    let { role = "guardian", relationHint = "" } = body;
    // Guardian chỉ được mời viewer
    if (session.role === "guardian" && role !== "viewer") {
      return jsonResponse({ error: { code: "FORBIDDEN", message: "Người kèm con chỉ có quyền mời thành viên với vai trò Chỉ xem (viewer)" } }, 403, corsHeaders);
    }

    const code = generateCleanCode(6);
    const expiresAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();

    await env.DB.prepare(\`
      INSERT INTO invites (code, family_id, role, relation_hint, created_by, expires_at, max_uses, used_count)
      VALUES (?, ?, ?, ?, ?, ?, 1, 0)
    \`).bind(code, session.family_id, role, relationHint || "", session.member_id, expiresAt).run();

    return jsonResponse({
      ok: true,
      invite: {
        code,
        role,
        relationHint,
        expiresAt,
        maxUses: 1,
      }
    }, 201, corsHeaders);
  }

  // Danh sách mã mời gia đình (GET /api/v1/family/invites)
  if (pathname === "/api/v1/family/invites" && method === "GET") {
    const session = await authenticateSession(request, env);
    if (!session) {
      return jsonResponse({ error: { code: "UNAUTHORIZED", message: "Yêu cầu đăng nhập" } }, 401, corsHeaders);
    }

    const rows = await env.DB.prepare(\`
      SELECT code, role, relation_hint as relationHint, created_by as createdBy, created_at as createdAt, expires_at as expiresAt, max_uses as maxUses, used_count as usedCount
      FROM invites
      WHERE family_id = ? AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP AND used_count < max_uses
      ORDER BY created_at DESC
    \`).bind(session.family_id).all();

    return jsonResponse({ ok: true, invites: rows.results || [] }, 200, corsHeaders);
  }

  // Thu hồi mã mời (DELETE /api/v1/family/invites/:code)
  if (pathname.startsWith("/api/v1/family/invites/") && method === "DELETE") {
    const session = await authenticateSession(request, env);
    if (!session) {
      return jsonResponse({ error: { code: "UNAUTHORIZED", message: "Yêu cầu đăng nhập" } }, 401, corsHeaders);
    }

    const code = pathname.replace("/api/v1/family/invites/", "").trim().toUpperCase();
    const inv = await env.DB.prepare("SELECT * FROM invites WHERE code = ? AND family_id = ?").bind(code, session.family_id).first();
    if (!inv) {
      return jsonResponse({ error: { code: "NOT_FOUND", message: "Không tìm thấy mã mời" } }, 404, corsHeaders);
    }
    if (session.role !== "owner" && inv.created_by !== session.member_id) {
      return jsonResponse({ error: { code: "FORBIDDEN", message: "Không có quyền thu hồi mã mời này" } }, 403, corsHeaders);
    }

    await env.DB.prepare("UPDATE invites SET revoked_at = CURRENT_TIMESTAMP WHERE code = ?").bind(code).run();
    return jsonResponse({ ok: true, revoked: true }, 200, corsHeaders);
  }

  // Kiểm tra thông tin công khai của mã mời (GET /api/v1/invites/:code)
  if (pathname.startsWith("/api/v1/invites/") && !pathname.includes("/accept") && method === "GET") {
    const code = pathname.replace("/api/v1/invites/", "").trim().toUpperCase();
    const inv = await env.DB.prepare(\`
      SELECT code, family_id, role, relation_hint, created_by, expires_at, max_uses, used_count, revoked_at
      FROM invites
      WHERE code = ?
    \`).bind(code).first();

    const isExpired = inv ? new Date(inv.expires_at).getTime() <= Date.now() : true;
    if (!inv || inv.revoked_at || isExpired || (inv.used_count >= inv.max_uses)) {
      return jsonResponse({
        ok: false,
        error: { code: "INVITE_INVALID", message: "Mã mời không tồn tại, đã hết hạn hoặc đã được sử dụng" }
      }, 404, corsHeaders);
    }

    const fam = await env.DB.prepare("SELECT name FROM families WHERE id = ?").bind(inv.family_id).first();
    const creator = await env.DB.prepare("SELECT display_name, relation FROM members WHERE id = ?").bind(inv.created_by).first();

    return jsonResponse({
      ok: true,
      valid: true,
      code: inv.code,
      familyName: fam ? fam.name : "Gia đình Kèm Con Học",
      inviterName: creator ? (creator.relation ? creator.relation + ' ' + creator.display_name : creator.display_name) : "Người thân",
      role: inv.role,
      relationHint: inv.relation_hint,
      expiresAt: inv.expires_at
    }, 200, corsHeaders);
  }

  // Chấp nhận mã mời và gia nhập gia đình (POST /api/v1/invites/:code/accept)
  if (pathname.startsWith("/api/v1/invites/") && pathname.endsWith("/accept") && method === "POST") {
    const code = pathname.replace("/api/v1/invites/", "").replace("/accept", "").trim().toUpperCase();
    const body = await request.json().catch(() => ({}));
    const { displayName = "", relation = "Mẹ", pin = "" } = body;

    if (!displayName.trim()) {
      return jsonResponse({ error: { code: "INVALID_INPUT", message: "Vui lòng nhập tên hiển thị" } }, 400, corsHeaders);
    }
    if (!pin || !/^\\d{4,6}$/.test(String(pin))) {
      return jsonResponse({ error: { code: "INVALID_PIN", message: "Mã PIN phải gồm từ 4 đến 6 chữ số" } }, 400, corsHeaders);
    }

    const inv = await env.DB.prepare(\`
      SELECT code, family_id, role, expires_at, max_uses, used_count, revoked_at
      FROM invites WHERE code = ?
    \`).bind(code).first();

    const isExpired = inv ? new Date(inv.expires_at).getTime() <= Date.now() : true;
    if (!inv || inv.revoked_at || isExpired || (inv.used_count >= inv.max_uses)) {
      return jsonResponse({
        error: { code: "INVITE_INVALID", message: "Mã mời không tồn tại, đã hết hạn hoặc đã được sử dụng" }
      }, 400, corsHeaders);
    }

    const memberId = "mem_" + generateCleanCode(8).toLowerCase();
    const pinSalt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const pinHash = await hashPass(String(pin), pinSalt);

    // Tạo member mới
    await env.DB.prepare(\`
      INSERT INTO members (id, family_id, display_name, relation, role, pin_salt, pin_hash, is_active, created_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    \`).bind(memberId, inv.family_id, displayName.trim(), relation || "Khác", inv.role, pinSalt, pinHash).run();

    // Cập nhật lượt dùng của invite
    await env.DB.prepare("UPDATE invites SET used_count = used_count + 1 WHERE code = ?").bind(code).run();

    // Cấp token đăng nhập 60 ngày
    const token = generateToken();
    const tokenHash = await sha256Hex(token);
    const expiresAt = new Date(Date.now() + 60 * 86400000).toISOString();

    await env.DB.prepare(\`
      INSERT INTO auth_sessions (token_hash, family_id, member_id, role, expires_at, created_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    \`).bind(tokenHash, inv.family_id, memberId, inv.role, expiresAt).run();

    const fam = await env.DB.prepare("SELECT name FROM families WHERE id = ?").bind(inv.family_id).first();

    return jsonResponse({
      ok: true,
      token,
      familyId: inv.family_id,
      familyName: fam ? fam.name : "Gia đình",
      member: {
        id: memberId,
        displayName: displayName.trim(),
        relation,
        role: inv.role
      }
    }, 201, corsHeaders);
  }

  // ==========================================================
  // 9. PROMPT 03: QUẢN LÝ THÀNH VIÊN & MÃ MÁY MỚI (DEVICE CODE)
  // ==========================================================

  // Danh sách thành viên trong gia đình (GET /api/v1/family/members)
  if (pathname === "/api/v1/family/members" && method === "GET") {
    const session = await authenticateSession(request, env);
    if (!session) {
      return jsonResponse({ error: { code: "UNAUTHORIZED", message: "Yêu cầu đăng nhập" } }, 401, corsHeaders);
    }

    const rows = await env.DB.prepare(\`
      SELECT m.id, m.display_name as displayName, m.relation, m.role, m.is_active as isActive,
             m.created_at as createdAt, m.last_seen_at as lastSeenAt,
             COUNT(ls.id) as sessionsWeek
      FROM members m
      LEFT JOIN learning_sessions ls ON ls.member_id = m.id AND ls.created_at >= datetime('now', '-7 days')
      WHERE m.family_id = ? AND m.is_active = 1
      GROUP BY m.id
      ORDER BY CASE m.role WHEN 'owner' THEN 1 WHEN 'guardian' THEN 2 ELSE 3 END, m.created_at ASC
    \`).bind(session.family_id).all();

    return jsonResponse({ ok: true, members: rows.results || [] }, 200, corsHeaders);
  }

  // Cập nhật vai trò / thông tin thành viên (PATCH /api/v1/family/members/:id)
  if (pathname.startsWith("/api/v1/family/members/") && method === "PATCH") {
    const session = await authenticateSession(request, env);
    if (!session || session.role !== "owner") {
      return jsonResponse({ error: { code: "FORBIDDEN", message: "Chỉ chủ nhà mới có quyền thay đổi vai trò thành viên" } }, 403, corsHeaders);
    }

    const memberId = pathname.replace("/api/v1/family/members/", "").trim();
    const body = await request.json().catch(() => ({}));
    const { role = null, relation = null, displayName = null } = body;

    const updates = [];
    const params = [];
    if (role && ['owner', 'guardian', 'viewer'].includes(role)) {
      updates.push("role = ?");
      params.push(role);
    }
    if (relation) {
      updates.push("relation = ?");
      params.push(relation);
    }
    if (displayName) {
      updates.push("display_name = ?");
      params.push(displayName.trim());
    }

    if (updates.length > 0) {
      params.push(memberId, session.family_id);
      await env.DB.prepare(\`UPDATE members SET \${updates.join(', ')} WHERE id = ? AND family_id = ?\`).bind(...params).run();
    }

    return jsonResponse({ ok: true, updated: true }, 200, corsHeaders);
  }

  // Xoá thành viên khỏi gia đình (DELETE /api/v1/family/members/:id)
  if (pathname.startsWith("/api/v1/family/members/") && method === "DELETE") {
    const session = await authenticateSession(request, env);
    if (!session || session.role !== "owner") {
      return jsonResponse({ error: { code: "FORBIDDEN", message: "Chỉ chủ nhà mới có quyền xoá thành viên" } }, 403, corsHeaders);
    }

    const memberId = pathname.replace("/api/v1/family/members/", "").trim();
    if (memberId === session.member_id) {
      return jsonResponse({ error: { code: "CANNOT_DELETE_SELF", message: "Chủ nhà không thể tự xoá chính mình" } }, 400, corsHeaders);
    }

    await env.DB.prepare("UPDATE members SET is_active = 0 WHERE id = ? AND family_id = ?").bind(memberId, session.family_id).run();
    await env.DB.prepare("DELETE FROM auth_sessions WHERE member_id = ?").bind(memberId).run();

    return jsonResponse({ ok: true, deleted: true }, 200, corsHeaders);
  }

  // Tạo mã đăng nhập máy mới (POST /api/v1/auth/device-code)
  if (pathname === "/api/v1/auth/device-code" && method === "POST") {
    const session = await authenticateSession(request, env);
    if (!session) {
      return jsonResponse({ error: { code: "UNAUTHORIZED", message: "Yêu cầu đăng nhập" } }, 401, corsHeaders);
    }

    const body = await request.json().catch(() => ({}));
    const targetMemberId = (session.role === "owner" && body.memberId) ? body.memberId : session.member_id;

    const code = generateCleanCode(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 phút

    await env.DB.prepare(\`
      INSERT INTO device_codes (code, member_id, family_id, expires_at)
      VALUES (?, ?, ?, ?)
    \`).bind(code, targetMemberId, session.family_id, expiresAt).run();

    return jsonResponse({ ok: true, code, expiresAt }, 201, corsHeaders);
  }

  // Đăng nhập máy mới bằng mã 6 ký tự + PIN (POST /api/v1/auth/login-device)
  if (pathname === "/api/v1/auth/login-device" && method === "POST") {
    const body = await request.json().catch(() => ({}));
    const { code = "", pin = "" } = body;
    const cleanCode = String(code).trim().toUpperCase();

    const dev = await env.DB.prepare(\`
      SELECT d.code, d.member_id, d.family_id, d.expires_at, d.used_at,
             m.display_name, m.relation, m.role, m.pin_salt, m.pin_hash, m.is_active,
             f.name as family_name
      FROM device_codes d
      JOIN members m ON d.member_id = m.id
      JOIN families f ON d.family_id = f.id
      WHERE d.code = ?
    \`).bind(cleanCode).first();

    const isExpired = dev ? new Date(dev.expires_at).getTime() <= Date.now() : true;
    if (!dev || dev.used_at || isExpired || dev.is_active !== 1) {
      return jsonResponse({ error: { code: "INVALID_DEVICE_CODE", message: "Mã đăng nhập không đúng hoặc đã hết hạn (15 phút)" } }, 400, corsHeaders);
    }

    // Kiểm tra PIN
    const hashed = await hashPass(String(pin), dev.pin_salt || "");
    if (!dev.pin_hash || !timingSafeEqual(hashed, dev.pin_hash)) {
      return jsonResponse({ error: { code: "INVALID_PIN", message: "Mã PIN không chính xác" } }, 401, corsHeaders);
    }

    // Đánh dấu mã đã dùng
    await env.DB.prepare("UPDATE device_codes SET used_at = CURRENT_TIMESTAMP WHERE code = ?").bind(cleanCode).run();

    // Tạo session 60 ngày
    const token = generateToken();
    const tokenHash = await sha256Hex(token);
    const expiresAt = new Date(Date.now() + 60 * 86400000).toISOString();

    await env.DB.prepare(\`
      INSERT INTO auth_sessions (token_hash, family_id, member_id, role, expires_at, created_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    \`).bind(tokenHash, dev.family_id, dev.member_id, dev.role, expiresAt).run();

    return jsonResponse({
      ok: true,
      token,
      familyId: dev.family_id,
      familyName: dev.family_name,
      member: {
        id: dev.member_id,
        displayName: dev.display_name,
        relation: dev.relation,
        role: dev.role
      }
    }, 200, corsHeaders);
  }

  // ==========================================================
  // 10. PROMPT 03: BÁO CÁO TUẦN CHIA SẺ & ZALO (REPORT SHARES)
  // ==========================================================

  // Tạo link chia sẻ báo cáo tuần (POST /api/v1/reports/weekly/share)
  if (pathname === "/api/v1/reports/weekly/share" && method === "POST") {
    const session = await authenticateSession(request, env);
    if (!session) {
      return jsonResponse({ error: { code: "UNAUTHORIZED", message: "Yêu cầu đăng nhập" } }, 401, corsHeaders);
    }
    if (session.role === "viewer") {
      return jsonResponse({ error: { code: "FORBIDDEN", message: "Tài khoản Chỉ xem không có quyền tạo link chia sẻ" } }, 403, corsHeaders);
    }

    const body = await request.json().catch(() => ({}));
    const { childId = null, week = "Tuần này", snapshot = {}, expiresDays = 7 } = body;

    const days = [7, 14].includes(Number(expiresDays)) ? Number(expiresDays) : 7;
    const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
    const token = "rep_" + generateCleanCode(18).toLowerCase();

    await env.DB.prepare(\`
      INSERT INTO report_shares (token, family_id, child_id, week, snapshot_json, created_by, expires_at, view_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    \`).bind(token, session.family_id, childId, week, JSON.stringify(snapshot), session.member_id, expiresAt).run();

    return jsonResponse({
      ok: true,
      token,
      expiresAt,
      shareUrl: \`/r/\${token}\`
    }, 201, corsHeaders);
  }

  // Xem báo cáo công khai (GET /api/v1/reports/shared/:token)
  if (pathname.startsWith("/api/v1/reports/shared/") && method === "GET") {
    const token = pathname.replace("/api/v1/reports/shared/", "").trim();

    const row = await env.DB.prepare(\`
      SELECT token, family_id, child_id, week, snapshot_json, created_at, expires_at, revoked_at, view_count
      FROM report_shares
      WHERE token = ?
    \`).bind(token).first();

    const isExpired = row ? new Date(row.expires_at).getTime() <= Date.now() : true;
    if (!row || row.revoked_at || isExpired) {
      return jsonResponse({
        ok: false,
        error: { code: "REPORT_EXPIRED", message: "Link báo cáo đã hết hạn hoặc bị thu hồi" }
      }, 404, corsHeaders);
    }

    // Tăng lượt xem
    await env.DB.prepare("UPDATE report_shares SET view_count = view_count + 1 WHERE token = ?").bind(token).run();

    let report = {};
    try {
      report = JSON.parse(row.snapshot_json);
    } catch {
      report = {};
    }

    return jsonResponse({
      ok: true,
      report,
      week: row.week,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      viewCount: (row.view_count || 0) + 1
    }, 200, corsHeaders);
  }

  // Danh sách báo cáo đã chia sẻ của gia đình (GET /api/v1/reports/shared-list)
  if (pathname === "/api/v1/reports/shared-list" && method === "GET") {
    const session = await authenticateSession(request, env);
    if (!session) {
      return jsonResponse({ error: { code: "UNAUTHORIZED", message: "Yêu cầu đăng nhập" } }, 401, corsHeaders);
    }

    let query = "SELECT token, week, child_id as childId, created_at as createdAt, expires_at as expiresAt, revoked_at as revokedAt, view_count as viewCount, created_by as createdBy FROM report_shares WHERE family_id = ?";
    const params = [session.family_id];
    if (session.role === "guardian") {
      query += " AND created_by = ?";
      params.push(session.member_id);
    }
    query += " ORDER BY created_at DESC LIMIT 50";

    const rows = await env.DB.prepare(query).bind(...params).all();
    return jsonResponse({ ok: true, shares: rows.results || [] }, 200, corsHeaders);
  }

  // Thu hồi link báo cáo (DELETE /api/v1/reports/shared/:token)
  if (pathname.startsWith("/api/v1/reports/shared/") && method === "DELETE") {
    const session = await authenticateSession(request, env);
    if (!session) {
      return jsonResponse({ error: { code: "UNAUTHORIZED", message: "Yêu cầu đăng nhập" } }, 401, corsHeaders);
    }

    const token = pathname.replace("/api/v1/reports/shared/", "").trim();
    const row = await env.DB.prepare("SELECT family_id, created_by FROM report_shares WHERE token = ?").bind(token).first();
    if (!row || row.family_id !== session.family_id) {
      return jsonResponse({ error: { code: "NOT_FOUND", message: "Không tìm thấy link báo cáo" } }, 404, corsHeaders);
    }
    if (session.role !== "owner" && row.created_by !== session.member_id) {
      return jsonResponse({ error: { code: "FORBIDDEN", message: "Chỉ người tạo hoặc chủ nhà mới có quyền thu hồi link này" } }, 403, corsHeaders);
    }

    await env.DB.prepare("UPDATE report_shares SET revoked_at = CURRENT_TIMESTAMP WHERE token = ?").bind(token).run();
    return jsonResponse({ ok: true, revoked: true }, 200, corsHeaders);
  }
`;

content = content.replace('return null; // Not handled by V1 router', prompt03Routes + '\n  return null; // Not handled by V1 router');
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully injected Prompt 03 routes into v1_routes.js');
