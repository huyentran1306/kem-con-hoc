/**
 * Màn đăng nhập quản trị và màn chờ kiểm tra phiên (Đợt 15 · Chặng 2)
 * Nền kem, gấu, dùng bộ quy chuẩn src/ui/staff.
 */
import { useState } from 'react'
import { GATEWAY } from '../api'
import { BearMascot, Button, Field, Input, Banner } from '../ui/staff'

export function ShellChecking({ text = 'Đang kiểm tra phiên…' }) {
  return (
    <div className="kadm-center" role="status" aria-live="polite">
      <div className="kadm-checking">
        <BearMascot mood="greeting" size={64} />
        <p>{text}</p>
      </div>
    </div>
  )
}

export function ShellLogin({ onLoggedIn, onExit, notice = '' }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !pass) {
      setError('Vui lòng nhập email và mật khẩu')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`${GATEWAY}/api/v1/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.token) {
        setPass('')
        await onLoggedIn(data.token)
      } else {
        setError(data.error?.message || 'Email hoặc mật khẩu không chính xác')
      }
    } catch (err) {
      setError('Không kết nối được máy chủ')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="kadm-center">
      <div className="kadm-auth-card">
        <div className="kadm-auth-bear">
          <BearMascot mood="greeting" size={84} />
        </div>
        <h1 className="kadm-auth-title">Kèm Con Học · Quản trị</h1>
        <p className="kadm-auth-sub">Đăng nhập tài khoản quản trị để vận hành hệ thống</p>

        {notice && !error && <Banner type="warn" message={notice} style={{ marginBottom: 14 }} />}
        {error && <Banner type="bad" message={error} style={{ marginBottom: 14 }} />}

        <form onSubmit={submit} className="kadm-auth-form" noValidate>
          <Field label="Email quản trị viên">
            <Input
              type="email"
              autoComplete="username"
              placeholder="ten@vidu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email quản trị viên"
            />
          </Field>
          <Field label="Mật khẩu">
            <div className="kadm-pass-row">
              <Input
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Nhập mật khẩu…"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                aria-label="Mật khẩu"
                style={{ flex: 1 }}
              />
              <Button variant="ghost" size="sm" onClick={() => setShowPass((v) => !v)} aria-pressed={showPass}>
                {showPass ? 'Ẩn' : 'Hiện'}
              </Button>
            </div>
          </Field>
          <Button type="submit" size="lg" disabled={busy} style={{ width: '100%', marginTop: 6 }}>
            {busy ? 'Đang xác thực…' : 'Đăng nhập'}
          </Button>
        </form>

        {onExit && (
          <div className="kadm-auth-foot">
            <button type="button" className="kadm-link" onClick={onExit}>
              ← Quay lại app phụ huynh
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
