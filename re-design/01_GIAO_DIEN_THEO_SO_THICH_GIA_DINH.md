# Prompt 01 · Giao diện theo sở thích gia đình (8 bộ giao diện, đổi một chạm)

**Cách dùng:** copy phần PROMPT gửi cho AI lập trình, kèm source app React + Vite và file thiết kế `tham-khao/8-bo-giao-dien-app.html` (mở bằng Chrome để xem 8 bộ x 8 màn).

**Phụ thuộc:** làm độc lập được. Nếu đã làm prompt 00 thì lưu lựa chọn giao diện qua `PUT /api/v1/family/state`; nếu chưa thì lưu trong state JSON như hiện nay.

**Ý tưởng:** mỗi gia đình một gu. Mặc định app mở bằng một bộ giao diện; bố mẹ vào "Con tôi → Giao diện" chọn bộ khác, **toàn app đổi ngay**, mọi thiết bị của gia đình cùng đổi theo. Trẻ cấp 1 thích "Bạn Gấu", "Kẹo Bông"; bố mẹ thích tối giản chọn "Bento Mềm"; học buổi tối chọn "Khu Vườn Đêm" dịu mắt.

---

## PROMPT

Bạn là kỹ sư frontend React. App **Kèm Con Học** hiện chỉ có một giao diện hồng (Be Vietnam Pro, biến CSS ở `:root`). Hãy dựng **hệ thống giao diện (theme)** với 8 bộ đã thiết kế, chọn được trong app, áp dụng cho **toàn bộ màn hình của phụ huynh** (không áp dụng cho trang admin).

### Hiện trạng cần biết
- Biến CSS hiện có trong `:root`: `--bg:#fff7f9; --paper:#fff; --line:#f4dde7; --soft:#fcefe3; --ink:#3a2a33; --muted:#6b5d6b; --plum:#d9577f; --plum-deep:#9e3159; --plum-tint:#fde8ef; --coral:#f08a5d; --coral-deep:#c75b2f; --coral-tint:#ffede3; --mint:#1f7a5c; --mint-deep:#14604a; --mint-tint:#ddf3ea; --sun:#9a6400; --sun-tint:#fff1d2; --sun-line:#f1d08a; --sky:#1f5c8c; --sky-tint:#e2eff9; --red:#a83232; --radius:16px; --shadow-sm/md/lg`.
- Nhiều chỗ trong `screens.jsx` dùng **màu viết thẳng trong style inline** (hex). Các sticker dùng màu FontAwesome riêng.
- Icon đang là emoji (📷 ⌨️ 🎙️ 🌙 🎲 📊 🧒...) và FontAwesome 6.5.1 qua CDN.
- Không có theme switcher, không có dark mode, không có `data-theme`. Manifest `theme_color #FFF7ED`.
- State gia đình là một khối JSON (`kem-con-hoc:fam:{id}` + KV `fam:{id}:state`), đồng bộ lên máy chủ.

### Việc cần làm

**1. Chuẩn hoá biến màu (bước bắt buộc, làm trước)**
- Tạo bộ **biến ngữ nghĩa** dùng chung cho mọi theme: `--c-bg, --c-surface, --c-surface-2, --c-line, --c-text, --c-text-2, --c-accent, --c-accent-text, --c-accent-2, --c-good, --c-good-bg, --c-warn, --c-warn-bg, --c-danger, --c-read-bg, --c-read-text` (thẻ "Mẹ đọc to cho con"), `--c-hint1-bg, --c-hint1-line, --c-btn, --c-btn-text, --c-nav, --radius-lg, --radius-md, --radius-btn, --border-w, --shadow-card, --shadow-btn, --font-head, --font-body, --font-hand`.
- Map biến cũ sang biến mới (`--plum: var(--c-accent)` ...) để code cũ không vỡ.
- Rà toàn bộ `screens.jsx`, `ui.jsx`, `App.jsx`, `styles.css`: **thay mọi màu hex inline** ở màn phụ huynh bằng `var(--c-...)`. Ghi lại số chỗ đã thay trong báo cáo.

