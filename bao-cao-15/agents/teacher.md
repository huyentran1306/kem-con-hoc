# Báo cáo agent `teacher` · Chặng 5 · Cổng giáo viên

Ngày 25/10/2026. Không chạy git, không deploy, không gọi AI, không đụng production.

## Kết quả từng mục của Chặng 5

| # | Mục trong spec | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | "Lớp Lớp 3A" ở ô chọn lớp, một hàm định dạng tên lớp | Xong | `formatClassName` trong `src/teacher/format.js`, dùng ở ClassSwitcher, trang lớp, mã QR, tin Zalo, trang vào lớp, banner đăng nhập |
| 2 | Điện thoại: tab dưới có lối vào "Cài đặt của cô" | Xong | Tab dưới 5 mục: Lớp, Bài tập, Học sinh, Thông báo, Cô (Cô = cài đặt của cô + nút Đăng xuất) |
| 3 | < 640px bảng học sinh thành thẻ | Xong | Thẻ: tên, trạng thái, mã riêng, nút Duyệt / Từ chối cao 44px; bảng vẫn giữ trên máy tính |
| 4 | "Đã xác nhận: 0 gia đình" → "đã nhắc con" | Xong | "Đã đọc: X gia đình · Y gia đình đã nhắc con" + nút "Xem từng gia đình" (dữ liệu thật từ `/reads`) |
| 5 | Cột tên hiện `roster_name` | Xong | `rosterNameOf()` đọc cả `rosterName` và `roster_name`, trống thì "Chưa có tên" |
| 6 | Cài đặt của cô: email, khối dạy trống | Xong | Dòng trống thì ẩn; khối dạy đọc được "Khối 3", số, hoặc mảng JSON; thêm tỉnh, số điện thoại khi có |
| 7 | Trang `/vao-lop/<mã>` dùng tên lớp đầy đủ và tên cô đầy đủ | Xong | `FamilyClassSheet.jsx` (thẻ xem trước, lớp đã vào, đổi con, rời lớp) và dòng banner trong `Login.jsx` ("Đăng nhập để vào Lớp 3A của cô ...") |
| 8 | Tab Kết quả: biểu đồ bậc hay vướng + thẻ trợ lý gấu; bỏ nhãn trống góc phải | Xong | Biểu đồ thanh theo bậc (dữ liệu thật hoặc trạng thái trống có gấu), thẻ trợ lý gợi ý từ số liệu tổng hợp (không gọi AI, không tên trẻ). Nhãn trống do gọi `StatusPill` sai prop: đã thay bằng `TPill` có chữ "Đang mở"/"Đã đóng" |
| 9 | "Cô Cô Hạnh" ở chân thanh bên | Xong | `formatTeacherName` (đã có "Cô"/"Thầy" thì không thêm, gộp "cô Cô", viết hoa đầu câu, `{lower:true}` giữa câu) |
| 10 | Thanh bên: chữ menu ≥ 14px, nhãn ngắn, rộng 220px, "Quyền riêng tư" ngay dưới menu | Xong | Nhãn: Lớp của cô, Bài tập, Học sinh, Thông báo, Kết quả, Cài đặt của cô; hồ sơ cô dồn xuống đáy |
| 11 | "Dạng bài" dùng `Select` tự vẽ | Xong | Đồng thời bỏ **mọi** `<select>` mặc định còn lại trong cổng giáo viên (đăng ký, tạo lớp, soạn bài, cài đặt lớp, nhắc việc) |
| 12 | Danh sách lớp trên điện thoại: 4 thẻ chỉ số lưới 2x2 | Xong | `KpiCard` trong `.tp-kpi-grid`, đang tải thì "·" |
| 13 | < 640px nút "Soạn bài mới", "Dán danh sách học sinh", "Soạn thông báo mới" thành hàng riêng rộng hết thẻ | Xong | `.tp-head` / `.tp-head-actions` (cả nút "Tạo lớp mới") |
| 14 | Đầu lớp gọn trên điện thoại | Xong | Tên lớp + "Mã XXXXXX" một hàng; Mã QR và Gửi qua Zalo thành 2 nút nhỏ có biểu tượng; ẩn dòng khối, trường |
| 15 | Nhãn tab dưới một dòng | Xong | Lớp, Bài tập, Học sinh, Thông báo, Cô; chữ 12px, không xuống dòng |
| 16 | Thanh tab của lớp: lớp mờ mép phải, tự cuộn tab đang chọn vào giữa | Xong | `ClassTabs` trong `src/teacher/parts.jsx`; nhãn ngắn (Bài tập, Học sinh, Thông báo, Kết quả, Cài đặt lớp); phím ← → |
| 17 | Nút trong thẻ bài xuống dưới tiêu đề < 640px | Xong | `.tp-asg-card` cột dọc, nút rộng hết thẻ |
| 18 | Không có nút tím | Xong | Bỏ hết màu chàm `#4F46E5`, hồng `#D6336C`, xám slate; nút Duyệt/Từ chối dùng `Button` của bộ quy chuẩn |
| 19 | "0 học sinh" thẻ lớp so với danh sách 5 em | Đã kiểm | Thẻ lớp đếm `status='active'`, danh sách gồm cả chờ duyệt/đã gửi mã nên lệch là đúng. Trang lớp trước đây không có số đếm (API `GET /classes/:id` chỉ trả `SELECT *`): nay ghép số đếm từ danh sách lớp |

