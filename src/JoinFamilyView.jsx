import React, { useState, useEffect } from 'react'
import { getPublicInvite, acceptInvite, setAuthToken } from './api'
import { soundSuccess, soundWrong, soundPop } from './audio'

export function JoinFamilyView({ inviteCode, onJoined, onCancel, toast, boom }) {
  const [code, setCode] = useState((inviteCode || '').toUpperCase())
  const [inviteInfo, setInviteInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form input
  const [displayName, setDisplayName] = useState('')
  const [relation, setRelation] = useState('Bố')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchInvite = async (c) => {
    if (!c || c.length < 4) return
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await getPublicInvite(c)
      if (res.ok && res.valid) {
        setInviteInfo(res)
        if (res.relationHint) setRelation(res.relationHint)
      } else {
        setInviteInfo(null)
        setErrorMsg(res.error?.message || 'Mã mời không tồn tại hoặc đã hết hạn')
      }
    } catch {
      setErrorMsg('Lỗi kiểm tra mã mời. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (inviteCode) {
      fetchInvite(inviteCode)
    }
  }, [inviteCode])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!displayName.trim()) {
      toast('Vui lòng nhập tên hiển thị của bạn')
      return
    }
    if (!pin || !/^\d{4,6}$/.test(pin)) {
      toast('Mã PIN phải từ 4 đến 6 chữ số')
      return
    }
    if (pin !== pinConfirm) {
      toast('Mã PIN nhập lại không khớp')
      return
    }

    soundPop(550)
    setSubmitting(true)
    try {
      const res = await acceptInvite(code, {
        displayName: displayName.trim(),
        relation,
        pin,
      })

      if (res.ok && res.token) {
        setAuthToken(res.token)
        soundSuccess()
        boom?.()
        toast(`Chào mừng ${relation} ${displayName.trim()} đã vào nhà! 🎉`)
        onJoined?.(res)
      } else {
        soundWrong()
        toast(res.error?.message || 'Không thể gia nhập gia đình')
      }
    } catch {
      toast('Lỗi kết nối khi gia nhập')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 100%)',
      }}
    >
      <div
        className="card pop"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 24,
          borderRadius: 20,
          border: '2px solid #C7D2FE',
          background: '#FFFFFF',
          boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🏠</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#1E1B4B', margin: 0 }}>
            Tham gia gia đình
          </h2>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
            Cùng người thân theo dõi và hướng dẫn các con học tập mỗi ngày
          </p>
        </div>

        {/* Chưa có thông tin mã mời -> Ô nhập mã */}
        {!inviteInfo && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Nhập mã mời 6 ký tự:
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
              <input
                className="field field-code"
                placeholder="Ví dụ: X5N9AP"
                value={code}
                maxLength={8}
                onChange={(e) => setCode(e.target.value.toUpperCase().trim())}
                style={{
                  flex: 1,
                  fontFamily: code ? 'monospace' : 'inherit',
                  fontSize: code ? 18 : 14.5,
                  fontWeight: code ? 800 : 400,
                  letterSpacing: code ? 3 : 0,
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  height: 48,
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                className="btn solid grow0"
                style={{
                  width: 'auto',
                  minWidth: 110,
                  whiteSpace: 'nowrap',
                  padding: '0 16px',
                  height: 48,
                  minHeight: 48,
                  fontSize: 14,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                }}
                disabled={loading || code.length < 4}
                onClick={() => fetchInvite(code)}
              >
                {loading ? '…' : 'Kiểm tra'}
              </button>
            </div>
            {errorMsg && (
              <div style={{ color: '#EF4444', fontSize: 12.5, marginTop: 8, textAlign: 'center' }}>
                ⚠️ {errorMsg}
              </div>
            )}
          </div>
        )}

        {/* Đã xác thực mã mời -> Form điền thông tin */}
        {inviteInfo && (
          <div>
            <div
              style={{
                padding: '12px 14px',
                background: '#F0FDF4',
                borderRadius: 14,
                border: '1.5px solid #BBF7D0',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 28 }}>💌</div>
              <div style={{ flex: 1, fontSize: 13, color: '#166534', lineHeight: 1.4 }}>
                <b>{inviteInfo.inviterName}</b> mời bạn tham gia cùng gia đình <b>{inviteInfo.familyName}</b>!
                <div style={{ fontSize: 11.5, color: '#15803D', marginTop: 2 }}>
                  Vai trò: <b>{inviteInfo.role === 'guardian' ? 'Kèm con (Chụp & Giảng bài)' : 'Chỉ xem (Xem báo cáo)'}</b>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Tên hiển thị của bạn:
                </label>
                <input
                  className="field"
                  placeholder="Ví dụ: Tuấn, Lan, Ngoại..."
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Quan hệ với con:
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['Bố', 'Mẹ', 'Bà', 'Ông', 'Cô/Chú', 'Gia sư', 'Khác'].map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setRelation(rel)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 99,
                        border: relation === rel ? '1.5px solid #4F46E5' : '1px solid #E2E8F0',
                        background: relation === rel ? '#EEF2FF' : '#FFFFFF',
                        color: relation === rel ? '#4F46E5' : '#475569',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Mã PIN cá nhân (4 - 6 số):
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  className="field"
                  placeholder="Nhập 4 - 6 chữ số"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Xác nhận mã PIN:
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  className="field"
                  placeholder="Nhập lại mã PIN"
                  value={pinConfirm}
                  onChange={(e) => setPinConfirm(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn solid"
                disabled={submitting}
                style={{
                  width: '100%',
                  marginTop: 6,
                  fontWeight: 800,
                  fontSize: 14.5,
                  background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                }}
              >
                {submitting ? 'Đang vào nhà…' : 'Vào nhà cùng con 🚀'}
              </button>
            </form>
          </div>
        )}

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            type="button"
            className="btn ghost"
            style={{ fontSize: 12.5, color: '#64748B' }}
            onClick={onCancel}
          >
            ← Về màn hình chính
          </button>
        </div>
      </div>
    </div>
  )
}
