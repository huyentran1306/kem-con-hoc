/**
 * 🐻 STAFF DESIGN SYSTEM (PROMPT 11 - PHẦN A)
 * Bộ giao diện dùng chung cho Cổng Giáo Viên và Admin Bản Gấu
 * Đáp ứng WCAG AA, tương phản >= 4.5:1, Mitr + Nunito
 */

import React, { useState, useEffect } from 'react';
import './tokens.css';
import { Pagination } from './kit.jsx';

/* ============================================================
   1. BEAR MASCOT SVG (3 Trạng thái: greeting, nudge, happy)
   ============================================================ */
export function BearMascot({ mood = 'greeting', size = 48, className = '' }) {
  if (mood === 'nudge') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="34" cy="32" r="16" fill="#D97706" />
        <circle cx="34" cy="32" r="9" fill="#FDE68A" />
        <circle cx="86" cy="32" r="16" fill="#D97706" />
        <circle cx="86" cy="32" r="9" fill="#FDE68A" />
        <circle cx="60" cy="62" r="40" fill="#F59E0B" />
        <ellipse cx="60" cy="71" rx="18" ry="13" fill="#FEF3C7" />
        <ellipse cx="60" cy="64" rx="7" ry="5" fill="#78350F" />
        <circle cx="48" cy="56" r="4.5" fill="#78350F" />
        <circle cx="50" cy="54" r="1.5" fill="#FFFFFF" />
        <circle cx="72" cy="56" r="4.5" fill="#78350F" />
        <circle cx="74" cy="54" r="1.5" fill="#FFFFFF" />
        <path d="M56 75 Q60 78 64 75" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="40" cy="68" r="5" fill="#FCA5A5" opacity="0.6" />
        <circle cx="80" cy="68" r="5" fill="#FCA5A5" opacity="0.6" />
      </svg>
    );
  }

  if (mood === 'happy') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="32" cy="30" r="17" fill="#D97706" />
        <circle cx="32" cy="30" r="10" fill="#FDE68A" />
        <circle cx="88" cy="30" r="17" fill="#D97706" />
        <circle cx="88" cy="30" r="10" fill="#FDE68A" />
        <circle cx="60" cy="64" r="43" fill="#F59E0B" />
        <ellipse cx="60" cy="73" rx="20" ry="15" fill="#FEF3C7" />
        <ellipse cx="60" cy="65" rx="7.5" ry="5.5" fill="#78350F" />
        <path d="M44 57 Q49 51 54 57" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
        <path d="M66 57 Q71 51 76 57" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
        <path d="M53 74 Q60 84 67 74" fill="#E11D48" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
        <circle cx="39" cy="69" r="6.5" fill="#FCA5A5" opacity="0.75" />
        <circle cx="81" cy="69" r="6.5" fill="#FCA5A5" opacity="0.75" />
        <path d="M18 72 Q10 50 25 45 Q33 58 28 72" fill="#F59E0B" />
        <path d="M102 72 Q110 50 95 45 Q87 58 92 72" fill="#F59E0B" />
      </svg>
    );
  }

  // default: greeting
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="34" cy="34" r="16" fill="#D97706" />
      <circle cx="34" cy="34" r="9" fill="#FDE68A" />
      <circle cx="86" cy="34" r="16" fill="#D97706" />
      <circle cx="86" cy="34" r="9" fill="#FDE68A" />
      <circle cx="60" cy="65" r="42" fill="#F59E0B" />
      <ellipse cx="60" cy="74" rx="19" ry="14" fill="#FEF3C7" />
      <ellipse cx="60" cy="67" rx="7" ry="5" fill="#78350F" />
      <circle cx="48" cy="59" r="4.5" fill="#78350F" />
      <circle cx="50" cy="57" r="1.5" fill="#FFFFFF" />
      <circle cx="72" cy="59" r="4.5" fill="#78350F" />
      <circle cx="74" cy="57" r="1.5" fill="#FFFFFF" />
      <path d="M55 77 Q60 82 65 77" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="41" cy="71" r="6" fill="#FCA5A5" opacity="0.65" />
      <circle cx="79" cy="71" r="6" fill="#FCA5A5" opacity="0.65" />
      <path d="M96 70 Q112 55 106 42 Q98 40 92 58" fill="#F59E0B" />
      <circle cx="103" cy="46" r="6" fill="#FDE68A" />
    </svg>
  );
}

