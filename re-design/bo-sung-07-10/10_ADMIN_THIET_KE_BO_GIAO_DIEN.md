# Prompt 10 · Admin thiết kế và phát hành bộ giao diện mới, không cần code

**Cách dùng:** copy phần PROMPT gửi cho AI lập trình, kèm source app React + Vite và Worker bản mới nhất, file thiết kế `tham-khao/admin-thiet-ke-giao-dien.html` (mở bằng Chrome: 4 màn admin bản Gấu và lưu đồ). Bảng màu và linh kiện tham chiếu ở `tham-khao/8-bo-giao-dien-rieng.html`.

**Phụ thuộc:** **cần prompt 07 phần B** (giao diện là gói biến + khe bố cục + linh kiện + icon theo biến) và **prompt 05** (khung admin bản Gấu, vai trò superadmin/editor, `audit_log`). Nên có prompt 09 để tái dùng trình xem trước và bảng tính màu chữ.

**Ý tưởng:** hiện muốn thêm một bộ giao diện phải viết CSS và deploy. Sau prompt 07, một bộ chỉ còn là **gói biến** (màu, chữ, hình dạng, nhân vật, trang trí) cộng **bố cục và icon mượn từ một bộ gốc**. Vậy admin tạo bộ mới bằng cách điền gói biến trong trình thiết kế, xem trước 12 màn, chạy kiểm tra tự động, rồi phát hành vào KV. Gia đình tải bộ mới khi mở app, không cần deploy.

---

## PROMPT

Bạn là kỹ sư full-stack của app **Kèm Con Học**. Hãy thêm vào admin (tab "Giao diện app" của prompt 05) **trình thiết kế bộ giao diện**: tạo, sửa, kiểm tra, phát hành bộ mới mà không cần viết code hay deploy. Mọi thứ chạy trên gói Cloudflare Free (quy tắc ở prompt 00).

### Hiện trạng cần biết
- Prompt 07 đã biến mỗi bộ thành: khối biến CSS (`--c-*`, `--k*`, biến icon `--if --is --ip --ia --ic`), khe bố cục cho 3 màn chính, linh kiện cho 9 màn còn lại, 4 icon thanh dưới, bạn đồng hành SVG 3 trạng thái.
- Admin đã có khối "Giao diện app": bật tắt bộ, đặt mặc định, thống kê số nhà dùng (KV `app_config:themes = { default, enabled }`).
- Prompt 09 (nếu đã làm) có trình xem trước thu nhỏ bằng component thật và hàm tính chữ trên nền màu đạt 4,5:1.

### Việc cần làm

**1. Định nghĩa bộ giao diện dưới dạng dữ liệu (`ThemeSpec`)**
```
{ id, name, version, status: 'draft' | 'testing' | 'partial' | 'published' | 'disabled',
  base: 'bear' | 'candy' | ... | 'blank',          // bố cục 3 màn chính và 4 icon mượn từ bộ này
  vars: { bg, surface, text, text2, accent, accent2, good, warn, danger, ... },  // 12 màu gốc, phần còn lại suy ra
  font: { head, body, hand },                      // chỉ trong danh sách font đã tự host
  shape: 'soft' | 'sticker' | 'paper' | 'glass' | 'leaf' | 'chalk', radiusCard, radiusBtn,
  buddy: { kind: 'builtin' | 'custom' | 'none', id?, svg?: { hello, nudge, cheer } },
  decor: 'none' | 'blossom' | 'lantern' | 'confetti' | 'snow' | 'custom', decorSvg?,
  schedule?: { from, to },                          // bộ theo mùa, hết hạn tự ẩn
  shareCode, createdBy, createdAt, updatedBy, updatedAt, checks: {...}, reviewedBy?, reviewedAt? }
```
- 8 bộ gốc được **mô tả lại bằng cùng cấu trúc này** (sinh từ CSS hiện có bằng script một lần, có test so sánh biến trước và sau không đổi). Bộ gốc có `locked: true`: chỉ bật tắt, đặt mặc định, không sửa, nhưng **nhân bản** được.
- Từ 12 màu gốc, hàm `deriveVars(spec)` suy ra đủ bộ biến của prompt 01 và 07 (nền phụ, viền, chữ trên nền màu, toast, biến `--k*`, biến icon) bằng cùng thuật toán của prompt 09 (OKLCH, đẩy chữ tới khi đạt 4,5:1). Admin **ghi đè** được từng biến suy ra nếu muốn.

