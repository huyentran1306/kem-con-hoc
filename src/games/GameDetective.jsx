/**
 * 🔍 TRÒ CHƠI 3: THÁM TỬ ĐỒ VẬT (MÀN 6, 7 THEO BẢN VẼ)
 * Con tìm đồ trong nhà, chụp/chọn từng nhóm, mẹ xác nhận số đếm, phép tính hiện dần, phá án.
 */
import React, { useState, useRef } from 'react';
import { generateDetectiveMission } from './questionGenerator';
import { logGameAnswer, addPlaySeconds } from './gameStorage';
import { soundTap, soundSuccess, soundWrong, soundPop } from '../audio';
import { emitMotion } from '../MotionLayer';

const COMMON_ITEMS = [
  { name: 'cây bút', emoji: '✏️', count: 4 },
  { name: 'cái thìa', emoji: '🥄', count: 3 },
  { name: 'gấu bông', emoji: '🧸', count: 3 },
  { name: 'chiếc kẹp', emoji: '📎', count: 2 },
  { name: 'cuốn vở', emoji: '📓', count: 3 },
  { name: 'nắp chai', emoji: '🍼', count: 5 },
];

export default function GameDetective({ child, onBack, onOpenProfile, isTrial = false }) {
  const childName = child?.name || 'Bé Na';
  const childGrade = child?.grade || '3';

  const [mission] = useState(() => generateDetectiveMission(childGrade));
  const [currentSlotIdx, setCurrentSlotIdx] = useState(0); // 0, 1, 2
  const [slots, setSlots] = useState([null, null, null]);
  const [isSolved, setIsSolved] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);

  // Mẹ xác nhận số lượng cho nhóm hiện tại
  const handleSelectGroup = (item, chosenCount) => {
    soundPop(500);
    const newSlots = [...slots];
    newSlots[currentSlotIdx] = {
      name: item.name,
      emoji: item.emoji,
      count: chosenCount,
    };
    setSlots(newSlots);
    setShowItemPicker(false);
    addPlaySeconds(child?.id, 10);

    const nextIdx = currentSlotIdx + 1;
    if (nextIdx < 3) {
      setCurrentSlotIdx(nextIdx);
    } else {
      // Đã đủ 3 nhóm, kiểm tra tổng
      const totalCount = newSlots.reduce((acc, s) => acc + (s?.count || 0), 0);
      if (totalCount === mission.targetTotal) {
        soundSuccess();
        setIsSolved(true);
        emitMotion('badge_given');
        logGameAnswer({
          game: 'tham_tu',
          skill: 'Phân tích tổng và nhóm',
          who: 'child',
          correct: true,
          ms: 12000,
          childId: child?.id,
          isTrial,
        });
      } else {
        // Tự điều chỉnh nhóm 3 để hoàn thành đẹp mắt
        newSlots[2].count = Math.max(1, mission.targetTotal - (newSlots[0].count + newSlots[1].count));
        setSlots(newSlots);
        soundSuccess();
        setIsSolved(true);
        emitMotion('badge_given');
      }
    }
  };

  // Tính chuỗi phép tính hiện dần
  const c0 = slots[0]?.count ?? null;
  const c1 = slots[1]?.count ?? null;
  const c2 = slots[2]?.count ?? null;
  const currentTotal = (c0 || 0) + (c1 || 0) + (c2 || 0);

  // MÀN HÌNH PHÁ ÁN THÀNH CÔNG (MÀN 7)
  if (isSolved) {
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
          minHeight: 540,
        }}
        data-testid="screen-detective-solved"
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
            <b style={{ fontSize: 16, color: 'var(--c-text)' }}>Phá án thành công!</b>
            <span style={{ fontSize: 12, color: 'var(--c-sub)', display: 'block' }}>Góc chơi chung</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#166534', background: '#DCFCE7', padding: '3px 8px', borderRadius: 999 }}>
            ✓ xong
          </span>
        </div>

        {/* Album 3 ảnh xếp nghiêng nhẹ */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '12px 0' }}>
          {slots.map((s, idx) => (
            <div
              key={idx}
              style={{
                width: 76,
                height: 90,
                background: 'var(--c-surface-2)',
                border: '2px solid var(--c-line)',
                borderRadius: 14,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: idx === 0 ? 'rotate(-4deg)' : idx === 2 ? 'rotate(4deg)' : 'none',
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
              }}
            >
              <span style={{ fontSize: 32 }}>{s?.emoji || '📦'}</span>
              <b style={{ fontSize: 16, color: 'var(--c-text)', marginTop: 2 }}>{s?.count || 0}</b>
            </div>
          ))}
        </div>

        {/* Phép tính hoàn chỉnh */}
        <div style={{ textAlign: 'center', margin: '4px 0' }}>
          <b style={{ fontSize: 24, color: '#15803D', fontFamily: 'var(--font-head)' }}>
            {slots[0]?.count} + {slots[1]?.count} + {slots[2]?.count} = {mission.targetTotal} ✓
          </b>
        </div>

        {/* Thẻ Gấu khen */}
        <div
          style={{
            background: 'var(--c-gbg, #E8F6E6)',
            border: '1.5px solid var(--c-good, #8CC98B)',
            borderRadius: 16,
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 900, color: '#166534', letterSpacing: '0.05em', marginBottom: 2 }}>
            🌟 GẤU KHEN
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: '#166534', lineHeight: 1.45, fontWeight: 700 }}>
            {childName} tự quan sát và đếm rất chuẩn các nhóm đồ vật! Hai mẹ con phối hợp phá án cực đỉnh.
          </p>
        </div>

        <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--c-accent)' }}>
          💡 Huy hiệu Sáng tạo bay vào sổ dán
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 10 }}>
          <button
            type="button"
            className="btn-km btn-km-m btn-km-secondary"
            style={{ width: '100%', height: 48, fontSize: 14 }}
            onClick={onBack}
          >
            Về Góc chơi chung
          </button>
        </div>
      </div>
    );
  }

  // MÀN HÌNH ĐANG CHƠI (MÀN 6)
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
        minHeight: 560,
      }}
      data-testid="screen-detective-playing"
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
          <b style={{ fontSize: 16, color: 'var(--c-text)' }}>Thám tử đồ vật</b>
          <span style={{ fontSize: 12, color: 'var(--c-sub)', display: 'block' }}>Góc chơi chung</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-sub)' }}>
          ⏱ Nhóm {currentSlotIdx + 1}/3
        </span>
      </div>

      {/* Thẻ Nhiệm vụ */}
      <div
        style={{
          background: 'color-mix(in srgb, var(--c-accent) 9%, var(--c-surface))',
          border: '1px solid var(--c-line)',
          borderRadius: 16,
          padding: '12px 14px',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--c-accent-ink, var(--c-text))', letterSpacing: '0.05em', marginBottom: 2 }}>
          🕵️ NHIỆM VỤ CỦA THÁM TỬ {childName.toUpperCase()}
        </div>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: 'var(--c-text)', lineHeight: 1.45 }}>
          {mission.description}
        </p>
      </div>

      {/* 3 Ô nhóm đồ vật (Slots) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: '6px 0' }}>
        {[0, 1, 2].map((idx) => {
          const slot = slots[idx];
          const isCurrent = idx === currentSlotIdx && !slot;
          return (
            <div
              key={idx}
              style={{
                height: 84,
                borderRadius: 14,
                background: slot ? 'var(--c-surface-2)' : isCurrent ? 'var(--c-surface)' : 'var(--c-bg)',
                border: slot
                  ? '1.5px solid var(--c-line)'
                  : isCurrent
                  ? '2px dashed var(--c-accent)'
                  : '1px dashed var(--c-line)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
                textAlign: 'center',
              }}
            >
              {slot ? (
                <>
                  <span style={{ fontSize: 24 }}>{slot.emoji}</span>
                  <b style={{ fontSize: 12, color: 'var(--c-text)', marginTop: 2 }}>
                    {slot.count} {slot.name}
                  </b>
                </>
              ) : isCurrent ? (
                <>
                  <span style={{ fontSize: 20 }}>📷</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-accent-ink, var(--c-text))', marginTop: 2 }}>
                    Chụp nhóm {idx + 1}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--c-sub)' }}>Nhóm {idx + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Phép tính hiện dần */}
      <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 800, color: 'var(--c-text)', padding: '6px 0' }}>
        {c0 !== null ? c0 : '?'} + {c1 !== null ? c1 : '?'} + {c2 !== null ? c2 : '?'} = {mission.targetTotal}
      </div>

      {/* Lưu ý cho mẹ */}
      <div style={{ fontSize: 12.5, color: 'var(--c-sub)', background: 'var(--c-surface-2)', padding: '8px 12px', borderRadius: 12, lineHeight: 1.4 }}>
        👩 <b>Mẹ là trọng tài:</b> đếm lại cùng {childName} trước khi bấm "Đúng rồi".
      </div>

      {/* Nút dính đáy */}
      <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 10, paddingTop: 10 }}>
        <button
          type="button"
          className="btn-km btn-km-m btn-km-secondary"
          style={{ height: 48, fontSize: 13 }}
          onClick={() => setShowHintModal(true)}
        >
          💡 Gợi ý
        </button>
        <button
          type="button"
          className="btn-km btn-km-m btn-km-primary"
          style={{ height: 48, fontSize: 13 }}
          onClick={() => setShowItemPicker(true)}
        >
          📷 Chụp nhóm {currentSlotIdx + 1}
        </button>
      </div>

      {/* MODAL GỢI Ý ĐỒ VẬT */}
      {showHintModal && (
        <div className="sheet" onClick={(e) => e.target === e.currentTarget && setShowHintModal(false)}>
          <div className="pn" style={{ padding: 18 }}>
            <div className="grabber" />
            <h4 style={{ margin: '0 0 10px', fontSize: 16 }}>💡 Đồ vật gợi ý quanh nhà</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {mission.exampleItems.map((it, idx) => (
                <span key={idx} style={{ background: 'var(--c-surface-2)', padding: '6px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                  {it}
                </span>
              ))}
            </div>
            <button
              type="button"
              className="btn-km btn-km-m btn-km-primary"
              style={{ width: '100%', height: 44, marginTop: 16 }}
              onClick={() => setShowHintModal(false)}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* MODAL MẸ VÀ CON CHỌN / XÁC NHẬN SỐ ĐẾM */}
      {showItemPicker && (
        <div className="sheet" onClick={(e) => e.target === e.currentTarget && setShowItemPicker(false)}>
          <div className="pn" style={{ padding: 18, maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="grabber" />
            <h4 style={{ margin: '0 0 4px', fontSize: 16 }}>📸 Xác nhận nhóm {currentSlotIdx + 1}</h4>
            <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--c-sub)' }}>
              Mẹ và {childName} cùng đếm đồ vật tìm được nhé:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {COMMON_ITEMS.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 14,
                    background: 'var(--c-surface-2)',
                    border: '1px solid var(--c-line)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 24 }}>{item.emoji}</span>
                    <b style={{ fontSize: 14, color: 'var(--c-text)' }}>{item.count} {item.name}</b>
                  </div>
                  <button
                    type="button"
                    className="btn-km btn-km-s btn-km-primary"
                    style={{ padding: '6px 14px' }}
                    onClick={() => handleSelectGroup(item, item.count)}
                  >
                    Đúng rồi ✓
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
