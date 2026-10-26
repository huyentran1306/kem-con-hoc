/**
 * test-dot18-chang-2.mjs
 * Kiểm thử Đợt 18 · Chặng 2: Gấu nhớ con (prompt 17 chặng 2 & 3)
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { buildLearnerProfileFromEvents, SKILL_LABELS } from "../../study-en/ai-gateway-worker/src/v1_routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

console.log("===============================================================");
console.log("🧪 BẮT ĐẦU KIỂM THỬ ĐỢT 18 · CHẶNG 2: GẤU NHỚ CON");
console.log("===============================================================\n");

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// --- 2.1 Cấu trúc D1 Migration 0006_dot18_tables.sql ---
console.log("--- 2.1 Kiểm tra file migration 0006_dot18_tables.sql ---");
const migrationSrc = readFileSync(resolve(root, "../study-en/ai-gateway-worker/migrations/0006_dot18_tables.sql"), "utf8");
assert(migrationSrc.includes("CREATE TABLE IF NOT EXISTS learning_events"), "Có định nghĩa bảng learning_events");
assert(migrationSrc.includes("idx_learning_events_family_child_created"), "Có chỉ mục (family_id, child_id, created_at)");
assert(migrationSrc.includes("idx_learning_events_family_child_skill"), "Có chỉ mục (family_id, child_id, skill)");
assert(migrationSrc.includes("UNIQUE(session_id, step_no)"), "Có ràng buộc UNIQUE(session_id, step_no) chống ghi trùng");
assert(migrationSrc.includes("voice_verdict"), "Có trường voice_verdict phục vụ Chặng 5");

// --- 2.2 Thuật toán xây dựng hồ sơ con (buildLearnerProfileFromEvents) ---
console.log("\n--- 2.2 Thuật toán phân tích hồ sơ con (30 ngày gần nhất) ---");

// Ca 1: Chưa có lịch sử hoặc < 3 buổi
const emptyProfile = buildLearnerProfileFromEvents([], "Bé Mít");
assert(emptyProfile.profileText === "chưa có", "Chưa có sự kiện -> trả về 'chưa có'");
assert(emptyProfile.hasHistory === false, "hasHistory: false khi chưa đủ sự kiện");

// Ca 2: Hay kẹt ở kỹ năng đổi đơn vị (tỉ lệ kẹt > 30% trên >= 3 lần)
const stuckEvents = [
  { skill: "don_vi", result: "can_goi_y", hints_used: 1 },
  { skill: "don_vi", result: "can_goi_y", hints_used: 2 },
  { skill: "don_vi", result: "tu_lam", hints_used: 0 },
  { skill: "tinh_toan", result: "tu_lam", hints_used: 0 },
  { skill: "tinh_toan", result: "tu_lam", hints_used: 0 },
  { skill: "tinh_toan", result: "tu_lam", hints_used: 0 },
];
const p1 = buildLearnerProfileFromEvents(stuckEvents, "Mít");
assert(p1.stuckSkills.includes("đổi đơn vị"), "Nhận diện đúng kỹ năng hay kẹt: đổi đơn vị");
assert(p1.solidSkills.includes("tính toán"), "Nhận diện đúng kỹ năng đã vững: tính toán");
assert(p1.profileText.includes("Mít hay kẹt ở bước đổi đơn vị"), "Hồ sơ con nêu rõ bước hay kẹt");
assert(p1.profileText.includes("đã vững tính toán"), "Hồ sơ con nêu rõ bước đã vững");
assert(p1.profileText.includes("Hãy hỏi kỹ bước đổi đơn vị"), "Có lời khuyên sư phạm cho AI");
assert(p1.profileText.length <= 300, `Độ dài hồ sơ <= 300 ký tự (thực tế: ${p1.profileText.length} ký tự)`);

// Ca 3: Đã vững 3 lần liên tiếp không gợi ý
const solidEvents = [
  { skill: "doc_hieu_de", result: "tu_lam", hints_used: 0 },
  { skill: "doc_hieu_de", result: "tu_lam", hints_used: 0 },
  { skill: "doc_hieu_de", result: "tu_lam", hints_used: 0 },
];
const p2 = buildLearnerProfileFromEvents(solidEvents, "Bon");
assert(p2.solidSkills.includes("đọc hiểu đề"), "Nhận diện vững sau 3 lần liên tiếp làm đúng");
assert(p2.profileText.includes("Bon đã vững đọc hiểu đề"), "Nêu rõ kỹ năng đã vững");

// --- 2.3 Backend API Worker: v1_routes & index.js ---
console.log("\n--- 2.3 Backend API: endpoint learning-events & chèn {{ho_so_con}} ---");
const v1RoutesSrc = readFileSync(resolve(root, "../study-en/ai-gateway-worker/src/v1_routes.js"), "utf8");
assert(v1RoutesSrc.includes('pathname === "/api/v1/family/learning-events" && method === "POST"'), "Có endpoint POST /api/v1/family/learning-events");
assert(v1RoutesSrc.includes('ON CONFLICT(session_id, step_no) DO UPDATE'), "POST có cơ chế UPSERT chống trùng session_id + step_no");
assert(v1RoutesSrc.includes('pathname === "/api/v1/family/learning-events" && method === "GET"'), "Có endpoint GET /api/v1/family/learning-events");
assert(v1RoutesSrc.includes('pathname === "/api/v1/family/learning-events" && method === "DELETE"'), "Có endpoint DELETE /api/v1/family/learning-events (xoá lịch sử bé)");

const workerIndexSrc = readFileSync(resolve(root, "../study-en/ai-gateway-worker/src/index.js"), "utf8");
assert(workerIndexSrc.includes("buildLearnerProfile"), "Worker index.js đã import buildLearnerProfile");
assert(workerIndexSrc.includes("{{ho_so_con}}"), "Worker index.js tự động thay thế {{ho_so_con}} bằng hồ sơ thật từ D1");

// --- 2.4 Prompt template p3_explain_v2 có biến {{ho_so_con}} ---
console.log("\n--- 2.4 Cấu hình Prompt Studio: p3_explain_v2 hỗ trợ {{ho_so_con}} ---");
const promptSrc = readFileSync(resolve(root, "src/promptStudio.js"), "utf8");
assert(promptSrc.includes("'{{ho_so_con}}'"), "p3_explain_v2 khai báo biến {{ho_so_con}}");
assert(promptSrc.includes("Hồ sơ học của con (Gấu nhớ con): {{ho_so_con}}"), "Template chứa dòng Hồ sơ học của con");
assert(promptSrc.toLowerCase().includes("quy tắc bắt buộc") && promptSrc.includes("ho_so_con"), "Có quy tắc AI ưu tiên hỏi kỹ chỗ hay kẹt");

// --- 2.5 Giao diện: Thẻ Gấu nhớ nè & Cài đặt bé ---
console.log("\n--- 2.5 Giao diện người dùng (screens.jsx, App.jsx, styles.css) ---");
const screensSrc = readFileSync(resolve(root, "src/screens.jsx"), "utf8");
assert(screensSrc.includes('id="bear-memory-card"'), "Màn Trước khi giảng có thẻ Gấu nhớ nè (#bear-memory-card)");
assert(screensSrc.includes("Vì sao Gấu biết?"), "Thẻ có link 'Vì sao Gấu biết?'");
assert(screensSrc.includes("Lần này không dùng"), "Thẻ có công tắc tắt riêng cho lần này");
assert(screensSrc.includes("SKILL_LABELS"), "Có nhãn kỹ năng cho từng bậc");
assert(screensSrc.includes("hay kẹt"), "Đánh dấu bậc con hay kẹt với nhãn 'hay kẹt'");
assert(screensSrc.includes("recordLearningEvent"), "Scaffold tự động ghi nhận sự kiện học từng bước");

const appSrc = readFileSync(resolve(root, "src/App.jsx"), "utf8");
assert(appSrc.includes("toggle-bear-memory"), "Cài đặt bé có công tắc 'Bật Gấu nhớ con'");
assert(appSrc.includes("btn-clear-child-history"), "Cài đặt bé có nút 'Xoá lịch sử học của bé'");
assert(appSrc.includes("clearLearnerHistory"), "Gọi hàm clearLearnerHistory khi xoá");

const stylesSrc = readFileSync(resolve(root, "src/styles.css"), "utf8");
assert(stylesSrc.includes(".card.mem"), "styles.css có style cho .card.mem");
assert(stylesSrc.includes(".st.hot"), "styles.css có style nổi bật cho bậc con hay kẹt (.st.hot)");

// --- 2.6 Quyền riêng tư: API Giáo viên KHÔNG trả learning_events ---
console.log("\n--- 2.6 Quyền riêng tư của bé ---");
const teacherRoutesSrc = readFileSync(resolve(root, "../study-en/ai-gateway-worker/src/teacher_routes.js"), "utf8");
assert(!teacherRoutesSrc.includes("learning_events"), "API giáo viên TUYỆT ĐỐI KHÔNG truy vấn hoặc trả về learning_events");

console.log("\n===============================================================");
console.log(`🏁 TỔNG KẾT CHẶNG 2: ${passed}/${total} KIỂM THỬ ĐẠT (${Math.round((passed/total)*100)}%)`);
console.log("===============================================================");

if (passed < total) process.exit(1);
