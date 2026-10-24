/* ============================================================
   📝 PROMPT STUDIO CONFIG & TEMPLATE ENGINE
   Hệ thống quản lý 8 Prompts linh hoạt, hỗ trợ điền biến {{...}}
   và đồng bộ qua Cloudflare D1 Key-Value (prompt_studio:config)
   ============================================================ */

export const PROMPT_STORAGE_KEY = 'kem-con-hoc:prompt-studio-config'
export const PROMPT_HISTORY_KEY = 'kem-con-hoc:prompt-studio-history'

export const DEFAULT_PROMPTS = {
  p1_ocr: {
    id: 'p1_ocr',
    name: '1. Đọc đề từ ảnh',
    desc: 'Mẹ chụp ảnh bài tập, AI đọc chữ trong ảnh',
    variables: [],
    requiredVars: [],
    template: `Đọc giúp mình toàn bộ chữ trong ảnh bài tập này nhé (chữ in sách hoặc chữ viết tay vở ô ly).
Quy tắc:
- Giữ nguyên tất cả số liệu, phép tính, câu hỏi, các đáp án trắc nghiệm A B C D nếu có.
- Viết lại đúng chính tả tiếng Việt có dấu giúp mình. Nếu nét viết tay bị mờ hoặc dính chữ thì tự sửa đúng chính tả luôn (vd: me mua -> Mẹ mua, con may qua -> còn mấy quả).
- Nếu ảnh có nhiều câu (Câu 1, Câu 2...), hãy tách rõ ràng từng câu.
- Chỉ trả về duy nhất nội dung đề bài đọc được, không thêm lời chào, câu dẫn hay bình luận mở đầu/kết thúc.`,
  },

  p2_clean: {
    id: 'p2_clean',
    name: '2. Làm sạch đề sau OCR (dự phòng)',
    desc: 'Đề đọc từ ảnh bị lỗi chính tả, dính chữ',
    variables: [],
    requiredVars: [],
    template: `Bạn là công cụ trích xuất và làm sạch đề bài toán tiểu học từ văn bản OCR.
Văn bản OCR thường lẫn mô tả ảnh, lỗi chính tả, thiếu dấu, dính từ (VD: "co8" = "có 8", "taq"/"tao" = "táo").
Quy tắc BẮT BUỘC:
(1) Giữ nguyên MỌI số liệu, không bỏ sót số nào;
(2) Nếu từ bị đọc sai, chọn nghĩa phổ biến nhất trong đề toán tiểu học (táo, cam, kẹo, bút, quyển, que tính...);
(3) Viết lại đúng chính tả tiếng Việt có dấu.
Trả về DUY NHẤT đề bài đã sửa, không thêm lời dẫn hay bình luận.
Nếu không tìm thấy đề bài, trả về đúng văn bản gốc.`,
  },

  p3_explain: {
    id: 'p3_explain',
    name: '3. Soạn bài giảng gợi mở (Scaffold Socratic)',
    desc: 'Định tuyến phương pháp sư phạm, gợi ý 4 bậc, mức 1 vật thật, mức 2 hình vẽ, bài anh em & trò chơi 5p',
    variables: ['{{mon}}', '{{lop}}', '{{sach}}', '{{dang_bai}}', '{{loi_hay_gap}}', '{{de_bai}}', '{{doan_phuong_phap}}', '{{khung_ghi_chu}}'],
    requiredVars: ['{{de_bai}}'],
    template: `Bạn là cố vấn sư phạm tiểu học, nói chuyện với PHỤ HUYNH (không nói với trẻ).
Nhiệm vụ: giúp phụ huynh dẫn con TỰ tìm ra đáp án bằng câu hỏi gợi mở Socratic.

THÔNG TIN
- Môn: {{mon}}. Lớp: {{lop}}. Bộ sách: {{sach}}.
- Dạng bài: {{dang_bai}}. Lỗi trẻ hay gặp: {{loi_hay_gap}}.
- Đề bài: """{{de_bai}}"""
{{khung_ghi_chu}}

PHƯƠNG PHÁP ÁP DỤNG (chỉ dùng các phương pháp này):
{{doan_phuong_phap}}

QUY TẮC BẮT BUỘC
1. Tối đa 4 bậc. Mỗi bậc là MỘT câu hỏi ngắn (dưới 25 chữ) để phụ huynh đọc to cho con.
2. Không bậc nào được chứa đáp số cuối cùng trong "cau_hoi" hoặc "goi_y".
3. Đáp án từng bậc chỉ đặt trong trường "dap_an_cho_me".
4. Mỗi bậc có 2 mức gợi ý khi con bí:
   muc_1_do_vat dùng đồ vật thật trong nhà (kẹo, que tính, ngón tay, chiếc đĩa...),
   muc_2_hinh_ve dùng hình vẽ hoặc sơ đồ đoạn thẳng (mô tả để bố mẹ vẽ ra giấy cho con).
5. Dùng tiếng Việt đơn giản, xưng "mẹ/bố" và "con". Không dùng thuật ngữ sư phạm hàn lâm.
6. Không chê trẻ. Câu khen phải khen sự cố gắng, không khen "thông minh".
7. Nếu đề không rõ hoặc thiếu dữ kiện: trả "can_hoi_lai" và để trống các bậc.
8. Tạo 1 "bai_anh_em": cùng dạng, đổi số và bối cảnh, kèm đáp án cho mẹ đối chiếu.
9. Tạo 1 "tro_choi_5_phut": ôn đúng dạng này bằng đồ vật quen thuộc trong nhà.
10. Tạo 1 câu "con_day_lai_me": mời con đóng vai thầy/cô giảng lại bước quan trọng nhất cho bố mẹ.

VÍ DỤ MẪU HOÀN CHỈNH (FEW-SHOT):
Đề: "Có 3 hộp bút, mỗi hộp có 8 cây bút. Mẹ lấy ra 5 cây bút. Hỏi còn lại bao nhiêu cây bút?"
Trả về JSON:
{
  "dang_bai": "Toán có lời văn giải bằng hai bước tính",
  "giai_thich_cho_me": "Con đang học bài toán hai bước tính (nhân rồi trừ). Sách thường dạy con tính tổng số bút trong các hộp trước rồi mới trừ đi phần lấy ra.",
  "luu_y_khi_giang": "Bố mẹ hay sốt ruột làm phép trừ trước. Hãy để con tự tìm ra tổng số bút trước.",
  "cac_bac": [
    {
      "cau_hoi": "Mẹ có 3 hộp bút, mỗi hộp 8 cây. Làm sao biết trong 3 hộp có tất cả bao nhiêu cây bút nhỉ?",
      "dap_an_cho_me": "3 × 8 = 24 cây bút",
      "goi_y": {
        "muc_1_do_vat": "Lấy 3 chiếc đĩa, mỗi đĩa đặt 8 que tính (hoặc que tăm).",
        "muc_2_hinh_ve": "Mẹ vẽ 3 ô chữ nhật, mỗi ô chấm 8 chấm tròn."
      }
    },
    {
      "cau_hoi": "Có tất cả 24 cây bút rồi, mẹ lấy ra 5 cây thì số bút nhiều lên hay bớt đi con nhỉ?",
      "dap_an_cho_me": "Bớt đi (làm phép trừ 24 - 5)",
      "goi_y": {
        "muc_1_do_vat": "Bốc 5 que tính cất vào túi áo mẹ và hỏi con đĩa còn bao nhiêu que.",
        "muc_2_hinh_ve": "Gạch chéo 5 chấm tròn trên giấy."
      }
    },
    {
      "cau_hoi": "Bây giờ con viết phép tính để tìm số bút còn lại giúp mẹ nào!",
      "dap_an_cho_me": "24 − 5 = 19 (cây bút)",
      "goi_y": {
        "muc_1_do_vat": "Chỉ vào số que tính còn lại trên bàn.",
        "muc_2_hinh_ve": "Mẹ viết sẵn khung mẫu: 24 − … = …"
      }
    }
  ],
  "dap_an_cuoi_cho_me": "19 cây bút",
  "con_day_lai_me": "Đố mẹ biết bước nào con thấy thích nhất trong bài này, con chỉ cho mẹ với!",
  "bai_anh_em": {
    "de": "Có 4 túi kẹo, mỗi túi có 5 cái kẹo. Bé ăn mất 3 cái. Hỏi còn lại mấy cái kẹo?",
    "dap_an_cho_me": "4 × 5 = 20 cái; 20 − 3 = 17 cái kẹo"
  },
  "tro_choi_5_phut": "Úp 3 cái bát lên bàn, mỗi bát giấu 3 viên sỏi nhỏ, chơi trò đoán tổng số sỏi.",
  "loi_khen": "Con rất tập trung và tự phát hiện ra phép tính nhân trước đấy!",
  "can_hoi_lai": ""
}

CHỈ TRẢ VỀ DUY NHẤT ĐỐI TƯỢNG JSON THEO ĐÚNG SCHEMA TRÊN, KHÔNG THÊM BẤT KỲ CHỮ NÀO NGOÀI JSON.`,
  },

  p3b_parent_note_explain: {
    id: 'p3b_parent_note_explain',
    name: '3b. Khung ghi chú phụ huynh (soạn bài)',
    desc: 'Mẹ có ghi chú ("Soạn lại theo ý mẹ" hoặc mục Con tôi)',
    variables: ['{{ghi_chu}}'],
    requiredVars: ['{{ghi_chu}}'],
    template: `LƯU Ý ĐẶC BIỆT TỪ PHỤ HUYNH KHI SOẠN BÀI: "{{ghi_chu}}".
Hãy tôn trọng và điều chỉnh các bậc câu hỏi, cách giải thích hoặc phép tính phù hợp đúng theo yêu cầu này của phụ huynh.`,
  },

  p4_chat: {
    id: 'p4_chat',
    name: '4. Hỏi thêm AI',
    desc: 'Mẹ chat hỏi AI về bài đang học',
    variables: ['{{mon}}', '{{lop}}', '{{sach}}', '{{dang_bai}}', '{{loi_hay_gap}}', '{{de_bai}}', '{{khung_ghi_chu}}', '{{doan_phuong_phap}}'],
    requiredVars: ['{{de_bai}}'],
    template: `Bạn là trợ lý cho phụ huynh dạy con tiểu học môn {{mon}}. Trẻ học {{lop}}, sách {{sach}}.
Dạng bài: {{dang_bai}}. Lỗi hay gặp: {{loi_hay_gap}}.
Bài đang học: "{{de_bai}}".
{{doan_phuong_phap}}
{{khung_ghi_chu}}
LUẬT BẮT BUỘC: chỉ trả lời cho phụ huynh CÁCH GIẢNG, gợi ý câu hỏi dẫn dắt, phương pháp, mẹo viết lời giải hoặc ví dụ đồ vật cụ thể trong nhà (kẹo, bánh, que tính, chiếc đũa). KHÔNG BAO GIỜ đưa đáp án cuối cùng cho trẻ chép. Trả lời ngắn gọn, tiếng Việt, câu ngắn, giọng điệu đồng cảm với cha mẹ.`,
  },

  p4b_parent_note_chat: {
    id: 'p4b_parent_note_chat',
    name: '4b. Khung ghi chú phụ huynh (chat)',
    desc: 'Như 3b nhưng cho màn chat',
    variables: ['{{ghi_chu}}'],
    requiredVars: ['{{ghi_chu}}'],
    template: `Ghi chú riêng của phụ huynh: "{{ghi_chu}}". Hãy trả lời tư vấn bám sát vào đặc điểm này của bé.`,
  },

  p5_toy: {
    id: 'p5_toy',
    name: '5. Nhận diện đồ vật',
    desc: 'Trò chơi: chụp đồ vật con cầm, AI đoán tên',
    variables: [],
    requiredVars: [],
    template: `Quan sát kỹ đồ vật mà người trong ảnh đang cầm trên tay hoặc giơ lên phía trước (ví dụ: cây lược/lược chải tóc, cây bút, cái kéo, cây thước kẻ, cái cốc/ly, khối lego, cái bát/chén, cái thìa/muỗng, gấu bông, xe ô tô...). Trả về DUY NHẤT tên đồ vật ngắn gọn bằng tiếng Việt, không thêm câu dẫn.`,
  },

  p6_practice: {
    id: 'p6_practice',
    name: '6. Bài luyện thêm cùng dạng',
    desc: 'Nút "Luyện thêm": AI ra 1 bài cùng dạng, số khác',
    variables: ['{{lop}}', '{{sach}}', '{{de_bai}}'],
    requiredVars: ['{{de_bai}}'],
    template: `Bạn là giáo viên tiểu học. Tạo 1 bài toán CÙNG DẠNG với bài sau nhưng số liệu khác, cho phụ huynh cho con luyện thêm.
Trẻ học {{lop}}, sách {{sach}}.
Bài gốc: "{{de_bai}}".

Trả về DUY NHẤT JSON:
{"text":"đề bài mới","answer":"đáp án cho cha mẹ đối chiếu"}
Không thêm text ngoài JSON.`,
  },

  p7_longitudinal_analysis: {
    id: 'p7_longitudinal_analysis',
    name: '7. Phân tích Dữ liệu Lớn Sticker & Lộ trình Sư phạm Cân bằng',
    desc: 'AI phân tích sự thay đổi phẩm chất theo tuần (kiên nhẫn, sáng tạo), chẩn đoán bài học nhàm chán/quá khó & đề xuất lộ trình',
    variables: ['{{ten_be}}', '{{lop}}', '{{thong_ke_tuan_nay}}', '{{thong_ke_tuan_truoc}}', '{{mon_hoc_va_vuong_mac}}', '{{so_ca_hoc}}'],
    requiredVars: ['{{ten_be}}', '{{thong_ke_tuan_nay}}'],
    template: `Bạn là chuyên gia Tâm lý Giáo dục & Cố vấn Sư phạm Tiểu học cao cấp. Bạn đang có dữ liệu lớn (Longitudinal Data) theo dõi hành trình học tập nhiều tuần của học sinh {{ten_be}} ({{lop}}).

DỮ LIỆU ĐẦU VÀO:
- Tuần này: {{thong_ke_tuan_nay}}
- Tuần trước: {{thong_ke_tuan_truoc}}
- Môn học & Dạng bài vướng mắc: {{mon_hoc_va_vuong_mac}}
- Chỉ số đồng hành của phụ huynh: {{so_ca_hoc}}

NHIỆM VỤ PHÂN TÍCH CHUYÊN SÂU:
1. 🔍 Chẩn đoán biến động phẩm chất học tập (Đặc biệt lý giải sự tăng/giảm giữa Kiên nhẫn vs Sáng tạo):
   - Phân tích nguyên nhân vì sao con nhận ít sticker Sáng tạo hơn và tăng sticker Kiên nhẫn (hoặc ngược lại). Có phải do dạng bài lặp đi lặp lại gây nhàm chán, hay do độ khó bài toán lời văn 2 bước tăng đột ngột khiến con phải dồn sức kiên trì, ít cơ hội tư duy bứt phá?
2. ⚠️ Điểm nghẽn môn học (Learning Bottlenecks):
   - Phân tích môn học và dạng bài con đang vướng nhiều nhất, giải thích tâm lý của trẻ ở lứa tuổi này khi gặp chướng ngại đó.
3. 🎯 Lộ trình hành động cân bằng 7 ngày tới (Adaptive Learning Roadmap):
   - Đề xuất giải pháp cụ thể cho bố mẹ:
     + 1 cách "kích hoạt lại sự Sáng tạo" (vd: đổi sang trò chơi 5 phút với đồ vật thật, đố vui ngược, tạo bài toán anh em hài hước).
     + 1 cách "hạ bậc thang độ khó" ở môn hay vướng để con không bị kiệt sức tâm lý.
     + Mẫu câu khen ngợi cụ thể giúp tái cân bằng tâm lý và củng cố niềm tin cho con.

YÊU CẦU ĐỊNH DẠNG:
Trả về văn bản tiếng Việt ấm áp, động viên, khoa học, chia rõ ràng 3 mục:
📊 1. NHẬN ĐỊNH BIẾN ĐỘNG TÂM LÝ & PHẨM CHẤT
💡 2. NGUYÊN NHÂN CỐT LÕI (DẠNG BÀI & MÔI TRƯỜNG HỌC)
🚀 3. LỘ TRÌNH 3 BƯỚC CHO TUẦN TỚI ĐỂ CÂN BẰNG CHO CON`,
  },
}

