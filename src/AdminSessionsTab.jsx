/**
 * 📚 BUỔI HỌC & AI · Đợt 15 chặng 3 (đổi tên từ "Nhật ký & AI")
 * Bảng buổi học thật (GET /api/v1/admin/learning-sessions), chỉ số kiểm định
 * (GET /api/v1/admin/sessions-stats), chi tiết buổi trong Drawer
 * (GET /api/v1/admin/session-detail?id=, dự phòng /learning-sessions/:id).
 * Đã bỏ khối "Nguyên tắc vàng" vì trùng với trang Mô hình & tham số.
 */
import React, { useEffect, useRef, useState } from 'react'
import { PageHeader, KpiCard, Card, Button, Input, Select, DataTable, Drawer, StatusPill, Banner, Pagination, staffToast } from './ui/staff'
import { adminFetch } from './adminApi'
import { getJson, fmtDateTime, fmtTime, fmtNum, gradeLabel, minutesLabel, parseDbTime, ratingInfo, validatorInfo } from './admin/monitorShared'
import './admin/pages-monitor.css'

const PAGE_SIZE = 15
const GRADE_OPTIONS = [{ value: '', label: 'Mọi lớp' }, ...[1, 2, 3, 4, 5].map((g) => ({ value: String(g), label: `Lớp ${g}` }))]
const SUBJECT_OPTIONS = [
  { value: '', label: 'Mọi môn' },
  { value: 'Toán', label: 'Toán' },
  { value: 'Tiếng Việt', label: 'Tiếng Việt' },
  { value: 'Tiếng Anh', label: 'Tiếng Anh' },
]
const CHECK_OPTIONS = [
  { value: '', label: 'Mọi kết quả kiểm định' },
  { value: 'da_chan', label: 'Đã chặn lộ đáp án' },
  { value: 'canh_bao', label: 'Cảnh báo sư phạm' },
  { value: 'lot', label: 'Bị lọt, cần xem lại' },
]
const EVENT_LABEL = {
  start: 'Bắt đầu bài',
  step_hint: 'Mở gợi ý',
  hint: 'Mở gợi ý',
  step_done: 'Xong một bậc',
  stuck: 'Con bị vướng',
  answer_peek: 'Phụ huynh giữ để xem đáp án',
  finish: 'Hoàn thành buổi học',
  end: 'Kết thúc buổi học',
}

/** Thời lượng thật từ started_at và ended_at; buổi chưa kết thúc thì không đoán. */
function durationOf(s) {
  const a = parseDbTime(s?.started_at)
  const b = parseDbTime(s?.ended_at)
  return a && b && b > a ? (b - a) / 1000 : null
}

