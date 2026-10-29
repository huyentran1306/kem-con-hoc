// Gói 33 · B4: môn của đề đang đọc. Thứ tự: môn mẹ đã bấm ở màn Gõ đề (S.flow.subject) → mon_doan của
// bước đọc ảnh → đoán từ chữ của đề. Chip dạng bài không được mang chữ "Toán…" khi môn không phải Toán.
import { guessProblemType } from './stepQuality.js'

export const SUBJECT_LABEL = { toan: 'Toán', tieng_viet: 'Tiếng Việt', tieng_anh: 'Tiếng Anh' }

/** 'Toán' | 'toan' | 'math' | 'Tiếng Việt' | 'tieng_viet' | 'vie' | 'eng' ... → 'toan' | 'tieng_viet' | 'tieng_anh' | null */
export function normalizeSubject(x) {
  const s = String(x || '').trim().toLowerCase()
  if (!s) return null
  if (['toan', 'toán', 'math'].includes(s)) return 'toan'
  if (['tieng_viet', 'tiếng việt', 'tieng viet', 'vie', 'vi', 'viet'].includes(s)) return 'tieng_viet'
  if (['tieng_anh', 'tiếng anh', 'tieng anh', 'eng', 'en', 'english'].includes(s)) return 'tieng_anh'
  return null
}

/** Đoán môn từ chữ của đề (dùng nhãn của guessProblemType, vốn nhận ra Tiếng Việt / Tiếng Anh). */
const VIE_RE = /(từ chỉ|tìm từ|vần|dấu thanh|nối từ|viết lại câu|câu kể|kiểu câu|dấu câu|tả (con|cái|cây|người|đồ)|kể lại|viết đoạn|từ cùng nghĩa|trái nghĩa)/i
const VIET_CHARS = /[ăâđêôơưàáảãạèéẻẽẹìíỉĩịòóỏõọùúủũụỳýỷỹỵ]/i

export function guessSubject(text) {
  const t = String(text || '')
  // Câu tiếng Anh thuần (không dấu tiếng Việt, ≥ 3 từ chữ cái, có từ tiếng Anh thường gặp)
  const words = t.match(/[a-z]+/gi) || []
  if (!VIET_CHARS.test(t) && words.length >= 3 && /\b(the|a|an|i|am|is|are|fill|blank|write|read|choose|circle|match|look)\b/i.test(t)) return 'tieng_anh'
  if (VIE_RE.test(t) && !/\d+\s*[+\-−×x:÷]\s*\d+/.test(t)) return 'tieng_viet'
  const g = guessProblemType(text)
  if (g === 'Tiếng Việt') return 'tieng_viet'
  if (g === 'Tiếng Anh') return 'tieng_anh'
  return 'toan'
}

export function resolveSubject({ chosen, ocrMon, text } = {}) {
  return normalizeSubject(chosen) || normalizeSubject(ocrMon) || guessSubject(text)
}

/** Nhãn dạng bài phải cùng môn: nhãn Toán ("Toán…", "Phép tính") cho đề Tiếng Việt/Anh bị thay bằng nhãn đúng môn. */
export function typeLabelForSubject(label, subject, text) {
  const l = String(label || '').trim()
  if (!subject || subject === 'toan') return l || 'Toán có lời văn'
  const mathish = !l || /^toán|phép tính|lời văn/i.test(l)
  if (!mathish) return l
  void text
  return subject === 'tieng_viet' ? 'Bài tập Tiếng Việt' : 'Bài tập Tiếng Anh'
}
