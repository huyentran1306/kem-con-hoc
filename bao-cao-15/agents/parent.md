# Chặng 6 · Trang bố mẹ (người làm: `parent`)

Chỉ đổi giao diện, không đổi luồng, prompt AI hay dữ liệu. Mọi màu mới dùng token của bộ đang chọn (`--c-*`), đã chạy thử bộ Bạn Gấu, Bảng Phấn, Cực Quang ở 390px, 820px, 1366px.

## Kết quả từng mục

### 6.1 Chung
| Mục | Trạng thái | Ghi chú |
|---|---|---|
| Chữ quá nhỏ | Xong | `.lbl`, `.eyebrow`, `.tag-new`, thanh tab: 12px; `.sub`: 14px; chữ phụ trong slot của 8 bộ (`fontSize` 10 đến 11,5) nâng lên 12px; chip "Sổ sticker", "🔥 3 tối", "Ôn vui 10 phút" không còn 11px |
| Vùng bấm < 44px | Xong | Nút dải Dùng thử, ✕, chip chọn con, chip "Bó bút nhân chia" (`button.pill`), nút tiếng: tối thiểu 44px |
| Nút "Mẹ bình tĩnh" che nội dung cuối | Xong | Đệm cuối trang `172px + safe-area`; nút thu thành hình tròn chỉ có biểu tượng khi cuộn xuống, hiện lại khi cuộn lên. Điện thoại: khung app cao đúng 100dvh (lớp `parent-shell`) để thanh tab và nút nổi luôn ở đáy |
| Dấu chân đè chữ | Xong | Lớp hoạ tiết nằm dưới lớp chữ (`isolation` + `z-index:-1`), dấu chân mờ 0,07, dời ra mép trống |
| Câu chữ | Xong | "Sổ sticker: 3", "Mỗi bé 1 lớp, 1 bộ sách riêng", "Gia đình Dùng Thử" (không lặp), "Mẹ có 3 bó bút…", bỏ viết hoa mọi chữ, bỏ dấu gạch dài trong chữ hiển thị ở `screens.jsx` |
| Nhãn tiếng Anh | Xong | "Con tiến bộ theo tuần", "Phẩm chất tuần này so với tuần trước", "Cài app ra màn hình chính" |
| Ô điều khiển không đồng bộ | Xong | Component `Switch` dùng chung (`role="switch"`, `aria-checked`, `aria-label`) thay 2 ô tích; lịch chia ca, đồng bộ, âm thanh cũng dùng `Switch`. Ô nhập đoán số bút có `aria-label` |
| Màu lệch bộ giao diện | Xong | Báo cáo bỏ khối tím, lam, xanh pastel; 4 thẻ phẩm chất cùng nền bộ đang chọn, phân biệt bằng biểu tượng + nhãn. Thêm: chip, `pill`, nhãn in hoa, thẻ Cô nhắc, thẻ trực ca, thẻ đổi quà dùng token; bảng trượt ở bộ tối có nền đặc |
| Laptop, máy tính bảng | Xong | ≥1024px: thanh điều hướng trái, nội dung tối đa 1100px; trang chính 2 cột (trái: phần học tối nay; phải: Cô nhắc, dấu chân, gần đây); Báo cáo và Con tôi lưới 2 cột. 768 đến 1023px: một cột 640px. Màn luồng học giữ một cột 720px |

### 6.2 Trang chính
| Mục | Trạng thái |
|---|---|
| Dòng ngày rút gọn "CN 25/10 · Lớp 3"; nút tiếng chỉ biểu tượng có `aria-label` | Xong |
| "Đã nhắc con" thành nút phụ nhỏ (`btn ghost btn-sm`) | Xong |
| "Chấm vở ngay" thành nút phụ | Xong |
| Thứ tự: lời chào, chọn con, Bắt đầu + Gõ đề/Đọc đề ở màn đầu; sau đó Cô nhắc, Chấm vở, dấu chân, hay vướng, gần đây | Xong |

### 6.3 Báo cáo tuần
| Mục | Trạng thái |
|---|---|
| "vướng /" hiện đủ "vướng 2/3 lần" (dữ liệu chỉ có `count` thì "vướng 2 lần") | Xong |
| Thứ tự: tóm tắt (Ai kèm, Tuần này cùng AI), hay vướng, đã vững, phẩm chất, Phân tích, lịch học, riêng người lớn, gửi Zalo | Xong |

