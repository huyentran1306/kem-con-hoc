# Prompt cho Antigravity · Đợt 28–30: cập nhật Worker, build, commit và push

**Cách dùng:** copy toàn bộ phần "Lời nhắn" bên dưới gửi Antigravity.

---

## Lời nhắn

Phần app (frontend) của prompt 28, 29, 30 đã sửa xong trong repo `kem-con-hoc`. Code chưa commit. Bạn làm 3 việc theo thứ tự:

1. Cập nhật Worker `ai-gateway-worker` (code ở `~/Coding/study-en/ai-gateway-worker`) rồi deploy.
2. Build, chạy test cho app.
3. Commit và push.

Không sửa lại các file frontend đã sửa, trừ khi build hoặc test báo lỗi.

### Việc 1 · Worker

#### 1.1 Thông báo của cô: hạn hiển thị, sửa, ẩn, xoá mềm (prompt 29A)

Migration D1 cho bảng thông báo của lớp. Dùng đúng tên bảng hiện có, thường là `class_announcements` hoặc `announcements`:

```sql
ALTER TABLE class_announcements ADD COLUMN expires_at TEXT;   -- ISO, NULL = theo luật mặc định
ALTER TABLE class_announcements ADD COLUMN hidden_at TEXT;    -- ẩn khỏi app phụ huynh
ALTER TABLE class_announcements ADD COLUMN deleted_at TEXT;   -- xoá mềm, giữ lượt đọc
```

Các route cần sửa hoặc thêm. Mọi route sửa đổi **chỉ cô tạo lớp** mới gọi được: kiểm `classes.teacher_id` bằng giáo viên đang đăng nhập; sai thì trả 403.

- `POST /api/v1/teacher/classes/:classId/announcements`: nhận thêm `expiresAt` (chuỗi ISO hoặc `null`). `null` chỉ hợp lệ khi `pinned = 1`. Thông báo không ghim mà gửi `null` thì đặt hạn mặc định 7 ngày.
- **Mới** `PATCH /api/v1/teacher/announcements/:id`, body gồm một hoặc nhiều trường:
  - `title`, `body`, `expiresAt` (ISO hoặc null);
  - `pinned` (0/1);
  - `hidden` (true đặt `hidden_at = now`, false đặt `hidden_at = NULL`).
  - Trả `{ ok: true, announcement }`.
- **Mới** `DELETE /api/v1/teacher/announcements/:id`: xoá mềm (`deleted_at = now`), **không** xoá dòng, **không** xoá bảng lượt đọc. Trả `{ ok: true }`.
- `GET /api/v1/teacher/classes/:classId/announcements`: trả **tất cả**, kể cả đã ẩn hoặc đã xoá, kèm `expires_at`, `hidden_at`, `deleted_at`, `read_count`, `ack_count`, `done_count` như cũ. App tự gắn nhãn Đang hiện / Hết hạn / Đã ẩn / Đã xoá.
- `GET /api/v1/teacher/announcements/:id/reads`: vẫn chạy với thông báo đã ẩn hoặc đã xoá.
- `GET /api/v1/family/announcements`: chỉ trả thông báo **còn hiệu lực**. Lời nhắc (`kind = 'reminder'`) giữ nguyên luật cũ. Với thông báo thường:

```sql
deleted_at IS NULL AND hidden_at IS NULL AND (
  (expires_at IS NOT NULL AND expires_at > :now)
  OR (expires_at IS NULL AND pinned = 1)
  OR (expires_at IS NULL AND pinned = 0 AND created_at > datetime(:now, '-7 days'))
)
```

Luật này khớp với `src/teacher/announcementStatus.js` phía app.

Hai thông báo ghim ngày 25/10 và 26/10 của lớp 3A sẽ vẫn hiện cho tới khi cô gỡ ghim. Sau khi gỡ ghim, chúng còn hiện thêm tối đa 7 ngày kể từ ngày gửi. Muốn tắt ngay thì cô chọn "Ẩn khỏi app phụ huynh" trong menu ⋯. **Không** tự sửa dữ liệu lớp 3A thật.

#### 1.2 Câu hỏi nhỏ hơn `/api/v1/ai/micro-step` (prompt 28 A4)

- Câu dự phòng hiện là một câu chung cho mọi bậc ("Na đọc lại số đứng ngay trước câu hỏi nhé?"). Thay bằng câu chọn theo `skill` của bậc (đọc hiểu, chọn phép tính, tính toán) và có số trong `problem_text`. Có thể chép logic từ `src/microStepLocal.js`.
- Khi trả câu dự phòng, thêm `is_fallback: true` trong `micro_step` để app biết. App đã tự thay câu chung bằng câu soạn tại máy, nhưng máy chủ nên trả đúng ngay từ đầu.
- Nhận thêm `xung_ho` ("mẹ", "bố", "ông bà" hoặc "bố mẹ") và dùng nó trong câu, không viết cứng "mẹ".

#### 1.3 Xưng hô theo người đang kèm (prompt 29B)