/* Cache in-memory */
let cachedPrompts = null

/* Lấy toàn bộ prompt đang áp dụng (Local Storage + Fallback Default) */
export function getActivePrompts() {
  if (cachedPrompts) return cachedPrompts
  try {
    const raw = localStorage.getItem(PROMPT_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      cachedPrompts = { ...DEFAULT_PROMPTS, ...parsed }
      return cachedPrompts
    }
  } catch (e) {}
  cachedPrompts = { ...DEFAULT_PROMPTS }
  return cachedPrompts
}

/* Cập nhật cache khi quản trị viên Lưu */
export function setActivePrompts(newPrompts) {
  cachedPrompts = { ...DEFAULT_PROMPTS, ...newPrompts }
  try {
    localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(cachedPrompts))
  } catch (e) {}
  return cachedPrompts
}

/* ============================================================
   🎯 BẢNG ĐỊNH TUYẾN PHƯƠNG PHÁP SƯ PHẠM (PEDAGOGY ROUTER) & AI CONFIG
   Hỗ trợ cấu hình Model, Temperature, Max Tokens và Bảng Router trực tiếp trên Admin
   ============================================================ */
export const PROMPT_AI_CONFIG_KEY = 'kem-con-hoc:prompt-studio-ai-config'

export const DEFAULT_AI_CONFIG = {
  model: 'cloudflare-llama-3.3-70b',
  modelName: 'Cloudflare Llama 3.3 70B (Fast & Mặc định)',
  temperature: 0.3,
  max_tokens: 1500,
  timeout_ms: 30000,
  curriculum_config: {
    books: ['Kết nối tri thức', 'Chân trời sáng tạo', 'Cánh diều', 'Cùng học để phát triển năng lực'],
    grades: ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'],
    tones: [
      { id: 'gentle', label: 'Dịu dàng', desc: 'Ấm áp, kiên nhẫn, khích lệ nỗ lực' },
      { id: 'fun', label: 'Vui nhộn', desc: 'Hài hước, ví von sinh động với đồ vật' },
      { id: 'concise', label: 'Ngắn gọn', desc: 'Câu ngắn dưới 15 chữ, súc tích' },
    ],
  },
  pedagogy_routing: [
    {
      id: 'toan_loi_van',
      title: 'Toán có lời văn, phép tính lớp 1–3',
      subjectName: 'Toán',
      methods: 'Singapore CPA + Scaffolding + Inquiry (Socratic)',
      instruction: 'Bậc 1 dùng vật thật (kẹo, que tính, ngón tay), bậc 2 vẽ hình hoặc sơ đồ đoạn thẳng, bậc 3 viết phép tính. Mỗi bậc là MỘT câu hỏi ngắn (dưới 25 chữ), không phải lời giảng giải dài dòng.',
      common_mistake: 'Bố mẹ hay sốt ruột làm hộ phép tính trước khi con kịp hiểu đề',
      keywords: 'lời văn|phép tính|cộng|trừ|nhân|chia|mua|bán|còn lại|tất cả|bao nhiêu',
      matchSubject: 'toán|math',
      matchGrade: '1|2|3',
      matchTopic: 'lời văn|phép tính|cộng|trừ|nhân|chia',
      enabled: true,
    },
    {
      id: 'toan_khai_niem',
      title: 'Toán khái niệm mới (số chẵn, chia hết, phân số)',
      subjectName: 'Toán',
      methods: 'Inductive + CPA + Tích hợp đời sống',
      instruction: 'Cho 3–4 ví dụ cụ thể quen thuộc để con tự tìm ra quy luật, rồi mới cùng con gọi tên quy tắc (VD: răng lược 2–4–6–8, chia bánh pizza).',
      common_mistake: 'Con chưa nhìn ra quy luật số hoặc nhầm lẫn giữa tử số và mẫu số',
      keywords: 'khái niệm|số chẵn|số lẻ|chia hết|phân số|dãy số|quy luật',
      matchSubject: 'toán|math',
      matchGrade: 'all',
      matchTopic: 'khái niệm|số chẵn|số lẻ|chia hết|phân số|hình',
      enabled: true,
    },
    {
      id: 'toan_cong_thuc',
      title: 'Toán áp dụng công thức (chu vi, diện tích lớp 3–5)',
      subjectName: 'Toán',
      methods: 'Deductive + Direct Instruction ngắn + Competency-based',
      instruction: 'Nhắc quy tắc cốt lõi đúng 1 câu ngắn, làm mẫu 1 ví dụ khác với số nhỏ, sau đó hỏi con tự làm bài thật.',
      common_mistake: 'Con hay quên nhân đôi, quên đóng mở ngoặc hoặc nhầm đơn vị đo',
      keywords: 'công thức|chu vi|diện tích|mét vuông|chiều dài|chiều rộng|hình chữ nhật|hình vuông|vận tốc',
      matchSubject: 'toán|math',
      matchGrade: '3|4|5',
      matchTopic: 'công thức|chu vi|diện tích|vận tốc',
      enabled: true,
    },
    {
      id: 'tieng_viet_van',
      title: 'Tiếng Việt lớp 1–2 (âm, vần, đọc)',
      subjectName: 'Tiếng Việt',
      methods: 'Information Processing + Imagery & Elaboration + Gamification',
      instruction: 'Lặp ngắn nhiều lần, tạo liên tưởng hình ảnh sinh động cho vần khó (an/ang, uôi/uya), gợi ý trò chơi ghép thẻ chữ hoặc tìm đồ vật trong phòng.',
      common_mistake: 'Con dễ lẫn lộn các vần gần giống nhau (an/ang, iêt/iêc) hoặc phát âm sai dấu thanh',
      keywords: 'âm|vần|đọc|chính tả|tiếng việt|tập đọc|ghép vần',
      matchSubject: 'tiếng việt|văn',
      matchGrade: '1|2',
      matchTopic: 'âm|vần|đọc|chính tả',
      enabled: true,
    },
    {
      id: 'tieng_viet_doan',
      title: 'Tiếng Việt đọc hiểu, viết đoạn',
      subjectName: 'Tiếng Việt',
      methods: 'Inquiry + Meaningful Learning + Contextual Guessing',
      instruction: 'Đặt câu hỏi gợi trải nghiệm thật của con, đoán nghĩa từ theo ngữ cảnh câu trước/sau, dựng dàn ý đơn giản 3 câu (mở - thân - kết).',
      common_mistake: 'Con viết câu cụt, chưa đủ chủ vị hoặc sao chép văn mẫu máy móc',
      keywords: 'đoạn văn|đọc hiểu|tập làm văn|từ đồng nghĩa|câu chuyện|bài thơ|nghĩa của từ',
      matchSubject: 'tiếng việt|văn',
      matchGrade: 'all',
      matchTopic: 'đọc hiểu|viết đoạn|tập làm văn',
      enabled: true,
    },
    {
      id: 'tieng_anh_tu_vung',
      title: 'Tiếng Anh từ vựng',
      subjectName: 'Tiếng Anh',
      methods: 'Imagery & Elaboration + Usage-based + Experiential',
      instruction: 'Gắn từ vựng mới với đồ vật thực tế trong nhà (chair, table, pen), lặp mẫu câu nhiều lần qua trò chơi "Chỉ nhanh - Nói đúng".',
      common_mistake: 'Con chưa nhớ nghĩa từ hoặc phát âm nuốt âm cuối (ending sounds)',
      keywords: 'english|tiếng anh|choose|fill in|what|where|how many|sentence|word|vocabulary|từ vựng',
      matchSubject: 'tiếng anh|english',
      matchGrade: 'all',
      matchTopic: 'từ vựng|vocabulary',
      enabled: true,
    },
    {
      id: 'tieng_anh_ngu_phap',
      title: 'Tiếng Anh ngữ pháp, mẫu câu',
      subjectName: 'Tiếng Anh',
      methods: 'Cognitive-Code (qua Inductive) + Concept-Based Instruction',
      instruction: 'Cho 3 câu mẫu ngắn để con tự nhận ra quy luật đổi từ/đuôi từ; vẽ hình đơn giản cho giới từ vị trí (in/on/under).',
      common_mistake: 'Con hay quên chia động từ theo ngôi số ít hoặc nhầm vị trí giới từ',
      keywords: 'grammar|verb|is|are|am|do|does|have|has|preposition|in on under',
      matchSubject: 'tiếng anh|english',
      matchGrade: 'all',
      matchTopic: 'ngữ pháp|grammar|mẫu câu',
      enabled: true,
    },
    {
      id: 'con_bi_lap_lai',
      title: 'Con bí lần 2 trở đi',
      subjectName: 'Tất cả môn',
      methods: 'Differentiated Instruction (Hạ bậc thang độ khó)',
      instruction: 'Tạm thời giảm độ khó: đổi số nhỏ hơn hoặc làm bài tương tự siêu đơn giản bằng đồ vật trên bàn, con làm được rồi mới quay lại bài gốc.',
      common_mistake: 'Con bị quá tải nhận thức và nản chí khi gặp chướng ngại liên tiếp',
      keywords: 'isStuck',
      matchSubject: 'all',
      matchGrade: 'all',
      matchTopic: 'isStuck',
      enabled: true,
    },
  ],
}

