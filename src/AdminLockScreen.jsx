/**
 * Màn hình khoá PIN của khung admin (Đợt 15 · Chặng 2: theo bộ quy chuẩn, nền kem, gấu)
 * Gấu giữ cửa, bàn phím số 3x4 gõ được phím vật lý, rung khi sai PIN,
 * sau 5 lần sai tự động chuyển về đăng nhập email.
 */

import React, { useState, useEffect } from 'react';
import { GATEWAY } from './api';
import { BearMascot } from './AdminMascot';
import { Banner } from './ui/staff';
import { Delete, Eye, EyeOff, LogOut } from 'lucide-react';

export function AdminLockScreen({ onUnlock, onLogout, token }) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);
  const [fails, setFails] = useState(0);

  // Nhập từ bàn phím số vật lý
  useEffect(() => {
    function handleKeyDown(e) {
      if (busy) return;
      if (/^[0-9]$/.test(e.key)) {
        if (pin.length < 6) {
          handleDigit(e.key);
        }
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        if (pin.length >= 4) {
          submitUnlock(pin);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, busy]);

  function handleDigit(num) {
    if (pin.length >= 6) return;
    const nextPin = pin + num;
    setPin(nextPin);
    setErrorMsg('');
    if (nextPin.length === 4) {
      submitUnlock(nextPin);
    }
  }

  function handleBackspace() {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  }

  async function submitUnlock(pinToSubmit) {
    if (busy || !pinToSubmit) return;
    setBusy(true);
    try {
      const res = await fetch(`${GATEWAY}/api/v1/admin/auth/unlock`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: pinToSubmit }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        onUnlock();
      } else {
        const remaining = data.remainingAttempts !== undefined ? data.remainingAttempts : 5 - (fails + 1);
        setFails((f) => f + 1);
        setErrorMsg(data.error?.message || `Mã PIN không đúng (còn ${remaining} lần thử)`);
        setShake(true);
        setTimeout(() => setShake(false), 450);
        setPin('');

        if (data.error?.code === 'MAX_PIN_ATTEMPTS' || fails + 1 >= 5) {
          setTimeout(() => {
            onLogout();
          }, 1200);
        }
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ khi mở khoá');
      setShake(true);
      setTimeout(() => setShake(false), 450);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="kadm-center">
      <div className={`kadm-auth-card kadm-lock-card ${shake ? 'stitch-shake' : ''}`}>
        <div className="kadm-auth-bear">
          <BearMascot mood="lock" size={92} />
        </div>

        <h1 className="kadm-auth-title">Gấu đang giữ cửa</h1>
        <p className="kadm-auth-sub">Nhập mã PIN để tiếp tục vào trang quản trị nhé</p>

        {/* Chấm tròn biểu thị độ dài PIN */}
        <div className="kadm-pin-dots" aria-label={`Đã nhập ${pin.length} số`}>
          {[0, 1, 2, 3].map((idx) => (
            <span key={idx} className={`kadm-pin-dot ${idx < pin.length ? 'is-filled' : ''}`} />
          ))}
        </div>

        {showPin && pin && <div className="kadm-pin-visible">{pin}</div>}

        {errorMsg && <Banner type="bad" message={errorMsg} style={{ margin: '0 0 14px 0', textAlign: 'left' }} />}

        {/* Bàn phím số 3x4 */}
        <div className="kadm-keypad" role="group" aria-label="Bàn phím số">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button key={digit} type="button" className="kadm-key" onClick={() => handleDigit(digit)} disabled={busy}>
              {digit}
            </button>
          ))}
          <button
            type="button"
            className="kadm-key kadm-key-action"
            onClick={() => setShowPin(!showPin)}
            title={showPin ? 'Ẩn số đang gõ' : 'Hiện số đang gõ'}
            aria-label={showPin ? 'Ẩn số đang gõ' : 'Hiện số đang gõ'}
          >
            {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button type="button" className="kadm-key" onClick={() => handleDigit('0')} disabled={busy}>
            0
          </button>
          <button type="button" className="kadm-key kadm-key-action" onClick={handleBackspace} title="Xoá một số" aria-label="Xoá một số">
            <Delete size={22} />
          </button>
        </div>

        <div className="kadm-auth-foot">
          <button type="button" className="kadm-link" onClick={onLogout}>
            <LogOut size={14} /> Quên PIN? Đăng nhập lại
          </button>
        </div>
      </div>
    </div>
  );
}
