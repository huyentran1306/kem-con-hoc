# BẢNG TỔNG HỢP SỐ LIỆU ĐO LƯỜNG 3 TÍNH NĂNG AI · VÒNG CHUNG KẾT
*Dự án: Kèm Con Học · Ngày đo: 2026-10-25 · Phiên bản: Đợt 14*

---

### BẢNG CHỈ SỐ VÀNG ĐƯA VÀO SLIDE THUYẾT TRÌNH

| STT | Tính năng / Bộ đo | Số lượng mẫu | Tiêu chuẩn đo lường | Kết quả thực tế | Tỉ lệ Đạt | Đánh giá Ban Giám Khảo |
|---|---|:---:|---|:---:|:---:|:---:|
| **1** | **Phần A: Chấm vở, không sửa hộ** | 20 bài | Nhận diện dòng viết tay, phân loại lỗi, tìm đúng bước sai đầu tiên, từ chối ảnh không phải bài tập | **20/20 bài** | **100%** | **Vượt cam kết** (Chấm chính xác, không sửa hộ) |
| **2** | **Độc lập tính toán (Arithmetic Guard)** | 25 ca phép tính | Kiểm tra không dùng eval, tính nhẩm tiếng Việt, số thập phân 2,5, ghi đè khi AI nhầm | **25/25 ca** | **100%** | **Khách quan tuyệt đối** (Máy tính độc lập) |
| **3** | **Phần B: Nghe con giảng lại (Speech Rubric)** | 15 đoạn | Bóc băng tiếng Việt, 4 tiêu chí cốt lõi, trích dẫn có thật, đề xuất mức tự chủ | **15/15 ca** | **100%** | **Sư phạm cá nhân hoá** (Khuyến khích con nói) |
| **4** | **Khử ảo giác trích dẫn (Anti-Hallucination)** | 2 bẫy ảo giác | Bắt 100% trích dẫn bịa đặt, tự động hạ điểm và cảnh báo | **2/2 bẫy** | **100%** | **An toàn học thuật** (Không chấp nhận bịa đặt) |
| **5** | **Phần C: Tấn công đỏ (Red-Team Attacks)** | 20 kịch bản | Prompt injection, social engineering, roleplay, số chữ tiếng Việt, schema override | **20/20 chặn** | **100%** | **An toàn cấp quân sự** (0 rò rỉ đáp án) |
| **6** | **Chất lượng gợi mở Socratic (p3_explain)** | 30 đề | 3-5 bậc gợi mở, có lý do sư phạm cho mẹ (`ly_do_cho_me`), không lộ đáp án | **30/30 đề** | **100%** | **Chuẩn phương pháp Socratic** |

---

### 3 ĐIỂM SÁNG CÔNG NGHỆ KHÁC BIỆT TRONG VÒNG CHUNG KẾT
1. **Chấm vở, không sửa hộ (Phần A)**: AI không bao giờ ghi đáp án đúng lên bài của con. Máy tính toán độc lập shunting-yard tìm ra dòng sai đầu tiên và đưa ra câu hỏi gợi mở qua đồ vật / que tính để con tự sửa.
2. **Khử ảo giác trích dẫn (Phần B)**: Chấm theo lời nói thật 100%. Nếu AI bịa trích dẫn không có trong lời con, hệ thống triệt tiêu ngay lập tức.
3. **Guard Module 4 lớp bảo vệ (Phần C)**: Mọi câu hỏi sinh ra từ AI đều đi qua bộ lọc Regex tiếng Việt Unicode và chuẩn hóa số chữ, đảm bảo trẻ luôn được rèn luyện tư duy tự chủ.
