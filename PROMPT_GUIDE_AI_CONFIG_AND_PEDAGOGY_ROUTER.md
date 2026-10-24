# PROMPT TRIỂN KHAI KỸ THUẬT: ADMIN AI CONFIG & BẢNG ĐIỀU PHỐI SƯ PHẠM ĐỘNG (DYNAMIC PEDAGOGY ROUTER)

Bạn là kỹ sư Fullstack / Frontend React cao cấp. Hãy nâng cấp hệ thống quản trị **Prompt Studio** trong ứng dụng **Kèm Con Học** (React + Vite) bằng cách chuyển toàn bộ các tham số sinh AI (Model AI, Temperature, Max Tokens, Timeout) và bộ điều phối phương pháp sư phạm (Singapore CPA, Inductive, Deductive, Socratic...) thành **cấu hình động có thể quản trị trực quan trên Admin** và **đồng bộ 2 chiều lên Cloudflare D1 KV**.

---

## 🎯 MỤC TIÊU VÀ BỐI CẢNH

1. **Hiện trạng cũ:**
   - Các tham số sinh AI như `temperature: 0.3`, `max_tokens: 1500`, model AI đang bị gán tĩnh (hardcode) trong code frontend hoặc worker.
   - Hàm `routePedagogyMethod` trong `src/promptStudio.js` dùng các câu lệnh `if/else` cứng, muốn thêm/sửa phương pháp giảng dạy sư phạm cho môn mới hoặc đổi câu lệnh hướng dẫn AI đều phải sửa code và deploy lại.
2. **Yêu cầu nâng cấp:**
   - **AI Model & Inference Sliders:** Cho phép Admin chọn model AI (Cloudflare Llama 3.3 70B, VideFlow AI Gateway, Claude 3.7 Sonnet, OpenAI GPT-4o, Google Gemini 1.5 Pro) và kéo thanh trượt điều chỉnh `temperature` (0.0 – 1.0), `max_tokens` (256 – 4096), `timeout_ms` (5s – 60s).
   - **Pedagogy Routing Table (Bảng điều phối sư phạm động):** Chuyển toàn bộ quy tắc sư phạm thành danh sách quy tắc (rules) có thể: Bật/Tắt (Toggle), Chỉnh sửa (Edit regex match môn, lớp, dạng bài, câu lệnh sư phạm `instruction`), Xoá và Thêm quy tắc mới (Add custom rule).
   - **Đồng bộ Cloudflare D1 KV:** Lưu và đọc cấu hình cấu trúc JSON từ Cloudflare KV tại key `prompt_studio:ai_config`.
   - **Live Test Bench:** Khi chạy thử prompt ở tab bên cạnh, test bench tự động sử dụng Model và Temperature mà Admin đã cấu hình.

---

## 🛠 HƯỚNG DẪN TRIỂN KHAI CHI TIẾT THEO TỪNG FILE

### 1. Cập nhật `src/promptStudio.js`

Thêm cấu hình mặc định `DEFAULT_AI_CONFIG`, key lưu trữ `PROMPT_AI_CONFIG_KEY`, các hàm get/set cache, và viết lại hàm `routePedagogyMethod` để duyệt động qua mảng `pedagogy_routing`:

```javascript
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
        doan_phuong_phap: `- Phương pháp: ${item.methods}\n- Hướng dẫn thực hiện: ${item.instruction}\n- Cuối bài: Áp dụng Metacognitive ("Con dạy lại mẹ" và hỏi lần sau gặp bài này con làm bước nào trước).`,
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
        doan_phuong_phap: `- Phương pháp: ${item.methods}\n- Hướng dẫn thực hiện: ${item.instruction}\n- Cuối bài: Áp dụng Metacognitive ("Con dạy lại mẹ" và hỏi lần sau gặp bài này con làm bước nào trước).`,
      }
    }
  }

  const def = activeRules[0] || DEFAULT_AI_CONFIG.pedagogy_routing[0]
  return {
    phuong_phap: def.methods,
    doan_phuong_phap: `- Phương pháp: ${def.methods}\n- Hướng dẫn thực hiện: ${def.instruction}\n- Cuối bài: Áp dụng Metacognitive ("Con dạy lại mẹ" và hỏi lần sau gặp bài này con làm bước nào trước).`,
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
```

---

### 2. Cập nhật `src/api.js`

Trong hàm gọi AI giảng bài (`aiExplain`), thay thế các giá trị tham số cứng bằng giá trị lấy từ `getActiveAiConfig()`:

