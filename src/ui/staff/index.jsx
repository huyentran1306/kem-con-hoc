/**
 * 🐻 STAFF DESIGN SYSTEM (PROMPT 11 - PHẦN A)
 * Bộ giao diện dùng chung cho Cổng Giáo Viên và Admin Bản Gấu
 * Đáp ứng WCAG AA, tương phản >= 4.5:1, Mitr + Nunito
 */

import React, { useState, useEffect } from 'react';
import './tokens.css';
import { Pagination } from './kit.jsx';
import { formatClassName, formatTeacherName, teacherInitial } from '../../teacher/format.js';

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
    border = '1.5px solid var(--s-line)';
    shadow = 'none';
  } else if (variant === 'danger') {
    bg = 'var(--s-bad-bg)';
    color = 'var(--s-bad)';
    shadow = 'none';
    border = '1px solid var(--s-bad-border)';
  } else if (variant === 'ghost') {
    bg = '#FFFFFF';
    color = 'var(--s-text)';
    border = '1.5px solid var(--s-line)';
    shadow = '0 2px 0 var(--s-line)';
  }

  if (disabled) {
    if (variant === 'primary') {
      bg = '#F6C56A';
      color = '#8A5800';
      border = '1.5px solid #E8B958';
    } else if (variant === 'secondary') {
      bg = '#FFF8EC';
      color = '#A08467';
      border = '1.5px solid #F0DDC2';
    } else if (variant === 'ghost') {
      bg = '#FAF6F0';
      color = '#A08467';
      border = '1.5px solid #F0DDC2';
    }
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
   Đợt 15 · Chặng 5: tên lớp qua formatClassName (không còn "Lớp Lớp 3A"),
   chữ tối thiểu 12px, bấm ra ngoài thì đóng.
   ============================================================ */
export function ClassSwitcher({ classes = [], activeClassId, onSelectClass, onAddClass }) {
  const [open, setOpen] = useState(false);
  const rootRef = React.useRef(null);
  const activeClass = classes.find((c) => c.id === activeClassId) || null;

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          minHeight: 44,
          borderRadius: 14,
          backgroundColor: 'var(--s-bg)',
          border: '1px solid var(--s-line)',
          color: 'var(--s-text)',
          fontFamily: 'var(--s-font-body)',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 16 }} aria-hidden="true">🏫</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text-2)' }}>
            Lớp đang xem
          </div>
          <strong style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
            {activeClass ? formatClassName(activeClass.name) : 'Chọn lớp'}
          </strong>
        </div>
        <span style={{ fontSize: 12, color: 'var(--s-text-2)' }} aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          role="listbox"
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
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {classes.map((cls) => {
            const on = cls.id === activeClassId;
            return (
              <button
                key={cls.id}
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => { onSelectClass(cls.id); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 8px',
                  minHeight: 40,
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: on ? 'var(--s-accent-tint)' : 'transparent',
                  color: 'var(--s-text)',
                  fontWeight: on ? 800 : 600,
                  fontSize: 13.5,
                  fontFamily: 'var(--s-font-body)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span aria-hidden="true">{on ? '✓' : '•'}</span>
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatClassName(cls.name)}</span>
                {cls.grade ? (
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--s-text-2)', whiteSpace: 'nowrap' }}>
                    Khối {cls.grade}
                  </span>
                ) : null}
              </button>
            );
          })}

          {onAddClass && (
            <button
              type="button"
              onClick={() => { setOpen(false); onAddClass(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 8px',
                minHeight: 40,
                borderRadius: 10,
                borderTop: '1px solid var(--s-line)',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                backgroundColor: 'transparent',
                color: 'var(--s-accent-ink)',
                fontWeight: 800,
                fontSize: 13,
                fontFamily: 'var(--s-font-body)',
                cursor: 'pointer',
                marginTop: 2,
              }}
            >
              <span aria-hidden="true">＋</span> Tạo lớp mới
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   16. SIDE NAVIGATION (220px Desktop)
   Đợt 15 · Chặng 5: rộng 220px, chữ menu 14px, ô "Quyền riêng tư" ngay dưới menu,
   chân thanh bên dùng formatTeacherName (không còn "Cô Cô Lan").
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
      aria-label="Thanh bên cổng giáo viên"
      style={{
        width: 220,
        flexShrink: 0,
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--s-line)',
        padding: '14px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px 6px 6px' }}>
        <BearMascot mood="greeting" size={34} />
        <div style={{ minWidth: 0 }}>
          <b style={{ fontFamily: 'var(--s-font-head)', fontSize: 15, color: 'var(--s-text)', display: 'block', lineHeight: 1.15 }}>
            Cổng Giáo Viên
          </b>
          {schoolName ? (
            <small style={{ fontSize: 12, color: 'var(--s-text-2)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {schoolName}
            </small>
          ) : null}
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
      <nav aria-label="Menu cổng giáo viên" style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
        {items.map((item) => {
          const isSel = item.id === activeItem;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={isSel ? 'page' : undefined}
              onClick={() => onSelect(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '8px 10px',
                minHeight: 42,
                borderRadius: 12,
                border: 'none',
                backgroundColor: isSel ? 'var(--s-accent-tint)' : 'transparent',
                color: isSel ? 'var(--s-text)' : 'var(--s-text-2)',
                fontWeight: isSel ? 800 : 700,
                fontSize: 14,
                fontFamily: 'var(--s-font-body)',
                boxShadow: isSel ? 'inset 4px 0 0 var(--s-accent)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 15, display: 'inline-flex', alignItems: 'center' }} aria-hidden="true">{item.icon}</span>
              <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.label}
              </span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  aria-label={`${item.badge} việc chờ`}
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    backgroundColor: 'var(--s-bad)',
                    color: '#FFFFFF',
                    borderRadius: 999,
                    padding: '0 7px',
                    lineHeight: '18px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Gấu nhắc quyền riêng tư: ngay dưới menu */}
      <div
        style={{
          marginTop: 6,
          backgroundColor: 'var(--s-accent-tint)',
          borderRadius: 14,
          padding: '10px 10px',
          display: 'grid',
          gridTemplateColumns: '28px 1fr',
          gap: 8,
          alignItems: 'center',
          fontSize: 12.5,
          lineHeight: 1.4,
          color: 'var(--s-text)',
        }}
      >
        <BearMascot mood="nudge" size={26} />
        <div>
          <b>Quyền riêng tư</b>: cô chỉ xem trạng thái bài, không thấy ảnh hay trò chuyện của gia đình.
        </div>
      </div>

      {/* Teacher Profile & Logout */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          paddingTop: 10,
          borderTop: '1px solid var(--s-line)',
          fontSize: 13,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'var(--s-accent-tint)',
            color: 'var(--s-accent-ink)',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 900,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {teacherInitial(teacherName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--s-text)' }}>
            {formatTeacherName(teacherName)}
          </strong>
          <span style={{ fontSize: 12, color: 'var(--s-ok)', fontWeight: 800 }}>Giáo viên</span>
        </div>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Đăng xuất"
            aria-label="Đăng xuất"
            style={{
              background: 'none',
              border: '1px solid var(--s-line)',
              borderRadius: 999,
              color: 'var(--s-text-2)',
              fontSize: 14,
              cursor: 'pointer',
              width: 36,
              height: 36,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
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
   Đợt 15 · Chặng 5: thanh tab dưới dùng `mobileItems` (5 nhãn ngắn một dòng,
   mục cuối là "Cô"), chữ tối thiểu 12px, vùng bấm từ 44px.
   ============================================================ */
export function StaffShell({
  children,
  items = [],
  mobileItems = null,
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
  className = '',
}) {
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false));

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const bottomItems = (mobileItems && mobileItems.length ? mobileItems : items).slice(0, 5);

  return (
    <div className={`staff-root ${className}`} style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--s-bg)' }}>
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingBottom: isMobile ? 'calc(76px + env(safe-area-inset-bottom, 0px))' : 20 }}>
        {/* Top Header */}
        <header
          style={{
            height: 54,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: isMobile ? '0 12px' : '0 18px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid var(--s-line)',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          {isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
              <BearMascot mood="greeting" size={26} />
              <strong style={{ fontFamily: 'var(--s-font-head)', fontSize: 15, color: 'var(--s-text)', whiteSpace: 'nowrap' }}>
                Cổng Giáo Viên
              </strong>
            </div>
          ) : (
            <div style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
              <input
                aria-label="Tìm học sinh hoặc bài tập"
                style={{
                  width: '100%',
                  padding: '7px 14px',
                  borderRadius: 999,
                  border: '2px solid var(--s-line)',
                  backgroundColor: '#FFFFFF',
                  fontSize: 13,
                  outline: 'none',
                  color: 'var(--s-text)',
                  boxSizing: 'border-box',
                }}
                placeholder="Tìm học sinh hoặc bài tập..."
                value={searchValue}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              />
            </div>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--s-text-2)', fontWeight: 700 }}>
              {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div
              aria-label={unreadCount > 0 ? `${unreadCount} việc chờ cô xem` : 'Không có việc chờ'}
              role="img"
              style={{
                width: 34,
                height: 34,
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
                    top: -5,
                    right: -6,
                    fontSize: 12,
                    lineHeight: '16px',
                    backgroundColor: 'var(--s-bad)',
                    color: '#FFFFFF',
                    borderRadius: 999,
                    padding: '0 5px',
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
          aria-label="Thanh tab cổng giáo viên"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            minHeight: 60,
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--s-line)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'stretch',
            zIndex: 100,
            boxShadow: '0 -4px 12px rgba(75, 54, 33, 0.08)',
          }}
        >
          {bottomItems.map((item) => {
            const isSel = item.id === activeItem;
            return (
              <button
                key={item.id}
                type="button"
                className="tp-bottom-tab"
                aria-current={isSel ? 'page' : undefined}
                aria-label={item.label}
                onClick={() => onSelect(item.id)}
                style={{
                  color: isSel ? 'var(--s-accent-ink)' : 'var(--s-text-2)',
                  fontWeight: isSel ? 900 : 700,
                  boxShadow: isSel ? 'inset 0 3px 0 var(--s-accent)' : 'none',
                }}
              >
                <span style={{ fontSize: 18, display: 'inline-flex', alignItems: 'center' }} aria-hidden="true">{item.icon}</span>
                <span>{item.shortLabel || item.label}</span>
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
