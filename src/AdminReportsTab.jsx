/**
 * 💛 BÁO CÁO & NPS · Đợt 15 chặng 3
 * NPS, điểm trung bình và % nhận xét tính từ phiếu thật (GET /api/v1/admin/nps-summary);
 * 0 phiếu thì hiện trạng thái trống. Bản đồ khung giờ lấy từ learning_sessions.started_at
 * theo giờ Việt Nam (GET /api/v1/admin/peak-hours). Không bịa số.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { PageHeader, KpiCard, Card, Button, Segmented, EmptyState, Banner, Chip } from './ui/staff'
import { getJson, fmtDate, fmtNum } from './admin/monitorShared'
import './admin/pages-monitor.css'

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] // SQLite %w: 0 = Chủ nhật
const DAY_LABEL = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 0: 'CN' }
const DAY_FULL = { 1: 'thứ Hai', 2: 'thứ Ba', 3: 'thứ Tư', 4: 'thứ Năm', 5: 'thứ Sáu', 6: 'thứ Bảy', 0: 'Chủ nhật' }
const SLOTS = [
  { id: 'sang', label: 'Sáng', hint: '5 đến 11 giờ', hours: [5, 6, 7, 8, 9, 10] },
  { id: 'trua', label: 'Trưa', hint: '11 đến 14 giờ', hours: [11, 12, 13] },
  { id: 'chieu', label: 'Chiều', hint: '14 đến 18 giờ', hours: [14, 15, 16, 17] },
  { id: 'toi', label: 'Tối', hint: '18 đến 22 giờ', hours: [18, 19, 20, 21] },
  { id: 'khuya', label: 'Khuya', hint: '22 đến 5 giờ', hours: [22, 23, 0, 1, 2, 3, 4] },
]
const PERIODS = [
  { value: 7, label: '7 ngày' },
  { value: 30, label: '30 ngày' },
  { value: 90, label: '90 ngày' },
]

function npsTone(n) {
  if (n === null || n === undefined) return { tone: 'default', text: '' }
  if (n >= 50) return { tone: 'ok', text: 'Rất tốt' }
  if (n >= 0) return { tone: 'warn', text: 'Khá, còn chỗ cải thiện' }
  return { tone: 'bad', text: 'Cần cải thiện' }
}

/** Dự phòng khi chưa có /nps-summary: chỉ dùng số khi có phiếu thật. */
function fromLegacyNps(d) {
  const total = Number(d.totalResponses || 0)
  if (total === 0) return { totalResponses: 0, recentFeedback: [] }
  return {
    totalResponses: total,
    npsScore: d.npsScore ?? null,
    avgScore: d.avgScore ?? null,
    promoters: d.promoters ?? null,
    passives: d.passives ?? null,
    detractors: d.detractors ?? null,
    commentPct: null,
    tagStats: [],
    recentFeedback: d.recentFeedback || [],
  }
}

