/* ============================================================
   KÈM CON HỌC — DYNAMIC THEME FAVICON
   Tự động cập nhật favicon trên tab trình duyệt theo bộ giao diện (theme):
   - Tết (tet): Bé Lân (lion)
   - Bạn Gấu (bear): Gấu Mật (/icon.svg)
   - Đêm Tuyết (noel): Người Tuyết Bông (snowman)
   - Kẹo Bông (candy): Bé Kỳ Lân (unicorn)
   - Sticker (sticker): Bé Kỳ Lân (unicorn)
   - Cực Quang (aurora): Rồng Con (dragon)
   - Sổ Tay (notebook): Mèo Hạt Dẻ (cat)
   - Bảng Phấn (chalk): Ngôi Sao (star)
   - Khu Vườn (garden): Mầm Non (sprout)
   - Cầu Vồng 1/6 (thieunhi): Bé Cánh Diều (kite)
   - Bento (bento): Bé Cơm Nắm (onigiri)
   - Tự thiết kế (custom): Linh vật theo cấu hình
   ============================================================ */

import { buddyInnerSVG } from './buddies/buddyArt.js'
import { CUSTOM_COLORS } from './customPalette.js'

export const THEME_FAVICON_CONFIGS = {
  tet: { bg1: '#FFE6D5', bg2: '#D9251B', border: '#FFD700', buddyId: 'lion' },
  bear: { bg1: '#FFEBB8', bg2: '#F6A623', border: '#FFFFFF', buddyId: 'bear' },
  noel: { bg1: '#E0F2FE', bg2: '#1E3A8A', border: '#93C5FD', buddyId: 'snowman' },
  candy: { bg1: '#FCE7F3', bg2: '#EC4899', border: '#FFFFFF', buddyId: 'unicorn' },
  sticker: { bg1: '#FEF08A', bg2: '#F59E0B', border: '#1E293B', buddyId: 'unicorn' },
  aurora: { bg1: '#1E1B4B', bg2: '#4338CA', border: '#818CF8', buddyId: 'dragon' },
  notebook: { bg1: '#FEF9C3', bg2: '#D97706', border: '#78350F', buddyId: 'cat' },
  chalk: { bg1: '#064E3B', bg2: '#022C22', border: '#34D399', buddyId: 'star' },
  garden: { bg1: '#064E3B', bg2: '#065F46', border: '#6EE7B7', buddyId: 'sprout' },
  thieunhi: { bg1: '#E0F2FE', bg2: '#0284C7', border: '#BAE6FD', buddyId: 'kite' },
  bento: { bg1: '#FFFFFF', bg2: '#F1F5F9', border: '#CBD5E1', buddyId: 'onigiri' }
}

export function generateFaviconSvg(themeId, customConfig = null) {
  let conf = THEME_FAVICON_CONFIGS[themeId]
  if (themeId === 'custom') {
    const buddyId = customConfig?.buddy || 'unicorn'
    const colorObj = CUSTOM_COLORS.find((c) => c.id === customConfig?.color)
    const accentHex = colorObj?.hex || '#F6A623'
    conf = {
      bg1: customConfig?.mode === 'dark' ? '#1E293B' : '#FEF3C7',
      bg2: accentHex,
      border: '#FFFFFF',
      buddyId
    }
  }
  if (!conf) conf = THEME_FAVICON_CONFIGS.bear
  const inner = buddyInnerSVG(conf.buddyId, 'idle')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="favBg_${themeId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${conf.bg1}"/>
      <stop offset="100%" stop-color="${conf.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="url(#favBg_${themeId})"/>
  <rect x="2" y="2" width="96" height="96" rx="22" fill="none" stroke="${conf.border}" stroke-width="2.5" stroke-opacity="0.4"/>
  <g transform="translate(0, 2)">
    <svg viewBox="-8 -10 116 116" width="100" height="100" overflow="visible">
      ${inner}
    </svg>
  </g>
</svg>`
}

export function updateThemeFavicon(themeId, customConfig = null) {
  if (typeof document === 'undefined') return
  try {
    let href = `/themes/favicon-${themeId}.svg`
    if (themeId === 'bear') {
      href = '/icon.svg'
    } else if (themeId === 'custom') {
      const svg = generateFaviconSvg('custom', customConfig)
      href = `data:image/svg+xml,${encodeURIComponent(svg)}`
    } else if (!THEME_FAVICON_CONFIGS[themeId]) {
      href = '/icon.svg'
    }

    let link = document.querySelector("link[rel*='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.type = 'image/svg+xml'
    link.href = href
  } catch (err) {
    console.warn('Lỗi cập nhật favicon theme:', err)
  }
}
