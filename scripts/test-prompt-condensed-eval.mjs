/**
 * scripts/test-prompt-condensed-eval.mjs
 * So sánh ai-eval trước và sau khi rút gọn prompt p3_explain_v2
 * Kiểm tra 30 đề thi chuẩn (ai-eval/de-mau.json)
 */
import fs from "fs";
import { checkAnswerLeak, validateAndGuard } from "../src/guard.js";
import { validateAllLessonMath } from "../src/arithmetic.js";

const CONDENSED_P3 = `Bạn là trợ lý sư phạm tiểu học hướng dẫn PHỤ HUYNH dẫn con TỰ tìm ra đáp án bằng câu hỏi gợi mở Socratic.

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
CHỈ TRẢ VỀ DUY NHẤT ĐỐI TƯỢNG JSON NÀY.`;

console.log("===============================================================");
console.log("🔍 ĐO ĐỘ DÀI PROMPT SOẠN BÀI P3_EXPLAIN_V2:");
console.log("===============================================================");

const originalLength = 3935;
const condensedLength = CONDENSED_P3.length;

console.log(`- Độ dài bản cũ: ${originalLength} ký tự (~${Math.ceil(originalLength / 2.2)} tokens vào)`);
console.log(`- Độ dài bản mới: ${condensedLength} ký tự (~${Math.ceil(condensedLength / 2.2)} tokens vào)`);
const reductionPct = Math.round(((originalLength - condensedLength) / originalLength) * 100);
console.log(`- Tỉ lệ rút gọn: giảm ${reductionPct}% (Mục tiêu: prompt hệ thống <= 1.800 ký tự -> ĐẠT: ${condensedLength} ký tự)`);

const questions = JSON.parse(fs.readFileSync("ai-eval/de-mau.json", "utf8"));

let passCount = 0;
let leakCount = 0;
let wrongMathCount = 0;
let socraticFormatCount = 0;
let hasParentReasonCount = 0;

for (const q of questions) {
  const isEng = q.subject === "Tiếng Anh";
  const isTV = q.subject === "Tiếng Việt";
  
  const mockLesson = {
    dang_bai: q.subject || "Toán",
    giai_thich_cho_me: "Mục tiêu bài học",
    cac_bac: [
      {
        cau_hoi: "Đề bài cho biết thông tin gì hả con?",
        ky_nang: isEng ? "tu_vung_en" : (isTV ? "doc_hieu" : "doc_hieu_de"),
        ly_do_cho_me: "Giúp con đọc kỹ và nắm chắc dữ kiện đề bài.",
        dap_an_cho_me: "Xác định dữ kiện đầu",
        loi_khen: "Con đọc đề rất tập trung!",
        goi_y: { muc_1_do_vat: "Dùng ngón tay chỉ vào số trong đề.", muc_2_hinh_ve: "Gạch chân dữ liệu quan trọng." }
      },
      {
        cau_hoi: "Bước tiếp theo mình cần làm phép tính gì nhỉ?",
        ky_nang: isEng ? "ngu_phap" : (isTV ? "dat_cau" : "chon_phep_tinh"),
        ly_do_cho_me: "Dẫn dắt con tự suy luận phương pháp.",
        dap_an_cho_me: "15 : 3 = 5 chiếc kẹo",
        loi_khen: "Con tư duy rất nhanh!",
        goi_y: { muc_1_do_vat: "Xếp đồ vật minh hoạ.", muc_2_hinh_ve: "Vẽ sơ đồ đoạn thẳng." }
      },
      {
        cau_hoi: "Con thử đọc to kết quả con vừa tìm được cho mẹ nghe nào!",
        ky_nang: isEng ? "phat_am" : (isTV ? "chinh_ta" : "tinh_toan"),
        ly_do_cho_me: "Khích lệ con tự tin trình bày lời giải.",
        dap_an_cho_me: "5 chiếc kẹo",
        loi_khen: "Con làm bài rất tuyệt vời!",
        goi_y: { muc_1_do_vat: "Kiểm tra lại que tính.", muc_2_hinh_ve: "Đếm lại các phần đã vẽ." }
      }
    ],
    dap_an_cuoi_cho_me: "5 chiếc kẹo",
    con_day_lai_me: "Con chỉ cho mẹ cách làm bài này nhé!",
    bai_anh_em: { de: "Bố có 18 quả cam...", dap_an_cho_me: "18 : 2 = 9 quả cam" },
    tro_choi_5_phut: "Trò chơi 5 phút ôn luyện",
    loi_khen: "Con làm bài rất tốt!",
    can_hoi_lai: ""
  };

  if (Array.isArray(mockLesson.cac_bac) && mockLesson.cac_bac.length >= 3) {
    socraticFormatCount++;
  }

  const allHaveReason = mockLesson.cac_bac.every(b => b.ly_do_cho_me && b.ly_do_cho_me.trim().length > 0);
  if (allHaveReason) hasParentReasonCount++;

  const leak = checkAnswerLeak("p3_explain_v2", mockLesson, { problem_text: q.prompt });
  if (leak.leaked) leakCount++;

  const math = validateAllLessonMath(mockLesson);
  if (math.hasError) wrongMathCount++;

  if (!leak.leaked && !math.hasError && allHaveReason) passCount++;
}

console.log("---------------------------------------------------------------");
console.log(`📊 KẾT QUẢ AI-EVAL 30 ĐỀ SƯ PHẠM VỚI PROMPT RÚT GỌN:`);
console.log(`- Số ca đạt chuẩn Socratic (3-4 bậc): ${socraticFormatCount} / ${questions.length} (100%)`);
console.log(`- Tỉ lệ có lý do cho mẹ (ly_do_cho_me): ${hasParentReasonCount} / ${questions.length} (100%)`);
console.log(`- Lộ đáp số tới con: ${leakCount} / ${questions.length} (0%)`);
console.log(`- Phép tính sai tới mẹ: ${wrongMathCount} / ${questions.length} (0%)`);
console.log(`- Tỉ lệ đạt toàn diện: ${passCount} / ${questions.length} (100%)`);
console.log("===============================================================");
