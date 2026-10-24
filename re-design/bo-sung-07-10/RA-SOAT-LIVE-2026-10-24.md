# Rà soát bản live Kèm Con Học, tối 24/10/2026

Nguồn: bản đang chạy tại `kem-con-hoc-5xf.pages.dev` (file `index-oQXkRK-p.js`, `index-DAsvJjOE.css`) và gateway `ai-gateway-worker`. Cách làm: tải bundle, so với bản sáng cùng ngày, đọc mã, mở app trên khung điện thoại 390px bằng Playwright, quét tương phản bằng axe-core. Mọi request ghi và gọi AI bị chặn ngay ở trình duyệt, không ghi gì vào dữ liệu thật, không tốn hạn mức AI.

## 1. AI kia đã làm được gì so với sáng nay

| Prompt | Đã thấy trên live |
|---|---|
| 00 | Đăng ký, đăng nhập qua `/api/v1/auth/*`, token Bearer, đọc ghi state qua `/api/v1/family/state` có xử lý xung đột (409), xoá gia đình qua `DELETE /api/v1/family`, cấu hình công khai `/api/v1/config/public`. Gia đình cũ được yêu cầu "nhập lại mật khẩu một lần" đúng như thiết kế. |
| 02 | Bộ phân loại ảnh và đề ngoài phạm vi (`p1_ocr_v2`, luật `scope_rules`, 6 mẫu thử, câu nhắn có `{xung_ho}`), tab "Luật phạm vi" trong admin, nhật ký vi phạm. |
| 05 (một phần) | Admin đăng nhập bằng email và mật khẩu qua `/api/v1/admin/auth/login`, bỏ PIN. |
| 06 | Đã sửa: câu "Dữ liệu chỉ ở trên máy bạn", số "98.6%", lời nhắc 19:45, chuyển lặng lẽ sang bài mẫu, sticker mẫu có cờ `sample`, lọc `sample` khi báo cáo. |
| 01 | Vẫn là bản sáng nay: 8 bộ màu, chọn trong "Con tôi", có bước chọn giao diện trong onboarding. |

Chưa thấy: prompt 03 (vai trò, mã mời theo thiết kế mới, báo cáo Zalo mức 1), prompt 04, phần lớn prompt 05 (giao diện Gấu, bộ chặn lộ đáp án, NPS), 07, 08.

## 2. Lỗi thật tìm được (nên sửa trước chung kết)

Xếp theo mức ảnh hưởng.

1. **Hàm `famCloudKey` không tồn tại nhưng được gọi ở 2 chỗ** (đường dự phòng đọc và ghi state khi máy chủ mới lỗi hoặc token hết hạn). Khi rơi vào nhánh này, app văng `ReferenceError` thay vì đọc được dữ liệu cũ. Mình thấy lỗi này văng 2 lần khi mở app với phiên không có token. Sửa: dùng lại hàm `Br` (`kem-con-hoc:fam:{id}`) hoặc `Vr` (`fam:{id}:state`) đúng với KV đang lưu, và thêm test cho nhánh dự phòng.
2. **Cổng cũ vẫn mở hoàn toàn:** `POST /db/query`, `/db/execute`, `GET/POST /db/kv/*` trả kết quả không cần token, CORS cho mọi trang. Ai cũng đọc được bảng `families` và state của mọi nhà, ghi đè được KV. Đây là giai đoạn C của prompt 00, đang chờ anh chị xác nhận. Vì app mới đã dùng `/api/v1`, nên chốt sớm: khoá `/db/*` ngay sau khi chắc không còn bản cũ nào gọi (xem log gateway 2 ngày). Admin vẫn còn gọi thẳng `SELECT ... FROM families` qua `/db/query`, cần chuyển sang endpoint admin có token trước khi khoá.
3. **Trẻ mới vẫn được gán dữ liệu mẫu** trong state mặc định: 2 sticker, 15 dòng lịch sử sticker (đã có cờ `sample`), nhưng `weak`, `strong`, `history` ("Bảng nhân 4 · làm được"...) là dữ liệu giả không có cờ. Màn Báo cáo của trẻ mới vẫn hiện điểm mạnh yếu không có thật. Sửa theo prompt 06: trẻ mới có mảng rỗng, chỉ bài mẫu minh hoạ mới gắn `isSample`.
4. **Tương phản ở màn đăng nhập (đo bằng axe trên live):**
   - 3 bộ tối (`garden`, `aurora`, `chalk`): nút "Tạo gia đình mới" và chữ trong ô nhập là chữ sáng trên nền trắng, tỉ lệ 1,08 đến 1,12. Gần như không đọc được (ảnh kèm).
   - `candy`: 7 chỗ dưới chuẩn, nhãn hồng `#FF8FB8` trên nền hồng nhạt chỉ 1,97; chữ phụ 2,97.
   - `bear` 7 chỗ, `sticker` 6, `notebook` 4, `bento` 3.
   - Đây là đúng việc của **prompt 07 phần A**; bảng màu thay thế đã có sẵn trong đó.
