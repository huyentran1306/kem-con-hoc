Bạn là chuyên gia Full-stack AI & Frontend React/Vite cấp cao. Nhiệm vụ của bạn là tích hợp toàn diện hệ thống **Prompt Studio** và **Kiến trúc Định tuyến Sư phạm Socratic 3 tầng (Pedagogy Router)** vào ứng dụng Web React (Vite) "Kèm Con Học".

---

### MỤC TIÊU DỰ ÁN & KIẾN TRÚC TỔNG THỂ
1. **Kiến trúc AI Cloudflare:**
   - Vision OCR: Llama 3.2 11B Vision đọc đề chữ viết tay vở ô ly và sách in SGK.
   - Router Classifier: Phân loại nhanh môn, lớp, dạng bài và lỗi hay gặp để định tuyến phương pháp sư phạm phù hợp.
   - Scaffold Socratic: Llama 3.3 70B đóng vai cố vấn sư phạm gợi mở cho phụ huynh theo kỹ thuật Socratic (tối đa 4 bậc câu hỏi, mức 1 vật thật trong nhà, mức 2 hình vẽ/sơ đồ, bài anh em cùng dạng, trò chơi 5 phút, con dạy lại mẹ).
2. **Quản trị Prompt Studio (`/admin`):**
   - Quản lý tập trung 8 System Prompts, chèn biến động (`{{mon}}`, `{{lop}}`, `{{sach}}`, `{{dang_bai}}`, `{{loi_hay_gap}}`, `{{de_bai}}`, `{{doan_phuong_phap}}`, `{{khung_ghi_chu}}`, `{{ghi_chu}}`).
   - Tự động chèn biến vào đúng vị trí con trỏ chuột (`selectionStart`/`selectionEnd`).
   - Phân biệt màu sắc và icon riêng biệt cho từng biến.
   - Trình soạn thảo 2 chế độ (Soạn thảo với lớp highlight backdrop phát sáng + Xem nổi bật biến trực quan).
   - Test Bench chạy thử trực tiếp với Cloudflare AI Gateway kèm bộ 5 tiêu chí kiểm định tự động.
   - Đồng bộ Cloudflare D1 KV (`prompt_studio:config`), lưu lịch sử 30 phiên bản và bảo mật bằng `PROMPT_ADMIN_KEY`.

---

### BƯỚC 1: BẢNG ĐỊNH TUYẾN PHƯƠNG PHÁP SƯ PHẠM (PEDAGOGY ROUTER)
> **Nguyên tắc sống còn:** Tuyệt đối không nhồi cả 30 phương pháp giáo dục vào một prompt. Khi dán quá nhiều phương pháp vào system prompt, mô hình sẽ trộn lung tung và câu trả lời bị dài dòng, lý thuyết suông. Router sẽ xác định môn, lớp và dạng bài, rồi **chỉ chèn 2–3 phương pháp phù hợp nhất** vào prompt.

