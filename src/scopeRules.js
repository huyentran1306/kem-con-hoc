/* ============================================================
   🛡️ SCOPE RULES & INPUT VALIDATION ENGINE
   Kiểm tra ảnh & đề ngoài phạm vi trước khi gọi AI soạn bài
   ============================================================ */

export const SCOPE_RULES_KV_KEY = 'app_config:scope_rules'

export const DEFAULT_SCOPE_RULES = {
  version: 1,
  enabled: true,
  subjects: ['toan', 'tieng_viet', 'tieng_anh'],
  grade_min: 1,
  grade_max: 5,
  grade_gap_warn: 1, // Lệch từ 2 lớp trở lên mới cảnh báo
  min_confidence_text_len: 12,
  blocked_keywords: [
    'làm hộ bài kiểm tra',
    'đáp án đề thi',
    'giải hộ bài thi',
    'hack điểm',
    'chép phạt',
  ],
  actions: {
    khong_phai_bai_tap: 'block',
    nhay_cam: 'block',
    anh_mo: 'retake',
    nhieu_bai: 'pick_one',
    ngoai_chuong_trinh: 'warn',
    lech_lop: 'warn',
    mon_chua_ho_tro: 'warn',
    lam_ho: 'redirect',
    khong_lien_quan: 'block',
  },
  messages: {
    khong_phai_bai_tap:
      'Ảnh này chưa giống trang bài tập. {xung_ho} chụp lại đúng 1 bài trong sách hoặc vở nhé.',
    nhay_cam:
      'Ảnh có mặt người hoặc giấy tờ riêng tư nên mình không đọc. {xung_ho} chụp riêng phần đề bài thôi nhé. App không lưu ảnh này.',
    anh_mo:
      'Ảnh hơi mờ hoặc thiếu sáng. {xung_ho} để máy song song trang giấy, đủ sáng rồi chụp lại nhé.',
    nhieu_bai:
      'Trong ảnh có {so_bai} bài. {xung_ho} chọn bài con đang làm nhé.',
    ngoai_chuong_trinh:
      'Bài này giống chương trình lớp {lop_doan}, ngoài phạm vi lớp 1 đến 5. Mình vẫn có thể gợi ý, nhưng có thể chưa sát cách cô dạy.',
    lech_lop:
      'Bài này có vẻ của lớp {lop_doan}, còn hồ sơ của {ten_con} là lớp {lop_con}. {xung_ho} kiểm tra lại giúp mình nhé.',
    mon_chua_ho_tro:
      'Môn này app chưa hỗ trợ tốt nhất. Gợi ý có thể chưa chuẩn.',
    lam_ho:
      'Kèm Con Học không làm bài hộ, nhưng sẽ gợi ý để {xung_ho} hướng dẫn con tự viết nhé.',
    khong_lien_quan:
      'Câu này không giống một bài tập. {xung_ho} gõ lại đề bài con đang làm nhé.',
  },
}

/* Thứ tự ưu tiên khi một đề thuộc nhiều loại */
export const SCOPE_PRIORITY = [
  'nhay_cam',
  'khong_phai_bai_tap',
  'anh_mo',
  'lam_ho',
  'khong_lien_quan',
  'nhieu_bai',
  'ngoai_chuong_trinh',
  'lech_lop',
  'mon_chua_ho_tro',
]

let activeScopeRules = null

export function getActiveScopeRules() {
  if (activeScopeRules) return activeScopeRules
  try {
    const raw = localStorage.getItem('kem-con-hoc:scope-rules')
    if (raw) {
      activeScopeRules = { ...DEFAULT_SCOPE_RULES, ...JSON.parse(raw) }
      return activeScopeRules
    }
  } catch (e) {}
  activeScopeRules = { ...DEFAULT_SCOPE_RULES }
  return activeScopeRules
}

export function setActiveScopeRules(rules) {
  activeScopeRules = { ...DEFAULT_SCOPE_RULES, ...rules }
  try {
    localStorage.setItem('kem-con-hoc:scope-rules', JSON.stringify(activeScopeRules))
  } catch (e) {}
  return activeScopeRules
}

