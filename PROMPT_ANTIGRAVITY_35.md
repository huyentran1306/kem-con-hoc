# Prompt cho Antigravity · Đợt 35: sửa lỗi "Có lỗi nhỏ khi mở cửa sổ này" (Thành viên gia đình)

**Cách dùng:** copy phần "Lời nhắn" gửi Antigravity. Chỉ sửa app, không đụng Worker.

---

## Lời nhắn

**Lỗi:** Con tôi › Thành viên gia đình báo "Có lỗi nhỏ khi mở cửa sổ này". Bấm "Thử lại" vẫn lỗi.

**Nguyên nhân (đã kiểm trên production):**

- Tab đang mở từ trước lần deploy vẫn chạy bản index cũ.
- Bảng Thành viên gia đình được tải muộn (`lazy`), nên trình duyệt xin file chunk cũ, ví dụ `FamilyMembersSheet-z9dHfD2C.js`.
- Bản deploy mới đã xoá file đó. Cloudflare Pages trả về `index.html` (text/html, mã 200), nên `import()` hỏng và ErrorBoundary hiện lỗi.
- "Thử lại" không khỏi vì React giữ lại lỗi tải cũ.
- Các cửa sổ tải muộn khác cũng bị y như vậy: Lớp học, Đăng nhập, Admin, Cổng cô, link báo cáo.

**Đã sửa, chưa commit:**

- `src/lazyReload.js` (mới):
  - `lazyWithReload()` thay cho `lazy()`. Gặp lỗi tải chunk thì tự tải lại trang một lần, có chặn lặp 30 giây, để lấy bản mới.
  - Bắt thêm sự kiện `vite:preloadError`.
- `src/App.jsx`, `src/AdminToolsTab.jsx`: mọi `lazy(() => import(...))` đổi sang `lazyWithReload`.
- `src/main.jsx`: gọi `installPreloadErrorReload()`.
- `src/ErrorBoundary.jsx`: nếu là lỗi tải chunk thì tự tải lại trang. Nút "Thử lại" tải lại trang thay vì chỉ vẽ lại.
- `public/_headers`: `/` và `/index.html` đặt `Cache-Control: no-cache`, để trình duyệt luôn lấy index mới.
- `scripts/test-35-chunk.mjs` (mới), đã thêm vào cuối `npm test`.
- **Đã kiểm bằng Playwright** (giả lập file chunk cũ trả về text/html như production):
  - Bản cũ: hiện "Có lỗi nhỏ", bấm lại vẫn lỗi.
  - Bản sửa: trang tự tải lại một lần, rồi mở được bảng Thành viên gia đình.

### Việc cần làm

1. Build và test:

   ```bash
   npm run build
   node scripts/test-35-chunk.mjs
   npm test
   ```

   `npm test` có sẵn test cũ lỗi từ trước; chỉ cần không có test **mới** lỗi.
2. Commit và push. Không commit `.claude-xfer/`.
   - Commit: `src/lazyReload.js`, `src/App.jsx`, `src/AdminToolsTab.jsx`, `src/main.jsx`, `src/ErrorBoundary.jsx`, `public/_headers`, `scripts/test-35-chunk.mjs`, `package.json`, `dist/`, `PROMPT_ANTIGRAVITY_35.md`.
   - Gợi ý commit message: `fix(35): cửa sổ tải muộn (Thành viên gia đình…) tự tải lại bản mới khi chunk cũ đã bị xoá sau deploy`
3. Deploy, rồi kiểm theo đúng tình huống lỗi:
   1. Mở app (đăng nhập gia đình thử nghiệm), **để nguyên tab**.
   2. Deploy một bản bất kỳ, hoặc chính bản này.
   3. Quay lại tab cũ, không tải lại trang, bấm Con tôi › Thành viên gia đình.
   4. Trang phải tự tải lại một lần rồi mở được. Không còn ô "Có lỗi nhỏ".
4. Kiểm header: `curl -sI https://kem-con-hoc-5xf.pages.dev/` phải có `cache-control: no-cache`.

### Báo lại

- Tên `index-*.js`.
- Kết quả test.
- Kết quả bước kiểm "tab cũ sau deploy".
