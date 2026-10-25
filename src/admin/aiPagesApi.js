/**
 * Đợt 15 · Gọi API admin cho các trang AI & nội dung (worker: src/dot15_ai.js).
 * Chưa gắn endpoint hoặc lỗi mạng thì trả null, trang tự hiện "·" hay trạng thái trống.
 */
import { adminFetch } from '../adminApi'

async function getJson(path, options) {
  try {
    const r = await adminFetch(path, options)
    if (!r || !r.ok) return null
    return await r.json()
  } catch (e) {
    return null
  }
}

export const fetchRouterStats = (days = 30) => getJson(`/api/v1/admin/ai/router-stats?days=${days}`)

export const fetchPromptVersions = (promptId = '') =>
  getJson(`/api/v1/admin/ai/prompt-versions${promptId ? `?promptId=${encodeURIComponent(promptId)}` : ''}`)

export const fetchPromptVersion = (id) => getJson(`/api/v1/admin/ai/prompt-versions/${encodeURIComponent(id)}`)

export const postPromptVersion = ({ promptId, template, status = 'draft', note = '' }) =>
  getJson('/api/v1/admin/ai/prompt-versions', {
    method: 'POST',
    body: JSON.stringify({ promptId, template, status, note }),
  })

export const fetchScopeStats = (days = 30) => getJson(`/api/v1/admin/ai/scope-stats?days=${days}`)

/** "2026-10-24 09:02:11" (UTC của D1) hoặc ISO hoặc số ms → "24/10 · 09:02" */
export function fmtShortTime(v) {
  if (v === null || v === undefined || v === '') return '·'
  let d
  if (typeof v === 'number') d = new Date(v)
  else {
    const s = String(v)
    d = new Date(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s) ? s.replace(' ', 'T') + 'Z' : s)
  }
  if (Number.isNaN(d.getTime())) return '·'
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} · ${p(d.getHours())}:${p(d.getMinutes())}`
}
