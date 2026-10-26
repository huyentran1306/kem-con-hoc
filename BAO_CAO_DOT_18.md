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

---

## CHI TIẾT CHẶNG 3: PHÂN TÍCH TIẾN BỘ TRUNG THỰC (PROMPT 17 CHẶNG 4)

### 1. Việc đã làm
- **1.1 Backend Worker API (`POST /api/v1/ai/progress`):**
  - Đọc `learning_sessions` và `learning_events` trong 28 ngày qua từ D1.
  - Xử lý ngưỡng dưới 3 buổi học: trả mã `NOT_ENOUGH_DATA` kèm `sessions_count` và `required: 3`, tuyệt đối không gọi AI để tránh lãng phí token và bịa đặt.
  - Caching thông minh trong bảng `progress_reports`: khi số lượng buổi học chưa tăng thêm, trả lại ngay bản phân tích đã lưu gần nhất (`cached: true`), không gọi AI.
  - Gọi prompt sư phạm `p17_progress` với model `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, max 600 tokens, timeout 25s.
  - **Worker kiểm định dữ kiện (Fact Verification):** Quét toàn bộ con số trong phản hồi AI, đối chiếu với tập số thực tế (số buổi, số bài tự làm, số sự kiện, 28 ngày, ngày bắt đầu và kết thúc). Nếu phát hiện số bịa ngoài dữ kiện, tự động chuẩn hoá lại lời văn tóm tắt theo đúng dữ kiện thật.
- **1.2 Thẻ An toàn AI (`WeeklyAiCards` & `dot18_safety`):**
  - Cập nhật `study-en/ai-gateway-worker/src/safety.js` để tổng hợp 4 chỉ số an toàn thực tế:
    1. Phép tính sai đã bắt (`phep_tinh_sai_da_bat` từ `guard_log` với `outcome = 'sua_phep_tinh'`)
    2. Bậc bộ chặn sửa lại (`bac_bo_chan_sua_lai` từ `guard_log` với `outcome IN ('sua_bac', 'regenerated')`)
    3. Câu nhỏ hơn đã tạo (`cau_nho_hon_da_tao` từ `learning_events.micro_steps`)
    4. Số lần Gấu nghe con (`so_lan_gau_nghe_con` từ `learning_events.voice_verdict`)
  - Giao diện thẻ An toàn AI: hiển thị lưới 2 cột số liệu thật và dòng cam kết: `MẸ THẤY GÌ: Không câu nào lộ đáp án tới con. Mọi phép tính trong bài đã được Gấu tính lại.`
- **1.3 Giao diện Report màn Báo cáo (`src/screens.jsx` & `src/styles.css`):**
  - Thay thế khối phân tích tĩnh cũ bằng thẻ **CON TIẾN BỘ THẾ NÀO** theo đúng bản vẽ thiết kế (`tham-khao/ai-nho-con.html`):
    - Đủ 4 trạng thái linh hoạt:
      1. Cần ít nhất 3 buổi học (`st-card` icon `🌱`)
      2. Đang phân tích (`st-card` spinner quay)
      3. Lỗi / Chưa phân tích được (`st-card warn` icon `⏳` kèm nút bấm `Thử lại`)
      4. Đã có phân tích (`card ana`):
         - Dòng nguồn: `🐻 Gấu đã đọc N buổi học, từ {tu_ngay} đến {den_ngay}`
         - Đoạn văn nhận xét tiến bộ trung thực
         - Lưới 3 dữ kiện: Hay kẹt, Đã vững, Tự làm
         - Đúng 3 gợi ý tuần tới cho mẹ
         - Nút "Xem dữ liệu Gấu đã đọc ›" mở hộp thoại chi tiết dữ liệu thực tế
         - Thời gian phân tích
- **1.4 Sửa lỗi chia cho 0 trong máy kiểm phép tính (`src/arithmetic.js`):**
  - Bổ sung cơ chế phát hiện chia cho 0 (`/[\:\/\÷]\s*0(?![0-9])/`) và trả về `error: "division_by_zero"`, giải quyết 100% 31/31 unit test toán học.

### 2. Files đã chỉnh sửa
- `../study-en/ai-gateway-worker/src/v1_routes.js`
- `../study-en/ai-gateway-worker/src/index.js`
- `../study-en/ai-gateway-worker/src/safety.js`
- `../study-en/ai-gateway-worker/src/arithmetic.js`
- `src/arithmetic.js`
- `src/api.js`
- `src/screens.jsx`
- `src/styles.css`
- `package.json`
- `scripts/test-dot18-chang-3.mjs` (Tạo mới 14 tests)

### 3. Kết quả kiểm thử
- `scripts/test-dot18-chang-3.mjs`: **14/14 kiểm thử đạt (100%)**
- `scripts/test-dot14-chang-2.mjs`: **31/31 kiểm thử đạt (100%)**
- `npm test`: **30/30 test suites đạt (100%)**
- `npm run build`: **Bản build sản xuất sạch, không lỗi (306ms)**
- `npm run e2e`: **46/46 kịch bản Playwright đạt (100%)**

---

## CHI TIẾT CHẶNG 4: CÂU HỎI NHỎ HƠN (PROMPT 18 CHẶNG 4)

### 1. Việc đã làm
- **1.1 Backend Worker API (`POST /api/v1/ai/micro-step`):**
  - Xây dựng endpoint hỗ trợ prompt `p18_micro_step` với model `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, timeout 12s.
  - Nhận đầu vào: `problem_text`, `step_question`, `step_answer`, `hints_used`, `skill`, `child_profile`, `child_speech`, `micro_index` (1 hoặc 2), `child_name`.
  - Giới hạn nghiêm ngặt: `cau_hoi_nho` tối đa 20 từ, `ly_do_cho_me` tối đa 25 từ.
  - Tích hợp bộ chặn rò rỉ đáp án: nếu câu hỏi nhỏ vô tình chứa số kết quả của bài toán, tự động thay thế bằng câu hỏi an toàn theo kỹ năng của bậc và ghi nhật ký vào `guard_log` với `outcome = 'sua_bac'`.
