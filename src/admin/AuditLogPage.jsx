/**
 * Nhật ký thao tác (Đợt 15 · Chặng 3)
 * Bộ lọc người, loại thao tác, khoảng ngày; dòng thời gian; "So sánh trước/sau" khi bản ghi có before/after; xuất CSV trên trình duyệt.
 * Đọc /api/v1/admin/audit-logs2 (có lọc), máy chủ cũ thì lùi về /api/v1/admin/audit-logs.
 */
import { useEffect, useMemo, useState } from 'react'
import { PageHeader, Card, Button, Select, Segmented, Input, EmptyState, Drawer, StatusPill, Banner, staffToast } from '../ui/staff'
import { adminJson, errMessage, fmtDateTime, fmtShortWhen, downloadCsv, parseServerTime } from './systemShared'
import './pages-system.css'

const ACTION_LABELS = {
  CREATE_ADMIN: 'Tạo quản trị viên',
  SQL_QUERY: 'Chạy SQL',
  SQL_REJECTED: 'SQL bị chặn',
  SQL_ERROR: 'SQL lỗi',
  SQL_TIMEOUT: 'SQL quá thời gian',
  UPDATE_MODEL_CONFIG: 'Đổi tham số mô hình',
  SET_AUTO_LOCK: 'Đổi thời gian tự khoá',
  PUBLISH_THEME: 'Phát hành giao diện',
  DISABLE_THEME: 'Tắt giao diện',
  APPROVE_TEACHER: 'Duyệt giáo viên',
  REJECT_TEACHER: 'Từ chối giáo viên',
  DELETE_FAMILY: 'Xoá gia đình',
  RESET_PASSWORD: 'Đặt lại mật khẩu',
}
const actionLabel = (a) => ACTION_LABELS[a] || String(a || '·').replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
const actionTone = (a) => (/DELETE|REJECT|ERROR|TIMEOUT|DISABLE/.test(a || '') ? 'bad' : /SQL|LOCK|PIN|ADMIN/.test(a || '') ? 'warn' : /PUBLISH|APPROVE/.test(a || '') ? 'ok' : 'info')

function toYmd(d) {
  const z = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}
function rangeFor(preset) {
  const now = new Date()
  const from = new Date(now)
  if (preset === 'today') return { from: toYmd(now), to: toYmd(now) }
  from.setDate(now.getDate() - (preset === '30d' ? 29 : 6))
  return { from: toYmd(from), to: toYmd(now) }
}
/** Lấy cặp trước/sau nếu bản ghi có */
function beforeAfter(details) {
  if (!details || typeof details !== 'object') return null
  const b = details.before ?? details.old ?? details.prev
  const a = details.after ?? details.new ?? details.next
  if (b === undefined && a === undefined) return null
  return { before: b ?? null, after: a ?? null }
}
function flatPairs(before, after) {
  const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x)
  if (!isObj(before) || !isObj(after)) return null
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))
  return keys.map((k) => ({ key: k, b: before[k], a: after[k], changed: JSON.stringify(before[k]) !== JSON.stringify(after[k]) }))
}
const show = (v) => (v === undefined || v === null ? '·' : typeof v === 'object' ? JSON.stringify(v) : String(v))

