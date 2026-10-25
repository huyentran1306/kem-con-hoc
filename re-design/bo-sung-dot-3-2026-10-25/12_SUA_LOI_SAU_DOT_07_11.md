# Prompt 12 · Sửa lỗi sau đợt 07 đến 11 (rà soát bản live 25/10/2026)

**Cách dùng:** giao prompt này **trước mọi prompt mới**. Kèm thư mục `bang-chung/` (ảnh chụp từng lỗi). Làm theo thứ tự P0 → P1 → P2; mỗi mục có bằng chứng, nguyên nhân đã tìm trong bundle live, cách sửa và kiểm thử. Không làm tính năng mới trong prompt này.

**Nguồn:** bản live `kem-con-hoc-5xf.pages.dev` (file `index-Du38rlk5.js`, `index-CX47Qu3A.css`) chạy thử trên khung điện thoại 390px và laptop 1366px bằng Playwright, đổi đủ 8 bộ giao diện, quét tương phản bằng axe-core. Gia đình thử nghiệm: **"Review Test Claude 2510"** (có thể xoá sau khi sửa xong, xem cuối file).

---

## PROMPT

Bạn là kỹ sư của app **Kèm Con Học**. Bản live vừa deploy các prompt 07 đến 11 nhưng có lỗi chặn luồng chính. Hãy sửa **đúng và đủ** các mục dưới đây theo thứ tự ưu tiên, không đổi thiết kế, không thêm tính năng. Mỗi mục sửa xong phải có test tự động hoặc bước kiểm tra tay ghi trong báo cáo.

### P0 · Chặn luồng chính hoặc lộ bảo mật (sửa ngay, deploy riêng được)

**P0.1 Trang đăng nhập admin hiện công khai tài khoản và mật khẩu.**
- Bằng chứng: `/admin` hiện dòng "Tài khoản mặc định: admin@… / admin…" dưới nút đăng nhập (ảnh `bang-chung/p0-1-admin-login.png`).
- Sửa: xoá dòng này khỏi mã nguồn và mọi bản build; **đổi mật khẩu tài khoản admin trên máy chủ** (người phụ trách làm bằng tay, không ghi mật khẩu mới vào code hay chat); kiểm tra `audit_log` xem có lần đăng nhập lạ không. Ô email không điền sẵn.
- Kiểm thử: grep bundle `dist/` không còn chuỗi "Tài khoản mặc định" hay mật khẩu cũ.

**P0.2 AI không soạn bài: mọi bài đều rơi về "bài mẫu".**
- Bằng chứng: gõ đề "Có 3 hộp bút, mỗi hộp 8 cây. Mẹ cho bạn Na 5 cây…", `/chat` trả HTTP 200 nhưng nội dung là **văn xuôi phân tích chính prompt** ("Bài này mô tả một phương pháp… Singapore CPA (Cognitive-Process Approach)…"), không phải JSON. Sau khoảng 60 giây app báo "Mạng đang chậm, chưa soạn được bài của con" rồi hiện "Đây là bài mẫu, không phải bài của con" với đề khác (ảnh `p0-2-sample-fallback.png`).
- Nguyên nhân: request gửi `messages = [system: (prompt p3 có đề + schema), user: "Phân tích bài này"]`. Câu user "Phân tích bài này" khiến model tóm tắt prompt. Ví dụ mẫu trong prompt lại dùng **đúng bài 3 hộp bút**, dễ làm model chép ví dụ.
- Sửa:
  1. Lời nhắn **user** chứa đề bài và yêu cầu rõ: "Soạn bài cho đề sau theo đúng schema. Chỉ trả JSON." Phần system giữ vai trò, quy tắc, schema.
  2. Đổi ví dụ mẫu trong p3 sang một bài **khác dạng và khác số** (ví dụ chia đều kẹo), không trùng đề người dùng hay gặp.
  3. Bật chế độ JSON của Workers AI nếu model hỗ trợ (`response_format: { type: "json_object" }` hoặc JSON Schema), nếu không thì: tách JSON đầu tiên trong câu trả lời (bỏ khối ```), `JSON.parse`, kiểm tra đủ trường bắt buộc (`cac_bac` 3 đến 5 bậc, mỗi bậc có `cau_hoi`, `goi_y`).
  4. Parse lỗi thì **gọi lại 1 lần** với nhắc ngắn "Trả lại đúng JSON theo schema, không thêm chữ". Vẫn lỗi thì hiện lỗi đúng bản chất ("AI trả lời chưa đúng định dạng, mẹ thử lại nhé"), có nút Thử lại; **không ghi "mạng chậm"** khi mạng không chậm.
  5. Bộ kiểm lộ đáp án (prompt 05) chấm "Đạt" cho câu trả lời sai định dạng: thêm trạng thái **"Lỗi định dạng"** và không cho qua.
  6. Gửi header `X-Prompt-Id` (p3_explain, p4_chat…) như prompt 00 đã quy định, để admin đo được lỗi theo prompt.
- Kiểm thử: 10 đề khác nhau (toán lời văn, tìm x, chính tả, đề tiếng Anh) đều ra bài giảng đúng đề, không hiện "bài mẫu"; test đơn vị cho hàm tách JSON (có khối ```, có chữ trước sau, JSON hỏng).

