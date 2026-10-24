-- Prompt 04: Schema for Teacher Portal, Classes, Assignments, Announcements
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  phone TEXT,
  school_name TEXT,
  province TEXT,
  grades TEXT,
  status TEXT CHECK(status IN ('pending','approved','rejected','suspended')) DEFAULT 'pending',
  pass_hash TEXT NOT NULL,
  pass_salt TEXT NOT NULL,
  reviewed_by TEXT,
  reviewed_at TEXT,
  review_note TEXT,
  created_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL,
  name TEXT NOT NULL,
  school_name TEXT,
  grade INTEGER,
  school_year TEXT,
  join_code TEXT UNIQUE,
  status TEXT CHECK(status IN ('active','archived')) DEFAULT 'active',
  join_mode TEXT CHECK(join_mode IN ('code_and_claim','claim_only')) DEFAULT 'code_and_claim',
  default_due_days INTEGER DEFAULT 1,
  share_teacher_answer INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS class_students (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  roster_name TEXT NOT NULL,
  claim_code TEXT UNIQUE,
  family_id TEXT,
  child_id TEXT,
  status TEXT CHECK(status IN ('invited','pending','active','rejected','left')) DEFAULT 'invited',
  consent_at TEXT,
  child_consent_at TEXT,
  linked_by_member_id TEXT,
  reject_reason TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subject TEXT,
  due_at TEXT,
  status TEXT CHECK(status IN ('draft','published','closed')) DEFAULT 'draft',
  created_at TEXT NOT NULL,
  published_at TEXT,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assignment_items (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  problem_text TEXT NOT NULL,
  problem_type TEXT,
  teacher_method_note TEXT,
  teacher_answer TEXT,
  ai_lesson_json TEXT,
  ai_lesson_status TEXT CHECK(ai_lesson_status IN ('none','draft','approved')) DEFAULT 'none',
  validator_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assignment_results (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  class_student_id TEXT NOT NULL,
  session_id TEXT,
  status TEXT CHECK(status IN ('not_started','in_progress','done')) DEFAULT 'not_started',
  stuck_count INTEGER DEFAULT 0,
  hint_level_max INTEGER DEFAULT 0,
  teach_back_rating TEXT CHECK(teach_back_rating IN ('self','hint','guided',NULL)),
  completed_at TEXT,
  UNIQUE(item_id, class_student_id),
  FOREIGN KEY (item_id) REFERENCES assignment_items(id) ON DELETE CASCADE,
  FOREIGN KEY (class_student_id) REFERENCES class_students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teacher_method_notes (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL,
  problem_type TEXT NOT NULL,
  title TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  pinned INTEGER DEFAULT 0,
  require_ack INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcement_reads (
  announcement_id TEXT NOT NULL,
  family_id TEXT NOT NULL,
  member_id TEXT,
  read_at TEXT NOT NULL,
  ack_at TEXT,
  PRIMARY KEY(announcement_id, family_id),
  FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS content_reports (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  family_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending','reviewed','dismissed')) DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);
CREATE INDEX IF NOT EXISTS idx_teachers_status ON teachers(status);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_join_code ON classes(join_code);
CREATE INDEX IF NOT EXISTS idx_class_students_class ON class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_claim ON class_students(claim_code);
CREATE INDEX IF NOT EXISTS idx_class_students_family ON class_students(family_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignment_items_assignment ON assignment_items(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_results_item ON assignment_results(item_id);
CREATE INDEX IF NOT EXISTS idx_announcements_class ON announcements(class_id);
