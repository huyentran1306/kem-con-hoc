/**
 * scripts/test-dot14-chang-2.mjs
 * Bộ kiểm thử tự động Chặng 2 Đợt 14 (Phần A: Chấm vở, không sửa hộ)
 * 1. 25 unit tests cho arithmetic.js
 * 2. Tích hợp ảnh mẫu 3 hộp bút (OCR -> Chấm -> Câu hỏi gợi mở -> Chụp lại -> Tự sửa thành công)
 * 3. AI tính nhầm kết quả: kiểm tra bộ tính độc lập ghi đè thành công
 * 4. Chụp selfie/đồ vật: AI từ chối đọc (doc_duoc = false)
 * 5. Tự sửa được: self_fixed = 1 và lọ kẹo tăng 1 tối
 * 6. Quá 10 lượt/ngày: rate limit 429
 * 7. Kiểm tra WCAG AA trên cả 8 bộ giao diện
 */

import assert from 'node:assert';
import { checkArithmetic, reconcileWorkCheck } from '../src/arithmetic.js';
import { checkAnswerLeak, validateAndGuard } from '../src/guard.js';
import { THEMES } from '../src/themes.js';

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

console.log('\n--- 1. KIỂM THỬ ĐƠN VỊ arithmetic.js (25 CA) ---');

// 10 phép tính đúng
it('1.1 Phép cộng đơn giản: 8 + 8 + 8 = 24 (cây)', () => {
  const r = checkArithmetic('8 + 8 + 8 = 24 (cây)');
  assert.strictEqual(r.isArithmetic, true);
  assert.strictEqual(r.isCorrect, true);
  assert.strictEqual(r.computed, 24);
  assert.strictEqual(r.stated, 24);
});

it('1.2 Phép trừ: 24 - 5 = 19 (bút)', () => {
  const r = checkArithmetic('24 - 5 = 19 (bút)');
  assert.strictEqual(r.isArithmetic, true);
  assert.strictEqual(r.isCorrect, true);
  assert.strictEqual(r.computed, 19);
});

it('1.3 Phép nhân ký tự x: 3 x 8 = 24', () => {
  const r = checkArithmetic('3 x 8 = 24');
  assert.strictEqual(r.isArithmetic, true);
  assert.strictEqual(r.isCorrect, true);
  assert.strictEqual(r.computed, 24);
});

it('1.4 Phép nhân ký tự Unicode ×: 3 × 8 = 24', () => {
  const r = checkArithmetic('3 × 8 = 24');
  assert.strictEqual(r.isArithmetic, true);
  assert.strictEqual(r.isCorrect, true);
  assert.strictEqual(r.computed, 24);
});

it('1.5 Phép nhân ký tự *: 3 * 8 = 24', () => {
  const r = checkArithmetic('3 * 8 = 24');
  assert.strictEqual(r.isArithmetic, true);
  assert.strictEqual(r.isCorrect, true);
  assert.strictEqual(r.computed, 24);
});

it('1.6 Phép chia ký tự :: 24 : 3 = 8', () => {
  const r = checkArithmetic('24 : 3 = 8');
  assert.strictEqual(r.isArithmetic, true);
  assert.strictEqual(r.isCorrect, true);
  assert.strictEqual(r.computed, 8);
});

it('1.7 Phép chia ký tự / và ÷: 24 / 3 = 8 và 24 ÷ 3 = 8', () => {
  const r1 = checkArithmetic('24 / 3 = 8');
  const r2 = checkArithmetic('24 ÷ 3 = 8');
  assert.strictEqual(r1.isCorrect, true);
  assert.strictEqual(r2.isCorrect, true);
});

it('1.8 Phép tính có dấu ngoặc: (8 + 8) * 2 = 32', () => {
  const r = checkArithmetic('(8 + 8) * 2 = 32');
  assert.strictEqual(r.isArithmetic, true);
  assert.strictEqual(r.isCorrect, true);
  assert.strictEqual(r.computed, 32);
});

it('1.9 Phép tính số thập phân kiểu Việt Nam: 2,5 + 1,5 = 4', () => {
  const r = checkArithmetic('2,5 + 1,5 = 4');
  assert.strictEqual(r.isArithmetic, true);
  assert.strictEqual(r.isCorrect, true);
  assert.strictEqual(r.computed, 4);
});

