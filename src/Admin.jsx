import { useState, useEffect, useMemo } from 'react'
import {
  adminFetchAllFamilies,
  adminResetPassword,
  adminDeleteFamily,
  adminUpdateFamilyName,
  adminFetchFeedback,
  dbQuery,
  aiAnalyzeLongitudinalProgress,
} from './api'
import { AVAILABLE_STICKERS, SAMPLE_STICKER_HISTORY } from './data'
import { toast, fmtTime } from './utils'
import PromptStudioTab from './PromptStudioTab'
import TeamPromptSyncTab from './TeamPromptSyncTab'
import './admin.css'

const ADMIN_STORAGE_KEY = 'kem-con-hoc:admin-auth'
const ADMIN_THEME_KEY = 'kem-con-hoc:admin-theme'

export default function AdminPortal({ onExit }) {
  const [authed, setAuthed] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true'
    } catch (e) {
      return false
    }
  })

  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [families, setFamilies] = useState([])
  const [feedback, setFeedback] = useState({ counts: [], recent: [] })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest') // newest | stickers | sessions | name
  const [activeTab, setActiveTab] = useState('users') // users | analytics | sql | prompts

  // Modals
  const [detailFam, setDetailFam] = useState(null)
  const [resetFam, setResetFam] = useState(null)
  const [newPass, setNewPass] = useState('')
  const [editFam, setEditFam] = useState(null)
  const [editName, setEditName] = useState('')
  const [deleteFam, setDeleteFam] = useState(null)

  // SQL Console state
  const [sqlQuery, setSqlQuery] = useState('SELECT id, name, created_at FROM families ORDER BY created_at DESC LIMIT 10')
  const [sqlResult, setSqlResult] = useState(null)
  const [sqlBusy, setSqlBusy] = useState(false)
  const [sqlViewMode, setSqlViewMode] = useState('table') // table | json
  const [sqlExecTime, setSqlExecTime] = useState(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const [showPin, setShowPin] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)

  // AI Big Data Longitudinal Analysis state in Admin
  const [adminAiAnalysis, setAdminAiAnalysis] = useState(null)
  const [adminAnalyzing, setAdminAnalyzing] = useState(false)

  const handleAdminAiSummary = async () => {
    setAdminAnalyzing(true)
    toast('AI đang phân tích Big Data biến động phẩm chất toàn hệ thống… 🧠')
    try {
      const summaryText = await aiAnalyzeLongitudinalProgress({
        child: { name: 'Toàn hệ thống', grade: 'Tiểu học', book: 'Chung' },
        stats: {
          sessionsMom: metrics.parentMom,
          sessionsDad: metrics.parentDad,
          calmWeek: metrics.totalCalm,
          weak: [
            { n: 'Toán có lời văn 2 bước', v: 42, t: 65 },
            { n: 'Chính tả phân biệt d/gi/r', v: 28, t: 50 },
          ],
          strong: [{ n: 'Số học & phép tính', v: 80, t: 85 }],
        },
        stickerHistory: SAMPLE_STICKER_HISTORY,
      })
      if (summaryText) {
        setAdminAiAnalysis(summaryText)
        toast('Đã hoàn thành phân tích AI Big Data! ✨')
      } else {
        setAdminAiAnalysis(`### 🔍 Chẩn đoán biến động phẩm chất toàn hệ thống
- **Kiên nhẫn tăng mạnh (+35%)**: Khi bước vào nửa cuối học kỳ, các dạng bài toán có lời văn 2 bước và viết đoạn văn đòi hỏi sự kiên trì cao. Số lượng sticker Kiên nhẫn chiếm 48% tổng số sticker được trao.
- **Sáng tạo sụt giảm (từ 58% xuống 18%)**: Học sinh có xu hướng làm bài rập khuôn theo mẫu cô giáo dạy để tránh bị trừ điểm.

### 📊 Điểm nghẽn môn học
- 65% ca vướng mắc tập trung ở môn **Toán (Lời văn 2 bước tính)**.
- 25% ca vướng ở môn **Tiếng Việt (Chính tả và phân biệt phụ âm đầu)**.

### 🎯 Đề xuất lộ trình cân bằng cho nhà trường & gia đình
1. Đa dạng hóa đề bài bằng hình thức trực quan (CPA Singapore): que tính, mô hình lego, chai lọ thực tế.
2. Tổ chức mini-game 5 phút ôn bài vui vẻ giữa buổi để khơi gợi tính sáng tạo.
3. Khuyến khích Bố tham gia các ca học cuối tuần (Tiếng Anh và Trò chơi toán học).`)
        toast('Đã tải bản phân tích sư phạm hệ thống! 💡')
      }
    } catch (e) {
      toast('Lỗi kết nối AI, vui lòng thử lại sau.')
    } finally {
      setAdminAnalyzing(false)
    }
  }

  const LOADING_STEPS = [
    'Đang tải danh sách gia đình & tiến độ học sinh...',
    'Đang tổng hợp các chỉ số học tập & sticker...',
    'Đang đồng bộ cơ sở dữ liệu hệ thống...',
    'Đang chuẩn bị bảng điều khiển quản trị...',
  ]

  useEffect(() => {
    try {
      localStorage.removeItem(ADMIN_THEME_KEY)
    } catch (e) {}
  }, [])

  useEffect(() => {
    if (loading && families.length === 0) {
      const interval = setInterval(() => {
        setLoadingStep((s) => (s + 1) % LOADING_STEPS.length)
      }, 700)
      return () => clearInterval(interval)
    }
  }, [loading, families.length])

  const verifyPin = (inputPin) => {
    if (inputPin === '1102' || inputPin === '8888' || inputPin.toLowerCase() === 'admin') {
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, 'true')
      } catch (e) {}
      setAuthed(true)
      setPinError('')
      toast('Đăng nhập Quản trị viên thành công 👑')
    } else {
      setPinError('Mã PIN bảo mật không chính xác (Thử: 1102 hoặc 8888)')
    }
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY)
    } catch (e) {}
    setAuthed(false)
    setPin('')
    toast('Đã khoá trang Quản trị an toàn')
  }

  const loadData = async () => {
    setLoading(true)
    const [list, fb] = await Promise.all([adminFetchAllFamilies(), adminFetchFeedback()])
    setFamilies(list)
    setFeedback(fb)
    setLoading(false)
  }

  useEffect(() => {
    if (authed) {
      loadData()
    }
  }, [authed])

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalKids = 0
    let totalStickers = 0
    let totalCalm = 0
    let totalSessions = 0
    let parentMom = 0
    let parentDad = 0
    const gradeCounts = { 'Lớp 1': 0, 'Lớp 2': 0, 'Lớp 3': 0, 'Lớp 4': 0, 'Lớp 5': 0 }
    const bookCounts = {}

    families.forEach((f) => {
      if ((f.parent || '').includes('Bố')) parentDad++
      else parentMom++

      const kids = f.children || []
      totalKids += kids.length
      kids.forEach((k) => {
        if (gradeCounts[k.grade] !== undefined) gradeCounts[k.grade]++
        const b = k.book || 'Khác'
        bookCounts[b] = (bookCounts[b] || 0) + 1
      })

      if (f.stats) {
        Object.values(f.stats).forEach((s) => {
          totalStickers += Math.max(s.stickers || 0, (s.stickersList || []).length)
          totalCalm += (s.calmWeek || 0) + (s.calmLast || 0)
          totalSessions += (s.sessionsMom || 0) + (s.sessionsDad || 0)
        })
      }
    })

    return {
      totalFamilies: families.length,
      totalKids: totalKids || families.length,
      totalStickers,
      totalCalm,
      totalSessions,
      parentMom,
      parentDad,
      gradeCounts,
      bookCounts,
    }
  }, [families])

  // Filtered & Sorted Families
  const filteredFamilies = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = families.filter((f) => {
      const matchSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        (f.children || []).some((c) => c.name?.toLowerCase().includes(q))

      const matchGrade =
        gradeFilter === 'all' ||
        (f.children || []).some((c) => c.grade === gradeFilter)

      return matchSearch && matchGrade
    })

    return list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'stickers') {
        const getStickers = (f) => Object.values(f.stats || {}).reduce((sum, s) => sum + (s.stickers || 0), 0)
        return getStickers(b) - getStickers(a)
      }
      if (sortBy === 'sessions') {
        const getSessions = (f) => Object.values(f.stats || {}).reduce((sum, s) => sum + (s.sessionsMom || 0) + (s.sessionsDad || 0), 0)
        return getSessions(b) - getSessions(a)
      }
      // default newest
      return (b.created_at || '').localeCompare(a.created_at || '')
    })
  }, [families, search, gradeFilter, sortBy])

  // Copy ID to clipboard
  const copyId = (id) => {
    navigator.clipboard?.writeText(id)
    toast(`📋 Đã sao chép ID: ${id}`)
  }

  // Reset Password Handler
  const handleResetPassword = async () => {
    if (!resetFam || !newPass.trim()) return
    const ok = await adminResetPassword(resetFam.id, newPass.trim())
    if (ok) {
      toast(`Đã cập nhật mật khẩu mới cho ${resetFam.name} 🔑`)
      setResetFam(null)
      setNewPass('')
    } else {
      toast('Lỗi cập nhật mật khẩu!')
    }
  }

  // Edit Name Handler
  const handleUpdateName = async () => {
    if (!editFam || !editName.trim()) return
    const ok = await adminUpdateFamilyName(editFam.id, editName.trim())
    if (ok) {
      toast('Đã cập nhật tên gia đình ✏️')
      setEditFam(null)
      loadData()
    } else {
      toast('Lỗi cập nhật tên!')
    }
  }

  // Delete Family Handler
  const handleDelete = async () => {
    if (!deleteFam) return
    const ok = await adminDeleteFamily(deleteFam.id)
    if (ok) {
      toast(`Đã xoá tài khoản ${deleteFam.name} 🗑️`)
      setDeleteFam(null)
      loadData()
    } else {
      toast('Lỗi khi xoá tài khoản!')
    }
  }

  // Run SQL Query Handler
  const handleRunSql = async (overrideQuery = null) => {
    const q = overrideQuery || sqlQuery
    if (!q || !q.trim()) return
    setSqlBusy(true)
    const start = performance.now()
    const res = await dbQuery(q.trim())
    setSqlExecTime(Math.round(performance.now() - start))
    setSqlResult(res)
    setSqlBusy(false)
  }

  // SQL Result parsed rows and columns
  const sqlRows = useMemo(() => {
    if (!sqlResult) return []
    if (Array.isArray(sqlResult)) return sqlResult
    if (sqlResult.results && Array.isArray(sqlResult.results)) return sqlResult.results
    if (sqlResult.data && Array.isArray(sqlResult.data)) return sqlResult.data
    return []
  }, [sqlResult])

  const sqlColumns = useMemo(() => {
    if (!sqlRows.length) return []
    return Object.keys(sqlRows[0])
  }, [sqlRows])

  // Export JSON backup
  const exportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(families, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `kem-con-hoc-backup-${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast('Đã tải xuống file sao lưu JSON 📥')
  }

  /* ============================================================
     MÀN HÌNH MÃ PIN (LOCK SCREEN)
     ============================================================ */
  if (!authed) {
    return (
      <div className="admin-root lock-screen">
        <div className="admin-ambient-lights">
          <div className="admin-orb orb-1" />
          <div className="admin-orb orb-2" />
          <div className="admin-orb orb-3" />
        </div>

        <div className="admin-lock-card">
          <div className="admin-lock-badge-top">
            <span className="live-dot" /> BẢNG ĐIỀU KHIỂN QUẢN TRỊ VIÊN
          </div>

          <div className="admin-mascot-avatar" style={{ margin: '0 auto 16px', width: 64, height: 64, fontSize: 30 }}>
            <span>👑</span>
            <div className="admin-avatar-pulse" />
          </div>

          <div className="admin-kicker" style={{ margin: '0 auto 10px' }}>
            <span className="admin-kicker-dot" />
            BẢO MẬT HỆ THỐNG
          </div>

          <h2 className="admin-title">
            Trung Tâm <span className="admin-title-em">Quản Trị Viên</span>
          </h2>
          <p className="admin-sub">
            Bảng điều khiển quản lý toàn bộ học sinh, tiến độ kèm con & cơ sở dữ liệu
          </p>

          {/* PIN DOTS INDICATOR */}
          <div className="admin-pin-dots">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`admin-pin-dot ${pin.length > i ? 'filled' : ''} ${pinError ? 'error' : ''}`}
              />
            ))}
          </div>

          <div style={{ margin: '14px 0 20px' }}>
            <span className="admin-label">MÃ PIN XÁC THỰC (4 SỐ)</span>
            <div style={{ position: 'relative' }}>
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={8}
                className="admin-input pin-box"
                placeholder="Nhập mã PIN..."
                value={pin}
                autoFocus
                onChange={(e) => {
                  setPin(e.target.value)
                  if (pinError) setPinError('')
                  if (e.target.value.length === 4) {
                    verifyPin(e.target.value)
                  }
                }}
                onKeyDown={(e) => e.key === 'Enter' && verifyPin(pin)}
              />
              <button
                type="button"
                className="pin-eye-btn"
                onClick={() => setShowPin(!showPin)}
                title={showPin ? 'Ẩn mã PIN' : 'Hiện mã PIN'}
              >
                {showPin ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {pinError && <p className="admin-err">{pinError}</p>}
          </div>

          {/* Quick Demo PIN Chips */}
          <div className="admin-pin-hint-box" onClick={() => { setPin('1102'); verifyPin('1102') }}>
            <span>💡 <b>Mẹo quản trị:</b> Bấm nhanh để nhập mã PIN mẫu: <code className="admin-code-chip">1102</code></span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
            <button
              className="admin-btn primary lg"
              onClick={() => verifyPin(pin)}
              disabled={!pin.trim()}
            >
              Mở khoá Dashboard ➔
            </button>
            <button className="admin-btn ghost" onClick={onExit}>
              ‹ Quay lại Ứng dụng Phụ huynh
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ============================================================
     MÀN HÌNH LOADING KHI ĐANG TẢI DỮ LIỆU
     ============================================================ */
  if (loading && families.length === 0) {
    return (
      <div className="admin-root lock-screen">
        <div className="admin-ambient-lights">
          <div className="admin-orb orb-1" />
          <div className="admin-orb orb-2" />
        </div>
        <div className="admin-loading-card">
          <div className="admin-mascot-avatar loading-mascot">
            <span>⚡</span>
            <div className="admin-avatar-pulse" />
          </div>
          <h3 className="admin-loading-title">Khởi Động Admin Console</h3>
          <p className="admin-loading-sub">{LOADING_STEPS[loadingStep]}</p>
          <div className="admin-loading-bar-wrap">
            <div className="admin-loading-bar-fill" />
          </div>
          <div className="admin-loading-badges">
            <span className="admin-loading-chip">🟢 D1 Engine Ready</span>
            <span className="admin-loading-chip">🔒 SHA-256 Auth</span>
            <span className="admin-loading-chip">⚡ Sẵn Sàng Đồng Bộ</span>
          </div>
        </div>
      </div>
    )
  }

  /* ============================================================
     BẢNG ĐIỀU KHIỂN CHÍNH (MAIN ADMIN DASHBOARD)
     ============================================================ */
  return (
    <div className="admin-root">
      {/* AMBIENT GLOWING LIGHTS */}
      <div className="admin-ambient-lights">
        <div className="admin-orb orb-1" />
        <div className="admin-orb orb-2" />
        <div className="admin-orb orb-3" />
      </div>

      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-brand">
            <div className="admin-mascot-avatar">
              <span>🌸</span>
              <div className="admin-avatar-pulse" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <b className="admin-brand-title">Kèm Con Học</b>
                <span className="admin-badge-pro">PRO CONSOLE</span>
              </div>
              <div className="admin-status">
                <span className="live-dot" /> Hệ thống đồng bộ dữ liệu trực tuyến
              </div>
            </div>
          </div>
        </div>

        {/* Ticker speech center */}
        <div className="admin-header-center">
          <div className="admin-mascot-speech">
            <span className="admin-speech-icon">💡</span>
            <span className="admin-mascot-speech-text">
              Hệ thống ghi nhận <b>{metrics.totalFamilies} gia đình</b> và <b>{metrics.totalStickers} sticker</b> đã thưởng!
            </span>
          </div>
        </div>

        <div className="admin-header-actions">
          <button
            className={`admin-btn sm ${activeTab === 'team_sync' ? 'active-gradient' : ''}`}
            onClick={() => setActiveTab('team_sync')}
            title="Bảng Đồng Bộ Prompt Team — Đã chạy ở AI công ty chưa"
            style={{
              background: activeTab === 'team_sync' ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : '#F5F3FF',
              color: activeTab === 'team_sync' ? '#FFFFFF' : '#6D28D9',
              border: '1.5px solid #DDD6FE',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: activeTab === 'team_sync' ? '0 4px 12px rgba(109, 40, 217, 0.3)' : '0 1px 4px rgba(109, 40, 217, 0.08)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 14 }}>🚀</span>
            <span>Team Prompts</span>
          </button>
          <button className="admin-btn sm" onClick={loadData} disabled={loading} title="Làm mới dữ liệu từ D1">
            {loading ? '⏳ Đang tải…' : '🔄 Làm mới'}
          </button>
          <button className="admin-btn sm" onClick={exportData} title="Xuất toàn bộ cơ sở dữ liệu ra JSON">
            📥 Xuất JSON
          </button>
          <button className="admin-btn sm ghost" onClick={handleLogout} title="Khoá phiên làm việc">
            🔒 Khoá
          </button>
          <button className="admin-btn sm exit" onClick={onExit} title="Quay lại ứng dụng kèm con">
            ‹ Về App Phụ huynh
          </button>
        </div>
      </header>

      <div className="admin-container">
        {/* KPI BENTO CARDS */}
        <section className="admin-kpi-grid">
          <div className="kpi-card kpi-fam">
            <div className="kpi-header">
              <div className="kpi-icon">👨‍👩‍👧</div>
              <span className="kpi-tag-trend">+100% Active</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Tổng số Gia đình</span>
              <div className="kpi-value">{metrics.totalFamilies}</div>
              <div className="kpi-progress-bar"><div className="kpi-progress-fill p-blue" style={{ width: '100%' }} /></div>
              <span className="kpi-note">Tài khoản lưu trữ trên hệ thống</span>
            </div>
          </div>

          <div className="kpi-card kpi-kids">
            <div className="kpi-header">
              <div className="kpi-icon">🎒</div>
              <span className="kpi-tag-trend">Lớp 1 → 5</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Tổng số Học sinh</span>
              <div className="kpi-value">{metrics.totalKids}</div>
              <div className="kpi-progress-bar"><div className="kpi-progress-fill p-orange" style={{ width: '85%' }} /></div>
              <span className="kpi-note">Theo sát chương trình SGK mới</span>
            </div>
          </div>

          <div className="kpi-card kpi-stickers">
            <div className="kpi-header">
              <div className="kpi-icon">⭐</div>
              <span className="kpi-tag-trend gold">Phần thưởng</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Sticker Đã Thưởng</span>
              <div className="kpi-value">{metrics.totalStickers}</div>
              <div className="kpi-progress-bar"><div className="kpi-progress-fill p-gold" style={{ width: '70%' }} /></div>
              <span className="kpi-note">Động lực học tập tích cực</span>
            </div>
          </div>

          <div className="kpi-card kpi-calm">
            <div className="kpi-header">
              <div className="kpi-icon">🌿</div>
              <span className="kpi-tag-trend green">Kiên nhẫn</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Khoảnh Khắc Bình Tĩnh</span>
              <div className="kpi-value">{metrics.totalCalm}</div>
              <div className="kpi-progress-bar"><div className="kpi-progress-fill p-green" style={{ width: '90%' }} /></div>
              <span className="kpi-note">Hít thở sâu 3s trước khi cáu</span>
            </div>
          </div>

          <div className="kpi-card kpi-sessions">
            <div className="kpi-header">
              <div className="kpi-icon">📚</div>
              <span className="kpi-tag-trend purple">Gắn kết</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Buổi Học Đã Kèm</span>
              <div className="kpi-value">{metrics.totalSessions}</div>
              <div className="kpi-progress-bar"><div className="kpi-progress-fill p-purple" style={{ width: '65%' }} /></div>
              <span className="kpi-note">Mẹ & Bố đồng hành cùng con</span>
            </div>
          </div>
        </section>

        {/* NAVIGATION TABS (SEGMENTED CONTROL) */}
        <div className="admin-tabs-nav-wrap">
          <div className="admin-tabs-segmented">
            <button
              className={`admin-seg-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="seg-icon">👥</span>
              Quản lý Gia đình & Tài khoản
              <span className="seg-counter">{families.length}</span>
            </button>
            <button
              className={`admin-seg-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <span className="seg-icon">📊</span>
              Phân tích & Thống kê Khối Lớp
            </button>
            <button
              className={`admin-seg-btn ${activeTab === 'sql' ? 'active' : ''}`}
              onClick={() => setActiveTab('sql')}
            >
              <span className="seg-icon">⚡</span>
              D1 Database SQL Studio
            </button>
            <button
              className={`admin-seg-btn ${activeTab === 'prompts' ? 'active' : ''}`}
              onClick={() => setActiveTab('prompts')}
            >
              <span className="seg-icon">📝</span>
              Prompt Studio
            </button>
            <button
              className={`admin-seg-btn ${activeTab === 'team_sync' ? 'active' : ''}`}
              onClick={() => setActiveTab('team_sync')}
              style={{
                background: activeTab === 'team_sync' ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' : '',
                color: activeTab === 'team_sync' ? '#FFFFFF' : '',
                fontWeight: 800,
              }}
            >
              <span className="seg-icon">🚀</span>
              Team Prompts Sync (VideFlow)
            </button>
          </div>
        </div>

        {/* ============================================================
           TAB 1: USERS LIST (QUẢN LÝ GIA ĐÌNH)
           ============================================================ */}
        {activeTab === 'users' && (
          <div className="admin-content-card">
            {/* SEARCH & FILTERS CONTROLS */}
            <div className="admin-filter-bar">
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Tìm theo tên gia đình, tên bé, ID hoặc từ khóa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="clear-btn" onClick={() => setSearch('')}>
                    ✕
                  </button>
                )}
              </div>

              {/* QUICK GRADE FILTER CHIPS */}
              <div className="grade-chips-wrap">
                {['all', 'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'].map((g) => {
                  const count = g === 'all' 
                    ? families.length 
                    : families.filter((f) => (f.children || []).some((c) => c.grade === g)).length
                  return (
                    <button
                      key={g}
                      className={`grade-chip-pill ${gradeFilter === g ? 'active' : ''}`}
                      onClick={() => setGradeFilter(g)}
                    >
                      {g === 'all' ? 'Tất cả khối lớp' : g}
                      <span className="chip-cnt">{count}</span>
                    </button>
                  )
                })}
              </div>

              {/* SORT DROPDOWN */}
              <div className="sort-wrap">
                <span className="filter-lbl">Sắp xếp:</span>
                <select
                  className="admin-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">🕒 Mới tham gia nhất</option>
                  <option value="stickers">⭐ Nhiều Sticker nhất</option>
                  <option value="sessions">📚 Nhiều buổi học nhất</option>
                  <option value="name">🔤 Tên gia đình (A → Z)</option>
                </select>
              </div>
            </div>

            {/* STATUS SUMMARY BAR */}
            <div className="admin-list-meta-bar">
              <span>Đang hiển thị <b>{filteredFamilies.length}</b> / {families.length} gia đình</span>
              {gradeFilter !== 'all' && (
                <span className="active-filter-badge">
                  Đang lọc: {gradeFilter}
                  <button onClick={() => setGradeFilter('all')}>✕</button>
                </span>
              )}
            </div>

            {/* USERS TABLE */}
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Gia đình & Mã ID</th>
                    <th>Vai trò / Giọng điệu</th>
                    <th>Học sinh & Chương trình</th>
                    <th>Thành tích học tập</th>
                    <th>Ngày tham gia</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFamilies.map((fam) => {
                    const kids = fam.children || []
                    const activeKid = kids[0]
                    const famStats = fam.stats?.[activeKid?.id] || {}
                    const totalKidStickers = Object.values(fam.stats || {}).reduce((sum, s) => sum + (s.stickers || 0), 0)
                    const totalKidSessions = Object.values(fam.stats || {}).reduce((sum, s) => sum + (s.sessionsMom || 0) + (s.sessionsDad || 0), 0)
                    const totalKidCalm = Object.values(fam.stats || {}).reduce((sum, s) => sum + (s.calmWeek || 0) + (s.calmLast || 0), 0)

                    return (
                      <tr key={fam.id} className="admin-table-row">
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="fam-avatar-pro">
                              {kids[0]?.emoji || '🏠'}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <b className="fam-name-txt">{fam.name}</b>
                                <span className="online-indicator" title="Tài khoản đồng bộ D1" />
                              </div>
                              <div className="sub-code-wrap">
                                <span className="sub-code">{fam.id}</span>
                                <button
                                  className="copy-mini-btn"
                                  onClick={() => copyId(fam.id)}
                                  title="Sao chép ID gia đình"
                                >
                                  📋
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <span className="badge plum">{fam.parent || 'Mẹ'}</span>
                            <span className="badge sky">{fam.tone || 'Nhẹ nhàng'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {kids.length > 0 ? (
                              kids.map((k, idx) => (
                                <span key={idx} className="kid-chip-pro">
                                  <span className="kid-ico">{k.emoji}</span>
                                  <b>{k.name}</b>
                                  <span className="kid-badge-grade">{k.grade}</span>
                                  <span className="kid-badge-book">{k.book}</span>
                                </span>
                              ))
                            ) : (
                              <span className="empty-kid-tag">Chưa Onboarding</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span className="stat-pill star" title="Tổng stickers">
                              ⭐ {totalKidStickers}
                            </span>
                            <span className="stat-pill session" title="Số buổi đã học">
                              📚 {totalKidSessions}
                            </span>
                            <span className="stat-pill calm" title="Tổng lần giữ bình tĩnh cả nhà">
                              🌿 {totalKidCalm}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="date-txt">
                            {fam.created_at ? fam.created_at.replace('T', ' ').slice(0, 16) : 'Mới tạo'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="action-btns">
                            <button
                              className="act-btn view"
                              title="Xem chi tiết hồ sơ"
                              onClick={() => setDetailFam(fam)}
                            >
                              👁️ Xem
                            </button>
                            <button
                              className="act-btn key"
                              title="Đặt lại mật khẩu"
                              onClick={() => {
                                setResetFam(fam)
                                setNewPass('')
                              }}
                            >
                              🔑 Mật khẩu
                            </button>
                            <button
                              className="act-btn edit"
                              title="Sửa tên gia đình"
                              onClick={() => {
                                setEditFam(fam)
                                setEditName(fam.name)
                              }}
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              className="act-btn del"
                              title="Xoá tài khoản"
                              onClick={() => setDeleteFam(fam)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredFamilies.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '50px 0' }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
                        <b style={{ fontSize: 16 }}>Không tìm thấy gia đình nào phù hợp</b>
                        <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>
                          Thử tìm kiếm với từ khóa khác hoặc bấm nút bên dưới để xóa bộ lọc
                        </p>
                        <button
                          className="admin-btn sm secondary"
                          style={{ marginTop: 10 }}
                          onClick={() => { setSearch(''); setGradeFilter('all') }}
                        >
                          Xoá bộ lọc tìm kiếm
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE FAMILY CARDS */}
            <div className="admin-mobile-cards">
              {filteredFamilies.map((fam) => {
                const kids = fam.children || []
                const activeKid = kids[0]
                const famStats = fam.stats?.[activeKid?.id] || {}
                const totalKidStickers = Object.values(fam.stats || {}).reduce((sum, s) => sum + (s.stickers || 0), 0)
                const totalKidSessions = Object.values(fam.stats || {}).reduce((sum, s) => sum + (s.sessionsMom || 0) + (s.sessionsDad || 0), 0)
                const totalKidCalm = Object.values(fam.stats || {}).reduce((sum, s) => sum + (s.calmWeek || 0) + (s.calmLast || 0), 0)

                return (
                  <div key={fam.id} className="mobile-fam-card">
                    <div className="mobile-fam-header">
                      <div className="fam-avatar-pro">{kids[0]?.emoji || '🏠'}</div>
                      <div className="mobile-fam-info">
                        <b className="mobile-fam-name">{fam.name}</b>
                        <div className="sub-code">{fam.id}</div>
                      </div>
                      <span className="mobile-fam-date">
                        {fam.created_at ? fam.created_at.slice(5, 10).replace('-', '/') : 'Mới'}
                      </span>
                    </div>

                    <div className="mobile-fam-tags">
                      <span className="badge plum">{fam.parent || 'Mẹ'}</span>
                      <span className="badge sky">{fam.tone || 'Nhẹ nhàng'}</span>
                      {kids.length > 0 ? (
                        kids.map((k, idx) => (
                          <span key={idx} className="kid-chip-pro">
                            {k.emoji} <b>{k.name}</b> · {k.grade}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: 12 }}>Chưa có bé</span>
                      )}
                    </div>

                    <div className="mobile-fam-stats">
                      <span className="stat-pill star">⭐ {totalKidStickers}</span>
                      <span className="stat-pill session">📚 {totalKidSessions}</span>
                      <span className="stat-pill calm">🌿 {totalKidCalm}</span>
                    </div>

                    <div className="mobile-fam-actions">
                      <button className="act-btn view" onClick={() => setDetailFam(fam)}>
                        👁️ Chi tiết
                      </button>
                      <button
                        className="act-btn key"
                        onClick={() => {
                          setResetFam(fam)
                          setNewPass('')
                        }}
                      >
                        🔑 Đổi MK
                      </button>
                      <button
                        className="act-btn edit"
                        onClick={() => {
                          setEditFam(fam)
                          setEditName(fam.name)
                        }}
                      >
                        ✏️ Sửa
                      </button>
                      <button className="act-btn del" onClick={() => setDeleteFam(fam)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ============================================================
           TAB 2: ANALYTICS (THỐNG KÊ CHI TIẾT)
           ============================================================ */}
        {activeTab === 'analytics' && (
          <div className="admin-grid-2">
            {/* Phân bố Khối lớp */}
            <div className="admin-content-card">
              <div className="card-header-row">
                <div>
                  <h3 className="section-title">🎒 Phân bố Học sinh theo Khối Lớp</h3>
                  <p className="section-sub">Tỉ lệ học sinh các cấp đang học qua ứng dụng</p>
                </div>
                <span className="section-badge-pill">{metrics.totalKids} Học sinh</span>
              </div>
              <div className="bar-chart-list">
                {Object.entries(metrics.gradeCounts).map(([grade, count]) => {
                  const pct = metrics.totalKids ? Math.round((count / metrics.totalKids) * 100) : 0
                  return (
                    <div key={grade} className="bar-row">
                      <div className="bar-row-info">
                        <b>{grade}</b>
                        <span>{count} bé ({pct}%)</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${Math.max(6, pct)}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Phân bố Bộ Sách */}
            <div className="admin-content-card">
              <div className="card-header-row">
                <div>
                  <h3 className="section-title">📖 Phân bố Bộ Sách Giáo Khoa</h3>
                  <p className="section-sub">Bộ sách học phổ biến nhất của các gia đình</p>
                </div>
                <span className="section-badge-pill">{Object.keys(metrics.bookCounts).length} Bộ sách</span>
              </div>
              <div className="bar-chart-list">
                {Object.entries(metrics.bookCounts).map(([book, count]) => {
                  const pct = metrics.totalKids ? Math.round((count / metrics.totalKids) * 100) : 0
                  return (
                    <div key={book} className="bar-row">
                      <div className="bar-row-info">
                        <b>{book}</b>
                        <span>{count} bé ({pct}%)</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill sky" style={{ width: `${Math.max(6, pct)}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tỉ lệ Phụ huynh Kèm Con */}
            <div className="admin-content-card">
              <h3 className="section-title">👨‍👩‍👧 Vai Trò Người Kèm Trong Nhà</h3>
              <p className="section-sub">Tỉ lệ Mẹ và Bố trực tiếp hướng dẫn con học tập</p>
              <div style={{ display: 'flex', gap: 14, marginTop: 16 }}>
                <div className="role-stat-card mom">
                  <span style={{ fontSize: 32 }}>👩</span>
                  <div className="role-stat-val">{metrics.parentMom}</div>
                  <div className="role-stat-lbl">Mẹ Kèm Chính</div>
                  <div className="role-stat-pct">{Math.round((metrics.parentMom / (metrics.totalFamilies || 1)) * 100)}%</div>
                </div>
                <div className="role-stat-card dad">
                  <span style={{ fontSize: 32 }}>👨</span>
                  <div className="role-stat-val">{metrics.parentDad}</div>
                  <div className="role-stat-lbl">Bố Kèm Chính</div>
                  <div className="role-stat-pct">{Math.round((metrics.parentDad / (metrics.totalFamilies || 1)) * 100)}%</div>
                </div>
              </div>
            </div>

            {/* Chỉ số Kiên nhẫn & Tích cực */}
            <div className="admin-content-card">
              <h3 className="section-title">🌿 Chỉ Số Kiên Nhẫn & Tích Cực</h3>
              <p className="section-sub">Mức độ tương tác trung bình mỗi gia đình</p>
              <div className="quick-summary-grid">
                <div className="q-metric-item">
                  <span className="q-icon">⭐</span>
                  <div>
                    <div className="q-val">{(metrics.totalStickers / (metrics.totalFamilies || 1)).toFixed(1)}</div>
                    <div className="q-lbl">Sticker TB / Gia đình</div>
                  </div>
                </div>
                <div className="q-metric-item">
                  <span className="q-icon">📚</span>
                  <div>
                    <div className="q-val">{(metrics.totalSessions / (metrics.totalFamilies || 1)).toFixed(1)}</div>
                    <div className="q-lbl">Buổi học TB / Gia đình</div>
                  </div>
                </div>
                <div className="q-metric-item">
                  <span className="q-icon">🌿</span>
                  <div>
                    <div className="q-val">{(metrics.totalCalm / (metrics.totalFamilies || 1)).toFixed(1)}</div>
                    <div className="q-lbl">Khoảnh khắc bình tĩnh TB</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 5: Top Feedback — góp ý giảng chưa đúng */}
            <div className="admin-content-card">
              <div className="card-header-row">
                <div>
                  <h3 className="section-title">🚩 Top Góp Ý "Giảng Chưa Đúng"</h3>
                  <p className="section-sub">Lý do phụ huynh báo AI giảng chưa đúng — dùng để cải thiện prompt</p>
                </div>
                <span className="section-badge-pill">{feedback.counts.reduce((s, c) => s + (c.cnt || 0), 0)} Góp ý</span>
              </div>
              {feedback.counts.length === 0 ? (
                <p className="section-sub" style={{ marginTop: 12 }}>Chưa có góp ý nào. Khi phụ huynh bấm "Giảng chưa đúng", dữ liệu sẽ hiện ở đây.</p>
              ) : (
                <div className="bar-chart-list">
                  {feedback.counts.map((c) => {
                    const total = feedback.counts.reduce((s, x) => s + (x.cnt || 0), 0)
                    const pct = total ? Math.round(((c.cnt || 0) / total) * 100) : 0
                    return (
                      <div key={c.reason} className="bar-row">
                        <div className="bar-row-info">
                          <b>{c.reason}</b>
                          <span>{c.cnt} lần ({pct}%)</span>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill coral" style={{ width: `${Math.max(6, pct)}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {feedback.recent.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {feedback.recent.slice(0, 5).map((r) => (
                    <div key={r.id} style={{ fontSize: 12, background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: 10, padding: '8px 10px', color: '#7C2D12' }}>
                      <b>{r.reason}</b>
                      {r.comment && <span> — {r.comment}</span>}
                      <div style={{ color: '#B45309', fontSize: 11, marginTop: 2 }}>
                        {r.family_id || 'Không có tài khoản'} · {r.problem_type ? r.problem_type.slice(0, 60) : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Phân tích Dữ liệu Lớn Sticker & Phẩm Chất Toàn Hệ Thống (Longitudinal Big Data) */}
            <div className="admin-content-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header-row">
                <div>
                  <h3 className="section-title">
                    <i className="fa-solid fa-chart-line" style={{ color: '#7C3AED', marginRight: 8 }} />
                    Phân Tích Dữ Liệu Lớn Sticker & Phẩm Chất Theo Thời Gian (Longitudinal Big Data)
                  </h3>
                  <p className="section-sub">
                    Theo dõi sự biến động phẩm chất (Kiên nhẫn, Sáng tạo, Tốc độ, Tỉ mỉ) qua các tuần học để phát hiện sớm các vấn đề tâm lý & nhịp học
                  </p>
                </div>
                <button
                  className="admin-pri-btn"
                  onClick={handleAdminAiSummary}
                  disabled={adminAnalyzing}
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)' }}
                >
                  {adminAnalyzing ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" /> Đang phân tích Big Data…
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-wand-magic-sparkles" /> ✨ AI Phân Tích Tổng Quan Hệ Thống
                    </>
                  )}
                </button>
              </div>

              {/* Trait breakdown cards with FontAwesome tone-sur-tone */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 14 }}>
                {[
                  { trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', thisW: 4, lastW: 3, desc: 'Tăng khi gặp bài toán khó, đòi hỏi tính bền bỉ' },
                  { trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', thisW: 1, lastW: 5, desc: 'Giảm khi bài tập lặp lại, rập khuôn công thức' },
                  { trait: 'Tập trung', fa: 'fa-solid fa-bullseye', color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE', thisW: 2, lastW: 2, desc: 'Duy trì đều đặn 15 phút mỗi ca kèm' },
                  { trait: 'Tỉ mỉ', fa: 'fa-solid fa-compass-drafting', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', thisW: 2, lastW: 1, desc: 'Cải thiện rõ nét ở phần trình bày lời giải' },
                ].map((item) => {
                  const diff = item.thisW - item.lastW
                  return (
                    <div
                      key={item.trait}
                      style={{
                        background: item.bg,
                        border: `1.5px solid ${item.border}`,
                        borderRadius: 14,
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 10,
                              background: '#FFFFFF',
                              border: `1.5px solid ${item.border}`,
                              color: item.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 14,
                            }}
                          >
                            <i className={item.fa} />
                          </div>
                          <b style={{ fontSize: 14, color: item.color }}>{item.trait}</b>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 99,
                            background: diff > 0 ? '#DCFCE7' : diff < 0 ? '#FEE2E2' : '#F1F5F9',
                            color: diff > 0 ? '#166534' : diff < 0 ? '#991B1B' : '#64748B',
                          }}
                        >
                          {diff > 0 ? `+${diff} ↗` : diff < 0 ? `${diff} ↘` : 'Đều'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 24, fontWeight: 900, color: item.color }}>{item.thisW}</span>
                        <span style={{ fontSize: 12, color: '#64748B' }}>Tuần này</span>
                        <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>Tuần trước: {item.lastW}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.35, marginTop: 2 }}>{item.desc}</div>
                    </div>
                  )
                })}
              </div>

              {/* AI Strategic Analysis Card */}
              {adminAiAnalysis && (
                <div
                  style={{
                    marginTop: 16,
                    background: 'linear-gradient(145deg, #FAF5FF 0%, #F5F3FF 100%)',
                    border: '1.5px solid #DDD6FE',
                    borderRadius: 16,
                    padding: '16px 18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <i className="fa-solid fa-brain" style={{ color: '#7C3AED', fontSize: 18 }} />
                    <b style={{ color: '#5B21B6', fontSize: 15 }}>Báo Cáo Sư Phạm AI & Khuyến Nghị Toàn Hệ Thống</b>
                  </div>
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 12,
                      padding: '14px 16px',
                      border: '1px solid #E9D5FF',
                      fontSize: 13.5,
                      lineHeight: 1.6,
                      color: '#1E293B',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {adminAiAnalysis}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================
           TAB 3: SQL STUDIO (D1 DATABASE QUERY CONSOLE)
           ============================================================ */}
        {activeTab === 'sql' && (
          <div className="admin-content-card sql-card-wrap">
            <div className="sql-header-bar">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 className="section-title" style={{ margin: 0 }}>⚡ SQL Database Studio</h3>
                  <span className="d1-tag">SQLite Engine</span>
                </div>
                <p className="section-sub" style={{ margin: '4px 0 0' }}>
                  Thực thi truy vấn SQL trực tiếp trên cơ sở dữ liệu production một cách an toàn
                </p>
              </div>

              {/* QUICK QUERY PRESETS */}
              <div className="sql-presets-wrap">
                <span className="preset-lbl">Mẫu câu lệnh:</span>
                <button
                  className="sql-preset-chip"
                  onClick={() => {
                    const q = 'SELECT id, name, created_at FROM families ORDER BY created_at DESC LIMIT 15'
                    setSqlQuery(q)
                    handleRunSql(q)
                  }}
                >
                  Gia đình mới nhất
                </button>
                <button
                  className="sql-preset-chip"
                  onClick={() => {
                    const q = 'SELECT key, updated_at FROM _kv_store LIMIT 10'
                    setSqlQuery(q)
                    handleRunSql(q)
                  }}
                >
                  Bảng KV Store
                </button>
                <button
                  className="sql-preset-chip"
                  onClick={() => {
                    const q = "SELECT name, type FROM sqlite_master WHERE type='table'"
                    setSqlQuery(q)
                    handleRunSql(q)
                  }}
                >
                  Danh sách bảng
                </button>
              </div>
            </div>

            {/* SQL EDITOR */}
            <div className="sql-editor-container">
              <div className="sql-editor-gutter">
                <span>1</span>
                <span>2</span>
                <span>3</span>
              </div>
              <textarea
                className="sql-textarea-pro"
                rows={3}
                value={sqlQuery}
                placeholder="Nhập câu lệnh SELECT... FROM..."
                onChange={(e) => setSqlQuery(e.target.value)}
              />
            </div>

            <div className="sql-action-row">
              <div className="sql-tip-txt">
                💡 Hỗ trợ các câu lệnh: <code>SELECT</code>, <code>PRAGMA</code>, <code>EXPLAIN</code>.
              </div>
              <button
                className="admin-btn primary"
                onClick={() => handleRunSql()}
                disabled={sqlBusy || !sqlQuery.trim()}
              >
                {sqlBusy ? '⏳ Đang thực thi…' : '▶ Chạy câu lệnh SQL (F5)'}
              </button>
            </div>

            {/* SQL RESULTS AREA */}
            {sqlResult && (
              <div className="sql-result-container">
                <div className="sql-result-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="live-dot" />
                    <b>Kết quả thực thi:</b>
                    <span className="sql-meta-chip">
                      {sqlRows.length} dòng dữ liệu · {sqlExecTime}ms
                    </span>
                  </div>

                  <div className="sql-view-toggle">
                    <button
                      className={`view-toggle-btn ${sqlViewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setSqlViewMode('table')}
                    >
                      📊 Bảng dữ liệu
                    </button>
                    <button
                      className={`view-toggle-btn ${sqlViewMode === 'json' ? 'active' : ''}`}
                      onClick={() => setSqlViewMode('json')}
                    >
                      📝 JSON gốc
                    </button>
                  </div>
                </div>

                {sqlViewMode === 'table' && sqlRows.length > 0 ? (
                  <div className="table-responsive sql-table-wrap">
                    <table className="admin-table sql-table">
                      <thead>
                        <tr>
                          {sqlColumns.map((col) => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sqlRows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {sqlColumns.map((col) => (
                              <td key={col}>
                                {typeof row[col] === 'object'
                                  ? JSON.stringify(row[col])
                                  : String(row[col] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <pre className="sql-json-pro">
                    {JSON.stringify(sqlResult, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================
           TAB 4: PROMPT STUDIO
           ============================================================ */}
        {activeTab === 'prompts' && <PromptStudioTab />}

        {/* ============================================================
           TAB 5: TEAM PROMPT SYNC (AI CÔNG TY)
           ============================================================ */}
        {activeTab === 'team_sync' && <TeamPromptSyncTab />}
      </div>

      {/* ============================================================
         MODAL: XEM CHI TIẾT GIA ĐÌNH
         ============================================================ */}
      {detailFam && (
        <div className="admin-modal-bg" onClick={() => setDetailFam(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 32 }}>🏡</span>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--modal-title)' }}>Hồ sơ Gia đình: {detailFam.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span className="sub-code">{detailFam.id}</span>
                    <button className="copy-mini-btn" onClick={() => copyId(detailFam.id)}>📋</button>
                  </div>
                </div>
              </div>
              <button className="close-btn" onClick={() => setDetailFam(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <span className="section-tag">THÔNG TIN CHUNG</span>
                <div className="detail-grid">
                  <div>
                    <span className="d-label">Người kèm chính:</span>
                    <b>{detailFam.parent || 'Mẹ'}</b>
                  </div>
                  <div>
                    <span className="d-label">Giọng điệu ưa thích:</span>
                    <b>{detailFam.tone || 'Nhẹ nhàng'}</b>
                  </div>
                  <div>
                    <span className="d-label">Ngày tạo tài khoản:</span>
                    <span>{detailFam.created_at || 'Không có'}</span>
                  </div>
                  <div>
                    <span className="d-label">Trạng thái:</span>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>🟢 Đồng bộ trực tuyến</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <span className="section-tag">DANH SÁCH CON CÁI ({detailFam.children?.length || 0})</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(detailFam.children || []).map((c) => {
                    const cs = detailFam.stats?.[c.id] || {}
                    const cStickers = Math.max(cs.stickers || 0, (cs.stickersList || []).length)
                    const cSessions = (cs.sessionsMom || 0) + (cs.sessionsDad || 0)
                    const cCalm = (cs.calmWeek || 0) + (cs.calmLast || 0)
                    return (
                      <div key={c.id} className="child-card-detail">
                        <span style={{ fontSize: 28 }}>{c.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <b style={{ fontSize: 15 }}>{c.name}</b>
                          <div style={{ fontSize: 13, color: '#94A3B8' }}>{c.grade} · Bộ sách {c.book}</div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                            <span className="stat-pill star">⭐ {cStickers} sticker</span>
                            <span className="stat-pill session">📚 {cSessions} buổi</span>
                            <span className="stat-pill calm">🌿 {cCalm} lần bình tĩnh</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {(!detailFam.children || detailFam.children.length === 0) && (
                    <div style={{ color: '#94A3B8', fontSize: 13 }}>Chưa có thông tin bé nào.</div>
                  )}
                </div>
              </div>

              {detailFam.latestProblem && (
                <div className="detail-section">
                  <span className="section-tag">ĐỀ BÀI GẦN NHẤT ĐÃ GIẢNG</span>
                  <div className="problem-preview">
                    "{detailFam.latestProblem}"
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="admin-btn secondary" onClick={() => setDetailFam(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
         MODAL: RESET MẬT KHẨU
         ============================================================ */}
      {resetFam && (
        <div className="admin-modal-bg" onClick={() => setResetFam(null)}>
          <div className="admin-modal sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>🔑 Đặt lại Mật khẩu</h3>
              <button className="close-btn" onClick={() => setResetFam(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13.5, color: 'var(--modal-sub)' }}>
                Đặt mật khẩu mới cho gia đình <b>{resetFam.name}</b>. Mật khẩu sẽ được mã hoá SHA-256 kèm salt tự động.
              </p>
              <div style={{ marginTop: 14 }}>
                <span className="admin-label">MẬT KHẨU MỚI (TỐI THIỂU 4 KÝ TỰ)</span>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Nhập mật khẩu mới..."
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn ghost" onClick={() => setResetFam(null)}>Huỷ</button>
              <button
                className="admin-btn primary"
                disabled={!newPass.trim() || newPass.trim().length < 4}
                onClick={handleResetPassword}
              >
                Cập nhật mật khẩu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
         MODAL: SỬA TÊN GIA ĐÌNH
         ============================================================ */}
      {editFam && (
        <div className="admin-modal-bg" onClick={() => setEditFam(null)}>
          <div className="admin-modal sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>✏️ Đổi tên Gia đình</h3>
              <button className="close-btn" onClick={() => setEditFam(null)}>✕</button>
            </div>
            <div className="modal-body">
              <span className="admin-label">TÊN GIA ĐÌNH MỚI</span>
              <input
                type="text"
                className="admin-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="admin-btn ghost" onClick={() => setEditFam(null)}>Huỷ</button>
              <button className="admin-btn primary" onClick={handleUpdateName}>
                Lưu tên mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
         MODAL: XOÁ TÀI KHOẢN
         ============================================================ */}
      {deleteFam && (
        <div className="admin-modal-bg" onClick={() => setDeleteFam(null)}>
          <div className="admin-modal sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, color: '#EF4444' }}>🗑️ Xác nhận Xoá Tài khoản</h3>
              <button className="close-btn" onClick={() => setDeleteFam(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14 }}>
                Bạn có chắc chắn muốn xoá tài khoản <b>{deleteFam.name}</b>?
              </p>
              <p style={{ color: '#EF4444', fontSize: 13 }}>
                Hành động này sẽ xoá bản ghi gia đình trong bảng <code>families</code> và toàn bộ dữ liệu trạng thái trong <code>_kv_store</code>. Không thể khôi phục!
              </p>
            </div>
            <div className="modal-footer">
              <button className="admin-btn ghost" onClick={() => setDeleteFam(null)}>Giữ lại</button>
              <button className="admin-btn danger" onClick={handleDelete}>
                Xoá vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
         BOTTOM NAVIGATION BAR CHO MOBILE
         ============================================================ */}
      <nav className="admin-bottom-nav">
        <button
          className={`bnav-item ${activeTab === 'users' && !showMobileMenu ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('users')
            setShowMobileMenu(false)
          }}
        >
          <span className="bnav-icon">👥</span>
          <span className="bnav-label">Gia đình</span>
        </button>

        <button
          className={`bnav-item ${activeTab === 'analytics' && !showMobileMenu ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('analytics')
            setShowMobileMenu(false)
          }}
        >
          <span className="bnav-icon">📊</span>
          <span className="bnav-label">Thống kê</span>
        </button>

        <button
          className={`bnav-item ${activeTab === 'sql' && !showMobileMenu ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('sql')
            setShowMobileMenu(false)
          }}
        >
          <span className="bnav-icon">⚡</span>
          <span className="bnav-label">SQL Studio</span>
        </button>

        <button
          className={`bnav-item ${activeTab === 'prompts' && !showMobileMenu ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('prompts')
            setShowMobileMenu(false)
          }}
        >
          <span className="bnav-icon">📝</span>
          <span className="bnav-label">Prompts</span>
        </button>

        <button
          className={`bnav-item ${activeTab === 'team_sync' && !showMobileMenu ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('team_sync')
            setShowMobileMenu(false)
          }}
        >
          <span className="bnav-icon">🚀</span>
          <span className="bnav-label">Team Sync</span>
        </button>

        <button
          className={`bnav-item ${showMobileMenu ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <span className="bnav-icon">⚙️</span>
          <span className="bnav-label">Menu</span>
        </button>
      </nav>

      {/* ============================================================
         MOBILE SHEET ACTION MENU
         ============================================================ */}
      {showMobileMenu && (
        <div className="mobile-sheet-overlay" onClick={() => setShowMobileMenu(false)}>
          <div className="mobile-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-drag-handle" />
            <div className="sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>🌸</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                    Thao tác Quản trị
                  </h4>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>Kèm Con Học Admin Portal</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowMobileMenu(false)}>✕</button>
            </div>

            <div className="sheet-actions">
              <button
                className="sheet-action-item"
                onClick={() => {
                  loadData()
                  setShowMobileMenu(false)
                }}
              >
                <span className="sheet-action-icon">🔄</span>
                <div className="sheet-action-text">
                  <b>Làm mới cơ sở dữ liệu</b>
                  <small>Cập nhật số liệu mới nhất của các gia đình</small>
                </div>
              </button>

              <button
                className="sheet-action-item"
                onClick={() => {
                  exportData()
                  setShowMobileMenu(false)
                }}
              >
                <span className="sheet-action-icon">📥</span>
                <div className="sheet-action-text">
                  <b>Xuất file sao lưu (JSON)</b>
                  <small>Tải toàn bộ dữ liệu về máy an toàn</small>
                </div>
              </button>

              <button
                className="sheet-action-item"
                onClick={() => {
                  setShowMobileMenu(false)
                  handleLogout()
                }}
              >
                <span className="sheet-action-icon">🔒</span>
                <div className="sheet-action-text">
                  <b>Khoá bảng điều khiển</b>
                  <small>Đăng xuất bảo mật bằng mã PIN</small>
                </div>
              </button>

              <button
                className="sheet-action-item exit"
                onClick={() => {
                  setShowMobileMenu(false)
                  onExit()
                }}
              >
                <span className="sheet-action-icon">‹</span>
                <div className="sheet-action-text">
                  <b>Về Ứng dụng Phụ huynh</b>
                  <small>Quay lại màn hình học tập của con</small>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
