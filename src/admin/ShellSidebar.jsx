/**
 * Thanh bên khung admin gọn 9 mục chia 3 nhóm (Phương án A · Đợt 23T / 23R)
 * - Biểu tượng SVG tông mật ong vẽ riêng, không còn emoji
 * - Mini mode: thu gọn còn 76px cột biểu tượng (nhớ qua kem-con-hoc:admin:nav-mini)
 * - 1 dòng trạng thái: "Máy chủ ổn · N buổi/24h"
 */
import React, { useState, useEffect } from 'react'
import { BearMascot } from '../ui/staff'
import {
  ADMIN_GROUPS,
  ADMIN_SECTIONS,
  sectionOf,
  visiblePagesForSection,
  pagePath,
} from './ShellRoutes.jsx'
import { NavIcon } from './navIcons.jsx'

const MINI_KEY = 'kem-con-hoc:admin:nav-mini'

function readMiniPref() {
  try {
    return localStorage.getItem(MINI_KEY) === 'true'
  } catch (_) {
    return false
  }
}

function writeMiniPref(val) {
  try {
    localStorage.setItem(MINI_KEY, val ? 'true' : 'false')
  } catch (_) {}
}

export function ShellSidebar({
  role = 'superadmin',
  activeId,
  onNavigate,
  open,
  onClose,
  health,
  todaySessions,
  counts,
}) {
  const [mini, setMini] = useState(readMiniPref)

  useEffect(() => {
    writeMiniPref(mini)
  }, [mini])

  const toggleMini = () => setMini((prev) => !prev)

  const curSection = sectionOf(activeId)

  // Gom các section theo nhóm (null = Tổng quan nằm trên cùng)
  const sectionsByGroup = [
    { group: null, sections: ADMIN_SECTIONS.filter((s) => s.group === null) },
    ...ADMIN_GROUPS.map((g) => ({
      group: g,
      sections: ADMIN_SECTIONS.filter((s) => s.group === g.id),
    })),
  ]

  // Xác định số đếm việc cần làm theo section
  const getBadgeCount = (secId) => {
    if (!counts) return 0
    if (secId === 'teachers') return Number(counts.pendingTeachers || 0)
    if (secId === 'ops') return Number(counts.newErrors || 0)
    return 0
  }

  // Chữ trạng thái máy chủ 1 dòng
  const isOk = health === 'ok'
  const isPending = health === 'pending'
  const sessText =
    typeof todaySessions === 'number' && todaySessions > 0
      ? ` · ${todaySessions.toLocaleString('vi-VN')} buổi/24h`
      : ''
  const statusLine = isPending
    ? 'Đang kiểm tra…'
    : isOk
    ? `Máy chủ ổn${sessText}`
    : 'Máy chủ có lỗi'

  return (
    <>
      {open && <div className="kadm-backdrop" onClick={onClose} aria-hidden="true" />}
      <aside
        id="kadm-sidebar"
        className={`kadm-side ${mini ? 'is-mini' : ''} ${open ? 'is-open' : ''}`}
        aria-label="Điều hướng quản trị"
      >
        <div className="kadm-brand">
          <div className="kadm-logo-wrap">
            <BearMascot mood="greeting" size={32} />
          </div>
          <div className="kadm-brand-text">
            <b>Kèm Con Học</b>
            <small>Quản trị</small>
          </div>
          <button type="button" className="kadm-side-close" onClick={onClose} aria-label="Đóng menu">
            ✕
          </button>
        </div>

        <nav className="kadm-nav">
          {sectionsByGroup.map(({ group, sections }) => {
            // Lọc các section có ít nhất 1 tab nhìn thấy
            const visibleSections = sections.filter((sec) => {
              const visTabs = visiblePagesForSection(sec, role)
              return visTabs.length > 0
            })

            if (visibleSections.length === 0) return null

            return (
              <div
                key={group ? group.id : 'top'}
                className="kadm-group"
                role="group"
                aria-labelledby={group ? `kadm-g-${group.id}` : undefined}
              >
                {group && (
                  <div className="kadm-sep" id={`kadm-g-${group.id}`}>
                    <span className="kadm-sep-text">{group.label}</span>
                  </div>
                )}

                {visibleSections.map((sec) => {
                  const visTabs = visiblePagesForSection(sec, role)
                  const firstPage = visTabs[0]
                  const on = curSection?.id === sec.id
                  const badgeCount = getBadgeCount(sec.id)
                  const tabCount = visTabs.length

                  return (
                    <a
                      key={sec.id}
                      href={pagePath(firstPage.id)}
                      className={`kadm-nv it ${on ? 'is-on on' : ''}`}
                      aria-current={on ? 'page' : undefined}
                      aria-label={sec.label}
                      title={sec.label}
                      data-tip={sec.label}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
                        e.preventDefault()
                        onNavigate(firstPage.id)
                        if (open && onClose) onClose()
                      }}
                    >
                      <span className="kadm-nv-icon" aria-hidden="true">
                        <NavIcon name={sec.icon} className="cute" />
                      </span>
                      <span className="kadm-label lb">{sec.label}</span>

                      {badgeCount > 0 ? (
                        <span className="kadm-badge badge">{badgeCount > 99 ? '99+' : badgeCount}</span>
                      ) : tabCount >= 2 ? (
                        <span className="kadm-tab-cnt cnt">{tabCount}</span>
                      ) : null}
                    </a>
                  )
                })}
              </div>
            )
          })}
        </nav>

        <div className="kadm-side-foot">
          <div className="kadm-foot-row">
            <div
              className={`kadm-health kadm-health-${isOk ? 'ok' : isPending ? 'pending' : 'bad'}`}
              title={statusLine}
              aria-label={statusLine}
              role="status"
            >
              <span className="kadm-health-dot dot" aria-hidden="true" />
              <span className="kadm-label ft">{statusLine}</span>
            </div>

            <button
              type="button"
              className="kadm-collapse-btn"
              onClick={toggleMini}
              aria-label={mini ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
              title={mini ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
            >
              <svg viewBox="0 0 24 24" className="kadm-collapse-svg" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
