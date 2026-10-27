/* ============================================================
   KÈM CON HỌC — DEFAULT THEME SLOTS
   Prompt 07 Phần B (Bộ khe mặc định cho 3 màn chính)
   ============================================================ */
import React, { useState, useRef, useEffect } from 'react'
import { InputModeIcon } from '../themeIcons'

// 1. HomeHero
export function DefaultHomeHero({ child, parentName, dateLabel, grade }) {
  return (
    <div className="home-hero-default" style={{ padding: '8px 4px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)', textTransform: 'uppercase', letterSpacing: 1 }}>
            {dateLabel || 'Tối nay'}
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '2px 0 0', color: 'var(--c-text)' }}>
            Chào {parentName || 'mẹ'}! ✨
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--c-text-2)' }}>
            Đồng hành cùng <b>{child?.name || 'con'}</b> ({grade || child?.grade || 'Lớp 3'})
          </p>
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-btn, 50%)',
            background: 'var(--c-surface-2)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 26,
            border: 'var(--border-w) solid var(--c-line)',
          }}
        >
          {child?.emoji || '🦄'}
        </div>
      </div>
    </div>
  )
}

// 2. StudyTracker (Theo dõi học đều 7 ngày)
export function DefaultStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { week, weekCount, weekGoal, streak, encouragement } = tracker

  return (
    <div
      className="card study-tracker-card"
      style={{
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        cursor: onOpenReport ? 'pointer' : 'default',
      }}
      onClick={onOpenReport}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 15 }}>📅</span>
          <b style={{ fontSize: 14, color: 'var(--c-text)' }}>Học đều mỗi tối</b>
          {streak >= 2 && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: 'var(--c-accent-ink, var(--c-accent))',
                background: 'var(--c-surface-2)',
                padding: '2px 8px',
                borderRadius: 999,
              }}
            >
              🔥 {streak} tối liền
            </span>
          )}
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--c-accent-ink, var(--c-text))' }}>
          {weekCount}/{weekGoal} tối
        </span>
      </div>

      {/* 7 ngày Thứ Hai -> Chủ Nhật */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
        {week.map((d) => {
          const isDone = d.status === 'done' || d.status === 'todayDone'
          const isToday = d.isToday
          return (
            <div key={d.dateKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 13,
                  fontWeight: 800,
                  background: isDone
                    ? 'var(--c-good)'
                    : isToday
                    ? 'var(--c-surface-2)'
                    : 'var(--c-bg)',
                  color: isDone
                    ? 'var(--c-on-good)'
                    : isToday
                    ? 'var(--c-accent-ink, var(--c-text))'
                    : 'var(--c-text-2)',
                  border: isToday
                    ? '2px solid var(--c-accent)'
                    : '1px solid var(--c-line)',
                  boxShadow: isDone ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {isDone ? '✓' : d.dayNum}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: isToday ? 800 : 600,
                  color: isToday ? 'var(--c-accent-ink, var(--c-text))' : 'var(--c-text-2)',
                }}
              >
                {d.label}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 12, color: 'var(--c-text-2)', textAlign: 'center', borderTop: '1px dashed var(--c-line)', paddingTop: 6 }}>
        {encouragement}
      </div>
    </div>
  )
}

