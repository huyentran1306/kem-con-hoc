// 🎵 Web Audio API Sound Synthesizer (Zero Dependencies, Zero Network, Instant)
let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// Global Mute Toggle (persisted)
const SOUND_KEY = 'kem-con-hoc:sound-enabled'
const soundListeners = new Set()

export function onSoundChange(fn) {
  soundListeners.add(fn)
  return () => soundListeners.delete(fn)
}

function notifySoundChange(enabled) {
  soundListeners.forEach((fn) => {
    try { fn(enabled) } catch (e) {}
  })
}

export function isSoundEnabled() {
  try {
    const val = localStorage.getItem(SOUND_KEY)
    return val === null ? true : val === 'true'
  } catch (e) {
    return true
  }
}

export function setSoundEnabled(enabled) {
  try {
    localStorage.setItem(SOUND_KEY, enabled ? 'true' : 'false')
    notifySoundChange(enabled)
  } catch (e) {}
}

export function toggleSound() {
  const current = isSoundEnabled()
  const next = !current
  setSoundEnabled(next)
  if (next) soundSuccess()
  return next
}

/**
 * 1. soundTap: Crisp, playful wooden / bubble button click
 */
export function soundTap() {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(540, now)
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.035)

    gain.gain.setValueAtTime(0.09, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.05)
  } catch (e) {}
}

// 📱 Auto-play tap sound for all buttons & interactive controls
if (typeof window !== 'undefined') {
  let lastTap = 0
  const onPointerDown = (e) => {
    if (!isSoundEnabled()) return
    const now = Date.now()
    if (now - lastTap < 50) return

    const target = e.target
    if (!target || !target.closest) return

    const el = target.closest(
      'button, .btn, .chip, .opt, .big-card, .switch, .tab-item, .tabs button, .stk button, [role="button"]'
    )
    if (!el || el.hasAttribute('data-no-sound') || el.disabled) return

    lastTap = now
    soundTap()
  }

  window.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true })
}

/**
 * 2. soundPop: Bubble pop sound for chips, toggles, and stickers
 */
export function soundPop(freq = 600) {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.08)

    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.11)
  } catch (e) {}
}

/**
 * 3. soundSuccess: Cheerful 4-tone victory arpeggio (C5 -> E5 -> G5 -> C6)
 */
export function soundSuccess() {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    const startTime = ctx.currentTime

    notes.forEach((freq, idx) => {
      const noteTime = startTime + idx * 0.08
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, noteTime)

      gain.gain.setValueAtTime(0.15, noteTime)
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(noteTime)
      osc.stop(noteTime + 0.24)
    })
  } catch (e) {}
}

/**
 * 4. soundFanfare: Celebration fireworks chime
 */
export function soundFanfare() {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51] // C5, E5, G5, C6, E6
    const now = ctx.currentTime

    chords.forEach((freq, idx) => {
      const t = now + idx * 0.06
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0.18, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.48)
    })
  } catch (e) {}
}

/**
 * 5. soundWrong: Gentle "oops" boing (not harsh, encourages trying again)
 */
export function soundWrong() {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.18)

    gain.gain.setValueAtTime(0.14, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.23)
  } catch (e) {}
}

/**
 * 6. soundBreathe: Calming meditation singing bowl tone
 */
export function soundBreathe(type = 'in') {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    const startFreq = type === 'in' ? 261.63 : 329.63 // C4 or E4
    const endFreq = type === 'in' ? 329.63 : 261.63

    osc.frequency.setValueAtTime(startFreq, now)
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 1.2)

    gain.gain.setValueAtTime(0.01, now)
    gain.gain.linearRampToValueAtTime(0.12, now + 0.4)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 1.85)
  } catch (e) {}
}

/**
 * 7. soundWoodBlock: Playful mechanical / toy click
 */
export function soundWoodBlock() {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(900, now)
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.03)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.05)
  } catch (e) {}
}
