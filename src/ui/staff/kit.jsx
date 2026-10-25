/**
 * 🐻 BỘ QUY CHUẨN GIAO DIỆN DÙNG CHUNG — ĐỢT 15 CHẶNG 1
 * Dùng cho cả admin và cổng giáo viên. Nền kem, chữ nâu, mật ong; không khối nền tối,
 * không <select> mặc định, không nhãn nội bộ, số không có dữ liệu thì hiện "·".
 *
 * PageHeader · KpiCard · Input · Select (tự vẽ, có bàn phím) · Slider · Chip · Toast (có Hoàn tác)
 * ConfirmDialog (+ staffConfirm) · CodeEditor (số dòng, biến {{...}} tô vàng) · Drawer · Pagination
 */
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BearMascot, Button, StatusPill } from './index.jsx'

/* ---------------- PageHeader ---------------- */
export function PageHeader({ title, description, status = null, actions = null, breadcrumb = null, style = {} }) {
  return (
    <header className="sk-page-header" style={style}>
      <div style={{ minWidth: 0, flex: 1 }}>
        {breadcrumb && <div className="sk-breadcrumb">{breadcrumb}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 className="sk-page-title">{title}</h1>
          {status && (typeof status === 'string' ? <StatusPill status="ok" label={status} /> : <StatusPill status={status.tone || 'ok'} label={status.label} />)}
        </div>
        {description && <p className="sk-page-desc">{description}</p>}
      </div>
      {actions && <div className="sk-page-actions">{actions}</div>}
    </header>
  )
}

/* ---------------- KpiCard ---------------- */
const isEmptyValue = (v) => v === null || v === undefined || v === '' || (typeof v === 'number' && Number.isNaN(v))
export function KpiCard({ label, value, sub, tone = 'default', emptyText = 'Chưa có dữ liệu', onClick, style = {} }) {
  const empty = isEmptyValue(value)
  const subColor = tone === 'ok' ? 'var(--s-ok)' : tone === 'bad' ? 'var(--s-bad)' : tone === 'warn' ? 'var(--s-warn)' : 'var(--s-text-2)'
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className={`sk-card sk-kpi ${onClick ? 'sk-clickable' : ''}`} onClick={onClick} type={onClick ? 'button' : undefined} style={style}>
      <div className="sk-kpi-label">{label}</div>
      <div className="sk-kpi-value" aria-label={empty ? emptyText : undefined}>{empty ? '·' : value}</div>
      <div className="sk-kpi-sub" style={{ color: empty ? 'var(--s-text-2)' : subColor }}>{empty ? emptyText : sub}</div>
    </Tag>
  )
}

/* ---------------- Input ---------------- */
export const Input = React.forwardRef(function Input({ value, onChange, placeholder, type = 'text', invalid = false, prefix = null, style = {}, ...props }, ref) {
  return (
    <div className={`sk-input-wrap ${invalid ? 'sk-invalid' : ''}`} style={style}>
      {prefix && <span className="sk-input-prefix">{prefix}</span>}
      <input
        ref={ref}
        className="sk-input"
        type={type}
        {...(value !== undefined ? { value: value ?? '', onChange, readOnly: !onChange } : { onChange })}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        {...props}
      />
    </div>
  )
})

export function Textarea({ value, onChange, placeholder, rows = 4, invalid = false, style = {}, ...props }) {
  return (
    <textarea className={`sk-input sk-textarea ${invalid ? 'sk-invalid' : ''}`} rows={rows} value={value ?? ''} onChange={onChange} placeholder={placeholder} style={style} {...props} />
  )
}

