# Prompt cho Antigravity · Đợt 38: màn Con tôi theo bản vẽ v3 (chỉ app)

**Cách dùng:** copy phần "Lời nhắn" gửi Antigravity. Làm sau đợt 37 (đã commit `bde4247`). Đợt này không đụng tới Worker.

---

## Lời nhắn

Màn **Con tôi** đã làm lại theo bản vẽ `kem-con-hoc-man-con-toi-v3.html`, theo các nguyên tắc UI/UX: thao tác một tay, gọn thông tin, phản hồi tức thì, cho phép hoàn tác, vùng chạm đủ lớn, tương phản ≥ 4,5:1. Thay đổi chưa commit.

### Đã sửa

**1. Màn Con tôi (`src/ProfileScreen.jsx`, `src/profile.css`):**

- **Nút "Thêm con" nổi bật:**
  - nút lớn màu chính, có dấu + tròn;
  - dính đáy ngay trên thanh tab, trong vùng ngón cái;
  - đủ 4 bé thì nút ghi "Đã đủ 4 bé" và báo lý do khi bấm.
- **Phần đầu màn:**
  - hàng chọn bé, bé đang chọn có dấu ✓ (không chỉ dựa vào màu);
  - thẻ hồ sơ ghi "Tên · Lớp", bộ sách và các môn.
- **"Sửa hồ sơ" đổi thành nút tròn icon bút chì 48px**, có nhãn cho trình đọc màn hình.
- **Danh sách gọn theo nhóm:**
  - Sổ sticker, Lớp học;
  - Kèm con: lời khuyên, nhắc nghỉ, lịch chia ca, thời gian chơi;
  - Cả nhà: thành viên, giao diện;
  - Khác: Ứng dụng, Riêng tư và an toàn.
  - Nhóm "Ứng dụng" và "Riêng tư và an toàn" thu gọn sẵn, bấm để mở.
- **"Những gì app nhớ về con":**
  - đổi chữ "Gấu" thành "app", vì mỗi bộ giao diện có linh vật khác nhau;
  - bấm ✕ ở từng mục thì **luôn hiện hộp xác nhận** "Xoá ghi nhớ này?", ghi rõ là không khôi phục được;
  - hộp xác nhận đặt sẵn tiêu điểm ở nút "Giữ lại", nên lỡ bấm Enter cũng không xoá;
  - "Xoá hết" cũng hỏi lại;
  - khi tắt ghi nhớ thì hiện "Đã tắt. App không ghi nhớ thêm gì về …".
- **Đăng xuất hỏi lại** trước khi thoát.
- **Vùng chạm ≥ 48px** cho mọi công tắc, ô chọn, nút ✕. Có viền tiêu điểm khi dùng bàn phím. Chạm thì máy rung nhẹ nếu có hỗ trợ.
- **Màu đọc từ biến của bộ giao diện:**
  - chữ phụ được kéo đậm về phía màu chữ chính;
  - đã đo tương phản tự động trên đủ 11 bộ, tất cả chữ ≥ 4,5:1;
  - bộ Cực Quang làm thẻ tối hơn cho chữ rõ.
- **Nút "Bố/Mẹ bình tĩnh"** ở màn này thu thành nút tròn, nằm cùng hàng với nút Thêm con, không che danh sách.
- **Màn rộng (≥1024px):** nội dung gói trong cột 720px ở giữa.

**2. Thêm con theo 3 bước (`src/ChildSheets.jsx`):**

- **Các bước:** 1) Tên + hình đại diện → 2) Lớp + bộ sách → 3) Môn cần kèm + xem lại. Có thanh tiến độ "Bước n/3".
- **Báo lỗi ngay tại ô:** tên trống, ít hơn 2 ký tự, trùng tên bé đã có, chưa chọn lớp hoặc bộ sách, chưa chọn môn nào.
- **Bấm "Thêm bé"** thì nút chuyển "Đang thêm…" kèm vòng quay và chặn bấm lặp.
- **Thêm xong** có thông báo "✓ Đã thêm bé …" kèm nút **Hoàn tác** (6 giây).
- **Đang nhập dở mà đóng** (nút ✕, bấm nền hoặc phím Esc) thì hỏi "Bỏ thông tin đang nhập?".
- Bé mới lưu thêm trường `subjects`. Bé cũ chưa có trường này thì hiện đủ 3 môn như trước.

