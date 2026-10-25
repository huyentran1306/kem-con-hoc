# Báo cáo kỹ sư `system-pages` · Đợt 15 · Chặng 3 (nhóm trang Hệ thống)

Ngày 25/10/2026. Không chạy git, không deploy, không gọi AI, không xoá tệp.

## Tệp đã làm
| Tệp | Loại |
|---|---|
| `src/AdminConfigTab.jsx` | Viết lại phần khung: mỗi trang con là một component trong `src/admin/`. Giữ nguyên khối Router (`<RouterPage/>` do `ai-pages` đã thay), Prompt Studio, Phạm vi, Giao diện. Thêm prop `hideSubNav` (tệp không vẽ thanh tab con riêng). Có thêm `export default`. |
| `src/AdminSafetyTab.jsx` | Viết lại theo bộ quy chuẩn |
| `src/AdminToolsTab.jsx` | Viết lại: SQL Studio + cổng chặn Team Prompts. Thêm `hideSubNav`, thêm `export default` |
| `src/TeamPromptSyncTab.jsx` | Chỉ bỏ đoạn tự `POST /db/kv/team_prompts_sync:v1` khi mở trang |
| `src/admin/systemShared.js` | Mới: `adminJson`, định dạng ngày/số/dung lượng, `downloadCsv`, `quotaPct` |
| `src/admin/ModelParamsPage.jsx`, `AdminsPinPage.jsx`, `AuditLogPage.jsx`, `InfraErrorsPage.jsx`, `ZaloPage.jsx`, `SqlStudioPage.jsx` | Mới |
| `src/admin/pages-system.css` | Mới, tiền tố lớp `sys-`, chỉ dùng token `--s-*` |
| `ai-gateway-worker/src/dot15_system.js` | Mới: `export async function handle(request, env, ctx, pathname, method, corsHeaders, adminSession)` trả `Response` hoặc `null` |

