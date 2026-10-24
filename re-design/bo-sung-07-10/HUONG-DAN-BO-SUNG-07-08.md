# Hướng dẫn gói bổ sung: prompt 07, 08, 09, 10 và mục 4b

Gói này **bổ sung** cho bộ prompt 00 đến 06 đã giao trước đó (chốt ngày 24/10/2026). Không thay thế file nào của bộ cũ.

## Trong gói có gì

| File | Dùng để |
|---|---|
| `07_GIAO_DIEN_RIENG_TUNG_BO.md` | **Phần A:** sửa chữ trắng khó đọc trên bản đang chạy. **Phần B:** mỗi bộ giao diện có bố cục riêng ở 3 màn chính, bộ linh kiện riêng cho 9 màn còn lại, 4 icon thanh dưới khác hình, theo dõi học đều mỗi ngày |
| `08_GOC_HA_HOA_MOI.md` | Góc hạ hoả mới: nhắc đúng lúc, chọn lý do một chạm, thổi cùng con qua mic, câu nói hợp bài, đổi vai, dừng nhẹ nhàng, ghi nhận riêng cho bố mẹ |
| `10_ADMIN_THIET_KE_BO_GIAO_DIEN.md` | Admin tạo, kiểm tra, phát hành bộ giao diện mới trong admin bản Gấu, không cần code hay deploy; bộ theo mùa có thời hạn; phiên bản và audit |
| `09_TU_THIET_KE_BO_GIAO_DIEN.md` | Bộ thứ 9 do gia đình tự ghép (màu, nền, chữ, nút, bạn đồng hành, icon), xem trước ngay, mã chia sẻ; bạn đồng hành có tính cách; kể chuyện hoá đề bài |
| `04_GIAO_VIEN_LOP_HOC_GIAO_BAI.md` (bản cập nhật) | Thêm **mục 4b "Cô nhắc"**: cô gửi lời nhắc có ngày, thẻ nổi trên màn chính của mẹ, nút "Đã nhắc con", 6 mẫu soạn nhanh. Thay cho file 04 trong bộ cũ |
| `RA-SOAT-LIVE-2026-10-24.md` | Kết quả rà bản live tối 24/10: 3 lỗi nên sửa ngay, đo hiệu năng, danh sách enhance xếp hạng |
| `tham-khao/8-bo-giao-dien-rieng.html` | Bản vẽ 8 bộ x 12 màn (Đăng nhập tới Góc hạ hoả), bảng khác biệt, bộ icon riêng. Kèm prompt 07 |
| `tham-khao/goc-ha-hoa.html` | Bản vẽ Góc hạ hoả: 6 ý, lưu đồ, 6 màn, 3 kiểu thổi ở bộ khác. Kèm prompt 08 |
| `tham-khao/co-nhac.html` và `tham-khao/tu-thiet-ke.html` | Cùng một trang: phần 1 là Cô nhắc (mục 4b), phần 2 là Tự thiết kế (prompt 09) |
| `tham-khao/admin-thiet-ke-giao-dien.html` | 4 màn admin thiết kế bộ giao diện và lưu đồ phát hành; kèm prompt 10 |

Đặt các file này vào **cùng thư mục** với bộ cũ (giữ nguyên thư mục `tham-khao/`).

## Liên quan tới các prompt đang chạy

| Prompt mới | Cần có trước | Không bắt buộc nhưng tốt hơn nếu có |
|---|---|---|
| **07 phần A** (sửa màu chữ) | 01 (bản live đã có) | |
| **07 phần B** (bố cục, linh kiện, icon, theo dõi học đều) | 01, 07 phần A | 06 mục B2 (tuần tính theo thời điểm), 00 (ghi buổi học ở máy chủ) |
| **08** (Góc hạ hoả) | | 07 (hình thổi theo bộ, ô theo dõi), 02 (cách đọc cấu hình), 05 (bộ chặn lộ đáp án), 03 (vai "Chỉ xem", báo cáo Zalo) |
| **09** (Tự thiết kế) | 07 phần B | 03 (quyền đổi giao diện), 08 (nhân vật trong màn thổi), 04 mục 4b (nhân vật trên thẻ Cô nhắc) |
| **10** (Admin thiết kế bộ) | 07 phần B, 05 (khung admin, vai trò, audit) | 09 (dùng chung trình xem trước và bảng tính màu) |
| **04 mục 4b** (Cô nhắc) | 00, 04 | 03 (quyền bấm "Đã nhắc con"), 07 (linh kiện theo bộ) |

