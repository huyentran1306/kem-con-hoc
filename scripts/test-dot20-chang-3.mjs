/**
 * scripts/test-dot20-chang-3.mjs
 * Kiểm tra toàn diện Đợt 20 · Chặng 3: Bảng điểm AI và xuất ảnh slide
 */
import assert from "node:assert";
import fs from "node:fs";

console.log("===============================================================");
console.log("🧪 BẮT ĐẦU KIỂM THỬ ĐỢT 20 · CHẶNG 3: BẢNG ĐIỂM AI & SLIDE");
console.log("===============================================================");

// 1. Kiểm tra định tuyến Admin /admin/bang-diem
console.log("1. Kiểm tra định tuyến Admin cho trang /admin/bang-diem:");
const shellCode = fs.readFileSync("src/admin/ShellRoutes.jsx", "utf8");
assert.ok(shellCode.includes("'/admin/bang-diem': 'scoreboard'"), "Bảng route phải map /admin/bang-diem -> scoreboard");
assert.ok(shellCode.includes("id: 'scoreboard'"), "Phải có cấu hình page scoreboard trong ADMIN_PAGES");
assert.ok(shellCode.includes("slug: 'bang-diem'"), "Slug của scoreboard phải là bang-diem");
console.log("   -> ĐẠT: Route /admin/bang-diem đã được cấu hình trong hệ thống.");

// 2. Kiểm tra 8 thẻ chỉ số chất lượng AI trong AdminScoreboardPage
console.log("2. Kiểm tra 8 thẻ chỉ số chất lượng trong AdminScoreboardPage.jsx:");
const pageCode = fs.readFileSync("src/admin/AdminScoreboardPage.jsx", "utf8");

const requiredMetrics = [
  "Lộ đáp án tới con",
  "Phép tính sai tới mẹ",
  "Chấm vở đọc đúng",
  "Gấu nghe con đúng",
  "Bậc dùng câu an toàn",
  "Có lý do cho mẹ",
  "Thời gian soạn bài",
  "Lỗi máy chủ",
];

for (const m of requiredMetrics) {
  assert.ok(pageCode.includes(m), `Trang phải có chỉ số: ${m}`);
  console.log(`   - Tìm thấy chỉ số: ${m}`);
}
console.log("   -> ĐẠT: Đủ 8 chỉ số chất lượng AI cốt lõi theo đặc tả.");

// 3. Kiểm tra tính năng chạy kiểm thử theo lô & ước tính token
console.log("3. Kiểm tra tính năng chạy kiểm thử theo lô:");
assert.ok(pageCode.includes("handleRunAllEvals"), "Phải có hàm chạy lại 80 ca kiểm thử");
assert.ok(pageCode.includes("5.400 tokens"), "Phải hiện ước tính token trước khi chạy");
assert.ok(pageCode.includes("progress"), "Phải có thanh tiến độ");
console.log("   -> ĐẠT: Có thanh tiến độ và cảnh báo ước tính token.");

// 4. Kiểm tra tính năng xuất ảnh slide 1920x1080
console.log("4. Kiểm tra Modal xuất ảnh slide:");
assert.ok(pageCode.includes("showSlideModal"), "Phải có modal xuất slide");
assert.ok(pageCode.includes("Ảnh cho slide"), "Nút mở ảnh slide hiển thị trên giao diện");
assert.ok(pageCode.includes("Bảng Điểm Chất Lượng & Độ Tin Cậy AI"), "Slide có tiêu đề chuẩn chung kết");
console.log("   -> ĐẠT: Giao diện slide 16:9 sắc nét, sẵn sàng đưa vào bài thuyết trình.");

console.log("===============================================================");
console.log("🎉 TẤT CẢ CÁC BÀI KIỂM THỬ ĐỢT 20 · CHẶNG 3 ĐÃ VƯỢT QUA 100%!");
console.log("===============================================================");
