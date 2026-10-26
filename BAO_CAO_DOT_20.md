# BÁO CÁO TIẾN ĐỘ ĐỢT 20 (26/10/2026): TIẾT KIỆM TOKEN AI VÀ DEMO CHẮC CHẮN

## 1. BẢNG THEO DÕI 7 CHẶNG

| Chặng | Tên chặng | Trạng thái | Commit | Bản preview | Ghi chú |
|---|---|---|---|---|---|
| **Chặng 0** | Đo token thật (làm trước khi tối ưu) | **ĐẠT** | `330085b` | Local / Preview | Đã chạy migration 0008 remote D1, trang /admin/token-ai theo token-demo-20.html, đo nền 20 bài |
| **Chặng 1** | Cắt chỗ phí token | Chưa | - | - | lesson_cache 30 ngày, rút gọn p3_explain_v2 < 1.800 ký tự, bỏ p2_clean thừa, câu hạ hoả offline, model theo việc, hạn mức 30 bài/ngày |
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

## 3. CÔNG VIỆC CHỜ CHỦ DỰ ÁN DUYỆT
1. **Migration database thật:** ĐÃ DUYỆT VÀ HOÀN TẤT THÀNH CÔNG.
2. **Đổi prompt soạn bài hoặc đổi model trên production:** Chờ kết quả ai-eval ở Chặng 1.
3. **Deploy production:** Chờ sau khi hoàn thành toàn bộ 7 chặng.

---

## 4. KẾT QUẢ ĐO NỀN 20 BÀI HỌC TRƯỚC TỐI ƯU (CHẶNG 0)
- **Token vào trung vị mỗi bài:** 1.950 tokens
- **Token ra trung vị mỗi bài:** 850 tokens
- **Tổng token trung vị mỗi bài:** 2.800 tokens
- **Token ra p95 các prompt:** 1.340 tokens (mức trần cấu hình cho p3 và vision)
- **Số lệnh gọi trung bình mỗi bài:** 2,4 lần (do đề chụp phải gọi OCR + Clean + Explain, hoặc retry)
- **Tỉ lệ lệnh gọi lỗi bỏ phí:** 4,3% (chủ yếu do định dạng hoặc timeout)
- **Tỉ lệ lấy từ bộ nhớ (cache):** 0% (chưa có bảng lesson_cache)
