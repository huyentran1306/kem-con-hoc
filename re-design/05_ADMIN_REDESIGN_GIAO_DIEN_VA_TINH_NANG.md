# Prompt 05 · Làm lại trang Admin theo thiết kế Stitch (giao diện + tính năng)

**Cách dùng:** copy phần PROMPT gửi cho AI lập trình, kèm:
- source app (trang admin nằm trong `Admin.jsx`, `PromptStudio.jsx`, `admin.css`);
- source worker;
- thư mục thiết kế `tham-khao/stitch-admin/` (bản Stitch gốc: 11 màn, mỗi màn có `code.html` và `screen.png`, 2 file `DESIGN.md`);
- `UI-VA-THAO-TAC.html` phần 05 (bản vẽ admin bản Gấu đã chốt, có thao tác từng màn): khi bản Stitch và bản vẽ này khác nhau, **làm theo bản vẽ và prompt này**.

**Phụ thuộc:** **cần prompt 00** (đăng nhập admin ở máy chủ, `learning_sessions`, `ai_calls`, `audit_log`). Các mục "Luật phạm vi" (prompt 02), "Giao diện app" (prompt 01), "Giáo viên & Lớp học" (prompt 04), "Thành viên gia đình" (prompt 03) cắm vào khung admin này khi các prompt đó xong; trước đó hiện trạng thái "Sắp có".

**Bộ thiết kế có gì:** 2 phong cách cho cùng các màn:
- **Xanh dương:** bàn điều hành, nhiều bảng và số liệu, theo `k_m_con_h_c_admin/DESIGN.md`.
- **Cute (Warm Sprout):** ấm áp, nhiều mascot, theo `warm_sprout_kindergarten_primary_learning_hub/DESIGN.md`.

**Đã chốt (24/10):** admin dùng **bản "Gấu"**, tức phong cách cute có mascot gấu, đồng bộ với bộ giao diện "Bạn Gấu" của app phụ huynh (prompt 01). Bản xanh dương giữ làm tuỳ chọn, chỉ khác bảng màu. **Bố cục, bảng, bộ lọc, ngăn kéo lấy theo các màn xanh dương** (rõ số liệu hơn); **màu, chữ, hình dạng, mascot lấy theo bản gấu**.

Các màn gồm: Xác thực PIN, Tổng quan, Gia đình & Học sinh, Nhật ký kèm học & Chất lượng AI, Cấu hình AI, và một màn Báo cáo gia đình (màu hồng, chưa có trong menu).

**Những điểm trong thiết kế KHÔNG được làm theo** (đã rà kỹ, sửa khi đưa vào app):
1. Mã PIN **1102 hiện rõ** ở nhiều màn ("Mở Cửa Góc Học Vui (1102)", "Mã PIN 1102 hợp lệ", "Mã PIN khẩn cấp hiện tại 1 1 0 2") và viết cứng trong JavaScript. Màn PIN còn hiện cả menu, tiến độ của trẻ, IP **trước khi** đăng nhập.
2. Vài chỗ **AI đưa đáp án**, trái nguyên tắc cốt lõi của app:
   - "tìm ra **đáp án số 4**";
   - bước 3 nêu thương và số dư;
   - "không in đáp án **ở 2 lần hỏi đầu**";
   - system prompt mẫu nói chuyện trực tiếp với trẻ.
   App thật: **AI hướng dẫn bố mẹ, không bao giờ đưa đáp án trong câu hỏi cho con**.
3. Các tính năng **không có trong sản phẩm**: gói cước (Kim Cương, Trải Nghiệm 14 ngày), gia hạn, nhiều chi nhánh ("Hà Nội - Ba Đình 01"), số điện thoại phụ huynh, PIN của trẻ và SMS OTP, thu âm giọng bố mẹ, Telegram 2FA, "Khen ZNS".
4. Các **cam kết chưa có căn cứ**: "COPPA", "Đạt Tiêu Chuẩn Sư Phạm Quốc Gia #TL-09", "Chứng nhận Viện Sư Phạm", "chuẩn Bộ GD&ĐT", "100%", "0 lỗi", "Tuyệt đối an toàn".
5. Số liệu mẫu tự mâu thuẫn giữa các màn, ngày tháng năm 2024, ảnh đại diện và logo là link tạm của Stitch (`lh3.googleusercontent.com/aida-public/...`), màn Báo cáo pha màu hồng với biểu đồ xanh.

