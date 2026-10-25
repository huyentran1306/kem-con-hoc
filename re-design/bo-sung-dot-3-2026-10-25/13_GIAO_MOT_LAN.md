# Prompt 13 · Giao một lần: sửa lỗi, hoàn thiện phần còn thiếu, thêm lưới an toàn

**Cách dùng:** chỉ cần giao file này cho AI lập trình, kèm mã nguồn mới nhất và các file nó nhắc tới (đã có trong các gói trước): `00_NEN_TANG_TAI_KHOAN_VA_BAO_MAT.md`, `10_ADMIN_THIET_KE_BO_GIAO_DIEN.md`, `11_CONG_GIAO_VIEN_BAN_GAU.md`, `12_SUA_LOI_SAU_DOT_07_11.md`, thư mục `bang-chung/`, thư mục `tham-khao/`.

**Lời nhắn mở đầu (copy):**
> Bạn là kỹ sư của dự án Kèm Con Học. Hãy làm **toàn bộ** file `13_GIAO_MOT_LAN.md` theo đúng thứ tự 6 chặng. Hết mỗi chặng: chạy kiểm thử của chặng, commit riêng, deploy **bản preview**, ghi kết quả vào `BAO_CAO_DOT_13.md`, rồi **tự đi tiếp** sang chặng sau. Chỉ dừng lại hỏi tôi ở các "Điểm dừng bắt buộc". Không báo "xong" khi còn kiểm thử chưa đạt.

---

## PROMPT

Bạn là kỹ sư full-stack của app **Kèm Con Học** (React + Vite, Cloudflare Worker, D1, gói Free). Làm lần lượt 6 chặng dưới đây trong một phiên.

### Quy tắc chung cho cả phiên
- **Thứ tự cố định**, không nhảy chặng. Chặng sau dựa vào chặng trước.
- **Cổng kiểm tra:** hết mỗi chặng phải chạy đủ kiểm thử của chặng đó. Có mục chưa đạt thì sửa tiếp trong chặng; sau 2 lần sửa vẫn không đạt thì ghi rõ vào báo cáo là "chưa đạt, lý do", rồi mới đi tiếp.
- **Mỗi chặng một commit** (thông điệp bắt đầu bằng `dot13-chang-N:`), để quay lui được từng chặng.
- **Báo cáo liên tục** trong `BAO_CAO_DOT_13.md` ở thư mục gốc: mỗi chặng một mục gồm việc đã làm, file đã đổi, kết quả kiểm thử, việc chưa làm và lý do, đường dẫn bản preview.
- Giữ nguyên các quyết định đã chốt: gói Cloudflare Free, không tự xoá dữ liệu người dùng, AI không đưa đáp án cho con, không viết dấu gạch dài trong câu chữ hiển thị.

### Điểm dừng bắt buộc (phải hỏi chủ dự án, không tự làm)
1. **Deploy production.** Chỉ deploy preview; production do chủ dự án bấm.
2. **Khoá cổng cũ `/db/query`, `/db/execute`, `/db/kv/*`** (prompt 12 mục P2.9). Làm xong mọi việc khác của chặng 2, rồi hỏi.
3. **Chạy migration trên database thật.** Chạy thử đếm số dòng trước, xuất bản sao bằng `wrangler d1 export`, rồi hỏi trước khi chạy thật.
4. **Xoá bất kỳ dữ liệu người dùng nào**, kể cả gia đình thử nghiệm.
5. Mật khẩu admin do chủ dự án tự đổi; không đặt, không in, không ghi mật khẩu vào code hay báo cáo.

---

### Chặng 1 · Sửa toàn bộ lỗi P0 của prompt 12
Làm **P0.1 đến P0.6** trong `12_SUA_LOI_SAU_DOT_07_11.md` (thông tin admin công khai, AI soạn bài ra văn xuôi rồi rơi về bài mẫu, nút Gõ đề và Đọc đề không chạy, màn trắng ở Lớp học của con và link vào lớp, lỗi 401 do đọc token sai chỗ, lọ kẹo không tăng).
- **Kiểm thử chặng 1:** các bước kiểm thử của từng mục P0 trong prompt 12, cộng bước 1, 3, 4, 5 trong "Kiểm thử bắt buộc" của prompt 12.

