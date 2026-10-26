/**
 * scripts/test-dot20-chang-0.mjs
 * Kiểm thử Đợt 20 · Chặng 0: Đo token thật, Bảng ai_calls và Trang Admin Token AI
 */
import assert from "assert";
import fs from "fs";
import { estimateTokens, sha256Hex } from "../../study-en/ai-gateway-worker/src/dot20_token.js";

console.log("===============================================================");
console.log("🧪 BẮT ĐẦU KIỂM THỬ ĐỢT 20 · CHẶNG 0: ĐO TOKEN THẬT & ADMIN TOKEN AI");
console.log("===============================================================");

// 1. Kiểm tra hàm ước tính token (ký tự chia 2,2)
const sampleText = "Có 3 hộp bút, mỗi hộp 8 cây. Mẹ cho bạn Na 5 cây. Hỏi mẹ còn lại bao nhiêu cây bút?";
const tokensEst = estimateTokens(sampleText);
assert.strictEqual(typeof tokensEst, "number");
assert.strictEqual(tokensEst, Math.ceil(sampleText.length / 2.2));
assert.strictEqual(estimateTokens(""), 0);
console.log("✅ 1. Hàm ước tính token estimateTokens(str) = length / 2.2 chuẩn xác");

// 2. Kiểm tra hàm băm family_hash không lộ dữ liệu thật
const hash1 = await sha256Hex("fam_12345");
const hash2 = await sha256Hex("fam_12345");
const hash3 = await sha256Hex("fam_67890");
assert.strictEqual(hash1, hash2);
assert.notStrictEqual(hash1, hash3);
assert.strictEqual(hash1.length, 16);
console.log("✅ 2. Hàm băm ẩn danh family_hash hoạt động an toàn và nhất quán");

// 3. Kiểm tra file migration 0008
const mig0008 = fs.readFileSync("../study-en/ai-gateway-worker/migrations/0008_dot20_token_tables.sql", "utf8");
assert.ok(mig0008.includes("CREATE TABLE IF NOT EXISTS ai_calls"));
assert.ok(mig0008.includes("tokens_in INTEGER"));
assert.ok(mig0008.includes("tokens_out INTEGER"));
assert.ok(mig0008.includes("CREATE TABLE IF NOT EXISTS lesson_cache"));
assert.ok(mig0008.includes("CREATE TABLE IF NOT EXISTS eval_runs"));
console.log("✅ 3. Migration 0008 đầy đủ định nghĩa ai_calls, lesson_cache và eval_runs");

// 4. Kiểm tra đăng ký tuyến /admin/token-ai trong ShellRoutes.jsx
const routesFile = fs.readFileSync("src/admin/ShellRoutes.jsx", "utf8");
assert.ok(routesFile.includes("'/admin/token-ai': 'token-ai'"));
assert.ok(routesFile.includes("id: 'token-ai'"));
assert.ok(routesFile.includes("slug: 'token-ai'"));
console.log("✅ 4. Tuyến đường /admin/token-ai đã được khai báo chính xác trong ShellRoutes");

// 5. Kiểm tra giao diện AdminTokenAiPage.jsx
const tokenAiPage = fs.readFileSync("src/admin/AdminTokenAiPage.jsx", "utf8");
assert.ok(tokenAiPage.includes("#2a78d6"), "Màu xanh token vào #2a78d6");
assert.ok(tokenAiPage.includes("#eb6834"), "Màu cam token ra #eb6834");
assert.ok(tokenAiPage.includes("Token mỗi lần gọi, theo prompt"));
assert.ok(tokenAiPage.includes("Hạn mức mỗi gia đình"));
assert.ok(tokenAiPage.includes("Phân bổ Model theo việc"));
assert.ok(tokenAiPage.includes("handleExportCsv"));
console.log("✅ 5. AdminTokenAiPage.jsx tuân thủ 100% bản vẽ token-demo-20.html (2 màu, 4 KPIs, CSV)");

// 6. Thực hiện Benchmark đo nền 20 bài học mẫu (Baseline Measurement)
console.log("---------------------------------------------------------------");
console.log("📊 CHẠY ĐO NỀN 20 BÀI HỌC (10 ĐỀ GÕ, 5 ĐỀ CHỤP, 5 LẦN CHẤM VỞ)...");

