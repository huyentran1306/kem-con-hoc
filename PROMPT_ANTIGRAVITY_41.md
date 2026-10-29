# Prompt cho Antigravity · Đợt 41: 6 góp ý sau khi chạy thử (chỉ app)

**Cách dùng:** copy phần "Lời nhắn" gửi Antigravity. Làm sau đợt 40 (đã commit `48288c6`). Đợt này không đụng tới Worker.

---

## Lời nhắn

Đã sửa 6 góp ý, chưa commit.

### Đã sửa

**1. Màn "Phụ huynh nhập đề" (chụp đề) bị vỡ ở iPhone 16 (393×852).** File mới `src/themes/fix-41.css`, nạp sau cùng trong `main.jsx`.

- Khung máy ảnh co giãn theo chiều cao màn (`clamp(220px, 100dvh − 470px, 520px)`), cao hơn để vừa trang vở.
- Nút chụp không còn dính hay đè vào khung.
- Linh vật dời lên góc trên, nên dòng hướng dẫn không bị che. Dòng hướng dẫn có nền mờ cho dễ đọc.
- Viền khung nét đứt không bị video che mất.
- 3 nút Chọn ảnh / Gõ đề / Đọc đề không bị xuống dòng ở màn 360px.

**2. "{Mẹ/Bố} bình tĩnh": bấm vào là hít thở như bản trước.**

- **Bảng hít thở** (`src/CalmBreath.jsx`, `src/calm.css`):
  - vòng tròn to lên khi **hít vào 4 giây**, nhỏ lại khi **thở ra 4 giây**;
  - giữa vòng có đếm ngược 4 → 1;
  - chạy 4 vòng (khoảng 30 giây), sau đó có nút "Thở thêm 30 giây";
  - có nút bật/tắt tiếng, thẻ "Thay vì nói / Thử nói" và nút "Mình ổn rồi".
- **Các chức năng cũ** (Con chưa hiểu, Mất tập trung, Mệt bực → Thổi cùng con, Muộn rồi, Đổi vai) chuyển vào nút phụ "Con đang gặp khó? Xem gợi ý khác ›".
- **Đã rà các chức năng trong Góc hạ hoả** (`src/CalmCornerModal.jsx`, `src/App.jsx`). Có 4 lỗi, đã sửa:
  - "Con chưa hiểu" trước chỉ báo "Đã mở gợi ý" nhưng màn Hỏi con không mở gì. Giờ mở **Gợi ý 1** của bậc đang làm (`flow.stuck`).
  - Mở từ trang chủ, báo cáo… mà bấm "Muộn rồi" vẫn lưu "bài dở" và tính một tối học. Giờ ngoài giờ học sẽ ẩn "Muộn rồi" và "Đổi vai" (chỉ hiện khi đang ở màn Hỏi con). Nút cuối đổi thành "Đóng".
  - Hộp "Câu nói dịu lòng" và hộp gợi ý trong Đổi vai dùng màu viết cứng, khó đọc ở bộ tối. Đã đổi sang biến màu của bộ giao diện.
  - Nút ✕ trước chỉ 32px, giờ 44px và có nhãn "Đóng".

**3. Nút căn giữa trên toàn app:** nút lớn `btn-km-l` trước căn trái (ví dụ "Bắt đầu hỏi con  ›"), giờ chữ căn giữa, mũi tên › vẫn ở mép phải (`fix-41.css`).

**4. Tặng huy hiệu có thanh trượt chọn sticker** (`src/screens.jsx` hàm `Done`, `src/done.css`).

- Trước chỉ có 4 ô, giờ có đủ **12 sticker** trong bộ sưu tập (Kiên nhẫn, Sáng tạo, Tập trung, Tỉ mỉ, Tốc độ, Tự tin, Vui vẻ, Thông thái, Chăm chỉ, Tư duy, Bền bỉ, Xuất sắc).
- Sticker Gấu gợi ý đứng đầu, có nhãn "Gợi ý".
- Vuốt ngang để chọn, hoặc bấm nút ‹ ›.