---

## PROMPT

Bạn là kỹ sư frontend + backend của app **Kèm Con Học**. Làm lại toàn bộ **trang Admin** (`/admin`) theo bộ thiết kế Stitch, **bản "Gấu" (ấm áp, mascot gấu) làm mặc định**, bố cục theo các màn xanh dương, có tuỳ chọn bảng màu "Xanh dương" ở bước 9. Mọi số liệu phải lấy từ dữ liệu thật qua API; **không có số mẫu, không có huy hiệu trang trí giả** (bản hiện tại có "+100% Active", thẻ phẩm chất viết cứng số liệu, phân tích AI chạy trên dữ liệu bịa: bỏ hết).

### Hiện trạng admin cần thay
- Đăng nhập bằng PIN 4 số kiểm tra trên trình duyệt, có dòng gợi ý PIN.
- 5 tab:
  1. Quản lý Gia đình & Tài khoản: bảng, tìm, lọc khối, đặt lại mật khẩu, đổi tên, xoá.
  2. Phân tích & Thống kê Khối Lớp.
  3. D1 SQL Studio.
  4. Prompt Studio: 8 prompt, bàn thử, lịch sử, tab Tham số AI & Router Sư phạm.
  5. Team Prompts Sync.
- Nút Xuất JSON, Làm mới. Giao diện dùng nhiều style inline, font Plus Jakarta Sans.

### 1. Hệ thống thiết kế: bản "Gấu" (gộp `warm_sprout.../DESIGN.md` với bộ "Bạn Gấu" của app)
- Biến CSS trong `admin.css`, đặt dưới `[data-admin-theme="bear"]` (mặc định) và `[data-admin-theme="blue"]` (bước 9). Không dùng Tailwind Play CDN trong production; nếu muốn Tailwind thì cài qua PostCSS build và chỉ áp cho `/admin`.
  - **Màu:**
    - nền `#FFF8EC`, nền phụ `#FFF1D6`; thẻ `#FFFFFF`, viền `#F0DDC2`;
    - chữ đậm `#4B3621`, chữ phụ `#8A6A4A`, chữ trong bảng `#5A4330`;
    - **mật ong** `#F6A623` làm nền nút chính (chữ trên nút `#4B3621`, viền đáy `#C47F0E`); **chữ nhấn và link dùng `#9A5B00`**, không dùng vàng làm màu chữ trên nền trắng (không đủ tương phản);
    - dâu `#FB7185` (nền nhạt `#FFF1F2`, chữ `#BE123C`); bạc hà `#10B981` (nền nhạt `#ECFDF5`, chữ `#047857`); trời `#7FB7F5` (nền nhạt `#EFF6FF`, chữ `#1D4ED8`); lỗi `#DC2626`.
    - Biểu đồ: dùng lần lượt mật ong, trời, bạc hà, dâu, oải hương `#A78BFA`; kiểm tra phân biệt được với người mù màu.
  - **Chữ:** tiêu đề **Mitr** (giống bộ "Bạn Gấu" của app), thân **Nunito** từ 600 trở lên. Thang chữ:
    - tiêu đề trang 28/36 700; tiêu đề thẻ 18/26 600; số KPI 30/36 700;
    - thân 14/22; nhãn 12/16 700 chữ hoa giãn 0,04em;
    - số dùng `font-variant-numeric: tabular-nums`. Kiểm tra cả 2 font có đủ dấu tiếng Việt.
  - **Hình dạng:**
    - thẻ bo 24px; ô nhập bo 16px, viền 2px `#F0DDC2`, khi chọn thì viền `#F6A623` và vòng `0 0 0 4px rgba(246,166,35,.2)`;
    - nút chính tròn hẳn, viền đáy 4px `#C47F0E`, bấm thì lún 2px; nút phụ nền `#FFF1D6`, chữ `#9A5B00`;
    - chip tròn hẳn; ô PIN bo 18px.
  - **Đổ bóng:** thẻ có "đáy" `0 6px 0 #F0DDC2` cộng bóng mềm `0 10px 24px -12px rgba(75,54,33,.18)`; hộp thoại có nền `rgba(75,54,33,.35)` mờ 4px.
