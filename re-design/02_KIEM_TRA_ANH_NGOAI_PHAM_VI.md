# Prompt 02 · Kiểm tra ảnh và đề ngoài phạm vi (luật cấu hình trong Admin)

**Cách dùng:** copy phần PROMPT gửi cho AI lập trình, kèm source app và worker.

**Phụ thuộc:** làm được ngay trên app hiện tại. Nếu đã có prompt 00 thì luật đọc qua `GET /api/v1/config/public` và nhật ký ghi qua API; nếu chưa thì đọc KV `app_config:scope_rules` như Prompt Studio đang làm.

**Vấn đề:** bản đang chạy **không có bước kiểm tra ảnh có phải bài tập không**. Ảnh selfie, ảnh đồ chơi, ảnh màn hình game... chỉ cần AI mô tả ra vài chữ là đi thẳng vào soạn bài giảng. Các trường hợp cần xử lý:
- Ảnh không phải bài tập (người, đồ vật, phong cảnh, ảnh chụp màn hình game, mạng xã hội).
- Ảnh nhạy cảm hoặc có thông tin riêng tư (mặt trẻ rõ, giấy tờ, bạo lực, nội dung người lớn).
- Bài tập **ngoài chương trình**: lớp 6 trở lên, môn chưa hỗ trợ, hoặc chênh nhiều so với lớp của con trong hồ sơ.
- Ảnh có **nhiều bài** cùng lúc, ảnh mờ, ảnh cắt mất đề.
- Đề gõ hoặc đọc bằng giọng nói cũng có thể ngoài phạm vi (ví dụ "viết hộ bài văn tả mẹ", câu hỏi không liên quan học tập).

---

## PROMPT

Bạn là kỹ sư full-stack của app **Kèm Con Học** (React + Vite, Cloudflare Worker gateway, D1). Thêm **bước phân loại phạm vi** cho mọi đề bài (ảnh, gõ, giọng nói) trước khi soạn bài giảng, với **luật do admin cấu hình**, và hiển thị lời nhắn thân thiện cho bố mẹ.

### Hiện trạng cần biết
- Luồng ảnh: `POST /vision/analyze` (multipart `image` + `prompt` = p1_ocr) → nếu lỗi thì `POST /vision/ocr`. Kết quả bị loại nếu ngắn hơn 5 ký tự, chứa "không thể đọc" hoặc "Chơi gì với đồ"; fallback bị loại nếu chứa "There is no text", "The image shows". Hai bước đều hỏng → màn "⚠️ Ảnh chưa rõ hoặc thiếu chữ".
- Sau đó: p2_clean → ô soát đề "✅ AI nhận diện đề bài như sau" (mẹ sửa, bấm "Tiếp tục ➔") → p3_explain qua `/chat`.
- p3 có trường `can_hoi_lai` (đề không rõ) nhưng app **không hiển thị**.
- p1_ocr hiện trả văn bản thuần, không JSON.
- Môn học chỉ đoán bằng regex từ khoá (Toán, Tiếng Việt, Tiếng Anh).

### Việc cần làm

**1. Prompt đọc ảnh mới trong Prompt Studio: `p1_ocr_v2` (dùng cho `/vision/analyze`)**
- Thay vì thêm một lần gọi riêng (tốn thêm 3 đến 6 giây), **gộp vào p1**: tạo p1 bản mới `p1_ocr_v2` trả JSON, giữ `p1_ocr` cũ làm dự phòng. Nội dung gợi ý (tiếng Việt, chỉnh được trong Prompt Studio):
  > Nhìn ảnh và trả về DUY NHẤT một JSON, không thêm chữ nào khác:
  > `{"pham_vi": "bai_tap" | "khong_phai_bai_tap" | "nhay_cam" | "anh_mo" | "nhieu_bai", "do_tin_cay": 0.0-1.0, "ly_do": "<tối đa 15 chữ>", "mon_doan": "toan" | "tieng_viet" | "tieng_anh" | "khac", "lop_doan": 1-12 hoặc null, "so_bai": <số bài thấy trong ảnh>, "cac_bai": ["<Câu 1 ...>", "<Câu 2 ...>"], "de_bai": "<toàn bộ chữ của đề, giữ nguyên số liệu, đúng chính tả>"}`
  > `cac_bai` tách từng câu khi có nhiều câu (dùng cho hành động "chọn một bài"); `do_tin_cay` là mức chắc chắn của `pham_vi`.
  > Quy tắc: "bai_tap" chỉ khi ảnh là trang sách, vở, phiếu bài tập có đề rõ. "nhay_cam" khi có mặt người rõ, giấy tờ cá nhân, bạo lực, nội dung người lớn: khi đó để `de_bai` rỗng. Không tự giải bài.
