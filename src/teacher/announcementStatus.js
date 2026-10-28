/**
 * src/teacher/announcementStatus.js — Prompt 29A: hạn hiển thị và trạng thái thông báo của cô.
 * Dùng chung cho cổng cô (nhãn trạng thái, lọc) và app phụ huynh (chỉ hiện thông báo còn hạn).
 * Máy chủ là nơi lọc chính; app vẫn lọc lại để an toàn khi Worker chưa cập nhật.
 */

export const DEFAULT_EXPIRY_DAYS = 7
const DAY = 86400000

/** Đọc ngày giờ từ chuỗi D1 ("2026-10-25 08:00:00") hoặc ISO */
export function parseTime(v) {
  if (!v) return null
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v
  const s = String(v)
  const d = new Date(s.includes('T') || s.endsWith('Z') ? s : s.replace(' ', 'T') + 'Z')
  return Number.isNaN(d.getTime()) ? null : d
}

/** Cuối ngày (23:59:59.999 giờ máy) của một mốc thời gian */
export function endOfDay(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

/** Các lựa chọn "Hiện trên app phụ huynh tới" */
export const EXPIRY_PRESETS = [
  { id: 'today', label: 'Hết hôm nay' },
  { id: 'tomorrow', label: 'Ngày mai' },
  { id: '3d', label: '3 ngày' },
  { id: '1w', label: '1 tuần' },
  { id: 'custom', label: 'Chọn ngày' },
  { id: 'never', label: 'Không hết hạn', pinnedOnly: true },
]
export const DEFAULT_EXPIRY_PRESET = '1w'

/** Tính expires_at (ISO) từ lựa chọn; 'never' → null. customDate dạng "YYYY-MM-DD". */
export function expiryFromPreset(presetId, { now = new Date(), customDate = '' } = {}) {
  const base = new Date(now)
  switch (presetId) {
    case 'today':
      return endOfDay(base).toISOString()
    case 'tomorrow':
      return endOfDay(new Date(base.getTime() + DAY)).toISOString()
    case '3d':
      return endOfDay(new Date(base.getTime() + 2 * DAY)).toISOString()
    case '1w':
      return endOfDay(new Date(base.getTime() + 6 * DAY)).toISOString()
    case 'custom': {
      if (!customDate) return endOfDay(new Date(base.getTime() + 6 * DAY)).toISOString()
      const [y, m, d] = customDate.split('-').map(Number)
      return endOfDay(new Date(y, (m || 1) - 1, d || 1)).toISOString()
    }
    case 'never':
      return null
    default:
      return endOfDay(new Date(base.getTime() + 6 * DAY)).toISOString()
  }
}

/** Đoán lựa chọn đang áp dụng từ expires_at (để mở form Sửa) */
export function presetFromExpiry(expiresAt, createdAt) {
  if (!expiresAt) return { preset: 'never', customDate: '' }
  const e = parseTime(expiresAt)
  if (!e) return { preset: DEFAULT_EXPIRY_PRESET, customDate: '' }
  const pad = (n) => String(n).padStart(2, '0')
  return { preset: 'custom', customDate: `${e.getFullYear()}-${pad(e.getMonth() + 1)}-${pad(e.getDate())}`, createdAt }
}

/** Chữ chỉ ngày trong nội dung → gợi ý dùng Nhắc việc */
const DATE_WORDS = /(^|[^\p{L}])(ngày mai|mai|ngày kia|thứ\s*(2|3|4|5|6|7|hai|ba|tư|năm|sáu|bảy)|chủ nhật|tuần sau|tuần tới|sáng mai|chiều mai|tối nay|hôm nay)(?=$|[^\p{L}])/iu
export function hasDateWords(text = '') {
  return DATE_WORDS.test(String(text || ''))
}

/**
 * Hạn hiệu lực thật của một thông báo:
 * - Có expires_at → dùng.
 * - Đang ghim, chưa có hạn → không hết hạn (tới khi cô gỡ ghim).
 * - Thông báo cũ chưa có hạn → hết hạn sau 7 ngày kể từ ngày gửi.
 */
export function effectiveExpiry(an) {
  const pinned = Number(an?.pinned) === 1 || an?.pinned === true
  const exp = parseTime(an?.expires_at ?? an?.expiresAt)
  if (exp) return exp
  if (pinned) return null
  const created = parseTime(an?.created_at ?? an?.createdAt)
  if (!created) return null
  return endOfDay(new Date(created.getTime() + DEFAULT_EXPIRY_DAYS * DAY))
}

/** Lời nhắc có ngày (kind = reminder) hết hiệu lực sau trưa ngày áp dụng */
function reminderExpiry(an) {
  const rf = an?.remind_for ?? an?.remindFor
  if (!rf) return null
  const [y, m, d] = String(rf).slice(0, 10).split('-').map(Number)
  if (!y) return null
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0)
}

/** 'active' | 'expired' | 'hidden' | 'deleted' */
export function announcementStatus(an, now = new Date()) {
  if (an?.deleted_at || an?.deletedAt) return 'deleted'
  if (an?.hidden_at || an?.hiddenAt) return 'hidden'
  const exp = (an?.kind === 'reminder') ? reminderExpiry(an) : effectiveExpiry(an)
  if (exp && exp.getTime() < new Date(now).getTime()) return 'expired'
  return 'active'
}

export const STATUS_LABEL = {
  active: 'Đang hiện',
  expired: 'Hết hạn',
  hidden: 'Đã ẩn',
  deleted: 'Đã xoá',
}

/** Dòng mô tả hạn cho cổng cô: "Hiện tới 30/10" | "Hiện tới khi gỡ ghim" */
export function expiryLabel(an) {
  if (an?.kind === 'reminder') return ''
  const exp = effectiveExpiry(an)
  if (!exp) return 'Hiện tới khi cô gỡ ghim'
  const hasOwn = Boolean(an?.expires_at ?? an?.expiresAt)
  const txt = exp.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })
  return hasOwn ? `Hiện tới hết ${txt}` : `Hiện tới hết ${txt} (mặc định 7 ngày)`
}
