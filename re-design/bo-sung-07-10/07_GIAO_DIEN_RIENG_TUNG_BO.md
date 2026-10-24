# Prompt 07 · Mỗi bộ giao diện một bố cục riêng + theo dõi học đều mỗi ngày

**Cách dùng:** copy phần PROMPT gửi cho AI lập trình, kèm source app React + Vite bản mới nhất và file thiết kế `tham-khao/8-bo-giao-dien-rieng.html` (mở bằng Chrome: 8 bộ x 12 màn, có bảng "Mỗi bộ khác nhau ở đâu" và "Bộ icon riêng từng bộ" ở đầu trang).

**Phụ thuộc:** làm sau prompt 01 (hệ thống 8 bộ màu đã chạy trên bản live) và nên sau prompt 06 mục B2 (tuần tính từ `timestamp`). Không cần prompt 00; nếu 00 đã xong thì ghi thêm buổi học vào `learning_sessions` như prompt 00 quy định.

**Hai phần:** Phần A sửa ngay các chữ trắng khó đọc trên bản đang chạy (làm trước, nhỏ, an toàn; deploy riêng được). Phần B làm bố cục và icon riêng cho từng bộ.

**Ý tưởng:** hiện tại đổi bộ giao diện chỉ là đổi màu, đổi chữ. Ở 3 màn mẹ con dùng nhiều nhất mỗi tối (**Màn chính**, **Hỏi con từng bước**, **Xong bài**), mỗi bộ cần có **thành phần riêng**: bộ Gấu có chú gấu giơ bảng câu hỏi, bộ Vườn có cây lớn dần theo từng tối học, bộ Kẹo có lọ kẹo đầy dần... Thêm **ô theo dõi học đều** trên màn chính để bố mẹ và con thấy tuần này đã học mấy tối, chuỗi bao nhiêu tối liên tiếp. 9 màn còn lại (Đăng nhập, Chụp bài, Soát đề, Giải thích cho mẹ, Hỏi thêm AI, Trò chơi, Báo cáo, Con tôi, Góc hạ hoả) giữ cấu trúc nhưng dùng **bộ linh kiện riêng** của từng bộ (thẻ, nút, ô nhập, bong bóng chat, lưới tháng, nút chụp, hình mở đầu ở màn Đăng nhập) và **4 icon thanh dưới khác hình** theo chủ đề.

---

## PROMPT

Bạn là kỹ sư frontend React. App **Kèm Con Học** đã có 8 bộ giao diện (prompt 01) nhưng các bộ chỉ khác nhau ở biến CSS. Trước hết **sửa màu chữ khó đọc** (phần A). Sau đó làm cho **mỗi bộ có bố cục và thành phần riêng ở 3 màn**: Màn chính (Home), Hỏi con từng bước (Scaffold), Xong bài (Done); và thêm **theo dõi học đều mỗi ngày** trên Màn chính; 9 màn còn lại dùng bộ linh kiện riêng của bộ (mục 8) và icon riêng (mục 7). Logic, dữ liệu, luồng AI giữ nguyên.

### Hiện trạng cần biết
- `app.css` có 8 khối `[data-theme=candy|bear|bento|sticker|notebook|garden|aurora|chalk]`, mỗi khối khoảng 33 biến (`--c-bg, --c-surface, --c-surface-2, --c-line, --c-text, --c-text-2, --c-accent, --c-accent-text, --c-accent-2, --c-good, --c-good-bg, --c-good-fg, --c-warn, --c-warn-bg`...). **Không có** selector nào đổi bố cục theo bộ.
- Có `ThemeDecor.jsx` (lớp trang trí nền), `DEFAULT_THEME`, mục "Giao diện cả nhà" và tuỳ chọn "Hiệu ứng: Đầy đủ / Nhẹ / Tắt".
- Màn chính, Hỏi con, Xong bài dùng chung một cây component cho cả 8 bộ.
- Mỗi trẻ có `stickerHistory` (mỗi bản ghi có `timestamp`; bản ghi mẫu có `sample: true` và phải bỏ qua). Chưa có dữ liệu "tối nào đã học".
- Góc "Bình tĩnh" đếm `calmWeek`; không liên quan prompt này.

### PHẦN A · Làm trước: sửa màu chữ khó đọc trên bản đang chạy

Đã đo trực tiếp trên `app.css` của bản live (24/10). Nhiều chữ **trắng** đang nằm trên nền **sáng**, nhất là ở 3 bộ tối và Kẹo Bông, nên rất khó đọc.

**Nguyên nhân 1: luật CSS cũ viết cứng `color:#fff`**, trong khi nền đã chuyển sang biến của bộ giao diện. Tỉ lệ tương phản đo được (chuẩn là 4,5 cho chữ thường, 3 cho chữ to):