**P0.3 "Gõ đề" và "Đọc đề" ở màn chính không hoạt động.**
- Bằng chứng (bảng đo ở 8 bộ, ảnh `p0-3-*.png`):

| Bộ | Gõ đề | Đọc đề | Nút bắt đầu lớn |
|---|---|---|---|
| Kẹo Bông, Bento, Sticker, Sổ Tay, Bảng Phấn | không phản hồi | không phản hồi | chạy |
| Bạn Gấu, Khu Vườn Đêm | mở **màn chụp** thay vì ô gõ | không phản hồi | chạy |
| Cực Quang | không phản hồi | không phản hồi | vòng "Bắt đầu" **không phản hồi** |

- Nguyên nhân: các khe `StartAction` gọi `onStart` với tên chế độ không thống nhất (`photo`, `snap`, `type`, `prep`, `voice`). Hàm nhận chỉ hiểu `snap` → màn chụp, `prep` → `go('prep')` (không có màn `prep`), `voice` → mở sheet nhưng không hiện; `type` rơi vào nhánh mặc định là màn chụp.
- Sửa: chuẩn hoá đúng 3 giá trị `photo | type | voice` (prompt 07 mục 1). `photo` mở màn chụp; `type` mở sheet **gõ đề** (`typeProblem`) ngay; `voice` mở sheet gõ đề ở chế độ ghi âm và bật mic. Sửa cả 8 khe; vòng "Bắt đầu" của Cực Quang gọi `photo`.
- Kiểm thử: test ngang quyền (prompt 07 mục 1) cho 8 bộ: bấm từng nút `data-testid=start-photo|start-type|start-voice` phải mở đúng màn hoặc sheet.

**P0.4 "Lớp học của con" và link vào lớp làm sập app (màn trắng).**
- Bằng chứng: bấm "Con tôi → Lớp học của con" hoặc mở `/vao-lop/{mã}` thì cả trang trắng, console: `ReferenceError: data is not defined` (ảnh `p0-4-blank.png`).
- Nguyên nhân: trong hàm hiển thị sheet, nhánh `familyClasses` dùng `initialCode: data?.code` và `initialType: data?.joinType`, nhưng biến `data` không tồn tại trong phạm vi đó (dữ liệu sheet nằm ở state sheet, ví dụ `sheet.data`).
- Sửa: lấy đúng dữ liệu sheet; thêm **Error Boundary** bọc từng sheet và từng màn để lỗi một chỗ không làm trắng cả app (hiện thẻ "Có lỗi nhỏ, mẹ thử lại" có nút Đóng); bật ESLint `no-undef` trong CI để chặn lỗi loại này.
- Kiểm thử: mở "Lớp học của con" và `/vao-lop/ND9QR7`, `/vao-lop/m/ABC-123` khi đã và chưa đăng nhập (prompt 11 phần C, 8 bước) đều chạy.

**P0.5 Thành viên gia đình, mã đăng nhập máy mới, chia sẻ báo cáo đều lỗi 401.**
- Bằng chứng: mở "Thành viên gia đình" → request `GET /api/v1/family/members` gửi `Authorization: Bearer null`, trả 401.
- Nguyên nhân: nhóm hàm này đọc token ở `localStorage['auth_token']`, trong khi đăng nhập lưu ở `localStorage['kem-con-hoc:auth']`. Bị ảnh hưởng: `GET/PATCH/DELETE /family/members`, `GET/POST/DELETE /family/invites`, `POST /auth/device-code`, `POST /reports/weekly/share`.
- Sửa: dùng **một hàm duy nhất** lấy token (hàm đang dùng cho `/family/state`) cho mọi request; xoá mọi chỗ đọc `auth_token`.
- Kiểm thử: mời thành viên, đổi vai trò, tạo mã máy mới, chia sẻ báo cáo tuần đều trả 2xx với tài khoản vừa đăng ký.

