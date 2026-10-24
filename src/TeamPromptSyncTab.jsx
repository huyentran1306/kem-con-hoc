import { useState, useEffect, useMemo } from 'react'
import { dbKvGet, dbKvSet, AI_GATEWAY } from './api'
import { toast } from './utils'

const TEAM_PROMPTS_KV_KEY = 'team_prompts_sync:v1'
const LOCAL_STORAGE_KEY = 'kem-con-hoc:team-prompts-cache'
const LAST_AUTHOR_KEY = 'kem-con-hoc:team-author'

// Danh mục prompt phổ biến
export const PROMPT_CATEGORIES = [
  { id: 'all', name: 'Tất cả danh mục', icon: '📂' },
  { id: 'math', name: 'Toán tiểu học', icon: '📐' },
  { id: 'vietnamese', name: 'Tiếng Việt', icon: '📖' },
  { id: 'english', name: 'Tiếng Anh', icon: '🇬🇧' },
  { id: 'vision_ocr', name: 'Vision & OCR', icon: '📷' },
  { id: 'socratic', name: 'Sư phạm Socratic', icon: '💡' },
  { id: 'practice', name: 'Luyện tập mở rộng', icon: '✏️' },
  { id: 'other', name: 'Khác', icon: '🧪' },
]

// Models AI công ty phổ biến
export const COMPANY_AI_MODELS = [
  'VideFlow',
  'Claude 3.7 Sonnet',
  'Claude 3.5 Sonnet',
  'ChatGPT GPT-4o',
  'GPT-4o-mini',
  'Company Internal AI (Private)',
  'Llama 3.3 70B',
  'Gemini 1.5 Pro',
  'Khác (Tùy chọn)',
]

