/* ============ TIỆN ÍCH ============ */

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function fmtTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(Math.floor(s % 60)).padStart(2, '0')
  return `${m}:${ss}`
}

/* Trộn ngẫu nhiên (Fisher-Yates) */
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n)
}

/* Nén ảnh xuống maxDim px, trả về { blob, dataUrl } JPEG */
export function compressImage(file, maxDim = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url)
          if (!blob) return reject(new Error('compress failed'))
          resolve({ blob, dataUrl: canvas.toDataURL('image/jpeg', quality) })
        }, 'image/jpeg', quality)
      } catch (e) {
        URL.revokeObjectURL(url)
        reject(e)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('load failed'))
    }
    img.src = url
  })
}

/* Đọc to bằng Web Speech API */
let voicesCache = []
function refreshVoices() {
  try {
    const vs = window.speechSynthesis ? window.speechSynthesis.getVoices() : []
    if (vs.length) voicesCache = vs
  } catch (e) {}
}
if (typeof window !== 'undefined' && window.speechSynthesis) {
  refreshVoices()
  window.speechSynthesis.addEventListener('voiceschanged', refreshVoices)
}

export function speak(text, lang = 'vi-VN') {
  try {
    if (!('speechSynthesis' in window)) {
      toast('Trình duyệt chưa hỗ trợ đọc to')
      return
    }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.9
    u.pitch = 1.05
    if (!voicesCache.length) refreshVoices()
    const wanted = lang === 'en-US' ? 'en' : 'vi'
    const v =
      voicesCache.find((x) => x.lang.toLowerCase().startsWith(wanted)) ||
      voicesCache.find((x) => x.lang.toLowerCase().includes(wanted))
    if (v) u.voice = v
    window.speechSynthesis.speak(u)
  } catch (e) {
    toast('Trình duyệt chưa hỗ trợ đọc to')
  }
}

/* ---------- Toast (pub/sub nhỏ) ---------- */
const toastListeners = []
export function toast(msg) {
  toastListeners.forEach((f) => f(msg))
}
export function onToast(f) {
  toastListeners.push(f)
  return () => {
    const i = toastListeners.indexOf(f)
    if (i >= 0) toastListeners.splice(i, 1)
  }
}

/* ---------- Confetti ---------- */
import confetti from 'canvas-confetti'

export function boom() {
  try {
    confetti({ particleCount: 70, spread: 75, origin: { y: 0.75 }, colors: ['#D9577F', '#F08A5D', '#1F7A5C', '#F1D08A'] })
    setTimeout(() => confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors: ['#D9577F', '#F08A5D'] }), 180)
    setTimeout(() => confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors: ['#1F7A5C', '#F1D08A'] }), 320)
  } catch (e) {}
}

/**
 * Đánh dấu 15 bản ghi sticker mẫu với sample: true (id h1..h15)
 * Chạy idempotent, không xoá bản ghi, chạy lại không đổi gì (B1)
 */
export function markSampleStickers(history = []) {
  if (!Array.isArray(history)) return []
  return history.map((item) => {
    if (item && item.id && /^h(1[0-5]|[1-9])$/.test(String(item.id))) {
      return { ...item, sample: true }
    }
    return item
  })
}

/**
 * Trả về timestamp Thứ Hai 00:00:00.000 theo múi giờ Việt Nam (UTC+7) (B2)
 */
export function getVnMondayStart(ts = Date.now()) {
  const d = new Date(ts)
  const utc = d.getTime() + d.getTimezoneOffset() * 60000
  const vnTime = new Date(utc + 7 * 3600000)
  const day = vnTime.getDay() // 0 = CN, 1 = T2, ...
  const diffToMonday = day === 0 ? 6 : day - 1
  vnTime.setDate(vnTime.getDate() - diffToMonday)
  vnTime.setHours(0, 0, 0, 0)
  return vnTime.getTime() - 7 * 3600000 - d.getTimezoneOffset() * 60000
}

/**
 * Tính nhãn "Tuần này" / "Tuần trước" động từ timestamp (B2)
 */
export function getWeekLabel(timestamp, currentTs = Date.now()) {
  if (!timestamp) return 'Tuần này'
  const currentMonday = getVnMondayStart(currentTs)
  const oneWeekMs = 7 * 86400000
  const prevMonday = currentMonday - oneWeekMs
  if (timestamp >= currentMonday) {
    return 'Tuần này'
  } else if (timestamp >= prevMonday && timestamp < currentMonday) {
    return 'Tuần trước'
  }
  return 'Trước đó'
}