/* Format template tin nhắn với biến */
export function formatScopeMessage(template, params = {}) {
  let msg = template || ''
  const vars = {
    so_bai: params.so_bai || 1,
    lop_doan: params.lop_doan || 'lớn hơn',
    lop_con: params.lop_con || 'hiện tại',
    ten_con: params.ten_con || 'bé',
    xung_ho: params.xung_ho || 'Mẹ',
  }
  Object.keys(vars).forEach((k) => {
    msg = msg.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k]))
  })
  return msg
}

/* Lấy số lớp từ chuỗi (vd "Lớp 3" -> 3) */
export function parseGradeNum(str) {
  if (!str) return null
  const m = String(str).match(/(\d+)/)
  return m ? parseInt(m[1], 10) : null
}

/* ============================================================
   1. ĐÁNH GIÁ PHẠM VI NHANH TỪ VĂN BẢN (KHÔNG GỌI AI HOẶC DÙNG HEURISTICS)
   ============================================================ */
export function evaluateTextScope(text, { childGrade, childName, parentRole, customRules } = {}) {
  const rules = customRules || getActiveScopeRules()
  if (!rules.enabled) {
    return { passed: true, category: 'bai_tap', action: 'allow' }
  }

  const raw = (text || '').trim()
  const lower = raw.toLowerCase()
  const xungHo = parentRole || 'Mẹ'
  const lopConNum = parseGradeNum(childGrade) || 3

  // 1. Kiểm tra từ khoá bị chặn
  for (const kw of rules.blocked_keywords || []) {
    if (lower.includes(kw.toLowerCase())) {
      return {
        passed: false,
        category: 'khong_lien_quan',
        action: rules.actions.khong_lien_quan || 'block',
        reason: `Chứa từ khoá bị chặn "${kw}"`,
        confidence: 1.0,
        message: formatScopeMessage(rules.messages.khong_lien_quan, { xung_ho: xungHo }),
      }
    }
  }

  // 2. Kiểm tra làm hộ / viết hộ bài văn
  const lamHoRegex = /(viết hộ|làm hộ|giải hộ|soạn hộ|làm bài hộ|viết bài hộ|tả giúp|giải đề hộ)/i
  if (lamHoRegex.test(lower)) {
    return {
      passed: true, // Cho qua nhưng redirect hướng dẫn
      category: 'lam_ho',
      action: rules.actions.lam_ho || 'redirect',
      reason: 'Phụ huynh muốn làm bài hộ',
      confidence: 0.95,
      redirectNote: 'Phụ huynh muốn làm hộ: chỉ gợi ý dàn ý và câu hỏi gợi mở, tuyệt đối không viết sẵn bài hoàn chỉnh.',
      message: formatScopeMessage(rules.messages.lam_ho, { xung_ho: xungHo }),
    }
  }

  // 3. Quá ngắn và không có số -> Không liên quan
  const hasDigit = /\d/.test(raw)
  if (raw.length < (rules.min_confidence_text_len || 12) && !hasDigit) {
    return {
      passed: false,
      category: 'khong_lien_quan',
      action: rules.actions.khong_lien_quan || 'block',
      reason: 'Câu quá ngắn, không có số liệu bài tập',
      confidence: 0.9,
      message: formatScopeMessage(rules.messages.khong_lien_quan, { xung_ho: xungHo }),
    }
  }

  // 4. Đoán lớp từ đề bài nếu có nhắc tới "lớp 6", "lớp 7",...
  const gradeMatch = lower.match(/lớp\s*(\d+)/i)
  if (gradeMatch) {
    const lopDoan = parseInt(gradeMatch[1], 10)
    if (lopDoan > (rules.grade_max || 5)) {
      return {
        passed: rules.actions.ngoai_chuong_trinh !== 'block',
        category: 'ngoai_chuong_trinh',
        action: rules.actions.ngoai_chuong_trinh || 'warn',
        reason: `Đề bài lớp ${lopDoan} ngoài phạm vi tiểu học`,
        confidence: 0.9,
        lop_doan: lopDoan,
        lop_con: lopConNum,
        message: formatScopeMessage(rules.messages.ngoai_chuong_trinh, {
          lop_doan: lopDoan,
          lop_con: lopConNum,
          ten_con: childName,
          xung_ho: xungHo,
        }),
      }
    }
    if (Math.abs(lopDoan - lopConNum) > (rules.grade_gap_warn || 1)) {
      return {
        passed: rules.actions.lech_lop !== 'block',
        category: 'lech_lop',
        action: rules.actions.lech_lop || 'warn',
        reason: `Lệch từ 2 lớp (đề lớp ${lopDoan}, con lớp ${lopConNum})`,
        confidence: 0.85,
        lop_doan: lopDoan,
        lop_con: lopConNum,
        message: formatScopeMessage(rules.messages.lech_lop, {
          lop_doan: lopDoan,
          lop_con: lopConNum,
          ten_con: childName,
          xung_ho: xungHo,
        }),
      }
    }
  }

  return { passed: true, category: 'bai_tap', action: 'allow', confidence: 0.85 }
}

