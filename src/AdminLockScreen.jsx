/**
 * 🔒 MÀN HÌNH KHÓA PIN ADMIN (PROMPT 05 MỤC 3)
 * Mascot Gấu giữ khoá, câu: "Gấu đang giữ cửa. Nhập PIN để vào tiếp nhé"
 * Bàn phím số 3x4 nút tròn có viền đáy, gõ được phím vật lý, rung khi sai PIN,
 * sau 5 lần sai tự động chuyển về đăng nhập email.
 */

import React, { useState, useEffect } from 'react';
import { BearMascot } from './AdminMascot';
import { Delete, Eye, EyeOff, Lock, LogOut } from 'lucide-react';

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
      const res = await fetch('https://ai-gateway-worker.trannth1306.workers.dev/api/v1/admin/auth/unlock', {
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
    <div className="stitch-lock-overlay">
      <div className={`stitch-lock-card ${shake ? 'stitch-shake' : ''}`}>
        <div className="bear-mascot-wrap" style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <BearMascot mood="lock" size={96} />
        </div>

        <h3 style={{ fontFamily: 'var(--adm-font-head)', fontSize: 20, color: 'var(--adm-text)', margin: '0 0 6px 0' }}>
          Gấu đang giữ cửa
        </h3>
        <p style={{ fontSize: 13.5, color: 'var(--adm-sub)', margin: 0 }}>
          Nhập mã PIN để tiếp tục vào bàn quản trị nhé
        </p>

        {/* Chấm tròn biểu thị độ dài PIN */}
        <div className="stitch-pin-dots-row">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`stitch-pin-dot ${idx < pin.length ? 'filled' : ''}`}
            />
          ))}
        </div>

        {/* Chế độ hiển thị số đang gõ */}
        {showPin && pin && (
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--adm-primary-text)', letterSpacing: 4, marginBottom: 12 }}>
            {pin}
          </div>
        )}

        {/* Báo lỗi nếu có */}
        {errorMsg && (
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--adm-danger)', marginBottom: 16, minHeight: 18 }}>
            {errorMsg}
          </div>
        )}

        {/* Bàn phím số 3x4 dạng nút tròn có viền đáy */}
        <div className="stitch-keypad-grid">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              className="stitch-keypad-btn"
              onClick={() => handleDigit(digit)}
              disabled={busy}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            className="stitch-keypad-btn action"
            onClick={() => setShowPin(!showPin)}
            title="Hiện số đang gõ"
          >
            {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button
            type="button"
            className="stitch-keypad-btn"
            onClick={() => handleDigit('0')}
            disabled={busy}
          >
            0
          </button>
          <button
            type="button"
            className="stitch-keypad-btn action"
            onClick={handleBackspace}
            title="Xoá một số"
          >
            <Delete size={22} />
          </button>
        </div>

        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <button
            type="button"
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--adm-sub)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <LogOut size={14} /> Quên PIN? Đăng nhập lại
          </button>
        </div>
      </div>
    </div>
  );
}
