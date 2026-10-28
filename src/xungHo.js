/**
 * src/xungHo.js — Prompt 29B: xưng hô theo NGƯỜI ĐANG CẦM MÁY (người đang đăng nhập).
 *
 * - Thành viên được mời (bố, ông bà…) đăng nhập bằng tài khoản riêng: lấy `session.member.relation`.
 * - Chủ gia đình: lấy vai trò đã chọn ở màn khai báo lần đầu (`S.parent`: 'Mẹ' | 'Bố' | 'Ông/Bà').
 * - Không rõ: trả "bố mẹ" (nói chung cả nhà) để không gọi nhầm "mẹ".
 *
 * Giữ nguyên chữ "mẹ" trong ĐỀ BÀI và trong nhãn thống kê theo người ("Mẹ 0 ca · Bố 1 ca").
 */

const ROLE_MAP = {
  'mẹ': 'mẹ',
  'me': 'mẹ',
  'má': 'mẹ',
  'bố': 'bố',
  'bo': 'bố',
  'ba': 'bố',
  'cha': 'bố',
  'ông/bà': 'ông bà',
  'ông bà': 'ông bà',
  'ông': 'ông bà',
  'bà': 'ông bà',
}

/** Chuẩn hoá một nhãn vai trò bất kỳ về 'mẹ' | 'bố' | 'ông bà' | '' */
export function normalizeRole(raw) {
  const k = String(raw || '').trim().toLowerCase()
  return ROLE_MAP[k] || ''
}

/** Vai trò của người đang cầm máy: 'mẹ' | 'bố' | 'ông bà' | '' (chưa rõ) */
export function currentRole(S, session) {
  const member = session?.member
  if (member && member.role && member.role !== 'owner') {
    const r = normalizeRole(member.relation || member.relation_hint || member.relationHint)
    if (r) return r
  }
  return normalizeRole(S?.parent)
}

/**
 * xungHo(S, session) → "mẹ" | "bố" | "ông bà" (viết thường, dùng giữa câu)
 * xungHo(S, session, { cap: true }) → "Mẹ" | "Bố" | "Ông bà" (đầu câu)
 * Chưa rõ vai trò → "bố mẹ" / "Bố mẹ".
 */
export function xungHo(S, session, { cap = false } = {}) {
  const r = currentRole(S, session) || 'bố mẹ'
  return cap ? capFirst(r) : r
}

/** Viết hoa chữ cái đầu: "ông bà" → "Ông bà" */
export function capFirst(s) {
  const str = String(s || '')
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str
}

/** Cặp {ho, Ho} tiện dùng trong component */
export function xungHoPair(S, session) {
  const ho = xungHo(S, session)
  return { ho, Ho: capFirst(ho) }
}

/**
 * "Hai mẹ con" theo vai trò: "Hai mẹ con" | "Hai bố con" | "Ông bà cháu" | "Cả nhà"
 */
export function haiNguoi(ho, { cap = true } = {}) {
  const r = String(ho || '').toLowerCase()
  const s = r === 'mẹ' ? 'hai mẹ con' : r === 'bố' ? 'hai bố con' : r === 'ông bà' ? 'ông bà cháu' : 'cả nhà'
  return cap ? capFirst(s) : s
}

/**
 * Đổi chữ "mẹ" chỉ NGƯỜI ĐANG KÈM trong một câu soạn sẵn (lời gợi ý nói với con, mẹo kèm…)
 * sang đúng vai trò. Không dùng cho đề bài hay số liệu theo người.
 * Giữ nguyên "bố mẹ", "ba mẹ", "cha mẹ" và các chữ khác bắt đầu bằng "mẹ" như "mẹo".
 */
export function swapMe(text, ho) {
  const s = String(text ?? '')
  const r = String(ho || '').toLowerCase()
  if (!s || r === 'mẹ') return s
  const target = r || 'bố mẹ'
  const pairMinh = r === 'bố' ? 'bố con mình' : r === 'ông bà' ? 'ông bà cháu mình' : 'cả nhà mình'
  let out = s
    .replace(/(bố|ba|cha) mẹ/gi, (m) => m.replace(/mẹ/, '\u0000').replace(/Mẹ/, '\u0001'))
    .replace(/(^|[^\p{L}])([Hh])ai mẹ con(?![\p{L}])/gu, (m, p1, h) => p1 + (h === 'H' ? haiNguoi(r) : haiNguoi(r, { cap: false })))
    .replace(/(^|[^\p{L}])Mẹ con mình(?![\p{L}])/gu, (m, p1) => p1 + capFirst(pairMinh))
    .replace(/(^|[^\p{L}])mẹ con mình(?![\p{L}])/gu, (m, p1) => p1 + pairMinh)
    .replace(/(^|[^\p{L}])Mẹ(?![\p{L}])/gu, (m, p1) => p1 + capFirst(target))
    .replace(/(^|[^\p{L}])mẹ(?![\p{L}])/gu, (m, p1) => p1 + target)
  out = out.replace(/\u0000/g, 'mẹ').replace(/\u0001/g, 'Mẹ')
  return out
}

/* Vai trò đang dùng, để các hàm gọi AI (api.js, promptStudio.js) truyền đúng xưng hô vào prompt
   mà không phải truyền qua từng lời gọi. App.jsx cập nhật mỗi khi người cầm máy đổi. */
let currentHo = 'bố mẹ'
export function setCurrentXungHo(ho) {
  if (ho) currentHo = String(ho)
}
export function getCurrentXungHo() {
  return currentHo
}
