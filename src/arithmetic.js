/**
 * arithmetic.js - Máy kiểm tra phép tính (Prompt 14 & Prompt 18 · Chặng 1)
 * 
 * Kiểm tra các phép tính trong bài làm của học sinh, bài giảng của AI và lời giải chuẩn:
 * - Hỗ trợ các toán tử: +, -, x, ×, *, :, /, ÷, ngoặc đơn ()
 * - Hỗ trợ dấu trừ unicode: − (U+2212), – (U+2013)
 * - Hỗ trợ đổi đơn vị: chục, trăm, nghìn (ví dụ: 3 chục = 30, 2 trăm = 200)
 * - Tự viết bộ phân tích cú pháp (parser Shunting-yard) không dùng eval() nguy hiểm
 * - Bỏ qua các đơn vị đo, danh từ đi kèm: (quả), cây bút, cm, kg...
 * - Tự động sửa phép tính sai trong bài giảng (correctLessonMath)
 */

/**
 * evaluateMath(lExpr)
 * Đánh giá biểu thức toán học thuần tuý bằng thuật toán Shunting-yard (không dùng eval)
 */
export function evaluateMath(lExpr) {
  if (!lExpr || typeof lExpr !== "string") return null;
  let s = lExpr
    .replace(/[\u2212\u2013]/g, "-")
    .replace(/×/g, "*")
    .replace(/x/gi, "*")
    .replace(/÷/g, "/")
    .replace(/:/g, "/");

  const regex = /([\d]+(?:[\,\.][\d]+)?|\+|\-|\*|\/|\(|\))/g;
  let m;
  const tokens = [];
  while ((m = regex.exec(s)) !== null) {
    let t = m[0];
    if (t === "(" || t === ")" || t === "+" || t === "-" || t === "*" || t === "/") {
      tokens.push(t);
    } else {
      if (t.includes(",")) t = t.replace(",", ".");
      const num = Number(t);
      if (isNaN(num)) return null;
      tokens.push(num);
    }
  }

  if (tokens.length < 3) return null;

  const opsList = ["+", "-", "*", "/"];
  for (let i = 0; i < tokens.length - 1; i++) {
    if (opsList.includes(tokens[i]) && opsList.includes(tokens[i + 1])) return null;
  }
  if (opsList.includes(tokens[0]) || opsList.includes(tokens[tokens.length - 1])) return null;

  const output = [];
  const ops = [];
  const prec = { "+": 1, "-": 1, "*": 2, "/": 2 };

  for (const t of tokens) {
    if (typeof t === "number") {
      output.push(t);
    } else if (t === "(") {
      ops.push(t);
    } else if (t === ")") {
      let foundOpen = false;
      while (ops.length > 0) {
        const top = ops.pop();
        if (top === "(") {
          foundOpen = true;
          break;
        }
        output.push(top);
      }
      if (!foundOpen) return null;
    } else if (prec[t]) {
      while (ops.length > 0 && ops[ops.length - 1] !== "(" && prec[ops[ops.length - 1]] >= prec[t]) {
        output.push(ops.pop());
      }
      ops.push(t);
    } else {
      return null;
    }
  }

  while (ops.length > 0) {
    const top = ops.pop();
    if (top === "(" || top === ")") return null;
    output.push(top);
  }

  const stack = [];
  for (const item of output) {
    if (typeof item === "number") {
      stack.push(item);
    } else {
      if (stack.length < 2) return null;
      const b = stack.pop();
      const a = stack.pop();
      if (item === "+") stack.push(a + b);
      else if (item === "-") stack.push(a - b);
      else if (item === "*") stack.push(a * b);
      else if (item === "/") {
        if (b === 0) return null;
        stack.push(a / b);
      }
    }
  }

  if (stack.length !== 1) return null;
  return stack[0];
}

/**
 * parseEquationAt(text, eqIdx)
 * Trích xuất và kiểm tra phép tính tại vị trí dấu = trong chuỗi
 */