- `/api/v1/ai/teach-back/grade` nhận thêm `xungHo`. Dùng trong prompt chấm và câu `loi_khen_cho_con`, `cau_hoi_them` (ví dụ "Con giải thích cho bố nghe…"), không viết cứng "mẹ".
- `/api/v1/ai/progress` nhận thêm `xung_ho`, dùng trong câu chữ báo cáo AI.
- Rà các câu trả về khác của Worker có "mẹ" viết cứng (chấm vở, góp ý, toast). Nếu request có `xung_ho` thì dùng nó; không có thì dùng "bố mẹ".

#### 1.4 Soạn bài `/chat` (prompt 28 A3 và 29B.5)

- Prompt `p3_explain_v3` đã sửa (rev 28) và có prompt mới `p3_fix_steps_v3` (soạn lại riêng các bậc chung chung). Nếu Worker có danh sách `X-Prompt-Id` được phép thì thêm `p3_fix_steps_v3`. Lời gọi này gửi `X-Bypass-Cache: 1` và **không được ghi vào lesson_cache**.
- **lesson_cache:** bài v3 đã cache trước khi deploy được soạn bằng prompt cũ (nhạt, 3 bậc). Hãy đưa phiên bản prompt vào khoá cache (ví dụ `v3r28`), hoặc xoá các dòng `prompt_version = 'v3'` tạo trước lúc deploy. Ở bản thử nghiệm, xoá trước rồi mới làm trên bản chính.
- **Prompt Studio trong D1 (`prompt_studio:config`):** app giờ chỉ nhận bản ghi đè của `p3_explain_v3` khi có `rev >= 28`, và của `p3_extra_v3` khi có `rev >= 29`. Bản ghi đè cũ không có `rev` sẽ bị bỏ qua và app dùng bản trong code. Nếu D1 đang giữ bản ghi đè hai prompt này, cập nhật sang nội dung mới trong `src/promptStudio.js` (kèm `rev`) hoặc xoá bản ghi đè.
- **Đo thời gian (29B.5):** với mỗi request `/chat` soạn bài, đo riêng từng phần: đọc hồ sơ con, đọc hoặc ghi cache, gọi AI, kiểm tra. Ghi log và trả thêm trường `timing` trong JSON, ví dụ `{ "profile_ms": 120, "cache_ms": 15, "ai_ms": 9800, "check_ms": 30 }`. App đã ghi `_timing` của từng lần soạn vào `localStorage.kch_last_explain_timing`. Tạo một gia đình thử nghiệm mới, soạn bài lần đầu, ghi lại log xem phần nào chậm riêng khi con chưa có dữ liệu (lần đo trước mất 31 giây).

Deploy Worker, ghi lại tên bản Worker mới.

### Việc 2 · Build và test app (trong `~/Coding/kem-con-hoc`)

```bash
npm run build                                    # lint + vite build
node scripts/test-28-29-30.mjs --bundle          # 23 kiểm tra của đợt này, phải đạt hết
npm test                                         # cả bộ (đã thêm test-28-29-30 vào cuối)
```

- Trên máy Claude có 28 test cũ không chạy được do thiếu thư mục Worker hoặc môi trường. Trước và sau khi sửa, đúng 28 test đó lỗi giống nhau, không có lỗi mới. Trên Mac có đủ thư mục Worker thì chúng có thể đạt. Nếu có test **mới** lỗi thì sửa rồi báo lại.
- Sau khi Worker deploy, chạy `node scripts/compare-28-v2-v3.mjs > bang-chung/prompt28-30/so-sanh-v2-v3.md` (khoảng 10–15 lần gọi AI). v3 phải ngang v2 về độ bám đề.
- Ghi tên `dist/assets/index-*.js` sau khi build. Bản Claude build trên Linux là `index-B-BJ6STF.js`; build trên Mac có thể ra tên khác.

### Việc 3 · Commit và push

- **Không** commit `.claude-xfer/` và các script nháp `scripts/update-*.py`, `scripts/apply-*.py` (không thuộc đợt này).
- Commit các file đợt này:
  - `src/` (đã sửa);
  - file mới: `src/xungHo.js`, `src/stepQuality.js`, `src/microStepLocal.js`, `src/teacher/announcementStatus.js`;
  - `scripts/test-28-29-30.mjs`, `scripts/compare-28-v2-v3.mjs`;
  - `public/icon-192.png`, `public/apple-touch-icon.png`, `public/manifest.json`, `index.html`, `package.json`, `dist/` (theo lệ cũ);
  - `bang-chung/prompt28-30/`, `BAO_CAO_DOT_28_30.md`, `PROMPT_ANTIGRAVITY_28_30.md`.
- Có thể tách thành 3 commit:
  - `feat(28): góp ý và huy hiệu chỉ nói điều đã xảy ra, câu hỏi v3 bám đề, câu nhỏ hơn theo bậc, câu chữ toàn app`
  - `feat(29): quản lý thông báo của cô (sửa/ẩn/xoá/gỡ ghim, hạn hiển thị), xưng hô theo người đang kèm, màn lần đầu`
  - `fix(30): khung Đang chọn, icon 192/180, placeholder nhập lại mật khẩu và màu placeholder`
- Commit Worker trong repo của Worker.
- Push cả hai repo.

### Báo lại

- Tên bản Worker mới và tên `index-*.js`.
- Kết quả `npm test`, kèm danh sách test lỗi nếu có.
- File `bang-chung/prompt28-30/so-sanh-v2-v3.md`.
- Log thời gian soạn bài lần đầu của gia đình mới.
