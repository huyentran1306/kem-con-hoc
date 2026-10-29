# Prompt cho Antigravity · Đợt 36: màn Báo cáo theo bản vẽ v5 (app + 1 dòng Worker)

**Cách dùng:** copy phần "Lời nhắn" gửi Antigravity. Làm **sau** đợt 35 (nếu 35 chưa commit thì commit 35 trước).

---

## Lời nhắn

Màn Báo cáo đã làm lại theo bản vẽ `kem-con-hoc-man-bao-cao-v5.html`, chưa commit.

### Đã sửa

**App (`kem-con-hoc`):**

- **Bỏ khối "An toàn AI 7 ngày"** khỏi Báo cáo. Hai số "lần con giảng lại" và "lỗi tự sửa được" đưa lên hàng 3 số liệu đầu trang, cạnh "buổi học".
- **Bố cục mới:**
  - đầu trang có tiêu đề, dòng "Bố kèm x buổi · Mẹ kèm y buổi" và 3 ô số;
  - thanh mục dính "Tổng quan · Kỹ năng · Lịch học · Cho bố mẹ", tự sáng theo vị trí cuộn;
  - thẻ "Cần chú ý tuần này", rồi thẻ "Con đã vững / Con hay vướng";
  - nút "Gửi báo cáo vào nhóm Zalo gia đình" dính đáy.
- **"Kỹ năng hay kẹt" đổi tên thành "Con hay kẹt ở bước nào?":**
  - chọn môn bằng danh sách thả xuống Toán / Tiếng Việt / Tiếng Anh, Tiếng Anh chưa có dữ liệu thì báo rõ;
  - "▲ 5 điểm" đổi thành mũi tên tăng/giảm kèm số, có chú thích ý nghĩa mũi tên;
  - dạng bảng gồm 3 cột: Kỹ năng · Tuần này · So tuần trước.
- **Lịch học tô đậm nhạt theo số phút học mỗi ngày:**
  - 4 mức: ≤10, ≤20, ≤30, >30 phút;
  - màu lấy theo bộ giao diện;
  - có thang "Ít … Nhiều";
  - bấm vào ngày thì hiện "Ngày d/m: học N phút";
  - dòng tổng "Tháng này: x tối · y phút · Chuỗi dài nhất z tối".
  - `useStudyTracker.js` có thêm số phút cho mỗi ngày.
- **Bảng gửi Zalo:**
  - Thời hạn link: người dùng tự nhập, có nút − và +, chỉ nhận số nguyên từ 1 đến 30 ngày. Nhập sai thì báo "Tối đa 30 ngày" hoặc "Tối thiểu 1 ngày" và khoá nút Gửi.
  - Link chỉ tạo lại sau khi ngừng gõ 0,6 giây, không gọi máy chủ theo từng phím.
  - Có ô "Gửi kèm lời nhắn riêng", đồng bộ với công tắc trong thẻ "Chỉ người lớn trong nhà thấy".
  - **Sửa thêm:**
    - Bảng gửi Zalo từng bị thanh tab che mất nút Gửi; giờ bảng nằm trên cùng.
    - Dùng thử không gọi máy chủ tạo link nữa (trước đây báo lỗi 401).
- Dùng thử có thêm vài buổi học mẫu với số phút khác nhau, để lịch học hiện rõ đậm nhạt.
- File mới:
  - `src/report.css`;
  - `src/reportLinkDays.js`;
  - `scripts/test-36-report.mjs` (đã thêm vào `npm test`).
- `scripts/test-dot18-chang-3.mjs` sửa theo bố cục mới: thẻ "Con tiến bộ thế nào" trước đây không được hiển thị nên đã bỏ, và không còn khối An toàn AI.

**Worker (`~/Coding/study-en/ai-gateway-worker/src/v1_routes.js`):**

- `POST /api/v1/reports/weekly/share` trước chỉ nhận 7 hoặc 14 ngày, giờ nhận số nguyên **1–30**; sai thì về 7.
- **Phải deploy Worker**, không thì link luôn chỉ có hạn 7 ngày.

### Việc cần làm

1. **Worker:**
   - Kiểm import: `node -e "import('./src/index.js').then(()=>console.log('ok'))"`.
   - Deploy, ghi tên bản.
2. **App:**

   ```bash
   npm run build
   node scripts/test-36-report.mjs   # 5/5
   npm test                          # chỉ cần không có test MỚI lỗi
   ```

3. **Kiểm trên bản preview** (gia đình thử nghiệm và Dùng thử, 390px và 1440px, ít nhất bộ Bạn Gấu và Khu Vườn Đêm):
   - Không còn "An toàn AI 7 ngày".
   - Bấm 4 mục trên thanh dính thì nhảy đúng chỗ, và mục đang xem tự sáng.
   - Danh sách môn có Tiếng Anh. Mũi tên tăng/giảm hiện đúng màu.
   - Lịch học có ô đậm nhạt khác nhau; bấm vào ngày thì ra số phút.
   - Gửi Zalo: nhập 45 thì báo "Tối đa 30 ngày" và nút Gửi bị khoá; nhập 21 rồi gửi → mở link chia sẻ, trang báo cáo công khai ghi hết hạn sau 21 ngày.
4. **Commit và push** cả hai repo. Không commit `.claude-xfer/`.
   - Commit app: `src/` (screens.jsx, ReportComponents.jsx, ZaloReportModal.jsx, useStudyTracker.js, trialData.js, App.jsx, report.css, reportLinkDays.js), `scripts/test-36-report.mjs`, `scripts/test-dot18-chang-3.mjs`, `package.json`, `dist/`, `bang-chung/prompt36/`, `PROMPT_ANTIGRAVITY_36.md`.
   - Commit Worker: `src/v1_routes.js`.
   - Gợi ý commit message: `feat(36): Báo cáo theo bản vẽ v5 (bỏ An toàn AI, "Con hay kẹt ở bước nào?", chọn môn thả xuống có Tiếng Anh, mũi tên tăng giảm, lịch đậm nhạt theo phút, hạn link tự nhập 1–30 ngày)`
5. Deploy.

### Báo lại

- Tên bản Worker và `index-*.js`.
- Kết quả test.
- Ảnh màn Báo cáo (bộ sáng và bộ tối) trên production.
