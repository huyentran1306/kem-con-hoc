-- Cập nhật bảng members để hỗ trợ các vai trò Prompt 03: owner, guardian, viewer
CREATE TABLE IF NOT EXISTS members_new (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guardian',
  pin_hash TEXT NULL,
  pin_salt TEXT NULL,
  relation TEXT NULL,
  is_active INTEGER DEFAULT 1,
  last_seen_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO members_new (id, family_id, display_name, role, pin_hash, pin_salt, relation, last_seen_at, created_at)
SELECT id, family_id, display_name, role, pin_hash, pin_salt, relation, last_seen_at, created_at FROM members;

DROP TABLE members;
ALTER TABLE members_new RENAME TO members;
CREATE INDEX IF NOT EXISTS idx_members_fam ON members(family_id);
