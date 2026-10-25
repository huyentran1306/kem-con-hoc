# BÁO CÁO ĐỢT 15 · Làm đẹp admin & cổng giáo viên

> Cập nhật: 25/10/2026 · Người làm: Claude (phiên Cowork) · Báo cáo sống, ghi tiếp sau mỗi chặng.

## Tiến độ

| Chặng | Nội dung | Trạng thái | Commit | Preview |
|---|---|---|---|---|
| 0 | Sửa lỗi P0/P1 luồng phụ huynh | ✅ Xong (code + kiểm thử tự động) | `4286da6` | Chưa deploy* |
| 1 | Bộ quy chuẩn giao diện `src/ui/staff/` | ✅ Xong | `b92f94f` | Chưa deploy* |
| 2 | Khung admin (thanh bên 3 nhóm, đường dẫn riêng, chặn ở máy chủ) | ✅ Xong | `38b796d` | Chưa deploy* |
| 3 | Làm lại các trang admin | ✅ Xong (chưa chụp ảnh trên trình duyệt thật) | `60488f1` | Chưa deploy* |
| 4 | Bỏ cổng cũ `/db/*` | ⏳ **Chưa làm**, để đợt sau | | |
| 5 | Cổng giáo viên | ✅ Xong | `0ae6df5` | Chưa deploy* |
| 6 | Trang bố mẹ | ✅ Xong (có ảnh `bao-cao-15/anh/chang6-*`) | `a671689` | Chưa deploy* |
| 7 | Kiểm thử & ảnh trước/sau | 🔶 Một phần: kiểm thử tự động đạt; chưa chụp đủ mọi trang, chưa chạy axe | | |

\* Phiên này **không deploy được** (wrangler trên máy chưa đăng nhập, push GitHub chưa có quyền). Các commit nằm ở `~/Coding/kem-con-hoc`, nhánh `main`, chưa push. Worker sửa trực tiếp ở `~/Coding/study-en/ai-gateway-worker` (không dùng git), bản gốc trước khi sửa lưu ở máy ảo: `check_work.before-p15.js`, `safety.before-p15.js`, `index.before-p15.js`.

---

## Chặng 0 · Lỗi P0/P1 luồng phụ huynh

### P0
| Mục | Nguyên nhân tìm được | Đã sửa | File |
|---|---|---|---|
| **P0.A** Giảng bài báo "mất mạng" khi AI chỉ chậm | App chờ 30 giây; worker còn thử lại; tên model `cloudflare-llama-3.3-70b` không hợp lệ nên rơi về model khác | App chờ tới 75 giây, phân biệt 3 lỗi: *AI soạn lâu* (có nút Thử lại), *máy chủ lỗi*, *mất mạng thật*; đếm giây "AI đang soạn bài giảng · N giây". Worker `/chat`: ngân sách 25 giây, chỉ thử lại khi còn >12 giây, chỉ nhận model `@cf/...`, `max_tokens` 64–1600 | `src/api.js`, `src/screens.jsx`, worker `src/index.js` |
| **P0.B** Chấm vở trả đúng ví dụ, bước chấm trả rỗng | (1) Worker có **dữ liệu mẫu "3 hộp bút" trả về khi AI lỗi** — đây chính là chuỗi "Hỏi còn mấy bút?", `0.62`, `["29","20"]`. (2) `validateAndGuard` bị gọi **sai thứ tự tham số** nên kết quả chấm biến mất, chỉ còn `{check_id, self_fixed}` | Bỏ dữ liệu mẫu ở worker; đọc lỗi → `doc_duoc:false` + "Mình chưa đọc rõ ảnh, mẹ chụp lại giúp nhé". Prompt đọc vở chỉ còn khuôn `<...>`, prompt chấm dùng ví dụ chia kẹo + câu cấm chép. Worker phát hiện kết quả trùng ví dụ. Grade kiểm đủ 7 trường, thiếu thì thử lại 1 lần rồi trả 502. App: thiếu trường → màn "Chưa chấm xong" + **Thử lại**, không còn "Dòng ." | worker `src/check_work.js`; `src/promptStudio.js`, `src/screens.jsx`, `src/checkWorkFields.js` |
| **P0.C** "Cô Hạnh · Lớp 3A" hiện ở gia đình thật | Thẻ Cô nhắc tự tạo lời nhắc mẫu khi không có dữ liệu | Dữ liệu mẫu chỉ dùng khi `isTrialActive()`; chuyển vào `trialData.js`. Kiểm thử quét toàn `src/`: "Cô Hạnh", "Bé Na", "Bác Ba" chỉ còn trong `trialData.js` | `src/TeacherReminderBanner.jsx`, `src/trialData.js`, `src/ui/staff/index.jsx` |
| **P0.D** Gia đình cũ bị hỏi khai báo lại, hồ sơ con bị đè thành "Na" | Màn khai báo hiện trước khi tải xong state máy chủ; app ghi state rỗng lên máy chủ | Chỉ hiện khai báo khi đã tải xong state và `onboarded !== true`; trong lúc chờ hiện "Đang tải dữ liệu gia đình…", lỗi mạng thì "Thử lại" (không hiện khai báo). Máy chủ đã khai báo/có hồ sơ con → luôn lấy bản máy chủ. Chưa khai báo xong thì **không ghi** lên máy chủ | `src/App.jsx`, `src/api.js` |

