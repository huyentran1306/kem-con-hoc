/* Gói 36: thời hạn link xem do người dùng tự nhập, số nguyên 1–30 ngày */
export const LINK_DAYS_MIN = 1
export const LINK_DAYS_MAX = 30
export function checkLinkDays(raw) {
  const v = String(raw ?? '').trim()
  if (v === '') return { ok: false, msg: 'Vui lòng nhập số ngày' }
  const n = Number(v)
  if (!Number.isFinite(n)) return { ok: false, msg: 'Chỉ nhập số' }
  if (!Number.isInteger(n)) return { ok: false, msg: 'Chỉ nhập số nguyên' }
  if (n > LINK_DAYS_MAX) return { ok: false, msg: `Tối đa ${LINK_DAYS_MAX} ngày` }
  if (n < LINK_DAYS_MIN) return { ok: false, msg: `Tối thiểu ${LINK_DAYS_MIN} ngày` }
  return { ok: true, n, msg: `Từ ${LINK_DAYS_MIN} đến ${LINK_DAYS_MAX} ngày` }
}

