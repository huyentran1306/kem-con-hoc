/* ============================================================
   ẢNH XEM TRƯỚC 2 MÀN CỦA MỘT BỘ GIAO DIỆN (dùng trong trang admin)
   Màn 1: màn chính (đầu màn, theo dõi học đều, nút bắt đầu)
   Màn 2: hỏi con từng bước (bậc, câu đọc to, gợi ý, 2 nút)
   Vẽ bằng khối màu từ biến của bộ, không tải font hay ảnh.
   ============================================================ */
import React from 'react'

const HERO = {
  noel: 'radial-gradient(circle at 80% 0, #2B5A80, #14304A 60%)',
  tet: 'radial-gradient(circle at 20% 0, #C8102E, #B00E28 65%)',
  thieunhi: 'linear-gradient(160deg, #2F62E0, #2A56C6)',
}

function pick(vars, keys, fallback) {
  for (const k of keys) if (vars && vars[k]) return vars[k]
  return fallback
}

export function ThemeTwoScreenPreview({ themeId, vars = {}, icon = '', scale = 1, label }) {
  const bg = pick(vars, ['--c-bg'], '#FFF8EC')
  const surface = pick(vars, ['--c-surface'], '#FFFFFF')
  const line = pick(vars, ['--c-line'], '#E2D9CC')
  const text = pick(vars, ['--c-text'], '#1E293B')
  const accent = pick(vars, ['--c-accent', '--c-primary'], '#F6A623')
  const btn = pick(vars, ['--c-btn', '--c-accent', '--c-primary'], accent)
  const good = pick(vars, ['--c-good', '--c-success'], '#22B07D')
  const readBg = pick(vars, ['--c-read-bg', '--c-surface-2'], '#FFFFFF')
  const readText = pick(vars, ['--c-read-text', '--c-text'], text)
  const warnBg = pick(vars, ['--c-warn-bg'], '#FFF6E5')
  const surface2 = pick(vars, ['--c-surface-2'], '#F1EDE6')
  const hero = HERO[themeId] || `linear-gradient(160deg, ${surface2}, ${bg})`
  const w = 86 * scale
  const h = 150 * scale
  const r = 12 * scale
  const u = scale
  const phone = {
    width: w,
    height: h,
    borderRadius: r,
    border: `${1.5 * u}px solid #1E293B`,
    background: bg,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 5 * u,
    padding: 5 * u,
    boxSizing: 'border-box',
    flexShrink: 0,
  }
  const bar = (wd, c, hh = 4) => ({ width: wd, height: hh * u, borderRadius: 3 * u, background: c })
  return (
    <div
      style={{ display: 'flex', gap: 8 * u, justifyContent: 'center' }}
      role="img"
      aria-label={label || 'Xem trước 2 màn: màn chính và hỏi con từng bước'}
    >
      <div style={phone}>
        <div style={{ background: hero, borderRadius: 8 * u, padding: 5 * u, display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: -1 * u }}>
          <div style={{ display: 'grid', gap: 3 * u }}>
            <i style={bar(30 * u, 'rgba(255,255,255,.85)')} />
            <i style={bar(22 * u, 'rgba(255,255,255,.6)', 3)} />
          </div>
          <span style={{ fontSize: 14 * u, lineHeight: 1 }}>{icon}</span>
        </div>
        <div style={{ background: surface, border: `${u}px solid ${line}`, borderRadius: 6 * u, padding: 4 * u, display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 * u }}>
          {[1, 1, 0, 1, 2, 0, 0].map((s, i) => (
            <i key={i} style={{ height: 9 * u, borderRadius: 3 * u, background: s === 1 ? accent : s === 2 ? surface : surface2, border: s === 2 ? `${u}px solid ${accent}` : 'none' }} />
          ))}
        </div>
        <div style={{ background: btn, borderRadius: 8 * u, height: 18 * u }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 * u }}>
          <i style={{ height: 14 * u, borderRadius: 5 * u, background: surface, border: `${u}px solid ${line}` }} />
          <i style={{ height: 14 * u, borderRadius: 5 * u, background: surface, border: `${u}px solid ${line}` }} />
        </div>
        <div style={{ marginTop: 'auto', height: 12 * u, borderTop: `${u}px solid ${line}`, background: surface, margin: `auto ${-5 * u}px ${-5 * u}px` }} />
      </div>
      <div style={phone}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 3 * u }}>
          {[good, accent, line, line].map((c, i) => (
            <i key={i} style={{ height: 8 * u, borderRadius: 4 * u, background: c }} />
          ))}
        </div>
        <div style={{ background: readBg, border: `${1.5 * u}px solid ${accent}`, borderRadius: 7 * u, padding: 5 * u, display: 'grid', gap: 3 * u }}>
          <i style={bar('90%', readText)} />
          <i style={bar('70%', readText)} />
          <i style={bar('80%', readText)} />
        </div>
        <div style={{ background: warnBg, borderRadius: 6 * u, height: 16 * u, border: `${u}px dashed ${line}` }} />
        <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 * u }}>
          <i style={{ height: 14 * u, borderRadius: 7 * u, background: surface, border: `${u}px solid ${line}` }} />
          <i style={{ height: 14 * u, borderRadius: 7 * u, background: btn }} />
        </div>
      </div>
    </div>
  )
}

export default ThemeTwoScreenPreview