| Luật CSS cũ (chữ trắng trên) | candy | bear | bento | sticker | notebook | garden | aurora | chalk |
|---|---|---|---|---|---|---|---|---|
| `.btn.mint`, `.loader .li.ok .dot` (nền `--mint` = `--c-good`) | 1,7 | 1,9 | 2,8 | 2,1 | 3,1 | 1,5 | 1,9 | 1,4 |
| `.btn.coral`, `.fab`, `.tag-new` (nền `--coral` = `--c-accent`) | 2,1 | 2,0 | 2,8 | 3,1 | 4,1 | 1,4 | 1,8 | 1,3 |
| `.btn.sky` (nền `--sky` = `--c-accent-2`) | 2,2 | 2,1 | 3,3 | 4,2 | 7,7 | 1,5 | 2,7 | 1,7 |
| `.step-row .n`, `.chat .u` (nền `--plum` = `--c-accent`) | 2,1 | 2,0 | 2,8 | 3,1 | 4,1 | 1,4 | 1,8 | 1,3 |
| `.toast` (nền `--ink` = `--c-text`, ở bộ tối là màu sáng) | 10,1 | 11,4 | 18,0 | 16,9 | 15,0 | **1,1** | **1,1** | **1,1** |
| `.timer-chip` (nền `--plum-deep` = `--c-danger`) | 3,5 | 3,3 | 6,6 | 3,1 | 7,2 | 2,8 | 3,7 | 2,8 |

Ở 3 bộ tối, thông báo nhỏ (toast) là chữ trắng trên nền gần trắng, gần như không đọc được.

**Nguyên nhân 2: một số biến của bộ giao diện chưa đạt chuẩn.** Ví dụ Kẹo Bông: chữ phụ `--c-text-2` chỉ đạt 2,97; chữ trắng trên màu nhấn `--c-accent` đạt 2,13; nút chính đạt 3,51. Bento và Sticker có chữ trắng trên màu nhấn đạt 2,80 và 3,11.

**Cách sửa:**
1. Thêm các biến "chữ nằm trên nền màu" cho mọi bộ: `--c-on-accent`, `--c-on-accent-2`, `--c-on-good`, `--c-on-danger`; biến "màu nhấn dùng làm chữ" `--c-accent-ink`, `--c-danger-ink`; biến thông báo `--c-toast-bg`, `--c-toast-text`.
2. Thay **mọi** `color:#fff` / `color:white` ở màn phụ huynh (cả trong `app.css` và style inline trong JSX) bằng biến `--c-on-...` tương ứng với nền của chỗ đó. Chỗ nào dùng màu nhấn làm màu chữ (nhãn, link, số liệu) thì dùng `--c-accent-ink`. Trang admin không thuộc phạm vi.
3. Giá trị đề xuất (đã tính để đạt 4,5:1 trên cả nền trang và nền thẻ; giữ nguyên màu nền thương hiệu khi có thể, chỉ đổi màu chữ):

| Bộ | `--c-text-2` | `--c-accent-ink` | `--c-on-accent` | `--c-on-accent-2` | `--c-on-good` | `--c-on-danger` | `--c-good-fg` / `--c-warn-fg` | `--c-danger-ink` | toast nền / chữ | Đổi thêm |
|---|---|---|---|---|---|---|---|---|---|---|
| `candy` | `#786C83` | `#A35C76` | `#4A3B5C` | `#4A3B5C` | `#4A3B5C` | `#FFFFFF` | `#287B6A` / `#916B08` | `#BA4A76` | `#1E1B2E` / `#FFFFFF` | `--c-btn: linear-gradient(#FFC9DD, #FFA9CA)`, `--c-btn-text: #4A2B45` (nút hồng nhạt chữ mận đậm, giống bản vẽ); nền nút "nguy hiểm" `#C14D7A` |
| `bear` | `#8B6D50` | `#9B6916` | `#4B3621` | `#4B3621` | `#4B3621` | `#FFFFFF` | `#3F7A3E` / `#976500` | `#9F670B` | `#1E1B2E` / `#FFFFFF` | nền nút "nguy hiểm" `#A3690C` |
| `bento` | `#6B6E80` | `#BD4F40` | `#15161E` | `#15161E` | `#15161E` | `#FFFFFF` | `#157E4D` / `#9A6700` | `#B42318` | `#1E1B2E` / `#FFFFFF` | `--c-accent-text: #15161E`. **Bỏ khối đen** (chốt 24/10): `--c-text: #1E1B3A`, `--c-btn: linear-gradient(135deg, #FF7A66, #9B8CFF)`, `--c-btn-text: #1F1A45`, `--c-read-bg: #EEEBFF`, `--c-read-text: #2E2A5E`; tab đang chọn nền `#EEEBFF` chữ `#2E2A5E`; bong bóng chat của mẹ nền `#EEEBFF` |
| `sticker` | `#5C5A70` | `#C73E6C` | `#1B1B2F` | `#FFFFFF` | `#1B1B2F` | `#1B1B2F` | `#1B1B2F` / `#1B1B2F` | `#C73E6C` | `#1E1B2E` / `#FFFFFF` | `--c-btn-text: #1B1B2F`, `--c-accent-text: #1B1B2F` (chữ đen trên hồng, đúng chất sticker); nền `accent-2` khi có chữ trắng: `#5667F2` |
| `notebook` | `#756D5E` | `#AC5533` | `#FFFFFF` | `#FFFFFF` | `#2A2622` | `#FFFFFF` | `#4F6B3F` / `#956400` | `#A32A1A` | `#1E1B2E` / `#FFFFFF` | nền nút màu nhấn có chữ trắng: `#B85B37` |
| `garden` | `#A9C4B5` | `#FFD166` | `#0F2A24` | `#0F2A24` | `#0F2A24` | `#0F2A24` | `#6EE7B7` / `#FFD166` | `#FF6E6E` | `#F6F1E6` / `#0F2A24` |  |
| `aurora` | `#B2B5C3` | `#22D3EE` | `#0B1026` | `#0B1026` | `#0B1026` | `#0B1026` | `#34D399` / `#F9A8D4` | `#F54C69` | `#F6F1E6` / `#0B1026` | `--c-text-2` dùng màu đặc `#B2B5C3` thay cho màu trong suốt |
| `chalk` | `#CFC8B8` | `#F9E07F` | `#2F4A41` | `#2F4A41` | `#2F4A41` | `#FFFFFF` | `#B5E8A8` / `#F9B5D0` | `#FBAFAF` | `#F6F1E6` / `#2F4A41` | nền nút "nguy hiểm" `#BC5656` |

