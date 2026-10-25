-- Migration Prompt 11: Cô nhắc (Phần B) và Phụ huynh vào lớp (Phần C)
-- Safe schema addition for D1 production

ALTER TABLE class_students ADD COLUMN child_changed_at TEXT;

ALTER TABLE announcements ADD COLUMN kind TEXT DEFAULT 'info';
ALTER TABLE announcements ADD COLUMN remind_for TEXT NULL;
ALTER TABLE announcements ADD COLUMN template_id TEXT NULL;
ALTER TABLE announcements ADD COLUMN assignment_id TEXT NULL;

ALTER TABLE announcement_reads ADD COLUMN done_at TEXT NULL;
ALTER TABLE announcement_reads ADD COLUMN done_by_member_id TEXT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_class_student_active 
ON class_students (class_id, child_id) 
WHERE child_id IS NOT NULL AND status IN ('pending', 'active');
