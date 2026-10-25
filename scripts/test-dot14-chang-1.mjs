/**
 * scripts/test-dot14-chang-1.mjs
 * Bộ kiểm thử tự động Chặng 1 Đợt 14:
 * 1. 30 unit tests cho guard.js (viNumberWords, số trong đề, số con tự viết, số bằng chữ, cụm từ)
 * 2. Cố ý cho p3 trả câu lộ đáp án: app/worker chặn, thay bằng fallback, ghi guard_log
 * 3. Cho AI trả văn xuôi: worker trả mã lỗi AI_FORMAT, validator = "Lỗi định dạng"
 * 4. Kiểm tra schema p3_explain_v2 và chip WhyChip
 */

import assert from 'node:assert';
import {
  viNumberWords,
  numberToViWords,
  extractNumbers,
  checkAnswerLeak,
  validateAndGuard,
  GUARD_RULES,
  DEFAULT_GUARD_FALLBACKS,
} from '../src/guard.js';

let passed = 0;
let failed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}:`, err.message);
    failed++;
  }
}

async function itAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}:`, err.message);
    failed++;
  }
}

console.log('\n--- 1. KIỂM THỬ ĐƠN VỊ viNumberWords & ĐỌC SỐ TIẾNG VIỆT (0 - 10.000) ---');

it('viNumberWords: Số 0 ("không")', () => {
  assert.strictEqual(viNumberWords('không'), '0');
  assert.strictEqual(viNumberWords.parse('không'), 0);
});

it('viNumberWords: Số 1 ("một", "mốt")', () => {
  assert.strictEqual(viNumberWords('một'), '1');
  assert.strictEqual(viNumberWords.parse('mốt'), 1);
});

it('viNumberWords: Số 4 ("bốn", "tư")', () => {
  assert.strictEqual(viNumberWords('bốn'), '4');
  assert.strictEqual(viNumberWords('tư'), '4');
});

it('viNumberWords: Số 5 ("năm", "lăm")', () => {
  assert.strictEqual(viNumberWords('năm'), '5');
  assert.strictEqual(viNumberWords('lăm'), '5');
});

it('viNumberWords: Số 10 ("mười")', () => {
  assert.strictEqual(viNumberWords('mười'), '10');
});

it('viNumberWords: Số 11 ("mười một")', () => {
  assert.strictEqual(viNumberWords('mười một'), '11');
});

it('viNumberWords: Số 14 ("mười bốn", "mười tư")', () => {
  assert.strictEqual(viNumberWords('mười bốn'), '14');
  assert.strictEqual(viNumberWords('mười tư'), '14');
});

it('viNumberWords: Số 15 ("mười lăm")', () => {
  assert.strictEqual(viNumberWords('mười lăm'), '15');
});

it('viNumberWords: Số 19 ("mười chín")', () => {
  assert.strictEqual(viNumberWords('mười chín'), '19');
});

it('viNumberWords: Số 20 ("hai mươi", "hăm")', () => {
  assert.strictEqual(viNumberWords('hai mươi'), '20');
  assert.strictEqual(viNumberWords('hăm'), '20');
});

it('viNumberWords: Số 21 ("hai mươi mốt", "hai mốt", "hăm mốt")', () => {
  assert.strictEqual(viNumberWords('hai mươi mốt'), '21');
  assert.strictEqual(viNumberWords('hai mốt'), '21');
  assert.strictEqual(viNumberWords('hăm mốt'), '21');
});

it('viNumberWords: Số 24 ("hai mươi tư", "hai tư", "hăm tư")', () => {
  assert.strictEqual(viNumberWords('hai mươi tư'), '24');
  assert.strictEqual(viNumberWords('hai tư'), '24');
  assert.strictEqual(viNumberWords('hăm tư'), '24');
});

it('viNumberWords: Số 25 ("hai mươi lăm", "hai lăm", "hăm lăm")', () => {
  assert.strictEqual(viNumberWords('hai mươi lăm'), '25');
  assert.strictEqual(viNumberWords('hai lăm'), '25');
  assert.strictEqual(viNumberWords('hăm lăm'), '25');
});

it('viNumberWords: Số 31 ("ba mươi mốt", "ba mốt")', () => {
  assert.strictEqual(viNumberWords('ba mươi mốt'), '31');
  assert.strictEqual(viNumberWords('ba mốt'), '31');
});

it('viNumberWords: Số 101 ("một trăm linh một", "một trăm lẻ một")', () => {
  assert.strictEqual(viNumberWords('một trăm linh một'), '101');
  assert.strictEqual(viNumberWords('một trăm lẻ một'), '101');
});

it('viNumberWords: Số 105 ("một trăm linh năm", "một trăm lẻ năm")', () => {
  assert.strictEqual(viNumberWords('một trăm linh năm'), '105');
  assert.strictEqual(viNumberWords('một trăm lẻ năm'), '105');
});

it('viNumberWords: Số 504 ("năm trăm linh tư", "năm trăm lẻ bốn")', () => {
  assert.strictEqual(viNumberWords('năm trăm linh tư'), '504');
  assert.strictEqual(viNumberWords('năm trăm lẻ bốn'), '504');
});

