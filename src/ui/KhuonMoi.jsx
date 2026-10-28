/* ============================================================
   KÈM CON HỌC — CÁC THÀNH PHẦN DÙNG CHUNG THEO KHUÔN MỚI (T1, T2, T3, T4, T5, T7)
   Prompt 23 · Chặng 1 & Chặng 2
   ============================================================ */

import React, { useState, useEffect, useRef } from 'react'

/**
 * T1. NÚT PHẲNG MỀM (Soft-flat Button)
 * 5 loại: primary | secondary | ok | chip | danger
 * 3 cỡ: L (56px) | M (48px / 44px) | S (36px)
 */
export function BtnKm({
  variant = 'primary', // 'primary' | 'secondary' | 'ok' | 'chip' | 'danger'
  size = 'M',         // 'L' | 'M' | 'S'
  icon = null,
  arrow = false,
  active = false,
  disabled = false,
  children,
  className = '',
  onClick,
  style = {},
  ...props
}) {
  const sizeClass = `btn-km-${size.toLowerCase()}`
  const variantClass = `btn-km-${variant}`
  const activeClass = active ? 'active' : ''
  const disabledClass = disabled ? 'disabled' : ''

  return (
    <button
      type="button"
      className={`btn-km ${sizeClass} ${variantClass} ${activeClass} ${disabledClass} ${className}`.trim()}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={style}
      {...props}
    >
      {size === 'L' ? (
        <>
          {icon && <span className="btn-km-icon">{icon}</span>}
          <span className="btn-km-text">{children}</span>
          {arrow && <span className="btn-km-arrow">›</span>}
        </>
      ) : (
        <>
          {icon && <span style={{ display: 'grid', placeItems: 'center' }}>{icon}</span>}
          <span>{children}</span>
          {arrow && <span style={{ marginLeft: 4, fontWeight: 900 }}>›</span>}
        </>
      )}
    </button>
  )
}

/** Nút Giữ để xem (Hold Button with Progress) */
export function HoldBtn({
  onUnlock,
  label = 'Giữ 1.5s để xem đáp án',
  unlockedLabel = 'Đã mở đáp án',
  holdTimeMs = 1500,
  className = '',
  style = {},
}) {
  const [holding, setHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [unlocked, setUnlocked] = useState(false)
  const timerRef = useRef(null)
  const startTsRef = useRef(0)

  const startHold = (e) => {
    if (unlocked) return
    e.preventDefault?.()
    setHolding(true)
    startTsRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTsRef.current
      const pct = Math.min(100, (elapsed / holdTimeMs) * 100)
      setProgress(pct)
      if (elapsed >= holdTimeMs) {
        clearInterval(timerRef.current)
        setHolding(false)
        setUnlocked(true)
        if (onUnlock) onUnlock()
      }
    }, 40)
  }

  const cancelHold = () => {
    if (unlocked) return
    if (timerRef.current) clearInterval(timerRef.current)
    setHolding(false)
    setProgress(0)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <button
      type="button"
      className={`btn-km btn-km-m btn-km-secondary btn-km-hold ${className}`.trim()}
      onMouseDown={startHold}
      onMouseUp={cancelHold}
      onMouseLeave={cancelHold}
      onTouchStart={startHold}
      onTouchEnd={cancelHold}
      style={{
        ...style,
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        justifyContent: 'center',
      }}
    >
      <div
        className="btn-km-hold-progress"
        style={{
          width: `${progress}%`,
        }}
      />
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
        {unlocked ? '🔓' : '🔒'} {unlocked ? unlockedLabel : holding ? `Đang giữ... (${Math.round(progress)}%)` : label}
      </span>
    </button>
  )
}

/**
 * T2. THẺ (Card Component)
 * Các loại: default | action | ai | note | good | list
 */
export function CardKm({
  variant = 'default', // 'default' | 'action' | 'ai' | 'note' | 'good' | 'list'
  icon = null,
  title = null,
  sub = null,
  arrow = false,
  onClick,
  children,
  className = '',
  style = {},
  ...props
}) {
  const isAction = variant === 'action' || Boolean(onClick)
  const variantClass = variant !== 'default' ? `card-km-${variant}` : ''
  const actionClass = isAction ? 'card-km-action' : ''

  if (isAction && (title || sub)) {
    return (
      <div
        className={`card-km ${variantClass} ${actionClass} ${className}`.trim()}
        onClick={onClick}
        role="button"
        tabIndex={0}
        style={style}
        {...props}
      >
        {icon && <div className="card-km-icon">{icon}</div>}
        <div style={{ display: 'grid', gap: 2 }}>
          {title && <b className="t-card-title">{title}</b>}
          {sub && <p className="t-sub" style={{ margin: 0 }}>{sub}</p>}
          {children}
        </div>
        {arrow && <span style={{ fontSize: 20, color: 'var(--c-text-2)', fontWeight: 900 }}>›</span>}
      </div>
    )
  }

  return (
    <div className={`card-km ${variantClass} ${className}`.trim()} style={style} {...props}>
      {(title || icon) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
          {title && <b className="t-card-title">{title}</b>}
        </div>
      )}
      {children}
    </div>
  )
}

