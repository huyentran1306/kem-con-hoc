# BÁO CÁO TIẾN ĐỘ ĐỢT 13 · SỬA LỖI & HOÀN THIỆN GIAO MỘT LẦN (25/10/2026)

Tài liệu theo dõi quá trình thực hiện 6 Chặng theo đúng quy định trong `13_GIAO_MOT_LAN.md`.

---

## 📌 CHẶNG 1: SỬA TOÀN BỘ LỖI P0 CỦA PROMPT 12

### 1. Danh sách các lỗi P0 đã xử lý và kết quả kiểm thử

| Mã | Tên lỗi | Trạng thái | Bằng chứng & Chi tiết sửa |
|---|---|---|---|
| **P0.1** | Trang đăng nhập Admin hiện công khai tài khoản & mật khẩu | **ĐÃ SỬA HOÀN TOÀN** | - Đã xoá toàn bộ dòng hiển thị tài khoản/mật khẩu mặc định (`admin@... / admin123`) trong `src/Admin.jsx`.<br>- Ô email không còn điền sẵn.<br>- Bundle `dist/` kiểm tra `grep` không còn chuỗi "Tài khoản mặc định" hay mật khẩu cũ.<br>- *Lưu ý*: Mật khẩu thực tế trên Cloudflare D1/Worker do chủ dự án đổi bằng tay theo quy định. |
| **P0.2** | AI không soạn bài (rơi về văn xuôi rồi chuyển bài mẫu) | **ĐÃ SỬA HOÀN TOÀN** | - `src/api.js`: Prompt gửi tới model đưa đề bài và mệnh lệnh vào tin nhắn `user`: `Soạn bài cho đề sau theo đúng schema. Chỉ trả JSON.\nĐề bài: """${ocr}"""`.<br>- Bổ sung header `X-Prompt-Id: p3_explain` để admin theo dõi theo prompt ID.<br>- `src/promptStudio.js`: Thay đổi ví dụ mẫu few-shot trong `p3_explain` sang bài toán chia đều 15 chiếc kẹo cho 3 bạn, không còn trùng đề 3 hộp bút.<br>- `ai-gateway-worker`: `validateAndGuardAiOutput` trả về status `"Lỗi định dạng"` (thay vì "Đạt") khi model trả văn xuôi sai JSON.<br>- `src/screens.jsx`: Khi gặp lỗi định dạng, hiển thị thông báo đúng bản chất: *"AI trả lời chưa đúng định dạng, mẹ thử lại nhé"* kèm nút 🔄 Thử lại, không báo sai sự thật "Mạng đang chậm" và không âm thầm rơi về bài mẫu. |
| **P0.3** | "Gõ đề" và "Đọc đề" ở màn chính không hoạt động | **ĐÃ SỬA HOÀN TOÀN** | - Chuẩn hoá toàn bộ 8 bộ giao diện trong `src/themes/slots/themedSlots.jsx` và `src/themes/slots/defaultSlots.jsx` gọi đúng 3 giá trị: `photo`, `type`, `voice`.<br>- Vòng tròn lớn của theme Cực Quang (Aurora) đã được kết nối gọi `photo`.<br>- `src/screens.jsx` `onStart` xử lý: `photo` -> màn chụp (`snap`), `type` -> mở sheet `typeProblem`, `voice` -> mở sheet `typeProblem` ở chế độ ghi âm có mic tự bật.<br>- Thêm thuộc tính `data-testid` (`start-photo`, `start-type`, `start-voice`) cho tất cả các theme. |
| **P0.4** | "Lớp học của con" và link vào lớp làm sập app (màn trắng) | **ĐÃ SỬA HOÀN TOÀN** | - `src/App.jsx`: Khắc phục `ReferenceError: data is not defined` do hàm `SheetView` thiếu tham số `data` khi render `FamilyClassSheet`.<br>- Bổ sung component `ErrorBoundary` (`src/ErrorBoundary.jsx`) bao bọc toàn bộ các popup Sheet và các màn hình chính để chặn sập trắng trang khi có lỗi cục bộ.<br>- Mở link `/vao-lop/...` và sheet `familyClasses` hoạt động an toàn, không còn console error. |
| **P0.5** | Thành viên gia đình, mã đăng nhập máy mới, chia sẻ báo cáo lỗi 401 | **ĐÃ SỬA HOÀN TOÀN** | - `src/api.js`: Đã thay thế toàn bộ 10 chỗ đọc `localStorage.getItem('auth_token')` sang hàm chuẩn duy nhất `getAuthToken()` (đọc từ `localStorage['kem-con-hoc:auth']`).<br>- Không còn bất kỳ vị trí nào đọc nhầm token trong toàn bộ mã nguồn. |
| **P0.6** | Ô theo dõi học đều không bao giờ tăng | **ĐÃ SỬA HOÀN TOÀN** | - `src/screens.jsx`: Gộp việc lưu lịch sử (`history`), kỹ năng (`weak`/`strong`), và ghi nhận buổi học (`studyLog`) thành một lần cập nhật hàm duy nhất (`patch((prev) => ...)`), loại bỏ triệt để hiện tượng ghi đè mất `studyLog`.<br>- Phân định rõ ràng: Bài mẫu minh hoạ (`problem.isSample = true`) được lưu vào lịch sử có nhãn `[Bài mẫu]` nhưng **không cộng vào lọ kẹo/dấu chân** kèm ghi chú thông báo rõ cho phụ huynh. Bài tập thật làm xong được cộng ngay vào lọ kẹo của con. |

