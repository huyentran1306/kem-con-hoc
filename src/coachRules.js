/**
 * src/coachRules.js — Gấu góp ý cách kèm (Đợt 20 · Chặng 4)
 * Hoàn toàn bằng code JavaScript từ learning_events và thời gian từng bậc.
 * Tiêu tốn 0 token AI. Chỉ bố mẹ thấy, tắt được trong trang Con tôi.
 */

/*
 * Prompt 28 A1/A2 + 29B: nguyên tắc "chỉ khen, chỉ nhận xét điều THẬT SỰ đã xảy ra".
 * - Mọi điều kiện dựa trên dữ liệu đo được của buổi học (flow.stepLog, thời gian thật, chuỗi ngày thật).
 * - Không có dữ liệu → điều kiện là false (không đoán, không mặc định).
 * - Không viết cứng số hay tình huống của một bài cụ thể; câu ví dụ lấy từ chính bài vừa học.
 * - Xưng hô theo người đang kèm (ctx.ho / ctx.Ho): "mẹ" | "bố" | "ông bà".
 */
export const COACH_ADVICE_LIBRARY = [
  // 1. Mở đáp án quá nhanh (< 30 giây)
  {
    id: "quick_reveal",
    type: "pacing",
    icon: "⏳",
    condition: (ctx) => ctx.quickRevealStep > 0,
    template: (ctx) => `${ctx.Ho} mở đáp án ở bậc ${ctx.quickRevealStep} chỉ sau ${ctx.quickRevealSec} giây. Lần sau ${ctx.ho} thử đếm thầm 45 giây để ${ctx.childName} có thêm thời gian tự xoay sở nhé!`,
    action: "Cho con thêm thời gian chờ",
  },
  // 2. Kẹt ở bậc 1 nhiều lần
  {
    id: "stuck_step_1",
    type: "manipulatives",
    icon: "🍬",
    condition: (ctx) => ctx.stuckAtStep1,
    template: (ctx) => `${ctx.childName} dừng lại ở bậc 1 khá lâu. Lần tới ${ctx.ho} lấy kẹo hoặc que tính thật ra bàn cho con sờ nắm ngay từ đầu, con sẽ bắt nhịp nhanh hơn đấy!`,
    action: "Dùng đồ vật thật ngay đầu buổi",
  },
  // 3. Hoàn thành nhanh (< 5 phút, đo thật)
  {
    id: "fast_session",
    type: "challenge",
    icon: "🚀",
    condition: (ctx) => ctx.totalDurationMin !== null && ctx.totalDurationMin > 0 && ctx.totalDurationMin < 5 && ctx.hasBrotherProblem,
    template: (ctx) => `Buổi học hôm nay chỉ mất ${ctx.totalDurationMin} phút. ${ctx.Ho} có thể cho ${ctx.childName} thử sức với bài anh em ngay bên dưới nhé.`,
    action: "Thử thêm bài anh em",
  },
  // 4. Buổi học kéo dài (>= 30 phút, đo thật)
  {
    id: "long_session",
    type: "rest",
    icon: "🍵",
    condition: (ctx) => ctx.totalDurationMin !== null && ctx.totalDurationMin >= 30,
    template: (ctx) => `Buổi học kéo dài ${ctx.totalDurationMin} phút rồi. ${ctx.Ho} và ${ctx.childName} cùng uống cốc nước rồi nghỉ ngơi nhé!`,
    action: "Nghỉ ngơi và uống nước",
  },
  // 5. Người kèm bấm "bình tĩnh"
  {
    id: "calm_used",
    type: "emotion",
    icon: "🌱",
    condition: (ctx) => ctx.calmClickCount >= 1,
    template: (ctx) => `${ctx.Ho} đã chủ động dừng lại hạ hoả ${ctx.calmClickCount} lần trong buổi học. Đây là kỹ năng đồng hành tuyệt vời, giữ được sự tự tin cho ${ctx.childName}!`,
    action: "Ghi nhận sự kiên nhẫn",
  },
  // 6. Con tự giải được bậc khó (bậc 2 trở đi, không kẹt, không mở đáp án)
  {
    id: "self_solved_hard",
    type: "praise",
    icon: "🌟",
    condition: (ctx) => ctx.selfSolvedHardStep > 0,
    template: (ctx) => `${ctx.childName} đã tự mình nghĩ ra bậc ${ctx.selfSolvedHardStep} mà không cần xem đáp án. ${ctx.Ho} nhớ ôm con và khen con kiên trì nhé!`,
    action: "Khen ngợi nỗ lực tự thân",
  },
  // 7. Đọc lại đề nhiều lần
  {
    id: "read_problem_again",
    type: "comprehension",
    icon: "📖",
    condition: (ctx) => ctx.reReadProblem,
    template: (ctx) => `${ctx.childName} phải đọc lại đề bài nhiều lần. ${ctx.Ho} có thể cho con dùng bút chì gạch chân dưới các con số trước khi bắt đầu giải.`,
    action: "Gạch chân dữ liệu đề bài",
  },
  // 8. Kẹt thật ở bậc tính toán
  {
    id: "calc_stuck",
    type: "skill",
    icon: "🧮",
    condition: (ctx) => ctx.stuckSkill === "tinh_toan",
    template: (ctx) => `${ctx.childName} hơi lúng túng ở khâu tính. ${ctx.Ho} thử rủ con chơi trò đố nhẩm cộng trừ 5 phút trước giờ cơm tối nhé.`,
    action: "Luyện tính nhẩm 5 phút",
  },
  // 9. Kẹt thật ở bậc chọn phép tính
  {
    id: "choose_op_stuck",
    type: "skill",
    icon: "⚖️",
    condition: (ctx) => ctx.stuckSkill === "chon_phep_tinh",
    template: (ctx) => `${ctx.childName} còn phân vân lúc nào cộng, lúc nào trừ. ${ctx.Ho} hãy gắn từ khoá với hành động thật: "cho thêm" là cộng, "bớt đi, cho bạn" là trừ.`,
    action: "Gắn từ khoá vào hành động thật",
  },
  // 10. Con làm được sau khi xem gợi ý hình vẽ
  {
    id: "visual_learner",
    type: "learning_style",
    icon: "🎨",
    condition: (ctx) => ctx.usedVisualHint,
    template: (ctx) => `${ctx.childName} làm được ngay sau khi xem gợi ý hình vẽ. Lần sau ${ctx.ho} thử vẽ sơ đồ trước khi hỏi nhé!`,
    action: "Ưu tiên vẽ sơ đồ",
  },
  // 11. Bỏ qua bước kiểm tra lại
  {
    id: "skip_verify",
    type: "habit",
    icon: "🔍",
    condition: (ctx) => ctx.skippedVerification,
    template: (ctx) => `${ctx.childName} làm xong là muốn cất vở ngay. ${ctx.Ho} hãy tập cho con thói quen đóng vai thám tử soát lỗi 30 giây trước khi nộp bài.`,
    action: "Đóng vai thám tử soát bài",
  },
  // 12. Buổi học diễn ra lúc tối muộn (giờ thật)
  {
    id: "late_evening",
    type: "schedule",
    icon: "🌙",
    condition: (ctx) => ctx.isLateEvening,
    template: (ctx) => `Buổi học diễn ra sau 21 giờ. ${ctx.childName} đã buồn ngủ rồi, ${ctx.ho} ưu tiên cho con ngủ sớm, mai làm nốt nhé.`,
    action: "Ngủ sớm",
  },
  // 13. Con giảng lại tốt — CHỈ khi thật sự có lượt giảng lại
  {
    id: "great_teach_back",
    type: "teach_back",
    icon: "🎓",
    condition: (ctx) => ctx.hasTeachBack && ctx.teachBackLevel === "self",
    template: (ctx) => `${ctx.childName} giảng lại rất mạch lạc. Con dạy lại được là con hiểu thật rồi!`,
    action: "Duy trì vai thầy cô giáo",
  },
  // 14. Con còn ngập ngừng khi giảng lại — CHỈ khi thật sự có lượt giảng lại
  {
    id: "guided_teach_back",
    type: "teach_back",
    icon: "🤝",
    condition: (ctx) => ctx.hasTeachBack && (ctx.teachBackLevel === "hint" || ctx.teachBackLevel === "guided"),
    template: (ctx) => ctx.whyExample
      ? `Khi giảng lại, ${ctx.childName} còn hơi ngập ngừng ở chỗ giải thích vì sao. ${ctx.Ho} chỉ cần hỏi nhẹ: "Vì sao chỗ này con lại ${ctx.whyExample} nhỉ?"`
      : `Khi giảng lại, ${ctx.childName} còn hơi ngập ngừng ở chỗ giải thích vì sao. ${ctx.Ho} chỉ cần hỏi nhẹ: "Vì sao ở bước này con lại chọn phép tính đó nhỉ?"`,
    action: "Hỏi câu gợi mở tại sao",
  },
  // 15. Khen cụ thể thay vì khen chung chung (lời khuyên chung)
  {
    id: "specific_praise",
    type: "parenting",
    icon: "💬",
    condition: () => true,
    template: (ctx) => `${ctx.Ho} nhớ khen cụ thể: "${ctx.Ho} thích cách con tập trung đếm từng que tính" thay vì chỉ nói "Con thông minh lắm" nha.`,
    action: "Khen nỗ lực cụ thể",
  },
  // 16. Tư thế ngồi học (buổi học dài hơn 15 phút, đo thật)
  {
    id: "posture",
    type: "health",
    icon: "🪑",
    condition: (ctx) => ctx.totalDurationMin !== null && ctx.totalDurationMin > 15,
    template: (ctx) => `Nhắc nhẹ ${ctx.childName} ngồi thẳng lưng, mắt cách mặt bàn một khoảng một khuỷu tay để bảo vệ cột sống và thị lực.`,
    action: "Chỉnh tư thế ngồi học",
  },
  // 17. Đổi vai khi không khí căng
  {
    id: "role_swap_tip",
    type: "fun",
    icon: "🎭",
    condition: (ctx) => ctx.calmClickCount > 0,
    template: (ctx) => `Nếu thấy không khí hơi căng, ${ctx.ho} thử giả vờ làm sai một phép tính đơn giản để con phát hiện và cười xoà nhé!`,
    action: "Giả vờ làm sai cho con sửa",
  },
  // 18. Chuỗi ngày học liên tiếp (số thật từ bộ đếm chuỗi)
  {
    id: "streak_praise",
    type: "habit",
    icon: "🔥",
    condition: (ctx) => ctx.streakDays >= 3,
    template: (ctx) => `${ctx.Ho} và ${ctx.childName} đã cùng nhau ngồi học ${ctx.streakDays} ngày liên tiếp. Thói quen bền bỉ này quý hơn điểm 10 nhiều.`,
    action: "Ăn mừng chuỗi học tập",
  },
  // 19. Đặt tên đồ vật ngộ nghĩnh (lời khuyên chung cho lớp 1–2)
  {
    id: "creative_names",
    type: "creativity",
    icon: "🎈",
    condition: (ctx) => ctx.isGrade1or2,
    template: (ctx) => `Với các phép tính có số tròn chục, ${ctx.ho} có thể gọi các bó que tính là "chiếc bè chở 10 bạn nhỏ" để con thấy vui mắt.`,
    action: "Nhân hoá bài toán",
  },
  // 20. Tôn trọng nhịp điệu riêng của con (lời khuyên chung)
  {
    id: "respect_rhythm",
    type: "mindset",
    icon: "❤️",
    condition: () => true,
    template: (ctx) => `Mỗi đứa trẻ có nhịp riêng. Sự kiên nhẫn hôm nay của ${ctx.ho} là món quà lớn đồng hành cùng ${ctx.childName}.`,
    action: "Kiên nhẫn đồng hành",
  },
];

