/* ============================================================
   KÈM CON HỌC — CALM NUDGE CARD
   Prompt 08 Mục 1: Thẻ nhắc trượt lên từ dưới không chặn câu đọc to
   ============================================================ */

import React, { useEffect } from 'react'

export function CalmNudgeCard({
  childName = 'con',
  reasonText = 'Mít bí 2 lần ở bậc này rồi',
  onAccept,
  onSnooze,
}) {
  // Tự ẩn sau 20 giây nếu không bấm
  useEffect(() => {
    const timer = setTimeout(() => {
      onSnooze?.()
    }, 20000)
    return () => clearTimeout(timer)
  }, [onSnooze])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 74,
        left: 12,
        right: 12,
        zIndex: 9990,
        maxWidth: 480,
        margin: '0 auto',
        animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="card pop"
        style={{
          background: 'var(--c-surface, #FFFFFF)',
          border: '2px solid var(--c-accent, #7C3AED)',
          borderRadius: 20,
          padding: '14px 16px',
          boxShadow: '0 12px 32px rgba(124, 58, 237, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 26 }}>🫧</span>
            <div>
              <b style={{ fontSize: 15, color: 'var(--c-text)', display: 'block' }}>
                Hai mẹ con nghỉ 1 phút nhé?
              </b>
              <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}>
                {reasonText} · <b>Bài vẫn giữ nguyên</b>
              </span>
            </div>
          </div>
          <button
            className="round-btn"
            onClick={onSnooze}
            style={{ width: 28, height: 28, fontSize: 13 }}
            title="Để sau"
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn ghost"
            style={{ flex: 1, padding: '10px 12px', fontSize: 13, fontWeight: 700 }}
            onClick={onSnooze}
          >
            Để sau (10p)
          </button>
          <button
            className="btn solid"
            style={{ flex: 1.5, padding: '10px 14px', fontSize: 13.5, fontWeight: 800 }}
            onClick={onAccept}
          >
            🫧 Nghỉ 1 phút
          </button>
        </div>
      </div>
    </div>
  )
}
