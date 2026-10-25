# Báo cáo · ai-pages (Prompt Studio, Router sư phạm, Phạm vi đề & ảnh)

Ngày 25/10/2026 · Đợt 15 · Chặng 3

## Đã làm theo từng trang

### Prompt Studio (`src/PromptStudioTab.jsx`, viết lại phần giao diện)
- 3 cột như bản vẽ: danh sách prompt · trình soạn `CodeEditor` nền sáng (số dòng, biến `{{...}}` tô vàng) · bàn thử + lịch sử phiên bản.
- Cột tự xếp theo **bề rộng vùng nội dung** (container query, không theo bề rộng màn hình): ≥1120px vùng nội dung thì 3 cột (250px · phần còn lại · 320px), 760 đến 1120px thì 2 cột (bàn thử xuống dưới trình soạn), hẹp hơn thì 1 cột. Hết cảnh cột giữa bị bóp, tiêu đề xuống dòng từng chữ.
- Danh sách prompt: mã ngắn (`p3`, `p3 v2`, `p14b`…), tên đã bỏ số thứ tự và nhãn nội bộ ("(Prompt 14)", "(v2 JSON)", "(Scaffold Socratic)"), phiên bản mới nhất từ máy chủ (`v4`, chưa có thì `v·`), nhãn "nháp", điểm chấm AI **chỉ cho p3** (đọc `ai-eval/latest-result.json`, đúng prompt mà file đó chấm: 30/30). Có ô tìm prompt, chấm báo lỗi (thiếu biến bắt buộc, quá 12.000 ký tự).
- **Tách Lưu nháp và Xuất bản**:
  - Lưu nháp: giữ nháp trên máy (`kem-con-hoc:prompt-studio-drafts`) và ghi một phiên bản `draft` lên máy chủ (endpoint mới), gia đình vẫn dùng bản đang chạy.
  - Xuất bản: hỏi `staffConfirm`, chỉ thay **đúng prompt đang chọn** trong `prompt_studio:config` (các prompt khác giữ bản đang chạy, nháp của prompt khác không lọt ra), ghi phiên bản `published`.
  - Bỏ ô "Khoá quản trị prompt" giả; Prompt Studio không còn ghi đè `prompt_studio:ai_config`.
- Bàn thử: đề bài, lớp, môn (Select tự vẽ), ghi chú phụ huynh khi prompt có `{{khung_ghi_chu}}`. "Chạy thử" gọi AI thật 1 lần với bản đang soạn (điền biến giống app: dạng bài và phương pháp lấy từ `classifyProblemDynamic` + `routePedagogyMethod`). Kết quả chấm bằng **đúng bộ chặn của app** (`validateAndGuard` trong `src/guard.js`): JSON đúng, số bậc 3 đến 5, không lộ đáp án (hoặc "Bộ chặn đã thay câu lộ đáp án" kèm lý do), thời gian trả lời; liệt kê các câu hỏi từng bậc như bản vẽ.
- "Kiểm bộ chặn với kết quả có sẵn": dán JSON AI đã trả, chạy bộ chặn **không gọi AI**.
- "Xem bản điền biến" (Drawer, chỉ đọc). "Bỏ thay đổi", "Về bản gốc" có Hoàn tác.
- Lịch sử phiên bản: từ máy chủ (v, nháp/đang dùng/đã xuất bản, người lưu, giờ, khôi phục). Máy chủ chưa có endpoint thì hiện các bản lưu trên máy (`PROMPT_HISTORY_KEY`) và ghi rõ điều đó.
- Giữ nguyên các export `AVAILABLE_AI_MODELS`, `PARAM_CONFIG`, `getParamStyle`, `default PromptStudioTab`.