- **Mascot gấu:**
  - dùng chung SVG gấu với bộ "Bạn Gấu" của app (prompt 01), 4 trạng thái: **chào** (màn đăng nhập, lời chào Tổng quan), **giữ khoá** (màn PIN), **tìm kiếm** (trạng thái trống), **vui** (lưu thành công);
  - **chỉ xuất hiện** ở các chỗ trên. Không đặt mascot hay emoji trong ô bảng, trong biểu đồ, trong nhãn số liệu.
- **Emoji:** chỉ dùng ở lời chào và tiêu đề nhóm; số liệu và bảng giữ sạch.
- **Icon:** Material Symbols Outlined (chỉ tải một lần; thiết kế đang tải 2 đến 3 lần mỗi trang), độ dày 500, góc tròn.
- **Huy hiệu trạng thái** (nền / chữ / viền):
  - Đang học `#EFF6FF / #1D4ED8 / #BFDBFE`
  - Hoàn thành `#ECFDF5 / #047857 / #A7F3D0`
  - Cần chú ý `#FFF1D6 / #9A5B00 / #F6C56A`
  - Lỗi / vi phạm `#FFF1F2 / #BE123C / #FECDD3`
- **Logo:** dùng logo thật của app (thay link ảnh tạm). Không dùng ảnh đại diện người thật; dùng avatar chữ cái đầu nền mật ong nhạt.

### 2. Khung trang
- **Sidebar 256px** (thu thành thanh dưới khi màn nhỏ hơn 1024px):
  - logo "Kèm Con Học / Quản trị";
  - menu: **Tổng quan**, **Gia đình & Học sinh**, **Nhật ký kèm học**, **Báo cáo**, **Giáo viên & Lớp học**, **Cấu hình AI & Hệ thống**, **Công cụ nội bộ**;
  - mục đang chọn có vạch trái 4px `#F6A623`, nền `#FFF1D6`, chữ đậm `#4B3621`;
  - thẻ nhỏ cuối menu "Gấu nhắc hôm nay" (mascot + 1 việc cần làm thật, ví dụ "3 giáo viên đang chờ duyệt"); ẩn khi không có việc;
  - chân sidebar:
    - trạng thái AI thật: "AI: Hoạt động · 1.2s", là độ trễ trung vị 15 phút gần nhất từ `ai_calls`; đỏ nếu tỉ lệ lỗi trên 10%;
    - tên và vai trò admin đang đăng nhập;
    - nút "Khoá" và "Đăng xuất".
- **Header 64px:**
  - ô tìm toàn cục "Tìm gia đình, tên gọi của con, mã buổi học…";
  - đồng hồ "Giờ VN (GMT+7)";
  - chuông, hiện số việc chờ: giáo viên chờ duyệt, báo cáo nội dung, góp ý "Giảng chưa đúng" mới.
- **Bỏ** "Trung tâm đang xem" và nút "Thêm gia đình mới" (sản phẩm không có chi nhánh, gia đình tự đăng ký).
- Mọi màn có đủ trạng thái **đang tải** (khung xương), **trống** (minh hoạ + câu hướng dẫn), **lỗi** (lời nhắn + "Thử lại").

