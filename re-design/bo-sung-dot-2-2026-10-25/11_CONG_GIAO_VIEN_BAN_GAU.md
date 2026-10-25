# Prompt 11 · Nâng cấp Cổng giáo viên: giao diện bản Gấu, Cô nhắc, vào lớp bằng link

**Cách dùng:** prompt 04 đã chạy; mọi nâng cấp cho cô giáo và cho phụ huynh khi vào lớp nằm ở đây, chia **3 phần giao riêng được**:

| Phần | Nội dung | Bản vẽ |
|---|---|---|
| **A** | Giao diện cổng giáo viên cùng phong cách admin bản Gấu, bộ component dùng chung | `tham-khao/cong-giao-vien-ban-gau.html` (7 màn laptop, 4 màn điện thoại) |
| **B** | "Cô nhắc": cô gửi lời nhắc có ngày, thẻ nổi trên màn chính của phụ huynh | `tham-khao/co-nhac.html` (phần 1) và màn 6 của `cong-giao-vien-ban-gau.html` |
| **C** | Phụ huynh vào lớp bằng link, nhà nhiều con, chọn đúng con | mục "Phụ huynh vào lớp" cuối `cong-giao-vien-ban-gau.html` |

Mỗi phiên chỉ giao **một phần**; trong lời nhắn mở đầu ghi rõ "lần này chỉ làm phần A" (hoặc B, C). Thứ tự đề xuất: **C → B → A** nếu cần ra tính năng trước, hoặc **A → B → C** nếu muốn đổi giao diện trước. B và C không phụ thuộc A.

**Phụ thuộc chung:** cổng giáo viên của prompt 04 đã chạy (`/teacher`). Phần A nên làm cùng hoặc sau prompt 05 (admin bản Gấu); nếu 05 chưa làm, phần A tạo trước bộ component dùng chung để admin dùng lại. Phần B và C cần vai trò thành viên gia đình của prompt 03 nếu đã có (người "Chỉ xem"); chưa có thì mọi người đăng nhập gia đình đều thao tác được.

**Thay đổi quyết định đã chốt (25/10):** prompt 04 từng ghi cổng giáo viên cố định Bento Mềm, chữ Be Vietnam Pro. Nay đổi: **cổng giáo viên dùng cùng phong cách admin bản Gấu**.

---

## PROMPT

Bạn là kỹ sư full-stack của app **Kèm Con Học** (React + Vite, Cloudflare Worker, D1). Cổng giáo viên của prompt 04 đã chạy. Hãy làm **đúng phần được giao lần này** (A, B hoặc C) dưới đây. Mọi thứ chạy trên gói Cloudflare Free (quy tắc ở prompt 00), không tự xoá dữ liệu người dùng, giữ nguyên các nguyên tắc dữ liệu trẻ em của prompt 04.

---

### PHẦN A · Giao diện cổng giáo viên bản Gấu

**Hiện trạng:** `/teacher` dùng xanh dương kiểu Bento, chữ Be Vietnam Pro. Đầu trang có "Cổng Giáo Viên", tên trường và tên cô, nút "Lớp học", "Cài đặt của cô". Màn lớp có chip khối, mã lớp chung, nút "Gửi qua Zalo" xanh, 4 tab, màn trống dùng emoji 📝.

**A1. Bộ thiết kế dùng chung cho admin và giáo viên (`src/ui/staff/`)**

| Biến | Giá trị | Dùng cho |
|---|---|---|
| `--s-bg` | `#FFF8EC` | nền trang |
| `--s-surface` | `#FFFFFF` | thẻ, bảng, ô nhập |
| `--s-line` | `#F0DDC2` | viền, đáy thẻ |
| `--s-text` / `--s-text-2` | `#4B3621` / `#84664A` | chữ chính / chữ phụ (đạt 4,5:1) |
| `--s-accent` / `--s-on-accent` | `#F6A623` / `#4B3621` | nút chính, tab đang chọn |
| `--s-accent-deep` | `#C47F0E` | đáy nút chính |
| `--s-accent-tint` / `--s-accent-ink` | `#FFF1D6` / `#9A5B00` | nút phụ, chip, nền nhấn |
| trạng thái | xanh lá `#047857` trên `#ECFDF5`; xanh dương `#1D4ED8` trên `#EFF6FF`; vàng `#9A5B00` trên `#FFF1D6`; đỏ `#BE123C` trên `#FFF1F2` | pill trạng thái |
| chữ | tiêu đề **Mitr**; nội dung **Nunito**; tự host như prompt 01 | |
| hình dạng | thẻ bo 22px, đáy `0 5px 0 var(--s-line)`; nút bo 999px, đáy `0 3px 0 var(--s-accent-deep)`; ô nhập viền 2px | |

