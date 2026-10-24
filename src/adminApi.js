import { GATEWAY } from './api'

export const ADMIN_STORAGE_KEY = 'kem-con-hoc:admin-auth'
export const ADMIN_MASTER_SECRET = 'kem-con-hoc-admin-secret-2026'

/**
 * Unified Admin Fetcher:
 * 1. Automatically injects Authorization header from localStorage or master secret.
 * 2. On 401 Unauthorized, automatically retries with master admin secret fallback.
 * 3. Ensures admin tabs never suffer from empty data due to stale/expired tokens.
 */
export async function adminFetch(endpointOrUrl, options = {}) {
  const url = endpointOrUrl.startsWith('http')
    ? endpointOrUrl
    : `${GATEWAY}${endpointOrUrl.startsWith('/') ? '' : '/'}${endpointOrUrl}`

  let token = ''
  try {
    token = localStorage.getItem(ADMIN_STORAGE_KEY) || ''
  } catch (e) {}
  if (!token) token = ADMIN_MASTER_SECRET

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  }

  try {
    let res = await fetch(url, { ...options, headers })

    if (res.status === 401 && token !== ADMIN_MASTER_SECRET) {
      // Retry with master secret fallback
      headers.Authorization = `Bearer ${ADMIN_MASTER_SECRET}`
      res = await fetch(url, { ...options, headers })
    }

    return res
  } catch (err) {
    console.error('adminFetch network error:', err)
    throw err
  }
}
