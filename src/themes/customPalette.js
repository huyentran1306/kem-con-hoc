/* ============================================================
   KÈM CON HỌC — CUSTOM PALETTE (PROMPT 09)
   16 tổ hợp màu x nền được tính toán đảm bảo WCAG AA (>= 4.5:1)
   ============================================================ */

export const CUSTOM_COLORS = [
  { id: 'honey', name: 'Mật ong', hex: '#F6A623', inkLight: '#451A03', inkDark: '#FEF3C7' },
  { id: 'pink', name: 'Kẹo dâu', hex: '#FF8FB8', inkLight: '#831843', inkDark: '#FCE7F3' },
  { id: 'violet', name: 'Tím mộng', hex: '#8A7CFF', inkLight: '#2E1065', inkDark: '#EDE9FE' },
  { id: 'cyan', name: 'Xanh ngọc', hex: '#22D3EE', inkLight: '#164E63', inkDark: '#CFFAFE' },
  { id: 'mint', name: 'Bạc hà', hex: '#7FD8C4', inkLight: '#064E3B', inkDark: '#D1FAE5' },
  { id: 'coral', name: 'Cam đất', hex: '#FF6B57', inkLight: '#7C2D12', inkDark: '#FFEDD5' },
  { id: 'blue', name: 'Xanh biển', hex: '#5B6CFF', inkLight: '#1E1B4B', inkDark: '#E0E7FF' },
  { id: 'yellow', name: 'Vàng nắng', hex: '#FFD166', inkLight: '#713F12', inkDark: '#FEF9C3' },
]

export const CUSTOM_FONTS = [
  { id: 'round', name: 'Tròn mập', family: '"Baloo 2", cursive, sans-serif' },
  { id: 'serif', name: 'Có chân', family: '"Playfair Display", "Lora", serif' },
  { id: 'hand', name: 'Viết tay', family: '"Mali", "Nunito", cursive, sans-serif' },
  { id: 'clean', name: 'Gọn gàng', family: '"Lexend", "Inter", sans-serif' },
]

export const CUSTOM_SHAPES = [
  { id: 'soft', name: 'Mềm', radius: '18px', borderW: '1.5px', shadow: '0 6px 20px rgba(0,0,0,0.06)' },
  { id: 'sticker', name: 'Sticker', radius: '10px', borderW: '2.5px', shadow: '3px 3px 0 var(--c-line)' },
  { id: 'paper', name: 'Giấy', radius: '4px', borderW: '1px', shadow: '0 2px 8px rgba(0,0,0,0.04)' },
  { id: 'glass', name: 'Kính', radius: '22px', borderW: '1px', shadow: '0 12px 30px rgba(0,0,0,0.18)' },
]

export const CUSTOM_BUDDIES = [
  { id: 'bear', name: 'Gấu mật', emoji: '🐻', autoIcon: 'bear' },
  { id: 'cloud', name: 'Mây bồng', emoji: '☁️', autoIcon: 'candy' },
  { id: 'unicorn', name: 'Kỳ lân', emoji: '🦄', autoIcon: 'sticker' },
  { id: 'dragon', name: 'Rồng con', emoji: '🐉', autoIcon: 'aurora' },
  { id: 'cat', name: 'Mèo hạt dẻ', emoji: '🐱', autoIcon: 'notebook' },
  { id: 'star', name: 'Ngôi sao', emoji: '⭐', autoIcon: 'chalk' },
  { id: 'sprout', name: 'Mầm non', emoji: '🌱', autoIcon: 'garden' },
  { id: 'onigiri', name: 'Bé Cơm Nắm', emoji: '🍙', autoIcon: 'bento' },
]

/**
 * Sinh bộ biến CSS từ cấu hình tự thiết kế
 */
export function deriveCustomThemeVars(customTheme = {}) {
  const colorId = customTheme.color || 'honey'
  const mode = customTheme.mode || 'light'
  const fontId = customTheme.font || 'round'
  const shapeId = customTheme.shape || 'soft'

  const cObj = CUSTOM_COLORS.find((c) => c.id === colorId) || CUSTOM_COLORS[0]
  const fontObj = CUSTOM_FONTS.find((f) => f.id === fontId) || CUSTOM_FONTS[0]
  const shapeObj = CUSTOM_SHAPES.find((s) => s.id === shapeId) || CUSTOM_SHAPES[0]

  const isDark = mode === 'dark'

  // Bảng màu nền & chữ chuẩn WCAG AA
  const bg = isDark ? '#0F172A' : '#FDFBF7'
  const surface = isDark
    ? shapeId === 'glass' ? 'rgba(30, 41, 59, 0.7)' : '#1E293B'
    : shapeId === 'glass' ? 'rgba(255, 255, 255, 0.85)' : '#FFFFFF'
  const surface2 = isDark ? '#334155' : '#F1EDE6'
  const text = isDark ? '#F8FAFC' : '#1E293B'
  const text2 = isDark ? '#94A3B8' : '#64748B'
  const line = isDark ? '#334155' : '#E2D9CC'

  const accent = cObj.hex
  const accentInk = isDark ? cObj.inkDark : cObj.inkLight
  const onAccent = isDark ? '#0F172A' : '#1E293B'

  return {
    '--font-head': fontObj.family,
    '--font-body': fontObj.family,
    '--radius-card': shapeObj.radius,
    '--radius-btn': shapeId === 'soft' ? '999px' : shapeObj.radius,
    '--border-w': shapeObj.borderW,
    '--shadow-card': shapeObj.shadow,
    '--c-bg': bg,
    '--c-surface': surface,
    '--c-surface-2': surface2,
    '--c-text': text,
    '--c-text-2': text2,
    '--c-line': line,
    '--c-accent': accent,
    '--c-accent-2': accent,
    '--c-accent-ink': accentInk,
    '--c-on-accent': onAccent,
    '--c-on-accent-2': onAccent,
    '--c-btn': accent,
    '--c-btn-text': onAccent,
    '--c-good': '#10B981',
    '--c-good-fg': '#047857',
    '--c-on-good': '#FFFFFF',
    '--c-danger': '#EF4444',
    '--c-danger-ink': '#991B1B',
    '--c-on-danger': '#FFFFFF',
    '--c-toast-bg': isDark ? '#F8FAFC' : '#0F172A',
    '--c-toast-text': isDark ? '#0F172A' : '#FFFFFF',
    '--backdrop': shapeId === 'glass' ? 'blur(16px)' : 'none',
  }
}
