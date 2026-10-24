# 📘 CLOUDFLARE AI GATEWAY INTEGRATION GUIDE (DEVELOPER HANDBOOK)

Tài liệu này tổng hợp chi tiết cách gọi API Cloudflare Gateway, cấu trúc Request / Response thực tế, và style các prompt tự nhiên, thực chiến do chính mình tự viết và tinh chỉnh cho dự án.

---

## 🌐 1. THÔNG TIN GATEWAY
* **Base URL:** `https://ai-gateway-worker.trann46698.workers.dev`
* **Worker Service:** Advanced Cloudflare AI, Vectorize, R2 & D1 Gateway
* **Client Frontend:** React + Vite
* **Triết lý sản phẩm:** **Người dùng chính là Cha/Mẹ (hỏi bằng chữ hoặc giọng nói)**. Trẻ em chỉ nhìn que tính/đồ vật thật ngoài đời và nghe mẹ giảng, không để trẻ nhìn vào màn hình điện thoại nhiều.

---

## 📡 2. CHI TIẾT TỪNG API ENDPOINT, REQUEST / RESPONSE & PROMPT

### 🎙️ Module 1: Speech-to-Text (STT) — Mẹ đọc đề bài & Mẹ nói câu hỏi
* **Endpoint:** `POST https://ai-gateway-worker.trann46698.workers.dev/stt`
* **Model Cloudflare:** `@cf/openai/whisper` (OpenAI Whisper)
* **Content-Type:** `multipart/form-data`

#### Request Payload:
```http
POST /stt HTTP/1.1
Host: ai-gateway-worker.trann46698.workers.dev
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...

------WebKitFormBoundary...
Content-Disposition: form-data; name="audio"; filename="recording.webm"
Content-Type: audio/webm

<Binary Audio Stream Blob>
------WebKitFormBoundary...--
```

#### Response JSON:
```json
{
  "text": "Mẹ mua 9 quả táo cho Na 3 quả hỏi mẹ còn mấy quả táo"
}
```

---

### 📷 Module 2: Vision OCR đọc đề bài từ ảnh (Chữ in SGK & Chữ viết tay học sinh)
* **Endpoint:** `POST https://ai-gateway-worker.trann46698.workers.dev/vision/analyze`
* **Model Cloudflare:** `@cf/meta/llama-3.2-11b-vision-instruct`
* **Content-Type:** `multipart/form-data`

#### Request Payload:
```http
POST /vision/analyze HTTP/1.1
Host: ai-gateway-worker.trann46698.workers.dev
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...

------WebKitFormBoundary...
Content-Disposition: form-data; name="image"; filename="homework.jpg"
Content-Type: image/jpeg

<Binary Image Data>
------WebKitFormBoundary...
Content-Disposition: form-data; name="prompt"

Đọc giúp mình toàn bộ chữ trong bức ảnh bài tập này nhé (ảnh có thể là chữ in sách bài tập hoặc chữ viết tay của bé trong vở ô ly).
Quy tắc:
- Giữ nguyên tất cả số liệu, phép tính, câu hỏi, các đáp án trắc nghiệm A B C D nếu có.
- Viết lại chuẩn tiếng Việt có dấu giúp mình, nếu chữ viết tay hơi mờ hay dính chữ thì tự sửa đúng chính tả luôn (vd: me mua -> Mẹ mua, con may qua -> còn mấy quả).
- Nếu trong ảnh có nhiều câu (Câu 1, Câu 2...), tách rõ từng câu ra cho mình.
- Chỉ trả về đúng nội dung đề bài đọc được thôi, đừng chào hỏi hay giải thích gì thêm nhé.
------WebKitFormBoundary...--
```

#### Response JSON:
```json
{
  "success": true,
  "id": 25,
  "file_id": "child_1792150533540_o4yfk.png",
  "image_url": "https://ai-gateway-worker.trann46698.workers.dev/images/child_1792150533540_o4yfk.png",
  "analysis": "Mẹ mua 9 quả táo. Mẹ cho Na 3 quả. Hỏi mẹ còn mấy quả táo?"
}
```

---

### 🧠 Module 3: AI Sư phạm soạn 4 bước Scaffold cho Mẹ kèm con
* **Endpoint:** `POST https://ai-gateway-worker.trann46698.workers.dev/chat`
* **Model Cloudflare:** `@cf/meta/llama-3.3-70b-instruct`
* **Content-Type:** `application/json`

