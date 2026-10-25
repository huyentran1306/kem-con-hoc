# Báo cáo nhóm "Theo dõi" (Chặng 3) · kỹ sư `monitor`

Ngày 25/10/2026. Năm trang làm lại bằng bộ quy chuẩn `src/ui/staff` (PageHeader có một câu mô tả, KpiCard, DataTable, Select tự vẽ, Drawer, EmptyState, StatusPill, staffToast, staffConfirm). Không còn `<select>` mặc định, không còn nhãn nội bộ, không còn số viết cứng hay số dự phòng tự bịa. Thiếu dữ liệu thì hiện "·" hoặc trạng thái trống có gấu.

## Từng trang

### Tổng quan (`src/AdminOverviewTab.jsx`)
- PageHeader (ngày hôm nay ở dòng breadcrumb, nhãn "N buổi đang diễn ra" chỉ hiện khi N > 0), Segmented Hôm nay / 7 ngày / 30 ngày, nút Tải lại.
- 4 KpiCard: Gia đình có học, Học sinh, Buổi học (phút trung bình chỉ tính trên buổi có `ended_at`), Con tự làm được (tỉ lệ + số buổi đã đánh giá).
- Tỉ trọng môn học (chỉ đếm buổi có môn, không gán mặc định "Toán"), Chất lượng AI (độ trễ trung vị và p95 chỉ có số khi có lượt gọi AI thật, không còn 1,2 s và 2,4 s mặc định), Việc cần xử lý (bấm để chuyển trang).
- DataTable 10 buổi gần nhất, có trạng thái trống, tự làm mới 30 giây bằng Toggle. Đã bỏ "Lớp 3", "Toán", "1 phút", "Đạt chuẩn AI", "Cần hướng dẫn" tự gán; buổi chưa đánh giá hiện "Chưa đánh giá", chưa kiểm định hiện "Chưa kiểm định".
- Nguồn: `GET /api/v1/admin/overview-stats` (mới). Nếu endpoint mới chưa có thì dùng `/overview` cũ nhưng bỏ các số mặc định.

### Gia đình & học sinh (`src/AdminFamiliesTab.jsx`)
- Bỏ "4,8 ngày", "65 phút", "78%". Các chỉ số tính thật từ `GET /api/v1/admin/families-stats` (mới): ngày có học trung bình trong 7 ngày, phút kèm mỗi tuần (chỉ buổi có thời lượng thật), % gia đình có thành viên mở app trong 7 ngày (`members.last_seen_at`). Không có dữ liệu thì "·".
- Bảng DataTable 10 dòng mỗi trang: tên, mã, ngày tham gia, số thành viên, số con, số buổi, buổi gần nhất, trạng thái (tính theo buổi học gần nhất, không theo ngày tạo tài khoản). Tìm kiếm bằng Input, lọc trạng thái bằng Select. Xuất CSV (UTF-8 có BOM).
- Đọc `?q=` trên URL (cả `location.search` lẫn kiểu `#/...?q=`) để lọc sẵn, có nghe `popstate`/`hashchange`.
- Bấm một gia đình mở Drawer: các con (bảng `children`, nếu trống thì đọc `children` trong trạng thái đồng bộ `fam:<id>:state`), thành viên (vai trò, lần cuối mở app), lớp đã tham gia (`class_students` + `classes` + `teachers`), 10 buổi gần nhất, tổng buổi và tổng phút. Nguồn `GET /api/v1/admin/family-detail?id=`.

### Buổi học & AI (`src/AdminSessionsTab.jsx`)
- Tiêu đề đổi thành "Buổi học & AI"; **đã bỏ khối "Nguyên tắc vàng"** (trùng trang Mô hình).
- KpiCard tính thật từ `GET /api/v1/admin/sessions-stats` (mới): tổng buổi, % đạt kiểm định, đã chặn / bị lọt, báo cáo nội dung chờ xem. Bỏ "100%" và "0 / 0 lọt" viết cứng.
- Bộ lọc: Input tìm (tự tìm sau 400 ms), Select lớp, môn, kết quả kiểm định (bỏ lựa chọn "Đạt chuẩn" vì máy chủ không lọc được). DataTable + Pagination phía máy chủ.
- Drawer chi tiết: đề bài (vai trò hỗ trợ không thấy đề), tóm tắt (thời lượng thật, bậc gợi ý, lần vướng, số bậc), dòng thời gian sự kiện, nút Lưu làm ví dụ mẫu và Mở trong bàn thử. Nguồn `GET /api/v1/admin/session-detail?id=` (đọc được cả hai kiểu cột `session_events`: `event_type/step_index/created_at` và `type/step/ts`), dự phòng `/learning-sessions/:id`.

### Báo cáo & NPS (`src/AdminReportsTab.jsx`)
- Bỏ "+82 · 9,2/10 · Xuất sắc" và 5 nhãn % viết cứng. Từ `GET /api/v1/admin/nps-summary` (mới): NPS, điểm trung bình, số phiếu, % phiếu có lời nhận xét, phân bố ủng hộ / trung lập / chưa hài lòng, nhãn nhận xét chọn nhiều nhất với % trên tổng phiếu (đọc cột `tags`, chấp nhận dạng "a,b" hoặc JSON).
- 0 phiếu: EmptyState "Chưa có phiếu đánh giá nào", không hiện KpiCard NPS.
- Bản đồ khung giờ: `GET /api/v1/admin/peak-hours?days=7|30|90` (mới) đếm `learning_sessions.started_at` đổi sang giờ Việt Nam (+7), gom 5 buổi (sáng, trưa, chiều, tối, khuya) × 7 ngày; câu tóm tắt "Đông nhất vào…" tính từ dữ liệu. Không có buổi nào thì EmptyState.
- Góp ý gần nhất chỉ hiện khi có phiếu. Nút In hoặc lưu PDF (các nút ẩn khi in).

