# Prompt 04 · Cổng Giáo viên: lớp học, giao bài, thông báo

**Cách dùng:** copy phần PROMPT gửi cho AI lập trình, kèm source app và worker.

**Phụ thuộc:** **cần prompt 00** (tài khoản ở máy chủ, token, `learning_sessions`), nên có prompt 03 (thành viên gia đình) để biết ai trong nhà đã đọc thông báo.

**Hiện trạng:** app chưa có gì liên quan giáo viên, lớp học, trường. Chỉ có "Team Prompts" là bảng nội bộ của đội phát triển, không liên quan.

**Vì sao đáng làm (gợi ý kể chuyện ở vòng chung kết):**
- Nỗi đau mở đầu của app là câu con nói **"Cô không dạy thế!"**.
- Khi cô giáo giao bài kèm ghi chú **"cách cô dạy"**, AI sẽ soạn câu hỏi gợi mở **đúng theo cách cô dạy ở lớp**, mẹ kèm con không còn lệch với cô.
- Cô thấy được **bé nào vướng ở bước nào** mà không cần chấm từng vở.

---

## PROMPT

Bạn là kỹ sư full-stack của app **Kèm Con Học** (React + Vite, Cloudflare Worker, D1). Xây **Cổng Giáo viên** để cô tạo lớp, kết nối học sinh (qua phụ huynh), giao bài tập kèm "cách cô dạy", gửi thông báo, và xem tổng hợp kết quả. Phụ huynh nhận bài ngay trong app và bắt đầu kèm con bằng một chạm.

### Nguyên tắc bắt buộc
1. **Phụ huynh là người kết nối con vào lớp** và ghi nhận đồng ý. Theo Điều 20 Nghị định 13/2023/NĐ-CP, xử lý dữ liệu của trẻ **từ đủ 7 tuổi cần cả sự đồng ý của trẻ** bên cạnh cha mẹ (phần lớn học sinh tiểu học đã đủ 7 tuổi). Màn kết nối có 2 ô: "Tôi đồng ý…" và "Con đã được giải thích và đồng ý". Luật Bảo vệ dữ liệu cá nhân 2025 có hiệu lực từ 1/1/2026: **cần người có chuyên môn pháp lý rà lại** câu chữ đồng ý và chính sách trước khi mở cho trường thật. Cô không tự thêm được tài khoản của trẻ.
2. **Cô chỉ thấy dữ liệu tối thiểu:**
   - Thấy: tên trong danh sách lớp (cô tự đặt), trạng thái làm bài, số bậc vướng, mức con tự đánh giá.
   - Không thấy: ảnh, nội dung chat với AI, sticker, dữ liệu gia đình khác, mật khẩu.
3. **AI vẫn không giải bài cho con.** Ghi chú của cô chỉ chỉnh **cách gợi mở**, không mở đáp án cho trẻ.
4. Thông báo là **một chiều** (cô gửi phụ huynh) ở bản đầu, để tránh phải kiểm duyệt chat. Phụ huynh chỉ bấm "Đã đọc", hoặc "Báo nội dung không phù hợp".

