/**
 * Mô hình & tham số (Đợt 15 · Chặng 3)
 * - Select / Slider của bộ quy chuẩn, không dùng <select> mặc định
 * - Số lần lộ đáp án tuần này đọc từ guard_log qua /api/v1/admin/safety-summary; không đọc được thì hiện "·"
 * - Lưu qua PUT /api/v1/admin/model-config (dùng chung khoá cấu hình với Prompt Studio), có ghi nhật ký thao tác
 */
import { useEffect, useMemo, useState } from 'react'
import { PageHeader, Card, Field, Select, Slider, Segmented, StatusPill, SaveBar, Banner, staffToast } from '../ui/staff'
import { adminJson, errMessage } from './systemShared'
import './pages-system.css'

export const MODEL_OPTIONS = [
  { value: 'cloudflare-llama-3.3-70b', label: 'Llama 3.3 70B · Cloudflare Workers AI', hint: 'Đang chạy trên Worker, gói miễn phí' },
  { value: 'gemini-1-5-flash', label: 'Gemini Flash', hint: 'Chưa gắn khoá API', disabled: true },
  { value: 'claude-3-7-sonnet', label: 'Claude Sonnet', hint: 'Chưa gắn khoá API', disabled: true },
  { value: 'gpt-4o', label: 'GPT-4o', hint: 'Chưa gắn khoá API', disabled: true },
]

const TOKEN_OPTIONS = [
  { value: 1024, label: '1.024 token (khoảng 750 chữ)' },
  { value: 1500, label: '1.500 token (mặc định)' },
  { value: 2048, label: '2.048 token (khoảng 1.500 chữ)' },
  { value: 4096, label: '4.096 token (bài nhiều bước)' },
]

const DEFAULTS = { model: 'cloudflare-llama-3.3-70b', temperature: 0.3, max_tokens: 1500, timeout_ms: 30000, parent_comment_words: 150 }

function tempHint(t) {
  if (t < 0.2) return 'Rất chặt chẽ, hợp bài công thức'
  if (t <= 0.5) return 'Cân bằng, hợp gợi mở sư phạm'
  return 'Sáng tạo, câu hỏi đa dạng hơn'
}

