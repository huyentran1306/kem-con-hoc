# Prompt 00 · Nền tảng tài khoản và bảo mật (làm trước prompt 03, 04, 05)

**Cách dùng:** copy toàn bộ phần PROMPT gửi cho AI lập trình, kèm source app (React + Vite) và source Cloudflare Worker gateway.

**Vì sao có prompt này:** khi đọc bản đang chạy (`kem-con-hoc-5xf.pages.dev`, ngày 24/10/2026), các điểm sau khiến **không thể làm an toàn** tính năng nhóm gia đình (prompt 03) và giáo viên (prompt 04):
- Trình duyệt gửi **câu SQL tự do** lên `POST /db/query` và `POST /db/execute`, không cần đăng nhập.
- Ai cũng đọc và ghi được dữ liệu của bất kỳ gia đình nào qua `/db/kv/fam:{id}:state`.
- Mã PIN admin được so sánh **ngay trên trình duyệt**, giá trị nằm trong file JS công khai. Đăng nhập admin chỉ là đặt `localStorage['kem-con-hoc:admin-auth']='true'`.
- Mật khẩu gia đình băm 1 lượt SHA-256 trên trình duyệt. Không có phiên đăng nhập (session token).
- Khoá Prompt Studio chỉ kiểm tra "không rỗng", không gửi lên máy chủ.

Khi có giáo viên và dữ liệu của nhiều trẻ, các lỗ hổng này thành rủi ro thật về dữ liệu trẻ em.

---

## PROMPT

Bạn là kỹ sư full-stack, làm việc trên app **Kèm Con Học** gồm 2 phần: app web React + Vite (deploy Cloudflare Pages) và một **Cloudflare Worker gateway** (`ai-gateway-worker`) có D1 (SQLite) và các endpoint AI (`/chat`, `/vision/analyze`, `/vision/ocr`, `/stt`). Nhiệm vụ: dựng **lớp tài khoản và phân quyền chạy ở máy chủ**, thay cho việc trình duyệt gửi SQL tự do. Làm theo từng giai đoạn để app đang chạy **không bị gián đoạn**.

### Hiện trạng cần biết
- Bảng `families (id TEXT PK, name TEXT UNIQUE, salt TEXT, pass_hash TEXT, created_at)`. Mật khẩu = SHA-256(`salt::password`) tính trên trình duyệt.
- Bảng `_kv_store (key, value, updated_at)` với các key: `fam:{familyId}:state` (toàn bộ dữ liệu gia đình dạng JSON `{ts, state}`), `prompt_studio:config`, `prompt_studio:ai_config`, `team_prompts_sync:v1`.
- Bảng `teaching_feedback (id, family_id, problem_type, reason, comment, created_at)`.
- App lưu phiên ở `localStorage['kem-con-hoc:session'] = {id, name}`. Không có token.
- Admin dùng `/db/query` cho SQL Studio, danh sách gia đình, đổi tên, đặt lại mật khẩu, xoá.