/* ============================================================
   2. PARSE KẾT QUẢ TỪ VISION OCR V2 (HỖ TRỢ JSON & FALLBACK TEXT)
   ============================================================ */
export function parseOcrV2Result(rawResponse, { childGrade, childName, parentRole, customRules } = {}) {
  const rules = customRules || getActiveScopeRules()
  const xungHo = parentRole || 'Mẹ'
  const lopConNum = parseGradeNum(childGrade) || 3

  let parsed = null

  // Trích xuất JSON từ chuỗi trả về
  if (typeof rawResponse === 'object' && rawResponse !== null) {
    parsed = rawResponse
  } else if (typeof rawResponse === 'string') {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0])
      } catch (e) {
        parsed = null
      }
    }
  }

  // NẾU PARSE JSON THÀNH CÔNG: XỬ LÝ THEO BỘ QUY TẮC P1_OCR_V2
  if (parsed && typeof parsed === 'object' && parsed.pham_vi) {
    const cat = parsed.pham_vi
    const action = rules.actions[cat] || 'allow'
    const deBai = (parsed.de_bai || '').trim()
    const soBai = parsed.so_bai || (Array.isArray(parsed.cac_bai) ? parsed.cac_bai.length : 1)
    const lopDoan = parsed.lop_doan || null

    // 1. Nhạy cảm (Mặt người, giấy tờ,...)
    if (cat === 'nhay_cam') {
      return {
        passed: false,
        category: 'nhay_cam',
        action: 'block',
        reason: parsed.ly_do || 'Ảnh có mặt người hoặc thông tin riêng tư',
        confidence: parsed.do_tin_cay || 0.95,
        isSensitive: true,
        de_bai: '',
        message: formatScopeMessage(rules.messages.nhay_cam, { xung_ho: xungHo }),
      }
    }

    // 2. Không phải bài tập (đồ vật, đồ chơi, phong cảnh)
    if (cat === 'khong_phai_bai_tap') {
      const isToyCandidate = /đồ chơi|búp bê|lego|gấu|xe|robot/i.test(parsed.ly_do || '')
      return {
        passed: false,
        category: 'khong_phai_bai_tap',
        action: action,
        reason: parsed.ly_do || 'Ảnh chụp không phải trang bài tập',
        confidence: parsed.do_tin_cay || 0.9,
        isToyCandidate,
        de_bai: deBai,
        message: formatScopeMessage(rules.messages.khong_phai_bai_tap, { xung_ho: xungHo }),
      }
    }

    // 3. Ảnh mờ
    if (cat === 'anh_mo') {
      return {
        passed: false,
        category: 'anh_mo',
        action: 'retake',
        reason: parsed.ly_do || 'Ảnh chụp bị mờ hoặc thiếu sáng',
        confidence: parsed.do_tin_cay || 0.85,
        de_bai: deBai,
        message: formatScopeMessage(rules.messages.anh_mo, { xung_ho: xungHo }),
      }
    }

    // 3b. Làm bài hộ / viết văn hộ (lam_ho) - Ưu tiên trước nhieu_bai và lech_lop
    if (cat === 'lam_ho') {
      return {
        passed: true,
        category: 'lam_ho',
        action: action,
        reason: parsed.ly_do || 'Phụ huynh muốn làm bài hộ',
        confidence: parsed.do_tin_cay || 0.95,
        redirectNote: 'Phụ huynh muốn làm hộ: chỉ gợi ý dàn ý và câu hỏi, không viết sẵn bài',
        de_bai: deBai,
        message: formatScopeMessage(rules.messages.lam_ho, { xung_ho: xungHo }),
      }
    }

    // 3c. Không liên quan bài tập (khong_lien_quan)
    if (cat === 'khong_lien_quan') {
      return {
        passed: false,
        category: 'khong_lien_quan',
        action: action,
        reason: parsed.ly_do || 'Nội dung không liên quan bài tập',
        confidence: parsed.do_tin_cay || 0.9,
        de_bai: deBai,
        message: formatScopeMessage(rules.messages.khong_lien_quan, { xung_ho: xungHo }),
      }
    }

    // 4. Nhiều bài tập trong ảnh
    if (cat === 'nhieu_bai' || soBai > 1) {
      return {
        passed: true,
        category: 'nhieu_bai',
        action: 'pick_one',
        reason: `Có ${soBai} bài tập trong ảnh`,
        confidence: parsed.do_tin_cay || 0.85,
        so_bai: soBai,
        cac_bai: Array.isArray(parsed.cac_bai) && parsed.cac_bai.length > 0 ? parsed.cac_bai : [deBai],
        de_bai: deBai,
        message: formatScopeMessage(rules.messages.nhieu_bai, { so_bai: soBai, xung_ho: xungHo }),
      }
    }

    // 5. Kiểm tra lệch lớp hoặc ngoài chương trình
    if (lopDoan) {
      if (lopDoan > (rules.grade_max || 5)) {
        return {
          passed: rules.actions.ngoai_chuong_trinh !== 'block',
          category: 'ngoai_chuong_trinh',
          action: rules.actions.ngoai_chuong_trinh || 'warn',
          reason: `Bài lớp ${lopDoan} ngoài phạm vi lớp 1-5`,
          confidence: parsed.do_tin_cay || 0.8,
          lop_doan: lopDoan,
          lop_con: lopConNum,
          de_bai: deBai,
          message: formatScopeMessage(rules.messages.ngoai_chuong_trinh, {
            lop_doan: lopDoan,
            lop_con: lopConNum,
            ten_con: childName,
            xung_ho: xungHo,
          }),
        }
      }
      if (Math.abs(lopDoan - lopConNum) > (rules.grade_gap_warn || 1)) {
        return {
          passed: rules.actions.lech_lop !== 'block',
          category: 'lech_lop',
          action: rules.actions.lech_lop || 'warn',
          reason: `Đề lớp ${lopDoan} lệch so với bé lớp ${lopConNum}`,
          confidence: parsed.do_tin_cay || 0.8,
          lop_doan: lopDoan,
          lop_con: lopConNum,
          de_bai: deBai,
          message: formatScopeMessage(rules.messages.lech_lop, {
            lop_doan: lopDoan,
            lop_con: lopConNum,
            ten_con: childName,
            xung_ho: xungHo,
          }),
        }
      }
    }

    // Bài tập hợp lệ
    return {
      passed: true,
      category: 'bai_tap',
      action: 'allow',
      de_bai: deBai || String(rawResponse || '').trim(),
      mon_doan: parsed.mon_doan || 'toan',
      lop_doan: lopDoan,
      confidence: parsed.do_tin_cay || 0.9,
    }
  }

  // FALLBACK: KHI AI CHƯA TRẢ JSON HOẶC TRẢ VĂN BẢN THUẦN (KIỂU CŨ)
  const plainText = typeof rawResponse === 'string' ? rawResponse.trim() : JSON.stringify(rawResponse)
  const textScope = evaluateTextScope(plainText, { childGrade, childName, parentRole, customRules: rules })

  return {
    ...textScope,
    de_bai: plainText,
  }
}