### P1
| Mục | Đã sửa |
|---|---|
| Nút "Hoàn thành bài" chỉ hiện khi giữ mở đáp án | Hiện ngay khi xong bậc cuối; mở đáp án là tuỳ chọn |
| Pháo giấy phủ kín 8 giây | ≤ 2 giây, mật độ thấp, không chồng đợt, tắt khi "giảm chuyển động" |
| Thẻ "ĐÁP ÁN (MẸ ĐỐI CHIẾU)" trống | Ẩn khi không có đáp án |
| Hai bộ đánh giá trùng | Bỏ "Mẹ đánh giá nhanh", giữ "Mẹ chốt mức hiểu bài" |
| "Bé Bé Na" | Bỏ chữ "Bé" thừa (app + worker) |
| Dùng thử: đề nào cũng ra "Bác Ba bán vịt", 3 thẻ trống, "CÁCH LỚP LỚP 3", lời giảng mẫu "3 hộp bút" | Ô gõ đề có sẵn 3 đề mẫu; đề lạ báo "Dùng thử chỉ có 3 đề mẫu"; mỗi đề có đủ bài giảng, chấm vở (sai + đã sửa), lời giảng lại khớp nhau; sửa nhãn thành "Cách lớp 3" |
| Bộ Bạn Gấu: nút Chấm vở thành chữ trơn | Lớp `.btn.primary` chưa từng có CSS → thêm cho cả 8 bộ |
| Nhãn "Đang dùng" tương phản 1,5–2,6 | Chữ màu chính trên nền xanh nhạt: 9,2–14,9 ở 6 bộ sáng; dòng mô tả dùng màu chữ chính |
| Báo cáo tuần thiếu thẻ AI | Thêm thẻ "Tuần này cùng AI": số lần con giảng lại, số lỗi tự sửa được + loại lỗi hay gặp, An toàn AI 7 ngày |
| Thêm (phát hiện khi làm) | Worker `/api/v1/safety/summary` đang trả số liệu **của mọi gia đình** và ép tỉ lệ an toàn ≥ 99% → giờ chỉ số liệu của gia đình đang đăng nhập, theo `?range=7d`, bỏ mức sàn 99% |

### Kiểm thử chặng 0
- `scripts/test-dot15-chang-0.mjs`: **21/21 đạt** (đã thêm vào `npm test`).
- Các bộ cũ chạy lại đều đạt: theme-contrast, scope-rules, ocr-parse, study-tracker, calm-corner, custom-theme, teacher-reminder (TZ Asia/Ho_Chi_Minh), admin-themes, prompt-11, chang-3, chang-6, dot14-chang-1/2/4/5.
- Gói worker build lại bằng esbuild: đạt.
- **Chưa làm được:** kiểm trên production (cần deploy), chạy bộ 20 ảnh vở `ai-eval/vo-mau` (cần worker mới trên Cloudflare), đo trung vị/p95 `p3_explain` từ `ai_calls` (cần quyền D1), thử micro thật trên Chrome Android/Safari iOS.

