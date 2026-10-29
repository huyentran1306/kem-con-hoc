const PRESET_SAMPLES = [
  {
    type: 'leak',
    label: '🚨 Lộ số (19)',
    desc: 'Đáp án là 19 cây bút.',
    problem: 'Bác Ba có 10 cây bút, mua thêm 9 cây bút. Hỏi có tất cả bao nhiêu cây bút?',
    answer: '19 cây bút',
    text: 'Đáp án là 19 cây bút.',
  },
  {
    type: 'leak',
    label: '🚨 Lộ chữ (mười chín)',
    desc: 'Con lấy mười chín cây bút nhé.',
    problem: 'Bác Ba có 10 cây bút, mua thêm 9 cây bút. Hỏi có tất cả bao nhiêu cây bút?',
    answer: '19 cây bút',
    text: 'Con lấy mười chín cây bút nhé.',
  },
  {
    type: 'leak',
    label: '🚨 Lộ cụm từ đáp án',
    desc: 'Kết quả đúng là 19 cây bút.',
    problem: 'Bác Ba có 10 cây bút, mua thêm 9 cây bút. Hỏi có tất cả bao nhiêu cây bút?',
    answer: '19 cây bút',
    text: 'Kết quả đúng là 19 cây bút.',
  },
  {
    type: 'safe',
    label: '✅ An toàn 1 (đồ vật)',
    desc: 'Lấy que tính đếm',
    problem: 'Bác Ba có 10 cây bút, mua thêm 9 cây bút. Hỏi có tất cả bao nhiêu cây bút?',
    answer: '19 cây bút',
    text: 'Con thử lấy que tính tượng trưng cho 10 cây bút và 9 cây bút xem nào?',
  },
  {
    type: 'safe',
    label: '✅ An toàn 2 (phép tính)',
    desc: 'Hỏi cộng hay trừ',
    problem: 'Bác Ba có 10 cây bút, mua thêm 9 cây bút. Hỏi có tất cả bao nhiêu cây bút?',
    answer: '19 cây bút',
    text: 'Mua thêm thì mình làm phép tính cộng hay phép tính trừ con nhỉ?',
  },
  {
    type: 'safe',
    label: '✅ An toàn 3 (đọc đề)',
    desc: 'Hỏi đề yêu cầu gì',
    problem: 'Bác Ba có 10 cây bút, mua thêm 9 cây bút. Hỏi có tất cả bao nhiêu cây bút?',
    answer: '19 cây bút',
    text: 'Con đọc lại câu hỏi xem đề bài hỏi tất cả bao nhiêu cây bút nào?',
  },
]

/**
 * src/AdminSafetyTab.jsx — trang "An toàn AI & phản hồi" của admin (Đợt 15 · Chặng 3)
 * 1. Chỉ số an toàn toàn hệ thống (7 ngày) từ /api/v1/admin/safety-summary; chưa có dữ liệu thì KpiCard hiện "·"
 * 2. Nhật ký bộ chặn lộ đáp án (guard_log)
 * 3. Phản hồi của phụ huynh (ai_feedback), có nút đóng
 * 4. Bàn thử bộ chặn (không gọi AI, chỉ chạy bộ kiểm trên Worker)
 */
import React, { useEffect, useState } from 'react'
import { PageHeader, Card, Button, StatusPill, KpiCard, Tabs, DataTable, Field, Input, Textarea, Select, Banner, staffToast } from './ui/staff'
import { adminJson, errMessage, fmtDateTime, fmtNumber } from './admin/systemShared'
import './admin/pages-system.css'

