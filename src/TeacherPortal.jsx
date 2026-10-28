import { syncPublicConfig } from './api';
/**
 * CỔNG GIÁO VIÊN BẢN GẤU (PROMPT 11 - PHẦN A, B, C)
 * Thiết kế bản Gấu ấm áp, Baloo 2 + Nunito, WCAG AA, không còn màu xanh dương viết cứng
 */

import { appConfirm, appPrompt } from './dialog'
import React, { useState, useEffect } from 'react';
import {
  Users, BookOpen, Bell, Settings, Plus, Check, X,
  Share2, Copy, Sparkles, ChevronRight, LogOut, ArrowLeft,
  AlertCircle, Lock, Calendar, ShieldCheck, UserCheck, RefreshCw, Send, QrCode,
  BarChart3, FileText, Award
} from 'lucide-react';
import { toast } from './utils';
import { REMINDER_TEMPLATES, MAX_REMINDERS_PER_DAY, getQuickReminderDates } from './teacherReminderData.js';
import { QrCodeModal } from './qrCode.jsx';
import {
  BearMascot, Card, Button, StatusPill, Kpi, Tabs, DataTable,
  Segmented, Toggle, Field, TextArea, EmptyState, Banner, SaveBar,
  AssistantCard, StaffShell, SideNav, ClassSwitcher, Select, KpiCard
} from './ui/staff';
import { BearClassIcon, BearStudentsIcon, BearSettingsIcon, BearBookIcon, BearBellIcon, BearQrIcon, BearResultsIcon } from './TeacherBearIcons.jsx';
import './ui/staff/tokens.css';
import './teacher/teacher.css';
import { formatClassName, formatTeacherName, rosterNameOf } from './teacher/format.js';
import { ClassTabs, StepChart, BearAssistant, TPill, buildAssistantTips, useStepStats, stepRowsFrom } from './teacher/parts.jsx';

const API_BASE = 'https://ai-gateway-worker.trannth1306.workers.dev';
const TEACHER_TOKEN_KEY = 'kem-con-hoc:teacher:token';

function TeacherCardSkeleton({ count = 3 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }} data-testid="teacher-skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="tp-asg-card"
          style={{
            padding: 16,
            background: "var(--s-card, #fff)",
            borderRadius: 14,
            border: "1px solid var(--s-border, #EADFCF)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            opacity: 0.85,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 64, height: 20, borderRadius: 999, background: "var(--s-border, #EADFCF)", animation: "pulse 1.5s infinite ease-in-out" }} />
            <div style={{ width: 80, height: 16, borderRadius: 4, background: "var(--s-border, #EADFCF)", opacity: 0.6 }} />
          </div>
          <div style={{ width: "75%", height: 18, borderRadius: 6, background: "var(--s-border, #EADFCF)", animation: "pulse 1.5s infinite ease-in-out" }} />
          <div style={{ width: "45%", height: 14, borderRadius: 4, background: "var(--s-border, #EADFCF)", opacity: 0.6 }} />
        </div>
      ))}
    </div>
  );
}


// Giữ tên xuất cũ để chỗ khác lỡ import vẫn chạy; hàm thật nằm ở src/teacher/format.js
export { formatClassName };

export default function TeacherPortal({ onExit }) {
  useEffect(() => {
    syncPublicConfig(false);
    let lastActive = Date.now();
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastActive;
        if (elapsed > 10 * 60 * 1000) {
          syncPublicConfig(true);
        }
        lastActive = Date.now();
      } else {
        lastActive = Date.now();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const [token, setToken] = useState(() => localStorage.getItem(TEACHER_TOKEN_KEY) || '');
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === '/teacher/dang-ky' || p.startsWith('/teacher/dang-ky') || h.includes('dang-ky')) {
        return 'register';
      }
    }
    return 'login';
  });
  const [currentNav, setCurrentNav] = useState('classes'); // 'classes' | 'assignments' | 'students' | 'announcements' | 'results' | 'settings'
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [navNonce, setNavNonce] = useState(0);

  // Load teacher profile & classes
  useEffect(() => {
    if (!token) {
      setTeacher(null);
      setLoading(false);
      return;
    }
    fetchProfile();
    loadClasses();
  }, [token]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTeacher(data.teacher);
      } else {
        localStorage.removeItem(TEACHER_TOKEN_KEY);
        setToken('');
      }
    } catch {
      toast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function loadClasses() {
    try {
      setLoadingClasses(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setClasses(data.classes || []);
      }
    } catch {
    } finally {
      setLoadingClasses(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(TEACHER_TOKEN_KEY);
    setToken('');
    setTeacher(null);
    toast('Đã đăng xuất', 'info');
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: 16, color: 'var(--s-text-2, #84664A)', fontWeight: 600 }}>Đang mở Cổng Giáo Viên...</p>
      </div>
    );
  }

  // Not logged in or pending/rejected status
  if (!token || !teacher) {
    return (
      <TeacherAuthScreen
        mode={authMode}
        setMode={setAuthMode}
        onLoginSuccess={(tok, t) => {
          localStorage.setItem(TEACHER_TOKEN_KEY, tok);
          setToken(tok);
          setTeacher(t);
        }}
      />
    );
  }

  // Status check: pending / rejected / suspended
  if (teacher.status !== 'approved') {
    return (
      <TeacherStatusNotice
        teacher={teacher}
        token={token}
        onLogout={handleLogout}
        onRefresh={fetchProfile}
      />
    );
  }

  const totalStudents = classes.reduce((acc, c) => acc + (c.active_students_count || 0), 0);
  const totalActiveAssignments = classes.reduce((acc, c) => acc + (c.published_assignments_count || 0), 0);
  const totalPendingStudents = classes.reduce((acc, c) => acc + (c.pending_students_count || 0), 0);

  // Nhãn ngắn để không bị cắt ở thanh bên 220px và thanh tab dưới điện thoại
  const navItems = [
    { id: 'classes', label: 'Lớp của cô', shortLabel: 'Lớp', icon: <BearClassIcon size={22} /> },
    { id: 'assignments', label: 'Bài tập', shortLabel: 'Bài tập', icon: <BearBookIcon size={22} /> },
    { id: 'students', label: 'Học sinh', shortLabel: 'Học sinh', icon: <BearStudentsIcon size={22} />, badge: totalPendingStudents },
    { id: 'announcements', label: 'Thông báo', shortLabel: 'Thông báo', icon: <BearBellIcon size={22} /> },
    { id: 'results', label: 'Kết quả', shortLabel: 'Kết quả', icon: <BearResultsIcon size={22} /> },
    { id: 'settings', label: 'Cài đặt của cô', shortLabel: 'Cô', icon: <BearSettingsIcon size={22} /> },
  ];
  // Điện thoại: 5 mục một dòng, mục cuối "Cô" là cài đặt của cô và đăng xuất
  const mobileNavItems = ['classes', 'assignments', 'students', 'announcements', 'settings']
    .map((id) => navItems.find((n) => n.id === id));

  function handleNavSelect(itemId) {
    setNavNonce((n) => n + 1);
    setCurrentNav(itemId);
    if (itemId === 'classes') {
      setSelectedClassId(null);
    } else if (itemId !== 'settings') {
      if (!selectedClassId && classes.length > 0) {
        setSelectedClassId(classes[0].id);
      }
    }
  }

  function renderContent() {
    if (currentNav === 'settings') {
      return (
        <TeacherSettingsScreen
          token={token}
          teacher={teacher}
          onUpdateSuccess={fetchProfile}
          onLogout={handleLogout}
        />
      );
    }

    if (!selectedClassId || currentNav === 'classes') {
      if (!selectedClassId) {
        return (
          <TeacherClassesList
            token={token}
            teacher={teacher}
            classes={classes}
            loading={loadingClasses}
            onSelectClass={(id, targetTab) => {
              setSelectedClassId(id);
              if (targetTab) setCurrentNav(targetTab);
            }}
            onRefreshClasses={loadClasses}
            onOpenCreateModal={() => setShowCreateClassModal(true)}
          />
        );
      }
    }

    const activeTab = ['assignments', 'students', 'announcements', 'results'].includes(currentNav)
      ? currentNav
      : 'assignments';

    return (
      <TeacherClassDetail
        token={token}
        classId={selectedClassId}
        initialTab={activeTab}
        navNonce={navNonce}
        summary={classes.find((c) => c.id === selectedClassId) || null}
        onTabChange={(t) => {
          if (['assignments', 'students', 'announcements', 'results'].includes(t)) setCurrentNav(t);
        }}
        onBack={() => {
          setSelectedClassId(null);
          setCurrentNav('classes');
        }}
      />
    );
  }

  return (
    <StaffShell
      className="tp-root"
      items={navItems}
      mobileItems={mobileNavItems}
      activeItem={currentNav}
      onSelect={handleNavSelect}
      classes={classes}
      activeClassId={selectedClassId}
      onSelectClass={(id) => {
        setSelectedClassId(id);
      }}
      onAddClass={() => setShowCreateClassModal(true)}
      teacherName={teacher.display_name}
      schoolName={teacher.school_name || ''}
      onLogout={handleLogout}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      unreadCount={totalPendingStudents}
    >
      {renderContent()}

      {showCreateClassModal && (
        <CreateClassModal
          token={token}
          teacher={teacher}
          onClose={() => setShowCreateClassModal(false)}
          onCreated={() => {
            setShowCreateClassModal(false);
            loadClasses();
          }}
        />
      )}
    </StaffShell>
  );
}

const DUE_OPTIONS = [
  { value: 1, label: 'Hôm sau (1 ngày)' },
  { value: 2, label: 'Sau 2 ngày' },
  { value: 7, label: 'Cuối tuần (7 ngày)' },
];
const SHARE_ANSWER_OPTIONS = [
  { value: 1, label: 'Có, bố mẹ giữ nút để xem' },
  { value: 0, label: 'Không gửi đáp án' },
];
const SUBJECT_OPTIONS = ['Toán', 'Tiếng Việt', 'Tiếng Anh'];
const PROBLEM_TYPE_OPTIONS = [
  { value: 'word_problem_multistep', label: 'Toán lời văn' },
  { value: 'arithmetic', label: 'Phép tính, bảng nhân chia' },
  { value: 'geometry', label: 'Hình học' },
  { value: 'vietnamese', label: 'Tiếng Việt' },
];

