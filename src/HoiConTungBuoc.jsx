/**
 * HoiConTungBuoc.jsx — Gói 34: màn "Hỏi con từng bước" theo bản vẽ v2 (kem-con-hoc-man-hoi-con-tung-buoc-v2).
 *
 * 4 vùng cố định theo chiều dọc:
 *   A. Thanh trên (‹ · tên màn · Hỏi Gấu · Xem đề) + MỘT thanh bậc "Bậc x/n"
 *   B. Câu hỏi chính chữ to, "{Ho} đọc to câu này cho con nghe", nút Đọc to
 *   C. Bậc thang gợi ý: Gợi ý 1 → Gợi ý 2 (mở lần lượt ngay dưới câu hỏi) → Đáp án tham khảo (giữ 1,5 giây)
 *   D. Hai nút cố định ở đáy: "Con còn bí → Mở gợi ý", "Con làm được → Tiếp tục"
 *
 * Bỏ theo góp ý: "Vì sao hỏi?", mục tiêu sư phạm, ngăn "Dành cho mẹ", mic, nhãn "BẬC x" lặp, dải đề.
 * Màu chỉ đọc biến --c-* của bộ đang chọn (xem hoiCon.css).
 */
import { useContext, useEffect, useRef, useState } from 'react'
import { AppCtx } from './ctx'
import { PROBLEM } from './data'
import { recordLearningEvent } from './api'
import { emitMotion } from './MotionLayer'
import { speak } from './utils'
import { BuddyGreeter, buddyReact } from './themes/buddies/buddySvgs'
import './hoiCon.css'

const HOLD_MS = 1500

/** Tô nổi các con số trong đề (bảng Xem đề) */
function withNumbers(text = '') {
  return String(text)
    .split(/(\d+(?:[.,]\d+)?)/)
    .map((part, i) => (/^\d/.test(part) ? <span key={i} className="hc-num">{part}</span> : part))
}