### 3. Đăng nhập và khoá màn hình (bố cục màn 01 xanh dương, trang trí theo màn 00 cute)
- **Đăng nhập** bằng email + mật khẩu qua `POST /api/v1/admin/auth/login` (prompt 00). Không hiện menu, số liệu hay IP trước khi đăng nhập.
- **Admin mới:** superadmin tạo tài khoản (email, tên, vai trò) ở tab [6]; hệ thống sinh **mật khẩu tạm hiện một lần** để superadmin tự gửi; lần đăng nhập đầu bắt buộc đổi mật khẩu.
- **Khoá nhanh bằng PIN:**
  - Sau khi đăng nhập lần đầu, hiện màn "Đặt PIN để khoá nhanh" (nhập 2 lần), lưu băm ở máy chủ.
  - **Khoá ở máy chủ, không chỉ trên giao diện:** `POST /api/v1/admin/auth/lock` đặt `auth_sessions.locked_at`; khi phiên đang khoá, mọi API admin khác trả `423 Locked`; `POST /api/v1/admin/auth/unlock {pin}` mở khoá. Tự khoá do không thao tác cũng gọi `lock`.
  - Khi không thao tác quá **15 / 30 / 60 phút** (admin chọn) hoặc bấm "Khoá", hiện màn PIN như thiết kế:
    - mascot gấu "giữ khoá" phía trên, câu "Gấu đang giữ cửa. Nhập PIN để vào tiếp nhé";
    - các chấm tròn, bàn phím số 3x4 dạng nút tròn có viền đáy, gõ được bằng bàn phím;
    - nhập sai thì ô rung lên;
    - nút "Hiện số" chỉ hiện số **đang gõ**, không bao giờ hiện PIN đã lưu.
  - Sai 5 lần thì về màn đăng nhập email.
  - "Quên PIN" → đăng nhập lại bằng email và mật khẩu.

### 4. Tổng quan (gộp ý tốt của màn 02 xanh dương và màn 01 cute)
- Lời chào theo giờ, ngày hiện tại thật.
- Chọn khoảng thời gian: **Hôm nay | 7 ngày | 30 ngày**, so với kỳ trước.
- Câu "N buổi kèm đang diễn ra" ở lời chào: đếm buổi có `started_at` trong 30 phút gần nhất và chưa có `ended_at`.
- **4 thẻ KPI** (có mũi tên tăng/giảm so với kỳ trước):
  - Gia đình hoạt động: có buổi học trong kỳ, kèm "/ tổng gia đình";
  - Học sinh đang học;
  - Buổi kèm: kèm "phút trung bình/buổi";
  - **Tỉ lệ con tự làm được**: `teach_back_rating` = tự làm, trên số buổi có đánh giá.
- **Phân tích môn học & khung giờ vàng:**
  - thanh xếp chồng tỉ trọng môn (Toán, Tiếng Việt, Tiếng Anh, Khác);
  - biểu đồ cột số buổi theo giờ trong ngày, đánh dấu giờ cao điểm thật.
- **Chất lượng AI & hạ tầng** (từ `ai_calls` và bộ kiểm định ở mục 6):
  - độ trễ trung vị và p95 theo endpoint (`/chat`, `/vision`, `/stt`), tỉ lệ lỗi; SQLite không có hàm phân vị: tính p95 **bằng SQL** (`ORDER BY latency_ms LIMIT 1 OFFSET` 95% số dòng) chứ không kéo dữ liệu về worker (giới hạn CPU gói Free); kết quả cache 5 phút;
  - **số buổi bị cảnh báo lộ đáp án** (mục tiêu 0);
  - tỉ lệ góp ý "Giảng chưa đúng".
- **Ô việc cần xử lý** (thay ô "Cần mở khoá PIN khẩn cấp" của thiết kế): giáo viên chờ duyệt, báo cáo nội dung, góp ý mới, buổi học bị cảnh báo. Mỗi dòng có nút đi tới đúng màn.
- **Bảng "Buổi kèm gần nhất":**
  - tự làm mới mỗi 30 giây, có nút tạm dừng;
  - cột: Thời gian, Học sinh (tên gọi ở nhà, lớp), Người kèm (quan hệ, prompt 03), Môn & dạng bài, Phương pháp (luật router), Tiến độ (bậc xong / tổng, số lần bí), Tự đánh giá, nút Xem.
- **Bảng vinh danh chuỗi ngày** (ý của màn cute): top 5 chuỗi ngày học dài nhất, chỉ hiện tên gọi ở nhà và khối.

### 5. Gia đình & Học sinh (màn 03 xanh dương; tuỳ chọn hiển thị dạng thẻ như màn 02 cute)
- **4 ô tổng hợp:**
  - phân bố khối lớp (thanh xếp chồng Lớp 1 đến 5);
  - chuỗi ngày trung bình;
  - phút đồng hành trung bình mỗi tuần;
  - tỉ lệ gia đình mở app trong 7 ngày (từ `members.last_seen_at`).
