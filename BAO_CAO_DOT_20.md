# BÁO CÁO TIẾN ĐỘ ĐỢT 20 (26/10/2026): TIẾT KIỆM TOKEN AI VÀ DEMO CHẮC CHẮN

## 1. BẢNG THEO DÕI 7 CHẶNG

| Chặng | Tên chặng | Trạng thái | Commit | Bản preview | Ghi chú |
|---|---|---|---|---|---|
| **Chặng 0** | Đo token thật (làm trước khi tối ưu) | **ĐẠT** | `58bae20` | Local / Preview | Đã chạy migration 0008 remote D1, trang /admin/token-ai theo token-demo-20.html, đo nền 20 bài |
| **Chặng 1** | Cắt chỗ phí token | **ĐẠT** | (pending) | Local / Preview | lesson_cache 30 ngày, rút gọn p3_explain_v2 giảm 50% token vào, bỏ p2_clean thừa, câu hạ hoả offline 32 câu, hạn mức 30 bài/ngày |
| **Chặng 2** | Kiểm tra trước demo và chế độ trình diễn | Chưa | - | - | Trang /admin/truoc-demo, nút Chạy kiểm tra 5 mục, công tắc Chế độ trình diễn fallback nếu > 10s |
| **Chặng 3** | Bảng điểm AI | Chưa | - | - | Trang /admin/bang-diem, 8 thẻ chỉ số, lưu eval_runs, xuất ảnh 1920x1080 cho slide |
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
