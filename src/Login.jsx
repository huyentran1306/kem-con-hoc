import { useState, useContext } from 'react'
import { AppCtx } from './ctx'
import { familyLogin, familyRegister, teacherLabel } from './api'
import { getTheme } from './themes'
import { TRIAL_SESSION } from './trialData.js'
import { formatClassName, formatTeacherName } from './teacher/format.js'

export default function LoginScreen({ onAuthed, reauthSession = null, onOpenJoin = null, classJoinBanner = null, initialMode = 'login' }) {
  const { openAdmin, S } = useContext(AppCtx) || {}
  const activeThemeId = S?.theme || (typeof document !== 'undefined' ? document.documentElement.dataset.theme : null) || 'bear'
  const activeTheme = getTheme(activeThemeId)

  // Đợt 15 · 6.6: "Tạo tài khoản" trên dải Dùng thử mở thẳng tab Tạo gia đình mới
  const [mode, setMode] = useState(initialMode === 'register' && !reauthSession ? 'register' : 'login')
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
      setErr(loginErrorText(res, mode))
      return
    }
    onAuthed({ id: res.id, name: n })
  }

  return (
    <div className="scroll" style={{ justifyContent: 'center', paddingBottom: 40 }}>
          {classJoinBanner && (
            <div
              style={{
                backgroundColor: classJoinBanner.error ? 'var(--c-err-bg, #FFF1F2)' : 'var(--c-hint1-bg, #FFF1D6)',
                border: classJoinBanner.error ? '2px solid var(--c-err-line, #FECDD3)' : '2px solid var(--c-warn-line, #F6C56A)',
                borderRadius: 18,
                padding: '12px 16px',
                marginBottom: 12,
                textAlign: 'center',
                boxShadow: classJoinBanner.error ? '0 4px 12px rgba(225, 29, 72, 0.12)' : '0 4px 12px rgba(246, 166, 35, 0.15)',
              }}
            >
              {classJoinBanner.error ? (
                <div style={{ fontWeight: 800, fontSize: 13.5, color: '#BE123C' }}>
                  ⚠️ Mã lớp không còn dùng được
                </div>
              ) : (
                <>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--c-text, #4B3621)' }}>
                    🏫 Đăng nhập để vào <b>{formatClassName(classJoinBanner.className || classJoinBanner.class_name || classJoinBanner.name) || 'lớp của cô'}</b> của <b>{formatTeacherName(classJoinBanner.teacherName || classJoinBanner.teacher_name, { lower: true })}</b>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--c-text-2, #8A6A4A)', marginTop: 3 }}>
                    Đăng nhập xong, mình quay lại đúng màn vào lớp nhé
                  </div>
                </>
              )}
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 56, lineHeight: 1.2 }}>{activeTheme.icon}</div>
            <h1 className="title" style={{ fontSize: 32, margin: '10px 0 0 0', fontWeight: 800 }}>Kèm Con Học</h1>
            <p className="sub" style={{ maxWidth: 320, margin: '8px auto 0', textWrap: 'balance', fontSize: 14, lineHeight: 1.5 }}>
              AI không giải bài cho con, chỉ cho bố mẹ cách giảng.
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
                {mode === 'register' && <span className="sub" style={{ fontSize: 12 }}>{name.length}/30</span>}
              </div>
              <input
                className="field"
                style={{ marginTop: 6 }}
                placeholder="VD: Gia đình Na, Nhà Bon…"
                maxLength={30}
                value={name}
                onChange={(e) => { setName(e.target.value); if (err) setErr('') }}
              />
            </div>

            <div>
              <span className="lbl plum">Mật khẩu</span>
              <div style={{ position: 'relative' }}>
                <input
                  className="field"
                  style={{ marginTop: 6, paddingRight: 44 }}
                  type={showPass ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Tối thiểu 4 ký tự' : 'Nhập mật khẩu'}
                  value={pass}
                  onChange={(e) => { setPass(e.target.value); if (err) setErr('') }}
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

            {mode === 'login' && err && <LoginErrorLine text={err} />}

            {mode === 'register' && (
              <div>
                <span className="lbl plum">Nhập lại mật khẩu</span>
                <div style={{ position: 'relative' }}>
                  <input
                    className="field"
                    style={{ marginTop: 6, paddingRight: 44 }}
                    type={showPass ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={pass2}
                    onChange={(e) => { setPass2(e.target.value); if (err) setErr('') }}
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

            {mode === 'register' && err && <LoginErrorLine text={err} />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                className="btn-km btn-km-l btn-km-primary"
                style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}
                disabled={busy}
                onClick={submit}
              >
                {busy ? 'Đang xử lý…' : mode === 'login' ? 'Vào app' : 'Tạo gia đình & vào app'}
              </button>

              {/* 23Z: Dòng đồng bộ chỉ giữ ở Tạo gia đình mới, đặt dưới nút chính */}
              {mode === 'register' && (
                <p className="notice" style={{ margin: '6px 0 2px', fontSize: 12, color: 'var(--c-text-2, #64748B)', textAlign: 'center' }}>
                  Dữ liệu được đồng bộ để mọi máy trong nhà cùng xem · mỗi gia đình tài khoản riêng ☁️
                </p>
              )}

              {/* 23Z: Dòng "hoặc" mảnh */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0 6px' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--c-line, #E2E8F0)' }} />
                <span style={{ fontSize: 12, color: 'var(--c-text-2, #94A3B8)', fontWeight: 500 }}>hoặc</span>
                <div style={{ flex: 1, height: 1, background: 'var(--c-line, #E2E8F0)' }} />
              </div>

              {/* 23Z: 2 nút phụ cùng 1 hàng, cùng kiểu viền nhẹ, không tô màu */}
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                <button
                  type="button"
                  className="btn ghost btn-km btn-km-m"
                  style={{
                    flex: '1 1 0',
                    minWidth: 0,
                    height: 44,
                    minHeight: 44,
                    padding: '0 8px',
                    fontSize: 13,
                    fontWeight: 700,
                    border: '1.5px solid var(--c-line, #CBD5E1)',
                    background: 'transparent',
                    color: 'var(--c-text, #334155)',
                    borderRadius: 14,
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => onAuthed(TRIAL_SESSION)}
                >
                  ✨ Dùng thử
                </button>
                {onOpenJoin && (
                  <button
                    type="button"
                    className="btn ghost btn-km btn-km-m"
                    style={{
                      flex: '1 1 0',
                      minWidth: 0,
                      height: 44,
                      minHeight: 44,
                      padding: '0 8px',
                      fontSize: 13,
                      fontWeight: 700,
                      border: '1.5px solid var(--c-line, #CBD5E1)',
                      background: 'transparent',
                      color: 'var(--c-text, #334155)',
                      borderRadius: 14,
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={onOpenJoin}
                  >
                    💌 Có mã mời
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
  )
}

// Gói 33 · B2: lỗi đăng nhập là DÒNG CHỮ thông báo, không phải ô trông như nút (không viền nổi, không bóng,
// không con trỏ tay), ngay dưới ô mật khẩu, role="alert". Chưa có gửi mail nên không có "Quên mật khẩu".
export const WRONG_PASSWORD_TEXT = 'Sai mật khẩu rồi, thử lại hoặc liên hệ admin nhé.'

export function loginErrorText(res, mode = 'login') {
  const msg = String(res?.error || '')
  if (res?.network) return msg || 'Không kết nối được máy chủ, kiểm tra mạng rồi thử lại nhé.'
  const wrong = /sai mật khẩu|mật khẩu (không đúng|chưa đúng|sai)|wrong password|invalid password|incorrect password/i.test(msg.normalize('NFC')) || res?.code === 'WRONG_PASSWORD' || res?.code === 'INVALID_PASSWORD'
  if (mode === 'login' && wrong) return WRONG_PASSWORD_TEXT
  return msg || 'Có lỗi xảy ra, thử lại nhé.'
}

function LoginErrorLine({ text }) {
  return (
    <p
      role="alert"
      data-testid="login-error"
      style={{ display: 'flex', alignItems: 'flex-start', gap: 6, margin: '-4px 2px 0', fontSize: 13.5, lineHeight: 1.45, fontWeight: 600, color: 'var(--c-danger-ink, #B4441E)', background: 'none', border: 'none', boxShadow: 'none', cursor: 'default' }}
    >
      <span aria-hidden="true">⚠️</span>
      <span>{text}</span>
    </p>
  )
}
