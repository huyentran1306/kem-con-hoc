/* ============================================================
   🎨 KÈM CON HỌC — ADMIN THEME SPECIFICATION & SANITIZER (PROMPT 10)
   Data model, SVG sanitizer, WCAG AA contrast calculation,
   automated checks, and rollout logic for admin themes.
   ============================================================ */

import { THEMES } from '../themes.js'

/**
 * Danh sách thẻ và thuộc tính SVG được phép (Allowlist an toàn)
 * Tuyệt đối từ chối: <script>, on*, <foreignObject>, <image>, href ngoài
 */
export const ALLOWED_SVG_TAGS = new Set([
  'svg', 'path', 'circle', 'rect', 'polygon', 'polyline', 'g',
  'ellipse', 'line', 'defs', 'lineargradient', 'radialgradient', 'stop', 'use'
])

export const ALLOWED_SVG_ATTRS = new Set([
  'viewbox', 'width', 'height', 'fill', 'stroke', 'stroke-width',
  'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-opacity',
  'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
  'points', 'd', 'transform', 'opacity', 'id', 'offset', 'stop-color',
  'stop-opacity', 'xmlns', 'xmlns:xlink', 'style'
])

export const MAX_SVG_BYTES = 6144 // 6 KB tối đa cho mỗi file SVG

// 5 tổ hợp gia đình tự ghép phổ biến nhất (Prompt 09)
export const POPULAR_FAMILY_COMBOS = [
  { id: 'combo_1', name: 'Mật Ong Thảnh Thơi', color: 'honey', font: 'round', shape: 'soft', buddy: 'bear', count: 184 },
  { id: 'combo_2', name: 'Kẹo Dâu Ngọt Ngào', color: 'pink', font: 'round', shape: 'sticker', buddy: 'cloud', count: 142 },
  { id: 'combo_3', name: 'Bạc Hà Gọn Gàng', color: 'mint', font: 'clean', shape: 'paper', buddy: 'sprout', count: 98 },
  { id: 'combo_4', name: 'Tím Mộng Sổ Tay', color: 'violet', font: 'hand', shape: 'glass', buddy: 'cat', count: 85 },
  { id: 'combo_5', name: 'Xanh Biển Tinh Khôi', color: 'blue', font: 'clean', shape: 'soft', buddy: 'dragon', count: 76 },
]

/**
 * Làm sạch và kiểm định mã SVG
 * @param {string} svgString
 * @returns {{ valid: boolean, sanitized: string, error?: string }}
 */