const REASON_LABELS = {
  leak: { text: 'Lộ đáp án', tone: 'bad' },
  too_hard: { text: 'Quá khó với tuổi', tone: 'warn' },
  teacher_way: { text: 'Khác cách cô dạy', tone: 'info' },
  wrong: { text: 'Sai kiến thức hoặc đề', tone: 'bad' },
}
const OUTCOME_LABELS = {
  fallback: { text: 'Thay câu an toàn', tone: 'warn' },
  regenerated: { text: 'Sinh lại', tone: 'ok' },
  leaked: { text: 'Lọt tới con', tone: 'bad' },
  // Prompt 32
  xin_dap_an: { text: 'Chặn xin đáp án', tone: 'warn' },
  sua_bac: { text: 'Sửa riêng bậc', tone: 'ok' },
  sua_bac_chung_chung: { text: 'Soạn lại bậc chung chung', tone: 'ok' },
  sua_phep_tinh: { text: 'Sửa phép tính', tone: 'ok' },
  chan_an_toan: { text: 'Thay câu an toàn', tone: 'warn' },
}
const PROMPT_OPTIONS = [
  { value: 'p3_explain', label: 'Giảng bài 3 bậc' },
  { value: 'p14b_check_work', label: 'Chấm vở, không sửa hộ' },
  { value: 'p14d_teach_back', label: 'Nghe con giảng lại' },
  { value: 'p4_chat', label: 'Hỏi thêm AI (xin đáp án)' },
  { value: 'p3_explain_v3', label: 'Soạn bài v3' },
]