| Tình huống | Phương pháp chèn vào prompt | Biểu hiện trong Scaffold câu hỏi |
|---|---|---|
| **Toán có lời văn, phép tính lớp 1–3** | Singapore CPA + Scaffolding + Inquiry (Socratic) | Bậc 1 dùng vật thật (kẹo, que tính, ngón tay), bậc 2 vẽ hình hoặc sơ đồ đoạn thẳng, bậc 3 viết phép tính. Mỗi bậc là MỘT câu hỏi ngắn (dưới 25 chữ), không phải lời giảng. |
| **Toán khái niệm mới (số chẵn, chia hết, phân số, hình học)** | Inductive + CPA + Tích hợp đời sống | Cho 3–4 ví dụ cụ thể để con tự tìm ra quy luật, rồi mới gọi tên quy tắc (VD: răng lược 2–4–6–8, chia bánh). |
| **Toán áp dụng công thức (chu vi, diện tích lớp 3–5)** | Deductive + Direct Instruction ngắn + Competency-based | Nhắc quy tắc cốt lõi đúng 1 câu ngắn, làm mẫu 1 ví dụ khác với số nhỏ, sau đó hỏi con tự làm bài thật. |
| **Tiếng Việt lớp 1–2 (âm, vần, đọc, chính tả)** | Information Processing + Imagery & Elaboration + Gamification | Lặp ngắn nhiều lần, tạo liên tưởng hình ảnh sinh động cho vần khó (an/ang, uôi/uya), trò chơi ghép thẻ chữ hoặc tìm đồ vật trong phòng. |
| **Tiếng Việt đọc hiểu, viết đoạn văn** | Inquiry + Meaningful Learning + Contextual Guessing | Hỏi gợi trải nghiệm thật của con, đoán nghĩa từ theo ngữ cảnh câu trước/sau, dàn ý 3 câu (Mở - Thân - Kết). |
| **Tiếng Anh từ vựng** | Imagery & Elaboration + Usage-based + Experiential | Gắn từ vựng mới với đồ vật thực tế trong nhà (chair, table, pen), lặp mẫu câu nhiều lần qua trò chơi 'Chỉ nhanh - Nói đúng'. |
| **Tiếng Anh ngữ pháp, mẫu câu** | Cognitive-Code (qua Inductive) + Concept-Based Instruction | Cho 3 câu mẫu ngắn để con tự nhận ra quy luật đổi từ/đuôi từ; vẽ hình đơn giản cho giới từ vị trí (in/on/under). |
| **Mọi bài, cuối phiên học** | Metacognitive + Peer Teaching | Áp dụng "Con dạy lại mẹ": Nhờ con giảng lại 1 bước khó nhất, và hỏi: "Lần sau gặp bài giống vậy con làm bước nào trước?". |
| **Con bí lần 2 trở đi** | Differentiated Instruction (Hạ bậc thang độ khó) | Giảm độ khó: đổi số nhỏ hơn hoặc làm bài tương tự siêu đơn giản bằng đồ vật trên bàn, con làm được rồi mới quay lại bài gốc. |

---

### BƯỚC 2: MẪU SYSTEM PROMPT SOCRATIC CHO `p3_explain`

Nội dung System Prompt chuẩn của `p3_explain` (hỗ trợ Router và Few-shot chuẩn mực):

```text
Bạn là cố vấn sư phạm tiểu học, nói chuyện với PHỤ HUYNH (không nói với trẻ).
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

CHỈ TRẢ VỀ DUY NHẤT ĐỐI TƯỢNG JSON THEO ĐÚNG SCHEMA TRÊN, KHÔNG THÊM BẤT KỲ CHỮ NÀO NGOÀI JSON.
```

---

### BƯỚC 3: CÀI ĐẶT `src/promptStudio.js` (ENGINE & ROUTER)

Tạo file `src/promptStudio.js` chứa:
- `DEFAULT_PROMPTS` với 8 prompts hoàn chỉnh (`p1_ocr`, `p2_clean`, `p3_explain`, `p3b_parent_note_explain`, `p4_chat`, `p4b_parent_note_chat`, `p5_toy`, `p6_practice`).
- `PEDAGOGY_ROUTING_TABLE` và hàm `routePedagogyMethod({ mon, lop, dang_bai, isStuck })`.
- Hàm `renderPrompt(promptId, params)` tự động tính toán `doan_phuong_phap`, nhúng `khung_ghi_chu`, và thay thế tất cả các biến template `{{...}}`.

