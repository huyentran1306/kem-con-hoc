# Báo cáo đợt 28 → 29 → 30

- **Bản build:** `dist/assets/index-B-BJ6STF.js`, build trên Linux. Build lại trên Mac có thể ra tên khác.
- **Ảnh:** `bang-chung/prompt28-30/`.
- **Phần Worker** (thông báo, câu nhỏ hơn phía máy chủ, xưng hô trong prompt máy chủ, đo thời gian, lesson_cache) đã viết thành việc cho Antigravity trong `PROMPT_ANTIGRAVITY_28_30.md`.
- **Kiểm tra:**
  - lint sạch, build đạt;
  - `scripts/test-28-29-30.mjs --bundle` đạt 23/23;
  - `npm test` không có lỗi mới: 28 test cũ lỗi giống hệt trước khi sửa, do thiếu thư mục Worker và môi trường.

## Prompt 28

### Phần A

**A1. Góp ý giảng lại (`src/coachRules.js`)**

- Ý về giảng lại chỉ hiện khi có lượt giảng lại thật (`flow.teachBackDone`). Nút "Mức độ tự chủ" không còn bị tính là giảng lại.
- Câu ví dụ lấy phép tính thật của bài, ví dụ "Vì sao chỗ này con lại lấy 18 chia 3 nhỉ?". Bài không có phép tính thì dùng câu chung, không có số.
- Rà và bỏ các giá trị mặc định nói sai sự thật:
  - `stuckSkill = 'tinh_toan'`: ý "lúng túng khâu tính nhẩm" từng luôn hiện;
  - `streakDays = 3`: câu "3 ngày liên tiếp" từng luôn hiện;
  - thời lượng viết cứng 12 hoặc 15 phút;
  - "15 chiếc kẹo";
  - "vẽ sơ đồ hình tròn… Visual Learner".
- Màn Hỏi con từng bước giờ ghi lại `flow.stepLog` cho từng bậc: số lần kẹt, có dùng câu nhỏ hơn không, có mở đáp án không, số giây. Màn Xong bài chỉ dùng dữ liệu này. Sổ học (`studyLog`) cũng ghi số phút và số bậc tự làm theo dữ liệu thật.
- **Cần 23W lưu ý:** khi nối lại nút "Nghe con", gọi `pickTeachBack(v, teachBackId)` (truyền `teach_back_id` từ kết quả chấm) thì app mới tính là đã giảng lại thật.

**A2. Huy hiệu**

- "Bài anh em" chỉ được khen khi bài vừa xong chính là bài anh em con đã mở và làm hết các bậc (`problem.isBrotherProblem`).
- "Trò chơi" chỉ được khen khi `flow.playedMiniGame`.
- "Tập trung" chỉ xét khi có thời lượng đo thật.
- Bỏ `presentationClean: true` viết cứng.

**A3. Câu hỏi v3**

- Viết lại `p3_explain_v3` (rev 28):
  - mỗi bậc là một bước nhỏ của chính đề, theo thứ tự dữ kiện → chọn phép tính → kết quả trung gian → kết quả cuối;
  - bài 2 phép tính đủ 4 bậc;
  - cấm câu chung chung;
  - bậc cuối không được lặp câu hỏi của đề;
  - ví dụ mẫu một dòng là một bài 2 bước có 4 bậc.
- Nâng `max_tokens` của v3 từ 650 lên 900, vì 650 dễ cắt cụt JSON.
- Máy kiểm `src/stepQuality.js` bắt ba lỗi: bậc chung chung, bậc lặp câu hỏi của đề, bài 2 bước thiếu bậc. Có lỗi thì gọi `p3_fix_steps_v3` soạn lại riêng các bậc đó. Bản sửa chỉ được nhận khi ít lỗi hơn bản gốc.
- Bản Prompt Studio lưu trong máy hoặc trên máy chủ mà cũ hơn `rev` sẽ không còn đè lên bản mới trong code.
- **Thử bằng máy chủ giả:** đề "5 rổ trứng" với đúng 3 câu hỏi nhạt như báo cáo. Máy kiểm phát hiện, soạn lại thành 4 bậc bám đề (ảnh `28-a3-explain-sau-sua.png`).
- **Chưa làm:** bảng so sánh v2/v3 cho 5 đề với AI thật. Máy Claude không gọi được Worker. Script `scripts/compare-28-v2-v3.mjs` đã sẵn sàng, Antigravity chạy sau khi deploy.

**A4. Câu nhỏ hơn**

- `src/microStepLocal.js` soạn câu theo kỹ năng của bậc và số trong đề, ví dụ "Mỗi rổ có mấy quả?".
- App tự thay câu dự phòng chung của máy chủ bằng câu này, và cũng dùng nó khi máy chủ lỗi.
- **Sửa thêm một lỗi:** màn Hỏi con từng bước từng gửi `problemText` rỗng cho micro-step, chấm câu nói và bài anh em, vì đọc `problem.text` thay vì `problem.ocr`.

### Phần B · câu chữ đã đổi