- Parser chịu lỗi: tìm JSON đầu tiên trong chuỗi; parse hỏng thì coi như kết quả kiểu cũ (văn bản thuần) và chạy luật văn bản ở bước 2.

**2. Phân loại đề dạng chữ: `p0_scope_text` (qua `/chat`, chỉ chạy khi luật nhanh không quyết được)**
- **Luật nhanh trước, không tốn AI:** độ dài, có số hoặc từ khoá bài tập, khớp danh sách từ chặn của admin, khớp mẫu "giải hộ / làm hộ / viết hộ bài văn".
- Prompt `p0_scope_text` trả `{"pham_vi": "bai_tap" | "khong_lien_quan" | "lam_ho" | "ngoai_chuong_trinh", "do_tin_cay", "mon_doan", "lop_doan", "ly_do"}`, `temperature 0`, `max_tokens 120`, timeout 6 giây; quá thời gian thì cho qua và ghi nhật ký `timeout`.
- `min_confidence_text_len`: đề chữ ngắn hơn số ký tự này **và** không có chữ số nào thì coi là `khong_lien_quan` ngay, không cần hỏi AI.

**3. Luật phạm vi do admin cấu hình** (KV `app_config:scope_rules`, có giá trị mặc định trong code)
```json
{
  "version": 1,
  "enabled": true,
  "subjects": ["toan", "tieng_viet", "tieng_anh"],
  "grade_min": 1, "grade_max": 5,
  "grade_gap_warn": 1,
  "min_confidence_text_len": 12,
  "blocked_keywords": ["làm hộ bài kiểm tra", "đáp án đề thi"],
  "actions": {
    "khong_phai_bai_tap": "block",
    "nhay_cam": "block",
    "anh_mo": "retake",
    "nhieu_bai": "pick_one",
    "ngoai_chuong_trinh": "warn",
    "lech_lop": "warn",
    "mon_chua_ho_tro": "warn",
    "lam_ho": "redirect",
    "khong_lien_quan": "block"
  },
  "messages": {
    "khong_phai_bai_tap": "Ảnh này chưa giống trang bài tập. Mẹ chụp lại đúng 1 bài trong sách hoặc vở nhé.",
    "nhay_cam": "Ảnh có mặt người hoặc giấy tờ riêng tư nên mình không đọc. Mẹ chụp riêng phần đề bài thôi nhé.",
    "anh_mo": "Ảnh hơi mờ. Mẹ để máy song song trang giấy, đủ sáng rồi chụp lại nhé.",
    "nhieu_bai": "Trong ảnh có {so_bai} bài. Mẹ chọn bài con đang làm nhé.",
    "ngoai_chuong_trinh": "Bài này giống chương trình lớp {lop_doan}, ngoài phạm vi lớp 1 đến 5. Mình vẫn có thể gợi ý, nhưng có thể chưa sát cách cô dạy.",
    "lech_lop": "Bài này có vẻ của lớp {lop_doan}, còn hồ sơ của {ten_con} là lớp {lop_con}. Mẹ kiểm tra lại giúp mình nhé.",
    "mon_chua_ho_tro": "Môn này app chưa hỗ trợ tốt. Gợi ý có thể chưa chuẩn.",
    "lam_ho": "Kèm Con Học không làm bài hộ, nhưng sẽ gợi ý để mẹ hướng dẫn con tự viết nhé.",
    "khong_lien_quan": "Câu này không giống một bài tập. Mẹ gõ lại đề bài con đang làm nhé."
  }
}
```
- Ý nghĩa hành động:
  - `block`: dừng, hiện lời nhắn và các nút "📷 Chụp lại", "⌨️ Gõ đề", hoặc "🧸 Sang Chơi với đồ vật" nếu ảnh trông như đồ chơi.
  - `retake`: như block nhưng gợi ý cách chụp.
  - `warn`: hiện lời nhắn, có "Vẫn tiếp tục" và "Sửa hồ sơ con".
  - `pick_one`: hiện từng câu tách được (Câu 1, Câu 2...) cho mẹ chọn.
  - `redirect`: tiếp tục nhưng chèn vào `{{khung_ghi_chu}}` của p3 câu "Phụ huynh muốn làm hộ: chỉ gợi ý dàn ý và câu hỏi, không viết sẵn bài".
  - `allow`: cho qua.