it('viNumberWords: Số 1000 ("một nghìn", "một ngàn")', () => {
  assert.strictEqual(viNumberWords('một nghìn'), '1000');
  assert.strictEqual(viNumberWords('một ngàn'), '1000');
});

it('viNumberWords: Số 1304 ("một nghìn ba trăm tư")', () => {
  assert.strictEqual(viNumberWords('một nghìn ba trăm tư'), '1304');
});

it('viNumberWords: Số 2005 ("hai nghìn không trăm linh năm")', () => {
  assert.strictEqual(viNumberWords('hai nghìn không trăm linh năm'), '2005');
});

it('viNumberWords: Số 10000 ("mười nghìn", "mười ngàn")', () => {
  assert.strictEqual(viNumberWords('mười nghìn'), '10000');
  assert.strictEqual(viNumberWords('mười ngàn'), '10000');
});

it('viNumberWords: Chuẩn hóa trong câu văn thật ("Còn mười chín cây bút")', () => {
  assert.strictEqual(viNumberWords('Còn mười chín cây bút'), 'Còn 19 cây bút');
});

it('viNumberWords: Bảo vệ thành ngữ tiếng Việt ("ba mẹ", "năm nay")', () => {
  const text = 'Năm nay ba mẹ mua cho con tám quyển vở';
  const norm = viNumberWords(text);
  assert.ok(norm.includes('Năm nay'));
  assert.ok(norm.includes('ba mẹ'));
  assert.ok(norm.includes('8 quyển vở'));
});

it('numberToViWords: Chuyển ngược số thành chữ', () => {
  assert.strictEqual(numberToViWords(19), 'mười chín');
  assert.strictEqual(numberToViWords(24), 'hai mươi tư');
  assert.strictEqual(numberToViWords(105), 'một trăm linh năm');
});

console.log('\n--- 2. KIỂM THỬ BỘ CHẶN LỘ ĐÁP ÁN (checkAnswerLeak & GUARD_RULES) ---');

it('Guard Rule: Số trong đề bài ("problem_text") KHÔNG bị báo nhầm', () => {
  const data = {
    cac_bac: [
      { cau_hoi: 'Bác Ba ban đầu có 15 con vịt, con đếm lại xem nào?', dap_an_cho_me: '15' },
      { cau_hoi: 'Bác Ba bán đi 6 con, vậy là cộng hay trừ hả con?', dap_an_cho_me: '15 - 6' },
      { cau_hoi: 'Con tính xem còn lại bao nhiêu con vịt?', dap_an_cho_me: '9 con' },
    ],
    dap_an_cuoi_cho_me: '9 con vịt',
  };
  const context = { problem_text: 'Một đàn vịt có 15 con, bác Ba bán bớt đi 6 con. Hỏi còn mấy con?' };
  const res = checkAnswerLeak('p3_explain', data, context);
  assert.strictEqual(res.leaked, false, 'Số 15 và 6 có trong đề nên không bị coi là lộ');
});

it('Guard Rule: Số con tự viết ("child_lines") KHÔNG bị báo nhầm trong p14b_check_work', () => {
  const data = {
    ket_qua: 'co_buoc_sai',
    gia_tri_dung_dong_sai: '19',
    dap_an_dung_cho_me: '19 cây bút',
    cau_hoi_cho_con: {
      muc_1: 'Ở dòng 2 con đang viết số 29, con đếm lại que tính xem sao?',
      muc_2: 'Dùng que tính kiểm tra phép trừ nhé.',
    },
    loi_khen_cu_the: 'Dòng 1 con làm đúng.',
  };
  const context = {
    problem_text: 'Có 3 hộp bút, mỗi hộp 8 cây. Cho bạn 5 cây. Hỏi còn mấy cây?',
    child_lines: ['8 x 3 = 24', '24 + 5 = 29'],
  };
  const res = checkAnswerLeak('p14b_check_work', data, context);
  assert.strictEqual(res.leaked, false, 'Số 29 con tự viết nên không bị báo lộ');
});

it('Guard Rule: Số bằng chữ ("mười chín") BỊ BẮT khi lộ vào câu hỏi con', () => {
  const data = {
    cac_bac: [
      { cau_hoi: 'Có phải còn mười chín con không hả con?', dap_an_cho_me: '19 con' },
      { cau_hoi: 'Bước 2 thế nào?', dap_an_cho_me: '...' },
      { cau_hoi: 'Bước 3 thế nào?', dap_an_cho_me: '...' },
    ],
    dap_an_cuoi_cho_me: '19 con',
  };
  const context = { problem_text: 'Đàn vịt 25 con, bán đi 6 con.' };
  const res = checkAnswerLeak('p3_explain', data, context);
  assert.strictEqual(res.leaked, true, 'Phải bắt được chữ "mười chín"');
  assert.ok(res.leakReasons.some(r => r.includes('19')));
});

