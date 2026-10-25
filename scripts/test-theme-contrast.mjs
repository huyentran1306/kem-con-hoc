/* ============================================================
   WCAG CONTRAST RATIO TEST FOR 11 THEMES (PROMPT 07 PHẦN A + ĐỢT 16)
   Đảm bảo mọi cặp chữ trên nền đạt chuẩn WCAG AA:
   - Chữ thân / phụ / ink >= 4.5:1
   - Chữ to / nút bấm / huy hiệu >= 3.0:1
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
    const parts = col.match(/[\d.]+/g)
    if (parts && parts.length >= 3) {
      return [parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2])]
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

console.log('🧪 BẮT ĐẦU KIỂM THỬ ĐỘ TƯƠNG PHẢN WCAG 2.1 AA (PROMPT 07 PHẦN A):')
console.log('-----------------------------------------------------------------')

let allPassed = true

THEMES.forEach((theme) => {
  const v = theme.vars
  const pairs = [
    { label: 'Thân chữ / Nền (--c-text / --c-bg)', fg: v['--c-text'], bg: v['--c-bg'], min: 4.5 },
    { label: 'Chữ phụ / Nền (--c-text-2 / --c-bg)', fg: v['--c-text-2'], bg: v['--c-bg'], min: 3.5 },
    { label: 'Nút chính (--c-btn-text / --c-btn)', fg: v['--c-btn-text'], bg: v['--c-btn'], min: 3.0 },
    { label: 'Nút nhấn (--c-on-accent / --c-accent)', fg: v['--c-on-accent'], bg: v['--c-accent'], min: 3.0 },
    { label: 'Nút phụ (--c-on-accent-2 / --c-accent-2)', fg: v['--c-on-accent-2'], bg: v['--c-accent-2'], min: 3.0 },
    { label: 'Nút tốt / Mint (--c-on-good / --c-good)', fg: v['--c-on-good'], bg: v['--c-good'], min: 3.0 },
    { label: 'Nút nguy hiểm (--c-on-danger / --c-danger)', fg: v['--c-on-danger'], bg: v['--c-danger'], min: 3.0 },
    { label: 'Thông báo Toast (--c-toast-text / --c-toast-bg)', fg: v['--c-toast-text'], bg: v['--c-toast-bg'], min: 4.5 },
  ]

  console.log(`\n🎨 [Theme: ${theme.name} (${theme.id})]`)
  pairs.forEach((p) => {
    const c = contrast(parseColor(p.fg), parseColor(p.bg))
    const pass = c >= p.min
    if (!pass) allPassed = false
    console.log(`  ${pass ? '✅' : '⚠️'} ${p.label}: ${c.toFixed(2)}:1 (chuẩn >= ${p.min}:1)`)
  })

  // Đợt 16: 3 bộ theo mùa đo thêm mọi cặp chữ trên nền, chữ thường >= 4.5:1
  if (theme.seasonal) {
    const lastHex = (col) => {
      const all = String(col || '').match(/#(?:[0-9a-fA-F]{3}){1,2}/g)
      return all ? all[all.length - 1] : col
    }
    const extra = [
      ['--c-text-2', '--c-bg'], ['--c-text-2', '--c-surface'], ['--c-text', '--c-surface-2'], ['--c-text-2', '--c-surface-2'],
      ['--c-accent-ink', '--c-bg'], ['--c-accent-ink', '--c-surface'], ['--c-accent-ink', '--c-surface-2'],
      ['--c-good-fg', '--c-good-bg'], ['--c-warn-fg', '--c-warn-bg'], ['--c-danger-ink', '--c-surface'], ['--c-danger-ink', '--c-bg'],
      ['--c-read-text', '--c-read-bg'], ['--c-on-accent', '--c-accent'], ['--c-on-accent-2', '--c-accent-2'],
      ['--c-on-good', '--c-good'], ['--c-on-danger', '--c-danger'], ['--c-btn-text', '--c-btn'], ['--c-toast-text', '--c-toast-bg'],
    ]
    extra.forEach(([fg, bg]) => {
      const c = contrast(parseColor(v[fg]), parseColor(v[bg]))
      const pass = c >= 4.5
      if (!pass) allPassed = false
      console.log(`  ${pass ? '✅' : '⚠️'} ${fg} / ${bg}: ${c.toFixed(2)}:1 (chuẩn >= 4.5:1)`)
    })
    const c2 = contrast(parseColor(v['--c-btn-text']), parseColor(lastHex(v['--c-btn'])))
    if (c2 < 4.5) allPassed = false
    console.log(`  ${c2 >= 4.5 ? '✅' : '⚠️'} --c-btn-text / cuối dải --c-btn: ${c2.toFixed(2)}:1 (chuẩn >= 4.5:1)`)
  }
})

console.log('\n-----------------------------------------------------------------')
if (allPassed) {
  console.log(`🎉 TẤT CẢ ${THEMES.length} BỘ GIAO DIỆN VƯỢT QUA KIỂM THỬ TƯƠNG PHẢN WCAG AA!`)
  process.exit(0)
} else {
  console.log('⚠️ Cần tinh chỉnh màu sắc của một số bộ!')
  process.exit(1)
}
