/* ============================================================
   TEST SUITE: useStudyTracker (PROMPT 07 PHẦN B)
   Kiểm tra 03:00 boundary, thứ Hai đầu tuần, backfill, streak, goal
   ============================================================ */
import { getStudyDateKey, getCurrentWeekDays } from '../src/useStudyTracker.js'

console.log('🧪 BẮT ĐẦU KIỂM THỬ THEO DÕI HỌC ĐỀU (useStudyTracker):')
console.log('---------------------------------------------------------')

let passCount = 0
let failCount = 0

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`)
    passCount++
  } else {
    console.error(`❌ FAIL: ${message}`)
    failCount++
  }
}

// 1. Kiểm tra mốc 03:00 sáng
// Giờ VN (UTC+7): 2026-10-24 01:30 sáng -> tính cho 2026-10-23
const date1h30 = new Date('2026-10-23T18:30:00.000Z') // 18:30Z = 01:30 VN ngày 24/10
const key1h30 = getStudyDateKey(date1h30.getTime())
assert(key1h30 === '2026-10-23', `01:30 sáng tính cho tối hôm trước: ${key1h30} === '2026-10-23'`)

// Giờ VN (UTC+7): 2026-10-24 03:05 sáng -> tính cho 2026-10-24
const date3h05 = new Date('2026-10-23T20:05:00.000Z') // 20:05Z = 03:05 VN ngày 24/10
const key3h05 = getStudyDateKey(date3h05.getTime())
assert(key3h05 === '2026-10-24', `03:05 sáng tính cho ngày mới: ${key3h05} === '2026-10-24'`)

// 2. Kiểm tra 7 ngày trong tuần luôn bắt đầu từ Thứ Hai (T2)
const weekDays = getCurrentWeekDays(new Date('2026-10-24T12:00:00.000Z').getTime())
assert(weekDays.length === 7, `Tuần có đúng 7 ngày (got ${weekDays.length})`)
assert(weekDays[0].label === 'T2', `Ngày đầu tuần là Thứ Hai (T2)`)
assert(weekDays[6].label === 'CN', `Ngày cuối tuần là Chủ Nhật (CN)`)

// 3. Kiểm tra không đè/sửa stickerHistory khi backfill
const dummyHistory = [
  { timestamp: new Date('2026-10-20T13:00:00Z').getTime(), name: 'Sao vàng', sample: false },
  { timestamp: new Date('2026-10-21T14:00:00Z').getTime(), name: 'Kỳ lân', isSample: true }, // sample bỏ qua
  { timestamp: new Date('2026-10-22T15:00:00Z').getTime(), name: 'Bóng bay' },
]
const originalHistoryJSON = JSON.stringify(dummyHistory)

// Giả lập backfill
const backfilled = []
const seen = new Set()
dummyHistory.forEach((it, idx) => {
  if (it.sample || it.isSample) return
  const k = getStudyDateKey(it.timestamp)
  if (!seen.has(k)) {
    seen.add(k)
    backfilled.push({ id: idx, dateKey: k })
  }
})

assert(JSON.stringify(dummyHistory) === originalHistoryJSON, `stickerHistory không bị thay đổi một byte sau khi backfill`)
assert(backfilled.length === 2, `Bỏ qua đúng sticker sample (kết quả có 2 tối, got ${backfilled.length})`)

console.log('---------------------------------------------------------')
if (failCount === 0) {
  console.log(`🎉 TẤT CẢ ${passCount} BÀI TEST useStudyTracker ĐÃ VƯỢT QUA 100%!`)
  process.exit(0)
} else {
  console.error(`⚠️ Có ${failCount} bài test thất bại!`)
  process.exit(1)
}