```javascript
export const PROMPT_STORAGE_KEY = 'kem-con-hoc:prompt-studio-config'
export const PROMPT_HISTORY_KEY = 'kem-con-hoc:prompt-studio-history'

export const PEDAGOGY_ROUTING_TABLE = [
  {
    id: 'toan_loi_van',
    title: 'Toán có lời văn, phép tính lớp 1–3',
    methods: 'Singapore CPA + Scaffolding + Inquiry (Socratic)',
    instruction: 'Bậc 1 dùng vật thật (kẹo, que tính, ngón tay), bậc 2 vẽ hình hoặc sơ đồ đoạn thẳng, bậc 3 viết phép tính. Mỗi bậc là MỘT câu hỏi ngắn (dưới 25 chữ), không phải lời giảng giải dài dòng.',
    match: (mon, lop, dang) => /toán|math/i.test(mon) && /1|2|3/.test(lop) && /lời văn|phép tính|cộng|trừ|nhân|chia/i.test(dang),
  },
  {
    id: 'toan_khai_niem',
    title: 'Toán khái niệm mới (số chẵn, chia hết, phân số)',
    methods: 'Inductive + CPA + Tích hợp đời sống',
    instruction: 'Cho 3–4 ví dụ cụ thể quen thuộc để con tự tìm ra quy luật, rồi mới cùng con gọi tên quy tắc (VD: răng lược 2–4–6–8, chia bánh pizza).',
    match: (mon, lop, dang) => /toán|math/i.test(mon) && /khái niệm|số chẵn|số lẻ|chia hết|phân số|hình/i.test(dang),
  },
  {
    id: 'toan_cong_thuc',
    title: 'Toán áp dụng công thức (chu vi, diện tích lớp 3–5)',
    methods: 'Deductive + Direct Instruction ngắn + Competency-based',
    instruction: 'Nhắc quy tắc cốt lõi đúng 1 câu ngắn, làm mẫu 1 ví dụ khác với số nhỏ, sau đó hỏi con tự làm bài thật.',
    match: (mon, lop, dang) => /toán|math/i.test(mon) && /công thức|chu vi|diện tích|vận tốc/i.test(dang),
  },
  {
    id: 'tieng_viet_van',
    title: 'Tiếng Việt lớp 1–2 (âm, vần, đọc)',
    methods: 'Information Processing + Imagery & Elaboration + Gamification',
    instruction: 'Lặp ngắn nhiều lần, tạo liên tưởng hình ảnh sinh động cho vần khó (an/ang, uôi/uya), gợi ý trò chơi ghép thẻ chữ hoặc tìm đồ vật trong phòng.',
    match: (mon, lop, dang) => /tiếng việt|văn/i.test(mon) && /1|2/.test(lop) && /âm|vần|đọc|chính tả/i.test(dang),
  },
  {
    id: 'tieng_viet_doan',
    title: 'Tiếng Việt đọc hiểu, viết đoạn',
    methods: 'Inquiry + Meaningful Learning + Contextual Guessing',
    instruction: 'Đặt câu hỏi gợi trải nghiệm thật của con, đoán nghĩa từ theo ngữ cảnh câu trước/sau, dựng dàn ý đơn giản 3 câu (mở - thân - kết).',
    match: (mon, lop, dang) => /tiếng việt|văn/i.test(mon) && /đọc hiểu|viết đoạn|tập làm văn/i.test(dang),
  },
  {
    id: 'tieng_anh_tu_vung',
    title: 'Tiếng Anh từ vựng',
    methods: 'Imagery & Elaboration + Usage-based + Experiential',
    instruction: 'Gắn từ vựng mới với đồ vật thực tế trong nhà (chair, table, pen), lặp mẫu câu nhiều lần qua trò chơi "Chỉ nhanh - Nói đúng".',
    match: (mon, lop, dang) => /tiếng anh|english/i.test(mon) && /từ vựng|vocabulary/i.test(dang),
  },
  {
    id: 'tieng_anh_ngu_phap',
    title: 'Tiếng Anh ngữ pháp, mẫu câu',
    methods: 'Cognitive-Code (qua Inductive) + Concept-Based Instruction',
    instruction: 'Cho 3 câu mẫu ngắn để con tự nhận ra quy luật đổi từ/đuôi từ; vẽ hình đơn giản cho giới từ vị trí (in/on/under).',
    match: (mon, lop, dang) => /tiếng anh|english/i.test(mon) && /ngữ pháp|grammar|mẫu câu/i.test(dang),
  },
  {
    id: 'con_bi_lap_lai',
    title: 'Con bí lần 2 trở đi',
    methods: 'Differentiated Instruction (Hạ bậc thang độ khó)',
    instruction: 'Tạm thời giảm độ khó: đổi số nhỏ hơn hoặc làm bài tương tự siêu đơn giản bằng đồ vật trên bàn, con làm được rồi mới quay lại bài gốc.',
    match: (mon, lop, dang, isStuck) => Boolean(isStuck),
  },
]

export function routePedagogyMethod({ mon = 'Toán', lop = 'Lớp 2', dang_bai = 'Toán có lời văn', isStuck = false } = {}) {
  if (isStuck) {
    const item = PEDAGOGY_ROUTING_TABLE.find((x) => x.id === 'con_bi_lap_lai')
    return {
      phuong_phap: item.methods,
      doan_phuong_phap: `- Phương pháp: ${item.methods}\n- Hướng dẫn thực hiện: ${item.instruction}\n- Cuối bài: Áp dụng Metacognitive ("Con dạy lại mẹ" và hỏi lần sau gặp bài này con làm bước nào trước).`,
    }
  }

  for (const item of PEDAGOGY_ROUTING_TABLE) {
    if (item.match && item.match(mon, lop, dang_bai)) {
      return {
        phuong_phap: item.methods,
        doan_phuong_phap: `- Phương pháp: ${item.methods}\n- Hướng dẫn thực hiện: ${item.instruction}\n- Cuối bài: Áp dụng Metacognitive ("Con dạy lại mẹ" và hỏi lần sau gặp bài này con làm bước nào trước).`,
      }
    }
  }

  const def = PEDAGOGY_ROUTING_TABLE[0]
  return {
    phuong_phap: def.methods,
    doan_phuong_phap: `- Phương pháp: ${def.methods}\n- Hướng dẫn thực hiện: ${def.instruction}\n- Cuối bài: Áp dụng Metacognitive ("Con dạy lại mẹ" và hỏi lần sau gặp bài này con làm bước nào trước).`,
  }
}
```