// Dữ liệu mẫu khởi tạo ban đầu để team thấy ngay nội dung thực tế
const INITIAL_TEAM_PROMPTS = [
  {
    id: 'tp_longitudinal_1',
    title: 'Prompt Full Triển Khai Kỹ Thuật: Big Data Sticker, FontAwesome Tone-Sur-Tone & AI Adaptive Roadmap',
    category: 'math',
    targetAi: 'VideFlow',
    author: 'Huyền (Tech Lead)',
    isRunCompanyAi: false,
    runBy: '',
    runAt: '',
    aiResult: '',
    promptDetail: `Bạn là chuyên gia Full-stack AI & Frontend React/Vite cấp cao. Nhiệm vụ của bạn là kiểm tra, hoàn thiện và nâng cấp toàn diện tính năng **Hệ Thống Huy Hiệu Phẩm Chất FontAwesome Tone-Sur-Tone, Big Data Lịch Sử Sticker Dài Hạn & AI Adaptive Roadmap** cho ứng dụng Web React (Vite) "Kèm Con Học".

---

### BỐI CẢNH VÀ VẤN ĐỀ CỐT LÕI CẦN NÂNG CẤP:

1. **Vấn đề 1 (Thẩm mỹ & Giao diện Icon lung tung):**
   - Hiện tại ứng dụng đang dùng các emoji rải rác, màu sắc chữ và huy hiệu chưa đồng bộ tone-sur-tone. Đối với trẻ con thì dùng emoji tạm ổn, nhưng để đạt chuẩn thẩm mỹ cao cấp, chỉn chu và tạo sự chuyên nghiệp cho sản phẩm giáo dục, hệ thống phải chuyển sang bộ icon **FontAwesome 6** với bảng màu tone-sur-tone định hình rõ từng phẩm chất (Kiên nhẫn, Sáng tạo, Tốc độ, Tỉ mỉ, Tập trung,...).

2. **Vấn đề 2 (Mất sạch Big Data lịch sử khi đổi quà):**
   - Hiện tại logic của app chỉ tích lũy đủ 10 sticker là đổi quà, sau khi đổi quà thì mảng sticker bị reset về 0. Điều này làm mất toàn bộ dữ liệu lịch sử theo thời gian (Longitudinal History) khiến hệ thống không có "Big Data" để phân tích sự phát triển phẩm chất của con qua các tuần.
   - Ví dụ thực tế: Tuần 1 con nhận được 3 sticker Kiên nhẫn, 5 sticker Sáng tạo; nhưng sang Tuần 2 con chỉ nhận được 1 Sáng tạo và tận 4 Kiên nhẫn. Nếu không lưu vĩnh viễn, AI không thể nhận diện được sự biến động này.

3. **Vấn đề 3 (Thiếu AI phân tích nguyên nhân & Lộ trình sư phạm thích ứng):**
   - Cần đưa AI vào phân tích Big Data tóm tắt: Tại sao Sáng tạo lại giảm sút? Do dạng bài tập tuần này quá nhàm chán/rập khuôn công thức, hay do độ khó bài học đột ngột tăng vọt khiến con phải dồn sức kiên nhẫn vượt khó?
   - Tương tự với các môn học: Môn nào con vướng nhiều? Từ đó AI đề xuất một **Lộ trình 7 ngày cân bằng (Adaptive Roadmap)** gửi cho phụ huynh ở màn hình Báo cáo (\`Report\`) và hiển thị thống kê tổng quan ở trang Admin (\`Admin Analytics\`).

---

### HƯỚNG DẪN KỸ THUẬT & CODE IMPLEMENT CHI TIẾT TỪNG BƯỚC:

#### BƯỚC 1: TÍCH HỢP FONTAWESOME 6 VÀO \`index.html\`
Thêm link CDN FontAwesome 6 vào thẻ \`<head>\` của \`index.html\`:
\`\`\`html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
\`\`\`

---

#### BƯỚC 2: CHUẨN HÓA BẢNG DỮ LIỆU HUY HIỆU & MOCK HISTORY TRONG \`src/data.js\`
1. Cập nhật mảng \`AVAILABLE_STICKERS\`:
   Mỗi sticker phải có: \`id\`, \`trait\` (phẩm chất), \`n\` (tên hiển thị), \`fa\` (icon FontAwesome class), \`color\`, \`bg\`, \`border\`, \`desc\`:
   - Kỳ lân Kiên trì: \`trait: 'Kiên nhẫn'\`, \`fa: 'fa-solid fa-mountain'\`, \`color: '#7C3AED'\`, \`bg: '#F5F3FF'\`, \`border: '#DDD6FE'\`.
   - Tên lửa Tốc độ: \`trait: 'Tốc độ'\`, \`fa: 'fa-solid fa-bolt-lightning'\`, \`color: '#EA580C'\`, \`bg: '#FFF7ED'\`, \`border: '#FED7AA'\`.
   - Ngôi sao Sáng tạo: \`trait: 'Sáng tạo'\`, \`fa: 'fa-solid fa-lightbulb'\`, \`color: '#D97706'\`, \`bg: '#FFFBEB'\`, \`border: '#FDE68A'\`.
   - Gấu trúc Tỉ mỉ: \`trait: 'Tỉ mỉ'\`, \`fa: 'fa-solid fa-compass-drafting'\`, \`color: '#059669'\`, \`bg: '#ECFDF5'\`, \`border: '#A7F3D0'\`.
   - Sư tử Tự tin: \`trait: 'Tự tin'\`, \`fa: 'fa-solid fa-shield-heart'\`, \`color: '#DC2626'\`, \`bg: '#FEF2F2'\`, \`border: '#FECACA'\`.
   - Cầu vồng Vui vẻ: \`trait: 'Vui vẻ'\`, \`fa: 'fa-solid fa-face-smile-beam'\`, \`color: '#DB2777'\`, \`bg: '#FDF2F8'\`, \`border: '#FBCFE8'\`.
   - Cá heo Thông thái: \`trait: 'Thông thái'\`, \`fa: 'fa-solid fa-book-open-reader'\`, \`color: '#0284C7'\`, \`bg: '#F0F9FF'\`, \`border: '#BAE6FD'\`.
   - Vương miện Tập trung: \`trait: 'Tập trung'\`, \`fa: 'fa-solid fa-bullseye'\`, \`color: '#4F46E5'\`, \`bg: '#EEF2FF'\`, \`border: '#C7D2FE'\`.
   - Ong vàng Chăm chỉ: \`trait: 'Chăm chỉ'\`, \`fa: 'fa-solid fa-clock-rotate-left'\`, \`color: '#B45309'\`, \`bg: '#FEF3C7'\`, \`border: '#FDE68A'\`.
   - Cú mèo Tư duy: \`trait: 'Tư duy'\`, \`fa: 'fa-solid fa-brain'\`, \`color: '#6366F1'\`, \`bg: '#F5F3FF'\`, \`border: '#E0E7FF'\`.
   - Rùa con Bền bỉ: \`trait: 'Bền bỉ'\`, \`fa: 'fa-solid fa-shoe-prints'\`, \`color: '#16A34A'\`, \`bg: '#F0FDF4'\`, \`border: '#BBF7D0'\`.
   - Cúp Vô địch Tuần: \`trait: 'Xuất sắc'\`, \`fa: 'fa-solid fa-trophy'\`, \`color: '#CA8A04'\`, \`bg: '#FEFCE8'\`, \`border: '#FEF08A'\`.

2. Thêm dữ liệu mẫu \`SAMPLE_STICKER_HISTORY\` để phục vụ phân tích đa tuần:
   - Tuần trước: 5 Sáng tạo, 3 Kiên nhẫn (bài toán khởi động, dễ).
   - Tuần này: 1 Sáng tạo, 4 Kiên nhẫn, 1 Tập trung, 1 Tỉ mỉ (bài toán lời văn 2 bước khó).

---

#### BƯỚC 3: CƠ CHẾ LƯU VĨNH VIỄN & KHÔNG RESET KHI ĐỔI QUÀ (\`src/App.jsx\` & \`src/screens.jsx\`)
1. Trong \`defaultStats\` (\`src/App.jsx\`):
   Khởi tạo \`stickerHistory: [...SAMPLE_STICKER_HISTORY]\`.

2. Trong \`Done()\` (\`src/screens.jsx\`), sửa hàm \`pickSticker(e)\`:
   - Append huy hiệu được chọn vào \`stats.stickersList\` (dùng để đếm mốc 10 sticker đổi quà).
   - ĐỒNG THỜI tạo một record mới và append vào \`stats.stickerHistory\`:
     \`\`\`javascript
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
     setStats({
       stickers: newList.length,
       stickersList: newList,
       stickerHistory: [...(stats.stickerHistory || []), newHistoryItem]
     })
     \`\`\`

3. Trong \`RewardSheet\` (\`src/App.jsx\`), khi phụ huynh bấm "Xác nhận đổi quà cho con":
   - Chỉ reset: \`stickers: 0\`, \`stickersList: []\`.
   - Tăng \`rewardCount: (curStats.rewardCount || 0) + 1\`.
   - TUYỆT ĐỐI KHÔNG xóa \`stickerHistory\`. Lịch sử sticker này là dữ liệu Big Data vĩnh viễn của học sinh.

---

#### BƯỚC 4: HÀM API AI PHÂN TÍCH LỘ TRÌNH DÀI HẠN (\`src/api.js\`)
Triển khai hàm \`aiAnalyzeLongitudinalProgress({ child, stats, stickerHistory = [] })\`:
\`\`\`javascript
export async function aiAnalyzeLongitudinalProgress({ child, stats, stickerHistory = [] }) {
  const thisWeek = stickerHistory.filter((s) => s.week === 'Tuần này')
  const lastWeek = stickerHistory.filter((s) => s.week === 'Tuần trước')

  const countTraits = (list) => {
    const map = {}
    list.forEach((s) => {
      const t = s.trait || s.name || 'Khác'
      map[t] = (map[t] || 0) + 1
    })
    return Object.entries(map).map(([k, v]) => \`\${v} sticker \${k}\`).join(', ') || 'Chưa có sticker'
  }

  const thongKeTuanNay = countTraits(thisWeek)
  const thongKeTuanTruoc = countTraits(lastWeek)
  const weakList = (stats?.weak || []).map((w) => \`\${w.n}: vướng \${w.v}/\${w.t} lần\`).join('; ') || 'Chưa có dạng bài vướng'
  const strongList = (stats?.strong || []).map((s) => \`\${s.n}: làm tốt \${s.v}/\${s.t}\`).join('; ') || 'Đang tiến bộ đều'
  const monHocVaVuongMac = \`Điểm vướng: \${weakList}. Điểm vững: \${strongList}\`
  const soCaHoc = \`Mẹ kèm \${stats?.sessionsMom || 0} ca, Bố kèm \${stats?.sessionsDad || 0} ca. Phụ huynh bấm giữ bình tĩnh \${stats?.calmWeek || 0} lần.\`

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
\`\`\`

---

#### BƯỚC 5: NÂNG CẤP MÀN HÌNH BÁO CÁO PHỤ HUYNH (\`Report()\` TRONG \`src/screens.jsx\`)
1. **Khối AI Adaptive Roadmap:**
   - Thêm nút: \`✨ AI Phân Tích Lộ Trình Cân Bằng (Big Data)\`.
   - Khi bấm: gọi \`aiAnalyzeLongitudinalProgress\`.
   - Kết quả trả về chia 3 phần rõ ràng:
     - 🔍 **1. Chẩn đoán biến động phẩm chất**: Giải thích nguyên nhân tại sao Sáng tạo giảm (do bài toán có lời văn 2 bước rập khuôn mẫu giải) và Kiên nhẫn tăng (con phải gắng sức vượt khó).
     - 📊 **2. Điểm nghẽn môn học & dạng bài**: Nêu dạng bài vướng mắc cần lưu tâm.
     - 🎯 **3. Lộ trình 7 ngày cân bằng (Adaptive Roadmap)**: Hoạt động cụ thể (5 que tính, xếp Lego, đổi người kèm sang Bố 1 buổi để kích hoạt lại cảm hứng sáng tạo).
2. **Khối So Sánh Biến Động Phẩm Chất (Longitudinal Trait Tracker):**
   - 4 card tone-sur-tone FontAwesome: Kiên nhẫn, Sáng tạo, Tập trung, Tỉ mỉ.
   - Hiển thị số lượng Tuần này vs Tuần trước kèm badge biến động: \`+1 ↗\`, \`-4 ↘\`, \`Đều\`.

\`\`\`jsx
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
      <Header title={\`Tuần này của \${child.name}\`} />
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
              <div key={item.trait} style={{ background: item.bg, border: \`1.5px solid \${item.border}\`, borderRadius: 14, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <b style={{ fontSize: 13, color: item.color }}>{item.trait}</b>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '1px 6px', borderRadius: 99, background: diff > 0 ? '#DCFCE7' : diff < 0 ? '#FEE2E2' : '#F1F5F9', color: diff > 0 ? '#166534' : diff < 0 ? '#991B1B' : '#64748B' }}>
                    {diff > 0 ? \`+\${diff} ↗\` : diff < 0 ? \`\${diff} ↘\` : 'Đều'}
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
\`\`\`

---

#### BƯỚC 6: NÂNG CẤP BẢNG ĐIỀU KHIỂN ADMIN (\`src/Admin.jsx\`)
Trong Tab Analytics (\`activeTab === 'analytics'\`):
1. Thêm Card: **Phân Tích Dữ Liệu Lớn Sticker & Phẩm Chất Theo Thời Gian (Longitudinal Big Data)**.
2. Grid hiển thị các phẩm chất toàn hệ thống bằng FontAwesome tone-sur-tone.
3. Nút bấm: \`✨ AI Phân Tích Tổng Quan Hệ Thống\` gọi \`handleAdminAiSummary\` để xuất báo cáo sư phạm vĩ mô cho ban quản trị.

\`\`\`jsx
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
\`\`\`

---

#### BƯỚC 7: NÂNG CẤP SỔ DÁN HUY HIỆU VÀ CAROUSEL
1. Trong \`RewardSheet\` (\`src/App.jsx\`): Khi đổi quà chỉ reset \`stickers: 0\`, \`stickersList: []\`, bảo toàn \`stickerHistory\`.
2. Trong \`StickerBookSheet\` (\`src/App.jsx\`): Duyệt qua \`AVAILABLE_STICKERS\` và render icon FontAwesome tone-sur-tone:

\`\`\`jsx
<div
  style={{
    width: 44,
    height: 44,
    borderRadius: 14,
    background: unlocked ? '#FFFFFF' : '#E2E8F0',
    border: \`1.5px solid \${unlocked ? stk.border : '#CBD5E1'}\`,
    color: unlocked ? stk.color : '#94A3B8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  }}
>
  <i className={stk.fa || 'fa-solid fa-award'} />
</div>
\`\`\`

---

### TIÊU CHÍ NGHIỆM THU (VERIFICATION):
1. Chạy \`npm run build\` không có lỗi.
2. Sticker history không bị xóa khi nhận quà 10 sticker.
3. Bấm "AI Phân Tích Lộ Trình Cân Bằng" ở màn hình Báo cáo trả về chuẩn 3 phần có cấu trúc.
4. Mọi huy hiệu trên giao diện đều hiển thị chuẩn FontAwesome tone-sur-tone.`,
    createdAt: '2026-10-23 16:45',
    updatedAt: '2026-10-23 16:50',
  },
  {
    id: 'tp_pedagogy_ai_config_2',
    title: 'Prompt Triển Khai Kỹ Thuật: Admin AI Config, Phân Loại Đề Bài & Bảng Điều Phối Sư Phạm Động',
    category: 'socratic',
    targetAi: 'VideFlow',
    author: 'Huyền (Tech Lead)',
    isRunCompanyAi: false,
    runBy: '',
    runAt: '',
    aiResult: '',
    promptDetail: `# PROMPT TRIỂN KHAI KỸ THUẬT: ADMIN AI CONFIG & BẢNG ĐIỀU PHỐI SƯ PHẠM ĐỘNG (DYNAMIC PEDAGOGY ROUTER)

Bạn là kỹ sư Fullstack / Frontend React cao cấp. Hãy nâng cấp hệ thống quản trị **Prompt Studio** trong ứng dụng **Kèm Con Học** (React + Vite) bằng cách chuyển toàn bộ các tham số sinh AI (Model AI, Temperature, Max Tokens, Timeout) và bộ điều phối phương pháp sư phạm (Singapore CPA, Inductive, Deductive, Socratic...) thành **cấu hình động có thể quản trị trực quan trên Admin** và **đồng bộ 2 chiều lên Cloudflare D1 KV**.

---

## 🎯 MỤC TIÊU VÀ BỐI CẢNH

1. **Hiện trạng cũ:**
   - Các tham số sinh AI như \`temperature: 0.3\`, \`max_tokens: 1500\`, model AI đang bị gán tĩnh (hardcode) trong code frontend hoặc worker.
   - Hàm \`routePedagogyMethod\` trong \`src/promptStudio.js\` dùng các câu lệnh \`if/else\` cứng, muốn thêm/sửa phương pháp giảng dạy sư phạm cho môn mới hoặc đổi câu lệnh hướng dẫn AI đều phải sửa code và deploy lại.
2. **Yêu cầu nâng cấp:**
   - **AI Model & Inference Sliders:** Cho phép Admin chọn model AI (Cloudflare Llama 3.3 70B, VideFlow AI Gateway, Claude 3.7 Sonnet, OpenAI GPT-4o, Google Gemini 1.5 Pro) và kéo thanh trượt điều chỉnh \`temperature\` (0.0 – 1.0), \`max_tokens\` (256 – 4096), \`timeout_ms\` (5s – 60s).
   - **Pedagogy Routing Table (Bảng điều phối sư phạm động):** Chuyển toàn bộ quy tắc sư phạm thành danh sách quy tắc (rules) có thể: Bật/Tắt (Toggle), Chỉnh sửa (Edit regex match môn, lớp, dạng bài, câu lệnh sư phạm \`instruction\`), Xoá và Thêm quy tắc mới (Add custom rule).
   - **Đồng bộ Cloudflare D1 KV:** Lưu và đọc cấu hình cấu trúc JSON từ Cloudflare KV tại key \`prompt_studio:ai_config\`.
   - **Live Test Bench:** Khi chạy thử prompt ở tab bên cạnh, test bench tự động sử dụng Model và Temperature mà Admin đã cấu hình.

---

## 🛠 HƯỚNG DẪN TRIỂN KHAI CHI TIẾT THEO TỪNG FILE

### 1. Cập nhật \`src/promptStudio.js\`

Thêm cấu hình mặc định \`DEFAULT_AI_CONFIG\`, key lưu trữ \`PROMPT_AI_CONFIG_KEY\`, các hàm get/set cache, và viết lại hàm \`routePedagogyMethod\` để duyệt động qua mảng \`pedagogy_routing\`:

\`\`\`javascript
/* ============================================================
   🎯 BẢNG ĐỊNH TUYẾN PHƯƠNG PHÁP SƯ PHẠM (PEDAGOGY ROUTER) & AI CONFIG
   Hỗ trợ cấu hình Model, Temperature, Max Tokens và Bảng Router trực tiếp trên Admin
   ============================================================ */
export const PROMPT_AI_CONFIG_KEY = 'kem-con-hoc:prompt-studio-ai-config'

export const DEFAULT_AI_CONFIG = {
  model: 'cloudflare-llama-3.3-70b',
  modelName: 'Cloudflare Llama 3.3 70B (Fast & Mặc định)',
  temperature: 0.3,
  max_tokens: 1500,
  timeout_ms: 30000,
  curriculum_config: {
    books: ['Kết nối tri thức', 'Chân trời sáng tạo', 'Cánh diều', 'Cùng học để phát triển năng lực'],
    grades: ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'],
    tones: [
      { id: 'gentle', label: 'Dịu dàng', desc: 'Ấm áp, kiên nhẫn, khích lệ nỗ lực' },
      { id: 'fun', label: 'Vui nhộn', desc: 'Hài hước, ví von sinh động với đồ vật' },
      { id: 'concise', label: 'Ngắn gọn', desc: 'Câu ngắn dưới 15 chữ, súc tích' },
    ],
  },
  pedagogy_routing: [
    {
      id: 'toan_loi_van',
      title: 'Toán có lời văn, phép tính lớp 1–3',
      subjectName: 'Toán',
      methods: 'Singapore CPA + Scaffolding + Inquiry (Socratic)',
      instruction: 'Bậc 1 dùng vật thật (kẹo, que tính, ngón tay), bậc 2 vẽ hình hoặc sơ đồ đoạn thẳng, bậc 3 viết phép tính. Mỗi bậc là MỘT câu hỏi ngắn (dưới 25 chữ), không phải lời giảng giải dài dòng.',
      common_mistake: 'Bố mẹ hay sốt ruột làm hộ phép tính trước khi con kịp hiểu đề',
      keywords: 'lời văn|phép tính|cộng|trừ|nhân|chia|mua|bán|còn lại|tất cả|bao nhiêu',
      matchSubject: 'toán|math',
      matchGrade: '1|2|3',
      matchTopic: 'lời văn|phép tính|cộng|trừ|nhân|chia',
      enabled: true,
    },
    {
      id: 'toan_khai_niem',
      title: 'Toán khái niệm mới (số chẵn, chia hết, phân số)',
      subjectName: 'Toán',
      methods: 'Inductive + CPA + Tích hợp đời sống',
      instruction: 'Cho 3–4 ví dụ cụ thể quen thuộc để con tự tìm ra quy luật, rồi mới cùng con gọi tên quy tắc (VD: răng lược 2–4–6–8, chia bánh pizza).',
      common_mistake: 'Con chưa nhìn ra quy luật số hoặc nhầm lẫn giữa tử số và mẫu số',
      keywords: 'khái niệm|số chẵn|số lẻ|chia hết|phân số|dãy số|quy luật',
      matchSubject: 'toán|math',
      matchGrade: 'all',
      matchTopic: 'khái niệm|số chẵn|số lẻ|chia hết|phân số|hình',
      enabled: true,
    },
    {
      id: 'toan_cong_thuc',
      title: 'Toán áp dụng công thức (chu vi, diện tích lớp 3–5)',
      subjectName: 'Toán',
      methods: 'Deductive + Direct Instruction ngắn + Competency-based',
      instruction: 'Nhắc quy tắc cốt lõi đúng 1 câu ngắn, làm mẫu 1 ví dụ khác với số nhỏ, sau đó hỏi con tự làm bài thật.',
      common_mistake: 'Con hay quên nhân đôi, quên đóng mở ngoặc hoặc nhầm đơn vị đo',
      keywords: 'công thức|chu vi|diện tích|mét vuông|chiều dài|chiều rộng|hình chữ nhật|hình vuông|vận tốc',
      matchSubject: 'toán|math',
      matchGrade: '3|4|5',
      matchTopic: 'công thức|chu vi|diện tích|vận tốc',
      enabled: true,
    },
    {
      id: 'tieng_viet_van',
      title: 'Tiếng Việt lớp 1–2 (âm, vần, đọc)',
      subjectName: 'Tiếng Việt',
      methods: 'Information Processing + Imagery & Elaboration + Gamification',
      instruction: 'Lặp ngắn nhiều lần, tạo liên tưởng hình ảnh sinh động cho vần khó (an/ang, uôi/uya), gợi ý trò chơi ghép thẻ chữ hoặc tìm đồ vật trong phòng.',
      common_mistake: 'Con dễ lẫn lộn các vần gần giống nhau (an/ang, iêt/iêc) hoặc phát âm sai dấu thanh',
      keywords: 'âm|vần|đọc|chính tả|tiếng việt|tập đọc|ghép vần',
      matchSubject: 'tiếng việt|văn',
      matchGrade: '1|2',
      matchTopic: 'âm|vần|đọc|chính tả',
      enabled: true,
    },
    {
      id: 'tieng_viet_doan',
      title: 'Tiếng Việt đọc hiểu, viết đoạn',
      subjectName: 'Tiếng Việt',
      methods: 'Inquiry + Meaningful Learning + Contextual Guessing',
      instruction: 'Đặt câu hỏi gợi trải nghiệm thật của con, đoán nghĩa từ theo ngữ cảnh câu trước/sau, dựng dàn ý đơn giản 3 câu (mở - thân - kết).',
      common_mistake: 'Con viết câu cụt, chưa đủ chủ vị hoặc sao chép văn mẫu máy móc',
      keywords: 'đoạn văn|đọc hiểu|tập làm văn|từ đồng nghĩa|câu chuyện|bài thơ|nghĩa của từ',
      matchSubject: 'tiếng việt|văn',
      matchGrade: 'all',
      matchTopic: 'đọc hiểu|viết đoạn|tập làm văn',
      enabled: true,
    },
    {
      id: 'tieng_anh_tu_vung',
      title: 'Tiếng Anh từ vựng',
      subjectName: 'Tiếng Anh',
      methods: 'Imagery & Elaboration + Usage-based + Experiential',
      instruction: 'Gắn từ vựng mới với đồ vật thực tế trong nhà (chair, table, pen), lặp mẫu câu nhiều lần qua trò chơi "Chỉ nhanh - Nói đúng".',
      common_mistake: 'Con chưa nhớ nghĩa từ hoặc phát âm nuốt âm cuối (ending sounds)',
      keywords: 'english|tiếng anh|choose|fill in|what|where|how many|sentence|word|vocabulary|từ vựng',
      matchSubject: 'tiếng anh|english',
      matchGrade: 'all',
      matchTopic: 'từ vựng|vocabulary',
      enabled: true,
    },
    {
      id: 'tieng_anh_ngu_phap',
      title: 'Tiếng Anh ngữ pháp, mẫu câu',
      subjectName: 'Tiếng Anh',
      methods: 'Cognitive-Code (qua Inductive) + Concept-Based Instruction',
      instruction: 'Cho 3 câu mẫu ngắn để con tự nhận ra quy luật đổi từ/đuôi từ; vẽ hình đơn giản cho giới từ vị trí (in/on/under).',
      common_mistake: 'Con hay quên chia động từ theo ngôi số ít hoặc nhầm vị trí giới từ',
      keywords: 'grammar|verb|is|are|am|do|does|have|has|preposition|in on under',
      matchSubject: 'tiếng anh|english',
      matchGrade: 'all',
      matchTopic: 'ngữ pháp|grammar|mẫu câu',
      enabled: true,
    },
    {
      id: 'con_bi_lap_lai',
      title: 'Con bí lần 2 trở đi',
      subjectName: 'Tất cả môn',
      methods: 'Differentiated Instruction (Hạ bậc thang độ khó)',
      instruction: 'Tạm thời giảm độ khó: đổi số nhỏ hơn hoặc làm bài tương tự siêu đơn giản bằng đồ vật trên bàn, con làm được rồi mới quay lại bài gốc.',
      common_mistake: 'Con bị quá tải nhận thức và nản chí khi gặp chướng ngại liên tiếp',
      keywords: 'isStuck',
      matchSubject: 'all',
      matchGrade: 'all',
      matchTopic: 'isStuck',
      enabled: true,
    },
  ],
}

let cachedAiConfig = null

export function getActiveAiConfig() {
  if (cachedAiConfig) return cachedAiConfig
  try {
    const raw = localStorage.getItem(PROMPT_AI_CONFIG_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      cachedAiConfig = { ...DEFAULT_AI_CONFIG, ...parsed }
      return cachedAiConfig
    }
  } catch (e) {}
  cachedAiConfig = { ...DEFAULT_AI_CONFIG }
  return cachedAiConfig
}

export function setActiveAiConfig(newConfig) {
  cachedAiConfig = { ...DEFAULT_AI_CONFIG, ...newConfig }
  try {
    localStorage.setItem(PROMPT_AI_CONFIG_KEY, JSON.stringify(cachedAiConfig))
  } catch (e) {}
  return cachedAiConfig
}

/**
 * Định tuyến phương pháp sư phạm động theo cấu hình Admin
 */
export function routePedagogyMethod({ mon = 'Toán', lop = 'Lớp 1', dang_bai = '', isStuck = false } = {}) {
  const cfg = getActiveAiConfig()
  const table = (cfg && Array.isArray(cfg.pedagogy_routing) && cfg.pedagogy_routing.length > 0)
    ? cfg.pedagogy_routing
    : DEFAULT_AI_CONFIG.pedagogy_routing
  const activeRules = table.filter(r => r.enabled !== false)

  if (isStuck) {
    const item = activeRules.find(x => x.id === 'con_bi_lap_lai' || x.matchTopic === 'isStuck')
    if (item) {
      return {
        phuong_phap: item.methods,
        doan_phuong_phap: \`- Phương pháp: \${item.methods}\\n- Hướng dẫn thực hiện: \${item.instruction}\\n- Cuối bài: Áp dụng Metacognitive ("Con dạy lại mẹ" và hỏi lần sau gặp bài này con làm bước nào trước).\`,
      }
    }
  }

  for (const item of activeRules) {
    if (item.id === 'con_bi_lap_lai' || item.matchTopic === 'isStuck') continue
    const subMatch = !item.matchSubject || item.matchSubject === 'all' || new RegExp(item.matchSubject, 'i').test(mon)
    const gradeMatch = !item.matchGrade || item.matchGrade === 'all' || new RegExp(item.matchGrade).test(lop)
    const topicMatch = !item.matchTopic || item.matchTopic === 'all' || new RegExp(item.matchTopic, 'i').test(dang_bai)

    if (subMatch && gradeMatch && topicMatch) {
      return {
        phuong_phap: item.methods,
        doan_phuong_phap: \`- Phương pháp: \${item.methods}\\n- Hướng dẫn thực hiện: \${item.instruction}\\n- Cuối bài: Áp dụng Metacognitive ("Con dạy lại mẹ" và hỏi lần sau gặp bài này con làm bước nào trước).\`,
      }
    }
  }

  const def = activeRules[0] || DEFAULT_AI_CONFIG.pedagogy_routing[0]
  return {
    phuong_phap: def.methods,
    doan_phuong_phap: \`- Phương pháp: \${def.methods}\\n- Hướng dẫn thực hiện: \${def.instruction}\\n- Cuối bài: Áp dụng Metacognitive ("Con dạy lại mẹ" và hỏi lần sau gặp bài này con làm bước nào trước).\`,
  }
}

/**
 * Phân loại bài tập động theo cấu hình Router sư phạm (thay thế hoàn toàn hardcode)
 */
export function classifyProblemDynamic(deBai = '', lop = 'Lớp 2') {
  const text = (deBai || '').toLowerCase()
  const cfg = getActiveAiConfig()
  const table = (cfg && Array.isArray(cfg.pedagogy_routing) && cfg.pedagogy_routing.length > 0)
    ? cfg.pedagogy_routing
    : DEFAULT_AI_CONFIG.pedagogy_routing
  const activeRules = table.filter((r) => r.enabled !== false && r.id !== 'con_bi_lap_lai')

  for (const rule of activeRules) {
    if (rule.keywords) {
      try {
        const reg = new RegExp(rule.keywords, 'i')
        if (reg.test(text)) {
          return {
            mon: rule.subjectName || (rule.matchSubject?.includes('anh') ? 'Tiếng Anh' : rule.matchSubject?.includes('việt') ? 'Tiếng Việt' : 'Toán'),
            lop,
            dang_bai: rule.title,
            loi_hay_gap: rule.common_mistake || 'Con hay vội làm phép tính mà chưa đọc kỹ câu hỏi',
          }
        }
      } catch (e) {}
    }
  }

  // Fallback mặc định
  return {
    mon: 'Toán',
    lop,
    dang_bai: 'Toán có lời văn, phép tính lớp 1–3',
    loi_hay_gap: 'Bố mẹ hay sốt ruột làm hộ phép tính trước khi con kịp hiểu đề',
  }
}
\`\`\`

---

### 2. Cập nhật \`src/api.js\`

Trong hàm gọi AI giảng bài (\`aiExplain\`), thay thế các giá trị tham số cứng bằng giá trị lấy từ \`getActiveAiConfig()\`:

\`\`\`javascript
import { getActiveAiConfig } from './promptStudio'

// Trong hàm aiExplain({ problemText, grade, subject, ... }):
const aiCfg = getActiveAiConfig()

const response = await fetchWithTimeout(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'Authorization': \`Bearer \${apiKey}\` } : {})
  },
  body: JSON.stringify({
    prompt: finalPrompt,
    max_tokens: aiCfg.max_tokens || 1500,
    temperature: typeof aiCfg.temperature === 'number' ? aiCfg.temperature : 0.3,
    model: aiCfg.model || 'cloudflare-llama-3.3-70b',
  }),
  timeoutMs: aiCfg.timeout_ms || 30000,
})
\`\`\`

---

### 3. Cập nhật \`src/PromptStudioTab.jsx\`

#### A. Định nghĩa danh sách Models có sẵn:
\`\`\`javascript
const AVAILABLE_AI_MODELS = [
  {
    id: 'cloudflare-llama-3.3-70b',
    name: 'Cloudflare Llama 3.3 70B Instruct',
    provider: 'Cloudflare Workers AI',
    badge: 'Mặc định & Miễn phí',
    badgeColor: '#10B981',
    icon: '🦙',
    desc: 'Tốc độ phản hồi cực nhanh, tối ưu chi phí, hoàn hảo cho ngữ cảnh toán & tiếng Việt tiểu học.',
  },
  {
    id: 'videflow-gateway',
    name: 'VideFlow AI Gateway (Multi-model)',
    provider: 'VideFlow Engine',
    badge: 'Tự động Cân bằng',
    badgeColor: '#6366F1',
    icon: '⚡',
    desc: 'Hệ thống Gateway điều phối thông minh của công ty, tự động switch model ổn định nhất.',
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Anthropic Claude 3.7 Sonnet',
    provider: 'Anthropic via Gateway',
    badge: 'Sư phạm Chuyên sâu',
    badgeColor: '#F59E0B',
    icon: '🧠',
    desc: 'Khả năng tư duy logic và phân tích tâm lý giáo dục xuất sắc nhất cho bài toán khó.',
  },
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'OpenAI via Gateway',
    badge: 'Đa Năng Chuẩn Xác',
    badgeColor: '#0EA5E9',
    icon: '🤖',
    desc: 'Độ chính xác cao, khả năng trích xuất bài tập toán hình và lời văn 2 bước chuẩn mực.',
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Google Gemini 1.5 Pro',
    provider: 'Google Vertex / AI Studio',
    badge: 'Context Siêu Lớn',
    badgeColor: '#EC4899',
    icon: '💎',
    desc: 'Khả năng đọc hiểu hình ảnh bài vở ô ly viết tay và bảng dữ liệu lớn ấn tượng.',
  },
]
\`\`\`

#### B. Thêm State Quản trị & Điều hướng View:
\`\`\`javascript
// Quản lý chuyển tab: 'prompts' | 'ai_config'
const [activeView, setActiveView] = useState('prompts')

// Quản lý AI Config
const [aiConfig, setAiConfig] = useState(() => getActiveAiConfig())
const [savingAiConfig, setSavingAiConfig] = useState(false)
const [editingRule, setEditingRule] = useState(null)
const [showRuleModal, setShowRuleModal] = useState(false)
\`\`\`

#### C. Thêm các hàm xử lý tương tác:
\`\`\`javascript
const handleUpdateAiParam = (key, val) => {
  const updated = { ...aiConfig, [key]: val }
  setAiConfig(updated)
  setActiveAiConfig(updated)
}

const handleToggleRule = (ruleId) => {
  const updatedRules = (aiConfig.pedagogy_routing || []).map(r => 
    r.id === ruleId ? { ...r, enabled: !r.enabled } : r
  )
  const updated = { ...aiConfig, pedagogy_routing: updatedRules }
  setAiConfig(updated)
  setActiveAiConfig(updated)
  toast.success('Đã cập nhật trạng thái quy tắc!')
}

const handleOpenAddRule = () => {
  setEditingRule({
    id: 'rule_' + Date.now(),
    title: '',
    methods: '',
    instruction: '',
    matchSubject: 'toán',
    matchGrade: 'all',
    matchTopic: 'all',
    enabled: true,
  })
  setShowRuleModal(true)
}

const handleOpenEditRule = (rule) => {
  setEditingRule({ ...rule })
  setShowRuleModal(true)
}

const handleSaveRule = () => {
  if (!editingRule.title?.trim() || !editingRule.instruction?.trim()) {
    toast.error('Vui lòng điền tiêu đề và câu lệnh sư phạm!')
    return
  }
  const currentRules = aiConfig.pedagogy_routing || []
  const exists = currentRules.some(r => r.id === editingRule.id)
  const newRules = exists
    ? currentRules.map(r => r.id === editingRule.id ? editingRule : r)
    : [...currentRules, editingRule]
  
  const updated = { ...aiConfig, pedagogy_routing: newRules }
  setAiConfig(updated)
  setActiveAiConfig(updated)
  setShowRuleModal(false)
  setEditingRule(null)
  toast.success('Đã lưu quy tắc sư phạm!')
}

const handleDeleteRule = (ruleId) => {
  if (!window.confirm('Bạn có chắc chắn muốn xoá quy tắc này không?')) return
  const newRules = (aiConfig.pedagogy_routing || []).filter(r => r.id !== ruleId)
  const updated = { ...aiConfig, pedagogy_routing: newRules }
  setAiConfig(updated)
  setActiveAiConfig(updated)
  toast.success('Đã xoá quy tắc!')
}

const handleResetAiConfig = () => {
  if (!window.confirm('Khôi phục toàn bộ cấu hình AI & Router về mặc định ban đầu?')) return
  setAiConfig(DEFAULT_AI_CONFIG)
  setActiveAiConfig(DEFAULT_AI_CONFIG)
  toast.success('Đã khôi phục cài đặt gốc!')
}

// Lưu lên Cloudflare D1 KV
const handleSaveAiConfigToCloud = async () => {
  try {
    setSavingAiConfig(true)
    const res = await fetch('https://ai-gateway-worker.trann46698.workers.dev/db/kv/prompt_studio:ai_config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiConfig),
    })
    if (!res.ok) throw new Error('Cloudflare KV error ' + res.status)
    toast.success('☁️ Đã đồng bộ cấu hình AI & Router lên Cloudflare D1 thành công!')
  } catch (e) {
    toast.error('Lỗi lưu Cloudflare KV: ' + e.message)
  } finally {
    setSavingAiConfig(false)
  }
}
\`\`\`

#### D. Giao diện View Switcher trên Banner:
Đặt trên đầu trang:
\`\`\`jsx
<div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
  <button
    onClick={() => setActiveView('prompts')}
    style={{
      padding: '8px 16px',
      borderRadius: 10,
      border: 'none',
      background: activeView === 'prompts' ? '#4F46E5' : 'rgba(255,255,255,0.12)',
      color: '#fff',
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
    }}
  >
    📝 8 Prompts Ứng Dụng
  </button>
  <button
    onClick={() => setActiveView('ai_config')}
    style={{
      padding: '8px 16px',
      borderRadius: 10,
      border: 'none',
      background: activeView === 'ai_config' ? '#10B981' : 'rgba(255,255,255,0.12)',
      color: '#fff',
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
    }}
  >
    ⚙️ Tham số AI & Router Sư phạm
  </button>
</div>
\`\`\`

#### E. Giao diện Cấu hình AI & Pedagogy Routing Table:
Khi \`activeView === 'ai_config'\`:
1. **Lưới chọn Model:** Render các thẻ card từ \`AVAILABLE_AI_MODELS\`. Thẻ nào được chọn hiển thị viền xanh lá \`#10B981\` và dấu tích \`✓ Đang kích hoạt\`.
2. **Sliders điều khiển:**
   - \`temperature\`: \`<input type="range" min="0" max="1" step="0.05" ... />\`. Hiển thị nhãn trực quan: \`< 0.2\` = "Chính xác tuyệt đối / Toán công thức", \`0.2 - 0.5\` = "Cân bằng / Sư phạm chuẩn", \`> 0.5\` = "Sáng tạo / Gợi ý mở".
   - \`max_tokens\`: \`<input type="range" min="256" max="4096" step="128" ... />\`.
   - \`timeout_ms\`: \`<input type="range" min="5000" max="60000" step="5000" ... />\`.
3. **Bảng Quy Tắc Sư Phạm:**
   - Nút \`➕ Thêm quy tắc mới\` ở góc phải.
   - Mỗi hàng quy tắc hiển thị:
     - Checkbox hoặc Switch Toggle Bật/Tắt.
     - Badge tiêu chí khớp: Môn (regex), Lớp (regex), Dạng bài (regex).
     - Tên quy tắc & Phương pháp (Singapore CPA, Inductive, Socratic...).
     - Câu lệnh chỉ dẫn cho AI (\`instruction\`).
     - Cụm nút hành động: \`✏️ Sửa\`, \`🗑️ Xoá\`.
4. **Cụm nút điều khiển dưới chân trang:**
   - \`☁️ Lưu cấu hình lên Cloudflare\`
   - \`↺ Khôi phục mặc định\`
5. **Modal thêm/sửa quy tắc (\`showRuleModal\`):**
   - Input tiêu đề quy tắc.
   - Input phương pháp sư phạm áp dụng.
   - 3 inputs tiêu chí regex: Môn học (vd: \`toán|math\`), Khối lớp (vd: \`1|2|3\`), Dạng bài (vd: \`lời văn|phép tính\`).
   - Textarea hướng dẫn sư phạm dành cho AI.
   - Checkbox kích hoạt quy tắc.

---

## 🚀 QUY TRÌNH KIỂM THỬ & DEPLOYMENT

1. **Kiểm tra build:**
   \`\`\`bash
   npm run build
   \`\`\`
   Đảm bảo không còn lỗi syntax hoặc JSX unclosed tags.

2. **Kiểm tra đồng bộ Cloudflare D1 KV:**
   - Mở Console / Network tab, bấm nút **\`☁️ Lưu cấu hình lên Cloudflare\`**.
   - Kiểm tra request \`PUT\` tới \`/db/kv/prompt_studio:ai_config\` trả về status 200.
   - F5 tải lại trang để xác nhận cấu hình vừa lưu được nạp chính xác.

3. **Kiểm tra Live Test:**
   - Chuyển sang tab **📝 8 Prompts Ứng Dụng**, chọn \`3. Soạn bài giảng gợi mở (Scaffold Socratic)\`.
   - Bấm nút **⚡ Chạy thử Prompt với AI**.
   - Xác nhận header của kết quả test hiển thị đúng tên Model AI và Temperature đã chọn bên tab Cấu hình.
`,
    createdAt: '2026-10-24 13:30',
    updatedAt: '2026-10-24 13:30',
  },
  {
    id: 'tp_prompt_06_enhancement',
    title: 'Prompt 06: Sửa Lỗi Nhanh, Bỏ Dữ Liệu Giả, Quyền Riêng Tư & Dọn Dẹp Mã Chết',
    category: 'socratic',
    targetAi: 'VideFlow',
    author: 'Huyền (Tech Lead)',
    isRunCompanyAi: false,
    runBy: '',
    runAt: '',
    aiResult: '',
    promptDetail: "# Prompt 06 · Sửa lỗi nhanh và bỏ dữ liệu giả (làm ngay, đợt 1)\r\n\r\n**Cách dùng:** copy phần PROMPT gửi cho AI lập trình, kèm source app (React + Vite).\r\n\r\n**Phụ thuộc:** không cần prompt nào khác. Làm trước hoặc song song với prompt 01 và 02. Các mục liên quan tới tài khoản, `learning_sessions`, admin đã nằm ở prompt 00, 03, 05; prompt này chỉ sửa những gì **app phụ huynh làm sai hoặc nói sai ngay bây giờ**.\r\n\r\n**Nguồn:** đọc mã bản đang chạy `kem-con-hoc-5xf.pages.dev` ngày 24/10/2026. Mỗi lỗi dưới đây đã được kiểm tra lại trực tiếp trong bundle (có trích chuỗi để tìm).\r\n\r\n**Vì sao quan trọng trước chung kết:** giám khảo bấm thử app với gia đình 2 con, hoặc hỏi \"dữ liệu lưu ở đâu\", sẽ gặp đúng các lỗi này.\r\n\r\n---\r\n\r\n## PROMPT\r\n\r\nBạn là kỹ sư frontend React của app **Kèm Con Học**. Sửa các lỗi và chỗ hiển thị sai dưới đây. Mỗi mục làm thành một commit riêng, có test hoặc bước kiểm tra tay. **Không đổi giao diện tổng thể, không đổi worker, không đổi luồng học** ngoài những gì ghi rõ.\r\n\r\n### A. Lỗi chức năng\r\n\r\n**A1. Đổi con ở màn chính làm app lỗi (gia đình từ 2 con)**\r\n- Hiện trạng: các chip chọn con trên màn chính gọi `patch({activeId: t.id})`, nhưng trong phạm vi đó **không có hàm `patch`**. Bấm chip sẽ gây `ReferenceError`. Đổi con ở tab \"Con tôi\" thì chạy được.\r\n- Sửa: dùng đúng hàm cập nhật state mà tab \"Con tôi\" đang dùng để đổi `activeId`. Giữ toast \"Đổi sang bé {tên} {emoji}\".\r\n- Kiểm tra: gia đình 2 con, bấm chip con thứ hai ở màn chính → đổi đúng con, không lỗi Console, các thẻ \"hay vướng\", sticker đổi theo con.\r\n\r\n**A2. Câu hỏi bằng giọng nói ở màn \"Hỏi con từng bước\" bị bỏ rơi**\r\n- Hiện trạng: ô \"💡 Mẹ cần AI gợi ý thêm cách giảng?\" có nút \"💬 Hỏi AI cách giảng\" và \"🎙️ Nói bằng giọng nói\". Chữ nhận từ giọng nói **chỉ hiện trong toast**, không được gửi cho AI.\r\n- Sửa:\r\n  - Thêm một ô nhập ngắn trong khung này (nếu chưa có), tối đa 200 ký tự. Chữ nhận từ giọng nói điền vào ô này, mẹ sửa được, rồi bấm \"Hỏi AI cách giảng\".\r\n  - Nội dung ô ghi chú được gửi kèm câu hỏi theo khung `p4b_parent_note_chat` (biến `{{ghi_chu}}`), như thiết kế Prompt Studio đã có nhưng app chưa nối.\r\n  - Mở màn \"Hỏi thêm AI\" với câu hỏi đầu tiên là nội dung đó.\r\n- Kiểm tra: nói \"con chưa học phép nhân\" → ô ghi chú có chữ đó → bấm hỏi → payload `/chat` chứa khung ghi chú, câu trả lời không dùng phép nhân.\r\n\r\n**A3. Màn \"Hỏi thêm AI\" không dùng prompt trong Prompt Studio**\r\n- Hiện trạng: `p4_chat` được định nghĩa trong Prompt Studio nhưng màn \"Hỏi thêm AI\" dùng **system prompt viết cứng** trong code, nên admin sửa `p4_chat` không có tác dụng.\r\n- Sửa: dùng `p4_chat` (bản đã lưu, có bản mặc định trong code làm dự phòng), điền đủ biến `{{mon}} {{lop}} {{sach}} {{dang_bai}} {{loi_hay_gap}} {{de_bai}} {{khung_ghi_chu}} {{doan_phuong_phap}}`. Luật \"không đưa đáp án cho trẻ\" phải có trong bản mặc định.\r\n- Kiểm tra: sửa một câu trong `p4_chat` ở Prompt Studio, lưu, mở app (xoá cache cấu hình) → câu trả lời thay đổi theo.\r\n\r\n**A4. Luật router \"Con bí lần 2 trở đi\" không bao giờ được dùng**\r\n- Hiện trạng: bảng router có luật `con_bi_lap_lai` (hạ bậc độ khó), hàm chọn phương pháp có tham số \"đang bí\", nhưng app **không truyền** tham số này ở đâu.\r\n- Sửa: khi con bấm \"❌ Con còn bí\" lần thứ 2 ở cùng một bậc, sheet \"Con bí 2 lần rồi 🙈\" thêm nút **\"🪜 Hạ độ khó\"**. Bấm thì gọi lại soạn bài với tham số đang bí bật, dùng đoạn phương pháp của luật `con_bi_lap_lai` (số nhỏ hơn rồi quay lại bài gốc). Có màn chờ ngắn như Analyze.\r\n- Kiểm tra: bí 2 lần → bấm \"Hạ độ khó\" → payload p3 có đoạn phương pháp của `con_bi_lap_lai`; kết quả có bậc dùng số nhỏ hơn.\r\n\r\n**A5. Lịch sử luôn ghi \"Toán lời văn 2 bước\"**\r\n- Hiện trạng: ở màn \"Xong bài\", hàm ghi lịch sử viết cứng `Toán lời văn 2 bước · {còn vướng | làm được}` bất kể con vừa làm bài gì.\r\n- Sửa: ghi theo bài thật: `{dang_bai của bài vừa làm} · {còn vướng | làm được}`. Không có `dang_bai` thì dùng 40 ký tự đầu của đề. Danh sách \"hay vướng\" / \"đã vững\" cũng cập nhật theo `dang_bai` thật.\r\n- Kiểm tra: làm một bài Tiếng Việt → lịch sử ghi đúng dạng bài Tiếng Việt.\r\n\r\n**A6. Mạng chậm thì lặng lẽ chuyển sang bài mẫu**\r\n- Hiện trạng: AI lỗi thì app chuyển sang bài mẫu viết sẵn, chỉ báo bằng một toast \"Mạng chậm\" kèm cụm \"đã chuyển sang bài mẫu\" (tìm cụm này trong code). Mẹ có thể giảng nhầm bài mẫu thay cho bài của con.\r\n- Sửa:\r\n  - Không tự chuyển. Hiện thẻ \"Mạng đang chậm, chưa soạn được bài của con\" với 2 nút \"Thử lại\" (nút chính) và \"Xem bài mẫu để làm quen\".\r\n  - Nếu mẹ chọn bài mẫu: mọi màn sau đó có dải nhãn **\"Đây là bài mẫu, không phải bài của con\"**.\r\n  - Bài mẫu không ghi vào lịch sử, không tính sticker.\r\n- Kiểm tra: chặn `/chat` trong DevTools → thấy thẻ 2 nút; chọn bài mẫu → có dải nhãn ở Explain, Scaffold, Done.\r\n\r\n### B. Dữ liệu giả trong app phụ huynh\r\n\r\n**B1. Trẻ mới tạo có sẵn 15 sticker mẫu**\r\n- Hiện trạng: mỗi trẻ mới được gán sẵn lịch sử 15 sticker mẫu (`stickerHistory` với `week:\"Tuần này\"`, timestamp lùi vài ngày), nên báo cáo và phần \"Biến động phẩm chất\" hiện xu hướng giả.\r\n- Sửa: trẻ mới có `stickerHistory: []`. Với trẻ đã có dữ liệu: **không xoá gì**, chỉ **đánh dấu** 15 bản ghi mẫu bằng trường `sample: true` (nhận ra bằng id `h1` đến `h15` và đúng bộ trường mẫu). Mọi chỗ tính toán (báo cáo tuần, \"Biến động phẩm chất\", số sticker, phần thưởng, admin, phân tích AI) **bỏ qua** bản ghi có `sample: true`. Sổ sticker không hiện các bản ghi này. Viết hàm đánh dấu chạy một lần, chạy lại không đổi gì, có test; lỡ đánh dấu nhầm thì chỉ cần bỏ cờ là khôi phục.\r\n- Báo cáo khi chưa có dữ liệu: thẻ trống \"Chưa có buổi học nào tuần này\" thay vì biểu đồ.\r\n\r\n**B2. Nhãn tuần cố định \"Tuần này\"**\r\n- Hiện trạng: mỗi sticker lưu chữ `week:\"Tuần này\"` hoặc `\"Tuần trước\"` cố định, không tự chuyển khi sang tuần mới; `calmLast` không bao giờ được cập nhật; `sessionsMom`, `sessionsDad`, `strong` không bao giờ tăng.\r\n- Sửa:\r\n  - Bỏ việc dựa vào chữ `week`; tính \"tuần này / tuần trước\" từ `timestamp` theo tuần bắt đầu thứ Hai, giờ Việt Nam.\r\n  - `calmWeek` / `calmLast` tính lại từ danh sách thời điểm bấm \"Bình tĩnh\" (lưu mảng `calmHistory` timestamp).\r\n  - Khi xong bài: tăng `sessionsMom` hoặc `sessionsDad` theo `parent` đang đăng nhập (tạm thời, prompt 03 sẽ thay bằng thành viên thật); thêm vào `strong` khi đánh giá \"làm được\".\r\n- Kiểm tra: đổi giờ máy sang tuần sau → sticker cũ chuyển sang \"tuần trước\".\r\n\r\n**B3. \"Độ tin cậy 98.6%\" ở màn Chụp đồ chơi**\r\n- Hiện trạng: con số **viết cứng**, không do AI trả về.\r\n- Sửa: bỏ con số. Thay bằng \"AI đoán đây là: **{tên đồ vật}**. Đúng chưa mẹ?\" với 2 nút \"Đúng rồi\" và \"Chọn đồ khác\" (dùng lại bộ chọn sửa hiện có).\r\n\r\n**B4. \"Ai kèm\" trong báo cáo có số mặc định**\r\n- Hiện trạng: số ca Mẹ/Bố lấy từ lịch chia ca, thiếu thì mặc định `4` và `1`.\r\n- Sửa: lấy từ `sessionsMom` / `sessionsDad` đã sửa ở B2; bằng 0 thì hiện 0. (Prompt 03 sẽ thay bằng số theo từng thành viên.)\r\n\r\n### C. Câu chữ hứa sai\r\n\r\n**C1. Quyền riêng tư**\r\n- Hiện trạng: tab \"Con tôi\" ghi \"Không lưu ảnh mặt con. Ảnh bài tập xóa sau 24 giờ. Dữ liệu chỉ ở trên máy bạn.\" trong khi **đồng bộ đám mây đang bật mặc định** (dữ liệu gia đình lưu trên máy chủ).\r\n- Sửa: thay bằng câu đúng với thực tế, ví dụ: \"Ảnh chỉ dùng để đọc đề, app không lưu ảnh. Hồ sơ, sticker, lịch sử học được lưu trên máy chủ để dùng được trên nhiều máy; mẹ có thể xoá toàn bộ bất cứ lúc nào.\"\r\n- **Kiểm tra với worker** xem ảnh có bị lưu ở đâu không (R2, log). Nếu worker có lưu ảnh thì ghi đúng thời gian xoá thật; nếu không lưu thì ghi \"không lưu\". Ghi kết quả kiểm tra vào báo cáo.\r\n- Câu \"🔒 Ảnh chỉ dùng để đọc đề, xóa sau 24 giờ\" ở màn Chụp bài: sửa cùng nội dung đã kiểm tra.\r\n\r\n**C2. Nhắc \"lúc 19:45\" chưa có**\r\n- Hiện trạng: onboarding và \"Lịch chia ca\" hứa \"người trực ca nhận nhắc lúc 19:45\", nhưng app **không có code nhắc** (không có service worker, không có thông báo).\r\n- Sửa (chưa làm thông báo đẩy):\r\n  - Đổi câu thành \"Người trực ca sẽ thấy lời nhắc khi mở app buổi tối\".\r\n  - Thêm dải nhắc trên màn chính từ 19:30 đến 21:30: \"Tối nay {Mẹ/Bố} trực ca kèm {tên con} 🌙\".\r\n  - Thông báo đẩy thật để sau (ghi trong prompt 03).\r\n\r\n### D. Dọn mã chết và tài nguyên thừa\r\n- Sheet `answerBlock` và `editOcr` không còn đường mở tới: xoá, hoặc nối lại nếu có lý do (ghi trong báo cáo).\r\n- Font **Lexend** được tải nhưng không dùng: bỏ khỏi thẻ `<link>`.\r\n- Biến CSS `--modal-title`, `--modal-sub` được dùng nhưng chưa định nghĩa: định nghĩa trong `:root`.\r\n- Hình chấm minh hoạ ở màn \"Trước khi giảng\" chỉ đúng với bài mẫu: chỉ hiện khi đang xem bài mẫu.\r\n\r\n### Không làm trong prompt này\r\n- Không đổi tài khoản, API, worker (prompt 00).\r\n- Không đổi giao diện tổng thể (prompt 01), không thêm kiểm tra phạm vi ảnh (prompt 02).\r\n\r\n### Kiểm thử bắt buộc\r\n1. Gia đình 2 con: đổi con ở màn chính không lỗi (A1).\r\n2. Ghi chú bằng giọng nói đi vào câu hỏi gửi AI (A2); sửa `p4_chat` có tác dụng (A3).\r\n3. Bí 2 lần, bấm \"Hạ độ khó\" ra bài dễ hơn (A4).\r\n4. Lịch sử ghi đúng dạng bài vừa làm (A5).\r\n5. Chặn `/chat`: không tự chuyển bài mẫu; chọn bài mẫu thì có nhãn ở mọi màn sau (A6).\r\n6. Trẻ mới không có sticker mẫu; trẻ cũ có đúng 15 bản ghi được đánh dấu `sample: true`, bản ghi thật không bị đánh dấu, không bản ghi nào bị xoá; báo cáo và số sticker không tính bản ghi mẫu (B1, test hàm đánh dấu).\r\n7. Đổi giờ máy sang tuần sau: tuần này / tuần trước tính đúng (B2).\r\n8. Không còn chuỗi \"98.6\", \"Dữ liệu chỉ ở trên máy bạn\", \"nhắc lúc 19:45\" trong `dist/`.\r\n9. `npm run build` thành công, không có lỗi Console ở 12 màn chính.\r\n\r\n### Báo lại khi xong\r\n- Danh sách commit theo mục A1 đến D.\r\n- Kết quả kiểm tra worker có lưu ảnh hay không (C1).\r\n- Kết quả 9 bước kiểm thử.\r\n",
    createdAt: '2026-10-24 18:00',
    updatedAt: '2026-10-24 18:00'
  },
  {
    id: 'tp_prompt_01_themes',
    title: 'Prompt 01: Hệ Thống 8 Bộ Giao Diện Gia Đình Đổi Một Chạm (Design Tokens & WCAG AA)',
    category: 'other',
    targetAi: 'VideFlow',
    author: 'Huyền (Tech Lead)',
    isRunCompanyAi: false,
    runBy: '',
    runAt: '',
    aiResult: '',
    promptDetail: "# Prompt 01 · Giao diện theo sở thích gia đình (8 bộ giao diện, đổi một chạm)\r\n\r\n**Cách dùng:** copy phần PROMPT gửi cho AI lập trình, kèm source app React + Vite và file thiết kế `tham-khao/8-bo-giao-dien-app.html` (mở bằng Chrome để xem 8 bộ x 8 màn).\r\n\r\n**Phụ thuộc:** làm độc lập được. Nếu đã làm prompt 00 thì lưu lựa chọn giao diện qua `PUT /api/v1/family/state`; nếu chưa thì lưu trong state JSON như hiện nay.\r\n\r\n**Ý tưởng:** mỗi gia đình một gu. Mặc định app mở bằng một bộ giao diện; bố mẹ vào \"Con tôi → Giao diện\" chọn bộ khác, **toàn app đổi ngay**, mọi thiết bị của gia đình cùng đổi theo. Trẻ cấp 1 thích \"Bạn Gấu\", \"Kẹo Bông\"; bố mẹ thích tối giản chọn \"Bento Mềm\"; học buổi tối chọn \"Khu Vườn Đêm\" dịu mắt.\r\n\r\n---\r\n\r\n## PROMPT\r\n\r\nBạn là kỹ sư frontend React. App **Kèm Con Học** hiện chỉ có một giao diện hồng (Be Vietnam Pro, biến CSS ở `:root`). Hãy dựng **hệ thống giao diện (theme)** với 8 bộ đã thiết kế, chọn được trong app, áp dụng cho **toàn bộ màn hình của phụ huynh** (không áp dụng cho trang admin).\r\n\r\n### Hiện trạng cần biết\r\n- Biến CSS hiện có trong `:root`: `--bg:#fff7f9; --paper:#fff; --line:#f4dde7; --soft:#fcefe3; --ink:#3a2a33; --muted:#6b5d6b; --plum:#d9577f; --plum-deep:#9e3159; --plum-tint:#fde8ef; --coral:#f08a5d; --coral-deep:#c75b2f; --coral-tint:#ffede3; --mint:#1f7a5c; --mint-deep:#14604a; --mint-tint:#ddf3ea; --sun:#9a6400; --sun-tint:#fff1d2; --sun-line:#f1d08a; --sky:#1f5c8c; --sky-tint:#e2eff9; --red:#a83232; --radius:16px; --shadow-sm/md/lg`.\r\n- Nhiều chỗ trong `screens.jsx` dùng **màu viết thẳng trong style inline** (hex). Các sticker dùng màu FontAwesome riêng.\r\n- Icon đang là emoji (📷 ⌨️ 🎙️ 🌙 🎲 📊 🧒...) và FontAwesome 6.5.1 qua CDN.\r\n- Không có theme switcher, không có dark mode, không có `data-theme`. Manifest `theme_color #FFF7ED`.\r\n- State gia đình là một khối JSON (`kem-con-hoc:fam:{id}` + KV `fam:{id}:state`), đồng bộ lên máy chủ.\r\n\r\n### Việc cần làm\r\n\r\n**1. Chuẩn hoá biến màu (bước bắt buộc, làm trước)**\r\n- Tạo bộ **biến ngữ nghĩa** dùng chung cho mọi theme: `--c-bg, --c-surface, --c-surface-2, --c-line, --c-text, --c-text-2, --c-accent, --c-accent-text, --c-accent-2, --c-good, --c-good-bg, --c-warn, --c-warn-bg, --c-danger, --c-read-bg, --c-read-text` (thẻ \"Mẹ đọc to cho con\"), `--c-hint1-bg, --c-hint1-line, --c-btn, --c-btn-text, --c-nav, --radius-lg, --radius-md, --radius-btn, --border-w, --shadow-card, --shadow-btn, --font-head, --font-body, --font-hand`.\r\n- Map biến cũ sang biến mới (`--plum: var(--c-accent)` ...) để code cũ không vỡ.\r\n- Rà toàn bộ `screens.jsx`, `ui.jsx`, `App.jsx`, `styles.css`: **thay mọi màu hex inline** ở màn phụ huynh bằng `var(--c-...)`. Ghi lại số chỗ đã thay trong báo cáo.\r\n\r\n**2. Bảng 8 bộ giao diện** (file `src/themes.js`, mỗi bộ là một object; giá trị lấy từ file thiết kế, xem bảng dưới)\r\n\r\n| id | Tên hiển thị | Nền / chữ chính | Màu nhấn | Font tiêu đề / thân | Hình dạng | Hiệu ứng riêng |\r\n|---|---|---|---|---|---|---|\r\n| `aurora` | Cực Quang | nền tối `#0B1026`, chữ `#F3F4FF` | `#22D3EE`, phụ `#A78BFA`, đúng `#34D399`, cảnh báo `#F472B6` | Unbounded / Plus Jakarta Sans | bo 24px, thẻ kính mờ (nền `rgba(255,255,255,.07)`, viền `rgba(255,255,255,.16)`) | lớp cực quang mờ trôi chậm phía sau, viền phát sáng |\r\n| `sticker` | Sticker Studio | `#FFF7E6` / `#1B1B2F` | hồng `#FF4F8B`, vàng `#FFC928`, xanh ngọc `#39C6A5`, xanh dương `#5B6CFF` | Paytone One / Nunito | viền đen 3px, bóng cứng `5px 5px 0 #1B1B2F`, bo 20px | nút chính nhún, ô dán nghiêng nhẹ |\r\n| `notebook` | Sổ Tay Buổi Tối | `#F6F1E7` / `#2A2622` | đất nung `#C4613A`, xanh rêu `#7D9A6B`, vàng `#D8A334` | Playfair Display / Lora, chữ tay Mali | bo 4px, nền giấy kẻ dòng | câu đọc to dạng trích dẫn ngoặc kép lớn, băng dính |\r\n| `bento` | Bento Mềm | `#F7F7FA` / `#15161E` | `#FF6B57`, phụ `#8A7CFF`, đúng `#22B07D` | **Lexend** / Inter (thiết kế gốc dùng Sora, nhưng Sora không có tiếng Việt) | bo 24px, viền 1px `#E9EAF1`, bóng mềm | thẻ chính gradient cam sang tím |\r\n| `garden` | Khu Vườn Đêm | nền tối `#0F2A24`, thẻ `#163B33`, chữ `#F2F7EE` | vàng đèn lồng `#FFD166`, đúng `#6EE7B7` | Comfortaa / Nunito | góc lá (28px 28px 28px 10px) | đom đóm bay, đèn lồng đung đưa |\r\n| `chalk` | Bảng Phấn | nền bảng `#2F4A41`, chữ phấn `#F6F1E6` | vàng `#F9E07F`, hồng `#F7A1C4`, xanh `#9AD0F5`, đúng `#B5E8A8` | Coiny / Nunito, chữ tay Itim | viền 2px vẽ tay (`border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px`) | ngôi sao phấn nhấp nháy |\r\n| `candy` | Kẹo Bông | `#FFF4F8` / `#4A3B5C` | hồng `#FF8FB8`, tím `#B9A3FF`, đúng `#7FD8C4`, vàng `#FFD36E` | Baloo 2 / Nunito | bo 28px, \"đáy kẹo dẻo\" `0 7px 0 #F3D9E6`, nút `0 6px 0 #E0598E` | mặt cười • ‿ • chớp mắt, sao lấp lánh, mây góc trên |\r\n| `bear` | Bạn Gấu | `#FFF8EC` / `#4B3621` | mật ong `#F6A623`, xanh trời `#7FB7F5`, đúng `#8CC98B` | Mitr / Nunito | bo 26px, nút `0 6px 0 #C47F0E` | gấu bông trên thẻ chính và bong bóng \"Gấu nhắc\", dấu chân mờ |\r\n\r\n- **Mặc định:** `DEFAULT_THEME = 'candy'` (gần màu hồng thương hiệu hiện tại nhất, người dùng cũ ít bị lạ). Chủ dự án có thể đổi hằng số này, hoặc admin đổi ở mục \"Giao diện app\" (bước 7).\r\n- **Lưu ý font:** đã kiểm tra trên Google Fonts ngày 24/10: **Sora không có bộ `vietnamese`** nên Bento dùng Lexend. Unbounded, Paytone One, Coiny, Itim, Mitr, Baloo 2, Comfortaa, Playfair Display, Lora, Mali, Nunito, Plus Jakarta Sans, Inter đều có. Vẫn hiển thị thử câu \"Mỗi hộp có 8 cây bút chì. Hỏi mẹ còn lại bao nhiêu?\" ở cả 8 bộ để chắc chắn.\r\n- **Tự host font** (file woff2 trong `public/fonts/`, chỉ bộ latin + vietnamese) thay vì tải từ Google Fonts: cần cho việc tạo ảnh báo cáo của prompt 03 (thư viện chụp ảnh không nhúng được font khác tên miền) và giúp tải nhanh hơn.\r\n- Theme tối (`aurora`, `garden`, `chalk`): đặt `color-scheme: dark`, đổi `<meta name=\"theme-color\">` theo theme.\r\n\r\n**3. Áp dụng theme**\r\n- `document.documentElement.dataset.theme = id`; CSS mỗi theme viết trong `[data-theme=\"...\"] { ...biến... }`.\r\n- **Chỉ tải font của theme đang dùng**: chèn `<link>` Google Fonts động khi đổi theme, có `display=swap`; tải trước font của theme mặc định trong `index.html`.\r\n- Theme được áp **trước khi React render** (script nhỏ trong `index.html` đọc `localStorage['kem-con-hoc:theme']`) để không nháy màu.\r\n- Chuyển theme có hiệu ứng mờ dần 250 ms (dùng View Transitions API nếu trình duyệt hỗ trợ, nếu không thì transition màu nền).\r\n\r\n**4. Thành phần trang trí theo theme** (`src/ThemeDecor.jsx`, mỗi theme một lớp nền `position:absolute; pointer-events:none; z-index:0`)\r\n- `aurora`: 3 đến 4 vệt màu blur trôi (CSS animation, không dùng canvas).\r\n- `garden`: 5 đốm đom đóm; đèn lồng trên thẻ \"Bài tối nay\".\r\n- `chalk`: ngôi sao phấn trên thẻ chính.\r\n- `candy`: mây trắng góc trên, sao vàng lấp lánh, mặt cười chớp mắt trên thẻ chính.\r\n- `bear`: hình gấu (thay emoji 🧸 bằng **SVG gấu tự vẽ** đơn giản, có 3 trạng thái: chào, nhắc, vui), dấu chân mờ.\r\n- `notebook`: nền giấy kẻ dòng, băng dính trên thẻ.\r\n- Trang trí **không được che chữ**, không nhận sự kiện bấm.\r\n\r\n**5. Icon đồng bộ**\r\n- Thay emoji ở **thanh điều hướng dưới, 3 nút nhập đề (Chụp vở, Gõ đề, Đọc đề), mic lớn, nút quay lại, loa, chat, chia sẻ** bằng bộ icon nét (gợi ý `lucide-react`, tree-shake từng icon). Màu theo `currentColor`.\r\n- Mục đang chọn ở thanh dưới có nền mờ màu nhấn phía sau icon.\r\n- Emoji trong nội dung (sticker, lời khen) giữ nguyên.\r\n\r\n**6. Màn chọn giao diện**\r\n- Vị trí: tab \"Con tôi\" → mục mới **\"🎨 Giao diện cả nhà\"**, đặt trên mục \"Lịch chia ca\".\r\n- Lưới 8 thẻ xem trước (mỗi thẻ là mini màn chính vẽ bằng chính biến màu của theme đó, không dùng ảnh), tên bộ, 1 dòng mô tả, nhãn \"Đang dùng\". **Thẻ xem trước dùng font hệ thống** (không tải 8 font cùng lúc); chỉ khi bấm chọn mới tải font của bộ đó.\r\n- Bấm thẻ: áp dụng ngay để xem thử; thanh dưới hiện \"Dùng giao diện này cho cả nhà\" và \"Thôi\". Rời màn mà không xác nhận thì quay về theme cũ.\r\n- Thêm vào **onboarding** một bước tuỳ chọn: \"Chọn giao diện con thích\" (có nút \"Để sau\").\r\n- Tuỳ chọn **\"Hiệu ứng: Đầy đủ / Nhẹ / Tắt\"** (mặc định Đầy đủ). Không tự tắt theo `prefers-reduced-motion` của hệ điều hành (máy công ty hay tắt sẵn), chỉ dùng nó để gợi ý mức \"Nhẹ\" lần đầu.\r\n\r\n**7. Lưu, đồng bộ và quyền**\r\n- **Ai được đổi:** chủ nhà và người \"Kèm con\" (vai trò `owner`, `guardian` của prompt 03). Người \"Chỉ xem\" (`viewer`) không thấy mục này. Trước khi có prompt 03, ai đăng nhập gia đình cũng đổi được.\r\n- Lưu `state.theme` và `state.motion` trong state gia đình (đồng bộ mọi thiết bị như dữ liệu khác) và `localStorage['kem-con-hoc:theme']` (để áp trước khi tải state).\r\n- Gia đình cũ chưa có `state.theme` → dùng theme mặc định do admin đặt (đọc từ cấu hình công khai, xem dưới), không có thì `DEFAULT_THEME`.\r\n- **Admin:** KV `app_config:themes = { default: 'candy', enabled: ['aurora',...,'bear'] }`. Admin bật/tắt bộ nào được hiện, đặt bộ mặc định, xem thống kê số gia đình đang dùng mỗi bộ (đếm từ `state.theme`).\r\n  - **Chỗ đặt:** nếu trang admin mới (prompt 05) chưa làm, thêm một khối nhỏ \"🎨 Giao diện app\" vào tab Prompt Studio của admin hiện tại; khi làm prompt 05 thì chuyển sang tab [5] Giao diện app.\r\n  - **Tắt một bộ đang có nhà dùng:** nhà đó vẫn giữ bộ hiện tại cho tới khi tự đổi; bộ bị tắt chỉ biến khỏi danh sách chọn.\r\n\r\n**8. Chất lượng**\r\n- Tương phản chữ thân trên nền đạt **WCAG AA (4.5:1)** ở cả 8 bộ; nút chính đạt 3:1. Viết test nhỏ tính tương phản từ bảng màu trong `themes.js`, chạy trong `npm test`.\r\n- Theme `aurora`: `backdrop-filter` nặng trên máy yếu → có lớp dự phòng nền đặc khi `@supports not (backdrop-filter: blur(1px))` hoặc khi chọn \"Hiệu ứng: Nhẹ\".\r\n- Kiểm tra trên màn 360px: không tràn ngang, chữ thân tối thiểu 15px, chữ nhỏ nhất 12px.\r\n\r\n### Không làm trong prompt này\r\n- Không đổi luồng, nội dung, logic AI. Ở trang admin chỉ thêm khối \"Giao diện app\" nêu ở bước 7, không đổi gì khác (việc làm lại admin thuộc prompt 05).\r\n- Không thêm thư viện UI nặng (MUI, Chakra...). Chỉ thêm `lucide-react` nếu cần.\r\n\r\n### Kiểm thử bắt buộc\r\n1. Đổi lần lượt 8 theme ở \"Giao diện cả nhà\": mọi màn (Home, Chụp bài, Analyze, Explain, Scaffold, Done, AskAI, SnapToy, Game, Report, Profile, các sheet) đổi màu, font, icon; không còn chỗ nào giữ màu hồng cũ (chụp ảnh 8 theme x 6 màn chính, đính kèm).\r\n2. Chọn theme trên máy A, mở máy B cùng gia đình: máy B đổi theo sau khi đồng bộ.\r\n3. Tải lại trang: không nháy màu theme cũ.\r\n4. Test tương phản qua ở cả 8 bộ; font có tiếng Việt đủ dấu ở cả 8 bộ.\r\n4b. Admin tắt bộ \"Bảng Phấn\" khi một nhà đang dùng: nhà đó vẫn giữ; nhà khác không còn thấy bộ này trong danh sách.\r\n4c. Mở màn chọn giao diện: tab Network không tải 8 font cùng lúc.\r\n5. \"Hiệu ứng: Tắt\" thì không còn animation trang trí; app vẫn đầy đủ chức năng.\r\n6. Lighthouse mobile: Performance không giảm quá 5 điểm so với trước.\r\n7. `npm run build` thành công.\r\n\r\n### Báo lại khi xong\r\n- File đã thêm/sửa, số chỗ màu inline đã thay.\r\n- Font nào đã thay vì thiếu tiếng Việt.\r\n- Ảnh chụp 8 theme x 6 màn, kết quả 7 bước kiểm thử.\r\n",
    createdAt: '2026-10-24 18:15',
    updatedAt: '2026-10-24 18:15'
  }
];