- **1.2 Frontend API & Dùng thử (`src/api.js`):**
  - Thêm hàm `fetchAiMicroStep`.
  - Hỗ trợ Chế độ Dùng thử không gửi request mạng, trả về câu hỏi nhỏ mẫu tức thì.
- **1.3 Giao diện người dùng (`Scaffold` trong `src/screens.jsx` & `src/styles.css`):**
  - Kích hoạt thông minh: mẹ bấm "Con chưa nghĩ ra" lần 1 hiện gợi ý vật thật có sẵn; lần 2 ở cùng bậc tự động kích hoạt gọi AI chẻ nhỏ câu hỏi.
  - Huy hiệu trạng thái: `🙈 Con chưa nghĩ ra · lần 2`.
  - Thẻ `GẤU CHẺ NHỎ CÂU HỎI`:
    - Câu hỏi nhỏ trong ngoặc kép với chữ to, rõ ràng.
    - Nhãn `Câu nhỏ 1/2` (hoặc `2/2`).
    - Nút `Vì sao câu này? ›` mở phần giải thích sư phạm và đáp án mẹ đợi con.
    - Hai nút thao tác: `🙈 Vẫn chưa ra` và `🎉 Con ra rồi!`.
  - Khi con giải được: bấm `Con ra rồi!` ghi nhận sự kiện vào `learning_events.micro_steps` và chuyển tiếp bậc.
  - Khi vẫn chưa ra: bấm `Vẫn chưa ra` lần 1 gọi tiếp câu nhỏ 2/2; hết 2 câu nhỏ tự động chuyển sang gợi ý hình vẽ và đáp án cho mẹ với nhãn `me_dan`.