// Tương thích ngược PEDAGOGY_ROUTING_TABLE
export const PEDAGOGY_ROUTING_TABLE = DEFAULT_AI_CONFIG.pedagogy_routing

let cachedAiConfig = null

export function getActiveAiConfig() {
  if (cachedAiConfig) return cachedAiConfig
  try {
    const raw = localStorage.getItem(PROMPT_AI_CONFIG_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      cachedAiConfig = { ...DEFAULT_AI_CONFIG, ...parsed }
      return cachedAiConfig
    }
  } catch (e) {}
  cachedAiConfig = { ...DEFAULT_AI_CONFIG }
  return cachedAiConfig
}

export function setActiveAiConfig(newConfig) {
  cachedAiConfig = { ...DEFAULT_AI_CONFIG, ...newConfig }
  try {
    localStorage.setItem(PROMPT_AI_CONFIG_KEY, JSON.stringify(cachedAiConfig))
  } catch (e) {}
  return cachedAiConfig
}

export function routePedagogyMethod({ mon = 'Toán', lop = 'Lớp 2', dang_bai = 'Toán có lời văn', isStuck = false } = {}) {
  const cfg = getActiveAiConfig()
  const table = (cfg && Array.isArray(cfg.pedagogy_routing) && cfg.pedagogy_routing.length > 0)
    ? cfg.pedagogy_routing
    : DEFAULT_AI_CONFIG.pedagogy_routing
  const activeRules = table.filter((r) => r.enabled !== false)

  if (isStuck) {
    const item = activeRules.find((x) => x.id === 'con_bi_lap_lai' || x.matchTopic === 'isStuck')
    if (item) {
      return {
        phuong_phap: item.methods,
        doan_phuong_phap: `- Phương pháp: ${item.methods}\n- Hướng dẫn thực hiện: ${item.instruction}\n- Cuối bài: Áp dụng Metacognitive ("Con dạy lại mẹ" và hỏi lần sau gặp bài này con làm bước nào trước).`,
      }
    }
  }

  for (const item of activeRules) {
    if (item.id === 'con_bi_lap_lai' || item.matchTopic === 'isStuck') continue
    const subMatch = !item.matchSubject || item.matchSubject === 'all' || new RegExp(item.matchSubject, 'i').test(mon)
    const gradeMatch = !item.matchGrade || item.matchGrade === 'all' || new RegExp(item.matchGrade).test(lop)
    const topicMatch = !item.matchTopic || item.matchTopic === 'all' || new RegExp(item.matchTopic, 'i').test(dang_bai)
    if (subMatch && gradeMatch && topicMatch) {
      return {
        phuong_phap: item.methods,
        doan_phuong_phap: `- Phương pháp: ${item.methods}\n- Hướng dẫn thực hiện: ${item.instruction}\n- Cuối bài: Áp dụng Metacognitive ("Con dạy lại mẹ" và hỏi lần sau gặp bài này con làm bước nào trước).`,
      }
    }
  }

  const def = activeRules[0] || DEFAULT_AI_CONFIG.pedagogy_routing[0]
  return {
    phuong_phap: def.methods,
    doan_phuong_phap: `- Phương pháp: ${def.methods}\n- Hướng dẫn thực hiện: ${def.instruction}\n- Cuối bài: Áp dụng Metacognitive ("Con dạy lại mẹ" và hỏi lần sau gặp bài này con làm bước nào trước).`,
  }
}

