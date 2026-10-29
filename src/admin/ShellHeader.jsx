/**
 * Đầu trang của khung admin (Phương án A · Đợt 23T / 23R)
 * - Đường dẫn vị trí: <Mục> › <Tab> (hoặc <Mục> nếu chỉ có 1 trang)
 * - Chip "Sẵn sàng demo" có chấm xanh (bấm vào mở pre-demo)
 * - Ô tìm chung hỗ trợ Ctrl+K
 */
import { useEffect, useRef, useState } from 'react'
import { BearMascot } from '../ui/staff'
import { sectionOf, pageTabLabel, resolveSearch } from './ShellRoutes.jsx'

function formatVnClock(date = new Date()) {
  try {
    const fmt = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    return fmt.format(date).replace(',', ' ·')
  } catch (e) {
    const d = date
    const pad = (n) => String(n).padStart(2, '0')
    return `${['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)} · ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
}

function useVnClock() {
  const [now, setNow] = useState(() => formatVnClock())
  useEffect(() => {
    let interval = null
    const tick = () => setNow(formatVnClock())
    const first = setTimeout(() => {
      tick()
      interval = setInterval(tick, 60 * 1000)
    }, 60 * 1000 - (Date.now() % (60 * 1000)) + 50)
    return () => {
      clearTimeout(first)
      if (interval) clearInterval(interval)
    }
  }, [])
  return now
}

/** Popover nhỏ: bấm ra ngoài hoặc Esc thì đóng */
function usePopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  return { open, setOpen, ref }
}

const TODO_ITEMS = [
  { key: 'pendingTeachers', label: 'Giáo viên chờ duyệt', page: 'teachers', icon: '🍎' },
  { key: 'parentReports', label: 'Câu phụ huynh báo', page: 'safety', icon: '🐻' },
  { key: 'contentReports', label: 'Nội dung bị báo cáo', page: 'teachers', icon: '🚩' },
  { key: 'newErrors', label: 'Lỗi mới trong 24 giờ', page: 'infra', icon: '☁️' },
]

function Bell({ counts, onNavigate, canSee }) {
  const pop = usePopover()
  const total = typeof counts?.total === 'number' ? counts.total : null
  const items = TODO_ITEMS.filter((it) => typeof counts?.[it.key] === 'number' && canSee(it.page))
  const label = total === null ? 'Việc cần làm' : `Việc cần làm: ${total}`
  return (
    <div className="kadm-pop-wrap" ref={pop.ref}>
      <button
        type="button"
        className="kadm-bell"
        aria-label={label}
        title={label}
        aria-haspopup="true"
        aria-expanded={pop.open}
        onClick={() => pop.setOpen((v) => !v)}
      >
        <span aria-hidden="true">🔔</span>
        {total > 0 && <em>{total > 99 ? '99+' : total}</em>}
      </button>
      {pop.open && (
        <div className="kadm-pop kadm-pop-bell" role="menu" aria-label="Việc cần làm">
          <div className="kadm-pop-title">Việc cần làm</div>
          {counts === undefined && <div className="kadm-pop-empty">Đang tải…</div>}
          {counts === null && <div className="kadm-pop-empty">Chưa tải được số việc cần làm</div>}
          {counts && items.length === 0 && <div className="kadm-pop-empty">Chưa có dữ liệu</div>}
          {counts && items.length > 0 && total === 0 && (
            <div className="kadm-pop-empty kadm-pop-calm">
              <BearMascot mood="happy" size={34} />
              <span>Không còn việc nào cần làm</span>
            </div>
          )}
          {items.map((it) => (
            <button
              key={it.key}
              type="button"
              role="menuitem"
              className="kadm-pop-item"
              onClick={() => {
                pop.setOpen(false)
                onNavigate(it.page)
              }}
            >
              <span aria-hidden="true">{it.icon}</span>
              <span className="kadm-pop-item-text">{it.label}</span>
              <b className={counts[it.key] > 0 ? 'kadm-count-hot' : 'kadm-count'}>{counts[it.key]}</b>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const ROLE_LABELS = { superadmin: 'Quản trị cao nhất', editor: 'Biên tập', support: 'Hỗ trợ' }

function AccountMenu({ profile, onLock, onLogout, onExit }) {
  const pop = usePopover()
  const name = profile?.name || profile?.email || 'Quản trị viên'
  const initial = (name || 'Q').trim()[0]?.toUpperCase() || 'Q'
  const run = (fn) => () => {
    pop.setOpen(false)
    fn && fn()
  }
  return (
    <div className="kadm-pop-wrap" ref={pop.ref}>
      <button
        type="button"
        className="kadm-avatar"
        aria-label={`Tài khoản: ${name}`}
        title={name}
        aria-haspopup="true"
        aria-expanded={pop.open}
        onClick={() => pop.setOpen((v) => !v)}
      >
        {initial}
      </button>
      {pop.open && (
        <div className="kadm-pop kadm-pop-account" role="menu" aria-label="Tài khoản">
          <div className="kadm-account-head">
            <span className="kadm-avatar kadm-avatar-static" aria-hidden="true">{initial}</span>
            <div style={{ minWidth: 0 }}>
              <b className="kadm-ellipsis">{name}</b>
              {profile?.email && profile.email !== name && <small className="kadm-ellipsis">{profile.email}</small>}
              <span className="kadm-role">{ROLE_LABELS[profile?.role] || profile?.role || 'Quản trị'}</span>
            </div>
          </div>
          <div className="kadm-pop-static" aria-hidden="true">
            <span>🐻</span>
            <span className="kadm-pop-item-text">Giao diện Bản Gấu</span>
            <small>Đang dùng</small>
          </div>
          <button type="button" role="menuitem" className="kadm-pop-item" onClick={run(onLock)}>
            <span aria-hidden="true">🔒</span>
            <span className="kadm-pop-item-text">Khoá màn hình</span>
          </button>
          {onExit && (
            <button type="button" role="menuitem" className="kadm-pop-item" onClick={run(onExit)}>
              <span aria-hidden="true">↩</span>
              <span className="kadm-pop-item-text">Ra app phụ huynh</span>
            </button>
          )}
          <button type="button" role="menuitem" className="kadm-pop-item kadm-pop-danger" onClick={run(onLogout)}>
            <span aria-hidden="true">🚪</span>
            <span className="kadm-pop-item-text">Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  )
}

export function ShellHeader({ page, role, profile, counts, canSee, onNavigate, onToggleMenu, menuOpen, onLock, onLogout, onExit }) {
  const clock = useVnClock()
  const [q, setQ] = useState('')
  const searchInputRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onSearch = (e) => {
    e.preventDefault()
    const r = resolveSearch(q, role)
    if (!r) return
    onNavigate(r.pageId, r.search)
    setQ('')
  }

  const sec = sectionOf(page.id)
  const isMultiPage = sec && sec.pages.length > 1

  return (
    <header className="kadm-hd">
      <button
        type="button"
        className="kadm-menu-btn"
        aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
        aria-controls="kadm-sidebar"
        aria-expanded={menuOpen}
        onClick={onToggleMenu}
      >
        ☰
      </button>

      <nav className="kadm-crumb" aria-label="Đường dẫn vị trí">
        {isMultiPage ? (
          <>
            <span className="kadm-crumb-group">{sec.label}</span>
            <span className="kadm-crumb-sep" aria-hidden="true">›</span>
            <b aria-current="page">{pageTabLabel(page)}</b>
          </>
        ) : (
          <b aria-current="page">{sec ? sec.label : page.label}</b>
        )}
      </nav>

      <form className="kadm-search" role="search" onSubmit={onSearch}>
        <span aria-hidden="true">🔍</span>
        <input
          ref={searchInputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm gia đình, buổi học, prompt… (Ctrl+K)"
          aria-label="Tìm gia đình, buổi học, prompt"
        />
        <kbd className="kadm-search-kbd" aria-hidden="true">Ctrl K</kbd>
      </form>

      <span className="kadm-clock" aria-label={`Giờ Việt Nam ${clock}`}>{clock}</span>
      <Bell counts={counts} onNavigate={onNavigate} canSee={canSee} />
      <AccountMenu profile={profile} onLock={onLock} onLogout={onLogout} onExit={onExit} />
    </header>
  )
}
