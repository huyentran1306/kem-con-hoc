Bạn là chuyên gia Full-stack AI & Frontend React/Vite cấp cao. Nhiệm vụ của bạn là kiểm tra, sửa lỗi và triển khai toàn diện tính năng **Hệ Thống Huy Hiệu FontAwesome Tone-Sur-Tone, Big Data Lịch Sử Sticker Dài Hạn & AI Adaptive Roadmap** cho ứng dụng Web React (Vite) "Kèm Con Học".

---

### BỐI CẢNH VÀ MỤC TIÊU CỐT LÕI

1. **Chuẩn hóa thẩm mỹ Tone-sur-tone với FontAwesome 6:**
   Thay thế các emoji lộn xộn bằng hệ thống huy hiệu phẩm chất tone-sur-tone chuẩn nhận diện giáo dục (Kiên nhẫn, Sáng tạo, Tốc độ, Tỉ mỉ, Tập trung,...).
2. **Big Data Lịch sử Sticker Dài Hạn (Longitudinal Tracking):**
   Hiện tại app chỉ tích đủ 10 sticker rồi đổi quà xong là reset về 0, làm mất toàn bộ lịch sử. Cần lưu vĩnh viễn `stats.stickerHistory` theo tuần để có Big Data phân tích đa tuần (VD: Tuần 1: 3 Kiên nhẫn, 5 Sáng tạo; Tuần 2: 4 Kiên nhẫn, 1 Sáng tạo).
3. **AI Adaptive Roadmap (Lộ trình Sư phạm Thích ứng):**
   Đưa AI vào phân tích nguyên nhân biến động phẩm chất (Do bài tập rập khuôn/quá tải hay do độ khó tăng vọt) và đề xuất lộ trình 7 ngày cân bằng cho gia đình ở màn hình Báo cáo (`Report`) và Bảng quản trị (`Admin Analytics`).

---

### CHI TIẾT MÃ NGUỒN CẦN TRIỂN KHAI VÀ THAY THẾ TỪNG FILE

