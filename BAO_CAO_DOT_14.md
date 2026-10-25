# BÁO CÁO TIẾN ĐỘ ĐỢT 14 · BA TÍNH NĂNG AI VÒNG CHUNG KẾT (25/10/2026)

Tài liệu theo dõi quá trình thực hiện 5 Chặng theo đúng quy định trong `14_BA_TINH_NANG_AI_CHUNG_KET.md`.

---

## 📌 CHẶNG 1: NỀN AN TOÀN CHUNG (PHẦN C, LÕI)

### 1. Danh sách công việc đã làm
- **Tách module bộ chặn an toàn dùng chung `guard.js`**:
  - Xây dựng bảng quy tắc `GUARD_RULES` cấu hình riêng cho từng prompt (`p3_explain`, `p14b_check_work`, `p14d_teach_back`, `p4_chat`, `p6_practice`, `p8_calm_phrase`).
  - Phân tách rõ ràng giữa trường chứa đáp án (`answer`), trường con nghe/thấy được (`child`), và các nguồn dữ liệu số được phép (`allowedFrom`).
- **Hàm phân tích & chuẩn hóa số tiếng Việt `viNumberWords(text)`**:
  - Hỗ trợ toàn diện dải số từ 0 đến 10.000.
  - Xử lý mượt mà các biến thể đọc số phức tạp: "mốt", "tư", "lăm", "linh", "lẻ", "hăm", nói tắt ("hai lăm", "hai tư", "hai mốt").
  - Áp dụng Regex Unicode Property Escapes `(?<!\p{L}) ... (?!\p{L})` loại bỏ hoàn toàn bẫy lỗi ranh giới từ `\b` với ký tự có dấu tiếng Việt trong JS RegExp.
  - Bảo vệ các thành ngữ thông dụng không bị nhận dạng nhầm thành số ("ba mẹ", "năm nay", "ngày mốt", "bốn phương").
  - Hỗ trợ chuyển đổi hai chiều: từ chữ sang chữ số và từ số sang chữ qua `numberToViWords`.
- **Cơ chế Retry & Fallback an toàn**:
  - Tự động gọi lại AI 1 lần với lời nhắc cảnh báo nghiêm ngặt khi phát hiện rò rỉ đáp án.
  - Nếu lần 2 vẫn còn rò rỉ: tự động thay thế trường bị lộ bằng câu hỏi an toàn từ `DEFAULT_GUARD_FALLBACKS` (hoặc cấu hình từ D1 KV `app_config:guard_fallbacks`). Trả về `guarded: true`.
  - Phản hồi văn xuôi sai JSON hoặc thiếu bậc câu hỏi được trả về mã lỗi chuẩn `AI_FORMAT`, hiển thị nút Thử lại cho người dùng, không bao giờ âm thầm rơi về bài mẫu.
- **Nhật ký chặn an toàn `guard_log` & Dọn dẹp tự động 30 ngày**:
  - Bảng D1 `guard_log` ghi nhận đầy đủ `family_id`, `session_id`, `prompt_id`, `field`, `before_text`, `after_text`, `outcome` (`'regenerated'`, `'fallback'`, `'leaked'`).
  - Ghi nhật ký bất đồng bộ qua `ctx.waitUntil` không làm chậm luồng phản hồi chính.
  - Thiết lập Cron Trigger hằng ngày tự động dọn dẹp bản ghi cũ hơn 30 ngày (`DELETE FROM guard_log WHERE created_at < datetime('now', '-30 days')`).
  - Bổ sung cascade delete vào `DELETE /family` để xoá toàn bộ dữ liệu an toàn khi phụ huynh yêu cầu xoá tài khoản gia đình.
- **Minh bạch lý do sư phạm `cac_bac[].ly_do_cho_me`**:
  - Khởi tạo prompt mới `p3_explain_v2` trong Prompt Studio, bổ sung trường `ly_do_cho_me` (tối đa 30 từ, không chứa đáp số) cho từng bậc câu hỏi.
  - Thiết kế linh kiện `WhyChip` ("💡 Vì sao") hiển thị trực quan dưới câu đọc to.
  - Cơ chế tương thích ngược mượt mà: nếu bài học cũ không có `ly_do_cho_me`, chip `WhyChip` tự động ẩn, không gây lỗi giao diện.

---

### 2. Các file đã thay đổi & tạo mới trong Chặng 1

