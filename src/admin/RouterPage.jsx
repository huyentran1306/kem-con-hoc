/**
 * Đợt 15 · Router sư phạm
 * Mỗi luật một thẻ: số ưu tiên, điều kiện dạng nhãn, công tắc, mức dùng 30 ngày, tỉ lệ con tự làm.
 * Ô "Thử một đề" chạy ngay trên trình duyệt, dùng đúng cách khớp của app
 * (classifyProblemDynamic rồi routePedagogyMethod trong src/promptStudio.js).
 * Luật lưu vào cấu hình AI (prompt_studio:ai_config · pedagogy_routing), giữ nguyên các tham số mô hình.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  PageHeader,
  Card,
  Button,
  Toggle,
  Chip,
  Input,
  Textarea,
  Select,
  Field,
  Banner,
  EmptyState,
  SaveBar,
  Drawer,
  staffToast,
  staffConfirm,
} from '../ui/staff'
import { DEFAULT_AI_CONFIG, getActiveAiConfig, setActiveAiConfig } from '../promptStudio'
import { dbKvGet, dbKvSet } from '../api'
import { fetchRouterStats } from './aiPagesApi'
import './pages-ai.css'

const AI_CONFIG_KV = 'prompt_studio:ai_config'
const GRADES = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5']
const FALLBACK_DANG_BAI = 'Toán có lời văn, phép tính lớp 1–3'

const isStuckRule = (r) => r && (r.id === 'con_bi_lap_lai' || r.matchTopic === 'isStuck')
const clone = (x) => JSON.parse(JSON.stringify(x))

function safeRegex(src, flags = 'i') {
  if (!src) return null
  try {
    return new RegExp(src, flags)
  } catch (e) {
    return null
  }
}

/** Ghép đúng 2 bước của app: nhận dạng dạng bài theo từ khoá, rồi chọn phương pháp theo môn · lớp · dạng bài */
export function matchRouterRule(text, lop, rules, { isStuck = false } = {}) {
  const list = Array.isArray(rules) && rules.length ? rules : DEFAULT_AI_CONFIG.pedagogy_routing
  const active = list.filter((r) => r.enabled !== false)
  const indexOf = (r) => list.indexOf(r)

  if (isStuck) {
    const s = active.find(isStuckRule)
    if (s) return { rule: s, index: indexOf(s), reasons: ['con bí từ lần 2 trở đi'], stuck: true }
  }

  // Bước 1: nhận dạng (classifyProblemDynamic)
  const lower = String(text || '').toLowerCase()
  let classifyRule = null
  let keyword = ''
  for (const r of active) {
    if (isStuckRule(r) || !r.keywords) continue
    const re = safeRegex(r.keywords)
    const m = re && lower.match(re)
    if (m) {
      classifyRule = r
      keyword = m[0]
      break
    }
  }
  const mon = classifyRule
    ? classifyRule.subjectName ||
      (classifyRule.matchSubject?.includes('anh') ? 'Tiếng Anh' : classifyRule.matchSubject?.includes('việt') ? 'Tiếng Việt' : 'Toán')
    : 'Toán'
  const dangBai = classifyRule ? classifyRule.title : FALLBACK_DANG_BAI

  // Bước 2: chọn phương pháp (routePedagogyMethod)
  for (const r of active) {
    if (isStuckRule(r)) continue
    const sub = !r.matchSubject || r.matchSubject === 'all' || !!safeRegex(r.matchSubject)?.test(mon)
    const grade = !r.matchGrade || r.matchGrade === 'all' || !!safeRegex(r.matchGrade, '')?.test(lop)
    const topicRe = !r.matchTopic || r.matchTopic === 'all' ? null : safeRegex(r.matchTopic)
    const topicHit = topicRe ? dangBai.match(topicRe) : null
    const topic = !r.matchTopic || r.matchTopic === 'all' || !!topicHit
    if (sub && grade && topic) {
      const reasons = []
      if (keyword) reasons.push(`từ khoá «${keyword}»`)
      else reasons.push('không có từ khoá nào khớp, app coi là toán lời văn')
      reasons.push(`môn ${mon}`)
      reasons.push(!r.matchGrade || r.matchGrade === 'all' ? 'mọi lớp' : lop.toLowerCase())
      if (topicHit) reasons.push(`dạng bài «${topicHit[0]}»`)
      return { rule: r, index: indexOf(r), reasons, classifyRule, dangBai, mon }
    }
  }
  const def = active.find((r) => !isStuckRule(r)) || active[0] || null
  return {
    rule: def,
    index: def ? indexOf(def) : -1,
    reasons: ['không luật nào khớp đủ môn, lớp, dạng bài nên dùng luật bật đầu tiên'],
    classifyRule,
    dangBai,
    mon,
    viaDefault: true,
  }
}

