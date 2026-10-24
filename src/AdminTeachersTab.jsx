/* ============================================================
   👩‍🏫 ADMIN: QUẢN LÝ & DUYỆT GIÁO VIÊN (TEACHER MANAGEMENT)
   Duyệt hồ sơ giáo viên đăng ký cổng Teacher Portal (trường học, khối lớp).
   Hỗ trợ Duyệt, Từ chối kèm lý do, Tạm khoá / Kích hoạt lại.
   ============================================================ */
import React, { useState, useEffect, useMemo } from 'react'
import { adminFetch } from './adminApi'
import { toast } from './utils'
import {
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  Search,
  RefreshCw,
  School,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  AlertCircle,
  UserCheck,
  UserX,
  PauseCircle,
} from 'lucide-react'

export function AdminTeachersTab() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all') // all | pending | approved | rejected | suspended
  const [searchTerm, setSearchTerm] = useState('')
  const [actionBusyId, setActionBusyId] = useState(null)

  // Modal từ chối
  const [rejectingTeacher, setRejectingTeacher] = useState(null)
  const [rejectReason, setRejectReason] = useState('Thông tin trường học hoặc thông tin liên hệ chưa xác thực được')

  // 1. Tải danh sách giáo viên
  const loadTeachers = async () => {
    setLoading(true)
    try {
      const endpoint = `/api/v1/admin/teachers${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`
      const res = await adminFetch(endpoint)
      const data = await res.json().catch(() => ({}))
      if (res.ok && Array.isArray(data.teachers)) {
        setTeachers(data.teachers)
      } else {
        toast(data.error?.message || 'Không thể tải danh sách giáo viên')
      }
    } catch (e) {
      console.warn('Load teachers error:', e)
      toast('Lỗi kết nối khi tải danh sách giáo viên')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeachers()
  }, [statusFilter])

  // 2. Duyệt giáo viên (Approve)
  const handleApprove = async (teacher) => {
    if (!window.confirm(`Xác nhận duyệt cho giáo viên "${teacher.display_name}" (${teacher.email})?`)) {
      return
    }
    setActionBusyId(teacher.id)
    try {
      const res = await adminFetch(`/api/v1/admin/teachers/${teacher.id}/approve`, {
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        toast(`✅ Đã duyệt thành công cho cô/thầy "${teacher.display_name}"!`)
        setTeachers((prev) =>
          prev.map((t) => (t.id === teacher.id ? { ...t, status: 'approved', review_note: null } : t))
        )
      } else {
        toast(data.error?.message || 'Lỗi khi duyệt giáo viên')
      }
    } catch (e) {
      toast('Lỗi kết nối đến máy chủ')
    } finally {
      setActionBusyId(null)
    }
  }

  // 3. Từ chối giáo viên (Reject)
  const handleConfirmReject = async () => {
    if (!rejectingTeacher) return
    setActionBusyId(rejectingTeacher.id)
    try {
      const res = await adminFetch(`/api/v1/admin/teachers/${rejectingTeacher.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: rejectReason.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        toast(`❌ Đã từ chối hồ sơ giáo viên "${rejectingTeacher.display_name}".`)
        setTeachers((prev) =>
          prev.map((t) =>
            t.id === rejectingTeacher.id ? { ...t, status: 'rejected', review_note: rejectReason.trim() } : t
          )
        )
        setRejectingTeacher(null)
      } else {
        toast(data.error?.message || 'Lỗi khi từ chối hồ sơ')
      }
    } catch (e) {
      toast('Lỗi kết nối máy chủ')
    } finally {
      setActionBusyId(null)
    }
  }

  // 4. Tạm khoá / Mở lại giáo viên (Suspend)
  const handleToggleSuspend = async (teacher) => {
    const isSuspended = teacher.status === 'suspended'
    const actionLabel = isSuspended ? 'MỞ KHOÁ' : 'TẠM KHOÁ'
    if (!window.confirm(`Bạn có chắc muốn ${actionLabel} tài khoản giáo viên "${teacher.display_name}"?`)) {
      return
    }
    setActionBusyId(teacher.id)
    try {
      const res = await adminFetch(`/api/v1/admin/teachers/${teacher.id}/suspend`, {
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        toast(`Đã ${actionLabel.toLowerCase()} giáo viên "${teacher.display_name}".`)
        setTeachers((prev) =>
          prev.map((t) => (t.id === teacher.id ? { ...t, status: data.status } : t))
        )
      } else {
        toast(data.error?.message || 'Lỗi khi thao tác')
      }
    } catch (e) {
      toast('Lỗi kết nối máy chủ')
    } finally {
      setActionBusyId(null)
    }
  }

  // Lọc theo tìm kiếm
  const filteredTeachers = useMemo(() => {
    if (!searchTerm.trim()) return teachers
    const q = searchTerm.trim().toLowerCase()
    return teachers.filter(
      (t) =>
        (t.display_name || '').toLowerCase().includes(q) ||
        (t.email || '').toLowerCase().includes(q) ||
        (t.school_name || '').toLowerCase().includes(q) ||
        (t.province || '').toLowerCase().includes(q) ||
        (t.phone || '').toLowerCase().includes(q)
    )
  }, [teachers, searchTerm])

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = teachers.length
    const pending = teachers.filter((t) => t.status === 'pending').length
    const approved = teachers.filter((t) => t.status === 'approved').length
    const rejected = teachers.filter((t) => t.status === 'rejected').length
    const suspended = teachers.filter((t) => t.status === 'suspended').length
    return { total, pending, approved, rejected, suspended }
  }, [teachers])

  return (
    <div style={{ padding: '4px 0 24px' }}>
      {/* KPI METRICS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div className="kpi-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 16, borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>Tổng Giáo Viên Đăng Ký</span>
            <span style={{ fontSize: 20 }}>👩‍🏫</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#0F172A' }}>{stats.total}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Tài khoản trên toàn hệ thống</div>
        </div>

        <div
          className="kpi-card"
          style={{
            background: stats.pending > 0 ? '#FEF3C7' : '#FFFFFF',
            border: stats.pending > 0 ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
            padding: 16,
            borderRadius: 14,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: stats.pending > 0 ? '#92400E' : '#64748B' }}>
              ⏳ Đang Chờ Duyệt
            </span>
            <span style={{ fontSize: 20 }}>🔔</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: stats.pending > 0 ? '#B45309' : '#0F172A' }}>
            {stats.pending}
          </div>
          <div style={{ fontSize: 12, color: stats.pending > 0 ? '#92400E' : '#64748B', marginTop: 4 }}>
            {stats.pending > 0 ? 'Cần admin phê duyệt hồ sơ' : 'Không có hồ sơ chờ duyệt'}
          </div>
        </div>

        <div className="kpi-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 16, borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>✅ Đã Duyệt Hoạt Động</span>
            <span style={{ fontSize: 20 }}>⭐</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#16A34A' }}>{stats.approved}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Được phép tạo lớp & giao bài</div>
        </div>

        <div className="kpi-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 16, borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>❌ Từ Chối / Tạm Khoá</span>
            <span style={{ fontSize: 20 }}>🛡️</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#DC2626' }}>
            {stats.rejected + stats.suspended}
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Từ chối: {stats.rejected} · Tạm khoá: {stats.suspended}</div>
        </div>
      </div>

      {/* TOOLBAR CONTROLS */}
      <div
        style={{
          background: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          marginBottom: 16,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            ['all', `Tất cả (${stats.total})`],
            ['pending', `⏳ Chờ duyệt (${stats.pending})`],
            ['approved', `✅ Đã duyệt (${stats.approved})`],
            ['rejected', `❌ Từ chối (${stats.rejected})`],
            ['suspended', `⏸️ Tạm khoá (${stats.suspended})`],
          ].map(([key, label]) => {
            const isActive = statusFilter === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  border: isActive ? '1.5px solid #4F46E5' : '1px solid #E2E8F0',
                  background: isActive ? '#EEF2FF' : '#F8FAFC',
                  color: isActive ? '#4338CA' : '#475569',
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Search & Refresh */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
            />
            <input
              type="text"
              placeholder="Tìm theo tên, email, trường..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 12.5,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="button"
            className="admin-btn sm"
            onClick={loadTeachers}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* TEACHERS LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#FFFFFF', borderRadius: 14 }}>
          <RefreshCw size={24} className="spin" color="#4F46E5" />
          <p style={{ marginTop: 12, color: '#64748B', fontSize: 13.5 }}>Đang tải danh sách hồ sơ giáo viên...</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0' }}>
          <p style={{ fontSize: 32, margin: 0 }}>👩‍🏫</p>
          <b style={{ fontSize: 15, color: '#1E293B', display: 'block', marginTop: 8 }}>
            Không tìm thấy giáo viên nào
          </b>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
            {statusFilter === 'pending'
              ? 'Tuyệt vời! Hiện tại không còn hồ sơ giáo viên nào chờ duyệt.'
              : 'Hãy thử đổi bộ lọc hoặc từ khoá tìm kiếm.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredTeachers.map((tc) => {
            const isBusy = actionBusyId === tc.id
            const isPending = tc.status === 'pending'
            const isApproved = tc.status === 'approved'
            const isRejected = tc.status === 'rejected'
            const isSuspended = tc.status === 'suspended'

            return (
              <div
                key={tc.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  border: isPending ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                  padding: '16px 20px',
                  boxShadow: isPending ? '0 4px 14px rgba(245, 158, 11, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                {/* Thông tin giáo viên */}
                <div style={{ flex: '1 1 340px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 24 }}>👩‍🏫</span>
                    <div>
                      <b style={{ fontSize: 16, color: '#0F172A' }}>{tc.display_name}</b>
                      <span
                        style={{
                          marginLeft: 10,
                          fontSize: 11.5,
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: isPending
                            ? '#FEF3C7'
                            : isApproved
                            ? '#DCFCE7'
                            : isSuspended
                            ? '#F1F5F9'
                            : '#FEE2E2',
                          color: isPending
                            ? '#B45309'
                            : isApproved
                            ? '#15803D'
                            : isSuspended
                            ? '#475569'
                            : '#B91C1C',
                        }}
                      >
                        {isPending && '⏳ Đang chờ duyệt'}
                        {isApproved && '✅ Đã duyệt'}
                        {isRejected && '❌ Đã từ chối'}
                        {isSuspended && '⏸️ Tạm khoá'}
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '6px 16px',
                      marginTop: 10,
                      fontSize: 12.5,
                      color: '#475569',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={14} color="#64748B" />
                      <span>{tc.email}</span>
                    </div>

                    {tc.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={14} color="#64748B" />
                        <span>{tc.phone}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <School size={14} color="#64748B" />
                      <b>{tc.school_name || 'Chưa cập nhật'}</b>
                      {tc.province && <span style={{ color: '#94A3B8' }}>({tc.province})</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <BookOpen size={14} color="#64748B" />
                      <span>Khối lớp: <b>{tc.grades || 'Chưa chọn'}</b></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color="#64748B" />
                      <span>Đăng ký: {tc.created_at ? new Date((tc.created_at || '').replace(' ', 'T')).toLocaleString('vi-VN') : 'Mới'}</span>
                    </div>
                  </div>

                  {/* Ghi chú từ chối nếu có */}
                  {tc.review_note && (
                    <div
                      style={{
                        marginTop: 10,
                        background: '#FEF2F2',
                        borderLeft: '3px solid #EF4444',
                        padding: '6px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        color: '#991B1B',
                      }}
                    >
                      <b>Lý do từ chối:</b> {tc.review_note}
                    </div>
                  )}
                </div>

                {/* HÀNH ĐỘNG CỦA ADMIN */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(tc)}
                        disabled={isBusy}
                        style={{
                          background: '#16A34A',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                        }}
                      >
                        <CheckCircle size={15} /> {isBusy ? 'Đang duyệt...' : '✅ Duyệt ngay'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRejectingTeacher(tc)
                          setRejectReason('Thông tin trường học hoặc thông tin liên hệ chưa xác thực được')
                        }}
                        disabled={isBusy}
                        style={{
                          background: '#FEE2E2',
                          color: '#B91C1C',
                          border: '1px solid #FCA5A5',
                          padding: '8px 12px',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <XCircle size={15} /> Từ chối
                      </button>
                    </>
                  )}

                  {isApproved && (
                    <>
                      <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 800, paddingRight: 6 }}>
                        ✓ Đang hoạt động
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleSuspend(tc)}
                        disabled={isBusy}
                        style={{
                          background: '#F8FAFC',
                          color: '#475569',
                          border: '1px solid #CBD5E1',
                          padding: '6px 10px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <PauseCircle size={14} /> Tạm khoá
                      </button>
                    </>
                  )}

                  {isSuspended && (
                    <button
                      type="button"
                      onClick={() => handleToggleSuspend(tc)}
                      disabled={isBusy}
                      style={{
                        background: '#EEF2FF',
                        color: '#4F46E5',
                        border: '1px solid #C7D2FE',
                        padding: '7px 12px',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <UserCheck size={14} /> Mở khoá lại
                    </button>
                  )}

                  {isRejected && (
                    <button
                      type="button"
                      onClick={() => handleApprove(tc)}
                      disabled={isBusy}
                      style={{
                        background: '#F0FDF4',
                        color: '#16A34A',
                        border: '1px solid #BBF7D0',
                        padding: '7px 12px',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <CheckCircle size={14} /> Xét duyệt lại
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL TỪ CHỐI GIÁO VIÊN */}
      {rejectingTeacher && (
        <div className="admin-modal-bg" onClick={() => setRejectingTeacher(null)}>
          <div className="admin-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>❌</span>
                <h3 style={{ margin: 0, fontSize: 16 }}>Từ chối hồ sơ giáo viên</h3>
              </div>
            </div>

            <div style={{ padding: '16px 20px' }}>
              <p style={{ margin: 0, fontSize: 13.5, color: '#334155' }}>
                Từ chối giáo viên: <b>{rejectingTeacher.display_name}</b> ({rejectingTeacher.email})
              </p>

              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginTop: 12, marginBottom: 6, color: '#475569' }}>
                Lý do từ chối (hiển thị khi giáo viên đăng nhập):
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: '100%',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  padding: 8,
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '12px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                className="admin-btn sm"
                onClick={() => setRejectingTeacher(null)}
              >
                Huỷ bỏ
              </button>
              <button
                type="button"
                className="admin-btn sm"
                onClick={handleConfirmReject}
                style={{ background: '#DC2626', color: '#FFFFFF', border: 'none', fontWeight: 700 }}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