### Giai đoạn A: thêm API mới song song (không phá cái cũ)
1. **Bảng mới** (migration D1, chạy được nhiều lần):
   - `members (id TEXT PK, family_id TEXT, display_name TEXT, relation TEXT, role TEXT CHECK(role IN ('owner','guardian','viewer')), pin_hash TEXT, pin_salt TEXT, created_at, last_seen_at)`. Mỗi gia đình hiện có sinh 1 member `owner` tên theo trường `parent` trong state.
   - `auth_sessions (token_hash TEXT PK, subject_type TEXT CHECK(subject_type IN ('member','teacher','admin')), subject_id TEXT, family_id TEXT NULL, user_agent TEXT, created_at, expires_at, revoked_at, locked_at)`. Một bảng cho cả phiên gia đình, giáo viên (prompt 04) và admin; `locked_at` dùng cho khoá màn hình admin (prompt 05).
   - `login_attempts (key TEXT, ok INTEGER, created_at)`, với `key` dạng `ip:<ip>`, `family:<id>`, `member:<id>`, `teacher:<email>`, `admin:<email>`; dùng để giới hạn số lần sai (mục 6). Chỉ ghi các lần **sai** (lần đúng thì xoá bản ghi sai của key đó) để đỡ tốn lượt ghi D1.
   - `children (id TEXT PK, family_id, nickname, emoji, grade INTEGER, book TEXT, created_at, deleted_at)`: bản sao các con trong state, cập nhật mỗi lần `PUT /family/state`. `id` lấy đúng `child.id` trong state và không bao giờ đổi. Các bảng khác (`learning_sessions`, `class_students` của prompt 04) tham chiếu `children.id`; admin lọc theo khối, sách bằng bảng này thay vì đọc JSON.
   - Thêm cột cho bảng cũ: `ALTER TABLE families ADD COLUMN hash_version INTEGER DEFAULT 1` (để dành cho lần nâng cấp cách băm sau này, xem mục 2).
   - `admin_users (id TEXT PK, email TEXT UNIQUE, display_name TEXT, role TEXT CHECK(role IN ('superadmin','editor','support')), pass_hash TEXT, pass_salt TEXT, created_at, last_login_at)`.
   - `audit_log (id INTEGER PK, actor_type TEXT, actor_id TEXT, action TEXT, target TEXT, meta TEXT, created_at)`.
2. **Kiểm tra mật khẩu ở worker, giữ cách băm hiện tại** (dự án chạy gói Workers Free):
   - **Giữ nguyên** công thức đang dùng: SHA-256 của `salt::password`, cột `salt`, `pass_hash` như cũ. App cũ vẫn đăng nhập được, không cần chuyển đổi dữ liệu.
   - Khác biệt quan trọng: trình duyệt **gửi mật khẩu lên** `POST /auth/login` qua HTTPS, **worker tự tính và so sánh** (so sánh thời gian cố định). `salt` và `pass_hash` **không bao giờ trả về trình duyệt** (hiện nay ai cũng tải được qua `/db/query`, đây là lỗ hổng chính cần đóng).
   - Mật khẩu admin, giáo viên và PIN thành viên dùng cùng công thức (salt ngẫu nhiên 16 byte cho mỗi tài khoản).
   - **Để sau, khi lên gói Workers Paid:** chuyển sang PBKDF2-SHA256 100.000 vòng (tốn vài chục mili giây CPU, vượt giới hạn 10 ms của gói Free). Cột `hash_version` để sẵn cho lần nâng cấp đó; **không làm trong prompt này**.
   - Vì băm nhanh nên việc **giới hạn số lần thử** ở mục 6 là bắt buộc, không được bỏ.
3. **Endpoint mới** (tiền tố `/api/v1`), JSON, trả lỗi dạng `{error:{code,message}}`:
   - `POST /auth/register` `{familyName, password, displayName?, relation?}` tạo family + member owner, trả `{token, family, member}`. `displayName`, `relation` không bắt buộc: thiếu thì lấy từ `state.parent` (Mẹ/Bố/Ông/Bà), không có thì đặt "Chủ nhà". Màn đăng ký hiện tại giữ nguyên.
   - `POST /auth/login` `{familyName, password}` hoặc `{familyId, memberId, pin}` (dùng cho prompt 03), trả token.
   - `POST /auth/logout`, `GET /auth/me`.
   - `GET /family/state`, `PUT /family/state` `{state, baseTs}`: chỉ đọc/ghi gia đình của token. Nếu `baseTs` cũ hơn bản trên máy chủ, trả `409` kèm bản mới để app gộp, thay cho "bản mới hơn thắng" như hiện nay.
   - `POST /feedback/teaching` thay cho INSERT trực tiếp vào `teaching_feedback`.
   - `DELETE /family` (chỉ owner, phải gửi lại mật khẩu): xoá gia đình và **xoá dây chuyền** mọi bảng có `family_id` (members, children, auth_sessions, learning_sessions, session_events, scope_events, invites, report_shares, class_students và kết quả bài của prompt 04, nps_responses, KV `fam:{id}:state`). Nút "🗑 Xóa toàn bộ dữ liệu" hiện có của app gọi endpoint này.
   - `GET /config/public`: trả các cấu hình app cần đọc (prompt đang dùng, ai_config, luật phạm vi ảnh của prompt 02, danh sách giao diện của prompt 01). **Lưu ý:** hiện app gia đình không tự tải prompt từ máy chủ, chỉ trang admin đọc. Endpoint này sửa luôn lỗi đó: app gọi khi mở và cache 10 phút.
