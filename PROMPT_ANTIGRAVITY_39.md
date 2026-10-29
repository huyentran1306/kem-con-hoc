# Prompt cho Antigravity · Đợt 39: tab Trò chơi (chỉ app)

**Cách dùng:** copy phần "Lời nhắn" gửi Antigravity. Làm sau đợt 38 (đã commit `5df0e15`). Đợt này không đụng tới Worker.

---

## Lời nhắn

Tab **Trò chơi** đã sửa theo 2 bản vẽ `kem-con-hoc-man-tro-choi-v5.html` và `kem-con-hoc-man-choi-voi-do-vat-v1.html`. Chỉ đổi giao diện, nội dung các trò chơi giữ nguyên. Thay đổi chưa commit.

### Đã sửa

**1. Bỏ phần không liên quan tới trò chơi:**

- Màn **Góc chơi chung** (`src/games/GocChoiChung.jsx`):
  - bỏ thẻ "Hôm nay ôn: phép trừ…" (kèm "⏱ còn x phút");
  - bỏ dòng dưới cùng "Câu hỏi bám bài vừa học. Hết 5 phút thì tự dừng.";
  - dòng chào chỉ còn "{Bố/Mẹ} và {con} chơi cùng.".
- **Rà soát phần tương tự:**
  - đã bỏ thẻ "AI ưu tiên ôn / Gấu sẽ gợi ý chỗ cần ôn" ở cuối khu "Chơi gì với đồ trong nhà?";
  - 3 trò Đấu trí, Leo cây, Thám tử không có câu kiểu này.
  - Giới hạn phút chơi mỗi ngày vẫn hoạt động: hết giờ thì vẫn hiện màn "Hôm nay chơi đủ rồi" như cũ.

**2. Sửa lỗi Đồng hồ Lego (`src/screens.jsx`, hàm `Game`):**

- Lỗi: thẻ "Đồng hồ Lego" (câu tiếng Anh hỏi giờ) hiện ở dưới **mọi** đồ vật.
- Đã sửa: thẻ này chỉ hiện khi chọn **Đồng hồ**.
- Thẻ **Đồng hồ chơi** (đếm ngược 10 phút) vẫn luôn hiện ở mọi đồ vật.

**3. Giao diện theo bản vẽ (màu theo bộ giao diện đang chọn):**

- **Góc chơi chung** (`src/games.css`, `src/games/toyIcons.jsx`):
  - dải đầu màn có chấm bi, tiêu đề 28px, linh vật của bộ giao diện nhún nhẹ;
  - 3 thẻ trò chơi to, có tranh vẽ riêng, nhãn (2 người / Cùng phe / Vận động) và nút Play tròn.
- **Khu "Chơi gì với đồ trong nhà?"** gom vào 1 thẻ:
  - có nút đọc to;
  - 2 nút "Bật máy ảnh" và "Chọn ảnh";
  - ô "Gõ tên đồ vật" kèm nút "Tìm trò";
  - lưới đồ vật 5 cột có **hình vẽ từng đồ vật** (trẻ chưa đọc giỏi vẫn chọn được).
  - Khung máy ảnh chỉ hiện khi đang dùng máy ảnh hoặc có ảnh.
- **Màn Chơi với đồ vật:**
  - đầu màn có nút quay lại tròn, tiêu đề, nút đọc to;
  - chip đồ vật có hình vẽ, đồ đang chọn tô nổi;
  - khung thẻ trò chơi bo tròn, viền dày (nội dung bên trong giữ nguyên).
  - **Đồng hồ chơi:**
    - số 56px;
    - còn ≤ 1 phút thì đổi màu;
    - nút Bắt đầu / Tạm dừng / **Tiếp tục** và Đặt lại.
- Mọi nút ≥ 44px.

**4. Tương phản chữ:**

- Đã đo tự động trên đủ 11 bộ giao diện.
- Ở các bộ tối (Khu Vườn Đêm, Cực Quang, Bảng Phấn), hộp "💡 Thử thách cho mẹ hỏi con" và các hộp gợi ý trong trò chơi trước chỉ đạt tương phản khoảng **1,3:1** (gần như không đọc được). Nguyên nhân là chữ nâu viết cứng nằm trên thẻ nền tối. Đã đổi các màu viết cứng đó sang biến màu của bộ giao diện. Chữ và số liệu trong trò chơi không đổi.

**5. Test:** `scripts/test-39-games.mjs` (6 kiểm tra, đã thêm vào `npm test`).

### Việc cần làm

1. Chạy kiểm tra:

   ```bash
   npm run build
   node scripts/test-39-games.mjs   # 6/6
   npm test                         # chỉ cần không có test MỚI lỗi so với trước đợt này
   ```

2. **Kiểm trên bản preview** (390px và 1440px; ít nhất bộ Bạn Gấu, Khu Vườn Đêm, Bảng Phấn):
   - Tab Trò chơi: không còn "Hôm nay ôn" và "Hết 5 phút thì tự dừng".
   - Bấm 3 thẻ trò chơi thì vào đúng trò.
   - Chọn lần lượt từng đồ vật:
     - chỉ **Đồng hồ** có thẻ "Đồng hồ Lego";
     - đồ vật nào cũng có "Đồng hồ chơi".
   - Đồng hồ chơi: Bắt đầu → Tạm dừng → Tiếp tục → Đặt lại.
   - Gõ "cái cốc" rồi bấm Tìm trò thì ra thẻ gợi ý. Bấm "Đúng rồi, chơi thôi" thì vào màn chơi.
   - Bộ tối: chữ trong hộp "Thử thách…" của trò Cây lược đọc rõ.
3. **Commit và push.** Không commit `.claude-xfer/`.
   - File cần commit:
     - `src/screens.jsx`;
     - `src/games/GocChoiChung.jsx`, `src/games/toyIcons.jsx`;
     - `src/games.css`;
     - `scripts/test-39-games.mjs`;
     - `package.json`;
     - `dist/`;
     - `bang-chung/prompt39/`;
     - `PROMPT_ANTIGRAVITY_39.md`.
   - Gợi ý commit message: `feat(39): tab Trò chơi theo bản vẽ (bỏ "Hôm nay ôn" và dòng tự dừng, Đồng hồ Lego chỉ ở đồ vật Đồng hồ, thẻ trò chơi có tranh, đồ vật có hình, đồng hồ chơi số to, sửa chữ khó đọc ở bộ tối)`
4. Deploy.

### Báo lại

- Tên file `index-*.js` sau khi build.
- Kết quả test.
- Ảnh tab Trò chơi và màn Chơi với đồ vật trên production: 1 bộ sáng và 1 bộ tối.