function HeatMap({ days }) {
  const [state, setState] = useState({ loading: true, ok: false, cells: [], total: 0 })
  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true }))
    getJson(`/api/v1/admin/peak-hours?days=${days}`).then((r) => {
      if (!alive) return
      setState({ loading: false, ok: r.ok, cells: r.data.cells || [], total: Number(r.data.total || 0) })
    })
    return () => {
      alive = false
    }
  }, [days])

  const grid = useMemo(() => {
    const g = {}
    for (const c of state.cells) {
      const slot = SLOTS.find((s) => s.hours.includes(Number(c.hour)))
      if (!slot) continue
      const k = `${slot.id}:${Number(c.dow)}`
      g[k] = (g[k] || 0) + Number(c.count || 0)
    }
    return g
  }, [state.cells])
  const max = Math.max(0, ...Object.values(grid))
  let peak = null
  for (const s of SLOTS) for (const d of DAY_ORDER) {
    const v = grid[`${s.id}:${d}`] || 0
    if (v > 0 && (!peak || v > peak.v)) peak = { s, d, v }
  }

  if (state.loading) return <p className="pm-muted">Đang tải khung giờ…</p>
  if (!state.ok) return <Banner type="warn" message="Chưa tải được dữ liệu khung giờ. Thử tải lại sau ít phút." />
  if (state.total === 0)
    return <EmptyState title="Chưa có buổi học trong khoảng này" description="Khi phụ huynh kèm con, bản đồ sẽ cho biết khung giờ nào các nhà hay học nhất." style={{ border: 'none', boxShadow: 'none', padding: '16px 8px' }} />

  return (
    <>
      {peak && (
        <p className="pm-card-sub" style={{ marginBottom: 12 }}>
          Đông nhất vào buổi <b>{peak.s.label.toLowerCase()}</b> {DAY_FULL[peak.d]} ({fmtNum(peak.v)} buổi), trên tổng {fmtNum(state.total)} buổi theo giờ Việt Nam.
        </p>
      )}
      <div className="pm-heat-wrap">
        <div className="pm-heat" role="table" aria-label="Số buổi học theo khung giờ và ngày trong tuần">
          <div role="columnheader" />
          {DAY_ORDER.map((d) => (
            <div key={d} className="pm-heat-h" role="columnheader">
              {DAY_LABEL[d]}
            </div>
          ))}
          {SLOTS.map((s) => (
            <React.Fragment key={s.id}>
              <div className="pm-heat-row" role="rowheader" title={s.hint}>
                {s.label}
              </div>
              {DAY_ORDER.map((d) => {
                const v = grid[`${s.id}:${d}`] || 0
                const a = max > 0 && v > 0 ? 0.15 + 0.85 * (v / max) : 0
                return (
                  <div
                    key={d}
                    role="cell"
                    className="pm-heat-cell"
                    title={`${s.label} ${DAY_FULL[d]}: ${v} buổi`}
                    style={a ? { background: `rgba(246, 166, 35, ${a.toFixed(2)})`, borderColor: 'transparent' } : undefined}
                  >
                    {v > 0 ? fmtNum(v) : ''}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  )
}

export function AdminReportsTab({ token }) {
  const [nps, setNps] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [days, setDays] = useState(30)

  async function load() {
    setLoading(true)
    const r = await getJson('/api/v1/admin/nps-summary')
    if (r.ok) {
      setNps(r.data)
      setError('')
    } else {
      const legacy = await getJson('/api/v1/admin/nps')
      if (legacy.ok) {
        setNps(fromLegacyNps(legacy.data))
        setError('')
      } else setError(legacy.data?.error?.message || 'Chưa tải được số liệu NPS.')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const total = Number(nps?.totalResponses || 0)
  const t = npsTone(nps?.npsScore)
  const share = (n) => (total > 0 && n != null ? (Number(n) / total) * 100 : 0)
  const feedback = nps?.recentFeedback || []
  const tags = nps?.tagStats || []

  return (
    <div className="pm-page">
      <PageHeader
        title="Báo cáo & NPS"
        description="Mức hài lòng của phụ huynh tính từ phiếu thật và khung giờ các nhà hay kèm con."
        actions={
          <span className="pm-noprint" style={{ display: 'inline-flex', gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
              {loading ? 'Đang tải…' : 'Tải lại'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              In hoặc lưu PDF
            </Button>
          </span>
        }
      />

      {error && <Banner type="bad" message={error} actionText="Thử lại" onAction={load} />}

      {loading && !nps ? (
        <Card>
          <p className="pm-muted">Đang tổng hợp phiếu đánh giá…</p>
        </Card>
      ) : total === 0 && !error ? (
        <Card>
          <EmptyState
            title="Chưa có phiếu đánh giá nào"
            description="NPS, điểm trung bình và các nhận xét phổ biến sẽ hiện khi phụ huynh gửi phiếu đánh giá trong app."
            style={{ border: 'none', boxShadow: 'none' }}
          />
        </Card>
      ) : total > 0 ? (
        <>
          <div className="pm-kpis">
            <KpiCard label="Chỉ số NPS" value={nps.npsScore != null ? `${nps.npsScore > 0 ? '+' : ''}${nps.npsScore}` : null} tone={t.tone} sub={t.text} />
            <KpiCard label="Điểm trung bình" value={nps.avgScore != null ? `${fmtNum(nps.avgScore, 1)} / 10` : null} sub="Thang điểm 0 đến 10" />
            <KpiCard label="Số phiếu" value={fmtNum(total)} sub="Tổng phiếu phụ huynh đã gửi" />
            <KpiCard label="Có lời nhận xét" value={nps.commentPct != null ? `${nps.commentPct}%` : null} sub="Tỉ lệ phiếu có viết thêm" />
          </div>

          <Card>
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">Phân bố phiếu</h3>
                <p className="pm-card-sub">NPS = % ủng hộ (9 đến 10 điểm) trừ % chưa hài lòng (0 đến 6 điểm).</p>
              </div>
            </div>
            <div className="pm-nps">
              <div className="pm-nps-split" aria-hidden="true">
                <span style={{ width: `${share(nps.promoters)}%`, background: 'var(--s-ok)' }} />
                <span style={{ width: `${share(nps.passives)}%`, background: 'var(--s-accent)' }} />
                <span style={{ width: `${share(nps.detractors)}%`, background: 'var(--s-bad)' }} />
              </div>
            </div>
            <div className="pm-legend">
              <span>
                <i style={{ background: 'var(--s-ok)' }} />
                Ủng hộ: <b>{fmtNum(nps.promoters) ?? '·'}</b>
              </span>
              <span>
                <i style={{ background: 'var(--s-accent)' }} />
                Trung lập: <b>{fmtNum(nps.passives) ?? '·'}</b>
              </span>
              <span>
                <i style={{ background: 'var(--s-bad)' }} />
                Chưa hài lòng: <b>{fmtNum(nps.detractors) ?? '·'}</b>
              </span>
            </div>
            <div style={{ marginTop: 16 }}>
              <h4 className="pm-section-title" style={{ marginBottom: 8 }}>
                Nhận xét phụ huynh chọn nhiều nhất
              </h4>
              {tags.length === 0 ? (
                <p className="pm-muted">Chưa có phiếu nào chọn nhãn nhận xét.</p>
              ) : (
                <div className="pm-chips">
                  {tags.map((tg) => (
                    <Chip key={tg.tag}>
                      {tg.tag} · {tg.pct}%
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </>
      ) : null}

      <Card>
        <div className="pm-card-head">
          <div>
            <h3 className="pm-card-title">Khung giờ kèm học</h3>
            <p className="pm-card-sub">Số buổi học theo buổi trong ngày và ngày trong tuần, giờ Việt Nam.</p>
          </div>
          <span className="pm-noprint">
            <Segmented options={PERIODS} value={days} onChange={setDays} />
          </span>
        </div>
        <HeatMap days={days} />
      </Card>

      {total > 0 && (
        <Card>
          <div className="pm-card-head">
            <div>
              <h3 className="pm-card-title">Góp ý gần nhất</h3>
              <p className="pm-card-sub">20 phiếu mới nhất.</p>
            </div>
          </div>
          {feedback.length === 0 ? (
            <p className="pm-muted">Chưa có góp ý.</p>
          ) : (
            <div className="pm-feedback">
              {feedback.map((fb) => (
                <div className="pm-feedback-item" key={fb.id}>
                  <div className="pm-bar-label">
                    <span>
                      {fb.family_name || 'Gia đình'} ·{' '}
                      <span style={{ color: Number(fb.score) >= 9 ? 'var(--s-ok)' : Number(fb.score) <= 6 ? 'var(--s-bad)' : 'var(--s-accent-ink)' }}>{fb.score}/10</span>
                    </span>
                    <span className="pm-muted">{fmtDate(fb.created_at)}</span>
                  </div>
                  {fb.tags && <div className="pm-muted">{String(fb.tags).replace(/^\[|\]$/g, '').replace(/"/g, '')}</div>}
                  {fb.comment && <p className="pm-quote">“{fb.comment}”</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export default AdminReportsTab
