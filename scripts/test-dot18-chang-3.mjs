import assert from "node:assert";
import fs from "node:fs";

console.log("===============================================================");
console.log("🧪 BẮT ĐẦU KIỂM THỬ ĐỢT 18 · CHẶNG 3: PHÂN TÍCH TIẾN BỘ TRUNG THỰC");
console.log("===============================================================");

// --- 1. Kiểm tra Endpoint Worker & Schema Prompt p17_progress ---
console.log("\n--- 1. Kiểm tra Worker handleProgressReport & Route ---");
const workerRoutes = fs.readFileSync("../study-en/ai-gateway-worker/src/v1_routes.js", "utf8");
const workerIndex = fs.readFileSync("../study-en/ai-gateway-worker/src/index.js", "utf8");

assert(workerIndex.includes("/api/v1/ai/progress"), "Worker có route /api/v1/ai/progress");
assert(workerRoutes.includes("handleProgressReport"), "Worker có hàm handleProgressReport");
assert(workerRoutes.includes("NOT_ENOUGH_DATA"), "Dưới 3 buổi trả mã NOT_ENOUGH_DATA");
assert(workerRoutes.includes("progress_reports"), "Lưu kết quả phân tích vào bảng progress_reports");
assert(workerRoutes.includes("allowedNumbers"), "Worker có logic kiểm định mọi con số phải có trong dữ kiện (chống bịa số)");
console.log("  ✅ Worker route, kiểm tra < 3 buổi, cache và fact-checking đều có đủ");

// --- 2. Kiểm tra Thẻ An Toàn AI và các chỉ số dot18_safety ---
console.log("\n--- 2. Kiểm tra Thẻ An Toàn AI trong Worker safety.js ---");
const safetySrc = fs.readFileSync("../study-en/ai-gateway-worker/src/safety.js", "utf8");
assert(safetySrc.includes("dot18_safety"), "safety.js trả về đối tượng dot18_safety");
assert(safetySrc.includes("phep_tinh_sai_da_bat"), "Có chỉ số phep_tinh_sai_da_bat từ guard_log outcome=sua_phep_tinh");
assert(safetySrc.includes("bac_bo_chan_sua_lai"), "Có chỉ số bac_bo_chan_sua_lai từ guard_log");
assert(safetySrc.includes("cau_nho_hon_da_tao"), "Có chỉ số cau_nho_hon_da_tao từ learning_events micro_steps");
assert(safetySrc.includes("so_lan_gau_nghe_con"), "Có chỉ số so_lan_gau_nghe_con từ learning_events voice_count");
console.log("  ✅ Đủ 4 chỉ số an toàn AI đợt 18 từ số liệu thật");

// --- 3. Kiểm tra Frontend API (fetchAiProgressReport & getSafetySummary) ---
console.log("\n--- 3. Kiểm tra Frontend API & Dùng thử ---");
globalThis.localStorage = {
  getItem: (key) => (key === "kem-con-hoc:session" ? JSON.stringify({ isTrial: true }) : null),
  setItem: () => {},
  removeItem: () => {},
};

const { fetchAiProgressReport, getSafetySummary } = await import("../src/api.js");

const trialReport = await fetchAiProgressReport("c1", "Bé Na", { sessionsCount: 3 });
assert(trialReport.ok === true, "Trial mode trả về report thành công");
assert(trialReport.report.tom_tat, "Trial report có tóm tắt");
assert(trialReport.report.nguon_du_lieu.so_buoi === 3, "Nguồn dữ liệu có đúng số buổi");
assert(Array.isArray(trialReport.report.goi_y_cho_me) && trialReport.report.goi_y_cho_me.length === 3, "Có đúng 3 gợi ý tuần tới");

const trialNotEnough = await fetchAiProgressReport("c1", "Bé Na", { sessionsCount: 1 });
assert(trialNotEnough.ok === false, "Dưới 3 buổi trả về ok: false");
assert(trialNotEnough.error.code === "NOT_ENOUGH_DATA", "Mã lỗi là NOT_ENOUGH_DATA");
assert(trialNotEnough.sessions_count === 1, "Báo số buổi hiện tại = 1");

const safetyData = await getSafetySummary("7d");
assert(safetyData.dot18_safety, "getSafetySummary có dot18_safety");
assert(typeof safetyData.dot18_safety.phep_tinh_sai_da_bat === "number", "phep_tinh_sai_da_bat là số");
assert(typeof safetyData.dot18_safety.bac_bo_chan_sua_lai === "number", "bac_bo_chan_sua_lai là số");
assert(typeof safetyData.dot18_safety.cau_nho_hon_da_tao === "number", "cau_nho_hon_da_tao là số");
assert(typeof safetyData.dot18_safety.so_lan_gau_nghe_con === "number", "so_lan_gau_nghe_con là số");
console.log("  ✅ API fetchAiProgressReport và getSafetySummary hoạt động chuẩn xác");

// --- 4. Kiểm tra Giao diện Report trong src/screens.jsx ---
console.log("\n--- 4. Kiểm tra Giao diện Report & CSS ---");
const screensSrc = fs.readFileSync("src/screens.jsx", "utf8");
const stylesSrc = fs.readFileSync("src/styles.css", "utf8");

// Gói 36: màn Báo cáo làm lại theo bản vẽ v5. Thẻ "Con tiến bộ thế nào" trước đây không được hiện (mã chết) đã bỏ;
// số buổi còn thiếu đưa vào thẻ "Cần chú ý tuần này". Khối "An toàn AI 7 ngày" bỏ khỏi Báo cáo theo góp ý.
assert(screensSrc.includes("Cần chú ý tuần này"), "Báo cáo có thẻ Cần chú ý tuần này");
assert(screensSrc.includes("để Gấu tìm ra nguyên nhân"), "Thiếu buổi học thì nói rõ cần thêm mấy buổi");
assert(!screensSrc.includes("An toàn AI 7 ngày"), "Báo cáo không còn khối An toàn AI 7 ngày");
assert(screensSrc.includes("fetchAiProgressReport("), "Báo cáo vẫn gọi phân tích tiến bộ để biết số buổi");

assert(stylesSrc.includes(".card.ana"), "CSS có định dạng cho .card.ana");
assert(stylesSrc.includes(".src-badge"), "CSS có định dạng cho .src-badge");
assert(stylesSrc.includes(".facts-grid"), "CSS có định dạng cho .facts-grid");
assert(stylesSrc.includes(".st-card"), "CSS có định dạng cho .st-card");
console.log("  ✅ Giao diện Report (gói 36) và CSS");

console.log("\n===============================================================");
console.log("🎉 TẤT CẢ CÁC BÀI TEST CHẶNG 3 (ĐỢT 18) ĐÃ VƯỢT QUA 100%!");
console.log("===============================================================");
