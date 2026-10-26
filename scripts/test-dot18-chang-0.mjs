import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { normalizeAiResponse } from '../../study-en/ai-gateway-worker/src/index.js';
import { extractNumbers, checkAnswerLeak, validateAndGuard, SKILL_SAFE_QUESTIONS } from '../src/guard.js';
import { parseModelJson, looksLikeReadEcho } from '../../study-en/ai-gateway-worker/src/check_work.js';
import { DEFAULT_PROMPTS } from '../src/promptStudio.js';

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (e) {
    console.error(`  ❌ [FAIL] ${name}:`, e.message);
    process.exit(1);
  }
}

console.log('===============================================================');
console.log('🧪 BẮT ĐẦU KIỂM THỬ ĐỢT 18 · CHẶNG 0: SỬA NỀN AI');
console.log('===============================================================');

// -------------------------------------------------------------
// 0.1 Unit test normalizeAiResponse (chuỗi, đối tượng, rỗng/null)
// -------------------------------------------------------------
console.log('\n--- 0.1 Chuẩn hoá đầu ra Workers AI (normalizeAiResponse) ---');

test('Dạng chuỗi JSON chuẩn', () => {
  const input = { response: '{"dang_bai":"toan","cac_bac":[{"cau_hoi":"Buoc 1"}]}' };
  const res = normalizeAiResponse(input);
  assert.strictEqual(typeof res.rawOutput, 'string');
  assert.ok(res.parsed !== null);
  assert.strictEqual(res.parsed.dang_bai, 'toan');
});

test('Dạng chuỗi JSON bọc code fences ```json', () => {
  const input = { response: '```json\n{"dang_bai":"chia_keo","cac_bac":[]}\n```' };
  const res = normalizeAiResponse(input);
  assert.ok(res.parsed !== null);
  assert.strictEqual(res.parsed.dang_bai, 'chia_keo');
});

test('Dạng đối tượng JavaScript (Workers AI đã parse sẵn)', () => {
  const input = { response: { dang_bai: 'toan_do', cac_bac: [{ bac: 1 }] } };
  const res = normalizeAiResponse(input);
  assert.strictEqual(typeof res.rawOutput, 'string');
  assert.ok(res.parsed !== null);
  assert.strictEqual(res.parsed.dang_bai, 'toan_do');
});

test('Dạng rỗng, null hoặc undefined: không bao giờ throw lỗi', () => {
  const r1 = normalizeAiResponse(null);
  assert.strictEqual(r1.rawOutput, '');
  assert.strictEqual(r1.parsed, null);

  const r2 = normalizeAiResponse(undefined);
  assert.strictEqual(r2.rawOutput, '');
  assert.strictEqual(r2.parsed, null);

  const r3 = normalizeAiResponse({ response: '' });
  assert.strictEqual(r3.rawOutput, '');
  assert.strictEqual(r3.parsed, null);

  const r4 = normalizeAiResponse({ response: null });
  assert.strictEqual(r4.rawOutput, '');
  assert.strictEqual(r4.parsed, null);
});

test('Dạng chuỗi có lời dẫn trước JSON', () => {
  const input = { response: 'Đây là bài giải:\n{"dang_bai":"hinh_hoc","cac_bac":[]}' };
  const res = normalizeAiResponse(input);
  assert.ok(res.parsed !== null);
  assert.strictEqual(res.parsed.dang_bai, 'hinh_hoc');
});

// -------------------------------------------------------------
// 0.2 Chấm vở: bộ lọc trùng ví dụ & parse ảnh
// -------------------------------------------------------------
console.log('\n--- 0.2 Chấm vở: bộ lọc trùng ví dụ & phục hồi JSON ---');

test('looksLikeReadEcho: chỉ bắt khi cả đề bài và dòng đều là khuôn rỗng', () => {
  const fakeEcho = {
    de_bai: '<đề bài nếu thấy trong ảnh>',
    cac_dong: [
      { so: 1, noi_dung: '<dòng thứ nhất đúng như con viết>' },
      { so: 2, noi_dung: '<dòng thứ hai đúng như con viết>' }
    ]
  };
  assert.ok(looksLikeReadEcho(fakeEcho), 'Phải nhận diện khuôn mẫu placeholder');
});

