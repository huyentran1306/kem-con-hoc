# Prompt 08 · Góc hạ hoả mới: nhắc đúng lúc, thở cùng con, câu nói hợp bài

**Cách dùng:** copy phần PROMPT gửi cho AI lập trình, kèm source app React + Vite bản mới nhất và file thiết kế `tham-khao/goc-ha-hoa.html` (mở bằng Chrome: 6 ý, lưu đồ, 6 màn ở bộ Kẹo Bông, 3 kiểu thổi ở bộ khác).

**Phụ thuộc:** làm độc lập được. Nên làm sau prompt 07 để màn thổi có hình riêng theo bộ và thẻ ghi nhận nằm trong Báo cáo mới. Nếu prompt 07 chưa làm: màn thổi dùng hình của bộ Kẹo Bông cho mọi bộ, chỉ đổi màu theo biến. Nếu prompt 05 đã có bộ chặn lộ đáp án ở máy chủ thì câu nói AI ở mục 4 đi qua bộ chặn đó.

**Ý tưởng:** hiện Góc hạ hoả chỉ có vòng thở 4 giây và một câu "Thử nói" lấy ngẫu nhiên. Bản mới giúp mẹ **dịu lại** và **biết làm gì tiếp**: app tự nhắc đúng lúc, mẹ chọn lý do bằng một chạm, nhận việc làm ngay (thổi cùng con, câu nói hợp đúng bài, đổi vai, vận động, hoặc dừng nhẹ nhàng), cuối tuần có ghi nhận riêng cho bố mẹ.

---

## PROMPT

Bạn là kỹ sư frontend React của app **Kèm Con Học**. Hãy làm lại **Góc hạ hoả** theo 7 mục dưới đây. Mọi thứ chạy trên gói Cloudflare Free (xem quy tắc ở prompt 00), không thêm bảng, không thêm cron, không ghi âm.

### Hiện trạng cần biết
- Sheet "Hít thở cùng mình 30 giây": vòng thở đổi chữ "Hít vào…" / "Thở ra…" mỗi 4,2 giây, nút bật tắt tiếng, thẻ "Thay vì nói" (gạch ngang) và "Thử nói" lấy ngẫu nhiên từ một danh sách cố định, nút "Mình ổn rồi".
- Sheet "con bí" có thẻ "Nói với con", nút "🪜 Hạ độ khó (đổi số nhỏ hơn)" gọi lại AI soạn bài với số nhỏ hơn, và "Nghỉ xong, quay lại bài hiện tại".
- State có `calmWeek`; prompt 06 thêm `calmHistory` (mảng thời điểm bấm "Bình tĩnh").
- Kết quả soạn bài có `cac_bac[i].cau_hoi`, `cac_bac[i].dap_an_cho_me`, `cac_bac[i].goi_y.muc_1_do_vat`, `muc_2_hinh_ve`, `dap_an_cuoi_cho_me`.

### Việc cần làm

**1. Nhắc đúng lúc**
- Tín hiệu, chỉ trong màn Hỏi con từng bước:
  - (a) "Mít bí" bấm 2 lần ở cùng một bậc;
  - (b) ở một bậc quá 4 phút (chỉ đếm khi màn đang hiển thị, dùng `visibilitychange`);
  - (c) đã mở cả 2 mức gợi ý mà vẫn bấm "Mít bí".
- Hiện **thẻ nhắc trượt lên từ dưới**, không phải hộp thoại chặn: không che câu đọc to, nội dung phía sau mờ nhẹ nhưng vẫn bấm được. Hai nút: "🫧 Nghỉ 1 phút" (mở Góc hạ hoả) và "Để sau".
- Câu chữ: "Hai mẹ con nghỉ 1 phút nhé?", kèm lý do ngắn theo tín hiệu ("Mít bí 2 lần ở bậc này rồi", "Bậc này đã 4 phút rồi") và luôn có "Bài vẫn giữ nguyên". Không bao giờ dùng chữ trách hay đoán cảm xúc ("mẹ đang nóng", "mẹ bực").
- Giới hạn: tối đa 1 lần mỗi bài, 2 lần mỗi tối; "Để sau" ẩn 10 phút; tự ẩn sau 20 giây nếu không bấm.
- Ngưỡng đặt trong KV `app_config:calm_rules`: `{stuck_repeat: 2, step_minutes: 4, max_per_problem: 1, max_per_night: 2, snooze_minutes: 10}`. Đọc giống cách đọc `app_config:scope_rules` ở prompt 02; không có thì dùng giá trị mặc định trong code. Admin sửa được (đặt tạm cạnh khối cấu hình prompt 02 nếu admin mới chưa làm).
- Mỗi gia đình có công tắc **"Nhắc nghỉ khi căng thẳng"** trong Con tôi, mặc định bật.

