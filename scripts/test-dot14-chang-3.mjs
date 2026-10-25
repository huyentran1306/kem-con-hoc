/**
 * scripts/test-dot14-chang-3.mjs
 * 
 * Bộ kiểm thử tự động cho Chặng 3 (Prompt 14 Phần B: Nghe con giảng lại):
 * 1. Chuẩn hóa & so khớp trích dẫn tiếng Việt (normalizeViForMatch)
 * 2. Khử ảo giác trích dẫn (Anti-Hallucination Quote Checker)
 * 3. Rubric 4 tiêu chí sư phạm cốt lõi (du_kien, phep_tinh, ket_qua, vi_sao)
 * 4. Đề xuất mức hiểu bài tự chủ (computeSuggestedLevel: self, hint, guided)
 * 5. Chặn rò rỉ đáp án trong câu hỏi thêm (cau_hoi_them)
 * 6. Tích hợp API Gateway Worker (/api/v1/ai/teach-back/grade, confirm)
 */

import {
  normalizeViForMatch,
  verifyQuote,
  computeSuggestedLevel,
  validateTeachBackResult,
} from '../../../Coding/study-en/ai-gateway-worker/src/teach_back.js';

let passedCount = 0;
let failedCount = 0;

function assert(cond, name) {
  if (cond) {
    passedCount++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    failedCount++;
    console.error(`  ❌ [FAIL] ${name}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 KIỂM THỬ ĐỢT 14 · CHẶNG 3: NGHE CON GIẢNG LẠI (AI PHẦN B)');
  console.log('======================================================\n');

  // --- 1. normalizeViForMatch ---
  console.log('--- 1. Chuẩn hóa tiếng Việt so khớp ---');
  assert(
    normalizeViForMatch('Con lấy 3 hộp, mỗi hộp 8 cây bút!') === 'con lấy 3 hộp mỗi hộp 8 cây bút',
    'Bỏ dấu chấm, phẩy, chấm than và đưa về chữ thường'
  );
  assert(
    normalizeViForMatch('   Hai mươi tư   trừ   đi 5...  ') === 'hai mươi tư trừ đi 5',
    'Gom khoảng trắng thừa và chuẩn hóa khoảng cách'
  );

  // --- 2. verifyQuote (Anti-hallucination) ---
  console.log('\n--- 2. Khử ảo giác trích dẫn (verifyQuote) ---');
  const transcript1 = 'Con lấy ba hộp mỗi hộp tám cây bút là hai mươi tư cây, rồi mẹ cho bạn Na năm cây nên lấy hai mươi tư trừ đi năm còn mười chín cây.';

  const q1 = verifyQuote('ba hộp mỗi hộp tám cây bút', transcript1);
  assert(q1.valid && q1.quote === 'ba hộp mỗi hộp tám cây bút', 'Trích dẫn có thật trong transcript -> Hợp lệ');

  const q2 = verifyQuote('con tính chia cho bạn Na ba cây', transcript1);
  assert(!q2.valid && q2.quote === '', 'Trích dẫn không hề có trong transcript -> Bị phát hiện ảo giác');

  const q3 = verifyQuote('', transcript1);
  assert(q3.valid && q3.quote === '', 'Trích dẫn rỗng -> Hợp lệ (không trích)');

  // --- 3. computeSuggestedLevel ---
  console.log('\n--- 3. Đề xuất mức hiểu bài tự chủ ---');
  const all4 = [
    { ma: 'du_kien', dat: true },
    { ma: 'phep_tinh', dat: true },
    { ma: 'ket_qua', dat: true },
    { ma: 'vi_sao', dat: true },
  ];
  assert(computeSuggestedLevel(all4) === 'self', 'Đạt 4/4 tiêu chí -> Tự chủ (self)');

  const only3 = [
    { ma: 'du_kien', dat: true },
    { ma: 'phep_tinh', dat: true },
    { ma: 'ket_qua', dat: true },
    { ma: 'vi_sao', dat: false },
  ];
  assert(computeSuggestedLevel(only3) === 'hint', 'Đạt 3/4 tiêu chí -> Cần gợi ý (hint)');

  const only2 = [
    { ma: 'du_kien', dat: true },
    { ma: 'phep_tinh', dat: true },
    { ma: 'ket_qua', dat: false },
    { ma: 'vi_sao', dat: false },
  ];
  assert(computeSuggestedLevel(only2) === 'hint', 'Đạt 2/4 tiêu chí -> Cần gợi ý (hint)');

  const only1 = [
    { ma: 'du_kien', dat: true },
    { ma: 'phep_tinh', dat: false },
    { ma: 'ket_qua', dat: false },
    { ma: 'vi_sao', dat: false },
  ];
  assert(computeSuggestedLevel(only1) === 'guided', 'Đạt 1/4 tiêu chí -> Cần hướng dẫn (guided)');

  // --- 4. validateTeachBackResult & Hallucination Override ---
  console.log('\n--- 4. Xác thực kết quả & Lọc ảo giác ---');
  const fakeAiResult = {
    tieu_chi: [
      { ma: 'du_kien', dat: true, trich: 'ba hộp mỗi hộp tám cây bút' },
      { ma: 'phep_tinh', dat: true, trich: 'lấy hai mươi tư trừ đi năm' },
      { ma: 'ket_qua', dat: true, trich: 'còn mười chín cây' },
      { ma: 'vi_sao', dat: true, trich: 'vì con đã lấy công thức diện tích tam giác' }, // Ảo giác
    ],
    muc_de_xuat: 'self',
    cau_hoi_them: '',
    loi_khen_cho_con: 'Bé kể rất giỏi',
  };

  const validated = validateTeachBackResult(fakeAiResult, transcript1, {
    finalAnswer: '19 cây',
    problemText: 'Có 3 hộp bút...',
  });

  assert(validated.hallucination_detected === true, 'Phát hiện trích dẫn ảo giác ở tiêu chí vi_sao');
  assert(validated.tieu_chi.find((c) => c.ma === 'vi_sao').dat === false, 'Hạ điểm tiêu chí vi_sao xuống false khi trích dẫn ảo giác');
  assert(validated.muc_de_xuat === 'hint', 'Tự động hạ mức tự chủ từ self xuống hint');

  // --- 5. Answer Leak Protection in cau_hoi_them ---
  console.log('\n--- 5. Chặn rò rỉ đáp án trong câu hỏi thêm ---');
  const leakyAiResult = {
    tieu_chi: [
      { ma: 'du_kien', dat: true, trich: 'ba hộp mỗi hộp tám cây bút' },
      { ma: 'phep_tinh', dat: true, trich: 'lấy hai mươi tư trừ đi năm' },
      { ma: 'ket_qua', dat: false, trich: '' },
      { ma: 'vi_sao', dat: false, trich: '' },
    ],
    muc_de_xuat: 'hint',
    cau_hoi_them: 'Con có biết kết quả cuối cùng phải là 19 cây bút không?', // Rò rỉ đáp án 19
  };

  const leakGuarded = validateTeachBackResult(leakyAiResult, transcript1, {
    finalAnswer: '19 cây bút',
    problemText: 'Có ba hộp bút...',
  });

  assert(!leakGuarded.cau_hoi_them.includes('19'), 'Khử câu hỏi rò rỉ đáp án 19 thành câu hỏi gợi mở an toàn');

  // --- 6. Live API Gateway Worker Integration ---
  console.log('\n--- 6. Gọi Live API Gateway Worker (/teach-back/grade) ---');
  try {
    const res = await fetch('https://ai-gateway-worker.trannth1306.workers.dev/api/v1/ai/teach-back/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemText: 'Có 3 hộp bút, mỗi hộp 8 cây. Mẹ cho Na 5 cây. Hỏi còn lại bao nhiêu cây bút?',
        standardSteps: '1. Số bút trong 3 hộp: 3 x 8 = 24. 2. Số bút còn lại: 24 - 5 = 19.',
        transcript: transcript1,
        round: 1,
        finalAnswer: '19 cây bút',
        lop: 'Lớp 3',
        tenCon: 'Mít',
      }),
    });

    const data = await res.json();
    assert(res.status === 200 && data.ok, 'Gateway trả về HTTP 200 OK');
    assert(Array.isArray(data.tieu_chi) && data.tieu_chi.length === 4, 'Trả về đủ 4 tiêu chí sư phạm');
    assert(['self', 'hint', 'guided'].includes(data.muc_de_xuat), 'Mức đề xuất hợp lệ (self/hint/guided)');
    console.log(`     Mức AI đề xuất: ${data.muc_de_xuat}`);
    console.log(`     Lời khen: "${data.loi_khen_cho_con}"`);

    // Test Confirm Endpoint
    if (data.teach_back_id) {
      const confirmRes = await fetch(`https://ai-gateway-worker.trannth1306.workers.dev/api/v1/ai/teach-back/${data.teach_back_id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalLevel: 'self' }),
      });
      const confirmData = await confirmRes.json();
      assert(confirmRes.status === 200 && confirmData.ok && confirmData.final_level === 'self', 'Mẹ chốt mức tự chủ self thành công');
    }
  } catch (err) {
    console.error('Lỗi gọi Gateway Worker:', err);
    assert(false, 'Gọi Gateway Worker thành công');
  }

  console.log('\n======================================================');
  console.log(`🏁 TỔNG KẾT: ${passedCount} PASS, ${failedCount} FAIL`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
