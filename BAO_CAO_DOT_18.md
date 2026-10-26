# BÁO CÁO ĐỢT 18: AI VỮNG VÀ THÔNG MINH HƠN (Prompt 18)

Ngày thực hiện: 26/10/2026
Môi trường: Node.js, Vite 8.3.3, Cloudflare Pages, Cloudflare Worker + Workers AI + D1

---

## BẢNG TIẾN ĐỘ 10 CHẶNG

| Chặng | Tên chặng | Trạng thái | Commit | Ghi chú & Kiểm thử |
|---|---|---|---|---|
| **Chặng 0** | **Sửa nền AI** | **ĐẠT (100%)** | `dot18-chang-0` | 16/16 unit test `test-dot18-chang-0.mjs` đạt, 28/28 test suites xanh, 46/46 E2E đạt |
| Chặng 1 | Máy kiểm phép tính | Đang thực hiện | | |
| Chặng 2 | Gấu nhớ con | Chưa | | Chờ điểm dừng bắt buộc 1 (D1 migration) |
| Chặng 3 | Phân tích tiến bộ trung thực | Chưa | | |
| Chặng 4 | Câu hỏi nhỏ hơn | Chưa | | |
| Chặng 5 | Gấu nghe con trả lời | Chưa | | |
| Chặng 6 | Bài anh em thích ứng | Chưa | | |
| Chặng 7 | Linh vật động | Chưa | | |
| Chặng 8 | Lỗi giao diện còn lại | Chưa | | |
| Chặng 9 | Kiểm thử tổng thể & ai-eval | Chưa | | Chờ điểm dừng bắt buộc 2 (Deploy Production) |

---

## CHI TIẾT CHẶNG 0: SỬA NỀN AI

### 1. Việc đã làm
- **0.1 Chuẩn hoá kết quả AI không bao giờ lỗi 500:**
  - Viết hàm dùng chung `normalizeAiResponse(response)` tại `study-en/ai-gateway-worker/src/index.js`.
  - Xử lý trọn vẹn cả 3 dạng: đối tượng JSON từ Workers AI, chuỗi Markdown bọc ````json`, chuỗi có lời dẫn thô, và dạng rỗng/null.
  - Thay thế toàn bộ các lệnh `.trim()` gây lỗi `rawOutput.trim is not a function`.
  - Bắt lỗi ngoại lệ `/chat` trả mã 503 thân thiện kèm thông báo cho phụ huynh thay vì 500.
- **0.2 Chấm vở không đọc được ảnh:**
  - Viết lại hàm `looksLikeReadEcho` trong `study-en/ai-gateway-worker/src/check_work.js`: chỉ loại bỏ khi cả đề bài và các dòng đều là khuôn rỗng placeholder.
  - Bổ sung bộ phân tích `parseModelJson` có khả năng tự sửa lỗi xuống dòng chưa escape.
  - Thêm ghi log `[check_work.read] raw model analysis` hỗ trợ chẩn đoán không lưu ảnh.
- **0.3 Bật prompt `p3_explain_v2` trên production:**
  - Xoá điều kiện hostname (`window.location.hostname.includes("preview")`) trong `src/api.js`.
  - Mặc định sử dụng `p3_explain_v2` kèm trường `ly_do_cho_me` và chip "💡 Vì sao AI hỏi câu này?" trên mọi môi trường.
- **0.4 Bộ chặn sửa đúng bậc, bớt bắt nhầm:**
  - Nâng cấp `extractNumbers` trong `src/guard.js` và worker nhận diện từ số tiếng Việt ("3 chục" -> 30, 3; "1 tá" -> 12).
  - Cập nhật quy tắc: số trong đề bài (`problem_text`) không bị coi là lộ đáp án.
  - Từng bậc $i$ chỉ bị chặn khi câu hỏi/gợi ý/lý do chứa đáp số cuối HOẶC kết quả của chính bậc đó.
  - Khi bị chặn, thay thế bằng câu an toàn theo kỹ năng tương ứng (`SKILL_SAFE_QUESTIONS`), ghi `guard_log` loại `sua_bac` hoặc `cau_an_toan`.
- **0.5 Lời khen theo từng bậc:**
  - Cập nhật schema `p3_explain_v2` trong `src/promptStudio.js` bổ sung `cac_bac[].ky_nang` và `cac_bac[].loi_khen` (tối đa 15 từ).
  - Cập nhật `src/screens.jsx` (`Scaffold`) để hiển thị lời khen của đúng bậc vừa hoàn thành.
- **0.6 Khai báo gia đình cũ không bị lặp:**
  - Trong `src/App.jsx`, cổng chờ `waitingServerState` đợi dữ liệu máy chủ tải xong (`hydrated === true`) mới quyết định điều hướng.
  - Tự động đánh dấu `onboarded = true` khi dữ liệu máy chủ đã có danh sách con. Không bao giờ ghi đè danh sách con đã có.
- **0.7 Gỡ bài phân tích viết sẵn:**
  - Đã xoá bỏ hoàn toàn đoạn văn mẫu `### 🔍 1. Chẩn đoán biến động phẩm chất` và các số mặc định `|| 4` trong `src/screens.jsx`.
  - Chế độ Dùng thử sử dụng bản mẫu phân tích rõ ràng, 0 request tới AI và máy chủ.

### 2. Files đã chỉnh sửa
- `src/api.js`
- `src/App.jsx`
- `src/screens.jsx`
- `src/guard.js`
- `src/promptStudio.js`
- `package.json`
- `scripts/test-dot18-chang-0.mjs` (Tạo mới 16 unit tests)
- `../study-en/ai-gateway-worker/src/index.js`
- `../study-en/ai-gateway-worker/src/guard.js`
- `../study-en/ai-gateway-worker/src/check_work.js`

### 3. Kết quả kiểm thử
- `scripts/test-dot18-chang-0.mjs`: **16/16 kiểm thử đạt (100%)**
- `npm test`: **28/28 test suites đạt (100%)**
- `npm run e2e`: **46/46 kịch bản Playwright đạt (100%)**