#### Request JSON:
```json
{
  "messages": [
    {
      "role": "system",
      "content": "Bạn là giáo viên tiểu học đang hướng dẫn một người mẹ cách giảng bài này cho con. Quan trọng nhất: Tuyệt đối không đưa thẳng đáp án cho bé chép, mà chia nhỏ thành từng câu hỏi gợi mở để mẹ hỏi và con tự nghĩ ra.\nBé học Lớp 2, bộ sách Kết nối tri thức. Giọng điệu mẹ nói với con: Dịu dàng, khích lệ.\nĐề bài: \"Mẹ mua 9 quả táo. Mẹ cho Na 3 quả. Hỏi mẹ còn mấy quả táo?\".\n\nBạn hãy tự giải trước xem bài này dùng phép tính gì, rồi soạn 4 bước hỏi con theo đúng thứ tự:\n- Bước 1: Hỏi để con hiểu đề (bài cho biết gì, hỏi gì).\n- Bước 2: Hỏi về từ ngữ/khái niệm quen thuộc (cho bớt đi thì tăng hay giảm).\n- Bước 3: Gợi ý con dùng que tính, đồ chơi hoặc ngón tay để thao tác thử.\n- Bước 4: Khích lệ con tự viết phép tính và câu trả lời hoàn chỉnh.\n\nTrả về đúng định dạng JSON này giúp mình (không bọc text ngoài JSON):\n{\n  \"type\": \"tên dạng bài\",\n  \"ocr\": \"đề bài đã sửa sạch sẽ\",\n  \"summary\": \"tóm tắt cách giải ngắn gọn cho mẹ\",\n  \"warning\": \"con hay nhầm chỗ nào (nhắc mẹ đừng làm hộ)\",\n  \"method\": \"cách mẹ bày con bằng đồ vật/que tính\",\n  \"steps\": [\n    {\n      \"question\": \"câu mẹ hỏi con\",\n      \"hint\": \"gợi ý nhỏ hơn nếu con chưa biết\",\n      \"praise\": \"câu khen ngợi sự cố gắng của con\",\n      \"answer\": \"câu trả lời chuẩn để mẹ đối chiếu\"\n    }\n  ],\n  \"answer\": \"đáp án cuối cùng để mẹ xem\"\n}"
    },
    {
      "role": "user",
      "content": "Soạn dàn ý gợi mở bài này giúp mình nhé!"
    }
  ],
  "max_tokens": 1200,
  "temperature": 0.3
}
```

#### Response JSON:
```json
{
  "response": "{\"type\":\"Toán có lời văn · Phép trừ trong phạm vi 10\",\"ocr\":\"Mẹ mua 9 quả táo. Mẹ cho Na 3 quả. Hỏi mẹ còn mấy quả táo?\",\"summary\":\"Dạng bài bớt đi: Lấy số táo ban đầu trừ đi số táo đã cho.\",\"warning\":\"Bé hay đoán bừa lấy 9 + 3. Mẹ hỏi bé: Mẹ cho đi thì táo của mẹ nhiều lên hay ít đi?\",\"method\":\"Dùng ngón tay hoặc que tính: Giơ 9 ngón tay, cụp bớt 3 ngón, đếm số ngón còn lại.\",\"steps\":[{\"question\":\"Bài toán này cho mình biết mẹ có mấy quả táo và mẹ cho bạn Na mấy quả hả con?\",\"hint\":\"Con nhìn lại câu đầu tiên xem có số mấy nào.\",\"praise\":\"Con tìm số liệu rất nhanh và đúng rồi!\",\"answer\":\"Mẹ có 9 quả táo, cho Na 3 quả\"},{\"question\":\"Mẹ cho bạn Na rồi thì số quả táo của mẹ tăng lên hay ít đi con nhỉ?\",\"hint\":\"Cho bớt đi thì mình phải làm phép cộng hay phép trừ?\",\"praise\":\"Đúng rồi, cho bớt đi là ít đi, con giỏi lắm!\",\"answer\":\"Ít đi — làm phép trừ\"},{\"question\":\"Con xòe 9 ngón tay ra, rồi cụp 3 ngón lại xem bàn tay mình còn mấy ngón nào?\",\"hint\":\"Con đếm to từng ngón tay còn lại nhé.\",\"praise\":\"Chính xác luôn!\",\"answer\":\"Còn lại 6 ngón tay\"},{\"question\":\"Bây giờ con tự viết phép tính và câu trả lời hoàn chỉnh vào vở nhé!\",\"hint\":\"Phép tính là: 9 trừ đi mấy bằng mấy nhỉ?\",\"praise\":\"Tuyệt vời! Con đã tự mình làm xong cả bài toán rồi đấy!\",\"answer\":\"9 - 3 = 6 (quả táo)\"}],\"answer\":\"9 - 3 = 6 quả táo\"}"
}
```