### 1. Dữ liệu (migration D1)
- `teachers (id TEXT PK, email TEXT UNIQUE, display_name, phone, school_name, province, grades TEXT, status TEXT CHECK(status IN ('pending','approved','rejected','suspended')), pass_hash, pass_salt, reviewed_by, reviewed_at, review_note, created_at, last_login_at)`
- `classes (id TEXT PK, teacher_id, name, school_name, grade INTEGER, school_year TEXT, join_code TEXT UNIQUE, status TEXT CHECK(status IN ('active','archived')), created_at)`
- `class_students (id TEXT PK, class_id, roster_name, claim_code TEXT UNIQUE NULL, family_id NULL, child_id NULL REFERENCES children(id), status TEXT CHECK(status IN ('invited','pending','active','rejected','left')), consent_at, child_consent_at, linked_by_member_id, reject_reason, created_at)`. `claim_code` dạng `XXX-XXX` (6 ký tự, bỏ 0/O, 1/I); mã lớp `join_code` 6 ký tự không có gạch, nên app nhận ra loại mã.
- `assignments (id TEXT PK, class_id, title, subject, due_at, status TEXT CHECK(status IN ('draft','published','closed')), created_at, published_at)`
- `assignment_items (id TEXT PK, assignment_id, position INTEGER, problem_text, problem_type, teacher_method_note, teacher_answer, ai_lesson_json TEXT, ai_lesson_status TEXT CHECK(ai_lesson_status IN ('none','draft','approved')), validator_json TEXT)`: `teacher_answer` chỉ hiện cho phụ huynh, không bao giờ cho trẻ và **không bao giờ đưa vào ngữ cảnh gửi AI** (p3, p4_chat).
- `assignment_results (id TEXT PK, item_id, class_student_id, session_id, status TEXT CHECK(status IN ('not_started','in_progress','done')), stuck_count, hint_level_max, teach_back_rating TEXT, completed_at, UNIQUE(item_id, class_student_id))`. `teach_back_rating` dùng thang `self/hint/guided` của prompt 00. **Worker tự ghi bảng này** từ `PATCH /sessions` của buổi có `assignment_item_id`, app không ghi trực tiếp.
- `announcements (id TEXT PK, class_id, title, body, pinned INTEGER, require_ack INTEGER, created_at)`, `announcement_reads (announcement_id, family_id, member_id, read_at, ack_at, PRIMARY KEY(announcement_id, family_id))`
- `content_reports (id, target_type, target_id, family_id, reason, created_at, status)`

### 2. Đăng ký và duyệt giáo viên
- Trang `/teacher/register`: họ tên, email, số điện thoại, trường, tỉnh/thành, khối dạy, mật khẩu (từ 8 ký tự), ô đồng ý điều khoản. Tạo `teachers.status = 'pending'`, màn "Đang chờ duyệt, thường trong 24 giờ".
- Bị từ chối: đăng nhập vẫn được, thấy lý do và nút "Sửa và gửi lại" (trạng thái về `pending`). Chưa có hạ tầng email nên **không gửi email**; cô biết kết quả khi đăng nhập lại (có thể thêm email sau).
- **Admin duyệt** ở mục "Giáo viên & Lớp học" của admin (giao diện theo prompt 05):
  - danh sách chờ duyệt;
  - Duyệt hoặc Từ chối (kèm lý do), Tạm khoá, Mở lại;
  - ghi `audit_log`.
  - Không yêu cầu tải ảnh giấy tờ (tránh giữ dữ liệu nhạy cảm); admin xác minh qua điện thoại hoặc email trường.
- Đăng nhập `/teacher/login` (email + mật khẩu; phiên lưu trong `auth_sessions` với `subject_type = 'teacher'`, hạn 30 ngày; giới hạn sai theo prompt 00). Endpoint dưới `/api/v1/teacher/*` chỉ cho `approved` (trừ xem và sửa hồ sơ đăng ký của chính mình).
- **Giao diện cổng giáo viên:** cố định phong cách "Bento Mềm" của prompt 01 (màu sáng, gọn) với chữ **Be Vietnam Pro**, không cho đổi theme. Trang chủ `/teacher` là danh sách lớp của cô (tên lớp, số học sinh đã kết nối, bài đang mở, yêu cầu chờ duyệt) và nút "+ Tạo lớp".

