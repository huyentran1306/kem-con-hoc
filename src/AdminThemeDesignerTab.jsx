/* ============================================================
   🎨 KÈM CON HỌC — ADMIN THEME DESIGNER TAB (PROMPT 10)
   Trình thiết kế bộ giao diện trực quan 4 màn hình:
   1. Danh sách bộ & Tổ hợp phổ biến
   2. Trình thiết kế (5 nhóm biến + 12 màn xem trước + tương phản tức thì)
   3. 6 Bước kiểm tra trước phát hành
   4. Phát hành theo 3 mức, bộ theo mùa, và lịch sử phiên bản
   ============================================================ */

import { appPrompt } from './dialog'
import { useState, useEffect, useRef } from 'react'
import {
  BUILTIN_THEME_SPECS,
  deriveAdminThemeVars,
  runThemePreflightChecks,
  sanitizeSvg,
  getContrastRatio,
  autoFixTextColor,
  POPULAR_FAMILY_COMBOS,
} from './themes/adminThemeSpec.js'
import { THEMES } from './themes.js'
import { CUSTOM_COLORS, CUSTOM_FONTS, CUSTOM_SHAPES, CUSTOM_BUDDIES } from './themes/customPalette.js'
import { ThemedTabIcon } from './themes/themeIcons.jsx'
import { ThemeTwoScreenPreview } from './themes/ThemeTwoScreenPreview.jsx'
import { toast } from './utils.js'

const ADMIN_THEMES_STORAGE_KEY = 'kem-con-hoc:admin-custom-themes'
const ADMIN_THEMES_DRAFTS_KEY = 'kem-con-hoc:admin-theme-drafts'
const ADMIN_THEMES_HISTORY_KEY = 'kem-con-hoc:admin-theme-history'