- **Bộ lọc:**
  - tìm theo tên gia đình, tên gọi của con, mã gia đình;
  - chip khối;
  - trạng thái: Đang hoạt động (có buổi trong 7 ngày) / Ít hoạt động (8 đến 30 ngày) / Ngủ đông (hơn 30 ngày);
  - bộ sách; giao diện đang dùng (prompt 01);
  - sắp xếp theo mới nhất, chuỗi ngày, số buổi, tên.
  - Nút "Đặt lại bộ lọc".
- **Bảng** (có ô chọn nhiều dòng):
  - cột: Gia đình (avatar chữ cái, tên, mã rút gọn), Thành viên (Mẹ Lan, Bố Tuấn…), Các con (tên gọi, khối, sách), Chuỗi ngày, Buổi và phút 7 ngày, Lần cuối hoạt động, Trạng thái, Thao tác;
  - phân trang 10/25/50.
- **Ngăn kéo chi tiết** (mở từ bên phải):
  - tổng quan, các con, thành viên, 10 buổi gần nhất, báo cáo tuần thu nhỏ, lớp học đã kết nối (prompt 04), góp ý đã gửi;
  - thao tác: Đặt lại mật khẩu, Đổi tên, Thu hồi mọi phiên đăng nhập, Xoá gia đình (gõ lại tên để xác nhận). Mọi thao tác ghi `audit_log`.
- **Xuất CSV** các dòng đã chọn hoặc toàn bộ kết quả lọc. Không có cột số điện thoại (app không thu).

### 6. Nhật ký kèm học & Chất lượng AI (màn 04 xanh dương + ý của màn 03 cute)
- **Bộ kiểm định lộ đáp án, chạy ngay lúc AI trả lời** (thêm mới; ở worker, cho các request có header `X-Prompt-Id` là `p3_explain`, `p4_chat`, `p6_practice`; xem prompt 00 mục 8). Không chỉ ghi log sau khi trẻ đã thấy:
  - **Với p3** (schema thật: `dang_bai, giai_thich_cho_me, luu_y_khi_giang, cac_bac[{cau_hoi, dap_an_cho_me, goi_y{muc_1_do_vat, muc_2_hinh_ve}}], dap_an_cuoi_cho_me, con_day_lai_me, bai_anh_em{de, dap_an_cho_me}, tro_choi_5_phut, loi_khen, can_hoi_lai`):
    1. JSON hợp lệ, có 2 đến 4 bậc;
    2. **lộ đáp án:** số hoặc cụm từ của `dap_an_cuoi_cho_me` và của `dap_an_cho_me` từng bậc xuất hiện trong `cau_hoi` hoặc `goi_y` (những chỗ trẻ có thể nghe hoặc thấy). **Bỏ qua các số đã có sẵn trong đề** (ví dụ "8" trong "mỗi hộp 8 cây"), chỉ bắt số mới do AI tính ra;
    3. câu hỏi dưới 25 chữ;
    4. có `bai_anh_em`, `tro_choi_5_phut`, `con_day_lai_me`;
    5. lời khen không dùng "thông minh, giỏi quá";
    6. thời gian phản hồi dưới timeout.
  - **Với p4_chat và p6_practice:** kiểm tra mục 2 với đáp án cuối của bài đang học (lấy theo `X-Session-Id`). Riêng p6 thì đáp án của bài mới chỉ được nằm trong trường `answer` dành cho phụ huynh.
  - **Xử lý khi phát hiện lộ đáp án:** worker tự gọi lại AI **một lần** với câu nhắc chặt hơn ("Không được nêu kết quả … trong câu hỏi cho trẻ"). Vẫn lộ thì thay câu vi phạm bằng câu an toàn ("Con thử nói cách làm bước này nhé?"), trả về cho app kèm cờ `guarded: true`.
  - Kết quả lưu `learning_sessions.validator_json`: **Đạt** / **Cảnh báo** (lỗi 3 đến 6) / **Đã chặn** (lộ đáp án, đã sửa trước khi tới app) / **Lọt** (lộ đáp án mà không sửa được, mục tiêu luôn bằng 0).