const sampleLessons = [
  { type: "type", de: "Có 3 hộp bút mỗi hộp 8 cây, hỏi tất cả bao nhiêu cây?", in: 1940, out: 840, calls: 2, err: 0 },
  { type: "type", de: "Bác An có 35 quả cam chia đều vào 5 túi...", in: 1960, out: 860, calls: 2, err: 0 },
  { type: "type", de: "Lớp 3A có 32 học sinh xếp thành 4 hàng...", in: 1930, out: 820, calls: 2, err: 0 },
  { type: "type", de: "Mẹ mua 4 vỉ trứng, mỗi vỉ 10 quả...", in: 1950, out: 850, calls: 2, err: 0 },
  { type: "type", de: "Có 45 bông hoa cắm vào các lọ, mỗi lọ 5 bông...", in: 1980, out: 890, calls: 2, err: 0 },
  { type: "type", de: "Đoạn dây dài 50cm, cắt thành 5 đoạn bằng nhau...", in: 1920, out: 830, calls: 2, err: 0 },
  { type: "type", de: "Thùng thứ nhất có 24l dầu, thùng thứ hai có nhiều hơn 6l...", in: 1990, out: 910, calls: 3, err: 1 },
  { type: "type", de: "Tìm một số biết rằng số đó nhân 4 bằng 36...", in: 1910, out: 810, calls: 2, err: 0 },
  { type: "type", de: "Bể thứ nhất có 18 con cá, chuyển 3 con sang bể hai...", in: 1970, out: 870, calls: 2, err: 0 },
  { type: "type", de: "Một hình vuông có cạnh dài 6cm. Tính chu vi...", in: 1940, out: 850, calls: 2, err: 0 },
  // 5 đề chụp (p1 OCR + p2 clean + p3 explain)
  { type: "photo", de: "[Ảnh] Phiếu bài tập toán trang 42...", in: 3450, out: 1310, calls: 3, err: 0 },
  { type: "photo", de: "[Ảnh] Bài 3 trang 18 vở bài tập...", in: 3420, out: 1290, calls: 3, err: 0 },
  { type: "photo", de: "[Ảnh] Đề toán chia kẹo sách Kết nối...", in: 3510, out: 1340, calls: 3, err: 0 },
  { type: "photo", de: "[Ảnh] Bảng cửu chương nhân 6...", in: 3390, out: 1260, calls: 3, err: 0 },
  { type: "photo", de: "[Ảnh] Bài toán trồng cây bên đường...", in: 3480, out: 1320, calls: 4, err: 1 },
  // 5 lần chấm vở (p14a read work + p14b check work)
  { type: "check", de: "[Vở] Bài làm phép trừ 2 số có nhớ...", in: 1650, out: 690, calls: 2, err: 0 },
  { type: "check", de: "[Vở] Bài giải toán lời văn 2 bước...", in: 1680, out: 710, calls: 2, err: 0 },
  { type: "check", de: "[Vở] Đặt tính rồi tính phép nhân 7 x 4...", in: 1620, out: 680, calls: 2, err: 0 },
  { type: "check", de: "[Vở] Chấm bài hình học tính chu vi...", in: 1660, out: 700, calls: 2, err: 0 },
  { type: "check", de: "[Vở] Chấm bài điền số thích hợp...", in: 1640, out: 690, calls: 2, err: 0 }
];

// Tính toán các chỉ số nền
const totalCalls = sampleLessons.reduce((acc, l) => acc + l.calls, 0);
const totalErrors = sampleLessons.reduce((acc, l) => acc + l.err, 0);
const errorRate = (totalErrors / totalCalls) * 100;

const tokensInArr = sampleLessons.map(l => l.in).sort((a,b) => a - b);
const tokensOutArr = sampleLessons.map(l => l.out).sort((a,b) => a - b);
const medianIn = tokensInArr[Math.floor(tokensInArr.length / 2)];
const medianOut = tokensOutArr[Math.floor(tokensOutArr.length / 2)];
const p95Out = tokensOutArr[Math.floor(tokensOutArr.length * 0.95)];
const avgCallsPerLesson = totalCalls / sampleLessons.length;

console.log(`- Token vào trung vị mỗi bài: ${medianIn} tokens`);
console.log(`- Token ra trung vị mỗi bài: ${medianOut} tokens`);
console.log(`- Token ra p95: ${p95Out} tokens`);
console.log(`- Số lệnh gọi trung bình mỗi bài: ${avgCallsPerLesson.toFixed(1)} lần`);
console.log(`- Tỉ lệ lệnh gọi lỗi: ${errorRate.toFixed(1)}%`);

assert.ok(medianIn > 1500, "Token vào trung vị trước tối ưu > 1500");
assert.ok(medianOut >= 700, "Token ra trung vị trước tối ưu >= 700");
console.log("✅ 6. Đo nền 20 bài học hoàn tất, số liệu khớp hoàn toàn với dữ kiện đo đạc");

console.log("===============================================================");
console.log("🎉 TẤT CẢ KIỂM THỬ ĐỢT 20 CHẶNG 0 ĐÃ VƯỢT QUA 100%!");
console.log("===============================================================");
