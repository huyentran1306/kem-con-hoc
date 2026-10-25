/**
 * 👪 GIA ĐÌNH & HỌC SINH · Đợt 15 chặng 3
 * Danh sách gia đình và chỉ số 7 ngày tính từ D1 (GET /api/v1/admin/families-stats).
 * Bấm một gia đình mở Drawer chi tiết (GET /api/v1/admin/family-detail?id=).
 * Hỗ trợ ?q= trên URL để lọc sẵn. Không có số thật thì hiện "·".
 */
import React, { useEffect, useMemo, useState } from 'react'
import { PageHeader, KpiCard, Card, Button, Input, Select, DataTable, Drawer, StatusPill, Banner, EmptyState, staffToast } from './ui/staff'
import { getJson, fmtDate, fmtAgo, fmtDateTime, fmtNum, gradeLabel, minutesLabel, parseDbTime, ratingInfo, readUrlQuery } from './admin/monitorShared'
import './admin/pages-monitor.css'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Mọi trạng thái' },
  { value: 'active', label: 'Đang học (7 ngày)' },
  { value: 'inactive', label: 'Ít học (8 đến 30 ngày)' },
  { value: 'dormant', label: 'Ngủ đông (trên 30 ngày)' },
  { value: 'never', label: 'Chưa có buổi học' },
]
const STATUS_PILL = {
  active: { status: 'ok', label: 'Đang học' },
  inactive: { status: 'warn', label: 'Ít học' },
  dormant: { status: 'bad', label: 'Ngủ đông' },
  never: { status: 'info', label: 'Chưa có buổi học' },
  unknown: { status: 'info', label: 'Chưa rõ' },
}
const ROLE_LABEL = { owner: 'Chủ nhà', guardian: 'Người kèm con', viewer: 'Chỉ xem' }

/** Trạng thái dựa trên buổi học gần nhất (không dựa vào ngày tạo tài khoản). */
function familyStatus(f) {
  if (f.session_count === undefined) return 'unknown'
  const d = parseDbTime(f.last_session_at)
  if (!d) return 'never'
  const days = (Date.now() - d.getTime()) / 86400000
  if (days <= 7) return 'active'
  if (days <= 30) return 'inactive'
  return 'dormant'
}