### 3. Lớp học và học sinh
- Cô tạo lớp: tên (ví dụ "3A"), trường, khối, năm học "2026-2027". Hệ thống sinh `join_code` 6 ký tự và QR.
- **Hai cách thêm học sinh** (đáp ứng yêu cầu "cô add học sinh vào"):
  1. **Mã lớp chung:**
     - Cô gửi mã lớp vào nhóm Zalo phụ huynh của lớp (nút "Gửi qua Zalo" dùng `navigator.share`).
     - Phụ huynh nhập mã, chọn con, gõ tên con trong danh sách lớp, rồi đánh dấu đồng ý.
     - Bản ghi ở trạng thái `pending`, cô bấm Duyệt thì thành `active`.
  2. **Danh sách lớp có sẵn:**
     - Cô dán danh sách tên (mỗi dòng một học sinh) hoặc nhập tay. Mỗi em được một `claim_code` riêng.
     - Cô gửi từng mã cho đúng phụ huynh (in phiếu hoặc nhắn riêng).
     - Phụ huynh nhập mã, chọn con, đánh dấu đồng ý: thành `active` luôn, không cần cô duyệt lại.
- Phía phụ huynh: tab "Con tôi" → **"🏫 Lớp học của con"**: nhập mã, chọn con, 2 ô đồng ý (của phụ huynh và của con, xem nguyên tắc 1), danh sách lớp đã kết nối, nút "Rời lớp" (thành `left`, cô không còn thấy kết quả mới; có ô tuỳ chọn "Xoá kết quả cũ của con ở lớp này").
- Cô từ chối yêu cầu: trạng thái `rejected`, phụ huynh thấy lý do (nếu có) và có thể gửi lại.
- Một trẻ vào được nhiều lớp (lớp chính, lớp tiếng Anh).

### 4. Giao bài
- Màn soạn bài của cô:
  - tiêu đề, môn, hạn nộp;
  - danh sách câu, mỗi câu gồm: đề (gõ, hoặc chụp phiếu rồi đọc chữ bằng `/vision/analyze` để cô sửa lại), dạng bài (gợi ý tự động, cô chỉnh được), **"Cách cô dạy ở lớp"** (ví dụ "Lớp mình vẽ sơ đồ đoạn thẳng, chưa dùng phép nhân"), đáp án cho phụ huynh (tuỳ chọn).
  - Lưu nháp, Xem trước như phụ huynh, Giao bài.
- **Đưa "cách cô dạy" vào AI:**
  - Thêm prompt phụ `p3c_teacher_note` vào Prompt Studio, biến `{{ghi_chu_giao_vien}}`, nội dung gợi ý: "Cô giáo của con dặn: {{ghi_chu_giao_vien}}. Hãy gợi mở theo đúng cách này, không dùng phương pháp khác nếu cô đã nói chưa học."
  - p3_explain nhận thêm **một** biến `{{khung_giao_vien}}` = nội dung `p3c_teacher_note` đã điền (rỗng khi không có). p3 không nhận trực tiếp `{{ghi_chu_giao_vien}}`.
  - **Luật ưu tiên:** khi ghi chú của cô khác đoạn phương pháp router chọn (`{{doan_phuong_phap}}`), làm theo cô. Ghi câu này vào p3c.
  - Cập nhật danh sách biến bắt buộc và bàn thử trong Prompt Studio.
- **AI soạn bài giảng một lần, cô xem trước, cả lớp dùng chung:**
  - Khi cô bấm "Xem trước" hoặc "Giao bài", worker gọi p3 **một lần cho mỗi câu** (`POST /api/v1/teacher/assignment-items/{id}/generate`), chạy bộ kiểm định lộ đáp án (prompt 05) và lưu `ai_lesson_json` ở trạng thái `draft`.
  - Màn "Xem trước" hiện các bậc câu hỏi, gợi ý 2 mức đúng như phụ huynh sẽ thấy; cô bấm "Soạn lại" nếu chưa ưng, hoặc "Dùng bài giảng này" (`approved`). Giao bài khi mọi câu đã `approved`.
  - Mọi gia đình trong lớp dùng chung bài giảng này, nên **"bậc 2" là cùng một câu hỏi cho cả lớp** và thống kê "bậc hay vướng nhất" mới có nghĩa; lộ đáp án bị chặn trước khi tới trẻ; tốn ít lượt gọi AI hơn.
  - Phụ huynh vẫn dùng được "Hạ độ khó" (prompt 06) và "Hỏi thêm AI"; các lần gọi thêm đó là của riêng gia đình, không làm đổi thống kê lớp.
