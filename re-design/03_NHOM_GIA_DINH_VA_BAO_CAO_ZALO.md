# Prompt 03 · Nhóm gia đình nhiều người và gửi báo cáo qua Zalo

**Cách dùng:** copy phần PROMPT gửi cho AI lập trình, kèm source app và worker.

**Phụ thuộc:** **cần prompt 00 trước** (bảng `members`, token đăng nhập, bảng `learning_sessions`). Không làm trên `/db/query` mở như hiện nay, vì khi nhiều người vào chung một gia đình, ai có `familyId` cũng đọc được dữ liệu của trẻ.

**Hiện trạng:**
- **Một gia đình chỉ có một tài khoản** (tên gia đình + mật khẩu). Bố muốn dùng thì phải biết mật khẩu chung.
- Nút "Mời bố" chỉ chia sẻ link trang chủ qua `https://zalo.me/share?url=...` và dặn bố "tạo tài khoản gia đình riêng". Dữ liệu của bố vì thế tách hẳn, không thấy được tiến độ của con.
- Báo cáo tuần chia sẻ bằng `navigator.share` một đoạn chữ "Bố ơi, tuần này…", không có thì copy.
- Phần "Ai kèm Mẹ/Bố" trong báo cáo lấy từ lịch chia ca, không phải buổi học thật. Nhắc "lúc 19:45" chưa được làm.

**Sự thật về Zalo cần biết trước khi làm** (đã tra ngày 24/10/2026):
- **Không có API để app tự đăng tin vào nhóm chat Zalo cá nhân của gia đình.** Cách khả thi là người dùng bấm chia sẻ, chọn nhóm Zalo trong bảng chia sẻ của điện thoại.
- **Nút chia sẻ Zalo cho website** (Zalo Social Plugin, `sp.zalo.me/plugins/sdk.js`, thẻ `zalo-share-button` với `data-href`, `data-oaid`) cần có Zalo Official Account (OA). Tài liệu chính thức: `developers.zalo.me/docs/social/share`.
- **ZNS (Zalo Notification Service)**, tức gửi tin tự động vào Zalo theo số điện thoại, đòi hỏi:
  - OA đã xác thực doanh nghiệp, và mẫu tin phải được Zalo duyệt trước.
  - Link chỉ được đặt ở nút bấm và phải thuộc tên miền của OA. Mẫu quảng cáo bị từ chối.
  - Có hạn mức gửi theo giai đoạn, tính phí theo tin, và cần số điện thoại cùng sự đồng ý của người nhận.
  - **Không phù hợp để làm trước vòng chung kết.**

---

## PROMPT

Bạn là kỹ sư full-stack của app **Kèm Con Học**. Làm 2 phần: **(A) nhóm gia đình nhiều thành viên** dùng chung dữ liệu các con, và **(B) báo cáo tuần chia sẻ qua Zalo** dạng ảnh + link xem, không cần tài khoản Zalo OA.

### Phần A · Nhóm gia đình

**1. Mô hình**
- Dùng bảng `members` của prompt 00. Vai trò:
  - `owner`: người tạo; mời, đổi vai trò, xoá thành viên, xoá gia đình.
  - `guardian`: kèm con, xem báo cáo, mời người khác với vai trò viewer.
  - `viewer`: chỉ xem báo cáo và lịch sử, ví dụ ông bà ở xa.
- `relation`: Mẹ, Bố, Ông, Bà, Cô/Chú, Anh/Chị, Người giúp việc, Khác. Hiển thị trong app: "Bố Tuấn", "Bà Lan".
- **Tên vai trò hiển thị** (dùng thống nhất trong app và tài liệu): `owner` = **Chủ nhà**, `guardian` = **Kèm con**, `viewer` = **Chỉ xem**.
- **Ma trận quyền** (kiểm ở worker, giao diện chỉ ẩn bớt nút):

