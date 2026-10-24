import { useContext, useEffect, useRef, useState } from 'react'
import { AppCtx } from './ctx'
import { speak, toast } from './utils'
import { aiSpeechToText } from './api'

/* ---------- Header ---------- */
export function Header({ title, back, right, hideSound }) {
  const { go, soundOn, toggleSound } = useContext(AppCtx)
  return (
    <div className="hdr">
      {back && (
        <button className="back" onClick={() => go(back)} aria-label="Quay lại">
          ‹
        </button>
      )}
      <p className="title" style={{ fontSize: 20 }}>
        {title}
      </p>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
        {right}
        {!hideSound && (
          <button
            className={`sound-hdr-btn ${!soundOn ? 'off' : ''}`}
            onClick={toggleSound}
            title={soundOn ? 'Âm thanh: ĐANG BẬT (Bấm để tắt tiếng)' : 'Âm thanh: ĐANG TẮT (Bấm để bật)'}
            aria-label="Bật tắt âm thanh"
            data-no-sound
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
        )}
      </div>
    </div>
  )
}

/* ---------- Nút đọc to ---------- */
export function SpeakBtn({ text, lang = 'vi-VN', label, className = '' }) {
  return (
    <button
      className={`round-btn ${className}`}
      onClick={(e) => {
        e.stopPropagation()
        speak(text, lang)
      }}
      aria-label="Đọc to"
      title="Đọc to"
    >
      🔊
    </button>
  )
}

/* ---------- 🎙️ Nút Ghi âm / Speech-to-Text (STT) ---------- */
export function VoiceInputBtn({ onResult, placeholder = 'Bấm để nói bằng giọng nói', className = '' }) {
  const [listening, setListening] = useState(false)
  const [processing, setProcessing] = useState(false)
  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const autoStopTimerRef = useRef(null)

  const clearAutoStop = () => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current)
      autoStopTimerRef.current = null
    }
  }

  const stopTracks = () => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop())
      } catch (e) {}
      streamRef.current = null
    }
  }

  const stopAll = () => {
    clearAutoStop()
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (e) {}
      recognitionRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop() } catch (e) {}
    }
    setListening(false)
  }

  useEffect(() => {
    return () => {
      clearAutoStop()
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop() } catch (e) {}
      }
      stopTracks()
    }
  }, [])

  const startListening = async () => {
    // 1. Thử dùng Web Speech API (nhận diện tiếng Việt real-time, 0 độ trễ)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      try {
        const reco = new SpeechRecognition()
        reco.lang = 'vi-VN'
        reco.continuous = false
        reco.interimResults = false

        reco.onstart = () => {
          setListening(true)
        }
        reco.onresult = (evt) => {
          const transcript = evt.results[0][0].transcript
          if (transcript && transcript.trim()) {
            onResult(transcript.trim())
          }
          stopAll()
        }
        reco.onerror = (err) => {
          console.warn('SpeechRecognition error, falling back to Whisper:', err)
          fallbackWhisper()
        }
        reco.onend = () => {
          setListening(false)
        }

        recognitionRef.current = reco
        reco.start()
        return
      } catch (err) {
        console.warn('Web Speech start failed, falling back:', err)
      }
    }

    // 2. Fallback sang Cloudflare Whisper AI qua mic
    fallbackWhisper()
  }

  const fallbackWhisper = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Trình duyệt chưa hỗ trợ quyền micro!')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      audioChunksRef.current = []

      // Chọn định dạng âm thanh đầu tiên được hỗ trợ theo từng trình duyệt
      const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
      let selectedType = ''
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        selectedType = candidates.find((type) => MediaRecorder.isTypeSupported(type)) || ''
      }
      const recorder = selectedType
        ? new MediaRecorder(stream, { mimeType: selectedType })
        : new MediaRecorder(stream)

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        clearAutoStop()
        stopTracks()
        const mimeType = recorder.mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        setProcessing(true)
        const text = await aiSpeechToText(audioBlob)
        setProcessing(false)
        if (text && text.trim()) {
          onResult(text.trim())
        } else {
          toast('Chưa nhận được giọng nói, mẹ thử nói lại hoặc gõ đề nhé')
        }
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setListening(true)

      // Tự dừng ghi âm sau 30 giây
      clearAutoStop()
      autoStopTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          try { mediaRecorderRef.current.stop() } catch (e) {}
        }
        setListening(false)
      }, 30000)
    } catch (e) {
      console.error('Mic access error:', e)
      clearAutoStop()
      stopTracks()
      setListening(false)
      alert('Vui lòng cấp quyền truy cập micro để nói!')
    }
  }

  const toggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (listening) {
      stopAll()
    } else {
      startListening()
    }
  }

  return (
    <button
      type="button"
      className={`btn-voice ${listening ? 'listening' : ''} ${className}`}
      onClick={toggle}
      disabled={processing}
      title={listening ? 'Đang nghe... Bấm để dừng' : placeholder}
      aria-label="Nói bằng giọng nói"
    >
      {processing ? (
        <span className="voice-pulse">⏳ Đang xử lý giọng nói...</span>
      ) : listening ? (
        <>
          <span className="voice-wave" />
          <span>🔴 Đang lắng nghe... (Bấm dừng)</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: 16 }}>🎙️</span>
          <span>Nói bằng giọng nói</span>
        </>
      )}
    </button>
  )
}


/* ---------- Sơ đồ chấm: 3 hộp × 8 chấm ---------- */
export function DotDiagram({ boxes = 3, per = 8, given = 5 }) {
  return (
    <div className="dotboxes">
      {Array.from({ length: boxes }).map((_, b) => {
        const grayHere = Math.max(0, Math.min(per, given - (boxes - 1 - b) * per))
        return (
          <div className="bx" key={b}>
            {Array.from({ length: per }).map((_, i) => (
              <i key={i} className={i >= per - grayHere ? 'gray' : ''} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Thanh tiến độ ---------- */
export function Bar({ pct, color = 'var(--plum)' }) {
  return (
    <div className="bar">
      <i style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
    </div>
  )
}

/* ---------- Nút bấm giữ 2 giây ---------- */
export function HoldReveal({ locked, onLockedPress, onOpen }) {
  const [progress, setProgress] = useState(0)
  const timer = useRef(null)
  const start = useRef(0)

  const clear = () => {
    clearInterval(timer.current)
    timer.current = null
    setProgress(0)
  }

  const down = () => {
    if (locked) {
      onLockedPress?.()
      return
    }
    start.current = Date.now()
    timer.current = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start.current) / 2000) * 100)
      setProgress(p)
      if (p >= 100) {
        clear()
        onOpen?.()
      }
    }, 30)
  }

  const up = () => {
    if (!timer.current) return
    clear()
  }

  return (
    <button
      className={`hold ${locked ? '' : 'unlocked'}`}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
      onContextMenu={(e) => e.preventDefault()}
    >
      <i className="fill" style={{ width: `${progress}%` }} />
      <span>
        {locked ? '🔒 Cho xem đáp án' : '🔓 Bấm giữ 2 giây để mở đáp án'}
      </span>
    </button>
  )
}

/* ---------- Bộ chọn số (stepper) ---------- */
export function Stepper({ value, onChange, min = 1, max = 3, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <button
        className="round-btn"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <div style={{ textAlign: 'center' }}>
        <div className="lbl mut">{label}</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--plum-deep)' }}>{value}</div>
      </div>
      <button
        className="round-btn"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </div>
  )
}