- Ảnh phiếu bài của cô: chỉ dùng để đọc chữ, **không lưu**.

### 5. Phụ huynh nhận bài
- Màn chính: thẻ **"📚 Cô Hạnh giao 2 bài · hạn thứ Năm"** nằm trên các cách nhập đề.
- Bấm vào: danh sách câu, trạng thái từng câu. Bấm "Kèm con làm câu này":
  - **bỏ qua bước chụp và kiểm tra phạm vi** (đề do cô soạn);
  - mở thẳng màn "Trước khi giảng" với nhãn "Theo cách cô Hạnh dạy";
  - `learning_sessions.source = 'teacher'`, có `assignment_id`.
- Bài giảng lấy từ `ai_lesson_json` đã được cô duyệt (không gọi p3 lại).
- Xong bài (màn Done): app gửi `PATCH /sessions` như mọi buổi, worker tự ghi `assignment_results`. Có thêm dòng "Kết quả đã gửi cô (chỉ trạng thái, không gửi bài làm)".
- **Hộp thông báo của lớp:** chuông trên màn chính có số chưa đọc. Bấm vào thì đánh dấu đã đọc; thông báo cần xác nhận thì có nút "Đã đọc".

### 6. Bảng điều khiển của cô (`/teacher`, ưu tiên điện thoại)
- **Trang lớp:** số học sinh đã kết nối / tổng, bài đang mở, thông báo gần đây.
- **Mỗi bài:**
  - tỉ lệ hoàn thành;
  - với từng câu: phân bố mức tự làm (tự làm được / cần gợi ý / mẹ hướng dẫn nhiều) và **"bậc hay vướng nhất"** (đếm sự kiện `stuck` theo `step` trong `session_events` của prompt 00; vì cả lớp dùng chung bài giảng nên các bậc so được với nhau);
  - danh sách học sinh với trạng thái màu: Đã làm, Cần gợi ý nhiều, Chưa làm.
- **"Nhận xét của trợ lý cho cô"** (prompt mới `p8_class_insight`):
  - chỉ gửi số liệu tổng hợp, **không gửi tên trẻ**;
  - trả 3 ý: chỗ cả lớp vướng, gợi ý cách giảng lại ngày mai, bé nào nên hỏi thăm (dùng mã trong danh sách, app tự ghép tên ở máy cô).
- **Thông báo:** soạn tiêu đề, nội dung, ghim, yêu cầu xác nhận; xem ai đã đọc / chưa đọc.
- Kết thúc năm học: "Lưu trữ lớp" (thành `archived`, chỉ xem). Kết quả bài tập **không tự xoá** (prompt 00, mục 10); phụ huynh xoá được khi rời lớp.

### 7. Admin (mục "Giáo viên & Lớp học", giao diện theo prompt 05)
- Danh sách giáo viên theo trạng thái, nút duyệt/từ chối/khoá; số lớp, số học sinh, số bài đã giao.
- Danh sách lớp (trường, khối, số học sinh), xem chi tiết chỉ đọc.
- Hàng đợi **báo cáo nội dung** từ phụ huynh: xem thông báo bị báo cáo, ẩn thông báo, khoá giáo viên.

### 7b. Ba tầng cấu hình và trang "Cài đặt của cô"
**Ba tầng, không lẫn vào nhau:**

| Tầng | Ở đâu | Số lượng | Cấu hình gì | Không được |
|---|---|---|---|---|
| **Hệ thống** | `/admin` (prompt 05) | **một** cho toàn app, nhiều tài khoản admin dùng chung | prompt, router sư phạm, luật phạm vi, giao diện app, duyệt giáo viên, quản trị viên | |
| **Giáo viên** | `/teacher/cai-dat` | **mỗi cô một bản riêng**, chỉ thấy dữ liệu của mình | hồ sơ, thư viện "cách cô dạy", cài đặt từng lớp | sửa prompt, router, luật an toàn; xem lớp của cô khác; vào `/admin` |
| **Gia đình** | tab "Con tôi" (prompt 01, 03) | mỗi nhà một bản | giao diện, giọng điệu, thành viên, lớp học của con | |