4. **Token**: chuỗi ngẫu nhiên 32 byte, chỉ lưu SHA-256 của token trong `auth_sessions`, hạn 60 ngày, gửi qua header `Authorization: Bearer`. App lưu token ở `localStorage['kem-con-hoc:auth']`.
5. **Admin ở máy chủ**:
   - `POST /admin/auth/login` `{email, password}` kiểm tra ở worker, trả token admin riêng (hạn 12 giờ).
   - Tài khoản superadmin đầu tiên tạo bằng lệnh `wrangler` hoặc biến môi trường một lần; **không** để mật khẩu trong code.
   - Mọi endpoint `/api/v1/admin/*` (danh sách gia đình, chi tiết, đổi tên, đặt lại mật khẩu, xoá, thống kê, lưu prompt, lưu ai_config, luật phạm vi, giao diện) kiểm tra token admin và vai trò, ghi `audit_log`.
   - Lưu prompt yêu cầu vai trò `editor` trở lên. Bỏ hẳn ô "Khoá quản trị prompt" giả hiện nay.
   - SQL Studio (nếu giữ): chỉ `superadmin`, chỉ cho `SELECT`, `PRAGMA`, `EXPLAIN` (kiểm tra ở worker bằng parser đơn giản: một câu lệnh, bắt đầu bằng các từ đó, không có `;` thứ hai), giới hạn 500 dòng.
6. **Giới hạn tần suất** (đếm trong `login_attempts`, xoá bản ghi cũ hơn 7 ngày):
   - đăng nhập mật khẩu gia đình sai 5 lần trong 15 phút: khoá 15 phút **theo cặp IP + gia đình** (không khoá cả gia đình theo tên, để người lạ không khoá được chủ nhà thật);
   - một IP sai quá 30 lần trong 1 giờ (mọi tài khoản): khoá IP 1 giờ;
   - PIN thành viên (prompt 03) sai 5 lần: khoá **thành viên đó** 15 phút ở máy chủ, áp cho mọi máy;
   - admin sai 5 lần: khoá 30 phút.
