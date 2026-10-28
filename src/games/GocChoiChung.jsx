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
    if (timeStatus.isTimeLimitReached) {
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
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          background: "color-mix(in srgb, var(--c-accent) 12%, var(--c-surface, #fff))",
          border: "1px solid var(--c-line)",
          borderRadius: 18,
          boxSizing: "border-box",
        }}
        data-testid="card-today-focus"
      >
        <span style={{ fontSize: 24, flexShrink: 0 }}>🎯</span>
        <div style={{ flex: 1, minWidth: 0, display: "grid" }}>
          <b style={{ fontSize: 14, color: "var(--c-text)", margin: 0 }}>Hôm nay ôn</b>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--c-sub, var(--c-text-2))", lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {focusSkill}
          </p>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 900,
            color: timeStatus.isTimeLimitReached ? "var(--c-danger, #D23A50)" : "var(--c-text)",
            background: "var(--c-surface)",
            padding: "4px 9px",
            borderRadius: 999,
            whiteSpace: "nowrap",
            flexShrink: 0,
            border: "1px solid var(--c-line)",
          }}
        >
          ⏱ còn {timeStatus.remainingFormatted}
        </span>
      </div>

      {/* 3 Thẻ Trò chơi (Làm đúng goc-choi-chung.html: thẻ ngang, icon 52px, không mũi tên) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Trò 1: Đấu trí */}
        <div
          role="button"
          tabIndex={0}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            background: "var(--c-surface, #fff)",
            border: "1px solid var(--c-line)",
            borderRadius: 20,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            cursor: "pointer",
            textAlign: "left",
          }}
          onClick={() => handleStartGame("duel")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleStartGame("duel"); }}
          data-testid="btn-game-duel"
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "color-mix(in srgb, var(--c-accent) 22%, var(--c-surface))",
              display: "grid",
              placeItems: "center",
              fontSize: 26,
              flexShrink: 0,
            }}
          >
            ⚔️
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 1 }}>
            <b style={{ fontSize: 15.5, color: "var(--c-text)", margin: 0 }}>Đấu trí hai đầu bàn</b>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--c-sub, var(--c-text-2))", lineHeight: 1.35 }}>
              Đặt máy giữa bàn, mỗi người một nửa màn hình
            </p>
          </div>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 900,
              background: "var(--c-surface-2)",
              color: "var(--c-text)",
              borderRadius: 999,
              padding: "4px 9px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            2 người
          </span>
        </div>

        {/* Trò 2: Leo cây */}
        <div
          role="button"
          tabIndex={0}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            background: "var(--c-surface, #fff)",
            border: "1px solid var(--c-line)",
            borderRadius: 20,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            cursor: "pointer",
            textAlign: "left",
          }}
          onClick={() => handleStartGame("tree")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleStartGame("tree"); }}
          data-testid="btn-game-tree"
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "color-mix(in srgb, var(--c-good, #2EA043) 22%, var(--c-surface))",
              display: "grid",
              placeItems: "center",
              fontSize: 26,
              flexShrink: 0,
            }}
          >
            🌳
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 1 }}>
            <b style={{ fontSize: 15.5, color: "var(--c-text)", margin: 0 }}>Leo cây mật ong</b>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--c-sub, var(--c-text-2))", lineHeight: 1.35 }}>
              Cùng giúp linh vật leo lên trước khi ong về
            </p>
          </div>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 900,
              background: "var(--c-surface-2)",
              color: "var(--c-text)",
              borderRadius: 999,
              padding: "4px 9px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            cùng phe
          </span>
        </div>

        {/* Trò 3: Thám tử đồ vật */}
        <div
          role="button"
          tabIndex={0}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            background: "var(--c-surface, #fff)",
            border: "1px solid var(--c-line)",
            borderRadius: 20,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            cursor: "pointer",
            textAlign: "left",
          }}
          onClick={() => handleStartGame("detective")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleStartGame("detective"); }}
          data-testid="btn-game-detective"
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "color-mix(in srgb, var(--c-accent-2, #9333EA) 22%, var(--c-surface))",
              display: "grid",
              placeItems: "center",
              fontSize: 26,
              flexShrink: 0,
            }}
          >
            🔍
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 1 }}>
            <b style={{ fontSize: 15.5, color: "var(--c-text)", margin: 0 }}>Thám tử đồ vật</b>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--c-sub, var(--c-text-2))", lineHeight: 1.35 }}>
              Đi tìm đồ trong nhà cho đủ phép tính
            </p>
          </div>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 900,
              background: "var(--c-surface-2)",
              color: "var(--c-text)",
              borderRadius: 999,
              padding: "4px 9px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            vận động
          </span>
        </div>
      </div>
      {/* Dòng chú thích */}
      <p style={{ margin: '4px 0', fontSize: 12, color: 'var(--c-sub)', lineHeight: 1.4, textAlign: 'center' }}>
        Câu hỏi dựa trên chỗ {child?.name || 'con'} hay kẹt. Hết 5 phút thì tự dừng.
      </p>

      {/* Khu "Chụp đồ vật để Gấu nghĩ trò" (Legacy component chuyển xuống dưới) */}
      {SnapToyLegacyComponent && (
        <div id="sec-snap-toy" style={{ marginTop: 8, borderTop: '1px solid var(--c-line)', paddingTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-sub)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            🧸 Chụp đồ vật quanh nhà
          </div>
          <SnapToyLegacyComponent />
        </div>
      )}
    </div>
  );
}