---

## Chặng 1 · Bộ quy chuẩn giao diện dùng chung

Thêm vào `src/ui/staff/` (file mới `kit.jsx`, sửa `index.jsx`, `tokens.css`):
- Mới: `PageHeader`, `KpiCard` (không có số → "·" + "Chưa có dữ liệu"), `Input`, `Textarea`, `Select` **tự vẽ** (↑ ↓ Enter Esc Home End, gõ chữ để nhảy), `Slider`, `Chip` có nút xoá, `Toast` có **Hoàn tác**, `ConfirmDialog` + `staffConfirm()` (có thể bắt gõ lại tên trước khi xoá), `CodeEditor` nền sáng có số dòng và tô vàng `{{biến}}`, `Drawer`, `Pagination`.
- Sửa: `Tabs` gạch chân mật ong + phím ← →; `StatusPill` có 4 trạng thái chuẩn Đạt / Đang chạy / Chờ xem / Lỗi; `DataTable` đầu bảng dính, phân trang, trạng thái trống có gấu; `SaveBar` nền sáng, chỉ hiện khi có thay đổi, có "Bỏ thay đổi".

Ảnh (render bằng Playwright 1280px):

![Bộ quy chuẩn](bao-cao-15/anh/chang1-bo-quy-chuan.png)
![Hộp xác nhận + thông báo có Hoàn tác](bao-cao-15/anh/chang1-hop-xac-nhan.png)

---

## Chặng 2–6 (làm song song bởi 7 trợ lý, mình gom và kiểm)
Chi tiết từng phần: `bao-cao-15/agents/*.md`. Đợt 16 (giao diện theo mùa): `BAO_CAO_DOT_16.md`, commit `66b74bd`.

Worker: thêm 5 file mới `src/dot15_monitor.js`, `dot15_ai.js`, `dot15_system.js`, `dot15_teacher.js`, `dot16_seasons.js`, đã nối vào `src/v1_routes.js`; thêm `/api/v1/admin/me`, `/todo-counts`, `/health`; `/api/v1/config/public` trả thêm `seasons`. Bản trước khi sửa lưu ở máy ảo `~/scratch/worker-backup/`.

Kiểm thử: tất cả bộ `npm test` chạy được trong máy ảo đều đạt (gồm mới: dot15-chang-0/2, dot16-seasons, dot16-themes). Bốn bộ cũ được cập nhật vì thiết kế đổi có chủ đích (11 bộ giao diện thay vì 8, sidebar giáo viên 220px, nhãn tab ngắn, KPI kết quả mới).

## ⚠️ Điểm dừng cần chủ dự án quyết
1. **Khoá chủ admin bị lộ.** Worker vẫn nhận mật khẩu/token `kem-con-hoc-admin-secret-2026`, `kem_admin_2026` và cả token `admin` → ai biết là vào được admin. App đã bỏ khoá này, worker giờ chỉ nhận khi biến `ALLOW_LEGACY_MASTER_SECRET="true"` (đang để `true` trong `wrangler.jsonc` để bạn không bị khoá ngoài). **Sau khi đăng nhập admin được bằng mật khẩu riêng, đổi thành `"false"` rồi deploy lại.**
2. Chặng 4 (khoá `/db/*`) chưa làm.
3. Kiểm lại ngày Tết 2027–2031 trong `src/seasons`.

## Việc chờ chủ dự án
1. Push `main` và deploy (worker trước, app sau) — xem `VIEC_CAN_LAM_SAU_CLAUDE_2026-10-25.md`.
2. Sau khi deploy: chụp lại 1 ảnh vở thật để xác nhận P0.B trên production.