4. Viết **test tương phản tự động**: dùng `@axe-core/playwright` (chỉ là devDependency, không vào bản build) chạy luật `color-contrast` trên Màn chính, Hỏi con, Xong bài, Báo cáo, Con tôi và một toast, lần lượt ở 8 bộ. Test hỏng nếu có lỗi tương phản ở màn phụ huynh. Bổ sung test tính tương phản từ bảng biến (đã có ở prompt 01) cho các cặp mới ở trên.
5. Chụp ảnh trước và sau ở 8 bộ cho các chỗ: nút màu xanh lá, nút cam, nút xanh dương, số bậc, tin nhắn chat của mẹ, toast, đồng hồ hẹn giờ.

### PHẦN B · Bố cục riêng từng bộ, theo dõi học đều, icon riêng

### Bảng ánh xạ bộ trong thiết kế
| Chữ trong file thiết kế | id trong app | Tên |
|---|---|---|
| A | `aurora` | Cực Quang |
| B | `sticker` | Sticker Studio |
| C | `notebook` | Sổ Tay Buổi Tối |
| D | `bento` | Bento Mềm |
| E | `garden` | Khu Vườn Đêm |
| F | `chalk` | Bảng Phấn |
| G | `candy` | Kẹo Bông (mặc định) |
| H | `bear` | Bạn Gấu |

File `8-bo-giao-dien-rieng.html` có **đủ 12 màn cho mỗi bộ** theo thứ tự: Đăng nhập, Màn chính, Chụp bài, Soát đề, Giải thích cho mẹ, Hỏi con từng bước, Xong bài, Hỏi thêm AI, Trò chơi, Báo cáo, Con tôi, Góc hạ hoả. File này **thay thế** `8-bo-giao-dien-app.html` cho các màn trên. Các sheet nhỏ (Hẹn giờ, Sổ sticker, Thêm con, Mời thành viên...) dùng bộ linh kiện của mục 8, không cần bản vẽ riêng. Màn Góc hạ hoả chỉ làm khi đã làm prompt 08; nếu chưa thì bỏ qua màn đó.

### Việc cần làm

**1. Kiến trúc "khe giao diện" (theme slots)**
- Tách phần trình bày của 3 màn thành các **khe** (slot). Mỗi bộ cung cấp component riêng cho từng khe; bộ nào không có thì dùng component mặc định.

| Khe | Màn | Nhận vào (props) | Gọi ra |
|---|---|---|---|
| `HomeHero` | Màn chính | `child, parentName, dateLabel, grade` | |
| `StudyTracker` | Màn chính | kết quả `useStudyTracker` (mục 2) | `onOpenReport` |
| `StartAction` | Màn chính | `modes: ['photo','type','voice']`, `lastMode` | `onStart(mode)` |
| `HomeExtras` | Màn chính | `lastSession` (tối qua), lối vào Trò chơi, Góc bình tĩnh | `onOpen(key)` |
| `StepProgress` | Hỏi con | `total, current, doneSteps` | |
| `ReadCard` | Hỏi con | `question, stepIndex, childName` | `onSpeak` |
| `HintList` | Hỏi con | `hints: [{level, text}]`, `openedLevels` | `onOpenHint(level)` |
| `AnswerReveal` | Hỏi con | `answerForParent` | `onRevealed` |
| `ScaffoldActions` | Hỏi con | | `onStuck, onAnswered` |
| `DoneCelebration` | Xong bài | `problemNo, selfSteps, totalSteps, minutes, newSticker, tracker` | |
| `TeachBackPicker` | Xong bài | `value: self|hint|guided` | `onChange` |
| `DoneNext` | Xong bài | `siblingProblem, game` | `onOpen(key), onFinish` |