export function parseEquationAt(text, eqIdx) {
  let leftRaw = text.slice(0, eqIdx);
  const rightRaw = text.slice(eqIdx + 1);

  // Số ở vế phải (số đầu tiên sau dấu =)
  const rMatch = rightRaw.match(/^\s*([\d]+(?:[\,\.][\d]+)?)/);
  if (!rMatch) return null;
  const stated = parseFloat(rMatch[1].replace(",", "."));

  // 1. Kiểm tra đổi đơn vị ở vế trái (ví dụ: 3 chục, 2 trăm, 1 nghìn)
  const unitM = leftRaw.match(/(\d+)\s*(chục|trăm|nghìn)\s*$/i);
  if (unitM) {
    const qty = parseInt(unitM[1], 10);
    const unit = unitM[2].toLowerCase();
    const mult = unit === "chục" ? 10 : (unit === "trăm" ? 100 : 1000);
    const computed = qty * mult;
    const isCorrect = Math.abs(computed - stated) < 1e-6;
    const expr = `${qty} ${unit} = ${stated}`;
    const correctExpr = `${qty} ${unit} = ${computed}`;
    const rawMatch = text.slice(eqIdx - unitM[0].length, eqIdx + 1 + rMatch[0].length).trim();
    return {
      type: "unit",
      expr,
      correctExpr,
      computed,
      stated,
      isCorrect,
      rawMatch,
    };
  }

  // 2. Kiểm tra biểu thức số học ở vế trái
  // Lược bỏ nhãn văn bản trước phép tính (ví dụ: "Phép tính:", "Bài 2:", "Mẹ còn lại:")
  const cleanedLeft = leftRaw.replace(/^.*[\p{L}]+\s*(?:\d+)?\s*:\s*/u, "");
  const arithM = cleanedLeft.match(/((?:\(?\s*\d+(?:[\,\.][\d]+)?\s*[\+\-\u2212\u2013\*\x\×\:\/\÷]\s*)+[\(\)\d\s\,\.\+\-\u2212\u2013\*\x\×\:\/\÷]*\d+\)?)\s*$/i);
  if (arithM) {
    const exprLeft = arithM[1].trim();
    const val = evaluateMath(exprLeft);
    if (val !== null && !isNaN(val)) {
      const isCorrect = Math.abs(val - stated) < 1e-6;
      const cleanExprLeft = exprLeft.replace(/[\u2212\u2013]/g, "-");
      const expr = `${cleanExprLeft} = ${stated}`;
      const correctExpr = `${cleanExprLeft} = ${val}`;
      return {
        type: "arithmetic",
        expr,
        correctExpr,
        computed: val,
        stated,
        isCorrect,
        rawMatch: text.slice(eqIdx - arithM[0].length, eqIdx + 1 + rMatch[0].length).trim(),
      };
    }
  }

  return null;
}

/**
 * findAllEquations(text)
 * Tìm và kiểm tra mọi phép tính trong một đoạn văn bản
 */
export function findAllEquations(text) {
  if (!text || typeof text !== "string") return [];
  const results = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "=") {
      const p = parseEquationAt(text, i);
      if (p) results.push(p);
    }
  }
  return results;
}

/**
 * checkArithmetic(line)
 * Kiểm tra tính đúng đắn của phép tính trên một dòng đơn lẻ (tương thích đợt 14)
 */
export function checkArithmetic(line) {
  if (!line || typeof line !== "string") {
    return { status: "khong_kiem_duoc", isArithmetic: false, isCorrect: false };
  }
  const eqs = findAllEquations(line);
  if (eqs.length === 0) {
    return { status: "khong_kiem_duoc", isArithmetic: false, isCorrect: false };
  }

  const wrong = eqs.find(e => !e.isCorrect);
  if (wrong) {
    return {
      status: "sai",
      isArithmetic: true,
      isCorrect: false,
      left: wrong.computed,
      right: wrong.stated,
      computed: wrong.computed,
      stated: wrong.stated,
      expression: wrong.expr,
      correction: wrong.correctExpr,
      allEquations: eqs,
    };
  }

  const first = eqs[0];
  return {
    status: "dung",
    isArithmetic: true,
    isCorrect: true,
    left: first.computed,
    right: first.stated,
    computed: first.computed,
    stated: first.stated,
    expression: first.expr,
    allEquations: eqs,
  };
}

/**
 * validateAllLessonMath(lessonData)
 * 
 * Kiểm tra toàn bộ phép tính trong:
 * - cac_bac[].dap_an_cho_me (hoặc steps[].answerForParent / answer)
 * - dap_an_cuoi_cho_me (hoặc answer)
 * - bai_anh_em.dap_an_cho_me (hoặc de nếu có phép tính)
 */