// 3. StartAction (3 cách nhập đề)
export function DefaultStartAction({ modes = ['photo', 'type', 'voice'], lastMode = 'photo', onStart }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Nút lớn bắt đầu bài tối nay */}
      <button
        data-testid="start-photo"
        className="btn solid"
        style={{
          padding: '16px 20px',
          fontSize: 17,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
        onClick={() => onStart?.('photo')}
      >
        <InputModeIcon mode="photo" size={24} />
        <span>📷 Chụp bài tập tối nay</span>
      </button>

      {/* 2 nút phụ gõ đề và đọc đề */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          data-testid="start-type"
          className="btn ghost"
          style={{ padding: '12px 14px', fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onClick={() => onStart?.('type')}
        >
          <InputModeIcon mode="type" size={18} />
          <span>⌨️ Gõ đề bài</span>
        </button>
        <button
          data-testid="start-voice"
          className="btn ghost"
          style={{ padding: '12px 14px', fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onClick={() => onStart?.('voice')}
        >
          <InputModeIcon mode="voice" size={18} />
          <span>🎙️ Đọc đề cho AI</span>
        </button>
      </div>
    </div>
  )
}

// 4. HomeExtras
export function DefaultHomeExtras({ lastSession, onOpen }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
      {lastSession && (
        <div
          className="card"
          style={{
            padding: '10px 14px',
            fontSize: 12.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--c-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📖</span>
            <span style={{ color: 'var(--c-text)' }}>
              Tối qua: <b>{lastSession.problemType || 'Toán'}</b> ({lastSession.minutes || 15} phút)
            </span>
          </div>
          <span style={{ color: 'var(--c-good-fg)', fontWeight: 800 }}>Đã xong ✓</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          data-testid="home-calm"
          className="btn ghost"
          style={{ flex: 1, padding: '10px 12px', fontSize: 12.5, fontWeight: 700 }}
          onClick={() => onOpen?.('calm')}
        >
          🫧 Góc hạ hoả
        </button>
        <button
          data-testid="home-game"
          className="btn ghost"
          style={{ flex: 1, padding: '10px 12px', fontSize: 12.5, fontWeight: 700 }}
          onClick={() => onOpen?.('game')}
        >
          🎮 Trò chơi thư giãn
        </button>
      </div>
    </div>
  )
}

// 5. StepProgress
export function DefaultStepProgress({ total = 4, current = 0, doneSteps = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-accent-ink, var(--c-text))' }}>
          TIẾN ĐỘ BẬC
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--c-text)' }}>
          Bậc {Math.min(current + 1, total)} / {total}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${total}, 1fr)`, gap: 6 }}>
        {Array.from({ length: total }).map((_, idx) => {
          const isDone = idx < current || doneSteps.includes(idx)
          const isCurrent = idx === current
          return (
            <div
              key={idx}
              style={{
                height: 6,
                borderRadius: 4,
                background: isDone
                  ? 'var(--c-good)'
                  : isCurrent
                  ? 'var(--c-accent)'
                  : 'var(--c-line)',
                transition: 'all 0.3s ease',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

// 6. ReadCard
export function DefaultReadCard({ question, stepIndex = 0, childName = 'con', onSpeak }) {
  return (
    <div
      className="card"
      style={{
        padding: '16px 18px',
        background: 'var(--c-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1,
            color: 'var(--c-accent-ink, var(--c-text))',
            background: 'var(--c-surface-2)',
            padding: '3px 8px',
            borderRadius: 999,
          }}
        >
          BẬC {stepIndex + 1} · MẸ HỎI {childName.toUpperCase()}
        </span>
        <button
          data-testid="btn-speak"
          className="round-btn"
          style={{ width: 34, height: 34, fontSize: 14 }}
          onClick={onSpeak}
          title="Đọc to câu hỏi"
        >
          🔊
        </button>
      </div>
      <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-text)', lineHeight: 1.4, margin: 0 }}>
        {question || 'Con quan sát kỹ đề bài xem có những số nào nhé?'}
      </p>
    </div>
  )
}

// 7. HintList
export function DefaultHintList({ hints = [], openedLevels = [], onOpenHint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-text-2)', letterSpacing: 0.5 }}>
        MÁCH NƯỚC CHO MẸ (NẾU CON BÍ)
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button
          data-testid="hint-1"
          className={`btn ${openedLevels.includes(1) ? 'mint' : 'ghost'}`}
          style={{ padding: '10px 12px', fontSize: 12.5, fontWeight: 700 }}
          onClick={() => onOpenHint?.(1)}
        >
          {openedLevels.includes(1) ? '✓ Mức 1: Đồ vật thật' : '💡 Mở gợi ý 1'}
        </button>
        <button
          data-testid="hint-2"
          className={`btn ${openedLevels.includes(2) ? 'mint' : 'ghost'}`}
          style={{ padding: '10px 12px', fontSize: 12.5, fontWeight: 700 }}
          onClick={() => onOpenHint?.(2)}
        >
          {openedLevels.includes(2) ? '✓ Mức 2: Hình vẽ sơ đồ' : '📐 Mở gợi ý 2'}
        </button>
      </div>

      {/* Hiển thị chi tiết gợi ý đã mở */}
      {openedLevels.map((lvl) => {
        const h = hints.find((x) => x.level === lvl) || { text: lvl === 1 ? 'Lấy đồ chơi/bút chì trong hộp ra làm mẫu cho con đếm trực tiếp.' : 'Vẽ sơ đồ đoạn thẳng ra giấy nháp để con nhìn rõ tương quan.' }
        return (
          <div
            key={lvl}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md, 14px)',
              background: 'var(--c-surface-2)',
              fontSize: 13,
              color: 'var(--c-text)',
              lineHeight: 1.45,
              border: '1px solid var(--c-line)',
            }}
          >
            <b>{lvl === 1 ? '🧸 Gợi ý đồ vật:' : '✏️ Gợi ý hình vẽ:'}</b> {h.text}
          </div>
        )
      })}
    </div>
  )
}

// 8. AnswerReveal (Giữ 1.5 giây để xem đáp án)
export function DefaultAnswerReveal({ answerForParent, onRevealed }) {
  const [unlocked, setUnlocked] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef(null)

  const startHold = () => {
    if (unlocked) return
    const startTime = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const p = Math.min(100, (elapsed / 1500) * 100)
      setProgress(p)
      if (p >= 100) {
        clearInterval(timerRef.current)
        setUnlocked(true)
        onRevealed?.()
      }
    }, 30)
  }

  const endHold = () => {
    if (unlocked) return
    clearInterval(timerRef.current)
    setProgress(0)
  }

  return (
    <div
      data-testid="answer-reveal"
      className="card"
      style={{
        padding: '12px 14px',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        border: unlocked ? '1.5px solid var(--c-good)' : '1.5px dashed var(--c-line)',
        background: unlocked ? 'var(--c-good-bg)' : 'var(--c-surface)',
        cursor: unlocked ? 'default' : 'pointer',
      }}
      onMouseDown={startHold}
      onMouseUp={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      onKeyDown={(e) => {
        if (e.code === 'Space') startHold()
      }}
      onKeyUp={endHold}
      tabIndex={0}
      role="button"
      aria-label="Xem đáp án cho mẹ (giữ 1.5 giây)"
    >
      {/* Vạch tiến độ lấp đầy */}
      {!unlocked && progress > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progress}%`,
            background: 'var(--c-accent-2)',
            opacity: 0.35,
            transition: 'width 0.05s linear',
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {unlocked ? (
          <div>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-good-fg)' }}>
              🔒 ĐÁP ÁN ĐỐI CHIẾU CHO MẸ:
            </span>
            <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 700, color: 'var(--c-text)' }}>
              {answerForParent || 'Đáp án đang cập nhật'}
            </p>
          </div>
        ) : (
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text-2)' }}>
            {progress > 0 ? `Đang mở… ${Math.round(progress)}%` : '🔒 Giữ 1.5 giây để xem đáp án (cho mẹ)'}
          </span>
        )}
      </div>
    </div>
  )
}

// 9. ScaffoldActions
export function DefaultScaffoldActions({ onStuck, onAnswered }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <button
        data-testid="btn-stuck"
        className="btn ghost"
        style={{ padding: '14px', fontSize: 15, fontWeight: 800 }}
        onClick={onStuck}
      >
        🤔 Con chưa nghĩ ra
      </button>
      <button
        data-testid="btn-answered"
        className="btn mint"
        style={{ padding: '14px', fontSize: 15, fontWeight: 800 }}
        onClick={onAnswered}
      >
        🎉 Con làm được rồi!
      </button>
    </div>
  )
}

