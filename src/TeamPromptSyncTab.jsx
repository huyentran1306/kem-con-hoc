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
// Dữ liệu mẫu ban đầu dạng vỏ bọc (nội dung chi tiết tải động từ Cloud D1)
const INITIAL_TEAM_PROMPTS = [
  {
    id: 'tp_longitudinal_1',
    title: 'Prompt Hệ Thống Nhãn Khen Long-Term & AI Adaptive Roadmap',
    category: 'math',
    targetAi: 'VideFlow',
    author: 'Tech Lead',
    isRunCompanyAi: true,
    runBy: 'Huyền',
    runAt: '2026-10-23 16:30',
    aiResult: 'Thành công tích hợp',
    promptDetail: 'Nội dung chi tiết được đồng bộ trực tiếp từ Cloudflare D1 KV.',
    createdAt: '2026-10-23 16:30',
    updatedAt: '2026-10-23 16:30'
  },
  {
    id: 'tp_pedagogy_ai_config_2',
    title: 'Prompt Cấu Hình AI Toàn Cục & Sư Phạm Phản Hồi',
    category: 'math',
    targetAi: 'VideFlow',
    author: 'Tech Lead',
    isRunCompanyAi: true,
    runBy: 'Huyền',
    runAt: '2026-10-24 13:00',
    aiResult: 'Thành công tích hợp',
    promptDetail: 'Nội dung chi tiết được đồng bộ trực tiếp từ Cloudflare D1 KV.',
    createdAt: '2026-10-24 13:00',
    updatedAt: '2026-10-24 13:00'
  },
  {
    id: 'tp_prompt_06_enhancement',
    title: 'Prompt 06: Sửa Lỗi Nhanh, Bỏ Dữ Liệu Giả & UI Polish',
    category: 'general',
    targetAi: 'Cursor / VideFlow',
    author: 'Kỹ sư Kèm Con Học',
    isRunCompanyAi: true,
    runBy: 'Huyền',
    runAt: '2026-10-24 18:00',
    aiResult: 'Hoàn thành triển khai',
    promptDetail: 'Nội dung chi tiết được đồng bộ trực tiếp từ Cloudflare D1 KV.',
    createdAt: '2026-10-24 18:00',
    updatedAt: '2026-10-24 18:00'
  },
  {
    id: 'tp_prompt_01_themes',
    title: 'Prompt 01: 8 Bộ Giao Diện & Tuỳ Chọn Sở Thích Gia Đình',
    category: 'general',
    targetAi: 'Cursor / VideFlow',
    author: 'Kỹ sư Kèm Con Học',
    isRunCompanyAi: true,
    runBy: 'Huyền',
    runAt: '2026-10-24 18:15',
    aiResult: 'Hoàn thành triển khai',
    promptDetail: 'Nội dung chi tiết được đồng bộ trực tiếp từ Cloudflare D1 KV.',
    createdAt: '2026-10-24 18:15',
    updatedAt: '2026-10-24 18:15'
  },
  {
    id: 'tp_prompt_02_scope',
    title: 'Prompt 02: Bộ Kiểm Tra & Phân Loại Ảnh/Đề Ngoài Phạm Vi',
    category: 'math',
    targetAi: 'Cursor / VideFlow',
    author: 'Kỹ sư Kèm Con Học',
    isRunCompanyAi: true,
    runBy: 'Huyền',
    runAt: '2026-10-24 18:30',
    aiResult: 'Hoàn thành triển khai',
    promptDetail: 'Nội dung chi tiết được đồng bộ trực tiếp từ Cloudflare D1 KV.',
    createdAt: '2026-10-24 18:30',
    updatedAt: '2026-10-24 18:30'
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