test('looksLikeReadEcho: bài làm thật với đề bút KHÔNG bị bắt nhầm', () => {
  const realWork = {
    de_bai: 'Bài 2. Có 3 hộp bút, mỗi hộp 8 cây. Cho bạn 5 cây.',
    cac_dong: [
      { so: 1, noi_dung: 'Số bút có tất cả là: 8 x 3 = 24 (cây)' },
      { so: 2, noi_dung: 'Số bút còn lại là: 24 - 5 = 19 (cây)' },
      { so: 3, noi_dung: 'Đáp số: 19 cây bút' }
    ]
  };
  assert.ok(!looksLikeReadEcho(realWork), 'Bài làm thật tuyệt đối không bị coi là chép');
});

test('parseModelJson: phục hồi được JSON có xuống dòng thật hoặc nháy chưa escape', () => {
  const raw = '{\n  "doc_duoc": true,\n  "de_bai": "Có 4 túi kẹo",\n  "cac_dong": [\n    {"so": 1, "noi_dung": "6 x 4 = 24"}\n  ]\n}';
  const parsed = parseModelJson(raw);
  assert.ok(parsed !== null);
  assert.strictEqual(parsed.doc_duoc, true);
  assert.strictEqual(parsed.cac_dong.length, 1);
});

// -------------------------------------------------------------
// 0.3 Bật p3_explain_v2 trên mọi môi trường
// -------------------------------------------------------------
console.log('\n--- 0.3 Mặc định dùng p3_explain_v2 trên production ---');

test('api.js không còn điều kiện hostname để chọn p3_explain_v2', () => {
  const apiSrc = fs.readFileSync(path.resolve('src/api.js'), 'utf-8');
  assert.ok(!apiSrc.includes("window.location.hostname.includes('preview')"), 'Đã bỏ kiểm tra preview hostname');
  assert.ok(apiSrc.includes("p3_explain_v2"), 'Có chọn p3_explain_v2 làm mặc định');
});

// -------------------------------------------------------------
// 0.4 Bộ chặn sửa đúng bậc, bớt bắt nhầm
// -------------------------------------------------------------
console.log('\n--- 0.4 Bộ chặn sửa đúng bậc, bớt bắt nhầm ---');

test('extractNumbers nhận diện số kèm từ tiếng Việt ("3 chục" -> 30, "1 tá" -> 12)', () => {
  const nums = extractNumbers('Mẹ có 3 chục quả trứng và 1 tá bút chì, đã dùng 8 quả');
  assert.ok(nums.includes(30), 'Nhận diện 30 từ 3 chục');
  assert.ok(nums.includes(3), 'Nhận diện số 3');
  assert.ok(nums.includes(12), 'Nhận diện 12 từ 1 tá');
  assert.ok(nums.includes(8), 'Nhận diện số 8');
});

test('checkAnswerLeak: số có trong đề bài ("3 chục", 30) KHÔNG bị báo rò rỉ', () => {
  const data = {
    cac_bac: [
      { cau_hoi: 'Mẹ có 3 chục quả trứng, tức là bao nhiêu quả nào?', dap_an_cho_me: '30 quả', ky_nang: 'don_vi' },
      { cau_hoi: 'Bây giờ có 30 quả, bớt đi 8 quả thì làm phép tính gì con?', dap_an_cho_me: '30 - 8', ky_nang: 'chon_phep_tinh' },
      { cau_hoi: 'Con tính xem còn lại bao nhiêu quả trứng nào?', dap_an_cho_me: '22 quả', ky_nang: 'tinh_toan' },
    ],
    dap_an_cuoi_cho_me: '22 quả trứng',
  };
  const context = { problem_text: 'Mẹ có 3 chục quả trứng, đã dùng 8 quả. Hỏi mẹ còn bao nhiêu quả trứng?' };
  const res = checkAnswerLeak('p3_explain_v2', data, context);
  assert.strictEqual(res.leaked, false, 'Số 30 từ 3 chục có trong đề bài nên không bị báo rò rỉ');
});