// 10. DoneCelebration
export function DefaultDoneCelebration({ problemNo = 1, selfSteps = 4, totalSteps = 4, minutes = 15, newSticker, tracker }) {
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '10px 0' }}>
      <div style={{ fontSize: 64, animation: 'bounce 1.5s infinite' }}>
        {newSticker?.e || '🌟'}
      </div>
      <div>
        <h2 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: 'var(--c-text)' }}>
          Hoàn thành bài tập tối nay!
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--c-text-2)' }}>
          Bé đã tự vượt qua {selfSteps}/{totalSteps} bậc gợi ý trong {minutes} phút
        </p>
      </div>

      {newSticker && (
        <div
          className="card"
          style={{
            padding: '10px 16px',
            background: 'var(--c-surface-2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 20 }}>{newSticker.e}</span>
          <b style={{ fontSize: 13.5, color: 'var(--c-text)' }}>Tặng bé: {newSticker.n}</b>
        </div>
      )}
    </div>
  )
}

// 11. TeachBackPicker (Con dạy lại mẹ)
export function DefaultTeachBackPicker({ value = 'self', onChange }) {
  const options = [
    { id: 'self', label: 'Tự giảng lại trơn tru', emoji: '🌟' },
    { id: 'hint', label: 'Cần mẹ nhắc nhẹ 1 bước', emoji: '💡' },
    { id: 'guided', label: 'Mẹ cần hướng dẫn lại', emoji: '🤝' },
  ]

  return (
    <div className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-text-2)', letterSpacing: 0.5 }}>
        CON DẠY LẠI MẸ (ĐO MỨC HIỂU SÂU)
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            data-testid={`teachback-${opt.id}`}
            type="button"
            className={`btn ${value === opt.id ? 'mint' : 'ghost'}`}
            style={{
              padding: '10px 6px',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
            onClick={() => onChange?.(opt.id)}
          >
            <span style={{ fontSize: 20 }}>{opt.emoji}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// 12. DoneNext
export function DefaultDoneNext({ siblingProblem, game, onOpen, onFinish }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
      <button
        data-testid="btn-sibling"
        className="btn coral"
        style={{ padding: '14px', fontSize: 15, fontWeight: 800 }}
        onClick={() => onOpen?.('sibling')}
      >
        🔁 Làm thêm một bài tương tự (đổi số)
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          data-testid="btn-game"
          className="btn ghost"
          style={{ padding: '12px', fontSize: 13.5, fontWeight: 700 }}
          onClick={() => onOpen?.('game')}
        >
          🎮 Thưởng trò chơi
        </button>
        <button
          data-testid="btn-finish"
          className="btn solid"
          style={{ padding: '12px', fontSize: 13.5, fontWeight: 800 }}
          onClick={onFinish}
        >
          🌙 Xong tối nay
        </button>
      </div>
    </div>
  )
}

// 13. CheckWorkEntry (Khe thẻ Chấm vở con đã làm - Prompt 14 Phần A)
export function DefaultCheckWorkEntry({ onStart, childName }) {
  return (
    <div
      className="card-km card-km-action"
      data-testid="check-work-entry"
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 900,
            letterSpacing: '.04em',
            padding: '2px 9px',
            borderRadius: 999,
            background: 'var(--c-accent, #F6A623)',
            color: 'var(--c-on-accent, #fff)',
          }}
        >
          📝 AI Chấm vở
        </span>
        <span style={{ fontSize: 18 }}>✨</span>
      </div>
      <div>
        <h3 style={{ fontSize: 15.5, fontWeight: 800, margin: '2px 0 4px', color: 'var(--c-text)' }}>
          Chấm vở {childName || 'con'} đã làm
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--c-sub, var(--c-text-2))', lineHeight: 1.4 }}>
          Chụp bài làm xong. AI tìm đúng bước sai đầu tiên và đưa mẹ câu hỏi để con <b>tự sửa</b>, không chữa hộ.
        </p>
      </div>
      <button
        type="button"
        data-testid="btn-start-check-work"
        className="btn-km btn-km-m btn-km-secondary"
        style={{
          alignSelf: 'flex-start',
          marginTop: 4,
          padding: '0 16px',
        }}
        onClick={onStart}
      >
        <span>Chấm vở ngay</span>
        <span>›</span>
      </button>
    </div>
  )
}
