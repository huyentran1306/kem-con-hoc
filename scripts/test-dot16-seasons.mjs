/* ============================================================
   ĐỢT 16 · KIỂM THỬ CƠ CHẾ GỢI Ý THEO MÙA BẰNG NGÀY GIẢ (chặng 3, 4, 6)
   Chạy: TZ=Asia/Ho_Chi_Minh node scripts/test-dot16-seasons.mjs
   ============================================================ */
import assert from 'assert'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import * as L from '../src/seasons/seasonLogic.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
let n = 0
const ok = (name, fn) => {
  fn()
  n++
  console.log(`  ✓ ${name}`)
}

/* Mô phỏng một gia đình: state + mở app ở màn chính vào một ngày */
function family(theme = 'bear') {
  return { theme, themeBeforeSeason: null, seasonStartedKey: null, seasonAsked: [] }
}
function open(S, today, cfg, extra = {}) {
  return L.decideSeasonPrompt({ today, theme: S.theme, themeBeforeSeason: S.themeBeforeSeason, seasonStartedKey: S.seasonStartedKey, seasonAsked: S.seasonAsked, cfg, onHome: true, ...extra })
}
const apply = (S, p) => Object.assign(S, p)

console.log('Chặng 3 · Khung mùa')
ok('Giờ Việt Nam: 17:30 UTC ngày 30/11 là 1/12 ở Việt Nam', () => {
  assert.equal(L.vnToday(new Date('2026-11-30T17:30:00Z')), '2026-12-01')
  assert.equal(L.vnToday(new Date('2026-11-30T16:59:00Z')), '2026-11-30')
})
ok('Tết 2027: khung 29/1/2027 đến 15/2/2027', () => {
  const w = L.seasonWindow('tet', 2027)
  assert.equal(w.start, '2027-01-29')
  assert.equal(w.end, '2027-02-15')
})
ok('Đủ 5 năm mùng 1 Tết mặc định', () => {
  assert.deepEqual(L.DEFAULT_TET_DATES, { 2027: '2027-02-06', 2028: '2028-01-26', 2029: '2029-02-13', 2030: '2030-02-03', 2031: '2031-01-23' })
  for (const y of [2027, 2028, 2029, 2030, 2031]) {
    const w = L.seasonWindow('tet', y)
    assert.equal(L.dayNum(w.end) - L.dayNum(w.start), 17)
  }
})
ok('Noel 1/12 đến 31/12, Thiếu nhi 25/5 đến 7/6', () => {
  assert.deepEqual([L.seasonWindow('noel', 2026).start, L.seasonWindow('noel', 2026).end], ['2026-12-01', '2026-12-31'])
  assert.deepEqual([L.seasonWindow('thieunhi', 2027).start, L.seasonWindow('thieunhi', 2027).end], ['2027-05-25', '2027-06-07'])
})
ok('Khung vắt qua năm mới (admin đặt 15/12 đến 5/1) vẫn đúng', () => {
  const cfg = { noel: { start: '12-15', end: '01-05' } }
  assert.equal(L.activeWindow('noel', '2027-01-03', cfg).key, 'noel-2026')
  assert.equal(L.activeWindow('noel', '2027-01-06', cfg), null)
})
ok('Nhãn bảng chọn: "Đang mùa" và "Từ 29/1"', () => {
  assert.equal(L.seasonTag('noel', '2026-12-05'), 'Đang mùa')
  assert.equal(L.seasonTag('tet', '2026-12-05'), 'Từ 29/1')
  assert.equal(L.seasonTag('thieunhi', '2026-12-05'), 'Từ 25/5')
})