### Chặng 2 · Sửa P1 và P2 của prompt 12
Làm **P1.1 đến P1.8** và **P2.1 đến P2.10**. P2.9 (khoá `/db/*`) làm phần chuẩn bị (admin không còn gọi SQL trực tiếp, liệt kê nơi còn gọi), rồi **dừng hỏi** trước khi khoá.
- **Kiểm thử chặng 2:** bước 2, 6, 7 trong "Kiểm thử bắt buộc" của prompt 12; axe `color-contrast` 0 lỗi ở 8 bộ; ảnh trước và sau các mục P1.

### Chặng 3 · Hoàn thiện cổng giáo viên (prompt 11)
Rà lại 3 phần của `11_CONG_GIAO_VIEN_BAN_GAU.md` trên bản đang chạy, làm nốt phần còn thiếu. Đã biết còn thiếu ở **phần A**:
- thanh bên trái 196px có ô "Lớp đang xem" và 6 mục (thay đầu trang ngang hiện tại) trên màn từ 1024px;
- thanh tab dưới 5 mục trên điện thoại;
- tab **Kết quả** của lớp và màn Kết quả bài (biểu đồ bậc hay vướng, thẻ trợ lý gấu);
- khối **"Việc cần cô xem"** ở trang Lớp của cô;
- bộ component dùng chung `src/ui/staff/` cho admin và giáo viên.

Phần B (Cô nhắc) và C (vào lớp bằng link): đối chiếu từng mục kiểm thử trong prompt 11, sửa chỗ chưa đạt.
- **Kiểm thử chặng 3:** kiểm thử phần A, B, C trong prompt 11.

### Chặng 4 · Admin thiết kế bộ giao diện (prompt 10)
Bản đang chạy chưa có tính năng này. Làm đủ `10_ADMIN_THIET_KE_BO_GIAO_DIEN.md`, đặt trong tab "Giao diện app" của admin, dùng bộ component dùng chung của chặng 3.
- **Kiểm thử chặng 4:** 9 bước kiểm thử của prompt 10.

### Chặng 5 · Lưới an toàn chống lỗi tái phát (mới)
Các lỗi ở prompt 12 đều có thể tự bắt trước khi lên live. Thêm 3 thứ:

**5.1 Kiểm thử tự động luồng chính (Playwright), chạy trước mỗi lần deploy**
- Thư mục `e2e/`, chạy bằng `npm run e2e` trên bản preview hoặc bản build chạy ở máy.
- **Không gọi AI thật:** chặn `/chat`, `/vision`, `/stt` và trả câu trả lời mẫu cố định lưu trong `e2e/fixtures/` (một bài giảng JSON hợp lệ, một câu trả lời văn xuôi để thử nhánh lỗi định dạng).
- Kịch bản, chạy ở **cả 8 bộ giao diện**, khung 390px và 1366px:
  1. tạo gia đình thử (tên có tiền tố `e2e-`), onboarding;
  2. bấm từng nút Chụp, Gõ, Đọc ở màn chính, mỗi nút mở đúng màn hoặc sheet;
  3. gõ đề → soạn bài (fixture) → Hỏi con đủ bậc bằng chuột → Xong bài → ô theo dõi hôm nay đã tăng;
  4. mở mọi sheet ở Con tôi (Thêm con, Thành viên, Lớp học của con, Giao diện cả nhà, Tự thiết kế) không có lỗi console;
  5. axe `color-contrast` trên Màn chính, Báo cáo, Con tôi, Góc hạ hoả: 0 lỗi;
  6. fixture văn xuôi: app hiện lỗi định dạng có nút Thử lại, không hiện "mạng chậm", không rơi về bài mẫu im lặng.
