import { useState, useEffect, useRef, useCallback } from 'react'
import { GATEWAY } from './api'
import { onToast } from './utils'
import {
  adminFetch,
  readAdminToken,
  saveAdminToken,
  clearAdminToken,
  ADMIN_UNAUTHORIZED_EVENT,
  ADMIN_LOCKED_EVENT,
} from './adminApi'
import './admin.css'

// Bộ quy chuẩn giao diện dùng chung
import { ToastHost, ConfirmHost, staffToast, EmptyState, Button, BearMascot } from './ui/staff'

// Khung admin (Đợt 15 · Chặng 2)
import { AdminLockScreen } from './AdminLockScreen'
import { ShellSidebar } from './admin/ShellSidebar.jsx'
import { ShellHeader } from './admin/ShellHeader.jsx'
import { ShellLogin, ShellChecking } from './admin/ShellLogin.jsx'
import {
  ADMIN_PAGES,
  pageById,
  pagePath,
  pageIdFromLocation,
  canSeePage,
  visiblePages,
  isAdminLocation,
} from './admin/ShellRoutes.jsx'

// Các trang
import { AdminOverviewTab } from './AdminOverviewTab'
import { AdminFamiliesTab } from './AdminFamiliesTab'
import { AdminSessionsTab } from './AdminSessionsTab'
import { AdminReportsTab } from './AdminReportsTab'
import { AdminTeachersTab } from './AdminTeachersTab'
import { AdminConfigTab } from './AdminConfigTab'
import { AdminToolsTab } from './AdminToolsTab'
import { AdminSafetyTab } from './AdminSafetyTab.jsx'

/**
 * Đợt 15: cờ cũ `kem-con-hoc:admin-auth` (chỉ cần đặt 'true' là vào được admin) bị xoá hẳn.
 * Không đọc lại ở bất cứ đâu; khung admin chỉ hiện sau khi GET /api/v1/admin/me trả phiên hợp lệ.
 */
const LEGACY_ADMIN_KEYS = ['kem-con-hoc:admin-auth', 'kem-con-hoc:admin-profile', 'kem-con-hoc:admin-theme']
function purgeLegacyAdminKeys() {
  try {
    LEGACY_ADMIN_KEYS.forEach((k) => localStorage.removeItem(k))
  } catch (e) {}
}
purgeLegacyAdminKeys()

export const CONFIG_SUBTABS = ADMIN_PAGES.filter((p) => p.kind === 'config').map((p) => ({ id: p.sub, label: p.label, page: p.id }))
export const TOOLS_SUBTABS = ADMIN_PAGES.filter((p) => p.kind === 'tools').map((p) => ({ id: p.sub, label: p.label, page: p.id }))

// Mã tab cũ (AdminOverviewTab gọi onNavigateTab('teachers')…) → trang mới
const LEGACY_TAB_TO_PAGE = {
  overview: 'overview',
  families: 'families',
  sessions: 'sessions',
  reports: 'reports',
  teachers: 'teachers',
  safety: 'safety',
  config: 'model',
  tools: 'sql',
}

