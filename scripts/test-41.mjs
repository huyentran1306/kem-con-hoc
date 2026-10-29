/** scripts/test-41.mjs — Gói 41: hít thở khi bấm bình tĩnh, nút căn giữa, chụp đề trên iPhone 16, thanh trượt sticker, bài tương tự, bỏ Đồng hồ Lego */
import fs from 'node:fs'
import assert from 'node:assert/strict'

const app = fs.readFileSync('src/App.jsx', 'utf8')
const breath = fs.readFileSync('src/CalmBreath.jsx', 'utf8')
const modal = fs.readFileSync('src/CalmCornerModal.jsx', 'utf8')
const scr = fs.readFileSync('src/screens.jsx', 'utf8')
const fix = fs.readFileSync('src/themes/fix-41.css', 'utf8')
const game = scr.slice(scr.indexOf('export function Game()'), scr.indexOf('/* ---------- CHAI / LỌ: Đo chiều cao'))
let n = 0
const t = (name, fn) => { fn(); n++; console.log('  ✓ ' + name) }

t('Bấm "{Mẹ/Bố} bình tĩnh" mở bảng hít thở 4 giây vào · 4 giây ra (như bản trước)', () => {
  assert.match(breath, /export const BREATH_SECONDS = 4/)
  assert.match(breath, /'Hít vào…' : phase === 'out' \? 'Thở ra…'/)
  assert.match(app, /function CalmEntry\(props\)/)
  assert.match(app, /<CalmBreathSheet/)
  assert.match(app, /openSheet\('calm', \{ inLesson: screen === 'scaffold' \}\)/)
})
t('Góc hạ hoả: ngoài giờ học ẩn "Muộn rồi" và "Đổi vai"; "Con chưa hiểu" mở gợi ý 1 của bậc đang làm', () => {
  assert.match(modal, /CALM_REASONS\.filter\(\(r\) => inLesson \|\| r\.id !== 'late'\)/)
  assert.match(modal, /\{inLesson && steps\.length > 0 && \(/)
  assert.match(app, /stuck: Math\.max\(1, Number\(prev\.flow\?\.stuck\) \|\| 0\)/)
})
t('Mọi nút lớn btn-km-l căn giữa chữ', () => {
  assert.match(fix, /\.btn-km\.btn-km-l \{ justify-content: center !important;/)
  assert.match(fs.readFileSync('src/main.jsx', 'utf8'), /import '\.\/themes\/fix-41\.css'/)
})
t('Màn chụp đề: khung máy ảnh co theo chiều cao màn, nút chụp không đè khung', () => {
  assert.match(fix, /\.snap-screen \.cam \{ height: clamp\(220px, calc\(100dvh - 470px\), 520px\)/)
  assert.match(fix, /\.snap-screen \.shutter \{ margin: 2px auto 16px !important; \}/)
})
t('Tặng huy hiệu: thanh trượt đủ 12 sticker, sticker gợi ý đứng đầu', () => {
  assert.match(scr, /data-testid="done-sticker-rail"/)
  assert.match(scr, /AVAILABLE_STICKERS\.map\(\(x\) => x\.trait\)/)
  assert.match(scr, /return \[suggestedBadge\.trait, \.\.\.all\.filter/)
})
t('Bài tương tự: đọc được nhiều dạng dữ liệu, tự xin AI khi bài soạn không kèm, "Làm thử" có đề để xem', () => {
  assert.match(scr, /return String\(b\.de \|\| b\.de_bai \|\| b\.text/)
  assert.match(scr, /if \(hadStuckStep \|\| !lessonBroText\)/)
  assert.match(scr, /ocr: broText, text: broText/)
  assert.ok(!scr.includes("problem: {\n                        text: deText,"))
})
t('Bỏ hẳn thẻ Đồng hồ Lego (tiếng Anh) ở màn Chơi với đồ vật', () => {
  assert.ok(!game.includes('ENGLISH_PHRASES.map'))
  assert.ok(!game.includes('Đồng hồ Lego</h2>'))
})
console.log(`\nXong: ${n} kiểm tra đạt.`)
