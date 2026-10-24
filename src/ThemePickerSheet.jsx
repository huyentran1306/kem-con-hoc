/* ============================================================
   🎨 MÀN CHỌN GIAO DIỆN CẢ NHÀ (THEME PICKER)
   8 thẻ xem trước trực quan, xem thử tức thì, tuỳ chỉnh hiệu ứng
   ============================================================ */
import React, { useState, useContext, useEffect } from 'react'
import { AppCtx } from './ctx'
import { THEMES, getTheme, applyTheme } from './themes'
import { Check, Sparkles, Sliders } from 'lucide-react'

export function ThemePickerSheet({ onClose }) {
  const { S, patch, toast } = useContext(AppCtx)
  const initialTheme = S.theme || 'candy'
  const initialMotion = S.motion || 'full'

  const [selectedTheme, setSelectedTheme] = useState(initialTheme)
  const [selectedMotion, setSelectedMotion] = useState(initialMotion)

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
    try {
      localStorage.setItem('kem-con-hoc:user-custom-theme', 'true')
    } catch (e) {}
    patch({
      theme: selectedTheme,
      motion: selectedMotion,
    })
    applyTheme(selectedTheme, selectedMotion)
    toast(`Đã đổi sang giao diện "${getTheme(selectedTheme).name}" cho cả nhà ✨`)
    onClose?.()
  }

  // Huỷ bỏ -> khôi phục theme cũ
  const handleCancel = () => {
    applyTheme(initialTheme, initialMotion)
    onClose?.()
  }

  // Khôi phục nếu user bấm ngoài sheet đóng lại
  useEffect(() => {
    return () => {
      applyTheme(S.theme || 'bear', S.motion || 'full')
    }
  }, [S.theme, S.motion])

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

      {/* Lưới 8 bộ giao diện xem trước */}
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
        {THEMES.map((theme) => {
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
                <p style={{ fontSize: 11, color: 'var(--c-text-2)', marginTop: 2, lineHeight: 1.35 }}>
                  {theme.desc}
                </p>
              </div>

              {/* Tag trạng thái */}
              <div style={{ display: 'flex', gap: 4, marginTop: 'auto' }}>
                {isCurrentActive && (
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      background: 'var(--c-good-bg)',
                      color: 'var(--c-good)',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}
                  >
                    Đang dùng
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
      </div>

      {/* Nút hành động */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button className="btn ghost" onClick={handleCancel} style={{ flex: 1 }}>
          Thôi, giữ nguyên
        </button>
        <button className="btn solid" onClick={handleSave} style={{ flex: 2 }}>
          ✨ Dùng giao diện này cho cả nhà
        </button>
      </div>
    </div>
  )
}