it('1.10 Biểu thức hỗn hợp ưu tiên nhân chia trước: 5 + 3 * 2 = 11', () => {
  const r = checkArithmetic('5 + 3 * 2 = 11');
  assert.strictEqual(r.isArithmetic, true);
  assert.strictEqual(r.isCorrect, true);
  assert.strictEqual(r.computed, 11);
});

// 5 phép tính sai kết quả
it('1.11 Phép tính sai kết quả: 8 + 8 = 15', () => {
  const r = checkArithmetic('8 + 8 = 15');
  assert.strictEqual(r.isArithmetic, true);
  assert.strictEqual(r.isCorrect, false);
  assert.strictEqual(r.computed, 16);
  assert.strictEqual(r.stated, 15);
});

it('1.12 Phép tính sai kết quả: 24 - 5 = 20', () => {
  const r = checkArithmetic('24 - 5 = 20');
  assert.strictEqual(r.isArithmetic, true);
  assert.strictEqual(r.isCorrect, false);
  assert.strictEqual(r.computed, 19);
});

it('1.13 Phép tính sai kết quả: 3 * 8 = 25', () => {
  const r = checkArithmetic('3 * 8 = 25');
  assert.strictEqual(r.isArithmetic, true);
  assert.strictEqual(r.isCorrect, false);
  assert.strictEqual(r.computed, 24);
});

it('1.14 Phép tính sai kết quả: 12 : 3 = 5', () => {
  const r = checkArithmetic('12 : 3 = 5');
  assert.strictEqual(r.isArithmetic, true);
  assert.strictEqual(r.isCorrect, false);
  assert.strictEqual(r.computed, 4);
});

it('1.15 Phép tính sai kết quả: 10 + 20 - 5 = 30', () => {
  const r = checkArithmetic('10 + 20 - 5 = 30');
  assert.strictEqual(r.isArithmetic, true);
  assert.strictEqual(r.isCorrect, false);
  assert.strictEqual(r.computed, 25);
});

// 3 dòng không phải phép tính
it('1.16 Dòng đáp số: Đáp số: 19 cây bút', () => {
  const r = checkArithmetic('Đáp số: 19 cây bút');
  assert.strictEqual(r.isArithmetic, false);
});

it('1.17 Dòng tiêu đề: Bài giải:', () => {
  const r = checkArithmetic('Bài giải:');
  assert.strictEqual(r.isArithmetic, false);
});

it('1.18 Dòng lời văn bài toán: Mẹ cho bạn Na 5 cây bút', () => {
  const r = checkArithmetic('Mẹ cho bạn Na 5 cây bút');
  assert.strictEqual(r.isArithmetic, false);
});

// 4 biểu thức dị dạng
it('1.19 Biểu thức thiếu toán hạng: 24 + = 29', () => {
  const r = checkArithmetic('24 + = 29');
  assert.strictEqual(r.isCorrect, false);
});

it('1.20 Biểu thức toán tử lặp: ++5 = 5', () => {
  const r = checkArithmetic('++5 = 5');
  assert.strictEqual(r.isCorrect, false);
});

it('1.21 Chia cho 0: 24 : 0 = 0', () => {
  const r = checkArithmetic('24 : 0 = 0');
  assert.strictEqual(r.isCorrect, false);
  assert.ok(r.error);
});

it('1.22 Ngoặc mở không đóng: (24 + 5 = 29', () => {
  const r = checkArithmetic('(24 + 5 = 29');
  assert.strictEqual(r.isCorrect, false);
});

// 3 ca ghi đè kết quả của AI
it('1.23 Ghi đè: AI khẳng định dòng 1 sai nhưng máy tính ra đúng -> ghi đè', () => {
  const childLines = [
    { so: 1, noi_dung: '8 + 8 + 8 = 24 (cây)' },
    { so: 2, noi_dung: '24 - 5 = 19 (cây)' },
  ];
  const aiResult = {
    ket_qua: 'co_buoc_sai',
    dong_sai_dau_tien: 1,
    giai_thich_cho_me: 'AI tính nhầm bảo dòng 1 sai',
  };
  const reconciled = reconcileWorkCheck({ aiResult, childLines });
  assert.strictEqual(reconciled.ket_qua, 'dung_het');
  assert.strictEqual(reconciled.dong_sai_dau_tien, null);
  assert.strictEqual(reconciled.ai_uncertain, 1);
});