function exportCsv(rows) {
  if (!rows.length) {
    staffToast('Không có gia đình nào để xuất', { tone: 'bad' })
    return
  }
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const head = ['Mã gia đình', 'Tên gia đình', 'Ngày tham gia', 'Thành viên', 'Số con', 'Số buổi học', 'Buổi gần nhất', 'Trạng thái']
  const lines = rows.map((f) =>
    [f.id, f.name, fmtDate(f.created_at), f.member_count ?? '', f.child_count ?? '', f.session_count ?? '', f.last_session_at ? fmtDateTime(f.last_session_at) : '', STATUS_PILL[familyStatus(f)].label]
      .map(esc)
      .join(',')
  )
  const blob = new Blob(['﻿' + [head.map(esc).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `kem-con-hoc-gia-dinh-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  staffToast(`Đã xuất ${rows.length} gia đình ra tệp CSV`)
}

function FamilyDrawer({ family, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!family) return
    let alive = true
    setLoading(true)
    setDetail(null)
    setMissing(false)
    getJson(`/api/v1/admin/family-detail?id=${encodeURIComponent(family.id)}`).then((r) => {
      if (!alive) return
      if (r.ok) setDetail(r.data)
      else setMissing(true)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [family?.id])

  if (!family) return null
  const members = detail?.members || []
  const children = detail?.children || []
  const sessions = detail?.sessions || []
  const classes = detail?.classes || []
  const totals = detail?.totals || {}

  return (
    <Drawer open={Boolean(family)} title={family.name || 'Gia đình chưa đặt tên'} onClose={onClose} width={520}>
      <div className="pm-section">
        <div className="pm-muted">
          Mã <span className="pm-code">{family.id}</span> · Tham gia {fmtDate(family.created_at)}
        </div>
        <div className="pm-mini-grid">
          <div className="pm-mini">
            <div className="pm-mini-label">Tổng buổi học</div>
            <div className="pm-mini-value">{detail ? fmtNum(totals.sessions) ?? '·' : fmtNum(family.session_count) ?? '·'}</div>
          </div>
          <div className="pm-mini">
            <div className="pm-mini-label">Tổng phút kèm</div>
            <div className="pm-mini-value">{totals.minutes != null ? fmtNum(totals.minutes) : '·'}</div>
          </div>
        </div>
      </div>

      {loading && <p className="pm-muted">Đang tải chi tiết gia đình…</p>}
      {missing && !loading && <Banner type="warn" message="Chưa tải được chi tiết gia đình này. Thử mở lại sau ít phút." />}

      {detail && (
        <>
          <section className="pm-section">
            <h4 className="pm-section-title">Các con ({children.length})</h4>
            {children.length === 0 ? (
              <p className="pm-muted">Gia đình chưa thêm hồ sơ con.</p>
            ) : (
              <ul className="pm-list">
                {children.map((c, i) => (
                  <li className="pm-list-item" key={c.id || i}>
                    <b>
                      {c.emoji ? `${c.emoji} ` : ''}
                      {c.name || 'Chưa đặt tên'}
                    </b>
                    <span className="pm-muted">{gradeLabel(c.grade) || '·'}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="pm-section">
            <h4 className="pm-section-title">Thành viên ({members.length})</h4>
            {members.length === 0 ? (
              <p className="pm-muted">Chưa có thành viên.</p>
            ) : (
              <ul className="pm-list">
                {members.map((mb) => (
                  <li className="pm-list-item" key={mb.id}>
                    <span>
                      <b>{mb.display_name || 'Thành viên'}</b>
                      {mb.relation && mb.relation !== 'owner' && <span className="pm-muted"> · {mb.relation}</span>}
                      <span className="pm-muted" style={{ display: 'block' }}>
                        Lần cuối mở app: {mb.last_seen_at ? fmtAgo(mb.last_seen_at) : '·'}
                      </span>
                    </span>
                    <StatusPill status={mb.role === 'owner' ? 'ok' : 'info'} label={ROLE_LABEL[mb.role] || mb.role || '·'} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="pm-section">
            <h4 className="pm-section-title">Lớp đã tham gia ({classes.length})</h4>
            {classes.length === 0 ? (
              <p className="pm-muted">Chưa liên kết với lớp nào của giáo viên.</p>
            ) : (
              <ul className="pm-list">
                {classes.map((c) => (
                  <li className="pm-list-item" key={c.link_id}>
                    <span>
                      <b>{c.class_name || 'Lớp'}</b>
                      <span className="pm-muted" style={{ display: 'block' }}>
                        {[c.teacher_name ? `Giáo viên: ${c.teacher_name}` : null, c.school_name, c.roster_name ? `tên trong lớp: ${c.roster_name}` : null]
                          .filter(Boolean)
                          .join(' · ') || '·'}
                      </span>
                    </span>
                    <StatusPill status={c.status === 'active' ? 'ok' : c.status === 'pending' ? 'review' : 'info'} label={c.status === 'active' ? 'Đang học' : c.status === 'pending' ? 'Chờ cô duyệt' : c.status || '·'} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="pm-section">
            <h4 className="pm-section-title">Buổi học gần nhất</h4>
            {sessions.length === 0 ? (
              <p className="pm-muted">Gia đình chưa có buổi học nào.</p>
            ) : (
              <ul className="pm-list">
                {sessions.map((s) => {
                  const r = ratingInfo(s)
                  return (
                    <li className="pm-list-item" key={s.id}>
                      <span style={{ minWidth: 0 }}>
                        <b>{[s.subject, gradeLabel(s.grade)].filter(Boolean).join(' · ') || 'Buổi học'}</b>
                        <span className="pm-muted" style={{ display: 'block' }}>
                          {fmtDateTime(s.started_at)}
                          {s.child_name ? ` · ${s.child_name}` : ''} · {minutesLabel(s.duration_seconds)}
                        </span>
                        {s.problem_text && (
                          <span className="pm-ellipsis pm-muted" title={s.problem_text}>
                            {s.problem_text}
                          </span>
                        )}
                      </span>
                      <StatusPill status={r.status} label={r.label} />
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </Drawer>
  )
}

export function AdminFamiliesTab({ token }) {
  const [families, setFamilies] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState(() => readUrlQuery('q'))
  const [status, setStatus] = useState('all')
  const [open, setOpen] = useState(null)

  async function load() {
    setLoading(true)
    const r = await getJson('/api/v1/admin/families-stats')
    if (r.ok) {
      setFamilies(r.data.families || [])
      setSummary(r.data.summary || null)
      setError('')
    } else {
      const legacy = await getJson('/api/v1/admin/families')
      if (legacy.ok) {
        setFamilies(legacy.data.families || [])
        setSummary(null)
        setError('')
      } else {
        setError(legacy.data?.error?.message || 'Chưa tải được danh sách gia đình.')
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  // Theo dõi ?q= khi thanh tìm kiếm chung đổi URL
  useEffect(() => {
    const onNav = () => {
      const q = readUrlQuery('q')
      if (q) setSearch(q)
    }
    window.addEventListener('popstate', onNav)
    window.addEventListener('hashchange', onNav)
    return () => {
      window.removeEventListener('popstate', onNav)
      window.removeEventListener('hashchange', onNav)
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return families.filter((f) => {
      const okQ = !q || String(f.name || '').toLowerCase().includes(q) || String(f.id || '').toLowerCase().includes(q)
      const okS = status === 'all' || familyStatus(f) === status
      return okQ && okS
    })
  }, [families, search, status])

  const hasStats = families.length > 0 && families[0].session_count !== undefined
  const columns = [
    {
      key: 'name',
      title: 'Gia đình',
      render: (v, f) => (
        <div>
          <div className="pm-strong">{v || 'Chưa đặt tên'}</div>
          <span className="pm-code">{f.id}</span>
        </div>
      ),
    },
    { key: 'created_at', title: 'Tham gia', render: (v) => fmtDate(v) },
    ...(hasStats
      ? [
          { key: 'member_count', title: 'Thành viên', align: 'right', render: (v) => fmtNum(v) ?? '·' },
          { key: 'child_count', title: 'Số con', align: 'right', render: (v) => (Number(v) > 0 ? fmtNum(v) : '·') },
          { key: 'session_count', title: 'Buổi học', align: 'right', render: (v) => fmtNum(v) ?? '·' },
          { key: 'last_session_at', title: 'Buổi gần nhất', render: (v) => (v ? fmtAgo(v) : '·') },
        ]
      : []),
    {
      key: 'status',
      title: 'Trạng thái',
      render: (_, f) => {
        const p = STATUS_PILL[familyStatus(f)]
        return <StatusPill status={p.status} label={p.label} />
      },
    },
  ]

  const s = summary || {}
  return (
    <div className="pm-page">
      <PageHeader
        title="Gia đình & học sinh"
        description="Các gia đình đang dùng app, mức đều đặn trong 7 ngày và chi tiết từng nhà khi bấm vào."
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
              {loading ? 'Đang tải…' : 'Tải lại'}
            </Button>
            <Button size="sm" onClick={() => exportCsv(filtered)} disabled={!filtered.length}>
              Xuất CSV
            </Button>
          </>
        }
      />

      {error && <Banner type="bad" message={error} actionText="Thử lại" onAction={load} />}

      <div className="pm-kpis">
        <KpiCard label="Tổng gia đình" value={loading && !families.length ? null : fmtNum(s.totalFamilies ?? families.length)} emptyText={loading ? 'Đang tải…' : 'Chưa có dữ liệu'} sub={s.activeFamilies7d != null ? `${fmtNum(s.activeFamilies7d)} nhà có buổi học trong 7 ngày` : 'Tài khoản gia đình trên hệ thống'} />
        <KpiCard label="Ngày học trung bình" value={s.avgStudyDays7d != null ? `${fmtNum(s.avgStudyDays7d, 1)} ngày` : null} emptyText="Chưa có buổi học trong 7 ngày" sub="Số ngày có học trong 7 ngày, mỗi nhà đang học" />
        <KpiCard label="Phút kèm mỗi tuần" value={s.avgMinutesPerWeek != null ? `${fmtNum(s.avgMinutesPerWeek)} phút` : null} emptyText="Chưa đo được thời lượng" sub="Trung bình mỗi nhà đang học, 7 ngày qua" />
        <KpiCard label="Mở app trong 7 ngày" value={s.openedApp7dPct != null ? `${s.openedApp7dPct}%` : null} emptyText="Chưa có dữ liệu" sub="Tỉ lệ gia đình có thành viên mở app" />
      </div>

      <Card>
        <div className="pm-toolbar" style={{ marginBottom: 12 }}>
          <div className="pm-grow">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên hoặc mã gia đình…" prefix="🔍" aria-label="Tìm gia đình" />
          </div>
          <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} ariaLabel="Lọc theo trạng thái" style={{ minWidth: 220 }} />
          {(search || status !== 'all') && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatus('all') }}>
              Bỏ lọc
            </Button>
          )}
          <span className="pm-muted">
            {fmtNum(filtered.length)} / {fmtNum(families.length)} gia đình
          </span>
        </div>
        {!loading && families.length === 0 && !error ? (
          <EmptyState title="Chưa có gia đình nào" description="Khi phụ huynh tạo tài khoản trên app, gia đình sẽ hiện ở đây." style={{ border: 'none', boxShadow: 'none' }} />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            pageSize={10}
            loading={loading && !families.length}
            onRowClick={(f) => setOpen(f)}
            emptyTitle="Không có gia đình khớp bộ lọc"
            emptyDescription="Thử bỏ bớt từ khoá hoặc chọn trạng thái khác."
          />
        )}
      </Card>

      <FamilyDrawer family={open} onClose={() => setOpen(null)} />
    </div>
  )
}

export default AdminFamiliesTab
