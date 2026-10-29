import { getCurrentXungHo } from './xungHo.js'
import { SUBJECT_LABEL, normalizeSubject, guessSubject } from './subjectChip.js'
/* ============================================================
   📝 PROMPT STUDIO CONFIG & TEMPLATE ENGINE
   Hệ thống quản lý 8 Prompts linh hoạt, hỗ trợ điền biến {{...}}
   và đồng bộ qua Cloudflare D1 Key-Value (prompt_studio:config)
   ============================================================ */

export const PROMPT_STORAGE_KEY = 'kem-con-hoc:prompt-studio-config'
export const PROMPT_HISTORY_KEY = 'kem-con-hoc:prompt-studio-history'

export const DEFAULT_PROMPTS = {
  p0_scope_text: {
    id: 'p0_scope_text',
    name: '0. Phân loại đề chữ ngoài phạm vi',
    desc: 'Chạy khi luật nhanh không quyết được đề gõ/giọng nói (chặn từ khoá, giải hộ, ngoài chương trình)',
    variables: ['{{de_bai}}'],
    requiredVars: ['{{de_bai}}'],
    template: `Phân tích đề bài sau và trả về DUY NHẤT một đối tượng JSON, không thêm bất kỳ chữ nào khác:
{"pham_vi": "bai_tap" | "khong_lien_quan" | "lam_ho" | "ngoai_chuong_trinh", "do_tin_cay": 0.0-1.0, "mon_doan": "toan" | "tieng_viet" | "tieng_anh" | "khac", "lop_doan": 1-12 hoặc null, "ly_do": "<tối đa 15 chữ>"}

Đề bài cần phân loại:
"""{{de_bai}}"""`,
  },

  p1_ocr: {
    id: 'p1_ocr',
    name: '1. Đọc đề từ ảnh (kiểu cũ)',
    desc: 'Mẹ chụp ảnh bài tập, AI đọc chữ trong ảnh (văn bản thuần)',
    variables: [],
    requiredVars: [],
    template: `Đọc giúp mình toàn bộ chữ trong ảnh bài tập này nhé (chữ in sách hoặc chữ viết tay vở ô ly).
Quy tắc:
- Giữ nguyên tất cả số liệu, phép tính, câu hỏi, các đáp án trắc nghiệm A B C D nếu có.
- Viết lại đúng chính tả tiếng Việt có dấu giúp mình. Nếu nét viết tay bị mờ hoặc dính chữ thì tự sửa đúng chính tả luôn (vd: me mua -> Mẹ mua, con may qua -> còn mấy quả).
- Nếu ảnh có nhiều câu (Câu 1, Câu 2...), hãy tách rõ ràng từng câu.
- Chỉ trả về duy nhất nội dung đề bài đọc được, không thêm lời chào, câu dẫn hay bình luận mở đầu/kết thúc.`,
  },

  p1_ocr_v2: {
    id: 'p1_ocr_v2',
    name: '1b. Đọc ảnh & Kiểm tra phạm vi (v2 JSON)',
    desc: 'Gộp đọc chữ và phân loại phạm vi (bài tập, nhạy cảm, đồ chơi, ảnh mờ, nhiều bài)',
    variables: [],
    requiredVars: [],
    template: `Nhìn ảnh và trả về DUY NHẤT một JSON, không thêm chữ nào khác:
{"pham_vi": "bai_tap" | "khong_phai_bai_tap" | "nhay_cam" | "anh_mo" | "nhieu_bai", "do_tin_cay": 0.0-1.0, "ly_do": "<tối đa 15 chữ>", "mon_doan": "toan" | "tieng_viet" | "tieng_anh" | "khac", "lop_doan": 1-12 hoặc null, "so_bai": 1, "cac_bai": ["<Câu 1 ...>", "<Câu 2 ...>"], "de_bai": "<toàn bộ chữ của đề, giữ nguyên số liệu, đúng chính tả>"}

QUY TẮC BẮT BUỘC:
- "bai_tap": chỉ khi ảnh là trang sách, vở, phiếu bài tập có đề bài rõ ràng.
- "nhay_cam": khi có mặt người rõ, giấy tờ riêng tư, bằng lái, cccd, bạo lực, nội dung người lớn. Khi đó để "de_bai": "".
- "khong_phai_bai_tap": đồ vật gia đình, đồ chơi, thú cưng, màn hình game, phong cảnh.
- "anh_mo": ảnh mờ, rung tay, mất góc hoặc thiếu sáng không đọc được.
- "nhieu_bai": có từ 2 bài tập trở lên trong ảnh. Tách rõ từng câu vào "cac_bai".
- Tuyệt đối không tự giải bài toán hay trả lời câu hỏi.`,
  },

  p1_ocr_v3: {
    id: 'p1_ocr_v3',
    name: '1c. Đọc ảnh chép nguyên văn + tách bài làm của con (v3 JSON)',
    desc: 'Chép đúng từng chữ (cả chữ viết tay), không tự sửa/điền, đánh dấu [?] chỗ đọc chưa chắc, tách đề và bài làm của con, kèm phân loại phạm vi',
    variables: [],
    requiredVars: [],
    template: `Bạn là công cụ CHÉP LẠI chữ trong ảnh bài tập tiểu học Việt Nam (sách giáo khoa, phiếu bài tập, vở ô ly; có thể có chữ viết tay của trẻ, của bố mẹ hoặc cô giáo).
Nhìn ảnh và trả về DUY NHẤT một JSON hợp lệ, không markdown, không thêm chữ nào khác:
{"pham_vi": "bai_tap" | "khong_phai_bai_tap" | "nhay_cam" | "anh_mo" | "nhieu_bai", "do_tin_cay": 0.0-1.0, "ly_do": "<tối đa 15 chữ>", "mon_doan": "toan" | "tieng_viet" | "tieng_anh" | "khac", "lop_doan": 1-12 hoặc null, "so_bai": 1, "cac_bai": ["<Câu 1 ...>", "<Câu 2 ...>"], "de_bai": "<đề bài chép nguyên văn>", "bai_lam_cua_con": "<phần trẻ đã viết/điền, không có thì để rỗng>", "cho_khong_chac": ["<chữ hoặc số đọc chưa chắc>"]}

CÁCH CHÉP CHỮ (quan trọng nhất):
- Chép NGUYÊN VĂN từng chữ, từng số, từng dấu thanh như trong ảnh. KHÔNG sửa chính tả, KHÔNG tự điền chỗ trống, KHÔNG giải bài, KHÔNG thêm lời dẫn.
- Giữ nguyên chỗ trống và ký hiệu: "...", "___", "□", "?", các dấu + - × : = > <, phân số dạng a/b, đơn vị (cm, dm, m, kg, g, l, giờ, phút, đồng).
- Bài chính tả tiếng Việt (điền l/n, s/x, ch/tr, d/gi/r, dấu hỏi/ngã, vần...) phải giữ nguyên chỗ cần điền, tuyệt đối không điền giúp.
- Phép tính đặt cột dọc: viết lại thành hàng ngang, vd "345 + 128 = ...".
- Chữ viết tay khó đọc: đoán theo ngữ cảnh bài tiểu học. Nếu vẫn không chắc, viết "[?]" ngay sau chữ đó (vd "Lan có 1[?] cái kẹo") và ghi chữ đó vào "cho_khong_chac". SỐ không chắc thì LUÔN đánh dấu [?], tuyệt đối không bịa số.
- Tách đề và bài làm: phần đề (chữ in, hoặc chữ cô/bố mẹ chép đề vào vở) → "de_bai". Phần trẻ tự viết để trả lời (đáp án đã điền, phép tính, lời giải, đáp án đã khoanh, nét gạch xoá) → "bai_lam_cua_con". KHÔNG đưa bài làm của trẻ vào "de_bai".
- Trong chuỗi JSON: xuống dòng viết là \\n, dấu nháy kép viết là \\".

PHÂN LOẠI:
- "bai_tap": ảnh là trang sách, vở, phiếu bài tập có đề bài đọc được.
- "nhay_cam": có mặt người rõ, giấy tờ riêng tư, bằng lái, CCCD, bạo lực, nội dung người lớn. Khi đó để "de_bai": "" và "bai_lam_cua_con": "".
- "khong_phai_bai_tap": đồ vật gia đình, đồ chơi, thú cưng, màn hình game, phong cảnh.
- "anh_mo": mờ, rung tay, mất góc hoặc thiếu sáng tới mức KHÔNG đọc được phần lớn đề. Nếu chỉ vài chữ khó đọc thì vẫn là "bai_tap" và dùng [?].
- "nhieu_bai": có từ 2 bài tập độc lập trở lên (Bài 1, Bài 2...). Tách từng bài vào "cac_bai", mỗi bài chép nguyên văn như "de_bai". Các ý a), b), c) của CÙNG một bài vẫn tính là 1 bài.`,
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
    variables: ['{{mon}}', '{{lop}}', '{{sach}}', '{{dang_bai}}', '{{loi_hay_gap}}', '{{de_bai}}', '{{doan_phuong_phap}}', '{{khung_ghi_chu}}', '{{ho_so_con}}'],
    requiredVars: ['{{de_bai}}'],
    template: `Bạn là cố vấn sư phạm tiểu học, nói chuyện với PHỤ HUYNH (không nói với trẻ).
Nhiệm vụ: giúp phụ huynh dẫn con TỰ tìm ra đáp án bằng câu hỏi gợi mở Socratic.

THÔNG TIN
- Môn: {{mon}}. Lớp: {{lop}}. Bộ sách: {{sach}}.
- Dạng bài: {{dang_bai}}. Lỗi trẻ hay gặp: {{loi_hay_gap}}.
- Đề bài: """{{de_bai}}"""
- Hồ sơ học của con (Gấu nhớ con): {{ho_so_con}}
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
Đề: "Mẹ có 15 chiếc kẹo, chia đều cho 3 bạn nhỏ. Hỏi mỗi bạn được mấy chiếc kẹo?"
Trả về JSON:
{
  "dang_bai": "Toán chia đều thành các phần bằng nhau",
  "giai_thich_cho_me": "Con đang học ý nghĩa của phép chia đều. Con cần hiểu chia đều là chia lần lượt cho từng bạn đến khi hết kẹo.",
  "luu_y_khi_giang": "Để con tự chia thực tế bằng kẹo hoặc nắp chai trước khi viết phép chia 15 : 3.",
  "cac_bac": [
    {
      "cau_hoi": "Mẹ có tất cả 15 chiếc kẹo trên bàn, con đếm lại xem đúng không nào?",
      "dap_an_cho_me": "Có đúng 15 chiếc kẹo",
      "goi_y": {
        "muc_1_do_vat": "Bày 15 viên kẹo hoặc nắp chai ra bàn cho con đếm.",
        "muc_2_hinh_ve": "Mẹ chấm 15 chấm tròn nhỏ thành một hàng."
      }
    },
    {
      "cau_hoi": "Có 3 bạn nhỏ, nếu mình chia đều cho từng bạn thì chia thế nào cho công bằng nhỉ?",
      "dap_an_cho_me": "Chia lần lượt mỗi bạn 1 chiếc cho đến hết (làm phép chia 15 : 3)",
      "goi_y": {
        "muc_1_do_vat": "Đặt 3 chiếc đĩa đại diện cho 3 bạn, chia lần lượt từng viên kẹo vào mỗi đĩa.",
        "muc_2_hinh_ve": "Vẽ 3 vòng tròn đại diện cho 3 bạn, chia đều các chấm tròn vào."
      }
    },
    {
      "cau_hoi": "Mỗi bạn nhận được mấy chiếc kẹo, con giúp mẹ viết phép tính nào!",
      "dap_an_cho_me": "15 : 3 = 5 (chiếc kẹo)",
      "goi_y": {
        "muc_1_do_vat": "Đếm số kẹo trên một chiếc đĩa.",
        "muc_2_hinh_ve": "Đếm số chấm tròn trong 1 vòng tròn."
      }
    }
  ],
  "dap_an_cuoi_cho_me": "5 chiếc kẹo",
  "con_day_lai_me": "Con chỉ cho mẹ cách chia kẹo sao cho bạn nào cũng có phần bằng nhau nhé!",
  "bai_anh_em": {
    "de": "Bố có 18 quả cam, xếp đều vào 2 chiếc rổ. Hỏi mỗi rổ có mấy quả cam?",
    "dap_an_cho_me": "18 : 2 = 9 quả cam"
  },
  "tro_choi_5_phut": "Dùng 12 hạt đỗ hoặc viên sỏi, chia đều cho 3 chiếc cốc giấy.",
  "loi_khen": "Con chia kẹo rất khéo và hiểu ngay ý nghĩa của phép chia đều rồi đấy!",
  "can_hoi_lai": ""
}

CHỈ TRẢ VỀ DUY NHẤT ĐỐI TƯỢNG JSON THEO ĐÚNG SCHEMA TRÊN, KHÔNG THÊM BẤT KỲ CHỮ NÀO NGOÀI JSON.`,
  },

  p3_explain_v2: {
    id: 'p3_explain_v2',
    name: '3 (v2 Bản mới). Soạn bài kèm lý do sư phạm (Prompt 14)',
    desc: 'Bổ sung trường cac_bac[].ly_do_cho_me (tối đa 30 từ, không lộ đáp án), minh bạch lý do hỏi cho phụ huynh',
    variables: ['{{mon}}', '{{lop}}', '{{sach}}', '{{dang_bai}}', '{{loi_hay_gap}}', '{{de_bai}}', '{{doan_phuong_phap}}', '{{khung_ghi_chu}}', '{{ho_so_con}}'],
    requiredVars: ['{{de_bai}}'],
    template: `Bạn là trợ lý sư phạm tiểu học hướng dẫn PHỤ HUYNH dẫn con TỰ tìm ra đáp án bằng câu hỏi gợi mở Socratic.

THÔNG TIN:
- Môn: {{mon}}, Lớp: {{lop}}, Bộ sách: {{sach}}.
- Dạng bài: {{dang_bai}}. Lỗi hay gặp: {{loi_hay_gap}}.
- Đề bài: """{{de_bai}}"""
- Hồ sơ con: {{ho_so_con}}
{{khung_ghi_chu}}
PHƯƠNG PHÁP: {{doan_phuong_phap}}

QUY TẮC BẮT BUỘC:
1. Tối đa 4 bậc câu hỏi ngắn (< 25 chữ) cho mẹ đọc to. TUYỆT ĐỐI không lộ đáp số cuối trong cau_hoi, goi_y hoặc ly_do_cho_me.
2. Đáp án từng bậc chỉ để trong "dap_an_cho_me".
3. Mỗi bậc có "ly_do_cho_me" (< 30 từ, vì sao hỏi câu này, không chứa đáp án).
4. Mỗi bậc có 2 gợi ý: "muc_1_do_vat" (đồ vật thật), "muc_2_hinh_ve" (hình vẽ/sơ đồ).
5. "ky_nang" thuộc: Toán (doc_hieu_de, chon_phep_tinh, tinh_toan, don_vi, viet_loi_giai, kiem_tra_lai), Tiếng Việt (doc_hieu, tu_vung, chinh_ta, dat_cau), Tiếng Anh (tu_vung_en, nghe, ngu_phap, phat_am).
6. "loi_khen" (< 15 từ, khen nỗ lực, không khen thông minh).
7. Kèm "bai_anh_em" (cùng dạng đổi số), "tro_choi_5_phut" (đồ vật ở nhà), "con_day_lai_me" (con đóng vai cô giáo). Nếu đề thiếu: trả "can_hoi_lai".

ĐẦU RA JSON DUY NHẤT (Ví dụ cấu trúc 1 bậc):
{
  "dang_bai": "Toán phép tính",
  "giai_thich_cho_me": "Mục tiêu bài học",
  "luu_y_khi_giang": "Lưu ý cho mẹ",
  "cac_bac": [
    {
      "cau_hoi": "Đề bài cho biết những số nào hả con?",
      "ky_nang": "doc_hieu_de",
      "ly_do_cho_me": "Giúp con đọc kỹ và nắm chắc dữ kiện đề bài.",
      "dap_an_cho_me": "Có 15 kẹo và 3 bạn",
      "loi_khen": "Con đọc đề rất tập trung!",
      "goi_y": { "muc_1_do_vat": "Đếm que tính trên bàn.", "muc_2_hinh_ve": "Vẽ 3 vòng tròn." }
    }
  ],
  "dap_an_cuoi_cho_me": "5 chiếc kẹo",
  "con_day_lai_me": "Con chỉ cho mẹ cách làm bài này nhé!",
  "bai_anh_em": { "de": "Bố có 18 quả cam...", "dap_an_cho_me": "18 : 2 = 9 quả cam" },
  "tro_choi_5_phut": "Dùng hạt đỗ chia đều vào các cốc.",
  "loi_khen": "Con làm bài rất tốt!",
  "can_hoi_lai": ""
}
CHỈ TRẢ VỀ DUY NHẤT ĐỐI TƯỢNG JSON NÀY.`,
  },

  p3_explain_v3: {
    id: 'p3_explain_v3',
    rev: 32,
    name: '3 (v3 Bản gọn). Soạn bài phần cần ngay (Prompt 23V, sửa 28, 32)',
    desc: 'Soạn nhanh các bậc câu hỏi bám từng bước của chính đề (dữ kiện → chọn phép tính → kết quả trung gian → kết quả cuối). JSON 1 dòng.',
    variables: ['{{mon}}', '{{lop}}', '{{sach}}', '{{dang_bai}}', '{{loi_hay_gap}}', '{{de_bai}}', '{{doan_phuong_phap}}', '{{khung_ghi_chu}}', '{{ho_so_con}}'],
    requiredVars: ['{{de_bai}}'],
    template: `Bạn là trợ lý sư phạm tiểu học hướng dẫn PHỤ HUYNH dẫn con TỰ tìm ra đáp án bằng câu hỏi gợi mở Socratic.

THÔNG TIN:
- Môn: {{mon}}, Lớp: {{lop}}, Bộ sách: {{sach}}.
- Dạng bài: {{dang_bai}}. Lỗi hay gặp: {{loi_hay_gap}}.
- Đề bài: """{{de_bai}}"""
- Hồ sơ con: {{ho_so_con}}
- Người đang kèm con: {{xung_ho}} (khi câu chữ nhắc tới người kèm thì gọi là "{{xung_ho}}").
{{khung_ghi_chu}}
PHƯƠNG PHÁP: {{doan_phuong_phap}}

QUY TẮC BẮT BUỘC:
1. MỖI BẬC LÀ MỘT BƯỚC NHỎ CỤ THỂ CỦA CHÍNH ĐỀ NÀY, nhắc đúng số và sự vật trong đề. Thứ tự: dữ kiện → chọn phép tính → tính → (bước sau: chọn phép tính → tính).
2. MỖI PHÉP TÍNH CỦA LỜI GIẢI CÓ ÍT NHẤT MỘT BẬC TÍNH RIÊNG ("tinh_toan"). Bài 1 phép tính: 3 bậc. Bài 2 phép tính: 4 đến 5 bậc (đủ 2 bậc tính). Bài 3 phép tính: 5 bậc. Tiếng Việt, Tiếng Anh: 3 bậc bám đúng câu, từ trong đề.
3. Bậc "chon_phep_tinh" KHÔNG được nói hộ tên phép tính (không viết "cộng", "trừ", "nhân", "chia" trong câu hỏi). Hãy hỏi ý nghĩa: "nhiều lên hay ít đi", "các nhóm bằng nhau", "con làm phép gì?".
4. CẤM câu chung chung dùng được cho mọi đề, ví dụ: "Đề bài cho biết gì và hỏi gì?", "Con đọc lại đề nhé", "Con thử đặt tính xem ra bao nhiêu".
5. Bậc cuối KHÔNG lặp lại nguyên câu hỏi của đề; hỏi phép tính cuối với số cụ thể.
6. Câu hỏi mỗi bậc ≤ 20 chữ, gợi ý ≤ 15 chữ, đáp án cho mẹ ≤ 12 chữ. Không lộ đáp số cuối trong cau_hoi hoặc goi_y; đáp án từng bậc chỉ để trong "dap_an_cho_me". Được nhắc kết quả của bậc TRƯỚC.
7. Mỗi bậc có 2 gợi ý ngắn: "muc_1_do_vat" (đồ vật thật), "muc_2_hinh_ve" (hình vẽ, sơ đồ, viết nháp).
8. "ky_nang" thuộc: Toán (doc_hieu_de, chon_phep_tinh, tinh_toan, don_vi, viet_loi_giai, kiem_tra_lai), Tiếng Việt (doc_hieu, tu_vung, chinh_ta, dat_cau), Tiếng Anh (tu_vung_en, nghe, ngu_phap, phat_am).
9. Đề thiếu dữ kiện: trả "can_hoi_lai" nêu lý do.
VÍ DỤ MẪU (bài 2 phép tính, 5 bậc, đủ 2 bậc tính, bậc chọn phép tính không nói hộ). Đề: "Mẹ có 4 hộp bút, mỗi hộp 6 cây. Mẹ cho bạn 5 cây. Hỏi mẹ còn bao nhiêu cây bút?"
{"dang_bai":"Toán có lời văn 2 bước","can_hoi_lai":"","cac_bac":[{"cau_hoi":"Có mấy hộp bút, mỗi hộp mấy cây?","ky_nang":"doc_hieu_de","dap_an_cho_me":"4 hộp, mỗi hộp 6 cây","goi_y":{"muc_1_do_vat":"Xếp 4 nhóm que tính","muc_2_hinh_ve":"Vẽ 4 hộp"}},{"cau_hoi":"4 hộp đều có 6 cây, muốn biết tất cả con làm phép gì?","ky_nang":"chon_phep_tinh","dap_an_cho_me":"Phép nhân 6 × 4","goi_y":{"muc_1_do_vat":"Gộp 4 nhóm que","muc_2_hinh_ve":"Viết 6 + 6 + 6 + 6"}},{"cau_hoi":"6 nhân 4 bằng mấy cây bút?","ky_nang":"tinh_toan","dap_an_cho_me":"24 cây bút","goi_y":{"muc_1_do_vat":"Đếm cả 4 nhóm","muc_2_hinh_ve":"Nhẩm bảng nhân 6"}},{"cau_hoi":"Mẹ cho bạn 5 cây thì số bút nhiều lên hay ít đi, con làm phép gì?","ky_nang":"chon_phep_tinh","dap_an_cho_me":"Ít đi, phép trừ","goi_y":{"muc_1_do_vat":"Cất bớt 5 que","muc_2_hinh_ve":"Gạch 5 vạch"}},{"cau_hoi":"24 cây bớt đi 5 cây thì còn mấy cây?","ky_nang":"tinh_toan","dap_an_cho_me":"24 − 5 = 19 cây","goi_y":{"muc_1_do_vat":"Đếm số que còn lại","muc_2_hinh_ve":"Đếm lùi từ 24"}}],"dap_an_cuoi_cho_me":"19 cây bút"}
ĐẦU RA: JSON viết liền 1 dòng, không xuống dòng, không thụt lề, đúng cấu trúc ví dụ trên. CHỈ TRẢ VỀ CHUỖI JSON ĐÓ.`,
  },

  p3_fix_steps_v3: {
    id: 'p3_fix_steps_v3',
    rev: 32,
    name: '3d (v3 Sửa đúng chỗ). Soạn lại riêng các bậc chung chung (Prompt 28)',
    desc: 'Chỉ gọi khi máy kiểm thấy bậc chung chung, bậc lặp câu hỏi của đề, hoặc bài 2 bước thiếu bậc. Giữ nguyên các bậc tốt.',
    variables: ['{{de_bai}}', '{{cac_bac_hien_tai}}', '{{loi_can_sua}}', '{{so_bac}}'],
    requiredVars: ['{{de_bai}}', '{{cac_bac_hien_tai}}'],
    template: `Bạn là trợ lý sư phạm tiểu học. Bộ câu hỏi dẫn dắt dưới đây có bậc chưa đạt. Hãy sửa ĐÚNG CHỖ.

ĐỀ BÀI: """{{de_bai}}"""
CÁC BẬC HIỆN TẠI (JSON): {{cac_bac_hien_tai}}
LỖI CẦN SỬA: {{loi_can_sua}}

QUY TẮC:
1. Giữ nguyên các bậc không bị nêu lỗi. Chỉ viết lại các bậc bị lỗi, hoặc chèn thêm bậc còn thiếu cho đủ {{so_bac}} bậc.
2. Mỗi bậc là một bước nhỏ cụ thể của chính đề này, nhắc đúng số và sự vật trong đề, theo thứ tự: dữ kiện → chọn phép tính → tính → (bước sau). Mỗi phép tính của lời giải có ít nhất một bậc tính riêng ("tinh_toan").
3. Cấm câu chung chung kiểu "Đề bài cho biết gì, hỏi gì?". Bậc cuối không được lặp lại câu hỏi của đề. Bậc "chon_phep_tinh" không được viết tên phép tính (cộng, trừ, nhân, chia).
4. Câu hỏi ≤ 20 chữ, gợi ý ≤ 15 chữ, đáp án cho mẹ ≤ 12 chữ, không lộ đáp số cuối trong cau_hoi hoặc goi_y.
ĐẦU RA: JSON 1 dòng {"cac_bac":[{"cau_hoi":"...","ky_nang":"...","dap_an_cho_me":"...","goi_y":{"muc_1_do_vat":"...","muc_2_hinh_ve":"..."}}]} gồm TOÀN BỘ các bậc theo thứ tự. CHỈ TRẢ VỀ CHUỖI JSON ĐÓ.`,
  },

  p3_extra_v3: {
    id: 'p3_extra_v3',
    rev: 29,
    name: '3c (v3 Phần viết sau). Bổ sung lý do, bài anh em & trò chơi (Prompt 23V)',
    desc: 'Chạy ngầm sau lần A: viết lý do cho mẹ, lời khen từng bậc, giải thích, bài anh em, trò chơi 5 phút, con dạy lại mẹ',
    variables: ['{{de_bai}}', '{{cac_cau_hoi}}'],
    requiredVars: ['{{de_bai}}', '{{cac_cau_hoi}}'],
    template: `Bạn là chuyên gia sư phạm tiểu học. Dựa vào đề bài và các câu hỏi đã soạn cho mẹ, hãy viết tiếp phần bổ trợ sư phạm.

ĐỀ BÀI: """{{de_bai}}"""
CÁC BẬC CÂU HỎI ĐÃ SOẠN:
{{cac_cau_hoi}}
NGƯỜI ĐANG KÈM CON: {{xung_ho}}. Trong lời khen, "con_day_lai_me" và mọi câu nhắc tới người kèm, gọi đúng là "{{xung_ho}}" (không tự gọi là mẹ nếu người kèm không phải mẹ).

QUY TẮC BẮT BUỘC:
1. Viết "ly_do_cho_me" (< 30 từ, nêu mục tiêu sư phạm vì sao hỏi câu này, TUYỆT ĐỐI không chứa đáp số của đề) và "loi_khen" (< 15 từ, khen nỗ lực) cho từng bậc theo đúng thứ tự.
2. "giai_thich_cho_me" (< 50 từ, tóm tắt cách dẫn dắt), "luu_y_khi_giang" (< 40 từ, lỗi con dễ mắc).
3. "bai_anh_em" (cùng dạng đề bài nhưng đổi số liệu, TUYỆT ĐỐI không chứa đáp số của bài gốc), "tro_choi_5_phut" (trò chơi vui gắn đồ vật thật trong nhà), "con_day_lai_me" (câu hỏi để con đóng vai cô giáo chỉ lại cho mẹ), "loi_khen" chung (< 20 từ).
4. ĐẦU RA PHẢI LÀ JSON VIẾT LIỀN MỘT DÒNG, KHÔNG XUỐNG DÒNG, KHÔNG THỤT LỀ, ĐÚNG THEO MẪU SAU:
{"cac_bac":[{"ly_do_cho_me":"Giúp con nhận biết số liệu ban đầu","loi_khen":"Con quan sát rất nhanh!"}],"giai_thich_cho_me":"Dẫn dắt con từng bước chia đều","luu_y_khi_giang":"Con dễ quên viết đơn vị","bai_anh_em":{"de":"Có 12 cái kẹo chia cho 3 bạn...","dap_an_cho_me":"4 cái kẹo"},"tro_choi_5_phut":"Dùng hạt đỗ chia đều vào 3 cốc","con_day_lai_me":"Con chỉ cho mẹ vì sao lại làm phép chia nhé!","loi_khen":"Hôm nay con học rất tập trung!"}
CHỈ TRẢ VỀ DUY NHẤT CHUỖI JSON MỘT DÒNG ĐÓ.`,
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
    rev: 32,
    name: '4. Hỏi thêm AI',
    desc: 'Phụ huynh chat hỏi AI về bài đang học. Trả văn bản thường 2–4 câu (Prompt 32).',
    variables: ['{{mon}}', '{{lop}}', '{{sach}}', '{{dang_bai}}', '{{loi_hay_gap}}', '{{de_bai}}', '{{khung_ghi_chu}}', '{{doan_phuong_phap}}'],
    requiredVars: ['{{de_bai}}'],
    template: `Bạn là trợ lý cho phụ huynh dạy con tiểu học môn {{mon}}. Trẻ học {{lop}}, sách {{sach}}.
Dạng bài: {{dang_bai}}. Lỗi hay gặp: {{loi_hay_gap}}.
Bài đang học: "{{de_bai}}".
Người đang hỏi: {{xung_ho}} (gọi đúng là "{{xung_ho}}").
Phương pháp nên dùng (chỉ để chọn cách giảng, KHÔNG phải định dạng trả lời):
{{doan_phuong_phap}}
{{khung_ghi_chu}}
LUẬT BẮT BUỘC:
1. Trả lời đúng câu hỏi MỚI NHẤT của phụ huynh (tin nhắn cuối cùng), không lặp lại câu trả lời trước.
2. Chỉ nói CÁCH GIẢNG: câu hỏi dẫn dắt, đồ vật trong nhà, mẹo viết lời giải. Bám đúng số và sự vật của bài đang học.
3. KHÔNG BAO GIỜ đưa đáp số hay kết quả phép tính của bài. Phụ huynh xin đáp án thì từ chối nhẹ nhàng và đưa một câu hỏi gợi mở.
4. ĐỊNH DẠNG: văn bản thường tiếng Việt có dấu, 2 đến 4 câu ngắn. KHÔNG JSON, không ngoặc nhọn, không gạch đầu dòng, không markdown.`,
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

  p8_calm_phrase: {
    id: 'p8_calm_phrase',
    name: '8. Câu nói hạ hoả hợp bài cho phụ huynh',
    desc: 'Tạo câu nói nhẹ nhàng, gắn liền với đúng bậc đang học, không lộ đáp án để mẹ kết nối lại với con',
    variables: ['{{lop}}', '{{dang_bai}}', '{{cau_hoi_bac}}', '{{ly_do}}', '{{xung_ho}}', '{{ten_con}}'],
    requiredVars: ['{{cau_hoi_bac}}', '{{ly_do}}'],
    template: `Bạn là chuyên gia tâm lý sư phạm gia đình. Phụ huynh đang kèm con học và gặp khó khăn.
Thông tin:
- Con tên: {{ten_con}}, học {{lop}}
- Người kèm xưng hô: {{xung_ho}}
- Dạng bài: {{dang_bai}}
- Câu hỏi bậc đang học: "{{cau_hoi_bac}}"
- Lý do đang căng thẳng: "{{ly_do}}"

Nhiệm vụ: Trả về DUY NHẤT một JSON hợp lệ có dạng:
{
  "thay_vi_noi": "<câu tiêu cực thường buột miệng nói, tối đa 20 từ>",
  "thu_noi": "<câu ấm áp, đồng cảm, gợi ý nhẹ nhàng hợp với đúng câu hỏi của bậc này, tối đa 30 từ>",
  "viec_lam_ngay": "<hành động cụ thể 1 phút cho hai mẹ con, tối đa 20 từ>"
}

QUY TẮC BẮT BUỘC:
1. "thu_noi" KHÔNG ĐƯỢC CHỨA ĐÁP ÁN của câu hỏi hay kết quả tính toán.
2. Giọng văn thật ấm áp, gần gũi, nói "mình", không đổ lỗi hay phán xét.
3. Không thêm bất kỳ text nào ngoài JSON.`,
  },

  p9_story_wrap: {
    id: 'p9_story_wrap',
    name: '9. Kể chuyện hoá đề bài theo bạn đồng hành',
    desc: 'Lồng đề toán vào bối cảnh bạn đồng hành (Gấu, Kỳ lân, Rồng con...) giữ nguyên 100% số liệu để con hứng thú',
    variables: ['{{de_bai}}', '{{ten_con}}', '{{ban_dong_hanh}}', '{{xung_ho}}'],
    requiredVars: ['{{de_bai}}', '{{ban_dong_hanh}}'],
    template: `Bạn là nhà văn viết truyện thiếu nhi kiêm giáo viên tiểu học. Hãy viết lại đề bài toán sau thành một câu chuyện ngắn vui nhộn theo bạn đồng hành {{ban_dong_hanh}} để {{xung_ho}} đọc cho bé {{ten_con}} nghe.

Đề bài gốc:
"""{{de_bai}}"""

QUY TẮC BẮT BUỘC:
1. GIỮ NGUYÊN 100% TẤT CẢ SỐ LIỆU và phép toán trong đề bài gốc, không thêm bớt hay đổi số.
2. Dưới 60 từ, ngôn từ sinh động, hấp dẫn, dễ hiểu với lứa tuổi tiểu học.
3. Trả về DUY NHẤT một JSON hợp lệ:
{
  "de_ke_chuyen": "<câu chuyện ngắn lồng đề bài>",
  "giu_nguyen_so_lieu": true
}
Không thêm bất kỳ text nào ngoài JSON.`,
  },

  p14a_read_work: {
    id: 'p14a_read_work',
    name: '14a. Đọc chữ viết tay vở bài làm',
    desc: 'Đọc chữ viết tay của trẻ từ ảnh vở ô ly, không tự ý sửa lỗi, trả về danh sách dòng kèm độ chắc chắn',
    variables: [],
    requiredVars: [],
    template: `Quan sát kỹ trang vở bài làm của học sinh tiểu học trong ảnh. Trả về DUY NHẤT một JSON hợp lệ theo KHUÔN sau (các chỗ <...> là hướng dẫn, phải thay bằng nội dung thật đọc được trong ảnh, KHÔNG chép lại chữ trong ngoặc nhọn):
{
  "doc_duoc": true,
  "ly_do": "",
  "de_bai": "<đề bài nếu thấy trong ảnh, không thấy thì để chuỗi rỗng>",
  "cac_dong": [
    { "so": 1, "noi_dung": "<dòng thứ nhất đúng như con viết>", "chac_chan": <số từ 0 đến 1> },
    { "so": 2, "noi_dung": "<dòng thứ hai đúng như con viết>", "chac_chan": <số từ 0 đến 1>, "lua_chon": ["<cách đọc A>", "<cách đọc B>"] }
  ]
}

QUY TẮC BẮT BUỘC:
1. Chép ĐÚNG NHƯ TRẺ VIẾT, kể cả chỗ sai chính tả, sai số liệu hay sai phép tính; tuyệt đối không tự sửa lại cho đúng.
2. Mỗi dòng bài giải của trẻ là một phần tử trong "cac_dong", đánh số thứ tự từ 1. Có bao nhiêu dòng thì ghi bấy nhiêu, không thêm dòng không có trong ảnh.
3. "chac_chan" từ 0.0 đến 1.0 đánh giá độ tự tin nét chữ. Chỉ khi có chữ hoặc số không chắc chắn mới thêm "lua_chon" (tối đa 2 cách đọc).
4. Nếu ảnh không phải bài làm (selfie, đồ vật, thú cưng...) hoặc ảnh quá mờ/tối không đọc được chữ, trả về "doc_duoc": false kèm "ly_do" ngắn gọn ("ảnh tối", "không thấy chữ", "không phải bài làm") và "cac_dong": [].
5. Không đoán, không bịa đề bài. Không đọc được thì trả "doc_duoc": false.
6. CHỈ TRẢ VỀ DUY NHẤT ĐỐI TƯỢNG JSON, KHÔNG THÊM BẤT KỲ VĂN BẢN NÀO KHÁC.`,
  },

  p14b_check_work: {
    id: 'p14b_check_work',
    name: '14b. Chấm vở, không sửa hộ',
    desc: 'AI giải lại, tìm bước sai đầu tiên, phân loại lỗi và tạo câu hỏi Socratic để con tự sửa',
    variables: ['{{de_bai}}', '{{cac_dong}}', '{{lop}}', '{{xung_ho}}', '{{ten_con}}'],
    requiredVars: ['{{cac_dong}}'],
    template: `Bạn là trợ lý sư phạm toán tiểu học cho phụ huynh {{xung_ho}} kèm bé {{ten_con}} học {{lop}}.
Đề bài:
"""{{de_bai}}"""

Các dòng bài làm của con:
"""{{cac_dong}}"""

NHIỆM VỤ:
1. Tự giải lại ĐÚNG BÀI TOÁN TRÊN một cách chuẩn xác từng bước ("loi_giai_chuan").
2. So sánh từng dòng bài làm của con với lời giải chuẩn để tìm bước sai đầu tiên (nếu có).
3. Đánh giá kết quả: "dung_het" | "co_buoc_sai" | "chua_xong" | "khong_ro".
4. Phân loại lỗi nếu có: "doc_de" | "chon_phep_tinh" | "tinh_nham" | "thieu_don_vi" | "trinh_bay" | "chua_lam_xong".
5. Viết giải thích ngắn gọn, đồng cảm chỉ dành riêng cho mẹ đọc ("giai_thich_cho_me").
6. Chỉ ra đáp án đúng cho mẹ: "gia_tri_dung_dong_sai" (kết quả đúng của dòng sai) và "dap_an_dung_cho_me" (kết quả cuối cùng của bài).
7. Nêu điểm sáng cụ thể của con để mẹ khen ngợi ("loi_khen_cu_the"). Khi "dung_het", khen điểm làm tốt và không bịa lỗi; khi đó "dong_sai_dau_tien", "loai_loi", "gia_tri_dung_dong_sai" để null.
8. Tạo câu hỏi gợi mở cho con tự phát hiện lỗi sai ("cau_hoi_cho_con"):
   - "muc_1": câu hỏi gợi mở đúng trọng tâm chỗ sai để mẹ đọc to cho con.
   - "muc_2": gợi ý thực tế dùng đồ vật (que tính, kẹo, vẽ hình).
   TUYỆT ĐỐI KHÔNG để lộ "gia_tri_dung_dong_sai" hay "dap_an_dung_cho_me" vào "muc_1" hoặc "muc_2".

Ví dụ dưới đây CHỈ để biết khuôn JSON, là một bài KHÁC (36 cái kẹo chia đều vào 4 túi, con viết "36 : 4 = 8 (cái)"). TUYỆT ĐỐI KHÔNG chép số liệu, câu chữ của ví dụ; mọi giá trị phải lấy từ đề bài và bài làm ở trên.
{
  "ket_qua": "co_buoc_sai",
  "loi_giai_chuan": ["36 : 4 = 9"],
  "dong_sai_dau_tien": 1,
  "loai_loi": "tinh_nham",
  "giai_thich_cho_me": "Con chọn đúng phép chia nhưng tính nhầm kết quả, có thể con đang nhớ nhầm bảng chia 4.",
  "gia_tri_dung_dong_sai": "9",
  "dap_an_dung_cho_me": "9 cái kẹo",
  "loi_khen_cu_the": "Con nhận ra ngay phải chia đều và ghi đơn vị đầy đủ.",
  "cau_hoi_cho_con": {
    "muc_1": "Con thử nhân ngược lại xem: 8 nhân 4 có bằng số kẹo trong đề không?",
    "muc_2": "Mẹ đưa con một nắm hạt đậu, con chia lần lượt vào 4 cái chén, mỗi lượt mỗi chén một hạt, rồi đếm số hạt trong một chén nhé."
  }
}
CHỈ TRẢ VỀ DUY NHẤT ĐỐI TƯỢNG JSON CHO BÀI CỦA CON.`,
  },

  p14d_teach_back: {
    id: 'p14d_teach_back',
    name: '14d. Nghe con giảng lại',
    desc: 'Chấm lời giảng lại của trẻ theo 4 tiêu chí kèm trích dẫn thực tế',
    variables: ['{{de_bai}}', '{{cac_bac}}', '{{transcript}}', '{{lop}}', '{{ten_con}}', '{{round}}'],
    requiredVars: ['{{transcript}}'],
    template: `Bạn là trợ lý sư phạm toán tiểu học lắng nghe bé {{ten_con}} học {{lop}} giảng lại bài toán cho mẹ nghe.
Đề bài:
"""{{de_bai}}"""

Các bước bài giải chuẩn:
"""{{cac_bac}}"""

Lời bé kể lại (transcript):
"""{{transcript}}"""

Vòng giảng lại: {{round}} (1 hoặc 2).

NHIỆM VỤ:
1. Đánh giá 4 tiêu chí cốt lõi:
   - "du_kien": Nêu đủ dữ kiện của đề bài.
   - "phep_tinh": Chọn đúng phép tính.
   - "ket_qua": Ra đúng kết quả từng bước.
   - "vi_sao": Giải thích được vì sao làm như vậy.
   Mỗi tiêu chí đạt (dat: true) BẮT BUỘC phải trích dẫn đúng câu nguyên văn bé đã nói ("trich"). Nếu bé không nói hoặc nói sai thì dat: false, trich: "".
2. Đề xuất mức hiểu bài:
   - "self": Đạt cả 4 tiêu chí.
   - "hint": Đạt 2 hoặc 3 tiêu chí.
   - "guided": Đạt 0 hoặc 1 tiêu chí.
3. Nếu bé chưa nói được "vi_sao" và round = 1, đưa ra "cau_hoi_them" để mẹ hỏi tiếp (không lộ đáp án).
4. Lời khen ngợi động viên con bằng chính chi tiết con vừa kể ("loi_khen_cho_con").

Trả về DUY NHẤT một JSON hợp lệ:
{
  "tieu_chi": [
    { "ma": "du_kien", "dat": true, "trich": "ba hộp mỗi hộp tám bút" },
    { "ma": "phep_tinh", "dat": true, "trich": "lấy hai mươi tư trừ đi năm" },
    { "ma": "ket_qua", "dat": true, "trich": "còn mười chín cây" },
    { "ma": "vi_sao", "dat": false, "trich": "" }
  ],
  "muc_de_xuat": "hint",
  "khop_bac": [
    { "trich": "ba hộp mỗi hộp tám bút là hai mươi bốn cây", "bac": 1 }
  ],
  "cau_hoi_them": "Vì sao mình lại lấy 24 trừ 5 mà không phải cộng hả con?",
  "loi_khen_cho_con": "Con nhớ rất rõ số bút và tính nhẩm bước đầu rất nhanh!"
}
CHỈ TRẢ VỀ DUY NHẤT JSON NÀY.`,
  },
  p19_trait_analysis: {
    id: "p19_trait_analysis",
    name: "19. Phân tích nguyên nhân biến động phẩm chất (Đợt 19)",
    desc: "Phân tích biến động 4 phẩm chất qua 2 tuần, fact-checking số thật, cấm chẩn đoán tâm lý, đề xuất lộ trình 7 ngày cân bằng",
    variables: ["{{ten_con}}", "{{tong_buoi}}", "{{tu_ngay}}", "{{den_ngay}}", "{{huy_hieu_tuan_truoc}}", "{{huy_hieu_tuan_nay}}", "{{dang_bai_chinh}}", "{{so_lan_tro_choi}}", "{{thoi_luong_tb}}", "{{ky_nang_ket}}"],
    requiredVars: ["{{ten_con}}"],
    template: `Bạn là trợ lý sư phạm Kèm Con Học. Phân tích nguyên nhân biến động phẩm chất của bé {{ten_con}} qua 2 tuần vừa qua.
QUY TẮC BẮT BUỘC:
1. MỌI CON SỐ trong câu trả lời phải nằm trong tập dữ kiện đã cung cấp. TUYỆT ĐỐI KHÔNG BỊA SỐ.
2. KHÔNG KẾT LUẬN VỀ TÂM LÝ, TÍNH CÁCH (CẤM các từ: tăng động, tự kỷ, adhd, chậm phát triển, rối loạn, thiểu năng, khiếm khuyết, bất thường, sang chấn, tâm thần).
3. ĐẦU RA JSON DUY NHẤT:
{
  "tom_tat": "tối đa 40 từ tóm tắt biến động chính",
  "nhan_dinh": [
    { "y": "nhận định ngắn gọn <= 25 từ", "can_cu": ["câu có số thật chứng minh"] }
  ],
  "lo_trinh_7_ngay": [ "việc 1 <= 20 từ", "việc 2 <= 20 từ", "việc 3 <= 20 từ" ],
  "luu_y": "tối đa 20 từ"
}

DỮ KIỆN ĐÃ XÁC THỰC:
- Bé: {{ten_con}}. Tổng số buổi đọc được: {{tong_buoi}} buổi (từ {{tu_ngay}} đến {{den_ngay}}).
- Huy hiệu Tuần trước: {{huy_hieu_tuan_truoc}}.
- Huy hiệu Tuần này: {{huy_hieu_tuan_nay}}.
- Dạng bài chính: {{dang_bai_chinh}}.
- Trò chơi 5 phút / Con đố mẹ / bài anh em: {{so_lan_tro_choi}}.
- Thời lượng buổi học trung bình: {{thoi_luong_tb}}.
- Kỹ năng kẹt tăng vọt: {{ky_nang_ket}}.

Hãy phân tích và đề xuất lộ trình 7 ngày cân bằng:`,
  },
  p20_class_insight: {
    id: "p20_class_insight",
    name: "20. Trợ lý gấu cho cô giáo (Prompt 20 Chặng 5)",
    desc: "Tổng hợp lớp học từ 5 bài trở lên, model nhỏ sinh <= 300 token, không nêu tên học sinh",
    variables: ["{{mon}}", "{{lop}}", "{{bai_hoc}}", "{{so_bai_nop}}", "{{thong_ke_loi}}"],
    requiredVars: ["{{so_bai_nop}}"],
    template: `Bạn là trợ lý sư phạm tiểu học tóm tắt kết quả bài tập của lớp cho cô giáo.

THÔNG TIN LỚP HỌC:
- Môn: {{mon}}, Lớp: {{lop}}, Bài học: {{bai_hoc}}
- Số bài đã nộp: {{so_bai_nop}} bài.
- Thống kê các bậc con hay vướng: {{thong_ke_loi}}

QUY TẮC BẮT BUỘC:
1. KHÔNG nêu tên bất kỳ học sinh nào. Chỉ dùng số lượng (ví dụ: "3 bạn nhầm...", "5 bạn làm tốt...").
2. "diem_vung": Tóm tắt dạng bài hoặc bước cả lớp làm vững nhất (< 25 từ).
3. "cho_nham_chung": Nêu 1 chỗ hay nhầm chung phổ biến nhất của lớp (< 30 từ).
4. "goi_y_ngay_mai": Gợi ý cụ thể cho cô giảng lại đầu giờ ngày mai (DƯỚI 50 TỪ, hành động cụ thể, không lý thuyết suông).

ĐẦU RA JSON DUY NHẤT (dưới 300 tokens):
{
  "diem_vung": "Cả lớp nắm rất chắc bước đọc hiểu đề và đếm dữ kiện ban đầu.",
  "cho_nham_chung": "3 bạn nhầm lẫn giữa phép cộng và trừ khi đề có từ bớt đi.",
  "goi_y_ngay_mai": "Đầu giờ cô cho lớp chơi trò truyền thẻ từ: từ bớt đi giơ dấu trừ, từ thêm vào giơ dấu cộng trong 3 phút."
}
CHỈ TRẢ VỀ DUY NHẤT ĐỐI TƯỢNG JSON NÀY.`,
  },
}

/* Cache in-memory */
let cachedPrompts = null

/* Lấy toàn bộ prompt đang áp dụng (Local Storage + Fallback Default) */
/*
 * Prompt 28: prompt mặc định có trường `rev`. Bản lưu trong máy (localStorage) hoặc bản đồng bộ từ máy chủ
 * có rev nhỏ hơn (hoặc không có rev) sẽ bị thay bằng bản mặc định mới, để bản sửa trong code thật sự có hiệu lực.
 * Quản trị viên muốn ghi đè thì lưu bản mới kèm rev >= rev mặc định.
 */
function applyDefaultRevisions(prompts) {
  const out = { ...prompts }
  for (const [k, def] of Object.entries(DEFAULT_PROMPTS)) {
    if (!def || typeof def.rev !== 'number') continue
    const cur = out[k]
    if (!cur || typeof cur !== 'object' || !(Number(cur.rev) >= def.rev)) {
      out[k] = { ...def }
    }
  }
  return out
}

export function getActivePrompts() {
  if (cachedPrompts) return cachedPrompts
  try {
    const raw = localStorage.getItem(PROMPT_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      cachedPrompts = applyDefaultRevisions({ ...DEFAULT_PROMPTS, ...parsed })
      return cachedPrompts
    }
  } catch (e) {}
  cachedPrompts = { ...DEFAULT_PROMPTS }
  return cachedPrompts
}

/* Cập nhật cache khi quản trị viên Lưu hoặc app đồng bộ từ máy chủ */
export function setActivePrompts(newPrompts) {
  const merged = { ...DEFAULT_PROMPTS }
  if (newPrompts && typeof newPrompts === 'object') {
    for (const [k, v] of Object.entries(newPrompts)) {
      if (v && typeof v === 'object') {
        merged[k] = { ...(DEFAULT_PROMPTS[k] || {}), ...v }
      } else if (typeof v === 'string') {
        merged[k] = { ...(DEFAULT_PROMPTS[k] || {}), template: v }
      }
    }
  }
  cachedPrompts = applyDefaultRevisions(merged)
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
  prompt_version: 'v3',
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
  cachedAiConfig = { ...DEFAULT_AI_CONFIG, ...(newConfig || {}) }
  if (newConfig?.pedagogy_routing && Array.isArray(newConfig.pedagogy_routing)) {
    cachedAiConfig.pedagogy_routing = newConfig.pedagogy_routing
  }
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
        rule_id: item.id || 'con_bi_lap_lai',
        ruleId: item.id || 'con_bi_lap_lai',
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
        rule_id: item.id,
        ruleId: item.id,
        phuong_phap: item.methods,
        doan_phuong_phap: `- Phương pháp: ${item.methods}\n- Hướng dẫn thực hiện: ${item.instruction}\n- Cuối bài: Áp dụng Metacognitive ("Con dạy lại mẹ" và hỏi lần sau gặp bài này con làm bước nào trước).`,
      }
    }
  }

  return {
    rule_id: 'fallback',
    ruleId: 'fallback',
    phuong_phap: 'Từng bước gợi mở (Scaffolding)',
    doan_phuong_phap: '- Phương pháp: Từng bước gợi mở (Scaffolding)\n- Hướng dẫn thực hiện: Dẫn dắt con bằng các câu hỏi gợi mở, không giải bài hộ.\n- Cuối bài: Áp dụng Metacognitive ("Con dạy lại mẹ" và hỏi lần sau gặp bài này con làm bước nào trước).',
  }
}

