import assert from "node:assert";
import fs from "node:fs";

console.log("===============================================================");
console.log("🧪 BẮT ĐẦU KIỂM THỬ ĐỢT 18 · CHẶNG 4: CÂU HỎI NHỎ HƠN (MICRO-STEP)");
console.log("===============================================================");

// --- 1. Kiểm tra Worker handleMicroStep & Route ---
console.log("\n--- 1. Kiểm tra Worker handleMicroStep & Prompt p18_micro_step ---");
const workerRoutes = fs.readFileSync("../study-en/ai-gateway-worker/src/v1_routes.js", "utf8");
const workerIndex = fs.readFileSync("../study-en/ai-gateway-worker/src/index.js", "utf8");

assert(workerIndex.includes("/api/v1/ai/micro-step"), "Worker index có route /api/v1/ai/micro-step");
assert(workerRoutes.includes("handleMicroStep"), "v1_routes.js có hàm handleMicroStep");
assert(workerRoutes.includes("cau_hoi_nho"), "Worker trả về trường cau_hoi_nho");
assert(workerRoutes.includes("dap_an_cho_me"), "Worker trả về trường dap_an_cho_me");
assert(workerRoutes.includes("ly_do_cho_me"), "Worker trả về trường ly_do_cho_me");
assert(workerRoutes.includes("micro_step_answer_leak"), "Worker có cơ chế chặn rò rỉ đáp án vào cau_hoi_nho và ghi guard_log");
console.log("  ✅ Worker route, schema p18_micro_step và bộ chặn đáp án có đầy đủ");

// --- 2. Kiểm tra Frontend API fetchAiMicroStep ---
console.log("\n--- 2. Kiểm tra Frontend API & Dùng thử ---");
globalThis.localStorage = {
  getItem: (key) => (key === "kem-con-hoc:session" ? JSON.stringify({ isTrial: true }) : null),
  setItem: () => {},
  removeItem: () => {},
};

const { fetchAiMicroStep } = await import("../src/api.js");

const trialMicro1 = await fetchAiMicroStep({
  problemText: "Mẹ mua 3 chục quả trứng, đã dùng 8 quả. Hỏi mẹ còn lại bao nhiêu quả trứng?",
  stepQuestion: "Mẹ dùng mất bao nhiêu quả rồi?",
  stepAnswer: "8 quả",
  hintsUsed: ["Đếm 8 quả trứng"],
  skill: "doc_hieu",
  microIndex: 1,
  childName: "Bé Na",
});

assert(trialMicro1.ok === true, "Trial mode trả về micro-step thành công");
assert(trialMicro1.micro_step.cau_hoi_nho, "Có câu hỏi nhỏ");
assert(trialMicro1.micro_step.dap_an_cho_me, "Có đáp án cho mẹ");
assert(trialMicro1.micro_step.ly_do_cho_me, "Có lý do cho mẹ");
assert(trialMicro1.micro_step.micro_index === 1, "Đúng micro_index 1");

const words = trialMicro1.micro_step.cau_hoi_nho.split(/\s+/);
assert(words.length <= 20, `Câu hỏi nhỏ tối đa 20 từ (thực tế: ${words.length} từ)`);

const trialMicro2 = await fetchAiMicroStep({
  microIndex: 2,
  childName: "Bé Na",
});
assert(trialMicro2.micro_step.micro_index === 2, "Đúng micro_index 2");
console.log("  ✅ fetchAiMicroStep hoạt động chuẩn xác, câu nhỏ dưới 20 từ");

// --- 3. Kiểm tra Giao diện Scaffold trong src/screens.jsx ---
console.log("\n--- 3. Kiểm tra Giao diện Scaffold & Thẻ Micro-Step ---");
const screensSrc = fs.readFileSync("src/screens.jsx", "utf8");
const stylesSrc = fs.readFileSync("src/styles.css", "utf8");

assert(screensSrc.includes("data-testid=\"stuck-badge-2\""), "Có huy hiệu Con chưa nghĩ ra · lần 2");
assert(screensSrc.includes("data-testid=\"card-micro-step\""), "Có khung thẻ Gấu chẻ nhỏ câu hỏi");
assert(screensSrc.includes("Câu nhỏ"), "Có nhãn Câu nhỏ 1/2");
assert(screensSrc.includes("Vì sao câu này? ›"), "Có link Vì sao câu này?");
assert(screensSrc.includes("data-testid=\"btn-micro-stuck\""), "Có nút Vẫn chưa ra");
assert(screensSrc.includes("data-testid=\"btn-micro-solved\""), "Có nút Con ra rồi!");
assert(screensSrc.includes("triggerMicroStep"), "Có hàm kích hoạt micro-step");
assert(screensSrc.includes("handleMicroSolved"), "Có hàm xử lý khi con giải được câu nhỏ");
assert(screensSrc.includes("handleMicroStillStuck"), "Có hàm xử lý khi con vẫn chưa ra");

// --- 4. Kiểm tra CSS ---
console.log("\n--- 4. Kiểm tra Styles CSS ---");
assert(stylesSrc.includes(".card.micro"), "styles.css có style cho .card.micro");
assert(stylesSrc.includes(".stuck-badge"), "styles.css có style cho .stuck-badge");
assert(stylesSrc.includes(".mr-row"), "styles.css có style cho .mr-row");
assert(stylesSrc.includes(".tagm"), "styles.css có style cho .tagm");
assert(stylesSrc.includes(".row2"), "styles.css có style cho .row2");
console.log("  ✅ Giao diện Scaffold và Styles CSS đầy đủ theo đúng bản vẽ thiết kế");

console.log("\n===============================================================");
console.log("🎉 TẤT CẢ CÁC BÀI TEST CHẶNG 4 (ĐỢT 18) ĐÃ VƯỢT QUA 100%!");
console.log("===============================================================");