/* ---------------- Select (tự vẽ, listbox có bàn phím) ---------------- */
export function Select({ value, onChange, options = [], placeholder = 'Chọn…', disabled = false, style = {}, ariaLabel, size = 'md' }) {
  const opts = useMemo(() => options.map((o) => (typeof o === 'object' ? o : { value: o, label: String(o) })), [options])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const typeBuf = useRef({ s: '', t: 0 })
  const id = useId()
  const current = opts.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (open) {
      const i = Math.max(0, opts.findIndex((o) => o.value === value))
      setActive(i)
    }
  }, [open])

  useEffect(() => {
    if (!open || active < 0 || !listRef.current) return
    const el = listRef.current.querySelector(`[data-idx="${active}"]`)
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const pick = (i) => {
    const o = opts[i]
    if (!o || o.disabled) return
    onChange && onChange(o.value, o)
    setOpen(false)
  }
  const move = (d) => {
    if (!opts.length) return
    let i = active
    for (let k = 0; k < opts.length; k++) {
      i = (i + d + opts.length) % opts.length
      if (!opts[i].disabled) break
    }
    setActive(i)
  }
  const onKey = (e) => {
    if (disabled) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) setOpen(true)
      else move(e.key === 'ArrowDown' ? 1 : -1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (open) pick(active)
      else setOpen(true)
    } else if (e.key === 'Escape') {
      if (open) {
        e.stopPropagation()
        setOpen(false)
      }
    } else if (e.key === 'Home' && open) {
      e.preventDefault()
      setActive(0)
    } else if (e.key === 'End' && open) {
      e.preventDefault()
      setActive(opts.length - 1)
    } else if (e.key === 'Tab') {
      setOpen(false)
    } else if (e.key.length === 1) {
      const now = Date.now()
      typeBuf.current.s = now - typeBuf.current.t > 700 ? e.key.toLowerCase() : typeBuf.current.s + e.key.toLowerCase()
      typeBuf.current.t = now
      const i = opts.findIndex((o) => String(o.label).toLowerCase().startsWith(typeBuf.current.s))
      if (i >= 0) {
        setActive(i)
        if (!open) onChange && onChange(opts[i].value, opts[i])
      }
    }
  }

  return (
    <div ref={rootRef} className={`sk-select ${open ? 'sk-open' : ''} ${size === 'sm' ? 'sk-sm' : ''}`} style={style}>
      <button
        type="button"
        className="sk-select-btn"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={ariaLabel}
        aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKey}
      >
        <span className={current ? '' : 'sk-placeholder'}>{current ? current.label : placeholder}</span>
        <span className="sk-caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul ref={listRef} id={`${id}-list`} role="listbox" className="sk-select-list" tabIndex={-1}>
          {opts.map((o, i) => (
            <li
              key={String(o.value)}
              id={`${id}-opt-${i}`}
              data-idx={i}
              role="option"
              aria-selected={o.value === value}
              aria-disabled={o.disabled || undefined}
              className={`sk-option ${i === active ? 'sk-active' : ''} ${o.value === value ? 'sk-selected' : ''} ${o.disabled ? 'sk-disabled' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault()
                pick(i)
              }}
            >
              <span>{o.label}</span>
              {o.hint && <small>{o.hint}</small>}
              {o.value === value && <span aria-hidden="true" className="sk-check">✓</span>}
            </li>
          ))}
          {opts.length === 0 && <li className="sk-option sk-disabled">Chưa có lựa chọn</li>}
        </ul>
      )}
    </div>
  )
}

/* ---------------- Slider ---------------- */
export function Slider({ value, onChange, min = 0, max = 100, step = 1, label, format = (v) => v, style = {}, ...props }) {
  const pct = ((Number(value) - min) / (max - min || 1)) * 100
  return (
    <div className="sk-slider" style={style}>
      {label && (
        <div className="sk-slider-head">
          <span>{label}</span>
          <b>{format(value)}</b>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange && onChange(Number(e.target.value))}
        style={{ '--sk-pct': `${Math.max(0, Math.min(100, pct))}%` }}
        aria-label={typeof label === 'string' ? label : undefined}
        {...props}
      />
    </div>
  )
}

/* ---------------- Chip ---------------- */
export function Chip({ children, selected = false, onClick, onRemove, removeLabel = 'Xoá', style = {} }) {
  return (
    <span className={`sk-chip ${selected ? 'sk-on' : ''} ${onClick ? 'sk-clickable' : ''}`} style={style}>
      {onClick ? (
        <button type="button" className="sk-chip-main" onClick={onClick} aria-pressed={selected}>
          {children}
        </button>
      ) : (
        <span className="sk-chip-main">{children}</span>
      )}
      {onRemove && (
        <button type="button" className="sk-chip-x" onClick={onRemove} aria-label={`${removeLabel} ${typeof children === 'string' ? children : ''}`.trim()}>
          ×
        </button>
      )}
    </span>
  )
}

/* ---------------- Toast (có Hoàn tác) ---------------- */
let pushToast = null
const pendingToasts = []
/** staffToast('Đã lưu', { undo: () => ..., tone: 'ok' | 'bad', ms: 5000 }) */
export function staffToast(message, opts = {}) {
  const t = { id: Date.now() + Math.random(), message, ...opts }
  if (pushToast) pushToast(t)
  else pendingToasts.push(t)
  return t.id
}
export function ToastHost() {
  const [items, setItems] = useState([])
  useEffect(() => {
    pushToast = (t) => setItems((l) => [...l.slice(-2), t])
    if (pendingToasts.length) setItems((l) => [...l, ...pendingToasts.splice(0)])
    return () => {
      pushToast = null
    }
  }, [])
  const remove = useCallback((id) => setItems((l) => l.filter((x) => x.id !== id)), [])
  return (
    <div className="sk-toast-host" role="status" aria-live="polite">
      {items.map((t) => (
        <ToastItem key={t.id} t={t} onDone={() => remove(t.id)} />
      ))}
    </div>
  )
}
function ToastItem({ t, onDone }) {
  useEffect(() => {
    const h = setTimeout(onDone, t.ms || (t.undo ? 6000 : 3500))
    return () => clearTimeout(h)
  }, [])
  return (
    <div className={`sk-toast ${t.tone === 'bad' ? 'sk-bad' : ''}`}>
      <span>{t.tone === 'bad' ? '⚠️' : '✓'} {t.message}</span>
      {t.undo && (
        <button
          type="button"
          onClick={() => {
            t.undo()
            onDone()
          }}
        >
          Hoàn tác
        </button>
      )}
    </div>
  )
}

/* ---------------- ConfirmDialog ---------------- */
export function ConfirmDialog({ open, title = 'Bạn chắc chứ?', message, confirmText = 'Xác nhận', cancelText = 'Huỷ', danger = false, requireText = null, onConfirm, onCancel }) {
  const [typed, setTyped] = useState('')
  const okRef = useRef(null)
  useEffect(() => {
    if (open) {
      setTyped('')
      setTimeout(() => okRef.current?.focus(), 30)
    }
  }, [open])
  if (!open) return null
  const blocked = requireText && typed.trim() !== requireText
  return createPortal(
    <div className="sk-overlay" onMouseDown={onCancel} onKeyDown={(e) => e.key === 'Escape' && onCancel && onCancel()}>
      <div className="sk-dialog staff-root-lite" role="alertdialog" aria-modal="true" aria-labelledby="sk-dlg-t" onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <BearMascot mood={danger ? 'nudge' : 'greeting'} size={44} />
          <h3 id="sk-dlg-t" className="sk-dialog-title">{title}</h3>
        </div>
        {message && <div className="sk-dialog-msg">{message}</div>}
        {requireText && (
          <label className="sk-dialog-msg" style={{ display: 'grid', gap: 6 }}>
            <span>
              Gõ <b>{requireText}</b> để xác nhận
            </span>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
          </label>
        )}
        <div className="sk-dialog-actions">
          <Button variant="ghost" onClick={onCancel}>{cancelText}</Button>
          <Button ref={okRef} variant={danger ? 'danger' : 'primary'} disabled={blocked} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/** Gọi kiểu Promise: const ok = await staffConfirm({ title, message, danger: true }) */
let pushConfirm = null
export function staffConfirm(opts) {
  return new Promise((resolve) => {
    if (!pushConfirm) {
      resolve(window.confirm ? window.confirm(opts?.message || opts?.title || 'Xác nhận?') : false)
      return
    }
    pushConfirm({ ...opts, resolve })
  })
}
export function ConfirmHost() {
  const [cur, setCur] = useState(null)
  useEffect(() => {
    pushConfirm = (o) => setCur(o)
    return () => {
      pushConfirm = null
    }
  }, [])
  const done = (v) => {
    cur?.resolve(v)
    setCur(null)
  }
  return <ConfirmDialog open={Boolean(cur)} {...(cur || {})} onConfirm={() => done(true)} onCancel={() => done(false)} />
}

/* ---------------- CodeEditor (nền sáng, số dòng, {{biến}} tô vàng) ---------------- */
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
export function highlightTemplate(src) {
  return escapeHtml(String(src || '')).replace(/\{\{\s*[\w.\-]+\s*\}\}/g, (m) => `<mark class="sk-var">${m}</mark>`) + '\n'
}
export function CodeEditor({ value = '', onChange, readOnly = false, minRows = 8, maxHeight = 520, ariaLabel = 'Nội dung prompt', style = {} }) {
  const taRef = useRef(null)
  const preRef = useRef(null)
  const gutRef = useRef(null)
  const lines = String(value).split('\n').length
  const sync = () => {
    const t = taRef.current
    if (!t) return
    if (preRef.current) {
      preRef.current.scrollTop = t.scrollTop
      preRef.current.scrollLeft = t.scrollLeft
    }
    if (gutRef.current) gutRef.current.scrollTop = t.scrollTop
  }
  return (
    <div className="sk-code" style={{ maxHeight, ...style }}>
      <div ref={gutRef} className="sk-code-gutter" aria-hidden="true">
        {Array.from({ length: Math.max(lines, minRows) }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div className="sk-code-body">
        <pre ref={preRef} className="sk-code-hl" aria-hidden="true" dangerouslySetInnerHTML={{ __html: highlightTemplate(value) }} />
        <textarea
          ref={taRef}
          className="sk-code-ta"
          value={value}
          readOnly={readOnly}
          spellCheck={false}
          aria-label={ariaLabel}
          rows={Math.max(lines, minRows)}
          onScroll={sync}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Tab' && !readOnly) {
              e.preventDefault()
              const t = e.currentTarget
              const s = t.selectionStart
              const next = value.slice(0, s) + '  ' + value.slice(t.selectionEnd)
              onChange && onChange(next)
              requestAnimationFrame(() => t.setSelectionRange(s + 2, s + 2))
            }
          }}
        />
      </div>
    </div>
  )
}

/* ---------------- Drawer ---------------- */
export function Drawer({ open, title, onClose, children, footer = null, width = 460 }) {
  useEffect(() => {
    if (!open) return
    const k = (e) => e.key === 'Escape' && onClose && onClose()
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  return createPortal(
    <div className="sk-overlay sk-overlay-right" onMouseDown={onClose}>
      <aside className="sk-drawer" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined} style={{ width: `min(${width}px, 100vw)` }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="sk-drawer-head">
          <h3 className="sk-dialog-title">{title}</h3>
          <button type="button" className="sk-icon-btn" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>
        <div className="sk-drawer-body">{children}</div>
        {footer && <div className="sk-drawer-foot">{footer}</div>}
      </aside>
    </div>,
    document.body
  )
}

/* ---------------- Pagination ---------------- */
export function Pagination({ page, pageCount, onChange }) {
  if (!pageCount || pageCount <= 1) return null
  return (
    <nav className="sk-pager" aria-label="Phân trang">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Trang trước">
        ‹
      </button>
      <span>
        Trang <b>{page}</b> / {pageCount}
      </span>
      <button type="button" disabled={page >= pageCount} onClick={() => onChange(page + 1)} aria-label="Trang sau">
        ›
      </button>
    </nav>
  )
}
