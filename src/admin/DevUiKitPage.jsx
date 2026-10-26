/* ============================================================
   KÈM CON HỌC — TRANG NỘI BỘ KIỂM THỬ KHUÔN GIAO DIỆN MỚI
   URL: #/dev/ui-kit hoặc /dev/ui-kit (Prompt 23 · Chặng 1)
   Hiển thị toàn bộ T1 Nút & T2 Thẻ trên cả 11 bộ giao diện
   ============================================================ */

import React, { useState } from 'react'
import { THEMES } from '../themes'
import { BtnKm, HoldBtn, CardKm } from '../ui/KhuonMoi.jsx'

export function DevUiKitPage() {
  const [selectedThemeId, setSelectedThemeId] = useState('bear')
  const [viewAll, setViewAll] = useState(false)
  const currentTheme = THEMES.find((t) => t.id === selectedThemeId) || THEMES[0]

  const renderKitForTheme = (theme) => {
    return (
      <div
        key={theme.id}
        style={{
          background: theme.vars?.['--c-bg'] || '#FFF',
          color: theme.vars?.['--c-text'] || '#1E293B',
          padding: 20,
          borderRadius: 24,
          border: `1px solid ${theme.vars?.['--c-line'] || '#E2E8F0'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          fontFamily: theme.fontBody || 'sans-serif',
        }}
        data-testid={`ui-kit-theme-${theme.id}`}
      >
        {/* Tiêu đề bộ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3
              style={{
                fontFamily: theme.fontHead || 'sans-serif',
                fontSize: 20,
                fontWeight: 800,
                margin: 0,
                color: theme.vars?.['--c-text'],
              }}
            >
              {theme.icon} {theme.name}
            </h3>
            <span style={{ fontSize: 12, color: theme.vars?.['--c-text-2'] }}>
              Font tiêu đề: <b>{theme.fontHead}</b> · Font thân: <b>{theme.fontBody}</b>
            </span>
          </div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 800,
              background: theme.vars?.['--c-surface-2'],
              color: theme.vars?.['--c-text'],
            }}
          >
            {theme.isDark ? 'Giao diện tối' : 'Giao diện sáng'}
          </span>
        </div>

        {/* 1. T1 NÚT PHẲNG MỀM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <b style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.vars?.['--c-text-2'] }}>
            T1 · NÚT PHẲNG MỀM
          </b>

          {/* Cỡ L (56px) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11.5, color: theme.vars?.['--c-text-2'] }}>Chính · Lớn 56px (tối đa 1 nút mỗi màn):</span>
            <button
              type="button"
              className="btn-km btn-km-l btn-km-primary"
              style={{
                background: theme.vars?.['--c-accent'],
                color: theme.vars?.['--c-on-accent'],
                boxShadow: `0 8px 18px -6px ${theme.vars?.['--c-accent']}b3`,
              }}
            >
              <span className="btn-km-icon">{theme.icon || '🍯'}</span>
              <span className="btn-km-text">Bắt đầu bài tối nay</span>
              <span className="btn-km-arrow">›</span>
            </button>
          </div>

          {/* Cặp Vừa 48px/44px */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              className="btn-km btn-km-m btn-km-primary"
              style={{
                background: theme.vars?.['--c-accent'],
                color: theme.vars?.['--c-on-accent'],
                boxShadow: `0 8px 18px -6px ${theme.vars?.['--c-accent']}b3`,
              }}
            >
              Đúng rồi, soạn bài ›
            </button>
            <button
              type="button"
              className="btn-km btn-km-m btn-km-secondary"
              style={{
                background: theme.vars?.['--c-surface-2'],
                color: theme.vars?.['--c-text'],
              }}
            >
              📷 Chụp lại
            </button>
          </div>

          {/* Nút Thành công ("Con làm được!") */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11.5, color: theme.vars?.['--c-text-2'] }}>
              Thành công · Vừa 48px (Màu chuẩn riêng theo bộ: <code>{theme.vars?.['--c-ok-bg']}</code>):
            </span>
            <button
              type="button"
              className="btn-km btn-km-m btn-km-ok"
              style={{
                background: theme.vars?.['--c-ok-bg'],
                color: theme.vars?.['--c-ok-text'],
                boxShadow: `0 8px 18px -6px ${theme.vars?.['--c-ok-bg']}b3`,
              }}
            >
              <span>✓</span>
              <span>Con làm được!</span>
            </button>
          </div>

          {/* Nhẹ (Chips) & Tròn & Nguy hiểm */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              className="btn-km btn-km-chip active"
              style={{
                background: theme.vars?.['--c-surface'],
                borderColor: theme.vars?.['--c-accent'],
                color: theme.vars?.['--c-text'],
              }}
            >
              🔍 Tỉ mỉ
            </span>
            <span
              className="btn-km btn-km-chip"
              style={{
                background: theme.vars?.['--c-surface-2'],
                color: theme.vars?.['--c-text'],
              }}
            >
              🐢 Kiên nhẫn
            </span>
            <button
              type="button"
              className="btn-km-circle"
              style={{
                background: theme.vars?.['--c-surface-2'],
                color: theme.vars?.['--c-text'],
              }}
            >
              😮‍💨
            </button>
            <button
              type="button"
              className="btn-km btn-km-s btn-km-danger"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#EF4444',
              }}
            >
              Xoá
            </button>
          </div>
        </div>

        {/* 2. T2 THẺ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <b style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.vars?.['--c-text-2'] }}>
            T2 · THẺ
          </b>

          {/* Thẻ hành động */}
          <div
            className="card-km card-km-action"
            style={{
              background: theme.vars?.['--c-surface'],
              borderColor: theme.vars?.['--c-line'],
              color: theme.vars?.['--c-text'],
            }}
          >
            <div
              className="card-km-icon"
              style={{ background: theme.vars?.['--c-surface-2'] }}
            >
              📝
            </div>
            <div>
              <b className="t-card-title" style={{ color: theme.vars?.['--c-text'] }}>
                Chấm vở Na đã làm
              </b>
              <p className="t-sub" style={{ margin: 0, color: theme.vars?.['--c-text-2'] }}>
                Chụp bài đã làm xong, AI tìm đúng bước sai đầu tiên
              </p>
            </div>
            <span style={{ fontSize: 20, color: theme.vars?.['--c-text-2'], fontWeight: 900 }}>›</span>
          </div>

          {/* Thẻ gợi ý AI */}
          <div
            className="card-km card-km-ai"
            style={{
              background: `color-mix(in srgb, ${theme.vars?.['--c-accent']} 9%, ${theme.vars?.['--c-surface']})`,
              borderColor: theme.vars?.['--c-line'],
              color: theme.vars?.['--c-text'],
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>💡</span>
              <b style={{ fontSize: 14, color: theme.vars?.['--c-text'] }}>Gợi ý cho mẹ hôm nay</b>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: theme.vars?.['--c-text'] }}>
              Để Na tự làm trước 10 phút, mẹ chỉ vào khi con gọi. Ít nói hơn, con nhớ lâu hơn.
            </p>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: theme.vars?.['--c-text-2'] }}>
              Căn cứ: 3 buổi gần nhất
            </span>
          </div>

          {/* Thẻ lưu ý / Note */}
          <div
            className="card-km card-km-note"
            style={{
              background: theme.vars?.['--c-warn-bg'] || '#FFF1D6',
              borderColor: theme.vars?.['--c-warn-line'] || '#F6C56A',
            }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#4A3410' }}>
              ⚠️ Mẹ lưu ý: Chưa nhắc con công thức vội, để con nhớ lại cách vẽ hình.
            </span>
          </div>

          {/* Thẻ danh sách (List Card) */}
          <div
            className="card-km card-km-list"
            style={{
              background: theme.vars?.['--c-surface'],
              borderColor: theme.vars?.['--c-line'],
            }}
          >
            {[
              { num: 1, title: 'Hỏi số vịt ban đầu', sub: 'Nhận diện số lượng ban đầu' },
              { num: 2, title: 'Bán bớt là thêm hay bớt?', sub: 'Hiểu từ khoá phép tính' },
            ].map((it) => (
              <div
                key={it.num}
                className="card-km-item"
                style={{ borderColor: theme.vars?.['--c-line'] }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: theme.vars?.['--c-surface-2'],
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12,
                    fontWeight: 900,
                    color: theme.vars?.['--c-text'],
                  }}
                >
                  {it.num}
                </div>
                <div style={{ flex: 1, display: 'grid' }}>
                  <b style={{ fontSize: 14, color: theme.vars?.['--c-text'] }}>{it.title}</b>
                  <span style={{ fontSize: 12, color: theme.vars?.['--c-text-2'] }}>{it.sub}</span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    background: theme.vars?.['--c-surface-2'],
                    color: theme.vars?.['--c-text-2'],
                    borderRadius: 99,
                    padding: '2px 7px',
                  }}
                >
                  Gợi ý
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: '#0F172A' }}>
            🛠️ Dev UI Kit · Bộ Khuôn Giao Diện Mới (Prompt 23)
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 14 }}>
            Kiểm thử toàn bộ T1 Nút Phẳng Mềm và T2 Thẻ trên cả 11 bộ giao diện. Chuẩn hoá 100% token --c-*.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setViewAll(!viewAll)}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              border: '1px solid #CBD5E1',
              background: viewAll ? '#2563EB' : '#FFF',
              color: viewAll ? '#FFF' : '#1E293B',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {viewAll ? 'Xem 1 bộ đang chọn' : 'Xem cả 11 bộ cùng lúc'}
          </button>
        </div>
      </div>

      {/* Selector chọn theme */}
      {!viewAll && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedThemeId(t.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 99,
                fontSize: 13,
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
      )}

      {/* Render 1 bộ hoặc cả 11 bộ */}
      {viewAll ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {THEMES.map((t) => renderKitForTheme(t))}
        </div>
      ) : (
        <div style={{ maxWidth: 460, margin: '0 auto' }}>
          {renderKitForTheme(currentTheme)}
        </div>
      )}
    </div>
  )
}

export default DevUiKitPage