**2. Một chạm chọn lý do** (màn Góc hạ hoả; mở từ thẻ nhắc, hoặc mẹ tự bấm ở Màn chính và ở màn Hỏi con)
- Tiêu đề "Điều gì đang khó, mẹ ơi?", dòng phụ "Chọn một ô, app gợi ý việc làm ngay. Bài đang làm vẫn giữ ở bậc N."
- 4 ô, mỗi ô dẫn tới việc làm cụ thể:

| Ô | Việc làm ngay |
|---|---|
| 🤔 Con chưa hiểu | Chưa mở gợi ý mức 1 thì mở mức 1 (đồ vật thật) rồi quay lại bài. Đã mở hết thì đề xuất "Hạ độ khó" (dùng đúng chức năng có sẵn). |
| 🦋 Con mất tập trung | Trò vận động 2 phút: chọn ngẫu nhiên từ danh sách 12 trò viết sẵn trong code, không gọi AI (ví dụ "Nhảy lò cò đếm tới 10", "Tìm 3 đồ màu đỏ trong phòng", "Làm tượng 10 giây"). Có đồng hồ 2 phút, hết giờ quay lại bài. Bên dưới có lối sang Đổi vai. |
| 😮‍💨 Mẹ đang mệt, bực | Thổi cùng con (mục 3), xong chuyển sang Câu nói hợp bài (mục 4). |
| 🌙 Muộn rồi | Lưu bài, dừng tối nay (mục 6). |

- Thêm 2 hàng bên dưới: "🎭 Đổi vai 2 phút" (mục 5) và "Chỉ muốn thở một chút" (mục 3, tên trò thổi theo bộ).
- Nút "Quay lại bài" luôn có. Mọi nhánh quay lại **đúng bậc đang làm**, giữ gợi ý đã mở và thời gian, trừ nhánh "Muộn rồi".

**3. Thổi cùng con**
- Dùng `getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })` và Web Audio `AnalyserNode`, tính độ lớn (RMS) mỗi khung hình. **Không ghi âm, không tạo file, không gửi gì lên mạng.** Dừng mic khi rời màn hoặc sau 90 giây.
- Hiệu chỉnh: 1 giây đầu đo tiếng ồn nền. Coi là "đang thổi" khi RMS vượt `max(nền x 3, ngưỡng tối thiểu)` liên tục từ 250 ms. Tiến độ mỗi lượt tăng theo **thời gian thổi liên tục, không theo độ to**: cần đủ 3 giây (cấu hình được) để xong lượt. Ngắt hơi thì giữ tiến độ, không về 0.
- 3 lượt; giữa các lượt có pha "Hít vào bằng mũi" 4 giây, hình phồng lên.
- **Trước khi xin quyền mic**, hiện câu: "Mic chỉ nghe tiếng thổi ngay trên máy, không ghi âm, không gửi đi." Bị từ chối, không có mic, hoặc đang mở trong trình duyệt của Zalo không hỗ trợ: tự chuyển sang chế độ **"Giữ nút và thở ra"** (giữ nút càng lâu càng tiến), vẫn 3 lượt.
- Hình theo bộ giao diện, cùng thao tác:

| Bộ | Trò thổi |
|---|---|
| `aurora` | Thổi tan đám mây che các ngôi sao |
| `sticker` | Thổi phồng bong bóng tới khi "BỤP" ra sticker |
| `notebook` | Thổi chiếc lông vũ bay qua trang giấy |
| `bento` | Thổi đầy vòng tròn như vòng tập thở |
| `garden` | Thổi hạt bồ công anh bay xa |
| `chalk` | Thổi bụi phấn, ngôi sao hiện dần |
| `candy` | Thổi tắt 3 ngọn nến trên bánh kẹo |
| `bear` | Thổi nguội cốc sữa mật ong cho Gấu |