- Cấu trúc thư mục: `src/themes/slots/default/*.jsx` và `src/themes/slots/<id>/*.jsx`; một `registry.js` có `getSlot(themeId, slotName)`.
- **Component khe chỉ trình bày.** Không gọi API, không đọc ghi state trực tiếp, không tự tính số liệu; mọi logic ở hook và màn cha hiện có. Nhờ vậy đổi bộ giữa chừng (đang ở bậc 2) vẫn giữ nguyên bậc, gợi ý đã mở, thời gian.
- **Ngang quyền chức năng:** bộ nào cũng phải có đủ hành động: 3 cách nhập đề, Mít bí, Trả lời được, 2 mức gợi ý, xem đáp án cho mẹ, loa đọc to, 3 mức "Con dạy lại mẹ", Bài anh em, Trò chơi, Xong tối nay. Mỗi hành động gắn cùng một `data-testid` ở mọi bộ.
- **Tải theo bộ:** mỗi bộ là một chunk riêng (`React.lazy` + dynamic import). Lúc khởi động chỉ tải chunk của bộ đang dùng (tải trước bằng `<link rel="modulepreload">` hoặc import sớm sau khi đọc theme). Trong lúc chờ chunk, hiển thị component **mặc định** chứ không hiện vòng xoay, để không giật bố cục.
- Ngân sách: mỗi chunk bộ không quá **30 KB gzip** (gồm khe của 3 màn, biến linh kiện, 4 icon và hình mở đầu); hình minh hoạ là SVG nội tuyến, không dùng ảnh PNG/JPG, không thêm thư viện animation hay confetti.

**2. Theo dõi học đều mỗi ngày (`useStudyTracker(childId)`)**
- **Một tối học** = một ngày có ít nhất **1 bài đi tới màn Xong bài**. Ngày tính theo giờ Việt Nam, tuần bắt đầu thứ Hai. Học sau nửa đêm đến **03:00** vẫn tính cho tối hôm trước.
- **Lưu dữ liệu:** thêm `studyLog` cho từng trẻ trong state gia đình, mỗi lần tới màn Xong bài thêm một bản ghi `{id, ts, problemType, totalSteps, selfSteps, teachBack, minutes}`. Đồng bộ như dữ liệu khác của state. Nếu prompt 00 đã xong thì đồng thời ghi `learning_sessions`.
- **Dữ liệu cũ:** lần đầu chạy, suy ra các ngày đã học từ `timestamp` của `stickerHistory` (bỏ bản ghi `sample: true`), chỉ đọc, **không sửa, không xoá** `stickerHistory`. Đánh dấu `studyLogBackfilled: true` để không chạy lại.
- **Kết quả hook trả về:**
  - `week`: 7 ngày, mỗi ngày `{date, label: 'T2'...'CN', status: 'done' | 'rest' | 'today' | 'todayDone' | 'future'}`;
  - `weekCount`, `weekGoal` (mặc định **4 tối**, bố mẹ chỉnh 2 đến 7 trong Hồ sơ của con; người "Chỉ xem" không chỉnh được);
  - `streak`: số tối liên tiếp. Hôm nay chưa học thì chuỗi vẫn giữ tới hết ngày, không bị tính là đứt;
  - `bestStreak`, `lastSession` (dùng cho thẻ "Tối qua");
  - `month`: lưới các ngày trong tháng cho màn Báo cáo.
- **Câu chữ không gây áp lực** (bắt buộc ở mọi bộ):
  - Ngày không học hiện màu trung tính, **không** đỏ, **không** dùng chữ "bỏ lỡ", "trốn học", "mất chuỗi".
  - Chuỗi đứt thì hiện "Bắt đầu chuỗi mới nào", không nhắc chuỗi cũ đã mất.
  - Đạt mục tiêu tuần thì có một lời chúc nhỏ ("Đủ 4 tối rồi, cả nhà ăn mừng nhé"); vượt mục tiêu không có thêm áp lực.
  - Không gửi thông báo đẩy dựa trên chuỗi trong prompt này.
- **Màn Báo cáo:** thêm lưới tháng (một ô mỗi ngày, ô đã học tô màu nhấn của bộ, ô hôm nay có viền), dưới đó là dòng "Tháng này: 12 tối · chuỗi dài nhất 5 tối". Lưới tháng dùng chung bố cục, chỉ đổi màu theo bộ.
- Mỗi trẻ một bộ số liệu riêng; đổi con ở màn chính thì ô theo dõi đổi theo.