```javascript
import { getActiveAiConfig } from './promptStudio'

// Trong hàm aiExplain({ problemText, grade, subject, ... }):
const aiCfg = getActiveAiConfig()

const response = await fetchWithTimeout(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
  },
  body: JSON.stringify({
    prompt: finalPrompt,
    max_tokens: aiCfg.max_tokens || 1500,
    temperature: typeof aiCfg.temperature === 'number' ? aiCfg.temperature : 0.3,
    model: aiCfg.model || 'cloudflare-llama-3.3-70b',
  }),
  timeoutMs: aiCfg.timeout_ms || 30000,
})
```

---

### 3. Cập nhật `src/PromptStudioTab.jsx`

#### A. Định nghĩa danh sách Models có sẵn:
```javascript
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
```

#### B. Thêm State Quản trị & Điều hướng View:
```javascript
// Quản lý chuyển tab: 'prompts' | 'ai_config'
const [activeView, setActiveView] = useState('prompts')

// Quản lý AI Config
const [aiConfig, setAiConfig] = useState(() => getActiveAiConfig())
const [savingAiConfig, setSavingAiConfig] = useState(false)
const [editingRule, setEditingRule] = useState(null)
const [showRuleModal, setShowRuleModal] = useState(false)
```

#### C. Thêm các hàm xử lý tương tác:
```javascript
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
```

#### D. Giao diện View Switcher trên Banner:
Đặt trên đầu trang:
```jsx
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
```

#### E. Giao diện Cấu hình AI & Pedagogy Routing Table:
Khi `activeView === 'ai_config'`:
1. **Lưới chọn Model:** Render các thẻ card từ `AVAILABLE_AI_MODELS`. Thẻ nào được chọn hiển thị viền xanh lá `#10B981` và dấu tích `✓ Đang kích hoạt`.
2. **Sliders điều khiển:**
   - `temperature`: `<input type="range" min="0" max="1" step="0.05" ... />`. Hiển thị nhãn trực quan: `< 0.2` = "Chính xác tuyệt đối / Toán công thức", `0.2 - 0.5` = "Cân bằng / Sư phạm chuẩn", `> 0.5` = "Sáng tạo / Gợi ý mở".
   - `max_tokens`: `<input type="range" min="256" max="4096" step="128" ... />`.
   - `timeout_ms`: `<input type="range" min="5000" max="60000" step="5000" ... />`.
3. **Bảng Quy Tắc Sư Phạm:**
   - Nút `➕ Thêm quy tắc mới` ở góc phải.
   - Mỗi hàng quy tắc hiển thị:
     - Checkbox hoặc Switch Toggle Bật/Tắt.
     - Badge tiêu chí khớp: Môn (regex), Lớp (regex), Dạng bài (regex).
     - Tên quy tắc & Phương pháp (Singapore CPA, Inductive, Socratic...).
     - Câu lệnh chỉ dẫn cho AI (`instruction`).
     - Cụm nút hành động: `✏️ Sửa`, `🗑️ Xoá`.
4. **Cụm nút điều khiển dưới chân trang:**
   - `☁️ Lưu cấu hình lên Cloudflare`
   - `↺ Khôi phục mặc định`
5. **Modal thêm/sửa quy tắc (`showRuleModal`):**
   - Input tiêu đề quy tắc.
   - Input phương pháp sư phạm áp dụng.
   - 3 inputs tiêu chí regex: Môn học (vd: `toán|math`), Khối lớp (vd: `1|2|3`), Dạng bài (vd: `lời văn|phép tính`).
   - Textarea hướng dẫn sư phạm dành cho AI.
   - Checkbox kích hoạt quy tắc.

---

## 🚀 QUY TRÌNH KIỂM THỬ & DEPLOYMENT

1. **Kiểm tra build:**
   ```bash
   npm run build
   ```
   Đảm bảo không còn lỗi syntax hoặc JSX unclosed tags.

2. **Kiểm tra đồng bộ Cloudflare D1 KV:**
   - Mở Console / Network tab, bấm nút **`☁️ Lưu cấu hình lên Cloudflare`**.
   - Kiểm tra request `PUT` tới `/db/kv/prompt_studio:ai_config` trả về status 200.
   - F5 tải lại trang để xác nhận cấu hình vừa lưu được nạp chính xác.

3. **Kiểm tra Live Test:**
   - Chuyển sang tab **📝 8 Prompts Ứng Dụng**, chọn `3. Soạn bài giảng gợi mở (Scaffold Socratic)`.
   - Bấm nút **⚡ Chạy thử Prompt với AI**.
   - Xác nhận header của kết quả test hiển thị đúng tên Model AI và Temperature đã chọn bên tab Cấu hình.
