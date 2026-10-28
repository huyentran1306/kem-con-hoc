/**
 * ⚔️ TRÒ CHƠI 1: ĐẤU TRÍ HAI ĐẦU BÀN (MÀN 2, 3 THEO BẢN VẼ)
 * Nửa trên xoay 180 độ về mẹ, nửa dưới con, 6s đếm ngược, ván 6 câu, khen cả hai.
 */
import React, { useState, useEffect, useRef } from 'react';
import { generateChildMathQuestion, generateParentMathQuestion } from './questionGenerator';
import { logGameAnswer, addPlaySeconds, getPlayTimeStatus } from './gameStorage';
import { soundTap, soundSuccess, soundWrong, soundPop } from '../audio';

export default function GameDuel({ child, stats, onBack, onOpenProfile, isTrial = false }) {
  const childName = child?.name || 'Bé Na';
  const childGrade = child?.grade || '3';

  // State trạng thái trò chơi
  const [round, setRound] = useState(1); // 1 đến 6
  const [isGameOver, setIsGameOver] = useState(false);
  const [childScore, setChildScore] = useState(0);
  const [parentScore, setParentScore] = useState(0);

  // Câu hỏi hiện tại
  const [childQ, setChildQ] = useState(() => generateChildMathQuestion(childGrade));
  const [parentQ, setParentQ] = useState(() => generateParentMathQuestion());

  // Trạng thái khóa nút của mỗi người trong câu
  const [childLocked, setChildLocked] = useState(false);
  const [parentLocked, setParentLocked] = useState(false);
  const [showAnswerNotice, setShowAnswerNotice] = useState(null); // 'child_win' | 'parent_win' | 'timeout'
  const [timeLeft, setTimeLeft] = useState(6.0); // 6 giây

  const roundStartTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  // Sinh câu hỏi cho vòng mới
  const nextRound = () => {
    // Cộng thời gian chơi
    addPlaySeconds(child?.id, 6);
    const status = getPlayTimeStatus(child?.id);
    if (status.isTimeLimitReached || round >= 6) {
      setIsGameOver(true);
      return;
    }

    setRound((r) => r + 1);
    setChildQ(generateChildMathQuestion(childGrade));
    setParentQ(generateParentMathQuestion());
    setChildLocked(false);
    setParentLocked(false);
    setShowAnswerNotice(null);
    setTimeLeft(6.0);
    roundStartTimeRef.current = Date.now();
  };

  // Đếm ngược 6 giây
  useEffect(() => {
    if (isGameOver || showAnswerNotice) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.2) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return Math.max(0, +(t - 0.2).toFixed(1));
      });
    }, 200);

    return () => clearInterval(timerRef.current);
  }, [round, isGameOver, showAnswerNotice]);

  const handleTimeout = () => {
    soundWrong();
    setShowAnswerNotice('timeout');
    setTimeout(() => {
      nextRound();
    }, 1200);
  };

  // Con bấm đáp án
  const handleChildAnswer = (opt) => {
    if (childLocked || showAnswerNotice || isGameOver) return;
    const ms = Date.now() - roundStartTimeRef.current;

    if (opt === childQ.correct) {
      soundSuccess();
      setChildScore((s) => s + 1);
      setShowAnswerNotice('child_win');
      logGameAnswer({
        game: 'dau_tri',
        skill: childQ.skill,
        who: 'child',
        correct: true,
        ms,
        childId: child?.id,
        isTrial,
      });
      setTimeout(() => nextRound(), 1000);
    } else {
      soundWrong();
      setChildLocked(true);
      logGameAnswer({
        game: 'dau_tri',
        skill: childQ.skill,
        who: 'child',
        correct: false,
        ms,
        childId: child?.id,
        isTrial,
      });
      if (parentLocked) {
        handleTimeout();
      }
    }
  };

  // Mẹ bấm đáp án
  const handleParentAnswer = (opt) => {
    if (parentLocked || showAnswerNotice || isGameOver) return;
    const ms = Date.now() - roundStartTimeRef.current;

    if (opt === parentQ.correct) {
      soundSuccess();
      setParentScore((s) => s + 1);
      setShowAnswerNotice('parent_win');
      logGameAnswer({
        game: 'dau_tri',
        skill: parentQ.skill,
        who: 'parent',
        correct: true,
        ms,
        childId: child?.id,
        isTrial,
      });
      setTimeout(() => nextRound(), 1000);
    } else {
      soundWrong();
      setParentLocked(true);
      logGameAnswer({
        game: 'dau_tri',
        skill: parentQ.skill,
        who: 'parent',
        correct: false,
        ms,
        childId: child?.id,
        isTrial,
      });
      if (childLocked) {
        handleTimeout();
      }
    }
  };

  const timeStatus = getPlayTimeStatus(child?.id);

  // MÀN HÌNH HẾT VÁN
  if (isGameOver) {
    const isTied = childScore === parentScore;
    const headline = isTied ? `Hoà ${parentScore} : ${childScore}!` : `Tỉ số ${parentScore} : ${childScore}!`;

    return (
      <div
        className="card-km"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: '16px',
          background: 'var(--c-surface, #fff)',
          borderRadius: 24,
          minHeight: 520,
        }}
        data-testid="screen-duel-gameover"
      >
        {/* TopBar T4 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn-km-circle"
            style={{ width: 36, height: 36, fontSize: 16 }}
            onClick={onBack}
          >
            ‹
          </button>
          <div style={{ textAlign: 'center' }}>
            <b style={{ fontSize: 16, color: 'var(--c-text)' }}>Hết ván đấu trí</b>
            <span style={{ fontSize: 12, color: 'var(--c-sub)', display: 'block' }}>Góc chơi chung</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-accent)', background: 'var(--c-surface-2)', padding: '3px 8px', borderRadius: 999 }}>
            ⏱ {timeStatus.remainingFormatted}
          </span>
        </div>

        {/* Hero khen cả hai */}
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <span style={{ fontSize: 50 }}>🐻 🎉 🤝</span>
          <h3 style={{ margin: '6px 0 2px', fontSize: 22, fontWeight: 800, color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
            {headline}
          </h3>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--c-sub)', lineHeight: 1.45 }}>
            Mẹ làm câu khó hơn, {childName} làm câu vừa sức. Cả hai mẹ con đều rất nhanh trí!
          </p>
        </div>

        {/* 2 Thẻ số liệu */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: 'var(--c-surface-2)', borderRadius: 16, padding: '12px 14px', textAlign: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-sub)' }}>👩 Mẹ</span>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--c-text)', margin: '2px 0' }}>{parentScore}</div>
            <span style={{ fontSize: 11.5, color: 'var(--c-sub)' }}>câu 2 phép tính</span>
          </div>
          <div style={{ background: 'var(--c-surface-2)', borderRadius: 16, padding: '12px 14px', textAlign: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-sub)' }}>🦄 {childName}</span>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--c-text)', margin: '2px 0' }}>{childScore}</div>
            <span style={{ fontSize: 11.5, color: 'var(--c-sub)' }}>bảng nhân & chia</span>
          </div>
        </div>

        {/* Thẻ Gấu thấy */}
        <div
          style={{
            background: 'color-mix(in srgb, var(--c-accent) 9%, var(--c-surface))',
            border: '1px solid var(--c-line)',
            borderRadius: 16,
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--c-accent)', letterSpacing: '0.05em', marginBottom: 2 }}>
            💡 GẤU THẤY
          </div>
          <p style={{ margin: '2px 0 4px', fontSize: 13.5, fontWeight: 700, color: 'var(--c-text)', lineHeight: 1.4 }}>
            {childName} phản xạ phép tính rất tự tin! Gấu đã ghi nhận vào sổ học của con.
          </p>
          <span style={{ fontSize: 11.5, color: 'var(--c-sub)' }}>Đã ghi vào Gấu nhớ ›</span>
        </div>

        {/* Nút hành động */}
        <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 10, paddingTop: 10 }}>
          <button
            type="button"
            className="btn-km btn-km-m btn-km-secondary"
            style={{ height: 48, fontSize: 14 }}
            onClick={onBack}
          >
            Về góc chơi
          </button>
          <button
            type="button"
            className="btn-km btn-km-m btn-km-primary"
            style={{ height: 48, fontSize: 14 }}
            onClick={() => {
              if (timeStatus.isTimeLimitReached) {
                onBack();
              } else {
                setRound(1);
                setChildScore(0);
                setParentScore(0);
                setIsGameOver(false);
                nextRound();
              }
            }}
          >
            {timeStatus.isTimeLimitReached ? 'Nghỉ thôi' : 'Chơi ván nữa'}
          </button>
        </div>
      </div>
    );
  }

  // MÀN HÌNH ĐANG CHƠI (CHIA ĐÔI MÀN HÌNH)
  const timerPct = Math.max(0, Math.min(100, (timeLeft / 6.0) * 100));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 640,
        background: 'var(--c-bg, #FFF8EC)',
        borderRadius: 24,
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'manipulation',
      }}
      data-testid="screen-duel-playing"
    >
      {/* NỬA TRÊN: PHÍA MẸ (XOAY 180 ĐỘ) */}
      <div
        style={{
          flex: 1,
          transform: 'rotate(180deg)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px',
          background: 'var(--c-surface, #fff)',
          borderBottom: '1px solid var(--c-line)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b style={{ fontSize: 14, color: 'var(--c-sub)' }}>👩 Mẹ</b>
          <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--c-text)' }}>{parentScore} điểm</span>
        </div>

        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
            {parentQ.equation}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {parentQ.options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              className="btn-km btn-km-l btn-km-secondary"
              style={{
                height: 54,
                fontSize: 20,
                fontWeight: 900,
                borderRadius: 14,
                opacity: parentLocked ? 0.4 : 1,
              }}
              onClick={() => handleParentAnswer(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* DẢI GIỮA: TRỌNG TÀI & THANH THỜI GIAN & TỈ SỐ */}
      <div
        style={{
          height: 56,
          background: 'var(--c-surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderTop: '1px solid var(--c-line)',
          borderBottom: '1px solid var(--c-line)',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--c-sub)' }}
          title="Về góc chơi"
        >
          ‹
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🐻</span>
          <b style={{ fontSize: 16, fontWeight: 900, color: 'var(--c-text)' }}>
            {parentScore} : {childScore}
          </b>
        </div>

        {/* Thanh đếm ngược 6s */}
        <div style={{ width: 90, height: 8, background: 'var(--c-line)', borderRadius: 999, overflow: 'hidden' }}>
          <div
            style={{
              width: `${timerPct}%`,
              height: '100%',
              background: timeLeft < 2.0 ? 'var(--c-danger, #D23A50)' : 'var(--c-accent, #F6A623)',
              transition: 'width 0.2s linear',
            }}
          />
        </div>
      </div>

      {/* NỬA DƯỚI: PHÍA CON */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px',
          background: 'var(--c-surface, #fff)',
        }}
      >
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
            {childQ.equation}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {childQ.options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              className="btn-km btn-km-l btn-km-primary"
              style={{
                height: 54,
                fontSize: 22,
                fontWeight: 900,
                borderRadius: 14,
                opacity: childLocked ? 0.4 : 1,
              }}
              onClick={() => handleChildAnswer(opt)}
            >
              {opt}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b style={{ fontSize: 14, color: 'var(--c-sub)' }}>🦄 {childName}</b>
          <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--c-text)' }}>{childScore} điểm</span>
        </div>
      </div>
    </div>
  );
}
