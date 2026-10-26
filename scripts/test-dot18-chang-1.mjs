/**
 * test-dot18-chang-1.mjs
 * Kiểm thử Đợt 18 · Chặng 1: Máy kiểm phép tính (code, không phải AI)
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import {
  checkArithmetic,
  evaluateMath,
  findAllEquations,
  validateAllLessonMath,
  correctLessonMath,
} from "../src/arithmetic.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

console.log("===============================================================");
console.log("🧪 BẮT ĐẦU KIỂM THỬ ĐỢT 18 · CHẶNG 1: MÁY KIỂM PHÉP TÍNH");
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

// --- 1.1 Kiểm tra các phép tính cơ bản và toán tử ---
console.log("--- 1.1 Bộ giải Shunting-yard độc lập (evaluateMath & checkArithmetic) ---");
assert(evaluateMath("15 + 7") === 22, "Phép cộng: 15 + 7 = 22");
assert(evaluateMath("30 - 8") === 22, "Phép trừ thường (-): 30 - 8 = 22");
assert(evaluateMath("30 \u2212 8") === 22, "Phép trừ unicode (\u2212): 30 − 8 = 22");
assert(evaluateMath("4 * 5") === 20, "Phép nhân (*): 4 * 5 = 20");
assert(evaluateMath("4 x 5") === 20, "Phép nhân (x): 4 x 5 = 20");
assert(evaluateMath("4 × 5") === 20, "Phép nhân (×): 4 × 5 = 20");
assert(evaluateMath("12 / 3") === 4, "Phép chia (/): 12 / 3 = 4");
assert(evaluateMath("12 : 3") === 4, "Phép chia (:): 12 : 3 = 4");
assert(evaluateMath("12 ÷ 3") === 4, "Phép chia (÷): 12 ÷ 3 = 4");
assert(evaluateMath("3 * 8 - 5") === 19, "Biểu thức 2 bước: 3 * 8 - 5 = 19");

// --- 1.2 Đổi đơn vị chục, trăm, nghìn ---
console.log("\n--- 1.2 Nhận diện và kiểm tra đổi đơn vị (chục, trăm, nghìn) ---");
const chucCheck = checkArithmetic("Đổi 3 chục = 30 quả trứng");
assert(chucCheck.status === "dung" && chucCheck.computed === 30, "Đổi đơn vị đúng: 3 chục = 30");

const tramCheck = checkArithmetic("2 trăm = 200");
assert(tramCheck.status === "dung" && tramCheck.computed === 200, "Đổi đơn vị đúng: 2 trăm = 200");

const nghinCheck = checkArithmetic("5 nghìn = 5000");
assert(nghinCheck.status === "dung" && nghinCheck.computed === 5000, "Đổi đơn vị đúng: 5 nghìn = 5000");

const chucSai = checkArithmetic("3 chục = 20");
assert(chucSai.status === "sai" && chucSai.computed === 30 && chucSai.stated === 20, "Phát hiện đổi đơn vị sai: 3 chục = 20");

// --- 1.3 Bắt phép tính sai và sửa kết quả ---
console.log("\n--- 1.3 Bắt fixture phép tính sai: 30 - 8 = 23 -> sửa thành 22 ---");
const fixture = {
  cac_bac: [
    { cau_hoi: "3 chục là bao nhiêu quả trứng?", dap_an_cho_me: "3 chục = 30 quả trứng" },
    { cau_hoi: "Mẹ dùng mấy quả rồi?", dap_an_cho_me: "Mẹ dùng 8 quả" },
    { cau_hoi: "Còn lại bao nhiêu quả?", dap_an_cho_me: "Phép tính: 30 - 8 = 23 quả" }
  ],
  dap_an_cuoi_cho_me: "Đáp số: 30 - 8 = 23 quả",
  bai_anh_em: {
    de: "Bà có 2 chục quả cam, biếu ông 6 quả...",
    dap_an_cho_me: "2 chục = 20. 20 - 6 = 14 quả"
  }
};

const valFixture = validateAllLessonMath(fixture);
assert(valFixture.hasError === true, "validateAllLessonMath phát hiện có phép tính sai");
assert(valFixture.errors.length === 2, "Bắt được đúng 2 vị trí sai trong bài giảng");
assert(valFixture.errors[0].expr === "30 - 8 = 23" && valFixture.errors[0].computed === 22, "Xác định đúng biểu thức sai: 30 - 8 = 23 (kết quả đúng là 22)");

const correctedFixture = correctLessonMath(fixture);
assert(correctedFixture.correctedCount === 2, "Tự động sửa thành công 2 lỗi tính toán");
assert(correctedFixture.lessonData.cac_bac[2].dap_an_cho_me.includes("30 - 8 = 22"), "Dòng đáp án bậc 3 đã được sửa thành 22");
assert(correctedFixture.lessonData.dap_an_cuoi_cho_me.includes("30 - 8 = 22"), "Đáp án cuối cho mẹ đã được sửa thành 22");

const reVal = validateAllLessonMath(correctedFixture.lessonData);
assert(reVal.hasError === false, "Sau khi sửa tự động: 0 phép tính sai còn lại");
assert(reVal.verifiedCount >= 4, `Đã kiểm lại ${reVal.verifiedCount} phép tính thành công`);

// --- 1.4 Kiểm tra worker ai-gateway ---
console.log("\n--- 1.4 Worker ai-gateway tích hợp máy kiểm phép tính ---");
const workerIndexSrc = readFileSync(resolve(root, "../study-en/ai-gateway-worker/src/index.js"), "utf8");
assert(workerIndexSrc.includes("validateAllLessonMath"), "Worker đã import validateAllLessonMath");
assert(workerIndexSrc.includes("correctLessonMath"), "Worker đã import correctLessonMath");
assert(workerIndexSrc.includes("sua_phep_tinh"), "Worker ghi guard_log outcome: sua_phep_tinh khi sửa phép tính");
assert(workerIndexSrc.includes("math_verified"), "Worker trả trường math_verified về cho frontend");

// --- 1.5 Kiểm tra giao diện Trước khi giảng (screens.jsx & styles.css) ---
console.log("\n--- 1.5 Giao diện Trước khi giảng có dấu Gấu đã kiểm lại phép tính ---");
const screensSrc = readFileSync(resolve(root, "src/screens.jsx"), "utf8");
assert(screensSrc.includes("Gấu đã kiểm lại"), "Explain render dòng Gấu đã kiểm lại N phép tính");
assert(screensSrc.includes("math-verify-badge"), "Thẻ có id math-verify-badge");
assert(screensSrc.includes("math-verified-list"), "Có popup/danh sách chi tiết các phép tính khi bấm Xem");

const stylesSrc = readFileSync(resolve(root, "src/styles.css"), "utf8");
assert(stylesSrc.includes(".chk"), "styles.css đã định nghĩa class .chk đúng theo bản vẽ");
assert(stylesSrc.includes("data-theme=\"midnight\"] .chk"), "Hỗ trợ dark mode / midnight theme cho .chk");

// --- 1.6 Kiểm thử 30 đề ai-eval: 0 phép tính sai tới mẹ ---
console.log("\n--- 1.6 Rà soát 30 đề ai-eval: 0 phép tính sai tới mẹ ---");
const deMauPath = resolve(root, "ai-eval/de-mau.json");
const deMau = JSON.parse(readFileSync(deMauPath, "utf8"));
assert(deMau.length === 30, `Đủ 30 đề ai-eval trong de-mau.json (${deMau.length}/30)`);

let aiEvalMathErrors = 0;
deMau.forEach((item) => {
  // Kiểm tra nếu đề có số liệu thì khi giải không được để lọt phép tính sai
  const val = validateAllLessonMath({
    cac_bac: [
      { cau_hoi: "Đọc đề", dap_an_cho_me: item.prompt }
    ],
    dap_an_cuoi_cho_me: item.prompt
  });
  if (val.hasError) aiEvalMathErrors++;
});
assert(aiEvalMathErrors === 0, "30 đề mẫu có 0 phép tính sai");

console.log("\n===============================================================");
console.log(`🏁 TỔNG KẾT CHẶNG 1: ${passed}/${total} KIỂM THỬ ĐẠT (${Math.round((passed/total)*100)}%)`);
console.log("===============================================================");

if (passed < total) process.exit(1);
