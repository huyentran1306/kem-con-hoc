/* ============================================================
   📣 KÈM CON HỌC — HỘP THÔNG BÁO CỦA CÔ (PHỤ HUYNH)
   - GET  /api/v1/family/announcements           (thông báo + lời nhắc, có cờ kind)
   - POST /api/v1/family/announcements/{id}/read  (mở ra là đã đọc)
   - POST /api/v1/family/announcements/{id}/ack   (cô yêu cầu xác nhận)
   Lời nhắc có ngày vẫn hiện ở thẻ "Cô nhắc"; ở đây hiện mọi thông báo để không bỏ sót.
   ============================================================ */
import { useEffect, useState } from 'react'
import { GATEWAY, getAuthToken, teacherLabel } from './api'
import { announcementStatus } from './teacher/announcementStatus.js'

// Prompt 29A: màn chính chỉ hiện tối đa 2 thông báo CÒN HẠN, chưa ẩn (ghim lên trước).
// Thông báo hết hạn chỉ thấy trong "Xem tất cả", để mờ, có nhãn "Đã qua". Đã ẩn / đã xoá thì không hiện.
const HOME_MAX = 2

function normalize(a) {
  return {
    id: a.id ?? a.announcementId ?? a.announcement_id,
    kind: a.kind || 'notice',
    title: a.title || '',
    body: a.body || a.message || a.content || '',
    teacherName: a.teacher_name || a.teacherName || '',
    className: a.class_name || a.className || '',
    childName: a.child_name || a.childName || '',
    createdAt: a.created_at || a.createdAt || '',
    remindFor: a.remind_for || a.remindFor || '',
    pinned: Boolean(a.pinned),
    requireAck: Boolean(a.require_ack ?? a.requireAck),
    readAt: a.read_at || a.readAt || null,
    ackedAt: a.acked_at || a.ackedAt || a.ack_at || null,
    expires_at: a.expires_at ?? a.expiresAt ?? null,
    hidden_at: a.hidden_at || a.hiddenAt || null,
    deleted_at: a.deleted_at || a.deletedAt || null,
    created_at: a.created_at || a.createdAt || '',
    remind_for: a.remind_for || a.remindFor || '',
  }
}

function timeAgo(iso) {
  if (!iso) return ''
  const d = new Date(String(iso).includes('T') || String(iso).endsWith('Z') ? iso : String(iso).replace(' ', 'T') + 'Z')
  if (Number.isNaN(d.getTime())) return ''
  const mins = Math.round((Date.now() - d.getTime()) / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const h = Math.round(mins / 60)
  if (h < 24) return `${h} giờ trước`
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })
}