### 6.4 Con tôi
| Mục | Trạng thái |
|---|---|
| 4 nhóm có tiêu đề: Con, Cả nhà, Cài đặt, Riêng tư và an toàn | Xong |
| "Sửa hồ sơ" mở form có sẵn giá trị của con đang chọn, nút Lưu và Huỷ (`EditChildSheet`) | Xong |
| "Xoá toàn bộ dữ liệu" kiểu nút nguy hiểm, nằm ở thẻ riêng; hộp xác nhận bắt gõ đúng tên gia đình rồi mới bấm được "Xoá vĩnh viễn" (sau đó vẫn hỏi mật khẩu như cũ) | Xong. Dùng `WipeSheet` theo token của 8 bộ thay vì `ConfirmDialog` của bộ staff (bộ staff chỉ có màu Bạn Gấu) |

### 6.5 Chơi với đồ chơi
| Mục | Trạng thái |
|---|---|
| Lưới bó bút tự xuống dòng trong khung 390px | Xong |
| 3 nút tròn thành hàng nút viên thuốc | Xong |

### 6.6 Dải Dùng thử, đăng nhập
| Mục | Trạng thái |
|---|---|
| ✕ chỉ thu gọn dải (còn nút nhỏ "✨ Dùng thử" để mở lại); "Thoát" là nút riêng có hộp xác nhận | Xong |
| "Tạo tài khoản" mở thẳng tab "Tạo gia đình mới" | Xong (`LoginScreen` nhận `initialMode`) |

## File đã đổi
- `src/styles.css`: khối mới cuối file "ĐỢT 15 · CHẶNG 6".
- `src/App.jsx` (chỉ phần bố mẹ): dải Dùng thử, `parent-shell`, nút nổi thu tròn, `EditChildSheet`, `WipeSheet`, `wipe({ confirmed })`.
- `src/screens.jsx`: `Home`, `Report`, `Profile`, `PenGame`, `WeeklyAiCards` (cỡ chữ), bỏ dấu gạch dài trong chữ hiển thị.
- `src/ui.jsx`: thêm `Switch`, `useWide`.
- `src/Login.jsx`: prop `initialMode`.
- `src/TeacherReminderBanner.jsx`: nút phụ, màu theo token.
- `src/themes/slots/defaultSlots.jsx`, `src/themes/slots/themedSlots.jsx`: nút Chấm vở thành nút phụ, chữ tối thiểu 12px.
- Không sửa `themes.js`, `themes.css`.

## Kiểm thử
- Bundle esbuild: đạt.
- `test-theme-contrast.mjs`: đạt.
- `test-dot15-chang-0.mjs`: 20/21 mục đạt. Mục P0.C báo "Cô Hạnh" trong `src/teacher/format.js` và `src/ui/staff/index.jsx`, là file của người làm cổng giáo viên, không phải file của chặng 6. Bỏ 2 file đó ra thì cả 21 mục đều đạt.
- Chạy thử bằng Chromium ở chế độ Dùng thử: nút nổi thu tròn khi cuộn xuống, mở lại khi cuộn lên; ở cuối trang nút nổi nằm dưới nội dung cuối (cách 34px); ✕ thu gọn dải; "Thoát" hỏi trước khi thoát; "Tạo tài khoản" mở tab Tạo gia đình mới; Sửa hồ sơ có sẵn tên và lưu đúng; nút Xoá vĩnh viễn bị khoá đến khi gõ đúng tên; không có lỗi trang.
- Ảnh: `bao-cao-15/anh/chang6-*.png`.

## Phát hiện thêm
- State Dùng thử không có `schedule` nên trang Con tôi bị sập ("Có chút trục trặc nhỏ"). Đã thêm lịch mặc định khi thiếu `schedule` (`SCHEDULE_DEFAULT`).
- Ở bộ Cực Quang và Bảng Phấn, bảng trượt trong suốt làm lộ chữ bên dưới. Đã ghi đè nền đặc trong `styles.css`.
- Biểu tượng FontAwesome ở thẻ phẩm chất cần CDN; khi không có mạng thì ô biểu tượng trống, nhãn chữ vẫn hiện.