### 2. Files đã chỉnh sửa
- `../study-en/ai-gateway-worker/src/v1_routes.js`
- `../study-en/ai-gateway-worker/src/index.js`
- `src/api.js`
- `src/screens.jsx`
- `src/styles.css`
- `package.json`
- `scripts/test-dot18-chang-4.mjs` (Tạo mới 15 tests)

### 3. Kết quả kiểm thử
- `scripts/test-dot18-chang-4.mjs`: **15/15 kiểm thử đạt (100%)**
- `npm run build`: **Bản build sản xuất sạch (228ms)**
- `npm run e2e`: **46/46 kịch bản Playwright đạt (100%)**

---

## CHI TIẾT CHẶNG 5: GẤU NGHE CON TRẢ LỜI (PROMPT 18 CHẶNG 5)

### 1. Việc đã làm
- **1.1 Chuẩn hóa chuyển đổi số bằng chữ sang số:**
  - Chuyển đổi chính xác các từ chỉ số trong tiếng Việt trước khi chấm điểm: "hai mươi hai" -> "22", "ba chục" -> "30", "mười lăm" -> "15".
  - Bảo vệ ngữ nghĩa phủ định: các từ "không biết", "không hiểu", "không rõ" được bảo vệ tránh bị hiểu nhầm thành số 0.
- **1.2 Backend Worker API (`POST /api/v1/ai/judge-answer`):**
  - Xây dựng endpoint hỗ trợ prompt `p18_judge_answer` với model `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, timeout 10s.
  - Phân loại 4 trường hợp đánh giá chính xác:
    - `dung`: Con nêu đúng kết quả hoặc ý chính -> khen ngợi cụ thể, gợi ý mẹ bấm "Con làm được rồi".
    - `gan_dung`: Con đúng một phần hoặc đúng số nhưng thiếu chi tiết -> gợi ý câu mẹ nói tiếp để con hoàn thành.
    - `sai_huong`: Con chọn sai số hoặc phép tính -> gợi mở để con suy nghĩ lại, không lộ đáp án; có nút chuyển sang "Chẻ nhỏ câu hỏi".
    - `khong_ro`: Chưa nghe rõ nội dung con nói -> khích lệ con nói lại, không trừ lượt.
  - Bộ chặn rò rỉ đáp án: `cau_me_noi_tiep` tuyệt đối không vô tình tiết lộ đáp án cho con.
  - **Quyền riêng tư tuyệt đối:** Không bao giờ lưu audio, file ghi âm hay raw transcript vào Database/R2. Chỉ lưu kết quả đánh giá phân loại (`voice_verdict`) vào `learning_events`.
- **1.3 Giao diện người dùng (`Scaffold` trong `src/screens.jsx` & `src/styles.css`):**
  - Nút bấm `🎙 Con trả lời, Gấu nghe`:
    - Tự động kiểm tra quyền và hỗ trợ micro (ẩn an toàn nếu trình duyệt không hỗ trợ).
    - Lắng nghe qua Web Speech API tiếng Việt real-time (tối đa 15 giây tự ngắt).
  - Bong bóng thoại hiển thị câu con vừa nói: `{TÊN CON} NÓI: "..."`.
  - Thẻ nhận định sư phạm:
    - Huy hiệu phân loại (`✓ Đúng rồi`, `⚡ Gần đúng`, `⚠️ Sai hướng nhẹ`, `❓ Chưa nghe rõ`).
    - Dòng cam kết bảo mật: `Gấu nghe được, không lưu giọng nói`.
    - Lời nhận xét cho mẹ và khối `MẸ NÓI TIẾP: "..."`.
    - Nút chốt bài `✓ Mẹ chốt: Con làm được rồi!` (mẹ luôn là người duyệt cuối cùng).
    - Nút `🎙 Con nói lại` và `Chẻ nhỏ câu hỏi` khi con sai hướng.

### 2. Files đã chỉnh sửa
- `../study-en/ai-gateway-worker/src/v1_routes.js`
- `../study-en/ai-gateway-worker/src/index.js`
- `src/api.js`
- `src/screens.jsx`
- `src/styles.css`
- `package.json`
- `scripts/test-dot18-chang-5.mjs` (Tạo mới 16 tests)

### 3. Kết quả kiểm thử
- `scripts/test-dot18-chang-5.mjs`: **16/16 kiểm thử đạt (100%)**
- `npm run build`: **Bản build sản xuất sạch (217ms)**
- `npm run e2e`: **46/46 kịch bản Playwright đạt (100%)**

---

## CHI TIẾT CHẶNG 6: BÀI ANH EM THÍCH ỨNG (PROMPT 18 CHẶNG 6)

### 1. Việc đã làm
- **1.1 Backend Worker API (`POST /api/v1/ai/brother`):**
  - Xây dựng endpoint hỗ trợ prompt `p18_brother` với model `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, timeout 12s.
  - Tạo bài toán mới cùng dạng, đổi nhân vật/đồ vật và số liệu, tập trung rèn luyện đúng kỹ năng mà con vừa bị kẹt trong buổi học (`stuck_skill`).
  - Toàn bộ bài toán và đáp án đi qua máy tính độc lập `correctLessonMath` đảm bảo 100% chính xác về phép tính toán học (`math_verified = true`).
  - Giới hạn lời giải thích cho mẹ `vi_sao_cho_me` tối đa 20 từ.
