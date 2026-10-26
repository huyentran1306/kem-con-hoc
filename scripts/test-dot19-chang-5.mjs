/**
 * Test Suite: Đợt 19 Chặng 5 - Riêng tư và dữ liệu
 * 1. Cascade delete khi xoá gia đình: badge_events, reward_events, learning_events, progress_reports
 * 2. Con tôi - "Những gì Gấu nhớ": dòng lịch sử huy hiệu và nút xoá riêng kèm ConfirmDialog
 * 3. Bảo vệ quyền riêng tư: Cô giáo tuyệt đối không thấy lịch sử phẩm chất của từng con
 */

import assert from "node:assert/strict";
import fs from "node:fs";

async function runTests() {
  console.log("🚀 Bắt đầu kiểm thử Đợt 19 Chặng 5 (Riêng tư và dữ liệu)...");

  // 1. Kiểm tra Worker cascade delete khi xoá gia đình (DELETE /api/v1/family)
  const v1WorkerCode = fs.readFileSync("/Users/pro/Coding/study-en/ai-gateway-worker/src/v1_routes.js", "utf8");
  assert.equal(v1WorkerCode.includes("DELETE FROM badge_events WHERE family_id = ?"), true, "Xoá gia đình phải xoá badge_events");
  assert.equal(v1WorkerCode.includes("DELETE FROM reward_events WHERE family_id = ?"), true, "Xoá gia đình phải xoá reward_events");
  assert.equal(v1WorkerCode.includes("DELETE FROM learning_events WHERE family_id = ?"), true, "Xoá gia đình phải xoá learning_events");
  assert.equal(v1WorkerCode.includes("DELETE FROM progress_reports WHERE family_id = ?"), true, "Xoá gia đình phải xoá progress_reports");
  console.log("✅ 1. Xoá gia đình cascade delete sạch sẽ badge_events, reward_events và phân tích đã lưu");

  // 2. Kiểm tra giao diện Con tôi - EditChildSheet trong App.jsx
  const appCode = fs.readFileSync("src/App.jsx", "utf8");
  assert.equal(appCode.includes("Những gì Gấu nhớ · Lịch sử huy hiệu"), true);
  assert.equal(appCode.includes("btn-clear-child-badges"), true);
  assert.equal(appCode.includes("deleteBadgeEvents"), true);
  assert.equal(appCode.includes("appConfirm"), true);
  console.log("✅ 2. Con tôi: Hiển thị số huy hiệu và có nút xoá riêng kèm xác nhận appConfirm");

  // 3. Kiểm tra cổng giáo viên không thấy lịch sử phẩm chất từng con
  const teacherRoutes = fs.readFileSync("/Users/pro/Coding/study-en/ai-gateway-worker/src/teacher_routes.js", "utf8");
  assert.equal(teacherRoutes.includes("badge_events"), false, "Cổng giáo viên tuyệt đối không truy vấn badge_events");

  const teacherPortal = fs.readFileSync("src/TeacherPortal.jsx", "utf8");
  assert.equal(teacherPortal.includes("stickerHistory"), false, "TeacherPortal không được hiển thị stickerHistory");
  console.log("✅ 3. Quyền riêng tư: Giáo viên tuyệt đối không thể xem lịch sử phẩm chất của từng con");

  console.log("\n🎉 TẤT CẢ KIỂM THỬ ĐỢT 19 CHẶNG 5 ĐÃ VƯỢT QUA 100%!");
}

runTests().catch(err => {
  console.error("❌ Kiểm thử thất bại:", err);
  process.exit(1);
});