/**
 * Phân loại bài tập động theo cấu hình Router sư phạm (thay thế hardcode)
 */
export function classifyProblemDynamic(deBai = '', lop = 'Lớp 2') {
  const text = (deBai || '').toLowerCase()
  const cfg = getActiveAiConfig()
  const table = (cfg && Array.isArray(cfg.pedagogy_routing) && cfg.pedagogy_routing.length > 0)
    ? cfg.pedagogy_routing
    : DEFAULT_AI_CONFIG.pedagogy_routing
  const activeRules = table.filter((r) => r.enabled !== false && r.id !== 'con_bi_lap_lai')

  for (const rule of activeRules) {
    if (rule.keywords) {
      try {
        const reg = new RegExp(rule.keywords, 'i')
        if (reg.test(text)) {
          return {
            mon: rule.subjectName || (rule.matchSubject?.includes('anh') ? 'Tiếng Anh' : rule.matchSubject?.includes('việt') ? 'Tiếng Việt' : 'Toán'),
            lop,
            dang_bai: rule.title,
            loi_hay_gap: rule.common_mistake || 'Con hay vội làm phép tính mà chưa đọc kỹ câu hỏi',
          }
        }
      } catch (e) {}
    }
  }

  // Fallback mặc định
  return {
    mon: 'Toán',
    lop,
    dang_bai: 'Toán có lời văn, phép tính lớp 1–3',
    loi_hay_gap: 'Bố mẹ hay sốt ruột làm hộ phép tính trước khi con kịp hiểu đề',
  }
}