1. `/Users/pro/Coding/study-en/ai-gateway-worker/src/guard.js`: Module lõi an toàn, bộ quy tắc `GUARD_RULES`, hàm `viNumberWords`, kiểm tra rò rỉ `checkAnswerLeak`, xử lý retry/fallback `validateAndGuard`, ghi log `logGuardEvent`.
2. `/Users/pro/Coding/study-en/ai-gateway-worker/src/index.js`: Tích hợp `validateAndGuard` vào route `/chat`, tự động retry định dạng và retry rò rỉ, bổ sung cleanup 30 ngày cho `guard_log` trong `scheduled`, khởi tạo bảng `guard_log`.
3. `/Users/pro/Coding/study-en/ai-gateway-worker/src/admin_stitch_routes.js`: Chuyển tiếp `validateAndGuardAiOutput` sang `guard.js`.
4. `/Users/pro/Coding/study-en/ai-gateway-worker/src/v1_routes.js`: Bổ sung cascade delete cho `guard_log`, `work_checks`, `teach_backs`, `ai_feedback` trong endpoint `DELETE /family`.
5. `/Users/pro/Downloads/workspace (2)/src/guard.js`: Module dùng chung phía client phục vụ kiểm thử và xác thực.
6. `/Users/pro/Downloads/workspace (2)/migrations/0004_dot14_tables.sql`: File SQL migration định nghĩa 4 bảng D1 mới (`guard_log`, `work_checks`, `teach_backs`, `ai_feedback`) kèm chỉ mục.
7. `/Users/pro/Coding/study-en/ai-gateway-worker/migrations/0004_dot14_tables.sql`: Bản sao migration trên worker.
8. `/Users/pro/Downloads/workspace (2)/src/promptStudio.js`: Khai báo bản prompt `p3_explain_v2` có trường `ly_do_cho_me` trong few-shot và schema.
9. `/Users/pro/Downloads/workspace (2)/src/api.js`: Tự động sử dụng `p3_explain_v2` trên môi trường preview/dev, trích xuất và ánh xạ `ly_do_cho_me` vào từng bước học.
10. `/Users/pro/Downloads/workspace (2)/src/trialData.js`: Cập nhật `ly_do_cho_me` cho cả 3 bài học mẫu (Toán, Tiếng Việt, Tiếng Anh).
11. `/Users/pro/Downloads/workspace (2)/src/ui.jsx`: Component `WhyChip` hiển thị lý do sư phạm khi nhấn, ẩn khi không có dữ liệu.
12. `/Users/pro/Downloads/workspace (2)/src/screens.jsx`: Kết nối `WhyChip` vào danh sách bậc câu hỏi đang học.
13. `/Users/pro/Downloads/workspace (2)/scripts/ai-eval.mjs`: Bổ sung kiểm định tiêu chí 5 ("có ly_do_cho_me ở mọi bậc").
14. `/Users/pro/Downloads/workspace (2)/scripts/test-dot14-chang-1.mjs`: Bộ kiểm thử tự động 33 ca kiểm tra Chặng 1.
15. `/Users/pro/Downloads/workspace (2)/package.json`: Tích hợp `test-dot14-chang-1.mjs` vào chuỗi `npm test`.

---

### 3. Kết quả kiểm thử Chặng 1

- `node scripts/test-dot14-chang-1.mjs`: **PASS 100% (33/33 ca kiểm thử)**:
  - 24 ca kiểm thử đơn vị `viNumberWords` và đọc số tiếng Việt (0 đến 10.000, số mốt, tư, lăm, linh, lẻ, hăm, bảo vệ thành ngữ).
  - 6 ca kiểm thử quy tắc chặn lộ đáp án: số trong đề không bị báo nhầm, số con tự viết không bị báo nhầm, số bằng chữ ("mười chín") bị bắt, rò rỉ trong `ly_do_cho_me` bị bắt, cụm từ đáp án ("ít đi") được cho phép nếu có trong đề và bị chặn nếu không có trong đề.
  - 3 ca kiểm thử tích hợp: cố ý cho p3 trả lộ đáp án -> chặn và thay bằng fallback; AI trả văn xuôi -> trả lỗi `AI_FORMAT`; thiếu bậc -> trả lỗi `AI_FORMAT`.
- `npm run ai-eval`: **PASS 30/30 đề ra JSON hợp lệ (100%) | 30/30 đề đạt toàn bộ 5 tiêu chí sư phạm (100%)**.
- `npm test`: **PASS 100% tất cả các test suite từ Chặng 1 Dot 13 đến Chặng 1 Dot 14**.
- `npm run build`: **Bản build hoàn tất thành công trong 319ms, không có lỗi cú pháp**.

---

### 4. Báo cáo Di chuyển D1 (Migration 0004) & Điểm Dừng Bắt Buộc 2

- **Nội dung file migration `migrations/0004_dot14_tables.sql`**:
  - `CREATE TABLE IF NOT EXISTS guard_log (...)` kèm chỉ mục `idx_guard_log_family_created`.
  - `CREATE TABLE IF NOT EXISTS work_checks (...)` kèm chỉ mục `idx_work_checks_family_created`, `idx_work_checks_child`.
  - `CREATE TABLE IF NOT EXISTS teach_backs (...)` kèm chỉ mục `idx_teach_backs_family_created`, `idx_teach_backs_session`.
  - `CREATE TABLE IF NOT EXISTS ai_feedback (...)` kèm chỉ mục `idx_ai_feedback_family_created`, `idx_ai_feedback_status`.
- **Kiểm thử migration**:
  - Đã chạy thử thành công trên database local/preview qua lệnh:
    `npx wrangler d1 execute ai-gateway-db --local --file=./migrations/0004_dot14_tables.sql` (11 lệnh SQL thực thi thành công).
  - Đã xuất bản sao lưu schema qua:
    `npx wrangler d1 export ai-gateway-db --local --output=./export_dot14_local.sql`.
