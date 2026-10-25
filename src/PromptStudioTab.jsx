import { useState, useEffect, useMemo, useRef } from 'react'
import {
  DEFAULT_PROMPTS,
  getActivePrompts,
  setActivePrompts,
  renderPrompt,
  PROMPT_HISTORY_KEY,
  routePedagogyMethod,
  DEFAULT_AI_CONFIG,
  getActiveAiConfig,
  setActiveAiConfig,
  PROMPT_AI_CONFIG_KEY,
} from './promptStudio'
import { dbKvGet, dbKvSet, AI_GATEWAY } from './api'
import { toast } from './utils'
import { AdminThemesSection } from './AdminThemesSection'
import { AdminScopeSection } from './AdminScopeSection'
import aiEvalResult from '../ai-eval/latest-result.json'

export const AVAILABLE_AI_MODELS = [
  {
    id: 'cloudflare-llama-3.3-70b',
    name: 'Cloudflare Llama 3.3 70B',
    provider: 'Cloudflare Workers AI',
    badge: 'Mặc định & Siêu tốc',
    badgeColor: '#10B981',
    icon: '⚡',
    desc: 'Chạy trực tiếp trên Cloudflare AI Edge, độ trễ cực thấp (<2s), chi phí tối ưu.',
  },
  {
    id: 'gemini-1-5-flash',
    name: 'Google Gemini 1.5 Flash',
    provider: 'Google AI',
    badge: 'Đa phương tiện & Tốc độ',
    badgeColor: '#4285F4',
    icon: '✨',
    desc: 'Xử lý hình ảnh và văn bản tốc độ cao, hỗ trợ phân tích đề bài trực quan.',
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    badge: 'Sư phạm Chuyên Sâu',
    badgeColor: '#8B5CF6',
    icon: '🧠',
    desc: 'Khả năng lập luận logic sư phạm và tâm lý trẻ tiểu học cao cấp nhất hiện nay.',
  },
  {
    id: 'gpt-4o',
    name: 'ChatGPT GPT-4o',
    provider: 'OpenAI',
    badge: 'Đa nhiệm & Toán học',
    badgeColor: '#0EA5E9',
    icon: '✨',
    desc: 'Model đa nhiệm phổ biến, giải toán có lời văn và phân tích cấu trúc bài chặt chẽ.',
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google AI',
    badge: 'Ngữ cảnh Mở rộng',
    badgeColor: '#F59E0B',
    icon: '🔮',
    desc: 'Khả năng hiểu ngữ cảnh văn bản dài và liên kết các chủ đề bài học tiểu học.',
  },
]

export const PARAM_CONFIG = {
  '{{lop}}': {
    name: 'Khối lớp',
    bg: '#ECFDF5',
    border: '#10B981',
    text: '#047857',
    markBg: 'rgba(16, 185, 129, 0.28)',
    underline: '#10B981',
    icon: '🎒',
  },
  '{{sach}}': {
    name: 'Bộ sách',
    bg: '#EFF6FF',
    border: '#3B82F6',
    text: '#1D4ED8',
    markBg: 'rgba(59, 130, 246, 0.28)',
    underline: '#3B82F6',
    icon: '📚',
  },
  '{{giong}}': {
    name: 'Giọng gợi ý',
    bg: '#F5F3FF',
    border: '#8B5CF6',
    text: '#6D28D9',
    markBg: 'rgba(139, 92, 246, 0.28)',
    underline: '#8B5CF6',
    icon: '🗣️',
  },
  '{{mo_ta_giong}}': {
    name: 'Mô tả giọng',
    bg: '#FDF4FF',
    border: '#D946EF',
    text: '#A21CAF',
    markBg: 'rgba(217, 70, 239, 0.28)',
    underline: '#D946EF',
    icon: '✨',
  },
  '{{de_bai}}': {
    name: 'Đề bài toán',
    bg: '#FFFBEB',
    border: '#F59E0B',
    text: '#B45309',
    markBg: 'rgba(245, 158, 11, 0.35)',
    underline: '#F59E0B',
    icon: '📝',
  },
  '{{khung_ghi_chu}}': {
    name: 'Khung ghi chú',
    bg: '#FFF1F2',
    border: '#F43F5E',
    text: '#BE123C',
    markBg: 'rgba(244, 63, 94, 0.28)',
    underline: '#F43F5E',
    icon: '📌',
  },
  '{{ghi_chu}}': {
    name: 'Lời nhắn phụ huynh',
    bg: '#F0FDFA',
    border: '#14B8A6',
    text: '#0F766E',
    markBg: 'rgba(20, 184, 166, 0.28)',
    underline: '#14B8A6',
    icon: '💬',
  },
  '{{mon}}': {
    name: 'Môn học',
    bg: '#E0F2FE',
    border: '#0284C7',
    text: '#0369A1',
    markBg: 'rgba(2, 132, 199, 0.28)',
    underline: '#0284C7',
    icon: '📘',
  },
  '{{dang_bai}}': {
    name: 'Dạng bài',
    bg: '#FEF3C7',
    border: '#D97706',
    text: '#B45309',
    markBg: 'rgba(217, 119, 6, 0.28)',
    underline: '#D97706',
    icon: '🎯',
  },
  '{{loi_hay_gap}}': {
    name: 'Lỗi hay gặp',
    bg: '#FFE4E6',
    border: '#E11D48',
    text: '#BE123C',
    markBg: 'rgba(225, 29, 72, 0.28)',
    underline: '#E11D48',
    icon: '⚠️',
  },
  '{{doan_phuong_phap}}': {
    name: 'Phương pháp Router',
    bg: '#F3E8FF',
    border: '#9333EA',
    text: '#7E22CE',
    markBg: 'rgba(147, 51, 234, 0.28)',
    underline: '#9333EA',
    icon: '💡',
  },
}

export function getParamStyle(tag) {
  return (
    PARAM_CONFIG[tag] || {
      name: tag.replace(/[{}]/g, ''),
      bg: '#F1F5F9',
      border: '#64748B',
      text: '#334155',
      markBg: 'rgba(100, 116, 139, 0.22)',
      underline: '#64748B',
      icon: '🏷️',
    }
  )
}