---

### BƯỚC 4: TÍCH HỢP `src/api.js` (FAST CLASSIFIER & SOCRATIC RUNTIME)

1. **Hàm phân loại nhanh `fastClassifyProblem(deBai, lop)`:**
   Chạy bằng Heuristic Regex xác định môn và dạng bài ngay trong 1ms:
   ```javascript
   export function fastClassifyProblem(deBai = '', lop = 'Lớp 2') {
     const text = (deBai || '').toLowerCase()
     let mon = 'Toán'
     let dang_bai = 'Toán có lời văn, phép tính lớp 1–3'
     let loi_hay_gap = 'Bố mẹ hay sốt ruột làm hộ phép tính trước khi con kịp hiểu đề'

     if (/english|tiếng anh|choose|fill in|what|where|how many|sentence|word/i.test(text)) {
       mon = 'Tiếng Anh'
       dang_bai = /grammar|verb|is|are|am|do|does/i.test(text) ? 'Tiếng Anh ngữ pháp, mẫu câu' : 'Tiếng Anh từ vựng'
       loi_hay_gap = 'Con chưa nhớ nghĩa từ hoặc nhầm vị trí giới từ'
     } else if (/vần|tiếng việt|tập đọc|chính tả|đoạn văn|tập làm văn|từ đồng nghĩa/i.test(text)) {
       mon = 'Tiếng Việt'
       dang_bai = /đoạn văn|đọc hiểu|tập làm văn/i.test(text) ? 'Tiếng Việt đọc hiểu, viết đoạn' : 'Tiếng Việt lớp 1–2 (âm, vần, đọc)'
       loi_hay_gap = 'Con dễ lẫn lộn các vần gần giống nhau hoặc viết câu chưa đủ chủ ngữ'
     } else if (/chu vi|diện tích|mét vuông|chiều dài|chiều rộng|hình chữ nhật|hình vuông/i.test(text)) {
       mon = 'Toán'
       dang_bai = 'Toán áp dụng công thức (chu vi, diện tích lớp 3–5)'
       loi_hay_gap = 'Con hay quên nhân đôi hoặc nhầm đơn vị đo'
     } else if (/phân số|số chẵn|số lẻ|chia hết|dãy số/i.test(text)) {
       mon = 'Toán'
       dang_bai = 'Toán khái niệm mới (số chẵn, chia hết, phân số)'
       loi_hay_gap = 'Con chưa nhìn ra quy luật số'
     }

     return { mon, lop, dang_bai, loi_hay_gap }
   }
   ```