- **4 thẻ KPI:**
  - Buổi trong kỳ;
  - Tỉ lệ đạt kiểm định;
  - **Lộ đáp án:** số buổi "Đã chặn" và số buổi "Lọt" (mục tiêu "Lọt" bằng 0);
  - Cần xem lại: vi phạm + góp ý "Giảng chưa đúng" + cảnh báo phạm vi bị bỏ qua.
- **Bộ lọc:** môn; khối; luật phương pháp (router); nguồn đề (ảnh, gõ, giọng nói, cô giao); tự đánh giá; kết quả kiểm định; "chỉ buổi cần xem lại"; tìm trong đề bài.
- **Bảng:**
  - cột: Thời gian, Học sinh & khối, Đề bài (rút gọn), Phương pháp, Tiến độ (bậc / bí / mức gợi ý cao nhất / số lần xem đáp án), Tự đánh giá, Kiểm định, nút Xem;
  - dòng vi phạm tô nền đỏ nhạt.
- **Ngăn kéo "Chi tiết buổi #mã":**
  - đề bài; luật router đã chọn;
  - từng bậc: câu hỏi cho con, gợi ý mức 1 và mức 2, **"Đáp án chỉ cho phụ huynh"** (nhãn rõ);
  - dòng thời gian sự kiện (bắt đầu, bí ở bậc 2, mở gợi ý mức 1, giữ xem đáp án, dạy lại, hoàn thành), đọc từ bảng `session_events` (prompt 00);
  - kết quả kiểm định; góp ý của phụ huynh nếu có.
  - Nút:
    - **"Lưu làm ví dụ mẫu"**: lưu vào KV `prompt_studio:examples`, thư viện ví dụ few-shot để chèn vào p3. Nút **mờ** với buổi có kết quả "Đã chặn" hoặc "Lọt";
    - **"Mở trong bàn thử"**: mở Prompt Studio với đề này;
    - "Đánh dấu đã xem".
- **Thẻ "Nguyên tắc vàng của AI"** (ý của màn cute, viết lại cho đúng):
  - Hỏi thay vì trả lời;
  - Đồ vật thật trước, hình vẽ sau, phép tính cuối;
  - Hướng dẫn bố mẹ, không làm bài hộ con;
  - Khen quá trình, không khen điểm.

### 7. Báo cáo (màn "Bảng điều khiển báo cáo gia đình", đổi sang bảng màu gấu cho đồng bộ; thiết kế gốc đang pha hồng với xanh)
- Khoảng thời gian: Tuần này | Tháng này | Tuỳ chỉnh.
- KPI: gia đình hoạt động, học sinh tích cực, phút kèm trung bình mỗi ngày, tỉ lệ duy trì (từ 3 buổi/tuần trở lên).
- **Chỉ số gắn kết gia đình:** biểu đồ vùng số buổi theo ngày, tách theo người kèm (Mẹ, Bố, Ông bà, khác; từ prompt 03).
- **Tiến độ theo môn & khối:** tỉ lệ "tự làm được" theo môn, theo khối.
- **Bản đồ nhiệt khung giờ** (thứ trong tuần x khung giờ), có tooltip số buổi.
- **Bảng nhóm gia đình** với 3 tab:
  - Chuỗi dài nhất;
  - Gia đình mới 7 ngày;
  - Cần hỗ trợ: nghỉ hơn 4 ngày, hoặc hơn 50% buổi "mẹ hướng dẫn nhiều".
- **Mức hài lòng (NPS)**, tính năng mới nhỏ:
  - sau mỗi 10 buổi hoàn thành, app phụ huynh hỏi một lần "Bạn sẵn lòng giới thiệu Kèm Con Học cho bạn bè đến mức nào? (0 đến 10)", kèm ô góp ý và chip chủ đề;
  - lưu bảng `nps_responses (id, family_id, member_id, score INTEGER CHECK(score BETWEEN 0 AND 10), tags TEXT, comment TEXT, created_at)` qua `POST /api/v1/nps`; bấm "Để sau" thì hỏi lại sau 5 buổi, bấm "Không hỏi nữa" thì thôi;
  - giao diện ở app phụ huynh: sheet nhỏ hiện ở màn "Xong bài" (sau khi đã nhận sticker), thang 0 đến 10 dạng 11 nút tròn, ô góp ý, chip chủ đề ("Con tự giác hơn", "Bớt cáu khi dạy con", "AI giảng dễ hiểu", "Còn chậm", "Còn sai");
  - admin xem điểm NPS, phân bố, chip phổ biến và góp ý gần nhất.
