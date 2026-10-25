/**
 * Đợt 15 · Chặng 3 · Nhóm "Theo dõi": hàm dùng chung cho 5 trang
 * (Tổng quan, Gia đình & học sinh, Buổi học & AI, Báo cáo & NPS, Giáo viên & lớp).
 * Không bịa số: thiếu dữ liệu thì trả null để KpiCard hiện "·".
 */
import { adminFetch } from '../adminApi'

/** Gọi API admin, trả { ok, status, data } và không ném lỗi. */
export async function getJson(path) {
  try {
    const res = await adminFetch(path)
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok && data && data.ok !== false, status: res.status, data: data || {} }
  } catch (e) {
    return { ok: false, status: 0, data: {} }
  }
}

/** D1 lưu 2 kiểu: ISO có Z, hoặc "YYYY-MM-DD HH:MM:SS" (UTC). */
export function parseDbTime(v) {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return new Date(v)
  let s = String(v).trim()
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) s = s.replace(' ', 'T')
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(s)) s += 'Z'
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

const TZ = 'Asia/Ho_Chi_Minh'
export function fmtDateTime(v) {
  const d = parseDbTime(v)
  return d ? d.toLocaleString('vi-VN', { timeZone: TZ, hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '·'
}
export function fmtDate(v) {
  const d = parseDbTime(v)
  return d ? d.toLocaleDateString('vi-VN', { timeZone: TZ }) : '·'
}
export function fmtTime(v) {
  const d = parseDbTime(v)
  return d ? d.toLocaleTimeString('vi-VN', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '·'
}
/** "3 ngày trước", "Hôm nay"… */
export function fmtAgo(v) {
  const d = parseDbTime(v)
  if (!d) return '·'
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (days <= 0) return 'Hôm nay'
  if (days === 1) return 'Hôm qua'
  if (days < 30) return `${days} ngày trước`
  return fmtDate(v)
}

export function fmtNum(v, digits = 0) {
  if (v === null || v === undefined || v === '' || Number.isNaN(Number(v))) return null
  return Number(v).toLocaleString('vi-VN', { maximumFractionDigits: digits, minimumFractionDigits: 0 })
}

/** Số nguyên lớp → "Lớp 3"; chuỗi có sẵn "Lớp" giữ nguyên; thiếu → null. */
export function gradeLabel(g) {
  if (g === null || g === undefined || g === '') return null
  const s = String(g).trim()
  return /^lớp/i.test(s) ? s : `Lớp ${s}`
}

export function minutesLabel(sec) {
  if (sec === null || sec === undefined || Number.isNaN(Number(sec))) return '·'
  const m = Math.round(Number(sec) / 60)
  return m < 1 ? 'Dưới 1 phút' : `${m} phút`
}

export function isSelfDone(s) {
  return ['self', 'tu_lam', 'done'].includes(s?.teach_back_rating) || ['self', 'tu_lam'].includes(s?.quick_rating)
}

/** Trạng thái tự đánh giá: chưa đánh giá thì không gán "cần hướng dẫn". */
export function ratingInfo(s) {
  if (isSelfDone(s)) return { status: 'ok', label: 'Tự làm được' }
  if (s?.teach_back_rating || s?.quick_rating) return { status: 'warn', label: 'Có người hỗ trợ' }
  return { status: 'info', label: 'Chưa đánh giá' }
}

/** Kết quả bộ kiểm định lộ đáp án từ validator_json hoặc validator_status. */
export function validatorInfo(s) {
  let st = s?.validator_status || null
  if (!st && s?.validator_json) {
    try {
      st = JSON.parse(s.validator_json)?.status || null
    } catch (e) {}
  }
  if (st === 'Lọt') return { status: 'bad', label: 'Bị lọt đáp án', key: 'lot' }
  if (st === 'Đã chặn') return { status: 'warn', label: 'Đã chặn', key: 'da_chan' }
  if (st === 'Cảnh báo') return { status: 'warn', label: 'Cảnh báo', key: 'canh_bao' }
  if (st) return { status: 'ok', label: 'Đạt', key: 'dat' }
  return { status: 'info', label: 'Chưa kiểm định', key: null }
}

/** Đọc ?q= trên URL (cả kiểu hash router #/families?q=...). */
export function readUrlQuery(name = 'q') {
  try {
    const sp = new URLSearchParams(window.location.search)
    if (sp.get(name)) return sp.get(name)
    const h = window.location.hash || ''
    const i = h.indexOf('?')
    if (i >= 0) return new URLSearchParams(h.slice(i + 1)).get(name) || ''
  } catch (e) {}
  return ''
}
