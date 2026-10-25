# Gói đợt 3 (25/10/2026): sửa lỗi sau đợt 07 đến 11 và giao một lần

Gói này chỉ chứa phần mới, chưa giao lần nào. Chép vào cùng thư mục với các gói trước.

| File | Dùng để |
|---|---|
| `13_GIAO_MOT_LAN.md` | **Prompt tổng, giao file này.** AI tự làm 6 chặng liền nhau: sửa lỗi P0, sửa P1 và P2, hoàn thiện cổng giáo viên, admin thiết kế bộ giao diện, lưới an toàn (test tự động, ghi lỗi, chấm AI), chế độ Dùng thử |
| `12_SUA_LOI_SAU_DOT_07_11.md` | Danh sách lỗi chi tiết (6 P0, 8 P1, 10 P2) kèm bằng chứng, nguyên nhân, cách sửa, kiểm thử. Prompt 13 chặng 1 và 2 làm theo file này |
| `bang-chung/` | 19 ảnh chụp lỗi, tên file khớp số mục trong prompt 12 (ví dụ `p0-3-…` là mục P0.3) |

## Giao cho AI thế nào
- Đưa: mã nguồn mới nhất, cả gói này, cùng các file đã gửi trước: `00_NEN_TANG_TAI_KHOAN_VA_BAO_MAT.md`, `10_ADMIN_THIET_KE_BO_GIAO_DIEN.md`, `11_CONG_GIAO_VIEN_BAN_GAU.md`, thư mục `tham-khao/`.
- Lời nhắn mở đầu: dùng đoạn có sẵn ở đầu `13_GIAO_MOT_LAN.md`. **Không giao riêng prompt 12**; prompt 13 đã bao gồm.
- AI chỉ dừng hỏi ở 5 điểm: deploy production, khoá `/db/*`, migration trên database thật, xoá dữ liệu, mật khẩu admin. Theo dõi tiến độ trong file `BAO_CAO_DOT_13.md` AI tạo ra.

## Việc chủ dự án làm ngay
1. **Đổi mật khẩu admin** (trang đăng nhập admin đang hiện công khai tài khoản mặc định).
2. Khi AI hỏi, xác nhận cho khoá cổng cũ `/db/*`.
3. Xoá gia đình thử nghiệm "Review Test Claude 2510" khi không cần nữa.
