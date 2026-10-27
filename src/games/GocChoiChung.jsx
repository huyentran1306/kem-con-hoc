/**
 * 🎲 GÓC CHƠI CHUNG (ĐẦU TAB TRÒ CHƠI) - PROMPT 24
 * 3 trò mẹ con: Đấu trí hai đầu bàn, Leo cây mật ong, Thám tử đồ vật.
 * 0 token, tự dừng khi hết giờ, luôn khen cả hai.
 */
import React, { useState } from 'react';
import { getPlayTimeStatus, getTodaysFocusSkill } from './gameStorage';
import GameDuel from './GameDuel';
import GameHoneyTree from './GameHoneyTree';
import GameDetective from './GameDetective';
import GameLimitScreen from './GameLimitScreen';

export default function GocChoiChung({
  child,
  stats,
  S,
  patch,
  go,
  openSheet,
  isTrial = false,
  SnapToyLegacyComponent,
}) {
  const childName = child?.name || 'Bé Na';
  const [activeGame, setActiveGame] = useState(null); // null | 'duel' | 'tree' | 'detective'
  const timeStatus = getPlayTimeStatus(child?.id);
  const focusSkill = getTodaysFocusSkill(child, stats);

  const handleStartGame = (gameId) => {
    if (timeStatus.isLimitReached) {
      setActiveGame('limit_reached');
    } else {
      setActiveGame(gameId);
    }
  };

  // 1. Màn hết giờ
  if (activeGame === 'limit_reached') {
    return (
      <GameLimitScreen
        childName={childName}
        onBack={() => setActiveGame(null)}
        onOpenProfile={() => go('profile')}
      />
    );
  }

  // 2. Màn chơi Đấu trí hai đầu bàn
  if (activeGame === 'duel') {
    return (
      <GameDuel
        child={child}
        stats={stats}
        onBack={() => setActiveGame(null)}
        onOpenProfile={() => go('profile')}
        isTrial={isTrial}
      />
    );
  }

  // 3. Màn chơi Leo cây mật ong
  if (activeGame === 'tree') {
    return (
      <GameHoneyTree
        child={child}
        stats={stats}
        onBack={() => setActiveGame(null)}
        onOpenProfile={() => go('profile')}
        isTrial={isTrial}
      />
    );
  }

  // 4. Màn chơi Thám tử đồ vật
  if (activeGame === 'detective') {
    return (
      <GameDetective
        child={child}
        onBack={() => setActiveGame(null)}
        onOpenProfile={() => go('profile')}
        isTrial={isTrial}
      />
    );
  }

  // 5. MÀN HÌNH CHÍNH GÓC CHƠI CHUNG (MÀN 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 80 }} data-testid="screen-goc-choi-chung">
      {/* TopBar T3 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-sub)' }}>Trò chơi</span>
        <button
          type="button"
          className="btn-km-circle"
          style={{ width: 36, height: 36, fontSize: 15 }}
          onClick={() => openSheet('calm')}
          aria-label="Mẹ bình tĩnh"
          title="Mẹ bình tĩnh"
        >
          😮‍💨
        </button>
      </div>

      {/* Header chào mừng */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
            Góc chơi chung
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 13.5, color: 'var(--c-sub)' }}>
            Mẹ và {childName} chơi cùng 5 phút, ôn đúng chỗ hôm nay hay kẹt.
          </p>
        </div>
        <span style={{ fontSize: 44, flexShrink: 0 }}>🐻</span>
      </div>

      {/* Thẻ Hôm nay ôn */}
      <div
        className="card-km"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 14px',
          background: 'var(--c-surface, #fff)',
          border: '1.5px solid var(--c-line)',
          borderRadius: 18,
        }}
        data-testid="card-today-focus"
      >
        <span style={{ fontSize: 28, flexShrink: 0 }}>🎯</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b style={{ fontSize: 13.5, color: 'var(--c-text)', display: 'block' }}>Hôm nay ôn</b>
          <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--c-sub)', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {focusSkill}
          </p>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: timeStatus.isLimitReached ? 'var(--c-danger, #D23A50)' : 'var(--c-text)',
            background: 'var(--c-surface-2)',
            padding: '4px 10px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
          }}
        >
          ⏱ còn {timeStatus.remainingFormatted}
        </span>
      </div>

      {/* 3 Thẻ Trò chơi (Thẻ hành động T2) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Trò 1: Đấu trí */}
        <div
          className="card-km card-km-action"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            cursor: 'pointer',
            borderRadius: 18,
          }}
          onClick={() => handleStartGame('duel')}
          data-testid="btn-game-duel"
        >
          <span style={{ fontSize: 26, width: 40, height: 40, borderRadius: 12, background: 'var(--c-surface-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            ⚔️
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 15, color: 'var(--c-text)', display: 'block' }}>Đấu trí hai đầu bàn</b>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--c-sub)' }}>
              Đặt máy giữa bàn, mỗi người một nửa màn hình
            </p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-accent)', background: 'color-mix(in srgb, var(--c-accent) 15%, transparent)', padding: '2px 8px', borderRadius: 999 }}>
            2 người
          </span>
          <span className="btn-km-arrow" style={{ fontSize: 18, color: 'var(--c-sub)' }}>›</span>
        </div>

        {/* Trò 2: Leo cây */}
        <div
          className="card-km card-km-action"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            cursor: 'pointer',
            borderRadius: 18,
          }}
          onClick={() => handleStartGame('tree')}
          data-testid="btn-game-tree"
        >
          <span style={{ fontSize: 26, width: 40, height: 40, borderRadius: 12, background: 'var(--c-surface-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            🌳
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 15, color: 'var(--c-text)', display: 'block' }}>Leo cây mật ong</b>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--c-sub)' }}>
              Cùng giúp linh vật leo lên trước khi ong về
            </p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#15803D', background: '#DCFCE7', padding: '2px 8px', borderRadius: 999 }}>
            cùng phe
          </span>
          <span className="btn-km-arrow" style={{ fontSize: 18, color: 'var(--c-sub)' }}>›</span>
        </div>

        {/* Trò 3: Thám tử đồ vật */}
        <div
          className="card-km card-km-action"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            cursor: 'pointer',
            borderRadius: 18,
          }}
          onClick={() => handleStartGame('detective')}
          data-testid="btn-game-detective"
        >
          <span style={{ fontSize: 26, width: 40, height: 40, borderRadius: 12, background: 'var(--c-surface-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            🔍
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 15, color: 'var(--c-text)', display: 'block' }}>Thám tử đồ vật</b>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--c-sub)' }}>
              Đi tìm đồ trong nhà cho đủ phép tính
            </p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#9333EA', background: '#F3E8FF', padding: '2px 8px', borderRadius: 999 }}>
            vận động
          </span>
          <span className="btn-km-arrow" style={{ fontSize: 18, color: 'var(--c-sub)' }}>›</span>
        </div>
      </div>

      {/* Dòng chú thích */}
      <p style={{ margin: '4px 0', fontSize: 12, color: 'var(--c-sub)', lineHeight: 1.4, textAlign: 'center' }}>
        Câu hỏi tạo bằng code từ phần Gấu nhớ, không tốn token. Hết 5 phút thì tự dừng.
      </p>

      {/* Khu "Chụp đồ vật để Gấu nghĩ trò" (Legacy component chuyển xuống dưới) */}
      {SnapToyLegacyComponent && (
        <div style={{ marginTop: 8, borderTop: '1px dashed var(--c-line)', paddingTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-sub)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            🧸 Chụp đồ vật quanh nhà
          </div>
          <SnapToyLegacyComponent />
        </div>
      )}
    </div>
  );
}
