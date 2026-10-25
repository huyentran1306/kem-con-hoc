# Báo cáo đợt 16 · Ba bộ giao diện theo mùa

Ngày làm: 25/10/2026. Phạm vi: prompt `16_BA_BO_GIAO_DIEN_THEO_MUA.md`, bản vẽ `tham-khao/bo-theo-mua.html`.
Không chạy git, không deploy, không gọi AI, không đụng production. Chưa có mã commit và link preview: chủ dự án commit và deploy bản preview.

## Bảng 6 chặng

| Chặng | Nội dung | Kết quả | Ghi chú |
|---|---|---|---|
| 1 | Đăng ký 3 bộ `noel`, `tet`, `thieunhi` vào hệ giao diện | Đạt | 27 biến chính đúng bản vẽ + đủ biến như 8 bộ cũ trong `themes.css`; font tải khi dùng, có `subset=vietnamese`; 12 icon thanh tab thành `<symbol>` đọc màu từ `--if --io --is --iw --ip --ia --ic`; 3 linh vật mới |
| 2 | Thành phần đặc trưng ở 3 màn chính, hiệu ứng nền | Đạt (một phần ghi chú) | Đầu màn, theo dõi học đều 7 ngày, nút bắt đầu, bậc hỏi con, câu đọc to, gợi ý, đáp án cho mẹ, màn Xong bài, 3 mức hiểu bài. Hạt chỉ CSS, tối đa 24, tắt khi giảm chuyển động, chuyển động Tắt, tab ẩn, màn Hỏi con |
| 3 | Cơ chế gợi ý theo mùa | Đạt | Đúng lưu đồ; giờ Việt Nam; lưu `themeBeforeSeason`, `seasonStartedKey`, `seasonAsked` trong state gia đình (đồng bộ máy chủ như cài đặt khác); bảng chọn có nhóm Theo mùa ở trên Thường ngày |
| 4 | Thẻ ngày đặc biệt (không gọi AI) | Đạt | 24/12 Đêm Noel; Giao thừa và mùng 1 đến mùng 3 (10 câu chúc viết sẵn); 1/6 ô "Lời khen từ mẹ" (200 ký tự, chỉ lưu trong state gia đình, tự xoá sau 7 ngày, nút "Mở lời khen của mẹ" ở Xong bài) |
| 5 | Admin: nhóm Theo mùa | Đạt phía app, chờ gắn worker | Thẻ mỗi bộ: xem trước 2 màn, công tắc gợi ý, khung ngày sửa được, bảng ngày mùng 1 Tết theo năm, số gia đình đang dùng, xem trước toàn màn, không xoá. Ghi qua `PUT /api/v1/admin/seasons` (file worker mới, chưa gắn router) |
| 6 | Kiểm thử và bằng chứng | Đạt phần chạy được ở máy | 2 bộ kiểm thử mới + kiểm tương phản 11 bộ; ảnh 390px ở `bao-cao-16/`. Chưa chạy axe e2e (bộ e2e hiện có đã cũ, cần trình duyệt và tài khoản thật) |

## File đã đổi