7. **CORS**: chỉ cho đúng các origin của app: tên miền production, preview của **đúng project này** (`https://*.kem-con-hoc-5xf.pages.dev`, không mở cho mọi `*.pages.dev`), và `http://localhost:5173`.
8. **Ghi nhận từng buổi học** (prompt 03, 04, 05 đều cần; hiện mọi thứ nằm trong một khối JSON nên admin không thống kê được và phần "Ai kèm" trong báo cáo đang lấy từ lịch chia ca chứ không phải buổi học thật):
   - Bảng `learning_sessions (id TEXT PK, family_id, child_id, member_id, started_at, ended_at, source TEXT CHECK(source IN ('photo','type','voice','sample','teacher')), assignment_id TEXT NULL, assignment_item_id TEXT NULL, subject, grade INTEGER, problem_text TEXT, problem_type TEXT, method_rule_id TEXT, steps_total INTEGER, steps_done INTEGER, stuck_count INTEGER, hint_level_max INTEGER, answer_peeks INTEGER, teach_back_rating TEXT CHECK(teach_back_rating IN ('self','hint','guided') OR teach_back_rating IS NULL), quick_rating TEXT CHECK(quick_rating IN ('ok','weak') OR quick_rating IS NULL), completed INTEGER, scope_category TEXT, ai_latency_ms INTEGER, ai_model TEXT, ai_output_json TEXT, validator_json TEXT)`.
     - Thang tự đánh giá thống nhất cho mọi prompt: `self` = "Con tự làm được", `hint` = "Con cần gợi ý", `guided` = "Mẹ/Bố hướng dẫn nhiều".
     - `id` do **app sinh** (UUID) để ghi được khi ngoại tuyến: app xếp hàng các lệnh `POST/PATCH`, gửi lại khi có mạng; worker bỏ qua bản trùng.
   - Bảng `session_events (session_id, ts, type TEXT CHECK(type IN ('start','step_done','stuck','hint1','hint2','answer_peek','easier','teach_back','done')), step INTEGER NULL)`: dòng thời gian từng buổi. "Bậc hay vướng nhất" (prompt 04) và "Dòng thời gian" (prompt 05) đọc từ bảng này, **không** đọc `ai_output_json`.
   - Bảng `ai_calls (id INTEGER PK, family_id, session_id, endpoint, prompt_id, latency_ms, ok INTEGER, error_code TEXT, created_at)`: worker tự ghi cho mỗi lần gọi `/chat`, `/vision/*`, `/stt`, ghi bằng `ctx.waitUntil` để không làm chậm phản hồi.
   - Endpoint `POST /sessions` (mở buổi), `PATCH /sessions/{id}` (cập nhật số liệu + thêm sự kiện khi xong bậc, bí, xem gợi ý, xem đáp án, dạy lại, hoàn thành). App gọi ở đúng các điểm này trong luồng Analyze, Scaffold, Done hiện có. Buổi có `assignment_item_id`: worker tự ghi kết quả bài cô giao (prompt 04), app không tự ghi.
   - **`/chat`, `/vision/*`, `/stt` nhận thêm 2 header không bắt buộc** `X-Prompt-Id` (ví dụ `p3_explain`) và `X-Session-Id`. Worker dùng để ghi `ai_calls` và để chạy bộ kiểm định lộ đáp án (prompt 05). Request và response giữ nguyên dạng cũ; app cũ không gửi header vẫn chạy.
   - `members.last_seen_at` cập nhật tối đa 1 lần mỗi giờ cho mỗi thành viên (tránh ghi D1 mỗi request).
   - Không lưu ảnh. Trong state JSON vẫn giữ sticker, lịch sử như cũ để app chạy offline; các bảng này là bản ghi song song.
9. **Chuyển dữ liệu cũ (backfill, chạy một lần, xem trước được):**
   - Mỗi gia đình: tạo member owner (mục 1), tạo `children` từ state.
   - Tạo `learning_sessions` gần đúng từ `stickerHistory` **thật** của từng con (bỏ qua 15 bản ghi mẫu đã được đánh dấu `sample: true`, xem prompt 06; chỉ bỏ qua, không xoá): mỗi sticker là 1 buổi đã hoàn thành, `started_at` = timestamp, `source = 'photo'`, không có `problem_text`. Ghi `meta.backfill = true` để admin phân biệt.
   - Có chế độ chạy thử (chỉ đếm, không ghi) và báo cáo số bản ghi sẽ tạo.
   - Chạy **theo lô** để không vượt giới hạn 50 truy vấn D1 mỗi lần gọi của gói Free: mỗi lần gọi xử lý tối đa 10 gia đình và trả về con trỏ để gọi tiếp; hoặc chạy bằng script cục bộ qua `wrangler d1 execute`.
10. **Dọn dữ liệu: mặc định KHÔNG tự xoá dữ liệu của người dùng** (chốt 24/10).
   - **Dữ liệu kỹ thuật** (không chứa nội dung học của gia đình) vẫn được dọn tự động mỗi đêm bằng Cron Trigger (gói Free cho tối đa 5 cron mỗi tài khoản, dùng 1; mỗi lần tối đa 1.000 dòng mỗi bảng), để bảng không phình to:

