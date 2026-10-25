/* ============================================================
   ĐỢT 16 · KIỂM THỬ ĐĂNG KÝ 3 BỘ THEO MÙA (chặng 1, 2, 5, 6)
   Biến màu, font chỉ tải khi dùng, icon thanh tab, linh vật, hạt hiệu ứng,
   tắt chuyển động, tương phản chữ trên đầu màn, admin, không dấu gạch dài.
   Chạy: TZ=Asia/Ho_Chi_Minh node scripts/test-dot16-themes.mjs
   ============================================================ */
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { THEMES, SEASONAL_THEMES, REGULAR_THEMES, getTheme } from '../src/themes.js'
import { BUILTIN_THEME_SPECS } from '../src/themes/adminThemeSpec.js'
import { SEASON_ICON_BODIES, seasonSpriteMarkup } from '../src/themes/seasonIcons.js'
import { hasBuddyArt, buddyInnerSVG, BUDDY_NAMES } from '../src/themes/buddies/buddyArt.js'
import { BUDDY_QUOTES } from '../src/themes/buddies/buddyQuotes.js'
import { particlePlan, MAX_PARTICLES } from '../src/seasons/seasonLogic.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8')
let n = 0
const ok = (name, fn) => {
  fn()
  n++
  console.log(`  ✓ ${name}`)
}

const SPEC_VARS = ['--c-bg', '--c-surface', '--c-surface-2', '--c-line', '--c-text', '--c-text-2', '--c-accent', '--c-on-accent', '--c-accent-2', '--c-on-accent-2', '--c-accent-ink', '--c-good', '--c-on-good', '--c-good-bg', '--c-good-fg', '--c-warn', '--c-warn-bg', '--c-warn-fg', '--c-danger', '--c-on-danger', '--c-danger-ink', '--c-read-bg', '--c-read-text', '--c-toast-bg', '--c-toast-text', '--c-btn', '--c-btn-text']
/* Giá trị chốt trong bản vẽ, mục "Biến màu" */
const DRAWN = {
  noel: { '--c-bg': '#F3F8FC', '--c-text': '#17324A', '--c-accent': '#C8283F', '--c-accent-2': '#1E6B4C', '--c-read-bg': '#FFF8E6', '--c-read-text': '#3A2A10', '--c-btn': 'linear-gradient(#CC2C44, #B8213A)' },
  tet: { '--c-bg': '#FFF5E6', '--c-text': '#4A1A0C', '--c-accent': '#C8102E', '--c-accent-2': '#E9A800', '--c-read-bg': '#B00E28', '--c-read-text': '#FFE7A3', '--c-btn': 'linear-gradient(#CE1C36, #B50F2A)' },
  thieunhi: { '--c-bg': '#F2F8FF', '--c-text': '#1D2340', '--c-accent': '#2F62E0', '--c-accent-2': '#FF9F1C', '--c-read-bg': '#FFF6D6', '--c-read-text': '#1D2340', '--c-btn': 'linear-gradient(#3069EA, #2A56C6)' },
}

