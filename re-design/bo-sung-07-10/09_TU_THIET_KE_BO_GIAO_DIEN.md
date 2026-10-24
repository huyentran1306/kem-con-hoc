# Prompt 09 · Tự thiết kế bộ giao diện của nhà mình + bạn đồng hành riêng

**Cách dùng:** copy phần PROMPT gửi cho AI lập trình, kèm source app React + Vite bản mới nhất và file thiết kế `tham-khao/tu-thiet-ke.html` (mở bằng Chrome, phần "Prompt 09": 3 màn chọn và xem trước, 3 bộ tự ghép mẫu). Bảng màu và linh kiện tham chiếu ở `tham-khao/8-bo-giao-dien-rieng.html`.

**Phụ thuộc:** **cần prompt 07 phần B** (khe bố cục, bộ linh kiện theo biến, 4 icon thanh dưới, bạn đồng hành có trạng thái). Nên có prompt 03 để biết ai trong nhà được đổi giao diện. Không cần máy chủ mới ngoài những gì prompt 00 đã có.

**Ý tưởng:** thay vì chỉ chọn 1 trong 8 bộ, con và mẹ **tự ghép bộ của nhà mình**: màu chính, nền sáng hay tối, kiểu chữ, kiểu nút, bạn đồng hành, bộ icon. Bấm là bản xem trước đủ các màn đổi ngay. Có nút Ngẫu nhiên cho con bấm chơi, và mã 6 ký tự để nhà khác dùng thử bộ của mình. Gom luôn vào đây hai ý AI liên quan tới cá nhân hoá: **bạn đồng hành có tính cách** và **kể chuyện hoá đề bài theo bạn đồng hành**.

---

## PROMPT

Bạn là kỹ sư frontend React của app **Kèm Con Học**. App đã có 8 bộ giao diện với bố cục, linh kiện và icon riêng (prompt 07). Hãy thêm **bộ thứ 9: "Tự thiết kế"**, do gia đình tự ghép từ các lựa chọn có sẵn, và **bạn đồng hành** đi theo bộ đó. Mọi tổ hợp phải đạt chuẩn tương phản mà không cần kiểm tra tay.

### Hiện trạng cần biết
- Bộ giao diện là `data-theme` + khối biến CSS; prompt 07 đã tách 3 màn chính thành khe, 9 màn còn lại dùng linh kiện đọc biến `--k...`, 4 icon thanh dưới là symbol SVG đọc biến `--if --is --ip --ia --ic`.
- "Giao diện cả nhà" là lưới 8 thẻ trong Con tôi; chọn thì áp dụng ngay để xem thử, xác nhận mới lưu; lưu `state.theme` và `localStorage['kem-con-hoc:theme']`.
- Bộ Gấu đã có SVG gấu 3 trạng thái (chào, nhắc, vui) theo prompt 01.

### Việc cần làm

**1. Mô hình dữ liệu của bộ tự thiết kế**
- `state.theme = 'custom'` và `state.customTheme = { v: 1, color, mode, font, shape, buddy, icons }`:
  - `color`: 1 trong 8 (`pink, honey, violet, cyan, mint, coral, blue, yellow`);
  - `mode`: `light | dark`;
  - `font`: `round | serif | hand | clean` (Baloo 2, Playfair Display + Lora, Mali + Nunito, Lexend + Inter; tất cả đã tự host từ prompt 01);
  - `shape`: `soft | sticker | paper | glass` (bo tròn mềm có đáy, viền đậm bóng cứng, giấy viền mảnh bo 4px, kính mờ);
  - `buddy`: `bear | cloud | unicorn | dragon | cat | star | sprout | none`;
  - `icons`: `auto` (theo bạn đồng hành) hoặc id của 1 trong 8 bộ icon có sẵn.
- Toàn bộ chỉ vài chục byte, lưu trong state gia đình như dữ liệu khác, đồng bộ mọi máy. `localStorage['kem-con-hoc:theme']` lưu `custom` và `localStorage['kem-con-hoc:custom-theme']` lưu JSON để áp trước khi React render (script trong `index.html` đọc cả hai).