**P0.6 Ô theo dõi học đều không bao giờ tăng.**
- Bằng chứng: đi hết 4 bậc, chọn "Con tự làm được", bấm "Lưu & về trang chủ": "Lọ kẹo 0/4 viên", `stats.<con>.studyLog` vẫn rỗng, trong khi `history` đã ghi "Con dạy lại mẹ: con tự làm được".
- Nguyên nhân rất có thể: màn Xong bài gọi `recordSession()` (ghi `studyLog` bằng `setState` dạng hàm) rồi **ngay sau đó** gọi `patch({ history, weak, stats: … })` dựng từ state cũ, ghi đè cả khối `stats` và làm mất `studyLog`.
- Sửa: gộp thành **một lần cập nhật** (ghi `studyLog` cùng lúc với history), hoặc `patch` luôn dùng dạng hàm `prev => …` và chỉ đổi đúng trường của con. Quyết định rõ bài **mẫu** có tính một tối học hay không (đề xuất: không tính, và ghi chú nhỏ "bài mẫu không tính vào lọ kẹo").
- Kiểm thử: test `useStudyTracker` (prompt 07 bước 3) + test tích hợp: xong 1 bài thật thì ô hôm nay chuyển "đã học" ngay, tải lại trang vẫn còn.

### P1 · Lỗi hiển thị và trải nghiệm rõ ràng

**P1.1 Chữ khó đọc ở bộ tối (đúng lỗi chủ dự án thấy).**
- Bằng chứng (ảnh `p1-1-dark-header.png`): ở Khu Vườn Đêm, Cực Quang, Bảng Phấn, **dải đầu màn chính** có nền sáng mờ nhưng chữ màu sáng; nút **"Tiếng: Bật"** là chữ sáng trên nền trắng.
- Nguyên nhân trong CSS:
  - `.hero-band { background: linear-gradient(160deg, var(--plum-tint), #fff0ec 60%, var(--bg)) }` có màu `#fff0ec` viết cứng.
  - `.sound-pill-btn { background: #fff; color: var(--ink) }` (ở bộ tối `--ink` là màu sáng).
  - Còn **31 luật** đặt nền trắng hoặc nền sáng viết cứng ngoài phạm vi `[data-theme]`: `.field`, `.opt`, `.btn.ghost`, `.btn-voice`, `.sheet .pn`, `.card-cell`, `.stick-eq`, `.hold`, `.shutter`, `.dotboxes .bx`, `.stk-pick`, `.big-card .ic`, `.switch`, `.bar`, `.pill.g`, `.grabber`, `.loader .li .dot`, `.step-row .n.off`…
- Sửa: thay mọi màu nền và chữ viết cứng ở màn phụ huynh bằng biến (`--c-surface`, `--c-surface-2`, `--c-text`, `--c-on-…`); `.hero-band` dùng `--c-hero-bg` riêng mỗi bộ (bộ tối là sắc đậm của nền). Thêm luật lint: CSS màn phụ huynh không được có `#fff`, `white`, hex sáng ngoài file biến.

**P1.2 Tab đang chọn ở thanh dưới khó đọc.**
- Đo bằng axe: chữ tab đang chọn ở Kẹo Bông 2,06:1, Bạn Gấu 1,96:1, Cực Quang 1,70:1 (chuẩn 4,5). Cực Quang còn có chữ tab thường 1,9:1 vì **thanh dưới nền sáng** trong bộ tối.
- Nguyên nhân: `.tabs .on { color: var(--plum) }` lấy màu nhấn làm chữ; `.tabs` không dùng `--c-nav`.
- Sửa: chữ tab chọn dùng `--c-accent-ink` (đã có từ prompt 07 phần A); nền `.tabs` dùng `--c-nav` của bộ.

**P1.3 Nút nổi "Mẹ bình tĩnh" đè lên nút chính.**
- Bằng chứng: ở màn Trước khi giảng, nút nổi đè lên "Bắt đầu hỏi con từng bước"; ở màn Hỏi con, đè lên "Bấm giữ 2 giây để mở đáp án"; ở Báo cáo, đè "Gửi báo cáo vào nhóm Zalo" (ảnh `p1-3-fab-overlap.png`).
- Sửa: nội dung cuộn chừa khoảng trống dưới bằng chiều cao nút nổi + thanh tab; ở các màn có nút chính dính đáy, thu nút nổi thành biểu tượng tròn nhỏ hoặc chuyển lên đầu màn.