### Giáo viên & lớp (`src/AdminTeachersTab.jsx`)
- Viết lại theo bộ quy chuẩn: PageHeader (nhãn "N hồ sơ chờ duyệt"), 4 KpiCard (đăng ký, chờ duyệt, đang dạy, số lớp + số học sinh), Tabs có số đếm theo trạng thái, Input tìm, DataTable.
- Tải toàn bộ giáo viên một lần rồi lọc ở máy khách, nên số đếm trên tab luôn đúng (trước đây lọc ở máy chủ làm số đếm sai khi đổi tab).
- **Danh sách lớp của từng cô**: cột "Lớp" (số lớp + 2 tên lớp đầu) và Drawer chi tiết liệt kê từng lớp (khối, năm học, mã vào lớp, số học sinh, trạng thái). Lấy từ `GET /api/v1/admin/classes`, nhóm theo `teacher_id`. Tên lớp dùng "Lớp 3A" (không thành "Lớp Lớp 3A").
- Duyệt và tạm khoá / mở khoá hỏi lại bằng `staffConfirm`; từ chối làm ngay trong Drawer (nhãn lý do nhanh bằng Chip + Textarea); kết quả báo bằng `staffToast`.

## Tệp đã đổi hoặc tạo
- Sửa: `src/AdminOverviewTab.jsx`, `src/AdminFamiliesTab.jsx`, `src/AdminSessionsTab.jsx`, `src/AdminReportsTab.jsx`, `src/AdminTeachersTab.jsx` (giữ nguyên tên export và các prop `token`, `onNavigateTab`, `onOpenPromptStudio`; thêm `export default`).
- Mới: `src/admin/pages-monitor.css` (lớp `pm-*`, chỉ dùng biến màu `--s-*`), `src/admin/monitorShared.js` (gọi API không ném lỗi, đọc giờ D1 theo UTC rồi hiện giờ Việt Nam, định dạng số vi-VN, nhãn tự đánh giá / kiểm định, đọc `?q=`).
- Worker mới: `ai-gateway-worker/src/dot15_monitor.js`, export `handle(request, env, ctx, pathname, method, corsHeaders, adminSession)`; trả `null` với đường dẫn khác. Endpoint (đều GET, cần `adminSession`, trả 423 nếu phiên đang khoá):
  `/api/v1/admin/overview-stats`, `/families-stats`, `/family-detail?id=`, `/sessions-stats`, `/session-detail?id=`, `/nps-summary`, `/peak-hours?days=`.
  Mọi truy vấn dùng prepared statement; lỗi bảng hoặc cột thì trả giá trị rỗng (không làm hỏng cả trang); không có dữ liệu thì trả `null`.

## Kiểm tra
- Bundle app (`esbuild src/main.jsx …`): OK. Bundle từng trang riêng: OK.
- Bundle worker (`src/index.js`): OK. Bundle riêng `src/dot15_monitor.js`: OK.
- Rà tĩnh: không còn `<select>`, "Stitch", số dự phòng kiểu `|| 85`. Không chạy được app ở đây nên chưa có ảnh chụp màn hình.

## Chưa làm / cần người khác
1. **Nối module**: coordinator cần gọi `handle` của `dot15_monitor.js` trong khối `/api/v1/admin/` của `v1_routes.js` (sau `authenticateAdmin`). Đường dẫn mới không trùng tiền tố `/api/v1/admin/teachers` hay `/classes` của `teacher_routes.js`. Trước khi nối và deploy, giao diện tự dùng endpoint cũ nhưng bỏ số mặc định, nên một số ô sẽ hiện "·" (thời lượng, độ trễ, chỉ số gia đình, % đạt kiểm định, khung giờ).
2. **Tên mục ở thanh bên** vẫn là "Nhật ký & AI" trong `src/Admin.jsx` (dòng ~359), không thuộc tệp của tôi: cần đổi thành "Buổi học & AI" (người làm khung admin).
3. **Đổi tên gia đình, đặt lại mật khẩu, xoá gia đình đã gỡ khỏi trang**: các nút cũ gọi `PATCH /api/v1/family/name` và `/family/password` (không có trên worker) và `DELETE /api/v1/family` (chỉ chủ nhà, cần mật khẩu gia đình), lại gửi khoá chủ cũ trong mã, nên chưa bao giờ chạy được. Muốn có lại cần endpoint admin riêng có kiểm vai trò và ghi nhật ký thao tác (thuộc chặng 4).
4. Endpoint cũ `/api/v1/admin/overview` và `/nps` vẫn còn số mặc định (độ trễ 1200/2400 ms, NPS 75, điểm 9,2) và `/learning-sessions` vẫn tính thời lượng tối thiểu 60 giây; tôi không sửa vì nằm trong tệp dùng chung. Giao diện mới không dùng các số đó. Nên gỡ khi dọn chặng 4.
5. `GET /api/v1/admin/learning-sessions/:id` cũ đọc cột `event_type, step_index, payload_json, created_at` của `session_events`, trong khi chỗ ghi dùng `ts, type, step`: có thể lỗi trên D1 thật. Trang mới dùng `/session-detail` (đọc `SELECT *` nên chịu được cả hai).
6. Bảng `children` không thấy chỗ nào trên worker ghi vào; Drawer gia đình dự phòng bằng trạng thái đồng bộ. KpiCard "Học sinh" ở Tổng quan đếm bảng `children`; bảng trống thì endpoint mới trả null (hiện "·") thay vì 0. Nên thống nhất nơi lưu hồ sơ con.
7. Chưa có ảnh trước và sau (không chạy được app trong môi trường này).
