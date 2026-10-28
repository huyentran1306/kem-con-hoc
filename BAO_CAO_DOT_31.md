# Báo cáo đợt 31 · Nghe con giảng lại (23W) và nhãn dạng bài

- **Bản build:** `dist/assets/index-CsTcO0go.js`, build trên Linux. Build lại trên Mac có thể ra tên khác.
- **Ảnh:** `bang-chung/prompt31/`.
- **Kiểm tra:**
  - lint sạch, build đạt;
  - `scripts/test-31-routes.mjs` đạt (test mới);
  - `scripts/test-28-29-30.mjs --bundle` đạt 24/24;
  - `npm test` không có lỗi mới: vẫn đúng 28 test cũ lỗi do thiếu thư mục Worker, giống trước khi sửa.

## Phần A · Nút "Nghe con ›"

1. **Mở được tính năng.**
   - Thêm bảng trượt `teachBack` vào `SheetView` (`App.jsx`) và component `TeachBackSheet` (`screens.jsx`).
   - Bảng dùng `Sheet` chung, nên theo đúng màu của bộ giao diện đang dùng.
   - Bảng nhận đủ thông tin: bài vừa học, con đang chọn, người kèm, `sessionId`.
   - Sửa thêm một lỗi: thanh "Lưu & về trang chủ" (z-index 90) từng đè lên bảng trượt (z-index 50), nên bấm không được. Bảng trượt giờ có z-index 95.
2. **Đi được hết luồng:** ghi âm → chuyển giọng thành chữ → AI chấm 4 tiêu chí kèm câu trích → thiếu "vì sao" thì có vòng 2 → người kèm bấm chốt.
   - **AI không còn tự chốt mức nữa.** Trước đây chấm xong là app tự chốt luôn. Giờ AI chỉ đánh dấu "· AI đề xuất", người kèm bấm chốt thì mới gọi `confirm`.
   - **Kết quả được ghi vào buổi học.** App gọi `applyTeachBackChoice()` để đặt `flow.teachBackDone`, ghi lịch sử theo phiên, và lưu `teachBackDone` vào sổ học.
   - **Báo cáo chỉ đếm lần giảng lại thật.** Nút "Mức độ tự chủ" không còn được tính.
   - Thử với tài khoản thật (máy chủ giả): 2 lần gọi chấm, 1 lần `confirm`. Báo cáo hiện "1 lần Bin giảng lại cho bố mẹ".
3. **Dùng thử và chế độ trình diễn:** 0 lần gọi AI, có nhãn "Mẫu".
   - Lời giảng mẫu khớp bài đang học.
   - Vòng 1 thiếu ý "vì sao", hỏi thêm "Vì sao bác Ba bán bớt thì con lại làm phép trừ?". Vòng 2 đạt đủ 4 tiêu chí.
   - Không có mic thì tự dùng lời mẫu.
4. **Mic bị từ chối hoặc không có mic** (tài khoản thật): mở ô gõ chữ kèm lời nhắc. Có thêm nút "⌨️ Không có mic? {Bố} gõ lời con kể". Lỗi chuyển giọng cũng chuyển sang ô gõ chữ, không còn tự chèn lời mẫu bài 3 hộp bút.
5. **Kiểm tra nút trỏ tới bảng hoặc màn không tồn tại.**
   - Test mới `scripts/test-31-routes.mjs` (đã thêm vào đầu `npm test`) dò mọi `openSheet('x')` và `go('x')` trong `src/`. Nếu không có bảng trong `SheetView` hoặc màn trong `TAB_CAP`, test báo lỗi.
   - Đã thử trên bản cũ: test bắt đúng lỗi `openSheet('teachBack')`.
   - Bản hiện tại không còn tên nào lỗi (19 bảng, 18 màn).

**Không lỗi JS ở 3 bộ Bạn Gấu, Kẹo Bông, Xuân Sum Vầy.**

## Phần B · Nhãn dạng bài

- **B1 · Màn "Gấu đọc được đề này!":**
  - Nhãn giờ lấy theo đề đang đọc: trước hết là `dang_bai`; ở Dùng thử là `dang_bai` của bài mẫu khớp đề; nếu không có thì dùng bộ phân loại nhanh. App không bao giờ lấy nhãn của bài giả `mock` (đề 3 hộp bút).
  - Ô Gõ đề không còn mang nhãn, tóm tắt hay lưu ý của bài 3 hộp bút sang đề mới.
  - Ở Dùng thử, đề con vịt giờ hiện "Toán có lời văn phép trừ".
- **B2 · Bài cô giao:**
  - Bậc thiếu `ky_nang` thì không hiện nhãn, không còn mặc định "Tính toán". Áp dụng cho cả `normalizeLesson` và bài AI soạn.
  - Bài cô giao đã lưu sẵn mà mọi bậc đều là `tinh_toan` thì coi là nhãn bị điền mặc định và ẩn đi. Không cần soạn lại bài.
  - Phần prompt soạn theo "Cách cô dạy" nằm ở Worker, đã ghi trong file prompt cho Antigravity.

## Thêm · Nguyên nhân thật của "câu hỏi v3 nhạt" (28 A3)

File `bang-chung/prompt28-30/so-sanh-v2-v3.md` mà Antigravity vừa chạy cho thấy cả v2 lẫn v3 đều ra các câu "Con đọc lại đề xem bài toán cho biết gì và hỏi gì nào?" và "Để tìm kết quả bước này, con nghĩ nên dùng phép cộng, trừ, nhân hay chia?".

Đây **không phải câu AI viết**. Đó là câu an toàn `SKILL_SAFE_QUESTIONS` trong `guard.js`. Bộ chặn lộ đáp án thay **cả câu hỏi** bằng câu này mỗi khi bậc sau nhắc kết quả của bậc trước. Ví dụ "Có 30 quả, làm bánh hết 8 quả…" bị coi là lộ số 30.

Đã sửa trong `src/guard.js`:

- Kết quả trung gian của các bậc trước được phép xuất hiện ở bậc sau.
- Đáp số cuối và kết quả của chính bậc đó vẫn bị chặn.
- Có test chứng minh ca hợp lệ không còn bị thay, còn ca lộ đáp số cuối vẫn bị chặn.

**Worker đang dùng một bản sao `guard.js`, nên phải đồng bộ thì AI thật mới hết nhạt.** Đã ghi trong file prompt cho Antigravity.
