/**
 * Hạ tầng & lỗi (Đợt 15 · Chặng 3)
 * - Thanh hạn mức chỉ hiện khi máy chủ trả số thật (/api/v1/admin/infra-usage); cảnh báo khi vượt 75 %
 * - Gộp bảng lỗi phía người dùng (/api/v1/admin/client-errors)
 */
import { useEffect, useState } from 'react'
import { PageHeader, Card, Button, KpiCard, DataTable, EmptyState, StatusPill, Banner } from '../ui/staff'
import { adminJson, errMessage, fmtNumber, fmtBytes, fmtShortWhen, fmtDateTime, quotaPct } from './systemShared'
import './pages-system.css'

const WARN_PCT = 75

function Meter({ label, usedText, limitText, pct, note }) {
  if (pct === null || pct === undefined) return null
  const tone = pct >= 90 ? 'sys-bad' : pct >= WARN_PCT ? 'sys-warn' : ''
  return (
    <div className="sys-meter">
      <div className="sys-meter-head">
        <span>{label}</span>
        <b>
          {usedText} / {limitText} · {pct < 1 && pct > 0 ? '<1' : Math.round(pct)}%
        </b>
      </div>
      <div className={`sys-bar ${tone}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={label}>
        <i style={{ width: `${Math.max(pct, 1)}%` }} />
      </div>
      {note && <small>{note}</small>}
    </div>
  )
}

const THEME_LABELS = { bear: 'Gấu', candy: 'Kẹo', bento: 'Bento', sticker: 'Sticker', notebook: 'Vở', garden: 'Vườn', aurora: 'Cực quang', chalk: 'Bảng phấn' }

export default function InfraErrorsPage() {
  const [usage, setUsage] = useState(null)
  const [usageErr, setUsageErr] = useState('')
  const [errors, setErrors] = useState([])
  const [errLoading, setErrLoading] = useState(true)
  const [errErr, setErrErr] = useState('')
  const [loading, setLoading] = useState(true)

  const loadUsage = async () => {
    setLoading(true)
    const r = await adminJson('/api/v1/admin/infra-usage')
    if (r.ok) {
      setUsage(r.data)
      setUsageErr('')
    } else {
      setUsage(null)
      setUsageErr(errMessage(r, 'Chưa đọc được bộ đếm hạ tầng'))
    }
    setLoading(false)
  }
  const loadErrors = async () => {
    setErrLoading(true)
    const r = await adminJson('/api/v1/admin/client-errors')
    if (r.ok) {
      const list = Array.isArray(r.data?.errors) ? r.data.errors : []
      list.sort((a, b) => String(b.last_seen || '').localeCompare(String(a.last_seen || '')))
      setErrors(list)
      setErrErr('')
    } else {
      setErrors([])
      setErrErr(errMessage(r, 'Chưa tải được lỗi phía người dùng'))
    }
    setErrLoading(false)
  }
  useEffect(() => {
    loadUsage()
    loadErrors()
  }, [])

  const neurons = usage?.aiNeurons
  const neuronPct = neurons ? quotaPct(neurons.used, neurons.limit) : null
  const d1 = usage?.d1Size
  const d1Pct = d1 ? quotaPct(d1.bytes, d1.limit) : null
  const req = usage?.workerRequests
  const reqPct = req ? quotaPct(req.used, req.limit) : null
  const rows = usage?.d1RowsWritten
  const rowsPct = rows ? quotaPct(rows.used, rows.limit) : null
  const meters = [neuronPct, d1Pct, reqPct, rowsPct].filter((x) => x !== null && x !== undefined)
  const warnings = []
  if (neuronPct !== null && neuronPct >= WARN_PCT) warnings.push(`Neuron Workers AI đã dùng ${Math.round(neuronPct)}% hạn mức hôm nay. Cân nhắc giảm số lần chấm vở hoặc đọc ảnh mỗi gia đình đến hết ngày.`)
  if (d1Pct !== null && d1Pct >= WARN_PCT) warnings.push(`Cơ sở dữ liệu D1 đã dùng ${Math.round(d1Pct)}% dung lượng. Xem lại dữ liệu kỹ thuật cũ trước khi nghĩ tới dọn dữ liệu người dùng.`)
  if (reqPct !== null && reqPct >= WARN_PCT) warnings.push(`Lượt gọi Worker đã dùng ${Math.round(reqPct)}% hạn mức hôm nay.`)
  if (rowsPct !== null && rowsPct >= WARN_PCT) warnings.push(`Dòng ghi D1 đã dùng ${Math.round(rowsPct)}% hạn mức hôm nay.`)

  const errColumns = [
    {
      key: 'message',
      title: 'Lỗi',
      render: (v, e) => (
        <div style={{ minWidth: 220 }}>
          <div className="sys-err-msg">{v || '·'}</div>
          {e.file_line && <div className="sys-mono sys-muted">{e.file_line}</div>}
          {e.stack && <pre className="sys-err-stack">{e.stack}</pre>}
        </div>
      ),
    },
    { key: 'count', title: 'Lần', align: 'right', render: (v) => <StatusPill status={v > 5 ? 'bad' : 'warn'} label={fmtNumber(v)} /> },
    { key: 'theme', title: 'Bộ', render: (v) => (v ? THEME_LABELS[v] || v : '·') },
    { key: 'build_version', title: 'Bản', render: (v) => (v ? <span className="sys-mono">{v}</span> : '·') },
    { key: 'last_seen', title: 'Lần cuối', render: (v) => <span title={fmtDateTime(v)}>{fmtShortWhen(v)}</span> },
  ]

  return (
    <div className="sys-page">
      <PageHeader
        title="Hạ tầng & lỗi"
        description="Hạn mức gói Cloudflare Free hôm nay và lỗi từ máy người dùng. Số đọc từ máy chủ."
        actions={
          <Button
            variant="ghost"
            onClick={() => {
              loadUsage()
              loadErrors()
            }}
          >
            Làm mới
          </Button>
        }
      />

      <div className="sys-kpis">
        <KpiCard label="Lượt gọi AI hôm nay" value={usage?.aiCalls ? fmtNumber(usage.aiCalls.total) : null} sub={usage?.aiCalls ? `${fmtNumber(usage.aiCalls.failed)} lượt lỗi` : ''} tone={usage?.aiCalls?.failed ? 'warn' : 'ok'} />
        <KpiCard label="Neuron AI hôm nay" value={neurons ? fmtNumber(neurons.used) : null} sub={neurons ? `trên ${fmtNumber(neurons.limit)} mỗi ngày` : ''} tone={neuronPct >= WARN_PCT ? 'warn' : 'default'} />
        <KpiCard label="Dung lượng D1" value={d1 ? fmtBytes(d1.bytes) : null} sub={d1 ? `trên ${fmtBytes(d1.limit)}` : ''} />
        <KpiCard label="Lỗi người dùng 24 giờ" value={usage?.clientErrors ? fmtNumber(usage.clientErrors.last24h) : null} sub={usage?.clientErrors ? `${fmtNumber(usage.clientErrors.total)} dấu lỗi đang giữ` : ''} tone={usage?.clientErrors?.last24h ? 'bad' : 'ok'} />
      </div>

      <div className="sys-grid-2">
        <Card>
          <div className="sys-stack">
            <div className="sys-row-between">
              <div>
                <span className="sys-label">Hạn mức gói Free</span>
                <p className="sys-card-desc">
                  {usage?.checkedAt ? `Đọc lúc ${fmtDateTime(usage.checkedAt)}` : 'Chỉ hiện thanh có số thật từ máy chủ'}
                </p>
              </div>
            </div>
            {loading ? (
              <div className="sk-table-empty">Đang đọc bộ đếm…</div>
            ) : usageErr ? (
              <EmptyState mood="nudge" title="Chưa đọc được bộ đếm" description={usageErr} actionText="Thử lại" onAction={loadUsage} style={{ border: 'none', boxShadow: 'none', padding: 16 }} />
            ) : meters.length === 0 ? (
              <EmptyState title="Chưa có số hạn mức" description="Máy chủ chưa ghi bộ đếm nào cho hôm nay." style={{ border: 'none', boxShadow: 'none', padding: 16 }} />
            ) : (
              <>
                <Meter label="Neuron Workers AI" usedText={fmtNumber(neurons?.used)} limitText={fmtNumber(neurons?.limit)} pct={neuronPct} note="Đếm theo ngày UTC từ bảng ghi mức dùng AI." />
                <Meter label="Lượt gọi Worker" usedText={fmtNumber(req?.used)} limitText={fmtNumber(req?.limit)} pct={reqPct} />
                <Meter label="Dòng ghi D1" usedText={fmtNumber(rows?.used)} limitText={fmtNumber(rows?.limit)} pct={rowsPct} />
                <Meter label="Dung lượng D1" usedText={fmtBytes(d1?.bytes)} limitText={fmtBytes(d1?.limit)} pct={d1Pct} />
              </>
            )}
            {warnings.map((w) => (
              <Banner key={w} type="warn" message={w} />
            ))}
            <p className="sys-muted" style={{ margin: 0 }}>
              Lượt gọi Worker và dòng ghi D1 chưa có bộ đếm trong máy chủ nên chưa hiện. Khôi phục dữ liệu D1 (Time Travel) trong 7 ngày gần nhất.
            </p>
          </div>
        </Card>

        <Card>
          <div className="sys-stack">
            <div>
              <h3 className="sys-card-title">Dọn dữ liệu</h3>
              <p className="sys-card-desc">Chỉ dọn dữ liệu kỹ thuật, chạy mỗi đêm lúc 3 giờ (giờ UTC).</p>
            </div>
            <ul className="sys-principles">
              <li>Lần đăng nhập sai: giữ 7 ngày</li>
              <li>Phiên đăng nhập hết hạn hoặc đã thu hồi: giữ 30 ngày</li>
              <li>Nhật ký bộ chặn đáp án: giữ 30 ngày</li>
              <li>Nhật ký gọi AI (chỉ độ trễ, lỗi): giữ 90 ngày</li>
            </ul>
            <div className="sys-status-line">
              <span>Tự dọn dữ liệu cũ của người dùng</span>
              <StatusPill status="info" label="Đang tắt" />
            </div>
            <p className="sys-muted" style={{ margin: 0 }}>Dữ liệu học của gia đình chỉ bị xoá khi chính phụ huynh yêu cầu. Bật tự dọn cần chủ dự án quyết.</p>
          </div>
        </Card>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div className="sys-row-between" style={{ padding: '14px 16px 8px' }}>
          <div>
            <h3 className="sys-card-title">Lỗi phía người dùng</h3>
            <p className="sys-card-desc">Gom theo dấu lỗi từ trình duyệt của phụ huynh, cô và con.</p>
          </div>
          <StatusPill status={errors.length ? 'warn' : 'ok'} label={errLoading ? 'Đang tải…' : `${fmtNumber(errors.length)} dấu lỗi`} />
        </div>
        {errErr && !errLoading ? (
          <EmptyState mood="nudge" title="Chưa tải được danh sách lỗi" description={errErr} actionText="Thử lại" onAction={loadErrors} style={{ border: 'none', boxShadow: 'none' }} />
        ) : (
          <DataTable
            columns={errColumns}
            data={errors}
            loading={errLoading}
            rowKey="id"
            pageSize={20}
            emptyTitle="Chưa ghi nhận lỗi nào"
            emptyDescription="Khi trình duyệt của người dùng gặp lỗi, dấu lỗi sẽ được gom về đây."
          />
        )}
      </Card>
    </div>
  )
}