**3. Thành phần riêng của từng bộ** (xem đúng hình trong file thiết kế; số liệu trong hình chỉ minh hoạ)

| Bộ | Màn chính: theo dõi học đều | Màn chính: nút bắt đầu và phần còn lại | Hỏi con: tiến độ, câu đọc to, gợi ý | Đáp án cho mẹ | Xong bài |
|---|---|---|---|---|---|
| `aurora` | 7 chấm tròn, ngày đã học phát sáng có dấu ✓, nhãn "🔥 3 tối liên tiếp" | Vòng tròn lớn viền xoay màu ở giữa màn, 3 thẻ kính mờ cho 3 cách nhập | Thanh 4 vạch phát sáng; thẻ kính mờ; chấm gợi ý đập nhịp | Thẻ kính mờ có vệt sáng lướt, giữ 1,5 giây | Huy chương lơ lửng có tia sáng xoay, 3 ô số liệu |
| `sticker` | **Thẻ đục lỗ** 7 ô tròn nét đứt, ngày đã học dán sticker nghiêng, hôm nay viền hồng nhấp nháy | Đầu trang dải vàng cắt răng cưa; 3 ô nhập như sticker; nút "BẮT ĐẦU!" to nhún nhảy | Thẻ câu hỏi như lá bài có băng dính; gợi ý xếp bậc thang lệch nhau | Ô sọc chéo nét đứt | Chữ "XONG RỒI!" bung ra, vé sticker mới, 3 mặt cười |
| `notebook` | **Nhật ký tuần**: hàng T2 đến CN kẻ ô, ngày đã học có dấu ✓ viết tay, hôm nay khoanh tròn; câu viết tay "3 trang liền rồi" | Tiêu đề chữ có chân lớn có gạch chân vẽ tay; thẻ giấy dán băng dính liệt kê 3 cách nhập, con dấu "Đã soát" | Câu đọc to dạng trích dẫn với chữ hoa đầu lớn; gợi ý là chú thích cuối trang đánh số | Góc giấy gấp, kéo lật | Con dấu "Xong rồi", 3 ô tick viết tay, hàng ngày trong tuần |
| `bento` | Ô **vòng mục tiêu tuần** (3/4) + ô **7 cột** theo ngày, hôm nay cột nét đứt | Lưới ô kiểu widget điện thoại; ô lớn "Bài tối nay" đổ màu cam sang tím chứa 3 cách nhập; thanh tab nổi bo tròn, tab đang chọn là viên tím nhạt; **không dùng khối đen ở bất kỳ đâu**, màu đậm chỉ dành cho chữ | Số bậc cỡ lớn "2 / 4" và thanh 4 đoạn; câu đọc to trên thẻ tím nhạt chữ chàm; gợi ý mở như menu xổ xuống | Vòng tròn đầy dần khi giữ, như mở khoá | Dấu tích lớn bật ra, 3 ô số liệu, chọn mức hiểu bài bằng thanh 3 nút liền |
| `garden` | **Cảnh vườn đêm**: cây ra thêm 1 lá mỗi tối học, đủ mục tiêu tuần thì nở hoa; dưới là 7 chậu cây T2 đến CN | Nút chính là **đèn lồng** phát sáng; thẻ góc lá; đom đóm bay | 4 viên đá trên lối đi qua vườn; gợi ý là đom đóm, chạm mới thắp sáng | Lật chiếc lá | Bông hoa nở có ánh sáng, hàng hoa của tuần, 3 mức hiểu bài là 3 cỡ cây |
| `chalk` | **Đếm que** kiểu gạch 5 + lịch tuần có **vòng phấn** khoanh ngày đã học | Cả màn là bảng có khung gỗ và gờ để phấn; gạch chân tự vẽ; khung phấn vàng "BẮT ĐẦU BÀI TỐI NAY" | Danh sách 4 bậc viết phấn (xong ✓, đang làm ➜, chưa tới mờ); gợi ý là giấy nhớ dán bảng | Cục lau bảng, giữ để lau | Ngôi sao phấn tự vẽ, mặt cười được khoanh tròn |
| `candy` | **Lọ kẹo**: mỗi tối học thêm một viên kẹo rơi vào lọ; 7 hạt kẹo T2 đến CN | Mây trắng góc trên; nút kẹo dẻo có mặt cười nhún; thẻ "Tối qua" | Hạt kẹo xâu trên dây là các bậc; bạn Mây nói câu đọc to trong bong bóng; gợi ý là viên kẹo phải bóc mới đọc | Hộp kẹo sọc | Kẹo rơi, lọ thêm 1 viên; 3 mức hiểu bài là 3 loại kẹo |
| `bear` | **7 dấu chân gấu** so le, ngày đã học in màu mật ong, hôm nay nhấp nháy | Gấu vẫy tay với bong bóng thoại chào con; nút **hũ mật**; bong bóng "Tối qua · Gấu nhớ nè" | 4 hũ mật đầy dần là tiến độ; gấu giơ bảng gỗ có câu đọc to; gợi ý trong bong bóng thoại của gấu | Mở nắp hũ mật | Gấu ôm huy hiệu, "dấu chân thứ 4 đã in", 3 mức là 3 chú gấu |

