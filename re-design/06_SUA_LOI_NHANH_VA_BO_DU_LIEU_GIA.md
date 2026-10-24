# Prompt 06 · Sửa lỗi nhanh và bỏ dữ liệu giả (làm ngay, đợt 1)

**Cách dùng:** copy phần PROMPT gửi cho AI lập trình, kèm source app (React + Vite).

**Phụ thuộc:** không cần prompt nào khác. Làm trước hoặc song song với prompt 01 và 02. Các mục liên quan tới tài khoản, `learning_sessions`, admin đã nằm ở prompt 00, 03, 05; prompt này chỉ sửa những gì **app phụ huynh làm sai hoặc nói sai ngay bây giờ**.

**Nguồn:** đọc mã bản đang chạy `kem-con-hoc-5xf.pages.dev` ngày 24/10/2026. Mỗi lỗi dưới đây đã được kiểm tra lại trực tiếp trong bundle (có trích chuỗi để tìm).

**Vì sao quan trọng trước chung kết:** giám khảo bấm thử app với gia đình 2 con, hoặc hỏi "dữ liệu lưu ở đâu", sẽ gặp đúng các lỗi này.

---

## PROMPT

Bạn là kỹ sư frontend React của app **Kèm Con Học**. Sửa các lỗi và chỗ hiển thị sai dưới đây. Mỗi mục làm thành một commit riêng, có test hoặc bước kiểm tra tay. **Không đổi giao diện tổng thể, không đổi worker, không đổi luồng học** ngoài những gì ghi rõ.

### A. Lỗi chức năng

**A1. Đổi con ở màn chính làm app lỗi (gia đình từ 2 con)**
- Hiện trạng: các chip chọn con trên màn chính gọi `patch({activeId: t.id})`, nhưng trong phạm vi đó **không có hàm `patch`**. Bấm chip sẽ gây `ReferenceError`. Đổi con ở tab "Con tôi" thì chạy được.
- Sửa: dùng đúng hàm cập nhật state mà tab "Con tôi" đang dùng để đổi `activeId`. Giữ toast "Đổi sang bé {tên} {emoji}".
- Kiểm tra: gia đình 2 con, bấm chip con thứ hai ở màn chính → đổi đúng con, không lỗi Console, các thẻ "hay vướng", sticker đổi theo con.

**A2. Câu hỏi bằng giọng nói ở màn "Hỏi con từng bước" bị bỏ rơi**
- Hiện trạng: ô "💡 Mẹ cần AI gợi ý thêm cách giảng?" có nút "💬 Hỏi AI cách giảng" và "🎙️ Nói bằng giọng nói". Chữ nhận từ giọng nói **chỉ hiện trong toast**, không được gửi cho AI.
- Sửa:
  - Thêm một ô nhập ngắn trong khung này (nếu chưa có), tối đa 200 ký tự. Chữ nhận từ giọng nói điền vào ô này, mẹ sửa được, rồi bấm "Hỏi AI cách giảng".
  - Nội dung ô ghi chú được gửi kèm câu hỏi theo khung `p4b_parent_note_chat` (biến `{{ghi_chu}}`), như thiết kế Prompt Studio đã có nhưng app chưa nối.
  - Mở màn "Hỏi thêm AI" với câu hỏi đầu tiên là nội dung đó.
- Kiểm tra: nói "con chưa học phép nhân" → ô ghi chú có chữ đó → bấm hỏi → payload `/chat` chứa khung ghi chú, câu trả lời không dùng phép nhân.

**A3. Màn "Hỏi thêm AI" không dùng prompt trong Prompt Studio**
- Hiện trạng: `p4_chat` được định nghĩa trong Prompt Studio nhưng màn "Hỏi thêm AI" dùng **system prompt viết cứng** trong code, nên admin sửa `p4_chat` không có tác dụng.
- Sửa: dùng `p4_chat` (bản đã lưu, có bản mặc định trong code làm dự phòng), điền đủ biến `{{mon}} {{lop}} {{sach}} {{dang_bai}} {{loi_hay_gap}} {{de_bai}} {{khung_ghi_chu}} {{doan_phuong_phap}}`. Luật "không đưa đáp án cho trẻ" phải có trong bản mặc định.
- Kiểm tra: sửa một câu trong `p4_chat` ở Prompt Studio, lưu, mở app (xoá cache cấu hình) → câu trả lời thay đổi theo.

