import { useState } from 'react'
import { dbQuery } from './api'
import { toast } from './utils'
import TeamPromptSyncTab from './TeamPromptSyncTab'
import { AdminPageLoading } from './AdminMascot'

const QUICK_QUERIES = [
  {
    name: '10 gia đình mới nhất',
    sql: 'SELECT id, name, created_at FROM families ORDER BY created_at DESC LIMIT 10;',
  },
  {
    name: '10 buổi học kèm gần nhất',
    sql: 'SELECT id, subject, grade, hint_level_max, started_at, ended_at FROM learning_sessions ORDER BY started_at DESC LIMIT 10;',
  },
  {
    name: 'Cấu trúc bảng learning_sessions',
    sql: "PRAGMA table_info('learning_sessions');",
  },
  {
    name: 'Danh sách các chỉ mục (indexes)',
    sql: "PRAGMA index_list('learning_sessions');",
  },
  {
    name: 'Đánh giá NPS từ phụ huynh',
    sql: 'SELECT score, tags, comment, created_at FROM nps_responses ORDER BY created_at DESC LIMIT 10;',
  },
]

export function AdminToolsTab({ token, adminProfile, activeSubTab: propSubTab, onSubTabChange }) {
  const [localSubTool, setLocalSubTool] = useState('sql')
  const subTool = propSubTab || localSubTool
  const setSubTool = onSubTabChange || setLocalSubTool

  // SQL State
  const [sqlQuery, setSqlQuery] = useState('SELECT id, name, created_at FROM families ORDER BY created_at DESC LIMIT 10;')
  const [sqlBusy, setSqlBusy] = useState(false)
  const [sqlResult, setSqlResult] = useState(null)
  const [sqlExecTime, setSqlExecTime] = useState(null)
  const [sqlViewMode, setSqlViewMode] = useState('table') // table | json

  const handleRunSql = async () => {
    const q = sqlQuery.trim()
    if (!q) {
      toast('Vui lòng nhập câu lệnh SQL')
      return
    }

    // Safety checks for read-only SQL Studio: only SELECT or PRAGMA table_info / index_list
    const upper = q.toUpperCase()
    const isSelect = upper.startsWith('SELECT')
    const isPragma = upper.startsWith('PRAGMA TABLE_INFO') || upper.startsWith('PRAGMA INDEX_LIST')
    if (!isSelect && !isPragma) {
      toast('SQL Studio được bảo vệ ở chế độ CHỈ ĐỌC (Chỉ cho phép SELECT và PRAGMA table_info/index_list)! 🔒')
      return
    }

    setSqlBusy(true)
    setSqlResult(null)
    const t0 = performance.now()
    try {
      const res = await dbQuery(q)
      const t1 = performance.now()
      setSqlExecTime(Math.round(t1 - t0))
      if (res && res.results) {
        setSqlResult(res.results)
        toast(`Truy vấn D1 thành công trong ${Math.round(t1 - t0)}ms`)
      } else if (res && res.error) {
        setSqlResult({ error: res.error })
      } else {
        setSqlResult([])
      }
    } catch (e) {
      setSqlResult({ error: e.message || 'Lỗi thực thi D1' })
    } finally {
      setSqlBusy(false)
    }
  }

  return (
    <div className="stitch-tools-container">

      {subTool === 'sql' && (
        <div className="stitch-subtab-content">
          <div className="stitch-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 className="stitch-card-title">D1 Database SQL Studio</h3>
                <p className="stitch-card-desc">
                  Truy vấn trực tiếp cơ sở dữ liệu Cloudflare D1. Được bảo vệ an toàn ở chế độ <strong>Chỉ Đọc (Read-only)</strong>.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="stitch-badge stitch-badge-success">D1 SQLite 3</span>
                <span className="stitch-badge stitch-badge-primary">Read-Only</span>
              </div>
            </div>

            {/* Quick Queries */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--adm-sub)' }}>
                Truy vấn mẫu:
              </span>
              {QUICK_QUERIES.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="stitch-quick-query-btn"
                  onClick={() => setSqlQuery(item.sql)}
                >
                  ⚡ {item.name}
                </button>
              ))}
            </div>

            {/* SQL Input Area */}
            <div className="stitch-form-group">
              <textarea
                rows="5"
                className="stitch-input"
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '13.5px',
                  background: '#0F172A',
                  color: '#38BDF8',
                  lineHeight: 1.6,
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1.5px solid #334155',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                }}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                placeholder="Nhập câu lệnh SELECT..."
              />
            </div>


            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--admin-text-sub)' }}>
                Phím tắt: Bấm Chạy câu lệnh hoặc thử các mẫu sẵn có bên trên.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="stitch-btn-secondary"
                  onClick={() => {
                    setSqlQuery('')
                    setSqlResult(null)
                  }}
                >
                  Xoá trắng
                </button>
                <button
                  type="button"
                  disabled={sqlBusy}
                  className="stitch-btn-primary"
                  onClick={handleRunSql}
                >
                  {sqlBusy ? 'Đang thực thi...' : '▶ Chạy câu lệnh'}
                </button>
              </div>
            </div>
          </div>

          {sqlBusy && (
            <div style={{ marginTop: '20px' }}>
              <AdminPageLoading
                size={52}
                title="Đang thực thi câu lệnh SQL trên Cloudflare D1..."
                subtitle="Máy chủ đang truy vấn SQLite an toàn ở chế độ Chỉ Đọc 🍯"
                minHeight="180px"
              />
            </div>
          )}

          {sqlResult && (
            <div className="stitch-card" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                    Kết quả truy vấn{' '}
                    {Array.isArray(sqlResult) ? `(${sqlResult.length} bản ghi)` : ''}
                  </h4>
                  {sqlExecTime !== null && (
                    <div style={{ fontSize: '12px', color: 'var(--admin-text-sub)', marginTop: '2px' }}>
                      Thời gian phản hồi từ D1: <strong>{sqlExecTime}ms</strong>
                    </div>
                  )}
                </div>
                {Array.isArray(sqlResult) && sqlResult.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      className={`stitch-btn-secondary ${sqlViewMode === 'table' ? 'active' : ''}`}
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => setSqlViewMode('table')}
                    >
                      Bảng
                    </button>
                    <button
                      type="button"
                      className={`stitch-btn-secondary ${sqlViewMode === 'json' ? 'active' : ''}`}
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => setSqlViewMode('json')}
                    >
                      JSON
                    </button>
                  </div>
                )}
              </div>

              {sqlResult.error ? (
                <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '13px' }}>
                  <strong>Lỗi thực thi D1:</strong> {sqlResult.error}
                </div>
              ) : !Array.isArray(sqlResult) || sqlResult.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--admin-text-sub)' }}>
                  Truy vấn thành công nhưng không có bản ghi nào được trả về.
                </div>
              ) : sqlViewMode === 'json' ? (
                <pre style={{ background: 'var(--admin-bg)', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '12px', maxHeight: '400px' }}>
                  {JSON.stringify(sqlResult, null, 2)}
                </pre>
              ) : (
                <div className="stitch-table-wrapper" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                  <table className="stitch-table">
                    <thead>
                      <tr>
                        {Object.keys(sqlResult[0] || {}).map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sqlResult.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {Object.keys(row).map((col) => (
                            <td key={col} style={{ fontSize: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {row[col] === null ? (
                                <span style={{ color: 'var(--admin-text-sub)', fontStyle: 'italic' }}>NULL</span>
                              ) : typeof row[col] === 'object' ? (
                                JSON.stringify(row[col])
                              ) : (
                                String(row[col])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {subTool === 'team_prompts' && (
        <div className="stitch-subtab-content">
          <TeamPromptSyncTab />
        </div>
      )}
    </div>
  )
}
