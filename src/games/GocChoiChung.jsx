/**
 * 🎲 GÓC CHƠI CHUNG (ĐẦU TAB TRÒ CHƠI) - PROMPT 24
 * 3 trò mẹ con: Đấu trí hai đầu bàn, Leo cây mật ong, Thám tử đồ vật.
 * 0 token, hết giờ chơi thì dừng, luôn khen cả hai.
 */
import React, { useState, useContext } from 'react';
import { getPlayTimeStatus } from './gameStorage';
import { ThemeBuddy } from '../themes/buddies/buddySvgs';
import { GameArt } from './toyIcons';
import '../games.css';
import GameDuel from './GameDuel';
import GameHoneyTree from './GameHoneyTree';
import GameDetective from './GameDetective';
import GameLimitScreen from './GameLimitScreen';
import { AppCtx } from '../ctx'

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
  const { Ho = 'Bố mẹ' } = useContext(AppCtx) || {}
  const childName = child?.name || 'con';
  const [activeGame, setActiveGame] = useState(null); // null | 'duel' | 'tree' | 'detective'
  const timeStatus = getPlayTimeStatus(child?.id);

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

  // 5. MÀN HÌNH CHÍNH GÓC CHƠI CHUNG (Gói 39: bản vẽ "Trò chơi v5")
  // Bỏ thẻ ôn bài hôm nay và dòng nhắc giới hạn phút ở đầu màn: không liên quan tới trò chơi.
  const GAMES = [
    { id: 'duel', testId: 'btn-game-duel', title: 'Đấu trí hai đầu bàn', desc: 'Đặt máy giữa bàn, mỗi người một nửa màn hình', meta: '2 người', tone: 'a1' },
    { id: 'tree', testId: 'btn-game-tree', title: 'Leo cây mật ong', desc: 'Cùng giúp linh vật leo lên trước khi ong về', meta: 'Cùng phe', tone: 'a2' },
    { id: 'detective', testId: 'btn-game-detective', title: 'Thám tử đồ vật', desc: 'Đi tìm đồ trong nhà cho đủ phép tính', meta: 'Vận động', tone: 'a3' },
  ];
  return (
    <div className="gc" data-testid="screen-goc-choi-chung">
      <header className="gc-top">
        <div className="gc-hello">
          <div>
            <h1>Góc chơi chung</h1>
            <p>{Ho} và {childName} chơi cùng.</p>
          </div>
          <span className="gc-mascot" aria-hidden="true"><ThemeBuddy state="hello" size={84} fallback={<span style={{ fontSize: 56 }}>🧸</span>} /></span>
        </div>
      </header>

      <div className="gc-games">
        {GAMES.map((g) => (
          <button key={g.id} type="button" className="gc-game" data-testid={g.testId} onClick={() => handleStartGame(g.id)}>
            <span className={`gc-art ${g.tone}`} aria-hidden="true"><GameArt id={g.id} /></span>
            <span className="gc-gtx">
              <b>{g.title}</b>
              <span className="gc-desc">{g.desc}</span>
              <span className="gc-meta">{g.meta}</span>
            </span>
            <span className="gc-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z" /></svg></span>
          </button>
        ))}
      </div>

      {/* Khu "Chơi gì với đồ trong nhà?" (chụp / gõ / chọn đồ vật) */}
      {SnapToyLegacyComponent && (
        <section id="sec-snap-toy" className="gc-sec">
          <SnapToyLegacyComponent />
        </section>
      )}
    </div>
  );
}
