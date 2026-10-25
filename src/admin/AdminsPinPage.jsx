/**
 * Quản trị viên & PIN (Đợt 15 · Chặng 3)
 * - Bảng thật từ /api/v1/admin/admins; trống thì EmptyState (không còn dòng Superadmin giả)
 * - Mời quản trị viên bằng Drawer; đổi PIN bằng ConfirmDialog, gọi /api/v1/admin/auth/set-pin
 * - Tự khoá màn hình: lưu qua /api/v1/admin/auth/auto-lock
 */
import { useEffect, useState } from 'react'
import { PageHeader, Card, Button, DataTable, EmptyState, Drawer, Field, Input, Select, Segmented, StatusPill, ConfirmDialog, Banner, staffToast, staffConfirm } from '../ui/staff'
import { adminJson, errMessage, fmtDateTime, ROLE_LABELS } from './systemShared'
import './pages-system.css'

const ROLE_OPTIONS = [
  { value: 'editor', label: 'Soạn nội dung', hint: 'Prompt, sư phạm, xem buổi học' },
  { value: 'support', label: 'Hỗ trợ', hint: 'Hỗ trợ phụ huynh, chỉ xem nhóm Theo dõi' },
  { value: 'superadmin', label: 'Toàn quyền', hint: 'Mọi trang, kể cả SQL Studio' },
]

