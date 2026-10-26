import assert from "node:assert";
import fs from "node:fs";

console.log("===============================================================");
console.log("🧪 BẮT ĐẦU KIỂM THỬ ĐỢT 18 · CHẶNG 6: BÀI ANH EM THÍCH ỨNG");
console.log("===============================================================");

// --- 1. Kiểm tra Worker handleAdaptiveBrother & Prompt p18_brother ---
console.log("\n--- 1. Kiểm tra Worker handleAdaptiveBrother & Schema ---");
const workerRoutes = fs.readFileSync("../study-en/ai-gateway-worker/src/v1_routes.js", "utf8");
const workerIndex = fs.readFileSync("../study-en/ai-gateway-worker/src/index.js", "utf8");

assert(workerIndex.includes("/api/v1/ai/brother"), "Worker index có route /api/v1/ai/brother");
assert(workerRoutes.includes("handleAdaptiveBrother"), "v1_routes.js có hàm handleAdaptiveBrother");
assert(workerRoutes.includes("ky_nang_nham"), "Schema có trường ky_nang_nham");
assert(workerRoutes.includes("vi_sao_cho_me"), "Schema có trường vi_sao_cho_me");
assert(workerRoutes.includes("dap_an_cho_me"), "Schema có trường dap_an_cho_me");
assert(workerRoutes.includes("correctLessonMath"), "Worker kiểm định toán học qua correctLessonMath");
assert(workerRoutes.includes("math_verified"), "Worker trả về math_verified: true");
console.log("  ✅ Worker route, schema p18_brother và máy kiểm phép tính có đủ");

// --- 2. Kiểm tra Frontend API fetchAiAdaptiveBrother ---
console.log("\n--- 2. Kiểm tra Frontend API fetchAiAdaptiveBrother & Dùng thử ---");
globalThis.localStorage = {
  getItem: (key) => (key === "kem-con-hoc:session" ? JSON.stringify({ isTrial: true }) : null),
  setItem: () => {},
  removeItem: () => {},
};

const { fetchAiAdaptiveBrother } = await import("../src/api.js");

const trialBro = await fetchAiAdaptiveBrother({
  problemText: "Mẹ mua 3 chục quả trứng, đã dùng 8 quả. Hỏi mẹ còn lại bao nhiêu quả trứng?",
  stuckSkill: "doi_don_vi",
  grade: 3,
  childName: "Bé Na",
});

assert.strictEqual(trialBro.ok, true, "Trial mode trả về bài anh em thành công");
assert.ok(trialBro.brother.de, "Có nội dung đề bài mới");
assert.strictEqual(trialBro.brother.ky_nang_nham, "doi_don_vi", "Nhắm đúng kỹ năng vừa kẹt");
assert.ok(trialBro.brother.dap_an_cho_me, "Có đáp án cho mẹ");
assert.strictEqual(trialBro.math_verified, true, "Đã kiểm phép tính math_verified = true");

const words = trialBro.brother.vi_sao_cho_me.split(/\s+/);
assert.ok(words.length <= 20, `vi_sao_cho_me tối đa 20 từ (thực tế: ${words.length} từ)`);
console.log("  ✅ fetchAiAdaptiveBrother hoạt động chuẩn xác, nhắm đúng kỹ năng kẹt");

// --- 3. Kiểm tra Giao diện Done trong src/screens.jsx & CSS ---
console.log("\n--- 3. Kiểm tra Giao diện Done & CSS ---");
const screensSrc = fs.readFileSync("src/screens.jsx", "utf8");
const stylesSrc = fs.readFileSync("src/styles.css", "utf8");

assert(screensSrc.includes("data-testid=\"card-praise-exact\""), "Có thẻ Gấu khen đúng chỗ");
assert(screensSrc.includes("GẤU KHEN ĐÚNG CHỖ"), "Có tiêu đề GẤU KHEN ĐÚNG CHỖ");
assert(screensSrc.includes("data-testid=\"card-adaptive-brother\""), "Có thẻ Bài anh em thích ứng");
assert(screensSrc.includes("BÀI ANH EM CHO"), "Có tiêu đề BÀI ANH EM CHO");
assert(screensSrc.includes("Luyện đúng chỗ vừa kẹt:"), "Có dòng Luyện đúng chỗ vừa kẹt:");
assert(screensSrc.includes("✓ Gấu đã kiểm phép tính"), "Có dấu ✓ Gấu đã kiểm phép tính");
assert(screensSrc.includes("data-testid=\"btn-try-brother\""), "Có nút Làm thử");

assert(stylesSrc.includes(".card.praise"), "CSS có định dạng cho .card.praise");
assert(stylesSrc.includes(".card.bro"), "CSS có định dạng cho .card.bro");
assert(stylesSrc.includes(".card.bro .q2"), "CSS có định dạng cho .card.bro .q2");
console.log("  ✅ Giao diện Done và CSS đầy đủ theo đúng bản vẽ thiết kế");

console.log("\n===============================================================");
console.log("🎉 TẤT CẢ CÁC BÀI TEST CHẶNG 6 (ĐỢT 18) ĐÃ VƯỢT QUA 100%!");
console.log("===============================================================");