**P1.4 Hỏi con từng bước: phải mở đáp án mới đi tiếp được, và giữ chuột không mở.**
- Bằng chứng: nút "Con trả lời đúng / Con còn bí" **chỉ hiện sau khi mẹ giữ mở đáp án**; trên laptop **giữ chuột không mở** (chỉ chạy với sự kiện chạm), nên bố mẹ dùng máy tính kẹt ở bậc 1.
- Sửa: hiện sẵn 2 nút "Con chưa nghĩ ra" / "Con trả lời được" ở mọi bậc như thiết kế (khe `ScaffoldActions`, đã có component `Ra` trong code nhưng không được dùng). Giữ để mở đáp án dùng **Pointer Events** (`pointerdown/up/cancel`) để chạy cả chuột, chạm, bút; thêm thao tác bàn phím (giữ Space) như prompt 07 mục 4.

**P1.5 Nhắc nghỉ tự bật sheet che màn.**
- Bằng chứng: lần "Con còn bí" thứ 2 hiện thẻ nhắc **và** sheet "Điều gì đang khó, mẹ ơi?" tự mở che toàn màn (ảnh `p1-5-nudge-sheet.png`).
- Sửa: theo prompt 08 mục 1, chỉ hiện **thẻ nhắc trượt lên**, không chặn thao tác; sheet chỉ mở khi mẹ bấm "Nghỉ 1 phút". "Để sau (10p)" phải ẩn thẻ.

**P1.6 Trẻ mới vẫn có dữ liệu mẫu.**
- Bằng chứng: gia đình vừa tạo, con mới: "Sổ Sticker: 2", "Đã sưu tập 2 sticker lấp lánh".
- Nguyên nhân: state mặc định gán `stickers: 2` và `stickersList` có 2 sticker (Kỳ lân Kiên trì, Ngôi sao Sáng tạo) không có cờ `sample`.
- Sửa: trẻ mới `stickers: 0`, `stickersList: []` (prompt 06 mục B1). Không đụng dữ liệu của trẻ cũ.

**P1.7 Màn thổi nến: nút "Bật mic thổi cùng con" bị ép thành cột hẹp, mỗi dòng 1 chữ** (ảnh `p1-7-blow.png`). Sửa: 2 nút xếp dọc full width, hoặc nút mic ở trên, ô "Giữ nút bấm" ở dưới.

**P1.8 Cổng giáo viên trên điện thoại vỡ bố cục** (ảnh `p1-8-teacher-mobile.png`): đầu trang chen chúc, 4 tab thành hình tròn lớn chữ xuống dòng, nút "Soạn bài mới" bị ép. Sửa theo prompt 11 phần A: dưới 1024px dùng thanh tab dưới 5 mục, tab lớp cuộn ngang dạng viên thuốc một dòng.

### P2 · Lỗi nhỏ, câu chữ, hiệu năng

- **P2.1** Cổng giáo viên: tên lớp hiện **"Lớp Lớp 3A"** (thêm tiền tố "Lớp" khi tên đã có chữ "Lớp"); bài nháp hiện **"Hạn nộp: 1/1/1970"** khi chưa có hạn (phải ghi "Chưa đặt hạn") và có nút "Xem kết quả làm bài" (phải là "Duyệt bài giảng"); nút "Thông báo lớp" màu tím xanh lạc tông (dùng `--s-accent`); nhãn **"Nhắc việc (Mục 4b)"** lộ tên mục nội bộ, đổi thành "Nhắc việc".
- **P2.2** Cổng giáo viên chưa đúng prompt 11 phần A: chưa có thanh bên với ô chọn lớp, chưa có tab **Kết quả**, chưa có khối "Việc cần cô xem". Ghi vào báo cáo nếu chưa làm trong đợt này.
- **P2.3** Admin có số liệu viết cứng: thanh bên "Hôm nay đã có 84 buổi kèm học thành công!", ô "Tỉ lệ con tự làm được 85%", độ trễ "1.2s / 2.4s" hiện cả khi không có dữ liệu. Lấy từ `/admin/overview`, không có dữ liệu thì ghi "Chưa có dữ liệu". Bỏ chữ "Admin · Stitch".
- **P2.4** Kẹo Bông: tiêu đề màn ("AI đang đọc bài…", "Trước khi giảng cho con…", "Hỏi con từng bước") là chữ hồng nhạt trên nền hồng nhạt, mờ. Dùng `--c-accent-ink`.
- **P2.5** `/teacher/dang-ky` mở màn đăng nhập thay vì đăng ký (thêm route).
- **P2.6** `GET /api/v1/config/public` nặng **300 KB** và bị gọi kèm `?t=<thời gian>` ở **mỗi lần mở app** (không cache được). Nội dung chứa **toàn văn các prompt nội bộ của nhóm** (`promptDetail`, tác giả, công cụ chạy). Sửa: endpoint công khai chỉ trả cấu hình app cần (theme mặc định, theme bật, luật phạm vi, ngưỡng nhắc nghỉ), dưới 10 KB; bỏ `?t=`; cache 5 phút (`Cache-Control: public, max-age=300`) và cache ở máy 10 phút như prompt 00. Danh sách prompt nội bộ chỉ trả qua endpoint admin có token.
- **P2.7** Bundle JS 1,07 MB (273 KB nén), tăng từ 176 KB; admin, cổng giáo viên, 8 bộ giao diện nằm chung một file. Tách `React.lazy` cho `/admin`, `/teacher`, chunk từng bộ giao diện (prompt 07 mục 1), mục tiêu bundle phụ huynh lần đầu dưới 180 KB nén.
- **P2.8** Mỗi lần mở app ghi lại toàn bộ state (`PUT /family/state`, ~6 KB) dù không đổi gì. Chỉ ghi khi state thay đổi (so sánh `_ts` hoặc băm nội dung), để tiết kiệm lượt ghi D1 gói Free.
- **P2.9** Cổng cũ `/db/query`, `/db/execute`, `/db/kv/*` **vẫn mở không cần token** (đã báo ngày 24/10). App phụ huynh mới đã dùng `/api/v1`; khi P2.3 xong (admin không còn gọi SQL trực tiếp), thực hiện **giai đoạn C của prompt 00**: khoá các cổng này. **Cần chủ dự án xác nhận trước khi khoá.**
- **P2.10** Ký tự gạch dài còn trong câu chữ hiển thị (ví dụ câu báo "Mạng chậm" ở nút Hạ độ khó, dòng giới thiệu ở màn đăng nhập): thay bằng dấu phẩy hoặc dấu chấm.

