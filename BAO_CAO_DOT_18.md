# BÁO CÁO ĐỢT 18: AI VỮNG VÀ THÔNG MINH HƠN (Prompt 18)

Ngày thực hiện: 26/10/2026
Môi trường: Node.js, Vite 8.3.3, Cloudflare Pages, Cloudflare Worker + Workers AI + D1

---

## BẢNG TIẾN ĐỘ 10 CHẶNG

| Chặng | Tên chặng | Trạng thái | Commit | Ghi chú & Kiểm thử |
|---|---|---|---|---|
| **Chặng 0** | **Sửa nền AI** | **ĐẠT (100%)** | `dot18-chang-0` | 16/16 unit test `test-dot18-chang-0.mjs` đạt, 28/28 test suites xanh, 46/46 E2E đạt |
| **Chặng 1** | **Máy kiểm phép tính** | **ĐẠT (100%)** | `dot18-chang-1` | 33/33 tests `test-dot18-chang-1.mjs` đạt, tự sửa 30 - 8 = 23 thành 22, huy hiệu .chk trên UI |
| **Chặng 2** | **Gấu nhớ con** | **ĐẠT (100%)** | `dot18-chang-2` | D1 migration live remote & local, 36/36 tests test-dot18-chang-2.mjs đạt, thẻ Gấu nhớ nè & cài đặt bé |
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

---

## CHI TIẾT CHẶNG 1: MÁY KIỂM PHÉP TÍNH (CODE, KHÔNG PHẢI AI)

### 1. Việc đã làm
- **1.1 Thuật toán Shunting-yard độc lập (evaluateMath & checkArithmetic):**
  - Viết bộ tính toán độc lập không dùng `eval()` trong `src/arithmetic.js` (đồng bộ cả frontend và backend worker).
  - Hỗ trợ đầy đủ các phép toán: `+`, `-`, `*`, `/`, `x`, `×`, `:`, `÷`, dấu ngoặc `()`, số thập phân (`2,5` và `2.5`).
  - Hỗ trợ ký tự trừ unicode chuẩn: `−` (`\u2212`) và `–` (`\u2013`).
  - Lược bỏ tiền tố nhãn thông minh (ví dụ: `Phép tính: 30 - 8 = 22` hoặc `Bài 2: 30 - 8 = 22` không bị hiểu nhầm dấu hai chấm thành phép chia).
- **1.2 Đổi đơn vị chục, trăm, nghìn:**
  - Hỗ trợ quét tự động các phép đổi đơn vị: `X chục = Y`, `X trăm = Y`, `X nghìn = Y`.
  - Tự động kiểm tra: ví dụ `3 chục = 30` (đúng), `3 chục = 20` (sai, phát hiện và sửa thành 30).
- **1.3 Kiểm tra toàn bộ bài giảng và tự động sửa sai (validateAllLessonMath & correctLessonMath):**
  - Quét qua mọi vị trí có thể chứa phép tính: `cac_bac[].dap_an_cho_me`, `cac_bac[].cau_hoi`, `dap_an_cuoi_cho_me`, và `bai_anh_em`.
  - Tự động sửa phép tính sai: fixture `30 - 8 = 23` bị bắt và tự động sửa thành `30 - 8 = 22`.
- **1.4 Tích hợp Backend Worker ai-gateway-worker:**
  - Sau khi AI soạn bài, chạy `validateAllLessonMath(parsed)`.
  - Nếu có phép tính sai: gọi AI retry nếu còn thời gian (>10s) với câu nhắc rõ ràng: `Phép tính X sai, kết quả đúng là Y`.
  - Nếu AI vẫn trả sai hoặc hết giờ: code tự động thay thế số sai bằng số đúng và ghi nhận `guard_log` với `outcome: "sua_phep_tinh"`.
  - Trả về trường `math_verified: { count, calculations, summary }` cho ứng dụng.
- **1.5 Giao diện Trước khi giảng (Explain trong screens.jsx & styles.css):**
  - Thêm huy hiệu xác nhận: `✓ Gấu đã kiểm lại N phép tính` kèm dòng tóm tắt `3 chục = 30 · 30 − 8 = 22 · đáp số 22 quả`.
  - Bấm nút `Xem` mở danh sách chi tiết các phép tính máy tính độc lập đã kiểm định. Bấm lại `Đóng` để thu gọn.
  - Hỗ trợ chuẩn responsive và dark mode (midnight theme).
- **1.6 Kiểm thử 30 đề ai-eval:**
  - Rà soát toàn bộ 30 đề bài trong `ai-eval/de-mau.json`: 0 phép tính sai tới mẹ.

### 2. Files đã chỉnh sửa
- `src/arithmetic.js`
- `src/api.js`
- `src/trialData.js`
- `src/screens.jsx`
- `src/styles.css`
- `package.json`
- `scripts/test-dot18-chang-1.mjs` (Tạo mới 33 tests)
- `../study-en/ai-gateway-worker/src/arithmetic.js`
- `../study-en/ai-gateway-worker/src/index.js`