- Hình gấu, cây, lọ kẹo, ngôi sao phấn: **SVG tự vẽ**, có trạng thái theo dữ liệu (số lá theo `weekCount`, số viên kẹo theo `weekCount`, dấu chân theo `week`). Không dùng emoji cho các nhân vật này; emoji chỉ dùng cho icon phụ.
- Bộ tối (`aurora`, `garden`, `chalk`): kiểm tra kỹ chữ trên nền tối; tiêu đề phải dùng biến chữ của bộ, không kế thừa màu tối từ chỗ khác.

**4. Thao tác "xem đáp án cho mẹ" ở mọi bộ**
- Giữ 1,5 giây mới mở (hình thức theo bộ: vòng đầy dần, lau bảng, mở nắp hũ, lật lá...). Có phản hồi tiến độ trong lúc giữ, thả tay sớm thì đóng lại.
- Bàn phím và trình đọc màn hình: là một nút có nhãn "Xem đáp án cho mẹ"; giữ phím Space 1,5 giây, hoặc bấm 2 lần trong 2 giây thì mở.
- Mở rồi thì gọi `onRevealed` như hiện nay (để ghi nhận như logic cũ).

**5. Hiệu ứng và hiệu năng**
- Tuân theo tuỳ chọn "Hiệu ứng" của prompt 01: **Đầy đủ** chạy hết; **Nhẹ** chỉ giữ hiệu ứng vào màn (không có vòng lặp trang trí); **Tắt** không có animation, trạng thái cuối hiện ngay.
- Chỉ animate `transform` và `opacity`; hiệu ứng vào màn không quá 1,2 giây; hiệu ứng ăn mừng ở Xong bài không quá 2,5 giây rồi dừng.
- Tối đa 6 phần tử trang trí chuyển động cùng lúc trên một màn.

**6. Chất lượng**
- Chữ thân đạt tương phản WCAG AA 4,5:1, chữ to (từ 24px, hoặc từ 18,7px đậm) đạt 3:1, ở cả 8 bộ, kể cả chữ trên SVG, trên thẻ màu và trên nút. Dùng các biến `--c-on-...` của phần A, không viết cứng `#fff`.
- Màn 360px: không tràn ngang; nút bấm tối thiểu 44 x 44px; chữ thân tối thiểu 15px, chữ nhỏ nhất 12px.
- Ô theo dõi luôn có chữ đi kèm (ví dụ "3 tối liên tiếp", "3/4 tối tuần này"), không chỉ dựa vào màu hay hình.

**7. Bộ icon riêng từng bộ** (xem mục "Bộ icon riêng từng bộ" đầu file thiết kế)
- **4 tab thanh dưới: mỗi bộ có 4 hình riêng theo chủ đề**, không chỉ đổi màu. Giữ đúng nhãn hiện tại (Học tối nay, Trò chơi, Báo cáo, Con tôi).

| Bộ | Học tối nay | Trò chơi | Báo cáo | Con tôi | Kiểu tô | Khi được chọn |
|---|---|---|---|---|---|---|
| `aurora` | trăng khuyết và sao | tên lửa | chòm sao đi lên | mũ phi hành gia | nét `#9AA3C7`, tô rất nhạt | nét và tô chuyển màu xanh ngọc sang tím, phát sáng |
| `sticker` | ba lô | tay cầm game | cúp có ngôi sao | ngôi sao mặt cười | tô màu rực riêng từng tab, viền đen 2,1px, tab chưa chọn mờ 50% | nghiêng -8 độ, phóng 1,15, bóng cứng 2px |
| `notebook` | sách mở có dải đánh dấu | máy bay giấy | trang checklist | tem chân dung có răng cưa | chỉ nét mực mảnh 1,35px | mực đất nung, gạch chân vẽ tay dưới nhãn |
| `bento` | lưới 4 ô widget | mảnh ghép | biểu đồ vòng | avatar trong ô vuông bo | tô tím nhạt, nét xám | nằm trong viên tím nhạt, nét chàm, tô cam san hô |
| `garden` | đèn lồng | bọ rùa | chậu cây có nụ | bông hoa mặt cười | nét xanh lá nhạt, tô bạc hà rất nhạt | tô vàng đèn lồng, phát sáng, nền góc lá mờ |
| `chalk` | ngôi sao phấn | ô cờ ca-rô | que đếm và mũi tên | mặt cười vẽ tay | nét phấn 2px có hiệu ứng sần, thanh dưới đặt trên gờ gỗ | vàng phấn, có vòng phấn khoanh quanh |
| `candy` | đám mây và trăng | viên kẹo gói | lọ kẹo | kẹo dẻo mặt cười có má hồng | tô pastel riêng từng tab, viền mực tím 1,6px | nảy lên 3px, phóng 1,15, bóng hồng dưới đáy |
| `bear` | hũ mật | quả bóng | tổ ong | mặt gấu | tô kem, nét nâu 1,7px | tô mật ong, nằm trên vệt mật vàng nhạt |