**3. Sửa hồ sơ con (`src/ChildSheets.jsx`):**

- Cùng kiểu form với Thêm con, có thêm phần Môn cần kèm.
- Báo lỗi tên ngay khi gõ.
- Nút "Lưu thay đổi" chỉ bật khi có thay đổi. Lưu xong có **Hoàn tác**.
- Đóng khi chưa lưu thì hỏi lại.
- Giữ công tắc ghi nhớ (`toggle-bear-memory`).

**4. Dùng chung cho toàn app:**

- **Toast có nút "Hoàn tác":** `toast(msg, { undo })` trong `src/utils.js`, hiện ở `src/App.jsx`, kiểu nút ở `src/styles.css`.
- **Hàm `buzz()`** (rung nhẹ) trong `src/utils.js`.
- **Hộp xác nhận nguy hiểm** (`appConfirm(..., { danger: true })`) đặt tiêu điểm vào nút an toàn. Nút trong hộp thoại cao 48px. Sửa ở `src/dialog.jsx`.

**5. Test:**

- `scripts/test-38-profile.mjs` (8 kiểm tra, đã thêm vào `npm test`).
- `scripts/test-31-routes.mjs` chấp nhận màn được export lại (`export { Profile } from './ProfileScreen'`).

**Chưa làm (không ưu tiên, theo ghi chú):** giao diện riêng cho từng bé.

### Việc cần làm

1. Chạy kiểm tra:

   ```bash
   npm run build
   node scripts/test-38-profile.mjs   # 8/8
   node scripts/test-31-routes.mjs    # đạt
   npm test                           # chỉ cần không có test MỚI lỗi so với trước đợt này
   ```

2. **Kiểm trên bản preview** (390px, 320px và 1440px; cả Dùng thử và gia đình thật; ít nhất bộ Bạn Gấu, Khu Vườn Đêm, Cực Quang):
   - Nút Thêm con nằm ngay trên thanh tab. Nút bình tĩnh không che nội dung.
   - Bấm bút chì thì mở Sửa hồ sơ. Đổi tên rồi lưu, bấm Hoàn tác thì về tên cũ.
   - Thêm con:
     - bấm Tiếp tục khi chưa nhập thì báo lỗi ngay dưới ô;
     - nhập trùng tên thì báo trùng;
     - bước 2 chưa chọn thì báo lỗi;
     - thêm xong bấm Hoàn tác thì bé vừa thêm biến mất.
   - Đang nhập dở bấm ✕ thì có hỏi lại.
   - Mở "Riêng tư và an toàn", bấm ✕ một ghi nhớ thì có hỏi lại. Bấm "Giữ lại" thì mục vẫn còn.
   - Đăng xuất có hỏi lại.
3. **Commit và push.** Không commit `.claude-xfer/`.
   - File cần commit:
     - `src/ProfileScreen.jsx`, `src/ChildSheets.jsx`, `src/profile.css`;
     - `src/screens.jsx`, `src/App.jsx`, `src/utils.js`, `src/dialog.jsx`, `src/styles.css`;
     - `scripts/test-38-profile.mjs`, `scripts/test-31-routes.mjs`;
     - `package.json`;
     - `dist/`;
     - `bang-chung/prompt38/`;
     - `PROMPT_ANTIGRAVITY_38.md`.
   - Gợi ý commit message: `feat(38): màn Con tôi theo bản vẽ v3 (nút Thêm con nổi bật vùng ngón cái, thêm con 3 bước báo lỗi tức thì, hoàn tác, xác nhận khi xoá ghi nhớ và đăng xuất, nút bút chì sửa hồ sơ, vùng chạm 48px, tương phản ≥ 4,5:1 cả 11 bộ)`
4. Deploy.

### Báo lại

- Tên file `index-*.js` sau khi build.
- Kết quả test.
- Ảnh màn Con tôi trên production: 1 bộ sáng và 1 bộ tối.
