/* ============================================================
   KÈM CON HỌC — TEST SUITE CHO TỰ THIẾT KẾ (PROMPT 09)
   ============================================================ */

import {
  CUSTOM_COLORS,
  CUSTOM_FONTS,
  CUSTOM_SHAPES,
  CUSTOM_BUDDIES,
  deriveCustomThemeVars,
} from '../src/themes/customPalette.js'
import { encodeThemeCode, decodeThemeCode } from '../src/themes/customThemeCode.js'
import { BUDDY_QUOTES } from '../src/themes/buddies/buddyQuotes.js'

let passed = 0
let failed = 0

function assert(cond, msg) {
  if (cond) {
    console.log(`✅ PASS: ${msg}`)
    passed++
  } else {
    console.error(`❌ FAIL: ${msg}`)
    failed++
  }
}

// Hàm tính luminance và contrast WCAG
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return [0, 0, 0]
  const clean = hex.replace('#', '')
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ]
  }
  return [
    parseInt(clean.slice(0, 2), 16) || 0,
    parseInt(clean.slice(2, 4), 16) || 0,
    parseInt(clean.slice(4, 6), 16) || 0,
  ]
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrastRatio(hex1, hex2) {
  const [r1, g1, b1] = hexToRgb(hex1)
  const [r2, g2, b2] = hexToRgb(hex2)
  const l1 = getLuminance(r1, g1, b1)
  const l2 = getLuminance(r2, g2, b2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

console.log('🧪 BẮT ĐẦU KIỂM THỬ BỘ TỰ THIẾT KẾ (PROMPT 09):')
console.log('------------------------------------------------------------')

// --- 1. Kiểm thử bảng màu 16 tổ hợp (8 màu x 2 chế độ) ---
console.log('\n--- 1. Kiểm thử 16 tổ hợp màu x nền WCAG AA ---')
for (const color of CUSTOM_COLORS) {
  for (const mode of ['light', 'dark']) {
    const vars = deriveCustomThemeVars({ color: color.id, mode })
    assert(Boolean(vars['--c-bg'] && vars['--c-text'] && vars['--c-accent']), `Tổ hợp ${color.id} x ${mode} có đủ biến`)

    // Tính contrast text trên bg (chuẩn body >= 4.5:1)
    const ratio = getContrastRatio(vars['--c-text'], vars['--c-bg'])
    assert(ratio >= 4.5, `Độ tương phản chữ trên nền (${color.id} x ${mode}): ${ratio.toFixed(2)}:1 >= 4.5:1`)
  }
}

// --- 2. Kiểm thử mã hoá & giải mã mã 6 ký tự XXX-XXX (Prompt 09 Mục 5) ---
console.log('\n--- 2. Kiểm thử mã hoá 6 ký tự (Roundtrip & Checksum) ---')

const sampleConfig = {
  v: 1,
  color: 'honey',
  mode: 'light',
  font: 'round',
  shape: 'soft',
  buddy: 'unicorn',
  icons: 'auto',
}

const code = encodeThemeCode(sampleConfig)
assert(typeof code === 'string' && code.length === 7 && code.includes('-'), `Mã hợp lệ định dạng XXX-XXX: ${code}`)

const decoded = decodeThemeCode(code)
assert(decoded !== null, 'Giải mã thành công')
assert(decoded.color === sampleConfig.color, `Khớp màu: ${decoded.color}`)
assert(decoded.mode === sampleConfig.mode, `Khớp nền: ${decoded.mode}`)
assert(decoded.font === sampleConfig.font, `Khớp font: ${decoded.font}`)
assert(decoded.shape === sampleConfig.shape, `Khớp shape: ${decoded.shape}`)
assert(decoded.buddy === sampleConfig.buddy, `Khớp buddy: ${decoded.buddy}`)

// Test gõ sai 1 ký tự -> checksum báo lỗi ngay
const brokenCode = code.slice(0, 6) + (code[6] === 'A' ? 'B' : 'A')
const brokenDecoded = decodeThemeCode(brokenCode)
assert(brokenDecoded === null, 'Gõ sai ký tự kiểm tra bị từ chối ngay (null)')

// --- 3. Kiểm thử 7 bạn đồng hành & thư viện lời thoại (Prompt 09 Mục 3) ---
console.log('\n--- 3. Kiểm thử 7 bạn đồng hành và lời thoại ---')
const buddiesWithQuotes = ['bear', 'cloud', 'unicorn', 'dragon', 'cat', 'star', 'sprout']
for (const b of buddiesWithQuotes) {
  const quotes = BUDDY_QUOTES[b]
  assert(Boolean(quotes), `Bạn ${b} có thư viện lời thoại`)
  assert(Boolean(quotes.hello && quotes.nudge && quotes.cheer), `Bạn ${b} có đủ 3 trạng thái (hello, nudge, cheer)`)
}

console.log('------------------------------------------------------------')
console.log(`🏁 TỔNG KẾT: ${passed} PASS, ${failed} FAIL`)
if (failed === 0) {
  console.log('🎉 TẤT CẢ CÁC BÀI TEST TỰ THIẾT KẾ (PROMPT 09) ĐÃ VƯỢT QUA 100%!')
  process.exit(0)
} else {
  console.error('💥 CÓ LỖI XẢY RA TRONG TEST SUITE!')
  process.exit(1)
}
