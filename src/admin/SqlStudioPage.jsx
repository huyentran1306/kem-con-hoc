/**
 * D1 SQL Studio (Đợt 15 · Chặng 3) — chỉ superadmin
 * Chạy qua POST /api/v1/admin/sql: máy chủ chỉ nhận MỘT câu SELECT, tự thêm LIMIT 200, chờ tối đa 5 giây, ghi nhật ký thao tác.
 */
import { useState } from 'react'
import { PageHeader, Card, Button, Chip, Segmented, StatusPill, DataTable, EmptyState, Banner, Textarea, staffToast } from '../ui/staff'
import { adminJson, errMessage, downloadCsv } from './systemShared'
import './pages-system.css'

const QUICK = [
  { name: '10 gia đình mới nhất', sql: 'SELECT id, name, created_at FROM families ORDER BY created_at DESC LIMIT 10' },
  { name: '10 buổi học gần nhất', sql: 'SELECT id, subject, grade, hint_level_max, started_at, ended_at FROM learning_sessions ORDER BY started_at DESC LIMIT 10' },
  { name: 'Lượt gọi AI theo ngày', sql: "SELECT date(created_at) AS ngay, COUNT(*) AS luot, SUM(CASE WHEN ok = 0 THEN 1 ELSE 0 END) AS loi FROM ai_calls GROUP BY ngay ORDER BY ngay DESC LIMIT 14" },
  { name: 'Danh sách bảng', sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name" },
  { name: 'Phiếu NPS gần nhất', sql: 'SELECT score, tags, comment, created_at FROM nps_responses ORDER BY created_at DESC LIMIT 10' },
  { name: '10 huy hiệu Đợt 19', sql: 'SELECT id, family_id, child_id, trait, source, reason, created_at FROM badge_events ORDER BY created_at DESC LIMIT 10' },
  { name: '10 đổi quà Đợt 19', sql: 'SELECT id, family_id, child_id, count, redeemed_at FROM reward_events ORDER BY redeemed_at DESC LIMIT 10' },
]

export default function SqlStudioPage({ adminProfile }) {
  const isSuper = (adminProfile?.role || 'superadmin') === 'superadmin'
  const [sql, setSql] = useState(QUICK[0].sql)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null) // { columns, rows, ms, limited, truncated } | { error }
  const [view, setView] = useState('table')

  if (!isSuper) {
    return (
      <div className="sys-page">
        <PageHeader title="D1 SQL Studio" description="Truy vấn chỉ đọc cơ sở dữ liệu D1." />
        <EmptyState mood="nudge" title="Chỉ tài khoản toàn quyền dùng được SQL Studio" description="Nhờ quản trị viên toàn quyền chạy truy vấn giúp bạn." />
      </div>
    )
  }

  const run = async () => {
    const q = sql.trim()
    if (!q) {
      staffToast('Chưa nhập câu lệnh', { tone: 'bad' })
      return
    }
    setBusy(true)
    setResult(null)
    const r = await adminJson('/api/v1/admin/sql', { method: 'POST', body: { sql: q } })
    setBusy(false)
    if (r.ok) {
      setResult({ columns: r.data?.columns || [], rows: r.data?.rows || [], ms: r.data?.ms, limited: r.data?.limited, truncated: r.data?.truncated })
    } else {
      setResult({ error: errMessage(r, 'Máy chủ chưa chạy được câu lệnh'), status: r.status })
    }
  }

  const rows = result?.rows || []
  const columns = (result?.columns?.length ? result.columns : Object.keys(rows[0] || {})).map((c) => ({
    key: c,
    title: c,
    render: (v) =>
      v === null || v === undefined ? (
        <span className="sys-null">NULL</span>
      ) : (
        <span className="sys-cell" title={typeof v === 'object' ? JSON.stringify(v) : String(v)}>
          {typeof v === 'object' ? JSON.stringify(v) : String(v)}
        </span>
      ),
  }))

  return (
    <div className="sys-page">
      <PageHeader title="D1 SQL Studio" description="Truy vấn chỉ đọc cơ sở dữ liệu D1. Mỗi lần chạy đều được ghi vào nhật ký thao tác." status={{ tone: 'info', label: 'Chỉ đọc' }} />

      <Card>
        <div className="sys-stack">
          <div className="sys-sql-rule">
            <StatusPill status="warn" label="Luật máy chủ" />
            <span>
              <b>Chỉ một câu SELECT, tối đa 200 dòng.</b> Không nhận PRAGMA, ATTACH hay câu ghi; thiếu LIMIT thì máy chủ tự thêm; quá 5 giây thì dừng.
            </span>
          </div>
          <div className="sys-row" style={{ gap: 8 }}>
            <span className="sys-label">Truy vấn mẫu</span>
            {QUICK.map((x) => (
              <Chip key={x.name} selected={sql === x.sql} onClick={() => setSql(x.sql)}>
                {x.name}
              </Chip>
            ))}
          </div>
          <Textarea
            rows={6}
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="SELECT …"
            spellCheck={false}
            aria-label="Câu lệnh SQL"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 13 }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                run()
              }
            }}
          />
          <div className="sys-row-between">
            <span className="sys-muted">Ctrl/⌘ + Enter để chạy</span>
            <div className="sys-row">
              <Button
                variant="ghost"
                onClick={() => {
                  setSql('')
                  setResult(null)
                }}
              >
                Xoá trắng
              </Button>
              <Button onClick={run} disabled={busy}>
                {busy ? 'Đang chạy…' : '▶ Chạy câu lệnh'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {result?.error && <Banner type="bad" message={result.status === 404 ? 'Máy chủ chưa bật chức năng SQL chỉ đọc mới.' : result.error} />}

      {result && !result.error && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sys-row-between" style={{ padding: '14px 16px 8px' }}>
            <div>
              <h3 className="sys-card-title">Kết quả · {rows.length.toLocaleString('vi-VN')} dòng</h3>
              <p className="sys-card-desc">
                {typeof result.ms === 'number' ? `D1 trả lời trong ${result.ms} ms` : ''}
                {result.limited ? ' · máy chủ đã thêm LIMIT 200' : ''}
                {result.truncated ? ' · đã cắt còn 200 dòng' : ''}
              </p>
            </div>
            {rows.length > 0 && (
              <div className="sys-row">
                <Segmented value={view} onChange={setView} options={[{ value: 'table', label: 'Bảng' }, { value: 'json', label: 'JSON' }]} />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadCsv('ket-qua-sql.csv', columns.map((c) => ({ title: c.title, key: c.key })), rows)}
                >
                  ⤓ CSV
                </Button>
              </div>
            )}
          </div>
          {rows.length === 0 ? (
            <EmptyState title="Không có dòng nào" description="Câu lệnh chạy xong nhưng không trả về dữ liệu." style={{ border: 'none', boxShadow: 'none' }} />
          ) : view === 'json' ? (
            <pre className="sys-json" style={{ margin: '0 16px 16px' }}>{JSON.stringify(rows, null, 2)}</pre>
          ) : (
            <DataTable columns={columns} data={rows.map((r, i) => ({ ...r, __k: i }))} rowKey="__k" maxHeight={460} pageSize={50} />
          )}
        </Card>
      )}
    </div>
  )
}