- Xuất CSV; nút "In / Lưu PDF" dùng trang in riêng (CSS `@media print`).
- **Bỏ** nút "Gửi báo cáo tuần cho phụ huynh" và "Khen ZNS" (chưa có Zalo OA). Thay bằng thống kê "số báo cáo tuần phụ huynh đã chia sẻ và số lượt mở" (prompt 03).

### 8. Cấu hình AI & Hệ thống (màn 05 xanh dương, làm đủ các tab)
- **[1] Mô hình & tham số:**
  - mô hình (chỉ bật những mô hình worker thực sự gọi được; còn lại hiện mờ "chưa kết nối");
  - thanh nhiệt độ 0,1 đến 1,0 (gợi ý 0,35); max tokens; timeout;
  - độ dài nhận xét tuần cho phụ huynh 100 / 150 / 250 chữ (đưa vào p7).
  - **"Không đưa đáp án cho con"** hiện là **luật khoá, không tắt được**, kèm số buổi bị kiểm định cảnh báo tuần này.
- **[2] Prompt Studio:**
  - chuyển toàn bộ Prompt Studio hiện có vào đây, giữ đủ tính năng;
  - lưu qua API (prompt 00), lịch sử phiên bản lưu ở máy chủ thay vì trình duyệt;
  - thêm thư viện "Ví dụ mẫu" (từ mục 6).
- **[3] Router sư phạm:** bảng luật hiện có (bật/tắt, sửa, xoá, thêm, kéo thả thứ tự), kèm số buổi đã dùng mỗi luật trong 30 ngày.
- **[4] Luật phạm vi ảnh & đề:** theo prompt 02.
- **[5] Giao diện app:** theo prompt 01 (bật/tắt bộ, chọn mặc định, thống kê sử dụng).
- **Quyền theo vai trò admin:**
  - `superadmin`: mọi thứ, gồm SQL Studio, quản lý admin, xoá gia đình.
  - `editor`: Prompt Studio, router, luật phạm vi, giao diện app, duyệt giáo viên, xem nội dung buổi học (đề, bài giảng AI).
  - `support`: xem danh sách và số liệu, đặt lại mật khẩu gia đình; **không xem nội dung buổi học** (đề bài và bài giảng hiện "Ẩn với vai trò hỗ trợ"), không sửa cấu hình.
- **[6] Quản trị viên & bảo mật:**
  - danh sách admin (vai trò superadmin / editor / support), mời admin mới, đổi vai trò, khoá;
  - thời gian tự khoá; đổi PIN của chính mình; lần đăng nhập gần nhất.
- **[7] Nhật ký thao tác:** bảng `audit_log` có lọc theo người, hành động, ngày.
- **[8] Hạ tầng:**
  - dung lượng D1 (lấy từ `meta.size_after` trong kết quả truy vấn D1; `PRAGMA page_count` có thể bị chặn), số khoá KV, phiên bản worker (biến môi trường), số lần gọi AI hôm nay;
  - dòng thông tin "D1 Time Travel: khôi phục được trong 7 ngày (gói Free)";
  - công tắc **"Tự dọn dữ liệu cũ của người dùng"**, **mặc định tắt** (prompt 00, mục 10): bên dưới hiện bảng thời hạn sẽ áp dụng khi bật; bấm bật phải xác nhận lại, chỉ `superadmin` được bật; ghi `audit_log`. Dọn dữ liệu kỹ thuật (lần đăng nhập sai, phiên hết hạn, mã hết hạn, log gọi AI) luôn chạy, hiện ngày chạy gần nhất;
  - so sánh với giới hạn gói Free (prompt 00): số lượt gọi AI hôm nay, số buổi học ghi hôm nay; cảnh báo vàng khi vượt 70%;
  - **không** làm nút "Sao lưu ngay" giả.