- **1.2 Cơ chế gọi AI thông minh:**
  - Nếu buổi học có bất kỳ bậc nào con cần gợi ý (`can_goi_y`) hoặc mẹ dẫn (`me_dan`): kích hoạt tạo bài anh em thích ứng nhắm đúng kỹ năng vừa kẹt.
  - Nếu con tự làm hết (`tu_lam` 100%): dùng bài anh em có sẵn trong bài giảng, không gọi AI để tiết kiệm token và giữ trọn vẹn kết quả.
- **1.3 Giao diện Xong bài (`Done` trong `src/screens.jsx` & `src/styles.css`):**
  - Thẻ `GẤU KHEN ĐÚNG CHỖ`: tổng hợp lời khen cụ thể theo từng bậc học của con (ví dụ: Bậc 1 con đổi đơn vị nhanh, bậc 3 con tự giác kiểm tra lại).
  - Thẻ `BÀI ANH EM CHO [TÊN CON] · 5 PHÚT`:
    - Dòng định hướng: `Luyện đúng chỗ vừa kẹt: [Kỹ năng con kẹt]`.
    - Đề bài toán mới trong ngoặc kép rõ ràng.
    - Huy hiệu uy tín: `✓ Gấu đã kiểm phép tính`.
    - Nút bấm `Làm thử`: tự động mở một bài ngắn theo đúng luồng hỏi con từng bậc.

### 2. Files đã chỉnh sửa
- `../study-en/ai-gateway-worker/src/v1_routes.js`
- `../study-en/ai-gateway-worker/src/index.js`
- `src/api.js`
- `src/screens.jsx`
- `src/styles.css`
- `package.json`
- `scripts/test-dot18-chang-6.mjs` (Tạo mới 14 tests)

### 3. Kết quả kiểm thử
- `scripts/test-dot18-chang-6.mjs`: **14/14 kiểm thử đạt (100%)**
- `npm run build`: **Bản build sản xuất sạch (220ms)**
- `npm run e2e`: **46/46 kịch bản Playwright đạt (100%)**

---

## CHẶNG 7: LINH VẬT ĐỘNG (HOÀN THIỆN PHẦN ĐÃ LÀM)