**2. Bảng màu đã tính sẵn (`src/themes/customPalette.js`)**
- Với mỗi `color` x `mode` (16 tổ hợp) định sẵn **đủ bộ biến** của prompt 01 và 07: `--c-bg, --c-surface, --c-text, --c-text-2, --c-accent, --c-accent-ink, --c-on-accent, --c-btn, --c-btn-text, --c-good..., --c-toast-*` và các biến `--k...`, `--if...`.
- Giá trị tính bằng script `scripts/gen-custom-palette.mjs` chạy lúc build: từ màu chính sinh ra các sắc độ (dùng OKLCH, không thêm thư viện lớn; viết hàm chuyển đổi khoảng 60 dòng), rồi **đẩy màu chữ tối hoặc sáng dần cho tới khi đạt 4,5:1 trên nền trang và nền thẻ**, nút chính đạt 4,5:1 với chữ trên nút. Script có test: 16 tổ hợp x các cặp đều qua.
- **Không cho nhập mã màu tự do** ở bản này (để sau), vì không bảo đảm được tương phản và tốn công kiểm thử.
- `shape` chỉ đổi biến hình học: `--radius-*`, `--border-w`, `--shadow-*`, `--kbd, --ksh, --kbbd`; `glass` thêm `backdrop-filter` và lớp dự phòng như bộ Cực Quang.
- `font` chỉ đổi `--font-head, --font-body, --font-hand, --kh, --khw`.

**3. Bạn đồng hành (`src/themes/buddies/*.jsx`)**
- 7 nhân vật SVG tự vẽ, mỗi nhân vật **3 trạng thái**: `hello` (Màn chính), `nudge` (thẻ nhắc, Góc hạ hoả), `cheer` (Xong bài). Gấu dùng lại SVG đã có. Mỗi nhân vật dưới 4 KB, màu lấy từ biến của bộ nên đổi màu chính thì nhân vật đổi phụ kiện theo (khăn, nơ, mũ).
- Vị trí xuất hiện: khe `HomeHero` (chào có bong bóng thoại), thẻ "Cô nhắc" nếu có (prompt 04 mục 4b), `DoneCelebration` (ôm huy hiệu), màn thổi của Góc hạ hoả (prompt 08: nhân vật thay cho hình mặc định của bộ, ví dụ "thổi nguội sữa cho Rồng con").
- Bong bóng thoại của bạn đồng hành có **giọng riêng** theo nhân vật: 8 câu chào, 8 câu nhắc, 8 câu khen cho mỗi nhân vật, viết sẵn trong code, không gọi AI. Ví dụ Rồng con: "Rồng con phun lửa hơ ấm vở cho Mít nè!".
- `buddy = none`: bộ chạy không có nhân vật, các khe hiện như bộ Bento.
- Icon `auto`: 4 icon thanh dưới theo nhân vật (gấu → bộ Gấu; mây → bộ Kẹo Bông; kỳ lân → Sticker; rồng con → Cực Quang; mèo → Sổ Tay; sao → Bảng Phấn; mầm → Khu Vườn Đêm; none → Bento).

**4. Màn "Tự thiết kế" (xem bản vẽ)**
- Vào từ thẻ thứ 9 "✨ Tự thiết kế" trong "Giao diện cả nhà". 6 bước trên một màn cuộn hoặc 3 trang (như bản vẽ), có thanh tiến độ 6 đoạn.
- **Bản xem trước nhỏ** (3 màn thu gọn vẽ bằng khối màu) luôn hiện và đổi tức thì khi chạm lựa chọn; không gọi component thật ở bước này để nhẹ.
- Màn cuối **"Bộ của nhà Mít"**: dải ngang 5 màn thu nhỏ (Màn chính, Hỏi con, Xong bài, Báo cáo, Đăng nhập) **vẽ bằng component thật** ở tỉ lệ 0,55 với dữ liệu mẫu, không tương tác. Dòng chữ "Chữ đạt chuẩn dễ đọc ✓" chỉ hiện khi test tương phản của tổ hợp đó qua (luôn qua với bảng đã tính, nhưng vẫn kiểm tra lúc chạy để chắc).
- Nút **🎲 Ngẫu nhiên**: xáo 6 lựa chọn, có hiệu ứng lắc nhẹ; bấm liên tiếp được.
- "Dùng cho cả nhà" lưu như quy trình chọn bộ của prompt 01 (áp thử, xác nhận mới lưu, rời màn thì quay về bộ cũ). Quyền: chủ nhà và người "Kèm con"; "Chỉ xem" chỉ xem.
- Bộ tự thiết kế hiện trong lưới "Giao diện cả nhà" như một thẻ bình thường, có nút "Sửa".

**5. Mã bộ giao diện**
- Mã 6 ký tự dạng `XXX-XXX` mã hoá trực tiếp 6 lựa chọn (không cần máy chủ): 8 x 2 x 4 x 4 x 8 x 9 = 18.432 tổ hợp, đủ với bảng chữ 32 ký tự bỏ 0/O/1/I. Có 1 ký tự kiểm tra để gõ sai thì báo ngay.
- Màn "Giao diện cả nhà" có ô "Nhập mã bộ giao diện của nhà khác": nhập đúng thì áp thử ngay, xác nhận mới lưu.
- Chia sẻ mã qua bảng chia sẻ của điện thoại (dùng lại `navigator.share` như báo cáo).