### Router sư phạm (`src/admin/RouterPage.jsx`, mới)
- Tách khỏi `AdminConfigTab.jsx`. Bảng cũ là **4 luật viết cứng với số 412/388/295/142 bịa** và không liên quan luật app dùng thật; trang mới đọc và sửa **bảng luật thật** `pedagogy_routing` trong `prompt_studio:ai_config` (cùng nguồn app dùng để chọn phương pháp).
- Mỗi luật một thẻ: số ưu tiên (đổi thứ tự bằng ▲▼, vì luật trên khớp trước), tên, phương pháp, điều kiện dạng `Chip` (môn, dạng bài, lớp), `Toggle` bật/tắt, Sửa (Drawer), Xoá (`staffConfirm` + Hoàn tác), mức dùng 30 ngày + thanh, tỉ lệ con tự làm.
- Số liệu thật từ `learning_sessions` qua endpoint mới; chưa có số thì hiện "·". Nếu có buổi học nhưng chưa buổi nào ghi luật thì có Banner giải thích.
- "Thử một đề": chạy trên trình duyệt bằng **đúng 2 bước của app** (nhận dạng theo từ khoá như `classifyProblemDynamic`, rồi chọn phương pháp như `routePedagogyMethod`), dùng cả luật đang sửa chưa lưu, có ô lớp và "Con đang bí lần 2". Kết quả: "Khớp luật N · tên · lý do: từ khoá «chu vi», môn Toán, lớp 3, dạng bài «công thức»", tô viền thẻ luật khớp.
- Lưu bằng `SaveBar` (chỉ hiện khi có thay đổi, đếm số thay đổi); lưu thì đọc lại `prompt_studio:ai_config` trên máy chủ và chỉ thay `pedagogy_routing` (giữ model, temperature…).

### Phạm vi đề & ảnh (`src/AdminScopeSection.jsx`, viết lại)
- Bỏ đầu trang xanh đen, ô lời nhắn nền đen, thẻ đỏ chói, `<select>` mặc định, bảng JSON nền đen.
- `PageHeader` nền kem + nhãn "Đang bật · vN"; `Tabs` Cấu hình luật / Bàn thử (6 mẫu) / Nhật ký.
- 4 thẻ cài đặt: Bật kiểm tra (Toggle), Lệch lớp cảnh báo (Slider ≥2 đến ≥4 lớp, câu ví dụ đổi theo), Đề tối thiểu (Slider 5 đến 40 ký tự), Khối hỗ trợ (Chip lớp 1 đến 5, giữ liền nhau; câu "Lớp N trở lên: luật ngoài chương trình" đổi theo).
- Từ khoá luôn chặn: `Chip` có nút xoá + ô "＋ Thêm từ khoá…" (Enter để thêm, chống trùng).
- 9 loại vi phạm, mỗi loại một hàng: biểu tượng + tên + mô tả · hành động chọn bằng `Segmented` (Chặn / Chụp lại / Cảnh báo / Chọn bài / Gợi ý thay tuỳ loại) · lời nhắn nền kem, biến `{xung_ho}`… tô vàng, bấm nhãn biến để chèn · cột "Phụ huynh sẽ thấy" dạng bong bóng app (điền ví dụ Mẹ, bé Na lớp 2).
- `SaveBar` dính đáy chỉ khi có thay đổi: "Có N thay đổi chưa lưu · luật mới áp dụng ngay sau khi lưu", Bỏ thay đổi / Lưu luật. "Đưa về mặc định" hỏi `staffConfirm`.
- Bàn thử: 6 mẫu có ảnh nhỏ, sửa đề tự do, hồ sơ lớp (Select tự vẽ), "Chạy với đề chữ" / "Chạy như ảnh mẫu" / "Chạy cả 6 mẫu" (bảng kỳ vọng và kết quả). Chạy trên máy với luật đang sửa, không gọi AI.
- Nhật ký: 3 `KpiCard` (lượt chặn & cảnh báo, lượt cảnh báo, % phụ huynh vẫn tiếp tục: không có cảnh báo thì "·"), `DataTable` có phân trang, `EmptyState` khi trống. Đọc qua endpoint mới trước, chưa có thì dùng lại `getScopeStats()` cũ.

### Worker (`ai-gateway-worker/src/dot15_ai.js`, mới, CHƯA gắn vào index.js)
`export async function handle(request, env, ctx, pathname, method, corsHeaders, adminSession)` → Response | null, chỉ xử lý `/api/v1/admin/ai/*`, cần `adminSession`, khoá phiên trả 423:
- `GET /api/v1/admin/ai/router-stats?days=30`: theo `learning_sessions.method_rule_id`: số buổi, số buổi có đánh giá, số buổi `teach_back_rating='self'`; kèm tổng buổi và số buổi chưa ghi luật.
- `GET /api/v1/admin/ai/prompt-versions[?promptId=]`, `GET /api/v1/admin/ai/prompt-versions/:id`, `POST /api/v1/admin/ai/prompt-versions` `{promptId, template, status:'draft'|'published', note}` (vai trò superadmin/admin/editor, ghi `audit_log` SAVE_PROMPT_DRAFT / PUBLISH_PROMPT). Bảng `prompt_versions` tự tạo (`CREATE TABLE IF NOT EXISTS`) ở lần POST đầu; GET khi chưa có bảng trả danh sách rỗng.
- `GET /api/v1/admin/ai/scope-stats?days=30`: thay dần cho `/db/query` của nhật ký phạm vi.
- Không gọi AI. Mỗi request tối đa 3 truy vấn (dùng `DB.batch`).

