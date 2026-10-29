# Báo cáo đợt 32 · Sửa gấp trước chung kết

- **Bản build (Mac):** `dist/assets/index-CdjgChn8.js`.
- **Bản Worker:** đã deploy production: `https://ai-gateway-worker.trannth1306.workers.dev`, Version ID: `62e00ccd-dfed-454c-96cc-64eed2a8fd8c`.
- **Ảnh và timing:** `bang-chung/prompt32/`.
  - `T*`: Dùng thử.
  - `F*`: gia đình thật, người kèm là bố.
  - `W*`: màn rộng 1440 và 1920.
  - `admin_nhat_ky_xin_dap_an.png`: Ảnh Admin › An toàn AI › Nhật ký bộ chặn có dòng "Hỏi thêm AI (xin đáp án)" / `xin_dap_an`.
  - `cong_co_khong_het_han.png`: Ảnh Cổng cô soạn thông báo, bật "Ghim đầu lớp", có nút "Không hết hạn" được chọn.
  - `timing-2-lan-soan.txt`: số đo thật hai lần soạn cùng một đề và chấm vở đọc ảnh thật trên production.
- **Kiểm tra:**
  - lint sạch, build đạt (`index-CdjgChn8.js`);
  - `test-31-routes` đạt;
  - `test-28-29-30 --bundle` đạt 25/25;
  - `npm test`: 27 đạt, 18 lỗi (tất cả là test cũ từ trước). Không phát sinh test mới lỗi vì đợt 32.
  - Sửa 1 test cũ kiểm cố định chữ "MẸ THẤY GÌ" (`test-dot18-chang-3`). Giờ dòng này đổi theo xưng hô và đạt 100%.

## Cách chạy trọn luồng (bắt buộc)

App build thật chạy trong Chromium. Mọi lời gọi tới Worker đi qua **chính code Worker đã sửa**, chạy tại chỗ. Chỉ AI và D1 là giả lập.

Nhờ vậy đã kiểm được cả bộ chặn, lesson_cache, bản sửa bậc và CORS. Lỗi JS: **0** ở cả hai luồng.

| Bước | Dùng thử | Gia đình thật (bố) |
|---|---|---|
| Đọc đề, chip dạng bài | Vịt: "phép trừ"; trứng 2 bước: "hai bước tính"; bánh: "một phép nhân" | Trứng 2 bước: "hai bước tính" |
| Soạn | Bài vịt soạn sẵn, bậc 2 không nói hộ "trừ" | 4 bậc, đủ 2 bậc tính, bậc chọn phép tính không nói hộ |
| Kẹt 2 lần | Câu nhỏ 1 rồi 2 | Gọi micro-step 1 lần |
| Hỏi Gấu xin đáp án (5 cách hỏi) | 5/5 từ chối, 0 lần gọi AI | 5/5 do máy chủ từ chối, 0 lần gọi AI, ghi 5 dòng `xin_dap_an` |
| Hỏi câu thường | – | 1 lần gọi AI, trả văn bản thường |
| Xong bài | Huy hiệu 15: "Đã có 15 ⭐ · đủ 1 bộ 10, bộ mới 5/10" | Không còn "mẹ" lẻ khi người kèm là bố |
| Chấm vở | Bài mẫu, kết quả đọc rõ ở bộ tối Khu Vườn Đêm và Bảng Phấn | Lần đọc 1 quá hạn → màn chờ đổi thành "Gấu đang đọc lại lần 2…" → đọc được ở 18,9 giây |

## Từng mục

### 1 · Hỏi thêm AI (P0)

- **Gốc lỗi JSON thô và câu lặp:** Worker tự gọi lại AI "để lấy JSON" với **mọi** prompt. Nên câu chat cũng bị ép thành JSON và lặp lại.
  - Giờ chỉ prompt `p3_*` (hoặc prompt thật sự đòi JSON) mới được gọi lại.
  - Chat qua `flattenJsonReply` (cả ở máy chủ lẫn app), nên không bao giờ còn `{ } "` thô.
  - Phát hiện chữ vỡ dấu kiểu "hoỌc" thì gọi lại 1 lần với nhiệt độ 0,2.