| Dữ liệu kỹ thuật | Giữ | Sau đó |
|---|---|---|
| `login_attempts` | 7 ngày | xoá |
| `auth_sessions` hết hạn hoặc đã thu hồi | 30 ngày | xoá |
| mã mời, mã đăng nhập máy mới hết hạn (prompt 03) | 30 ngày | xoá |
| `ai_calls` (chỉ độ trễ, lỗi; không có nội dung) | 90 ngày | xoá |

   - **Dữ liệu của người dùng** (đề bài, nội dung AI trả lời, dòng thời gian buổi học, nhật ký phạm vi, link báo cáo, kết quả bài cô giao, khảo sát NPS) và `audit_log`: **giữ nguyên, không tự xoá**. Link báo cáo hết hạn vẫn ngừng mở được, chỉ là bản ghi chưa bị xoá.
   - Chuẩn bị sẵn công tắc **"Tự dọn dữ liệu cũ của người dùng"** trong admin (prompt 05, tab [8] Hạ tầng), **mặc định tắt**. Khi admin bật, mới áp dụng thời hạn gợi ý: đề bài và nội dung AI 180 ngày (giữ lại số liệu), dòng thời gian buổi học 12 tháng, nhật ký phạm vi 180 ngày, link báo cáo hết hạn 30 ngày, kết quả bài cô giao 12 tháng, NPS 24 tháng. Bật hoặc tắt đều ghi `audit_log`.
   - **Chỉ xoá theo yêu cầu của chính người dùng:** phụ huynh bấm "Xoá toàn bộ dữ liệu" (`DELETE /family`, xoá dây chuyền), hoặc chọn "Xoá kết quả cũ" khi rời lớp (prompt 04). Không có tiến trình nào khác được xoá dữ liệu người dùng.

### Quy tắc khi chạy trên gói Free (bắt buộc cho mọi prompt 00 đến 06)
Dự án dùng gói Cloudflare Free. Giới hạn dưới đây là số liệu công bố của Cloudflare tại thời điểm viết; **kiểm tra lại trang limits của Workers, D1, Workers AI** trước khi làm và ghi số thực tế vào báo cáo.

| Giới hạn (gói Free) | Mức | Cách thiết kế để không vượt |
|---|---|---|
| CPU mỗi request của Worker | 10 ms | Không tính toán nặng trong worker: thống kê, phân vị, đếm làm bằng SQL; không băm chậm (mục 2); thời gian chờ gọi AI không tính vào CPU |
| Số request Worker mỗi ngày | 100.000 | App gom request: cấu hình tải 1 lần rồi cache 10 phút; đồng bộ state tối thiểu cách nhau 10 giây |
| Truy vấn D1 mỗi lần gọi Worker | 50 | Mỗi endpoint dùng ít truy vấn, gộp bằng `db.batch()`, phân trang; việc hàng loạt (backfill, dọn dữ liệu) chạy theo lô |
| Dòng ghi D1 mỗi ngày | 100.000 | `session_events` gửi gộp (app giữ trong bộ nhớ, gửi kèm `PATCH /sessions` khi xong bậc hoặc xong bài, không gửi từng sự kiện); `last_seen_at` tối đa 1 lần/giờ; `login_attempts` chỉ ghi lần sai |
| Dòng đọc D1 mỗi ngày | 5 triệu | Có chỉ mục cho các cột lọc (`family_id`, `started_at`, `child_id`, `class_id`); số liệu Tổng quan admin cache 5 phút trong `_kv_store` |
| Dung lượng mỗi database D1 | 500 MB | Không lưu ảnh; dọn dữ liệu kỹ thuật (mục 10); admin theo dõi dung lượng, cảnh báo ở 70%, khi gần đầy mới cân nhắc bật "Tự dọn dữ liệu cũ của người dùng" |
| D1 Time Travel (khôi phục) | 7 ngày | Ghi đúng "7 ngày" ở admin; trước mỗi lần chạy migration, xuất bản sao bằng `wrangler d1 export` |
| Workers AI | 10.000 neuron/ngày | Bộ chặn lộ đáp án (prompt 05) chỉ gọi lại AI **tối đa 1 lần**; bài cô giao soạn 1 lần cho cả lớp (prompt 04); admin thấy số lượt gọi AI hôm nay |

