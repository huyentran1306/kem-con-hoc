/* ============================================================
   👩‍🏫 KÈM CON HỌC — THẺ CÔ NHẮC TRÊN MÀN CHÍNH (PROMPT 11 - PHẦN B)
   Hiển thị lời nhắc có ngày từ giáo viên với nút "Đã nhắc con"
   Tuân thủ quy tắc:
   - Hiện từ 12:00 trưa hôm trước đến 12:00 trưa ngày áp dụng
   - Đến 20:00 tối hôm trước chưa bấm: viền nhấn nổi bật
   - Nhà nhiều con: hiển thị lời nhắc của MỌI con kèm chip tên con màu riêng
   - Kết nối trực tiếp API Backend Worker: GET /family/reminders & POST /family/announcements/{id}/done
   - Tài khoản "Chỉ xem" (viewer) thấy trạng thái nhưng không có nút
   - Tối đa 3 thẻ gộp, còn lại ghi "+N trong hộp thông báo"
   ============================================================ */

import { useState, useEffect, useContext } from 'react'
import { isReminderInDisplayWindow, isLateNightUrgent } from './teacherReminderData.js'
import { getAuthToken, fetchFamilyReminders, markFamilyReminderDone, teacherLabel } from './api'
import { isTrialActive, getTrialTeacherReminders } from './trialData.js'
import { AppCtx } from './ctx'