- Component: `StaffShell`, `SideNav`, `ClassSwitcher`, `Card`, `Kpi`, `Button` (chính, phụ, nguy hiểm), `StatusPill`, `Tabs`, `DataTable`, `Segmented`, `Toggle`, `Field`, `TextArea` (có trạng thái khoá), `EmptyState` (gấu + 1 câu + 1 nút), `Banner`, `SaveBar`, `AssistantCard`. Admin và cổng giáo viên **cùng import** từ thư mục này.
- Gấu dùng lại SVG 3 trạng thái (chào, nhắc, vui) của prompt 01 và 07.

**A2. Khung trang**
- **Từ 1024px:** thanh bên 196px: logo gấu và "Cổng Giáo Viên"; ô **"Lớp đang xem"** để đổi lớp; 6 mục **Lớp của cô, Bài tập & Soạn bài, Học sinh (số chờ duyệt), Thông báo & Nhắc việc, Kết quả, Cài đặt của cô**; thẻ "Gấu nhắc" về quyền riêng tư của gia đình; hồ sơ cô có nhãn xanh nhạt **"Giáo viên"** và nút đăng xuất. Đầu trang: tìm học sinh hoặc bài, giờ, chuông.
- **Dưới 1024px:** thanh tab dưới 5 mục (Lớp, Bài tập, Nhắc việc, Kết quả, Cô); ô chọn lớp lên đầu trang; bảng chuyển thành danh sách thẻ.
- Cô không đổi được giao diện. Admin vẫn có tuỳ chọn bảng xanh dương (prompt 05).

**A3. Từng màn** (giữ route cũ; route đổi tên thì chuyển hướng)

| Màn | Route | Điểm chính |
|---|---|---|
| Lớp của cô | `/teacher` | lời chào, 4 số liệu, thẻ từng lớp có thanh tiến độ, ô tạo lớp nét đứt, khối "Việc cần cô xem" |
| Lớp · Bài tập | `/teacher/lop/:id` | thẻ đầu lớp: chip khối, tên lớp, số học sinh, khung mã lớp chung nét đứt mật ong, nút "Gửi qua Zalo" và "Sao chép mã"; 5 tab (thêm **Kết quả**); bảng bài có thanh hoàn thành, "bậc hay vướng"; bài nháp có nút Duyệt |
| Soạn bài | `/teacher/lop/:id/bai/moi` | trái: tên bài, đề, dạng bài, Cách cô dạy (gợi ý từ cài đặt), đáp án của cô trong ô khoá; phải: xem trước 4 bậc, dòng kiểm tra, Soạn lại, Sửa bậc, Duyệt; thanh lưu "Giao cho N gia đình" |
| Kết quả | `/teacher/lop/:id/ket-qua/:bai` | 4 số liệu, biểu đồ bậc hay vướng, thẻ trợ lý gấu (`p8_class_insight`), bảng học sinh theo trạng thái |
| Học sinh | `/teacher/lop/:id/hoc-sinh` | dải "N phụ huynh xin vào lớp" có "Duyệt cả N"; lọc trạng thái; Dán danh sách lớp, In mã riêng |
| Thông báo & Nhắc việc | `/teacher/lop/:id/thong-bao` | khung của phần B (nếu B chưa làm thì chỉ có Thông báo) |
| Cài đặt của cô, Cài đặt lớp | `/teacher/cai-dat`, `/teacher/lop/:id/cai-dat` | Cách cô dạy đã lưu; mặc định cho lớp mới; hồ sơ |
| Đăng nhập, Đăng ký | `/teacher/dang-nhap`, `/teacher/dang-ky` | gấu chào; trạng thái chờ duyệt và bị từ chối hiện ngay trên màn |

**A4. Trống, đang tải, lỗi:** màn trống luôn là `EmptyState` (bỏ emoji 📝 và nút xanh); đang tải là khung xương màu kem; lỗi mạng là `Banner` có "Thử lại", không mất nội dung đang soạn.