#### 1. File `index.html` (Thêm CDN FontAwesome 6)
Thêm link stylesheet FontAwesome 6 vào trong thẻ `<head>`:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
```

---

#### 2. File `src/data.js` (Bảng Huy hiệu Phẩm chất & Mock History)
Thay thế mảng `AVAILABLE_STICKERS` và bổ sung `SAMPLE_STICKER_HISTORY`:
```javascript
export const AVAILABLE_STICKERS = [
  { id: 's1', e: '🦄', fa: 'fa-solid fa-mountain', trait: 'Kiên nhẫn', n: 'Kỳ lân Kiên trì', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', desc: 'Không bỏ cuộc trước bài khó' },
  { id: 's2', e: '🚀', fa: 'fa-solid fa-bolt-lightning', trait: 'Tốc độ', n: 'Tên lửa Tốc độ', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', desc: 'Tính toán nhanh và chuẩn xác' },
  { id: 's3', e: '🌟', fa: 'fa-solid fa-lightbulb', trait: 'Sáng tạo', n: 'Ngôi sao Sáng tạo', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', desc: 'Nghĩ ra cách giải độc đáo' },
  { id: 's4', e: '🐼', fa: 'fa-solid fa-compass-drafting', trait: 'Tỉ mỉ', n: 'Gấu trúc Tỉ mỉ', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', desc: 'Trình bày cẩn thận từng bước' },
  { id: 's5', e: '🦁', fa: 'fa-solid fa-shield-heart', trait: 'Tự tin', n: 'Sư tử Tự tin', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', desc: 'Tự tin giải thích đề bài cho mẹ' },
  { id: 's6', e: '🌈', fa: 'fa-solid fa-face-smile-beam', trait: 'Vui vẻ', n: 'Cầu vồng Vui vẻ', color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8', desc: 'Giữ nụ cười và tinh thần thoải mái' },
  { id: 's7', e: '🐬', fa: 'fa-solid fa-book-open-reader', trait: 'Thông thái', n: 'Cá heo Thông thái', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', desc: 'Nắm vững quy tắc và nhớ bài lâu' },
  { id: 's8', e: '👑', fa: 'fa-solid fa-bullseye', trait: 'Tập trung', n: 'Vương miện Tập trung', color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE', desc: 'Tập trung trọn vẹn buổi học 15 phút' },
  { id: 's9', e: '🐝', fa: 'fa-solid fa-clock-rotate-left', trait: 'Chăm chỉ', n: 'Ong vàng Chăm chỉ', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A', desc: 'Tự giác ngồi vào bàn học đúng giờ' },
  { id: 's10', e: '🦉', fa: 'fa-solid fa-brain', trait: 'Tư duy', n: 'Cú mèo Tư duy', color: '#6366F1', bg: '#F5F3FF', border: '#E0E7FF', desc: 'Nhìn ra bản chất bài toán hay' },
  { id: 's11', e: '🐢', fa: 'fa-solid fa-shoe-prints', trait: 'Bền bỉ', n: 'Rùa con Bền bỉ', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', desc: 'Đi từng bước chậm mà cực kỳ chắc' },
  { id: 's12', e: '🏆', fa: 'fa-solid fa-trophy', trait: 'Xuất sắc', n: 'Cúp Vô địch Tuần', color: '#CA8A04', bg: '#FEFCE8', border: '#FEF08A', desc: 'Hoàn thành xuất sắc mục tiêu tuần' },
]

/* Dữ liệu mẫu lịch sử Sticker theo thời gian (Big Data Longitudinal History) */
export const SAMPLE_STICKER_HISTORY = [
  // Tuần trước (Tuần 1): Nhiều sáng tạo, ít kiên nhẫn do bài dễ
  { id: 'h1', stickerId: 's3', name: 'Ngôi sao Sáng tạo', trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb', color: '#D97706', subject: 'Toán', problemType: 'Số học & phép tính', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 8 },
  { id: 'h2', stickerId: 's3', name: 'Ngôi sao Sáng tạo', trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb', color: '#D97706', subject: 'Toán', problemType: 'Đố vui que tính', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 8 },
  { id: 'h3', stickerId: 's3', name: 'Ngôi sao Sáng tạo', trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb', color: '#D97706', subject: 'Tiếng Việt', problemType: 'Đặt câu mở rộng', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 7 },
  { id: 'h4', stickerId: 's3', name: 'Ngôi sao Sáng tạo', trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb', color: '#D97706', subject: 'Tiếng Anh', problemType: 'Từ vựng đồ vật', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 7 },
  { id: 'h5', stickerId: 's3', name: 'Ngôi sao Sáng tạo', trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb', color: '#D97706', subject: 'Toán', problemType: 'Hình học phẳng', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 6 },
  { id: 'h6', stickerId: 's1', name: 'Kỳ lân Kiên trì', trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', subject: 'Toán', problemType: 'Toán có lời văn', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 6 },
  { id: 'h7', stickerId: 's1', name: 'Kỳ lân Kiên trì', trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', subject: 'Toán', problemType: 'Toán có lời văn', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 5 },
  { id: 'h8', stickerId: 's1', name: 'Kỳ lân Kiên trì', trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', subject: 'Tiếng Việt', problemType: 'Viết đoạn văn', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 5 },

  // Tuần này (Tuần 2): Kiên nhẫn tăng lên 4, Sáng tạo tụt xuống còn 1 do bài toán khó & lặp dạng
  { id: 'h9', stickerId: 's1', name: 'Kỳ lân Kiên trì', trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', subject: 'Toán', problemType: 'Toán có lời văn 2 bước', week: 'Tuần này', timestamp: Date.now() - 86400000 * 4 },
  { id: 'h10', stickerId: 's1', name: 'Kỳ lân Kiên trì', trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', subject: 'Toán', problemType: 'Toán có lời văn 2 bước', week: 'Tuần này', timestamp: Date.now() - 86400000 * 3 },
  { id: 'h11', stickerId: 's1', name: 'Kỳ lân Kiên trì', trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', subject: 'Toán', problemType: 'Toán có lời văn 2 bước', week: 'Tuần này', timestamp: Date.now() - 86400000 * 2 },
  { id: 'h12', stickerId: 's1', name: 'Kỳ lân Kiên trì', trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', subject: 'Tiếng Việt', problemType: 'Chính tả phân biệt d/gi/r', week: 'Tuần này', timestamp: Date.now() - 86400000 * 1 },
  { id: 'h13', stickerId: 's3', name: 'Ngôi sao Sáng tạo', trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb', color: '#D97706', subject: 'Toán', problemType: 'Trò chơi đồ vật', week: 'Tuần này', timestamp: Date.now() - 86400000 * 1 },
  { id: 'h14', stickerId: 's8', name: 'Vương miện Tập trung', trait: 'Tập trung', fa: 'fa-solid fa-bullseye', color: '#4F46E5', subject: 'Toán', problemType: 'Luyện tập chung', week: 'Tuần này', timestamp: Date.now() - 3600000 * 5 },
  { id: 'h15', stickerId: 's4', name: 'Gấu trúc Tỉ mỉ', trait: 'Tỉ mỉ', fa: 'fa-solid fa-compass-drafting', color: '#059669', subject: 'Toán', problemType: 'Trình bày vở', week: 'Tuần này', timestamp: Date.now() - 3600000 * 2 },
]
```

---

#### 3. File `src/promptStudio.js` (System Prompt & Router Engine)
Thêm `p7_longitudinal_analysis` vào `DEFAULT_PROMPTS`:
```javascript
  p7_longitudinal_analysis: {
    id: 'p7_longitudinal_analysis',
    name: '7. Phân tích Dữ liệu lớn Sticker & Biến động phẩm chất',
    desc: 'Phân tích longitudinal trait history (Kiên nhẫn, Sáng tạo,...), phát hiện bài học nhàm chán/quá khó và đề xuất lộ trình cân bằng',
    variables: ['{{ten_be}}', '{{lop}}', '{{thong_ke_tuan_nay}}', '{{thong_ke_tuan_truoc}}', '{{mon_hoc_va_vuong_mac}}', '{{so_ca_hoc}}'],
    requiredVars: ['{{ten_be}}', '{{thong_ke_tuan_nay}}', '{{thong_ke_tuan_truoc}}'],
    prompt: `Bạn là Giám đốc Sư phạm Tiểu học và Chuyên gia Tâm lý Giáo dục Gia đình (Singapore CPA & Vygotsky ZPD).

DỮ LIỆU ĐẦU VÀO CỦA CON:
- Học sinh: {{ten_be}} ({{lop}})
- Thống kê huy hiệu phẩm chất TUẦN NÀY: {{thong_ke_tuan_nay}}
- Thống kê huy hiệu phẩm chất TUẦN TRƯỚC: {{thong_ke_tuan_truoc}}
- Tình trạng môn học & điểm nghẽn: {{mon_hoc_va_vuong_mac}}
- Nhịp kèm của phụ huynh: {{so_ca_hoc}}

NHIỆM VỤ PHÂN TÍCH:
Dựa trên sự biến động về số lượng và loại huy hiệu phẩm chất (Kiên nhẫn, Sáng tạo, Tốc độ, Tỉ mỉ, Tập trung,...), hãy phân tích chuyên sâu cho phụ huynh theo 3 phần:

1. 🔍 CHẨN ĐOÁN BIẾN ĐỘNG PHẨM CHẤT:
- Tại sao tuần này con nhận nhiều hay ít huy hiệu nào? (Ví dụ: Tuần trước 5 Sáng tạo nhưng tuần này chỉ 1 Sáng tạo và 4 Kiên nhẫn).
- Phân tích nguyên nhân gốc rễ: Do dạng bài đang học mang tính rập khuôn, áp lực tính toán cao làm cạn kiệt tính sáng tạo; hay do độ khó bài học đột ngột tăng cao khiến con phải dồn sức kiên nhẫn vượt khó?

2. 📊 ĐIỂM NGHẼN MÔN HỌC & DẠNG BÀI:
- Nhận diện chính xác bài học con đang vướng (Toán lời văn, Chính tả d/gi/r,...).
- Tâm lý của con trong ca học (mệt mỏi, quá tải hay cần đổi gió).

3. 🎯 LỘ TRÌNH 7 NGÀY CÂN BẰNG (ADAPTIVE ROADMAP):
- Đề xuất kế hoạch 7 ngày cụ thể, nhẹ nhàng cho gia đình.
- Gợi ý hoạt động đổi gió: mini-game 5 phút bằng đồ vật thật (que tính, chai lọ, Lego), hoặc đổi ca cho Bố/Mẹ để con lấy lại cảm hứng sáng tạo mà vẫn giữ vững tính kiên nhẫn.`,
  },
```

---

#### 4. File `src/api.js` (Hàm API AI Phân tích Lộ trình Sư phạm)
Export hàm `aiAnalyzeLongitudinalProgress`:
```javascript
export async function aiAnalyzeLongitudinalProgress({ child, stats, stickerHistory = [] }) {
  const thisWeek = stickerHistory.filter((s) => s.week === 'Tuần này')
  const lastWeek = stickerHistory.filter((s) => s.week === 'Tuần trước')

  const countTraits = (list) => {
    const map = {}
    list.forEach((s) => {
      const t = s.trait || s.name || 'Khác'
      map[t] = (map[t] || 0) + 1
    })
    return Object.entries(map).map(([k, v]) => `${v} sticker ${k}`).join(', ') || 'Chưa có sticker'
  }

  const thongKeTuanNay = countTraits(thisWeek)
  const thongKeTuanTruoc = countTraits(lastWeek)

  const weakList = (stats?.weak || []).map((w) => `${w.n}: vướng ${w.v}/${w.t} lần`).join('; ') || 'Chưa có dạng bài vướng nổi bật'
  const strongList = (stats?.strong || []).map((s) => `${s.n}: làm tốt ${s.v}/${s.t}`).join('; ') || 'Đang tiến bộ đều'
  const monHocVaVuongMac = `Điểm vướng: ${weakList}. Điểm vững: ${strongList}`

  const soCaHoc = `Mẹ kèm ${stats?.sessionsMom || 0} ca, Bố kèm ${stats?.sessionsDad || 0} ca. Phụ huynh bấm giữ bình tĩnh ${stats?.calmWeek || 0} lần.`

  const sysPrompt = renderPrompt('p7_longitudinal_analysis', {
    ten_be: child?.name || 'Bé',
    lop: child?.grade || 'Lớp 3',
    thong_ke_tuan_nay: thongKeTuanNay,
    thong_ke_tuan_truoc: thongKeTuanTruoc,
    mon_hoc_va_vuong_mac: monHocVaVuongMac,
    so_ca_hoc: soCaHoc,
  })

  try {
    const j = await postAi(
      '/chat',
      {
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: 'Hãy phân tích dữ liệu biến động phẩm chất và đề xuất lộ trình sư phạm cho con.' },
        ],
        max_tokens: 1200,
        temperature: 0.4,
      },
      30000
    )
    const resp = j?.response
    if (typeof resp === 'string' && resp.trim()) return resp.trim()
    return null
  } catch (e) {
    console.warn('Longitudinal analysis failed:', e)
    return null
  }
}
```

---

#### 5. File `src/screens.jsx` (Lưu Lịch Sử Vĩnh Viễn, Carousel & Màn Hình Báo Cáo)
1. **Lưu lịch sử vĩnh viễn trong hàm `pickSticker`:**
```javascript
  const pickSticker = (e) => {
    soundPop(600)
    const found = AVAILABLE_STICKERS.find((s) => s.id === e || s.e === e) || {
      id: 's' + Date.now(),
      e,
      n: 'Huy hiệu',
      trait: 'Kiên nhẫn',
      fa: 'fa-solid fa-award',
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      desc: 'Con làm bài rất nỗ lực',
    }
    const oldList = stats.stickersList || []
    const newList = [...oldList, { ...found, when: 'Hôm nay' }]

    // Lưu Big Data Lịch sử Sticker vĩnh viễn (không bao giờ mất khi đổi quà)
    const oldHistory = stats.stickerHistory || []
    const newHistoryItem = {
      id: 'h_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      stickerId: found.id,
      name: found.n,
      trait: found.trait || 'Kiên nhẫn',
      fa: found.fa || 'fa-solid fa-award',
      color: found.color || '#F59E0B',
      subject: problem?.mon || 'Toán',
      problemType: problem?.dang_bai || 'Bài tập rèn luyện',
      week: 'Tuần này',
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('vi-VN'),
    }
    const newHistory = [...oldHistory, newHistoryItem]

    setStats({ stickers: newList.length, stickersList: newList, stickerHistory: newHistory })
    soundSuccess()
    boom()
    toast(`${child.name} nhận huy hiệu ${found.n}! 🎉`)
    if (newList.length >= 10) {
      setTimeout(() => {
        soundFanfare()
        boom()
        openSheet('redeem')
      }, 700)
    }
  }
```

2. **Carousel chọn huy hiệu FontAwesome Tone-sur-tone trong `Done()`:**
```jsx
      <div className="card sun">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span className="lbl sun">Cho {child.name} chọn huy hiệu</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: stkCur.bg || '#FFFBEB', color: stkCur.color || '#D97706', border: `1px solid ${stkCur.border || '#FDE68A'}` }}>
            <i className={`${stkCur.fa || 'fa-solid fa-award'} fa-fw`} style={{ marginRight: 4 }} />
            {stkCur.trait || 'Phẩm chất'}
          </span>
        </div>
        <div className="stk-carousel">
          <button className="round-btn" aria-label="Sticker trước" disabled={stkIdx === 0} onClick={() => { soundPop(450); setStkIdx((i) => Math.max(0, i - 1)) }}>‹</button>
          <button
            className="stk-pick"
            onClick={() => pickSticker(stkCur.id || stkCur.e)}
            style={{
              padding: '12px 14px',
              borderRadius: 18,
              border: `2px solid ${stkCur.border || '#FDE68A'}`,
              background: `linear-gradient(180deg, #FFFFFF 0%, ${stkCur.bg || '#FFFBEB'} 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                background: stkCur.bg || '#FFFBEB',
                border: `2px solid ${stkCur.border || '#FDE68A'}`,
                color: stkCur.color || '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                margin: '0 auto 8px',
                boxShadow: `0 4px 12px ${stkCur.color}25`,
              }}
            >
              <i className={stkCur.fa || 'fa-solid fa-award'} />
            </div>
            <span className="stk-name" style={{ color: stkCur.color || '#78350F', fontWeight: 800 }}>{stkCur.n}</span>
            <span className="stk-desc" style={{ color: '#64748B', fontSize: 12 }}>{stkCur.desc}</span>
            <span className="stk-owned" style={{ marginTop: 6, padding: '2px 10px', borderRadius: 99, background: stkOwned > 0 ? stkCur.bg : '#F1F5F9', color: stkOwned > 0 ? stkCur.color : '#94A3B8', fontWeight: 700, fontSize: 11, border: `1px solid ${stkOwned > 0 ? stkCur.border : '#E2E8F0'}` }}>
              {stkOwned > 0 ? `Đã có ×${stkOwned}` : 'Chưa có trong sổ'}
            </span>
          </button>
          <button className="round-btn" aria-label="Sticker sau" disabled={stkIdx >= AVAILABLE_STICKERS.length - 1} onClick={() => { soundPop(450); setStkIdx((i) => Math.min(AVAILABLE_STICKERS.length - 1, i + 1)) }}>›</button>
        </div>
        <div className="stk-dots">
          {AVAILABLE_STICKERS.map((s, i) => (
            <i key={s.id} className={i === stkIdx ? 'on' : ''} />
          ))}
        </div>
      </div>
```

3. **Màn hình Báo cáo phụ huynh (`Report()`):**
```jsx
export function Report() {
  const { S, stats, toast, boom } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId)
  const momDays = S.schedule.filter((d) => d.owner === 'Mẹ').length
  const dadDays = S.schedule.filter((d) => d.owner === 'Bố').length
  const total = momDays + dadDays
  const momPct = total ? Math.round((momDays / total) * 100) : 0
  const dadPct = 100 - momPct

  // Phân tích Big Data Sticker History
  const stickerHistory = stats.stickerHistory || []
  const thisWeekStickers = stickerHistory.filter((s) => s.week === 'Tuần này')
  const lastWeekStickers = stickerHistory.filter((s) => s.week === 'Tuần trước')

  const countTraitMap = (list) => {
    const map = {}
    list.forEach((s) => {
      const trait = s.trait || 'Kiên nhẫn'
      map[trait] = (map[trait] || 0) + 1
    })
    return map
  }

  const thisTraits = countTraitMap(thisWeekStickers)
  const lastTraits = countTraitMap(lastWeekStickers)

  const TRACKED_TRAITS = [
    { trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    { trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
    { trait: 'Tập trung', fa: 'fa-solid fa-bullseye', color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
    { trait: 'Tỉ mỉ', fa: 'fa-solid fa-compass-drafting', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  ]

  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const handleRunAiAnalysis = async () => {
    soundPop(550)
    setAnalyzing(true)
    toast('AI đang phân tích biến động phẩm chất & đề xuất lộ trình… 🧠')
    try {
      const result = await aiAnalyzeLongitudinalProgress({ child, stats, stickerHistory })
      if (result) {
        setAiAnalysis(result)
        soundSuccess()
        boom()
        toast('Đã có báo cáo lộ trình cân bằng cho con! ✨')
      }
    } catch (e) {
      toast('Lỗi kết nối AI, vui lòng thử lại sau.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <>
      <Header title={`Tuần này của ${child.name}`} />
      <p className="sub">{total} ca · mẹ kèm {momDays} ca, bố kèm {dadDays} ca · {stickerHistory.length} mốc dữ liệu phẩm chất</p>

      {/* 1. AI Phân tích Lộ trình Sư phạm & Biến động phẩm chất */}
      <div className="card pop" style={{ border: '2px solid #8B5CF6', background: 'linear-gradient(145deg, #FAF5FF 0%, #F3E8FF 100%)', padding: '16px 14px' }}>
        <b style={{ fontSize: 16, color: '#4C1D95', display: 'block', marginBottom: 6 }}>
          Phân Tích Biến Động Phẩm Chất & Lộ Trình Cân Bằng
        </b>
        {aiAnalysis && (
          <div style={{ background: '#FFFFFF', borderRadius: 14, padding: '14px 12px', border: '1.5px solid #DDD6FE', fontSize: 13.5, lineHeight: 1.55, color: '#1E293B', marginBottom: 12, whiteSpace: 'pre-wrap' }}>
            {aiAnalysis}
          </div>
        )}
        <button
          className="btn solid"
          disabled={analyzing}
          onClick={handleRunAiAnalysis}
          style={{ width: '100%', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', fontWeight: 800, fontSize: 14 }}
        >
          {analyzing ? 'Đang phân tích Big Data…' : '✨ AI Phân Tích Lộ Trình Cân Bằng Cho Con'}
        </button>
      </div>

      {/* 2. So sánh Biến động Phẩm chất Tuần này vs Tuần trước */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {TRACKED_TRAITS.map((item) => {
            const thisCnt = thisTraits[item.trait] || 0
            const lastCnt = lastTraits[item.trait] || 0
            const diff = thisCnt - lastCnt
            return (
              <div key={item.trait} style={{ background: item.bg, border: `1.5px solid ${item.border}`, borderRadius: 14, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <b style={{ fontSize: 13, color: item.color }}>{item.trait}</b>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '1px 6px', borderRadius: 99, background: diff > 0 ? '#DCFCE7' : diff < 0 ? '#FEE2E2' : '#F1F5F9', color: diff > 0 ? '#166534' : diff < 0 ? '#991B1B' : '#64748B' }}>
                    {diff > 0 ? `+${diff} ↗` : diff < 0 ? `${diff} ↘` : 'Đều'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{thisCnt}</span>
                  <span style={{ fontSize: 11.5, color: '#64748B' }}>tuần này</span>
                  <span style={{ fontSize: 11.5, color: '#94A3B8', marginLeft: 'auto' }}>trước: {lastCnt}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
```

---

#### 6. File `src/App.jsx` (Sổ Dán Huy Hiệu & Bảo Toàn Lịch Sử Khi Đổi Quà)
1. Trong `RewardSheet`:
   Khi bấm đổi quà:
   ```javascript
   setCurStats((s) => ({
     ...s,
     stickers: 0,
     stickersList: [],
     rewardCount: (s.rewardCount || 0) + 1,
     // BẢO TOÀN vĩnh viễn s.stickerHistory
   }))
   ```
2. Trong `StickerBookSheet`:
   Duyệt qua `AVAILABLE_STICKERS` và render icon FontAwesome tone-sur-tone:
   ```jsx
   <div
     style={{
       width: 44,
       height: 44,
       borderRadius: 14,
       background: unlocked ? '#FFFFFF' : '#E2E8F0',
       border: `1.5px solid ${unlocked ? stk.border : '#CBD5E1'}`,
       color: unlocked ? stk.color : '#94A3B8',
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'center',
       fontSize: 20,
     }}
   >
     <i className={stk.fa || 'fa-solid fa-award'} />
   </div>
   ```

---

#### 7. File `src/Admin.jsx` (Tab Analytics - Phân Tích Toàn Hệ Thống)
Trong `activeTab === 'analytics'`, thêm Section:
```jsx
<div className="admin-content-card" style={{ gridColumn: '1 / -1' }}>
  <div className="card-header-row">
    <div>
      <h3 className="section-title">
        <i className="fa-solid fa-chart-line" style={{ color: '#7C3AED', marginRight: 8 }} />
        Phân Tích Dữ Liệu Lớn Sticker & Phẩm Chất Theo Thời Gian (Longitudinal Big Data)
      </h3>
    </div>
    <button className="admin-pri-btn" onClick={handleAdminAiSummary} disabled={adminAnalyzing}>
      {adminAnalyzing ? 'Đang phân tích Big Data…' : '✨ AI Phân Tích Tổng Quan Hệ Thống'}
    </button>
  </div>
  {adminAiAnalysis && (
    <div style={{ background: '#FFFFFF', borderRadius: 12, padding: '14px 16px', border: '1px solid #E9D5FF', marginTop: 14, whiteSpace: 'pre-wrap' }}>
      {adminAiAnalysis}
    </div>
  )}
</div>
```

---

### CHECKLIST KIỂM THỬ BẮT BUỘC:
1. Chạy `npm run build` không có lỗi cú pháp hoặc cảnh báo nghiêm trọng.
2. Kiểm tra bộ sưu tập huy hiệu hiển thị đẹp mắt, tone-sur-tone với icon FontAwesome 6.
3. Làm 1 bài toán, chọn huy hiệu và xác nhận `stickerHistory` được ghi nhận.
4. Đổi quà 10 sticker: xác nhận số sticker về 0 nhưng `stickerHistory` không bị mất.
5. Mở màn hình Báo cáo: bấm nút AI phân tích, kết quả hiển thị chuẩn 3 phần (Chẩn đoán, Điểm nghẽn, Lộ trình 7 ngày).
