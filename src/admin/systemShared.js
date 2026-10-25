/**
 * Hàm dùng chung cho nhóm trang Hệ thống của admin (Đợt 15 · Chặng 3)
 */
import { adminFetch } from '../adminApi'

/** Gọi API quản trị, trả { ok, status, data } — không ném lỗi */
export async function adminJson(path, { method = 'GET', body } = {}) {
  try {
    const res = await adminFetch(path, { method, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) })
    let data = null
    try {
      data = await res.json()
    } catch (e) {}
    return { ok: res.ok && data?.ok !== false, status: res.status, data }
  } catch (e) {
    return { ok: false, status: 0, data: null }
  }
}

export function errMessage(r, fallback = 'Không kết nối được máy chủ') {
  const e = r?.data?.error
  if (e && typeof e === 'object' && e.message) return e.message
  if (typeof e === 'string') return e
  if (r?.status === 403) return 'Tài khoản của bạn không có quyền thao tác này'
  if (r?.status === 404) return 'Máy chủ chưa có chức năng này'
  return fallback
}

/** D1 lưu "YYYY-MM-DD HH:MM:SS" theo giờ UTC */
export function parseServerTime(v) {
  if (!v) return null
  if (v instanceof Date) return v
  if (typeof v === 'number') return new Date(v)
  const s = String(v)
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(s) ? s.replace(' ', 'T') + 'Z' : s
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

export function fmtDateTime(v) {
  const d = parseServerTime(v)
  if (!d) return '·'
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** "09:02" nếu hôm nay, "Hôm qua", hoặc "24/10" */
export function fmtShortWhen(v) {
  const d = parseServerTime(v)
  if (!d) return '·'
  const now = new Date()
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  if (sameDay(d, now)) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  const y = new Date(now)
  y.setDate(now.getDate() - 1)
  if (sameDay(d, y)) return 'Hôm qua'
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export function fmtNumber(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '·'
  return Number(n).toLocaleString('vi-VN')
}

export function fmtBytes(b) {
  if (b === null || b === undefined) return '·'
  const n = Number(b)
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} MB`
  return `${(n / 1024 / 1024 / 1024).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} GB`
}

export const ROLE_LABELS = {
  superadmin: 'Toàn quyền',
  admin: 'Quản trị',
  editor: 'Soạn nội dung',
  support: 'Hỗ trợ',
}

/** Xuất CSV ngay trên trình duyệt (có BOM để Excel đọc đúng tiếng Việt) */
export function downloadCsv(filename, columns, rows) {
  const esc = (v) => {
    if (v === null || v === undefined) return ''
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [columns.map((c) => esc(c.title)).join(',')]
  for (const r of rows) lines.push(columns.map((c) => esc(typeof c.get === 'function' ? c.get(r) : r[c.key])).join(','))
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Thanh hạn mức: trả null nếu không có số để giao diện ẩn thanh */
export function quotaPct(used, limit) {
  if (used === null || used === undefined || !limit) return null
  return Math.max(0, Math.min(100, (Number(used) / Number(limit)) * 100))
}
