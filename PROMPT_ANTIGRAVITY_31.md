# Prompt cho Antigravity · Đợt 31: Worker, build, commit và push

**Cách dùng:** copy phần "Lời nhắn" gửi Antigravity.

---

## Lời nhắn

Phần app của prompt 31 (Nghe con giảng lại, nhãn dạng bài) đã sửa xong trong `kem-con-hoc`, chưa commit. Xem `BAO_CAO_DOT_31.md`. Bạn làm theo thứ tự:

### 1. Worker (`~/Coding/study-en/ai-gateway-worker`)

1. **Đồng bộ bộ chặn lộ đáp án. Đây là việc quan trọng nhất, sửa gốc của "câu hỏi v3 nhạt".**
   - Chép phần sửa trong `kem-con-hoc/src/guard.js` (hàm `checkAnswerLeak`, đoạn có chú thích "Prompt 31") sang bản `guard.js` của Worker.
   - Nội dung sửa: biến `earlierResults`, kết quả trung gian của bậc trước được phép nhắc ở bậc sau, và điều kiện prompt gồm cả `p3_explain_v3`, `p3_fix_steps_v3`.
   - Có thể có script cũ `kem-con-hoc/scripts/update-worker-*.py` làm việc này.
   - Sau khi deploy, chạy lại `node scripts/compare-28-v2-v3.mjs > bang-chung/prompt28-30/so-sanh-v2-v3.md`. Không bậc nào còn là câu "Để tìm kết quả bước này…" hoặc "Con đọc lại đề xem bài toán cho biết gì và hỏi gì nào?", trừ khi thật sự lộ đáp số cuối.
   - Xoá lesson_cache v3 tạo trước lúc deploy bản này, vì các bài đó đã bị thay câu chung.
2. **Soạn bài theo "Cách cô dạy"** (bài cô giao, `ai_lesson_json`): prompt phải trả `ky_nang` cho từng bậc như bài thường (doc_hieu_de, chon_phep_tinh, tinh_toan, …). Không tự điền `tinh_toan` khi thiếu. Thiếu thì để trống, app sẽ không hiện nhãn.
3. **Kiểm 3 route Nghe con trên bản thật:**
   - `POST /api/v1/ai/teach-back/transcribe` (form-data `audio`, trả `transcript`);
   - `POST /api/v1/ai/teach-back/grade` (body có `round`, `xungHo`; trả `teach_back_id`, `tieu_chi[ma, dat, trich]`, `muc_de_xuat`, `cau_hoi_them` khi thiếu `vi_sao` ở vòng 1);
   - `POST /api/v1/ai/teach-back/:id/confirm` (body `finalLevel`: `self` | `hint` | `guided`).

   Route nào chưa có hoặc trả sai dạng thì sửa. App đã nối đủ cả ba.

Deploy Worker, ghi lại tên bản mới.

### 2. App

```bash
npm run build
npm test                                          # đã thêm test-31-routes.mjs ở đầu, test-28-29-30 ở cuối
node scripts/test-28-29-30.mjs --bundle
```

Có test **mới** lỗi thì sửa rồi báo lại. Ghi tên `dist/assets/index-*.js`.

**Tự kiểm trên bản thật**, dùng gia đình thử nghiệm, không đụng lớp 3A thật:

- Học xong 1 bài → bấm "Nghe con ›" → gõ hoặc nói lời giảng thiếu "vì sao" → có vòng 2 → bấm chốt mức.
- Báo cáo tăng 1 "lần … giảng lại". Tối đa 3 lần gọi AI.

### 3. Commit và push

- Không commit `.claude-xfer/`.
- Commit:
  - `src/` (đã sửa);
  - `scripts/test-31-routes.mjs`, `scripts/test-28-29-30.mjs`;
  - `package.json`, `dist/`;
  - `bang-chung/prompt31/`, `BAO_CAO_DOT_31.md`, `PROMPT_ANTIGRAVITY_31.md`.
- Gợi ý commit message:
  - `feat(31): mở Nghe con giảng lại (bảng trượt, vòng 2, chốt mức, dữ liệu mẫu, gõ chữ khi không có mic), test openSheet/go không trỏ vào chỗ trống`
  - `fix(31): nhãn dạng bài Dùng thử theo đề đang đọc, không mặc định "Tính toán" cho bài cô giao, bộ chặn không thay câu nhắc kết quả bậc trước`
- Commit Worker trong repo Worker. Push cả hai.

### Báo lại

- Tên bản Worker và `index-*.js`.
- Kết quả `npm test`.
- File so sánh v2/v3 mới.