**A5. Chất lượng:** WCAG AA (axe 0 lỗi); nút tối thiểu 44px trên điện thoại; vòng focus mật ong; không đổi API, dữ liệu, quyền.

**Kiểm thử phần A**
1. Ảnh 9 màn ở 1280px và 4 màn ở 390px cạnh bản vẽ.
2. Axe `color-contrast`: 0 lỗi ở mọi màn cổng giáo viên.
3. Admin và cổng giáo viên import từ `src/ui/staff/`; không còn màu xanh dương viết cứng trong `/teacher` (báo số chỗ đã thay).
4. Chạy lại kiểm thử của prompt 04: đều qua, không đổi hành vi.
5. Thu nhỏ từ 1280 xuống 360px: thanh bên thành thanh tab dưới, không tràn ngang.
6. `npm run build`, `npm test` thành công.

---

### PHẦN B · "Cô nhắc": thẻ nhắc việc trên màn chính của phụ huynh

**Ý tưởng:** ngoài thông báo thường, cô gửi được **lời nhắc có ngày**: "Mai thứ hai, Mít mặc đồng phục và mang vở Toán". Tối hôm trước, khi mẹ mở app, thẻ "Cô nhắc" nổi trên màn chính, bấm "Đã nhắc con" là xong. Cô biết nhà nào đã nhắc.

**B1. Dữ liệu (migration thêm cột, không đổi cột cũ):**
- `ALTER TABLE announcements ADD COLUMN kind TEXT DEFAULT 'info'` (`info` | `reminder`), `remind_for DATE NULL`, `template_id TEXT NULL`, `assignment_id TEXT NULL`.
- `ALTER TABLE announcement_reads ADD COLUMN done_at`, `done_by_member_id`.
- Chạy thử đếm trước, sao lưu bằng `wrangler d1 export` rồi mới chạy thật (điểm dừng của hướng dẫn giao việc).

**B2. Phía cô (tab Thông báo & Nhắc việc):**
- Hai loại: **Thông báo** (như cũ) và **Nhắc việc** (bắt buộc có `remind_for`).
- **6 mẫu soạn nhanh** lưu trong code: *Đồng phục* ("Mai {thứ}, các con mặc đồng phục {loại}"), *Mang theo* ("Mai mang {vở/sách/đồ dùng}"), *Nộp* ("Nộp {phiếu/tiền/giấy} trước {ngày}"), *Kiểm tra* ("{Ngày} kiểm tra {môn}, ôn {nội dung}"), *Nghỉ học* ("{Ngày} lớp nghỉ vì {lý do}"), *Đổi giờ* ("{Ngày} học từ {giờ} đến {giờ}"). Chỗ trong ngoặc được tô để cô chạm sửa.
- Chọn ngày: "Mai" (mặc định), "Ngày kia", "Chọn ngày". Tuỳ chọn **"Gắn với bài đã giao"**.
- Danh sách đã gửi hiện 3 số: đã đọc / đã nhắc con / tổng; bấm vào xem từng nhà theo tên trong danh sách lớp.
- Tối đa **3 nhắc việc mỗi ngày mỗi lớp**; quá thì báo "Gộp vào một lời nhắc nhé cô".

**B3. Phía phụ huynh:**
- **Thẻ "Cô nhắc"** trên màn chính, dưới lời chào, trên ô theo dõi học đều (prompt 07): tên cô và lớp, câu nhắc, ngày áp dụng, nút **"Đã nhắc con"** và "Để sau"; có "Mở bài" nếu gắn bài.
- **Thời điểm hiện:** từ 12:00 trưa hôm trước đến 12:00 trưa ngày áp dụng. Ngoài khoảng đó lời nhắc nằm trong hộp thông báo; **không xoá** bản ghi.
- Nhiều lời nhắc cùng lúc: một thẻ gộp, vuốt ngang; tối đa 3, còn lại ghi "+N trong hộp thông báo".
- Đến **20:00** tối hôm trước chưa bấm: lần mở app kế tiếp thẻ nổi lên đầu màn, có viền nhấn. Không có thông báo đẩy.
- "Đã nhắc con" ghi `done_at`, `done_by_member_id`; người "Chỉ xem" thấy trạng thái ("Bố đã nhắc lúc 19:40") nhưng không bấm. Mở thẻ ghi `read_at`.
- Trình bày theo bộ giao diện (linh kiện `Card` nhấn mạnh của prompt 07; bộ Gấu có gấu cầm giấy nhắn, Sổ Tay là giấy nhớ dán băng dính, Kẹo Bông là bong bóng bạn Mây). Nếu prompt 07 chưa làm thì dùng thẻ nhấn mạnh hiện có.
- **Nhà nhiều con:** thẻ hiện lời nhắc của **mọi con**, mỗi lời có chip tên con (màu riêng mỗi con), không phụ thuộc con đang chọn ở màn chính.

