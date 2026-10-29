/* ============================================================
   KÈM CON HỌC — useStudyTracker(childId)
   Theo dõi học đều mỗi ngày (Prompt 07 Phần B)
   - 1 tối học = >= 1 bài tới màn Xong bài (hoặc partial: true từ Góc hạ hoả)
   - Tuần bắt đầu thứ Hai, múi giờ Việt Nam (UTC+7)
   - Mốc 03:00 sáng: học sau nửa đêm tới 03:00 tính cho tối hôm trước
   - Câu chữ tích cực, không gây áp lực
   ============================================================ */
import { useMemo, useCallback } from 'react'

/**
 * Lấy chuỗi ngày YYYY-MM-DD theo giờ Việt Nam (UTC+7),
 * có tính mốc 03:00 sáng thuộc về tối hôm trước.
 */
export function getStudyDateKey(timestamp = Date.now()) {
  const d = new Date(timestamp)
  // Cộng 7 tiếng để ra giờ Việt Nam
  const utc = d.getTime() + d.getTimezoneOffset() * 60000
  const vnTime = new Date(utc + 7 * 3600000)

  // Nếu trước 03:00 sáng thì lùi 1 ngày
  if (vnTime.getHours() < 3) {
    vnTime.setDate(vnTime.getDate() - 1)
  }

  const y = vnTime.getFullYear()
  const m = String(vnTime.getMonth() + 1).padStart(2, '0')
  const date = String(vnTime.getDate()).padStart(2, '0')
  return `${y}-${m}-${date}`
}

/**
 * Lấy danh sách 7 ngày trong tuần hiện tại (Thứ Hai -> Chủ Nhật)
 */
export function getCurrentWeekDays(refTimestamp = Date.now()) {
  const d = new Date(refTimestamp)
  const utc = d.getTime() + d.getTimezoneOffset() * 60000
  const vnTime = new Date(utc + 7 * 3600000)

  // Áp dụng mốc 03:00
  if (vnTime.getHours() < 3) {
    vnTime.setDate(vnTime.getDate() - 1)
  }

  // Thứ Hai là ngày đầu tuần (0: CN -> chuyển thành 7)
  const dayOfWeek = vnTime.getDay() === 0 ? 7 : vnTime.getDay() // 1: T2, ..., 7: CN
  const monday = new Date(vnTime)
  monday.setDate(vnTime.getDate() - (dayOfWeek - 1))
  monday.setHours(12, 0, 0, 0)

  const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  const fullLabels = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật']

  const days = []
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday)
    dayDate.setDate(monday.getDate() + i)
    const y = dayDate.getFullYear()
    const m = String(dayDate.getMonth() + 1).padStart(2, '0')
    const date = String(dayDate.getDate()).padStart(2, '0')
    days.push({
      dateKey: `${y}-${m}-${date}`,
      dayNum: dayDate.getDate(),
      label: labels[i],
      fullLabel: fullLabels[i],
      index: i,
    })
  }
  return days
}

