/* ============================================================
   KÈM CON HỌC — CUSTOM THEME CODE (PROMPT 09 MỤC 5)
   Mã hoá 6 lựa chọn thành mã 6 ký tự XXX-XXX (Base32 + Checksum)
   ============================================================ */

import { CUSTOM_COLORS, CUSTOM_FONTS, CUSTOM_SHAPES, CUSTOM_BUDDIES } from './customPalette.js'

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // 32 ký tự, không có 0, O, 1, I

const ICON_SETS = ['auto', 'bear', 'candy', 'garden', 'chalk', 'bento', 'notebook', 'sticker', 'aurora']

/**
 * Mã hoá cấu hình theme thành mã XXX-XXX
 */
export function encodeThemeCode(themeObj = {}) {
  const cIdx = Math.max(0, CUSTOM_COLORS.findIndex((c) => c.id === themeObj.color))
  const mIdx = themeObj.mode === 'dark' ? 1 : 0
  const fIdx = Math.max(0, CUSTOM_FONTS.findIndex((f) => f.id === themeObj.font))
  const sIdx = Math.max(0, CUSTOM_SHAPES.findIndex((s) => s.id === themeObj.shape))
  const bIdx = Math.max(0, CUSTOM_BUDDIES.findIndex((b) => b.id === themeObj.buddy))
  const iIdx = Math.max(0, ICON_SETS.findIndex((i) => i === themeObj.icons))

  // Đóng gói số nguyên: 8 x 2 x 4 x 4 x 8 x 9 = 18,432
  let val =
    cIdx +
    mIdx * 8 +
    fIdx * 16 +
    sIdx * 64 +
    bIdx * 256 +
    iIdx * 2048

  // Chia thành 4 ký tự base32
  let chars = []
  for (let i = 0; i < 4; i++) {
    chars.push(ALPHABET[val % 32])
    val = Math.floor(val / 32)
  }

  // Thêm 1 ký tự muối ngẫu nhiên
  const salt = Math.floor(Math.random() * 32)
  chars.push(ALPHABET[salt])

  // Ký tự thứ 6 là checksum kiểm tra gõ sai
  let sum = 0
  for (let i = 0; i < 5; i++) {
    sum = (sum * 7 + ALPHABET.indexOf(chars[i]) + i) % 32
  }
  chars.push(ALPHABET[sum])

  const full = chars.join('')
  return `${full.slice(0, 3)}-${full.slice(3, 6)}`
}

/**
 * Giải mã mã XXX-XXX thành cấu hình theme
 */
export function decodeThemeCode(code = '') {
  if (!code) return null
  const cleaned = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  if (cleaned.length !== 6) return null

  // Kiểm tra checksum
  let sum = 0
  for (let i = 0; i < 5; i++) {
    const idx = ALPHABET.indexOf(cleaned[i])
    if (idx < 0) return null
    sum = (sum * 7 + idx + i) % 32
  }

  if (ALPHABET[sum] !== cleaned[5]) {
    return null // Sai checksum!
  }

  // Giải mã số nguyên
  let val = 0
  for (let i = 3; i >= 0; i--) {
    const idx = ALPHABET.indexOf(cleaned[i])
    val = val * 32 + idx
  }

  const cIdx = val % 8
  val = Math.floor(val / 8)
  const mIdx = val % 2
  val = Math.floor(val / 2)
  const fIdx = val % 4
  val = Math.floor(val / 4)
  const sIdx = val % 4
  val = Math.floor(val / 4)
  const bIdx = val % 8
  val = Math.floor(val / 8)
  const iIdx = val % 9

  return {
    v: 1,
    color: CUSTOM_COLORS[cIdx]?.id || 'honey',
    mode: mIdx === 1 ? 'dark' : 'light',
    font: CUSTOM_FONTS[fIdx]?.id || 'round',
    shape: CUSTOM_SHAPES[sIdx]?.id || 'soft',
    buddy: CUSTOM_BUDDIES[bIdx]?.id || 'unicorn',
    icons: ICON_SETS[iIdx] || 'auto',
  }
}
