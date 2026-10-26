/* ============================================================
   KÈM CON HỌC — XEM TRƯỚC CHUYỂN ĐỘNG ADMIN (Prompt 22 Chặng 3)
   Lưới 6 khoảnh khắc x 11 bộ giao diện chạy thật (CSS & SVG)
   ============================================================ */

import React, { useState } from 'react'
import { THEMES } from '../themes.js'
import { MotionStage } from '../MotionLayer.jsx'
import '../themes/motion.css'

const MOMENTS = [
  { id: 'step_done', name: 'Xong một bậc', desc: 'Vật chứa đầy thêm một nấc, giọt rơi vào, linh vật nhảy' },
  { id: 'stuck', name: 'Con chưa nghĩ ra', desc: 'Linh vật nghiêng đầu, hoạ tiết bay lên, câu hỏi rung' },
  { id: 'micro_step', name: 'Chẻ nhỏ câu hỏi', desc: 'Thẻ câu lớn mờ đi, hai thẻ nhỏ trượt ra theo kiểu thẻ của bộ' },
  { id: 'listen', name: 'Gấu nghe con', desc: 'Sóng âm theo nét của bộ, lời con hiện thành chữ, dấu đúng bật' },
  { id: 'badge_given', name: 'Tặng huy hiệu', desc: 'Huy hiệu bay theo đường cong vào sổ, vệt hoạ tiết, sổ nảy +1' },
  { id: 'day_logged', name: 'Dấu tuần này', desc: 'Dấu của ngày in lên hàng dấu chân' },
]