export default function ModelParamsPage({ adminProfile }) {
  const [saved, setSaved] = useState(null) // cấu hình trên máy chủ
  const [form, setForm] = useState(DEFAULTS)
  const [loadState, setLoadState] = useState('loading') // loading | ok | empty | error
  const [busy, setBusy] = useState(false)
  const [leaked, setLeaked] = useState(undefined) // số câu lộ đáp án lọt tới con trong 7 ngày
  const [guardTotal, setGuardTotal] = useState(null)
  const canEdit = ['superadmin', 'editor'].includes(adminProfile?.role || 'superadmin')

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [cfg, safety] = await Promise.all([adminJson('/api/v1/admin/model-config'), adminJson('/api/v1/admin/safety-summary')])
      if (!alive) return
      if (cfg.ok) {
        const c = cfg.data?.config
        const merged = { ...DEFAULTS, ...(c || {}) }
        setSaved(merged)
        setForm(merged)
        setLoadState(c ? 'ok' : 'empty')
      } else {
        setSaved({ ...DEFAULTS })
        setLoadState('error')
      }
      const g = safety.ok ? safety.data?.guard : null
      setLeaked(g ? g.leaked : null)
      setGuardTotal(g ? g.total : null)
    })()
    return () => {
      alive = false
    }
  }, [])

  const dirty = useMemo(() => saved && Object.keys(DEFAULTS).some((k) => String(form[k]) !== String(saved[k])), [form, saved])
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    setBusy(true)
    const prev = saved
    const r = await adminJson('/api/v1/admin/model-config', { method: 'PUT', body: form })
    setBusy(false)
    if (!r.ok) {
      staffToast(errMessage(r, 'Chưa lưu được tham số'), { tone: 'bad' })
      return
    }
    const next = { ...DEFAULTS, ...(r.data?.config || form) }
    setSaved(next)
    setForm(next)
    setLoadState('ok')
    staffToast('Đã lưu tham số mô hình. Điện thoại phụ huynh nhận bản mới trong tối đa 10 phút.', {
      undo: async () => {
        const u = await adminJson('/api/v1/admin/model-config', { method: 'PUT', body: prev })
        if (u.ok) {
          setSaved(prev)
          setForm(prev)
          staffToast('Đã hoàn tác')
        } else staffToast(errMessage(u, 'Chưa hoàn tác được'), { tone: 'bad' })
      },
    })
  }

  const leakLabel = leaked === undefined ? 'Đang đọc…' : leaked === null ? '·' : `${Number(leaked || 0).toLocaleString('vi-VN')} lần lộ đáp án lọt tới con`

  return (
    <div className="sys-page">
      <PageHeader
        title="Mô hình & tham số"
        description="Mô hình AI và các thông số sinh câu hỏi. Dùng chung với bàn thử của Prompt Studio."
        status={loadState === 'ok' ? { tone: 'ok', label: 'Đã lưu trên máy chủ' } : loadState === 'empty' ? { tone: 'info', label: 'Đang dùng mặc định' } : null}
      />
      {loadState === 'error' && <Banner type="warn" message="Chưa đọc được cấu hình trên máy chủ. Các ô đang hiện giá trị mặc định." />}
      {!canEdit && <Banner type="info" message="Vai trò của bạn chỉ được xem, không lưu được tham số." />}

      <div className="sys-grid-2">
        <Card>
          <div className="sys-stack">
            <div>
              <h3 className="sys-card-title">Mô hình AI</h3>
              <p className="sys-card-desc">Chỉ chọn được mô hình đã gắn trên Worker.</p>
            </div>
            <Field label="Mô hình chính">
              <Select ariaLabel="Mô hình chính" value={form.model} onChange={(v) => set('model', v)} options={MODEL_OPTIONS} disabled={!canEdit} />
            </Field>
            <div>
              <Slider
                label="Độ sáng tạo (temperature)"
                min={0}
                max={1}
                step={0.05}
                value={Number(form.temperature)}
                onChange={(v) => set('temperature', Math.round(v * 100) / 100)}
                format={(v) => Number(v).toFixed(2)}
                disabled={!canEdit}
              />
              <div className="sys-row-between sys-muted" style={{ marginTop: 4 }}>
                <span>{tempHint(Number(form.temperature))}</span>
                <span>Khuyên dùng 0,30</span>
              </div>
            </div>
            <Field label="Độ dài tối đa mỗi câu trả lời">
              <Select ariaLabel="Độ dài tối đa" value={Number(form.max_tokens)} onChange={(v) => set('max_tokens', v)} options={TOKEN_OPTIONS} disabled={!canEdit} />
            </Field>
            <div>
              <Slider
                label="Thời gian chờ AI tối đa"
                min={5000}
                max={60000}
                step={5000}
                value={Number(form.timeout_ms)}
                onChange={(v) => set('timeout_ms', v)}
                format={(v) => `${Math.round(v / 1000)} giây`}
                disabled={!canEdit}
              />
            </div>
            <Field label="Độ dài nhận xét tuần cho phụ huynh">
              <Segmented
                value={Number(form.parent_comment_words)}
                onChange={(v) => canEdit && set('parent_comment_words', v)}
                options={[
                  { value: 100, label: '100 chữ' },
                  { value: 150, label: '150 chữ' },
                  { value: 250, label: '250 chữ' },
                ]}
              />
            </Field>
          </div>
        </Card>

        <div className="sys-stack">
          <Card>
            <div className="sys-rule">
              <div className="sys-row" style={{ gap: 8 }}>
                <span aria-hidden="true">🔒</span>
                <h4>Không bao giờ đưa đáp án cho con</h4>
              </div>
              <StatusPill status="warn" label="Luật khoá cứng, không tắt được" style={{ marginTop: 6 }} />
              <p>Mọi câu dành cho con chỉ gợi mở, dẫn dắt. Bộ chặn trên Worker kiểm từng câu AI sinh ra và thay câu an toàn trước khi trả về app.</p>
            </div>
            <div className="sys-status-line">
              <span>7 ngày qua</span>
              {leaked === null ? (
                <span className="sys-muted" title="Chưa đọc được nhật ký bộ chặn">· Chưa có dữ liệu</span>
              ) : (
                <StatusPill status={leaked > 0 ? 'bad' : leaked === undefined ? 'info' : 'ok'} label={leakLabel} />
              )}
            </div>
            {guardTotal !== null && guardTotal !== undefined && (
              <p className="sys-muted" style={{ margin: '8px 2px 0' }}>
                Bộ chặn đã can thiệp {Number(guardTotal || 0).toLocaleString('vi-VN')} lần trong 7 ngày (nguồn: nhật ký bộ chặn).
              </p>
            )}
          </Card>
          <Card>
            <h4 className="sys-card-title" style={{ fontSize: 14, marginBottom: 8 }}>4 nguyên tắc của AI Kèm Con</h4>
            <ul className="sys-principles">
              <li><b>Hỏi thay vì trả lời:</b> dẫn dắt bằng câu hỏi ngắn dưới 25 chữ.</li>
              <li><b>Đồ vật, hình vẽ, rồi mới phép tính:</b> đi từ cụ thể tới ký hiệu.</li>
              <li><b>Đồng hành cùng bố mẹ:</b> hướng dẫn cách gợi mở, không làm bài hộ.</li>
              <li><b>Khen quá trình:</b> khen sự cố gắng và kiên nhẫn, không khen điểm số.</li>
            </ul>
          </Card>
        </div>
      </div>

      {canEdit && <SaveBar dirty={Boolean(dirty)} busy={busy} text="Có thay đổi tham số chưa lưu" onSave={save} onDiscard={() => setForm(saved)} />}
    </div>
  )
}