| Việc | Chủ nhà | Kèm con | Chỉ xem |
|---|---|---|---|
| Kèm con học, tạo buổi học | ✅ | ✅ | ❌ (403) |
| Ghi state gia đình (`PUT /family/state`) | ✅ | ✅ | ❌ (403) |
| Xem báo cáo, lịch sử | ✅ | ✅ | ✅ |
| Đổi giao diện cả nhà, giọng điệu, lịch chia ca | ✅ | ✅ | ❌ |
| Thêm, sửa hồ sơ con | ✅ | ✅ | ❌ |
| Tạo link báo cáo | ✅ | ✅ | ❌ |
| Xem, thu hồi link đã chia sẻ | tất cả | link của mình | ❌ |
| Mời thành viên | mọi vai trò | chỉ "Chỉ xem" | ❌ |
| Đổi vai trò, xoá thành viên, xoá gia đình | ✅ | ❌ | ❌ |
| Kết nối con vào lớp (prompt 04) | ✅ | ✅ | ❌ |
- Bảng `invites (code TEXT PK, family_id, role, relation_hint, created_by, created_at, expires_at, max_uses INTEGER, used_count INTEGER, revoked_at)`.
  - Mã 6 ký tự, bỏ chữ dễ nhầm (0/O, 1/I), hạn mặc định 72 giờ, 1 lượt dùng.
- Endpoint:
  - `POST /api/v1/family/invites`, `DELETE /api/v1/family/invites/{code}`
  - `GET /api/v1/invites/{code}`: thông tin công khai tối thiểu, chỉ gồm tên gia đình, người mời, vai trò; **không** lộ tên con.
  - `POST /api/v1/invites/{code}/accept` `{displayName, relation, pin}` tạo member mới và trả token.
  - `GET/PATCH/DELETE /api/v1/family/members/{id}`.
- Đăng nhập của thành viên:
  - **Máy đã từng đăng nhập:** app nhớ gia đình và danh sách thành viên **ngay trên máy đó** (localStorage), hiện danh sách để chọn mình, rồi nhập **PIN cá nhân 4 đến 6 số** (`POST /auth/login {familyId, memberId, pin}`).
  - **Máy mới:** **không có** endpoint công khai nào trả danh sách thành viên theo tên gia đình (tránh lộ tên người thân). Thành viên vào máy mới bằng **"mã đăng nhập máy mới"**: chủ nhà hoặc chính thành viên đó (trên máy đang đăng nhập) bấm "Đăng nhập trên máy khác" để tạo mã 6 ký tự, hạn 15 phút, gắn đúng thành viên; trên máy mới nhập mã rồi nhập PIN. Bảng `device_codes (code PK, member_id, created_at, expires_at, used_at)`.
  - Chủ nhà vẫn đăng nhập được bằng tên gia đình + mật khẩu như cũ.
  - PIN sai 5 lần: khoá thành viên đó 15 phút ở máy chủ (prompt 00, mục 6).

**2. Màn hình**
- **Con tôi → "👨‍👩‍👧 Thành viên gia đình"** (thay mục "Mời bố cùng kèm con"):
  - Danh sách thành viên: avatar chữ cái, tên, quan hệ, vai trò, "kèm 3 buổi tuần này", lần cuối mở app.
  - Nút "➕ Mời người thân": chọn vai trò và quan hệ, tạo mã. Hiện **mã 6 ký tự cỡ lớn**, **mã QR** và link `https://<app>/join/ABC234`, cùng các nút:
    - "Gửi qua Zalo": `navigator.share` kèm text và link; không có thì mở `https://zalo.me/share?url=...` như hiện nay.
    - "Copy link".
  - Owner: đổi vai trò, xoá thành viên, thu hồi mã mời đang chờ.
- **Màn `/join/{code}`** (route mới, mở được không cần đăng nhập):
  - Câu chào "Mẹ Lan mời bạn cùng kèm con trên Kèm Con Học".
  - Nhập tên hiển thị, chọn quan hệ, đặt PIN 2 lần, bấm "Vào nhà".
  - Mã hết hạn hoặc đã dùng thì hiện lời nhắn và nút "Nhờ người mời gửi mã mới".