function lum(hex) {
  const c = hex.replace('#', '')
  const rgb = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

console.log('Chặng 1 · Đăng ký 3 bộ')
ok('Hệ có 11 bộ: 8 thường ngày và 3 theo mùa đúng mã, đúng tên', () => {
  assert.equal(THEMES.length, 11)
  assert.equal(REGULAR_THEMES.length, 8)
  assert.deepEqual(SEASONAL_THEMES.map((t) => [t.id, t.name]), [['noel', 'Đêm Tuyết'], ['tet', 'Xuân Sum Vầy'], ['thieunhi', 'Cầu Vồng 1/6']])
  assert.equal(BUILTIN_THEME_SPECS.length, 8, 'trình thiết kế admin vẫn giữ 8 bộ gốc')
})
ok('Mỗi bộ theo mùa đủ 27 biến chính, khớp giá trị trong bản vẽ', () => {
  for (const t of SEASONAL_THEMES) {
    for (const k of SPEC_VARS) assert.ok(t.vars[k], `${t.id} thiếu ${k}`)
    for (const [k, v] of Object.entries(DRAWN[t.id])) assert.equal(t.vars[k], v, `${t.id} ${k}`)
  }
})
ok('themes.css có khối [data-theme] đủ mọi biến như 8 bộ hiện có', () => {
  const css = read('src/themes.css')
  const block = (id) => {
    const i = css.indexOf(`[data-theme="${id}"] {`)
    assert.ok(i >= 0, `thiếu khối ${id}`)
    return css.slice(i, css.indexOf('}', i))
  }
  const bearVars = [...block('bear').matchAll(/(--[\w-]+):/g)].map((m) => m[1])
  for (const t of SEASONAL_THEMES) {
    const b = block(t.id)
    for (const k of bearVars) assert.ok(b.includes(`${k}:`), `${t.id} thiếu ${k} trong themes.css`)
    for (const k of SPEC_VARS) assert.ok(b.includes(`${k}: ${t.vars[k]};`), `${t.id} ${k} lệch với themes.js`)
    assert.ok(b.includes('--font-greet:'))
  }
})
ok('Font: Pacifico, Lobster, Baloo 2 + Itim chỉ nằm trong bộ của mình, có subset tiếng Việt', () => {
  assert.ok(getTheme('noel').googleFont.startsWith('Pacifico') && getTheme('noel').googleFont.includes('Nunito'))
  assert.ok(getTheme('tet').googleFont.startsWith('Lobster') && getTheme('tet').googleFont.includes('Be+Vietnam+Pro'))
  assert.ok(getTheme('thieunhi').googleFont.includes('Baloo+2') && getTheme('thieunhi').googleFont.includes('Itim'))
  const bear = getTheme('bear').googleFont
  for (const f of ['Pacifico', 'Lobster', 'Baloo', 'Itim']) assert.ok(!bear.includes(f), `bộ Bạn Gấu không tải ${f}`)
  const src = read('src/themes.js')
  assert.ok(src.includes('&subset=vietnamese&display=swap'))
  assert.ok(!/Pacifico|Lobster/.test(read('index.html')), 'index.html không nạp sẵn font Noel, Tết')
})
ok('Bộ icon thanh tab: 3 bộ × 4 icon thành <symbol>, màu đọc từ biến --if --is --ip --ia --ic --iw --io', () => {
  for (const id of ['noel', 'tet', 'thieunhi']) {
    assert.deepEqual(Object.keys(SEASON_ICON_BODIES[id]), ['home', 'game', 'report', 'child'])
    const all = Object.values(SEASON_ICON_BODIES[id]).join('')
    for (const v of ['--is', '--if', '--ip', '--ia', '--iw', '--io']) assert.ok(all.includes(`var(${v},`), `${id} chưa dùng ${v}`)
  }
  const sprite = seasonSpriteMarkup()
  assert.equal((sprite.match(/<symbol /g) || []).length, 12)
  const css = read('src/themes.css')
  for (const id of ['noel', 'tet', 'thieunhi']) assert.ok(new RegExp(`\\[data-theme="${id}"\\] \\.kch-si \\{ --is: [^;]+; --iw: 1\\.6; --if: [^;]+; --io: 1; --ip: [^;]+; --ia: [^;]+; --ic: [^;]+; \\}`).test(css))
  assert.ok(read('src/themes/themeIcons.jsx').includes('<use href={`#${seasonSymbolId(t, tab)}`} />'))
})
ok('Linh vật: Người Tuyết Bông, Bé Lân, Diều Cầu Vồng có hình, tên, lời thoại; gắn theo bộ', () => {
  for (const id of ['snowman', 'lion', 'kite']) {
    assert.ok(hasBuddyArt(id))
    assert.ok(buddyInnerSVG(id, 'cheer').length > 500)
    assert.ok(BUDDY_QUOTES[id].hello && BUDDY_QUOTES[id].nudge && BUDDY_QUOTES[id].cheer)
  }
  assert.equal(BUDDY_NAMES.snowman, 'Người Tuyết Bông')
  assert.ok(read('src/themes/buddies/buddySvgs.jsx').includes("const SEASON_BUDDIES = { noel: 'snowman', tet: 'lion', thieunhi: 'kite' }"))
})
ok('Tương phản chữ trên đầu màn (nền đậm) của 3 bộ đạt >= 4.5:1', () => {
  const pairs = [
    ['#FFFFFF', '#14304A'], ['#DCE8F3', '#2B5A80'], ['#DCE8F3', '#14304A'],
    ['#FFF5D6', '#C8102E'], ['#FFE7A3', '#C8102E'], ['#FFE7A3', '#B00E28'], ['#F6C344', '#8E0A20'],
    ['#FFFFFF', '#2F62E0'], ['#FFFFFF', '#2A56C6'],
  ]
  for (const [fg, bg] of pairs) assert.ok(ratio(fg, bg) >= 4.5, `${fg} trên ${bg}: ${ratio(fg, bg).toFixed(2)}`)
})

console.log('Chặng 2 · Thành phần đặc trưng và hiệu ứng nền')
ok('Khe màn chính của 3 bộ đã đăng ký (theo dõi học đều + nút bắt đầu)', () => {
  const reg = read('src/themes/slots/registry.js')
  for (const k of ['NoelStudyTracker', 'TetStudyTracker', 'ThieunhiStudyTracker', 'NoelStartAction', 'TetStartAction', 'ThieunhiStartAction']) assert.ok(reg.includes(`: ${k},`), k)
  const slots = read('src/themes/slots/seasonSlots.jsx')
  assert.ok(slots.includes('season-advent') && slots.includes('season-branch') && slots.includes('season-balls'))
})
ok('Hạt hiệu ứng: tối đa 24 mỗi màn, chỉ màn chính và Xong bài, không có ở màn Hỏi con, tắt khi chuyển động Tắt', () => {
  assert.equal(MAX_PARTICLES, 24)
  for (const id of ['noel', 'tet', 'thieunhi']) {
    for (const screen of ['home', 'done', 'scaffold', 'report', 'profile']) {
      for (const motion of ['full', 'light', 'off']) {
        const total = particlePlan(id, screen, motion).reduce((s, l) => s + l.count, 0)
        assert.ok(total <= 24, `${id}/${screen}/${motion}: ${total}`)
        if (screen === 'scaffold' || motion === 'off' || !['home', 'done'].includes(screen)) assert.equal(total, 0, `${id}/${screen}/${motion} phải 0`)
        else assert.ok(total > 0)
      }
    }
  }
  assert.equal(particlePlan('bear', 'home', 'full').length, 0)
  assert.ok(particlePlan('tet', 'done').some((l) => l.kind === 'fw'), 'Tết có pháo hoa ánh sáng ở Xong bài')
  const src = read('src/seasons/SeasonParticles.jsx')
  assert.ok(src.includes('document.hidden') && src.includes('prefers-reduced-motion: reduce'))
  assert.ok(src.includes('if (!items.length) return null'), 'không render phần tử nào khi tắt')
})
ok('CSS: hạt nằm sau chữ, tắt hẳn khi giảm chuyển động, pháo hoa chỉ là vòng sáng', () => {
  const css = read('src/seasons/seasons.css')
  assert.ok(/\.season-fx \{[^}]*z-index: 0;/.test(css))
  assert.ok(/\[data-theme="noel"\] \.app > \.scroll[\s\S]*?z-index: 1;/.test(css))
  assert.ok(/\[data-motion="off"\] \.season-fx \{ display: none !important; \}/.test(css))
  assert.ok(/@media \(prefers-reduced-motion: reduce\) \{\s*\.season-fx \{ display: none !important; \}/.test(css))
  assert.ok(css.includes('[data-season-screen="done"]') && css.includes('text-shadow: 0 0 6px var(--c-bg)'), 'chữ màn Xong bài có quầng nền')
  assert.ok(!/audio|\.mp3|\.wav/i.test(read('src/seasons/SeasonParticles.jsx')), 'không có tiếng nổ')
})
ok('Màn Hỏi con và Xong bài có linh kiện của bộ (dây đèn, lồng đèn, bậc cầu vồng; cây thông, lì xì, huy hiệu)', () => {
  const sp = read('src/seasons/SeasonStepProgress.jsx')
  assert.ok(sp.includes('NoelLights') && sp.includes('TetLanterns') && sp.includes('RainbowSteps'))
  const da = read('src/seasons/SeasonDoneArt.jsx')
  assert.ok(da.includes('NOEL_TREE_SVG') && da.includes('Chăm chỉ') && da.includes('Ngày của con') && da.includes('Mở lời khen của'))
  const sc = read('src/screens.jsx')
  assert.ok(sc.includes('<SeasonStepProgress total={steps.length} current={step} />'))
  assert.ok(sc.includes('<SeasonDoneArt />') && sc.includes("add('season', false, <SeasonHomeLayer />)"))
  assert.ok(read('src/App.jsx').includes('<SeasonParticles themeId={S.theme || \'bear\'} motion={S.motion || \'full\'} screen={screen} />'))
})

console.log('Chặng 3, 5 · Bảng chọn và admin')
ok('Bảng chọn giao diện: nhóm Theo mùa ở trên nhóm Thường ngày, có nhãn Đang mùa / Từ ngày / Bộ cũ', () => {
  const src = read('src/ThemePickerSheet.jsx')
  assert.ok(src.indexOf('THEO MÙA') > 0 && src.indexOf('THEO MÙA') < src.indexOf('THƯỜNG NGÀY'))
  assert.ok(src.includes('seasonTag(') && src.includes('Bộ cũ') && src.includes('pickThemePatch('))
})
ok('Admin: nhóm Theo mùa có xem trước 2 màn, công tắc, khung ngày, bảng ngày Tết, số gia đình, xem toàn màn, không xoá', () => {
  const src = read('src/seasons/AdminSeasonsGroup.jsx')
  for (const k of ['ThemeTwoScreenPreview', 'role="switch"', 'Ngày mùng 1 Tết theo năm', 'gia đình đang dùng', 'Xem trước toàn màn', 'Không xoá', "'/api/v1/admin/seasons'", "method: 'PUT'"]) assert.ok(src.includes(k), k)
  assert.ok(!src.includes('/db/'), 'không ghi qua /db/*')
  const sec = read('src/AdminThemesSection.jsx')
  assert.ok(sec.includes('export function AdminThemesSection({ token, adminProfile })'))
  assert.ok(sec.includes('<AdminSeasonsGroup />') && sec.includes('ThemeTwoScreenPreview'))
})
ok('Trang Giao diện app không còn nhãn nội bộ (Prompt 10), (Màn 1), (Prompt 09)', () => {
  const txt = read('src/AdminThemesSection.jsx') + read('src/AdminThemeDesignerTab.jsx')
  const visible = txt.split('\n').filter((l) => !/^\s*(\/\/|\/\*|\*)/.test(l) && !l.includes('{/*')).join('\n')
  for (const lbl of ['(Prompt 10)', '(Màn 1)', '(Màn 2)', '(Màn 3)', '(Màn 4)', '(Prompt 09)']) assert.ok(!visible.includes(lbl), lbl)
})

console.log('Chặng 6 · Câu chữ')
ok('Không có dấu gạch dài trong chữ hiển thị của các file đợt 16', () => {
  const files = ['src/seasons/seasonLogic.js', 'src/seasons/SeasonHomeLayer.jsx', 'src/seasons/SeasonDoneArt.jsx', 'src/seasons/SeasonStepProgress.jsx', 'src/seasons/SeasonParticles.jsx', 'src/seasons/AdminSeasonsGroup.jsx', 'src/seasons/seasons.css', 'src/themes/slots/seasonSlots.jsx', 'src/themes/seasonIcons.js', 'src/themes/ThemeTwoScreenPreview.jsx']
  for (const f of files) assert.ok(!/[—–]/.test(read(f)), f)
  for (const t of SEASONAL_THEMES) assert.ok(!/[—–]/.test(t.name + t.desc), t.id)
})

console.log(`\n✅ test-dot16-themes: ${n} kiểm thử đạt`)