export function validateAllLessonMath(lessonData) {
  if (!lessonData || typeof lessonData !== "object") {
    return { verifiedCount: 0, calculations: [], hasError: false, errors: [], summary: "" };
  }

  const calculations = [];
  const errors = [];

  // 1. Duyệt qua từng bậc
  const steps = Array.isArray(lessonData.cac_bac)
    ? lessonData.cac_bac
    : (Array.isArray(lessonData.steps) ? lessonData.steps : []);

  steps.forEach((step, idx) => {
    const textToCheck = [
      step.dap_an_cho_me,
      step.answerForParent,
      step.answer,
      step.cau_hoi,
      step.question,
    ].filter(Boolean).join(" . ");

    const eqs = findAllEquations(textToCheck);
    eqs.forEach((eq) => {
      const item = {
        ...eq,
        field: `cac_bac[${idx}].dap_an_cho_me`,
        stepIndex: idx + 1,
      };
      calculations.push(item);
      if (!eq.isCorrect) {
        errors.push(item);
      }
    });
  });

  // 2. Kiểm tra dap_an_cuoi_cho_me / answer
  const finalAns = lessonData.dap_an_cuoi_cho_me || lessonData.answer || "";
  if (finalAns && typeof finalAns === "string") {
    const eqs = findAllEquations(finalAns);
    eqs.forEach((eq) => {
      const item = {
        ...eq,
        field: "dap_an_cuoi_cho_me",
        stepIndex: null,
      };
      calculations.push(item);
      if (!eq.isCorrect) {
        errors.push(item);
      }
    });
  }

  // 3. Kiểm tra bài anh em
  const brother = lessonData.bai_anh_em || lessonData.brotherProblem;
  if (brother) {
    const brotherText = typeof brother === "string"
      ? brother
      : [brother.dap_an_cho_me, brother.de, brother.answer].filter(Boolean).join(" . ");
    const eqs = findAllEquations(brotherText);
    eqs.forEach((eq) => {
      const item = {
        ...eq,
        field: "bai_anh_em.dap_an_cho_me",
        stepIndex: null,
      };
      calculations.push(item);
      if (!eq.isCorrect) {
        errors.push(item);
      }
    });
  }

  // Tạo dòng tóm tắt (ví dụ: "3 chục = 30 · 30 − 8 = 22 · đáp số 22 quả")
  const seenExpr = new Set();
  const summaryParts = [];
  calculations.forEach((c) => {
    if (!seenExpr.has(c.expr)) {
      seenExpr.add(c.expr);
      summaryParts.push(c.expr.replace(/-/g, "−"));
    }
  });

  if (finalAns && typeof finalAns === "string") {
    const numMatch = finalAns.match(/\b\d+(?:[\,\.]\d+)?\b/);
    if (numMatch && !summaryParts.some(p => p.includes(numMatch[0]))) {
      summaryParts.push(`đáp số ${numMatch[0]} quả`);
    }
  }

  return {
    verifiedCount: calculations.length,
    calculations,
    hasError: errors.length > 0,
    errors,
    summary: summaryParts.join(" · "),
  };
}

/**
 * correctLessonMath(lessonData)
 * 
 * Tự động sửa lại số tính sai trong bài giảng:
 * - Thay thế phép tính sai bằng kết quả đúng
 * - Trả về bản sao đã sửa đổi và danh sách các thay đổi
 */
export function correctLessonMath(lessonData) {
  if (!lessonData || typeof lessonData !== "object") {
    return { lessonData, correctedCount: 0, changes: [] };
  }

  const validation = validateAllLessonMath(lessonData);
  if (!validation.hasError) {
    return { lessonData, correctedCount: 0, changes: [] };
  }

  const updated = JSON.parse(JSON.stringify(lessonData));
  const changes = [];

  const replaceInString = (str, error) => {
    if (!str || typeof str !== "string") return str;
    if (error.rawMatch && str.includes(error.rawMatch)) {
      return str.replace(error.rawMatch, error.correctExpr);
    }
    if (str.includes(error.expr)) {
      return str.replace(error.expr, error.correctExpr);
    }
    const pattern = new RegExp(`=\\s*${error.stated}\\b`);
    if (pattern.test(str)) {
      return str.replace(pattern, `= ${error.computed}`);
    }
    return str;
  };

  validation.errors.forEach((err) => {
    let beforeVal = "";
    let afterVal = "";

    if (err.field.startsWith("cac_bac[")) {
      const idx = err.stepIndex - 1;
      const target = Array.isArray(updated.cac_bac) ? updated.cac_bac[idx] : (Array.isArray(updated.steps) ? updated.steps[idx] : null);
      if (target) {
        if (target.dap_an_cho_me) {
          beforeVal = target.dap_an_cho_me;
          target.dap_an_cho_me = replaceInString(target.dap_an_cho_me, err);
          afterVal = target.dap_an_cho_me;
        }
        if (target.answerForParent) {
          target.answerForParent = replaceInString(target.answerForParent, err);
        }
        if (target.answer) {
          target.answer = replaceInString(target.answer, err);
        }
      }
    } else if (err.field === "dap_an_cuoi_cho_me") {
      if (updated.dap_an_cuoi_cho_me) {
        beforeVal = updated.dap_an_cuoi_cho_me;
        updated.dap_an_cuoi_cho_me = replaceInString(updated.dap_an_cuoi_cho_me, err);
        afterVal = updated.dap_an_cuoi_cho_me;
      }
      if (updated.answer) {
        updated.answer = replaceInString(updated.answer, err);
      }
    } else if (err.field === "bai_anh_em.dap_an_cho_me") {
      if (typeof updated.bai_anh_em === "object" && updated.bai_anh_em) {
        if (updated.bai_anh_em.dap_an_cho_me) {
          beforeVal = updated.bai_anh_em.dap_an_cho_me;
          updated.bai_anh_em.dap_an_cho_me = replaceInString(updated.bai_anh_em.dap_an_cho_me, err);
          afterVal = updated.bai_anh_em.dap_an_cho_me;
        }
      } else if (typeof updated.brotherProblem === "object" && updated.brotherProblem) {
        if (updated.brotherProblem.dap_an_cho_me) {
          beforeVal = updated.brotherProblem.dap_an_cho_me;
          updated.brotherProblem.dap_an_cho_me = replaceInString(updated.brotherProblem.dap_an_cho_me, err);
          afterVal = updated.brotherProblem.dap_an_cho_me;
        }
      }
    }

    changes.push({
      field: err.field,
      expr: err.expr,
      correction: err.correctExpr,
      computed: err.computed,
      stated: err.stated,
      before: beforeVal,
      after: afterVal,
    });
  });

  return {
    lessonData: updated,
    correctedCount: changes.length,
    changes,
  };
}