| Chỗ | Trước | Sau |
|---|---|---|
| Bento Mềm | Tối giản, sáng sạch kiểu Apple, … | Tối giản, sáng sạch, dải cam san hô sang tím |
| Tham gia | Tham Gia Gia Đình Kèm Con Học | Tham gia gia đình |
| Cổng cô | Đăng ký Tài khoản Cô Giáo / Đăng nhập Cổng Giáo Viên | Đăng ký tài khoản cô giáo / Đăng nhập cổng giáo viên |
| Sổ sticker | Sổ dán Sticker của… | Sổ dán sticker của… |
| Tiêu đề khác | Vào Nhà Cùng Con; Báo Cáo Không Khả Dụng; Mở Trang Chủ…; Báo Cáo Tuần; Đăng Nhập Cùng…; Gửi Báo Cáo Vào Nhóm Zalo; Mở Phiếu Đổi Quà Cho Con; 4 Lớp Cam Kết Sư Phạm & An Toàn; Cổng Giáo Viên (thanh bên, chữ đang mở) | viết hoa đầu câu |
| Góp ý giảng lại tốt | …cách học sâu Feynmann đỉnh cao nhất! | {Tên} giảng lại rất mạch lạc. Con dạy lại được là con hiểu thật rồi! |
| Cây bút | Chơi với đồ chơi; hai tiêu đề Bó bút | Chơi với đồ vật; giữ một tiêu đề "Bó bút nhân chia" |
| Thời lượng chơi | 10 phút (thẻ đồ vật, Chụp đồ chơi) | theo cài đặt "Thời gian chơi chung mỗi ngày" (mặc định 5 phút) |
| Cổng cô | Không có việc tồn | Không có việc cần xem |
| Báo cáo | …các bậc thang | …các bậc |
| Báo cáo | 3 tuần có bài · tuần 28/9 | mới có dữ liệu 3 tuần |
| Con tôi | (bố, ông bà, gia sư) | (bố mẹ, ông bà, gia sư) |
| Bài mẫu | …con vịt nào? / …mấy con hả con? | bỏ "nào", bỏ "hả con" |

Bundle không còn: "Apple", "Feynmann", "15 trừ đi 6", "Chơi với đồ chơi", "Không có việc tồn".

## Prompt 29

### Phần A · Thông báo của cô (phần app; máy chủ do Antigravity làm)

**Cổng cô**

- Mỗi thông báo có menu ⋯ gồm: Sửa (tiêu đề, nội dung, hạn), Ghim/Gỡ ghim, Ẩn khỏi app phụ huynh/Hiện lại, Xoá (có hộp xác nhận, xoá mềm).
- Nhãn trạng thái: Đang hiện / Hết hạn / Đã ẩn / Đã xoá. Lọc nhanh: Đang hiện / Tất cả.
- Form có mục "Hiện trên app phụ huynh tới": Hết hôm nay, Ngày mai, 3 ngày, 1 tuần (mặc định), Chọn ngày. "Không hết hạn" chỉ hiện khi bật ghim.
- Gõ "mai", "thứ 2", "tuần sau"… thì hiện gợi ý chuyển sang Nhắc việc. Bấm gợi ý thì chữ cô đã gõ được giữ nguyên.

**Phía phụ huynh**

- Màn chính chỉ hiện tối đa 2 thông báo còn hạn, ghim lên trước, kèm dòng "Xem tất cả thông báo của cô".
- Thông báo hết hạn chỉ thấy trong danh sách tất cả, để mờ, có nhãn "Đã qua".

**Luật hạn** (`src/teacher/announcementStatus.js`)

- Thông báo cũ chưa có hạn hết hạn sau 7 ngày, trừ thông báo đang ghim.
- **Lưu ý:** hai thông báo ghim 25/10 và 26/10, sau khi cô gỡ ghim, vẫn hiện tới khoảng 1/11 và 2/11. Muốn tắt ngay thì cô bấm "Ẩn khỏi app phụ huynh".

**Ảnh:** `29a-co-menu-390/1280.png`, `29a-co-form-390/1280.png` (có gợi ý Nhắc việc), `29-home-bo.png` (màn chính phụ huynh chỉ 2 thông báo). Ảnh "trước" chính là ảnh trong báo cáo kiểm thử của bạn.

### Phần B · Người dùng là bố

**Xưng hô**

- Thêm `src/xungHo.js`. Hàm `xungHo()` trả "mẹ", "bố" hoặc "ông bà" theo **người đang cầm máy**: thành viên được mời thì lấy quan hệ của họ, chủ gia đình thì lấy lựa chọn ở màn khai báo.
- `ho` và `Ho` được đưa vào `AppCtx`.
- Các câu soạn sẵn (góc hạ hoả, lời nói thử) đổi qua `swapMe()`.
- Prompt AI (`p3_explain_v3`, `p3_extra_v3`, chấm giảng lại, micro-step, báo cáo tiến bộ) nhận `xung_ho`.

**Các chuỗi đã đổi**

Đã đổi khoảng 110 chỗ chữ "mẹ" chỉ người đang kèm, gồm:

- Màn chính:
  - thẻ Chấm vở;
  - Gợi ý cho {bố};
  - nút bình tĩnh.