---

### 2. Các file đã thay đổi trong Chặng 1

1. `src/Admin.jsx`: Xoá tài khoản/mật khẩu mặc định công khai, không điền sẵn email.
2. `src/api.js`: Cập nhật user prompt `aiExplain`, header `X-Prompt-Id`, bộ trích xuất `extractJson`, đổi toàn bộ `localStorage['auth_token']` sang `getAuthToken()`.
3. `src/promptStudio.js`: Đổi few-shot example trong `p3_explain` sang bài toán chia kẹo.
4. `src/screens.jsx`: Chuẩn hoá `onStart`, hiển thị lỗi định dạng AI, hợp nhất ghi nhận `studyLog` nguyên tử.
5. `src/themes/slots/themedSlots.jsx`: Chuẩn hoá mode `photo | type | voice` và `data-testid` trên toàn bộ 8 theme.
6. `src/App.jsx`: Thêm tham số `data` vào `SheetView`, bọc `ErrorBoundary`, hỗ trợ functional patch, khởi tạo trẻ mới 0 sticker.
7. `src/ErrorBoundary.jsx`: Component bắt lỗi chống sập trang.
8. `src/ui.jsx`: Hỗ trợ `autoStart` cho nút `VoiceInputBtn`.
9. `/Users/pro/Coding/study-en/ai-gateway-worker/src/admin_stitch_routes.js`: Cập nhật validator trả về `"Lỗi định dạng"` khi model không trả JSON.
10. `scripts/test-chang-1.mjs`: Bộ kiểm thử tự động toàn bộ 6 mục P0.
11. `scripts/test-prompt-11.js` & `package.json`: Cập nhật bộ test tích hợp.

---

### 3. Kết quả kiểm thử Chặng 1

- `node scripts/test-chang-1.mjs`: **PASS 100% (6/6 mục P0)**
- `npm test`: **PASS 100% toàn bộ các test suite (Theme contrast, Scope rules, Auth, Family Zalo, Study tracker, Calm corner, Custom theme, Teacher reminder, Admin theme, Prompt 11, E2E full flow, Chặng 1)**
- `npm run build`: **PASS (Bản build hoàn tất không lỗi, không còn chuỗi "Tài khoản mặc định", "admin123", "auth_token")**

---

### 4. Việc chưa làm trong Chặng 1 và lý do

- Không có mục P0 nào chưa làm. Toàn bộ 6 mục P0.1 → P0.6 đã hoàn thành xuất sắc và vượt qua kiểm thử tự động.
- Mật khẩu admin thật trên hệ thống Cloudflare Worker sẽ do chủ dự án đổi bằng tay theo quy tắc bảo mật.