### 3. Kết quả kiểm thử
- `scripts/test-dot18-chang-1.mjs`: **33/33 kiểm thử đạt (100%)**
- `npm test`: **29/29 test suites đạt (100%)**
- `npm run e2e`: **46/46 kịch bản Playwright đạt (100%)**
- `npm run build`: **Bản build sản xuất sạch, không lỗi**

---

## CHI TIẾT CHẶNG 2: GẤU NHỚ CON (PROMPT 17 CHẶNG 2 & 3)

### 1. Việc đã làm
- **Điểm dừng bắt buộc 1: Migration D1 remote & local:**
  - Tạo file `study-en/ai-gateway-worker/migrations/0006_dot18_tables.sql`.
  - Tạo bảng `learning_events` (có chỉ mục `(family_id, child_id, created_at)` và `(family_id, child_id, skill)`, ràng buộc `UNIQUE(session_id, step_no)` chống ghi trùng).
  - Tạo bảng `progress_reports` (có chỉ mục `(family_id, child_id, created_at)`).
  - Đã chạy và kiểm tra xác nhận thành công 100% trên cả database thật Cloudflare D1 `ai-gateway-db` (ID `76611f4f-2e43-4dbb-b36c-858ff81298a3`) và local D1.
- **Thuật toán phân tích hồ sơ con 30 ngày (buildLearnerProfile):**
  - Đọc `learning_events` trong 30 ngày gần nhất:
    - Kỹ năng hay kẹt: tỉ lệ kẹt > 30% trên ít nhất 3 lần gặp.
    - Kỹ năng đã vững: làm đúng không cần gợi ý (`tu_lam`, `hints_used == 0`) 3 lần liên tiếp.
  - Tự động tạo hồ sơ ngắn gọn <= 300 ký tự (ví dụ: `Mít hay kẹt ở bước đổi đơn vị; đã vững tính toán. Hãy hỏi kỹ bước đổi đơn vị.`).
  - Chưa có lịch sử: ghi `chưa có`.
- **Hệ thống Backend Worker API:**
  - `POST /api/v1/family/learning-events`: ghi nhận sự kiện từng bước kèm UPSERT chống trùng lặp theo `session_id + step_no`.
  - `GET /api/v1/family/learning-events`: đọc lịch sử và hồ sơ học 30 ngày của bé.
  - `DELETE /api/v1/family/learning-events`: xoá dữ liệu học tập của riêng bé.
  - Tự động chèn hồ sơ con vào biến `{{ho_so_con}}` của prompt `p3_explain_v2` khi gọi `/chat`.
  - Quyền riêng tư: API Giáo viên tuyệt đối không truy vấn hoặc trả về `learning_events`.
- **Prompt Studio (p3_explain_v2):**
  - Khai báo biến `{{ho_so_con}}`.
  - Bổ sung quy tắc 14: AI ưu tiên hỏi kỹ, chẻ nhỏ ở kỹ năng con hay kẹt, giảm bớt gợi ý ở kỹ năng con đã vững.
- **Giao diện người dùng:**
  - Thẻ "Gấu nhớ nè" (`#bear-memory-card`) ở màn Trước khi giảng (`Explain`): hiển thị tóm tắt chỗ hay kẹt và đã vững của con, link "Vì sao Gấu biết?", công tắc "Lần này không dùng" để tạm tắt cho riêng bài này.
  - Nhãn kỹ năng chuẩn tiểu học (`SKILL_LABELS`) ở từng bậc câu hỏi: `Đọc hiểu đề`, `Đổi đơn vị`, `Chọn phép tính`, `Tính toán`, `Lời giải`, `Kiểm tra lại`.
  - Bậc thuộc kỹ năng con hay kẹt được làm nổi bật với viền cam và nhãn `{Tên con} hay kẹt`.
  - Cài đặt bé (`EditChildSheet`): bổ sung công tắc "Bật Gấu nhớ con" và nút "Xoá lịch sử học của bé" kèm hộp thoại xác nhận.
  - Màn Hỏi con từng bước (`Scaffold`): tự động ghi nhận sự kiện học từng bước qua `recordLearningEvent`.

### 2. Files đã chỉnh sửa
- `../study-en/ai-gateway-worker/migrations/0006_dot18_tables.sql`
- `../study-en/ai-gateway-worker/src/v1_routes.js`
- `../study-en/ai-gateway-worker/src/index.js`
- `src/promptStudio.js`
- `src/api.js`
- `src/App.jsx`
- `src/screens.jsx`
- `src/styles.css`
- `package.json`
- `scripts/test-dot18-chang-2.mjs` (Tạo mới 36 tests)

### 3. Kết quả kiểm thử
- `scripts/test-dot18-chang-2.mjs`: **36/36 kiểm thử đạt (100%)**
- `npm run build`: **Bản build sản xuất sạch, không lỗi**
- `npm run e2e`: **46/46 kịch bản Playwright đạt (100%)**
