/**
 * Thanh bên phẳng 3 nhóm của khung admin (Đợt 15 · Chặng 2)
 * - Không có menu gập; dưới 1280px thu thành biểu tượng (có tooltip và aria-label).
 * - Điện thoại: mở dạng ngăn kéo bằng nút ☰ ở đầu trang.
 */
import { BearMascot } from '../ui/staff'
import { ADMIN_GROUPS, pagePath } from './ShellRoutes.jsx'

function HealthDot({ health }) {
  const state = health === 'ok' ? 'ok' : health === 'pending' ? 'pending' : 'bad'
  const text = state === 'ok' ? 'Máy chủ: hoạt động' : state === 'pending' ? 'Đang kiểm tra…' : 'Máy chủ: có lỗi'
  return (
    <div className={`kadm-health kadm-health-${state}`} title={text} aria-label={text} role="status">
      <span className="kadm-health-dot" aria-hidden="true" />
      <span className="kadm-label">{text}</span>
    </div>
  )
}

export function ShellSidebar({ pages, activeId, onNavigate, open, onClose, health, todaySessions }) {
  return (
    <>
      {open && <div className="kadm-backdrop" onClick={onClose} aria-hidden="true" />}
      <aside id="kadm-sidebar" className={`kadm-side ${open ? 'is-open' : ''}`} aria-label="Điều hướng quản trị">
        <div className="kadm-brand">
          <BearMascot mood="greeting" size={34} />
          <div className="kadm-brand-text">
            <b>Kèm Con Học</b>
            <small>Quản trị</small>
          </div>
          <button type="button" className="kadm-side-close" onClick={onClose} aria-label="Đóng menu">
            ✕
          </button>
        </div>

        <nav className="kadm-nav">
          {ADMIN_GROUPS.map((g) => {
            const items = pages.filter((p) => p.group === g.id)
            if (!items.length) return null
            return (
              <div key={g.id} className="kadm-group" role="group" aria-labelledby={`kadm-g-${g.id}`}>
                <div className="kadm-sep" id={`kadm-g-${g.id}`}>
                  <span className="kadm-sep-text">{g.label}</span>
                </div>
                {items.map((p) => {
                  const on = p.id === activeId
                  return (
                    <a
                      key={p.id}
                      href={pagePath(p.id)}
                      className={`kadm-nv ${on ? 'is-on' : ''}`}
                      aria-current={on ? 'page' : undefined}
                      aria-label={p.label}
                      title={p.label}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
                        e.preventDefault()
                        onNavigate(p.id)
                      }}
                    >
                      <span className="kadm-nv-icon" aria-hidden="true">{p.icon}</span>
                      <span className="kadm-label">{p.label}</span>
                    </a>
                  )
                })}
              </div>
            )
          })}
        </nav>

        <div className="kadm-side-foot">
          {typeof todaySessions === 'number' && todaySessions > 0 && (
            <div className="kadm-side-card">
              <BearMascot mood="happy" size={30} />
              <span>
                24 giờ qua có <b>{todaySessions.toLocaleString('vi-VN')}</b> buổi kèm học
              </span>
            </div>
          )}
          <HealthDot health={health} />
        </div>
      </aside>
    </>
  )
}
