/* ============================================================
   KÈM CON HỌC — 8 BỘ ICON THANH DƯỚI & NHẬP ĐỀ (SVG SYSTEM)
   Prompt 07 Phần B (Chuẩn thiết kế từ 8-bo-giao-dien-rieng.html)
   ============================================================ */
import React from 'react'

/**
 * 3 nút nhập đề (dùng chung hình thức nét đẹp, thay cho emoji)
 */
export function InputModeIcon({ mode, size = 20, className = '' }) {
  if (mode === 'photo' || mode === 'cam') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }}
          d="M4.2 8.3h3l1.6-2.6h6.4l1.6 2.6h3a1.2 1.2 0 0 1 1.2 1.2v8.6a1.2 1.2 0 0 1-1.2 1.2H4.2A1.2 1.2 0 0 1 3 18.1V9.5a1.2 1.2 0 0 1 1.2-1.2z"
        />
        <path
          style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }}
          d="M4.2 8.3h3l1.6-2.6h6.4l1.6 2.6h3a1.2 1.2 0 0 1 1.2 1.2v8.6a1.2 1.2 0 0 1-1.2 1.2H4.2A1.2 1.2 0 0 1 3 18.1V9.5a1.2 1.2 0 0 1 1.2-1.2z"
        />
        <circle
          style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }}
          cx="12"
          cy="13.6"
          r="3.3"
        />
        <circle style={{ fill: 'var(--ia, currentColor)' }} cx="18" cy="11" r="1" />
      </svg>
    )
  }
  if (mode === 'type' || mode === 'keys') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} x="2.5" y="6" width="19" height="12.5" rx="2.8" />
        <rect style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} x="2.5" y="6" width="19" height="12.5" rx="2.8" />
        <circle style={{ fill: 'var(--ip, currentColor)' }} cx="6.6" cy="10" r="1.05" />
        <circle style={{ fill: 'var(--ip, currentColor)' }} cx="10.2" cy="10" r="1.05" />
        <circle style={{ fill: 'var(--ip, currentColor)' }} cx="13.8" cy="10" r="1.05" />
        <circle style={{ fill: 'var(--ip, currentColor)' }} cx="17.4" cy="10" r="1.05" />
        <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M8.5 14.6h7" />
      </svg>
    )
  }
  if (mode === 'voice' || mode === 'mic') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} x="8.8" y="2.8" width="6.4" height="11.4" rx="3.2" />
        <rect style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} x="8.8" y="2.8" width="6.4" height="11.4" rx="3.2" />
        <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M5.6 11.4a6.4 6.4 0 0 0 12.8 0M12 17.8v3.2M9 21h6" />
        <path style={{ fill: 'var(--ia, currentColor)' }} d="M10.7 6.2h2.6v1.3h-2.6z" />
      </svg>
    )
  }
  return null
}

/**
 * 4 Tab thanh dưới riêng biệt cho từng bộ
 */
