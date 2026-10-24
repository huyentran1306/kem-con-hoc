import { useState, useEffect, useRef } from 'react'
import { GATEWAY } from './api'
import { toast } from './utils'
import './admin.css'

// Subsystems
import { BearMascot } from './AdminMascot'
import { AdminLockScreen } from './AdminLockScreen'
import { AdminOverviewTab } from './AdminOverviewTab'
import { AdminFamiliesTab } from './AdminFamiliesTab'
import { AdminSessionsTab } from './AdminSessionsTab'
import { AdminReportsTab } from './AdminReportsTab'
import { AdminTeachersTab } from './AdminTeachersTab'
import { AdminConfigTab } from './AdminConfigTab'
import { AdminToolsTab } from './AdminToolsTab'

const ADMIN_STORAGE_KEY = 'kem-con-hoc:admin-auth'
const ADMIN_THEME_KEY = 'kem-con-hoc:admin-theme'
const ADMIN_PROFILE_KEY = 'kem-con-hoc:admin-profile'

export const CONFIG_SUBTABS = [
  { id: 'model', label: 'Mô hình & Tham số', icon: '⚙️' },
  { id: 'prompts', label: 'Prompt Studio', icon: '🧪' },
  { id: 'router', label: 'Router Sư phạm', icon: '🔀' },
  { id: 'scope', label: 'Phạm vi Đề & Ảnh', icon: '🛡️' },
  { id: 'themes', label: 'Giao diện App', icon: '🎨' },
  { id: 'admins', label: 'Quản trị viên & PIN', icon: '👥' },
  { id: 'audit', label: 'Nhật ký thao tác', icon: '📜' },
  { id: 'infra', label: 'Hạ tầng Cloudflare', icon: '☁️' },
  { id: 'zalo', label: 'Thông báo & Zalo', icon: '💬' },
]