**A4. Luật router "Con bí lần 2 trở đi" không bao giờ được dùng**
- Hiện trạng: bảng router có luật `con_bi_lap_lai` (hạ bậc độ khó), hàm chọn phương pháp có tham số "đang bí", nhưng app **không truyền** tham số này ở đâu.
- Sửa: khi con bấm "❌ Con còn bí" lần thứ 2 ở cùng một bậc, sheet "Con bí 2 lần rồi 🙈" thêm nút **"🪜 Hạ độ khó"**. Bấm thì gọi lại soạn bài với tham số đang bí bật, dùng đoạn phương pháp của luật `con_bi_lap_lai` (số nhỏ hơn rồi quay lại bài gốc). Có màn chờ ngắn như Analyze.
- Kiểm tra: bí 2 lần → bấm "Hạ độ khó" → payload p3 có đoạn phương pháp của `con_bi_lap_lai`; kết quả có bậc dùng số nhỏ hơn.

**A5. Lịch sử luôn ghi "Toán lời văn 2 bước"**
- Hiện trạng: ở màn "Xong bài", hàm ghi lịch sử viết cứng `Toán lời văn 2 bước · {còn vướng | làm được}` bất kể con vừa làm bài gì.
- Sửa: ghi theo bài thật: `{dang_bai của bài vừa làm} · {còn vướng | làm được}`. Không có `dang_bai` thì dùng 40 ký tự đầu của đề. Danh sách "hay vướng" / "đã vững" cũng cập nhật theo `dang_bai` thật.
- Kiểm tra: làm một bài Tiếng Việt → lịch sử ghi đúng dạng bài Tiếng Việt.

**A6. Mạng chậm thì lặng lẽ chuyển sang bài mẫu**
- Hiện trạng: AI lỗi thì app chuyển sang bài mẫu viết sẵn, chỉ báo bằng một toast "Mạng chậm" kèm cụm "đã chuyển sang bài mẫu" (tìm cụm này trong code). Mẹ có thể giảng nhầm bài mẫu thay cho bài của con.
- Sửa:
  - Không tự chuyển. Hiện thẻ "Mạng đang chậm, chưa soạn được bài của con" với 2 nút "Thử lại" (nút chính) và "Xem bài mẫu để làm quen".
  - Nếu mẹ chọn bài mẫu: mọi màn sau đó có dải nhãn **"Đây là bài mẫu, không phải bài của con"**.
  - Bài mẫu không ghi vào lịch sử, không tính sticker.
- Kiểm tra: chặn `/chat` trong DevTools → thấy thẻ 2 nút; chọn bài mẫu → có dải nhãn ở Explain, Scaffold, Done.

### B. Dữ liệu giả trong app phụ huynh

**B1. Trẻ mới tạo có sẵn 15 sticker mẫu**
- Hiện trạng: mỗi trẻ mới được gán sẵn lịch sử 15 sticker mẫu (`stickerHistory` với `week:"Tuần này"`, timestamp lùi vài ngày), nên báo cáo và phần "Biến động phẩm chất" hiện xu hướng giả.
- Sửa: trẻ mới có `stickerHistory: []`. Với trẻ đã có dữ liệu: **không xoá gì**, chỉ **đánh dấu** 15 bản ghi mẫu bằng trường `sample: true` (nhận ra bằng id `h1` đến `h15` và đúng bộ trường mẫu). Mọi chỗ tính toán (báo cáo tuần, "Biến động phẩm chất", số sticker, phần thưởng, admin, phân tích AI) **bỏ qua** bản ghi có `sample: true`. Sổ sticker không hiện các bản ghi này. Viết hàm đánh dấu chạy một lần, chạy lại không đổi gì, có test; lỡ đánh dấu nhầm thì chỉ cần bỏ cờ là khôi phục.
- Báo cáo khi chưa có dữ liệu: thẻ trống "Chưa có buổi học nào tuần này" thay vì biểu đồ.

**B2. Nhãn tuần cố định "Tuần này"**
- Hiện trạng: mỗi sticker lưu chữ `week:"Tuần này"` hoặc `"Tuần trước"` cố định, không tự chuyển khi sang tuần mới; `calmLast` không bao giờ được cập nhật; `sessionsMom`, `sessionsDad`, `strong` không bao giờ tăng.
- Sửa:
  - Bỏ việc dựa vào chữ `week`; tính "tuần này / tuần trước" từ `timestamp` theo tuần bắt đầu thứ Hai, giờ Việt Nam.
  - `calmWeek` / `calmLast` tính lại từ danh sách thời điểm bấm "Bình tĩnh" (lưu mảng `calmHistory` timestamp).
  - Khi xong bài: tăng `sessionsMom` hoặc `sessionsDad` theo `parent` đang đăng nhập (tạm thời, prompt 03 sẽ thay bằng thành viên thật); thêm vào `strong` khi đánh giá "làm được".
- Kiểm tra: đổi giờ máy sang tuần sau → sticker cũ chuyển sang "tuần trước".