/* ============================================================
   2. CARD
   ============================================================ */
export function Card({ children, style = {}, className = '', ...props }) {
  return (
    <div
      className={`staff-card ${className}`}
      style={{
        backgroundColor: 'var(--s-surface)',
        border: '1px solid var(--s-line)',
        borderRadius: 'var(--s-radius-card)',
        padding: '16px 18px',
        boxShadow: 'var(--s-shadow-card)',
        position: 'relative',
        minWidth: 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/* ============================================================
   3. BUTTON (Primary, Secondary, Danger)
   ============================================================ */
export const Button = React.forwardRef(function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon = null,
  disabled = false,
  style = {},
  className = '',
  onClick,
  ...props
}, ref) {
  const pad = size === 'sm' ? '5px 11px' : size === 'lg' ? '11px 22px' : '8px 16px';
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 14.5 : 13;

  let bg = 'var(--s-accent)';
  let color = 'var(--s-on-accent)';
  let shadow = 'var(--s-shadow-btn)';
  let border = 'none';

  if (variant === 'secondary') {
    bg = 'var(--s-accent-tint)';
    color = 'var(--s-accent-ink)';
    shadow = 'none';
  } else if (variant === 'danger') {
    bg = 'var(--s-bad-bg)';
    color = 'var(--s-bad)';
    shadow = 'none';
    border = '1px solid var(--s-bad-border)';
  } else if (variant === 'ghost') {
    bg = '#FFFFFF';
    color = 'var(--s-text)';
    border = '1px solid var(--s-line)';
    shadow = '0 2px 0 var(--s-line)';
  }

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`staff-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: pad,
        borderRadius: 'var(--s-radius-btn)',
        backgroundColor: bg,
        color: color,
        border: border,
        boxShadow: shadow,
        fontFamily: 'var(--s-font-body)',
        fontWeight: 800,
        fontSize: fontSize,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...props}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
})

/* ============================================================
   4. STATUS PILL
   ============================================================ */
const STATUS_LABELS = { dat: 'Đạt', running: 'Đang chạy', review: 'Chờ xem', error: 'Lỗi' }
export function StatusPill({ status = 'ok', label, style = {} }) {
  if (label === undefined || label === null) label = STATUS_LABELS[status] || ''
  let bg = 'var(--s-ok-bg)';
  let color = 'var(--s-ok)';
  let border = 'var(--s-ok-border)';

  // Đợt 15: 4 trạng thái chuẩn Đạt · Đang chạy · Chờ xem · Lỗi
  if (status === 'dat') status = 'ok'
  else if (status === 'running') status = 'info'
  else if (status === 'review') status = 'warn'
  else if (status === 'error') status = 'bad'
  if (status === 'wait' || status === 'pending' || status === 'warn') {
    bg = 'var(--s-warn-bg)';
    color = 'var(--s-warn)';
    border = 'var(--s-warn-border)';
  } else if (status === 'no' || status === 'bad' || status === 'rejected' || status === 'danger') {
    bg = 'var(--s-bad-bg)';
    color = 'var(--s-bad)';
    border = 'var(--s-bad-border)';
  } else if (status === 'learn' || status === 'info' || status === 'draft') {
    bg = 'var(--s-info-bg)';
    color = 'var(--s-info)';
    border = 'var(--s-info-border)';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
        ...style,
      }}
    >
      {label}
    </span>
  );
}

/* ============================================================
   5. KPI STAT CARD
   ============================================================ */
export function Kpi({ label, value, sub, trend = null, trendType = 'up', style = {} }) {
  return (
    <Card style={{ padding: '14px 16px', ...style }}>
      <div style={{ fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 900, color: 'var(--s-text-2)' }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--s-font-head)',
          fontSize: 24,
          color: 'var(--s-text)',
          fontWeight: 700,
          margin: '3px 0 2px 0',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.2,
        }}
      >
        {value === null || value === undefined || value === '' ? '·' : value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--s-text-2)' }}>
        {(value === null || value === undefined || value === '') && !sub && <span>Chưa có dữ liệu</span>}
        {trend && (
          <span style={{ fontWeight: 800, color: trendType === 'up' ? 'var(--s-ok)' : 'var(--s-bad)' }}>
            {trendType === 'up' ? '▲' : '▼'} {trend}
          </span>
        )}
        {sub && <span>{sub}</span>}
      </div>
    </Card>
  );
}

/* ============================================================
   6. TABS
   ============================================================ */
export function Tabs({ tabs = [], activeTab, onChange, style = {}, ariaLabel = 'Các mục' }) {
  // Đợt 15: tab gạch chân mật ong theo bản vẽ, có số đếm, phím ← → để chuyển
  const ids = tabs.map((t) => (typeof t === 'string' ? t : t.id))
  const onKey = (e) => {
    const i = ids.indexOf(activeTab)
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length
      onChange(ids[n])
      const el = e.currentTarget.querySelector(`[data-tab="${ids[n]}"]`)
      el && el.focus()
    }
  }
  return (
    <div className="sk-tabs" role="tablist" aria-label={ariaLabel} onKeyDown={onKey} style={style}>
      {tabs.map((t) => {
        const id = typeof t === 'string' ? t : t.id
        const label = typeof t === 'string' ? t : t.label
        const count = typeof t === 'object' ? t.count : null
        const icon = typeof t === 'object' ? t.icon : null
        const isActive = id === activeTab
        return (
          <button
            key={id}
            data-tab={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={`sk-tab ${isActive ? 'sk-on' : ''}`}
            onClick={() => onChange(id)}
          >
            {icon && <span aria-hidden="true">{icon}</span>}
            {label}
            {count !== undefined && count !== null && <span className="sk-tab-count">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}

/* ============================================================
   7. SEGMENTED CONTROL
   ============================================================ */
export function Segmented({ options = [], value, onChange, style = {} }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        backgroundColor: '#FFFFFF',
        border: '2px solid var(--s-line)',
        borderRadius: 999,
        padding: 3,
        gap: 2,
        ...style,
      }}
    >
      {options.map((opt) => {
        const optVal = typeof opt === 'string' ? opt : opt.value;
        const optLabel = typeof opt === 'string' ? opt : opt.label;
        const isSel = optVal === value;

        return (
          <button
            key={optVal}
            type="button"
            onClick={() => onChange(optVal)}
            style={{
              padding: '4px 12px',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 11.5,
              fontFamily: 'var(--s-font-body)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isSel ? 'var(--s-accent)' : 'transparent',
              color: isSel ? 'var(--s-on-accent)' : 'var(--s-text-2)',
              transition: 'all 0.15s ease',
            }}
          >
            {optLabel}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   8. TOGGLE SWITCH
   ============================================================ */
export function Toggle({ checked = false, onChange, label = null, style = {} }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', ...style }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 34,
          height: 19,
          borderRadius: 999,
          backgroundColor: checked ? '#10B981' : '#E5D6C1',
          position: 'relative',
          transition: 'background-color 0.2s',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 17 : 2,
            width: 15,
            height: 15,
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </div>
      {label && <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--s-text)' }}>{label}</span>}
    </label>
  );
}

/* ============================================================
   9. FIELD & TEXTAREA (with Locked state)
   ============================================================ */
export function Field({ label, hint, error, children, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      {label && (
        <label style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--s-text-2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </label>
      )}
      {children}
      {hint && <small style={{ fontSize: 11, color: 'var(--s-text-2)' }}>{hint}</small>}
      {error && <small style={{ fontSize: 11, color: 'var(--s-bad)', fontWeight: 700 }}>{error}</small>}
    </div>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  locked = false,
  lockHint = 'Chỉ cô mới xem được đáp án này',
  rows = 3,
  style = {},
  ...props
}) {
  return (
    <div style={{ position: 'relative' }}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '10px 12px',
          borderRadius: 'var(--s-radius-input)',
          border: locked ? '2px dashed var(--s-accent)' : '2px solid var(--s-line)',
          backgroundColor: locked ? 'var(--s-bg)' : 'var(--s-surface)',
          fontFamily: 'var(--s-font-body)',
          fontSize: 13.5,
          color: 'var(--s-text)',
          outline: 'none',
          lineHeight: 1.5,
          resize: 'vertical',
          ...style,
        }}
        {...props}
      />
      {locked && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontWeight: 800,
            color: 'var(--s-accent-ink)',
            backgroundColor: 'var(--s-accent-tint)',
            padding: '2px 8px',
            borderRadius: 999,
            pointerEvents: 'none',
          }}
        >
          🔒 {lockHint}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   10. DATA TABLE
   ============================================================ */
export function DataTable({
  columns = [],
  data = [],
  rowKey = 'id',
  emptyText = 'Không có dữ liệu',
  emptyTitle = null,
  emptyDescription = null,
  emptyAction = null,
  onRowClick = null,
  pageSize = 0,
  maxHeight = null,
  loading = false,
  style = {},
}) {
  const [page, setPage] = useState(1)
  const pageCount = pageSize ? Math.max(1, Math.ceil((data?.length || 0) / pageSize)) : 1
  useEffect(() => {
    if (page > pageCount) setPage(1)
  }, [pageCount])
  if (loading) {
    return <div className="sk-table-empty">Đang tải…</div>
  }
  if (!data || data.length === 0) {
    if (emptyTitle || emptyDescription) {
      return (
        <EmptyState
          title={emptyTitle || emptyText}
          description={emptyDescription || ''}
          actionText={emptyAction?.label}
          onAction={emptyAction?.onClick}
          style={{ border: 'none', boxShadow: 'none' }}
        />
      )
    }
    return <div className="sk-table-empty">{emptyText}</div>
  }
  const rows = pageSize ? data.slice((page - 1) * pageSize, page * pageSize) : data
  return (
    <div style={style}>
      <div className="sk-table-wrap" style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}>
        <table className="sk-table">
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={c.key || i} style={{ textAlign: c.align || 'left', width: c.width }}>
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row[rowKey] ?? idx}
                className={onRowClick ? 'sk-row-click' : ''}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
              >
                {columns.map((c, i) => (
                  <td key={c.key || i} style={{ textAlign: c.align || 'left' }}>
                    {c.render ? c.render(row[c.key], row, idx) : row[c.key] ?? '·'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageSize > 0 && <Pagination page={page} pageCount={pageCount} onChange={setPage} />}
    </div>
  )
}

/* ============================================================
   11. EMPTY STATE
   ============================================================ */
export function EmptyState({
  title = 'Chưa có dữ liệu',
  description = 'Bấm nút bên dưới để bắt đầu nhé.',
  actionText = null,
  onAction = null,
  mood = 'greeting',
  style = {},
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '36px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'var(--s-surface)',
        borderRadius: 'var(--s-radius-card)',
        border: '1px solid var(--s-line)',
        ...style,
      }}
    >
      <BearMascot mood={mood} size={64} />
      <h4 style={{ fontFamily: 'var(--s-font-head)', fontSize: 18, color: 'var(--s-text)', margin: 0 }}>
        {title}
      </h4>
      <p style={{ fontSize: 13, color: 'var(--s-text-2)', maxWidth: 360, margin: 0 }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} style={{ marginTop: 6 }}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

/* ============================================================
   12. BANNER
   ============================================================ */
export function Banner({
  type = 'info', // 'info' | 'warn' | 'bad' | 'ok'
  message,
  actionText = null,
  onAction = null,
  style = {},
}) {
  let bg = 'var(--s-info-bg)';
  let border = 'var(--s-info-border)';
  let color = 'var(--s-info)';
  let icon = 'ℹ️';

  if (type === 'warn') {
    bg = 'var(--s-warn-bg)';
    border = 'var(--s-warn-border)';
    color = 'var(--s-warn)';
    icon = '⚠️';
  } else if (type === 'bad' || type === 'error') {
    bg = 'var(--s-bad-bg)';
    border = 'var(--s-bad-border)';
    color = 'var(--s-bad)';
    icon = '🚨';
  } else if (type === 'ok' || type === 'success') {
    bg = 'var(--s-ok-bg)';
    border = 'var(--s-ok-border)';
    color = 'var(--s-ok)';
    icon = '✨';
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 14,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: color,
        fontSize: 12.5,
        fontWeight: 700,
        ...style,
      }}
    >
      <span>{icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontWeight: 800,
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: 0,
            fontSize: 12,
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

/* ============================================================
   13. SAVE BAR (Sticky Bottom Bar)
   ============================================================ */
export function SaveBar({
  text = 'Có thay đổi chưa lưu',
  saveText = 'Lưu',
  discardText = 'Bỏ thay đổi',
  onSave,
  onCancel = null,
  onDiscard = null,
  busy = false,
  dirty = true,
}) {
  // Đợt 15: nền sáng, dính đáy, chỉ hiện khi có thay đổi
  if (!dirty) return null
  const discard = onDiscard || onCancel
  return (
    <div className="sk-savebar" role="region" aria-label="Thanh lưu">
      <span className="sk-savebar-dot" aria-hidden="true" />
      <span style={{ fontSize: 13, fontWeight: 800, flex: 1 }}>{text}</span>
      {discard && (
        <Button variant="ghost" size="sm" onClick={discard} disabled={busy}>
          {discardText}
        </Button>
      )}
      <Button onClick={onSave} disabled={busy} size="sm">
        {busy ? 'Đang lưu…' : saveText}
      </Button>
    </div>
  )
}

/* ============================================================
   14. ASSISTANT CARD (Gấu trợ lý)
   ============================================================ */
export function AssistantCard({ title = 'Gấu trợ lý', message, actionText, onAction, style = {} }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--s-accent-tint)',
        borderRadius: 'var(--s-radius-card)',
        padding: '14px 16px',
        border: '1.5px solid var(--s-line)',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        ...style,
      }}
    >
      <BearMascot mood="nudge" size={42} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <strong style={{ fontFamily: 'var(--s-font-head)', fontSize: 14, color: 'var(--s-text)', display: 'block' }}>
          {title}
        </strong>
        <p style={{ fontSize: 12.5, color: 'var(--s-text-2)', margin: '3px 0 6px 0', lineHeight: 1.45 }}>
          {message}
        </p>
        {actionText && onAction && (
          <Button size="sm" variant="secondary" onClick={onAction}>
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   15. CLASS SWITCHER DROPDOWN
   ============================================================ */
export function ClassSwitcher({ classes = [], activeClassId, onSelectClass, onAddClass }) {
  const [open, setOpen] = useState(false);
  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          borderRadius: 14,
          backgroundColor: 'var(--s-bg)',
          border: '1px solid var(--s-line)',
          color: 'var(--s-text)',
          fontFamily: 'var(--s-font-body)',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 16 }}>🏫</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9.5, fontWeight: 900, color: 'var(--s-text-2)', textTransform: 'uppercase' }}>
            Lớp đang xem
          </div>
          <strong style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
            {activeClass ? `Lớp ${activeClass.name}` : 'Chọn lớp'}
          </strong>
        </div>
        <span style={{ fontSize: 10, color: 'var(--s-text-2)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: '#FFFFFF',
            border: '2px solid var(--s-line)',
            borderRadius: 14,
            boxShadow: '0 8px 24px rgba(75, 54, 33, 0.2)',
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {classes.map((cls) => (
            <button
              key={cls.id}
              type="button"
              onClick={() => { onSelectClass(cls.id); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: cls.id === activeClassId ? 'var(--s-accent-tint)' : 'transparent',
                color: 'var(--s-text)',
                fontWeight: cls.id === activeClassId ? 800 : 600,
                fontSize: 12,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>{cls.id === activeClassId ? '✓' : '•'}</span>
              <span>Lớp {cls.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--s-text-2)' }}>
                Khối {cls.grade}
              </span>
            </button>
          ))}

          {onAddClass && (
            <button
              type="button"
              onClick={() => { setOpen(false); onAddClass(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 8px',
                borderRadius: 10,
                borderTop: '1px solid var(--s-line)',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                backgroundColor: 'transparent',
                color: 'var(--s-accent-ink)',
                fontWeight: 800,
                fontSize: 11.5,
                cursor: 'pointer',
                marginTop: 2,
              }}
            >
              <span>＋</span> Tạo lớp mới
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   16. SIDE NAVIGATION (196px Desktop)
   ============================================================ */
export function SideNav({
  items = [],
  activeItem,
  onSelect,
  classes = [],
  activeClassId,
  onSelectClass,
  onAddClass,
  teacherName = '',
  schoolName = '',
  onLogout,
}) {
  return (
    <aside
      style={{
        width: 196,
        flexShrink: 0,
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--s-line)',
        padding: '14px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px 8px 6px' }}>
        <BearMascot mood="greeting" size={32} />
        <div>
          <b style={{ fontFamily: 'var(--s-font-head)', fontSize: 14, color: 'var(--s-text)', display: 'block', lineHeight: 1.1 }}>
            Cổng Giáo Viên
          </b>
          {schoolName ? <small style={{ fontSize: 10, color: 'var(--s-text-2)' }}>Tiểu học {schoolName}</small> : null}
        </div>
      </div>

      {/* Class Switcher */}
      {classes.length > 0 && (
        <ClassSwitcher
          classes={classes}
          activeClassId={activeClassId}
          onSelectClass={onSelectClass}
          onAddClass={onAddClass}
        />
      )}

      {/* Navigation Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6 }}>
        {items.map((item) => {
          const isSel = item.id === activeItem;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 10px',
                borderRadius: 12,
                border: 'none',
                backgroundColor: isSel ? 'var(--s-accent-tint)' : 'transparent',
                color: isSel ? 'var(--s-text)' : 'var(--s-text-2)',
                fontWeight: isSel ? 800 : 700,
                fontSize: 12.5,
                fontFamily: 'var(--s-font-body)',
                boxShadow: isSel ? 'inset 4px 0 0 var(--s-accent)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 15, display: 'inline-flex', alignItems: 'center' }}>{item.icon}</span>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.label}
              </span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 900,
                    backgroundColor: '#FB7185',
                    color: '#FFFFFF',
                    borderRadius: 999,
                    padding: '0 6px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Gấu nhắc (Privacy tip) */}
      <div
        style={{
          marginTop: 'auto',
          backgroundColor: 'var(--s-accent-tint)',
          borderRadius: 14,
          padding: '8px 10px',
          display: 'grid',
          gridTemplateColumns: '26px 1fr',
          gap: 6,
          alignItems: 'center',
          fontSize: 10.5,
          color: 'var(--s-text)',
        }}
      >
        <BearMascot mood="nudge" size={24} />
        <div>
          <b>Quyền riêng tư</b>: Chỉ xem trạng thái bài, không thấy ảnh gia đình.
        </div>
      </div>

      {/* Teacher Profile & Logout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          paddingTop: 8,
          borderTop: '1px solid var(--s-line)',
          fontSize: 11,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: 'var(--s-accent-tint)',
            color: 'var(--s-accent-ink)',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 900,
            fontSize: 11,
            flexShrink: 0,
          }}
        >
          {teacherName?.[0] || 'C'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--s-text)' }}>
            {teacherName ? `Cô ${teacherName}` : 'Cô giáo'}
          </strong>
          <span style={{ fontSize: 9.5, color: 'var(--s-ok)', fontWeight: 800 }}>Giáo viên</span>
        </div>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Đăng xuất"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--s-text-2)',
              fontSize: 13,
              cursor: 'pointer',
              padding: 2,
            }}
          >
            ↪
          </button>
        )}
      </div>
    </aside>
  );
}

/* ============================================================
   17. STAFF SHELL (Desktop & Mobile layout)
   ============================================================ */
export function StaffShell({
  children,
  items = [],
  activeItem,
  onSelect,
  classes = [],
  activeClassId,
  onSelectClass,
  onAddClass,
  teacherName = '',
  schoolName = '',
  onLogout,
  searchValue = '',
  onSearchChange,
  unreadCount = 0,
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="staff-root" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--s-bg)' }}>
      {/* Desktop Sidebar (>= 1024px) */}
      {!isMobile && (
        <SideNav
          items={items}
          activeItem={activeItem}
          onSelect={onSelect}
          classes={classes}
          activeClassId={activeClassId}
          onSelectClass={onSelectClass}
          onAddClass={onAddClass}
          teacherName={teacherName}
          schoolName={schoolName}
          onLogout={onLogout}
        />
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingBottom: isMobile ? 65 : 20 }}>
        {/* Top Header */}
        <header
          style={{
            height: 54,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 18px',
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid var(--s-line)',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          {isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <BearMascot mood="greeting" size={26} />
              <strong style={{ fontFamily: 'var(--s-font-head)', fontSize: 14, color: 'var(--s-text)' }}>
                Cổng Giáo Viên
              </strong>
            </div>
          ) : (
            <div style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
              <input
                style={{
                  width: '100%',
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: '2px solid var(--s-line)',
                  backgroundColor: '#FFFFFF',
                  fontSize: 12.5,
                  outline: 'none',
                  color: 'var(--s-text)',
                }}
                placeholder="Tìm học sinh hoặc bài tập..."
                value={searchValue}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              />
            </div>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11.5, color: 'var(--s-text-2)', fontWeight: 700 }}>
              {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '2px solid var(--s-line)',
                display: 'grid',
                placeItems: 'center',
                position: 'relative',
                fontSize: 14,
              }}
            >
              🔔
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -3,
                    right: -3,
                    fontSize: 9,
                    backgroundColor: '#FB7185',
                    color: '#FFFFFF',
                    borderRadius: 999,
                    padding: '0 4px',
                    fontWeight: 900,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main style={{ flex: 1, padding: isMobile ? '14px 12px' : '18px 24px', minWidth: 0 }}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (< 1024px) */}
      {isMobile && (
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 56,
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--s-line)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 100,
            boxShadow: '0 -4px 12px rgba(75, 54, 33, 0.08)',
          }}
        >
          {items.slice(0, 5).map((item) => {
            const isSel = item.id === activeItem;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  background: 'none',
                  border: 'none',
                  color: isSel ? 'var(--s-accent-ink)' : 'var(--s-text-2)',
                  fontWeight: isSel ? 900 : 700,
                  fontSize: 10,
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                <span style={{ fontSize: 18, display: 'inline-flex', alignItems: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

/* Đợt 15 · Chặng 1: các mảnh mới của bộ quy chuẩn */
export * from './kit.jsx';
