# BÁO CÁO TIẾN ĐỘ ĐỢT 19 (26/10/2026): LỊCH SỬ PHẨM CHẤT VÀ MÔN HỌC

## 1. BẢNG THEO DÕI 6 CHẶNG

| Chặng | Tên chặng | Trạng thái | Commit | Bản preview | Ghi chú |
|---|---|---|---|---|---|
| **Chặng 1** | Lưu lịch sử thành dữ liệu thật | **ĐẠT** | `8ee7d73` | Local / Preview | Đã tạo bảng D1, API badge_events & reward_events, gỡ week ghi cứng, chuyển dữ liệu cũ an toàn |
| **Chặng 2** | Gấu gợi ý huy hiệu theo việc con làm | **ĐẠT** | (pending) | Local / Preview | Rule engine tính bằng code theo 4 phẩm chất, lý do có số thật, tie-breaker 2 tuần, fallback an toàn |
| **Chặng 3** | Báo cáo bố mẹ: biểu đồ và AI tìm nguyên nhân | Chưa | - | - | Biểu đồ cột chồng 4 màu chuẩn, heatmap kỹ năng kẹt, AI prompt p19_trait_analysis |
| **Chặng 4** | Admin: trang "Phân tích học tập" | Chưa | - | - | Route /admin/phan-tich, bảng analytics_daily, ẩn danh < 5 gia đình |
| **Chặng 5** | Riêng tư và dữ liệu | Chưa | - | - | Xoá gia đình cascade, xoá lịch sử huy hiệu có ConfirmDialog, cô giáo không thấy |
| **Chặng 6** | Kiểm thử tổng thể & Hoàn tất | Chưa | - | - | Unit tests, E2E, báo cáo đầy đủ trước deploy production |

---

## 2. KẾT QUẢ CHUYỂN DỮ LIỆU CŨ (MIGRATION & DATA TRANSFER)

- **Migration Database (Điểm dừng 1):**
  - Migration file: `migrations/0007_dot19_tables.sql`
  - Local D1: Đã chạy thành công 7 câu lệnh DDL.
  - Remote Production D1 (`ai-gateway-db`): Đã được chủ dự án phê duyệt và chạy thành công (Bookmark: `0000009a-00000006-00005110-54a9c4fcf25ac28b2874f539ae08c174`).
  - Đã xác thực các bảng `badge_events`, `reward_events`, `analytics_daily` tồn tại trên Remote D1.

- **Chuyển dữ liệu cũ (Điểm dừng 2):**
  - Quét kiểm tra chạy thử (Dry Run): Đã quét 45 trạng thái gia đình trên D1 `_kv_store`.
  - Số bản ghi cũ thực tế cần chuyển: **0** bản ghi (các bản ghi cũ trong state đều là `sample: true` hoặc mảng rỗng, hệ thống mới khởi tạo sạch sẽ).
  - Khả năng tương thích: Cơ chế `INSERT OR IGNORE` đảm bảo chạy nhiều lần (idempotent) không bao giờ trùng lặp dữ liệu.

---

## 3. CÔNG VIỆC CHỜ CHỦ DỰ ÁN QUYẾT
1. **Migration trên database thật:** Đã duyệt và chạy thành công ở Chặng 1.
2. **Chạy chuyển dữ liệu cũ thật:** Đã báo cáo số liệu (45 gia đình quét, 0 bản ghi cần chuyển đổi do toàn bộ là sample/trống).
3. **Deploy production:** Chờ sau khi hoàn thành toàn bộ Chặng 6.