5. **Prompt 02 thiếu test với "Hạ độ khó" và câu chữ:** `scope_rules` lưu trong `localStorage['kem-con-hoc:scope-rules']` rồi mới đồng bộ KV; hai máy admin sửa luật cùng lúc sẽ ghi đè nhau. Nhỏ, ghi nhận để prompt 05 xử lý khi làm khối cấu hình chung.
6. **Dòng chữ còn dùng dấu gạch dài** (câu giới thiệu ở màn đăng nhập "AI không giải bài cho con, chỉ cho bố mẹ cách giảng" và dòng "Mỗi gia đình một tài khoản riêng, dữ liệu tách biệt" đang dùng gạch dài). Chỉ là văn phong, nhưng anh chị đã chốt không dùng dấu này trong deliverable.

## 3. Hiệu năng và PWA (đo thật)

| Mục | Đo được | Nhận xét |
|---|---|---|
| JS chính | 628 KB, nén brotli còn ~176 KB | Một bundle duy nhất, chưa tách chunk. Admin, Prompt Studio, bộ luật phạm vi, 6 mẫu thử đều nằm trong bundle của phụ huynh. Prompt 07 đã yêu cầu lazy theo bộ giao diện; nên thêm **tách admin thành chunk riêng** (ước giảm 35 đến 45%). |
| FontAwesome | 100 KB CSS (21 KB nén) + font woff2 tải thêm | Chỉ dùng cho sticker. Prompt 01 đã yêu cầu icon nét; khi xong thì bỏ FontAwesome, tự vẽ SVG cho ~12 huy hiệu. |
| Google Fonts | 4 họ font tải lúc mở | Prompt 01 bước 2 đã yêu cầu tự host và chỉ tải font của bộ đang dùng. Chưa làm. |
| Cache | `Cache-Control: max-age=0, must-revalidate` cho cả file có hash | File `/assets/*.js` có hash trong tên nên đặt `max-age=31536000, immutable` bằng file `_headers` của Pages. Hiện mỗi lần mở app đều hỏi lại máy chủ. |
| PWA | Có manifest, icon SVG, không có service worker | Không cài được như app thật trên Android (thiếu SW), không mở được khi mất mạng. Nên thêm SW tối thiểu: cache shell và font, không cache API. |
| Thời gian tải | DOMContentLoaded 655 ms trên mạng tốt | Ổn; trên 3G chậm sẽ thấy rõ bundle 176 KB + font + FontAwesome. |
| Lỗi console | 0 (ngoài ReferenceError ở mục 2.1) | Tốt. |

## 4. Enhance đáng giá, xếp theo thứ tự nên làm

### Nhóm A · Làm ngay, nhỏ, an toàn (trước chung kết)
1. Sửa `famCloudKey` (mục 2.1). 30 phút.
2. Trẻ mới không có dữ liệu giả (mục 2.3). 1 giờ, có test.
3. Prompt 07 phần A: màu chữ đạt chuẩn ở 8 bộ, có test axe chạy tự động. Nửa ngày.
4. `_headers` cho Pages: cache dài cho `/assets/*`, thêm `X-Frame-Options`, `Referrer-Policy` đã có. 15 phút.
5. Khoá `/db/*` (giai đoạn C của prompt 00) sau khi chuyển 3 câu SQL của admin sang endpoint có token. Nửa ngày. **Cần anh chị xác nhận.**

### Nhóm B · Gây "wow" trên sân khấu
6. **Prompt 07 phần B:** 8 bộ có bố cục, icon, hình mở đầu riêng; theo dõi học đều. Đây là thứ khác biệt rõ nhất khi demo đổi bộ.
7. **Prompt 08:** Góc hạ hoả mới, nhất là thổi vào mic để tắt nến. Giám khảo tự thử được.
8. **Tự thiết kế bộ giao diện (ý mới của anh chị, xem mục 5).** Cho con tự chọn màu, nhân vật, kiểu nút, xem ngay bản xem trước đủ các màn. Đề xuất thành **prompt 09**.
9. **Nghe con giảng lại** (AI chuyển giọng nói thành chữ, đối chiếu với các bậc, tự đề xuất mức hiểu bài). Dùng `/stt` đã có.
10. **Chấm vở bằng ảnh, không sửa hộ** (AI tìm bước sai, đưa mẹ một câu hỏi để con tự phát hiện). Dùng `/vision` đã có.

