/**
 * Đợt 15 · Prompt Studio
 * 3 cột: danh sách prompt (phiên bản, điểm chấm AI) · trình soạn sáng có số dòng và biến tô vàng ·
 * bàn thử kèm kết quả bộ chặn lộ đáp án và lịch sử phiên bản. Lưu nháp và Xuất bản tách rõ.
 * Cột tự xếp theo bề rộng vùng nội dung (container query), không bóp cột giữa.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_PROMPTS,
  getActivePrompts,
  setActivePrompts,
  PROMPT_HISTORY_KEY,
  routePedagogyMethod,
  classifyProblemDynamic,
  getActiveAiConfig,
} from './promptStudio'
import { dbKvGet, dbKvSet, AI_GATEWAY } from './api'
import { validateAndGuard, GUARD_RULES } from './guard'
import {
  PageHeader,
  Card,
  Button,
  Input,
  Textarea,
  Select,
  Field,
  Banner,
  StatusPill,
  CodeEditor,
  Drawer,
  staffToast,
  staffConfirm,
} from './ui/staff'
import { fetchPromptVersions, fetchPromptVersion, postPromptVersion, fmtShortTime } from './admin/aiPagesApi'
import './admin/pages-ai.css'
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

const PROMPT_CONFIG_KV = 'prompt_studio:config'
const DRAFTS_KEY = 'kem-con-hoc:prompt-studio-drafts'
const MAX_CHARS = 12000
const GRADES = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5']
const SUBJECTS = ['Toán', 'Tiếng Việt', 'Tiếng Anh']
const SAMPLE_PROBLEM = 'Có 3 hộp bút, mỗi hộp 8 cây. Mẹ cho bạn Na 5 cây. Hỏi mẹ còn lại bao nhiêu cây bút?'
// Điểm chấm AI (npm run ai-eval) hiện chỉ có cho prompt soạn bài
const EVAL_FOR = { p3_explain: aiEvalResult }

function readDraftStore() {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY)
    const v = raw ? JSON.parse(raw) : {}
    return v && typeof v === 'object' ? v : {}
  } catch (e) {
    return {}
  }
}
function writeDraftStore(store) {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(store))
  } catch (e) {}
}
function readLocalHistory() {
  try {
    const raw = localStorage.getItem(PROMPT_HISTORY_KEY)
    const v = raw ? JSON.parse(raw) : []
    return Array.isArray(v) ? v : []
  } catch (e) {
    return []
  }
}

/** "p3_explain_v2" → "p3" · bỏ số thứ tự và nhãn nội bộ khỏi tên */
export function promptCode(key) {
  const m = String(key).match(/^p(\d+)([a-z]?)/)
  const v = String(key).match(/_v(\d+)$/)
  return m ? `p${m[1]}${m[2] || ''}${v ? ` v${v[1]}` : ''}` : key
}
export function cleanPromptName(name = '') {
  return String(name)
    .replace(/^\s*\d+[a-z]?\s*(\([^)]*\))?\s*\.\s*/i, '')
    .replace(/\s*\((?:[^)]*(?:Prompt\s*\d+|JSON|Scaffold|Stitch|Mục\s*\d)[^)]*)\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
const fmtNum = (n) => Number(n || 0).toLocaleString('vi-VN')

/** Điền biến giống app: dạng bài và phương pháp lấy từ Router sư phạm thật */
function fillTemplate(template, { deBai, lop, mon, ghiChu, drafts }) {
  const cls = classifyProblemDynamic(deBai, lop)
  const monUse = mon || cls.mon
  const routed = routePedagogyMethod({ mon: monUse, lop, dang_bai: cls.dang_bai })
  const note = (ghiChu || '').trim().slice(0, 200)
  const noteTpl = drafts.p3b_parent_note_explain || DEFAULT_PROMPTS.p3b_parent_note_explain?.template || ''
  const map = {
    mon: monUse,
    lop,
    sach: 'Kết nối tri thức',
    bo_sach: 'Kết nối tri thức',
    dang_bai: cls.dang_bai,
    loi_hay_gap: cls.loi_hay_gap,
    doan_phuong_phap: routed.doan_phuong_phap,
    giong: 'Dịu dàng',
    mo_ta_giong: 'dịu dàng, khích lệ',
    de_bai: deBai,
    ghi_chu: note,
    khung_ghi_chu: note ? noteTpl.replace(/\{\{ghi_chu\}\}/g, note) : '',
    xung_ho: 'Mẹ',
    ten_con: 'Na',
    ten_be: 'Na',
  }
  return String(template || '').replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, k) => (map[k] !== undefined ? String(map[k]) : m))
}