### 1. Các hạng mục đã thực hiện
- **1.1 Bé Cơm Nắm (onigiri) cho bộ Bento Mềm:**
  - Bổ sung cấu hình hình vẽ SVG `onigiri` vào thư viện `buddyArt.js` với đầy đủ 9 trạng thái cảm xúc (`idle`, `hello`, `reading`, `thinking`, `cheer`, `love`, `surprised`, `oops`, `sleepy`).
  - Đăng ký tên linh vật `onigiri: "Bé Cơm Nắm"` vào `BUDDY_NAMES` và `ORDER`.
  - Bổ sung trọn bộ câu thoại `hello`, `nudge`, `cheer` cho Bé Cơm Nắm vào `buddyQuotes.js`.
  - Cập nhật `customPalette.js` gán bộ `bento` vào Bé Cơm Nắm `onigiri` thay vì `none`.
- **1.2 Bong bóng lời nói trang chủ:**
  - Sửa lỗi bong bóng che dòng chào "Chào buổi sáng, mẹ!": định vị bong bóng ở bên dưới linh vật (`top: calc(100% + 6px); right: 0;`).
  - Màu nền đặc `var(--c-surface)`, chữ `var(--c-text)`, có viền và đổ bóng rõ ràng, không bị lẫn chữ ở các bộ tối (Cực Quang, Bảng Phấn).
  - Chiều rộng tối đa 220px, tự động ẩn sau 3 giây.
- **1.3 Tắt chuyển động (`data-motion="off"` & `prefers-reduced-motion`):**
  - Khi tắt chuyển động, linh vật đứng yên hoàn toàn (tắt nhảy, thở, lắc lư, chớp mắt), nhưng vẫn giữ nguyên biểu cảm khuôn mặt và phụ kiện/đạo cụ.
- **1.4 Linh vật phản ứng đồng bộ trong lúc học:**
  - **Màn Hỏi con từng bước (`Scaffold`):** Linh vật nhỏ 48px đứng cạnh câu hỏi:
    - Con làm được rồi -> `cheer`
    - Con chưa nghĩ ra -> `thinking`
    - Gấu nghe con: `dung` -> `cheer`, `gan_dung` -> `thinking`, `sai_huong` -> `surprised`, `khong_ro` -> `idle`
    - Câu nhỏ hơn hiện ra -> `reading`
  - **Màn Xong bài (`Done`):** Ở mọi bộ giao diện không theo mùa, hiển thị linh vật cỡ lớn (96px) chúc mừng với trạng thái `cheer` (và chuyển sang `love` khi con dạy lại bài cho mẹ).
  - **Màn Báo cáo (`Report`):** Linh vật hiển thị `reading` khi đang phân tích và `oops` khi gặp lỗi.

### 2. Files đã chỉnh sửa
- `src/themes/buddies/buddyArt.js`
- `src/themes/buddies/buddyQuotes.js`
- `src/themes/customPalette.js`
- `src/themes/buddies/buddySvgs.jsx`
- `src/themes/buddies/buddy.css`
- `src/screens.jsx`
- `package.json`
- `scripts/test-dot18-chang-7.mjs` (Tạo mới 6 nhóm kiểm thử)

### 3. Kết quả kiểm thử
- `scripts/test-dot18-chang-7.mjs`: **6/6 kiểm thử đạt (100% - bao gồm 99 tổ hợp SVG linh vật)**
- `npm test`: **Toàn bộ test suite dự án đạt (100%)**
- `npm run build`: **Bản build sản xuất sạch (315ms)**

---

## CHẶNG 8: LỖI GIAO DIỆN CÒN LẠI

### 1. Các hạng mục đã thực hiện
- **1.1 Bảng trượt (Sheet) cố định theo màn hình:**
  - Cập nhật `.sheet` trong `src/styles.css` sang `position: fixed; inset: 0; z-index: 50;` giúp các bảng trượt ("Thành viên gia đình", "Lớp học của con", "Vào lớp",...) luôn hiển thị trên màn hình, không bị trượt ra ngoài khi trang dài và nằm phía trên thanh tab (`z-index: 8`).
  - Đảm bảo các nút đóng đều có nhãn trợ năng `aria-label="Đóng"`.