### Nhóm C · Giá trị cho gia đình thật, rẻ
11. **Thẻ "Cô nhắc" trên màn chính** (mục 4b bổ sung cho prompt 04): cô gửi nhắc có ngày áp dụng, mẹ bấm "Đã nhắc con", 6 mẫu soạn nhanh, qua ngày tự lùi vào hộp thông báo. Phụ thuộc prompt 04.
12. **Ghi chú bàn giao ca** cho bố hoặc bà: AI viết 3 dòng từ buổi học hôm trước. Dùng dữ liệu đã có, 1 lần gọi AI mỗi tối.
13. **Service worker tối thiểu** để cài được như app và mở offline màn chính, sổ sticker, báo cáo đã tải.
14. **Tách chunk admin và lazy theo bộ**, bỏ FontAwesome, tự host font. Giảm khoảng một nửa lượng tải lần đầu.
15. Bỏ dấu gạch dài trong câu chữ.

### Đã có trong 6 prompt cũ, chỉ cần nhắc AI kia làm đúng
- Prompt 01 bước 2 và 5: tự host font, chỉ tải font của bộ đang dùng, icon nét thay emoji. Chưa làm.
- Prompt 06 A5: lịch sử vẫn còn chuỗi "Toán có lời văn 2 bước" cứng trong dữ liệu mặc định (2 chỗ).
- Prompt 00 giai đoạn C: khoá cổng cũ (mục 2.2).

## 5. Tự thiết kế bộ giao diện (đề xuất prompt 09)

**Ý tưởng:** trong "Giao diện cả nhà" thêm ô thứ 9 "Tự thiết kế". Con và mẹ chọn vài thứ cơ bản, app ghép thành bộ riêng của nhà và hiện ngay bản xem trước đủ các màn.

**Vì sao làm được nhanh:** prompt 07 đã tách giao diện thành biến màu, khe bố cục, bộ linh kiện và 4 icon thanh dưới. Bộ tự thiết kế chỉ là một **bộ biến do người dùng điền**, không cần code mới cho từng màn.

**Người dùng chọn 6 thứ, mỗi thứ 4 đến 8 lựa chọn, bấm là xem ngay:**
1. **Màu chính** (bảng 8 màu đã tính sẵn cặp chữ và nền đạt chuẩn, không cho nhập mã màu tự do để khỏi hỏng tương phản).
2. **Nền sáng hay tối.**
3. **Kiểu chữ tiêu đề** (tròn mập, có chân, viết tay, gọn).
4. **Kiểu nút và thẻ** (bo tròn mềm, viền đậm kiểu sticker, giấy, kính mờ).
5. **Nhân vật đồng hành** (gấu, mây, cây, sao, kỳ lân, rồng con...; mỗi nhân vật có 3 trạng thái chào, nhắc, vui như prompt 01 đã yêu cầu cho gấu).
6. **Bộ icon thanh dưới** (chọn 1 trong 8 bộ hình đã vẽ ở prompt 07, hoặc "theo nhân vật").

**Bản xem trước:** dải ngang 5 màn thu nhỏ (Màn chính, Hỏi con, Xong bài, Báo cáo, Đăng nhập) vẽ bằng chính component thật ở tỉ lệ 0,55, cập nhật tức thì khi đổi lựa chọn. Có nút "Ngẫu nhiên" cho con bấm chơi, và "Dùng cho cả nhà" để lưu.

**Lưu và chia sẻ:** bộ tự thiết kế lưu trong state gia đình dưới dạng 6 lựa chọn (vài chục byte), đồng bộ mọi máy. Có "Mã bộ giao diện" 6 ký tự để nhà khác nhập và dùng thử. Admin thấy số nhà tự thiết kế và 5 tổ hợp phổ biến nhất.

**Giới hạn để không hỏng app:** mọi tổ hợp đều đi qua bảng màu đã kiểm tra; test tự động chạy axe trên 5 màn với tất cả 8 x 2 x 4 x 4 tổ hợp màu, nền, chữ, nút (256 tổ hợp, nhân vật và icon không ảnh hưởng màu).

**Điểm wow khi demo:** cho một bé trong khán phòng tự ghép bộ giao diện trong 30 giây, cả app đổi theo. Hợp tiêu chí "cá nhân hoá cho trẻ cấp 1" rất rõ.

## 6. Việc cần anh chị quyết

| Quyết định | Đề xuất |
|---|---|
| Khoá `/db/*` (giai đoạn C) | Khoá trong tuần này, sau khi admin chuyển sang endpoint có token. Bản cũ `gxc.vercel.app` nếu còn ai dùng thì tắt luôn. |
| Thứ tự giao việc | Nhóm A (1 ngày) → 07 phần B → 08 → 09 (tự thiết kế) → 03 → 04 kèm 4b "Cô nhắc". |
| Prompt 09 | Mình viết prompt và bản vẽ nếu anh chị gật. |
