# Prompt cho Antigravity · Đợt 34: build, kiểm, commit và push (chỉ app)

**Cách dùng:** copy phần "Lời nhắn" gửi Antigravity.

---

## Lời nhắn

Đợt 34 đã sửa xong trong `kem-con-hoc`, chưa commit. Xem `BAO_CAO_DOT_34.md`. Đợt này **không đụng Worker**, không cần deploy Worker.

Nội dung gồm:

- trang chủ: nút "Phụ huynh nhập đề", bỏ 2 nút Gõ đề và Đọc đề;
- đề mẫu Toán quay về đề hộp bút;
- ẩn AI chấm vở (cờ `src/features.js`);
- trả lại nút nổi {Mẹ/Bố} bình tĩnh;
- màn Hỏi con từng bước làm lại theo bản vẽ v2 (`src/HoiConTungBuoc.jsx`, `src/hoiCon.css`).

### 1. Build và test

```bash
npm run build
node scripts/test-34.mjs                  # 5/5
node scripts/test-28-29-30.mjs --bundle   # 26/26
npm test
```

`npm test` có sẵn nhiều test cũ lỗi từ trước. Có test **mới** lỗi vì đợt 34 thì sửa rồi báo lại. Ghi tên `dist/assets/index-*.js`.

### 2. Tự kiểm trên bản preview, rồi production

Dùng gia đình thử nghiệm và Dùng thử, ở 390px và 1440px.

1. **Trang chủ:** nút chính là "Phụ huynh nhập đề"; không còn nút "Gõ đề bài", "Đọc đề cho …"; không còn thẻ "AI Chấm vở".
   - Thử ít nhất 3 bộ: Bạn Gấu, Khu Vườn Đêm, Đêm Tuyết.
2. **Nhập đề:** bấm "Phụ huynh nhập đề" → trang "Phụ huynh nhập đề" có Gõ đề và Đọc đề → Gõ đề → chip "Toán" điền đề "Mẹ mua 2 hộp bút, mỗi hộp có 10 cây. Mẹ cho Lan 4 cây…".
3. **Nút "{Mẹ/Bố} bình tĩnh":**
   - Nút nổi góc dưới có chữ, cuộn thì thu nhỏ, ở màn học chỉ còn hình tròn.
   - Không còn nút 😮‍💨 trên thanh trên.
   - Bấm vào mở đúng bảng bình tĩnh cũ.
4. **Hỏi con từng bước:**
   - Chỉ có một thanh "Bậc x/n".
   - Bấm "Con còn bí" hai lần → mở Gợi ý 1 rồi Gợi ý 2.
   - Giữ "Đáp án tham khảo" 1,5 giây → đáp án hiện rõ, thả ra thì mờ lại.
   - "Con làm được" qua hết các bậc → "Hoàn thành bài → Tặng huy hiệu" → Xong bài.
   - Xong bài không còn dòng "Chấm vở ›".
   - "Hỏi Gấu" mở Hỏi thêm AI; "Xem đề" mở bảng đề.
   - Chụp màn này ở bộ sáng và bộ tối.
5. Console không có `ReferenceError` hay `TypeError`.

### 3. Commit và push

- **Không commit** `.claude-xfer/`.
- **Commit:**
  - `src/`, gồm cả 3 file mới `HoiConTungBuoc.jsx`, `hoiCon.css`, `features.js`;
  - `scripts/test-34.mjs`, `scripts/test-chang-1.mjs`, `scripts/verify-prompt33a-e2e.mjs`;
  - `package.json`, `dist/`;
  - `bang-chung/prompt34/`, `BAO_CAO_DOT_34.md`, `PROMPT_ANTIGRAVITY_34.md`.
- **Gợi ý commit message:** `feat(34): trang chủ "Phụ huynh nhập đề", đề mẫu hộp bút, ẩn AI chấm vở, nút nổi {Mẹ/Bố} bình tĩnh, màn Hỏi con từng bước v2 theo theme`
- Push, deploy preview, kiểm mục 2, rồi deploy production.

### Báo lại

- Tên `index-*.js`, link preview.
- Kết quả test.
- Ảnh trang chủ và màn Hỏi con trên production (bộ sáng và bộ tối).
