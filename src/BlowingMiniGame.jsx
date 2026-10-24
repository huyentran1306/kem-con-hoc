/* ============================================================
   KÈM CON HỌC — BLOWING MINI-GAME (Web Audio API)
   Prompt 08: Thổi cùng con (3 lượt) & Mẹ thở một mình
   - Client-side RMS analysis ONLY. KHÔNG GHI ÂM, KHÔNG GỬI LÊN MẠNG.
   - 8 bộ giao diện có hình riêng theo chủ đề.
   - Fallback: "Giữ nút và thở ra" khi mic bị từ chối / Zalo Webview.
   ============================================================ */

import React, { useState, useEffect, useRef } from 'react'
import { soundPop, soundSuccess, soundBreathe } from './audio'

export function BlowingMiniGame({
  themeId = 'bear',
  onFinished,
  onCancel,
  soundOn = true,
}) {
  const [mode, setMode] = useState('with_child') // 'with_child' | 'solo_mom'
  const [turn, setTurn] = useState(1) // 1, 2, 3
  const [turnProgress, setTurnProgress] = useState(0) // 0 -> 100
  const [phase, setPhase] = useState('blow') // 'inhale' | 'blow'
  const [inhaleCount, setInhaleCount] = useState(4)

  // Mic state
  const [micState, setMicState] = useState('prompt') // 'prompt' | 'calibrating' | 'ready' | 'fallback'
  const [isBlowingNow, setIsBlowingNow] = useState(false)
  const [ambientNoise, setAmbientNoise] = useState(0.02)

  // Solo Mom State
  const [soloRound, setSoloRound] = useState(1) // 1 to 5
  const [soloPhase, setSoloPhase] = useState('in1') // 'in1' (2s) -> 'in2' (1s) -> 'out' (5s)

  // Refs
  const audioContextRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const animFrameRef = useRef(null)
  const blowDurationRef = useRef(0)
  const lastTimeRef = useRef(Date.now())
  const pressTimerRef = useRef(null)

  /* Dọn dẹp Mic khi unmount */
  const stopAudio = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
  }

  useEffect(() => {
    return () => stopAudio()
  }, [])

  /* Tự động ngắt sau 90 giây an toàn */
  useEffect(() => {
    const timeout = setTimeout(() => {
      stopAudio()
      if (micState === 'ready') setMicState('fallback')
    }, 90000)
    return () => clearTimeout(timeout)
  }, [micState])

  /* Khởi động Web Audio API đo RMS */
  const startMic = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicState('fallback')
        return
      }

      setMicState('calibrating')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        video: false,
      })

      mediaStreamRef.current = stream
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioCtx()
      audioContextRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)

      const buffer = new Float32Array(analyser.fftSize)

      // Hiệu chỉnh 1 giây đầu để đo tiếng ồn nền
      let calibSamples = []
      const startTime = Date.now()

      const processAudio = () => {
        analyser.getFloatTimeDomainData(buffer)

        // Tính RMS (Root Mean Square)
        let sum = 0
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i] * buffer[i]
        }
        const rms = Math.sqrt(sum / buffer.length)

        const now = Date.now()
        const dt = (now - lastTimeRef.current) / 1000
        lastTimeRef.current = now

        // 1s đầu: đo tiếng ồn nền
        if (now - startTime < 1000) {
          calibSamples.push(rms)
          animFrameRef.current = requestAnimationFrame(processAudio)
          return
        }

        // Sau 1s: chuyển sang trạng thái sẵn sàng
        if (calibSamples.length > 0) {
          const avg = calibSamples.reduce((a, b) => a + b, 0) / calibSamples.length
          setAmbientNoise(Math.max(avg, 0.015))
          calibSamples = []
          setMicState('ready')
        }

        // Kiểm tra ngưỡng thổi
        const threshold = Math.max(ambientNoise * 2.8, 0.04)
        const isBlowing = rms >= threshold
        setIsBlowingNow(isBlowing)

        // Nếu đang ở pha thổi và có thổi -> tăng tiến độ
        setPhase((currentPhase) => {
          if (currentPhase === 'blow') {
            if (isBlowing) {
              blowDurationRef.current += dt
              // Cần 3 giây thổi để hoàn thành 1 lượt
              const pct = Math.min(100, Math.round((blowDurationRef.current / 3.0) * 100))
              setTurnProgress(pct)

              if (pct >= 100) {
                // Xong lượt này!
                blowDurationRef.current = 0
                handleTurnComplete()
              }
            }
          }
          return currentPhase
        })

        animFrameRef.current = requestAnimationFrame(processAudio)
      }

      animFrameRef.current = requestAnimationFrame(processAudio)
    } catch (err) {
      console.warn('Microphone denied or unavailable:', err)
      setMicState('fallback')
    }
  }

  /* Xử lý xong 1 lượt thổi */
  const handleTurnComplete = () => {
    soundPop(600)
    setTurnProgress(100)

    setTurn((currentTurn) => {
      if (currentTurn >= 3) {
        // Hoàn thành cả 3 lượt!
        soundSuccess()
        setTimeout(() => {
          stopAudio()
          onFinished?.('blow')
        }, 800)
        return currentTurn
      }

      // Chuyển sang pha hít vào 4 giây trước khi sang lượt tiếp theo
      setPhase('inhale')
      setInhaleCount(4)
      soundBreathe('in')

      let count = 4
      const inhaleInterval = setInterval(() => {
        count -= 1
        setInhaleCount(count)
        if (count <= 0) {
          clearInterval(inhaleInterval)
          setPhase('blow')
          setTurnProgress(0)
          blowDurationRef.current = 0
        }
      }, 1000)

      return currentTurn + 1
    })
  }

  /* Fallback: Chế độ giữ nút để thổi */
  const startHoldBlow = () => {
    setIsBlowingNow(true)
    const start = Date.now()
    pressTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000
      blowDurationRef.current = elapsed
      const pct = Math.min(100, Math.round((elapsed / 3.0) * 100))
      setTurnProgress(pct)
      if (pct >= 100) {
        clearInterval(pressTimerRef.current)
        pressTimerRef.current = null
        setIsBlowingNow(false)
        handleTurnComplete()
      }
    }, 50)
  }

  const stopHoldBlow = () => {
    setIsBlowingNow(false)
    if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current)
      pressTimerRef.current = null
    }
  }

  /* Logic Mẹ thở một mình (Double Inhale) */
  useEffect(() => {
    if (mode !== 'solo_mom') return
    let active = true

    const runSoloCycle = async () => {
      // Pha 1: Hít vào bằng mũi (2s)
      setSoloPhase('in1')
      soundBreathe('in')
      await new Promise((r) => setTimeout(r, 2000))
      if (!active) return

      // Pha 2: Hít thêm một hơi ngắn (1s)
      setSoloPhase('in2')
      await new Promise((r) => setTimeout(r, 1000))
      if (!active) return

      // Pha 3: Thở ra thật dài bằng miệng (5s)
      setSoloPhase('out')
      soundBreathe('out')
      await new Promise((r) => setTimeout(r, 5000))
      if (!active) return

      // Kiểm tra vòng tiếp theo
      setSoloRound((prev) => {
        if (prev >= 5) {
          soundSuccess()
          setTimeout(() => onFinished?.('solo_breath'), 800)
          return prev
        }
        runSoloCycle()
        return prev + 1
      })
    }

    runSoloCycle()
    return () => {
      active = false
    }
  }, [mode])

  return (
    <div
      className="card pop"
      style={{
        background: 'var(--c-surface, #FFFFFF)',
        border: '2px solid var(--c-accent, #7C3AED)',
        borderRadius: 24,
        padding: '20px 18px',
        boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header chuyển chế độ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className={`chip ${mode === 'with_child' ? 'on' : ''}`}
            onClick={() => setMode('with_child')}
            style={{ fontSize: 12.5, fontWeight: 700, padding: '4px 10px' }}
          >
            🌬️ Thổi cùng con
          </button>
          <button
            className={`chip ${mode === 'solo_mom' ? 'on' : ''}`}
            onClick={() => setMode('solo_mom')}
            style={{ fontSize: 12.5, fontWeight: 700, padding: '4px 10px' }}
          >
            🧘 Mẹ thở một mình
          </button>
        </div>
        <button
          className="round-btn"
          onClick={onCancel}
          style={{ width: 32, height: 32, fontSize: 14 }}
          title="Đóng lại"
        >
          ✕
        </button>
      </div>

      {mode === 'with_child' ? (
        <div>
          {/* Lời dẫn */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px', color: 'var(--c-text)' }}>
              {phase === 'inhale' ? '🌸 Hít vào bằng mũi...' : `Lượt ${turn} / 3: Thổi cùng con nào!`}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--c-text-2)' }}>
              {phase === 'inhale'
                ? `Chuẩn bị hơi thở cho lượt tiếp theo (${inhaleCount}s)`
                : 'Thổi liên tục 3 giây vào micro điện thoại nhé'}
            </p>
          </div>

          {/* Minh hoạ hình theo chủ đề */}
          <div
            style={{
              height: 180,
              display: 'grid',
              placeItems: 'center',
              position: 'relative',
              background: 'var(--c-bg, #F8FAFC)',
              borderRadius: 20,
              marginBottom: 14,
              overflow: 'hidden',
              border: '1px solid var(--c-line)',
            }}
          >
            <ThemeBlowGraphic
              themeId={themeId}
              turn={turn}
              progress={turnProgress}
              isBlowing={isBlowingNow}
              phase={phase}
            />

            {/* Vạch tiến độ 3 giây của lượt này */}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: 16,
                right: 16,
                height: 8,
                borderRadius: 4,
                background: 'var(--c-line, #E2E8F0)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${turnProgress}%`,
                  background: 'var(--c-good, #10B981)',
                  transition: 'width 0.1s linear',
                  borderRadius: 4,
                }}
              />
            </div>
          </div>

          {/* Trạng thái Microphone & Nút bấm */}
          {micState === 'prompt' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'var(--c-text-2)', marginBottom: 8 }}>
                🔒 <i>Mic chỉ nghe tiếng thổi ngay trên máy, không ghi âm, không gửi đi.</i>
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn solid"
                  style={{ flex: 1, padding: '12px 14px', fontSize: 14, fontWeight: 700 }}
                  onClick={startMic}
                >
                  🎙️ Bật mic thổi cùng con
                </button>
                <button
                  className="btn ghost"
                  style={{ padding: '12px 14px', fontSize: 13 }}
                  onClick={() => setMicState('fallback')}
                >
                  Giữ nút bấm
                </button>
              </div>
            </div>
          )}

          {micState === 'calibrating' && (
            <div style={{ textAlign: 'center', padding: '10px 0', fontSize: 13.5, color: 'var(--c-accent)' }}>
              ⏳ Đang lắng nghe tiếng ồn phòng trong 1 giây...
            </div>
          )}

          {micState === 'ready' && (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: isBlowingNow ? 'var(--c-good-bg, #DCFCE7)' : 'var(--c-surface-2)',
                  color: isBlowingNow ? 'var(--c-good-fg, #166534)' : 'var(--c-text)',
                  fontSize: 13.5,
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{isBlowingNow ? '💨 Đang thổi phì phì...' : '🎙️ Mic đang lắng nghe... Thổi vào nào!'}</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <button
                  className="btn ghost"
                  style={{ fontSize: 12, padding: '4px 10px', opacity: 0.8 }}
                  onClick={() => setMicState('fallback')}
                >
                  Đổi sang giữ nút nếu mic không nhận
                </button>
              </div>
            </div>
          )}

          {micState === 'fallback' && (
            <div style={{ textAlign: 'center' }}>
              <button
                className="btn solid"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: 16,
                  fontWeight: 800,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'none',
                  transform: isBlowingNow ? 'scale(0.97)' : 'scale(1)',
                  boxShadow: isBlowingNow ? 'none' : '0 4px 14px rgba(0,0,0,0.15)',
                }}
                onMouseDown={startHoldBlow}
                onMouseUp={stopHoldBlow}
                onTouchStart={startHoldBlow}
                onTouchEnd={stopHoldBlow}
              >
                {isBlowingNow ? '💨 ĐANG THỞ RA...' : '👉 NHẤN GIỮ VÀ THỞ RA'}
              </button>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--c-text-2)' }}>
                Giữ nút 3 giây cho mỗi lượt thổi nhé
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Mẹ thở một mình (Double Inhale) */
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px', color: 'var(--c-text)' }}>
            Vòng {soloRound} / 5 · Thở dài kép
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--c-text-2)' }}>
            Khoa học giúp hệ thần kinh dịu lại nhanh nhất sau 1 phút
          </p>

          {/* Vòng tròn dẫn nhịp */}
          <div style={{ display: 'grid', placeItems: 'center', height: 180, position: 'relative' }}>
            <div
              style={{
                width: soloPhase === 'in1' ? 110 : soloPhase === 'in2' ? 140 : 70,
                height: soloPhase === 'in1' ? 110 : soloPhase === 'in2' ? 140 : 70,
                borderRadius: '50%',
                background:
                  soloPhase === 'out'
                    ? 'var(--c-surface-2, #E2E8F0)'
                    : 'linear-gradient(135deg, var(--c-accent, #7C3AED), var(--c-good, #10B981))',
                display: 'grid',
                placeItems: 'center',
                color: soloPhase === 'out' ? 'var(--c-text)' : '#FFFFFF',
                fontWeight: 800,
                fontSize: 14,
                textAlign: 'center',
                padding: 10,
                transition: soloPhase === 'out' ? 'all 5s ease-out' : 'all 1.5s ease-in',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }}
            >
              {soloPhase === 'in1' && '1. Hít sâu mũi'}
              {soloPhase === 'in2' && '2. Hít thêm tí'}
              {soloPhase === 'out' && '3. Thở dài miệng...'}
            </div>
          </div>

          <div style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 8 }}>
            {soloPhase === 'in1' && 'Hít vào 1 hơi sâu bằng mũi (2s)'}
            {soloPhase === 'in2' && 'Hít bồi thêm một hơi ngắn (1s)'}
            {soloPhase === 'out' && 'Thở ra thật chậm và dài bằng miệng (5s)'}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Minh hoạ hình động 8 chủ đề cho trò thổi
 */
