/**
 * ⏱ QUẢN LÝ THỜI GIAN CHƠI & LỊCH SỬ HỌC TẬP - ĐỢT 14
 */

import { recordLearningEvent } from '../api';

const TIME_LIMIT_KEY = 'kem-con-hoc:game-daily-limit'; // Cài đặt mẹ chọn (3, 5, 10, 15)
const PLAY_SECONDS_PREFIX = 'kem-con-hoc:game-play-seconds';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Lấy giới hạn thời gian chơi hàng ngày (phút)
 * Mặc định 5 phút. Mẹ chỉnh được: 3, 5, 10, 15
 */
export function getDailyLimitMinutes(childId) {
  try {
    const raw = localStorage.getItem(`${TIME_LIMIT_KEY}:${childId}`) || localStorage.getItem(TIME_LIMIT_KEY);
    const parsed = parseInt(raw, 10);
    if ([3, 5, 10, 15].includes(parsed)) return parsed;
  } catch {}
  return 5;
}

export function setDailyLimitMinutes(childId, minutes) {
  try {
    if ([3, 5, 10, 15].includes(minutes)) {
      localStorage.setItem(`${TIME_LIMIT_KEY}:${childId}`, String(minutes));
    }
  } catch {}
}

/**
 * Lấy tình trạng thời gian chơi hôm nay của bé
 */
export function getPlayTimeStatus(childId = 'default') {
  const limitMinutes = getDailyLimitMinutes(childId);
  const limitSeconds = limitMinutes * 60;
  const todayStr = getTodayStr();
  const key = `${PLAY_SECONDS_PREFIX}:${childId}:${todayStr}`;

  let playedSeconds = 0;
  try {
    playedSeconds = parseInt(localStorage.getItem(key) || '0', 10);
  } catch {}

  const remainingSeconds = Math.max(0, limitSeconds - playedSeconds);
  const isLimitReached = remainingSeconds <= 0;

  const remMins = Math.floor(remainingSeconds / 60);
  const remSecs = remainingSeconds % 60;
  const remainingFormatted = `${remMins}:${String(remSecs).padStart(2, '0')}`;

  return {
    playedSeconds,
    limitSeconds,
    limitMinutes,
    remainingSeconds,
    isLimitReached,
    remainingFormatted,
  };
}

/**
 * Cộng thêm số giây đã chơi trong ngày
 */
export function addPlaySeconds(childId = 'default', seconds = 1) {
  const todayStr = getTodayStr();
  const key = `${PLAY_SECONDS_PREFIX}:${childId}:${todayStr}`;
  let played = 0;
  try {
    played = parseInt(localStorage.getItem(key) || '0', 10);
  } catch {}
  played += seconds;
  try {
    localStorage.setItem(key, String(played));
  } catch {}
  return getPlayTimeStatus(childId);
}

/**
 * Ghi nhận câu trả lời vào learning_events
 * Chú ý: Câu của mẹ ('parent') KHÔNG tính vào kỹ năng của con
 */
export async function logGameAnswer({ game, skill, who = 'child', correct, ms, childId, isTrial = false }) {
  const eventPayload = {
    type: 'game_answer',
    game,
    skill,
    who, // 'child' | 'parent'
    correct: Boolean(correct),
    ms: Math.round(ms || 0),
    childId: who === 'child' ? childId : undefined,
    timestamp: Date.now(),
  };

  // Lưu lịch sử cục bộ để Gấu nhớ dùng lại
  try {
    const histKey = `kem-con-hoc:game-history:${childId || 'default'}`;
    const raw = localStorage.getItem(histKey);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(eventPayload);
    // Giữ tối đa 50 sự kiện gần nhất
    localStorage.setItem(histKey, JSON.stringify(list.slice(0, 50)));
  } catch {}

  // Nếu không phải Dùng thử và là câu của con, đồng bộ lên server
  if (!isTrial && who === 'child') {
    try {
      await recordLearningEvent('game_answer', {
        game,
        skill,
        correct,
        duration_ms: ms,
        child_id: childId,
      });
    } catch {}
  }

  return eventPayload;
}

/**
 * Lấy kỹ năng đang ôn hôm nay từ Gấu nhớ
 */
export function getTodaysFocusSkill(child, stats) {
  // Ưu tiên kỹ năng hay vướng gần nhất
  const weakList = stats?.weak || [];
  if (weakList.length > 0 && weakList[0]?.n) {
    return weakList[0].n;
  }

  // Nếu trong hồ sơ con có bearMemory
  const memList = child?.bearMemory || [];
  if (memList.length > 0 && memList[0]?.label) {
    return memList[0].label;
  }

  // Mặc định theo lớp
  const g = parseInt(String(child?.grade || '3').replace(/\D/g, '') || '3', 10);
  if (g === 1) return 'Phép cộng trừ phạm vi 20';
  if (g === 2) return 'Bảng nhân 2, 3 và cộng có nhớ';
  return 'Bảng nhân 6 · tìm "số đã dùng" trong đề';
}
