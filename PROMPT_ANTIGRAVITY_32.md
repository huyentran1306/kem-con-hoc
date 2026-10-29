# Prompt cho Antigravity · Đợt 32: deploy Worker, build, commit và push

**Cách dùng:** copy phần "Lời nhắn" gửi Antigravity.

---

## Lời nhắn

Đợt 32 (sửa gấp trước chung kết) đã sửa xong code trong cả `kem-con-hoc` và `~/Coding/study-en/ai-gateway-worker`, chưa commit. Xem `kem-con-hoc/BAO_CAO_DOT_32.md`. Bạn làm theo thứ tự:

### 1. Worker (`~/Coding/study-en/ai-gateway-worker`)

Thư mục `_backup_truoc_dot32_2026-10-29/` là bản sao lưu, **không commit, không deploy**.

1. **File mới phải được deploy cùng:**
   - `src/chat_safety.js`
   - `src/lesson_fix.js`
   - `src/step_quality.js`
   - `src/micro_step_local.js`

   Chạy `node -e "import('./src/index.js').then(()=>console.log('ok'))"` phải ra `ok`.
2. **`wrangler.jsonc`:** `VISION_MODEL_FALLBACK` đổi sang `@cf/meta/llama-4-scout-17b-16e-instruct`, khác model chính.
   - Nếu tài khoản Workers AI không dùng được model này thì đổi sang `@cf/google/gemma-3-12b-it` (code đã hỗ trợ cả hai) và ghi lại.
   - **Không** để trùng model chính.
3. **D1 `guard_log`:** cột `outcome` phải nhận được các giá trị mới: `xin_dap_an`, `sua_bac_chung_chung`, `sua_phep_tinh`, `chan_an_toan`.
   - Lệnh ghi đang dùng: `INSERT INTO guard_log (family_id, session_id, prompt_id, field, before_text, after_text, outcome)`.
   - Nếu bảng có `CHECK` giới hạn `outcome` thì thêm migration bỏ giới hạn đó.
4. **Prompt Studio trên D1:** nếu D1 có bản ghi đè cho `p4_chat`, `p3_explain_v3`, `p3_fix_steps_v3` với `rev` nhỏ hơn 32, hãy xoá bản ghi đè hoặc cập nhật theo `kem-con-hoc/src/promptStudio.js` (rev 32).
   - **Lý do:** bản cũ của `p3_explain_v3` có ví dụ "lấy số nào trừ số nào", chính ví dụ đó dạy AI nói hộ phép tính.
5. **Deploy, rồi xoá cache:**
   - Xoá `lesson_cache` có `prompt_version` bắt đầu bằng `v3` tạo trước lúc deploy, vì các bài đó chưa qua bước sửa trên máy chủ.
   - Tạo lại cache cho bài trình diễn (đề vịt và các đề mẫu) bằng cách soạn lại một lần.
6. **Ghi lại tên bản Worker mới.**

### 2. Kiểm trên bản Worker vừa deploy

Dùng gia đình thử nghiệm, không đụng lớp 3A thật.

1. **CORS:** mở app thật, soạn một đề, xem tab Network.
   - Request `OPTIONS /chat` phải trả header `Access-Control-Allow-Headers` có `X-Hint-Question, X-Xung-Ho, X-Prefetch, X-Bypass-Cache`.
   - Không request nào bị lỗi CORS.
2. **Hỏi thêm AI:** gõ "Cho con đáp án luôn đi" và "45 trừ 18 bằng mấy?".
   - Câu trả lời là chữ thường (không có `{`), có nhãn "🛡 Bộ chặn đáp án đã bật".
   - Response có `guarded: true`.
   - Admin › An toàn AI › Nhật ký bộ chặn có dòng "Hỏi thêm AI (xin đáp án)". **Chụp ảnh dòng này.**
3. **Timing:** soạn đề "Bác Ba có 45 quả trứng, bác bán đi 18 quả, sau đó mua thêm 12 quả. Hỏi bác Ba có bao nhiêu quả trứng?" **hai lần**.
   - Ghi `timing` trong response `/chat` (`p3_explain_v3`) của cả hai lần.
   - Lần 2 phải có `cached: true` và dưới 3 giây.
   - Bài phải có 4–5 bậc. Bậc chọn phép tính không có chữ "trừ".
4. **Chấm vở:** chụp một trang vở thật. Ghi `read_attempts` và `read_ms` trong response `/api/v1/ai/check-work/read`.
5. **Cổng cô:** soạn thông báo, bật "Ghim đầu lớp", kiểm có nút "Không hết hạn". **Chụp ảnh.**

### 3. App (`kem-con-hoc`)

```bash
npm run build
node scripts/test-31-routes.mjs
node scripts/test-28-29-30.mjs --bundle     # phải 25/25
npm test
```

`npm test` có nhiều test cũ đã lỗi từ trước. Trên máy Linux có thư mục Worker: 23 đạt, 22 lỗi. Nếu có test **mới** lỗi vì đợt 32 thì sửa rồi báo lại. Ghi tên `dist/assets/index-*.js`.

### 4. Commit và push

- **Không commit** `.claude-xfer/` và `_backup_*`.
- **Commit `kem-con-hoc`:**
  - `src/`, `scripts/test-28-29-30.mjs`, `scripts/test-dot18-chang-3.mjs`, `dist/`;
  - `bang-chung/prompt32/`, `BAO_CAO_DOT_32.md`, `PROMPT_ANTIGRAVITY_32.md`.
- **Commit `ai-gateway-worker`:**
  - `src/`, gồm cả 4 file mới;
  - `wrangler.jsonc`;
  - migration nếu có.
- **Gợi ý commit message:**
  - App: `fix(32): Hỏi thêm AI văn bản thường + từ chối xin đáp án, chip dạng bài theo đề đang đọc, số An toàn AI thật, chấm vở đọc lại lần 2, xưng hô theo người kèm, Dùng thử không gọi API gia đình`
  - Worker: `fix(32): chặn xin đáp án ở /chat, chỉ ép JSON cho p3_*, sửa bậc trên máy chủ trước khi cache, chấm vở fallback model khác, CORS đủ header, import correctLessonMath`
- Push cả hai repo.

### Báo lại

- Tên bản Worker và `index-*.js`.
- `timing` của hai lần soạn cùng một đề.
- `read_attempts` / `read_ms` của chấm vở.
- Ảnh dòng `xin_dap_an` trong admin và ảnh nút "Không hết hạn" ở cổng cô.
- Kết quả `npm test`.