const KID_COLORS = [
  { bg: '#FFF1D6', color: '#9A5B00', border: '#F6C56A' }, // Amber
  { bg: '#EFE9FF', color: '#6A4FD0', border: '#D8B4FE' }, // Violet
  { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' }, // Mint
  { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' }, // Blue
  { bg: '#FDF2F8', color: '#BE185D', border: '#FBCFE8' }, // Pink
]

export default function TeacherReminderBanner({ child, S, patch, go, openSheet, toast }) {
  const { Ho = 'Bố mẹ' } = useContext(AppCtx) || {}
  const [reminders, setReminders] = useState([])
  const [doneMap, setDoneMap] = useState(() => {
    try {
      const saved = localStorage.getItem('kem-con-hoc:reminders-done')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    loadReminders()
  }, [child?.name, S?.children])

  async function loadReminders() {
    const token = getAuthToken()
    if (token) {
      try {
        const res = await fetchFamilyReminders({ token, window: 'today' })
        const list = res && (res.reminders || res.items || res.announcements)
        if (res && res.ok !== false && Array.isArray(list)) {
          // Máy chủ có thể trả camelCase hoặc snake_case → đọc cả hai
          const serverReminders = list.map((r) => ({
            id: r.id ?? r.announcementId ?? r.announcement_id,
            teacher_name: r.teacher_name || r.teacherName || '',
            class_name: r.class_name || r.className || 'Lớp của con',
            child_name: r.child_name || r.childName || '',
            child_id: r.child_id ?? r.childId,
            message: r.body || r.message || r.content || '',
            target_date: r.remind_for || r.remindFor || r.target_date || r.targetDate,
            assignment_id: r.assignment_id || r.assignmentId || null,
            done_at: r.done_at || r.doneAt,
            done_by_name: r.done_by_name || r.doneByName,
          }))
          // Đã đăng nhập: chỉ hiện lời nhắc thật của cô (không dùng dữ liệu mẫu)
          setReminders(serverReminders)
          return
        }
      } catch (e) {
        console.warn('Load reminders error:', e)
      }
      setReminders([])
      return
    }

    // Đợt 15 P0.C: dữ liệu mẫu CHỈ dùng ở chế độ Dùng thử, không bao giờ cho tài khoản thật
    if (isTrialActive()) {
      setReminders(getTrialTeacherReminders(child?.name))
      return
    }
    setReminders([])
  }

  const handleMarkDone = async (remId) => {
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const updated = { ...doneMap, [remId]: nowTime }
    setDoneMap(updated)
    try {
      localStorage.setItem('kem-con-hoc:reminders-done', JSON.stringify(updated))
    } catch {}

    // Call server to persist
    const token = getAuthToken()
    if (token) {
      try {
        await markFamilyReminderDone({ token, announcementId: remId })
      } catch {}
    }

    if (toast) toast(`Đã ghi nhận: ${Ho} đã nhắc con chu đáo! ✨`)
  }

  // Filter reminders within active display window (12:00 yesterday to 12:00 today)
  const activeReminders = reminders.filter((rem) => isReminderInDisplayWindow(rem.target_date))

  if (activeReminders.length === 0) return null

  const isViewOnly = S?.userRole === 'viewer' || S?.role === 'viewer'
  const visibleReminders = activeReminders.slice(0, 3)
  const hiddenCount = activeReminders.length - visibleReminders.length

  // Build kid color map
  const kidsList = S?.children || (child ? [child] : [])
  const kidColorMap = {}
  kidsList.forEach((k, idx) => {
    kidColorMap[k.name] = KID_COLORS[idx % KID_COLORS.length]
    if (k.id) kidColorMap[k.id] = KID_COLORS[idx % KID_COLORS.length]
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
      {visibleReminders.map((rem) => {
        const isDone = Boolean(doneMap[rem.id] || rem.done_at)
        const doneTime = doneMap[rem.id] || (rem.done_at ? new Date(rem.done_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '')
        const isUrgent = isLateNightUrgent(rem.target_date, isDone)
        const targetDateObj = rem.target_date ? new Date(rem.target_date) : null
        const targetDateFormatted = targetDateObj
          ? targetDateObj.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })
          : 'Hôm nay'

        const kidColor = (rem.child_name && kidColorMap[rem.child_name]) || KID_COLORS[0]

        return (
          <div
            key={rem.id}
            className="card"
            style={{
              borderRadius: 'var(--radius-lg, 22px)',
              background: 'var(--c-hint1-bg, #FFF8EC)',
              border: isUrgent
                ? '2.5px solid var(--c-accent, #BE123C)'
                : '2px solid var(--c-warn-line, #F0DDC2)',
              padding: '14px 16px',
              position: 'relative',
              boxShadow: isUrgent
                ? '0 6px 20px rgba(190, 18, 60, 0.22)'
                : '0 4px 12px rgba(75, 54, 33, 0.08)',
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
                <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--c-text, #4B3621)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {teacherLabel(rem.teacher_name)} · {rem.class_name} nhắc
                </div>
              </div>

              {rem.child_name && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: kidColor.bg,
                    color: kidColor.color,
                    border: `1px solid ${kidColor.border}`,
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
            <div style={{ fontSize: 13, color: 'var(--c-text, #4B3621)', marginBottom: 10 }}>
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
                    background: 'var(--c-good-bg, #ECFDF5)',
                    color: 'var(--c-good-fg, #047857)',
                    fontWeight: 800,
                    fontSize: 13,
                    border: '1px solid var(--c-good, #A7F3D0)',
                  }}
                >
                  ✓ {rem.done_by_name || 'Bố mẹ'} đã nhắc con lúc {doneTime}
                </div>
              ) : isViewOnly ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 999,
                    background: 'var(--c-surface, #F1F5F9)',
                    color: 'var(--c-text, #475569)',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  Chưa ghi nhận nhắc con (Chỉ xem)
                </div>
              ) : (
                <button
                  type="button"
                  className="btn ghost btn-sm"
                  onClick={() => handleMarkDone(rem.id)}
                >
                  🔔 Đã nhắc con
                </button>
              )}

              {rem.assignment_id && (
                <button
                  type="button"
                  className="btn ghost btn-sm"
                  onClick={() => {
                    if (go) go('explain')
                  }}
                >
                  📖 Mở bài cô giao ➔
                </button>
              )}
            </div>
          </div>
        )
      })}

      {hiddenCount > 0 && (
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--c-text-2, #84664A)', fontWeight: 700 }}>
          ＋{hiddenCount} lời nhắc khác trong Hộp thông báo
        </div>
      )}
    </div>
  )
}
