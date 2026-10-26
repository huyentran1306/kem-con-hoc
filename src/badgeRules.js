/**
 * BADGE RULES ENGINE (ĐỢT 19 · CHẶNG 2)
 * Tính huy hiệu gợi ý bằng code (không gọi AI) dựa trên hành động thực tế của con trong buổi học.
 */

export const TRAIT_COLORS = {
  "Kiên nhẫn": "#2a78d6", // Xanh dương
  "Sáng tạo": "#eb6834",  // Cam
  "Tập trung": "#1baf7a", // Xanh ngọc
  "Tỉ mỉ": "#eda100",     // Vàng hổ phách
};

export const TRAIT_ICONS = {
  "Kiên nhẫn": "🐢",
  "Sáng tạo": "💡",
  "Tập trung": "🎯",
  "Tỉ mỉ": "🔍",
};

export const TRAIT_BADGE_INFO = {
  "Kiên nhẫn": {
    trait: "Kiên nhẫn",
    stickerId: "s1",
    name: "Rùa Kiên nhẫn",
    icon: "🐢",
    color: "#2a78d6",
    bg: "#F4F8FE",
    border: "#CDE2FB",
  },
  "Sáng tạo": {
    trait: "Sáng tạo",
    stickerId: "s3",
    name: "Ngôi sao Sáng tạo",
    icon: "💡",
    color: "#eb6834",
    bg: "#FFF5F0",
    border: "#FED7AA",
  },
  "Tập trung": {
    trait: "Tập trung",
    stickerId: "s8",
    name: "Tia chớp Tập trung",
    icon: "🎯",
    color: "#1baf7a",
    bg: "#F0FDF7",
    border: "#A7F3D0",
  },
  "Tỉ mỉ": {
    trait: "Tỉ mỉ",
    stickerId: "s4",
    name: "Kính lúp Tỉ mỉ",
    icon: "🔍",
    color: "#eda100",
    bg: "#FFFDF0",
    border: "#FDE68A",
  },
};

/**
 * Tính huy hiệu gợi ý theo hành động của con
 * @param {Object} options
 * @param {string} options.childName - Tên bé (ví dụ: "Mít")
 * @param {Object} options.sessionData - Dữ liệu buổi học
 * @param {Array} options.recentBadges2Weeks - Lịch sử 2 tuần gần nhất (để tie-break cân bằng)
 */