- **Xin đáp án:**
  - Luật trong code (`chat_safety.js`, dùng chung app và Worker) nhận ra "cho con đáp án", "bao nhiêu", "giải hộ", "cho con chép", "… bằng mấy?".
  - Máy chủ từ chối, không gọi AI, trả `guarded: true`, ghi `guard_log` outcome `xin_dap_an`.
  - Câu từ chối kèm một câu hỏi gợi mở lấy từ **bậc chọn phép tính của chính bài đang học**.
  - App hiện nhãn "🛡 Bộ chặn đáp án đã bật".
  - Dùng thử và chế độ trình diễn từ chối ngay trên app.
- Bỏ chip và câu trả lời cứng của bài 3 hộp bút. Prompt `p4_chat` lên rev 32: văn bản thường, 2–4 câu, theo xưng hô.

### 2 · Chip dạng bài (P0)

- Ô Gõ đề không còn mang theo phương pháp, đáp án, bậc… của bài trước.
- Nhãn lấy theo chính đề đang đọc.
- **Sửa thêm:** ở Dùng thử, đề "Bác Ba có 45 quả trứng, bán 18…" bị khớp nhầm bài vịt. Nên nó mang nhãn "phép trừ" và **mở luôn bài vịt**. Giờ đề có số khác bài mẫu thì không khớp nữa, Dùng thử báo giới hạn như các đề lạ khác.

### 3 · An toàn AI 7 ngày (P1)

- Các số đếm từ sự kiện thật: bậc bộ chặn sửa, câu nhỏ hơn (micro-step), lần Gấu nghe con, lần giảng lại.
- Thêm dòng "Lần Gấu từ chối xin đáp án".
- Dùng thử hiện số mẫu có nhãn "Số mẫu".

### 4 + 6 · Cache, thời gian sửa, chất lượng bậc (P1)

- **Sửa bậc chuyển sang máy chủ, làm trước khi lưu cache** (`lesson_fix.js`).
  - Máy kiểm bắt 5 loại lỗi: bậc chung chung, lặp câu hỏi đề, thiếu bậc, thiếu bậc tính, bậc chọn phép tính nói hộ.
  - Có lỗi thì gọi 1 lần AI ngắn, chỉ trả các bậc cần thay hoặc chèn.
  - Trần thời gian 6 giây. Bản sửa chỉ được nhận khi ít lỗi hơn và không lộ đáp số.
- **Bài lưu cache là bài đã sửa.** Đo trên máy thử: lần 1 mất 1066 ms (AI giả 600 ms + sửa 400 ms); lần 2 mất 6 ms, trúng cache, 0 lần gọi AI.
- **Sửa gốc trong bộ chặn của Worker:** câu bậc sau nhắc "27 quả" (kết quả bậc trước) từng bị coi là lộ đáp án, nên bản sửa luôn bị loại. Giờ cụm từ là kết quả trung gian của bậc trước được phép nhắc lại, đáp số cuối vẫn bị chặn.
- Prompt `p3_explain_v3` và `p3_fix_steps_v3` lên rev 32: mỗi phép tính một bậc tính; bậc chọn phép tính không viết chữ cộng/trừ/nhân/chia.
  - Ví dụ cũ có "lấy số nào trừ số nào", chính ví dụ đó dạy AI nói hộ phép tính.
- Bài mẫu vịt đã sửa bậc 2.

### 5 · Câu chữ và giao diện (P1)

- Sticker hiện "Đã có 15 ⭐ · đủ 1 bộ 10, bộ mới 5/10".
- "CHỈ MẸ THẤY", "MẸ THẤY GÌ", "MẸ HỎI", "CÂU CỦA MẸ"… giờ theo xưng hô.
- Dòng kết quả chấm vở dùng chữ tối trên nền sáng.
- Trò chơi sau bài đầu lấy trọng tâm "Phép trừ trong bài vừa học".

### 7 · Chấm vở đọc ảnh (P1)

- **Gốc lỗi:** model chính và model dự phòng trong `wrangler.jsonc` là **cùng một model**. Nên "dự phòng" không có tác dụng, và vòng thử lại 3 lần làm chờ tới khoảng 36 giây.
- **Giờ đọc 2 lần:**
  1. Lần 1: model chính, tối đa 18 giây.
  2. Lần 2 (chỉ khi lần 1 lỗi, trả rỗng hoặc chép lại ví dụ): `@cf/meta/llama-4-scout-17b-16e-instruct`, tối đa 14 giây. Model này nhận ảnh dạng `messages` + `image_url`, code đã tự đổi định dạng.
- Phản hồi có `read_attempts`, `retried`, `read_ms`.
- Sau 16 giây chờ, màn chờ đổi thành "Gấu đang đọc lại lần 2…".

