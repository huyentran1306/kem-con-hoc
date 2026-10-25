/**
 * 📊 TỔNG QUAN ADMIN · Đợt 15 chặng 3
 * Số liệu thật từ D1 (GET /api/v1/admin/overview-stats, dự phòng /overview).
 * Không có dữ liệu thì KpiCard hiện "·", bảng hiện trạng thái trống có gấu.
 */
import React, { useCallback, useEffect, useState } from 'react'
import { PageHeader, KpiCard, Card, Button, Segmented, Toggle, DataTable, EmptyState, StatusPill, Banner } from './ui/staff'
import { getJson, fmtDateTime, fmtNum, gradeLabel, minutesLabel, ratingInfo, validatorInfo } from './admin/monitorShared'
import './admin/pages-monitor.css'

const RANGES = [
  { value: 'today', label: 'Hôm nay' },
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
]
const RANGE_TEXT = { today: 'hôm nay', '7d': '7 ngày qua', '30d': '30 ngày qua' }

/** Chuẩn hoá dữ liệu từ endpoint cũ /overview: bỏ các số mặc định không có thật. */
function fromLegacy(d) {
  const m = d.metrics || {}
  const ai = d.aiHealth || {}
  const hasCalls = Number(ai.totalCalls24h || 0) > 0
  return {
    metrics: {
      totalFamilies: m.totalFamilies ?? null,
      activeFamilies: m.activeFamilies ?? null,
      totalStudents: m.totalStudents ?? null,
      activeStudents: null,
      totalSessions: m.totalSessions ?? null,
      avgMinutes: null, // bản cũ tự gán 60 giây cho buổi chưa kết thúc nên không dùng
      activeSessionsNow: m.activeSessionsNow ?? null,
      selfRelianceRate: m.selfRelianceRate ?? null,
      ratedSessions: null,
    },
    subjects: (d.subjects || []).filter((s) => s && s.subject),
    aiHealth: {
      totalCalls24h: ai.totalCalls24h ?? 0,
      medianLatencyMs: hasCalls ? ai.medianLatencyMs ?? null : null,
      p95LatencyMs: hasCalls ? ai.p95LatencyMs ?? null : null,
      blockedLeaks: ai.blockedLeaks ?? null,
      leakedCount: ai.leakedCount ?? null,
    },
    pendingTasks: d.pendingTasks || {},
    recentSessions: (d.recentSessions || []).map((s) => ({ ...s, duration_seconds: null })),
  }
}

const secText = (ms) => (ms === null || ms === undefined ? null : `${fmtNum(ms / 1000, 1)} giây`)