## Từng trang
- **Mô hình & tham số**: `Select` tự vẽ (mô hình, độ dài token), `Slider` (độ sáng tạo, thời gian chờ), `Segmented` (độ dài nhận xét). Chỉ Llama 3.3 70B (Workers AI) chọn được; mô hình khác ghi "Chưa gắn khoá API" (bản cũ ghi sai "Gemini 2.5 Flash · Đang kết nối"). Lưu thật qua `PUT /api/v1/admin/model-config` (gộp vào khoá `prompt_studio:ai_config` dùng chung với Prompt Studio, ghi `audit_log` trước/sau), `SaveBar` + Hoàn tác. Dòng "0 lần vi phạm" đổi thành số lần `outcome='leaked'` trong `guard_log` 7 ngày (`/api/v1/admin/safety-summary`); không đọc được thì hiện "·".
- **An toàn AI & phản hồi**: bỏ "(Đợt 14)" trong trang. 4 `KpiCard` lấy số toàn hệ thống từ `/api/v1/admin/safety-summary` (endpoint cũ `/api/v1/safety/summary` chỉ tính theo gia đình đang đăng nhập nên admin luôn thấy "100%"); chưa có dữ liệu thì "·". Bảng dùng `DataTable` + `EmptyState`, `Tabs`, `StatusPill`, `Select` cho bàn thử. Gọi qua `adminFetch` (không còn dính chế độ Dùng thử của app phụ huynh).
- **Quản trị viên & PIN**: bỏ dòng Superadmin giả; bảng trống thì `EmptyState`; không phải superadmin thì EmptyState giải thích. Mời bằng `Drawer` (xác nhận thêm khi cấp toàn quyền, hiện mật khẩu tạm một lần, nút chép). Đổi PIN bằng `ConfirmDialog` (nhập 2 lần, 4 đến 6 số) gọi `POST /api/v1/admin/auth/set-pin` thật (bản cũ chỉ hiện thông báo, không lưu). Thời gian tự khoá lưu qua `POST /api/v1/admin/auth/auto-lock` (mới), có Hoàn tác.
- **Nhật ký thao tác**: lọc người, loại thao tác, Hôm nay / 7 ngày / 30 ngày / Tuỳ chọn ngày, ô tìm theo đối tượng; dòng thời gian (giờ, chữ cái đầu người làm, việc làm, đối tượng); bản ghi có `before/after` trong `details_json` thì có nút "So sánh trước/sau" mở `Drawer` bảng so sánh từng mục; "⤓ Xuất CSV" trên trình duyệt (có BOM cho Excel). Đọc `/api/v1/admin/audit-logs2`; máy chủ chưa có thì lùi về `/api/v1/admin/audit-logs` và lọc trên trình duyệt (bản cũ đọc nhầm khoá `audit_logs` nên luôn trống).
- **Hạ tầng & lỗi** (đổi tên): bỏ hết số viết cứng. Thanh hạn mức chỉ hiện khi có số thật: neuron Workers AI hôm nay (`ai_usage`, trần 10.000), dung lượng D1 (`meta.size_after`, trần 500 MB). Lượt gọi Worker và dòng ghi D1 chưa có bộ đếm nên ẩn thanh và ghi rõ. Cảnh báo `Banner` khi ≥ 75 %, thanh đổi màu. KpiCard lượt gọi AI hôm nay (`ai_calls`), lỗi người dùng 24 giờ. Gộp bảng lỗi phía người dùng (`/api/v1/admin/client-errors`). Bỏ công tắc "Tự dọn dữ liệu người dùng" giả (chỉ đổi trên màn hình); thay bằng trạng thái "Đang tắt" và danh sách dọn dữ liệu kỹ thuật đúng với cron hiện có.
- **Thông báo & Zalo**: thanh 4 bước (Tạo OA, Duyệt mẫu ZNS, Nhập khoá, Gửi thử) đọc `/api/v1/admin/zalo-status` (khoá `_kv_store` `app_config:zalo` nếu có, và biến môi trường `ZALO_APP_ID`/`ZALO_SECRET_KEY` chỉ trả có/không); hiện chưa có cấu hình nên đang ở bước 1. Danh sách 3 mẫu tin với trạng thái (mặc định "Chưa đăng ký"; "Cô nhắc" là "Dùng trong app"), bấm để xem trước bong bóng tin Zalo (biến `{{...}}` tô vàng, không bịa số). Số link báo cáo đã chia sẻ 7 ngày, tổng và lượt mở từ `report_shares`; chưa có bảng thì "·".
- **D1 SQL Studio**: chỉ superadmin (vai trò khác thấy EmptyState); chạy qua `POST /api/v1/admin/sql`, không còn `/db/query`. Hiện luật máy chủ "Chỉ một câu SELECT, tối đa 200 dòng". Bỏ khối nền tối; dùng `Textarea`, `Chip` truy vấn mẫu (bỏ mẫu PRAGMA), `Segmented` Bảng/JSON, xuất CSV, Ctrl/⌘+Enter.
- **Team Prompts Sync**: bỏ tự ghi khi mở trang. `AdminToolsTab` chỉ nạp công cụ khi `import.meta.env?.VITE_DEV_TOOLS === '1'` (nạp động bằng `lazy`), ngược lại hiện `EmptyState`.

## Endpoint mới trong `dot15_system.js`
| Endpoint | Vai trò | Ghi chú |
|---|---|---|
| `POST /api/v1/admin/sql` | superadmin | Bỏ chú thích, che chuỗi; chỉ `SELECT`/`WITH…SELECT`; chặn `;` có câu sau, PRAGMA, ATTACH, DETACH, INSERT, UPDATE, DELETE, REPLACE INTO, CREATE, DROP, ALTER, VACUUM, REINDEX, ANALYZE, BEGIN/COMMIT…; tự thêm `LIMIT 200` nếu cấp ngoài cùng chưa có; cắt còn 200 dòng; `Promise.race` 5 giây; ẩn cột `pass_hash`, `salt`, `pin_hash`, `token_hash`…; ghi `audit_log` mọi lần chạy, bị chặn, lỗi, quá giờ. Trả `{ok, columns, rows, ms, limited, truncated}` |
| `GET /api/v1/admin/infra-usage` | superadmin, editor | null cho số không biết |
| `GET /api/v1/admin/report-shares` | superadmin, editor | null nếu chưa có bảng |
| `GET /api/v1/admin/zalo-status` | superadmin, editor | không trả giá trị khoá |
| `GET /api/v1/admin/audit-logs2` | superadmin, editor | lọc `actor`, `action`, `from`, `to`, `q`, `limit≤500`; kèm danh sách người và loại; tự lùi nếu bảng cũ thiếu `details_json` |
| `GET /api/v1/admin/safety-summary` | mọi vai trò admin | guard_log 7 ngày, ai_feedback, work_checks 7 ngày; null nếu chưa có bảng |
| `GET/PUT /api/v1/admin/model-config` | đọc: superadmin, editor; ghi: superadmin, editor | gộp vào `prompt_studio:ai_config`, ghi audit trước/sau |
| `POST /api/v1/admin/auth/auto-lock` | quản trị viên tự đổi của mình | 5/10/15/30/60 phút, ghi audit |
Nếu `adminSession` truyền vào là null, `handle` tự gọi `authenticateAdmin`.