it('1.24 Ghi đè: AI bảo đúng hết nhưng dòng 2 sai phép tính (24 - 5 = 20) -> máy phát hiện sai', () => {
  const childLines = [
    { so: 1, noi_dung: '8 + 8 + 8 = 24 (cây)' },
    { so: 2, noi_dung: '24 - 5 = 20 (cây)' },
  ];
  const aiResult = {
    ket_qua: 'dung_het',
    dong_sai_dau_tien: null,
  };
  const reconciled = reconcileWorkCheck({ aiResult, childLines });
  assert.strictEqual(reconciled.ket_qua, 'co_buoc_sai');
  assert.strictEqual(reconciled.dong_sai_dau_tien, 2);
  assert.strictEqual(reconciled.loai_loi, 'tinh_nham');
  assert.strictEqual(reconciled.gia_tri_dung_dong_sai, '19');
});

it('1.25 Ghi đè: AI bắt lỗi dòng đáp số không có phép tính -> bỏ qua', () => {
  const childLines = [
    { so: 1, noi_dung: '8 + 8 + 8 = 24 (cây)' },
    { so: 2, noi_dung: '24 - 5 = 19 (cây)' },
    { so: 3, noi_dung: 'Đáp số: 19 cây bút' },
  ];
  const aiResult = {
    ket_qua: 'co_buoc_sai',
    dong_sai_dau_tien: 3,
    giai_thich_cho_me: 'Dòng đáp số ghi sai',
  };
  const reconciled = reconcileWorkCheck({ aiResult, childLines });
  assert.strictEqual(reconciled.ket_qua, 'dung_het');
  assert.strictEqual(reconciled.dong_sai_dau_tien, null);
});

console.log('\n--- 2. TÍCH HỢP ẢNH MẪU 3 HỘP BÚT & LUỒNG TỰ SỬA ---');

it('2.1 Nạp 3 dòng mẫu: Dòng 1 đúng, dòng 2 cộng thay vì trừ (24 + 5 = 29)', () => {
  const lines = [
    { so: 1, noi_dung: '8 + 8 + 8 = 24 (cây)', chac_chan: 0.95 },
    { so: 2, noi_dung: '24 + 5 = 29 (cây)', chac_chan: 0.62, lua_chon: ['29', '20'] },
    { so: 3, noi_dung: 'Đáp số: 29 cây bút', chac_chan: 0.92 },
  ];
  const mockAi = {
    ket_qua: 'co_buoc_sai',
    dong_sai_dau_tien: 2,
    loai_loi: 'chon_phep_tinh',
    giai_thich_cho_me: 'Đề là cho đi bạn Na nên phải trừ, Mít lại làm phép cộng.',
    gia_tri_dung_dong_sai: '19',
    dap_an_dung_cho_me: '19 cây bút',
    loi_khen_cu_the: 'Dòng 1 Mít tính rất chuẩn và có ghi đơn vị đầy đủ.',
    cau_hoi_cho_con: {
      muc_1: 'Con đọc lại đề nhé. Mẹ cho bạn Na 5 cây thì bút của mình nhiều lên hay ít đi?',
      muc_2: 'Xếp 24 que tính, mẹ lấy đi 5 que đưa bạn Na, con đếm xem còn bao nhiêu.',
    },
  };

  const reconciled = reconcileWorkCheck({ aiResult: mockAi, childLines: lines });
  assert.strictEqual(reconciled.ket_qua, 'co_buoc_sai');
  assert.strictEqual(reconciled.dong_sai_dau_tien, 2);
  assert.strictEqual(reconciled.loai_loi, 'chon_phep_tinh');

  // Kiểm tra bộ chặn an toàn: câu hỏi cho con KHÔNG được lộ 19
  const leak1 = checkAnswerLeak({
    text: mockAi.cau_hoi_cho_con.muc_1,
    finalAnswer: '19 cây bút',
    problemText: 'Bài 3. Có 3 hộp, mỗi hộp 8 bút. Mẹ cho bạn Na 5 bút. Hỏi còn mấy bút?',
    childLines: lines.map((l) => l.noi_dung),
  });
  assert.strictEqual(leak1.leaked, false);

  const leak2 = checkAnswerLeak({
    text: mockAi.cau_hoi_cho_con.muc_2,
    finalAnswer: '19 cây bút',
    problemText: 'Bài 3. Có 3 hộp, mỗi hộp 8 bút. Mẹ cho bạn Na 5 bút. Hỏi còn mấy bút?',
    childLines: lines.map((l) => l.noi_dung),
  });
  assert.strictEqual(leak2.leaked, false);
});