export function AdminSafetyTab({ token }) {
  const [loading, setLoading] = useState(true)
  const [subTab, setSubTab] = useState('logs')
  const [summary, setSummary] = useState(null)
  const [summaryErr, setSummaryErr] = useState(false)
  const [logs, setLogs] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [logErr, setLogErr] = useState('')

  const [testPromptId, setTestPromptId] = useState('p3_explain')
  const [testText, setTestText] = useState('Con lấy ba hộp, mỗi hộp tám cây bút là mười chín cây.')
  const [testAnswer, setTestAnswer] = useState('19 cây bút')
  const [testProblem, setTestProblem] = useState('Có ba hộp bút, mỗi hộp tám cây…')
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const [s, l] = await Promise.all([adminJson('/api/v1/admin/safety-summary'), adminJson('/api/v1/safety/log?limit=100')])
    if (s.ok) {
      setSummary(s.data)
      setSummaryErr(false)
    } else {
      setSummary(null)
      setSummaryErr(true)
    }
    if (l.ok) {
      setLogs(l.data?.guard_logs || [])
      setFeedbacks(l.data?.feedbacks || [])
      setLogErr('')
    } else {
      setLogs([])
      setFeedbacks([])
      setLogErr(errMessage(l, 'Chưa tải được nhật ký'))
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCloseFeedback = async (id) => {
    const r = await adminJson(`/api/v1/admin/ai-feedback/${encodeURIComponent(id)}/close`, { method: 'POST' })
    if (!r.ok) {
      staffToast(errMessage(r, 'Chưa đóng được phản hồi'), { tone: 'bad' })
      return
    }
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'closed', closed_by: 'admin' } : f)))
    staffToast('Đã đóng phản hồi')
  }

  const handleRunTest = async () => {
    setTesting(true)
    const data = { dap_an_cuoi_cho_me: testAnswer, cau_hoi: testText, cau_hoi_cho_con: { muc_1: testText }, cau_hoi_them: testText }
    const r = await adminJson('/api/v1/safety/test-guard', { method: 'POST', body: { promptId: testPromptId, data, context: { problem_text: testProblem } } })
    setTesting(false)
    if (!r.ok) {
      staffToast(errMessage(r, 'Chưa chạy thử được'), { tone: 'bad' })
      return
    }
    setTestResult(r.data?.result || null)
  }

  const g = summary?.guard
  const fb = summary?.feedback
  const wc = summary?.workChecks
  const safeRate = g && g.total > 0 ? `${(((g.total - g.leaked) / g.total) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : null
  const openFeedbacks = feedbacks.filter((f) => f.status === 'open').length

  const logColumns = [
    { key: 'created_at', title: 'Thời gian', render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(v)}</span> },
    { key: 'prompt_id', title: 'Prompt', render: (v) => <span className="sys-mono">{v || '·'}</span> },
    { key: 'field', title: 'Trường', render: (v) => <span className="sys-mono">{v || '·'}</span> },
    { key: 'before_text', title: 'Câu AI sinh (bị chặn)', render: (v) => <div className="sys-cell-wrap" style={{ color: 'var(--s-bad)' }}>{v || '·'}</div> },
    { key: 'after_text', title: 'Câu thay thế', render: (v) => <div className="sys-cell-wrap" style={{ color: 'var(--s-ok)', fontWeight: 700 }}>{v || '·'}</div> },
    { key: 'outcome', title: 'Kết quả', render: (v) => <StatusPill status={(OUTCOME_LABELS[v] || {}).tone || 'info'} label={(OUTCOME_LABELS[v] || {}).text || v || '·'} /> },
  ]
  const fbColumns = [
    { key: 'created_at', title: 'Thời gian', render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(v)}</span> },
    { key: 'reason', title: 'Lý do', render: (v) => <StatusPill status={(REASON_LABELS[v] || {}).tone || 'info'} label={(REASON_LABELS[v] || {}).text || v || '·'} /> },
    { key: 'question_text', title: 'Câu hỏi bị báo', render: (v) => <div className="sys-cell-wrap" style={{ fontStyle: 'italic' }}>{v ? `“${v}”` : '·'}</div> },
    { key: 'note', title: 'Ghi chú của phụ huynh', render: (v) => <div className="sys-cell-wrap">{v || '·'}</div> },
    { key: 'status', title: 'Trạng thái', render: (v) => <StatusPill status={v === 'open' ? 'bad' : 'info'} label={v === 'open' ? 'Đang mở' : 'Đã đóng'} /> },
    {
      key: 'act',
      title: '',
      align: 'right',
      render: (_, f) =>
        f.status === 'open' ? (
          <Button size="sm" variant="secondary" onClick={() => handleCloseFeedback(f.id)}>
            ✓ Đóng
          </Button>
        ) : null,
    },
  ]

  return (
    <div className="sys-page">
      <PageHeader
        title="An toàn AI & phản hồi"
        description="Bộ chặn lộ đáp án và phản hồi của phụ huynh về câu hỏi AI, toàn hệ thống."
        actions={
          <Button variant="ghost" onClick={loadData} disabled={loading}>
            {loading ? 'Đang tải…' : 'Làm mới'}
          </Button>
        }
      />

      {summaryErr && <Banner type="warn" message="Chưa đọc được chỉ số an toàn từ máy chủ, các ô đang hiện ·" />}

      <div className="sys-kpis">
        <KpiCard label="Tỉ lệ câu an toàn" value={safeRate} sub="7 ngày qua, theo nhật ký bộ chặn" emptyText={g ? 'Chưa có câu nào qua bộ chặn' : 'Chưa có dữ liệu'} tone="ok" />
        <KpiCard label="Lượt bộ chặn can thiệp" value={g ? fmtNumber(g.fallbacks + g.regenerated) : null} sub={g ? `${fmtNumber(g.fallbacks)} thay câu · ${fmtNumber(g.regenerated)} sinh lại` : ''} />
        <KpiCard label="Phản hồi đang mở" value={fb ? fmtNumber(fb.open) : null} sub={fb ? `Tổng ${fmtNumber(fb.total)} phản hồi` : ''} tone={fb?.open ? 'warn' : 'default'} />
        <KpiCard label="Con tự sửa bài" value={wc && wc.total > 0 ? fmtNumber(wc.selfFixed) : null} sub={wc ? `trên ${fmtNumber(wc.total)} lần chấm vở, 7 ngày` : ''} emptyText={wc ? 'Chưa có lần chấm vở nào' : 'Chưa có dữ liệu'} tone="ok" />
      </div>

      <Tabs
        activeTab={subTab}
        onChange={setSubTab}
        ariaLabel="Mục an toàn AI"
        tabs={[
          { id: 'logs', label: 'Nhật ký bộ chặn', count: loading ? null : logs.length },
          { id: 'feedback', label: 'Phụ huynh phản hồi', count: loading ? null : openFeedbacks || null },
          { id: 'test', label: 'Thử bộ chặn' },
        ]}
      />

      {logErr && subTab !== 'test' && <Banner type="bad" message={logErr} actionText="Thử lại" onAction={loadData} />}

      {subTab === 'logs' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable
            columns={logColumns}
            data={logs}
            loading={loading}
            rowKey="id"
            pageSize={20}
            emptyTitle="Chưa có lần can thiệp nào"
            emptyDescription="Khi AI sinh câu có thể lộ đáp án, bộ chặn thay câu và ghi lại ở đây."
          />
        </Card>
      )}

      {subTab === 'feedback' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable
            columns={fbColumns}
            data={feedbacks}
            loading={loading}
            rowKey="id"
            pageSize={20}
            emptyTitle="Chưa có phản hồi nào"
            emptyDescription="Phụ huynh bấm “Câu này chưa hợp” trong app thì phản hồi hiện ở đây."
          />
        </Card>
      )}

      {subTab === 'test' && (
        <Card>
          <div className="sys-stack">
            <div>
              <h3 className="sys-card-title">Thử bộ chặn lộ đáp án</h3>
              <p className="sys-card-desc">Nhập câu AI có thể sinh ra và đáp án cần giấu để xem bộ chặn có bắt được không. Không gọi AI.</p>
            </div>

            {/* 6 Mẫu thử có sẵn (3 câu lộ, 3 câu an toàn - Prompt 23 Chặng 4.1) */}
            <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#475569', display: 'block', marginBottom: 8 }}>
                📋 Chọn mẫu thử có sẵn (3 câu lộ đáp án, 3 câu an toàn):
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {PRESET_SAMPLES.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTestProblem(s.problem)
                      setTestAnswer(s.answer)
                      setTestText(s.text)
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 700,
                      border: s.type === 'leak' ? '1px solid #FECACA' : '1px solid #BBF7D0',
                      background: s.type === 'leak' ? '#FEF2F2' : '#F0FDF4',
                      color: s.type === 'leak' ? '#991B1B' : '#166534',
                      cursor: 'pointer',
                    }}
                    title={s.desc}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sys-grid-2 sys-even">
              <Field label="Prompt">
                <Select ariaLabel="Prompt" value={testPromptId} onChange={setTestPromptId} options={PROMPT_OPTIONS} />
              </Field>
              <Field label="Đáp án cần giấu">
                <Input value={testAnswer} onChange={(e) => setTestAnswer(e.target.value)} />
              </Field>
            </div>
            <Field label="Đề bài" hint="Các số có trong đề được phép nhắc lại.">
              <Input value={testProblem} onChange={(e) => setTestProblem(e.target.value)} />
            </Field>
            <Field label="Câu AI sinh cần kiểm">
              <Textarea rows={3} value={testText} onChange={(e) => setTestText(e.target.value)} />
            </Field>
            <div>
              <Button onClick={handleRunTest} disabled={testing}>
                {testing ? 'Đang kiểm…' : 'Kiểm tra ngay'}
              </Button>
            </div>
            {testResult && (
              <div className={`sys-test-result ${testResult.leaked ? 'sys-leak' : ''}`} role="status">
                <b style={{ color: testResult.leaked ? 'var(--s-bad)' : 'var(--s-ok)' }}>
                  {testResult.leaked ? '🚨 Phát hiện lộ đáp án' : '✅ An toàn, không lộ đáp án'}
                </b>
                {testResult.leaked && (testResult.leakReasons || []).length > 0 && (
                  <ul className="sys-principles" style={{ marginTop: 6 }}>
                    {(testResult.leakReasons || []).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

export default AdminSafetyTab