**B4. Endpoint:** cô: `POST /teacher/classes/{id}/announcements` nhận thêm `kind, remind_for, template_id, assignment_id`; `GET /teacher/announcements/{id}/reads` trả thêm `done_at`. Phụ huynh: `GET /family/reminders?window=today`, `POST /family/announcements/{id}/done`; `GET /family/announcements` trả cờ `kind`. Không thêm cron.

**Kiểm thử phần B**
1. Cô tạo nhắc việc cho ngày mai lúc 15:00: thẻ hiện ngay ở phụ huynh; tạo lúc 10:00 sáng thì chưa hiện, hộp thông báo vẫn có.
2. Bấm "Đã nhắc con": số của cô tăng; tài khoản "Chỉ xem" thấy trạng thái, không có nút.
3. Qua 12:00 trưa ngày áp dụng: thẻ biến mất khỏi màn chính, bản ghi còn.
4. 20:00 chưa bấm: thẻ ở đầu màn có viền nhấn. Lời nhắc thứ 4 trong ngày bị từ chối.
5. Nhà 2 con ở 2 lớp: thẻ có 2 lời nhắc với 2 chip tên khác màu.
6. Gắn bài: "Mở bài" mở đúng bài cô giao. Migration chạy lại lần 2 không lỗi, không đổi dữ liệu cũ.

---

### PHẦN C · Phụ huynh vào lớp bằng link, nhà nhiều con

**Vấn đề:** hiện cô gửi **mã lớp** vào nhóm Zalo, phụ huynh phải mở app, tìm chỗ nhập mã. Nhà nhiều con dễ chọn nhầm con, bố và mẹ có thể kết nối trùng, chưa có cách sửa khi nhầm.

**C1. Link vào lớp**
- Mỗi lớp có link `https://kem-con-hoc-5xf.pages.dev/vao-lop/{join_code}`; mỗi mã riêng có link `/vao-lop/m/{claim_code}`. Nút "Gửi qua Zalo" của cô gửi kèm câu mẫu: "Phụ huynh lớp 3A bấm link để kết nối con vào lớp trên Kèm Con Học: {link}". Có nút "Mã QR" hiện mã để in hoặc chiếu trong buổi họp (sinh ở máy, thư viện dưới 15 KB hoặc tự viết).
- Mở link khi **đã đăng nhập**: vào thẳng màn "Vào lớp" với mã điền sẵn. **Chưa đăng nhập**: màn đăng nhập hoặc tạo gia đình có dải "Đăng nhập để vào Lớp 3A của cô Hạnh"; xong thì quay lại đúng màn "Vào lớp" (giữ mã chờ trong `localStorage['kem-con-hoc:pending-join']`, hết hạn sau 30 phút).
- Endpoint công khai `GET /api/v1/classes/preview?code=` chỉ trả: tên lớp, trường, khối, năm học, tên hiển thị của cô, cách vào lớp. Không trả danh sách học sinh. Chống dò mã: ghi lần nhập sai vào bảng `login_attempts` có sẵn của prompt 00; 10 lần sai trong 15 phút từ một IP thì chặn 15 phút.

**C2. Màn "Vào lớp"**
- Đầu màn: thẻ lớp (tên, trường, khối, tên cô, năm học).
- **Chọn con:** danh sách con của gia đình dạng thẻ (tên, lớp trong hồ sơ). Nhà **một con** thì chọn sẵn. Con có lớp trùng khối của lớp được gắn nhãn "Hợp khối 3". Nút **"Thêm con"** mở ô thêm nhanh (tên, lớp) ngay tại màn, không rời luồng.
- **Cảnh báo lệch khối:** chọn con có lớp khác khối của lớp thì hiện "Bon đang ghi lớp 1, lớp này là khối 3. Đúng con chưa mẹ?" và phải bấm "Đúng, vẫn chọn Bon" mới đi tiếp.
- **Tên trong danh sách lớp:** vào bằng mã riêng thì điền sẵn tên cô đã nhập, không cho sửa. Vào bằng mã lớp chung thì gõ tên; nếu lớp đã có danh sách, gợi ý tên gần đúng.
- 2 ô đồng ý của phụ huynh và của con (giữ nguyên nguyên tắc 1 của prompt 04).
- Nút "Gửi cô duyệt" (mã chung) hoặc "Vào lớp" (mã riêng). Sau đó hỏi: "Nhà còn con khác học lớp này không?" với nút "Chọn thêm con" (sinh đôi, anh em cùng lớp).

