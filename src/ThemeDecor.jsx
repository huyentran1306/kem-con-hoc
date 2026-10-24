/* ============================================================
   🎨 THEME DECORATIONS — Hiệu ứng nền nhẹ nhàng theo từng bộ
   Không che chữ, không nhận pointer-events, tối ưu GPU
   ============================================================ */
import React from 'react'

export function ThemeDecor({ themeId = 'candy', motion = 'full' }) {
  if (motion === 'off') return null

  return (
    <div className={`theme-decor-root decor-${themeId}`} aria-hidden="true">
      {themeId === 'candy' && <CandyDecor motion={motion} />}
      {themeId === 'bear' && <BearDecor motion={motion} />}
      {themeId === 'aurora' && <AuroraDecor motion={motion} />}
      {themeId === 'garden' && <GardenDecor motion={motion} />}
      {themeId === 'chalk' && <ChalkDecor motion={motion} />}
      {themeId === 'notebook' && <NotebookDecor motion={motion} />}
      {themeId === 'sticker' && <StickerDecor motion={motion} />}
      {themeId === 'bento' && <BentoDecor motion={motion} />}
    </div>
  )
}

/* 1. KẸO BÔNG: Mây trắng góc trên, sao vàng lấp lánh */
function CandyDecor() {
  return (
    <div className="decor-candy-layer">
      <div className="candy-cloud cloud-1" />
      <div className="candy-cloud cloud-2" />
      <span className="candy-star star-1">✦</span>
      <span className="candy-star star-2">✦</span>
      <span className="candy-star star-3">✦</span>
    </div>
  )
}

/* 2. BẠN GẤU: Dấu chân mờ và chú gấu SVG nhỏ nhắn */
function BearDecor() {
  return (
    <div className="decor-bear-layer">
      <span className="bear-paw paw-1">🐾</span>
      <span className="bear-paw paw-2">🐾</span>
      <span className="bear-paw paw-3">🐾</span>
    </div>
  )
}

/* 3. CỰC QUANG: 4 vệt màu blur trôi mờ ảo + bụi sao lấp lánh */
function AuroraDecor() {
  return (
    <div className="decor-aurora-layer">
      <div className="aur">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="dust">
        <i style={{ left: '10%', top: '15%' }} />
        <i style={{ left: '82%', top: '11%', animationDelay: '1s' }} />
        <i style={{ left: '52%', top: '34%', animationDelay: '2s' }} />
        <i style={{ left: '22%', top: '62%', animationDelay: '0.5s' }} />
        <i style={{ left: '85%', top: '72%', animationDelay: '2.6s' }} />
        <i style={{ left: '16%', top: '86%', animationDelay: '1.7s' }} />
      </div>
    </div>
  )
}

/* 4. KHU VƯỜN ĐÊM: Đom đóm bay chập chờn */
function GardenDecor() {
  return (
    <div className="decor-garden-layer ff">
      <i className="firefly ff-1" style={{ left: '12%', top: '18%', animationDelay: '0s' }} />
      <i className="firefly ff-2" style={{ right: '15%', top: '24%', animationDelay: '1.5s' }} />
      <i className="firefly ff-3" style={{ left: '32%', top: '48%', animationDelay: '3s' }} />
      <i className="firefly ff-4" style={{ right: '20%', top: '68%', animationDelay: '4.5s' }} />
      <i className="firefly ff-5" style={{ left: '18%', top: '82%', animationDelay: '2s' }} />
    </div>
  )
}

/* 5. BẢNG PHẤN: Sao phấn và đốm bụi phấn */
function ChalkDecor() {
  return (
    <div className="decor-chalk-layer">
      <span className="chalk-star star-1">★</span>
      <span className="chalk-star star-2">✦</span>
    </div>
  )
}

/* 6. SỔ TAY: Kẻ dòng và góc băng dính */
function NotebookDecor() {
  return (
    <div className="decor-notebook-layer">
      <div className="tape-strip" />
    </div>
  )
}

/* 7. STICKER: Chấm bi truyện tranh */
function StickerDecor() {
  return <div className="decor-sticker-layer" />
}

/* 8. BENTO: Vòng tròn mờ tinh tế */
function BentoDecor() {
  return <div className="decor-bento-layer" />
}

/* SVG GẤU TỰ VẼ ĐỒNG HÀNH (3 trạng thái: chào, nhắc, vui) */
export function BearAvatar({ mood = 'chao', size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tai */}
      <circle cx="28" cy="28" r="14" fill="#D97706" />
      <circle cx="28" cy="28" r="8" fill="#FDE68A" />
      <circle cx="72" cy="28" r="14" fill="#D97706" />
      <circle cx="72" cy="28" r="8" fill="#FDE68A" />
      {/* Đầu */}
      <circle cx="50" cy="56" r="36" fill="#F59E0B" />
      {/* Mõm */}
      <ellipse cx="50" cy="64" rx="16" ry="12" fill="#FEF3C7" />
      <ellipse cx="50" cy="58" rx="6" ry="4" fill="#78350F" />
      {/* Mắt */}
      {mood === 'vui' ? (
        <>
          <path d="M38 50 Q42 44 46 50" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <path d="M54 50 Q58 44 62 50" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="40" cy="48" r="4" fill="#78350F" />
          <circle cx="60" cy="48" r="4" fill="#78350F" />
        </>
      )}
      {/* Miệng */}
      {mood === 'vui' ? (
        <path d="M46 66 Q50 72 54 66" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
      ) : (
        <path d="M47 66 Q50 68 53 66" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      )}
      {/* Má hồng */}
      <circle cx="34" cy="58" r="5" fill="#FCA5A5" opacity="0.6" />
      <circle cx="66" cy="58" r="5" fill="#FCA5A5" opacity="0.6" />
    </svg>
  )
}