**2. Bảng 8 bộ giao diện** (file `src/themes.js`, mỗi bộ là một object; giá trị lấy từ file thiết kế, xem bảng dưới)

| id | Tên hiển thị | Nền / chữ chính | Màu nhấn | Font tiêu đề / thân | Hình dạng | Hiệu ứng riêng |
|---|---|---|---|---|---|---|
| `aurora` | Cực Quang | nền tối `#0B1026`, chữ `#F3F4FF` | `#22D3EE`, phụ `#A78BFA`, đúng `#34D399`, cảnh báo `#F472B6` | Unbounded / Plus Jakarta Sans | bo 24px, thẻ kính mờ (nền `rgba(255,255,255,.07)`, viền `rgba(255,255,255,.16)`) | lớp cực quang mờ trôi chậm phía sau, viền phát sáng |
| `sticker` | Sticker Studio | `#FFF7E6` / `#1B1B2F` | hồng `#FF4F8B`, vàng `#FFC928`, xanh ngọc `#39C6A5`, xanh dương `#5B6CFF` | Paytone One / Nunito | viền đen 3px, bóng cứng `5px 5px 0 #1B1B2F`, bo 20px | nút chính nhún, ô dán nghiêng nhẹ |
| `notebook` | Sổ Tay Buổi Tối | `#F6F1E7` / `#2A2622` | đất nung `#C4613A`, xanh rêu `#7D9A6B`, vàng `#D8A334` | Playfair Display / Lora, chữ tay Mali | bo 4px, nền giấy kẻ dòng | câu đọc to dạng trích dẫn ngoặc kép lớn, băng dính |
| `bento` | Bento Mềm | `#F7F7FA` / `#15161E` | `#FF6B57`, phụ `#8A7CFF`, đúng `#22B07D` | **Lexend** / Inter (thiết kế gốc dùng Sora, nhưng Sora không có tiếng Việt) | bo 24px, viền 1px `#E9EAF1`, bóng mềm | thẻ chính gradient cam sang tím |
| `garden` | Khu Vườn Đêm | nền tối `#0F2A24`, thẻ `#163B33`, chữ `#F2F7EE` | vàng đèn lồng `#FFD166`, đúng `#6EE7B7` | Comfortaa / Nunito | góc lá (28px 28px 28px 10px) | đom đóm bay, đèn lồng đung đưa |
| `chalk` | Bảng Phấn | nền bảng `#2F4A41`, chữ phấn `#F6F1E6` | vàng `#F9E07F`, hồng `#F7A1C4`, xanh `#9AD0F5`, đúng `#B5E8A8` | Coiny / Nunito, chữ tay Itim | viền 2px vẽ tay (`border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px`) | ngôi sao phấn nhấp nháy |
| `candy` | Kẹo Bông | `#FFF4F8` / `#4A3B5C` | hồng `#FF8FB8`, tím `#B9A3FF`, đúng `#7FD8C4`, vàng `#FFD36E` | Baloo 2 / Nunito | bo 28px, "đáy kẹo dẻo" `0 7px 0 #F3D9E6`, nút `0 6px 0 #E0598E` | mặt cười • ‿ • chớp mắt, sao lấp lánh, mây góc trên |
| `bear` | Bạn Gấu | `#FFF8EC` / `#4B3621` | mật ong `#F6A623`, xanh trời `#7FB7F5`, đúng `#8CC98B` | Mitr / Nunito | bo 26px, nút `0 6px 0 #C47F0E` | gấu bông trên thẻ chính và bong bóng "Gấu nhắc", dấu chân mờ |

