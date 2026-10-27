/* ============================================================
   ĐỢT 16 · KHE GIAO DIỆN MÀN CHÍNH CỦA 3 BỘ THEO MÙA
   Theo dõi học đều 7 ngày:
     Đêm Tuyết: lịch đếm ngày 7 ô cửa (đã học: ô đỏ có ngôi sao; hôm nay viền nhấp nháy)
     Xuân Sum Vầy: cành mai 7 nụ (đã học: bông mai nở; hôm nay nụ vàng viền đỏ nhấp nháy)
     Cầu Vồng 1/6: chùm 7 quả bóng (đã học: bóng căng màu; chưa học: bóng xẹp nét đứt)
   Nút bắt đầu: nút lớn của bộ + 3 cách nhập đề (Chụp, Gõ, Đọc)
   ============================================================ */
import React from 'react'
import '../../seasons/seasons.css'

function dayState(d) {
  if (d.status === 'done' || d.status === 'todayDone') return 'on'
  if (d.status === 'today' || d.isToday) return 'now'
  return 'off'
}

function TrackerShell({ className, title, chip, tracker, onOpenReport, children, note }) {
  const { weekCount, weekGoal } = tracker
  return (
    <div
      className={`card season-tracker ${className}`}
      onClick={onOpenReport}
      role={onOpenReport ? 'button' : undefined}
      tabIndex={onOpenReport ? 0 : undefined}
      aria-label={`${title}: tuần này đã học ${weekCount} trên ${weekGoal} tối. Bấm để xem báo cáo`}
      onKeyDown={(e) => {
        if (onOpenReport && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onOpenReport()
        }
      }}
    >
      <div className="season-row-h">
        <b>{title}</b>
        <span className="season-chip">{chip}</span>
      </div>
      {children}
      <p className="sub">{note}</p>
    </div>
  )
}

export function NoelStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { week, weekCount, weekGoal, streak } = tracker
  return (
    <TrackerShell
      className="noel"
      title="Lịch đếm ngày tuần này"
      chip={streak >= 2 ? `🔥 ${streak} tối liền` : `${weekCount}/${weekGoal} tối`}
      tracker={tracker}
      onOpenReport={onOpenReport}
      note={`Mỗi tối học là mở một ô cửa. Mở đủ ${weekGoal} ô là được treo ngôi sao lên đỉnh cây.`}
    >
      <div className="season-advent">
        {week.map((d) => {
          const st = dayState(d)
          return (
            <span key={d.dateKey} className={st}>
              <i>{st === 'on' ? '★' : ''}</i>
              <b>{d.label}</b>
            </span>
          )
        })}
      </div>
    </TrackerShell>
  )
}

const BRANCH_X = [28, 62, 96, 130, 164, 198, 232]
const BRANCH_Y = [46, 30, 44, 26, 40, 24, 36]

function Bloom() {
  return (
    <>
      {[[0, -6], [5.8, -2], [3.6, 5], [-3.6, 5], [-5.8, -2]].map(([cx, cy], k) => (
        <circle key={k} cx={cx} cy={cy} r="5.2" fill="#F6C344" stroke="#4A1A0C" strokeWidth="1.2" />
      ))}
      <circle r="2.8" fill="#E9A800" stroke="#4A1A0C" strokeWidth="1" />
    </>
  )
}

