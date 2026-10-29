/**
 * lazyReload.js — Gói 35: sửa lỗi "Có lỗi nhỏ khi mở cửa sổ này" sau mỗi lần deploy.
 *
 * Nguyên nhân: tab đang mở vẫn chạy bản index cũ. Khi mở một cửa sổ tải muộn (Thành viên gia đình, Lớp học…),
 * trình duyệt xin file chunk cũ (vd FamilyMembersSheet-z9dHfD2C.js). Bản deploy mới đã xoá file đó, Cloudflare Pages
 * trả về index.html (text/html) nên import() hỏng → ErrorBoundary. Bấm "Thử lại" cũng không khỏi vì React giữ lỗi cũ.
 *
 * Cách sửa: gặp lỗi tải chunk thì tự tải lại trang MỘT lần (có chặn lặp 30 giây) để lấy bản mới.
 */
import { lazy } from 'react'

const KEY = 'kem-con-hoc:chunk-reload-at'

export function isChunkLoadError(err) {
  const msg = String((err && (err.message || err)) || '')
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk [\w-]+ failed|Unable to preload CSS|is not a valid JavaScript MIME type|Expected a JavaScript-or-Wasm module script/i.test(msg)
}

/** Tải lại trang để lấy bản mới; trả false nếu vừa tải lại trong 30 giây (tránh vòng lặp) */
export function reloadForNewVersion() {
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0)
    if (Date.now() - last < 30000) return false
    sessionStorage.setItem(KEY, String(Date.now()))
  } catch (_) {
    // không có sessionStorage: vẫn tải lại một lần
  }
  window.location.reload()
  return true
}

/** Như React.lazy, nhưng lỗi tải chunk cũ thì tự tải lại trang lấy bản mới */
export function lazyWithReload(factory) {
  return lazy(() =>
    factory().catch((err) => {
      if (isChunkLoadError(err) && typeof window !== 'undefined' && reloadForNewVersion()) {
        return new Promise(() => {}) // giữ màn "Đang tải..." trong lúc trang tải lại
      }
      throw err
    })
  )
}

/** Vite báo lỗi preload (chunk/CSS cũ) qua sự kiện này: tải lại trang thay vì để vỡ */
export function installPreloadErrorReload() {
  if (typeof window === 'undefined') return
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForNewVersion()) event.preventDefault()
  })
}
