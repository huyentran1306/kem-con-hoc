-- ============================================================
-- PROMPT 03: SCHEMA D1 CHO NHÓM GIA ĐÌNH, MÃ MỜI VÀ BÁO CÁO ZALO
-- ============================================================

-- 1. Bảng mã mời tham gia gia đình
CREATE TABLE IF NOT EXISTS invites (
  code TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guardian',
  relation_hint TEXT,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  revoked_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_invites_fam ON invites(family_id);
CREATE INDEX IF NOT EXISTS idx_invites_exp ON invites(expires_at);

-- 2. Bảng mã đăng nhập thiết bị mới (thay thế cho việc lộ danh sách thành viên)
CREATE TABLE IF NOT EXISTS device_codes (
  code TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  family_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  used_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_device_codes_mem ON device_codes(member_id);
CREATE INDEX IF NOT EXISTS idx_device_codes_exp ON device_codes(expires_at);

-- 3. Bảng chia sẻ báo cáo tuần (không cần đăng nhập, chụp số liệu snapshot)
CREATE TABLE IF NOT EXISTS report_shares (
  token TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  child_id TEXT,
  week TEXT,
  snapshot_json TEXT NOT NULL,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME,
  view_count INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_report_shares_fam ON report_shares(family_id);
CREATE INDEX IF NOT EXISTS idx_report_shares_exp ON report_shares(expires_at);