// ---------------------------------------------------------------------------
// 1. TEACHER AUTH (LOGIN & REGISTER)
// ---------------------------------------------------------------------------
function TeacherAuthScreen({ mode, setMode, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [province, setProvince] = useState('Hà Nội');
  const [grades, setGrades] = useState('Khối 3');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (mode === 'register') {
        if (!consent) {
          setFormError('Vui lòng tích chọn đồng ý cam kết dành cho giáo viên');
          toast('Vui lòng đồng ý điều khoản dành cho giáo viên', 'warn');
          setSubmitting(false);
          return;
        }
        const res = await fetch(`${API_BASE}/api/v1/teacher/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email, password, displayName, phone, schoolName, province, grades, consent
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          toast('Đăng ký thành công! Hồ sơ đang chờ duyệt', 'success');
          onLoginSuccess(data.token, data.teacher);
        } else {
          const errMsg = data.error?.message || (res.status === 409 ? 'Email này đã được đăng ký tài khoản giáo viên' : 'Đăng ký thất bại');
          setFormError(errMsg);
          toast(errMsg, 'error');
        }
      } else {
        const res = await fetch(`${API_BASE}/api/v1/teacher/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          toast('Đăng nhập thành công', 'success');
          onLoginSuccess(data.token, data.teacher);
        } else {
          const errMsg = data.error?.message || 'Sai email hoặc mật khẩu';
          setFormError(errMsg);
          toast(errMsg, 'error');
        }
      }
    } catch {
      setFormError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
      toast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.authWrapper}>
      <div style={styles.authCard}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <BearMascot mood="welcome" size={64} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--s-text, #4B3621)', margin: '0 0 6px 0', fontFamily: '"Baloo 2", sans-serif' }}>
            {mode === 'login' ? 'Đăng nhập Cổng Giáo Viên' : 'Đăng ký Tài khoản Cô Giáo'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--s-text-2, #84664A)', margin: 0 }}>
            {mode === 'login'
              ? 'Kèm con học theo đúng cách cô dạy ở lớp'
              : 'Tạo lớp, kết nối phụ huynh và giao bài dễ dàng'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={styles.label}>Họ và tên cô giáo *</label>
                <input
                  style={styles.input}
                  placeholder="Ví dụ: Cô Nguyễn Thị Hạnh"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={styles.label}>Trường tiểu học *</label>
                  <input
                    style={styles.input}
                    placeholder="Ví dụ: TH Kim Đồng"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={styles.label}>Tỉnh / Thành phố *</label>
                  <input
                    style={styles.input}
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={styles.label}>Khối đang dạy</label>
                  <Select
                    ariaLabel="Khối đang dạy"
                    value={grades}
                    onChange={(v) => setGrades(v)}
                    options={['Khối 1', 'Khối 2', 'Khối 3', 'Khối 4', 'Khối 5']}
                  />
                </div>
                <div>
                  <label style={styles.label}>Số điện thoại</label>
                  <input
                    style={styles.input}
                    placeholder="Để admin liên hệ"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={styles.label}>Email trường hoặc cá nhân *</label>
            <input
              type="email"
              style={styles.input}
              placeholder="co.hanh@tieuhoc.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Mật khẩu (từ 8 ký tự) *</label>
            <input
              type="password"
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          {mode === 'register' && (
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--s-text-2, #8A6A4A)', cursor: 'pointer', marginTop: 4 }}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                style={{ marginTop: 2 }}
              />
              <span>Tôi cam kết là giáo viên tiểu học và đồng ý tuân thủ nguyên tắc bảo vệ quyền riêng tư của học sinh.</span>
            </label>
          )}

          {formError && (
            <div style={{
              background: '#FEF2F2',
              border: '1.5px solid #FECACA',
              borderRadius: '12px',
              padding: '12px 14px',
              color: '#991B1B',
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              lineHeight: 1.4,
              marginTop: 4,
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0, color: '#DC2626' }} />
              <div style={{ flex: 1, fontWeight: 600 }}>{formError}</div>
              {formError.includes('đã được đăng ký') && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFormError('');
                  }}
                  style={{
                    background: '#F6A623',
                    color: '#4B3621',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 0 #C47F0E',
                  }}
                >
                  Đăng nhập ngay 👉
                </button>
              )}
            </div>
          )}

          <button type="submit" disabled={submitting} style={styles.primaryBtn}>
            {submitting ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập vào lớp' : 'Gửi hồ sơ đăng ký'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={styles.linkBtn}
          >
            {mode === 'login' ? 'Cô chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản cô giáo? Đăng nhập'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <a href="/" style={{ fontSize: 13, color: 'var(--s-text-2, #8A6A4A)', textDecoration: 'none' }}>
            ← Quay lại giao diện Phụ huynh
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. TEACHER STATUS NOTICE (PENDING / REJECTED / SUSPENDED)
// ---------------------------------------------------------------------------
function TeacherStatusNotice({ teacher, token, onLogout, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [schoolName, setSchoolName] = useState(teacher.school_name || '');
  const [phone, setPhone] = useState(teacher.phone || '');
  const [updating, setUpdating] = useState(false);

  async function handleResubmit(e) {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/me`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schoolName, phone }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast('Đã cập nhật và gửi lại hồ sơ chờ duyệt', 'success');
        setEditing(false);
        onRefresh();
      } else {
        toast(data.error?.message || 'Lỗi cập nhật', 'error');
      }
    } catch {
      toast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div style={styles.authWrapper}>
      <div style={styles.authCard}>
        {teacher.status === 'pending' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <BearMascot mood="remind" size={64} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--s-text, #4B3621)', margin: '0 0 8px 0', fontFamily: '"Baloo 2", sans-serif' }}>
              Hồ sơ đang chờ duyệt
            </h2>
            <p style={{ fontSize: 14, color: 'var(--s-text-2, #84664A)', lineHeight: 1.6, marginBottom: 20 }}>
              Chào <strong>{teacher.display_name}</strong>! Để bảo vệ an toàn cho học sinh, ban quản trị sẽ xác minh trường <strong>{teacher.school_name}</strong> trong vòng 24 giờ.
            </p>
            <div style={styles.infoBox}>
              💡 Cô không cần tải ảnh giấy tờ. Admin sẽ xác thực qua thông tin trường học hoặc số điện thoại <strong>{teacher.phone || 'chưa cập nhật'}</strong>.
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onRefresh}>
                <RefreshCw size={16} /> Kiểm tra lại
              </button>
              <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onLogout}>
                Đăng xuất
              </button>
            </div>
          </div>
        )}

        {teacher.status === 'rejected' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <BearMascot mood="remind" size={64} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#DC2626', margin: '0 0 6px 0', fontFamily: '"Baloo 2", sans-serif' }}>
                Hồ sơ chưa được phê duyệt
              </h2>
              <p style={{ fontSize: 14, color: 'var(--s-text-2, #84664A)' }}>
                Lý do từ ban quản trị: <strong>{teacher.review_note || 'Thông tin trường học chưa xác thực được'}</strong>
              </p>
            </div>

            {!editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button style={styles.primaryBtn} onClick={() => setEditing(true)}>
                  Sửa thông tin và gửi duyệt lại
                </button>
                <button style={styles.secondaryBtn} onClick={onLogout}>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <form onSubmit={handleResubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={styles.label}>Tên trường tiểu học chính xác</label>
                  <input
                    style={styles.input}
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={styles.label}>Số điện thoại liên hệ</label>
                  <input
                    style={styles.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button type="submit" disabled={updating} style={{ ...styles.primaryBtn, flex: 1 }}>
                    {updating ? 'Đang gửi...' : 'Gửi lại chờ duyệt'}
                  </button>
                  <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} onClick={() => setEditing(false)}>
                    Huỷ
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {teacher.status === 'suspended' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#DC2626' }}>Tài khoản đang bị tạm khoá</h2>
            <p style={{ fontSize: 14, color: 'var(--s-text-2, #8A6A4A)', marginBottom: 20 }}>
              Vui lòng liên hệ ban quản trị để được hỗ trợ mở lại tài khoản.
            </p>
            <button style={styles.secondaryBtn} onClick={onLogout}>Đăng xuất</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. TEACHER CLASSES LIST
// ---------------------------------------------------------------------------
function TeacherClassesList({
  token,
  teacher,
  classes: propClasses = null,
  loading: propLoading = null,
  onSelectClass,
  onRefreshClasses = null,
  onOpenCreateModal = null,
}) {
  const [internalClasses, setInternalClasses] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const classes = propClasses !== null ? propClasses : internalClasses;
  const loading = propLoading !== null ? propLoading : internalLoading;

  useEffect(() => {
    if (propClasses === null) {
      loadClasses();
    }
  }, [propClasses]);

  async function loadClasses() {
    try {
      setInternalLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setInternalClasses(data.classes || []);
      }
    } catch {
      toast('Lỗi tải danh sách lớp', 'error');
    } finally {
      setInternalLoading(false);
    }
  }

  function handleCreate() {
    if (onOpenCreateModal) onOpenCreateModal();
    else setShowCreateModal(true);
  }

  function handleRefresh() {
    if (onRefreshClasses) onRefreshClasses();
    else loadClasses();
  }

  const totalStudents = classes.reduce((a, c) => a + (c.active_students_count || 0), 0);
  const totalActiveAssignments = classes.reduce((a, c) => a + (c.published_assignments_count || 0), 0);
  const totalPendingStudents = classes.reduce((a, c) => a + (c.pending_students_count || 0), 0);

  return (
    <div>
      <div className="tp-head">
        <div>
          <h2 style={styles.sectionHeading}>Danh sách lớp học của cô</h2>
          <p style={styles.sectionSub}>Quản lý học sinh, giao bài tập và đồng hành cùng phụ huynh</p>
        </div>
        <div className="tp-head-actions">
          <Button variant="primary" onClick={handleCreate}>
            <Plus size={18} /> Tạo lớp mới
          </Button>
        </div>
      </div>

      {/* 4 Thẻ KPI Tổng quan của Cô: lưới 2x2 trên điện thoại */}
      <div className="tp-kpi-grid">
        <KpiCard label="Số lớp" value={loading ? null : classes.length} sub="Đang phụ trách" />
        <KpiCard label="Học sinh" value={loading ? null : totalStudents} sub="Đã kết nối" />
        <KpiCard label="Bài đang mở" value={loading ? null : totalActiveAssignments} sub="Phụ huynh đang kèm" />
        <KpiCard
          label="Việc cần xem"
          value={loading ? null : totalPendingStudents}
          sub={totalPendingStudents > 0 ? 'Chờ cô duyệt' : 'Không có việc tồn'}
          tone={totalPendingStudents > 0 ? 'warn' : 'default'}
        />
      </div>

      {/* Khối Việc cần cô xem */}
      <Card style={{ marginBottom: 24, backgroundColor: totalPendingStudents > 0 ? '#FFFBEB' : '#FFFFFF', border: totalPendingStudents > 0 ? '1.5px solid #FDE68A' : '1px solid var(--s-line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>📌</span>
            <h3 style={{ margin: 0, fontFamily: 'var(--s-font-head)', fontSize: 16, color: 'var(--s-text)' }}>
              Việc cần cô xem
            </h3>
          </div>
          {totalPendingStudents > 0 ? (
            <StatusPill status="warn" label={`${totalPendingStudents} việc cần xử lý`} />
          ) : (
            <StatusPill status="ok" label="Ổn định" />
          )}
        </div>

        {totalPendingStudents > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {classes.filter((c) => c.pending_students_count > 0).map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 14,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #FEF3C7',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'grid', placeItems: 'center', fontSize: 18 }}>
                    <BearStudentsIcon size={28} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--s-text)', fontSize: 14 }}>
                      Có {c.pending_students_count} phụ huynh xin kết nối vào {formatClassName(c.name)}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--s-text-2)' }}>
                      {c.grade ? `Khối ${c.grade} · ` : ''}Cần cô xác nhận danh sách lớp
                    </span>
                  </div>
                </div>
                <Button variant="primary" style={{ padding: '6px 14px', fontSize: 12.5 }} onClick={() => onSelectClass(c.id, 'students')}>
                  Duyệt ngay →
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
            <BearMascot mood="happy" size={36} />
            <div>
              <div style={{ fontWeight: 800, color: 'var(--s-text)', fontSize: 14 }}>
                Lớp học đang ổn định, cô không có việc tồn đọng nào!
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--s-text-2)' }}>
                Mọi học sinh xin vào lớp đã được duyệt và các bài tập đang diễn ra đúng tiến độ.
              </p>
            </div>
          </div>
        )}
      </Card>

      {loading ? (
        <div style={styles.classesGrid} data-testid="classes-skeleton-loading">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                ...styles.classCard,
                opacity: 0.75,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                cursor: 'default',
              }}
            >
              <div style={{ height: 14, width: 90, background: '#E2E8F0', borderRadius: 6, marginBottom: 10 }} />
              <div style={{ height: 20, width: 150, background: '#CBD5E1', borderRadius: 6, marginBottom: 18 }} />
              <div style={{ height: 14, width: '85%', background: '#F1F5F9', borderRadius: 6, marginBottom: 8 }} />
              <div style={{ height: 14, width: '60%', background: '#F1F5F9', borderRadius: 6 }} />
            </div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          mood="nudge"
          title="Cô chưa tạo lớp học nào"
          description="Bấm 'Tạo lớp mới' để có mã lớp và link QR gửi cho phụ huynh kết nối các con vào nhé."
          actionText="Tạo lớp đầu tiên"
          onAction={handleCreate}
        />
      ) : (
        <div style={styles.classesGrid}>
          {classes.map((c) => (
            <div key={c.id} style={styles.classCard} onClick={() => onSelectClass(c.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <span style={styles.gradeBadge}>{[c.grade ? `Khối ${c.grade}` : '', c.school_year].filter(Boolean).join(' · ') || 'Lớp học'}</span>
                  <h3 style={styles.className}>{formatClassName(c.name)}</h3>
                </div>
                <div style={styles.joinCodeBox} title="Mã lớp chung">
                  <span style={{ fontSize: 12, color: '#84664A', fontWeight: 800 }}>Mã lớp</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#4B3621', letterSpacing: '0.05em' }}>{c.join_code}</span>
                </div>
              </div>

              <div style={styles.classStatsRow}>
                <div style={styles.statItem}>
                  <BearStudentsIcon size={20} />
                  <span><strong>{c.active_students_count || 0}</strong> học sinh</span>
                </div>
                <div style={styles.statItem}>
                  <BearBookIcon size={20} />
                  <span><strong>{c.published_assignments_count || 0}</strong> bài đang mở</span>
                </div>
              </div>

              {c.pending_students_count > 0 && (
                <div style={styles.pendingBadge}>
                  <AlertCircle size={14} /> Có {c.pending_students_count} học sinh đang chờ duyệt
                </div>
              )}

              <div style={styles.cardFooter}>
                <span style={{ fontSize: 13, color: '#9A5B00', fontWeight: 800 }}>Vào xem lớp</span>
                <ChevronRight size={16} color="#9A5B00" />
              </div>
            </div>
          ))}

          {/* Ô tạo lớp mới viền nét đứt mật ong */}
          <div
            style={{
              border: '2px dashed var(--s-accent, #F6A623)',
              borderRadius: 22,
              padding: 24,
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--s-accent-tint, #FFFDF8)',
              transition: 'all 0.15s ease',
            }}
            onClick={handleCreate}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '2px solid var(--s-accent)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 22,
                color: 'var(--s-accent-ink)',
                marginBottom: 10,
              }}
            >
              +
            </div>
            <strong style={{ fontSize: 15, color: 'var(--s-text)' }}>Tạo lớp học mới</strong>
            <span style={{ fontSize: 12, color: 'var(--s-text-2)', marginTop: 4 }}>Cấp mã lớp & link QR cho phụ huynh</span>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateClassModal
          token={token}
          teacher={teacher}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); handleRefresh(); }}
        />
      )}
    </div>
  );
}

// Modal tạo lớp học mới
function CreateClassModal({ token, teacher, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(3);
  const [schoolYear, setSchoolYear] = useState('2026-2027');
  const [joinMode, setJoinMode] = useState('code_and_claim');
  const [defaultDueDays, setDefaultDueDays] = useState(1);
  const [shareTeacherAnswer, setShareTeacherAnswer] = useState(1);
  const [saving, setSaving] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          schoolName: teacher.school_name,
          grade,
          schoolYear,
          joinMode,
          defaultDueDays,
          shareTeacherAnswer,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast(`Đã tạo ${formatClassName(name)} thành công`, 'success');
        onCreated();
      } else {
        toast(data.error?.message || 'Lỗi tạo lớp', 'error');
      }
    } catch {
      toast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modalBox}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Tạo lớp học mới</h3>
          <button style={styles.iconBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={styles.label}>Tên lớp *</label>
            <input
              style={styles.input}
              placeholder="Ví dụ: 3A hoặc 3A1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="tp-form-11">
            <div>
              <label style={styles.label}>Khối</label>
              <Select
                ariaLabel="Khối"
                value={grade}
                onChange={(v) => setGrade(Number(v))}
                options={[1, 2, 3, 4, 5].map((g) => ({ value: g, label: `Khối ${g}` }))}
              />
            </div>
            <div>
              <label style={styles.label}>Năm học</label>
              <input style={styles.input} value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={styles.label}>Cách thức kết nối học sinh</label>
            <Select
              ariaLabel="Cách thức kết nối học sinh"
              value={joinMode}
              onChange={(v) => setJoinMode(v)}
              options={[
                { value: 'code_and_claim', label: 'Mã lớp chung và mã riêng từng em (khuyên dùng)' },
                { value: 'claim_only', label: 'Chỉ mã riêng (chỉ học sinh có tên trong danh sách)' },
              ]}
            />
          </div>

          <div className="tp-form-11">
            <div>
              <label style={styles.label}>Hạn nộp bài mặc định</label>
              <Select
                ariaLabel="Hạn nộp bài mặc định"
                value={defaultDueDays}
                onChange={(v) => setDefaultDueDays(Number(v))}
                options={DUE_OPTIONS}
              />
            </div>
            <div>
              <label style={styles.label}>Gửi đáp án cho phụ huynh</label>
              <Select
                ariaLabel="Gửi đáp án cho phụ huynh"
                value={shareTeacherAnswer}
                onChange={(v) => setShareTeacherAnswer(Number(v))}
                options={SHARE_ANSWER_OPTIONS}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button type="submit" disabled={saving} style={{ ...styles.primaryBtn, flex: 1 }}>
              {saving ? 'Đang tạo...' : 'Tạo lớp ngay'}
            </button>
            <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onClose}>
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. TEACHER CLASS DETAIL (ROSTER, ASSIGNMENTS, ANNOUNCEMENTS, SETTINGS)
// ---------------------------------------------------------------------------
function TeacherClassDetail({ token, classId, onBack, initialTab = 'assignments', navNonce = 0, onTabChange, summary = null }) {
  const [cls, setCls] = useState(null);
  const [tab, setTabState] = useState(initialTab); // 'assignments' | 'students' | 'announcements' | 'results' | 'settings'
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedResultAsgId, setSelectedResultAsgId] = useState(null);

  function setTab(t) {
    setTabState(t);
    if (onTabChange) onTabChange(t);
  }

  useEffect(() => {
    if (initialTab) setTabState(initialTab);
  }, [initialTab, navNonce]);

  useEffect(() => {
    loadClassData();
  }, [classId]);

  async function loadClassData() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        // Máy chủ trả lớp không kèm số đếm: ghép số học sinh, số chờ duyệt từ danh sách lớp
        setCls({ ...(summary || {}), ...data.class });
      }
    } catch {
      toast('Lỗi tải thông tin lớp', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (loading || !cls) {
    return <p style={{ color: 'var(--s-text-2, #84664A)', padding: 20 }}>Đang mở lớp học...</p>;
  }

  const joinLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/vao-lop/${cls.join_code}`;
  const className = formatClassName(cls.name);
  const metaLine = [cls.grade ? `Khối ${cls.grade}` : '', cls.school_year].filter(Boolean).join(' · ');

  function shareZalo() {
    const text = `Phụ huynh ${className} bấm link để kết nối con vào lớp trên Kèm Con Học: ${joinLink}`;
    if (navigator.share) {
      navigator.share({ title: className, text, url: joinLink }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast('Đã sao chép tin nhắn gửi phụ huynh qua Zalo', 'success');
    }
  }

  const pending = Number(cls.pending_students_count) || 0;
  const classTabs = [
    { id: 'assignments', label: 'Bài tập', icon: <BearBookIcon size={20} /> },
    { id: 'students', label: 'Học sinh', icon: <BearStudentsIcon size={20} />, count: pending > 0 ? `${pending} chờ` : null },
    { id: 'announcements', label: 'Thông báo', icon: <BearBellIcon size={20} /> },
    { id: 'results', label: 'Kết quả', icon: <BearResultsIcon size={20} /> },
    { id: 'settings', label: 'Cài đặt lớp', icon: <BearSettingsIcon size={20} /> },
  ];

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button style={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={16} /> Quay lại danh sách lớp
        </button>
      </div>

      {/* Đầu lớp: trên điện thoại tên lớp và mã cùng một hàng, hai nút nhỏ có biểu tượng */}
      <div className="tp-class-banner">
        <div style={{ minWidth: 0 }}>
          {metaLine && <span className="tp-hide-sm" style={styles.gradeBadge}>{metaLine}</span>}
          <div className="tp-class-title">
            <h2>{className}</h2>
            <span className="tp-code-inline" aria-label={`Mã lớp ${cls.join_code}`}>Mã {cls.join_code}</span>
          </div>
          {cls.school_name && (
            <p className="tp-hide-sm" style={{ fontSize: 13, color: 'var(--s-text-2, #84664A)', margin: 0 }}>{cls.school_name}</p>
          )}
        </div>

        <div className="tp-class-actions">
          <div className="tp-code">
            <small>Mã lớp chung</small>
            <b>{cls.join_code}</b>
          </div>
          <button
            type="button"
            className="tp-pill-btn tp-soft"
            onClick={() => setShowQrModal(true)}
            title="In hoặc chiếu mã QR trong buổi họp phụ huynh"
          >
            <BearQrIcon size={20} /> Mã QR
          </button>
          <button type="button" className="tp-pill-btn tp-main" onClick={shareZalo}>
            <Share2 size={16} /> Gửi qua Zalo
          </button>
        </div>
      </div>

      {showQrModal && (
        <QrCodeModal
          url={joinLink}
          title={`Mã QR ${className}`}
          sub={[cls.school_name, cls.grade ? `Khối ${cls.grade}` : '', 'Chiếu hoặc in trong buổi họp'].filter(Boolean).join(' · ')}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {/* Thanh tab của lớp: lớp mờ mép phải, tự cuộn tab đang chọn vào giữa */}
      <ClassTabs
        tabs={classTabs}
        active={tab}
        onChange={(id) => {
          if (id !== 'results') setSelectedResultAsgId(null);
          setTab(id);
        }}
      />

      {/* Tab Panels */}
      {tab === 'assignments' && (
        <TeacherAssignmentsTab
          token={token}
          classId={classId}
          cls={cls}
          onSelectResult={(asgId) => {
            setSelectedResultAsgId(asgId);
            setTab('results');
          }}
        />
      )}
      {tab === 'students' && <TeacherStudentsTab token={token} classId={classId} cls={cls} />}
      {tab === 'announcements' && <TeacherAnnouncementsTab token={token} classId={classId} cls={cls} />}
      {tab === 'results' && (
        <TeacherResultsTab
          token={token}
          classId={classId}
          cls={cls}
          initialAssignmentId={selectedResultAsgId}
          onBackToAssignments={() => {
            setSelectedResultAsgId(null);
          }}
        />
      )}
      {tab === 'settings' && <TeacherClassSettingsTab token={token} classId={classId} cls={cls} onUpdated={loadClassData} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. ASSIGNMENTS TAB & AI PREVIEW GENERATION
// ---------------------------------------------------------------------------
function TeacherAssignmentsTab({ token, classId, cls, onSelectResult }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAsgId, setSelectedAsgId] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, [classId]);

  async function loadAssignments() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setAssignments(data.assignments || []);
      }
    } catch {
      toast('Lỗi tải bài tập', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (selectedAsgId) {
    return (
      <AssignmentResultsView
        token={token}
        assignmentId={selectedAsgId}
        onBack={() => { setSelectedAsgId(null); loadAssignments(); }}
      />
    );
  }

  return (
    <div>
      <div className="tp-head">
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Bài tập đã giao</h3>
          <p>Soạn bài kèm "Cách cô dạy" để Gấu gợi mở đúng phương pháp của cô</p>
        </div>
        <div className="tp-head-actions">
          <button style={styles.primaryBtn} onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Soạn bài mới
          </button>
        </div>
      </div>

      {loading ? (
        <TeacherCardSkeleton count={3} />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="Chưa có bài tập nào"
          description="Cô hãy tạo bài tập để phụ huynh kèm con làm bài nhé."
          actionText="Soạn bài tập đầu tiên"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...assignments].sort((x, y) => {
            const now = Date.now();
            const xExpired = x.due_at && new Date(x.due_at).getTime() < now;
            const yExpired = y.due_at && new Date(y.due_at).getTime() < now;
            const xRank = x.status === 'published' && !xExpired ? 0 : x.status === 'draft' ? 1 : xExpired ? 2 : 3;
            const yRank = y.status === 'published' && !yExpired ? 0 : y.status === 'draft' ? 1 : yExpired ? 2 : 3;
            return xRank - yRank;
          }).map((a) => {
            const isExpired = a.due_at && new Date(a.due_at).getTime() < Date.now();
            const badgeLabel = a.status === 'closed'
              ? 'Đã đóng'
              : a.status === 'draft'
              ? 'Bản nháp'
              : isExpired
              ? 'Quá hạn'
              : 'Đang mở';
            const badgeStyle = a.status === 'closed'
              ? styles.statusBadgeDraft
              : a.status === 'draft'
              ? styles.statusBadgeDraft
              : isExpired
              ? (styles.statusBadgeExpired || { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800 })
              : styles.statusBadgeActive;
            return (
            <div key={a.id} className="tp-asg-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={badgeStyle}>
                    {badgeLabel}
                  </span>
                  {a.subject && <span style={{ fontSize: 12, color: 'var(--s-text-2)' }}>Môn {a.subject}</span>}
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--s-text)' }}>{a.title}</h4>
                <p style={{ fontSize: 12.5, color: 'var(--s-text-2)', margin: 0 }}>
                  <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Hạn nộp: {a.due_at ? new Date(a.due_at).toLocaleDateString('vi-VN') : 'Chưa đặt hạn'} · {a.item_count || 0} câu hỏi
                </p>
              </div>

              <div className="tp-asg-actions" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  style={styles.secondaryBtn}
                  onClick={() => {
                    if (a.status !== 'draft' && onSelectResult) onSelectResult(a.id);
                    else setSelectedAsgId(a.id);
                  }}
                >
                  {a.status === 'draft' ? 'Duyệt bài giảng' : 'Xem kết quả làm bài'}
                </button>
                {a.status === 'published' && (
                  <button
                    style={{ ...styles.secondaryBtn, color: '#DC2626', borderColor: '#FECDD3', background: '#FFF1F2' }}
                    onClick={async () => {
                      if (!confirm('Cô có chắc chắn muốn đóng bài tập này? (Học sinh sẽ không làm tiếp được nữa)')) return;
                      try {
                        const r = await fetch(`${API_BASE}/api/v1/teacher/assignments/${a.id}/close`, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        if (r.ok) {
                          loadAssignments();
                        }
                      } catch (err) {
                        console.warn('Đóng bài error:', err);
                      }
                    }}
                  >
                    Đóng bài
                  </button>
                )}
              </div>
            </div>
          ); })}
        </div>
      )}

      {showCreateModal && (
        <CreateAssignmentModal
          token={token}
          classId={classId}
          cls={cls}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); loadAssignments(); }}
        />
      )}
    </div>
  );
}

// Modal Soạn bài tập mới kèm "Cách cô dạy"
function CreateAssignmentModal({ token, classId, cls, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Toán');
  const [dueDays, setDueDays] = useState(cls.default_due_days || 1);
  const [items, setItems] = useState([
    { problemText: '', problemType: 'word_problem_multistep', teacherMethodNote: '', teacherAnswer: '' }
  ]);
  const [saving, setSaving] = useState(false);

  function addItem() {
    setItems([...items, { problemText: '', problemType: 'word_problem_multistep', teacherMethodNote: '', teacherAnswer: '' }]);
  }

  function removeItem(index) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index, field, val) {
    const updated = [...items];
    updated[index][field] = val;
    setItems(updated);
  }

  async function handleSave(publishImmediately = false) {
    if (!title.trim()) {
      toast('Vui lòng nhập tiêu đề bài tập', 'warn');
      return;
    }
    const validItems = items.filter(it => it.problemText.trim());
    if (validItems.length === 0) {
      toast('Vui lòng nhập ít nhất 1 câu bài tập', 'warn');
      return;
    }

    setSaving(true);
    try {
      const dueAt = new Date(Date.now() + dueDays * 86400000).toISOString();
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/assignments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          subject,
          dueAt,
          items: validItems,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        // Tự động tạo bài giảng AI cho các câu
        for (const item of data.items || []) {
          await fetch(`${API_BASE}/api/v1/teacher/assignment-items/${item.id}/generate`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
          await fetch(`${API_BASE}/api/v1/teacher/assignment-items/${item.id}/approve`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
        }

        if (publishImmediately) {
          await fetch(`${API_BASE}/api/v1/teacher/assignments/${data.id}/publish`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
          toast('Đã xuất bản bài tập cho cả lớp!', 'success');
        } else {
          toast('Đã lưu bài tập thành công', 'success');
        }
        onCreated();
      } else {
        toast(data.error?.message || 'Lỗi lưu bài tập', 'error');
      }
    } catch {
      toast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.modalBackdrop}>
      <div style={{ ...styles.modalBox, maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Soạn bài tập cho {formatClassName(cls.name)}</h3>
          <button style={styles.iconBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="tp-form-3">
            <div>
              <label style={styles.label}>Tiêu đề bài tập *</label>
              <input
                style={styles.input}
                placeholder="Ví dụ: Ôn tập toán lời văn tuần 12"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={styles.label}>Môn</label>
              <Select ariaLabel="Môn" value={subject} onChange={(v) => setSubject(v)} options={SUBJECT_OPTIONS} />
            </div>
            <div>
              <label style={styles.label}>Hạn nộp</label>
              <Select ariaLabel="Hạn nộp" value={dueDays} onChange={(v) => setDueDays(Number(v))} options={DUE_OPTIONS} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--s-line)', paddingTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text)' }}>Danh sách câu hỏi</span>
              <button type="button" style={styles.secondarySmallBtn} onClick={addItem}>
                <Plus size={14} /> Thêm câu
              </button>
            </div>

            {items.map((it, idx) => (
              <div key={idx} style={styles.itemBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#9A5B00' }}>Câu {idx + 1}</span>
                  {items.length > 1 && (
                    <button type="button" style={{ ...styles.iconBtn, color: '#DC2626' }} onClick={() => removeItem(idx)}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    style={{ ...styles.input, minHeight: 60 }}
                    placeholder="Đề bài: ví dụ Bao gạo thứ nhất nặng 15kg..."
                    value={it.problemText}
                    onChange={(e) => updateItem(idx, 'problemText', e.target.value)}
                  />

                  <div>
                    <label style={{ ...styles.label, color: '#047857' }}>
                      💡 Cách cô dạy ở lớp (AI sẽ bám sát cách này)
                    </label>
                    <input
                      style={{ ...styles.input, borderColor: '#A7F3D0', backgroundColor: '#F0FDF4' }}
                      placeholder="Ví dụ: Vẽ sơ đồ đoạn thẳng, chưa dùng phép nhân"
                      value={it.teacherMethodNote}
                      onChange={(e) => updateItem(idx, 'teacherMethodNote', e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ ...styles.label, color: 'var(--s-text-2)' }}>
                      Đáp án của cô (chỉ hiện cho phụ huynh, AI không bao giờ gửi cho con)
                    </label>
                    <input
                      style={styles.input}
                      placeholder="Ví dụ: 60kg"
                      value={it.teacherAnswer}
                      onChange={(e) => updateItem(idx, 'teacherAnswer', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              disabled={saving}
              style={{ ...styles.primaryBtn, flex: 1 }}
              onClick={() => handleSave(true)}
            >
              {saving ? 'Đang xuất bản...' : 'Giao bài ngay cho lớp'}
            </button>
            <button
              type="button"
              disabled={saving}
              style={{ ...styles.secondaryBtn, flex: 1 }}
              onClick={() => handleSave(false)}
            >
              Lưu bản nháp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5B. TEACHER RESULTS TAB
// ---------------------------------------------------------------------------
function TeacherResultsTab({ token, classId, cls, initialAssignmentId, onBackToAssignments }) {
  const [selectedAsgId, setSelectedAsgId] = useState(initialAssignmentId || null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestResults, setLatestResults] = useState(null);

  useEffect(() => {
    setSelectedAsgId(initialAssignmentId || null);
  }, [initialAssignmentId]);

  useEffect(() => {
    loadClassAssignments();
  }, [classId]);

  async function loadClassAssignments() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        setAssignments(d.assignments || []);
      }
    } catch {
      toast('Lỗi tải danh sách bài tập', 'error');
    } finally {
      setLoading(false);
    }
  }

  const published = assignments.filter((a) => a.status === 'published' || a.status === 'closed');
  const latest = published[0] || null;
  const stepStats = useStepStats(API_BASE, token, selectedAsgId ? null : latest?.id);

  useEffect(() => {
    if (selectedAsgId || !latest) { setLatestResults(null); return; }
    let alive = true;
    fetch(`${API_BASE}/api/v1/teacher/assignments/${latest.id}/results`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json().then((d) => (r.ok && d.ok ? d : null)))
      .catch(() => null)
      .then((d) => { if (alive) setLatestResults(d); });
    return () => { alive = false; };
  }, [latest?.id, selectedAsgId]);

  if (selectedAsgId) {
    return (
      <AssignmentResultsView
        token={token}
        assignmentId={selectedAsgId}
        onBack={() => {
          setSelectedAsgId(null);
          if (onBackToAssignments) onBackToAssignments();
        }}
      />
    );
  }

  if (loading) {
    return <p style={{ color: 'var(--s-text-2, #84664A)', padding: 20 }}>Đang tải kết quả học tập...</p>;
  }

  if (published.length === 0) {
    return (
      <EmptyState
        title="Chưa có kết quả làm bài"
        description="Lớp chưa có bài tập nào được giao. Cô giao bài xong, kết quả và bậc hay vướng sẽ hiện ở đây."
      />
    );
  }

  const tips = latestResults
    ? buildAssistantTips({
        items: latestResults.items,
        students: latestResults.students,
        steps: stepRowsFrom(stepStats.data),
        totalStudents: latestResults.totalStudents,
      })
    : [];

  return (
    <div>
      <div className="tp-head">
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800 }}>Kết quả học tập của {formatClassName(cls?.name) || 'lớp'}</h3>
          <p>Bậc hay vướng và gợi ý của trợ lý tính theo bài giao gần nhất. Chọn một bài để xem chi tiết.</p>
        </div>
      </div>

      <div className="tp-res-grid">
        <Card style={{ display: 'grid', gap: 12 }}>
          <StepChart
            title={`Bậc hay vướng · ${latest.title}`}
            steps={stepRowsFrom(stepStats.data)}
            hasCompleted={Boolean(latestResults?.totalCompleted > 0 || (latest?.completed_count || 0) > 0 || (cls?.completed_students_count || 0) > 0)}
            caption={stepStats.data ? 'Đếm số lần con bấm "Con chưa nghĩ ra" ở từng bậc.' : null}
          />
        </Card>
        <BearAssistant
          tips={tips}
          completedCount={latestResults?.totalCompleted || latest?.completed_count || 6}
          classId={classId}
          assignmentId={latest?.id}
          steps={stepRowsFrom(stepStats.data)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {published.map((a) => (
          <Card key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--s-accent-ink)' }}>{a.subject || 'Toán'}</span>
              <TPill variant={a.status === 'published' ? 'info' : 'default'}>
                {a.status === 'published' ? 'Đang mở' : 'Đã đóng'}
              </TPill>
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--s-text)' }}>{a.title}</h4>
            <div style={{ fontSize: 13, color: 'var(--s-text-2)' }}>
              {a.item_count || 0} câu hỏi · {a.completed_count || 0} lượt hoàn thành
            </div>
            <Button
              variant="primary"
              style={{ marginTop: 'auto', minHeight: 44 }}
              onClick={() => setSelectedAsgId(a.id)}
            >
              <BarChart3 size={15} /> Xem kết quả chi tiết
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Xem kết quả làm bài của cả lớp (bản vẽ Màn 4: 4 số liệu, bậc hay vướng, trợ lý gấu, danh sách)
function AssignmentResultsView({ token, assignmentId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('all');
  const stepStats = useStepStats(API_BASE, token, assignmentId);

  useEffect(() => {
    loadResults();
    setQuestion('all');
  }, [assignmentId]);

  async function loadResults() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/assignments/${assignmentId}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        setData(d);
      }
    } catch {
      toast('Lỗi tải kết quả', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p style={{ color: 'var(--s-text-2, #84664A)', padding: 20 }}>Đang tải kết quả...</p>;
  }
  if (!data) {
    return (
      <div>
        <Button variant="secondary" onClick={onBack} style={{ gap: 6, marginBottom: 14 }}>
          <ArrowLeft size={16} /> Quay lại danh sách bài
        </Button>
        <EmptyState title="Chưa mở được kết quả" description="Cô thử tải lại sau ít phút nhé." mood="nudge" />
      </div>
    );
  }

  const items = data.items || [];
  const students = data.students || [];
  const submittedCount = students.filter((s) => (Number(s.completed_items) || 0) > 0).length;
  const totalStudents = Number(data.totalStudents) || students.length || 0;
  const totalDone = items.reduce((acc, it) => acc + (Number(it.done_count) || 0), 0);
  const totalSelf = items.reduce((acc, it) => acc + (Number(it.self_count) || 0), 0);
  const totalHint = items.reduce((acc, it) => acc + (Number(it.hint_count) || 0), 0);
  const totalGuided = items.reduce((acc, it) => acc + (Number(it.guided_count) || 0), 0);
  const rated = totalSelf + totalHint + totalGuided;
  const pct = (n) => (rated > 0 ? `${Math.round((n / rated) * 100)}%` : '');
  const hasData = totalDone > 0 || rated > 0;

  const chartRows = stepRowsFrom(stepStats.data, question === 'all' ? null : question);
  const tips = buildAssistantTips({ items, students, steps: stepRowsFrom(stepStats.data), totalStudents });
  const questionOptions = [{ value: 'all', label: 'Cả bài' }, ...items.map((it) => ({ value: it.position, label: `Câu ${it.position}` }))];

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <Button variant="secondary" onClick={onBack} style={{ gap: 6, minHeight: 40 }}>
          <ArrowLeft size={16} /> Quay lại danh sách bài
        </Button>
      </div>

      <div className="tp-head">
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>Kết quả · {data.title}</h3>
          <p>Lớp có {totalStudents} học sinh · cập nhật khi phụ huynh kèm con làm xong bài</p>
        </div>
        {items.length > 1 && (
          <div className="tp-head-actions tp-seg" style={{ overflowX: 'auto' }}>
            <Segmented options={questionOptions} value={question} onChange={setQuestion} />
          </div>
        )}
      </div>

      {/* 4 số liệu chính: chưa có dữ liệu thì hiện "·" */}
      <div className="tp-kpi-grid tp-kpi-sm">
        <KpiCard label="Hoàn thành" value={totalStudents > 0 ? `${submittedCount}/${totalStudents}` : null} sub={totalStudents > 0 ? `${Math.round((submittedCount / totalStudents) * 100)}%` : ''} />
        <KpiCard label="Tự làm được" value={hasData ? totalSelf : null} sub={pct(totalSelf)} tone="ok" />
        <KpiCard label="Cần gợi ý" value={hasData ? totalHint : null} sub={pct(totalHint)} tone="warn" />
        <KpiCard label="Mẹ dẫn nhiều" value={hasData ? totalGuided : null} sub={pct(totalGuided)} tone="bad" />
      </div>

      <div className="tp-res-grid">
        <Card style={{ display: 'grid', gap: 12 }}>
          <StepChart
            title={question === 'all' ? 'Bậc hay vướng nhất (đếm số lần con bí)' : `Bậc hay vướng · Câu ${question}`}
            steps={chartRows}
            hasCompleted={Boolean(data?.completedCount > 0 || (data?.students || []).some(s => s.status === "completed"))}
          />
          <BearAssistant
            tips={tips}
            completedCount={data?.students?.filter((s) => s.status === "completed").length || data?.completedCount || 6}
            classId={data?.classId || "class_1"}
            assignmentId={assignmentId}
            steps={chartRows}
          />
        </Card>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--s-line)', backgroundColor: 'var(--s-bg)' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--s-text)' }}>Học sinh</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--s-text)' }}>Trạng thái</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--s-text)' }}>Mức</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={3} style={{ padding: '14px', color: 'var(--s-text-2)' }}>Lớp chưa có học sinh nào kết nối.</td></tr>
                ) : students.map((s) => (
                  <tr key={s.student_id} style={{ borderBottom: '1px solid var(--s-line)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--s-text)' }}><strong>{rosterNameOf(s) || 'Chưa có tên'}</strong></td>
                    <td style={{ padding: '10px 14px' }}>
                      {(Number(s.completed_items) || 0) > 0
                        ? <TPill variant="success">Đã làm {s.completed_items} câu</TPill>
                        : <TPill variant="default">Chưa làm</TPill>}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {s.teach_back_rating === 'self' && <TPill variant="success">Tự làm</TPill>}
                      {s.teach_back_rating === 'hint' && <TPill variant="warning">Cần gợi ý</TPill>}
                      {s.teach_back_rating === 'guided' && <TPill variant="danger">Mẹ dẫn</TPill>}
                      {!s.teach_back_rating && <span style={{ color: 'var(--s-text-2)' }}>·</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 12, color: 'var(--s-text-2)', padding: '8px 14px' }}>
            Cô chỉ thấy trạng thái và mức tự đánh giá. Không thấy bài làm, ảnh hay trò chuyện với AI.
          </div>
        </Card>
      </div>

      {/* Thống kê theo từng câu */}
      <h4 style={{ fontSize: 15, fontWeight: 700, marginTop: 4, marginBottom: 10, color: 'var(--s-text)' }}>
        Thống kê theo từng câu
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {items.length === 0 && <EmptyState title="Bài chưa có câu hỏi" description="Cô thêm câu hỏi cho bài để xem thống kê." />}
        {items.map((it) => {
          const totalAttempts = (Number(it.self_count) || 0) + (Number(it.hint_count) || 0) + (Number(it.guided_count) || 0);
          const selfPct = totalAttempts > 0 ? Math.round(((it.self_count || 0) / totalAttempts) * 100) : 0;
          const hintPct = totalAttempts > 0 ? Math.round(((it.hint_count || 0) / totalAttempts) * 100) : 0;
          const guidedPct = totalAttempts > 0 ? Math.max(0, 100 - selfPct - hintPct) : 0;

          return (
            <Card key={it.item_id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                <span style={{ fontWeight: 800, color: 'var(--s-accent-ink)' }}>Câu {it.position}</span>
                <span style={{ fontSize: 12.5, color: 'var(--s-text-2)' }}>Đã làm: {it.done_count || 0} em</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--s-text)', margin: '0 0 10px 0' }}>{it.problem_text}</p>

              {totalAttempts > 0 ? (
                <>
                  <div style={{ height: 10, borderRadius: 999, overflow: 'hidden', display: 'flex', backgroundColor: 'var(--s-line)', marginBottom: 10 }}>
                    {selfPct > 0 && <div style={{ width: `${selfPct}%`, backgroundColor: 'var(--s-ok)' }} title={`Tự làm: ${selfPct}%`} />}
                    {hintPct > 0 && <div style={{ width: `${hintPct}%`, backgroundColor: 'var(--s-accent)' }} title={`Cần gợi ý: ${hintPct}%`} />}
                    {guidedPct > 0 && <div style={{ width: `${guidedPct}%`, backgroundColor: 'var(--s-bad)' }} title={`Mẹ dẫn nhiều: ${guidedPct}%`} />}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <TPill variant="success">Tự làm được: {it.self_count || 0} ({selfPct}%)</TPill>
                    <TPill variant="warning">Cần gợi ý: {it.hint_count || 0} ({hintPct}%)</TPill>
                    <TPill variant="danger">Mẹ dẫn nhiều: {it.guided_count || 0} ({guidedPct}%)</TPill>
                  </div>
                </>
              ) : (
                <span style={{ fontSize: 12.5, color: 'var(--s-text-2)' }}>Chưa có lượt làm nào cho câu này.</span>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. STUDENTS & ROSTER TAB
// ---------------------------------------------------------------------------
function TeacherStudentsTab({ token, classId, cls }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRosterModal, setShowRosterModal] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [classId]);

  async function loadStudents() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStudents(data.students || []);
      }
    } catch {
      toast('Lỗi tải học sinh', 'error');
    } finally {
      setLoading(false);
    }
  }

  function copyClaimLink(s) {
    const name = rosterNameOf(s) || 'con';
    const claimLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/vao-lop/m/${s.claimCode}`;
    const text = `Phụ huynh bé ${name} bấm link để kết nối vào ${formatClassName(cls?.name) || 'lớp'} trên Kèm Con Học: ${claimLink}`;
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    toast(`Đã sao chép link riêng của bé ${name}`, 'success');
  }

  async function handleApprove(studentId) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/class-students/${studentId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast('Đã duyệt học sinh vào lớp', 'success');
        loadStudents();
      }
    } catch {
      toast('Lỗi duyệt học sinh', 'error');
    }
  }

  async function handleReject(studentId) {
    const reason = await appPrompt('Cô có thể ghi lý do để phụ huynh biết (không bắt buộc).', { title: 'Từ chối học sinh này?', okText: 'Từ chối', placeholder: 'VD: Con không học lớp này' });
    if (reason === null) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/class-students/${studentId}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        toast('Đã từ chối yêu cầu', 'info');
        loadStudents();
      }
    } catch {
      toast('Lỗi từ chối', 'error');
    }
  }

  return (
    <div>
      <div className="tp-head">
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Danh sách học sinh ({students.length})</h3>
          <p>Mỗi học sinh có mã riêng dạng XXX-XXX để phụ huynh kết nối ngay</p>
        </div>
        <div className="tp-head-actions">
          <button style={styles.primaryBtn} onClick={() => setShowRosterModal(true)}>
            <Plus size={16} /> Dán danh sách học sinh
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--s-text-2)' }}>Đang tải danh sách học sinh...</p>
      ) : students.length === 0 ? (
        <EmptyState
          title="Chưa có học sinh nào"
          description="Cô có thể dán danh sách tên học sinh để hệ thống sinh mã riêng cho từng em."
          actionText="Thêm danh sách lớp"
          onAction={() => setShowRosterModal(true)}
        />
      ) : (
        <>
        {/* Điện thoại (< 640px): danh sách thẻ */}
        <div className="tp-st-cards">
          {students.map((s) => {
            const name = rosterNameOf(s) || 'Chưa có tên';
            return (
              <div key={s.id} className="tp-st-card">
                <div className="tp-st-card-top">
                  <b>{name}</b>
                  <StudentStatus status={s.status} />
                </div>
                <div className="tp-st-card-meta">
                  {s.claimCode ? <>Mã riêng <span style={styles.codePill}>{s.claimCode}</span></> : 'Vào bằng mã lớp chung'}
                  {s.childChangedAt ? ' · Phụ huynh đã đổi con' : ''}
                </div>
                {s.status === 'pending' && (
                  <div className="tp-st-card-actions">
                    <Button variant="primary" onClick={() => handleApprove(s.id)}>Duyệt</Button>
                    <Button variant="danger" onClick={() => handleReject(s.id)}>Từ chối</Button>
                  </div>
                )}
                {s.status === 'invited' && s.claimCode && (
                  <Button variant="secondary" style={{ minHeight: 44 }} onClick={() => copyClaimLink(s)}>
                    <Copy size={14} /> Sao chép link riêng
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="tp-st-table" style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>STT</th>
                <th style={styles.th}>Tên học sinh</th>
                <th style={styles.th}>Mã riêng (XXX-XXX)</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={styles.th}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr key={s.id}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}>
                    <strong>{rosterNameOf(s) || 'Chưa có tên'}</strong>
                    {s.childChangedAt && (
                      <span style={styles.childChangedBadge} title={`Đổi lúc ${new Date(s.childChangedAt).toLocaleString('vi-VN')}`}>
                        Phụ huynh đã đổi con
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {s.claimCode ? (
                      <span style={styles.codePill}>{s.claimCode}</span>
                    ) : (
                      <span style={{ color: '#84664A' }}>Mã lớp chung</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <StudentStatus status={s.status} />
                  </td>
                  <td style={styles.td}>
                    {s.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button size="sm" variant="primary" onClick={() => handleApprove(s.id)}>Duyệt</Button>
                        <Button size="sm" variant="danger" onClick={() => handleReject(s.id)}>Từ chối</Button>
                      </div>
                    )}
                    {s.status === 'invited' && s.claimCode && (
                      <button style={styles.copyBtn} onClick={() => copyClaimLink(s)}>
                        <Copy size={12} /> Link riêng
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {showRosterModal && (
        <RosterModal
          token={token}
          classId={classId}
          onClose={() => setShowRosterModal(false)}
          onAdded={() => { setShowRosterModal(false); loadStudents(); }}
        />
      )}
    </div>
  );
}

function StudentStatus({ status }) {
  if (status === 'active') return <span style={styles.statusBadgeActive}>Đã kết nối</span>;
  if (status === 'pending') return <span style={styles.statusBadgePending}>Chờ cô duyệt</span>;
  if (status === 'invited') return <span style={styles.statusBadgeDraft}>Đã gửi mã</span>;
  if (status === 'rejected') return <span style={styles.statusBadgeRejected}>Đã từ chối</span>;
  return null;
}

// Modal Dán danh sách học sinh
function RosterModal({ token, classId, onClose, onAdded }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const names = text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (names.length === 0) {
      toast('Vui lòng dán ít nhất 1 tên học sinh', 'warn');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/roster`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ names }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast(`Đã tạo mã cho ${data.count} học sinh`, 'success');
        onAdded();
      } else {
        toast(data.error?.message || 'Lỗi dán danh sách', 'error');
      }
    } catch {
      toast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modalBox}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Dán danh sách lớp</h3>
          <button style={styles.iconBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={styles.label}>Danh sách tên học sinh (mỗi dòng một em)</label>
            <textarea
              style={{ ...styles.input, minHeight: 140 }}
              placeholder="Nguyễn Hoàng Nam&#10;Lê Gia Hưng&#10;Phạm Quỳnh Anh&#10;Vũ Minh Khôi"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>

          <div style={styles.infoBox}>
            Hệ thống sẽ tự động sinh mã dạng <strong>XXX-XXX</strong> (không có số 0/chữ O, số 1/chữ I) cho từng em để cô gửi phụ huynh.
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="submit" disabled={submitting} style={{ ...styles.primaryBtn, flex: 1 }}>
              {submitting ? 'Đang tạo...' : 'Tạo mã học sinh'}
            </button>
            <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onClose}>
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. ANNOUNCEMENTS TAB
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// 7. ANNOUNCEMENTS & REMINDERS TAB (PROMPT 04 MỤC 4b)
// ---------------------------------------------------------------------------
function TeacherAnnouncementsTab({ token, classId, cls }) {
  const [seg, setSeg] = useState('announcements'); // 'announcements' | 'reminders'
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Thông báo thường
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [requireAck, setRequireAck] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  // Nhắc việc có ngày
  const quickDates = getQuickReminderDates();
  const [selectedTemplate, setSelectedTemplate] = useState(REMINDER_TEMPLATES[0].id);
  const [reminderText, setReminderText] = useState(REMINDER_TEMPLATES[0].template);
  const [selectedDate, setSelectedDate] = useState(quickDates[0].date);
  const [attachAssignment, setAttachAssignment] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [classAssignments, setClassAssignments] = useState([]);
  const [sending, setSending] = useState(false);

  // Danh sách gia đình đã đọc / đã nhắc con của một thông báo
  const [openReadsId, setOpenReadsId] = useState(null);
  const [readsData, setReadsData] = useState([]);
  const [readsLoading, setReadsLoading] = useState(false);

  useEffect(() => {
    loadAnnouncements();
    loadClassAssignments();
  }, [classId]);

  async function loadClassAssignments() {
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (res.ok && d.ok && Array.isArray(d.assignments)) {
        setClassAssignments(d.assignments);
        if (d.assignments.length > 0) setSelectedAssignmentId(d.assignments[0].id);
      }
    } catch {}
  }

  async function loadAnnouncements() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        setAnnouncements(d.announcements || []);
      }
    } catch {
      toast('Lỗi tải thông báo', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/announcements`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body, pinned: pinned ? 1 : 0, requireAck: requireAck ? 1 : 0 }),
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        toast('Đã gửi thông báo tới lớp', 'success');
        setTitle('');
        setBody('');
        setShowCreate(false);
        loadAnnouncements();
      } else {
        toast(d.error?.message || 'Chưa gửi được thông báo', 'error');
      }
    } catch {
      toast('Lỗi gửi thông báo', 'error');
    }
  }

  const reminders = announcements.filter((a) => a.kind === 'reminder');
  const infoAnnouncements = announcements.filter((a) => a.kind !== 'reminder');
  const remindersForDate = reminders.filter((r) => r.remind_for === selectedDate).length;
  const reachedLimit = remindersForDate >= MAX_REMINDERS_PER_DAY;
  const familyCount = Number(cls?.active_students_count);
  const hasFamilyCount = Number.isFinite(familyCount) && familyCount > 0;

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl.id);
    setReminderText(tpl.template);
  };

  const handleSendReminder = async (e) => {
    e.preventDefault();
    if (!reminderText.trim() || reachedLimit || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/announcements`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Lời nhắc của cô',
          body: reminderText.trim(),
          kind: 'reminder',
          remindFor: selectedDate,
          templateId: selectedTemplate,
          assignmentId: attachAssignment ? selectedAssignmentId : null,
        }),
      });

      const d = await res.json().catch(() => ({}));

      if (res.ok && d.ok) {
        toast('Đã gửi lời nhắc cho phụ huynh lớp', 'success');
        loadAnnouncements();
      } else {
        toast(d.error?.message || 'Gộp vào một lời nhắc nhé cô', 'error');
      }
    } catch {
      toast('Lỗi kết nối khi gửi lời nhắc', 'error');
    } finally {
      setSending(false);
    }
  };

  const toggleReads = async (ann) => {
    if (openReadsId === ann.id) { setOpenReadsId(null); return; }
    setOpenReadsId(ann.id);
    setReadsData([]);
    setReadsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/announcements/${ann.id}/reads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) setReadsData(d.reads || []);
    } catch {
      toast('Lỗi tải danh sách đã đọc', 'error');
    } finally {
      setReadsLoading(false);
    }
  };

  const fmtTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };
  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN');
  };

  function ReadsList({ ann }) {
    if (openReadsId !== ann.id) return null;
    if (readsLoading) return <p style={{ fontSize: 12.5, color: 'var(--s-text-2)', margin: '8px 0 0' }}>Đang tải...</p>;
    if (readsData.length === 0) return <p style={{ fontSize: 12.5, color: 'var(--s-text-2)', margin: '8px 0 0' }}>Chưa có gia đình nào mở thông báo này.</p>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
        {readsData.map((r) => (
          <div key={r.family_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13, padding: '6px 10px', background: 'var(--s-bg)', borderRadius: 10, border: '1px solid var(--s-line)' }}>
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.family_name || 'Gia đình trong lớp'}</span>
            {r.done_at ? <TPill variant="success">Đã nhắc con {fmtTime(r.done_at)}</TPill> : <TPill variant="warning">Đã đọc</TPill>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Chọn Thông báo hoặc Nhắc việc */}
      <div className="tp-seg" style={{ marginBottom: 16 }}>
        <Segmented
          options={[
            { value: 'announcements', label: '📢 Thông báo lớp' },
            { value: 'reminders', label: '⏰ Nhắc việc' },
          ]}
          value={seg}
          onChange={setSeg}
        />
      </div>

      {/* THÔNG BÁO */}
      {seg === 'announcements' && (
        <div>
          <div className="tp-head">
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Thông báo một chiều</h3>
              <p>Gửi lịch thi, nhắc ôn bài và xem gia đình nào đã đọc, đã nhắc con</p>
            </div>
            <div className="tp-head-actions">
              <button style={styles.primaryBtn} onClick={() => setShowCreate(!showCreate)}>
                <Plus size={16} /> Soạn thông báo mới
              </button>
            </div>
          </div>

          {showCreate && (
            <form onSubmit={handleCreate} style={{ ...styles.card, marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 16, color: 'var(--s-text)' }}>Soạn thông báo mới</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  style={styles.input}
                  placeholder="Tiêu đề: ví dụ Lịch kiểm tra Toán giữa kỳ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <textarea
                  style={{ ...styles.input, minHeight: 80 }}
                  placeholder="Nội dung thông báo cho phụ huynh..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <Toggle checked={pinned} onChange={setPinned} label="Ghim đầu lớp" />
                  <Toggle checked={requireAck} onChange={setRequireAck} label='Cần phụ huynh bấm "Đã đọc"' />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                  <button type="submit" style={styles.primaryBtn}>Gửi thông báo</button>
                  <button type="button" style={styles.secondaryBtn} onClick={() => setShowCreate(false)}>Huỷ</button>
                </div>
              </div>
            </form>
          )}

          {loading ? (
            <TeacherCardSkeleton count={3} />
          ) : infoAnnouncements.length === 0 ? (
            <EmptyState
              title="Chưa có thông báo nào"
              description="Cô bấm Soạn thông báo mới để gửi tới phụ huynh lớp này."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {infoAnnouncements.map((an) => (
                <div key={an.id} className="tp-asg-card" style={{ alignItems: 'stretch' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      {Number(an.pinned) === 1 && <span style={styles.pinnedBadge}>Đã ghim</span>}
                      {Number(an.require_ack) === 1 && <span style={styles.ackBadge}>Cần bấm Đã đọc</span>}
                      <span style={{ fontSize: 12.5, color: 'var(--s-text-2)' }}>{fmtDate(an.created_at)}</span>
                    </div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--s-text)' }}>{an.title}</h4>
                    <p style={{ fontSize: 14, color: 'var(--s-text)', margin: '0 0 8px 0', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{an.body}</p>
                    <div style={{ fontSize: 12.5, color: 'var(--s-text-2)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span>
                        Đã đọc: <strong>{Number(an.read_count) || 0}</strong> gia đình · <strong>{Math.max(Number(an.done_count) || 0, Number(an.ack_count) || 0)}</strong> gia đình đã nhắc con
                      </span>
                      <button type="button" style={styles.linkBtn} onClick={() => toggleReads(an)}>
                        {openReadsId === an.id ? 'Ẩn danh sách' : 'Xem từng gia đình'}
                      </button>
                    </div>
                    <ReadsList ann={an} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NHẮC VIỆC */}
      {seg === 'reminders' && (
        <div className="tp-rem-grid">
          <div style={{ ...styles.card, padding: 18 }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 700, color: 'var(--s-text)' }}>
              Cô soạn nhắc việc
            </h4>
            <p style={{ fontSize: 13, color: 'var(--s-text-2)', margin: '0 0 14px 0', lineHeight: 1.5 }}>
              Thẻ hiện trên màn chính của mẹ từ trưa hôm trước tới trưa ngày áp dụng. Mẹ bấm "Đã nhắc con" là xong.
            </p>

            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--s-text-2)', display: 'block', marginBottom: 6 }}>
                Mẫu soạn nhanh
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {REMINDER_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    className={`tp-chip ${selectedTemplate === tpl.id ? 'tp-on' : ''}`}
                    aria-pressed={selectedTemplate === tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                  >
                    <span aria-hidden="true">{tpl.icon}</span>
                    <span>{tpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--s-text-2)', display: 'block', marginBottom: 6 }} htmlFor="tp-reminder-text">
                Lời nhắc (sửa chỗ trong ngoặc nhọn)
              </label>
              <textarea
                id="tp-reminder-text"
                style={{ ...styles.input, minHeight: 70, fontSize: 14, lineHeight: 1.5 }}
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--s-text-2)', display: 'block', marginBottom: 6 }}>
                Áp dụng cho ngày
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {quickDates.map((qd) => (
                  <button
                    key={qd.date}
                    type="button"
                    className={`tp-chip ${selectedDate === qd.date ? 'tp-on' : ''}`}
                    aria-pressed={selectedDate === qd.date}
                    onClick={() => setSelectedDate(qd.date)}
                  >
                    {qd.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16, padding: '10px 12px', background: 'var(--s-bg)', borderRadius: 12, border: '1px solid var(--s-line)' }}>
              <Toggle checked={attachAssignment} onChange={setAttachAssignment} label="Gắn với bài đã giao" />
              {attachAssignment && (
                <div style={{ marginTop: 8 }}>
                  {classAssignments.length === 0 ? (
                    <span style={{ fontSize: 13, color: 'var(--s-text-2)' }}>Lớp chưa có bài tập nào.</span>
                  ) : (
                    <Select
                      ariaLabel="Bài đã giao"
                      value={selectedAssignmentId}
                      onChange={(v) => setSelectedAssignmentId(v)}
                      options={classAssignments.map((asg) => ({ value: asg.id, label: `${asg.title} (${asg.subject || 'Toán'})` }))}
                    />
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: 12.5, gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: reachedLimit ? 'var(--s-bad)' : 'var(--s-text-2)', fontWeight: 800 }}>
                Ngày này đã có {remindersForDate}/{MAX_REMINDERS_PER_DAY} lời nhắc
              </span>
              <span style={{ color: 'var(--s-text-2)' }}>Tối đa {MAX_REMINDERS_PER_DAY} lời nhắc mỗi ngày</span>
            </div>

            <button
              type="button"
              onClick={handleSendReminder}
              disabled={reachedLimit || sending}
              style={{ ...styles.primaryBtn, width: '100%', minHeight: 44, opacity: reachedLimit || sending ? 0.6 : 1, cursor: reachedLimit || sending ? 'not-allowed' : 'pointer' }}
            >
              <Send size={16} />
              <span>{sending ? 'Đang gửi...' : hasFamilyCount ? `Gửi cho ${familyCount} gia đình` : 'Gửi cho cả lớp'}</span>
            </button>
          </div>

          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 700, color: 'var(--s-text)' }}>
              Theo dõi tình trạng nhắc con
            </h4>

            {loading ? (
              <TeacherCardSkeleton count={2} />
            ) : reminders.length === 0 ? (
              <EmptyState
                title="Chưa có lời nhắc việc"
                description="Lời nhắc cô gửi sẽ hiện ở đây kèm số gia đình đã đọc và đã nhắc con."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reminders.map((rem) => (
                  <div key={rem.id} style={{ ...styles.card, padding: 16, borderLeft: '4px solid var(--s-accent)' }}>
                    <b style={{ fontSize: 14.5, color: 'var(--s-text)', display: 'block', lineHeight: 1.45 }}>{rem.body}</b>
                    <span style={{ fontSize: 12.5, color: 'var(--s-text-2)' }}>
                      📅 Áp dụng: {rem.remind_for ? fmtDate(rem.remind_for) : 'chưa đặt ngày'}{rem.assignment_id ? ' · Có kèm bài tập' : ''}
                    </span>

                    <div className="tp-stat3" style={{ margin: '10px 0' }}>
                      <div><b>{Number(rem.read_count) || 0}</b><span>đã đọc</span></div>
                      <div><b style={{ color: 'var(--s-ok)' }}>{Number(rem.done_count) || 0}</b><span>đã nhắc con</span></div>
                      <div><b>{hasFamilyCount ? familyCount : '·'}</b><span>{hasFamilyCount ? 'gia đình' : 'chưa có dữ liệu'}</span></div>
                    </div>

                    <button type="button" style={styles.linkBtn} onClick={() => toggleReads(rem)}>
                      {openReadsId === rem.id ? 'Ẩn danh sách' : 'Xem từng gia đình'}
                    </button>
                    <ReadsList ann={rem} />

                    <p style={{ fontSize: 12, color: 'var(--s-text-2)', margin: '10px 0 0 0' }}>
                      Cô chỉ thấy trạng thái đọc và đã nhắc. Không thấy dữ liệu học, ảnh hay trò chuyện của gia đình.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 8. CLASS SETTINGS TAB
// ---------------------------------------------------------------------------
function TeacherClassSettingsTab({ token, classId, cls, onUpdated }) {
  const [joinMode, setJoinMode] = useState(cls.join_mode || 'code_and_claim');
  const [defaultDueDays, setDefaultDueDays] = useState(cls.default_due_days || 1);
  const [shareTeacherAnswer, setShareTeacherAnswer] = useState(cls.share_teacher_answer === 0 || cls.share_teacher_answer === '0' ? 0 : 1);
  const [saving, setSaving] = useState(false);

  async function handleSaveSettings() {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/settings`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ joinMode, defaultDueDays, shareTeacherAnswer }),
      });
      if (res.ok) {
        toast('Đã lưu cài đặt lớp', 'success');
        onUpdated();
      }
    } catch {
      toast('Lỗi lưu cài đặt', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleRotateCode() {
    if (!(await appConfirm('Mã cũ sẽ không còn dùng để vào lớp được nữa.', { title: 'Tạo mã lớp mới?', okText: 'Tạo mã mới' }))) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/rotate-code`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        toast(`Mã lớp mới: ${d.joinCode}`, 'success');
        onUpdated();
      }
    } catch {
      toast('Lỗi tạo mã mới', 'error');
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={styles.card}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: 16, color: 'var(--s-text)' }}>Cài đặt {formatClassName(cls.name) || 'lớp học'}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={styles.label}>Cách thức kết nối học sinh</label>
            <Select
              ariaLabel="Cách thức kết nối học sinh"
              value={joinMode}
              onChange={(v) => setJoinMode(v)}
              options={[
                { value: 'code_and_claim', label: 'Mã lớp chung và mã riêng từng em' },
                { value: 'claim_only', label: 'Chỉ mã riêng (tắt mã chung)' },
              ]}
            />
          </div>

          <div>
            <label style={styles.label}>Hạn nộp bài mặc định khi tạo bài tập</label>
            <Select ariaLabel="Hạn nộp bài mặc định" value={Number(defaultDueDays)} onChange={(v) => setDefaultDueDays(Number(v))} options={DUE_OPTIONS} />
          </div>

          <div>
            <label style={styles.label}>Gửi đáp án của cô cho phụ huynh</label>
            <Select ariaLabel="Gửi đáp án của cô cho phụ huynh" value={Number(shareTeacherAnswer)} onChange={(v) => setShareTeacherAnswer(Number(v))} options={SHARE_ANSWER_OPTIONS} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            <button style={styles.primaryBtn} onClick={handleSaveSettings} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
            <button style={styles.secondaryBtn} onClick={handleRotateCode}>
              Đổi mã lớp mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 9. TEACHER SETTINGS SCREEN ("CÀI ĐẶT CỦA CÔ")
// ---------------------------------------------------------------------------
function TeacherSettingsScreen({ token, teacher, onUpdateSuccess, onLogout }) {
  const [methodNotes, setMethodNotes] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('word_problem_multistep');
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/method-notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        setMethodNotes(d.notes || []);
      }
    } catch {
      toast('Lỗi tải thư viện phương pháp', 'error');
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newNote.trim()) return;
    if (newNote.trim().length > 300) {
      toast('Ghi chú tối đa 300 ký tự', 'warn');
      return;
    }
    setAddingNote(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/method-notes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle.trim(), problemType: newType, note: newNote.trim() }),
      });
      if (res.ok) {
        toast('Đã lưu cách cô dạy vào thư viện', 'success');
        setNewTitle('');
        setNewNote('');
        loadNotes();
      }
    } catch {
      toast('Lỗi lưu phương pháp', 'error');
    } finally {
      setAddingNote(false);
    }
  }

  async function handleDeleteNote(id) {
    if (!(await appConfirm('Xoá phương pháp này khỏi thư viện của cô?', { danger: true }))) return;
    try {
      await fetch(`${API_BASE}/api/v1/teacher/method-notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      toast('Đã xoá', 'info');
      loadNotes();
    } catch {
      toast('Lỗi xoá', 'error');
    }
  }

  const accountRows = [
    ['Họ tên', formatTeacherName(teacher.display_name)],
    ['Trường', teacher.school_name],
    ['Tỉnh, thành phố', teacher.province],
    ['Email', teacher.email],
    ['Số điện thoại', teacher.phone],
    ['Khối dạy', formatGrades(teacher.grades)],
  ].filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '');

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 style={styles.sectionHeading}>Cài đặt của cô</h2>
      <p style={{ ...styles.sectionSub, marginBottom: 16 }}>Thư viện cách cô dạy và thông tin tài khoản</p>

      {/* Thư viện "Cách cô dạy" */}
      <div style={{ ...styles.card, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={18} color="#F6A623" />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--s-text)' }}>Thư viện "Cách cô dạy" (dùng lại khi soạn bài)</h3>
        </div>

        <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <div className="tp-form-2">
            <input
              style={styles.input}
              aria-label="Tên phương pháp"
              placeholder="Tên phương pháp: ví dụ Sơ đồ đoạn thẳng toán 2 bước"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <Select ariaLabel="Dạng bài" value={newType} onChange={(v) => setNewType(v)} options={PROBLEM_TYPE_OPTIONS} />
          </div>
          <div>
            <textarea
              style={{ ...styles.input, minHeight: 60 }}
              placeholder="Nội dung cách dạy (tối đa 300 ký tự): ví dụ Vẽ sơ đồ đoạn thẳng, chưa dùng phép nhân..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              maxLength={300}
              required
            />
            <span style={{ fontSize: 12, color: 'var(--s-text-2)' }}>{newNote.length}/300 ký tự</span>
          </div>
          <button type="submit" disabled={addingNote} style={{ ...styles.primaryBtn, alignSelf: 'flex-start', minHeight: 44 }}>
            <Plus size={14} /> Thêm vào thư viện
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {methodNotes.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--s-text-2)', margin: 0 }}>Thư viện chưa có cách dạy nào. Cô thêm một cách để dùng lại khi soạn bài.</p>
          )}
          {methodNotes.map((n) => (
            <div key={n.id} style={styles.noteItem}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 14, color: 'var(--s-text)' }}>{n.title}</strong>
                {(PROBLEM_TYPE_OPTIONS.find((o) => o.value === (n.problem_type || n.problemType)) || null) && (
                  <span style={{ ...styles.statusBadgeDraft, marginLeft: 6 }}>
                    {PROBLEM_TYPE_OPTIONS.find((o) => o.value === (n.problem_type || n.problemType)).label}
                  </span>
                )}
                <p style={{ fontSize: 13, color: 'var(--s-text-2)', margin: '2px 0 0 0' }}>{n.note}</p>
              </div>
              <button style={{ ...styles.iconBtn, color: 'var(--s-bad)', flexShrink: 0 }} aria-label={`Xoá ${n.title}`} onClick={() => handleDeleteNote(n.id)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Hồ sơ giáo viên: dòng nào trống thì ẩn */}
      <div style={styles.card}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 700, color: 'var(--s-text)' }}>Thông tin tài khoản</h3>
        {accountRows.map(([k, v]) => (
          <p key={k} style={{ fontSize: 14, color: 'var(--s-text)', margin: '6px 0', overflowWrap: 'anywhere' }}>
            <strong style={{ color: 'var(--s-text-2)' }}>{k}:</strong> {v}
          </p>
        ))}

        <div style={{ marginTop: 16 }}>
          <button style={{ ...styles.secondaryBtn, minHeight: 44 }} onClick={onLogout}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}

// Khối dạy có thể lưu dạng chuỗi "Khối 3", số 3, hoặc mảng JSON [3,4]
function formatGrades(g) {
  if (g === null || g === undefined) return '';
  let v = g;
  if (typeof v === 'string') {
    const t = v.trim();
    if (!t) return '';
    if (t.startsWith('[')) {
      try { v = JSON.parse(t); } catch { return t; }
    } else {
      return /^\d+$/.test(t) ? `Khối ${t}` : t;
    }
  }
  if (Array.isArray(v)) {
    const list = v.map((x) => String(x).replace(/^khối\s*/i, '').trim()).filter(Boolean);
    return list.length ? `Khối ${list.join(', ')}` : '';
  }
  return typeof v === 'number' ? `Khối ${v}` : String(v);
}

// ---------------------------------------------------------------------------
// STYLES: CỔNG GIÁO VIÊN BẢN GẤU (Baloo 2 + Nunito, bảng màu ấm áp #FFF8EC)
// ---------------------------------------------------------------------------
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#FFF8EC',
    fontFamily: '"Nunito", -apple-system, BlinkMacSystemFont, sans-serif',
    color: '#4B3621',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #F0DDC2',
    padding: '12px 24px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerContent: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF1D6',
    border: '1.5px solid #F0DDC2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
  },
  brandTitle: {
    fontFamily: '"Baloo 2", sans-serif',
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
    color: '#4B3621',
  },
  schoolSubtitle: {
    fontSize: 12,
    color: '#84664A',
    margin: 0,
  },
  mainContainer: {
    maxWidth: 1100,
    margin: '24px auto',
    padding: '0 20px',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionHeading: {
    fontFamily: '"Baloo 2", sans-serif',
    fontSize: 22,
    fontWeight: 700,
    color: '#4B3621',
    margin: '0 0 4px 0',
  },
  sectionSub: {
    fontSize: 13,
    color: '#84664A',
    margin: 0,
  },
  classesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 16,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    border: '1px solid #F0DDC2',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 5px 0 #F0DDC2, 0 10px 24px -12px rgba(75, 54, 33, 0.14)',
  },
  gradeBadge: {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 800,
    color: '#9A5B00',
    backgroundColor: '#FFF1D6',
    border: '1px solid #F6C56A',
    padding: '3px 9px',
    borderRadius: 999,
    marginBottom: 6,
  },
  className: {
    fontFamily: '"Baloo 2", sans-serif',
    fontSize: 20,
    fontWeight: 700,
    color: '#4B3621',
    margin: 0,
  },
  joinCodeBox: {
    textAlign: 'center',
    backgroundColor: '#FFF8EC',
    padding: '4px 10px',
    borderRadius: 10,
    border: '1px solid #F0DDC2',
    display: 'flex',
    flexDirection: 'column',
  },
  joinCodeBoxLarge: {
    textAlign: 'center',
    backgroundColor: '#FFF8EC',
    padding: '6px 14px',
    borderRadius: 14,
    display: 'flex',
    flexDirection: 'column',
    border: '2px dashed #F6A623',
  },
  classStatsRow: {
    display: 'flex',
    gap: 16,
    margin: '14px 0',
    paddingTop: 12,
    borderTop: '1px solid #F0DDC2',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#84664A',
  },
  pendingBadge: {
    backgroundColor: '#FFF1D6',
    color: '#9A5B00',
    padding: '6px 12px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    border: '1px solid #F6C56A',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  classBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    border: '1px solid #F0DDC2',
    boxShadow: '0 5px 0 #F0DDC2, 0 10px 24px -12px rgba(75, 54, 33, 0.16)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 16,
  },
  qrBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF1D6',
    color: '#9A5B00',
    border: '1px solid #F6C56A',
    borderRadius: 999,
    padding: '9px 16px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
  },
  shareZaloBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F6A623',
    color: '#4B3621',
    border: 'none',
    borderRadius: 999,
    padding: '9px 16px',
    fontSize: 13,
    fontWeight: 800,
    boxShadow: '0 3px 0 #C47F0E',
    cursor: 'pointer',
  },
  tabsRow: {
    display: 'flex',
    gap: 8,
    borderBottom: '1px solid #F0DDC2',
    paddingBottom: 8,
    marginBottom: 20,
    overflowX: 'auto',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 15px',
    borderRadius: 999,
    border: '1px solid #F0DDC2',
    backgroundColor: '#FFFFFF',
    color: '#84664A',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    backgroundColor: '#4B3621',
    color: '#FFF8EC',
    borderColor: '#4B3621',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 999,
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    color: '#84664A',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
  },
  navBtnActive: {
    backgroundColor: '#FFF1D6',
    color: '#9A5B00',
    border: '1px solid #F6C56A',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '1px solid #F0DDC2',
    backgroundColor: '#FFFFFF',
    color: '#84664A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F6A623',
    color: '#4B3621',
    border: 'none',
    borderRadius: 999,
    padding: '9px 18px',
    fontSize: 13.5,
    fontWeight: 800,
    boxShadow: '0 3px 0 #C47F0E',
    cursor: 'pointer',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF1D6',
    color: '#9A5B00',
    border: 'none',
    borderRadius: 999,
    padding: '9px 16px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
  },
  secondarySmallBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1D6',
    color: '#9A5B00',
    border: 'none',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
  },
  aiInsightBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF1D6',
    color: '#9A5B00',
    border: '1px solid #F6C56A',
    borderRadius: 999,
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9A5B00',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    padding: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    border: '1px solid #F0DDC2',
    boxShadow: '0 5px 0 #F0DDC2, 0 10px 24px -12px rgba(75, 54, 33, 0.16)',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: '40px 20px',
    textAlign: 'center',
    border: '1px solid #F0DDC2',
    boxShadow: '0 5px 0 #F0DDC2',
  },
  assignmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    border: '1px solid #F0DDC2',
    boxShadow: '0 4px 0 #F0DDC2',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadgeActive: {
    fontSize: 12,
    fontWeight: 800,
    color: '#047857',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    padding: '3px 8px',
    borderRadius: 999,
  },
  statusBadgeDraft: {
    fontSize: 12,
    fontWeight: 800,
    color: '#84664A',
    backgroundColor: '#FFF8EC',
    border: '1px solid #F0DDC2',
    padding: '3px 8px',
    borderRadius: 999,
  },
  statusBadgePending: {
    fontSize: 12,
    fontWeight: 800,
    color: '#9A5B00',
    backgroundColor: '#FFF1D6',
    border: '1px solid #F6C56A',
    padding: '3px 8px',
    borderRadius: 999,
  },
  statusBadgeRejected: {
    fontSize: 12,
    fontWeight: 800,
    color: '#BE123C',
    backgroundColor: '#FFF1F2',
    border: '1px solid #FECDD3',
    padding: '3px 8px',
    borderRadius: 999,
  },
  pinnedBadge: {
    fontSize: 12,
    fontWeight: 800,
    color: '#9A5B00',
    backgroundColor: '#FFF1D6',
    border: '1px solid #F6C56A',
    padding: '3px 8px',
    borderRadius: 999,
  },
  ackBadge: {
    fontSize: 12,
    fontWeight: 800,
    color: '#9A5B00',
    backgroundColor: '#FFF1D6',
    border: '1px solid #F6C56A',
    padding: '3px 8px',
    borderRadius: 999,
  },
  insightBox: {
    backgroundColor: '#FFF8EC',
    border: '1px solid #F0DDC2',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  itemResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    border: '1px solid #F0DDC2',
  },
  breakdownRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  tagSelf: {
    fontSize: 12,
    fontWeight: 800,
    color: '#047857',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    padding: '2px 8px',
    borderRadius: 999,
  },
  tagHint: {
    fontSize: 12,
    fontWeight: 800,
    color: '#9A5B00',
    backgroundColor: '#FFF1D6',
    border: '1px solid #F6C56A',
    padding: '2px 8px',
    borderRadius: 999,
  },
  tagGuided: {
    fontSize: 12,
    fontWeight: 800,
    color: '#1D4ED8',
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    padding: '2px 8px',
    borderRadius: 999,
  },
  badgeDone: {
    fontSize: 12,
    fontWeight: 800,
    color: '#047857',
  },
  badgeNotDone: {
    fontSize: 12,
    color: '#84664A',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    border: '1px solid #F0DDC2',
    boxShadow: '0 5px 0 #F0DDC2',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    backgroundColor: '#FFF8EC',
    padding: '10px 14px',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    color: '#84664A',
    borderBottom: '1px solid #F0DDC2',
  },
  td: {
    padding: '11px 14px',
    fontSize: 13,
    color: '#4B3621',
    borderBottom: '1px solid #F6EBD9',
  },
  codePill: {
    fontFamily: 'monospace',
    fontWeight: 800,
    backgroundColor: '#FFF8EC',
    color: '#4B3621',
    border: '1px solid #F0DDC2',
    padding: '3px 8px',
    borderRadius: 999,
    letterSpacing: '0.05em',
  },
  childChangedBadge: {
    display: 'inline-block',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: 800,
    color: '#9A5B00',
    backgroundColor: '#FFF1D6',
    border: '1px solid #F6C56A',
    padding: '2px 8px',
    borderRadius: 999,
  },
  approveBtn: {
    backgroundColor: '#047857',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
  },
  rejectBtn: {
    backgroundColor: '#BE123C',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1D6',
    color: '#9A5B00',
    border: '1px solid #F6C56A',
    borderRadius: 999,
    padding: '4px 8px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
  },
  noteItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF8EC',
    padding: '10px 14px',
    borderRadius: 14,
    border: '1px solid #F0DDC2',
  },
  itemBox: {
    backgroundColor: '#FFF8EC',
    borderRadius: 14,
    padding: 12,
    border: '1px solid #F0DDC2',
    marginBottom: 10,
  },
  authWrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8EC',
    padding: 20,
    fontFamily: '"Nunito", sans-serif',
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: '32px 28px',
    width: '100%',
    maxWidth: 440,
    boxShadow: '0 5px 0 #F0DDC2, 0 10px 24px -12px rgba(75, 54, 33, 0.16)',
    border: '1px solid #F0DDC2',
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 800,
    color: '#84664A',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px',
    borderRadius: 14,
    border: '2px solid #F0DDC2',
    fontSize: 13.5,
    color: '#4B3621',
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: '#FFFFFF',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#9A5B00',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
  },
  infoBox: {
    backgroundColor: '#FFF1D6',
    border: '1px solid #F6C56A',
    borderRadius: 14,
    padding: 12,
    fontSize: 12.5,
    color: '#9A5B00',
    lineHeight: 1.5,
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(75, 54, 33, 0.5)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px 16px calc(20px + env(safe-area-inset-bottom, 16px))',
    boxSizing: 'border-box',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    width: '100%',
    maxWidth: 520,
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(75, 54, 33, 0.25)',
    border: '2px solid #F0DDC2',
    boxSizing: 'border-box',
  },
  statusBadgeExpired: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    border: '1px solid #FCA5A5',
    padding: '3px 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8EC',
    fontFamily: '"Nunito", sans-serif',
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '3px solid #F0DDC2',
    borderTopColor: '#F6A623',
    animation: 'spin 0.8s linear infinite',
  },
};
