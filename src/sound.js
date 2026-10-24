/* ============================================================
   SFX — Web Audio API (không dùng file MP3/WAV)
   playTap / playDing / playFanfare + công tắc ba mẹ
   ============================================================ */

const SOUND_KEY = 'sound_enabled'

export function soundEnabled() {
  try {
    return localStorage.getItem(SOUND_KEY) !== '0'
  } catch (e) {
    return true
  }
}

export function setSoundEnabled(on) {
  try {
    localStorage.setItem(SOUND_KEY, on ? '1' : '0')
  } catch (e) {}
}

let audioCtx = null
function ac() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    if (!audioCtx) audioCtx = new AC()
    if (audioCtx.state === 'suspended') audioCtx.resume()
    return audioCtx
  } catch (e) {
    return null
  }
}

/* Phát 1 nốt đơn: freq Hz, delay giây, dur giây */
function tone(freq, delay, dur, type = 'sine', vol = 0.15) {
  const c = ac()
  if (!c) return
  const t0 = c.currentTime + delay
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(vol, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
  o.connect(g)
  g.connect(c.destination)
  o.start(t0)
  o.stop(t0 + dur + 0.05)
}

/* Chặn tiếng "tap" trùng với tiếng riêng trong cùng 1 cú bấm */
let lastFxAt = 0
function markFx() {
  lastFxAt = performance.now()
}

/* Pop ngắn 400Hz ➔ 600Hz khi bấm nút bất kỳ */
export function playTap() {
  if (!soundEnabled()) return
  if (performance.now() - lastFxAt < 120) return
  tone(400, 0, 0.07, 'sine', 0.1)
  tone(600, 0.025, 0.08, 'sine', 0.075)
}

/* Hợp âm C-E-G vui tươi khi chọn đúng đáp án / nhận sticker */
export function playDing() {
  if (!soundEnabled()) return
  markFx()
  tone(523.25, 0, 0.45, 'triangle', 0.16) // C5
  tone(659.25, 0.045, 0.45, 'triangle', 0.16) // E5
  tone(783.99, 0.09, 0.55, 'triangle', 0.16) // G5
}

/* Đoạn nhạc hân hoan khi đạt mốc 10 stickers / xong phiên học */
export function playFanfare() {
  if (!soundEnabled()) return
  markFx()
  const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51]
  melody.forEach((f, i) => tone(f, i * 0.13, 0.24, 'triangle', 0.18))
  tone(261.63, 0, 1.1, 'sine', 0.12) // C4 bass
  tone(392.0, 0.065, 1.1, 'sine', 0.12) // G4 bass
}