# Prompt 07 · Hoàn thiện Trang Admin: Khắc phục lỗi rỗng dữ liệu, Modal Duyệt Giáo Viên & Ép Giao Diện Toàn Hệ Thống

**Cách dùng:** Copy phần PROMPT này gửi cho AI lập trình hoặc chạy trực tiếp trên VideFlow / Cursor / Claude / Gemini để xây dựng và cập nhật chính xác hệ thống Admin Portal và đồng bộ giao diện toàn ứng dụng.

---

## 1. Bối cảnh & Các vấn đề cần giải quyết
1. **Lỗi 0 dữ liệu (Empty data) trên các Tab Admin:**
   - Khi token phiên làm việc hết hạn hoặc không khớp trong `localStorage`, các API `/api/v1/admin/families`, `/api/v1/admin/teachers`, `/api/v1/admin/nps` trả về `401 Unauthorized` khiến các bảng hiển thị 0 bản ghi.
   - **Giải pháp:** Xây dựng `adminFetch` tập trung tại `src/adminApi.js`, tự động chèn header `Authorization: Bearer <token>` và tự động fallback sang `master secret` (`kem-con-hoc-admin-secret-2026`) khi gặp mã 401. Đảm bảo toàn bộ 7 tab quản trị luôn tải được dữ liệu thật từ Cloudflare D1.

2. **Lỗi ngày tháng (Invalid Date / NaN) trên trình duyệt Safari:**
   - D1 SQLite trả về chuỗi ngày dạng `YYYY-MM-DD HH:MM:SS` (thiếu ký tự `T`). Trình duyệt WebKit/Safari báo `Invalid Date`.
   - **Giải pháp:** Chuẩn hoá toàn bộ qua hàm `(dateStr || '').replace(' ', 'T')` trước khi gọi `new Date()`.

3. **Thay thế Popup mặc định `window.confirm` bằng Modal Stitch:**
   - Tránh dùng popup native thô của trình duyệt (`window.confirm`) khi duyệt, từ chối hoặc tạm khoá giáo viên.
   - **Giải pháp:** Sử dụng `.stitch-modal-overlay` với hiệu ứng mờ kính `backdrop-filter: blur(6px)` và `.stitch-modal-card` bo góc 18px.
     - **Modal Phê duyệt:** Tóm tắt hồ sơ thầy/cô (Họ tên, email, trường, khối lớp, ngày đăng ký), hướng dẫn quyền hạn và nút "✅ Xác nhận phê duyệt".
     - **Modal Từ chối:** Kèm các Chip lý do từ chối nhanh (1 chạm) và textarea giải thích chi tiết.
     - **Modal Tạm khoá / Mở khoá:** Cảnh báo rõ quyền tạo lớp và giao bài.

4. **Tính năng Ép Giao Diện Toàn Hệ Thống (Force UI cho tất cả người dùng):**
   - Trước đây khi phụ huynh đã từng mở bảng chọn giao diện, cờ `user-custom-theme` được lưu trong thiết bị nên Admin đổi giao diện mặc định thì người dùng cũ không đổi theo.
   - **Giải pháp:**
     - Tại `AdminThemesSection.jsx`: Thêm Switch/Checkbox **"Bắt buộc áp dụng cho TẤT CẢ người dùng (Force UI)"** (`forceAll: true/false`, kèm `forceVersion: Date.now()`).
     - Lưu cấu hình vào Cloudflare D1 KV key `app_config:themes`.
     - Tại `App.jsx`: Khi nhận cấu hình công khai, nếu `forceAll: true` và `forceVersion > lastAppliedForce`, tự động xoá cờ `user-custom-theme`, ghi đè `S.theme` sang theme mặc định của Admin và lưu `last-applied-force-theme`. Nếu `forceAll: false`, tôn trọng sở thích của người dùng cũ.

5. **SQL Studio & Quản Trị Hệ Thống:**
   - Tích hợp D1 Database SQL Studio ở chế độ **Chỉ Đọc (Read-only)**, chặn câu lệnh ghi `UPDATE/DELETE/DROP`.
   - Giao diện Dark Code Editor (`#0F172A`, font SFMono/Monospace), đo lường thời gian phản hồi D1 (ms) và hỗ trợ xem kết quả dạng Bảng / JSON.
   - Hỗ trợ mã PIN bảo vệ mặc định `1102` (đã lưu băm sha256 trong bảng `admin_users`).

---

## 2. Chi tiết File Cần Cập Nhật

### 2.1. Backend Worker Gateway (`study-en/ai-gateway-worker`)
- **`src/v1_routes.js`**:
  - Trong `authenticateAdmin(request, env)`: Hỗ trợ master key fallback `kem-con-hoc-admin-secret-2026`, trả về `{ member_id: "adm_superadmin_01", role: "superadmin", email: "admin@kemconhoc.vn", token_hash: "master_secret_session_token" }`.
- **`src/admin_stitch_routes.js`**:
  - Trong endpoint `POST /api/v1/admin/auth/unlock`: Cho phép mở khoá nếu `adminSession` hợp lệ mà không đòi hỏi phiên D1 truyền thống khi dùng master key.

### 2.2. Frontend Client (`src/`)
- **`src/adminApi.js`**:
  - Xuất hàm `adminFetch(endpointOrUrl, options)`: Tự động lấy token từ `localStorage`, chèn header `Authorization`, tự động thử lại với master secret khi gặp status 401.
- **`src/admin.css`**:
  - Chuẩn hoá biến font: `--adm-font-head: 'Plus Jakarta Sans', sans-serif;` và `--adm-font-body: 'Plus Jakarta Sans', sans-serif;`.
  - Bổ sung các class: `.stitch-modal-overlay`, `.stitch-modal-card`, `.stitch-subtabs-nav`, `.stitch-subtab-btn`, `.stitch-segmented-group`, `.stitch-segmented-btn`, `.stitch-range-slider`, `.stitch-quick-query-btn`.
- **`src/AdminTeachersTab.jsx`**:
  - Chuyển toàn bộ gọi API sang `adminFetch`.
  - Thay thế `window.confirm` bằng 3 Modal Dialog: Duyệt, Từ chối (kèm chip lý do) và Tạm khoá.
  - Sửa lỗi định dạng ngày với `(tc.created_at || '').replace(' ', 'T')`.
- **`src/AdminThemesSection.jsx`**:
  - Bổ sung banner & checkbox `Bắt buộc áp dụng cho TẤT CẢ người dùng (Force UI)`.
  - Tự động đồng bộ `forceAll` và `forceVersion` lên D1 KV `app_config:themes`.
- **`src/App.jsx`**:
  - Khi gọi `loadPublicConfig`, kiểm tra `cfg.themesConfig.forceAll`: nếu bật, xoá `user-custom-theme` và ép toàn bộ app sang `defaultTheme`.
- **`src/AdminToolsTab.jsx`**:
  - Tích hợp SQL Studio bảo mật kèm query mẫu và thời gian thực thi ms.
- **`src/AdminConfigTab.jsx`**:
  - Dùng `.stitch-segmented-group` thay cho các nút giãn 100% cũ.

---

## 3. Lệnh Build & Triển Khai
```bash
# Kiểm thử toàn diện
npm test

# Build production bundle
npm run build

# Deploy Cloudflare Pages
npx wrangler pages deploy dist --project-name=kem-con-hoc

# Deploy Worker Gateway
cd ai-gateway-worker && npx wrangler deploy
```
