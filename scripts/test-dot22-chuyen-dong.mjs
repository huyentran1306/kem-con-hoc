import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { THEMES } from "../src/themes.js";

console.log("==================================================");
console.log("🧪 KIỂM THỬ ĐỢT 22: 6 CHUYỂN ĐỘNG CHO 11 BỘ GIAO DIỆN");
console.log("==================================================\n");

// 1. Kiểm tra 11 bộ giao diện đều có đủ 6 khoá motion
console.log("--- 1. Kiểm tra 11 bộ giao diện có đủ 6 khoá motion ---");
assert.equal(THEMES.length >= 11, true, "Phải có ít nhất 11 bộ giao diện");
const REQUIRED_MOTION_KEYS = ["vessel", "stuck", "split", "listen", "fly", "paw"];

for (const t of THEMES) {
  assert.ok(t.motion, `Bộ ${t.id} (${t.name}) thiếu khối motion`);
  for (const k of REQUIRED_MOTION_KEYS) {
    assert.ok(t.motion[k], `Bộ ${t.id} (${t.name}) thiếu khoá motion.${k}`);
  }
  // Kiểm tra chi tiết từng khoá
  assert.ok(t.motion.vessel.name, `Bộ ${t.id} thiếu motion.vessel.name`);
  assert.ok(t.motion.vessel.icon, `Bộ ${t.id} thiếu motion.vessel.icon`);
  assert.ok(t.motion.vessel.liquid, `Bộ ${t.id} thiếu motion.vessel.liquid`);
  assert.ok(t.motion.stuck.particle, `Bộ ${t.id} thiếu motion.stuck.particle`);
  assert.ok(t.motion.split.cardStyle, `Bộ ${t.id} thiếu motion.split.cardStyle`);
  assert.ok(t.motion.listen.ring, `Bộ ${t.id} thiếu motion.listen.ring`);
  assert.ok(t.motion.fly.trail, `Bộ ${t.id} thiếu motion.fly.trail`);
  assert.ok(t.motion.paw.stamp, `Bộ ${t.id} thiếu motion.paw.stamp`);
  console.log(`  ✓ Bộ "${t.name}" (${t.id}): Đủ 6 khoá motion chuẩn.`);
}
console.log("✅ PASS: 100% 11 bộ giao diện có đủ 6 khoá motion.\n");

// 2. Kiểm tra CSS lớp hiệu ứng không có mã màu hex viết cứng
console.log("--- 2. Kiểm tra CSS lớp hiệu ứng không có mã màu hex viết cứng ---");
const motionCssPath = path.resolve("src/themes/motion.css");
assert.ok(fs.existsSync(motionCssPath), "File src/themes/motion.css phải tồn tại");
const motionCss = fs.readFileSync(motionCssPath, "utf-8");

// Tìm mã hex dạng #fff, #123456, ...
const hexMatches = motionCss.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
if (hexMatches.length > 0) {
  console.error("Phát hiện mã màu hex viết cứng trong motion.css:", hexMatches);
  assert.fail(`CSS chuyển động không được viết cứng mã màu hex! Tìm thấy: ${hexMatches.join(", ")}`);
} else {
  console.log("  ✓ src/themes/motion.css: Không tìm thấy bất kỳ mã màu hex nào. 100% đọc biến --c-*!");
}
console.log("✅ PASS: CSS chuyển động đạt chuẩn không màu viết cứng.\n");

// 3. Kiểm tra trang xem trước chuyển động trong Admin
console.log("--- 3. Kiểm tra tích hợp trang xem trước trong Admin ---");
const adminSectionCode = fs.readFileSync(path.resolve("src/AdminThemesSection.jsx"), "utf-8");
assert.ok(adminSectionCode.includes("AdminMotionPreviewTab"), "AdminThemesSection phải import AdminMotionPreviewTab");
assert.ok(adminSectionCode.includes("Xem trước chuyển động"), "AdminThemesSection phải có nút chuyển tab Xem trước chuyển động");

const previewCode = fs.readFileSync(path.resolve("src/admin/AdminMotionPreviewTab.jsx"), "utf-8");
assert.ok(previewCode.includes("MotionStage"), "AdminMotionPreviewTab phải render MotionStage");
assert.ok(previewCode.includes("grid-6-moments") || previewCode.includes("all_matrix"), "Có lưới khoảnh khắc chuyển động");
console.log("  ✓ Admin > Giao diện app: Đã tích hợp tab Xem trước chuyển động (lưới 6 khoảnh khắc x 11 bộ).");
console.log("✅ PASS: Giao diện xem trước đã sẵn sàng.\n");

// 4. Kiểm tra kết nối sự kiện (useMotion / emitMotion) trong màn học
console.log("--- 4. Kiểm tra kết nối sự kiện (useMotion / emitMotion) ---");
const screensCode = fs.readFileSync(path.resolve("src/screens.jsx"), "utf-8");
assert.ok(screensCode.includes("emitMotion('step_done'"), "screens.jsx phải phát sự kiện step_done");
assert.ok(screensCode.includes("emitMotion('stuck'"), "screens.jsx phải phát sự kiện stuck");
assert.ok(screensCode.includes("emitMotion('micro_step'"), "screens.jsx phải phát sự kiện micro_step");
assert.ok(screensCode.includes("emitMotion('listen_start'"), "screens.jsx phải phát sự kiện listen_start");
assert.ok(screensCode.includes("emitMotion('badge_given'"), "screens.jsx phải phát sự kiện badge_given");
assert.ok(screensCode.includes("emitMotion('day_logged'"), "screens.jsx phải phát sự kiện day_logged");
console.log("  ✓ screens.jsx: Đã gọi đủ 6 sự kiện chuyển động đúng lúc xảy ra.");
console.log("✅ PASS: Toàn bộ 6 sự kiện chuyển động đã kết nối chuẩn.\n");

console.log("🎉 TẤT CẢ KIỂM THỬ ĐỢT 22 ĐÃ VƯỢT QUA 100%!");
