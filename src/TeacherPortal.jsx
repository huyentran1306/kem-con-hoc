/**
 * CỔNG GIÁO VIÊN BẢN GẤU (PROMPT 11 - PHẦN A, B, C)
 * Thiết kế bản Gấu ấm áp, Mitr + Nunito, WCAG AA, không còn màu xanh dương viết cứng
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
  AssistantCard, StaffShell, SideNav, ClassSwitcher
} from './ui/staff';
import { BearClassIcon, BearStudentsIcon, BearSettingsIcon, BearBookIcon, BearBellIcon, BearQrIcon, BearResultsIcon } from './TeacherBearIcons.jsx';
import './ui/staff/tokens.css';

const API_BASE = 'https://ai-gateway-worker.trannth1306.workers.dev';
const TEACHER_TOKEN_KEY = 'kem-con-hoc:teacher:token';

export function formatClassName(name) {
  if (!name) return '';
  const s = String(name).trim();
  return /^lớp\s+/i.test(s) ? s : `Lớp ${s}`;
}

export default function TeacherPortal({ onExit }) {
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

  const navItems = [
    { id: 'classes', label: 'Lớp của cô', icon: <BearClassIcon size={22} /> },
    { id: 'assignments', label: 'Bài tập & Soạn bài', icon: <BearBookIcon size={22} /> },
    { id: 'students', label: 'Học sinh', icon: <BearStudentsIcon size={22} />, badge: totalPendingStudents },
    { id: 'announcements', label: 'Thông báo & Nhắc việc', icon: <BearBellIcon size={22} /> },
    { id: 'results', label: 'Kết quả', icon: <BearResultsIcon size={22} /> },
    { id: 'settings', label: 'Cài đặt của cô', icon: <BearSettingsIcon size={22} /> },
  ];

  function handleNavSelect(itemId) {
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
        onBack={() => {
          setSelectedClassId(null);
          setCurrentNav('classes');
        }}
      />
    );
  }

  return (
    <StaffShell
      items={navItems}
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
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--s-text, #4B3621)', margin: '0 0 6px 0', fontFamily: '"Mitr", sans-serif' }}>
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
                  <select style={styles.input} value={grades} onChange={(e) => setGrades(e.target.value)}>
                    <option value="Khối 1">Khối 1</option>
                    <option value="Khối 2">Khối 2</option>
                    <option value="Khối 3">Khối 3</option>
                    <option value="Khối 4">Khối 4</option>
                    <option value="Khối 5">Khối 5</option>
                  </select>
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
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#475569', cursor: 'pointer', marginTop: 4 }}>
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
          <a href="/" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}>
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
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--s-text, #4B3621)', margin: '0 0 8px 0', fontFamily: '"Mitr", sans-serif' }}>
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
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#DC2626', margin: '0 0 6px 0', fontFamily: '"Mitr", sans-serif' }}>
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
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>
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
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.sectionHeading}>Danh sách lớp học của cô</h2>
          <p style={styles.sectionSub}>Quản lý học sinh, giao bài tập và đồng hành cùng phụ huynh</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus size={18} /> Tạo lớp mới
        </Button>
      </div>

      {/* 4 Thẻ KPI Tổng quan của Cô */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <Kpi label="Tổng số lớp học" value={classes.length} sub="Đang phụ trách" />
        <Kpi label="Tổng số học sinh" value={totalStudents} sub="Đang kết nối" />
        <Kpi label="Bài tập đang mở" value={totalActiveAssignments} sub="Học sinh đang làm" />
        <Kpi
          label="Việc cần cô xem"
          value={totalPendingStudents}
          sub={totalPendingStudents > 0 ? "Chờ cô duyệt" : "Đã hoàn thành"}
          style={{ borderColor: totalPendingStudents > 0 ? 'var(--s-warn)' : 'var(--s-line)' }}
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
                      Khối {c.grade} · Cần cô xác nhận danh sách lớp
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
        <p style={{ color: 'var(--s-text-2)' }}>Đang tải lớp học...</p>
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
                  <span style={styles.gradeBadge}>Khối {c.grade} · {c.school_year}</span>
                  <h3 style={styles.className}>{formatClassName(c.name)}</h3>
                </div>
                <div style={styles.joinCodeBox} title="Mã lớp chung">
                  <span style={{ fontSize: 10, color: '#84664A', fontWeight: 800 }}>MÃ LỚP</span>
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
        toast(`Đã tạo lớp ${name} thành công`, 'success');
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={styles.label}>Khối</label>
              <select style={styles.input} value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
                <option value={1}>Khối 1</option>
                <option value={2}>Khối 2</option>
                <option value={3}>Khối 3</option>
                <option value={4}>Khối 4</option>
                <option value={5}>Khối 5</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Năm học</label>
              <input style={styles.input} value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={styles.label}>Cách thức kết nối học sinh</label>
            <select style={styles.input} value={joinMode} onChange={(e) => setJoinMode(e.target.value)}>
              <option value="code_and_claim">Mã lớp chung + Mã học sinh riêng (Khuyên dùng)</option>
              <option value="claim_only">Chỉ nhận mã riêng (Bảo mật tuyệt đối, chỉ học sinh có tên)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={styles.label}>Hạn nộp bài mặc định</label>
              <select style={styles.input} value={defaultDueDays} onChange={(e) => setDefaultDueDays(Number(e.target.value))}>
                <option value={1}>Hôm sau (1 ngày)</option>
                <option value={2}>Sau 2 ngày</option>
                <option value={7}>Cuối tuần (7 ngày)</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Gửi đáp án cho phụ huynh</label>
              <select style={styles.input} value={shareTeacherAnswer} onChange={(e) => setShareTeacherAnswer(Number(e.target.value))}>
                <option value={1}>Có (bố mẹ giữ 1.5s để xem)</option>
                <option value={0}>Không gửi đáp án</option>
              </select>
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
function TeacherClassDetail({ token, classId, onBack, initialTab = 'assignments' }) {
  const [cls, setCls] = useState(null);
  const [tab, setTab] = useState(initialTab); // 'assignments' | 'students' | 'announcements' | 'results' | 'settings'
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedResultAsgId, setSelectedResultAsgId] = useState(null);

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

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
        setCls(data.class);
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

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <button style={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={16} /> Quay lại danh sách lớp
        </button>
      </div>

      {/* Class Banner Card */}
      <div style={styles.classBanner}>
        <div>
          <span style={styles.gradeBadge}>Khối {cls.grade} · {cls.school_year || '2026-2027'}</span>
          <h2 style={{ fontFamily: 'Mitr, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--s-text, #4B3621)', margin: '4px 0' }}>
            {formatClassName(cls.name)}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--s-text-2, #84664A)', margin: 0 }}>{cls.school_name}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={styles.joinCodeBoxLarge}>
            <span style={{ fontSize: 10, color: '#84664A', fontWeight: 800, letterSpacing: '0.5px' }}>MÃ LỚP CHUNG</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#4B3621', letterSpacing: '0.08em' }}>{cls.join_code}</span>
          </div>
          <button
            type="button"
            style={styles.qrBtn}
            onClick={() => setShowQrModal(true)}
            title="In hoặc chiếu mã QR trong buổi họp phụ huynh"
          >
            <BearQrIcon size={20} /> Mã QR
          </button>
          <button
            type="button"
            style={styles.shareZaloBtn}
            onClick={() => {
              const text = `Phụ huynh lớp ${cls.name} bấm link để kết nối con vào lớp trên Kèm Con Học: ${joinLink}`;
              if (navigator.share) {
                navigator.share({ title: `Lớp ${cls.name}`, text, url: joinLink });
              } else {
                navigator.clipboard.writeText(text);
                toast('Đã copy tin nhắn gửi phụ huynh Zalo', 'success');
              }
            }}
          >
            <Share2 size={16} /> ↗ Gửi qua Zalo
          </button>
        </div>
      </div>

      {showQrModal && (
        <QrCodeModal
          url={joinLink}
          title={`Mã QR Lớp ${cls.name}`}
          sub={`Trường ${cls.school_name || ''} · Khối ${cls.grade} · Chiếu hoặc in trong buổi họp`}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {/* Class Navigation Tabs (5 Tabs chuẩn Bản Gấu) */}
      <div style={styles.tabsRow}>
        <button
          style={{ ...styles.tabBtn, ...(tab === 'assignments' ? styles.tabBtnActive : {}) }}
          onClick={() => { setTab('assignments'); setSelectedResultAsgId(null); }}
        >
          <BearBookIcon size={20} /> Bài tập & Soạn bài
        </button>
        <button
          style={{ ...styles.tabBtn, ...(tab === 'students' ? styles.tabBtnActive : {}) }}
          onClick={() => { setTab('students'); setSelectedResultAsgId(null); }}
        >
          <BearStudentsIcon size={20} /> Danh sách học sinh {cls.pending_students_count > 0 && `(${cls.pending_students_count} chờ)`}
        </button>
        <button
          style={{ ...styles.tabBtn, ...(tab === 'announcements' ? styles.tabBtnActive : {}) }}
          onClick={() => { setTab('announcements'); setSelectedResultAsgId(null); }}
        >
          <BearBellIcon size={20} /> Thông báo & Nhắc việc
        </button>
        <button
          style={{ ...styles.tabBtn, ...(tab === 'results' ? styles.tabBtnActive : {}) }}
          onClick={() => setTab('results')}
        >
          <BearResultsIcon size={20} /> Kết quả
        </button>
        <button
          style={{ ...styles.tabBtn, ...(tab === 'settings' ? styles.tabBtnActive : {}) }}
          onClick={() => { setTab('settings'); setSelectedResultAsgId(null); }}
        >
          <BearSettingsIcon size={20} /> Cài đặt lớp
        </button>
      </div>

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
      {tab === 'announcements' && <TeacherAnnouncementsTab token={token} classId={classId} />}
      {tab === 'results' && (
        <TeacherResultsTab
          token={token}
          classId={classId}
          cls={cls}
          initialAssignmentId={selectedResultAsgId}
          onBackToAssignments={() => {
            setSelectedResultAsgId(null);
            setTab('assignments');
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
function TeacherAssignmentsTab({ token, classId, cls }) {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Bài tập đã giao</h3>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Soạn bài kèm "Cách cô dạy" để AI gợi mở đúng phương pháp</p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Soạn bài mới
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#64748B' }}>Đang tải bài tập...</p>
      ) : assignments.length === 0 ? (
        <EmptyState
          title="Chưa có bài tập nào"
          description="Cô hãy tạo bài tập để phụ huynh kèm con làm bài nhé."
          actionText="Soạn bài tập đầu tiên"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {assignments.map((a) => (
            <div key={a.id} style={styles.assignmentCard}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={a.status === 'published' ? styles.statusBadgeActive : styles.statusBadgeDraft}>
                    {a.status === 'published' ? 'Đang mở' : a.status === 'closed' ? 'Đã đóng' : 'Bản nháp'}
                  </span>
                  <span style={{ fontSize: 12, color: '#64748B' }}>Môn {a.subject}</span>
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0', color: '#1E293B' }}>{a.title}</h4>
                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                  <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Hạn nộp: {a.due_at ? new Date(a.due_at).toLocaleDateString('vi-VN') : 'Chưa đặt hạn'} · {a.item_count || 0} câu hỏi
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button style={styles.secondaryBtn} onClick={() => setSelectedAsgId(a.id)}>
                  {a.status === 'draft' ? 'Duyệt bài giảng' : 'Xem kết quả làm bài'}
                </button>
              </div>
            </div>
          ))}
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
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
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
              <select style={styles.input} value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="Toán">Toán</option>
                <option value="Tiếng Việt">Tiếng Việt</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Hạn nộp</label>
              <select style={styles.input} value={dueDays} onChange={(e) => setDueDays(Number(e.target.value))}>
                <option value={1}>Sau 1 ngày</option>
                <option value={2}>Sau 2 ngày</option>
                <option value={7}>Cuối tuần (7 ngày)</option>
              </select>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>Danh sách câu hỏi</span>
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
                    <label style={{ ...styles.label, color: '#64748B' }}>
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

  useEffect(() => {
    if (initialAssignmentId) {
      setSelectedAsgId(initialAssignmentId);
    }
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
    return <p style={{ color: 'var(--s-text-2, #84664A)', padding: 20 }}>Đang phân tích kết quả học tập...</p>;
  }

  const published = assignments.filter((a) => a.status === 'published' || a.status === 'closed');

  if (published.length === 0) {
    return (
      <EmptyState
        title="Chưa có kết quả làm bài"
        description="Lớp chưa có bài tập nào được xuất bản hoặc học sinh chưa làm bài. Cô hãy xuất bản bài tập để xem thống kê nhé!"
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px 0', color: 'var(--s-text)' }}>
          Kết quả học tập theo bài giao
        </h3>
        <p style={{ fontSize: 13, color: 'var(--s-text-2)', margin: 0 }}>
          Chọn một bài tập dưới đây để xem báo cáo chi tiết, phân bố tự làm và nhận xét của trợ lý sư phạm.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {published.map((a) => (
          <Card key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-accent-ink)' }}>{a.subject || 'Toán'}</span>
              <StatusPill variant={a.status === 'published' ? 'success' : 'default'}>
                {a.status === 'published' ? 'Đang giao' : 'Đã đóng'}
              </StatusPill>
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--s-text)' }}>{a.title}</h4>
            <div style={{ fontSize: 13, color: 'var(--s-text-2)' }}>
              {a.item_count || 0} câu hỏi · {a.completed_count || 0} lượt hoàn thành
            </div>
            <Button
              variant="primary"
              style={{ marginTop: 'auto' }}
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

// Xem kết quả làm bài của cả lớp (Prompt 11 - Staff Bản Gấu)
function AssignmentResultsView({ token, assignmentId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    loadResults();
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

  async function handleGetInsight() {
    try {
      setLoadingInsight(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/assignments/${assignmentId}/insight`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        setInsight(d.insight);
      }
    } catch {
      toast('Lỗi lấy nhận xét AI', 'error');
    } finally {
      setLoadingInsight(false);
    }
  }

  if (loading || !data) {
    return <p style={{ color: 'var(--s-text-2, #84664A)', padding: 20 }}>Đang phân tích kết quả...</p>;
  }

  const submittedCount = data.students?.filter((s) => (s.completed_items || 0) > 0).length || 0;
  const totalStudents = data.totalStudents || data.students?.length || 0;
  const totalDone = data.items?.reduce((acc, it) => acc + (it.done_count || 0), 0) || 0;
  const totalSelf = data.items?.reduce((acc, it) => acc + (it.self_count || 0), 0) || 0;
  const selfRate = totalDone > 0 ? Math.round((totalSelf / totalDone) * 100) : 0;
  const avgStuckAll = data.items?.length
    ? (data.items.reduce((acc, it) => acc + (Number(it.avg_stuck) || 0), 0) / data.items.length)
    : 0;

  let mostStuckQuestion = 'Không có';
  let maxGuided = -1;
  data.items?.forEach((it) => {
    if ((it.guided_count || 0) > maxGuided && (it.guided_count || 0) > 0) {
      maxGuided = it.guided_count;
      mostStuckQuestion = `Câu ${it.position}`;
    }
  });

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <Button variant="secondary" onClick={onBack} style={{ gap: 6 }}>
          <ArrowLeft size={16} /> Quay lại danh sách bài tập
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--s-text)' }}>{data.title}</h3>
          <p style={{ fontSize: 13, color: 'var(--s-text-2)', margin: 0 }}>Tổng số học sinh trong lớp: {totalStudents} em</p>
        </div>
        <Button variant="primary" onClick={handleGetInsight} disabled={loadingInsight} style={{ gap: 6 }}>
          <Sparkles size={16} /> {loadingInsight ? 'AI đang phân tích...' : 'Nhận xét của trợ lý AI'}
        </Button>
      </div>

      {/* 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        <Kpi label="Sĩ số nộp bài" value={`${submittedCount} / ${totalStudents}`} hint="Đã hoàn thành" />
        <Kpi label="Tỉ lệ tự chủ" value={`${selfRate}%`} hint="Tự giải không cần gợi ý" />
        <Kpi label="Số lần bí TB" value={`${avgStuckAll.toFixed(1)} lần`} hint="Mức độ trợ giúp" />
        <Kpi label="Điểm vướng nhất" value={mostStuckQuestion} hint={maxGuided > 0 ? `${maxGuided} em cần hướng dẫn` : 'Lớp làm bài tốt'} />
      </div>

      {/* AI Pedagogical Insight Box (p8_class_insight) */}
      {insight && (
        <div style={{ marginBottom: 20 }}>
          <AssistantCard
            title="Gấu trợ lý · Phân tích sư phạm"
            icon={<Sparkles size={20} color="var(--s-accent-ink, #9A5B00)" />}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13.5, color: 'var(--s-text)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--s-accent-ink)' }}>📍 Chỗ cả lớp vướng:</strong> {insight.commonStuckPoint}
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--s-text)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--s-accent-ink)' }}>💡 Gợi ý tiết dạy ngày mai:</strong> {insight.tomorrowTeachingTip}
              </div>
              {insight.studentsNeedingFollowupCodes?.length > 0 && (
                <div style={{ fontSize: 13.5, color: 'var(--s-text)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--s-accent-ink)' }}>❤️ Học sinh cần quan tâm:</strong>{' '}
                  {insight.studentsNeedingFollowupCodes.join(', ')}
                </div>
              )}
            </div>
          </AssistantCard>
        </div>
      )}

      {/* Per-item Breakdown & Step distribution chart */}
      <h4 style={{ fontSize: 15, fontWeight: 700, marginTop: 20, marginBottom: 10, color: 'var(--s-text)' }}>
        Thống kê theo câu hỏi & Biểu đồ phân bố bậc
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {data.items?.map((it) => {
          const totalAttempts = (it.self_count || 0) + (it.hint_count || 0) + (it.guided_count || 0);
          const selfPct = totalAttempts > 0 ? Math.round(((it.self_count || 0) / totalAttempts) * 100) : 0;
          const hintPct = totalAttempts > 0 ? Math.round(((it.hint_count || 0) / totalAttempts) * 100) : 0;
          const guidedPct = totalAttempts > 0 ? Math.max(0, 100 - selfPct - hintPct) : 0;

          return (
            <Card key={it.item_id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 800, color: 'var(--s-accent-ink)' }}>Câu {it.position}</span>
                <span style={{ fontSize: 12, color: 'var(--s-text-2)' }}>Đã làm: {it.done_count || 0} em</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--s-text)', margin: '0 0 10px 0' }}>{it.problem_text}</p>

              {/* Stacked Progress Bar */}
              <div style={{ height: 10, borderRadius: 999, overflow: 'hidden', display: 'flex', backgroundColor: 'var(--s-line)', marginBottom: 10 }}>
                {selfPct > 0 && <div style={{ width: `${selfPct}%`, backgroundColor: '#10B981' }} title={`Tự làm: ${selfPct}%`} />}
                {hintPct > 0 && <div style={{ width: `${hintPct}%`, backgroundColor: '#F59E0B' }} title={`Cần gợi ý: ${hintPct}%`} />}
                {guidedPct > 0 && <div style={{ width: `${guidedPct}%`, backgroundColor: '#F43F5E' }} title={`Hướng dẫn sâu: ${guidedPct}%`} />}
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <StatusPill variant="success">Tự làm được: {it.self_count || 0} ({selfPct}%)</StatusPill>
                <StatusPill variant="warning">Cần gợi ý: {it.hint_count || 0} ({hintPct}%)</StatusPill>
                <StatusPill variant="danger">Hướng dẫn nhiều: {it.guided_count || 0} ({guidedPct}%)</StatusPill>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Student List Progress Table */}
      <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: 'var(--s-text)' }}>
        Danh sách làm bài của học sinh
      </h4>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--s-line)', backgroundColor: 'var(--s-bg)' }}>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--s-text)' }}>Tên học sinh</th>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--s-text)' }}>Số câu đã làm</th>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--s-text)' }}>Mức tự làm</th>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--s-text)' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {data.students?.map((s) => (
              <tr key={s.student_id} style={{ borderBottom: '1px solid var(--s-line)' }}>
                <td style={{ padding: '10px 14px', color: 'var(--s-text)' }}><strong>{s.roster_name}</strong></td>
                <td style={{ padding: '10px 14px', color: 'var(--s-text-2)' }}>{s.completed_items || 0} câu</td>
                <td style={{ padding: '10px 14px' }}>
                  {s.teach_back_rating === 'self' && <StatusPill variant="success">Tự giải</StatusPill>}
                  {s.teach_back_rating === 'hint' && <StatusPill variant="warning">Cần gợi ý</StatusPill>}
                  {s.teach_back_rating === 'guided' && <StatusPill variant="info">Mẹ kèm kỹ</StatusPill>}
                  {!s.teach_back_rating && <span style={{ color: 'var(--s-text-2)' }}>-</span>}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  {s.completed_items > 0 ? (
                    <StatusPill variant="success">Đã hoàn thành</StatusPill>
                  ) : (
                    <StatusPill variant="default">Chưa làm</StatusPill>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Danh sách học sinh ({students.length})</h3>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Mỗi học sinh có mã riêng XXX-XXX để phụ huynh kết nối ngay</p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setShowRosterModal(true)}>
          <Plus size={16} /> Dán danh sách học sinh
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#64748B' }}>Đang tải danh sách học sinh...</p>
      ) : students.length === 0 ? (
        <EmptyState
          title="Chưa có học sinh nào"
          description="Cô có thể dán danh sách tên học sinh để hệ thống sinh mã riêng cho từng em."
          actionText="Thêm danh sách lớp"
          onAction={() => setShowRosterModal(true)}
        />
      ) : (
        <div style={styles.tableCard}>
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
                    <strong>{s.rosterName}</strong>
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
                    {s.status === 'active' && <span style={styles.statusBadgeActive}>Đã kết nối</span>}
                    {s.status === 'pending' && <span style={styles.statusBadgePending}>Chờ cô duyệt</span>}
                    {s.status === 'invited' && <span style={styles.statusBadgeDraft}>Đã gửi mã</span>}
                    {s.status === 'rejected' && <span style={styles.statusBadgeRejected}>Đã từ chối</span>}
                  </td>
                  <td style={styles.td}>
                    {s.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={styles.approveBtn} onClick={() => handleApprove(s.id)}>Duyệt</button>
                        <button style={styles.rejectBtn} onClick={() => handleReject(s.id)}>Từ chối</button>
                      </div>
                    )}
                    {s.status === 'invited' && s.claimCode && (
                      <button
                        style={styles.copyBtn}
                        onClick={() => {
                          const claimLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/vao-lop/m/${s.claimCode}`;
                          navigator.clipboard.writeText(`Phụ huynh bé ${s.rosterName} bấm link để kết nối vào lớp trên Kèm Con Học: ${claimLink}`);
                          toast(`Đã sao chép link riêng của bé ${s.rosterName}`, 'success');
                        }}
                      >
                        <Copy size={12} /> Link riêng
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
function TeacherAnnouncementsTab({ token, classId }) {
  const [seg, setSeg] = useState('announcements'); // 'announcements' | 'reminders'
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Standard Announcement state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [requireAck, setRequireAck] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  // Reminders state (Prompt 04 mục 4b)
  const quickDates = getQuickReminderDates();
  const [selectedTemplate, setSelectedTemplate] = useState(REMINDER_TEMPLATES[0].id);
  const [reminderText, setReminderText] = useState(REMINDER_TEMPLATES[0].template);
  const [selectedDate, setSelectedDate] = useState(quickDates[0].date);
  const [attachAssignment, setAttachAssignment] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [classAssignments, setClassAssignments] = useState([]);
  const [remindersList, setRemindersList] = useState(() => {
    try {
      const stored = localStorage.getItem('kem-con-hoc:teacher-reminders');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

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
      }
    } catch {
      toast('Lỗi gửi thông báo', 'error');
    }
  }

  // Đếm số lời nhắc đã gửi hôm nay
  const todayStr = new Date().toISOString().slice(0, 10);
  const remindersSentToday = remindersList.filter((r) => r.created_at?.startsWith(todayStr)).length;

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl.id);
    setReminderText(tpl.template);
  };

  const [viewingReadsAnn, setViewingReadsAnn] = useState(null);
  const [readsData, setReadsData] = useState([]);
  const [readsLoading, setReadsLoading] = useState(false);

  const handleSendReminder = async (e) => {
    e.preventDefault();
    if (!reminderText.trim()) return;

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
        toast('Đã gửi lời nhắc việc cho phụ huynh lớp! 🔔', 'success');
        loadAnnouncements();
      } else {
        toast(d.error?.message || d.error || 'Gộp vào một lời nhắc nhé cô', 'error');
      }
    } catch {
      toast('Lỗi kết nối khi gửi lời nhắc', 'error');
    }
  };

  const handleOpenReads = async (ann) => {
    setViewingReadsAnn(ann);
    setReadsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/announcements/${ann.id}/reads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) {
        setReadsData(d.reads || []);
      }
    } catch {
      toast('Lỗi tải danh sách đã đọc', 'error');
    } finally {
      setReadsLoading(false);
    }
  };

  return (
    <div>
      {/* Segment Selector: Thông báo vs Nhắc việc */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: 700,
            cursor: 'pointer',
            border: '1.5px solid #CBD5E1',
            background: seg === 'announcements' ? 'var(--s-accent, #9B6916)' : '#FFFFFF',
            color: seg === 'announcements' ? '#FFFFFF' : '#334155',
          }}
          onClick={() => setSeg('announcements')}
        >
          📢 Thông báo lớp
        </button>
        <button
          type="button"
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: 700,
            cursor: 'pointer',
            border: '1.5px solid #CBD5E1',
            background: seg === 'reminders' ? '#D6336C' : '#FFFFFF',
            color: seg === 'reminders' ? '#FFFFFF' : '#334155',
          }}
          onClick={() => setSeg('reminders')}
        >
          ⏰ Nhắc việc
        </button>
      </div>

      {/* SEGMENT 1: THÔNG BÁO TIÊU CHUẨN */}
      {seg === 'announcements' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Thông báo một chiều</h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Gửi nhắc nhở ôn bài, lịch thi và theo dõi phụ huynh đã đọc</p>
            </div>
            <button style={styles.primaryBtn} onClick={() => setShowCreate(!showCreate)}>
              <Plus size={16} /> Soạn thông báo mới
            </button>
          </div>

          {showCreate && (
            <form onSubmit={handleCreate} style={{ ...styles.card, marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Soạn thông báo mới</h4>
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
                <div style={{ display: 'flex', gap: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
                    Ghim đầu lớp
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={requireAck} onChange={(e) => setRequireAck(e.target.checked)} />
                    Yêu cầu phụ huynh bấm "Đã đọc"
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="submit" style={styles.primaryBtn}>Gửi thông báo</button>
                  <button type="button" style={styles.secondaryBtn} onClick={() => setShowCreate(false)}>Huỷ</button>
                </div>
              </div>
            </form>
          )}

          {loading ? (
            <p style={{ color: '#64748B' }}>Đang tải thông báo...</p>
          ) : announcements.length === 0 ? (
            <EmptyState
              title="Chưa có thông báo nào"
              description="Chưa có thông báo nào được gửi tới phụ huynh lớp này."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {announcements.map((an) => (
                <div key={an.id} style={styles.assignmentCard}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {an.pinned === 1 && <span style={styles.pinnedBadge}>Đã ghim</span>}
                      {an.require_ack === 1 && <span style={styles.ackBadge}>Cần xác nhận</span>}
                      <span style={{ fontSize: 12, color: '#64748B' }}>
                        {new Date(an.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>{an.title}</h4>
                    <p style={{ fontSize: 14, color: '#475569', margin: '0 0 8px 0', lineHeight: 1.5 }}>{an.body}</p>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      Đã đọc: <strong>{an.read_count || 0}</strong> gia đình · Đã xác nhận: <strong>{an.ack_count || 0}</strong> gia đình
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEGMENT 2: NHẮC VIỆC (PROMPT 04 MỤC 4b) */}
      {seg === 'reminders' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 480px) 1fr', gap: 20 }}>
          {/* Form Soạn Nhắc Việc */}
          <div style={{ ...styles.card, padding: 18 }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
              Cô soạn nhắc việc
            </h4>
            <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 14px 0' }}>
              Thẻ nổi trên màn chính của mẹ từ trưa hôm trước tới trưa ngày áp dụng. Mẹ bấm "Đã nhắc con" là xong.
            </p>

            {/* 6 mẫu nhanh */}
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                Mẫu soạn nhanh (chọn mẫu):
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {REMINDER_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '5px 10px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: selectedTemplate === tpl.id ? '1.5px solid #D6336C' : '1px solid #E2E8F0',
                      background: selectedTemplate === tpl.id ? '#FDF2F8' : '#F8FAFC',
                      color: selectedTemplate === tpl.id ? '#BE185D' : '#334155',
                    }}
                  >
                    <span>{tpl.icon}</span>
                    <span>{tpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hộp soạn lời nhắc */}
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                Lời nhắc (chạm để chỉnh sửa):
              </span>
              <textarea
                style={{ ...styles.input, minHeight: 70, fontSize: 13.5, lineHeight: 1.5 }}
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
              />
            </div>

            {/* Chọn ngày áp dụng */}
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                Áp dụng cho ngày:
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {quickDates.map((qd) => (
                  <button
                    key={qd.date}
                    type="button"
                    onClick={() => setSelectedDate(qd.date)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: selectedDate === qd.date ? '1.5px solid #4F46E5' : '1px solid #E2E8F0',
                      background: selectedDate === qd.date ? '#EEF2FF' : '#FFFFFF',
                      color: selectedDate === qd.date ? '#4338CA' : '#475569',
                    }}
                  >
                    {qd.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gắn với bài đã giao */}
            <div style={{ marginBottom: 16, padding: '10px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={attachAssignment}
                  onChange={(e) => setAttachAssignment(e.target.checked)}
                />
                <span>Gắn với bài đã giao</span>
              </label>

              {attachAssignment && (
                <div style={{ marginTop: 8 }}>
                  <select
                    style={{ ...styles.input, fontSize: 12.5 }}
                    value={selectedAssignmentId}
                    onChange={(e) => setSelectedAssignmentId(e.target.value)}
                  >
                    {classAssignments.length === 0 ? (
                      <option value="">(Chưa có bài tập nào)</option>
                    ) : (
                      classAssignments.map((asg) => (
                        <option key={asg.id} value={asg.id}>
                          {asg.title} ({asg.subject || 'Toán'})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Giới hạn Quota */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: 12 }}>
              <span style={{ color: remindersSentToday >= MAX_REMINDERS_PER_DAY ? '#DC2626' : '#64748B', fontWeight: 700 }}>
                Hôm nay đã gửi {remindersSentToday}/{MAX_REMINDERS_PER_DAY} lời nhắc
              </span>
              <span style={{ color: '#94A3B8' }}>Tối đa 3 lời nhắc/ngày</span>
            </div>

            {/* Nút gửi */}
            <button
              type="button"
              onClick={handleSendReminder}
              disabled={remindersSentToday >= MAX_REMINDERS_PER_DAY}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 8,
                background: remindersSentToday >= MAX_REMINDERS_PER_DAY ? '#94A3B8' : '#D6336C',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 14,
                border: 'none',
                cursor: remindersSentToday >= MAX_REMINDERS_PER_DAY ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Send size={16} />
              <span>Gửi cho 28 gia đình</span>
            </button>
          </div>

          {/* Cột Theo Dõi Lời Nhắc Đã Gửi */}
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
              Theo dõi tình trạng nhắc con
            </h4>

            {remindersList.length === 0 ? (
              <EmptyState
                title="Chưa có lời nhắc việc"
                description="Chưa có lời nhắc việc nào được gửi gần đây."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {remindersList.map((rem) => (
                  <div key={rem.id} style={{ ...styles.card, padding: 16, borderLeft: '4px solid #D6336C' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <b style={{ fontSize: 14.5, color: '#0F172A', display: 'block' }}>{rem.message}</b>
                        <span style={{ fontSize: 12, color: '#64748B' }}>
                          📅 Áp dụng: {rem.target_date} {rem.assignment_id ? '· Có kèm bài tập' : ''}
                        </span>
                      </div>
                    </div>

                    {/* 3 chỉ số theo dõi */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, background: '#F8FAFC', padding: '10px 12px', borderRadius: 8, marginBottom: 12, textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{rem.read_count || 24}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>đã đọc</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#16A34A' }}>{rem.done_count || 19}</div>
                        <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 700 }}>đã nhắc con</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#4F46E5' }}>{rem.total_count || 28}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>gia đình</div>
                      </div>
                    </div>

                    {/* Danh sách học sinh theo lớp */}
                    <div>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 6 }}>
                        Chi tiết theo gia đình trong lớp:
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(rem.students || [
                          { name: 'Nguyễn Minh Anh (Mít)', status: 'done', time: '19:05' },
                          { name: 'Trần Bảo Nam', status: 'done', time: '18:40' },
                          { name: 'Lê Gia Hân', status: 'read' },
                          { name: 'Phạm Tuấn Kiệt', status: 'read' },
                          { name: 'Võ Khánh Linh', status: 'unread' },
                        ]).map((st, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: 12.5,
                              padding: '4px 8px',
                              background: '#FFFFFF',
                              borderRadius: 6,
                              border: '1px solid #F1F5F9',
                            }}
                          >
                            <span>{st.name}</span>
                            {st.status === 'done' ? (
                              <span style={{ color: '#16A34A', fontWeight: 700, background: '#DCFCE7', padding: '2px 8px', borderRadius: 999 }}>
                                ✓ Đã nhắc con {st.time}
                              </span>
                            ) : st.status === 'read' ? (
                              <span style={{ color: '#9A5B00', fontWeight: 700, background: '#FFF1D6', border: '1px solid #F6C56A', padding: '2px 8px', borderRadius: 999 }}>
                                Đã đọc
                              </span>
                            ) : (
                              <span style={{ color: '#94A3B8', fontWeight: 600, background: '#F1F5F9', padding: '2px 8px', borderRadius: 999 }}>
                                Chưa đọc
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <p style={{ fontSize: 11, color: '#94A3B8', margin: '10px 0 0 0', fontStyle: 'italic' }}>
                      Cô chỉ thấy trạng thái đọc và đã nhắc. Không thấy dữ liệu học, ảnh hay chat của gia đình.
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
  const [shareTeacherAnswer, setShareTeacherAnswer] = useState(cls.share_teacher_answer || 1);
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
        <h4 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Cài đặt lớp học</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={styles.label}>Cách thức kết nối học sinh</label>
            <select style={styles.input} value={joinMode} onChange={(e) => setJoinMode(e.target.value)}>
              <option value="code_and_claim">Mã lớp chung + Mã học sinh riêng</option>
              <option value="claim_only">Chỉ mã riêng (tắt mã chung)</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>Hạn nộp bài mặc định khi tạo bài tập</label>
            <select style={styles.input} value={defaultDueDays} onChange={(e) => setDefaultDueDays(Number(e.target.value))}>
              <option value={1}>Sau 1 ngày</option>
              <option value={2}>Sau 2 ngày</option>
              <option value={7}>Sau 7 ngày</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>Gửi đáp án của cô cho phụ huynh</label>
            <select style={styles.input} value={shareTeacherAnswer} onChange={(e) => setShareTeacherAnswer(Number(e.target.value))}>
              <option value={1}>Cho phép phụ huynh xem (giữ 1.5s)</option>
              <option value={0}>Không hiển thị đáp án</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
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

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 style={styles.sectionHeading}>Cài đặt của cô</h2>
      <p style={styles.sectionSub}>Thư viện phương pháp dạy học & thông tin tài khoản</p>

      {/* Thư viện "Cách cô dạy" */}
      <div style={{ ...styles.card, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={18} color="#F6A623" />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Thư viện "Cách cô dạy" (Dùng lại khi soạn bài)</h3>
        </div>

        <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <input
              style={styles.input}
              placeholder="Tên phương pháp: ví dụ Sơ đồ đoạn thẳng toán 2 bước"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <select style={styles.input} value={newType} onChange={(e) => setNewType(e.target.value)}>
              <option value="word_problem_multistep">Toán lời văn</option>
              <option value="arithmetic">Phép tính / Bảng nhân chia</option>
              <option value="geometry">Hình học</option>
              <option value="vietnamese">Tiếng Việt</option>
            </select>
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
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{newNote.length}/300 ký tự</span>
          </div>
          <button type="submit" disabled={addingNote} style={styles.primaryBtn}>
            <Plus size={14} /> Thêm vào thư viện
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {methodNotes.map((n) => (
            <div key={n.id} style={styles.noteItem}>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14, color: '#1E293B' }}>{n.title}</strong>
                <p style={{ fontSize: 13, color: '#475569', margin: '2px 0 0 0' }}>{n.note}</p>
              </div>
              <button style={{ ...styles.iconBtn, color: '#DC2626' }} onClick={() => handleDeleteNote(n.id)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Hồ sơ giáo viên */}
      <div style={styles.card}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 700 }}>Thông tin tài khoản</h3>
        <p style={{ fontSize: 14, color: '#475569', margin: '4px 0' }}><strong>Họ tên:</strong> {teacher.display_name}</p>
        <p style={{ fontSize: 14, color: '#475569', margin: '4px 0' }}><strong>Trường:</strong> {teacher.school_name}</p>
        <p style={{ fontSize: 14, color: '#475569', margin: '4px 0' }}><strong>Email:</strong> {teacher.email}</p>
        <p style={{ fontSize: 14, color: '#475569', margin: '4px 0' }}><strong>Khối dạy:</strong> {teacher.grades}</p>

        <div style={{ marginTop: 16 }}>
          <button style={styles.secondaryBtn} onClick={onLogout}>Đăng xuất khỏi hệ thống</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STYLES: CỔNG GIÁO VIÊN BẢN GẤU (Mitr + Nunito, bảng màu ấm áp #FFF8EC)
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
    fontFamily: '"Mitr", sans-serif',
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
    fontFamily: '"Mitr", sans-serif',
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
    fontSize: 11,
    fontWeight: 800,
    color: '#9A5B00',
    backgroundColor: '#FFF1D6',
    border: '1px solid #F6C56A',
    padding: '3px 9px',
    borderRadius: 999,
    marginBottom: 6,
  },
  className: {
    fontFamily: '"Mitr", sans-serif',
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
    fontSize: 11,
    fontWeight: 800,
    color: '#047857',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    padding: '3px 8px',
    borderRadius: 999,
  },
  statusBadgeDraft: {
    fontSize: 11,
    fontWeight: 800,
    color: '#84664A',
    backgroundColor: '#FFF8EC',
    border: '1px solid #F0DDC2',
    padding: '3px 8px',
    borderRadius: 999,
  },
  statusBadgePending: {
    fontSize: 11,
    fontWeight: 800,
    color: '#9A5B00',
    backgroundColor: '#FFF1D6',
    border: '1px solid #F6C56A',
    padding: '3px 8px',
    borderRadius: 999,
  },
  statusBadgeRejected: {
    fontSize: 11,
    fontWeight: 800,
    color: '#BE123C',
    backgroundColor: '#FFF1F2',
    border: '1px solid #FECDD3',
    padding: '3px 8px',
    borderRadius: 999,
  },
  pinnedBadge: {
    fontSize: 11,
    fontWeight: 800,
    color: '#9A5B00',
    backgroundColor: '#FFF1D6',
    border: '1px solid #F6C56A',
    padding: '3px 8px',
    borderRadius: 999,
  },
  ackBadge: {
    fontSize: 11,
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
    fontSize: 11.5,
    fontWeight: 800,
    color: '#047857',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    padding: '2px 8px',
    borderRadius: 999,
  },
  tagHint: {
    fontSize: 11.5,
    fontWeight: 800,
    color: '#9A5B00',
    backgroundColor: '#FFF1D6',
    border: '1px solid #F6C56A',
    padding: '2px 8px',
    borderRadius: 999,
  },
  tagGuided: {
    fontSize: 11.5,
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
    fontSize: 11,
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
    fontSize: 10.5,
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
    fontSize: 11.5,
    fontWeight: 800,
    cursor: 'pointer',
  },
  rejectBtn: {
    backgroundColor: '#BE123C',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 11.5,
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
    fontSize: 11,
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
    fontSize: 11.5,
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
    zIndex: 100,
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    width: '100%',
    maxWidth: 520,
    boxShadow: '0 20px 40px rgba(75, 54, 33, 0.25)',
    border: '2px solid #F0DDC2',
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
