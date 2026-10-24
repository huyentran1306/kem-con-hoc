/* ============================================================
   👩‍🏫 KÈM CON HỌC — THẺ CÔ NHẮC & MẪU SOẠN NHANH (PROMPT 04 MỤC 4b)
   Logic cho cô gửi lời nhắc có ngày, thẻ hiển thị trên màn chính của mẹ,
   giới hạn 3 lời nhắc/ngày, và theo dõi trạng thái đọc/đã nhắc.
   ============================================================ */

export const REMINDER_TEMPLATES = [
  {
    id: 'uniform',
    label: 'Đồng phục',
    icon: '👕',
    template: 'Mai {thứ hai}, các con mặc đồng phục {thể dục} và mang {vở Toán} nhé.',
    defaultDateOffset: 1, // ngày mai
  },
  {
    id: 'bring',
    label: 'Mang theo',
    icon: '🎒',
    template: 'Mai các con nhớ mang theo {thước kẻ} và {bút chì 2B} nhé.',
    defaultDateOffset: 1,
  },
  {
    id: 'submit',
    label: 'Nộp',
    icon: '📄',
    template: 'Mai các con nộp {phiếu khảo sát} đã có chữ ký của phụ huynh nhé.',
    defaultDateOffset: 1,
  },
  {
    id: 'quiz',
    label: 'Kiểm tra',
    icon: '📝',
    template: 'Mai lớp mình có bài kiểm tra {15 phút môn Tiếng Việt} các con ôn kỹ nhé.',
    defaultDateOffset: 1,
  },
  {
    id: 'off',
    label: 'Nghỉ học',
    icon: '🏖️',
    template: 'Lớp mình sẽ nghỉ học vào {ngày mai} theo lịch của nhà trường nhé.',
    defaultDateOffset: 1,
  },
  {
    id: 'time',
    label: 'Đổi giờ',
    icon: '⏰',
    template: 'Ngày mai giờ đón học sinh buổi chiều đổi thành {16:30} nhé bố mẹ.',
    defaultDateOffset: 1,
  },
]

export const MAX_REMINDERS_PER_DAY = 3

/**
 * Kiểm tra xem thẻ nhắc việc có đang nằm trong khung giờ hiển thị trên màn chính hay không:
 * Từ 12:00 trưa hôm trước tới 12:00 trưa ngày áp dụng.
 * @param {string|Date} targetDate - Ngày áp dụng (YYYY-MM-DD hoặc Date)
 * @param {Date} [currentTime] - Thời gian hiện tại để so sánh
 * @returns {boolean}
 */
export function isReminderInDisplayWindow(targetDate, currentTime = new Date()) {
  if (!targetDate) return true
  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)

  // 12:00 trưa hôm trước:
  const windowStart = new Date(target)
  windowStart.setDate(windowStart.getDate() - 1)
  windowStart.setHours(12, 0, 0, 0)

  // 12:00 trưa ngày áp dụng:
  const windowEnd = new Date(target)
  windowEnd.setHours(12, 0, 0, 0)

  const now = new Date(currentTime)
  return now >= windowStart && now <= windowEnd
}

/**
 * Kiểm tra xem có cần làm nổi bật thẻ vào buổi tối hay không:
 * Sau 20:00 tối hôm trước mà mẹ chưa bấm "Đã nhắc con".
 */
export function isLateNightUrgent(targetDate, isDone = false, currentTime = new Date()) {
  if (isDone) return false
  if (!targetDate) return false

  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)

  // 20:00 tối hôm trước:
  const urgentStart = new Date(target)
  urgentStart.setDate(urgentStart.getDate() - 1)
  urgentStart.setHours(20, 0, 0, 0)

  // 12:00 trưa ngày áp dụng:
  const windowEnd = new Date(target)
  windowEnd.setHours(12, 0, 0, 0)

  const now = new Date(currentTime)
  return now >= urgentStart && now <= windowEnd
}

/**
 * Lấy danh sách mẫu ngày nhanh (Mai, Ngày kia)
 */
export function getQuickReminderDates(baseDate = new Date()) {
  const tomorrow = new Date(baseDate)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().slice(0, 10)
  const tomorrowWeekday = tomorrow.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })

  const dayAfter = new Date(baseDate)
  dayAfter.setDate(dayAfter.getDate() + 2)
  const dayAfterStr = dayAfter.toISOString().slice(0, 10)
  const dayAfterWeekday = dayAfter.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })

  return [
    { label: `Mai · ${tomorrowWeekday}`, date: tomorrowStr },
    { label: `Ngày kia · ${dayAfterWeekday}`, date: dayAfterStr },
  ]
}
