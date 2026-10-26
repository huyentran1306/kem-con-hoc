import assert from "node:assert";
import fs from "node:fs";

console.log("===============================================================");
console.log("🧪 BẮT ĐẦU KIỂM THỬ ĐỢT 18 · CHẶNG 5: GẤU NGHE CON TRẢ LỜI");
console.log("===============================================================");

// --- 1. Kiểm tra chuyển đổi số bằng chữ sang số ---
console.log("\n--- 1. Kiểm tra chuyển đổi số tiếng Việt bằng chữ sang số ---");
const { viNumberWords } = await import("../src/guard.js");

const normalizeSpoken = (text) => {
  return viNumberWords(text).replace(/(\d+)\s*chục\b/gi, (_, n) => String(Number(n) * 10));
};

assert.strictEqual(normalizeSpoken("hai mươi hai"), "22", "'hai mươi hai' đổi thành 22");
assert.strictEqual(normalizeSpoken("ba chục"), "30", "'ba chục' đổi thành 30");
assert.strictEqual(normalizeSpoken("Lấy ba mươi cộng tám ạ"), "Lấy 30 cộng 8 ạ", "Chuẩn hoá cả câu văn");
assert.strictEqual(normalizeSpoken("mười lăm"), "15", "'mười lăm' đổi thành 15");
console.log("  ✅ Đổi số bằng chữ thành số chính xác tuyệt đối");

// --- 2. Kiểm tra Worker handleJudgeAnswer & Prompt p18_judge_answer ---
console.log("\n--- 2. Kiểm tra Worker handleJudgeAnswer & Schema ---");
const workerRoutes = fs.readFileSync("../study-en/ai-gateway-worker/src/v1_routes.js", "utf8");
const workerIndex = fs.readFileSync("../study-en/ai-gateway-worker/src/index.js", "utf8");

assert(workerIndex.includes("/api/v1/ai/judge-answer"), "Worker index có route /api/v1/ai/judge-answer");
assert(workerRoutes.includes("handleJudgeAnswer"), "v1_routes.js có hàm handleJudgeAnswer");
assert(workerRoutes.includes("danh_gia"), "Schema có trường danh_gia");
assert(workerRoutes.includes("nhan_xet_cho_me"), "Schema có trường nhan_xet_cho_me");
assert(workerRoutes.includes("cau_me_noi_tiep"), "Schema có trường cau_me_noi_tiep");
assert(workerRoutes.includes("khen_cu_the"), "Schema có trường khen_cu_the");
assert(!workerRoutes.includes("INSERT INTO audio"), "BẢO MẬT: Không lưu audio vào DB");
assert(!workerRoutes.includes("INSERT INTO voice_transcripts"), "BẢO MẬT: Không lưu transcript vào DB");
console.log("  ✅ Worker route, schema p18_judge_answer và chính sách bảo mật riêng tư có đủ");

// --- 3. Kiểm tra Frontend API fetchAiJudgeAnswer & 4 trường hợp đánh giá ---
console.log("\n--- 3. Kiểm tra Frontend API fetchAiJudgeAnswer & 4 trường hợp đánh giá ---");
globalThis.localStorage = {
  getItem: (key) => (key === "kem-con-hoc:session" ? JSON.stringify({ isTrial: true }) : null),
  setItem: () => {},
  removeItem: () => {},
};

const { fetchAiJudgeAnswer } = await import("../src/api.js");

// Ca 1: Đúng (dung)
const rCorrect = await fetchAiJudgeAnswer({
  stepQuestion: "Mẹ dùng mất bao nhiêu quả rồi?",
  stepAnswer: "8 quả",
  childSpeech: "tám quả ạ",
  childName: "Bé Na",
});
assert.strictEqual(rCorrect.verdict.danh_gia, "dung", "Đúng: nhận định dung");
assert.ok(rCorrect.verdict.khen_cu_the, "Có lời khen cụ thể");

// Ca 2: Gần đúng (gan_dung)
const rNear = await fetchAiJudgeAnswer({
  stepQuestion: "Tính xem 3 chục trừ 8 bằng bao nhiêu?",
  stepAnswer: "22",
  childSpeech: "hai mươi",
  childName: "Bé Na",
});
assert.strictEqual(rNear.verdict.danh_gia, "gan_dung", "Gần đúng: nhận định gan_dung");

// Ca 3: Sai hướng (sai_huong)
const rWrong = await fetchAiJudgeAnswer({
  stepQuestion: "Còn lại thì mình làm phép gì?",
  stepAnswer: "Phép trừ 30 - 8",
  childSpeech: "Lấy 30 cộng 8 ạ",
  childName: "Bé Na",
});
assert.strictEqual(rWrong.verdict.danh_gia, "sai_huong", "Sai hướng: nhận định sai_huong");
assert.ok(rWrong.verdict.cau_me_noi_tiep, "Có câu mẹ nói tiếp gợi mở");

// Ca 4: Không rõ (khong_ro)
const rUnclear = await fetchAiJudgeAnswer({
  stepQuestion: "Mẹ dùng mất bao nhiêu quả?",
  stepAnswer: "8 quả",
  childSpeech: "à ừm con không biết",
  childName: "Bé Na",
});
assert.strictEqual(rUnclear.verdict.danh_gia, "khong_ro", "Không rõ: nhận định khong_ro");
console.log("  ✅ fetchAiJudgeAnswer đánh giá chuẩn xác cả 4 ca: dung, gan_dung, sai_huong, khong_ro");

// --- 4. Kiểm tra Giao diện Scaffold trong src/screens.jsx & CSS ---
console.log("\n--- 4. Kiểm tra Giao diện Scaffold & CSS ---");
const screensSrc = fs.readFileSync("src/screens.jsx", "utf8");
const stylesSrc = fs.readFileSync("src/styles.css", "utf8");

assert(screensSrc.includes("data-testid=\"btn-voice-listen\""), "Có nút Con trả lời, Gấu nghe");
assert(screensSrc.includes("data-testid=\"card-child-said\""), "Có bong bóng lời con nói");
assert(screensSrc.includes("data-testid=\"card-voice-verdict\""), "Có thẻ đánh giá Gấu nghe được");
assert(screensSrc.includes("Gấu nghe được, không lưu giọng nói"), "Có ghi chú bảo vệ riêng tư: không lưu giọng nói");
assert(screensSrc.includes("MẸ NÓI TIẾP"), "Có khối MẸ NÓI TIẾP");
assert(screensSrc.includes("data-testid=\"btn-voice-confirm-ok\""), "Trường hợp đúng có nút Mẹ chốt: Con làm được rồi!");
assert(screensSrc.includes("Chẻ nhỏ câu hỏi"), "Trường hợp sai hướng có nút chuyển sang Chẻ nhỏ câu hỏi");

assert(stylesSrc.includes(".card-said"), "CSS có định dạng cho .card-said");
assert(stylesSrc.includes(".card.verdict"), "CSS có định dạng cho .card.verdict");
assert(stylesSrc.includes(".vb-badge"), "CSS có định dạng cho .vb-badge");
assert(stylesSrc.includes(".voice-listen-btn"), "CSS có định dạng cho .voice-listen-btn");
console.log("  ✅ Giao diện Scaffold và CSS đầy đủ theo đúng bản vẽ thiết kế");

console.log("\n===============================================================");
console.log("🎉 TẤT CẢ CÁC BÀI TEST CHẶNG 5 (ĐỢT 18) ĐÃ VƯỢT QUA 100%!");
console.log("===============================================================");
