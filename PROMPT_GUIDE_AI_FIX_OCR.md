Bạn là chuyên gia Full-stack AI & Frontend cấp cao. Nhiệm vụ của bạn là kiểm tra, sửa lỗi triệt để và tối ưu hóa hệ thống nhận diện ảnh OCR & Scan đồ vật cho Web App React (Vite) này.

### BỐI CẢNH VÀ VẤN ĐỀ CẦN XỬ LÝ NGAY:
Dự án có 3 tính năng nhận diện ảnh:
1. Scan ảnh bài tập chữ viết tay học sinh (Vở ô ly tiếng Việt).
2. Scan trang sách bài tập in (SGK).
3. Scan đồ vật / đồ chơi trong nhà để tạo mini-game học toán.

Triệu chứng lỗi hiện tại:
Mỗi khi chụp hoặc tải ảnh lên, hệ thống không lấy được text thật từ ảnh mà thường xuyên báo lỗi `ocr_failed` hoặc tự ý nhảy về bài mẫu mặc định (`PROBLEM` - bài 3 hộp bút hoặc `APPLE_PROBLEM`).

Bạn phải tiến hành rà soát mã nguồn và thực hiện chính xác các yêu cầu kỹ thuật sau:

---

### 1. NGUYÊN TẮC VÀ NGUYÊN NHÂN CỐT LÕI CẦN FIX:

#### A. Sửa triệt để hàm `aiOcr` trong `src/api.js`:
- Kiểm tra hàm `aiOcr(file)`: Đảm bảo sau khi fetch và trích xuất `text = j.extracted_text`, BẮT BUỘC phải có lệnh `return text.trim()`. Tuyệt đối không để hàm kết thúc mà không return text thật.
- Endpoint `/vision/ocr` mặc định của Cloudflare chỉ tối ưu cho chữ in tiếng Anh, nhận diện rất kém đối với tiếng Việt có dấu và chữ viết tay học sinh.
- **Yêu cầu bắt buộc:** Triển khai cơ chế 2 tầng:
  - **Tầng 1 (Ưu tiên số 1):** Gửi ảnh kèm prompt tiếng Việt lên endpoint `POST https://ai-gateway-worker.trann46698.workers.dev/vision/analyze` (sử dụng model Llama 3.2 11B Vision Instruct). Model này đọc chuẩn xác 100% cả chữ in lẫn chữ viết tay tiếng Việt trong vở ô ly.
  - **Tầng 2:** Fallback sang `POST /vision/ocr` nếu tầng 1 gặp sự cố mạng hoặc timeout.
  - **Làm sạch kết quả:** Dùng regex cắt bỏ các câu dẫn thừa của AI như "Được rồi, tôi thấy...", "**ĐỀ BÀI:**", chỉ giữ lại nội dung đề bài thuần túy.

#### B. Gỡ bỏ fallback tự động gán đề mẫu trong `src/screens.jsx`:
- Trong component `Analyze()`: Tuyệt đối KHÔNG tự ý gán cứng `patch({ problem: PROBLEM })` hoặc `patch({ problem: APPLE_PROBLEM })` khi ảnh có text.
- Khi AI đọc được text thực tế từ ảnh, phải gán ngay vào state `editedText` và chuyển sang trạng thái `review`. Tại đây phụ huynh được xem lại đề bài, chỉnh sửa số liệu hoặc dấu câu nếu ảnh chụp bị mờ, sau đó bấm "Tiếp tục" thì AI mới bắt đầu soạn 4 bước câu hỏi sư phạm.

#### C. Sửa bộ lọc nhận diện đồ vật trong `SnapToy` (`src/screens.jsx`):
- Khi gọi `aiAnalyzeToy(blobOrFile)` (qua `/vision/analyze`), AI thường trả về câu có tiền tố ("trong ảnh là một cây kéo", "chiếc lược chải tóc").
- Phải áp dụng regex làm sạch: `.replace(/^(trong ảnh|ảnh chụp|có|một|chiếc|cái|cây|đây là|nhìn thấy)\s+/gi, '')` trước khi đưa vào hàm `detectToyItem(query)` để map chính xác mini-game.

---

### 2. CODE CHUẨN CỦA HÀM `aiOcr` CẦN THAY THẾ TRONG `src/api.js`:

```javascript
export async function aiOcr(file, timeoutMs = 15000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const fd = new FormData()
    fd.append('image', file, 'homework.jpg')
    fd.append(
      'prompt',
      'Đọc giúp mình toàn bộ chữ trong ảnh bài tập này nhé (chữ in sách hoặc chữ viết tay vở ô ly). ' +
      'Giữ nguyên số liệu, phép tính, câu hỏi. Viết lại đúng tiếng Việt có dấu. ' +
      'Chỉ trả về đúng đề bài tìm thấy, không chào hỏi hay giải thích thêm.'
    )

    // Ưu tiên 1: Llama 3.2 Vision qua /vision/analyze (Đọc chữ viết tay tiếng Việt & chữ in tốt nhất)
    try {
      const rVision = await fetch(GATEWAY + '/vision/analyze', {
        method: 'POST',
        body: fd,
        signal: ctrl.signal,
      })
      if (rVision.ok) {
        const jv = await rVision.json()
        let analysis = jv.analysis || ''
        if (analysis) {
          analysis = analysis
            .replace(/^Được rồi,.*?:\s*/i, '')
            .replace(/^\*\*ĐỀ BÀI:\*\*\s*/i, '')
            .replace(/^Đề bài toán tiểu học là:\s*/i, '')
            .replace(/Tôi hy vọng điều đó.*$/is, '')
            .trim()
          if (analysis.length >= 5 && !analysis.includes('không thể đọc') && !analysis.includes('Chơi gì với đồ')) {
            return analysis
          }
        }
      }
    } catch (eVision) {
      console.warn('Vision analyze retry fallback:', eVision)
    }

    // Ưu tiên 2: Fallback sang /vision/ocr
    const fdOcr = new FormData()
    fdOcr.append('image', file, 'homework.jpg')
    const r = await fetch(GATEWAY + '/vision/ocr', {
      method: 'POST',
      body: fdOcr,
      signal: ctrl.signal,
    })
    if (r.ok) {
      const j = await r.json()
      const text = j.extracted_text || null
      if (text && !text.includes('There is no text') && text.length >= 4 && !text.includes('The image shows')) {
        return text.trim()
      }
    }

    return null
  } catch (e) {
    console.error('aiOcr error:', e)
    return null
  } finally {
    clearTimeout(timer)
  }
}
```

---

### 3. TIÊU CHÍ NGHIỆM THU (VERIFICATION):
1. Chụp ảnh chữ viết tay vở ô ly tiếng Việt: Hiển thị đúng text thật vào khung Textarea để mẹ chỉnh sửa. Tuyệt đối không tự ý gán bài mẫu 3 hộp bút.
2. Chụp trang sách in bài tập: Bóc tách đúng các câu hỏi và số liệu của đề bài.
3. Chụp đồ vật trong nhà (`SnapToy`): Nhận diện đúng cây kéo, cây lược, lego... và hiển thị đúng mini-game tương ứng.
4. Chạy `npm run build` kiểm tra bundle biên dịch thành công 100%, không phát sinh lỗi cú pháp hay cảnh báo linter.