function gradeLabel(matchGrade) {
  if (!matchGrade || matchGrade === 'all') return 'mọi lớp'
  const nums = String(matchGrade)
    .split('|')
    .map((x) => parseInt(x, 10))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)
  if (!nums.length) return `lớp ${matchGrade}`
  const contiguous = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1)
  return contiguous && nums.length > 1 ? `lớp ${nums[0]}-${nums[nums.length - 1]}` : `lớp ${nums.join(', ')}`
}

function topicChips(rule) {
  if (isStuckRule(rule)) return ['con bí từ 2 lần']
  const src = rule.matchTopic && rule.matchTopic !== 'all' ? rule.matchTopic : ''
  if (!src) return ['mọi dạng bài']
  const parts = src.split('|').map((s) => s.trim()).filter(Boolean)
  return parts.length > 4 ? [...parts.slice(0, 4), `+${parts.length - 4}`] : parts
}

const EMPTY_RULE = () => ({
  id: 'rule_' + Date.now().toString(36),
  title: '',
  subjectName: 'Toán',
  methods: '',
  instruction: '',
  common_mistake: '',
  keywords: '',
  matchSubject: 'toán|math',
  matchGrade: 'all',
  matchTopic: '',
  enabled: true,
})

const SUBJECT_OPTIONS = [
  { value: 'toán|math', label: 'Toán', name: 'Toán' },
  { value: 'tiếng việt|văn', label: 'Tiếng Việt', name: 'Tiếng Việt' },
  { value: 'tiếng anh|english', label: 'Tiếng Anh', name: 'Tiếng Anh' },
  { value: 'all', label: 'Mọi môn', name: 'Tất cả môn' },
]

