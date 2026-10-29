# Prompt cho Antigravity · Đợt 40: 3 lỗi nhỏ từ góp ý (chỉ app)

**Cách dùng:** copy phần "Lời nhắn" gửi Antigravity. Làm sau đợt 39 (đã commit `70b17cb`). Đợt này không đụng tới Worker.

---

## Lời nhắn

Có 3 sửa nhỏ theo góp ý, chưa commit.

### Đã sửa

1. **Màn soạn bài (sau "Gấu đọc đề này → soạn bài"): bỏ thẻ "✓ Đã kiểm lại 3 phép tính / Đóng ▲" và danh sách "20 - 4 = 16 ✓ Đúng".**
   - Vị trí: `src/screens.jsx`, hàm `ExplainView`.
   - Danh sách này còn bị lặp cùng 1 phép tính 3 lần.
   - App vẫn tự kiểm phép tính ở phía sau (`validateAllLessonMath`, `math_verified` của Worker không đổi), chỉ không hiện ra cho bố mẹ nữa.
2. **Trò "Bấm đúng thời gian" (đồ vật Đồng hồ): người chơi là phụ huynh đang cầm máy và con.**
   - Ví dụ: "Mẹ và Bé Na luân phiên", kết quả "Mẹ: lệch…, Bé Na: lệch…", "🎉 Bé Na thắng!".
   - Trước đây ghi cứng "Mẹ" rồi "Bố".
   - Vị trí: `src/screens.jsx`, hàm `ClockGame`.
   - Đã rà các trò đồ vật khác, không còn chỗ nào ghi cứng kiểu này.
3. **Ảnh báo cáo gửi Zalo bị lỗi font** (dấu tiếng Việt lệch ở dòng "Tuần này của …"). Vị trí: `src/ZaloReportModal.jsx`.
   - Nguyên nhân: ảnh vẽ bằng canvas với font `sans-serif` nét 900. Trên Windows, trình duyệt thay bằng font thiếu dấu tiếng Việt.
   - Đã sửa:
     - vẽ bằng **Nunito** (app đã tải sẵn, có đủ dấu), dự phòng Segoe UI / Roboto / Arial;
     - chờ tải font trước khi vẽ, tối đa 1,5 giây;
     - các dòng dài được giới hạn bề ngang, không tràn ra ngoài khung ảnh.
4. **Test:** `scripts/test-40.mjs` (3 kiểm tra, đã thêm vào `npm test`).

### Việc cần làm

1. Chạy kiểm tra:

   ```bash
   npm run build
   node scripts/test-40.mjs   # 3/3
   npm test                   # chỉ cần không có test MỚI lỗi
   ```

2. **Kiểm trên bản preview:**
   - Soạn 1 bài thì màn "Gấu đã soạn N bậc" không còn thẻ "Đã kiểm lại … phép tính".
   - Trò chơi → Đồng hồ: chơi 4 lượt thì thấy phụ huynh và tên con luân phiên.
   - **Kiểm trên Chrome Windows:** Báo cáo → "Gửi báo cáo vào nhóm Zalo gia đình", ảnh xem trước ghi "Tuần này của …" đúng dấu.
3. **Commit và push.** Không commit `.claude-xfer/` và `kem-con-hoc-full-*.zip`.
   - File cần commit:
     - `src/screens.jsx`, `src/ZaloReportModal.jsx`;
     - `scripts/test-40.mjs`;
     - `package.json`;
     - `dist/`;
     - `bang-chung/prompt40/`;
     - `PROMPT_ANTIGRAVITY_40.md`.
   - Gợi ý commit message: `fix(40): bỏ thẻ "Đã kiểm lại N phép tính" ở màn soạn bài, trò Bấm đúng thời gian là phụ huynh và con, ảnh báo cáo Zalo dùng font Nunito đủ dấu tiếng Việt`
4. Deploy.

### Báo lại

- Tên file `index-*.js` sau khi build.
- Kết quả test.
- Ảnh báo cáo Zalo chụp trên Windows.