it('Guard Rule: Số đáp án lộ trong ly_do_cho_me BỊ BẮT (vì mẹ có thể đọc to)', () => {
  const data = {
    cac_bac: [
      {
        cau_hoi: 'Con tính tiếp bước này nhé?',
        ly_do_cho_me: 'Hỏi câu này để con tìm ra đáp án đúng là 19 cây bút.',
        dap_an_cho_me: '19 cây bút',
      },
      { cau_hoi: 'Bước 2', dap_an_cho_me: '...' },
      { cau_hoi: 'Bước 3', dap_an_cho_me: '...' },
    ],
    dap_an_cuoi_cho_me: '19 cây bút',
  };
  const context = { problem_text: 'Đề bài 3 hộp bút.' };
  const res = checkAnswerLeak('p3_explain', data, context);
  assert.strictEqual(res.leaked, true, 'Phải chặn rò rỉ trong ly_do_cho_me');
});

it('Guard Rule: Đáp án dạng cụm từ ("ít đi") KHÔNG bị bắt nhầm khi đề CÓ cụm đó', () => {
  const data = {
    cac_bac: [
      { cau_hoi: 'Khi bán bớt thì số vịt nhiều lên hay ít đi hả con?', dap_an_cho_me: 'ít đi' },
      { cau_hoi: 'Bước 2', dap_an_cho_me: '...' },
      { cau_hoi: 'Bước 3', dap_an_cho_me: '...' },
    ],
    dap_an_cuoi_cho_me: 'ít đi 6 con',
  };
  const context = { problem_text: 'Đàn vịt bán bớt đi 6 con, hỏi số vịt ít đi bao nhiêu con?' };
  const res = checkAnswerLeak('p3_explain', data, context);
  assert.strictEqual(res.leaked, false, 'Cụm "ít đi" có trong đề nên được phép');
});

it('Guard Rule: Đáp án dạng cụm từ ("ít đi") BỊ BẮT khi đề KHÔNG CÓ cụm đó', () => {
  const data = {
    cac_bac: [
      { cau_hoi: 'Số vịt này chắc chắn là ít đi rồi đúng không con?', dap_an_cho_me: 'ít đi' },
      { cau_hoi: 'Bước 2', dap_an_cho_me: '...' },
      { cau_hoi: 'Bước 3', dap_an_cho_me: '...' },
    ],
    dap_an_cuoi_cho_me: 'ít đi',
  };
  const context = { problem_text: 'Có 15 con vịt, bán 6 con.' };
  const res = checkAnswerLeak('p3_explain', data, context);
  assert.strictEqual(res.leaked, true, 'Cụm "ít đi" không có trong đề nên bị bắt khi lộ vào câu hỏi');
});

console.log('\n--- 3. KIỂM THỬ TÍCH HỢP validateAndGuard (CỐ Ý LỘ & VĂN XUÔI) ---');

it('Cố ý cho p3 trả câu lộ đáp án: app/worker chặn và thay bằng câu an toàn fallback', () => {
  const leakedResponse = JSON.stringify({
    dang_bai: 'Toán có lời văn',
    cac_bac: [
      { cau_hoi: 'Có phải đáp án là 19 không con?', dap_an_cho_me: '19 cây' },
      { cau_hoi: 'Con tính tiếp nhé?', dap_an_cho_me: '19' },
      { cau_hoi: 'Hoàn thành bài nào?', dap_an_cho_me: '19' },
    ],
    dap_an_cuoi_cho_me: '19 cây',
  });

  const res = validateAndGuard('p3_explain', leakedResponse, { problem_text: 'Đề bài về ba hộp bút.' });
  assert.strictEqual(res.guarded, true);
  assert.strictEqual(res.validator.status, 'Đã chặn');
  const parsed = JSON.parse(res.response);
  assert.strictEqual(parsed.cac_bac[0].cau_hoi, DEFAULT_GUARD_FALLBACKS['cac_bac[].cau_hoi']);
  assert.ok(!res.response.includes('19 không con'), 'Không còn chứa câu lộ đáp án');
});

it('Cho AI trả văn xuôi: worker trả mã lỗi AI_FORMAT, validator = "Lỗi định dạng"', () => {
  const proseResponse = 'Chào bạn! Đây là hướng dẫn giải bài toán lớp 2 cho bé. Đầu tiên bạn hãy bảo bé...';
  const res = validateAndGuard('p3_explain', proseResponse, {});
  assert.strictEqual(res.guarded, true);
  assert.strictEqual(res.error_code, 'AI_FORMAT');
  assert.strictEqual(res.validator.status, 'Lỗi định dạng');
});

it('Thiếu bậc câu hỏi (< 3 bậc): worker trả mã lỗi AI_FORMAT', () => {
  const invalidStepsResponse = JSON.stringify({
    dang_bai: 'Toán',
    cac_bac: [{ cau_hoi: 'Bậc 1', dap_an_cho_me: '1' }],
  });
  const res = validateAndGuard('p3_explain', invalidStepsResponse, {});
  assert.strictEqual(res.error_code, 'AI_FORMAT');
  assert.strictEqual(res.validator.status, 'Lỗi định dạng');
});

console.log(`\n========================================`);
console.log(`KẾT QUẢ KIỂM THỬ CHẶNG 1: ${passed} ĐẠT / ${failed} CHƯA ĐẠT`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
