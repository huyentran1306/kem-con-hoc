# Gói đợt 4 (25/10/2026): ba tính năng AI cho vòng chung kết

Gói này chỉ chứa phần mới, chưa giao lần nào. Chép vào cùng thư mục với các gói trước.

| File | Dùng để |
|---|---|
| `14_BA_TINH_NANG_AI_CHUNG_KET.md` | **Prompt giao cho AI.** 5 chặng: nền an toàn chung, Chấm vở không sửa hộ, Nghe con giảng lại, Minh bạch cho phụ huynh và tab An toàn AI cho admin, bộ đo bằng số + kiểm thử tự động + chế độ Dùng thử |
| `tham-khao/ba-tinh-nang-ai.html` | Bản thiết kế: 17 màn điện thoại (bộ Kẹo Bông), 1 màn admin bản Gấu, 3 lưu đồ, trạng thái phụ, kịch bản demo 3 phút |

## Giao cho AI thế nào
- **Chỉ giao khi prompt 13 đã xong.** Prompt 14 dùng bộ chặn, bảng buổi học, bộ kiểm thử và chế độ Dùng thử mà prompt 13 làm ra. Nếu `BAO_CAO_DOT_13.md` còn mục "chưa đạt", để AI sửa trước.
- Đưa: mã nguồn mới nhất, cả gói này, cùng các file đã gửi trước: `00_NEN_TANG_TAI_KHOAN_VA_BAO_MAT.md`, `02_KIEM_TRA_ANH_NGOAI_PHAM_VI.md`, `05_ADMIN_REDESIGN_GIAO_DIEN_VA_TINH_NANG.md`, `07_GIAO_DIEN_RIENG_TUNG_BO.md`, `13_GIAO_MOT_LAN.md`.
- Lời nhắn mở đầu: dùng đoạn có sẵn ở đầu `14_BA_TINH_NANG_AI_CHUNG_KET.md`.
- AI chỉ dừng hỏi ở 5 điểm: deploy production, migration trên database thật, xuất bản bản p3 mới cho mọi người, đổi model AI, xoá dữ liệu. Theo dõi tiến độ trong `BAO_CAO_DOT_14.md`.

## Việc chủ dự án làm
1. Khi AI làm xong chặng 5, xem **bảng số liệu cho slide** ở cuối `BAO_CAO_DOT_14.md`. Chỉ đưa lên slide số đo thật trong bảng đó.
2. Tuỳ chọn, để số liệu thuyết phục hơn: chụp vài bài toán viết tay thật (người lớn viết, không có mặt trẻ) bỏ vào `ai-eval/vo-that/`, và ghi 5 đoạn một bạn nhỏ kể lại bài vào `ai-eval/giang-lai/am-thanh/`.
3. Tập kịch bản demo 3 phút ở cuối file thiết kế; luôn mở sẵn chế độ Dùng thử làm phương án dự phòng.
4. Việc còn treo từ đợt 3: đổi mật khẩu admin, xác nhận khoá `/db/*`, xoá gia đình thử nghiệm "Review Test Claude 2510" khi không cần nữa.