- Đọc đề:
  - {Bố} xem lại số liệu;
  - {Bố} lưu ý.
- Hỏi con từng bước:
  - Dành cho {bố};
  - {Bố} thử hỏi con câu nhỏ này;
  - xem đáp án cho {bố}.
- Xong bài:
  - toàn bộ góp ý;
  - Con dạy lại {bố};
  - DÀNH CHO BỐ;
  - mức "… phải hướng dẫn nhiều".
- Kết quả chấm vở: "Chỉ bố mẹ thấy" và các toast.
- Trò chơi:
  - Góc chơi chung;
  - Đấu trí, Leo cây, Thám tử ("Hai bố con…");
  - các trò đồ vật.
- Con tôi:
  - Mỗi ngày {bố} và…;
  - xoá trí nhớ Gấu.
- Góc hạ hoả: lý do, lời nói thử, việc làm ngay, đổi vai.
- Hỏi thêm AI, phản hồi an toàn, lớp học, mùa lễ, nhắc của cô, thông báo lỗi.
- Cổng cô: "Mẹ dẫn nhiều" → "Bố mẹ dẫn nhiều".

**Các chuỗi giữ nguyên, và lý do**

- **Đề bài và dữ liệu bài mẫu** ("Mẹ mua 3 hộp bút…", bài vịt Dùng thử, câu đố trong `games/questionGenerator.js`, lời giảng mẫu "mẹ cho bạn Na năm cây"): đây là nội dung đề.
- **Số liệu theo người:** "Mẹ 0 ca · Bố 1 ca", lịch chia ca T2–CN, hàng "Mẹ" trong ảnh Zalo, chọn quan hệ Bố/Mẹ/Ông/Bà.
- **Tên trường dữ liệu AI:** `dap_an_cho_me` và các trường tương tự.
- **Admin và Prompt Studio:** không phải màn của phụ huynh.

**Màn khai báo lần đầu**

- Bỏ "1/3". Tiêu đề là "Chào bạn!" tới khi chọn vai trò, sau đó "Chào bố!", "Chào mẹ!" hoặc "Chào ông bà!".
- Ô biệt danh trống, chỉ có placeholder.
- Nút "Xong, bắt đầu" chỉ bấm được khi đã chọn vai trò và gõ tên.
- Con mới được sinh mã riêng `c_…`, không còn `na`.

**Các sửa khác**

- **Ô Gõ đề bài:** để trống. Đề mẫu chỉ có trong các chip. Bấm gửi khi ô trống thì app nhắc gõ đề, không tự lấy đề có tên "Na".
- **Chưa có dữ liệu thì nói thật:**
  - Góc chơi chung: "Chưa có buổi học nào. Hôm nay bố và Bin chơi ôn Bảng nhân 2, 3… (lớp 2)".
  - Khung "AI ưu tiên ôn": "Học xong bài đầu, Gấu sẽ gợi ý chỗ cần ôn".
  - Báo cáo: "Con hay vướng" và "Con đã vững" không còn nói "chưa có dạng nào bị vướng 🎉" khi chưa học buổi nào.
- **Nút mức độ tự chủ:** ba nút tách riêng, cách nhau 6px.
- **Đo thời gian soạn bài:** mỗi lần soạn ghi `_timing` (lần gọi đầu, sau dự phòng, sửa đúng chỗ, tổng; có hồ sơ con hay chưa) vào console và `localStorage.kch_last_explain_timing`. Phần đo phía máy chủ do Antigravity làm.

**Ảnh:** `29b-khai-bao-truoc.png`, `29b-khai-bao-chon-bo.png`, `29-home-bo.png`, `29b-o-go-de-trong.png`, `29b-tro-choi-chua-hoc.png`, `28-29-xong-bai-bo.png`, `28-29-xong-bai-gop-y.png`, `28-a4-cau-nho-hon.png`.

## Prompt 30

1. **Khung "Đang chọn":**
   - Nút trả về `width:auto; flex:0 0 auto; white-space:nowrap`; cột chữ `flex:1; min-width:0`.
   - Dưới 340px thì nút xuống hàng, rộng hết khung.
   - Đo bằng DOM: cột chữ rộng 165px ở khổ 360, 195px ở 390, 565px ở 1280; nút rộng 112px.
   - Ảnh `30-dang-chon-{notebook,tet}-{360,390,1280}.png`.
2. **Icon:** `icon-192.png` và `apple-touch-icon.png` được xuất lại bằng cách thu nhỏ cả hình 512, đã thấy trọn mặt gấu và dải chữ. Apple-touch được lót nền mật ong. Thêm `?v=2` trong `manifest.json` và thẻ `<link>`.
3. **Ô Nhập lại mật khẩu:** placeholder đổi thành "Nhập lại mật khẩu". Ảnh `30-tao-gia-dinh.png`.
4. **Màu placeholder:** đổi `#94A3B8` (2,56:1) sang `#7C8797` (3,64:1), vẫn nghiêng, nét thường. Áp dụng cho mọi ô nhập, gồm Đăng nhập, Tạo gia đình, Tham gia gia đình.