**5. "Bài tương tự (5 phút)" trống, nút lệch, bấm "Xem đề" không có gì.**

- **Nguyên nhân:**
  - bài tương tự có thể là chuỗi hoặc `{ de_bai }`, nhưng code chỉ đọc `bro.de`, nên ra trống;
  - nếu con không bí bậc nào thì app không xin AI viết bài tương tự;
  - bấm "Làm thử" thì đề được lưu vào `text` chứ không phải `ocr`, nên màn soạn bài không có đề để xem.
- **Đã sửa:**
  - đọc được mọi dạng dữ liệu;
  - bài soạn không kèm bài tương tự thì tự xin AI viết; viết không được thì có nút "Thử lại";
  - đề hiện đủ 3 dòng, nút căn giữa;
  - **"Làm thử":** gia đình thật thì cho AI soạn bài đầy đủ như khi mẹ gõ đề (sang màn đọc đề → soạn bài). Dùng thử thì dựng bài 3 bậc có gợi ý. Cả hai đều có đề ở "Xem đề".

**6. Bỏ hẳn thẻ "Đồng hồ Lego" (tiếng Anh)**, kể cả ở đồ vật Đồng hồ. Thẻ "Đồng hồ chơi" (đếm ngược) vẫn giữ.

**Test:**

- `scripts/test-41.mjs` (7 kiểm tra, đã thêm vào `npm test`).
- `scripts/test-39-games.mjs` sửa theo việc bỏ hẳn Đồng hồ Lego.

### Việc cần làm

1. Chạy kiểm tra:

   ```bash
   npm run build
   node scripts/test-41.mjs   # 7/7
   node scripts/test-37-done.mjs && node scripts/test-39-games.mjs
   npm test                   # chỉ cần không có test MỚI lỗi
   ```

2. **Kiểm trên bản preview** (iPhone 16 393×852 và 360px; ít nhất bộ Kẹo Bông, Bạn Gấu, Khu Vườn Đêm):
   - Màn chụp đề: khung máy ảnh, nút chụp và 3 nút không đè lên nhau.
   - Bấm "Mẹ bình tĩnh" ở trang chủ: thấy hít vào / thở ra 4 giây, có đếm ngược. "Xem gợi ý khác" không có "Muộn rồi" và "Đổi vai".
   - Đang ở màn Hỏi con, bấm "Mẹ bình tĩnh" → "Xem gợi ý khác" → "Con chưa hiểu" thì Gợi ý 1 của bậc đang làm mở ra.
   - "Bắt đầu hỏi con" và các nút lớn khác: chữ nằm giữa.
   - Màn Hoàn thành:
     - vuốt thanh sticker thấy đủ 12;
     - chọn "Tốc độ" rồi tặng được;
     - "Bài tương tự" có đề, bấm "Làm thử" rồi "Xem đề" thì thấy đề.
   - Trò chơi → Đồng hồ: không còn thẻ tiếng Anh.
3. **Commit và push.** Không commit `.claude-xfer/` và `kem-con-hoc-full-*.zip`.
   - File cần commit:
     - `src/screens.jsx`, `src/App.jsx`, `src/CalmCornerModal.jsx`, `src/CalmBreath.jsx`, `src/calm.css`;
     - `src/done.css`, `src/main.jsx`, `src/themes/fix-41.css`;
     - `scripts/test-41.mjs`, `scripts/test-39-games.mjs`;
     - `package.json`;
     - `dist/`;
     - `bang-chung/prompt41/`;
     - `PROMPT_ANTIGRAVITY_41.md`.
   - Gợi ý commit message: `fix(41): bình tĩnh mở hít thở 4s như cũ (rà và sửa Góc hạ hoả), nút căn giữa toàn app, màn chụp đề iPhone 16, thanh trượt 12 sticker, bài tương tự có đề và Làm thử được, bỏ hẳn Đồng hồ Lego`
4. Deploy.

### Báo lại

- Tên file `index-*.js` sau khi build.
- Kết quả test.
- Ảnh trên production (iPhone 16): màn chụp đề, bảng hít thở, thanh sticker.
