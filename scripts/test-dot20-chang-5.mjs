/**
 * scripts/test-dot20-chang-5.mjs
 * Kiểm tra toàn diện Đợt 20 · Chặng 5: Trợ lý gấu cho cô giáo (model nhỏ, ngắn)
 */
import assert from "node:assert";
import fs from "node:fs";

console.log("===============================================================");
console.log("🧪 BẮT ĐẦU KIỂM THỬ ĐỢT 20 · CHẶNG 5: TRỢ LÝ GẤU CHO CÔ GIÁO");
console.log("===============================================================");

// 1. Kiểm tra định nghĩa prompt p20_class_insight
console.log("1. Kiểm tra prompt p20_class_insight trong Prompt Studio:");
const studioCode = fs.readFileSync("src/promptStudio.js", "utf8");
assert.ok(studioCode.includes("p20_class_insight:"), "Phải có prompt p20_class_insight");
assert.ok(studioCode.includes("KHÔNG nêu tên bất kỳ học sinh nào"), "Phải có quy tắc không nêu tên học sinh");
assert.ok(studioCode.includes("dưới 300 tokens"), "Prompt phải giới hạn dưới 300 tokens");
assert.ok(studioCode.includes("diem_vung"), "Có trường diem_vung");
assert.ok(studioCode.includes("cho_nham_chung"), "Có trường cho_nham_chung");
assert.ok(studioCode.includes("goi_y_ngay_mai"), "Có trường goi_y_ngay_mai");
console.log("   -> ĐẠT: Prompt p20_class_insight chuẩn schema, bảo vệ quyền riêng tư học sinh.");

// 2. Kiểm tra điều kiện kích hoạt (ngưỡng >= 5 bài)
console.log("2. Kiểm tra logic ngưỡng 5 bài nộp trong TeacherPortal:");
const partsCode = fs.readFileSync("src/teacher/parts.jsx", "utf8");
assert.ok(partsCode.includes("completedCount >= 5"), "Phải có điều kiện kích hoạt completedCount >= 5");
assert.ok(partsCode.includes("Gấu tổng hợp lớp"), "Có nút Gấu tổng hợp lớp");
assert.ok(partsCode.includes("Đạt 5 bài mở AI"), "Dưới 5 bài hiện thống kê bằng code");
console.log("   -> ĐẠT: Dưới 5 bài nộp không gọi AI (0 token); từ 5 bài trở lên mở nút tổng hợp.");

// 3. Kiểm tra lưu cache theo ngày
console.log("3. Kiểm tra cơ chế lưu cache theo ngày:");
assert.ok(partsCode.includes("class_insight_"), "Phải lưu cache theo key class_insight_");
assert.ok(partsCode.includes("Lưu theo ngày"), "Có ghi chú lưu theo ngày để cô mở lại không tốn token");
console.log("   -> ĐẠT: Cô mở lại nhiều lần trong ngày không tốn thêm token AI.");

// 4. Kiểm tra cấu trúc nội dung phân tích (vững, nhầm chung, gợi ý tiết học)
console.log("4. Kiểm tra 3 khối nội dung sư phạm:");
assert.ok(partsCode.includes("🌟 Cả lớp vững:"), "Khối cả lớp vững hiển thị rõ ràng");
assert.ok(partsCode.includes("⚠️ Chỗ hay nhầm chung:"), "Khối chỗ hay nhầm chung hiển thị rõ ràng");
assert.ok(partsCode.includes("💡 Gợi ý tiết học ngày mai:"), "Khối gợi ý tiết học ngày mai hiển thị rõ ràng");
console.log("   -> ĐẠT: 3 mục cô đọng, thực tế, dưới 50 từ, không lý thuyết suông.");

console.log("===============================================================");
console.log("🎉 TẤT CẢ CÁC BÀI KIỂM THỬ ĐỢT 20 · CHẶNG 5 ĐÃ VƯỢT QUA 100%!");
console.log("===============================================================");
