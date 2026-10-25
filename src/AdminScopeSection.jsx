/**
 * Đợt 15 · Phạm vi đề & ảnh
 * Đầu trang kem, 4 thẻ cài đặt, từ khoá dạng Chip, mỗi luật một hàng (hành động chọn bằng nút),
 * lời nhắn nền kem có biến tô vàng, cột xem trước giống bong bóng trong app, SaveBar khi có thay đổi.
 * Tab: Cấu hình luật · Bàn thử · Nhật ký.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_SCOPE_RULES,
  getActiveScopeRules,
  setActiveScopeRules,
  formatScopeMessage,
  evaluateTextScope,
  parseOcrV2Result,
  SAMPLE_SCOPE_CASES,
  SCOPE_RULES_KV_KEY,
} from './scopeRules'
import { dbKvGet, dbKvSet, getScopeStats } from './api'
import {
  PageHeader,
  Card,
  Tabs,
  Toggle,
  Slider,
  Chip,
  Segmented,
  Button,
  Select,
  Field,
  Textarea,
  KpiCard,
  DataTable,
  EmptyState,
  SaveBar,
  StatusPill,
  staffToast,
  staffConfirm,
} from './ui/staff'
import { fetchScopeStats, fmtShortTime } from './admin/aiPagesApi'
import './admin/pages-ai.css'

export const SCOPE_CATEGORIES_META = [
  { id: 'nhay_cam', emoji: '🙈', name: 'Ảnh nhạy cảm, riêng tư', desc: 'mặt người rõ, giấy tờ tuỳ thân', defaultAction: 'block' },
  { id: 'khong_phai_bai_tap', emoji: '🧸', name: 'Không phải bài tập', desc: 'đồ chơi, phong cảnh, ảnh game', defaultAction: 'block' },
  { id: 'anh_mo', emoji: '🌫️', name: 'Ảnh mờ, thiếu sáng', desc: 'rung tay, mất góc', defaultAction: 'retake' },
  { id: 'nhieu_bai', emoji: '📑', name: 'Nhiều bài trong ảnh', desc: 'từ 2 bài trở lên trong một lần chụp', defaultAction: 'pick_one' },
  { id: 'ngoai_chuong_trinh', emoji: '🎓', name: 'Ngoài chương trình', desc: 'bài lớp 6 trở lên', defaultAction: 'warn' },
  { id: 'lech_lop', emoji: '🪜', name: 'Lệch lớp so với hồ sơ', desc: 'chênh lớp so với lớp của con', defaultAction: 'warn' },
  { id: 'mon_chua_ho_tro', emoji: '📘', name: 'Môn chưa hỗ trợ', desc: 'ngoài Toán, Tiếng Việt, Tiếng Anh', defaultAction: 'warn' },
  { id: 'lam_ho', emoji: '✍️', name: 'Nhờ làm hộ', desc: 'viết sẵn bài văn, giải hộ trọn bài', defaultAction: 'redirect' },
  { id: 'khong_lien_quan', emoji: '💬', name: 'Không liên quan bài tập', desc: 'câu chat vu vơ, từ khoá luôn chặn', defaultAction: 'block' },
]

const ACTION_LABELS = {
  block: 'Chặn',
  retake: 'Chụp lại',
  warn: 'Cảnh báo',
  pick_one: 'Chọn bài',
  redirect: 'Gợi ý thay',
  allow: 'Cho qua',
}
const ACTION_SETS = {
  nhay_cam: ['block', 'retake', 'warn'],
  khong_phai_bai_tap: ['block', 'retake', 'warn'],
  anh_mo: ['block', 'retake', 'warn'],
  nhieu_bai: ['pick_one', 'retake', 'block'],
  ngoai_chuong_trinh: ['warn', 'block'],
  lech_lop: ['warn', 'block'],
  mon_chua_ho_tro: ['warn', 'block'],
  lam_ho: ['redirect', 'warn', 'block'],
  khong_lien_quan: ['block', 'warn'],
}
const MSG_VARS = {
  nhieu_bai: ['xung_ho', 'so_bai'],
  ngoai_chuong_trinh: ['xung_ho', 'lop_doan'],
  lech_lop: ['xung_ho', 'ten_con', 'lop_con', 'lop_doan'],
}
const VAR_LABELS = { xung_ho: 'xưng hô', so_bai: 'số bài', lop_doan: 'lớp đoán', lop_con: 'lớp của con', ten_con: 'tên con' }
const PREVIEW_PARAMS = {
  default: { xung_ho: 'Mẹ', ten_con: 'Na', lop_con: 2, lop_doan: 4, so_bai: 3 },
  ngoai_chuong_trinh: { xung_ho: 'Mẹ', ten_con: 'Na', lop_con: 2, lop_doan: 8, so_bai: 1 },
}
const SOURCE_LABELS = { camera: 'Ảnh', photo: 'Ảnh', text: 'Gõ chữ', type: 'Gõ chữ', voice: 'Giọng nói' }
const GRADE_OPTS = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5']
const WARN_CATS = ['lech_lop', 'ngoai_chuong_trinh', 'mon_chua_ho_tro']

const catName = (id) => (id === 'bai_tap' ? 'Bài tập hợp lệ' : SCOPE_CATEGORIES_META.find((m) => m.id === id)?.name || id || '·')
const actionTone = (a) => (a === 'block' ? 'error' : a === 'allow' ? 'dat' : 'review')
const clone = (x) => JSON.parse(JSON.stringify(x))

function normalizeRules(r) {
  const base = { ...DEFAULT_SCOPE_RULES, ...(r || {}) }
  return {
    ...base,
    actions: { ...DEFAULT_SCOPE_RULES.actions, ...(base.actions || {}) },
    messages: { ...DEFAULT_SCOPE_RULES.messages, ...(base.messages || {}) },
    blocked_keywords: Array.isArray(base.blocked_keywords) ? base.blocked_keywords : [],
  }
}

/** Đếm số mục khác nhau giữa bản đang sửa và bản đã lưu */
function countChanges(a, b) {
  let n = 0
  for (const k of ['enabled', 'grade_gap_warn', 'min_confidence_text_len', 'grade_min', 'grade_max']) if (a[k] !== b[k]) n++
  if (JSON.stringify(a.blocked_keywords) !== JSON.stringify(b.blocked_keywords)) n++
  for (const m of SCOPE_CATEGORIES_META) {
    if ((a.actions || {})[m.id] !== (b.actions || {})[m.id]) n++
    if ((a.messages || {})[m.id] !== (b.messages || {})[m.id]) n++
  }
  return n
}

