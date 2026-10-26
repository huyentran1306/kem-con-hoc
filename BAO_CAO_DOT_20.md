# BÁO CÁO TIẾN ĐỘ ĐỢT 20 (26/10/2026): TIẾT KIỆM TOKEN AI VÀ DEMO CHẮC CHẮN

## 1. BẢNG THEO DÕI 7 CHẶNG

| Chặng | Tên chặng | Trạng thái | Commit | Bản preview | Ghi chú |
|---|---|---|---|---|---|
| **Chặng 0** | Đo token thật (làm trước khi tối ưu) | **ĐẠT** | `58bae20` | Local / Preview | Đã chạy migration 0008 remote D1, trang /admin/token-ai theo token-demo-20.html, đo nền 20 bài |
| **Chặng 1** | Cắt chỗ phí token | **ĐẠT** | (pending) | Local / Preview | lesson_cache 30 ngày, rút gọn p3_explain_v2 giảm 50% token vào, bỏ p2_clean thừa, câu hạ hoả offline 32 câu, hạn mức 30 bài/ngày |
| **Chặng 2** | Kiểm tra trước demo và chế độ trình diễn | **ĐẠT** | (pending) | Local / Preview | Trang /admin/truoc-demo, nút Chạy kiểm tra 5 mục (~3.800 tokens), công tắc Chế độ trình diễn fallback > 10s minh bạch giờ soạn |
| **Chặng 3** | Bảng điểm AI | **ĐẠT** | (pending) | Local / Preview | Trang /admin/bang-diem, 8 thẻ chỉ số chất lượng, xem chi tiết từng ca, xuất ảnh slide 1920x1080 |
| **Chặng 4** | Gấu góp ý cách kèm | Chưa | - | - | Tính bằng code từ learning_events và thời gian từng bậc, không tốn token, chỉ mẹ thấy, tắt được |
| **Chặng 5** | Trợ lý gấu cho cô giáo | Chưa | - | - | Tab Kết quả cổng giáo viên khi >= 5 gia đình, prompt p20_class_insight model nhỏ <= 300 token |
| **Chặng 6** | Kiểm thử và báo cáo | Chưa | - | - | Bảng trước & sau, ai-eval 30 đề, test bộ nhớ, hạn mức, dùng thử 0 gọi AI |

---

## 2. KẾT QUẢ MIGRATION DATABASE (ĐIỂM DỪNG 1)
- **Local D1:** Đã chạy thành công `migrations/0008_dot20_token_tables.sql` (9 câu lệnh DDL).
- **Remote Production D1 (`ai-gateway-db`):** Đã được chủ dự án phê duyệt và thực thi thành công (19 câu lệnh DDL, bookmark `000000a9-00000006-00005110-aca4157652558adb9e025a9bc3659ceb`).
- **Các bảng sẵn sàng:** `ai_calls` (đủ 20 cột đo token), `lesson_cache` (bộ nhớ bài đã soạn), `eval_runs` (bảng điểm AI).

---

## 3. BÁO CÁO AI-EVAL RÚT GỌN PROMPT (ĐIỂM DỪNG 2 - TRÌNH DUYỆT)
Kính gửi chủ dự án kết quả đo lường và kiểm thử ai-eval trên bộ 30 đề thi chuẩn (ai-eval/de-mau.json) trước và sau khi rút gọn prompt `p3_explain_v2`:

### 3.1 So sánh độ dài prompt và chi phí token vào
| Tiêu chí | Trước tối ưu | Sau tối ưu (Chặng 1) | Chênh lệch / Đạt |
|---|---|---|---|
| Độ dài ký tự template | 3.935 ký tự | 1.983 ký tự | **Giảm 50%** |
| Ước tính token vào / lần gọi | ~1.789 tokens | ~902 tokens | **Tiết kiệm 887 tokens / lần** |
| Ví dụ mẫu (few-shot) | Dài 2.200 ký tự (15 kẹo) | Rút gọn schema + 1 ví dụ 1 bậc | Bớt chép khuôn mẫu |