### Sửa thêm (phát hiện khi làm)
- **Số liệu giả trong Nhắc việc:** trước hiện cứng 24 đã đọc, 19 đã nhắc, 28 gia đình và 5 tên học sinh mẫu; nút "Gửi cho 28 gia đình" viết cứng. Nay lấy thật từ thông báo `kind='reminder'` (read_count, done_count), số gia đình = học sinh đã kết nối, giới hạn 3 lời nhắc tính theo ngày áp dụng thật.
- **Nhận xét AI giả:** endpoint `/insight` trả câu viết cứng ("35% học sinh vướng ở bước 2..."). Đã bỏ nút gọi nó; thẻ trợ lý nay tự gợi ý từ số liệu tổng hợp thật.
- `Kpi` bị truyền `hint` (không có prop này) nên dòng phụ không hiện; `AssistantCard` bị truyền children (bị bỏ qua). Đã thay bằng `KpiCard`, `BearAssistant`.
- Chữ dưới 12px trong cổng giáo viên nâng lên 12px (style chung, ClassSwitcher, SideNav, StaffShell, Segmented trong cổng).
- Đồng bộ mục đang chọn ở thanh bên khi bấm tab trong lớp; bấm lại mục ở thanh bên luôn mở đúng tab.

## File đã đổi / thêm
- Thêm: `src/teacher/format.js`, `src/teacher/parts.jsx`, `src/teacher/teacher.css`
- Sửa: `src/TeacherPortal.jsx`, `src/ui/staff/index.jsx` (chỉ ClassSwitcher, SideNav, StaffShell + 1 dòng import), `src/FamilyClassSheet.jsx` (chữ tên lớp, tên cô), `src/Login.jsx` (chỉ dòng banner vào lớp + 1 dòng import)
- Worker (mới, chưa nối): `ai-gateway-worker/src/dot15_teacher.js` → `GET /api/v1/teacher/assignments/:id/step-stats`

## Việc cần chủ dự án / agent khác
1. **Nối endpoint mới** trong `ai-gateway-worker/src/v1_routes.js`, trước dòng gọi `handleTeacherRoute`:
   `import { handle as handleDot15Teacher } from "./dot15_teacher.js";` rồi `const d15 = await handleDot15Teacher(request, env, ctx, pathname, method, corsHeaders); if (d15) return d15;`
   Chưa nối thì biểu đồ hiện trạng thái trống "Chưa có dữ liệu bậc hay vướng" (không lỗi).
2. **Không có dữ liệu thật cho bậc hay vướng:** app phụ huynh chưa bao giờ gọi `updateSession` (api.js) nên `learning_sessions.stuck_count/hint_level_max`, `session_events` và `assignment_results` đều trống. Cần app gửi sự kiện `step_hint`/`stuck` có `step` khi làm bài cô giao.
3. **Lỗi SQL ở `GET /teacher/assignments/:id/results`** (teacher_routes.js): `LEFT JOIN assignment_results ar ON cs.id = ar.class_student_id LEFT JOIN assignment_items ai ON ... AND ai.assignment_id = ?` không lọc `ar` theo bài, nên số câu đã làm của học sinh cộng cả bài khác. Nên chuyển điều kiện vào: `LEFT JOIN assignment_results ar ON cs.id = ar.class_student_id AND ar.item_id IN (SELECT id FROM assignment_items WHERE assignment_id = ?)`.
4. `/insight` trả nội dung viết cứng: nên xoá hoặc làm thật.
5. `GET /teacher/classes/:id` nên trả kèm `active_students_count`, `pending_students_count` (frontend đang ghép tạm từ danh sách lớp).
6. `api.js` `teacherLabel()` vẫn còn dùng ở chỗ khác; có thể thay bằng `formatTeacherName(name, { lower: true })` để thống nhất (không sửa vì ngoài phạm vi).

## Kiểm tra đã chạy
- Bundle check `src/main.jsx` (esbuild): **OK**.
- `format.js` bằng node: `3A`, `Lớp 3A`, `lớp lớp 3A` → `Lớp 3A`; `Hạnh`, `Cô Hạnh`, `cô Cô Hạnh` → `Cô Hạnh`; `Thầy An` giữ; trống → `Cô chủ nhiệm`; `{lower:true}` → `cô Tran`.
- Chạy thử toàn bộ cổng giáo viên bằng React 19 + jsdom với API giả lập (1440px và 390px, tên cô "Cô Hạnh", "Hạnh", "cô Cô Hạnh", có và không có endpoint step-stats): đi qua Danh sách lớp, Bài tập, Học sinh, Thông báo, Nhắc việc, Kết quả, Chi tiết kết quả, Cài đặt lớp, Cài đặt của cô. Trong DOM **không có**: "Lớp Lớp", "Cô Cô", "undefined", "NaN", "1970", "Mục 4b", "Đã xác nhận", và **0 thẻ `<select>`**. Tab dưới điện thoại đúng 5 mục.
- Worker `dot15_teacher.js` bundle esbuild: OK.
- Chưa chụp ảnh Playwright, chưa chạy axe (để Chặng 7).
