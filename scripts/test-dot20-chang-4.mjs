/**
 * scripts/test-dot20-chang-4.mjs
 * Kiểm tra toàn diện Đợt 20 · Chặng 4: Gấu góp ý cách kèm (0 token)
 */
import assert from "node:assert";
import fs from "node:fs";
import { COACH_ADVICE_LIBRARY, computeCoachAdvice, isCoachAdviceEnabled, setCoachAdviceEnabled } from "../src/coachRules.js";

console.log("===============================================================");
console.log("🧪 BẮT ĐẦU KIỂM THỬ ĐỢT 20 · CHẶNG 4: GẤU GÓP Ý CÁCH KÈM");
console.log("===============================================================");

// 1. Kiểm tra số lượng quy tắc sư phạm trong thư viện
console.log("1. Kiểm tra thư viện quy tắc sư phạm COACH_ADVICE_LIBRARY:");
console.log(`   - Tổng số quy tắc có sẵn: ${COACH_ADVICE_LIBRARY.length}`);
assert.ok(COACH_ADVICE_LIBRARY.length >= 20, `Thư viện phải có ít nhất 20 quy tắc (hiện có: ${COACH_ADVICE_LIBRARY.length})`);
console.log("   -> ĐẠT: Đủ 20 quy tắc sư phạm chuẩn mực bằng code JavaScript thuần.");

// 2. Kiểm tra tính toán kịch bản mở đáp án quá nhanh (< 30s)
console.log("2. Kiểm định kịch bản mẹ mở đáp án bậc 1 sau 18 giây:");
const advice1 = computeCoachAdvice({
  child: { name: "Bé An", grade: "Lớp 3" },
  sessionData: { steps: [{ stepNo: 1 }] },
  extra: { stepRevealTimes: [18], durationMinutes: 10 }
});
console.log("   - Lời khuyên sinh ra:", advice1[0]?.message);
assert.ok(advice1.some(a => a.id === "quick_reveal"), "Phải kích hoạt quy tắc quick_reveal");
assert.ok(advice1[0].message.includes("18 giây"), "Phải điền số thật 18 giây vào câu nhắc");
console.log("   -> ĐẠT: Kích hoạt chính xác quy tắc mở đáp án sớm và điền số thực.");

// 3. Kiểm định kịch bản mẹ bấm Mẹ bình tĩnh 2 lần
console.log("3. Kiểm định kịch bản mẹ bấm Mẹ bình tĩnh 2 lần:");
const advice2 = computeCoachAdvice({
  child: { name: "Bé Minh", grade: "Lớp 2" },
  sessionData: { steps: [] },
  extra: { calmClickCount: 2, durationMinutes: 14 }
});
const calmAdvice = advice2.find(a => a.id === "calm_used");
assert.ok(calmAdvice, "Phải có lời khen kiềm chế cảm xúc calm_used");
assert.ok(calmAdvice.message.includes("2 lần"), "Phải điền đúng 2 lần mẹ dừng lại hạ hoả");
console.log("   - Lời khuyên sinh ra:", calmAdvice.message);
console.log("   -> ĐẠT: Ghi nhận sự kiên nhẫn của mẹ khi dùng tính năng hạ hoả.");

// 4. Kiểm định kịch bản buổi học dài (> 30 phút)
console.log("4. Kiểm định kịch bản buổi học dài 35 phút:");
const advice3 = computeCoachAdvice({
  child: { name: "Bé Hoa", grade: "Lớp 4" },
  sessionData: { steps: [] },
  extra: { durationMinutes: 35 }
});
const restAdvice = advice3.find(a => a.id === "long_session");
assert.ok(restAdvice, "Phải nhắc nghỉ ngơi khi học trên 30 phút");
console.log("   - Lời khuyên sinh ra:", restAdvice.message);
console.log("   -> ĐẠT: Nhắc nhở sức khoẻ và thời gian học hợp lý.");

// 5. Kiểm tra quyền bật/tắt của mẹ trong trang Con tôi
console.log("5. Kiểm tra công tắc bật/tắt trong Con tôi:");
setCoachAdviceEnabled(true);
assert.strictEqual(isCoachAdviceEnabled({}), true, "Mặc định bật lời khuyên");
setCoachAdviceEnabled(false);
assert.strictEqual(isCoachAdviceEnabled({}), false, "Tắt lời khuyên thành công");
setCoachAdviceEnabled(true); // reset back
assert.strictEqual(isCoachAdviceEnabled({ receiveCoachAdvice: false }), false, "Tôn trọng cờ tắt của riêng từng bé");
console.log("   -> ĐẠT: Mẹ có thể chủ động tắt tính năng bất cứ lúc nào.");

// 6. Kiểm tra giao diện màn Done
console.log("6. Kiểm tra giao diện Done (chỉ mẹ thấy, gấp mở được):");
const screensCode = fs.readFileSync("src/screens.jsx", "utf8");
assert.ok(screensCode.includes("data-testid=\"coach-advice-card\""), "Phải có card Gấu góp ý cách kèm trên màn Done");
assert.ok(screensCode.includes("isCoachOpen"), "Card có thể thu gọn / mở rộng");
assert.ok(screensCode.includes("Nhận lời khuyên cách kèm"), "Trang Con tôi có checkbox bật/tắt");
console.log("   -> ĐẠT: Giao diện tinh tế, bảo vệ tâm lý con khi ngồi cạnh mẹ.");

console.log("===============================================================");
console.log("🎉 TẤT CẢ CÁC BÀI KIỂM THỬ ĐỢT 20 · CHẶNG 4 ĐÃ VƯỢT QUA 100%!");
console.log("===============================================================");