- **Ghi công đúng người:** mọi buổi học ghi `member_id` vào `learning_sessions`. Báo cáo "Ai kèm tuần này" lấy từ đây, **bỏ** cách tính từ lịch chia ca và số mặc định `||4`, `||1`.
- **Viewer:** ẩn nút "Chụp bài", chỉ thấy tab Báo cáo và lịch sử.
- **Lịch chia ca:** chọn được thành viên bất kỳ (không chỉ Mẹ/Bố). Chưa làm nhắc 19:45 ở prompt này, ghi vào phần "để sau".

**3. Đồng bộ khi nhiều người cùng dùng**
- Dùng cơ chế `baseTs` và `409` của prompt 00. Khi gộp:
  - sticker, lịch sử, buổi học: **cộng dồn** theo id, không ghi đè;
  - **xoá phải để lại dấu** (`deletedIds: {id: ts}`), để bản cũ ở máy khác không làm mục đã xoá sống lại khi gộp;
  - cài đặt (giao diện, giọng điệu, lịch chia ca): mỗi trường có thời điểm sửa riêng (`settingsTs.{field}`), trường nào sửa sau thắng.
- Viết hàm gộp có test (gồm cả trường hợp xoá ở máy A, sửa ở máy B).

### Phần B · Báo cáo tuần qua Zalo

**4. Dữ liệu báo cáo thật** (từ `learning_sessions`, không dùng số mẫu)
- Số buổi, tổng phút, số bài tự làm được (`teach_back_rating` = tự làm), dạng bài hay vướng (đếm `stuck_count` theo `problem_type`), dạng bài đã vững, ai kèm (theo member), chuỗi ngày học, sticker mới.
- **Sửa lỗi hiện tại:** trẻ mới tạo đang được gán sẵn 15 sticker mẫu nên báo cáo hiện xu hướng giả. Báo cáo bỏ qua các bản ghi mẫu (đã được đánh dấu `sample: true` ở prompt 06, không xoá); trẻ chưa có buổi học thì báo cáo hiện "Chưa có buổi học nào tuần này".

**5. Ảnh báo cáo tuần**
- Thẻ dọc 1080 x 1350 px, vẽ bằng canvas từ HTML (gợi ý `html-to-image`), theo theme gia đình đang dùng (prompt 01).
- Nội dung: tên gọi ở nhà của con (không họ tên đầy đủ), tuần, 3 con số lớn (buổi học, phút, bài tự làm), "Con đã vững", "Con hay vướng", "Ai kèm" (chủ nhà **tắt được dòng này** trước khi gửi), 1 lời khuyên cuối tuần, **mã QR bắt buộc** dẫn tới link xem chi tiết (nhiều app nhận file sẽ bỏ phần chữ và link đi kèm).
- **Tạo ảnh sẵn** khi mở tab Báo cáo (không đợi bấm nút): iOS Safari chỉ cho `navigator.share` chạy ngay trong thao tác bấm, nếu tạo ảnh xong mới gọi share sẽ bị lỗi `NotAllowedError`.
- Font dùng bản **tự host** (prompt 01) và chờ `document.fonts.ready` trước khi chụp; trên Safari chụp 2 lần, lấy lần 2 (lần đầu hay ra ảnh trắng).

**6. Link xem báo cáo không cần đăng nhập**
- `POST /api/v1/reports/weekly/share` `{childId, week, hideCoParents?}` tạo `report_shares (token TEXT PK, family_id, child_id, week, snapshot_json TEXT, created_by, created_at, expires_at, revoked_at, view_count)`.
  - **`snapshot_json` chụp số liệu lúc tạo link**; người xem chỉ thấy đúng tuần đó, không thấy dữ liệu phát sinh sau.
  - Token 22 ký tự ngẫu nhiên, **hạn mặc định 7 ngày** (chọn 7 hoặc 14 ngày khi tạo).
  - Trang công khai `/r/{token}` đọc qua `GET /api/v1/reports/shared/{token}`: chỉ đọc, hiện đúng nội dung của ảnh và thêm biểu đồ 7 ngày.
  - Chặn máy tìm kiếm bằng header `X-Robots-Tag: noindex` trong file `_headers` của Pages (trang là SPA nên thẻ meta không đủ); không hiện họ tên đầy đủ, trường lớp, ảnh.
