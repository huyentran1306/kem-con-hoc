# Prompt cho Antigravity · Đợt 42: trang quản trị (app + Worker)

**Cách dùng:** copy phần "Lời nhắn" gửi Antigravity. Làm sau đợt 41 (đã commit `1e2f692`).

---

## Lời nhắn

Có 2 sửa ở trang quản trị, chưa commit.

### Đã sửa

**1. Tổng quan: ô "Học sinh" luôn hiện "Chưa có dữ liệu"** (API trả `totalStudents: null`).

- **Nguyên nhân:** Worker đếm học sinh từ bảng `children`, nhưng hồ sơ con của app gia đình nằm trong state đồng bộ (`_kv_store`, key `fam:<id>:state`). Bảng `children` trống nên ra `null`.
- **Worker** `src/dot15_monitor.js` (`/api/v1/admin/overview-stats`):
  - đếm thêm số con trong state của các gia đình còn tồn tại; value có 2 dạng, `{ children: [...] }` hoặc bản cũ `{ ts, state: { children: [...] } }`;
  - `totalStudents` lấy số lớn nhất trong 3 nguồn: bảng `children`, state, số con đã có buổi học trong kỳ.
  - Câu SQL đã thử với SQLite (có JSON1). Bỏ qua value không phải JSON và key của gia đình đã xoá.
- **App** `src/AdminOverviewTab.jsx`: nếu máy chủ vẫn trả `null` thì ô Học sinh hiện số con đã có buổi học (`activeStudents`) thay vì để trống.

**2. An toàn AI → "Nhật ký bộ chặn": tester đọc không hiểu, tưởng là dữ liệu thử.** Sửa ở `src/AdminSafetyTab.jsx`.

- Thêm thẻ **"Bảng này là gì?"** phía trên bảng:
  - nói rõ đây là **dữ liệu thật**;
  - mỗi dòng là một lần máy chủ phát hiện câu AI viết có vấn đề và **tự sửa trước khi tới phụ huynh và con**;
  - kèm giải thích từng loại xử lý (Soạn lại bậc chung chung, Sửa riêng bậc, Sửa phép tính, Thay câu an toàn, Chặn xin đáp án, Lọt tới con).
- **Đổi tên cột sang tiếng Việt dễ hiểu.** Rê chuột vào ô vẫn xem được mã gốc.

  | Cột cũ | Cột mới | Ví dụ |
  |---|---|---|
  | Prompt | Chức năng | `p3_explain_v3` → "Soạn bài" |
  | Trường | Chỗ bị sửa | `cac_bac[].cau_hoi` → "Một bậc · câu hỏi"; `cac_bac[].goi_y.muc_2_hinh_ve` → "Một bậc · gợi ý 2 (hình vẽ)" |
  | Câu AI sinh (bị chặn) | Máy chủ phát hiện | |
  | Câu thay thế | Đã xử lý | |
  | Kết quả | Loại xử lý | |

- Ô **"Lượt bộ chặn can thiệp"** đổi thành **"Lần máy chủ tự sửa"**, dòng phụ "trước khi tới con, 7 ngày (… thay câu · … soạn lại)".

**3. Test:** `scripts/test-42.mjs` (3 kiểm tra, đã thêm vào `npm test`).

### Việc cần làm

1. **Worker** (`~/Coding/study-en/ai-gateway-worker`):
   - Kiểm import: `node -e "import('./src/dot15_monitor.js').then(()=>console.log('ok'))"`.
   - Deploy, ghi tên bản.
   - Mở admin → Tổng quan: ô Học sinh có số, phải ≥ số "bạn có buổi học".
2. **App:**

   ```bash
   npm run build
   node scripts/test-42.mjs   # 3/3
   npm test                   # chỉ cần không có test MỚI lỗi
   ```

   Mở admin → An toàn AI: có thẻ "Bảng này là gì?", các cột ghi bằng tiếng Việt.
3. **Commit và push** cả hai repo. Không commit `.claude-xfer/` và `kem-con-hoc-full-*.zip`.
   - App: `src/AdminSafetyTab.jsx`, `src/AdminOverviewTab.jsx`, `scripts/test-42.mjs`, `package.json`, `dist/`, `PROMPT_ANTIGRAVITY_42.md`.
   - Worker: `src/dot15_monitor.js`.
   - Gợi ý commit message: `fix(42): admin Tổng quan đếm học sinh từ hồ sơ con trong state, nhật ký bộ chặn có giải thích và tên cột tiếng Việt cho tester`
4. Deploy app.

### Báo lại

- Tên bản Worker và `index-*.js`.
- Số học sinh hiện ở Tổng quan.
- Kết quả test.