export function AdminOverviewTab({ token, onNavigateTab }) {
  const [range, setRange] = useState('7d')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [updatedAt, setUpdatedAt] = useState(null)

  const load = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true)
      let r = await getJson(`/api/v1/admin/overview-stats?range=${range}`)
      let next = null
      if (r.ok) next = r.data
      else {
        const legacy = await getJson(`/api/v1/admin/overview?range=${range}`)
        if (legacy.ok) next = fromLegacy(legacy.data)
        else r = legacy
      }
      if (next) {
        setData(next)
        setError('')
        setUpdatedAt(new Date())
      } else {
        setError(r.data?.error?.message || 'Chưa tải được số liệu tổng quan. Thử tải lại sau ít phút.')
      }
      if (showLoading) setLoading(false)
    },
    [range]
  )

  useEffect(() => {
    load(true)
  }, [load])

  useEffect(() => {
    if (!autoRefresh) return undefined
    const h = setInterval(() => load(false), 30000)
    return () => clearInterval(h)
  }, [autoRefresh, load])

  const m = data?.metrics || {}
  const ai = data?.aiHealth || {}
  const tasks = data?.pendingTasks || {}
  const subjects = data?.subjects || []
  const recent = data?.recentSessions || []
  const subjectTotal = subjects.reduce((a, s) => a + Number(s.count || 0), 0)
  const today = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
  const liveNow = Number(m.activeSessionsNow || 0)

  const columns = [
    { key: 'started_at', title: 'Thời gian', render: (v) => <span className="pm-strong">{fmtDateTime(v)}</span> },
    {
      key: 'family_name',
      title: 'Gia đình',
      render: (v, s) => (
        <div>
          <div className="pm-strong">{v || 'Chưa đặt tên'}</div>
          {s.child_name && <div className="pm-muted">{s.child_name}</div>}
        </div>
      ),
    },
    {
      key: 'subject',
      title: 'Môn & lớp',
      render: (v, s) => [v, gradeLabel(s.grade)].filter(Boolean).join(' · ') || '·',
    },
    {
      key: 'problem_text',
      title: 'Đề bài',
      render: (v) => <span className="pm-ellipsis" title={v || ''}>{v || '·'}</span>,
    },
    { key: 'duration_seconds', title: 'Thời lượng', render: (v) => minutesLabel(v) },
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
      title: 'Kiểm định',
      render: (_, s) => {
        const v = validatorInfo(s)
        return <StatusPill status={v.status} label={v.label} />
      },
    },
  ]

  return (
    <div className="pm-page">
      <PageHeader
        breadcrumb={today.charAt(0).toUpperCase() + today.slice(1)}
        title="Tổng quan"
        description="Toàn cảnh gia đình, buổi học, chất lượng AI và việc cần xử lý trong kỳ đã chọn."
        status={liveNow > 0 ? { tone: 'info', label: `${liveNow} buổi đang diễn ra` } : null}
        actions={
          <>
            <Segmented options={RANGES} value={range} onChange={setRange} />
            <Button variant="ghost" size="sm" onClick={() => load(true)} disabled={loading}>
              {loading ? 'Đang tải…' : 'Tải lại'}
            </Button>
          </>
        }
      />

      {error && <Banner type="bad" message={error} actionText="Thử lại" onAction={() => load(true)} />}

      <div className="pm-kpis">
        <KpiCard
          label="Gia đình có học"
          value={loading && !data ? null : fmtNum(m.activeFamilies)}
          emptyText={loading && !data ? 'Đang tải…' : 'Chưa có dữ liệu'}
          sub={m.totalFamilies != null ? `trên ${fmtNum(m.totalFamilies)} gia đình, ${RANGE_TEXT[range]}` : RANGE_TEXT[range]}
        />
        <KpiCard
          label="Học sinh"
          value={loading && !data ? null : fmtNum(m.totalStudents)}
          emptyText={loading && !data ? 'Đang tải…' : 'Chưa có dữ liệu'}
          sub={m.activeStudents != null ? `${fmtNum(m.activeStudents)} bạn có buổi học ${RANGE_TEXT[range]}` : 'Tổng hồ sơ con trên hệ thống'}
        />
        <KpiCard
          label="Buổi học"
          value={loading && !data ? null : fmtNum(m.totalSessions)}
          emptyText={loading && !data ? 'Đang tải…' : 'Chưa có dữ liệu'}
          sub={m.avgMinutes != null ? `Trung bình ${fmtNum(m.avgMinutes, 1)} phút một buổi` : 'Chưa đo được thời lượng buổi'}
        />
        <KpiCard
          label="Con tự làm được"
          value={m.selfRelianceRate != null ? `${m.selfRelianceRate}%` : null}
          emptyText={loading && !data ? 'Đang tải…' : 'Chưa có buổi nào được đánh giá'}
          tone="ok"
          sub={m.ratedSessions ? `trên ${fmtNum(m.ratedSessions)} buổi có đánh giá` : `Trong ${RANGE_TEXT[range]}`}
        />
      </div>

      <div className="pm-grid-2">
        <Card>
          <div className="pm-card-head">
            <div>
              <h3 className="pm-card-title">Tỉ trọng môn học</h3>
              <p className="pm-card-sub">Số buổi theo môn, {RANGE_TEXT[range]}.</p>
            </div>
          </div>
          {subjects.length === 0 ? (
            <EmptyState title="Chưa có buổi học nào" description="Khi phụ huynh kèm con trên app, tỉ trọng từng môn sẽ hiện ở đây." style={{ border: 'none', boxShadow: 'none', padding: '16px 8px' }} />
          ) : (
            subjects.map((s) => {
              const p = subjectTotal > 0 ? Math.round((Number(s.count) / subjectTotal) * 100) : 0
              return (
                <div className="pm-bar-row" key={s.subject}>
                  <div className="pm-bar-label">
                    <span>{s.subject}</span>
                    <span>
                      {fmtNum(s.count)} buổi · {p}%
                    </span>
                  </div>
                  <div className="pm-bar" aria-hidden="true">
                    <span style={{ width: `${p}%` }} />
                  </div>
                </div>
              )
            })
          )}
        </Card>

        <Card>
          <div className="pm-card-head">
            <div>
              <h3 className="pm-card-title">Chất lượng AI</h3>
              <p className="pm-card-sub">Độ trễ tính trên {fmtNum(ai.totalCalls24h) || 0} lượt gọi AI trong 24 giờ.</p>
            </div>
          </div>
          <div className="pm-mini-grid">
            <div className="pm-mini">
              <div className="pm-mini-label">Độ trễ trung vị</div>
              <div className="pm-mini-value">{secText(ai.medianLatencyMs) || '·'}</div>
            </div>
            <div className="pm-mini">
              <div className="pm-mini-label">Độ trễ p95</div>
              <div className="pm-mini-value">{secText(ai.p95LatencyMs) || '·'}</div>
            </div>
            <div className="pm-mini">
              <div className="pm-mini-label">Lộ đáp án đã chặn</div>
              <div className="pm-mini-value">{ai.blockedLeaks != null ? fmtNum(ai.blockedLeaks) : '·'}</div>
            </div>
            <div className="pm-mini">
              <div className="pm-mini-label">Buổi bị lọt</div>
              <div className="pm-mini-value" style={{ color: Number(ai.leakedCount) > 0 ? 'var(--s-bad)' : undefined }}>
                {ai.leakedCount != null ? fmtNum(ai.leakedCount) : '·'}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="pm-card-head">
            <div>
              <h3 className="pm-card-title">Việc cần xử lý</h3>
              <p className="pm-card-sub">Bấm để mở trang tương ứng.</p>
            </div>
          </div>
          <button type="button" className="pm-task" onClick={() => onNavigateTab && onNavigateTab('teachers')}>
            <span>
              <span className="pm-strong">Giáo viên chờ duyệt</span>
              <span className="pm-muted" style={{ display: 'block' }}>Hồ sơ trường học và liên hệ</span>
            </span>
            <StatusPill status={Number(tasks.pendingTeachers) > 0 ? 'review' : 'dat'} label={tasks.pendingTeachers != null ? `${fmtNum(tasks.pendingTeachers)} hồ sơ` : '·'} />
          </button>
          <button type="button" className="pm-task" onClick={() => onNavigateTab && onNavigateTab('sessions')}>
            <span>
              <span className="pm-strong">Báo cáo nội dung</span>
              <span className="pm-muted" style={{ display: 'block' }}>Phụ huynh báo bài giảng chưa đúng</span>
            </span>
            <StatusPill status={Number(tasks.contentReports) > 0 ? 'review' : 'dat'} label={tasks.contentReports != null ? `${fmtNum(tasks.contentReports)} báo cáo` : '·'} />
          </button>
        </Card>
      </div>

      <Card>
        <div className="pm-card-head">
          <div>
            <h3 className="pm-card-title">Buổi học gần nhất</h3>
            <p className="pm-card-sub">
              10 buổi mới nhất trên toàn hệ thống{updatedAt ? `, cập nhật lúc ${updatedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : ''}.
            </p>
          </div>
          <Toggle checked={autoRefresh} onChange={setAutoRefresh} label="Tự làm mới mỗi 30 giây" />
        </div>
        <DataTable
          columns={columns}
          data={recent}
          loading={loading && !data}
          emptyTitle="Chưa có buổi học nào"
          emptyDescription="Khi phụ huynh bắt đầu kèm con trên app, buổi học sẽ hiện ở đây trong vòng 30 giây."
          onRowClick={onNavigateTab ? () => onNavigateTab('sessions') : null}
        />
      </Card>
    </div>
  )
}

export default AdminOverviewTab