const OP_WORDS = { '+': 'cộng', '-': 'trừ', '−': 'trừ', '–': 'trừ', '×': 'nhân', 'x': 'nhân', 'X': 'nhân', '*': 'nhân', ':': 'chia', '÷': 'chia', '/': 'chia' };

/**
 * Lấy một phép tính THẬT của bài vừa học (từ đáp án từng bậc hoặc đáp số cuối)
 * để làm câu ví dụ "Vì sao chỗ này con lại lấy 18 chia 3 nhỉ?". Không tìm thấy → '' (dùng câu chung).
 */
export function extractWhyExample(problem) {
  if (!problem || typeof problem !== 'object') return '';
  const sources = [];
  const steps = Array.isArray(problem.steps) ? problem.steps : (Array.isArray(problem.cac_bac) ? problem.cac_bac : []);
  // Ưu tiên bậc chọn phép tính, rồi các bậc khác, rồi đáp số cuối
  const ordered = [...steps].sort((a, b) => {
    const sa = (a?.ky_nang || a?.skill) === 'chon_phep_tinh' ? 0 : 1;
    const sb = (b?.ky_nang || b?.skill) === 'chon_phep_tinh' ? 0 : 1;
    return sa - sb;
  });
  for (const st of ordered) {
    sources.push(st?.answerForParent, st?.answer, st?.dap_an_cho_me);
  }
  sources.push(problem.answer, problem.dap_an_cuoi_cho_me);
  const re = /(\d+(?:[.,]\d+)?)\s*([+\-−–×xX*:÷/])\s*(\d+(?:[.,]\d+)?)/;
  for (const src of sources) {
    if (!src || typeof src !== 'string') continue;
    const m = src.match(re);
    if (m && OP_WORDS[m[2]]) {
      return `lấy ${m[1]} ${OP_WORDS[m[2]]} ${m[3]}`;
    }
  }
  return '';
}