export function HoiConTungBuoc() {
  const { S, problem, patch, go, toast, boom, Ho = 'Bố mẹ' } = useContext(AppCtx)
  const { step = 0, stuck = 0 } = S.flow || {}
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0] || { name: 'Con' }
  const steps = problem?.steps?.length ? problem.steps : PROBLEM.steps
  const total = steps.length
  const curStep = steps[step] || {}
  const question = curStep.q || curStep.question || ''
  const hint1 = curStep.hint || curStep.hintLevel1 || ''
  const hint2 = curStep.hint2 || curStep.hintLevel2 || ''
  const answer = curStep.answerForParent || curStep.answer || curStep.dap_an_cho_me || ''
  const hintsOpen = Math.min(stuck || 0, 2)

  const [stepSeconds, setStepSeconds] = useState(0)
  const [holding, setHolding] = useState(false)
  const [showProblem, setShowProblem] = useState(false)
  const holdTimer = useRef(null)
  const revealedThisStep = useRef(false)

  // Bài "Lần B" (phần bổ trợ) tải xong sau thì gộp vào bài đang học
  useEffect(() => {
    const handleExtra = (e) => {
      const loaded = e.detail
      if (loaded && loaded.id === problem?.id) patch({ problem: { ...problem, ...loaded } })
    }
    window.addEventListener('kem_lesson_extra_loaded', handleExtra)
    return () => window.removeEventListener('kem_lesson_extra_loaded', handleExtra)
  }, [problem?.id])

  useEffect(() => {
    if (!S.flow?.startedAt) patch((prev) => ({ ...prev, flow: { ...prev.flow, startedAt: Date.now() } }))
  }, [])

  useEffect(() => {
    setStepSeconds(0)
    setHolding(false)
    revealedThisStep.current = false
  }, [step])

  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') setStepSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!showProblem) return
    const onKey = (e) => { if (e.key === 'Escape') setShowProblem(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showProblem])

  useEffect(() => () => clearTimeout(holdTimer.current), [])

  const learning = (extra) =>
    recordLearningEvent({
      child_id: child?.id,
      session_id: S.flow?.sessionId || `sess_${Date.now()}`,
      subject: problem?.subject || 'Toán',
      problem_type: problem?.type || '',
      step_no: step + 1,
      skill: curStep?.ky_nang || 'tinh_toan',
      micro_steps: 0,
      ...extra,
    }).catch(() => {})

  // Prompt 28 A1/A2: ghi lại điều THẬT SỰ xảy ra ở từng bậc để màn Xong bài chỉ khen/góp ý đúng sự thật
  const buildStepLog = () => {
    const revealed = Array.isArray(S.flow?.revealedSteps) && S.flow.revealedSteps.includes(step)
    const entry = {
      stepNo: step + 1,
      skill: curStep.ky_nang || curStep.skill || null,
      stuckCount: stuck || 0,
      usedMicroStep: false,
      revealedAnswer: revealed,
      guidedByParent: false,
      selfSolved: !revealed,
      sec: stepSeconds,
      endedAt: Date.now(),
    }
    const prevLog = Array.isArray(S.flow?.stepLog) ? S.flow.stepLog.filter((e) => e.stepNo !== entry.stepNo) : []
    return [...prevLog, entry]
  }

  /* Con làm được → Tiếp tục */
  const stepOk = () => {
    const ns = step + 1
    learning({ result: stuck === 0 ? 'tu_lam' : stuck === 1 ? 'can_goi_y' : 'me_dan', hints_used: stuck })
    emitMotion('step_done', { step: ns, total })
    patch({ flow: { ...S.flow, step: ns, stuck: 0, stepLog: buildStepLog() } })
    if (ns >= total) {
      boom()
      toast(`🎉 ${child.name} tự giải xong cả ${total} bậc!`)
    }
    // Chỉ linh vật reo khi xong cả bài; giữa các bậc để thanh bậc và câu hỏi mới tự nói (không chồng bong bóng lên nút)
    if (ns >= total) buddyReact('cheer', curStep.loi_khen || curStep.praise || `${child.name} giỏi quá!`, 2500)
  }

  /* Mở gợi ý n (1 hoặc 2); mở gợi ý 2 thì gợi ý 1 cũng mở */
  const openHint = (n) => {
    if (n <= hintsOpen) return
    const ns = Math.max(hintsOpen + 1, n)
    emitMotion('stuck', { stuck: ns, question, hint: ns >= 2 ? hint2 : hint1 })
    patch({ flow: { ...S.flow, stuck: ns } })
    if (ns === 1) toast('Con nghĩ lâu vậy là đang cố đó')
  }

  /* Con còn bí → Mở gợi ý (gợi ý 1, rồi gợi ý 2) */
  const stepStuck = () => {
    if (hintsOpen < 2) {
      openHint(hintsOpen + 1)
    } else {
      toast(`Hết gợi ý. ${Ho} có thể giữ Đáp án tham khảo 1,5 giây`)
    }
  }

  /* Đáp án tham khảo: giữ 1,5 giây mới thấy; giữ đủ thì ghi nhận đã mở đáp án (một lần mỗi bậc) */
  const startHold = (e) => {
    e?.preventDefault?.()
    setHolding(true)
    clearTimeout(holdTimer.current)
    holdTimer.current = setTimeout(() => {
      if (revealedThisStep.current) return
      revealedThisStep.current = true
      learning({ result: 'me_dan', hints_used: Math.max(stuck, 2) })
      const revealTimes = Array.isArray(S.flow?.stepRevealTimes) ? [...S.flow.stepRevealTimes] : []
      revealTimes[step] = stepSeconds
      const revealedSteps = Array.from(new Set([...(S.flow?.revealedSteps || []), step]))
      patch({ flow: { ...S.flow, unlocked: true, stepRevealTimes: revealTimes, revealedSteps } })
    }, HOLD_MS)
  }
  const stopHold = () => {
    setHolding(false)
    clearTimeout(holdTimer.current)
  }

  const finished = step >= total
  const shown = Math.min(step + 1, total)

  return (
    <div className="hc-wrap" data-testid="hoi-con-v2">
      {/* A. THANH TRÊN + MỘT THANH BẬC */}
      <header>
        <div className="hc-nav">
          <button type="button" className="btn-km-circle" aria-label="Quay lại" onClick={() => go('explain')}>‹</button>
          <h1>Hỏi con từng bước</h1>
          <button
            type="button"
            className="hc-link"
            data-testid="hc-ask-bear"
            onClick={() => { patch({ parentNoteChat: '' }); go('ask') }}
          >
            Hỏi Gấu
          </button>
          <button type="button" className="hc-link" data-testid="hc-view-problem" onClick={() => setShowProblem(true)}>Xem đề</button>
        </div>
        <div className="hc-steps">
          <div className="hc-bar" role="img" aria-label={`Bậc ${shown} trên ${total}`} style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
            {steps.map((_, i) => <i key={i} className={i < step ? 'done' : i === step ? 'now' : ''} />)}
          </div>
          <b data-testid="hc-step-label">{finished ? 'Xong' : `Bậc ${shown}/${total}`}</b>
        </div>
      </header>

      {/* B. CÂU HỎI CHÍNH */}
      <main className="hc-mid" aria-live="polite">
        {finished ? (
          <section className="hc-hero hc-done">
            <div className="hc-buddy"><BuddyGreeter size={56} /></div>
            <p className="hc-q">{child.name} đã tự tìm ra đáp án rồi!</p>
            <p className="hc-note">{Ho} khen con một câu nhé.</p>
          </section>
        ) : (
          <section className="hc-hero">
            <div className="hc-buddy"><BuddyGreeter size={56} /></div>
            <p className="hc-note">{Ho} đọc to câu này cho con nghe</p>
            <p className="hc-q" data-testid="hc-question">{question}</p>
            <button type="button" className="hc-read" onClick={() => speak(question)}>
              <span aria-hidden="true">🔊</span> Đọc to
            </button>
          </section>
        )}
      </main>

      {/* C. BẬC THANG GỢI Ý */}
      {!finished && (
        <section className="hc-ladder" aria-label="Bậc thang gợi ý">
          <button
            type="button"
            className={`hc-hint ${hintsOpen >= 1 ? 'open' : 'locked'}`}
            data-level="1"
            data-testid="hc-hint-1"
            aria-expanded={hintsOpen >= 1}
            onClick={() => openHint(1)}
          >
            <span className="hc-ico">1</span>
            <span>
              <div className="hc-label">Gợi ý 1 {hintsOpen < 1 && <span className="hc-sub">· chạm để mở</span>}</div>
              {hintsOpen >= 1 && <div className="hc-content">{hint1 || 'Con đọc lại đề, tìm những con số và nói xem mỗi số là gì.'}</div>}
            </span>
          </button>
          <button
            type="button"
            className={`hc-hint ${hintsOpen >= 2 ? 'open' : 'locked'}`}
            data-level="2"
            data-testid="hc-hint-2"
            aria-expanded={hintsOpen >= 2}
            onClick={() => openHint(2)}
          >
            <span className="hc-ico">2</span>
            <span>
              <div className="hc-label">Gợi ý 2 {hintsOpen < 2 && <span className="hc-sub">· chạm để mở</span>}</div>
              {hintsOpen >= 2 && <div className="hc-content">{hint2 || hint1 || 'Con vẽ ra giấy để dễ nhìn hơn nhé.'}</div>}
            </span>
          </button>
          <button
            type="button"
            className={`hc-hint ${holding ? 'holding' : ''}`}
            data-level="3"
            data-testid="hc-answer"
            aria-label="Đáp án tham khảo: giữ 1,5 giây để xem"
            onPointerDown={startHold}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') startHold(e) }}
            onKeyUp={stopHold}
            onContextMenu={(e) => e.preventDefault()}
          >
            <span className="hc-ico" aria-hidden="true">🔒</span>
            <span>
              <div className="hc-label">Đáp án tham khảo <span className="hc-sub">· giữ 1,5 giây để xem</span></div>
              <div className="hc-content hc-secret">{answer || 'Gấu chưa có đáp án cho bậc này.'}</div>
            </span>
          </button>
        </section>
      )}

      {/* D. HAI NÚT CỐ ĐỊNH Ở ĐÁY */}
      <footer className="hc-actions">
        {finished ? (
          <button type="button" className="btn-km btn-km-ok hc-act" data-testid="btn-finish-lesson" onClick={() => go('done')}>
            <span>Hoàn thành bài</span>
            <small>→ Tặng huy hiệu</small>
          </button>
        ) : (
          <>
            <button type="button" className="btn-km hc-act hc-act-stuck" data-testid="hc-stuck" onClick={stepStuck}>
              <span>Con còn bí</span>
              <small>→ Mở gợi ý</small>
            </button>
            <button type="button" className="btn-km btn-km-ok hc-act hc-act-main" data-testid="hc-done" onClick={stepOk}>
              <span>Con làm được</span>
              <small>→ Tiếp tục</small>
            </button>
          </>
        )}
      </footer>

      {/* XEM ĐỀ */}
      {showProblem && (
        <div className="hc-sheet-bg" onClick={() => setShowProblem(false)}>
          <div className="hc-sheet" role="dialog" aria-label="Đề bài" onClick={(e) => e.stopPropagation()}>
            <h2>Đề bài</h2>
            <p>{withNumbers(problem?.ocr || S.flow?.ocr || '')}</p>
            <button type="button" className="btn-km btn-km-m btn-km-primary" onClick={() => setShowProblem(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  )
}