export default function TeamPromptSyncTab() {
  const [prompts, setPrompts] = useState(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (cached) {
        let list = JSON.parse(cached)
        // Lọc bỏ các demo prompt cũ, chỉ giữ prompt chuẩn của dự án
        list = list.filter((p) => !p.id.startsWith('tp_demo_'))
        INITIAL_TEAM_PROMPTS.forEach((initPrompt) => {
          const idx = list.findIndex((p) => p.id === initPrompt.id)
          if (idx !== -1) {
            list[idx] = { ...initPrompt, isRunCompanyAi: list[idx].isRunCompanyAi }
          } else {
            list.push(initPrompt)
          }
        })
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
        return list
      }
    } catch (e) {}
    return INITIAL_TEAM_PROMPTS
  })

  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterRunStatus, setFilterRunStatus] = useState('all') // 'all' | 'ran' | 'pending'
  const [expandedMap, setExpandedMap] = useState({})

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState('math')
  const [formTargetAi, setFormTargetAi] = useState('VideFlow')
  const [formAuthor, setFormAuthor] = useState(() => localStorage.getItem(LAST_AUTHOR_KEY) || 'Thành viên Team')
  const [formDetail, setFormDetail] = useState('')
  const [formIsRun, setFormIsRun] = useState(false)
  const [formRunBy, setFormRunBy] = useState('')
  const [formAiResult, setFormAiResult] = useState('')

  // Quick Test Playground state
  const [testingId, setTestingId] = useState(null)
  const [testResult, setTestResult] = useState(null)
  const [testRunning, setTestRunning] = useState(false)

  // 1. Đồng bộ ban đầu từ Cloud D1 KV
  useEffect(() => {
    fetchFromCloud()
  }, [])

  const fetchFromCloud = async () => {
    setLoading(true)
    try {
      const cloudData = await dbKvGet(TEAM_PROMPTS_KV_KEY)
      if (cloudData && Array.isArray(cloudData) && cloudData.length > 0) {
        setPrompts(cloudData)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudData))
        setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
        toast('Đã đồng bộ prompts mới nhất từ Cloud D1 ☁️')
      } else {
        // Chưa có dữ liệu trên cloud -> ghi dữ liệu ban đầu lên
        await dbKvSet(TEAM_PROMPTS_KV_KEY, prompts)
        setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }))
      }
    } catch (err) {
      console.warn('Load cloud prompts failed, using local cache:', err)
    } finally {
      setLoading(false)
    }
  }

  // 2. Lưu lên Cloud D1 KV & LocalStorage
  const savePromptsToCloud = async (newPromptsList, successMsg = 'Đã lưu & đồng bộ lên Cloud D1 ☁️') => {
    setSyncing(true)
    setPrompts(newPromptsList)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newPromptsList))
      await dbKvSet(TEAM_PROMPTS_KV_KEY, newPromptsList)
      setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      toast(successMsg)
    } catch (e) {
      toast('Lưu vào máy thành công (Mạng chậm khi đẩy lên Cloud)')
    } finally {
      setSyncing(false)
    }
  }

  // 3. Toggle trạng thái Đã chạy ở VideFlow trực tiếp
  const handleToggleRunStatus = async (item) => {
    const updatedStatus = !item.isRunCompanyAi
    const nowStr = new Date().toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    })

    const updatedList = prompts.map((p) => {
      if (p.id === item.id) {
        return {
          ...p,
          isRunCompanyAi: updatedStatus,
          runAt: updatedStatus ? (p.runAt || nowStr) : '',
          runBy: updatedStatus ? (p.runBy || formAuthor || 'Thành viên Team') : '',
          updatedAt: nowStr,
        }
      }
      return p
    })

    await savePromptsToCloud(
      updatedList,
      updatedStatus
        ? `✅ Đã đánh dấu "ĐÃ CHẠY Ở VIDEFLOW" cho: ${item.title.slice(0, 30)}…`
        : `⏳ Đã chuyển về "Chưa chạy ở VideFlow" cho: ${item.title.slice(0, 30)}…`
    )
  }

  // 4. Mở form thêm mới
  const handleOpenAdd = () => {
    setEditingId(null)
    setFormTitle('')
    setFormCategory('math')
    setFormTargetAi('VideFlow')
    setFormDetail('')
    setFormIsRun(false)
    setFormRunBy('')
    setFormAiResult('')
    setIsFormOpen(true)
  }

  // 5. Mở form sửa
  const handleOpenEdit = (item) => {
    setEditingId(item.id)
    setFormTitle(item.title)
    setFormCategory(item.category || 'math')
    setFormTargetAi(item.targetAi || 'VideFlow')
    setFormAuthor(item.author || '')
    setFormDetail(item.promptDetail || '')
    setFormIsRun(!!item.isRunCompanyAi)
    setFormRunBy(item.runBy || '')
    setFormAiResult(item.aiResult || '')
    setIsFormOpen(true)
  }

  // 6. Xóa prompt
  const handleDelete = async (item) => {
    if (!window.confirm(`Bạn có chắc muốn xóa prompt: "${item.title}"?`)) return
    const updated = prompts.filter((p) => p.id !== item.id)
    await savePromptsToCloud(updated, 'Đã xóa prompt khỏi danh sách')
  }

  // 7. Lưu form (Thêm hoặc Sửa)
  const handleSaveForm = async (e) => {
    e?.preventDefault()
    if (!formTitle.trim()) {
      alert('Vui lòng nhập Tiêu đề Prompt!')
      return
    }
    if (!formDetail.trim()) {
      alert('Vui lòng nhập Nội dung chi tiết của Prompt!')
      return
    }

    localStorage.setItem(LAST_AUTHOR_KEY, formAuthor.trim() || 'Thành viên Team')

    const nowStr = new Date().toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    })

    let updatedList = []

    if (editingId) {
      updatedList = prompts.map((p) => {
        if (p.id === editingId) {
          return {
            ...p,
            title: formTitle.trim(),
            category: formCategory,
            targetAi: formTargetAi,
            author: formAuthor.trim() || 'Thành viên Team',
            promptDetail: formDetail.trim(),
            isRunCompanyAi: formIsRun,
            runBy: formIsRun ? (formRunBy.trim() || formAuthor.trim() || 'Team') : '',
            runAt: formIsRun ? (p.runAt || nowStr) : '',
            aiResult: formAiResult.trim(),
            updatedAt: nowStr,
          }
        }
        return p
      })
    } else {
      const newPromptItem = {
        id: 'tp_' + Date.now(),
        title: formTitle.trim(),
        category: formCategory,
        targetAi: formTargetAi,
        author: formAuthor.trim() || 'Thành viên Team',
        promptDetail: formDetail.trim(),
        isRunCompanyAi: formIsRun,
        runBy: formIsRun ? (formRunBy.trim() || formAuthor.trim() || 'Team') : '',
        runAt: formIsRun ? nowStr : '',
        aiResult: formAiResult.trim(),
        createdAt: nowStr,
        updatedAt: nowStr,
      }
      updatedList = [newPromptItem, ...prompts]
    }

    await savePromptsToCloud(updatedList, editingId ? 'Đã cập nhật prompt thành công! ✨' : 'Đã gửi prompt mới lên bảng sync team! 🚀')
    setIsFormOpen(false)
  }

  // 8. Copy prompt 1 chạm
  const handleCopyPrompt = (text, title) => {
    navigator.clipboard.writeText(text)
    toast(`📋 Đã copy prompt: "${title.slice(0, 25)}…" vào clipboard!`)
  }

  // 9. Xuất danh sách Markdown để gửi Zalo/Slack cho team
  const handleExportSummary = () => {
    const lines = [
      `# 📋 BÁO CÁO ĐỒNG BỘ PROMPT TEAM (Cập nhật: ${new Date().toLocaleDateString('vi-VN')})`,
      `Tổng số: ${prompts.length} prompt | Đã chạy ở VideFlow: ${metrics.ranCount} | Chờ chạy: ${metrics.pendingCount}`,
      '------------------------------------------------------------',
    ]

    prompts.forEach((p, idx) => {
      lines.push(`${idx + 1}. [${p.isRunCompanyAi ? '✅ ĐÃ RUN VIDEFLOW' : '⏳ CHỜ RUN'}] ${p.title}`)
      lines.push(`   - Danh mục: ${p.category} | Model mục tiêu: ${p.targetAi}`)
      lines.push(`   - Người gửi: ${p.author} ${p.isRunCompanyAi ? `(Người check: ${p.runBy} lúc ${p.runAt})` : ''}`)
      if (p.aiResult) lines.push(`   - Kết quả/Feedback: ${p.aiResult}`)
      lines.push(`   - Nội dung tóm tắt: ${p.promptDetail.slice(0, 120).replace(/\n/g, ' ')}...`)
      lines.push('')
    })

    navigator.clipboard.writeText(lines.join('\n'))
    toast('📋 Đã copy toàn bộ bảng tổng hợp Markdown để gửi cho Team!')
  }

  // 10. Chạy thử nhanh qua AI Gateway
  const handleQuickTest = async (item) => {
    setTestingId(item.id)
    setTestRunning(true)
    setTestResult(null)
    const start = performance.now()
    try {
      const res = await fetch(`${AI_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: item.promptDetail },
            { role: 'user', content: 'Hãy thực hiện mẫu theo yêu cầu trong prompt.' },
          ],
          max_tokens: 600,
          temperature: 0.3,
        }),
      })

      if (!res.ok) throw new Error('Gateway trả về mã lỗi HTTP ' + res.status)
      const data = await res.json()
      const elapsed = Math.round((performance.now() - start) / 1000)
      setTestResult({
        success: true,
        text: data.response || '(Không có phản hồi)',
        elapsed,
      })
      toast(`⚡ Đã chạy thử xong qua AI Gateway (${elapsed}s)`)
    } catch (err) {
      setTestResult({
        success: false,
        text: 'Lỗi: ' + err.message,
      })
      toast('Chạy thử thất bại: ' + err.message)
    } finally {
      setTestRunning(false)
    }
  }

  // Thống kê nhanh
  const metrics = useMemo(() => {
    const total = prompts.length
    const ranCount = prompts.filter((p) => p.isRunCompanyAi).length
    const pendingCount = total - ranCount
    const percent = total > 0 ? Math.round((ranCount / total) * 100) : 0
    return { total, ranCount, pendingCount, percent }
  }, [prompts])

  // Lọc dữ liệu hiển thị
  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      // Tìm kiếm
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchTitle = (p.title || '').toLowerCase().includes(q)
        const matchDetail = (p.promptDetail || '').toLowerCase().includes(q)
        const matchAuthor = (p.author || '').toLowerCase().includes(q)
        const matchModel = (p.targetAi || '').toLowerCase().includes(q)
        if (!matchTitle && !matchDetail && !matchAuthor && !matchModel) return false
      }
      // Lọc danh mục
      if (filterCategory !== 'all' && p.category !== filterCategory) return false
      // Lọc trạng thái run cty
      if (filterRunStatus === 'ran' && !p.isRunCompanyAi) return false
      if (filterRunStatus === 'pending' && p.isRunCompanyAi) return false

      return true
    })
  }, [prompts, search, filterCategory, filterRunStatus])

  return (
    <div className="prompt-studio-root" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* 🚀 HEADER BANNER & KPI STATS */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
          borderRadius: 18,
          padding: '22px 26px',
          color: '#FFFFFF',
          boxShadow: '0 10px 30px -5px rgba(67, 56, 202, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 28 }}>🚀</span>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Bảng Đồng Bộ Prompt Team — VideFlow
              </h2>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                Syncup Hub
              </span>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#E0E7FF', maxWidth: 680, lineHeight: 1.5 }}>
              Không gian gửi, lưu trữ và theo dõi các Prompt chạy trên hệ thống VideFlow (hoặc Claude, ChatGPT) để team phối hợp nhịp nhàng.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={fetchFromCloud}
              disabled={loading || syncing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Kéo dữ liệu mới nhất từ Cloud D1"
            >
              <span>{loading ? '⏳' : '🔄'}</span>
              <span>{loading ? 'Đang sync…' : 'Đồng bộ Cloud'}</span>
            </button>

            <button
              onClick={handleExportSummary}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
              title="Copy tóm tắt Markdown để gửi Zalo/Slack"
            >
              <span>📋</span>
              <span>Xuất cho Team</span>
            </button>

            <button
              onClick={handleOpenAdd}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 18px',
                borderRadius: 10,
                background: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: 13.5,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                transition: 'transform 0.15s ease, background 0.15s ease',
              }}
            >
              <span style={{ fontSize: 16 }}>➕</span>
              <span>Gửi Prompt Mới Lên</span>
            </button>
          </div>
        </div>

        {/* BENTO KPI MINI BAR */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            paddingTop: 8,
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 11.5, color: '#C7D2FE', fontWeight: 600 }}>TỔNG SỐ PROMPTS</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 2 }}>{metrics.total}</div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: 11.5, color: '#A7F3D0', fontWeight: 700 }}>✅ ĐÃ CHẠY Ở VIDEFLOW</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#34D399', marginTop: 2 }}>{metrics.ranCount}</div>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontSize: 11.5, color: '#FDE68A', fontWeight: 700 }}>⏳ CHỜ CHẠY TEST</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#FBBF24', marginTop: 2 }}>{metrics.pendingCount}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 11.5, color: '#C7D2FE', fontWeight: 600 }}>TIẾN ĐỘ THỰC HIỆN</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 2 }}>{metrics.percent}%</div>
          </div>
        </div>

        {lastSyncTime && (
          <div style={{ fontSize: 11.5, color: 'rgba(255, 255, 255, 0.65)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>☁️</span>
            <span>Đồng bộ Cloud lần cuối: <b>{lastSyncTime}</b></span>
            {syncing && <span style={{ color: '#FCD34D' }}>• Đang lưu dữ liệu…</span>}
          </div>
        )}
      </div>

      {/* 🔍 FILTER & SEARCH BAR */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, nội dung, người tạo, model AI…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: 13.5,
              color: '#0F172A',
              background: 'transparent',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 14 }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Lọc trạng thái check cty */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: 3, borderRadius: 9 }}>
            <button
              type="button"
              onClick={() => setFilterRunStatus('all')}
              style={{
                border: 'none',
                padding: '5px 11px',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                background: filterRunStatus === 'all' ? '#FFFFFF' : 'transparent',
                color: filterRunStatus === 'all' ? '#0F172A' : '#64748B',
                boxShadow: filterRunStatus === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Tất cả ({metrics.total})
            </button>
            <button
              type="button"
              onClick={() => setFilterRunStatus('ran')}
              style={{
                border: 'none',
                padding: '5px 11px',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                background: filterRunStatus === 'ran' ? '#10B981' : 'transparent',
                color: filterRunStatus === 'ran' ? '#FFFFFF' : '#059669',
                boxShadow: filterRunStatus === 'ran' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              ✅ Đã chạy ({metrics.ranCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterRunStatus('pending')}
              style={{
                border: 'none',
                padding: '5px 11px',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                background: filterRunStatus === 'pending' ? '#F59E0B' : 'transparent',
                color: filterRunStatus === 'pending' ? '#FFFFFF' : '#D97706',
                boxShadow: filterRunStatus === 'pending' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              ⏳ Chưa chạy ({metrics.pendingCount})
            </button>
          </div>

          {/* Lọc danh mục */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              fontSize: 12.5,
              fontWeight: 600,
              color: '#334155',
              background: '#fff',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {PROMPT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 📝 DANH SÁCH PROMPTS CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredPrompts.length === 0 ? (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px dashed #CBD5E1',
              padding: '48px 24px',
              textAlign: 'center',
              color: '#64748B',
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#334155', margin: '0 0 6px' }}>
              Chưa có prompt nào phù hợp với bộ lọc
            </h3>
            <p style={{ fontSize: 13, margin: '0 0 16px', color: '#94A3B8' }}>
              Bấm nút bên dưới để gửi prompt mới lên cho team sync cùng nhé!
            </p>
            <button
              onClick={handleOpenAdd}
              style={{
                padding: '8px 18px',
                borderRadius: 9,
                background: '#4F46E5',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              ➕ Thêm Prompt Mới Ngay
            </button>
          </div>
        ) : (
          filteredPrompts.map((item, idx) => {
            const isExpanded = !!expandedMap[item.id]
            const isTestingThis = testingId === item.id
            const catObj = PROMPT_CATEGORIES.find((c) => c.id === item.category) || { name: 'Khác', icon: '🏷️' }

            return (
              <div
                key={item.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: item.isRunCompanyAi ? '1.5px solid #A7F3D0' : '1.5px solid #FDE68A',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* CARD HEADER */}
                <div
                  style={{
                    padding: '14px 18px',
                    background: item.isRunCompanyAi
                      ? 'linear-gradient(90deg, #F0FDF4 0%, #FFFFFF 100%)'
                      : 'linear-gradient(90deg, #FFFBEB 0%, #FFFFFF 100%)',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>#{idx + 1}</span>

                    {/* Tag danh mục */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 9px',
                        borderRadius: 6,
                        background: '#EEF2FF',
                        border: '1px solid #C7D2FE',
                        color: '#4338CA',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      <span>{catObj.icon}</span>
                      <span>{catObj.name}</span>
                    </span>

                    {/* Model AI công ty mục tiêu */}
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: 6,
                        background: '#F1F5F9',
                        color: '#334155',
                        fontSize: 11.5,
                        fontWeight: 600,
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      🤖 {item.targetAi || 'AI Công ty'}
                    </span>

                    {/* 🎯 NÚT TOGGLE CHECK ĐÃ CHẠY Ở VIDEFLOW CHƯA */}
                    <button
                      type="button"
                      onClick={() => handleToggleRunStatus(item)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 12px',
                        borderRadius: 20,
                        border: item.isRunCompanyAi ? '1.5px solid #10B981' : '1.5px dashed #F59E0B',
                        background: item.isRunCompanyAi ? '#ECFDF5' : '#FFFBEB',
                        color: item.isRunCompanyAi ? '#065F46' : '#B45309',
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title="Bấm để đổi trạng thái đã chạy thử ở VideFlow hay chưa"
                    >
                      <span>{item.isRunCompanyAi ? '✅' : '⏳'}</span>
                      <span>{item.isRunCompanyAi ? 'ĐÃ CHẠY Ở VIDEFLOW' : 'CHƯA CHẠY Ở VIDEFLOW (Bấm để check)'}</span>
                    </button>
                  </div>

                  {/* THAO TÁC (Sửa, Xóa, Copy) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => handleCopyPrompt(item.promptDetail, item.title)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 7,
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        color: '#334155',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title="Copy toàn bộ nội dung prompt"
                    >
                      📋 Copy
                    </button>

                    <button
                      onClick={() => handleOpenEdit(item)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 7,
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        color: '#2563EB',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title="Chỉnh sửa thông tin"
                    >
                      ✏️ Sửa
                    </button>

                    <button
                      onClick={() => handleDelete(item)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 7,
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title="Xóa prompt này"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* CARD BODY */}
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', lineHeight: 1.35 }}>
                      {item.title}
                    </h3>

                    <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span>👤 Người gửi: <b>{item.author || 'Thành viên Team'}</b></span>
                      <span>🕒 Tạo: {item.createdAt || 'Mới đây'}</span>
                      {item.isRunCompanyAi && item.runBy && (
                        <span style={{ color: '#059669', fontWeight: 600 }}>
                          • Check bởi: <b>{item.runBy}</b> ({item.runAt})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* PROMPT DETAIL BOX */}
                  <div
                    style={{
                      position: 'relative',
                      background: '#F8FAFC',
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        📄 Nội dung Prompt Detail:
                      </span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>
                        {item.promptDetail.length} ký tự
                      </span>
                    </div>

                    <pre
                      style={{
                        margin: 0,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: 12.5,
                        color: '#1E293B',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxHeight: isExpanded ? 'none' : '110px',
                        overflow: 'hidden',
                      }}
                    >
                      {item.promptDetail}
                    </pre>

                    {item.promptDetail.length > 200 && (
                      <button
                        type="button"
                        onClick={() => setExpandedMap((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                        style={{
                          marginTop: 6,
                          background: 'none',
                          border: 'none',
                          color: '#4F46E5',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        {isExpanded ? '▲ Thu gọn' : '▼ Xem đầy đủ prompt…'}
                      </button>
                    )}
                  </div>

                  {/* PHẦN GHI CHÚ KẾT QUẢ VIDEFLOW */}
                  {item.aiResult && (
                    <div
                      style={{
                        background: '#ECFDF5',
                        borderLeft: '4px solid #10B981',
                        borderRadius: '0 8px 8px 0',
                        padding: '10px 14px',
                        fontSize: 12.5,
                        color: '#065F46',
                      }}
                    >
                      <b style={{ display: 'block', marginBottom: 2 }}>📝 Phản hồi & Kết quả chạy ở VideFlow:</b>
                      <span style={{ whiteSpace: 'pre-wrap' }}>{item.aiResult}</span>
                    </div>
                  )}

                  {/* QUICK TEST FOOTER */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, paddingTop: 4 }}>
                    <button
                      type="button"
                      disabled={testRunning}
                      onClick={() => handleQuickTest(item)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: '#EEF2FF',
                        border: '1px solid #C7D2FE',
                        color: '#4338CA',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title="Chạy thử mẫu prompt này trực tiếp qua AI Gateway"
                    >
                      <span>⚡</span>
                      <span>{isTestingThis && testRunning ? 'Đang chạy thử…' : 'Chạy thử qua AI Gateway'}</span>
                    </button>

                    <span style={{ fontSize: 11.5, color: '#94A3B8' }}>
                      Cập nhật lần cuối: {item.updatedAt || item.createdAt}
                    </span>
                  </div>

                  {/* KẾT QUẢ TEST THỬ REALTIME NẾU CÓ */}
                  {isTestingThis && testResult && (
                    <div
                      style={{
                        marginTop: 4,
                        background: testResult.success ? '#F0FDF4' : '#FEF2F2',
                        borderRadius: 10,
                        border: testResult.success ? '1px solid #BBF7D0' : '1px solid #FECACA',
                        padding: '12px',
                        fontSize: 12.5,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontWeight: 700 }}>
                        <span style={{ color: testResult.success ? '#15803D' : '#B91C1C' }}>
                          {testResult.success ? `✨ Kết quả trả về (${testResult.elapsed}s):` : '❌ Có lỗi khi gọi Gateway:'}
                        </span>
                        <button
                          onClick={() => {
                            setTestingId(null)
                            setTestResult(null)
                          }}
                          style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                        >
                          Đóng ✕
                        </button>
                      </div>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#1E293B', fontFamily: 'inherit' }}>
                        {testResult.text}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 🚀 MODAL / FORM THÊM & SỬA PROMPT */}
      {isFormOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFormOpen(false)
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 18,
              width: '100%',
              maxWidth: 700,
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            {/* MODAL HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                  {editingId ? '✏️ Chỉnh Sửa Prompt Sync' : '🚀 Gửi Prompt Mới Lên Cho Team'}
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#64748B' }}>
                  Thông tin sẽ được tự động lưu lên Cloud D1 để toàn bộ team cùng xem và theo dõi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  fontSize: 16,
                  cursor: 'pointer',
                  color: '#64748B',
                }}
              >
                ✕
              </button>
            </div>

            {/* FORM BODY */}
            <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Tiêu đề prompt */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Tiêu đề Prompt <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Prompt Singapore CPA Toán lớp 3 giải bài toán 2 bước"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 9,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 13.5,
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Danh mục & Model AI mục tiêu */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Danh mục chuyên môn
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 11px',
                      borderRadius: 8,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 13,
                      fontWeight: 600,
                      background: '#fff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    {PROMPT_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    AI Model công ty mục tiêu
                  </label>
                  <select
                    value={formTargetAi}
                    onChange={(e) => setFormTargetAi(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 11px',
                      borderRadius: 8,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 13,
                      fontWeight: 600,
                      background: '#fff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    {COMPANY_AI_MODELS.map((m) => (
                      <option key={m} value={m}>
                        🤖 {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Người gửi */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Tên người gửi / Thành viên tạo
                </label>
                <input
                  type="text"
                  placeholder="VD: Huyền, Nam AI, Linh..."
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Prompt Detail Textarea */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                    Nội dung chi tiết Prompt <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: 11.5, color: '#64748B' }}>
                    {formDetail.length} ký tự
                  </span>
                </div>
                <textarea
                  required
                  rows={8}
                  placeholder="Dán toàn bộ System Prompt / Instructions chi tiết tại đây (hỗ trợ {{mon}}, {{lop}}, {{de_bai}}...)"
                  value={formDetail}
                  onChange={(e) => setFormDetail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* 🎯 CHECKLIST: ĐÃ RUN Ở VIDEFLOW CHƯA */}
              <div
                style={{
                  background: formIsRun ? '#ECFDF5' : '#FFFBEB',
                  borderRadius: 10,
                  border: formIsRun ? '1.5px solid #10B981' : '1.5px solid #FCD34D',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formIsRun}
                    onChange={(e) => setFormIsRun(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#10B981', cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: formIsRun ? '#065F46' : '#92400E' }}>
                      {formIsRun ? '✅ Đã chạy thử nghiệm ở VideFlow' : '⏳ Chưa chạy thử nghiệm ở VideFlow'}
                    </span>
                    <span style={{ display: 'block', fontSize: 11.5, color: '#64748B' }}>
                      (Tích vào đây nếu team đã test prompt này trên VideFlow)
                    </span>
                  </div>
                </label>

                {formIsRun && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 6, borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#065F46', display: 'block', marginBottom: 3 }}>
                        Người đã chạy test:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Huyền, Nam..."
                        value={formRunBy}
                        onChange={(e) => setFormRunBy(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: 6,
                          border: '1px solid #A7F3D0',
                          fontSize: 12.5,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#065F46', display: 'block', marginBottom: 3 }}>
                        Nhận xét / Kết quả chạy thử:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ghi chú kết quả: Model chạy ổn không, có lỗi JSON không, cần tinh chỉnh gì không..."
                        value={formAiResult}
                        onChange={(e) => setFormAiResult(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: 6,
                          border: '1px solid #A7F3D0',
                          fontSize: 12.5,
                          boxSizing: 'border-box',
                          resize: 'vertical',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER BUTTONS */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 9,
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={syncing}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 9,
                    background: '#4F46E5',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                  }}
                >
                  {syncing ? 'Đang lưu…' : '💾 Lưu & Đồng bộ Cloud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