- **1.2 Xử lý link vào lớp sai (/vao-lop/<mã sai>):**
  - Trong `src/App.jsx`: Khi mở link vào lớp sai và chưa đăng nhập, nếu kiểm tra mã thất bại, lập tức xoá `pendingJoin` khỏi bộ nhớ và chuyển cờ báo lỗi `error: true`.
  - Trong `src/Login.jsx`: Hiển thị thông báo "⚠️ Mã lớp không còn dùng được" ngay trên trang đăng nhập.
  - Sau khi phụ huynh đăng nhập, bảng Vào lớp không còn tự động bật lên ngoài màn hình.
- **1.3 Nút nổi "Mẹ bình tĩnh" & khoảng đệm cuối trang:**
  - Bổ sung khoảng đệm cuối trang `padding-bottom: calc(184px + env(safe-area-inset-bottom))` để nút nổi không che nội dung cuối trang và lưới theo dõi học đều.
  - Cập nhật hàm `handleScrollFab`: Khi cuộn xuống quá 40px, nút nổi tự động thu gọn thành nút tròn mềm mại (`fabCompact`) để tránh che bài tập; khi cuộn lên đầu trang, nút mở lại dạng đầy đủ "Mẹ bình tĩnh".
- **1.4 Tăng cường độ ổn định Admin (Chống sập trắng & Error Boundary):**
  - Khắc phục lỗi gọi `.toLocaleString()` trên giá trị `undefined` trong `src/admin/RouterPage.jsx` và `ModelParamsPage.jsx` bằng cách bọc fallback an toàn `Number(val || 0).toLocaleString(vi-VN)`.
  - Bổ sung lớp bắt lỗi `AdminPageErrorBoundary` cho từng trang trong `src/Admin.jsx`, đảm bảo nếu một trang admin gặp lỗi dữ liệu cũng không làm trắng cả khung admin và phụ huynh/quản trị viên có thể bấm "Thử tải lại" hoặc "Về Tổng quan".
- **1.5 Gợi ý mùa 1/6:**
  - Cập nhật `getSeasonSuggestCopy` trong `src/seasons/SeasonHomeLayer.jsx`: Đúng ngày 1/6 hiển thị tiêu đề "🎈 Hôm nay là 1/6! Cả nhà thử bộ Cầu Vồng 1/6 không?", các ngày trước ngày 1/6 hiển thị "🎈 Sắp tới 1/6 rồi! Cả nhà thử bộ Cầu Vồng 1/6 không?".
- **1.6 Cổng giáo viên - Bộ icon menu riêng biệt:**
  - Thiết kế lại toàn bộ 6 icon menu trong `src/TeacherBearIcons.jsx` thành các biểu tượng SVG trực quan riêng biệt (Lớp: Ngôi trường/Lớp học; Bài tập: Quyển vở mở; Học sinh: Nhóm học sinh; Thông báo: Chuông rung; Kết quả: Biểu đồ cột; Cài đặt: Bánh răng; Mã QR: Thẻ QR).
  - Không còn tình trạng 6 mục menu đều dùng chung một mặt gấu gây khó phân biệt.

### 2. Files đã chỉnh sửa
- `src/styles.css`
- `src/FamilyClassSheet.jsx`
- `src/App.jsx`
- `src/Login.jsx`
- `src/admin/RouterPage.jsx`
- `src/admin/ModelParamsPage.jsx`
- `src/Admin.jsx`
- `src/seasons/SeasonHomeLayer.jsx`
- `src/TeacherBearIcons.jsx`
- `package.json`
- `scripts/test-dot18-chang-8.mjs` (Tạo mới 6 nhóm kiểm thử)

### 3. Kết quả kiểm thử
- `scripts/test-dot18-chang-8.mjs`: **6/6 kiểm thử đạt (100%)**
- `npm run build`: **Bản build sản xuất sạch (336ms)**