- **Mặc định:** `DEFAULT_THEME = 'candy'` (gần màu hồng thương hiệu hiện tại nhất, người dùng cũ ít bị lạ). Chủ dự án có thể đổi hằng số này, hoặc admin đổi ở mục "Giao diện app" (bước 7).
- **Lưu ý font:** đã kiểm tra trên Google Fonts ngày 24/10: **Sora không có bộ `vietnamese`** nên Bento dùng Lexend. Unbounded, Paytone One, Coiny, Itim, Mitr, Baloo 2, Comfortaa, Playfair Display, Lora, Mali, Nunito, Plus Jakarta Sans, Inter đều có. Vẫn hiển thị thử câu "Mỗi hộp có 8 cây bút chì. Hỏi mẹ còn lại bao nhiêu?" ở cả 8 bộ để chắc chắn.
- **Tự host font** (file woff2 trong `public/fonts/`, chỉ bộ latin + vietnamese) thay vì tải từ Google Fonts: cần cho việc tạo ảnh báo cáo của prompt 03 (thư viện chụp ảnh không nhúng được font khác tên miền) và giúp tải nhanh hơn.
- Theme tối (`aurora`, `garden`, `chalk`): đặt `color-scheme: dark`, đổi `<meta name="theme-color">` theo theme.

**3. Áp dụng theme**
- `document.documentElement.dataset.theme = id`; CSS mỗi theme viết trong `[data-theme="..."] { ...biến... }`.
- **Chỉ tải font của theme đang dùng**: chèn `<link>` Google Fonts động khi đổi theme, có `display=swap`; tải trước font của theme mặc định trong `index.html`.
- Theme được áp **trước khi React render** (script nhỏ trong `index.html` đọc `localStorage['kem-con-hoc:theme']`) để không nháy màu.
- Chuyển theme có hiệu ứng mờ dần 250 ms (dùng View Transitions API nếu trình duyệt hỗ trợ, nếu không thì transition màu nền).

**4. Thành phần trang trí theo theme** (`src/ThemeDecor.jsx`, mỗi theme một lớp nền `position:absolute; pointer-events:none; z-index:0`)
- `aurora`: 3 đến 4 vệt màu blur trôi (CSS animation, không dùng canvas).
- `garden`: 5 đốm đom đóm; đèn lồng trên thẻ "Bài tối nay".
- `chalk`: ngôi sao phấn trên thẻ chính.
- `candy`: mây trắng góc trên, sao vàng lấp lánh, mặt cười chớp mắt trên thẻ chính.
- `bear`: hình gấu (thay emoji 🧸 bằng **SVG gấu tự vẽ** đơn giản, có 3 trạng thái: chào, nhắc, vui), dấu chân mờ.
- `notebook`: nền giấy kẻ dòng, băng dính trên thẻ.
- Trang trí **không được che chữ**, không nhận sự kiện bấm.

**5. Icon đồng bộ**
- Thay emoji ở **thanh điều hướng dưới, 3 nút nhập đề (Chụp vở, Gõ đề, Đọc đề), mic lớn, nút quay lại, loa, chat, chia sẻ** bằng bộ icon nét (gợi ý `lucide-react`, tree-shake từng icon). Màu theo `currentColor`.
- Mục đang chọn ở thanh dưới có nền mờ màu nhấn phía sau icon.
- Emoji trong nội dung (sticker, lời khen) giữ nguyên.

**6. Màn chọn giao diện**
- Vị trí: tab "Con tôi" → mục mới **"🎨 Giao diện cả nhà"**, đặt trên mục "Lịch chia ca".
- Lưới 8 thẻ xem trước (mỗi thẻ là mini màn chính vẽ bằng chính biến màu của theme đó, không dùng ảnh), tên bộ, 1 dòng mô tả, nhãn "Đang dùng". **Thẻ xem trước dùng font hệ thống** (không tải 8 font cùng lúc); chỉ khi bấm chọn mới tải font của bộ đó.
- Bấm thẻ: áp dụng ngay để xem thử; thanh dưới hiện "Dùng giao diện này cho cả nhà" và "Thôi". Rời màn mà không xác nhận thì quay về theme cũ.
- Thêm vào **onboarding** một bước tuỳ chọn: "Chọn giao diện con thích" (có nút "Để sau").
- Tuỳ chọn **"Hiệu ứng: Đầy đủ / Nhẹ / Tắt"** (mặc định Đầy đủ). Không tự tắt theo `prefers-reduced-motion` của hệ điều hành (máy công ty hay tắt sẵn), chỉ dùng nó để gợi ý mức "Nhẹ" lần đầu.

