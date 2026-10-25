/**
 * 🍎 GIÁO VIÊN & LỚP · Đợt 15 chặng 3
 * Duyệt, từ chối (kèm lý do), tạm khoá hoặc mở khoá giáo viên; xem danh sách lớp của từng cô.
 * Dữ liệu: GET /api/v1/admin/teachers, GET /api/v1/admin/classes (nhóm theo teacher_id).
 */
import React, { useEffect, useMemo, useState } from 'react'
import { PageHeader, KpiCard, Card, Button, Input, Textarea, Tabs, DataTable, Drawer, StatusPill, Banner, Chip, Field, staffToast, staffConfirm } from './ui/staff'
import { adminFetch } from './adminApi'
import { getJson, fmtDate, fmtAgo, fmtNum, gradeLabel } from './admin/monitorShared'
import './admin/pages-monitor.css'

const STATUS = {
  pending: { status: 'review', label: 'Chờ duyệt' },
  approved: { status: 'dat', label: 'Đã duyệt' },
  rejected: { status: 'error', label: 'Đã từ chối' },
  suspended: { status: 'warn', label: 'Tạm khoá' },
}
const REASONS = [
  'Thông tin trường học chưa xác thực được',
  'Số điện thoại không liên lạc được',
  'Khối lớp chưa phù hợp với chương trình',
  'Hồ sơ đăng ký thiếu thông tin',
]
const DEFAULT_REASON = 'Thông tin trường học hoặc thông tin liên hệ chưa xác thực được'

/** Tên lớp: "3A" → "Lớp 3A"; đã có chữ "Lớp" thì giữ nguyên. */
const classTitle = (n) => (!n ? 'Lớp chưa đặt tên' : /^lớp\s/i.test(String(n).trim()) ? String(n).trim() : `Lớp ${String(n).trim()}`)

async function postJson(path, body) {
  try {
    const res = await adminFetch(path, { method: 'POST', ...(body ? { body: JSON.stringify(body) } : {}) })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok && data.ok, data }
  } catch (e) {
    return { ok: false, data: { error: { message: 'Mất kết nối máy chủ, thử lại sau' } } }
  }
}