export function TetStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { week, weekCount, weekGoal } = tracker
  return (
    <TrackerShell
      className="tet"
      title="Cành mai tuần này"
      chip={`🌼 ${weekCount} bông nở`}
      tracker={tracker}
      onOpenReport={onOpenReport}
      note={`Mỗi tối học là một bông mai nở. Nở ${weekGoal} bông là cành mai đầy hoa.`}
    >
      <svg viewBox="0 0 260 74" className="season-branch" aria-hidden="true">
        <path d="M4 60 C40 50 50 34 80 36 S130 30 160 32 S220 26 256 28" fill="none" stroke="#7A4A33" strokeWidth="4" strokeLinecap="round" />
        {week.slice(0, 7).map((d, i) => {
          const st = dayState(d)
          return (
            <g key={d.dateKey}>
              <g transform={`translate(${BRANCH_X[i]} ${BRANCH_Y[i]})`}>
                {st === 'on' ? (
                  <Bloom />
                ) : st === 'now' ? (
                  <g className="bud-now">
                    <ellipse rx="5" ry="7" fill="#F6C344" stroke="#C8102E" strokeWidth="2" />
                  </g>
                ) : (
                  <ellipse rx="3.6" ry="5" fill="#7FB069" stroke="#4A1A0C" strokeWidth="1" />
                )}
              </g>
              <text x={BRANCH_X[i]} y="71" textAnchor="middle" fontSize="10" fontWeight="800" fill="#7A4A33">
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </TrackerShell>
  )
}

const BALL_COLORS = ['#FF5A5F', '#FF9F1C', '#FFC93C', '#2EC4B6', '#3A86FF', '#8338EC', '#FF5A5F']

export function ThieunhiStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { week, weekCount, weekGoal } = tracker
  return (
    <TrackerShell
      className="thieunhi"
      title="Chùm bóng tuần này"
      chip={`🎈 ${weekCount} quả`}
      tracker={tracker}
      onOpenReport={onOpenReport}
      note={`Mỗi tối học là bơm thêm một quả bóng. Đủ ${weekGoal} quả là chùm bóng bay lên!`}
    >
      <div className="season-balls">
        {week.map((d, i) => (
          <span key={d.dateKey} className={dayState(d)} style={{ '--bc': BALL_COLORS[i % 7] }}>
            <i />
            <b>{d.label}</b>
          </span>
        ))}
      </div>
    </TrackerShell>
  )
}

function SeasonStart({ theme, emoji, onStart }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Nút lớn 56px chữ thường chuẩn khuôn T3 (Prompt 23H A13) */}
      <button
        type="button"
        data-testid="start-photo"
        className="btn solid btn-km btn-km-l btn-km-primary"
        style={{
          minHeight: 56,
          height: 56,
          padding: "0 20px",
          fontSize: 16.5,
          fontWeight: 800,
          textTransform: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          width: "100%",
          boxSizing: "border-box",
        }}
        onClick={() => onStart?.('photo')}
      >
        <span style={{ fontSize: 22 }}>{emoji || "📷"}</span>
        <span>Bắt đầu bài tối nay</span>
      </button>

      {/* 2 nút phụ 44px gõ đề và đọc đề */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button
          type="button"
          data-testid="start-type"
          className="btn ghost btn-km btn-km-m btn-km-secondary"
          style={{
            minHeight: 44,
            height: 44,
            padding: "0 12px",
            fontSize: 13.5,
            fontWeight: 700,
            textTransform: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
          onClick={() => onStart?.('type')}
        >
          <span>⌨️</span>
          <span>Gõ đề bài</span>
        </button>
        <button
          type="button"
          data-testid="start-voice"
          className="btn ghost btn-km btn-km-m btn-km-secondary"
          style={{
            minHeight: 44,
            height: 44,
            padding: "0 12px",
            fontSize: 13.5,
            fontWeight: 700,
            textTransform: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
          onClick={() => onStart?.('voice')}
        >
          <span>🎙️</span>
          <span>{theme === "noel" ? "Đọc đề cho Người Tuyết" : theme === "tet" ? "Đọc đề cho Bé Lân" : theme === "thieunhi" ? "Đọc đề cho Bé Diều" : "Đọc đề"}</span>
        </button>
      </div>
    </div>
  )
}

export function NoelStartAction({ onStart }) {
  return <SeasonStart theme="noel" emoji="🎁" onStart={onStart} />
}
export function TetStartAction({ onStart }) {
  return <SeasonStart theme="tet" emoji="🧧" onStart={onStart} />
}
export function ThieunhiStartAction({ onStart }) {
  return <SeasonStart theme="thieunhi" emoji="🪁" onStart={onStart} />
}