/**
 * Đối chiếu kết quả giữa AI và Máy kiểm tra phép tính (Spec 2.5)
 */
export function reconcileWorkCheck({ aiResult, childLines = [] }) {
  if (!aiResult || typeof aiResult !== "object") return aiResult;

  // 1. Kiểm tra từng dòng của con
  const childChecks = childLines.map((line, idx) => {
    const content = typeof line === "object" ? line.noi_dung : line;
    const res = checkArithmetic(content);
    return { lineIndex: idx + 1, ...res };
  });

  // 2. Kiểm tra từng biểu thức trong lời giải chuẩn của AI
  const aiSolutionChecks = (aiResult.loi_giai_chuan || []).map((step, idx) => {
    const res = checkArithmetic(step);
    return { stepIndex: idx + 1, ...res };
  });

  let aiUncertain = 0;
  let overridden = false;
  let reconciled = { ...aiResult };

  // Trường hợp 3: Lời giải của AI có biểu thức sai -> đánh dấu ai_chua_chac
  const hasAiMathError = aiSolutionChecks.some(c => c.status === "sai");
  if (hasAiMathError) {
    aiUncertain = 1;
  }

  // Tìm dòng đầu tiên con tính nhầm toán học
  const firstChildMathError = childChecks.find(c => c.status === "sai");

  // Trường hợp 1: Dòng con tính sai nhưng AI nói đúng hết
  if (firstChildMathError && reconciled.ket_qua === "dung_het") {
    overridden = true;
    reconciled.ket_qua = "co_buoc_sai";
    reconciled.dong_sai_dau_tien = firstChildMathError.lineIndex;
    reconciled.loai_loi = "tinh_nham";
    reconciled.gia_tri_dung_dong_sai = String(firstChildMathError.left);
    reconciled.giai_thich_cho_me = `Máy kiểm tra phát hiện dòng ${firstChildMathError.lineIndex} có phép tính chưa chính xác (${firstChildMathError.expression}).`;
    reconciled.cau_hoi_cho_con = {
      muc_1: `Con tính lại phép tính ở dòng ${firstChildMathError.lineIndex} nhé?`,
      muc_2: "Con dùng que tính hoặc nháp để kiểm tra lại phép tính này nhé.",
    };
  }

  // Trường hợp 2: AI nói sai ở dòng k, nhưng máy kiểm tra dòng k thấy phép tính tự thân đúng hoặc dòng không có phép tính
  if (reconciled.dong_sai_dau_tien) {
    const flaggedCheck = childChecks.find(c => c.lineIndex === reconciled.dong_sai_dau_tien);
    const noOtherMathErrors = !childChecks.some(c => c.status === "sai");

    if (flaggedCheck && (flaggedCheck.status === "dung" || flaggedCheck.status === "khong_kiem_duoc") && noOtherMathErrors) {
      if (reconciled.loai_loi === "chon_phep_tinh") {
        // Hợp lệ, giữ nguyên lỗi logic
      } else {
        overridden = true;
        aiUncertain = 1;
        reconciled.ket_qua = "dung_het";
        reconciled.dong_sai_dau_tien = null;
        reconciled.loai_loi = null;
        reconciled.giai_thich_cho_me = "Máy kiểm tra thấy các phép tính của con đều chính xác.";
      }
    }
  }

  reconciled.machine_json = JSON.stringify({
    childChecks,
    aiSolutionChecks,
    overridden,
  });
  reconciled.ai_uncertain = aiUncertain;

  return reconciled;
}
