# Báo cáo đợt 34 · Trang chủ gọn, đề mẫu hộp bút, ẩn chấm vở, nút bình tĩnh, màn Hỏi con từng bước v2

- **Bản build (Linux):** `dist/assets/index-C4bitw8_.js`. Build lại trên Mac sẽ ra tên khác.
- **Ảnh:** `bang-chung/prompt34/`.
  - `01`–`11`: Dùng thử bộ Bạn Gấu, đi trọn một bài.
  - `01`, `05`, `07`, `08`: thêm 5 bộ Khu Vườn Đêm, Bảng Phấn, Sticker, Đêm Tuyết, Sổ Tay.
  - `G*`: gia đình thật, người kèm là bố.
  - `W1440_*`: màn rộng.
- **Kiểm tra:**
  - lint sạch, build đạt.
  - Test mới `scripts/test-34.mjs` đạt 5/5, đã thêm vào cuối `npm test`.
  - `test-28-29-30 --bundle` đạt 26/26.
  - `npm test`: không có lỗi mới. Danh sách lỗi cũ y hệt trước khi sửa (22 test cũ).
  - Không lỗi JS ở 6 bộ giao diện và ở luồng gia đình thật.
- **Chỉ sửa app, không đụng Worker.**

## 1 · Trang chủ

- Nút chính đổi từ "Bắt đầu bài tối nay" thành **"Phụ huynh nhập đề"**, áp cho cả 11 bộ giao diện. Nút dẫn tới trang nhập đề.
- Trang nhập đề (trước là "Chụp bài tập") đổi tiêu đề thành "Phụ huynh nhập đề". Trang này vẫn có đủ Chụp, Chọn ảnh, Gõ đề, Đọc đề.
- **Bỏ 2 nút "Gõ đề bài" và "Đọc đề cho Gấu / Người Tuyết…"** ở trang chủ, vì trang nhập đề đã có.

## 2 · Đề mẫu

- Chip "Toán" ở bảng Gõ đề, và ô đề mặc định khi Dùng thử, giờ là đề cũ: **"Mẹ mua 2 hộp bút, mỗi hộp có 10 cây. Mẹ cho Lan 4 cây. Hỏi mẹ còn bao nhiêu cây bút?"**
- Bài soạn sẵn cho đề này có 4 bậc theo đúng bản vẽ v2, mỗi bậc có gợi ý 1, gợi ý 2 và đáp án tham khảo:
  1. Bài cho mình biết những gì?
  2. Mẹ có tất cả bao nhiêu cây bút?
  3. Cho Lan 4 cây thì số bút nhiều lên hay ít đi?
  4. Viết lời giải và phép tính.
- Dữ liệu Nghe con giảng lại và chấm vở mẫu của đề này cũng đã soạn đủ.
- Đề vịt vẫn còn trong bài mẫu, gõ đúng đề vịt thì vẫn ra bài vịt. Đề hộp bút có số khác thì không bị khớp nhầm.

## 3 · Ẩn AI chấm vở

- Đã ẩn: thẻ "AI Chấm vở" ở trang chủ (mọi bộ), dòng "Chấm vở ›" ở Xong bài, và chữ "chấm vở" trong lời giới thiệu Dùng thử.
- Code màn chấm vở và Worker vẫn giữ nguyên. Muốn bật lại thì đổi `CHECK_WORK: true` trong `src/features.js`.

## 4 · Nút {Mẹ/Bố} bình tĩnh như cũ

- Trả lại **nút nổi góc dưới có chữ "Mẹ bình tĩnh" / "Bố bình tĩnh"** như trước đợt 23.
  - Cuộn xuống thì nút thu nhỏ.
  - Ở các màn học, nút chỉ còn hình tròn.
- Bỏ nút tròn 😮‍💨 trên thanh trên ở mọi màn, kể cả màn Trò chơi.
- **Sửa thêm:** khi nút thu nhỏ, lớp `mini` trùng tên với kiểu thẻ của bộ Sổ Tay, làm nút bị đẩy ra mép trái. Đổi tên lớp thành `calm-fab-mini`.
- Ở màn Hỏi con, nút nằm riêng ngay trên hai nút đáy, không đè bậc thang gợi ý.

## 5 · Màn Hỏi con từng bước (theo bản vẽ v2)

Màn được viết lại ở file mới `src/HoiConTungBuoc.jsx` và `src/hoiCon.css`. Màu, nút và bo góc đều đọc biến của bộ đang chọn, không có mã màu viết cứng.

| Góp ý | Đã làm |
|---|---|
| Dư "Bước 1/5", thanh đếm rồi lại "Bậc 1" | Chỉ còn **một** thanh bậc kèm "Bậc 1/4". Bỏ dải đề, nhãn "BẬC 1" và nhãn kỹ năng |
| "Dành cho bố" | Đổi thành dòng **"Đáp án tham khảo · giữ 1,5 giây để xem"** ngay trong bậc thang gợi ý. Đáp án bị làm mờ, giữ đủ 1,5 giây mới hiện rõ. Giữ đủ thì app ghi nhận "đã mở đáp án", để Xong bài góp ý đúng |
| "Chưa nghĩ ra" / "Con làm được" không rõ đi đâu | Hai nút ghi rõ: **"Con còn bí → Mở gợi ý"** và **"Con làm được → Tiếp tục"** |
| Vì sao hỏi, mục tiêu sư phạm | Bỏ hết |
| Khoảng trắng không chủ đích | Chia 4 vùng: thanh bậc ở trên, câu hỏi chính ở giữa, bậc thang gợi ý bên dưới, hai nút cố định ở đáy |
| Bấm "chưa nghĩ ra" thì hiện gợi ý | Bấm lần 1 mở Gợi ý 1, lần 2 mở Gợi ý 2 ngay dưới. Chạm vào từng dòng gợi ý cũng mở được. Hết gợi ý thì báo "Hết gợi ý. {Mẹ/Bố} có thể giữ Đáp án tham khảo 1,5 giây" |

- **Giữ lại theo lựa chọn của bạn:** link nhỏ "Hỏi Gấu" trên thanh trên, mở Hỏi thêm AI. Bỏ mic và ngăn "Dành cho mẹ".
- **Thêm:**
  - "Xem đề" mở bảng đề với các con số được tô nổi.
  - Câu "{Mẹ/Bố} đọc to câu này cho con nghe" và nút "Đọc to".
  - Linh vật của bộ đang chọn ngồi góc thẻ câu hỏi.
  - Xong bậc cuối thì hiện "{Con} đã tự tìm ra đáp án rồi!", nút "Hoàn thành bài → Tặng huy hiệu".
- **Màn rộng:** hai nút dính đáy nằm trong cột nội dung.
- **Thay đổi hành vi cần biết:**
  - Màn này không còn gọi AI "câu nhỏ hơn" khi con kẹt; gợi ý 1 và 2 lấy từ bài đã soạn, nên mở ngay, không chờ.
  - Không còn chấm câu trả lời bằng giọng nói.
  - Hai tính năng này vẫn còn code ở API, chỉ không còn lối vào từ màn này.

## Test và script đã sửa theo

- `scripts/test-chang-1.mjs`: đổi thành kiểm trang chủ **không còn** nút Gõ đề / Đọc đề, và có "Phụ huynh nhập đề".
- `scripts/verify-prompt33a-e2e.mjs`: đi qua "Phụ huynh nhập đề" rồi mới bấm "Gõ đề".
- Script cũ ngoài `npm test` (`smoke-test-prompt23i.mjs`, `test-dot23-full-e2e.mjs`) vẫn tìm nút `start-type`. Nếu dùng lại thì sửa giống trên.