export default function PromptStudioTab() {
  const [activeView, setActiveView] = useState('prompts') // 'prompts' | 'ai_config'
  const [prompts, setPrompts] = useState(() => getActivePrompts())
  const [selectedKey, setSelectedKey] = useState('p3_explain')
  const [drafts, setDrafts] = useState(() => {
    const init = {}
    const active = getActivePrompts()
    Object.keys(DEFAULT_PROMPTS).forEach((k) => {
      init[k] = active[k]?.template || DEFAULT_PROMPTS[k].template
    })
    return init
  })

  // Cấu hình tham số AI & Router Sư phạm
  const [aiConfig, setAiConfig] = useState(() => getActiveAiConfig())
  const [savingAiConfig, setSavingAiConfig] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [showRuleModal, setShowRuleModal] = useState(false)

  // Secret admin key (nhập tạm trong tab, không lưu local cố định)
  const [adminKey, setAdminKey] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [versionNote, setVersionNote] = useState('')

  // Lịch sử phiên bản
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(PROMPT_HISTORY_KEY)
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  // Chạy thử (Test runner)
  const [testMon, setTestMon] = useState('Toán')
  const [testLop, setTestLop] = useState('Lớp 2')
  const [testSach, setTestSach] = useState('Kết nối tri thức')
  const [testGiong, setTestGiong] = useState('Dịu dàng')
  const [testDeBai, setTestDeBai] = useState('Mẹ mua 9 quả táo. Mẹ cho Na 3 quả. Hỏi mẹ còn mấy quả táo?')
  const [testGhiChu, setTestGhiChu] = useState('Con chưa học phép nhân, giảng bằng phép cộng/trừ nhé.')
  const [testRunning, setTestRunning] = useState(false)
  const [testOutput, setTestOutput] = useState(null)
  const [testChecks, setTestChecks] = useState([])
  const [testDuration, setTestDuration] = useState(0)

  // Load cloud prompts & AI config on mount
  useEffect(() => {
    dbKvGet('prompt_studio:config').then((cloudVal) => {
      if (cloudVal && typeof cloudVal === 'object') {
        const merged = setActivePrompts(cloudVal)
        setPrompts(merged)
        setDrafts((prev) => {
          const updated = { ...prev }
          Object.keys(DEFAULT_PROMPTS).forEach((k) => {
            if (merged[k]?.template) updated[k] = merged[k].template
          })
          return updated
        })
      }
    })

    dbKvGet('prompt_studio:ai_config').then((cloudAiVal) => {
      if (cloudAiVal && typeof cloudAiVal === 'object') {
        const merged = setActiveAiConfig(cloudAiVal)
        setAiConfig(merged)
      }
    })
  }, [])

  // Handlers cho AI Config
  const handleUpdateAiParam = (key, val) => {
    const updated = { ...aiConfig, [key]: val }
    setAiConfig(updated)
    setActiveAiConfig(updated)
  }

  const handleToggleRule = (ruleId) => {
    const updatedList = (aiConfig.pedagogy_routing || []).map((r) => {
      if (r.id === ruleId) return { ...r, enabled: r.enabled === false ? true : false }
      return r
    })
    const updated = { ...aiConfig, pedagogy_routing: updatedList }
    setAiConfig(updated)
    setActiveAiConfig(updated)
    toast('Đã cập nhật trạng thái quy tắc sư phạm!')
  }

  const handleOpenAddRule = () => {
    setEditingRule({
      id: 'rule_' + Date.now(),
      title: '',
      methods: '',
      instruction: '',
      matchSubject: 'toán|math',
      matchGrade: 'all',
      matchTopic: '',
      enabled: true,
    })
    setShowRuleModal(true)
  }

  const handleOpenEditRule = (rule) => {
    setEditingRule({ ...rule })
    setShowRuleModal(true)
  }

  const handleSaveRule = (e) => {
    e.preventDefault()
    if (!editingRule.title.trim() || !editingRule.methods.trim()) {
      alert('Vui lòng nhập Tên quy tắc và Phương pháp sư phạm!')
      return
    }
    let updatedList = [...(aiConfig.pedagogy_routing || [])]
    const idx = updatedList.findIndex((r) => r.id === editingRule.id)
    if (idx !== -1) {
      updatedList[idx] = editingRule
    } else {
      updatedList.push(editingRule)
    }
    const updated = { ...aiConfig, pedagogy_routing: updatedList }
    setAiConfig(updated)
    setActiveAiConfig(updated)
    setShowRuleModal(false)
    setEditingRule(null)
    toast('Đã lưu quy tắc sư phạm thành công!')
  }

  const handleDeleteRule = (ruleId) => {
    if (!window.confirm('Bạn có chắc muốn xóa quy tắc sư phạm này?')) return
    const updatedList = (aiConfig.pedagogy_routing || []).filter((r) => r.id !== ruleId)
    const updated = { ...aiConfig, pedagogy_routing: updatedList }
    setAiConfig(updated)
    setActiveAiConfig(updated)
    toast('Đã xóa quy tắc!')
  }

  const handleResetAiConfig = () => {
    if (!window.confirm('Đặt lại toàn bộ Model, Temperature và Bảng quy tắc sư phạm về mặc định?')) return
    const def = { ...DEFAULT_AI_CONFIG }
    setAiConfig(def)
    setActiveAiConfig(def)
    toast('Đã đưa cấu hình AI về mặc định!')
  }

  const handleSaveAiConfigToCloud = async () => {
    setSavingAiConfig(true)
    try {
      const ok = await dbKvSet('prompt_studio:ai_config', aiConfig)
      if (ok) {
        setActiveAiConfig(aiConfig)
        toast('🎉 Đã đồng bộ Model & Router Sư phạm lên Cloudflare D1!')
      } else {
        toast('⚠️ Đã lưu offline trên máy bạn (Cloud đang bận)')
      }
    } catch (e) {
      toast('❌ Lỗi kết nối cloud')
    } finally {
      setSavingAiConfig(false)
    }
  }

  const curDef = DEFAULT_PROMPTS[selectedKey] || DEFAULT_PROMPTS.p3_explain
  const curDraft = drafts[selectedKey] || ''

  // Kiểm tra tính hợp lệ của prompt hiện tại
  const validation = useMemo(() => {
    const missing = []
    if (curDef.requiredVars) {
      curDef.requiredVars.forEach((v) => {
        if (!curDraft.includes(v)) missing.push(v)
      })
    }
    const isTooLong = curDraft.length > 12000
    const isEmpty = !curDraft.trim()
    const isError = missing.length > 0 || isTooLong || isEmpty
    return { missing, isTooLong, isEmpty, isError }
  }, [curDef, curDraft])

  // Trạng thái các prompt
  const getPromptStatus = (k) => {
    const def = DEFAULT_PROMPTS[k]
    const d = drafts[k] || ''
    // Kiểm tra lỗi
    if (def.requiredVars) {
      for (const v of def.requiredVars) {
        if (!d.includes(v)) return { label: 'lỗi', color: '#EF4444' }
      }
    }
    if (!d.trim() || d.length > 12000) return { label: 'lỗi', color: '#EF4444' }

    // Chưa lưu (khác với server/prompts hiện tại)
    if (d !== (prompts[k]?.template || def.template)) {
      return { label: 'chưa lưu', color: '#F59E0B' }
    }
    // Đã tùy chỉnh (khác mặc định hệ thống)
    if (d !== def.template) {
      return { label: 'đã tùy chỉnh', color: '#10B981' }
    }
    return null
  }

  const textareaRef = useRef(null)
  const backdropRef = useRef(null)
  const [editorMode, setEditorMode] = useState('edit') // 'edit' | 'preview'

  // Chèn biến chính xác vào vị trí con trỏ chuột
  const handleInsertParam = (paramTag) => {
    const el = textareaRef.current
    if (!el) {
      setDrafts((prev) => ({
        ...prev,
        [selectedKey]: (prev[selectedKey] || '') + ' ' + paramTag,
      }))
      toast(`Đã chèn biến ${paramTag}`)
      return
    }

    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? el.value.length
    const currentVal = el.value || ''
    const newVal = currentVal.substring(0, start) + paramTag + currentVal.substring(end)

    setDrafts((prev) => ({
      ...prev,
      [selectedKey]: newVal,
    }))

    // Nếu đang ở tab preview, chuyển lại edit để người dùng thấy con trỏ
    if (editorMode !== 'edit') {
      setEditorMode('edit')
    }

    // Giữ focus và đưa con trỏ ra ngay sau biến vừa chèn
    setTimeout(() => {
      el.focus()
      const nextPos = start + paramTag.length
      el.setSelectionRange(nextPos, nextPos)
      if (backdropRef.current) {
        backdropRef.current.scrollTop = el.scrollTop
      }
    }, 15)

    const style = getParamStyle(paramTag)
    toast(`Đã chèn ${style.icon} ${paramTag} vào đúng vị trí con trỏ 🎯`)
  }

  // Tạo lớp highlight màu cho các biến trong Editor
  const renderHighlightedBackdrop = (text) => {
    if (!text) return ''
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    return escaped.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match) => {
      const style = getParamStyle(match)
      return `<mark style="background: ${style.markBg}; color: transparent; border-bottom: 2.5px solid ${style.underline}; border-radius: 4px; font-weight: 700; padding: 0 1px;">${match}</mark>`
    })
  }

  // Hiển thị trực quan từng biến với màu sắc và icon riêng biệt
  const renderVisualParts = (text) => {
    if (!text) return null
    const parts = text.split(/(\{\{[a-zA-Z0-9_]+\}\})/g)
    return parts.map((part, idx) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        const style = getParamStyle(part)
        return (
          <span
            key={idx}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              margin: '0 2px',
              borderRadius: 6,
              background: style.bg,
              border: `1.5px solid ${style.border}`,
              color: style.text,
              fontWeight: 800,
              fontSize: 12.5,
              verticalAlign: 'baseline',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
            title={`${style.name} (${part})`}
          >
            <span>{style.icon}</span>
            <span>{part}</span>
            <small style={{ fontSize: 10.5, opacity: 0.85, fontWeight: 700 }}>· {style.name}</small>
          </span>
        )
      }
      return <span key={idx}>{part}</span>
    })
  }

  // Bỏ thay đổi
  const handleDiscardCurrent = () => {
    setDrafts((prev) => ({
      ...prev,
      [selectedKey]: prompts[selectedKey]?.template || curDef.template,
    }))
    toast('Đã hoàn tác thay đổi về bản đang áp dụng')
  }

  // Về mặc định
  const handleResetToDefault = () => {
    setDrafts((prev) => ({
      ...prev,
      [selectedKey]: curDef.template,
    }))
    toast('Đã đưa prompt về bản mặc định (Nhớ bấm Lưu để áp dụng nhé)')
  }

  // Chạy thử prompt
  const handleRunTest = async () => {
    if (validation.isError) {
      toast('Không thể chạy thử vì prompt đang có lỗi!')
      return
    }
    setTestRunning(true)
    setTestOutput(null)
    setTestChecks([])
    const start = performance.now()

    try {
      let finalPrompt = curDraft
      if (selectedKey === 'p3_explain') {
        let moTaGiong = 'dịu dàng, khích lệ'
        if (testGiong === 'Vui nhộn') moTaGiong = 'vui tươi, hài hước nhẹ'
        else if (testGiong === 'Ngắn gọn') moTaGiong = 'câu ngắn, ít chữ'

        let khungGhiChu = ''
        if (testGhiChu.trim()) {
          const subDraft = drafts.p3b_parent_note_explain || DEFAULT_PROMPTS.p3b_parent_note_explain.template
          khungGhiChu = subDraft.replace(/\{\{ghi_chu\}\}/g, testGhiChu.trim().slice(0, 200))
        }

        const routed = routePedagogyMethod({
          mon: testMon,
          lop: testLop,
          dang_bai: testMon === 'Toán' ? 'Toán có lời văn phép tính' : 'Bài học tiểu học',
        })

        finalPrompt = finalPrompt
          .replace(/\{\{mon\}\}/g, testMon)
          .replace(/\{\{lop\}\}/g, testLop)
          .replace(/\{\{sach\}\}/g, testSach)
          .replace(/\{\{bo_sach\}\}/g, testSach)
          .replace(/\{\{dang_bai\}\}/g, testMon === 'Toán' ? 'Toán có lời văn hai bước tính' : 'Đọc hiểu và vận dụng')
          .replace(/\{\{loi_hay_gap\}\}/g, 'Bố mẹ hay sốt ruột làm hộ phép tính trước khi con kịp hiểu đề')
          .replace(/\{\{doan_phuong_phap\}\}/g, routed.doan_phuong_phap)
          .replace(/\{\{giong\}\}/g, testGiong)
          .replace(/\{\{mo_ta_giong\}\}/g, moTaGiong)
          .replace(/\{\{de_bai\}\}/g, testDeBai)
          .replace(/\{\{khung_ghi_chu\}\}/g, khungGhiChu)
      } else if (selectedKey === 'p4_chat') {
        let khungGhiChu = ''
        if (testGhiChu.trim()) {
          const subDraft = drafts.p4b_parent_note_chat || DEFAULT_PROMPTS.p4b_parent_note_chat.template
          khungGhiChu = subDraft.replace(/\{\{ghi_chu\}\}/g, testGhiChu.trim().slice(0, 200))
        }
        finalPrompt = finalPrompt
          .replace(/\{\{lop\}\}/g, testLop)
          .replace(/\{\{sach\}\}/g, testSach)
          .replace(/\{\{de_bai\}\}/g, testDeBai)
          .replace(/\{\{khung_ghi_chu\}\}/g, khungGhiChu)
      } else if (selectedKey === 'p6_practice') {
        finalPrompt = finalPrompt
          .replace(/\{\{lop\}\}/g, testLop)
          .replace(/\{\{sach\}\}/g, testSach)
          .replace(/\{\{de_bai\}\}/g, testDeBai)
      }

      const res = await fetch(`${AI_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: finalPrompt },
            { role: 'user', content: selectedKey === 'p6_practice' ? 'Tạo bài luyện thêm' : 'Phân tích bài này' },
          ],
          max_tokens: aiConfig.max_tokens || 1500,
          temperature: typeof aiConfig.temperature === 'number' ? aiConfig.temperature : 0.3,
          model: aiConfig.model || 'cloudflare-llama-3.3-70b',
        }),
      })

      const elapsed = Math.round((performance.now() - start) / 1000)
      setTestDuration(elapsed)

      if (!res.ok) throw new Error('Gateway trả về lỗi HTTP ' + res.status)
      const j = await res.json()
      const rawText = j.response || ''
      setTestOutput(rawText)

      // Kiểm định tự động
      const checks = []
      let parsed = null
      try {
        const m = rawText.match(/\{[\s\S]*\}/)
        if (m) parsed = JSON.parse(m[0])
      } catch (e) {}

      const activeModelObj = AVAILABLE_AI_MODELS.find((m) => m.id === aiConfig.model)
      checks.push({
        label: `Model: ${activeModelObj ? activeModelObj.name : aiConfig.model} (Temp ${aiConfig.temperature}, Tokens ${aiConfig.max_tokens})`,
        pass: true,
      })

      checks.push({ label: 'JSON hợp lệ', pass: !!parsed })
      if (selectedKey === 'p3_explain') {
        const stepList = parsed?.cac_bac || parsed?.steps || []
        checks.push({ label: 'Có 2 đến 4 bậc câu hỏi gợi mở', pass: stepList.length >= 2 && stepList.length <= 4 })
        checks.push({ label: 'Có đáp án đối chiếu cho bố mẹ', pass: !!(parsed?.dap_an_cuoi_cho_me || parsed?.answer) })
        checks.push({ label: 'Có bài anh em cùng dạng', pass: !!(parsed?.bai_anh_em || parsed?.brotherProblem) })
        checks.push({ label: 'Có trò chơi 5 phút ôn bài', pass: !!(parsed?.tro_choi_5_phut || parsed?.fiveMinGame) })
        checks.push({ label: 'Có câu "Con dạy lại mẹ"', pass: !!(parsed?.con_day_lai_me || parsed?.teachBack) })
      } else if (selectedKey === 'p6_practice') {
        checks.push({ label: 'Có text đề bài mới', pass: !!(parsed && parsed.text) })
        checks.push({ label: 'Có đáp án cho bố mẹ', pass: !!(parsed && parsed.answer) })
      }
      checks.push({ label: 'Thời gian chạy dưới 30 giây', pass: elapsed < 30 })

      setTestChecks(checks)
    } catch (e) {
      setTestOutput('Lỗi: ' + e.message)
      setTestChecks([{ label: 'Thực thi thành công', pass: false }])
    } finally {
      setTestRunning(false)
    }
  }

  // Lưu phiên bản lên Cloudflare D1
  const handleSaveAll = async () => {
    // 1. Kiểm tra khoá
    if (!adminKey.trim()) {
      setShowKeyInput(true)
      toast('⚠️ Nhập khoá quản trị prompt trước khi lưu')
      return
    }

    // 2. Kiểm tra còn prompt lỗi không
    const errorPrompts = []
    Object.keys(DEFAULT_PROMPTS).forEach((k) => {
      const st = getPromptStatus(k)
      if (st && st.label === 'lỗi') errorPrompts.push(DEFAULT_PROMPTS[k].name)
    })
    if (errorPrompts.length > 0) {
      alert(`Còn prompt chưa hợp lệ:\n- ${errorPrompts.join('\n- ')}\nVui lòng sửa lại các biến bắt buộc trước khi lưu!`)
      return
    }

    // 3. Chuẩn bị payload
    const updatedPrompts = {}
    Object.keys(DEFAULT_PROMPTS).forEach((k) => {
      updatedPrompts[k] = {
        ...DEFAULT_PROMPTS[k],
        template: drafts[k],
        updatedAt: new Date().toISOString(),
      }
    })

    const note = versionNote.trim() || `Cập nhật ngày ${new Date().toLocaleDateString('vi-VN')}`
    const record = {
      versionId: 'ver_' + Date.now(),
      note,
      createdAt: new Date().toISOString(),
      prompts: updatedPrompts,
      aiConfig,
    }

    // 4. Lưu lên D1
    const ok = await dbKvSet('prompt_studio:config', updatedPrompts)
    await dbKvSet('prompt_studio:ai_config', aiConfig)

    if (ok) {
      setActivePrompts(updatedPrompts)
      setPrompts(updatedPrompts)
      setActiveAiConfig(aiConfig)
      
      // Cập nhật lịch sử (tối đa 30 bản ghi)
      const newHist = [record, ...history].slice(0, 30)
      setHistory(newHist)
      try {
        localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(newHist))
      } catch (e) {}

      setVersionNote('')
      setShowKeyInput(false)
      toast('🎉 Đã lưu cấu hình Prompt Studio & AI Router thành công! Mọi gia đình sẽ nhận bản mới ở lần mở app tiếp theo.')
    } else {
      toast('❌ Lỗi kết nối lưu Cloudflare D1!')
    }
  }

  // Khôi phục từ lịch sử
  const handleRestoreVersion = (ver) => {
    if (!ver || !ver.prompts) return
    const restored = {}
    Object.keys(DEFAULT_PROMPTS).forEach((k) => {
      restored[k] = ver.prompts[k]?.template || DEFAULT_PROMPTS[k].template
    })
    setDrafts(restored)
    setShowHistoryModal(false)
    toast(`Đã tải lại bản: "${ver.note}". Bạn kiểm tra và bấm Lưu để áp dụng nhé!`)
  }

  return (
    <div className="prompt-studio-root" style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* HEADER BANNER - CHUẨN STITCH BEAR DESIGN SYSTEM */}
      <div
        className="stitch-card"
        style={{
          background: 'linear-gradient(135deg, #FFFDF8 0%, #FFF6E5 100%)',
          border: '1.5px solid var(--adm-border, #F0DDC2)',
          borderRadius: 'var(--adm-card-radius, 16px)',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          width: '100%',
          boxShadow: '0 2px 8px rgba(75, 54, 33, 0.04)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ minWidth: 260, flex: '1 1 320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 24 }}>📝</span>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--adm-text, #4B3621)' }}>
              Prompt Studio — Quản trị câu chữ AI
            </h3>
            <span style={{ background: '#FFF1D6', color: '#9A5B00', border: '1px solid #F6C56A', fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 800 }}>
              ZERO CODE DEPLOY
            </span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--adm-sub, #8A6A4A)', lineHeight: 1.45 }}>
            Sửa câu chữ app dùng để dặn AI mà không cần lập trình viên build lại app. Bấm <b>Lưu cấu hình prompt</b> để áp dụng toàn hệ thống.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
          <button
            type="button"
            className="stitch-btn-secondary"
            style={{ fontSize: 13, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setShowHistoryModal(true)}
          >
            <span>🕘</span> Lịch sử phiên bản ({history.length})
          </button>
          <button
            type="button"
            className="stitch-btn-primary"
            style={{ fontSize: 13, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}
            onClick={() => setShowKeyInput(true)}
          >
            <span>💾</span> Lưu cấu hình prompt
          </button>
        </div>
      </div>

      {/* WORKSPACE DUAL-PANE */}
      <div className="prompt-studio-dual-pane" style={{ display: 'grid', gridTemplateColumns: '270px minmax(0, 1fr)', gap: 16, minHeight: 650, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        {/* LEFT COLUMN: DANH SÁCH 8 PROMPTS */}
        <div className="prompt-studio-sidebar" style={{ background: 'var(--adm-card, #FFFFFF)', borderRadius: 'var(--adm-card-radius, 16px)', border: '1.5px solid var(--adm-border, #F0DDC2)', padding: 14, display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 2px 8px rgba(75, 54, 33, 0.04)', minWidth: 0, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--adm-sub, #8A6A4A)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Danh sách 8 Prompts
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-primary-border, #C47F0E)', background: 'var(--adm-bg-sub, #FFF1D6)', padding: '2px 8px', borderRadius: 999 }}>
              8 Sẵn sàng
            </span>
          </div>

          {Object.keys(DEFAULT_PROMPTS).map((k) => {
            const item = DEFAULT_PROMPTS[k]
            const isSelected = selectedKey === k
            const status = getPromptStatus(k)

            return (
              <button
                key={k}
                onClick={() => setSelectedKey(k)}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: isSelected ? '2px solid var(--adm-primary, #F6A623)' : '1px solid var(--adm-border, #F0DDC2)',
                  background: isSelected ? 'var(--adm-bg-sub, #FFF1D6)' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  transition: 'all .15s',
                  boxSizing: 'border-box',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, flexWrap: 'wrap' }}>
                  <b style={{ fontSize: 13, color: isSelected ? 'var(--adm-text, #4B3621)' : '#1E293B', lineHeight: 1.3 }}>{item.name}</b>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {k === 'p3_explain' && aiEvalResult && (
                      <span
                        className="ai-eval-badge"
                        title={`Đánh giá chất lượng: ${aiEvalResult.allCriteriaPassCount}/${aiEvalResult.totalQuestions} đề đạt chuẩn (${aiEvalResult.passRate}%)`}
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 999,
                          background: aiEvalResult.passRate >= 90 ? '#10B981' : '#F59E0B',
                          color: '#fff',
                        }}
                      >
                        🎯 {aiEvalResult.passRate}%
                      </span>
                    )}
                    {status && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: status.color, color: '#fff', flexShrink: 0 }}>
                        {status.label}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--adm-sub, #8A6A4A)', lineHeight: 1.3 }}>{item.desc}</span>
              </button>
            )
          })}
        </div>

        {/* RIGHT COLUMN: SWITCH BETWEEN PROMPTS & AI CONFIG */}
        {activeView === 'prompts' ? (
          <div className="prompt-studio-main" style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
            {/* EDITOR CARD */}
            <div className="prompt-studio-card" style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 18, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <b style={{ fontSize: 16, color: '#0F172A', display: 'block', lineHeight: 1.3 }}>{curDef.name}</b>
                    {selectedKey === 'p3_explain' && aiEvalResult && (
                      <span
                        className="ai-eval-header-badge"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#047857',
                        }}
                        title={`File báo cáo chi tiết: ${aiEvalResult.reportFile}`}
                      >
                        🎯 Đánh giá AI: {aiEvalResult.allCriteriaPassCount}/{aiEvalResult.totalQuestions} đạt chuẩn ({aiEvalResult.passRate}%)
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2, lineHeight: 1.4 }}>{curDef.desc}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
                  {/* QUICK LINK TỚI CẤU HÌNH ROUTER SƯ PHẠM KHI CHỌN P3_EXPLAIN */}
                  {selectedKey === 'p3_explain' && (
                    <button
                      type="button"
                      className="admin-btn sm"
                      style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4338CA', fontWeight: 700 }}
                      onClick={() => setActiveView('ai_config')}
                      title="Cấu hình Model AI, Temperature và Bảng Router Sư phạm cho Scaffold"
                    >
                      ⚙️ Cấu hình Router & Model
                    </button>
                  )}

                  {/* VIEW MODE TOGGLE */}
                  <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: 2, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <button
                    type="button"
                    className="admin-btn sm"
                    style={{
                      background: editorMode === 'edit' ? '#FFFFFF' : 'transparent',
                      color: editorMode === 'edit' ? '#0F172A' : '#64748B',
                      border: 'none',
                      boxShadow: editorMode === 'edit' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      fontWeight: 700,
                      padding: '4px 10px',
                      cursor: 'pointer',
                    }}
                    onClick={() => setEditorMode('edit')}
                  >
                    ✏️ Soạn thảo
                  </button>
                  <button
                    type="button"
                    className="admin-btn sm"
                    style={{
                      background: editorMode === 'preview' ? '#FFFFFF' : 'transparent',
                      color: editorMode === 'preview' ? '#0F172A' : '#64748B',
                      border: 'none',
                      boxShadow: editorMode === 'preview' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      fontWeight: 700,
                      padding: '4px 10px',
                      cursor: 'pointer',
                    }}
                    onClick={() => setEditorMode('preview')}
                  >
                    👁️ Xem nổi bật biến
                  </button>
                </div>

                <button
                  className="admin-btn sm"
                  style={{ background: '#F1F5F9', color: '#475569' }}
                  onClick={handleDiscardCurrent}
                  title="Hủy các sửa đổi chưa lưu"
                >
                  ↶ Bỏ thay đổi
                </button>
                <button
                  className="admin-btn sm"
                  style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}
                  onClick={handleResetToDefault}
                  title="Đưa về bản mẫu ban đầu của app"
                >
                  ↺ Về bản mặc định
                </button>
              </div>
            </div>

            {/* TEXTAREA EDITOR & PREVIEW */}
            {editorMode === 'edit' ? (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '100%',
                  borderRadius: 12,
                  border: validation.isError ? '1.5px solid #EF4444' : '1.5px solid #CBD5E1',
                  background: '#FFFFFF',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                  boxSizing: 'border-box',
                }}
              >
                {/* BACKDROP HIGHLIGHTER (MÀU BIẾN CHẠY PHÍA SAU) */}
                <div
                  ref={backdropRef}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: renderHighlightedBackdrop(curDraft) + '<br/>' }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    maxWidth: '100%',
                    padding: '12px 14px',
                    margin: 0,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: 13,
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    color: 'transparent',
                    pointerEvents: 'none',
                    overflowY: 'hidden',
                    overflowX: 'hidden',
                    boxSizing: 'border-box',
                  }}
                />

                {/* TEXTAREA THỰC TẾ (TRONG SUỐT ĐỂ LỘ MÀU BIẾN) */}
                <textarea
                  ref={textareaRef}
                  value={curDraft}
                  onChange={(e) => setDrafts({ ...drafts, [selectedKey]: e.target.value })}
                  onScroll={(e) => {
                    if (backdropRef.current) {
                      backdropRef.current.scrollTop = e.target.scrollTop
                      backdropRef.current.scrollLeft = e.target.scrollLeft
                    }
                  }}
                  rows={14}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    maxWidth: '100%',
                    padding: '12px 14px',
                    margin: 0,
                    borderRadius: 12,
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: '#1E293B',
                    caretColor: '#2563EB',
                    background: 'transparent',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                />

                <span
                  style={{
                    position: 'absolute',
                    right: 12,
                    bottom: 12,
                    zIndex: 2,
                    fontSize: 11,
                    color: curDraft.length > 12000 ? '#EF4444' : '#94A3B8',
                    fontWeight: 600,
                    pointerEvents: 'none',
                    background: 'rgba(255,255,255,0.9)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid #E2E8F0',
                  }}
                >
                  {curDraft.length} / 12,000 ký tự
                </span>
              </div>
            ) : (
              /* PREVIEW CHẾ ĐỘ NỔI BẬT BIẾN */
              <div
                style={{
                  minHeight: 280,
                  maxHeight: 460,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  width: '100%',
                  maxWidth: '100%',
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '1.5px solid #CBD5E1',
                  background: '#F8FAFC',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: 13,
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  color: '#334155',
                  boxSizing: 'border-box',
                }}
              >
                {renderVisualParts(curDraft)}
              </div>
            )}

            {/* ERROR ALERT */}
            {validation.isError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '8px 12px', borderRadius: 8, color: '#B91C1C', fontSize: 12.5, display: 'flex', gap: 6, alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
                <span>⚠️</span>
                <span>
                  {validation.missing.length > 0
                    ? `Thiếu chỗ điền bắt buộc: ${validation.missing.join(', ')}`
                    : validation.isEmpty
                    ? 'Prompt không được để trống'
                    : 'Prompt quá dài (tối đa 12,000 ký tự)'}
                </span>
              </div>
            )}

            {/* AVAILABLE VARIABLES WITH ENHANCED COLOR & CURSOR INSERTION */}
            {curDef.variables && curDef.variables.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: '#1E293B' }}>
                      🎯 Các biến có thể chèn vào vị trí con trỏ chuột:
                    </span>
                    <span style={{ fontSize: 11.5, color: '#64748B' }}>
                      (Bấm biến để chèn tự động vào đúng chỗ con trỏ đang đứng)
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span> Đã có &nbsp;
                    <span style={{ color: '#EF4444', fontWeight: 800 }}>+</span> Chưa chèn
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  {curDef.variables.map((v) => {
                    const isPresent = curDraft.includes(v)
                    const isRequired = curDef.requiredVars.includes(v)
                    const style = getParamStyle(v)
                    return (
                      <button
                        key={v}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleInsertParam(v)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '5px 10px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          fontWeight: 700,
                          border: isPresent
                            ? `1.5px solid ${style.border}`
                            : isRequired
                            ? '1.5px dashed #EF4444'
                            : `1.5px dashed ${style.border}`,
                          background: isPresent ? style.bg : '#FFFFFF',
                          color: style.text,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isPresent ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                          boxSizing: 'border-box',
                          maxWidth: '100%',
                        }}
                        title={`${style.name} — Bấm để chèn tại vị trí con trỏ chuột`}
                      >
                        <span style={{ fontSize: 13 }}>{style.icon}</span>
                        <span>{v}</span>
                        <span style={{ fontSize: 10, opacity: 0.85, fontWeight: 600 }}>
                          ({style.name})
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            marginLeft: 3,
                            fontWeight: 800,
                            color: isPresent ? '#059669' : isRequired ? '#DC2626' : '#94A3B8',
                          }}
                        >
                          {isPresent ? '✓' : '+'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* TEST BENCH (CHẠY THỬ) */}
          <div className="prompt-studio-card" style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, width: '100%', paddingBottom: 12, borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>🧪</span>
                <div>
                  <b style={{ fontSize: 16, color: '#0F172A', display: 'block', lineHeight: 1.2 }}>Chạy thử prompt (Test Bench)</b>
                  <span style={{ fontSize: 12.5, color: '#64748B' }}>Mô phỏng phản hồi AI trực tiếp với các tham số học tập</span>
                </div>
              </div>
              <button
                type="button"
                className="stitch-btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 13.5,
                  padding: '9px 18px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: testRunning || validation.isError ? 'not-allowed' : 'pointer',
                  opacity: testRunning || validation.isError ? 0.6 : 1,
                  boxShadow: '0 2px 8px rgba(217, 119, 6, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
                onClick={handleRunTest}
                disabled={testRunning || validation.isError}
              >
                {testRunning ? '⏳ Đang gọi AI thử nghiệm…' : '▶ Chạy thử nghiệm'}
              </button>
            </div>

            {/* TEST INPUTS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>Môn học:</label>
                <select
                  className="stitch-select"
                  style={{ fontSize: 13.5, padding: '9px 12px', width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1.5px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', fontWeight: 600 }}
                  value={testMon}
                  onChange={(e) => setTestMon(e.target.value)}
                >
                  {['Toán', 'Tiếng Việt', 'Tiếng Anh'].map((x) => <option key={x} value={x} style={{ color: '#0F172A', background: '#FFFFFF' }}>{x}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>Lớp:</label>
                <select
                  className="stitch-select"
                  style={{ fontSize: 13.5, padding: '9px 12px', width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1.5px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', fontWeight: 600 }}
                  value={testLop}
                  onChange={(e) => setTestLop(e.target.value)}
                >
                  {['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'].map((x) => <option key={x} value={x} style={{ color: '#0F172A', background: '#FFFFFF' }}>{x}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>Bộ sách:</label>
                <select
                  className="stitch-select"
                  style={{ fontSize: 13.5, padding: '9px 12px', width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1.5px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', fontWeight: 600 }}
                  value={testSach}
                  onChange={(e) => setTestSach(e.target.value)}
                >
                  {['Kết nối tri thức', 'Chân trời sáng tạo', 'Cánh Diều'].map((x) => <option key={x} value={x} style={{ color: '#0F172A', background: '#FFFFFF' }}>{x}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>Giọng:</label>
                <select
                  className="stitch-select"
                  style={{ fontSize: 13.5, padding: '9px 12px', width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1.5px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', fontWeight: 600 }}
                  value={testGiong}
                  onChange={(e) => setTestGiong(e.target.value)}
                >
                  {['Nhẹ nhàng', 'Vui nhộn', 'Ngắn gọn'].map((x) => <option key={x} value={x} style={{ color: '#0F172A', background: '#FFFFFF' }}>{x}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>Đề bài mẫu:</label>
              <input
                className="stitch-input"
                style={{ fontSize: 13.5, padding: '10px 14px', width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1.5px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }}
                value={testDeBai}
                onChange={(e) => setTestDeBai(e.target.value)}
                placeholder="Ví dụ: Mẹ mua 9 quả táo. Mẹ cho Na 3 quả. Hỏi mẹ còn mấy quả táo?"
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>Ghi chú phụ huynh (nếu có):</label>
              <input
                className="stitch-input"
                style={{ fontSize: 13.5, padding: '10px 14px', width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1.5px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }}
                value={testGhiChu}
                onChange={(e) => setTestGhiChu(e.target.value)}
                placeholder="Ví dụ: Con chưa học phép nhân, giảng bằng phép cộng/trừ nhé."
              />
            </div>

            {/* TEST CHECKS */}
            {testChecks.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '10px 12px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}>
                {testChecks.map((c, i) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: 700, color: c.pass ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {c.pass ? '✓' : '✗'} {c.label}
                  </span>
                ))}
                <span style={{ fontSize: 12, color: '#64748B', marginLeft: 'auto' }}>
                  ⏱️ {testDuration} giây
                </span>
              </div>
            )}

            {/* TEST OUTPUT DISPLAY */}
            {testOutput && (
              <div style={{ marginTop: 4, width: '100%', boxSizing: 'border-box' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Kết quả AI trả về:</label>
                <pre style={{ maxHeight: 220, overflowY: 'auto', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#0F172A', color: '#38BDF8', padding: 12, borderRadius: 10, fontSize: 12, lineHeight: 1.5, margin: '4px 0 0', width: '100%', boxSizing: 'border-box' }}>
                  {testOutput}
                </pre>
              </div>
            )}
          </div>
        </div>
        ) : activeView === 'ai_config' ? (
          /* ============================================================
             AI CONFIG & PEDAGOGY ROUTER PANEL (CHẾ ĐỘ CẤU HÌNH NÂNG CAO)
             ============================================================ */
          <div className="prompt-studio-main" style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
            {/* TOP ACTION & STATUS BANNER */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 24 }}>⚙️</span>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
                    Cấu Hình Tham Số AI Gateway & Bảng Router Sư Phạm
                  </h3>
                  <span style={{ background: '#EEF2FF', color: '#4338CA', fontSize: 11.5, padding: '2px 8px', borderRadius: 20, fontWeight: 700, border: '1px solid #C7D2FE' }}>
                    Cloudflare D1 Live
                  </span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748B', maxWidth: 680, lineHeight: 1.45 }}>
                  Điều chỉnh Model AI, độ sáng tạo (Temperature), giới hạn token và quy tắc chọn phương pháp sư phạm cho từng môn/khối lớp. Áp dụng ngay cho phụ huynh mà không cần build lại web.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="admin-btn sm"
                  style={{ background: '#F1F5F9', color: '#475569' }}
                  onClick={handleResetAiConfig}
                  title="Đặt lại tham số về bản mặc định ban đầu"
                >
                  ↺ Đặt lại mặc định
                </button>
                <button
                  type="button"
                  className="admin-btn sm"
                  disabled={savingAiConfig}
                  style={{ background: '#10B981', color: '#FFFFFF', fontWeight: 800 }}
                  onClick={handleSaveAiConfigToCloud}
                >
                  {savingAiConfig ? '⏳ Đang lưu D1…' : '💾 Lưu Lên Cloud D1'}
                </button>
              </div>
            </div>

            {/* CARD 1: THAM SỐ INFERENCE & MODEL PROVIDER */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20, display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div>
                <b style={{ fontSize: 15, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🤖</span> 1. Chọn Model AI & Nhà Cung Cấp (Provider)
                </b>
                <span style={{ fontSize: 12, color: '#64748B', marginTop: 2, display: 'block' }}>
                  Model AI sẽ xử lý việc tạo 4 bậc câu hỏi Scaffold Socratic và bài tập phân tích cho con.
                </span>
              </div>

              {/* GRID 5 MODELS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {AVAILABLE_AI_MODELS.map((m) => {
                  const isSelected = aiConfig.model === m.id
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleUpdateAiParam('model', m.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: isSelected ? '2px solid #6366F1' : '1px solid #E2E8F0',
                        background: isSelected ? '#F5F3FF' : '#F8FAFC',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.15)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                          <span style={{ fontSize: 18 }}>{m.icon}</span>
                          <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: isSelected ? m.badgeColor : '#E2E8F0', color: isSelected ? '#FFFFFF' : '#475569' }}>
                            {m.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: isSelected ? '#4338CA' : '#1E293B', marginTop: 6 }}>
                          {m.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4, lineHeight: 1.35 }}>
                          {m.desc}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: isSelected ? '#6366F1' : '#94A3B8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isSelected ? '✓ Đang áp dụng' : '○ Bấm để chọn'}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* SLIDERS: TEMPERATURE, MAX TOKENS, TIMEOUT */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                {/* TEMPERATURE */}
                <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 14, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🌡️</span> Nhiệt độ (Temperature)
                    </label>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#4338CA', background: '#EEF2FF', padding: '2px 8px', borderRadius: 6 }}>
                      {Number(aiConfig.temperature ?? 0.3).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={aiConfig.temperature ?? 0.3}
                    onChange={(e) => handleUpdateAiParam('temperature', parseFloat(e.target.value))}
                    style={{ width: '100%', marginTop: 8, cursor: 'pointer', accentColor: '#6366F1' }}
                  />
                  <div style={{ fontSize: 11.5, marginTop: 6, color: '#64748B', lineHeight: 1.4 }}>
                    {(aiConfig.temperature ?? 0.3) <= 0.2
                      ? '🔒 Cực kỳ chính xác, bám sát sách giáo khoa, không đổi lời giải'
                      : (aiConfig.temperature ?? 0.3) <= 0.4
                      ? '🎯 Chuẩn Sư phạm Socratic, logic chặt chẽ, câu hỏi ngắn gọn (Khuyên dùng)'
                      : (aiConfig.temperature ?? 0.3) <= 0.7
                      ? '💡 Đa dạng cách gợi ý, ví dụ sinh động, giàu hình tượng'
                      : '🎨 Sáng tạo cao, nhiều tình huống vui nhộn'}
                  </div>
                </div>

                {/* MAX TOKENS */}
                <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 14, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>📝</span> Max Tokens (Giới hạn độ dài)
                    </label>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: 6 }}>
                      {aiConfig.max_tokens ?? 1500} tokens
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="3000"
                    step="100"
                    value={aiConfig.max_tokens ?? 1500}
                    onChange={(e) => handleUpdateAiParam('max_tokens', parseInt(e.target.value, 10))}
                    style={{ width: '100%', marginTop: 8, cursor: 'pointer', accentColor: '#10B981' }}
                  />
                  <div style={{ fontSize: 11.5, marginTop: 6, color: '#64748B', lineHeight: 1.4 }}>
                    Đủ không gian cho 4 bậc gợi mở + bài anh em + trò chơi 5 phút mà không bị ngắt quãng giữa chừng.
                  </div>
                </div>

                {/* TIMEOUT */}
                <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 14, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>⏱️</span> Thời gian chờ (Timeout)
                    </label>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#D97706', background: '#FFFBEB', padding: '2px 8px', borderRadius: 6 }}>
                      {Math.round((aiConfig.timeout_ms ?? 30000) / 1000)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="5"
                    value={Math.round((aiConfig.timeout_ms ?? 30000) / 1000)}
                    onChange={(e) => handleUpdateAiParam('timeout_ms', parseInt(e.target.value, 10) * 1000)}
                    style={{ width: '100%', marginTop: 8, cursor: 'pointer', accentColor: '#F59E0B' }}
                  />
                  <div style={{ fontSize: 11.5, marginTop: 6, color: '#64748B', lineHeight: 1.4 }}>
                    Nếu AI phản hồi chậm quá thời gian này, app sẽ tự động retry hoặc dùng bản giải thích dự phòng.
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: BẢNG ĐỊNH TUYẾN PHƯƠNG PHÁP SƯ PHẠM */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <b style={{ fontSize: 15, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🎯</span> 2. Bảng Định Tuyến Phương Pháp Sư Phạm ({aiConfig.pedagogy_routing?.length || 0} quy tắc)
                  </b>
                  <span style={{ fontSize: 12, color: '#64748B', marginTop: 2, display: 'block' }}>
                    Hệ thống sẽ duyệt từ trên xuống dưới, quy tắc đầu tiên khớp với bài tập sẽ được chèn vào biến <code>&#123;&#123;doan_phuong_phap&#125;&#125;</code> của Scaffold.
                  </span>
                </div>

                <button
                  type="button"
                  className="admin-btn sm"
                  style={{ background: '#4F46E5', color: '#FFFFFF', fontWeight: 800 }}
                  onClick={handleOpenAddRule}
                >
                  ➕ Thêm Quy Tắc Mới
                </button>
              </div>

              {/* LIST OF RULES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(aiConfig.pedagogy_routing || []).map((rule, idx) => {
                  const isEnabled = rule.enabled !== false
                  return (
                    <div
                      key={rule.id || idx}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 12,
                        border: isEnabled ? '1.5px solid #E2E8F0' : '1px dashed #CBD5E1',
                        background: isEnabled ? '#FFFFFF' : '#F8FAFC',
                        opacity: isEnabled ? 1 : 0.65,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        boxShadow: isEnabled ? '0 1px 3px rgba(0,0,0,0.03)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: 6 }}>
                            #{idx + 1}
                          </span>
                          <b style={{ fontSize: 14, color: isEnabled ? '#0F172A' : '#64748B' }}>
                            {rule.title}
                          </b>
                          <span style={{ fontSize: 11.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE' }}>
                            💡 {rule.methods}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {/* TOGGLE SWITCH */}
                          <button
                            type="button"
                            onClick={() => handleToggleRule(rule.id)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 20,
                              border: isEnabled ? '1px solid #10B981' : '1px solid #CBD5E1',
                              background: isEnabled ? '#ECFDF5' : '#F1F5F9',
                              color: isEnabled ? '#065F46' : '#64748B',
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {isEnabled ? '🟢 Đang bật' : '⚪ Đã tắt'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditRule(rule)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 8,
                              border: '1px solid #CBD5E1',
                              background: '#FFFFFF',
                              color: '#334155',
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            ✏️ Sửa
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule.id)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 8,
                              border: '1px solid #FECACA',
                              background: '#FEF2F2',
                              color: '#DC2626',
                              fontSize: 11.5,
                              cursor: 'pointer',
                            }}
                            title="Xóa quy tắc này"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* MATCH CRITERIA BADGES */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
                        <span style={{ color: '#475569', fontWeight: 600 }}>Điều kiện khớp:</span>
                        <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                          📘 Môn: {rule.subjectName || rule.matchSubject || 'Tất cả'}
                        </span>
                        <span style={{ background: '#ECFDF5', color: '#047857', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                          🎒 Lớp: {rule.matchGrade || 'Tất cả'}
                        </span>
                        {rule.matchTopic && (
                          <span style={{ background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                            🎯 Dạng: {rule.matchTopic}
                          </span>
                        )}
                        {rule.keywords && (
                          <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 6, fontSize: 11.5 }}>
                            🔍 Nhận diện: {rule.keywords}
                          </span>
                        )}
                      </div>

                      {/* COMMON MISTAKE */}
                      {rule.common_mistake && (
                        <div style={{ fontSize: 12, color: '#B45309', background: '#FFFBEB', padding: '6px 10px', borderRadius: 6, border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>⚠️</span>
                          <span><b>Lỗi trẻ hay gặp:</b> {rule.common_mistake}</span>
                        </div>
                      )}

                      {/* INSTRUCTION */}
                      <div style={{ fontSize: 12.5, color: '#334155', background: '#F8FAFC', padding: '8px 12px', borderRadius: 8, borderLeft: '3px solid #6366F1', lineHeight: 1.45 }}>
                        <b style={{ color: '#4338CA' }}>Chỉ dẫn AI:</b> {rule.instruction}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : activeView === 'themes' ? (
          <div className="prompt-studio-main" style={{ minWidth: 0, maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
            <AdminThemesSection />
          </div>
        ) : (
          <div className="prompt-studio-main" style={{ minWidth: 0, maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
            <AdminScopeSection adminKey={adminKey} />
          </div>
        )}
      </div>

      {/* MODAL NHẬP KHÓA QUẢN TRỊ KHI LƯU */}
      {showKeyInput && (
        <div className="admin-modal-bg" onClick={() => setShowKeyInput(false)}>
          <div className="admin-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>🔐</span>
                <h3 style={{ margin: 0, fontSize: 16 }}>Xác thực Lưu cấu hình Prompt</h3>
              </div>
              <button className="close-btn" onClick={() => setShowKeyInput(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                Để bảo vệ hệ thống, bạn cần nhập <b>Khoá quản trị prompt</b> (secret `PROMPT_ADMIN_KEY` trên Cloudflare).
              </p>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Khoá quản trị:</label>
                <input
                  type="password"
                  className="field"
                  style={{ marginTop: 4 }}
                  placeholder="Nhập khoá quản trị..."
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Ghi chú phiên bản (tuỳ chọn):</label>
                <input
                  type="text"
                  className="field"
                  style={{ marginTop: 4 }}
                  placeholder="VD: Rút ngắn câu hỏi dưới 25 chữ, gợi ý đồ vật..."
                  value={versionNote}
                  onChange={(e) => setVersionNote(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: 8 }}>
              <button className="admin-btn ghost" onClick={() => setShowKeyInput(false)}>Hủy</button>
              <button className="admin-btn" style={{ background: '#10B981', color: '#fff', flex: 1 }} onClick={handleSaveAll}>
                Xác nhận & Lưu ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LỊCH SỬ PHIÊN BẢN */}
      {showHistoryModal && (
        <div className="admin-modal-bg" onClick={() => setShowHistoryModal(false)}>
          <div className="admin-modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>🕘</span>
                <h3 style={{ margin: 0, fontSize: 16 }}>Lịch sử 30 phiên bản Prompt gần nhất</h3>
              </div>
              <button className="close-btn" onClick={() => setShowHistoryModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 30, color: '#94A3B8' }}>
                  Chưa có lịch sử lưu nào. Mọi phiên bản lưu sẽ được hiển thị tại đây.
                </div>
              ) : (
                history.map((ver, idx) => (
                  <div
                    key={ver.versionId || idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <b style={{ fontSize: 13.5, color: '#1E293B' }}>{ver.note}</b>
                      <div style={{ fontSize: 11.5, color: '#64748B' }}>
                        {new Date(ver.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <button
                      className="admin-btn sm"
                      style={{ background: '#3B82F6', color: '#fff' }}
                      onClick={() => handleRestoreVersion(ver)}
                    >
                      Khôi phục bản này
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA QUY TẮC SƯ PHẠM */}
      {showRuleModal && editingRule && (
        <div className="admin-modal-bg" onClick={() => setShowRuleModal(false)}>
          <div className="admin-modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSaveRule}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>💡</span>
                  <h3 style={{ margin: 0, fontSize: 16 }}>
                    {editingRule.id && (aiConfig.pedagogy_routing || []).some((r) => r.id === editingRule.id)
                      ? 'Chỉnh Sửa Quy Tắc Sư Phạm'
                      : 'Thêm Quy Tắc Sư Phạm Mới'}
                  </h3>
                </div>
                <button type="button" className="close-btn" onClick={() => setShowRuleModal(false)}>✕</button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Tên quy tắc:</label>
                  <input
                    type="text"
                    required
                    className="field"
                    placeholder="VD: Toán hình học lớp 4-5..."
                    value={editingRule.title}
                    onChange={(e) => setEditingRule({ ...editingRule, title: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Phương pháp sư phạm áp dụng:</label>
                  <input
                    type="text"
                    required
                    className="field"
                    placeholder="VD: Singapore CPA + Visual Geometry + Socratic"
                    value={editingRule.methods}
                    onChange={(e) => setEditingRule({ ...editingRule, methods: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Bộ lọc Môn học:</label>
                    <input
                      type="text"
                      className="field"
                      placeholder="toán|math hoặc all"
                      value={editingRule.matchSubject}
                      onChange={(e) => setEditingRule({ ...editingRule, matchSubject: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Bộ lọc Khối lớp:</label>
                    <input
                      type="text"
                      className="field"
                      placeholder="1|2|3 hoặc all"
                      value={editingRule.matchGrade}
                      onChange={(e) => setEditingRule({ ...editingRule, matchGrade: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Từ khóa Dạng bài (Regex hoặc text):</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="VD: hình vuông|diện tích|chu vi hoặc để trống để khớp tất cả"
                    value={editingRule.matchTopic}
                    onChange={(e) => setEditingRule({ ...editingRule, matchTopic: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Từ khóa tự động nhận diện đề bài (Regex):</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="VD: lời văn|phép tính|cộng|trừ|mua|bán..."
                    value={editingRule.keywords || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, keywords: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Lỗi học sinh hay gặp khi giải:</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="VD: Bố mẹ hay sốt ruột làm hộ phép tính trước khi con kịp hiểu đề"
                    value={editingRule.common_mistake || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, common_mistake: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Chỉ dẫn thực hiện sư phạm cho AI:</label>
                  <textarea
                    rows={3}
                    required
                    className="field"
                    placeholder="Mô tả cụ thể cách AI dẫn dắt con (bậc 1 vẽ hình, bậc 2 đặt câu hỏi, không giảng lý thuyết dài...)"
                    value={editingRule.instruction}
                    onChange={(e) => setEditingRule({ ...editingRule, instruction: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="admin-btn ghost" onClick={() => setShowRuleModal(false)}>Hủy</button>
                <button type="submit" className="admin-btn" style={{ background: '#4F46E5', color: '#fff', flex: 1 }}>
                  Lưu Quy Tắc Sư Phạm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
