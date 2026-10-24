# HƯỚNG DẪN CẬP NHẬT: TÁCH GATEWAY CHO AI MỚI & GIỮ NGUYÊN DATABASE CŨ

Hãy cập nhật mã nguồn dự án **Kèm Con Học** theo đúng kiến trúc sau:

---

## 🎯 MỤC TIÊU VÀ NGUYÊN TẮC BẮT BUỘC
1. **DỮ LIỆU & DATABASE (D1, KV, Auth, Gia đình)**:
   - **BẮT BUỘC GIỮ NGUYÊN 100%** trỏ về Gateway cũ: `https://ai-gateway-worker.trann46698.workers.dev`
   - Tuyệt đối không đổi link của các hàm database (`dbKvGet`, `dbKvSet`, `dbQuery`, `dbExecute`) để không làm mất dữ liệu tài khoản, trẻ, gia đình và prompt đang dùng.
2. **CÁC TÁC VỤ AI (Chat, Phân tích sư phạm, OCR, Whisper, Nhận diện đồ chơi)**:
   - **CHUYỂN SANG** Gateway mới: `https://ai-gateway-worker.trannth1306.workers.dev`
   - Gateway này chứa quota mới 10,000 neurons/ngày, model `llama-3.1-70b-instruct` và đã kích hoạt xong bản quyền Vision AI Meta.

---

## 🛠️ CHI TIẾT CÁC FILE CẦN SỬA

### 1. File `src/api.js`

#### a) Khai báo 2 Gateway URL ở đầu file:
```javascript
export const GATEWAY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_GATEWAY) || 'https://ai-gateway-worker.trann46698.workers.dev'
export const AI_GATEWAY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_GATEWAY) || 'https://ai-gateway-worker.trannth1306.workers.dev'
export const CLOUD_KEY = 'kem-con-hoc:state'
```

#### b) Cập nhật hàm `post` và thêm hàm `postAi`:
```javascript
async function post(path, body, timeoutMs = 25000, baseUrl = GATEWAY) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetch(baseUrl + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return await r.json()
  } finally {
    clearTimeout(t)
  }
}

async function postAi(path, body, timeoutMs = 25000) {
  return post(path, body, timeoutMs, AI_GATEWAY)
}
```

#### c) Cập nhật các hàm AI gọi `AI_GATEWAY`:
- Trong hàm **`aiOcr`**:
  ```javascript
  // Ưu tiên 1: Llama 3.2 Vision qua /vision/analyze
  const rVision = await fetch(AI_GATEWAY + '/vision/analyze', {
    method: 'POST',
    body: fd,
    signal: ctrl.signal,
  })

  // Ưu tiên 2: Fallback sang /vision/ocr
  const r = await fetch(AI_GATEWAY + '/vision/ocr', {
    method: 'POST',
    body: fdOcr,
    signal: ctrl.signal,
  })
  ```
- Trong hàm **`aiSpeechToText`**:
  ```javascript
  const r = await fetch(AI_GATEWAY + '/stt', {
    method: 'POST',
    headers: { 'Content-Type': audioBlob.type || 'audio/webm' },
    body: audioBlob,
    signal: ctrl.signal,
  })
  ```
- Trong hàm **`aiAnalyzeToy`**:
  ```javascript
  const r = await fetch(AI_GATEWAY + '/vision/analyze', {
    method: 'POST',
    body: fd,
    signal: ctrl.signal,
  })
  ```
- Trong hàm **`aiGenerateTeachingPlan`**:
  Đổi từ `post('/chat', ...)` sang `postAi('/chat', ...)` (cả ở lần gọi chính và lần tự động retry JSON).
- Trong hàm **`aiChat`**:
  Đổi từ `post('/chat', ...)` sang `postAi('/chat', ...)`.
- Trong hàm **`aiPractice`**:
  Đổi từ `post('/chat', ...)` sang `postAi('/chat', ...)`.

#### d) Giữ nguyên các hàm Database:
- `dbKvGet`: dùng `GATEWAY + '/db/kv/' + encodeURIComponent(key)`
- `dbKvSet`: dùng `GATEWAY + '/db/kv/' + encodeURIComponent(key)`
- `dbQuery`: dùng `post('/db/query', ...)` (mặc định baseUrl là `GATEWAY`)
- `dbExecute`: dùng `post('/db/execute', ...)` (mặc định baseUrl là `GATEWAY`)

---

### 2. File `src/PromptStudioTab.jsx`

#### a) Import thêm `AI_GATEWAY` từ `./api`:
```javascript
import { dbKvGet, dbKvSet, AI_GATEWAY } from './api'
```

#### b) Cập nhật endpoint chạy thử Prompt (hàm `runTestPrompt` khoảng dòng 400):
Tìm:
```javascript
const res = await fetch('https://ai-gateway-worker.trann46698.workers.dev/chat', {
```
Đổi thành:
```javascript
const res = await fetch(`${AI_GATEWAY}/chat`, {
```

---

### 3. Kiểm tra & Build lại dự án
1. Chạy lệnh build:
   ```bash
   npm run build
   ```
2. Đảm bảo ứng dụng build thành công không lỗi syntax hay thiếu biến.