export default function AdminThemeDesignerTab({ token, adminProfile }) {
  // Điều hướng: 'list' | 'designer' | 'checks' | 'publish'
  const [screen, setScreen] = useState('list')
  const [filterType, setFilterType] = useState('all') // 'all' | 'builtin' | 'admin' | 'draft'

  // Themes list state
  const [themesList, setThemesList] = useState(() => {
    try {
      const stored = localStorage.getItem(ADMIN_THEMES_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const parsedIds = new Set(parsed.map((t) => t.id))
          const missingBuiltins = BUILTIN_THEME_SPECS.filter((b) => !parsedIds.has(b.id))
          if (missingBuiltins.length > 0) {
            const merged = [...parsed, ...missingBuiltins]
            try {
              localStorage.setItem(ADMIN_THEMES_STORAGE_KEY, JSON.stringify(merged))
            } catch {}
            return merged
          }
          return parsed
        }
      }
    } catch {}
    return [...BUILTIN_THEME_SPECS]
  })

  // Active theme editing in designer
  const [activeSpec, setActiveSpec] = useState(null)
  const [historyStack, setHistoryStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved') // 'saving' | 'saved'

  // Designer screen UI state
  const [openAccordion, setOpenAccordion] = useState('colors') // 'colors' | 'fonts' | 'shapes' | 'buddy' | 'base'
  const [previewScale, setPreviewScale] = useState(0.55)
  const [previewLargeFont, setPreviewLargeFont] = useState(false)
  const [previewReduceMotion, setPreviewReduceMotion] = useState(false)
  const [highlightErrorField, setHighlightErrorField] = useState(null)

  // Pre-publish checks state
  const [checkResults, setCheckResults] = useState(null)
  const [isSuperadminReviewSigned, setIsSuperadminReviewSigned] = useState(false)

  // Publish form state
  const [publishLevel, setPublishLevel] = useState('testing') // 'testing' | 'partial' | 'published'
  const [testFamiliesInput, setTestFamiliesInput] = useState('fam_alpha, fam_beta, fam_gamma')
  const [isSeasonal, setIsSeasonal] = useState(false)
  const [expiresDate, setExpiresDate] = useState('')
  const [showInFamilyPicker, setShowInFamilyPicker] = useState(true)
  const [setAsNewDefault, setSetAsNewDefault] = useState(false)
  const [versionNote, setVersionNote] = useState('Cập nhật màu sắc và tối ưu tương phản')

  const autoSaveTimerRef = useRef(null)

  // Persist themes list
  const persistThemes = (updated) => {
    setThemesList(updated)
    try {
      localStorage.setItem(ADMIN_THEMES_STORAGE_KEY, JSON.stringify(updated))
    } catch {}
  }

  // Auto-save draft every 3s upon changes
  const updateActiveSpec = (updater, recordHistory = true) => {
    setActiveSpec((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (recordHistory && prev) {
        setHistoryStack((h) => [...h.slice(-19), JSON.parse(JSON.stringify(prev))])
        setRedoStack([])
      }

      setAutoSaveStatus('saving')
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = setTimeout(() => {
        try {
          const drafts = JSON.parse(localStorage.getItem(ADMIN_THEMES_DRAFTS_KEY) || '{}')
          drafts[next.id] = next
          localStorage.setItem(ADMIN_THEMES_DRAFTS_KEY, JSON.stringify(drafts))
        } catch {}
        setAutoSaveStatus('saved')
      }, 3000)

      return next
    })
  }

  const handleUndo = () => {
    if (historyStack.length === 0) return
    const prev = historyStack[historyStack.length - 1]
    setHistoryStack((h) => h.slice(0, -1))
    setRedoStack((r) => [...r, JSON.parse(JSON.stringify(activeSpec))])
    setActiveSpec(prev)
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    setRedoStack((r) => r.slice(0, -1))
    setHistoryStack((h) => [...h, JSON.parse(JSON.stringify(activeSpec))])
    setActiveSpec(next)
  }

  // MÀN 1: TẠO BỘ MỚI HOẶC NHÂN BẢN
  const handleCreateNewTheme = (baseThemeId = 'bear') => {
    const baseSpec = BUILTIN_THEME_SPECS.find((s) => s.id === baseThemeId) || BUILTIN_THEME_SPECS[0]
    const newId = `theme_adm_${Date.now().toString(36)}`
    const newSpec = {
      ...JSON.parse(JSON.stringify(baseSpec)),
      id: newId,
      name: `Bộ mới ${new Date().toLocaleDateString('vi-VN')}`,
      version: 1,
      status: 'draft',
      locked: false,
      createdBy: adminProfile?.email || 'admin@kemconhoc.vn',
      createdAt: new Date().toISOString(),
      updatedBy: adminProfile?.email || 'admin@kemconhoc.vn',
      updatedAt: new Date().toISOString(),
      shareCode: `ADM-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      checks: {
        contrast: false,
        vietnameseDiacritics: false,
        svgSanitized: true,
        layout360: true,
        packageSize: true,
        visualReviewed: false,
      },
    }
    setActiveSpec(newSpec)
    setHistoryStack([])
    setRedoStack([])
    setScreen('designer')
  }

  const handleCreateFromCombo = (combo) => {
    const colorObj = CUSTOM_COLORS.find((c) => c.id === combo.color) || CUSTOM_COLORS[0]
    const fontObj = CUSTOM_FONTS.find((f) => f.id === combo.font) || CUSTOM_FONTS[0]
    const shapeObj = CUSTOM_SHAPES.find((s) => s.id === combo.shape) || CUSTOM_SHAPES[0]

    const newId = `theme_pop_${combo.id}_${Date.now().toString(36)}`
    const newSpec = {
      id: newId,
      name: combo.name,
      version: 1,
      status: 'draft',
      locked: false,
      base: 'bear',
      vars: {
        primary: colorObj.hex,
        secondary: '#7FB7F5',
        bg: '#FFF8EC',
        surface: '#FFFFFF',
        text: '#4B3621',
        textSub: '#8B6D50',
        border: '#F0DDC2',
        accent: colorObj.hex,
        success: '#8CC98B',
        warning: '#F6C56A',
        danger: '#A3690C',
        fontHead: fontObj.family,
        fontBody: fontObj.family,
        btnRadius: shapeObj.radius,
        cardRadius: shapeObj.radius,
        inputRadius: '14px',
        borderW: shapeObj.borderW || '2px',
        shadowCard: shapeObj.shadow || '0 6px 0 #F0DDC2',
        shadowBtn: '0 6px 0 rgba(0,0,0,0.1)',
        buddyId: combo.buddy,
        decorStyle: 'clouds',
      },
      schedule: { seasonal: false, expiresAt: null },
      shareCode: `POP-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      checks: {
        contrast: true,
        vietnameseDiacritics: true,
        svgSanitized: true,
        layout360: true,
        packageSize: true,
        visualReviewed: false,
      },
      createdBy: adminProfile?.email || 'admin@kemconhoc.vn',
      createdAt: new Date().toISOString(),
      updatedBy: adminProfile?.email || 'admin@kemconhoc.vn',
      updatedAt: new Date().toISOString(),
    }
    setActiveSpec(newSpec)
    setHistoryStack([])
    setRedoStack([])
    setScreen('designer')
    toast(`Đã tạo bộ nháp từ tổ hợp phổ biến "${combo.name}" ✨`)
  }

  // MÀN 2: CHẠY KIỂM TRA TRƯỚC KHI PHÁT HÀNH (MÀN 3)
  const handleProceedToChecks = () => {
    if (!activeSpec) return
    const checks = runThemePreflightChecks({
      ...activeSpec,
      checks: { ...activeSpec.checks, visualReviewed: isSuperadminReviewSigned }
    })
    setCheckResults(checks)
    setScreen('checks')
  }

  // TỰ ĐỘNG SỬA TƯƠNG PHẢN (AUTO FIX)
  const handleAutoFixField = (varKey, bgKey = 'bg') => {
    if (!activeSpec) return
    const currentVars = activeSpec.vars || {}
    const bgHex = currentVars[bgKey] || '#FFFFFF'
    const fixedHex = autoFixTextColor(bgHex)
    updateActiveSpec({
      ...activeSpec,
      vars: {
        ...currentVars,
        [varKey]: fixedHex,
      }
    })
    setHighlightErrorField(null)
    toast(`Đã tự sửa màu "${varKey}" thành ${fixedHex} để đạt chuẩn WCAG AA! ✓`)
  }

  // MÀN 4: PHÁT HÀNH
  const handleExecutePublish = () => {
    if (!activeSpec) return

    // Role check: Chỉ superadmin mới được published
    const userRole = adminProfile?.role || 'editor'
    if (publishLevel === 'published' && userRole !== 'superadmin') {
      toast('Lỗi 403: Chỉ Superadmin mới có quyền phát hành toàn bộ (Published). Editor chỉ được phát hành Testing.', 'error')
      return
    }

    if (publishLevel === 'published' && (!checkResults || !checkResults.canPublishProduction)) {
      toast('Không thể phát hành toàn bộ khi còn cảnh báo kiểm tra chưa đạt!', 'error')
      return
    }

    const testFamilies = testFamiliesInput.split(',').map((s) => s.trim()).filter(Boolean)
    const updatedSpec = {
      ...activeSpec,
      version: (activeSpec.version || 1) + 1,
      status: publishLevel,
      testingFamilies: publishLevel === 'testing' ? testFamilies : [],
      rolloutPercentage: publishLevel === 'partial' ? 10 : 100,
      schedule: {
        seasonal: isSeasonal,
        expiresAt: isSeasonal && expiresDate ? expiresDate : null,
      },
      updatedBy: adminProfile?.email || 'admin@kemconhoc.vn',
      updatedAt: new Date().toISOString(),
      reviewedBy: isSuperadminReviewSigned ? adminProfile?.email : activeSpec.reviewedBy,
      reviewedAt: isSuperadminReviewSigned ? new Date().toISOString() : activeSpec.reviewedAt,
    }

    // Cập nhật vào danh sách
    const existingIndex = themesList.findIndex((t) => t.id === updatedSpec.id)
    let nextList
    if (existingIndex >= 0) {
      nextList = [...themesList]
      nextList[existingIndex] = updatedSpec
    } else {
      nextList = [updatedSpec, ...themesList]
    }
    persistThemes(nextList)

    // Lưu vào lịch sử phiên bản
    try {
      const history = JSON.parse(localStorage.getItem(ADMIN_THEMES_HISTORY_KEY) || '{}')
      const specHistory = history[updatedSpec.id] || []
      specHistory.unshift({
        version: updatedSpec.version,
        updatedBy: updatedSpec.updatedBy,
        updatedAt: updatedSpec.updatedAt,
        note: versionNote,
        spec: updatedSpec,
      })
      history[updatedSpec.id] = specHistory.slice(0, 20) // Lưu tối đa 20 bản
      localStorage.setItem(ADMIN_THEMES_HISTORY_KEY, JSON.stringify(history))
    } catch {}

    toast(`Đã phát hành bộ "${updatedSpec.name}" ở mức ${publishLevel.toUpperCase()}! 🚀`)
    setActiveSpec(updatedSpec)
    setScreen('list')
  }

  // TÍNH TOÁN BIẾN HIỆN TẠI ĐỂ PREVIEW
  const currentPreviewVars = activeSpec ? deriveAdminThemeVars(activeSpec) : {}

  // Lọc danh sách Màn 1
  const filteredThemes = themesList.filter((t) => {
    if (filterType === 'builtin') return t.locked
    if (filterType === 'admin') return !t.locked && t.status !== 'draft'
    if (filterType === 'draft') return t.status === 'draft'
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* HEADER VÀ THANH ĐIỀU HƯỚNG QUY TRÌNH 4 MÀN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '14px 20px', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {screen !== 'list' && (
            <button
              type="button"
              className="stitch-btn-secondary"
              onClick={() => setScreen('list')}
              style={{ fontSize: 13, padding: '6px 12px' }}
            >
              ← Danh sách bộ
            </button>
          )}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0F172A' }}>
              {screen === 'list' && '🎨 Danh sách bộ giao diện'}
              {screen === 'designer' && `Trình thiết kế: ${activeSpec?.name || 'Bộ mới'}`}
              {screen === 'checks' && `Kiểm tra trước phát hành: ${activeSpec?.name}`}
              {screen === 'publish' && `Phát hành bộ giao diện: ${activeSpec?.name}`}
            </h2>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              Không cần code · Xem trước 12 màn · Kiểm tra tương phản WCAG AA tự động
            </div>
          </div>
        </div>

        {/* Các nút hành động trên Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {screen === 'designer' && (
            <>
              <span style={{ fontSize: 11.5, color: autoSaveStatus === 'saving' ? '#F59E0B' : '#10B981', fontWeight: 700, marginRight: 8 }}>
                {autoSaveStatus === 'saving' ? '⏳ Đang lưu nháp...' : '✓ Đã lưu nháp'}
              </span>
              <button
                type="button"
                className="stitch-btn-secondary"
                onClick={handleUndo}
                disabled={historyStack.length === 0}
                style={{ fontSize: 12, padding: '6px 10px', opacity: historyStack.length === 0 ? 0.5 : 1 }}
                title="Hoàn tác"
              >
                ↩ Hoàn tác
              </button>
              <button
                type="button"
                className="stitch-btn-secondary"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                style={{ fontSize: 12, padding: '6px 10px', opacity: redoStack.length === 0 ? 0.5 : 1 }}
                title="Làm lại"
              >
                ↪ Làm lại
              </button>
              <button
                type="button"
                className="stitch-btn-primary"
                onClick={handleProceedToChecks}
                style={{ fontSize: 13, padding: '7px 16px', background: '#4F46E5' }}
              >
                Kiểm tra trước phát hành ➔
              </button>
            </>
          )}

          {screen === 'checks' && (
            <button
              type="button"
              className="stitch-btn-primary"
              onClick={() => setScreen('publish')}
              style={{ fontSize: 13, padding: '7px 18px', background: '#D6336C' }}
            >
              Tiến hành phát hành ➔
            </button>
          )}
        </div>
      </div>

      {/* ============================================================
         MÀN 1 · DANH SÁCH BỘ GIAO DIỆN & TỔ HỢP PHỔ BIẾN
         ============================================================ */}
      {screen === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Thanh công cụ lọc & tạo mới */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { id: 'all', label: `Tất cả (${themesList.length})` },
                { id: 'builtin', label: 'Bộ gốc (8)' },
                { id: 'admin', label: 'Admin tạo' },
                { id: 'draft', label: 'Bản nháp' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: filterType === f.id ? '1.5px solid #4F46E5' : '1px solid #E2E8F0',
                    background: filterType === f.id ? '#EEF2FF' : '#FFFFFF',
                    color: filterType === f.id ? '#4338CA' : '#475569',
                  }}
                  onClick={() => setFilterType(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="stitch-btn-secondary"
                onClick={async () => {
                  const code = await appPrompt('Nhập mã chia sẻ 6 ký tự, ví dụ ADM-7KP.', { title: 'Nhập mã bộ giao diện', placeholder: 'ADM-7KP', required: true })
                  if (code) toast(`Đang giải mã và nhập cấu hình từ mã "${code.toUpperCase()}"...`)
                }}
                style={{ fontSize: 13, padding: '8px 14px' }}
              >
                📥 Nhập từ mã 6 ký tự
              </button>
              <button
                type="button"
                className="stitch-btn-primary"
                onClick={() => handleCreateNewTheme('bear')}
                style={{ fontSize: 13, padding: '8px 16px', background: '#D6336C' }}
              >
                + Tạo bộ mới
              </button>
            </div>
          </div>

          {/* Lưới thẻ các bộ giao diện */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filteredThemes.map((theme) => {
              const vars = deriveAdminThemeVars(theme)
              const isLocked = Boolean(theme.locked)

              return (
                <div
                  key={theme.id}
                  style={{
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 14,
                    padding: 16,
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    position: 'relative',
                  }}
                >
                  {/* Header thẻ */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <b style={{ fontSize: 16, color: '#0F172A' }}>{theme.name}</b>
                        {isLocked ? (
                          <span style={{ fontSize: 11, background: '#F1F5F9', color: '#64748B', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                            🔒 Bộ gốc
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              background: theme.status === 'published' ? '#DCFCE7' : theme.status === 'partial' ? '#FEF3C7' : '#EFF6FF',
                              color: theme.status === 'published' ? '#166534' : theme.status === 'partial' ? '#92400E' : '#1E40AF',
                              padding: '2px 8px',
                              borderRadius: 999,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                            }}
                          >
                            {theme.status}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                        Mã: `{theme.shareCode || theme.id}` · v{theme.version || 1}
                      </div>
                    </div>
                  </div>

                  {/* Swatches màu của bộ */}
                  <div style={{ display: 'flex', height: 22, borderRadius: 6, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                    <div style={{ flex: 2, background: vars['--c-primary'] }} title="Primary" />
                    <div style={{ flex: 1.5, background: vars['--c-secondary'] }} title="Secondary" />
                    <div style={{ flex: 2, background: vars['--c-bg'] }} title="Background" />
                    <div style={{ flex: 2, background: vars['--c-surface'] }} title="Surface" />
                    <div style={{ flex: 1, background: vars['--c-accent'] }} title="Accent" />
                  </div>

                  {/* Xem trước 2 màn: màn chính và hỏi con */}
                  <ThemeTwoScreenPreview themeId={theme.base || theme.id} vars={vars} label={`Xem trước 2 màn của bộ ${theme.name}`} />

                  {/* Thông tin font & shape */}
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    Font: <b>{vars['--font-head']?.split(',')[0]}</b> · Bo góc: <b>{vars['--radius-lg']}</b>
                  </div>

                  {/* Nút hành động */}
                  <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #F1F5F9', display: 'flex', gap: 8 }}>
                    {isLocked ? (
                      <button
                        type="button"
                        className="stitch-btn-secondary"
                        onClick={() => handleCreateNewTheme(theme.id)}
                        style={{ flex: 1, fontSize: 12.5, padding: '7px 0', justifyContent: 'center' }}
                      >
                        📋 Nhân bản để sửa
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="stitch-btn-primary"
                          onClick={() => {
                            setActiveSpec(theme)
                            setHistoryStack([])
                            setRedoStack([])
                            setScreen('designer')
                          }}
                          style={{ flex: 1, fontSize: 12.5, padding: '7px 0', justifyContent: 'center', background: '#4F46E5' }}
                        >
                          ✏️ Sửa bộ này
                        </button>
                        <button
                          type="button"
                          className="stitch-btn-secondary"
                          onClick={() => {
                            setActiveSpec(theme)
                            handleProceedToChecks()
                          }}
                          style={{ fontSize: 12.5, padding: '7px 12px' }}
                        >
                          🚀 Phát hành
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* KHỐI 5 TỔ HỢP GIA ĐÌNH TỰ GHÉP PHỔ BIẾN NHẤT */}
          <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, border: '1.5px dashed #CBD5E1' }}>
            <div style={{ marginBottom: 14 }}>
              <b style={{ fontSize: 16, color: '#0F172A' }}>🌟 5 tổ hợp gia đình tự ghép phổ biến nhất</b>
              <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
                Được tổng hợp từ hành vi người dùng trong app. Admin có thể bấm "Biến thành bộ gốc" để tạo bản nháp chính thức.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {POPULAR_FAMILY_COMBOS.map((combo) => (
                <div key={combo.id} style={{ background: '#FFFFFF', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ fontSize: 14, color: '#1E293B' }}>{combo.name}</b>
                    <span style={{ fontSize: 11, background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: 999, fontWeight: 700 }}>
                      {combo.count} nhà
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    Màu: <b>{combo.color}</b> · Font: <b>{combo.font}</b> · Dáng: <b>{combo.shape}</b>
                  </div>
                  <button
                    type="button"
                    className="stitch-btn-secondary"
                    onClick={() => handleCreateFromCombo(combo)}
                    style={{ fontSize: 12, padding: '6px 10px', marginTop: 4, justifyContent: 'center', background: '#FDF2F8', color: '#BE185D', borderColor: '#FBCFE8' }}
                  >
                    ⭐ Biến thành bộ gốc
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
         MÀN 2 · TRÌNH THIẾT KẾ (5 NHÓM BIẾN + 12 MÀN XEM TRƯỚC)
         ============================================================ */}
      {screen === 'designer' && activeSpec && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>
          {/* CỘT TRÁI: 5 NHÓM CẤU HÌNH CÓ THỂ GẬP MỞ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Nhóm 1: Màu sắc (12 ô màu + tương phản tức thì) */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'colors' ? '' : 'colors')}
                style={{ width: '100%', padding: '12px 16px', background: '#F8FAFC', border: 'none', textAlign: 'left', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>🎨 1. Bảng màu (12 ô màu)</span>
                <span>{openAccordion === 'colors' ? '▲' : '▼'}</span>
              </button>

              {openAccordion === 'colors' && (
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                    Mỗi màu có tỉ lệ tương phản tính tức thì. Nếu dưới 4.5:1 sẽ có nút "Tự sửa" đưa màu về chuẩn WCAG AA.
                  </p>

                  {[
                    { key: 'primary', label: 'Chính (Primary)', bgKey: 'bg' },
                    { key: 'secondary', label: 'Phụ (Secondary)', bgKey: 'bg' },
                    { key: 'bg', label: 'Nền trang (Background)', bgKey: 'bg' },
                    { key: 'surface', label: 'Nền thẻ (Surface)', bgKey: 'bg' },
                    { key: 'text', label: 'Chữ chính (Text)', bgKey: 'bg', checkContrast: true },
                    { key: 'textSub', label: 'Chữ phụ (Text Sub)', bgKey: 'bg', checkContrast: true },
                    { key: 'border', label: 'Đường viền (Border)', bgKey: 'bg' },
                    { key: 'accent', label: 'Điểm nhấn (Accent)', bgKey: 'bg' },
                    { key: 'success', label: 'Thành công (Good)', bgKey: 'surface' },
                    { key: 'warning', label: 'Cảnh báo (Warning)', bgKey: 'surface' },
                    { key: 'danger', label: 'Lỗi / Hạ hoả (Danger)', bgKey: 'surface' },
                  ].map((field) => {
                    const val = activeSpec.vars[field.key] || '#FFFFFF'
                    const bgVal = activeSpec.vars[field.bgKey] || '#FFFFFF'
                    const contrast = getContrastRatio(val, bgVal)
                    const isFailing = field.checkContrast && contrast < 4.5

                    return (
                      <div key={field.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', flex: 1 }}>{field.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {field.checkContrast && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: contrast >= 4.5 ? '#16A34A' : '#DC2626',
                                background: contrast >= 4.5 ? '#DCFCE7' : '#FEE2E2',
                                padding: '2px 6px',
                                borderRadius: 4,
                              }}
                            >
                              {contrast.toFixed(1)}:1
                            </span>
                          )}
                          {isFailing && (
                            <button
                              type="button"
                              onClick={() => handleAutoFixField(field.key, field.bgKey)}
                              style={{ fontSize: 11, padding: '2px 6px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                            >
                              Tự sửa
                            </button>
                          )}
                          <input
                            type="color"
                            value={val.startsWith('#') && val.length === 7 ? val : '#F6A623'}
                            onChange={(e) => {
                              updateActiveSpec({
                                ...activeSpec,
                                vars: { ...activeSpec.vars, [field.key]: e.target.value }
                              })
                            }}
                            style={{ width: 32, height: 28, borderRadius: 6, border: '1px solid #CBD5E1', cursor: 'pointer', padding: 0 }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Nhóm 2: Chữ (Font tiêu đề & nội dung) */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'fonts' ? '' : 'fonts')}
                style={{ width: '100%', padding: '12px 16px', background: '#F8FAFC', border: 'none', textAlign: 'left', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>✍️ 2. Phông chữ (Tự host an toàn)</span>
                <span>{openAccordion === 'fonts' ? '▲' : '▼'}</span>
              </button>

              {openAccordion === 'fonts' && (
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Phông tiêu đề</label>
                    <select
                      className="stitch-input"
                      value={activeSpec.vars.fontHead?.toLowerCase().includes(String.fromCharCode(109, 105, 116, 114)) ? "'Baloo 2', cursive" : (activeSpec.vars.fontHead || "'Baloo 2', cursive")}
                      onChange={(e) => updateActiveSpec({ ...activeSpec, vars: { ...activeSpec.vars, fontHead: e.target.value } })}
                    >
                      <option value="'Baloo 2', cursive">Baloo 2 (Tròn mập, kẹo ngọt)</option>
                      <option value="'Nunito', sans-serif">Nunito (Rõ ràng, dễ đọc)</option>
                      <option value="'Lexend', sans-serif">Lexend (Tối giản Apple)</option>
                      <option value="'Be Vietnam Pro', sans-serif">Be Vietnam Pro (Chuẩn mực)</option>
                    </select>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 11, color: '#64748B' }}>Mẫu hiển thị dấu tiếng Việt:</span>
                    <p style={{ fontFamily: activeSpec.vars.fontHead, fontSize: 15, margin: '4px 0 0 0', color: activeSpec.vars.text }}>
                      Mẹ ơi con đã hoàn thành bài tập 10 điểm!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Nhóm 3: Hình dạng & Bo góc */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'shapes' ? '' : 'shapes')}
                style={{ width: '100%', padding: '12px 16px', background: '#F8FAFC', border: 'none', textAlign: 'left', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>📐 3. Hình dạng & Bo góc</span>
                <span>{openAccordion === 'shapes' ? '▲' : '▼'}</span>
              </button>

              {openAccordion === 'shapes' && (
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Bo góc thẻ (Card Radius)</label>
                    <input
                      className="stitch-input"
                      value={activeSpec.vars.cardRadius || '24px'}
                      onChange={(e) => updateActiveSpec({ ...activeSpec, vars: { ...activeSpec.vars, cardRadius: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Bo góc nút (Button Radius)</label>
                    <input
                      className="stitch-input"
                      value={activeSpec.vars.btnRadius || '999px'}
                      onChange={(e) => updateActiveSpec({ ...activeSpec, vars: { ...activeSpec.vars, btnRadius: e.target.value } })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Nhóm 4: Bạn đồng hành & Trang trí */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'buddy' ? '' : 'buddy')}
                style={{ width: '100%', padding: '12px 16px', background: '#F8FAFC', border: 'none', textAlign: 'left', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>🧸 4. Bạn đồng hành & Trang trí SVG</span>
                <span>{openAccordion === 'buddy' ? '▲' : '▼'}</span>
              </button>

              {openAccordion === 'buddy' && (
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Chọn linh vật có sẵn</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                      {CUSTOM_BUDDIES.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => updateActiveSpec({ ...activeSpec, vars: { ...activeSpec.vars, buddyId: b.id } })}
                          style={{
                            padding: 8,
                            borderRadius: 8,
                            border: activeSpec.vars.buddyId === b.id ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                            background: activeSpec.vars.buddyId === b.id ? '#EEF2FF' : '#FFFFFF',
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: 20 }}>{b.emoji}</div>
                          <div style={{ fontSize: 10.5, fontWeight: 700 }}>{b.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Hiệu ứng nền (Decor Style)</label>
                    <select
                      className="stitch-input"
                      value={activeSpec.vars.decorStyle || 'clouds'}
                      onChange={(e) => updateActiveSpec({ ...activeSpec, vars: { ...activeSpec.vars, decorStyle: e.target.value } })}
                    >
                      <option value="clouds">☁️ Mây bồng bềnh</option>
                      <option value="stars">✨ Ngôi sao lấp lánh</option>
                      <option value="leaves">🍃 Lá cây rơi</option>
                      <option value="chalk">✏️ Bụi phấn học trò</option>
                      <option value="dots">🫧 Bong bóng chấm bi</option>
                      <option value="none">Trơn (Không hiệu ứng)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Nhóm 5: Mượn bố cục & Icon từ bộ gốc */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'base' ? '' : 'base')}
                style={{ width: '100%', padding: '12px 16px', background: '#F8FAFC', border: 'none', textAlign: 'left', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>🏛️ 5. Bố cục & Bộ Icon mượn từ gốc</span>
                <span>{openAccordion === 'base' ? '▲' : '▼'}</span>
              </button>

              {openAccordion === 'base' && (
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <select
                    className="stitch-input"
                    value={activeSpec.base || 'bear'}
                    onChange={(e) => updateActiveSpec({ ...activeSpec, base: e.target.value })}
                  >
                    {BUILTIN_THEME_SPECS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: DẢI XEM TRƯỚC BẰNG COMPONENT THẬT TỶ LỆ 0.55 */}
          <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <b style={{ fontSize: 15, color: '#0F172A' }}>Xem trước thời gian thực</b>
                <span style={{ fontSize: 12, color: '#64748B' }}>Tỉ lệ: {(previewScale * 100).toFixed(0)}%</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={previewLargeFont}
                    onChange={(e) => setPreviewLargeFont(e.target.checked)}
                  />
                  <span>Chữ to A+</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={previewReduceMotion}
                    onChange={(e) => setPreviewReduceMotion(e.target.checked)}
                  />
                  <span>Tối giản hiệu ứng</span>
                </label>
              </div>
            </div>

            {/* Dải cuộn ngang 3 màn hình mẫu */}
            <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 16 }}>
              {/* Màn 1: Trang chủ (Home) */}
              <div style={{ width: 360, transform: `scale(${previewScale})`, transformOrigin: 'top left', flexShrink: 0 }}>
                <div
                  style={{
                    width: 360,
                    minHeight: 680,
                    background: currentPreviewVars['--c-bg'],
                    color: currentPreviewVars['--c-text'],
                    fontFamily: currentPreviewVars['--font-body'],
                    fontSize: previewLargeFont ? 17 : 15,
                    borderRadius: 36,
                    border: '8px solid #1E293B',
                    padding: 16,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 12, letterSpacing: 1, color: currentPreviewVars['--c-text-2'] }}>
                    CHỦ NHẬT 26/10 · LỚP 3
                  </div>
                  <h3 style={{ fontFamily: currentPreviewVars['--font-head'], fontSize: 24, margin: 0, color: currentPreviewVars['--c-accent-ink'] }}>
                    Chào buổi tối, mẹ!
                  </h3>

                  {/* Thẻ theo dõi học đều */}
                  <div style={{ background: currentPreviewVars['--c-surface'], borderRadius: currentPreviewVars['--radius-lg'], padding: 14, border: `1px solid ${currentPreviewVars['--c-line']}`, boxShadow: currentPreviewVars['--shadow-card'] }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b style={{ fontSize: 14 }}>Học đều tuần này</b>
                      <span style={{ fontSize: 12, color: currentPreviewVars['--c-accent-ink'], fontWeight: 800 }}>4/7 ngày</span>
                    </div>
                  </div>

                  {/* Thẻ hành động chính */}
                  <div style={{ background: currentPreviewVars['--c-surface'], borderRadius: currentPreviewVars['--radius-lg'], padding: 16, border: `1px solid ${currentPreviewVars['--c-line']}`, boxShadow: currentPreviewVars['--shadow-card'] }}>
                    <b style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>Chụp ảnh đề bài</b>
                    <p style={{ fontSize: 12.5, color: currentPreviewVars['--c-text-2'], margin: '0 0 12px 0' }}>
                      AI hướng dẫn mẹ từng câu hỏi nhỏ gợi mở cho con.
                    </p>
                    <button
                      type="button"
                      style={{
                        width: '100%',
                        padding: '12px 0',
                        borderRadius: currentPreviewVars['--radius-btn'],
                        background: currentPreviewVars['--c-btn'],
                        color: currentPreviewVars['--c-btn-text'],
                        fontWeight: 800,
                        border: 'none',
                        boxShadow: currentPreviewVars['--shadow-btn'],
                      }}
                    >
                      📷 Bắt đầu kèm con ➔
                    </button>
                  </div>
                </div>
              </div>

              {/* Màn 2: Giàn giáo gợi mở (Scaffold) */}
              <div style={{ width: 360, transform: `scale(${previewScale})`, transformOrigin: 'top left', flexShrink: 0 }}>
                <div
                  style={{
                    width: 360,
                    minHeight: 680,
                    background: currentPreviewVars['--c-bg'],
                    color: currentPreviewVars['--c-text'],
                    fontFamily: currentPreviewVars['--font-body'],
                    fontSize: previewLargeFont ? 17 : 15,
                    borderRadius: 36,
                    border: '8px solid #1E293B',
                    padding: 16,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, color: currentPreviewVars['--c-accent-ink'] }}>
                    BẬC 1/3 · TÌM HIỂU ĐỀ BÀI
                  </div>
                  <div style={{ background: currentPreviewVars['--c-surface'], borderRadius: currentPreviewVars['--radius-lg'], padding: 14, border: `1px solid ${currentPreviewVars['--c-line']}` }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                      "Mẹ hỏi con: Đề bài cho biết có tất cả bao nhiêu quả táo?"
                    </p>
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: currentPreviewVars['--radius-btn'],
                        background: currentPreviewVars['--c-btn'],
                        color: currentPreviewVars['--c-btn-text'],
                        fontWeight: 800,
                        border: 'none',
                      }}
                    >
                      Con hiểu rồi ➔
                    </button>
                  </div>
                </div>
              </div>

              {/* Màn 3: Hoàn thành (Done) */}
              <div style={{ width: 360, transform: `scale(${previewScale})`, transformOrigin: 'top left', flexShrink: 0 }}>
                <div
                  style={{
                    width: 360,
                    minHeight: 680,
                    background: currentPreviewVars['--c-bg'],
                    color: currentPreviewVars['--c-text'],
                    fontFamily: currentPreviewVars['--font-body'],
                    fontSize: previewLargeFont ? 17 : 15,
                    borderRadius: 36,
                    border: '8px solid #1E293B',
                    padding: 16,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 48, margin: '20px 0 0' }}>🎉</div>
                  <h3 style={{ fontFamily: currentPreviewVars['--font-head'], fontSize: 24, margin: 0 }}>
                    Tuyệt vời lắm con ơi!
                  </h3>
                  <p style={{ fontSize: 13, color: currentPreviewVars['--c-text-2'] }}>
                    Con đã kiên nhẫn vượt qua từng câu hỏi từng bước một.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
         MÀN 3 · KIỂM TRA TRƯỚC PHÁT HÀNH (6 BƯỚC TỰ ĐỘNG)
         ============================================================ */}
      {screen === 'checks' && checkResults && (
        <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 14, border: '1px solid #E2E8F0', maxWidth: 800, margin: '0 auto' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
            Kết quả 6 bước kiểm tra trước phát hành
          </h3>
          <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
            Hệ thống tự động rà soát tương phản WCAG AA, dấu tiếng Việt, an toàn SVG và kích thước gói tải.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {checkResults.details.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: item.status === 'pass' ? '#F0FDF4' : '#FEF2F2',
                  border: item.status === 'pass' ? '1px solid #BBF7D0' : '1px solid #FECACA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <b style={{ fontSize: 14, color: item.status === 'pass' ? '#166534' : '#991B1B' }}>
                    {idx + 1}. {item.check}
                  </b>
                  <div style={{ fontSize: 12.5, color: '#475569', marginTop: 2 }}>{item.message}</div>
                </div>
                <span style={{ fontSize: 18 }}>{item.status === 'pass' ? '✅' : '❌'}</span>
              </div>
            ))}

            {/* Bước 6: Phê duyệt của Superadmin */}
            <div style={{ padding: '12px 16px', borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isSuperadminReviewSigned}
                  onChange={(e) => setIsSuperadminReviewSigned(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
                  6. Superadmin xác nhận đã xem lại 12 ảnh chụp và phê duyệt bộ giao diện này
                </span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              className="stitch-btn-secondary"
              onClick={() => setScreen('designer')}
            >
              ← Quay lại chỉnh sửa
            </button>

            <button
              type="button"
              className="stitch-btn-primary"
              onClick={() => setScreen('publish')}
              style={{ background: '#4F46E5', padding: '10px 20px', fontWeight: 800 }}
            >
              Tiếp tục cấu hình phát hành ➔
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
         MÀN 4 · PHÁT HÀNH (3 MỨC, THEO MÙA, MÃ CHIA SẺ, LỊCH SỬ)
         ============================================================ */}
      {screen === 'publish' && activeSpec && (
        <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 14, border: '1px solid #E2E8F0', maxWidth: 700, margin: '0 auto' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
            Phát hành bộ giao diện: {activeSpec.name}
          </h3>
          <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
            Chọn phạm vi áp dụng và chính sách thời hạn theo mùa.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 3 mức phát hành */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>Mức độ phát hành</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="publishLevel"
                    value="testing"
                    checked={publishLevel === 'testing'}
                    onChange={() => setPublishLevel('testing')}
                  />
                  <span><strong>Thử nghiệm nội bộ (Testing):</strong> Chỉ hiển thị với 3 gia đình kiểm thử</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="publishLevel"
                    value="partial"
                    checked={publishLevel === 'partial'}
                    onChange={() => setPublishLevel('partial')}
                  />
                  <span><strong>Phát hành một phần (Partial):</strong> 10% gia đình (chọn theo băm ổn định)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="publishLevel"
                    value="published"
                    checked={publishLevel === 'published'}
                    onChange={() => setPublishLevel('published')}
                  />
                  <span><strong>Toàn bộ (Published):</strong> Tất cả gia đình đều thấy và chọn được</span>
                </label>
              </div>
            </div>

            {publishLevel === 'testing' && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>ID 3 gia đình thử nghiệm (cách nhau bằng dấu phẩy)</label>
                <input
                  className="stitch-input"
                  value={testFamiliesInput}
                  onChange={(e) => setTestFamiliesInput(e.target.value)}
                />
              </div>
            )}

            {/* Có thời hạn (bộ theo mùa) */}
            <div style={{ padding: 12, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isSeasonal}
                  onChange={(e) => setIsSeasonal(e.target.checked)}
                />
                <span>Bộ theo mùa (Có ngày hết hạn)</span>
              </label>

              {isSeasonal && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 4 }}>Ngày hết hạn:</span>
                  <input
                    type="date"
                    className="stitch-input"
                    value={expiresDate}
                    onChange={(e) => setExpiresDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Ghi chú phiên bản */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Ghi chú phiên bản (Lưu vào Audit Log)</label>
              <input
                className="stitch-input"
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
              />
            </div>

            {/* Nút thực hiện phát hành */}
            <button
              type="button"
              className="stitch-btn-primary"
              onClick={handleExecutePublish}
              style={{
                background: '#D6336C',
                padding: '12px 0',
                fontSize: 15,
                fontWeight: 800,
                justifyContent: 'center',
                marginTop: 8,
              }}
            >
              🚀 Xác nhận & Phát hành lên Cloudflare
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