**B3. "Độ tin cậy 98.6%" ở màn Chụp đồ chơi**
- Hiện trạng: con số **viết cứng**, không do AI trả về.
- Sửa: bỏ con số. Thay bằng "AI đoán đây là: **{tên đồ vật}**. Đúng chưa mẹ?" với 2 nút "Đúng rồi" và "Chọn đồ khác" (dùng lại bộ chọn sửa hiện có).

**B4. "Ai kèm" trong báo cáo có số mặc định**
- Hiện trạng: số ca Mẹ/Bố lấy từ lịch chia ca, thiếu thì mặc định `4` và `1`.
- Sửa: lấy từ `sessionsMom` / `sessionsDad` đã sửa ở B2; bằng 0 thì hiện 0. (Prompt 03 sẽ thay bằng số theo từng thành viên.)

### C. Câu chữ hứa sai

**C1. Quyền riêng tư**
- Hiện trạng: tab "Con tôi" ghi "Không lưu ảnh mặt con. Ảnh bài tập xóa sau 24 giờ. Dữ liệu chỉ ở trên máy bạn." trong khi **đồng bộ đám mây đang bật mặc định** (dữ liệu gia đình lưu trên máy chủ).
- Sửa: thay bằng câu đúng với thực tế, ví dụ: "Ảnh chỉ dùng để đọc đề, app không lưu ảnh. Hồ sơ, sticker, lịch sử học được lưu trên máy chủ để dùng được trên nhiều máy; mẹ có thể xoá toàn bộ bất cứ lúc nào."
- **Kiểm tra với worker** xem ảnh có bị lưu ở đâu không (R2, log). Nếu worker có lưu ảnh thì ghi đúng thời gian xoá thật; nếu không lưu thì ghi "không lưu". Ghi kết quả kiểm tra vào báo cáo.
- Câu "🔒 Ảnh chỉ dùng để đọc đề, xóa sau 24 giờ" ở màn Chụp bài: sửa cùng nội dung đã kiểm tra.

**C2. Nhắc "lúc 19:45" chưa có**
- Hiện trạng: onboarding và "Lịch chia ca" hứa "người trực ca nhận nhắc lúc 19:45", nhưng app **không có code nhắc** (không có service worker, không có thông báo).
- Sửa (chưa làm thông báo đẩy):
  - Đổi câu thành "Người trực ca sẽ thấy lời nhắc khi mở app buổi tối".
  - Thêm dải nhắc trên màn chính từ 19:30 đến 21:30: "Tối nay {Mẹ/Bố} trực ca kèm {tên con} 🌙".
  - Thông báo đẩy thật để sau (ghi trong prompt 03).

### D. Dọn mã chết và tài nguyên thừa
- Sheet `answerBlock` và `editOcr` không còn đường mở tới: xoá, hoặc nối lại nếu có lý do (ghi trong báo cáo).
- Font **Lexend** được tải nhưng không dùng: bỏ khỏi thẻ `<link>`.
- Biến CSS `--modal-title`, `--modal-sub` được dùng nhưng chưa định nghĩa: định nghĩa trong `:root`.
- Hình chấm minh hoạ ở màn "Trước khi giảng" chỉ đúng với bài mẫu: chỉ hiện khi đang xem bài mẫu.

### Không làm trong prompt này
- Không đổi tài khoản, API, worker (prompt 00).
- Không đổi giao diện tổng thể (prompt 01), không thêm kiểm tra phạm vi ảnh (prompt 02).

### Kiểm thử bắt buộc
1. Gia đình 2 con: đổi con ở màn chính không lỗi (A1).
2. Ghi chú bằng giọng nói đi vào câu hỏi gửi AI (A2); sửa `p4_chat` có tác dụng (A3).
3. Bí 2 lần, bấm "Hạ độ khó" ra bài dễ hơn (A4).
4. Lịch sử ghi đúng dạng bài vừa làm (A5).
5. Chặn `/chat`: không tự chuyển bài mẫu; chọn bài mẫu thì có nhãn ở mọi màn sau (A6).
6. Trẻ mới không có sticker mẫu; trẻ cũ có đúng 15 bản ghi được đánh dấu `sample: true`, bản ghi thật không bị đánh dấu, không bản ghi nào bị xoá; báo cáo và số sticker không tính bản ghi mẫu (B1, test hàm đánh dấu).
7. Đổi giờ máy sang tuần sau: tuần này / tuần trước tính đúng (B2).
8. Không còn chuỗi "98.6", "Dữ liệu chỉ ở trên máy bạn", "nhắc lúc 19:45" trong `dist/`.
9. `npm run build` thành công, không có lỗi Console ở 12 màn chính.

### Báo lại khi xong
- Danh sách commit theo mục A1 đến D.
- Kết quả kiểm tra worker có lưu ảnh hay không (C1).
- Kết quả 9 bước kiểm thử.