console.log('Chặng 3 · Luồng khi mẹ mở app (ngày giả)')
ok('30/11: không gợi ý', () => {
  assert.equal(open(family(), '2026-11-30'), null)
})
ok('1/12: gợi ý Đêm Tuyết đúng một lần; Để sau rồi mở lại thì không gợi ý nữa', () => {
  const S = family()
  const d = open(S, '2026-12-01')
  assert.equal(d.type, 'suggest')
  assert.equal(d.themeId, 'noel')
  assert.equal(d.key, 'noel-2026')
  apply(S, L.laterSuggestionPatch(S, d))
  assert.equal(S.theme, 'bear', 'Để sau giữ nguyên bộ đang dùng')
  assert.deepEqual(S.seasonAsked, ['noel-2026'])
  assert.equal(open(S, '2026-12-01'), null)
  assert.equal(open(S, '2026-12-20'), null)
})
ok('Thử ngay: lưu bộ cũ vào themeBeforeSeason, đổi sang bộ mùa, ghi đã hỏi', () => {
  const S = family('garden')
  const d = open(S, '2026-12-03')
  apply(S, L.acceptSuggestionPatch(S, d))
  assert.equal(S.theme, 'noel')
  assert.equal(S.themeBeforeSeason, 'garden')
  assert.equal(S.seasonStartedKey, 'noel-2026')
  assert.ok(S.seasonAsked.includes('noel-2026'))
  assert.equal(open(S, '2026-12-24'), null, 'trong mùa không hỏi gì thêm')
})
ok('Đang dùng Đêm Tuyết, ngày 1/1: hiện thẻ hết mùa; Quay lại về đúng bộ cũ; không hỏi lại', () => {
  const S = family('notebook')
  apply(S, L.acceptSuggestionPatch(S, open(S, '2026-12-01')))
  const end = open(S, '2027-01-01')
  assert.equal(end.type, 'end')
  assert.equal(end.key, 'noel-2026-end')
  assert.equal(end.previous, 'notebook')
  apply(S, L.endGoBackPatch(S, end))
  assert.equal(S.theme, 'notebook')
  assert.equal(S.themeBeforeSeason, null)
  assert.equal(open(S, '2027-01-02'), null)
})
ok('Hết mùa, chọn Giữ bộ: giữ bộ mùa, không hỏi lại', () => {
  const S = family()
  apply(S, L.acceptSuggestionPatch(S, open(S, '2026-12-01')))
  const end = open(S, '2027-01-01')
  apply(S, L.endKeepPatch(S, end))
  assert.equal(S.theme, 'noel')
  assert.equal(open(S, '2027-01-02'), null)
  assert.equal(open(S, '2027-03-01'), null)
})
ok('Tết 2027: 28/1 không gợi ý, 29/1 có, 15/2 vẫn trong mùa, 16/2 là hết mùa', () => {
  const S = family()
  S.seasonAsked = ['noel-2026']
  assert.equal(open(S, '2027-01-28'), null)
  const d = open(S, '2027-01-29')
  assert.equal(d.themeId, 'tet')
  assert.equal(d.key, 'tet-2027')
  apply(S, L.acceptSuggestionPatch(S, d))
  assert.equal(open(S, '2027-02-15'), null, '15/2 vẫn trong mùa, không hiện thẻ hết mùa')
  const end = open(S, '2027-02-16')
  assert.equal(end.type, 'end')
  assert.equal(end.previous, 'bear')
})
ok('Admin tắt bộ Tết: không gợi ý dù đang trong mùa', () => {
  assert.equal(open(family(), '2027-02-06', { tet: { enabled: false } }), null)
  assert.equal(open(family(), '2027-02-06', { tet: { enabled: true } }).themeId, 'tet')
})
ok('Chế độ Dùng thử: không gợi ý; ngoài màn chính: không gợi ý', () => {
  assert.equal(open(family(), '2026-12-01', undefined, { isTrial: true }), null)
  assert.equal(open(family(), '2026-12-01', undefined, { onHome: false }), null)
})
ok('Gia đình tự chọn bộ theo mùa ngoài khung mùa: không hỏi gì cả', () => {
  const S = family('bear')
  apply(S, L.pickThemePatch(S, 'tet', '2026-07-10'))
  assert.equal(S.theme, 'tet')
  assert.equal(S.seasonStartedKey, null)
  assert.equal(open(S, '2026-07-11'), null)
  assert.equal(open(S, '2026-12-05'), null)
})
ok('Tự chọn bộ mùa TRONG khung mùa: nhớ bộ cũ, hết mùa hỏi quay lại', () => {
  const S = family('candy')
  apply(S, L.pickThemePatch(S, 'thieunhi', '2027-05-30'))
  assert.equal(S.themeBeforeSeason, 'candy')
  assert.equal(open(S, '2027-06-07'), null)
  const end = open(S, '2027-06-08')
  assert.equal(end.type, 'end')
  assert.equal(end.previous, 'candy')
})
ok('Đổi sang bộ thường ngày trong bảng chọn: xoá dấu mùa', () => {
  const S = family('noel')
  S.seasonStartedKey = 'noel-2026'
  S.themeBeforeSeason = 'bear'
  apply(S, L.pickThemePatch(S, 'bento', '2026-12-10'))
  assert.equal(S.seasonStartedKey, null)
  assert.equal(S.themeBeforeSeason, null)
})
ok('Khoá đã hỏi có dạng noel-2026, tet-2027, thieunhi-2027, noel-2026-end', () => {
  const S = family()
  apply(S, L.laterSuggestionPatch(S, open(S, '2026-12-02')))
  apply(S, L.laterSuggestionPatch(S, open(S, '2027-02-01')))
  apply(S, L.laterSuggestionPatch(S, open(S, '2027-05-25')))
  assert.deepEqual(S.seasonAsked, ['noel-2026', 'tet-2027', 'thieunhi-2027'])
})
ok('Cấu hình admin sai định dạng thì dùng mặc định', () => {
  const c = L.normalizeSeasonsConfig({ noel: { start: '99-99', enabled: 'x' }, tet: { daysBefore: -3, dates: { 2027: '2027-13-40', 2032: '2032-02-11' } } })
  assert.equal(c.noel.start, '12-01')
  assert.equal(c.tet.daysBefore, 8)
  assert.equal(c.tet.dates['2027'], '2027-02-06')
  assert.equal(c.tet.dates['2032'], '2032-02-11')
})

