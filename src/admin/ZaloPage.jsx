/**
 * Thông báo & Zalo (Đợt 15 · Chặng 3)
 * - Thanh 4 bước kết nối Zalo OA: trạng thái đọc từ /api/v1/admin/zalo-status; chưa có cấu hình thì đang ở bước 1
 * - Danh sách mẫu tin + trạng thái, xem trước tin
 * - Số link báo cáo đã chia sẻ từ bảng report_shares (/api/v1/admin/report-shares)
 */
import { useEffect, useState } from 'react'
import { PageHeader, Card, KpiCard, StatusPill, Banner } from '../ui/staff'
import { adminJson, fmtNumber, fmtDateTime } from './systemShared'
import './pages-system.css'

const TEMPLATES = [
  {
    id: 'weekly_report',
    icon: '📊',
    name: 'Báo cáo tuần',
    when: 'Gửi tối Chủ nhật, kèm link xem báo cáo',
    title: 'Báo cáo tuần của {{ten_con}} ({{tuan}})',
    body: '{{so_toi_hoc}} tối học · tự làm được {{bac_tu_lam}} bậc. Bấm để xem chi tiết.',
    button: 'Xem báo cáo',
  },
  {
    id: 'study_reminder',
    icon: '⏰',
    name: 'Nhắc giờ học',
    when: 'Theo giờ gia đình đặt, tối đa 1 tin mỗi ngày',
    title: 'Đến giờ học cùng {{ten_con}} rồi',
    body: 'Hôm nay con có {{so_bai}} bài cần làm. Mở app để bắt đầu nhé.',
    button: 'Mở Kèm Con Học',
  },
  {
    id: 'teacher_note',
    icon: '📌',
    name: 'Cô nhắc',
    when: 'Hiện trong app, chưa gửi qua Zalo',
    title: '{{ten_co}} nhắc lớp {{ten_lop}}',
    body: '{{noi_dung_nhac}}',
    button: 'Xem trong app',
    inAppOnly: true,
  },
]

const STATUS = {
  approved: { tone: 'ok', label: 'Đã duyệt' },
  pending: { tone: 'warn', label: 'Chờ Zalo duyệt' },
  rejected: { tone: 'bad', label: 'Bị từ chối' },
  none: { tone: 'info', label: 'Chưa đăng ký' },
  inapp: { tone: 'info', label: 'Dùng trong app' },
}