function ThemeBlowGraphic({ themeId, turn, progress, isBlowing, phase }) {
  const scale = 1 + (progress / 100) * 0.25

  switch (themeId) {
    case 'bear':
      // Thổi nguội cốc sữa mật ong cho Gấu
      return (
        <svg viewBox="0 0 200 140" width="180" height="126" style={{ overflow: 'visible' }}>
          {/* Cốc sữa */}
          <rect x="65" y="55" width="70" height="70" rx="14" fill="#FDF8EC" stroke="#78350F" strokeWidth="3" />
          <path d="M135 70 C 152 70, 152 105, 135 105" fill="none" stroke="#78350F" strokeWidth="3" />
          <ellipse cx="100" cy="55" rx="35" ry="12" fill="#FEF3C7" stroke="#78350F" strokeWidth="2.5" />
          {/* Mặt gấu nhỏ trên cốc */}
          <circle cx="92" cy="85" r="3" fill="#78350F" />
          <circle cx="108" cy="85" r="3" fill="#78350F" />
          <ellipse cx="100" cy="92" rx="4" ry="2.5" fill="#F59E0B" />
          {/* Hơi nước bốc lên (thổi thì bay sang bên) */}
          <g style={{ transform: isBlowing ? 'translate(25px, -15px) scale(0.6)' : 'none', transition: 'all 0.3s ease' }}>
            <path d="M85 45 Q 80 30, 85 15" fill="none" stroke="#D97706" strokeWidth="2" strokeDasharray="3 3" opacity={1 - progress / 100} />
            <path d="M100 42 Q 105 25, 100 10" fill="none" stroke="#D97706" strokeWidth="2.5" strokeDasharray="3 3" opacity={1 - progress / 100} />
            <path d="M115 45 Q 120 30, 115 15" fill="none" stroke="#D97706" strokeWidth="2" strokeDasharray="3 3" opacity={1 - progress / 100} />
          </g>
          {/* Chữ ghi chú */}
          <text x="100" y="136" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400E">
            {progress >= 100 ? 'Sữa đã nguội thơm ngon rồi! 🍯' : 'Thổi nguội sữa cho Gấu nhé'}
          </text>
        </svg>
      )

    case 'candy':
      // Thổi tắt 3 ngọn nến trên bánh kẹo
      return (
        <svg viewBox="0 0 200 140" width="180" height="126">
          {/* Bánh kem */}
          <path d="M50 85 Q 100 80, 150 85 L 150 120 Q 100 125, 50 120 Z" fill="#FBCFE8" stroke="#DB2777" strokeWidth="2.5" />
          {/* 3 ngọn nến */}
          {[65, 100, 135].map((x, idx) => {
            const isOut = idx < turn - 1 || (idx === turn - 1 && progress >= 100)
            return (
              <g key={x}>
                <rect x={x - 4} y="55" width="8" height="30" rx="3" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
                {!isOut && (
                  <ellipse
                    cx={x}
                    cy="45"
                    rx={isBlowing && idx === turn - 1 ? 3 : 5}
                    ry={isBlowing && idx === turn - 1 ? 8 : 10}
                    fill="#F97316"
                    style={{
                      transformOrigin: `${x}px 50px`,
                      animation: 'flicker 0.6s infinite alternate',
                    }}
                  />
                )}
              </g>
            )
          })}
          <text x="100" y="136" textAnchor="middle" fontSize="11" fontWeight="700" fill="#BE185D">
            {progress >= 100 ? 'Nến đã tắt rồi! 🎉' : `Thổi tắt ngọn nến thứ ${turn} nào!`}
          </text>
        </svg>
      )

    case 'garden':
      // Thổi hạt bồ công anh bay xa
      return (
        <svg viewBox="0 0 200 140" width="180" height="126">
          {/* Cành hoa */}
          <path d="M100 125 Q 98 90, 100 70" fill="none" stroke="#16A34A" strokeWidth="3" />
          <circle cx="100" cy="70" r="10" fill="#CA8A04" />
          {/* Các hạt bồ công anh */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180
            const dx = Math.cos(angle) * (20 + (isBlowing ? progress * 0.5 : 0))
            const dy = Math.sin(angle) * (20 + (isBlowing ? progress * 0.3 : 0))
            const op = Math.max(0.2, 1 - progress / 100)
            return (
              <circle key={i} cx={100 + dx} cy={70 + dy} r="3.5" fill="#FEF08A" opacity={op} />
            )
          })}
          <text x="100" y="136" textAnchor="middle" fontSize="11" fontWeight="700" fill="#15803D">
            {progress >= 100 ? 'Hạt bay khắp bầu trời đêm! ✨' : 'Thổi hạt bồ công anh bay xa'}
          </text>
        </svg>
      )

    default:
      // Mặc định: Vòng tròn năng lượng tập thở
      return (
        <svg viewBox="0 0 200 140" width="180" height="126">
          <circle cx="100" cy="65" r="45" fill="none" stroke="var(--c-line)" strokeWidth="8" />
          <circle
            cx="100"
            cy="65"
            r="45"
            fill="none"
            stroke="var(--c-accent)"
            strokeWidth="8"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            strokeLinecap="round"
            transform="rotate(-90 100 65)"
          />
          <text x="100" y="70" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--c-text)">
            {progress}%
          </text>
          <text x="100" y="132" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--c-text-2)">
            Thổi đều hơi để lấp đầy vòng tròn
          </text>
        </svg>
      )
  }
}