---

### 💬 Module 4: AI Copilot cho Mẹ — Khi mẹ bế tắc cần hỏi thêm cách giảng
* **Endpoint:** `POST https://ai-gateway-worker.trann46698.workers.dev/chat`
* **Model Cloudflare:** `@cf/meta/llama-3.3-70b-instruct`

#### Prompt Trợ lý cho Mẹ (System Prompt):
```text
Bạn là một cô giáo tiểu học nhiều kinh nghiệm và rất tâm lý, đang tư vấn riêng cho người mẹ cách kèm con học tại nhà.
Thông tin con: Đang học ${child.grade}, bộ sách ${child.book}.
Bài toán con đang làm: "${problem.ocr}".

Nguyên tắc trả lời:
- Luôn đứng về phía mẹ, đồng cảm khi dạy con mệt hoặc con bướng/không tập trung.
- Chỉ đưa ra MẸO GIẢNG, CÂU HỎI GỢI MỞ hoặc VÍ DỤ ĐỒ VẬT THỰC TẾ TRONG NHÀ (kẹo, bánh, que tính, chiếc đũa...) để mẹ bày cho con.
- TUYỆT ĐỐI không đưa sẵn lời giải hay đáp án để mẹ đọc cho con chép.
- Trả lời ngắn gọn, câu từ gần gũi, dịu dàng, thực tế, dễ áp dụng ngay.
```

---

## 💻 3. CODE MẪU INTEGRATION CHO CLIENT (REACT / JS)

### 1. Hàm gọi STT gửi audio stream lên Cloudflare:
```javascript
export async function aiSpeechToText(audioBlob) {
  if (!audioBlob) return null;
  const fd = new FormData();
  fd.append('audio', audioBlob, 'recording.webm');
  try {
    const res = await fetch('https://ai-gateway-worker.trann46698.workers.dev/stt', {
      method: 'POST',
      body: fd,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.text ? data.text.trim() : null;
  } catch (err) {
    console.error('Lỗi nhận diện giọng nói:', err);
    return null;
  }
}
```

### 2. Component Voice Button hai tầng (Web Speech + Cloudflare Whisper Fallback):
```jsx
import { useRef, useState } from 'react';
import { aiSpeechToText } from './api';

export function VoiceInputBtn({ onResult, placeholder = 'Bấm mic để nói' }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const start = async () => {
    // 1. Thử Web Speech API nhận diện tiếng Việt local không độ trễ
    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechClass) {
      const reco = new SpeechClass();
      reco.lang = 'vi-VN';
      reco.onresult = (e) => {
        const text = e.results[0][0].transcript;
        if (text) onResult(text);
        setListening(false);
      };
      reco.onerror = () => fallbackWhisper();
      reco.onend = () => setListening(false);
      recognitionRef.current = reco;
      reco.start();
      setListening(true);
      return;
    }
    // 2. Fallback sang Cloudflare Whisper
    fallbackWhisper();
  };

  const fallbackWhisper = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    const rec = new MediaRecorder(stream);
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const text = await aiSpeechToText(blob);
      if (text) onResult(text);
      setListening(false);
    };
    rec.start();
    setListening(true);
    setTimeout(() => rec.stop(), 5000); // Tự dừng sau 5s nếu nói xong
  };

  return (
    <button
      type="button"
      className={`btn-voice ${listening ? 'listening' : ''}`}
      onClick={() => (listening ? recognitionRef.current?.stop() : start())}
    >
      {listening ? '🔴 Đang nghe mẹ nói...' : `🎙️ ${placeholder}`}
    </button>
  );
}
```

---

## 🧪 4. CURL SCRIPT TEST NHANH

```bash
# 1. Test STT
curl -X POST -F "audio=@recording.webm" "https://ai-gateway-worker.trann46698.workers.dev/stt"

# 2. Test Vision Analyze
curl -X POST \
  -F "image=@de_toan.jpg" \
  -F "prompt=Đọc giúp mình toàn bộ chữ trong ảnh bài tập này nhé, giữ nguyên số liệu và phép tính:" \
  "https://ai-gateway-worker.trann46698.workers.dev/vision/analyze"

# 3. Test Chat Llama 3.3
curl -X POST -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Mẹ cho đi 3 quả táo thì làm phép gì hả cô?"}]}' \
  "https://ai-gateway-worker.trann46698.workers.dev/chat"
```
