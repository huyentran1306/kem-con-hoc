import { appConfirm } from './dialog'
import { useState, useEffect, useMemo } from 'react'
import {
  DEFAULT_SCOPE_RULES,
  getActiveScopeRules,
  setActiveScopeRules,
  formatScopeMessage,
  evaluateTextScope,
  parseOcrV2Result,
  SAMPLE_SCOPE_CASES,
  SCOPE_RULES_KV_KEY,
} from './scopeRules'
import { dbKvGet, dbKvSet, getScopeEvents, getScopeStats } from './api'
import { toast } from './utils'

export const SCOPE_CATEGORIES_META = [
  { id: 'nhay_cam', name: 'Ảnh nhạy cảm / riêng tư', desc: 'Có mặt người rõ, giấy tờ tuỳ thân, nội dung riêng tư', defaultAction: 'block' },
  { id: 'khong_phai_bai_tap', name: 'Không phải bài tập', desc: 'Đồ chơi, lego, đồ vật trong nhà, phong cảnh, ảnh game', defaultAction: 'block' },
  { id: 'anh_mo', name: 'Ảnh mờ / thiếu sáng', desc: 'Ảnh rung tay, không đọc rõ chữ hoặc mất góc', defaultAction: 'retake' },
  { id: 'nhieu_bai', name: 'Nhiều bài trong ảnh', desc: 'Có từ 2 câu bài tập trở lên trong một trang chụp', defaultAction: 'pick_one' },
  { id: 'ngoai_chuong_trinh', name: 'Ngoài chương trình', desc: 'Bài tập lớp 6 trở lên ngoài phạm vi tiểu học (lớp 1-5)', defaultAction: 'warn' },
  { id: 'lech_lop', name: 'Lệch lớp so với hồ sơ', desc: 'Bài tập chênh từ 2 lớp trở lên so với lớp hiện tại của con', defaultAction: 'warn' },
  { id: 'mon_chua_ho_tro', name: 'Môn chưa hỗ trợ', desc: 'Môn học ngoài Toán, Tiếng Việt, Tiếng Anh', defaultAction: 'warn' },
  { id: 'lam_ho', name: 'Làm bài hộ / viết văn hộ', desc: 'Phụ huynh yêu cầu viết sẵn toàn bộ bài văn hoặc giải hộ hoàn chỉnh', defaultAction: 'redirect' },
  { id: 'khong_lien_quan', name: 'Không liên quan bài tập', desc: 'Câu chat vu vơ hoặc chứa từ khoá gian lận/chặn', defaultAction: 'block' },
]

