# BÁO CÁO THỰC HIỆN ĐỢT 14 (PROMPT 24)
## GÓC CHƠI CHUNG: 3 TRÒ 5 PHÚT CHO MẸ VÀ BÉ CHƠI CÙNG

- **Ngày thực hiện:** 27/10/2026
- **Gói yêu cầu:** `kem-con-hoc-dot-14-goc-choi-chung-2026-10-27`
- **Mục tiêu chính:** 
  1. Góc chơi chung đặt ở đầu tab Trò chơi, thẻ "Hôm nay ôn", đếm ngược thời gian chơi trong ngày.
  2. 3 trò chơi mẹ con: Đấu trí hai đầu bàn, Leo cây mật ong, Thám tử đồ vật.
  3. Tiêu chí cốt lõi: **0 Token AI** (sinh câu hỏi và logic 100% bằng code client), tự động dừng khi hết giờ (không có nút chơi thêm), luôn khen cả hai mẹ con.
  4. Cài đặt thời gian chơi hàng ngày (3, 5, 10, 15 phút, mặc định 5 phút) trong "Con tôi".
  5. Kiểm thử đơn vị 1.000 câu hỏi ngẫu nhiên đạt 100% PASS; kiểm thử Playwright tự động chụp đủ 8 ảnh minh chứng ở 390x844.

---

## 1. TỔNG HỢP 5 CHẶNG ĐÃ THỰC HIỆN

### Chặng 1 · Góc chơi chung & Nền tảng dữ liệu (0 Token)
- **Giao diện trung tâm:** Đưa màn Góc chơi chung lên đầu tab Trò chơi:
  - Header linh vật gấu, tiêu đề, mô tả ấm áp.
  - Thẻ "Hôm nay ôn" hiển thị kỹ năng trọng tâm và thời gian chơi còn lại hôm nay.
  - 3 thẻ trò chơi trực quan với huy hiệu và thời lượng 5 phút.
  - Dòng chú thích minh bạch: "không tốn token, tự dừng khi hết giờ".
  - Khu "Chụp đồ vật để Gấu nghĩ trò" cũ được chuyển xuống dưới một cách gọn gàng.
- **Bộ tạo câu hỏi thuần code (`src/games/questionGenerator.js`):**
  - Lớp 1: Phép cộng trừ phạm vi 20.
  - Lớp 2: Phép cộng trừ phạm vi 100, bảng nhân 2 đến 5.
  - Lớp 3: Bảng nhân chia, biểu thức 2 bước.
  - Câu hỏi mẹ: Phép tính 2 bước cân sức để con có cơ hội thắng mẹ công bằng.
  - Câu hỏi đọc hiểu đề: Tìm số đã dùng / số ban đầu / số còn lại.
  - Options: 1 đúng, 2 nhiễu cách đáp án đúng 1-3 đơn vị, không trùng, không số âm.
  - **Kiểm thử đơn vị:** Chạy 1.000 câu ngẫu nhiên qua `tests/questionGenerator.test.mjs`, đạt **1.000/1.000 PASS** (100%).
- **Thời gian chơi & Ghi nhận sự kiện:**
  - `src/games/gameStorage.js`: Lưu thời gian chơi hàng ngày theo từng bé (mặc định 5 phút, tuỳ chọn 3, 5, 10, 15 phút).
  - Tích hợp vào màn Profile (Con tôi) thẻ "Thời gian chơi chung mỗi ngày".
  - `logGameAnswer`: Ghi lại sự kiện học tập; câu trả lời của mẹ không tính vào kỹ năng của con.

### Chặng 2 · Trò 1: Đấu trí hai đầu bàn
- **Màn hình chia đôi xoay 180 độ:** Nửa của mẹ ở trên xoay 180 độ đối diện bé, nửa của bé ở dưới xoay xuôi.
- **Cân sức tự nhiên:** Câu mẹ là 2 phép tính (khó hơn), câu bé là 1 phép tính vừa sức theo lớp.
- **Multi-touch độc lập:** Bé và mẹ có thể bấm cùng lúc hoặc độc lập, không block sự kiện của nhau.
- **Vòng chơi & Đếm ngược:** Thanh đếm 6 giây đổi màu theo độ khẩn cấp, mỗi ván gồm 6 câu.
- **Màn Hết ván:** Khen cả hai mẹ con ("Mẹ phản xạ siêu nhanh", "Bé tính nhẩm cực chuẩn"), kèm thẻ Gấu thấy phân tích kỹ năng bé vừa ôn tập.