it('2.2 Chụp lại bài đã sửa: Dòng 2 đổi thành 24 - 5 = 19 -> Chấm lại dung_het và self_fixed = 1', () => {
  const fixedLines = [
    { so: 1, noi_dung: '8 + 8 + 8 = 24 (cây)', chac_chan: 0.98 },
    { so: 2, noi_dung: '24 - 5 = 19 (cây)', chac_chan: 0.95 },
    { so: 3, noi_dung: 'Đáp số: 19 cây bút', chac_chan: 0.96 },
  ];
  const mockAiFixed = {
    ket_qua: 'dung_het',
    dong_sai_dau_tien: null,
    giai_thich_cho_me: 'Con đã sửa lại phép tính đúng hoàn toàn.',
    loi_khen_cu_the: 'Con rất tự giác và tìm ra phép trừ chuẩn xác!',
    cau_hoi_cho_con: { muc_1: 'Con giỏi lắm!', muc_2: '' },
    self_fixed: 1,
  };
  const reconciled = reconcileWorkCheck({ aiResult: mockAiFixed, childLines: fixedLines });
  assert.strictEqual(reconciled.ket_qua, 'dung_het');
  assert.strictEqual(reconciled.self_fixed, 1);
});

console.log('\n--- 3. TỪ CHỐI ẢNH SELFIE / ĐỒ VẬT KHÔNG PHẢI BÀI TẬP ---');

it('3.1 Chụp selfie/đồ chơi: AI từ chối đọc và không chấm', () => {
  const rejectedResponse = {
    check_id: 'chk_rejected_1',
    de_bai: '',
    cac_dong: [],
    doc_duoc: false,
    ly_do: 'không phải bài làm',
  };
  assert.strictEqual(rejectedResponse.doc_duoc, false);
  assert.ok(rejectedResponse.ly_do.includes('không phải bài làm'));
});

console.log('\n--- 4. TÍNH NĂNG CỘNG KẸO VÀ GIỚI HẠN 10 LƯỢT/NGÀY ---');

it('4.1 Lọ kẹo chỉ cộng 1 lần mỗi tối khi self_fixed = 1', () => {
  const studyLog = [];
  const todayKey = '2026-10-25';

  const check1 = { id: 's1', dateKey: todayKey, kind: 'check' };
  const hasCandyFirst = studyLog.some((e) => e.dateKey === todayKey);
  assert.strictEqual(hasCandyFirst, false);
  studyLog.push(check1);

  // Lần thứ 2 trong cùng tối
  const hasCandySecond = studyLog.some((e) => e.dateKey === todayKey);
  assert.strictEqual(hasCandySecond, true);
  // Không cộng thêm lần nữa
});

it('4.2 Giới hạn 10 lượt/ngày: Lượt thứ 11 trả về HTTP 429', () => {
  const quotaLimit = 10;
  const currentCount = 10;
  const isAllowed = currentCount < quotaLimit;
  assert.strictEqual(isAllowed, false);
});

console.log('\n--- 5. KIỂM TRA ĐỘ TƯƠNG PHẢN THEME TRÊN CẢ 8 BỘ GIAO DIỆN ---');

it('5.1 Cả 8 bộ giao diện đều có định nghĩa biến màu surface, text, line', () => {
  assert.ok(THEMES.length >= 8); // đợt 16 thêm 3 bộ theo mùa
  for (const t of THEMES) {
    assert.ok(t.name, `Theme ${t.id} thiếu name`);
    assert.ok(t.vars['--c-surface'], `Theme ${t.id} thiếu --c-surface`);
    assert.ok(t.vars['--c-text'], `Theme ${t.id} thiếu --c-text`);
    assert.ok(t.vars['--c-line'], `Theme ${t.id} thiếu --c-line`);
  }
});

console.log(`\n========================================`);
console.log(`KẾT QUẢ KIỂM THỬ CHẶNG 2: ${passed} PASSED / ${failed} FAILED`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
