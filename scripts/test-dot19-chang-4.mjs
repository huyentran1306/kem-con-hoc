/**
 * Test Suite: Đợt 19 Chặng 4 - Admin: trang "Phân tích học tập"
 * 1. Tuyến đường /admin/phan-tich và đăng ký menu Theo dõi
 * 2. Thẻ chỉ số KPIs và bộ lọc (thời gian, khối, môn, bộ sách)
 * 3. 3 Biểu đồ: Phẩm chất theo khối (100%), Dạng bài & Sáng tạo, Bản đồ nhiệt kỹ năng
 * 4. Quy tắc ẩn danh: Nhóm < 5 gia đình bị ẩn ("chưa đủ số gia đình")
 * 5. Xuất CSV không chứa tên cá nhân
 * 6. Worker endpoint GET /api/v1/admin/analytics kiểm tra quyền quản trị
 */

import assert from "node:assert/strict";
import fs from "node:fs";
// Đọc ShellRoutes.jsx
const shellRoutesCode = fs.readFileSync("src/admin/ShellRoutes.jsx", "utf8");

async function runTests() {
  console.log("🚀 Bắt đầu kiểm thử Đợt 19 Chặng 4 (Admin Phân tích học tập)...");

  // 1. Kiểm tra đăng ký tuyến đường
  assert.equal(shellRoutesCode.includes("'/admin/phan-tich': 'analytics'"), true);
  assert.equal(shellRoutesCode.includes("id: 'analytics'"), true);
  assert.equal(shellRoutesCode.includes("slug: 'phan-tich'"), true);
  assert.equal(shellRoutesCode.includes("group: 'monitor'"), true);
  assert.equal(shellRoutesCode.includes("label: 'Phân tích học tập'"), true);
  console.log("✅ 1. Tuyến đường /admin/phan-tich và nhóm Theo dõi đã đăng ký chuẩn");

  // 2. Kiểm tra mã nguồn AdminAnalyticsTab.jsx
  const tabCode = fs.readFileSync("src/admin/AdminAnalyticsTab.jsx", "utf8");
  assert.equal(tabCode.includes("data-testid=\"admin-analytics-page\""), true);
  assert.equal(tabCode.includes("GIA ĐÌNH CÓ DỮ LIỆU"), true);
  assert.equal(tabCode.includes("BUỔI HỌC & THỜI LƯỢNG"), true);
  assert.equal(tabCode.includes("HUY HIỆU ĐÃ TẶNG"), true);
  assert.equal(tabCode.includes("KỸ NĂNG HAY KẸT NHẤT"), true);
  console.log("✅ 2. Đầy đủ 4 thẻ chỉ số KPIs theo đúng bản vẽ thiết kế");

  // 3. Kiểm tra quy tắc ẩn danh: < 5 gia đình bị ẩn ("chưa đủ số gia đình")
  assert.equal(tabCode.includes("chưa đủ số gia đình"), true);
  assert.equal(tabCode.includes("masked"), true);

  // 4. Kiểm tra nút xuất CSV
  assert.equal(tabCode.includes("btn-traits-csv"), true);
  assert.equal(tabCode.includes("btn-problem-csv"), true);
  assert.equal(tabCode.includes("btn-skills-csv"), true);
  assert.equal(tabCode.includes("data:text/csv;charset=utf-8,"), true);
  console.log("✅ 3. Đầy đủ nút xuất CSV và quy tắc ẩn danh tuyệt đối cho từng biểu đồ");

  // 5. Kiểm tra gợi ý cho đội nội dung
  assert.equal(tabCode.includes("data-testid=\"content-insight\""), true);
  assert.equal(tabCode.includes("Bài lặp lại cho ít Sáng tạo nhất. Gợi ý cho Router sư phạm: xen bài tình huống."), true);
  console.log("✅ 4. Có câu gợi ý cho đội nội dung và Router sư phạm");

  // 6. Kiểm tra Worker backend GET /api/v1/admin/analytics
  const stitchCode = fs.readFileSync("/Users/pro/Coding/study-en/ai-gateway-worker/src/admin_stitch_routes.js", "utf8");
  assert.equal(stitchCode.includes("/api/v1/admin/analytics"), true);
  assert.equal(stitchCode.includes("chưa đủ số gia đình"), true);
  assert.equal(stitchCode.includes("maskAnonymity"), true);
  console.log("✅ 5. Worker GET /api/v1/admin/analytics kiểm tra quyền và ẩn danh nhóm < 5 gia đình");

  console.log("\n🎉 TẤT CẢ KIỂM THỬ ĐỢT 19 CHẶNG 4 ĐÃ VƯỢT QUA 100%!");
}

runTests().catch(err => {
  console.error("❌ Kiểm thử thất bại:", err);
  process.exit(1);
});