App (`kem-con-hoc`):
- `src/themes.js`: thêm 3 bộ theo mùa (cờ `seasonal`, `fontGreet`, `buddyName`), xuất `SEASONAL_THEMES`, `REGULAR_THEMES`; link font có `&subset=vietnamese`.
- `src/themes.css`: 3 khối `[data-theme=noel|tet|thieunhi]` đủ biến, biến icon `.kch-si`, linh kiện chung (thẻ, nút, chip, thanh tab).
- `src/ThemePickerSheet.jsx`: nhóm THEO MÙA ở trên THƯỜNG NGÀY; nhãn "Đang mùa", "Từ 29/1", "Bộ cũ"; lưu bằng `pickThemePatch`.
- `src/AdminThemesSection.jsx`: thêm thẻ "Theo mùa (3 bộ)", ảnh xem trước 2 màn cho mỗi bộ, lưới nhanh chỉ 8 bộ thường ngày, bỏ nhãn "(Prompt 10)". Giữ nguyên tên xuất `AdminThemesSection({ token, adminProfile })`.
- `src/AdminThemeDesignerTab.jsx`: bỏ "(Màn 1..4)", "(Prompt 09)"; mỗi thẻ bộ có ảnh xem trước 2 màn.
- `src/themes/adminThemeSpec.js`: `BUILTIN_THEME_SPECS` chỉ lấy 8 bộ thường ngày.
- `src/themes/themeIcons.jsx`: nhánh icon theo mùa dùng `<use href="#kch-si-...">`.
- `src/themes/seasonIcons.js` (mới): 12 icon lấy từ bản vẽ, sprite `<symbol>`.
- `src/themes/ThemeTwoScreenPreview.jsx` (mới): ảnh xem trước 2 màn cho admin.
- `src/themes/slots/seasonSlots.jsx` (mới) + `registry.js`: lịch đếm ngày, cành mai, chùm bóng; nút bắt đầu của bộ.
- `src/themes/buddies/buddyArt.js`, `buddyQuotes.js`, `buddySvgs.jsx`: linh vật Người Tuyết Bông, Bé Lân, Diều Cầu Vồng (có biểu cảm, lời thoại), gắn theo bộ.
- `src/seasons/` (mới): `seasonLogic.js` (hàm thuần), `useSeasonsConfig.js`, `SeasonHomeLayer.jsx`, `SeasonParticles.jsx`, `SeasonStepProgress.jsx`, `SeasonDoneArt.jsx`, `AdminSeasonsGroup.jsx`, `seasonArt.js`, `seasons.css`, `index.js`.
- Gắn tối thiểu: `src/App.jsx` 2 dòng (import + `<SeasonParticles ... screen={screen} />`); `src/screens.jsx` 1 import, `add('season', false, <SeasonHomeLayer />)` ở màn chính, `<SeasonStepProgress>` ở Hỏi con, `<SeasonDoneArt />` ở Xong bài, emoji 3 mức hiểu bài qua `seasonLevelEmoji`.
- `scripts/test-theme-contrast.mjs`: đếm động số bộ, đo thêm 19 cặp chữ cho 3 bộ theo mùa (mức 4,5:1).
- `scripts/test-dot16-seasons.mjs`, `scripts/test-dot16-themes.mjs` (mới).
- `bao-cao-16/` (mới): 12 ảnh 390px.

Worker (`ai-gateway-worker`): chỉ thêm `src/dot16_seasons.js`.

## Kiểm thử đã chạy (TZ=Asia/Ho_Chi_Minh)

| Lệnh | Kết quả |
|---|---|
| esbuild bundle `src/main.jsx` | OK |
| `node scripts/test-theme-contrast.mjs` | Đạt, 11 bộ. 3 bộ mới: mọi cặp chữ thường >= 4,5:1 (thấp nhất: nút Cầu Vồng 4,84:1, đỏ nguy hiểm Cầu Vồng 4,71:1) |
| `node scripts/test-custom-theme.mjs` | Đạt 54/54 |
| `node scripts/test-admin-themes.mjs` | Đạt |
| `node scripts/test-dot16-seasons.mjs` | Đạt 25: 30/11 không gợi ý; 1/12 gợi ý đúng 1 lần; Để sau không hỏi lại; 1/1 thẻ hết mùa, Quay lại về đúng bộ cũ; Tết 2027 28/1 không, 29/1 có, 15/2 trong mùa, 16/2 hết mùa; admin tắt Tết thì không gợi ý; Dùng thử không gợi ý; Lời khen chỉ ngày 1/6 với Cầu Vồng; worker kiểm phiên và vai trò |
| `node scripts/test-dot16-themes.mjs` | Đạt 15: đủ biến, font, icon, linh vật, hạt ≤ 24 và tắt đúng chỗ, tương phản chữ trên đầu màn, admin, không còn nhãn nội bộ, không dấu gạch dài |
| `node scripts/test-dot15-chang-0.mjs` | Lỗi 1 mục KHÔNG thuộc đợt 16: tìm thấy tên mẫu "Cô Hạnh" trong `src/teacher/format.js` và `src/ui/staff/index.jsx` (file của kỹ sư khác đang làm song song). Các mục còn lại đạt |
| Chrome headless (Playwright) 390px | Không lỗi console; giảm chuyển động hoặc chuyển động Tắt: 0 phần tử hạt trong DOM; màn Hỏi con: 0 hạt; số hạt: Noel 16, Tết 12 (Xong bài 16), Cầu Vồng 10 (Xong bài 22); bộ Bạn Gấu chỉ tải Mitr + Nunito; không có dấu gạch dài trong chữ hiển thị |

## Ảnh (390px, `bao-cao-16/`)