### Không làm trong prompt này
- Không thêm tính năng, không đổi thiết kế, không đổi schema dữ liệu ngoài phần cần cho P0.6.
- Không xoá dữ liệu người dùng (kể cả gia đình thử nghiệm) nếu chủ dự án chưa đồng ý.
- Không khoá `/db/*` (P2.9) khi chưa được xác nhận.

### Kiểm thử bắt buộc (chạy lại toàn bộ trước khi báo xong)
1. Luồng chính trên điện thoại ở **cả 8 bộ**: đăng ký → onboarding → Gõ đề → AI soạn đúng đề (không bài mẫu) → Hỏi con 4 bậc (cả bằng chuột trên laptop) → Xong bài → lọ kẹo / dấu chân hôm nay tăng.
2. Axe `color-contrast` trên Màn chính, Trò chơi, Báo cáo, Con tôi, Góc hạ hoả, sheet Gõ đề, sheet Thành viên ở 8 bộ: **0 lỗi**. Kiểm tra bằng mắt dải đầu màn chính ở 3 bộ tối.
3. Không còn `ReferenceError` nào trong console khi mở mọi sheet và mọi route (`/`, `/vao-lop/...`, `/teacher`, `/admin`).
4. Thành viên gia đình, lời mời, mã máy mới, chia sẻ báo cáo trả 2xx.
5. Trang `/admin` không còn thông tin tài khoản; mật khẩu admin đã đổi.
6. `config/public` dưới 10 KB, không có `promptDetail`; mở app 2 lần liên tiếp chỉ tải 1 lần.
7. `npm run build`, `npm test` và test Worker thành công.

### Báo lại khi xong
- Bảng từng mục P0, P1, P2: đã sửa / chưa sửa / lý do; file đã đổi.
- Ảnh trước và sau cho P0.2, P0.3, P0.4, P1.1, P1.2, P1.3, P1.4, P1.8.
- Kết quả 7 bước kiểm thử.

---

## Ghi chú cho chủ dự án (không giao cho AI)
- **Làm ngay hôm nay:** đổi mật khẩu admin (P0.1).
- Gia đình thử nghiệm do người rà soát tạo trên bản live: **"Review Test Claude 2510"** (1 con tên "Mít Test", 1 bài mẫu đã làm, không có dữ liệu thật). Xoá khi muốn bằng "Con tôi → Xóa toàn bộ dữ liệu" sau khi đăng nhập gia đình này, hoặc nhờ admin xoá. Người rà soát không tự xoá.
- Người rà soát **không** đăng nhập admin bằng thông tin công khai trên trang và không đăng ký tài khoản giáo viên; các màn bên trong admin và cổng giáo viên được xem bằng dữ liệu giả ngay trong trình duyệt.
