/**
 * GHI LỖI TỪ MÁY NGƯỜI DÙNG VỀ ADMIN (CHẶNG 5 · MỤC 5.2)
 * Bắt window.onerror, unhandledrejection, và ErrorBoundary.
 * Gửi POST /api/v1/client-errors:
 * - Thông điệp, 5 dòng stack đầu, route, bộ giao diện, build version, thời điểm
 * - TUYỆT ĐỐI không gửi nội dung đề bài, tên con, hay auth token
 * - Giới hạn tần suất trên client chống spam request
 */

import { GATEWAY } from './api'

const BUILD_VERSION = '1.0.0-dot13'
let lastSentHash = null
let lastSentTime = 0
let errorCountThisMinute = 0
let minuteResetTimer = null

export function reportClientError(error, extra = {}) {
  try {
    const now = Date.now()
    if (!minuteResetTimer) {
      minuteResetTimer = setTimeout(() => {
        errorCountThisMinute = 0
        minuteResetTimer = null
      }, 60000)
    }

    if (errorCountThisMinute >= 20) {
      return // Vượt giới hạn 20 lỗi / phút
    }

    const message = typeof error === 'string'
      ? error
      : (error?.message || error?.name || 'Unknown client error')

    const rawStack = error?.stack || extra?.componentStack || ''
    const stackLines = String(rawStack)
      .split('\n')
      .slice(0, 5)
      .join('\n')

    // Lấy route hiện tại và theme hiện tại
    const route = typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
    let theme = 'bear'
    try {
      theme = localStorage.getItem('kem-con-hoc:theme') || document.documentElement.dataset.theme || 'bear'
    } catch {}

    const fingerprint = `${message}::${stackLines.slice(0, 100)}`
    if (fingerprint === lastSentHash && now - lastSentTime < 15000) {
      return // Bỏ qua lỗi trùng gửi quá nhanh (< 15s)
    }

    lastSentHash = fingerprint
    lastSentTime = now
    errorCountThisMinute++

    const payload = {
      message: String(message).slice(0, 500),
      stack: stackLines,
      route,
      theme,
      buildVersion: BUILD_VERSION,
      timestamp: new Date().toISOString(),
    }

    // Gửi ẩn không chặn main thread
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      const ok = navigator.sendBeacon(`${GATEWAY}/api/v1/client-errors`, blob)
      if (ok) return
    }

    fetch(`${GATEWAY}/api/v1/client-errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  } catch (err) {
    // Không bao giờ để lỗi logger làm sập ứng dụng
  }
}

export function initClientErrorLogging() {
  if (typeof window === 'undefined') return

  window.__reportClientError = reportClientError

  window.addEventListener('error', (event) => {
    reportClientError(event.error || event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    reportClientError(event.reason || 'Unhandled Promise Rejection')
  })
}