export default function AuditLogPage() {
  const [logs, setLogs] = useState([])
  const [actors, setActors] = useState([])
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [legacy, setLegacy] = useState(false)
  const [actor, setActor] = useState('')
  const [action, setAction] = useState('')
  const [preset, setPreset] = useState('7d')
  const [from, setFrom] = useState(rangeFor('7d').from)
  const [to, setTo] = useState(rangeFor('7d').to)
  const [q, setQ] = useState('')
  const [diff, setDiff] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    const p = new URLSearchParams()
    if (actor) p.set('actor', actor)
    if (action) p.set('action', action)
    // Đổi ngày theo giờ máy người xem sang mốc UTC mà D1 đang lưu
    const utc = (d) => d.toISOString().slice(0, 19).replace('T', ' ')
    if (from) p.set('from', utc(new Date(from + 'T00:00:00')))
    if (to) p.set('to', utc(new Date(to + 'T23:59:59')))
    p.set('limit', '500')
    const r = await adminJson(`/api/v1/admin/audit-logs2?${p.toString()}`)
    if (r.ok) {
      setLegacy(false)
      setLogs(r.data?.logs || [])
      if (Array.isArray(r.data?.actors)) setActors(r.data.actors)
      if (Array.isArray(r.data?.actions)) setActions(r.data.actions)
    } else if (r.status === 404 || r.status === 405) {
      // Máy chủ chưa có bản lọc: lấy 100 dòng mới nhất rồi lọc trên trình duyệt
      const o = await adminJson('/api/v1/admin/audit-logs')
      if (o.ok) {
        setLegacy(true)
        const all = o.data?.logs || o.data?.audit_logs || []
        setLogs(all)
        setActors(Array.from(new Set(all.map((x) => x.actor_id))).map((id) => ({ id })))
        setActions(Array.from(new Set(all.map((x) => x.action))).sort())
      } else {
        setLogs([])
        setError(errMessage(o, 'Chưa tải được nhật ký'))
      }
    } else {
      setLogs([])
      setError(errMessage(r, 'Chưa tải được nhật ký'))
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [actor, action, from, to])

  const pickPreset = (v) => {
    setPreset(v)
    if (v !== 'custom') {
      const r = rangeFor(v)
      setFrom(r.from)
      setTo(r.to)
    }
  }

  const shown = useMemo(() => {
    let l = logs
    if (legacy) {
      const f = from ? new Date(from + 'T00:00:00') : null
      const t = to ? new Date(to + 'T23:59:59') : null
      l = l.filter((x) => {
        const d = parseServerTime(x.created_at)
        if (actor && x.actor_id !== actor) return false
        if (action && x.action !== action) return false
        if (f && d && d < f) return false
        if (t && d && d > t) return false
        return true
      })
    }
    const s = q.trim().toLowerCase()
    if (s) l = l.filter((x) => [x.target_type, x.target_id, x.action, x.actor_email, x.actor_id].some((v) => String(v || '').toLowerCase().includes(s)))
    return l
  }, [logs, legacy, q, actor, action, from, to])

  const actorName = (x) => x.actor_email || actors.find((a) => a.id === x.actor_id)?.email || x.actor_id || '·'
  const actorOptions = [{ value: '', label: 'Mọi người' }, ...actors.map((a) => ({ value: a.id, label: a.email || a.id }))]
  const actionOptions = [{ value: '', label: 'Mọi loại thao tác' }, ...actions.map((a) => ({ value: a, label: actionLabel(a) }))]

  const exportCsv = () => {
    if (!shown.length) {
      staffToast('Không có dòng nào để xuất', { tone: 'bad' })
      return
    }
    downloadCsv(
      `nhat-ky-thao-tac-${from || 'all'}-${to || 'all'}.csv`,
      [
        { title: 'Thời gian', get: (r) => fmtDateTime(r.created_at) },
        { title: 'Người làm', get: (r) => actorName(r) },
        { title: 'Thao tác', get: (r) => actionLabel(r.action) },
        { title: 'Mã thao tác', key: 'action' },
        { title: 'Loại đối tượng', key: 'target_type' },
        { title: 'Đối tượng', key: 'target_id' },
        { title: 'Chi tiết', get: (r) => (r.details ? JSON.stringify(r.details) : '') },
        { title: 'IP', key: 'ip' },
      ],
      shown
    )
    staffToast(`Đã xuất ${shown.length.toLocaleString('vi-VN')} dòng`)
  }

  const pairs = diff ? flatPairs(diff.ba.before, diff.ba.after) : null

  return (
    <div className="sys-page">
      <PageHeader
        title="Nhật ký thao tác"
        description="Mọi thay đổi quan trọng của quản trị viên, không sửa hay xoá được."
        actions={<Button variant="ghost" onClick={exportCsv}>⤓ Xuất CSV</Button>}
      />

      <div className="sys-filters">
        <Select ariaLabel="Lọc theo người" value={actor} onChange={setActor} options={actorOptions} size="sm" />
        <Select ariaLabel="Lọc theo loại thao tác" value={action} onChange={setAction} options={actionOptions} size="sm" />
        <Segmented
          value={preset}
          onChange={pickPreset}
          options={[
            { value: 'today', label: 'Hôm nay' },
            { value: '7d', label: '7 ngày' },
            { value: '30d', label: '30 ngày' },
            { value: 'custom', label: 'Tuỳ chọn' },
          ]}
        />
        {preset === 'custom' && (
          <>
            <label className="sys-date">
              Từ <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="sys-date">
              đến <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
            </label>
          </>
        )}
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo đối tượng…" prefix="🔍" style={{ minWidth: 200, flex: '1 1 200px' }} aria-label="Tìm theo đối tượng" />
      </div>

      {legacy && <Banner type="info" message="Máy chủ chưa hỗ trợ lọc, đang lọc trên 100 dòng mới nhất." />}

      <Card>
        {loading ? (
          <div className="sk-table-empty">Đang tải…</div>
        ) : error ? (
          <EmptyState mood="nudge" title="Chưa tải được nhật ký" description={error} actionText="Thử lại" onAction={load} style={{ border: 'none', boxShadow: 'none' }} />
        ) : shown.length === 0 ? (
          <EmptyState
            title="Chưa có thao tác nào trong khoảng này"
            description="Mọi lần lưu, duyệt, xoá của quản trị viên sẽ hiện ở đây."
            style={{ border: 'none', boxShadow: 'none' }}
          />
        ) : (
          <div className="sys-timeline">
            {shown.map((x) => {
              const ba = beforeAfter(x.details)
              const who = actorName(x)
              return (
                <div key={x.id ?? `${x.created_at}-${x.action}`} className="sys-tl-row">
                  <span className="sys-tl-when" title={fmtDateTime(x.created_at)}>{fmtShortWhen(x.created_at)}</span>
                  <span className="sys-who" title={who} aria-hidden="true">{String(who).trim()[0]?.toUpperCase() || '?'}</span>
                  <span className="sys-tl-main">
                    <b>{actionLabel(x.action)}</b>
                    {(x.target_type || x.target_id) && (
                      <>
                        {' '}· {x.target_type || ''}
                        {x.target_id ? `: ${x.target_id}` : ''}
                      </>
                    )}
                    <br />
                    <small>{who}{x.details?.sql ? ` · ${String(x.details.sql).slice(0, 80)}` : ''}</small>
                  </span>
                  {ba ? (
                    <Button size="sm" variant="ghost" onClick={() => setDiff({ row: x, ba })}>So sánh trước/sau</Button>
                  ) : (
                    <StatusPill status={actionTone(x.action)} label={x.action || '·'} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Drawer open={Boolean(diff)} title="So sánh trước và sau" onClose={() => setDiff(null)} width={640}>
        {diff && (
          <div className="sys-stack">
            <div className="sys-muted">
              <b style={{ color: 'var(--s-text)' }}>{actionLabel(diff.row.action)}</b> · {actorName(diff.row)} · {fmtDateTime(diff.row.created_at)}
            </div>
            {pairs ? (
              <div>
                <div className="sys-diff-row sys-label" style={{ borderBottomStyle: 'solid' }}>
                  <span>Mục</span>
                  <span>Trước</span>
                  <span>Sau</span>
                </div>
                {pairs.map((p) => (
                  <div key={p.key} className="sys-diff-row">
                    <span className="sys-mono">{p.key}</span>
                    <span className={p.changed ? 'sys-b' : ''}>{show(p.b)}</span>
                    <span className={p.changed ? 'sys-a' : ''}>{show(p.a)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sys-diff">
                <div>
                  <div className="sys-label">Trước</div>
                  <pre className="sys-before">{JSON.stringify(diff.ba.before, null, 2)}</pre>
                </div>
                <div>
                  <div className="sys-label">Sau</div>
                  <pre className="sys-after">{JSON.stringify(diff.ba.after, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