- Gia đình `e2e-` chỉ tạo trên môi trường thử; nếu buộc phải chạy trên production thì dùng một gia đình cố định, không tạo mới mỗi lần.
- Thêm script `npm run predeploy` chạy `build` + `test` + `e2e`; hỏng thì không deploy.

**5.2 Ghi lỗi từ máy người dùng về admin**
- App bắt `window.onerror`, `unhandledrejection` và lỗi từ Error Boundary, gửi `POST /api/v1/client-errors` (thông điệp, 5 dòng stack đầu, route, bộ giao diện, phiên bản build, thời điểm). **Không gửi** nội dung đề bài, tên con, token.
- Worker gộp lỗi trùng theo (thông điệp, file, dòng) và đếm số lần; giới hạn 20 lỗi mỗi phút mỗi gia đình; giữ 30 ngày (dữ liệu kỹ thuật, theo mục 10 của prompt 00).
- Admin có mục "Lỗi phía người dùng" trong tab Hạ tầng: danh sách lỗi theo số lần, lần cuối, bộ giao diện, phiên bản.

**5.3 Bộ đề chấm chất lượng AI**
- File `ai-eval/de-mau.json` gồm 30 đề: 12 toán lời văn (1 và 2 bước), 6 tìm x và phép tính, 6 tiếng Việt (chính tả, đặt câu), 6 tiếng Anh lớp 3 đến 5.
- Lệnh `npm run ai-eval` gọi đúng prompt p3 qua gateway (chỉ chạy tay, không chạy trong CI), chấm tự động 4 tiêu chí: ra JSON đúng schema; đề trong bài giảng khớp đề gốc; 3 đến 5 bậc; không lộ đáp án (dùng chính bộ chặn của prompt 05). Xuất bảng kết quả `ai-eval/ket-qua-<ngày>.md` và số tổng.
- Admin, tab Prompt Studio: hiện kết quả lần chạy gần nhất cạnh từng prompt. Mục tiêu: 30/30 ra JSON, 28/30 đạt cả 4 tiêu chí.
- **Kiểm thử chặng 5:** `npm run e2e` xanh ở 8 bộ; cố ý gây một lỗi ở một sheet thì lỗi hiện trong admin trong 1 phút; `npm run ai-eval` chạy hết 30 đề và ghi kết quả.

### Chặng 6 · Chế độ "Dùng thử" cho buổi chung kết (mới)
- Màn đăng nhập có nút **"Dùng thử không cần tài khoản"**. Bấm vào thì mở một gia đình mẫu **chỉ đọc**: 2 con, lọ kẹo đã có 3 viên, báo cáo tuần có số liệu, 1 lớp có lời nhắc của cô, 3 bài đã soạn sẵn.
- Ở chế độ dùng thử: được bấm đi hết luồng (bài giảng lấy từ dữ liệu soạn sẵn, **không gọi AI**, không ghi lên máy chủ); mọi thay đổi chỉ nằm trong máy và mất khi đóng; dải nhỏ trên đầu ghi "Đang dùng thử · Tạo gia đình để lưu".
- Đổi bộ giao diện, Góc hạ hoả, thổi nến, Tự thiết kế đều dùng được trong chế độ này, để demo trên sân khấu không phụ thuộc mạng và AI.
- **Kiểm thử chặng 6:** bật chế độ máy bay sau khi tải trang, chế độ dùng thử vẫn đi hết luồng; không có request ghi nào tới máy chủ (kiểm tra tab Network).

---

### Báo lại khi xong cả phiên
Cuối `BAO_CAO_DOT_13.md`, thêm mục tổng kết:
- bảng 6 chặng: đạt / chưa đạt từng phần, đường dẫn preview, mã commit;
- danh sách việc đang chờ chủ dự án quyết (khoá `/db/*`, migration thật, deploy production);
- những gì đã phải đoán hoặc làm khác thiết kế, và lý do.
