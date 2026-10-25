/* ============================================================
   ĐỢT 16 · HIỆU ỨNG NỀN THEO MÙA (chỉ CSS, tối đa 24 hạt mỗi màn)
   Tuyết (Đêm Tuyết) · hoa mai và pháo hoa ánh sáng (Xuân Sum Vầy, không có tiếng)
   Bóng bay và giấy màu (Cầu Vồng 1/6)
   Chỉ chạy ở màn chính và màn Xong bài. Không render hạt nào khi:
   máy bật "giảm chuyển động", app đặt chuyển động Tắt, tab bị ẩn,
   hoặc đang ở màn Hỏi con từng bước.
   ============================================================ */
import React, { useEffect, useMemo, useState } from 'react'
import { particlePlan, MAX_PARTICLES } from './seasonLogic'

export { MAX_PARTICLES }
import './seasons.css'

function rng(seed) {
  let x = seed >>> 0
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0
    return x / 4294967296
  }
}

function readReduced() {
  try {
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch (e) {
    return false
  }
}

export function SeasonParticles({ themeId = 'bear', motion = 'full', screen = 'home' }) {
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden)
  const [reduced, setReduced] = useState(readReduced)

  // Gắn tên màn lên <html> để CSS biết đang ở màn nào (quầng chữ màn Xong bài, linh kiện màn Hỏi con)
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.seasonScreen = screen || ''
  }, [screen])

  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    const onVis = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    let mq = null
    const onMq = () => setReduced(readReduced())
    try {
      mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (mq.addEventListener) mq.addEventListener('change', onMq)
      else if (mq.addListener) mq.addListener(onMq)
    } catch (e) {}
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      try {
        if (mq && mq.removeEventListener) mq.removeEventListener('change', onMq)
        else if (mq && mq.removeListener) mq.removeListener(onMq)
      } catch (e) {}
    }
  }, [])

  const plan = useMemo(() => (hidden || reduced ? [] : particlePlan(themeId, screen, motion)), [themeId, screen, motion, hidden, reduced])

  const items = useMemo(() => {
    const r = rng(themeId.length * 97 + (screen === 'done' ? 13 : 7))
    const out = []
    plan.forEach((layer) => {
      for (let i = 0; i < layer.count && out.length < MAX_PARTICLES; i++) {
        const left = Math.round(r() * 96)
        const dur = (layer.kind === 'fw' ? 2.6 : 6) + r() * 5
        const delay = -(r() * 9)
        const scale = 0.6 + r() * 0.65
        const style = {
          left: `${left}%`,
          animationDuration: `${dur.toFixed(1)}s`,
          animationDelay: `${delay.toFixed(1)}s`,
          '--s': scale.toFixed(2),
        }
        if (layer.kind === 'fw') style.top = `${8 + Math.round(r() * 30)}%`
        const glyph = layer.kind === 'snow' ? (i % 3 === 0 ? '❄' : '•') : layer.kind === 'petal' ? '✿' : ''
        out.push(
          <i key={`${layer.kind}-${i}`} className={`sfx-${layer.kind}`} style={style}>
            {glyph}
          </i>
        )
      }
    })
    return out
  }, [plan, themeId, screen])

  if (!items.length) return null
  return (
    <div className={`season-fx season-fx-${themeId}`} aria-hidden="true" data-testid="season-fx">
      {items}
    </div>
  )
}