function SessionDrawer({ session, onClose, onOpenPromptStudio }) {
  const [detail, setDetail] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!session) return
    let alive = true
    setLoading(true)
    setDetail(null)
    setEvents([])
    ;(async () => {
      let r = await getJson(`/api/v1/admin/session-detail?id=${encodeURIComponent(session.id)}`)
      let evs = null
      if (r.ok) evs = r.data.events || []
      else {
        r = await getJson(`/api/v1/admin/learning-sessions/${encodeURIComponent(session.id)}`)
        if (r.ok) evs = (r.data.events || []).map((e) => ({ id: e.id, type: e.event_type || e.type, step: e.step_index ?? e.step, at: e.created_at || e.ts }))
      }
      if (!alive) return
      if (r.ok) {
        setDetail(r.data.session || null)
        setEvents(evs || [])
      }
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [session?.id])

  if (!session) return null
  const s = detail || session
  const v = validatorInfo(s)
  const rating = ratingInfo(s)

  async function saveExample() {
    setSaving(true)
    try {
      const res = await adminFetch('/api/v1/admin/examples', {
        method: 'POST',
        body: JSON.stringify({
          title: [s.subject, gradeLabel(s.grade), s.family_name].filter(Boolean).join(' · '),
          subject: s.subject || '',
          grade: s.grade != null ? String(s.grade) : '',
          problemText: s.problem_text || '',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) staffToast('Đã lưu vào thư viện ví dụ mẫu của Prompt Studio')
      else staffToast(data.error?.message || 'Chưa lưu được ví dụ mẫu', { tone: 'bad' })
    } catch (e) {
      staffToast('Mất kết nối máy chủ, thử lại sau', { tone: 'bad' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      open
      title={[s.subject, gradeLabel(s.grade)].filter(Boolean).join(' · ') || 'Chi tiết buổi học'}
      onClose={onClose}
      width={560}
      footer={
        <div className="pm-actions">
          <Button onClick={saveExample} disabled={saving || !s.problem_text}>
            {saving ? 'Đang lưu…' : 'Lưu làm ví dụ mẫu'}
          </Button>
          {onOpenPromptStudio && (
            <Button
              variant="ghost"
              onClick={() => {
                onClose()
                onOpenPromptStudio()
              }}
            >
              Mở trong bàn thử
            </Button>
          )}
        </div>
      }
    >
      <div className="pm-section">
        <div className="pm-muted">
          {s.family_name || 'Gia đình'}
          {s.child_name ? ` · ${s.child_name}` : ''} · {fmtDateTime(s.started_at)}
        </div>
        <div className="pm-actions">
          <StatusPill status={rating.status} label={rating.label} />
          <StatusPill status={v.status} label={v.label} />
          {Number(s.answer_peeks) > 0 && <StatusPill status="warn" label={`Xem đáp án ${s.answer_peeks} lần`} />}
        </div>
      </div>

      <section className="pm-section">
        <h4 className="pm-section-title">Đề bài</h4>
        <div className="pm-problem">{s.problem_text || <span className="pm-muted">Không hiển thị đề bài với vai trò của bạn, hoặc buổi này chưa lưu đề.</span>}</div>
      </section>

      <section className="pm-section">
        <h4 className="pm-section-title">Tóm tắt</h4>
        <div className="pm-mini-grid">
          <div className="pm-mini">
            <div className="pm-mini-label">Thời lượng</div>
            <div className="pm-mini-value">{minutesLabel(durationOf(s))}</div>
          </div>
          <div className="pm-mini">
            <div className="pm-mini-label">Bậc gợi ý cao nhất</div>
            <div className="pm-mini-value">{s.hint_level_max ?? s.hints_used ?? '·'}</div>
          </div>
          <div className="pm-mini">
            <div className="pm-mini-label">Lần vướng</div>
            <div className="pm-mini-value">{s.stuck_count ?? '·'}</div>
          </div>
          <div className="pm-mini">
            <div className="pm-mini-label">Số bậc đã xong</div>
            <div className="pm-mini-value">{s.steps_done != null ? `${s.steps_done}${s.steps_total ? ` / ${s.steps_total}` : ''}` : '·'}</div>
          </div>
        </div>
      </section>

      <section className="pm-section">
        <h4 className="pm-section-title">Dòng thời gian ({events.length} mốc)</h4>
        {loading ? (
          <p className="pm-muted">Đang tải sự kiện…</p>
        ) : events.length === 0 ? (
          <p className="pm-muted">Buổi này chưa ghi sự kiện chi tiết.</p>
        ) : (
          <ol className="pm-timeline">
            {events.map((e, i) => (
              <li key={e.id || i}>
                <time>{fmtTime(e.at)}</time>
                <span>
                  {EVENT_LABEL[e.type] || e.type || 'Sự kiện'}
                  {e.step != null && e.step !== '' ? ` · bậc ${e.step}` : ''}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Drawer>
  )
}

export function AdminSessionsTab({ token, onOpenPromptStudio }) {
  const [sessions, setSessions] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)

  const [grade, setGrade] = useState('')
  const [subject, setSubject] = useState('')
  const [check, setCheck] = useState('')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(null)
  const firstSearch = useRef(true)

  // Gõ xong 400ms mới tìm
  useEffect(() => {
    if (firstSearch.current) {
      firstSearch.current = false
      return undefined
    }
    const h = setTimeout(() => {
      setPage(1)
      setQuery(search.trim())
    }, 400)
    return () => clearTimeout(h)
  }, [search])

  async function loadSessions() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    if (grade) params.append('grade', grade)
    if (subject) params.append('subject', subject)
    if (check) params.append('status', check)
    if (query) params.append('q', query)
    const r = await getJson(`/api/v1/admin/learning-sessions?${params.toString()}`)
    if (r.ok) {
      setSessions(r.data.sessions || [])
      setTotal(r.data.total || 0)
      setTotalPages(Math.max(1, r.data.totalPages || 1))
      setError('')
    } else {
      setError(r.data?.error?.message || 'Chưa tải được danh sách buổi học.')
    }
    setLoading(false)
  }

  async function loadStats() {
    const r = await getJson('/api/v1/admin/sessions-stats')
    setStats(r.ok ? r.data : null)
  }

  useEffect(() => {
    loadSessions()
  }, [page, grade, subject, check, query])

  useEffect(() => {
    loadStats()
  }, [])

  const filtered = Boolean(grade || subject || check || query)
  const st = stats || {}

  const columns = [
    { key: 'started_at', title: 'Thời gian', render: (v) => <span className="pm-strong">{fmtDateTime(v)}</span> },
    {
      key: 'child_name',
      title: 'Học sinh',
      render: (v, s) => (
        <div>
          <div className="pm-strong">{v || s.family_name || 'Chưa rõ'}</div>
          <div className="pm-muted">{[s.subject, gradeLabel(s.grade)].filter(Boolean).join(' · ') || '·'}</div>
        </div>
      ),
    },
    { key: 'problem_text', title: 'Đề bài', render: (v) => <span className="pm-ellipsis" title={v || ''}>{v || '·'}</span> },
    {
      key: 'hints_used',
      title: 'Gợi ý',
      render: (v, s) => (
        <span>
          {v > 0 ? `Tới bậc ${v}` : v === 0 ? 'Không cần' : '·'}
          {Number(s.answer_peeks) > 0 && <span style={{ color: 'var(--s-bad)' }}> · xem đáp án</span>}
        </span>
      ),
    },
    { key: 'duration', title: 'Thời lượng', render: (_, s) => minutesLabel(durationOf(s)) },
    {
      key: 'rating',
      title: 'Tự đánh giá',
      render: (_, s) => {
        const r = ratingInfo(s)
        return <StatusPill status={r.status} label={r.label} />
      },
    },
    {
      key: 'validator',
      title: 'Kiểm định AI',
      render: (_, s) => {
        const v = validatorInfo(s)
        return <StatusPill status={v.status} label={v.label} />
      },
    },
  ]

  return (
    <div className="pm-page">
      <PageHeader
        title="Buổi học & AI"
        description="Từng buổi kèm học, kết quả bộ kiểm định lộ đáp án và dòng thời gian của mỗi buổi."
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              loadSessions()
              loadStats()
            }}
            disabled={loading}
          >
            {loading ? 'Đang tải…' : 'Tải lại'}
          </Button>
        }
      />

      {error && <Banner type="bad" message={error} actionText="Thử lại" onAction={loadSessions} />}

      <div className="pm-kpis">
        <KpiCard label="Tổng buổi học" value={stats ? fmtNum(st.total) : !filtered && !loading ? fmtNum(total) : null} emptyText={loading ? 'Đang tải…' : 'Chưa có dữ liệu'} sub="Ghi nhận từ app phụ huynh" />
        <KpiCard label="Đạt kiểm định" value={st.passRate != null ? `${st.passRate}%` : null} tone="ok" emptyText="Chưa có buổi nào được kiểm định" sub={st.checked ? `trên ${fmtNum(st.checked)} buổi đã kiểm định` : ''} />
        <KpiCard label="Đã chặn / bị lọt" value={st.blocked != null ? `${fmtNum(st.blocked)} / ${fmtNum(st.leaked)}` : null} tone={Number(st.leaked) > 0 ? 'bad' : 'ok'} emptyText="Chưa có buổi nào được kiểm định" sub={Number(st.leaked) > 0 ? 'Có buổi lọt đáp án, cần xem lại' : 'Chưa có buổi nào lọt đáp án'} />
        <KpiCard label="Báo cáo nội dung chờ xem" value={st.pendingContentReports != null ? fmtNum(st.pendingContentReports) : null} tone={Number(st.pendingContentReports) > 0 ? 'warn' : 'default'} sub="Phụ huynh báo bài giảng chưa đúng" />
      </div>

      <Card>
        <div className="pm-toolbar" style={{ marginBottom: 12 }}>
          <div className="pm-grow">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm đề bài, gia đình hoặc tên con…" prefix="🔍" aria-label="Tìm buổi học" />
          </div>
          <Select value={grade} onChange={(v) => { setGrade(v); setPage(1) }} options={GRADE_OPTIONS} ariaLabel="Lọc theo lớp" style={{ minWidth: 130 }} />
          <Select value={subject} onChange={(v) => { setSubject(v); setPage(1) }} options={SUBJECT_OPTIONS} ariaLabel="Lọc theo môn" style={{ minWidth: 140 }} />
          <Select value={check} onChange={(v) => { setCheck(v); setPage(1) }} options={CHECK_OPTIONS} ariaLabel="Lọc theo kết quả kiểm định" style={{ minWidth: 210 }} />
          {(filtered || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setGrade('')
                setSubject('')
                setCheck('')
                setSearch('')
                setQuery('')
                setPage(1)
              }}
            >
              Bỏ lọc
            </Button>
          )}
        </div>
        <DataTable
          columns={columns}
          data={sessions}
          loading={loading && sessions.length === 0}
          onRowClick={(s) => setOpen(s)}
          emptyTitle={filtered ? 'Không có buổi học khớp bộ lọc' : 'Chưa có buổi học nào'}
          emptyDescription={filtered ? 'Thử bỏ bớt bộ lọc hoặc đổi từ khoá.' : 'Khi phụ huynh kèm con trên app, từng buổi sẽ hiện ở đây kèm kết quả kiểm định.'}
        />
        <div className="pm-toolbar" style={{ justifyContent: 'space-between', marginTop: 10 }}>
          <span className="pm-muted">{total > 0 ? `${fmtNum(total)} buổi${filtered ? ' khớp bộ lọc' : ''}` : ''}</span>
          <Pagination page={page} pageCount={totalPages} onChange={setPage} />
        </div>
      </Card>

      {open && <SessionDrawer session={open} onClose={() => setOpen(null)} onOpenPromptStudio={onOpenPromptStudio} />}
    </div>
  )
}

export default AdminSessionsTab
