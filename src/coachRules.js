/**
 * src/coachRules.js — Gấu góp ý cách kèm (Đợt 20 · Chặng 4)
 * Hoàn toàn bằng code JavaScript từ learning_events và thời gian từng bậc.
 * Tiêu tốn 0 token AI. Chỉ mẹ thấy, tắt được trong trang Con tôi.
 */

export const COACH_ADVICE_LIBRARY = [
  // 1. Mở đáp án quá nhanh (< 30 giây)
  {
    id: "quick_reveal",
    type: "pacing",
    icon: "⏳",
    condition: (ctx) => ctx.quickRevealStep > 0,
    template: (ctx) => `Mẹ mở đáp án ở bậc ${ctx.quickRevealStep} chỉ sau ${ctx.quickRevealSec} giây. Lần sau mẹ thử đếm thầm 45 giây để ${ctx.childName} có thêm thời gian tự xoay sở nhé!`,
    action: "Cho con thêm thời gian chờ",
  },
  // 2. Kẹt ở bậc 1 nhiều lần
  {
    id: "stuck_step_1",
    type: "manipulatives",
    icon: "🍬",
    condition: (ctx) => ctx.stuckAtStep1,
    template: (ctx) => `${ctx.childName} dừng lại ở bậc 1 khá lâu. Lần tới mẹ lấy ngay 15 chiếc kẹo hoặc que tính thật ra bàn cho con sờ nắm, con sẽ bắt nhịp nhanh hơn nhiều đấy!`,
    action: "Dùng đồ vật thật ngay đầu buổi",
  },
  // 3. Hoàn thành nhanh (< 5 phút)
  {
    id: "fast_session",
    type: "challenge",
    icon: "🚀",
    condition: (ctx) => ctx.totalDurationMin > 0 && ctx.totalDurationMin < 5,
    template: (ctx) => `Buổi học hôm nay chỉ mất ${ctx.totalDurationMin} phút và ${ctx.childName} rất tập trung! Mẹ có thể cho con thử sức ngay với bài anh em để nhân đôi sự hào hứng nhé.`,
    action: "Thử thêm bài anh em",
  },
  // 4. Buổi học kéo dài (> 30 phút)
  {
    id: "long_session",
    type: "rest",
    icon: "🍵",
    condition: (ctx) => ctx.totalDurationMin >= 30,
    template: (ctx) => `Buổi học kéo dài ${ctx.totalDurationMin} phút rồi. Não của ${ctx.childName} và mẹ đều cần nạp năng lượng. Mẹ và con cùng uống cốc nước ấm rồi nghỉ ngơi nhé!`,
    action: "Nghỉ ngơi và uống nước",
  },
  // 5. Mẹ bấm Mẹ bình tĩnh
  {
    id: "calm_used",
    type: "emotion",
    icon: "🌱",
    condition: (ctx) => ctx.calmClickCount >= 1,
    template: (ctx) => `Mẹ đã chủ động dừng lại hạ hoả ${ctx.calmClickCount} lần trong buổi học. Đây là kỹ năng đồng hành tuyệt vời, giúp bảo vệ tối đa sự tự tin cho ${ctx.childName}!`,
    action: "Ghi nhận sự kiên nhẫn của mẹ",
  },
  // 6. Con tự giải quyết được bậc khó
  {
    id: "self_solved_hard",
    type: "praise",
    icon: "🌟",
    condition: (ctx) => ctx.selfSolvedHardStep > 0,
    template: (ctx) => `${ctx.childName} đã tự mình nghĩ ra bậc ${ctx.selfSolvedHardStep} mà không cần xem đáp án. Mẹ nhớ ôm con và khen con kiên trì nhé!`,
    action: "Khen ngợi nỗ lực tự thân",
  },
  // 7. Hỏi lại đề bài nhiều lần
  {
    id: "read_problem_again",
    type: "comprehension",
    icon: "📖",
    condition: (ctx) => ctx.reReadProblem,
    template: (ctx) => `${ctx.childName} phải đọc lại đề bài nhiều lần. Mẹ có thể cho con dùng bút chì gạch chân dưới các con số trước khi bắt đầu giải.`,
    action: "Gạch chân dữ liệu đề bài",
  },
  // 8. Kẹt ở kỹ năng tính toán
  {
    id: "calc_stuck",
    type: "skill",
    icon: "🧮",
    condition: (ctx) => ctx.stuckSkill === "tinh_toan",
    template: (ctx) => `${ctx.childName} hơi lúng túng ở khâu tính nhẩm. Mẹ thử rủ con chơi trò đố nhẩm cộng trừ 5 phút trước giờ cơm tối nhé.`,
    action: "Luyện tính nhẩm 5 phút",
  },
  // 9. Kẹt ở kỹ năng chọn phép tính
  {
    id: "choose_op_stuck",
    type: "skill",
    icon: "⚖️",
    condition: (ctx) => ctx.stuckSkill === "chon_phep_tinh",
    template: (ctx) => `Con chưa phân biệt được lúc nào cộng lúc nào trừ. Mẹ hãy dùng từ khoá thực tế: "cho thêm" là cộng, "bớt đi/cho bạn" là trừ.`,
    action: "Gắn từ khoá vào hành động thật",
  },
  // 10. Con làm được sau khi xem hình vẽ
  {
    id: "visual_learner",
    type: "learning_style",
    icon: "🎨",
    condition: (ctx) => ctx.usedVisualHint,
    template: (ctx) => `${ctx.childName} hiểu bài rất nhanh khi mẹ vẽ sơ đồ hình tròn. Bé có thiên hướng học qua hình ảnh (Visual Learner) đấy mẹ ạ!`,
    action: "Ưu tiên vẽ sơ đồ đoạn thẳng",
  },
  // 11. Bỏ qua bước kiểm tra lại
  {
    id: "skip_verify",
    type: "habit",
    icon: "🔍",
    condition: (ctx) => ctx.skippedVerification,
    template: (ctx) => `${ctx.childName} làm xong là muốn cất vở ngay. Mẹ hãy tập cho con thói quen đóng vai thám tử tìm lỗi sai 30 giây trước khi nộp bài.`,
    action: "Đóng vai thám tử soát bài",
  },
  // 12. Buổi học diễn ra lúc tối muộn
  {
    id: "late_evening",
    type: "schedule",
    icon: "🌙",
    condition: (ctx) => ctx.isLateEvening,
    template: (ctx) => `Buổi học diễn ra sau 21h30. Cơ thể ${ctx.childName} bắt đầu tiết hormone buồn ngủ, mẹ ưu tiên cho con ngủ sớm, mai làm nốt nhé.`,
    action: "Ngủ sớm bảo vệ sức khoẻ",
  },
  // 13. Con dạy lại mẹ rất tự tin
  {
    id: "great_teach_back",
    type: "teach_back",
    icon: "🎓",
    condition: (ctx) => ctx.teachBackLevel === "self",
    template: (ctx) => `Khi đóng vai cô giáo giảng lại, ${ctx.childName} nói rất trôi chảy và mạch lạc. Đây là cách học sâu Feynmann đỉnh cao nhất!`,
    action: "Duy trì vai thầy cô giáo",
  },
  // 14. Con còn ngập ngừng khi giảng lại
  {
    id: "guided_teach_back",
    type: "teach_back",
    icon: "🤝",
    condition: (ctx) => ctx.teachBackLevel === "hint" || ctx.teachBackLevel === "guided",
    template: (ctx) => `Khi giảng lại, con còn hơi ngập ngừng ở bước giải thích vì sao. Mẹ chỉ cần hỏi nhẹ: "Vì sao chỗ này con lại lấy số 15 trừ đi 6 nhỉ?"`,
    action: "Hỏi câu gợi mở tại sao",
  },
  // 15. Khen cụ thể thay vì khen chung chung
  {
    id: "specific_praise",
    type: "parenting",
    icon: "💬",
    condition: (ctx) => true, // default good tip
    template: (ctx) => `Mẹ nhớ khen cụ thể: "Mẹ thích cách con tập trung đếm từng que tính" thay vì chỉ nói "Con thông minh lắm" nha.`,
    action: "Khen nỗ lực cụ thể",
  },
  // 16. Giữ tư thế ngồi học đúng
  {
    id: "posture",
    type: "health",
    icon: "🪑",
    condition: (ctx) => ctx.totalDurationMin > 15,
    template: (ctx) => `Nhắc nhẹ ${ctx.childName} ngồi thẳng lưng, mắt cách mặt bàn một khoảng một khuỷu tay để bảo vệ cột sống và thị lực.`,
    action: "Chỉnh tư thế ngồi học",
  },
  // 17. Đổi vai khi con căng thẳng
  {
    id: "role_swap_tip",
    type: "fun",
    icon: "🎭",
    condition: (ctx) => ctx.calmClickCount > 0,
    template: (ctx) => `Nếu thấy không khí hơi căng, mẹ thử giả vờ làm sai một phép tính đơn giản để con phát hiện và cười xoà giải toả nhé!`,
    action: "Mẹ giả vờ làm sai cho con sửa",
  },
  // 18. Ghi nhận ngày học liên tiếp
  {
    id: "streak_praise",
    type: "habit",
    icon: "🔥",
    condition: (ctx) => ctx.streakDays >= 3,
    template: (ctx) => `Tuyệt vời! Hai mẹ con đã cùng nhau ngồi học ${ctx.streakDays} ngày liên tiếp. Thói quen bền bỉ này quý hơn điểm 10 nhiều.`,
    action: "Ăn mừng chuỗi học tập",
  },
  // 19. Đặt tên đồ vật ngộ nghĩnh
  {
    id: "creative_names",
    type: "creativity",
    icon: "🎈",
    condition: (ctx) => ctx.isGrade1or2,
    template: (ctx) => `Với các phép tính có số tròn chục, mẹ có thể gọi các bó que tính là "chiếc bè chở 10 bạn nhỏ" để con thấy vui mắt.`,
    action: "Nhân hoá bài toán",
  },
  // 20. Tôn trọng nhịp điệu riêng của con
  {
    id: "respect_rhythm",
    type: "mindset",
    icon: "❤️",
    condition: (ctx) => true,
    template: (ctx) => `Mỗi đứa trẻ là một bông hoa nở vào thời khắc riêng. Sự kiên nhẫn hôm nay của mẹ là món quà vô giá đồng hành cùng ${ctx.childName} suốt đời.`,
    action: "Kiên nhẫn đồng hành",
  },
];

