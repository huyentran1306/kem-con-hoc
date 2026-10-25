/* ============================================================
   ĐỢT 16 · BẬC HỎI CON THEO MÙA (màn Hỏi con từng bước)
   Đêm Tuyết: dây đèn (xong sáng vàng, đang hỏi nhấp nháy đỏ)
   Xuân Sum Vầy: lồng đèn (xong sáng đỏ quầng vàng, đang hỏi đung đưa)
   Cầu Vồng 1/6: bậc cầu vồng cao dần (xong tô màu, đang hỏi nhún nhảy)
   Màn này chỉ giữ các chuyển động nhỏ này, không có hạt rơi.
   ============================================================ */
import React, { useContext } from 'react'
import { AppCtx } from '../ctx'
import { isSeasonalTheme } from './seasonLogic'
import './seasons.css'

const RAINBOW = ['#FF5A5F', '#FF9F1C', '#2EC4B6', '#3A86FF', '#8338EC', '#FFD23F']

function stateOf(i, current, total) {
  if (current >= total || i < current) return 'on'
  if (i === current) return 'cur'
  return 'off'
}

function NoelLights({ total, current }) {
  const n = total
  const xs = Array.from({ length: n }, (_, i) => (n === 1 ? 150 : 36 + (i * 228) / (n - 1)))
  const wireY = (x) => 10 + 14 * Math.sin((x / 300) * Math.PI)
  return (
    <svg viewBox="0 0 300 58" className="season-lights">
      <path d="M6 10 Q80 34 150 22 T294 12" fill="none" stroke="#17324A" strokeWidth="2" />
      {xs.map((x, i) => {
        const st = stateOf(i, current, total)
        const y = wireY(x) + 6
        const fill = st === 'on' ? '#F2C14E' : st === 'cur' ? '#C8283F' : '#CFE0EC'
        return (
          <g key={i} className={`b ${st}`}>
            <rect x={x - 4} y={y} width="8" height="6" rx="1.5" fill="#17324A" />
            <path d={`M${x} ${y + 5} c-9 6 -9 22 0 26 c9 -4 9 -20 0 -26z`} fill={fill} stroke="#17324A" strokeWidth="1.6" />
            <text x={x} y={y + 25} textAnchor="middle" fontSize="11" fontWeight="900" fill={st === 'cur' ? '#FFFFFF' : '#17324A'}>
              {i + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function TetLanterns({ total, current }) {
  return (
    <div className="season-lans" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={stateOf(i, current, total)}>
          <i />
          <b>{i + 1}</b>
        </span>
      ))}
    </div>
  )
}

function RainbowSteps({ total, current }) {
  return (
    <div className="season-rsteps" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={stateOf(i, current, total)}
          style={{ '--sc': RAINBOW[i % RAINBOW.length], height: `${30 + Math.round((i * 36) / Math.max(1, total - 1))}px` }}
        >
          {i + 1}
        </span>
      ))}
    </div>
  )
}

export function SeasonStepProgress({ total = 4, current = 0 }) {
  const ctx = useContext(AppCtx)
  const theme = ctx?.S?.theme || 'bear'
  if (!isSeasonalTheme(theme)) return null
  const n = Math.max(1, Math.min(6, Number(total) || 4))
  const cur = Math.max(0, Number(current) || 0)
  const label = cur >= n ? `Xong cả ${n} bậc` : `Bậc ${cur + 1} trên ${n}`
  return (
    <div className={`season-steps season-steps-${theme}`} role="img" aria-label={label} data-testid="season-step-progress">
      {theme === 'noel' && <NoelLights total={n} current={cur} />}
      {theme === 'tet' && <TetLanterns total={n} current={cur} />}
      {theme === 'thieunhi' && <RainbowSteps total={n} current={cur} />}
    </div>
  )
}