### Chặng 3 · Trò 2: Leo cây mật ong
- **Mẹ và con cùng một phe:** Hợp lực vượt qua 8 bậc cây để lên hũ mật ong.
- **Cơ chế đổi lượt:** Công tắc gạt "Bé trả lời / Mẹ trả lời", người chơi có thể tự gạt hoặc app tự luân phiên.
- **Chữa sai sư phạm:** Nếu bấm sai, cho phép thử lại 1 lần; nếu sai tiếp thì giải thích ngắn rồi bước tiếp.
- **Đếm ngược toàn trận:** Thanh thời gian 2 phút tạo không khí hào hứng.
- **Màn Tới đích:** Đổ mật ngọt ngào, âm thanh thắng cuộc và trao huy hiệu "Đồng đội".

### Chặng 4 · Trò 3: Thám tử đồ vật
- **Nhiệm vụ theo lớp:** Tìm 3 nhóm đồ vật quanh nhà có tổng đúng bằng số nhiệm vụ (ví dụ: tổng 10 cái gồm thìa, bút, kẹp giấy).
- **Hành vi hai mẹ con:** Bé tìm đồ vật hoặc chụp/chọn nhóm, mẹ là trọng tài kiểm đếm và bấm "Đúng rồi ✓".
- **Phép tính hiện dần:** Hiển thị công thức số học thời gian thực `A + B + C = Tổng`.
- **Màn Phá án thành công:** Trao huy hiệu "Sáng tạo", ghi nhận điểm học tập cho con.

### Chặng 5 · Kiểm thử Playwright & Bằng chứng nghiệm thu
- Chạy toàn bộ luồng kiểm thử qua Playwright tại viewport mobile chuẩn `390x844`.
- Đã xuất bản và lưu trữ đầy đủ 8 bức ảnh bằng chứng nghiệm thu tại `bang-chung/dot-24/bear/`:
  1. `1_goc_choi_chung.png`: Màn Góc chơi chung ở đầu tab Trò chơi.
  2. `2_dau_tri_dang_choi.png`: Màn Đấu trí hai đầu bàn đang thi đấu (nửa trên xoay 180 độ).
  3. `3_dau_tri_het_van.png`: Màn Đấu trí hết ván khen cả hai mẹ con và nhận xét của Gấu.
  4. `4_leo_cay_dang_choi.png`: Màn Leo cây mật ong với cây 8 bậc và thanh đếm ngược.
  5. `5_leo_cay_toi_dich.png`: Màn Leo cây tới đích nhận huy hiệu Đồng đội.
  6. `6_tham_tu_dang_choi.png`: Màn Thám tử đồ vật với nhiệm vụ và 3 ô nhóm đồ vật.
  7. `7_tham_tu_pha_an.png`: Màn Phá án thành công nhận huy hiệu Sáng tạo.
  8. `8_cai_dat_thoi_gian.png`: Thẻ cài đặt thời gian chơi trong hồ sơ Con tôi.

---

## 2. KIỂM CHỨNG TIÊU CHÍ KỸ THUẬT QUAN TRỌNG

| Tiêu chí | Kết quả | Chi tiết kiểm chứng |
| :--- | :---: | :--- |
| **0 Token AI** | **ĐẠT (PASS)** | Kiểm thử mạng Playwright: **0** request AI (`/chat`, LLM) trong cả 3 trò chơi. |
| **Unit Test 1.000 câu** | **ĐẠT (PASS)** | 1.000/1.000 câu sinh ngẫu nhiên hợp lệ: đáp án có trong lựa chọn, không âm, chia nguyên. |
| **Dừng khi hết giờ** | **ĐẠT (PASS)** | Màn `GameLimitScreen` kích hoạt khi hết số phút trong ngày, không có nút 'chơi thêm'. |
| **Không so đo / Không ai thua** | **ĐẠT (PASS)** | Không có bảng xếp hạng, luôn khen ngợi nỗ lực của cả mẹ và bé. |
| **Cài đặt thời gian chơi** | **ĐẠT (PASS)** | 4 mốc: 3 phút, 5 phút, 10 phút, 15 phút tại mục Con tôi. |
| **Prompt Studio** | **ĐẠT (PASS)** | Đã tích hợp Prompt 24 vào `src/teamPromptsData.json`. |
