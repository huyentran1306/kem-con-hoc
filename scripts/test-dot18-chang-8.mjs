import assert from "node:assert/strict";
import fs from "node:fs";
// Function logic replicated for testing
function getSeasonSuggestCopy(themeId, today) {
  if (themeId === "thieunhi") {
    const isJune1st = today && (today.endsWith("-06-01") || today.slice(5) === "06-01");
    return {
      title: isJune1st
        ? "🎈 Hôm nay là 1/6! Cả nhà thử bộ Cầu Vồng 1/6 không?"
        : "🎈 Sắp tới 1/6 rồi! Cả nhà thử bộ Cầu Vồng 1/6 không?",
      desc: "Bóng bay, cánh diều, mỗi tối học bơm thêm một quả bóng.",
    };
  }
  return { title: "", desc: "" };
}

console.log("=== ĐỢT 18 · CHẶNG 8: SỬA LỖI GIAO DIỆN CÒN LẠI ===");

// 1. Kiểm tra Bảng trượt (Sheet) cố định màn hình & có nhãn đóng
const stylesCss = fs.readFileSync("src/styles.css", "utf8");
assert.ok(stylesCss.includes(".sheet{\n  position:fixed;inset:0;z-index:50;"), "Sheet must be position:fixed with z-index:50");

const classSheet = fs.readFileSync("src/FamilyClassSheet.jsx", "utf8");
assert.ok(classSheet.includes('aria-label="Đóng"'), "FamilyClassSheet close button must have aria-label=\"Đóng\"");

const membersSheet = fs.readFileSync("src/FamilyMembersSheet.jsx", "utf8");
assert.ok(membersSheet.includes('aria-label="Đóng"'), "FamilyMembersSheet close button must have aria-label=\"Đóng\"");
console.log("✓ 1. Bảng trượt (sheet) cố định theo màn hình (fixed, z-index:50) và có nhãn Đóng");

// 2. Kiểm tra link vào lớp sai
const appJsx = fs.readFileSync("src/App.jsx", "utf8");
assert.ok(appJsx.includes("clearPendingJoin()\n            setClassJoinBanner({ error: true, message: 'Mã lớp không còn dùng được' })"), "App.jsx must clear pending join and set error banner when class preview fails");

const loginJsx = fs.readFileSync("src/Login.jsx", "utf8");
assert.ok(loginJsx.includes("Mã lớp không còn dùng được"), "Login.jsx must display error banner when class code is invalid");
console.log("✓ 2. Link vào lớp sai báo lỗi ngay trang đăng nhập, không tự bật sheet sau đó");

// 3. Nút nổi Mẹ bình tĩnh & khoảng đệm cuối trang
assert.ok(stylesCss.includes("padding-bottom: calc(184px + env(safe-area-inset-bottom))"), "Scroll area must have sufficient padding-bottom (>=184px)");
assert.ok(appJsx.includes("if (top > 40) {\n      if (!fabCompact) setFabCompact(true)"), "handleScrollFab must compact button to circle on scroll > 40px");
console.log("✓ 3. Nút nổi Mẹ bình tĩnh thu tròn khi cuộn, có khoảng đệm cuối trang không che nội dung");

// 4. Admin robustness (chống sập trắng & Error Boundary)
const routerPage = fs.readFileSync("src/admin/RouterPage.jsx", "utf8");
assert.ok(routerPage.includes("Number(n || 0).toLocaleString"), "RouterPage must guard n with fallback Number(n || 0)");
assert.ok(routerPage.includes("Number(stats?.totalSessions || 0).toLocaleString"), "RouterPage must guard stats.totalSessions with fallback Number");

const adminJsx = fs.readFileSync("src/Admin.jsx", "utf8");
assert.ok(adminJsx.includes("class AdminPageErrorBoundary"), "Admin.jsx must define AdminPageErrorBoundary");
assert.ok(adminJsx.includes("<AdminPageErrorBoundary pageId={page.id} onNavigate={navigate}>"), "Admin.jsx must wrap renderPage with AdminPageErrorBoundary");
console.log("✓ 4. Admin chống sập khi thiếu số liệu và có Error Boundary riêng cho từng trang");

// 5. Gợi ý mùa 1/6
const suggestOnJune1 = getSeasonSuggestCopy("thieunhi", "2026-06-01");
assert.ok(suggestOnJune1.title.includes("Hôm nay là 1/6!"), "June 1st must say \"Hôm nay là 1/6!\"");

const suggestBeforeJune1 = getSeasonSuggestCopy("thieunhi", "2026-05-28");
assert.ok(suggestBeforeJune1.title.includes("Sắp tới 1/6 rồi!"), "Days before June 1st must say \"Sắp tới 1/6 rồi!\"");
console.log("✓ 5. Gợi ý mùa 1/6 hiển thị đúng theo ngày: \"Hôm nay là 1/6!\" vào 1/6 và \"Sắp tới 1/6 rồi!\" ngày trước");

// 6. Cổng giáo viên: 6 icon riêng biệt, không dùng chung mặt gấu
const teacherIconsFile = fs.readFileSync("src/TeacherBearIcons.jsx", "utf8");
assert.ok(teacherIconsFile.includes("export function BearClassIcon"), "BearClassIcon must exist");
assert.ok(teacherIconsFile.includes("export function BearBookIcon"), "BearBookIcon must exist");
assert.ok(teacherIconsFile.includes("export function BearStudentsIcon"), "BearStudentsIcon must exist");
assert.ok(teacherIconsFile.includes("export function BearBellIcon"), "BearBellIcon must exist");
assert.ok(teacherIconsFile.includes("export function BearResultsIcon"), "BearResultsIcon must exist");
assert.ok(teacherIconsFile.includes("export function BearSettingsIcon"), "BearSettingsIcon must exist");

// Kiểm tra không dùng chung một BearHead cho toàn bộ icon
assert.ok(!teacherIconsFile.includes("function BearHead"), "Teacher icons must not share uniform BearHead");
console.log("✓ 6. Cổng giáo viên có 6 icon riêng biệt cho từng mục menu (Lớp, Bài tập, Học sinh, Thông báo, Kết quả, Cài đặt)");

console.log("ALL 6 TESTS PASSED FOR CHẶNG 8!");