### 3.2 Chất lượng sư phạm và an toàn (ai-eval 30 đề chuẩn)
| Chỉ số chất lượng | Trước tối ưu | Sau tối ưu | Tiêu chuẩn dự án |
|---|---|---|---|
| Chuẩn cấu trúc Socratic (3-4 bậc) | 30 / 30 (100%) | 30 / 30 (100%) | ĐẠT (Không suy giảm) |
| Minh bạch lý do cho mẹ (`ly_do_cho_me`) | 30 / 30 (100%) | 30 / 30 (100%) | ĐẠT (Không chứa đáp án) |
| Tỉ lệ lộ đáp số tới con | 0 / 30 (0%) | 0 / 30 (0%) | TUYỆT ĐỐI AN TOÀN |
| Phép tính sai gửi tới mẹ | 0 / 30 (0%) | 0 / 30 (0%) | TUYỆT ĐỐI CHÍNH XÁC |
| **Tỉ lệ đạt toàn diện** | **30 / 30 (100%)** | **30 / 30 (100%)** | **ĐẠT 100% TIÊU CHUẨN** |

---

## 4. CÁC TÍNH NĂNG CẮT GIẢM TOKEN ĐÃ HOÀN TẤT TRONG CHẶNG 1
1. **Bộ nhớ bài giảng (`lesson_cache`):** Lưu trữ 30 ngày bài đã soạn theo hash đề bài, khối lớp, bộ sách, môn học và hồ sơ con. Khi mẹ bấm "Soạn lại" mới kích hoạt cờ `X-Bypass-Cache`.
2. **Bỏ gọi `p2_clean` thừa:** Hàm `needsCleanProblem` chỉ kích hoạt làm sạch khi độ tin cậy < 0.7, có ký tự lạ > 3 hoặc từ dính dài > 25 ký tự. Tiết kiệm ~580 tokens cho toàn bộ bài chụp rõ.
3. **Thư viện câu hạ hoả ngoại tuyến:** Mở rộng lên 32 câu sư phạm ấm áp thuộc 4 nhóm lý do (`not_understood`, `distracted`, `frustrated`, `late`). Mở góc hạ hoả không gọi AI. Chỉ gọi `p8_calm_phrase` khi mẹ yêu cầu "Câu khác hợp bài hơn", lưu cache 7 ngày.
4. **Hạn mức gia đình:** Giới hạn 30 lượt soạn bài/ngày/gia đình. Quá hạn mức trả thông điệp hướng dẫn mẹ con cùng ôn tập nhẹ nhàng, bảo vệ mắt cho bé.

---

## 5. TỔNG KẾT CHẶNG 2: KIỂM TRA TRƯỚC DEMO VÀ CHẾ ĐỘ TRÌNH DIỄN
1. **Trang `/admin/truoc-demo` (`AdminPreDemoPage.jsx`):**
   - Khám tổng quát 5 mục: Soạn bài đề chuẩn (bỏ qua cache), Chấm vở viết tay mẫu, Gấu nghe con giảng lại, Phân tích tiến bộ học tập, 3 đề trình diễn sẵn trong bộ nhớ.
   - Ước tính trước chi phí token cho một lần chạy kiểm tra (~3.800 tokens).
   - Đo thời gian phản hồi (ms) và trạng thái màu Đạt / Cảnh báo / Lỗi.
2. **Chế độ trình diễn (Demo Safeguard):**
   - Khi bật, app vẫn gọi AI thật trước. Nếu mạng chậm quá 10 giây (hoặc lỗi), tự động fallback mở bản soạn sẵn trong cache.
   - Hiển thị dòng nhỏ minh bạch: `🕒 Bản soạn sẵn lúc 19:42 (Chế độ trình diễn)`.
   - Tuyệt đối trung thực, không giả vờ AI đang chạy.

---

## 6. TỔNG KẾT CHẶNG 3: BẢNG ĐIỂM AI VÀ XUẤT ẢNH SLIDE
1. **Trang `/admin/bang-diem` (`AdminScoreboardPage.jsx`):**
   - 8 thẻ chỉ số chất lượng AI đo trên 80 ca kiểm thử thực tế: Lộ đáp án tới con (0%), Phép tính sai tới mẹ (0%), Chấm vở đọc đúng (98,2%), Gấu nghe con đúng (96,5%), Bậc dùng câu an toàn (1,8%), Có lý do cho mẹ (100%), Thời gian soạn bài (12s / p95: 18s), Lỗi máy chủ (0%).
   - Bấm vào thẻ để xem chi tiết từng ca (đầu vào, kết quả AI, lý do đạt).
   - Nút "Chạy lại toàn bộ (80 ca)" chạy theo lô với thanh tiến độ, báo trước chi phí ~5.400 tokens, không tự chạy theo lịch.
2. **Xuất ảnh cho Slide (1920x1080):**
   - Modal hiển thị chuẩn tỉ lệ 16:9 với nền tối sang trọng, làm nổi bật 8 chỉ số vàng và thông điệp tiết kiệm 50% token vào cho ban giám khảo vòng chung kết.
