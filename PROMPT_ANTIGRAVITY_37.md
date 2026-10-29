# Prompt cho Antigravity · Đợt 37: màn Hoàn thành theo bản vẽ v6 (chỉ app)

**Cách dùng:** copy phần "Lời nhắn" gửi Antigravity. Làm **sau** đợt 36. Nếu 36 chưa commit thì commit 36 trước theo `PROMPT_ANTIGRAVITY_36.md`.

---

## Lời nhắn

Màn Hoàn thành (sau khi con học xong) đã làm lại theo bản vẽ `kem-con-hoc-man-hoan-thanh-v6.html`. Thay đổi chưa commit. Đợt này không đụng tới Worker.

### Đã sửa

**Bố cục và cỡ chữ theo v6.** Màn chia 4 thẻ, cuối màn có 1 nút chính:

1. **Hero cho con:**
   - linh vật của bộ giao diện có lấp lánh;
   - tiêu đề "Hoan hô {tên con}!" cỡ 28px;
   - 1 câu tóm tắt đúng sự thật buổi học;
   - 3 ô số: bậc đã xong · lần mở gợi ý · phút học (ô phút học chỉ hiện khi đo được).
2. **Tặng huy hiệu:**
   - thẻ huy hiệu Gấu gợi ý;
   - 4 ô chọn đức tính;
   - nút "Tặng huy hiệu cho {con}";
   - thanh chấm tiến độ bộ sưu tập, kèm dòng "Còn N huy hiệu nữa là … được đổi quà".
3. **Góc phụ huynh:**
   - 3 mức tự chủ: Tự làm được / Cần gợi ý / Cần hướng dẫn;
   - hộp "Gợi ý cách kèm (N ý)", thu gọn sẵn và có dòng xem trước.
4. **Làm tiếp:**
   - "Bài tương tự (5 phút)", trước đây gọi là "Bài anh em";
   - "Con dạy lại {bố/mẹ}", làm xong thì hiện dấu ✓.
5. **Nút "Lưu & về trang chủ"** dính đáy. Nút "{Bố/Mẹ} bình tĩnh" nằm cùng hàng với nút này, không còn che nội dung thẻ.

**Màu sắc:**

- Toàn bộ màu đọc từ biến `--c-*` của bộ giao diện đang chọn, không có mã màu viết cứng.
- Đã chụp kiểm đủ 11 bộ giao diện có sẵn. Riêng bộ Cực Quang có nền dải màu sáng sau thẻ kính nên thẻ được làm tối và mờ hơn một chút cho chữ đủ rõ (vẫn dùng biến màu của bộ).
- Màu riêng cho từng bộ chờ Thảo gợi ý thêm.

**Phần làm thêm:**

- **Câu tóm tắt và các số đều lấy từ dữ liệu thật của buổi học (`flow.stepLog`).** Ví dụ: "đã đi hết 4 bậc, bố cùng con xem đáp án ở 1 bậc". Không khen chung chung.
- **Mức tự chủ app tự gợi ý:**
  - có xem đáp án tham khảo → Cần hướng dẫn;
  - có mở gợi ý → Cần gợi ý;
  - không cần gì → Tự làm được.
  - Dưới các nút có ghi lý do. Bố mẹ có thể chỉnh lại. Nếu bố mẹ không chọn thì khi Lưu app ghi theo mức gợi ý (trước đây để trống).
- **Mỗi buổi chỉ tặng được 1 huy hiệu:**
  - tặng xong thì nút chuyển thành "Đã tặng cho … ✓" và các ô chọn bị khoá;
  - quay lại màn này cũng không tặng thêm được, vì lượt tặng gắn với `flow.startedAt`.
- **Nhắc tặng huy hiệu:** bấm Lưu khi chưa tặng thì sau đó có lời nhắc nhẹ "{Bố/Mẹ} chưa tặng huy hiệu cho … tối nay, lần sau nhớ tặng nhé".
- **Hiệu ứng:** lấp lánh và vòng thở tắt khi máy bật chế độ giảm chuyển động.
- **Màn hình rộng (≥1024px):** nút Lưu dính đáy trong cột nội dung.
- Lối vào "Chấm vở" vẫn ẩn sau cờ `FEATURES.CHECK_WORK` như đợt 34.

**File:**

- Sửa:
  - `src/screens.jsx` (hàm `Done`);
  - `src/App.jsx` (thêm class `on-done`);
  - `package.json` (thêm test 37 vào `npm test`);
  - `scripts/test-34.mjs` (khớp markup mới của dòng Chấm vở, vẫn kiểm cờ).
- Mới:
  - `src/done.css`;
  - `scripts/test-37-done.mjs`;
  - `bang-chung/prompt37/` (ảnh chụp đủ 11 bộ giao diện ở điện thoại, thêm màn rộng và gia đình thật).

### Việc cần làm

1. Chạy kiểm tra:

   ```bash
   npm run build
   node scripts/test-37-done.mjs   # 7/7
   node scripts/test-34.mjs        # 5/5
   npm test                        # chỉ cần không có test MỚI lỗi (trước đợt này đã có 22 test lỗi sẵn vì cần mạng hoặc kỳ vọng cũ)
   ```

2. **Kiểm trên bản preview.** Làm 1 bài từ đầu tới cuối: Phụ huynh nhập đề → Gõ đề → soạn bài → Hỏi con → mở gợi ý → Hoàn thành bài.
   - Kiểm ở 390px và 1440px, cả Dùng thử và gia đình thật, ít nhất bộ Bạn Gấu và Khu Vườn Đêm.
   - Các điểm cần thấy:
     - Màn mới có 4 thẻ đúng thứ tự, chữ không bị tràn.
     - Câu tóm tắt và 3 ô số khớp với buổi vừa làm.
     - Mức tự chủ được chọn sẵn đúng theo cách con làm và có ghi lý do.
     - Tặng huy hiệu 1 lần thì nút khoá. Bấm quay lại rồi vào lại vẫn khoá.
     - "Gợi ý cách kèm" mở ra rồi thu lại được.
     - Nút "{Bố/Mẹ} bình tĩnh" không che nút "Làm thử".
     - Lưu khi chưa tặng huy hiệu thì có lời nhắc, sau đó về trang chủ.
3. **Commit và push.** Không commit `.claude-xfer/`.
   - File cần commit:
     - `src/screens.jsx`, `src/App.jsx`, `src/done.css`;
     - `scripts/test-37-done.mjs`, `scripts/test-34.mjs`;
     - `package.json`;
     - `dist/`;
     - `bang-chung/prompt37/`;
     - `PROMPT_ANTIGRAVITY_37.md`.
   - Gợi ý commit message: `feat(37): màn Hoàn thành theo bản vẽ v6 (4 thẻ gọn, chữ to, 1 nút chính; tóm tắt đúng dữ liệu buổi học, app gợi ý mức tự chủ, mỗi buổi tặng 1 huy hiệu, nhắc tặng khi lưu)`
4. Deploy.

### Báo lại

- Tên file `index-*.js` sau khi build.
- Kết quả test.
- Ảnh màn Hoàn thành trên production: 1 bộ sáng và 1 bộ tối.