function parseJsonLoose(text) {
  if (!text) return null
  let s = String(text).trim()
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (fence) s = fence[1]
  try {
    return JSON.parse(s)
  } catch (e) {
    const m = s.match(/\{[\s\S]*\}/)
    if (!m) return null
    try {
      return JSON.parse(m[0])
    } catch (e2) {
      return null
    }
  }
}

/** Chấm kết quả AI bằng đúng bộ chặn lộ đáp án của app (src/guard.js), không gọi AI */
export function guardCheck(promptKey, raw, problemText) {
  const gid = promptKey === 'p3_explain_v2' ? 'p3_explain' : promptKey
  const data = parseJsonLoose(raw)
  const checks = [{ label: 'JSON đúng', pass: !!data }]
  let steps = []
  if (data && (gid === 'p3_explain' || gid === 'p14d_teach_back')) {
    steps = Array.isArray(data.cac_bac) ? data.cac_bac : Array.isArray(data.steps) ? data.steps : []
    checks.push({ label: `${steps.length} bậc (cần 3 đến 5)`, pass: steps.length >= 3 && steps.length <= 5 })
  }
  let guard = null
  if (GUARD_RULES[gid]) {
    const g = validateAndGuard(gid, data ? JSON.stringify(data) : String(raw || ''), { problem_text: problemText })
    guard = g.validator
    if (g.validator?.status === 'Lỗi định dạng') {
      if (data) checks.push({ label: 'Bộ chặn báo sai định dạng', pass: false, detail: g.validator.detail })
    } else {
      checks.push({ label: g.guarded ? 'Bộ chặn đã thay câu lộ đáp án' : 'Không lộ đáp án', pass: !g.guarded, detail: g.guarded ? g.validator?.detail : '' })
    }
  }
  return { checks, guard, steps, hasRule: !!GUARD_RULES[gid] }
}