function highlightMsg(src) {
  const esc = String(src || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return esc.replace(/\{\{?\s*[a-z_]+\s*\}?\}/g, (m) => `<mark class="sk-var">${m}</mark>`) + '\n'
}

/** Ô lời nhắn: nền kem, biến {xung_ho} tô vàng, bấm nhãn biến để chèn vào chỗ con trỏ */
function MessageEditor({ value, onChange, vars = ['xung_ho'], ariaLabel }) {
  const taRef = useRef(null)
  const preRef = useRef(null)
  const insert = (v) => {
    const t = taRef.current
    const tag = `{${v}}`
    if (!t) return onChange((value || '') + tag)
    const s = t.selectionStart ?? value.length
    const e = t.selectionEnd ?? value.length
    onChange(value.slice(0, s) + tag + value.slice(e))
    requestAnimationFrame(() => {
      t.focus()
      t.setSelectionRange(s + tag.length, s + tag.length)
    })
  }
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div className="aip-msg">
        <pre ref={preRef} aria-hidden="true" dangerouslySetInnerHTML={{ __html: highlightMsg(value) }} />
        <textarea
          ref={taRef}
          value={value}
          rows={3}
          spellCheck={false}
          aria-label={ariaLabel}
          onChange={(e) => onChange(e.target.value)}
          onScroll={(e) => preRef.current && (preRef.current.scrollTop = e.currentTarget.scrollTop)}
        />
      </div>
      <div className="aip-ps-vars">
        {vars.map((v) => (
          <button key={v} type="button" className="aip-var-btn" onClick={() => insert(v)} title={`Chèn ${VAR_LABELS[v] || v}`}>
            {`{${v}}`}
          </button>
        ))}
        <span className="aip-small aip-muted">bấm để chèn</span>
      </div>
    </div>
  )
}