**7. Lưu, đồng bộ và quyền**
- **Ai được đổi:** chủ nhà và người "Kèm con" (vai trò `owner`, `guardian` của prompt 03). Người "Chỉ xem" (`viewer`) không thấy mục này. Trước khi có prompt 03, ai đăng nhập gia đình cũng đổi được.
- Lưu `state.theme` và `state.motion` trong state gia đình (đồng bộ mọi thiết bị như dữ liệu khác) và `localStorage['kem-con-hoc:theme']` (để áp trước khi tải state).
- Gia đình cũ chưa có `state.theme` → dùng theme mặc định do admin đặt (đọc từ cấu hình công khai, xem dưới), không có thì `DEFAULT_THEME`.
- **Admin:** KV `app_config:themes = { default: 'candy', enabled: ['aurora',...,'bear'] }`. Admin bật/tắt bộ nào được hiện, đặt bộ mặc định, xem thống kê số gia đình đang dùng mỗi bộ (đếm từ `state.theme`).
  - **Chỗ đặt:** nếu trang admin mới (prompt 05) chưa làm, thêm một khối nhỏ "🎨 Giao diện app" vào tab Prompt Studio của admin hiện tại; khi làm prompt 05 thì chuyển sang tab [5] Giao diện app.
  - **Tắt một bộ đang có nhà dùng:** nhà đó vẫn giữ bộ hiện tại cho tới khi tự đổi; bộ bị tắt chỉ biến khỏi danh sách chọn.

**8. Chất lượng**
- Tương phản chữ thân trên nền đạt **WCAG AA (4.5:1)** ở cả 8 bộ; nút chính đạt 3:1. Viết test nhỏ tính tương phản từ bảng màu trong `themes.js`, chạy trong `npm test`.
- Theme `aurora`: `backdrop-filter` nặng trên máy yếu → có lớp dự phòng nền đặc khi `@supports not (backdrop-filter: blur(1px))` hoặc khi chọn "Hiệu ứng: Nhẹ".
- Kiểm tra trên màn 360px: không tràn ngang, chữ thân tối thiểu 15px, chữ nhỏ nhất 12px.

### Không làm trong prompt này
- Không đổi luồng, nội dung, logic AI. Ở trang admin chỉ thêm khối "Giao diện app" nêu ở bước 7, không đổi gì khác (việc làm lại admin thuộc prompt 05).
- Không thêm thư viện UI nặng (MUI, Chakra...). Chỉ thêm `lucide-react` nếu cần.

### Kiểm thử bắt buộc
1. Đổi lần lượt 8 theme ở "Giao diện cả nhà": mọi màn (Home, Chụp bài, Analyze, Explain, Scaffold, Done, AskAI, SnapToy, Game, Report, Profile, các sheet) đổi màu, font, icon; không còn chỗ nào giữ màu hồng cũ (chụp ảnh 8 theme x 6 màn chính, đính kèm).
2. Chọn theme trên máy A, mở máy B cùng gia đình: máy B đổi theo sau khi đồng bộ.
3. Tải lại trang: không nháy màu theme cũ.
4. Test tương phản qua ở cả 8 bộ; font có tiếng Việt đủ dấu ở cả 8 bộ.
4b. Admin tắt bộ "Bảng Phấn" khi một nhà đang dùng: nhà đó vẫn giữ; nhà khác không còn thấy bộ này trong danh sách.
4c. Mở màn chọn giao diện: tab Network không tải 8 font cùng lúc.
5. "Hiệu ứng: Tắt" thì không còn animation trang trí; app vẫn đầy đủ chức năng.
6. Lighthouse mobile: Performance không giảm quá 5 điểm so với trước.
7. `npm run build` thành công.

### Báo lại khi xong
- File đã thêm/sửa, số chỗ màu inline đã thay.
- Font nào đã thay vì thiếu tiếng Việt.
- Ảnh chụp 8 theme x 6 màn, kết quả 7 bước kiểm thử.