- Thêm lựa chọn **"Mẹ thở một mình"**: kiểu thở dài kép (hít vào bằng mũi, hít thêm một hơi ngắn, thở ra thật dài bằng miệng), 5 lượt, khoảng 1 phút, có vòng tròn dẫn nhịp. Không ghi tuyên bố về sức khoẻ trong app.
- Âm thanh nhẹ khi xong mỗi lượt, theo nút bật tắt tiếng hiện có. Hiệu ứng theo tuỳ chọn "Hiệu ứng" (Tắt thì chỉ hiện thanh tiến độ).

**4. Câu nói hợp bài (AI)**
- Prompt mới **`p8_calm_phrase`** trong Prompt Studio, admin sửa được như các prompt khác. Biến: `{{lop}}`, `{{dang_bai}}`, `{{cau_hoi_bac}}` (câu hỏi của bậc đang vướng, lấy từ `cac_bac[i].cau_hoi`), `{{ly_do}}` (một trong 4 lý do), `{{xung_ho}}`, `{{ten_con}}`.
- Đầu ra JSON: `{ "thay_vi_noi": "...", "thu_noi": "...", "viec_lam_ngay": "..." }`. Mỗi câu tối đa 30 từ, giọng ấm, nói "mình", không trách, gắn với đúng bậc đang vướng (ví dụ: "Bài này khó thật đó. Mình lấy kẹo ra làm bút, cho Na 5 viên rồi đếm lại nha?").
- **Không chứa đáp án:** `thu_noi` là câu mẹ nói với con nên không được có đáp án của bậc hay đáp án cuối. Đi qua bộ chặn lộ đáp án của prompt 05 nếu đã có. Nếu chưa có: kiểm tra ở máy khách, câu chứa số của `dap_an_cho_me` hoặc `dap_an_cuoi_cho_me` mà số đó không có trong đề thì bỏ, dùng câu dự phòng.
- **Hiện câu dự phòng ngay lập tức** (danh sách viết sẵn theo từng lý do, thay danh sách cố định hiện tại). AI trả về thì thay bằng hiệu ứng mờ dần; quá 4 giây chưa về thì giữ câu dự phòng.
- Gọi qua `/chat` có sẵn, kèm header `X-Prompt-Id: p8_calm_phrase` (prompt 00). Lưu tạm theo (bài, bậc, lý do) trong phiên. Tối đa **3 lần gọi mỗi tối mỗi gia đình**. Nút "Câu khác" lấy câu dự phòng tiếp theo, không gọi lại AI.
- Có dòng nhỏ "✨ Viết riêng cho bậc này · không có đáp án trong câu" khi câu đến từ AI.

**5. Đổi vai 2 phút** (không gọi AI)
- Câu "Cô Mít hỏi mẹ" lấy từ `cac_bac[k].cau_hoi` của **bậc đã xong gần nhất**; chưa xong bậc nào thì dùng bậc 1.
- "Gợi ý cho mẹ" gấp lại, chạm mới mở: một câu trả lời **sai có chủ ý** để con sửa. Sinh tự động: nếu `dap_an_cho_me` của bậc đó có số thì đổi số (cộng hoặc trừ 1 đến 3, hoặc đổi chỗ 2 số); không có số thì "Mẹ thử nói ngược lại xem Mít có sửa không".
- Đồng hồ 2 phút. Hết giờ, con chấm mẹ 1 đến 3 sao (chỉ để vui, lưu vào lịch sử Góc hạ hoả).
- Phần hướng tới con chữ to, câu ngắn; phần gợi ý cho mẹ nhỏ và gấp lại.

**6. Muộn rồi: lưu bài, dừng tối nay**
- Lưu trạng thái bài (bài, bậc đang làm, gợi ý đã mở) vào state gia đình. Lần mở app sau, Màn chính hiện thẻ "Làm tiếp bài hôm qua", mở đúng bậc.
- Nếu tối đó đã trả lời được ít nhất 1 bậc: tính là **một tối học** trong ô theo dõi của prompt 07 (ghi `studyLog` với `partial: true`). Câu chữ: "Dừng ở đây cũng là một tối học rồi." Nếu prompt 07 chưa làm thì chỉ lưu bài.

