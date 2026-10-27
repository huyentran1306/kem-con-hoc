/**
 * 🎲 BỘ TẠO CÂU HỎI THUẦN CODE - ĐỢT 14 (PROMPT 24)
 * 0 Token AI, an toàn sư phạm, đáp án không âm, chia nguyên, đáp án nhiễu cách 1-3.
 */

// Tiện ích lấy số ngẫu nhiên trong khoảng [min, max]
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Trộn mảng
function shuffle(arr) {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

/**
 * Sinh các đáp án lựa chọn (1 đúng, 2 nhiễu)
 * Quy tắc: nhiễu cách đúng 1 đến 3, không trùng nhau, không âm
 */
export function generateOptions(correctVal, count = 3) {
  const opts = new Set([correctVal]);
  let attempts = 0;
  
  while (opts.size < count && attempts < 50) {
    attempts++;
    const delta = (Math.random() < 0.5 ? 1 : -1) * randInt(1, 3);
    const candidate = correctVal + delta;
    if (candidate >= 0 && candidate !== correctVal) {
      opts.add(candidate);
    }
  }

  // Fallback nếu khó tìm (ví dụ correctVal = 0)
  let extra = 1;
  while (opts.size < count) {
    if (!opts.has(correctVal + extra)) opts.add(correctVal + extra);
    extra++;
  }

  return shuffle(Array.from(opts));
}

/**
 * 1. Sinh câu hỏi toán số học cho CON
 * @param {number|string} grade - 1, 2, 3
 * @param {string} specificSkill - Kỹ năng ưu tiên (vd: 'Bảng nhân 6', 'Cộng trừ có nhớ', ...)
 */
export function generateChildMathQuestion(grade = 3, specificSkill = null) {
  const g = parseInt(String(grade).replace(/\D/g, '') || '3', 10);

  if (g === 1) {
    // Lớp 1: Cộng trừ phạm vi 20
    const isAdd = Math.random() < 0.6;
    if (isAdd) {
      const a = randInt(1, 14);
      const b = randInt(1, 20 - a);
      const ans = a + b;
      return {
        equation: `${a} + ${b} = ?`,
        correct: ans,
        options: generateOptions(ans, 3),
        skill: 'Cộng phạm vi 20',
      };
    } else {
      const a = randInt(4, 20);
      const b = randInt(1, a);
      const ans = a - b;
      return {
        equation: `${a} - ${b} = ?`,
        correct: ans,
        options: generateOptions(ans, 3),
        skill: 'Trừ phạm vi 20',
      };
    }
  }

  if (g === 2) {
    // Lớp 2: Phạm vi 100 hoặc Bảng nhân 2-5
    const type = Math.random() < 0.5 ? 'mul' : 'add_sub';
    if (type === 'mul') {
      const a = randInt(2, 5);
      const b = randInt(1, 9);
      const ans = a * b;
      return {
        equation: `${a} × ${b} = ?`,
        correct: ans,
        options: generateOptions(ans, 3),
        skill: `Bảng nhân ${a}`,
      };
    } else {
      const isAdd = Math.random() < 0.5;
      if (isAdd) {
        const a = randInt(12, 60);
        const b = randInt(5, 100 - a);
        const ans = a + b;
        return {
          equation: `${a} + ${b} = ?`,
          correct: ans,
          options: generateOptions(ans, 3),
          skill: 'Cộng phạm vi 100',
        };
      } else {
        const a = randInt(25, 100);
        const b = randInt(5, a - 5);
        const ans = a - b;
        return {
          equation: `${a} - ${b} = ?`,
          correct: ans,
          options: generateOptions(ans, 3),
          skill: 'Trừ phạm vi 100',
        };
      }
    }
  }

  // Lớp 3 (hoặc cao hơn): Bảng nhân 6-9, bảng chia, hoặc phép tính 2 bước
  const mulMatch = specificSkill ? String(specificSkill).match(/nhân\s*(\d+)/i) : null;
  const targetMul = mulMatch ? parseInt(mulMatch[1], 10) : randInt(6, 9);

  const mode = Math.random();
  if (mode < 0.45) {
    // Bảng nhân 6-9
    const a = targetMul;
    const b = randInt(2, 9);
    const ans = a * b;
    return {
      equation: `${a} × ${b} = ?`,
      correct: ans,
      options: generateOptions(ans, 3),
      skill: `Bảng nhân ${a}`,
    };
  } else if (mode < 0.8) {
    // Bảng chia (chia hết)
    const b = randInt(2, 9);
    const ans = randInt(2, 9);
    const a = b * ans;
    return {
      equation: `${a} : ${b} = ?`,
      correct: ans,
      options: generateOptions(ans, 3),
      skill: `Bảng chia ${b}`,
    };
  } else {
    // 2 bước đơn giản lớp 3: a × b + c hoặc a : b + c
    const b = randInt(2, 6);
    const a = b * randInt(2, 5);
    const c = randInt(3, 15);
    const ans = (a / b) + c;
    return {
      equation: `${a} : ${b} + ${c} = ?`,
      correct: ans,
      options: generateOptions(ans, 3),
      skill: 'Tính giá trị biểu thức 2 bước',
    };
  }
}

/**
 * 2. Sinh câu hỏi toán số học cho MẸ (Cân sức: khó hơn con, 2 phép tính)
 */
export function generateParentMathQuestion() {
  const mode = Math.random();
  if (mode < 0.5) {
    // dạng a : b + c hoặc a : b - c
    const b = randInt(3, 9);
    const q = randInt(4, 9);
    const a = b * q; // a chia hết cho b
    const isPlus = Math.random() < 0.6;
    if (isPlus) {
      const c = randInt(5, 25);
      const ans = q + c;
      return {
        equation: `${a} : ${b} + ${c} = ?`,
        correct: ans,
        options: generateOptions(ans, 3),
        skill: 'Biểu thức mẹ',
      };
    } else {
      const c = randInt(1, Math.max(1, q - 1));
      const ans = q - c;
      return {
        equation: `${a} : ${b} - ${c} = ?`,
        correct: ans,
        options: generateOptions(ans, 3),
        skill: 'Biểu thức mẹ',
      };
    }
  } else {
    // dạng a × b - c hoặc a × b + c
    const a = randInt(4, 9);
    const b = randInt(4, 9);
    const prod = a * b;
    const isPlus = Math.random() < 0.4;
    if (isPlus) {
      const c = randInt(8, 28);
      const ans = prod + c;
      return {
        equation: `${a} × ${b} + ${c} = ?`,
        correct: ans,
        options: generateOptions(ans, 3),
        skill: 'Biểu thức mẹ',
      };
    } else {
      const c = randInt(5, Math.min(25, prod - 2));
      const ans = prod - c;
      return {
        equation: `${a} × ${b} - ${c} = ?`,
        correct: ans,
        options: generateOptions(ans, 3),
        skill: 'Biểu thức mẹ',
      };
    }
  }
}

/**
 * 3. Sinh câu hỏi Đọc hiểu đề (Dành cho trò Leo cây hoặc Đấu trí)
 * Dạng: "Bố hái 20 quả, biếu bà 6 quả. Số nào là số đã dùng / đã cho / còn lại?"
 */
const READING_TEMPLATES = [
  {
    makePrompt: (total, used, item) => `Bố hái được ${total} ${item}, đem biếu bà ${used} ${item}. Số nào là số đã biếu bà?`,
    getAns: (total, used) => used,
    getOther: (total, used) => total,
    item: 'quả cam',
  },
  {
    makePrompt: (total, used, item) => `Mẹ có ${total} ${item}, chia cho hai anh em ${used} ${item}. Số nào là số ban đầu mẹ có?`,
    getAns: (total, used) => total,
    getOther: (total, used) => used,
    item: 'viên kẹo',
  },
  {
    makePrompt: (total, used, item) => `Bạn Nam có ${total} ${item}, tặng bạn ${used} ${item}. Số nào là số ${item} Nam đã tặng bạn?`,
    getAns: (total, used) => used,
    getOther: (total, used) => total,
    item: 'nhãn vở',
  },
  {
    makePrompt: (total, used, item) => `Trong rổ có ${total} ${item}, mẹ dùng hết ${used} ${item}. Số nào là số đã dùng?`,
    getAns: (total, used) => used,
    getOther: (total, used) => total,
    item: 'quả trứng',
  },
  {
    makePrompt: (total, used, item) => `Hộp bút có ${total} ${item}, lấy ra ${used} ${item} để vẽ. Số nào là số ban đầu trong hộp?`,
    getAns: (total, used) => total,
    getOther: (total, used) => used,
    item: 'chiếc bút màu',
  },
];

export function generateReadingQuestion() {
  const tpl = READING_TEMPLATES[randInt(0, READING_TEMPLATES.length - 1)];
  const total = randInt(12, 30);
  const used = randInt(3, total - 4);
  const question = tpl.makePrompt(total, used, tpl.item);
  const correct = tpl.getAns(total, used);
  const other = tpl.getOther(total, used);
  
  // Trò Leo cây: 2 nút đáp án theo bản vẽ
  const options = shuffle([correct, other]);

  return {
    question,
    correct,
    options,
    skill: 'Đọc hiểu đề',
    hintItem: tpl.item,
  };
}

/**
 * 4. Sinh nhiệm vụ Thám tử đồ vật
 * Ví dụ: "Tìm 3 nhóm đồ vật trong nhà, cộng lại đủ 10 cái"
 */
export function generateDetectiveMission(grade = 3) {
  const g = parseInt(String(grade).replace(/\D/g, '') || '3', 10);
  const targetTotal = g === 1 ? randInt(8, 12) : g === 2 ? randInt(10, 15) : randInt(12, 18);
  const groupsCount = 3;

  return {
    targetTotal,
    groupsCount,
    description: `Tìm ${groupsCount} nhóm đồ vật trong nhà, cộng lại đủ ${targetTotal} cái.`,
    exampleItems: ['cây bút', 'cái thìa', 'chiếc kẹp', 'gấu bông', 'cuốn sách', 'nắp chai'],
  };
}