- Báo cáo khi xong: ước tính số request, dòng ghi và neuron AI mỗi ngày cho 100 gia đình dùng mỗi tối, so với giới hạn trên.

### Giai đoạn B: chuyển app sang API mới
- App gia đình: đăng ký, đăng nhập, đồng bộ state, gửi góp ý đều dùng `/api/v1`. Người dùng đang đăng nhập kiểu cũ (`kem-con-hoc:session` có id nhưng chưa có token): hiện màn "Nhập lại mật khẩu một lần để bảo vệ dữ liệu", đăng nhập xong thì có token.
- Trang admin: màn đăng nhập email + mật khẩu (giao diện theo prompt 05). **Xoá các mã PIN viết cứng và dòng gợi ý PIN** khỏi code.
- Xoá các chuỗi tài liệu nội bộ đang nằm trong bundle (khoảng 40 KB markdown "Team Prompts" có URL worker phụ và tên thành viên) khỏi code phía trình duyệt; dữ liệu Team Prompts tải qua API admin.

### Giai đoạn C: khoá đường cũ (CHỈ làm khi chủ dự án xác nhận)
- Khi đã chắc không còn bản app cũ nào gọi: `/db/query`, `/db/execute`, `/db/kv/*` trả `410 Gone` cho mọi request không có token admin.
- **Không tự ý làm giai đoạn C.** Ghi rõ trong báo cáo: các app/trang nào còn gọi đường cũ (tìm trong code), để chủ dự án quyết.

### Không làm trong prompt này
- Không đổi giao diện app gia đình (trừ màn đăng nhập lại một lần).
- Không đổi prompt AI. `/chat`, `/vision/*`, `/stt` giữ nguyên dạng request/response, chỉ thêm 2 header không bắt buộc ở mục 8.
- Không đọc, in hay đưa vào code bất kỳ secret nào. Secret đặt bằng `wrangler secret put`.

### Kiểm thử bắt buộc
1. Gia đình cũ đăng nhập qua API mới được bằng mật khẩu cũ; app cũ vẫn đăng nhập được; gọi bất kỳ API nào cũng không nhận được `salt` hay `pass_hash`. Mỗi request đăng nhập dùng dưới 10 ms CPU (xem log `cpuTime` của Worker).
2. Token gia đình A gọi `GET /family/state` chỉ ra dữ liệu A; đổi `familyId` trong request không đọc được B (trả 403).
3. Hai thiết bị cùng gia đình sửa state gần như cùng lúc: thiết bị chậm hơn nhận 409 và app gộp không mất dữ liệu sticker.
4. Gọi `/api/v1/admin/families` không token: 401. Token `support` gọi lưu prompt: 403.
5. Login sai 5 lần: lần 6 bị chặn 15 phút.
6. Tìm trong `dist/` sau `npm run build`: không còn chuỗi PIN cũ, không còn URL worker phụ, không còn "Team Prompts" markdown.
7. App cũ (chưa cập nhật) vẫn chạy bình thường trong giai đoạn A và B.
8. `npm run build` thành công; test của worker (vitest hoặc miniflare) cho các endpoint mới đều qua.
9. Thành viên dò PIN: sai 5 lần thì khoá 15 phút trên **mọi máy**; người lạ nhập sai mật khẩu 5 lần không làm chủ nhà thật (IP khác) bị khoá.
10. `DELETE /family`: sau khi xoá, không còn bản ghi nào mang `family_id` đó ở mọi bảng (test đếm từng bảng).
11. Backfill chạy thử báo đúng số bản ghi; chạy thật không tạo bản trùng khi chạy lần 2.

### Báo lại khi xong
- Danh sách endpoint mới, bảng mới, file đã sửa.
- Kết quả 8 bước kiểm thử.
- Danh sách nơi còn gọi `/db/query`, `/db/execute`, `/db/kv` để quyết giai đoạn C.
