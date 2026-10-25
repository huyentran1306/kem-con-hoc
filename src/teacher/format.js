/**
 * Đợt 15 · Chặng 5: hàm định dạng dùng chung cho cổng giáo viên và trang vào lớp.
 * Một chỗ duy nhất quyết định cách viết tên lớp và tên cô, để không bao giờ ra
 * "Lớp Lớp 3A" hay "Cô Cô Lan".
 */

const CLASS_PREFIX = /^\s*((lớp|lop)\s+)+/i
const TEACHER_PREFIX = /^\s*((cô|co|thầy|thay|giáo viên|gv)\.?\s+)+/i

/** '3A' → 'Lớp 3A'; 'Lớp 3A' → 'Lớp 3A'; 'lớp lớp 3A' → 'Lớp 3A'; trống → '' */
export function formatClassName(name) {
  const s = String(name ?? '').trim()
  if (!s) return ''
  const rest = s.replace(CLASS_PREFIX, '').trim()
  return rest ? `Lớp ${rest}` : 'Lớp'
}

/** Phần tên lớp không có chữ "Lớp" (dùng khi câu đã có chữ "lớp" phía trước). */
export function bareClassName(name) {
  return String(name ?? '').trim().replace(CLASS_PREFIX, '').trim()
}

/**
 * Tên hiển thị của cô, không lặp danh xưng.
 *   formatTeacherName('Lan')        → 'Cô Lan'
 *   formatTeacherName('Cô Lan')     → 'Cô Lan'
 *   formatTeacherName('cô cô Lan')  → 'Cô Lan'
 *   formatTeacherName('Thầy An')     → 'Thầy An'
 *   formatTeacherName('', )          → 'Cô chủ nhiệm'
 *   formatTeacherName('Lan', { lower: true }) → 'cô Lan' (giữa câu)
 */
export function formatTeacherName(name, opts = {}) {
  const lower = Boolean(opts.lower)
  const raw = String(name ?? '').trim().replace(/\s+/g, ' ')
  const m = raw.match(TEACHER_PREFIX)
  let title = 'cô'
  if (m) {
    const first = m[0].trim().split(/\s+/)[0].toLowerCase().replace('.', '')
    if (first === 'thầy' || first === 'thay') title = 'thầy'
  }
  const rest = raw.replace(TEACHER_PREFIX, '').trim()
  const t = lower ? title : title.charAt(0).toUpperCase() + title.slice(1)
  return rest ? `${t} ${rest}` : `${t} chủ nhiệm`
}

/** Chữ cái đầu của tên (bỏ danh xưng) cho ô ảnh đại diện. */
export function teacherInitial(name) {
  const rest = String(name ?? '').trim().replace(TEACHER_PREFIX, '').trim()
  const parts = rest.split(/\s+/).filter(Boolean)
  const last = parts.length ? parts[parts.length - 1] : ''
  return (last.charAt(0) || 'C').toUpperCase()
}

/** Tên học sinh trong danh sách lớp (máy chủ có chỗ trả rosterName, có chỗ roster_name). */
export function rosterNameOf(s) {
  if (!s) return ''
  return String(s.rosterName || s.roster_name || s.name || '').trim()
}
