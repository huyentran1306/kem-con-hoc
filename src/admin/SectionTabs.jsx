import React from 'react'
import { sectionOf, visiblePagesForSection, pagePath, pageTabLabel } from './ShellRoutes.jsx'

export function SectionTabs({ pageId, role, onNavigate }) {
  const section = sectionOf(pageId)
  if (!section) return null

  const tabs = visiblePagesForSection(section, role)
  if (!tabs || tabs.length <= 1) return null

  return (
    <nav className="kadm-section-tabs-wrap" aria-label={`Các trang trong ${section.label}`}>
      <div className="kadm-section-tabs" role="tablist">
        {tabs.map((p) => {
          const on = p.id === pageId
          return (
            <a
              key={p.id}
              href={pagePath(p.id)}
              className={`kadm-section-tab ${on ? 'is-on' : ''}`}
              role="tab"
              aria-selected={on}
              aria-current={on ? 'page' : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
                e.preventDefault()
                onNavigate(p.id)
              }}
            >
              {pageTabLabel(p)}
            </a>
          )
        })}
      </div>
    </nav>
  )
}
