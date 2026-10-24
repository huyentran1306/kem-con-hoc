/* ============================================================
   WCAG CONTRAST RATIO TEST FOR 8 THEMES
   Đảm bảo chữ thân trên nền >= 4.5:1 (WCAG AA), nút bấm >= 3.0:1
   ============================================================ */
import { THEMES } from '../src/themes.js'

function hexToRgb(hex) {
  let c = hex.replace('#', '')
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('')
  }
  const num = parseInt(c, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function parseColor(col) {
  if (!col) return [255, 255, 255]
  if (col.startsWith('#')) return hexToRgb(col)
  if (col.startsWith('rgba(')) {
    const parts = col.match(/\d+/g)
    if (parts && parts.length >= 3) {
      return [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])]
    }
  }
  if (col.includes('linear-gradient') || col.includes('radial-gradient')) {
    const m = col.match(/#(?:[0-9a-fA-F]{3}){1,2}/)
    if (m) return hexToRgb(m[0])
    return [255, 143, 184]
  }
  return [255, 255, 255]
}

function luminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

function contrast(rgb1, rgb2) {
  const lum1 = luminance(...rgb1)
  const lum2 = luminance(...rgb2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

console.log('🧪 BẮT ĐẦU KIỂM THỬ ĐỘ TƯƠNG PHẢN WCAG CHO 8 BỘ GIAO DIỆN:')
console.log('---------------------------------------------------------')

let allPassed = true

THEMES.forEach((theme) => {
  const v = theme.vars
  const bg = parseColor(v['--c-bg'])
  const text = parseColor(v['--c-text'])
  const btnBg = parseColor(v['--c-btn'])
  const btnText = parseColor(v['--c-btn-text'])

  const textContrast = contrast(bg, text)
  const btnContrast = contrast(btnBg, btnText)

  const textPass = textContrast >= 4.5
  const btnPass = btnContrast >= 3.0

  if (!textPass || !btnPass) allPassed = false

  console.log(`[Theme: ${theme.name} (${theme.id})]`)
  console.log(`  - Thân chữ / Nền: ${textContrast.toFixed(2)}:1 ${textPass ? '✅ PASS (>=4.5:1)' : '⚠️ FAIL'}`)
  console.log(`  - Nút bấm / Chữ nút: ${btnContrast.toFixed(2)}:1 ${btnPass ? '✅ PASS (>=3.0:1)' : '⚠️ FAIL'}`)
})

console.log('---------------------------------------------------------')
if (allPassed) {
  console.log('🎉 TẤT CẢ 8 BỘ GIAO DIỆN ĐẠT CHUẨN ĐỘ TƯƠNG PHẢN WCAG AA!')
  process.exit(0)
} else {
  console.log('⚠️ Cần tinh chỉnh màu sắc của một số bộ!')
  process.exit(1)
}
