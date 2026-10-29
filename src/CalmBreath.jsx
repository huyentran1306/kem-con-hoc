/* ============================================================
   Gói 41 · "{Mẹ/Bố} bình tĩnh": bấm vào là hít thở cùng nhau như bản trước
   Hít vào 4 giây · thở ra 4 giây, vòng tròn to lên / nhỏ lại theo nhịp, đếm ngược 4 → 1.
   Bên dưới vẫn có lối vào các gợi ý khác (con chưa hiểu, mất tập trung, thổi cùng con…).
   ============================================================ */
import { useContext, useEffect, useRef, useState } from 'react'
import { AppCtx } from './ctx'
import { CALM_LINES } from './data'
import { soundBreathe } from './audio'
import { swapMe } from './xungHo'
import { buzz } from './utils'
import './calm.css'

export const BREATH_SECONDS = 4
export const BREATH_ROUNDS = 4 // 4 vòng × (4 + 4) giây ≈ 30 giây

export function CalmBreathSheet({ onMore, onDone }) {
  const { ho = 'bố mẹ', Ho = 'Bố mẹ', soundOn, toggleSound } = useContext(AppCtx) || {}
  const [phase, setPhase] = useState('in') // 'in' | 'out' | 'done'
  const [count, setCount] = useState(BREATH_SECONDS)
  const [round, setRound] = useState(1)
  const [runKey, setRunKey] = useState(0)
  const st = useRef({ phase: 'in', count: BREATH_SECONDS, round: 1 })

  useEffect(() => {
    st.current = { phase: 'in', count: BREATH_SECONDS, round: 1 }
    setPhase('in'); setCount(BREATH_SECONDS); setRound(1)
    soundBreathe('in')
    const t = setInterval(() => {
      const s = st.current
      if (s.phase === 'done') return
      if (s.count > 1) { s.count -= 1; setCount(s.count); return }
      // hết 4 giây của nhịp hiện tại
      if (s.phase === 'in') {
        s.phase = 'out'; s.count = BREATH_SECONDS
        soundBreathe('out')
      } else if (s.round >= BREATH_ROUNDS) {
        s.phase = 'done'
        buzz(20)
      } else {
        s.phase = 'in'; s.count = BREATH_SECONDS; s.round += 1
        soundBreathe('in')
      }
      setPhase(s.phase); setCount(s.count); setRound(s.round)
    }, 1000)
    return () => clearInterval(t)
  }, [runKey])

  const label = phase === 'in' ? 'Hít vào…' : phase === 'out' ? 'Thở ra…' : 'Xong rồi 💚'

  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onDone(false)}>
      <div className="pn calm-pn" role="dialog" aria-modal="true" aria-labelledby="calm-title" data-testid="calm-breath">
        <div className="grabber" />
        <div className="calm-head">
          <h2 id="calm-title">Hít thở cùng con 30 giây</h2>
          <button type="button" className="calm-sound" onClick={toggleSound} aria-pressed={Boolean(soundOn)} data-no-sound>
            {soundOn ? '🔊 Bật tiếng' : '🔇 Tắt tiếng'}
          </button>
        </div>

        <div className="calm-breath-wrap">
          <div className={`calm-circle ${phase}`} key={`${runKey}-${round}-${phase}`} aria-live="polite">
            <b>{label}</b>
            {phase !== 'done' && <span className="calm-count" data-testid="calm-count">{count}</span>}
          </div>
          <p className="calm-sub">
            {phase === 'done' ? `Đủ ${BREATH_ROUNDS} vòng rồi. ${Ho} thấy nhẹ hơn chưa?` : `Hít vào ${BREATH_SECONDS} giây · thở ra ${BREATH_SECONDS} giây · vòng ${round}/${BREATH_ROUNDS}`}
          </p>
          {phase === 'done' && (
            <button type="button" className="calm-again" onClick={() => setRunKey((k) => k + 1)}>Thở thêm 30 giây</button>
          )}
        </div>

        <div className="calm-say no">
          <span>Thay vì nói</span>
          <s>"{CALM_LINES.replace}"</s>
        </div>
        <div className="calm-say yes">
          <span>Thử nói</span>
          <p>"{swapMe(CALM_LINES.trySay, ho)}"</p>
        </div>

        <button type="button" className="calm-ok" onClick={() => onDone(true)} data-testid="calm-ok">Mình ổn rồi</button>
        {onMore && (
          <button type="button" className="calm-more" onClick={onMore} data-testid="calm-more">
            Con đang gặp khó? Xem gợi ý khác ›
          </button>
        )}
      </div>
    </div>
  )
}