**Trang "Cài đặt của cô"** (menu tài khoản ở góc phải cổng giáo viên):
1. **Hồ sơ:** họ tên, trường, tỉnh/thành, khối dạy, số điện thoại; đổi mật khẩu; đăng xuất mọi máy. Đổi trường thì phải admin duyệt lại.
2. **Thư viện "Cách cô dạy"** (dùng lại khi soạn bài, khỏi gõ lại):
   - mỗi mục: dạng bài (chọn từ danh sách dạng bài của router), tên ngắn, nội dung tối đa 300 ký tự (ví dụ "Toán lời văn 2 bước: vẽ sơ đồ đoạn thẳng, chưa dùng phép nhân");
   - ở màn soạn bài, ô "Cách cô dạy ở lớp" tự gợi ý mục cùng dạng bài; cô chọn rồi sửa riêng cho câu đó được;
   - nội dung này chỉ đi vào `{{khung_giao_vien}}` qua `p3c_teacher_note`; bộ chặn lộ đáp án (prompt 05) vẫn chạy; câu nào yêu cầu AI đưa đáp án cho trẻ thì bị bỏ qua (luật trong p3c).
3. **Cài đặt từng lớp** (cũng mở được từ trang lớp):
   - cách vào lớp: "Mã lớp chung + mã riêng" hoặc "Chỉ mã riêng" (lớp đã có danh sách thì nên tắt mã lớp chung); tạo lại mã lớp (mã cũ hết hiệu lực);
   - hạn nộp mặc định khi giao bài: hôm sau / 2 ngày / cuối tuần;
   - có gửi "đáp án của cô" cho phụ huynh hay không (mặc định có, phụ huynh vẫn phải giữ 1,5 giây mới thấy);
   - lưu trữ lớp cuối năm.
- Dữ liệu: bảng `teacher_method_notes (id TEXT PK, teacher_id, problem_type, title, note TEXT, created_at, updated_at)`; thêm cột cho `classes`: `join_mode TEXT CHECK(join_mode IN ('code_and_claim','claim_only')) DEFAULT 'code_and_claim'`, `default_due_days INTEGER DEFAULT 1`, `share_teacher_answer INTEGER DEFAULT 1`.
- Mọi endpoint giáo viên **lọc theo `teacher_id` của phiên**: cô A gọi lớp, bài, ghi chú của cô B đều trả 404.

### 8. Danh sách endpoint (đều dưới `/api/v1`)
- **Giáo viên:**
  - `POST /teacher/auth/register`, `POST /teacher/auth/login`, `GET/PATCH /teacher/me`, `POST /teacher/me/password`, `POST /teacher/me/logout-all`
  - `GET/POST /teacher/method-notes`, `PATCH/DELETE /teacher/method-notes/{id}`
  - `PATCH /teacher/classes/{id}/settings {joinMode, defaultDueDays, shareTeacherAnswer}`, `POST /teacher/classes/{id}/rotate-code`
  - `GET/POST /teacher/classes`, `GET/PATCH /teacher/classes/{id}`, `POST /teacher/classes/{id}/archive`
  - `POST /teacher/classes/{id}/roster` (dán danh sách, trả mã riêng), `GET /teacher/classes/{id}/students`
  - `POST /teacher/class-students/{id}/approve`, `POST /teacher/class-students/{id}/reject {reason?}`
  - `GET/POST /teacher/classes/{id}/assignments`, `GET/PATCH /teacher/assignments/{id}`, `POST /teacher/assignments/{id}/publish`, `POST /teacher/assignments/{id}/close`
  - `POST /teacher/assignment-items/{id}/generate`, `POST /teacher/assignment-items/{id}/approve`
  - `GET /teacher/assignments/{id}/results`, `POST /teacher/assignments/{id}/insight` (gọi `p8_class_insight`)
  - `GET/POST /teacher/classes/{id}/announcements`, `GET /teacher/announcements/{id}/reads`
