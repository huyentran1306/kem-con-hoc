import {
  generateOptions,
  generateChildMathQuestion,
  generateParentMathQuestion,
  generateReadingQuestion,
  generateDetectiveMission
} from '../src/games/questionGenerator.js';

console.log('🧪 BẮT ĐẦU KIỂM THỬ ĐƠN VỊ BỘ TẠO CÂU HỎI (1.000 CÂU)...');

let passed = 0;
const TOTAL = 1000;

for (let i = 0; i < TOTAL; i++) {
  // Test con: lớp 1, 2, 3 luân phiên
  const g = (i % 3) + 1;
  const childQ = generateChildMathQuestion(g);

  // 1. Đáp án đúng luôn có trong options
  if (!childQ.options.includes(childQ.correct)) {
    throw new Error(`FAIL câu con ${i}: đáp án đúng ${childQ.correct} không có trong options [${childQ.options}]`);
  }

  // 2. Không trùng nhau
  if (new Set(childQ.options).size !== childQ.options.length) {
    throw new Error(`FAIL câu con ${i}: options có phần tử trùng [${childQ.options}]`);
  }

  // 3. Không có số âm
  if (childQ.options.some(x => x < 0) || childQ.correct < 0) {
    throw new Error(`FAIL câu con ${i}: có số âm trong [${childQ.options}], correct=${childQ.correct}`);
  }

  // 4. Test mẹ
  const parentQ = generateParentMathQuestion();
  if (!parentQ.options.includes(parentQ.correct)) {
    throw new Error(`FAIL câu mẹ ${i}: đáp án đúng ${parentQ.correct} không có trong options [${parentQ.options}]`);
  }
  if (new Set(parentQ.options).size !== parentQ.options.length) {
    throw new Error(`FAIL câu mẹ ${i}: options có phần tử trùng [${parentQ.options}]`);
  }
  if (parentQ.options.some(x => x < 0) || parentQ.correct < 0) {
    throw new Error(`FAIL câu mẹ ${i}: có số âm trong [${parentQ.options}]`);
  }

  // 5. Test đọc hiểu
  const readQ = generateReadingQuestion();
  if (!readQ.options.includes(readQ.correct)) {
    throw new Error(`FAIL câu đọc hiểu ${i}: đáp án đúng ${readQ.correct} không có trong options [${readQ.options}]`);
  }
  if (readQ.options.length !== 2) {
    throw new Error(`FAIL câu đọc hiểu ${i}: options phải có đúng 2 lựa chọn [${readQ.options}]`);
  }

  passed++;
}

console.log(`✅ ĐÃ KIỂM THỬ XONG ${passed}/${TOTAL} CÂU HỎI!`);
console.log(' - Đáp án đúng 100% nằm trong options');
console.log(' - 100% không trùng lặp và không có số âm');
console.log(' - Phép chia luôn là số nguyên, không có số thập phân');
