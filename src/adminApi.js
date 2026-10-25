import { GATEWAY } from './api'

/**
 * Phiên quản trị (Đợt 15 · Chặng 2)
 * - Token phiên lưu ở khoá mới `kem-con-hoc:admin-token`, do máy chủ cấp khi đăng nhập.
 * - Không còn khoá bí mật nào nằm trong mã app. Hết phiên (401) thì báo cho khung admin
 *   qua sự kiện `kch-admin-unauthorized`; phiên bị khoá (423) thì báo `kch-admin-locked`.
 */
export const ADMIN_TOKEN_KEY = 'kem-con-hoc:admin-token'
export const ADMIN_UNAUTHORIZED_EVENT = 'kch-admin-unauthorized'
export const ADMIN_LOCKED_EVENT = 'kch-admin-locked'

export function readAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || ''
  } catch (e) {
    return ''
  }
}

export function saveAdminToken(token) {
  try {
    if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token)
    else localStorage.removeItem(ADMIN_TOKEN_KEY)
  } catch (e) {}
}

export function clearAdminToken() {
  saveAdminToken('')
}

function toUrl(endpointOrUrl) {
  return endpointOrUrl.startsWith('http')
    ? endpointOrUrl
    : `${GATEWAY}${endpointOrUrl.startsWith('/') ? '' : '/'}${endpointOrUrl}`
}

/**
 * Gọi API quản trị: tự gắn token phiên, không thử lại bằng khoá khác.
 * 401 → phát sự kiện hết phiên, 423 → phát sự kiện khoá màn hình.
 */
export async function adminFetch(endpointOrUrl, options = {}) {
  const url = toUrl(endpointOrUrl)
  const token = readAdminToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`
  else delete headers.Authorization

  let res
  try {
    res = await fetch(url, { ...options, headers })
  } catch (err) {
    console.error('adminFetch network error:', err)
    throw err
  }

  if (typeof window !== 'undefined') {
    if (res.status === 401) window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT))
    else if (res.status === 423) window.dispatchEvent(new Event(ADMIN_LOCKED_EVENT))
  }
  return res
}
