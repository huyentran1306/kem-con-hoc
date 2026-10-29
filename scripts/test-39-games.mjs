/** scripts/test-39-games.mjs — Gói 39: tab Trò chơi (bỏ "Hôm nay ôn", Đồng hồ Lego chỉ ở Đồng hồ, UI theo bản vẽ) */
import fs from 'node:fs'
import assert from 'node:assert/strict'

const gc = fs.readFileSync('src/games/GocChoiChung.jsx', 'utf8')
const scr = fs.readFileSync('src/screens.jsx', 'utf8')
const css = fs.readFileSync('src/games.css', 'utf8')
const game = scr.slice(scr.indexOf('export function Game()'), scr.indexOf('/* ---------- CHAI / LỌ: Đo chiều cao'))
const snap = scr.slice(scr.indexOf('function SnapToyCameraSection()'), scr.indexOf('export function SnapToy()'))
let n = 0
const t = (name, fn) => { fn(); n++; console.log('  ✓ ' + name) }

t('Góc chơi chung không còn "Hôm nay ôn" và dòng "Câu hỏi bám bài… Hết N phút thì tự dừng"', () => {
  for (const s of ['Hôm nay ôn', 'card-today-focus', 'bám bài', 'thì tự dừng', 'getTodaysFocusSkill']) assert.ok(!gc.includes(s), s)
})
t('Khu "Chơi gì với đồ trong nhà?" không còn thẻ "AI ưu tiên ôn"', () => {
  assert.ok(!snap.includes('AI ưu tiên ôn'))
  assert.ok(!snap.includes('Gấu sẽ gợi ý chỗ cần ôn'))
})
t('Đồng hồ Lego chỉ hiện khi chọn đồ vật Đồng hồ; Đồng hồ chơi (đếm ngược) luôn hiện', () => {
  assert.match(game, /\{toy === 'Đồng hồ' && \(\n\s*<section className="gv-card" data-testid="card-lego-clock">/)
  assert.equal((game.match(/Đồng hồ Lego/g) || []).length, 2) // 1 chú thích + 1 tiêu đề
  assert.match(game, /data-testid="card-play-timer"/)
})
t('UI theo bản vẽ: thẻ trò chơi có tranh + nút Play, đồ vật có hình, đồng hồ số to', () => {
  assert.match(gc, /className="gc-game"/)
  assert.match(gc, /<GameArt id=\{g\.id\} \/>/)
  assert.match(snap, /<ToyIcon name=\{t\.n\} emoji=\{t\.e\} size=\{30\} \/>/)
  assert.match(css, /\.gv-clock \{[^}]*font-size: 56px/)
  assert.match(css, /\.gc-play \{[^}]*width: 44px; height: 44px/)
})
t('Màu đọc từ biến của bộ giao diện (không có mã màu viết cứng trong games.css)', () => {
  const hex = css.replace(/var\([^)]*\)/g, '').match(/#[0-9a-fA-F]{3,8}\b/g) || []
  assert.deepEqual(hex, [])
})
t('Giữ nguyên nội dung 10 trò chơi đồ vật và 3 trò Góc chơi chung', () => {
  for (const c of ['BottleGame', 'CombGame', 'PenGame', 'RulerGame', 'LegoGame', 'CandyGame', 'CardGame', 'ClockGame', 'StickGame', 'BowlGame']) assert.ok(game.includes(`<${c} />`), c)
  for (const id of ['btn-game-duel', 'btn-game-tree', 'btn-game-detective']) assert.ok(gc.includes(id), id)
})
console.log(`\nXong: ${n} kiểm tra đạt.`)