/**
 * Phân loại bài tập động theo cấu hình Router sư phạm (thay thế hardcode)
 */
export function classifyProblemDynamic(deBai = '', lop = 'Lớp 2', monHint = null) {
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

  // Gói 33 · B4: fallback theo môn thật (môn mẹ chọn / đoán từ đề), không mặc định "Toán" cho đề Tiếng Việt, Tiếng Anh
  const subject = normalizeSubject(monHint) || guessSubject(deBai)
  if (subject === 'tieng_viet' || subject === 'tieng_anh') {
    return {
      mon: SUBJECT_LABEL[subject],
      lop,
      dang_bai: subject === 'tieng_viet' ? 'Bài tập Tiếng Việt' : 'Bài tập Tiếng Anh',
      loi_hay_gap: 'Con hay làm vội mà chưa đọc kỹ yêu cầu của bài',
    }
  }
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

  // Tự động định tuyến phương pháp sư phạm nếu chưa có doan_phuong_phap cho mọi template có {{doan_phuong_phap}}
  let doanPhuongPhap = params.doan_phuong_phap || ''
  if (!doanPhuongPhap && text.includes('{{doan_phuong_phap}}')) {
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
    // Prompt 29B: người đang kèm con (bố / mẹ / ông bà)
    xung_ho: params.xung_ho || getCurrentXungHo(),
  }

  // Thay thế tất cả {{key}}
  text = text.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
    return typeof map[key] !== 'undefined' ? map[key] : ''
  })

  return text
}
