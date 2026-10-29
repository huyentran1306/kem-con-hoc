// Gói 33 · B3 + B5: kiểm dữ liệu bài trước khi vẽ, và nhãn tiếng Việt cho mã loại bậc.

export const SKILL_LABELS = {
  doc_hieu_de: 'Đọc hiểu đề',
  don_vi: 'Đổi đơn vị',
  chon_phep_tinh: 'Chọn phép tính',
  tinh_toan: 'Tính toán',
  viet_loi_giai: 'Lời giải',
  kiem_tra_lai: 'Kiểm tra lại',
  doc_hieu: 'Đọc hiểu',
  tu_vung: 'Từ vựng',
  chinh_ta: 'Chính tả',
  dat_cau: 'Đặt câu',
  tu_vung_en: 'Từ vựng Tiếng Anh',
  nghe: 'Nghe',
  ngu_phap: 'Ngữ pháp',
  phat_am: 'Phát âm',
  // B5: mã AI hay trả mà trước đây hiện thô
  ket_luan: 'Kết luận',
  tom_tat: 'Tóm tắt',
  tom_tat_de: 'Tóm tắt đề',
  tim_hieu_de: 'Tìm hiểu đề',
  phan_tich_de: 'Phân tích đề',
  doc_de: 'Đọc đề',
  quan_sat: 'Quan sát',
  so_sanh: 'So sánh',
  ve_hinh: 'Vẽ hình',
  ve_so_do: 'Vẽ sơ đồ',
  dem: 'Đếm',
  goi_mo: 'Gợi mở',
  lien_he_thuc_te: 'Liên hệ thực tế',
  trinh_bay: 'Trình bày',
  viet_cau: 'Viết câu',
  dien_tu: 'Điền từ',
  kiem_tra: 'Kiểm tra',
}

export const GENERIC_STEP_LABEL = 'Bậc gợi mở'

/** Nhãn hiển thị cho mã loại bậc. Mã lạ (dạng a_b) → "Bậc gợi mở"; không bao giờ trả chuỗi có dấu "_". */
export function skillLabel(code) {
  if (code === null || code === undefined) return ''
  const c = String(code).trim()
  if (!c) return ''
  if (SKILL_LABELS[c]) return SKILL_LABELS[c]
  const lower = c.toLowerCase()
  if (SKILL_LABELS[lower]) return SKILL_LABELS[lower]
  // Đã là nhãn người đọc được (có dấu cách hoặc chữ có dấu, không có "_") thì giữ nguyên
  if (!c.includes('_') && /[\sÀ-ỹ]/.test(c) && c.length <= 40) return c
  return GENERIC_STEP_LABEL
}

const qOf = (s) => String((s && (s.question || s.questionForChild || s.q || s.cau_hoi || s.title)) || '').trim()

/**
 * Lý do không vẽ được bài (null = vẽ được): 'missing' | 'no_steps' | 'step_no_question' | 'no_problem_text'.
 */
export function lessonIssue(problem) {
  if (!problem || typeof problem !== 'object' || Array.isArray(problem)) return 'missing'
  if (!Array.isArray(problem.steps) || problem.steps.length === 0) return 'no_steps'
  if (problem.steps.some((s) => !s || typeof s !== 'object' || !qOf(s))) return 'step_no_question'
  const text = problem.ocr || problem.problemText || problem.de_bai || problem.text || problem.title
  if (!String(text || '').trim()) return 'no_problem_text'
  return null
}