/** Kiểm tra phiên ở máy chủ: 'ready' | 'locked' | 'login' | 'error' */
async function checkAdminSession() {
  const token = readAdminToken()
  if (!token) return { status: 'login' }
  try {
    const res = await fetch(`${GATEWAY}/api/v1/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (res.status === 423) return { status: 'locked', token }
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.ok && data.admin) return { status: 'ready', token, admin: data.admin }
    if (res.status === 401 || res.status === 403) return { status: 'login', expired: true }
    return { status: 'error' }
  } catch (e) {
    return { status: 'error' }
  }
}

export default function AdminPortal({ onExit }) {
  // checking | login | locked | ready | error
  const [status, setStatus] = useState('checking')
  const [token, setToken] = useState('')
  const [profile, setProfile] = useState(null)
  const [loginNotice, setLoginNotice] = useState('')

  const [activeTab, setActiveTab] = useState(() => pageIdFromLocation())
  const [search, setSearch] = useState(() => (typeof window !== 'undefined' ? window.location.search : ''))
  const [menuOpen, setMenuOpen] = useState(false)

  const [health, setHealth] = useState('pending')
  const [counts, setCounts] = useState(undefined)
  const [todaySessions, setTodaySessions] = useState(null)

  const statusRef = useRef(status)
  statusRef.current = status
  const idleTimerRef = useRef(null)

  const role = profile?.role || 'support'
  const page = pageById(activeTab)

  // ---------- Phiên làm việc ----------
  const verifySession = useCallback(async () => {
    setStatus('checking')
    const r = await checkAdminSession()
    if (r.status === 'ready') {
      setToken(r.token)
      setProfile(r.admin)
      setLoginNotice('')
      setStatus('ready')
    } else if (r.status === 'locked') {
      setToken(r.token)
      setStatus('locked')
    } else if (r.status === 'login') {
      clearAdminToken()
      setToken('')
      setProfile(null)
      if (r.expired) setLoginNotice('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại')
      setStatus('login')
    } else {
      setStatus('error')
    }
  }, [])

  // Lần đầu mở: hỏi máy chủ trước khi hiện bất cứ thứ gì
  useEffect(() => {
    verifySession()
  }, [verifySession])

  // Giao diện Bản Gấu cố định
  useEffect(() => {
    document.documentElement.setAttribute('data-admin-theme', 'bear')
    return () => document.documentElement.removeAttribute('data-admin-theme')
  }, [])

  // Chuyển toast cũ (utils.toast) của các trang sang ToastHost của bộ quy chuẩn
  useEffect(() => {
    return onToast((m) => {
      const text = String(m || '')
      const bad = /^(⚠️|❌|🚨)|lỗi|không thể|thất bại/i.test(text)
      staffToast(text, bad ? { tone: 'bad' } : {})
    })
  }, [])

  // 401 từ bất kỳ API quản trị nào → về đăng nhập; 423 → khoá màn hình
  useEffect(() => {
    const onUnauthorized = () => {
      if (statusRef.current !== 'ready' && statusRef.current !== 'locked') return
      clearAdminToken()
      setToken('')
      setProfile(null)
      setLoginNotice('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại')
      setStatus('login')
    }
    const onLocked = () => {
      if (statusRef.current === 'ready') setStatus('locked')
    }
    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized)
    window.addEventListener(ADMIN_LOCKED_EVENT, onLocked)
    return () => {
      window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized)
      window.removeEventListener(ADMIN_LOCKED_EVENT, onLocked)
    }
  }, [])

  // ---------- Đường dẫn: mỗi trang một URL, nút quay lại hoạt động ----------
  useEffect(() => {
    const onPop = () => {
      if (!isAdminLocation()) {
        if (onExit) onExit()
        return
      }
      setActiveTab(pageIdFromLocation())
      setSearch(window.location.search)
      setMenuOpen(false)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [onExit])

  const navigate = useCallback((pageId, nextSearch = '') => {
    const target = pagePath(pageId) + (nextSearch || '')
    const current = window.location.pathname + window.location.search + window.location.hash
    if (target !== current) window.history.pushState({ kchAdmin: pageId }, '', target)
    setActiveTab(pageId)
    setSearch(nextSearch || '')
    setMenuOpen(false)
    try {
      window.scrollTo(0, 0)
    } catch (e) {}
  }, [])

  const navigateLegacyTab = useCallback((tab) => navigate(LEGACY_TAB_TO_PAGE[tab] || pageById(tab).id), [navigate])

  // ---------- Dữ liệu thật cho khung: sức khoẻ, chuông, số buổi ----------
  useEffect(() => {
    if (status !== 'ready') return
    let alive = true

    setHealth('pending')
    adminFetch('/api/v1/admin/health')
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })).catch(() => ({ ok: false, d: {} })))
      .then(({ ok, d }) => alive && setHealth(ok && d.ok ? 'ok' : 'bad'))
      .catch(() => alive && setHealth('bad'))

    adminFetch('/api/v1/admin/overview?range=today')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const n = d?.metrics?.totalSessions
        if (alive) setTodaySessions(typeof n === 'number' && Number.isFinite(n) ? n : null)
      })
      .catch(() => alive && setTodaySessions(null))

    const loadCounts = () =>
      adminFetch('/api/v1/admin/todo-counts')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => alive && setCounts(d && d.ok ? d : null))
        .catch(() => alive && setCounts(null))
    loadCounts()
    const h = setInterval(loadCounts, 5 * 60 * 1000)

    return () => {
      alive = false
      clearInterval(h)
    }
  }, [status])

  // ---------- Khoá, mở khoá, đăng xuất ----------
  const handleLock = useCallback(async () => {
    const t = readAdminToken()
    if (!t) return
    try {
      await fetch(`${GATEWAY}/api/v1/admin/auth/lock`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
      })
    } catch (e) {
      console.warn('Server lock error:', e)
    }
    setMenuOpen(false)
    setStatus('locked')
  }, [])

  const handleLogout = useCallback(async () => {
    const t = readAdminToken()
    if (t) {
      try {
        await fetch(`${GATEWAY}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${t}` },
        })
      } catch (e) {}
    }
    clearAdminToken()
    setToken('')
    setProfile(null)
    setLoginNotice('')
    setCounts(undefined)
    setTodaySessions(null)
    setStatus('login')
    staffToast('Đã đăng xuất khỏi trang quản trị')
  }, [])

  const handleLoggedIn = useCallback(
    async (newToken) => {
      saveAdminToken(newToken)
      await verifySession()
    },
    [verifySession]
  )

  // Tự khoá khi không thao tác (theo cài đặt của tài khoản, mặc định 15 phút)
  useEffect(() => {
    if (status !== 'ready') return
    const mins = Number(profile?.autoLockMins) > 0 ? Number(profile.autoLockMins) : 15
    const reset = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        handleLock()
        staffToast('Đã tự khoá vì lâu không thao tác')
      }, mins * 60 * 1000)
    }
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }))
    reset()
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      events.forEach((ev) => window.removeEventListener(ev, reset))
    }
  }, [status, profile, handleLock])

  // Esc đóng ngăn kéo menu trên điện thoại
  useEffect(() => {
    if (!menuOpen) return
    const k = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [menuOpen])

  // ---------- Nội dung từng trang ----------
  const renderPage = () => {
    if (!canSeePage(page, role)) {
      return (
        <EmptyState
          title={page.devOnly ? 'Trang này chỉ có ở bản dành cho đội phát triển' : 'Trang này cần quyền cao hơn'}
          description={page.devOnly ? 'Bản chạy thật không kèm công cụ nội bộ này.' : 'Tài khoản của bạn chưa được mở trang này. Nhờ quản trị cao nhất cấp quyền nếu cần.'}
          actionText="Về Tổng quan"
          onAction={() => navigate('overview')}
        />
      )
    }
    if (page.kind === 'config') {
      return (
        <AdminConfigTab
          token={token}
          adminProfile={profile}
          activeSubTab={page.sub}
          onSubTabChange={(sub) => {
            const p = ADMIN_PAGES.find((x) => x.kind === 'config' && x.sub === sub)
            if (p) navigate(p.id)
          }}
          hideSubNav
        />
      )
    }
    if (page.kind === 'tools') {
      return (
        <AdminToolsTab
          token={token}
          adminProfile={profile}
          activeSubTab={page.sub}
          onSubTabChange={(sub) => {
            const p = ADMIN_PAGES.find((x) => x.kind === 'tools' && x.sub === sub)
            if (p) navigate(p.id)
          }}
          hideSubNav
        />
      )
    }
    return (
      <>
        {activeTab === 'overview' && <AdminOverviewTab token={token} onNavigateTab={navigateLegacyTab} />}
        {activeTab === 'families' && <AdminFamiliesTab key={search || 'all'} token={token} />}
        {activeTab === 'sessions' && <AdminSessionsTab token={token} onOpenPromptStudio={() => navigate('prompts')} />}
        {activeTab === 'reports' && <AdminReportsTab token={token} />}
        {activeTab === 'teachers' && <AdminTeachersTab token={token} />}
        {activeTab === 'safety' && <AdminSafetyTab token={token} />}
      </>
    )
  }

  let body
  if (status === 'checking') {
    body = <ShellChecking />
  } else if (status === 'error') {
    body = (
      <div className="kadm-center">
        <div className="kadm-auth-card" style={{ textAlign: 'center' }}>
          <div className="kadm-auth-bear">
            <BearMascot mood="nudge" size={72} />
          </div>
          <h1 className="kadm-auth-title">Chưa kiểm tra được phiên</h1>
          <p className="kadm-auth-sub">Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại nhé.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button onClick={verifySession}>Thử lại</Button>
            <Button variant="ghost" onClick={handleLogout}>
              Đăng nhập lại
            </Button>
          </div>
        </div>
      </div>
    )
  } else if (status === 'login') {
    body = <ShellLogin onLoggedIn={handleLoggedIn} onExit={onExit} notice={loginNotice} />
  } else if (status === 'locked') {
    body = <AdminLockScreen token={token || readAdminToken()} onUnlock={verifySession} onLogout={handleLogout} />
  } else {
    body = (
      <div className="kadm-shell">
        <ShellSidebar
          pages={visiblePages(role)}
          activeId={page.id}
          onNavigate={(id) => navigate(id)}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          health={health}
          todaySessions={todaySessions}
        />
        <div className="kadm-main">
          <ShellHeader
            page={page}
            role={role}
            profile={profile}
            counts={counts}
            canSee={(id) => canSeePage(pageById(id), role)}
            onNavigate={navigate}
            onToggleMenu={() => setMenuOpen((v) => !v)}
            menuOpen={menuOpen}
            onLock={handleLock}
            onLogout={handleLogout}
            onExit={onExit}
          />
          <main className="kadm-content" id="kadm-content">
            {renderPage()}
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="stitch-admin-root staff-root kadm-root" data-admin-theme="bear">
      {body}
      <ToastHost />
      <ConfirmHost />
    </div>
  )
}