| Bộ | Màn chính | Hỏi con từng bước | Xong bài |
|---|---|---|---|
| Đêm Tuyết | ![](bao-cao-16/noel-home.png) | ![](bao-cao-16/noel-scaffold.png) | ![](bao-cao-16/noel-done.png) |
| Xuân Sum Vầy | ![](bao-cao-16/tet-home.png) | ![](bao-cao-16/tet-scaffold.png) | ![](bao-cao-16/tet-done.png) |
| Cầu Vồng 1/6 | ![](bao-cao-16/thieunhi-home.png) | ![](bao-cao-16/thieunhi-scaffold.png) | ![](bao-cao-16/thieunhi-done.png) |

Cơ chế: `goi-y-dau-mua.png` (bảng gợi ý ngày 1/12), `het-mua-tet.png` (thẻ hết mùa 17/2), `admin-theo-mua.png`.
Ảnh chụp từ trang thử dựng riêng bằng chính các linh kiện và CSS của app (không đăng nhập thật); font Google chưa tải được trong máy chụp nên lời chào hiện bằng font dự phòng. Đặt cạnh bản vẽ `tham-khao/bo-theo-mua.html` để đối chiếu.

## Quyết định

- Gợi ý, thẻ hết mùa và thẻ ngày đặc biệt chỉ nằm ở màn chính (`SeasonHomeLayer`), không hiện ở chế độ Dùng thử, chỉ hiện khi đã tải xong khung mùa (để admin tắt là có hiệu lực).
- Thẻ hết mùa chỉ hiện khi gia đình vào bộ mùa trong khung mùa (bấm Thử ngay hoặc tự chọn trong mùa), nhờ khoá `seasonStartedKey`. Tự chọn bộ mùa ngoài khung mùa thì không hỏi gì.
- Hạt hiệu ứng chỉ ở màn chính và Xong bài; màn phụ (Báo cáo, Con tôi...) chỉ đổi màu, chữ, icon. Hạt nằm sau nội dung (`.scroll` có `z-index: 1` riêng ở 3 bộ mùa). Khi tắt, component không render phần tử nào.
- Đầu màn chính dùng lại `.hero-band` hiện có, đổi bằng CSS (thiệp đêm đông, câu đối "An Khang" "Thịnh Vượng", vòng cầu vồng). Câu đọc to, gợi ý, đáp án cho mẹ đổi hình bằng CSS trên linh kiện có sẵn; giữ nguyên cách mở gợi ý (bấm "con bí") và giữ 1,5 giây.
- Ngày giả để thử: `localStorage['kem-con-hoc:season-today'] = '2026-12-01'`.
- Thẻ ngày đặc biệt đóng được, ghi nhớ trên máy (localStorage). Lời khen từ mẹ lưu trong state gia đình như yêu cầu.
- Không cần migration: dùng `_kv_store` (key `app_config:seasons`) và `audit_log` sẵn có.

## Việc chờ chủ dự án

1. **Gắn worker** (`src/dot16_seasons.js`, chưa gắn router):
   - Trước bước kiểm phiên admin: nếu `pathname === "/api/v1/config/seasons"` gọi `handle(request, env, ctx, pathname, method, corsHeaders, null)`.
   - Trong khối `/api/v1/admin/*` sau khi có `adminSession`: gọi `handle(...)`, trả kết quả nếu khác null.
   - Trong `GET /api/v1/config/public` (`v1_routes.js`) thêm `seasons: await getPublicSeasons(env)`. Khi chưa gắn, app tự thử `/api/v1/config/seasons` rồi dùng khung mặc định.
2. **Đối chiếu ngày mùng 1 Tết** 2027 đến 2031 (6/2/2027, 26/1/2028, 13/2/2029, 3/2/2030, 23/1/2031) với lịch âm Việt Nam; sửa được trong admin.
3. **`index.html` đang nạp sẵn Baloo 2, Itim, Be Vietnam Pro cho mọi bộ** (file không thuộc phạm vi đợt này). Muốn đạt mục "dùng Bạn Gấu không tải Baloo 2, Itim" thì bỏ 3 họ font này khỏi thẻ link chung (bộ Kẹo Bông, Bảng Phấn và 3 bộ mùa đã tự tải font của mình).
4. Chạy axe `color-contrast` trên trình duyệt thật cho 11 bộ ở 5 màn (bộ e2e `e2e/e2e-runner.mjs` còn danh sách bộ cũ, cần cập nhật).
5. Commit theo chặng, deploy bản preview, rồi **deploy production** (chủ dự án bấm).