function TeacherDrawer({ teacher, classes, classesLoaded, classesOk = true, busy, onClose, onApprove, onReject, onSuspend }) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState(DEFAULT_REASON)
  useEffect(() => {
    setRejecting(false)
    setReason(DEFAULT_REASON)
  }, [teacher?.id, teacher?.status])
  if (!teacher) return null
  const st = STATUS[teacher.status] || { status: 'info', label: teacher.status || '·' }

  let footer = null
  if (rejecting) {
    footer = (
      <div className="pm-actions">
        <Button variant="ghost" onClick={() => setRejecting(false)} disabled={busy}>
          Huỷ
        </Button>
        <Button variant="danger" onClick={() => onReject(teacher, reason.trim())} disabled={busy || !reason.trim()}>
          {busy ? 'Đang gửi…' : 'Xác nhận từ chối'}
        </Button>
      </div>
    )
  } else if (teacher.status === 'pending') {
    footer = (
      <div className="pm-actions">
        <Button onClick={() => onApprove(teacher)} disabled={busy}>
          Duyệt hồ sơ
        </Button>
        <Button variant="danger" onClick={() => setRejecting(true)} disabled={busy}>
          Từ chối
        </Button>
      </div>
    )
  } else if (teacher.status === 'approved') {
    footer = (
      <Button variant="danger" onClick={() => onSuspend(teacher)} disabled={busy}>
        Tạm khoá tài khoản
      </Button>
    )
  } else if (teacher.status === 'suspended') {
    footer = (
      <Button onClick={() => onSuspend(teacher)} disabled={busy}>
        Mở khoá lại
      </Button>
    )
  } else if (teacher.status === 'rejected') {
    footer = (
      <Button onClick={() => onApprove(teacher)} disabled={busy}>
        Xét duyệt lại
      </Button>
    )
  }

  return (
    <Drawer open title={teacher.display_name || teacher.email || 'Giáo viên'} onClose={onClose} width={520} footer={footer}>
      <div className="pm-section">
        <div className="pm-actions">
          <StatusPill status={st.status} label={st.label} />
        </div>
        <ul className="pm-list">
          <li className="pm-list-item">
            <span className="pm-muted">Email</span>
            <b style={{ wordBreak: 'break-all' }}>{teacher.email || '·'}</b>
          </li>
          {teacher.phone && (
            <li className="pm-list-item">
              <span className="pm-muted">Điện thoại</span>
              <b>{teacher.phone}</b>
            </li>
          )}
          <li className="pm-list-item">
            <span className="pm-muted">Trường</span>
            <b>{[teacher.school_name, teacher.province].filter(Boolean).join(', ') || '·'}</b>
          </li>
          <li className="pm-list-item">
            <span className="pm-muted">Khối dạy</span>
            <b>{teacher.grades || '·'}</b>
          </li>
          <li className="pm-list-item">
            <span className="pm-muted">Đăng ký</span>
            <b>{fmtDate(teacher.created_at)}</b>
          </li>
          <li className="pm-list-item">
            <span className="pm-muted">Đăng nhập gần nhất</span>
            <b>{teacher.last_login_at ? fmtAgo(teacher.last_login_at) : '·'}</b>
          </li>
        </ul>
        {teacher.review_note && teacher.status === 'rejected' && <Banner type="bad" message={`Lý do từ chối: ${teacher.review_note}`} />}
      </div>

      {rejecting && (
        <section className="pm-section">
          <h4 className="pm-section-title">Lý do từ chối</h4>
          <div className="pm-reason-chips">
            {REASONS.map((r) => (
              <Chip key={r} selected={reason === r} onClick={() => setReason(r)}>
                {r}
              </Chip>
            ))}
          </div>
          <Field hint="Giáo viên sẽ thấy lý do này khi đăng nhập.">
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Nhập lý do cụ thể…" />
          </Field>
        </section>
      )}

      <section className="pm-section">
        <h4 className="pm-section-title">Các lớp ({classes.length})</h4>
        {!classesLoaded ? (
          <p className="pm-muted">Đang tải danh sách lớp…</p>
        ) : !classesOk ? (
          <p className="pm-muted">Chưa tải được danh sách lớp, thử tải lại trang.</p>
        ) : classes.length === 0 ? (
          <p className="pm-muted">Cô chưa tạo lớp nào.</p>
        ) : (
          <ul className="pm-list">
            {classes.map((c) => (
              <li className="pm-list-item" key={c.id}>
                <span>
                  <b>{classTitle(c.name)}</b>
                  <span className="pm-muted" style={{ display: 'block' }}>
                    {[gradeLabel(c.grade) && `Khối ${c.grade}`, c.school_year, c.join_code ? `mã ${c.join_code}` : null].filter(Boolean).join(' · ') || '·'}
                  </span>
                </span>
                <span style={{ textAlign: 'right' }}>
                  <b>{fmtNum(c.student_count) ?? '·'}</b>
                  <span className="pm-muted"> học sinh</span>
                  {c.status && c.status !== 'active' && (
                    <span style={{ display: 'block' }}>
                      <StatusPill status="info" label={c.status === 'archived' ? 'Đã lưu trữ' : c.status} />
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Drawer>
  )
}

export function AdminTeachersTab({ token }) {
  const [teachers, setTeachers] = useState([])
  const [classes, setClasses] = useState([])
  const [classesLoaded, setClassesLoaded] = useState(false)
  const [classesOk, setClassesOk] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState(null)
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    const [t, c] = await Promise.all([getJson('/api/v1/admin/teachers'), getJson('/api/v1/admin/classes')])
    if (t.ok && Array.isArray(t.data.teachers)) {
      setTeachers(t.data.teachers)
      setError('')
    } else setError(t.data?.error?.message || 'Chưa tải được danh sách giáo viên.')
    setClasses(c.ok ? c.data.classes || [] : [])
    setClassesOk(Boolean(c.ok))
    setClassesLoaded(true)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const classesByTeacher = useMemo(() => {
    const m = {}
    for (const c of classes) (m[c.teacher_id] = m[c.teacher_id] || []).push(c)
    return m
  }, [classes])

  const counts = useMemo(() => {
    const k = { all: teachers.length, pending: 0, approved: 0, rejected: 0, suspended: 0 }
    teachers.forEach((t) => {
      if (k[t.status] !== undefined) k[t.status] += 1
    })
    return k
  }, [teachers])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return teachers.filter((t) => {
      if (tab !== 'all' && t.status !== tab) return false
      if (!q) return true
      return [t.display_name, t.email, t.school_name, t.province, t.phone].some((v) => String(v || '').toLowerCase().includes(q))
    })
  }, [teachers, tab, search])

  const patch = (id, obj) => setTeachers((list) => list.map((t) => (t.id === id ? { ...t, ...obj } : t)))

  async function approve(t) {
    const ok = await staffConfirm({
      title: 'Duyệt giáo viên này?',
      message: `${t.display_name || t.email} sẽ đăng nhập được cổng giáo viên, tạo lớp và giao bài.`,
      confirmText: 'Duyệt',
    })
    if (!ok) return
    setBusyId(t.id)
    const r = await postJson(`/api/v1/admin/teachers/${encodeURIComponent(t.id)}/approve`)
    setBusyId(null)
    if (r.ok) {
      patch(t.id, { status: 'approved', review_note: null })
      staffToast(`Đã duyệt ${t.display_name || t.email}`)
    } else staffToast(r.data?.error?.message || 'Chưa duyệt được, thử lại sau', { tone: 'bad' })
  }

  async function reject(t, reason) {
    setBusyId(t.id)
    const r = await postJson(`/api/v1/admin/teachers/${encodeURIComponent(t.id)}/reject`, { reason })
    setBusyId(null)
    if (r.ok) {
      patch(t.id, { status: 'rejected', review_note: reason })
      staffToast(`Đã từ chối hồ sơ ${t.display_name || t.email}`)
    } else staffToast(r.data?.error?.message || 'Chưa từ chối được, thử lại sau', { tone: 'bad' })
  }

  async function toggleSuspend(t) {
    const suspended = t.status === 'suspended'
    const ok = await staffConfirm({
      title: suspended ? 'Mở khoá giáo viên này?' : 'Tạm khoá giáo viên này?',
      message: suspended
        ? `${t.display_name || t.email} sẽ đăng nhập và dạy lại như bình thường.`
        : `${t.display_name || t.email} sẽ không đăng nhập được cổng giáo viên cho tới khi mở khoá.`,
      confirmText: suspended ? 'Mở khoá' : 'Tạm khoá',
      danger: !suspended,
    })
    if (!ok) return
    setBusyId(t.id)
    const r = await postJson(`/api/v1/admin/teachers/${encodeURIComponent(t.id)}/suspend`)
    setBusyId(null)
    if (r.ok) {
      patch(t.id, { status: r.data.status })
      staffToast(r.data.status === 'suspended' ? `Đã tạm khoá ${t.display_name || t.email}` : `Đã mở khoá ${t.display_name || t.email}`)
    } else staffToast(r.data?.error?.message || 'Chưa thực hiện được, thử lại sau', { tone: 'bad' })
  }

  const columns = [
    {
      key: 'display_name',
      title: 'Giáo viên',
      render: (v, t) => (
        <div>
          <div className="pm-strong">{v || 'Chưa có tên'}</div>
          <div className="pm-muted">{t.email}</div>
        </div>
      ),
    },
    {
      key: 'school_name',
      title: 'Trường',
      render: (v, t) => (
        <div className="pm-teacher-meta">
          <span style={{ color: 'var(--s-text)', fontWeight: 700 }}>{v || '·'}</span>
          {t.province && <span>{t.province}</span>}
        </div>
      ),
    },
    { key: 'grades', title: 'Khối dạy', render: (v) => v || '·' },
    {
      key: 'classes',
      title: 'Lớp',
      render: (_, t) => {
        const list = classesByTeacher[t.id] || []
        if (!classesLoaded || !classesOk) return '·'
        if (!list.length) return <span className="pm-muted">Chưa có lớp</span>
        return (
          <span title={list.map((c) => classTitle(c.name)).join(', ')}>
            <b>{list.length}</b> lớp
            <span className="pm-muted"> · {list.slice(0, 2).map((c) => classTitle(c.name)).join(', ')}{list.length > 2 ? '…' : ''}</span>
          </span>
        )
      },
    },
    { key: 'created_at', title: 'Đăng ký', render: (v) => fmtDate(v) },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (v) => {
        const s = STATUS[v] || { status: 'info', label: v || '·' }
        return <StatusPill status={s.status} label={s.label} />
      },
    },
    {
      key: 'actions',
      title: '',
      align: 'right',
      render: (_, t) =>
        t.status === 'pending' ? (
          <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <Button size="sm" onClick={() => approve(t)} disabled={busyId === t.id}>
              Duyệt
            </Button>
          </span>
        ) : null,
    },
  ]

  const openTeacher = teachers.find((t) => t.id === openId) || null
  const totalClasses = classes.length

  return (
    <div className="pm-page">
      <PageHeader
        title="Giáo viên & lớp"
        description="Duyệt hồ sơ giáo viên, tạm khoá khi cần và xem các lớp mỗi cô đang dạy."
        status={counts.pending > 0 ? { tone: 'warn', label: `${counts.pending} hồ sơ chờ duyệt` } : null}
        actions={
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
            {loading ? 'Đang tải…' : 'Tải lại'}
          </Button>
        }
      />

      {error && <Banner type="bad" message={error} actionText="Thử lại" onAction={load} />}

      <div className="pm-kpis">
        <KpiCard label="Giáo viên đăng ký" value={loading && !teachers.length ? null : fmtNum(counts.all)} emptyText={loading ? 'Đang tải…' : 'Chưa có dữ liệu'} sub="Tài khoản trên toàn hệ thống" />
        <KpiCard label="Chờ duyệt" value={loading && !teachers.length ? null : fmtNum(counts.pending)} emptyText={loading ? 'Đang tải…' : 'Chưa có dữ liệu'} tone={counts.pending > 0 ? 'warn' : 'ok'} sub={counts.pending > 0 ? 'Cần xem hồ sơ' : 'Không còn hồ sơ chờ'} onClick={counts.pending > 0 ? () => setTab('pending') : undefined} />
        <KpiCard label="Đang dạy" value={loading && !teachers.length ? null : fmtNum(counts.approved)} emptyText={loading ? 'Đang tải…' : 'Chưa có dữ liệu'} sub="Được tạo lớp và giao bài" />
        <KpiCard label="Lớp học" value={classesOk ? fmtNum(totalClasses) : null} emptyText={loading ? 'Đang tải…' : 'Chưa tải được danh sách lớp'} sub={classesOk && totalClasses > 0 ? `${fmtNum(classes.reduce((a, c) => a + Number(c.student_count || 0), 0))} học sinh đang học` : 'Do các cô tạo'} />
      </div>

      <Card>
        <Tabs
          activeTab={tab}
          onChange={setTab}
          ariaLabel="Lọc theo trạng thái"
          tabs={[
            { id: 'all', label: 'Tất cả', count: counts.all },
            { id: 'pending', label: 'Chờ duyệt', count: counts.pending },
            { id: 'approved', label: 'Đã duyệt', count: counts.approved },
            { id: 'rejected', label: 'Từ chối', count: counts.rejected },
            { id: 'suspended', label: 'Tạm khoá', count: counts.suspended },
          ]}
        />
        <div className="pm-toolbar" style={{ margin: '12px 0' }}>
          <div className="pm-grow">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên, email, trường, tỉnh…" prefix="🔍" aria-label="Tìm giáo viên" />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          pageSize={15}
          loading={loading && !teachers.length}
          onRowClick={(t) => setOpenId(t.id)}
          emptyTitle={tab === 'pending' && !search ? 'Không còn hồ sơ chờ duyệt' : teachers.length ? 'Không có giáo viên khớp bộ lọc' : 'Chưa có giáo viên đăng ký'}
          emptyDescription={tab === 'pending' && !search ? 'Hồ sơ mới sẽ hiện ở đây khi có cô đăng ký cổng giáo viên.' : teachers.length ? 'Thử đổi tab trạng thái hoặc từ khoá.' : 'Khi giáo viên đăng ký cổng giáo viên, hồ sơ sẽ hiện ở đây để duyệt.'}
        />
      </Card>

      {openTeacher && (
        <TeacherDrawer
          teacher={openTeacher}
          classes={classesByTeacher[openTeacher.id] || []}
          classesLoaded={classesLoaded}
          classesOk={classesOk}
          busy={busyId === openTeacher.id}
          onClose={() => setOpenId(null)}
          onApprove={approve}
          onReject={reject}
          onSuspend={toggleSuspend}
        />
      )}
    </div>
  )
}

export default AdminTeachersTab