export default function PromptStudioTab() {
  const keys = useMemo(() => Object.keys(DEFAULT_PROMPTS), [])
  const [published, setPublished] = useState(() => getActivePrompts())
  const [draftStore, setDraftStore] = useState(() => readDraftStore())
  const [drafts, setDrafts] = useState(() => {
    const act = getActivePrompts()
    const store = readDraftStore()
    const init = {}
    keys.forEach((k) => (init[k] = typeof store[k] === 'string' ? store[k] : act[k]?.template || DEFAULT_PROMPTS[k].template))
    return init
  })
  const [selected, setSelected] = useState('p3_explain')
  const [filter, setFilter] = useState('')
  const [latest, setLatest] = useState(null) // { [promptId]: version } từ máy chủ
  const [versions, setVersions] = useState(undefined) // undefined: đang tải · null: máy chủ chưa có lịch sử
  const [localHistory, setLocalHistory] = useState(() => readLocalHistory())
  const [busy, setBusy] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [filledOpen, setFilledOpen] = useState(false)
  const [activeColumnTab, setActiveColumnTab] = useState('editor')

  // Bàn thử
  const [deBai, setDeBai] = useState(SAMPLE_PROBLEM)
  const [lop, setLop] = useState('Lớp 3')
  const [mon, setMon] = useState('Toán')
  const [ghiChu, setGhiChu] = useState('')
  const [running, setRunning] = useState(false)
  const [runOut, setRunOut] = useState(null) // { raw, seconds, result }
  const [pasted, setPasted] = useState('')
  const [pastedResult, setPastedResult] = useState(null)
  const [wrap, setWrap] = useState(false)
  const editorWrapRef = useRef(null)

  const publishedTpl = (k) => published[k]?.template || DEFAULT_PROMPTS[k].template
  const baselineTpl = (k) => (typeof draftStore[k] === 'string' ? draftStore[k] : publishedTpl(k))

  useEffect(() => {
    let off = false
    dbKvGet(PROMPT_CONFIG_KV).then((cloud) => {
      if (off || !cloud || typeof cloud !== 'object') return
      const merged = setActivePrompts(cloud)
      setPublished(merged)
      const store = readDraftStore()
      setDrafts((prev) => {
        const next = { ...prev }
        keys.forEach((k) => {
          if (typeof store[k] !== 'string' && merged[k]?.template) next[k] = merged[k].template
        })
        return next
      })
    })
    fetchPromptVersions().then((r) => {
      if (off || !r || !r.ok) return
      const m = {}
      ;(r.versions || []).forEach((v) => (m[v.prompt_id] = v))
      setLatest(m)
    })
    return () => {
      off = true
    }
  }, [])

  useEffect(() => {
    let off = false
    setVersions(undefined)
    setRunOut(null)
    setPastedResult(null)
    fetchPromptVersions(selected).then((r) => !off && setVersions(r && r.ok ? r.versions || [] : null))
    return () => {
      off = true
    }
  }, [selected])

  const def = DEFAULT_PROMPTS[selected] || DEFAULT_PROMPTS.p3_explain
  const draft = drafts[selected] ?? ''
  const name = cleanPromptName(def.name)
  const isUnsaved = draft !== baselineTpl(selected)
  const differsFromLive = draft !== publishedTpl(selected)
  const hasSavedDraft = typeof draftStore[selected] === 'string' && draftStore[selected] !== publishedTpl(selected)

  const validation = useMemo(() => {
    const missing = (def.requiredVars || []).filter((v) => !draft.includes(v))
    const tooLong = draft.length > MAX_CHARS
    const empty = !draft.trim()
    return { missing, tooLong, empty, error: missing.length > 0 || tooLong || empty }
  }, [def, draft])

  const promptState = (k) => {
    const d = drafts[k] ?? ''
    const req = DEFAULT_PROMPTS[k].requiredVars || []
    const bad = !d.trim() || d.length > MAX_CHARS || req.some((v) => !d.includes(v))
    const unsaved = d !== baselineTpl(k)
    const draftOn = typeof draftStore[k] === 'string' && draftStore[k] !== publishedTpl(k)
    return { bad, unsaved, draftOn }
  }

  const visibleKeys = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return keys
    return keys.filter((k) => `${promptCode(k)} ${DEFAULT_PROMPTS[k].name} ${DEFAULT_PROMPTS[k].desc}`.toLowerCase().includes(q))
  }, [filter, keys])

  const setDraft = (v) => setDrafts((p) => ({ ...p, [selected]: v }))

  const insertVar = (tag) => {
    const ta = editorWrapRef.current?.querySelector('textarea')
    if (!ta) return setDraft(draft + tag)
    const s = ta.selectionStart ?? draft.length
    const e = ta.selectionEnd ?? draft.length
    setDraft(draft.slice(0, s) + tag + draft.slice(e))
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(s + tag.length, s + tag.length)
    })
  }

  const appendLocalHistory = (status) => {
    const rec = {
      versionId: 'ver_' + Date.now(),
      note: status === 'published' ? `Xuất bản ${promptCode(selected)}` : `Nháp ${promptCode(selected)}`,
      status,
      createdAt: new Date().toISOString(),
      prompts: { [selected]: { template: draft } },
    }
    const next = [rec, ...localHistory].slice(0, 40)
    setLocalHistory(next)
    try {
      localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(next))
    } catch (e) {}
  }

  const recordVersion = async (status) => {
    const r = await postPromptVersion({ promptId: selected, template: draft, status })
    if (r && r.ok && r.version) {
      setVersions((list) => [r.version, ...(Array.isArray(list) ? list : [])])
      setLatest((m) => ({ ...(m || {}), [selected]: r.version }))
      return r.version
    }
    appendLocalHistory(status)
    return null
  }

  const saveDraft = async () => {
    if (!draft.trim()) return staffToast('Prompt đang trống, chưa lưu nháp được', { tone: 'bad' })
    setBusy('draft')
    try {
      const store = { ...readDraftStore(), [selected]: draft }
      writeDraftStore(store)
      setDraftStore(store)
      const v = await recordVersion('draft')
      staffToast(v ? `Đã lưu nháp v${v.version}, gia đình vẫn dùng bản đang chạy` : 'Đã lưu nháp trên máy này, gia đình vẫn dùng bản đang chạy')
    } finally {
      setBusy('')
    }
  }

  const publish = async () => {
    if (validation.error) return staffToast('Prompt còn lỗi, sửa xong mới xuất bản được', { tone: 'bad' })
    const ok = await staffConfirm({
      title: `Xuất bản “${name}”?`,
      message: 'Mọi gia đình sẽ dùng bản này từ lần soạn bài tiếp theo. Bản đang chạy vẫn nằm trong lịch sử để khôi phục.',
      confirmText: 'Xuất bản',
    })
    if (!ok) return
    setBusy('publish')
    try {
      const now = new Date().toISOString()
      const payload = {}
      keys.forEach((k) => {
        payload[k] = {
          ...DEFAULT_PROMPTS[k],
          ...(published[k] || {}),
          template: k === selected ? draft : publishedTpl(k),
          updatedAt: k === selected ? now : published[k]?.updatedAt || null,
        }
      })
      const saved = await dbKvSet(PROMPT_CONFIG_KV, payload)
      if (!saved) {
        staffToast('Chưa xuất bản được, máy chủ chưa nhận. Bản nháp vẫn còn nguyên.', { tone: 'bad' })
        return
      }
      // Đợt 23T Phần 2: Đọc lại ngay để kiểm tra chắc chắn đã ghi vào D1
      const verified = await dbKvGet(PROMPT_CONFIG_KV)
      if (!verified || typeof verified !== 'object') {
        staffToast('Chưa xuất bản được, máy chủ chưa lưu được dữ liệu vào cơ sở dữ liệu. Bản nháp vẫn còn nguyên.', { tone: 'bad' })
        return
      }
      const merged = setActivePrompts(payload)
      setPublished(merged)
      const store = { ...readDraftStore() }
      delete store[selected]
      writeDraftStore(store)
      setDraftStore(store)
      const v = await recordVersion('published')
      staffToast(v ? `Đã xuất bản v${v.version}. Điện thoại phụ huynh nhận bản mới trong tối đa 10 phút.` : 'Đã xuất bản cho mọi gia đình. Điện thoại phụ huynh nhận bản mới trong tối đa 10 phút.')
    } finally {
      setBusy('')
    }
  }

  const discard = () => {
    const before = draft
    setDraft(baselineTpl(selected))
    staffToast('Đã bỏ thay đổi chưa lưu', { undo: () => setDrafts((p) => ({ ...p, [selected]: before })) })
  }
  const resetToDefault = () => {
    const before = draft
    setDraft(def.template)
    staffToast('Đã đưa về bản gốc của app (chưa lưu)', { undo: () => setDrafts((p) => ({ ...p, [selected]: before })) })
  }

  const restore = async (v) => {
    let tpl = null
    if (v.local) tpl = v.template
    else {
      const r = await fetchPromptVersion(v.id)
      tpl = r?.version?.template || null
    }
    if (typeof tpl !== 'string') return staffToast('Không tải được nội dung phiên bản này', { tone: 'bad' })
    const before = draft
    setDraft(tpl)
    setHistoryOpen(false)
    staffToast(`Đã nạp ${v.local ? 'bản lưu trên máy' : `v${v.version}`} vào trình soạn, bấm Lưu nháp hoặc Xuất bản để giữ`, {
      undo: () => setDrafts((p) => ({ ...p, [selected]: before })),
    })
  }

  // Danh sách phiên bản hiển thị: máy chủ nếu có, không thì bản lưu trên máy
  const versionRows = useMemo(() => {
    if (Array.isArray(versions)) {
      const firstPub = versions.find((v) => v.status === 'published')
      return versions.map((v) => ({ ...v, live: firstPub && v.id === firstPub.id }))
    }
    if (versions === null) {
      return localHistory
        .filter((h) => h.prompts && h.prompts[selected]?.template)
        .map((h, i) => ({
          id: h.versionId || `local_${i}`,
          local: true,
          status: h.status || 'published',
          note: h.note,
          created_at: h.createdAt,
          template: h.prompts[selected].template,
        }))
    }
    return []
  }, [versions, localHistory, selected])

  const canRun = /\{\{\s*de_bai\s*\}\}/.test(draft)
  const filled = useMemo(() => (filledOpen ? fillTemplate(draft, { deBai, lop, mon, ghiChu, drafts }) : ''), [filledOpen, draft, deBai, lop, mon, ghiChu, drafts])

  const runTest = async () => {
    if (validation.error) return staffToast('Prompt còn lỗi, sửa xong mới chạy thử được', { tone: 'bad' })
    if (!deBai.trim()) return staffToast('Nhập một đề bài để chạy thử nhé', { tone: 'bad' })
    setRunning(true)
    setRunOut(null)
    const t0 = performance.now()
    try {
      const cfg = getActiveAiConfig()
      const system = fillTemplate(draft, { deBai, lop, mon, ghiChu, drafts })
      const res = await fetch(`${AI_GATEWAY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: `Soạn bài cho đề sau theo đúng schema. Chỉ trả JSON.\nĐề bài: """${deBai}"""` },
          ],
          max_tokens: cfg.max_tokens || 1500,
          temperature: typeof cfg.temperature === 'number' ? cfg.temperature : 0.3,
          model: cfg.model,
        }),
      })
      const seconds = Math.round((performance.now() - t0) / 100) / 10
      if (!res.ok) throw new Error(`máy chủ trả lỗi ${res.status}`)
      const j = await res.json()
      const raw = j.response || j.result || ''
      setRunOut({ raw, seconds, result: guardCheck(selected, raw, deBai) })
    } catch (e) {
      setRunOut({ raw: '', seconds: null, error: e.message || 'lỗi mạng', result: null })
    } finally {
      setRunning(false)
    }
  }

  const evalOf = EVAL_FOR[selected]

  const renderChecks = (result, seconds) => (
    <div style={{ display: 'grid', gap: 8 }}>
      <ul className="aip-checks">
        {result.checks.map((c, i) => (
          <li key={i}>
            <span className={c.pass ? 'ok' : 'bad'} aria-hidden="true">{c.pass ? '✓' : '✗'}</span>
            <span>
              {c.label}
              {c.detail && <span className="aip-muted"> · {c.detail}</span>}
            </span>
          </li>
        ))}
        {seconds !== null && seconds !== undefined && (
          <li>
            <span className={seconds < 30 ? 'ok' : 'bad'} aria-hidden="true">{seconds < 30 ? '✓' : '✗'}</span>
            <span>Trả lời sau {String(seconds).replace('.', ',')} giây</span>
          </li>
        )}
      </ul>
      {!result.hasRule && <span className="aip-small aip-muted">Prompt này chưa có luật chặn lộ đáp án, chỉ kiểm định dạng JSON.</span>}
      {result.guard && (
        <div className="aip-row">
          <span className="aip-small aip-muted">Bộ chặn:</span>
          <StatusPill status={result.guard.status === 'Đạt' ? 'dat' : result.guard.status === 'Đã chặn' ? 'review' : 'error'} label={result.guard.status} />
        </div>
      )}
      {result.steps.length > 0 && (
        <ol className="aip-steps">
          {result.steps.slice(0, 6).map((s, i) => (
            <li key={i}>
              <b>{i + 1}</b>
              <span>“{s.cau_hoi || s.question || s.q || '(trống)'}”</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )

  const versionList = (rows, limit) =>
    rows.length === 0 ? (
      <span className="aip-small aip-muted">
        {versions === undefined ? 'Đang tải lịch sử…' : 'Chưa có phiên bản nào được lưu cho prompt này.'}
      </span>
    ) : (
      <ul className="aip-vers">
        {rows.slice(0, limit).map((v) => (
          <li key={v.id}>
            <span className="v">{v.local ? 'nháp máy' : `v${v.version}`}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              {v.live ? <b>đang dùng</b> : v.status === 'draft' ? 'nháp' : 'đã xuất bản'}
              <span className="aip-muted">
                {' · '}
                {v.actor_email ? `${String(v.actor_email).split('@')[0]} · ` : v.local ? 'lưu trên máy · ' : ''}
                {fmtShortTime(v.created_at)}
              </span>
            </span>
            <button type="button" className="aip-linkbtn" onClick={() => restore(v)}>
              khôi phục
            </button>
          </li>
        ))}
      </ul>
    )

  return (
    <div className="aip-root aip-ps" data-active-col={activeColumnTab}>
      <PageHeader
        title="Prompt Studio"
        description="Sửa cách AI giảng mà không cần phát hành lại app · mỗi lần lưu là một phiên bản"
        actions={
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="ghost" size="sm" onClick={() => setHistoryOpen(true)}>
              🕘 Lịch sử
            </Button>
            <Button variant="secondary" size="sm" onClick={saveDraft} disabled={!!busy || !isUnsaved}>
              {busy === 'draft' ? 'Đang lưu…' : 'Lưu nháp'}
            </Button>
            <Button size="sm" onClick={publish} disabled={!!busy || validation.error || !differsFromLive}>
              {busy === 'publish' ? 'Đang xuất bản…' : 'Xuất bản'}
            </Button>
          </div>
        }
      />

      {/* Thanh chuyển cột trên mobile & tablet hẹp */}
      <div className="aip-ps-tabs" role="tablist" aria-label="Chế độ xem Prompt Studio">
        <button
          type="button"
          role="tab"
          aria-selected={activeColumnTab === 'list'}
          className={`aip-ps-tab-btn ${activeColumnTab === 'list' ? 'is-active' : ''}`}
          onClick={() => setActiveColumnTab('list')}
        >
          📋 Danh sách <span className="aip-ps-tab-badge">{keys.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeColumnTab === 'editor'}
          className={`aip-ps-tab-btn ${activeColumnTab === 'editor' ? 'is-active' : ''}`}
          onClick={() => setActiveColumnTab('editor')}
        >
          ✏️ Soạn thảo <span className="aip-ps-tab-badge">{promptCode(selected)}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeColumnTab === 'bench'}
          className={`aip-ps-tab-btn ${activeColumnTab === 'bench' ? 'is-active' : ''}`}
          onClick={() => setActiveColumnTab('bench')}
        >
          🧪 Bàn thử & Lịch sử
        </button>
      </div>

      <div className="aip-ps-grid">
        {/* Cột 1: danh sách prompt */}
        <div className="aip-ps-side">
        <Card className="aip-ps-list" style={{ padding: 12 }}>
          <div className="aip-row" style={{ padding: '2px 4px 4px' }}>
            <span className="aip-label">{keys.length} prompt</span>
          </div>
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Tìm prompt…" aria-label="Tìm prompt" />
          <nav className="aip-plist-scroll" aria-label="Danh sách prompt">
            {visibleKeys.map((k) => {
              const p = DEFAULT_PROMPTS[k]
              const st = promptState(k)
              const lv = latest && latest[k]
              const ev = EVAL_FOR[k]
              const meta = []
              if (lv?.version) { meta.push(`v${lv.version}`); } else { meta.push('mặc định'); }
              if (st.draftOn) meta.push('nháp')
              if (ev) meta.push(`chấm AI ${ev.allCriteriaPassCount}/${ev.totalQuestions}`)
              return (
                <button
                  key={k}
                  type="button"
                  className={`aip-plist-item ${selected === k ? 'on' : ''}`}
                  aria-current={selected === k ? 'true' : undefined}
                  onClick={() => {
                    setSelected(k)
                    setActiveColumnTab('editor')
                  }}
                >
                  <span className="aip-plist-title">
                    <span className="aip-plist-code">{promptCode(k)}</span>
                    {cleanPromptName(p.name)}
                  </span>
                  <span className="aip-plist-meta">
                    {st.bad ? <span className="aip-dot bad" title="Thiếu biến bắt buộc hoặc quá dài" /> : st.unsaved ? <span className="aip-dot" title="Có sửa chưa lưu" /> : null}
                    {meta.join(' · ')}
                    {st.bad && ' · cần sửa'}
                  </span>
                </button>
              )
            })}
            {visibleKeys.length === 0 && <span className="aip-small aip-muted" style={{ padding: 8 }}>Không có prompt nào khớp.</span>}
          </nav>
        </Card>
        </div>

        {/* Cột 2: trình soạn */}
        <Card className="aip-ps-editor">
          <div className="aip-ps-edhead">
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <h2>
                <span className="aip-plist-code" style={{ fontSize: 14 }}>{promptCode(selected)}</span> {name}
              </h2>
              <div className="aip-small aip-muted" style={{ marginTop: 2 }}>{cleanPromptName(def.desc)}</div>
            </div>
            <div className="aip-row" style={{ justifyContent: 'flex-end' }}>
              {isUnsaved ? (
                <span className="aip-pill">Có sửa chưa lưu</span>
              ) : hasSavedDraft ? (
                <span className="aip-pill">Nháp · chưa xuất bản</span>
              ) : (
                <span className="aip-pill ok">Đang dùng</span>
              )}
              {evalOf && (
                <span className="aip-pill plain" title={`Chấm ngày ${fmtShortTime(evalOf.evaluatedAt)}`}>
                  chấm AI {evalOf.allCriteriaPassCount}/{evalOf.totalQuestions}
                </span>
              )}
            </div>
          </div>

          <div className="aip-row aip-small">
            <span className={validation.tooLong ? '' : 'aip-muted'} style={validation.tooLong ? { color: 'var(--s-bad)', fontWeight: 800 } : undefined}>
              {fmtNum(draft.length)} / {fmtNum(MAX_CHARS)} ký tự
            </span>
            <span className="aip-spacer" />
            {isUnsaved && (
              <Button variant="ghost" size="sm" onClick={discard}>Bỏ thay đổi</Button>
            )}
            {draft !== def.template && (
              <Button variant="ghost" size="sm" onClick={resetToDefault}>Về bản gốc</Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setWrap((w) => !w)} title="Bật hoặc tắt tự động xuống dòng">
              {wrap ? '↔ Giữ nguyên dòng' : '↩ Tự xuống dòng'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setFilledOpen(true)}>Xem bản điền biến</Button>
            <Button variant="secondary" size="sm" onClick={() => setActiveColumnTab('bench')} title="Chuyển sang bàn thử để kiểm tra">
              🧪 Sang Bàn thử
            </Button>
          </div>

          <div ref={editorWrapRef}>
            <CodeEditor value={draft} onChange={setDraft} minRows={16} maxHeight={520} wrap={wrap} ariaLabel={`Nội dung prompt ${name}`} />
          </div>

          {validation.error && (
            <Banner
              type="bad"
              message={
                validation.empty
                  ? 'Prompt đang trống.'
                  : validation.tooLong
                  ? `Prompt dài quá ${fmtNum(MAX_CHARS)} ký tự, rút gọn bớt nhé.`
                  : `Thiếu biến bắt buộc: ${validation.missing.join(', ')}. App cần các biến này để điền đề bài.`
              }
            />
          )}

          {(def.variables || []).length > 0 && (
            <div className="aip-ps-vars">
              {def.variables.map((v) => (
                <button key={v} type="button" className="aip-var-btn" onClick={() => insertVar(v)}>
                  {v}
                </button>
              ))}
              <span className="aip-small aip-muted">bấm để chèn vào chỗ con trỏ</span>
            </div>
          )}
        </Card>

        {/* Cột 3: bàn thử + lịch sử */}
        <div className="aip-ps-bench">
          <Card>
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="aip-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="aip-h3">Bàn thử</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveColumnTab('editor')} title="Quay lại trình soạn prompt">
                  ← Trình soạn
                </Button>
              </div>
              <Field label="Đề bài">
                <Textarea rows={3} value={deBai} onChange={(e) => setDeBai(e.target.value)} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 8, width: '100%', minWidth: 0 }}>
                <Field label="Lớp">
                  <Select value={lop} onChange={setLop} options={GRADES} ariaLabel="Lớp" size="sm" />
                </Field>
                <Field label="Môn">
                  <Select value={mon} onChange={setMon} options={SUBJECTS} ariaLabel="Môn" size="sm" />
                </Field>
              </div>
              {/\{\{\s*khung_ghi_chu\s*\}\}/.test(draft) && (
                <Field label="Ghi chú của phụ huynh (tuỳ chọn)">
                  <Input value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} placeholder="Ví dụ: con chưa học phép nhân" />
                </Field>
              )}
              {canRun ? (
                <>
                  <Button onClick={runTest} disabled={running || validation.error}>
                    {running ? 'Đang chờ AI trả lời…' : '▶ Chạy thử'}
                  </Button>
                  <span className="aip-small aip-muted">Chạy thử gọi AI thật một lần, dùng bản đang soạn (chưa cần lưu).</span>
                </>
              ) : (
                <span className="aip-small aip-muted">Prompt này cần ảnh hoặc số liệu từ app nên không chạy thử bằng đề chữ được. Bạn vẫn kiểm được bộ chặn với kết quả có sẵn bên dưới.</span>
              )}
              {runOut && runOut.error && <Banner type="bad" message={`Chạy thử chưa được: ${runOut.error}`} />}
              {runOut && runOut.result && renderChecks(runOut.result, runOut.seconds)}
              {runOut && runOut.raw && (
                <details className="aip-details">
                  <summary>Xem nguyên văn AI trả về</summary>
                  <pre className="aip-output">{runOut.raw}</pre>
                </details>
              )}
              <details className="aip-details">
                <summary>Kiểm bộ chặn với kết quả có sẵn</summary>
                <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                  <Textarea rows={5} value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="Dán JSON AI đã trả (ví dụ từ Nhật ký AI) để xem bộ chặn xử lý thế nào, không gọi AI" />
                  <Button variant="secondary" size="sm" onClick={() => setPastedResult(guardCheck(selected, pasted, deBai))} disabled={!pasted.trim()}>
                    Kiểm bộ chặn
                  </Button>
                  {pastedResult && renderChecks(pastedResult, null)}
                </div>
              </details>
            </div>
          </Card>

          <Card>
            <div className="aip-row" style={{ marginBottom: 6 }}>
              <h3 className="aip-h3">Phiên bản</h3>
              <span className="aip-spacer" />
              {versionRows.length > 4 && (
                <button type="button" className="aip-linkbtn aip-small" onClick={() => setHistoryOpen(true)}>
                  xem tất cả
                </button>
              )}
            </div>
            {versions === null && versionRows.length > 0 && (
              <div className="aip-small aip-muted" style={{ marginBottom: 4 }}>Máy chủ chưa lưu lịch sử, đang hiện các bản lưu trên máy này.</div>
            )}
            {versionList(versionRows, 4)}
          </Card>
        </div>
      </div>

      <Drawer open={historyOpen} title={`Lịch sử · ${promptCode(selected)} ${name}`} onClose={() => setHistoryOpen(false)} width={480}>
        {versions === null && (
          <p className="aip-small aip-muted" style={{ marginTop: 0 }}>
            Máy chủ chưa có lịch sử phiên bản, đây là các bản đã lưu trên máy này.
          </p>
        )}
        {versionList(versionRows, 50)}
      </Drawer>

      <Drawer open={filledOpen} title="Prompt sau khi điền biến" onClose={() => setFilledOpen(false)} width={620}>
        <p className="aip-small aip-muted" style={{ marginTop: 0 }}>
          Điền theo đề ở Bàn thử ({lop}, {mon}). Dạng bài và phương pháp lấy từ Router sư phạm giống app.
        </p>
        <CodeEditor value={filled} readOnly minRows={12} maxHeight={560} ariaLabel="Prompt sau khi điền biến" />
      </Drawer>
    </div>
  )
}
