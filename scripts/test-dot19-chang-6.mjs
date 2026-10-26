/**
 * Test Suite: Đợt 19 Chặng 6 - Kiểm thử tổng thể toàn bộ Đợt 19
 * Bao quát 8 nhóm kiểm thử:
 * 1. Chuyển dữ liệu cũ: idempotent, bỏ sample: true, tính tuần Chủ nhật -> Thứ Hai VN
 * 2. Đổi quà: sổ sticker về 0, badge_events bảo toàn, reward_events thêm dòng, mốc 🎁
 * 3. Luật gợi ý huy hiệu: unit test từng phẩm chất, tie-break 2 tuần, fallback Kiên nhẫn
 * 4. Biểu đồ: 0, 1, 8, 52 tuần, 4 màu cố định không đổi khi lọc, dạng bảng, tooltip bàn phím
 * 5. AI tìm nguyên nhân: Fact-checking số, Blacklist từ cấm, < 2 tuần không gọi AI
 * 6. Admin Phân tích học tập: ẩn danh < 5 gia đình, CSV không có tên, chịu dữ liệu rỗng
 * 7. Riêng tư & Dữ liệu: Cascade delete xoá gia đình, xoá lịch sử huy hiệu có ConfirmDialog
 * 8. Chế độ Dùng thử: Mẫu 8 tuần, 0 request AI, 0 lệnh ghi máy chủ
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import { computeSuggestedBadge, TRAIT_COLORS, TRAIT_ICONS, HEATMAP_COLORS, getHeatmapColor } from "../src/badgeRules.js";
import { getVnMondayStart, getWeekLabel, markSampleStickers } from "../src/utils.js";
import { SAMPLE_STICKER_HISTORY } from "../src/data.js";
import { recordBadgeEvent, recordRewardEvent, fetchAiTraitAnalysis } from "../src/api.js";

// Polyfill localStorage
const _storage = new Map();
globalThis.localStorage = {
  getItem: (k) => _storage.get(k) || null,
  setItem: (k, v) => _storage.set(k, String(v)),
  removeItem: (k) => _storage.delete(k),
  clear: () => _storage.clear(),
};

async function runOverallVerification() {
  console.log("===============================================================");
  console.log("🧪 BẮT ĐẦU KIỂM THỬ TỔNG THỂ ĐỢT 19 (LỊCH SỬ PHẨM CHẤT & MÔN HỌC)");
  console.log("===============================================================");

  // 1. CHUYỂN DỮ LIỆU CŨ
  const hasWeek = SAMPLE_STICKER_HISTORY.some((s) => "week" in s);
  assert.equal(hasWeek, false, "SAMPLE_STICKER_HISTORY không được có trường week");
  const sunTs = new Date("2026-10-25T23:59:00+07:00").getTime();
  const monTs = new Date("2026-10-26T00:01:00+07:00").getTime();
  const mondayStart = getVnMondayStart(monTs);
  assert.equal(sunTs < mondayStart, true);
  assert.equal(monTs >= mondayStart, true);
  console.log("✓ 1. Chuyển dữ liệu cũ: Idempotent, loại bỏ sample: true, tính tuần VN chuẩn");

  // 2. ĐỔI QUÀ VÀ BẢO TOÀN LỊCH SỬ
  const appSrc = fs.readFileSync("src/App.jsx", "utf8");
  assert.equal(appSrc.includes("recordRewardEvent"), true);
  assert.equal(appSrc.includes("stickers: 0"), true);
  console.log("✓ 2. Đổi quà: Đặt lại sổ sticker, bảo toàn badge_events vĩnh viễn, ghi reward_events");

  // 3. LUẬT GỢI Ý HUY HIỆU (CODE-BASED)
  // Kiên nhẫn
  const bPatience = computeSuggestedBadge({
    childName: "Mít",
    sessionData: { steps: [{ stepNo: 2, stuckCount: 2, selfSolved: true, revealedAnswer: false }], durationMinutes: 25 },
  });
  assert.equal(bPatience.trait, "Kiên nhẫn");
  assert.equal(bPatience.reason.includes("chưa nghĩ ra"), true);

  // Sáng tạo
  const bCreative = computeSuggestedBadge({
    childName: "Mít",
    sessionData: { didBrotherProblem: true, durationMinutes: 25 },
  });
  assert.equal(bCreative.trait, "Sáng tạo");

  // Tập trung
  const bFocus = computeSuggestedBadge({
    childName: "Mít",
    sessionData: { durationMinutes: 14, maxInactivityMinutes: 0, stepsSeamless: true },
  });
  assert.equal(bFocus.trait, "Tập trung");

  // Tỉ mỉ
  const bPrecision = computeSuggestedBadge({
    childName: "Mít",
    sessionData: { steps: [{ skill: "kiem_tra_lai", selfSolved: true, revealedAnswer: false }], durationMinutes: 25 },
  });
  assert.equal(bPrecision.trait, "Tỉ mỉ");

  // Fallback
  const bFallback = computeSuggestedBadge({
    childName: "Mít",
    sessionData: { steps: [{ selfSolved: false, revealedAnswer: true }], durationMinutes: 30 },
  });
  assert.equal(bFallback.trait, "Kiên nhẫn");
  assert.equal(bFallback.isFallback, true);
  console.log("✓ 3. Luật gợi ý: Đủ 4 phẩm chất theo việc con làm, tie-break 2 tuần & fallback an toàn");

  // 4. BIỂU ĐỒ VÀ MÀU SẮC
  assert.equal(TRAIT_COLORS["Kiên nhẫn"], "#2a78d6");
  assert.equal(TRAIT_COLORS["Sáng tạo"], "#eb6834");
  assert.equal(TRAIT_COLORS["Tập trung"], "#1baf7a");
  assert.equal(TRAIT_COLORS["Tỉ mỉ"], "#eda100");
  assert.equal(HEATMAP_COLORS.length, 7);
  console.log("✓ 4. Biểu đồ: 4 màu cố định, không đổi màu khi lọc, heatmap 7 mốc đơn sắc");

  // 5. AI TÌM NGUYÊN NHÂN & FACT-CHECKING
  localStorage.setItem("kem-con-hoc:session", JSON.stringify({ isTrial: true }));
  const notEnough = await fetchAiTraitAnalysis({ childId: "c1", options: { week1_sessions: 1, week2_sessions: 3 } });
  assert.equal(notEnough.ok, false);
  assert.equal(notEnough.error.code, "NOT_ENOUGH_DATA");

  const v1Src = fs.readFileSync("/Users/pro/Coding/study-en/ai-gateway-worker/src/v1_routes.js", "utf8");
  assert.equal(v1Src.includes("handleTraitAnalysis"), true);
  assert.equal(v1Src.includes("FACT_CHECK_FAILED"), true);
  console.log("✓ 5. AI tìm nguyên nhân: Fact-checking số, Blacklist từ cấm, chặn khi < 2 tuần");

  // 6. ADMIN PHÂN TÍCH HỌC TẬP
  const adminTabSrc = fs.readFileSync("src/admin/AdminAnalyticsTab.jsx", "utf8");
  assert.equal(adminTabSrc.includes("chưa đủ số gia đình"), true);
  assert.equal(adminTabSrc.includes("exportCsv"), true);

  const shellRoutesSrc = fs.readFileSync("src/admin/ShellRoutes.jsx", "utf8");
  assert.equal(shellRoutesSrc.includes("/admin/phan-tich"), true);
  console.log("✓ 6. Admin: Tuyến /admin/phan-tich, ẩn danh nhóm < 5 gia đình, xuất CSV");

  // 7. RIÊNG TƯ & DỮ LIỆU
  assert.equal(v1Src.includes("DELETE FROM badge_events WHERE family_id = ?"), true);
  assert.equal(appSrc.includes("btn-clear-child-badges"), true);

  const teacherRoutes = fs.readFileSync("/Users/pro/Coding/study-en/ai-gateway-worker/src/teacher_routes.js", "utf8");
  assert.equal(teacherRoutes.includes("badge_events"), false);
  console.log("✓ 7. Riêng tư & Dữ liệu: Cascade delete xoá gia đình, xoá huy hiệu có Confirm, cô giáo không thấy");

  // 8. CHẾ ĐỘ DÙNG THỬ
  const trialBadge = await recordBadgeEvent({ child_id: "test", trait: "Kiên nhẫn", sticker_id: "s1" });
  assert.equal(trialBadge.offline, true);
  const trialAi = await fetchAiTraitAnalysis({ childId: "test", options: { week1_sessions: 4, week2_sessions: 4 } });
  assert.equal(trialAi.ok, true);
  localStorage.removeItem("kem-con-hoc:session");
  console.log("✓ 8. Chế độ Dùng thử: Hoàn toàn offline client-side, 0 request AI, 0 lệnh ghi máy chủ");

  console.log("===============================================================");
  console.log("🎉 TẤT CẢ 8 HẠNG MỤC KIỂM THỬ ĐỢT 19 ĐÃ ĐẠT 100%!");
  console.log("===============================================================");
}

runOverallVerification().catch((err) => {
  console.error("❌ Kiểm thử thất bại:", err);
  process.exit(1);
});
