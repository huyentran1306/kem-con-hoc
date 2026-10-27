/**
 * 🌳 TRÒ CHƠI 2: LEO CÂY MẬT ONG (MÀN 4, 5 THEO BẢN VẼ)
 * Cùng một phe, cây 8 bậc, gạt thay lượt, đồng hồ 2 phút, tới đích tặng huy hiệu Đồng đội.
 */
import React, { useState, useEffect, useRef } from 'react';
import { generateReadingQuestion, generateChildMathQuestion, generateParentMathQuestion } from './questionGenerator';
import { logGameAnswer, addPlaySeconds, getPlayTimeStatus } from './gameStorage';
import { soundTap, soundSuccess, soundWrong, soundPop } from '../audio';
import { emitMotion } from '../MotionLayer';

export default function GameHoneyTree({ child, stats, onBack, onOpenProfile, isTrial = false }) {
  const childName = child?.name || 'Bé Na';
  const childGrade = child?.grade || '3';

  // Cây 8 bậc
  const TOTAL_LEVELS = 8;
  const [level, setLevel] = useState(1);
  const [turn, setTurn] = useState('child'); // 'child' | 'parent'
  const [childAnswersCount, setChildAnswersCount] = useState(0);
  const [parentAnswersCount, setParentAnswersCount] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Đếm ngược 2 phút (120 giây) cho ong về
  const [beeSeconds, setBeeSeconds] = useState(120);

  // Câu hỏi hiện tại
  const [currentQ, setCurrentQ] = useState(() => generateQuestionForTurn('child', childGrade));
  const [hasTriedOnce, setHasTriedOnce] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const qStartTimeRef = useRef(Date.now());
  const beeTimerRef = useRef(null);

  function generateQuestionForTurn(who, grade) {
    if (who === 'child') {
      return Math.random() < 0.5 ? generateReadingQuestion() : generateChildMathQuestion(grade);
    } else {
      return generateParentMathQuestion();
    }
  }

  // Timer ong về
  useEffect(() => {
    if (isWon || isGameOver) return;

    beeTimerRef.current = setInterval(() => {
      setBeeSeconds((s) => {
        if (s <= 1) {
          clearInterval(beeTimerRef.current);
          setIsGameOver(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(beeTimerRef.current);
  }, [isWon, isGameOver]);

  const handleAnswer = (opt) => {
    if (isWon || isGameOver) return;
    const ms = Date.now() - qStartTimeRef.current;
    addPlaySeconds(child?.id, 4);

    if (opt === currentQ.correct) {
      soundSuccess();
      if (turn === 'child') {
        setChildAnswersCount((c) => c + 1);
      } else {
        setParentAnswersCount((p) => p + 1);
      }

      logGameAnswer({
        game: 'leo_cay',
        skill: currentQ.skill,
        who: turn,
        correct: true,
        ms,
        childId: child?.id,
        isTrial,
      });

      // Kiểm tra tới đích
      if (level >= TOTAL_LEVELS) {
        setIsWon(true);
        emitMotion('badge_given');
        return;
      }

      setLevel((l) => l + 1);
      // Đổi lượt
      const nextTurn = turn === 'child' ? 'parent' : 'child';
      setTurn(nextTurn);
      setHasTriedOnce(false);
      setShowHint(false);
      setCurrentQ(generateQuestionForTurn(nextTurn, childGrade));
      qStartTimeRef.current = Date.now();
    } else {
      soundWrong();
      logGameAnswer({
        game: 'leo_cay',
        skill: currentQ.skill,
        who: turn,
        correct: false,
        ms,
        childId: child?.id,
        isTrial,
      });

      if (!hasTriedOnce) {
        // Cho thử lại 1 lần kèm gợi ý
        setHasTriedOnce(true);
        setShowHint(true);
      } else {
        // Sai lần 2: Đổi lượt, không lùi bậc
        const nextTurn = turn === 'child' ? 'parent' : 'child';
        setTurn(nextTurn);
        setHasTriedOnce(false);
        setShowHint(false);
        setCurrentQ(generateQuestionForTurn(nextTurn, childGrade));
        qStartTimeRef.current = Date.now();
      }
    }
  };

  const beeMins = Math.floor(beeSeconds / 60);
  const beeSecs = beeSeconds % 60;
  const beeFormatted = `${beeMins}:${String(beeSecs).padStart(2, '0')}`;
  const timeStatus = getPlayTimeStatus(child?.id);

  // MÀN HÌNH TỚI ĐÍCH (MÀN 5)
  if (isWon) {
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
        data-testid="screen-honey-tree-won"
      >
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
            <b style={{ fontSize: 16, color: 'var(--c-text)' }}>Tới hũ mật!</b>
            <span style={{ fontSize: 12, color: 'var(--c-sub)', display: 'block' }}>Góc chơi chung</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '3px 8px', borderRadius: 999 }}>
            còn {beeFormatted}
          </span>
        </div>

        {/* Hero đổ mật */}
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 52, animation: 'bounce 1s infinite' }}>🍯 🐝 ✨</div>
          <h3 style={{ margin: '6px 0 2px', fontSize: 22, fontWeight: 800, color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
            Cả nhà lên tới hũ mật!
          </h3>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--c-sub)' }}>
            8 bậc · {childName} trả lời {childAnswersCount} câu, mẹ trả lời {parentAnswersCount} câu
          </p>
        </div>

        {/* Hai mẹ con đập tay */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            fontSize: 34,
            padding: '8px 0',
          }}
        >
          <span>🦄</span>
          <span style={{ fontSize: 38, transform: 'scale(1.2)' }}>✋</span>
          <span>👩</span>
        </div>

        {/* Huy hiệu chung Đồng đội */}
        <div
          style={{
            background: 'var(--c-gbg, #E8F6E6)',
            border: '1.5px solid var(--c-good, #8CC98B)',
            borderRadius: 16,
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 900, color: '#166534', letterSpacing: '0.05em', marginBottom: 2 }}>
            🤝 HUY HIỆU CHUNG
          </div>
          <b style={{ fontSize: 15, color: '#14532D', display: 'block' }}>Đồng đội</b>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#166534', lineHeight: 1.4 }}>
            Hai mẹ con cùng leo, cùng giúp nhau từng bậc, không ai bị bỏ lại!
          </p>
        </div>

        {/* Nút dính đáy */}
        <div style={{ marginTop: 'auto', paddingTop: 10 }}>
          <button
            type="button"
            className="btn-km btn-km-l btn-km-primary"
            style={{ width: '100%', height: 56 }}
            onClick={onBack}
          >
            <span>🌙 Đủ thời gian rồi, nghỉ thôi</span>
            <span className="btn-km-arrow">›</span>
          </button>
        </div>
      </div>
    );
  }

  // MÀN HÌNH ĐANG CHƠI (MÀN 4)
  const treeHeightPct = Math.min(100, (level / TOTAL_LEVELS) * 100);

  return (
    <div
      className="card-km"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '16px',
        background: 'var(--c-surface, #fff)',
        borderRadius: 24,
        minHeight: 580,
      }}
      data-testid="screen-honey-tree-playing"
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
          <b style={{ fontSize: 16, color: 'var(--c-text)' }}>Leo cây mật ong</b>
          <span style={{ fontSize: 12, color: 'var(--c-sub)', display: 'block' }}>Góc chơi chung</span>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: beeSeconds < 30 ? '#DC2626' : '#92400E',
            background: beeSeconds < 30 ? '#FEE2E2' : '#FEF3C7',
            padding: '3px 8px',
            borderRadius: 999,
          }}
        >
          🐝 {beeFormatted}
        </span>
      </div>

      {/* CÂY 8 BẬC MINH HOẠ */}
      <div
        style={{
          position: 'relative',
          height: 140,
          background: 'var(--c-bg, #FFF8EC)',
          borderRadius: 18,
          border: '1px solid var(--c-line)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Hũ mật trên ngọn */}
        <div style={{ position: 'absolute', top: 8, right: 16, fontSize: 32 }}>🍯</div>

        {/* Thân cây thẳng */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: 22,
            height: '100%',
            background: 'linear-gradient(180deg, #8B5E34 0%, #6E4723 100%)',
            borderRadius: '12px 12px 0 0',
          }}
        />

        {/* Cành cây các bậc */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => {
          const bottomPos = (lvl / 8) * 110;
          const isLeft = lvl % 2 !== 0;
          return (
            <div
              key={lvl}
              style={{
                position: 'absolute',
                bottom: bottomPos,
                left: isLeft ? 'calc(50% - 44px)' : '50%',
                width: 44,
                height: 5,
                background: '#A06E3B',
                borderRadius: 4,
              }}
            />
          );
        })}

        {/* Linh vật đang leo */}
        <div
          style={{
            position: 'absolute',
            bottom: `${Math.min(90, (level / 8) * 105)}px`,
            left: 'calc(50% - 18px)',
            fontSize: 32,
            transition: 'bottom 0.4s ease-out',
          }}
        >
          🐻
        </div>

        {/* Nhãn bậc */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 12,
            fontSize: 12,
            fontWeight: 800,
            color: 'var(--c-text)',
            background: 'var(--c-surface)',
            padding: '2px 8px',
            borderRadius: 8,
            border: '1px solid var(--c-line)',
          }}
        >
          Bậc {level}/{TOTAL_LEVELS}
        </div>
      </div>

      {/* NÚT GẠT LƯỢT CHƠI (TỰ ĐỔI SAU MỖI CÂU) */}
      <div
        className="seg-km"
        style={{ width: '100%', height: 36, display: 'grid', gridTemplateColumns: '1fr 1fr' }}
      >
        <div
          className={`seg-km-btn ${turn === 'child' ? 'active' : ''}`}
          style={{
            textAlign: 'center',
            display: 'grid',
            placeItems: 'center',
            fontWeight: turn === 'child' ? 800 : 600,
            background: turn === 'child' ? 'var(--c-surface)' : 'transparent',
            borderRadius: 9,
          }}
        >
          🦄 Lượt của {childName}
        </div>
        <div
          className={`seg-km-btn ${turn === 'parent' ? 'active' : ''}`}
          style={{
            textAlign: 'center',
            display: 'grid',
            placeItems: 'center',
            fontWeight: turn === 'parent' ? 800 : 600,
            background: turn === 'parent' ? 'var(--c-surface)' : 'transparent',
            borderRadius: 9,
          }}
        >
          👩 Lượt của mẹ
        </div>
      </div>

      {/* THẺ CÂU HỎI */}
      <div
        style={{
          background: 'var(--c-surface-2)',
          border: '1px solid var(--c-line)',
          borderRadius: 18,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--c-sub)', letterSpacing: '0.05em' }}>
          {turn === 'child' ? `CÂU CỦA ${childName.toUpperCase()}` : 'CÂU CỦA MẸ'}
        </div>

        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--c-text)', lineHeight: 1.45 }}>
          {currentQ.question || currentQ.equation}
        </p>

        {showHint && currentQ.hintItem && (
          <div style={{ fontSize: 12.5, color: '#047857', background: '#ECFDF5', padding: '6px 10px', borderRadius: 10 }}>
            💡 Gợi ý: Hãy để ý số lượng {currentQ.hintItem} được nhắc trong đề nhé!
          </div>
        )}

        {/* 2 NÚT ĐÁP ÁN (THEO BẢN VẼ T1 PHẲNG MỀM) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              className="btn-km btn-km-m btn-km-primary"
              style={{ height: 48, fontSize: 16, fontWeight: 800 }}
              onClick={() => handleAnswer(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
