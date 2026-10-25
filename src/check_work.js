/**
 * check_work.js - Backend handlers for Tính năng 1: Chấm vở, không sửa hộ (Prompt 14 Phần A)
 * 
 * Tuyệt đối tuân thủ cam kết bảo mật:
 * - Không lưu ảnh trên R2, KV, D1 hay server log.
 * - Giới hạn 10 lần đọc ảnh mỗi ngày cho mỗi gia đình.
 * - Chạy kiểm tra phạm vi trước khi gọi OCR.
 * - Máy kiểm tra phép tính đối chiếu kết quả với AI.
 * - Bộ chặn an toàn (guard.js) đảm bảo không lộ đáp án trong câu hỏi gợi mở cho con.
 */

import { reconcileWorkCheck, checkArithmetic } from "./arithmetic.js";
import { validateAndGuard, checkAnswerLeak, logGuardEvent, DEFAULT_GUARD_FALLBACKS } from "./guard.js";

export const DEFAULT_READ_PROMPT = `Quan sát kỹ trang vở bài làm của học sinh tiểu học trong ảnh và trả về DUY NHẤT một JSON hợp lệ theo schema sau:
{
  "doc_duoc": true,
  "ly_do": "",
  "de_bai": "<nội dung đề bài nếu có trong ảnh, hoặc tóm tắt>",
  "cac_dong": [
    { "so": 1, "noi_dung": "<chép nguyên văn dòng 1 của trẻ>", "chac_chan": 0.95 },
    { "so": 2, "noi_dung": "<chép nguyên văn dòng 2>", "chac_chan": 0.62, "lua_chon": ["29", "20"] }
  ]
}

QUY TẮC BẮT BUỘC:
1. Chép ĐÚNG NHƯ TRẺ VIẾT, kể cả chỗ sai chính tả, sai số liệu hay sai phép tính; tuyệt đối không tự sửa lại cho đúng.
2. Mỗi dòng bài giải của trẻ là một phần tử trong "cac_dong", đánh số thứ tự từ 1.
3. "chac_chan" từ 0.0 đến 1.0. Nếu có chữ hoặc số không chắc chắn, đưa tối đa 2 cách đọc trong "lua_chon".
4. Nếu ảnh không phải bài làm (selfie, đồ vật...) hoặc ảnh mờ/tối, trả về "doc_duoc": false kèm "ly_do" ngắn gọn ("ảnh tối", "không thấy chữ", "không phải bài làm").
5. CHỈ TRẢ VỀ DUY NHẤT ĐỐI TƯỢNG JSON, KHÔNG THÊM BẤT KỲ VĂN BẢN NÀO KHÁC.`;

export const DEFAULT_GRADE_PROMPT = `Bạn là trợ lý sư phạm toán tiểu học cho phụ huynh {{xung_ho}} kèm bé {{ten_con}} học {{lop}}.
Đề bài:
"""{{de_bai}}"""

Các dòng bài làm của con:
"""{{cac_dong}}"""

NHIỆM VỤ:
1. Tự giải lại bài toán một cách chuẩn xác từng bước ("loi_giai_chuan").
2. So sánh từng dòng bài làm của con với lời giải chuẩn để tìm bước sai đầu tiên (nếu có).
3. Đánh giá kết quả: "dung_het" | "co_buoc_sai" | "chua_xong" | "khong_ro".
4. Phân loại lỗi nếu có: "doc_de" | "chon_phep_tinh" | "tinh_nham" | "thieu_don_vi" | "trinh_bay" | "chua_lam_xong".
5. Viết giải thích ngắn gọn, đồng cảm chỉ dành riêng cho mẹ đọc ("giai_thich_cho_me").
6. Chỉ ra đáp án đúng cho mẹ: "gia_tri_dung_dong_sai" và "dap_an_dung_cho_me".
7. Nêu điểm sáng cụ thể của con để mẹ khen ngợi ("loi_khen_cu_the").
8. Tạo câu hỏi gợi mở cho con tự phát hiện lỗi sai ("cau_hoi_cho_con"):
   - "muc_1": câu hỏi gợi mở đúng trọng tâm chỗ sai để mẹ đọc to cho con.
   - "muc_2": gợi ý thực tế dùng đồ vật (que tính, kẹo, vẽ hình).
   TUYỆT ĐỐI KHÔNG để lộ "gia_tri_dung_dong_sai" hay "dap_an_dung_cho_me" vào "muc_1" hoặc "muc_2".

Trả về DUY NHẤT một JSON hợp lệ:
{
  "ket_qua": "co_buoc_sai",
  "loi_giai_chuan": ["8 + 8 + 8 = 24", "24 - 5 = 19"],
  "dong_sai_dau_tien": 2,
  "loai_loi": "chon_phep_tinh",
  "giai_thich_cho_me": "Đề là cho đi nên phải bớt, con lại làm phép cộng. Lỗi hay gặp khi thấy chữ cho là cộng.",
  "gia_tri_dung_dong_sai": "19",
  "dap_an_dung_cho_me": "19 cây bút",
  "loi_khen_cu_the": "Dòng 1 con làm đúng và ghi đơn vị đầy đủ.",
  "cau_hoi_cho_con": {
    "muc_1": "Con đọc lại đề nhé. Mẹ cho bạn Na 5 cây thì bút của mình nhiều lên hay ít đi?",
    "muc_2": "Mẹ có 24 que tính, mẹ lấy bớt đi 5 que đưa bạn Na, con xem trên bàn còn mấy que?"
  }
}
CHỈ TRẢ VỀ DUY NHẤT ĐỐI TƯỢNG JSON NÀY.`;

export { reconcileWorkCheck, checkArithmetic };
