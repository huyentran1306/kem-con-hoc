/**
 * 🌙 MÀN HÌNH HẾT GIỜ CHƠI TRONG NGÀY (MÀN 8 THEO BẢN VẼ)
 * Trạng thái T7 lành mạnh: không có nút chơi thêm.
 */
import React from 'react';
import { AppCtx } from '../ctx'
import { useContext } from 'react'
import { haiNguoi } from '../xungHo'

export default function GameLimitScreen({ childName = 'con', onBack, onOpenProfile }) {
  const { ho = 'bố mẹ', Ho = 'Bố mẹ' } = useContext(AppCtx) || {}
  return (
    <div
      className="card-km"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '36px 20px',
        minHeight: 460,
        gap: 14,
        background: 'var(--c-surface, #fff)',
        borderRadius: 24,
      }}
      data-testid="screen-game-limit"
    >
      <span style={{ fontSize: 64, lineHeight: 1 }}>🐻 🌙 ⭐</span>
      <b style={{ fontSize: 20, color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
        Hôm nay chơi đủ rồi
      </b>
      <p style={{ fontSize: 14, color: 'var(--c-sub, #6E5D4E)', maxWidth: 300, margin: 0, lineHeight: 1.5 }}>
        Mai Gấu nghĩ trò mới theo bài tối nay nhé. Giờ {haiNguoi(ho, { cap: false })} cùng đọc sách hoặc nghỉ ngơi thôi nào!
      </p>

      <div style={{ marginTop: 12, width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          type="button"
          className="btn-km btn-km-m btn-km-primary"
          style={{ width: '100%', height: 48, borderRadius: 16 }}
          onClick={onBack}
        >
          <span>📖 Gợi ý truyện tối nay</span>
          <span className="btn-km-arrow">›</span>
        </button>

        <button
          type="button"
          className="btn-km-ghost"
          style={{
            fontSize: 12.5,
            color: 'var(--c-sub, #6E5D4E)',
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
          }}
          onClick={onOpenProfile}
        >
          {Ho} chỉnh thời gian chơi trong Con tôi
        </button>
      </div>
    </div>
  );
}