- **[9] Thông báo & Zalo:** chỉ hiện trạng thái "Chưa kết nối Zalo OA" và hướng dẫn điều kiện (OA xác thực, mẫu ZNS được duyệt). Không làm nút gửi.
- Thanh lưu dính cuối trang: "Có N thay đổi chưa lưu" + "Đặt lại" + "Lưu thay đổi". Lưu xong hiện "Đã lưu lúc HH:MM bởi {tên}".

### 9. Công cụ nội bộ và bảng màu "Xanh dương" (tuỳ chọn)
- **Công cụ nội bộ:** SQL Studio (chỉ superadmin, chỉ đọc, theo prompt 00; `PRAGMA` chỉ cho `table_info` và `index_list`), Team Prompts (tải qua API, không còn nằm trong bundle).
- **Bảng màu "Xanh dương"** (theo `k_m_con_h_c_admin/DESIGN.md`):
  - nút chuyển ở menu người dùng: "Giao diện quản trị: Gấu / Xanh dương", lưu `localStorage['kem-con-hoc:admin-theme']` (bản hiện tại đang xoá key này khi tải, bỏ đoạn xoá đó);
  - **màu:** nền `#F0F7FF`; thẻ `#FFFFFF`, viền `#E0F2FE`; chữ đậm `#0F172A`, chữ phụ `#64748B`; chính `#2563EB` (hover `#1D4ED8`); phụ `#0284C7`; bạc hà `#0D9488`; thành công `#059669`, cảnh báo `#D97706`, lỗi `#DC2626`;
  - **chữ:** Plus Jakarta Sans cho mọi cấp;
  - **hình dạng:** nút bo 8px, thẻ 16px, không có viền đáy; mascot gấu ẩn (thay bằng icon).
  - Chỉ đổi biến CSS, không đổi bố cục.

### Không làm trong prompt này
- Gói cước, chi nhánh, số điện thoại, PIN của trẻ, SMS OTP, thu âm giọng nói, Telegram 2FA, gửi Zalo tự động.
- Không đổi app phụ huynh, trừ khảo sát NPS (mục 7) và các điểm ghi `learning_sessions` của prompt 00.

### Kiểm thử bắt buộc
1. Chưa đăng nhập: `/admin` chỉ hiện form đăng nhập; tìm trong `dist/` không còn chuỗi PIN cũ hay "1102".
2. Không thao tác 15 phút: hiện màn PIN; nhập đúng thì về đúng trang đang xem; sai 5 lần thì về đăng nhập.
3. Tạo 3 buổi học thật, 1 buổi dùng bản p3 cố ý lộ đáp án trong `cau_hoi`: app **không nhận được** câu lộ đáp án (worker đã gọi lại hoặc thay câu an toàn); Nhật ký hiện "Đã chặn"; đề có số "8" sẵn trong đề không bị báo nhầm.
3b. Phiên admin đang khoá: gọi API admin bất kỳ trả 423 cho tới khi mở khoá bằng PIN.
4. Lọc Gia đình theo "Ngủ đông" và khối 3: kết quả đúng với dữ liệu; xuất CSV mở được bằng Excel, tiếng Việt không lỗi font (UTF-8 có BOM).
5. "Lưu làm ví dụ mẫu" rồi mở Prompt Studio: ví dụ xuất hiện trong thư viện.
6. Vai trò `support` không thấy tab Prompt Studio, SQL Studio; gọi API lưu prompt bị 403.
7. Mọi màn có trạng thái trống khi D1 trống (thử trên database mới).
8. Màn 1280px và 390px đều không tràn ngang; sidebar thành thanh dưới ở 390px.
8b. Tương phản chữ đạt WCAG AA ở cả bản Gấu và Xanh dương (test tự động từ bảng màu); không có chữ màu `#F6A623` trên nền trắng.
9. Không còn ảnh nào tải từ `lh3.googleusercontent.com`.
10. `npm run build` thành công.

### Báo lại khi xong
- Ảnh chụp từng màn ở 1280px (bản Gấu) và 3 màn chính ở bảng màu Xanh dương.
- Danh sách API admin đã dùng, bảng mới (`nps_responses`, cột `validator_json`).
- Danh sách điểm trong thiết kế đã cố ý không làm theo, kèm lý do.
- Kết quả 10 bước kiểm thử.