export default function AdminPortal({ onExit }) {
  // Theme state: 'bear' (default) or 'blue'
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(ADMIN_THEME_KEY)
      return saved === 'blue' ? 'blue' : 'bear'
    } catch (e) {
      return 'bear'
    }
  })

  // Token & Profile State
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_STORAGE_KEY) || ''
    } catch (e) {
      return ''
    }
  })

  const [adminProfile, setAdminProfile] = useState(() => {
    try {
      const p = localStorage.getItem(ADMIN_PROFILE_KEY)
      return p ? JSON.parse(p) : { email: 'admin@kemconhoc.vn', name: 'Quản trị viên', role: 'superadmin' }
    } catch (e) {
      return { email: 'admin@kemconhoc.vn', name: 'Quản trị viên', role: 'superadmin' }
    }
  })

  const [authed, setAuthed] = useState(() => Boolean(token))
  const [isLocked, setIsLocked] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // overview | families | sessions | reports | teachers | config | tools
  const [configSubTab, setConfigSubTab] = useState('model') // model | prompts | router | scope | themes | admins | audit | infra | zalo
  const [showMobileNav, setShowMobileNav] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@kemconhoc.vn')
  const [loginPass, setLoginPass] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showPass, setShowPass] = useState(false)

  // Inactivity auto-lock timer (default 15 minutes = 900,000 ms)
  const idleTimerRef = useRef(null)

  // Persist and apply theme
  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_THEME_KEY, theme)
    } catch (e) {}
    document.documentElement.setAttribute('data-admin-theme', theme)
  }, [theme])

  // Inactivity watcher
  useEffect(() => {
    if (!authed || isLocked) return

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        handleTriggerLock()
      }, 15 * 60 * 1000) // 15 mins
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((ev) => window.addEventListener(ev, resetIdleTimer))
    resetIdleTimer()

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      events.forEach((ev) => window.removeEventListener(ev, resetIdleTimer))
    }
  }, [authed, isLocked, token])

  // Trigger server lock
  const handleTriggerLock = async () => {
    if (!token) return
    try {
      await fetch(`${GATEWAY}/api/v1/admin/auth/lock`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (e) {
      console.warn('Server lock error:', e)
    }
    setIsLocked(true)
    toast('Đã khoá màn hình quản trị an toàn 🔒')
  }

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPass) {
      setLoginError('Vui lòng nhập email và mật khẩu')
      return
    }
    setLoginBusy(true)
    setLoginError('')

    try {
      const res = await fetch(`${GATEWAY}/api/v1/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPass }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.token) {
        setToken(data.token)
        setAuthed(true)
        setIsLocked(false)
        if (data.admin) {
          setAdminProfile(data.admin)
          try {
            localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(data.admin))
          } catch (e) {}
        }
        try {
          localStorage.setItem(ADMIN_STORAGE_KEY, data.token)
        } catch (e) {}
        toast('Đăng nhập Quản trị viên thành công 👑')
      } else {
        setLoginError(data.error?.message || 'Email hoặc mật khẩu không chính xác')
      }
    } catch (e) {
      setLoginError('Không kết nối được máy chủ')
    } finally {
      setLoginBusy(false)
    }
  }

  // Handle Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY)
      localStorage.removeItem(ADMIN_PROFILE_KEY)
    } catch (e) {}
    setToken('')
    setAuthed(false)
    setIsLocked(false)
    setLoginPass('')
    toast('Đã đăng xuất khỏi cổng Quản trị')
  }

  // Toggle Theme
  const toggleTheme = () => {
    const next = theme === 'bear' ? 'blue' : 'bear'
    setTheme(next)
    toast(next === 'bear' ? 'Đã chuyển sang giao diện Bản Gấu (Ấm áp) 🐻' : 'Đã chuyển sang giao diện Xanh dương (Executive Blue) 🔷')
  }

  // If locked, render dedicated PIN Lock Screen
  if (authed && isLocked) {
    return (
      <div className="stitch-admin-root" data-admin-theme={theme}>
        <AdminLockScreen
          token={token}
          onUnlock={() => {
            setIsLocked(false)
            toast('Đã mở khoá phiên làm việc thành công! ✨')
          }}
          onLogout={handleLogout}
        />
      </div>
    )
  }

  // If not authed, show Login Screen
  if (!authed) {
    return (
      <div className="stitch-admin-root" data-admin-theme={theme} style={{ alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="stitch-lock-card" style={{ maxWidth: '420px', width: '100%' }}>
          <div className="bear-mascot-wrap" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <BearMascot mood="greeting" size={90} />
          </div>

          <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, textAlign: 'center', color: 'var(--adm-text)' }}>
            Kèm Con Học · Cổng Quản Trị
          </h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '13px', textAlign: 'center', color: 'var(--adm-sub)' }}>
            Đăng nhập tài khoản quản trị để vận hành hệ thống
          </p>

          {loginError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="stitch-form-group">
              <label className="stitch-label">Email quản trị viên</label>
              <input
                type="email"
                required
                className="stitch-input"
                placeholder="admin@kemconhoc.vn"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="stitch-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="stitch-label">Mật khẩu</label>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ background: 'none', border: 'none', color: 'var(--adm-sub)', fontSize: '12px', cursor: 'pointer' }}
                >
                  {showPass ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                required
                className="stitch-input"
                placeholder="Nhập mật khẩu..."
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loginBusy}
              className="stitch-btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '16px', fontSize: '15px' }}
            >
              {loginBusy ? 'Đang xác thực...' : 'Đăng nhập Quản trị viên'}
            </button>
            <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '11.5px', color: 'var(--adm-sub)' }}>
              Tài khoản mặc định: <code>admin@kemconhoc.vn</code> / <code>admin123</code>
            </div>
          </form>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--adm-border)' }}>
            <button
              type="button"
              className="stitch-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={toggleTheme}
            >
              {theme === 'bear' ? '🐻 Bản Gấu' : '🔷 Xanh dương'}
            </button>
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                style={{ background: 'none', border: 'none', color: 'var(--adm-sub)', fontSize: '12px', cursor: 'pointer' }}
              >
                ← Quay lại App phụ huynh
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Authenticated Portal
  const isSupport = adminProfile?.role === 'support'

  return (
    <div className="stitch-admin-root" data-admin-theme={theme}>
      {/* 256px Fixed Sidebar */}
      <aside className={`stitch-sidebar ${showMobileNav ? 'mobile-open' : ''}`}>
        <div className="stitch-sidebar-header">
          <div className="stitch-brand-logo">
            {theme === 'bear' ? '🐻' : '🔷'}
          </div>
          <div>
            <h1 className="stitch-brand-title">Kèm Con Học</h1>
            <span className="stitch-brand-badge">Admin · Stitch</span>
          </div>
        </div>

        {/* 7 Core Subsystems Navigation */}
        <nav className="stitch-sidebar-nav">
          <button
            type="button"
            className={`stitch-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setShowMobileNav(false) }}
          >
            <span className="stitch-nav-icon">📊</span>
            <span>Tổng quan</span>
          </button>

          <button
            type="button"
            className={`stitch-nav-item ${activeTab === 'families' ? 'active' : ''}`}
            onClick={() => { setActiveTab('families'); setShowMobileNav(false) }}
          >
            <span className="stitch-nav-icon">👨‍👩‍👧</span>
            <span>Gia đình & Học sinh</span>
          </button>

          <button
            type="button"
            className={`stitch-nav-item ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => { setActiveTab('sessions'); setShowMobileNav(false) }}
          >
            <span className="stitch-nav-icon">📓</span>
            <span>Nhật ký & AI</span>
          </button>

          <button
            type="button"
            className={`stitch-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => { setActiveTab('reports'); setShowMobileNav(false) }}
          >
            <span className="stitch-nav-icon">📈</span>
            <span>Báo cáo & NPS</span>
          </button>

          <button
            type="button"
            className={`stitch-nav-item ${activeTab === 'teachers' ? 'active' : ''}`}
            onClick={() => { setActiveTab('teachers'); setShowMobileNav(false) }}
          >
            <span className="stitch-nav-icon">🎓</span>
            <span>Giáo viên & Lớp</span>
          </button>

          {!isSupport && (
            <div>
              <button
                type="button"
                className={`stitch-nav-item ${activeTab === 'config' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('config')
                  setShowMobileNav(false)
                }}
                style={{ justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="stitch-nav-icon">⚙️</span>
                  <span>Cấu hình AI & Hệ thống</span>
                </div>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>
                  {activeTab === 'config' ? '▾' : '▸'}
                </span>
              </button>

              {activeTab === 'config' && (
                <div className="stitch-nav-subgroup">
                  {CONFIG_SUBTABS.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      className={`stitch-nav-subitem ${configSubTab === sub.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveTab('config')
                        setConfigSubTab(sub.id)
                        setShowMobileNav(false)
                      }}
                    >
                      <span className="sub-icon">{sub.icon}</span>
                      <span>{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isSupport && (
            <button
              type="button"
              className={`stitch-nav-item ${activeTab === 'tools' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tools'); setShowMobileNav(false) }}
            >
              <span className="stitch-nav-icon">🛠️</span>
              <span>Công cụ nội bộ</span>
            </button>
          )}
        </nav>

        {/* Mascot Notice */}
        <div className="stitch-bear-notice-card">
          <div className="bear-mascot-wrap">
            <BearMascot mood="happy" size={42} />
          </div>
          <div className="stitch-bear-notice-text">
            Hôm nay đã có 84 buổi kèm học thành công!
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="stitch-sidebar-footer">
          <div className="stitch-ai-status-badge">
            <span className="stitch-ai-dot" />
            <span>AI Gateway: Hoạt động</span>
          </div>

          <div className="stitch-user-profile-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div className="stitch-avatar-initial">
                {(adminProfile.name || 'A')[0].toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--adm-text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {adminProfile.name || 'Admin'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--adm-sub)' }}>
                  {adminProfile.role || 'superadmin'}
                </div>
              </div>
            </div>

            <div className="stitch-footer-actions">
              <button
                type="button"
                className="stitch-btn-icon"
                title="Khoá màn hình ngay"
                onClick={handleTriggerLock}
              >
                🔒
              </button>
              <button
                type="button"
                className="stitch-btn-icon"
                title="Đăng xuất"
                onClick={handleLogout}
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Layout Area */}
      <main className="stitch-main-layout">
        {/* 64px Header */}
        <header className="stitch-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              className="stitch-btn-icon"
              style={{ display: 'none' }} // Mobile responsive toggle
              onClick={() => setShowMobileNav(!showMobileNav)}
            >
              ☰
            </button>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--adm-text)' }}>
              {activeTab === 'overview' && 'Bảng điều khiển Tổng quan'}
              {activeTab === 'families' && 'Quản lý Gia đình & Học sinh'}
              {activeTab === 'sessions' && 'Nhật ký kèm học & Đánh giá AI'}
              {activeTab === 'reports' && 'Báo cáo Sư phạm & Chỉ số NPS'}
              {activeTab === 'teachers' && 'Duyệt Giáo viên & Lớp học'}
              {activeTab === 'config' && `Cấu hình AI & Hệ thống · ${CONFIG_SUBTABS.find((s) => s.id === configSubTab)?.label || ''}`}
              {activeTab === 'tools' && 'Công cụ nội bộ & SQL Studio'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Theme switcher */}
            <button
              type="button"
              className="stitch-btn-secondary"
              onClick={toggleTheme}
              style={{ fontSize: '13px', padding: '6px 14px' }}
              title="Đổi giao diện Bản Gấu / Xanh dương"
            >
              {theme === 'bear' ? '🐻 Bản Gấu' : '🔷 Xanh dương'}
            </button>

            {/* Manual lock button */}
            <button
              type="button"
              className="stitch-btn-secondary"
              onClick={handleTriggerLock}
              style={{ fontSize: '13px', padding: '6px 12px' }}
              title="Khoá an toàn"
            >
              🔒 Khoá
            </button>

            {onExit && (
              <button
                type="button"
                className="stitch-btn-secondary"
                onClick={onExit}
                style={{ fontSize: '13px', padding: '6px 12px' }}
              >
                ← Ra App
              </button>
            )}
          </div>
        </header>

        {/* Tab Content Display Area */}
        <div className="stitch-content-area" style={{ padding: '24px 28px', flex: 1 }}>
          {activeTab === 'overview' && (
            <AdminOverviewTab
              token={token}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'families' && (
            <AdminFamiliesTab token={token} />
          )}

          {activeTab === 'sessions' && (
            <AdminSessionsTab
              token={token}
              onOpenPromptStudio={() => { setActiveTab('config'); setConfigSubTab('prompts') }}
            />
          )}

          {activeTab === 'reports' && (
            <AdminReportsTab token={token} />
          )}

          {activeTab === 'teachers' && (
            <AdminTeachersTab token={token} />
          )}


          {activeTab === 'config' && !isSupport && (
            <AdminConfigTab
              token={token}
              adminProfile={adminProfile}
              activeSubTab={configSubTab}
              onSubTabChange={(sub) => setConfigSubTab(sub)}
            />
          )}

          {activeTab === 'tools' && !isSupport && (
            <AdminToolsTab
              token={token}
              adminProfile={adminProfile}
            />
          )}
        </div>
      </main>
    </div>
  )
}