export function AdminMotionPreviewTab() {
  const [viewMode, setViewMode] = useState('by_theme') // 'by_theme' | 'by_moment' | 'all_matrix'
  const [selectedThemeId, setSelectedThemeId] = useState('bear')
  const [selectedMomentId, setSelectedMomentId] = useState('step_done')
  const [motionLevel, setMotionLevel] = useState('full') // 'full' | 'light' | 'off'

  const currentTheme = THEMES.find((t) => t.id === selectedThemeId) || THEMES[0]

  return (
    <div className="admin-card" style={{ padding: 24 }} data-testid="admin-motion-preview">
      {/* Tiêu đề & Chọn mức chuyển động */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            🎬 Xem Trước 6 Chuyển Động Trên 11 Bộ Giao Diện
          </h3>
          <p style={{ margin: '4px 0 0', color: 'var(--adm-sub, #64748B)', fontSize: 13.5 }}>
            Chuẩn hoá chuyển động nhẹ dưới 2,5 giây, 100% bằng CSS & SVG, không có mã màu hex viết cứng.
          </p>
        </div>

        {/* Bộ lọc chế độ chuyển động: Đầy đủ | Nhẹ | Tắt */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F1F5F9', padding: '4px 8px', borderRadius: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Mức hiệu ứng:</span>
          {[
            { id: 'full', label: 'Đầy đủ' },
            { id: 'light', label: 'Nhẹ (bỏ hạt)' },
            { id: 'off', label: 'Tắt (tĩnh)' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setMotionLevel(lvl.id)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: motionLevel === lvl.id ? 800 : 600,
                border: 'none',
                background: motionLevel === lvl.id ? '#FFFFFF' : 'transparent',
                color: motionLevel === lvl.id ? '#1E293B' : '#64748B',
                boxShadow: motionLevel === lvl.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
              }}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chuyển góc nhìn */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid #E2E8F0', paddingBottom: 10 }}>
        <button
          type="button"
          onClick={() => setViewMode('by_theme')}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            border: viewMode === 'by_theme' ? '2px solid #2563EB' : '1px solid #CBD5E1',
            background: viewMode === 'by_theme' ? '#EFF6FF' : '#FFF',
            color: viewMode === 'by_theme' ? '#1D4ED8' : '#475569',
          }}
        >
          Theo từng bộ (1 bộ x 6 khoảnh khắc)
        </button>
        <button
          type="button"
          onClick={() => setViewMode('by_moment')}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            border: viewMode === 'by_moment' ? '2px solid #2563EB' : '1px solid #CBD5E1',
            background: viewMode === 'by_moment' ? '#EFF6FF' : '#FFF',
            color: viewMode === 'by_moment' ? '#1D4ED8' : '#475569',
          }}
        >
          So sánh một khoảnh khắc trên 11 bộ
        </button>
        <button
          type="button"
          onClick={() => setViewMode('all_matrix')}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            border: viewMode === 'all_matrix' ? '2px solid #2563EB' : '1px solid #CBD5E1',
            background: viewMode === 'all_matrix' ? '#EFF6FF' : '#FFF',
            color: viewMode === 'all_matrix' ? '#1D4ED8' : '#475569',
          }}
        >
          Lưới tổng thể 6 x 11
        </button>
      </div>

      {/* 1. VIEW THEO BỘ */}
      {viewMode === 'by_theme' && (
        <div data-motion={motionLevel}>
          {/* Chips chọn theme */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedThemeId(t.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 99,
                  fontSize: 12.5,
                  fontWeight: selectedThemeId === t.id ? 800 : 600,
                  border: selectedThemeId === t.id ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  background: selectedThemeId === t.id ? '#EFF6FF' : '#FFF',
                  color: selectedThemeId === t.id ? '#1D4ED8' : '#334155',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{t.icon}</span>
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          {/* Header tóm tắt bộ đang chọn */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: currentTheme.vars?.['--c-bg'] || '#F8FAFC',
              border: `1px solid ${currentTheme.vars?.['--c-line'] || '#E2E8F0'}`,
              color: currentTheme.vars?.['--c-text'] || '#1E293B',
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div>
              <b style={{ fontSize: 16 }}>
                {currentTheme.icon} {currentTheme.name}
              </b>
              <span style={{ fontSize: 13, marginLeft: 10, opacity: 0.85 }}>
                Linh vật: <b>{currentTheme.motion?.mascot || 'Bạn Gấu'}</b> · Vật chứa:{' '}
                <b>{currentTheme.motion?.vessel?.name}</b> · Kiểu thẻ: <b>{currentTheme.motion?.split?.cardStyle}</b> · Tiếng: <i>{currentTheme.motion?.sound}</i>
              </span>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 99,
                background: currentTheme.vars?.['--c-accent'] || '#2563EB',
                color: currentTheme.vars?.['--c-on-accent'] || '#fff',
              }}
            >
              {currentTheme.isDark ? 'Giao diện tối' : 'Giao diện sáng'}
            </span>
          </div>

          {/* Lưới 6 khoảnh khắc */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
            }}
            data-testid="grid-6-moments"
          >
            {MOMENTS.map((m) => (
              <div
                key={m.id}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 16,
                  padding: 14,
                  background: currentTheme.vars?.['--c-bg'] || '#FFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ width: '100%', minHeight: 180, display: 'grid', placeItems: 'center' }}>
                  <MotionStage themeId={currentTheme.id} event={m.id} />
                </div>
                <div style={{ marginTop: 8, textAlign: 'center', borderTop: '1px dashed #E2E8F0', paddingTop: 8, width: '100%' }}>
                  <b style={{ fontSize: 13.5, color: '#1E293B', display: 'block' }}>{m.name}</b>
                  <span style={{ fontSize: 11.5, color: '#64748B' }}>{m.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SO SÁNH 1 KHOẢNH KHẮC TRÊN 11 BỘ */}
      {viewMode === 'by_moment' && (
        <div data-motion={motionLevel}>
          {/* Chips chọn khoảnh khắc */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {MOMENTS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMomentId(m.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 99,
                  fontSize: 12.5,
                  fontWeight: selectedMomentId === m.id ? 800 : 600,
                  border: selectedMomentId === m.id ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  background: selectedMomentId === m.id ? '#EFF6FF' : '#FFF',
                  color: selectedMomentId === m.id ? '#1D4ED8' : '#334155',
                  cursor: 'pointer',
                }}
              >
                {m.name}
              </button>
            ))}
          </div>

          {/* Lưới 11 bộ */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
            }}
            data-testid="grid-11-themes-compare"
          >
            {THEMES.map((t) => (
              <div
                key={t.id}
                style={{
                  border: '1px solid #CBD5E1',
                  borderRadius: 14,
                  padding: 12,
                  background: t.vars?.['--c-bg'] || '#FFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: '100%', minHeight: 180, display: 'grid', placeItems: 'center' }}>
                  <MotionStage themeId={t.id} event={selectedMomentId} />
                </div>
                <div style={{ marginTop: 6, textAlign: 'center', borderTop: '1px dashed #E2E8F0', paddingTop: 6, width: '100%' }}>
                  <b style={{ fontSize: 13, color: '#1E293B' }}>
                    {t.icon} {t.name}
                  </b>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. LƯỚI TỔNG THỂ 6 X 11 */}
      {viewMode === 'all_matrix' && (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} data-motion={motionLevel} data-testid="grid-6x11-matrix">
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1400, fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '10px 12px', border: '1px solid #E2E8F0', textAlign: 'left', minWidth: 150 }}>Bộ giao diện</th>
                {MOMENTS.map((m) => (
                  <th key={m.id} style={{ padding: '10px 8px', border: '1px solid #E2E8F0', textAlign: 'center', minWidth: 200 }}>
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {THEMES.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: '10px 12px', border: '1px solid #E2E8F0', fontWeight: 800, background: t.vars?.['--c-bg'] || '#FFF', color: t.vars?.['--c-text'] || '#1E293B' }}>
                    <div style={{ fontSize: 15 }}>{t.icon}</div>
                    <div>{t.name}</div>
                    <span style={{ fontSize: 10, color: 'var(--c-text-2, #64748B)', fontWeight: 600 }}>{t.motion?.split?.cardStyle}</span>
                  </td>
                  {MOMENTS.map((m) => (
                    <td key={m.id} style={{ padding: 6, border: '1px solid #E2E8F0', background: t.vars?.['--c-bg'] || '#FFF', verticalAlign: 'middle', textAlign: 'center' }}>
                      <div style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
                        <MotionStage themeId={t.id} event={m.id} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminMotionPreviewTab
