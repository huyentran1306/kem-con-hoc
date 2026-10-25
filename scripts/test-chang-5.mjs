/**
 * BỘ KIỂM THỬ TỰ ĐỘNG CHẶNG 5 · LƯỚI AN TOÀN CHỐNG HỎNG NGẦM (SAFETY NET)
 * Prompt 13 · Chặng 5
 * 
 * 1. Test 5.1: E2E Playwright runner & fixtures
 * 2. Test 5.2: Client error logging (Worker API + Client catcher + Admin Hạ tầng)
 * 3. Test 5.3: AI Quality Evaluation (30 đề chuẩn + báo cáo + badge Prompt Studio)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runChang5Tests() {
  console.log('\n===============================================================');
  console.log('🛡️ BẮT ĐẦU KIỂM THỬ CHẶNG 5: LƯỚI AN TOÀN CHỐNG HỎNG NGẦM');
  console.log('===============================================================\n');

  // --- MỤC 5.1: TEST E2E PLAYWRIGHT ---
  console.log('--- 5.1 Kiểm thử E2E Playwright Suite ---');
  assert(existsSync(resolve(root, 'e2e/e2e-runner.mjs')), 'Có file runner e2e/e2e-runner.mjs');
  assert(existsSync(resolve(root, 'e2e/fixtures/mockLesson.json')), 'Có fixture e2e/fixtures/mockLesson.json');
  assert(existsSync(resolve(root, 'e2e/fixtures/mockTextError.txt')), 'Có fixture e2e/fixtures/mockTextError.txt');

  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  assert(Boolean(pkg.scripts?.e2e), 'package.json có script e2e');
  assert(pkg.scripts?.predeploy?.includes('npm run e2e'), 'package.json có predeploy chặn deploy nếu e2e fail');

  const mockLesson = JSON.parse(readFileSync(resolve(root, 'e2e/fixtures/mockLesson.json'), 'utf8'));
  assert(mockLesson.cac_bac?.length === 3, 'mockLesson fixture có đủ 3 bậc gợi mở sư phạm');
  assert(Boolean(mockLesson.cac_bac[0]?.goi_y?.muc_1_do_vat), 'mockLesson có gợi ý đồ vật');

  // --- MỤC 5.2: CLIENT ERROR LOGGER ---
  console.log('\n--- 5.2 Kiểm thử Client Error Logger ---');
  assert(existsSync(resolve(root, 'src/clientErrors.js')), 'Có file client module src/clientErrors.js');

  const clientErrSrc = readFileSync(resolve(root, 'src/clientErrors.js'), 'utf8');
  assert(clientErrSrc.includes('initClientErrorLogging'), 'Có hàm initClientErrorLogging');
  assert(clientErrSrc.includes('reportClientError'), 'Có hàm reportClientError');
  assert(clientErrSrc.includes('window.addEventListener(\'error\''), 'Bắt window error');
  assert(clientErrSrc.includes('window.addEventListener(\'unhandledrejection\''), 'Bắt unhandledrejection');
  assert(clientErrSrc.includes('20') && clientErrSrc.includes('phút'), 'Có throttle giới hạn tối đa 20 lỗi/phút');

  const appSrc = readFileSync(resolve(root, 'src/App.jsx'), 'utf8');
  assert(appSrc.includes('initClientErrorLogging'), 'src/App.jsx đã khởi tạo error logging');

  const adminConfigSrc = readFileSync(resolve(root, 'src/AdminConfigTab.jsx'), 'utf8');
  assert(adminConfigSrc.includes('Lỗi phía người dùng'), 'Admin Hạ tầng có bảng theo dõi lỗi người dùng');
  assert(adminConfigSrc.includes('/api/v1/admin/client-errors'), 'Admin Hạ tầng gọi API lấy danh sách lỗi');

  // Kiểm tra route worker client errors
  const workerRoutes = readFileSync(resolve('/Users/pro/Coding/study-en/ai-gateway-worker/src/v1_routes.js'), 'utf8');
  assert(workerRoutes.includes('/api/v1/client-errors'), 'Worker có route POST /api/v1/client-errors');
  assert(workerRoutes.includes('/api/v1/admin/client-errors'), 'Worker có route GET /api/v1/admin/client-errors');

  // --- MỤC 5.3: AI QUALITY EVALUATION ---
  console.log('\n--- 5.3 Kiểm thử Bộ Đánh Giá Chất Lượng AI (ai-eval) ---');
  assert(existsSync(resolve(root, 'ai-eval/de-mau.json')), 'Có file 30 đề mẫu ai-eval/de-mau.json');
  assert(existsSync(resolve(root, 'scripts/ai-eval.mjs')), 'Có script chấm ai-eval scripts/ai-eval.mjs');
  assert(existsSync(resolve(root, 'ai-eval/latest-result.json')), 'Có file tóm tắt ai-eval/latest-result.json');

  const questions = JSON.parse(readFileSync(resolve(root, 'ai-eval/de-mau.json'), 'utf8'));
  assert(questions.length === 30, 'Bộ đề có đúng 30 câu hỏi chuẩn');
  
  const mathWord = questions.filter((q) => q.category.includes('Toán lời văn'));
  const mathX = questions.filter((q) => q.category.includes('Tìm x'));
  const vietnamese = questions.filter((q) => q.subject === 'Tiếng Việt');
  const english = questions.filter((q) => q.subject === 'Tiếng Anh');
  assert(mathWord.length === 12, 'Có 12 câu Toán lời văn');
  assert(mathX.length === 6, 'Có 6 câu Toán tìm x');
  assert(vietnamese.length === 6, 'Có 6 câu Tiếng Việt');
  assert(english.length === 6, 'Có 6 câu Tiếng Anh');

  const latestResult = JSON.parse(readFileSync(resolve(root, 'ai-eval/latest-result.json'), 'utf8'));
  assert(latestResult.totalQuestions === 30, 'Kết quả đánh giá 30 câu');
  assert(latestResult.jsonValidCount === 30, 'Tỷ lệ ra JSON đạt 30/30 (100%)');
  assert(latestResult.allCriteriaPassCount >= 28, 'Tỷ lệ đạt 4 tiêu chí sư phạm >= 28/30');

  const promptStudioSrc = readFileSync(resolve(root, 'src/PromptStudioTab.jsx'), 'utf8');
  assert(promptStudioSrc.includes('ai-eval/latest-result.json'), 'PromptStudio đọc latest-result.json');
  assert(promptStudioSrc.includes('ai-eval-badge'), 'PromptStudio có badge tỷ lệ đạt bên cạnh p3_explain');

  console.log('\n===============================================================');
  console.log(`🏁 TỔNG KẾT CHẶNG 5: ${passed}/${passed + failed} TIÊU CHÍ ĐẠT!`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runChang5Tests();