test('checkAnswerLeak: chỉ chặn khi câu hỏi lộ đáp số cuối hoặc kết quả của chính bậc đó', () => {
  const data = {
    cac_bac: [
      { cau_hoi: 'Có phải còn lại 22 quả không con?', dap_an_cho_me: '30 quả', ky_nang: 'doc_hieu_de' },
      { cau_hoi: 'Bước 2', dap_an_cho_me: '30 - 8', ky_nang: 'chon_phep_tinh' },
      { cau_hoi: 'Bước 3', dap_an_cho_me: '22 quả', ky_nang: 'tinh_toan' },
    ],
    dap_an_cuoi_cho_me: '22 quả trứng',
  };
  const context = { problem_text: 'Mẹ có 3 chục quả trứng, dùng 8 quả.' };
  const res = checkAnswerLeak('p3_explain_v2', data, context);
  assert.strictEqual(res.leaked, true, 'Bậc 1 lộ đáp số cuối 22');
});

test('validateAndGuard thay thế bằng câu an toàn theo đúng kỹ năng của bậc', () => {
  const leakedResponse = JSON.stringify({
    dang_bai: 'Toán có lời văn',
    cac_bac: [
      { cau_hoi: 'Có phải làm phép trừ 30 - 8 không con?', dap_an_cho_me: 'Phép trừ', ky_nang: 'chon_phep_tinh' },
      { cau_hoi: 'Con tính tiếp nhé', dap_an_cho_me: '22', ky_nang: 'tinh_toan' },
      { cau_hoi: 'Đáp số', dap_an_cho_me: '22', ky_nang: 'viet_loi_giai' }
    ],
    dap_an_cuoi_cho_me: '22 quả',
  });

  const res = validateAndGuard('p3_explain_v2', leakedResponse, { problem_text: 'Có 3 chục quả trứng, dùng 8 quả.' });
  const parsed = JSON.parse(res.response);
  // Bậc 1 có kỹ năng chon_phep_tinh
  assert.strictEqual(parsed.cac_bac[0].cau_hoi, SKILL_SAFE_QUESTIONS.chon_phep_tinh);
});

// -------------------------------------------------------------
// 0.5 & 0.6 Schema lời khen theo bậc & Khai báo onboarding
// -------------------------------------------------------------
console.log('\n--- 0.5 Lời khen theo từng bậc & 0.6 Onboarding gia đình cũ ---');

test('Schema p3_explain_v2 có quy tắc ky_nang và loi_khen theo từng bậc', () => {
  const tpl = DEFAULT_PROMPTS.p3_explain_v2.template;
  assert.ok(tpl.includes('ky_nang'), 'Prompt template có ky_nang');
  assert.ok(tpl.includes('loi_khen'), 'Prompt template có loi_khen theo bậc');
});

test('App.jsx đợi hydrated trước khi hiển thị Onboarding cho gia đình đã đăng nhập', () => {
  const appSrc = fs.readFileSync(path.resolve('src/App.jsx'), 'utf-8');
  assert.ok(appSrc.includes('!hydrated'), 'Chờ hydrated trước khi xét màn onboarding');
  assert.ok(appSrc.includes('nextState.onboarded = true'), 'Tự động đặt onboarded khi đã có con trên máy chủ');
});

// -------------------------------------------------------------
// 0.7 Gỡ bài phân tích viết sẵn
// -------------------------------------------------------------
console.log('\n--- 0.7 Gỡ bài phân tích viết sẵn ---');

test('Mã nguồn screens.jsx không còn đoạn "### 🔍 1. Chẩn đoán biến động phẩm chất"', () => {
  const screenSrc = fs.readFileSync(path.resolve('src/screens.jsx'), 'utf-8');
  assert.ok(!screenSrc.includes('### 🔍 1. Chẩn đoán biến động phẩm chất'), 'Đã gỡ bỏ bài phân tích viết sẵn');
  assert.ok(!screenSrc.includes("thisTraits['Kiên nhẫn'] || 4"), "Đã gỡ bỏ số mặc định || 4 trong phân tích");
});

console.log('===============================================================');
console.log(`🏁 TỔNG KẾT CHẶNG 0: ${passed}/16 KIỂM THỬ ĐẠT (100% GREEN)`);
console.log('===============================================================');