- Lời nhắn hỗ trợ biến `{so_bai} {lop_doan} {lop_con} {ten_con} {xung_ho}`. `{xung_ho}` là Mẹ / Bố / Ông / Bà theo người đang dùng máy (prompt 03; trước đó lấy `state.parent`). Lời nhắn mặc định nên viết "{xung_ho} chụp lại…" thay vì luôn "Mẹ".
- **Thứ tự ưu tiên** khi một đề thuộc nhiều loại (chỉ hiện một thẻ, loại đứng trước thắng): `nhay_cam` > `khong_phai_bai_tap` > `anh_mo` > `lam_ho` > `khong_lien_quan` > `nhieu_bai` > `ngoai_chuong_trinh` > `lech_lop` > `mon_chua_ho_tro`. Sau khi mẹ chọn một bài ở `nhieu_bai`, chạy lại luật văn bản cho bài đó (có thể ra `lech_lop`).
- **Lệch lớp:** cảnh báo khi `|lop_doan − lop_con| > grade_gap_warn` (lớn hơn hẳn; mặc định 1 nghĩa là lệch từ 2 lớp trở lên mới cảnh báo). `lop_doan` rỗng thì bỏ qua luật này.
- **Nút phụ của thẻ cảnh báo** (cùng mẫu thẻ, khác câu chữ và nút phụ): lệch lớp → "Sửa hồ sơ con"; ngoài chương trình → "Chụp lại"; môn chưa hỗ trợ → "Gõ đề khác". Nút chính luôn là "Vẫn tiếp tục".

**4. Màn hình phía phụ huynh**
- Ở bước Analyze, sau khi đọc ảnh: hiện **thẻ phạm vi** đúng theo hành động, giọng thân thiện, có minh hoạ nhỏ theo theme (prompt 01).
- **Ảnh nhạy cảm:** không hiển thị lại ảnh, không gửi tiếp cho bước nào khác, xoá ảnh khỏi bộ nhớ trình duyệt ngay (`URL.revokeObjectURL`, xoá khỏi state). Lời nhắn không được nói "ảnh chưa gửi đi đâu" (ảnh đã gửi một lần để đọc); câu đúng là "App không lưu ảnh này".
- Hiển thị `can_hoi_lai` của p3 (hiện đang bị bỏ qua): nếu `true`, trước màn Explain hiện "Đề có chỗ chưa rõ: {lý do}. Mẹ xem lại đề nhé" với nút quay về ô soát đề.
- Ô soát đề: nếu mẹ sửa đề, chạy lại luật văn bản (bước 2) trước khi gửi p3.