**7. Ghi nhận riêng cho bố mẹ**
- Ghi mỗi lần dùng vào `calmHistory` của trẻ (mở rộng mảng của prompt 06; bản ghi cũ chỉ là số thời điểm vẫn đọc được): `{ ts, trigger: 'nudge' | 'manual', reason, action: 'hint' | 'lower' | 'move' | 'swap' | 'blow' | 'phrase' | 'stop', resumed, stepsAfter }`. `calmWeek` tính lại từ mảng này.
- Trong Báo cáo, thẻ có nhãn **"🔒 Riêng cho người lớn trong nhà"**:
  - "Tuần này mẹ đã dừng lại N lần trước khi nổi nóng" (đổi "mẹ" theo người đang đăng nhập nếu có prompt 03), các ngày có dừng lại;
  - "N lần nghỉ xong, Mít làm tiếp được thêm X bậc";
  - cách giúp nhiều nhất; câu mẹ dùng lại nhiều nhất.
- Chỉ hiện khi N từ 1 trở lên; N bằng 0 thì không hiện gì (không ghi "0 lần"). Câu chữ chỉ ghi nhận, không chấm điểm, không so sánh bố với mẹ.
- Công tắc "Gửi kèm báo cáo Zalo" mặc định **tắt**. Người vai "Chỉ xem" không thấy thẻ này. Giáo viên (prompt 04) không bao giờ thấy. Admin chỉ thấy số đếm tổng hợp như KPI hiện có, không thấy lý do hay câu nói.

### Không làm trong prompt này
- Không đoán cảm xúc bằng camera hay giọng nói, không ghi âm, không lưu âm thanh.
- Không gửi thông báo đẩy.
- Không đổi logic AI soạn bài và các prompt khác ngoài thêm `p8_calm_phrase`.
- Không thêm bảng, cron hay endpoint mới. Không tự xoá `calmHistory`.

### Kiểm thử bắt buộc
1. Bấm "Mít bí" 2 lần ở cùng bậc: thẻ nhắc hiện, không che câu đọc to, vẫn bấm được các nút phía sau. Bài thứ hai trong tối hiện được 1 lần nữa; lần thứ ba trong tối không hiện.
2. "Để sau": 10 phút không hiện lại. Tắt công tắc "Nhắc nghỉ khi căng thẳng": không bao giờ hiện.
3. Ở một bậc 4 phút khi màn đang mở thì nhắc; chuyển sang app khác rồi quay lại thì thời gian ẩn không được tính.
4. Mỗi ô trong 4 ô dẫn đúng việc làm ở bảng mục 2; mọi nhánh trừ "Muộn rồi" quay lại đúng bậc, gợi ý đã mở vẫn mở.
5. Thổi: chụp màn hình tab Network, không có request nào trong lúc dùng mic; mic tắt khi rời màn. Thổi to nhưng ngắn không xong lượt; thổi nhẹ đủ 3 giây thì xong.
6. Từ chối quyền mic, và mở trong trình duyệt của Zalo: tự chuyển sang "Giữ nút và thở ra", vẫn 3 lượt.
7. Câu nói hợp bài: câu dự phòng hiện ngay; tắt mạng thì vẫn có câu; câu AI chứa số đáp án thì bị thay bằng câu dự phòng (test với dữ liệu giả); lần gọi thứ tư trong tối không gọi AI.
8. Đổi vai: câu hỏi lấy đúng bậc đã xong gần nhất; câu sai có chủ ý khác đáp án; đồng hồ 2 phút chạy đúng.
9. Muộn rồi: mở lại app, thẻ "Làm tiếp bài hôm qua" mở đúng bậc. Đã trả lời 1 bậc thì ô theo dõi tối đó là đã học (nếu có prompt 07).
10. Ghi nhận: tuần không dùng thì không có thẻ; tài khoản "Chỉ xem" không thấy; báo cáo Zalo mặc định không có thẻ này.
11. Màn thổi ở 8 bộ đúng hình trong bảng mục 3 (nếu đã có prompt 07); "Hiệu ứng: Tắt" chỉ còn thanh tiến độ.
12. Test axe `color-contrast` trên các màn Góc hạ hoả: 0 lỗi. `npm run build` và `npm test` thành công.

### Báo lại khi xong
- File đã thêm, sửa; nội dung prompt `p8_calm_phrase` đã thêm vào Prompt Studio; danh sách câu dự phòng và 12 trò vận động.
- Cách đo tiếng thổi (ngưỡng, thời gian) và kết quả thử trên 2 điện thoại thật (một Android, một iPhone), trong và ngoài trình duyệt của Zalo.
- Kết quả 12 bước kiểm thử, mục nào chưa làm được và vì sao.