**2. Lưu trữ và phát hành (Worker)**
- KV `app_config:themes` mở rộng: `{ default, enabled, custom: [ThemeSpec đã phát hành] }`. Bản nháp và lịch sử: KV `app_config:theme_drafts:{id}` và `app_config:theme_history:{id}` (giữ tối đa 20 phiên bản, không tự xoá; quá 20 thì chặn phát hành và yêu cầu admin dọn tay).
- App phụ huynh: `GET /api/v1/config/public` trả thêm `themes.custom` (chỉ bộ `published` hoặc `partial` đúng nhóm, hoặc `testing` với 3 nhà test). App ghép `ThemeSpec` thành khối biến ngay trên máy bằng `deriveVars`, chèn `<style data-theme-custom>`; SVG nhân vật và trang trí nhúng từ spec. **Cache** trong `localStorage` theo `id + version` để lần mở sau không nháy.
- Phát hành theo 3 mức: `testing` (3 `family_id` do admin nhập), `partial` (10% nhà, chọn bằng băm `family_id` để ổn định), `published` (tất cả). Hạ xuống hoặc `disabled`: nhà đang dùng **vẫn giữ** bộ cho tới khi tự đổi (như prompt 01).
- Mọi thao tác phát hành, tắt, khôi phục ghi `audit_log` (prompt 05). Chỉ `superadmin` được phát hành `published`; `editor` được tạo nháp, kiểm tra và phát hành `testing`.
- Endpoint admin (token admin, prompt 05): `GET/POST /admin/themes`, `GET/PUT /admin/themes/{id}/draft`, `POST /admin/themes/{id}/check`, `POST /admin/themes/{id}/publish {level, families?}`, `POST /admin/themes/{id}/disable`, `GET /admin/themes/{id}/history`, `POST /admin/themes/{id}/restore {version}`, `POST /admin/themes/{id}/duplicate`, `POST /admin/themes/import {shareCode}`.

**3. Màn 1 · Danh sách bộ** (xem bản vẽ)
- Thẻ mỗi bộ: xem trước nhỏ vẽ từ `vars`, tên, loại (gốc, admin tạo, nháp), phiên bản, số nhà đang dùng, trạng thái. Lọc theo loại. Nút "Tạo bộ mới" (chọn bắt đầu từ bộ gốc hoặc trống), "Nhập từ mã" (mã chia sẻ của gia đình ở prompt 09 hoặc của admin khác).
- Khối "Gia đình tự ghép phổ biến" (prompt 09): 5 tổ hợp, nút **"Biến thành bộ gốc"** tạo nháp từ tổ hợp đó.

**4. Màn 2 · Trình thiết kế**
- Trái: 5 nhóm có thể gập: Màu (12 ô, mỗi ô có mã màu, ô màu và **tỉ lệ tương phản tính tức thì** với nền tương ứng; chữ trên nền màu tự tính, có "ghi đè"); Chữ (chỉ font đã tự host, câu thử có dấu); Hình dạng (6 kiểu + bo góc thẻ, nút); Nhân vật và trang trí (chọn có sẵn, hoặc thả 3 file SVG chào, nhắc, vui; trang trí có sẵn hoặc SVG); Bố cục và icon (chọn bộ gốc để mượn).
- Phải: **12 màn xem trước bằng component thật** với dữ liệu mẫu, tỉ lệ 0,55, cuộn ngang; công tắc "Chữ to" và "Tối giản hiệu ứng"; **chấm đỏ** tại chỗ chữ dưới chuẩn, bấm vào nhảy tới biến tương ứng. Xem trước chạy trong `<iframe sandbox>` cùng origin để CSS của bộ không rò ra admin.
- Tự lưu nháp mỗi 3 giây khi có thay đổi (debounce), có Hoàn tác 20 bước trong phiên.
- **SVG do admin tải lên phải được làm sạch** trước khi lưu: bỏ `<script>`, thuộc tính `on*`, `<foreignObject>`, `href` ngoài, `<image>`; giới hạn 6 KB mỗi file; từ chối nếu không parse được. Dùng allowlist thẻ và thuộc tính, không dùng blocklist.