2. **Hàm `aiExplain(ocr, child, tone, parentNote)`:**
   - Điền template với dữ liệu phân loại.
   - Gọi Cloudflare AI Gateway `POST /chat`.
   - Bóc tách JSON với cơ chế tự động thử lại 1 lần nếu gặp sự cố format.
   - Chuẩn hóa đầu ra hỗ trợ cả `cac_bac` (mới) và `steps` (cũ):
     - `s.hint`: Gợi ý mức 1 (đồ vật thật trong nhà)
     - `s.hint2`: Gợi ý mức 2 (vẽ hình / sơ đồ đoạn thẳng)
     - `brotherProblem`: Bài anh em cùng dạng
     - `teachBack`: Câu hỏi "Con dạy lại mẹ"
     - `fiveMinGame`: Trò chơi ôn bài 5 phút

---

### BƯỚC 5: GIAO DIỆN `src/PromptStudioTab.jsx`

1. **Bảng màu & Biểu tượng các biến (`PARAM_CONFIG`):**
   - `{{lop}}` : Xanh ngọc (`#10B981` · 🎒)
   - `{{sach}}` : Xanh dương (`#3B82F6` · 📚)
   - `{{giong}}` : Tím violet (`#8B5CF6` · 🗣️)
   - `{{mo_ta_giong}}` : Hồng cánh sen (`#D946EF` · ✨)
   - `{{de_bai}}` : Vàng cam (`#F59E0B` · 📝)
   - `{{khung_ghi_chu}}` : Đỏ hồng (`#F43F5E` · 📌)
   - `{{ghi_chu}}` : Xanh mòng két (`#14B8A6` · 💬)
   - `{{mon}}` : Xanh da trời (`#0284C7` · 📘)
   - `{{dang_bai}}` : Vàng hổ phách (`#D97706` · 🎯)
   - `{{loi_hay_gap}}` : Đỏ san hô (`#E11D48` · ⚠️)
   - `{{doan_phuong_phap}}` : Tím hoa cà (`#9333EA` · 💡)

2. **Cơ chế chèn biến tại vị trí con trỏ chuột:**
   ```javascript
   const handleInsertParam = (paramTag) => {
     const el = textareaRef.current
     if (!el) return
     const start = el.selectionStart ?? el.value.length
     const end = el.selectionEnd ?? el.value.length
     const currentVal = el.value || ''
     const newVal = currentVal.substring(0, start) + paramTag + currentVal.substring(end)
     setDrafts((prev) => ({ ...prev, [selectedKey]: newVal }))
     setTimeout(() => {
       el.focus()
       const nextPos = start + paramTag.length
       el.setSelectionRange(nextPos, nextPos)
     }, 15)
   }
   ```
   *Lưu ý:* Trên các nút chèn biến, bắt buộc dùng `onMouseDown={(e) => e.preventDefault()}` để không làm mất tiêu điểm con trỏ trong Textarea.

3. **Chế độ soạn thảo 2 lớp (Dual-layer Highlighter):**
   - Lớp dưới: `div` đồng bộ vị trí cuộn `scrollTop`, tô màu nền và gạch chân nổi bật riêng cho từng biến bằng thẻ `<mark>`.
   - Lớp trên: `textarea` trong suốt (`background: transparent`, `color: #1E293B`, `caretColor: #2563EB`) giúp người dùng gõ chữ hoàn toàn bình thường mà các biến vẫn phát sáng rõ ràng.
   - Nút chuyển chế độ: `[ ✏️ Soạn thảo ]` và `[ 👁️ Xem nổi bật biến ]`.

4. **Test Bench kiểm định tự động:**
   - Cho phép chọn Môn (Toán, Tiếng Việt, Tiếng Anh), Lớp, Bộ sách, Giọng, Đề bài mẫu.
   - Nút **▶ Chạy thử nghiệm** gọi trực tiếp AI Gateway và tự động kiểm định:
     1. JSON hợp lệ
     2. Đủ 2 đến 4 bậc câu hỏi gợi mở
     3. Có đáp án đối chiếu cho bố mẹ
     4. Có bài anh em cùng dạng
     5. Có trò chơi 5 phút ôn bài
     6. Có câu "Con dạy lại mẹ"
     7. Thời gian chạy dưới 30 giây