/** T3. THANH TRÊN MÀN TAB CHÍNH (40px) */
export function TopBarT3({ dateText, soundOn, onToggleSound, onOpenCalm }) {
  return (
    <div className="top-bar-t3">
      <span className="top-bar-t3-date">{dateText || 'T2 26/10 · Lớp 3'}</span>
      <div className="top-bar-t3-actions">
        {onToggleSound && (
          <button
            type="button"
            className="btn-km-circle"
            onClick={onToggleSound}
            aria-label="Bật tắt âm thanh"
            title="Âm thanh"
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
        )}
        {onOpenCalm && (
          <button
            type="button"
            className="btn-km-circle"
            onClick={onOpenCalm}
            aria-label="Mẹ bình tĩnh"
            title="Góc bình yên"
            data-testid="btn-calm-corner-t3"
          >
            😮‍💨
          </button>
        )}
      </div>
    </div>
  )
}

/** T4. THANH TRÊN MÀN TẬP TRUNG (48px) */
export function TopBarT4({ onBack, title, stepText, onOpenCalm }) {
  return (
    <div className="top-bar-t4">
      {onBack && (
        <button
          type="button"
          className="btn-km-circle"
          onClick={onBack}
          aria-label="Quay lại"
          title="Quay lại"
        >
          ‹
        </button>
      )}
      <div className="top-bar-t4-title">
        <b>{title}</b>
        {stepText && <span>{stepText}</span>}
      </div>
      {onOpenCalm && (
        <button
          type="button"
          className="btn-km-circle"
          onClick={onOpenCalm}
          aria-label="Mẹ bình tĩnh"
          title="Góc bình yên"
          data-testid="btn-calm-corner-t4"
        >
          😮‍💨
        </button>
      )}
    </div>
  )
}

/** THANH TIẾN ĐỘ 4 KHÚC CHO MÀN TẬP TRUNG */
export function Progress4({ currentStep, totalSteps, current, total }) {
  const cur = currentStep ?? ((current !== undefined) ? current + 1 : 1)
  const tot = totalSteps ?? total ?? 4
  return (
    <div className="fprog-4" aria-label={`Bước ${cur} trên ${tot}`}>
      {Array.from({ length: tot }).map((_, i) => {
        const stepNum = i + 1
        const isDone = stepNum < cur
        const isCur = stepNum === cur
        return <i key={i} className={isDone ? 'done' : isCur ? 'cur' : ''} />
      })}
    </div>
  )
}

/**
 * T5. BẢNG TRƯỢT (Slide-up Sheet)
 * Neo đáy, bo trên 24px, thanh kéo, tiêu đề 17px, nút ✕, nút dính đáy
 */
export function SheetT5({
  isOpen,
  onClose,
  title,
  children,
  stickyBottom = null,
}) {
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="sheet-t5-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="sheet-t5-card">
        <div className="sheet-t5-grab" />
        <div className="sheet-t5-header">
          <h3 className="sheet-t5-title">{title}</h3>
          <button
            type="button"
            className="btn-km-circle"
            onClick={onClose}
            aria-label="Đóng"
            style={{ width: 32, height: 32, fontSize: 14 }}
          >
            ✕
          </button>
        </div>
        <div className="sheet-t5-body">{children}</div>
        {stickyBottom && <div className="sheet-t5-sticky-bottom">{stickyBottom}</div>}
      </div>
    </div>
  )
}

/** THANH DÙNG THỬ MẢNH 32PX */
export function TrialBannerKm({ onRegister }) {
  return (
    <div className="banner-trial-km">
      <span>
        ✨ <b>Đang dùng thử</b> · Không lưu đám mây
      </span>
      {onRegister && (
        <button
          type="button"
          onClick={onRegister}
          className="btn-km btn-km-s btn-km-primary"
          style={{ height: 26, fontSize: 11.5, padding: '0 8px' }}
        >
          Tạo tài khoản
        </button>
      )}
    </div>
  )
}
