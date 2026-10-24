-- PROMPT 05 MIGRATION: ADMIN STITCH, SERVER PIN LOCK, NPS RESPONSES
ALTER TABLE auth_sessions ADD COLUMN locked_at DATETIME;
ALTER TABLE admin_users ADD COLUMN pin_hash TEXT;
ALTER TABLE admin_users ADD COLUMN pin_salt TEXT;
ALTER TABLE admin_users ADD COLUMN auto_lock_mins INTEGER DEFAULT 15;

CREATE TABLE IF NOT EXISTS nps_responses (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  member_id TEXT,
  score INTEGER CHECK(score BETWEEN 0 AND 10),
  tags TEXT,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nps_created ON nps_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_nps_family ON nps_responses(family_id);