export function useStudyTracker(childId, state = null, updateState = null) {
  const childStats = state?.stats?.[childId] || {}
  const rawLog = childStats.studyLog || []
  const stickerHistory = childStats.stickerHistory || []
  const weekGoal = childStats.studyWeekGoal || 4

  // 1. Backfill dữ liệu từ stickerHistory (chỉ chạy 1 lần nếu chưa có studyLog)
  const effectiveLog = useMemo(() => {
    if (rawLog && rawLog.length > 0) return rawLog
    // Suy ra từ stickerHistory (bỏ bản ghi sample: true)
    const backfilled = []
    const seenDays = new Set()
    stickerHistory.forEach((item, idx) => {
      if (item.sample || item.isSample) return
      const ts = item.timestamp || (item.ts ? new Date(item.ts).getTime() : 0)
      if (!ts) return
      const dateKey = getStudyDateKey(ts)
      if (!seenDays.has(dateKey)) {
        seenDays.add(dateKey)
        backfilled.push({
          id: `bf_${idx}_${ts}`,
          ts,
          dateKey,
          problemType: item.name || 'Toán',
          totalSteps: 4,
          selfSteps: 3,
          teachBack: 'self',
          minutes: 15,
          fromBackfill: true,
        })
      }
    })
    return backfilled
  }, [rawLog, stickerHistory])

  // Tập hợp các ngày đã học
  const studiedDatesMap = useMemo(() => {
    const map = new Map()
    effectiveLog.forEach((item) => {
      const k = item.dateKey || getStudyDateKey(item.ts)
      if (!map.has(k)) {
        map.set(k, item)
      }
    })
    return map
  }, [effectiveLog])

  // Gói 36: tổng số phút học mỗi ngày (lịch học tô đậm nhạt theo thời lượng)
  const minutesByDate = useMemo(() => {
    const map = new Map()
    effectiveLog.forEach((item) => {
      const k = item.dateKey || getStudyDateKey(item.ts)
      const m = Number(item.minutes)
      map.set(k, (map.get(k) || 0) + (Number.isFinite(m) && m > 0 ? m : 15))
    })
    return map
  }, [effectiveLog])

  // 2. Tính 7 ngày trong tuần hiện tại
  const todayDateKey = useMemo(() => getStudyDateKey(Date.now()), [])
  const weekDays = useMemo(() => getCurrentWeekDays(Date.now()), [])

  const week = useMemo(() => {
    return weekDays.map((d) => {
      const isStudied = studiedDatesMap.has(d.dateKey)
      const isToday = d.dateKey === todayDateKey
      let status = 'future'

      if (d.dateKey < todayDateKey) {
        status = isStudied ? 'done' : 'rest'
      } else if (isToday) {
        status = isStudied ? 'todayDone' : 'today'
      } else {
        status = 'future'
      }

      return {
        ...d,
        isToday,
        isStudied,
        status,
        session: studiedDatesMap.get(d.dateKey) || null,
      }
    })
  }, [weekDays, studiedDatesMap, todayDateKey])

  const weekCount = useMemo(() => {
    return week.filter((d) => d.status === 'done' || d.status === 'todayDone').length
  }, [week])

  // 3. Tính streak (chuỗi liên tiếp)
  // Nếu hôm nay chưa học thì streak tính đến tối hôm qua và không bị đứt
  const { streak, bestStreak } = useMemo(() => {
    if (studiedDatesMap.size === 0) return { streak: 0, bestStreak: 0 }

    let currentStreak = 0
    let checkDate = new Date()
    // Giờ VN và mốc 03:00
    const utc = checkDate.getTime() + checkDate.getTimezoneOffset() * 60000
    let vnTime = new Date(utc + 7 * 3600000)
    if (vnTime.getHours() < 3) vnTime.setDate(vnTime.getDate() - 1)

    const todayK = getStudyDateKey(vnTime.getTime())

    // Nếu hôm nay đã học -> tính từ hôm nay, nếu chưa học -> tính từ hôm qua
    if (!studiedDatesMap.has(todayK)) {
      vnTime.setDate(vnTime.getDate() - 1)
    }

    while (true) {
      const k = getStudyDateKey(vnTime.getTime())
      if (studiedDatesMap.has(k)) {
        currentStreak++
        vnTime.setDate(vnTime.getDate() - 1)
      } else {
        break
      }
    }

    // Tính best streak từ toàn bộ lịch sử đã sắp xếp
    const allSortedKeys = Array.from(studiedDatesMap.keys()).sort()
    let maxS = 0
    let curS = 0
    let prevDate = null

    allSortedKeys.forEach((k) => {
      const [year, month, day] = k.split('-').map(Number)
      const thisDate = new Date(year, month - 1, day)
      if (prevDate) {
        const diffDays = Math.round((thisDate - prevDate) / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          curS++
        } else if (diffDays > 1) {
          curS = 1
        }
      } else {
        curS = 1
      }
      prevDate = thisDate
      if (curS > maxS) maxS = curS
    })

    return {
      streak: currentStreak,
      bestStreak: Math.max(maxS, currentStreak),
    }
  }, [studiedDatesMap])

  // 4. Buổi học gần nhất (lastSession)
  const lastSession = useMemo(() => {
    if (effectiveLog.length === 0) return null
    return [...effectiveLog].sort((a, b) => b.ts - a.ts)[0]
  }, [effectiveLog])

  // 5. Câu động viên tích cực, không gây áp lực
  const encouragement = useMemo(() => {
    if (weekCount >= weekGoal) {
      return `Đủ ${weekGoal} tối rồi, cả nhà ăn mừng nhé! 🎉`
    }
    if (streak >= 3) {
      return `Tuyệt vời! ${streak} tối liên tiếp đồng hành cùng con 🔥`
    }
    if (weekCount > 0) {
      return `Tuần này đã kèm con được ${weekCount}/${weekGoal} tối rồi 🌱`
    }
    if (streak === 0) {
      return `Bắt đầu chuỗi mới cùng con tối nay nào ✨`
    }
    return `Mục tiêu ${weekGoal} tối tuần này · Nhẹ nhàng mỗi tối 15 phút`
  }, [weekCount, weekGoal, streak])

  // 6. Lưới tháng cho màn Báo cáo
  const month = useMemo(() => {
    const d = new Date()
    const utc = d.getTime() + d.getTimezoneOffset() * 60000
    const vnTime = new Date(utc + 7 * 3600000)
    const year = vnTime.getFullYear()
    const currentMonth = vnTime.getMonth()

    const daysInMonth = new Date(year, currentMonth + 1, 0).getDate()
    const result = []

    for (let day = 1; day <= daysInMonth; day++) {
      const mStr = String(currentMonth + 1).padStart(2, '0')
      const dStr = String(day).padStart(2, '0')
      const dateKey = `${year}-${mStr}-${dStr}`
      const isStudied = studiedDatesMap.has(dateKey)
      const isToday = dateKey === todayDateKey
      result.push({
        day,
        dateKey,
        isStudied,
        isToday,
        isFuture: dateKey > todayDateKey,
        minutes: isStudied ? Math.round(minutesByDate.get(dateKey) || 0) : 0,
      })
    }
    return result
  }, [studiedDatesMap, minutesByDate, todayDateKey])

  // 7. Hàm ghi nhận buổi học (recordStudySession)
  const recordSession = useCallback(
    (sessionData = {}) => {
      if (!updateState || !childId) return
      const now = Date.now()
      const newEntry = {
        id: 'sess_' + now + '_' + Math.random().toString(36).slice(2, 6),
        ts: now,
        dateKey: getStudyDateKey(now),
        problemType: sessionData.problemType || 'Toán',
        totalSteps: sessionData.totalSteps || 4,
        selfSteps: sessionData.selfSteps || 4,
        teachBack: sessionData.teachBack || 'self',
        minutes: sessionData.minutes || 15,
        partial: Boolean(sessionData.partial),
      }

      updateState((prev) => {
        const stats = { ...(prev.stats || {}) }
        const cStats = { ...(stats[childId] || {}) }
        const currentLog = cStats.studyLog || []
        // Tránh trùng bài cùng 1 tối nếu không cố ý
        const updatedLog = [newEntry, ...currentLog]
        cStats.studyLog = updatedLog
        stats[childId] = cStats
        return { ...prev, stats }
      })
      return newEntry
    },
    [childId, updateState]
  )

  return {
    week,
    weekCount,
    weekGoal,
    streak,
    bestStreak,
    lastSession,
    encouragement,
    month,
    recordSession,
  }
}