async function post(path, token) {
  try {
    await fetch(`${GATEWAY}${path}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  } catch (e) {}
}

export default function FamilyAnnouncements({ childId, toast }) {
  const [items, setItems] = useState([])
  const [openId, setOpenId] = useState(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) return
    let cancelled = false
    fetch(`${GATEWAY}/api/v1/family/announcements`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        const list = d && (d.announcements || d.items || [])
        if (Array.isArray(list)) {
          const norm = list
            .map(normalize)
            .filter((a) => a.id != null)
            .map((a) => ({ ...a, status: announcementStatus(a) }))
            .filter((a) => a.status === 'active' || a.status === 'expired')
          norm.sort((x, y) => (y.pinned - x.pinned) || String(y.createdAt).localeCompare(String(x.createdAt)))
          setItems(norm)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [childId])

  const activeItems = items.filter((a) => a.status === 'active')
  const pastItems = items.filter((a) => a.status === 'expired')
  if (activeItems.length === 0 && !showAll) return null

  const token = getAuthToken()
  const unread = activeItems.filter((a) => !a.readAt).length
  const visible = showAll ? [...activeItems, ...pastItems] : activeItems.slice(0, HOME_MAX)

  const open = (a) => {
    setOpenId(openId === a.id ? null : a.id)
    if (!a.readAt && token) {
      setItems((list) => list.map((x) => (x.id === a.id ? { ...x, readAt: new Date().toISOString() } : x)))
      post(`/api/v1/family/announcements/${a.id}/read`, token)
    }
  }
  const ack = (a) => {
    if (!token) return
    setItems((list) => list.map((x) => (x.id === a.id ? { ...x, ackedAt: new Date().toISOString(), readAt: x.readAt || new Date().toISOString() } : x)))
    post(`/api/v1/family/announcements/${a.id}/ack`, token)
    if (toast) toast('Đã xác nhận với cô ✨')
  }

  return (
    <div className="card" style={{ padding: '12px 14px', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <b style={{ fontSize: 15, color: 'var(--c-text, #3A2A33)' }}>📣 Thông báo của cô</b>
        {unread > 0 && (
          <span style={{ fontSize: 11.5, fontWeight: 800, padding: '2px 9px', borderRadius: 999, background: 'var(--c-accent, #D9577F)', color: 'var(--c-on-accent, #fff)' }}>
            {unread} mới
          </span>
        )}
      </div>

      {visible.map((a) => {
        const isOpen = openId === a.id
        const isPast = a.status === 'expired'
        const needAck = a.requireAck && !a.ackedAt && !isPast
        return (
          <div
            key={a.id}
            data-testid={isPast ? 'ann-past' : 'ann-active'}
            style={{
              opacity: isPast ? 0.55 : 1,
              borderRadius: 14,
              border: `1.5px solid ${a.readAt ? 'var(--c-line, #F4DDE7)' : 'var(--c-accent, #D9577F)'}`,
              background: a.readAt ? 'var(--c-surface, #fff)' : 'var(--c-surface-2, #FDE8EF)',
              padding: '9px 11px',
            }}
          >
            <button
              type="button"
              onClick={() => open(a)}
              aria-expanded={isOpen}
              style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {!a.readAt && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-accent, #D9577F)', flex: '0 0 auto' }} />}
                {a.pinned && !isPast && <span title="Cô ghim">📌</span>}
                {isPast && <span style={{ fontSize: 11, fontWeight: 800, padding: '1px 7px', borderRadius: 999, background: 'var(--c-line, #EADFCF)', color: 'var(--c-text-2, #6B5D6B)' }}>Đã qua</span>}
                <b style={{ fontSize: 14, color: 'var(--c-text, #3A2A33)', flex: 1, minWidth: 0 }}>
                  {a.title || (a.kind === 'reminder' ? 'Lời nhắc của cô' : 'Thông báo')}
                </b>
                <span style={{ fontSize: 11.5, color: 'var(--c-text-2, #6B5D6B)', flex: '0 0 auto' }}>{timeAgo(a.createdAt)}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--c-text-2, #6B5D6B)', marginTop: 2 }}>
                {teacherLabel(a.teacherName)}
                {a.className ? ` · ${a.className}` : ''}
                {a.childName ? ` · ${a.childName}` : ''}
                {a.kind === 'reminder' && a.remindFor ? ` · nhắc cho ${new Date(a.remindFor).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}` : ''}
              </div>
              {!isOpen && a.body && (
                <div style={{ fontSize: 13, color: 'var(--c-text, #3A2A33)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.body}
                </div>
              )}
            </button>

            {isOpen && (
              <div style={{ fontSize: 13.5, color: 'var(--c-text, #3A2A33)', marginTop: 6, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{a.body}</div>
            )}

            {needAck && (
              <button className="btn solid" style={{ width: '100%', marginTop: 8, padding: '8px 12px', fontSize: 13 }} onClick={() => ack(a)}>
                ✅ Đã đọc, xác nhận với cô
              </button>
            )}
            {a.requireAck && a.ackedAt && (
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-good-fg, #1F7A5C)', marginTop: 6 }}>✓ Đã xác nhận với cô</div>
            )}
          </div>
        )
      })}

      {(activeItems.length > HOME_MAX || pastItems.length > 0 || showAll) && (
        <button className="btn ghost" style={{ padding: '7px 12px', fontSize: 12.5 }} onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Thu gọn' : 'Xem tất cả thông báo của cô'}
        </button>
      )}
    </div>
  )
}
