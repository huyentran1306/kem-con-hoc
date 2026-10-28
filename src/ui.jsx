import { appAlert } from './dialog'
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
      <p className="title" style={{ fontSize: 20, color: 'var(--c-accent-ink, var(--c-text))' }}>
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
export function VoiceInputBtn({ onResult, placeholder = 'Bấm để nói bằng giọng nói', className = '', autoStart = false }) {
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

  useEffect(() => {
    if (autoStart) {
      const tm = setTimeout(() => {
        startListening()
      }, 350)
      return () => clearTimeout(tm)
    }
  }, [autoStart])

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
      appAlert('Trình duyệt này chưa hỗ trợ micro. Mình gõ đề thay nhé.', { title: 'Không dùng được micro' })
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
          toast('Chưa nhận được giọng nói, thử nói lại hoặc gõ đề nhé')
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
      appAlert('Bấm cho phép micro trong cài đặt trình duyệt rồi thử lại nhé.', { title: 'Cần quyền micro' })
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
      onMouseDown={down}
      onMouseUp={up}
      onMouseLeave={up}
      onTouchStart={down}
      onTouchEnd={up}
      onTouchCancel={up}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault()
          if (!timer.current) down()
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault()
          up()
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
      tabIndex={0}
      aria-label="Bấm giữ 2 giây để mở đáp án (hoặc giữ phím Space)"
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

/* ---------- 💡 Chip "Vì sao AI hỏi câu này?" (Prompt 14 Phần C) ---------- */
export function WhyChip({ reason, onReport }) {
  const [open, setOpen] = useState(false)
  if (!reason || typeof reason !== 'string' || !reason.trim()) return null

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <button
        type="button"
        data-testid="why-chip"
        className="why-chip-btn"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(prev => !prev)
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
          background: 'var(--c-sun, #FEF3C7)',
          color: 'var(--c-sun-text, #92400E)',
          border: '1px solid #FCD34D',
          cursor: 'pointer',
        }}
        aria-label="Vì sao AI hỏi câu này?"
        title="Vì sao AI hỏi câu này?"
      >
        <span>💡 Vì sao</span>
      </button>

      {open && (
        <div
          className="why-chip-pop"
          data-testid="why-popover"
          style={{
            marginTop: 6,
            marginBottom: 6,
            padding: '10px 12px',
            borderRadius: 14,
            background: 'var(--c-card-bg, #FFFFFF)',
            border: '1.5px solid #FCD34D',
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
            fontSize: 13,
            lineHeight: 1.5,
            color: 'inherit',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <b style={{ color: '#92400E', fontSize: 12.5 }}>💡 Vì sao AI hỏi câu này?</b>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#999' }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: '4px 0 8px 0', fontSize: 12.5 }}>{reason}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {onReport && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(false); onReport(); }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 11.5,
                  color: '#EF4444',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Câu chưa hợp?
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              style={{
                padding: '3px 10px',
                borderRadius: 999,
                background: '#F3F4F6',
                border: '1px solid #D1D5DB',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
/* ---------- Công tắc dùng chung (Đợt 15 · 6.1: thay ô tích mặc định) ---------- */
export function Switch({ on, onChange, label, title, ...rest }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(on)}
      aria-label={label}
      title={title || label}
      className={`switch ${on ? 'on' : ''}`}
      onClick={() => onChange && onChange(!on)}
      {...rest}
    >
      <i />
    </button>
  )
}

/* ---------- Màn rộng (≥1024px): bố cục 2 cột cho trang bố mẹ ---------- */
export function useWide(query = '(min-width: 1024px)') {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false)
  const [wide, setWide] = useState(get)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mq = window.matchMedia(query)
    const on = () => setWide(mq.matches)
    on()
    if (mq.addEventListener) mq.addEventListener('change', on)
    else mq.addListener(on)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', on)
      else mq.removeListener(on)
    }
  }, [query])
  return wide
}
