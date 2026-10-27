/* ============================================================
   KÈM CON HỌC — KHUNG CHUYỂN ĐỘNG DÙNG CHUNG (Prompt 22 Chặng 1 & 2)
   Lớp hiệu ứng theo 6 sự kiện, hoạt động trên cả 11 bộ giao diện.
   Chỉ CSS & SVG, không chặn thao tác, tôn trọng prefers-reduced-motion.
   ============================================================ */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { AppCtx } from './ctx'
import { getTheme } from './themes.js'
import { BuddyMascot, resolveBuddyId } from './themes/buddies/buddySvgs.jsx'
import './themes/motion.css'

// Global Event Bus cho chuyển động
const motionListeners = new Set()

export function emitMotion(event, payload = {}) {
  motionListeners.forEach((fn) => {
    try {
      fn(event, payload)
    } catch (e) {
      console.warn('Motion listener error:', e)
    }
  })
}

export function useMotion() {
  const trigger = useCallback((event, payload = {}) => {
    emitMotion(event, payload)
  }, [])
  return { trigger, emitMotion }
}

/**
 * 6 KHOẢNH KHẮC CHUYỂN ĐỘNG DÙNG CHUNG
 * Hỗ trợ render độc lập (cho Xem trước Admin) hoặc render trong bài học
 */
export function MotionStage({
  themeId = 'bear',
  event = 'step_done',
  payload = {},
  themeOverride = null,
  interactive = false,
  showCap = true,
}) {
  const theme = themeOverride || getTheme(themeId)
  const m = theme.motion || getTheme('bear').motion
  const buddyId = resolveBuddyId(theme.id)
  const isNight = m.split?.cardStyle === 'night' || m.split?.cardStyle === 'glass'
  const glowClass = isNight ? ' glow' : ''

  // Inline CSS variables cho stage này (100% không viết cứng hex)
  const stageStyle = {
    '--liq': m.vessel?.liquid || 'linear-gradient(var(--c-accent), var(--c-accent-2))',
    '--c-bg': theme.vars?.['--c-bg'],
    '--c-surface': theme.vars?.['--c-surface'],
    '--c-line': theme.vars?.['--c-line'],
    '--c-text': theme.vars?.['--c-text'],
    '--c-text-2': theme.vars?.['--c-text-2'],
    '--c-accent': theme.vars?.['--c-accent'],
    '--c-accent-2': theme.vars?.['--c-accent-2'],
    '--c-good': theme.vars?.['--c-good'],
    '--c-on-good': theme.vars?.['--c-on-good'],
  }

  // 1. Xong một bậc (fill / step_done)
  if (event === 'step_done' || event === 'fill') {
    return (
      <div className="st" data-style={m.split?.cardStyle} style={stageStyle} data-testid="motion-stage-step-done">
        <div className="fill">
          <span className="m">
            <BuddyMascot buddyId={buddyId} state="cheer" size={44} />
          </span>
          <div className="vessel">
            <i className="liq" />
            <span className="fr">{payload?.step || 3}/{payload?.total || 4}</span>
            <span className="vi">{m.vessel?.icon}</span>
          </div>
          <span className={`drop${glowClass}`}>{m.vessel?.drop}</span>
          <i className={`sp s1${glowClass}`}>{m.vessel?.spark}</i>
          <i className={`sp s2${glowClass}`}>{m.vessel?.spark}</i>
          <i className={`sp s3${glowClass}`}>{m.vessel?.spark}</i>
        </div>
        {showCap && <div className="cap">Con làm được rồi!</div>}
      </div>
    )
  }

  // 2. Kẹt (stuck)
  if (event === 'stuck') {
    return (
      <div className="st" data-style={m.split?.cardStyle} style={stageStyle} data-testid="motion-stage-stuck">
        <div className="stuck-motion">
          <span className="m">
            <BuddyMascot buddyId={buddyId} state="thinking" size={44} />
          </span>
          <i className={`q q1${glowClass}`}>{m.stuck?.particle}</i>
          <i className={`q q2${glowClass}`}>{m.stuck?.particle}</i>
          <i className={`q q3${glowClass}`}>{m.stuck?.particle}</i>
          <div className="card">"{payload?.question || payload?.hint || "Mẹ dùng mất bao nhiêu quả?"}"</div>
        </div>
        {showCap && <div className="cap">Con chưa nghĩ ra</div>}
      </div>
    )
  }

  // 3. Chẻ nhỏ câu hỏi (micro_step / split)
  if (event === 'micro_step' || event === 'split') {
    const tg = m.split?.tag ? `${m.split.tag} ` : ''
    return (
      <div className="st" data-style={m.split?.cardStyle} style={stageStyle} data-testid="motion-stage-micro-step">
        <div className="split-motion">
          <div className="card big">{payload?.question || "Còn lại thì làm phép gì?"}</div>
          <div className="card sm a">{tg}{payload?.hint || "Dùng mất là nhiều lên hay ít đi?"}</div>
          <div className="card sm b">{tg}{payload?.hint2 || "Số nào đi cùng câu hỏi này?"}</div>
        </div>
        {showCap && <div className="cap">{m.mascot} chẻ nhỏ câu hỏi</div>}
      </div>
    )
  }

  // 4. Nghe con trả lời (listen / listen_start / listen_result)
  if (event === 'listen' || event === 'listen_start' || event === 'listen_result') {
    return (
      <div className="st" data-style={m.split?.cardStyle} style={stageStyle} data-testid="motion-stage-listen">
        <div className="listen-motion" data-ring={m.listen?.ring}>
          <span className="m">
            <BuddyMascot buddyId={buddyId} state="reading" size={44} />
          </span>
          <i className="ring" />
          <i className="ring r2" />
          <i className="ring r3" />
          {m.listen?.icon && <span className="ri">{m.listen.icon}</span>}
          <div className="card said">"Con nghĩ là phép trừ!"</div>
          <div className="ok">✓ Đúng rồi!</div>
        </div>
        {showCap && <div className="cap">{m.mascot} đang nghe con</div>}
      </div>
    )
  }

  // 5. Tặng huy hiệu (badge_given / fly)
  if (event === 'badge_given' || event === 'fly') {
    return (
      <div className="st" data-style={m.split?.cardStyle} style={stageStyle} data-testid="motion-stage-badge-given">
        <div className="fly-motion">
          <div className="stk">🐢</div>
          <i className={`tr t1${glowClass}`}>{m.fly?.trail}</i>
          <i className={`tr t2${glowClass}`}>{m.fly?.trail}</i>
          <i className={`tr t3${glowClass}`}>{m.fly?.trail}</i>
          <i className={`tr t4${glowClass}`}>{m.fly?.trail}</i>
          <div className="book">
            📖<span>+1</span>
          </div>
        </div>
        {showCap && <div className="cap">Huy hiệu Kiên nhẫn</div>}
      </div>
    )
  }

  // 6. Dấu chân tuần này (day_logged / paw)
  return (
    <div className="st" data-style={m.split?.cardStyle} style={stageStyle} data-testid="motion-stage-day-logged">
      <div className="paw-motion">
        {['T2', 'T3', 'T4', 'T5'].map((d) => (
          <span key={d} className={glowClass.trim()}>
            {m.paw?.stamp}
            <b>{d}</b>
          </span>
        ))}
      </div>
      {showCap && <div className="cap">Dấu tuần này</div>}
    </div>
  )
}