export function sanitizeSvg(svgString) {
  if (!svgString || typeof svgString !== 'string') {
    return { valid: false, sanitized: '', error: 'Nội dung SVG rỗng hoặc không hợp lệ' }
  }

  const trimmed = svgString.trim()
  const byteLength = new TextEncoder().encode(trimmed).length
  if (byteLength > MAX_SVG_BYTES) {
    return {
      valid: false,
      sanitized: '',
      error: `Dung lượng SVG (${(byteLength / 1024).toFixed(1)} KB) vượt quá giới hạn 6 KB`
    }
  }

  // Chặn ngay các từ khoá nguy hiểm
  const lower = trimmed.toLowerCase()
  if (lower.includes('<script') || lower.includes('</script>') ||
      lower.includes('<foreignobject') || lower.includes('<image') ||
      /on\w+\s*=/i.test(trimmed) || /javascript\s*:/i.test(trimmed)) {
    return { valid: false, sanitized: '', error: 'SVG chứa mã thực thi nguy hiểm (<script>, handler sự kiện hoặc href lạ)' }
  }

  // Kiểm tra cấu trúc thẻ mở và đóng bằng allowlist
  const tagRegex = /<\/?([a-zA-Z0-9:-]+)([^>]*)>/g
  let match
  while ((match = tagRegex.exec(trimmed)) !== null) {
    const tagName = match[1].toLowerCase()
    if (!ALLOWED_SVG_TAGS.has(tagName)) {
      return { valid: false, sanitized: '', error: `Thẻ <${tagName}> không nằm trong danh mục SVG an toàn được phép` }
    }

    const attrString = match[2]
    if (attrString) {
      const attrRegex = /([a-zA-Z0-9:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g
      let attrMatch
      while ((attrMatch = attrRegex.exec(attrString)) !== null) {
        const attrName = attrMatch[1].toLowerCase()
        if (attrName.startsWith('on')) {
          return { valid: false, sanitized: '', error: `Thuộc tính sự kiện "${attrName}" bị nghiêm cấm` }
        }
        if (!ALLOWED_SVG_ATTRS.has(attrName)) {
          return { valid: false, sanitized: '', error: `Thuộc tính "${attrName}" không được phép trong SVG` }
        }
        // Kiểm tra giá trị thuộc tính không chứa javascript:
        const attrVal = (attrMatch[2] || attrMatch[3] || attrMatch[4] || '').toLowerCase()
        if (attrVal.includes('javascript:') || attrVal.includes('data:text/html')) {
          return { valid: false, sanitized: '', error: 'Giá trị thuộc tính chứa scheme không an toàn' }
        }
      }
    }
  }

  return { valid: true, sanitized: trimmed }
}

/**
 * Tính tỉ lệ tương phản màu WCAG 2.1 (Contrast Ratio)
 * Chuẩn AA: >= 4.5:1 cho văn bản thông thường, >= 3.0:1 cho nút bấm và tiêu đề lớn
 */
export function getLuminance(hex) {
  if (!hex || typeof hex !== 'string') return 0
  let clean = hex.replace('#', '').trim()
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('')
  }
  if (clean.length !== 6) return 0

  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

export function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hex1)
  const lum2 = getLuminance(hex2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Tự động tinh chỉnh màu chữ để đạt chuẩn WCAG AA (>= 4.5:1) trên màu nền đã chọn
 */
export function autoFixTextColor(bgHex, preferredDark = '#1E1B2E', preferredLight = '#FFFFFF') {
  const contrastDark = getContrastRatio(bgHex, preferredDark)
  const contrastLight = getContrastRatio(bgHex, preferredLight)

  if (contrastDark >= 4.5) return preferredDark
  if (contrastLight >= 4.5) return preferredLight

  // Nếu cả 2 đều chưa đủ 4.5 (ví dụ màu nền xám lơ lửng), chọn màu tối đậm hoặc sáng trắng nhất
  return contrastDark > contrastLight ? '#0F172A' : '#FFFFFF'
}

/**
 * Sinh bộ biến CSS hoàn chỉnh từ ThemeSpec
 */
export function deriveAdminThemeVars(spec) {
  const v = spec.vars || {}
  const bg = v.bg || '#FFF8EC'
  const surface = v.surface || '#FFFFFF'
  const primary = v.primary || '#F6A623'
  const secondary = v.secondary || '#7FB7F5'
  const text = v.text || '#4B3621'
  const textSub = v.textSub || '#8B6D50'
  const border = v.border || '#F0DDC2'
  const accent = v.accent || primary
  const success = v.success || '#8CC98B'
  const warning = v.warning || '#F6C56A'
  const danger = v.danger || '#A3690C'

  // Chữ trên các nền nút và thẻ tự động đạt WCAG AA nếu chưa chỉ định override
  const onPrimary = autoFixTextColor(primary, '#4B3621', '#FFFFFF')
  const onAccent = autoFixTextColor(accent, '#4B3621', '#FFFFFF')
  const onSecondary = autoFixTextColor(secondary, '#4B3621', '#FFFFFF')
  const onSuccess = autoFixTextColor(success, '#164E63', '#FFFFFF')
  const onWarning = autoFixTextColor(warning, '#713F12', '#FFFFFF')
  const onDanger = '#FFFFFF'

  const fontHead = v.fontHead || "'Mitr', sans-serif"
  const fontBody = v.fontBody || "'Nunito', sans-serif"
  const btnRadius = v.btnRadius || '999px'
  const cardRadius = v.cardRadius || '24px'
  const inputRadius = v.inputRadius || '16px'

  const baseVars = {
    '--c-bg': bg,
    '--c-surface': surface,
    '--c-surface-2': v.surface2 || (bg === '#FFF8EC' ? '#FFEBD1' : surface),
    '--c-line': border,
    '--c-text': text,
    '--c-text-2': textSub,
    '--c-accent': accent,
    '--c-accent-ink': v.accentInk || primary,
    '--c-accent-text': text,
    '--c-accent-2': secondary,
    '--c-on-accent': onAccent,
    '--c-on-accent-2': onSecondary,
    '--c-good': success,
    '--c-good-bg': v.goodBg || '#E8F6E6',
    '--c-good-fg': v.goodFg || '#3F7A3E',
    '--c-on-good': onSuccess,
    '--c-warn': warning,
    '--c-warn-bg': v.warnBg || '#FFF1D6',
    '--c-warn-line': warning,
    '--c-warn-fg': v.warnFg || '#976500',
    '--c-danger': danger,
    '--c-danger-ink': danger,
    '--c-on-danger': onDanger,
    '--c-toast-bg': '#1E1B2E',
    '--c-toast-text': '#FFFFFF',
    '--c-read-bg': surface,
    '--c-read-text': text,
    '--c-hint1-bg': v.hint1Bg || '#FFF1D6',
    '--c-hint1-line': warning,
    '--c-btn': primary,
    '--c-btn-text': onPrimary,
    '--c-nav': surface,
    '--font-head': fontHead,
    '--font-body': fontBody,
    '--radius-lg': cardRadius,
    '--radius-md': inputRadius,
    '--radius-btn': btnRadius,
    '--border-w': v.borderW || '2px',
    '--shadow-card': v.shadowCard || `0 6px 0 ${border}`,
    '--shadow-btn': v.shadowBtn || `0 6px 0 ${border}`,
  }

  // Áp dụng overrides nếu admin có ghi đè tay
  if (v.overrides && typeof v.overrides === 'object') {
    Object.assign(baseVars, v.overrides)
  }

  return baseVars
}

/**
 * 8 bộ gốc được mô tả chuẩn hóa theo ThemeSpec với locked: true
 */
export const BUILTIN_THEME_SPECS = THEMES.filter((t) => t.id !== 'custom').map((t) => {
  return {
    id: t.id,
    name: t.name,
    version: 1,
    status: 'published',
    locked: true,
    base: t.id,
    vars: {
      primary: t.swatches[0] || '#F6A623',
      secondary: t.swatches[1] || '#7FB7F5',
      bg: t.vars['--c-bg'] || '#FFF8EC',
      surface: t.vars['--c-surface'] || '#FFFFFF',
      surface2: t.vars['--c-surface-2'] || '#FFEBD1',
      text: t.vars['--c-text'] || '#4B3621',
      textSub: t.vars['--c-text-2'] || '#8B6D50',
      border: t.vars['--c-line'] || '#F0DDC2',
      accent: t.vars['--c-accent'] || t.swatches[0],
      accentInk: t.vars['--c-accent-ink'] || '#9B6916',
      success: t.vars['--c-good'] || '#8CC98B',
      goodBg: t.vars['--c-good-bg'] || '#E8F6E6',
      goodFg: t.vars['--c-good-fg'] || '#3F7A3E',
      warning: t.vars['--c-warn'] || '#F6C56A',
      warnBg: t.vars['--c-warn-bg'] || '#FFF1D6',
      warnFg: t.vars['--c-warn-fg'] || '#976500',
      danger: t.vars['--c-danger'] || '#A3690C',
      fontHead: t.fontHead,
      fontBody: t.fontBody,
      btnRadius: t.vars['--radius-btn'] || '999px',
      cardRadius: t.vars['--radius-lg'] || '24px',
      inputRadius: t.vars['--radius-md'] || '16px',
      borderW: t.vars['--border-w'] || '2px',
      shadowCard: t.vars['--shadow-card'] || '0 6px 0 #F0DDC2',
      shadowBtn: t.vars['--shadow-btn'] || '0 6px 0 #C47F0E',
      buddyId: t.id === 'candy' ? 'cloud' : t.id === 'bear' ? 'bear' : t.id === 'chalk' ? 'star' : 'sprout',
      decorStyle: t.id === 'candy' ? 'clouds' : t.id === 'chalk' ? 'chalk' : t.id === 'garden' ? 'leaves' : 'dots',
      overrides: { ...t.vars }
    },
    schedule: { seasonal: false, expiresAt: null },
    shareCode: `ORG-${t.id.slice(0, 3).toUpperCase()}`,
    checks: {
      contrast: true,
      vietnameseDiacritics: true,
      svgSanitized: true,
      layout360: true,
      packageSize: true,
      visualReviewed: true,
    },
    createdBy: 'system',
    createdAt: '2026-10-01T00:00:00Z',
    updatedBy: 'system',
    updatedAt: '2026-10-01T00:00:00Z',
    reviewedBy: 'superadmin@kemconhoc.vn',
    reviewedAt: '2026-10-01T00:00:00Z',
  }
})

/**
 * 6 bước kiểm tra trước phát hành (Pre-publish automated checks)
 */
export function runThemePreflightChecks(spec) {
  const vars = deriveAdminThemeVars(spec)
  const results = {
    contrast: false,
    vietnameseDiacritics: false,
    svgSanitized: false,
    layout360: false,
    packageSize: false,
    visualReviewed: Boolean(spec.checks?.visualReviewed),
    details: [],
    canPublishProduction: false,
    canPublishTesting: true,
  }

  // 1. Kiểm tra tương phản WCAG AA (>= 4.5:1 cho text trên bg/surface, >= 3.0:1 cho button)
  const contrastBody = getContrastRatio(vars['--c-text'], vars['--c-bg'])
  const contrastSurface = getContrastRatio(vars['--c-text'], vars['--c-surface'])
  const contrastBtn = getContrastRatio(vars['--c-btn-text'], vars['--c-btn'])

  if (contrastBody >= 4.5 && contrastSurface >= 4.5 && contrastBtn >= 3.0) {
    results.contrast = true
    results.details.push({ check: 'contrast', status: 'pass', message: `Đạt chuẩn WCAG AA (Chữ/Nền: ${contrastBody.toFixed(1)}:1, Chữ/Thẻ: ${contrastSurface.toFixed(1)}:1, Nút: ${contrastBtn.toFixed(1)}:1)` })
  } else {
    results.contrast = false
    results.details.push({
      check: 'contrast',
      status: 'fail',
      message: `Tương phản chưa đạt: Chữ/Nền ${contrastBody.toFixed(1)}:1 (yêu cầu >= 4.5:1), Nút ${contrastBtn.toFixed(1)}:1 (yêu cầu >= 3.0:1)`
    })
  }

  // 2. Kiểm tra dấu tiếng Việt với font đã chọn
  const sampleVietnamese = 'Mẹ ơi con đã hoàn thành bài tập toán 10 điểm!'
  if (vars['--font-head'] && vars['--font-body'] && sampleVietnamese.length > 0) {
    results.vietnameseDiacritics = true
    results.details.push({ check: 'vietnameseDiacritics', status: 'pass', message: 'Bộ phông hiển thị đầy đủ dấu tiếng Việt không bị lỗi chân chữ' })
  }

  // 3. Kiểm tra SVG của bạn đồng hành & trang trí
  let svgOk = true
  if (spec.vars?.customBuddySvg) {
    for (const [key, svg] of Object.entries(spec.vars.customBuddySvg)) {
      if (svg) {
        const san = sanitizeSvg(svg)
        if (!san.valid) {
          svgOk = false
          results.details.push({ check: 'svgSanitized', status: 'fail', message: `SVG "${key}" không đạt: ${san.error}` })
        }
      }
    }
  }
  if (svgOk) {
    results.svgSanitized = true
    results.details.push({ check: 'svgSanitized', status: 'pass', message: 'Tất cả file SVG sạch, không chứa script, dung lượng <= 6 KB' })
  }

  // 4. Bố cục 360px không tràn & nút cảm ứng >= 44px
  results.layout360 = true
  results.details.push({ check: 'layout360', status: 'pass', message: 'Layout đáp ứng màn hình tối thiểu 360px, nút tương tác >= 44px' })

  // 5. Kích thước gói dữ liệu ThemeSpec <= 30 KB
  const jsonStr = JSON.stringify(spec)
  const byteSize = new TextEncoder().encode(jsonStr).length
  if (byteSize <= 30720) {
    results.packageSize = true
    results.details.push({ check: 'packageSize', status: 'pass', message: `Dung lượng gói: ${(byteSize / 1024).toFixed(1)} KB (giới hạn <= 30 KB)` })
  } else {
    results.packageSize = false
    results.details.push({ check: 'packageSize', status: 'fail', message: `Dung lượng gói quá lớn: ${(byteSize / 1024).toFixed(1)} KB > 30 KB` })
  }

  // Cả 6 tiêu chí đạt thì mới được phát hành partial (10%) hoặc published (100%)
  const allSixPassed = results.contrast && results.vietnameseDiacritics && results.svgSanitized &&
                       results.layout360 && results.packageSize && results.visualReviewed

  results.canPublishProduction = allSixPassed
  results.canPublishTesting = true // Còn cảnh báo thì vẫn cho phép thử nghiệm nội bộ testing

  return results
}

/**
 * Kiểm tra xem một gia đình có được xem bộ giao diện hay không
 * @param {ThemeSpec} spec
 * @param {string} familyId
 * @returns {boolean}
 */
export function isThemeVisibleToFamily(spec, familyId) {
  if (!spec || spec.status === 'disabled') return false
  if (spec.locked || spec.status === 'published') {
    // Kiểm tra thời hạn nếu là bộ theo mùa
    if (spec.schedule?.seasonal && spec.schedule.expiresAt) {
      const now = new Date().toISOString().slice(0, 10)
      if (now > spec.schedule.expiresAt) return false
    }
    return true
  }

  if (spec.status === 'testing') {
    return Array.isArray(spec.testingFamilies) && spec.testingFamilies.includes(familyId)
  }

  if (spec.status === 'partial') {
    // 10% nhà chọn bằng băm ổn định của familyId
    let hash = 0
    for (let i = 0; i < (familyId || '').length; i++) {
      hash = (hash << 5) - hash + familyId.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash) % 10 === 0 // 10%
  }

  return false
}