---

### BƯỚC 6: TỔNG HỢP CÁC LỖI THỰC TẾ ĐÃ FIX (CRITICAL GOTCHAS)

1. **Tuyệt đối không import `postChat` từ `src/api.js`:**
   `src/api.js` chỉ export `dbKvGet`, `dbKvSet`, `aiExplain`, v.v. Test Bench trong `PromptStudioTab.jsx` gọi `fetch` trực tiếp tới endpoint `/chat`.
2. **Khắc phục triệt để lỗi OCR nhảy về bài mẫu 3 hộp bút:**
   - Trong `src/screens.jsx`, gỡ bỏ hoàn toàn logic fallback tự động gán bài mẫu.
   - Trong `src/api.js`, triển khai cơ chế 2 tầng: Tầng 1 gọi Llama 3.2 11B Vision qua `/vision/analyze` để đọc chữ viết tay tiếng Việt và sách giáo khoa; Tầng 2 mới fallback `/vision/ocr`. Kết quả đưa thẳng vào state để bố mẹ soát bài.
3. **Biến `{{khung_ghi_chu}}` bị `undefined`:**
   Nếu phụ huynh không nhập ghi chú, bắt buộc phải gán `khungGhiChu = ''` (chuỗi rỗng), tuyệt đối không để nguyên `undefined` làm hỏng ngữ pháp câu lệnh AI.
4. **Bóc tách JSON phản hồi từ Cloudflare Gateway:**
   AI thường trả về markdown fence ` ```json ... ``` `. Bắt buộc dùng regex `const m = rawText.match(/\{[\s\S]*\}/)` rồi mới `JSON.parse(m[0])`.
5. **Lọc tiền tố nhận diện đồ chơi (`aiAnalyzeToy`):**
   AI thường trả lời nguyên câu ("trong ảnh là một cây bút chì"). Phải dùng regex lọc bỏ tiền tố trước khi đưa vào hàm ghép minigame.
6. **Điều hướng trên mobile (`admin-bottom-nav`):**
   Khi thêm tab Prompt Studio vào thanh desktop, phải thêm đồng thời vào thanh điều hướng mobile phía dưới.
7. **Bảo mật lưu trữ:**
   Bắt buộc yêu cầu nhập `PROMPT_ADMIN_KEY` trước khi lưu lên Cloudflare D1 KV (`prompt_studio:config`), và chỉ lưu trong bộ nhớ tạm của tab trình duyệt.

---

### BƯỚC 7: CHECKLIST KIỂM THỬ NGHIỆM THU (VERIFICATION)

1. **Biên dịch:** Chạy `npm run build` thành công 100% với 0 lỗi linter và 0 lỗi missing export.
2. **Kiểm tra chèn biến:** Nhấp con trỏ vào giữa một câu bất kỳ trong prompt `p3_explain`, bấm vào chip `{{mon}}`. Xác nhận `{{mon}}` xuất hiện đúng ngay vị trí con trỏ và con trỏ tự động nhảy ra sau biến.
3. **Kiểm tra màu sắc biến:** Xác nhận mỗi biến có màu sắc và icon riêng biệt, hiển thị lớp sáng phát quang tương ứng trong khung soạn thảo.
4. **Kiểm tra Test Bench:** Chọn Môn "Toán", Lớp "Lớp 2", bấm **▶ Chạy thử nghiệm**. Kết quả trả về JSON Socratic đầy đủ 4 bậc, có gợi ý mức 1 đồ vật, mức 2 hình vẽ, bài anh em, trò chơi 5 phút và câu "Con dạy lại mẹ".
5. **Kiểm tra luồng kèm con thực tế:** Chụp một bài toán, vào màn hình "Hỏi con từng bước". Bấm "Con còn bí", kiểm tra xem gợi ý Mức 1 (đồ vật) và Mức 2 (vẽ hình) có hiển thị rõ ràng cho bố mẹ hay không.