function Vars({ text }) {
  const parts = String(text).split(/(\{\{[\w.]+\}\})/g)
  return (
    <>
      {parts.map((p, i) =>
        /^\{\{[\w.]+\}\}$/.test(p) ? (
          <mark key={i} className="sys-var">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  )
}

export default function ZaloPage() {
  const [zalo, setZalo] = useState(null)
  const [shares, setShares] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [pick, setPick] = useState(TEMPLATES[0].id)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [z, s] = await Promise.all([adminJson('/api/v1/admin/zalo-status'), adminJson('/api/v1/admin/report-shares')])
      if (!alive) return
      setZalo(z.ok ? z.data : null)
      setShares(s.ok ? s.data : null)
      setLoaded(true)
    })()
    return () => {
      alive = false
    }
  }, [])

  const tplStatus = (t) => {
    if (t.inAppOnly) return STATUS.inapp
    const found = (zalo?.templates || []).find((x) => x.id === t.id)
    return STATUS[found?.status] || STATUS.none
  }
  const zaloTemplates = TEMPLATES.filter((t) => !t.inAppOnly)
  const approvedCount = zaloTemplates.filter((t) => tplStatus(t) === STATUS.approved).length
  const pendingCount = zaloTemplates.filter((t) => tplStatus(t) === STATUS.pending).length

  const done = [
    Boolean(zalo?.oaConnected),
    zaloTemplates.length > 0 && approvedCount === zaloTemplates.length,
    Boolean(zalo?.keysSet),
    Boolean(zalo?.testSentAt),
  ]
  let current = done.findIndex((d) => !d)
  if (current === -1) current = 4
  const steps = [
    { icon: '🏢', title: 'Tạo Zalo OA', sub: done[0] ? 'Tài khoản doanh nghiệp đã xác thực' : 'Tài khoản doanh nghiệp, đã xác thực' },
    {
      icon: '📝',
      title: 'Duyệt mẫu ZNS',
      sub: done[1] ? 'Mọi mẫu đã được duyệt' : pendingCount ? `${pendingCount} mẫu đang chờ Zalo duyệt` : 'Đăng ký mẫu tin với Zalo',
    },
    { icon: '🔑', title: 'Nhập khoá', sub: done[2] ? 'Đã có khoá trên Worker' : 'ZALO_APP_ID và khoá bí mật trên Worker' },
    { icon: '📨', title: 'Gửi thử', sub: done[3] ? `Đã gửi lúc ${fmtDateTime(zalo.testSentAt)}` : 'Gửi tới số của quản trị viên' },
  ]
  const connected = current === 4
  const t = TEMPLATES.find((x) => x.id === pick) || TEMPLATES[0]

  return (
    <div className="sys-page">
      <PageHeader
        title="Thông báo & Zalo"
        description="Gửi báo cáo tuần và nhắc giờ học cho phụ huynh qua Zalo."
        status={loaded ? (connected ? { tone: 'ok', label: 'Đã kết nối Zalo OA' } : { tone: 'warn', label: 'Chưa kết nối Zalo OA' }) : null}
      />

      {loaded && !zalo && <Banner type="warn" message="Chưa đọc được trạng thái Zalo từ máy chủ, đang hiện từ bước 1." />}

      <ol className="sys-steps" aria-label="Các bước kết nối Zalo OA" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {steps.map((s, i) => (
          <li key={s.title} className={`sys-step ${done[i] ? 'sys-done' : i === current ? 'sys-now' : ''}`} aria-current={i === current ? 'step' : undefined}>
            <i aria-hidden="true">{done[i] ? '✅' : s.icon}</i>
            <b>
              {i + 1} · {s.title}
            </b>
            <span>{s.sub}</span>
          </li>
        ))}
      </ol>

      <div className="sys-grid-2 sys-even">
        <Card>
          <div className="sys-stack" style={{ gap: 10 }}>
            <span className="sys-label">Mẫu tin</span>
            {TEMPLATES.map((x) => {
              const st = tplStatus(x)
              return (
                <button key={x.id} type="button" className={`sys-tpl ${pick === x.id ? 'sys-on' : ''}`} onClick={() => setPick(x.id)} aria-pressed={pick === x.id}>
                  <b>
                    {x.icon} {x.name}
                  </b>
                  <StatusPill status={st.tone} label={st.label} />
                  <small>{x.when}</small>
                </button>
              )
            })}
            <p className="sys-muted" style={{ margin: 0 }}>Trong lúc chờ: phụ huynh tự chia sẻ link báo cáo qua Zalo ngay trong app.</p>
          </div>
        </Card>

        <Card>
          <div className="sys-stack" style={{ gap: 12 }}>
            <span className="sys-label">Xem trước tin Zalo</span>
            <div className="sys-zalo" aria-label={`Xem trước mẫu ${t.name}`}>
              <div className="sys-zalo-head">
                <i>K</i>Kèm Con Học
              </div>
              <b>
                <Vars text={t.title} />
              </b>
              <span>
                <Vars text={t.body} />
              </span>
              <span className="sys-zalo-btn">{t.button}</span>
            </div>
            <p className="sys-muted" style={{ margin: 0 }}>Phần tô vàng là biến, được thay bằng dữ liệu thật của từng gia đình khi gửi.</p>
          </div>
        </Card>
      </div>

      <div className="sys-kpis">
        <KpiCard label="Link báo cáo đã chia sẻ (7 ngày)" value={shares && shares.last7d !== null ? fmtNumber(shares.last7d) : null} sub={shares && shares.total !== null ? `Tổng ${fmtNumber(shares.total)} link` : ''} />
        <KpiCard label="Lượt mở xem báo cáo" value={shares && shares.views !== null ? fmtNumber(shares.views) : null} sub="Cộng dồn mọi link" />
      </div>
    </div>
  )
}