**5. Màn 3 · Kiểm tra trước khi phát hành** (chạy trong trình duyệt admin, khoảng 10 giây)
1. Tương phản: mọi cặp chữ và nền ở 12 màn, 2 cỡ chữ, bằng axe `color-contrast` trên iframe xem trước. Có nút "Tự sửa" cho từng cảnh báo (đẩy màu chữ tới khi đạt).
2. Font có đủ dấu tiếng Việt (render câu thử, so bitmap với font dự phòng).
3. SVG sạch và trong giới hạn kích thước.
4. Bố cục 360px không tràn, nút nhỏ nhất 44px.
5. Kích thước gói bộ (spec + SVG) không quá 30 KB gzip.
6. Xem lại bằng mắt: 12 ảnh chụp tự động (canvas từ iframe), superadmin tick "Đã xem" (ghi `reviewedBy`).
- Kết quả lưu vào `spec.checks`. **Còn cảnh báo thì chỉ được phát hành `testing`**; `partial` và `published` cần 6 bước đều đạt.

**6. Màn 4 · Phát hành**
- Chọn mức, công tắc "Hiện trong Giao diện cả nhà", "Đặt làm mặc định cho nhà mới", "Có thời hạn" (bộ theo mùa: hết hạn tự ẩn khỏi danh sách chọn, nhà đang dùng vẫn giữ), mã chia sẻ 6 ký tự (cùng cơ chế prompt 09, có thêm 1 ký tự đánh dấu "bộ admin").
- Lịch sử phiên bản: ai, lúc nào, ghi chú; "Khôi phục" tạo phiên bản mới từ bản cũ, không xoá bản nào.

**7. Chi phí và an toàn trên gói Free**
- Không thêm bảng D1, không cron. Kiểm tra và chụp ảnh chạy ở máy admin. `config/public` thêm tối đa vài KB cho mỗi bộ custom; giới hạn **10 bộ custom đang phát hành** cùng lúc, quá thì phải tắt bớt.
- Spec và SVG đi qua làm sạch cả ở Worker khi lưu, không chỉ ở trình duyệt.

### Không làm trong prompt này
- Không cho sửa 8 bộ gốc (chỉ nhân bản), không cho admin viết CSS hay JS tự do.
- Không tải ảnh bitmap làm nền hay nhân vật; không font ngoài danh sách đã tự host.
- Không tự xoá bộ, lịch sử, nháp; không đổi bộ của gia đình đang dùng khi tắt bộ.

### Kiểm thử bắt buộc
1. Script mô tả lại 8 bộ gốc: biến sinh ra từ spec **bằng đúng** CSS hiện có (test so sánh từng biến); giao diện 8 bộ không đổi một pixel ở 3 màn chính (ảnh chụp trước và sau).
2. Tạo bộ từ Bạn Gấu, đổi 3 màu: xem trước 12 màn đổi trong vòng 300 ms; chấm đỏ xuất hiện đúng chỗ khi cố ý chọn màu chữ nhạt; "Tự sửa" làm chấm đỏ biến mất.
3. Tải SVG có `<script>` và `onload`: bị từ chối ở trình duyệt; gửi thẳng API cũng bị từ chối ở Worker.
4. Còn 1 cảnh báo: nút phát hành `partial` và `published` bị khoá, `testing` vẫn được. 3 nhà test thấy bộ trong "Giao diện cả nhà", nhà khác không thấy.
5. Phát hành `published`: nhà mới mở app thấy bộ; tắt bộ: nhà đang dùng vẫn giữ, nhà khác không còn thấy. Mọi bước có dòng `audit_log`.
6. Bộ có thời hạn: qua ngày hết hạn, bộ biến khỏi danh sách chọn, nhà đang dùng vẫn giữ.
7. `editor` không phát hành được `published` (403); khôi phục phiên bản cũ tạo phiên bản mới, lịch sử không mất bản nào.
8. Kích thước `config/public` với 10 bộ custom không quá 60 KB; app phụ huynh cache spec, mở lại không nháy.
9. `npm run build`, `npm test` và test Worker thành công.

### Báo lại khi xong
- Cấu trúc `ThemeSpec`, script mô tả lại 8 bộ gốc và kết quả so sánh biến.
- Ảnh 4 màn admin ở 1280px, ảnh app phụ huynh với một bộ do admin tạo.
- Danh sách thẻ và thuộc tính SVG được phép.
- Kết quả 9 bước kiểm thử, mục nào chưa làm được và vì sao.