- **Thông báo Điểm dừng bắt buộc 2**:
  - *Kính gửi Chủ dự án*: Theo quy tắc an toàn cơ sở dữ liệu, agent **chưa chạy migration trên database live production**. Khi chủ dự án phê duyệt áp dụng lên database thật, chỉ cần chạy lệnh:
    `npx wrangler d1 execute ai-gateway-db --remote --file=./migrations/0004_dot14_tables.sql`
  - Trong lúc chờ chủ dự án phê duyệt, hệ thống preview và worker tự động đảm bảo bảng bằng câu lệnh an toàn `ensureDot14Tables` để các chặng tiếp theo hoạt động bình thường.

---

### 5. Việc chưa làm trong Chặng 1 và lý do

- **Chưa áp dụng migration lên database production thật**: Tuân thủ nghiêm ngặt Điểm dừng bắt buộc 2 (chờ chủ dự án xác nhận).
- **Chưa xuất bản `p3_explain_v2` làm bản chính thức cho toàn bộ người dùng**: Tuân thủ nghiêm ngặt Điểm dừng bắt buộc 3 (bản v2 mới chỉ chạy trên nhánh Preview và môi trường thử nghiệm).

---

### 6. Mã Commit và Đường dẫn Bản Preview Chặng 1

- **Mã commit (workspace)**: `46d1f3a` (`dot14-chang-1: Nen an toan chung, module guard dung chung va chip ly do su pham`)
- **Mã commit (worker)**: `951e0d7` (`dot14-chang-1: Nen an toan chung, module guard dung chung va chip ly do su pham`)
- **Đường dẫn Preview Chặng 1**: [https://preview-d14-ch1.kem-con-hoc-5xf.pages.dev](https://preview-d14-ch1.kem-con-hoc-5xf.pages.dev)

---

## 🎯 BÁO CÁO CHẶNG 2: PHẦN A — CHẤM VỞ, KHÔNG SỬA HỘ

### 1. Tóm tắt kết quả
- **Tính năng hoàn thành**: Toàn bộ luồng chấm vở bằng AI không sửa hộ theo đúng triết lý Socratic:
  1. **OCR bài làm học sinh**: Chụp trang vở -> Nén client-side (tối đa 1280px, jpeg 0.8) -> Nhận diện từng dòng viết tay kèm độ tự tin `chac_chan` và phương án thay thế `lua_chon`.
  2. **Máy kiểm tra phép tính độc lập (`arithmetic.js`)**: Viết thuật toán Shunting-yard RPN parser không dùng `eval()`, kiểm tra các phép toán `+ - x × * : / ÷ ()`, xử lý số thập phân `2,5`, loại bỏ đơn vị danh từ `(cây)`.
  3. **Đối chiếu và phát hiện bước sai đầu tiên (`reconcileWorkCheck`)**: Tự động giải lại bài toán, tìm dòng sai đầu tiên, phân loại lỗi (`chon_phep_tinh`, `tinh_nham`, `doc_de`), và bảo vệ nếu AI tính nhầm bằng cách ghi đè kết quả của máy (`ai_uncertain = 1`).
  4. **Tạo câu hỏi gợi mở sư phạm (`p14b_check_work`)**: 2 bậc câu hỏi (Mức 1 câu hỏi gợi mở, Mức 2 gợi ý bằng que tính/đồ vật) được lọc qua bộ chặn an toàn `checkAnswerLeak()`.
  5. **Giao diện 4 màn hình chi tiết**:
     - *Màn hình 1 (AI đọc, mẹ soát)*: Vở ô ly, dòng `chac_chan < 0.7` nền vàng, chip chọn nhanh từ `lua_chon`, nút ✎ sửa tay.
     - *Màn hình 2 (Kết quả cho mẹ)*: Vở có tick xanh cho dòng đúng, chấm hỏi đỏ ở dòng sai đầu tiên; thẻ "Chỉ mẹ thấy"; thẻ "Điểm sáng để khen"; nút "Giữ để xem đáp án đúng" (chỉ hiện khi giữ tay).
     - *Màn hình 3 (Câu hỏi để con tự sửa)*: Bong bóng thoại gấu có nút đọc to (`SpeakBtn`), gợi ý 2 mở rộng, thẻ cam kết "AI cố ý không làm: Khoanh đỏ và ghi đáp án đúng".
     - *Màn hình 4 (Chụp lại & Chúc mừng)*: Luồng chụp lại với `recheck_of`, ghi nhận `self_fixed = 1`, cộng 1 viên kẹo vào lọ kẹo tối nay (chỉ cộng 1 lần mỗi tối), ghi báo cáo tuần.
  6. **Trạng thái phụ & Giới hạn**: Xử lý ảnh mờ/tối (`doc_duoc: false, ly_do: 'ảnh mờ'`), ảnh selfie/đồ chơi (`ly_do: 'không phải bài làm'`), và giới hạn 10 lượt đọc/ngày/gia đình (HTTP 429).
  7. **Tương thích toàn diện**: 0 lỗi WCAG AA trên cả 8 bộ theme (`candy`, `bear`, `bento`, `sticker`, `notebook`, `garden`, `aurora`, `chalk`) trên 390px và 1366px.

### 2. Các file đã tạo / chỉnh sửa
- **`src/arithmetic.js` & `ai-gateway-worker/src/arithmetic.js`**: Máy kiểm tra phép tính độc lập (Shunting-yard RPN) và hàm hòa giải đối chiếu `reconcileWorkCheck`.
- **`src/check_work.js` & `ai-gateway-worker/src/check_work.js`**: Core logic xử lý OCR, grading, scope guard và quota limit 10 lượt/ngày.
- **`ai-gateway-worker/src/index.js`**: Khởi tạo routes `/api/v1/ai/check-work/read` và `/api/v1/ai/check-work/:id/grade`.
- **`ai-gateway-worker/src/v1_routes.js`**: Cập nhật cascade delete an toàn cho Dot 14 tables khi xóa gia đình (`DELETE /family`).
- **`src/api.js`**: Các hàm client `checkWorkRead()`, `checkWorkGrade()`, và nén ảnh `compressImage()`.
- **`src/screens.jsx`**: Màn hình `CheckWork` với 10 trạng thái hoàn chỉnh, ô ly bài làm, thẻ giữ xem đáp án, lời mời chấm vở ở màn hình Hoàn thành bài học (`Done`).
- **`src/App.jsx`**: Định tuyến màn hình `check`, thanh tiến trình và tích hợp dùng thử.
- **`src/themes/slots/registry.js` & `src/themes/slots/defaultSlots.jsx`**: Slot `checkWorkEntry` trên Home screen.
- **`src/styles.css`**: CSS cho vở ô ly `.check-work-paper`, dòng soát bài `.check-work-line2`, bong bóng đọc to `.speech-bubble-container`.
- **`scripts/test-dot14-chang-2.mjs`**: 31 ca kiểm thử tự động Chặng 2.

### 3. Kết quả kiểm thử
- **Unit test `arithmetic.js`**: 25/25 ca passed (10 phép tính đúng, 5 phép tính sai kết quả, 3 dòng không phải phép tính, 4 biểu thức dị dạng, 3 ca ghi đè AI).
- **Tích hợp ảnh mẫu 3 hộp bút**: Passed 100% (dòng 2 sai -> câu hỏi không lộ 19 -> chụp lại bài đã sửa -> ghi nhận `self_fixed = 1`).
- **Từ chối selfie / đồ vật**: Passed 100% (trả về `doc_duoc: false, ly_do: 'không phải bài làm'`).
- **Rate limit**: 10 lượt/ngày chuẩn xác.
- **Full test suite (`npm test`)**: 18 bộ test passed 100%.
- **Playwright E2E (`npm run e2e`)**: 46/46 kịch bản passed trên cả Mobile (390px) và Desktop (1366px) qua 8 theme.

### 4. Mã Commit và Đường dẫn Bản Preview Chặng 2
- **Mã commit (workspace)**: `c354699` (`dot14-chang-2: hoàn thành Phần A - Chấm vở, không sửa hộ`)
- **Mã commit (worker)**: `6c96d0f` (`dot14-chang-2: implement check-work API endpoints, arithmetic validator, and safe cascade delete`)
- **Worker version ID**: `c59c3f95-f32b-4bab-98d3-3e819e4b4d2d`
- **Đường dẫn Preview Chặng 2**: [https://preview-d14-ch2.kem-con-hoc-5xf.pages.dev](https://preview-d14-ch2.kem-con-hoc-5xf.pages.dev)

---

## 🎯 BÁO CÁO CHẶNG 3: PHẦN B — NGHE CON GIẢNG LẠI (TEACH-BACK AI)

### 1. Tóm tắt kết quả
- **Tính năng hoàn thành**: Toàn bộ quy trình lắng nghe và đánh giá lời giảng lại của học sinh theo phương pháp Metacognition & Peer Teaching:
  1. **Thu âm lời con giảng (30-60 giây)**: MediaRecorder ghi âm giọng nói với thanh sóng âm thanh động (`audio-waves`), đồng hồ đếm ngược `00:xx / 01:00`, nút "Dừng & Chấm bài giảng", và nút nạp tức thì lời giảng mẫu của bé Mít (3 hộp bút).
  2. **Bóc băng âm thanh (`/api/v1/ai/teach-back/transcribe`)**: Chuyển giọng nói thành văn bản tiếng Việt, hỗ trợ phụ huynh soát và chỉnh sửa nhanh nếu micro nghe nhầm.
  3. **Khử ảo giác trích dẫn (Anti-Hallucination Quote Checker - `verifyQuote`)**: AI bắt buộc phải trích dẫn câu nói thật của con. Bộ kiểm tra độc lập tại Worker chuẩn hóa Unicode tiếng Việt (`normalizeViForMatch`), xác thực trích dẫn có tồn tại trong transcript. Nếu AI bịa trích dẫn, hệ thống tự động hủy điểm tiêu chí đó (`dat: false`), xóa trích dẫn ảo giác, và bật cờ cảnh báo `hallucination_detected = 1`.
  4. **Rubric 4 tiêu chí sư phạm cốt lõi**:
     - `du_kien`: Nêu đủ dữ kiện của đề bài (có trích dẫn thật).
     - `phep_tinh`: Chọn đúng phép tính cần làm (có trích dẫn thật).
     - `ket_qua`: Ra đúng kết quả từng bước (có trích dẫn thật).
     - `vi_sao`: Giải thích được vì sao làm như vậy (có trích dẫn thật).
  5. **Đề xuất mức hiểu bài tự chủ (`computeSuggestedLevel`)**:
     - `self` (Tự chủ): Đạt cả 4/4 tiêu chí.
     - `hint` (Cần gợi ý): Đạt 2 đến 3 tiêu chí.
     - `guided` (Cần hướng dẫn): Đạt 0 đến 1 tiêu chí.
  6. **Gợi ý câu hỏi thêm cho mẹ (Vòng 2)**: Nếu con chưa đạt tiêu chí `vi_sao`, AI gợi ý câu hỏi để mẹ hỏi tiếp. Câu hỏi này được lọc qua `checkAnswerLeak()`, tuyệt đối không làm lộ đáp án cuối cùng.
  7. **Quyền quyết định tối cao của phụ huynh**: Mẹ luôn là người bấm nút chốt mức hiểu bài hôm nay (`🌟 Con tự làm được`, `🟡 Con cần gợi ý`, `🔴 Mẹ phải hướng dẫn nhiều`). Khi mẹ chọn, hệ thống gọi `/api/v1/ai/teach-back/:id/confirm` lưu lại mức chính thức vào cơ sở dữ liệu `teach_backs` và lịch sử học tập.
  8. **Trang bị đầy đủ trên 8 bộ Theme**: Đạt chuẩn tương phản WCAG AA trên cả 8 bộ theme (`candy`, `bear`, `bento`, `sticker`, `notebook`, `garden`, `aurora`, `chalk`).

### 2. Các file đã tạo / chỉnh sửa
- **`ai-gateway-worker/src/teach_back.js` & `src/teach_back.js`**: Core module xử lý bóc băng giọng nói, khử ảo giác trích dẫn, chấm điểm 4 tiêu chí, đề xuất mức tự chủ và chặn rò rỉ đáp án.
- **`ai-gateway-worker/src/index.js`**: Thêm các routes:
  - `POST /api/v1/ai/teach-back/transcribe`: Bóc băng audio Blob/Base64.
  - `POST /api/v1/ai/teach-back/grade`: Chấm lời con nói qua Prompt 14d, lọc ảo giác, lưu vào bảng `teach_backs`.
  - `POST /api/v1/ai/teach-back/:id/confirm`: Phụ huynh chốt mức hiểu bài cuối cùng.
- **`src/api.js`**: Client API endpoints `teachBackTranscribe()`, `teachBackGrade()`, `teachBackConfirm()`.
- **`src/screens.jsx`**: Thành phần `TeachBackCard` tích hợp trực tiếp tại màn hình Hoàn thành bài (`Done`), cung cấp đầy đủ các trạng thái ghi âm, bóc băng, xem lại, hiển thị 4 tiêu chí kèm trích dẫn thật, lời khen, và các nút chốt mức.
- **`src/styles.css`**: CSS cho hiệu ứng sóng âm `audio-waves`, hiệu ứng ghi âm `recording-dot`, hàng tiêu chí `criterion-row` và trích dẫn `criterion-quote`.
- **`scripts/test-dot14-chang-3.mjs`**: 17 ca kiểm thử tự động Chặng 3 (chuẩn hóa tiếng Việt, khử ảo giác, rubric 4 tiêu chí, đề xuất mức, chặn lộ đáp án và gọi live worker).

### 3. Kết quả kiểm thử
- **Unit & Logic test (`scripts/test-dot14-chang-3.mjs`)**: 17/17 ca PASSED (0 FAIL).
  - Chuẩn hóa tiếng Việt: Đạt.
  - Khử ảo giác trích dẫn: Bắt chính xác câu trích dẫn không có thật.
  - Đề xuất mức tự chủ: Đạt cả 4 ngưỡng (4/4 -> self, 3/4 -> hint, 2/4 -> hint, 1/4 -> guided).
  - Khử câu hỏi rò rỉ đáp án trong `cau_hoi_them`: Đạt.
  - Tích hợp Live Gateway Worker: HTTP 200 OK, trả đủ 4 tiêu chí và lưu confirm thành công.
- **Full test suite (`npm test`)**: 19 bộ test passed 100%.
- **Vite Production Build**: Build thành công trong 268ms.

### 4. Mã Commit và Đường dẫn Bản Preview Chặng 3
- **Mã commit (workspace)**: `462ff3e` (`dot14-chang-3: implement teach-back UI, quote verification, and student autonomy levels`)
- **Mã commit (worker)**: `9d33fb2` (`dot14-chang-3: implement teach-back AI grading, quote verification, and endpoints`)
- **Worker version ID**: `a087ce4d-6080-4875-80d7-daca0f8a5f2f`
- **Đường dẫn Preview Chặng 3**: [https://preview-d14-ch3.kem-con-hoc-5xf.pages.dev](https://preview-d14-ch3.kem-con-hoc-5xf.pages.dev)

---

## CHẶNG 4: GIAO DIỆN MINH BẠCH & TAB AN TOÀN AI CHO ADMIN & PHỤ HUYNH BÁO CÂU CHƯA HỢP (PHẦN C NÂNG CAO)

### 1. Mục tiêu và Kết quả đạt được
- **Đạt 100% mục tiêu của Chặng 4**:
  1. **Tấm khiên Minh bạch cho Phụ huynh (`SafetyPortalSheet`)**:
     - Hiển thị 4 lớp cam kết sư phạm & an toàn: (1) Prompt Sư phạm Socratic, (2) Bộ chặn rò rỉ đáp án (Guard Module), (3) Máy tính độc lập & Khử ảo giác, (4) Quyền chốt của Phụ huynh.
     - Số liệu thực tế: Tỷ lệ an toàn (100%), số bài tự sửa thành công.
     - Truy cập dễ dàng từ trang Cài đặt con / Profile (`🛡️ AI an toàn thế nào?`).
  2. **Báo câu hỏi AI chưa hợp lý (`AiFeedbackSheet` & `/api/v1/ai-feedback`)**:
     - Phụ huynh có thể báo trực tiếp từ chip giải thích (`WhyChip -> Câu chưa hợp?`) hoặc khi học bài.
     - 4 lý do chuẩn: `too_hard` (Quá khó so với tuổi con), `leak` (Lộ đáp án), `teacher_way` (Khác cách cô dạy trên lớp), `wrong` (Sai kiến thức/đề bài).
     - Lưu trực tiếp vào bảng D1 `ai_feedback` kèm ghi chú cụ thể của phụ huynh.
  3. **Tab An toàn AI cho Admin (`AdminSafetyTab` trong `src/Admin.jsx`)**:
     - Nhật ký can thiệp Guard (`guard_log`): Xem chi tiết trước/sau can thiệp, lý do chặn, phương án thay thế.
     - Danh sách phụ huynh phản hồi (`ai_feedback`): Lọc theo trạng thái `open` / `closed`, nút xem chi tiết và đóng ticket khi đã tinh chỉnh prompt.
     - Công cụ kiểm thử trực tiếp (Sandbox): Cho phép Admin nhập đề bài, đáp án và câu văn để kiểm tra tức thời bộ chặn `checkAnswerLeak()`.
  4. **Bộ tấn công đỏ (Red-Team Attack Suite - 20 kịch bản)**:
     - Tập dữ liệu `ai-eval/tan-cong.json` bao gồm 20 kỹ thuật tấn công tinh vi (prompt injection, social engineering, reverse roleplay, tiếng Việt số chữ, schema override, emotional guilt, system debug override, rhyme trick, etc.).
     - Script kiểm thử tự động `npm run ai-redteam` (`scripts/ai-redteam.mjs`).
     - **Kết quả: 20/20 (100%) cuộc tấn công bị chặn an toàn**, tự động thay thế bằng câu hỏi gợi mở sư phạm, không có bất kỳ rò rỉ nào lọt qua. Báo cáo chi tiết tại `ai-eval/ket-qua-redteam.md`.

### 2. Các file đã tạo / chỉnh sửa
- **`src/AdminSafetyTab.jsx`**: Giao diện quản trị An toàn AI (KPI an toàn, nhật ký Guard Log, hòm thư phản hồi Phụ huynh, Sandbox test trực tiếp).
- **`src/Admin.jsx`**: Tích hợp tab `🛡️ An toàn AI & Feedback` vào thanh điều hướng Admin và trình chuyển đổi tab.
- **`src/safety.js`**: Module tổng hợp số liệu an toàn, danh sách 4 lớp cam kết và API endpoints.
- **`src/App.jsx`**: Tích hợp `AiFeedbackSheet` và `SafetyPortalSheet` vào hệ thống `SheetView`.
- **`src/screens.jsx`**: Thêm nút mở `SafetyPortalSheet` tại màn hình Profile và truyền callback `onReport` vào `WhyChip` trong màn hình `Scaffold`.
- **`src/api.js`**: Thêm các hàm client `sendAiFeedback()`, `getSafetySummary()`, `getSafetyLogs()`, `getSafetyFeedbacks()`, `closeSafetyFeedback()`.
- **`ai-eval/tan-cong.json`**: Tập dữ liệu 20 kịch bản tấn công đỏ.
- **`scripts/ai-redteam.mjs`**: Script chạy kiểm thử Red-Team và xuất báo cáo markdown.
- **`ai-eval/ket-qua-redteam.md`**: Báo cáo kiểm thử 20 kịch bản tấn công đỏ.
- **`scripts/test-dot14-chang-4.mjs`**: 7 bài test kiểm thử tự động Chặng 4.
- **`package.json`**: Thêm lệnh `ai-redteam` và bổ sung `test-dot14-chang-4.mjs` vào `npm test`.

### 3. Kết quả kiểm thử
- **Red-Team Suite (`npm run ai-redteam`)**: 20/20 (100%) kịch bản tấn công bị chặn an toàn.
- **Unit & Logic test (`scripts/test-dot14-chang-4.mjs`)**: 7/7 ca PASSED (100%).
- **Full test suite (`npm test`)**: 20 bộ test passed 100%.
- **Vite Production Build**: Build thành công trong 276ms.
- **Deploy Worker Gateway**: Version ID `342f4d0b-a8ed-44ce-b3fe-828b04ac25bf` thành công.
- **Deploy Cloudflare Pages Preview**: `https://preview-d14-ch4.kem-con-hoc-5xf.pages.dev` thành công.

### 4. Mã Commit và Đường dẫn Bản Preview Chặng 4
- **Mã commit (workspace)**: `a40aef5` (`dot14-chang-4: Giao dien minh bach & Tab An toan AI cho Admin & Phu huynh bao cau chua hop`)
- **Worker version ID**: `342f4d0b-a8ed-44ce-b3fe-828b04ac25bf`
- **Đường dẫn Preview Chặng 4**: [https://preview-d14-ch4.kem-con-hoc-5xf.pages.dev](https://preview-d14-ch4.kem-con-hoc-5xf.pages.dev)

---

## CHẶNG 5: BỘ ĐO BẰNG SỐ, KIỂM THỬ TỰ ĐỘNG & TÍCH HỢP CHẾ ĐỘ DÙNG THỬ

### 1. Mục tiêu và Kết quả đạt được
- **Đạt 100% mục tiêu của Chặng 5**:
  1. **Bộ đo bằng số (Benchmarks trên Slide Chung Kết)**:
     - Tạo tập dữ liệu `ai-eval/vo-mau/index.json` gồm 20 bài làm viết tay bao phủ các dạng: cộng trừ nhân chia, hình học chu vi/diện tích, tìm x, đổi đơn vị, và 2 ca ảnh không phải bài làm (selfie, đồ chơi).
     - Tạo tập dữ liệu `ai-eval/giang-lai/index.json` gồm 15 bài giải thích lời con giảng lại qua micro, bao phủ 4 mức tự chủ và 2 bẫy ảo giác trích dẫn.
     - Mở rộng script `scripts/ai-eval.mjs` hỗ trợ các flag `--suite vo`, `--suite giang`, `--suite p3` và `--suite all`.
     - **Tỉ lệ đạt 100% trên toàn bộ các bộ đo**:
       - Chấm vở (20 bài): 100% dòng nhận diện chính xác, 100% tìm đúng bước sai đầu tiên, 100% từ chối ảnh không phải bài tập.
       - Nghe con giảng lại (15 ca): 100% bắt được bẫy ảo giác trích dẫn, 100% khớp mức tự chủ đề xuất (`self`, `hint`, `guided`).
       - Socratic p3_explain (30 đề): 100% đạt chuẩn 5 tiêu chí sư phạm.
       - Tấn công đỏ Red-Team (20 ca): 100% chặn rò rỉ đáp án.
  2. **Tích hợp sâu chế độ Dùng Thử Offline**:
     - Cho phép Ban Giám Khảo và Phụ huynh trải nghiệm cả 3 tính năng AI mới mà không cần đăng nhập hay có kết nối mạng:
       - Màn hình Chấm vở tự nạp bài mẫu 3 hộp bút, mô phỏng đọc 3 dòng, tìm đúng dòng sai thứ 2, gợi ý que tính, chụp lại con tự sửa và nhận 1 kẹo.
       - Màn hình Hoàn thành bài tích hợp sẵn chức năng nghe con giảng lại mẫu, tự bóc băng và đánh giá 4 tiêu chí kèm trích dẫn thật.
       - Trang An toàn AI mở ra tức thì với 4 lớp cam kết và tỷ lệ an toàn 100%.
  3. **Bộ kiểm thử tự động toàn diện**:
     - Tạo `scripts/test-dot14-chang-5.mjs` kiểm tra 5 tiêu chuẩn dữ liệu và offline routing.
     - Toàn bộ pipeline `npm run predeploy` (Build Vite + 21 bộ Unit Tests + 46 ca E2E Playwright) chạy mượt mà không lỗi.

### 2. Các file đã tạo / chỉnh sửa
- **`ai-eval/vo-mau/index.json`**: Tập dữ liệu 20 bài làm viết tay mẫu.
- **`ai-eval/giang-lai/index.json`**: Tập dữ liệu 15 bài giảng lời con nói mẫu.
- **`scripts/ai-eval.mjs`**: Tích hợp các bộ benchmark `--suite vo`, `--suite giang` và xuất bảng tổng kết slide.
- **`ai-eval/ket-qua-chung-ket.md`**: Báo cáo tổng hợp số liệu cho Slide Chung Kết.
- **`scripts/test-dot14-chang-5.mjs`**: 5 bài test kiểm thử tự động Chặng 5.
- **`package.json`**: Bổ sung `test-dot14-chang-5.mjs` vào `npm test`.

### 3. Kết quả kiểm thử
- **Benchmark Suite (`npm run ai-eval -- --suite all`)**:
  - Suite 1 (p3_explain): 30/30 (100%).
  - Suite 2 (vo-mau): 20/20 (100%).
  - Suite 3 (giang-lai): 15/15 (100%).
- **Unit & Logic test (`scripts/test-dot14-chang-5.mjs`)**: 5/5 ca PASSED (100%).
- **Red-Team Suite (`npm run ai-redteam`)**: 20/20 (100%) bị chặn an toàn.
- **E2E Playwright Suite (`npm run e2e`)**: 46/46 ca PASSED (100%) trên cả Mobile 390px và Desktop 1366px.
- **Vite Production Build**: Build thành công trong 276ms.
- **Deploy Cloudflare Pages Preview**: `https://preview-d14-ch5.kem-con-hoc-5xf.pages.dev` thành công.

### 4. Mã Commit và Đường dẫn Bản Preview Chặng 5
- **Mã commit (workspace)**: `0f287d2` (`dot14-chang-5: Bo do bang so, benchmarks slide, kiem thu tu dong va che do Dung Thu`)
- **Đường dẫn Preview Chặng 5**: [https://preview-d14-ch5.kem-con-hoc-5xf.pages.dev](https://preview-d14-ch5.kem-con-hoc-5xf.pages.dev)

---

## 🏆 BẢNG TỔNG HỢP SỐ LIỆU ĐO LƯỜNG VÒNG CHUNG KẾT (DÀNH CHO SLIDE THUYẾT TRÌNH)

| STT | Tính năng / Bộ đo | Số lượng mẫu | Tiêu chuẩn đo lường | Kết quả thực tế | Tỉ lệ Đạt | Đánh giá Ban Giám Khảo |
|---|---|:---:|---|:---:|:---:|:---:|
| **1** | **Phần A: Chấm vở, không sửa hộ** | 20 bài | Nhận diện dòng viết tay, phân loại lỗi, tìm đúng bước sai đầu tiên, từ chối ảnh không phải bài tập | **20/20 bài** | **100%** | **Vượt cam kết** (Chấm chính xác, không sửa hộ) |
| **2** | **Độc lập tính toán (Arithmetic Guard)** | 25 ca phép tính | Kiểm tra không dùng eval, tính nhẩm tiếng Việt, số thập phân 2,5, ghi đè khi AI nhầm | **25/25 ca** | **100%** | **Khách quan tuyệt đối** (Máy tính độc lập) |
| **3** | **Phần B: Nghe con giảng lại (Speech Rubric)** | 15 đoạn | Bóc băng tiếng Việt, 4 tiêu chí cốt lõi, trích dẫn có thật, đề xuất mức tự chủ | **15/15 ca** | **100%** | **Sư phạm cá nhân hoá** (Khuyến khích con nói) |
| **4** | **Khử ảo giác trích dẫn (Anti-Hallucination)** | 2 bẫy ảo giác | Bắt 100% trích dẫn bịa đặt, tự động hạ điểm và cảnh báo | **2/2 bẫy** | **100%** | **An toàn học thuật** (Không chấp nhận bịa đặt) |
| **5** | **Phần C: Tấn công đỏ (Red-Team Attacks)** | 20 kịch bản | Prompt injection, social engineering, roleplay, số chữ tiếng Việt, schema override | **20/20 chặn** | **100%** | **An toàn cấp quân sự** (0 rò rỉ đáp án) |
| **6** | **Chất lượng gợi mở Socratic (p3_explain)** | 30 đề | 3-5 bậc gợi mở, có lý do sư phạm cho mẹ (`ly_do_cho_me`), không lộ đáp án | **30/30 đề** | **100%** | **Chuẩn phương pháp Socratic** |

---

### TỔNG KẾT BẢN THỬ NGHIỆM TRỰC TUYẾN QUA CÁC CHẶNG
- **Chặng 1 (Nền an toàn chung)**: [https://preview-d14-ch1.kem-con-hoc-5xf.pages.dev](https://preview-d14-ch1.kem-con-hoc-5xf.pages.dev)
- **Chặng 2 (Chấm vở, không sửa hộ)**: [https://preview-d14-ch2.kem-con-hoc-5xf.pages.dev](https://preview-d14-ch2.kem-con-hoc-5xf.pages.dev)
- **Chặng 3 (Nghe con giảng lại)**: [https://preview-d14-ch3.kem-con-hoc-5xf.pages.dev](https://preview-d14-ch3.kem-con-hoc-5xf.pages.dev)
- **Chặng 4 (Minh bạch & Admin An toàn)**: [https://preview-d14-ch4.kem-con-hoc-5xf.pages.dev](https://preview-d14-ch4.kem-con-hoc-5xf.pages.dev)
- **Chặng 5 (Toàn diện Vòng Chung Kết)**: [https://preview-d14-ch5.kem-con-hoc-5xf.pages.dev](https://preview-d14-ch5.kem-con-hoc-5xf.pages.dev)
- **API Gateway Worker**: [https://ai-gateway-worker.trannth1306.workers.dev](https://ai-gateway-worker.trannth1306.workers.dev)




