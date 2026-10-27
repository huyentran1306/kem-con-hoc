/* ============================================================
   🎨 MÀN CHỌN GIAO DIỆN CẢ NHÀ (THEME PICKER)
   11 thẻ xem trước (nhóm Theo mùa và Thường ngày), xem thử tức thì, tuỳ chỉnh hiệu ứng
   ============================================================ */
import React, { useState, useContext, useEffect, useRef } from 'react'
import { AppCtx } from './ctx'
import { getTheme, applyTheme, SEASONAL_THEMES, REGULAR_THEMES } from './themes'
import { isSeasonalTheme, seasonTag, pickThemePatch } from './seasons/seasonLogic'
import { useSeasonsConfig, getSeasonToday } from './seasons/useSeasonsConfig'
import './seasons/seasons.css'
import { Check, Sparkles, Sliders } from 'lucide-react'
import { CustomThemeDesigner } from './CustomThemeDesigner'
import { decodeThemeCode } from './themes/customThemeCode'

export function ThemePickerSheet({ onClose }) {
  const { S, patch, toast } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const initialTheme = S.theme || 'bear'
  const initialMotion = S.motion || 'full'

  const savedRef = useRef(false)
  const [selectedTheme, setSelectedTheme] = useState(initialTheme)
  const [selectedMotion, setSelectedMotion] = useState(initialMotion)
  const [showDesigner, setShowDesigner] = useState(false)
  const [inputCode, setInputCode] = useState('')
  // Đợt 16: nhóm Theo mùa ở trên nhóm Thường ngày
  const { cfg: seasonCfg } = useSeasonsConfig()
  const seasonToday = getSeasonToday()
  const oldTheme = isSeasonalTheme(initialTheme) ? S.themeBeforeSeason || null : null
  const pickerItems = [
    { kind: 'h', node: <p key="h-season" className="theme-group-h">THEO MÙA</p> },
    ...SEASONAL_THEMES.map((t) => ({ kind: 't', theme: t })),
    {
      kind: 'h',
      node: (
        <p key="n-season" className="theme-group-note">
          Bộ theo mùa dùng được quanh năm. Đến mùa, app chỉ gợi ý một lần, không tự đổi.
        </p>
      ),
    },
    { kind: 'h', node: <p key="h-regular" className="theme-group-h">THƯỜNG NGÀY</p> },
    ...REGULAR_THEMES.map((t) => ({ kind: 't', theme: t })),
  ]

  // Áp dụng thử ngay khi bấm chọn thẻ
  const handlePreview = (themeId) => {
    setSelectedTheme(themeId)
    applyTheme(themeId, selectedMotion)
  }

  const handleMotionChange = (motion) => {
    setSelectedMotion(motion)
    applyTheme(selectedTheme, motion)
  }

  // Xác nhận lưu cho cả nhà
  const handleSave = () => {
    savedRef.current = true
    try {
      localStorage.setItem('kem-con-hoc:user-custom-theme', 'true')
    } catch (e) {}
    patch({
      ...pickThemePatch(S, selectedTheme, getSeasonToday(), seasonCfg),
      motion: selectedMotion,
    })
    applyTheme(selectedTheme, selectedMotion)
    toast(`Đã đổi sang giao diện "${getTheme(selectedTheme).name}" cho cả nhà ✨`)
    onClose?.()
  }

  // Huỷ bỏ -> khôi phục theme cũ
  const handleCancel = () => {
    savedRef.current = false
    applyTheme(initialTheme, initialMotion)
    onClose?.()
  }

  // Khôi phục nếu user bấm ngoài sheet đóng lại mà chưa bấm Lưu
  useEffect(() => {
    return () => {
      if (!savedRef.current) {
        applyTheme(initialTheme, initialMotion)
      }
    }
  }, [initialTheme, initialMotion])

  return (
    <div className="theme-picker-pn">
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <p className="title" style={{ fontSize: 20, fontWeight: 800 }}>🎨 Giao diện cả nhà</p>
        <p className="sub" style={{ fontSize: 13.5, color: 'var(--c-text-2)' }}>
          Mỗi gia đình một gu. Chọn một bộ, toàn bộ màn hình sẽ đổi ngay cho cả nhà.
        </p>
      </div>

      {/* Tuỳ chọn hiệu ứng chuyển động */}
      <div className="card" style={{ padding: '10px 14px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sliders size={15} /> Hiệu ứng hoạt họa
          </span>
          <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}>
            {selectedMotion === 'full' ? 'Đầy đủ ✨' : selectedMotion === 'light' ? 'Nhẹ 🍃' : 'Tắt ⏹️'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[
            ['full', 'Đầy đủ ✨'],
            ['light', 'Nhẹ 🍃'],
            ['off', 'Tắt ⏹️'],
          ].map(([m, lbl]) => (
            <button
              key={m}
              onClick={() => handleMotionChange(m)}
              style={{
                padding: '6px 4px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: selectedMotion === m ? 800 : 600,
                background: selectedMotion === m ? 'var(--c-accent)' : 'var(--c-surface-2)',
                color: selectedMotion === m ? 'var(--c-accent-text)' : 'var(--c-text)',
                border: '1px solid var(--c-line)',
                cursor: 'pointer',
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Lưới bộ giao diện xem trước: Theo mùa ở trên, Thường ngày ở dưới */}
      <div
        className="theme-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 12,
          maxHeight: '52vh',
          overflowY: 'auto',
          paddingBottom: 8,
        }}
      >
        {pickerItems.map((item) => {
          if (item.kind !== 't') return item.node
          const theme = item.theme
          const sTag = theme.seasonal ? seasonTag(theme.id, seasonToday, seasonCfg) : ''
          const isSelected = selectedTheme === theme.id
          const isCurrentActive = initialTheme === theme.id
          const v = theme.vars

          return (
            <div
              key={theme.id}
              onClick={() => handlePreview(theme.id)}
              style={{
                border: isSelected ? '2.5px solid var(--c-accent)' : '1.5px solid var(--c-line)',
                borderRadius: 16,
                padding: 10,
                background: isSelected ? 'var(--c-surface-2)' : 'var(--c-surface)',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.18s ease',
              }}
            >
              {/* Thẻ xem trước màu mini */}
              <div
                style={{
                  height: 64,
                  borderRadius: 10,
                  background: v['--c-bg'],
                  border: `1px solid ${v['--c-line']}`,
                  padding: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13 }}>{theme.icon}</span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {theme.swatches.slice(0, 3).map((sw, i) => (
                      <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: sw }} />
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    background: v['--c-btn'],
                    color: v['--c-btn-text'],
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 9.5,
                    fontWeight: 800,
                    textAlign: 'center',
                  }}
                >
                  Nút chính
                </div>
              </div>

              {/* Tên và mô tả theme */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <b style={{ fontSize: 13.5, color: 'var(--c-text)' }}>{theme.name}</b>
                  {isSelected && <Check size={16} color="var(--c-accent)" strokeWidth={3} />}
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--c-text)', opacity: 1, marginTop: 2, lineHeight: 1.35 }}>
                  {theme.desc}
                </p>
              </div>

              {/* Tag trạng thái */}
              <div style={{ display: 'flex', gap: 4, marginTop: 'auto', flexWrap: 'wrap' }}>
                {sTag && <span className={`theme-tag ${sTag === 'Đang mùa' ? 'good' : ''}`}>{sTag}</span>}
                {oldTheme === theme.id && <span className="theme-tag">Bộ cũ</span>}
                {isCurrentActive && (
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      background: 'var(--c-good-bg, #E3F5EC)',
                      color: 'var(--c-text)',
                      border: '1px solid var(--c-good, #1F7A5C)',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}
                  >
                    ✓ Đang dùng
                  </span>
                )}
                {isSelected && !isCurrentActive && (
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      background: 'var(--c-accent)',
                      color: 'var(--c-accent-text)',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}
                  >
                    Xem thử
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {/* Thẻ thứ 9: ✨ Tự thiết kế (Prompt 09) */}
        <div
          onClick={() => {
            if (S.customTheme) {
              handlePreview('custom')
            } else {
              setShowDesigner(true)
            }
          }}
          style={{
            border: selectedTheme === 'custom' ? '2.5px solid var(--c-accent)' : '1.5px dashed var(--c-accent)',
            borderRadius: 16,
            padding: 10,
            background: selectedTheme === 'custom' ? 'var(--c-surface-2)' : 'var(--c-surface)',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            boxShadow: selectedTheme === 'custom' ? '0 4px 16px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <div
            style={{
              height: 64,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #FFF8EC, #EDE9FE)',
              border: '1px dashed var(--c-accent)',
              padding: 6,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 24 }}>✨</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-accent-ink)' }}>Tự ghép độc bản</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <b style={{ fontSize: 13.5, color: 'var(--c-text)' }}>Tự thiết kế</b>
              {selectedTheme === 'custom' && <Check size={16} color="var(--c-accent)" strokeWidth={3} />}
            </div>
            <p style={{ fontSize: 11, color: 'var(--c-text-2)', marginTop: 2, lineHeight: 1.35 }}>
              Tự chọn màu, chữ, kiểu nút và bạn đồng hành
            </p>
          </div>

          <div style={{ display: 'flex', gap: 4, marginTop: 'auto' }}>
            <button
              className="btn ghost"
              style={{ width: '100%', padding: '4px 6px', fontSize: 11, fontWeight: 700 }}
              onClick={(e) => {
                e.stopPropagation()
                setShowDesigner(true)
              }}
            >
              {S.customTheme ? '✎ Sửa thiết kế' : '+ Tạo bộ mới'}
            </button>
          </div>
        </div>
      </div>

      {/* Ô nhập mã chia sẻ XXX-XXX */}
      <div style={{ marginTop: 14, background: 'var(--c-surface)', borderRadius: 14, padding: '12px 14px', border: '1px solid var(--c-line)' }}>
        <b style={{ fontSize: 13, color: 'var(--c-text)', display: 'block', marginBottom: 4 }}>
          🎁 Nhập mã bộ giao diện của nhà khác
        </b>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Ví dụ: KX7-M4P"
            value={inputCode}
            maxLength={7}
            onChange={(e) => {
              const val = e.target.value.toUpperCase()
              setInputCode(val)
              const decoded = decodeThemeCode(val)
              if (decoded) {
                patch({ customTheme: decoded })
                setSelectedTheme('custom')
                applyTheme('custom', selectedMotion, decoded)
                toast('Đã tìm thấy bộ giao diện ' + decoded.buddy + '! Bấm Lưu để dùng ✨')
              }
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--c-line)',
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              background: 'var(--c-bg)',
              color: 'var(--c-text)',
            }}
          />
        </div>
      </div>

      {/* Nút hành động: 2 nút cùng cao 48px kiểu Phẳng mềm, chữ một dòng (Prompt 23H A15) */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          type="button"
          className="btn ghost btn-km btn-km-m btn-km-secondary"
          onClick={handleCancel}
          style={{
            height: 48,
            minHeight: 48,
            padding: '0 14px',
            fontSize: 13.5,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Thôi, giữ nguyên
        </button>
        <button
          type="button"
          className="btn solid btn-km btn-km-m btn-km-primary"
          onClick={handleSave}
          style={{
            height: 48,
            minHeight: 48,
            flex: 1,
            padding: '0 12px',
            fontSize: 13.5,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✨ Dùng cho cả nhà
        </button>
      </div>

      {/* Modal Tự thiết kế */}
      {showDesigner && (
        <CustomThemeDesigner
          childName={child?.name || 'con'}
          currentCustomTheme={S.customTheme}
          onSave={(cfg) => {
            savedRef.current = true
            try {
              localStorage.setItem('kem-con-hoc:user-custom-theme', 'true')
            } catch (e) {}
            patch({ theme: 'custom', customTheme: cfg })
            applyTheme('custom', selectedMotion, cfg)
            setSelectedTheme('custom')
            setShowDesigner(false)
            toast('Đã áp dụng bộ giao diện của nhà mình! ✨')
            onClose?.()
          }}
          onCancel={() => setShowDesigner(false)}
        />
      )}
    </div>
  )
}
