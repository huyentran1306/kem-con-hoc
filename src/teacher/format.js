/**
 * Đợt 15 · Chặng 5: hàm định dạng dùng chung cho cổng giáo viên và trang vào lớp.
 * Một chỗ duy nhất quyết định cách viết tên lớp và tên cô, để không bao giờ ra
 * "Lớp Lớp 3A" hay "Cô Cô Lan".
 * Cập nhật Prompt 23H (A1, A2): sửa regex tránh lặp "Cô cô", thêm normalizeLesson.
 */

const CLASS_PREFIX = /^\s*((lớp|lop)\s+)+/i
const TEACHER_PREFIX = /^\s*((cô|co|thầy|thay|giáo viên|gv)\.?(\s+|$))+/i

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
 *   formatTeacherName('cô')          → 'Cô chủ nhiệm'
 *   formatTeacherName('')            → 'Cô chủ nhiệm'
 *   formatTeacherName('Lan', { lower: true }) → 'cô Lan' (giữa câu)
 */
export function formatTeacherName(name, opts = {}) {
  const lower = Boolean(opts.lower)
  const raw = String(name ?? '').trim().replace(/\s+/g, ' ')
  if (!raw) return lower ? 'cô chủ nhiệm' : 'Cô chủ nhiệm'
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

/**
 * Chuẩn hóa cấu trúc bài học dùng chung cho bài thường, bài cô giao và bài Dùng thử (Prompt 23H A2).
 * Đảm bảo mọi bậc luôn có câu hỏi hợp lệ (không rỗng), hints, guidanceForParent, answer.
 */
export function normalizeLesson(lessonData, meta = {}) {
  if (!lessonData) return null
  const base = typeof lessonData === 'object' ? lessonData : {}
  const rawSteps = Array.isArray(base.steps) ? base.steps : (Array.isArray(lessonData) ? lessonData : [])

  const normalizedSteps = (rawSteps.length > 0 ? rawSteps : [
    {
      stepNumber: 1,
      questionForChild: 'Con hãy đọc kỹ đề bài nhé!',
      guidanceForParent: meta.teacherMethodNote || 'Hỏi con đọc kỹ đề bài và xác định yêu cầu.',
      hintLevel1: 'Nhìn vào các con số trong đề.',
      hintLevel2: 'Thử giải từng bước một con nhé.'
    }
  ]).map((s, idx) => {
    const qText = String(s.question || s.questionForChild || s.q || s.cau_hoi || s.title || '').trim()
    const validQ = qText || `Bậc ${idx + 1}: Con hãy đọc kỹ đề nhé!`
    const hintsList = Array.isArray(s.hints) ? s.hints.filter(Boolean) : [s.hintLevel1, s.hintLevel2, s.hint, s.hint2].filter(Boolean)
    const hint1 = hintsList[0] || s.hintLevel1 || s.hint || 'Đọc kỹ lại đề bài một lần nữa con nhé.'
    const hint2 = hintsList[1] || s.hintLevel2 || s.hint2 || 'Tìm các số và dữ kiện quan trọng.'
    const parentNote = s.guidanceForParent || s.why || s.vi_sao_hoi || s.ly_do_cho_me || ''
    const answer = s.answer || s.expected_answer || s.expectedAnswer || s.dap_an_cho_me || s.answerForParent || ''
    const skill = s.ky_nang || s.skill || s.category || 'tinh_toan'

    return {
      ...s,
      stepNumber: s.stepNumber || idx + 1,
      question: validQ,
      questionForChild: validQ,
      q: validQ,
      hints: hintsList.length > 0 ? hintsList : [hint1, hint2],
      hintLevel1: hint1,
      hintLevel2: hint2,
      hint: hint1,
      hint2: hint2,
      guidanceForParent: parentNote,
      why: parentNote,
      ly_do_cho_me: parentNote,
      answer,
      answerForParent: answer,
      dap_an_cho_me: answer,
      ky_nang: skill
    }
  })

  return {
    ...base,
    ...meta,
    steps: normalizedSteps,
  }
}
