/**
 * LỚP HỌC CỦA CON & KẾT NỐI GIÁO VIÊN (PROMPT 04)
 * Giao diện phụ huynh kết nối con vào lớp học theo Điều 20 Nghị định 13/2023/NĐ-CP
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Check, X, ShieldAlert, LogOut, ArrowRight, Bell } from 'lucide-react';
import { toast } from './utils';

const API_BASE = 'https://ai-gateway-worker.trannth1306.workers.dev';

export function FamilyClassSheet({ token, activeChild, onClose, onOpenAssignment }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [rosterName, setRosterName] = useState('');
  const [parentConsent, setParentConsent] = useState(false);
  const [childConsent, setChildConsent] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadClasses();
  }, [token]);

  async function loadClasses() {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/family/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setClasses(data.classes || []);
      }
    } catch {
      toast('Lỗi tải danh sách lớp học', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    if (!parentConsent || !childConsent) {
      toast('Vui lòng đánh dấu cả 2 ô đồng ý theo quy định bảo vệ trẻ em', 'warn');
      return;
    }

    setJoining(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/family/classes/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: cleanCode,
          childId: activeChild?.id || 'na',
          rosterName: rosterName.trim() || activeChild?.name || 'Bé',
          consent: parentConsent,
          childConsent: childConsent,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        if (data.status === 'active') {
          toast(`Đã kết nối bé vào Lớp ${data.class?.name || ''}!`, 'success');
        } else {
          toast(`Đã gửi yêu cầu vào Lớp ${data.class?.name || ''}, đang chờ cô duyệt`, 'info');
        }
        setCode('');
        setRosterName('');
        setParentConsent(false);
        setChildConsent(false);
        loadClasses();
      } else {
        toast(data.error?.message || 'Không thể vào lớp', 'error');
      }
    } catch {
      toast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setJoining(false);
    }
  }

  async function handleLeaveClass(classStudentId, className) {
    const deleteOld = confirm(`Rời Lớp ${className}? Bấm OK nếu muốn xoá kết quả cũ của con ở lớp này.`);
    try {
      const res = await fetch(`${API_BASE}/api/v1/family/classes/${classStudentId}?deleteResults=${deleteOld ? '1' : '0'}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast(`Đã rời Lớp ${className}`, 'info');
        loadClasses();
      }
    } catch {
      toast('Lỗi rời lớp', 'error');
    }
  }

  return (
    <div style={styles.sheetContent}>
      <div style={styles.headerRow}>
        <div>
          <h3 style={styles.title}>🏫 Lớp học của con</h3>
          <p style={styles.sub}>Kết nối với cô giáo để nhận bài tập và học đúng phương pháp ở lớp</p>
        </div>
        <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
      </div>

      {/* Form Kết nối vào lớp */}
      <div style={styles.joinCard}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: 15, fontWeight: 700, color: '#1E293B' }}>
          Kết nối vào lớp mới
        </h4>

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={styles.label}>Mã lớp chung (6 ký tự) hoặc Mã học sinh riêng (XXX-XXX)</label>
            <input
              style={styles.input}
              placeholder="Ví dụ: 3A8K2M hoặc CB8-S7F"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Tên của con trong danh sách lớp</label>
            <input
              style={styles.input}
              placeholder={activeChild?.name ? `Ví dụ: ${activeChild.name}` : "Ví dụ: Trần Bảo Ngọc"}
              value={rosterName}
              onChange={(e) => setRosterName(e.target.value)}
            />
          </div>

          {/* Hai ô đồng ý bắt buộc theo Điều 20 Nghị định 13/2023/NĐ-CP */}
          <div style={styles.consentBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <ShieldAlert size={15} color="#2563EB" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF' }}>
                Tuân thủ Điều 20 Nghị định 13/2023/NĐ-CP về dữ liệu trẻ em
              </span>
            </div>

            <label style={styles.checkLabel}>
              <input
                type="checkbox"
                checked={parentConsent}
                onChange={(e) => setParentConsent(e.target.checked)}
              />
              <span>Tôi là phụ huynh, đồng ý cho con tham gia lớp và chia sẻ kết quả làm bài với giáo viên.</span>
            </label>

            <label style={styles.checkLabel}>
              <input
                type="checkbox"
                checked={childConsent}
                onChange={(e) => setChildConsent(e.target.checked)}
              />
              <span>Con đã được bố mẹ giải thích và đồng ý tham gia lớp học này cùng cô giáo.</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={joining || !parentConsent || !childConsent}
            style={{
              ...styles.primaryBtn,
              opacity: parentConsent && childConsent ? 1 : 0.6,
            }}
          >
            {joining ? 'Đang kết nối...' : 'Tham gia lớp học'}
          </button>
        </form>
      </div>

      {/* Danh sách lớp đã kết nối */}
      <h4 style={{ fontSize: 15, fontWeight: 700, margin: '20px 0 10px 0', color: '#1E293B' }}>
        Các lớp bé đang học ({classes.length})
      </h4>

      {loading ? (
        <p style={{ color: '#64748B', fontSize: 13 }}>Đang tải danh sách lớp...</p>
      ) : classes.length === 0 ? (
        <div style={styles.emptyCard}>
          <p style={{ color: '#64748B', margin: 0, fontSize: 13 }}>
            Bé chưa kết nối vào lớp nào. Hãy nhập mã do cô giáo cung cấp ở trên nhé.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {classes.map((c) => (
            <div key={c.class_student_id} style={styles.classItem}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={styles.gradeBadge}>Khối {c.grade}</span>
                  <span style={c.status === 'active' ? styles.statusActive : styles.statusPending}>
                    {c.status === 'active' ? 'Đang học' : 'Chờ cô duyệt'}
                  </span>
                </div>
                <h5 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 2px 0' }}>
                  Lớp {c.class_name} · {c.school_name}
                </h5>
                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                  Giáo viên: <strong>{c.teacher_name}</strong> · Tên con: {c.roster_name}
                </p>
              </div>

              <div>
                <button
                  style={styles.leaveBtn}
                  onClick={() => handleLeaveClass(c.class_student_id, c.class_name)}
                  title="Rời lớp học này"
                >
                  <LogOut size={14} /> Rời lớp
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  sheetContent: {
    padding: '16px 20px 32px 20px',
    fontFamily: '"Be Vietnam Pro", -apple-system, sans-serif',
    maxHeight: '85vh',
    overflowY: 'auto',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    margin: '0 0 4px 0',
    color: '#1E293B',
  },
  sub: {
    fontSize: 13,
    color: '#64748B',
    margin: 0,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  joinCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    border: '1px solid #E2E8F0',
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px',
    borderRadius: 8,
    border: '1px solid #CBD5E1',
    fontSize: 13,
    outline: 'none',
    backgroundColor: '#FFFFFF',
  },
  consentBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    border: '1px solid #BFDBFE',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 4,
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 1.4,
    cursor: 'pointer',
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 6,
  },
  classItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    border: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    padding: '2px 6px',
    borderRadius: 4,
  },
  statusActive: {
    fontSize: 11,
    fontWeight: 600,
    color: '#059669',
    backgroundColor: '#ECFDF5',
    padding: '2px 6px',
    borderRadius: 4,
  },
  statusPending: {
    fontSize: 11,
    fontWeight: 600,
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    padding: '2px 6px',
    borderRadius: 4,
  },
  leaveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    color: '#DC2626',
    border: '1px solid #FECDD3',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },
  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 24,
    textAlign: 'center',
    border: '1px solid #E2E8F0',
  },
};
