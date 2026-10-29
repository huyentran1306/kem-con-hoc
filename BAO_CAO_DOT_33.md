# Báo cáo gói 33 — phần A + B (2026-10-29)

Phần C (giảm emoji) làm sau khi mẹ duyệt A + B.

## A. Hotfix CORS và màn lỗi khi /chat hỏng

**Nguyên nhân thật**: Worker chỉ cho 6 header, nhưng frontend gửi 13 header `X-…`. Ngoài 6 header trong đề bài, còn thiếu `X-Hint-Question`, `X-Xung-Ho`, `X-Fix-Count`, `X-Fix-Reason` (Hỏi Gấu và sửa bậc). Lỗi "Failed to fetch" là TypeError nên bị xếp nhầm thành `runtime_error`. Commit f9375e9 (đợt 23) đã xoá hết khối lỗi ở màn Đọc đề, nên màn hình trắng.

- `src/workerHeaders.js`: một danh sách 16 header dùng chung. `post()` bỏ header lạ và ghi `console.error`.
- `scripts/test-33-worker-headers.mjs`: quét `src/`; header `X-…` nào chưa có trong danh sách thì test đỏ.
- `aiExplain` trả `{error:'network'}` khi mất mạng. Màn Đọc đề hiện "Gấu chưa soạn được bài này / Kiểm tra mạng rồi thử lại nhé" với hai nút **Thử lại** và **Về trang chủ**. Trạng thái lạ cũng có thẻ dự phòng.
- Khôi phục các khối `scope_pick_one`, `ocr_failed`, `trial_limit` đã mất ở f9375e9.
- **Worker**: gửi `PROMPT_ANTIGRAVITY_33A.md` cho Antigravity. Thứ tự: deploy Worker trước, kiểm curl preflight đủ 16 header, rồi mới deploy frontend.

## B. Lỗi tester

| Mục | Sửa |
|---|---|
| B1 camera bị chặn | Khối lỗi phủ giữa khung, chữ căn giữa, có nút "Thử lại camera". Ẩn video và dòng hướng dẫn. Nút chụp mờ khi không có camera. Không tràn ngang ở 360 px. |
| B2 sai mật khẩu | Một dòng chữ `<p role="alert">` ngay dưới ô mật khẩu: "Sai mật khẩu rồi, thử lại hoặc liên hệ admin nhé." Không viền, không bóng, không link. Gõ lại thì dòng này ẩn. Mất mạng có câu riêng. |
| B3 không màn trắng | Kiểm bài học trước khi vẽ (`lessonGuard`): bài hỏng thì hiện thẻ "Soạn lại / Về trang chủ". ErrorBoundary theo từng màn. `onUncaughtError` và lưới an toàn ngoài React vẽ màn HTML tĩnh "Có lỗi nhỏ, bấm để tải lại". Log lỗi có thêm screen, lớp, theme, viewport, kind. Dữ liệu localStorage được kiểm hình dạng (`stateShape.js`). Có `translate="no"` và meta `notranslate`. |
| B4 chip môn | Thứ tự lấy môn: môn mẹ chọn (đề mẫu), rồi `mon_doan` từ bước đọc ảnh, rồi đoán từ chữ (đã nhận "Tìm từ chỉ…", tiếng Anh ngắn). Bài Tiếng Việt/Anh không còn chip "Toán có lời văn". Phần đoán dạng bài cũng dùng môn này. |
| B5 nhãn bậc | Mã bậc hiện bằng tiếng Việt (thêm `ket_luan`, `tom_tat`…). Mã lạ hiện "Bậc gợi mở", không bao giờ hiện mã có dấu "_". |

Sửa thêm: thẻ cảnh báo nền vàng ở theme tối (aurora/chalk/garden) bị mất chữ nút "Về trang chủ", nay nút có nền trắng chữ nâu.

## Kiểm tra

- `vite build` qua. File chính: `index-D9LVT2Ft.js`. Tên file có thể khác khi build trên Mac.
- ESLint `src/` sạch.
- Test mới `scripts/test-33-ab.mjs` đạt 22/22. `test-33-worker-headers` đạt (13 header dùng / 16 cho phép). `test-28-29-30` đạt 17/17.
- Các test khác trong `npm test` cần mạng thật hoặc thư mục `study-en/ai-gateway-worker`. Chúng đỏ y hệt trên bản HEAD trước khi sửa, nên không phải lỗi mới.
- Ảnh (Playwright, Worker giả lập) ở `bang-chung/dot-33/`, gồm 360/390/1280 px, theme sáng `bear` và tối `aurora`:
  - A3 màn lỗi khi /chat hỏng;
  - B1 camera bị chặn;
  - B2 sai mật khẩu;
  - B3 ErrorBoundary và màn tĩnh;
  - B4 chip Tiếng Việt.

## Việc của mẹ

1. Gửi `PROMPT_ANTIGRAVITY_33A.md` cho Antigravity: deploy Worker → curl preflight → deploy frontend → thử bằng Chrome ẩn danh.
2. Duyệt A + B, rồi mình làm phần C (giảm emoji).