/**
 * Trích xuất ngữ cảnh buổi học từ sessionData và các sự kiện UI.
 * Không có dữ liệu thì để null/false — tuyệt đối không điền số mặc định.
 */
export function extractSessionContext(sessionData = {}, child = {}, extra = {}) {
  const childName = child?.name || "Con";
  const ho = extra.ho || "bố mẹ";
  const Ho = ho.charAt(0).toUpperCase() + ho.slice(1);
  const steps = Array.isArray(sessionData.steps) ? sessionData.steps : [];

  // Thời gian mở đáp án từng bậc (giây) — chỉ có khi thật sự mở đáp án
  let quickRevealStep = 0;
  let quickRevealSec = 0;
  if (Array.isArray(extra.stepRevealTimes)) {
    for (let i = 0; i < extra.stepRevealTimes.length; i++) {
      const t = extra.stepRevealTimes[i];
      if (t > 0 && t < 30) {
        quickRevealStep = i + 1;
        quickRevealSec = Math.round(t);
        break;
      }
    }
  }

  const stuckAtStep1 = Boolean(steps[0] && (Number(steps[0].stuckCount) > 1 || steps[0].usedMicroStep));
  const rawDuration = extra.durationMinutes ?? sessionData.durationMinutes;
  const totalDurationMin = typeof rawDuration === 'number' && Number.isFinite(rawDuration) ? rawDuration : null;
  const calmClickCount = Number(extra.calmClickCount || 0);

  let selfSolvedHardStep = 0;
  steps.forEach((st, idx) => {
    if (idx >= 1 && st.selfSolved === true && st.revealedAnswer !== true && !(Number(st.stuckCount) > 0) && !st.usedMicroStep) {
      selfSolvedHardStep = idx + 1;
    }
  });

  const nowHour = typeof extra.nowHour === 'number' ? extra.nowHour : new Date().getHours();
  const isLateEvening = nowHour >= 21 && nowHour <= 23;
  const gradeNum = parseInt(String(child?.grade || "").replace(/\D/g, ""), 10) || 0;
  const stuckStep = steps.find((s) => Number(s.stuckCount) > 0 || s.usedMicroStep);

  return {
    childName,
    ho,
    Ho,
    quickRevealStep,
    quickRevealSec,
    stuckAtStep1,
    totalDurationMin,
    calmClickCount,
    selfSolvedHardStep,
    reReadProblem: Boolean(extra.reReadProblem),
    stuckSkill: extra.stuckSkill || (stuckStep ? stuckStep.skill : null),
    usedVisualHint: Boolean(extra.usedVisualHint),
    skippedVerification: Boolean(extra.skippedVerification),
    isLateEvening,
    hasTeachBack: Boolean(extra.hasTeachBack),
    teachBackLevel: extra.hasTeachBack ? (extra.teachBackLevel || null) : null,
    whyExample: extractWhyExample(extra.problem),
    hasBrotherProblem: Boolean(extra.hasBrotherProblem),
    streakDays: Number(extra.streakDays || 0),
    isGrade1or2: gradeNum > 0 && gradeNum <= 2,
  };
}