export function AdminScopeSection({ adminKey }) {
  const [rules, setRules] = useState(getActiveScopeRules())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [activeTab, setActiveTab] = useState('rules') // 'rules' | 'testbench' | 'logs'

  // Test bench state
  const [selectedSample, setSelectedSample] = useState(SAMPLE_SCOPE_CASES[0])
  const [testText, setTestText] = useState(SAMPLE_SCOPE_CASES[0].rawText)
  const [testChildGrade, setTestChildGrade] = useState('Lớp 2')
  const [testResult, setTestResult] = useState(null)

  // Audit logs state
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState({ byCategory: [], recentEvents: [] })
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Load rules from Cloudflare D1 KV on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const remote = await dbKvGet(SCOPE_RULES_KV_KEY)
        if (!cancelled && remote && typeof remote === 'object' && remote.version) {
          const merged = { ...DEFAULT_SCOPE_RULES, ...remote }
          setActiveScopeRules(merged)
          setRules(merged)
        }
      } catch (e) {
        console.warn('Load scope rules from KV failed, using local cache:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Load audit events when switching to logs tab
  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs()
    }
  }, [activeTab])

  const loadLogs = async () => {
    setLoadingLogs(true)
    try {
      const st = await getScopeStats()
      setStats(st)
      setEvents(st.recentEvents || [])
    } catch (e) {
      console.warn('Failed to load scope stats:', e)
    } finally {
      setLoadingLogs(false)
    }
  }

  // Save rules to Cloudflare D1 KV & LocalStorage
  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...rules,
        version: (rules.version || 1) + 1,
        updated_at: new Date().toISOString(),
        updated_by: adminKey ? 'Admin' : 'System',
      }
      setActiveScopeRules(payload)
      setRules(payload)

      const ok = await dbKvSet(SCOPE_RULES_KV_KEY, payload)
      if (ok) {
        toast(`✅ Đã lưu Luật phạm vi (v${payload.version}) lên Cloudflare D1 KV!`)
      } else {
        toast(`⚠️ Đã lưu cục bộ. Cloudflare KV chưa nhận phản hồi.`)
      }
    } catch (e) {
      toast(`❌ Lỗi khi lưu: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleResetDefault = async () => {
    if (await appConfirm('Khôi phục toàn bộ luật phạm vi và lời nhắn về mặc định ban đầu?', { okText: 'Khôi phục' })) {
      setActiveScopeRules(DEFAULT_SCOPE_RULES)
      setRules(DEFAULT_SCOPE_RULES)
      toast('Đã khôi phục cài đặt gốc!')
    }
  }

  const addBlockedKeyword = () => {
    const kw = newKeyword.trim().toLowerCase()
    if (!kw) return
    if ((rules.blocked_keywords || []).includes(kw)) {
      toast('Từ khoá này đã có trong danh sách!')
      return
    }
    const updated = {
      ...rules,
      blocked_keywords: [...(rules.blocked_keywords || []), kw],
    }
    setRules(updated)
    setNewKeyword('')
  }

  const removeBlockedKeyword = (kwToRemove) => {
    const updated = {
      ...rules,
      blocked_keywords: (rules.blocked_keywords || []).filter((k) => k !== kwToRemove),
    }
    setRules(updated)
  }

  // Run Test bench simulation
  const handleRunTest = (sampleObj = null) => {
    const target = sampleObj || selectedSample
    const textToTest = sampleObj ? sampleObj.rawText : testText
    let res = null

    if (sampleObj && sampleObj.mockAiJson) {
      // Giả lập kết quả OCR Vision V2
      res = parseOcrV2Result(sampleObj.mockAiJson, {
        childGrade: testChildGrade,
        childName: 'Bé Kem',
        parentRole: 'Mẹ',
        customRules: rules,
      })
    } else {
      // Đánh giá văn bản
      res = evaluateTextScope(textToTest, {
        childGrade: testChildGrade,
        childName: 'Bé Kem',
        parentRole: 'Mẹ',
        customRules: rules,
      })
    }

    setTestResult({
      ...res,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
    })
  }

  // Tính tỉ lệ Overridden
  const totalWarnings = useMemo(() => {
    return (stats.byCategory || [])
      .filter((c) => ['lech_lop', 'ngoai_chuong_trinh', 'mon_chua_ho_tro'].includes(c.category))
      .reduce((acc, cur) => acc + (cur.cnt || 0), 0)
  }, [stats])

  const totalOverridden = useMemo(() => {
    return (stats.byCategory || []).reduce((acc, cur) => acc + (cur.overridden_cnt || 0), 0)
  }, [stats])

  const overrideRate = totalWarnings > 0 ? Math.round((totalOverridden / totalWarnings) * 100) : 0

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', margin: '16px 0' }}>
      {/* Header bar */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', padding: '16px 20px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🛡️</span>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Luật Phạm Vi Ảnh & Đề Bài (Scope Rules)</h3>
            <span style={{ background: rules.enabled ? '#10B981' : '#64748B', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
              {rules.enabled ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#E2E8F0', fontSize: 11, padding: '2px 8px', borderRadius: 999 }}>
              v{rules.version || 1}
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#94A3B8' }}>
            Kiểm tra ảnh bài tập, đồ chơi, ảnh mờ, lệch lớp và chặn gian lận trước khi gọi AI soạn bài.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.12)', padding: 3, borderRadius: 8 }}>
            <button
              className="admin-btn sm"
              style={{
                background: activeTab === 'rules' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'rules' ? '#0F172A' : '#CBD5E1',
                fontWeight: 700,
                border: 'none',
              }}
              onClick={() => setActiveTab('rules')}
            >
              ⚙️ Cấu hình luật
            </button>
            <button
              className="admin-btn sm"
              style={{
                background: activeTab === 'testbench' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'testbench' ? '#0F172A' : '#CBD5E1',
                fontWeight: 700,
                border: 'none',
              }}
              onClick={() => setActiveTab('testbench')}
            >
              🧪 Bàn thử (6 Mẫu)
            </button>
            <button
              className="admin-btn sm"
              style={{
                background: activeTab === 'logs' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'logs' ? '#0F172A' : '#CBD5E1',
                fontWeight: 700,
                border: 'none',
              }}
              onClick={() => setActiveTab('logs')}
            >
              📊 Nhật ký ({events.length})
            </button>
          </div>

          <button
            className="admin-btn sm"
            style={{ background: '#10B981', color: '#fff', fontWeight: 800, border: 'none' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '⏳ Đang lưu...' : '💾 Lưu Luật'}
          </button>
        </div>
      </div>

      {/* TAB 1: CẤU HÌNH LUẬT & TIN NHẮN */}
      {activeTab === 'rules' && (
        <div style={{ padding: 20 }}>
          {/* Thông số cốt lõi */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
            {/* Toggle enabled */}
            <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>Bật kiểm tra phạm vi</span>
                <input
                  type="checkbox"
                  checked={rules.enabled}
                  onChange={(e) => setRules({ ...rules, enabled: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#10B981', cursor: 'pointer' }}
                />
              </label>
              <span style={{ display: 'block', fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
                Nếu tắt, mọi ảnh và đề đều đi thẳng vào AI soạn bài.
              </span>
            </div>

            {/* Ngưỡng lệch lớp */}
            <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>Ngưỡng lệch lớp cảnh báo</span>
                <span style={{ fontWeight: 800, color: '#0284C7', fontSize: 14 }}>
                  ≥ {rules.grade_gap_warn + 1} lớp
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="1"
                value={rules.grade_gap_warn}
                onChange={(e) => setRules({ ...rules, grade_gap_warn: parseInt(e.target.value, 10) })}
                style={{ width: '100%', marginTop: 8 }}
              />
              <span style={{ display: 'block', fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
                Mặc định: lệch từ 2 lớp trở lên mới cảnh báo (VD con lớp 2, bài lớp 4).
              </span>
            </div>

            {/* Độ dài ký tự tối thiểu */}
            <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>Độ dài đề chữ tối thiểu</span>
                <span style={{ fontWeight: 800, color: '#0284C7', fontSize: 14 }}>
                  {rules.min_confidence_text_len || 12} ký tự
                </span>
              </div>
              <input
                type="range"
                min="6"
                max="30"
                step="2"
                value={rules.min_confidence_text_len || 12}
                onChange={(e) => setRules({ ...rules, min_confidence_text_len: parseInt(e.target.value, 10) })}
                style={{ width: '100%', marginTop: 8 }}
              />
              <span style={{ display: 'block', fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
                Ngắn hơn số này và không có số sẽ coi là câu chat vu vơ.
              </span>
            </div>

            {/* Phạm vi khối lớp */}
            <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: 6 }}>
                Phạm vi khối lớp hỗ trợ
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#475569' }}>Lớp {rules.grade_min || 1} đến Lớp {rules.grade_max || 5}</span>
                <span style={{ fontSize: 11, background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                  Tiểu học
                </span>
              </div>
              <span style={{ display: 'block', fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
                Bài tập lớp 6 trở lên sẽ kích hoạt luật "Ngoài chương trình".
              </span>
            </div>
          </div>

          {/* Danh sách từ khoá chặn */}
          <div style={{ background: '#FFF1F2', padding: 16, borderRadius: 12, border: '1px solid #FECDD3', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#9F1239' }}>🚫 Từ khoá bị chặn (Blocked Keywords)</span>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#BE123C' }}>
                  Nếu đề bài chứa các từ khoá này, app lập tức dừng và yêu cầu nhập lại đề bài hợp lệ.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  placeholder="Thêm từ khoá chặn..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBlockedKeyword()}
                  style={{ padding: '6px 10px', fontSize: 13, borderRadius: 6, border: '1px solid #FDA4AF', width: 200 }}
                />
                <button
                  className="admin-btn sm"
                  style={{ background: '#E11D48', color: '#fff', border: 'none', fontWeight: 700 }}
                  onClick={addBlockedKeyword}
                >
                  + Thêm
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(rules.blocked_keywords || []).map((kw) => (
                <span
                  key={kw}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #FDA4AF',
                    color: '#9F1239',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 999,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {kw}
                  <button
                    onClick={() => removeBlockedKeyword(kw)}
                    style={{ background: 'none', border: 'none', color: '#E11D48', cursor: 'pointer', fontSize: 13, padding: 0 }}
                    title="Xoá từ khoá"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Bảng Hành động & Lời nhắn */}
          <div>
            <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: '#1E293B' }}>
              📋 Bảng Quy Tắc Hành Động & Lời Nhắn Thân Thiện ({SCOPE_CATEGORIES_META.length} Loại)
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #CBD5E1', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', width: '22%' }}>Loại vi phạm & Mô tả</th>
                    <th style={{ padding: '10px 12px', width: '15%' }}>Hành động</th>
                    <th style={{ padding: '10px 12px', width: '38%' }}>Mẫu lời nhắn (Hỗ trợ biến)</th>
                    <th style={{ padding: '10px 12px', width: '25%' }}>Xem trước phụ huynh</th>
                  </tr>
                </thead>
                <tbody>
                  {SCOPE_CATEGORIES_META.map((meta) => {
                    const currentAction = rules.actions?.[meta.id] || meta.defaultAction
                    const currentMessage = rules.messages?.[meta.id] || ''
                    const previewText = formatScopeMessage(currentMessage, {
                      so_bai: 3,
                      lop_doan: 8,
                      lop_con: 2,
                      ten_con: 'Bé Kem',
                      xung_ho: 'Mẹ',
                    })

                    return (
                      <tr key={meta.id} style={{ borderBottom: '1px solid #E2E8F0', verticalAlign: 'top' }}>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontWeight: 800, color: '#0F172A', display: 'block' }}>{meta.name}</span>
                          <span style={{ fontSize: 11.5, color: '#64748B' }}>{meta.desc}</span>
                          <span style={{ display: 'inline-block', marginTop: 4, fontFamily: 'monospace', fontSize: 11, background: '#F1F5F9', padding: '1px 5px', borderRadius: 4, color: '#475569' }}>
                            {meta.id}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <select
                            value={currentAction}
                            onChange={(e) => {
                              const updated = {
                                ...rules,
                                actions: { ...rules.actions, [meta.id]: e.target.value },
                              }
                              setRules(updated)
                            }}
                            style={{
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: '1px solid #CBD5E1',
                              fontSize: 12.5,
                              fontWeight: 700,
                              background:
                                currentAction === 'block'
                                  ? '#FEE2E2'
                                  : currentAction === 'warn'
                                  ? '#FEF3C7'
                                  : currentAction === 'pick_one'
                                  ? '#E0F2FE'
                                  : '#F0FDF4',
                              color:
                                currentAction === 'block'
                                  ? '#991B1B'
                                  : currentAction === 'warn'
                                  ? '#92400E'
                                  : currentAction === 'pick_one'
                                  ? '#0369A1'
                                  : '#166534',
                            }}
                          >
                            <option value="block">🚫 block (Dừng)</option>
                            <option value="retake">📷 retake (Chụp lại)</option>
                            <option value="warn">⚠️ warn (Cảnh báo)</option>
                            <option value="pick_one">📑 pick_one (Chọn bài)</option>
                            <option value="redirect">💡 redirect (Làm hộ)</option>
                            <option value="allow">✅ allow (Cho qua)</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <textarea
                            rows={3}
                            value={currentMessage}
                            onChange={(e) => {
                              const updated = {
                                ...rules,
                                messages: { ...rules.messages, [meta.id]: e.target.value },
                              }
                              setRules(updated)
                            }}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              fontSize: 12,
                              borderRadius: 6,
                              border: '1px solid #CBD5E1',
                              fontFamily: 'inherit',
                              lineHeight: 1.4,
                            }}
                          />
                          <span style={{ fontSize: 10.5, color: '#94A3B8' }}>
                            Biến: {'{so_bai}'}, {'{lop_doan}'}, {'{lop_con}'}, {'{ten_con}'}, {'{xung_ho}'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 8, borderRadius: 8, fontSize: 11.5, color: '#334155', lineHeight: 1.4 }}>
                            {previewText}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                className="admin-btn sm"
                style={{ background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1' }}
                onClick={handleResetDefault}
              >
                🔄 Khôi phục về mặc định ban đầu
              </button>
              <button
                className="admin-btn sm"
                style={{ background: '#10B981', color: '#fff', fontWeight: 800, border: 'none', padding: '8px 16px' }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '⏳ Đang lưu...' : '💾 Lưu toàn bộ thiết lập'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BÀN THỬ (TEST BENCH VỚI 6 MẪU) */}
      {activeTab === 'testbench' && (
        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: '#1E293B' }}>
              🧪 Bàn Thử Nghiệm Chuỗi Phân Loại (Test Bench)
            </h4>
            <p style={{ margin: 0, fontSize: 12.5, color: '#64748B' }}>
              Bấm chọn 1 trong 6 bài tập mẫu chuẩn bị sẵn để kiểm tra tức thì hành động và lời nhắn sinh ra.
            </p>
          </div>

          {/* 6 mẫu nhanh */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginBottom: 16 }}>
            {SAMPLE_SCOPE_CASES.map((sample) => {
              const isSelected = selectedSample?.id === sample.id
              return (
                <div
                  key={sample.id}
                  onClick={() => {
                    setSelectedSample(sample)
                    setTestText(sample.rawText)
                    handleRunTest(sample)
                  }}
                  style={{
                    background: isSelected ? '#EFF6FF' : '#F8FAFC',
                    border: isSelected ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                    padding: '10px 12px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: isSelected ? '#1D4ED8' : '#0F172A' }}>
                      {sample.name}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background:
                          sample.expectedAction === 'allow'
                            ? '#DCFCE7'
                            : sample.expectedAction === 'block'
                            ? '#FEE2E2'
                            : sample.expectedAction === 'pick_one'
                            ? '#E0F2FE'
                            : '#FEF3C7',
                        color:
                          sample.expectedAction === 'allow'
                            ? '#166534'
                            : sample.expectedAction === 'block'
                            ? '#991B1B'
                            : sample.expectedAction === 'pick_one'
                            ? '#0369A1'
                            : '#92400E',
                      }}
                    >
                      {sample.expectedAction}
                    </span>
                  </div>
                  <span style={{ fontSize: 11.5, color: '#64748B', display: 'block', lineHeight: 1.35 }}>
                    {sample.description}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Khung tuỳ biến và kiểm thử */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Input bên trái */}
            <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#1E293B' }}>Nội dung kiểm thử</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#64748B' }}>Hồ sơ con:</span>
                  <select
                    value={testChildGrade}
                    onChange={(e) => setTestChildGrade(e.target.value)}
                    style={{ fontSize: 12, padding: '3px 6px', borderRadius: 4, border: '1px solid #CBD5E1' }}
                  >
                    <option value="Lớp 1">Lớp 1</option>
                    <option value="Lớp 2">Lớp 2</option>
                    <option value="Lớp 3">Lớp 3</option>
                    <option value="Lớp 4">Lớp 4</option>
                    <option value="Lớp 5">Lớp 5</option>
                  </select>
                </div>
              </div>

              {selectedSample?.imagePath && (
                <div style={{ marginBottom: 10, textAlign: 'center', background: '#FFFFFF', padding: 8, borderRadius: 8, border: '1px dashed #CBD5E1' }}>
                  <img
                    src={selectedSample.imagePath}
                    alt={selectedSample.name}
                    style={{ maxHeight: 140, maxWidth: '100%', objectFit: 'contain' }}
                  />
                  <span style={{ display: 'block', fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                    Ảnh mẫu: {selectedSample.imagePath}
                  </span>
                </div>
              )}

              <textarea
                rows={5}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Nhập hoặc dán đề bài muốn thử..."
                style={{ width: '100%', padding: '8px 10px', fontSize: 12.5, borderRadius: 8, border: '1px solid #CBD5E1' }}
              />

              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button
                  className="admin-btn sm"
                  style={{ background: '#0284C7', color: '#fff', fontWeight: 800, border: 'none', flex: 1, padding: 8 }}
                  onClick={() => handleRunTest(null)}
                >
                  ⚡ Chạy Phân Loại Văn Bản
                </button>
                {selectedSample && (
                  <button
                    className="admin-btn sm"
                    style={{ background: '#4F46E5', color: '#fff', fontWeight: 800, border: 'none', flex: 1, padding: 8 }}
                    onClick={() => handleRunTest(selectedSample)}
                  >
                    📷 Giả Lập Vision AI (Mẫu)
                  </button>
                )}
              </div>
            </div>

            {/* Output kết quả bên phải */}
            <div style={{ background: '#FFFFFF', padding: 16, borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#1E293B' }}>Kết quả phân loại</span>
                {testResult && (
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>{testResult.timestamp}</span>
                )}
              </div>

              {testResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ background: '#F1F5F9', padding: '6px 12px', borderRadius: 8, flex: 1 }}>
                      <span style={{ display: 'block', fontSize: 10.5, color: '#64748B' }}>Loại vi phạm:</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{testResult.category}</span>
                    </div>
                    <div style={{ background: '#F1F5F9', padding: '6px 12px', borderRadius: 8, flex: 1 }}>
                      <span style={{ display: 'block', fontSize: 10.5, color: '#64748B' }}>Hành động:</span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color:
                            testResult.action === 'block'
                              ? '#DC2626'
                              : testResult.action === 'warn'
                              ? '#D97706'
                              : '#16A34A',
                        }}
                      >
                        {testResult.action}
                      </span>
                    </div>
                    <div style={{ background: '#F1F5F9', padding: '6px 12px', borderRadius: 8, flex: 1 }}>
                      <span style={{ display: 'block', fontSize: 10.5, color: '#64748B' }}>Độ tin cậy:</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0284C7' }}>
                        {Math.round((testResult.confidence || 0.9) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Lời nhắn gửi phụ huynh */}
                  {testResult.message && (
                    <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', padding: '10px 12px', borderRadius: 8 }}>
                      <span style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#92400E', marginBottom: 2 }}>
                        💬 Lời nhắn sẽ hiển thị cho phụ huynh:
                      </span>
                      <span style={{ fontSize: 12.5, color: '#78350F', lineHeight: 1.4 }}>
                        {testResult.message}
                      </span>
                    </div>
                  )}

                  {/* Lý do & ghi chú */}
                  <div style={{ fontSize: 12, color: '#475569' }}>
                    <strong>Lý do phân loại:</strong> {testResult.reason || 'Được thông qua'}
                  </div>

                  {/* JSON Raw Output */}
                  <div style={{ marginTop: 'auto' }}>
                    <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>
                      JSON chi tiết:
                    </span>
                    <pre style={{ background: '#0F172A', color: '#38BDF8', padding: 8, borderRadius: 6, fontSize: 11, margin: 0, overflowX: 'auto', maxHeight: 130 }}>
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13 }}>
                  Bấm một mẫu bên trên hoặc bấm "Chạy Phân Loại" để xem kết quả.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NHẬT KÝ SỰ KIỆN (AUDIT LOGS) */}
      {activeTab === 'logs' && (
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h4 style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 800, color: '#1E293B' }}>
                📊 Nhật Ký Vi Phạm Phạm Vi (Scope Events)
              </h4>
              <span style={{ fontSize: 12, color: '#64748B' }}>
                Ghi nhận các sự kiện vi phạm để tối ưu luật. Tuyệt đối không lưu ảnh hay đề nhạy cảm.
              </span>
            </div>
            <button
              className="admin-btn sm"
              style={{ background: '#F1F5F9', color: '#475569' }}
              onClick={loadLogs}
              disabled={loadingLogs}
            >
              🔄 Tải lại
            </button>
          </div>

          {/* Thống kê nhanh */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 12, borderRadius: 10 }}>
              <span style={{ fontSize: 11.5, color: '#64748B' }}>Tổng vi phạm 30 ngày:</span>
              <span style={{ display: 'block', fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                {(stats.byCategory || []).reduce((acc, c) => acc + (c.cnt || 0), 0)}
              </span>
            </div>
            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', padding: 12, borderRadius: 10 }}>
              <span style={{ fontSize: 11.5, color: '#92400E' }}>Tổng số lần cảnh báo:</span>
              <span style={{ display: 'block', fontSize: 20, fontWeight: 800, color: '#B45309', marginTop: 2 }}>
                {totalWarnings}
              </span>
            </div>
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: 12, borderRadius: 10 }}>
              <span style={{ fontSize: 11.5, color: '#1E40AF' }}>Tỉ lệ "Vẫn tiếp tục":</span>
              <span style={{ display: 'block', fontSize: 20, fontWeight: 800, color: '#2563EB', marginTop: 2 }}>
                {overrideRate}% ({totalOverridden} lần)
              </span>
            </div>
          </div>

          {/* Bảng sự kiện gần nhất */}
          {events.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #CBD5E1', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>Thời gian</th>
                    <th style={{ padding: '8px 10px' }}>Nguồn</th>
                    <th style={{ padding: '8px 10px' }}>Loại vi phạm</th>
                    <th style={{ padding: '8px 10px' }}>Hành động</th>
                    <th style={{ padding: '8px 10px' }}>Lý do</th>
                    <th style={{ padding: '8px 10px' }}>Đoán / Con</th>
                    <th style={{ padding: '8px 10px' }}>Vẫn tiếp tục?</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '8px 10px', color: '#64748B' }}>
                        {new Date(ev.created_at).toLocaleString('vi-VN')}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ background: '#E0F2FE', color: '#0369A1', fontSize: 11, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                          {ev.source || 'camera'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0F172A' }}>
                        {ev.category}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background:
                              ev.action === 'block'
                                ? '#FEE2E2'
                                : ev.action === 'warn'
                                ? '#FEF3C7'
                                : '#DCFCE7',
                            color:
                              ev.action === 'block'
                                ? '#991B1B'
                                : ev.action === 'warn'
                                ? '#92400E'
                                : '#166534',
                          }}
                        >
                          {ev.action}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#475569' }}>
                        {ev.reason || '—'}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#475569' }}>
                        {ev.grade_guess ? `Lớp ${ev.grade_guess}` : '—'} / {ev.child_grade ? `Lớp ${ev.child_grade}` : '—'}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        {ev.overridden ? (
                          <span style={{ color: '#D97706', fontWeight: 800 }}>✓ Có (Bỏ qua)</span>
                        ) : (
                          <span style={{ color: '#64748B' }}>✕ Không</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#94A3B8' }}>
              {loadingLogs ? 'Đang tải nhật ký từ D1...' : 'Chưa có sự kiện vi phạm phạm vi nào được ghi nhận.'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