Cách gắn (người tích hợp index.js):
```js
import { handle as handleDot15Ai } from "./dot15_ai.js";
// trong nhánh /api/v1/admin/* sau khi có adminSession:
const r15 = await handleDot15Ai(request, env, ctx, pathname, method, corsHeaders, adminSession);
if (r15) return r15;
```

## File đã đổi
- Viết lại: `src/PromptStudioTab.jsx`, `src/AdminScopeSection.jsx`.
- Mới: `src/admin/RouterPage.jsx`, `src/admin/aiPagesApi.js`, `src/admin/pages-ai.css`, `ai-gateway-worker/src/dot15_ai.js`.
- `src/AdminConfigTab.jsx`: **một lần sửa nhỏ** (thêm `import RouterPage from './admin/RouterPage'` và thay khối JSX "Subtab 3: Pedagogical Router" bằng `<RouterPage />`).

## Kiểm tra
- Bundle app (esbuild `src/main.jsx`): OK. Bundle `dot15_ai.js`: OK.
- Chạy thử logic bằng node (không gọi AI, không mạng):
  - Router: "Một hình chữ nhật dài 8 cm, rộng 5 cm. Tính chu vi." lớp 3 → luật 3 (công thức chu vi, diện tích); đề mua táo lớp 2 → luật 1; "Điền vần an hay ang" lớp 1 → luật 4; câu tiếng Anh "Choose…" → luật 6; "số chẵn" → luật 2; con bí → luật "Con bí lần 2 trở đi"; đề không khớp → luật bật đầu tiên (đúng như app).
  - Bộ chặn ở bàn thử: JSON 3 bậc sạch → Đạt; có câu "Vậy còn 19 cây đúng không?" → "Bộ chặn đã thay câu lộ đáp án · lộ số đáp án 19"; 1 bậc → báo sai định dạng; chữ thường → JSON sai.
  - Render server (react-dom/server) cả 3 trang: không lỗi, chữ hiện đúng.
- Không bấm "Chạy thử" thật, không gọi AI, không deploy, không chạy git.

## CHƯA làm / cần người khác
- **Chưa chụp ảnh trước/sau** (không mở được trang admin thật trong lượt này, cần phiên admin).
- **Gắn `dot15_ai.js` vào `index.js`**: người tích hợp worker. Chưa gắn thì trang vẫn chạy: mức dùng Router hiện "·", lịch sử phiên bản dùng bản lưu trên máy, nhật ký phạm vi dùng `getScopeStats()` cũ.
- **App chưa gửi `methodRuleId`** khi mở buổi học (`POST /api/v1/sessions` có trường này nhưng `src/` không truyền), nên mức dùng và tỉ lệ tự làm theo luật sẽ là "·" cho tới khi app ghi id luật (cần sửa `aiExplain`/luồng mở buổi: lấy id luật từ `routePedagogyMethod`, hiện hàm này chỉ trả `phuong_phap`). Không sửa vì ngoài phạm vi file.
- **Gửi người giữ `AdminConfigTab.jsx`**: (1) state `routerRules` (4 luật bịa) giờ không dùng nữa, xoá được; (2) Prompt Studio **không còn** khung chọn model/temperature/max tokens (khung cũ ghi vào `prompt_studio:ai_config`, là nơi duy nhất app đọc). Trang "Mô hình & tham số" nên lưu vào `prompt_studio:ai_config` (gộp, giữ `pedagogy_routing`) thì thông số mới có tác dụng thật; hiện trang đó chỉ giữ state trong máy.
- Các lệnh `dbKvGet/dbKvSet` (`prompt_studio:config`, `prompt_studio:ai_config`, `app_config:scope_rules`) và `getScopeStats()` vẫn đi qua `/db/*` như cũ, để người làm chuyển đổi `/db/*` xử lý; không thêm lệnh `/db/*` mới.
