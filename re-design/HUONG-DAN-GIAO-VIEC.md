# Hướng dẫn giao việc cho AI lập trình

Bộ tài liệu nâng cấp **Kèm Con Học** sau vòng trong, chốt ngày 24/10/2026. Đọc file này trước khi giao bất kỳ prompt nào.

## Trong thư mục có gì

| File | Dùng để |
|---|---|
| `00_NEN_TANG_TAI_KHOAN_VA_BAO_MAT.md` | Đăng nhập kiểm tra ở máy chủ, phân quyền, ghi nhận từng buổi học, **quy tắc chạy trên gói Cloudflare Free** (áp dụng cho mọi prompt) |
| `01_GIAO_DIEN_THEO_SO_THICH_GIA_DINH.md` | 8 bộ giao diện, gia đình tự chọn |
| `02_KIEM_TRA_ANH_NGOAI_PHAM_VI.md` | Phân loại ảnh và đề ngoài phạm vi, luật chỉnh trong admin |
| `03_NHOM_GIA_DINH_VA_BAO_CAO_ZALO.md` | Nhiều thành viên một gia đình, báo cáo tuần gửi Zalo |
| `04_GIAO_VIEN_LOP_HOC_GIAO_BAI.md` | Cổng giáo viên: lớp, giao bài, thông báo, cài đặt riêng của cô |
| `05_ADMIN_REDESIGN_GIAO_DIEN_VA_TINH_NANG.md` | Làm lại trang admin (bản Gấu) |
| `06_SUA_LOI_NHANH_VA_BO_DU_LIEU_GIA.md` | Sửa lỗi và dữ liệu giả của bản đang chạy |
| `UI-VA-THAO-TAC.html` | Bản vẽ từng màn đã chốt + thao tác + lưu đồ (mở bằng Chrome) |
| `TONG-HOP-GIAI-PHAP.html` | Tổng hợp giải pháp, các quyết định đã chốt (cho người đọc) |
| `tham-khao/8-bo-giao-dien-app.html` | Thiết kế 8 bộ giao diện, kèm prompt 01 |
| `tham-khao/stitch-admin/` | Thiết kế admin gốc từ Stitch, kèm prompt 05 |

## Thứ tự làm

| Đợt | Prompt | Điều kiện bắt đầu |
|---|---|---|
| 1 | **06** Sửa lỗi nhanh | Làm ngay |
| 1 | **01** Giao diện | Làm ngay, song song được với 06 |
| 1 | **02** Ảnh ngoài phạm vi | Làm ngay (phần admin đặt tạm trong admin cũ) |
| 2 | **00** Nền tảng, giai đoạn A rồi B | Đợt 1 đã deploy và chạy ổn |
| 3 | **05** Admin mới | 00 xong |
| 3 | **03** Nhóm gia đình và Zalo | 00 xong |
| 4 | **04** Cổng giáo viên | 00 xong, nên có 03 |

**Mỗi phiên làm việc chỉ giao một prompt.** Không đưa cả thư mục rồi bảo "làm hết", vì AI sẽ làm lẫn phạm vi và khó kiểm tra.

## Mỗi lần giao việc, đưa cho AI

1. **Mã nguồn bản mới nhất** của app (React + Vite) và của Cloudflare Worker gateway. Bản đang chạy là `kem-con-hoc-5xf.pages.dev`; mã cũ trong máy (ngày 21/10) **không phải** bản mới nhất.
2. File này (`HUONG-DAN-GIAO-VIEC.md`).
3. File prompt của đợt đó, cộng `00_NEN_TANG_TAI_KHOAN_VA_BAO_MAT.md` (để AI đọc phần "Quy tắc khi chạy trên gói Free", kể cả khi đang làm prompt khác).
4. `UI-VA-THAO-TAC.html` và thư mục tham khảo liên quan (01 cần `tham-khao/8-bo-giao-dien-app.html`, 05 cần `tham-khao/stitch-admin/`).

**Không đưa:** file `.env`, `wrangler.toml` có khoá thật, mật khẩu, khoá API, mã PIN admin thật. Secret đặt bằng `wrangler secret put`, AI chỉ cần biết tên biến.

