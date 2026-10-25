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

### 6. Mã Commit và Đường dẫn Bản Preview

- **Mã commit**: `dot14-chang-1: Nen an toan chung, module guard dung chung va chip ly do su pham`
- **Đường dẫn Preview Chặng 1**: [https://preview-d14-ch1.kem-con-hoc-5xf.pages.dev](https://preview-d14-ch1.kem-con-hoc-5xf.pages.dev)
