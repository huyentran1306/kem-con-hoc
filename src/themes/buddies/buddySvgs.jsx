/* ============================================================
   KÈM CON HỌC — LINH VẬT ĐỒNG HÀNH BIẾT CỬ ĐỘNG
   <BuddyMascot buddyId state size />  — vẽ 1 linh vật
   <ThemeBuddy state size />           — tự lấy linh vật theo bộ giao diện đang dùng
   <BuddyGreeter />                    — linh vật chào ở trang chủ, chạm để nói chuyện
   <BuddyPopLayer /> + buddyReact()    — linh vật bật lên khi con làm đúng / bối rối
   Trạng thái: idle | hello | reading | thinking | cheer | love | surprised | oops | sleepy
   (tên cũ hello/nudge/cheer và chao/nhac/vui vẫn dùng được)
   ============================================================ */
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AppCtx } from '../../ctx'
import { CUSTOM_BUDDIES } from '../customPalette.js'
import { BUDDY_QUOTES } from './buddyQuotes.js'
import { buddyInnerSVG, hasBuddyArt, normalizeBuddyState, BUDDY_NAMES, BUDDY_VIEWBOX } from './buddyArt.js'
import './buddy.css'

export { BUDDY_QUOTES, BUDDY_NAMES }

const TAP_LINES = ['Hí hí, nhột quá!', 'Con chạm nhẹ quá à, thích ghê!', 'Thêm một cái ôm nữa nha!']

/* Bộ giao diện → linh vật (lấy theo autoIcon trong CUSTOM_BUDDIES; bento không dùng linh vật) */
/* Đợt 16: linh vật của 3 bộ theo mùa */
const SEASON_BUDDIES = { noel: 'snowman', tet: 'lion', thieunhi: 'kite' }

export function resolveBuddyId(themeId) {
  if (SEASON_BUDDIES[themeId]) return SEASON_BUDDIES[themeId]
  if (themeId === 'custom') {
    try {
      const cfg = JSON.parse(localStorage.getItem('kem-con-hoc:custom-theme') || '{}')
      if (cfg && cfg.buddy) return cfg.buddy
    } catch (e) {}
    return 'unicorn'
  }
  const found = CUSTOM_BUDDIES.find((b) => b.autoIcon === themeId)
  return found ? found.id : 'bear'
}

export function useThemeBuddyId() {
  const ctx = useContext(AppCtx)
  return resolveBuddyId(ctx?.S?.theme || 'bear')
}

export function buddyQuote(buddyId, key = 'hello') {
  return BUDDY_QUOTES[buddyId]?.[key] || ''
}

export function BuddyMascot({ buddyId = 'unicorn', state = 'hello', size = 56, interactive = false, onTap, label, className = '' }) {
  const st = normalizeBuddyState(state)
  const html = useMemo(() => buddyInnerSVG(buddyId, st), [buddyId, st])
  const [tap, setTap] = useState(0)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  if (!hasBuddyArt(buddyId)) return null

  const doTap = () => {
    setTap((n) => n + 1)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setTap(0), 900)
    if (onTap) onTap()
  }
  const name = label || BUDDY_NAMES[buddyId] || 'Linh vật'
  // Thân linh vật nằm đúng trong ô size×size; đạo cụ (tim, kính lúp, zzz) được tràn ra ngoài
  const svgStyle = { width: size * 1.4, height: size * 1.4, left: -size * 0.2, top: -size * 0.24 }

  return (
    <span
      className={`kbuddy-wrap ${interactive ? 'is-tappable' : ''} ${tap ? 'tap' : ''} ${className}`}
      style={{ width: size, height: size }}
      role={interactive ? 'button' : 'img'}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `${name} – chạm để nói chuyện` : name}
      onClick={interactive ? doTap : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                doTap()
              }
            }
          : undefined
      }
    >
      <svg
        key={tap ? `t${tap}` : 'n'}
        className={`kbuddy b-${buddyId} st-${st}`}
        viewBox={BUDDY_VIEWBOX}
        style={svgStyle}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {tap > 0 &&
        [-14, 2, 16].map((dx, i) => (
          <svg key={`${tap}-${i}`} className="kb-heart" viewBox="0 0 10 11" style={{ '--dx': `${dx}px` }} aria-hidden="true">
            <path d="M0 3C0-1 5-1 5 2.5C5-1 10-1 10 3C10 6 5 9 5 10.5C5 9 0 6 0 3Z" fill="var(--c-accent, #EC4899)" />
          </svg>
        ))}
    </span>
  )
}

/* Linh vật theo bộ giao diện đang dùng (bento/“Không dùng” → không vẽ gì) */
export function ThemeBuddy(props) {
  const buddyId = useThemeBuddyId()
  if (!hasBuddyArt(buddyId)) return props.fallback || null
  return <BuddyMascot buddyId={buddyId} {...props} />
}

/* Trang chủ: chào khi vừa mở, chạm vào thì nhún, thả tim và nói chuyện */
export function BuddyGreeter({ size = 72 }) {
  const buddyId = useThemeBuddyId()
  const [state, setState] = useState('hello')
  const [say, setSay] = useState(null)
  const idx = useRef(0)
  const t1 = useRef(null)
  const t2 = useRef(null)

  useEffect(() => {
    t1.current = setTimeout(() => setState('idle'), 3600)
    return () => {
      clearTimeout(t1.current)
      clearTimeout(t2.current)
    }
  }, [])

  if (!hasBuddyArt(buddyId)) return null

  const lines = [buddyQuote(buddyId, 'hello'), ...TAP_LINES].filter(Boolean)
  const onTap = () => {
    setState('idle')
    setSay({ text: lines[idx.current % lines.length], k: Date.now() })
    idx.current += 1
    clearTimeout(t2.current)
    t2.current = setTimeout(() => setSay(null), 3000)
  }

  return (
    <div className="kb-greeter">
      {say && (
        <div className="kb-say" key={say.k} role="status">
          {say.text}
        </div>
      )}
      <BuddyMascot buddyId={buddyId} state={state} size={size} interactive onTap={onTap} />
    </div>
  )
}

/* ---------- Linh vật bật lên (toàn app) ---------- */
const POP_EVENT = 'kch:buddy'

/** Gọi ở bất kỳ đâu: buddyReact('cheer') / buddyReact('oops', 'Mình thử lại nhé') */
export function buddyReact(state = 'cheer', text, ms = 2400) {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(new CustomEvent(POP_EVENT, { detail: { state, text, ms } }))
  } catch (e) {}
}

export function BuddyPopLayer() {
  const buddyId = useThemeBuddyId()
  const [pop, setPop] = useState(null)

  useEffect(() => {
    let t
    const onPop = (e) => {
      const d = e.detail || {}
      clearTimeout(t)
      setPop({ state: d.state || 'cheer', text: d.text, k: Date.now() })
      t = setTimeout(() => setPop(null), d.ms || 2400)
    }
    window.addEventListener(POP_EVENT, onPop)
    return () => {
      window.removeEventListener(POP_EVENT, onPop)
      clearTimeout(t)
    }
  }, [])

  if (!pop || !hasBuddyArt(buddyId)) return null
  const text = pop.text === undefined ? (pop.state === 'cheer' ? buddyQuote(buddyId, 'cheer') : '') : pop.text

  return (
    <div className="kb-pop" key={pop.k} role="status" aria-live="polite">
      <BuddyMascot buddyId={buddyId} state={pop.state} size={64} />
      {text && <div className="kb-say">{text}</div>}
    </div>
  )
}