/**
 * Trích xuất ngữ cảnh buổi học từ sessionData và các sự kiện UI
 */
export function extractSessionContext(sessionData = {}, child = {}, extra = {}) {
  const childName = child?.name || "Bé";
  const steps = sessionData.steps || [];
  
  // Thời gian mở đáp án từng bậc (giây)
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

  const stuckAtStep1 = Boolean(steps[0]?.stuckCount > 1 || steps[0]?.usedStuck);
  const totalDurationMin = Number(extra.durationMinutes || sessionData.durationMinutes || 12);
  const calmClickCount = Number(extra.calmClickCount || 0);

  let selfSolvedHardStep = 0;
  steps.forEach((st, idx) => {
    if (st.selfSolved && idx >= 1) selfSolvedHardStep = idx + 1;
  });

  const nowHour = new Date().getHours();
  const isLateEvening = nowHour >= 21 && nowHour <= 23;
  const gradeNum = parseInt(String(child?.grade || "3").replace(/\D/g, ""), 10) || 3;

  return {
    childName,
    quickRevealStep,
    quickRevealSec,
    stuckAtStep1,
    totalDurationMin,
    calmClickCount,
    selfSolvedHardStep,
    reReadProblem: Boolean(extra.reReadProblem),
    stuckSkill: extra.stuckSkill || (steps.find(s => s.stuckCount > 0)?.skill || "tinh_toan"),
    usedVisualHint: Boolean(extra.usedVisualHint),
    skippedVerification: Boolean(extra.skippedVerification),
    isLateEvening,
    teachBackLevel: extra.teachBackLevel || (sessionData.teachBackOwnWay ? "self" : "guided"),
    streakDays: Number(extra.streakDays || 3),
    isGrade1or2: gradeNum <= 2,
  };
}

/**
 * Tính toán 2-3 lời khuyên phù hợp nhất cho mẹ
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

  // Luôn trả về từ 2 đến 3 gợi ý tinh gọn nhất
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
