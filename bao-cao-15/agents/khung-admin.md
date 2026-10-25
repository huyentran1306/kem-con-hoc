# Chặng 2 · Khung admin (khung-admin)

## Việc đã làm theo từng mục

1. **Thanh bên phẳng 3 nhóm, bỏ menu gập** (`src/admin/ShellSidebar.jsx`, bảng trang ở `src/admin/ShellRoutes.jsx`)
   - Theo dõi: Tổng quan, Gia đình & học sinh, Buổi học & AI, Báo cáo & NPS, Giáo viên & lớp.
   - AI & nội dung: Mô hình & tham số, Prompt Studio, Router sư phạm, Phạm vi đề & ảnh, An toàn AI, Giao diện app.
   - Hệ thống: Quản trị viên, Nhật ký thao tác, Hạ tầng & lỗi, Thông báo & Zalo; D1 SQL Studio chỉ với `superadmin`; Team Prompts Sync chỉ khi `import.meta.env.VITE_DEV_TOOLS === '1'`.
   - Vai trò `support` chỉ thấy nhóm Theo dõi và An toàn AI (giữ như trước); mở URL trang không đủ quyền thì hiện `EmptyState` "Trang này cần quyền cao hơn".
   - Dưới 1280px thanh bên thu còn biểu tượng (có `title` và `aria-label`); dưới 768px thành ngăn kéo mở bằng nút ☰ (có nền mờ, Esc hoặc bấm ra ngoài để đóng).
   - Ghép trang: overview→AdminOverviewTab, families→AdminFamiliesTab, sessions→AdminSessionsTab (`onOpenPromptStudio` mở `/admin/prompt-studio`), reports, teachers, safety→AdminSafetyTab; model/prompts/router/scope/themes/admins/audit/infra/zalo → `<AdminConfigTab activeSubTab onSubTabChange hideSubNav>`; sql/team_prompts → `<AdminToolsTab activeSubTab onSubTabChange hideSubNav>`. Các trang khác giữ nguyên props cũ.
2. **Mỗi trang một đường dẫn**: `/admin`, `/admin/gia-dinh`, `/admin/buoi-hoc`, `/admin/bao-cao`, `/admin/giao-vien`, `/admin/mo-hinh`, `/admin/prompt-studio`, `/admin/router`, `/admin/pham-vi`, `/admin/an-toan`, `/admin/giao-dien`, `/admin/quan-tri-vien`, `/admin/nhat-ky`, `/admin/ha-tang`, `/admin/zalo`, `/admin/sql`, `/admin/team-prompts`. Dùng `history.pushState` + `popstate` (nút quay lại chạy được, quay lùi ra khỏi `/admin` thì gọi `onExit`). Slug lạ, `/admingraph`, `#admin` → Tổng quan; hỗ trợ thêm `#admin/<slug>`. Mục trong thanh bên là thẻ `<a href>` thật nên Ctrl/Cmd+bấm mở tab mới được. `App.isAdminRoute` đã đủ, không phải sửa `App.jsx`.
3. **Đầu trang** (`src/admin/ShellHeader.jsx`): đường dẫn "Nhóm › Trang"; ô tìm chung (Enter: chữ trùng tên/từ khoá trang thì mở trang đó, không thì sang Gia đình với `?q=` trên URL); giờ Việt Nam dạng "T2 26/10 · 09:10" cập nhật mỗi phút; chuông lấy `total` từ `GET /api/v1/admin/todo-counts` (tải lại mỗi 5 phút), danh sách Giáo viên chờ duyệt, Câu phụ huynh báo, Nội dung bị báo cáo, Lỗi mới trong 24 giờ, mục nào `null` thì ẩn, bấm để mở trang tương ứng. Nút tài khoản (chữ cái đầu) mở menu: tên, email, vai trò, "Giao diện Bản Gấu · Đang dùng", Khoá màn hình, Ra app phụ huynh, Đăng xuất. Đã bỏ hẳn giao diện xanh dương.
4. **Bỏ nhãn "Admin"/"Stitch"**; thẻ gấu ở thanh bên dùng số thật `metrics.totalSessions` của `GET /api/v1/admin/overview?range=today` (máy chủ tính 24 giờ qua nên ghi "24 giờ qua có N buổi kèm học"), số 0 hoặc lỗi thì ẩn. Chấm trạng thái lấy từ một lần `GET /api/v1/admin/health`: "Đang kiểm tra…" / "Máy chủ: hoạt động" / "Máy chủ: có lỗi".
5. **Chặn truy cập ở máy chủ**: `Admin.jsx` bắt đầu ở trạng thái `checking` ("Đang kiểm tra phiên…"), gọi `GET /api/v1/admin/me`; chỉ khi trả `ok` + `admin` mới dựng khung. 401/403 → đăng nhập (báo "Phiên đăng nhập đã hết hạn"), 423 → màn khoá PIN, lỗi mạng → màn "Chưa kiểm tra được phiên" có nút Thử lại. Token lưu ở khoá mới `kem-con-hoc:admin-token`; khi nạp admin xoá hẳn `kem-con-hoc:admin-auth` (cùng `admin-profile`, `admin-theme` cũ), không còn chỗ nào đọc khoá cũ. Hồ sơ quản trị lấy từ `/me`, không lưu máy. `getAdminToken` (src/api.js) đọc khoá mới. `src/adminApi.js`: bỏ `ADMIN_MASTER_SECRET` và việc thử lại bằng khoá chủ; 401 phát `kch-admin-unauthorized` (khung quay về đăng nhập), 423 phát `kch-admin-locked` (khung chuyển màn khoá). Đăng xuất gọi `POST /api/v1/auth/logout` để thu hồi token ở máy chủ (endpoint có sẵn, thu hồi theo token nên dùng được cho admin). Tự khoá theo `autoLockMins` của tài khoản (mặc định 15 phút).
6. **Đăng nhập và khoá** làm lại theo bộ quy chuẩn (nền kem, gấu, `Field`/`Input`/`Button`/`Banner`); bàn phím PIN tròn viền đáy màu kem. `<ToastHost/>` và `<ConfirmHost/>` gắn đúng một lần ở gốc admin; `toast()` cũ của `utils.js` mà các trang đang dùng được chuyển sang `staffToast` để hiện ra.