/* ============================================================
   3. PHÂN LOẠI ĐỀ DẠNG CHỮ KẾT HỢP P0_SCOPE_TEXT (NẾU CẦN AI)
   ============================================================ */
export async function checkTextScopeWithAi(text, { childGrade, childName, parentRole, customRules, aiCallFn } = {}) {
  // 1. Chạy luật nhanh trước (không tốn AI)
  const quick = evaluateTextScope(text, { childGrade, childName, parentRole, customRules })
  if (!quick.passed || quick.category === 'lam_ho' || quick.category === 'ngoai_chuong_trinh' || quick.category === 'lech_lop') {
    return quick
  }

  // 2. Nếu có AI caller và câu văn bản cần xác minh sâu
  if (typeof aiCallFn === 'function' && text && text.trim().length >= 10) {
    try {
      const res = await aiCallFn(text.trim())
      if (res && res.pham_vi && res.pham_vi !== 'bai_tap') {
        const rules = customRules || getActiveScopeRules()
        const cat = res.pham_vi
        const action = rules.actions[cat] || 'warn'
        const xungHo = parentRole || 'Mẹ'
        return {
          passed: action !== 'block' && action !== 'retake',
          category: cat,
          action,
          reason: res.ly_do || 'Phân loại từ AI',
          confidence: res.do_tin_cay || 0.85,
          mon_doan: res.mon_doan,
          lop_doan: res.lop_doan,
          message: formatScopeMessage(rules.messages[cat] || rules.messages.khong_lien_quan, {
            xung_ho: xungHo,
            lop_doan: res.lop_doan,
            lop_con: parseGradeNum(childGrade) || 3,
            ten_con: childName || 'bé',
          }),
        }
      }
    } catch (e) {
      console.warn('p0_scope_text call timeout or error, allowing through:', e)
    }
  }

  return quick
}

