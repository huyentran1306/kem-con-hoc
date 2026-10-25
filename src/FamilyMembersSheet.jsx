import { appConfirm } from './dialog'
import React, { useState, useEffect } from 'react'
import {
  getFamilyMembers,
  createFamilyInvite,
  getFamilyInvites,
  revokeFamilyInvite,
  updateFamilyMember,
  deleteFamilyMember,
  createDeviceCode,
} from './api'
import { soundPop, soundSuccess, soundWrong } from './audio'

export function FamilyMembersSheet({ onClose, toast, currentUser, familyName }) {
  const [tab, setTab] = useState('members') // 'members' | 'invite' | 'device'
  const [members, setMembers] = useState([])
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)

  // Form mời
  const [inviteRole, setInviteRole] = useState('guardian')
  const [relationHint, setRelationHint] = useState('Bố')
  const [createdInvite, setCreatedInvite] = useState(null)
  const [inviteLoading, setInviteLoading] = useState(false)

  // Form mã thiết bị
  const [deviceCode, setDeviceCode] = useState(null)
  const [deviceLoading, setDeviceLoading] = useState(false)

  const isOwner = currentUser?.role === 'owner'
  const isGuardian = currentUser?.role === 'guardian'
  const canInvite = isOwner || isGuardian

  const loadData = async () => {
    setLoading(true)
    try {
      const [mRes, iRes] = await Promise.all([getFamilyMembers(), getFamilyInvites()])
      if (mRes.ok) setMembers(mRes.members || [])
      if (iRes.ok) setInvites(iRes.invites || [])
    } catch (e) {
      console.warn('load members/invites failed:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateInvite = async () => {
    soundPop(550)
    setInviteLoading(true)
    try {
      const res = await createFamilyInvite({ role: inviteRole, relationHint })
      if (res.ok) {
        soundSuccess()
        setCreatedInvite(res.invite)
        toast('Đã tạo mã mời thành công! 🎉')
        loadData()
      } else {
        soundWrong()
        toast(res.error?.message || 'Không tạo được mã mời')
      }
    } catch (e) {
      toast('Lỗi kết nối khi tạo mã mời')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleRevokeInvite = async (code) => {
    if (!(await appConfirm(`Mã mời ${code} sẽ không dùng được nữa.`, { title: 'Thu hồi mã mời?', okText: 'Thu hồi' }))) return
    try {
      const res = await revokeFamilyInvite(code)
      if (res.ok) {
        toast(`Đã thu hồi mã mời ${code}`)
        loadData()
      }
    } catch {
      toast('Lỗi khi thu hồi mã mời')
    }
  }

  const handleChangeRole = async (memberId, currentRole) => {
    const newRole = currentRole === 'guardian' ? 'viewer' : 'guardian'
    const roleName = newRole === 'guardian' ? 'Kèm con' : 'Chỉ xem'
    if (!(await appConfirm(`Đổi vai trò thành viên này sang "${roleName}"?`, { okText: 'Đổi vai trò' }))) return
    try {
      const res = await updateFamilyMember(memberId, { role: newRole })
      if (res.ok) {
        toast(`Đã chuyển sang vai trò ${roleName}`)
        loadData()
      }
    } catch {
      toast('Lỗi cập nhật vai trò')
    }
  }

  const handleDeleteMember = async (memberId, name) => {
    if (!(await appConfirm(`Xoá thành viên "${name}" khỏi gia đình?`, { danger: true }))) return
    try {
      const res = await deleteFamilyMember(memberId)
      if (res.ok) {
        toast(`Đã xoá thành viên ${name}`)
        loadData()
      } else {
        toast(res.error?.message || 'Không xoá được thành viên')
      }
    } catch {
      toast('Lỗi khi xoá thành viên')
    }
  }

  const handleCreateDeviceCode = async () => {
    soundPop(600)
    setDeviceLoading(true)
    try {
      const res = await createDeviceCode()
      if (res.ok) {
        soundSuccess()
        setDeviceCode(res)
        toast('Mã đăng nhập máy mới có hiệu lực trong 15 phút! ⏱️')
      } else {
        toast(res.error?.message || 'Không tạo được mã đăng nhập máy mới')
      }
    } catch {
      toast('Lỗi tạo mã đăng nhập máy mới')
    } finally {
      setDeviceLoading(false)
    }
  }

  const getJoinUrl = (code) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}/join/${code}`
  }

  const handleShareZalo = async (code) => {
    const joinUrl = getJoinUrl(code)
    const text = `${familyName || 'Gia đình'} mời bạn cùng kèm con trên app Kèm Con Học! Nhập mã [${code}] hoặc bấm vào link để vào nhà:`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Lời mời Kèm Con Học', text, url: joinUrl })
        toast('Đã mở bảng chia sẻ! 📲')
        return
      } catch (err) {
        if (err.name !== 'AbortError') console.warn('share error:', err)
      }
    }
    // Fallback mở Zalo Web share
    window.open(`https://zalo.me/share?url=${encodeURIComponent(joinUrl)}&title=${encodeURIComponent(text)}`, '_blank')
    toast('Đã mở chia sẻ Zalo 📲')
  }

  const handleCopy = async (txt, label = 'link') => {
    try {
      await navigator.clipboard.writeText(txt)
      toast(`Đã sao chép ${label}! 📋`)
    } catch {
      toast('Vui lòng chọn và sao chép thủ công')
    }
  }

  const roleBadge = (role) => {
    if (role === 'owner') return <span style={{ padding: '2px 8px', borderRadius: 99, background: '#FEF3C7', color: '#B45309', fontSize: 11, fontWeight: 700 }}>Chủ nhà</span>
    if (role === 'guardian') return <span style={{ padding: '2px 8px', borderRadius: 99, background: '#DCFCE7', color: '#166534', fontSize: 11, fontWeight: 700 }}>Kèm con</span>
    return <span style={{ padding: '2px 8px', borderRadius: 99, background: '#F1F5F9', color: '#64748B', fontSize: 11, fontWeight: 700 }}>Chỉ xem</span>
  }

  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet-content" style={{ maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p className="title" style={{ margin: 0 }}>👨‍👩‍👧 Thành viên gia đình</p>
          <button className="round-btn" onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        {/* Tab chuyển đổi */}
        <div style={{ display: 'flex', gap: 6, background: '#F1F5F9', padding: 4, borderRadius: 12, marginBottom: 16 }}>
          <button
            onClick={() => setTab('members')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              fontSize: 13,
              background: tab === 'members' ? '#FFFFFF' : 'transparent',
              color: tab === 'members' ? '#1E293B' : '#64748B',
              boxShadow: tab === 'members' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
            }}
          >
            Thành viên ({members.length})
          </button>
          {canInvite && (
            <button
              onClick={() => setTab('invite')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                background: tab === 'invite' ? '#FFFFFF' : 'transparent',
                color: tab === 'invite' ? '#1E293B' : '#64748B',
                boxShadow: tab === 'invite' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
              }}
            >
              ➕ Mời người thân
            </button>
          )}
          <button
            onClick={() => setTab('device')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              fontSize: 13,
              background: tab === 'device' ? '#FFFFFF' : 'transparent',
              color: tab === 'device' ? '#1E293B' : '#64748B',
              boxShadow: tab === 'device' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
            }}
          >
            💻 Máy khác
          </button>
        </div>

        {/* 1. TAB DANH SÁCH THÀNH VIÊN */}
        {tab === 'members' && (
          <div>
            <p className="sub" style={{ marginBottom: 12 }}>
              Các thành viên dùng chung dữ liệu học của các con. Mọi buổi học đều ghi công chính xác ai kèm.
            </p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>Đang tải danh sách thành viên…</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {members.map((m) => {
                  const isSelf = m.id === currentUser?.id
                  return (
                    <div
                      key={m.id}
                      className="card"
                      style={{
                        padding: '12px 14px',
                        border: isSelf ? '1.5px solid #8B5CF6' : '1px solid #E2E8F0',
                        background: isSelf ? '#FAF5FF' : '#FFFFFF',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            background: m.role === 'owner' ? '#FDE68A' : m.role === 'guardian' ? '#BBF7D0' : '#E2E8F0',
                            color: m.role === 'owner' ? '#B45309' : m.role === 'guardian' ? '#15803D' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 18,
                          }}
                        >
                          {(m.displayName || m.relation || 'U')[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <b style={{ fontSize: 14.5, color: '#1E293B' }}>{m.relation ? `${m.relation} ` : ''}{m.displayName}</b>
                            {isSelf && <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 700 }}>(Bạn)</span>}
                            {roleBadge(m.role)}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748B' }}>
                            {m.sessionsWeek > 0 ? (
                              <span style={{ color: '#059669', fontWeight: 700 }}>🌟 Đã kèm {m.sessionsWeek} buổi tuần này</span>
                            ) : (
                              <span>Chưa có buổi kèm nào tuần này</span>
                            )}
                          </div>
                        </div>

                        {/* Thao tác của Chủ nhà */}
                        {isOwner && !isSelf && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="round-btn"
                              title="Đổi vai trò"
                              onClick={() => handleChangeRole(m.id, m.role)}
                              style={{ width: 32, height: 32, fontSize: 13 }}
                            >
                              ⚙️
                            </button>
                            <button
                              className="round-btn"
                              title="Xoá thành viên"
                              onClick={() => handleDeleteMember(m.id, m.displayName)}
                              style={{ width: 32, height: 32, fontSize: 13, color: '#EF4444' }}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Danh sách mã mời đang chờ */}
            {invites.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <b style={{ fontSize: 13.5, color: '#475569', display: 'block', marginBottom: 8 }}>
                  Mã mời đang chờ người thân vào ({invites.length}):
                </b>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {invites.map((inv) => (
                    <div
                      key={inv.code}
                      style={{
                        padding: '10px 12px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 800, color: '#2563EB', letterSpacing: 1.5 }}>
                            {inv.code}
                          </span>
                          <span style={{ fontSize: 11, color: '#64748B' }}>
                            ({inv.relationHint ? `Gợi ý: ${inv.relationHint} · ` : ''}{inv.role === 'guardian' ? 'Kèm con' : 'Chỉ xem'})
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>
                          Hết hạn: {new Date(inv.expiresAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn ghost"
                          style={{ padding: '4px 8px', fontSize: 12 }}
                          onClick={() => handleShareZalo(inv.code)}
                        >
                          Gửi Zalo
                        </button>
                        <button
                          className="btn ghost"
                          style={{ padding: '4px 8px', fontSize: 12, color: '#EF4444' }}
                          onClick={() => handleRevokeInvite(inv.code)}
                        >
                          Thu hồi
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. TAB MỜI NGƯỜI THÂN */}
        {tab === 'invite' && (
          <div>
            {!createdInvite ? (
              <div>
                <p className="sub" style={{ marginBottom: 14 }}>
                  Tạo mã mời 6 chữ số để gửi cho Bố, Ông Bà hoặc Gia sư cùng kèm con.
                </p>

                <div className="card" style={{ padding: 14 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13, color: '#334155' }}>
                    1. Người được mời sẽ đóng vai trò gì?
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                    <button
                      type="button"
                      onClick={() => setInviteRole('guardian')}
                      disabled={!isOwner}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 10,
                        border: inviteRole === 'guardian' ? '2px solid #10B981' : '1px solid #CBD5E1',
                        background: inviteRole === 'guardian' ? '#ECFDF5' : '#FFFFFF',
                        color: inviteRole === 'guardian' ? '#065F46' : '#64748B',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: isOwner ? 'pointer' : 'not-allowed',
                      }}
                    >
                      ✏️ Kèm con
                      <span style={{ display: 'block', fontSize: 10.5, fontWeight: 400, marginTop: 2 }}>
                        Chụp bài, cùng giảng bài
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteRole('viewer')}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 10,
                        border: inviteRole === 'viewer' ? '2px solid #3B82F6' : '1px solid #CBD5E1',
                        background: inviteRole === 'viewer' ? '#EFF6FF' : '#FFFFFF',
                        color: inviteRole === 'viewer' ? '#1E40AF' : '#64748B',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      👀 Chỉ xem
                      <span style={{ display: 'block', fontSize: 10.5, fontWeight: 400, marginTop: 2 }}>
                        Xem báo cáo, tiến độ
                      </span>
                    </button>
                  </div>

                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13, color: '#334155' }}>
                    2. Quan hệ với con (Gợi ý)
                  </label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {['Bố', 'Mẹ', 'Bà', 'Ông', 'Cô/Chú', 'Gia sư', 'Khác'].map((rel) => (
                      <button
                        key={rel}
                        type="button"
                        onClick={() => setRelationHint(rel)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 99,
                          border: relationHint === rel ? '1.5px solid #7C3AED' : '1px solid #E2E8F0',
                          background: relationHint === rel ? '#F5F3FF' : '#FFFFFF',
                          color: relationHint === rel ? '#7C3AED' : '#475569',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>

                  <button
                    className="btn solid"
                    disabled={inviteLoading}
                    onClick={handleCreateInvite}
                    style={{ width: '100%', fontWeight: 800 }}
                  >
                    {inviteLoading ? 'Đang tạo mã…' : 'Tạo mã mời 6 chữ số ✨'}
                  </button>
                </div>
              </div>
            ) : (
              /* Đã tạo mã mời xong */
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    padding: '20px 14px',
                    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                    borderRadius: 16,
                    border: '2px solid #BFDBFE',
                    marginBottom: 16,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Mã mời tham gia gia đình (Hạn 72 giờ)
                  </span>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      fontFamily: 'monospace',
                      letterSpacing: 6,
                      color: '#1D4ED8',
                      margin: '10px 0',
                    }}
                  >
                    {createdInvite.code}
                  </div>
                  <p style={{ fontSize: 12.5, color: '#475569', margin: '4px 0 0' }}>
                    Dành cho: <b>{createdInvite.relationHint || 'Người thân'}</b> ({createdInvite.role === 'guardian' ? 'Kèm con' : 'Chỉ xem'})
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  <button
                    className="btn solid"
                    style={{ background: '#0284C7', fontWeight: 800 }}
                    onClick={() => handleShareZalo(createdInvite.code)}
                  >
                    💬 Gửi qua Zalo ngay
                  </button>
                  <button
                    className="btn soft"
                    onClick={() => handleCopy(getJoinUrl(createdInvite.code), 'link mời')}
                  >
                    📋 Sao chép link tham gia
                  </button>
                  <button
                    className="btn ghost"
                    onClick={() => setCreatedInvite(null)}
                  >
                    Tạo thêm mã khác
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. TAB ĐĂNG NHẬP MÁY KHÁC */}
        {tab === 'device' && (
          <div>
            <p className="sub" style={{ marginBottom: 14 }}>
              Khi bạn hoặc người thân muốn đăng nhập app trên điện thoại/máy tính mới mà <b>không cần nhập mật khẩu chung</b> của gia đình.
            </p>

            <div className="card" style={{ padding: 14, textAlign: 'center' }}>
              {!deviceCode ? (
                <div>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>💻 📲</div>
                  <b style={{ fontSize: 15, color: '#1E293B', display: 'block', marginBottom: 6 }}>
                    Mã đăng nhập thiết bị mới
                  </b>
                  <p style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5, marginBottom: 16 }}>
                    Mã này gắn với tài khoản của bạn, có hiệu lực trong <b>15 phút</b>. Trên máy mới, bạn chỉ cần nhập mã này kèm mã PIN cá nhân là vào được ngay.
                  </p>
                  <button
                    className="btn solid"
                    disabled={deviceLoading}
                    onClick={handleCreateDeviceCode}
                    style={{ width: '100%', fontWeight: 800 }}
                  >
                    {deviceLoading ? 'Đang tạo mã…' : 'Lấy mã đăng nhập máy mới ⏱️'}
                  </button>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                    Mã máy mới (Có hiệu lực 15 phút)
                  </span>
                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 900,
                      fontFamily: 'monospace',
                      letterSpacing: 5,
                      color: '#047857',
                      margin: '12px 0',
                    }}
                  >
                    {deviceCode.code}
                  </div>
                  <p style={{ fontSize: 12.5, color: '#64748B', marginBottom: 14 }}>
                    Mở app trên máy mới → Chọn <b>"Đăng nhập máy mới"</b> → Nhập mã trên và mã PIN cá nhân của bạn.
                  </p>
                  <button
                    className="btn soft"
                    onClick={() => handleCopy(deviceCode.code, 'mã máy mới')}
                  >
                    📋 Sao chép mã
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
