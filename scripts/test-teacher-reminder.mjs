/* ============================================================
   🧪 TEST SUITE: THẺ CÔ NHẮC (PROMPT 04 MỤC 4b)
   Testing 5 mandatory requirements for Teacher Reminder card
   ============================================================ */

import assert from 'assert'
import {
  REMINDER_TEMPLATES,
  MAX_REMINDERS_PER_DAY,
  isReminderInDisplayWindow,
  isLateNightUrgent,
  getQuickReminderDates,
} from '../src/teacherReminderData.js'

console.log('--- 🧪 STARTING PROMPT 04 MỤC 4b TEACHER REMINDER TESTS ---')

// 1. Kiểm thử 6 mẫu nhanh
console.log('1. Kiểm thử 6 mẫu soạn nhanh...')
assert.strictEqual(REMINDER_TEMPLATES.length, 6, 'Phải có đúng 6 mẫu soạn nhanh')
const expectedTemplateIds = ['uniform', 'bring', 'submit', 'quiz', 'off', 'time']
for (const id of expectedTemplateIds) {
  const tpl = REMINDER_TEMPLATES.find((t) => t.id === id)
  assert.ok(tpl, `Tìm thấy mẫu "${id}"`)
  assert.ok(tpl.label && tpl.icon && tpl.template, `Mẫu "${id}" có đủ label, icon, template`)
}
console.log('  ✓ Đầy đủ 6 mẫu: Đồng phục, Mang theo, Nộp, Kiểm tra, Nghỉ học, Đổi giờ.')

// 2. Giới hạn tối đa 3 lời nhắc/ngày
console.log('2. Kiểm thử giới hạn số lời nhắc...')
assert.strictEqual(MAX_REMINDERS_PER_DAY, 3, 'Tối đa 3 lời nhắc mỗi ngày mỗi lớp')
console.log('  ✓ Giới hạn 3 lời nhắc/ngày được xác nhận.')

// 3. Khung giờ hiển thị (Từ 12:00 trưa hôm trước tới 12:00 trưa ngày áp dụng)
console.log('3. Kiểm thử khung giờ hiển thị thẻ trên màn chính của mẹ...')
// Giả định ngày áp dụng là 2026-10-27
const targetDay = '2026-10-27'

// 10:00 sáng ngày 26/10 (trước 12:00 trưa hôm trước): Chưa hiển thị
const beforeWindow = new Date('2026-10-26T10:00:00+07:00')
assert.strictEqual(isReminderInDisplayWindow(targetDay, beforeWindow), false, '10:00 sáng hôm trước: Chưa hiện trên màn chính')

// 14:00 chiều ngày 26/10 (sau 12:00 trưa hôm trước): Đang hiển thị
const inWindowAfternoon = new Date('2026-10-26T14:00:00+07:00')
assert.strictEqual(isReminderInDisplayWindow(targetDay, inWindowAfternoon), true, '14:00 chiều hôm trước: Đã hiển thị trên màn chính')

// 08:00 sáng ngày 27/10 (ngày áp dụng, trước 12:00 trưa): Vẫn hiển thị
const inWindowMorning = new Date('2026-10-27T08:00:00+07:00')
assert.strictEqual(isReminderInDisplayWindow(targetDay, inWindowMorning), true, '08:00 sáng ngày áp dụng: Vẫn hiển thị trên màn chính')

// 14:00 chiều ngày 27/10 (sau 12:00 trưa ngày áp dụng): Đã hết hạn trên màn chính
const afterWindow = new Date('2026-10-27T14:00:00+07:00')
assert.strictEqual(isReminderInDisplayWindow(targetDay, afterWindow), false, '14:00 chiều ngày áp dụng: Đã lùi vào hộp thông báo')
console.log('  ✓ Khung giờ 12:00 hôm trước -> 12:00 hôm sau hoạt động chính xác.')

// 4. Nhấn mạnh viền thẻ lúc 20:00 tối nếu chưa bấm "Đã nhắc con"
console.log('4. Kiểm thử viền nhấn sau 20:00 tối khi mẹ chưa nhắc con...')
// 19:00 tối hôm trước: Chưa cần nhấn mạnh
const eveningEarly = new Date('2026-10-26T19:00:00+07:00')
assert.strictEqual(isLateNightUrgent(targetDay, false, eveningEarly), false, '19:00 tối chưa cần viền nhấn')

// 20:30 tối hôm trước và chưa nhắc (isDone = false): Cần viền nhấn
const nightUnread = new Date('2026-10-26T20:30:00+07:00')
assert.strictEqual(isLateNightUrgent(targetDay, false, nightUnread), true, '20:30 tối chưa nhắc con: Bật viền nhấn nổi bật')

// 20:30 tối hôm trước nhưng ĐÃ NHẮC (isDone = true): Không viền nhấn
assert.strictEqual(isLateNightUrgent(targetDay, true, nightUnread), false, '20:30 tối đã bấm "Đã nhắc con": Tắt viền nhấn')
console.log('  ✓ Nhấn mạnh viền sau 20:00 hoạt động chuẩn xác.')

// 5. Mẫu ngày nhanh (Mai, Ngày kia)
console.log('5. Kiểm thử gợi ý ngày nhanh...')
const quickDates = getQuickReminderDates(new Date('2026-10-24T12:00:00+07:00'))
assert.strictEqual(quickDates.length, 2, 'Gợi ý đủ 2 mốc Mai và Ngày kia')
assert.strictEqual(quickDates[0].date, '2026-10-25', 'Mai là ngày 25/10')
assert.strictEqual(quickDates[1].date, '2026-10-26', 'Ngày kia là ngày 26/10')
console.log('  ✓ Gợi ý ngày nhanh chuẩn xác.')

console.log('--- ✅ TẤT CẢ KIỂM THỬ PROMPT 04 MỤC 4b ĐÃ VƯỢT QUA XUẤT SẮC! ---')