/* ============================================================
   4. 6 BÀI TẬP / ẢNH MẪU PHỤC VỤ TEST BENCH (BÀN THỬ)
   ============================================================ */
export const SAMPLE_SCOPE_CASES = [
  {
    id: 'sample_toan_lop_3',
    name: '1. Trang toán lớp 3 (Hợp lệ)',
    category: 'bai_tap',
    expectedAction: 'allow',
    description: 'Trang sách Toán 3 rõ nét, bài toán có lời văn 2 bước',
    imagePath: '/scope-samples/math_grade_3.svg',
    rawText: 'Bài 1: Tính nhẩm: 4 × 6 = ...; 35 : 5 = ...\nBài 2: Một cửa hàng có 45 kg gạo, đã bán được 1/5 số gạo đó. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?',
    mockAiJson: {
      pham_vi: 'bai_tap',
      do_tin_cay: 0.98,
      ly_do: 'Trang sách bài tập Toán lớp 3 rõ nét',
      mon_doan: 'toan',
      lop_doan: 3,
      so_bai: 1,
      cac_bai: ['Một cửa hàng có 45 kg gạo, đã bán được 1/5 số gạo đó. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?'],
      de_bai: 'Một cửa hàng có 45 kg gạo, đã bán được 1/5 số gạo đó. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?',
    },
  },
  {
    id: 'sample_do_choi',
    name: '2. Ảnh đồ chơi (Không phải bài tập)',
    category: 'khong_phai_bai_tap',
    expectedAction: 'block',
    description: 'Ảnh chụp một chú robot đồ chơi bằng nhựa trên bàn, không có chữ',
    imagePath: '/scope-samples/toy_robot.svg',
    rawText: 'Ảnh chụp một robot đồ chơi bằng nhựa trên bàn học, không có chữ bài tập.',
    mockAiJson: {
      pham_vi: 'khong_phai_bai_tap',
      do_tin_cay: 0.96,
      ly_do: 'Ảnh chụp robot đồ chơi, không có chữ bài tập',
      mon_doan: 'khac',
      lop_doan: null,
      so_bai: 0,
      cac_bai: [],
      de_bai: '',
    },
  },
  {
    id: 'sample_anh_mo',
    name: '3. Ảnh mờ (Thiếu sáng / Rung tay)',
    category: 'anh_mo',
    expectedAction: 'retake',
    description: 'Ảnh bị mờ nhoè hoặc thiếu sáng, camera không đọc được chữ',
    imagePath: '/scope-samples/blurry_photo.svg',
    rawText: 'Ảnh chụp nghiêng và rung tay, chữ trong vở ô ly bị mờ nhoè không rõ.',
    mockAiJson: {
      pham_vi: 'anh_mo',
      do_tin_cay: 0.92,
      ly_do: 'Ảnh mờ và rung tay, chữ bị nhòe',
      mon_doan: 'toan',
      lop_doan: null,
      so_bai: 0,
      cac_bai: [],
      de_bai: '',
    },
  },
  {
    id: 'sample_nhieu_bai',
    name: '4. Ảnh 3 bài tập (Tách từng câu)',
    category: 'nhieu_bai',
    expectedAction: 'pick_one',
    description: 'Trang vở có 3 câu bài tập khác nhau để mẹ chọn 1 câu',
    imagePath: '/scope-samples/three_exercises.svg',
    rawText: 'Câu 1: Đặt tính rồi tính: 245 + 138.\nCâu 2: Tìm x biết: x - 45 = 120.\nCâu 3: Một hình chữ nhật có chiều dài 15 cm, chiều rộng 8 cm. Tính diện tích.',
    mockAiJson: {
      pham_vi: 'nhieu_bai',
      do_tin_cay: 0.95,
      ly_do: 'Có 3 bài tập khác nhau trong cùng một trang',
      mon_doan: 'toan',
      lop_doan: 3,
      so_bai: 3,
      cac_bai: [
        'Câu 1: Đặt tính rồi tính: 245 + 138.',
        'Câu 2: Tìm x biết: x - 45 = 120.',
        'Câu 3: Một hình chữ nhật có chiều dài 15 cm, chiều rộng 8 cm. Tính diện tích.',
      ],
      de_bai: 'Câu 1: Đặt tính rồi tính: 245 + 138.\nCâu 2: Tìm x biết: x - 45 = 120.\nCâu 3: Một hình chữ nhật có chiều dài 15 cm, chiều rộng 8 cm. Tính diện tích.',
    },
  },
  {
    id: 'sample_de_lop_8',
    name: '5. Đề lớp 8 (Ngoài phạm vi tiểu học)',
    category: 'ngoai_chuong_trinh',
    expectedAction: 'warn',
    description: 'Phương trình bậc hai toán lớp 8 ngoài phạm vi lớp 1-5',
    imagePath: '/scope-samples/grade_8_algebra.svg',
    rawText: 'Toán lớp 8: Giải phương trình bậc hai: 2x^2 - 5x + 3 = 0',
    mockAiJson: {
      pham_vi: 'ngoai_chuong_trinh',
      do_tin_cay: 0.94,
      ly_do: 'Bài toán lớp 8 giải phương trình bậc hai',
      mon_doan: 'toan',
      lop_doan: 8,
      so_bai: 1,
      cac_bai: ['Giải phương trình bậc hai: 2x^2 - 5x + 3 = 0'],
      de_bai: 'Giải phương trình bậc hai: 2x^2 - 5x + 3 = 0',
    },
  },
  {
    id: 'sample_lam_ho',
    name: '6. Viết hộ bài văn tả mẹ (Làm hộ)',
    category: 'lam_ho',
    expectedAction: 'redirect',
    description: 'Yêu cầu viết sẵn bài văn hoàn chỉnh',
    imagePath: '/scope-samples/essay_ghostwrite.svg',
    rawText: 'Viết hộ con bài văn tả mẹ dài 200 chữ thật cảm động để nộp cô giáo ngày mai.',
    mockAiJson: {
      pham_vi: 'lam_ho',
      do_tin_cay: 0.99,
      ly_do: 'Yêu cầu viết hộ bài văn hoàn chỉnh',
      mon_doan: 'tieng_viet',
      lop_doan: 4,
      so_bai: 1,
      cac_bai: ['Viết hộ con bài văn tả mẹ dài 200 chữ thật cảm động để nộp cô giáo ngày mai.'],
      de_bai: 'Viết bài văn tả mẹ của em.',
    },
  },
]