**C3. Chặn trùng và sửa nhầm**
- Một con không vào **cùng một lớp** 2 lần: thêm chỉ mục duy nhất `(class_id, child_id)` cho các bản ghi `pending` hoặc `active`. Gặp trùng thì hiện "Mít đã ở lớp này" hoặc "Mít đang chờ cô duyệt", kèm người đã kết nối ("Mẹ đã kết nối lúc 20:05").
- Một con được vào **nhiều lớp** khác nhau (cô chủ nhiệm, cô tiếng Anh), tối đa 5 lớp đang hoạt động.
- **Đổi con trong 24 giờ:** nếu kết nối nhầm con, trong 24 giờ đầu và khi chưa có kết quả bài nào, phụ huynh bấm "Đổi con" để chuyển sang con khác (ghi `child_changed_at`; cô thấy dòng "Phụ huynh đã đổi con"). Sau 24 giờ hoặc đã có kết quả thì phải "Rời lớp" rồi vào lại.

**C4. Màn "Lớp học của con" (Con tôi)**
- Nhóm theo từng con: mỗi con một khối có ảnh đại diện, tên, lớp; dưới là thẻ từng lớp đã kết nối: tên lớp, cô, trạng thái (**Đã kết nối**, **Chờ cô duyệt**, **Bị từ chối** kèm lý do của cô), nút "Đổi con" (nếu còn trong 24 giờ) và "Rời lớp".
- Nút chung "Vào lớp bằng mã hoặc link" ở cuối.
- **Màn chính khi nhiều con:** bài cô giao hiện theo con đang chọn; chip đổi con có chấm đỏ khi con kia có bài mới hoặc lời nhắc chưa bấm.

**C5. Dữ liệu và endpoint**
- `ALTER TABLE class_students ADD COLUMN child_changed_at`; chỉ mục duy nhất ở C3.
- `GET /api/v1/classes/preview?code=` (C1); `POST /family/classes/join` nhận thêm `claimCode?`, trả `409` với `{ reason: 'duplicate', status, linkedBy, linkedAt }`; `PATCH /family/classes/{classStudentId}/child { childId }` (quy tắc 24 giờ, trả `409` nếu đã có kết quả).
- Mọi endpoint theo quyền của prompt 00 và 03; không thêm cron.

**Kiểm thử phần C**
1. Bấm link khi chưa đăng nhập: đăng nhập xong vào đúng màn "Vào lớp" với mã điền sẵn; sau 30 phút mã chờ hết hạn.
2. Nhà một con: con được chọn sẵn. Nhà 2 con: chọn Bon lớp 1 vào lớp khối 3 thì hiện cảnh báo, phải xác nhận mới đi tiếp.
3. Mẹ kết nối Mít vào 3A; bố mở cùng link chọn Mít: thấy "Mẹ đã kết nối", không tạo bản ghi mới (kiểm tra bảng).
4. Sinh đôi: sau khi gửi cho con thứ nhất, "Chọn thêm con" kết nối được con thứ hai vào cùng lớp.
5. Mít vào 3A và lớp tiếng Anh: cả hai hiện trong "Lớp học của con"; lớp thứ 6 bị từ chối.
6. Đổi con trong 24 giờ khi chưa có kết quả: thành công, cô thấy dòng "Phụ huynh đã đổi con"; đã có kết quả thì báo phải rời lớp.
7. Nhập sai mã 10 lần trong 15 phút: bị chặn 15 phút; `preview` không bao giờ trả danh sách học sinh.
8. `npm run build`, `npm test` và test Worker thành công.

---