- **3 nút nhập đề** (Chụp vở, Gõ đề, Đọc đề) giữ hình chung ở mọi bộ để mẹ dễ nhận ra, chỉ đổi kiểu tô theo bảng trên. Các icon nhỏ khác (quay lại, loa, chat, chia sẻ) giữ bộ icon nét hiện có, chỉ đổi màu.
- Lấy đúng hình trong file thiết kế: các `symbol` nằm trong sprite ngay sau thẻ `<body>`, id dạng `t-A-1` đến `t-H-4` (chữ là bộ theo bảng ánh xạ, số 1 đến 4 là thứ tự tab) và `t-cam`, `t-keys`, `t-mic`. Mỗi bộ chỉ đưa 4 symbol của mình vào chunk của bộ đó.
- **Lưu ý kỹ thuật:** CSS bên ngoài không chọn được phần tử bên trong `<use>`. Vì vậy thuộc tính trong symbol đọc từ biến CSS: lớp tô `fill:var(--if); opacity:var(--io)`, lớp nét `stroke:var(--is); stroke-width:var(--iw)`, chấm `fill:var(--ip)`, điểm nhấn `fill:var(--ia)`, má hồng `fill:var(--ic)`. Mỗi bộ chỉ đặt giá trị biến (xem CSS trong file thiết kế, khối "Bộ icon riêng từng bộ").
- Không dùng emoji cho các icon này. Icon có `aria-hidden="true"`, nhãn chữ luôn hiện bên dưới.
- Hiệu ứng khi chọn tuân theo tuỳ chọn "Hiệu ứng" (Tắt thì không phóng to, không nảy; vẫn đổi màu).

**8. Bộ linh kiện riêng cho 9 màn còn lại** (Đăng nhập, Chụp bài, Soát đề, Giải thích cho mẹ, Hỏi thêm AI, Trò chơi, Báo cáo, Con tôi, Góc hạ hoả)
- Giữ cấu trúc và thứ tự nội dung của từng màn như app hiện tại; chỉ thay **linh kiện** bằng bản của bộ. Các linh kiện dùng chung một bộ biến, mỗi bộ đặt giá trị riêng (khối CSS "Bộ linh kiện cho các màn còn lại" trong file thiết kế, biến bắt đầu bằng `--k`):
  - `Card` (thẻ thường và thẻ nhấn mạnh), `Button` (chính, phụ, nhỏ), `Field` (ô nhập có nhãn), `Chip`, `ListRow` (icon, chữ, phụ đề, mũi tên hoặc công tắc), `Stat` (ô số liệu), `ChatBubble` (của mẹ, của AI), `ChatInput`, `MonthGrid` (lưới tháng), `LockedAnswer`, `StepList`, `CameraFrame` (khung ngắm có 4 góc canh), `Shutter` (nút chụp), `LoginHero` (hình mở đầu).
- Điểm riêng của từng bộ:

| Bộ | Hình mở đầu ở Đăng nhập | Nút chụp | Ô "đã học" trong lưới tháng | Thẻ, nút, ô nhập |
|---|---|---|---|---|
| `aurora` | vòng tròn xoay màu có chữ "Kèm Con Học" | vòng xoay màu phát sáng | tròn chuyển màu xanh ngọc sang tím | kính mờ, nút chuyển màu, ô nhập trong suốt |
| `sticker` | 3 miếng sticker "KÈM", "CON", "HỌC ★" nghiêng | tròn hồng viền đen, bóng cứng | ô vàng viền đen có ★ | viền đen 3px, bóng cứng, thẻ nhấn mạnh màu vàng nghiêng nhẹ |
| `notebook` | bìa sổ da tối, chữ nghiêng, con dấu "TỪ 2026" | tròn đen viền đôi | dấu ✓ viết tay màu đất nung | giấy trắng viền mảnh, ô nhập chỉ có gạch chân, nút đen vuông |
| `bento` | lưới ô: ô lớn đổ màu có tên app và 2 ô icon | tròn trắng viền dải cam tím | ô tím bo góc | thẻ trắng bo 22px, nút dải màu cam sang tím chữ chàm, bong bóng chat của mẹ tím nhạt |
| `garden` | cảnh vườn đêm có cây và trăng | đèn lồng phát sáng | ô bạc hà có mầm cây | thẻ góc lá, nút vàng phát sáng |
| `chalk` | ngôi sao phấn và tên app viết phấn có gạch chân | vòng phấn đôi | vòng phấn xanh khoanh quanh số | viền phấn vẽ tay, thẻ nhấn mạnh là giấy nhớ vàng chữ đậm, ô nhập gạch chân nét đứt |
| `candy` | lọ kẹo và tên app chữ tròn | kẹo dẻo mặt cười | tròn hồng | thẻ trắng có "đáy kẹo dẻo", nút hồng nhạt chữ mận đậm |
| `bear` | gấu vẫy tay với bong bóng "Chào mẹ! Gấu chờ nãy giờ nè" | hũ mật | tròn mật ong có dấu chân | thẻ trắng viền kem, nút mật ong có đáy nâu |