/* Engine điền biến {{...}} vào template */
export function renderPrompt(promptId, params = {}) {
  const all = getActivePrompts()
  const p = all[promptId] || DEFAULT_PROMPTS[promptId]
  if (!p) return ''

  let text = p.template || ''

  // Xử lý mô tả giọng nếu có {{giong}}
  let moTaGiong = params.mo_ta_giong || ''
  if (!moTaGiong && params.giong) {
    if (params.giong === 'Vui nhộn') moTaGiong = 'vui tươi, hài hước nhẹ'
    else if (params.giong === 'Ngắn gọn') moTaGiong = 'câu ngắn, ít chữ'
    else moTaGiong = 'dịu dàng, khích lệ'
  }

  // Xử lý khung ghi chú phụ huynh (3b, 4b)
  let khungGhiChu = params.khung_ghi_chu || ''
  if (!khungGhiChu && params.ghi_chu && params.ghi_chu.trim()) {
    const subPromptId = promptId === 'p4_chat' ? 'p4b_parent_note_chat' : 'p3b_parent_note_explain'
    const subP = all[subPromptId] || DEFAULT_PROMPTS[subPromptId]
    if (subP) {
      khungGhiChu = subP.template.replace(/\{\{ghi_chu\}\}/g, params.ghi_chu.trim().slice(0, 200))
    }
  }

  // Tự động định tuyến phương pháp sư phạm nếu chưa có doan_phuong_phap
  let doanPhuongPhap = params.doan_phuong_phap || ''
  if (!doanPhuongPhap && (promptId === 'p3_explain' || promptId === 'p4_chat')) {
    const routed = routePedagogyMethod({
      mon: params.mon || 'Toán',
      lop: params.lop || 'Lớp 2',
      dang_bai: params.dang_bai || 'Toán có lời văn',
      isStuck: params.isStuck,
    })
    doanPhuongPhap = routed.doan_phuong_phap
  }

  const map = {
    ...params,
    mon: params.mon || 'Toán',
    lop: params.lop || 'Lớp 2',
    sach: params.sach || params.bo_sach || 'Kết nối tri thức',
    bo_sach: params.bo_sach || params.sach || 'Kết nối tri thức',
    dang_bai: params.dang_bai || 'Toán có lời văn phép tính',
    loi_hay_gap: params.loi_hay_gap || 'Con hay vội làm phép tính mà chưa đọc kỹ câu hỏi',
    doan_phuong_phap: doanPhuongPhap,
    giong: params.giong || 'Dịu dàng',
    mo_ta_giong: moTaGiong,
    de_bai: params.de_bai || '',
    khung_ghi_chu: khungGhiChu,
    ghi_chu: params.ghi_chu || '',
    ten_be: params.ten_be || 'Bé',
    thong_ke_tuan_nay: params.thong_ke_tuan_nay || '',
    thong_ke_tuan_truoc: params.thong_ke_tuan_truoc || '',
    mon_hoc_va_vuong_mac: params.mon_hoc_va_vuong_mac || '',
    so_ca_hoc: params.so_ca_hoc || '',
  }

  // Thay thế tất cả {{key}}
  text = text.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
    return typeof map[key] !== 'undefined' ? map[key] : ''
  })

  return text
}