export function computeSuggestedBadge({
  childName = "Con",
  sessionData = {},
  recentBadges2Weeks = [],
} = {}) {
  const cName = childName || "Con";
  const matched = [];

  // 1. 🐢 KIÊN NHẪN
  // Có bậc bấm "Con chưa nghĩ ra" hoặc dùng câu nhỏ hơn, rồi chính bậc đó con tự làm được mà mẹ không mở đáp án
  const steps = Array.isArray(sessionData.steps) ? sessionData.steps : [];
  let patienceReason = "";

  for (const st of steps) {
    const hasStuck = Number(st.stuckCount) > 0 || st.usedStuck === true;
    const hasMicro = st.usedMicroStep === true;
    const selfSolved = st.selfSolved === true;
    const revealed = st.revealedAnswer === true;

    if ((hasStuck || hasMicro) && selfSolved && !revealed) {
      if (hasStuck) {
        const count = Number(st.stuckCount) || 1;
        patienceReason = `${cName} bấm "chưa nghĩ ra" ${count} lần ở bậc ${st.stepNo || 1} rồi tự làm được.`;
      } else {
        patienceReason = `${cName} dùng câu nhỏ hơn ở bậc ${st.stepNo || 1} rồi tự làm được.`;
      }
      break;
    }
  }

  // Hỗ trợ thêm cờ trực tiếp từ sessionData nếu truyền tổng hợp
  if (!patienceReason && sessionData.patienceAchieved) {
    patienceReason = sessionData.patienceReason || `${cName} bấm "chưa nghĩ ra" rồi kiên trì tự làm được.`;
  }

  if (patienceReason) {
    matched.push({ trait: "Kiên nhẫn", reason: patienceReason });
  }

  // 2. 💡 SÁNG TẠO
  // Con giảng lại có cách làm riêng, hoặc làm bài anh em, hoặc chơi "Con đố mẹ" hay trò 5 phút, hoặc Gấu nghe con nêu cách khác mà đúng
  let creativityReason = "";
  if (sessionData.teachBackOwnWay) {
    creativityReason = `${cName} giảng lại bài bằng cách giải độc đáo của riêng mình.`;
  } else if (sessionData.didBrotherProblem) {
    creativityReason = `${cName} tự tin giải thêm bài anh em thích ứng.`;
  } else if (sessionData.playedMiniGame) {
    creativityReason = `${cName} cùng mẹ chơi trò chơi tương tác 5 phút vui vẻ.`;
  } else if (sessionData.aiRecognizedAlternativeWay) {
    creativityReason = `${cName} nêu một cách giải khác rất thông minh và đúng.`;
  } else if (sessionData.creativityAchieved) {
    creativityReason = sessionData.creativityReason || `${cName} có cách giải sáng tạo trong buổi học.`;
  }

  if (creativityReason) {
    matched.push({ trait: "Sáng tạo", reason: creativityReason });
  }

  // 3. 🎯 TẬP TRUNG
  // Xong cả bài trong <= 20 phút, không rời app quá 2 phút, các bậc liền mạch
  let focusReason = "";
  const duration = typeof sessionData.durationMinutes === "number" ? sessionData.durationMinutes : null;
  const maxInact = typeof sessionData.maxInactivityMinutes === "number" ? sessionData.maxInactivityMinutes : 0;
  const seamless = sessionData.stepsSeamless !== false;

  if (
    (duration !== null && duration > 0 && duration <= 20 && maxInact <= 2 && seamless) ||
    sessionData.focusAchieved
  ) {
    const mins = Math.max(1, Math.round(duration || 15));
    focusReason = sessionData.focusReason || `${cName} xong cả bài tập trung chỉ trong ${mins} phút, liền mạch.`;
    matched.push({ trait: "Tập trung", reason: focusReason });
  }

  // 4. 🔍 TỈ MỈ
  // Bậc "kiểm tra lại" hoặc "đơn vị" con tự làm, hoặc chấm vở không có lỗi trình bày
  let precisionReason = "";
  for (const st of steps) {
    const isTargetSkill = st.skill === "kiem_tra_lai" || st.skill === "don_vi";
    const selfSolved = st.selfSolved === true;
    const revealed = st.revealedAnswer === true;
    if (isTargetSkill && selfSolved && !revealed) {
      const skillName = st.skill === "don_vi" ? "đơn vị" : "kiểm tra lại";
      precisionReason = `${cName} tự làm bậc ${skillName} cẩn thận, không cần mở đáp án.`;
      break;
    }
  }

  if (!precisionReason && sessionData.isCheckWork && sessionData.presentationClean) {
    precisionReason = `Vở của ${cName} được trình bày sạch đẹp, ngay ngắn, không có lỗi trình bày.`;
  } else if (!precisionReason && sessionData.precisionAchieved) {
    precisionReason = sessionData.precisionReason || `${cName} làm bài rất tỉ mỉ và cẩn thận từng chi tiết.`;
  }

  if (precisionReason) {
    matched.push({ trait: "Tỉ mỉ", reason: precisionReason });
  }

  // ==========================================================
  // CHỌN PHẨM CHẤT CUỐI CÙNG
  // ==========================================================

  // Ca 1: Không đạt cái nào -> Gợi ý Kiên nhẫn ("Mít đã ngồi học hết bài")
  if (matched.length === 0) {
    const badgeInfo = TRAIT_BADGE_INFO["Kiên nhẫn"];
    return {
      trait: "Kiên nhẫn",
      stickerId: badgeInfo.stickerId,
      name: badgeInfo.name,
      icon: badgeInfo.icon,
      color: badgeInfo.color,
      bg: badgeInfo.bg,
      border: badgeInfo.border,
      reason: `${cName} đã ngồi học hết bài.`,
      isFallback: true,
      matchedTraits: [],
    };
  }

  // Ca 2: Chỉ đạt 1 phẩm chất
  if (matched.length === 1) {
    const chosen = matched[0];
    const badgeInfo = TRAIT_BADGE_INFO[chosen.trait];
    return {
      trait: chosen.trait,
      stickerId: badgeInfo.stickerId,
      name: badgeInfo.name,
      icon: badgeInfo.icon,
      color: badgeInfo.color,
      bg: badgeInfo.bg,
      border: badgeInfo.border,
      reason: chosen.reason,
      isFallback: false,
      matchedTraits: [chosen.trait],
    };
  }

  // Ca 3: Nhiều phẩm chất cùng đạt -> Tie-breaker: lấy cái con ít nhận nhất trong 2 tuần gần đây
  const counts = {
    "Kiên nhẫn": 0,
    "Sáng tạo": 0,
    "Tập trung": 0,
    "Tỉ mỉ": 0,
  };

  for (const b of recentBadges2Weeks) {
    const t = typeof b === "string" ? b : (b?.trait || "");
    if (counts[t] !== undefined) {
      counts[t]++;
    }
  }

  // Ưu tiên phụ nếu counts bằng nhau: Sáng tạo -> Tỉ mỉ -> Tập trung -> Kiên nhẫn
  const priorityOrder = ["Sáng tạo", "Tỉ mỉ", "Tập trung", "Kiên nhẫn"];

  matched.sort((a, b) => {
    const diff = counts[a.trait] - counts[b.trait];
    if (diff !== 0) return diff; // Ưu tiên cái ít nhận nhất (count nhỏ hơn)
    return priorityOrder.indexOf(a.trait) - priorityOrder.indexOf(b.trait);
  });

  const chosen = matched[0];
  const badgeInfo = TRAIT_BADGE_INFO[chosen.trait];

  return {
    trait: chosen.trait,
    stickerId: badgeInfo.stickerId,
    name: badgeInfo.name,
    icon: badgeInfo.icon,
    color: badgeInfo.color,
    bg: badgeInfo.bg,
    border: badgeInfo.border,
    reason: chosen.reason,
    isFallback: false,
    matchedTraits: matched.map((m) => m.trait),
  };
}


export const HEATMAP_COLORS = [
  "#f3f7fd",
  "#cde2fb",
  "#9ec5f4",
  "#6da7ec",
  "#3987e5",
  "#256abf",
  "#184f95",
];

export function getHeatmapColor(pct) {
  if (pct === 0) return HEATMAP_COLORS[0];
  if (pct <= 15) return HEATMAP_COLORS[1];
  if (pct <= 30) return HEATMAP_COLORS[2];
  if (pct <= 45) return HEATMAP_COLORS[3];
  if (pct <= 60) return HEATMAP_COLORS[4];
  if (pct <= 75) return HEATMAP_COLORS[5];
  return HEATMAP_COLORS[6];
}