**5. Trang Admin: mục "🛡️ Luật phạm vi ảnh & đề"** (khi đã có admin mới thì là tab [4] của "Cấu hình AI & Hệ thống", prompt 05; **nếu prompt 05 chưa làm**, thêm tạm thành một khối trong tab Prompt Studio của admin hiện tại, cùng chức năng)
- Bật/tắt toàn bộ; chọn môn được hỗ trợ; lớp từ/đến; ngưỡng lệch lớp.
- Bảng hành động: mỗi loại một dòng (tên loại, mô tả, hành động dạng menu, lời nhắn sửa được, xem trước lời nhắn với dữ liệu mẫu).
- Danh sách từ khoá chặn (thêm, xoá).
- **Bàn thử (Test bench):**
  - Tải một ảnh hoặc gõ một đề → chạy đúng chuỗi phân loại → xem JSON kết quả, hành động và lời nhắn sẽ hiện.
  - Có sẵn 6 mẫu: trang toán lớp 3, ảnh đồ chơi, ảnh mờ, ảnh 3 bài, đề lớp 8, câu "viết hộ bài văn tả mẹ". Ảnh mẫu đặt trong `public/scope-samples/` và không chứa mặt người thật.
- Lưu: bản cấu hình có số phiên bản, ghi ai lưu, lúc nào; nút "Về mặc định". (Có prompt 00 thì yêu cầu vai trò editor và ghi audit_log.)
- **Nhật ký phạm vi:** bảng `scope_events (id, family_id, source, category, action, confidence, reason, grade_guess, subject_guess, child_grade, overridden INTEGER, created_at)`; `confidence` lấy từ `do_tin_cay` của AI (luật nhanh thì ghi 1). Không tự xoá (prompt 00, mục 10); chỉ dọn khi admin bật "Tự dọn dữ liệu cũ của người dùng".
  - **Không lưu ảnh**, không lưu đề của loại `nhay_cam`.
  - Hiển thị: biểu đồ số lần theo loại trong 7/30 ngày, tỉ lệ "Vẫn tiếp tục" sau cảnh báo, 20 sự kiện gần nhất. Dữ liệu này giúp chỉnh luật.

**6. Phía máy chủ (khuyến nghị, làm nếu đã có prompt 00)**
- Worker đọc cùng `app_config:scope_rules` và **chặn lại lần nữa** khi `/chat` nhận p3 với đề thuộc `blocked_keywords`, để người dùng sửa code phía trình duyệt cũng không vượt được.

### Không làm trong prompt này
- Không lưu ảnh của người dùng ở bất kỳ đâu.
- Không đổi luồng "Chụp đồ chơi" (p5_toy), chỉ thêm nút chuyển sang khi ảnh bài tập trông như đồ chơi.
- Không chặn cứng môn ngoài danh sách (chỉ cảnh báo), trừ khi admin đặt `block`.

### Kiểm thử bắt buộc
1. 6 ảnh/đề mẫu ở bàn thử ra đúng loại và đúng hành động.
2. Chụp selfie trong luồng "Chụp bài": hiện thẻ chặn, không gọi p3 (kiểm tra tab Network).
3. Con lớp 2, chụp bài lớp 4: hiện cảnh báo lệch lớp; bấm "Vẫn tiếp tục" thì đi tiếp và `scope_events.overridden = 1`.
4. Ảnh 3 bài: mẹ chọn "Câu 2" thì ô soát đề chỉ còn câu 2.
5. Gõ "viết hộ con bài văn tả mẹ": p3 nhận khung ghi chú "không viết sẵn bài"; kết quả chỉ có câu hỏi gợi mở và dàn ý.
6. Admin đổi lời nhắn `anh_mo`, lưu: app phụ huynh hiện lời nhắn mới sau tối đa 10 phút (có prompt 00: qua `/config/public`; chưa có: app đọc lại KV khi mở).
6b. Ảnh có 2 bài, bài được chọn là lớp 5 trong khi con lớp 2: hiện thẻ chọn bài trước, chọn xong mới hiện cảnh báo lệch lớp.
7. p1_ocr_v2 trả chuỗi không phải JSON: app vẫn chạy như cũ (không vỡ).
8. Thời gian thêm vào luồng ảnh không quá 1 giây so với trước (vì gộp vào p1).
9. `npm run build` thành công.

### Báo lại khi xong
- Prompt mới đã thêm vào Prompt Studio (id, biến, JSON trả về).
- Ảnh chụp thẻ phạm vi cho 6 trường hợp, ảnh mục admin.
- Kết quả 9 bước kiểm thử.
