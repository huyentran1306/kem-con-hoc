/* ============================================================
   👩‍🏫 KÈM CON HỌC — THẺ CÔ NHẮC TRÊN MÀN CHÍNH (PROMPT 04 MỤC 4b)
   Hiển thị lời nhắc có ngày từ giáo viên với nút "Đã nhắc con"
   ============================================================ */

import { useState, useEffect } from 'react'
import { isReminderInDisplayWindow, isLateNightUrgent } from './teacherReminderData.js'

export default function TeacherReminderBanner({ child, S, patch, go, openSheet, toast }) {
  const [reminders, setReminders] = useState([])
  const [doneMap, setDoneMap] = useState(() => {
    try {
      const saved = localStorage.getItem('kem-con-hoc:reminders-done')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Đọc danh sách nhắc việc từ local storage hoặc API
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kem-con-hoc:teacher-reminders')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReminders(parsed)
          return
        }
      }
    } catch {}

    // Dữ liệu mẫu ban đầu nếu chưa có bài tập nào
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().slice(0, 10)

    const initialReminders = [
      {
        id: 'rem_demo_1',
        teacher_name: 'Hạnh',
        class_name: 'Lớp 3A',
        child_name: child?.name || 'Mít',
        message: 'Mai thứ hai, các con mặc đồng phục thể dục và mang vở Toán nhé.',
        target_date: tomorrowStr,
        created_at: new Date().toISOString(),
        assignment_id: null,
      }
    ]
    setReminders(initialReminders)
  }, [child?.name])

  const handleMarkDone = (remId) => {
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const updated = { ...doneMap, [remId]: nowTime }
    setDoneMap(updated)
    try {
      localStorage.setItem('kem-con-hoc:reminders-done', JSON.stringify(updated))
    } catch {}
    if (toast) toast('Đã ghi nhận: Mẹ đã nhắc con chu đáo! ✨')
  }

  // Lọc các lời nhắc đang trong khung giờ hiển thị
  const activeReminders = reminders.filter((rem) => isReminderInDisplayWindow(rem.target_date))

  if (activeReminders.length === 0) return null

  const isViewOnly = S?.userRole === 'viewer' || S?.role === 'viewer'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
      {activeReminders.map((rem) => {
        const isDone = Boolean(doneMap[rem.id])
        const doneTime = doneMap[rem.id]
        const isUrgent = isLateNightUrgent(rem.target_date, isDone)
        const targetDateObj = rem.target_date ? new Date(rem.target_date) : null
        const targetDateFormatted = targetDateObj
          ? targetDateObj.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })
          : 'Hôm nay'

        return (
          <div
            key={rem.id}
            className="card"
            style={{
              borderRadius: 'var(--radius-lg, 22px)',
              background: 'var(--c-hint1-bg, #FFF1D6)',
              border: isUrgent
                ? '2.5px solid var(--c-accent, #D2427D)'
                : '2px solid var(--c-warn-line, #F6C56A)',
              padding: '14px 16px',
              position: 'relative',
              boxShadow: isUrgent
                ? '0 4px 18px rgba(210, 66, 125, 0.25)'
                : '0 4px 12px rgba(246, 166, 35, 0.1)',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Header cô nhắc */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--c-surface, #FFFFFF)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 15,
                    border: '1.5px solid var(--c-line, #F0DDC2)',
                  }}
                >
                  👩‍🏫
                </span>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--c-text-2, #8B6D50)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Cô {rem.teacher_name} · {rem.class_name} nhắc
                </div>
              </div>

              {rem.child_name && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'var(--c-surface, #FFFFFF)',
                    color: 'var(--c-accent-ink, #9B6916)',
                    border: '1px solid var(--c-line, #F0DDC2)',
                  }}
                >
                  {rem.child_name}
                </span>
              )}
            </div>

            {/* Nội dung lời nhắc */}
            <p
              style={{
                fontFamily: 'var(--font-head, inherit)',
                fontSize: 15.5,
                fontWeight: 700,
                lineHeight: 1.4,
                color: 'var(--c-text, #4B3621)',
                margin: '6px 0 8px 0',
              }}
            >
              {rem.message}
            </p>

            {/* Thời gian áp dụng */}
            <div style={{ fontSize: 12, color: 'var(--c-text-2, #8B6D50)', marginBottom: 10 }}>
              📅 Áp dụng cho: <b>{targetDateFormatted}</b>
            </div>

            {/* Hành động */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {isDone ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 999,
                    background: 'var(--c-good-bg, #E8F6E6)',
                    color: 'var(--c-good-fg, #3F7A3E)',
                    fontWeight: 800,
                    fontSize: 12.5,
                  }}
                >
                  ✓ Mẹ đã nhắc con lúc {doneTime}
                </div>
              ) : isViewOnly ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 999,
                    background: '#F1F5F9',
                    color: '#64748B',
                    fontWeight: 700,
                    fontSize: 12.5,
                  }}
                >
                  Chưa ghi nhận nhắc con
                </div>
              ) : (
                <button
                  type="button"
                  className="btn solid"
                  onClick={() => handleMarkDone(rem.id)}
                  style={{
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 800,
                    background: 'var(--c-btn, #F6A623)',
                    color: 'var(--c-btn-text, #4B3621)',
                    border: 'none',
                    borderRadius: 'var(--radius-btn, 999px)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-btn, 0 4px 0 #C47F0E)',
                  }}
                >
                  🔔 Đã nhắc con
                </button>
              )}

              {rem.assignment_id && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    if (go) go('prep')
                  }}
                  style={{
                    padding: '7px 14px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    background: 'var(--c-surface, #FFFFFF)',
                    border: '1.5px solid var(--c-line, #F0DDC2)',
                    borderRadius: 'var(--radius-btn, 999px)',
                    color: 'var(--c-text, #4B3621)',
                    cursor: 'pointer',
                  }}
                >
                  📖 Mở bài cô giao ➔
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