- Danh sách link đã chia sẻ: chủ nhà thấy tất cả, người "Kèm con" thấy link mình tạo; thu hồi được (theo ma trận quyền).

**7. Nút gửi** (thay nút "📲 Gửi tóm tắt cho bố (Zalo / SMS)")
- **"Gửi báo cáo vào nhóm Zalo gia đình":** kiểm tra `navigator.canShare({ files: [ảnh] })` trước; được thì `navigator.share({ files: [ảnh PNG], text, url })`. Trên điện thoại bảng chia sẻ có Zalo, người dùng chọn nhóm gia đình.
- Trình duyệt không chia sẻ được file: chia sẻ text + url; không có `navigator.share` thì hiện 3 nút "Tải ảnh", "Copy link", "Mở Zalo Web".
- **Đang mở app bên trong Zalo** (trình duyệt nhúng, nhận biết qua user agent có `Zalo`): hiện dải "Mở bằng trình duyệt để gửi được ảnh" kèm nút copy link, vì trình duyệt nhúng thường không chia sẻ được file.
- Ghi nhận số lần chia sẻ và số lượt mở link (để thống kê ở admin).

**8. Lời nhắc cuối tuần trong app** (không cần Zalo)
- Tối Chủ nhật, khi mở app lần đầu sau 18:00: hiện thẻ "Báo cáo tuần của {con} đã sẵn sàng. Gửi cho cả nhà nhé?".

### Để sau (ghi vào báo cáo, không làm bây giờ)
- **Zalo OA và ZNS** gửi báo cáo tự động mỗi tối Chủ nhật: cần OA xác thực doanh nghiệp, mẫu tin được duyệt, số điện thoại và đồng ý của phụ huynh, chi phí theo tin.
- **Zalo Mini App**: đưa app vào Zalo, chia sẻ bằng API `openShareSheet` của Mini App.
- **Web Push** cho nhắc 19:45 (cần service worker, iOS chỉ chạy khi đã "Thêm vào màn hình chính").

### Không làm trong prompt này
- Không gửi tin tự động qua Zalo hay SMS.
- Không thu số điện thoại.
- Không đổi luồng học.

### Kiểm thử bắt buộc
1. Mẹ (owner) tạo mã mời vai trò guardian; bố mở `/join/{code}` trên máy khác, đặt PIN, vào và thấy đúng các con, sticker, lịch sử của gia đình.
2. Mã đã dùng hoặc hết hạn: báo lỗi đúng; mã thu hồi: không vào được.
3. Bố kèm 1 buổi: báo cáo "Ai kèm" của mẹ hiện "Bố Tuấn: 1 buổi".
4. Mẹ và bố cùng hoàn thành bài trên 2 máy trong cùng phút: không mất sticker nào (test hàm gộp).
5. Viewer không thấy nút "Chụp bài", gọi API tạo buổi học bị 403.
6. Ảnh báo cáo tạo được ở 3 theme khác nhau; link `/r/{token}` mở được trên máy chưa đăng nhập; thu hồi xong thì báo "Link đã hết hạn".
7. Trên Android Chrome: bảng chia sẻ có Zalo, gửi được ảnh vào một nhóm Zalo thử. Trên iPhone Safari: bấm nút là bảng chia sẻ hiện ngay (ảnh đã tạo sẵn), không lỗi.
7b. Viewer gọi `PUT /family/state`: 403. Máy mới không lấy được danh sách thành viên nếu không có mã đăng nhập máy mới.
7c. Link `/r/{token}` tạo hôm nay, tuần sau con học thêm: link vẫn chỉ hiện số liệu lúc tạo.
8. Báo cáo không tính bản ghi sticker mẫu (`sample: true`); trẻ mới tạo không có bản ghi mẫu.
9. `npm run build` thành công, test hàm gộp và endpoint mời đều qua.

### Báo lại khi xong
- Bảng và endpoint mới, file đã sửa.
- Ảnh màn Thành viên, màn `/join`, ảnh báo cáo, trang `/r/{token}`.
- Kết quả 9 bước kiểm thử.
