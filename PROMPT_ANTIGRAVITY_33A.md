# Prompt cho Antigravity · Gói 33 phần A: hotfix CORS Worker (GỬI GẤP)

**Cách dùng:** copy phần "Lời nhắn" gửi Antigravity.

---

## Lời nhắn

Từ bản frontend `index-CU1BK6g7.js`, mọi lần soạn bài của tài khoản thật ra **màn trắng**: trình duyệt chặn `POST /chat` ở bước preflight CORS vì Worker chưa cho phép các header frontend gửi. Lệnh preflight thật đang trả:

```
Access-Control-Allow-Headers: Content-Type, Authorization, X-Prompt-Id, X-Session-Id, X-Problem-Text, X-Family-Id
```

Phía frontend (`kem-con-hoc`) đã sửa xong, chưa deploy: có **danh sách header dùng chung** ở `kem-con-hoc/src/workerHeaders.js`. Bạn chỉ làm phần Worker, theo thứ tự:

### 1. Worker (`~/Coding/study-en/ai-gateway-worker`)

1. Tìm mọi chỗ trả `Access-Control-Allow-Headers` (thường trong hàm `corsHeaders()` / phản hồi `OPTIONS`, và cả các phản hồi lỗi). Tất cả phải dùng **một hằng số**, giá trị **đúng y chuỗi này** (khớp `WORKER_ALLOW_HEADERS_VALUE` trong `kem-con-hoc/src/workerHeaders.js`):

   ```
   Content-Type, Authorization, X-Prompt-Id, X-Session-Id, X-Problem-Text, X-Family-Id, X-Grade, X-Book-Series, X-Subject, X-Child-Id, X-Bypass-Cache, X-Prefetch, X-Hint-Question, X-Xung-Ho, X-Fix-Count, X-Fix-Reason
   ```

   - Ghi chú trên hằng số: "Danh sách dùng chung với kem-con-hoc/src/workerHeaders.js. Thêm header: sửa cả hai, deploy Worker TRƯỚC frontend."
   - **Không dùng `*`** (frontend gửi `Authorization`).
   - Phản hồi `OPTIONS` của **mọi** endpoint (không riêng `/chat`) dùng cùng hằng số; phản hồi lỗi 4xx/5xx cũng phải có header CORS, nếu không trình duyệt báo CORS thay vì lỗi thật.
   - `Access-Control-Allow-Origin` giữ như hiện tại (có `https://kem-con-hoc-5xf.pages.dev`).
2. Chạy `node -e "import('./src/index.js').then(()=>console.log('ok'))"` phải ra `ok`.
3. **Deploy Worker ngay. Chưa deploy frontend.**

### 2. Kiểm ngay sau khi deploy Worker

```
curl -s -D - -o /dev/null -X OPTIONS https://ai-gateway-worker.trannth1306.workers.dev/chat \
  -H "Origin: https://kem-con-hoc-5xf.pages.dev" -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization,x-prompt-id,x-problem-text,x-family-id,x-grade,x-book-series,x-subject,x-child-id,x-bypass-cache,x-prefetch,x-hint-question,x-xung-ho,x-fix-count,x-fix-reason"
```

Kết quả phải có `Access-Control-Allow-Headers` chứa **đủ 16 header** ở trên. Thiếu cái nào thì dừng, sửa, deploy lại.

### 3. Sau đó mới deploy frontend (`kem-con-hoc`)

1. `npm run build` (lint chạy kèm), `node scripts/test-33-worker-headers.mjs` phải ✓.
2. Deploy frontend. Ghi tên `index-*.js` mới.
3. Mở **Chrome ẩn danh**, đăng nhập một gia đình thử nghiệm (không đụng lớp 3A thật):
   - soạn một đề Toán và một đề mẫu Tiếng Việt, vào tới "Hỏi con từng bước";
   - thử "Hỏi Gấu" trong bài và chấm vở bằng ảnh;
   - Console không có lỗi CORS, tab Network không có request `net::ERR_FAILED`.
4. Tắt mạng (DevTools → Network → Offline) rồi bấm soạn: phải hiện màn "Gấu chưa soạn được bài này…" có nút "Thử lại" và "Về trang chủ", **không trắng**.

### Báo lại

- Tên bản Worker mới và tên `index-*.js` mới.
- Kết quả lệnh `curl` ở mục 2 (dán nguyên phần header).
- Ảnh Chrome ẩn danh ở màn "Hỏi con từng bước", Console sạch.
- Ảnh màn báo lỗi khi tắt mạng.

**Từ nay:** gói nào thêm header gửi tới Worker thì sửa `src/workerHeaders.js` + hằng số trong Worker, và **deploy Worker trước, frontend sau**.