/**
 * Tính 2–3 lời khuyên phù hợp nhất cho người đang kèm
 */
export function computeCoachAdvice({ sessionData = {}, child = {}, extra = {} } = {}) {
  const ctx = extractSessionContext(sessionData, child, extra);
  const matched = [];

  for (const rule of COACH_ADVICE_LIBRARY) {
    try {
      if (rule.condition(ctx)) {
        matched.push({
          id: rule.id,
          type: rule.type,
          icon: rule.icon,
          message: rule.template(ctx),
          action: rule.action,
        });
      }
    } catch (_) {}
  }

  // Luôn trả về tối đa 3 gợi ý
  return matched.slice(0, 3);
}

/**
 * Kiểm tra xem mẹ có bật tính năng "Gấu góp ý cách kèm" trong Con tôi không
 */
let memoryCoachEnabled = true;

export function isCoachAdviceEnabled(child = {}) {
  // Mặc định bật, mẹ có thể tắt bằng cờ receiveCoachAdvice: false
  if (child && child.receiveCoachAdvice === false) return false;
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem("kch_coach_advice_enabled");
      if (raw !== null) return raw === "true";
    }
    return memoryCoachEnabled;
  } catch (_) {
    return memoryCoachEnabled;
  }
}

export function setCoachAdviceEnabled(enabled) {
  memoryCoachEnabled = Boolean(enabled);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("kch_coach_advice_enabled", enabled ? "true" : "false");
    }
  } catch (_) {}
}
