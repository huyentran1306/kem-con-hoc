import { useState, useContext } from 'react'
import { AppCtx } from './ctx'
import { familyLogin, familyRegister } from './api'
import { getTheme } from './themes'

export default function LoginScreen({ onAuthed, reauthSession = null, onOpenJoin = null }) {
  const { openAdmin, S } = useContext(AppCtx) || {}
  const activeThemeId = S?.theme || (typeof document !== 'undefined' ? document.documentElement.dataset.theme : null) || 'bear'
  const activeTheme = getTheme(activeThemeId)

  const [mode, setMode] = useState('login')
  const [name, setName] = useState(reauthSession?.name || '')
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    const n = name.trim()
    if (!n || !pass) {
      setErr('Nhập tên gia đình và mật khẩu nhé')
      return
    }
    if (mode === 'register') {
      if (pass.length < 4) {
        setErr('Mật khẩu tối thiểu 4 ký tự')
        return
      }
      if (pass !== pass2) {
        setErr('Mật khẩu nhập lại không khớp')
        return
      }
    }
    setBusy(true)
    setErr('')
    const res = mode === 'login' ? await familyLogin(n, pass) : await familyRegister(n, pass)
    setBusy(false)
    if (!res.ok) {
      setErr(res.error || 'Có lỗi xảy ra')
      return
    }
    onAuthed({ id: res.id, name: n })
  }

  return (
    <div className="stage">
      <div className="app login-app">
        <div className="scroll" style={{ justifyContent: 'center', paddingBottom: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 56, lineHeight: 1.2 }}>{activeTheme.icon}</div>
            <p className="eyebrow" style={{ marginTop: 8 }}>{activeTheme.name} · Bạn đồng hành dịu dàng</p>
            <p className="title" style={{ fontSize: 30 }}>Kèm Con Học</p>
            <p className="sub" style={{ maxWidth: 300, margin: '8px auto 0' }}>
              AI không giải bài cho con — chỉ cho bố mẹ cách giảng.
            </p>
          </div>

          <div className="card" style={{ gap: 12, marginTop: 8 }}>
            {reauthSession && (
              <div className="card sun pop" style={{ padding: '10px 14px', borderRadius: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                  🔒 Nhập lại mật khẩu một lần để bảo vệ dữ liệu gia đình "{reauthSession.name}" với tiêu chuẩn bảo mật mới.
                </span>
              </div>
            )}
            <div className="opt-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <button className={`opt ${mode === 'login' ? 'on' : ''}`} onClick={() => { setMode('login'); setErr('') }}>
                Đăng nhập
              </button>
              <button className={`opt ${mode === 'register' ? 'on' : ''}`} onClick={() => { setMode('register'); setErr('') }}>
                Tạo gia đình mới
              </button>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="lbl plum">Tên gia đình</span>
                <span className="sub" style={{ fontSize: 12 }}>{name.length}/30</span>
              </div>
              <input
                className="field"
                style={{ marginTop: 6 }}
                placeholder="VD: Gia đình Na, Nhà Bon…"
                maxLength={30}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <span className="lbl plum">Mật khẩu</span>
              <div style={{ position: 'relative' }}>
                <input
                  className="field"
                  style={{ marginTop: 6, paddingRight: 44 }}
                  type={showPass ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Tối thiểu 4 ký tự' : '••••••'}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                />
                <button
                  type="button"
                  className="round-btn"
                  style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-40%)', width: 32, height: 32 }}
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Hiện/ẩn mật khẩu"
                  title={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <span className="lbl plum">Nhập lại mật khẩu</span>
                <div style={{ position: 'relative' }}>
                  <input
                    className="field"
                    style={{ marginTop: 6, paddingRight: 44 }}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••"
                    value={pass2}
                    onChange={(e) => setPass2(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                  />
                  <button
                    type="button"
                    className="round-btn"
                    style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-40%)', width: 32, height: 32 }}
                    onClick={() => setShowPass(!showPass)}
                    aria-label="Hiện/ẩn mật khẩu"
                    title={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            )}

            {err && <div className="card sun pop"><span style={{ fontSize: 13.5 }}>{err}</span></div>}

            <button className="btn solid" disabled={busy} onClick={submit}>
              {busy ? 'Đang xử lý…' : mode === 'login' ? 'Vào app' : 'Tạo gia đình & vào app'}
            </button>

            <p className="notice">
              Mỗi gia đình một tài khoản riêng — dữ liệu tách biệt, đồng bộ qua đám mây ☁️
            </p>

            {onOpenJoin && (
              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn ghost"
                  style={{ fontSize: 13, color: '#4F46E5', fontWeight: 700 }}
                  onClick={onOpenJoin}
                >
                  💌 Bạn có mã mời tham gia gia đình?
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}