### 8 · P2

- **Cổng cô:** code có lựa chọn "Không hết hạn" từ đợt 29. Lựa chọn này chỉ hiện khi đã bật "Ghim đầu lớp"; khi chưa ghim, form ghi "Muốn hiện mãi thì bật Ghim đầu lớp rồi chọn Không hết hạn". Bản tester thấy có thể là bản chưa deploy đợt 29. **Chưa chụp được ảnh** cổng cô trong máy thử, nhờ Antigravity kiểm trên bản thật.
- **Màn chính phụ huynh:** dòng "Xem tất cả thông báo của cô" luôn hiện dưới danh sách, kể cả khi chỉ có 1–2 thông báo.
- **Dùng thử:** không gọi `family/announcements`, `family/assignments`, `family/reminders` nữa. Cả luồng chỉ còn `GET /config/public`.
- **Dải Dùng thử ở 1440 và 1920:** dải nằm ngang trên vùng nội dung, không bị cắt.
- **Chế độ trình diễn:** đề trùng bài mẫu thì dùng bài soạn sẵn (0 lần gọi AI) và có nhãn "Bài soạn sẵn". Đề khác vẫn gọi AI như cũ.
- **Sổ dán sticker (Dùng thử):** sticker mẫu dùng đúng mã huy hiệu, nên 3 ô sáng khớp "3/12". Số loại đếm theo ô sáng.
- **Góp ý 21 giờ:** đổi thành "Đã sau 21 giờ, nếu {con} buồn ngủ thì {bố/mẹ} ưu tiên cho con ngủ sớm…".

## Sửa thêm khi chạy trọn luồng

- **CORS của Worker (quan trọng):** `Access-Control-Allow-Headers` chỉ có 6 header. App còn gửi `X-Bypass-Cache`, `X-Prefetch`, `X-Child-Id`, `X-Grade`, `X-Subject`, `X-Book-Series`, cùng 4 header mới của đợt này. Trình duyệt có thể chặn preflight và làm hỏng cả lời gọi. Đã thêm đủ.
- **`/api/v1/ai/brother`:** thiếu import `correctLessonMath`, nên bài anh em không được máy kiểm phép tính (báo `ReferenceError` trong log). Đã thêm import.

## Kết quả triển khai đợt 32 bởi Antigravity

- **Deploy Worker:** Đã deploy thành công lên production Cloudflare Workers (`https://ai-gateway-worker.trannth1306.workers.dev`, Version ID: `62e00ccd-dfed-454c-96cc-64eed2a8fd8c`).
- **Migration 0010:** Đã bỏ ràng buộc CHECK trên cột `outcome` của bảng `guard_log` trên remote D1 (`ai-gateway-db`), nhận đủ các giá trị mới `xin_dap_an`, `sua_bac`, `sua_bac_chung_chung`, `sua_phep_tinh`, `chan_an_toan`.
- **Prompt Studio D1:** Đã cập nhật `p4_chat`, `p3_explain_v3`, `p3_fix_steps_v3` trên remote D1 (`prompt_studio:config` và `prompt_studio%3Aconfig`) lên `rev 32`.
- **Xoá cache cũ:** Đã xoá toàn bộ `lesson_cache` có `prompt_version` bắt đầu bằng `v3` tạo trước thời điểm deploy.
- **Timing hai lần soạn cùng một đề trên production:**
  - Lần 1: `total_ms: 13555` (ai_ms: 6458, check_ms: 18), `cached: false`, sinh đủ 5 bậc (bậc chọn phép tính không nói hộ "trừ").
  - Lần 2: `total_ms: 21` (client round-trip 203 ms < 3 giây), `cached: true`, 0 lần gọi AI.
- **Chấm vở đọc ảnh thật:** `read_attempts: 1`, `read_ms: 9141 ms`, `retried: false`, `doc_duoc: true`.
- **Ảnh bằng chứng:**
  - `bang-chung/prompt32/admin_nhat_ky_xin_dap_an.png`: Admin › An toàn AI › Nhật ký bộ chặn hiển thị các dòng chặn `xin_dap_an`.
  - `bang-chung/prompt32/cong_co_khong_het_han.png`: Cổng cô soạn thông báo, bật "Ghim đầu lớp", nút "Không hết hạn" xuất hiện và được chọn.
  - `bang-chung/prompt32/timing-2-lan-soan.txt`: File nhật ký timing chi tiết.