## File đã đổi
- `src/Admin.jsx` (viết lại khung), `src/adminApi.js`, `src/AdminLockScreen.jsx` (đổi giao diện, giữ logic), `src/admin.css` (thêm khối "ĐỢT 15 · CHẶNG 2" ở cuối, lớp `kadm-*`; không xoá lớp cũ), `src/api.js` (chỉ `getAdminToken`).
- Mới: `src/admin/ShellRoutes.jsx`, `src/admin/ShellSidebar.jsx`, `src/admin/ShellHeader.jsx`, `src/admin/ShellLogin.jsx`, `scripts/test-dot15-chang-2.mjs`.
- Không sửa `App.jsx`, kit, worker.

## Kiểm thử đã chạy
- Bundle esbuild `src/main.jsx`: OK sau khi xong khung. Lần chạy cuối bị chặn bởi việc dở dang của cổng giáo viên (`src/TeacherPortal.jsx` import `./teacher/parts.jsx` chưa có), không liên quan khung admin. Bundle riêng `src/Admin.jsx` làm gốc: OK.
- `node scripts/test-dot15-chang-2.mjs`: 30 mục đạt, 0 lỗi (đặt `STRICT=1` để coi chuỗi khoá cũ ở file người khác là lỗi).
- Chạy thử logic `ShellRoutes` (bundle ra ESM): đọc URL, slug lạ, `#admin/zalo`, ô tìm ("prompt"→Prompt Studio, "Nguyễn Văn Anh"→Gia đình `?q=`), quyền theo vai trò, giờ VN đúng múi giờ.
- `test-dot14-chang-4.mjs` (kiểm `AdminSafetyTab` và `activeTab === 'safety'` trong Admin.jsx): đạt. `test-chang-1/2.mjs` không chạy được trong VM vì đọc đường dẫn `/Users/pro/...` (lỗi sẵn có, không do thay đổi này); các ý liên quan Admin.jsx (không "Tài khoản mặc định", "admin123", " · Stitch") vẫn đúng.

## Còn chuỗi cũ ở file không thuộc tôi (cần chủ file xử lý)
- `src/teamPromptsData.json`: 2 chỗ chứa `kem-con-hoc-admin-secret-2026` và `kem-con-hoc:admin-auth` trong phần chữ tài liệu; vẫn bị đóng vào bundle (qua TeamPromptSyncTab/AdminToolsTab). Nên gỡ hoặc chỉ nạp khi `VITE_DEV_TOOLS=1`.
- `scripts/test-e2e-full-flow.mjs:52` dùng mật khẩu `kem-con-hoc-admin-secret-2026`; `scripts/sync-db-clone.js:27` lấy nó làm giá trị mặc định khi thiếu `ADMIN_KEY`.
- Worker `v1_routes.js` (`authenticateAdmin`, admin login) vẫn nhận khoá cũ khi `ALLOW_LEGACY_MASTER_SECRET="true"` (điểm dừng của chủ dự án).
- `src/AdminFamiliesTab.jsx` trước đây gửi `x-admin-key: kem-con-hoc-admin-secret-2026`; lúc kiểm tra cuối đã không còn.
- Không còn file nào trong `src` dùng `ADMIN_MASTER_SECRET` hay đọc `kem-con-hoc:admin-auth`.

## Chưa làm / cần người khác
- `AdminConfigTab`, `AdminToolsTab` chưa nhận prop `hideSubNav` (chủ file cần ẩn thanh tab con khi `hideSubNav`); trong lúc chờ, bấm tab con vẫn chuyển URL đúng.
- `AdminFamiliesTab` cần đọc `new URLSearchParams(location.search).get('q')` để lọc theo ô tìm chung (khung đã đặt `?q=` và gắn lại trang khi `q` đổi).
- `AdminToolsTab` vẫn import tĩnh `TeamPromptSyncTab` nên mã của công cụ này vẫn vào bundle production dù đã ẩn khỏi thanh bên.
- Chưa chụp ảnh trước/sau (Vite không chạy được trong VM); chưa thử trên trình duyệt thật.
- Các lớp `stitch-sidebar`, `stitch-header`… cũ trong `admin.css` không còn dùng ở khung, để nguyên phòng trang khác còn dùng.
