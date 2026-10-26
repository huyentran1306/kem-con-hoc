/**
 * Test Suite: Đợt 19 Chặng 2 - Gấu gợi ý huy hiệu theo việc con làm
 * 1. Unit test cho từng phẩm chất (Kiên nhẫn, Sáng tạo, Tập trung, Tỉ mỉ)
 * 2. Trường hợp nhiều phẩm chất cùng đạt (Tie-breaker cân bằng 2 tuần)
 * 3. Trường hợp không đạt cái nào (Fallback Kiên nhẫn)
 * 4. Câu lý do có số thật
 * 5. Mẹ hoặc con chọn huy hiệu khác được (source: chon_khac)
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import { computeSuggestedBadge, TRAIT_COLORS, TRAIT_ICONS } from "../src/badgeRules.js";

async function runTests() {
  console.log("🚀 Bắt đầu kiểm thử Đợt 19 Chặng 2 (Gấu gợi ý huy hiệu)...");

  // 1. Kiểm tra 4 màu cố định và icon chuẩn
  assert.equal(TRAIT_COLORS["Kiên nhẫn"], "#2a78d6");
  assert.equal(TRAIT_COLORS["Sáng tạo"], "#eb6834");
  assert.equal(TRAIT_COLORS["Tập trung"], "#1baf7a");
  assert.equal(TRAIT_COLORS["Tỉ mỉ"], "#eda100");
  assert.equal(TRAIT_ICONS["Kiên nhẫn"], "🐢");
  assert.equal(TRAIT_ICONS["Sáng tạo"], "💡");
  assert.equal(TRAIT_ICONS["Tập trung"], "🎯");
  assert.equal(TRAIT_ICONS["Tỉ mỉ"], "🔍");
  console.log("✅ 1. Bảng màu cố định & icon phẩm chất chính xác tuyệt đối");

  // 2. Unit test: 🐢 Kiên nhẫn
  // Ca A: Bấm chưa nghĩ ra 2 lần ở bậc 2 rồi tự làm được
  const resPatience = computeSuggestedBadge({
    childName: "Mít",
    sessionData: {
      steps: [
        { stepNo: 1, stuckCount: 0, selfSolved: true, revealedAnswer: false },
        { stepNo: 2, stuckCount: 2, selfSolved: true, revealedAnswer: false },
        { stepNo: 3, stuckCount: 0, selfSolved: true, revealedAnswer: false }
      ],
      durationMinutes: 25 // > 20 để không kích hoạt Tập trung
    }
  });
  assert.equal(resPatience.trait, "Kiên nhẫn");
  assert.equal(resPatience.icon, "🐢");
  assert.equal(resPatience.reason.includes("chưa nghĩ ra"), true);
  assert.equal(resPatience.reason.includes("2 lần"), true);
  assert.equal(resPatience.reason.includes("bậc 2"), true);
  console.log("✅ 2. Kiên nhẫn kích hoạt chuẩn khi bấm chưa nghĩ ra và tự làm được");

  // 3. Unit test: 💡 Sáng tạo
  // Ca B: Con giảng lại có cách làm riêng
  const resCreative = computeSuggestedBadge({
    childName: "Bé Na",
    sessionData: {
      teachBackOwnWay: true,
      durationMinutes: 25
    }
  });
  assert.equal(resCreative.trait, "Sáng tạo");
  assert.equal(resCreative.icon, "💡");
  assert.equal(resCreative.reason.includes("cách giải độc đáo"), true);

  // Ca B2: Làm bài anh em
  const resBro = computeSuggestedBadge({
    childName: "Mít",
    sessionData: {
      didBrotherProblem: true,
      durationMinutes: 25
    }
  });
  assert.equal(resBro.trait, "Sáng tạo");
  assert.equal(resBro.reason.includes("bài anh em"), true);
  console.log("✅ 3. Sáng tạo kích hoạt chuẩn khi giảng lại cách riêng hoặc làm bài anh em");

  // 4. Unit test: 🎯 Tập trung
  // Xong cả bài trong <= 20 phút, không rời app quá 2 phút, các bậc liền mạch
  const resFocus = computeSuggestedBadge({
    childName: "Mít",
    sessionData: {
      steps: [
        { stepNo: 1, stuckCount: 0, selfSolved: true },
        { stepNo: 2, stuckCount: 0, selfSolved: true }
      ],
      durationMinutes: 12,
      maxInactivityMinutes: 1,
      stepsSeamless: true
    }
  });
  assert.equal(resFocus.trait, "Tập trung");
  assert.equal(resFocus.icon, "🎯");
  assert.equal(resFocus.reason.includes("12 phút"), true);
  console.log("✅ 4. Tập trung kích hoạt chuẩn khi hoàn thành <= 20 phút liền mạch");

  // 5. Unit test: 🔍 Tỉ mỉ
  // Bậc kiểm tra lại hoặc đơn vị tự làm
  const resPrecision = computeSuggestedBadge({
    childName: "Mít",
    sessionData: {
      steps: [
        { stepNo: 1, skill: "kiem_tra_lai", selfSolved: true, revealedAnswer: false }
      ],
      durationMinutes: 25
    }
  });
  assert.equal(resPrecision.trait, "Tỉ mỉ");
  assert.equal(resPrecision.icon, "🔍");
  assert.equal(resPrecision.reason.includes("kiểm tra lại"), true);
  console.log("✅ 5. Tỉ mỉ kích hoạt chuẩn khi tự làm bậc kiểm tra lại / đơn vị");

  // 6. Tie-breaker: Nhiều phẩm chất cùng đạt -> lấy cái con ít nhận nhất trong 2 tuần
  // Giả sử cùng đạt cả Kiên nhẫn, Sáng tạo, Tập trung
  // Lịch sử 2 tuần: Kiên nhẫn 5 lần, Sáng tạo 4 lần, Tập trung 1 lần
  const resTieBreak = computeSuggestedBadge({
    childName: "Mít",
    sessionData: {
      steps: [
        { stepNo: 1, stuckCount: 1, selfSolved: true, revealedAnswer: false } // Kiên nhẫn
      ],
      teachBackOwnWay: true, // Sáng tạo
      durationMinutes: 15, // Tập trung
      maxInactivityMinutes: 0,
      stepsSeamless: true
    },
    recentBadges2Weeks: [
      "Kiên nhẫn", "Kiên nhẫn", "Kiên nhẫn", "Kiên nhẫn", "Kiên nhẫn",
      "Sáng tạo", "Sáng tạo", "Sáng tạo", "Sáng tạo",
      "Tập trung"
    ]
  });
  // Tập trung chỉ có 1 lần (ít nhất) -> phải chọn Tập trung
  assert.equal(resTieBreak.trait, "Tập trung", "Tie-breaker phải chọn phẩm chất con ít nhận nhất (Tập trung)");
  console.log("✅ 6. Tie-breaker chọn chính xác phẩm chất ít nhận nhất trong 2 tuần");

  // 7. Fallback: Không đạt cái nào -> Kiên nhẫn ("Mít đã ngồi học hết bài")
  const resFallback = computeSuggestedBadge({
    childName: "Mít",
    sessionData: {
      steps: [
        { stepNo: 1, stuckCount: 0, selfSolved: false, revealedAnswer: true } // Mẹ mở đáp án
      ],
      durationMinutes: 35 // Quá 20 phút
    }
  });
  assert.equal(resFallback.trait, "Kiên nhẫn");
  assert.equal(resFallback.isFallback, true);
  assert.equal(resFallback.reason, "Mít đã ngồi học hết bài.");
  console.log("✅ 7. Fallback an toàn: gợi ý Kiên nhẫn với lý do đã ngồi học hết bài");

  // 8. Kiểm tra giao diện Done screen có thẻ Gợi ý và nút chọn khác
  const screensCode = fs.readFileSync("src/screens.jsx", "utf8");
  assert.equal(screensCode.includes("GẤU GỢI Ý HUY HIỆU"), true);
  assert.equal(screensCode.includes("HOẶC CHỌN HUY HIỆU KHÁC"), true);
  assert.equal(screensCode.includes("data-testid=\"card-suggested-badge\""), true);
  assert.equal(screensCode.includes("btn-grant-suggested-badge"), true);
  console.log("✅ 8. screens.jsx có đầy đủ thẻ Gấu gợi ý huy hiệu và nút chọn khác");

  console.log("\n🎉 TẤT CẢ KIỂM THỬ ĐỢT 19 CHẶNG 2 ĐÃ VƯỢT QUA 100%!");
}

runTests().catch(err => {
  console.error("❌ Kiểm thử thất bại:", err);
  process.exit(1);
});