console.log('Chặng 4 · Thẻ ngày đặc biệt')
ok('Đêm Tuyết: thẻ chỉ ngày 24/12 và chỉ khi đang dùng Đêm Tuyết', () => {
  assert.equal(L.specialDay('noel', '2026-12-24').type, 'noel-eve')
  assert.equal(L.specialDay('noel', '2026-12-23'), null)
  assert.equal(L.specialDay('bear', '2026-12-24'), null)
})
ok('Xuân Sum Vầy: đêm Giao thừa và mùng 1 đến mùng 3', () => {
  assert.equal(L.specialDay('tet', '2027-02-04'), null)
  assert.equal(L.specialDay('tet', '2027-02-05').dayIndex, -1)
  assert.equal(L.specialDay('tet', '2027-02-06').type, 'tet-wish')
  assert.equal(L.specialDay('tet', '2027-02-08').dayIndex, 2)
  assert.equal(L.specialDay('tet', '2027-02-09'), null)
  assert.equal(L.specialDay('candy', '2027-02-06'), null)
})
ok('10 câu chúc Tết viết sẵn, không trùng, không có dấu gạch dài', () => {
  assert.equal(L.TET_WISHES.length, 10)
  assert.equal(new Set(L.TET_WISHES).size, 10)
  assert.ok(L.TET_WISHES.every((w) => !w.includes('—') && !w.includes('–')))
  assert.ok(L.TET_WISHES.includes(L.pickTetWish(0.55)))
})
ok('Ô Lời khen từ mẹ chỉ hiện ngày 1/6 và chỉ khi đang dùng Cầu Vồng 1/6', () => {
  assert.equal(L.specialDay('thieunhi', '2027-06-01').type, 'praise')
  assert.equal(L.specialDay('thieunhi', '2027-05-31'), null)
  assert.equal(L.specialDay('thieunhi', '2027-06-02'), null)
  assert.equal(L.specialDay('bear', '2027-06-01'), null)
})
ok('Lời khen tối đa 200 ký tự, mở ở Xong bài tối 1/6, tự xoá sau 7 ngày', () => {
  const note = L.makePraiseNote('x'.repeat(260), '2027-06-01')
  assert.equal(note.text.length, 200)
  assert.ok(L.canOpenPraise('thieunhi', note, '2027-06-01'))
  assert.ok(!L.canOpenPraise('bear', note, '2027-06-01'))
  assert.ok(!L.canOpenPraise('thieunhi', note, '2027-06-02'))
  assert.ok(!L.isPraiseExpired(note, '2027-06-07'))
  assert.ok(L.isPraiseExpired(note, '2027-06-08'))
})

console.log('Chặng 5 · Máy chủ dùng cùng quy tắc với app')
const wsrc = path.join(os.homedir(), 'mnt/ai-gateway-worker/src/dot16_seasons.js')
if (fs.existsSync(wsrc)) {
  const tmp = path.join(os.tmpdir(), `dot16_seasons_${process.pid}.mjs`)
  fs.writeFileSync(tmp, fs.readFileSync(wsrc, 'utf8'))
  const W = await import(pathToFileURL(tmp).href)
  const samples = [null, {}, { noel: { enabled: false, start: '12-10' } }, { tet: { daysAfter: 12, dates: { 2027: null, 2032: '2032-02-11' } } }, { thieunhi: { end: 'xx' } }]
  for (const s of samples) assert.deepEqual(W.normalizeSeasons(s), L.normalizeSeasonsConfig(s))
  const env = { DB: { prepare: () => ({ bind: () => ({ first: async () => null }) }) } }
  const res = await W.handle(new Request('https://x/api/v1/admin/seasons'), env, {}, '/api/v1/admin/seasons', 'GET', {}, null)
  assert.equal(res.status, 401, 'không có phiên admin thì 401')
  const editor = { role: 'viewer', member_id: 'm1' }
  const res2 = await W.handle(new Request('https://x/api/v1/admin/seasons', { method: 'PUT', body: '{}' }), env, {}, '/api/v1/admin/seasons', 'PUT', {}, editor)
  assert.equal(res2.status, 403, 'vai trò xem không được sửa')
  const pub = await W.handle(new Request('https://x/api/v1/config/seasons'), env, {}, '/api/v1/config/seasons', 'GET', {}, null)
  assert.equal((await pub.json()).seasons.tet.dates['2027'], '2027-02-06')
  assert.equal(await W.handle(new Request('https://x/other'), env, {}, '/api/v1/other', 'GET', {}, null), null)
  fs.unlinkSync(tmp)
  n++
  console.log('  ✓ worker: quy tắc chuẩn hoá khớp app, kiểm phiên admin, kiểm vai trò, trả cấu hình công khai')
} else {
  console.log('  · bỏ qua kiểm worker (không thấy thư mục ai-gateway-worker)')
}

console.log(`\n✅ test-dot16-seasons: ${n} kiểm thử đạt`)