/**
 * Lớp phủ hiệu ứng trong bài học (chạy ngắn < 2.5s, không chặn click)
 */
export function MotionLayer() {
  const { S } = useContext(AppCtx) || {}
  const theme = getTheme(S?.theme || 'bear')
  const [activeMotion, setActiveMotion] = useState(null)

  useEffect(() => {
    const handler = (event, payload) => {
      // Tôn trọng prefers-reduced-motion hoặc khi tắt hiệu ứng
      if (typeof document !== 'undefined' && document.documentElement.dataset.motion === 'off') {
        return
      }
      setActiveMotion({ event, payload, ts: Date.now() })
      const timer = setTimeout(() => {
        setActiveMotion((cur) => (cur?.event === event ? null : cur))
      }, 2400)
      return () => clearTimeout(timer)
    }

    motionListeners.add(handler)
    return () => {
      motionListeners.delete(handler)
    }
  }, [])

  if (!activeMotion) return null

  // A3: stuck và micro_step chạy trực tiếp trên thẻ câu hỏi, không dùng khung nổi bị cắt mép
  if (activeMotion.event === 'stuck' || activeMotion.event === 'micro_step' || activeMotion.event === 'split') {
    return null
  }

  // Prompt 23J: Bỏ hẳn nền trắng, viền, bóng của thẻ bao ngoài
  const isFinish = activeMotion.event === 'step_done' && (activeMotion.payload?.step >= activeMotion.payload?.total)
  const isBadge = activeMotion.event === 'badge_given' || activeMotion.event === 'fly'
  const layerTop = isFinish ? 16 : (isBadge ? 48 : 52)

  return (
    <div
      className="motion-layer-transparent"
      style={{
        position: 'fixed',
        top: layerTop,
        right: 8,
        zIndex: 9998,
        width: 220,
        height: 165,
        pointerEvents: 'none',
        background: 'transparent',
        borderRadius: 0,
        border: 0,
        boxShadow: 'none',
        overflow: 'visible',
        animation: 'fadeIn 0.2s ease-out',
        transform: 'scale(0.72)',
        transformOrigin: 'top right',
      }}
      data-testid="motion-layer-active"
    >
      <MotionStage
        themeId={theme.id}
        event={activeMotion.event}
        payload={activeMotion.payload}
        showCap={false}
      />
    </div>
  )
}

export default MotionLayer
