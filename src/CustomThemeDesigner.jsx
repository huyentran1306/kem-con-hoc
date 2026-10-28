/* ============================================================
   KÈM CON HỌC — CUSTOM THEME DESIGNER (PROMPT 09 MỤC 4)
   Màn hình 6 bước tự thiết kế giao diện + Live preview 5 màn + Mã 6 ký tự
   ============================================================ */

import React, { useState, useMemo, useContext } from 'react'
import {
  CUSTOM_COLORS,
  CUSTOM_FONTS,
  CUSTOM_SHAPES,
  CUSTOM_BUDDIES,
  deriveCustomThemeVars,
} from './themes/customPalette'
import { encodeThemeCode, decodeThemeCode } from './themes/customThemeCode'
import { BuddyMascot, BUDDY_QUOTES } from './themes/buddies/buddySvgs'
import { ThemedTabIcon } from './themes/themeIcons'
import { soundPop, soundSuccess } from './audio'
import { AppCtx } from './ctx'

export function CustomThemeDesigner({
  currentCustomTheme = null,
  childName = 'con',
  onSave,
  onCancel,
  canEdit = true,
}) {
  const { Ho = 'Bố mẹ' } = useContext(AppCtx) || {}
  const [stepPage, setStepPage] = useState(1) // 1: Màu & Nền, 2: Chữ & Nút, 3: Bạn đồng hành & Icon, 4: Tổng quan 5 màn

  const [themeConfig, setThemeConfig] = useState(
    currentCustomTheme || {
      v: 1,
      color: 'honey',
      mode: 'light',
      font: 'round',
      shape: 'soft',
      buddy: 'unicorn',
      icons: 'auto',
    }
  )

  const [isRolling, setIsRolling] = useState(false)
  const [shareMsg, setShareMsg] = useState('')

  // Tính toán biến CSS theo tổ hợp đang chọn
  const themeVars = useMemo(() => deriveCustomThemeVars(themeConfig), [themeConfig])

  // Mã chia sẻ 6 ký tự
  const shareCode = useMemo(() => encodeThemeCode(themeConfig), [themeConfig])

  // Cập nhật từng trường
  const updateField = (field, value) => {
    soundPop(500)
    setThemeConfig((prev) => ({ ...prev, [field]: value }))
  }

  // 🎲 Chọn ngẫu nhiên 6 lựa chọn
  const handleRandomize = () => {
    soundPop(650)
    setIsRolling(true)
    setTimeout(() => setIsRolling(false), 400)

    const randomColor = CUSTOM_COLORS[Math.floor(Math.random() * CUSTOM_COLORS.length)].id
    const randomMode = Math.random() > 0.4 ? 'light' : 'dark'
    const randomFont = CUSTOM_FONTS[Math.floor(Math.random() * CUSTOM_FONTS.length)].id
    const randomShape = CUSTOM_SHAPES[Math.floor(Math.random() * CUSTOM_SHAPES.length)].id
    const randomBuddy = CUSTOM_BUDDIES[Math.floor(Math.random() * CUSTOM_BUDDIES.length)].id

    setThemeConfig({
      v: 1,
      color: randomColor,
      mode: randomMode,
      font: randomFont,
      shape: randomShape,
      buddy: randomBuddy,
      icons: 'auto',
    })
  }

  // Chia sẻ mã giao diện
  const handleShare = async () => {
    soundPop(600)
    const shareText = `Mã bộ giao diện ${themeConfig.buddy} của nhà mình: ${shareCode} (Kèm Con Học)`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Giao diện Kèm Con Học', text: shareText })
        return
      } catch (e) {}
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareCode)
      setShareMsg('Đã chép mã ' + shareCode + ' vào khay nhớ tạm! 📋')
      setTimeout(() => setShareMsg(''), 3000)
    }
  }

  // Xác nhận lưu
  const handleApplyTheme = () => {
    soundSuccess()
    onSave?.(themeConfig)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 14px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        className="card pop"
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--c-surface, #FFFFFF)',
          borderRadius: 28,
          padding: '20px 18px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
          maxHeight: '94vh',
          overflowY: 'auto',
          border: '1.5px solid var(--c-line)',
        }}
      >
        {/* Header với nút quay lại và nút xúc xắc ngẫu nhiên */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="round-btn"
              onClick={stepPage > 1 ? () => setStepPage(stepPage - 1) : onCancel}
              style={{ width: 34, height: 34, fontSize: 16 }}
            >
              ‹
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--c-text)' }}>
              {stepPage === 4 ? `Bộ của nhà ${childName}` : 'Tự thiết kế bộ của nhà mình'}
            </h3>
          </div>
          <button
            className="round-btn"
            onClick={handleRandomize}
            style={{
              width: 36,
              height: 36,
              fontSize: 18,
              transform: isRolling ? 'rotate(360deg) scale(1.15)' : 'none',
              transition: 'all 0.35s ease',
            }}
            title="Đổi ngẫu nhiên"
          >
            🎲
          </button>
        </div>

        {/* Thanh tiến độ 4 trang */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 16 }}>
          {[1, 2, 3, 4].map((p) => (
            <div
              key={p}
              style={{
                height: 5,
                borderRadius: 4,
                background: p <= stepPage ? 'var(--c-accent)' : 'var(--c-line)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* ========================================================
            TRANG 1: MÀU CHÍNH & NỀN
            ======================================================== */}
        {stepPage === 1 && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <b style={{ fontSize: 15, color: 'var(--c-text)', display: 'block' }}>1. Màu con thích nhất?</b>
              <span style={{ fontSize: 12.5, color: 'var(--c-text-2)' }}>Bấm là đổi ngay ở bản xem trước bên dưới</span>
            </div>

            {/* 8 ô màu */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
              {CUSTOM_COLORS.map((c) => {
                const isSelected = themeConfig.color === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => updateField('color', c.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      padding: '8px 4px',
                      borderRadius: 14,
                      background: isSelected ? 'var(--c-surface-2)' : 'transparent',
                      border: isSelected ? '2px solid var(--c-accent)' : '1px solid var(--c-line)',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: c.hex,
                        boxShadow: isSelected ? '0 0 12px ' + c.hex : 'none',
                        border: '2px solid #FFFFFF',
                      }}
                    />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text)' }}>{c.name}</span>
                  </button>
                )
              })}
            </div>

            <div style={{ marginBottom: 14 }}>
              <b style={{ fontSize: 15, color: 'var(--c-text)', display: 'block' }}>2. Nền sáng hay tối?</b>
            </div>

            {/* Sáng / Tối */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { id: 'light', label: '☀️ Nền sáng' },
                { id: 'dark', label: '🌙 Nền tối' },
              ].map((m) => {
                const isSelected = themeConfig.mode === m.id
                return (
                  <button
                    key={m.id}
                    className={`btn ${isSelected ? 'solid' : 'ghost'}`}
                    style={{ padding: '12px', fontSize: 14, fontWeight: 700 }}
                    onClick={() => updateField('mode', m.id)}
                  >
                    {m.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TRANG 2: CHỮ & NÚT / THẺ
            ======================================================== */}
        {stepPage === 2 && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <b style={{ fontSize: 15, color: 'var(--c-text)', display: 'block' }}>3. Kiểu chữ</b>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
              {CUSTOM_FONTS.map((f) => {
                const isSelected = themeConfig.font === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => updateField('font', f.id)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 14,
                      background: isSelected ? 'var(--c-surface-2)' : 'transparent',
                      border: isSelected ? '2px solid var(--c-accent)' : '1px solid var(--c-line)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontFamily: f.family, fontSize: 18, fontWeight: 700, display: 'block' }}>
                      Aa Khám phá
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--c-text-2)' }}>{f.name}</span>
                  </button>
                )
              })}
            </div>

            <div style={{ marginBottom: 12 }}>
              <b style={{ fontSize: 15, color: 'var(--c-text)', display: 'block' }}>4. Kiểu nút và thẻ</b>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
              {CUSTOM_SHAPES.map((s) => {
                const isSelected = themeConfig.shape === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => updateField('shape', s.id)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 14,
                      background: isSelected ? 'var(--c-surface-2)' : 'transparent',
                      border: isSelected ? '2px solid var(--c-accent)' : '1px solid var(--c-line)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        height: 20,
                        borderRadius: s.radius,
                        background: 'var(--c-accent)',
                        margin: '0 auto 6px',
                        width: '70%',
                        border: s.id === 'sticker' ? '2px solid #000' : 'none',
                        boxShadow: s.id === 'sticker' ? '2px 2px 0 #000' : 'none',
                      }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text)' }}>{s.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TRANG 3: BẠN ĐỒNG HÀNH & ICON
            ======================================================== */}
        {stepPage === 3 && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <b style={{ fontSize: 15, color: 'var(--c-text)', display: 'block' }}>5. Bạn đồng hành</b>
              <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}>Xuất hiện ở Màn chính, thẻ nhắc và Xong bài</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
              {CUSTOM_BUDDIES.map((b) => {
                const isSelected = themeConfig.buddy === b.id
                return (
                  <button
                    key={b.id}
                    onClick={() => updateField('buddy', b.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      padding: '10px 4px',
                      borderRadius: 14,
                      background: isSelected ? 'var(--c-surface-2)' : 'transparent',
                      border: isSelected ? '2px solid var(--c-accent)' : '1px solid var(--c-line)',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 26 }}>{b.emoji}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text)' }}>{b.name}</span>
                  </button>
                )
              })}
            </div>

            <div style={{ marginBottom: 12 }}>
              <b style={{ fontSize: 15, color: 'var(--c-text)', display: 'block' }}>6. Bộ icon thanh dưới</b>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className={`btn ${themeConfig.icons === 'auto' ? 'solid' : 'ghost'}`}
                style={{ flex: 1, padding: '10px', fontSize: 13, fontWeight: 700 }}
                onClick={() => updateField('icons', 'auto')}
              >
                ✨ Tự động theo nhân vật
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            MINI LIVE PREVIEW (3 MÀN) — Cho các bước 1, 2, 3
            ======================================================== */}
        {stepPage < 4 && (
          <div style={{ margin: '14px 0 16px' }}>
            <div
              style={{
                borderRadius: themeVars['--radius-card'],
                background: themeVars['--c-bg'],
                color: themeVars['--c-text'],
                padding: '12px 14px',
                border: `${themeVars['--border-w']} solid ${themeVars['--c-line']}`,
                fontFamily: themeVars['--font-body'],
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Thẻ nhỏ mô phỏng Home */}
              <div
                style={{
                  flex: 1,
                  background: themeVars['--c-surface'],
                  borderRadius: 10,
                  padding: '8px 6px',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: 18 }}>
                  {CUSTOM_BUDDIES.find((b) => b.id === themeConfig.buddy)?.emoji || '⭐'}
                </span>
                <div style={{ fontSize: 10, fontWeight: 800, marginTop: 2 }}>Học tối nay</div>
                <div
                  style={{
                    height: 14,
                    borderRadius: 999,
                    background: themeVars['--c-accent'],
                    marginTop: 4,
                  }}
                />
              </div>

              {/* Thẻ nhỏ mô phỏng Bậc */}
              <div
                style={{
                  flex: 1,
                  background: themeVars['--c-surface'],
                  borderRadius: 10,
                  padding: '8px 6px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 800, color: themeVars['--c-accent-ink'] }}>BẬC 2 / 4</div>
                <div style={{ fontSize: 9.5, fontWeight: 700, margin: '2px 0' }}>{Ho} đọc câu hỏi</div>
                <div
                  style={{
                    height: 14,
                    borderRadius: 999,
                    background: themeVars['--c-good'],
                    marginTop: 4,
                  }}
                />
              </div>

              {/* Thẻ nhỏ mô phỏng Xong bài */}
              <div
                style={{
                  flex: 1,
                  background: themeVars['--c-surface'],
                  borderRadius: 10,
                  padding: '8px 6px',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: 16 }}>🏆</span>
                <div style={{ fontSize: 9.5, fontWeight: 800, marginTop: 2 }}>Xong bài!</div>
                <div
                  style={{
                    height: 14,
                    borderRadius: 999,
                    background: themeVars['--c-surface-2'],
                    marginTop: 4,
                  }}
                />
              </div>
            </div>
            <span style={{ display: 'block', textAlign: 'center', fontSize: 11, color: 'var(--c-text-2)', marginTop: 4 }}>
              Bản xem trước 3 màn thu gọn · cập nhật tức thì
            </span>
          </div>
        )}

        {/* ========================================================
            TRANG 4: TỔNG QUAN 5 MÀN THẬT & MÃ CHIA SẺ
            ======================================================== */}
        {stepPage === 4 && (
          <div>
            {/* Tóm tắt các tag */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              <span className="chip on">{CUSTOM_COLORS.find((c) => c.id === themeConfig.color)?.name}</span>
              <span className="chip">{themeConfig.mode === 'dark' ? 'Nền tối' : 'Nền sáng'}</span>
              <span className="chip">{CUSTOM_FONTS.find((f) => f.id === themeConfig.font)?.name}</span>
              <span className="chip">{CUSTOM_SHAPES.find((s) => s.id === themeConfig.shape)?.name}</span>
              <span className="chip">{CUSTOM_BUDDIES.find((b) => b.id === themeConfig.buddy)?.name}</span>
            </div>

            {/* Dải 3 màn thu nhỏ sắc nét */}
            <div
              style={{
                borderRadius: themeVars['--radius-card'],
                background: themeVars['--c-bg'],
                color: themeVars['--c-text'],
                padding: '14px',
                border: `${themeVars['--border-w']} solid ${themeVars['--c-line']}`,
                fontFamily: themeVars['--font-body'],
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                marginBottom: 12,
              }}
            >
              {/* Màn 1: Home */}
              <div
                style={{
                  background: themeVars['--c-surface'],
                  borderRadius: 12,
                  padding: 8,
                  fontSize: 10,
                  border: `1px solid ${themeVars['--c-line']}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b>Tối nay</b>
                  <span>{CUSTOM_BUDDIES.find((b) => b.id === themeConfig.buddy)?.emoji || '⭐'}</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, margin: '4px 0 6px' }}>Học cùng {childName}</div>
                <div
                  style={{
                    background: themeVars['--c-accent'],
                    color: themeVars['--c-on-accent'],
                    borderRadius: themeVars['--radius-btn'],
                    padding: '6px',
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: 9.5,
                  }}
                >
                  Bắt đầu học
                </div>
              </div>

              {/* Màn 2: Hỏi con */}
              <div
                style={{
                  background: themeVars['--c-surface'],
                  borderRadius: 12,
                  padding: 8,
                  fontSize: 10,
                  border: `1px solid ${themeVars['--c-line']}`,
                }}
              >
                <span style={{ fontSize: 8.5, color: themeVars['--c-accent-ink'], fontWeight: 800 }}>BẬC 2 / 4</span>
                <div style={{ fontSize: 10, fontWeight: 700, margin: '2px 0 6px', lineHeight: 1.2 }}>
                  {Ho} đọc to cho {childName}
                </div>
                <div
                  style={{
                    background: themeVars['--c-good'],
                    color: themeVars['--c-on-good'],
                    borderRadius: themeVars['--radius-btn'],
                    padding: '6px',
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: 9.5,
                  }}
                >
                  ✓ Trả lời được
                </div>
              </div>

              {/* Màn 3: Xong bài */}
              <div
                style={{
                  background: themeVars['--c-surface'],
                  borderRadius: 12,
                  padding: 8,
                  fontSize: 10,
                  border: `1px solid ${themeVars['--c-line']}`,
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: 18 }}>🏆</span>
                <div style={{ fontSize: 10, fontWeight: 800, margin: '2px 0 4px' }}>Xong rồi!</div>
                <div style={{ fontSize: 8.5, color: themeVars['--c-text-2'] }}>Tự làm 3 bậc</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-good-fg, #059669)' }}>
                Chữ đạt chuẩn tương phản dễ đọc ✓ (WCAG AA)
              </span>
            </div>

            {/* Mã giao diện 6 ký tự */}
            <div
              style={{
                background: 'var(--c-surface-2)',
                borderRadius: 16,
                padding: '12px 14px',
                textAlign: 'center',
                marginBottom: 14,
                border: '1px dashed var(--c-line)',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-2)', textTransform: 'uppercase' }}>
                Mã bộ giao diện nhà mình
              </span>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2, color: 'var(--c-accent)', margin: '4px 0' }}>
                🎁 {shareCode}
              </div>
              <button
                className="btn ghost"
                style={{ fontSize: 12, padding: '4px 10px', margin: '0 auto' }}
                onClick={handleShare}
              >
                Chia sẻ mã cho nhà khác
              </button>
              {shareMsg && <p style={{ fontSize: 12, color: 'var(--c-good-fg)', margin: '4px 0 0' }}>{shareMsg}</p>}
            </div>
          </div>
        )}

        {/* Nút điều hướng chân màn hình */}
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          {stepPage < 4 ? (
            <>
              <button
                className="btn ghost"
                style={{ flex: 1, padding: '12px', fontSize: 13.5 }}
                onClick={handleRandomize}
              >
                🎲 Ngẫu nhiên
              </button>
              <button
                className="btn solid"
                style={{ flex: 1.5, padding: '12px', fontSize: 14, fontWeight: 800 }}
                onClick={() => setStepPage(stepPage + 1)}
              >
                Tiếp tục →
              </button>
            </>
          ) : (
            <>
              <button
                className="btn ghost"
                style={{ flex: 1, padding: '12px', fontSize: 13.5 }}
                onClick={() => setStepPage(1)}
              >
                Sửa lại
              </button>
              <button
                className="btn solid"
                disabled={!canEdit}
                style={{ flex: 1.8, padding: '12px', fontSize: 14, fontWeight: 800 }}
                onClick={handleApplyTheme}
              >
                {canEdit ? 'Dùng cho cả nhà ✨' : 'Chỉ xem (Không được đổi)'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