- Câu chữ riêng theo bộ chỉ ở vài chỗ: dòng giới thiệu và nút ở màn Đăng nhập, tên trò thổi ở Góc hạ hoả (xem file thiết kế). Mọi nội dung khác giữ như app.
- Màn Đăng nhập ghi đúng sự thật về dữ liệu: "Dữ liệu được đồng bộ để mọi máy trong nhà cùng xem" (theo prompt 06, mục C1). Link "Đăng nhập bằng mã 6 số" chỉ hiện khi đã làm prompt 03.

### Không làm trong prompt này
- Không đổi logic AI, prompt AI, luồng màn hình, API máy chủ.
- 9 màn còn lại không đổi cấu trúc, thứ tự bước hay nội dung; chỉ thay linh kiện như mục 8 (và thêm lưới tháng vào Báo cáo).
- Không thêm thông báo đẩy, không thêm phần thưởng mới ngoài lời chúc khi đủ mục tiêu tuần.
- Không xoá hay sửa dữ liệu cũ (`stickerHistory`, sticker mẫu). Không tự xoá `studyLog`.
- Không thêm thư viện UI, animation, confetti.
- Vẫn theo quy tắc gói Cloudflare Free ở prompt 00 (không thêm request máy chủ mới cho phần theo dõi; số liệu tính ở máy người dùng từ state).

### Kiểm thử bắt buộc
1. **Ảnh chụp 8 bộ x 12 màn** ở bề ngang 390px, đặt cạnh hình tương ứng trong `8-bo-giao-dien-rieng.html`; ghi rõ chỗ nào khác thiết kế và lý do.
2. **Test ngang quyền:** render 3 màn với từng bộ, kiểm tra đủ mọi `data-testid` của hành động ở mục 1 và bấm được.
3. **Test `useStudyTracker`:** ranh giới tuần thứ Hai; học lúc 01:30 tính cho tối hôm trước; bỏ bản ghi `sample: true`; chuỗi giữ nguyên khi hôm nay chưa học; chuỗi đứt hiện "Bắt đầu chuỗi mới"; mục tiêu tuần 2 đến 7; hai trẻ không lẫn số liệu; suy ra từ `stickerHistory` mà `stickerHistory` không đổi một byte; chạy suy ra lần hai không thêm bản ghi.
4. Đang ở bậc 2 của Hỏi con, đổi bộ giao diện: vẫn ở bậc 2, gợi ý đã mở vẫn mở, thời gian không reset.
5. Xong một bài: ô theo dõi của hôm nay chuyển sang đã học ngay; máy thứ hai cùng gia đình thấy sau khi đồng bộ.
6. "Hiệu ứng: Tắt": không còn animation nào ở 3 màn; "Nhẹ": không còn vòng lặp trang trí.
7. Trình đọc màn hình (TalkBack hoặc VoiceOver): đọc được ô theo dõi bằng chữ, mở được đáp án cho mẹ bằng thao tác thay thế.
8. Kích thước chunk từng bộ (báo cáo bảng số KB gzip), không bộ nào quá 30 KB; Network chỉ tải chunk của bộ đang dùng.
9. Lighthouse mobile: Performance không giảm quá 5 điểm so với trước prompt này.
10. `npm run build` và `npm test` thành công.
11. Test `color-contrast` của axe chạy ở 8 bộ, 5 màn và toast: 0 lỗi ở màn phụ huynh (phần A).
12. Ảnh trước và sau của các chỗ chữ trắng đã sửa (phần A, bước 5).
13. Thanh dưới ở 8 bộ dùng đúng 4 hình riêng của bộ trong bảng mục 7 (không bộ nào trùng hình); 3 nút nhập đề đúng kiểu tô; không còn emoji; "Hiệu ứng: Tắt" thì icon không nảy, không xoay.
14. 9 màn còn lại ở 8 bộ dùng đúng linh kiện của bộ (mục 8); màn Đăng nhập có hình mở đầu riêng; test axe `color-contrast` chạy cả 9 màn này.

### Báo lại khi xong
- Danh sách file thêm, sửa; sơ đồ khe và component từng bộ.
- Bảng kích thước chunk từng bộ.
- Ảnh 8 bộ x 12 màn đặt cạnh thiết kế, các chỗ khác thiết kế.
- Danh sách các chỗ `color:#fff` đã thay (file, selector, biến mới).
- Kết quả 14 bước kiểm thử, mục nào chưa làm được và vì sao.
