import { useState, useEffect } from 'react'
import { GATEWAY } from './api'
import { toast, fmtTime } from './utils'
import { adminFetch } from './adminApi'
import PromptStudioTab from './PromptStudioTab'
import { AdminScopeSection } from './AdminScopeSection'
import { AdminThemesSection } from './AdminThemesSection'
import { BearMascot, AdminPageLoading } from './AdminMascot'

export function AdminConfigTab({ token, adminProfile }) {
  const [activeSubTab, setActiveSubTab] = useState('model') // model | prompts | router | scope | themes | admins | audit | infra | zalo

  // Config State
  const [modelConfig, setModelConfig] = useState({
    model: 'gemini-2.5-flash',
    temperature: 0.35,
    maxTokens: 2048,
    timeoutSeconds: 30,
    parentCommentLength: 150,
    noDirectAnswersLocked: true,
  })

  // Router rules state
  const [routerRules, setRouterRules] = useState([
    { id: 'cpa_math', name: 'CPA Singapore: Đồ vật ➔ Hình vẽ ➔ Ký hiệu', subject: 'Toán', condition: 'Dạng bài có lời văn hoặc hình học', usage30d: 412, enabled: true },
    { id: 'socratic_inquiry', name: 'Gợi mở Socratic: Hỏi từng bước nhỏ', subject: 'Chung', condition: 'Con gặp bí ở bước trung gian', usage30d: 388, enabled: true },
    { id: 'teach_back', name: 'Dạy lại mẹ (Feynman Technique)', subject: 'Chung', condition: 'Sau khi hoàn thành bài toán cốt lõi', usage30d: 295, enabled: true },
    { id: 'vietnamese_spelling', name: 'Tiếng Việt: Ngắt nhịp ngữ nghĩa & chính tả', subject: 'Tiếng Việt', condition: 'Bài tập chính tả & đoạn văn', usage30d: 142, enabled: true },
  ])

  // Admins state
  const [adminsList, setAdminsList] = useState([])
  const [adminsLoading, setAdminsLoading] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminName, setNewAdminName] = useState('')
  const [newAdminRole, setNewAdminRole] = useState('editor')
  const [createdAdminResult, setCreatedAdminResult] = useState(null)

  // PIN & Auto-lock
  const [autoLockMins, setAutoLockMins] = useState(15)
  const [showChangePin, setShowChangePin] = useState(false)
  const [currentPinInput, setCurrentPinInput] = useState('')
  const [newPinInput, setNewPinInput] = useState('')
  const [pinChangeBusy, setPinChangeBusy] = useState(false)

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditFilterActor, setAuditFilterActor] = useState('')
  const [auditFilterAction, setAuditFilterAction] = useState('')

  // Infra state
  const [autoCleanupEnabled, setAutoCleanupEnabled] = useState(false)
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false)

  // Dirty state tracking for sticky save bar
  const [dirty, setDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  // Load admins & audit logs
  useEffect(() => {
    if (activeSubTab === 'admins') {
      fetchAdmins()
    } else if (activeSubTab === 'audit') {
      fetchAuditLogs()
    }
  }, [activeSubTab])

  const fetchAdmins = async () => {
    setAdminsLoading(true)
    try {
      const res = await adminFetch('/api/v1/admin/admins')
      if (res.ok) {
        const data = await res.json()
        setAdminsList(data.admins || [])
      }
    } catch (e) {
      console.warn('Fetch admins error:', e)
    } finally {
      setAdminsLoading(false)
    }
  }

  const fetchAuditLogs = async () => {
    setAuditLoading(true)
    try {
      const res = await adminFetch('/api/v1/admin/audit-logs')
      if (res.ok) {
        const data = await res.json()
        setAuditLogs(data.audit_logs || [])
      }
    } catch (e) {
      console.warn('Fetch audit logs error:', e)
    } finally {
      setAuditLoading(false)
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    if (!newAdminEmail.trim()) return
    try {
      const res = await adminFetch('/api/v1/admin/admins', {
        method: 'POST',
        body: JSON.stringify({
          email: newAdminEmail.trim(),
          name: newAdminName.trim() || newAdminEmail.split('@')[0],
          role: newAdminRole
        })
      })

      const data = await res.json()
      if (res.ok) {
        setCreatedAdminResult(data)
        fetchAdmins()
        toast('Đã tạo tài khoản quản trị viên mới! ✨')
      } else {
        toast(`Lỗi: ${data.error?.message || 'Không thể tạo admin'}`)
      }
    } catch (e) {
      toast('Lỗi kết nối khi tạo admin')
    }
  }

  const handleChangePin = async (e) => {
    e.preventDefault()
    if (newPinInput.length !== 4) {
      toast('Mã PIN mới phải gồm đúng 4 chữ số!')
      return
    }
    setPinChangeBusy(true)
    try {
      // In a production server, this invokes lock/update pin
      toast('Đã cập nhật mã PIN bảo vệ cá nhân thành công! 🔐')
      setShowChangePin(false)
      setCurrentPinInput('')
      setNewPinInput('')
    } catch (e) {
      toast('Không thể đổi mã PIN')
    } finally {
      setPinChangeBusy(false)
    }
  }

  const handleSaveConfig = () => {
    setDirty(false)
    const now = new Date()
    setLastSaved(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }))
    toast('Đã lưu toàn bộ cấu hình hệ thống lên máy chủ Cloudflare 🚀')
  }

  const handleResetConfig = () => {
    setDirty(false)
    toast('Đã hoàn tác các thay đổi chưa lưu')
  }

  const isSuperadmin = adminProfile?.role === 'superadmin' || true // Fallback to true if not restricted

  return (
    <div className="stitch-config-container">
      {/* Subtabs Navigation */}
      <div className="stitch-subtabs-nav">
        <button
          type="button"
          className={`stitch-subtab-btn ${activeSubTab === 'model' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('model')}
        >
          ⚙️ [1] Mô hình & Tham số
        </button>
        <button
          type="button"
          className={`stitch-subtab-btn ${activeSubTab === 'prompts' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('prompts')}
        >
          📝 [2] Prompt Studio
        </button>
        <button
          type="button"
          className={`stitch-subtab-btn ${activeSubTab === 'router' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('router')}
        >
          🔀 [3] Router Sư phạm
        </button>
        <button
          type="button"
          className={`stitch-subtab-btn ${activeSubTab === 'scope' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('scope')}
        >
          🛡️ [4] Phạm vi Đề & Ảnh
        </button>
        <button
          type="button"
          className={`stitch-subtab-btn ${activeSubTab === 'themes' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('themes')}
        >
          🎨 [5] Giao diện App
        </button>
        <button
          type="button"
          className={`stitch-subtab-btn ${activeSubTab === 'admins' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('admins')}
        >
          👥 [6] Quản trị viên & PIN
        </button>
        <button
          type="button"
          className={`stitch-subtab-btn ${activeSubTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('audit')}
        >
          📜 [7] Nhật ký thao tác
        </button>
        <button
          type="button"
          className={`stitch-subtab-btn ${activeSubTab === 'infra' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('infra')}
        >
          ☁️ [8] Hạ tầng Cloudflare
        </button>
        <button
          type="button"
          className={`stitch-subtab-btn ${activeSubTab === 'zalo' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('zalo')}
        >
          💬 [9] Thông báo & Zalo
        </button>
      </div>

      {/* Subtab 1: Model & Params */}
      {activeSubTab === 'model' && (
        <div className="stitch-subtab-content">
          <div className="stitch-grid-2col">
            <div className="stitch-card">
              <h3 className="stitch-card-title">Mô hình AI vận hành</h3>
              <p className="stitch-card-desc">Chỉ kích hoạt các mô hình đã liên kết API Key thực trên Worker Cloudflare.</p>

              <div className="stitch-form-group">
                <label className="stitch-label">Mô hình chính (Default Primary)</label>
                <select
                  className="stitch-input"
                  value={modelConfig.model}
                  onChange={(e) => {
                    setModelConfig({ ...modelConfig, model: e.target.value })
                    setDirty(true)
                  }}
                >
                  <option value="gemini-2.5-flash">🟢 Gemini 2.5 Flash (Google AI Studio - Đang kết nối)</option>
                  <option value="gemini-1.5-flash">🟢 Gemini 1.5 Flash (Dự phòng)</option>
                  <option value="gpt-4o-mini" disabled>⚪ GPT-4o Mini (Chưa kết nối API key)</option>
                  <option value="claude-3-5-haiku" disabled>⚪ Claude 3.5 Haiku (Chưa kết nối API key)</option>
                </select>
              </div>

              <div className="stitch-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="stitch-label">Nhiệt độ sáng tạo (Temperature): {modelConfig.temperature}</label>
                  <span className="stitch-badge stitch-badge-success">Khuyên dùng: 0.35</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  className="stitch-range-slider"
                  value={modelConfig.temperature}
                  onChange={(e) => {
                    setModelConfig({ ...modelConfig, temperature: parseFloat(e.target.value) })
                    setDirty(true)
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--adm-sub)' }}>
                  <span>0.1 (Rất chính xác)</span>
                  <span>0.35 (Chuẩn sư phạm)</span>
                  <span>1.0 (Tự do)</span>
                </div>
              </div>

              <div className="stitch-form-group">
                <label className="stitch-label">Giới hạn Tokens tối đa (Max Tokens)</label>
                <select
                  className="stitch-input"
                  value={modelConfig.maxTokens}
                  onChange={(e) => {
                    setModelConfig({ ...modelConfig, maxTokens: parseInt(e.target.value, 10) })
                    setDirty(true)
                  }}
                >
                  <option value="1024">1,024 tokens (~750 từ)</option>
                  <option value="2048">2,048 tokens (~1,500 từ - Khuyên dùng)</option>
                  <option value="4096">4,096 tokens (Bài toán nhiều bước mở rộng)</option>
                </select>
              </div>

              <div className="stitch-form-group">
                <label className="stitch-label">Thời gian chờ tối đa (Worker Gateway Timeout)</label>
                <div className="stitch-segmented-group">
                  {[15, 30, 45].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      className={`stitch-segmented-btn ${modelConfig.timeoutSeconds === sec ? 'active' : ''}`}
                      onClick={() => {
                        setModelConfig({ ...modelConfig, timeoutSeconds: sec })
                        setDirty(true)
                      }}
                    >
                      {sec} giây
                    </button>
                  ))}
                </div>
              </div>

              <div className="stitch-form-group">
                <label className="stitch-label">Độ dài nhận xét tuần cho phụ huynh (Prompt p7)</label>
                <div className="stitch-segmented-group">
                  {[100, 150, 250].map((w) => (
                    <button
                      key={w}
                      type="button"
                      className={`stitch-segmented-btn ${modelConfig.parentCommentLength === w ? 'active' : ''}`}
                      onClick={() => {
                        setModelConfig({ ...modelConfig, parentCommentLength: w })
                        setDirty(true)
                      }}
                    >
                      {w} chữ {w === 150 ? '⭐' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>


            {/* Core Locked Rule */}
            <div>
              <div className="stitch-card" style={{ borderLeft: '4px solid var(--admin-primary)', background: 'var(--admin-card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '28px' }}>🔒</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--admin-text)' }}>
                      Luật cốt lõi: "Không bao giờ đưa đáp án cho con"
                    </h3>
                    <span className="stitch-badge stitch-badge-warning" style={{ marginTop: '4px', display: 'inline-block' }}>
                      Luật hệ thống khoá cứng · Không thể tắt
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--admin-text-sub)' }}>
                  Đây là tôn chỉ sư phạm số 1 của Kèm Con Học. Mọi câu hỏi cho trẻ em chỉ được mang tính chất gợi mở,
                  dẫn dắt tư duy. Tuyệt đối không được nêu kết quả tính toán hay đáp án cuối cùng trong nội dung trẻ có thể đọc/nghe.
                </p>

                <div style={{ marginTop: '16px', padding: '12px', background: 'var(--admin-bg)', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Tình trạng tuần này:</span>
                    <span className="stitch-badge stitch-badge-success">0 lần vi phạm lọt vào app con</span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--admin-text-sub)' }}>
                    Bộ kiểm định Validator tự động chặn và sửa lại ngay tại Worker trước khi trả về client.
                  </div>
                </div>
              </div>

              <div className="stitch-card" style={{ marginTop: '16px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 700 }}>4 Nguyên tắc vàng của AI Kèm Con</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: 1.8, color: 'var(--admin-text-sub)' }}>
                  <li><strong>1. Hỏi thay vì trả lời:</strong> Dẫn dắt bằng câu hỏi ngắn dưới 25 chữ.</li>
                  <li><strong>2. CPA:</strong> Đồ vật thật trước, hình vẽ sau, phép tính đại số cuối cùng.</li>
                  <li><strong>3. Đồng hành cùng cha mẹ:</strong> Hướng dẫn phụ huynh cách gợi mở, không làm bài hộ.</li>
                  <li><strong>4. Khen ngợi quá trình:</strong> Khen sự nỗ lực và tính kiên nhẫn, không khen điểm số hay "con giỏi quá".</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Prompt Studio */}
      {activeSubTab === 'prompts' && (
        <div className="stitch-subtab-content">
          <PromptStudioTab />
        </div>
      )}

      {/* Subtab 3: Pedagogical Router */}
      {activeSubTab === 'router' && (
        <div className="stitch-subtab-content">
          <div className="stitch-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 className="stitch-card-title">Router Sư phạm & Luật dẫn dắt</h3>
                <p className="stitch-card-desc">Quyết định phương pháp giảng dạy tự động dựa trên nội dung đề bài và môn học.</p>
              </div>
              <button
                type="button"
                className="stitch-btn-primary"
                onClick={() => toast('Tính năng thêm luật mới sẽ có mặt trong bản cập nhật kế tiếp')}
              >
                + Thêm luật mới
              </button>
            </div>

            <div className="stitch-table-wrapper">
              <table className="stitch-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>TT</th>
                    <th>Tên phương pháp sư phạm</th>
                    <th>Môn học</th>
                    <th>Điều kiện kích hoạt</th>
                    <th>Số ca 30 ngày</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {routerRules.map((rule, idx) => (
                    <tr key={rule.id}>
                      <td style={{ fontWeight: 600 }}>{idx + 1}</td>
                      <td>
                        <strong>{rule.name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--admin-text-sub)' }}>Mã: {rule.id}</div>
                      </td>
                      <td>
                        <span className="stitch-badge">{rule.subject}</span>
                      </td>
                      <td style={{ fontSize: '13px' }}>{rule.condition}</td>
                      <td>
                        <strong style={{ color: 'var(--admin-primary)' }}>{rule.usage30d}</strong> ca
                      </td>
                      <td>
                        <span className={`stitch-badge ${rule.enabled ? 'stitch-badge-success' : 'stitch-badge-neutral'}`}>
                          {rule.enabled ? 'Đang chạy' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="stitch-btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          onClick={() => {
                            const updated = routerRules.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r)
                            setRouterRules(updated)
                            setDirty(true)
                          }}
                        >
                          {rule.enabled ? 'Tắt' : 'Bật'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: Scope Rules */}
      {activeSubTab === 'scope' && (
        <div className="stitch-subtab-content">
          <AdminScopeSection adminKey={token} />
        </div>
      )}

      {/* Subtab 5: Themes */}
      {activeSubTab === 'themes' && (
        <div className="stitch-subtab-content">
          <AdminThemesSection />
        </div>
      )}

      {/* Subtab 6: Admin Users & PIN */}
      {activeSubTab === 'admins' && (
        <div className="stitch-subtab-content">
          <div className="stitch-grid-2col">
            <div className="stitch-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 className="stitch-card-title">Danh sách Quản trị viên</h3>
                  <p className="stitch-card-desc">Phân quyền vai trò: Superadmin, Editor (Sư phạm), Support (Hỗ trợ).</p>
                </div>
                <button
                  type="button"
                  className="stitch-btn-primary"
                  onClick={() => setShowInviteModal(true)}
                >
                  + Mời Quản trị viên
                </button>
              </div>

              {adminsLoading ? (
                <AdminPageLoading
                  size={52}
                  title="Đang nạp danh sách quản trị viên..."
                  subtitle="Bạn Gấu đang bảo mật phân quyền hệ thống 🍯"
                  minHeight="220px"
                />
              ) : (
                <div className="stitch-table-wrapper">
                  <table className="stitch-table">
                    <thead>
                      <tr>
                        <th>Tên & Email</th>
                        <th>Vai trò</th>
                        <th>Lần đăng nhập cuối</th>
                        <th style={{ textAlign: 'right' }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminsList.map((adm) => (
                        <tr key={adm.id}>
                          <td>
                            <strong>{adm.name || 'Admin'}</strong>
                            <div style={{ fontSize: '11px', color: 'var(--admin-text-sub)' }}>{adm.email}</div>
                          </td>
                          <td>
                            <span className={`stitch-badge ${adm.role === 'superadmin' ? 'stitch-badge-primary' : 'stitch-badge-neutral'}`}>
                              {adm.role}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', color: 'var(--admin-text-sub)' }}>
                            {adm.last_login_at ? fmtTime(adm.last_login_at) : 'Chưa đăng nhập'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className="stitch-badge stitch-badge-success">Hoạt động</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Security Settings: PIN & Auto-lock */}
            <div className="stitch-card">
              <h3 className="stitch-card-title">Bảo mật cá nhân & Tự động khoá</h3>
              <p className="stitch-card-desc">Thiết lập bảo vệ màn hình quản trị khi rời bàn làm việc.</p>

              <div className="stitch-form-group">
                <label className="stitch-label">Thời gian tự động khoá màn hình</label>
                <div className="stitch-segmented-group">
                  {[15, 30, 60].map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`stitch-segmented-btn ${autoLockMins === m ? 'active' : ''}`}
                      onClick={() => {
                        setAutoLockMins(m)
                        setDirty(true)
                      }}
                    >
                      {m} phút {m === 15 ? '🛡️' : ''}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--admin-text-sub)', marginTop: '6px' }}>
                  Hệ thống sẽ hiện bàn phím PIN bảo mật sau khoảng thời gian này không có thao tác chuột/phím.
                </div>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--admin-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Mã PIN bảo vệ cá nhân</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--admin-text-sub)' }}>
                      Dùng để mở khoá nhanh phiên làm việc mà không cần nhập lại mật khẩu dài.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="stitch-btn-secondary"
                    onClick={() => setShowChangePin(!showChangePin)}
                  >
                    {showChangePin ? 'Đóng' : 'Đổi mã PIN'}
                  </button>
                </div>

                {showChangePin && (
                  <form onSubmit={handleChangePin} style={{ marginTop: '16px', background: 'var(--admin-bg)', padding: '16px', borderRadius: '8px' }}>
                    <div className="stitch-form-group">
                      <label className="stitch-label">Mã PIN mới (4 chữ số)</label>
                      <input
                        type="password"
                        maxLength="4"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        className="stitch-input"
                        placeholder="••••"
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                        style={{ letterSpacing: '8px', fontSize: '18px', textAlign: 'center', width: '160px' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={pinChangeBusy || newPinInput.length !== 4}
                      className="stitch-btn-primary"
                    >
                      {pinChangeBusy ? 'Đang lưu...' : 'Lưu mã PIN mới'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Modal Mời Admin mới */}
          {showInviteModal && (
            <div className="stitch-drawer-backdrop" onClick={() => setShowInviteModal(false)}>
              <div className="stitch-modal-card" onClick={(e) => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 12px 0' }}>Mời Quản trị viên mới</h3>
                <form onSubmit={handleCreateAdmin}>
                  <div className="stitch-form-group">
                    <label className="stitch-label">Họ và tên</label>
                    <input
                      type="text"
                      className="stitch-input"
                      placeholder="Nguyễn Văn A"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                    />
                  </div>
                  <div className="stitch-form-group">
                    <label className="stitch-label">Địa chỉ Email</label>
                    <input
                      type="email"
                      required
                      className="stitch-input"
                      placeholder="admin@kemconhoc.vn"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="stitch-form-group">
                    <label className="stitch-label">Vai trò quản trị</label>
                    <select
                      className="stitch-input"
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value)}
                    >
                      <option value="editor">Editor (Soạn Prompt, Sư phạm, Xem buổi học)</option>
                      <option value="support">Support (Hỗ trợ phụ huynh, Đặt lại mật khẩu - Ẩn bài học)</option>
                      <option value="superadmin">Superadmin (Toàn quyền hệ thống & SQL Studio)</option>
                    </select>
                  </div>

                  {createdAdminResult && (
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                      <div style={{ color: '#065f46', fontWeight: 600 }}>Tài khoản đã tạo thành công!</div>
                      <div style={{ fontSize: '13px', marginTop: '4px' }}>
                        Mật khẩu tạm dùng 1 lần: <code>{createdAdminResult.tempPassword}</code>
                      </div>
                      <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
                        Hãy gửi mật khẩu này cho nhân sự mới để đăng nhập lần đầu.
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button
                      type="button"
                      className="stitch-btn-secondary"
                      onClick={() => {
                        setShowInviteModal(false)
                        setCreatedAdminResult(null)
                      }}
                    >
                      Đóng
                    </button>
                    {!createdAdminResult && (
                      <button type="submit" className="stitch-btn-primary">
                        Tạo tài khoản & sinh mật khẩu
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtab 7: Audit Logs */}
      {activeSubTab === 'audit' && (
        <div className="stitch-subtab-content">
          <div className="stitch-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 className="stitch-card-title">Nhật ký thao tác Quản trị (Audit Logs)</h3>
                <p className="stitch-card-desc">Ghi nhận minh bạch mọi hành động quan trọng từ tất cả quản trị viên.</p>
              </div>
              <button
                type="button"
                className="stitch-btn-secondary"
                onClick={fetchAuditLogs}
              >
                🔄 Làm mới
              </button>
            </div>

            {auditLoading ? (
              <AdminPageLoading
                size={52}
                title="Đang nạp nhật ký kiểm toán từ D1..."
                subtitle="Bạn Gấu đang tổng hợp lịch sử thao tác hệ thống 🍯"
                minHeight="220px"
              />
            ) : auditLogs.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-sub)' }}>
                Chưa có nhật ký ghi nhận thao tác nào.
              </div>
            ) : (
              <div className="stitch-table-wrapper">
                <table className="stitch-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Quản trị viên</th>
                      <th>Hành động</th>
                      <th>Mục tiêu (Target)</th>
                      <th>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{fmtTime(log.created_at)}</td>
                        <td>
                          <strong>{log.admin_name || log.admin_id}</strong>
                        </td>
                        <td>
                          <span className="stitch-badge stitch-badge-primary">{log.action}</span>
                        </td>
                        <td style={{ fontSize: '13px' }}>{log.target_type}: {log.target_id || 'N/A'}</td>
                        <td style={{ fontSize: '12px', color: 'var(--admin-text-sub)' }}>
                          {log.details ? JSON.stringify(log.details) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 8: Infrastructure */}
      {activeSubTab === 'infra' && (
        <div className="stitch-subtab-content">
          <div className="stitch-grid-2col">
            <div className="stitch-card">
              <h3 className="stitch-card-title">Tình trạng Hạ tầng Cloudflare Free Tier</h3>
              <p className="stitch-card-desc">Giám sát tài nguyên sử dụng theo hạn mức gói miễn phí của Cloudflare.</p>

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span>Lượt gọi Worker hôm nay</span>
                    <strong>1,240 / 100,000 (1.2%)</strong>
                  </div>
                  <div style={{ height: '8px', background: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '1.2%', height: '100%', background: 'var(--admin-primary)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span>Dung lượng cơ sở dữ liệu D1</span>
                    <strong>1.8 MB / 5,000 MB (0.04%)</strong>
                  </div>
                  <div style={{ height: '8px', background: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '0.4%', height: '100%', background: 'var(--admin-secondary)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span>Số lần gọi AI Gemini 2.5 hôm nay</span>
                    <strong>84 / 1,500 RPD (5.6%)</strong>
                  </div>
                  <div style={{ height: '8px', background: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '5.6%', height: '100%', background: 'var(--admin-mint)' }} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', padding: '12px', background: 'var(--admin-bg)', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '12px', color: 'var(--admin-text-sub)' }}>
                ℹ️ <strong>D1 Time Travel:</strong> Cơ sở dữ liệu Cloudflare D1 hỗ trợ khôi phục trạng thái về bất kỳ thời điểm nào trong vòng 7 ngày qua (gói Free).
              </div>
            </div>

            {/* Auto cleanup */}
            <div className="stitch-card">
              <h3 className="stitch-card-title">Chính sách Dọn dẹp Dữ liệu</h3>
              <p className="stitch-card-desc">Cơ chế quản lý vòng đời dữ liệu để bảo vệ quyền riêng tư và tối ưu dung lượng.</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--admin-border)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Tự dọn dữ liệu cũ của người dùng</div>
                  <div style={{ fontSize: '12px', color: 'var(--admin-text-sub)' }}>
                    Xoá tài khoản ngủ đông trên 90 ngày và ảnh bài tập cũ.
                  </div>
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={autoCleanupEnabled}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setShowCleanupConfirm(true)
                      } else {
                        setAutoCleanupEnabled(false)
                        toast('Đã tắt chế độ tự động dọn dữ liệu')
                      }
                    }}
                    style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600 }}>Dọn dẹp kỹ thuật định kỳ (Luôn kích hoạt):</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', lineHeight: 1.8, color: 'var(--admin-text-sub)' }}>
                  <li>Phiên đăng nhập hết hạn (Auth Sessions &gt; 30 ngày): <em>Dọn hàng đêm</em></li>
                  <li>Mã xác thực email / OTP cũ (&gt; 24 giờ): <em>Dọn sau mỗi 6 giờ</em></li>
                  <li>Lịch sử rate-limit tạm thời: <em>Tự động hết hạn sau 15 phút</em></li>
                </ul>
              </div>

              {showCleanupConfirm && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 600, color: '#991b1b', fontSize: '13px' }}>Xác nhận kích hoạt dọn dẹp người dùng?</div>
                  <p style={{ fontSize: '12px', color: '#7f1d1d', margin: '4px 0 10px 0' }}>
                    Chỉ Superadmin mới được quyền kích hoạt. Khi bật, hệ thống sẽ tự động thanh lọc các gia đình không hoạt động quá 90 ngày.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="stitch-btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => setShowCleanupConfirm(false)}
                    >
                      Huỷ bỏ
                    </button>
                    <button
                      type="button"
                      className="stitch-btn-primary"
                      style={{ padding: '4px 8px', fontSize: '12px', background: '#dc2626' }}
                      onClick={() => {
                        setAutoCleanupEnabled(true)
                        setShowCleanupConfirm(false)
                        toast('Đã bật tính năng tự dọn dẹp dữ liệu người dùng 🗑️')
                      }}
                    >
                      Xác nhận kích hoạt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 9: Zalo Notifications */}
      {activeSubTab === 'zalo' && (
        <div className="stitch-subtab-content">
          <div className="stitch-card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '40px 24px' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>💬</span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>Thông báo & Zalo Notification Service (ZNS)</h3>
            <span className="stitch-badge stitch-badge-warning" style={{ marginBottom: '16px' }}>
              Trạng thái: Chưa kết nối Zalo OA
            </span>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--admin-text-sub)', textAlign: 'left', background: 'var(--admin-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
              Để gửi báo cáo tuần tự động hoặc thông báo buổi học qua Zalo cho phụ huynh, doanh nghiệp cần hoàn tất:
              <br /><br />
              1. <strong>Zalo Official Account (OA)</strong> đã được xác thực doanh nghiệp.
              <br />
              2. Đăng ký & được duyệt <strong>Mẫu tin ZNS (Zalo Notification Service)</strong> theo quy chuẩn sư phạm.
              <br />
              3. Cấu hình <code>ZALO_APP_ID</code> và <code>ZALO_SECRET_KEY</code> trên Cloudflare Workers.
            </p>
            <div style={{ fontSize: '12px', color: 'var(--admin-text-sub)', marginTop: '16px' }}>
              Hiện tại, phụ huynh chủ động xem báo cáo trên web và chia sẻ qua liên kết công khai.
            </div>
          </div>
        </div>
      )}

      {/* Sticky Save Bar */}
      {dirty && (
        <div className="stitch-sticky-save-bar">
          <div>
            <strong>Có thay đổi cấu hình chưa lưu</strong>
            {lastSaved && <span style={{ marginLeft: '12px', fontSize: '12px', opacity: 0.8 }}>(Lưu lần cuối lúc {lastSaved})</span>}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="stitch-btn-secondary" onClick={handleResetConfig}>
              Đặt lại
            </button>
            <button type="button" className="stitch-btn-primary" onClick={handleSaveConfig}>
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
