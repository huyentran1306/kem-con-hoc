/**
 * src/AdminSafetyTab.jsx
 * 
 * Tab "An toàn AI" trong Admin Portal (Đợt 14 Phần C):
 * 1. Thống kê KPI an toàn 4 lớp
 * 2. Bảng nhật ký can thiệp guard_log
 * 3. Bảng phản hồi phụ huynh ai_feedback (kèm nút đóng xử lý)
 * 4. Hộp thử nghiệm nhanh bộ lọc Guard trực tiếp
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, StatusPill, Kpi, Segmented, DataTable, EmptyState } from './ui/staff/index.jsx'
import { getSafetySummary, getSafetyLog, closeAiFeedback, testGuardFilter } from './api.js'

export function AdminSafetyTab({ token }) {
  const [loading, setLoading] = useState(true)
  const [subTab, setSubTab] = useState('logs') // 'logs' | 'feedback' | 'test'
  const [summary, setSummary] = useState(null)
  const [logs, setLogs] = useState([])
  const [feedbacks, setFeedbacks] = useState([])

  // Test Tool state
  const [testPromptId, setTestPromptId] = useState('p3_explain')
  const [testText, setTestText] = useState('Con lấy ba hộp mỗi hộp tám cây bút là mười chín cây.')
  const [testAnswer, setTestAnswer] = useState('19 cây bút')
  const [testProblem, setTestProblem] = useState('Có ba hộp bút, mỗi hộp tám cây...')
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [sumRes, logRes] = await Promise.all([
        getSafetySummary(),
        getSafetyLog({ limit: 100 }),
      ])
      if (sumRes?.ok) setSummary(sumRes)
      if (logRes?.ok) {
        setLogs(logRes.guard_logs || [])
        setFeedbacks(logRes.feedbacks || [])
      }
    } catch (e) {
      console.error('Lỗi tải dữ liệu An toàn AI:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCloseFeedback = async (id) => {
    try {
      await closeAiFeedback(id)
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: 'closed', closed_by: 'admin' } : f))
      )
    } catch (e) {
      alert('Không thể đóng phản hồi: ' + e.message)
    }
  }

  const handleRunTest = async () => {
    setTesting(true)
    try {
      const data = {
        dap_an_cuoi_cho_me: testAnswer,
        cau_hoi: testText,
        cau_hoi_cho_con: { muc_1: testText },
        cau_hoi_them: testText,
      }
      const context = {
        problem_text: testProblem,
      }
      const res = await testGuardFilter({ promptId: testPromptId, data, context })
      setTestResult(res?.result || null)
    } catch (e) {
      alert('Lỗi test: ' + e.message)
    } finally {
      setTesting(false)
    }
  }

  const REASON_LABELS = {
    leak: { text: 'Lộ đáp án', pill: 'danger' },
    too_hard: { text: 'Quá khó với tuổi', pill: 'warning' },
    teacher_way: { text: 'Khác cách cô dạy', pill: 'info' },
    wrong: { text: 'Sai kiến thức/đề', pill: 'danger' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <Kpi
          label="Tỷ lệ An toàn AI"
          value={`${summary?.safe_rate_percent || 100}%`}
          sub="Chặn tuyệt đối lộ đáp án"
          style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}
        />
        <Kpi
          label="Lượt can thiệp bảo vệ"
          value={summary?.total_guard_interventions || 0}
          sub={`${summary?.guard_events?.fallbacks || 0} fallback · ${summary?.guard_events?.regenerated || 0} regenerated`}
          style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}
        />
        <Kpi
          label="Phản hồi Phụ huynh mở"
          value={summary?.feedback?.open || 0}
          sub={`Tổng số: ${summary?.feedback?.total || 0} phản hồi`}
          style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}
        />
        <Kpi
          label="Học sinh tự sửa bài"
          value={summary?.work_checks?.self_fixed || 0}
          sub="Phát hiện & sửa thành công"
          style={{ background: '#FAF5FF', borderColor: '#E9D5FF' }}
        />
      </div>

      {/* 2. Sub-tab navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Segmented
          value={subTab}
          onChange={setSubTab}
          options={[
            { value: 'logs', label: `🛡️ Nhật ký Guard (${logs.length})` },
            { value: 'feedback', label: `🚩 Phụ huynh phản hồi (${feedbacks.length})` },
            { value: 'test', label: '🧪 Thử nghiệm Bộ chặn Guard' },
          ]}
        />
        <Button variant="ghost" size="small" onClick={loadData} busy={loading}>
          🔄 Làm mới
        </Button>
      </div>

      {/* 3. Sub-tab Content */}
      {subTab === 'logs' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--c-line)', fontWeight: 800 }}>
            Nhật ký các lần AI can thiệp thay thế câu rò rỉ đáp án (guard_log)
          </div>
          {logs.length === 0 ? (
            <EmptyState
              title="Chưa có sự kiện can thiệp"
              description="Hệ thống chạy an toàn 100%, chưa phát hiện câu hỏi nào vi phạm bộ quy tắc."
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 14px' }}>Thời gian</th>
                    <th style={{ padding: '10px 14px' }}>Prompt</th>
                    <th style={{ padding: '10px 14px' }}>Trường bị bắt</th>
                    <th style={{ padding: '10px 14px' }}>Câu AI sinh (Bị chặn)</th>
                    <th style={{ padding: '10px 14px' }}>Câu an toàn thay thế</th>
                    <th style={{ padding: '10px 14px' }}>Kết quả</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: 'var(--c-text-2)' }}>
                        {new Date(l.created_at).toLocaleString('vi-VN')}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{l.prompt_id}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12 }}>{l.field}</td>
                      <td style={{ padding: '10px 14px', color: '#DC2626', maxWidth: 220 }}>{l.before_text}</td>
                      <td style={{ padding: '10px 14px', color: '#16A34A', fontWeight: 600, maxWidth: 220 }}>
                        {l.after_text}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 800,
                            background: l.outcome === 'fallback' ? '#FEF3C7' : '#DCFCE7',
                            color: l.outcome === 'fallback' ? '#92400E' : '#166534',
                          }}
                        >
                          {l.outcome}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {subTab === 'feedback' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--c-line)', fontWeight: 800 }}>
            Phản hồi từ phụ huynh khi gặp câu hỏi AI chưa hợp lý (ai_feedback)
          </div>
          {feedbacks.length === 0 ? (
            <EmptyState
              title="Chưa có phản hồi nào"
              description="Phụ huynh hoàn toàn hài lòng với chất lượng câu hỏi sư phạm của AI."
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 14px' }}>Thời gian</th>
                    <th style={{ padding: '10px 14px' }}>Lý do</th>
                    <th style={{ padding: '10px 14px' }}>Câu hỏi bị báo</th>
                    <th style={{ padding: '10px 14px' }}>Ghi chú phụ huynh</th>
                    <th style={{ padding: '10px 14px' }}>Trạng thái</th>
                    <th style={{ padding: '10px 14px' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((f) => {
                    const rMeta = REASON_LABELS[f.reason] || { text: f.reason, pill: 'default' }
                    return (
                      <tr key={f.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: 'var(--c-text-2)' }}>
                          {new Date(f.created_at).toLocaleString('vi-VN')}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: 6,
                              fontSize: 11.5,
                              fontWeight: 700,
                              background: '#F1F5F9',
                              color: '#334155',
                            }}
                          >
                            {rMeta.text}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', fontStyle: 'italic', maxWidth: 220 }}>
                          "{f.question_text}"
                        </td>
                        <td style={{ padding: '10px 14px', maxWidth: 200 }}>{f.note || '—'}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: 6,
                              fontSize: 11.5,
                              fontWeight: 800,
                              background: f.status === 'open' ? '#FEE2E2' : '#E2E8F0',
                              color: f.status === 'open' ? '#991B1B' : '#475569',
                            }}
                          >
                            {f.status === 'open' ? '🔴 Đang mở' : 'Đã đóng'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {f.status === 'open' && (
                            <Button
                              variant="soft"
                              size="small"
                              onClick={() => handleCloseFeedback(f.id)}
                            >
                              ✓ Đóng
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {subTab === 'test' && (
        <Card style={{ padding: 20 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800 }}>
            🧪 Thử nghiệm Bộ chặn Guard trực tiếp (checkAnswerLeak)
          </h4>
          <p style={{ fontSize: 13, color: 'var(--c-text-2)', margin: '0 0 16px' }}>
            Nhập câu hỏi dự kiến và đáp án cấm để xem thuật toán số chữ tiếng Việt và bộ lọc có phát hiện rò rỉ hay không.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                Chọn Prompt:
              </label>
              <select
                value={testPromptId}
                onChange={(e) => setTestPromptId(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--c-line)' }}
              >
                <option value="p3_explain">p3_explain (Giảng bài 3 bậc)</option>
                <option value="p14b_check_work">p14b_check_work (Chấm vở không sửa hộ)</option>
                <option value="p14d_teach_back">p14d_teach_back (Nghe con giảng lại)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                Đáp án cấm lộ (finalAnswer):
              </label>
              <input
                type="text"
                value={testAnswer}
                onChange={(e) => setTestAnswer(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--c-line)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
              Đề bài (problem_text - các số trong đề bài được phép nói):
            </label>
            <input
              type="text"
              value={testProblem}
              onChange={(e) => setTestProblem(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--c-line)' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
              Nội dung câu AI sinh cần kiểm tra:
            </label>
            <textarea
              rows={3}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid var(--c-line)', fontFamily: 'inherit' }}
            />
          </div>

          <Button variant="solid" onClick={handleRunTest} busy={testing}>
            Kiểm tra vi phạm ngay ›
          </Button>

          {testResult && (
            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: 10,
                background: testResult.leaked ? '#FEF2F2' : '#F0FDF4',
                border: `1.5px solid ${testResult.leaked ? '#FCA5A5' : '#86EFAC'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{testResult.leaked ? '🚨' : '✅'}</span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: testResult.leaked ? '#DC2626' : '#16A34A',
                  }}
                >
                  {testResult.leaked ? 'PHÁT HIỆN LỘ ĐÁP ÁN!' : 'AN TOÀN · KHÔNG LỘ ĐÁP ÁN'}
                </span>
              </div>
              {testResult.leaked && (
                <div style={{ fontSize: 13, color: '#991B1B' }}>
                  <strong>Lý do chặn:</strong>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                    {(testResult.leakReasons || []).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