export function ThemedTabIcon({ themeId = 'bear', tab = 'home', active = false, size = 22 }) {
  const t = themeId || 'bear'

  // A · AURORA (Cực Quang)
  if (t === 'aurora') {
    if (tab === 'home') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M19.6 14.6A8.2 8.2 0 0 1 9.4 4.4a8.2 8.2 0 1 0 10.2 10.2z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M19.6 14.6A8.2 8.2 0 0 1 9.4 4.4a8.2 8.2 0 1 0 10.2 10.2z" />
          <path style={{ fill: 'var(--ia, currentColor)' }} d="M17.2 3.2l.75 1.7 1.7.75-1.7.75-.75 1.7-.75-1.7-1.7-.75 1.7-.75z" />
          <circle style={{ fill: 'var(--ia, currentColor)' }} cx="20.5" cy="9.5" r="0.9" />
        </svg>
      )
    }
    if (tab === 'game') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M12 2.8c3 2 4.6 5.6 4.6 9.6L14.6 17H9.4l-2-4.6C7.4 8.4 9 4.8 12 2.8z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 2.8c3 2 4.6 5.6 4.6 9.6L14.6 17H9.4l-2-4.6C7.4 8.4 9 4.8 12 2.8z" />
          <circle style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="12" cy="9.8" r="1.9" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M7.6 12.6 5 16.4l2.9.3M16.4 12.6 19 16.4l-2.9.3" />
          <path style={{ fill: 'var(--ia, currentColor)' }} d="M10.4 17.6 12 21.4l1.6-3.8z" />
        </svg>
      )
    }
    if (tab === 'report') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M4 18 9 12 13 14 19 6V20H4z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M4 18 9 12 13 14 19 6" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="4" cy="18" r="1.7" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="9" cy="12" r="1.7" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="13" cy="14" r="1.7" />
          <path style={{ fill: 'var(--ia, currentColor)' }} d="M19 3.4l.9 1.8 1.8.9-1.8.9-.9 1.8-.9-1.8-1.8-.9 1.8-.9z" />
        </svg>
      )
    }
    if (tab === 'child') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M12 3.6a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 3.6a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2z" />
          <path style={{ fill: 'var(--ip, currentColor)' }} d="M8.6 8.6h6.8a1.4 1.4 0 0 1 1.4 1.4v.8a3 3 0 0 1-3 3h-3.6a3 3 0 0 1-3-3V10a1.4 1.4 0 0 1 1.4-1.4z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M5.8 21.2c.6-2.6 2.9-4.2 6.2-4.2s5.6 1.6 6.2 4.2" />
          <circle style={{ fill: 'var(--ia, currentColor)' }} cx="14.6" cy="10.2" r="0.8" />
        </svg>
      )
    }
  }

  // B · STICKER STUDIO
  if (t === 'sticker') {
    if (tab === 'home') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M6 9.5a6 6 0 0 1 12 0V19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M6 9.5a6 6 0 0 1 12 0V19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M9.5 5.2V4.4a2.5 2.5 0 0 1 5 0v.8M8.6 14h6.8v4H8.6z" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="12" cy="10" r="1.2" />
        </svg>
      )
    }
    if (tab === 'game') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M7 8h10a4.6 4.6 0 0 1 4.4 5.9l-1 3.3a2.4 2.4 0 0 1-4 1L14.6 16H9.4l-1.8 2.2a2.4 2.4 0 0 1-4-1l-1-3.3A4.6 4.6 0 0 1 7 8z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M7 8h10a4.6 4.6 0 0 1 4.4 5.9l-1 3.3a2.4 2.4 0 0 1-4 1L14.6 16H9.4l-1.8 2.2a2.4 2.4 0 0 1-4-1l-1-3.3A4.6 4.6 0 0 1 7 8z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M7.6 10.6v3.2M6 12.2h3.2" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="15.6" cy="11.2" r="1.15" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="17.6" cy="13.3" r="1.15" />
        </svg>
      )
    }
    if (tab === 'report') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M7.5 4h9v5.2a4.5 4.5 0 0 1-9 0z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M7.5 4h9v5.2a4.5 4.5 0 0 1-9 0z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M7.5 6.2H5.2a2.6 2.6 0 0 0 2.6 4M16.5 6.2h2.3a2.6 2.6 0 0 1-2.6 4M12 13.7V17M9.4 17h5.2v3.6H9.4z" />
          <path style={{ fill: 'var(--ia, currentColor)' }} d="M12.00 5.60 L12.68 7.27 L14.47 7.40 L13.09 8.56 L13.53 10.30 L12.00 9.35 L10.47 10.30 L10.91 8.56 L9.53 7.40 L11.32 7.27Z" />
        </svg>
      )
    }
    if (tab === 'child') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M12.00 3.00 L14.59 9.04 L21.13 9.63 L16.18 13.96 L17.64 20.37 L12.00 17.00 L6.36 20.37 L7.82 13.96 L2.87 9.63 L9.41 9.04Z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12.00 3.00 L14.59 9.04 L21.13 9.63 L16.18 13.96 L17.64 20.37 L12.00 17.00 L6.36 20.37 L7.82 13.96 L2.87 9.63 L9.41 9.04Z" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="10.1" cy="12.2" r="1.05" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="13.9" cy="12.2" r="1.05" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M10.2 14.9q1.8 1.5 3.6 0" />
        </svg>
      )
    }
  }

  // C · NOTEBOOK (Sổ Tay Buổi Tối)
  if (t === 'notebook') {
    if (tab === 'home') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M12 6.6C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.6z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 6.6C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.6z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 6.6v12.9" />
          <path style={{ fill: 'var(--ia, currentColor)' }} d="M15.4 4.7v5.1l1.4-1 1.4 1V4.6z" />
        </svg>
      )
    }
    if (tab === 'game') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M3 11.5 20.6 4l-4.4 16-4.3-6.3z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M3 11.5 20.6 4l-4.4 16-4.3-6.3z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M11.9 13.7 20.6 4" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeDasharray: '1.4 1.9' }} d="M3.2 17.6l3.6-1.8" />
        </svg>
      )
    }
    if (tab === 'report') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M6.5 3h11A1.5 1.5 0 0 1 19 4.5v15a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-15A1.5 1.5 0 0 1 6.5 3z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M6.5 3h11A1.5 1.5 0 0 1 19 4.5v15a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-15A1.5 1.5 0 0 1 6.5 3z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M11 8.4h5M11 12.4h5M11 16.4h3.4M7.6 8.3l.8.8 1.3-1.6M7.6 12.3l.8.8 1.3-1.6" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="8.5" cy="16.4" r="0.9" />
        </svg>
      )
    }
    if (tab === 'child') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M5 4h14v16H5z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeDasharray: '1.4 1.9' }} d="M4.2 3.2h15.6v17.6H4.2z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M6.6 5.6h10.8v12.8H6.6z" />
          <circle style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="12" cy="10.4" r="2.5" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M8.4 16.6c.6-1.8 2-2.8 3.6-2.8s3 1 3.6 2.8" />
        </svg>
      )
    }
  }

  // D · BENTO (Bento Mềm)
  if (t === 'bento') {
    if (tab === 'home') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <rect style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} x="3.5" y="3.5" width="8" height="8" rx="2.4" />
          <rect style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} x="3.5" y="3.5" width="8" height="8" rx="2.4" />
          <rect style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} x="12.5" y="3.5" width="8" height="5" rx="2" />
          <rect style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} x="3.5" y="12.5" width="8" height="8" rx="2.4" />
          <rect style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} x="12.5" y="9.5" width="8" height="11" rx="2.4" />
          <circle style={{ fill: 'var(--ia, currentColor)' }} cx="16.5" cy="15" r="1.3" />
        </svg>
      )
    }
    if (tab === 'game') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M5 8h3.2a2.3 2.3 0 1 1 4.6 0H16v3.2a2.3 2.3 0 1 1 0 4.6V19h-3.2a2.3 2.3 0 1 0-4.6 0H5z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M5 8h3.2a2.3 2.3 0 1 1 4.6 0H16v3.2a2.3 2.3 0 1 1 0 4.6V19h-3.2a2.3 2.3 0 1 0-4.6 0H5z" />
        </svg>
      )
    }
    if (tab === 'report') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} cx="12" cy="12" r="8.2" />
          <circle style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="12" cy="12" r="8.2" opacity="0.35" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 3.8a8.2 8.2 0 1 1-8.2 8.2" />
          <circle style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="12" cy="12" r="3.6" />
          <circle style={{ fill: 'var(--ia, currentColor)' }} cx="3.8" cy="12" r="1.5" />
        </svg>
      )
    }
    if (tab === 'child') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <rect style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} x="3.5" y="3.5" width="17" height="17" rx="5.5" />
          <rect style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} x="3.5" y="3.5" width="17" height="17" rx="5.5" />
          <circle style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="12" cy="10.2" r="2.9" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M7.4 18.6c.8-2.3 2.5-3.5 4.6-3.5s3.8 1.2 4.6 3.5" />
        </svg>
      )
    }
  }

  // E · GARDEN (Khu Vườn Đêm)
  if (t === 'garden') {
    if (tab === 'home') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 2.4v2.2M9.2 4.6h5.6" />
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M8 6.6h8l1.2 3v5L16 17.6H8l-1.2-3v-5z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M8 6.6h8l1.2 3v5L16 17.6H8l-1.2-3v-5z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 6.6v11M10 19.8h4" />
          <circle style={{ fill: 'var(--ia, currentColor)' }} cx="12" cy="12" r="1.8" />
        </svg>
      )
    }
    if (tab === 'game') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M12 7.2c3.8 0 6.6 2.9 6.6 6.6S15.8 20.6 12 20.6 5.4 17.5 5.4 13.8 8.2 7.2 12 7.2z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 7.2c3.8 0 6.6 2.9 6.6 6.6S15.8 20.6 12 20.6 5.4 17.5 5.4 13.8 8.2 7.2 12 7.2z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 7.2v13.4M9 7.6a3 3 0 0 1 6 0M10.2 5.2 8.6 3M13.8 5.2 15.4 3" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="9.2" cy="12.2" r="1.15" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="14.8" cy="12.2" r="1.15" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="9.6" cy="16.2" r="1.05" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="14.4" cy="16.2" r="1.05" />
        </svg>
      )
    }
    if (tab === 'report') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M7 15h10l-1.2 6H8.2z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M7 15h10l-1.2 6H8.2z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 15V6.4" />
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M12 11.2c-3 0-4.6-1.5-5.1-4.1 2.9-.2 4.6 1 5.1 4.1zM12 8.8c2.7 0 4.1-1.3 4.7-3.8-2.7-.2-4.2.9-4.7 3.8z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 11.2c-3 0-4.6-1.5-5.1-4.1 2.9-.2 4.6 1 5.1 4.1zM12 8.8c2.7 0 4.1-1.3 4.7-3.8-2.7-.2-4.2.9-4.7 3.8z" />
          <circle style={{ fill: 'var(--ia, currentColor)' }} cx="12" cy="5.2" r="1.3" />
        </svg>
      )
    }
    if (tab === 'child') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} cx="12.00" cy="5.80" r="3.1" />
          <circle style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="12.00" cy="5.80" r="3.1" />
          <circle style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} cx="16.50" cy="8.40" r="3.1" />
          <circle style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="16.50" cy="8.40" r="3.1" />
          <circle style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} cx="16.50" cy="13.60" r="3.1" />
          <circle style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="16.50" cy="13.60" r="3.1" />
          <circle style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} cx="12.00" cy="16.20" r="3.1" />
          <circle style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="12.00" cy="16.20" r="3.1" />
          <circle style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} cx="7.50" cy="13.60" r="3.1" />
          <circle style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="7.50" cy="13.60" r="3.1" />
          <circle style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} cx="7.50" cy="8.40" r="3.1" />
          <circle style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="7.50" cy="8.40" r="3.1" />
          <circle style={{ fill: 'var(--ia, currentColor)' }} cx="12" cy="11" r="3.4" />
          <circle style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="12" cy="11" r="3.4" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="10.9" cy="10.6" r="0.7" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="13.1" cy="10.6" r="0.7" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 14.4v7" />
        </svg>
      )
    }
  }

  // F · CHALK (Bảng Phấn)
  if (t === 'chalk') {
    if (tab === 'home') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M12.00 3.00 L14.47 9.00 L20.94 9.50 L15.99 13.70 L17.53 20.00 L12.00 16.60 L6.47 20.00 L8.01 13.70 L3.06 9.50 L9.53 9.00Z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12.00 3.00 L14.47 9.00 L20.94 9.50 L15.99 13.70 L17.53 20.00 L12.00 16.60 L6.47 20.00 L8.01 13.70 L3.06 9.50 L9.53 9.00Z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M20.4 3.4l-1.2 1.2M21.4 6.6h-1.6M17.6 2.6v1.6" />
        </svg>
      )
    }
    if (tab === 'game') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M9.2 3.6v16.8M14.8 3.6v16.8M3.6 9.2h16.8M3.6 14.8h16.8M4.8 4.8l2.6 2.6M7.4 4.8 4.8 7.4M16.6 16.6l2.6 2.6M19.2 16.6l-2.6 2.6" />
          <circle style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="12" cy="12" r="1.7" />
        </svg>
      )
    }
    if (tab === 'report') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M3.8 3.8v16.4h16.4M7.6 16V9.2M10.2 16V8.4M12.8 16V7.6M15.4 16V6.8M6.4 14.4 17 8" />
          <path style={{ fill: 'var(--ia, currentColor)' }} d="M18.6 3.6l1.8 3.2h-3.6z" />
        </svg>
      )
    }
    if (tab === 'child') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M12 3.6c4.9-.2 8.5 3.6 8.4 8.6-.1 4.6-3.9 8.3-8.6 8.2-4.6-.1-8.4-3.8-8.2-8.6C3.8 7.2 7.3 3.8 12 3.6z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 3.6c4.9-.2 8.5 3.6 8.4 8.6-.1 4.6-3.9 8.3-8.6 8.2-4.6-.1-8.4-3.8-8.2-8.6C3.8 7.2 7.3 3.8 12 3.6z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M9.2 9.4v1.4M14.8 9.4v1.4M8.4 14.2c1.9 2.4 5.3 2.4 7.2 0" />
        </svg>
      )
    }
  }

  // G · CANDY (Kẹo Bông)
  if (t === 'candy') {
    if (tab === 'home') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M7 18.6h10a3.6 3.6 0 0 0 .4-7.2A5.1 5.1 0 0 0 7.8 10.6 4 4 0 0 0 7 18.6z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M7 18.6h10a3.6 3.6 0 0 0 .4-7.2A5.1 5.1 0 0 0 7.8 10.6 4 4 0 0 0 7 18.6z" />
          <path style={{ fill: 'var(--ia, currentColor)' }} d="M18.6 3a3 3 0 1 0 2.6 4.4 2.5 2.5 0 0 1-2.6-4.4z" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="10" cy="14.6" r="0.85" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="14" cy="14.6" r="0.85" />
        </svg>
      )
    }
    if (tab === 'game') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M7.6 10.4 3.4 7.8v8.4l4.2-2.6M16.4 10.4l4.2-2.6v8.4l-4.2-2.6" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M7.6 10.4 3.4 7.8v8.4l4.2-2.6M16.4 10.4l4.2-2.6v8.4l-4.2-2.6" />
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M12 7.8c2.6 0 4.6 1.9 4.6 4.2s-2 4.2-4.6 4.2-4.6-1.9-4.6-4.2 2-4.2 4.6-4.2z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 7.8c2.6 0 4.6 1.9 4.6 4.2s-2 4.2-4.6 4.2-4.6-1.9-4.6-4.2 2-4.2 4.6-4.2z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M10.8 8.1 9.6 15.7M14.2 8.1 13 15.7" />
        </svg>
      )
    }
    if (tab === 'report') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <rect style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} x="6" y="3.6" width="12" height="3" rx="1.2" />
          <rect style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} x="6" y="3.6" width="12" height="3" rx="1.2" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M7 6.6h10v11.6a2.8 2.8 0 0 1-2.8 2.8H9.8A2.8 2.8 0 0 1 7 18.2z" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="9.8" cy="18" r="1.45" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="13" cy="18.2" r="1.45" />
          <circle style={{ fill: 'var(--ia, currentColor)' }} cx="11.4" cy="15.3" r="1.45" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="14.6" cy="15" r="1.3" />
        </svg>
      )
    }
    if (tab === 'child') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M10 5.4h4a5.6 5.6 0 0 1 5.6 5.6v3.4a5.6 5.6 0 0 1-5.6 5.6h-4a5.6 5.6 0 0 1-5.6-5.6V11A5.6 5.6 0 0 1 10 5.4z" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M10 5.4h4a5.6 5.6 0 0 1 5.6 5.6v3.4a5.6 5.6 0 0 1-5.6 5.6h-4a5.6 5.6 0 0 1-5.6-5.6V11A5.6 5.6 0 0 1 10 5.4z" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="9.6" cy="11.8" r="1.05" />
          <circle style={{ fill: 'var(--ip, currentColor)' }} cx="14.4" cy="11.8" r="1.05" />
          <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M10.4 14.6q1.6 1.4 3.2 0" />
          <circle style={{ fill: 'var(--ic, #FF8FB8)', opacity: 0.75 }} cx="7.8" cy="14.2" r="1.3" />
          <circle style={{ fill: 'var(--ic, #FF8FB8)', opacity: 0.75 }} cx="16.2" cy="14.2" r="1.3" />
        </svg>
      )
    }
  }

  // H · BEAR (Bạn Gấu) — Mặc định
  if (tab === 'home') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M6.6 9.4h10.8l.8 8A3.4 3.4 0 0 1 14.8 21H9.2a3.4 3.4 0 0 1-3.4-3.6z" />
        <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M6.6 9.4h10.8l.8 8A3.4 3.4 0 0 1 14.8 21H9.2a3.4 3.4 0 0 1-3.4-3.6z" />
        <rect style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} x="5.8" y="6.6" width="12.4" height="2.8" rx="1.2" />
        <path style={{ fill: 'var(--ip, currentColor)' }} d="M8.6 9.4v2.6a1.1 1.1 0 0 0 2.2 0V9.4z" />
        <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M14 3.4l2.4 3.2" />
      </svg>
    )
  }
  if (tab === 'game') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M12 3.8a8.2 8.2 0 1 1 0 16.4 8.2 8.2 0 0 1 0-16.4z" />
        <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 3.8a8.2 8.2 0 1 1 0 16.4 8.2 8.2 0 0 1 0-16.4z" />
        <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 3.8c-3.2 3-3.2 13.4 0 16.4M4.4 9.6c4.2 1.6 11 1.6 15.2 0" />
        <path style={{ fill: 'var(--ia, currentColor)' }} d="M7.6 6.4a8.2 8.2 0 0 1 3-2.2c-1 1.2-1.6 2.6-1.9 4z" />
      </svg>
    )
  }
  if (tab === 'report') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M8.2 4.4h7.6l2 3.4H6.2zM5.6 7.8h12.8l1 4H4.6zM4.6 11.8h14.8l-1 4H5.6zM6.2 15.8h11.6l-2 3.8H8.2z" />
        <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M8.2 4.4h7.6l2 3.4H6.2zM5.6 7.8h12.8l1 4H4.6zM4.6 11.8h14.8l-1 4H5.6zM6.2 15.8h11.6l-2 3.8H8.2z" />
        <circle style={{ fill: 'var(--ip, currentColor)' }} cx="12" cy="17.6" r="1.2" />
        <path style={{ fill: 'var(--ia, currentColor)' }} d="M19.2 3.2c.9-.6 2 .1 1.8 1.1-.6-.2-1.3-.4-1.8-1.1z" />
      </svg>
    )
  }
  // tab === 'child'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} cx="6.8" cy="7" r="2.6" />
      <circle style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="6.8" cy="7" r="2.6" />
      <circle style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} cx="17.2" cy="7" r="2.6" />
      <circle style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="17.2" cy="7" r="2.6" />
      <path style={{ fill: 'var(--if, currentColor)', opacity: 'var(--io, 0.14)' }} d="M12 5.8a7 7 0 1 1 0 14 7 7 0 0 1 0-14z" />
      <path style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} d="M12 5.8a7 7 0 1 1 0 14 7 7 0 0 1 0-14z" />
      <ellipse style={{ fill: 'none', stroke: 'var(--is, currentColor)', strokeWidth: 'var(--iw, 1.8)', strokeLinecap: 'round', strokeLinejoin: 'round' }} cx="12" cy="15.6" rx="2.9" ry="2.2" />
      <circle style={{ fill: 'var(--ip, currentColor)' }} cx="9.5" cy="11.6" r="1" />
      <circle style={{ fill: 'var(--ip, currentColor)' }} cx="14.5" cy="11.6" r="1" />
      <ellipse style={{ fill: 'var(--ip, currentColor)' }} cx="12" cy="14.8" rx="1.2" ry="0.85" />
    </svg>
  )
}