## Kiểm tra đã chạy
- Bundle app: `esbuild src/main.jsx …` → **OK** (chỉ cảnh báo `import.meta` của định dạng iife, giống các tệp khác).
- Bundle worker: `esbuild src/index.js …` → **OK**; `dot15_system.js` bundle riêng → OK.
- Render thử bằng `react-dom/server` cả 9 màn (6 trang mới, Safety, SQL với vai trò editor, Team Prompts khi tắt cờ): đều render được, không có `<select>` gốc.
- Chạy `handle` với SQLite trong bộ nhớ (`node:sqlite`, giả lập D1): SELECT có ẩn cột băm và tự thêm LIMIT; câu có `;` + DELETE bị chặn 400; editor gọi SQL bị 403; infra-usage, report-shares (null khi chưa có bảng), zalo-status, safety-summary, model-config PUT/GET, auto-lock, audit-logs2 có lọc và có before/after đều đúng. 15 ca kiểm SQL (comment, chuỗi chứa `;`, WITH…DELETE, ATTACH, PRAGMA, replace() hợp lệ…) cho kết quả đúng.
- `grep` các tệp của tôi: không còn `<select>`, "(Đợt 14)", số hạ tầng viết cứng, `/db/`.

## CHƯA làm / cần người khác
1. **Chưa nối `dot15_system.handle` vào worker** (luật: không sửa tệp dùng chung). Cần thêm trong `v1_routes.js`, ngay trước `handleAdminStitchRoutes(...)` (dòng ~994, sau khi đã kiểm phiên và khoá):
   `const d15 = await handleDot15System(request, env, ctx, pathname, method, corsHeaders, adminSession); if (d15) return d15;`
   với `import { handle as handleDot15System } from "./dot15_system.js";`. Trước khi nối, các trang vẫn chạy nhưng hiện "·"/EmptyState/Banner "Máy chủ chưa có chức năng này"; Nhật ký thao tác tự lùi về endpoint cũ.
2. Chưa deploy worker, chưa chạy trên production, chưa chụp ảnh trước/sau.
3. Lượt gọi Worker và dòng ghi D1 mỗi ngày: worker chưa có bộ đếm nên thanh đang ẩn (đúng yêu cầu "không có số thì ẩn"). Muốn hiện cần thêm bộ đếm (hoặc gọi GraphQL Analytics của Cloudflare).
4. Zalo: chưa có nơi nhập cấu hình OA / trạng thái mẫu (`app_config:zalo`), chưa có nút gửi thử; trang chỉ đọc trạng thái.
5. Tiêu đề trên thanh trên của `Admin.jsx` vẫn còn "An toàn AI & Phản hồi Phụ huynh (Đợt 14)" và nhãn "Hạ tầng Cloudflare", "D1 SQL Studio (Chỉ đọc)" ở `CONFIG_SUBTABS/TOOLS_SUBTABS`: tệp của kỹ sư khung admin, tôi không sửa. `ShellRoutes.jsx` đã dùng đúng tên mới.
6. Tham số mô hình được lưu vào `prompt_studio:ai_config` nhưng worker hiện chưa đọc khoá này khi gọi AI (chỉ Prompt Studio và app phía trình duyệt đọc), nên đổi tham số chưa đổi hành vi của `/chat`.
7. Endpoint `/api/v1/admin/ai-feedback/:id/close` cũ trong `index.js` không kiểm phiên admin (tệp dùng chung, không sửa); trang đã gửi kèm token admin.
8. Rollup có thể vẫn tách `TeamPromptSyncTab` thành một chunk riêng (không bao giờ tải) khi cờ tắt; cần `npm run build` thật để xác nhận chunk bị loại hẳn.