function Bubble({ text }) {
  return (
    <div className="aip-bubble-wrap">
      <div className="aip-bubble-ava" aria-hidden="true">🐻</div>
      <div className={`aip-bubble ${text ? '' : 'empty'}`}>{text || 'Chưa có lời nhắn, phụ huynh sẽ không thấy giải thích.'}</div>
    </div>
  )
}

export function AdminScopeSection() {
  const [rules, setRules] = useState(() => normalizeRules(getActiveScopeRules()))
  const [saved, setSaved] = useState(() => normalizeRules(getActiveScopeRules()))
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('rules')
  const [newKeyword, setNewKeyword] = useState('')

  // Bàn thử
  const [sample, setSample] = useState(SAMPLE_SCOPE_CASES[0])
  const [testText, setTestText] = useState(SAMPLE_SCOPE_CASES[0].rawText)
  const [testGrade, setTestGrade] = useState('Lớp 2')
  const [testResult, setTestResult] = useState(null)
  const [batch, setBatch] = useState(null)

  // Nhật ký
  const [stats, setStats] = useState(null)
  const [loadingLogs, setLoadingLogs] = useState(false)

  useEffect(() => {
    let off = false
    dbKvGet(SCOPE_RULES_KV_KEY)
      .then((remote) => {
        if (off || !remote || typeof remote !== 'object' || !remote.version) return
        const merged = normalizeRules(remote)
        setActiveScopeRules(merged)
        setRules(merged)
        setSaved(clone(merged))
      })
      .catch(() => {})
    return () => {
      off = true
    }
  }, [])

  const loadLogs = async () => {
    setLoadingLogs(true)
    try {
      const fromApi = await fetchScopeStats(30)
      if (fromApi && fromApi.ok) setStats({ byCategory: fromApi.byCategory || [], recentEvents: fromApi.recentEvents || [] })
      else {
        const st = await getScopeStats()
        setStats({ byCategory: st?.byCategory || [], recentEvents: st?.recentEvents || [] })
      }
    } catch (e) {
      setStats({ byCategory: [], recentEvents: [], failed: true })
    } finally {
      setLoadingLogs(false)
    }
  }
  useEffect(() => {
    if (tab === 'logs' && !stats && !loadingLogs) loadLogs()
  }, [tab])

  const changes = useMemo(() => countChanges(rules, saved), [rules, saved])
  const dirty = changes > 0
  const set = (patch) => setRules((r) => ({ ...r, ...patch }))
  const setAction = (id, a) => setRules((r) => ({ ...r, actions: { ...r.actions, [id]: a } }))
  const setMessage = (id, m) => setRules((r) => ({ ...r, messages: { ...r.messages, [id]: m } }))

  const addKeyword = () => {
    const kw = newKeyword.trim().toLowerCase()
    if (!kw) return
    if (rules.blocked_keywords.includes(kw)) {
      staffToast('Từ khoá này đã có trong danh sách')
      return
    }
    set({ blocked_keywords: [...rules.blocked_keywords, kw] })
    setNewKeyword('')
  }

  const gmin = rules.grade_min || 1
  const gmax = rules.grade_max || 5
  const toggleGrade = (g) => {
    if (g > gmax) return set({ grade_max: g })
    if (g < gmin) return set({ grade_min: g })
    if (g === gmax && g > gmin) return set({ grade_max: g - 1 })
    if (g === gmin && g < gmax) return set({ grade_min: g + 1 })
    staffToast('Khối hỗ trợ phải liền nhau: bỏ từ lớp đầu hoặc lớp cuối nhé')
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = { ...rules, version: (saved.version || rules.version || 1) + 1, updated_at: new Date().toISOString() }
      const ok = await dbKvSet(SCOPE_RULES_KV_KEY, payload)
      if (ok) {
        setActiveScopeRules(payload)
        setRules(payload)
        setSaved(clone(payload))
        staffToast(`Đã lưu luật phạm vi v${payload.version}, áp dụng ngay cho lần chụp sau`)
      } else {
        staffToast('Chưa lưu được lên máy chủ, thử lại sau nhé', { tone: 'bad' })
      }
    } finally {
      setSaving(false)
    }
  }

  const resetDefault = async () => {
    const ok = await staffConfirm({
      title: 'Đưa luật phạm vi về mặc định?',
      message: 'Mọi hành động, lời nhắn và từ khoá sẽ trở về bản gốc. Bạn vẫn cần bấm Lưu luật để áp dụng.',
      confirmText: 'Đưa về mặc định',
    })
    if (ok) setRules(normalizeRules({ ...clone(DEFAULT_SCOPE_RULES), version: rules.version }))
  }

  const runOne = (s, asImage) => {
    const opts = { childGrade: testGrade, childName: 'Na', parentRole: 'Mẹ', customRules: rules }
    const res = asImage && s?.mockAiJson ? parseOcrV2Result(s.mockAiJson, opts) : evaluateTextScope(asImage ? s.rawText : testText, opts)
    return res || { category: 'bai_tap', action: 'allow' }
  }
  const runTest = (asImage) => {
    const res = runOne(sample, asImage)
    setTestResult({ ...res, asImage, expected: asImage || testText === sample.rawText ? sample.expectedAction : null, at: new Date().toLocaleTimeString('vi-VN') })
  }
  const runAll = () => {
    setBatch(
      SAMPLE_SCOPE_CASES.map((s) => {
        const r = runOne(s, true)
        return { id: s.id, name: s.name, expected: s.expectedAction, action: r.action, category: r.category, ok: r.action === s.expectedAction }
      })
    )
  }

  const totals = useMemo(() => {
    if (!stats) return null
    const by = stats.byCategory || []
    const total = by.reduce((a, c) => a + (Number(c.cnt) || 0), 0)
    const warns = by.filter((c) => WARN_CATS.includes(c.category)).reduce((a, c) => a + (Number(c.cnt) || 0), 0)
    const over = by.reduce((a, c) => a + (Number(c.overridden_cnt) || 0), 0)
    return { total, warns, over, rate: warns > 0 ? Math.round((over / warns) * 100) : null }
  }, [stats])

  const events = stats?.recentEvents || []

  return (
    <div className="aip-root">
      <PageHeader
        title="Phạm vi đề & ảnh"
        description="Chặn ảnh không phải bài tập, đề ngoài chương trình và nhờ làm hộ, trước khi gọi AI"
        status={{ label: `${rules.enabled ? 'Đang bật' : 'Đang tắt'} · v${saved.version || 1}`, tone: rules.enabled ? 'ok' : 'warn' }}
        actions={
          <Button variant="ghost" onClick={resetDefault}>
            Đưa về mặc định
          </Button>
        }
      />

      <Tabs
        activeTab={tab}
        onChange={setTab}
        ariaLabel="Các mục phạm vi"
        tabs={[
          { id: 'rules', label: 'Cấu hình luật', icon: '⚙️' },
          { id: 'bench', label: 'Bàn thử', icon: '🧪', count: `${SAMPLE_SCOPE_CASES.length} mẫu` },
          { id: 'logs', label: 'Nhật ký', icon: '📊', count: stats ? events.length : null },
        ]}
      />

      {tab === 'rules' && (
        <>
          <div className="aip-settings">
            <Card className="aip-setting">
              <h4>Bật kiểm tra</h4>
              <Toggle checked={!!rules.enabled} onChange={(v) => set({ enabled: v })} label={rules.enabled ? 'Đang bật' : 'Đang tắt'} />
              <p>Tắt thì mọi ảnh và đề đi thẳng vào AI</p>
            </Card>
            <Card className="aip-setting">
              <h4>Lệch lớp cảnh báo</h4>
              <Slider
                label={<span className="big">≥ {(rules.grade_gap_warn ?? 1) + 1} lớp</span>}
                format={() => ''}
                min={2}
                max={4}
                value={(rules.grade_gap_warn ?? 1) + 1}
                onChange={(v) => set({ grade_gap_warn: v - 1 })}
                aria-label="Lệch lớp cảnh báo"
              />
              <p>Con lớp 2 làm bài lớp {2 + (rules.grade_gap_warn ?? 1) + 1} thì cảnh báo</p>
            </Card>
            <Card className="aip-setting">
              <h4>Đề tối thiểu</h4>
              <Slider
                label={<span className="big">{rules.min_confidence_text_len || 12} ký tự</span>}
                format={() => ''}
                min={5}
                max={40}
                value={rules.min_confidence_text_len || 12}
                onChange={(v) => set({ min_confidence_text_len: v })}
                aria-label="Đề tối thiểu"
              />
              <p>Ngắn hơn và không có số: coi là trò chuyện</p>
            </Card>
            <Card className="aip-setting">
              <h4>Khối hỗ trợ</h4>
              <div className="aip-row">
                {[1, 2, 3, 4, 5].map((g) => (
                  <Chip key={g} selected={g >= gmin && g <= gmax} onClick={() => toggleGrade(g)}>
                    {g === 1 ? 'Lớp 1' : g}
                  </Chip>
                ))}
              </div>
              <p>Lớp {gmax + 1} trở lên: luật ngoài chương trình</p>
            </Card>
          </div>

          <Card>
            <div className="aip-row" style={{ marginBottom: 10 }}>
              <h3 className="aip-h3">Từ khoá luôn chặn</h3>
              <span className="aip-small aip-muted">đề chứa các cụm này thì dừng và nhờ nhập lại</span>
            </div>
            <div className="aip-row">
              <span className="aip-kw-add">
                <input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                  placeholder="＋ Thêm từ khoá…"
                  aria-label="Thêm từ khoá luôn chặn"
                />
                <button type="button" onClick={addKeyword} disabled={!newKeyword.trim()}>
                  Thêm
                </button>
              </span>
              {rules.blocked_keywords.map((kw) => (
                <Chip key={kw} onRemove={() => set({ blocked_keywords: rules.blocked_keywords.filter((k) => k !== kw) })} removeLabel="Xoá từ khoá">
                  {kw}
                </Chip>
              ))}
              {rules.blocked_keywords.length === 0 && <span className="aip-small aip-muted">Chưa có từ khoá nào.</span>}
            </div>
          </Card>

          <Card>
            <div className="aip-scope-head">
              <span className="aip-label">Loại vi phạm</span>
              <span className="aip-label">Hành động</span>
              <span className="aip-label">Lời nhắn cho phụ huynh</span>
              <span className="aip-label">Phụ huynh sẽ thấy</span>
            </div>
            {SCOPE_CATEGORIES_META.map((m) => {
              const cur = rules.actions[m.id] || m.defaultAction
              const opts = Array.from(new Set([...(ACTION_SETS[m.id] || ['block', 'warn']), cur]))
              const msg = rules.messages[m.id] || ''
              return (
                <div key={m.id} className="aip-scope-row">
                  <div className="aip-scope-name">
                    <span className="aip-scope-emoji" aria-hidden="true">{m.emoji}</span>
                    <div>
                      <b>{m.name}</b>
                      <small>{m.id === 'ngoai_chuong_trinh' ? `bài lớp ${gmax + 1} trở lên` : m.desc}</small>
                    </div>
                  </div>
                  <div>
                    <Segmented value={cur} onChange={(v) => setAction(m.id, v)} options={opts.map((o) => ({ value: o, label: ACTION_LABELS[o] || o }))} />
                  </div>
                  <MessageEditor value={msg} onChange={(v) => setMessage(m.id, v)} vars={MSG_VARS[m.id] || ['xung_ho']} ariaLabel={`Lời nhắn: ${m.name}`} />
                  <Bubble text={formatScopeMessage(msg, PREVIEW_PARAMS[m.id] || PREVIEW_PARAMS.default)} />
                </div>
              )
            })}
          </Card>

          <SaveBar
            dirty={dirty}
            busy={saving}
            text={`Có ${changes} thay đổi chưa lưu · luật mới áp dụng ngay sau khi lưu`}
            saveText="Lưu luật"
            onSave={save}
            onDiscard={() => setRules(clone(saved))}
          />
        </>
      )}

      {tab === 'bench' && (
        <div className="aip-two">
          <Card>
            <div className="aip-row" style={{ marginBottom: 10 }}>
              <h3 className="aip-h3">Mẫu thử</h3>
              <span className="aip-small aip-muted">chạy ngay trên máy bạn với luật đang sửa, không gọi AI</span>
              <span className="aip-spacer" />
              <Button variant="secondary" size="sm" onClick={runAll}>
                Chạy cả {SAMPLE_SCOPE_CASES.length} mẫu
              </Button>
            </div>
            <div className="aip-samples">
              {SAMPLE_SCOPE_CASES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`aip-sample ${sample?.id === s.id ? 'on' : ''}`}
                  onClick={() => {
                    setSample(s)
                    setTestText(s.rawText)
                    setTestResult(null)
                  }}
                >
                  {s.imagePath ? <img src={s.imagePath} alt="" /> : <span />}
                  <span style={{ minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: 13 }}>{s.name.replace(/^\d+\.\s*/, '')}</b>
                    <span className="aip-small aip-muted">
                      Kỳ vọng: {ACTION_LABELS[s.expectedAction] || s.expectedAction} · {s.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              <Field label="Nội dung đề (sửa thoải mái)">
                <Textarea rows={4} value={testText} onChange={(e) => setTestText(e.target.value)} />
              </Field>
              <div className="aip-row" style={{ alignItems: 'flex-end' }}>
                <Field label="Hồ sơ con" style={{ minWidth: 140 }}>
                  <Select value={testGrade} onChange={setTestGrade} options={GRADE_OPTS} ariaLabel="Lớp trong hồ sơ con" />
                </Field>
                <Button onClick={() => runTest(false)}>Chạy với đề chữ</Button>
                {sample?.mockAiJson && (
                  <Button variant="secondary" onClick={() => runTest(true)}>
                    Chạy như ảnh mẫu
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <div style={{ display: 'grid', gap: 14 }}>
            <Card>
              <div className="aip-row" style={{ marginBottom: 10 }}>
                <h3 className="aip-h3">Kết quả</h3>
                {testResult && <span className="aip-small aip-muted">{testResult.at}{testResult.asImage ? ' · như ảnh mẫu' : ' · đề chữ'}</span>}
              </div>
              {testResult ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  <div className="aip-kv">
                    <div>
                      <span>Phân loại</span>
                      <b>{catName(testResult.category)}</b>
                    </div>
                    <div>
                      <span>Hành động</span>
                      <StatusPill status={actionTone(testResult.action)} label={ACTION_LABELS[testResult.action] || testResult.action} />
                    </div>
                    <div>
                      <span>Độ tin cậy</span>
                      <b>{typeof testResult.confidence === 'number' ? `${Math.round(testResult.confidence * 100)}%` : '·'}</b>
                    </div>
                  </div>
                  {testResult.expected && (
                    <div>
                      {testResult.action === testResult.expected ? (
                        <StatusPill status="dat" label="Đúng kỳ vọng của mẫu" />
                      ) : (
                        <StatusPill status="error" label={`Khác kỳ vọng (mẫu cần: ${ACTION_LABELS[testResult.expected] || testResult.expected})`} />
                      )}
                    </div>
                  )}
                  <div>
                    <div className="aip-label" style={{ marginBottom: 6 }}>Phụ huynh sẽ thấy</div>
                    <Bubble text={testResult.message || (testResult.action === 'allow' ? 'Cho qua, không hiện lời nhắn.' : '')} />
                  </div>
                  <div className="aip-small">
                    <b>Lý do:</b> {testResult.reason || (testResult.action === 'allow' ? 'Đề hợp lệ' : '·')}
                  </div>
                </div>
              ) : (
                <EmptyState title="Chưa chạy thử" description="Chọn một mẫu bên trái rồi bấm Chạy để xem app sẽ xử lý thế nào." style={{ boxShadow: 'none', border: 'none' }} />
              )}
            </Card>
            {batch && (
              <Card>
                <div className="aip-row" style={{ marginBottom: 8 }}>
                  <h3 className="aip-h3">Cả {batch.length} mẫu</h3>
                  <span className="aip-small aip-muted">
                    {batch.filter((b) => b.ok).length}/{batch.length} đúng kỳ vọng
                  </span>
                </div>
                <DataTable
                  rowKey="id"
                  data={batch}
                  columns={[
                    { key: 'name', title: 'Mẫu', render: (v) => v.replace(/^\d+\.\s*/, '') },
                    { key: 'expected', title: 'Kỳ vọng', render: (v) => ACTION_LABELS[v] || v },
                    { key: 'action', title: 'Kết quả', render: (v) => ACTION_LABELS[v] || v },
                    { key: 'ok', title: '', render: (v) => <StatusPill status={v ? 'dat' : 'error'} label={v ? 'Đạt' : 'Lệch'} /> },
                  ]}
                />
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <>
          <div className="aip-row">
            <span className="aip-small aip-muted">30 ngày gần nhất · app không lưu ảnh hay nội dung đề, chỉ lưu loại vi phạm</span>
            <span className="aip-spacer" />
            <Button variant="secondary" size="sm" onClick={loadLogs} disabled={loadingLogs}>
              {loadingLogs ? 'Đang tải…' : 'Tải lại'}
            </Button>
          </div>
          <div className="aip-kpis">
            <KpiCard label="Lượt chặn & cảnh báo" value={totals ? totals.total.toLocaleString('vi-VN') : null} sub="trong 30 ngày" />
            <KpiCard label="Lượt cảnh báo" value={totals ? totals.warns.toLocaleString('vi-VN') : null} sub="lệch lớp, ngoài chương trình, môn chưa hỗ trợ" />
            <KpiCard
              label="Phụ huynh vẫn tiếp tục"
              value={totals && totals.rate !== null ? `${totals.rate}%` : null}
              sub={totals ? `${totals.over} lần bỏ qua cảnh báo` : ''}
              emptyText={totals ? 'Chưa có lượt cảnh báo nào' : 'Chưa có dữ liệu'}
            />
          </div>
          <Card>
            {events.length === 0 ? (
              <EmptyState
                title={loadingLogs ? 'Đang tải nhật ký…' : stats?.failed ? 'Chưa đọc được nhật ký' : 'Chưa có lần chặn nào'}
                description={
                  loadingLogs
                    ? 'Đợi một chút nhé.'
                    : 'Khi app chặn hoặc cảnh báo một ảnh, một đề bài, sự kiện sẽ hiện ở đây kèm loại vi phạm và hành động.'
                }
                actionText={loadingLogs ? null : 'Tải lại'}
                onAction={loadingLogs ? null : loadLogs}
                style={{ boxShadow: 'none', border: 'none' }}
              />
            ) : (
              <DataTable
                rowKey="id"
                data={events}
                pageSize={15}
                columns={[
                  { key: 'created_at', title: 'Thời gian', render: (v) => fmtShortTime(typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : v) },
                  { key: 'source', title: 'Nguồn', render: (v) => SOURCE_LABELS[v] || v || '·' },
                  { key: 'category', title: 'Loại vi phạm', render: (v) => catName(v) },
                  { key: 'action', title: 'Hành động', render: (v) => <StatusPill status={actionTone(v)} label={ACTION_LABELS[v] || v || '·'} /> },
                  { key: 'reason', title: 'Lý do', render: (v) => v || '·' },
                  { key: 'grade_guess', title: 'Lớp đoán / con', render: (v, r) => `${v ? `Lớp ${v}` : '·'} / ${r.child_grade ? `Lớp ${r.child_grade}` : '·'}` },
                  { key: 'overridden', title: 'Vẫn tiếp tục', render: (v) => (v ? 'Có' : 'Không') },
                ]}
              />
            )}
          </Card>
        </>
      )}
    </div>
  )
}