## Lời nhắn mở đầu (copy, thay NN)

> Bạn là kỹ sư của dự án Kèm Con Học. Hãy đọc `HUONG-DAN-GIAO-VIEC.md`, phần "Quy tắc khi chạy trên gói Free" trong `00_NEN_TANG_TAI_KHOAN_VA_BAO_MAT.md`, rồi làm **đúng và chỉ** phần PROMPT trong file `NN_....md`. Bản vẽ giao diện và thao tác ở `UI-VA-THAO-TAC.html`, phần NN; khi prompt và bản vẽ khác nhau thì làm theo prompt và báo lại chỗ khác. Không làm các mục ghi "Không làm trong prompt này" hoặc "Để sau". Trước khi sửa code, liệt kê ngắn các file sẽ sửa và cách làm; gặp chỗ phải đoán thì hỏi lại thay vì tự quyết. Làm xong, chạy đủ phần "Kiểm thử bắt buộc" và trả lời theo mục "Báo lại khi xong".

## Điểm dừng bắt buộc (AI phải hỏi lại, không tự làm)

- **Deploy lên production**: chỉ deploy bản preview để kiểm tra; production do anh chị bấm.
- **Prompt 00, giai đoạn C** (khoá `/db/query`, `/db/execute`, `/db/kv`): chỉ làm khi anh chị xác nhận không còn bản app cũ nào gọi.
- **Chạy migration hoặc backfill trên database thật**: chạy thử (đếm) trước, xuất bản sao bằng `wrangler d1 export`, rồi mới chạy thật.
- **Bất kỳ thao tác xoá dữ liệu người dùng nào.** Theo thiết kế đã chốt, không có bước nào tự xoá: sticker mẫu chỉ được đánh dấu và ẩn (prompt 06), tự dọn dữ liệu cũ mặc định tắt (prompt 00, mục 10). Nếu AI đề xuất xoá, hoặc anh chị muốn xoá các gia đình tạo lúc thử nghiệm, phải hỏi và sao lưu trước.
- **Mở cổng giáo viên cho trường thật**: chờ người có chuyên môn pháp lý rà phần đồng ý và dữ liệu trẻ em (xem prompt 04, nguyên tắc 1).

## Sau mỗi đợt

1. Đọc phần "Báo lại khi xong" của AI: đủ kết quả kiểm thử chưa, có mục nào bỏ qua không.
2. Mở bản preview, bấm thử theo đúng thao tác trong `UI-VA-THAO-TAC.html`.
3. Kiểm tra không có lỗi trong Console, không có chuỗi nhạy cảm trong `dist/` (PIN cũ, khoá, URL nội bộ).
4. Ổn rồi mới deploy production và giao prompt tiếp theo.

## Các quyết định đã chốt (đừng để AI đổi)

- Dùng **gói Cloudflare Free**; giữ cách băm mật khẩu hiện tại nhưng kiểm tra ở máy chủ (prompt 00, mục 2).
- Giao diện mặc định của app: **Kẹo Bông**. Admin: **bản Gấu** (bảng màu xanh dương là tuỳ chọn). Cổng giáo viên: cố định **Bento Mềm**, chữ Be Vietnam Pro.
- **AI không bao giờ đưa đáp án cho con**; bộ chặn lộ đáp án chạy ở máy chủ (prompt 05).
- Zalo chỉ dùng bảng chia sẻ của điện thoại; chưa làm Zalo OA, ZNS.
- Cấu hình 3 tầng: admin một cho toàn hệ thống, mỗi cô một trang cài đặt riêng, mỗi nhà một cài đặt.
- **Không tự xoá dữ liệu người dùng.** Chỉ xoá khi chính phụ huynh bấm xoá; tự dọn dữ liệu cũ là công tắc trong admin, mặc định tắt.

## Lưu ý

- Thư mục `tham-khao/stitch-admin/` là bản thiết kế gốc, có mã PIN admin hiện rõ trong vài màn. Sau khi làm prompt 00 và 05, **đổi PIN admin hiện tại** (PIN cũ đã nằm trong file JS công khai).
- Số liệu trong bản vẽ chỉ để minh hoạ; app phải lấy từ dữ liệu thật.
