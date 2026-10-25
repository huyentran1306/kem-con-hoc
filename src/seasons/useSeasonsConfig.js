/* ============================================================
   ĐỢT 16 · ĐỌC KHUNG MÙA TỪ MÁY CHỦ
   Ưu tiên trường `seasons` của GET /api/v1/config/public; nếu worker chưa gắn,
   thử GET /api/v1/config/seasons; không có thì dùng khung mặc định.
   ============================================================ */
import { useEffect, useState } from 'react'
import { GATEWAY, loadPublicConfig } from '../api'
import { normalizeSeasonsConfig, vnToday, isIsoDate } from './seasonLogic'

let cache = null
let pending = null

export function loadSeasonsConfig(force = false) {
  if (cache && !force) return Promise.resolve(cache)
  if (pending && !force) return pending
  pending = (async () => {
    let raw = null
    try {
      const pub = await loadPublicConfig(force)
      if (pub && pub.seasons) raw = pub.seasons
    } catch (e) {}
    if (!raw) {
      try {
        const res = await fetch(`${GATEWAY}/api/v1/config/seasons`)
        if (res.ok) {
          const j = await res.json()
          raw = j && j.seasons ? j.seasons : null
        }
      } catch (e) {}
    }
    cache = normalizeSeasonsConfig(raw)
    return cache
  })()
  return pending
}

export function useSeasonsConfig() {
  const [cfg, setCfg] = useState(() => cache || normalizeSeasonsConfig(null))
  const [ready, setReady] = useState(Boolean(cache))
  useEffect(() => {
    let alive = true
    loadSeasonsConfig().then((c) => {
      if (!alive) return
      setCfg(c)
      setReady(true)
    })
    return () => {
      alive = false
    }
  }, [])
  return { cfg, ready }
}

/* Hôm nay theo giờ Việt Nam. Kiểm thử bằng ngày giả: localStorage 'kem-con-hoc:season-today' = '2026-12-01' */
export function getSeasonToday() {
  try {
    const fake = typeof localStorage !== 'undefined' ? localStorage.getItem('kem-con-hoc:season-today') : null
    if (fake && isIsoDate(fake)) return fake
  } catch (e) {}
  return vnToday()
}
