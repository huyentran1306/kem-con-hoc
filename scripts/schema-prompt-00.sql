-- ============================================================
-- KEM CON HOC — SCHEMA PROMPT 00 (NEN TANG TAI KHOAN & BAO MAT)
-- Optimization for Cloudflare D1 Free Tier
-- ============================================================

-- 1. Members (thành viên trong gia đình)
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('owner','parent','teacher_guest')),
  pin_hash TEXT NULL,
  pin_salt TEXT NULL,
  relation TEXT NULL,
  last_seen_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_members_fam ON members(family_id);

-- 2. Children (danh sách các con)
CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  name TEXT NOT NULL,
  grade INTEGER NOT NULL DEFAULT 1,
  avatar TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_children_fam ON children(family_id);

-- 3. Auth Sessions (Phiên đăng nhập - lưu SHA-256 của token)
CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  role TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_fam ON auth_sessions(family_id);

-- 4. Learning Sessions (Từng buổi học của con)
CREATE TABLE IF NOT EXISTS learning_sessions (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  child_id TEXT NULL,
  member_id TEXT NULL,
  started_at DATETIME NOT NULL,
  ended_at DATETIME NULL,
  source TEXT CHECK(source IN ('photo','type','voice','sample','teacher')),
  assignment_id TEXT NULL,
  assignment_item_id TEXT NULL,
  subject TEXT NULL,
  grade INTEGER NULL,
  problem_text TEXT NULL,
  problem_type TEXT NULL,
  method_rule_id TEXT NULL,
  steps_total INTEGER DEFAULT 0,
  steps_done INTEGER DEFAULT 0,
  stuck_count INTEGER DEFAULT 0,
  hint_level_max INTEGER DEFAULT 0,
  answer_peeks INTEGER DEFAULT 0,
  teach_back_rating TEXT CHECK(teach_back_rating IN ('self','hint','guided') OR teach_back_rating IS NULL),
  quick_rating TEXT CHECK(quick_rating IN ('ok','weak') OR quick_rating IS NULL),
  completed INTEGER DEFAULT 0,
  scope_category TEXT NULL,
  ai_latency_ms INTEGER NULL,
  ai_model TEXT NULL,
  ai_output_json TEXT NULL,
  validator_json TEXT NULL,
  meta_json TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sessions_fam_time ON learning_sessions(family_id, started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_child ON learning_sessions(child_id);

-- 5. Session Events (Dòng thời gian sự kiện trong từng buổi học)
CREATE TABLE IF NOT EXISTS session_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  ts DATETIME NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('start','step_done','stuck','hint1','hint2','answer_peek','easier','teach_back','done')),
  step INTEGER NULL
);
CREATE INDEX IF NOT EXISTS idx_events_session ON session_events(session_id);

-- 6. AI Calls (Nhật ký gọi AI đo độ trễ & lỗi, không lưu nội dung học)
CREATE TABLE IF NOT EXISTS ai_calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_id TEXT NULL,
  session_id TEXT NULL,
  endpoint TEXT NOT NULL,
  prompt_id TEXT NULL,
  latency_ms INTEGER NULL,
  ok INTEGER NOT NULL,
  error_code TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_calls_fam_time ON ai_calls(family_id, created_at);

-- 7. Login Attempts (Chống brute-force IP / tài khoản)
CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  success INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_login_attempts ON login_attempts(ip, target_type, target_id, created_at);

-- 8. Audit Log (Ghi nhận hoạt động quản trị)
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NULL,
  target_id TEXT NULL,
  details_json TEXT NULL,
  ip TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_log_time ON audit_log(created_at);

-- 9. Admin Users (Tài khoản quản trị viên)
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  pass_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('superadmin','admin','editor','support')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