- **Phụ huynh** (token gia đình, quyền theo ma trận của prompt 03):
  - `POST /family/classes/join {code, childId, rosterName, consent, childConsent}`, `GET /family/classes`, `DELETE /family/classes/{classStudentId}?deleteResults=1`
  - `GET /family/assignments` (bài đang mở của các con), `GET /family/assignments/{id}`
  - `GET /family/announcements`, `POST /family/announcements/{id}/read`, `POST /family/announcements/{id}/ack`
  - `POST /family/content-reports {targetType, targetId, reason}`
- **Admin** (prompt 05): `GET /admin/teachers?status=`, `POST /admin/teachers/{id}/approve`, `POST /admin/teachers/{id}/reject {reason}`, `POST /admin/teachers/{id}/suspend`, `GET /admin/classes`, `GET/PATCH /admin/content-reports`.

### Để sau (ghi vào báo cáo)
- Nhắn tin hai chiều cô và phụ huynh.
- Web Push / Zalo ZNS báo có bài mới.
- Chấm điểm, sổ điểm.
- Liên kết nhiều giáo viên cùng một lớp.

### Không làm trong prompt này
- Không cho cô xem ảnh, lời giải của trẻ, nội dung chat AI.
- Không cho trẻ đăng nhập riêng.
- Không làm thanh toán hay gói cước.

### Kiểm thử bắt buộc
1. Cô đăng ký, chưa duyệt: gọi API giáo viên bị 403. Admin duyệt: vào được `/teacher`.
2. Cô tạo lớp 3A; phụ huynh A nhập mã lớp, chọn con, đồng ý; cô duyệt: con của A vào danh sách.
3. Cô dán danh sách 5 tên, gửi mã riêng cho phụ huynh B; B nhập mã: vào lớp ngay, đúng tên.
4. Cô giao bài 2 câu, câu 1 có "cách cô dạy: vẽ sơ đồ đoạn thẳng, chưa dùng phép nhân". Ở "Xem trước", bài giảng AI soạn dùng sơ đồ đoạn thẳng và **không có phép nhân**; không bậc nào lộ đáp án; cô bấm "Soạn lại" thì ra bản mới. Phụ huynh A và B thấy **cùng** bài giảng đã duyệt.
4b. `teacher_answer` không xuất hiện trong bất kỳ payload nào gửi `/chat` (kiểm tra Network khi xem trước và khi phụ huynh hỏi thêm AI).
4c. Cô A gọi API lớp, bài, ghi chú của cô B: 404. Cô không mở được `/admin`. Lớp đặt "Chỉ mã riêng": nhập mã lớp chung bị từ chối, mã riêng vẫn vào được.
4d. Lưu mục "cách cô dạy" cho dạng "Toán lời văn 2 bước", soạn câu cùng dạng: ô ghi chú tự gợi ý mục đó.
5. Phụ huynh A xong câu 1: bảng của cô cập nhật tỉ lệ hoàn thành và mức tự làm; cô không truy cập được `ai_output_json` hay ảnh (thử gọi API: 403).
6. Phụ huynh A bấm "Rời lớp": kết quả mới không còn gửi cô.
7. Thông báo cần xác nhận: số "đã đọc" của cô tăng khi phụ huynh bấm "Đã đọc".
8. `p8_class_insight` không nhận tên trẻ (kiểm tra payload gửi `/chat`).
9. `npm run build` thành công; test endpoint giáo viên, phân quyền và hàm tính "bậc hay vướng" đều qua.

### Báo lại khi xong
- Bảng, endpoint, route mới; prompt mới thêm vào Prompt Studio.
- Ảnh các màn: đăng ký, lớp, soạn bài, bảng kết quả của cô, thẻ bài cô giao ở app phụ huynh.
- Kết quả 9 bước kiểm thử.
