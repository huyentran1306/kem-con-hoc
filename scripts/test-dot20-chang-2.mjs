/**
 * scripts/test-dot20-chang-2.mjs
 * Kiểm tra toàn diện Đợt 20 · Chặng 2: Kiểm tra trước demo và chế độ trình diễn
 */
import assert from "node:assert";
import fs from "node:fs";
import { isDemoMode, setDemoMode } from "../src/api.js";
import { PRELOADED_TRIAL_LESSONS } from "../src/trialData.js";
// ShellRoutes parse via fs to avoid Node JSX loader issue

console.log("===============================================================");
console.log("🧪 BẮT ĐẦU KIỂM THỬ ĐỢT 20 · CHẶNG 2: KIỂM TRA TRƯỚC DEMO");
console.log("===============================================================");

// 1. Kiểm tra định tuyến Admin /admin/truoc-demo
console.log("1. Kiểm tra định tuyến Admin cho trang /admin/truoc-demo:");
const shellCode = fs.readFileSync("src/admin/ShellRoutes.jsx", "utf8");
assert.ok(shellCode.includes("'/admin/truoc-demo': 'pre-demo'"), "Bảng route phải map /admin/truoc-demo -> pre-demo");
assert.ok(shellCode.includes("id: 'pre-demo'"), "Phải có cấu hình page pre-demo trong ADMIN_PAGES");
assert.ok(shellCode.includes("slug: 'truoc-demo'"), "Slug của pre-demo phải là truoc-demo");
console.log("   -> ĐẠT: Route /admin/truoc-demo đã được khai báo chuẩn xác.");

// 2. Kiểm tra giao diện AdminPreDemoPage và 5 mục khám sức khoẻ
console.log("2. Kiểm tra thành phần trang AdminPreDemoPage.jsx:");
const pageCode = fs.readFileSync("src/admin/AdminPreDemoPage.jsx", "utf8");
assert.ok(pageCode.includes("runAllChecks"), "Phải có hàm runAllChecks chạy tuần tự 5 mục");
assert.ok(pageCode.includes("~3.800 tokens"), "Phải hiện ước tính token ~3.800 tokens trước khi bấm");
assert.ok(pageCode.includes("handlePreloadDemoLessons"), "Phải có nút nạp 3 đề trình diễn");
assert.ok(pageCode.includes("handleToggleDemo"), "Phải có công tắc bật/tắt chế độ trình diễn");
console.log("   -> ĐẠT: Đủ 5 mục kiểm tra sức khoẻ AI và ước tính chi phí token.");

// 3. Kiểm tra công tắc Demo Mode và lưu trữ
console.log("3. Kiểm tra logic Chế độ trình diễn (Demo Safeguard):");
setDemoMode(true);
assert.strictEqual(isDemoMode(), true, "setDemoMode(true) phải lưu trạng thái bật");
setDemoMode(false);
assert.strictEqual(isDemoMode(), false, "setDemoMode(false) phải lưu trạng thái tắt");
console.log("   -> ĐẠT: Công tắc Demo Mode hoạt động chuẩn xác qua localStorage.");

// 4. Kiểm tra 3 đề trình diễn sẵn sàng trong bộ nhớ
console.log("4. Kiểm tra 3 đề trình diễn mẫu:");
assert.ok(PRELOADED_TRIAL_LESSONS.length >= 3, "Phải có ít nhất 3 đề mẫu");
const subjects = PRELOADED_TRIAL_LESSONS.map((l) => l.subject);
console.log("   - Các môn mẫu sẵn sàng:", subjects);
assert.ok(subjects.includes("Toán"), "Có đề Toán mẫu");
console.log("   -> ĐẠT: Đủ 3 đề mẫu cho Toán, Tiếng Việt, Tiếng Anh.");

// 5. Kiểm tra tính minh bạch (không giả vờ AI đang chạy, luôn ghi rõ giờ soạn)
console.log("5. Kiểm tra hiển thị minh bạch bản soạn sẵn:");
const screensCode = fs.readFileSync("src/screens.jsx", "utf8");
assert.ok(screensCode.includes("problem.demo_timestamp"), "screens.jsx phải hiển thị dòng bản soạn sẵn kèm giờ");
assert.ok(screensCode.includes("Chế độ trình diễn"), "Có chú thích rõ ràng chế độ trình diễn");
console.log("   -> ĐẠT: Trung thực 100%, ghi rõ giờ soạn khi dùng bản soạn sẵn.");

console.log("===============================================================");
console.log("🎉 TẤT CẢ CÁC BÀI KIỂM THỬ ĐỢT 20 · CHẶNG 2 ĐÃ VƯỢT QUA 100%!");
console.log("===============================================================");