**6. Kể chuyện hoá đề bài theo bạn đồng hành (AI, tuỳ chọn)**
- Nút "Kể thành chuyện" ở màn Soát đề (chỉ hiện khi đề là toán có lời văn). Prompt mới `p9_story_wrap` trong Prompt Studio, biến `{{de_bai}}`, `{{ten_con}}`, `{{ban_dong_hanh}}`, `{{xung_ho}}`.
- Quy tắc: **giữ nguyên mọi số liệu và phép tính**, chỉ đổi bối cảnh và nhân vật; không quá 60 từ; trả JSON `{ "de_ke_chuyen": "...", "giu_nguyen_so_lieu": true }`. Máy khách kiểm tra tập số trong đề gốc và đề kể chuyện phải trùng nhau, lệch thì bỏ và báo "Mình giữ đề gốc nhé".
- Đề kể chuyện chỉ dùng để **đọc cho con nghe**; bài giảng p3 vẫn soạn từ đề gốc. Tối đa 2 lần gọi mỗi tối mỗi gia đình.

**7. Admin (khối "Giao diện app", prompt 01 hoặc tab [5] của prompt 05)**
- Số gia đình dùng bộ tự thiết kế; 5 tổ hợp phổ biến nhất (đếm từ `state.customTheme`, không có tên gia đình); công tắc bật tắt tính năng tự thiết kế (mặc định bật).

### Không làm trong prompt này
- Không cho nhập mã màu tự do, không cho tải ảnh làm nền hay nhân vật.
- Không thêm thư viện màu, animation hay UI.
- Không đổi 8 bộ có sẵn.
- Không tự xoá `customTheme` khi tắt tính năng; nhà đang dùng vẫn giữ.
- Theo quy tắc gói Free ở prompt 00 (không endpoint mới, không cron).

### Kiểm thử bắt buộc
1. Test bảng màu: 16 tổ hợp màu x nền, mọi cặp chữ và nền đạt 4,5:1, nút chính 4,5:1; chạy trong `npm test`.
2. Test axe `color-contrast` trên 5 màn xem trước với **tất cả 256 tổ hợp** màu x nền x chữ x nút (nhân vật và icon không ảnh hưởng màu): 0 lỗi.
3. Chạm từng lựa chọn: bản xem trước nhỏ đổi ngay, không giật. Ngẫu nhiên 20 lần liên tiếp không lỗi.
4. "Dùng cho cả nhà": máy thứ hai cùng gia đình đổi theo sau đồng bộ; tải lại trang không nháy màu; "Chỉ xem" không có nút lưu.
5. Mã bộ giao diện: tạo mã, nhập ở gia đình khác ra đúng 6 lựa chọn; gõ sai 1 ký tự báo lỗi ngay.
6. Bạn đồng hành hiện đúng 3 trạng thái ở Màn chính, Xong bài, Góc hạ hoả; `buddy = none` không vỡ bố cục; đổi màu chính thì phụ kiện nhân vật đổi màu.
7. Kể thành chuyện: đề kể chuyện có đúng tập số của đề gốc; AI trả lệch số thì giữ đề gốc và báo; lần gọi thứ 3 trong tối không gọi AI; bài giảng vẫn soạn từ đề gốc (kiểm tra payload `/chat`).
8. Admin tắt tính năng: thẻ "Tự thiết kế" ẩn với nhà mới, nhà đang dùng giữ nguyên.
9. Kích thước: chunk của bộ tự thiết kế (bảng màu + 7 nhân vật + màn chọn) không quá 40 KB gzip; chỉ tải khi mở màn hoặc khi nhà đang dùng `custom`.
10. "Hiệu ứng: Tắt": không lắc, không nảy; `npm run build` và `npm test` thành công.

### Báo lại khi xong
- File thêm, sửa; script sinh bảng màu và kết quả test 16 tổ hợp.
- Ảnh 3 màn chọn, màn xem trước, 3 bộ tự ghép mẫu (Nhà Mít, Nhà Bon, Nhà Su như bản vẽ) ở 390px.
- Nội dung `p9_story_wrap`, câu chào/nhắc/khen của 7 nhân vật.
- Kết quả 10 bước kiểm thử, mục nào chưa làm được và vì sao.