export default function RouterPage() {
  const [rules, setRules] = useState(() => clone(getActiveAiConfig().pedagogy_routing || DEFAULT_AI_CONFIG.pedagogy_routing))
  const [saved, setSaved] = useState(() => clone(getActiveAiConfig().pedagogy_routing || DEFAULT_AI_CONFIG.pedagogy_routing))
  const [busy, setBusy] = useState(false)
  const [stats, setStats] = useState(undefined) // undefined: đang tải · null: chưa có API · object: số thật
  const [editing, setEditing] = useState(null)
  const [testText, setTestText] = useState('')
  const [testLop, setTestLop] = useState('Lớp 3')
  const [testStuck, setTestStuck] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const testRef = useRef(null)
  const cardRefs = useRef({})

  useEffect(() => {
    let off = false
    dbKvGet(AI_CONFIG_KV).then((cloud) => {
      if (off || !cloud || !Array.isArray(cloud.pedagogy_routing) || !cloud.pedagogy_routing.length) return
      setRules(clone(cloud.pedagogy_routing))
      setSaved(clone(cloud.pedagogy_routing))
    })
    fetchRouterStats(30).then((s) => !off && setStats(s && s.ok ? s : null))
    return () => {
      off = true
    }
  }, [])

  const dirty = useMemo(() => JSON.stringify(rules) !== JSON.stringify(saved), [rules, saved])
  const changeCount = useMemo(() => {
    if (!dirty) return 0
    const a = new Map(saved.map((r, i) => [r.id, { r: JSON.stringify(r), i }]))
    let n = 0
    rules.forEach((r, i) => {
      const old = a.get(r.id)
      if (!old || old.r !== JSON.stringify(r) || old.i !== i) n++
    })
    saved.forEach((r) => !rules.some((x) => x.id === r.id) && n++)
    return Math.max(1, n)
  }, [rules, saved, dirty])

  const usage = useMemo(() => {
    const m = new Map()
    if (stats && Array.isArray(stats.rules)) stats.rules.forEach((r) => m.set(r.ruleId, r))
    return m
  }, [stats])
  const maxSessions = useMemo(() => Math.max(0, ...Array.from(usage.values()).map((u) => u.sessions || 0)), [usage])

  const update = (id, patch) => setRules((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const move = (i, d) =>
    setRules((list) => {
      const j = i + d
      if (j < 0 || j >= list.length) return list
      const next = [...list]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  const remove = async (rule) => {
    const ok = await staffConfirm({
      title: 'Xoá luật này?',
      message: `Luật “${rule.title || 'chưa đặt tên'}” sẽ không còn được dùng sau khi bạn bấm Lưu.`,
      confirmText: 'Xoá luật',
      danger: true,
    })
    if (!ok) return
    const before = rules
    setRules((list) => list.filter((r) => r.id !== rule.id))
    staffToast('Đã xoá luật (chưa lưu)', { undo: () => setRules(before) })
  }

  const saveEditing = () => {
    const r = editing
    if (!r.title.trim() || !r.methods.trim()) {
      staffToast('Cần có tên luật và phương pháp', { tone: 'bad' })
      return
    }
    for (const k of ['keywords', 'matchTopic', 'matchSubject']) {
      if (r[k] && r[k] !== 'all' && r[k] !== 'isStuck' && !safeRegex(r[k])) {
        staffToast('Từ khoá có ký tự đặc biệt chưa đúng, kiểm tra dấu ngoặc nhé', { tone: 'bad' })
        return
      }
    }
    setRules((list) => (list.some((x) => x.id === r.id) ? list.map((x) => (x.id === r.id ? r : x)) : [...list, r]))
    setEditing(null)
  }

  const save = async () => {
    setBusy(true)
    try {
      const cloud = await dbKvGet(AI_CONFIG_KV)
      const base = cloud && typeof cloud === 'object' ? cloud : getActiveAiConfig()
      const next = { ...base, pedagogy_routing: rules }
      const ok = await dbKvSet(AI_CONFIG_KV, next)
      if (ok) {
        setActiveAiConfig(next)
        setSaved(clone(rules))
        staffToast('Đã lưu Router sư phạm. Điện thoại phụ huynh nhận bản mới trong tối đa 10 phút.')
      } else {
        staffToast('Chưa lưu được lên máy chủ, thử lại sau nhé', { tone: 'bad' })
      }
    } finally {
      setBusy(false)
    }
  }

  const resetDefault = async () => {
    const ok = await staffConfirm({
      title: 'Đưa về bộ luật mặc định?',
      message: 'Bộ 8 luật gốc sẽ thay cho danh sách hiện tại. Bạn vẫn cần bấm Lưu để áp dụng.',
      confirmText: 'Đưa về mặc định',
    })
    if (ok) setRules(clone(DEFAULT_AI_CONFIG.pedagogy_routing))
  }

  const runTest = () => {
    if (!testText.trim()) {
      setTestResult(null)
      testRef.current?.focus()
      return
    }
    const res = matchRouterRule(testText, testLop, rules, { isStuck: testStuck })
    setTestResult(res)
    const el = res.rule && cardRefs.current[res.rule.id]
    if (el && el.scrollIntoView) setTimeout(() => el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 30)
  }

  const statsLine = (rule) => {
    if (stats === undefined) return <span className="aip-muted">Đang tải mức dùng…</span>
    if (!stats) return <span className="aip-muted">Mức dùng 30 ngày: · · Tỉ lệ con tự làm: ·</span>
    const u = usage.get(rule.id)
    const n = u?.sessions || 0
    const rate = u && u.rated > 0 ? `${Math.round((u.selfSolved / u.rated) * 100)}% con tự làm được` : 'tỉ lệ con tự làm: ·'
    return (
      <span>
        <b>{Number(n || 0).toLocaleString('vi-VN')}</b> buổi trong 30 ngày · {rate}
        {rule.enabled === false && ' · đang tắt'}
      </span>
    )
  }

  const hitId = testResult?.rule?.id

  return (
    <div className="aip-root">
      <PageHeader
        title="Router sư phạm"
        description="Chọn phương pháp giảng theo dạng bài, môn và lớp · luật trên cùng được ưu tiên"
        actions={
          <>
            <Button variant="secondary" onClick={() => testRef.current?.focus()}>
              🧪 Thử một đề
            </Button>
            <Button onClick={() => setEditing(EMPTY_RULE())}>＋ Thêm luật</Button>
          </>
        }
      />

      <Card>
        <div className="aip-tester">
          <div className="aip-row">
            <h3 className="aip-h3">Thử một đề</h3>
            <span className="aip-small aip-muted">
              Chạy ngay trên máy bạn, không gọi AI{dirty ? ' · đang dùng luật bạn vừa sửa (chưa lưu)' : ''}
            </span>
          </div>
          <div className="aip-tester-row">
            <Field label="Đề bài">
              <Input
                ref={testRef}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runTest()}
                placeholder="Ví dụ: Một hình chữ nhật dài 8 cm, rộng 5 cm. Tính chu vi."
              />
            </Field>
            <Field label="Lớp của con">
              <Select value={testLop} onChange={setTestLop} options={GRADES} ariaLabel="Lớp của con" />
            </Field>
            <div className="aip-row" style={{ paddingBottom: 4 }}>
              <Toggle checked={testStuck} onChange={setTestStuck} label="Con đang bí lần 2" />
              <Button onClick={runTest}>Thử</Button>
            </div>
          </div>
          {testResult && (
            <div className={`aip-match ${testResult.rule ? '' : 'none'}`} role="status">
              {testResult.rule ? (
                <>
                  Khớp <b>luật {testResult.index + 1}</b> · {testResult.rule.title}
                  <div className="aip-small" style={{ marginTop: 4 }}>
                    Lý do: {testResult.reasons.join(', ')}
                    {testResult.classifyRule && testResult.classifyRule.id !== testResult.rule.id && (
                      <> · app nhận dạng là “{testResult.classifyRule.title}” rồi chọn phương pháp theo luật này</>
                    )}
                  </div>
                  <div className="aip-small aip-muted" style={{ marginTop: 2 }}>Phương pháp: {testResult.rule.methods}</div>
                </>
              ) : (
                'Không có luật nào đang bật. Bật ít nhất một luật để app có phương pháp giảng.'
              )}
            </div>
          )}
        </div>
      </Card>

      {stats && stats.totalSessions > 0 && usage.size === 0 && (
        <Banner
          type="info"
          message={`Có ${Number(stats?.totalSessions || 0).toLocaleString('vi-VN')} buổi học trong 30 ngày nhưng chưa buổi nào ghi luật đã dùng, nên mức dùng theo luật đang để “·”.`}
        />
      )}

      {rules.length === 0 ? (
        <EmptyState
          title="Chưa có luật nào"
          description="Khi không có luật, app dùng phương pháp mặc định. Thêm luật đầu tiên hoặc đưa về bộ luật gốc."
          actionText="Đưa về bộ luật gốc"
          onAction={resetDefault}
        />
      ) : (
        <div className="aip-rules">
          {rules.map((rule, i) => {
            const u = usage.get(rule.id)
            const pct = maxSessions > 0 && u ? Math.round(((u.sessions || 0) / maxSessions) * 100) : 0
            return (
              <div key={rule.id} ref={(el) => (cardRefs.current[rule.id] = el)}>
                <Card className={`aip-rule ${rule.enabled === false ? 'off' : ''} ${hitId === rule.id ? 'hit' : ''}`}>
                  <div>
                    <div className="aip-prio" aria-label={`Ưu tiên ${i + 1}`}>{i + 1}</div>
                    <div className="aip-prio-move">
                      <button type="button" className="aip-icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Đưa lên trên">▲</button>
                      <button type="button" className="aip-icon-btn" disabled={i === rules.length - 1} onClick={() => move(i, 1)} aria-label="Đưa xuống dưới">▼</button>
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 className="aip-rule-title">{rule.title || 'Luật chưa đặt tên'}</h3>
                    <div className="aip-rule-method">{rule.methods}</div>
                    <div className="aip-row" style={{ marginTop: 8 }}>
                      <Chip selected>{rule.subjectName || (rule.matchSubject === 'all' ? 'Mọi môn' : rule.matchSubject)}</Chip>
                      {topicChips(rule).map((t) => (
                        <Chip key={t}>{t}</Chip>
                      ))}
                      {!isStuckRule(rule) && <Chip>{gradeLabel(rule.matchGrade)}</Chip>}
                    </div>
                    <div className="aip-usage aip-small">
                      {statsLine(rule)}
                      {stats && maxSessions > 0 && (
                        <div className="aip-bar" aria-hidden="true">
                          <span style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="aip-rule-side">
                    <Toggle
                      checked={rule.enabled !== false}
                      onChange={(v) => update(rule.id, { enabled: v })}
                      label={rule.enabled === false ? 'Đang tắt' : 'Đang bật'}
                    />
                    <div className="aip-row">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(clone(rule))}>Sửa</Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(rule)}>Xoá</Button>
                    </div>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      <div className="aip-row">
        <span className="aip-small aip-muted">
          {stats === null ? 'Chưa đọc được số liệu buổi học từ máy chủ, mức dùng hiện “·”.' : stats ? `Số liệu từ ${Number(stats?.totalSessions || 0).toLocaleString('vi-VN')} buổi học 30 ngày qua.` : ''}
        </span>
        <span className="aip-spacer" />
        <Button variant="ghost" size="sm" onClick={resetDefault}>Đưa về bộ luật gốc</Button>
      </div>

      <SaveBar
        dirty={dirty}
        busy={busy}
        text={`Có ${changeCount} thay đổi chưa lưu · luật mới áp dụng ngay sau khi lưu`}
        saveText="Lưu luật"
        onSave={save}
        onDiscard={() => setRules(clone(saved))}
      />

      <Drawer
        open={!!editing}
        title={editing && rules.some((r) => r.id === editing.id) ? 'Sửa luật' : 'Thêm luật mới'}
        onClose={() => setEditing(null)}
        width={520}
        footer={
          <div className="aip-row" style={{ justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="ghost" onClick={() => setEditing(null)}>Huỷ</Button>
            <Button onClick={saveEditing}>Xong</Button>
          </div>
        }
      >
        {editing && (
          <div style={{ display: 'grid', gap: 12 }}>
            <Field label="Tên luật">
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Ví dụ: Toán có lời văn lớp 1–3" />
            </Field>
            <Field label="Phương pháp">
              <Input value={editing.methods} onChange={(e) => setEditing({ ...editing, methods: e.target.value })} placeholder="Ví dụ: CPA: đồ vật → hình vẽ → ký hiệu" />
            </Field>
            <Field label="Cách giảng (đưa vào bài giảng)">
              <Textarea rows={4} value={editing.instruction} onChange={(e) => setEditing({ ...editing, instruction: e.target.value })} />
            </Field>
            <Field label="Lỗi trẻ hay gặp">
              <Input value={editing.common_mistake || ''} onChange={(e) => setEditing({ ...editing, common_mistake: e.target.value })} />
            </Field>
            {!isStuckRule(editing) && (
              <>
                <Field label="Môn">
                  <Select
                    value={SUBJECT_OPTIONS.some((o) => o.value === editing.matchSubject) ? editing.matchSubject : undefined}
                    placeholder={editing.matchSubject || 'Chọn môn'}
                    options={SUBJECT_OPTIONS}
                    onChange={(v, o) => setEditing({ ...editing, matchSubject: v, subjectName: o?.name || editing.subjectName })}
                    ariaLabel="Môn"
                  />
                </Field>
                <Field label="Lớp áp dụng" hint="Không chọn lớp nào nghĩa là mọi lớp">
                  <div className="aip-row">
                    {[1, 2, 3, 4, 5].map((g) => {
                      const cur = editing.matchGrade && editing.matchGrade !== 'all' ? String(editing.matchGrade).split('|') : []
                      const on = cur.includes(String(g))
                      return (
                        <Chip
                          key={g}
                          selected={on}
                          onClick={() => {
                            const next = on ? cur.filter((x) => x !== String(g)) : [...cur, String(g)]
                            next.sort()
                            setEditing({ ...editing, matchGrade: next.length ? next.join('|') : 'all' })
                          }}
                        >
                          Lớp {g}
                        </Chip>
                      )
                    })}
                  </div>
                </Field>
                <Field label="Từ khoá nhận dạng trong đề" hint="Ngăn cách bằng dấu |, ví dụ: chu vi|diện tích|hình chữ nhật">
                  <Input value={editing.keywords || ''} onChange={(e) => setEditing({ ...editing, keywords: e.target.value })} />
                </Field>
                <Field label="Dạng bài khớp" hint="So với tên dạng bài app nhận ra, ngăn cách bằng dấu |">
                  <Input value={editing.matchTopic || ''} onChange={(e) => setEditing({ ...editing, matchTopic: e.target.value })} />
                </Field>
              </>
            )}
            <Toggle checked={editing.enabled !== false} onChange={(v) => setEditing({ ...editing, enabled: v })} label="Bật luật này" />
          </div>
        )}
      </Drawer>
    </div>
  )
}