**Đề xuất thứ tự:** chờ AI kia làm xong prompt đang dở và anh chị đã deploy, rồi giao 3 việc sửa ngay trong `RA-SOAT-LIVE-2026-10-24.md` mục 2 (1 ngày) → **07 phần A** → **07 phần B** → **08** → **09** → 03 → 05 → **10** → **04 kèm 4b**. Không giao song song với một prompt khác đang sửa cùng các màn Home, Hỏi con, Xong bài, Báo cáo, vì dễ đè code của nhau.

## Mỗi lần giao việc, đưa cho AI
1. Mã nguồn bản mới nhất (React + Vite và Cloudflare Worker gateway).
2. `HUONG-DAN-GIAO-VIEC.md` (bộ cũ), file này, và `00_NEN_TANG_TAI_KHOAN_VA_BAO_MAT.md` (phần "Quy tắc khi chạy trên gói Free").
3. File prompt của lần đó và bản vẽ đi kèm trong `tham-khao/`.

**Không đưa:** file `.env`, `wrangler.toml` có khoá thật, mật khẩu, khoá API, mã PIN admin.

## Lời nhắn mở đầu (copy, thay NN)

> Bạn là kỹ sư của dự án Kèm Con Học. Hãy đọc `HUONG-DAN-GIAO-VIEC.md`, `HUONG-DAN-BO-SUNG-07-08.md`, phần "Quy tắc khi chạy trên gói Free" trong `00_NEN_TANG_TAI_KHOAN_VA_BAO_MAT.md`, rồi làm **đúng và chỉ** phần PROMPT trong file `NN_....md` (với prompt 07, lần này chỉ làm **phần A** / **phần B**). Bản vẽ ở thư mục `tham-khao/` nêu trong prompt; khi prompt và bản vẽ khác nhau thì làm theo prompt và báo lại chỗ khác. Không làm các mục ghi "Không làm trong prompt này". Trước khi sửa code, liệt kê ngắn các file sẽ sửa và cách làm; gặp chỗ phải đoán thì hỏi lại thay vì tự quyết. Làm xong, chạy đủ phần "Kiểm thử bắt buộc" và trả lời theo mục "Báo lại khi xong".

## Điểm dừng bắt buộc (giữ như bộ cũ)
- Chỉ deploy bản preview; production do anh chị bấm.
- Không xoá dữ liệu người dùng. Prompt 07 chỉ **đọc** lịch sử sticker để suy ra các tối đã học, không sửa, không xoá. Prompt 08 không tự xoá lịch sử Góc hạ hoả.
- Prompt 08 dùng mic: chỉ xử lý trên máy, không ghi âm, không gửi đi. Nếu AI đề xuất lưu hay gửi âm thanh thì từ chối.

## Quyết định đã chốt thêm (đừng để AI đổi)
- Mỗi bộ giao diện có **đủ 12 màn** theo bản vẽ; 3 màn chính có bố cục riêng hoàn toàn, 9 màn còn lại giữ cấu trúc nhưng dùng linh kiện riêng của bộ.
- **4 icon thanh dưới khác hình theo chủ đề** ở từng bộ (ví dụ Gấu: hũ mật, quả bóng, tổ ong, mặt gấu). 3 nút nhập đề giữ hình chung.
- Chữ trên nền màu dùng biến `--c-on-...`, không viết cứng màu trắng; mọi màn phụ huynh đạt tương phản WCAG AA, có test tự động.
- Ô theo dõi học đều: mục tiêu mặc định 4 tối mỗi tuần, không dùng chữ gây áp lực ("bỏ lỡ", "mất chuỗi").
- Góc hạ hoả: thẻ nhắc không chặn thao tác, tối đa 2 lần mỗi tối; ghi nhận riêng cho bố mẹ không gửi Zalo nếu không bật, giáo viên không bao giờ thấy.
- Tự thiết kế: chỉ chọn trong bảng đã tính sẵn, không nhập mã màu tự do; mọi tổ hợp có test tương phản tự động.
- Cô nhắc: một chiều, tối đa 3 lời nhắc mỗi ngày mỗi lớp; cô chỉ thấy đã đọc / đã nhắc, không thấy dữ liệu học.
- Admin thiết kế bộ: 8 bộ gốc chỉ nhân bản, không sửa; SVG tải lên phải qua làm sạch ở cả trình duyệt và Worker; còn cảnh báo tương phản thì chỉ phát hành thử nội bộ.
- File `tham-khao/8-bo-giao-dien-app.html` (bộ cũ) vẫn là nguồn bảng màu của prompt 01; với 12 màn nêu trên, `8-bo-giao-dien-rieng.html` là bản chốt.