export default function AdminsPinPage({ adminProfile }) {
  const role = adminProfile?.role || 'superadmin'
  const isSuper = role === 'superadmin'
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inv, setInv] = useState({ name: '', email: '', role: 'editor' })
  const [inviteBusy, setInviteBusy] = useState(false)
  const [created, setCreated] = useState(null)

  const [pinOpen, setPinOpen] = useState(false)
  const [pin1, setPin1] = useState('')
  const [pin2, setPin2] = useState('')
  const [pinBusy, setPinBusy] = useState(false)

  const [autoLock, setAutoLock] = useState(Number(adminProfile?.autoLockMins) || 15)

  const load = async () => {
    setLoading(true)
    setListError('')
    const r = await adminJson('/api/v1/admin/admins')
    if (r.ok) setAdmins(Array.isArray(r.data?.admins) ? r.data.admins : [])
    else {
      setAdmins([])
      setListError(errMessage(r, 'Chưa tải được danh sách quản trị viên'))
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inv.email.trim())
  const submitInvite = async () => {
    if (!emailOk) {
      staffToast('Email chưa đúng định dạng', { tone: 'bad' })
      return
    }
    if (inv.role === 'superadmin') {
      const ok = await staffConfirm({
        title: 'Cấp toàn quyền?',
        message: `${inv.email.trim()} sẽ xem và chỉnh được mọi trang, kể cả SQL Studio.`,
        confirmText: 'Cấp toàn quyền',
        danger: true,
      })
      if (!ok) return
    }
    setInviteBusy(true)
    const r = await adminJson('/api/v1/admin/admins', {
      method: 'POST',
      body: { email: inv.email.trim(), name: inv.name.trim() || inv.email.trim().split('@')[0], role: inv.role },
    })
    setInviteBusy(false)
    if (!r.ok) {
      staffToast(errMessage(r, 'Chưa tạo được tài khoản'), { tone: 'bad' })
      return
    }
    setCreated(r.data)
    staffToast('Đã tạo tài khoản quản trị viên')
    load()
  }
  const closeInvite = () => {
    setInviteOpen(false)
    setCreated(null)
    setInv({ name: '', email: '', role: 'editor' })
  }

  const submitPin = async () => {
    if (!/^\d{4,6}$/.test(pin1)) {
      staffToast('Mã PIN gồm 4 đến 6 chữ số', { tone: 'bad' })
      return
    }
    if (pin1 !== pin2) {
      staffToast('Hai lần nhập PIN chưa khớp', { tone: 'bad' })
      return
    }
    setPinBusy(true)
    const r = await adminJson('/api/v1/admin/auth/set-pin', { method: 'POST', body: { pin: pin1 } })
    setPinBusy(false)
    if (!r.ok) {
      staffToast(errMessage(r, 'Chưa đổi được mã PIN'), { tone: 'bad' })
      return
    }
    setPinOpen(false)
    setPin1('')
    setPin2('')
    staffToast('Đã đổi mã PIN mở khoá nhanh')
  }

  const changeAutoLock = async (mins) => {
    const prev = autoLock
    setAutoLock(mins)
    const r = await adminJson('/api/v1/admin/auth/auto-lock', { method: 'POST', body: { mins } })
    if (!r.ok) {
      setAutoLock(prev)
      staffToast(errMessage(r, 'Chưa lưu được thời gian tự khoá'), { tone: 'bad' })
      return
    }
    staffToast(`Màn hình sẽ tự khoá sau ${mins} phút không thao tác`, {
      undo: async () => {
        const u = await adminJson('/api/v1/admin/auth/auto-lock', { method: 'POST', body: { mins: prev } })
        if (u.ok) setAutoLock(prev)
      },
    })
  }

  const columns = [
    {
      key: 'email',
      title: 'Quản trị viên',
      render: (_, a) => (
        <span className="sys-admin-cell">
          <b>{a.display_name || a.name || a.email?.split('@')[0] || 'Quản trị viên'}</b>
          <small>{a.email || '·'}</small>
        </span>
      ),
    },
    { key: 'role', title: 'Vai trò', render: (v) => <StatusPill status={v === 'superadmin' ? 'warn' : 'info'} label={ROLE_LABELS[v] || v || '·'} /> },
    { key: 'auto_lock_mins', title: 'Tự khoá', render: (v) => (v ? `${v} phút` : '·') },
    { key: 'created_at', title: 'Ngày tạo', render: (v) => fmtDateTime(v) },
    {
      key: 'me',
      title: '',
      align: 'right',
      render: (_, a) => (a.id === adminProfile?.id || (a.email && a.email === adminProfile?.email) ? <StatusPill status="ok" label="Bạn" /> : null),
    },
  ]

  return (
    <div className="sys-page">
      <PageHeader
        title="Quản trị viên & PIN"
        description="Ai được vào trang quản trị, với vai trò gì; mã PIN mở khoá nhanh của bạn."
        actions={isSuper ? <Button onClick={() => setInviteOpen(true)}>+ Mời quản trị viên</Button> : null}
      />

      <div className="sys-grid-2">
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px 6px' }}>
            <h3 className="sys-card-title">Danh sách quản trị viên</h3>
            <p className="sys-card-desc">Toàn quyền · Soạn nội dung · Hỗ trợ</p>
          </div>
          {listError && !loading ? (
            <EmptyState
              mood="nudge"
              title={isSuper ? 'Chưa tải được danh sách' : 'Chỉ tài khoản toàn quyền xem được danh sách'}
              description={listError}
              actionText={isSuper ? 'Thử lại' : null}
              onAction={isSuper ? load : null}
              style={{ border: 'none', boxShadow: 'none' }}
            />
          ) : (
            <DataTable
              columns={columns}
              data={admins}
              loading={loading}
              rowKey="id"
              emptyTitle="Chưa có quản trị viên nào"
              emptyDescription="Mời người cùng làm để chia việc soạn prompt và hỗ trợ phụ huynh."
              emptyAction={isSuper ? { label: '+ Mời quản trị viên', onClick: () => setInviteOpen(true) } : null}
            />
          )}
        </Card>

        <Card>
          <div className="sys-stack">
            <div>
              <h3 className="sys-card-title">Bảo mật của bạn</h3>
              <p className="sys-card-desc">{adminProfile?.email || 'Tài khoản đang đăng nhập'}</p>
            </div>
            <Field label="Tự khoá màn hình sau" hint="Hết thời gian này không thao tác, trang quản trị hiện bàn phím PIN.">
              <Segmented
                value={autoLock}
                onChange={changeAutoLock}
                options={[
                  { value: 15, label: '15 phút' },
                  { value: 30, label: '30 phút' },
                  { value: 60, label: '60 phút' },
                ]}
              />
            </Field>
            <hr className="sys-hr" />
            <div className="sys-row-between">
              <div>
                <b style={{ fontSize: 14 }}>Mã PIN mở khoá nhanh</b>
                <p className="sys-card-desc">Mở lại phiên đang khoá mà không cần nhập mật khẩu dài.</p>
              </div>
              <Button variant="secondary" onClick={() => setPinOpen(true)}>Đổi mã PIN</Button>
            </div>
          </div>
        </Card>
      </div>

      <Drawer
        open={inviteOpen}
        title="Mời quản trị viên"
        onClose={closeInvite}
        footer={
          created ? (
            <Button onClick={closeInvite}>Xong</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={closeInvite}>Huỷ</Button>
              <Button onClick={submitInvite} disabled={inviteBusy || !emailOk}>{inviteBusy ? 'Đang tạo…' : 'Tạo tài khoản'}</Button>
            </>
          )
        }
      >
        {created ? (
          <div className="sys-stack">
            <div className="sys-result">
              <b>Đã tạo tài khoản {created.admin?.email}</b>
              <span>
                Mật khẩu tạm dùng một lần: <code>{created.tempPassword}</code>
              </span>
              <small>Mật khẩu chỉ hiện một lần. Gửi riêng cho người được mời, nhắc đổi sau lần đăng nhập đầu.</small>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                try {
                  navigator.clipboard.writeText(created.tempPassword)
                  staffToast('Đã chép mật khẩu tạm')
                } catch (e) {}
              }}
            >
              Chép mật khẩu tạm
            </Button>
          </div>
        ) : (
          <div className="sys-stack">
            <Field label="Họ và tên">
              <Input value={inv.name} onChange={(e) => setInv({ ...inv, name: e.target.value })} placeholder="Nguyễn Văn A" />
            </Field>
            <Field label="Email" error={inv.email && !emailOk ? 'Email chưa đúng định dạng' : null}>
              <Input type="email" value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} placeholder="ten@kemconhoc.vn" invalid={Boolean(inv.email && !emailOk)} />
            </Field>
            <Field label="Vai trò">
              <Select ariaLabel="Vai trò" value={inv.role} onChange={(v) => setInv({ ...inv, role: v })} options={ROLE_OPTIONS} />
            </Field>
            <Banner type="info" message="Máy chủ sinh mật khẩu tạm một lần; người được mời tự đặt mật khẩu mới." />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={pinOpen}
        title="Đổi mã PIN mở khoá nhanh"
        confirmText={pinBusy ? 'Đang lưu…' : 'Lưu mã PIN mới'}
        onCancel={() => {
          setPinOpen(false)
          setPin1('')
          setPin2('')
        }}
        onConfirm={submitPin}
        message={
          <div className="sys-stack" style={{ gap: 10 }}>
            <span>Mã PIN gồm 4 đến 6 chữ số, chỉ dùng cho tài khoản của bạn.</span>
            <Field label="Mã PIN mới">
              <Input type="password" inputMode="numeric" maxLength={6} autoComplete="new-password" value={pin1} onChange={(e) => setPin1(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••" style={{ maxWidth: 200 }} />
            </Field>
            <Field label="Nhập lại mã PIN" error={pin2 && pin1 !== pin2 ? 'Chưa khớp' : null}>
              <Input type="password" inputMode="numeric" maxLength={6} autoComplete="new-password" value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••" style={{ maxWidth: 200 }} />
            </Field>
          </div>
        }
      />
    </div>
  )
}