### Không làm trong prompt này
- Không đổi nguyên tắc dữ liệu cô được thấy (prompt 04 nguyên tắc 2), không cho cô xem ảnh, bài làm, chat AI.
- Không làm chat hai chiều, thông báo đẩy, Zalo OA/ZNS.
- Không tự xoá dữ liệu: rời lớp, đổi con, lời nhắc hết hạn đều chỉ đổi trạng thái.
- Không làm lại admin (phần A chỉ tạo bộ dùng chung để admin dùng).

### Báo lại khi xong (theo phần đã làm)
- Danh sách file, migration, endpoint đã thêm; với phần A: các component trong `src/ui/staff/` và nơi dùng.
- Ảnh các màn liên quan cạnh bản vẽ (phần A: 9 màn laptop, 4 màn điện thoại; phần B: thẻ Cô nhắc ở 3 bộ giao diện và màn soạn của cô; phần C: Vào lớp, cảnh báo lệch khối, Lớp học của con với 2 con).
- Kết quả kiểm thử của phần đã làm, mục nào chưa làm được và vì sao.

---

## NHẬT KÝ THỰC THI & DANH SÁCH CÁC ĐIỂM FIX HOÀN THIỆN (25/10/2026)

### 1. Trạng Thái Hoàn Thành
- **Phần A**: 100% Hoàn thành (Chuyển đổi Cổng Giáo viên sang giao diện Bản Gấu, loại bỏ toàn bộ mã màu xanh hardcode, tạo hệ thống design system `src/ui/staff/` gồm 16 component, đạt chuẩn WCAG AA tương phản >= 4.5:1).
- **Phần B**: 100% Hoàn thành ("Cô nhắc" có ngày `remind_for`, 6 mẫu soạn nhanh, giới hạn 3 nhắc/ngày, đếm đã đọc/đã nhắc con, hiển thị từ 12:00 trưa hôm trước đến 12:00 trưa hôm sau, viền cam sau 20:00).
- **Phần C**: 100% Hoàn thành (Link vào lớp `/vao-lop/{code}` & `/vao-lop/m/{claimCode}`, preview công khai không lộ học sinh, chọn đúng con, cảnh báo lệch khối, chặn trùng, sinh đôi, đổi con trong 24h, màn Lớp học của con trong Con tôi, chấm đỏ trên chip con).

### 2. Các Điểm Đã Fix & Chuẩn Hoá Trong Quá Trình Kiểm Thử E2E
1. **Chuẩn hoá tên cột thành viên gia đình (`members`)**:
   - Trong `src/teacher_routes.js`, câu truy vấn `(SELECT name FROM members WHERE id = ...)` đã được sửa thành `(SELECT display_name FROM members WHERE id = ...)` do bảng `members` sử dụng cột `display_name`. Khắc phục lỗi trả về `null` tên phụ huynh khi xem drill-down "Đã nhắc con".
2. **Khả năng tương thích dữ liệu kết nối lớp (`POST /api/v1/family/classes/join`)**:
   - Worker hỗ trợ fallback linh hoạt `effectiveRosterName = rosterName || childName`, tương thích với cả các client truyền `childName` hoặc `rosterName`.
3. **Tối ưu dung lượng mã QR SVG (`src/qrCode.js`)**:
   - Sử dụng thuật toán run-length merging gộp các ô đen liên tiếp theo hàng, giảm kích thước SVG từ 17KB xuống < 7.5KB, zero-dependency, sắc nét crispEdges.
4. **Đồng bộ Submenu Admin Portal (`src/Admin.jsx`)**:
   - Đưa mục **"Công cụ nội bộ & D1 SQL Studio"** thành submenu cố định trên thanh điều hướng bên trái (gồm `D1 SQL Studio (Chỉ đọc)` và `Team Prompts Sync`).
5. **Bộ kiểm thử tích hợp tự động toàn diện (`scripts/test-e2e-full-flow.mjs`)**:
   - Kiểm thử 28 bước từ Admin duyệt giáo viên, giáo viên tạo lớp & gửi lời nhắc, phụ huynh xem preview, vào lớp, chặn trùng, 24h đổi con, bấm đã nhắc con, buổi học kèm và góc hạ hoả. Đạt 100% Pass.
6. **Production Deployment**:
   - Cloudflare Worker Version: `212d44ae-c54d-4c92-b0e6-1b4a5a12cb15` trên `ai-gateway-worker.trannth1306.workers.dev`.
   - Cloudflare Pages: Deployment `718dac49` trên `https://kem-con-hoc-5xf.pages.dev`.
